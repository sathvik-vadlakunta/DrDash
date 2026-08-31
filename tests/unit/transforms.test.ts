import { describe, expect, it } from "vitest";
import {
  yoyGrowth,
  transformSeries,
  transformAllowed,
  allowedTransforms,
  valueAtOrBefore,
  type Obs,
} from "@/lib/transforms";
import { requireSeriesDef } from "@/lib/catalog/series";

function monthly(startYear: number, values: number[]): Obs[] {
  return values.map((value, i) => {
    const y = startYear + Math.floor(i / 12);
    const m = (i % 12) + 1;
    return { date: `${y}-${String(m).padStart(2, "0")}-01`, value };
  });
}

describe("yoyGrowth", () => {
  it("computes 12-month growth for monthly series", () => {
    const obs = monthly(2000, Array.from({ length: 24 }, (_, i) => 100 + i));
    const def = requireSeriesDef("CPIAUCSL");
    const out = yoyGrowth(obs, def);
    expect(out).toHaveLength(12);
    expect(out[0].date).toBe("2001-01-01");
    expect(out[0].value).toBeCloseTo(12, 6); // 112/100 − 1
  });

  it("computes 4-quarter growth for quarterly series", () => {
    const def = requireSeriesDef("GDP");
    const obs: Obs[] = [
      { date: "2000-01-01", value: 100 },
      { date: "2000-04-01", value: 101 },
      { date: "2000-07-01", value: 102 },
      { date: "2000-10-01", value: 103 },
      { date: "2001-01-01", value: 110 },
    ];
    const out = yoyGrowth(obs, def);
    expect(out).toHaveLength(1);
    expect(out[0].value).toBeCloseTo(10, 6);
  });
});

describe("valueAtOrBefore", () => {
  const obs: Obs[] = [
    { date: "2000-01-01", value: 1 },
    { date: "2000-04-01", value: 2 },
    { date: "2000-07-01", value: 3 },
  ];
  it("forward-fills from the latest prior observation", () => {
    expect(valueAtOrBefore(obs, "2000-05-15")).toBe(2);
    expect(valueAtOrBefore(obs, "2000-04-01")).toBe(2);
    expect(valueAtOrBefore(obs, "1999-12-31")).toBeNull();
    expect(valueAtOrBefore(obs, "2005-01-01")).toBe(3);
  });
});

describe("transformSeries", () => {
  it("REAL deflates by CPI anchored to the latest CPI observation", () => {
    const def = requireSeriesDef("AHETPI");
    const obs: Obs[] = [
      { date: "2000-01-01", value: 10 },
      { date: "2020-01-01", value: 20 },
    ];
    const deflator: Obs[] = [
      { date: "2000-01-01", value: 100 },
      { date: "2020-01-01", value: 200 },
    ];
    const { obs: out } = transformSeries(def, obs, { type: "REAL" }, { deflator });
    expect(out[0].value).toBeCloseTo(20, 6); // 10 × 200/100
    expect(out[1].value).toBeCloseTo(20, 6);
  });

  it("PER_CAPITA converts billions over thousands of persons to dollars/person", () => {
    const def = requireSeriesDef("GDP");
    const obs: Obs[] = [{ date: "2020-01-01", value: 21_000 }]; // $21T in $B
    const population: Obs[] = [{ date: "2020-01-01", value: 330_000 }]; // 330M in thousands
    const { obs: out, units } = transformSeries(
      def,
      obs,
      { type: "PER_CAPITA" },
      { population }
    );
    expect(out[0].value).toBeCloseTo((21_000e9 / 330_000e3), 0); // ≈ $63,636
    expect(units).toBe("Dollars per person");
  });

  it("PCT_OF forward-fills a quarterly denominator under monthly data", () => {
    const def = requireSeriesDef("DSPI"); // monthly, $B SAAR
    const denomDef = requireSeriesDef("GDP"); // quarterly, $B SAAR
    const obs: Obs[] = [
      { date: "2020-01-01", value: 15_000 },
      { date: "2020-02-01", value: 15_100 },
    ];
    const denominator = {
      def: denomDef,
      obs: [{ date: "2020-01-01", value: 21_000 }] as Obs[],
    };
    const { obs: out } = transformSeries(def, obs, { type: "PCT_OF" }, { denominator });
    expect(out).toHaveLength(2);
    expect(out[0].value).toBeCloseTo((15_000 / 21_000) * 100, 6);
    expect(out[1].value).toBeCloseTo((15_100 / 21_000) * 100, 6); // Feb uses Q1 GDP
  });

  it("PCT_OF annualizes non-annualized monthly flows (BOPGSTB) and scales millions", () => {
    const def = requireSeriesDef("BOPGSTB"); // monthly flow, $M, not annualized
    const denomDef = requireSeriesDef("GDP");
    const obs: Obs[] = [{ date: "2020-01-01", value: -50_000 }]; // −$50B for the month
    const denominator = {
      def: denomDef,
      obs: [{ date: "2020-01-01", value: 21_000 }] as Obs[],
    };
    const { obs: out } = transformSeries(def, obs, { type: "PCT_OF" }, { denominator });
    // (−50,000 × 1e6 × 12) / (21,000 × 1e9) × 100 ≈ −2.857%
    expect(out[0].value).toBeCloseTo(-2.857, 2);
  });

  it("PCT_OF does NOT annualize stocks (GFDEBTN in millions)", () => {
    const def = requireSeriesDef("GFDEBTN"); // quarterly stock, $M
    const denomDef = requireSeriesDef("GDP");
    const obs: Obs[] = [{ date: "2020-01-01", value: 23_000_000 }]; // $23T in $M
    const denominator = {
      def: denomDef,
      obs: [{ date: "2020-01-01", value: 21_000 }] as Obs[],
    };
    const { obs: out } = transformSeries(def, obs, { type: "PCT_OF" }, { denominator });
    expect(out[0].value).toBeCloseTo((23e12 / 21e12) * 100, 3); // ≈ 109.5%
  });
});

describe("transformAllowed gating", () => {
  it("blocks growth on sign-crossing and rate series", () => {
    expect(transformAllowed(requireSeriesDef("NETEXP"), "YOY_GROWTH")).toBe(false);
    expect(transformAllowed(requireSeriesDef("FYFSD"), "YOY_GROWTH")).toBe(false);
    expect(transformAllowed(requireSeriesDef("FEDFUNDS"), "YOY_GROWTH")).toBe(false);
    expect(transformAllowed(requireSeriesDef("TERMCBCCALLNS"), "YOY_GROWTH")).toBe(false);
  });

  it("blocks REAL on already-real and non-currency series", () => {
    expect(transformAllowed(requireSeriesDef("GDPC1"), "REAL")).toBe(false);
    expect(transformAllowed(requireSeriesDef("UNRATE"), "REAL")).toBe(false);
    expect(transformAllowed(requireSeriesDef("AHETPI"), "REAL")).toBe(true);
    expect(transformAllowed(requireSeriesDef("MEHOINUSA672N"), "REAL")).toBe(false);
  });

  it("restricts PER_CAPITA and PCT_OF to economy-wide dollar aggregates", () => {
    expect(transformAllowed(requireSeriesDef("AHETPI"), "PCT_OF")).toBe(false);
    expect(transformAllowed(requireSeriesDef("AHETPI"), "PER_CAPITA")).toBe(false);
    expect(transformAllowed(requireSeriesDef("GDP"), "PCT_OF")).toBe(true);
    expect(transformAllowed(requireSeriesDef("GFDEBTN"), "PCT_OF")).toBe(true);
    expect(transformAllowed(requireSeriesDef("OPHNFB"), "PER_CAPITA")).toBe(false);
  });

  it("always allows LEVEL", () => {
    for (const id of ["GDP", "UNRATE", "DD_MONEY_VEL", "USREC"]) {
      expect(allowedTransforms(requireSeriesDef(id))).toContain("LEVEL");
    }
  });
});
