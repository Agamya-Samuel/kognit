import { test, expect } from '@playwright/test';

/**
 * Smoke tests — verify Playwright is correctly configured for web-instructor.
 *
 * The first group uses a public URL and always runs (validates the E2E setup).
 * The second group requires the dev server (set WEB_SERVER=true) and tests
 * actual app flows: login page, auth redirect, and dashboard navigation.
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

/**
 * App-specific smoke tests — require the dev server running.
 * Enable with WEB_SERVER=true or start the dev server manually.
 */
test.describe('web-instructor app smoke tests', () => {
  test.skip(
    () => !process.env.WEB_SERVER && !process.env.CI,
    'Requires dev server — set WEB_SERVER=true to enable',
  );

  test('login page loads and renders email input', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/\/auth\/login/);
    // The login form should have an email field
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10_000 });
  });

  test('unauthenticated dashboard access redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to login page when not authenticated
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 });
  });

  test('login page has navigation to forgot-password', async ({ page }) => {
    await page.goto('/auth/login');
    const forgotLink = page.locator('a[href*="forgot-password"]');
    await expect(forgotLink).toBeVisible({ timeout: 10_000 });
  });
});
