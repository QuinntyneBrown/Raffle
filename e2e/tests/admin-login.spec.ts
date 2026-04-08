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

  test('redirects to dashboard on successful login', async ({ page }) => {
    // Auth storage state is pre-loaded; just navigate to admin
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByText(/your raffles/i)).toBeVisible();
  });

  test('protects admin routes from unauthenticated access', async ({ browser }) => {
    // Use a fresh context without auth state to test unauthenticated access
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
    await context.close();
  });
});
