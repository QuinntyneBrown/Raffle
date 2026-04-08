import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test('shows login form', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid/i)).toBeVisible();
  });

  test('redirects to dashboard on successful login', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill('admin@raffle.app');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 5000 });
    await expect(page.getByText(/your raffles/i)).toBeVisible();
  });

  test('protects admin routes from unauthenticated access', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
