import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRequestUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return NextResponse.json({ error: "Unknown course" }, { status: 404 });
  if (course.instructorId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not your course" }, { status: 403 });
  }
  let body: { lessonSlugs?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!Array.isArray(body.lessonSlugs)) {
    return NextResponse.json({ error: "lessonSlugs is required" }, { status: 400 });
  }
  const lessons = await prisma.lesson.findMany({
    where: { slug: { in: body.lessonSlugs } },
  });
  const keepIds = lessons.map((l) => l.id);
  await prisma.assignment.deleteMany({
    where: { courseId: course.id, lessonId: { notIn: keepIds } },
  });
  await prisma.assignment.createMany({
    data: keepIds.map((lessonId) => ({ courseId: course.id, lessonId })),
    skipDuplicates: true,
  });
  return NextResponse.json({ ok: true, assigned: keepIds.length });
}
