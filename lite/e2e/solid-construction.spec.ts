import { expect, test, type Page } from '@playwright/test';

const ids = ['M-GEO-07', 'M-GEO-3D-PROP-NAME', 'M-GEO-08', 'M-GEO-PYRAMID-ID', 'M-GEO-PYRAMID-PROP',
  'M-GEO-18', 'M-GEO-RECTPRISM-ID', 'M-GEO-RECTPRISM-PROP', 'M-GEO-15'] as const;
type Id = typeof ids[number];
type Cell = [x: number, y: number, z: number];
const btn = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const board = (page: Page) => page.locator('.solid-construction-reference, .solid-naming-board, .solid-workshop');
const task = (page: Page) => page.locator('.exp-task');
const feedback = (page: Page) => page.locator('.exp-feedback');
const debug = (page: Page) => page.evaluate(() => JSON.parse(window.render_game_to_text!()));
const saved = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[]}'));
const blockLabel = ([x,y,z]: Cell) => `Kerros ${y + 1}, sarake ${x + 1}, rivi ${z + 1}`;
async function open(page: Page, id: Id, seed = 1) {
  await page.goto(`./?qa=1&full=1&seed=${seed}#saaristo/${id}`);
  await btn(page, 'Kokeilen itse').click();
  await expect(board(page)).toBeVisible();
}
async function cellsFromVisiblePlan(page: Page): Promise<Cell[]> {
  const images = await board(page).getByRole('img', { name: /^Mallin kerros/ }).all();
  const cells: Cell[] = [];
  for (const [layer, image] of images.entries()) {
    const plan = await image.getAttribute('aria-label');
    for (const [, col, row] of plan!.matchAll(/sarake (\d+), rivi (\d+)/g)) cells.push([Number(col) - 1, layer, Number(row) - 1]);
  }
  expect(cells.length).toBeGreaterThan(1);
  return cells;
}
async function build(page: Page, cells: Cell[], keyboard = false) {
  for (const cell of cells) {
    const button = btn(page, blockLabel(cell));
    if (keyboard) await button.press('Space');
    else await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  }
}
async function answer(page: Page, ok: boolean) {
  await btn(page, 'Tarkista').click();
  await expect(feedback(page)).toHaveAttribute('data-ok', String(ok));
}
async function naming(page: Page, wrong = false) {
  const drawings = await board(page).getByRole('img', { name: /^Malli/ }).all();
  expect(drawings).toHaveLength(2);
  for (const [i, diagram] of drawings.entries()) {
    const observed = await diagram.evaluate(svg => {
      const lead = [...svg.querySelectorAll('path[stroke="#9c4a18"]')].find(path => path.nextElementSibling?.tagName.toLowerCase() === 'text')!;
      return { mark: lead.nextElementSibling!.textContent!, kind: lead.previousElementSibling!.tagName.toLowerCase() };
    });
    const label = i === 0 ? 'Tasokuvio' : 'Kappale';
    await task(page).getByRole('combobox', { name: `${label}: merkki` }).selectOption(observed.mark);
    const term = i === 0 ? 'SIVUN.' : wrong ? 'Oma lauseeni näkyy tässä kentässä' : observed.kind === 'polygon' ? 'tahkon' : 'särmää';
    await task(page).getByRole('textbox', { name: `${label}: oma termi` }).fill(term);
  }
}
test.use({ launchOptions: { args: ['--enable-unsafe-swiftshader'] } });

test.describe('Tarkka 2D-varanäkymä', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(original, this, [type, ...args]);
      } as typeof original;
    });
  });

  test('rejects matching front silhouette with wrong depth, recovers and builds the transfer', async ({ page }) => {
    await open(page, 'M-GEO-07', 0);
    expect((await debug(page)).renderer).toBe('painted-fallback');
    const expected = await cellsFromVisiblePlan(page);
    await btn(page, 'Edestä').click();
    await expect(board(page).getByRole('img', { name: 'Mallin siluetti, edestä' })).toBeVisible();
    expect(await cellsFromVisiblePlan(page)).toEqual(expected);
    const [x, y, z] = expected[0]!;
    const wrongZ = [0, 1, 2].find(row => row !== z && !expected.some(([a,b,c]) => a === x && b === y && c === row));
    expect(wrongZ).toBeDefined();
    await build(page, [[x,y,wrongZ!], ...expected.slice(1)]);
    await answer(page, false);
    await expect(feedback(page)).toContainText('takarivi');
    await btn(page, 'Uusi kokeilu').click();
    await btn(page, 'Pieni vihje').click();
    await expect(page.locator('.exp-help')).toContainText('alimman kerroksen');
    await build(page, await cellsFromVisiblePlan(page), true);
    await answer(page, true);
    await btn(page, 'Toinen yhteinen kokeilu').click();
    await build(page, await cellsFromVisiblePlan(page));
    await answer(page, true);
    for (let i = 0; i < 3; i++) {
      await btn(page, i === 0 ? 'Kokeilen nyt itse' : 'Seuraava kokeilu').click();
      await build(page, await cellsFromVisiblePlan(page));
      await answer(page, true);
    }
    await btn(page, 'Kokeile uudessa tilanteessa').click();
    expect((await debug(page)).model.pose).toBe('horizontal');
    await build(page, await cellsFromVisiblePlan(page));
    await answer(page, true);
    expect((await saved(page)).attempts.at(-1)).toMatchObject({ phase: 'transfer', ok: true, help: [] });
  });

  test('requires both own names and saves only recognized vocabulary', async ({ page }) => {
    await open(page, 'M-GEO-08');
    await naming(page, true);
    await answer(page, false);
    const attempt = (await saved(page)).attempts.at(-1);
    expect(attempt.resp).not.toContain('Oma lauseeni');
    expect(JSON.parse(attempt.resp).entries).toMatchObject({ flat: { termKnown: 'sivu' }, solid: { termKnown: null } });
    await btn(page, 'Uusi kokeilu').click();
    await naming(page);
    await answer(page, true);
  });

  for (const [name, viewport] of [
    ['desktop', { width: 1366, height: 768 }], ['tablet', { width: 768, height: 1024 }],
  ] as const) {
    test(`all eighteen complete response layouts fit ${name}`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const id of ids) {
        const tags = new Set<string>();
        for (const seed of [0,1]) {
          await open(page,id,seed);
          tags.add((await debug(page)).family);
          await expect(page.locator('.exp-instruction'),id).toBeInViewport({ ratio: 1 });
          await expect(board(page),id).toBeInViewport({ ratio: 1 });
          for (const input of await task(page).locator('button:visible,input:visible,select:visible').all()) {
            await expect(input,id).toBeInViewport({ ratio: 1 });
          }
          await expect(btn(page,'Tarkista'),id).toBeInViewport({ ratio: 1 });
          expect(await page.evaluate(() => window.scrollY),id).toBe(0);
          if (seed === 1 && (id === 'M-GEO-07' || id === 'M-GEO-08' || id === 'M-GEO-18')) {
            const filename = `solid-${id}-${name}.png`, path = testInfo.outputPath(filename);
            await page.screenshot({ path });
            await testInfo.attach(filename, { path, contentType: 'image/png' });
          }
        }
        expect(tags.size,id).toBe(2);
      }
      expect(errors).toEqual([]);
    });
  }
});

test('changes actual WebGL2 blocks and view without recording an attempt', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await open(page, 'M-GEO-07', 1);
  await expect.poll(async () => (await debug(page)).renderer).toBe('webgl');
  await expect.poll(async () => (await debug(page)).stage.kind).toBe('solid-construction');
  const cells = await cellsFromVisiblePlan(page);
  expect((await debug(page)).stage.boards[1].cells).toEqual([]);
  await build(page, cells);
  const drawn = (await debug(page)).stage;
  expect(drawn.boards[1].cells).toEqual(cells);
  expect(drawn.boards[0].cells).toHaveLength(cells.length);
  await btn(page,'Sivulta').click();
  const turned = (await debug(page)).stage;
  expect(turned.boards[1].rotation).not.toBe(drawn.boards[1].rotation);
  expect(turned.boards[1].cells).toEqual(cells);
  expect((await saved(page)).attempts).toEqual([]);
  await page.evaluate(() => window.advanceTime?.(100));
  const path = testInfo.outputPath('solid-blocks-webgl.png');
  await page.screenshot({ path });
  await testInfo.attach('solid-blocks-webgl', { path, contentType: 'image/png' });
  await answer(page, true);
  expect(errors).toEqual([]);
});
