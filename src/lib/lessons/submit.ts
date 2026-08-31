/**
 * The lesson submission engine — everything the submit API route does apart
 * from HTTP concerns, so integration tests can exercise grading + persistence
 * against a real database directly.
 */
import type { PrismaClient } from "@prisma/client";
import { parseLessonContent, maxScore } from "@/lib/lessons/schema";
import {
  gradeMC,
  gradeTask,
  gradeTaskUrl,
  gradeText,
  type ChartStateLike,
} from "@/lib/lessons/grader";
import { decodeChartState } from "@/lib/dashboard/urlState";

export interface SubmitInput {
  stepId?: string;
  choiceIndex?: number;
  text?: string;
  url?: string;
  state?: { series?: unknown; recessions?: unknown };
}

export interface SubmitOutcome {
  status: number;
  body: Record<string, unknown>;
}

/** Re-decode client chart state through the URL grammar so only catalog-valid
 * series/transform combinations reach the grader. */
export function sanitizeChartState(raw: SubmitInput["state"]): ChartStateLike {
  const series = Array.isArray(raw?.series) ? raw.series : [];
  const tokens = series
    .map((s) => {
      if (typeof s !== "object" || s === null) return null;
      const o = s as Record<string, unknown>;
      if (typeof o.id !== "string" || typeof o.transform !== "string") return null;
      const code = {
        LEVEL: "lvl",
        YOY_GROWTH: "yoy",
        REAL: "real",
        PER_CAPITA: "pc",
        PCT_OF: "pctof",
      }[o.transform];
      if (!code) return null;
      const denom = typeof o.denominatorId === "string" ? `:${o.denominatorId}` : "";
      return `${o.id}:${code}${o.transform === "PCT_OF" ? denom || ":GDP" : ""}`;
    })
    .filter(Boolean)
    .join(",");
  const decoded = decodeChartState(new URLSearchParams({ s: tokens }));
  return { series: decoded.series, recessions: raw?.recessions === true };
}

export async function submitLessonStep(
  prisma: PrismaClient,
  userId: string,
  slug: string,
  input: SubmitInput
): Promise<SubmitOutcome> {
  const lesson = await prisma.lesson.findUnique({ where: { slug } });
  if (!lesson) return { status: 404, body: { error: "Unknown lesson" } };
  const content = parseLessonContent(lesson.content);

  const step = content.steps.find((s) => s.id === input.stepId);
  if (!step) return { status: 400, body: { error: "Unknown step" } };

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId: lesson.id } },
    update: {},
    create: { userId, lessonId: lesson.id, maxScore: maxScore(content) },
  });
  const existing = await prisma.stepSubmission.findUnique({
    where: { progressId_stepId: { progressId: progress.id, stepId: step.id } },
  });

  let response: Record<string, unknown>;
  let record:
    | {
        correct: boolean | null;
        pointsAwarded: number;
        pointsPossible: number;
        tries: number;
        answer?: object;
        textResponse?: string;
      }
    | null = null;

  switch (step.type) {
    case "READ": {
      record = { correct: null, pointsAwarded: 0, pointsPossible: 0, tries: 1 };
      response = { ok: true };
      break;
    }
    case "TASK": {
      const state = sanitizeChartState(input.state);
      const grade = gradeTask(step, state);
      if (grade.ok) {
        record = {
          correct: true,
          pointsAwarded: grade.pointsAwarded,
          pointsPossible: step.points,
          tries: (existing?.tries ?? 0) + 1,
          answer: { state },
        };
      }
      response = { ok: grade.ok, missing: grade.missing, pointsAwarded: grade.pointsAwarded };
      break;
    }
    case "TASK_URL": {
      if (typeof input.url !== "string") {
        return { status: 400, body: { error: "url is required" } };
      }
      const grade = gradeTaskUrl(step, input.url);
      if (grade.ok) {
        record = {
          correct: true,
          pointsAwarded: grade.pointsAwarded,
          pointsPossible: step.points,
          tries: (existing?.tries ?? 0) + 1,
          answer: { url: input.url, state: grade.state ?? undefined },
        };
      }
      response = { ok: grade.ok, missing: grade.missing, pointsAwarded: grade.pointsAwarded };
      break;
    }
    case "QUESTION_MC": {
      const priorTries = existing?.tries ?? 0;
      const alreadyFinal = existing?.correct === true || priorTries >= step.tries;
      if (alreadyFinal) {
        response = {
          correct: existing?.correct ?? false,
          finalized: true,
          triesUsed: priorTries,
          triesLeft: 0,
          pointsAwarded: existing?.pointsAwarded ?? 0,
          explanation: step.explanation,
          alreadyFinalized: true,
        };
        break;
      }
      if (typeof input.choiceIndex !== "number") {
        return { status: 400, body: { error: "choiceIndex is required" } };
      }
      let grade;
      try {
        grade = gradeMC(step, input.choiceIndex, priorTries);
      } catch (err) {
        return {
          status: 400,
          body: { error: err instanceof Error ? err.message : "Bad choice" },
        };
      }
      record = {
        correct: grade.correct,
        pointsAwarded: grade.pointsAwarded,
        pointsPossible: step.points,
        tries: grade.triesUsed,
        answer: { choiceIndex: input.choiceIndex },
      };
      response = {
        correct: grade.correct,
        finalized: grade.finalized,
        triesUsed: grade.triesUsed,
        triesLeft: Math.max(0, step.tries - grade.triesUsed),
        pointsAwarded: grade.pointsAwarded,
        ...(grade.finalized ? { explanation: step.explanation } : {}),
      };
      break;
    }
    case "QUESTION_TEXT": {
      if (typeof input.text !== "string") {
        return { status: 400, body: { error: "text is required" } };
      }
      const grade = gradeText(step, input.text);
      if (grade.accepted) {
        record = {
          correct: null,
          pointsAwarded: grade.pointsAwarded,
          pointsPossible: step.points,
          tries: (existing?.tries ?? 0) + 1,
          textResponse: input.text,
        };
      }
      response = {
        ok: grade.accepted,
        message: grade.message,
        wordCount: grade.wordCount,
        pointsAwarded: grade.pointsAwarded,
      };
      break;
    }
  }

  if (record) {
    await prisma.stepSubmission.upsert({
      where: { progressId_stepId: { progressId: progress.id, stepId: step.id } },
      update: {
        correct: record.correct,
        pointsAwarded: record.pointsAwarded,
        tries: record.tries,
        answer: record.answer,
        textResponse: record.textResponse,
        completedAt: new Date(),
      },
      create: {
        progressId: progress.id,
        stepId: step.id,
        stepType: step.type,
        correct: record.correct,
        pointsAwarded: record.pointsAwarded,
        pointsPossible: record.pointsPossible,
        tries: record.tries,
        answer: record.answer,
        textResponse: record.textResponse,
      },
    });

    const submissions = await prisma.stepSubmission.findMany({
      where: { progressId: progress.id },
    });
    const score = submissions.reduce((sum, s) => sum + s.pointsAwarded, 0);
    const finalizedIds = new Set(
      submissions
        .filter((s) => {
          const st = content.steps.find((cs) => cs.id === s.stepId);
          if (!st) return false;
          if (st.type === "QUESTION_MC") {
            return s.correct === true || s.tries >= st.tries;
          }
          return true;
        })
        .map((s) => s.stepId)
    );
    const allDone = content.steps.every((s) => finalizedIds.has(s.id));
    await prisma.lessonProgress.update({
      where: { id: progress.id },
      data: {
        score,
        maxScore: maxScore(content),
        status: allDone ? "COMPLETED" : "IN_PROGRESS",
        completedAt: allDone ? (progress.completedAt ?? new Date()) : null,
      },
    });
    response.score = score;
    response.completed = allDone;
  }

  return { status: 200, body: response };
}
