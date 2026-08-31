import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { getRequestUser, isStaff } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const courses = isStaff(user)
    ? await prisma.course.findMany({
        where: { instructorId: user.id },
        include: { _count: { select: { enrollments: true, assignments: true } } },
      })
    : await prisma.course.findMany({
        where: { enrollments: { some: { userId: user.id } } },
        include: { _count: { select: { enrollments: true, assignments: true } } },
      });
  return NextResponse.json({ courses });
}

export async function POST(req: Request) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  if (!isStaff(user)) {
    return NextResponse.json(
      { error: "Only instructors can create courses" },
      { status: 403 }
    );
  }
  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Course name is required" }, { status: 400 });
  }
  const code = randomBytes(3).toString("hex").toUpperCase();
  const course = await prisma.course.create({
    data: { name, code, instructorId: user.id },
  });
  return NextResponse.json({ course }, { status: 201 });
}
