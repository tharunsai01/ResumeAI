import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: {
    timeout: 15000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'off',
    headless: true,
  },
  webServer: [
    {
      command: 'node dist/server.js',
      cwd: '../backend',
      url: 'http://localhost:5000/api/v1',
      reuseExistingServer: true,
      timeout: 45000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'npx vite --port 5173',
      cwd: '.',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 45000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
