import { expect, test } from '@playwright/test';

import { answerBook, book, bookTask, fallbackBook, journey, openBook, pauseBook, reachQuestion } from './book-contract';

// Preserve the ten light adapter families on the default learner route, now the book.
const NODES = ['M79-GRAPH-MONO', 'CHEM79-COMPOUND', 'CHEM79-SOLUBILITY', 'M-GEO-17', 'M-PROB-04', 'M-GEO-24', 'M-GMEAS-04', 'M79-CONG-CRIT', 'CHEM79-MATTER-CONS', 'SCI-ENV-MODEL-01'];
test.beforeEach(async ({ page }) => fallbackBook(page));
for (const id of NODES) {
  test(`${id} is one theory-book question with one answer control`, async ({ page }) => {
    await openBook(page, id);
    await pauseBook(page);
    await reachQuestion(page);
    const state = await book(page);
    expect(state.steps.filter(step => step === 'try')).toHaveLength(1);
    expect(['choice', 'numeric']).toContain(state.tryKind);
    const controls = bookTask(page).locator('input:not([type=hidden]), select, textarea, [role=slider]');
    if (state.tryKind === 'choice') {
      await expect(bookTask(page).locator('button.opt').first()).toBeVisible();
      expect(await controls.count()).toBe(0);
    } else {
      expect(await controls.count()).toBeLessThanOrEqual(1);
      await expect(bookTask(page).locator('.keys')).toHaveCount(1);
    }
    expect((await journey(page))?.attempts ?? []).toHaveLength(0);
    await answerBook(page);
    await expect(page.locator('.book-feedback')).toContainText('Oikein!');
    expect((await journey(page)).attempts).toEqual([expect.objectContaining({ node: id, phase: 'guided', ok: true, mode: 'saaristo-kirja' })]);
    await expect(bookTask(page).locator('button:not([disabled]), input:not([disabled])')).toHaveCount(0);
  });
}

test('full=1 keeps the full workbench for QA and the future full runtime', async ({ page }) => {
  await page.goto('./?qa=1&full=1&seed=3#saaristo/M79-GRAPH-MONO');
  await page.getByRole('button', { name: 'Tutkitaan yhdessä', exact: true }).click();
  const state = await page.evaluate(() => JSON.parse(window.render_game_to_text!()));
  expect(state.light).toBe(false);
  expect(state.taskKind).toBe('function-garden');
});
