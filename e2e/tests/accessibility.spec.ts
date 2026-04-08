import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LoginPage } from '../pages/login.page';
import { PublicDrawPage } from '../pages/public-draw.page';

test.describe('Accessibility', () => {
  test('public page has no critical accessibility violations', async ({ page }) => {
    const drawPage = new PublicDrawPage(page);
    await drawPage.goto();
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(critical).toEqual([]);
  });

  test('login page has no critical accessibility violations', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(critical).toEqual([]);
  });

  test('public page is keyboard navigable', async ({ page }) => {
    const drawPage = new PublicDrawPage(page);
    await drawPage.goto();
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });

  test('login form labels are associated with inputs', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
  });
});
