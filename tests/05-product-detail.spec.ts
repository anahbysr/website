import { test, expect } from '@playwright/test';

test.describe('Product Detail', () => {
  test('Product detail page works', async ({ page }) => {
    // Navigate to the first LIVE product
    await page.goto('/shop');
    const firstProduct = page.locator('main').locator('a[href^="/shop/"]').first();
    const href = await firstProduct.getAttribute('href');
    await firstProduct.click();
    await page.waitForURL(new RegExp(href as string));

    // Verify heading exists
    await expect(page.locator('h1')).toBeVisible();

    // Verify price contains ₹
    await expect(page.locator('text=/₹/').first()).toBeVisible();

    // Verify "Add to Bag" or "Select a Size" button is present
    const addBtn = page.getByRole('button', { name: /Add to Bag|Select a Size/i });
    await expect(addBtn).toBeVisible();

    // Add to Bag should not navigate if size is not selected (should be disabled)
    await expect(addBtn).toBeDisabled();

    // Wait for size buttons to appear
    const sizeButtons = page.locator('button').filter({ hasText: /\d[-–]\d/i });
    await expect(sizeButtons.first()).toBeVisible({ timeout: 5000 });

    // Click the first ENABLED size button (not disabled/out-of-stock)
    const enabledSize = sizeButtons.filter({ hasNot: page.locator('[disabled]') }).first();
    await enabledSize.scrollIntoViewIfNeeded();
    await enabledSize.click({ force: true });

    // Now Add to Bag should be enabled — click it
    const addToBag = page.locator('button').filter({ hasText: /add to bag/i });
    await expect(addToBag).toBeEnabled({ timeout: 3000 });
    await addToBag.click();

    // Verify cart badge updates
    await expect(page.locator('span', { hasText: '1' }).first()).toBeVisible();

    await page.screenshot({ path: 'test-results/screenshots/product-detail-full.png', fullPage: true });
  });
});
