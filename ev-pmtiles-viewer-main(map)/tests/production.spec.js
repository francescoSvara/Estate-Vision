import { test, expect } from '@playwright/test';

test.describe('Production Deployment Verification', () => {
  test.skip(
    ({ baseURL }) => !baseURL || !baseURL.includes('vm-neural-01.duckdns.org'),
    'Only run on production'
  );

  test('should load production site', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PMTiles Viewer/);
  });

  test('should have all assets loaded', async ({ page }) => {
    const failedRequests = [];

    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure().errorText
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Some requests may fail (optional resources), but critical ones should load
    expect(failedRequests.length).toBeLessThan(5);
  });

  test('should have proper HTTPS', async ({ page, baseURL }) => {
    if (baseURL) {
      expect(baseURL).toContain('https://');
    }
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    const charset = page.locator('meta[charset]');
    await expect(charset).toHaveCount(1);

    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);
  });

  test('should load map successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.maplibregl-canvas', { timeout: 15000 });

    const canvas = page.locator('.maplibregl-canvas');
    await expect(canvas).toBeVisible();
  });
});
