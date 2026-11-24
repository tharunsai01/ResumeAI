import { expect, test } from '@playwright/test';
import { ACCOUNTS, login, samplePdf } from './helpers';

test.describe('Candidate portal', () => {
  test.beforeEach(async ({ page }) => login(page, ACCOUNTS.candidate));

  test('dashboard shows live stats, recommendations and the demo banner', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: /Alex/ })).toBeVisible();
    await expect(page.getByText('Total applications')).toBeVisible();
    await expect(page.getByText('Recommended for you')).toBeVisible();
    await expect(page.getByText(/^Demo data/)).toBeVisible();
  });

  test('search, filter, open a job and apply', async ({ page }) => {
    await page.goto('/candidate/jobs');
    await page.getByRole('searchbox', { name: 'Search jobs' }).fill('kubernetes');
    await expect(page.getByRole('heading', { name: 'Platform Engineer (Kubernetes)' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Frontend Engineer' })).toBeHidden();
    await page.getByRole('heading', { name: 'Platform Engineer (Kubernetes)' }).click();
    const drawer = page.getByRole('dialog');
    await expect(drawer.getByText('Required skills')).toBeVisible();
    await drawer.getByRole('button', { name: 'Apply now' }).click();
    await page.getByLabel('Cover letter (optional)').fill('I run Kubernetes in production.');
    await page.getByRole('button', { name: 'Send application' }).click();
    await expect(page.getByText('Application sent')).toBeVisible();
  });

  test('bookmarking a job adds it to saved jobs', async ({ page }) => {
    await page.goto('/candidate/jobs');
    await page.getByRole('button', { name: 'Save job' }).first().click();
    await expect(page.getByText('Saved to your jobs')).toBeVisible();
    await page.goto('/candidate/saved');
    await expect(page.getByRole('button', { name: 'Remove from saved jobs' }).first()).toBeVisible();
  });

  test('match report explains the score with four weighted components', async ({ page }) => {
    await page.goto('/candidate/matches');
    await page.getByRole('button', { name: 'Score open jobs' }).first().click();
    await expect(page.getByText('Matches updated')).toBeVisible();
    await page.getByRole('heading', { name: 'Senior Full-Stack Engineer' }).click();
    for (const label of ['Skills score', 'Experience score', 'Education score', 'Role fit score']) await expect(page.getByRole('progressbar', { name: label })).toBeVisible();
    await expect(page.getByText(/Checked against the official 50\/20\/10\/20 formula/)).toBeVisible();
  });

  test('resume upload shows each processing stage and the analysis', async ({ page }) => {
    await page.goto('/candidate/resumes');
    await page.locator('input[type="file"]').setInputFiles({ name: 'new-resume.pdf', mimeType: 'application/pdf', buffer: samplePdf() });
    await expect(page.getByRole('list', { name: 'Processing stages' })).toBeVisible();
    await expect(page.getByText('Detecting skills')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Analysis of new-resume\.pdf/ })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Copy to profile' })).toBeVisible();
  });

  test('client-side validation rejects unsupported files', async ({ page }) => {
    await page.goto('/candidate/resumes');
    await page.getByRole('button', { name: /Upload a resume/ }).waitFor();
    await page.locator('input[type="file"]').setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: Buffer.alloc(500) });
    await expect(page.getByText('Only PDF and DOCX files are accepted.')).toBeVisible();
  });

  test('profile sections can be edited and saved', async ({ page }) => {
    await page.goto('/candidate/profile');
    await page.getByRole('button', { name: 'Edit Personal details and summary' }).click();
    await page.getByLabel('Headline').fill('Senior full-stack engineer');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText('Profile saved')).toBeVisible();
    await expect(page.getByText('Senior full-stack engineer').first()).toBeVisible();
  });

  test('applications show the status tracker, history and interview', async ({ page }) => {
    await page.goto('/candidate/applications');
    await expect(page.getByRole('list', { name: /Application status/ }).first()).toBeVisible();
    await expect(page.getByText(/video interview/i)).toBeVisible();
    await page.getByRole('button', { name: 'History' }).first().click();
    await expect(page.getByRole('button', { name: 'Withdraw application' })).toBeVisible();
  });
});

test.describe('Recruiter portal', () => {
  test.beforeEach(async ({ page }) => login(page, ACCOUNTS.recruiter));

  test('dashboard shows hiring metrics and the funnel', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Hiring overview' })).toBeVisible();
    await expect(page.getByText('Hiring funnel')).toBeVisible();
    await expect(page.getByText('AI-screened')).toBeVisible();
  });

  test('creates and publishes a job with AI skill suggestions', async ({ page }) => {
    await page.goto('/recruiter/jobs/new');
    await page.getByLabel('Job title').fill('Python Backend Engineer');
    await page.getByLabel('Description').fill('We need 3+ years of Python, FastAPI and PostgreSQL. Bachelor degree preferred. Remote friendly.');
    await page.getByRole('button', { name: 'Suggest skills from description' }).click();
    await expect(page.getByText('Suggestions added')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remove Python' })).toBeVisible();
    await page.getByRole('button', { name: 'Publish' }).click();
    await expect(page.getByText('Job published')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Python Backend Engineer' }).first()).toBeVisible();
  });

  test('job validation blocks publishing without required fields', async ({ page }) => {
    await page.goto('/recruiter/jobs/new');
    await page.getByRole('button', { name: 'Publish' }).click();
    await expect(page.getByText('Give the job a title of at least 3 characters')).toBeVisible();
  });

  test('screening ranks applicants and a person makes the shortlist decision', async ({ page }) => {
    await page.goto('/recruiter/screening');
    await page.getByRole('button', { name: 'Run screening' }).click();
    await expect(page.getByText('Screening complete')).toBeVisible();
    await page.getByRole('button', { name: 'Shortlist' }).last().click();
    await expect(page.getByRole('dialog')).toContainText('They will be notified');
    await page.getByRole('dialog').getByRole('button', { name: 'Shortlist' }).click();
    await expect(page.getByText(/shortlisted/).first()).toBeVisible();
  });

  test('pipeline moves a candidate through the keyboard-accessible menu', async ({ page }) => {
    await page.goto('/recruiter/pipeline');
    await expect(page.getByRole('region', { name: /Applied/ })).toBeVisible();
    const card = page.getByRole('region', { name: /^Applied/ }).getByText('Chen Wei');
    await card.hover();
    await page.getByRole('button', { name: 'Move Chen Wei' }).click();
    await page.getByRole('menuitem', { name: 'Move to Screened' }).click();
    await expect(page.getByText('Chen Wei moved to Screened')).toBeVisible();
    await expect(page.getByRole('region', { name: /^Screened/ }).getByText('Chen Wei')).toBeVisible();
  });

  test('schedules an interview', async ({ page }) => {
    await page.goto('/recruiter/interviews');
    await page.getByRole('button', { name: 'Schedule', exact: true }).click();
    await page.getByLabel('Meeting link').fill('https://meet.example.com/xyz');
    await page.getByRole('button', { name: 'Schedule interview' }).click();
    await expect(page.getByText('Interview scheduled')).toBeVisible();
  });
});

test.describe('Administrator portal', () => {
  test.beforeEach(async ({ page }) => login(page, ACCOUNTS.admin));

  test('overview links to items that need attention', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Platform overview' })).toBeVisible();
    await page.getByRole('link', { name: /flagged resume/ }).click();
    await expect(page).toHaveURL(/\/admin\/security$/);
    await page.getByRole('button', { name: 'Clear' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Clear resume' }).click();
    await expect(page.getByText('Resume cleared')).toBeVisible();
  });

  test('suspending a user requires a reason', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByRole('cell', { name: /Chen Wei/ }).first().click();
    await page.getByRole('button', { name: 'Suspend account' }).click();
    const confirm = page.getByRole('dialog', { name: /Suspend Chen Wei/ });
    await expect(confirm.getByRole('button', { name: 'Suspend' })).toBeDisabled();
    await confirm.getByLabel(/Reason/).fill('Repeated policy violations');
    await confirm.getByRole('button', { name: 'Suspend' }).click();
    await expect(page.getByText('Account suspended')).toBeVisible();
  });

  test('runs the fairness benchmark and shows passing checks', async ({ page }) => {
    await page.goto('/admin/evaluation');
    await page.getByRole('button', { name: 'Run evaluation' }).click();
    await expect(page.getByText('Evaluation finished')).toBeVisible();
    await expect(page.getByText('Counterfactual fairness')).toBeVisible();
    await expect(page.getByText('Four-fifths rule')).toBeVisible();
  });

  test('reviews a pending skill from the taxonomy queue', async ({ page }) => {
    await page.goto('/admin/skills');
    await page.getByRole('tab', { name: 'Needs review' }).click();
    await page.getByRole('button', { name: 'Review' }).first().click();
    await page.getByRole('dialog').getByRole('button', { name: 'Approve' }).click();
    await expect(page.getByText('Skill updated')).toBeVisible();
  });

  test('system health reports each service', async ({ page }) => {
    await page.goto('/admin/health');
    await expect(page.getByText('Operational')).toHaveCount(3);
  });

  test('dialogs close with Escape and notifications open in a drawer', async ({ page }) => {
    await page.getByRole('button', { name: /^Notifications/ }).click();
    await expect(page.getByRole('dialog', { name: 'Notifications' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Notifications' })).toBeHidden();
  });
});
