/**
 * Pure transformation engine for chart series.
 *
 * All transforms operate on arrays of { date, value } observations (ISO dates,
 * non-null values, ascending order) and are frequency-aware: helper series at a
 * different frequency (e.g. quarterly GDP under a monthly numerator) are
 * forward-filled from the most recent observation at or before each date.
 */
import {
  type SeriesDef,
  dollarScale,
  requireSeriesDef,
} from "@/lib/catalog/series";

export const TRANSFORM_TYPES = [
  "LEVEL",
  "YOY_GROWTH",
  "REAL",
  "PER_CAPITA",
  "PCT_OF",
] as const;

export type TransformType = (typeof TRANSFORM_TYPES)[number];

export interface TransformConfig {
  type: TransformType;
  /** Denominator series for PCT_OF (defaults to GDP). */
  denominatorId?: string;
}

export interface Obs {
  date: string; // YYYY-MM-DD
  value: number;
}

export const TRANSFORM_LABELS: Record<TransformType, string> = {
  LEVEL: "Level",
  YOY_GROWTH: "Growth rate (% vs. year ago)",
  REAL: "Real (inflation-adjusted)",
  PER_CAPITA: "Per capita",
  PCT_OF: "Percent of another series",
};

export const TRANSFORM_SHORT: Record<TransformType, string> = {
  LEVEL: "Level",
  YOY_GROWTH: "YoY %",
  REAL: "Real $",
  PER_CAPITA: "Per capita",
  PCT_OF: "% of",
};

/** The deflator and population series used by REAL and PER_CAPITA. */
export const DEFLATOR_ID = "CPIAUCSL";
export const POPULATION_ID = "POPTHM";
export const DEFAULT_DENOMINATOR_ID = "GDP";

/** An economy-wide dollar aggregate — eligible as PCT_OF numerator/denominator and for PER_CAPITA. */
export function isDollarAggregate(def: SeriesDef): boolean {
  return def.kind === "LEVEL_CURRENCY" && dollarScale(def) >= 1e6;
}

export function transformAllowed(def: SeriesDef, type: TransformType): boolean {
  switch (type) {
    case "LEVEL":
      return true;
    case "YOY_GROWTH":
      return def.canGrowth;
    case "REAL":
      return def.nominal && def.kind === "LEVEL_CURRENCY";
    case "PER_CAPITA":
      return isDollarAggregate(def);
    case "PCT_OF":
      return isDollarAggregate(def);
  }
}

export function allowedTransforms(def: SeriesDef): TransformType[] {
  return TRANSFORM_TYPES.filter((t) => transformAllowed(def, t));
}

const PERIODS_PER_YEAR: Record<SeriesDef["frequency"], number> = {
  DAILY: 261,
  WEEKLY: 52,
  MONTHLY: 12,
  QUARTERLY: 4,
  ANNUAL: 1,
};

/** Binary search: value of the latest observation with date <= target, or null. */
export function valueAtOrBefore(obs: Obs[], date: string): number | null {
  let lo = 0;
  let hi = obs.length - 1;
  let best = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (obs[mid].date <= date) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best >= 0 ? obs[best].value : null;
}

function shiftYear(date: string, years: number): string {
  const y = Number(date.slice(0, 4)) - years;
  return `${String(y).padStart(4, "0")}${date.slice(4)}`;
}

/**
 * Year-over-year percent growth. For monthly/quarterly/annual data the
 * comparison date a year earlier exists exactly on the grid; for weekly/daily
 * data we compare against the nearest observation at or before that date.
 */
export function yoyGrowth(obs: Obs[], def: SeriesDef): Obs[] {
  const byDate = new Map(obs.map((o) => [o.date, o.value]));
  const exactGrid =
    def.frequency === "MONTHLY" ||
    def.frequency === "QUARTERLY" ||
    def.frequency === "ANNUAL";
  const out: Obs[] = [];
  for (const o of obs) {
    const target = shiftYear(o.date, 1);
    let prev: number | null | undefined;
    if (exactGrid) {
      prev = byDate.get(target);
    } else {
      prev = valueAtOrBefore(obs, target);
      // Guard against comparing with a value far older than one year.
      if (prev !== null && obs[0].date > shiftYear(target, 1)) prev = null;
    }
    if (prev !== undefined && prev !== null && prev !== 0) {
      out.push({ date: o.date, value: ((o.value / prev) - 1) * 100 });
    }
  }
  return out;
}

/** Annualization factor for flow series stated at a per-period rate. */
function annualizationFactor(def: SeriesDef): number {
  if (!def.flow || def.seasonal === "SAAR" || def.frequency === "ANNUAL") return 1;
  return PERIODS_PER_YEAR[def.frequency];
}

export interface TransformHelpers {
  /** CPIAUCSL observations (REAL). */
  deflator?: Obs[];
  /** POPTHM observations (PER_CAPITA). */
  population?: Obs[];
  /** Denominator observations + def (PCT_OF). */
  denominator?: { def: SeriesDef; obs: Obs[] };
}

export interface TransformResult {
  obs: Obs[];
  units: string;
  /** Broad unit class used for axis grouping. */
  unitClass: "percent" | "dollars" | "index" | "count" | "ratio";
}

export function unitClassFor(
  def: SeriesDef,
  type: TransformType
): TransformResult["unitClass"] {
  if (type === "YOY_GROWTH" || type === "PCT_OF") return "percent";
  if (type === "REAL" || type === "PER_CAPITA") return "dollars";
  switch (def.kind) {
    case "LEVEL_CURRENCY":
      return "dollars";
    case "LEVEL_COUNT":
      return "count";
    case "INDEX":
      return "index";
    case "RATIO":
    case "BINARY":
      return def.units.toLowerCase().includes("percent") ? "percent" : "ratio";
  }
}

export function transformSeries(
  def: SeriesDef,
  obs: Obs[],
  config: TransformConfig,
  helpers: TransformHelpers = {}
): TransformResult {
  const type = config.type;
  if (!transformAllowed(def, type)) {
    throw new Error(`Transform ${type} is not allowed for series ${def.id}`);
  }
  const unitClass = unitClassFor(def, type);

  switch (type) {
    case "LEVEL":
      return { obs, units: def.units, unitClass };

    case "YOY_GROWTH":
      return {
        obs: yoyGrowth(obs, def),
        units: "Percent change from year ago",
        unitClass,
      };

    case "REAL": {
      const deflator = helpers.deflator;
      if (!deflator || deflator.length === 0) {
        throw new Error(`REAL transform requires ${DEFLATOR_ID} helper data`);
      }
      const base = deflator[deflator.length - 1];
      const baseYear = base.date.slice(0, 4);
      const out: Obs[] = [];
      for (const o of obs) {
        const p = valueAtOrBefore(deflator, o.date);
        if (p !== null && p !== 0) {
          out.push({ date: o.date, value: (o.value * base.value) / p });
        }
      }
      return {
        obs: out,
        units: `${def.units.replace(/^Billions of dollars/, `Billions of ${baseYear} dollars`).replace(/^Millions of dollars/, `Millions of ${baseYear} dollars`).replace(/^Dollars/, `${baseYear} dollars`)}${def.units.includes("dollars") ? "" : ` (${baseYear} dollars)`}`,
        unitClass,
      };
    }

    case "PER_CAPITA": {
      const population = helpers.population;
      if (!population || population.length === 0) {
        throw new Error(`PER_CAPITA transform requires ${POPULATION_ID} helper data`);
      }
      const scale = dollarScale(def) * annualizationFactor(def);
      const out: Obs[] = [];
      for (const o of obs) {
        const pop = valueAtOrBefore(population, o.date);
        if (pop !== null && pop !== 0) {
          // POPTHM is in thousands of persons.
          out.push({ date: o.date, value: (o.value * scale) / (pop * 1e3) });
        }
      }
      return { obs: out, units: "Dollars per person", unitClass };
    }

    case "PCT_OF": {
      const denom = helpers.denominator;
      if (!denom || denom.obs.length === 0) {
        throw new Error("PCT_OF transform requires denominator helper data");
      }
      if (!isDollarAggregate(denom.def)) {
        throw new Error(
          `Series ${denom.def.id} cannot be used as a PCT_OF denominator`
        );
      }
      const numScale = dollarScale(def) * annualizationFactor(def);
      const denScale = dollarScale(denom.def) * annualizationFactor(denom.def);
      const out: Obs[] = [];
      for (const o of obs) {
        const d = valueAtOrBefore(denom.obs, o.date);
        if (d !== null && d !== 0) {
          out.push({
            date: o.date,
            value: ((o.value * numScale) / (d * denScale)) * 100,
          });
        }
      }
      return {
        obs: out,
        units: `Percent of ${denom.def.id === "GDP" ? "GDP" : denom.def.name}`,
        unitClass,
      };
    }
  }
}

/** Ids of helper series a transform config needs beyond the series itself. */
export function helperIdsFor(config: TransformConfig): string[] {
  switch (config.type) {
    case "REAL":
      return [DEFLATOR_ID];
    case "PER_CAPITA":
      return [POPULATION_ID];
    case "PCT_OF":
      return [config.denominatorId ?? DEFAULT_DENOMINATOR_ID];
    default:
      return [];
  }
}

/** Human-readable label for a configured transform, e.g. "% of GDP". */
export function transformLabel(config: TransformConfig): string {
  if (config.type === "PCT_OF") {
    const id = config.denominatorId ?? DEFAULT_DENOMINATOR_ID;
    const name = id === "GDP" ? "GDP" : requireSeriesDef(id).name;
    return `% of ${name}`;
  }
  return TRANSFORM_SHORT[config.type];
}
