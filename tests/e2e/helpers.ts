import { expect, type Page } from "@playwright/test";

export const PASSWORD = "drdash-demo";

export async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(PASSWORD);
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("nav-user")).toBeVisible();
}
