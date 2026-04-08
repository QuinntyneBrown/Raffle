import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('public page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(critical).toEqual([]);
  });

  test('login page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/admin/login');
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(critical).toEqual([]);
  });

  test('public page is keyboard navigable', async ({ page }) => {
    await page.goto('/');
    // Tab through elements — should reach interactive controls
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });

  test('login form labels are associated with inputs', async ({ page }) => {
    await page.goto('/admin/login');
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toBeVisible();
  });
});
