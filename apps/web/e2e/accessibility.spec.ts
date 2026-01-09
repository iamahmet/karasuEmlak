import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have skip to content link', async ({ page }) => {
    await page.goto('/');
    
    // Check for skip link (might be visually hidden)
    const skipLink = page.getByRole('link', { name: /ana içeriğe geç/i });
    await expect(skipLink).toBeVisible({ timeout: 1000 });
  });

  test('should have main landmark', async ({ page }) => {
    await page.goto('/');
    
    const main = page.locator('main[role="main"]').or(page.locator('main#main-content'));
    await expect(main).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    
    // Check that h1 comes before h2
    const h1Index = await page.locator('h1').first().evaluate((el) => {
      const all = Array.from(document.querySelectorAll('h1, h2'));
      return all.indexOf(el);
    });
    
    const h2Index = await page.locator('h2').first().evaluate((el) => {
      const all = Array.from(document.querySelectorAll('h1, h2'));
      return all.indexOf(el);
    });
    
    if (h2Index !== -1) {
      expect(h1Index).toBeLessThan(h2Index);
    }
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/iletisim');
    
    // Check for form inputs with labels
    const inputs = page.locator('input[type="text"], input[type="email"], textarea');
    const count = await inputs.count();
    
    if (count > 0) {
      // At least one input should have an associated label
      const hasLabel = await inputs.first().evaluate((input) => {
        const id = input.getAttribute('id');
        if (id) {
          return !!document.querySelector(`label[for="${id}"]`);
        }
        return !!input.closest('label');
      });
      
      // This is a soft check - not all inputs need labels if they have aria-label
      expect(hasLabel || await inputs.first().getAttribute('aria-label')).toBeTruthy();
    }
  });

  test('should have proper alt text for images', async ({ page }) => {
    await page.goto('/');
    
    // Check main content images
    const images = page.locator('main img, article img');
    const count = await images.count();
    
    if (count > 0) {
      // Check first few images
      for (let i = 0; i < Math.min(count, 5); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');
        
        // Image should have alt text or be decorative (role="presentation")
        expect(alt !== null || role === 'presentation').toBeTruthy();
      }
    }
  });
});
