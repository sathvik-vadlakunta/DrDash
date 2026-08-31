/**
 * `pnpm db:seed` — idempotent database seed.
 *
 * Seeds: demo users, the full series catalog metadata (observations are
 * loaded separately by `pnpm sync`), and all lessons (validated against the
 * lesson schema before upsert, so a malformed seed file fails loudly here).
 */
import { PrismaClient } from "@prisma/client";
import { SERIES_CATALOG } from "../src/lib/catalog/series";
import { validateLessonSeed } from "../src/lib/lessons/schema";
import { SEED_USERS } from "./seed/users";
import { ALL_LESSONS } from "./seed/lessons";

const prisma = new PrismaClient();

async function seedUsers() {
  for (const user of SEED_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, passwordHash: user.passwordHash },
      create: user,
    });
  }
  console.log(`Seeded ${SEED_USERS.length} users`);
}

async function seedSeriesMeta() {
  for (const def of SERIES_CATALOG) {
    const meta = {
      name: def.name,
      category: def.category,
      kind: def.kind,
      frequency: def.frequency,
      seasonal: def.seasonal,
      units: def.units,
      nominal: def.nominal,
      canGrowth: def.canGrowth,
      source: def.source,
      description: def.description,
      hidden: def.hidden ?? false,
    };
    await prisma.series.upsert({
      where: { id: def.id },
      update: meta,
      create: { id: def.id, ...meta },
    });
  }
  console.log(`Seeded ${SERIES_CATALOG.length} series definitions`);
}

async function seedLessons() {
  for (const seed of ALL_LESSONS) {
    const lesson = validateLessonSeed(seed); // throws on malformed content
    const data = {
      title: lesson.title,
      summary: lesson.summary,
      level: lesson.level,
      estimatedMinutes: lesson.estimatedMinutes,
      sortOrder: lesson.sortOrder,
      capstone: lesson.capstone ?? false,
      content: lesson.content,
    };
    await prisma.lesson.upsert({
      where: { slug: lesson.slug },
      update: data,
      create: { slug: lesson.slug, ...data },
    });
  }
  console.log(`Seeded ${ALL_LESSONS.length} lessons`);
}

async function main() {
  await seedUsers();
  await seedSeriesMeta();
  await seedLessons();
  console.log("Seed complete. Run `pnpm sync` to load observations.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
