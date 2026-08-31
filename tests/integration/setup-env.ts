/**
 * Runs before any test file imports application code: point Prisma at the
 * integration-test database.
 */
try {
  process.loadEnvFile(".env");
} catch {
  // no .env — rely on the environment
}

const testUrl = process.env.DATABASE_URL_TEST;
if (!testUrl) {
  throw new Error("DATABASE_URL_TEST must be set for integration tests");
}
process.env.DATABASE_URL = testUrl;
process.env.FRED_OFFLINE = "1"; // integration tests never hit the network
