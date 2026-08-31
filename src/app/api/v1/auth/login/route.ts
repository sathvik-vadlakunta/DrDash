import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";

// A real scrypt hash of a throwaway password, verified against on the
// unknown-email path so response timing does not reveal which emails exist.
const DUMMY_HASH =
  "s2:00000000000000000000000000000000:" + "0".repeat(128);

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { email: rawEmail, password: rawPassword } = body as Record<string, unknown>;
  if (typeof rawEmail !== "string" || typeof rawPassword !== "string") {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }
  const email = rawEmail.trim().toLowerCase();
  const password = rawPassword;
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user
    ? verifyPassword(password, user.passwordHash)
    : (verifyPassword(password, DUMMY_HASH), false);
  if (!user || !ok) {
    return NextResponse.json(
      { error: "Incorrect email or password" },
      { status: 401 }
    );
  }
  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
  res.cookies.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions);
  return res;
}
