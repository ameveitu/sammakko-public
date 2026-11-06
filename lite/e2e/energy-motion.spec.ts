import { expect, test, type Page } from '@playwright/test';
test.use({ contextOptions: { reducedMotion: 'reduce' }, launchOptions: { args: ['--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader'] } });
const state = (page: Page) => page.evaluate(() => JSON.parse(window.render_game_to_text!()));

test('observing the energy experiment starts its clock and respects pause and reduced motion', async ({ page }) => {
  test.setTimeout(60_000); // Software WebGL renders the original Saaristo as well as the apparatus.
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('./?qa=1&seed=0#saaristo/PHY79-KINETIC');
  await page.getByRole('button', { name: 'Tutkitaan yhdessä', exact: true }).click();
  const initial = await state(page), g = initial.model.given;
  expect(initial.renderer).toBe('webgl'); expect(initial.stage.elapsed).toBe(0);
  expect(initial.model.outcome).toBeUndefined();
  await page.getByLabel('Alun liike-energia (J)', { exact: true }).fill(String(g.mass * g.speed ** 2 / 2));
  await page.getByLabel('Muutoksen jälkeinen liike-energia (J)', { exact: true }).fill(String(g.targetMass * g.targetSpeed ** 2 / 2));
  await page.getByRole('button', { name: 'Lukitse ennuste', exact: true }).click();
  await page.getByLabel('Mallin Massa kg', { exact: true }).fill(String(g.targetMass));
  await page.getByLabel('Mallin Nopeus m/s', { exact: true }).fill(String(g.targetSpeed));
  await page.getByRole('button', { name: 'Toteuta muutos mallissa', exact: true }).click();
  await page.getByRole('button', { name: 'Näytä mallihavainto', exact: true }).click();
  expect((await state(page)).stage.elapsed).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(async () => (await state(page)).stage.elapsed).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Pysäytä maiseman liike', exact: true }).click();
  const paused = (await state(page)).stage.elapsed;
  await page.waitForTimeout(150); expect((await state(page)).stage.elapsed).toBe(paused);
  await page.getByRole('button', { name: 'Jatka maiseman liikettä', exact: true }).click();
  await expect.poll(async () => (await state(page)).stage.elapsed).toBeGreaterThan(paused);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(async () => (await state(page)).paused).toBe(true);
  const calm = (await state(page)).stage.elapsed;
  await page.waitForTimeout(150); expect((await state(page)).stage.elapsed).toBe(calm);
  await expect(page.getByRole('button', { name: 'Laitteen asetus vähentää maiseman liikettä', exact: true })).toBeDisabled();
  expect((await state(page)).model.outcome).toBeDefined(); expect(errors).toEqual([]);
});
