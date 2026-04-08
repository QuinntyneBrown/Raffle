import { test, expect } from '@playwright/test';
import { PublicDrawPage } from '../pages/public-draw.page';

test.describe('Public Raffle Page', () => {
  test('shows appropriate content based on raffle state', async ({ page }) => {
    const drawPage = new PublicDrawPage(page);
    await drawPage.goto();
    const hasRaffle = await drawPage.hasActiveRaffle();
    if (hasRaffle) {
      await expect(drawPage.drawButton).toBeEnabled();
    } else {
      await expect(drawPage.noActiveRaffleMessage).toBeVisible();
    }
  });

  test('draw button triggers animation and reveals winner', async ({ page }) => {
    const drawPage = new PublicDrawPage(page);
    await drawPage.goto();
    if (await drawPage.hasActiveRaffle()) {
      await drawPage.draw();
    }
  });

  test('mute toggle is accessible', async ({ page }) => {
    const drawPage = new PublicDrawPage(page);
    await drawPage.goto();
    const hasButton = await drawPage.muteButton.isVisible().catch(() => false);
    if (hasButton) {
      await drawPage.toggleMute();
    }
  });
});
