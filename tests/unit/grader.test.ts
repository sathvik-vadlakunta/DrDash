import { describe, expect, it } from "vitest";
import {
  gradeMC,
  gradeTask,
  gradeTaskUrl,
  gradeText,
  validateChartTarget,
} from "@/lib/lessons/grader";
import type { McStep, TaskStep, TaskUrlStep, TextStep } from "@/lib/lessons/schema";

const mcStep: McStep = {
  id: "q1",
  type: "QUESTION_MC",
  title: "Q",
  body: "B",
  points: 10,
  options: ["a", "b", "c", "d"],
  correctIndex: 2,
  explanation: "because",
  tries: 2,
};

describe("gradeMC", () => {
  it("awards full points on a correct answer", () => {
    const g = gradeMC(mcStep, 2, 0);
    expect(g).toMatchObject({ correct: true, finalized: true, pointsAwarded: 10, triesUsed: 1 });
  });

  it("allows a second try after a wrong answer, then finalizes", () => {
    const first = gradeMC(mcStep, 0, 0);
    expect(first).toMatchObject({ correct: false, finalized: false, pointsAwarded: 0 });
    const second = gradeMC(mcStep, 2, first.triesUsed);
    expect(second).toMatchObject({ correct: true, finalized: true, pointsAwarded: 10, triesUsed: 2 });
  });

  it("finalizes with zero points when tries run out", () => {
    const second = gradeMC(mcStep, 1, 1);
    expect(second).toMatchObject({ correct: false, finalized: true, pointsAwarded: 0, triesUsed: 2 });
    const after = gradeMC(mcStep, 2, 2);
    expect(after).toMatchObject({ correct: false, finalized: true, pointsAwarded: 0 });
  });

  it("rejects out-of-range choices", () => {
    expect(() => gradeMC(mcStep, 4, 0)).toThrow();
    expect(() => gradeMC(mcStep, -1, 0)).toThrow();
    expect(() => gradeMC(mcStep, 1.5, 0)).toThrow();
  });
});

const taskStep: TaskStep = {
  id: "t1",
  type: "TASK",
  title: "T",
  body: "B",
  points: 10,
  target: {
    series: [
      { id: "CPIAUCSL", transform: "YOY_GROWTH" },
      { id: "CPILFESL", transform: "YOY_GROWTH" },
    ],
    recessions: true,
  },
};

describe("validateChartTarget / gradeTask", () => {
  it("passes when all target series, transforms, and shading match", () => {
    const g = gradeTask(taskStep, {
      series: [
        { id: "CPILFESL", transform: "YOY_GROWTH" },
        { id: "CPIAUCSL", transform: "YOY_GROWTH" },
        { id: "PCEPI", transform: "YOY_GROWTH" }, // extras allowed by default
      ],
      recessions: true,
    });
    expect(g.ok).toBe(true);
    expect(g.pointsAwarded).toBe(10);
  });

  it("fails on missing series, wrong transform, or missing shading", () => {
    const wrongTransform = gradeTask(taskStep, {
      series: [
        { id: "CPIAUCSL", transform: "LEVEL" },
        { id: "CPILFESL", transform: "YOY_GROWTH" },
      ],
      recessions: true,
    });
    expect(wrongTransform.ok).toBe(false);
    expect(wrongTransform.missing.join(" ")).toContain("CPIAUCSL");

    const noShading = gradeTask(taskStep, {
      series: taskStep.target.series,
      recessions: false,
    });
    expect(noShading.ok).toBe(false);
    expect(noShading.missing.join(" ")).toMatch(/recession/i);
  });

  it("matches PCT_OF denominators with GDP defaulting", () => {
    const target = {
      series: [{ id: "FGEXPND", transform: "PCT_OF" as const }],
    };
    expect(
      validateChartTarget(target, {
        series: [{ id: "FGEXPND", transform: "PCT_OF", denominatorId: "GDP" }],
        recessions: false,
      }).ok
    ).toBe(true);
    expect(
      validateChartTarget(target, {
        series: [{ id: "FGEXPND", transform: "PCT_OF", denominatorId: "PCEC" }],
        recessions: false,
      }).ok
    ).toBe(false);
  });

  it("enforces allowExtraSeries: false", () => {
    const strict: TaskStep = {
      ...taskStep,
      target: { ...taskStep.target, recessions: false, allowExtraSeries: false },
    };
    const g = gradeTask(strict, {
      series: [...strict.target.series, { id: "UNRATE", transform: "LEVEL" }],
      recessions: false,
    });
    expect(g.ok).toBe(false);
    expect(g.missing.join(" ")).toContain("UNRATE");
  });
});

const urlStep: TaskUrlStep = {
  id: "u1",
  type: "TASK_URL",
  title: "U",
  body: "B",
  points: 10,
  requirement: { minSeries: 2, minTransforms: 1 },
};

describe("gradeTaskUrl", () => {
  it("accepts a dashboard link meeting the requirement", () => {
    const g = gradeTaskUrl(
      urlStep,
      "http://localhost:3000/dashboard?s=GDPC1:yoy,UNRATE&rec=1"
    );
    expect(g.ok).toBe(true);
    expect(g.pointsAwarded).toBe(10);
    expect(g.state?.series).toHaveLength(2);
  });

  it("rejects links with too few series or transforms", () => {
    expect(gradeTaskUrl(urlStep, "http://x.test/dashboard?s=GDP").ok).toBe(false);
    const noTransform = gradeTaskUrl(urlStep, "http://x.test/dashboard?s=GDP,UNRATE");
    expect(noTransform.ok).toBe(false);
    expect(noTransform.missing.join(" ")).toMatch(/transformation/i);
  });

  it("rejects non-dashboard links", () => {
    const g = gradeTaskUrl(urlStep, "https://www.google.com");
    expect(g.ok).toBe(false);
    expect(g.pointsAwarded).toBe(0);
  });
});

const textStep: TextStep = {
  id: "x1",
  type: "QUESTION_TEXT",
  title: "X",
  body: "B",
  points: 10,
  minWords: 5,
};

describe("gradeText", () => {
  it("accepts responses meeting the word minimum", () => {
    const g = gradeText(textStep, "one two three four five six");
    expect(g).toMatchObject({ accepted: true, pointsAwarded: 10, wordCount: 6 });
  });

  it("rejects too-short responses with a helpful message", () => {
    const g = gradeText(textStep, "too short");
    expect(g.accepted).toBe(false);
    expect(g.pointsAwarded).toBe(0);
    expect(g.message).toContain("5");
  });
});
