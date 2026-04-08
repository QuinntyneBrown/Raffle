import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Admin Login', () => {
  test.describe.configure({ mode: 'serial' });

  test('shows login form', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.signInButton).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('wrong@example.com', 'wrongpassword');
    await loginPage.expectErrorVisible();
  });

  test('redirects to dashboard on successful login and protects admin routes', async ({ page, browser }) => {
    // Test successful login
    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdmin();
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByText(/your raffles/i)).toBeVisible();

    // Test unauthenticated access in a fresh context
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();
    await freshPage.goto('/admin');
    await expect(freshPage).toHaveURL(/\/admin\/login/);
    await freshContext.close();
  });
});
