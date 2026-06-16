import { test, expect } from '@playwright/test';

test.describe('Visual & Branding', () => {
  test('Homepage renders correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Anah/i);
    await expect(page.locator('h1')).toContainText(/Promise/i);
    await expect(page.getByText(/Free shipping above/i)).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/home-full.png', fullPage: true });
  });

  test('Shop page renders correctly', async ({ page }) => {
    await page.goto('/shop');
    const productCards = page.locator('a[href^="/shop/"]');
    await expect(productCards.first()).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/shop-full.png', fullPage: true });
  });

  test('Collections page renders correctly', async ({ page }) => {
    await page.goto('/collections');
    const collectionCards = page.locator('[href*="/collections/"]');
    const count = await collectionCards.count();
    expect(count).toBeGreaterThanOrEqual(4);
    await page.screenshot({ path: 'test-results/screenshots/collections-full.png', fullPage: true });
  });

  test('Our Story page renders correctly', async ({ page }) => {
    await page.goto('/our-story');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/lorem|ipsum/i);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(500);
    await page.screenshot({ path: 'test-results/screenshots/our-story-full.png', fullPage: true });
  });

  test('Care Guide renders correctly', async ({ page }) => {
    await page.goto('/care-guide');
    const content = await page.content();
    expect(content.toLowerCase()).toContain('cotton');
    expect(content.toLowerCase()).toContain('embroidery');
    await page.screenshot({ path: 'test-results/screenshots/care-guide-full.png', fullPage: true });
  });

  test('Size Guide renders correctly', async ({ page }) => {
    await page.goto('/size-guide');
    await expect(page.locator('table')).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/size-guide-full.png', fullPage: true });
  });
});
