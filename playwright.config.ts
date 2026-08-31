import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

/**
 * E2E tests run against a production build (`pnpm build`) served by
 * `next start` on port 3100, using the main dev database (seeded via
 * `pnpm db:seed && pnpm sync`). The global setup verifies both and resets
 * the demo users' progress.
 */
const PRE_INSTALLED_CHROMIUM = "/opt/pw-browsers/chromium";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1, // specs share database state and run in order
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    ...(existsSync(PRE_INSTALLED_CHROMIUM)
      ? { launchOptions: { executablePath: PRE_INSTALLED_CHROMIUM } }
      : {}),
  },
  webServer: {
    command: "pnpm exec next start -p 3100",
    port: 3100,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
