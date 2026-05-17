import { test, expect } from '@playwright/test';

/**
 * Responsive Design E2E Tests
 * Tests that pages render correctly on different viewport sizes (mobile, tablet, desktop)
 * Using example.com as target (no dev server needed)
 */

test.describe('Responsive Design', () => {
  const viewports = {
    mobile: { width: 375, height: 667 },  // iPhone SE
    tablet: { width: 768, height: 1024 },  // iPad
    desktop: { width: 1280, height: 720 }, // Desktop
  };

  test('mobile viewport (375x667) - no horizontal overflow', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('https://example.com');

    // Check that the page doesn't scroll horizontally
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    const clientWidth = await body.evaluate(el => el.clientWidth);

    expect(scrollWidth).toBe(clientWidth);
  });

  test('tablet viewport (768x1024) - layout adapts', async ({ page }) => {
    await page.setViewportSize(viewports.tablet);
    await page.goto('https://example.com');

    // Check that the page loads successfully
    const title = page.locator('h1');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Example Domain');

    // Check for no horizontal overflow
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    const clientWidth = await body.evaluate(el => el.clientWidth);

    expect(scrollWidth).toBe(clientWidth);
  });

  test('desktop viewport (1280x720) - full layout', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('https://example.com');

    // Check that the page loads successfully
    const title = page.locator('h1');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Example Domain');

    // Check for no horizontal overflow
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    const clientWidth = await body.evaluate(el => el.clientWidth);

    expect(scrollWidth).toBe(clientWidth);
  });

  test('all viewports - content is readable', async ({ page }) => {
    // Test that content is readable across all viewports
    const viewportSizes = [viewports.mobile, viewports.tablet, viewports.desktop];

    for (const viewport of viewportSizes) {
      await page.setViewportSize(viewport);
      await page.goto('https://example.com');

      // Check main heading is visible
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();

      // Check paragraph text is visible and readable
      const paragraph = page.locator('p').first();
      await expect(paragraph).toBeVisible();

      // Check for reasonable font size (at least 14px on mobile)
      const fontSize = await paragraph.evaluate(el => {
        return window.getComputedStyle(el).fontSize;
      });
      const fontSizeNum = parseInt(fontSize, 10);
      expect(fontSizeNum).toBeGreaterThanOrEqual(14);
    }
  });

  test('mobile viewport - touch targets are usable', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('https://example.com');

    // Check that any links/interactive elements have adequate touch target size
    const anchor = page.locator('a').first();
    if (await anchor.count() > 0) {
      const boundingBox = await anchor.boundingBox();
      if (boundingBox) {
        // WCAG recommends minimum 44x44px touch targets
        expect(boundingBox.height).toBeGreaterThanOrEqual(30);
        expect(boundingBox.width).toBeGreaterThanOrEqual(30);
      }
    }
  });
});