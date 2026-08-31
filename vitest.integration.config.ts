import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Integration tests hit a real Postgres database (DATABASE_URL_TEST).
 * The global setup pushes the schema and seeds it; tests then run serially
 * against that shared state.
 */
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    include: ["tests/integration/**/*.test.ts"],
    environment: "node",
    globalSetup: ["tests/integration/global-setup.ts"],
    setupFiles: ["tests/integration/setup-env.ts"],
    fileParallelism: false,
    testTimeout: 120_000,
    hookTimeout: 300_000,
  },
});
