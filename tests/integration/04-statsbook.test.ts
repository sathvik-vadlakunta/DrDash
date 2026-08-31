/**
 * Statsbook data QA against real (offline-synced) observations, including
 * the printed-book spot-checks from the task board.
 */
import { describe, expect, it, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { STATSBOOK_TABLES } from "@/lib/statsbook/tables";
import { STATSBOOK_FIGURES } from "@/lib/statsbook/figures";
import { buildTableData } from "@/lib/statsbook/data";
import { getTransformedSeries } from "@/lib/chartData";

const prisma = new PrismaClient();
afterAll(() => prisma.$disconnect());

describe("statsbook tables build from real data", () => {
  for (const table of STATSBOOK_TABLES) {
    it(`Table ${table.id} — ${table.title} renders rows`, async () => {
      if (table.static) {
        expect(table.static.rows.length).toBeGreaterThan(3);
        return;
      }
      const data = await buildTableData(table);
      expect(data.columns.length).toBeGreaterThan(0);
      expect(data.rows.length).toBeGreaterThan(10);
      // Every column must produce at least one value.
      for (let c = 0; c < data.columns.length; c++) {
        const hasValue = data.rows.some((r) => r.values[c] !== null);
        expect(hasValue, `column ${data.columns[c].key}`).toBe(true);
      }
    });
  }

  it("Table 1 matches the printed statsbook spot-checks for 2024", async () => {
    const table = STATSBOOK_TABLES.find((t) => t.id === 1)!;
    const data = await buildTableData(table, { from: 2024, to: 2024 });
    expect(data.rows).toHaveLength(1);
    const row = data.rows[0];
    const byKey = new Map(data.columns.map((c, i) => [c.key, row.values[i]]));
    const nominal = [...byKey.entries()].find(([k]) => /nominal|^gdp$/i.test(k))?.[1];
    // 2024 nominal GDP ≈ $29.2T (in billions here).
    expect(nominal).toBeGreaterThan(28_500);
    expect(nominal).toBeLessThan(29_900);
    // 2024 per-capita real GDP ≈ $85,784 in 2024 dollars.
    const perCapita = [...byKey.entries()].find(([k]) => /capita/i.test(k))?.[1];
    expect(perCapita).toBeGreaterThan(80_000);
    expect(perCapita).toBeLessThan(92_000);
  });

  it("year range filtering works", async () => {
    const table = STATSBOOK_TABLES.find((t) => t.id === 11)!;
    const data = await buildTableData(table, { from: 1980, to: 1989 });
    expect(data.rows.map((r) => r.year)).toEqual([
      1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    ]);
  });
});

describe("statsbook figures resolve against real data", () => {
  it("every figure's series produce observations", async () => {
    for (const fig of STATSBOOK_FIGURES) {
      for (const s of fig.series) {
        const payload = await getTransformedSeries(s.id, {
          type: s.transform,
          denominatorId: s.denominatorId,
        });
        expect(
          payload.observations.length,
          `figure ${fig.id} series ${s.id} (${s.transform})`
        ).toBeGreaterThan(20);
      }
    }
  }, 300_000);

  it("M2 velocity (figure 32) is in a plausible range", async () => {
    const payload = await getTransformedSeries("DD_MONEY_VEL", { type: "LEVEL" });
    const values = payload.observations.map(([, v]) => v);
    expect(Math.min(...values)).toBeGreaterThan(1);
    expect(Math.max(...values)).toBeLessThan(2.6);
  });

  it("FGEXPND as % of GDP lands in the expected band", async () => {
    const payload = await getTransformedSeries("FGEXPND", {
      type: "PCT_OF",
      denominatorId: "GDP",
    });
    const recent = payload.observations.filter(([d]) => d >= "1960-01-01");
    for (const [d, v] of recent) {
      expect(v, d).toBeGreaterThan(12);
      // Normally ~15–30%; 2020 Q2 spiked to ~45% (CARES Act outlays against
      // collapsed GDP), which is real data, not a transform bug.
      expect(v, d).toBeLessThan(50);
    }
    // The typical modern range the lesson quotes (~18–25%) holds outside COVID.
    const y2019 = recent.filter(([d]) => d.startsWith("2019"));
    for (const [, v] of y2019) {
      expect(v).toBeGreaterThan(18);
      expect(v).toBeLessThan(26);
    }
  });
});
