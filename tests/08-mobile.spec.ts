import { test, expect, type Locator, type Page } from '@playwright/test';

async function safeClick(page: Page, locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  await locator.click({ force: true });
}

test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14

test.describe('Mobile Layout', () => {
  test('Mobile homepage renders correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/screenshots/mobile-homepage.png', fullPage: true });

    // Verify nav does NOT show full link text at mobile width (hamburger menu present)
    const hamburgerBtn = page.locator('button').filter({ has: page.locator('svg.lucide-menu') });
    await expect(hamburgerBtn).toBeVisible();
    
    // The desktop links should be hidden
    const desktopShopLink = page.locator('nav.hidden').getByRole('link', { name: 'Shop' });
    await expect(desktopShopLink).toBeHidden();
  });

  test('Mobile shop renders correctly', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/screenshots/mobile-shop.png', fullPage: true });
  });

  test('Mobile cart drawer opens full width', async ({ page }) => {
    await page.goto('/shop');
    await safeClick(page, page.locator('main').locator('a[href^="/shop/"]').first());
    
    const sizeButtons = page.locator('button').filter({ hasText: /\d[-–]\d/i });
    await expect(sizeButtons.first()).toBeVisible({ timeout: 5000 });
    const firstAvailableSize = sizeButtons.filter({ hasNot: page.locator('[disabled]') }).first();
    await safeClick(page, firstAvailableSize);
    
    const addToBagBtn = page.locator('button').filter({ hasText: /Add to Bag/i });
    await expect(addToBagBtn).toBeEnabled({ timeout: 3000 });
    await safeClick(page, addToBagBtn);

    await expect(page.locator('h2', { hasText: /Your Bag/i })).toBeVisible();
    
    // Check if drawer is full width (roughly equal to viewport width)
    const drawer = page.locator('.max-w-md');
    const box = await drawer.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(390 - 10); // allow slight variance
  });

  test('Mobile checkout renders correctly', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/screenshots/mobile-checkout.png', fullPage: true });
  });
});
