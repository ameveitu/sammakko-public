import { expect, test, type Page } from '@playwright/test';

// One node per light (theory book) kind: the task shows one answer control and accepts the answer.
const NODES = ['M79-GRAPH-MONO', 'CHEM79-COMPOUND', 'CHEM79-SOLUBILITY', 'M-GEO-17', 'M-PROB-04', 'M-GEO-24', 'M-GMEAS-04', 'M79-CONG-CRIT', 'CHEM79-MATTER-CONS', 'SCI-ENV-MODEL-01'];
type Snapshot = { light: boolean; basisKind: string | null; taskKind: string | null; qaAnswer?: number; lastOk: boolean | null };
const snapshot = (page: Page): Promise<Snapshot> => page.evaluate(() => JSON.parse((window as Window & { render_game_to_text?: () => string }).render_game_to_text!()));
const task = (page: Page) => page.locator('.exp-task');

for (const id of NODES) {
  test(`${id} is one theory-book question with one answer control`, async ({ page }) => {
    await page.goto(`./?qa=1&seed=3#saaristo/${id}`);
    await page.getByRole('button', { name: 'Tutkitaan yhdessä', exact: true }).click();
    const state = await snapshot(page);
    expect(state.light).toBe(true);
    expect(['choice', 'numeric']).toContain(state.taskKind);
    expect(state.basisKind).not.toBeNull();
    const controls = task(page).locator('input:not([type=hidden]), select, textarea, [role=slider]');
    if (state.taskKind === 'choice') {
      await expect(task(page).locator('button.opt').first()).toBeVisible();
      expect(await controls.count()).toBe(0);
      await task(page).locator('button.opt').nth(state.qaAnswer!).click();
    } else {
      expect(await controls.count()).toBeLessThanOrEqual(1);
      expect(await task(page).locator('.keys').count()).toBe(1);
      const text = String(state.qaAnswer).replace('.', ',').replace('-', '−');
      for (const key of text) await task(page).getByRole('button', { name: key === ',' ? ',' : key, exact: true }).click();
      await task(page).getByRole('button', { name: 'OK', exact: true }).click();
    }
    await expect.poll(async () => (await snapshot(page)).lastOk).toBe(true);
  });
}

test('full=1 keeps the full workbench for QA and the future full runtime', async ({ page }) => {
  await page.goto('./?qa=1&full=1&seed=3#saaristo/M79-GRAPH-MONO');
  await page.getByRole('button', { name: 'Tutkitaan yhdessä', exact: true }).click();
  const state = await snapshot(page);
  expect(state.light).toBe(false);
  expect(state.taskKind).toBe('function-garden');
});
