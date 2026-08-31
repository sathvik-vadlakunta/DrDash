/**
 * The Dr. Dash series catalog.
 *
 * Every series students can plot is defined here. FRED series are synced from
 * the St. Louis Fed (`pnpm sync`); constructed series (DD_*) are computed from
 * their FRED inputs during sync. Offline JSON snapshots of every series live in
 * `prisma/seed/data/` so the app works without network access.
 */

export const CATEGORY_SLUGS = [
  "output-income",
  "prices-inflation",
  "money-rates",
  "government-finance",
  "international",
  "labor-market",
  "productivity-costs",
  "consumer-business",
  "income-distribution",
  "dr-dash-constructed",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  "output-income": "Output & Income",
  "prices-inflation": "Prices & Inflation",
  "money-rates": "Money, Banking & Interest Rates",
  "government-finance": "Government Finance",
  international: "International Trade & Exchange",
  "labor-market": "Labor Market & Population",
  "productivity-costs": "Productivity & Costs",
  "consumer-business": "Consumers & Business Conditions",
  "income-distribution": "Income Distribution",
  "dr-dash-constructed": "Dr. Dash Constructed",
};

export type SeriesKind =
  | "LEVEL_CURRENCY" // dollar-denominated level
  | "LEVEL_COUNT" // counts of people/jobs (thousands)
  | "INDEX" // index numbers (e.g. 2017=100)
  | "RATIO" // percents, rates, ratios
  | "BINARY"; // 0/1 indicator

export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUAL";
export type Seasonal = "SA" | "NSA" | "SAAR";

export interface SeriesDef {
  id: string; // FRED id, or DD_* for constructed series
  name: string;
  category: CategorySlug;
  kind: SeriesKind;
  frequency: Frequency;
  seasonal: Seasonal;
  units: string;
  /** true when the series is stated in current (nominal) dollars → REAL transform applies */
  nominal: boolean;
  /** false for series where a growth-rate transform is meaningless (rates, ratios, sign-crossing levels) */
  canGrowth: boolean;
  source: "FRED" | "CONSTRUCTED";
  description: string;
  /** multiplier converting stored values to plain dollars (LEVEL_CURRENCY only). Default 1e9 (billions). */
  dollarScale?: number;
  /** hidden series are usable (e.g. recession shading) but not listed in the catalog browser */
  hidden?: boolean;
  /**
   * true for flow series stated at a per-period (NOT annualized) rate; the
   * percent-of and per-capita transforms annualize these before dividing.
   */
  flow?: boolean;
  notes?: string;
}

const B = 1e9;
const M = 1e6;

export const SERIES_CATALOG: SeriesDef[] = [
  // ─────────────────────────── Output & Income ───────────────────────────
  {
    id: "GDP",
    name: "Gross Domestic Product",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Billions of dollars, SAAR",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "The market value of all final goods and services produced in the United States, in current dollars.",
  },
  {
    id: "GDPC1",
    name: "Real Gross Domestic Product",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Billions of chained 2017 dollars, SAAR",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "GDP adjusted for inflation using the GDP deflator — the standard measure of the economy's real output.",
  },
  {
    id: "GDPDEF",
    name: "GDP Implicit Price Deflator",
    category: "output-income",
    kind: "INDEX",
    frequency: "QUARTERLY",
    seasonal: "SA",
    units: "Index 2017=100",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    description:
      "The ratio of nominal to real GDP — the broadest price index for the whole economy.",
  },
  {
    id: "DSPI",
    name: "Disposable Personal Income",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "MONTHLY",
    seasonal: "SAAR",
    units: "Billions of dollars, SAAR",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Personal income remaining after personal current taxes — what households can spend or save.",
  },
  {
    id: "PSAVERT",
    name: "Personal Saving Rate",
    category: "output-income",
    kind: "RATIO",
    frequency: "MONTHLY",
    seasonal: "SA",
    units: "Percent of disposable personal income",
    nominal: false,
    canGrowth: false,
    source: "FRED",
    description:
      "Personal saving as a percentage of disposable personal income.",
  },
  {
    id: "PCEC",
    name: "Personal Consumption Expenditures",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Billions of dollars, SAAR",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Household spending on goods and services — the C in C + I + G + NX, roughly two-thirds of GDP.",
  },
  {
    id: "GPDI",
    name: "Gross Private Domestic Investment",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Billions of dollars, SAAR",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Business fixed investment, residential construction, and inventory change — the I in C + I + G + NX.",
  },
  {
    id: "GCE",
    name: "Government Consumption Expenditures & Gross Investment",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Billions of dollars, SAAR",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Government purchases of goods and services at all levels — the G in C + I + G + NX (transfers excluded).",
  },
  {
    id: "NETEXP",
    name: "Net Exports of Goods and Services",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Billions of dollars, SAAR",
    nominal: true,
    canGrowth: false,
    source: "FRED",
    dollarScale: B,
    description:
      "Exports minus imports — the NX in C + I + G + NX. Negative when the U.S. runs a trade deficit.",
    notes: "Crosses zero, so growth-rate transforms are disabled.",
  },
  {
    id: "A023RC1A027NBEA",
    name: "Gross National Product",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "Billions of dollars",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Output produced by U.S. residents wherever located — GDP plus net income from abroad. Statsbook Tables 4 and 5.",
    notes:
      "Verified against the data: this BEA series is GNP (1929 = $104.6B), not NNP as an earlier draft labeled it.",
  },
  {
    id: "A027RC1A027NBEA",
    name: "Net National Product",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "Billions of dollars",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Gross national product minus consumption of fixed capital (depreciation). Statsbook Table 4.",
  },
  {
    id: "PI",
    name: "Personal Income",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "MONTHLY",
    seasonal: "SAAR",
    units: "Billions of dollars, SAAR",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Income received by persons from all sources — wages, proprietors' income, rents, dividends, interest, and transfers. Statsbook Tables 4 and 6.",
  },
  {
    id: "A032RC1A027NBEA",
    name: "National Income",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "Billions of dollars",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "All income earned in production: compensation, proprietors' and rental income, profits, and net interest. Statsbook Table 4.",
  },
  {
    id: "PNFIC1",
    name: "Real Private Nonresidential Fixed Investment",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Billions of chained 2017 dollars, SAAR",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Business investment in structures, equipment, and intellectual property, adjusted for inflation. Statsbook Table 17 (capital stock discussion).",
  },
  {
    id: "GSAVE",
    name: "Gross Saving",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Billions of dollars, SAAR",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Saving by households, businesses, and government combined. Statsbook Table 7.",
  },
  {
    id: "COFC",
    name: "Consumption of Fixed Capital",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Billions of dollars, SAAR",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "The economy-wide depreciation of structures, equipment, and software. Statsbook Table 7.",
  },
  {
    id: "CP",
    name: "Corporate Profits After Tax",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Billions of dollars, SAAR",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Profits of U.S. corporations after federal and state taxes. Statsbook Table 5 (income components).",
  },
  {
    id: "A033RC1A027NBEA",
    name: "Compensation of Employees",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "Billions of dollars",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Total wages, salaries, and benefits paid to employees — the largest share of national income. Statsbook Tables 5 and 8.",
  },
  {
    id: "A034RC1A027NBEA",
    name: "Wages and Salaries",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "Billions of dollars",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "The cash-pay portion of employee compensation. Statsbook Table 8.",
  },
  {
    id: "A038RC1A027NBEA",
    name: "Supplements to Wages and Salaries",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "Billions of dollars",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Employer contributions to pensions, insurance, and social insurance — the benefits portion of compensation. Statsbook Table 8.",
  },
  {
    id: "A041RC1A027NBEA",
    name: "Proprietors' Income",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "Billions of dollars",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Income of sole proprietorships, partnerships, and farms. Statsbook Table 5.",
  },
  {
    id: "A048RC1A027NBEA",
    name: "Rental Income of Persons",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "Billions of dollars",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Income of persons from the rental of real property. Statsbook Table 5.",
  },
  {
    id: "A453RC1A027NBEA",
    name: "Net Interest & Miscellaneous Payments",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "Billions of dollars",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Net interest paid by businesses — the interest component of national income. Statsbook Table 5.",
  },
  {
    id: "K1PTOTL1ES000",
    name: "Fixed Private Capital Stock (current-cost net)",
    category: "output-income",
    kind: "LEVEL_CURRENCY",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "Millions of dollars",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: M,
    description:
      "The current-cost net stock of private fixed assets — the economy's accumulated private capital. Statsbook Table 17.",
  },
  {
    id: "USREC",
    name: "NBER Recession Indicator",
    category: "output-income",
    kind: "BINARY",
    frequency: "MONTHLY",
    seasonal: "NSA",
    units: "1 = recession, 0 = expansion",
    nominal: false,
    canGrowth: false,
    source: "FRED",
    hidden: true,
    description:
      "Equal to 1 during months the NBER dates as recessions. Used for the shaded recession bands on charts.",
  },

  // ────────────────────────── Prices & Inflation ─────────────────────────
  {
    id: "CPIAUCSL",
    name: "CPI — All Items",
    category: "prices-inflation",
    kind: "INDEX",
    frequency: "MONTHLY",
    seasonal: "SA",
    units: "Index 1982–84=100",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    description:
      "The Consumer Price Index for all urban consumers — the price of the BLS market basket. Its annual growth rate is headline CPI inflation.",
  },
  {
    id: "CPILFESL",
    name: "Core CPI (less food & energy)",
    category: "prices-inflation",
    kind: "INDEX",
    frequency: "MONTHLY",
    seasonal: "SA",
    units: "Index 1982–84=100",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    description:
      "The CPI excluding volatile food and energy prices — a cleaner read on underlying inflation trends.",
  },
  {
    id: "PCEPI",
    name: "PCE Price Index",
    category: "prices-inflation",
    kind: "INDEX",
    frequency: "MONTHLY",
    seasonal: "SA",
    units: "Index 2017=100",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    description:
      "The price index for personal consumption expenditures — the measure the Fed's 2% inflation target refers to.",
  },
  {
    id: "PCEPILFE",
    name: "Core PCE Price Index",
    category: "prices-inflation",
    kind: "INDEX",
    frequency: "MONTHLY",
    seasonal: "SA",
    units: "Index 2017=100",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    description:
      "The PCE price index excluding food and energy — the Fed's preferred gauge of underlying inflation.",
  },
  {
    id: "PPIACO",
    name: "Producer Price Index — All Commodities",
    category: "prices-inflation",
    kind: "INDEX",
    frequency: "MONTHLY",
    seasonal: "NSA",
    units: "Index 1982=100",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    description:
      "Prices received by domestic producers — an early-stage read on inflation pressure in supply chains.",
  },

  // ────────────────── Money, Banking & Interest Rates ────────────────────
  {
    id: "FEDFUNDS",
    name: "Effective Federal Funds Rate",
    category: "money-rates",
    kind: "RATIO",
    frequency: "MONTHLY",
    seasonal: "NSA",
    units: "Percent per year",
    nominal: false,
    canGrowth: false,
    source: "FRED",
    description:
      "The overnight interbank lending rate the Federal Reserve steers — its primary monetary policy tool.",
  },
  {
    id: "GS10",
    name: "10-Year Treasury Yield",
    category: "money-rates",
    kind: "RATIO",
    frequency: "MONTHLY",
    seasonal: "NSA",
    units: "Percent per year",
    nominal: false,
    canGrowth: false,
    source: "FRED",
    description:
      "The yield on 10-year U.S. Treasury securities — the benchmark long-term risk-free rate.",
  },
  {
    id: "MORTGAGE30US",
    name: "30-Year Fixed Mortgage Rate",
    category: "money-rates",
    kind: "RATIO",
    frequency: "WEEKLY",
    seasonal: "NSA",
    units: "Percent per year",
    nominal: false,
    canGrowth: false,
    source: "FRED",
    description:
      "The average rate on a 30-year fixed-rate home mortgage (Freddie Mac survey).",
  },
  {
    id: "AAA",
    name: "Moody's Aaa Corporate Bond Yield",
    category: "money-rates",
    kind: "RATIO",
    frequency: "MONTHLY",
    seasonal: "NSA",
    units: "Percent per year",
    nominal: false,
    canGrowth: false,
    source: "FRED",
    description:
      "Borrowing cost of the highest-grade U.S. corporations. Compare with the Baa yield to see the risk spread between investment-grade tiers.",
  },
  {
    id: "BAA",
    name: "Moody's Baa Corporate Bond Yield",
    category: "money-rates",
    kind: "RATIO",
    frequency: "MONTHLY",
    seasonal: "NSA",
    units: "Percent per year",
    nominal: false,
    canGrowth: false,
    source: "FRED",
    description:
      "Borrowing cost of lower-medium-grade corporations — the gap over Aaa is a classic gauge of credit risk.",
  },
  {
    id: "TERMCBCCALLNS",
    name: "Credit Card Interest Rate (all accounts)",
    category: "money-rates",
    kind: "RATIO",
    frequency: "QUARTERLY",
    seasonal: "NSA",
    units: "Percent per year",
    nominal: false,
    canGrowth: false,
    source: "FRED",
    description:
      "The average interest rate on all commercial-bank credit card plans — the clearest proxy for consumer credit rates.",
    notes: "Reported quarterly since late 1994.",
  },
  {
    id: "M1SL",
    name: "M1 Money Stock",
    category: "money-rates",
    kind: "LEVEL_CURRENCY",
    frequency: "MONTHLY",
    seasonal: "SA",
    units: "Billions of dollars",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Currency plus checkable and other liquid deposits. A definitional change in May 2020 added savings deposits, producing a one-time jump.",
  },
  {
    id: "M2SL",
    name: "M2 Money Stock",
    category: "money-rates",
    kind: "LEVEL_CURRENCY",
    frequency: "MONTHLY",
    seasonal: "SA",
    units: "Billions of dollars",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "M1 plus small time deposits and retail money market funds — the broad money supply.",
  },
  {
    id: "BOGMBASE",
    name: "Monetary Base",
    category: "money-rates",
    kind: "LEVEL_CURRENCY",
    frequency: "MONTHLY",
    seasonal: "NSA",
    units: "Billions of dollars",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Currency in circulation plus bank reserves at the Fed — the money the central bank directly creates.",
    notes:
      "FRED serves this series in billions (verified: Dec 2008 = 1,666.4, the post-Lehman ~$1.67T base), despite older documentation citing millions.",
  },

  // ────────────────────────── Government Finance ─────────────────────────
  {
    id: "FGRECPT",
    name: "Federal Government Current Receipts",
    category: "government-finance",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Billions of dollars, SAAR",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Federal tax and other receipts on a national-accounts basis.",
  },
  {
    id: "FGEXPND",
    name: "Federal Government Current Expenditures",
    category: "government-finance",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Billions of dollars, SAAR",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Federal spending including transfers, on a national-accounts basis. When it exceeds receipts, the government runs a deficit.",
  },
  {
    id: "FYFSD",
    name: "Federal Surplus or Deficit (−)",
    category: "government-finance",
    kind: "LEVEL_CURRENCY",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "Millions of dollars",
    nominal: true,
    canGrowth: false,
    source: "FRED",
    dollarScale: M,
    description:
      "The annual federal budget balance by fiscal year. Negative values are deficits — the flow that accumulates into the debt.",
    notes: "Crosses zero, so growth-rate transforms are disabled.",
  },
  {
    id: "GFDEBTN",
    name: "Federal Debt: Total Public Debt",
    category: "government-finance",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "NSA",
    units: "Millions of dollars",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: M,
    description:
      "The outstanding stock of federal debt — the accumulation of all past deficits and surpluses.",
  },
  {
    id: "GFDEGDQ188S",
    name: "Federal Debt as Percent of GDP",
    category: "government-finance",
    kind: "RATIO",
    frequency: "QUARTERLY",
    seasonal: "SA",
    units: "Percent of GDP",
    nominal: false,
    canGrowth: false,
    source: "FRED",
    description:
      "Total public debt divided by GDP — the standard measure of fiscal sustainability.",
  },
  {
    id: "W055RC1A027NBEA",
    name: "Personal Current Taxes",
    category: "government-finance",
    kind: "LEVEL_CURRENCY",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "Billions of dollars",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Income and other personal taxes paid to all levels of government. Statsbook Table 14.",
  },
  {
    id: "FCTAX",
    name: "Federal Corporate Income Tax Receipts",
    category: "government-finance",
    kind: "LEVEL_CURRENCY",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "Billions of dollars",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Federal tax receipts on corporate income. Statsbook Table 14.",
  },
  {
    id: "A061RC1A027NBEA",
    name: "Contributions for Government Social Insurance",
    category: "government-finance",
    kind: "LEVEL_CURRENCY",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "Billions of dollars",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Payroll taxes funding Social Security, Medicare, and unemployment insurance. Statsbook Table 14.",
  },
  {
    id: "B234RC1A027NBEA",
    name: "Federal Excise Taxes",
    category: "government-finance",
    kind: "LEVEL_CURRENCY",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "Billions of dollars",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Federal excise tax receipts (fuel, tobacco, alcohol, and similar). Statsbook Table 14.",
  },
  {
    id: "FDEFX",
    name: "Federal Defense Expenditures",
    category: "government-finance",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Billions of dollars, SAAR",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Federal national defense consumption expenditures and gross investment. Statsbook Table 15.",
  },
  {
    id: "FNDEFX",
    name: "Federal Nondefense Expenditures",
    category: "government-finance",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Billions of dollars, SAAR",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Federal nondefense consumption expenditures and gross investment. Statsbook Table 15.",
  },
  {
    id: "W014RC1Q027SBEA",
    name: "Federal Transfer Payments",
    category: "government-finance",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Billions of dollars, SAAR",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Federal current transfer payments — Social Security, Medicare, Medicaid, and other mandatory benefit programs. Statsbook Table 15.",
  },
  {
    id: "A091RC1Q027SBEA",
    name: "Federal Interest Payments",
    category: "government-finance",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Billions of dollars, SAAR",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description:
      "Interest the federal government pays on its debt. Statsbook Table 15.",
  },

  // ──────────────────── International Trade & Exchange ───────────────────
  {
    id: "EXPGS",
    name: "Exports of Goods and Services",
    category: "international",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Billions of dollars, SAAR",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description: "The value of U.S. goods and services sold abroad.",
  },
  {
    id: "IMPGS",
    name: "Imports of Goods and Services",
    category: "international",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Billions of dollars, SAAR",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: B,
    description: "The value of foreign goods and services purchased by U.S. residents.",
  },
  {
    id: "BOPGSTB",
    name: "Trade Balance: Goods and Services",
    category: "international",
    kind: "LEVEL_CURRENCY",
    frequency: "MONTHLY",
    seasonal: "SA",
    units: "Millions of dollars",
    nominal: true,
    canGrowth: false,
    source: "FRED",
    dollarScale: M,
    flow: true,
    description:
      "The monthly goods-and-services trade balance on a balance-of-payments basis.",
    notes: "Crosses zero, so growth-rate transforms are disabled.",
  },
  {
    id: "NETFI",
    name: "Current Account Balance (NIPA net lending)",
    category: "international",
    kind: "LEVEL_CURRENCY",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Billions of dollars, SAAR",
    nominal: true,
    canGrowth: false,
    source: "FRED",
    dollarScale: B,
    description:
      "Net U.S. lending to (+) or borrowing from (−) the rest of the world — the national-accounts counterpart of the current account balance (goods, services, income, and transfers).",
    notes: "Crosses zero, so growth-rate transforms are disabled.",
  },
  {
    id: "DTWEXBGS",
    name: "Nominal Broad U.S. Dollar Index",
    category: "international",
    kind: "INDEX",
    frequency: "DAILY",
    seasonal: "NSA",
    units: "Index Jan 2006=100",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    description:
      "The trade-weighted value of the dollar against a broad basket of partner currencies. Higher = stronger dollar.",
  },
  {
    id: "RBUSBIS",
    name: "Real Broad Effective Exchange Rate (BIS)",
    category: "international",
    kind: "INDEX",
    frequency: "MONTHLY",
    seasonal: "NSA",
    units: "Index 2020=100",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    description:
      "The inflation-adjusted trade-weighted dollar — the real measure of U.S. price competitiveness abroad.",
  },

  // ───────────────────── Labor Market & Population ───────────────────────
  {
    id: "UNRATE",
    name: "Unemployment Rate",
    category: "labor-market",
    kind: "RATIO",
    frequency: "MONTHLY",
    seasonal: "SA",
    units: "Percent of labor force",
    nominal: false,
    canGrowth: false,
    source: "FRED",
    description:
      "The share of the labor force that is jobless and actively looking for work.",
  },
  {
    id: "PAYEMS",
    name: "Total Nonfarm Payrolls",
    category: "labor-market",
    kind: "LEVEL_COUNT",
    frequency: "MONTHLY",
    seasonal: "SA",
    units: "Thousands of persons",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    description:
      "The number of jobs on nonfarm payrolls — the headline monthly employment figure.",
  },
  {
    id: "CIVPART",
    name: "Labor Force Participation Rate",
    category: "labor-market",
    kind: "RATIO",
    frequency: "MONTHLY",
    seasonal: "SA",
    units: "Percent of population",
    nominal: false,
    canGrowth: false,
    source: "FRED",
    description:
      "The share of the civilian noninstitutional population working or looking for work.",
  },
  {
    id: "EMRATIO",
    name: "Employment-Population Ratio",
    category: "labor-market",
    kind: "RATIO",
    frequency: "MONTHLY",
    seasonal: "SA",
    units: "Percent of population",
    nominal: false,
    canGrowth: false,
    source: "FRED",
    description:
      "The share of the civilian noninstitutional population that is employed.",
  },
  {
    id: "JTSJOL",
    name: "Job Openings: Total Nonfarm (JOLTS)",
    category: "labor-market",
    kind: "LEVEL_COUNT",
    frequency: "MONTHLY",
    seasonal: "SA",
    units: "Thousands",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    description:
      "Unfilled job openings on the last business day of the month, from the BLS JOLTS survey.",
  },
  {
    id: "AHETPI",
    name: "Average Hourly Earnings (production & nonsupervisory)",
    category: "labor-market",
    kind: "LEVEL_CURRENCY",
    frequency: "MONTHLY",
    seasonal: "SA",
    units: "Dollars per hour",
    nominal: true,
    canGrowth: true,
    source: "FRED",
    dollarScale: 1,
    description:
      "The nominal hourly wage of production and nonsupervisory workers. Apply the Real transform to see purchasing power.",
  },
  {
    id: "CLF16OV",
    name: "Civilian Labor Force",
    category: "labor-market",
    kind: "LEVEL_COUNT",
    frequency: "MONTHLY",
    seasonal: "SA",
    units: "Thousands of persons",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    description: "Everyone aged 16+ who is employed or actively seeking work.",
  },
  {
    id: "UNEMPLOY",
    name: "Unemployment Level",
    category: "labor-market",
    kind: "LEVEL_COUNT",
    frequency: "MONTHLY",
    seasonal: "SA",
    units: "Thousands of persons",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    description: "The number of unemployed persons.",
  },
  {
    id: "CNP16OV",
    name: "Civilian Noninstitutional Population (16+)",
    category: "labor-market",
    kind: "LEVEL_COUNT",
    frequency: "MONTHLY",
    seasonal: "NSA",
    units: "Thousands of persons",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    description:
      "The working-age population base used for the participation rate and employment-population ratio. Statsbook Table 11.",
  },
  {
    id: "POPTHM",
    name: "U.S. Population",
    category: "labor-market",
    kind: "LEVEL_COUNT",
    frequency: "MONTHLY",
    seasonal: "NSA",
    units: "Thousands",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    description:
      "Total U.S. population including armed forces overseas. Used by the per-capita transform.",
  },

  // ─────────────────────── Productivity & Costs ──────────────────────────
  {
    id: "OPHNFB",
    name: "Output per Hour (Labor Productivity)",
    category: "productivity-costs",
    kind: "INDEX",
    frequency: "QUARTERLY",
    seasonal: "SA",
    units: "Index 2017=100",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    description:
      "Real output per hour worked in the nonfarm business sector — the standard measure of labor productivity.",
  },
  {
    id: "COMPRNFB",
    name: "Real Hourly Compensation",
    category: "productivity-costs",
    kind: "INDEX",
    frequency: "QUARTERLY",
    seasonal: "SA",
    units: "Index 2017=100",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    description:
      "Inflation-adjusted hourly compensation (wages plus benefits) in the nonfarm business sector.",
  },
  {
    id: "ULCNFB",
    name: "Unit Labor Costs",
    category: "productivity-costs",
    kind: "INDEX",
    frequency: "QUARTERLY",
    seasonal: "SA",
    units: "Index 2017=100",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    description:
      "Labor cost per unit of output — compensation growth in excess of productivity growth.",
  },
  {
    id: "OUTNFB",
    name: "Nonfarm Business Real Output",
    category: "productivity-costs",
    kind: "INDEX",
    frequency: "QUARTERLY",
    seasonal: "SA",
    units: "Index 2017=100",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    description:
      "Real output of the nonfarm business sector — the numerator of the productivity ratio (output ÷ hours).",
  },
  {
    id: "HOANBS",
    name: "Nonfarm Business Hours Worked",
    category: "productivity-costs",
    kind: "INDEX",
    frequency: "QUARTERLY",
    seasonal: "SA",
    units: "Index 2017=100",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    description:
      "Hours of all persons in the nonfarm business sector — the denominator of the productivity ratio.",
  },

  // ────────────────── Consumers & Business Conditions ────────────────────
  {
    id: "TCU",
    name: "Capacity Utilization: Total Industry",
    category: "consumer-business",
    kind: "RATIO",
    frequency: "MONTHLY",
    seasonal: "SA",
    units: "Percent of capacity",
    nominal: false,
    canGrowth: false,
    source: "FRED",
    description:
      "The share of industrial capacity currently in use. Statsbook Table 17.",
  },
  {
    id: "MCUMFN",
    name: "Capacity Utilization: Manufacturing",
    category: "consumer-business",
    kind: "RATIO",
    frequency: "MONTHLY",
    seasonal: "SA",
    units: "Percent of capacity",
    nominal: false,
    canGrowth: false,
    source: "FRED",
    description:
      "The share of manufacturing capacity in use — compare with total industry (TCU). Statsbook Table 17.",
  },
  {
    id: "UMCSENT",
    name: "Consumer Sentiment (U. Michigan)",
    category: "consumer-business",
    kind: "INDEX",
    frequency: "MONTHLY",
    seasonal: "NSA",
    units: "Index 1966:Q1=100",
    nominal: false,
    canGrowth: false,
    source: "FRED",
    description:
      "Household confidence about current and future economic conditions.",
  },

  // ──────────────────────── Income Distribution ──────────────────────────
  {
    id: "MEHOINUSA672N",
    name: "Real Median Household Income",
    category: "income-distribution",
    kind: "LEVEL_CURRENCY",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "2023 CPI-U-RS adjusted dollars",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    dollarScale: 1,
    description:
      "The income of the household exactly in the middle of the distribution, in inflation-adjusted dollars. Statsbook Table 16.",
    notes:
      "Already inflation-adjusted by the Census Bureau (CPI-U-RS), so the Real transform is not applicable.",
  },
  {
    id: "MEFAINUSA672N",
    name: "Real Median Family Income",
    category: "income-distribution",
    kind: "LEVEL_CURRENCY",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "2023 CPI-U-RS adjusted dollars",
    nominal: false,
    canGrowth: true,
    source: "FRED",
    dollarScale: 1,
    description:
      "The inflation-adjusted income of the median U.S. family. Statsbook Table 16 is stated in family terms.",
  },
  {
    id: "PPAAUS00000A156NCEN",
    name: "Poverty Rate: All Ages",
    category: "income-distribution",
    kind: "RATIO",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "Percent of population",
    nominal: false,
    canGrowth: false,
    source: "FRED",
    description:
      "The estimated share of all people below the poverty line (Census SAIPE). Statsbook Table 16.",
    notes:
      "Replaces the retired id PPAACH from the original task board; see docs/decisions.md.",
  },
  {
    id: "PEAAUS00000A647NCEN",
    name: "People in Poverty: All Ages",
    category: "income-distribution",
    kind: "LEVEL_COUNT",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "Persons",
    nominal: false,
    canGrowth: false,
    source: "FRED",
    description:
      "The estimated number of people of all ages living below the poverty line (Census SAIPE). Statsbook Table 16.",
  },
  {
    id: "SIPOVGINIUSA",
    name: "Gini Index of Income Inequality",
    category: "income-distribution",
    kind: "RATIO",
    frequency: "ANNUAL",
    seasonal: "NSA",
    units: "Index (0–100)",
    nominal: false,
    canGrowth: false,
    source: "FRED",
    description:
      "A single-number summary of income inequality: 0 means everyone earns the same; 100 means one person earns everything. Statsbook Table 16 and Figure 50.",
  },

  // ──────────────────────── Dr. Dash Constructed ─────────────────────────
  {
    id: "DD_REAL_FFR",
    name: "Real Federal Funds Rate",
    category: "dr-dash-constructed",
    kind: "RATIO",
    frequency: "MONTHLY",
    seasonal: "NSA",
    units: "Percent per year",
    nominal: false,
    canGrowth: false,
    source: "CONSTRUCTED",
    description:
      "The federal funds rate minus year-over-year CPI inflation. Negative values mean borrowing is free in real terms — an aggressively stimulative stance.",
    notes: "Constructed as FEDFUNDS − YoY growth of CPIAUCSL.",
  },
  {
    id: "DD_MISERY",
    name: "Misery Index",
    category: "dr-dash-constructed",
    kind: "RATIO",
    frequency: "MONTHLY",
    seasonal: "NSA",
    units: "Percentage points",
    nominal: false,
    canGrowth: false,
    source: "CONSTRUCTED",
    description:
      "The unemployment rate plus CPI inflation — Arthur Okun's shorthand for how bad households feel the economy is.",
    notes: "Constructed as UNRATE + YoY growth of CPIAUCSL.",
  },
  {
    id: "DD_WAGE_PRICE_GAP",
    name: "Wage–Productivity Gap",
    category: "dr-dash-constructed",
    kind: "RATIO",
    frequency: "QUARTERLY",
    seasonal: "SA",
    units: "Percentage points",
    nominal: false,
    canGrowth: false,
    source: "CONSTRUCTED",
    description:
      "Growth of real hourly compensation minus growth of output per hour. When negative, workers are not fully capturing productivity gains.",
    notes: "Constructed as YoY growth of COMPRNFB − YoY growth of OPHNFB.",
  },
  {
    id: "DD_MONEY_VEL",
    name: "M2 Money Velocity",
    category: "dr-dash-constructed",
    kind: "RATIO",
    frequency: "QUARTERLY",
    seasonal: "SAAR",
    units: "Ratio (GDP ÷ M2)",
    nominal: false,
    canGrowth: false,
    source: "CONSTRUCTED",
    description:
      "Nominal GDP divided by the M2 money stock — how many times each dollar turns over per year. Statsbook Figure 32 and Table 12.",
    notes: "Constructed as GDP ÷ quarterly average of M2SL.",
  },
];

export const SERIES_BY_ID: ReadonlyMap<string, SeriesDef> = new Map(
  SERIES_CATALOG.map((s) => [s.id, s])
);

export function getSeriesDef(id: string): SeriesDef | undefined {
  return SERIES_BY_ID.get(id);
}

export function requireSeriesDef(id: string): SeriesDef {
  const def = SERIES_BY_ID.get(id);
  if (!def) throw new Error(`Unknown series id: ${id}`);
  return def;
}

export function seriesForCategory(slug: CategorySlug): SeriesDef[] {
  return SERIES_CATALOG.filter((s) => s.category === slug && !s.hidden);
}

export function fredSeries(): SeriesDef[] {
  return SERIES_CATALOG.filter((s) => s.source === "FRED");
}

export function constructedSeries(): SeriesDef[] {
  return SERIES_CATALOG.filter((s) => s.source === "CONSTRUCTED");
}

/** Multiplier converting a stored value to plain dollars (LEVEL_CURRENCY only). */
export function dollarScale(def: SeriesDef): number {
  return def.dollarScale ?? (def.kind === "LEVEL_CURRENCY" ? B : 1);
}
