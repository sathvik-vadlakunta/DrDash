/**
 * FRED data access: live CSV download plus the bundled offline JSON snapshots.
 * Server-side only (uses fs for the offline path).
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Obs } from "@/lib/transforms";

export const FRED_CSV_BASE = "https://fred.stlouisfed.org/graph/fredgraph.csv";
export const OFFLINE_DATA_DIR = path.join(process.cwd(), "prisma", "seed", "data");

export class FredError extends Error {
  constructor(
    public readonly seriesId: string,
    message: string
  ) {
    super(`FRED ${seriesId}: ${message}`);
    this.name = "FredError";
  }
}

/** Parse a fredgraph.csv body into observations (nulls dropped). */
export function parseFredCsv(seriesId: string, csv: string): Obs[] {
  const lines = csv.trim().split("\n");
  const header = lines[0]?.trim().split(",");
  if (!header || header[0] !== "observation_date" || header[1] !== seriesId) {
    throw new FredError(seriesId, `unexpected CSV header: ${lines[0]?.slice(0, 80)}`);
  }
  const out: Obs[] = [];
  for (let i = 1; i < lines.length; i++) {
    const [date, raw] = lines[i].split(",");
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (raw === "." || raw === "" || raw === undefined) continue;
    const value = Number(raw);
    if (Number.isFinite(value)) out.push({ date, value });
  }
  if (out.length === 0) throw new FredError(seriesId, "no observations in CSV");
  return out;
}

/** Download a series from FRED's public CSV endpoint (no API key required). */
export async function fetchFredSeries(
  seriesId: string,
  opts: { timeoutMs?: number } = {}
): Promise<Obs[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 30_000);
  try {
    const res = await fetch(`${FRED_CSV_BASE}?id=${encodeURIComponent(seriesId)}`, {
      signal: controller.signal,
      headers: { accept: "text/csv" },
    });
    if (!res.ok) throw new FredError(seriesId, `HTTP ${res.status}`);
    return parseFredCsv(seriesId, await res.text());
  } catch (err) {
    if (err instanceof FredError) throw err;
    throw new FredError(seriesId, err instanceof Error ? err.message : String(err));
  } finally {
    clearTimeout(timer);
  }
}

export interface OfflineSeriesFile {
  id: string;
  fetchedAt: string;
  observations: [string, number | null][];
}

/** Load a series from the bundled offline JSON snapshot. */
export async function loadOfflineSeries(seriesId: string): Promise<Obs[]> {
  if (!/^[A-Za-z0-9_]+$/.test(seriesId)) {
    throw new FredError(seriesId, "invalid series id");
  }
  let raw: string;
  try {
    raw = await readFile(path.join(OFFLINE_DATA_DIR, `${seriesId}.json`), "utf8");
  } catch {
    throw new FredError(seriesId, "no offline snapshot bundled");
  }
  const parsed = JSON.parse(raw) as OfflineSeriesFile;
  if (parsed.id !== seriesId || !Array.isArray(parsed.observations)) {
    throw new FredError(seriesId, "malformed offline snapshot");
  }
  const out: Obs[] = [];
  for (const [date, value] of parsed.observations) {
    if (value !== null && Number.isFinite(value)) out.push({ date, value });
  }
  if (out.length === 0) throw new FredError(seriesId, "offline snapshot is empty");
  return out;
}

export function offlineMode(): boolean {
  return process.env.FRED_OFFLINE === "1" || process.env.FRED_OFFLINE === "true";
}
