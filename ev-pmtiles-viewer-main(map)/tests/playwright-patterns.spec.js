import { test, expect } from '@playwright/test';

/**
 * Playwright Best Practices Reference
 * This file serves as a quick reference for common Playwright patterns
 */

// Test Structure
test.describe('Feature Name', () => {
  test('should perform action', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.selector', { timeout: 10000 });
    const element = page.locator('.selector');
    await expect(element).toBeVisible();
  });
});

// Wait Strategies
test('wait strategies', async ({ page }) => {
  await page.waitForLoadState('networkidle'); // Wait for network
  await page.waitForSelector('.class'); // Wait for element
  await page.waitForTimeout(500); // Fixed wait (avoid when possible)
});

// Locators (Preferred Order)
test('locator patterns', async ({ page }) => {
  page.getByRole('button', { name: 'Submit' }); // Accessibility-first
  page.getByText('Text content'); // By text
  page.getByLabel('Label text'); // By label
  page.locator('.class'); // CSS selector (last resort)
});

// Assertions
test('assertion patterns', async ({ page }) => {
  const element = page.locator('.element');
  await expect(element).toBeVisible();
  await expect(element).toHaveText('text');
  await expect(element).toHaveAttribute('attr', 'value');
  await expect(page).toHaveTitle(/pattern/);
  await expect(element).toHaveCount(3);
});

// API Mocking
test('api mocking', async ({ page }) => {
  await page.route('**/api/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: 'mock' })
    });
  });
});

// Network Monitoring
test('network monitoring', async ({ page }) => {
  page.on('request', request => {
    /* track requests */
  });
  page.on('response', response => {
    /* validate responses */
  });
  page.on('requestfailed', request => {
    /* handle failures */
  });
});

// Conditional Tests
test.skip(({ browserName }) => browserName !== 'chromium', 'Chromium only');
test.skip(
  ({ baseURL }) => !baseURL || !baseURL.includes('prod'),
  'Production only'
);

// Debugging
test('debugging utilities', async ({ page }) => {
  await page.pause(); // Pause execution (debug mode)
  await page.screenshot({ path: 'debug.png' });
  await page.locator('.element').screenshot({ path: 'element.png' });
});
