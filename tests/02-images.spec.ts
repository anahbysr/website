import { test, expect } from '@playwright/test';

test.describe('Images', () => {
  const routes = ['/', '/shop', '/collections', '/our-story', '/care-guide'];

  for (const route of routes) {
    test(`No broken images on ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'networkidle' });
      
      // Wait for network idle to ensure images try to load
      await page.waitForLoadState('networkidle');

      const brokenImages = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img'))
          .filter(img => img.complete && img.naturalWidth === 0 && img.src !== '')
          .map(img => img.src);
      });

      if (brokenImages.length > 0) {
        console.error(`Broken images on ${route}:`, brokenImages);
      }

      expect(brokenImages.length).toBe(0);
    });
  }
});
