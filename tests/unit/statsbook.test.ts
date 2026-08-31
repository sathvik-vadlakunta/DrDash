import { describe, expect, it } from "vitest";
import { STATSBOOK_FIGURES } from "@/lib/statsbook/figures";
import { STATSBOOK_TABLES } from "@/lib/statsbook/tables";
import { SERIES_BY_ID, requireSeriesDef } from "@/lib/catalog/series";
import { transformAllowed } from "@/lib/transforms";

describe("statsbook figures", () => {
  it("defines figures 1 through 50 exactly", () => {
    const ids = STATSBOOK_FIGURES.map((f) => f.id).sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: 50 }, (_, i) => i + 1));
  });

  it("uses only valid series/transform combinations", () => {
    for (const fig of STATSBOOK_FIGURES) {
      expect(fig.series.length, `figure ${fig.id}`).toBeGreaterThan(0);
      expect(fig.title.length).toBeGreaterThan(2);
      expect(fig.description.length).toBeGreaterThan(10);
      for (const s of fig.series) {
        const def = requireSeriesDef(s.id);
        expect(
          transformAllowed(def, s.transform),
          `figure ${fig.id}: ${s.id} ${s.transform}`
        ).toBe(true);
        if (s.denominatorId) {
          expect(SERIES_BY_ID.has(s.denominatorId)).toBe(true);
        }
      }
    }
  });

  it("points tableRefs at real tables", () => {
    const tableIds = new Set(STATSBOOK_TABLES.map((t) => t.id));
    for (const fig of STATSBOOK_FIGURES) {
      if (fig.tableRef !== undefined) {
        expect(tableIds.has(fig.tableRef), `figure ${fig.id} → table ${fig.tableRef}`).toBe(true);
      }
    }
  });

  it("maps the board-specified figures to the right series", () => {
    const byId = new Map(STATSBOOK_FIGURES.map((f) => [f.id, f]));
    expect(byId.get(1)?.series).toEqual([{ id: "GDP", transform: "LEVEL" }]);
    expect(byId.get(3)?.series[0]).toMatchObject({ id: "GDPC1", transform: "PER_CAPITA" });
    expect(byId.get(24)?.series[0]).toMatchObject({ id: "FEDFUNDS" });
    expect(byId.get(26)?.series.map((s) => s.id).sort()).toEqual(["AAA", "BAA"]);
    expect(byId.get(32)?.series[0]).toMatchObject({ id: "DD_MONEY_VEL" });
    expect(byId.get(35)?.series[0]).toMatchObject({ id: "FYFSD" });
    expect(byId.get(41)?.series[0]).toMatchObject({ id: "UNRATE" });
    expect(byId.get(50)?.series[0]).toMatchObject({ id: "SIPOVGINIUSA" });
    const f38 = byId.get(38)!;
    expect(f38.series.map((s) => s.id).sort()).toEqual(["EXPGS", "IMPGS"]);
    for (const s of f38.series) expect(s.transform).toBe("PCT_OF");
  });
});

describe("statsbook tables", () => {
  it("defines tables 1 through 17 exactly", () => {
    const ids = STATSBOOK_TABLES.map((t) => t.id).sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: 17 }, (_, i) => i + 1));
  });

  it("uses only catalog series in dynamic columns", () => {
    for (const table of STATSBOOK_TABLES) {
      for (const col of table.columns) {
        if (!col.source) continue;
        const def = requireSeriesDef(col.source.seriesId);
        const t = col.source.transform ?? "LEVEL";
        expect(
          transformAllowed(def, t),
          `table ${table.id} col ${col.key}: ${col.source.seriesId} ${t}`
        ).toBe(true);
      }
    }
  });

  it("Table 3 is the static single-year snapshot", () => {
    const t3 = STATSBOOK_TABLES.find((t) => t.id === 3)!;
    expect(t3.static).toBeDefined();
    expect(t3.static!.year).toBe(2024);
    expect(t3.static!.rows.length).toBeGreaterThan(3);
  });

  it("Table 16 covers the income-distribution series", () => {
    const t16 = STATSBOOK_TABLES.find((t) => t.id === 16)!;
    const ids = t16.columns.map((c) => c.source?.seriesId).filter(Boolean);
    expect(ids).toEqual(
      expect.arrayContaining(["MEHOINUSA672N", "PPAAUS00000A156NCEN", "SIPOVGINIUSA"])
    );
  });
});
