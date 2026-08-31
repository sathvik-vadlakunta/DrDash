import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

/**
 * Ensure the database is seeded and populated, and reset every demo user's
 * lesson progress and e2e-created courses so specs are deterministic.
 */
export default async function globalSetup() {
  try {
    process.loadEnvFile(".env");
  } catch {
    // rely on the environment
  }
  const prisma = new PrismaClient();
  try {
    let lessons = 0;
    try {
      lessons = await prisma.lesson.count();
    } catch {
      execSync("pnpm exec prisma db push --skip-generate", { stdio: "inherit" });
    }
    if (lessons < 13) {
      execSync("pnpm exec tsx prisma/seed.ts", { stdio: "inherit" });
    }
    const observations = await prisma.observation.count();
    if (observations < 40_000) {
      execSync("pnpm exec tsx scripts/sync.ts --offline", { stdio: "inherit" });
    }

    const demoEmails = [
      "student1@drdash.test",
      "student2@drdash.test",
      "instructor@drdash.test",
    ];
    const users = await prisma.user.findMany({ where: { email: { in: demoEmails } } });
    await prisma.lessonProgress.deleteMany({
      where: { userId: { in: users.map((u) => u.id) } },
    });
    await prisma.course.deleteMany({ where: { name: { startsWith: "Econ 101 E2E" } } });
  } finally {
    await prisma.$disconnect();
  }
}
