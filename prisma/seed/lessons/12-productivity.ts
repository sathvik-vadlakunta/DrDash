import type { LessonSeed } from "../../../src/lib/lessons/schema";

/**
 * Lesson 12 — Productivity and the Wage Gap.
 * Lesson plan lesson 12. Sources are all pre-existing catalog series.
 */
export const LESSON_12: LessonSeed = {
  slug: "productivity",
  title: "Productivity and the Wage Gap",
  summary:
    "Labor productivity — output per hour — is the engine of long-run wage growth. This lesson connects back to Lesson 1 (Wages and the Living Standard) and Lesson 5 (Wages, Compensation, and Income per Person): why the wage series you met there tracked productivity until 1973, and why a gap has been widening ever since.",
  level: "INTRO",
  estimatedMinutes: 35,
  sortOrder: 120,
  planLesson: 12,
  content: {
    objectives: [
      "Define labor productivity as output per hour and explain why it sets the ceiling on long-run real wage growth",
      "Identify the four major eras of postwar U.S. productivity growth on a chart",
      "Measure the post-1973 divergence between productivity and real hourly compensation — the productivity–pay gap",
      "Connect stagnant real wages for production workers to a shifting split of output between labor and capital",
    ],
    sources: [
      "OPHNFB",
      "COMPRNFB",
      "ULCNFB",
      "AHETPI",
      "OUTNFB",
      "HOANBS",
      "USREC",
    ],
    steps: [
      {
        id: "read-productivity-engine",
        type: "READ",
        title: "Output per hour: the engine of the living standard",
        body:
          "Labor productivity is output per hour of work. The headline measure, Output per Hour (OPHNFB), is literally a ratio of two other series in your catalog: real output of the nonfarm business sector (OUTNFB) divided by hours worked (HOANBS). In the long run an economy can only pay its workers more per hour, on average, if it produces more per hour — productivity growth is the engine of sustained real wage growth.\n\nPostwar U.S. productivity history breaks into four eras. From 1948 to 1973 — the post-WWII boom — growth averaged nearly 3% a year and output per hour roughly doubled. In the mid-1970s growth abruptly halved, to about 1.5% a year through the mid-1990s: the famous productivity slowdown. The IT and internet investment boom of the mid-1990s to early 2000s pushed growth back to roughly 3%. Then, after about 2005, growth slipped back near 1.5% and stayed there. Economists still debate the causes of each break.",
      },
      {
        id: "task-productivity-growth",
        type: "TASK",
        points: 10,
        title: "Plot productivity growth and find the eras",
        body:
          "Plot Output per Hour (OPHNFB) and apply the Growth Rate transformation. The year-over-year line is noisy quarter to quarter, so squint at where its center of gravity sits in each era.\n\nBefore 1973 the line hovers around 3% — the postwar average was 2.8% a year. After 1973 it drops to roughly 1.5–2%: from 1974 through 1995 growth averaged just 1.5%. Now find the internet-era surge: from the mid-1990s through the early 2000s the line climbs back to about 3% a year, the strongest sustained run since the boom. It doesn't last — from 2005 through 2019 growth averaged about 1.5% again. That one-and-a-half-point difference sounds small, but compounded over decades it is the difference between living standards doubling every 24 years and every 47.",
        hint: "Open Productivity & Costs → Output per Hour (Labor Productivity), then set its transform to Growth Rate.",
        target: {
          series: [{ id: "OPHNFB", transform: "YOY_GROWTH" }],
        },
      },
      {
        id: "q-slowdown-decade",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "When did the fast-growth era end?",
        body:
          "In which decade did U.S. labor productivity growth slow most dramatically relative to the post-WWII norm?",
        options: ["1980s", "1970s", "2010s", "1960s"],
        correctIndex: 1,
        explanation:
          "Productivity growth averaged nearly 3% a year from 1948 through 1973, then fell by about half in the mid-1970s — the 1974–1995 average was roughly 1.5%. Later decades were also slow (the 2010s averaged just 1.3%), but the 1970s is when the break from the postwar norm actually happened. Its causes — oil shocks, the end of catch-up investment, measurement problems — are still debated.",
        sources: ["OPHNFB"],
      },
      {
        id: "task-productivity-vs-compensation",
        type: "TASK",
        points: 10,
        title: "Productivity versus pay: watch the gap open",
        body:
          "Keep productivity growth on the chart and add Real Hourly Compensation (COMPRNFB) with the Growth Rate transform. Compensation is the broadest pay measure — wages plus benefits, inflation-adjusted — for the same nonfarm business sector.\n\nFor the first quarter-century after WWII the two lines rise and fall together: between 1948 and 1973 output per hour rose about 100% and real hourly compensation about 94%. Workers were paid, almost one for one, for what they produced. After 1973 the lines part company. Since then output per hour has risen more than 160% while real hourly compensation has risen only about 60% — the productivity–pay gap. The Dr. Dash constructed series Wage–Productivity Gap (DD_WAGE_PRICE_GAP) distills it into one line: compensation growth minus productivity growth, negative whenever workers are not fully capturing productivity gains. Unit Labor Costs (ULCNFB) is the mirror image — labor cost per unit of output, which rises only when pay outruns productivity.",
        hint: "Keep OPHNFB (Growth Rate) on the chart and add Productivity & Costs → Real Hourly Compensation with the Growth Rate transform.",
        target: {
          series: [
            { id: "OPHNFB", transform: "YOY_GROWTH" },
            { id: "COMPRNFB", transform: "YOY_GROWTH" },
          ],
        },
      },
      {
        id: "q-productivity-pay-gap",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "Who gets the extra output?",
        body:
          "If productivity grows faster than real hourly compensation over a sustained period, which of the following is most likely occurring?",
        options: [
          "Labor is capturing a growing share of output",
          "Capital is capturing a larger share of output",
          "Inflation is falling",
          "The economy is in recession",
        ],
        correctIndex: 1,
        explanation:
          "Every hour of work produces more output, but workers' inflation-adjusted pay per hour rises more slowly — so the extra output must be flowing to other claimants: profits, interest, and rent. That means labor's share of total output is falling and capital's share is rising, which is exactly what the post-1973 U.S. data show.",
        sources: ["OPHNFB", "COMPRNFB"],
      },
      {
        id: "task-real-wage-vs-productivity",
        type: "TASK",
        points: 10,
        title: "The Lesson 1 wage, inflation-adjusted",
        body:
          "Now bring back Average Hourly Earnings (AHETPI) — the production-worker wage you first plotted in Lesson 1 — and apply the Real transform to state it in today's dollars. Add Output per Hour (OPHNFB) as a plain Level alongside it. The question: does the average worker's pay track what the average hour of work produces?\n\nIt did — until 1973. Measured in today's dollars, the real production-worker wage peaked in early 1973 at about $31 an hour, then fell for two decades, bottoming near $25 in the mid-1990s — a drop of almost 20%. It did not durably regain its 1973 level until the early 2020s, nearly fifty years later. Over that same half-century, output per hour never stopped climbing: it has more than doubled since 1973. One line goes flat for a generation; the other marches upward. That scissors pattern is the productivity–pay gap seen in levels rather than growth rates.",
        hint: "Open Labor Market & Population → Average Hourly Earnings (production & nonsupervisory) and set its transform to Real (inflation-adjusted), then add Productivity & Costs → Output per Hour (Labor Productivity) as a Level.",
        target: {
          series: [
            { id: "AHETPI", transform: "REAL" },
            { id: "OPHNFB", transform: "LEVEL" },
          ],
        },
      },
      {
        id: "q-labor-share-policy",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "Policy and the labor share",
        body:
          "Which policy is most associated with raising the labor share of income?",
        options: [
          "Reducing corporate tax rates",
          "Strengthening collective bargaining rights",
          "Cutting capital gains taxes",
          "Increasing depreciation allowances",
        ],
        correctIndex: 1,
        explanation:
          "Unions bargain directly over how revenue is split between pay and profits, so strengthening collective bargaining is the policy most commonly associated with a higher labor share — and the timing fits, since union membership and the labor share declined together after the 1970s. Be careful, though: economists actively debate how much of that correlation is causal, with automation, globalization, and rising market concentration as competing explanations for the falling labor share. The link is contested, not settled.",
        sources: ["COMPRNFB", "OPHNFB"],
      },
    ],
  },
};
