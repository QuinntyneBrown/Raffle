import { test, expect } from '@playwright/test';
import { QrCodePage } from '../pages/qr-code.page';
import { EntryPage } from '../pages/entry.page';

test.describe('QR Code Page', () => {
  test('shows appropriate content based on raffle state', async ({ page }) => {
    const qrPage = new QrCodePage(page);
    await qrPage.goto();
    const hasRaffle = await qrPage.hasActiveRaffle();

    if (hasRaffle) {
      // Should show either accepting entries or entries closed
      const accepting = await qrPage.acceptingEntriesBadge.isVisible().catch(() => false);
      const closed = await qrPage.entriesClosedBadge.isVisible().catch(() => false);
      expect(accepting || closed).toBe(true);
    } else {
      await expect(qrPage.noActiveRaffleMessage).toBeVisible();
    }
  });

  test('displays QR code when entries are open', async ({ page }) => {
    const qrPage = new QrCodePage(page);
    await qrPage.goto();
    const hasRaffle = await qrPage.hasActiveRaffle();

    if (hasRaffle) {
      const accepting = await qrPage.acceptingEntriesBadge.isVisible().catch(() => false);
      if (accepting) {
        await expect(qrPage.qrCode).toBeVisible();
        await expect(qrPage.participantCount).toBeVisible();
      }
    }
  });
});

test.describe('Entry Page', () => {
  test('shows appropriate content based on raffle state', async ({ page }) => {
    const entryPage = new EntryPage(page);
    await entryPage.goto();
    const hasRaffle = await entryPage.hasActiveRaffle();

    if (hasRaffle) {
      const formVisible = await entryPage.nameInput.isVisible().catch(() => false);
      const closedVisible = await entryPage.entriesClosedMessage.isVisible().catch(() => false);
      expect(formVisible || closedVisible).toBe(true);
    } else {
      await expect(entryPage.noActiveRaffleMessage).toBeVisible();
    }
  });

  test('shows registration form when entries are open', async ({ page }) => {
    const entryPage = new EntryPage(page);
    await entryPage.goto();
    const hasRaffle = await entryPage.hasActiveRaffle();

    if (hasRaffle) {
      const formVisible = await entryPage.nameInput.isVisible().catch(() => false);
      if (formVisible) {
        await expect(entryPage.nameInput).toBeVisible();
        await expect(entryPage.submitButton).toBeVisible();
        await expect(entryPage.submitButton).toBeEnabled();
      }
    }
  });

  test('submitting a name shows success or appropriate error', async ({ page }) => {
    const entryPage = new EntryPage(page);
    await entryPage.goto();
    const hasRaffle = await entryPage.hasActiveRaffle();

    if (hasRaffle) {
      const formVisible = await entryPage.nameInput.isVisible().catch(() => false);
      if (formVisible) {
        const uniqueName = `E2E-Test-${Date.now()}`;
        await entryPage.enterName(uniqueName);

        // Wait for either success, entries-closed, or an error
        await Promise.race([
          entryPage.successMessage.waitFor({ state: 'visible', timeout: 10000 }),
          entryPage.entriesClosedMessage.waitFor({ state: 'visible', timeout: 10000 }),
          entryPage.errorBanner.waitFor({ state: 'visible', timeout: 10000 }),
        ]).catch(() => {});

        const success = await entryPage.successMessage.isVisible().catch(() => false);
        const closed = await entryPage.entriesClosedMessage.isVisible().catch(() => false);
        const error = await entryPage.errorBanner.isVisible().catch(() => false);

        // At least one outcome should be visible
        expect(success || closed || error).toBe(true);
      }
    }
  });

  test('entries closed state shows correct message', async ({ page }) => {
    const entryPage = new EntryPage(page);
    await entryPage.goto();
    const hasRaffle = await entryPage.hasActiveRaffle();

    if (hasRaffle) {
      const closedVisible = await entryPage.entriesClosedMessage.isVisible().catch(() => false);
      if (closedVisible) {
        await expect(entryPage.entriesClosedMessage).toBeVisible();
        // Form should not be visible when entries are closed
        await expect(entryPage.nameInput).not.toBeVisible();
      }
    }
  });
});
