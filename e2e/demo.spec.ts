import { expect, test } from '@playwright/test';

const assertDemo = async (page, url) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (message) => {
    if(message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(String(error));
  });

  await page.goto(url, { waitUntil: 'networkidle' });

  await expect(page.locator('.store-locator-map')).toHaveClass(/leaflet-container/);
  await expect.poll(async () => {
    return await page.locator('.store-locator-map .leaflet-pane').count();
  }).toBeGreaterThan(0);

  await expect.poll(async () => {
    return await page.locator('.store-locator-map .leaflet-marker-icon, .store-locator-map .marker-cluster').count();
  }).toBeGreaterThan(0);

  await page.check('input[value="Wineshops"]');
  await expect(page.locator('input[value="Wineshops"]')).toBeChecked();

  await expect.poll(async () => {
    return await page.locator('.store-locator-map .leaflet-marker-icon, .store-locator-map .marker-cluster').count();
  }).toBeGreaterThan(0);

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
};

test('la démo vanilla charge la carte et les filtres', async ({ page }) => {
  await assertDemo(page, '/demo/vanilla/');
});

test('la démo react charge la carte et les filtres', async ({ page }) => {
  await assertDemo(page, '/demo/react/');
});
