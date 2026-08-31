"use client";

/**
 * Renders a statsbook appendix table: sticky-header scrollable grid, a year
 * range filter, keyboard-scrollable region, and CSV download of the
 * currently displayed rows.
 */
import { useRef } from "react";
import { useRouter } from "next/navigation";
import type { TableFormat } from "@/lib/statsbook/types";

interface Column {
  key: string;
  label: string;
  format: TableFormat;
}

interface Row {
  year: number;
  values: (number | null)[];
}

function formatCell(format: TableFormat, v: number | null): string {
  if (v === null) return "—";
  switch (format) {
    case "currencyB":
      return v.toLocaleString("en-US", { maximumFractionDigits: 1 });
    case "currency":
      return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
    case "percent":
      return v.toLocaleString("en-US", { maximumFractionDigits: 1 });
    case "index":
      return v.toLocaleString("en-US", { maximumFractionDigits: 1 });
    case "countK":
      return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
    case "count":
      return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
    case "ratio":
      return v.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }
}

export function TableView({
  tableId,
  title,
  columns,
  rows,
  from,
  to,
}: {
  tableId: number;
  title: string;
  columns: Column[];
  rows: Row[];
  from?: number;
  to?: number;
}) {
  const router = useRouter();
  const fromRef = useRef<HTMLInputElement | null>(null);
  const toRef = useRef<HTMLInputElement | null>(null);

  function applyRange(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (fromRef.current?.value) params.set("from", fromRef.current.value);
    if (toRef.current?.value) params.set("to", toRef.current.value);
    router.push(`/statsbook/tables/${tableId}?${params.toString()}`);
  }

  function downloadCsv() {
    const header = ["Year", ...columns.map((c) => `"${c.label.replaceAll('"', '""')}"`)];
    const lines = [header.join(",")];
    for (const row of rows) {
      lines.push(
        [row.year, ...row.values.map((v) => (v === null ? "" : String(v)))].join(",")
      );
    }
    const blob = new Blob([lines.join("\n") + "\n"], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statsbook-table-${tableId}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="filter-bar">
        <form onSubmit={applyRange} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <label>
            <span className="muted small">From </span>
            <input
              type="number"
              min={1929}
              max={2030}
              defaultValue={from ?? ""}
              ref={fromRef}
              aria-label="Start year"
              data-testid="table-from"
            />
          </label>
          <label>
            <span className="muted small">To </span>
            <input
              type="number"
              min={1929}
              max={2030}
              defaultValue={to ?? ""}
              ref={toRef}
              aria-label="End year"
              data-testid="table-to"
            />
          </label>
          <button className="btn btn-small" type="submit" data-testid="table-apply-range">
            Apply
          </button>
        </form>
        <button
          className="btn btn-small"
          type="button"
          onClick={downloadCsv}
          data-testid="table-csv"
        >
          Download CSV
        </button>
        <span className="muted small">{rows.length} years</span>
      </div>

      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label={`Table ${tableId}: ${title} — scrollable data table`}
      >
        <table className="data-table" data-testid={`table-${tableId}`}>
          <thead>
            <tr>
              <th scope="col">Year</th>
              {columns.map((c) => (
                <th scope="col" key={c.key}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.year}>
                <td>{row.year}</td>
                {row.values.map((v, i) => (
                  <td key={columns[i].key} className={v === null ? "na" : ""}>
                    {formatCell(columns[i].format, v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
