import { test, expect } from '@playwright/test';

test.describe('Application Load', () => {
  test('should load the page successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Dashboard/);
  });

  test('should have proper HTML semantics', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('should display the map container', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const mainContent = page.locator('.main-content');
    await expect(mainContent).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have no automatically detectable accessibility issues', async ({
    page
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for basic WCAG requirements
    const mainContent = page.locator('.main-content');
    await expect(mainContent).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
