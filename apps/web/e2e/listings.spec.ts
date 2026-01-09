import { test, expect } from '@playwright/test';

test.describe('Listings Pages', () => {
  test('should load satilik page', async ({ page }) => {
    await page.goto('/satilik');
    
    await expect(page).toHaveTitle(/Satılık/i);
    
    // Check for listings or empty state
    const content = page.locator('main').or(page.locator('[role="main"]'));
    await expect(content).toBeVisible();
  });

  test('should load kiralik page', async ({ page }) => {
    await page.goto('/kiralik');
    
    await expect(page).toHaveTitle(/Kiralık/i);
  });

  test('should filter listings', async ({ page }) => {
    await page.goto('/satilik');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Try to find and interact with filters
    const filterButton = page.getByRole('button', { name: /filtre/i }).first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Check if filter panel is visible
      const filterPanel = page.locator('[role="dialog"]').or(page.locator('aside'));
      await expect(filterPanel).toBeVisible({ timeout: 2000 });
    }
  });
});
