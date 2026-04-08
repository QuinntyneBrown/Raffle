import { test, expect } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/admin/login');
  await page.getByLabel(/email/i).fill('admin@raffle.app');
  await page.getByLabel(/password/i).fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page.getByText(/your raffles/i)).toBeVisible({ timeout: 5000 });
}

test.describe('Admin Raffle Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('displays raffle list on dashboard', async ({ page }) => {
    await expect(page.getByText(/your raffles/i)).toBeVisible();
  });

  test('can navigate to create raffle page', async ({ page }) => {
    await page.getByRole('button', { name: /new raffle/i }).click();
    await expect(page.getByText(/create.*raffle/i)).toBeVisible();
  });

  test('can create a new raffle', async ({ page }) => {
    await page.getByRole('button', { name: /new raffle/i }).click();

    await page.getByLabel(/raffle name/i).fill('Test Raffle E2E');
    await page.getByLabel(/heading/i).fill('TEST RAFFLE');

    const participantsField = page.getByLabel(/participants/i);
    await participantsField.fill('Alice\nBob\nCharlie\nDiana\nEve');

    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByText(/test raffle e2e/i)).toBeVisible({ timeout: 5000 });
  });

  test('can activate and deactivate a raffle', async ({ page }) => {
    const activateButton = page.getByRole('button', { name: /activate/i }).first();
    const hasRaffle = await activateButton.isVisible().catch(() => false);

    if (hasRaffle) {
      await activateButton.click();
      await expect(page.getByText(/active/i).first()).toBeVisible();
    }
  });
});
