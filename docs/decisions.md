# Decisions

A running log of judgment calls made while building out the task board
(catalog updates, Statsbook Tab, Lessons 8–13, alignment work).

## 1. FRED id substitutions

`pnpm check:catalog` verifies every id against the live FRED endpoint. Two ids
on the original task board do not resolve on FRED and were substituted:

| Board id | Status | Replacement | Rationale |
| --- | --- | --- | --- |
| `PPAACH` (poverty rate) | not a FRED id | `PPAAUS00000A156NCEN` | Census SAIPE "Estimated Percent of People of All Ages in Poverty for United States", annual 1989–2024 — the standard national poverty-rate series on FRED. |
| `SIPOVT` (poverty threshold) | not a FRED id | *(none seeded)* | FRED carries no single national poverty-threshold series. Table 16 covers poverty via the rate (`PPAAUS00000A156NCEN`) and the count (`PEAAUS00000A647NCEN`); thresholds remain a Census-publication citation. |

Related notes:

- `MEHOINUSA672N` is **already inflation-adjusted** by the Census Bureau
  (CPI-U-RS, 2023 dollars). The board suggested marking it nominal with a CPI
  deflator; we mark it real instead, so the (double-deflating) Real transform
  is disabled for it. `MEFAINUSA672N` (real median *family* income) was added
  as well because Statsbook Table 16 is stated in family terms.
- `NETFI` is NIPA *net lending/borrowing, rest of the world* — the
  national-accounts counterpart of the current account balance. The catalog
  names it accordingly.
- `PNFIC1` resolves to *Real Private Nonresidential Fixed Investment*
  (chained 2017$), not "net private fixed investment" as the board loosely
  labeled it; the catalog uses the accurate name.
- Statsbook Tables 5/7/8/14/15 needed income- and tax-component series beyond
  the board's list. Verified and seeded: `CP`, `A033RC1A027NBEA`,
  `A034RC1A027NBEA`, `A038RC1A027NBEA`, `A041RC1A027NBEA`,
  `A048RC1A027NBEA`, `A453RC1A027NBEA`, `W055RC1A027NBEA`, `FCTAX`,
  `A061RC1A027NBEA`, `B234RC1A027NBEA`, `FDEFX`, `FNDEFX`,
  `A091RC1Q027SBEA`, `GSAVE`, `COFC`.
- Statsbook Table 17 (capital stock): the board asked us to "decide whether
  to add fixed private capital stock" — decided **yes**: `K1PTOTL1ES000`
  (current-cost net stock of private fixed assets, annual 1925–2024) resolves
  on FRED and completes the table alongside `TCU`, `MCUMFN`, and `PNFIC1`.
- Statsbook Table 11 (population): `CNP16OV` covers the working-age
  population concept the statsbook uses (civilian noninstitutional, 16+), so
  `LNU00000000` was **not** added — it is the NSA twin of the same concept.
- Money velocity: no prior constructed series covered it (`DD_MISERY` does
  not), so `DD_MONEY_VEL` (GDP ÷ quarterly-average M2) was built per the
  board.

## 2. Existing-lesson alignment (plan lessons 1–7 ↔ code files 01–06)

Audit result and the mapping now in effect. File numbers are historical;
`sortOrder` (10–130) drives the sequence students see, matching the plan's
1–13 order. Titles were updated to the plan's topic names (slugs kept stable
so links don't break).

| Plan lesson | Topic | Code file | Slug | sortOrder |
| --- | --- | --- | --- | --- |
| 1 | Wages and the Living Standard | `02-nominal-vs-real.ts` | `nominal-vs-real` | 10 |
| 2 | Describing Economic Growth | `01-levels-vs-growth.ts` | `levels-vs-growth` | 20 |
| 3 | Economic Instability | `04-recessions.ts` | `recessions` | 30 |
| 4 | Labor Force, Employment, Unemployment | `06-labor-market.ts` | `labor-market` | 40 |
| 5 | Wages, Compensation, and Income per Person | `03-per-capita.ts` | `per-capita` | 50 |
| 6 | Income Disparity | `07-income-disparity.ts` (**was missing — created**) | `income-disparity` | 60 |
| 7 | The Expenditure Components of GDP | `05-shares-of-gdp.ts` | `shares-of-gdp` | 70 |
| 8–13 | Inflation … Capstone | `08`–`13` | — | 80–130 |

Notes on the partial matches the board flagged:

- Plan 3 (Economic Instability) gets a dedicated file (`04-recessions.ts`)
  rather than living partially inside the growth lesson.
- Plan 5 (Wages and Compensation) is covered by extending the per-capita
  skill file with the compensation series (`COMPRNFB`) — the per-person
  transform and the wages-vs-total-compensation distinction are one lesson.
- Plan 6 (Income Disparity) was confirmed missing and created; it drove the
  new `income-distribution` catalog category.

## 3. Capstone (Lesson 13) submission model — **Option B (external)**

The economic brief is submitted **outside** Dr. Dash: students build charts in
the Chart Tool, copy the shareable dashboard link (the URL fully encodes the
chart), and submit their 400–600-word brief through the course's normal
channel with the link embedded. Chosen because:

- It requires no new instructor-facing document workflow, and every LMS
  already handles document submission and annotation better than we would.
- The dashboard link *is* the reproducible artifact — the lesson validates it
  in-app via a `TASK_URL` step (≥2 series, ≥1 transformation, parsed with the
  real URL grammar), so the data work is still checked automatically.

What we did build from Option A's scope: the **`QUESTION_TEXT`** step type
(schema, grader, textarea UI, storage) because the capstone's reflection
question is much better free-text than multiple choice. Responses are
completion-graded and surfaced to instructors on the course page under
"Written responses". A full in-app brief editor (rich text, attachment,
per-submission feedback) remains out of scope; revisit if instructors ask for
grading inside Dr. Dash.

## 4. Other calls worth recording

- **Statsbook real-dollar base year**: table columns flagged
  `rebaseToLatestYear` are expressed in **2024 dollars**
  (`STATSBOOK_BASE_YEAR`), matching the printed 2025–2026 statsbook
  (e.g. 2024 per-capita real GDP ≈ $85,784) rather than FRED's chained-2017$
  convention.
- **Table 3** (Disposition of GNP as Income) is a static 2024 snapshot
  computed from the bundled data at authoring time, per the board ("render as
  a static structured table from seed data, not from FRED").
- **Percent-of transform and frequencies**: a monthly numerator against
  quarterly GDP forward-fills the most recent quarter (step interpolation);
  non-annualized flows (e.g. `BOPGSTB`) are annualized before dividing by
  SAAR aggregates; stocks (e.g. `GFDEBTN`) are not. Growth-rate transforms
  are disabled for sign-crossing series (`NETEXP`, `FYFSD`, `NETFI`,
  `BOPGSTB`).
- **Recession shading** uses `USREC` (kept hidden in the picker) rendered as
  chart bands rather than a plottable 0/1 line.
- **Daily series** (`DTWEXBGS`) are downsampled to monthly means when served
  to charts to keep payloads and rendering fast.
- **Auth** is deliberately minimal (scrypt + HMAC-signed cookie sessions,
  seeded accounts) — appropriate for a classroom tool; swap for an identity
  provider before any broader deployment.

## 5. Tasks that require humans or external services

- **Deploy to Vercel (preview) / promote to production**: the repository
  builds cleanly (`pnpm build` is part of `pnpm verify`) and needs only
  `DATABASE_URL` + `SESSION_SECRET` configured in Vercel. Pushing the branch
  triggers the preview; merging to `main` promotes. Run a full FRED sync from
  `/admin/sync` after deploy.
- **Instructor sign-off**: each new lesson's economics content should be
  reviewed by the instructor before production; the lesson content lives in
  `prisma/seed/lessons/` for easy review.
