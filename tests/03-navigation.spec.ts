import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Main navigation links work', async ({ page }) => {
    // Click Shop
    await page.evaluate(el => (el as HTMLElement).click(), await page.getByRole('navigation').getByRole('link', { name: 'Shop' }).elementHandle());
    await expect(page).toHaveURL(/\/shop/);

    // Go back and click Collections
    await page.goto('/');
    await page.evaluate(el => (el as HTMLElement).click(), await page.getByRole('navigation').getByRole('link', { name: 'Collections' }).elementHandle());
    await expect(page).toHaveURL(/\/collections/);

    // Go back and click Our Story
    await page.goto('/');
    await page.evaluate(el => (el as HTMLElement).click(), await page.getByRole('navigation').getByRole('link', { name: 'Our Story' }).elementHandle());
    await expect(page).toHaveURL(/\/our-story/);

    // Go back and click Care Guide
    await page.goto('/');
    await page.evaluate(el => (el as HTMLElement).click(), await page.getByRole('navigation').getByRole('link', { name: 'Care Guide' }).elementHandle());
    await expect(page).toHaveURL(/\/care-guide/);
  });

  test('Logo links to homepage', async ({ page }) => {
    await page.goto('/shop');
    await page.evaluate(el => (el as HTMLElement).click(), await page.getByRole('link', { name: /anah.*by Sindhura Reddy/i }).first().elementHandle());
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('Footer links are present', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', { name: /Size Guide/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /Care Guide/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /Shipping Policy/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /Returns & Exchange/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /Track Order/i })).toBeVisible();
  });
});
