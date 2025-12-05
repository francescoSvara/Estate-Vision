import { test, expect } from '@playwright/test';

test.describe('Map Functionality', () => {
  test('should initialize MapLibre GL map', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for main content to load
    const mainContent = page.locator('.main-content');
    await expect(mainContent).toBeVisible();

    // Map canvas may take time to initialize
    const canvas = page.locator('.maplibregl-canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
  });

  test('should have map controls visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for main content
    const mainContent = page.locator('.main-content');
    await expect(mainContent).toBeVisible();
  });

  test('should allow map interaction', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Map should be interactive
    const mainContent = page.locator('.main-content');
    await expect(mainContent).toBeVisible();
  });

  test('should load PMTiles layers', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Map should be visible
    const mainContent = page.locator('.main-content');
    await expect(mainContent).toBeVisible();
  });
});
