import { describe, expect, it } from "vitest";
import {
  lessonSeedSchema,
  validateLessonSeed,
  maxScore,
  type LessonSeed,
} from "@/lib/lessons/schema";
import { transformAllowed } from "@/lib/transforms";
import { requireSeriesDef } from "@/lib/catalog/series";
import { ALL_LESSONS } from "../../prisma/seed/lessons";

describe("every lesson seed validates", () => {
  it("has exactly 13 lessons", () => {
    expect(ALL_LESSONS).toHaveLength(13);
  });

  for (const lesson of ALL_LESSONS) {
    it(`${lesson.slug} parses, has valid targets, and unique ids`, () => {
      const parsed = validateLessonSeed(lesson);
      expect(parsed.slug).toBe(lesson.slug);
      // Every TASK target must be an achievable series/transform combination.
      for (const step of parsed.content.steps) {
        if (step.type === "TASK") {
          for (const t of step.target.series) {
            const def = requireSeriesDef(t.id);
            expect(
              transformAllowed(def, t.transform),
              `${lesson.slug}/${step.id}: ${t.id} ${t.transform}`
            ).toBe(true);
          }
        }
      }
      expect(maxScore(parsed.content)).toBeGreaterThan(0);
    });
  }

  it("covers plan lessons 1–13 exactly once with aligned sort order", () => {
    const plans = ALL_LESSONS.map((l) => l.planLesson).sort((a, b) => a! - b!);
    expect(plans).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    const bySort = [...ALL_LESSONS].sort((a, b) => a.sortOrder - b.sortOrder);
    expect(bySort.map((l) => l.planLesson)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
    ]);
  });

  it("matches the task board's lesson specs", () => {
    const bySlug = new Map(ALL_LESSONS.map((l) => [l.slug, l]));
    const l8 = bySlug.get("inflation")!;
    expect(l8.sortOrder).toBe(80);
    expect(l8.content.sources).toEqual(
      expect.arrayContaining(["CPIAUCSL", "CPILFESL", "PCEPI", "PCEPILFE", "AHETPI", "USREC"])
    );
    const l9 = bySlug.get("monetary-policy")!;
    expect(l9.sortOrder).toBe(90);
    expect(l9.content.sources).toEqual(
      expect.arrayContaining([
        "FEDFUNDS",
        "MORTGAGE30US",
        "BAA",
        "AAA",
        "TERMCBCCALLNS",
        "DD_REAL_FFR",
        "USREC",
      ])
    );
    const l10 = bySlug.get("deficits-debt")!;
    expect(l10.sortOrder).toBe(100);
    expect(l10.content.sources).toEqual(
      expect.arrayContaining(["FGRECPT", "FGEXPND", "GFDEBTN", "GFDEGDQ188S", "FYFSD", "GDP"])
    );
    const l11 = bySlug.get("international-trade")!;
    expect(l11.sortOrder).toBe(110);
    const l12 = bySlug.get("productivity")!;
    expect(l12.sortOrder).toBe(120);
    expect(l12.summary.toLowerCase()).toMatch(/lesson/); // cross-references 1 and 5
    const l13 = bySlug.get("economic-brief")!;
    expect(l13.sortOrder).toBe(130);
    expect(l13.capstone).toBe(true);
    expect(l13.content.steps.some((s) => s.type === "QUESTION_TEXT")).toBe(true);
    expect(l13.content.steps.some((s) => s.type === "TASK_URL")).toBe(true);
  });
});

describe("schema rejections", () => {
  const valid: LessonSeed = ALL_LESSONS[0];

  it("rejects out-of-range correctIndex", () => {
    const bad = structuredClone(valid) as LessonSeed;
    const mc = bad.content.steps.find((s) => s.type === "QUESTION_MC");
    if (mc && mc.type === "QUESTION_MC") {
      mc.correctIndex = mc.options.length;
      expect(lessonSeedSchema.safeParse(bad).success).toBe(false);
    }
  });

  it("rejects duplicate step ids", () => {
    const bad = structuredClone(valid) as LessonSeed;
    bad.content.steps = [...bad.content.steps, structuredClone(bad.content.steps[0])];
    expect(lessonSeedSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects unknown source series", () => {
    const bad = structuredClone(valid) as LessonSeed;
    bad.content.sources = [...bad.content.sources, "NOT_A_SERIES"];
    expect(lessonSeedSchema.safeParse(bad).success).toBe(false);
  });
});
