import type { LessonSeed } from "../../../src/lib/lessons/schema";

/**
 * Lesson 8 — Inflation: The Price Level Over Time.
 * Lesson plan lesson 8. Sources are all pre-existing catalog series.
 */
export const LESSON_08: LessonSeed = {
  slug: "inflation",
  title: "Inflation: The Price Level Over Time",
  summary:
    "What inflation is, how the CPI and PCE price indexes measure it, and how to read seventy years of U.S. inflation history — the 1970s surge, the Volcker disinflation, and the 2021–22 spike.",
  level: "INTRO",
  estimatedMinutes: 35,
  sortOrder: 80,
  planLesson: 8,
  content: {
    objectives: [
      "Define inflation and explain how the CPI and PCE price indexes are constructed",
      "Use the growth-rate transformation to turn a price level into an inflation rate",
      "Distinguish headline from core inflation and explain why the Fed watches core",
      "Explain why the Fed states its 2% target in terms of the PCE index",
    ],
    sources: ["CPIAUCSL", "CPILFESL", "PCEPI", "PCEPILFE", "AHETPI", "USREC"],
    steps: [
      {
        id: "read-what-is-inflation",
        type: "READ",
        title: "What inflation measures — and how we measure it",
        body:
          "Inflation is the rate at which the overall price level rises, eroding what each dollar buys. The best-known measure is the Consumer Price Index (CPI). The Bureau of Labor Statistics builds it by pricing a fixed market basket — the goods and services a typical urban household buys, with weights taken from consumer spending surveys — and tracking the basket's cost month by month.\n\nThe PCE price index measures the same idea differently. Its weights come from what households actually spend in the national accounts rather than from surveys, it covers a broader set of spending (including things paid on your behalf, like employer-provided health care), and its weights update continuously as people substitute toward cheaper goods. Because of that substitution effect, PCE inflation usually runs a bit below CPI inflation.\n\nBoth matter: the CPI drives cost-of-living adjustments for wages and Social Security, while the PCE is the index the Federal Reserve targets when it says it aims for 2% inflation.",
      },
      {
        id: "task-cpi-growth",
        type: "TASK",
        points: 10,
        title: "Plot the CPI and turn it into an inflation rate",
        body:
          "Plot CPI — All Items (CPIAUCSL). As a level, it climbs relentlessly — that's the price level. Now apply the Growth Rate transformation to see inflation itself: the percent change from a year earlier.\n\nYou should be able to spot three episodes: the 1970s surge, when inflation twice broke above 10%; the sharp fall after 1980, when the Volcker Fed drove inflation down from ~14% to ~3% (the \"Volcker disinflation\"); and the 2021–22 spike, when inflation touched 9% for the first time in four decades.",
        hint: "Open Prices & Inflation → CPI — All Items, then set its transform to Growth Rate.",
        target: {
          series: [{ id: "CPIAUCSL", transform: "YOY_GROWTH" }],
        },
      },
      {
        id: "q-wages-vs-inflation",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "Wages versus inflation, 2021–22",
        body:
          "Add Average Hourly Earnings (AHETPI) with the Growth Rate transform next to CPI inflation and look at 2021–22. During the inflation surge, did nominal wages grow faster or slower than CPI inflation?",
        options: [
          "Faster — wages outpaced inflation",
          "Slower — wages lagged inflation",
          "At exactly the same rate",
          "Cannot be determined from these series",
        ],
        correctIndex: 1,
        explanation:
          "Through most of 2021–22, CPI inflation (peaking near 9%) ran ahead of nominal wage growth (around 5–6%), so real purchasing power fell even as paychecks grew. Real wages only began recovering once inflation cooled in 2023.",
        sources: ["CPIAUCSL", "AHETPI"],
      },
      {
        id: "task-core-cpi",
        type: "TASK",
        points: 10,
        title: "Add core CPI: headline versus core",
        body:
          "Add Core CPI (CPILFESL) — the CPI excluding food and energy — to your growth-rate chart, keeping headline CPI in place.\n\n\"Headline\" inflation is the all-items number households experience at the pump and the grocery store. \"Core\" strips out food and energy because their prices swing with weather and world oil markets, not with the underlying trend. When setting monetary policy the Fed leans on core measures: they are a better predictor of where inflation is heading once temporary shocks pass.",
        hint: "Keep CPIAUCSL (Growth Rate) on the chart and add CPILFESL with the Growth Rate transform.",
        target: {
          series: [
            { id: "CPIAUCSL", transform: "YOY_GROWTH" },
            { id: "CPILFESL", transform: "YOY_GROWTH" },
          ],
        },
      },
      {
        id: "q-headline-vs-core",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "What drove headline above core in the 1970s?",
        body:
          "Look at the 1970s on your chart. Headline CPI inflation repeatedly spiked well above core inflation. What primarily drove headline inflation above core in those episodes?",
        options: [
          "Oil price shocks",
          "Government overspending",
          "Rapid wage growth",
          "Tax cuts",
        ],
        correctIndex: 0,
        explanation:
          "The 1973–74 OPEC embargo and the 1979 oil shock sent energy prices soaring. Energy is excluded from core, so headline (which includes it) spiked far above core in both episodes — exactly the kind of supply shock the core measure is designed to look through.",
        sources: ["CPIAUCSL", "CPILFESL"],
      },
      {
        id: "task-pce-vs-cpi",
        type: "TASK",
        points: 10,
        title: "Compare PCE and CPI inflation",
        body:
          "Now clear your chart and plot the PCE Price Index (PCEPI) growth rate alongside the CPI (CPIAUCSL) growth rate.\n\nThe two track each other closely, but look carefully: PCE inflation consistently runs about 0.3 percentage points below CPI inflation. The gap comes from PCE's broader coverage and its continuously updating weights, which capture households substituting toward cheaper goods. This is the index the Fed actually targets — so \"2% inflation\" means 2% on this line, not the CPI line.",
        hint: "Add PCEPI with the Growth Rate transform; keep CPIAUCSL (Growth Rate) for comparison.",
        target: {
          series: [
            { id: "PCEPI", transform: "YOY_GROWTH" },
            { id: "CPIAUCSL", transform: "YOY_GROWTH" },
          ],
        },
      },
      {
        id: "q-fed-target-index",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "The Fed's 2% target",
        body: "The Federal Reserve's 2% inflation target is measured using which index?",
        options: ["CPI", "Core CPI", "PCE", "PPI"],
        correctIndex: 2,
        explanation:
          "Since 2012 the FOMC has stated its longer-run 2% goal in terms of the PCE price index, preferring its broader coverage and updating weights. (It watches core PCE closely as a guide, but the target itself is headline PCE.)",
        sources: ["PCEPI"],
      },
    ],
  },
};
