import { expect, test } from '@playwright/test';

const KEY = 'sammakko-lite-2';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 7 / 2 ** 31; });
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
});

for (const { kc, selector, keys } of [
  { kc: 'M-COORD-PLOT-Q1', selector: '.answer-board[role="group"]', keys: ['ArrowRight', 'ArrowUp', 'Space'] },
  { kc: 'M-NEG-02', selector: '.line-board', keys: ['Home', 'ArrowRight'] },
]) {
  test(`${kc}: real lesson accepts an editable keyboard answer once`, async ({ page }) => {
    await page.goto(`./#kc/${kc}`);
    await page.getByRole('button', { name: 'Osaan jo', exact: true }).click();
    const board = page.locator(selector);
    await expect(board).toHaveAttribute('tabindex', '0');
    await board.focus();
    for (const key of keys) await page.keyboard.press(key);
    await expect(page.locator('.answer-state')).not.toContainText('Ei vastausta');
    await page.getByRole('button', { name: 'Valmis', exact: true }).click();
    const attempts = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).attempts, KEY);
    expect(attempts).toHaveLength(1);
    expect(attempts[0].node).toBe(kc);
    expect(attempts[0].seed).toBe(7);
    expect(attempts[0].resp).toContain(kc === 'M-NEG-02' ? 'line' : 'plot');
  });
}

test('flight: keyboard resumes hidden pause, repeated replay retains tester truth and exits', async ({ page }) => {
  await page.goto('./#paja');
  await page.evaluate(key => {
    const s = JSON.parse(localStorage.getItem(key)!);
    const inv: Record<string, unknown> = { vihko: { from: 'start', at: 0 } };
    for (const part of ['runko', 'siivet', 'potkuri']) inv[`part:${part}`] = { from: 'found', at: 0 };
    s.tester = true;
    s.testerGame = { v: 1, intro: true, inv, slots: { chassis: 'runko', wings: 'siivet', engine: 'potkuri' }, wing: 'kapeat', flights: [], runs: [], races: [], missions: {} };
    localStorage.setItem(key, JSON.stringify(s));
  }, KEY);
  await page.clock.install();
  await page.goto('./#paja/lento');
  await page.reload();
  await expect(page.locator('.notices')).toContainText('Testaajatila');
  await page.clock.runFor(200);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.clock.runFor(100);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); });
  const before = await page.locator('.flight svg > g').last().getAttribute('transform');
  await page.keyboard.down('Space'); await page.clock.runFor(300); await page.keyboard.up('Space');
  expect(await page.locator('.flight svg > g').last().getAttribute('transform')).not.toBe(before);
  await page.clock.runFor(6200);
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: 'Lennä uudelleen', exact: true }).click();
    await expect(page.locator('.notices')).toContainText('Testaajatila');
    await page.clock.runFor(6200);
  }
  const s = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), KEY);
  expect(s.testerGame.flights).toHaveLength(3);
  expect(s.attempts).toHaveLength(0);
  expect(s.game?.flights ?? []).toHaveLength(0);
  await page.getByRole('button', { name: 'Takaisin pajaan', exact: true }).click();
  await expect(page.locator('.title')).toContainText('Lentopaja');
});
