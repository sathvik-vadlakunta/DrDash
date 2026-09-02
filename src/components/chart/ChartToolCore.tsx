"use client";

/**
 * The shared interactive chart builder. Used full-size on /dashboard and in
 * compact mode inside lesson TASK steps and statsbook figures.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PanelSeries } from "./ChartPanel";
import { TRANSFORM_LABELS, type TransformType } from "@/lib/transforms";
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

const RANGE_PRESETS = [
  { label: "Max", years: null },
  { label: "50Y", years: 50 },
  { label: "25Y", years: 25 },
  { label: "10Y", years: 10 },
  { label: "5Y", years: 5 },
];

const STARTERS: { label: string; id: string; transform: TransformType }[] = [
  { label: "Real GDP", id: "GDPC1", transform: "LEVEL" },
  { label: "Unemployment rate", id: "UNRATE", transform: "LEVEL" },
  { label: "CPI inflation", id: "CPIAUCSL", transform: "YOY_GROWTH" },
  { label: "Fed funds rate", id: "FEDFUNDS", transform: "LEVEL" },
];

const TRANSFORM_TEACHING: Record<TransformType, string> = {
  LEVEL: `Plotting the raw level series.\n\nGood for seeing long-run trends and absolute sizes, but two series at different scales will overwhelm each other on the same chart.`,
  YOY_GROWTH: `Year-over-year percent change.\n\nStrips the trend and exposes the cycle. The ever-rising level hides whether growth is speeding up or slowing down; percent change makes that visible.`,
  REAL: `Deflated by the PCE price index to remove inflation.\n\nAllows fair comparison of dollar values across decades — 1980 dollars are not the same as 2024 dollars.`,
  PER_CAPITA: `Divided by resident population.\n\nRemoves population growth so per-person quantities are comparable over time and across countries of different sizes.`,
  PCT_OF: `Expressed as a percent of the denominator.\n\nUseful for composition analysis — how large is this sector relative to the whole economy?`,
};

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

function downloadPng(frameEl: HTMLElement | null, title: string | null) {
  if (!frameEl) return;
  const svg = frameEl.querySelector("svg");
  if (!svg) return;
  const { width, height } = svg.getBoundingClientRect();
  const clone = svg.cloneNode(true) as SVGElement;
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  const svgData = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement("canvas");
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) { URL.revokeObjectURL(url); return; }
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(url);
    canvas.toBlob((pngBlob) => {
      if (!pngBlob) return;
      const pngUrl = URL.createObjectURL(pngBlob);
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `${title ?? "dr-dash-chart"}.png`;
      a.click();
      URL.revokeObjectURL(pngUrl);
    }, "image/png");
  };
  img.src = url;
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
  allowedSeriesIds?: string[];
  testIdPrefix?: string;
  extraControls?: React.ReactNode;
}) {
  const catalog = useCatalog();
  const bands = useRecessionBands(value.recessions);
  const { panels, loading, errors } = useSeriesData(value);
  const chartFrameRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [applyScope, setApplyScope] = useState<"all" | "selected">("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const allSeries: CatalogSeries[] = useMemo(
    () => (catalog ? catalog.flatMap((c) => c.series) : []),
    [catalog]
  );
  const byId = useMemo(
    () => new Map(allSeries.map((s) => [s.id, s])),
    [allSeries]
  );

  const addSeries = useCallback(
    (id: string, transform: TransformType = "LEVEL") => {
      if (value.series.length >= 8) return;
      const def = byId.get(id);
      if (!def) return;
      if (
        transform === "LEVEL" &&
        value.series.some((s) => s.id === id && s.transform === "LEVEL")
      )
        return;
      onChange({ ...value, series: [...value.series, { id, transform }] });
    },
    [byId, onChange, value]
  );

  const updateSeries = useCallback(
    (index: number, patch: Partial<ChartSeriesState>) => {
      const series = value.series.map((s, i) => {
        if (i !== index) return s;
        const next = { ...s, ...patch };
        if (next.transform === "PCT_OF" && !next.denominatorId)
          next.denominatorId = "GDP";
        if (next.transform !== "PCT_OF") delete next.denominatorId;
        return next;
      });
      onChange({ ...value, series });
    },
    [onChange, value]
  );

  const removeSeries = useCallback(
    (index: number) => {
      onChange({ ...value, series: value.series.filter((_, i) => i !== index) });
      setSelectedIndex((prev) =>
        prev === index ? null : prev !== null && prev > index ? prev - 1 : prev
      );
    },
    [onChange, value]
  );

  const categoriesToShow: CatalogCategory[] = useMemo(() => {
    if (!catalog) return [];
    let cats = catalog;
    if (allowedSeriesIds) {
      const allowed = new Set(allowedSeriesIds);
      cats = catalog
        .map((c) => ({ ...c, series: c.series.filter((s) => allowed.has(s.id)) }))
        .filter((c) => c.series.length > 0);
    }
    if (!search) return cats;
    const q = search.toLowerCase();
    return cats
      .map((c) => ({
        ...c,
        series: c.series.filter(
          (s) =>
            s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
        ),
      }))
      .filter((c) => c.series.length > 0);
  }, [catalog, allowedSeriesIds, search]);

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

  // Map panel key → original series index so the legend's × button can remove.
  const removeByPanelKey = useCallback(
    (key: string) => {
      const idx = value.series.findIndex((s) => seriesKey(s, value) === key);
      if (idx >= 0) removeSeries(idx);
    },
    [value, removeSeries]
  );

  // Warnings
  const leftUnitClass = panelSeries[0]?.unitClass;
  const leftSeries = panelSeries.filter((s) => s.unitClass === leftUnitClass);
  const mixedUnitsWarning =
    panelSeries.length > 1 &&
    leftSeries.length > 1 &&
    leftSeries.some((s) => s.units !== leftSeries[0].units);

  const nonPositiveCount =
    value.logScale
      ? panelSeries.reduce(
          (n, s) => n + s.points.filter(([, v]) => v <= 0).length,
          0
        )
      : 0;

  const currentYear = new Date().getFullYear();

  // ── Compact mode (lessons / statsbook) ───────────────────────────────
  if (compact) {
    return (
      <div>
        {/* Series chips */}
        <div className="active-series">
          {value.series.map((s, i) => {
            const def = byId.get(s.id);
            const transforms = def?.transforms ?? (["LEVEL"] as TransformType[]);
            return (
              <div
                className="series-chip"
                key={`${s.id}-${i}`}
                data-testid={`${testIdPrefix}-chip-${s.id}`}
              >
                <span className="chip-name">
                  {def?.name ?? s.id}{" "}
                  <span className="fred-id">{s.id}</span>
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
                      onChange={(e) =>
                        updateSeries(i, { denominatorId: e.target.value })
                      }
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

        {/* Controls: recession shading + date range */}
        <div className="chart-controls">
          <label>
            <input
              type="checkbox"
              checked={value.recessions}
              onChange={(e) =>
                onChange({ ...value, recessions: e.target.checked })
              }
              data-testid={`${testIdPrefix}-recessions`}
            />
            Recession shading
          </label>
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
          {loading && <span className="muted small">Loading data…</span>}
          {errors.length > 0 && (
            <span className="error-text" role="alert">
              Some data failed to load: {errors[errors.length - 1]}
            </span>
          )}
          {extraControls}
        </div>

        {/* Chart */}
        <div className="chart-frame" data-testid={`${testIdPrefix}-panel`}>
          <ChartPanel
            series={panelSeries}
            bands={value.recessions ? bands : []}
            height={300}
            logScale={value.logScale}
            onRemoveSeries={removeByPanelKey}
          />
        </div>

        {/* Series picker — all categories expanded in compact mode */}
        <details style={{ marginTop: "0.5rem" }}>
          <summary className="muted small" style={{ cursor: "pointer" }}>
            Add series
          </summary>
          <div className="series-picker" data-testid={`${testIdPrefix}-picker`}>
            {categoriesToShow.map((cat) => (
              <details key={cat.slug} open>
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
          </div>
        </details>
      </div>
    );
  }

  // ── Full 3-panel layout ──────────────────────────────────────────────

  // Teaching copy reflects the most-common transform (or selected series').
  const teachingTransform: TransformType = (() => {
    if (applyScope === "selected" && selectedIndex !== null) {
      return value.series[selectedIndex]?.transform ?? "LEVEL";
    }
    const counts = new Map<TransformType, number>();
    for (const s of value.series)
      counts.set(s.transform, (counts.get(s.transform) ?? 0) + 1);
    let best: TransformType = "LEVEL";
    let bestCount = 0;
    for (const [t, n] of counts) {
      if (n > bestCount) { best = t; bestCount = n; }
    }
    return best;
  })();

  const yearToDateStr = (year: string | undefined, end: boolean) =>
    year ? `${year}-${end ? "12-31" : "01-01"}` : "";
  const dateStrToYear = (s: string): string | undefined =>
    s ? s.slice(0, 4) : undefined;

  // Left panel — catalog
  const leftPanel = (
    <div className="catalog-panel">
      <div className="panel-header">
        <span className="eyebrow">Catalog</span>
        <input
          type="search"
          className="catalog-search"
          placeholder="Search series…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search series catalog"
        />
      </div>
      <div
        className="series-picker catalog-tree"
        data-testid={`${testIdPrefix}-picker`}
      >
        {categoriesToShow.map((cat, i) => (
          <details key={cat.slug} open={!search && i < 2}>
            <summary>
              {cat.label}
              <span className="series-count">{cat.series.length}</span>
            </summary>
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
          <p className="muted small" style={{ padding: "0.75rem 0.9rem" }}>
            {search ? "No series match your search." : "Loading catalog…"}
          </p>
        )}
      </div>
    </div>
  );

  // Toolbar
  const toolbar = (
    <div className="chart-toolbar">
      <div className="toolbar-presets">
        {RANGE_PRESETS.map((p) => (
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
      <div className="toolbar-dates">
        <label className="toolbar-date-label">
          <span>Start</span>
          <input
            type="date"
            className="toolbar-date-input"
            value={yearToDateStr(value.from, false)}
            onChange={(e) =>
              onChange({ ...value, from: dateStrToYear(e.target.value) })
            }
            aria-label="Start date"
          />
        </label>
        <label className="toolbar-date-label">
          <span>End</span>
          <input
            type="date"
            className="toolbar-date-input"
            value={yearToDateStr(value.to, true)}
            onChange={(e) =>
              onChange({ ...value, to: dateStrToYear(e.target.value) })
            }
            aria-label="End date"
          />
        </label>
      </div>
      <div className="toolbar-checks">
        <label>
          <input
            type="checkbox"
            checked={value.recessions}
            onChange={(e) =>
              onChange({ ...value, recessions: e.target.checked })
            }
            data-testid={`${testIdPrefix}-recessions`}
          />
          Recessions
        </label>
        <label>
          <input
            type="checkbox"
            checked={value.logScale}
            onChange={(e) =>
              onChange({ ...value, logScale: e.target.checked })
            }
            data-testid={`${testIdPrefix}-logscale`}
          />
          Log scale
        </label>
      </div>
      <div className="toolbar-actions">
        <button
          type="button"
          className="btn btn-small"
          disabled={panelSeries.length === 0}
          onClick={() => downloadCsv(panelSeries, null)}
          data-testid={`${testIdPrefix}-csv`}
        >
          CSV
        </button>
        <button
          type="button"
          className="btn btn-small"
          disabled={panelSeries.length === 0}
          onClick={() => downloadPng(chartFrameRef.current, null)}
          data-testid={`${testIdPrefix}-png`}
        >
          PNG
        </button>
        {extraControls}
      </div>
      {loading && <span className="muted small">Loading…</span>}
      {errors.length > 0 && (
        <span className="error-text" role="alert">
          {errors[errors.length - 1]}
        </span>
      )}
      {mixedUnitsWarning && (
        <span className="toolbar-warning" role="alert">
          Mixed units on left axis — values may not be directly comparable.
        </span>
      )}
      {nonPositiveCount > 0 && (
        <span className="toolbar-warning" role="alert">
          Log scale: {nonPositiveCount} non-positive value
          {nonPositiveCount === 1 ? "" : "s"} hidden.
        </span>
      )}
    </div>
  );

  const isEmpty = value.series.length === 0;

  // Center panel
  const centerPanel = (
    <div className="chart-center">
      {toolbar}
      <div className="chart-body">
        {isEmpty ? (
          <div className="chart-empty-state">
            <p className="chart-empty-headline">
              Pick a category, then a series.
            </p>
            <p className="muted small">← The catalog is on the left.</p>
            <div className="starter-btns">
              {STARTERS.map((s) => (
                <button
                  key={`${s.id}-${s.transform}`}
                  type="button"
                  className="btn starter-btn"
                  onClick={() =>
                    onChange({
                      ...value,
                      series: [{ id: s.id, transform: s.transform }],
                    })
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div
              className="active-series"
              style={{ padding: "0.5rem 0.6rem 0", margin: 0 }}
            >
              {value.series.map((s, i) => {
                const def = byId.get(s.id);
                return (
                  <div
                    key={`${s.id}-${i}`}
                    className={`series-chip${selectedIndex === i ? " series-chip-selected" : ""}`}
                    data-testid={`${testIdPrefix}-chip-${s.id}`}
                    onClick={() =>
                      setSelectedIndex(selectedIndex === i ? null : i)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <span
                      className="chip-color-dot"
                      style={{
                        background: `var(--series-${(i % 8) + 1})`,
                      }}
                    />
                    <span className="chip-name">
                      {def?.name ?? s.id}{" "}
                      <span className="fred-id">{s.id}</span>
                    </span>
                    <button
                      type="button"
                      className="remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSeries(i);
                      }}
                      aria-label={`Remove ${s.id}`}
                      data-testid={`${testIdPrefix}-remove-${s.id}`}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
            <div
              className="chart-frame"
              ref={chartFrameRef}
              data-testid={`${testIdPrefix}-panel`}
              style={{ flex: 1, margin: "0.5rem 0.6rem" }}
            >
              <ChartPanel
                series={panelSeries}
                bands={value.recessions ? bands : []}
                height={440}
                logScale={value.logScale}
                onRemoveSeries={removeByPanelKey}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Transform rows — filtered by scope
  const transformRows = value.series
    .map((s, i) => ({ s, i }))
    .filter(
      ({ i }) =>
        applyScope === "all" ||
        (applyScope === "selected" && i === selectedIndex)
    );

  // Right panel — transforms + teaching copy
  const rightPanel = (
    <div className="transforms-panel">
      <div className="panel-header">
        <span className="eyebrow">Apply To</span>
        <div className="scope-toggle">
          <button
            type="button"
            className={`scope-btn${applyScope === "all" ? " scope-btn-active" : ""}`}
            onClick={() => setApplyScope("all")}
          >
            All series
          </button>
          <button
            type="button"
            className={`scope-btn${applyScope === "selected" ? " scope-btn-active" : ""}`}
            onClick={() => setApplyScope("selected")}
          >
            Selected
          </button>
        </div>
      </div>
      <div className="transforms-body">
        {value.series.length === 0 ? (
          <p className="muted small" style={{ padding: "0.75rem 0.9rem" }}>
            Plot a series to transform it.
          </p>
        ) : applyScope === "selected" && selectedIndex === null ? (
          <p className="muted small" style={{ padding: "0.75rem 0.9rem" }}>
            Click a series chip to select it.
          </p>
        ) : (
          transformRows.map(({ s, i }) => {
            const def = byId.get(s.id);
            const transforms = def?.transforms ?? (["LEVEL"] as TransformType[]);
            return (
              <div key={`${s.id}-${i}`} className="transform-row">
                <div className="transform-row-head">
                  <span
                    className="chip-color-dot"
                    style={{ background: `var(--series-${(i % 8) + 1})` }}
                  />
                  <span className="transform-series-name">
                    {def?.name ?? s.id}
                  </span>
                </div>
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
                {s.transform === "PCT_OF" && (
                  <select
                    value={s.denominatorId ?? "GDP"}
                    onChange={(e) =>
                      updateSeries(i, { denominatorId: e.target.value })
                    }
                    aria-label={`Denominator for ${s.id}`}
                    data-testid={`${testIdPrefix}-denom-${s.id}`}
                    style={{ marginTop: "0.25rem" }}
                  >
                    {DENOMINATOR_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })
        )}
        {value.series.length > 0 && (
          <div className="teaching-copy">
            <pre className="teaching-pre">
              {TRANSFORM_TEACHING[teachingTransform]}
            </pre>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard-3panel">
      {leftPanel}
      {centerPanel}
      {rightPanel}
    </div>
  );
}

export type { ChartState };

/**
 * Year input that only commits a complete 4-digit year (or empty) to chart
 * state — partial keystrokes do not trigger fetches or bogus date filters.
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
  useEffect(() => { setDraft(value ?? ""); }, [value]);
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
        style={{ width: "5.2rem" }}
        aria-label={`${label} year`}
      />
    </label>
  );
}
