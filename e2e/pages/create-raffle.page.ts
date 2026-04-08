import { type Locator, type Page } from '@playwright/test';

export class CreateRafflePage {
  readonly nameInput: Locator;
  readonly headingInput: Locator;
  readonly participantsInput: Locator;
  readonly createButton: Locator;

  constructor(private readonly page: Page) {
    this.nameInput = page.getByLabel(/raffle name/i);
    this.headingInput = page.getByLabel(/^page heading$/i);
    this.participantsInput = page.getByLabel(/participants/i);
    this.createButton = page.getByRole('button', { name: /create/i });
  }

  async fillAndSubmit(name: string, heading: string, participants: string[]) {
    await this.nameInput.fill(name);
    await this.headingInput.fill(heading);
    await this.participantsInput.fill(participants.join('\n'));
    await this.createButton.click();
  }
}
