/**
 * Statsbook Tab QA from the task board: 50 figures render as live charts with
 * working "Open in Chart Tool" links, all 17 tables render with correct data
 * (spot-checked against the printed statsbook), CSV downloads work, and the
 * tab behaves on mobile and for keyboard/screen-reader users.
 */
import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test.beforeEach(async ({ page }) => {
  await login(page, "student1@drdash.test");
});

test("figures tab lists all 50 figures with filter and live charts", async ({
  page,
}) => {
  await page.goto("/statsbook");
  await expect(page.getByText("50 of 50 figures")).toBeVisible();

  // Figure 1 renders a live chart (recharts svg path).
  const fig1 = page.getByTestId("figure-1");
  await fig1.scrollIntoViewIfNeeded();
  await expect(fig1.locator(".recharts-line-curve").first()).toBeVisible();

  // Filter by number jumps to a single figure.
  await page.getByTestId("figure-filter").fill("32");
  await expect(page.getByText("1 of 50 figures")).toBeVisible();
  await expect(page.getByTestId("figure-32")).toContainText("Velocity");

  // Category filter narrows the grid.
  await page.getByTestId("figure-filter").fill("");
  await page.getByTestId("figure-category").selectOption("labor");
  await expect(page.getByTestId("figure-41")).toBeVisible();
  await expect(page.getByTestId("figure-1")).toHaveCount(0);
});

test("Open in Chart Tool reproduces the figure config", async ({ page }) => {
  await page.goto("/statsbook");
  await page.getByTestId("figure-filter").fill("3");
  const fig3 = page.getByTestId("figure-3");
  await fig3.getByTestId("figure-3-open").click();
  await expect(page).toHaveURL(/\/dashboard\?.*s=GDPC1%3Apc|\/dashboard\?.*s=GDPC1:pc/);
  // The chart tool decodes the state into a per-capita chip and renders.
  await expect(page.getByTestId("dash-chip-GDPC1")).toBeVisible();
  await expect(
    page.getByTestId("dash-transform-GDPC1")
  ).toHaveValue("PER_CAPITA");
  await expect(page.locator(".recharts-line-curve").first()).toBeVisible();
});

test("tables tab lists 17 tables; Table 1 matches printed spot-checks", async ({
  page,
}) => {
  await page.goto("/statsbook?tab=tables");
  for (let i = 1; i <= 17; i++) {
    await expect(page.getByTestId(`table-link-${i}`)).toBeVisible();
  }
  await page.getByTestId("table-link-1").click();
  const table = page.getByTestId("table-1");
  await expect(table).toBeVisible();
  await expect(table.locator("th[scope='col']").first()).toBeVisible();

  // 2024 row: nominal GDP ≈ $29.2T (in billions → "29,xxx").
  const row2024 = table.locator("tr", { has: page.locator("td", { hasText: /^2024$/ }) });
  await expect(row2024.locator("td").nth(1)).toHaveText(/^29,\d{3}/);
  // Per-capita real GDP ≈ $85,784 in 2024 dollars.
  await expect(row2024.locator("td").nth(3)).toHaveText(/^8[3-8],\d{3}/);
});

test("year range filter and CSV download work", async ({ page }) => {
  await page.goto("/statsbook/tables/11");
  await page.getByTestId("table-from").fill("1980");
  await page.getByTestId("table-to").fill("1989");
  await page.getByTestId("table-apply-range").click();
  await expect(page.getByText("10 years")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("table-csv").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("statsbook-table-11.csv");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  const csv = Buffer.concat(chunks).toString("utf8");
  expect(csv.split("\n")[0]).toContain("Year");
  expect(csv).toContain("1985");
});

test("static Table 3 renders the 2024 income snapshot", async ({ page }) => {
  await page.goto("/statsbook/tables/3");
  await expect(page.getByTestId("static-table")).toBeVisible();
  await expect(page.getByTestId("static-table")).toContainText(/compensation/i);
});

test("statsbook works on a mobile viewport without horizontal page scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/statsbook");
  await expect(page.getByTestId("figure-grid")).toBeVisible();
  const bodyOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  expect(bodyOverflow).toBeLessThanOrEqual(1);

  // Wide tables scroll inside their own container, not the page.
  await page.goto("/statsbook/tables/11");
  const region = page.locator(".table-scroll");
  await expect(region).toHaveAttribute("tabindex", "0");
  const scrolls = await region.evaluate((el) => el.scrollWidth > el.clientWidth);
  expect(scrolls).toBe(true);
  const pageOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  expect(pageOverflow).toBeLessThanOrEqual(1);
});
