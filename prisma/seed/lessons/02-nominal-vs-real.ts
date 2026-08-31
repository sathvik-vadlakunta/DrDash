import type { LessonSeed } from "../../../src/lib/lessons/schema";

/**
 * Lesson 2 — Wages and the Living Standard.
 * Lesson plan lesson 1: nominal versus real values, taught through the
 * average hourly wage. Sources are all pre-existing catalog series.
 */
export const LESSON_02: LessonSeed = {
  slug: "nominal-vs-real",
  title: "Wages and the Living Standard",
  summary:
    "Why a dollar figure means nothing without a price level next to it: plot sixty years of the nominal hourly wage, deflate it with the CPI, and discover that the real wage peaked in 1973 and took five decades to durably surpass that peak.",
  level: "INTRO",
  estimatedMinutes: 30,
  sortOrder: 10,
  planLesson: 1,
  content: {
    objectives: [
      "Distinguish nominal (current-dollar) values from real (inflation-adjusted) values",
      "Explain why a rising dollar wage does not by itself imply rising purchasing power",
      "Use the Real transform to deflate a nominal series by the CPI",
      "Describe the actual path of U.S. real hourly earnings: the 1973 peak, the long stagnation, and the recent recovery",
    ],
    sources: ["AHETPI", "CPIAUCSL", "USREC"],
    steps: [
      {
        id: "read-nominal-vs-real",
        type: "READ",
        title: "Dollars versus what dollars buy",
        body:
          "A wage is a number of dollars, but a living standard is what those dollars buy. Economists call a value measured in the dollars of its own time a nominal value, and a value adjusted for changes in the price level a real value. The distinction matters because the dollar itself is a moving yardstick: if your wage doubles while the price of everything you buy also doubles, your paycheck buys exactly what it did before. Nothing real has changed.\n\nTo recover the real story from a nominal series, we deflate it: divide the dollar figure by a price index such as the CPI, so every observation is restated in the dollars of a single base period. Dr. Dash does this for you — the Real transform divides any nominal dollar series by the CPI and re-expresses it in today's dollars, making 1970 and 2020 directly comparable.\n\nIn this lesson you will apply that idea to the most personal price in the economy: the average hourly wage of production and nonsupervisory workers, a series the BLS has tracked since 1964. First you will see the nominal wage, then the real one. They tell strikingly different stories.",
      },
      {
        id: "task-nominal-wage",
        type: "TASK",
        points: 10,
        title: "Plot the nominal hourly wage",
        body:
          "Plot Average Hourly Earnings (AHETPI) as a level. The line climbs from $2.50 an hour in early 1964 to over $32 today — a roughly thirteen-fold increase — and it climbs almost without interruption: the annual average has never once fallen in six decades of data, and monthly dips are rare and tiny.\n\nTaken at face value, this chart says every generation of workers earned far more than the last. Keep it in mind — the next question asks what this line can and cannot tell you.",
        hint: "Open Labor Market & Population → Average Hourly Earnings (production & nonsupervisory), then set its transform to Level.",
        target: {
          series: [{ id: "AHETPI", transform: "LEVEL" }],
        },
      },
      {
        id: "q-nominal-proof",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "Does the rising line prove workers are better off?",
        body:
          "The nominal wage rose in essentially every year from 1964 to today. Does this chart, by itself, prove that workers' living standards rose over that period?",
        options: [
          "Yes — a higher dollar wage means each hour of work buys more",
          "No — prices also rose over the period, so the dollar wage alone says nothing about purchasing power",
          "Yes — as long as the wage rose in most individual years, purchasing power must have risen too",
          "No — because average wages say nothing about how many people were employed",
        ],
        correctIndex: 1,
        explanation:
          "The wage multiplied about thirteen-fold since 1964, but the CPI multiplied about eleven-fold over the same years — most of that impressive climb is inflation, not added purchasing power. To learn what happened to living standards you must compare the wage to prices, which is exactly what the Real transform does next.",
        sources: ["AHETPI", "CPIAUCSL"],
      },
      {
        id: "task-real-wage",
        type: "TASK",
        points: 10,
        title: "Deflate the wage: apply the Real transform",
        body:
          "Now set AHETPI's transform to Real (inflation-adjusted). Dr. Dash divides the nominal wage by the CPI and restates every month in today's dollars — and the triumphant staircase collapses into one of the most debated charts in economics.\n\nThe real wage rises briskly through the 1960s, peaks in January 1973 at about $31 in today's dollars, and then falls for more than two decades: by the mid-1990s trough it had lost roughly a fifth of its purchasing power, bottoming near $25. The slow recovery that followed took until the 2020s to fully undo the damage. The spike in April 2020 is partly a statistical illusion — pandemic layoffs removed millions of low-wage workers from the average — and the 2021–22 inflation surge pushed the real wage back below the 1973 level for another year. Only since 2023 has it durably exceeded the peak set half a century earlier.\n\nSame series, same dollars — but deflating by the CPI turns \"wages rose thirteen-fold\" into \"an hour of work buys only a few percent more than it did in 1973.\" That is why economists insist on real values.",
        hint: "Open Labor Market & Population → Average Hourly Earnings (production & nonsupervisory), then set its transform to Real (inflation-adjusted).",
        target: {
          series: [{ id: "AHETPI", transform: "REAL" }],
        },
      },
      {
        id: "q-real-wage-peak",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "When did the real wage peak?",
        body:
          "Look at your real-wage chart. In which decade did the average real hourly wage reach the peak that then stood for roughly fifty years?",
        options: ["The 1960s", "The 1970s", "The 1980s", "The 1990s"],
        correctIndex: 1,
        explanation:
          "The CPI-deflated wage peaked in January 1973, early in the 1970s. The oil shocks and double-digit inflation that followed ate away at paychecks faster than employers raised them, and the real wage then drifted down to its mid-1990s trough — about 19% below the peak — before beginning its long recovery.",
        sources: ["AHETPI", "CPIAUCSL"],
      },
      {
        id: "q-real-wage-arithmetic",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "The real-wage arithmetic",
        body:
          "Suppose nominal wages rise 5% over a year while consumer prices rise 7%. What happens to the real wage?",
        options: [
          "It rises about 2%",
          "It falls about 2%",
          "It rises about 5%",
          "It is unchanged, because wages still went up",
        ],
        correctIndex: 1,
        explanation:
          "Real wage growth is approximately nominal wage growth minus inflation: 5% − 7% ≈ −2%. This is not hypothetical — in mid-2022 nominal wages were growing about 6.6% while CPI inflation ran near 9%, so real wages were falling even as paychecks posted their fastest dollar gains in decades.",
        sources: ["AHETPI", "CPIAUCSL"],
      },
    ],
  },
};
