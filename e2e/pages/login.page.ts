import { type Locator, type Page, expect } from '@playwright/test';

export class LoginPage {
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /welcome/i });
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.signInButton = page.getByRole('button', { name: /sign in/i });
  }

  async goto() {
    await this.page.goto('/admin/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async loginAsAdmin() {
    await this.goto();
    await this.login('admin@raffle.app', 'password123');
    await expect(this.page.getByText(/your raffles/i)).toBeVisible({ timeout: 5000 });
  }

  async expectErrorVisible() {
    await expect(this.page.getByText(/invalid/i)).toBeVisible();
  }
}
