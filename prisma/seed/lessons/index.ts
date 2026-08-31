/**
 * The lesson registry. Every lesson seeded into the database is exported
 * here; `pnpm db:seed` upserts them and `pnpm check:catalog` validates them.
 *
 * File numbers are historical (they track when each lesson was written);
 * `sortOrder` — not the file number — controls the sequence students see,
 * which follows the instructor's 13-lesson plan. See docs/decisions.md for
 * the full plan-to-file mapping.
 */
import type { LessonSeed } from "../../../src/lib/lessons/schema";
import { LESSON_01 } from "./01-levels-vs-growth";
import { LESSON_02 } from "./02-nominal-vs-real";
import { LESSON_03 } from "./03-per-capita";
import { LESSON_04 } from "./04-recessions";
import { LESSON_05 } from "./05-shares-of-gdp";
import { LESSON_06 } from "./06-labor-market";
import { LESSON_07 } from "./07-income-disparity";
import { LESSON_08 } from "./08-inflation";
import { LESSON_09 } from "./09-monetary-policy";
import { LESSON_10 } from "./10-deficits-debt";
import { LESSON_11 } from "./11-international-trade";
import { LESSON_12 } from "./12-productivity";
import { LESSON_13 } from "./13-economic-brief";

export {
  LESSON_01,
  LESSON_02,
  LESSON_03,
  LESSON_04,
  LESSON_05,
  LESSON_06,
  LESSON_07,
  LESSON_08,
  LESSON_09,
  LESSON_10,
  LESSON_11,
  LESSON_12,
  LESSON_13,
};

export const ALL_LESSONS: LessonSeed[] = [
  LESSON_01,
  LESSON_02,
  LESSON_03,
  LESSON_04,
  LESSON_05,
  LESSON_06,
  LESSON_07,
  LESSON_08,
  LESSON_09,
  LESSON_10,
  LESSON_11,
  LESSON_12,
  LESSON_13,
];
