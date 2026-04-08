import { type Locator, type Page, expect } from '@playwright/test';

export class PublicDrawPage {
  readonly noActiveRaffleMessage: Locator;
  readonly drawButton: Locator;
  readonly muteButton: Locator;

  constructor(private readonly page: Page) {
    this.noActiveRaffleMessage = page.getByText(/no active raffle/i);
    this.drawButton = page.getByRole('button', { name: /draw/i });
    this.muteButton = page.getByRole('button', { name: /mute|sound/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async hasActiveRaffle(): Promise<boolean> {
    // Wait for loading to complete - either draw button or no-raffle message appears
    await Promise.race([
      this.drawButton.waitFor({ state: 'visible', timeout: 10000 }),
      this.noActiveRaffleMessage.waitFor({ state: 'visible', timeout: 10000 }),
    ]).catch(() => {});
    return this.drawButton.isVisible().catch(() => false);
  }

  async draw() {
    await this.drawButton.click();
    await expect(this.drawButton).toBeDisabled();
    await expect(this.drawButton).toBeEnabled({ timeout: 8000 });
  }

  async toggleMute() {
    await this.muteButton.click();
    await expect(this.muteButton).toBeVisible();
  }
}
