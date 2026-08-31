import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CATEGORY_SLUGS, SERIES_CATALOG } from "@/lib/catalog/series";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();
  let lessonCount = 0;
  let observationCount = 0;
  try {
    lessonCount = await prisma.lesson.count();
    observationCount = await prisma.observation.count();
  } catch {
    // Database not reachable (e.g. during build) — render without stats.
  }

  return (
    <div className="container narrow">
      <div className="page-head" style={{ marginTop: "2rem" }}>
        <h1>Dr. Dash</h1>
        <p>
          An interactive macroeconomic dashboard and lesson platform for intro
          economics. Plot {SERIES_CATALOG.filter((s) => !s.hidden).length} real
          U.S. data series from FRED, transform them like an economist, and
          work through guided lessons from wages to the wage–productivity gap.
        </p>
      </div>

      <div className="stat-row">
        <div className="stat-box">
          <div className="stat-value">{SERIES_CATALOG.length}</div>
          <div className="stat-label">Data series</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{CATEGORY_SLUGS.length}</div>
          <div className="stat-label">Categories</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{lessonCount}</div>
          <div className="stat-label">Lessons</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{observationCount.toLocaleString()}</div>
          <div className="stat-label">Observations</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Chart Tool</h2>
          <p className="muted">
            Build charts from the full catalog: growth rates, inflation
            adjustment, per-capita, percent-of-GDP, recession shading, and
            shareable links.
          </p>
          <Link className="btn btn-primary" href="/dashboard">
            Open the Chart Tool
          </Link>
        </div>
        <div className="card">
          <h2>Statsbook</h2>
          <p className="muted">
            The professor&apos;s Statsbook 2025–2026 as a living document: 50
            figures as live charts and 17 appendix tables with CSV export.
          </p>
          <Link className="btn btn-primary" href="/statsbook">
            Browse the Statsbook
          </Link>
        </div>
        <div className="card">
          <h2>Lessons</h2>
          <p className="muted">
            Thirteen guided lessons — read, build the chart, answer the
            questions. Scores are recorded for your course.
          </p>
          <Link className="btn btn-primary" href="/lessons">
            Start learning
          </Link>
        </div>
        <div className="card">
          <h2>Courses</h2>
          <p className="muted">
            Instructors create courses, assign lessons, and review grades and
            written responses.
          </p>
          <Link className="btn btn-primary" href="/courses">
            {user ? "My courses" : "Log in"}
          </Link>
        </div>
      </div>
    </div>
  );
}
