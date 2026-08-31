/**
 * The Statsbook figure catalog — all 50 figures from the professor's
 * Statsbook 2025–2026, each expressed as a live Dr. Dash chart config.
 *
 * Every series id and transform is validated against the catalog rules in
 * `src/lib/catalog/series.ts` (e.g. NETEXP and FYFSD cross zero, so they never
 * take YOY_GROWTH; PCT_OF and PER_CAPITA apply only to economy-wide dollar
 * aggregates). `tableRef` points at the appendix table a figure draws on.
 */
import type { StatsbookFigure } from "@/lib/statsbook/types";

export const STATSBOOK_FIGURES: StatsbookFigure[] = [
  // ───────────────────────────── Output (1–14) ─────────────────────────────
  {
    id: 1,
    title: "Nominal GDP",
    description:
      "The market value of all final goods and services produced in the US, stated in current dollars. Because it mixes real output with price changes, its relentless climb overstates how much the economy actually grows.",
    series: [{ id: "GDP", transform: "LEVEL" }],
    category: "output",
    tableRef: 1,
  },
  {
    id: 2,
    title: "Real GDP",
    description:
      "GDP adjusted for inflation using the GDP deflator, stated in chained 2017 dollars. This is the standard measure of the economy's physical output over time.",
    series: [{ id: "GDPC1", transform: "LEVEL" }],
    category: "output",
    tableRef: 1,
  },
  {
    id: 3,
    title: "Per Capita Real GDP",
    description:
      "Real GDP divided by population — the standard measure of average living standards. Dividing by population strips out the growth that comes merely from having more people.",
    series: [{ id: "GDPC1", transform: "PER_CAPITA" }],
    category: "output",
    tableRef: 1,
  },
  {
    id: 4,
    title: "Real GDP Growth Rate",
    description:
      "The year-over-year percent change in real GDP — the headline pace of economic growth. Sustained negative readings line up with the NBER's shaded recession dates.",
    series: [{ id: "GDPC1", transform: "YOY_GROWTH" }],
    recessions: true,
    category: "output",
    tableRef: 1,
  },
  {
    id: 5,
    title: "GDP Deflator",
    description:
      "The ratio of nominal to real GDP — the broadest price index. Unlike the CPI it covers everything produced in the economy, not just what consumers buy.",
    series: [{ id: "GDPDEF", transform: "LEVEL" }],
    category: "output",
    tableRef: 1,
  },
  {
    id: 6,
    title: "GDP Deflator Growth Rate",
    description:
      "The year-over-year growth of the GDP deflator — economy-wide inflation. It is the inflation measure implied by the gap between nominal and real GDP growth.",
    series: [{ id: "GDPDEF", transform: "YOY_GROWTH" }],
    category: "output",
    tableRef: 1,
  },
  {
    id: 7,
    title: "Consumption as a Percent of GDP",
    description:
      "Personal consumption expenditures divided by GDP — the C share of C + I + G + NX. Household spending is the largest expenditure component, currently about two-thirds of GDP.",
    series: [{ id: "PCEC", transform: "PCT_OF", denominatorId: "GDP" }],
    category: "output",
    tableRef: 2,
  },
  {
    id: 8,
    title: "Investment as a Percent of GDP",
    description:
      "Gross private domestic investment divided by GDP — the I share. Investment is the most volatile expenditure component, collapsing in every recession and rebounding in expansions.",
    series: [{ id: "GPDI", transform: "PCT_OF", denominatorId: "GDP" }],
    recessions: true,
    category: "output",
    tableRef: 2,
  },
  {
    id: 9,
    title: "Government Purchases as a Percent of GDP",
    description:
      "Government consumption and gross investment divided by GDP — the G share. This counts purchases of goods and services at all levels of government; transfer payments like Social Security are excluded.",
    series: [{ id: "GCE", transform: "PCT_OF", denominatorId: "GDP" }],
    category: "output",
    tableRef: 2,
  },
  {
    id: 10,
    title: "Net Exports as a Percent of GDP",
    description:
      "Exports minus imports, divided by GDP — the NX share. It has been negative in every quarter since late 1980, reflecting the persistent U.S. trade deficit.",
    series: [{ id: "NETEXP", transform: "PCT_OF", denominatorId: "GDP" }],
    category: "output",
    tableRef: 2,
  },
  {
    id: 11,
    title: "Personal Consumption Expenditures",
    description:
      "Household spending on goods and services in current dollars — the C in C + I + G + NX. It is the largest and steadiest component of aggregate demand.",
    series: [{ id: "PCEC", transform: "LEVEL" }],
    category: "output",
    tableRef: 2,
  },
  {
    id: 12,
    title: "Gross Private Domestic Investment",
    description:
      "Business fixed investment, residential construction, and inventory change in current dollars — the I in C + I + G + NX. Its swings drive much of the business cycle.",
    series: [{ id: "GPDI", transform: "LEVEL" }],
    category: "output",
    tableRef: 2,
  },
  {
    id: 13,
    title: "Government Consumption & Investment",
    description:
      "Purchases of goods and services by federal, state, and local government in current dollars — the G in C + I + G + NX. Transfers are excluded because they are not payments for current production.",
    series: [{ id: "GCE", transform: "LEVEL" }],
    category: "output",
    tableRef: 2,
  },
  {
    id: 14,
    title: "Net Exports",
    description:
      "Exports minus imports of goods and services in current dollars. A negative value means the U.S. buys more from the rest of the world than it sells — the trade deficit.",
    series: [{ id: "NETEXP", transform: "LEVEL" }],
    category: "output",
    tableRef: 2,
  },

  // ─────────────────────── Income & Saving (15–17) ─────────────────────────
  {
    id: 15,
    title: "Disposable Personal Income",
    description:
      "Personal income remaining after personal current taxes — the income households can actually spend or save. It is the budget constraint behind consumption and saving decisions.",
    series: [{ id: "DSPI", transform: "LEVEL" }],
    category: "income",
    tableRef: 6,
  },
  {
    id: 16,
    title: "Disposable Personal Income Growth",
    description:
      "The year-over-year growth of disposable personal income. Spikes in 2020–21 reflect pandemic relief payments landing in household accounts and then expiring.",
    series: [{ id: "DSPI", transform: "YOY_GROWTH" }],
    category: "income",
    tableRef: 6,
  },
  {
    id: 17,
    title: "Personal Saving Rate",
    description:
      "Personal saving as a percent of disposable personal income. It drifted down for decades before spiking to a record 31.8% in April 2020, when lockdowns and relief checks collided.",
    series: [{ id: "PSAVERT", transform: "LEVEL" }],
    category: "income",
    tableRef: 6,
  },

  // ────────────────── Prices & Interest Rates (18–26) ──────────────────────
  {
    id: 18,
    title: "CPI — All Items",
    description:
      "The Consumer Price Index for all urban consumers — the cost of the BLS market basket, indexed to 1982–84 = 100. The level shows the cumulative rise in consumer prices over time.",
    series: [{ id: "CPIAUCSL", transform: "LEVEL" }],
    category: "prices",
    tableRef: 10,
  },
  {
    id: 19,
    title: "CPI Inflation Rate",
    description:
      "The year-over-year percent change in the CPI — headline consumer inflation. The 1970s double-digit surges, the Volcker disinflation, and the 2021–22 spike all stand out against the recession bands.",
    series: [{ id: "CPIAUCSL", transform: "YOY_GROWTH" }],
    recessions: true,
    category: "prices",
    tableRef: 10,
  },
  {
    id: 20,
    title: "Core CPI Inflation",
    description:
      "CPI inflation excluding volatile food and energy prices. Core inflation is a cleaner read on the underlying trend, which is why policymakers watch it through temporary supply shocks.",
    series: [{ id: "CPILFESL", transform: "YOY_GROWTH" }],
    category: "prices",
    tableRef: 10,
  },
  {
    id: 21,
    title: "PCE Inflation",
    description:
      "The year-over-year growth of the PCE price index — the measure the Fed's 2% inflation target refers to. Its broader coverage and updating weights make it run slightly below CPI inflation.",
    series: [{ id: "PCEPI", transform: "YOY_GROWTH" }],
    category: "prices",
    tableRef: 10,
  },
  {
    id: 22,
    title: "Producer Price Inflation",
    description:
      "The year-over-year growth of the all-commodities Producer Price Index — prices received by domestic producers. Because it sits earlier in the supply chain, it often moves before consumer inflation.",
    series: [{ id: "PPIACO", transform: "YOY_GROWTH" }],
    category: "prices",
    tableRef: 10,
  },
  {
    id: 23,
    title: "10-Year Treasury Yield",
    description:
      "The yield on 10-year U.S. Treasury securities — the benchmark long-term risk-free rate. It anchors mortgage and corporate borrowing costs and embeds the market's inflation expectations.",
    series: [{ id: "GS10", transform: "LEVEL" }],
    category: "prices",
    tableRef: 10,
  },
  {
    id: 24,
    title: "Federal Funds Rate",
    description:
      "The overnight interbank rate the Federal Reserve steers — its primary policy instrument. The Fed cuts it in recessions and raises it to cool inflation, so the shaded bands make the policy cycle visible.",
    series: [{ id: "FEDFUNDS", transform: "LEVEL" }],
    recessions: true,
    category: "prices",
    tableRef: 10,
  },
  {
    id: 25,
    title: "30-Year Mortgage Rate",
    description:
      "The average rate on a 30-year fixed-rate home mortgage from the Freddie Mac survey. It tracks the 10-year Treasury yield plus a spread and sets the cost of home ownership for most buyers.",
    series: [{ id: "MORTGAGE30US", transform: "LEVEL" }],
    category: "prices",
    tableRef: 10,
  },
  {
    id: 26,
    title: "Aaa and Baa Corporate Bond Yields",
    description:
      "Borrowing costs for the highest-grade (Aaa) and lower-medium-grade (Baa) corporations. The spread between the two lines is the credit risk premium, which widens sharply when lenders fear defaults.",
    series: [
      { id: "AAA", transform: "LEVEL" },
      { id: "BAA", transform: "LEVEL" },
    ],
    category: "prices",
    tableRef: 10,
  },

  // ───────────────────────────── Money (27–32) ─────────────────────────────
  {
    id: 27,
    title: "M1 Money Supply",
    description:
      "Currency plus checkable and other liquid deposits — the narrowest money measure. A definitional change in May 2020 added savings deposits, producing a one-time jump in the level.",
    series: [{ id: "M1SL", transform: "LEVEL" }],
    category: "money",
    tableRef: 12,
  },
  {
    id: 28,
    title: "M2 Money Supply",
    description:
      "M1 plus small time deposits and retail money market funds — the broad money supply. M2 is the money measure most often used in the quantity theory of money.",
    series: [{ id: "M2SL", transform: "LEVEL" }],
    category: "money",
    tableRef: 12,
  },
  {
    id: 29,
    title: "Monetary Base",
    description:
      "Currency in circulation plus bank reserves at the Fed — the money the central bank directly creates. The quantitative-easing programs after 2008 and in 2020 appear as huge steps upward.",
    series: [{ id: "BOGMBASE", transform: "LEVEL" }],
    category: "money",
    tableRef: 12,
  },
  {
    id: 30,
    title: "M1 Growth Rate",
    description:
      "The year-over-year growth of M1. The off-the-chart 2020–21 reading mixes genuine pandemic money creation with the May 2020 redefinition that folded savings deposits into M1.",
    series: [{ id: "M1SL", transform: "YOY_GROWTH" }],
    category: "money",
    tableRef: 12,
  },
  {
    id: 31,
    title: "M2 Growth Rate",
    description:
      "The year-over-year growth of the broad money supply. The 2020 surge and the unusual outright contraction that followed in 2022–23 bracket the pandemic inflation episode.",
    series: [{ id: "M2SL", transform: "YOY_GROWTH" }],
    category: "money",
    tableRef: 12,
  },
  {
    id: 32,
    title: "M2 Money Velocity",
    description:
      "GDP divided by M2 — the number of times money turns over per year. Velocity peaked in the late 1990s and has trended down since, which is why money growth no longer maps neatly into inflation.",
    series: [{ id: "DD_MONEY_VEL", transform: "LEVEL" }],
    category: "money",
    tableRef: 12,
  },

  // ─────────────────────────── Government (33–36) ──────────────────────────
  {
    id: 33,
    title: "Federal Receipts",
    description:
      "Federal tax and other current receipts on a national-accounts basis. Receipts rise with income and profits, which is why they dip in recessions even without any change in tax law.",
    series: [{ id: "FGRECPT", transform: "LEVEL" }],
    category: "government",
    tableRef: 13,
  },
  {
    id: 34,
    title: "Federal Outlays",
    description:
      "Federal current expenditures, including transfer payments, on a national-accounts basis. Outlays jump in downturns as unemployment insurance and other automatic stabilizers kick in.",
    series: [{ id: "FGEXPND", transform: "LEVEL" }],
    category: "government",
    tableRef: 13,
  },
  {
    id: 35,
    title: "Federal Deficit / Surplus",
    description:
      "The annual federal budget balance by fiscal year; negative values are deficits. Deficits widen in every recession and hit a record of roughly $3.1 trillion in fiscal 2020.",
    series: [{ id: "FYFSD", transform: "LEVEL" }],
    recessions: true,
    category: "government",
    tableRef: 13,
  },
  {
    id: 36,
    title: "Federal Debt as a Percent of GDP",
    description:
      "Total public debt divided by GDP — the standard gauge of fiscal sustainability. The ratio first passed 100% of GDP in late 2012 and peaked near 133% in 2020, at the height of the pandemic response.",
    series: [{ id: "GFDEGDQ188S", transform: "LEVEL" }],
    category: "government",
    tableRef: 13,
  },

  // ──────────────────────── International Trade (37–40) ────────────────────
  {
    id: 37,
    title: "Exports and Imports",
    description:
      "U.S. exports and imports of goods and services in current dollars. The persistent gap between the two lines — imports above exports since the early 1980s — is the trade deficit.",
    series: [
      { id: "EXPGS", transform: "LEVEL" },
      { id: "IMPGS", transform: "LEVEL" },
    ],
    category: "trade",
  },
  {
    id: 38,
    title: "Exports and Imports as a Percent of GDP",
    description:
      "Exports and imports each divided by GDP — a scale-free measure of how open the U.S. economy is. Both shares have roughly tripled since the 1950s as trade barriers and transport costs fell.",
    series: [
      { id: "EXPGS", transform: "PCT_OF", denominatorId: "GDP" },
      { id: "IMPGS", transform: "PCT_OF", denominatorId: "GDP" },
    ],
    category: "trade",
  },
  {
    id: 39,
    title: "Trade Balance",
    description:
      "Net exports of goods and services — the trade balance in current dollars. The deficit typically narrows in recessions, when U.S. demand for imports falls faster than foreign demand for U.S. exports.",
    series: [{ id: "NETEXP", transform: "LEVEL" }],
    recessions: true,
    category: "trade",
  },
  {
    id: 40,
    title: "Broad Dollar Index",
    description:
      "The trade-weighted value of the dollar against a broad basket of partner currencies; higher means a stronger dollar. A strong dollar makes imports cheaper for Americans and U.S. exports pricier abroad.",
    series: [{ id: "DTWEXBGS", transform: "LEVEL" }],
    category: "trade",
  },

  // ─────────────────────────── Labor Market (41–46) ────────────────────────
  {
    id: 41,
    title: "Unemployment Rate",
    description:
      "The share of the labor force that is jobless and actively looking for work. It spikes in every recession — reaching 14.8% in April 2020 — and grinds down slowly during expansions.",
    series: [{ id: "UNRATE", transform: "LEVEL" }],
    recessions: true,
    category: "labor",
    tableRef: 11,
  },
  {
    id: 42,
    title: "Nonfarm Payrolls",
    description:
      "The number of jobs on nonfarm payrolls, shown both as a level and as its year-over-year growth rate. Payroll growth turning negative is one of the most reliable markers of recession.",
    series: [
      { id: "PAYEMS", transform: "LEVEL" },
      { id: "PAYEMS", transform: "YOY_GROWTH" },
    ],
    category: "labor",
    tableRef: 11,
  },
  {
    id: 43,
    title: "Labor Force Participation Rate",
    description:
      "The share of the civilian noninstitutional population working or looking for work. It rose for decades as women entered the labor force, peaked around 2000, and has drifted down with population aging.",
    series: [{ id: "CIVPART", transform: "LEVEL" }],
    category: "labor",
    tableRef: 11,
  },
  {
    id: 44,
    title: "Employment–Population Ratio",
    description:
      "The share of the working-age population that is employed. Because it ignores who counts as \"in the labor force,\" many economists prefer it to the unemployment rate as a summary of labor market health.",
    series: [{ id: "EMRATIO", transform: "LEVEL" }],
    category: "labor",
    tableRef: 11,
  },
  {
    id: 45,
    title: "Job Openings (JOLTS)",
    description:
      "Unfilled job openings on the last business day of the month, from the BLS JOLTS survey. Openings peaked above 12 million in early 2022, when employers competed hardest for scarce workers.",
    series: [{ id: "JTSJOL", transform: "LEVEL" }],
    category: "labor",
  },
  {
    id: 46,
    title: "Average Hourly Earnings Growth",
    description:
      "The year-over-year growth of nominal hourly wages for production and nonsupervisory workers. Compare it with CPI inflation to see whether paychecks are gaining or losing purchasing power.",
    series: [{ id: "AHETPI", transform: "YOY_GROWTH" }],
    category: "labor",
    tableRef: 11,
  },

  // ─────────────────────── Productivity & Costs (47–49) ────────────────────
  {
    id: 47,
    title: "Output per Hour (Labor Productivity)",
    description:
      "Real output per hour worked in the nonfarm business sector, shown as a level and as its growth rate. Productivity growth is what ultimately allows wages and living standards to rise.",
    series: [
      { id: "OPHNFB", transform: "LEVEL" },
      { id: "OPHNFB", transform: "YOY_GROWTH" },
    ],
    category: "productivity",
    tableRef: 9,
  },
  {
    id: 48,
    title: "Real Hourly Compensation",
    description:
      "Inflation-adjusted hourly compensation — wages plus benefits — in the nonfarm business sector. Set it beside output per hour to ask whether workers' pay is keeping up with their productivity.",
    series: [{ id: "COMPRNFB", transform: "LEVEL" }],
    category: "productivity",
    tableRef: 9,
  },
  {
    id: 49,
    title: "Unit Labor Costs Growth",
    description:
      "The growth of labor cost per unit of output — compensation growth in excess of productivity growth. Sustained increases squeeze profit margins or get passed on as inflation.",
    series: [{ id: "ULCNFB", transform: "YOY_GROWTH" }],
    category: "productivity",
    tableRef: 9,
  },

  // ──────────────────────── Income Distribution (50) ───────────────────────
  {
    id: 50,
    title: "Income Distribution (Gini Index)",
    description:
      "The Gini index of income inequality: 0 means everyone earns the same, 100 means one person earns everything. See Figure 50 to get an idea how the distribution of income has changed over time — the U.S. index has risen from 36.7 in 1963 to 41.8 in 2024.",
    series: [{ id: "SIPOVGINIUSA", transform: "LEVEL" }],
    category: "distribution",
    tableRef: 16,
  },
];
