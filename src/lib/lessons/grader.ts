/**
 * Pure grading logic for lesson steps. Used by the submit API route and unit-
 * tested directly. Nothing here touches the database.
 */
import type {
  ChartTarget,
  McStep,
  TaskStep,
  TaskUrlStep,
  TextStep,
} from "@/lib/lessons/schema";
import { DEFAULT_DENOMINATOR_ID } from "@/lib/transforms";
import {
  decodeChartStateFromUrl,
  type ChartSeriesState,
  type ChartState,
} from "@/lib/dashboard/urlState";

// ── multiple choice ────────────────────────────────────────────────────────

export interface McGrade {
  correct: boolean;
  /** true when the submission consumed the final allowed try. */
  finalized: boolean;
  pointsAwarded: number;
  triesUsed: number;
}

export function gradeMC(
  step: McStep,
  choiceIndex: number,
  priorTries: number
): McGrade {
  if (!Number.isInteger(choiceIndex) || choiceIndex < 0 || choiceIndex >= step.options.length) {
    throw new Error("choice out of range");
  }
  if (priorTries >= step.tries) {
    return { correct: false, finalized: true, pointsAwarded: 0, triesUsed: priorTries };
  }
  const triesUsed = priorTries + 1;
  const correct = choiceIndex === step.correctIndex;
  return {
    correct,
    finalized: correct || triesUsed >= step.tries,
    pointsAwarded: correct ? step.points : 0,
    triesUsed,
  };
}

// ── chart tasks ────────────────────────────────────────────────────────────

export interface ChartStateLike {
  series: ChartSeriesState[];
  recessions: boolean;
}

export interface TaskValidation {
  ok: boolean;
  /** Human-readable requirements not yet met. */
  missing: string[];
}

function seriesMatches(target: ChartTarget["series"][number], s: ChartSeriesState) {
  if (s.id !== target.id) return false;
  if (s.transform !== target.transform) return false;
  if (target.transform === "PCT_OF") {
    const want = target.denominatorId ?? DEFAULT_DENOMINATOR_ID;
    const got = s.denominatorId ?? DEFAULT_DENOMINATOR_ID;
    return want === got;
  }
  return true;
}

export function validateChartTarget(
  target: ChartTarget,
  state: ChartStateLike
): TaskValidation {
  const missing: string[] = [];
  for (const t of target.series) {
    if (!state.series.some((s) => seriesMatches(t, s))) {
      const suffix =
        t.transform === "LEVEL"
          ? ""
          : t.transform === "PCT_OF"
            ? ` as a percent of ${t.denominatorId ?? DEFAULT_DENOMINATOR_ID}`
            : ` with the ${t.transform === "YOY_GROWTH" ? "growth-rate" : t.transform === "REAL" ? "real (inflation-adjusted)" : "per-capita"} transform`;
      missing.push(`Add ${t.id}${suffix}.`);
    }
  }
  if (target.recessions && !state.recessions) {
    missing.push("Turn on recession shading.");
  }
  if (target.allowExtraSeries === false) {
    for (const s of state.series) {
      if (!target.series.some((t) => seriesMatches(t, s))) {
        missing.push(`Remove ${s.id} — this task wants only the target series.`);
      }
    }
  }
  return { ok: missing.length === 0, missing };
}

export function gradeTask(
  step: TaskStep,
  state: ChartStateLike
): TaskValidation & { pointsAwarded: number } {
  const v = validateChartTarget(step.target, state);
  return { ...v, pointsAwarded: v.ok ? step.points : 0 };
}

// ── dashboard-URL tasks ────────────────────────────────────────────────────

export interface UrlGrade {
  ok: boolean;
  missing: string[];
  pointsAwarded: number;
  state: ChartState | null;
}

export function gradeTaskUrl(step: TaskUrlStep, url: string): UrlGrade {
  const state = decodeChartStateFromUrl(url);
  if (!state || state.series.length === 0) {
    return {
      ok: false,
      missing: [
        "That link doesn't look like a Dr. Dash dashboard URL. Build your chart in the Chart Tool and use “Copy shareable link”.",
      ],
      pointsAwarded: 0,
      state: null,
    };
  }
  const missing: string[] = [];
  if (state.series.length < step.requirement.minSeries) {
    missing.push(
      `Your dashboard has ${state.series.length} series; this task needs at least ${step.requirement.minSeries}.`
    );
  }
  const transformed = state.series.filter((s) => s.transform !== "LEVEL").length;
  if (transformed < step.requirement.minTransforms) {
    missing.push(
      `Apply at least ${step.requirement.minTransforms} transformation${step.requirement.minTransforms === 1 ? "" : "s"} (growth rate, real, per-capita, or percent-of).`
    );
  }
  return {
    ok: missing.length === 0,
    missing,
    pointsAwarded: missing.length === 0 ? step.points : 0,
    state,
  };
}

// ── free text ──────────────────────────────────────────────────────────────

export interface TextGrade {
  accepted: boolean;
  wordCount: number;
  pointsAwarded: number;
  message?: string;
}

export function gradeText(step: TextStep, text: string): TextGrade {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < step.minWords) {
    return {
      accepted: false,
      wordCount,
      pointsAwarded: 0,
      message: `Write at least ${step.minWords} words (you have ${wordCount}).`,
    };
  }
  // Free-text responses earn full completion points and are stored for
  // instructor review — there is no automatic content grading.
  return { accepted: true, wordCount, pointsAwarded: step.points };
}
