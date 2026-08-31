import type { LessonSeed } from "../../../src/lib/lessons/schema";

/**
 * Lesson 9 — Monetary Policy & Interest Rates.
 * Lesson plan lesson 9. Sources are all pre-existing catalog series.
 */
export const LESSON_09: LessonSeed = {
  slug: "monetary-policy",
  title: "Monetary Policy & Interest Rates",
  summary:
    "How the Federal Reserve pursues its dual mandate by steering the federal funds rate — the recession-and-expansion rate cycle, how the Fed's rate propagates into mortgage, corporate, and credit card rates, and why the real (inflation-adjusted) rate is the true measure of the policy stance.",
  level: "INTRO",
  estimatedMinutes: 35,
  sortOrder: 90,
  planLesson: 9,
  content: {
    objectives: [
      "State the Fed's dual mandate and explain how the FOMC uses the federal funds rate to pursue it",
      "Identify the Fed's cut-into-recessions, raise-in-expansions pattern against recession shading",
      "Explain why mortgage, corporate bond, and credit card rates sit above the federal funds rate as risk premia",
      "Distinguish nominal from real interest rates and recognize periods when the real rate was negative",
    ],
    sources: [
      "FEDFUNDS",
      "MORTGAGE30US",
      "BAA",
      "AAA",
      "TERMCBCCALLNS",
      "DD_REAL_FFR",
      "USREC",
    ],
    steps: [
      {
        id: "read-dual-mandate",
        type: "READ",
        title: "The dual mandate and the Fed's main lever",
        body:
          "The Federal Reserve Act gives the Fed a dual mandate: price stability and maximum employment. The body that acts on it is the Federal Open Market Committee (FOMC) — the seven Fed governors, the New York Fed president (a permanent voter), and four other regional Reserve Bank presidents who rotate — which meets roughly every six weeks to set the stance of monetary policy.\n\nIts primary tool is the federal funds rate: the overnight rate banks charge one another to borrow reserves. The FOMC sets a target for this rate, and because nearly every other interest rate in the economy is priced off the cost of overnight money, moving it moves mortgage rates, corporate bond yields, and credit card rates too.\n\nThe logic runs in both directions. Raising the rate makes borrowing more expensive, which cools spending and investment and eases inflation pressure. Cutting it makes borrowing cheap, stimulating a weak economy. Watching this one rate is watching the Fed's foot move between the brake and the gas.",
      },
      {
        id: "task-fedfunds-recessions",
        type: "TASK",
        points: 10,
        title: "The federal funds rate across the business cycle",
        body:
          "Plot the Effective Federal Funds Rate (FEDFUNDS) and turn on recession shading. The Fed cuts rates going into recessions and raises them during expansions — find this pattern.\n\nThe saw-tooth shape is monetary policy at work: the rate climbs through each expansion — to 6.5% in 2000 and about 5.25% in 2006–07 — then plunges as each shaded band arrives, hitting 0.16% by December 2008 and just 0.05% in April 2020. The extreme case is the early 1980s, when the Volcker Fed pushed the rate above 19% in mid-1981 to break inflation, accepting a deep recession as the price.",
        hint: "Open Money, Banking & Interest Rates → Effective Federal Funds Rate, and turn on recession shading.",
        target: {
          series: [{ id: "FEDFUNDS", transform: "LEVEL" }],
          recessions: true,
        },
      },
      {
        id: "q-zero-rate-years",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "How long at zero?",
        body:
          "After the 2008–09 recession, approximately how many years did the Fed keep rates near zero?",
        options: ["About 2 years", "About 7 years", "About 12 years", "About 1 year"],
        correctIndex: 1,
        explanation:
          "The Fed cut the funds rate to essentially zero in December 2008 and did not raise it until December 2015 — about seven years pinned near zero, by far the longest such stretch in the series to that point. The slow recovery from the financial crisis kept the Fed on hold far longer than after any prior postwar recession.",
        sources: ["FEDFUNDS"],
      },
      {
        id: "task-rate-spreads",
        type: "TASK",
        points: 10,
        title: "From the Fed's rate to the rates you pay",
        body:
          "Now add the 30-Year Fixed Mortgage Rate (MORTGAGE30US), Moody's Baa Corporate Bond Yield (BAA), and the Credit Card Interest Rate (TERMCBCCALLNS) alongside the federal funds rate.\n\nAll of these rates track the Fed's moves — when the funds rate jumped from near zero to over 5% in 2022–23, mortgages went from a record-low 2.65% in early 2021 to nearly 7.8% by late 2023. But look at the levels: credit card rates have hovered above 20% in recent years even as the funds rate came back below 4%, with mortgage rates near 6.7% and Baa corporate bonds around 6% in between.\n\nThose gaps are risk premia. An overnight loan between banks is nearly risk-free; a mortgage is secured by a house; a Baa-rated corporation might default; unsecured credit card debt is the riskiest of all, so it carries the widest spread. (Add the Aaa yield too if you want to see that even the safest corporations pay a premium over the Fed's rate.)",
        hint: "Open Money, Banking & Interest Rates and add Effective Federal Funds Rate, 30-Year Fixed Mortgage Rate, Moody's Baa Corporate Bond Yield, and Credit Card Interest Rate (all accounts), each as Level.",
        target: {
          series: [
            { id: "FEDFUNDS", transform: "LEVEL" },
            { id: "MORTGAGE30US", transform: "LEVEL" },
            { id: "BAA", transform: "LEVEL" },
            { id: "TERMCBCCALLNS", transform: "LEVEL" },
          ],
        },
      },
      {
        id: "q-zero-lower-bound",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "A constraint on monetary policy",
        body:
          "The Federal Funds Rate chart from 2009–2015 illustrates which constraint on monetary policy?",
        options: [
          "The zero lower bound",
          "The Phillips curve",
          "The Taylor rule",
          "Quantitative tightening",
        ],
        correctIndex: 0,
        explanation:
          "With the funds rate already at essentially zero, the Fed could not cut further to stimulate a still-weak economy — nominal interest rates cannot go meaningfully below zero because lenders would rather hold cash. This \"zero lower bound\" is why the Fed turned to unconventional tools like quantitative easing and forward guidance during those years.",
        sources: ["FEDFUNDS"],
      },
      {
        id: "task-real-ffr",
        type: "TASK",
        points: 10,
        title: "The real federal funds rate",
        body:
          "Plot the federal funds rate next to the Real Federal Funds Rate (DD_REAL_FFR) — the nominal rate minus year-over-year CPI inflation. When real rates are negative, borrowing in real terms is essentially free — an aggressively stimulative stance. Identify the periods of negative real rates.\n\nTwo episodes stand out. From late 1974 through 1977 the real rate stayed negative, bottoming near −5% in early 1975 — even though the nominal rate was over 6%, inflation was running above 11%. And from late 2019 through early 2023 the real rate went negative again, this time because the nominal rate sat near zero while inflation surged. The lesson: a nominal rate tells you nothing about the policy stance until you subtract inflation.",
        hint: "Keep FEDFUNDS on the chart, then open Dr. Dash Constructed → Real Federal Funds Rate.",
        target: {
          series: [
            { id: "FEDFUNDS", transform: "LEVEL" },
            { id: "DD_REAL_FFR", transform: "LEVEL" },
          ],
        },
      },
      {
        id: "q-deepest-negative-real",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "When was money cheapest in real terms?",
        body: "During which period were real interest rates most deeply negative?",
        options: ["The mid-1970s", "2009–2015", "2021–2022", "1990–1991"],
        correctIndex: 2,
        explanation:
          "In early 2022 the funds rate was still near zero while CPI inflation approached 9%, pushing the real rate to about −8% — deeper than the mid-1970s troughs near −5% and far below anything in the 2009–2015 zero-rate era. It was the most negative real federal funds rate in the entire postwar record.",
        sources: ["DD_REAL_FFR", "FEDFUNDS"],
      },
    ],
  },
};
