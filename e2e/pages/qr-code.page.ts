import { type Locator, type Page } from '@playwright/test';

export class QrCodePage {
  readonly noActiveRaffleMessage: Locator;
  readonly acceptingEntriesBadge: Locator;
  readonly entriesClosedBadge: Locator;
  readonly qrCode: Locator;
  readonly participantCount: Locator;
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.noActiveRaffleMessage = page.getByText(/no active raffle/i);
    this.acceptingEntriesBadge = page.getByText(/accepting entries/i);
    this.entriesClosedBadge = page.getByText(/entries closed/i);
    this.qrCode = page.getByRole('img', { name: /qr code/i });
    this.participantCount = page.getByText(/participant.*registered/i);
    this.heading = page.getByRole('heading', { level: 1 });
  }

  async goto() {
    await this.page.goto('/qr');
  }

  async hasActiveRaffle(): Promise<boolean> {
    await Promise.race([
      this.acceptingEntriesBadge.waitFor({ state: 'visible', timeout: 10000 }),
      this.entriesClosedBadge.waitFor({ state: 'visible', timeout: 10000 }),
      this.noActiveRaffleMessage.waitFor({ state: 'visible', timeout: 10000 }),
    ]).catch(() => {});
    return this.noActiveRaffleMessage.isVisible().then((v) => !v).catch(() => false);
  }
}
