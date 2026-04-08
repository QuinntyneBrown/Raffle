import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:5173';
const STORAGE_STATE_PATH = './test-results/.auth/admin.json';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    // Auth setup — runs once before admin tests
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      testDir: '.',
    },
    // Public tests (no auth required)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /admin-/,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testIgnore: /admin-/,
    },
    // Admin tests (depend on auth setup)
    {
      name: 'chromium-admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE_PATH,
      },
      testMatch: /admin-/,
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome-admin',
      use: {
        ...devices['Pixel 5'],
        storageState: STORAGE_STATE_PATH,
      },
      testMatch: /admin-/,
      dependencies: ['setup'],
    },
  ],
  ...(!process.env.BASE_URL && {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      cwd: '..',
    },
  }),
});
