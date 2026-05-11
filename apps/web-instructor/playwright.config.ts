import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for web-instructor E2E tests.
 * @see https://playwright.dev/docs/test-configuration
 *
 * Smoke tests use external URLs and don't require the dev server.
 * Set WEB_SERVER=true to enable the dev server for full E2E tests.
 */
export default defineConfig({
  testDir: './src/test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 14'] },
    },
  ],

  ...(process.env.WEB_SERVER
    ? {
        webServer: {
          command: 'npm run dev -- --port 3001',
          url: 'http://localhost:3001',
          reuseExistingServer: !process.env.CI,
          timeout: 120000,
        },
      }
    : {}),
});
