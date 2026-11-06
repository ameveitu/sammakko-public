import { expect, test, type Page } from '@playwright/test';

const ids = ['M-GEO-05', 'M-GEO-14', 'M-GEO-3D-CLASSIFY', 'M-GEO-09',
  'M-GEO-CONE-ID', 'M-GEO-CONE-PROP', 'M-GEO-17', 'M-GEO-CYLINDER-ID', 'M-GEO-CYLINDER-PROP', 'M-GEO-16'] as const;
type Id = typeof ids[number];
const board = (page: Page) => page.locator('.solid-workshop');
const task = (page: Page) => page.locator('.exp-task');
const feedback = (page: Page) => page.locator('.exp-feedback');
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const select = (page: Page, label: string) => task(page).getByRole('combobox', { name: label, exact: true });
const debug = (page: Page) => page.evaluate(() => JSON.parse(window.render_game_to_text!()));
const ledger = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3')!));
async function go(page: Page, id: Id, seed = 1) {
  await page.goto(`./?qa=1&full=1&seed=${seed}#saaristo/${id}`);
  await button(page, 'Kokeilen itse').click();
  await expect(board(page)).toBeVisible();
}

async function disableWebGl(page: Page) {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      return /^webgl/.test(type) ? null : Reflect.apply(get, this, [type, ...args]);
    } as typeof get;
  });
}

async function projectedRoundShape(page: Page, cone: boolean) {
  const images = board(page).getByRole('img', { name: /pääty- ja sivukuva/ });
  const figures = await images.evaluateAll(elements => elements.map(image => {
    const end = image.querySelector('[data-projection=end] > *')!, side = image.querySelector('[data-projection=side] > *')!;
    const marks = [...image.querySelectorAll<SVGCircleElement>('circle[r="2.7"]')].map(mark => ({
      id: mark.nextElementSibling!.textContent!,
      y: mark.cy.baseVal.value,
    })).sort((a, b) => a.y - b.y).map(mark => mark.id);
    return { id: image.getAttribute('aria-label')!.split(',')[0]!, end: end.tagName.toLowerCase(), side: side.tagName.toLowerCase(), marks };
  }));
  const target = figures.find(figure => figure.end === 'circle' && figure.side === (cone ? 'polygon' : 'rect'));
  expect(target).toBeDefined();
  return target!;
}

async function submitParts(page: Page, isCone: boolean, swap = false) {
  const model = await projectedRoundShape(page, isCone);
  const [top, mantle, bottom] = model.marks;
  if (await select(page, isCone ? 'Ympyräpohjainen kartio' : 'Ympyrälieriö').count()) {
    await select(page, isCone ? 'Ympyräpohjainen kartio' : 'Ympyrälieriö').selectOption(model.id);
  }
  if (isCone) {
    await select(page, 'Pohja').selectOption(swap ? mantle! : bottom!);
    await select(page, 'Kärki').selectOption(top!);
  } else {
    const ends = task(page).getByRole('group', { name: 'Molemmat pohjat' });
    await ends.getByRole('checkbox', { name: top, exact: true }).check();
    await ends.getByRole('checkbox', { name: swap ? mantle : bottom, exact: true }).check();
  }
  await select(page, 'Vaippa').selectOption(mantle!);
  const surface = select(page, 'Millaista pintaa vaippa on?');
  if (await surface.count()) await surface.selectOption({ label: 'yhtenäinen kaareva pinta' });
  else await select(page, 'Mihin vaippa liittyy?').selectOption({ label: isCone ? 'pohjan reunaan ja kärkeen' : 'molempien pohjien reunoihin' });
  await button(page, 'Tarkista').click();
}

test.describe('Kappalesaaren tarkkuuspaneeli ilman WebGL:ää', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await disableWebGl(page);
  });

  test('rejects a missing cylinder base, recovers with a hint and transfers independently', async ({ page }) => {
    await go(page, 'M-GEO-16');
    expect((await debug(page)).renderer).toBe('painted-fallback');
    await button(page, 'Sivulta').click();
    expect((await debug(page)).model.view).toBe('side');
    await expect(board(page).locator('[data-projection-focus="side"]').first()).toHaveAttribute('visibility', 'visible');
    expect((await ledger(page))?.attempts ?? []).toEqual([]);
    await submitParts(page, false, true);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await expect(feedback(page)).toContainText('kaksi tasopintaa');
    await button(page, 'Uusi kokeilu').click();
    await button(page, 'Pieni vihje').click();
    await expect(page.locator('.exp-help')).toContainText('päädyissä');
    await submitParts(page, false);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    expect((await ledger(page)).attempts).toMatchObject([{ ok: false, help: [] }, { ok: true, help: ['hint'] }]);
    await button(page, 'Toinen yhteinen kokeilu').click();
    await submitParts(page, false);
    for (let attempt = 0; attempt < 3; attempt++) {
      await button(page, attempt === 0 ? 'Kokeilen nyt itse' : 'Seuraava kokeilu').click();
      await submitParts(page, false);
      await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    }
    await button(page, 'Kokeile uudessa tilanteessa').click();
    const transferred = await debug(page);
    expect(transferred.model.figures.every((figure: { pose: string }) => figure.pose === 'horizontal')).toBe(true);
    await submitParts(page, false);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    expect((await ledger(page)).attempts.at(-1)).toMatchObject({ phase: 'transfer', ok: true, help: [] });
  });

  test('uses both projections before accepting the cone and its parts', async ({ page }) => {
    await go(page, 'M-GEO-17', 0);
    await submitParts(page, true, true);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await expect(feedback(page)).toContainText('kärjen vastainen');
    await button(page, 'Uusi kokeilu').click();
    await submitParts(page, true);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
  });

  for (const [name, viewport] of [
    ['desktop', { width: 1366, height: 768 }], ['landscape tablet', { width: 1024, height: 768 }], ['tablet', { width: 768, height: 1024 }],
  ] as const) {
    test(`shows both projections and the complete response for all twenty family views on ${name}`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const id of ids) {
        const families = new Set<string>();
        for (const seed of [0, 1]) {
          await go(page, id, seed);
          families.add((await debug(page)).family);
          await expect(page.locator('.exp-instruction'), id).toBeInViewport({ ratio: 1 });
          await expect(board(page), id).toBeInViewport({ ratio: 1 });
          for (const input of await task(page).locator('button:visible, input:visible, select:visible').all()) {
            await expect(input, id).toBeInViewport({ ratio: 1 });
          }
          await expect(button(page, 'Tarkista'), id).toBeInViewport({ ratio: 1 });
          expect(await page.evaluate(() => window.scrollY), id).toBe(0);
          if (id === 'M-GEO-16' && seed === 1) {
            const filename = `solid-fallback-${name}.png`, path = testInfo.outputPath(filename);
            await page.screenshot({ path });
            await testInfo.attach(filename, { path, contentType: 'image/png' });
          }
        }
        expect(families.size, id).toBe(2);
      }
      expect(errors).toEqual([]);
    });
  }
});

test.use({ launchOptions: { args: ['--enable-unsafe-swiftshader'] } });

test.describe('Kappalesaaren aito WebGL2-näkymä', () => {
  test('draws the real WebGL models and rotates them without recording an answer', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await go(page, 'M-GEO-17');
    await expect.poll(async () => (await debug(page)).renderer).toBe('webgl');
    await expect.poll(async () => (await debug(page)).stage.kind).toBe('solid-workshop');
    await expect(page.locator('canvas').first()).toBeVisible();
    const initial = await debug(page);
    expect(initial.stage.figures).toHaveLength(3);
    expect(initial.stage.figures.every((f: { dimensionality: number }) => f.dimensionality === 3)).toBe(true);
    expect(initial.model).not.toHaveProperty('questions');
    const views = board(page).getByRole('group', { name: 'Kappaleiden katselusuunta' });
    const end = views.getByRole('button', { name: 'Päädyn suuntaan' });
    await end.press('Enter');
    await expect(end).toHaveAttribute('aria-pressed', 'true');
    const turned = await debug(page);
    expect(turned.stage.view).toBe('ends');
    expect(turned.stage.figures[0].orientation).not.toEqual(initial.stage.figures[0].orientation);
    expect(turned.model.figures).toEqual(initial.model.figures);
    expect(turned.help).toEqual([]);
    expect(turned.answered).toBe(false);
    expect((await ledger(page))?.attempts ?? []).toEqual([]);
    await page.evaluate(() => window.advanceTime?.(120));
    const path = testInfo.outputPath('solid-webgl-ends.png');
    await page.screenshot({ path });
    await testInfo.attach('solid-webgl-ends', { path, contentType: 'image/png' });
    await views.getByRole('button', { name: 'Viistosta' }).click();
    await page.evaluate(() => window.advanceTime?.(120));
    const angled = testInfo.outputPath('solid-webgl-angled.png');
    await page.screenshot({ path: angled });
    await testInfo.attach('solid-webgl-angled', { path: angled, contentType: 'image/png' });
    await views.getByRole('button', { name: 'Sivulta' }).click();
    await page.evaluate(() => window.advanceTime?.(120));
    const side = testInfo.outputPath('solid-webgl-side.png');
    await page.screenshot({ path: side });
    await testInfo.attach('solid-webgl-side', { path: side, contentType: 'image/png' });
    await submitParts(page, true);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    expect(errors).toEqual([]);
  });
});
