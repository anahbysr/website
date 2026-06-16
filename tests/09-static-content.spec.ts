import { test, expect } from '@playwright/test';

test.describe('Static Content Integrity', () => {
  test('Our Story content', async ({ page }) => {
    await page.goto('/our-story');
    const content = await page.content();
    const text = content.toLowerCase();

    const hasArtisan = text.includes('artisan') || text.includes('handcraft');
    const hasSustainable = text.includes('sustainable') || text.includes('natural');
    const hasPromise = text.includes('promise') || text.includes('anah');
    const hasCotton = text.includes('cotton') || text.includes('fabric');
    const hasSindhu = text.includes('sindhu') || text.includes('parent');

    expect(hasArtisan).toBeTruthy();
    expect(hasSustainable).toBeTruthy();
    expect(hasPromise).toBeTruthy();
    expect(hasCotton).toBeTruthy();
    expect(hasSindhu).toBeTruthy();
  });

  test('Care Guide content', async ({ page }) => {
    await page.goto('/care-guide');
    const content = await page.content();
    const text = content.toLowerCase();

    expect(text).toContain('muslin');
    expect(text).toContain('organza');
    expect(text).toContain('linen');
    expect(text).toContain('embroidery');
    expect(text).toContain('lace');
  });

  test('Homepage reviews section', async ({ page }) => {
    await page.goto('/');
    
    // Check for ★ or star rating element
    await expect(page.locator('text=/★/').first()).toBeVisible();

    // Verify at least 3 review cards
    // The review cards in our implementation have the text "Verified purchase" inside them
    const reviewCards = page.locator('text=/Verified purchase/i');
    const count = await reviewCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('Homepage Instagram section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=/@anahbysr/i').first()).toBeVisible();
  });

  test('Footer content', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer.locator('text=/© 2026/i').or(footer.locator('text=/Anah by SR/i')).first()).toBeVisible();
  });
});
