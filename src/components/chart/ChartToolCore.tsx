"use client";

/**
 * The shared interactive chart builder. Used full-size on /dashboard and in
 * compact mode inside lesson TASK steps and statsbook figures.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PanelSeries } from "./ChartPanel";
import {
  TRANSFORM_LABELS,
  type TransformType,
} from "@/lib/transforms";
import {
  transformLabelForUI,
  type CatalogCategory,
  type CatalogSeries,
  useCatalog,
  useRecessionBands,
  useSeriesData,
  seriesKey,
} from "./useChartData";
import type { ChartSeriesState, ChartState } from "@/lib/dashboard/urlState";
import { ChartPanel } from "./ChartPanel";

const DENOMINATOR_OPTIONS = ["GDP", "GDPC1", "DSPI", "PCEC"];

const DATE_PRESETS = [
  { label: "1Y", years: 1 },
  { label: "5Y", years: 5 },
  { label: "10Y", years: 10 },
  { label: "20Y", years: 20 },
  { label: "All", years: null },
];

function downloadCsv(panelSeries: PanelSeries[], title: string | null) {
  if (panelSeries.length === 0) return;
  const allDates = [
    ...new Set(panelSeries.flatMap((s) => s.points.map(([t]) => t))),
  ].sort((a, b) => a - b);
  const header = ["date", ...panelSeries.map((s) => s.label)].join(",");
  const rows = allDates.map((t) => {
    const d = new Date(t).toISOString().slice(0, 10);
    const vals = panelSeries.map((s) => {
      const pt = s.points.find(([pt]) => pt === t);
      return pt !== undefined ? String(pt[1]) : "";
    });
    return [d, ...vals].join(",");
  });
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title ?? "dr-dash-chart"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ChartToolCore({
  value,
  onChange,
  compact = false,
  allowedSeriesIds,
  testIdPrefix = "chart",
  extraControls,
}: {
  value: ChartState;
  onChange: (next: ChartState) => void;
  compact?: boolean;
  /** Restrict the picker to these ids (lesson tasks). */
  allowedSeriesIds?: string[];
  testIdPrefix?: string;
  extraControls?: React.ReactNode;
}) {
  const catalog = useCatalog();
  const bands = useRecessionBands(value.recessions);
  const { panels, loading, errors } = useSeriesData(value);

  const allSeries: CatalogSeries[] = useMemo(
    () => (catalog ? catalog.flatMap((c) => c.series) : []),
    [catalog]
  );
  const byId = useMemo(
    () => new Map(allSeries.map((s) => [s.id, s])),
    [allSeries]
  );

  const addSeries = useCallback(
    (id: string) => {
      if (value.series.length >= 8) return;
      const def = byId.get(id);
      if (!def) return;
      // Adding the same series twice at LEVEL would render duplicate lines;
      // to compare two transforms of one series, add it once and duplicate
      // via a different transform instead.
      if (value.series.some((s) => s.id === id && s.transform === "LEVEL")) return;
      onChange({
        ...value,
        series: [...value.series, { id, transform: "LEVEL" }],
      });
    },
    [byId, onChange, value]
  );

  const updateSeries = (index: number, patch: Partial<ChartSeriesState>) => {
    const series = value.series.map((s, i) => {
      if (i !== index) return s;
      const next = { ...s, ...patch };
      if (next.transform === "PCT_OF" && !next.denominatorId) {
        next.denominatorId = "GDP";
      }
      if (next.transform !== "PCT_OF") delete next.denominatorId;
      return next;
    });
    onChange({ ...value, series });
  };

  const removeSeries = (index: number) => {
    onChange({ ...value, series: value.series.filter((_, i) => i !== index) });
  };

  const categoriesToShow: CatalogCategory[] = useMemo(() => {
    if (!catalog) return [];
    if (!allowedSeriesIds) return catalog;
    const allowed = new Set(allowedSeriesIds);
    return catalog
      .map((c) => ({ ...c, series: c.series.filter((s) => allowed.has(s.id)) }))
      .filter((c) => c.series.length > 0);
  }, [catalog, allowedSeriesIds]);

  const picker = (
    <div className="series-picker" data-testid={`${testIdPrefix}-picker`}>
      {categoriesToShow.map((cat, i) => (
        <details key={cat.slug} open={compact || i < 2}>
          <summary>{cat.label}</summary>
          {cat.series.map((s) => (
            <button
              key={s.id}
              type="button"
              className="series-item"
              onClick={() => addSeries(s.id)}
              disabled={value.series.length >= 8}
              data-testid={`${testIdPrefix}-add-${s.id}`}
              title={s.description}
            >
              {s.name} <span className="fred-id">{s.id}</span>
            </button>
          ))}
        </details>
      ))}
      {categoriesToShow.length === 0 && (
        <p className="muted small" style={{ padding: "0.6rem 0.8rem" }}>
          Loading catalog…
        </p>
      )}
    </div>
  );

  const chips = (
    <div className="active-series">
      {value.series.map((s, i) => {
        const def = byId.get(s.id);
        const transforms = def?.transforms ?? ["LEVEL"];
        return (
          <div className="series-chip" key={`${s.id}-${i}`} data-testid={`${testIdPrefix}-chip-${s.id}`}>
            <span className="chip-name">
              {def?.name ?? s.id} <span className="fred-id">{s.id}</span>
            </span>
            <label>
              <span className="muted small">Transform </span>
              <select
                value={s.transform}
                onChange={(e) =>
                  updateSeries(i, { transform: e.target.value as TransformType })
                }
                aria-label={`Transform for ${s.id}`}
                data-testid={`${testIdPrefix}-transform-${s.id}`}
              >
                {transforms.map((t) => (
                  <option key={t} value={t}>
                    {TRANSFORM_LABELS[t as TransformType]}
                  </option>
                ))}
              </select>
            </label>
            {s.transform === "PCT_OF" && (
              <label>
                <span className="muted small">of </span>
                <select
                  value={s.denominatorId ?? "GDP"}
                  onChange={(e) => updateSeries(i, { denominatorId: e.target.value })}
                  aria-label={`Denominator for ${s.id}`}
                  data-testid={`${testIdPrefix}-denom-${s.id}`}
                >
                  {DENOMINATOR_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button
              type="button"
              className="remove"
              onClick={() => removeSeries(i)}
              aria-label={`Remove ${s.id}`}
              data-testid={`${testIdPrefix}-remove-${s.id}`}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );

  const panelSeries = value.series
    .map((s) => panels.get(seriesKey(s, value)))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({
      key: p.key,
      label: `${p.name} (${transformLabelForUI(p.transform)})`,
      units: p.units,
      unitClass: p.unitClass,
      points: p.points,
    }));

  const currentYear = new Date().getFullYear();

  const controls = (
    <div className="chart-controls">
      <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
        {DATE_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className="btn btn-small"
            onClick={() =>
              onChange({
                ...value,
                from: p.years ? String(currentYear - p.years) : undefined,
                to: undefined,
              })
            }
          >
            {p.label}
          </button>
        ))}
      </div>
      <YearInput
        label="From"
        placeholder="1947"
        value={value.from}
        onCommit={(from) => onChange({ ...value, from })}
      />
      <YearInput
        label="To"
        placeholder="now"
        value={value.to}
        onCommit={(to) => onChange({ ...value, to })}
      />
      <label>
        <input
          type="checkbox"
          checked={value.recessions}
          onChange={(e) => onChange({ ...value, recessions: e.target.checked })}
          data-testid={`${testIdPrefix}-recessions`}
        />
        Recessions
      </label>
      <label>
        <input
          type="checkbox"
          checked={value.logScale}
          onChange={(e) => onChange({ ...value, logScale: e.target.checked })}
          data-testid={`${testIdPrefix}-logscale`}
        />
        Log scale
      </label>
      <button
        type="button"
        className="btn btn-small"
        disabled={panelSeries.length === 0}
        onClick={() => downloadCsv(panelSeries, null)}
        data-testid={`${testIdPrefix}-csv`}
      >
        Download CSV
      </button>
      {loading && <span className="muted small">Loading…</span>}
      {errors.length > 0 && (
        <span className="error-text" role="alert">
          {errors[errors.length - 1]}
        </span>
      )}
      {extraControls}
    </div>
  );

  const chart = (
    <div className="chart-frame" data-testid={`${testIdPrefix}-panel`}>
      <ChartPanel
        series={panelSeries}
        bands={value.recessions ? bands : []}
        height={compact ? 300 : 440}
        logScale={value.logScale}
      />
    </div>
  );

  if (compact) {
    return (
      <div>
        {chips}
        {controls}
        {chart}
        <details style={{ marginTop: "0.5rem" }}>
          <summary className="muted small" style={{ cursor: "pointer" }}>
            Add series
          </summary>
          {picker}
        </details>
      </div>
    );
  }

  return (
    <div className="chart-layout">
      {picker}
      <div>
        {chips}
        {controls}
        {chart}
      </div>
    </div>
  );
}

/**
 * Year input that only commits complete 4-digit years (or empty) to chart
 * state — partial keystrokes must not trigger fetches or bogus date filters.
 */
function YearInput({
  label,
  placeholder,
  value,
  onCommit,
}: {
  label: string;
  placeholder: string;
  value: string | undefined;
  onCommit: (year: string | undefined) => void;
}) {
  const [draft, setDraft] = useState(value ?? "");
  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);
  return (
    <label>
      {label}
      <input
        type="number"
        min={1850}
        max={2030}
        placeholder={placeholder}
        value={draft}
        onChange={(e) => {
          const next = e.target.value;
          setDraft(next);
          if (next === "") onCommit(undefined);
          else if (/^\d{4}$/.test(next)) onCommit(next);
        }}
        aria-label={`${label === "From" ? "Start" : "End"} year`}
      />
    </label>
  );
}

export type { ChartState };
