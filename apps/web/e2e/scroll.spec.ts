import { test, expect } from '@playwright/test';

/**
 * Scroll Functionality Tests
 * 
 * Ensures scroll works on all pages (critical UX bug fix)
 */
test.describe('Scroll Functionality', () => {
  test('homepage should be scrollable', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if page is scrollable
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const innerHeight = await page.evaluate(() => window.innerHeight);
    
    expect(scrollHeight).toBeGreaterThan(innerHeight);
    
    // Try to scroll
    await page.evaluate(() => window.scrollTo(0, 500));
    const scrollTop = await page.evaluate(() => window.pageYOffset || document.documentElement.scrollTop);
    
    expect(scrollTop).toBeGreaterThan(0);
  });

  test('kiralik page should be scrollable', async ({ page }) => {
    await page.goto('/kiralik');
    await page.waitForLoadState('networkidle');
    
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const innerHeight = await page.evaluate(() => window.innerHeight);
    
    if (scrollHeight > innerHeight) {
      await page.evaluate(() => window.scrollTo(0, 500));
      const scrollTop = await page.evaluate(() => window.pageYOffset || document.documentElement.scrollTop);
      expect(scrollTop).toBeGreaterThan(0);
    }
  });

  test('satilik page should be scrollable', async ({ page }) => {
    await page.goto('/satilik');
    await page.waitForLoadState('networkidle');
    
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const innerHeight = await page.evaluate(() => window.innerHeight);
    
    if (scrollHeight > innerHeight) {
      await page.evaluate(() => window.scrollTo(0, 500));
      const scrollTop = await page.evaluate(() => window.pageYOffset || document.documentElement.scrollTop);
      expect(scrollTop).toBeGreaterThan(0);
    }
  });

  test('sapanca page should be scrollable', async ({ page }) => {
    await page.goto('/sapanca');
    await page.waitForLoadState('networkidle');
    
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const innerHeight = await page.evaluate(() => window.innerHeight);
    
    if (scrollHeight > innerHeight) {
      await page.evaluate(() => window.scrollTo(0, 500));
      const scrollTop = await page.evaluate(() => window.pageYOffset || document.documentElement.scrollTop);
      expect(scrollTop).toBeGreaterThan(0);
    }
  });

  test('body should not have overflow-hidden class', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const bodyClasses = await page.evaluate(() => document.body.className);
    expect(bodyClasses).not.toContain('overflow-hidden');
    expect(bodyClasses).not.toContain('no-scroll');
    expect(bodyClasses).not.toContain('scroll-locked');
  });

  test('html should not have overflow-hidden style', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const htmlOverflow = await page.evaluate(() => {
      const html = document.documentElement;
      return window.getComputedStyle(html).overflow;
    });
    
    expect(htmlOverflow).not.toBe('hidden');
  });
});
