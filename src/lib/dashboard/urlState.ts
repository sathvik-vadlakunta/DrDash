/**
 * The dashboard URL state grammar.
 *
 * A chart is fully described by its URL, which is what makes dashboards
 * shareable links:
 *
 *   /dashboard?s=CPIAUCSL:yoy,CPILFESL:yoy&rec=1&from=1960&to=2024
 *
 * `s` is a comma-separated list of SERIES_ID:transform[:denominator] entries.
 * Transform codes: lvl (level), yoy (growth rate), real, pc (per capita),
 * pctof (percent of denominator, default GDP).
 */
import { SERIES_BY_ID } from "@/lib/catalog/series";
import {
  transformAllowed,
  isDollarAggregate,
  DEFAULT_DENOMINATOR_ID,
  type TransformType,
} from "@/lib/transforms";

export interface ChartSeriesState {
  id: string;
  transform: TransformType;
  denominatorId?: string;
}

export interface ChartState {
  series: ChartSeriesState[];
  recessions: boolean;
  /** Inclusive year bounds, e.g. "1960". */
  from?: string;
  to?: string;
}

export const TRANSFORM_CODES: Record<TransformType, string> = {
  LEVEL: "lvl",
  YOY_GROWTH: "yoy",
  REAL: "real",
  PER_CAPITA: "pc",
  PCT_OF: "pctof",
};

const CODE_TO_TRANSFORM: Record<string, TransformType> = Object.fromEntries(
  Object.entries(TRANSFORM_CODES).map(([k, v]) => [v, k as TransformType])
);

const YEAR_RE = /^\d{4}$/;

export function encodeChartState(state: ChartState): string {
  const params = new URLSearchParams();
  const s = state.series
    .map((entry) => {
      const code = TRANSFORM_CODES[entry.transform];
      if (entry.transform === "PCT_OF") {
        const denom = entry.denominatorId ?? DEFAULT_DENOMINATOR_ID;
        return `${entry.id}:${code}:${denom}`;
      }
      return entry.transform === "LEVEL" ? entry.id : `${entry.id}:${code}`;
    })
    .join(",");
  if (s) params.set("s", s);
  if (state.recessions) params.set("rec", "1");
  if (state.from && YEAR_RE.test(state.from)) params.set("from", state.from);
  if (state.to && YEAR_RE.test(state.to)) params.set("to", state.to);
  return params.toString();
}

export function dashboardHref(state: ChartState): string {
  const qs = encodeChartState(state);
  return qs ? `/dashboard?${qs}` : "/dashboard";
}

/**
 * Decode chart state from URL search params. Unknown series ids, unknown
 * transform codes, and disallowed transform/series combinations are dropped
 * (never thrown) so stale links degrade gracefully.
 */
export function decodeChartState(
  input: URLSearchParams | string | Record<string, string | string[] | undefined>
): ChartState {
  let params: URLSearchParams;
  if (typeof input === "string") {
    params = new URLSearchParams(input.startsWith("?") ? input.slice(1) : input);
  } else if (input instanceof URLSearchParams) {
    params = input;
  } else {
    params = new URLSearchParams();
    for (const [k, v] of Object.entries(input)) {
      if (typeof v === "string") params.set(k, v);
      else if (Array.isArray(v) && v.length > 0) params.set(k, v[0]);
    }
  }

  const series: ChartSeriesState[] = [];
  const raw = params.get("s") ?? "";
  for (const token of raw.split(",")) {
    if (!token) continue;
    const [id, code, denom] = token.split(":");
    const def = SERIES_BY_ID.get(id);
    if (!def) continue;
    const transform = code ? CODE_TO_TRANSFORM[code] : "LEVEL";
    if (!transform || !transformAllowed(def, transform)) continue;
    if (series.some((s) => s.id === id && s.transform === transform)) continue;
    if (series.length >= 8) break; // sanity cap for chart legibility
    if (transform === "PCT_OF") {
      const denomId = denom && SERIES_BY_ID.has(denom) ? denom : DEFAULT_DENOMINATOR_ID;
      const denomDef = SERIES_BY_ID.get(denomId);
      if (!denomDef || !isDollarAggregate(denomDef)) continue;
      series.push({ id, transform, denominatorId: denomId });
    } else {
      series.push({ id, transform });
    }
  }

  const from = params.get("from") ?? undefined;
  const to = params.get("to") ?? undefined;
  return {
    series,
    recessions: params.get("rec") === "1",
    from: from && YEAR_RE.test(from) ? from : undefined,
    to: to && YEAR_RE.test(to) ? to : undefined,
  };
}

/**
 * Decode chart state from a full URL, path + query, or bare query string —
 * whatever a student pastes. Returns null when nothing chart-like is found.
 */
export function decodeChartStateFromUrl(url: string): ChartState | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  let query: string | null = null;
  try {
    const u = new URL(trimmed);
    query = u.search;
  } catch {
    const qIndex = trimmed.indexOf("?");
    query = qIndex >= 0 ? trimmed.slice(qIndex) : trimmed.includes("=") ? trimmed : null;
  }
  if (!query) return null;
  const state = decodeChartState(query.startsWith("?") ? query.slice(1) : query);
  return state.series.length > 0 ? state : null;
}
