import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Lessons" };
export const dynamic = "force-dynamic";

export default async function LessonsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/lessons");

  const [lessons, progress] = await Promise.all([
    prisma.lesson.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.lessonProgress.findMany({ where: { userId: user.id } }),
  ]);
  const progressByLesson = new Map(progress.map((p) => [p.lessonId, p]));

  return (
    <div className="container narrow">
      <div className="page-head">
        <h1>Lessons</h1>
        <p>
          Thirteen guided lessons in the order of the course plan — from wages
          and living standards through the capstone economic brief.
        </p>
      </div>
      <div className="lesson-list">
        {lessons.map((lesson, i) => {
          const p = progressByLesson.get(lesson.id);
          return (
            <div className="card" key={lesson.id} data-testid={`lesson-${lesson.slug}`}>
              <div className="lesson-row">
                <span className="order">{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <h2 style={{ marginBottom: "0.2rem" }}>
                    <Link href={`/lessons/${lesson.slug}`}>{lesson.title}</Link>{" "}
                    {lesson.capstone && <span className="tag tag-yellow">Capstone</span>}
                  </h2>
                  <p className="muted small" style={{ margin: 0 }}>
                    {lesson.summary}
                  </p>
                  <p className="muted small" style={{ margin: "0.35rem 0 0" }}>
                    <span className="tag tag-gray">{lesson.level}</span>{" "}
                    ~{lesson.estimatedMinutes} min
                    {p && (
                      <>
                        {" · "}
                        {p.status === "COMPLETED" ? (
                          <span className="tag tag-green">
                            Completed — {p.score}/{p.maxScore} pts
                          </span>
                        ) : (
                          <span className="tag tag-blue">
                            In progress — {p.score}/{p.maxScore} pts
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {lessons.length === 0 && (
          <p className="muted">
            No lessons seeded yet — run <code>pnpm db:seed</code>.
          </p>
        )}
      </div>
    </div>
  );
}
