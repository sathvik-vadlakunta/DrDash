import type { LessonSeed } from "../../../src/lib/lessons/schema";

/**
 * Lesson 10 — Government Deficits & the National Debt.
 * Lesson plan lesson 10. Sources are all pre-existing catalog series.
 */
export const LESSON_10: LessonSeed = {
  slug: "deficits-debt",
  title: "Government Deficits & the National Debt",
  summary:
    "How receipts, outlays, deficits, and debt fit together — the deficit as a flow and the debt as a stock — plus the debt-to-GDP ratio, its all-time high during COVID, and when a rising ratio becomes unsustainable.",
  level: "INTRO",
  estimatedMinutes: 35,
  sortOrder: 100,
  planLesson: 10,
  content: {
    objectives: [
      "Define receipts, outlays, deficit, and debt, and distinguish the deficit (a flow) from the debt (a stock)",
      "Show how the gap between receipts and outlays widens during recessions",
      "Use the debt-to-GDP ratio as the standard measure of fiscal sustainability and read its history",
      "Explain the r-versus-g condition under which a rising debt ratio snowballs",
    ],
    sources: [
      "FGRECPT",
      "FGEXPND",
      "GFDEBTN",
      "GFDEGDQ188S",
      "FYFSD",
      "GDP",
      "USREC",
    ],
    steps: [
      {
        id: "read-deficit-vs-debt",
        type: "READ",
        title: "Deficits are flows; the debt is a stock",
        body:
          "The federal government takes in receipts — mostly income and payroll taxes — and pays out outlays: defense, Social Security, Medicare, interest, and everything else. When outlays exceed receipts in a given year, the difference is that year's deficit; when receipts exceed outlays, it's a surplus.\n\nThe crucial distinction is between a flow and a stock. The deficit is a flow: one year's shortfall, borrowed by selling Treasury securities. The national debt is a stock: the accumulation of every past deficit, minus every past surplus. Each deficit adds to the debt; a surplus retires debt and shrinks the stock. In 2026 the debt stood at about $39 trillion.\n\nSurpluses are rare. Since 1960 the U.S. has run a deficit in every fiscal year except six — 1960, 1969, and the four years 1998–2001 — and recent deficits have run near $1.8 trillion a year.",
      },
      {
        id: "task-receipts-vs-outlays",
        type: "TASK",
        points: 10,
        title: "Plot receipts against outlays",
        body:
          "Plot Federal Government Current Receipts (FGRECPT) and Federal Government Current Expenditures (FGEXPND) on the same chart, both as levels, and turn on recession shading. When the outlays line sits above the receipts line, the government is running a deficit — the vertical gap between the two is the deficit's size.\n\nNotice the gap expands dramatically during recessions, and for two reasons at once: receipts fall as incomes and profits shrink, while outlays rise as unemployment insurance and relief spending kick in. In 2008–09 receipts dropped by roughly $400 billion while outlays kept climbing, stretching the gap to about $1.3 trillion at an annual rate. In the COVID quarter of 2020, outlays spiked to an $8.9 trillion annual rate against $3.5 trillion in receipts — a gap of over $5 trillion, briefly.",
        hint: "Open Government Finance → Federal Government Current Receipts and Federal Government Current Expenditures, leave both transforms set to Level, and turn on recession shading.",
        target: {
          series: [
            { id: "FGRECPT", transform: "LEVEL" },
            { id: "FGEXPND", transform: "LEVEL" },
          ],
          recessions: true,
        },
      },
      {
        id: "q-surplus-period",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "When did the U.S. last run surpluses?",
        body:
          "During which period did federal receipts consistently exceed outlays, producing a surplus?",
        options: [
          "The late 1990s",
          "The 1960s",
          "The 1940s",
          "Never — the U.S. has always run deficits",
        ],
        correctIndex: 0,
        explanation:
          "In fiscal years 1998–2001 a booming economy and capital-gains revenue pushed receipts above outlays four years running, peaking at a $236 billion surplus in FY2000. The 1960s managed just two surplus years (FY1960 and FY1969), and the deficit-financed WWII 1940s ran some of the largest deficits in U.S. history.",
        sources: ["FYFSD"],
      },
      {
        id: "task-debt-to-gdp",
        type: "TASK",
        points: 10,
        title: "Plot debt as a share of GDP",
        body:
          "A $39 trillion debt sounds unpayable — until you remember the economy that services it also grows. That's why economists judge fiscal sustainability with the ratio of debt to GDP (GFDEGDQ188S), not the dollar level: it asks whether the debt is growing faster than the economy's capacity to carry it. A rising ratio means debt is outpacing GDP; a falling ratio means growth (or surpluses) is outpacing the debt.\n\nPlot the series and trace its arc. From about 40% in 1966 the ratio drifted down to a low of roughly 31% in 1981 — not because the debt shrank, but because nominal GDP grew faster. The deficits of the 1980s pushed it up to about 65% by the mid-1990s, and the late-1990s surpluses pulled it back to around 55%. Then came the break: after the 2008 financial crisis the ratio climbed from about 64% in early 2008 to just over 100% by 2013, and the COVID spike carried it to its all-time high in 2020. It remains above 120% today.",
        hint: "Open Government Finance → Federal Debt as Percent of GDP and leave its transform set to Level.",
        target: {
          series: [{ id: "GFDEGDQ188S", transform: "LEVEL" }],
        },
      },
      {
        id: "q-debt-gdp-peak",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "The all-time high in debt-to-GDP",
        body:
          "U.S. federal debt as a share of GDP reached its all-time high during which period, and at approximately what ratio?",
        options: [
          "World War II, at roughly 110% of GDP",
          "The COVID-19 pandemic in 2020, at roughly 133% of GDP",
          "The 2008 financial crisis, at roughly 75% of GDP",
          "The Vietnam War era, at roughly 50% of GDP",
        ],
        correctIndex: 1,
        explanation:
          "In 2020Q2 the ratio hit 132.7% — massive relief borrowing pushed the numerator up in the same quarter the COVID shutdown crushed the denominator. On this gross-debt measure the WWII-era peak was roughly 119% of GDP in 1946 (the often-quoted 106% figure counts only debt held by the public), so the COVID spike exceeds even the wartime record; the ratio then eased back as GDP rebounded, to the low 120s today.",
        sources: ["GFDEGDQ188S"],
      },
      {
        id: "task-outlays-share-of-gdp",
        type: "TASK",
        points: 10,
        title: "Outlays as a share of the economy",
        body:
          "Now size the federal government itself against the economy: plot Federal Government Current Expenditures (FGEXPND) with the Percent of another series transform, using GDP as the denominator.\n\nIn the postwar decades the federal government spent around 17–18% of GDP. The share stepped up to the 20–22% range from the 1970s through the 1990s as Medicare, Medicaid, and Social Security matured, and it sits in the low-to-mid 20s today — about 24% of GDP in 2024–25. The wild outlier is 2020, when pandemic relief briefly drove outlays to nearly 45% of GDP in a single quarter. Receipts, meanwhile, have stayed closer to 17–19% of GDP — that persistent gap between the spending share and the revenue share is the deficit you charted earlier.",
        hint: "Open Government Finance → Federal Government Current Expenditures, then set its transform to Percent of another series (GDP is the default denominator).",
        target: {
          series: [
            { id: "FGEXPND", transform: "PCT_OF", denominatorId: "GDP" },
          ],
        },
      },
      {
        id: "q-r-versus-g",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "When does rising debt become unsustainable?",
        body:
          "A persistently rising debt-to-GDP ratio is most likely to become unsustainable when...",
        options: [
          "The interest rate on the debt exceeds the economy's growth rate",
          "Nominal GDP grows faster than the debt",
          "The primary deficit (excluding interest) is zero",
          "Inflation is below 2%",
        ],
        correctIndex: 0,
        explanation:
          "When the interest rate r exceeds the growth rate g, interest compounds the debt faster than GDP grows the denominator, so the ratio snowballs even with no new primary borrowing — stabilizing it then requires running primary surpluses. When g exceeds r, the economy can outgrow its debt: that's how the ratio fell from 1946 to the mid-1970s despite near-continuous deficits.",
        sources: ["GFDEGDQ188S"],
      },
    ],
  },
};
