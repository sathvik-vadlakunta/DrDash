"use client";

/**
 * The recharts renderer. Handles: LTTB downsampling (>2000 pts → 1500),
 * period-aware tooltip, keyboard navigation (Arrow/Home/End/PageUp/PageDown),
 * custom legend chips, dual Y-axis, and NBER recession shading.
 */
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface PanelSeries {
  key: string;
  label: string;
  units: string;
  unitClass: string;
  /** [epoch ms, value] pairs, ascending. */
  points: [number, number][];
}

export interface PanelBand {
  start: number;
  end: number;
}

export const CHART_COLORS = [
  "#0072B2",
  "#D55E00",
  "#009E73",
  "#CC79A7",
  "#E69F00",
  "#56B4E9",
  "#F0E442",
  "#000000",
];

function formatValue(v: number): string {
  const abs = Math.abs(v);
  const digits = abs >= 1000 ? 0 : abs >= 10 ? 1 : 2;
  return v.toLocaleString("en-US", { maximumFractionDigits: digits });
}

// ── Frequency detection ────────────────────────────────────────────────
type Freq = "annual" | "quarterly" | "monthly" | "weekly" | "daily";

function detectFreq(gapMs: number): Freq {
  const days = gapMs / 86_400_000;
  if (days > 300) return "annual";
  if (days > 80) return "quarterly";
  if (days > 20) return "monthly";
  if (days > 4) return "weekly";
  return "daily";
}

const FREQ_BADGE: Record<Freq, string> = {
  annual: "A", quarterly: "Q", monthly: "M", weekly: "W", daily: "D",
};

const PERIODS_PER_YEAR: Record<Freq, number> = {
  annual: 1, quarterly: 4, monthly: 12, weekly: 52, daily: 365,
};

function formatPeriod(ms: number, freq: Freq): string {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  switch (freq) {
    case "annual": return String(y);
    case "quarterly": return `${y} Q${Math.ceil(m / 3)}`;
    case "monthly":
      return `${d.toLocaleString("en-US", { month: "short", timeZone: "UTC" })} ${y}`;
    case "weekly": {
      const d2 = d.toLocaleString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
      return `Wk ${d2}, ${y}`;
    }
    default: {
      const d2 = d.toLocaleString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
      return `${d2}, ${y}`;
    }
  }
}

// ── LTTB downsampler ───────────────────────────────────────────────────
function lttb(pts: [number, number][], threshold: number): [number, number][] {
  const n = pts.length;
  if (n <= threshold) return pts;
  const result: [number, number][] = [pts[0]];
  const bucketSize = (n - 2) / (threshold - 2);
  for (let i = 0; i < threshold - 2; i++) {
    const from = Math.floor((i + 1) * bucketSize) + 1;
    const to = Math.min(Math.floor((i + 2) * bucketSize) + 1, n - 1);
    const nf = Math.floor((i + 2) * bucketSize) + 1;
    const nt = Math.min(Math.floor((i + 3) * bucketSize) + 1, n - 1);
    let ax2 = 0, ay2 = 0, cnt = 0;
    for (let j = nf; j < nt; j++) { ax2 += pts[j][0]; ay2 += pts[j][1]; cnt++; }
    if (cnt === 0) { ax2 = pts[nt][0]; ay2 = pts[nt][1]; }
    else { ax2 /= cnt; ay2 /= cnt; }
    const [ax, ay] = result[result.length - 1];
    let maxArea = -1, picked = from;
    for (let j = from; j < to; j++) {
      const area = Math.abs((ax - ax2) * (pts[j][1] - ay) - (ax - pts[j][0]) * (ay2 - ay));
      if (area > maxArea) { maxArea = area; picked = j; }
    }
    result.push(pts[picked]);
  }
  result.push(pts[n - 1]);
  return result;
}

// ── Custom tooltip ─────────────────────────────────────────────────────
function ChartTooltip({
  active,
  payload,
  label,
  freq,
  labelByKey,
  colorByKey,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
  label?: number;
  freq: Freq;
  labelByKey: Map<string, string>;
  colorByKey: Map<string, string>;
}) {
  if (!active || !payload?.length || label == null) return null;
  const valid = payload.filter((p) => p.value != null && !Number.isNaN(p.value));
  if (!valid.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-period">{formatPeriod(label, freq)}</div>
      {valid.map((p) => (
        <div key={p.dataKey} className="chart-tooltip-row">
          <span
            className="chart-tooltip-dot"
            style={{ background: colorByKey.get(p.dataKey) ?? "#888" }}
          />
          <span className="chart-tooltip-lbl">
            {labelByKey.get(p.dataKey) ?? p.dataKey}
          </span>
          <span className="chart-tooltip-val">{formatValue(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────
export function ChartPanel({
  series,
  bands = [],
  height = 420,
  logScale = false,
  onRemoveSeries,
}: {
  series: PanelSeries[];
  bands?: PanelBand[];
  height?: number;
  logScale?: boolean;
  /** Called with the series key when the user clicks × in the legend. */
  onRemoveSeries?: (key: string) => void;
}) {
  const [cursorIdx, setCursorIdx] = useState<number | null>(null);

  // Dedupe
  const seen = new Set<string>();
  series = series.filter((s) => {
    if (seen.has(s.key)) return false;
    seen.add(s.key);
    return true;
  });

  if (series.length === 0 || series.every((s) => s.points.length === 0)) {
    return (
      <div className="chart-empty" style={{ height }}>
        Add a series to start charting.
      </div>
    );
  }

  // Merge downsampled series into row objects keyed by timestamp
  const rows = new Map<number, Record<string, number>>();
  for (const s of series) {
    const pts = lttb(s.points, 1500);
    for (const [t, v] of pts) {
      let row = rows.get(t);
      if (!row) { row = { t }; rows.set(t, row); }
      row[s.key] = v;
    }
  }
  const data = [...rows.values()].sort((a, b) => a.t - b.t);
  const tMin = data[0].t;
  const tMax = data[data.length - 1].t;

  // Frequency
  const refSeries = series.find((s) => s.points.length >= 2);
  const freq = refSeries
    ? detectFreq(refSeries.points[1][0] - refSeries.points[0][0])
    : "monthly";

  // Axis assignment: first unitClass → left, first differing class → right
  const leftClass = series[0].unitClass;
  const rightClass = series.find((s) => s.unitClass !== leftClass)?.unitClass;
  const axisFor = (s: PanelSeries) => (s.unitClass === leftClass ? "left" : "right");

  const labelByKey = new Map(series.map((s) => [s.key, s.label]));
  const colorByKey = new Map(
    series.map((s, i) => [s.key, CHART_COLORS[i % CHART_COLORS.length]])
  );

  const visibleBands = bands
    .map((b) => ({ start: Math.max(b.start, tMin), end: Math.min(b.end, tMax) }))
    .filter((b) => b.start < b.end);

  const periodsPerYear = PERIODS_PER_YEAR[freq];
  const cursorPt = cursorIdx !== null ? data[cursorIdx] : null;

  function handleKeyDown(e: React.KeyboardEvent) {
    const n = data.length;
    if (n === 0) return;
    const nav: Record<string, () => void> = {
      ArrowLeft: () => setCursorIdx((p) => p === null ? n - 1 : Math.max(0, p - 1)),
      ArrowRight: () => setCursorIdx((p) => p === null ? 0 : Math.min(n - 1, p + 1)),
      Home: () => setCursorIdx(0),
      End: () => setCursorIdx(n - 1),
      PageUp: () => setCursorIdx((p) => p === null ? 0 : Math.max(0, p - periodsPerYear)),
      PageDown: () => setCursorIdx((p) => p === null ? n - 1 : Math.min(n - 1, p + periodsPerYear)),
    };
    if (nav[e.key]) { e.preventDefault(); nav[e.key](); }
  }

  const ariaAnnouncement = cursorPt
    ? `${formatPeriod(cursorPt.t, freq)}: ${series
        .map((s) => {
          const v = cursorPt[s.key];
          return `${labelByKey.get(s.key)}: ${v != null ? formatValue(v) : "no data"}`;
        })
        .join(", ")}`
    : undefined;

  return (
    <div>
      {/* Chart */}
      <div
        role="img"
        aria-label={`Chart of ${series.map((s) => s.label).join(", ")}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (cursorIdx === null) setCursorIdx(Math.floor(data.length / 2)); }}
        onBlur={() => setCursorIdx(null)}
        style={{ outline: "none" }}
      >
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 4 }}>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={[tMin, tMax]}
              tickFormatter={(t) => String(new Date(t).getUTCFullYear())}
              tick={{ fontSize: 11, fill: "#56697B" }}
              tickCount={9}
            />
            <YAxis
              yAxisId="left"
              scale={logScale ? "log" : "linear"}
              tickFormatter={formatValue}
              tick={{ fontSize: 11, fill: "#56697B" }}
              width={62}
              domain={["auto", "auto"]}
              allowDataOverflow={logScale}
            />
            {rightClass && (
              <YAxis
                yAxisId="right"
                orientation="right"
                scale={logScale ? "log" : "linear"}
                tickFormatter={formatValue}
                tick={{ fontSize: 11, fill: "#56697B" }}
                width={62}
                domain={["auto", "auto"]}
                allowDataOverflow={logScale}
              />
            )}
            {visibleBands.map((b, i) => (
              <ReferenceArea
                key={i}
                yAxisId="left"
                x1={b.start}
                x2={b.end}
                fill="#94a3b8"
                fillOpacity={0.16}
                strokeOpacity={0}
                ifOverflow="extendDomain"
              />
            ))}
            {cursorPt && (
              <ReferenceLine
                yAxisId="left"
                x={cursorPt.t}
                stroke="var(--focus, #0A84FF)"
                strokeWidth={1.5}
                strokeDasharray="4 2"
              />
            )}
            <Tooltip
              content={(props) => (
                <ChartTooltip
                  {...(props as Parameters<typeof ChartTooltip>[0])}
                  freq={freq}
                  labelByKey={labelByKey}
                  colorByKey={colorByKey}
                />
              )}
            />
            {series.map((s, i) => (
              <Line
                key={s.key}
                dataKey={s.key}
                yAxisId={rightClass ? axisFor(s) : "left"}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                dot={false}
                strokeWidth={1.7}
                connectNulls
                isAnimationActive={false}
                type="linear"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Aria-live keyboard cursor announcements */}
      <span className="sr-only" aria-live="polite">
        {ariaAnnouncement}
      </span>

      {/* Custom legend */}
      <div className="chart-legend" role="list">
        {series.map((s, i) => (
          <div key={s.key} className="chart-legend-chip" role="listitem">
            <span
              className="chart-legend-bar"
              style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
            />
            <span className="chart-legend-freq">{FREQ_BADGE[freq]}</span>
            <span className="chart-legend-lbl" title={s.label}>
              {s.label.length > 52 ? `${s.label.slice(0, 50)}…` : s.label}
            </span>
            {onRemoveSeries && (
              <button
                type="button"
                className="chart-legend-remove"
                onClick={() => onRemoveSeries(s.key)}
                aria-label={`Remove ${s.label} from chart`}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
