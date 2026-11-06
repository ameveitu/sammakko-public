import { expect, test, type Page } from '@playwright/test';

type LabState = { mode: string; renderer: string; status: string; character: string; clip: string; time: number; duration: number; paused: boolean; view: string; bones: number; bounds: { minY: number; maxY: number } };
const state = (page: Page): Promise<LabState> => page.evaluate(() => JSON.parse(window.render_game_to_text!()));
const saved = (page: Page) => page.evaluate(() => Object.fromEntries(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)])));
async function ready(page: Page, character = 'aava') {
  await expect.poll(async () => ({ character: (await state(page)).character, status: (await state(page)).status }), { timeout: 30_000 }).toEqual({ character, status: 'ready' });
}
test.use({ launchOptions: { args: ['--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader'] } });
test.describe('character lab on WebGL2', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' }, viewport: { width: 1366, height: 900 } });
  test.setTimeout(90_000);
  test('rigs play and step without learning records; leap returns to its ground', async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', error => errors.push(String(error)));
    await page.goto('./#saaristo/hahmot'); await ready(page);
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
    const before = await saved(page);
    expect(await state(page)).toMatchObject({ mode: 'character-lab', renderer: 'webgl', paused: true, time: 0, bones: 9 });
    await page.getByRole('button', { name: 'Osoitus', exact: true }).click();
    await page.getByRole('button', { name: 'Etene ¼ sekuntia', exact: true }).focus(); await page.keyboard.press('Enter');
    expect(await state(page)).toMatchObject({ clip: 'point', paused: true, time: .25 });
    await page.getByRole('button', { name: 'Sivulta', exact: true }).click();
    expect(await state(page)).toMatchObject({ view: 'side', time: .25 });
    await page.getByRole('button', { name: 'Alkuasento', exact: true }).click(); expect((await state(page)).time).toBe(0);
    await page.getByRole('button', { name: 'Loikka', exact: true }).click(); await ready(page, 'loikka');
    const ground = (await state(page)).bounds.minY;
    await page.getByRole('button', { name: 'Hyppy', exact: true }).click();
    const duration = (await state(page)).duration;
    await page.evaluate(ms => window.advanceTime!(ms), duration * 500);
    expect((await state(page)).bounds.minY).toBeGreaterThan(ground + .4);
    await page.evaluate(ms => window.advanceTime!(ms), duration * 500);
    expect((await state(page)).bounds.minY).toBeCloseTo(ground, 2);
    await page.getByRole('button', { name: 'Viistosta', exact: true }).click();
    await page.screenshot({ path: test.info().outputPath('loikka-webgl.png') });
    await page.getByRole('button', { name: 'Sulka', exact: true }).click(); await ready(page, 'sulka');
    expect((await state(page)).bones).toBe(10);
    await page.getByRole('button', { name: 'Selittävä ele', exact: true }).click();
    await page.getByRole('button', { name: 'Etene ¼ sekuntia', exact: true }).click();
    expect(await state(page)).toMatchObject({ clip: 'gesture', time: .25, paused: true });
    await page.getByRole('button', { name: 'Nyökkäys', exact: true }).click();
    await page.getByRole('button', { name: 'Etene ¼ sekuntia', exact: true }).click();
    expect(await state(page)).toMatchObject({ clip: 'gentle-nod', time: .25 });
    await page.screenshot({ path: test.info().outputPath('sulka-webgl.png') });
    expect(await saved(page)).toEqual(before); expect(errors).toEqual([]);
  });
  test('leaving during a model load cannot append a late model to the next route', async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', error => errors.push(String(error)));
    let release: () => void = () => {}; const held = new Promise<void>(resolve => { release = resolve; });
    await page.route('**/models/characters/aava/aava.glb', async route => { await held; await route.continue().catch(() => {}); });
    await page.goto('./#saaristo/hahmot'); await expect(page.locator('.character-lab-status')).toContainText('Aava latautuu');
    await page.getByRole('link', { name: 'Takaisin Saaristoon' }).click();
    await expect(page.locator('.character-lab')).toHaveCount(0); release();
    await expect.poll(async () => (await state(page)).mode).not.toBe('character-lab');
    await page.evaluate(() => { location.hash = 'alueet'; });
    await expect(page.locator('.saaristo-canvas')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
  test('Sisi keeps a grounded, finite pose through every clip and four views', async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', error => errors.push(String(error)));
    await page.goto('./#saaristo/hahmot'); await ready(page);
    const before = await saved(page);
    await page.getByRole('button', { name: 'Sisi', exact: true }).click(); await ready(page, 'sisi');
    expect(await state(page)).toMatchObject({ renderer: 'webgl', character: 'sisi', bones: 18, paused: true, time: 0 });
    const ground = (await state(page)).bounds.minY;
    const standing = (await state(page)).bounds.maxY;
    for (const [name, clip] of [['Kävely', 'walk'], ['Tervehdys', 'greet'], ['Torkahdus', 'sleep'], ['Lepo', 'idle']]) {
      await page.getByRole('button', { name, exact: true }).click();
      const duration = (await state(page)).duration;
      expect(duration).toBeGreaterThan(0);
      for (let half = 0; half < 2; half++) {
        // Keep all twelve real Three.js skinning samples without twelve unrelated browser repaints.
        const frames: LabState[] = await page.evaluate(ms => Array.from({ length: 6 }, () => {
          window.advanceTime!(ms); return JSON.parse(window.render_game_to_text!());
        }), duration * 1000 / 12);
        for (const current of frames) {
          expect(current).toMatchObject({ clip, paused: true });
          expect(Number.isFinite(current.bounds.maxY)).toBe(true);
          expect(current.bounds.minY).toBeGreaterThan(ground - .005);
          expect(current.bounds.minY).toBeLessThan(ground + .015);
        }
        if (clip === 'sleep' && half === 0) {
          expect(frames.at(-1)!.bounds.maxY).toBeLessThan(standing - .1);
          await page.screenshot({ path: test.info().outputPath('sisi-sleep-webgl.png') });
        }
      }
    }
    for (const [label, view] of [['Edestä', 'front'], ['Takaa', 'back'], ['Sivulta', 'side'], ['Viistosta', 'three-quarter']]) {
      await page.getByRole('button', { name: label, exact: true }).click(); expect((await state(page)).view).toBe(view);
    }
    await page.getByRole('button', { name: 'Alkuasento', exact: true }).click();
    await page.screenshot({ path: test.info().outputPath('sisi-webgl.png') });
    await page.getByRole('button', { name: 'Etene ¼ sekuntia', exact: true }).focus(); await page.keyboard.press('Enter');
    expect((await state(page)).time).toBeCloseTo(.25, 4);
    expect(await saved(page)).toEqual(before); expect(errors).toEqual([]);
  });
  test('context loss leaves an honest still image and disables animation controls', async ({ page }) => {
    await page.goto('./#saaristo/hahmot'); await ready(page);
    await page.locator('.saaristo-canvas').evaluate(canvas => {
      (canvas as HTMLCanvasElement).getContext('webgl2')!.getExtension('WEBGL_lose_context')!.loseContext();
    });
    await expect(page.locator('.character-lab-poster')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Etene ¼ sekuntia' })).toBeDisabled();
    await expect(page.locator('.character-lab-status')).toContainText('3D-näkymä ei ole käytössä');
    expect((await state(page)).renderer).toBe('fallback');
  });
});
test.describe('character lab fallback', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(original, this, [type, ...args]);
      } as typeof original;
    });
  });
  test('poster, model choice and return work on tablet without WebGL', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('./#saaristo/hahmot');
    await expect(page.locator('.character-lab-status')).toContainText('3D-mallia ei saatu näkyviin');
    const before = await saved(page);
    await page.getByRole('button', { name: 'Sisi', exact: true }).click();
    await expect(page.locator('.character-lab-poster')).toHaveAttribute('alt', /Sisi/);
    await expect(page.locator('.character-lab-poster')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Torkahdus', exact: true })).toBeDisabled();
    expect(await saved(page)).toEqual(before);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('link', { name: 'Takaisin Saaristoon' }).click(); await expect(page.locator('.character-lab')).toHaveCount(0);
  });
  test('missing manifest offers a working exit and no perpetual spinner', async ({ page }) => {
    await page.route('**/models/characters/manifest.json', route => route.fulfill({ status: 404, body: '' }));
    await page.goto('./#saaristo/hahmot');
    await expect(page.locator('.character-lab-status')).toContainText('Hahmomalleja ei saatu ladattua');
    await page.getByRole('link', { name: 'Takaisin Saaristoon' }).click(); await expect(page.locator('.character-lab')).toHaveCount(0);
  });
});
