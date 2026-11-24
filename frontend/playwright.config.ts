import { defineConfig, devices } from '@playwright/test';

/**
 * Two modes:
 *  - default: UI tests against the demo build (`--mode mock`), no backend needed.
 *  - E2E_LIVE=1: the full journey against a running stack (docker compose up),
 *    with BASE_URL pointing at the frontend (default http://localhost:8080).
 */
const live = !!process.env.E2E_LIVE;
const chromePath = process.env.CHROME_PATH;
const launchOptions = chromePath ? { executablePath: chromePath, args: ['--no-sandbox'] } : {};

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: !live,
  retries: process.env.CI ? 1 : 0,
  workers: live ? 1 : undefined,
  timeout: live ? 120_000 : 30_000,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.BASE_URL ?? (live ? 'http://localhost:8080' : 'http://localhost:4173'),
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions,
  },
  projects: [
    // Project-level testIgnore replaces any top-level one, so both exclusions live here.
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], launchOptions },
      ...(live ? { testMatch: /live-journey\.spec\.ts/ } : { testIgnore: [/responsive\.spec\.ts/, /live-journey\.spec\.ts/] }),
    },
    { name: 'mobile', use: { ...devices['Pixel 7'], launchOptions }, testMatch: live ? /^$/ : /responsive\.spec\.ts/ },
  ],
  webServer: live
    ? undefined
    : {
        command: 'npm run build:mock && npx vite preview --outDir dist-mock --port 4173 --strictPort',
        url: 'http://localhost:4173',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
