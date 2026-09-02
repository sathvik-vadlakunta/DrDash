import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseLessonContent, maxScore } from "@/lib/lessons/schema";
import {
  LessonRunner,
  type ClientStep,
  type StepStatus,
} from "@/components/lessons/LessonRunner";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=/lessons/${slug}`);

  const lesson = await prisma.lesson.findUnique({ where: { slug } });
  if (!lesson) notFound();
  const content = parseLessonContent(lesson.content);

  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
    include: { submissions: true },
  });

  // Strip answers before anything reaches the client bundle.
  const steps: ClientStep[] = content.steps.map((s) => {
    if (s.type === "QUESTION_MC") {
      const { correctIndex: _correctIndex, explanation: _explanation, ...rest } = s;
      return rest;
    }
    return s;
  });

  const statuses: Record<string, StepStatus> = {};
  for (const sub of progress?.submissions ?? []) {
    const step = content.steps.find((s) => s.id === sub.stepId);
    if (!step) continue;
    const finalized =
      step.type !== "QUESTION_MC" ||
      sub.correct === true ||
      sub.tries >= step.tries;
    statuses[sub.stepId] = {
      done: step.type === "QUESTION_MC" ? finalized : true,
      correct: sub.correct,
      pointsAwarded: sub.pointsAwarded,
      tries: sub.tries,
      finalized,
      explanation:
        step.type === "QUESTION_MC" && finalized ? step.explanation : undefined,
      textResponse: sub.textResponse ?? undefined,
    };
  }

  return (
    <LessonRunner
        slug={lesson.slug}
        title={lesson.title}
        summary={lesson.summary}
        objectives={content.objectives}
        sources={content.sources}
        steps={steps}
        initialStatuses={statuses}
        initialScore={progress?.score ?? 0}
        maxScore={maxScore(content)}
        completed={progress?.status === "COMPLETED"}
      />
  );
}
