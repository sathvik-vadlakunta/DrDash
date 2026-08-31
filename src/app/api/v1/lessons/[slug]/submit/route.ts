import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRequestUser } from "@/lib/auth";
import { submitLessonStep, type SubmitInput } from "@/lib/lessons/submit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getRequestUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  const { slug } = await params;
  let body: SubmitInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const outcome = await submitLessonStep(prisma, user.id, slug, body);
  return NextResponse.json(outcome.body, { status: outcome.status });
}
