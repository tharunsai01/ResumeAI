import { expect, test } from '@playwright/test';
import { ACCOUNTS, login } from './helpers';

test.describe('Landing page', () => {
  test('shows the hero, sections and working navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Smarter hiring starts with better matching.' })).toBeVisible();
    for (const id of ['features', 'how-it-works', 'product', 'about']) await expect(page.locator(`#${id}`)).toBeAttached();
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'How it works' }).click();
    await expect(page.locator('#how-it-works')).toBeInViewport();
    await page.getByRole('link', { name: 'Get started free' }).click();
    await expect(page).toHaveURL(/\/register$/);
  });

  test('labels hero numbers as sample data and shows the formula', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Sample data').first()).toBeVisible();
    await expect(page.getByText('Skills × 0.50')).toBeAttached();
    await expect(page.getByText('80 to 100')).toBeAttached();
  });

  test('renders the final hero state immediately with reduced motion', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.getByText('Strong match', { exact: true }).first()).toBeVisible();
    await ctx.close();
  });

  test('theme switch applies and persists across reloads', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Change theme/ }).click();
    await page.getByRole('menuitem', { name: 'Light' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.getByRole('button', { name: /Change theme/ }).click();
    await page.getByRole('menuitem', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('footer pages load and unknown routes show a 404 page', async ({ page }) => {
    for (const [path, heading] of [['/docs', 'Documentation'], ['/privacy', 'Privacy'], ['/terms', 'Terms of use'], ['/contact', 'Contact']]) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    }
    await page.goto('/definitely-not-here');
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  });

  test('skip link appears on focus and jumps to main content', async ({ page }) => {
    await page.goto('/');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await skip.focus();
    await expect(skip).toBeInViewport();
    await skip.click();
    await expect(page).toHaveURL(/#main$/);
  });
});

test.describe('Authentication', () => {
  test('validates the login form and rejects bad credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page.getByText('Enter a valid email address')).toBeVisible();
    await page.getByLabel('Email').fill(ACCOUNTS.candidate);
    await page.getByLabel('Password', { exact: true }).fill('wrong-password');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Invalid email or password' })).toBeVisible();
  });

  test('password visibility toggle works', async ({ page }) => {
    await page.goto('/login');
    const pw = page.getByLabel('Password', { exact: true });
    await pw.fill('secret');
    await expect(pw).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Show password' }).click();
    await expect(pw).toHaveAttribute('type', 'text');
  });

  test('social sign-in buttons are disabled when not configured', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /Google sign-in is not configured/ })).toBeDisabled();
    await expect(page.getByRole('button', { name: /LinkedIn sign-in is not configured/ })).toBeDisabled();
  });

  test('protected routes redirect to login and back to the role home', async ({ page }) => {
    await page.goto('/recruiter/jobs');
    await expect(page).toHaveURL(/\/login$/);
    await login(page, ACCOUNTS.candidate);
    await expect(page).toHaveURL(/\/candidate$/);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/candidate$/); // wrong role is sent home
  });

  test('registration shows company for recruiters, rates passwords and starts with an empty profile', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('radio', { name: /I'm hiring/ }).click();
    await expect(page.getByLabel('Company')).toBeVisible();
    await page.getByRole('radio', { name: /I'm looking for work/ }).click();
    await expect(page.getByLabel('Company')).toBeHidden();
    await page.getByLabel('Full name').fill('Test Person');
    await page.getByLabel('Work email').fill(`test.${Date.now()}@example.com`);
    await page.getByLabel('Password', { exact: true }).fill('abc');
    await expect(page.getByText('Too short')).toBeVisible();
    await page.getByLabel('Password', { exact: true }).fill('Str0ngPassw0rd!');
    await expect(page.getByText('Very strong')).toBeVisible();
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('Accept the terms to continue')).toBeVisible();
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page).toHaveURL(/\/candidate$/);
    await page.goto('/candidate/profile');
    await expect(page.getByText('Add a headline so recruiters know what you do')).toBeVisible();
    await expect(page.getByText('No skills added yet.')).toBeVisible();
  });

  test('logout ends the session', async ({ page }) => {
    await login(page, ACCOUNTS.recruiter);
    await page.getByRole('button', { name: /Account menu for Maya Lindqvist/ }).click();
    await page.getByRole('menuitem', { name: 'Log out' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto('/recruiter');
    await expect(page).toHaveURL(/\/login$/);
  });
});
