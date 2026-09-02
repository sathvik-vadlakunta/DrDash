import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HomeChart } from "./HomeChart";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();

  // Fetch GDPC1 (Real GDP, chained $) from 1990 onward to compute YoY from 1991
  let chartData: { t: number; v: number }[] = [];
  let dateRange = "";
  let latestPct = "";

  try {
    const obs = await prisma.observation.findMany({
      where: {
        seriesId: "GDPC1",
        date: { gte: new Date("1990-01-01") },
        value: { not: null },
      },
      orderBy: { date: "asc" },
      select: { date: true, value: true },
    });

    // Compute quarterly YoY: (current − 4-periods-ago) / |4-periods-ago| × 100
    const yoy: { t: number; v: number }[] = [];
    for (let i = 4; i < obs.length; i++) {
      const curr = obs[i].value!;
      const prev = obs[i - 4].value!;
      if (prev !== 0) {
        yoy.push({ t: obs[i].date.getTime(), v: +((curr - prev) / Math.abs(prev) * 100).toFixed(2) });
      }
    }

    chartData = yoy;

    if (yoy.length > 0) {
      const first = new Date(yoy[0].t).toISOString().slice(0, 10);
      const last  = new Date(yoy[yoy.length - 1].t).toISOString().slice(0, 10);
      dateRange = `${first} to ${last}`;
      latestPct = `${yoy[yoy.length - 1].v.toFixed(1)}%`;
    }
  } catch {
    // DB unavailable during build — render without chart
  }

  return (
    <div className="home-page">
      <h1 className="home-title">Dr. Dash</h1>

      <p className="home-desc">
        Dr. Dash turns macroeconomic data into information by giving instructors
        a single, categorized, auto-updating database of macro time series,
        one-click plotting, one-click transformations that reveal different
        information from the same data, and self-contained graded lessons that
        build a student&apos;s ability to extract information from data.
      </p>

      {chartData.length > 0 && (
        <div className="home-chart-block">
          <p className="home-chart-label eyebrow">Real GDP Per Capita, Year Over Year</p>
          <div className="home-chart-frame">
            <HomeChart data={chartData} />
          </div>
          {dateRange && (
            <p className="home-chart-meta">
              {dateRange} · latest {latestPct}
            </p>
          )}
        </div>
      )}

      <h2 className="home-what-title">What it is</h2>
      <ol className="home-list">
        <li>
          <strong>The database.</strong> Every macro series used in teaching,
          linked to the government sources, plus Dr. Dash constructed series and
          your own imports.
        </li>
        <li>
          <strong>The plotting system.</strong> Click a category, click a series,
          it plots. Overlay up to six, dual axis, recession shading.
        </li>
        <li>
          <strong>The transformations.</strong> Growth rate, per capita, real at
          any base year, and one series as a percent of another, applied to
          everything at once or one at a time.
        </li>
        <li>
          <strong>The lessons.</strong> Self-contained and assignable,
          alternating a task in Dr. Dash with a graded question about what you
          just saw.
        </li>
      </ol>

      <div className="home-ctas">
        {user ? (
          <>
            <Link href="/dashboard" className="btn btn-primary">
              Open the dashboard
            </Link>
            <Link href="/lessons" className="btn">
              Browse lessons
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-primary">
              Create an account
            </Link>
            <Link href="/dashboard" className="btn">
              See a sample dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
