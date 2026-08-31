/**
 * Chart Tool QA: deep links decode into working charts (the shareable-link
 * grammar), transforms and dual-axis charts render, and recession shading
 * appears.
 */
import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test.beforeEach(async ({ page }) => {
  await login(page, "student1@drdash.test");
});

test("deep link renders headline vs core inflation with recession bands", async ({
  page,
}) => {
  await page.goto("/dashboard?s=CPIAUCSL:yoy,CPILFESL:yoy&rec=1");
  await expect(page.getByTestId("dash-chip-CPIAUCSL")).toBeVisible();
  await expect(page.getByTestId("dash-chip-CPILFESL")).toBeVisible();
  await expect(page.locator(".recharts-line-curve")).toHaveCount(2);
  await expect(page.locator(".recharts-reference-area").first()).toBeVisible();
});

test("building a chart updates the URL (the shareable link)", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByTestId("dash-add-GDP").click();
  await expect(page.getByTestId("dash-chip-GDP")).toBeVisible();
  await page.getByTestId("dash-transform-GDP").selectOption("PCT_OF");
  await expect(page.getByTestId("dash-denom-GDP")).toBeVisible();
  await expect(page).toHaveURL(/s=GDP%3Apctof%3AGDP|s=GDP:pctof:GDP/);

  await page.getByTestId("copy-link").click();
  await expect(page.getByTestId("copy-link")).toHaveText("Copied!");
});

test("dual-axis chart mixes an index with a dollar level", async ({ page }) => {
  await page.goto("/dashboard?s=NETEXP,DTWEXBGS");
  await expect(page.locator(".recharts-line-curve")).toHaveCount(2);
  // Two y-axes rendered (left + right).
  const axes = page.locator(".recharts-yAxis");
  await expect(axes).toHaveCount(2);
});

test("the ratio transform produces a sensible outlays share of GDP", async ({
  page,
}) => {
  await page.goto("/dashboard?s=FGEXPND:pctof:GDP&from=1960");
  await expect(page.getByTestId("dash-chip-FGEXPND")).toBeVisible();
  await expect(page.locator(".recharts-line-curve").first()).toBeVisible();
  // The y-axis for a ~15–45% series should show ticks in that range and
  // never four-digit values (which would mean the ratio math is off).
  await expect(
    page.locator(".recharts-yAxis .recharts-cartesian-axis-tick-value").first()
  ).toBeVisible();
  const numeric = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        ".recharts-yAxis .recharts-cartesian-axis-tick-value"
      )
    )
      .map((el) => Number((el.textContent ?? "").replace(/,/g, "")))
      .filter((n) => Number.isFinite(n))
  );
  expect(numeric.length).toBeGreaterThan(0);
  expect(Math.max(...numeric)).toBeLessThanOrEqual(60);
});
