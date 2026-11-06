import { expect, test, type Page } from '@playwright/test';

const ids = ['M79-GRAPH-MONO', 'M79-PARABOLA', 'M79-PARABOLA-GRAPH', 'M79-SEQ-STRUCTURE', 'M79-SEQ-RULE', 'M79-SEQ-01'] as const;
type Id = typeof ids[number];
type Snapshot = { family: string; phase: string; progress: { checked: boolean } };
const work = (page: Page) => page.locator('[data-garden-workbench]');
const input = (page: Page, name: string) => work(page).getByRole('textbox', { name, exact: true });
const menu = (page: Page, name: string) => work(page).getByRole('combobox', { name, exact: true });
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const snapshot = (page: Page): Promise<Snapshot> => page.evaluate(() => JSON.parse(
  (window as Window & { render_game_to_text: () => string }).render_game_to_text()));
const ledger = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[],"events":[]}'));
const num = (v: string) => Number(v.replace('−', '-').replace(',', '.'));
const fi = (v: number) => String(v).replace('-', '−');

async function open(page: Page, id: Id, seed = 1) {
  await page.goto(`./?qa=1&full=1&seed=${seed}#saaristo/${id}`);
  await button(page, 'Kokeilen itse').click();
  await expect(work(page)).toBeVisible();
}
async function finish(page: Page, ok: boolean) {
  await button(page, 'Tarkista merkinnät').press('Enter');
  await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', String(ok));
}
async function monotonic(page: Page, wrongSign = false) {
  const points = await work(page).locator('[data-garden-marked-point]').evaluateAll(nodes =>
    nodes.map(node => node.getAttribute('data-garden-marked-point')!.split(',').map(Number)));
  const intervals: { a: number; b: number; dir: string }[] = [];
  for (const [i, [b, by]] of points.slice(1).entries()) {
    const [a, ay] = points[i]!;
    const dir = by === ay ? 'constant' : by! > ay! ? 'rising' : 'falling';
    const last = intervals.at(-1);
    if (last?.dir === dir) last.b = b!;
    else intervals.push({ a: a!, b: b!, dir });
  }
  for (const [i, v] of intervals.entries()) {
    if (i) await button(page, 'Lisää jakso').press('Enter');
    await menu(page, `Jakso ${i + 1}, alku`).selectOption(String(v.a));
    await menu(page, `Jakso ${i + 1}, loppu`).selectOption(String(v.b));
    await menu(page, `Jakso ${i + 1}, suunta`).selectOption(v.dir);
  }
  const text = await work(page).innerText();
  const at = Number(text.match(/f\((\d+)\)/)![1]);
  const value = points.find(([x]) => x === at)![1]!;
  const sign = value === 0 ? 'zero' : value > 0 ? 'positive' : 'negative';
  await input(page, 'Funktion arvo merkityssä kohdassa').fill(String(value));
  await menu(page, 'Arvon merkki').selectOption(wrongSign ? sign === 'positive' ? 'negative' : 'positive' : sign);
  const draft = text.match(/Luonnos: väli (\d+)–(\d+), (nousee|laskee|vakio)/);
  if (draft) {
    const [, a, b, direction] = draft;
    const dirs = { nousee: 'rising', laskee: 'falling', vakio: 'constant' };
    await menu(page, 'Onko luonnoksen suunta oikein?').selectOption(intervals.some(v =>
      v.a <= Number(a) && v.b >= Number(b) && v.dir === dirs[direction as keyof typeof dirs]) ? 'yes' : 'no');
  }
}
async function fillPlot(page: Page, path = 'smooth', tap = false) {
  await expect(work(page).locator('[data-garden-model-curve]')).toHaveCount(0);
  await expect(button(page, 'Tarkista merkinnät')).toBeDisabled();
  const [x, y] = await work(page).locator('[data-garden-table] tr').evaluateAll(rows =>
    rows.map(row => [...row.querySelectorAll('td')].map(td => td.textContent!)));
  const xs = x!.map(num), raw = y!.map(num), center = xs[2]!;
  const ys = raw.map((v, i) => Number.isFinite(v) ? v : raw[xs.indexOf(2 * center - xs[i]!)]!);
  for (const [i, value] of xs.entries()) {
    const target = input(page, `Pisteen y kohdassa x = ${fi(value)}`);
    if (i === 0 && tap) {
      const p = await work(page).locator('svg').evaluate((node, y) => {
        const svg = node as SVGSVGElement;
        const ticks = [...svg.querySelectorAll('text[text-anchor="end"]')].flatMap(t => {
          const n = Number(t.textContent!.replace('−', '-'));
          return Number.isFinite(n) ? [[n, Number(t.getAttribute('y')) - 3]] : [];
        }).sort((a, b) => a[0]! - b[0]!);
        const [lo, hi] = [ticks[0]!, ticks.at(-1)!];
        const p = svg.createSVGPoint();
        p.x = Number(svg.querySelector('line')!.getAttribute('x1'));
        p.y = lo[1]! + (y - lo[0]!) * (hi[1]! - lo[1]!) / (hi[0]! - lo[0]!);
        const at = p.matrixTransform(svg.getScreenCTM()!);
        return { x: at.x, y: at.y };
      }, ys[i]!);
      await page.mouse.click(p.x, p.y);
      await expect(target).toHaveValue(String(ys[i]));
    } else await target.fill(String(ys[i]));
  }
  await input(page, 'Huipun x').fill(String(center)); await input(page, 'Huipun y').fill(String(ys[2]));
  await input(page, 'Symmetriaparin ensimmäinen x').fill(String(xs[4]));
  await input(page, 'Symmetriaparin toinen x').fill(String(xs[0]));
  await menu(page, 'Piirroksen kulku').selectOption(path);
  await button(page, 'Lukitse piirros').press('Enter');
  await expect(input(page, 'Huipun x')).toBeDisabled();
  await expect(work(page).locator('[data-garden-model-curve]')).toHaveCount(1);
  return ys;
}
async function sequence(page: Page, form: 'anchored' | 'recursive', wrong = false) {
  const terms = await work(page).locator('[data-garden-term-index]').evaluateAll(nodes => nodes.map(n =>
    [Number(n.getAttribute('data-garden-term-index')), Number(n.getAttribute('data-garden-term-value'))]));
  const [source, a] = terms[0]!, b = terms[1]![1]!;
  const delta = b - a!, ratio = b / a!;
  const mode = terms.slice(1).every((t, i) => t[1]! - terms[i]![1]! === delta) ? 'difference' : 'ratio';
  const step = mode === 'difference' ? delta : ratio;
  const text = await work(page).innerText();
  const first = Number(text.match(/ensimmäinen vaihe on (\d+)/)![1]);
  const target = Number(text.match(/Uusi a\((\d+)\)/)![1]);
  const at = (i: number) => mode === 'difference' ? a! + step * (i - source!) : a! * step ** (i - source!);
  if (await menu(page, 'Sallittu malliperhe').isVisible()) await menu(page, 'Sallittu malliperhe').selectOption(mode);
  for (const [i, t] of terms.slice(1).entries()) {
    const control = input(page, `Siirtymä vaiheesta ${terms[i]![0]} vaiheeseen ${t[0]}`);
    if (await control.isVisible()) await control.fill(mode === 'difference' ? String(t[1]! - terms[i]![1]!) : `${t[1]}/${terms[i]![1]}`);
  }
  if (await menu(page, 'Säännön muoto').isVisible()) {
    await menu(page, 'Säännön muoto').selectOption(form);
    await input(page, 'Jonon ensimmäinen indeksi').fill(String(first));
    const anchor = form === 'recursive' ? first : 0;
    await input(page, 'Säännön ankkuri-indeksi').fill(String(anchor));
    await input(page, 'Säännön ankkuritermi').fill(mode === 'ratio' && anchor === 0 ? `${a}/${step ** source!}` : String(at(anchor)));
    await input(page, 'Säännön siirtymä').fill(wrong ? 'oppijan yksityinen muistiinpano' : `${step * 2}/2`);
    await input(page, 'Näkyvän koevaiheen termi').fill(String(terms[2]![1]));
  }
  await input(page, 'Puuttuvan vaiheen termi').fill(String(at(target)));
  return { mode, first };
}

test.describe('Kasvihuoneen funktiot ja lukujonot', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
  });

  test('rejects confusing sign with direction and recovers with guided support', async ({ page }) => {
    await open(page, 'M79-GRAPH-MONO');
    await button(page, 'Lisää jakso').press('Enter');
    await expect(menu(page, 'Jakso 2, suunta')).toBeVisible();
    await button(page, 'Poista viimeinen jakso').press('Enter');
    await expect(menu(page, 'Jakso 2, suunta')).toBeHidden();
    await monotonic(page, true); await finish(page, false);
    await button(page, 'Näytä ja selitä').click();
    await button(page, 'Uusi yhteinen kokeilu').click();
    await monotonic(page); await finish(page, true);
    expect((await ledger(page)).attempts.at(-1)).toMatchObject({ phase: 'guided', ok: true });
  });

  test('matches a produced value pair to the quadratic instead of the other U-shaped graph', async ({ page }) => {
    for (const seed of [1, 7]) {
      await open(page, 'M79-PARABOLA', seed);
      if ((await snapshot(page)).family === 'distinguish-curves-from-samples') break;
    }
    const x = num((await work(page).innerText()).match(/kohdassa x = ([−\d]+)/)![1]!);
    const samples = [...(await work(page).locator('[data-garden-samples]').innerText()).matchAll(/\(([−\d]+), ([−\d]+)\)/g)];
    const y = num(samples.find(m => num(m[1]!) === x)![2]!);
    const candidates = await work(page).locator('[data-garden-candidate]').evaluateAll(cards => cards.map(card => {
      const path = card.querySelector('path')!.getAttribute('d')!;
      const points = [...path.matchAll(/[ML]\s+([\d.]+)\s+([\d.]+)/g)].map(m => Number(m[2]));
      const h = [0, 25, 50, 75, 100].map(i => points[i]!);
      const d = h.slice(2).map((v, i) => v - 2 * h[i + 1]! + h[i]!);
      return { id: card.getAttribute('data-garden-candidate')!, quadratic: Math.abs(d[0]!) > .01 && d.every(x => Math.abs(x - d[0]!) < 1e-7) };
    }));
    const selected = candidates.find(c => c.quadratic)!;
    await input(page, 'Arvoparin x').fill(String(x)); await input(page, 'Arvoparin y').fill(String(y));
    await button(page, `Kuvaaja ${selected.id}`).press('Enter');
    await finish(page, true);
  });

  test('locks own coordinates before showing the model and rejects a polyline', async ({ page }) => {
    await open(page, 'M79-PARABOLA-GRAPH');
    await fillPlot(page, 'segments', true); await finish(page, false);
    await button(page, 'Uusi kokeilu').click();
    await fillPlot(page); await finish(page, true);
  });

  test('opens a downward parabola after three independent point productions', async ({ page }) => {
    await open(page, 'M79-PARABOLA-GRAPH', 7);
    for (let i = 0; i < 4; i++) {
      const heights = await fillPlot(page);
      if (i === 3) {
        expect((await snapshot(page)).phase).toBe('transfer');
        expect(heights[2]).toBeGreaterThan(heights[0]!);
      }
      await finish(page, true);
      if (i < 2) await button(page, 'Seuraava kokeilu').click();
      if (i === 2) await button(page, 'Kokeile uudessa tilanteessa').click();
    }
    expect((await snapshot(page)).progress.checked).toBe(true);
    expect((await ledger(page)).events).toEqual([expect.objectContaining({ node: 'M79-PARABOLA-GRAPH', assisted: false })]);
  });

  test('accepts both rule forms and excludes invalid free text from evidence', async ({ page }) => {
    await open(page, 'M79-SEQ-RULE');
    await sequence(page, 'recursive', true); await finish(page, false);
    expect(JSON.stringify(await ledger(page))).not.toContain('oppijan yksityinen muistiinpano');
    await button(page, 'Uusi kokeilu').click();
    await sequence(page, 'recursive'); await finish(page, true);
    await button(page, 'Seuraava kokeilu').click();
    await sequence(page, 'anchored'); await finish(page, true);
  });

  test('integrates all steps, a rule and a later changed-index trial', async ({ page }) => {
    await open(page, 'M79-SEQ-01', 7);
    const keys = new Set<string>();
    for (let i = 0; i < 4; i++) {
      const authored = await sequence(page, i % 2 ? 'anchored' : 'recursive');
      if (i === 3) {
        expect((await snapshot(page)).phase).toBe('transfer');
        expect(authored.first).toBeGreaterThanOrEqual(2);
        expect(authored.mode).toBe('ratio');
      }
      await finish(page, true);
      keys.add((await ledger(page)).attempts.at(-1).itemKey);
      if (i < 2) await button(page, 'Seuraava kokeilu').click();
      if (i === 2) await button(page, 'Kokeile uudessa tilanteessa').click();
    }
    expect(keys.size).toBe(4);
    expect((await snapshot(page)).progress.checked).toBe(true);
  });

  for (const [device, viewport] of [['desktop', { width: 1366, height: 768 }], ['tablet', { width: 768, height: 1024 }]] as const) {
    test(`all 12 task families keep givens and controls visible on ${device}`, async ({ page }, info) => {
      test.setTimeout(90_000);
      await page.setViewportSize(viewport);
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const id of ids) {
        const families = new Set<string>();
        for (const seed of [1, 7]) {
          await open(page, id, seed);
          families.add((await snapshot(page)).family);
          if (id === 'M79-GRAPH-MONO') {
            await button(page, 'Lisää jakso').press('Enter');
            await button(page, 'Lisää jakso').press('Enter');
          }
          if (id === 'M79-PARABOLA-GRAPH') await fillPlot(page);
          await expect(page.locator('[data-garden-givens]'), id).toBeInViewport({ ratio: 1 });
          await expect(work(page), id).toBeInViewport({ ratio: 1 });
          for (const control of await work(page).locator('input:visible,select:visible,button:visible').all()) {
            const box = (await control.boundingBox())!;
            expect(box.height, id).toBeGreaterThanOrEqual(44);
            expect(box.width, id).toBeGreaterThanOrEqual(44);
          }
        }
        expect(families.size, id).toBe(2);
        if (['M79-GRAPH-MONO', 'M79-PARABOLA', 'M79-PARABOLA-GRAPH', 'M79-SEQ-01'].includes(id))
          await page.screenshot({ path: info.outputPath(`${id}-${device}.png`) });
      }
      expect(errors).toEqual([]);
    });
  }
});
