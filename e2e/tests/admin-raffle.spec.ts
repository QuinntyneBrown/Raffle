import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { CreateRafflePage } from '../pages/create-raffle.page';

test.describe('Admin Raffle Management', () => {
  test('displays raffle list on dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdmin();
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.expectRaffleListVisible();
  });

  test('can navigate to create raffle, create one, and activate it', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdmin();
    const dashboardPage = new DashboardPage(page);

    // Navigate to create raffle page
    await dashboardPage.navigateToCreateRaffle();

    // Create a new raffle with unique name
    const suffix = Date.now().toString(36);
    const raffleName = `Test Raffle ${suffix}`;
    const createPage = new CreateRafflePage(page);
    await createPage.fillAndSubmit(raffleName, 'TEST RAFFLE', [
      'Alice',
      'Bob',
      'Charlie',
      'Diana',
      'Eve',
    ]);
    await dashboardPage.expectRaffleVisible(raffleName);

    // Activate/deactivate
    await dashboardPage.activateFirstRaffle();
  });
});
