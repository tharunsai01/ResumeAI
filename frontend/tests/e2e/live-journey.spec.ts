/**
 * Full end-to-end journey against the real stack: frontend, Express API,
 * MongoDB and the AI service. Run with:
 *   docker compose up -d && docker compose exec backend node dist/seed/seed.js
 *   E2E_LIVE=1 BASE_URL=http://localhost:8080 npx playwright test tests/e2e/live-journey.spec.ts
 * Nothing here is mocked; every step writes real records.
 */
import { expect, test, type Page } from '@playwright/test';

const stamp = Date.now();
const recruiter = { name: 'E2E Recruiter', email: `e2e.recruiter.${stamp}@example.com`, password: 'E2e-Recruit3r!', company: 'E2E Test Co' };
const candidate = { name: 'E2E Candidate', email: `e2e.candidate.${stamp}@example.com`, password: 'E2e-Candid4te!' };
const admin = { email: process.env.ADMIN_EMAIL ?? 'admin@hiresmart.dev', password: process.env.ADMIN_PASSWORD ?? 'HireSmart@2026' };
const jobTitle = `E2E React Engineer ${stamp}`;

/** Build a small but valid text PDF so the AI service has something real to parse. */
function resumePdf(lines: string[]): Buffer {
  const esc = (s: string) => s.replace(/[\\()]/g, (c) => '\\' + c);
  const content = 'BT /F1 11 Tf 50 760 Td 14 TL ' + lines.map((l) => `(${esc(l)}) Tj T*`).join(' ') + ' ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((o, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` + offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
}

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

async function logout(page: Page, name: RegExp) {
  await page.getByRole('button', { name }).click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login$/);
}

test.describe.serial('Live journey: recruiter, candidate, AI service and admin', () => {
  test('1-2. recruiter registers and publishes a job', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('radio', { name: /I'm hiring/ }).click();
    await page.getByLabel('Full name').fill(recruiter.name);
    await page.getByLabel('Work email').fill(recruiter.email);
    await page.getByLabel('Company').fill(recruiter.company);
    await page.getByLabel('Password', { exact: true }).fill(recruiter.password);
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page).toHaveURL(/\/recruiter$/);

    await page.goto('/recruiter/jobs/new');
    await page.getByLabel('Job title').fill(jobTitle);
    await page.getByLabel('Description').fill('Requirements:\n- 2+ years of experience with React, TypeScript and Node.js\n- MongoDB\nNice to have:\n- Docker\nBachelor degree preferred.');
    await page.getByRole('button', { name: 'Suggest skills from description' }).click();
    await expect(page.getByRole('button', { name: 'Remove React' })).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Publish' }).click();
    await expect(page.getByText('Job published')).toBeVisible();
    await logout(page, /Account menu for E2E Recruiter/);
  });

  test('3-9. candidate registers, uploads a resume, reviews it, finds the job, sees the match and applies', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Full name').fill(candidate.name);
    await page.getByLabel('Work email').fill(candidate.email);
    await page.getByLabel('Password', { exact: true }).fill(candidate.password);
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page).toHaveURL(/\/candidate$/);

    await page.goto('/candidate/resumes');
    const pdf = resumePdf([
      'Jamie Example', 'Full-Stack Engineer', 'jamie@example.com',
      'Summary', 'Engineer building React and Node.js products.',
      'Experience', 'Software Engineer at Example Corp | Jan 2021 - Present', 'Built React and TypeScript dashboards with Node.js and MongoDB.',
      'Education', 'B.Tech in Computer Science, Example Institute of Technology, 2020',
      'Skills', 'React, TypeScript, Node.js, MongoDB, Docker, Git',
    ]);
    await page.locator('input[type="file"]').setInputFiles({ name: 'jamie.pdf', mimeType: 'application/pdf', buffer: pdf });
    await expect(page.getByRole('list', { name: 'Processing stages' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Analysis of jamie\.pdf/ })).toBeVisible({ timeout: 90_000 });
    await expect(page.getByText('React').first()).toBeVisible();
    await page.getByRole('button', { name: 'Copy to profile' }).click();
    await expect(page.getByText('Profile updated')).toBeVisible();

    await page.goto('/candidate/jobs');
    await page.getByRole('searchbox', { name: 'Search jobs' }).fill(String(stamp));
    await page.getByRole('heading', { name: jobTitle }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'See my match' }).click();
    await expect(page.getByText(/Checked against the official 50\/20\/10\/20 formula/)).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole('progressbar', { name: 'Skills score' })).toBeVisible();
    await page.getByRole('button', { name: 'Apply now' }).click();
    await page.getByRole('button', { name: 'Send application' }).click();
    await expect(page.getByText('Application sent')).toBeVisible();
    await logout(page, /Account menu for E2E Candidate/);
  });

  test('10-13. recruiter views, screens, shortlists and schedules an interview', async ({ page }) => {
    await login(page, recruiter.email, recruiter.password);
    await page.goto('/recruiter/screening');
    await page.getByLabel('Job').selectOption({ label: `${jobTitle} (1)` });
    await expect(page.getByText(candidate.name)).toBeVisible();
    await page.getByRole('button', { name: 'Run screening' }).click();
    await expect(page.getByText('Screening complete')).toBeVisible({ timeout: 60_000 });
    await page.getByRole('button', { name: 'Shortlist' }).first().click();
    await page.getByRole('dialog').getByRole('button', { name: 'Shortlist' }).click();
    await expect(page.getByText(`${candidate.name} shortlisted`)).toBeVisible();

    await page.goto('/recruiter/interviews');
    await page.getByRole('button', { name: 'Schedule', exact: true }).click();
    await page.getByLabel('Meeting link').fill('https://meet.example.com/e2e');
    await page.getByRole('button', { name: 'Schedule interview' }).click();
    await expect(page.getByText('Interview scheduled')).toBeVisible();
    await logout(page, /Account menu for E2E Recruiter/);
  });

  test('14. candidate receives the interview notification', async ({ page }) => {
    await login(page, candidate.email, candidate.password);
    await page.goto('/notifications');
    await expect(page.getByText('Interview scheduled').first()).toBeVisible();
    await page.goto('/candidate/applications');
    await expect(page.getByText('Interview', { exact: true }).first()).toBeVisible();
  });

  test('15. administrator reviews platform activity', async ({ page }) => {
    await login(page, admin.email, admin.password);
    await expect(page.getByRole('heading', { name: 'Platform overview' })).toBeVisible();
    await page.goto('/admin/audit');
    await page.getByLabel('Search audit log').fill('interview.scheduled');
    await expect(page.getByText('interview.scheduled').first()).toBeVisible();
  });
});
