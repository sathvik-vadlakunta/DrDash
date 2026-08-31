/**
 * The Statsbook appendix table catalog — the 17 tables of the professor's
 * Statsbook 2025–2026, defined as columns over the Dr. Dash series catalog.
 *
 * The app renders each table as one row per YEAR (annual averages of the
 * underlying series), so only columns are defined here. Real (chained-2017$)
 * columns marked `rebaseToLatestYear` are re-expressed in 2024 dollars to
 * match the printed book. Table 3 is a static single-year snapshot built from
 * the offline seed data.
 */
import type { StatsbookTableDef } from "@/lib/statsbook/types";

export const STATSBOOK_TABLES: StatsbookTableDef[] = [
  {
    id: 1,
    title: "Gross Domestic Product",
    description:
      "Nominal GDP, real GDP, and real GDP per person — the economy's headline size in current dollars, inflation-adjusted dollars, and per-capita terms. Real columns are chained-2017$ series rebased to 2024 dollars, as in the printed statsbook.",
    columns: [
      {
        key: "nominalGdp",
        label: "Nominal GDP ($B)",
        source: { seriesId: "GDP" },
        format: "currencyB",
      },
      {
        key: "realGdp",
        label: "Real GDP ($B, 2024$)",
        source: { seriesId: "GDPC1", rebaseToLatestYear: true },
        format: "currencyB",
      },
      {
        key: "realGdpPerCapita",
        label: "Per Capita Real GDP ($, 2024$)",
        source: {
          seriesId: "GDPC1",
          transform: "PER_CAPITA",
          rebaseToLatestYear: true,
        },
        format: "currency",
      },
    ],
  },
  {
    id: 2,
    title: "GDP by Expenditure Component",
    description:
      "The expenditure decomposition C + I + G + NX, with each component expressed as a share of GDP so the shares sum to 100. Net exports have been a negative share in most years since the 1980s — the U.S. trade deficit.",
    columns: [
      {
        key: "consumptionShare",
        label: "Consumption (% of GDP)",
        source: { seriesId: "PCEC", transform: "PCT_OF", denominatorId: "GDP" },
        format: "percent",
      },
      {
        key: "investmentShare",
        label: "Investment (% of GDP)",
        source: { seriesId: "GPDI", transform: "PCT_OF", denominatorId: "GDP" },
        format: "percent",
      },
      {
        key: "governmentShare",
        label: "Government (% of GDP)",
        source: { seriesId: "GCE", transform: "PCT_OF", denominatorId: "GDP" },
        format: "percent",
      },
      {
        key: "netExportsShare",
        label: "Net Exports (% of GDP)",
        source: {
          seriesId: "NETEXP",
          transform: "PCT_OF",
          denominatorId: "GDP",
        },
        format: "percent",
      },
      {
        key: "realGdpPerCapita",
        label: "Per Capita Real GDP ($, 2024$)",
        source: {
          seriesId: "GDPC1",
          transform: "PER_CAPITA",
          rebaseToLatestYear: true,
        },
        format: "currency",
      },
    ],
  },
  {
    id: 3,
    title: "Disposition of GNP as Income",
    description:
      "A single-year snapshot showing how the value of 2024 production was disposed of as income: the income components of national income, plus the depreciation (consumption of fixed capital) that separates gross from net product. Values are 2024, current dollars, national-accounts (NIPA) basis, with quarterly series averaged over the year; GDP stands in for GNP.",
    columns: [],
    static: {
      year: 2024,
      rows: [
        { label: "Gross domestic product", value: "$29,298 B" },
        { label: "Compensation of employees", value: "$15,027 B" },
        { label: "Proprietors' income", value: "$2,023 B" },
        { label: "Rental income of persons", value: "$1,078 B" },
        { label: "Corporate profits after tax", value: "$3,499 B" },
        { label: "Net interest & misc. payments", value: "$88 B" },
        { label: "Consumption of fixed capital", value: "$4,797 B" },
        { label: "National income", value: "$24,197 B" },
      ],
    },
    notes:
      "National income plus consumption of fixed capital does not sum exactly to GDP: taxes on production and imports (net of subsidies), business transfer payments, the statistical discrepancy, and net factor income from abroad account for the remainder.",
  },
  {
    id: 4,
    title: "Aggregate Income Measures",
    description:
      "The chain of aggregate income measures from total output down to what households can actually spend: gross national product, net national product (GNP less depreciation), national income (income earned in production), personal income, and disposable personal income (after taxes).",
    columns: [
      {
        key: "gdp",
        label: "GDP ($B)",
        source: { seriesId: "GDP" },
        format: "currencyB",
      },
      {
        key: "gnp",
        label: "Gross National Product ($B)",
        source: { seriesId: "A023RC1A027NBEA" },
        format: "currencyB",
      },
      {
        key: "nnp",
        label: "Net National Product ($B)",
        source: { seriesId: "A027RC1A027NBEA" },
        format: "currencyB",
      },
      {
        key: "nationalIncome",
        label: "National Income ($B)",
        source: { seriesId: "A032RC1A027NBEA" },
        format: "currencyB",
      },
      {
        key: "personalIncome",
        label: "Personal Income ($B)",
        source: { seriesId: "PI" },
        format: "currencyB",
      },
      {
        key: "dpi",
        label: "Disposable Personal Income ($B)",
        source: { seriesId: "DSPI" },
        format: "currencyB",
      },
    ],
  },
  {
    id: 5,
    title: "GNP by Income Component",
    description:
      "National income broken into who earned it: employee compensation (by far the largest share), proprietors' and rental income, corporate profits after tax, and net interest. All values are current dollars, NIPA basis.",
    columns: [
      {
        key: "compensation",
        label: "Compensation of Employees ($B)",
        source: { seriesId: "A033RC1A027NBEA" },
        format: "currencyB",
      },
      {
        key: "proprietorsIncome",
        label: "Proprietors' Income ($B)",
        source: { seriesId: "A041RC1A027NBEA" },
        format: "currencyB",
      },
      {
        key: "rentalIncome",
        label: "Rental Income of Persons ($B)",
        source: { seriesId: "A048RC1A027NBEA" },
        format: "currencyB",
      },
      {
        key: "corporateProfits",
        label: "Corporate Profits After Tax ($B)",
        source: { seriesId: "CP" },
        format: "currencyB",
      },
      {
        key: "netInterest",
        label: "Net Interest ($B)",
        source: { seriesId: "A453RC1A027NBEA" },
        format: "currencyB",
      },
    ],
  },
  {
    id: 6,
    title: "Components of Disposable Personal Income",
    description:
      "What households do with after-tax income: consume it or save it. Consumption here is total PCE (which includes items outside disposable income accounting conventions), and the saving rate is personal saving as a percent of disposable income.",
    columns: [
      {
        key: "personalIncome",
        label: "Personal Income ($B)",
        source: { seriesId: "PI" },
        format: "currencyB",
      },
      {
        key: "personalTaxes",
        label: "Personal Current Taxes ($B)",
        source: { seriesId: "W055RC1A027NBEA" },
        format: "currencyB",
      },
      {
        key: "dpi",
        label: "Disposable Personal Income ($B)",
        source: { seriesId: "DSPI" },
        format: "currencyB",
      },
      {
        key: "consumption",
        label: "Personal Consumption ($B)",
        source: { seriesId: "PCEC" },
        format: "currencyB",
      },
      {
        key: "savingRate",
        label: "Saving Rate (% of DPI)",
        source: { seriesId: "PSAVERT" },
        format: "percent",
      },
      {
        key: "dpiPerCapita",
        label: "DPI Per Capita ($)",
        source: { seriesId: "DSPI", transform: "PER_CAPITA" },
        format: "currency",
      },
    ],
  },
  {
    id: 7,
    title: "Per Capita Real Saving",
    description:
      "Economy-wide gross saving alongside the depreciation that must be netted out of it, plus gross saving per person. Net saving — the economy's true addition to wealth — is gross saving minus consumption of fixed capital.",
    columns: [
      {
        key: "grossSaving",
        label: "Gross Saving ($B)",
        source: { seriesId: "GSAVE" },
        format: "currencyB",
      },
      {
        key: "cfc",
        label: "Consumption of Fixed Capital ($B)",
        source: { seriesId: "COFC" },
        format: "currencyB",
      },
      {
        key: "grossSavingPerCapita",
        label: "Gross Saving Per Capita ($)",
        source: { seriesId: "GSAVE", transform: "PER_CAPITA" },
        format: "currency",
      },
    ],
    notes:
      "Columns are in current dollars; the printed table's constant-dollar per-capita net saving is approximated here by nominal gross saving per capita, with net saving computable as gross saving minus consumption of fixed capital.",
  },
  {
    id: 8,
    title: "Labor Income Breakdown",
    description:
      "Employee compensation split into its two parts: cash wages and salaries, and supplements (employer contributions to pensions, insurance, and social insurance). Supplements have grown from a sliver of pay to a substantial share of total compensation over the postwar period.",
    columns: [
      {
        key: "wagesSalaries",
        label: "Wages & Salaries ($B)",
        source: { seriesId: "A034RC1A027NBEA" },
        format: "currencyB",
      },
      {
        key: "supplements",
        label: "Supplements to Wages & Salaries ($B)",
        source: { seriesId: "A038RC1A027NBEA" },
        format: "currencyB",
      },
      {
        key: "totalCompensation",
        label: "Total Compensation ($B)",
        source: { seriesId: "A033RC1A027NBEA" },
        format: "currencyB",
      },
    ],
    notes:
      "The printed table's final column — compensation as a percent of national income (about 62% in 2024: $15,027B of $24,197B) — is omitted because no transform divides two arbitrary series; compare the compensation column here against national income in Table 4.",
  },
  {
    id: 9,
    title: "Per Capita Real Investment and Labor Productivity",
    description:
      "Investment and productivity side by side: total gross private domestic investment (current dollars), real business fixed investment, investment per person, and output per hour worked in the nonfarm business sector — the standard labor productivity measure.",
    columns: [
      {
        key: "grossInvestment",
        label: "Gross Private Investment ($B)",
        source: { seriesId: "GPDI" },
        format: "currencyB",
      },
      {
        key: "realNonresInvestment",
        label: "Real Nonresidential Fixed Investment ($B, chained 2017$)",
        source: { seriesId: "PNFIC1" },
        format: "currencyB",
      },
      {
        key: "investmentPerCapita",
        label: "Investment Per Capita ($)",
        source: { seriesId: "GPDI", transform: "PER_CAPITA" },
        format: "currency",
      },
      {
        key: "netForeignInvestment",
        label: "Net Foreign Investment ($B)",
        source: { seriesId: "NETFI" },
        format: "currencyB",
      },
      {
        key: "productivity",
        label: "Labor Productivity (Index, 2017=100)",
        source: { seriesId: "OPHNFB" },
        format: "index",
      },
    ],
    notes:
      "Net foreign investment is NIPA net lending/borrowing with the rest of the world (negative when the U.S. borrows abroad). The seeded real nonresidential fixed investment series (PNFIC1) begins in 2007; earlier rows show only the other columns.",
  },
  {
    id: 10,
    title: "Prices, Interest Rates, Wages, and Exchange Rates",
    description:
      "The economy's key prices in one table: the two main price indexes, the benchmark high-grade corporate borrowing rate, nominal and real hourly wages, and the trade-weighted value of the dollar.",
    columns: [
      {
        key: "gdpDeflator",
        label: "GDP Deflator (2017=100)",
        source: { seriesId: "GDPDEF" },
        format: "index",
      },
      {
        key: "cpi",
        label: "CPI (1982–84=100)",
        source: { seriesId: "CPIAUCSL" },
        format: "index",
      },
      {
        key: "aaaYield",
        label: "Aaa Corporate Bond Yield (%)",
        source: { seriesId: "AAA" },
        format: "percent",
      },
      {
        key: "hourlyEarnings",
        label: "Avg Hourly Earnings ($/hr)",
        source: { seriesId: "AHETPI" },
        format: "ratio",
      },
      {
        key: "realHourlyEarnings",
        label: "Real Avg Hourly Earnings ($/hr)",
        source: { seriesId: "AHETPI", transform: "REAL" },
        format: "ratio",
      },
      {
        key: "dollarIndex",
        label: "Broad Dollar Index (Jan 2006=100)",
        source: { seriesId: "DTWEXBGS" },
        format: "index",
      },
    ],
    notes:
      "Real hourly earnings deflate the nominal wage by the CPI. Average hourly earnings cover production and nonsupervisory workers and begin in 1964; the broad dollar index begins in 2006.",
  },
  {
    id: 11,
    title: "Population, Labor Force, Employment, Unemployment",
    description:
      "The labor market's accounting frame: from total population, to the working-age population, to the labor force, to jobs and joblessness — with the three headline rates (participation, employment-population, unemployment) computed from those stocks.",
    columns: [
      {
        key: "population",
        label: "Population (K)",
        source: { seriesId: "POPTHM" },
        format: "countK",
      },
      {
        key: "workingAgePop",
        label: "Civilian Noninstitutional Population 16+ (K)",
        source: { seriesId: "CNP16OV" },
        format: "countK",
      },
      {
        key: "laborForce",
        label: "Civilian Labor Force (K)",
        source: { seriesId: "CLF16OV" },
        format: "countK",
      },
      {
        key: "payrolls",
        label: "Nonfarm Payrolls (K)",
        source: { seriesId: "PAYEMS" },
        format: "countK",
      },
      {
        key: "unemployed",
        label: "Unemployed (K)",
        source: { seriesId: "UNEMPLOY" },
        format: "countK",
      },
      {
        key: "participationRate",
        label: "Participation Rate (%)",
        source: { seriesId: "CIVPART" },
        format: "percent",
      },
      {
        key: "empPopRatio",
        label: "Employment-Population Ratio (%)",
        source: { seriesId: "EMRATIO" },
        format: "percent",
      },
      {
        key: "unemploymentRate",
        label: "Unemployment Rate (%)",
        source: { seriesId: "UNRATE" },
        format: "percent",
      },
    ],
  },
  {
    id: 12,
    title: "Money Stocks",
    description:
      "The money supply at three levels of breadth — M1, M2, and the monetary base the Fed directly creates — plus M2 velocity, the number of times each dollar of M2 turns over in a year of nominal GDP.",
    columns: [
      {
        key: "m1",
        label: "M1 ($B)",
        source: { seriesId: "M1SL" },
        format: "currencyB",
      },
      {
        key: "m2",
        label: "M2 ($B)",
        source: { seriesId: "M2SL" },
        format: "currencyB",
      },
      {
        key: "monetaryBase",
        label: "Monetary Base ($B)",
        source: { seriesId: "BOGMBASE" },
        format: "currencyB",
      },
      {
        key: "m2Velocity",
        label: "M2 Velocity (GDP ÷ M2)",
        source: { seriesId: "DD_MONEY_VEL" },
        format: "ratio",
      },
    ],
    notes:
      "A definitional change in May 2020 moved savings deposits into M1, producing a one-time jump in that column. All three money-stock series begin in 1959.",
  },
  {
    id: 13,
    title: "Government Receipts, Expenditures, Deficits, and Debt",
    description:
      "Federal finance from flow to stock: receipts and expenditures (NIPA basis), the annual budget surplus or deficit (fiscal-year basis), and the accumulated public debt in dollars and as a share of GDP.",
    columns: [
      {
        key: "receipts",
        label: "Federal Receipts ($B)",
        source: { seriesId: "FGRECPT" },
        format: "currencyB",
      },
      {
        key: "outlays",
        label: "Federal Expenditures ($B)",
        source: { seriesId: "FGEXPND" },
        format: "currencyB",
      },
      {
        key: "surplusDeficit",
        label: "Surplus or Deficit ($M)",
        source: { seriesId: "FYFSD" },
        format: "currencyB",
      },
      {
        key: "debt",
        label: "Federal Debt ($M)",
        source: { seriesId: "GFDEBTN" },
        format: "currencyB",
      },
      {
        key: "debtToGdp",
        label: "Debt (% of GDP)",
        source: { seriesId: "GFDEGDQ188S" },
        format: "percent",
      },
      {
        key: "outlaysToGdp",
        label: "Expenditures (% of GDP)",
        source: {
          seriesId: "FGEXPND",
          transform: "PCT_OF",
          denominatorId: "GDP",
        },
        format: "percent",
      },
      {
        key: "receiptsToGdp",
        label: "Receipts (% of GDP)",
        source: {
          seriesId: "FGRECPT",
          transform: "PCT_OF",
          denominatorId: "GDP",
        },
        format: "percent",
      },
      {
        key: "deficitToGdp",
        label: "Surplus/Deficit (% of GDP)",
        source: { seriesId: "FYFSD", transform: "PCT_OF", denominatorId: "GDP" },
        format: "percent",
      },
      {
        key: "receiptsPerCapita",
        label: "Receipts Per Capita ($)",
        source: { seriesId: "FGRECPT", transform: "PER_CAPITA" },
        format: "currency",
      },
      {
        key: "outlaysPerCapita",
        label: "Expenditures Per Capita ($)",
        source: { seriesId: "FGEXPND", transform: "PER_CAPITA" },
        format: "currency",
      },
    ],
    notes:
      "The surplus/deficit and debt columns are stored in millions of dollars, not billions. The surplus/deficit is on a fiscal-year budget basis while receipts and expenditures are calendar-year NIPA aggregates, so the columns will not reconcile exactly. Debt series begin in 1966.",
  },
  {
    id: 14,
    title: "Composition of Government Receipts",
    description:
      "The main revenue streams that fund government: personal current taxes, federal corporate income taxes, social insurance (payroll) contributions, and federal excise taxes. Payroll contributions have grown from a minor source in the 1930s into one of the largest.",
    columns: [
      {
        key: "personalTaxes",
        label: "Personal Current Taxes ($B)",
        source: { seriesId: "W055RC1A027NBEA" },
        format: "currencyB",
      },
      {
        key: "corporateTaxes",
        label: "Federal Corporate Income Taxes ($B)",
        source: { seriesId: "FCTAX" },
        format: "currencyB",
      },
      {
        key: "socialInsurance",
        label: "Social Insurance Contributions ($B)",
        source: { seriesId: "A061RC1A027NBEA" },
        format: "currencyB",
      },
      {
        key: "exciseTaxes",
        label: "Federal Excise Taxes ($B)",
        source: { seriesId: "B234RC1A027NBEA" },
        format: "currencyB",
      },
    ],
  },
  {
    id: 15,
    title: "Composition of Government Expenditures",
    description:
      "The major categories of federal spending: defense and nondefense purchases, transfer payments (Social Security, Medicare, Medicaid, and other mandatory benefit programs — the largest category), and interest payments on the federal debt — the cost of servicing the accumulated deficits in Table 13.",
    columns: [
      {
        key: "defense",
        label: "Defense Expenditures ($B)",
        source: { seriesId: "FDEFX" },
        format: "currencyB",
      },
      {
        key: "nondefense",
        label: "Nondefense Expenditures ($B)",
        source: { seriesId: "FNDEFX" },
        format: "currencyB",
      },
      {
        key: "transfers",
        label: "Transfer Payments — Mandatory Programs ($B)",
        source: { seriesId: "W014RC1Q027SBEA" },
        format: "currencyB",
      },
      {
        key: "interest",
        label: "Interest Payments ($B)",
        source: { seriesId: "A091RC1Q027SBEA" },
        format: "currencyB",
      },
    ],
    notes:
      "Defense and nondefense are NIPA consumption/investment purchases; transfers are current transfer payments. Together with interest they cover the bulk of the total federal expenditures shown in Table 13.",
  },
  {
    id: 16,
    title: "Income Distribution",
    description:
      "How income is distributed across households: inflation-adjusted median household and family income, the poverty rate and count, and the Gini index summarizing overall inequality in a single number.",
    columns: [
      {
        key: "medianHouseholdIncome",
        label: "Real Median Household Income ($)",
        source: { seriesId: "MEHOINUSA672N" },
        format: "currency",
      },
      {
        key: "medianFamilyIncome",
        label: "Real Median Family Income ($)",
        source: { seriesId: "MEFAINUSA672N" },
        format: "currency",
      },
      {
        key: "povertyRate",
        label: "Poverty Rate (%)",
        source: { seriesId: "PPAAUS00000A156NCEN" },
        format: "percent",
      },
      {
        key: "povertyCount",
        label: "People in Poverty",
        source: { seriesId: "PEAAUS00000A647NCEN" },
        format: "count",
      },
      {
        key: "gini",
        label: "Gini Index",
        source: { seriesId: "SIPOVGINIUSA" },
        format: "index",
      },
    ],
    notes:
      "The printed table's income-share-by-quintile columns come from Census Historical Table H-2 and its poverty threshold from Census poverty tables; neither has a single FRED series, so they are omitted here. Median incomes are already in constant (2023 CPI-U-RS) dollars. Household income begins in 1984, family income in 1953, and the poverty columns in 1989.",
  },
  {
    id: 17,
    title: "Capital Stock",
    description:
      "How intensively the existing capital stock is being used — capacity utilization for total industry and for manufacturing — alongside real business fixed investment, the flow that builds the stock.",
    columns: [
      {
        key: "capacityUtilTotal",
        label: "Capacity Utilization: Total Industry (%)",
        source: { seriesId: "TCU" },
        format: "percent",
      },
      {
        key: "capacityUtilMfg",
        label: "Capacity Utilization: Manufacturing (%)",
        source: { seriesId: "MCUMFN" },
        format: "percent",
      },
      {
        key: "realNonresInvestment",
        label: "Real Nonresidential Fixed Investment ($B, chained 2017$)",
        source: { seriesId: "PNFIC1" },
        format: "currencyB",
      },
      {
        key: "fixedCapitalStock",
        label: "Fixed Private Capital Stock ($M, current-cost net)",
        source: { seriesId: "K1PTOTL1ES000" },
        format: "currencyB",
      },
    ],
    notes:
      "The capital stock (current-cost net stock of private fixed assets, annual since 1925) is stated in millions of dollars. Total-industry capacity utilization begins in 1967 and manufacturing in 1972.",
  },
];

export const STATSBOOK_TABLES_BY_ID: ReadonlyMap<number, StatsbookTableDef> =
  new Map(STATSBOOK_TABLES.map((t) => [t.id, t]));

export function getStatsbookTable(id: number): StatsbookTableDef | undefined {
  return STATSBOOK_TABLES_BY_ID.get(id);
}
