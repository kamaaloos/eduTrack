import { defineConfig, devices } from "@playwright/test";
import { loadE2eEnv } from "./e2e/loadEnv";

function resolveE2eBaseUrl(): string | undefined {
  const raw = process.env.E2E_BASE_URL?.trim();
  if (!raw) return undefined;
  try {
    // Origin only — a path like /landing breaks routes such as /select-school.
    return new URL(raw).origin;
  } catch {
    console.warn(`Ignoring invalid E2E_BASE_URL: ${raw}`);
    return undefined;
  }
}

loadE2eEnv();

const customBaseUrl = resolveE2eBaseUrl();
const baseURL = customBaseUrl ?? "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: customBaseUrl
    ? undefined
    : {
        command: "npx serve dist -l 4173",
        port: 4173,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
