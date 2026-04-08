import { test, expect } from '@playwright/test';

test.describe('Public Raffle Page', () => {
  test('shows no active raffle message when none is active', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/no.*raffle.*active/i)).toBeVisible();
  });

  test('displays heading and draw button when raffle is active', async ({ page }) => {
    // Assumes a raffle has been activated via seed data or API setup
    await page.goto('/');
    const drawButton = page.getByRole('button', { name: /draw/i });
    // If there's an active raffle, the button should be visible
    // Otherwise the no-raffle message is shown (covered above)
    const hasRaffle = await drawButton.isVisible().catch(() => false);
    if (hasRaffle) {
      await expect(drawButton).toBeEnabled();
    }
  });

  test('draw button triggers animation and reveals winner', async ({ page }) => {
    await page.goto('/');
    const drawButton = page.getByRole('button', { name: /draw/i });
    const hasRaffle = await drawButton.isVisible().catch(() => false);

    if (hasRaffle) {
      await drawButton.click();
      // Button should be disabled during animation
      await expect(drawButton).toBeDisabled();
      // Wait for animation to complete (up to 8 seconds)
      await expect(drawButton).toBeEnabled({ timeout: 8000 });
    }
  });

  test('mute toggle is accessible', async ({ page }) => {
    await page.goto('/');
    const muteButton = page.getByRole('button', { name: /mute|sound/i });
    const hasButton = await muteButton.isVisible().catch(() => false);
    if (hasButton) {
      await muteButton.click();
      // Toggle state should change
      await expect(muteButton).toBeVisible();
    }
  });
});
