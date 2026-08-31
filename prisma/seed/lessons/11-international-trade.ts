import type { LessonSeed } from "../../../src/lib/lessons/schema";

/**
 * Lesson 11 — International Trade & the Global Economy.
 * Lesson plan lesson 11. Sources are all pre-existing catalog series.
 */
export const LESSON_11: LessonSeed = {
  slug: "international-trade",
  title: "International Trade & the Global Economy",
  summary:
    "Exports, imports, and the trade balance: how percent-of-GDP reveals the tripling of U.S. trade openness since 1960, when the postwar surpluses gave way to persistent deficits, why the mid-2000s deficit was the deepest on record, and how the dollar's exchange rate moves the terms of trade.",
  level: "INTRO",
  estimatedMinutes: 35,
  sortOrder: 110,
  planLesson: 11,
  content: {
    objectives: [
      "Define exports, imports, the trade balance, and the broader current account",
      "Use the percent-of-GDP transform to measure the economy's openness to trade across decades",
      "Date the U.S. shift from postwar trade surpluses to persistent deficits and identify when the deficit was deepest",
      "Explain how dollar appreciation changes the prices of exports and imports, and relate the exchange rate to the trade balance",
    ],
    sources: [
      "EXPGS",
      "IMPGS",
      "NETEXP",
      "BOPGSTB",
      "DTWEXBGS",
      "RBUSBIS",
      "NETFI",
      "GDP",
      "USREC",
    ],
    steps: [
      {
        id: "read-trade-vocabulary",
        type: "READ",
        title: "Exports, imports, and the balances between countries",
        body:
          "Exports are goods and services produced in the United States and sold abroad; imports are foreign-produced goods and services bought by U.S. residents. Exports minus imports is the trade balance — a surplus when positive, a deficit when negative. Dr. Dash carries it two ways: Net Exports (NETEXP), quarterly from the GDP accounts, and the monthly Trade Balance (BOPGSTB).\n\nThe current account is a broader ledger. To the goods-and-services balance it adds cross-border income flows — profits, interest, and dividends earned on foreign investments — and transfers such as remittances and foreign aid. The Current Account Balance (NETFI) tracks this wider measure; a current-account deficit means the U.S. is borrowing from the rest of the world.\n\nExchange rates connect the two sides. When the dollar strengthens, each dollar buys more foreign currency — so U.S. exports get pricier for foreign buyers while imports get cheaper for Americans. The Nominal Broad U.S. Dollar Index (DTWEXBGS) tracks the dollar against a trade-weighted basket of partner currencies: higher means a stronger dollar.",
      },
      {
        id: "task-trade-shares-of-gdp",
        type: "TASK",
        points: 10,
        title: "Plot exports and imports as shares of GDP",
        body:
          "Plot Exports of Goods and Services (EXPGS) and Imports of Goods and Services (IMPGS) as levels first. Both climb almost without interruption — but so does everything measured in nominal dollars, so the levels mostly show growth and inflation. Now set each series' transform to Percent of another series, with GDP as the denominator.\n\nThe scaled picture is striking. In 1960 exports and imports were each only about 5% of GDP — the U.S. was close to a closed economy. Today exports run near 12% of GDP and imports near 14%, roughly a tripling of each share. The climb was not smooth: the import share spiked above 18% in mid-2008 when oil prices peaked, and the export share topped out near 14% in 2011. However you cut it, trade matters two to three times more to the U.S. economy than it did two generations ago — the data signature of globalization: falling shipping and communication costs, trade agreements, and global supply chains.",
        hint: "Open International Trade & Exchange → Exports of Goods and Services and International Trade & Exchange → Imports of Goods and Services, then set each series' transform to Percent of another series (GDP is the default denominator).",
        target: {
          series: [
            { id: "EXPGS", transform: "PCT_OF", denominatorId: "GDP" },
            { id: "IMPGS", transform: "PCT_OF", denominatorId: "GDP" },
          ],
        },
      },
      {
        id: "q-global-integration",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "What growing trade shares mean",
        body:
          "As a share of GDP, U.S. exports and imports have both grown substantially since 1960, indicating the U.S. economy has become _____ integrated with the global economy.",
        options: ["Less", "Equally", "More", "No meaningful change"],
        correctIndex: 2,
        explanation:
          "Import and export shares of GDP have risen roughly three-fold and two-and-a-half-fold since 1960 — from about 5% to roughly 12% and 14% respectively. Because the shares are measured relative to GDP, the rise cannot be explained by growth or inflation; it reflects genuinely deeper integration into world markets.",
        sources: ["EXPGS", "IMPGS", "GDP"],
      },
      {
        id: "task-net-exports-history",
        type: "TASK",
        points: 10,
        title: "From surplus to deficit: seventy years of net exports",
        body:
          "Clear your chart and plot Net Exports of Goods and Services (NETEXP) on Level, then turn on recession shading. Because this series is exports minus imports, it crosses zero — everything above the line is a trade surplus, everything below is a deficit.\n\nFor the first three postwar decades the U.S. ran surpluses in most quarters, though never large ones — scattered small deficits show up as early as 1950–53 and again in the late 1950s. After a final burst of surplus in 1975 the line turns decisively: since mid-1976 net exports have been negative in every quarter but one (a brief surplus in late 1980). Then the deficit ballooned in the 2000s, sinking from roughly balanced trade in the early 1990s to more than $800 billion — nearly 6% of GDP — by 2006.\n\nNow use the shaded bars: the deficit consistently narrows in recessions, because Americans' import buying falls with their incomes. In the Great Recession the deficit shrank by more than half, from about $800 billion in 2006 to roughly $360 billion by mid-2009 — a reminder that a shrinking trade deficit is not necessarily good news.",
        hint: "Open Output & Income → Net Exports of Goods and Services, keep its transform on Level, and turn on recession shading.",
        target: {
          series: [{ id: "NETEXP", transform: "LEVEL" }],
          recessions: true,
        },
      },
      {
        id: "q-deficit-largest",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "When was the trade deficit deepest?",
        body:
          "Relative to the size of the economy, the U.S. trade deficit as a share of GDP was largest during which period? (Try adding NETEXP with the Percent of another series transform to check.)",
        options: ["The 1980s", "The mid-2000s", "2020", "The 1950s"],
        correctIndex: 1,
        explanation:
          "The deficit reached about 5.5–6% of GDP in 2005–06, the deepest in U.S. history — versus a peak near 3% in the 1980s and around 3% in 2020, while the 1950s saw small surpluses. The mid-2000s gap reflected a booming, import-hungry economy and heavy foreign lending flowing into the U.S. housing bubble.",
        sources: ["NETEXP", "GDP"],
      },
      {
        id: "task-dollar-vs-deficit",
        type: "TASK",
        points: 10,
        title: "The dollar and the trade balance",
        body:
          "Keep Net Exports (NETEXP) on Level and add the Nominal Broad U.S. Dollar Index (DTWEXBGS), also on Level. The two land on separate axes — dollars on one, an index on the other — so you can compare their shapes. Note that the dollar index begins in January 2006 (set to 100), so the mid-2000s deficit peak sits right at the left edge of the dollar line.\n\nTheory says a strong dollar should widen the deficit: it makes U.S. exports pricier abroad and imports cheaper at home. Do the episodes fit? From 2007 to 2011 the index slid toward the high 80s and the deficit narrowed from its record depths. Then the dollar climbed steeply from 2015 onward, spiking near 128 in September 2022 as the Fed hiked rates — and the deficit widened past 4% of GDP in early 2022. When the index touched its all-time high near 130 in January 2025, the quarterly deficit hit a record $1.3 trillion, swollen by importers racing to bring goods in ahead of expected tariffs.\n\nThe fit is loose — recessions, oil prices, and trade policy all move the balance too, and exchange rates act with a lag — but the broad pattern runs the way the textbook predicts.",
        hint: "Keep NETEXP (Level) on the chart, then add International Trade & Exchange → Nominal Broad U.S. Dollar Index with its transform on Level.",
        target: {
          series: [
            { id: "NETEXP", transform: "LEVEL" },
            { id: "DTWEXBGS", transform: "LEVEL" },
          ],
        },
      },
      {
        id: "q-appreciation-prices",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "Appreciation and the prices of traded goods",
        body:
          "If the U.S. dollar appreciates against trading partners' currencies, U.S. exports become _____ and imports become _____.",
        options: [
          "Cheaper for foreign buyers; more expensive for Americans",
          "More expensive for foreign buyers; cheaper for Americans",
          "Unchanged; unchanged",
          "More expensive for foreign buyers; more expensive for Americans",
        ],
        correctIndex: 1,
        explanation:
          "A stronger dollar means foreign buyers must give up more of their own currency for each dollar of U.S. goods, while each American dollar buys more foreign goods. That price shift discourages exports and encourages imports — which is why sustained dollar strength tends to push the trade balance toward deficit.",
        sources: ["DTWEXBGS", "RBUSBIS"],
      },
    ],
  },
};
