"use client";

/**
 * The shared interactive chart builder. Used full-size on /dashboard and in
 * compact mode inside lesson TASK steps and statsbook figures.
 */
import { useCallback, useMemo } from "react";
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
  const { panels, loading } = useSeriesData(value);

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

  const controls = (
    <div className="chart-controls">
      <label>
        <input
          type="checkbox"
          checked={value.recessions}
          onChange={(e) => onChange({ ...value, recessions: e.target.checked })}
          data-testid={`${testIdPrefix}-recessions`}
        />
        Recession shading
      </label>
      <label>
        From
        <input
          type="number"
          min={1850}
          max={2030}
          placeholder="1947"
          value={value.from ?? ""}
          onChange={(e) =>
            onChange({ ...value, from: e.target.value || undefined })
          }
          aria-label="Start year"
        />
      </label>
      <label>
        To
        <input
          type="number"
          min={1850}
          max={2030}
          placeholder="now"
          value={value.to ?? ""}
          onChange={(e) => onChange({ ...value, to: e.target.value || undefined })}
          aria-label="End year"
        />
      </label>
      {loading && <span className="muted small">Loading data…</span>}
      {extraControls}
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

  const chart = (
    <div className="chart-frame" data-testid={`${testIdPrefix}-panel`}>
      <ChartPanel
        series={panelSeries}
        bands={value.recessions ? bands : []}
        height={compact ? 300 : 440}
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

export type { ChartState };
