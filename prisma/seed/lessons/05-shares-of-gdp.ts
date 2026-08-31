import type { LessonSeed } from "../../../src/lib/lessons/schema";

/**
 * Lesson 5 — The Expenditure Components of GDP.
 * Lesson plan lesson 7. Sources are all pre-existing catalog series.
 */
export const LESSON_05: LessonSeed = {
  slug: "shares-of-gdp",
  title: "The Expenditure Components of GDP",
  summary:
    "The expenditure identity Y = C + I + G + NX, and how the percent-of-GDP transform reveals each component's share: consumption's slow rise toward two-thirds of GDP, investment's violent cyclical swings, government's drift down from its 1950s–60s peak, and the trade deficit that opened in the mid-1970s.",
  level: "INTRO",
  estimatedMinutes: 30,
  sortOrder: 70,
  planLesson: 7,
  content: {
    objectives: [
      "State the expenditure identity Y = C + I + G + NX and identify what each component measures",
      "Use the percent-of-GDP transform to compare components across eras despite growth and inflation",
      "Rank the components by size and by cyclical volatility",
      "Describe the long-run trends in each component's share, including the emergence of the trade deficit",
    ],
    sources: ["PCEC", "GPDI", "GCE", "NETEXP", "GDP", "USREC"],
    steps: [
      {
        id: "read-expenditure-identity",
        type: "READ",
        title: "Y = C + I + G + NX",
        body:
          "Everything the economy produces is bought by someone, so GDP can be measured by adding up spending: Y = C + I + G + NX. Consumption (C) is household spending on goods and services. Investment (I) is business spending on structures, equipment, and software, plus residential construction and inventory change — new capital, not stocks and bonds. Government purchases (G) count what governments buy directly (schools, highways, fighter jets); transfer payments like Social Security are excluded because the recipient does the spending, and it lands in C. Net exports (NX) is exports minus imports — negative whenever the U.S. buys more from abroad than it sells.\n\nComparing dollar amounts across decades is hopeless: nominal GDP was about $300 billion in 1950 and is roughly a hundred times larger today, so every component's line just climbs. Dividing each component by GDP fixes that. A share of GDP strips out both inflation and growth, making 1955 directly comparable to 2025 — and the four shares must sum to exactly 100%, so when one component claims a bigger slice, another must give ground.\n\nIn this lesson you will build the shares chart one component at a time with the Percent of another series transform, using GDP as the denominator.",
      },
      {
        id: "task-consumption-share",
        type: "TASK",
        points: 10,
        title: "Plot consumption as a share of GDP",
        body:
          "Plot Personal Consumption Expenditures (PCEC) and set its transform to Percent of another series, with GDP as the denominator (the default).\n\nTwo things stand out. First, the level: consumption is roughly two-thirds of GDP — by far the largest expenditure component. Second, the trend: the share is not constant. It hovered near 60% through the 1950s and 1960s, dipping below 59% in the late 1960s, then climbed steadily from the 1980s onward to about 68% today. That nine-point rise came partly at the expense of government purchases, as you will see later, and it is why forecasters obsess over the American consumer: when two-thirds of spending is households, the consumer is the economy.",
        hint: "Open Output & Income → Personal Consumption Expenditures, then set its transform to Percent of another series (GDP is the default denominator).",
        target: {
          series: [
            { id: "PCEC", transform: "PCT_OF", denominatorId: "GDP" },
          ],
        },
      },
      {
        id: "q-largest-component",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "The largest expenditure component",
        body:
          "Based on your chart, which expenditure component makes up the largest share of U.S. GDP?",
        options: [
          "Consumption (C)",
          "Investment (I)",
          "Government purchases (G)",
          "Net exports (NX)",
        ],
        correctIndex: 0,
        explanation:
          "Consumption is about 68% of GDP today and has never fallen below roughly 58% in the postwar data — several times the size of investment (typically 15–20%) or government purchases (17–25%). That dominance is why consumer spending data moves markets.",
        sources: ["PCEC", "GDP"],
      },
      {
        id: "task-investment-share",
        type: "TASK",
        points: 10,
        title: "Add investment — and turn on recession shading",
        body:
          "Keep consumption on the chart and add Gross Private Domestic Investment (GPDI), also as a percent of GDP. Then turn on recession shading.\n\nInvestment is much smaller than consumption — mostly between 15% and 20% of GDP — but look at its shape against the shaded bars: it collapses in every single recession. In 1973–75 the share fell from about 18% to 15%; in 1981–82 from about 20% to 16%; and in the Great Recession it plunged from nearly 20% in 2006 to under 13% by late 2009. The logic is straightforward: a household keeps buying groceries in a downturn, but a firm facing empty order books can simply postpone the new factory, and a family fearing layoffs can wait to build a house. Investment is the smallest of the big three components but the engine of the business cycle.",
        hint: "Keep PCEC (Percent of another series) on the chart, add Output & Income → Gross Private Domestic Investment with the same transform, and turn on recession shading.",
        target: {
          series: [
            { id: "PCEC", transform: "PCT_OF", denominatorId: "GDP" },
            { id: "GPDI", transform: "PCT_OF", denominatorId: "GDP" },
          ],
          recessions: true,
        },
      },
      {
        id: "q-most-volatile",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "The most volatile component",
        body:
          "Comparing the two lines on your chart across the shaded recessions, which expenditure component swings the most over the business cycle?",
        options: [
          "Consumption — households constantly adjust their spending",
          "Investment — firms and homebuilders postpone projects in downturns",
          "Government purchases — budgets are cut in every recession",
          "They are all about equally volatile",
        ],
        correctIndex: 1,
        explanation:
          "Investment's share drops sharply in every recession — in 2006–09 it lost about 7 percentage points of GDP — while consumption's share barely wobbles (it often rises in recessions, since GDP falls faster than household spending). Durable projects like factories and houses are easy to postpone, which makes investment the cycle's swing factor.",
        sources: ["GPDI", "PCEC", "GDP"],
      },
      {
        id: "task-all-four-shares",
        type: "TASK",
        points: 10,
        title: "Complete the picture: add G and NX",
        body:
          "Add the last two components as percents of GDP: Government Consumption Expenditures & Gross Investment (GCE) and Net Exports (NETEXP). Your chart now shows all four shares, and at any date they sum to 100%.\n\nGovernment purchases tell a story of drift downward. The share peaked above 25% in 1953, at the height of the Korean War build-up, stayed high — near 24% — during the Vietnam era of the late 1960s, and then slid for decades, reaching about 17% today (with a temporary bump toward 21% around 2009–10). Remember this is purchases only: transfers like Social Security and Medicare have grown, but they show up in C, not G.\n\nNet exports hug zero for the first three postwar decades — small and usually positive. Then, in the mid-1970s, the line crosses below zero and stays there: 1975 was the last year the U.S. exported more than it imported. The trade deficit widened to about 6% of GDP at its deepest in late 2005 and runs near 3% today. A persistent NX below zero means the other three components sum to more than 100% of GDP — the U.S. spends more than it produces, borrowing the difference from abroad.",
        hint: "Keep PCEC and GPDI on the chart, then add Output & Income → Government Consumption Expenditures & Gross Investment and Output & Income → Net Exports of Goods and Services, each with the Percent of another series transform.",
        target: {
          series: [
            { id: "PCEC", transform: "PCT_OF", denominatorId: "GDP" },
            { id: "GPDI", transform: "PCT_OF", denominatorId: "GDP" },
            { id: "GCE", transform: "PCT_OF", denominatorId: "GDP" },
            { id: "NETEXP", transform: "PCT_OF", denominatorId: "GDP" },
          ],
        },
      },
      {
        id: "q-net-exports-sign",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "The sign of net exports",
        body:
          "Look at the net exports line on your chart. Since the mid-1970s, U.S. net exports have been mostly...",
        options: [
          "Positive — a trade surplus",
          "Negative — a trade deficit",
          "Exactly zero — trade is always balanced",
          "Alternating between surplus and deficit every few years",
        ],
        correctIndex: 1,
        explanation:
          "1975 was the last year U.S. exports exceeded imports; net exports have been negative essentially ever since, bottoming near −6% of GDP in 2005. A negative NX subtracts from GDP in the identity and means the U.S. is a net borrower from the rest of the world.",
        sources: ["NETEXP", "GDP"],
      },
    ],
  },
};
