/**
 * The FRED sync engine.
 *
 * Loads observations for every catalog series into the database — from the
 * live FRED CSV endpoint when the network allows, falling back to the bundled
 * offline JSON snapshots — then recomputes the DD_* constructed series from
 * the freshly stored inputs. Each run is recorded as a SyncRun row.
 */
import type { PrismaClient } from "@prisma/client";
import {
  SERIES_CATALOG,
  fredSeries,
  constructedSeries,
  requireSeriesDef,
  type SeriesDef,
} from "@/lib/catalog/series";
import { CONSTRUCTED_SPECS } from "@/lib/catalog/constructed";
import { fetchFredSeries, loadOfflineSeries, offlineMode } from "@/lib/fred";
import type { Obs } from "@/lib/transforms";

export type SyncMode = "auto" | "fred" | "offline";

export interface SeriesSyncOutcome {
  id: string;
  source: "FRED" | "OFFLINE" | "COMPUTED";
  observations: number;
  error?: string;
}

export interface SyncSummary {
  runId: string;
  status: "SUCCEEDED" | "FAILED";
  mode: SyncMode;
  seriesCount: number;
  observationCount: number;
  outcomes: SeriesSyncOutcome[];
}

async function upsertSeriesMeta(prisma: PrismaClient, def: SeriesDef) {
  const meta = {
    name: def.name,
    category: def.category,
    kind: def.kind,
    frequency: def.frequency,
    seasonal: def.seasonal,
    units: def.units,
    nominal: def.nominal,
    canGrowth: def.canGrowth,
    source: def.source,
    description: def.description,
    hidden: def.hidden ?? false,
  };
  await prisma.series.upsert({
    where: { id: def.id },
    update: meta,
    create: { id: def.id, ...meta },
  });
}

async function replaceObservations(
  prisma: PrismaClient,
  seriesId: string,
  obs: Obs[],
  source: "FRED" | "OFFLINE" | "COMPUTED"
) {
  // One transaction per series: a failure mid-write must never leave a series
  // emptied or half-loaded.
  const BATCH = 2000;
  const ops = [prisma.observation.deleteMany({ where: { seriesId } })];
  for (let i = 0; i < obs.length; i += BATCH) {
    ops.push(
      prisma.observation.createMany({
        data: obs.slice(i, i + BATCH).map((o) => ({
          seriesId,
          date: new Date(`${o.date}T00:00:00.000Z`),
          value: o.value,
        })),
      })
    );
  }
  await prisma.$transaction([
    ...ops,
    prisma.series.update({
      where: { id: seriesId },
      data: { lastSyncedAt: new Date(), lastSource: source },
    }),
  ]);
}

async function loadStoredObs(prisma: PrismaClient, seriesId: string): Promise<Obs[]> {
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

/**
 * Sync every catalog series. `mode`:
 *  - "fred": network only; a series that cannot be fetched is recorded as failed.
 *  - "offline": bundled JSON snapshots only.
 *  - "auto": try FRED, fall back to the snapshot per series.
 */
export async function syncAllSeries(
  prisma: PrismaClient,
  mode: SyncMode = "auto",
  log: (msg: string) => void = () => {}
): Promise<SyncSummary> {
  const effectiveMode: SyncMode = offlineMode() ? "offline" : mode;
  const run = await prisma.syncRun.create({
    data: { source: effectiveMode.toUpperCase(), status: "RUNNING" },
  });

  const outcomes: SeriesSyncOutcome[] = [];
  let observationCount = 0;

  try {

  // Ensure catalog metadata exists for everything first (charts need it even
  // if a single series fails to load data).
  for (const def of SERIES_CATALOG) {
    await upsertSeriesMeta(prisma, def);
  }

  for (const def of fredSeries()) {
    let obs: Obs[] | null = null;
    let source: "FRED" | "OFFLINE" = "FRED";
    let error: string | undefined;

    if (effectiveMode !== "offline") {
      try {
        obs = await fetchFredSeries(def.id);
      } catch (err) {
        error = err instanceof Error ? err.message : String(err);
      }
    }
    if (!obs && effectiveMode !== "fred") {
      try {
        obs = await loadOfflineSeries(def.id);
        source = "OFFLINE";
        error = undefined;
      } catch (err) {
        error = err instanceof Error ? err.message : String(err);
      }
    }

    if (obs) {
      try {
        await replaceObservations(prisma, def.id, obs, source);
        outcomes.push({ id: def.id, source, observations: obs.length });
        observationCount += obs.length;
        log(`${def.id}: ${obs.length} observations (${source})`);
      } catch (err) {
        const writeError = err instanceof Error ? err.message : String(err);
        outcomes.push({ id: def.id, source, observations: 0, error: writeError });
        log(`${def.id}: WRITE FAILED — ${writeError}`);
      }
    } else {
      outcomes.push({ id: def.id, source, observations: 0, error });
      log(`${def.id}: FAILED — ${error}`);
    }
  }

  // Constructed series from freshly stored inputs.
  for (const spec of CONSTRUCTED_SPECS) {
    const def = requireSeriesDef(spec.id);
    try {
      const inputs: Record<string, Obs[]> = {};
      for (const inputId of spec.inputs) {
        inputs[inputId] = await loadStoredObs(prisma, inputId);
        if (inputs[inputId].length === 0) {
          throw new Error(`input ${inputId} has no observations`);
        }
      }
      const obs = spec.compute(inputs);
      await replaceObservations(prisma, def.id, obs, "COMPUTED");
      outcomes.push({ id: def.id, source: "COMPUTED", observations: obs.length });
      observationCount += obs.length;
      log(`${def.id}: ${obs.length} observations (COMPUTED)`);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      outcomes.push({ id: def.id, source: "COMPUTED", observations: 0, error });
      log(`${def.id}: FAILED — ${error}`);
    }
  }

  const failures = outcomes.filter((o) => o.error);
  const status = failures.length === 0 ? "SUCCEEDED" : "FAILED";
  await prisma.syncRun.update({
    where: { id: run.id },
    data: {
      finishedAt: new Date(),
      status,
      seriesCount: outcomes.filter((o) => !o.error).length,
      observationCount,
      message:
        failures.length === 0
          ? `Synced ${outcomes.length} series`
          : `${failures.length} failed: ${failures.map((f) => f.id).join(", ")}`,
    },
  });

  return {
    runId: run.id,
    status,
    mode: effectiveMode,
    seriesCount: outcomes.filter((o) => !o.error).length,
    observationCount,
    outcomes,
  };
  } catch (err) {
    // Never leave a run stuck in RUNNING: finalize as FAILED, then rethrow.
    await prisma.syncRun
      .update({
        where: { id: run.id },
        data: {
          finishedAt: new Date(),
          status: "FAILED",
          seriesCount: outcomes.filter((o) => !o.error).length,
          observationCount,
          message: `Aborted: ${err instanceof Error ? err.message : String(err)}`,
        },
      })
      .catch(() => {});
    throw err;
  }
}

/** Expected count of series after a full sync (FRED + constructed). */
export function expectedSeriesCount(): number {
  return fredSeries().length + constructedSeries().length;
}
