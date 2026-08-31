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
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const email = body.email?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });
  const student = await prisma.user.findUnique({ where: { email } });
  if (!student) {
    return NextResponse.json(
      { error: `No account exists for ${email}` },
      { status: 404 }
    );
  }
  await prisma.enrollment.upsert({
    where: { courseId_userId: { courseId: course.id, userId: student.id } },
    update: {},
    create: { courseId: course.id, userId: student.id },
  });
  return NextResponse.json({ ok: true });
}
