import { test as setup, expect } from '@playwright/test';

const STORAGE_STATE_PATH = './test-results/.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel(/email/i).fill('admin@raffle.app');
  await page.getByLabel(/password/i).fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page.getByText(/your raffles/i)).toBeVisible({ timeout: 10000 });
  await page.context().storageState({ path: STORAGE_STATE_PATH });
});

export { STORAGE_STATE_PATH };
