import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // Fail the build in CI if a test.only is accidentally left in
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    // JUnit output for Azure DevOps PublishTestResults task
    ['junit', { outputFile: 'playwright-results/results.xml' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // The dev API runs on https://localhost:5001 with a self-signed cert.
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Start the dev server automatically when not in CI
  // In CI the pipeline should start the server separately before running tests
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run serve',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
