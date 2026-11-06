import { expect, test, type Page } from '@playwright/test';

// M-DEC-07 moved to its own two-event ledger scene (exp690-decimal-ledger-v2); e2e/integration-revisions.spec.ts covers it.
const ids = [
  'M-DEC-05', 'M-DEC-06', 'M-DEC-SUB', 'M-FRACDEC-01', 'M-PCT-02', 'M-PCT-03', 'M-PCT-04', 'M-PCT-05',
] as const;
type Id = typeof ids[number];
type Snapshot = { node: Id; phase: string; family: string; progress: { helped: boolean; checked: boolean } };

const snapshot = (page: Page): Promise<Snapshot> => page.evaluate(() =>
  JSON.parse((window as Window & { render_game_to_text: () => string }).render_game_to_text()));
const board = (page: Page) => page.locator('[data-decimal-workbench]');
const task = (page: Page) => page.locator('.exp-task');
const feedback = (page: Page) => page.locator('.exp-feedback');
const fields = (page: Page) => board(page).locator('.decimal-givens dd').allTextContents();
const keys = (page: Page) => task(page).locator('.keys');
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const asHundredths = (value: string): number => {
  const [whole, fraction = ''] = /^\d+(?:,\d+)?/.exec(value)![0].split(',');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
};

async function open(page: Page, id: Id, seed = 7, guided = false) {
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await button(page, guided ? 'Tutkitaan yhdessä' : 'Kokeilen itse').click();
  await expect(board(page)).toHaveAttribute('data-decimal-workbench', 'given');
  expect((await snapshot(page)).node).toBe(id);
}

async function enter(page: Page, value: string) {
  for (const key of value.replace('.', ',')) await keys(page).getByRole('button', { name: key, exact: true }).click();
  await keys(page).getByRole('button', { name: 'OK', exact: true }).click();
}

async function ledgerAnswer(page: Page) {
  const [first, ...deltas] = await fields(page);
  const labels = await board(page).locator('.decimal-givens dt').allTextContents();
  const amount = deltas.reduce((total, value, i) => total +
    (labels[i + 1]!.includes('Saapuu') ? 1 : -1) * asHundredths(value), asHundredths(first!));
  await enter(page, String(amount / 100));
  await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
  await expect(board(page)).toHaveCount(1);
  await expect(board(page)).toHaveAttribute('data-decimal-workbench', 'solved');
}

async function slot(page: Page, label: string, value: string) {
  await task(page).locator('.place-tray').getByRole('button', { name: value, exact: true }).click();
  await task(page).locator('.slot').filter({ hasText: label }).press('Enter');
}

test.describe('Helmisimpukan tarkkuusasema', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
  });

  test('longer spelling is not magnitude, and the learner can ask for help', async ({ page }) => {
    await open(page, 'M-DEC-05', 7);
    expect(await fields(page)).toEqual(['0,8', '0,75']);
    await button(page, '<').click();
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await expect(feedback(page)).toContainText('Lopussa oleva nolla');
    await button(page, 'Näytä ja selitä').click();
    await expect(feedback(page)).toContainText('0,80 > 0,75');
    await button(page, 'Uusi yhteinen kokeilu').click();
    expect((await snapshot(page)).phase).toBe('guided');
  });

  test('a decimal mark lands on the matching tick using the keyboard', async ({ page }) => {
    await open(page, 'M-DEC-06', 7);
    const [targetText, stepText] = await fields(page);
    const slider = task(page).getByRole('slider', { name: 'Vastaus lukusuoralla' });
    const minimum = Number(await slider.getAttribute('aria-valuemin'));
    const steps = (asHundredths(targetText!) - Math.round(minimum * 100)) / asHundredths(stepText!);
    expect(Number.isInteger(steps)).toBe(true);
    await slider.press('Home');
    for (let i = 0; i < steps; i++) await slider.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuenow', String(asHundredths(targetText!) / 100));
    await task(page).getByRole('button', { name: 'Valmis', exact: true }).click();
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    await expect(board(page)).toContainText('Reittimerkki kiinnitettiin');
  });

  test('subtraction rejects digitwise reversal and guided recovery uses a new calculation', async ({ page }) => {
    await open(page, 'M-DEC-SUB', 7);
    expect(await fields(page)).toEqual(['0,8 l', '0,36 l']);
    await enter(page, '0,54');
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await expect(feedback(page)).toContainText('Vaihda ensin yksi kymmenesosa');
    await button(page, 'Näytä ja selitä').click();
    await expect(feedback(page)).toContainText('0,80 − 0,36 = 0,44');
    await button(page, 'Uusi yhteinen kokeilu').click();
    expect((await snapshot(page)).phase).toBe('guided');
    await expect(board(page).getByRole('table', { name: 'Paikka-arvopöytä' })).toBeVisible();
    await ledgerAnswer(page);
    expect((await snapshot(page)).progress.checked).toBe(false);
  });

  test('small and greater-than-whole rates are paired with the right labels', async ({ page }) => {
    await open(page, 'M-PCT-03', 7);
    for (let i = 0; i < 3; i++) {
      const [given] = await fields(page);
      const value = given!.endsWith('%') ? Number(given!.match(/\d+/)![0]) / 100 : asHundredths(given!);
      await enter(page, String(value));
      await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
      if (i < 2) await button(page, 'Seuraava kokeilu').click();
    }
    await button(page, 'Kokeile uudessa tilanteessa').click();
    expect((await snapshot(page)).phase).toBe('transfer');
    const [small, large] = await fields(page);
    await expect(board(page)).toContainText('100 %');
    const largeRate = Number(large!.match(/\d+/)![0]);
    expect(largeRate).toBeGreaterThan(100);
    await slot(page, 'A · prosentti', `${asHundredths(small!)} %`);
    await slot(page, 'B · desimaaliluku', (largeRate / 100).toFixed(2).replace('.', ','));
    await task(page).getByRole('button', { name: 'Valmis', exact: true }).click();
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    await expect(board(page)).toContainText('samankokoinen');
    expect((await snapshot(page)).progress.checked).toBe(true);
  });

  for (const [label, viewport] of [
    ['desktop', { width: 1366, height: 768 }],
    ['tablet', { width: 768, height: 1024 }],
  ] as const) {
    test(`essential quantities and both families' controls fit at ${label} size`, async ({ page }, testInfo) => {
      test.setTimeout(120_000);
      await page.setViewportSize(viewport);
      for (const id of ids) {
        const families = new Set<string>();
        for (const seed of [1, 7]) {
          await open(page, id, seed);
          families.add((await snapshot(page)).family);
          await page.evaluate(() => window.scrollTo(0, 0));
          const edges = await page.evaluate(() => {
            const panel = document.querySelector('[data-decimal-workbench]')!;
            const taskHost = document.querySelector('.exp-task')!;
            const parts = [panel, ...taskHost.querySelectorAll('button, [role="slider"], [role="button"]')]
              .filter(node => node.getClientRects().length).map(node => node.getBoundingClientRect());
            return { left: Math.min(...parts.map(b => b.left)), right: Math.max(...parts.map(b => b.right)),
              top: Math.min(...parts.map(b => b.top)), bottom: Math.max(...parts.map(b => b.bottom)),
              width: document.documentElement.scrollWidth };
          });
          const context = `${id} · seed ${seed} · ${JSON.stringify(edges)}`;
          expect(edges.width, context).toBeLessThanOrEqual(viewport.width);
          expect(edges.left, context).toBeGreaterThanOrEqual(0);
          expect(edges.right, context).toBeLessThanOrEqual(viewport.width);
          expect(edges.top, context).toBeGreaterThanOrEqual(0);
          expect(edges.bottom, context).toBeLessThanOrEqual(viewport.height);
        }
        expect(families.size, id).toBe(2);
        if (id === 'M-PCT-04') {
          const path = testInfo.outputPath(`decimal-workbench-${label}.png`);
          await page.screenshot({ path });
          await testInfo.attach(`decimal-workbench-${label}`, { path, contentType: 'image/png' });
        }
      }
    });
  }
});
