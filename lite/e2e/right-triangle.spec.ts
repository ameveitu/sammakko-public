import { expect, test, type Page } from '@playwright/test';
import { rightTriangleSpecs } from '../src/content/right-triangle';
import { rng } from '../src/engine/rng';

test.use({
  launchOptions: { args: ['--enable-unsafe-swiftshader'] }, reducedMotion: 'reduce',
  trace: 'off', screenshot: 'only-on-failure',
});

type State = {
  renderer: string; phase: string; lastOk?: boolean;
  progress: { checked: boolean };
  stage: { mode?: string; markedFocus?: boolean; guideSegments?: number; revealed?: boolean };
  model?: { vertices?: unknown };
};
const state = (page: Page): Promise<State> => page.evaluate(() => JSON.parse(window.render_game_to_text!()));
const exact = (page: Page) => page.locator('.exp-exact');
const task = (page: Page) => page.locator('[data-right-triangle]');
const btn = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
async function fallback(page: Page) {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      return /^webgl/.test(type) ? null : Reflect.apply(get, this, [type, ...args]);
    } as typeof get;
  });
}
async function start(page: Page, id: string, seed: number, independent = false) {
  if (page.url() !== 'about:blank') await page.goto('about:blank');
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await btn(page, independent ? 'Kokeilen itse' : 'Tutkitaan yhdessä').click();
  await expect(task(page)).toBeVisible();
}
const select = (page: Page, field: string, value: string) => page.getByLabel(field, { exact: true }).selectOption(value);
const side = (page: Page, field: string, label: string) =>
  page.getByLabel(field, { exact: true }).selectOption({ label });
async function given(page: Page, board = 0) {
  const caption = await exact(page).locator('figcaption').nth(board).innerText();
  const measures = [...caption.matchAll(/\b([A-Z]{2}) (\d+(?:,\d+)?) (cm|m)\b/g)].map(([_, key, value]) =>
    [key!, Number(value!.replace(',', '.'))] as const);
  return {
    right: caption.match(/Suora kulma pisteessä ([A-Z])/)?.[1],
    focus: caption.match(/Tarkastelukulma pisteessä ([A-Z])/)?.[1],
    degrees: Number(caption.match(/pisteessä [A-Z], (\d+)°/)?.[1]),
    target: caption.match(/Tuntematon ([A-Z]{2})/)?.[1],
    measures,
  };
}
async function pyth(page: Page, wrong = false) {
  const board = await given(page);
  expect(board.target).toBeTruthy();
  expect(board.measures).toHaveLength(2);
  const unknownLongest = !board.target!.includes(board.right!);
  const [first, second] = [...board.measures].sort((a, b) => b[1] - a[1]) as [readonly [string, number], readonly [string, number]];
  const square = first[1] ** 2 + (unknownLongest ? 1 : -1) * second[1] ** 2;
  await side(page, '1. tunnettu sivu', first[0]);
  await side(page, '2. tunnettu sivu', second[0]);
  await select(page, 'Laskutoimitus', unknownLongest ? 'sqrt-sum' : 'sqrt-difference');
  await page.getByLabel('Tuntemattoman neliö', { exact: true }).fill(String(square));
  await page.getByLabel('Pituus (m)', { exact: true }).fill(wrong ? String(square) : `√${square}`);
  await btn(page, 'Valmis').click();
}
async function readPythTarget(page: Page) {
  const board = await given(page);
  return board.target!.includes(board.right!) ? 'leg' : 'hypotenuse';
}
async function trigonometric(page: Page, id: 'M79-TRIG-SIDE' | 'M79-TRIG-ANGLE') {
  const board = await given(page);
  if (id === 'M79-TRIG-SIDE') {
    const [entry] = board.measures;
    const targetIsOpposite = !board.target!.includes(board.focus!);
    const pair = targetIsOpposite ? [board.target!, entry![0]] : [entry![0], board.target!];
    const tangent = Math.sin(board.degrees * Math.PI / 180) / Math.cos(board.degrees * Math.PI / 180);
    const answer = targetIsOpposite ? entry![1] * tangent : entry![1] / tangent;
    await select(page, 'Suhdefunktio', 'tan');
    await side(page, 'Osoittajan sivu', pair[0]!);
    await side(page, 'Nimittäjän sivu', pair[1]!);
    await select(page, 'Laskutoimitus', targetIsOpposite ? 'times' : 'divide');
    await expect(task(page).locator('output').last()).toContainText('→');
    await page.getByLabel('Pituus (m)', { exact: true }).fill(answer.toFixed(1).replace('.', ','));
  } else {
    const [hypotenuse, adjacent] = [...board.measures].sort((a, b) => b[1] - a[1]);
    const opposite = Math.sqrt(hypotenuse![1] ** 2 - adjacent![1] ** 2);
    const degrees = Math.atan2(opposite, adjacent![1]) * 180 / Math.PI;
    await select(page, 'Suhdefunktio', 'cos');
    await side(page, 'Osoittajan sivu', adjacent![0]);
    await side(page, 'Nimittäjän sivu', hypotenuse![0]);
    await select(page, 'Laskutoimitus', 'inverse');
    await expect(task(page).locator('output').last()).toContainText('cos⁻¹');
    await page.getByLabel('Kulma (°)', { exact: true }).fill(degrees.toFixed(1));
  }
  await btn(page, 'Valmis').click();
}
const results = (page: Page, ok: boolean) => expect.poll(async () => (await state(page)).lastOk).toBe(ok);

test('own WebGL rope equation rejects a forgotten square root and recovers with a hint', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1366, height: 768 });
  const errors: Error[] = [];
  page.on('pageerror', error => errors.push(error));
  await start(page, 'M79-PYTH-CALC', 4, true);
  await expect.poll(async () => (await state(page)).renderer).toBe('webgl');
  expect((await state(page)).stage).toMatchObject({ mode: 'rope', guideSegments: 3, revealed: false });
  expect((await state(page)).model?.vertices).toBeUndefined();
  await pyth(page, true);
  await results(page, false);
  await expect(page.locator('.exp-feedback')).toContainText('positiivinen neliöjuuri');
  await btn(page, 'Uusi kokeilu').click();
  await btn(page, 'Pieni vihje').click();
  await pyth(page);
  await results(page, true);
  expect((await state(page)).stage.revealed).toBe(true);
  const attempt = await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3')!).attempts.at(-1));
  expect(attempt.help).toContain('hint');
  expect(errors).toEqual([]);
});

test('three fresh Pythagoras measurements lead to a distinct leg transfer', async ({ page }) => {
  await fallback(page);
  await start(page, 'M79-PYTH-CALC', 2, true);
  const measurements = new Set<string>();
  for (let i = 0; i < 3; i++) {
    measurements.add(await exact(page).locator('figcaption').innerText());
    await pyth(page);
    await results(page, true);
    await btn(page, i === 2 ? 'Kokeile uudessa tilanteessa' : 'Seuraava kokeilu').click();
  }
  expect((await state(page)).phase).toBe('transfer');
  expect(await readPythTarget(page)).toBe('leg');
  expect(measurements.size).toBe(3);
  await pyth(page);
  await results(page, true);
  expect((await state(page)).progress.checked).toBe(true);
});

for (const [id, renderer] of [['M79-TRIG-SIDE', 'webgl'], ['M79-TRIG-ANGLE', 'painted-fallback']] as const) {
  test(`${id} composes its own ratio equation and calculator result`, async ({ page }, testInfo) => {
    if (renderer === 'webgl') test.setTimeout(90_000);
    const errors: Error[] = [];
    page.on('pageerror', error => errors.push(error));
    if (renderer === 'painted-fallback') await fallback(page);
    await page.setViewportSize(renderer === 'webgl' ? { width: 1366, height: 768 } : { width: 768, height: 1024 });
    await start(page, id, 6);
    await expect.poll(async () => (await state(page)).renderer).toBe(renderer);
    if (renderer === 'webgl') expect((await state(page)).stage).toMatchObject({ mode: 'height', markedFocus: true });
    await page.getByText('Laskin asteina (DEG)', { exact: true }).click();
    await select(page, 'Laskimen toiminto', 'sin');
    await page.getByLabel('Laskimen luku tai osamäärä').fill('30');
    await btn(page, 'Laske').click();
    await expect(task(page).locator('details output')).toHaveText('0,5');
    await page.getByText('Laskin asteina (DEG)', { exact: true }).click();
    await page.screenshot({ path: testInfo.outputPath('workbench.png') });
    await trigonometric(page, id);
    await results(page, true);
    expect(errors).toEqual([]);
  });
}

test('integration requires all three produced relationships from the marked angle', async ({ page }) => {
  await fallback(page);
  const node = rightTriangleSpecs.find(spec => spec.id === 'M79-TRIG-01')!;
  const seed = Array.from({ length: 30 }, (_, i) => i).find(i => node.item(rng(i), 'guided').tag === 'measured-pairs')!;
  await start(page, node.id, seed);
  const board = await given(page);
  const lengths = new Map(board.measures);
  const names = new Set<string>();
  for (let row = 1; row <= 3; row++) {
    const label = await task(page).locator('legend').nth(row - 1).innerText();
    const [, focus, first, second] = label.match(/∠([A-Z]) · ([A-Z]{2}) ja ([A-Z]{2})/)!;
    const pair = [first!, second!];
    const hypotenuse = pair.find(key => !key.includes(board.right!));
    const opposite = pair.find(key => !key.includes(focus!));
    const ratio = hypotenuse ? opposite ? 'sin' : 'cos' : 'tan';
    const numerator = opposite ?? pair.find(key => key !== hypotenuse)!;
    const denominator = hypotenuse ?? pair.find(key => key !== numerator)!;
    const prefix = `Rivi ${row}: `;
    names.add(ratio);
    await select(page, prefix + 'Suhdefunktio', ratio);
    await side(page, prefix + 'Osoittajan sivu', numerator);
    await side(page, prefix + 'Nimittäjän sivu', denominator);
    await page.getByLabel(prefix + 'Suhteen arvo', { exact: true }).fill(`${lengths.get(numerator)! * 2}/${lengths.get(denominator)! * 2}`);
  }
  expect([...names].sort()).toEqual(['cos','sin','tan']);
  await btn(page, 'Valmis').click();
  await results(page, true);
});

for (const [width, height] of [[1366,768],[768,1024]]) {
  test(`all 20 authored right-triangle family views keep essential controls visible at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width: width!, height: height! });
    await fallback(page);
    for (const node of rightTriangleSpecs) {
      const found = new Map<string, number>();
      for (let seed = 0; seed < 30 && found.size < 2; seed++) {
        const tag = node.item(rng(seed), 'guided').tag;
        if (!found.has(tag)) found.set(tag, seed);
      }
      expect(found.size).toBe(2);
      for (const [tag, seed] of found) {
        await start(page, node.id, seed);
        const required = [exact(page), btn(page, 'Valmis'), ...await task(page).locator('fieldset input, fieldset select').all()];
        for (const control of required) {
          const bounds = await control.boundingBox();
          const context = `${node.id}/${tag} ${await control.getAttribute('aria-label') ?? ''}`;
          expect(bounds, context).not.toBeNull();
          expect(bounds!.x, context).toBeGreaterThanOrEqual(0);
          expect(bounds!.y, context).toBeGreaterThanOrEqual(0);
          expect(bounds!.x + bounds!.width, context).toBeLessThanOrEqual(width! + 1);
          expect(bounds!.y + bounds!.height, context).toBeLessThanOrEqual(height!);
        }
      }
    }
  });
}
