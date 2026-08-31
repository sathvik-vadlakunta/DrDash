import { redirect } from "next/navigation";
import { getSessionUser, isStaff } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SyncButton } from "./SyncButton";

export const metadata = { title: "Data Sync" };
export const dynamic = "force-dynamic";

export default async function AdminSyncPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin/sync");
  if (!isStaff(user)) redirect("/");

  const [series, counts, runs] = await Promise.all([
    prisma.series.findMany({ orderBy: [{ category: "asc" }, { id: "asc" }] }),
    prisma.observation.groupBy({
      by: ["seriesId"],
      _count: { _all: true },
      _max: { date: true },
    }),
    prisma.syncRun.findMany({ orderBy: { startedAt: "desc" }, take: 5 }),
  ]);
  const countBy = new Map(counts.map((c) => [c.seriesId, c]));
  const missing = series.filter((s) => !countBy.has(s.id));

  return (
    <div className="container">
      <div className="page-head">
        <h1>Data sync</h1>
        <p>
          Load observations for all {series.length} catalog series — live from
          FRED when the network allows, otherwise from the bundled offline
          snapshots. Equivalent to <code>pnpm sync</code>.
        </p>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <SyncButton />
          <span className="muted small" data-testid="sync-missing">
            {missing.length === 0
              ? "All series have data."
              : `${missing.length} series have no observations yet.`}
          </span>
        </div>
        {runs.length > 0 && (
          <p className="muted small" style={{ marginBottom: 0 }}>
            Last run: {runs[0].status} ({runs[0].source.toLowerCase()}) —{" "}
            {runs[0].seriesCount} series, {runs[0].observationCount.toLocaleString()}{" "}
            observations
            {runs[0].message ? ` — ${runs[0].message}` : ""}
          </p>
        )}
      </div>

      <div className="table-scroll">
        <table className="data-table" data-testid="sync-table">
          <thead>
            <tr>
              <th scope="col">Series</th>
              <th scope="col">Name</th>
              <th scope="col">Category</th>
              <th scope="col">Freq</th>
              <th scope="col">Observations</th>
              <th scope="col">Latest</th>
              <th scope="col">Source</th>
              <th scope="col">Synced</th>
            </tr>
          </thead>
          <tbody>
            {series.map((s) => {
              const c = countBy.get(s.id);
              return (
                <tr key={s.id}>
                  <td style={{ fontFamily: "var(--mono)" }}>{s.id}</td>
                  <td style={{ textAlign: "left" }}>{s.name}</td>
                  <td style={{ textAlign: "left" }}>{s.category}</td>
                  <td>{s.frequency}</td>
                  <td className={c ? "" : "na"}>{c?._count._all.toLocaleString() ?? "0"}</td>
                  <td className={c ? "" : "na"}>
                    {c?._max.date?.toISOString().slice(0, 10) ?? "—"}
                  </td>
                  <td>{s.lastSource ?? "—"}</td>
                  <td>{s.lastSyncedAt?.toISOString().slice(0, 10) ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
