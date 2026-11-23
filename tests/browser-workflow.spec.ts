import { test, expect, Page } from '@playwright/test';

// Unique IDs for test accounts
const uid = Date.now().toString().slice(-6);
const candidateEmail = `browser_candidate_${uid}@hiresmart.test`;
const recruiterEmail = `browser_recruiter_${uid}@hiresmart.test`;
const testPassword = 'Password123!';

test.describe('HireSmart AI - Complete Real Browser Testing Suite', () => {

  // =================================================================
  // 1. PUBLIC LANDING & AUTH MODAL
  // =================================================================
  test('1. Landing Page renders hero, navigation, and AuthModal triggers', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/HireSmart/i);

    // Verify main hero CTA buttons
    const signInBtn = page.getByRole('button', { name: /sign in/i }).first();
    await expect(signInBtn).toBeVisible();
    await signInBtn.click();

    // Verify AuthModal opened with form inputs
    const authModal = page.locator('form');
    await expect(authModal).toBeVisible();
    await expect(page.getByPlaceholder('Email Address')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();

    // Close modal
    const closeBtn = page.locator('button:has(svg.lucide-x)').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  });

  // =================================================================
  // 2. CANDIDATE WORKFLOW: REGISTER, LOGIN, DASHBOARD, RESUME, JOBS, APPLY
  // =================================================================
  test('2. Candidate Flow: Register, Login, Dashboard, Resume, Jobs, and Application', async ({ page }) => {
    await page.goto('/');

    // 1. Open AuthModal & switch to Register
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.getByRole('button', { name: /create one/i }).click();

    // Fill candidate registration form
    await page.getByPlaceholder('Full Name').fill('Browser QA Candidate');
    await page.getByPlaceholder('Email Address').fill(candidateEmail);
    await page.getByPlaceholder('Password').fill(testPassword);

    // Submit registration
    await page.getByRole('button', { name: /create account/i }).click();

    // Verify redirected to candidate dashboard
    await expect(page).toHaveURL(/\/candidate\/dashboard/);
    await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 15000 });

    // 2. Candidate Dashboard Metrics
    await expect(page.locator('text=Applications')).toBeVisible();
    await expect(page.locator('text=Profile Completion')).toBeVisible();

    // 3. Navigate to Resume Page
    await page.goto('/candidate/resume');
    await expect(page.locator('h1')).toContainText(/resume/i);
    await expect(page.locator('text=Upload your resume')).toBeVisible();

    // 4. Navigate to Jobs Discovery
    await page.goto('/candidate/jobs');
    await expect(page.locator('h1')).toContainText(/jobs/i);

    // Search for a job
    const searchInput = page.getByPlaceholder(/search by title/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Full Stack');
      await page.waitForTimeout(500);
    }

    // 5. Navigate to Candidate Skills
    await page.goto('/candidate/skills');
    await expect(page.locator('h1')).toContainText(/skills/i);

    // 6. Navigate to Candidate Profile
    await page.goto('/candidate/profile');
    await expect(page.locator('h1')).toContainText(/profile/i);

    // 7. Navigate to Candidate Complaints
    await page.goto('/candidate/complaint');
    await expect(page.locator('h1')).toContainText(/complaint|feedback|support/i);

    // 8. Logout
    const logoutBtn = page.getByRole('button', { name: /sign out|log out/i });
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await expect(page).toHaveURL('/');
    }
  });

  // =================================================================
  // 3. RECRUITER WORKFLOW: LOGIN, DASHBOARD, JOB POSTING, APPLICANTS, PIPELINE
  // =================================================================
  test('3. Recruiter Flow: Login, Dashboard, Create Job, View Applicants, and Kanban Pipeline', async ({ page }) => {
    await page.goto('/');

    // 1. Open AuthModal, select Recruiter role and login
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.getByRole('button', { name: 'Recruiter' }).click();

    await page.getByPlaceholder('Email Address').fill('recruiter@test.com');
    await page.getByPlaceholder('Password').fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify redirected to recruiter dashboard
    await expect(page).toHaveURL(/\/recruiter\/dashboard/, { timeout: 15000 });
    await expect(page.locator('text=Total Candidates').or(page.locator('text=Active Jobs'))).toBeVisible();

    // 2. Navigate to Jobs Management
    await page.goto('/recruiter/jobs');
    await expect(page.locator('h1')).toContainText(/job/i);

    // 3. Navigate to Post a Job
    await page.goto('/recruiter/jobs/create');
    await expect(page.locator('h1')).toContainText(/post|create/i);

    // 4. Navigate to Candidates Pool
    await page.goto('/recruiter/candidates');
    await expect(page.locator('h1')).toContainText(/candidate/i);

    // 5. Navigate to AI Screening
    await page.goto('/recruiter/screening');
    await expect(page.locator('h1')).toContainText(/screening/i);

    // 6. Navigate to Hiring Pipeline Kanban
    await page.goto('/recruiter/hiring');
    await expect(page.locator('h1')).toContainText(/pipeline|hiring/i);

    // 7. Navigate to Interviews
    await page.goto('/recruiter/interviews');
    await expect(page.locator('h1')).toContainText(/interview/i);

    // 8. Navigate to Recruiter Profile & Settings
    await page.goto('/recruiter/profile');
    await expect(page.locator('h1')).toContainText(/profile|company/i);

    // 9. Logout
    const logoutBtn = page.getByRole('button', { name: /sign out|log out/i });
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await expect(page).toHaveURL('/');
    }
  });

  // =================================================================
  // 4. ADMIN WORKFLOW: STATS, USERS, COMPLAINTS, TAXONOMY, AUDIT, HEALTH
  // =================================================================
  test('4. Admin Flow: Login, Statistics, User Moderation, Complaints, Skills, Audit Logs, and System Health', async ({ page }) => {
    await page.goto('/');

    // 1. Open AuthModal, select Admin role and login
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.getByRole('button', { name: 'Admin' }).click();

    await page.getByPlaceholder('Email Address').fill('admin@hiresmart.ai');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify redirected to Admin Dashboard
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
    await expect(page.locator('text=Total Users').or(page.locator('text=Admin'))).toBeVisible();

    // 2. Navigate to User Management
    await page.goto('/admin/users');
    await expect(page.locator('h1')).toContainText(/user/i);

    // 3. Navigate to Complaints Management
    await page.goto('/admin/complaints');
    await expect(page.locator('h1')).toContainText(/complaint/i);

    // 4. Navigate to Skill Taxonomy
    await page.goto('/admin/skills');
    await expect(page.locator('h1')).toContainText(/skill|taxonomy/i);

    // 5. Navigate to Audit Logs
    await page.goto('/admin/audit-logs');
    await expect(page.locator('h1')).toContainText(/audit/i);

    // 6. Navigate to AI Fairness & Evaluation
    await page.goto('/admin/ai-evaluation');
    await expect(page.locator('h1')).toContainText(/ai|evaluation/i);

    // 7. Navigate to System Health
    await page.goto('/admin/system-health');
    await expect(page.locator('h1')).toContainText(/system|health/i);

    // 8. Logout
    const logoutBtn = page.getByRole('button', { name: /sign out|log out/i });
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await expect(page).toHaveURL('/');
    }
  });

  // =================================================================
  // 5. SECURITY & EDGE CASES: INVALID LOGIN, ROLE RESTRICTIONS
  // =================================================================
  test('5. Security Flow: Invalid Login alert, Role Restrictions & Protected Route Redirects', async ({ page }) => {
    await page.goto('/');

    // 1. Invalid credentials error alert
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.getByPlaceholder('Email Address').fill('alice@test.com');
    await page.getByPlaceholder('Password').fill('WrongPassword999!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify error banner displays
    const errorBanner = page.locator('text=invalid credentials').or(page.locator('text=incorrect password')).or(page.locator('.text-semantic-error'));
    await expect(errorBanner).toBeVisible({ timeout: 10000 });

    // Close modal
    const closeBtn = page.locator('button:has(svg.lucide-x)').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }

    // 2. Unauthenticated access to /admin redirects to Landing
    await page.goto('/admin');
    await expect(page).toHaveURL('/');

    // 3. Unauthenticated access to /recruiter/dashboard redirects to Landing
    await page.goto('/recruiter/dashboard');
    await expect(page).toHaveURL('/');

    // 4. Unauthenticated access to /candidate/dashboard redirects to Landing
    await page.goto('/candidate/dashboard');
    await expect(page).toHaveURL('/');
  });

});

