// Real-browser acceptance covers the initial loop, research, persistence, and pause.
import { test, expect } from '@playwright/test';

async function savedState(page) {
  await page.getByRole('button', { name: 'Save game', exact: true }).click();
  return page.evaluate(() =>
    JSON.parse(JSON.parse(localStorage.getItem('foundations.slot.1')).game),
  );
}

async function begin(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'New game', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
}

async function buildFirstCottage(page) {
  await page.getByRole('button', { name: 'Technology', exact: true }).click();
  await page.locator('[data-technology="masonry"]').click();
  await page.getByRole('button', { name: 'Build', exact: true }).click();
  await page.getByRole('button', { name: 'Build Cottage', exact: true }).click();
}

test('fresh settlement gathers, constructs, hires, assigns, and produces', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await begin(page);
  await expect(page.locator('#scene canvas')).toBeVisible();
  await buildFirstCottage(page);
  await expect(page.locator('#construction-status')).toContainText('Building:');
  await page.getByRole('button', { name: /Cut wood/ }).click();
  expect((await savedState(page)).resources.wood).toBe(91);
  await page.getByRole('button', { name: 'Workers', exact: true }).click();
  await page.getByRole('button', { name: 'Create Worker', exact: true }).click();
  await page.getByRole('button', { name: 'Assign Woodcutter', exact: true }).click();
  const customAmount = page.getByLabel('Assignment amount', { exact: true });
  await customAmount.fill('7');
  await page.waitForTimeout(1200);
  await expect(customAmount).toBeFocused();
  await expect(customAmount).toHaveValue('7');
  const before = await savedState(page);
  expect(before.workers).toEqual([{ id: 1, job: 'woodcutter', sick: false, sickSeconds: 0 }]);
  await expect
    .poll(async () => (await savedState(page)).resources.wood, { timeout: 6000 })
    .toBeGreaterThan(before.resources.wood);
  await page.getByRole('button', { name: '-All Woodcutter', exact: true }).click();
  await page.getByRole('button', { name: 'Assign Farmer', exact: true }).click();
  await expect(page.locator('#top-stats .resource-rate').first()).toHaveText('+0.10/s');
  await expect(page.locator('#simulation-status')).toHaveText('Running');
  await page.getByRole('button', { name: 'Resources', exact: true }).click();
  await expect(page.locator('.ledger-card').first()).toContainText('+0.20');
  await expect(page.locator('.ledger-card').first()).toContainText('−0.10');
  await expect(page.locator('.ledger-card').first()).toContainText('+0.10');
  await expect(page.locator('#construction-status')).toBeHidden({ timeout: 9000 });
  expect(errors).toEqual([]);
});

test('pause and main menu prevent production; reload preserves jobs without offline time', async ({
  page,
}) => {
  await begin(page);
  await buildFirstCottage(page);
  await page.getByRole('button', { name: 'Workers', exact: true }).click();
  await page.getByRole('button', { name: 'Create Worker', exact: true }).click();
  await page.getByRole('button', { name: 'Assign Miner', exact: true }).click();
  await page.getByRole('button', { name: 'Pause simulation', exact: true }).click();
  const paused = await savedState(page);
  await page.waitForTimeout(1300);
  expect(await savedState(page)).toEqual(paused);
  await page.getByRole('button', { name: 'Main menu', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.waitForTimeout(1300);
  await page.getByRole('button', { name: 'Load', exact: true }).click();
  await page.getByRole('button', { name: 'Pause simulation', exact: true }).click();
  expect(await savedState(page)).toEqual(paused);
});

test('invalid imports preserve a valid slot; technology exposes the full tree', async ({
  page,
}) => {
  await begin(page);
  const initial = await savedState(page);
  await page.getByRole('button', { name: 'Technology', exact: true }).click();
  await expect(page.locator('.tech-card')).toHaveCount(30);
  await expect(page.locator('[data-technology="masonry"]')).toBeEnabled();
  await expect(page.locator('[data-technology="construction"]')).toBeDisabled();
  await page.getByRole('button', { name: 'Main menu', exact: true }).click();
  await page.locator('#import-file').setInputFiles({
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":999}'),
  });
  await expect(page.locator('#menu-notice')).toContainText('Import failed');
  await page.getByRole('button', { name: 'Load', exact: true }).click();
  await page.getByRole('button', { name: 'Pause simulation', exact: true }).click();
  const after = await savedState(page);
  expect(after.resources).toEqual(initial.resources);
  expect(after.buildings).toEqual(initial.buildings);
});
