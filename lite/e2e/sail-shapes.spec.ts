import { expect, test, type Page } from '@playwright/test';

const ids = ['M-GEO-06', 'M-GEO-10', 'M-GEO-2D-CLASSIFY', 'M-GEO-2D-PROP-NAME', 'M-GEO-CIRCLE-ID', 'M-GEO-CIRCLE-PROP',
  'M-GEO-13', 'M-GEO-QUAD-CLASS', 'M-GEO-QUAD-PROP', 'M-GEO-12', 'M-GEO-TRI-CLASS', 'M-GEO-TRI-PROP', 'M-GEO-11'] as const;
const board = (page: Page) => page.locator('.sail-shape-workbench');
const task = (page: Page) => page.locator('.exp-task');
const feedback = (page: Page) => page.locator('.exp-feedback');
const pick = (page: Page, name: string) => task(page).getByRole('combobox', { name, exact: true });
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const grid = (page: Page) => board(page).getByRole('img', { name: 'Napautettava kokonaislukuruudukko' });

async function go(page: Page, id: typeof ids[number], seed = 1) {
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await button(page, 'Kokeilen itse').click();
  await expect(board(page)).toBeVisible();
}

async function build(page: Page, how: 'keyboard' | 'pointer', close = true) {
  const source = await board(page).getByText(/Mallin kärjet:/).innerText();
  const scale = source.includes('kaksinkertaiset') ? 2 : 1;
  const points = [...source.matchAll(/\((\d+), (\d+)\)/g)].map(([, x, y]) => [Number(x) * scale, Number(y) * scale] as const);
  expect(points.length).toBeGreaterThanOrEqual(3);
  const xField = task(page).getByRole('spinbutton', { name: 'Pisteen x' });
  const yField = task(page).getByRole('spinbutton', { name: 'Pisteen y' });
  const size = Number(await xField.getAttribute('max'));
  for (const [x, y] of points) {
    if (how === 'keyboard') {
      for (const [field, value] of [[xField, x], [yField, y]] as const) {
        await field.fill('');
        await field.pressSequentially(String(value));
        await expect(field).toHaveValue(String(value));
      }
      await yField.press('Enter');
    } else {
      const box = await grid(page).boundingBox();
      expect(box).toBeTruthy();
      await grid(page).click({ position: { x: (18 + 136 * x / size) * box!.width / 172,
        y: (154 - 136 * y / size) * box!.height / 172 } });
    }
  }
  if (close) await button(page, 'Sulje kuvio').press('Enter');
  await button(page, 'Tarkista').click();
  return scale;
}

async function chooseCircle(page: Page) {
  // The flat circle has one ellipse with equal axes. The ball has surface curves.
  const cards = board(page).getByRole('img', { name: /^Kuvio [A-C]$/ });
  const figures = await cards.evaluateAll(elements => elements.map(element => {
    const shapes = [...element.querySelectorAll('ellipse')];
    const round = shapes.length === 1 && shapes[0]!.rx.baseVal.value === shapes[0]!.ry.baseVal.value;
    return { round, id: element.getAttribute('aria-label')!.slice(-1) };
  }));
  const target = figures.find(f => f.round)!;
  const decoy = figures.find(f => f.id !== target.id)!;
  await pick(page, 'Valittu kuvio').selectOption(decoy.id);
  await expect(board(page).getByRole('img', { name: /merkityt pisteet ja janat/ })).toBeVisible();
  await pick(page, 'Valittu kuvio').selectOption(target.id);
}

async function circleMarks(page: Page, wrongChord: boolean) {
  const image = board(page).getByRole('img', { name: /merkityt pisteet ja janat/ });
  const { center, border, diameters } = await image.evaluate(svg => {
    const points = [...svg.querySelectorAll('circle')].map((mark, i) => ({
      id: svg.querySelectorAll('text')[i]!.textContent!,
      x: mark.cx.baseVal.value, y: mark.cy.baseVal.value,
    }));
    const ellipse = svg.querySelector('ellipse')!;
    const cx = ellipse.cx.baseVal.value, cy = ellipse.cy.baseVal.value;
    const center = points.find(p => p.x === cx && p.y === cy)!;
    const border = points.filter(p => Math.abs(Math.hypot(p.x - cx, p.y - cy) - ellipse.rx.baseVal.value) < .01);
    const diameters = border.flatMap(a => border.filter(b => a.x + b.x === 2 * cx && a.y + b.y === 2 * cy).map(b => `${a.id}–${b.id}`));
    return { center: center.id, border: border.map(p => p.id), diameters };
  });
  const options = await pick(page, 'Halkaisija').locator('option').allTextContents();
  const radii = options.filter(label => label.includes('–') && label.split('–').includes(center) && label.split('–').some(id => border.includes(id)));
  const chord = options.find(label => label.includes('–') && label.split('–').every(id => border.includes(id)) && !diameters.includes(label))!;
  await pick(page, 'Keskipiste').selectOption(center);
  await pick(page, 'Ensimmäinen säde').selectOption({ label: radii[0] });
  await pick(page, 'Toinen säde').selectOption({ label: radii[1] });
  await pick(page, 'Halkaisija').selectOption({ label: wrongChord ? chord : options.find(label => diameters.includes(label)) });
  await button(page, 'Tarkista').click();
}

test.describe('Lehtipurjeiden kuviopoukama', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(original, this, [type, ...args]);
      } as typeof original;
    });
  });

  test('builds a real closed shape, recovers from an open outline and transfers to a new scale', async ({ page }) => {
    await go(page, 'M-GEO-06');
    await build(page, 'pointer', false);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await expect(feedback(page)).toContainText('Sulje kuvio');
    await button(page, 'Uusi kokeilu').click();
    await button(page, 'Pieni vihje').click();
    await expect(page.locator('.exp-help')).toContainText('yhdistä viimeinen kärki');
    await build(page, 'keyboard');
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    await expect(grid(page).locator('path')).toHaveAttribute('d', /Z$/);
    await button(page, 'Toinen yhteinen kokeilu').click();
    await build(page, 'pointer');
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    await expect(page.getByRole('dialog', { name: 'Retkimuisto' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Retkimuisto' })).toHaveCount(0);
    for (let i = 0; i < 3; i++) {
      await button(page, i === 0 ? 'Kokeilen nyt itse' : 'Seuraava kokeilu').click();
      await build(page, 'pointer');
      await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    }
    await button(page, 'Kokeile uudessa tilanteessa').click();
    expect(await build(page, 'pointer')).toBe(2);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    const state = await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3')!));
    expect(state.attempts.slice(0, 3)).toMatchObject([
      { ok: false, help: [] }, { ok: true, help: ['hint'] }, { ok: true, phase: 'guided' },
    ]);
    expect(new Set(state.attempts.slice(3, 6).map((attempt: { tag: string }) => attempt.tag)).size).toBe(2);
    expect(state.attempts[6]).toMatchObject({ node: 'M-GEO-06', phase: 'transfer', ok: true, help: [] });
  });

  test('rejects a chord and accepts a circle with two radii and the true diameter in one submission', async ({ page }) => {
    await go(page, 'M-GEO-13');
    await chooseCircle(page);
    await circleMarks(page, true);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await expect(feedback(page)).toContainText('kulkee keskipisteen kautta');
    await button(page, 'Uusi kokeilu').click();
    await chooseCircle(page);
    await circleMarks(page, false);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    await expect(board(page)).toContainText('Säteet');
    await expect(board(page)).toContainText('Halkaisija');
  });

  test('requires a learner-written name for the highlighted part', async ({ page }) => {
    for (const seed of [2, 4, 5, 13, 22]) {
      await go(page, 'M-GEO-2D-PROP-NAME', seed);
      const bands = await board(page).locator('svg text').evaluateAll(labels => labels.map(label => {
        const box = label.getBoundingClientRect();
        return [box.top, box.bottom];
      }));
      expect(bands).toHaveLength(3);
      for (let i = 1; i < bands.length; i++) expect(bands[i]![0]).toBeGreaterThan(bands[i - 1]![1]!);
    }
    const markedPart = () => board(page).locator('svg [stroke="#b4642d"], svg [fill="#b4642d"]');
    let mark: { name: string; text: string } | undefined;
    for (let seed = 0; seed < 8; seed++) {
      await go(page, 'M-GEO-2D-PROP-NAME', seed);
      const found = await markedPart().evaluate(element => ({
        type: element.tagName.toLowerCase(), name: element.nextElementSibling!.textContent!,
      }));
      if (found.type === 'line' || found.type === 'circle') {
        mark = { name: found.name, text: found.type === 'line' ? 'sivun' : 'kärjen' };
        break;
      }
    }
    expect(mark).toBeDefined();
    await pick(page, 'Kuvion merkintä').selectOption(mark!.name);
    const entry = task(page).getByRole('textbox', { name: 'Oma geometrinen nimi' });
    await expect(entry).toHaveValue('');
    await entry.fill(mark!.text);
    await button(page, 'Tarkista').click();
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    await expect(board(page)).toContainText('Geometrinen nimi');
  });

  for (const [name, viewport] of [
    ['desktop', { width: 1366, height: 768 }], ['tablet', { width: 768, height: 1024 }],
  ] as const) {
    test(`all thirteen complete response controls fit ${name}`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const id of ids) {
        const families = new Set<string>();
        for (const seed of [0, 1]) {
          await go(page, id, seed);
          families.add(await page.evaluate(() => JSON.parse(window.render_game_to_text!()).family));
          if (id === 'M-GEO-13') await chooseCircle(page);
          const submit = button(page, id === 'M-GEO-10' || id === 'M-GEO-CIRCLE-ID' ? 'Valmis' : 'Tarkista');
          await expect(page.locator('.exp-instruction'), id).toBeInViewport({ ratio: 1 });
          await expect(board(page), id).toBeInViewport({ ratio: 1 });
          for (const input of await task(page).locator('button:visible, input:visible, select:visible').all()) {
            await expect(input, id).toBeInViewport({ ratio: 1 });
          }
          await expect(submit, id).toBeInViewport({ ratio: 1 });
          expect(await page.evaluate(() => window.scrollY), id).toBe(0);
          if (seed === 1 && (id === 'M-GEO-13' || id === 'M-GEO-06')) {
            const filename = `sail-${id}-${name}.png`;
            const path = testInfo.outputPath(filename);
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
