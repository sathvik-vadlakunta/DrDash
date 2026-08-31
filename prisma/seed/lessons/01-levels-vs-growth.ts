import type { LessonSeed } from "../../../src/lib/lessons/schema";

/**
 * Lesson 1 — Describing Economic Growth.
 * Lesson plan lesson 2. Sources are all pre-existing catalog series.
 */
export const LESSON_01: LessonSeed = {
  slug: "levels-vs-growth",
  title: "Describing Economic Growth",
  summary:
    "The difference between a level and a growth rate: what GDP measures, why nominal GDP overstates growth, and how to read real GDP growth around its ~3% postwar average — with recessions as the dips below zero.",
  level: "INTRO",
  estimatedMinutes: 30,
  sortOrder: 20,
  planLesson: 2,
  content: {
    objectives: [
      "Explain what GDP measures and distinguish a level from a growth rate",
      "Explain why nominal GDP growth overstates real growth and why economists describe growth with the real series",
      "Use the growth-rate transformation and recession shading to read the business cycle in real GDP",
      "State the approximate postwar average of real GDP growth and how growth since 2000 compares",
    ],
    sources: ["GDP", "GDPC1", "USREC"],
    steps: [
      {
        id: "read-levels-and-growth",
        type: "READ",
        title: "Levels tell you size; growth rates tell you direction",
        body:
          "Gross Domestic Product (GDP) is the market value of all final goods and services produced in the United States in a year. It is the single most-watched number in economics because it measures the size of the whole economy: every car, haircut, and software subscription produced, added up at market prices.\n\nBut \"how big is the economy?\" and \"how is the economy doing?\" are different questions. A level answers the first — the economy's size at a moment in time. A growth rate answers the second — the percent change from a year earlier, telling you the economy's direction and speed. Headlines almost never report the level (\"GDP was $30 trillion\"); they report the growth rate (\"the economy grew 2.5%\"), because that is what tells you whether things are speeding up or stalling.\n\nOne more wrinkle: GDP is measured in dollars, and dollars themselves change value as prices rise. Nominal GDP grows whenever the economy produces more stuff or whenever prices go up — it mixes the two together. That is why economists describe growth using real GDP, which is adjusted for inflation so that its movements reflect changes in actual production. In this lesson you will plot both and see how different a story they tell.",
      },
      {
        id: "task-nominal-vs-real-levels",
        type: "TASK",
        points: 10,
        title: "Plot nominal and real GDP as levels",
        body:
          "Plot Gross Domestic Product (GDP) and Real Gross Domestic Product (GDPC1) on the same chart, both as levels.\n\nBoth lines climb, but the nominal line climbs far faster: nominal GDP has grown from about $243 billion in 1947 to over $30 trillion today — a more than 130-fold increase — while real GDP has grown about 11-fold over the same stretch. The gap between those two multiples is inflation. Nominal GDP rises whenever prices rise, even if the economy produces nothing extra, so most of its spectacular ascent is dollars getting smaller, not the economy getting bigger.\n\nNotice also where the lines cross, around 2017. Real GDP is stated in chained 2017 dollars, so in 2017 the two measures coincide by construction; before that, prices were lower than 2017 prices, so nominal sits below real, and after, above.",
        hint: "Open Output & Income → Gross Domestic Product and Real Gross Domestic Product; leave both transforms set to Level.",
        target: {
          series: [
            { id: "GDP", transform: "LEVEL" },
            { id: "GDPC1", transform: "LEVEL" },
          ],
        },
      },
      {
        id: "q-why-real-gdp",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "Why real GDP, not nominal?",
        body:
          "When economists say \"the economy grew 3% last year,\" they mean real GDP, not nominal. Why is real GDP the right series for describing growth?",
        options: [
          "Nominal GDP growth mixes price changes with output changes; real GDP isolates changes in actual production",
          "Real GDP is measured more frequently than nominal GDP",
          "Nominal GDP excludes services, so it understates the economy's size",
          "Real GDP includes goods produced by Americans abroad, so it is more complete",
        ],
        correctIndex: 0,
        explanation:
          "Nominal GDP rises when the economy produces more or when prices rise, so its growth rate confounds the two. Real GDP holds prices fixed (in chained 2017 dollars), so its growth reflects only changes in the quantity of goods and services produced — which is what \"economic growth\" means.",
        sources: ["GDP", "GDPC1"],
      },
      {
        id: "task-real-gdp-growth",
        type: "TASK",
        points: 10,
        title: "Turn real GDP into a growth rate, with recessions shaded",
        body:
          "Now plot Real GDP (GDPC1) by itself and apply the Growth Rate transformation, then turn on recession shading. The relentless upward climb becomes a jagged line oscillating around its postwar average of roughly 3% per year — this is the chart economists actually look at when they talk about how the economy is doing.\n\nThe shaded bands are recessions as dated by the NBER, and in nearly every one the growth line dips below zero — the economy shrinking. The 2008–09 financial crisis pushed growth to about −4%, and the 2020 pandemic produced the deepest plunge in the postwar record, about −7% year over year. In between the shaded bands, growth spends most of its time in positive territory: expansions are long, recessions are short and sharp.",
        hint: "Open Output & Income → Real Gross Domestic Product, set its transform to Growth Rate, and switch on recession shading.",
        target: {
          series: [{ id: "GDPC1", transform: "YOY_GROWTH" }],
          recessions: true,
        },
      },
      {
        id: "q-growth-since-2000",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "How fast has the economy grown since 2000?",
        body:
          "Look at your growth-rate chart from 2000 onward and compare it with the earlier postwar decades. Approximately what has real GDP growth averaged since 2000?",
        options: [
          "About 2% per year — noticeably slower than the postwar norm",
          "About 3.5% per year — the same as the postwar norm",
          "About 5% per year — faster than the postwar norm",
          "About 0% — the economy has essentially stopped growing",
        ],
        correctIndex: 0,
        explanation:
          "From 1948 through 1999 real GDP growth averaged about 3.5% per year; since 2000 it has averaged only about 2%. Slower labor-force growth and slower productivity growth are the usual explanations for the step down — a percentage point and a half that compounds into an enormous difference over decades.",
        sources: ["GDPC1"],
      },
      {
        id: "q-level-vs-slope",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "Reading a growth chart",
        body:
          "Suppose real GDP grew 4% last year and 2% this year. Can the level of real GDP be rising at the same time that its growth rate is falling?",
        options: [
          "Yes — growth measures the slope of the level series, so the level keeps rising as long as growth is positive, even while growth falls",
          "No — a falling growth rate means the level must be falling too",
          "Only during a recession",
          "Only if inflation is also falling",
        ],
        correctIndex: 0,
        explanation:
          "The growth rate is the slope of the level series, not its height. Going from 4% to 2% means the economy is still expanding, just more slowly — the level line keeps rising but flattens. The level only falls when the growth rate crosses below zero, as it does in most recessions.",
        sources: ["GDPC1"],
      },
    ],
  },
};
