import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Karasu Emlak/i);
    
    // Check main heading
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display featured listings', async ({ page }) => {
    await page.goto('/');
    
    // Wait for listings to load
    const listings = page.locator('[data-testid="listing-card"]').or(page.locator('article'));
    await expect(listings.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check header navigation
    const nav = page.locator('nav').or(page.locator('header'));
    await expect(nav).toBeVisible();
    
    // Try clicking a navigation link
    const satilikLink = page.getByRole('link', { name: /satılık/i }).first();
    if (await satilikLink.isVisible()) {
      await satilikLink.click();
      await expect(page).toHaveURL(/satilik/i);
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check mobile menu (if exists)
    const mobileMenu = page.locator('[aria-label*="menu" i]').or(page.locator('button[aria-label*="menu" i]'));
    if (await mobileMenu.count() > 0) {
      await expect(mobileMenu.first()).toBeVisible();
    }
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Desktop navigation should be visible
    const desktopNav = page.locator('nav').or(page.locator('header'));
    await expect(desktopNav).toBeVisible();
  });

  test('should have working search form', async ({ page }) => {
    await page.goto('/');
    
    // Look for search form
    const searchInput = page.getByPlaceholder(/ara/i).or(page.getByRole('textbox', { name: /ara/i }));
    
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('Karasu');
      await searchInput.first().press('Enter');
      
      // Should navigate to search results
      await expect(page).toHaveURL(/arama/i, { timeout: 5000 });
    }
  });
});
