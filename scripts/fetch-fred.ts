/**
 * `pnpm fetch:fred` — refresh the bundled offline JSON snapshots in
 * prisma/seed/data/ from the live FRED CSV endpoint, then recompute the
 * DD_* constructed series snapshots.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fredSeries } from "../src/lib/catalog/series";
import { CONSTRUCTED_SPECS } from "../src/lib/catalog/constructed";
import { fetchFredSeries, OFFLINE_DATA_DIR } from "../src/lib/fred";
import type { Obs } from "../src/lib/transforms";

async function writeSnapshot(id: string, obs: Obs[]) {
  const payload = {
    id,
    fetchedAt: new Date().toISOString().slice(0, 10),
    observations: obs.map((o) => [o.date, o.value] as [string, number]),
  };
  await writeFile(path.join(OFFLINE_DATA_DIR, `${id}.json`), JSON.stringify(payload) + "\n");
}

async function main() {
  const data: Record<string, Obs[]> = {};
  const failures: string[] = [];

  const queue = [...fredSeries()];
  const workers = Array.from({ length: 8 }, async () => {
    for (;;) {
      const def = queue.shift();
      if (!def) return;
      try {
        const obs = await fetchFredSeries(def.id);
        data[def.id] = obs;
        await writeSnapshot(def.id, obs);
        console.log(`${def.id}: ${obs.length} observations`);
      } catch (err) {
        failures.push(`${def.id}: ${err instanceof Error ? err.message : err}`);
      }
    }
  });
  await Promise.all(workers);

  for (const spec of CONSTRUCTED_SPECS) {
    const inputs: Record<string, Obs[]> = {};
    let ok = true;
    for (const id of spec.inputs) {
      if (!data[id]) {
        failures.push(`${spec.id}: missing input ${id}`);
        ok = false;
        break;
      }
      inputs[id] = data[id];
    }
    if (!ok) continue;
    const obs = spec.compute(inputs);
    await writeSnapshot(spec.id, obs);
    console.log(`${spec.id}: ${obs.length} observations (computed)`);
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} failure(s):`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log("\nAll snapshots refreshed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
