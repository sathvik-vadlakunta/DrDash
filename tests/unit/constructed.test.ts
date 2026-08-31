import { describe, expect, it } from "vitest";
import { CONSTRUCTED_BY_ID } from "@/lib/catalog/constructed";
import type { Obs } from "@/lib/transforms";

function monthly(startYear: number, values: number[]): Obs[] {
  return values.map((value, i) => {
    const y = startYear + Math.floor(i / 12);
    const m = (i % 12) + 1;
    return { date: `${y}-${String(m).padStart(2, "0")}-01`, value };
  });
}

function quarterly(startYear: number, values: number[]): Obs[] {
  return values.map((value, i) => {
    const y = startYear + Math.floor(i / 4);
    const m = (i % 4) * 3 + 1;
    return { date: `${y}-${String(m).padStart(2, "0")}-01`, value };
  });
}

describe("DD_REAL_FFR", () => {
  it("equals fed funds minus CPI YoY inflation", () => {
    const spec = CONSTRUCTED_BY_ID.get("DD_REAL_FFR")!;
    // CPI grows exactly 5%/yr; fed funds constant at 3%.
    const cpi = monthly(2000, Array.from({ length: 25 }, (_, i) => 100 * 1.05 ** (i / 12)));
    const ff = monthly(2000, Array.from({ length: 25 }, () => 3));
    const out = spec.compute({ FEDFUNDS: ff, CPIAUCSL: cpi });
    expect(out.length).toBe(13);
    expect(out[0].value).toBeCloseTo(3 - 5, 1);
  });
});

describe("DD_MISERY", () => {
  it("equals unemployment plus CPI YoY inflation", () => {
    const spec = CONSTRUCTED_BY_ID.get("DD_MISERY")!;
    const cpi = monthly(2000, Array.from({ length: 25 }, (_, i) => 100 * 1.02 ** (i / 12)));
    const un = monthly(2000, Array.from({ length: 25 }, () => 6));
    const out = spec.compute({ UNRATE: un, CPIAUCSL: cpi });
    expect(out[0].value).toBeCloseTo(8, 1);
  });
});

describe("DD_WAGE_PRICE_GAP", () => {
  it("equals compensation growth minus productivity growth", () => {
    const spec = CONSTRUCTED_BY_ID.get("DD_WAGE_PRICE_GAP")!;
    // Compensation grows 2%/yr, productivity 3%/yr → gap ≈ −1pp.
    const comp = quarterly(2000, Array.from({ length: 9 }, (_, i) => 100 * 1.02 ** (i / 4)));
    const oph = quarterly(2000, Array.from({ length: 9 }, (_, i) => 100 * 1.03 ** (i / 4)));
    const out = spec.compute({ COMPRNFB: comp, OPHNFB: oph });
    expect(out.length).toBe(5);
    expect(out[0].value).toBeCloseTo(-1, 1);
  });
});

describe("DD_MONEY_VEL", () => {
  it("divides GDP by the quarterly average of monthly M2", () => {
    const spec = CONSTRUCTED_BY_ID.get("DD_MONEY_VEL")!;
    const gdp = quarterly(2000, [21_000]);
    const m2 = monthly(2000, [10_000, 10_500, 11_000]);
    const out = spec.compute({ GDP: gdp, M2SL: m2 });
    expect(out).toHaveLength(1);
    expect(out[0].value).toBeCloseTo(21_000 / 10_500, 4);
  });

  it("skips quarters with no M2 coverage", () => {
    const spec = CONSTRUCTED_BY_ID.get("DD_MONEY_VEL")!;
    const gdp = quarterly(2000, [21_000, 22_000]);
    const m2 = monthly(2000, [10_000, 10_000, 10_000]); // only Q1
    const out = spec.compute({ GDP: gdp, M2SL: m2 });
    expect(out).toHaveLength(1);
    expect(out[0].date).toBe("2000-01-01");
  });
});
