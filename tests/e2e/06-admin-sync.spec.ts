/**
 * Admin sync status page QA: every catalog series shows populated data, and
 * the page is staff-only.
 */
import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("students cannot open the admin sync page", async ({ page }) => {
  await login(page, "student1@drdash.test");
  await page.goto("/admin/sync");
  await expect(page).not.toHaveURL(/\/admin/);
});

test("instructor sees every series populated on the sync status page", async ({
  page,
}) => {
  await login(page, "instructor@drdash.test");
  await page.goto("/admin/sync");
  await expect(page.getByTestId("sync-missing")).toHaveText("All series have data.");
  const table = page.getByTestId("sync-table");
  await expect(table).toBeVisible();
  // The new task-board series are present with observations.
  for (const id of ["AAA", "TERMCBCCALLNS", "FYFSD", "NETFI", "RBUSBIS", "DD_WAGE_PRICE_GAP", "DD_MONEY_VEL"]) {
    const row = table.locator("tr", { has: page.locator("td", { hasText: new RegExp(`^${id}$`) }) });
    await expect(row).toBeVisible();
    await expect(row.locator("td").nth(4)).not.toHaveText("0");
  }
});
