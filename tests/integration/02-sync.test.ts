import { describe, expect, it, afterAll, beforeAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { syncAllSeries, expectedSeriesCount } from "@/lib/sync";
import type { SyncSummary } from "@/lib/sync";

const prisma = new PrismaClient();
let summary: SyncSummary;

beforeAll(async () => {
  // FRED_OFFLINE=1 is set by the test env, so this loads the bundled JSON.
  summary = await syncAllSeries(prisma, "auto");
}, 300_000);

afterAll(() => prisma.$disconnect());

describe("offline sync", () => {
  it("loads every catalog series from the offline snapshots", () => {
    expect(summary.status).toBe("SUCCEEDED");
    expect(summary.mode).toBe("offline");
    expect(summary.seriesCount).toBe(expectedSeriesCount());
    const failures = summary.outcomes.filter((o) => o.error);
    expect(failures).toEqual([]);
  });

  it("stores a plausible volume of observations", async () => {
    const total = await prisma.observation.count();
    expect(total).toBeGreaterThan(40_000);
    const gdp = await prisma.observation.count({ where: { seriesId: "GDP" } });
    expect(gdp).toBeGreaterThan(300); // quarterly since 1947
  });

  it("computes the constructed series", async () => {
    for (const id of ["DD_REAL_FFR", "DD_MISERY", "DD_WAGE_PRICE_GAP", "DD_MONEY_VEL"]) {
      const count = await prisma.observation.count({ where: { seriesId: id } });
      expect(count, id).toBeGreaterThan(100);
    }
    // Spot-check DD_REAL_FFR ≈ FEDFUNDS − CPI YoY for a known month:
    // June 2022 — fed funds ~1.2%, CPI inflation ~9% → deeply negative.
    const june22 = await prisma.observation.findUnique({
      where: {
        seriesId_date: {
          seriesId: "DD_REAL_FFR",
          date: new Date("2022-06-01T00:00:00Z"),
        },
      },
    });
    expect(june22?.value).toBeLessThan(-5);
  });

  it("records the run in SyncRun", async () => {
    const run = await prisma.syncRun.findFirst({ orderBy: { startedAt: "desc" } });
    expect(run?.status).toBe("SUCCEEDED");
    expect(run?.observationCount).toBeGreaterThan(40_000);
  });
});
