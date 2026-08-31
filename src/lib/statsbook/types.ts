/**
 * Types for the Statsbook Tab — the interactive mirror of the professor's
 * Statsbook 2025–2026 reference document (~50 figures, 17 appendix tables).
 */
import type { ChartSeriesState } from "@/lib/dashboard/urlState";
import type { TransformType } from "@/lib/transforms";

export type FigureCategory =
  | "output"
  | "income"
  | "prices"
  | "money"
  | "government"
  | "trade"
  | "labor"
  | "productivity"
  | "distribution";

export const FIGURE_CATEGORY_LABELS: Record<FigureCategory, string> = {
  output: "Output",
  income: "Income & Saving",
  prices: "Prices & Interest Rates",
  money: "Money",
  government: "Government",
  trade: "International Trade",
  labor: "Labor Market",
  productivity: "Productivity & Costs",
  distribution: "Income Distribution",
};

export interface StatsbookFigure {
  /** Figure number in the printed statsbook (1–50). */
  id: number;
  title: string;
  /** Short description drawn from the statsbook's explanatory paragraph. */
  description: string;
  /** Chart config that reproduces the figure as a live Dr. Dash chart. */
  series: ChartSeriesState[];
  recessions?: boolean;
  /** Optional start year when the full history would obscure the point. */
  from?: string;
  /** The appendix table underlying this figure, if any (1–17). */
  tableRef?: number;
  category: FigureCategory;
}

export type TableFormat =
  | "currencyB" // billions of dollars, e.g. 29,185
  | "currency" // plain dollars, e.g. 85,784
  | "percent" // 12.1
  | "index" // 112.5
  | "countK" // thousands of persons
  | "count" // plain count
  | "ratio"; // 2.15

export interface TableColumnSource {
  seriesId: string;
  transform?: TransformType; // default LEVEL
  denominatorId?: string; // for PCT_OF
  /**
   * Rebase an inflation-adjusted series so its latest full year equals the
   * nominal value (i.e. express it in latest-year dollars, as the printed
   * statsbook does). Uses the GDP deflator.
   */
  rebaseToLatestYear?: boolean;
}

export interface StatsbookTableColumn {
  key: string;
  label: string;
  /** Absent only in fully static tables (Table 3). */
  source?: TableColumnSource;
  format: TableFormat;
}

export interface StatsbookTableDef {
  /** Table number in the statsbook appendix (1–17). */
  id: number;
  title: string;
  description: string;
  columns: StatsbookTableColumn[];
  /**
   * Static single-year snapshot (Table 3 — Disposition of GNP as Income) —
   * rendered as label/value rows from seed data, not from FRED.
   */
  static?: {
    year: number;
    rows: { label: string; value: string }[];
  };
  /**
   * Columns from the printed table whose FRED source has been identified but
   * is not yet seeded in the catalog. Shown as a footnote.
   */
  identifiedSources?: { label: string; fredId: string }[];
  notes?: string;
}
