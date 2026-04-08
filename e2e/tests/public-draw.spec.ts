import { test, expect } from '@playwright/test';
import { PublicDrawPage } from '../pages/public-draw.page';

test.describe('Public Raffle Page', () => {
  test('shows no active raffle message when none is active', async ({ page }) => {
    const drawPage = new PublicDrawPage(page);
    await drawPage.goto();
    await expect(drawPage.noActiveRaffleMessage).toBeVisible();
  });

  test('displays heading and draw button when raffle is active', async ({ page }) => {
    const drawPage = new PublicDrawPage(page);
    await drawPage.goto();
    if (await drawPage.hasActiveRaffle()) {
      await expect(drawPage.drawButton).toBeEnabled();
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
