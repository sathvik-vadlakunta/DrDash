import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("rejects a wrong password", async ({ page }) => {
  await page.goto("/login");
  await page.getByTestId("login-email").fill("student1@drdash.test");
  await page.getByTestId("login-password").fill("wrong-password");
  await page.getByTestId("login-submit").click();
  await expect(page.locator(".error-text")).toContainText(/incorrect/i);
});

test("logs a student in and out", async ({ page }) => {
  await login(page, "student1@drdash.test");
  await expect(page.getByTestId("nav-user")).toContainText("Sam Student");
  await page.getByTestId("logout").click();
  await expect(page).toHaveURL(/\/login/);
});

test("protected pages redirect to login", async ({ page }) => {
  await page.goto("/lessons");
  await expect(page).toHaveURL(/\/login/);
});
