"use client";

/**
 * The recharts renderer used by the Chart Tool, lesson tasks, and statsbook
 * figures. Handles date-scaled x-axis, up to two unit-grouped y-axes (dual
 * axis), and NBER recession shading.
 */
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
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
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#7c3aed",
  "#ea580c",
  "#0d9488",
  "#db2777",
  "#ca8a04",
];

function formatValue(v: number): string {
  const abs = Math.abs(v);
  const digits = abs >= 1000 ? 0 : abs >= 10 ? 1 : 2;
  return v.toLocaleString("en-US", { maximumFractionDigits: digits });
}

function yearOf(ms: number): string {
  return new Date(ms).getUTCFullYear().toString();
}

function monthLabel(ms: number): string {
  const d = new Date(ms);
  return `${d.toLocaleString("en-US", { month: "short", timeZone: "UTC" })} ${d.getUTCFullYear()}`;
}

export function ChartPanel({
  series,
  bands = [],
  height = 420,
}: {
  series: PanelSeries[];
  bands?: PanelBand[];
  height?: number;
}) {
  if (series.length === 0 || series.every((s) => s.points.length === 0)) {
    return (
      <div className="chart-empty" style={{ height }}>
        Add a series to start charting.
      </div>
    );
  }

  // Merge all series into rows keyed by timestamp.
  const rows = new Map<number, Record<string, number>>();
  for (const s of series) {
    for (const [t, v] of s.points) {
      let row = rows.get(t);
      if (!row) {
        row = { t };
        rows.set(t, row);
      }
      row[s.key] = v;
    }
  }
  const data = [...rows.values()].sort((a, b) => a.t - b.t);
  const tMin = data[0].t;
  const tMax = data[data.length - 1].t;

  // Axis assignment: the first series' unit class owns the left axis; the
  // first differing class owns the right; further classes share the right.
  const leftClass = series[0].unitClass;
  const rightClass = series.find((s) => s.unitClass !== leftClass)?.unitClass;
  const axisFor = (s: PanelSeries) => (s.unitClass === leftClass ? "left" : "right");

  const labelByKey = new Map(series.map((s) => [s.key, s.label]));

  const visibleBands = bands
    .map((b) => ({ start: Math.max(b.start, tMin), end: Math.min(b.end, tMax) }))
    .filter((b) => b.start < b.end);

  return (
    <div role="img" aria-label={`Chart of ${series.map((s) => s.label).join(", ")}`}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 4 }}>
          <CartesianGrid stroke="#eef2f7" vertical={false} />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={[tMin, tMax]}
            tickFormatter={yearOf}
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickCount={9}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={formatValue}
            tick={{ fontSize: 11, fill: "#64748b" }}
            width={62}
            domain={["auto", "auto"]}
          />
          {rightClass && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={formatValue}
              tick={{ fontSize: 11, fill: "#64748b" }}
              width={62}
              domain={["auto", "auto"]}
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
          <Tooltip
            labelFormatter={(t) => monthLabel(t as number)}
            formatter={(value, name) => [
              formatValue(value as number),
              labelByKey.get(name as string) ?? name,
            ]}
            contentStyle={{ fontSize: 12, borderRadius: 6 }}
          />
          <Legend
            formatter={(key) => labelByKey.get(key as string) ?? key}
            wrapperStyle={{ fontSize: 12 }}
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
  );
}
