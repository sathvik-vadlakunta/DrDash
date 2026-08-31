import { describe, expect, it, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { SERIES_CATALOG } from "@/lib/catalog/series";

const prisma = new PrismaClient();
afterAll(() => prisma.$disconnect());

describe("database seed", () => {
  it("seeds the demo users", async () => {
    const emails = (await prisma.user.findMany()).map((u) => u.email);
    expect(emails).toContain("student1@drdash.test");
    expect(emails).toContain("instructor@drdash.test");
    const instructor = await prisma.user.findUnique({
      where: { email: "instructor@drdash.test" },
    });
    expect(instructor?.role).toBe("INSTRUCTOR");
  });

  it("seeds every catalog series definition", async () => {
    const count = await prisma.series.count();
    expect(count).toBe(SERIES_CATALOG.length);
  });

  it("seeds all 13 lessons in plan order", async () => {
    const lessons = await prisma.lesson.findMany({ orderBy: { sortOrder: "asc" } });
    expect(lessons).toHaveLength(13);
    expect(lessons.map((l) => l.slug)).toEqual([
      "nominal-vs-real",
      "levels-vs-growth",
      "recessions",
      "labor-market",
      "per-capita",
      "income-disparity",
      "shares-of-gdp",
      "inflation",
      "monetary-policy",
      "deficits-debt",
      "international-trade",
      "productivity",
      "economic-brief",
    ]);
    const capstone = lessons.find((l) => l.slug === "economic-brief");
    expect(capstone?.capstone).toBe(true);
  });

  it("is idempotent (re-running the seed does not duplicate)", async () => {
    const { execSync } = await import("node:child_process");
    execSync("pnpm exec tsx prisma/seed.ts", {
      env: { ...process.env },
      stdio: "pipe",
    });
    expect(await prisma.lesson.count()).toBe(13);
  });
});
