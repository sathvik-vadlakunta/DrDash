import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AssignmentsForm, EnrollForm } from "../CourseForms";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=/courses/${id}`);

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: { select: { id: true, name: true } },
      enrollments: { include: { user: { select: { id: true, name: true, email: true } } } },
      assignments: { include: { lesson: true } },
    },
  });
  if (!course) notFound();

  const isOwner = course.instructorId === user.id || user.role === "ADMIN";
  const isEnrolled = course.enrollments.some((e) => e.userId === user.id);
  if (!isOwner && !isEnrolled) redirect("/courses");

  const assignments = [...course.assignments].sort(
    (a, b) => a.lesson.sortOrder - b.lesson.sortOrder
  );

  if (!isOwner) {
    // Students get the assignment list.
    const progress = await prisma.lessonProgress.findMany({
      where: { userId: user.id, lessonId: { in: assignments.map((a) => a.lessonId) } },
    });
    const byLesson = new Map(progress.map((p) => [p.lessonId, p]));
    return (
      <div className="container narrow">
        <div className="page-head">
          <h1>{course.name}</h1>
          <p>Taught by {course.instructor.name}</p>
        </div>
        <div className="card">
          <h2>Assigned lessons</h2>
          <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
            {assignments.map((a) => {
              const p = byLesson.get(a.lessonId);
              return (
                <li key={a.id} style={{ marginBottom: "0.3rem" }}>
                  <Link href={`/lessons/${a.lesson.slug}`}>{a.lesson.title}</Link>{" "}
                  {p?.status === "COMPLETED" ? (
                    <span className="tag tag-green">{p.score}/{p.maxScore} pts</span>
                  ) : p ? (
                    <span className="tag tag-blue">in progress</span>
                  ) : (
                    <span className="tag tag-gray">not started</span>
                  )}
                </li>
              );
            })}
            {assignments.length === 0 && <li className="muted">Nothing assigned yet.</li>}
          </ul>
        </div>
      </div>
    );
  }

  // Instructor view: roster, assignments, grades, written responses.
  const lessons = await prisma.lesson.findMany({ orderBy: { sortOrder: "asc" } });
  const studentIds = course.enrollments.map((e) => e.userId);
  const lessonIds = assignments.map((a) => a.lessonId);
  const progress = await prisma.lessonProgress.findMany({
    where: { userId: { in: studentIds }, lessonId: { in: lessonIds } },
    include: {
      submissions: { where: { stepType: "QUESTION_TEXT" } },
    },
  });
  const progressBy = new Map(progress.map((p) => [`${p.userId}:${p.lessonId}`, p]));

  const textResponses = progress.flatMap((p) =>
    p.submissions
      .filter((s) => s.textResponse)
      .map((s) => ({
        student: course.enrollments.find((e) => e.userId === p.userId)?.user,
        lesson: assignments.find((a) => a.lessonId === p.lessonId)?.lesson,
        stepId: s.stepId,
        text: s.textResponse as string,
        at: s.completedAt,
      }))
  );

  return (
    <div className="container">
      <div className="page-head">
        <h1>{course.name}</h1>
        <p>
          Course code <code>{course.code}</code> · {course.enrollments.length}{" "}
          student{course.enrollments.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Roster</h2>
          <ul style={{ margin: "0 0 0.8rem", paddingLeft: "1.2rem" }}>
            {course.enrollments.map((e) => (
              <li key={e.id}>
                {e.user.name} <span className="muted small">({e.user.email})</span>
              </li>
            ))}
            {course.enrollments.length === 0 && (
              <li className="muted">No students enrolled yet.</li>
            )}
          </ul>
          <EnrollForm courseId={course.id} />
        </div>
        <div className="card">
          <h2>Assigned lessons</h2>
          <AssignmentsForm
            courseId={course.id}
            lessons={lessons.map((l) => ({ slug: l.slug, title: l.title }))}
            assignedSlugs={assignments.map((a) => a.lesson.slug)}
          />
        </div>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2>Grades</h2>
        {assignments.length === 0 || course.enrollments.length === 0 ? (
          <p className="muted">Assign lessons and enroll students to see grades.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table" data-testid="grades-table">
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  {assignments.map((a) => (
                    <th scope="col" key={a.id} title={a.lesson.title}>
                      {a.lesson.title.length > 24
                        ? `${a.lesson.title.slice(0, 22)}…`
                        : a.lesson.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {course.enrollments.map((e) => (
                  <tr key={e.id}>
                    <td>{e.user.name}</td>
                    {assignments.map((a) => {
                      const p = progressBy.get(`${e.userId}:${a.lessonId}`);
                      return (
                        <td key={a.id} className={p ? "" : "na"}>
                          {p
                            ? `${p.score}/${p.maxScore}${p.status === "COMPLETED" ? " ✓" : ""}`
                            : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2>Written responses</h2>
        <p className="muted small">
          Free-text answers (e.g. the capstone brief reflection) for instructor
          review — these are completion-graded, not auto-graded.
        </p>
        {textResponses.length === 0 ? (
          <p className="muted">No written responses yet.</p>
        ) : (
          textResponses.map((r, i) => (
            <blockquote
              key={i}
              style={{
                borderLeft: "3px solid var(--border-strong)",
                margin: "0 0 0.8rem",
                padding: "0.2rem 0 0.2rem 0.8rem",
              }}
            >
              <p style={{ margin: "0 0 0.25rem", whiteSpace: "pre-line" }}>{r.text}</p>
              <footer className="muted small">
                — {r.student?.name ?? "Unknown"} · {r.lesson?.title ?? r.stepId} ·{" "}
                {r.at.toISOString().slice(0, 10)}
              </footer>
            </blockquote>
          ))
        )}
      </div>
    </div>
  );
}
