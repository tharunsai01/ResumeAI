import { expect, test } from '@playwright/test';
import { ACCOUNTS, login } from './helpers';

test.describe('Mobile layouts', () => {
  test('landing navigation collapses into an animated menu', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Features' })).toBeHidden();
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.locator('#mobile-menu').getByRole('link', { name: 'Features' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-menu')).toBeHidden();
  });

  test('dashboard uses a drawer for navigation and keeps the account menu reachable', async ({ page }) => {
    await login(page, ACCOUNTS.candidate);
    await expect(page.getByRole('button', { name: /Account menu for Alex Moreno/ })).toBeInViewport();
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('navigation', { name: 'Workspace' }).getByRole('link', { name: 'Resume hub' }).click();
    await expect(page).toHaveURL(/\/candidate\/resumes$/);
  });

  test('tables become stacked cards without horizontal scrolling', async ({ page }) => {
    await login(page, ACCOUNTS.admin);
    await page.goto('/admin/users');
    await expect(page.getByRole('listitem').filter({ hasText: 'Alex Moreno' })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
