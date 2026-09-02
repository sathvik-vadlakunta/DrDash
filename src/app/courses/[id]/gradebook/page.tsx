import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id }, select: { name: true } });
  return { title: course ? `Gradebook — ${course.name}` : "Gradebook" };
}

export default async function GradebookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ format?: string }>;
}) {
  const { id } = await params;
  const { format } = await searchParams;

  const user = await getSessionUser();
  if (!user) redirect(`/login?next=/courses/${id}/gradebook`);

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
      assignments: {
        include: { lesson: true },
        orderBy: { lesson: { sortOrder: "asc" } },
      },
    },
  });

  if (!course) notFound();

  const isOwner = course.instructorId === user.id || user.role === "ADMIN";
  if (!isOwner) redirect(`/courses/${id}`);

  const studentIds = course.enrollments.map((e) => e.userId);
  const lessonIds = course.assignments.map((a) => a.lessonId);

  const progress = await prisma.lessonProgress.findMany({
    where: {
      userId: { in: studentIds },
      lessonId: { in: lessonIds },
    },
    select: {
      userId: true,
      lessonId: true,
      score: true,
      maxScore: true,
      status: true,
    },
  });

  const byKey = new Map(progress.map((p) => [`${p.userId}:${p.lessonId}`, p]));

  // CSV export
  if (format === "csv") {
    const header = [
      "Student",
      "Email",
      ...course.assignments.map((a) => `"${a.lesson.title}"`),
      "Total",
      "Max",
      "Percent",
    ].join(",");

    const rows = course.enrollments.map((e) => {
      let total = 0;
      let maxTotal = 0;
      const cells = course.assignments.map((a) => {
        const p = byKey.get(`${e.userId}:${a.lessonId}`);
        if (!p) return "";
        total += p.score;
        maxTotal += p.maxScore;
        return `${p.score}/${p.maxScore}`;
      });
      const pct = maxTotal > 0 ? `${Math.round((total / maxTotal) * 100)}%` : "";
      return [`"${e.user.name}"`, `"${e.user.email}"`, ...cells, total, maxTotal, pct].join(",");
    });

    const csv = [header, ...rows].join("\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="gradebook-${course.name.replace(/\s+/g, "-")}.csv"`,
      },
    });
  }

  // Compute totals per student
  const studentTotals = new Map(
    course.enrollments.map((e) => {
      let total = 0;
      let maxTotal = 0;
      for (const a of course.assignments) {
        const p = byKey.get(`${e.userId}:${a.lessonId}`);
        if (p) { total += p.score; maxTotal += p.maxScore; }
      }
      return [e.userId, { total, maxTotal }];
    })
  );

  return (
    <div className="container">
      <div className="page-head">
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", flexWrap: "wrap" }}>
          <h1>Gradebook</h1>
          <span className="muted">— {course.name}</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <Link href={`/courses/${id}`} className="btn btn-small">
            ← Course
          </Link>
          <a
            href={`/courses/${id}/gradebook?format=csv`}
            className="btn btn-small"
            download
          >
            Download CSV
          </a>
        </div>
      </div>

      {course.assignments.length === 0 || course.enrollments.length === 0 ? (
        <div className="card">
          <p className="muted">
            {course.assignments.length === 0
              ? "No lessons assigned yet."
              : "No students enrolled yet."}
          </p>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Student</th>
                {course.assignments.map((a) => (
                  <th
                    key={a.id}
                    scope="col"
                    title={a.lesson.title}
                  >
                    {a.lesson.title.length > 18
                      ? `${a.lesson.title.slice(0, 16)}…`
                      : a.lesson.title}
                  </th>
                ))}
                <th scope="col">Total</th>
                <th scope="col">%</th>
              </tr>
            </thead>
            <tbody>
              {course.enrollments.map((e) => {
                const { total, maxTotal } = studentTotals.get(e.userId)!;
                return (
                  <tr key={e.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{e.user.name}</div>
                      <div className="muted small">{e.user.email}</div>
                    </td>
                    {course.assignments.map((a) => {
                      const p = byKey.get(`${e.userId}:${a.lessonId}`);
                      return (
                        <td key={a.id} className={p ? "" : "na"}>
                          {p ? (
                            <>
                              {p.score}/{p.maxScore}
                              {p.status === "COMPLETED" && (
                                <span className="muted small"> ✓</span>
                              )}
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                      );
                    })}
                    <td style={{ fontWeight: 600 }}>
                      {total}/{maxTotal}
                    </td>
                    <td>
                      {maxTotal > 0 ? (
                        <span
                          className={
                            total / maxTotal >= 0.7 ? "success-text" : "error-text"
                          }
                        >
                          {Math.round((total / maxTotal) * 100)}%
                        </span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
