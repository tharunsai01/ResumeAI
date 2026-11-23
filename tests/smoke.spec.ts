import { test, expect } from '@playwright/test';

test('Navigates to HireSmart AI landing page and verifies title & UI', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/HireSmart/i);
  const body = page.locator('body');
  await expect(body).toBeVisible();
});
