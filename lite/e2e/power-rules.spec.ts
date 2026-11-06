import { expect, test, type Page } from '@playwright/test';

const ids = ['M79-DIVIS-01', 'M79-PRIME-01', 'M79-PRIMEFACT-01', 'M79-POWER-01', 'M79-POWER-POS', 'M79-POWER-ZERO',
  'M79-POWER-NEG', 'M79-POWER-PROD', 'M79-POWER-QUOT', 'M79-POWER-POWER', 'M79-POWER-SIMPLIFY'] as const;
type Id = typeof ids[number];
type Snapshot = { node: Id; phase: string; family: string; seed: number; contentContext: { rules: string[] }; progress: { helped: boolean; checked: boolean } };
const state = (page: Page): Promise<Snapshot> => page.evaluate(() =>
  JSON.parse((window as Window & { render_game_to_text: () => string }).render_game_to_text()));
const saved = (page: Page) => page.evaluate(() =>
  JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[],"events":[]}'));
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const input = (page: Page, name: string) => page.getByRole('textbox', { name, exact: true });
const menu = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true });
const givens = (page: Page) => page.locator('[data-power-givens]');
const workbench = (page: Page) => page.locator('[data-power-workbench]');
const feedback = (page: Page) => page.locator('.exp-feedback');
const strip = (text: string) => text.replaceAll('−', '-');
const exponentText = (text: string) => text.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, ch => ch === '⁻' ? '-' : String('⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(ch)));
const parsePowers = (text: string) => [...text.matchAll(/([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g)].map(([n]) => Number(exponentText(n)));

async function open(page: Page, id: Id, seed = 7) {
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await button(page, 'Kokeilen itse').click();
  await expect(workbench(page)).toBeVisible();
  await expect(givens(page)).toContainText('Tuttu rakenne');
}

async function submit(page: Page, ok: boolean) {
  await button(page, 'Tarkista tähtipaja').click();
  await expect(feedback(page)).toHaveAttribute('data-ok', String(ok));
}

async function split(page: Page, value: number, a: number, b: number, keyboard = true) {
  await button(page, `Valitse haara ${value}`).first().click();
  await input(page, 'Ensimmäinen tekijä').fill(String(a));
  await input(page, 'Toinen tekijä').fill(String(b));
  if (keyboard) await input(page, 'Toinen tekijä').press('Enter');
  else await button(page, 'Hajota haara').click();
}

function factor(n: number) {
  for (let d = 2; d < n; d++) if (n % d === 0) return d;
  return undefined;
}

async function completeTree(page: Page) {
  const initial = await page.locator('[data-power-tree]').getByRole('button').allTextContents();
  for (const branch of initial) await finish(Number(branch));
  async function finish(n: number) {
    const d = factor(n);
    if (d === undefined) return;
    await split(page, n, d, n / d);
    await finish(d);
    await finish(n / d);
  }
}

async function simplify(page: Page, wrongDomain = false) {
  const source = await givens(page).locator('dd').first().innerText();
  let result = 0;
  for (let step = 1; step <= 2; step++) {
    const focus = await page.locator(`[data-power-display="focus-${step}"]`).innerText();
    const [a, b] = parsePowers(focus);
    const rule = focus.includes('×') ? 'sum' : focus.includes('÷') ? 'difference' : 'multiply';
    result = rule === 'sum' ? a! + b! : rule === 'difference' ? a! - b! : a! * b!;
    await menu(page, `Vaihe ${step}: sääntö`).selectOption(rule);
    await input(page, `Vaihe ${step}: eksponentti`).fill(String(result));
  }
  await input(page, 'Lopullinen kanta').fill(source.match(/[a-z]/)![0]!);
  await input(page, 'Lopullinen eksponentti').fill(String(result));
  const restrict = source.includes('÷');
  await menu(page, 'Kannan ehto').selectOption((wrongDomain ? !restrict : restrict) ? 'nonzero' : 'any');
}

function fractionPower(base: string, positiveExponent: number) {
  const [n, d = '1'] = strip(base).split('/');
  const p = BigInt(positiveExponent);
  return `${BigInt(d) ** p}/${BigInt(n!) ** p}`;
}

async function reciprocal(page: Page) {
  const values = await givens(page).locator('dd').allTextContents();
  const printed = values.find(value => value.includes('= ?'))!;
  const base = strip(printed).split(/[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]/)[0]!.replace(/[()]/g, '');
  const [signed] = parsePowers(printed), exponent = -signed!;
  const answer = fractionPower(base, exponent);
  await input(page, 'Nimittäjän kanta').fill(base);
  await input(page, 'Positiivinen eksponentti').fill(String(exponent));
  await input(page, 'Arvo').fill(answer);
  const [n, d] = answer.split('/').map(BigInt);
  const less = d! < 0n || n! < d!;
  await menu(page, 'Oma arvo verrattuna yhteen').selectOption(less ? 'less' : n === d ? 'equal' : 'greater');
  const other = workbench(page).getByRole('textbox', { name: /^Vertailun .* arvo$/ });
  if (await other.count()) await other.fill(fractionPower('2', exponent));
  await menu(page, 'Kannan ehto').selectOption('nonzero');
}

test.describe('Kivien salainen tähtitorni', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
  });

  test('a real factor tree rejects a factor of one and unfinished leaves before guided keyboard recovery', async ({ page }, info) => {
    await open(page, 'M79-PRIMEFACT-01');
    expect((await state(page)).family).toBe('open-factor-tree');
    const root = Number(await givens(page).locator('dd').first().innerText());
    await split(page, root, 1, root);
    await expect(page.locator('[data-power-display="tree-status"]')).toContainText('tekijää');
    expect((await saved(page)).attempts).toHaveLength(0);
    await input(page, 'Lehtien tulo').fill(String(root));
    await submit(page, false);
    await expect(feedback(page)).toContainText('alkuluku');
    await button(page, 'Näytä ja selitä').click();
    await button(page, 'Uusi yhteinen kokeilu').click();
    expect((await state(page)).phase).toBe('guided');
    const newRoot = Number(await givens(page).locator('dd').first().innerText());
    await completeTree(page);
    await input(page, 'Lehtien tulo').fill(String(newRoot));
    await submit(page, true);
    expect((await saved(page)).attempts[1]).toMatchObject({ ok: true, phase: 'guided' });
    const path = info.outputPath('completed-factor-tree.png');
    await page.screenshot({ path });
    await info.attach('completed-factor-tree', { path, contentType: 'image/png' });
  });

  test('positive expansion distinguishes the outside minus and the parenthesized negative base', async ({ page }) => {
    await open(page, 'M79-POWER-POS', 1);
    expect((await state(page)).family).toBe('distinguish-minus-parentheses');
    const [source, other] = await givens(page).locator('dd').allTextContents();
    const negativeOutside = source!.startsWith('−');
    const b = Number(source!.match(/\d+/)![0]);
    const base = negativeOutside ? String(b) : `−${b}`;
    await button(page, `Lisää tekijä ${base}`).press('Enter');
    await button(page, `Lisää tekijä ${base}`).click();
    await expect(page.locator('[data-power-display="factor-sequence"]')).toContainText('×');
    await input(page, 'Arvo').fill(String(negativeOutside ? -(b * b) : b * b));
    await menu(page, `Arvo verrattuna potenssiin ${other}`).selectOption(negativeOutside ? 'less' : 'greater');
    await submit(page, true);
  });

  test('fractional-base transfer computes both reciprocal values and can exceed one', async ({ page }) => {
    await open(page, 'M79-POWER-NEG');
    const families = new Set<string>();
    for (let i = 0; i < 3; i++) {
      families.add((await state(page)).family);
      await reciprocal(page);
      await submit(page, true);
      if (i < 2) await button(page, 'Seuraava kokeilu').click();
    }
    expect(families).toEqual(new Set(['reciprocal-light-scale', 'reciprocal-symbol-bases']));
    await button(page, 'Kokeile uudessa tilanteessa').click();
    expect((await state(page)).phase).toBe('transfer');
    await expect(givens(page)).toContainText('(1/2)⁻');
    await reciprocal(page);
    await expect(menu(page, 'Oma arvo verrattuna yhteen')).toHaveValue('greater');
    await submit(page, true);
    expect((await state(page)).progress.checked).toBe(true);
    expect((await saved(page)).events).toEqual([expect.objectContaining({ node: 'M79-POWER-NEG', assisted: false })]);
  });

  test('symbolic simplification needs both fresh families, every step and the original denominator condition', async ({ page }) => {
    await open(page, 'M79-POWER-SIMPLIFY');
    const families = new Set<string>();
    for (let i = 0; i < 3; i++) {
      families.add((await state(page)).family);
      await expect(menu(page, 'Vaihe 2: sääntö')).toBeDisabled();
      await simplify(page);
      await submit(page, true);
      if (i < 2) await button(page, 'Seuraava kokeilu').click();
    }
    expect(families).toEqual(new Set(['nested-before-product', 'product-before-quotient']));
    await button(page, 'Kokeile uudessa tilanteessa').click();
    expect((await state(page))).toMatchObject({ phase: 'transfer', contentContext: { rules: ['potenssin-potenssi', 'osamäärä'] } });
    await simplify(page, true);
    await submit(page, false);
    expect((await state(page)).progress.checked).toBe(false);
    await button(page, 'Uusi kokeilu').click();
    await simplify(page);
    await submit(page, true);
    expect((await state(page)).progress.checked).toBe(true);
  });

  test('different bases require two exact counterexample values and a rejection of same-base addition', async ({ page }) => {
    await open(page, 'M79-POWER-PROD', 1);
    expect((await state(page)).family).toBe('test-different-base-counterexample');
    const [source, proposed] = await givens(page).locator('dd').allTextContents();
    const [a, b] = source!.match(/\d+/g)!.map(BigInt);
    const [p, q] = parsePowers(source!);
    const [candidate] = proposed!.match(/\d+/g)!.map(BigInt);
    const [power] = parsePowers(proposed!);
    const lhs = a! ** BigInt(p!) * b! ** BigInt(q!);
    const rhs = candidate! ** BigInt(power!);
    expect(lhs).not.toBe(rhs);
    await menu(page, 'Vaihe 1: sääntö').selectOption('keep');
    await input(page, 'Tulon arvo').fill(String(lhs));
    await input(page, 'Ehdotuksen arvo').fill(String(rhs));
    await menu(page, 'Kannan ehto').selectOption('any');
    await submit(page, true);
  });

  test('cancellation marks actual factor pairs and nested powers use repeated whole groups', async ({ page }) => {
    await open(page, 'M79-POWER-QUOT', 1);
    const initial = await givens(page).locator('dd').first().innerText();
    const [a, b] = parsePowers(initial);
    const mark = button(page, 'Supista pari');
    for (let i = 0; i < Math.min(a!, b!); i++) await mark.press('Enter');
    await expect(workbench(page).locator('[data-power-rule-diagram] [aria-label$="supistettu"]')).toHaveCount(2 * Math.min(a!, b!));
    await menu(page, 'Vaihe 1: sääntö').selectOption('difference');
    await input(page, 'Vaihe 1: eksponentti').fill(String(a! - b!));
    await input(page, 'Lopullinen kanta').fill(strip(initial).match(/[a-z]|\d+/)![0]!);
    await input(page, 'Lopullinen eksponentti').fill(String(a! - b!));
    await menu(page, 'Kannan ehto').selectOption('nonzero');
    await submit(page, true);

    await open(page, 'M79-POWER-POWER', 7);
    const nested = await givens(page).locator('dd').first().innerText();
    const [inner, outer] = parsePowers(nested);
    for (let i = 0; i < outer!; i++) await button(page, 'Lisää ryhmä').click();
    await expect(workbench(page).locator('[data-power-rule-diagram] span')).toHaveCount(outer!);
    await menu(page, 'Vaihe 1: sääntö').selectOption('multiply');
    await input(page, 'Vaihe 1: eksponentti').fill(String(inner! * outer!));
    await input(page, 'Lopullinen kanta').fill(nested.match(/\d+/)![0]!);
    await input(page, 'Lopullinen eksponentti').fill(String(inner! * outer!));
    await menu(page, 'Kannan ehto').selectOption('any');
    await submit(page, true);
  });

  for (const [label, viewport] of [
    ['desktop', { width: 1366, height: 768 }], ['tablet', { width: 768, height: 1024 }],
  ] as const) {
    test(`both families of all eleven tasks fit ${label}`, async ({ page }, info) => {
      test.setTimeout(90_000);
      await page.setViewportSize(viewport);
      for (const id of ids) {
        const families = new Set<string>();
        for (const seed of [1, 7]) {
          await open(page, id, seed);
          families.add((await state(page)).family);
          if (id === 'M79-PRIMEFACT-01') await page.locator('[data-power-tree] button').first().click();
          if (id === 'M79-POWER-SIMPLIFY') await simplify(page);
          if (id === 'M79-PRIME-01') {
            const selectors = await workbench(page).getByRole('combobox').all();
            for (const selector of selectors) await selector.selectOption('composite');
          }
          const bounds = await page.evaluate(() => {
            const boxes = [...document.querySelectorAll('[data-power-givens], [data-power-workbench]')].map(node => node.getBoundingClientRect());
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
        if (id === 'M79-PRIMEFACT-01' || id === 'M79-POWER-SIMPLIFY') {
          const path = info.outputPath(`${id}-${label}.png`);
          await page.screenshot({ path });
          await info.attach(id, { path, contentType: 'image/png' });
        }
      }
    });
  }
});
