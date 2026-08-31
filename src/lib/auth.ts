/**
 * Minimal credential auth with HMAC-signed session cookies.
 * No external auth service — appropriate for a classroom tool where accounts
 * are provisioned by seeding or by the instructor.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Role, User } from "@prisma/client";
import { prisma } from "@/lib/db";

export { hashPassword, verifyPassword } from "@/lib/password";

export const SESSION_COOKIE = "dd_session";
const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production");
  }
  return "drdash-dev-secret";
}

// ── session tokens ─────────────────────────────────────────────────────────

interface SessionPayload {
  uid: string;
  exp: number; // epoch ms
}

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function createSessionToken(userId: string, now = Date.now()): string {
  const payload: SessionPayload = { uid: userId, exp: now + SESSION_TTL_MS };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(
  token: string | undefined,
  now = Date.now()
): SessionPayload | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as SessionPayload;
    if (typeof payload.uid !== "string" || typeof payload.exp !== "number") {
      return null;
    }
    if (payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
};

// ── current user helpers ───────────────────────────────────────────────────

/** Current user in a server component / server action context. */
export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const payload = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  return prisma.user.findUnique({ where: { id: payload.uid } });
}

/** Current user in a route handler (reads the Cookie header). */
export async function getRequestUser(req: Request): Promise<User | null> {
  const header = req.headers.get("cookie") ?? "";
  const match = header
    .split(/;\s*/)
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  const payload = verifySessionToken(match?.slice(SESSION_COOKIE.length + 1));
  if (!payload) return null;
  return prisma.user.findUnique({ where: { id: payload.uid } });
}

export function hasRole(user: User | null, ...roles: Role[]): boolean {
  return !!user && roles.includes(user.role);
}

export function isStaff(user: User | null): boolean {
  return hasRole(user, "INSTRUCTOR", "ADMIN");
}
