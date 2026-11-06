import { expect, test, type Page } from '@playwright/test';

const ids = ['M79-EQ1-CHECK', 'M79-INEQ-01', 'M79-INEQ-SOLVE', 'M79-QUAD-INCOMP-01', 'M79-QUAD-INCOMP-02'] as const;
type Id = typeof ids[number];
const board = (page: Page) => page.locator('.equation-workshop');
const task = (page: Page) => page.locator('.exp-task');
const feedback = (page: Page) => page.locator('.exp-feedback');
const values = (page: Page) => board(page).locator('table tbody td').allTextContents();
const go = async (page: Page, id: Id, seed = 1) => {
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await page.getByRole('button', { name: 'Kokeilen itse', exact: true }).click();
  await expect(board(page)).toBeVisible();
};
const field = (page: Page, name: string) => task(page).getByRole('textbox', { name, exact: true });
const select = (page: Page, name: string) => task(page).getByRole('combobox', { name, exact: true });
const verify = (page: Page) => task(page).getByRole('button', { name: 'Tarkista', exact: true });
const next = (page: Page, label = 'Uusi kokeilu') => page.getByRole('button', { name: label, exact: true }).click();
const saved = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3')!));
const number = (value: string) => Number(value.replace(/−/g, '-').replace(/\s+/g, ''));
function linear(source: string, variable: string) {
  const parts = source.replace(/\s+/g, '').split(variable);
  if (parts.length === 1) return { a: 0, b: number(parts[0]!) };
  const prefix = parts[0]!;
  return { a: prefix === '' || prefix === '+' ? 1 : prefix === '−' ? -1 : number(prefix), b: number(parts[1]!) };
}
async function substitution(page: Page, flip: boolean) {
  const [equation, candidate] = await values(page);
  const [l, r] = equation!.split(' = ').map(value => linear(value, 'x'));
  const x = number(candidate!.split(' = ')[1]!);
  const left = l!.a * x + l!.b, right = r!.a * x + r!.b;
  await field(page, 'Vasemman puolen arvo').fill(String(left));
  await field(page, 'Oikean puolen arvo').fill(String(right));
  await select(page, 'Ovatko arvot samat?').selectOption(((left === right) !== flip) ? 'yes' : 'no');
  await verify(page).click();
  return { left, right };
}
function compare(a: number, sign: string, b: number) {
  return sign === '<' ? a < b : sign === '≤' ? a <= b : sign === '>' ? a > b : a >= b;
}
async function inequality(page: Page, variable: string, reverse = false, wrongDomain = false) {
  const [condition, domain] = await values(page);
  const [source, relation, rhs] = condition!.split(/ ([<≤>≥]) /u);
  const { a, b } = linear(source!, variable);
  const right = number(rhs!);
  const boundary = (right - b) / a;
  const allows = (x: number) => (!domain!.includes('≥ 0') || x >= 0) && compare(a * x + b, relation!, right);
  const higher = allows(boundary + .25);
  const inclusive = allows(boundary);
  if (await field(page, 'Jaa luvulla').count()) await field(page, 'Jaa luvulla').fill(String(a));
  await field(page, 'Raja-arvo').fill(String(boundary));
  await select(page, 'Alueen suunta').selectOption(higher !== reverse ? 'higher' : 'lower');
  await select(page, 'Kuuluuko rajakohta?').selectOption(inclusive ? 'closed' : 'open');
  await expect(board(page)).toContainText('Merkitsemäsi alue');
  const samples = task(page).getByRole('combobox', { name: /^Kuuluuko .* joukkoon\?$/ });
  for (const sample of await samples.all()) {
    const caption = await sample.getAttribute('aria-label');
    const n = number(caption!.split(' ')[1]!);
    await sample.selectOption(allows(n) || (wrongDomain && n < 0) ? 'yes' : 'no');
  }
  await verify(page).click();
  return { a, boundary, inclusive, higher };
}
async function roots(page: Page, values: string[], principal: string | null, useSymbol = false) {
  await select(page, 'Reaaliratkaisujen määrä').selectOption(String(values.length));
  await select(page, 'Onko reaalista pääarvoa?').selectOption(principal === null ? 'no' : 'yes');
  for (const [index, value] of values.entries()) {
    const input = field(page, `Ratkaisu ${index + 1}`);
    if (useSymbol && value.startsWith('√')) {
      await input.focus();
      await task(page).getByRole('button', { name: 'Lisää neliöjuurimerkki' }).click();
      await input.pressSequentially(value.slice(1));
      await expect(input).toHaveValue(value);
    } else await input.fill(value);
  }
  if (principal !== null) await field(page, 'Neliöjuuren pääarvo').fill(principal);
  await verify(page).click();
}

test.describe('Tasapainon sulku', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(original, this, [type, ...args]);
      } as typeof original;
    });
  });

  test('checks both substituted sides before accepting same or different', async ({ page }) => {
    await go(page, 'M79-EQ1-CHECK');
    const first = await substitution(page, true);
    expect(first.left).not.toBe(first.right);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await expect(feedback(page)).toContainText('yhtä suuret');
    await next(page);
    await page.getByRole('button', { name: 'Pieni vihje', exact: true }).click();
    await expect(page.locator('.exp-help')).toContainText('jokainen x');
    const expected = await values(page);
    const second = await substitution(page, false);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    await expect(board(page)).toContainText(second.left === second.right ? 'on ratkaisu' : 'ei toteuta yhtälöä');
    expect(await values(page)).toEqual(expected);
    expect((await saved(page)).attempts).toMatchObject([{ ok: false, help: [] }, { ok: true, help: ['hint'] }]);
  });

  test('checks the physical starting domain as well as the closed boundary', async ({ page }) => {
    await go(page, 'M79-INEQ-01', 0);
    const bad = await inequality(page, 'm', false, true);
    expect(bad.inclusive).toBe(true);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await expect(feedback(page)).toContainText('Negatiivinen määrä');
    await go(page, 'M79-INEQ-01', 7);
    const good = await inequality(page, 'm');
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    await expect(board(page)).toContainText(`Ratkaisujoukko: 0 ≤ m ≤ ${good.boundary}`);
  });

  test('rejects retaining direction after negative division and transfers to a closed endpoint', async ({ page }) => {
    await go(page, 'M79-INEQ-SOLVE');
    const rejected = await inequality(page, 'x', true);
    expect(rejected.a).toBeLessThan(0);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await expect(feedback(page)).toContainText('kääntää');
    const signs = new Set<number>();
    for (let i = 0; i < 3; i++) {
      await next(page, i === 0 ? 'Uusi kokeilu' : 'Seuraava kokeilu');
      const got = await inequality(page, 'x');
      signs.add(Math.sign(got.a));
      await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    }
    expect(signs).toEqual(new Set([-1, 1]));
    await next(page, 'Kokeile uudessa tilanteessa');
    const transfer = await inequality(page, 'x');
    expect(transfer.inclusive).toBe(true);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    expect((await saved(page)).events).toEqual([expect.objectContaining({ node: 'M79-INEQ-SOLVE', assisted: false })]);
  });

  test('produces exact signed roots, zero and the empty set separately from the principal root', async ({ page }) => {
    await go(page, 'M79-QUAD-INCOMP-02', 15);
    expect((await values(page))[0]).toBe('x² = 8');
    await roots(page, ['√8', '2√2'], '√8');
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await expect(feedback(page)).toContainText('kaksi eri reaalilukua');
    await go(page, 'M79-QUAD-INCOMP-02', 0);
    expect((await values(page))[0]).toBe('x² = 2');
    await roots(page, ['−√2', '√2'], '√2', true);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    await expect(board(page)).toContainText('{ −√2, √2 }');
    await go(page, 'M79-QUAD-INCOMP-02', 1);
    await roots(page, ['0'], '0');
    await expect(field(page, 'Ratkaisu 2')).toHaveCount(0);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    await go(page, 'M79-QUAD-INCOMP-02', 2);
    await roots(page, [], null);
    await expect(field(page, 'Ratkaisu 1')).toHaveCount(0);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    await expect(board(page)).toContainText('Ratkaisujoukko: ∅');
    await expect(board(page)).toContainText('kiertoreitti');
    await next(page, 'Kokeile uudessa tilanteessa');
    await expect(board(page).getByRole('columnheader', { name: 'Yhtälö' })).toBeVisible();
  });

  for (const [name, viewport] of [
    ['desktop', { width: 1366, height: 768 }],
    ['tablet', { width: 768, height: 1024 }],
  ] as const) {
    test(`all five complete response controls fit ${name}`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      for (const id of ids) {
        await go(page, id, id === 'M79-INEQ-01' || id === 'M79-QUAD-INCOMP-02' ? 0 : 1);
        if (id === 'M79-QUAD-INCOMP-02') {
          await select(page, 'Reaaliratkaisujen määrä').selectOption('2');
          await select(page, 'Onko reaalista pääarvoa?').selectOption('yes');
        }
        await expect(page.locator('.exp-instruction'), id).toBeInViewport({ ratio: 1 });
        await expect(board(page), id).toBeInViewport({ ratio: 1 });
        await expect(task(page).getByRole('button', { name: id === 'M79-QUAD-INCOMP-01' ? 'Valmis' : 'Tarkista', exact: true }), id).toBeInViewport({ ratio: 1 });
        expect(await page.evaluate(() => window.scrollY), id).toBe(0);
        expect(await board(page).locator('.table-wrap').evaluate(table => table.scrollWidth - table.clientWidth), id).toBeLessThanOrEqual(1);
        if (id === 'M79-QUAD-INCOMP-02') {
          const path = testInfo.outputPath(`equation-roots-${name}.png`);
          await page.screenshot({ path });
          await testInfo.attach(`equation-roots-${name}`, { path, contentType: 'image/png' });
        }
      }
    });
  }
});
