import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { STATSBOOK_TABLES } from "@/lib/statsbook/tables";
import { buildTableData } from "@/lib/statsbook/data";
import { TableView } from "@/components/statsbook/TableView";

export const dynamic = "force-dynamic";

export default async function StatsbookTablePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=/statsbook/tables/${id}`);

  const def = STATSBOOK_TABLES.find((t) => t.id === Number(id));
  if (!def) notFound();

  const sp = await searchParams;
  const from = sp.from && /^\d{4}$/.test(sp.from) ? Number(sp.from) : undefined;
  const to = sp.to && /^\d{4}$/.test(sp.to) ? Number(sp.to) : undefined;

  const data = def.static ? null : await buildTableData(def, { from, to });

  return (
    <div className="container">
      <div className="page-head">
        <p style={{ margin: 0 }}>
          <Link href="/statsbook?tab=tables">← All tables</Link>
        </p>
        <h1>
          Table {def.id} — {def.title}
        </h1>
        <p>{def.description}</p>
        {def.notes && <p className="muted small">{def.notes}</p>}
        {def.identifiedSources && def.identifiedSources.length > 0 && (
          <p className="muted small">
            Identified for future addition:{" "}
            {def.identifiedSources
              .map((s) => `${s.label} (${s.fredId})`)
              .join("; ")}
            .
          </p>
        )}
      </div>

      {def.static ? (
        <div className="card" style={{ maxWidth: 560 }}>
          <h2 className="small muted" style={{ textTransform: "uppercase" }}>
            {def.static.year} snapshot
          </h2>
          <table className="data-table" data-testid="static-table">
            <thead>
              <tr>
                <th scope="col">Component</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {def.static.rows.map((r) => (
                <tr key={r.label}>
                  <td style={{ textAlign: "left" }}>{r.label}</td>
                  <td>{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : data ? (
        <TableView
          tableId={def.id}
          title={def.title}
          columns={data.columns}
          rows={data.rows}
          from={from}
          to={to}
        />
      ) : null}
    </div>
  );
}
