import { expect, test, type Page } from '@playwright/test';

const ids = [
  'M-FRAC-16', 'M-STAT-04', 'M79-PCT-REFBASE', 'M79-PCT-SHARE', 'M79-PCT-AMOUNT',
  'M79-PCT-BASE', 'M79-PCT-CHANGE', 'M79-PCT-COMP', 'M79-PCT-PP',
] as const;
type Id = typeof ids[number];
type Snapshot = {
  node: Id;
  phase: 'guided' | 'independent' | 'transfer';
  family: string;
  quantity?: { rows?: { amount: number | null; extent?: number }[] } | null;
  progress: { checked: boolean };
};

const snapshot = (page: Page): Promise<Snapshot> => page.evaluate(() => {
  const world = window as Window & { render_game_to_text?: () => string };
  return JSON.parse(world.render_game_to_text!());
});
const task = (page: Page) => page.locator('.exp-task');
const workbench = (page: Page) => page.locator('.quantity-workbench');
const submitButton = (page: Page) => task(page).getByRole('button', { name: 'OK', exact: true });
const outcome = (page: Page) => page.locator('.exp-feedback');
const goto = async (page: Page, id: Id, seed = 1) => {
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await page.getByRole('button', { name: 'Kokeilen itse', exact: true }).click();
  await expect(workbench(page)).toBeVisible();
};
const keypad = (page: Page, character: string) => task(page).locator('.keys').getByRole('button', { name: character, exact: true });
const enterNumber = async (page: Page, n: number) => {
  for (const key of String(n)) {
    await keypad(page, key === '-' ? 'Miinus' : key === '.' ? ',' : key).click();
  }
};
const numberAnswer = async (page: Page, n: number) => {
  await enterNumber(page, n);
  await submitButton(page).click();
};
const planTransfer = async (page: Page, difference: number, relative: number, swapUnits = false) => {
  const units = swapUnits ? ['%', '%-yks.'] : ['%-yks.', '%'];
  const characters = (number: number) => Array.from(String(number).replace('-', '−'));
  for (const token of [...characters(difference), units[0]!, ...characters(relative), units[1]!]) {
    await task(page).locator('.tray').getByRole('button', { name: token, exact: true }).click();
  }
  await task(page).getByRole('button', { name: 'Valmis', exact: true }).click();
};
const valuesOnBoard = (page: Page) => workbench(page).locator('table tbody td').allTextContents();
const numericGivens = async (page: Page) => (await valuesOnBoard(page)).map(cell => Number.parseFloat(cell.replace(',', '.')));
async function planRead(page: Page) {
  const [plan, first, second] = await numericGivens(page);
  const before = 100 * first! / plan!;
  const after = 100 * second! / plan!;
  return { difference: after - before, relative: 100 * (after - before) / before };
}

test.describe('Corrected quantity workbenches', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    // Exact workbench and controls must be usable with the same visual fallback on any CI host.
    await page.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...options: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(getContext, this, [type, ...options]);
      } as typeof getContext;
    });
  });

  test('accepts an unsimplified fraction relative to the original cake', async ({ page }) => {
    await goto(page, 'M-FRAC-16');
    const [whole, part, recipients] = await valuesOnBoard(page);
    expect(whole).toBe('Yksi kakku');
    const [n, d] = part!.split('/').map(Number);
    const numerator = 2 * n!;
    const denominator = 2 * d! * Number(recipients);
    await enterNumber(page, numerator);
    await keypad(page, 'Vaihda osoittaja tai nimittäjä').click();
    await enterNumber(page, denominator);
    await submitButton(page).click();
    await expect(outcome(page)).toHaveAttribute('data-ok', 'true');
    const attempt = await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3')!).attempts[0]);
    expect(JSON.parse(attempt.resp)).toEqual({ kind: 'frac', n: numerator, d: denominator });
  });

  test('rejects replacing original observations with their equal level', async ({ page }) => {
    await goto(page, 'M-STAT-04', 1);
    const first = await snapshot(page);
    expect(first.family).toBe('mean-audit');
    const values = await numericGivens(page);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const replacing = task(page).locator('button.opt').filter({ hasText: 'kaikki alkuperäiset havainnot olivat samat' });
    await expect(replacing).toContainText(`${mean} palikkaa`);
    await replacing.click();
    await expect(outcome(page)).toHaveAttribute('data-ok', 'false');
    await expect(outcome(page)).toContainText('Alkuperäinen havaintotaulukko säilyy');
    await page.getByRole('button', { name: 'Uusi kokeilu', exact: true }).click();
    const next = await snapshot(page);
    expect(next.family).toBe('mean-audit');
    const newValues = await numericGivens(page);
    const newMean = newValues.reduce((sum, value) => sum + value, 0) / newValues.length;
    const preserves = task(page).locator('button.opt').filter({ hasText: 'Alkuperäiset havainnot säilyvät taulukossa' });
    await expect(preserves).toContainText(`${newMean} palikkaa`);
    await preserves.click();
    await expect(outcome(page)).toHaveAttribute('data-ok', 'true');
  });

  test('accepts the signed decrease calculated from the original amount', async ({ page }) => {
    await goto(page, 'M79-PCT-CHANGE', 1);
    const current = await snapshot(page);
    expect(current.family).toBe('change-decrease');
    const [before, after] = await numericGivens(page);
    await expect(workbench(page)).toContainText(`100 %: lähtötilan ${before} palaa`);
    const signed = 100 * (after! - before!) / before!;
    expect(signed).toBeLessThan(0);
    await numberAnswer(page, signed);
    await expect(outcome(page)).toHaveAttribute('data-ok', 'true');
  });

  test('checks both units in the new percentage-point representation', async ({ page }) => {
    await goto(page, 'M79-PCT-PP');
    for (let i = 0; i < 3; i++) {
      const current = await snapshot(page);
      expect(current.phase).toBe('independent');
      const numbers = await planRead(page);
      await numberAnswer(page, current.family === 'pp-relative' ? numbers.relative : numbers.difference);
      await expect(outcome(page)).toHaveAttribute('data-ok', 'true');
      if (i < 2) await page.getByRole('button', { name: 'Seuraava kokeilu', exact: true }).click();
    }
    await page.getByRole('button', { name: 'Kokeile uudessa tilanteessa', exact: true }).click();
    expect((await snapshot(page)).phase).toBe('transfer');
    await expect(workbench(page).locator('svg')).toHaveCount(0);
    const wrongUnits = await planRead(page);
    await planTransfer(page, wrongUnits.difference, wrongUnits.relative, true);
    await expect(outcome(page)).toHaveAttribute('data-ok', 'false');
    await expect(outcome(page)).toContainText('prosenttiyksikköinä');
    expect((await snapshot(page)).progress.checked).toBe(false);
    await page.getByRole('button', { name: 'Uusi kokeilu', exact: true }).click();
    const second = await snapshot(page);
    expect(second.phase).toBe('transfer');
    const correct = await planRead(page);
    await planTransfer(page, correct.difference, correct.relative);
    await expect(outcome(page)).toHaveAttribute('data-ok', 'true');
    expect((await snapshot(page)).progress.checked).toBe(true);
  });

  for (const [name, viewport] of [
    ['desktop', { width: 1440, height: 900 }],
    ['tablet', { width: 820, height: 1180 }],
  ] as const) {
    test(`all nine workbenches keep the ${name} controls within the viewport width`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      const diagnostics: string[] = [];
      for (const id of ids) {
        await goto(page, id);
        const current = await snapshot(page);
        expect(current.node).toBe(id);
        await expect(workbench(page).locator('table')).toBeVisible();
        if (id === 'M79-PCT-BASE') {
          const unknown = current.quantity?.rows?.[0];
          expect(unknown).toMatchObject({ amount: null });
          expect(unknown).not.toHaveProperty('extent');
          expect((await valuesOnBoard(page))[0]).toBe('?');
        }
        const tableFit = await workbench(page).locator('.table-wrap').evaluate(el => el.scrollWidth - el.clientWidth);
        expect(tableFit, id).toBeLessThanOrEqual(1);
        const controls = task(page).locator('button:visible');
        await expect(controls.first()).toBeEnabled();
        const last = controls.last();
        await last.scrollIntoViewIfNeeded();
        await expect(last).toBeInViewport();
        const bounds = await task(page).evaluate((host) => {
          const buttons = [...host.querySelectorAll('button')].filter((button) => button.getClientRects().length);
          return {
            pageWidth: document.documentElement.scrollWidth,
            left: Math.min(...buttons.map(button => button.getBoundingClientRect().left)),
            right: Math.max(...buttons.map(button => button.getBoundingClientRect().right)),
          };
        });
        expect(bounds.pageWidth, id).toBeLessThanOrEqual(viewport.width);
        expect(bounds.left, id).toBeGreaterThanOrEqual(0);
        expect(bounds.right, id).toBeLessThanOrEqual(viewport.width);
        diagnostics.push(`${id}: controls x=${bounds.left.toFixed(1)}–${bounds.right.toFixed(1)}`);
        if (id === 'M79-PCT-PP') {
          await page.evaluate(() => window.scrollTo(0, 0));
          const path = testInfo.outputPath(`revised-quantity-${name}.png`);
          await page.screenshot({ path });
          await testInfo.attach(`percentage-points-${name}`, { path, contentType: 'image/png' });
        }
      }
      await testInfo.attach(`layout-${name}`, { body: diagnostics.join('\n'), contentType: 'text/plain' });
    });
  }
});
