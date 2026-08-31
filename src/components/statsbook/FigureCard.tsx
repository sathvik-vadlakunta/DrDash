"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { StatsbookFigure } from "@/lib/statsbook/types";
import { dashboardHref, type ChartState } from "@/lib/dashboard/urlState";
import { ChartPanel } from "@/components/chart/ChartPanel";
import {
  seriesKey,
  transformLabelForUI,
  useRecessionBands,
  useSeriesData,
} from "@/components/chart/useChartData";

export function FigureCard({ figure }: { figure: StatsbookFigure }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setInView(true);
      },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [inView]);

  const state: ChartState = {
    series: figure.series,
    recessions: !!figure.recessions,
    from: figure.from,
  };

  return (
    <div className="figure-card" ref={ref} data-testid={`figure-${figure.id}`}>
      <span className="fig-num">FIGURE {figure.id}</span>
      <h3>{figure.title}</h3>
      <p className="muted small" style={{ margin: 0 }}>
        {figure.description}
      </p>
      {inView ? (
        <FigureChart state={state} />
      ) : (
        <div className="chart-empty" style={{ height: 220 }}>
          …
        </div>
      )}
      <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
        <Link
          className="btn btn-small"
          href={dashboardHref(state)}
          data-testid={`figure-${figure.id}-open`}
        >
          Open in Chart Tool
        </Link>
        {figure.tableRef && (
          <Link className="muted small" href={`/statsbook/tables/${figure.tableRef}`}>
            Data: Table {figure.tableRef}
          </Link>
        )}
      </div>
    </div>
  );
}

function FigureChart({ state }: { state: ChartState }) {
  const { panels } = useSeriesData(state);
  const bands = useRecessionBands(state.recessions);
  const series = state.series
    .map((s) => panels.get(seriesKey(s, state)))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({
      key: p.key,
      label: `${p.name} (${transformLabelForUI(p.transform)})`,
      units: p.units,
      unitClass: p.unitClass,
      points: p.points,
    }));
  return (
    <ChartPanel series={series} bands={state.recessions ? bands : []} height={220} />
  );
}
