import type { LessonSeed } from "../../../src/lib/lessons/schema";

/**
 * Lesson 4 — Economic Instability: Booms and Recessions.
 * Lesson plan lesson 3. Sources are all pre-existing catalog series.
 */
export const LESSON_04: LessonSeed = {
  slug: "recessions",
  title: "Economic Instability: Booms and Recessions",
  summary:
    "What the business cycle is, how the NBER dates recessions, and how to spot downturns in the data — real GDP growth turning negative, unemployment spiking, and the misery index summing up the pain.",
  level: "INTRO",
  estimatedMinutes: 30,
  sortOrder: 30,
  planLesson: 3,
  content: {
    objectives: [
      "Describe the phases of the business cycle: expansion, peak, recession, trough",
      "Explain how the NBER dates recessions and read recession shading on a chart",
      "Use real GDP growth and the unemployment rate to identify recessions in the data",
      "Interpret the misery index as a combined measure of unemployment and inflation pain",
    ],
    sources: ["GDPC1", "UNRATE", "DD_MISERY", "USREC"],
    steps: [
      {
        id: "read-business-cycle",
        type: "READ",
        title: "Expansions, recessions, and who decides",
        body:
          "Market economies don't grow in a straight line — they move in a business cycle. During an expansion, output, employment, and incomes rise. Eventually activity hits a peak and turns down: a recession, a broad decline in economic activity that lasts more than a few months. The recession ends at the trough, and a new expansion begins. Expansions are long (often years); recessions are short (usually about a year or less) but painful.\n\nWho decides when a recession officially starts and ends? Not the government — a committee of academic economists, the National Bureau of Economic Research's Business Cycle Dating Committee. Rather than applying a mechanical rule like \"two quarters of falling GDP,\" the NBER looks at a range of monthly indicators — employment, income, production, and sales — and dates the peak and trough months, often long after the fact. By the NBER's count the U.S. has had 12 recessions since 1948, from the 18-month slump of 2008–09 (the longest of the postwar era) to the two-month COVID collapse of 2020 (the shortest on record).\n\nOn Dr. Dash charts, NBER recessions appear as shaded vertical bands running from each peak to the following trough. Turning on recession shading is the fastest way to check how any series behaves in downturns — you'll use it throughout this lesson.",
      },
      {
        id: "task-gdp-growth-recessions",
        type: "TASK",
        points: 10,
        title: "Real GDP growth with recession shading",
        body:
          "Plot Real GDP (GDPC1), apply the Growth Rate transformation, and turn on recession shading. The pattern is unmistakable: in expansion the line oscillates around 2–4%, and in nearly every shaded band it falls sharply and dips below zero — falling real output is the core of what a recession is.\n\nTwo bands stand out. In 2020, real GDP fell almost 8% in a single quarter — the deepest one-quarter drop in records going back to 1947 — and year-over-year growth hit −7.4%. The 2008–09 recession was less deep but far longer: the deepest sustained contraction of the postwar era, with growth staying negative for four straight quarters and bottoming near −4% in mid-2009.",
        hint: "Open Output & Income → Real Gross Domestic Product, then set its transform to Growth Rate and turn on recession shading.",
        target: {
          series: [{ id: "GDPC1", transform: "YOY_GROWTH" }],
          recessions: true,
        },
      },
      {
        id: "q-gdp-in-recessions",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "Real GDP growth in the shaded bands",
        body:
          "Look across all the shaded recession bands on your chart. What typically happens to real GDP growth during a recession?",
        options: [
          "It falls sharply and usually turns negative",
          "It keeps growing at its normal 2–4% pace",
          "It accelerates as prices fall",
          "It is unrelated to the shaded bands",
        ],
        correctIndex: 0,
        explanation:
          "A recession is a broad decline in economic activity, so real output shrinks: year-over-year growth dipped below zero in nearly every shaded band, bottoming near −4% in mid-2009 and at −7.4% in 2020. That is why falling real GDP is the single most important recession signal.",
        sources: ["GDPC1", "USREC"],
      },
      {
        id: "task-unrate-recessions",
        type: "TASK",
        points: 10,
        title: "Unemployment across the cycle",
        body:
          "Now plot the Unemployment Rate (UNRATE) with recession shading on. Every shaded band produces a spike: unemployment jumped to 10.8% in late 1982, 10% in October 2009, and an unprecedented 14.8% in April 2020 — the highest monthly reading in records going back to 1948.\n\nNotice the asymmetry. Unemployment rises like a rocket and falls like a feather: the spikes are nearly vertical, but the declines afterward are long slopes. After peaking at 10% in October 2009, it took until September 2015 — six years — to get back to 5%. Even after the two-month 2020 recession, unemployment didn't fall below 4% until December 2021. Because firms keep cutting jobs after output has already turned around, unemployment is a lagging indicator — it usually keeps rising past the recession's official end.",
        hint: "Open Labor Market & Population → Unemployment Rate, keep its transform on Level, and turn on recession shading.",
        target: {
          series: [{ id: "UNRATE", transform: "LEVEL" }],
          recessions: true,
        },
      },
      {
        id: "q-unrate-peak",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "The postwar unemployment record",
        body:
          "Since monthly records began in 1948, when did the U.S. unemployment rate reach its highest level, and roughly how high did it go?",
        options: [
          "April 2020, at about 14.8%",
          "October 2009, at about 10%",
          "Late 1982, at about 10.8%",
          "1974, at about 20%",
        ],
        correctIndex: 0,
        explanation:
          "COVID lockdowns pushed unemployment to 14.8% in April 2020 — far above the previous postwar record of 10.8% set in late 1982 and the 10% peak of October 2009. (Only the Great Depression of the 1930s, before monthly records began, was worse.)",
        sources: ["UNRATE"],
      },
      {
        id: "task-misery-index",
        type: "TASK",
        points: 10,
        title: "The misery index",
        body:
          "Clear your chart and plot the Misery Index (DD_MISERY) — economist Arthur Okun's shorthand for how bad the economy feels to ordinary households. It is simply the unemployment rate plus the CPI inflation rate, so it rises when either jobs are scarce or prices are surging.\n\nThe worst sustained stretch is unmistakable: 1980, when the index sat above 20 for most of the year and peaked near 22 in May — roughly 7.5% unemployment stacked on top of 14% inflation. That combination of a stagnating economy and runaway prices is called stagflation, and it is why the late-1970s era looms so large in economic memory. For comparison, the index peaked around 12.8 in the Great Recession era (high unemployment, modest inflation) and about 15 in April 2020 (record unemployment, near-zero inflation).",
        hint: "Open Dr. Dash Constructed → Misery Index and keep its transform on Level.",
        target: {
          series: [{ id: "DD_MISERY", transform: "LEVEL" }],
        },
      },
      {
        id: "q-misery-worst",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "When was misery at its worst?",
        body:
          "According to the misery index, when did the U.S. economy feel worst to ordinary households in the postwar era?",
        options: [
          "Around 1980, during the stagflation era",
          "In 2009, during the Great Recession",
          "In April 2020, during the COVID lockdowns",
          "In the late 1990s tech boom",
        ],
        correctIndex: 0,
        explanation:
          "The misery index peaked near 22 in mid-1980 and stayed above 20 for most of that year, because stagflation delivered high unemployment and double-digit inflation at the same time. In the Great Recession era and in 2020 unemployment was high but inflation was low, so the index topped out around 12.8 and 15 respectively.",
        sources: ["DD_MISERY", "UNRATE"],
      },
    ],
  },
};
