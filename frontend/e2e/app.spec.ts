import { test, expect } from '@playwright/test';

test.describe('Event listing', () => {
  test('shows empty state when no events', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Upcoming Events');
    await expect(page.locator('.empty')).toHaveText('No events scheduled');
  });
});

test.describe('Navigation', () => {
  test('header logo links to home', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.app-logo')).toHaveText('Ticket Booking');
  });
});

test.describe('404 handling', () => {
  test('event page with invalid id shows loading', async ({ page }) => {
    await page.goto('/events/invalid-id');
    await expect(page.locator('.loading')).toHaveText('Loading event...');
  });
});

test.describe('Checkout page', () => {
  test('renders reservation section', async ({ page }) => {
    await page.goto('/checkout/test-reservation-id?expiresAt=2026-07-01T20:00:00Z&eventId=test-event-id');
    await expect(page.locator('.page-title')).toHaveText('Complete Reservation');
  });

  test('shows countdown timer', async ({ page }) => {
    await page.goto('/checkout/test-id?expiresAt=2026-07-01T20:00:00Z&eventId=test-id');
    await expect(page.locator('.countdown')).toBeVisible();
  });
});
