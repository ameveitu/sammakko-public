import { expect, test, type Page } from '@playwright/test';

const ids = ['M-MEAS-07', 'M-MEAS-10', 'M-MEAS-11', 'M-MEAS-12', 'M-MEAS-13', 'M-MEAS-14', 'M-MEAS-15', 'M-MEAS-16', 'M-UNIT-06'] as const;
type Id = typeof ids[number];
type Snapshot = { node: Id; family: string; phase: string; renderer: string; model: Record<string, unknown> | null;
  stage: { details: Record<string, unknown> }; progress: { checked: boolean }; contentContext: { skills: string[] } };
const shot = (page: Page): Promise<Snapshot> => page.evaluate(() => JSON.parse(
  (window as Window & { render_game_to_text: () => string }).render_game_to_text()));
const saved = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[],"events":[]}'));
const button = (page: Page, name: string | RegExp) => page.getByRole('button', { name, exact: true });
const input = (page: Page, name: string) => page.getByRole('textbox', { name, exact: true });
const menu = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true });
const board = (page: Page) => page.locator('[data-measure-workbench]');
const givens = (page: Page) => page.locator('[data-measure-givens]');
const submit = (page: Page) => button(page, 'Tarkista mittalappu');

async function open(page: Page, id: Id, seed = 7) {
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await button(page, 'Kokeilen itse').click();
  await expect(board(page)).toBeVisible();
  expect((await shot(page)).contentContext.skills.length).toBeGreaterThan(0);
}
async function check(page: Page, ok: boolean) {
  await submit(page).click();
  await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', String(ok));
}
async function reading(page: Page, label: string, value: string | number, unit: string) {
  await input(page, label).fill(String(value));
  await menu(page, `${label}, yksikkö`).selectOption(unit);
}
async function massReading(page: Page) {
  const art = await page.locator('[data-measure-scale] svg').getAttribute('aria-label');
  const [, value, unit] = /lukema ([\d,]+) (kg|g)/.exec(art!)!;
  await reading(page, 'Punnittu massa', value!, unit!);
  return [value, unit];
}
async function calibrate(page: Page) {
  if (await button(page, 'Aseta astia').isVisible()) {
    await button(page, 'Aseta astia').press('Enter');
    await button(page, 'Taaraa astia').press('Space');
  } else await button(page, 'Nollaa tyhjä vaaka').press('Enter');
  await expect(page.locator('[data-measure-scale] svg')).toHaveAttribute('aria-label', /lukema 0 (g|kg)\./);
  await button(page, 'Aseta kohde').press('Enter');
}
async function fillTarget(page: Page, eye = 'level') {
  const [, amount, unit] = /Tavoite ([\d,]+) (dl|l)/.exec(await givens(page).innerText())!;
  const empty = await page.locator('[data-measure-vessel] svg').getAttribute('aria-label') === 'Asteikoitu astia on tyhjä.';
  const adjust = button(page, empty ? /^Kaada / : /^Poista /);
  const part = +(/([\d,]+) (?:dl|l)/.exec(await adjust.innerText())![1]!.replace(',', '.'));
  const target = +amount!.replace(',', '.');
  const capacity = unit === 'dl' ? 6 : 1.2;
  for (let i = 0; i < Math.round((empty ? target : capacity - target) / part); i++) await adjust.press('Space');
  await menu(page, 'Silmän paikka').selectOption(eye);
  await menu(page, 'Vedenpinnan lukukohta').selectOption('bottom');
  await reading(page, 'Asteikon nestemäärä', amount!, unit!);
}
async function takeEstimate(page: Page, wrong = false) {
  const art = page.locator('[data-measure-estimate]');
  await expect(art).toHaveAttribute('data-measure-estimate', 'rough');
  await expect(art.locator('svg')).not.toHaveAttribute('aria-label', /Mittanauhan osoitin/);
  await expect(button(page, 'Aseta mittanauha')).toBeDisabled();
  await expect(input(page, 'Mitattu pituus')).toBeHidden();
  const svgRectangles = await art.locator('rect').evaluateAll(rects => rects.map(rect => Number(rect.getAttribute('width'))));
  const reference = +(/([\d,]+) cm/.exec(await givens(page).innerText())![1]!.replace(',', '.'));
  const rough = wrong ? 1 : Math.round(reference * svgRectangles[1]! / svgRectangles[0]!);
  await reading(page, 'Arvio', rough, 'cm');
  await button(page, 'Lukitse arvio').press('Enter');
  await expect(art).toHaveAttribute('data-measure-estimate', 'locked');
  await expect(input(page, 'Arvio')).toBeDisabled();
  await expect(input(page, 'Mitattu pituus')).toBeHidden();
  await button(page, 'Aseta mittanauha').press('Enter');
  const actual = +(/([\d,]+) cm/.exec((await art.locator('svg').getAttribute('aria-label'))!)![1]!.replace(',', '.'));
  await reading(page, 'Mitattu pituus', actual, 'cm');
  await menu(page, 'Arvion suhde mittaan').selectOption(rough < actual ? 'smaller' : rough > actual ? 'larger' : 'same');
}

test.describe('Jokilaakson mittapaja, tarkka paneeli', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
  });

  test('requires calibration before loading, then accepts a fresh guided measurement', async ({ page }) => {
    await open(page, 'M-MEAS-07');
    await button(page, 'Aseta kohde').click();
    await massReading(page);
    await check(page, false);
    expect((await saved(page)).events).toHaveLength(0);
    await button(page, 'Näytä ja selitä').click();
    await button(page, 'Uusi yhteinen kokeilu').click();
    await calibrate(page);
    await massReading(page);
    await check(page, true);
    expect((await saved(page)).attempts[1]).toMatchObject({ ok: true, phase: 'guided' });
  });

  test('uses a different kg scale after three correct fresh weighings across families', async ({ page }) => {
    await open(page, 'M-MEAS-07');
    const families = new Set<string>();
    for (let i = 0; i < 3; i++) {
      families.add((await shot(page)).family);
      await calibrate(page);
      await massReading(page);
      await check(page, true);
      if (i < 2) await button(page, 'Seuraava kokeilu').click();
    }
    expect(families.size).toBe(2);
    expect((await saved(page)).events).toHaveLength(0);
    await button(page, 'Kokeile uudessa tilanteessa').click();
    expect((await shot(page)).phase).toBe('transfer');
    await calibrate(page);
    const [, unit] = await massReading(page);
    expect(unit).toBe('kg');
    await check(page, true);
    expect((await shot(page)).progress.checked).toBe(true);
    expect((await saved(page)).events).toEqual([expect.objectContaining({ node: 'M-MEAS-07', assisted: false })]);
  });

  test('rejects a matching liquid number read from above and transfers to a flared scale', async ({ page }) => {
    await open(page, 'M-MEAS-10');
    await fillTarget(page, 'above');
    await check(page, false);
    await button(page, 'Uusi kokeilu').click();
    for (let i = 0; i < 3; i++) {
      await fillTarget(page);
      await check(page, true);
      if (i < 2) await button(page, 'Seuraava kokeilu').click();
    }
    await button(page, 'Kokeile uudessa tilanteessa').click();
    await expect(page.locator('[data-measure-vessel]')).toHaveAttribute('data-measure-vessel', 'flared');
    await fillTarget(page);
    await check(page, true);
  });

  test('locks an estimate before revealing the length, and a wrong estimate needs a fresh try', async ({ page }) => {
    await open(page, 'M-MEAS-11');
    await takeEstimate(page, true);
    await check(page, false);
    await button(page, 'Uusi kokeilu').click();
    await takeEstimate(page);
    await check(page, true);
  });

  test('pairs an instrument with its measured property and preserves the amount when choosing a compact unit', async ({ page }) => {
    await open(page, 'M-MEAS-12', 1);
    const mass = (await shot(page)).contentContext.skills.includes('M-MEAS-05');
    const [, maximum, resolution] = /vähintään arvoon (\d+) [a-z]+ ja asteikkoväli saa olla enintään (\d+)/.exec(await givens(page).innerText())!;
    const selected = mass ? (Number(maximum) <= 1000 && Number(resolution) < 50 ? 'scale' : 'platform') :
      (Number(maximum) <= 300 && Number(resolution) < 10 ? 'ruler' : 'tape');
    await menu(page, 'Mittaväline').selectOption(selected);
    await menu(page, 'Mitä väline vertaa?').selectOption(mass ? 'mass' : 'distance');
    await check(page, true);
    await open(page, 'M-MEAS-13', 7);
    const [, value, oldUnit] = /lukema on ([\d,]+) (cm|m)/.exec(await givens(page).innerText())!;
    const amount = +value!.replace(',', '.');
    await reading(page, 'Mittalapun määrä', Math.round(amount * (oldUnit === 'm' ? 100 : .01)), oldUnit === 'm' ? 'cm' : 'm');
    await check(page, true);
  });

  test('reports only the visible scale precision and recognizes a plausibility interval', async ({ page }) => {
    await open(page, 'M-MEAS-14', 1);
    const scale = (await board(page).locator('svg').getAttribute('aria-label'))!;
    const [, numbers] = /Viivat ([\d, ·]+) cm/.exec(scale)!;
    const first = Number(numbers!.split(' · ')[1]!.replace(',', '.'));
    const interval = /viivojen ([\d,]+) ja ([\d,]+) cm välissä, ([^.]*)/.exec(scale);
    const nearest = interval ? interval[3] === 'lähempänä alempaa' ? interval[1]! : interval[2]! : /viivalla ([\d,]+) cm/.exec(scale)![1]!;
    await reading(page, 'Asteikkoväli', first, 'cm');
    await menu(page, 'Osoittimen kohta').selectOption(interval ? 'between' : 'on');
    await reading(page, 'Lähimmän viivan lukema', nearest, 'cm');
    await check(page, true);
    await open(page, 'M-MEAS-15');
    const proposal = +(/Loikan lappu: ([\d,]+) kg/.exec(await board(page).innerText())![1]!.replace(',', '.')) * 1000;
    const [, low, high] = /(\d+)–(\d+) g/.exec(await board(page).innerText())!;
    await menu(page, 'Vertailun perustelu').selectOption(proposal > Number(high) ? 'too-large' : proposal < Number(low) ? 'too-small' : 'fits');
    await reading(page, 'Uskottava määrä', low!, 'g');
    await check(page, true);
  });

  test('requires fresh ruler and piece layouts even when the previous results match', async ({ page }) => {
    await open(page, 'M-MEAS-16');
    for (let round = 0; round < 4; round++) {
      await expect(submit(page)).toBeDisabled();
      await button(page, 'Aseta mittanauha').press('Enter');
      await expect(submit(page)).toBeDisabled();
      const art = page.locator('[data-measure-recheck] svg');
      const [, low, high] = /päätepisteet (\d+) ja (\d+) cm/.exec((await art.getAttribute('aria-label'))!)!;
      const length = Number(high) - Number(low);
      const [, unit] = /mittapala on (\d+) cm/.exec(await givens(page).innerText())!;
      for (let i = 0; i < length / Number(unit); i++) await button(page, 'Lisää mittapala').press('Enter');
      await expect(art).toHaveAttribute('aria-label', /rivi on kohteen mittainen/);
      await reading(page, 'Mittanauhan havainto', length, 'cm');
      const family = (await shot(page)).family;
      await menu(page, 'Mitä aiemmin tapahtui?').selectOption(family.includes('origin') ? 'origin' : family.includes('gap') ? 'gaps' : 'none');
      await reading(page, 'Tarkistettu pituus', length, 'cm');
      await check(page, true);
      if (round < 2) await button(page, 'Seuraava kokeilu').click();
      if (round === 2) await button(page, 'Kokeile uudessa tilanteessa').click();
    }
    expect((await shot(page)).progress.checked).toBe(true);
  });

  test('fills matching cubic-decimetre volumes, including a multi-litre transfer', async ({ page }) => {
    await open(page, 'M-UNIT-06');
    for (let round = 0; round < 4; round++) {
      const art = page.locator('[data-measure-cubes] svg');
      const initial = (await art.getAttribute('aria-label'))!;
      const shownCubes = Number(/^(\d+) samanlaista/.exec(initial)![1]);
      const amount = shownCubes || Number(/Kannussa on (\d+) litraa/.exec(await givens(page).innerText())![1]);
      const pour = button(page, /^Kaada \d+ dl$/);
      const portion = Number(/(\d+) dl/.exec(await pour.innerText())![1]);
      for (let i = 0; i < amount * 10 / portion; i++) {
        await pour.press('Space');
        if (i === 0) await expect(art).toHaveAttribute('aria-label', new RegExp(`Kaadettu ${portion} dl`));
      }
      await expect(pour).toBeDisabled();
      await reading(page, 'Yhden kuution särmä', 10, 'cm');
      await input(page, 'Nestettä litroina').fill(String(amount));
      await input(page, 'Tilavuus kuutiodesimetreinä').fill(String(amount));
      await check(page, true);
      if (round < 2) await button(page, 'Seuraava kokeilu').click();
      if (round === 2) await button(page, 'Kokeile uudessa tilanteessa').click();
      if (round === 3) expect(amount).toBeGreaterThan(1);
    }
    expect((await shot(page)).progress.checked).toBe(true);
  });

  for (const [label, viewport] of [['desktop', { width: 1366, height: 768 }], ['tablet', { width: 768, height: 1024 }]] as const) {
    test(`both independent families fit ${label}`, async ({ page }, info) => {
      test.setTimeout(90_000);
      await page.setViewportSize(viewport);
      for (const id of ids) {
        const families = new Set<string>();
        for (const seed of [1, 7]) {
          await open(page, id, seed);
          families.add((await shot(page)).family);
          if (id === 'M-MEAS-11') await takeEstimate(page);
          const bounds = await page.evaluate(() => {
            const boxes = [...document.querySelectorAll('[data-measure-givens],[data-measure-workbench]')].map(node => node.getBoundingClientRect());
            return { top: Math.min(...boxes.map(r => r.top)), left: Math.min(...boxes.map(r => r.left)),
              bottom: Math.max(...boxes.map(r => r.bottom)), right: Math.max(...boxes.map(r => r.right)), scrollWidth: document.documentElement.scrollWidth };
          });
          const trace = `${id} ${seed} ${JSON.stringify(bounds)}`;
          expect(bounds.top, trace).toBeGreaterThanOrEqual(0);
          expect(bounds.left, trace).toBeGreaterThanOrEqual(0);
          expect(bounds.right, trace).toBeLessThanOrEqual(viewport.width);
          expect(bounds.bottom, trace).toBeLessThanOrEqual(viewport.height);
          expect(bounds.scrollWidth, trace).toBeLessThanOrEqual(viewport.width);
        }
        expect(families.size, id).toBe(2);
        if (['M-MEAS-10', 'M-MEAS-11', 'M-MEAS-16'].includes(id)) await page.screenshot({ path: info.outputPath(`${id}-${label}.png`) });
      }
    });
  }
});
