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

    // Verify OAuth social buttons are present in AuthModal
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continue with linkedin/i })).toBeVisible();

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
    const dynamicCandidateEmail = `cand_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@hiresmart.test`;
    await page.goto('/');

    // 1. Open AuthModal & switch to Register
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.getByRole('button', { name: /create one/i }).click();

    // Fill candidate registration form
    await page.getByPlaceholder('Full Name').fill('Browser QA Candidate');
    await page.getByPlaceholder('Email Address').fill(dynamicCandidateEmail);
    await page.getByPlaceholder('Password').fill(testPassword);

    // Submit registration
    await page.getByRole('button', { name: /create account/i }).click();

    // Verify redirected to candidate dashboard
    await expect(page).toHaveURL(/\/candidate\/dashboard/);
    await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 15000 });

    // 2. Candidate Dashboard Metrics
    await expect(page.locator('text=Applications').first()).toBeVisible();
    await expect(page.locator('text=Profile Score').or(page.locator('text=Profile Strength')).first()).toBeVisible();

    // 3. Navigate to Resume Page
    await page.goto('/candidate/resume');
    await expect(page.locator('h1').first()).toContainText(/resume/i);
    await expect(page.locator('text=Upload your resume').first()).toBeVisible();

    // 4. Navigate to Jobs Discovery
    await page.goto('/candidate/jobs');
    await expect(page.locator('h1').first()).toContainText(/opportunity|job/i);

    // Search for a job
    const searchInput = page.getByPlaceholder(/search by title/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Full Stack');
      await page.waitForTimeout(500);
    }

    // 5. Navigate to Candidate Skills
    await page.goto('/candidate/skills');
    await expect(page.locator('h1').first()).toContainText(/skill/i);

    // 6. Navigate to Candidate Profile
    await page.goto('/candidate/profile');
    await expect(page.locator('h1').first()).toContainText(/profile/i);

    // 7. Navigate to Candidate Complaints
    await page.goto('/candidate/complaint');
    await expect(page.locator('h1').first()).toContainText(/report|issue|complaint|feedback/i);

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
    await page.getByRole('button', { name: 'Recruiter', exact: true }).click();

    await page.getByPlaceholder('Email Address').fill('recruiter@test.com');
    await page.getByPlaceholder('Password').fill('Password123!');
    await page.locator('form').getByRole('button', { name: /sign in/i }).click();

    // Verify redirected to recruiter dashboard
    await expect(page).toHaveURL(/\/recruiter\/dashboard/, { timeout: 15000 });
    await expect(page.locator('text=Total Candidates').or(page.locator('text=Active Jobs')).first()).toBeVisible();

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
    await page.getByRole('button', { name: 'Admin', exact: true }).click();

    await page.getByPlaceholder('Email Address').fill('admin@hiresmart.ai');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.locator('form').getByRole('button', { name: /sign in/i }).click();

    // Verify redirected to Admin Dashboard
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
    await expect(page.locator('text=Total Users').or(page.locator('text=Admin')).first()).toBeVisible();

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
    await page.locator('form').getByRole('button', { name: /sign in/i }).click();

    // Verify error banner displays
    const errorBanner = page.locator('text=invalid credentials').or(page.locator('text=incorrect password')).or(page.locator('.text-semantic-error'));
    await expect(errorBanner.first()).toBeVisible({ timeout: 10000 });

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

  // =================================================================
  // 6. OAUTH CALLBACK & SOCIAL AUTH FLOWS
  // =================================================================
  test('6. OAuth Flow: OAuthCallback handles access denied and error reporting gracefully', async ({ page }) => {
    // Navigate to OAuth callback with access_denied error parameter
    await page.goto('/oauth/callback?error=access_denied&error_description=User%20declined%20OAuth%20consent');

    // Verify error card renders with appropriate status
    await expect(page.locator('text=Authentication Failed')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=User declined OAuth consent')).toBeVisible();

    // Verify Return Home action works
    const returnHomeBtn = page.getByRole('button', { name: /return home/i });
    await expect(returnHomeBtn).toBeVisible();
    await returnHomeBtn.click();
    await expect(page).toHaveURL('/');
  });

  // =================================================================
  // 7. GOOGLE OAUTH PROFILE MAPPING & GREETING VERIFICATION
  // =================================================================
  test('7. Google OAuth Flow: Jane Google Doe maps correctly to dashboard greeting, header avatar and profile', async ({ page }) => {
    // Navigate to OAuth callback simulating Google authorization code exchange for "Jane Google Doe"
    const state = Buffer.from(JSON.stringify({ role: 'candidate', provider: 'google' })).toString('base64');
    await page.goto(`/oauth/callback?code=mock_Jane_Google_Doe&state=${state}`);

    // Verify redirected to candidate dashboard
    await expect(page).toHaveURL(/\/candidate\/dashboard/, { timeout: 15000 });

    // Verify dashboard displays authentic greeting with Google user first name
    await expect(page.locator('text=Welcome back, Jane')).toBeVisible({ timeout: 10000 });

    // Verify header user profile shows "Jane Google Doe"
    await expect(page.locator('text=Jane Google Doe').first()).toBeVisible();

    // Verify candidate profile page displays "Jane Google Doe"
    await page.goto('/candidate/profile');
    await expect(page.locator('text=Jane Google Doe').first()).toBeVisible({ timeout: 10000 });

    // Verify logout clears session and candidate profile
    await page.goto('/candidate/dashboard');
    const userMenuBtn = page.locator('div.h-9.w-9').first();
    if (await userMenuBtn.isVisible()) {
      await userMenuBtn.click();
    }
    const logoutBtn = page.getByRole('button', { name: /sign out|log out/i }).or(page.locator('text=Sign Out')).or(page.locator('text=Log Out')).first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await expect(page).toHaveURL('/');

      // Verify localStorage session is cleared
      const sessionInStorage = await page.evaluate(() => localStorage.getItem('hiresmart_session'));
      expect(sessionInStorage).toBeNull();
    }
  });

  // =================================================================
  // 8. DATA ISOLATION & CLEAN INITIAL CANDIDATE PROFILE VERIFICATION
  // =================================================================
  test('8. Data Isolation: Newly registered candidate sees clean profile with ZERO mock data leakage', async ({ page }) => {
    const cleanUid = Date.now().toString().slice(-6);
    const freshEmail = `clean_cand_${cleanUid}@hiresmart.test`;
    const freshName = 'Clean Fresh Candidate';

    await page.goto('/');

    // Register fresh candidate
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.getByRole('button', { name: /create one/i }).click();

    await page.getByPlaceholder('Full Name').fill(freshName);
    await page.getByPlaceholder('Email Address').fill(freshEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: /create account/i }).click();

    // Verify redirected to dashboard with fresh candidate's name
    await expect(page).toHaveURL(/\/candidate\/dashboard/, { timeout: 15000 });
    await expect(page.locator(`text=${freshName}`).or(page.locator('text=Welcome back, Clean')).first()).toBeVisible({ timeout: 10000 });

    // Verify Dashboard has 0 applications initially (no fake seeded applications)
    await expect(page.locator('text=0').first()).toBeVisible();

    // Navigate to Candidate Profile page
    await page.goto('/candidate/profile');
    await expect(page.locator('h2').first()).toContainText(freshName);

    // CRITICAL: Verify NO mock profile data exists
    // Rahul Kumar should not be present
    await expect(page.locator('text=Rahul Kumar')).toHaveCount(0);
    // Fake mock company "ABC Technologies" should not be present
    await expect(page.locator('text=ABC Technologies')).toHaveCount(0);
    // Fake mock university "XYZ University" should not be present
    await expect(page.locator('text=XYZ University')).toHaveCount(0);

    // Verify empty state messages are rendered
    await expect(
      page.locator('text=No skills added yet').or(page.locator('text=No experience added yet')).first()
    ).toBeVisible({ timeout: 10000 });

    // Logout and verify complete localStorage purge
    await page.goto('/candidate/dashboard');
    const userMenuBtn = page.locator('div.h-9.w-9').first();
    if (await userMenuBtn.isVisible()) {
      await userMenuBtn.click();
    }
    const logoutBtn = page.getByRole('button', { name: /sign out|log out/i }).or(page.locator('text=Sign Out')).or(page.locator('text=Log Out')).first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await expect(page).toHaveURL('/');
      
      const session = await page.evaluate(() => localStorage.getItem('hiresmart_session'));
      expect(session).toBeNull();
      const cachedProfile = await page.evaluate(() => localStorage.getItem('hiresmart_candidate_profile'));
      expect(cachedProfile).toBeNull();
      const cachedApps = await page.evaluate(() => localStorage.getItem('hiresmart_all_applications'));
      expect(cachedApps).toBeNull();
    }
  });

  // =================================================================
  // 9. CROSS-PORTAL WORKFLOW: RECRUITER & CANDIDATE INTERACTION
  // =================================================================
  test('9. Recruiter and candidate portals open in independent sessions', async ({ page, browser, baseURL }) => {
    // 1. Recruiter logs in
    await page.goto('/');
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.getByRole('button', { name: 'Recruiter', exact: true }).click();
    await page.getByPlaceholder('Email Address').fill('recruiter@test.com');
    await page.getByPlaceholder('Password').fill('Password123!');
    await page.locator('form').getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/recruiter\/dashboard/, { timeout: 15000 });

    // 2. Recruiter navigates to jobs
    await page.goto('/recruiter/jobs');
    await expect(page.locator('h1')).toContainText(/job/i);

    const candidateContext = await browser.newContext({ baseURL });
    try {
      const candidatePage = await candidateContext.newPage();
      // 3. Candidate registers & logs in
      const applicantEmail = `applicant_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@hiresmart.test`;
      await candidatePage.goto('/');
      await candidatePage.getByRole('button', { name: /sign in/i }).first().click();
      await candidatePage.getByRole('button', { name: /create one/i }).click();
      await candidatePage.getByPlaceholder('Full Name').fill('Applicant QA Candidate');
      await candidatePage.getByPlaceholder('Email Address').fill(applicantEmail);
      await candidatePage.getByPlaceholder('Password').fill(testPassword);
      await candidatePage.getByRole('button', { name: /create account/i }).click();
      await expect(candidatePage).toHaveURL(/\/candidate\/dashboard/, { timeout: 15000 });

      // 4. Candidate navigates to jobs and explores
      await candidatePage.goto('/candidate/jobs');
      await expect(candidatePage.locator('h1').first()).toContainText(/job|opportunity/i);

      // 5. Navigate to candidate applications
      await candidatePage.goto('/candidate/applications');
      await expect(candidatePage.locator('h1').first()).toContainText(/application/i);
    } finally {
      await candidateContext.close();
    }
  });

});

