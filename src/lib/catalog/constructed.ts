/**
 * Formulas for the Dr. Dash constructed (DD_*) series.
 *
 * These are computed from FRED inputs during sync (and by the offline data
 * build). Keeping the formulas in one shared module guarantees the database,
 * the offline JSON seeds, and the tests all agree.
 */
import type { Obs } from "@/lib/transforms";

export interface ConstructedSpec {
  id: string;
  /** FRED series ids this constructed series is computed from. */
  inputs: string[];
  compute: (inputs: Record<string, Obs[]>) => Obs[];
}

const round = (v: number, dp: number) => Number(v.toFixed(dp));

function yoyByLag(obs: Obs[], lag: number): Map<string, number> {
  const out = new Map<string, number>();
  for (let i = lag; i < obs.length; i++) {
    const prev = obs[i - lag].value;
    if (prev !== 0) {
      out.set(obs[i].date, ((obs[i].value / prev) - 1) * 100);
    }
  }
  return out;
}

export const CONSTRUCTED_SPECS: ConstructedSpec[] = [
  {
    id: "DD_REAL_FFR",
    inputs: ["FEDFUNDS", "CPIAUCSL"],
    compute: ({ FEDFUNDS, CPIAUCSL }) => {
      const infl = yoyByLag(CPIAUCSL, 12);
      const out: Obs[] = [];
      for (const o of FEDFUNDS) {
        const i = infl.get(o.date);
        if (i !== undefined) out.push({ date: o.date, value: round(o.value - i, 3) });
      }
      return out;
    },
  },
  {
    id: "DD_MISERY",
    inputs: ["UNRATE", "CPIAUCSL"],
    compute: ({ UNRATE, CPIAUCSL }) => {
      const infl = yoyByLag(CPIAUCSL, 12);
      const out: Obs[] = [];
      for (const o of UNRATE) {
        const i = infl.get(o.date);
        if (i !== undefined) out.push({ date: o.date, value: round(o.value + i, 3) });
      }
      return out;
    },
  },
  {
    id: "DD_WAGE_PRICE_GAP",
    inputs: ["COMPRNFB", "OPHNFB"],
    compute: ({ COMPRNFB, OPHNFB }) => {
      const comp = yoyByLag(COMPRNFB, 4);
      const oph = yoyByLag(OPHNFB, 4);
      const out: Obs[] = [];
      for (const [date, c] of comp) {
        const p = oph.get(date);
        if (p !== undefined) out.push({ date, value: round(c - p, 3) });
      }
      return out;
    },
  },
  {
    id: "DD_MONEY_VEL",
    inputs: ["GDP", "M2SL"],
    compute: ({ GDP, M2SL }) => {
      // Average the monthly M2 stock within each quarter, then divide GDP by it.
      const byQuarter = new Map<string, number[]>();
      for (const o of M2SL) {
        const [y, m] = o.date.split("-").map(Number);
        const q = `${y}-${String(Math.floor((m - 1) / 3) * 3 + 1).padStart(2, "0")}-01`;
        const arr = byQuarter.get(q);
        if (arr) arr.push(o.value);
        else byQuarter.set(q, [o.value]);
      }
      const out: Obs[] = [];
      for (const o of GDP) {
        const months = byQuarter.get(o.date);
        if (months && months.length > 0) {
          const avg = months.reduce((a, b) => a + b, 0) / months.length;
          out.push({ date: o.date, value: round(o.value / avg, 4) });
        }
      }
      return out;
    },
  },
];

export const CONSTRUCTED_BY_ID = new Map(CONSTRUCTED_SPECS.map((s) => [s.id, s]));
