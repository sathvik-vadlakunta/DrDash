/**
 * `pnpm check:catalog` — verify the integrity of the series catalog.
 *
 * Checks, in order:
 *   1. every catalog series has a bundled offline JSON snapshot that parses
 *      and contains observations;
 *   2. every constructed (DD_*) series has a spec whose inputs are in the
 *      catalog;
 *   3. every lesson seed validates against the lesson schema and references
 *      only catalog series;
 *   4. every statsbook figure and table column references catalog series;
 *   5. unless offline, every FRED id still resolves against the live FRED
 *      CSV endpoint (catches retired/superseded ids).
 *
 * Exits non-zero on any failure. Pass --offline (or set FRED_OFFLINE=1) to
 * skip the network check, e.g. in CI sandboxes.
 */
import {
  SERIES_CATALOG,
  SERIES_BY_ID,
  fredSeries,
  constructedSeries,
} from "../src/lib/catalog/series";
import { CONSTRUCTED_BY_ID } from "../src/lib/catalog/constructed";
import { loadOfflineSeries, fetchFredSeries } from "../src/lib/fred";
import { lessonSeedSchema } from "../src/lib/lessons/schema";
import { ALL_LESSONS } from "../prisma/seed/lessons";
import { STATSBOOK_FIGURES } from "../src/lib/statsbook/figures";
import { STATSBOOK_TABLES } from "../src/lib/statsbook/tables";

try {
  process.loadEnvFile(".env");
} catch {
  // no .env — rely on the environment
}

const failures: string[] = [];
const fail = (msg: string) => {
  failures.push(msg);
  console.error(`  ✗ ${msg}`);
};

async function checkOfflineSnapshots() {
  console.log(`Offline snapshots (${SERIES_CATALOG.length} series)…`);
  for (const def of SERIES_CATALOG) {
    try {
      const obs = await loadOfflineSeries(def.id);
      if (obs.length < 5) fail(`${def.id}: offline snapshot has only ${obs.length} observations`);
    } catch (err) {
      fail(`${def.id}: ${err instanceof Error ? err.message : err}`);
    }
  }
}

function checkConstructed() {
  console.log(`Constructed series (${constructedSeries().length})…`);
  for (const def of constructedSeries()) {
    const spec = CONSTRUCTED_BY_ID.get(def.id);
    if (!spec) {
      fail(`${def.id}: no construction spec`);
      continue;
    }
    for (const input of spec.inputs) {
      if (!SERIES_BY_ID.has(input)) fail(`${def.id}: input ${input} not in catalog`);
    }
  }
  for (const spec of CONSTRUCTED_BY_ID.values()) {
    if (!SERIES_BY_ID.has(spec.id)) fail(`spec ${spec.id} has no catalog entry`);
  }
}

function checkLessons() {
  console.log(`Lesson seeds (${ALL_LESSONS.length})…`);
  const slugs = new Set<string>();
  const sortOrders = new Set<number>();
  for (const lesson of ALL_LESSONS) {
    const parsed = lessonSeedSchema.safeParse(lesson);
    if (!parsed.success) {
      fail(`lesson ${lesson.slug}: ${parsed.error.issues.map((i) => i.message).join("; ")}`);
      continue;
    }
    if (slugs.has(lesson.slug)) fail(`duplicate lesson slug: ${lesson.slug}`);
    slugs.add(lesson.slug);
    if (sortOrders.has(lesson.sortOrder)) fail(`duplicate lesson sortOrder: ${lesson.sortOrder}`);
    sortOrders.add(lesson.sortOrder);
  }
}

function checkStatsbook() {
  console.log(
    `Statsbook (${STATSBOOK_FIGURES.length} figures, ${STATSBOOK_TABLES.length} tables)…`
  );
  const ids = new Set<number>();
  for (const fig of STATSBOOK_FIGURES) {
    if (ids.has(fig.id)) fail(`duplicate figure id ${fig.id}`);
    ids.add(fig.id);
    for (const s of fig.series) {
      if (!SERIES_BY_ID.has(s.id)) fail(`figure ${fig.id}: unknown series ${s.id}`);
      if (s.denominatorId && !SERIES_BY_ID.has(s.denominatorId)) {
        fail(`figure ${fig.id}: unknown denominator ${s.denominatorId}`);
      }
    }
    if (fig.tableRef !== undefined && !STATSBOOK_TABLES.some((t) => t.id === fig.tableRef)) {
      fail(`figure ${fig.id}: tableRef ${fig.tableRef} does not exist`);
    }
  }
  for (let i = 1; i <= 50; i++) {
    if (!ids.has(i)) fail(`figure ${i} missing from the statsbook catalog`);
  }
  const tableIds = new Set<number>();
  for (const table of STATSBOOK_TABLES) {
    if (tableIds.has(table.id)) fail(`duplicate table id ${table.id}`);
    tableIds.add(table.id);
    for (const col of table.columns) {
      if (col.source && !SERIES_BY_ID.has(col.source.seriesId)) {
        fail(`table ${table.id} column ${col.key}: unknown series ${col.source.seriesId}`);
      }
      if (col.source?.denominatorId && !SERIES_BY_ID.has(col.source.denominatorId)) {
        fail(`table ${table.id} column ${col.key}: unknown denominator ${col.source.denominatorId}`);
      }
    }
  }
  for (let i = 1; i <= 17; i++) {
    if (!tableIds.has(i)) fail(`table ${i} missing from the statsbook catalog`);
  }
}

async function checkFredResolution() {
  const offline =
    process.argv.includes("--offline") ||
    process.env.FRED_OFFLINE === "1" ||
    process.env.FRED_OFFLINE === "true";
  const series = fredSeries();
  if (offline) {
    console.log(`FRED resolution: skipped (offline mode) for ${series.length} ids`);
    return;
  }
  console.log(`FRED resolution (${series.length} ids)…`);

  // Probe first — if the endpoint itself is unreachable, degrade gracefully
  // rather than failing every id.
  try {
    await fetchFredSeries("GDP", { timeoutMs: 20_000 });
  } catch {
    console.warn(
      "  ! FRED is unreachable from this environment — skipping live id resolution (offline snapshots already validated)"
    );
    return;
  }

  const queue = [...series];
  const workers = Array.from({ length: 8 }, async () => {
    for (;;) {
      const def = queue.shift();
      if (!def) return;
      try {
        await fetchFredSeries(def.id);
      } catch (err) {
        fail(`${def.id}: does not resolve on FRED — ${err instanceof Error ? err.message : err}`);
      }
    }
  });
  await Promise.all(workers);
}

async function main() {
  await checkOfflineSnapshots();
  checkConstructed();
  checkLessons();
  checkStatsbook();
  await checkFredResolution();

  if (failures.length > 0) {
    console.error(`\ncheck:catalog FAILED — ${failures.length} problem(s)`);
    process.exit(1);
  }
  console.log("\ncheck:catalog passed — catalog, lessons, and statsbook are consistent");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
