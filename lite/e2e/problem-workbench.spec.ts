import { expect, test, type Page } from '@playwright/test';

const ids = ['M-PS-01', 'M-PS-02', 'M-PS-03', 'M-PS-05', 'M-PS-06', 'M-REP-01', 'M-REP-02'] as const;
type Id = typeof ids[number];
type Snapshot = { node: Id; phase: string; family: string; seed: number; progress: { helped: boolean; checked: boolean } };
const shot = (page: Page): Promise<Snapshot> => page.evaluate(() =>
  JSON.parse((window as Window & { render_game_to_text: () => string }).render_game_to_text()));
const saved = (page: Page) => page.evaluate(() =>
  JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[],"events":[]}'));
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const menu = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true });
const givens = (page: Page) => page.locator('[data-problem-givens]');
const workbench = (page: Page) => page.locator('[data-problem-workbench]');
const feedback = (page: Page) => page.locator('.exp-feedback');
const integers = (value: string) => [...value.matchAll(/\d+/g)].map(match => Number(match[0]));

async function open(page: Page, id: Id, seed = 7) {
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await button(page, 'Kokeilen itse').click();
  await expect(workbench(page)).toBeVisible();
  await expect(givens(page)).toContainText('Tuttu työväline');
}

async function submit(page: Page, ok: boolean) {
  await button(page, 'Tarkista työpöytä').click();
  await expect(feedback(page)).toHaveAttribute('data-ok', String(ok));
}

async function addMarks(page: Page, name: string, count: number, keyboard = false) {
  const control = button(page, name);
  for (let i = 0; i < count; i++) {
    if (keyboard) await control.press('Space');
    else await control.click();
  }
}

async function firstTrial(page: Page) {
  const [target, base, scale] = integers(await givens(page).innerText());
  const [start] = integers(await workbench(page).locator('strong').first().innerText());
  const first = start! * scale! + base!;
  await addMarks(page, 'Ensimmäinen koe: lisää yksi', start!);
  await button(page, 'Mittaa ensimmäinen koe').click();
  await expect(page.locator('[data-problem-trial-measure]')).toContainText(String(first));
  return { first, target: target!, scale: scale! };
}

async function commitRange(page: Page) {
  const fields = await givens(page).locator('dd').allTextContents();
  const [a, b] = integers(fields[0]!);
  const [c, d] = fields.length === 1 ? [4, 6] : integers(fields[1]!);
  const bounds = b === undefined ? [a! * c!, a! * d!] : [a! + c!, b + d!];
  const range = menu(page, 'Arvioalue');
  const option = range.locator('option').filter({ hasText: `${bounds[0]}–${bounds[1]} ` });
  await range.selectOption({ label: (await option.innerText()).trim() });
  await button(page, 'Aseta arvioalue').click();
  const proposal = page.locator('[data-problem-estimate-proposal]');
  await expect(proposal).toBeVisible();
  const [value] = integers(await proposal.getByText('Loikan ehdotus:', { exact: false }).innerText());
  return { value: value!, bounds };
}

async function produceDrawing(page: Page, sameName = false) {
  const [a, b] = integers(await givens(page).locator('dd').first().innerText());
  const amounts = b === undefined ? [a! / 2, a! / 2] : [a!, b];
  for (const [i, count] of amounts.entries()) {
    await menu(page, `Mallin osa ${i + 1}`).selectOption(String(sameName ? 1 : i));
    await addMarks(page, `Mallin osa ${i + 1}: lisää yksi`, count!, true);
  }
}

test.describe('Selitysten telttakylän ongelmapaja', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
  });

  test('a trial exposes measured evidence, waits for a finding and rejects a mistaken finding even with the correct revision', async ({ page }) => {
    await open(page, 'M-PS-02');
    await expect(button(page, 'Mittaa ensimmäinen koe')).toBeDisabled();
    const { first, target, scale } = await firstTrial(page);
    await expect(button(page, 'Uusi koe: lisää yksi')).toBeHidden();
    await menu(page, 'Koehavainto').selectOption(first < target ? 'surplus' : 'short');
    await addMarks(page, `Uusi koe: ${first < target ? 'lisää' : 'poista'} yksi`, Math.abs(target - first) / scale);
    await expect(page.locator('[data-problem-trial-second]')).toContainText(String(target));
    await submit(page, false);
    expect((await saved(page)).events).toHaveLength(0);
    await button(page, 'Näytä ja selitä').click();
    await expect(feedback(page)).toContainText('Luonnoksesta saatiin');
    await button(page, 'Uusi yhteinen kokeilu').click();
    expect((await shot(page)).phase).toBe('guided');
    const corrected = await firstTrial(page);
    await menu(page, 'Koehavainto').selectOption(corrected.first < corrected.target ? 'short' : 'surplus');
    await addMarks(page, `Uusi koe: ${corrected.first < corrected.target ? 'lisää' : 'poista'} yksi`,
      Math.abs(corrected.target - corrected.first) / corrected.scale);
    await submit(page, true);
    expect((await shot(page)).progress.checked).toBe(false);
    expect((await saved(page)).attempts[1]).toMatchObject({ phase: 'guided', ok: true });
  });

  test('the proposal is absent until the estimate is fixed and changing the range clears the comparison', async ({ page }) => {
    await open(page, 'M-PS-05');
    await expect(page.getByText('Loikan ehdotus:', { exact: false })).toHaveCount(0);
    const { value, bounds } = await commitRange(page);
    await menu(page, 'Ehdotus verrattuna arvioon').selectOption('fits');
    await button(page, 'Muuta arvioaluetta').click();
    await expect(page.getByText('Loikan ehdotus:', { exact: false })).toHaveCount(0);
    await button(page, 'Aseta arvioalue').click();
    await expect(menu(page, 'Ehdotus verrattuna arvioon')).toHaveValue('');
    await menu(page, 'Ehdotus verrattuna arvioon').selectOption(value < bounds[0]! ? 'short' : value > bounds[1]! ? 'surplus' : 'fits');
    await submit(page, true);
  });

  test('a drawing made with keyboard needs correct named parts, fresh families and a square-model transfer', async ({ page }) => {
    await open(page, 'M-REP-02');
    await produceDrawing(page, true);
    await submit(page, false);
    await expect(feedback(page)).toContainText('oma nimetty mallin osa');
    await button(page, 'Uusi kokeilu').click();
    const families = new Set<string>(), seeds = new Set<number>();
    for (let i = 0; i < 3; i++) {
      const current = await shot(page);
      families.add(current.family);
      seeds.add(current.seed);
      await produceDrawing(page);
      await submit(page, true);
      if (i < 2) await button(page, 'Seuraava kokeilu').click();
    }
    expect(families).toEqual(new Set(['picture-equal-shares', 'picture-combine-parts']));
    expect(seeds.size).toBe(3);
    await button(page, 'Kokeile uudessa tilanteessa').click();
    expect((await shot(page)).phase).toBe('transfer');
    await expect(page.locator('.exp-instruction')).toContainText('ruutuja');
    await produceDrawing(page);
    await submit(page, true);
    expect((await shot(page)).progress.checked).toBe(true);
    expect((await saved(page)).events).toEqual([expect.objectContaining({ node: 'M-REP-02', assisted: false })]);
  });

  test('a chosen strategy updates the visible plan and needs the right step and reason', async ({ page }) => {
    await open(page, 'M-PS-03', 7);
    const family = (await shot(page)).family;
    const [a, b] = integers(await givens(page).locator('dd').first().innerText());
    const packing = family.includes('pack');
    await menu(page, 'Työtapa').selectOption({ label: packing ? 'Tee täysiä ryhmiä' : 'Täydennä tavoitteeseen' });
    await page.getByRole('textbox', { name: packing ? 'Täysiä ryhmiä' : 'Lisättävä määrä', exact: true }).fill(String(packing ? a! / b! : a! - b!));
    await expect(page.locator('[data-problem-plan]')).toContainText(String(a));
    const reason = menu(page, 'Miksi tapa sopii?').locator('option').filter({ hasText: packing ? 'Täydet korit' : 'Löydän lisättävän' });
    await menu(page, 'Miksi tapa sopii?').selectOption({ label: (await reason.innerText()).trim() });
    await submit(page, true);
  });

  for (const [name, viewport] of [
    ['desktop', { width: 1366, height: 768 }],
    ['tablet', { width: 768, height: 1024 }],
  ] as const) {
    test(`both task families fit their controls and givens on ${name}`, async ({ page }, info) => {
      test.setTimeout(60_000);
      await page.setViewportSize(viewport);
      for (const id of ids) {
        const families = new Set<string>();
        for (const seed of [1, 7]) {
          await open(page, id, seed);
          families.add((await shot(page)).family);
          if (id === 'M-PS-02') {
            const { first, target } = await firstTrial(page);
            await menu(page, 'Koehavainto').selectOption(first < target ? 'short' : 'surplus');
          }
          if (id === 'M-PS-03') await menu(page, 'Työtapa').selectOption({ index: 1 });
          if (id === 'M-PS-05') await commitRange(page);
          if (id === 'M-PS-06') {
            await menu(page, 'Ensimmäinen katkennut vaihe').selectOption({ index: 2 });
            await expect(workbench(page).locator('li[aria-current="step"]')).toHaveCount(1);
          }
          if (id === 'M-REP-02') await produceDrawing(page);
          const bounds = await page.evaluate(() => {
            const rects = [...document.querySelectorAll('[data-problem-givens], [data-problem-workbench]')]
              .map(node => node.getBoundingClientRect());
            return { left: Math.min(...rects.map(r => r.left)), right: Math.max(...rects.map(r => r.right)),
              top: Math.min(...rects.map(r => r.top)), bottom: Math.max(...rects.map(r => r.bottom)),
              scrollWidth: document.documentElement.scrollWidth };
          });
          const label = `${id} ${seed} ${JSON.stringify(bounds)}`;
          expect(bounds.left, label).toBeGreaterThanOrEqual(0);
          expect(bounds.right, label).toBeLessThanOrEqual(viewport.width);
          expect(bounds.scrollWidth, label).toBeLessThanOrEqual(viewport.width);
          expect(bounds.top, label).toBeGreaterThanOrEqual(0);
          expect(bounds.bottom, label).toBeLessThanOrEqual(viewport.height);
        }
        expect(families.size, id).toBe(2);
        if (id === 'M-PS-02' || id === 'M-REP-02') {
          const path = info.outputPath(`${id}-${name}.png`);
          await page.screenshot({ path });
          await info.attach(`${id}-${name}`, { path, contentType: 'image/png' });
        }
      }
    });
  }
});
