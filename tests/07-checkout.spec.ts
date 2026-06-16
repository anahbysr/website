import { test, expect, type Locator, type Page } from '@playwright/test';

async function safeClick(page: Page, locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  await locator.click({ force: true });
}

test.describe('Checkout Flow', () => {
  test('Checkout form validation and submission', async ({ page }) => {
    // Add item to cart
    await page.goto('/shop');
    await safeClick(page, page.locator('main').locator('a[href^="/shop/"]').first());
    
    const sizeButtons = page.locator('button').filter({ hasText: /\d[-–]\d/i });
    await expect(sizeButtons.first()).toBeVisible({ timeout: 5000 });
    const firstAvailableSize = sizeButtons.filter({ hasNot: page.locator('[disabled]') }).first();
    await safeClick(page, firstAvailableSize);
    
    const addToBagBtn = page.locator('button').filter({ hasText: /Add to Bag/i });
    await expect(addToBagBtn).toBeEnabled({ timeout: 3000 });
    await safeClick(page, addToBagBtn);

    // Go to checkout
    await page.goto('/checkout');

    // Submit form without filling fields -> verify validation
    const payBtn = page.getByRole('button', { name: /Continue to Payment/i });
    await safeClick(page, payBtn);
    
    const isInvalid = await page.$eval('input[name="customerName"]', (el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();

    // Fill the form
    await page.fill('input[name="customerName"]', 'Test Customer');
    await page.fill('input[name="customerEmail"]', 'test@test.com');
    await page.fill('input[name="customerPhone"]', '9999999999');
    await page.fill('input[name="addressLine1"]', '123 Test Street');
    await page.fill('input[name="city"]', 'Hyderabad');
    await page.fill('input[name="state"]', 'Telangana');
    await page.fill('input[name="pincode"]', '500001');

    // Verify order summary shows at least one item
    await expect(page.locator('h2', { hasText: /Order Summary/i })).toBeVisible();
    await expect(page.locator('text=/Qty: 1/').first()).toBeVisible();
    await expect(page.locator('text=/Total/').first()).toBeVisible();

    // Submit form
    await safeClick(page, payBtn);

    // Verify redirect to payment page
    await page.waitForURL(/.*checkout\/payment.*/, { timeout: 15000 });

    await expect(page.getByRole('heading', { name: /Complete your order/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Pay with Razorpay|Processing/i })).toBeVisible();
  });
});
