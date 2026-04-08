import { test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { CreateRafflePage } from '../pages/create-raffle.page';

test.describe('Admin Raffle Management', () => {
  test.describe.configure({ mode: 'serial' });

  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdmin();
    dashboardPage = new DashboardPage(page);
  });

  test('displays raffle list on dashboard', async () => {
    await dashboardPage.expectRaffleListVisible();
  });

  test('can navigate to create raffle page', async () => {
    await dashboardPage.navigateToCreateRaffle();
  });

  test('can create a new raffle', async ({ page }) => {
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

  test('can activate and deactivate a raffle', async () => {
    await dashboardPage.activateFirstRaffle();
  });
});
