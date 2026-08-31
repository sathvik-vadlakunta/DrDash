/**
 * The lesson content schema.
 *
 * A lesson is an ordered list of steps. Step types:
 *  - READ          prose the student reads and acknowledges (0 points)
 *  - TASK          build a chart matching a target (series + transforms)
 *  - TASK_URL      paste a saved dashboard link meeting a requirement
 *  - QUESTION_MC   multiple choice, auto-graded with limited tries
 *  - QUESTION_TEXT free-text response, stored for instructor review
 *
 * Seed files are validated against these zod schemas before upserting, so a
 * malformed lesson fails `pnpm db:seed` instead of breaking the UI.
 */
import { z } from "zod";
import { TRANSFORM_TYPES } from "@/lib/transforms";
import { SERIES_BY_ID } from "@/lib/catalog/series";

export const STEP_TYPES = [
  "READ",
  "TASK",
  "TASK_URL",
  "QUESTION_MC",
  "QUESTION_TEXT",
] as const;
export type StepType = (typeof STEP_TYPES)[number];

export const chartTargetSeriesSchema = z.object({
  id: z.string().min(1),
  transform: z.enum(TRANSFORM_TYPES),
  denominatorId: z.string().optional(),
});

export const chartTargetSchema = z.object({
  series: z.array(chartTargetSeriesSchema).min(1),
  /** When true the student's chart must have recession shading on. */
  recessions: z.boolean().optional(),
  /** Default true; set false to require exactly the target series. */
  allowExtraSeries: z.boolean().optional(),
});
export type ChartTarget = z.infer<typeof chartTargetSchema>;

const baseStep = {
  id: z.string().regex(/^[a-z0-9-]+$/, "step ids are kebab-case"),
  title: z.string().min(1),
  body: z.string().min(1),
};

export const readStepSchema = z.object({
  ...baseStep,
  type: z.literal("READ"),
});

export const taskStepSchema = z.object({
  ...baseStep,
  type: z.literal("TASK"),
  points: z.number().int().positive(),
  target: chartTargetSchema,
  hint: z.string().optional(),
});

export const taskUrlStepSchema = z.object({
  ...baseStep,
  type: z.literal("TASK_URL"),
  points: z.number().int().positive(),
  requirement: z.object({
    minSeries: z.number().int().min(1),
    minTransforms: z.number().int().min(0),
  }),
  hint: z.string().optional(),
});

export const mcStepSchema = z
  .object({
    ...baseStep,
    type: z.literal("QUESTION_MC"),
    points: z.number().int().positive(),
    options: z.array(z.string().min(1)).min(2).max(6),
    correctIndex: z.number().int().min(0),
    explanation: z.string().min(1),
    tries: z.number().int().min(1).max(5).default(2),
    /** Series the question draws on (shown as chart shortcuts). */
    sources: z.array(z.string()).optional(),
  })
  .refine((s) => s.correctIndex < s.options.length, {
    message: "correctIndex out of range",
  });

export const textStepSchema = z.object({
  ...baseStep,
  type: z.literal("QUESTION_TEXT"),
  points: z.number().int().positive(),
  minWords: z.number().int().min(1).default(10),
  placeholder: z.string().optional(),
});

export const lessonStepSchema = z.union([
  readStepSchema,
  taskStepSchema,
  taskUrlStepSchema,
  mcStepSchema,
  textStepSchema,
]);

export type ReadStep = z.infer<typeof readStepSchema>;
export type TaskStep = z.infer<typeof taskStepSchema>;
export type TaskUrlStep = z.infer<typeof taskUrlStepSchema>;
export type McStep = z.infer<typeof mcStepSchema>;
export type TextStep = z.infer<typeof textStepSchema>;
export type LessonStep = z.infer<typeof lessonStepSchema>;

export const lessonContentSchema = z
  .object({
    objectives: z.array(z.string().min(1)).min(1),
    /** Catalog series this lesson draws on. */
    sources: z.array(z.string()),
    steps: z.array(lessonStepSchema).min(1),
  })
  .superRefine((content, ctx) => {
    const seen = new Set<string>();
    for (const step of content.steps) {
      if (seen.has(step.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `duplicate step id: ${step.id}`,
        });
      }
      seen.add(step.id);
    }
    for (const id of content.sources) {
      if (!SERIES_BY_ID.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `unknown series in sources: ${id}`,
        });
      }
    }
    for (const step of content.steps) {
      if (step.type === "TASK") {
        for (const s of step.target.series) {
          if (!SERIES_BY_ID.has(s.id)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `step ${step.id}: unknown target series ${s.id}`,
            });
          }
          if (s.denominatorId && !SERIES_BY_ID.has(s.denominatorId)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `step ${step.id}: unknown denominator ${s.denominatorId}`,
            });
          }
        }
      }
    }
  });
export type LessonContent = z.infer<typeof lessonContentSchema>;

export const LESSON_LEVELS = ["INTRO", "INTERMEDIATE", "ADVANCED"] as const;

export const lessonSeedSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  level: z.enum(LESSON_LEVELS),
  estimatedMinutes: z.number().int().positive(),
  sortOrder: z.number().int(),
  capstone: z.boolean().optional(),
  /** Which lesson number in the instructor's lesson plan this covers. */
  planLesson: z.number().int().optional(),
  content: lessonContentSchema,
});
export type LessonSeed = z.infer<typeof lessonSeedSchema>;

export function validateLessonSeed(seed: unknown): LessonSeed {
  return lessonSeedSchema.parse(seed);
}

export function parseLessonContent(content: unknown): LessonContent {
  return lessonContentSchema.parse(content);
}

/** Total points available in a lesson. */
export function maxScore(content: LessonContent): number {
  return content.steps.reduce(
    (sum, s) => sum + ("points" in s ? s.points : 0),
    0
  );
}
