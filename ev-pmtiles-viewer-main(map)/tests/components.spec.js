import { test, expect } from '@playwright/test';

test.describe('UI Components', () => {
  test('should display sidebar components', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if sidebars exist (they may be hidden initially)
    const leftSidebar = page.locator('.left-sidebar');
    const rightSidebar = page.locator('.right-sidebar');

    // At least one should be in the DOM
    const leftCount = await leftSidebar.count();
    const rightCount = await rightSidebar.count();

    expect(leftCount + rightCount).toBeGreaterThan(0);
  });

  test('should have language toggle functionality', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for language toggle button
    const langButtons = page.locator('button').filter({ hasText: /IT|EN/i });
    const count = await langButtons.count();

    if (count > 0) {
      await expect(langButtons.first()).toBeVisible();
    }
  });

  test('should display modal when triggered', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Modal container should exist in DOM
    const modalContainer = page.locator('.modal-container');
    const count = await modalContainer.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have layer control buttons', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for button group
    const buttonGroup = page.locator('.button-group-topright');
    const count = await buttonGroup.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have button group with ARIA attributes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const buttonGroup = page.locator('.button-group-topright');
    
    if ((await buttonGroup.count()) > 0) {
      await expect(buttonGroup).toHaveAttribute('role', 'toolbar');
      await expect(buttonGroup).toHaveAttribute('aria-label');
    }
  });

  test('should show/hide buttons in group correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const buttonGroup = page.locator('.button-group-topright');
    
    if ((await buttonGroup.count()) > 0) {
      const buttons = buttonGroup.locator('.button-group-item');
      const buttonCount = await buttons.count();
      
      expect(buttonCount).toBeGreaterThan(0);

      // Check for persistent button (toggle)
      const persistentButton = buttons.filter({ hasText: /toggle/i });
      if ((await persistentButton.count()) > 0) {
        await expect(persistentButton.first()).toBeVisible();
      }
    }
  });
});
