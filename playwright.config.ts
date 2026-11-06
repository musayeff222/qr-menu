import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./qa/playwright",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  reporter: [
    ["list"],
    ["json", { outputFile: "qa/playwright/results.json" }],
    ["html", { open: "never", outputFolder: "qa/playwright/playwright-report" }],
  ],
  use: {
    baseURL: process.env.QA_BASE_URL || "http://127.0.0.1:3010",
    locale: "az-AZ",
    timezoneId: "Asia/Baku",
    trace: "off",
    video: "off",
    screenshot: "off",
    actionTimeout: 12_000,
  },
  webServer: {
    command: "npx tsx server.ts",
    url: "http://127.0.0.1:3010/api/public/settings",
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      ...process.env,
      PORT: "3010",
      ALLOW_SQLITE: "on",
      ALLOW_DEMO_SEED: "on",
      MYSQL_HOST: "",
      MYSQL_PASSWORD: "",
      MYSQL_USER: "",
      MYSQL_DATABASE: "",
      DATABASE_URL: "",
      DB_CLIENT: "",
    },
  },
  projects: [
    {
      name: "visual",
      testMatch: /visual\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], deviceScaleFactor: 1 },
    },
    {
      name: "distinct",
      testMatch: /distinct\.spec\.ts/,
      dependencies: ["visual"],
      use: { ...devices["Desktop Chrome"], deviceScaleFactor: 1 },
    },
    {
      name: "flows",
      testMatch: /(flow|theme|order|i18n|perf|contrast|onboarding|langs|password-hash)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], deviceScaleFactor: 1 },
    },
  ],
});
