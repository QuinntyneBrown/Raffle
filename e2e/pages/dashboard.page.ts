import { type Locator, type Page, expect } from '@playwright/test';

export class DashboardPage {
  readonly raffleListHeading: Locator;
  readonly newRaffleButton: Locator;

  constructor(private readonly page: Page) {
    this.raffleListHeading = page.getByText(/your raffles/i);
    this.newRaffleButton = page.getByRole('button', { name: /new raffle/i });
  }

  async expectRaffleListVisible() {
    await expect(this.raffleListHeading).toBeVisible();
  }

  async navigateToCreateRaffle() {
    await this.newRaffleButton.click();
    await expect(this.page.getByRole('heading', { name: /create.*raffle/i })).toBeVisible();
  }

  async expectRaffleVisible(name: string) {
    await expect(this.page.getByText(new RegExp(name, 'i'))).toBeVisible({ timeout: 5000 });
  }

  async activateFirstRaffle() {
    const activateButton = this.page.getByRole('button', { name: /activate/i }).first();
    const hasRaffle = await activateButton.isVisible().catch(() => false);

    if (hasRaffle) {
      await activateButton.click();
      await expect(this.page.getByText(/active/i).first()).toBeVisible();
      return true;
    }
    return false;
  }
}
