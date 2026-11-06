import { expect, test, type Page } from '@playwright/test';

const id = 'M79-PCT-CHANGED';
const board = (page: Page) => page.locator('.quantity-workbench');
const task = (page: Page) => page.locator('.exp-task');
const feedback = (page: Page) => page.locator('.exp-feedback');
const exactCells = (page: Page) => board(page).locator('table tbody td').allTextContents();
const snapshot = (page: Page): Promise<{ phase: string; family: string; quantity: { rows: { amount: number | null; extent?: number }[] } }> =>
  page.evaluate(() => JSON.parse((window as Window & { render_game_to_text: () => string }).render_game_to_text()));
const goto = async (page: Page, seed: number) => {
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await page.getByRole('button', { name: 'Kokeilen itse', exact: true }).click();
  await expect(board(page)).toBeVisible();
};

async function readGivens(page: Page) {
  const [original] = await exactCells(page);
  const [value, unit] = original!.trim().split(/\s+/);
  const text = (await board(page).locator('p').allTextContents()).join(' ');
  const words = text.match(/(vähenee|kasvaa) (\d+) %/u);
  const loss = text.match(/kuluu (\d+) %/u);
  if (!words && !loss) throw new Error('Change magnitude and direction must be visible');
  const sign = loss || words?.[1] === 'vähenee' ? -1 : 1;
  const percent = Number(loss?.[1] ?? words?.[2]);
  const before = Number(value);
  const change = before * percent / 100;
  return { before, unit: unit!, percent, sign, change, after: before + sign * change };
}

const numericAnswer = async (page: Page, answer: number) => {
  for (const key of String(answer)) await task(page).locator('.keys').getByRole('button', { name: key === '.' ? ',' : key, exact: true }).click();
  await task(page).getByRole('button', { name: 'OK', exact: true }).click();
};
const buildAnswer = async (page: Page, sequence: string[]) => {
  for (const token of sequence) await task(page).locator('.tray').getByRole('button', { name: token, exact: true }).click();
  await task(page).getByRole('button', { name: 'Valmis', exact: true }).click();
};
const symbols = async (page: Page) => {
  const tokenText = (await task(page).locator('.tray button').allTextContents()).map((token) => token.trim());
  return { times: tokenText.includes('·') ? '·' : '*', minus: tokenText.includes('−') ? '−' : '-' };
};
const answer = async (page: Page, given: Awaited<ReturnType<typeof readGivens>>, expression: boolean) => {
  if (!expression) {
    await numericAnswer(page, given.after);
    return;
  }
  const { times, minus } = await symbols(page);
  await buildAnswer(page, [String(given.before), times, '(', '1', given.sign < 0 ? minus : '+', String(given.percent), '/', '100', ')']);
};
const assertHidden = async (page: Page) => {
  const [, ...unanswered] = await exactCells(page);
  expect(unanswered).toEqual(['?', '?']);
  const [, ...unknown] = (await snapshot(page)).quantity.rows;
  expect(unknown).toHaveLength(2);
  for (const row of unknown) {
    expect(row).toMatchObject({ amount: null });
    expect(row).not.toHaveProperty('extent');
  }
};
const referenceWidth = (page: Page) => board(page).locator('svg rect').first().getAttribute('width');
const assertCorrectBoard = async (page: Page, given: Awaited<ReturnType<typeof readGivens>>) => {
  await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
  await expect(board(page)).toContainText('100 %:');
  expect(await exactCells(page)).toEqual([
    `${given.before} ${given.unit}`, `${given.change} ${given.unit}`, `${given.after} ${given.unit}`,
  ]);
};

test.describe('Changed amount after a percentage change', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(original, this, [type, ...args]);
      } as typeof original;
    });
  });

  test('keeps the new whole hidden after a change-only mistake, then recovers with a hint', async ({ page }) => {
    await goto(page, 7);
    await assertHidden(page);
    const first = await readGivens(page);
    expect(first.percent).toBeGreaterThan(100);
    expect(first.after).toBeGreaterThan(first.before * 2);
    await numericAnswer(page, first.change);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await expect(feedback(page)).toContainText('muutoksen määrä');
    await assertHidden(page);
    await page.getByRole('button', { name: 'Uusi kokeilu', exact: true }).click();
    await page.getByRole('button', { name: 'Pieni vihje', exact: true }).click();
    await expect(page.locator('.exp-help')).toContainText('Lähtömäärä on 100 %');
    const next = await readGivens(page);
    expect(next.sign).toBe(-1);
    await numericAnswer(page, next.after);
    await assertCorrectBoard(page, next);
    const attempts = await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3')!).attempts);
    expect(attempts).toMatchObject([{ ok: false, help: [] }, { ok: true, help: ['hint'] }]);
  });

  test('requires constructing a calculation even when the correct value is a supplied number tile', async ({ page }) => {
    await goto(page, 11);
    expect((await snapshot(page)).family).toBe('new-expression');
    const first = await readGivens(page);
    expect(first.after).toBe(100);
    await buildAnswer(page, ['100']);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await assertHidden(page);

    await goto(page, 1);
    expect((await snapshot(page)).family).toBe('new-expression');
    const next = await readGivens(page);
    const { times, minus } = await symbols(page);
    await buildAnswer(page, [String(next.before), times, String(next.percent), '/', '100']);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await expect(feedback(page)).toContainText('vain muutoksen');
    await assertHidden(page);

    await goto(page, 10);
    const third = await readGivens(page);
    await buildAnswer(page, [String(third.before), third.sign < 0 ? minus : '+', String(third.before), times, String(third.percent), '/', '100']);
    await assertCorrectBoard(page, third);
  });

  test('reaches material-loss transfer with both production families and retains the reference after answering', async ({ page }) => {
    await goto(page, 7);
    const seen = new Set<string>();
    for (let i = 0; i < 3; i++) {
      await assertHidden(page);
      const { family } = await snapshot(page);
      seen.add(family);
      const given = await readGivens(page);
      const reference = await referenceWidth(page);
      await answer(page, given, family === 'new-expression');
      await assertCorrectBoard(page, given);
      expect(await referenceWidth(page)).toBe(reference);
      if (i < 2) await page.getByRole('button', { name: 'Seuraava kokeilu', exact: true }).click();
    }
    expect([...seen].sort()).toEqual(['new-amount', 'new-expression']);
    await page.getByRole('button', { name: 'Kokeile uudessa tilanteessa', exact: true }).click();
    expect((await snapshot(page)).phase).toBe('transfer');
    await assertHidden(page);
    const given = await readGivens(page);
    expect(given.unit).toBe('m');
    expect(given.sign).toBe(-1);
    await numericAnswer(page, given.after);
    await assertCorrectBoard(page, given);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3')!));
    expect(saved.events).toEqual([expect.objectContaining({ node: id, assisted: false })]);
  });

  for (const [name, viewport] of [
    ['desktop', { width: 1366, height: 768 }],
    ['tablet', { width: 768, height: 1024 }],
  ] as const) {
    test(`givens and essential response controls are visible on ${name}`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      for (const seed of [7, 11]) {
        await goto(page, seed);
        await expect(page.locator('.exp-instruction')).toBeInViewport({ ratio: 1 });
        await expect(board(page)).toBeInViewport({ ratio: 1 });
        const first = task(page).locator('button').first();
        const done = task(page).getByRole('button', { name: seed === 7 ? 'OK' : 'Valmis', exact: true });
        await expect(first).toBeInViewport({ ratio: 1 });
        await expect(done).toBeInViewport({ ratio: 1 });
        const width = await board(page).locator('.table-wrap').evaluate(el => el.scrollWidth - el.clientWidth);
        expect(width).toBeLessThanOrEqual(1);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
        if (seed === 11) {
          const path = testInfo.outputPath(`changed-amount-${name}.png`);
          await page.screenshot({ path });
          await testInfo.attach(`changed-amount-${name}`, { path, contentType: 'image/png' });
        }
        const given = await readGivens(page);
        await answer(page, given, seed === 11);
        await assertCorrectBoard(page, given);
        await expect(board(page)).toBeInViewport({ ratio: 1 });
        await expect(page.getByRole('button', { name: 'Seuraava kokeilu', exact: true })).toBeInViewport({ ratio: 1 });
        if (seed === 7) {
          const path = testInfo.outputPath(`changed-amount-result-${name}.png`);
          await page.screenshot({ path });
          await testInfo.attach(`changed-amount-result-${name}`, { path, contentType: 'image/png' });
        }
      }
    });
  }
});
