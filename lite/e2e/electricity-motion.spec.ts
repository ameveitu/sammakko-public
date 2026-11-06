import { expect, test, type Page } from '@playwright/test';

test.use({ launchOptions: { args: ['--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader'] } });
const snapshot = (page: Page) => page.evaluate(() => JSON.parse(window.render_game_to_text!()));

test('observed generator animates automatically and respects pause and reduced motion', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./?qa=1&seed=0#saaristo/PHY79-GENERATION');
  await page.getByRole('button', { name: 'Tutkitaan yhdessä', exact: true }).click();
  expect((await snapshot(page)).model.given.moving).toBe(true);
  expect((await snapshot(page)).renderer).toBe('webgl');
  expect((await snapshot(page)).stage.rotorAngle).toBe(0);
  await page.getByRole('button', { name: 'Liikkeen energiansyöttö voi tuottaa sähköä', exact: true }).click();
  await page.getByRole('button', { name: 'Lukitse ennuste', exact: true }).click();
  await page.getByRole('button', { name: 'Virtuaalinen ohjain päälle', exact: true }).click();
  await page.getByRole('button', { name: 'Kytke virtuaalimalli päälle ja havainnoi', exact: true }).click();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(async () => (await snapshot(page)).stage.rotorAngle).toBeGreaterThan(0);

  await page.getByRole('button', { name: 'Pysäytä maiseman liike', exact: true }).click();
  const paused = (await snapshot(page)).stage.rotorAngle;
  await page.waitForTimeout(150);
  expect((await snapshot(page)).stage.rotorAngle).toBe(paused);
  await page.getByRole('button', { name: 'Jatka maiseman liikettä', exact: true }).click();
  await expect.poll(async () => (await snapshot(page)).stage.rotorAngle).toBeGreaterThan(paused);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(async () => (await snapshot(page)).paused).toBe(true);
  const reduced = (await snapshot(page)).stage.rotorAngle;
  await page.waitForTimeout(150);
  expect((await snapshot(page)).stage.rotorAngle).toBe(reduced);
  await expect(page.getByRole('button', { name: 'Laitteen asetus vähentää maiseman liikettä' })).toBeDisabled();
  expect((await snapshot(page)).model.outcome).toBeDefined();
  expect(errors).toEqual([]);
});
