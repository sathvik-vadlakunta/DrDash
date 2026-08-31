import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, isStaff } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CreateCourseForm } from "./CourseForms";

export const metadata = { title: "Courses" };
export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/courses");

  if (isStaff(user)) {
    const courses = await prisma.course.findMany({
      where: user.role === "ADMIN" ? {} : { instructorId: user.id },
      include: { _count: { select: { enrollments: true, assignments: true } } },
      orderBy: { createdAt: "desc" },
    });
    return (
      <div className="container narrow">
        <div className="page-head">
          <h1>Courses</h1>
          <p>Create a course, enroll students by email, assign lessons, and review grades.</p>
        </div>
        <div className="card">
          <h2>Create a course</h2>
          <CreateCourseForm />
        </div>
        {courses.map((c) => (
          <div className="card" key={c.id} data-testid={`course-${c.code}`}>
            <h2>
              <Link href={`/courses/${c.id}`}>{c.name}</Link>
            </h2>
            <p className="muted small" style={{ margin: 0 }}>
              Code <code>{c.code}</code> · {c._count.enrollments} student
              {c._count.enrollments === 1 ? "" : "s"} · {c._count.assignments}{" "}
              assigned lesson{c._count.assignments === 1 ? "" : "s"}
            </p>
          </div>
        ))}
        {courses.length === 0 && <p className="muted">No courses yet.</p>}
      </div>
    );
  }

  // Student view
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          instructor: { select: { name: true } },
          assignments: { include: { lesson: true } },
        },
      },
    },
  });
  const progress = await prisma.lessonProgress.findMany({
    where: { userId: user.id },
  });
  const progressByLesson = new Map(progress.map((p) => [p.lessonId, p]));

  return (
    <div className="container narrow">
      <div className="page-head">
        <h1>My courses</h1>
        <p>Assignments from your instructors, with your progress.</p>
      </div>
      {enrollments.map(({ course }) => (
        <div className="card" key={course.id} data-testid={`course-${course.code}`}>
          <h2>{course.name}</h2>
          <p className="muted small">Taught by {course.instructor.name}</p>
          {course.assignments.length === 0 ? (
            <p className="muted small">No lessons assigned yet.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
              {[...course.assignments]
                .sort((a, b) => a.lesson.sortOrder - b.lesson.sortOrder)
                .map((a) => {
                  const p = progressByLesson.get(a.lessonId);
                  return (
                    <li key={a.id} style={{ marginBottom: "0.3rem" }}>
                      <Link href={`/lessons/${a.lesson.slug}`}>{a.lesson.title}</Link>{" "}
                      {p?.status === "COMPLETED" ? (
                        <span className="tag tag-green">
                          {p.score}/{p.maxScore} pts
                        </span>
                      ) : p ? (
                        <span className="tag tag-blue">in progress</span>
                      ) : (
                        <span className="tag tag-gray">not started</span>
                      )}
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      ))}
      {enrollments.length === 0 && (
        <p className="muted">
          You are not enrolled in any course yet — ask your instructor to add
          you by email.
        </p>
      )}
    </div>
  );
}
