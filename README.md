# Dr. Dash

An interactive macroeconomic data dashboard and lesson platform for intro
economics courses. Students plot real U.S. data from
[FRED](https://fred.stlouisfed.org), transform it like economists do (growth
rates, inflation adjustment, per-capita, percent-of-GDP), and work through 13
guided lessons — from *Wages and the Living Standard* to a capstone economic
brief. Instructors run courses, assign lessons, and review grades and written
responses. The professor's **Statsbook 2025–2026** is mirrored as a living
document: 50 figures as live charts and 17 appendix tables with CSV export.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Prisma 6 + PostgreSQL ·
Recharts · Vitest · Playwright. Deployable to Vercel.

## Getting started

```bash
pnpm install
cp .env.example .env           # set DATABASE_URL / SESSION_SECRET
pnpm db:push                   # create the schema
pnpm db:seed                   # users, series catalog, 13 lessons
pnpm sync                      # load observations (FRED, falls back offline)
pnpm dev                       # http://localhost:3000
```

Demo accounts (password `drdash-demo`): `student1@drdash.test`,
`student2@drdash.test`, `instructor@drdash.test`, `admin@drdash.test`.

## Data

The series catalog (`src/lib/catalog/series.ts`) defines ~80 series across 10
categories, including four constructed series (`DD_REAL_FFR`, `DD_MISERY`,
`DD_WAGE_PRICE_GAP`, `DD_MONEY_VEL`) computed from FRED inputs at sync time.
Offline JSON snapshots of every series are bundled in `prisma/seed/data/`, so
the app is fully functional without network access (`pnpm sync --offline`, or
`FRED_OFFLINE=1`). Refresh the snapshots with `pnpm fetch:fred`.

FRED data is fetched from the public `fredgraph.csv` endpoint — no API key
required.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm verify` | typecheck + lint + unit tests + catalog check + production build |
| `pnpm db:seed` | idempotent seed of users, catalog metadata, and lessons |
| `pnpm sync` | load observations into Postgres (`--offline` / `--fred` to force a source) |
| `pnpm check:catalog` | validate catalog ↔ snapshots ↔ lessons ↔ statsbook, and resolve every FRED id live |
| `pnpm test` | unit tests (transforms, grader, URL grammar, catalogs) |
| `pnpm test:integration` | Postgres-backed tests: seed, offline sync, and a full walkthrough of all 13 lessons (`DATABASE_URL_TEST`) |
| `pnpm test:e2e` | Playwright: login, Lesson 8 UI walkthrough, instructor course flow, statsbook, chart tool (`pnpm build` first) |
| `pnpm fetch:fred` | refresh the bundled offline data snapshots |

## Architecture notes

- **Shareable dashboards**: a chart is fully encoded in its URL
  (`src/lib/dashboard/urlState.ts`) — `/dashboard?s=CPIAUCSL:yoy,CPILFESL:yoy&rec=1`.
  Saving a dashboard *is* copying its link; lesson TASK_URL steps validate
  pasted links against the same grammar.
- **Lessons** are seed-defined (`prisma/seed/lessons/*.ts`), validated by zod
  (`src/lib/lessons/schema.ts`), and graded server-side
  (`src/lib/lessons/submit.ts`). Step types: `READ`, `TASK` (build a chart
  matching a target), `TASK_URL`, `QUESTION_MC` (limited tries), and
  `QUESTION_TEXT` (stored for instructor review). Answers are stripped before
  content reaches the client.
- **Statsbook**: figure and table catalogs live in `src/lib/statsbook/`;
  tables aggregate observations to annual values server-side, and real-dollar
  columns are rebased to 2024 dollars to match the printed book.
- See `docs/decisions.md` for judgment calls (FRED id substitutions, the
  lesson-plan alignment map, the capstone submission model).
