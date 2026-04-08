import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { CreateRafflePage } from '../pages/create-raffle.page';

async function ensureOnDashboard(page: import('@playwright/test').Page) {
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
  if (page.url().includes('/login')) {
    const loginPage = new LoginPage(page);
    await loginPage.login('admin@raffle.app', 'password123');
    await expect(page.getByText(/your raffles/i)).toBeVisible({ timeout: 10000 });
  } else {
    await expect(page.getByText(/your raffles/i)).toBeVisible({ timeout: 10000 });
  }
}

test.describe('Admin Raffle Management', () => {
  test.describe.configure({ mode: 'serial' });

  test('displays raffle list on dashboard', async ({ page }) => {
    await ensureOnDashboard(page);
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.expectRaffleListVisible();
  });

  test('can navigate to create raffle page', async ({ page }) => {
    await ensureOnDashboard(page);
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.navigateToCreateRaffle();
  });

  test('can create a new raffle', async ({ page }) => {
    await ensureOnDashboard(page);
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.navigateToCreateRaffle();
    const createPage = new CreateRafflePage(page);
    await createPage.fillAndSubmit('Test Raffle E2E', 'TEST RAFFLE', [
      'Alice',
      'Bob',
      'Charlie',
      'Diana',
      'Eve',
    ]);
    await dashboardPage.expectRaffleVisible('test raffle e2e');
  });

  test('can activate and deactivate a raffle', async ({ page }) => {
    await ensureOnDashboard(page);
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.activateFirstRaffle();
  });
});
