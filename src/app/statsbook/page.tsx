import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { STATSBOOK_FIGURES } from "@/lib/statsbook/figures";
import { STATSBOOK_TABLES } from "@/lib/statsbook/tables";
import { FiguresTab } from "@/components/statsbook/FiguresTab";

export const metadata = { title: "Statsbook" };
export const dynamic = "force-dynamic";

export default async function StatsbookPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/statsbook");
  const { tab } = await searchParams;
  const activeTab = tab === "tables" ? "tables" : "figures";

  return (
    <div className="container">
      <div className="page-head">
        <h1>Statsbook 2025–2026</h1>
        <p>
          The course reference document as a living resource: every figure is a
          live Dr. Dash chart that updates with each data sync, and every
          appendix table is viewable and downloadable.
        </p>
      </div>

      <nav className="tab-bar" aria-label="Statsbook sections">
        <Link
          href="/statsbook"
          className={activeTab === "figures" ? "active" : ""}
          aria-current={activeTab === "figures" ? "page" : undefined}
          data-testid="tab-figures"
        >
          Figures ({STATSBOOK_FIGURES.length})
        </Link>
        <Link
          href="/statsbook?tab=tables"
          className={activeTab === "tables" ? "active" : ""}
          aria-current={activeTab === "tables" ? "page" : undefined}
          data-testid="tab-tables"
        >
          Tables ({STATSBOOK_TABLES.length})
        </Link>
      </nav>

      {activeTab === "figures" ? (
        <FiguresTab figures={STATSBOOK_FIGURES} />
      ) : (
        <div className="lesson-list" data-testid="tables-list">
          {STATSBOOK_TABLES.map((t) => (
            <div className="card" key={t.id}>
              <h2 style={{ fontSize: "1.05rem", marginBottom: "0.2rem" }}>
                <Link href={`/statsbook/tables/${t.id}`} data-testid={`table-link-${t.id}`}>
                  Table {t.id} — {t.title}
                </Link>
              </h2>
              <p className="muted small" style={{ margin: 0 }}>
                {t.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
