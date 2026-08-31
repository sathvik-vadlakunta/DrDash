"use client";

/**
 * Client-side data hooks with module-level caching so the catalog and series
 * data are fetched once per page, however many chart instances render.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { TransformConfig, TransformType } from "@/lib/transforms";
import { TRANSFORM_SHORT } from "@/lib/transforms";
import type { ChartSeriesState, ChartState } from "@/lib/dashboard/urlState";
import type { PanelBand } from "./ChartPanel";

export interface CatalogSeries {
  id: string;
  name: string;
  kind: string;
  frequency: string;
  units: string;
  description: string;
  transforms: TransformType[];
  observations: number;
  firstDate: string | null;
  lastDate: string | null;
}

export interface CatalogCategory {
  slug: string;
  label: string;
  series: CatalogSeries[];
}

let catalogCache: CatalogCategory[] | null = null;
let catalogPromise: Promise<CatalogCategory[]> | null = null;

export function useCatalog(): CatalogCategory[] | null {
  const [catalog, setCatalog] = useState<CatalogCategory[] | null>(catalogCache);
  useEffect(() => {
    if (catalogCache) return;
    catalogPromise ??= fetch("/api/v1/series")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((body: { categories: CatalogCategory[] }) => {
        catalogCache = body.categories;
        return body.categories;
      })
      .catch((err) => {
        // Don't memoize a failure — let the next mount retry.
        catalogPromise = null;
        throw err;
      });
    let cancelled = false;
    catalogPromise
      .then((c) => {
        if (!cancelled) setCatalog(c);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return catalog;
}

let bandsCache: PanelBand[] | null = null;
let bandsPromise: Promise<PanelBand[]> | null = null;

const MS_MONTH = 32 * 24 * 3600 * 1000;

export function useRecessionBands(enabled: boolean): PanelBand[] {
  const [bands, setBands] = useState<PanelBand[]>(bandsCache ?? []);
  useEffect(() => {
    if (!enabled || bandsCache) return;
    bandsPromise ??= fetch("/api/v1/recessions")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((body: { bands: { start: string; end: string }[] }) => {
        bandsCache = body.bands.map((b) => ({
          start: Date.parse(`${b.start}T00:00:00Z`),
          // Extend to the end of the final recession month so bands have width.
          end: Date.parse(`${b.end}T00:00:00Z`) + MS_MONTH,
        }));
        return bandsCache;
      })
      .catch((err) => {
        bandsPromise = null; // retry on the next mount
        throw err;
      });
    let cancelled = false;
    bandsPromise
      .then((b) => {
        if (!cancelled) setBands(b);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [enabled]);
  return enabled ? bands : [];
}

export interface SeriesPanelData {
  key: string;
  name: string;
  transform: TransformConfig;
  units: string;
  unitClass: string;
  points: [number, number][];
}

export function seriesKey(s: ChartSeriesState, state: ChartState): string {
  return [
    s.id,
    s.transform,
    s.transform === "PCT_OF" ? (s.denominatorId ?? "GDP") : "",
    state.from ?? "",
    state.to ?? "",
  ].join("|");
}

const dataCache = new Map<string, SeriesPanelData>();
const failedKeys = new Map<string, string>(); // key → error message
const DATA_CACHE_MAX = 300;

function cacheSet(key: string, payload: SeriesPanelData) {
  if (dataCache.size >= DATA_CACHE_MAX) {
    // Drop the oldest entry (Map preserves insertion order).
    const oldest = dataCache.keys().next().value;
    if (oldest !== undefined) dataCache.delete(oldest);
  }
  dataCache.set(key, payload);
}

interface RawPayload {
  id: string;
  name: string;
  transform: TransformConfig;
  units: string;
  unitClass: string;
  observations: [string, number][];
}

async function fetchSeriesData(
  s: ChartSeriesState,
  state: ChartState,
  key: string
): Promise<SeriesPanelData> {
  const params = new URLSearchParams({ t: s.transform });
  if (s.transform === "PCT_OF") params.set("denom", s.denominatorId ?? "GDP");
  if (state.from) params.set("from", state.from);
  if (state.to) params.set("to", state.to);
  const res = await fetch(`/api/v1/series/${s.id}/data?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body: RawPayload = await res.json();
  return {
    key,
    name: body.name,
    transform: body.transform,
    units: body.units,
    unitClass: body.unitClass,
    points: body.observations.map(([d, v]) => [Date.parse(`${d}T00:00:00Z`), v]),
  };
}

export function useSeriesData(state: ChartState): {
  panels: Map<string, SeriesPanelData>;
  loading: boolean;
  errors: string[];
} {
  const keys = useMemo(
    () => state.series.map((s) => seriesKey(s, state)),
    [state]
  );
  const [, bump] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const inFlight = useRef(new Set<string>());

  // A completed fetch must always publish a re-render while the component is
  // mounted — even if the state object identity changed mid-flight (e.g. the
  // dashboard re-adopting URL state). Gating on a per-effect `cancelled` flag
  // would drop the wake-up and strand the chart empty.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const stateRef = useRef(state);
  stateRef.current = state;
  const keysSig = keys.join(";");

  useEffect(() => {
    const current = stateRef.current;
    for (let i = 0; i < current.series.length; i++) {
      const key = seriesKey(current.series[i], current);
      const s = current.series[i];
      if (dataCache.has(key) || inFlight.current.has(key)) continue;
      failedKeys.delete(key); // a fresh effect run retries failed keys
      inFlight.current.add(key);
      fetchSeriesData(s, current, key)
        .then((payload) => {
          cacheSet(key, payload);
        })
        .catch((err: Error) => {
          failedKeys.set(key, `${s.id}: ${err.message}`);
          if (mounted.current) {
            setErrors((prev) =>
              prev.includes(`${s.id}: ${err.message}`)
                ? prev
                : [...prev, `${s.id}: ${err.message}`]
            );
          }
        })
        .finally(() => {
          inFlight.current.delete(key);
          if (mounted.current) bump((n) => n + 1);
        });
    }
  }, [keysSig]);

  const panels = new Map<string, SeriesPanelData>();
  for (const key of keys) {
    const d = dataCache.get(key);
    if (d) panels.set(key, d);
  }
  // A key that failed is no longer "loading" — the error surfaces instead of
  // an eternal spinner.
  const loading = keys.some((k) => !dataCache.has(k) && !failedKeys.has(k));
  return { panels, loading, errors };
}

export function transformLabelForUI(config: TransformConfig): string {
  if (config.type === "PCT_OF") return `% of ${config.denominatorId ?? "GDP"}`;
  return TRANSFORM_SHORT[config.type];
}
