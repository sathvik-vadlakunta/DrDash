/**
 * The programmatic "walk through every lesson as a student" QA pass:
 * for each of the 13 lessons, submit every step the way the UI would —
 * READ acknowledgments, TASK chart states matching the target, TASK_URL
 * dashboard links, correct MC answers (after first proving a wrong answer
 * is rejected), and free-text responses — and assert full completion.
 */
import { describe, expect, it, afterAll, beforeAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { parseLessonContent, maxScore, type LessonStep } from "@/lib/lessons/schema";
import { submitLessonStep } from "@/lib/lessons/submit";
import { dashboardHref } from "@/lib/dashboard/urlState";

const prisma = new PrismaClient();
let studentId: string;

beforeAll(async () => {
  const student = await prisma.user.findUnique({
    where: { email: "student1@drdash.test" },
  });
  if (!student) throw new Error("seed the database first");
  studentId = student.id;
  await prisma.lessonProgress.deleteMany({ where: { userId: studentId } });
});

afterAll(() => prisma.$disconnect());

function correctPayload(step: LessonStep): Record<string, unknown> {
  switch (step.type) {
    case "READ":
      return {};
    case "TASK":
      return {
        state: {
          series: step.target.series.map((s) => ({
            id: s.id,
            transform: s.transform,
            ...(s.transform === "PCT_OF"
              ? { denominatorId: s.denominatorId ?? "GDP" }
              : {}),
          })),
          recessions: !!step.target.recessions,
        },
      };
    case "TASK_URL": {
      const url = `http://localhost:3000${dashboardHref({
        series: [
          { id: "GDPC1", transform: "YOY_GROWTH" },
          { id: "UNRATE", transform: "LEVEL" },
        ],
        recessions: true,
      })}`;
      return { url };
    }
    case "QUESTION_MC":
      return { choiceIndex: step.correctIndex };
    case "QUESTION_TEXT":
      return {
        text: "I applied the growth rate transformation to real GDP, and it revealed the cyclical rhythm of expansions and recessions that the ever-rising level completely hides from view. My conclusion is that transformations expose comparisons the raw data cannot.",
      };
  }
}

// Fetched at module load (globalSetup has already pushed + seeded the DB) so
// vitest can register one test per lesson synchronously.
const lessonsForSuite = await prisma.lesson.findMany({
  orderBy: { sortOrder: "asc" },
});

describe("every lesson is completable end-to-end", () => {
  it("has 13 lessons to walk through", () => {
    expect(lessonsForSuite).toHaveLength(13);
  });

  for (const lesson of lessonsForSuite) {
    it(`completes "${lesson.title}" (${lesson.slug}) with full points`, async () => {
      const content = parseLessonContent(lesson.content);
      let testedWrongMc = false;
      let testedWrongTask = false;

      for (const step of content.steps) {
        // Prove wrong answers are rejected before submitting the right ones.
        if (step.type === "QUESTION_MC" && !testedWrongMc) {
          const wrongIndex = (step.correctIndex + 1) % step.options.length;
          const wrong = await submitLessonStep(prisma, studentId, lesson.slug, {
            stepId: step.id,
            choiceIndex: wrongIndex,
          });
          expect(wrong.status).toBe(200);
          expect(wrong.body.correct).toBe(false);
          expect(wrong.body.pointsAwarded).toBe(0);
          testedWrongMc = true;
        }
        if (step.type === "TASK" && !testedWrongTask) {
          const wrong = await submitLessonStep(prisma, studentId, lesson.slug, {
            stepId: step.id,
            state: { series: [{ id: "UMCSENT", transform: "LEVEL" }], recessions: false },
          });
          expect(wrong.status).toBe(200);
          expect(wrong.body.ok).toBe(false);
          testedWrongTask = true;
        }

        const res = await submitLessonStep(prisma, studentId, lesson.slug, {
          stepId: step.id,
          ...correctPayload(step),
        });
        expect(res.status, `${lesson.slug}/${step.id}`).toBe(200);
        if (step.type === "QUESTION_MC") {
          expect(res.body.correct, `${lesson.slug}/${step.id}`).toBe(true);
          expect(res.body.pointsAwarded).toBe(step.points);
        } else if (step.type !== "READ") {
          expect(res.body.ok, `${lesson.slug}/${step.id}`).toBe(true);
        }
      }

      const progress = await prisma.lessonProgress.findUnique({
        where: { userId_lessonId: { userId: studentId, lessonId: lesson.id } },
      });
      expect(progress?.status).toBe("COMPLETED");
      expect(progress?.score).toBe(maxScore(content));
      expect(progress?.maxScore).toBe(maxScore(content));
    });
  }
});

describe("MC try limits", () => {
  it("locks a question after the allowed tries and awards 0", async () => {
    const student2 = await prisma.user.findUnique({
      where: { email: "student2@drdash.test" },
    });
    if (!student2) throw new Error("seed the database first");
    const lesson = await prisma.lesson.findUnique({ where: { slug: "inflation" } });
    const content = parseLessonContent(lesson!.content);
    const mc = content.steps.find((s) => s.type === "QUESTION_MC");
    if (!mc || mc.type !== "QUESTION_MC") throw new Error("no MC step");
    const wrongIndex = (mc.correctIndex + 1) % mc.options.length;

    await prisma.lessonProgress.deleteMany({ where: { userId: student2.id } });
    for (let i = 0; i < mc.tries; i++) {
      const res = await submitLessonStep(prisma, student2.id, "inflation", {
        stepId: mc.id,
        choiceIndex: wrongIndex,
      });
      expect(res.body.correct).toBe(false);
      if (i === mc.tries - 1) {
        expect(res.body.finalized).toBe(true);
        expect(res.body.explanation).toBeTruthy();
      }
    }
    // Further attempts (even correct) change nothing.
    const after = await submitLessonStep(prisma, student2.id, "inflation", {
      stepId: mc.id,
      choiceIndex: mc.correctIndex,
    });
    expect(after.body.alreadyFinalized).toBe(true);
    expect(after.body.pointsAwarded).toBe(0);
  });
});
