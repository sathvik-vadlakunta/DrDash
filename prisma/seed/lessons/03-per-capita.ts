import type { LessonSeed } from "../../../src/lib/lessons/schema";

/**
 * Lesson 3 — Wages, Compensation, and Income per Person.
 * Lesson plan lesson 5: the per-capita transform, and the wage versus total
 * compensation. Sources are all pre-existing catalog series.
 */
export const LESSON_03: LessonSeed = {
  slug: "per-capita",
  title: "Wages, Compensation, and Income per Person",
  summary:
    "Totals grow partly because the population does: divide GDP and disposable income by population to see what the average person actually gets, then compare the real wage with total compensation to find the pay growth hiding in benefits.",
  level: "INTRO",
  estimatedMinutes: 30,
  sortOrder: 50,
  planLesson: 5,
  content: {
    objectives: [
      "Explain why aggregate series like GDP and income grow partly because population grows",
      "Use the Per capita transform to restate a dollar aggregate as an amount per person",
      "Interpret real GDP per person as the standard summary measure of average living standards",
      "Distinguish the cash wage from total compensation and explain why compensation has grown faster",
    ],
    sources: ["GDPC1", "DSPI", "POPTHM", "COMPRNFB", "AHETPI", "USREC"],
    steps: [
      {
        id: "read-totals-vs-per-person",
        type: "READ",
        title: "Totals grow — but so does the number of people",
        body:
          "Aggregate series like GDP and total income rise for two very different reasons: the average person produces and earns more, and there are simply more people. The two are easy to conflate. The U.S. population has nearly doubled since 1959, from about 176 million to about 343 million, so a country-sized total can climb impressively even in years when the typical person gains little. To measure average prosperity we divide the total by the population — a per-capita (per person) measure. Dr. Dash's Per capita transform does this division for you, using the monthly U.S. population series (POPTHM) as the denominator.\n\nThis lesson also takes a second, related step from totals toward what workers actually receive. Your hourly wage is only the cash part of your pay. Employers also pay for health insurance, contribute to retirement plans, and pay their share of Social Security and Medicare taxes — together called benefits, or in the national accounts, \"supplements to wages and salaries.\" Benefits have grown from about 7% of total compensation in 1950 to roughly 18% today, so a wage series by itself increasingly understates what an hour of work earns. At the end of the lesson you will see how much that distinction matters.",
      },
      {
        id: "task-gdp-per-capita",
        type: "TASK",
        points: 10,
        title: "Plot real GDP per person",
        body:
          "Plot Real GDP (GDPC1) and set its transform to Per capita. Dr. Dash divides each quarter's real GDP by the U.S. population; because the monthly population series begins in 1959, that is where the per-capita line starts. This is the single most widely used measure of a country's average material living standard.\n\nReal GDP per person grows from about $19,000 in 1959 (in 2017 dollars) to just over $70,000 today — roughly a 3.7-fold rise. Compare that with total real GDP, which rose about 7-fold over the same years: population nearly doubling accounts for the difference. Notice too that the line is not smooth — output per person fell about 5% in the 2008–09 recession and about 9% in the spring of 2020 before recovering.",
        hint: "Open Output & Income → Real Gross Domestic Product, then set its transform to Per capita.",
        target: {
          series: [{ id: "GDPC1", transform: "PER_CAPITA" }],
        },
      },
      {
        id: "q-why-per-capita",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "Why divide by population?",
        body:
          "GDP per capita is total real GDP divided by the population. What does dividing by population accomplish that the total alone cannot?",
        options: [
          "It removes the effect of inflation from the series",
          "It separates growth in what the average person has from growth in the number of people",
          "It corrects for measurement error in the GDP statistics",
          "It converts GDP from an annual rate to a quarterly rate",
        ],
        correctIndex: 1,
        explanation:
          "Total real GDP rose about 7-fold since 1959, but the population almost doubled over those same years; per person, real GDP rose about 3.7-fold — roughly half the multiple of the headline total. Dividing by population isolates the rise in the average person's output from the rise in the count of people — inflation is a separate problem, handled by the Real transform.",
        sources: ["GDPC1", "POPTHM"],
      },
      {
        id: "task-income-per-person",
        type: "TASK",
        points: 10,
        title: "Disposable income per person",
        body:
          "GDP measures production; households care more directly about income. Plot Disposable Personal Income (DSPI) — total personal income after taxes, the money households can actually spend or save — and set its transform to Per capita.\n\nPer person, disposable income climbs from about $2,000 a year in 1959 to nearly $70,000 today, a roughly 35-fold rise, while the total rose almost 70-fold — again, population growth explains the gap between the two. But read this chart with Lesson 2 in mind: DSPI is a nominal series, and the Per capita transform removes population growth, not inflation. These are current dollars, so much of that 35-fold climb is rising prices rather than rising purchasing power. Each transform strips out exactly one thing — always ask which distortions a chart has and has not corrected for.",
        hint: "Open Output & Income → Disposable Personal Income, then set its transform to Per capita.",
        target: {
          series: [{ id: "DSPI", transform: "PER_CAPITA" }],
        },
      },
      {
        id: "task-compensation-vs-wage",
        type: "TASK",
        points: 10,
        title: "The wage versus total compensation",
        body:
          "Now compare the two measures of what an hour of work earns. Plot Real Hourly Compensation (COMPRNFB) as a level — an inflation-adjusted index (2017 = 100) of wages plus benefits per hour in the nonfarm business sector. Then add Average Hourly Earnings (AHETPI) with the Real (inflation-adjusted) transform — the cash wage alone. The two lines are in different units (an index and dollars), so compare their slopes, not their heights.\n\nThe divergence is striking. Since early 1973 real hourly compensation has risen about 60%, while the CPI-deflated wage is still only a few percent above its 1973 level; since 1964 compensation has doubled while the real wage rose about 20%. The main reason is benefits: employer payments for health insurance, retirement, and social insurance grew far faster than cash pay, and they count in compensation but not in the wage. (The series also differ in coverage — compensation spans all nonfarm business workers, while AHETPI covers production and nonsupervisory workers — but benefits do most of the work.)",
        hint: "Open Productivity & Costs → Real Hourly Compensation (transform Level), then add Labor Market & Population → Average Hourly Earnings (production & nonsupervisory) with the Real (inflation-adjusted) transform.",
        target: {
          series: [
            { id: "COMPRNFB", transform: "LEVEL" },
            { id: "AHETPI", transform: "REAL" },
          ],
        },
      },
      {
        id: "q-compensation-vs-wage",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "Why has compensation outgrown the wage?",
        body:
          "On your chart, real hourly compensation has grown much faster since the 1970s than the real hourly wage. What is the main reason total compensation has outgrown wages alone?",
        options: [
          "Employment has grown, so the economy-wide wage bill is much larger than in 1973",
          "The compensation series is not adjusted for inflation, while the wage series is",
          "Employer-paid benefits — health insurance, retirement contributions, and payroll taxes — have grown much faster than cash wages",
          "Workers put in far more hours per year than they did in the 1970s",
        ],
        correctIndex: 2,
        explanation:
          "Both series are per hour and both are inflation-adjusted, so neither employment growth nor hours nor inflation can explain the gap. What changed is the mix of pay: benefits grew from about 7% of total compensation in 1950 to roughly 18% today — employer health-insurance premiums especially — so total pay per hour rose much faster than the cash wage that workers see on their paychecks.",
        sources: ["COMPRNFB", "AHETPI"],
      },
    ],
  },
};
