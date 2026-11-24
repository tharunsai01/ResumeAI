import { expect, type Page } from '@playwright/test';

export const DEMO_PASSWORD = 'HireSmart@2026';
export const ACCOUNTS = {
  candidate: 'alex.candidate@hiresmart.dev',
  recruiter: 'maya.recruiter@hiresmart.dev',
  admin: 'admin@hiresmart.dev',
};

export async function login(page: Page, email: string, password = DEMO_PASSWORD) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

/** A minimal valid PDF, used to exercise the upload flow. */
export function samplePdf(): Buffer {
  return Buffer.from(
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n' + ' '.repeat(200),
  );
}
