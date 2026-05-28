import { test } from '@playwright/test';

test('debug page content', async ({ page }) => {
  await page.goto('/');
  const html = await page.content();
  console.log(html);
});
