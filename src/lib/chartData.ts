/**
 * Server-side chart data assembly: load observations from the database, apply
 * transforms (loading helper series as needed), and compute recession bands.
 */
import { prisma } from "@/lib/db";
import { requireSeriesDef, getSeriesDef } from "@/lib/catalog/series";
import {
  transformSeries,
  transformAllowed,
  DEFLATOR_ID,
  POPULATION_ID,
  DEFAULT_DENOMINATOR_ID,
  type Obs,
  type TransformConfig,
  type TransformHelpers,
  type TransformResult,
} from "@/lib/transforms";

export async function loadObservations(seriesId: string): Promise<Obs[]> {
  const rows = await prisma.observation.findMany({
    where: { seriesId, value: { not: null } },
    orderBy: { date: "asc" },
    select: { date: true, value: true },
  });
  return rows.map((r) => ({
    date: r.date.toISOString().slice(0, 10),
    value: r.value as number,
  }));
}

/** Collapse daily data to monthly means so charts stay light. */
function monthlyMeans(obs: Obs[]): Obs[] {
  const buckets = new Map<string, { sum: number; n: number }>();
  for (const o of obs) {
    const key = `${o.date.slice(0, 7)}-01`;
    const b = buckets.get(key);
    if (b) {
      b.sum += o.value;
      b.n += 1;
    } else {
      buckets.set(key, { sum: o.value, n: 1 });
    }
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, { sum, n }]) => ({ date, value: sum / n }));
}

export interface SeriesDataPayload {
  id: string;
  name: string;
  transform: TransformConfig;
  units: string;
  unitClass: TransformResult["unitClass"];
  frequency: string;
  observations: [string, number][];
}

export async function getTransformedSeries(
  seriesId: string,
  config: TransformConfig,
  range: { from?: string; to?: string } = {}
): Promise<SeriesDataPayload> {
  const def = requireSeriesDef(seriesId);
  if (!transformAllowed(def, config.type)) {
    throw new Error(`Transform ${config.type} not allowed for ${seriesId}`);
  }
  let obs = await loadObservations(seriesId);
  if (def.frequency === "DAILY") obs = monthlyMeans(obs);

  const helpers: TransformHelpers = {};
  if (config.type === "REAL") {
    helpers.deflator = await loadObservations(DEFLATOR_ID);
  } else if (config.type === "PER_CAPITA") {
    helpers.population = await loadObservations(POPULATION_ID);
  } else if (config.type === "PCT_OF") {
    const denomId = config.denominatorId ?? DEFAULT_DENOMINATOR_ID;
    const denomDef = requireSeriesDef(denomId);
    helpers.denominator = { def: denomDef, obs: await loadObservations(denomId) };
  }

  const result = transformSeries(def, obs, config, helpers);
  let out = result.obs;
  // Only complete 4-digit years filter; anything else (partial keystrokes,
  // junk query params) is ignored rather than compared lexicographically.
  const YEAR = /^\d{4}$/;
  if (range.from && YEAR.test(range.from)) {
    out = out.filter((o) => o.date >= `${range.from}-01-01`);
  }
  if (range.to && YEAR.test(range.to)) {
    out = out.filter((o) => o.date <= `${range.to}-12-31`);
  }

  return {
    id: def.id,
    name: def.name,
    transform: config,
    units: result.units,
    unitClass: result.unitClass,
    frequency: def.frequency,
    observations: out.map((o) => [o.date, Number(o.value.toFixed(4))]),
  };
}

export interface RecessionBand {
  start: string;
  end: string;
}

/** Contiguous runs of USREC = 1, as [start, end] month dates. */
export async function getRecessionBands(): Promise<RecessionBand[]> {
  if (!getSeriesDef("USREC")) return [];
  const obs = await loadObservations("USREC");
  const bands: RecessionBand[] = [];
  let start: string | null = null;
  let prev: string | null = null;
  for (const o of obs) {
    if (o.value === 1) {
      if (start === null) start = o.date;
      prev = o.date;
    } else if (start !== null && prev !== null) {
      bands.push({ start, end: prev });
      start = null;
    }
  }
  if (start !== null && prev !== null) bands.push({ start, end: prev });
  return bands;
}
