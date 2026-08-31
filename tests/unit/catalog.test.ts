import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  CATEGORY_SLUGS,
  SERIES_CATALOG,
  SERIES_BY_ID,
  fredSeries,
  constructedSeries,
  dollarScale,
} from "@/lib/catalog/series";
import { CONSTRUCTED_SPECS, CONSTRUCTED_BY_ID } from "@/lib/catalog/constructed";
import { OFFLINE_DATA_DIR } from "@/lib/fred";

describe("series catalog integrity", () => {
  it("has unique ids", () => {
    const ids = SERIES_CATALOG.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("assigns every series to a declared category", () => {
    for (const s of SERIES_CATALOG) {
      expect(CATEGORY_SLUGS).toContain(s.category);
    }
  });

  it("includes every series the task board requires", () => {
    const required = [
      // Section 1 catalog additions
      "AAA",
      "TERMCBCCALLNS",
      "FYFSD",
      "NETFI",
      "RBUSBIS",
      "OUTNFB",
      "HOANBS",
      "MEHOINUSA672N",
      "SIPOVGINIUSA",
      "MCUMFN",
      // constructed
      "DD_WAGE_PRICE_GAP",
      "DD_MONEY_VEL",
      "DD_REAL_FFR",
      "DD_MISERY",
      // statsbook gaps
      "A023RC1A027NBEA",
      "A032RC1A027NBEA",
      "PNFIC1",
      // lesson staples
      "CPIAUCSL",
      "PCEPI",
      "FEDFUNDS",
      "GFDEGDQ188S",
      "EXPGS",
      "IMPGS",
      "OPHNFB",
      "COMPRNFB",
      "USREC",
    ];
    for (const id of required) {
      expect(SERIES_BY_ID.has(id), id).toBe(true);
    }
  });

  it("has the income-distribution category seeded with 3+ series", () => {
    const income = SERIES_CATALOG.filter((s) => s.category === "income-distribution");
    expect(income.length).toBeGreaterThanOrEqual(3);
  });

  it("marks task-board flags correctly", () => {
    expect(SERIES_BY_ID.get("TERMCBCCALLNS")?.canGrowth).toBe(false);
    expect(SERIES_BY_ID.get("FYFSD")?.canGrowth).toBe(false);
    expect(SERIES_BY_ID.get("NETFI")?.canGrowth).toBe(false);
    expect(SERIES_BY_ID.get("FYFSD")?.kind).toBe("LEVEL_CURRENCY");
    expect(SERIES_BY_ID.get("NETFI")?.kind).toBe("LEVEL_CURRENCY");
    expect(SERIES_BY_ID.get("RBUSBIS")?.kind).toBe("INDEX");
    expect(SERIES_BY_ID.get("OUTNFB")?.kind).toBe("INDEX");
    expect(SERIES_BY_ID.get("HOANBS")?.kind).toBe("INDEX");
    expect(SERIES_BY_ID.get("MCUMFN")?.kind).toBe("RATIO");
    expect(SERIES_BY_ID.get("USREC")?.hidden).toBe(true);
  });

  it("gives dollar scales only to currency series", () => {
    for (const s of SERIES_CATALOG) {
      if (s.kind !== "LEVEL_CURRENCY") {
        expect(s.dollarScale, s.id).toBeUndefined();
      } else {
        expect(dollarScale(s), s.id).toBeGreaterThan(0);
      }
    }
  });

  it("bundles an offline snapshot for every series", () => {
    for (const s of SERIES_CATALOG) {
      const file = path.join(OFFLINE_DATA_DIR, `${s.id}.json`);
      expect(existsSync(file), `${s.id}.json missing`).toBe(true);
      const parsed = JSON.parse(readFileSync(file, "utf8"));
      expect(parsed.id).toBe(s.id);
      expect(parsed.observations.length).toBeGreaterThan(4);
    }
  });
});

describe("constructed series specs", () => {
  it("covers exactly the CONSTRUCTED catalog entries", () => {
    const catalogIds = constructedSeries().map((s) => s.id).sort();
    const specIds = CONSTRUCTED_SPECS.map((s) => s.id).sort();
    expect(specIds).toEqual(catalogIds);
  });

  it("uses only FRED catalog series as inputs", () => {
    const fredIds = new Set(fredSeries().map((s) => s.id));
    for (const spec of CONSTRUCTED_SPECS) {
      for (const input of spec.inputs) {
        expect(fredIds.has(input), `${spec.id} input ${input}`).toBe(true);
      }
    }
    expect(CONSTRUCTED_BY_ID.size).toBe(CONSTRUCTED_SPECS.length);
  });
});
