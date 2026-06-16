import { test, expect, type Locator, type Page } from '@playwright/test';

async function safeClick(page: Page, locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  await locator.click({ force: true });
}

test.describe('Cart functionality', () => {
  test('Cart drawer operates correctly', async ({ page }) => {
    // Navigate to shop and click first product
    await page.goto('/shop');
    await safeClick(page, page.locator('main').locator('a[href^="/shop/"]').first());
    
    // Select first available size and add to bag
    const sizeButtons = page.locator('button').filter({ hasText: /\d[-–]\d/i });
    await expect(sizeButtons.first()).toBeVisible({ timeout: 5000 });
    const firstAvailableSize = sizeButtons.filter({ hasNot: page.locator('[disabled]') }).first();
    await safeClick(page, firstAvailableSize);
    
    const addToBagBtn = page.locator('button').filter({ hasText: /Add to Bag/i });
    await expect(addToBagBtn).toBeEnabled({ timeout: 3000 });
    await safeClick(page, addToBagBtn);

    // Verify drawer opens by checking if "Your Bag" is visible
    await expect(page.locator('h2', { hasText: /Your Bag/i })).toBeVisible();

    // Verify price contains ₹
    await expect(page.locator('text=/₹/').first()).toBeVisible();

    // Verify quantity controls are present (Plus/Minus buttons)
    await expect(page.locator('button').filter({ hasText: '+' }).first().or(page.locator('svg.lucide-plus').first())).toBeVisible();

    // Close the drawer
    await safeClick(page, page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first());

    // Verify drawer closes (Your Bag text hidden)
    await expect(page.locator('h2', { hasText: /Your Bag/i })).toBeHidden();

    // Reload page
    await page.reload();

    // Verify cart badge still shows 1
    await expect(page.locator('span', { hasText: '1' }).first()).toBeVisible();

    // Reopen drawer
    await safeClick(page, page.locator('button', { has: page.locator('svg.lucide-shopping-bag') }).first());

    // Go to checkout
    await safeClick(page, page.getByRole('link', { name: /Checkout/i }));
    await expect(page).toHaveURL(/\/checkout/);
  });
});
