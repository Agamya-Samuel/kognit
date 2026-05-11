import { test, expect } from '@playwright/test';

/**
 * Smoke test — verifies Playwright is correctly configured for web-admin.
 * Uses a public URL to validate the E2E setup without requiring a local dev server.
 */
test.describe('Playwright E2E Smoke Test', () => {
  test('Playwright can launch a browser and navigate', async ({ page }) => {
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example Domain/);
  });

  test('Playwright can interact with page elements', async ({ page }) => {
    await page.goto('https://example.com');
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Example Domain');
  });
});
