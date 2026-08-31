"use client";

/**
 * The Figures tab: all ~50 statsbook figures as live charts, with a filter
 * bar to jump to a figure by number, category, or title text. Chart data
 * loads lazily as cards scroll into view.
 */
import { useMemo, useState } from "react";
import type { StatsbookFigure } from "@/lib/statsbook/types";
import { FIGURE_CATEGORY_LABELS } from "@/lib/statsbook/types";
import { FigureCard } from "./FigureCard";

export function FiguresTab({ figures }: { figures: StatsbookFigure[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return figures.filter((f) => {
      if (category && f.category !== category) return false;
      if (!q) return true;
      if (/^\d+$/.test(q)) return f.id === Number(q);
      return f.title.toLowerCase().includes(q);
    });
  }, [figures, query, category]);

  const categories = useMemo(
    () => [...new Set(figures.map((f) => f.category))],
    [figures]
  );

  return (
    <div>
      <div className="filter-bar">
        <label>
          <span className="muted small">Find </span>
          <input
            type="text"
            placeholder="Figure # or title…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Filter figures by number or title"
            data-testid="figure-filter"
          />
        </label>
        <label>
          <span className="muted small">Category </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter figures by category"
            data-testid="figure-category"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {FIGURE_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <span className="muted small">
          {visible.length} of {figures.length} figures
        </span>
      </div>
      <div className="figure-grid" data-testid="figure-grid">
        {visible.map((f) => (
          <FigureCard key={f.id} figure={f} />
        ))}
      </div>
    </div>
  );
}
