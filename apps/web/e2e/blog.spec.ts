import { test, expect } from '@playwright/test';

test.describe('Blog Pages', () => {
  test('should load blog listing page', async ({ page }) => {
    await page.goto('/blog');
    
    await expect(page).toHaveTitle(/Blog/i);
    
    // Check for blog articles or empty state
    const content = page.locator('main').or(page.locator('[role="main"]'));
    await expect(content).toBeVisible();
  });

  test('should navigate to blog detail page', async ({ page }) => {
    await page.goto('/blog');
    
    // Wait for articles to load
    await page.waitForLoadState('networkidle');
    
    // Try to click first article link
    const firstArticle = page.locator('article').or(page.locator('[data-testid="article-card"]')).first();
    
    if (await firstArticle.count() > 0) {
      const articleLink = firstArticle.locator('a').first();
      if (await articleLink.isVisible()) {
        await articleLink.click();
        
        // Should navigate to article detail
        await expect(page).toHaveURL(/\/blog\//, { timeout: 5000 });
        
        // Check article content
        const articleContent = page.locator('article').or(page.locator('[role="article"]'));
        await expect(articleContent).toBeVisible();
      }
    }
  });

  test('should display article metadata', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    const firstArticle = page.locator('article').first();
    if (await firstArticle.count() > 0) {
      // Check for author, date, reading time
      const metadata = firstArticle.locator('time, [data-testid="author"], [data-testid="reading-time"]');
      if (await metadata.count() > 0) {
        await expect(metadata.first()).toBeVisible();
      }
    }
  });
});
