import { expect, test, type Page } from '@playwright/test';

const ids = ['M79-SQRT-01', 'M79-SQRT-EXACT', 'M79-SQRT-EST', 'M79-SQRT-02', 'M79-SQRT-03', 'M79-REAL-01', 'M79-REAL-02', 'M79-EXACTAPPROX-01', 'M79-ROUND-01'] as const;
type Id = typeof ids[number];
type Snapshot = { node: Id; family: string; phase: string; progress: { checked: boolean }; contentContext: { skills: string[] } };
const snapshot = (page: Page): Promise<Snapshot> => page.evaluate(() => JSON.parse(
  (window as Window & { render_game_to_text: () => string }).render_game_to_text()));
const local = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[],"events":[]}'));
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const board = (page: Page) => page.locator('[data-root-workbench]');
const givens = (page: Page) => page.locator('[data-root-givens]');
const input = (page: Page, name: string) => board(page).getByRole('textbox', { name, exact: true });
const select = (page: Page, name: string) => board(page).getByRole('combobox', { name, exact: true });
const numeric = (value: string): number => value.includes('/') ? value.split('/').map(numeric).reduce((a, b) => a / b)
  : Number(value.replace('−', '-').replace(',', '.'));
const extractRoots = (text: string) => [...text.matchAll(/√\(?([−-]?\d+)\)?/g)].map(m => numeric(m[1]!));

async function open(page: Page, id: Id, seed = 7) {
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await button(page, 'Kokeilen itse').click();
  await expect(board(page)).toBeVisible();
  expect((await snapshot(page)).contentContext.skills.length).toBeGreaterThan(0);
}
async function finish(page: Page, ok: boolean) {
  await button(page, 'Tarkista mittalappu').press('Enter');
  await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', String(ok));
}
async function principal(page: Page, incorrect = false) {
  const [n] = extractRoots(await givens(page).innerText());
  const status = select(page, 'Onko reaalista neliöjuurta?');
  if (await status.isVisible()) await status.selectOption(n! < 0 ? 'undefined' : 'exists');
  if (n! < 0) {
    await expect(input(page, 'Pääjuuri')).toBeHidden();
    return;
  }
  const side = Math.sqrt(n!);
  await input(page, 'Pääjuuri').fill(incorrect ? `±${side}` : String(side));
  await input(page, 'Pääjuuren neliö').fill(String(n));
  const probe = select(page, 'Onko negatiivisella juurrettavalla reaalista neliöjuurta?');
  if (await probe.isVisible()) await probe.selectOption('undefined');
}
async function bounds(page: Page, n: number, wrongNearest = false) {
  const root = Math.sqrt(n), lower = Math.floor(root), high = lower + 1;
  await input(page, 'Alempi kokonaisluku').fill(String(lower));
  await input(page, 'Ylempi kokonaisluku').fill(String(high));
  await expect(board(page).locator('[data-root-comparisons]')).toContainText('Puoliväli');
  const squares = board(page).locator('[data-root-estimate-squares] svg');
  if (await squares.isVisible()) {
    const widths = await squares.locator('rect').evaluateAll(rects => rects.map(rect => Number(rect.getAttribute('width'))));
    expect(widths[1]!).toBeLessThan(widths[0]!);
    expect(widths[2]!).toBeGreaterThan(widths[0]!);
  }
  const nearest = Math.round(root);
  await input(page, 'Lähin kokonaisluku').fill(String(wrongNearest ? (nearest === lower ? high : lower) : nearest));
  if (await input(page, 'Alempi kymmenesosa').isVisible()) {
    const bottom = Math.floor(root * 10);
    await input(page, 'Alempi kymmenesosa').fill((bottom / 10).toFixed(1));
    await input(page, 'Ylempi kymmenesosa').fill(((bottom + 1) / 10).toFixed(1));
  }
  return { lower, high, nearest };
}
async function markLine(page: Page) {
  const facts = await givens(page).locator('p').allTextContents();
  for (const fact of facts) {
    const match = /^([A-C]) · ([^:]+): (.*)\.$/.exec(fact);
    if (!match) continue;
    const [, id, value, rule] = match;
    const approx = rule!.includes('suljettu');
    const typed = approx ? /väli ([\d,]+)–([\d,]+)/.exec(rule!)![2]! : String(numeric(value!));
    await input(page, `Sijoitus ${id}`).fill(typed);
    await select(page, `Sijoituksen merkki ${id}`).selectOption(approx ? '≈' : '=');
  }
}
async function round(page: Page) {
  const read = (await givens(page).locator('strong').innerText()).split(' ')[0]!;
  const text = await givens(page).innerText();
  const n = numeric(read);
  const source = read.replace('−', '-').split(',');
  const denominator = 10 ** (source[1]?.length ?? 0);
  const numerator = Number(source.join(''));
  const significant = text.includes('merkitsevää'), whole = text.includes('Yksi osa on 1 m');
  const digits = significant ? source[1]!.search(/[1-9]/) + 2 : whole ? 0 : 1;
  const scale = 10 ** digits;
  const lo = Math.floor(numerator * scale / denominator);
  const hi = lo + 1;
  const rounding = whole ? Math.ceil(n) : Math.sign(numerator) * Math.floor((Math.abs(numerator * scale) * 2 + denominator) / (2 * denominator));
  const carried = significant && rounding === 100;
  await input(page, 'Alempi asteikkokohta').fill(String(lo / scale));
  await input(page, 'Ylempi asteikkokohta').fill(String(hi / scale));
  await input(page, 'Kirjattava lukema').fill((rounding / scale).toFixed(carried ? digits - 1 : digits));
  return { original: read, digits, whole, significant };
}

test.describe('Juuriportti', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
  });

  test('moves a trial side, rejects a sign pair, and records a fresh guided principal root', async ({ page }) => {
    for (const seed of [1, 7]) {
      await open(page, 'M79-SQRT-01', seed);
      if (await button(page, 'Suurenna kokeilun sivua').isVisible()) break;
    }
    await button(page, 'Suurenna kokeilun sivua').press('Enter');
    await expect(board(page).locator('svg')).toHaveAttribute('aria-label', /Kokeilun sivu 1/);
    await principal(page, true);
    await finish(page, false);
    expect((await local(page)).events).toHaveLength(0);
    await button(page, 'Näytä ja selitä').click();
    await button(page, 'Uusi yhteinen kokeilu').click();
    await principal(page);
    await finish(page, true);
    expect((await local(page)).attempts[1]).toMatchObject({ phase: 'guided', ok: true });
  });

  test('still requires a produced principal root when the negative-domain probe is correct', async ({ page }) => {
    const probe = select(page, 'Onko negatiivisella juurrettavalla reaalista neliöjuurta?');
    for (const seed of [1, 7]) {
      await open(page, 'M79-SQRT-01', seed);
      if (await probe.isVisible()) break;
    }
    await expect(probe).toBeVisible();
    await select(page, 'Onko reaalista neliöjuurta?').selectOption('exists');
    await probe.selectOption('undefined');
    await finish(page, false);
    await button(page, 'Uusi kokeilu').click();
    await principal(page);
    await finish(page, true);
  });

  test('produces an exact root with a square check, and a distinct exact-and-estimate solution', async ({ page }) => {
    await open(page, 'M79-SQRT-EXACT');
    await principal(page);
    await finish(page, true);
    await open(page, 'M79-SQRT-02');
    const [a, b] = extractRoots(await givens(page).innerText());
    await input(page, 'Tarkka sivu').fill(String(Math.sqrt(a!)));
    await input(page, 'Tarkan sivun neliö').fill(String(a));
    await select(page, 'Tarkan juuren merkki').selectOption('=');
    await select(page, 'Arvioidun juuren merkki').selectOption('≈');
    await bounds(page, b!);
    await finish(page, true);
  });

  test('makes the nearer integer a separate judgment and transfers to a root near the upper bound', async ({ page }) => {
    await open(page, 'M79-SQRT-EST');
    let [n] = extractRoots(await givens(page).innerText());
    await bounds(page, n!, true);
    await finish(page, false);
    await button(page, 'Uusi kokeilu').click();
    for (let i = 0; i < 4; i++) {
      [n] = extractRoots(await givens(page).innerText());
      const sample = await bounds(page, n!);
      if (i === 3) {
        expect((await snapshot(page)).phase).toBe('transfer');
        expect(sample.nearest).toBe(sample.high);
      }
      await finish(page, true);
      if (i < 2) await button(page, 'Seuraava kokeilu').click();
      if (i === 2) await button(page, 'Kokeile uudessa tilanteessa').click();
    }
    expect((await snapshot(page)).progress.checked).toBe(true);
  });

  test('retains an exact radical before rounding and rejects combining the radicands in a sum', async ({ page }) => {
    const read = async () => {
      const [, lc, ra, op, rc, rb] = /^(\d*)√(\d+) ([+−×]) (\d*)√(\d+)$/.exec((await givens(page).innerText()).trim())!;
      const a = Number(lc || 1), b = Number(rc || 1), n = Number(ra);
      const coefficient = op === '+' ? a + b : a - b;
      return { n, radicands: n + Number(rb), coefficient, value: coefficient * Math.sqrt(n) };
    };
    for (const seed of [1, 7]) {
      await open(page, 'M79-SQRT-03', seed);
      if ((await snapshot(page)).family.includes('add-')) break;
    }
    let p = await read();
    await input(page, 'Tarkka tulos').fill(`√${p.radicands}`);
    await input(page, 'Tulos yhden desimaalin tarkkuudella').fill(p.value.toFixed(1));
    await select(page, 'Tarkan tuloksen ja desimaalin merkki').selectOption('≈');
    await finish(page, false);
    await button(page, 'Uusi kokeilu').click();
    p = await read();
    await input(page, 'Tarkka tulos').fill(`${p.coefficient < 0 ? '-' : ''}sqrt(${p.coefficient ** 2 * p.n})`);
    await input(page, 'Tulos yhden desimaalin tarkkuudella').fill(p.value.toFixed(1));
    await select(page, 'Tarkan tuloksen ja desimaalin merkki').selectOption('≈');
    await finish(page, true);
  });

  test('classifies exact and repeating decimals differently from an unknown fragment', async ({ page }) => {
    for (const seed of [1, 7]) {
      await open(page, 'M79-REAL-01', seed);
      if ((await snapshot(page)).family.includes('decimal')) break;
    }
    const cards = await board(page).locator('[data-root-card]').all();
    for (const card of cards) {
      const id = (await card.getAttribute('data-root-card'))!;
      const heading = await card.locator('strong').innerText();
      await select(page, `Lukulaji: ${id}`).selectOption(heading.includes('…') ? 'undetermined' : 'rational');
      await select(page, `Peruste: ${id}`).selectOption(heading.includes('…') ? 'fragment' : heading.includes('(') ? 'periodic' : 'finite');
    }
    await finish(page, true);
  });

  test('places exact and approximate markers, then mirrors the same placement on two different axes', async ({ page }) => {
    await open(page, 'M79-REAL-02');
    for (let i = 0; i < 4; i++) {
      if (i === 3) {
        expect((await snapshot(page)).phase).toBe('transfer');
        const detailed = board(page).locator('[data-root-axis] svg'), overview = board(page).locator('[data-root-overview] svg');
        await expect(overview).toBeVisible();
        await button(page, 'Siirrä merkkiä A oikealle').press('Enter');
        await button(page, 'Siirrä merkkiä A oikealle').press('Space');
        await expect(detailed).toHaveAttribute('aria-label', /A kohdassa 1,1/);
        await expect(overview).toHaveAttribute('aria-label', /A kohdassa 1,1/);
        expect(await detailed.locator('text', { hasText: /^A$/ }).getAttribute('x')).not.toBe(await overview.locator('text', { hasText: /^A$/ }).getAttribute('x'));
      }
      await markLine(page);
      await finish(page, true);
      if (i < 2) await button(page, 'Seuraava kokeilu').click();
      if (i === 2) await button(page, 'Kokeile uudessa tilanteessa').click();
    }
  });

  test('compares the exact source with a rounded display and produces its two cutoff values', async ({ page }) => {
    await open(page, 'M79-EXACTAPPROX-01');
    const [original, show] = await givens(page).locator('strong').allTextContents();
    const source = original!.split(': ')[1]!;
    const exact = source.startsWith('√') ? Math.sqrt(numeric(source.slice(1))) : numeric(source);
    const shown = numeric(show!.split(': ')[1]!);
    await select(page, 'Tarkan arvon ja näytön merkki').selectOption(exact === shown ? '=' : '≈');
    await select(page, 'Tarkan arvon järjestys näyttöön nähden').selectOption(exact < shown ? '<' : exact > shown ? '>' : '=');
    await input(page, 'Näytön alempi rajakohta').fill((shown - .005).toFixed(3));
    await input(page, 'Näytön ylempi rajakohta').fill((shown + .005).toFixed(3));
    await finish(page, true);
  });

  test('switches from decimal places and sufficient whole parts to significant figures', async ({ page }) => {
    await open(page, 'M79-ROUND-01');
    const goals = new Set<string>();
    for (let i = 0; i < 4; i++) {
      const value = await round(page);
      goals.add(value.whole ? 'parts' : value.significant ? 'figures' : 'places');
      if (i === 3) expect(value.significant).toBe(true);
      await finish(page, true);
      if (i < 2) await button(page, 'Seuraava kokeilu').click();
      if (i === 2) await button(page, 'Kokeile uudessa tilanteessa').click();
    }
    expect(goals).toEqual(new Set(['parts', 'places', 'figures']));
    expect((await snapshot(page)).progress.checked).toBe(true);
  });

  for (const [name, viewport] of [['desktop', { width: 1366, height: 768 }], ['tablet', { width: 768, height: 1024 }]] as const) {
    test(`both independent families keep the square, text and controls in view on ${name}`, async ({ page }, info) => {
      test.setTimeout(80_000);
      const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
      await page.setViewportSize(viewport);
      for (const id of ids) {
        const families = new Set<string>();
        for (const seed of [1, 7]) {
          await open(page, id, seed);
          families.add((await snapshot(page)).family);
          await expect(givens(page), id).toBeInViewport({ ratio: 1 });
          await expect(board(page), id).toBeInViewport({ ratio: 1 });
          for (const control of await board(page).locator('button:visible,input:visible,select:visible').all()) {
            const bounds = (await control.boundingBox())!;
            expect(bounds.height, id).toBeGreaterThanOrEqual(44);
          }
        }
        expect(families.size, id).toBe(2);
        if (['M79-SQRT-01', 'M79-REAL-02', 'M79-SQRT-EST'].includes(id)) await page.screenshot({ path: info.outputPath(`${id}-${name}.png`) });
      }
      expect(errors).toEqual([]);
    });
  }
});
