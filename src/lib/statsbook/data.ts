/**
 * Server-side assembly of statsbook appendix tables: apply each column's
 * transform, aggregate to annual values, and join into year rows.
 */
import { getTransformedSeries, loadObservations } from "@/lib/chartData";
import type { Obs } from "@/lib/transforms";
import type { StatsbookTableDef, StatsbookTableColumn } from "./types";

/**
 * The printed Statsbook 2025–2026 states real dollar figures in 2024 dollars;
 * rebased columns anchor to this year so values match the book's spot-checks.
 */
export const STATSBOOK_BASE_YEAR = 2024;

function annualMeans(obs: Obs[]): Map<number, number> {
  const sums = new Map<number, { sum: number; n: number }>();
  for (const o of obs) {
    const year = Number(o.date.slice(0, 4));
    const b = sums.get(year);
    if (b) {
      b.sum += o.value;
      b.n += 1;
    } else {
      sums.set(year, { sum: o.value, n: 1 });
    }
  }
  const out = new Map<number, number>();
  for (const [year, { sum, n }] of sums) out.set(year, sum / n);
  return out;
}

let rebaseFactorCache: number | null = null;

/** GDPDEF(base year)/100 — converts chained-2017$ into statsbook-base dollars. */
async function rebaseFactor(): Promise<number> {
  if (rebaseFactorCache !== null) return rebaseFactorCache;
  const deflator = annualMeans(await loadObservations("GDPDEF"));
  const base = deflator.get(STATSBOOK_BASE_YEAR);
  rebaseFactorCache = base ? base / 100 : 1;
  return rebaseFactorCache;
}

export interface TableData {
  columns: { key: string; label: string; format: StatsbookTableColumn["format"] }[];
  rows: { year: number; values: (number | null)[] }[];
}

export async function buildTableData(
  def: StatsbookTableDef,
  range: { from?: number; to?: number } = {}
): Promise<TableData> {
  const dynamicColumns = def.columns.filter((c) => c.source);
  const perColumn: Map<number, number>[] = [];

  for (const col of dynamicColumns) {
    const src = col.source!;
    const payload = await getTransformedSeries(src.seriesId, {
      type: src.transform ?? "LEVEL",
      denominatorId: src.denominatorId,
    });
    let annual = annualMeans(
      payload.observations.map(([date, value]) => ({ date, value }))
    );
    if (src.rebaseToLatestYear) {
      const factor = await rebaseFactor();
      const rebased = new Map<number, number>();
      for (const [year, v] of annual) rebased.set(year, v * factor);
      annual = rebased;
    }
    perColumn.push(annual);
  }

  const years = new Set<number>();
  for (const annual of perColumn) {
    for (const year of annual.keys()) years.add(year);
  }
  let sorted = [...years].sort((a, b) => a - b);
  if (range.from) sorted = sorted.filter((y) => y >= range.from!);
  if (range.to) sorted = sorted.filter((y) => y <= range.to!);

  return {
    columns: dynamicColumns.map((c) => ({
      key: c.key,
      label: c.label,
      format: c.format,
    })),
    rows: sorted.map((year) => ({
      year,
      values: perColumn.map((annual) => annual.get(year) ?? null),
    })),
  };
}
