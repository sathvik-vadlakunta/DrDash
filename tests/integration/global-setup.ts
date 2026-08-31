import { execSync } from "node:child_process";

/**
 * Push the Prisma schema to the test database and seed it. Runs once per
 * `pnpm test:integration` invocation.
 */
export default function globalSetup() {
  try {
    process.loadEnvFile(".env");
  } catch {
    // no .env — rely on the environment
  }
  const testUrl = process.env.DATABASE_URL_TEST;
  if (!testUrl) {
    throw new Error("DATABASE_URL_TEST must be set for integration tests");
  }
  const env = { ...process.env, DATABASE_URL: testUrl, FRED_OFFLINE: "1" };
  execSync("pnpm exec prisma db push --skip-generate --accept-data-loss", {
    env,
    stdio: "inherit",
  });
  execSync("pnpm exec tsx prisma/seed.ts", { env, stdio: "inherit" });
}
