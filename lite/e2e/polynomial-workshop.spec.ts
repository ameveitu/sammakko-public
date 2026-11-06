import { expect, test, type Page } from '@playwright/test';

const ids = [
  'M79-EXPR-SIMPLIFY', 'M79-POLY-CONCEPT', 'M79-TERM-01', 'M79-POLY-01', 'M79-POLY-ADD',
  'M79-POLY-MUL-MONO', 'M79-POLY-MUL', 'M79-POLY-SUBTRACT', 'M79-SIGN-PARENS', 'M79-POLY-SUB',
] as const;
type Id = typeof ids[number];
type Part = { coefficient: number; power: number };
const workbench = (page: Page) => page.locator('.polynomial-workshop');
const task = (page: Page) => page.locator('.exp-task');
const feedback = (page: Page) => page.locator('.exp-feedback');
const go = async (page: Page, id: Id, seed = 1) => {
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await page.getByRole('button', { name: 'Kokeilen itse', exact: true }).click();
  await expect(workbench(page)).toBeVisible();
};
const givens = (page: Page) => workbench(page).locator('table').first().locator('tbody tr td:nth-child(2)').allTextContents();
const read = (expression: string): Part[] => Array.from(expression.replace(/\s+/g, '').matchAll(/([+−]?)(\d*)([a-z])?([²³])?/gu))
  .filter(match => match[2] || match[3])
  .map(([, sign, coefficient, variable, exponent]) => ({
    coefficient: (sign === '−' ? -1 : 1) * Number(coefficient || 1),
    power: !variable ? 0 : exponent === '³' ? 3 : exponent === '²' ? 2 : 1,
  }));
function collect(terms: readonly Part[]): Part[] {
  return [0, 1, 2, 3].map(power => ({
    power, coefficient: terms.filter(term => term.power === power).reduce((sum, term) => sum + term.coefficient, 0),
  })).filter(term => term.coefficient !== 0);
}
const print = (parts: readonly Part[], variable = 'x') => parts.map(({ coefficient, power }, index) => {
  const size = Math.abs(coefficient);
  const body = power === 0 ? String(size) : (size === 1 ? '' : size) + variable + (power === 3 ? '³' : power === 2 ? '²' : '');
  return (coefficient < 0 ? '−' : index ? '+' : '') + body;
}).join('') || '0';
const cross = (a: readonly Part[], b: readonly Part[]) =>
  b.flatMap(right => a.map(left => ({ power: left.power + right.power, coefficient: left.coefficient * right.coefficient })));
const keyIn = async (page: Page, expression: string) => {
  const tokens = expression.match(/[a-z][²³]?|[0-9+−→]/gu) ?? [];
  for (const token of tokens) await task(page).locator('.tray').getByRole('button', { name: token, exact: true }).click();
};
const send = async (page: Page) => task(page).getByRole('button', { name: 'Valmis', exact: true }).click();
const answer = async (page: Page, expression: string) => { await keyIn(page, expression); await send(page); };
const saved = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3')!));

test.describe('Muuttujien telakka', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(original, this, [type, ...args]);
      } as typeof original;
    });
  });

  test('keeps different tile types apart and supports wrong answer → hint → recovery', async ({ page }) => {
    await go(page, 'M79-EXPR-SIMPLIFY', 0);
    const [given] = await givens(page);
    const parts = read(given!);
    await answer(page, print([{ power: 1, coefficient: parts.reduce((sum, part) => sum + part.coefficient, 0) }]));
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await expect(feedback(page)).toContainText('Vakioluku');
    await expect(workbench(page)).not.toContainText('Valmis rivi');

    await page.getByRole('button', { name: 'Uusi kokeilu', exact: true }).click();
    const grouping = page.getByRole('button', { name: 'Järjestä laattalajit', exact: true });
    await grouping.press('Space');
    await expect(grouping).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Pieni vihje', exact: true }).click();
    await expect(page.locator('.exp-help')).toContainText('sama muuttujaosa');
    const [next] = await givens(page);
    const result = print(collect(read(next!)));
    await answer(page, result);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    expect((await givens(page))[0]).toBe(next);
    await expect(workbench(page)).toContainText('Valmis rivi:');
    await expect(workbench(page)).toContainText('Kaksi kokeilua');
    expect((await saved(page)).attempts).toMatchObject([{ ok: false, help: [] }, { ok: true, help: ['hint'] }]);
  });

  test('requires the cancelling cross products before accepting the collected product', async ({ page }) => {
    await go(page, 'M79-POLY-MUL');
    const inspect = page.getByRole('button', { name: 'Näytä osaparit', exact: true });
    await inspect.click();
    await expect(inspect).toHaveAttribute('aria-pressed', 'true');
    const [a, b] = await givens(page);
    const products = cross(read(a!), read(b!));
    const final = print(collect(products));
    const corners = products.filter(part => part.power !== 1);
    expect(corners).toHaveLength(2);
    await answer(page, `${print(corners)}→${final}`);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await expect(feedback(page)).toContainText('osatulot');
    expect((await saved(page)).attempts[0]).toMatchObject({ ok: false, math: true, proc: false });

    await page.getByRole('button', { name: 'Uusi kokeilu', exact: true }).click();
    const [nextA, nextB] = await givens(page);
    const nextProducts = cross(read(nextA!), read(nextB!));
    await answer(page, `${print(nextProducts)}→${print(collect(nextProducts))}`);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    expect(await givens(page)).toEqual([nextA, nextB]);
    await expect(workbench(page)).toContainText('Avattu rivi');
    await expect(workbench(page)).toContainText('Valmis rivi');
  });

  test('requires both the signed expansion and collected difference', async ({ page }) => {
    await go(page, 'M79-POLY-SUB');
    const [a, b] = await givens(page);
    const expanded = [...read(a!), ...read(b!).map(term => ({ ...term, coefficient: -term.coefficient }))];
    const output = print(collect(expanded));
    await answer(page, output);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await expect(feedback(page)).toContainText('nuoli');
    await page.getByRole('button', { name: 'Uusi kokeilu', exact: true }).click();
    const [nextA, nextB] = await givens(page);
    const opened = [...read(nextA!), ...read(nextB!).map(term => ({ ...term, coefficient: -term.coefficient }))];
    await answer(page, `${print(opened)}→${print(collect(opened))}`);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    await expect(workbench(page)).toContainText('Avattu rivi');
    expect(await givens(page)).toEqual([nextA, nextB]);
  });

  for (const [name, viewport] of [
    ['desktop', { width: 1366, height: 768 }],
    ['tablet', { width: 768, height: 1024 }],
  ] as const) {
    test(`all ten task prompts, boards and response controls fit ${name}`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      for (const id of ids) {
        await go(page, id);
        await expect(page.locator('.exp-instruction'), id).toBeInViewport({ ratio: 1 });
        await expect(workbench(page), id).toBeInViewport({ ratio: 1 });
        await expect(task(page).locator('button').first(), id).toBeInViewport({ ratio: 1 });
        await expect(task(page).getByRole('button', { name: 'Valmis', exact: true }), id).toBeInViewport({ ratio: 1 });
        expect(await page.evaluate(() => window.scrollY), id).toBe(0);
        const overflow = await workbench(page).locator('.table-wrap').evaluateAll(tables =>
          Math.max(...tables.map(table => table.scrollWidth - table.clientWidth)));
        expect(overflow, id).toBeLessThanOrEqual(1);
        if (id === 'M79-POLY-MUL') {
          const [a, b] = await givens(page);
          const products = cross(read(a!), read(b!));
          await keyIn(page, `${print(products)}→${print(collect(products))}`);
          await expect(task(page).getByRole('button', { name: 'Valmis', exact: true })).toBeInViewport({ ratio: 1 });
          const path = testInfo.outputPath(`polynomial-${name}.png`);
          await page.screenshot({ path });
          await testInfo.attach(`polynomial-${name}`, { path, contentType: 'image/png' });
          await send(page);
          for (let i = 0; i < 2; i++) {
            await page.getByRole('button', { name: 'Seuraava kokeilu', exact: true }).click();
            const [left, right] = await givens(page);
            const terms = cross(read(left!), read(right!));
            await answer(page, `${print(terms)}→${print(collect(terms))}`);
            await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
          }
          await page.getByRole('button', { name: 'Kokeile uudessa tilanteessa', exact: true }).click();
          const [left, right] = await givens(page);
          const expanded = cross(read(left!), read(right!));
          expect(expanded).toHaveLength(6);
          await keyIn(page, `${print(expanded, 'a')}→${print(collect(expanded), 'a')}`);
          // Remove the previous result's native focus scroll before checking top-of-page fit.
          await page.evaluate(() => window.scrollTo(0, 0));
          await expect(workbench(page)).toBeInViewport({ ratio: 1 });
          await expect(task(page).locator('.build-line')).toBeInViewport({ ratio: 1 });
          await expect(task(page).locator('.tray')).toBeInViewport({ ratio: 1 });
          await expect(task(page).getByRole('button', { name: 'Valmis', exact: true })).toBeInViewport({ ratio: 1 });
          expect(await page.evaluate(() => window.scrollY)).toBe(0);
          const transferPath = testInfo.outputPath(`polynomial-transfer-${name}.png`);
          await page.screenshot({ path: transferPath });
          await testInfo.attach(`polynomial-transfer-${name}`, { path: transferPath, contentType: 'image/png' });
          await send(page);
          await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
          expect((await saved(page)).events).toEqual([expect.objectContaining({ node: id, assisted: false })]);
        }
      }
    });
  }
});
