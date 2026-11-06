import { expect, test, type Page } from '@playwright/test';
test.use({ contextOptions: { reducedMotion: 'reduce' }, launchOptions: { args: ['--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader'] } });
const state = (page: Page) => page.evaluate(() => JSON.parse(window.render_game_to_text!()));
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
async function onScreen(page: Page, names: string[]) {
  await page.evaluate(() => window.scrollTo(0, 0));
  for (const locator of [page.locator('.exp-exact'), ...names.map(name => page.getByLabel(name, { exact: true }))]) {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
    expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
}
async function decompose(page: Page, wrong: boolean) {
  const given = await page.locator('.exp-exact').innerText();
  const match = given.match(/Aloita arvosta (\d+), lisää (\d+) jokaisesta kohteesta(?: ja lisää (\d+), jos n on parillinen)?/)!;
  const offset = Number(match[1]), factor = Number(match[2]), bonus = Number(match[3] ?? 0);
  const actions = ['Lue kohteiden määrä', 'Käsittele yksi kohde jokaisella kierroksella', ...(bonus ? ['Tarkista parillisen määrän lisäehto'] : []), 'Lopeta ja näytä tulos'];
  if (wrong) [actions[0], actions[1]] = [actions[1]!, actions[0]!];
  for (const action of actions) await button(page, `Lisää: ${action}`).click();
  await page.getByLabel('Osan syöte', { exact: true }).selectOption('count');
  await page.getByLabel('Osan tulos', { exact: true }).selectOption('total');
  await page.getByLabel('Toiston pysähtymisehto', { exact: true }).selectOption('count');
  await button(page, 'Lukitse oma työ').click();
  await onScreen(page, ['Kokeen syöte n', 'Ennustettu tulos']);
  for (const n of [1, 0, -1]) {
    await page.getByLabel('Kokeen syöte n', { exact: true }).fill(String(n));
    if (n < 0) await page.getByLabel('Ennuste: ei lukua', { exact: true }).check();
    else await page.getByLabel('Ennustettu tulos', { exact: true }).fill(String(offset + factor * n + (n % 2 === 0 ? bonus : 0)));
    await button(page, 'Lukitse ennuste ja käynnistä koe').click();
    if (await button(page, 'Aja loppuun').isEnabled()) await button(page, 'Aja loppuun').click();
    await button(page, 'Kirjaa havainto').click();
    if (wrong && n === 1) await expect(page.locator('[data-algorithm-studio] ol')).toContainText('havainto invalid-program');
  }
  await button(page, 'Tarkista työ').click();
  expect((await state(page)).lastOk).toBe(!wrong);
}

test('the learner’s wrong decomposition really fails in the machine before a correct fresh recovery', async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('./?qa=1&seed=0#saaristo/M79-ALGTH-01');
  await button(page, 'Tutkitaan yhdessä').click(); expect((await state(page)).renderer).toBe('webgl');
  await decompose(page, true);
  await button(page, 'Uusi kokeilu').click(); await decompose(page, false);
  expect((await state(page)).progress.checked).toBe(false);
  await page.screenshot({ path: info.outputPath('own-decomposition-webgl.png') }); expect(errors).toEqual([]);
});

test('own rectangle research displays its model and records only the adult criteria, not the explanation', async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('./?qa=1&seed=0#saaristo/M79-TECH-01'); await button(page, 'Kokeilen itse').click();
  expect((await state(page)).renderer).toBe('webgl');
  const given = await page.locator('.exp-exact').innerText();
  const match = given.match(/puolipiiri on (\d+)/); expect(match).not.toBeNull(); const max = Number(match![1]);
  await page.getByLabel('Tutkimustyökalu', { exact: true }).selectOption('rectangle');
  await page.getByLabel('Ennuste parhaan kohdan x-arvosta', { exact: true }).fill('1'); await button(page, 'Lukitse oma työ').click();
  await onScreen(page, ['Tutkittava x']);
  for (let x = 1; x < max; x++) {
    await page.getByLabel('Tutkittava x', { exact: true }).fill(String(x)); await button(page, 'Laske ja kirjaa arvo').click();
    await expect(page.locator('[data-algorithm-studio] svg')).toHaveAttribute('aria-label', new RegExp(`Parametri ${x}`));
  }
  await page.getByLabel('Johtopäätöksen x', { exact: true }).fill(String(Math.ceil(max / 2)));
  await onScreen(page, ['Johtopäätöksen x', 'Oma perusteluni', 'Aikuinen vahvistaa havainnon', 'Selityksen tuki']);
  await button(page, 'Jatka kokeita').click();
  await expect(page.getByLabel('Tutkittava x', { exact: true })).toBeVisible();
  await page.getByLabel('Johtopäätöksen x', { exact: true }).fill(String(Math.floor(max / 2)));
  await button(page, 'Tarkista työ').click(); expect((await state(page)).lastOk).toBeUndefined();
  const privateText = 'algorithm-private-explanation-728';
  await page.getByLabel('Oma perusteluni', { exact: true }).fill(privateText);
  expect(await page.evaluate(() => window.render_game_to_text!())).not.toContain(privateText);
  await page.getByLabel('Aikuinen vahvistaa havainnon', { exact: true }).check();
  await page.getByLabel('Selityksen tuki', { exact: true }).selectOption('helped');
  await page.getByLabel('Kuvaa oman toimintatavan tai työkalun valinnan', { exact: true }).selectOption('met');
  await page.getByLabel('Perustelee havainnoilla, miten tulos tai muutos vastaa tehtävää', { exact: true }).selectOption('met');
  await page.getByLabel('Oma perusteluni', { exact: true }).fill('Vertailin kaikkien leveyksien pinta-aloja.');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: info.outputPath('own-research-tablet.png') });
  await button(page, 'Tarkista työ').click(); expect((await state(page)).lastOk).toBe(true);
  expect((await state(page)).progress.checked).toBe(false);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(privateText);
  expect(errors).toEqual([]);
});
