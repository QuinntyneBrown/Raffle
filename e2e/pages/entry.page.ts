import { type Locator, type Page } from '@playwright/test';

export class EntryPage {
  readonly noActiveRaffleMessage: Locator;
  readonly nameInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly entriesClosedMessage: Locator;
  readonly errorBanner: Locator;
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.noActiveRaffleMessage = page.getByText(/no active raffle/i);
    this.nameInput = page.getByLabel(/your name/i);
    this.submitButton = page.getByRole('button', { name: /enter raffle/i });
    this.successMessage = page.getByText(/you're in/i);
    this.entriesClosedMessage = page.getByRole('heading', { name: /entries closed/i });
    this.errorBanner = page.getByRole('alert');
    this.heading = page.getByRole('heading', { level: 1 });
  }

  async goto() {
    await this.page.goto('/enter');
  }

  async hasActiveRaffle(): Promise<boolean> {
    await Promise.race([
      this.nameInput.waitFor({ state: 'visible', timeout: 10000 }),
      this.entriesClosedMessage.waitFor({ state: 'visible', timeout: 10000 }),
      this.noActiveRaffleMessage.waitFor({ state: 'visible', timeout: 10000 }),
    ]).catch(() => {});
    return this.noActiveRaffleMessage.isVisible().then((v) => !v).catch(() => false);
  }

  async enterName(name: string) {
    await this.nameInput.fill(name);
    await this.submitButton.click();
  }
}
