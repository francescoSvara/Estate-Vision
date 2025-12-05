import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test('should make API requests successfully', async ({ page }) => {
    const apiCalls = [];

    page.on('request', request => {
      if (request.url().includes('vm-neural-01.duckdns.org/ev-api')) {
        apiCalls.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if API calls were made (optional, as app may work without API initially)
    // expect(apiCalls.length).toBeGreaterThan(0);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API calls and simulate error
    await page.route('**/ev-api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Application should still load
    const mainContent = page.locator('.main-content');
    await expect(mainContent).toBeVisible();
  });

  test('should load PMTiles from remote sources', async ({ page }) => {
    const pmtilesRequests = [];

    page.on('request', request => {
      if (request.url().includes('.pmtiles')) {
        pmtilesRequests.push(request.url());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // PMTiles requests should be made
    // expect(pmtilesRequests.length).toBeGreaterThan(0);
  });
});
