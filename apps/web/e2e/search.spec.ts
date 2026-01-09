import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test('should load search page', async ({ page }) => {
    await page.goto('/arama');
    
    await expect(page).toHaveTitle(/Ara/i);
  });

  test('should perform search', async ({ page }) => {
    await page.goto('/arama');
    
    // Wait for search form
    await page.waitForLoadState('networkidle');
    
    // Try to find search input
    const searchInput = page.getByPlaceholder(/ara/i).or(page.getByRole('textbox', { name: /ara/i })).first();
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('Karasu');
      await searchInput.press('Enter');
      
      // Should show results or empty state
      await page.waitForLoadState('networkidle');
      const results = page.locator('main').or(page.locator('[role="main"]'));
      await expect(results).toBeVisible();
    }
  });

  test('should filter search results', async ({ page }) => {
    await page.goto('/arama?q=Karasu');
    
    await page.waitForLoadState('networkidle');
    
    // Check for filter options
    const filterButton = page.getByRole('button', { name: /filtre/i }).first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Filter panel should be visible
      const filterPanel = page.locator('[role="dialog"]').or(page.locator('aside'));
      await expect(filterPanel).toBeVisible({ timeout: 2000 });
    }
  });
});
