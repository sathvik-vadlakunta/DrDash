/**
 * `pnpm sync` — load observations for every catalog series into the database.
 *
 * Modes:
 *   pnpm sync             try FRED, fall back to bundled offline JSON per series
 *   pnpm sync --offline   bundled JSON only (same as FRED_OFFLINE=1)
 *   pnpm sync --fred      network only; failures are reported, not papered over
 */
import { PrismaClient } from "@prisma/client";
import { syncAllSeries, type SyncMode } from "../src/lib/sync";

try {
  process.loadEnvFile(".env");
} catch {
  // no .env — rely on the environment
}

async function main() {
  const args = process.argv.slice(2);
  const mode: SyncMode = args.includes("--offline")
    ? "offline"
    : args.includes("--fred")
      ? "fred"
      : "auto";

  const prisma = new PrismaClient();
  try {
    console.log(`Starting sync (mode: ${mode})…`);
    const summary = await syncAllSeries(prisma, mode, (msg) => console.log(`  ${msg}`));
    console.log(
      `\nSync ${summary.status}: ${summary.seriesCount} series, ${summary.observationCount} observations (run ${summary.runId})`
    );
    const failures = summary.outcomes.filter((o) => o.error);
    if (failures.length > 0) {
      console.error(`\n${failures.length} series failed:`);
      for (const f of failures) console.error(`  ${f.id}: ${f.error}`);
      process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
