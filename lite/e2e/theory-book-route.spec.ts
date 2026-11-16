import { pauseBook } from './book-contract';
import { expect, test, type Page } from '@playwright/test';
import { ROUTE_FIRST as first, ROUTE_LAST as last, ROUTE_SECOND as second } from './route-ends';

// The theory-book route end to end: the first and the last stop open, a finished page is saved
// and survives a reload, and the map takes the learner away and back to the same page.
type Book = { page: string; step: number; steps: string[]; kind: string; answered: boolean };
const book = (page: Page): Promise<Book | null> => page.evaluate(() => {
  const text = (window as Window & { render_game_to_text?: () => string }).render_game_to_text;
  return text ? JSON.parse(text()).book : null;
});

async function open(page: Page, hash: string, id: string) {
  await page.goto(`./?qa=1&seed=3#${hash}`);
  await expect.poll(async () => (await book(page))?.page, { timeout: 20_000 }).toBe(id);
  await pauseBook(page);
}
/** Steps through every beat and skips the try, until the page changes. */
async function finishPage(page: Page, id: string) {
  for (let n = 0; n < 12 && (await book(page))?.page === id; n++) {
    const before = await book(page);
    await page.locator('.book-next').click();
    await expect.poll(async () => { const now = await book(page); return now?.page !== id || now?.step !== before?.step || page.url().endsWith('#saaristo/loppu'); }, { timeout: 10000 }).toBe(true);
  }
}

test('a new learner starts at the first stop, and a finished page is saved across a reload', async ({ page }) => {
  await open(page, 'saaristo', first);
  expect((await book(page))!.step).toBe(0);
  await finishPage(page, first);
  await expect.poll(async () => (await book(page))?.page).toBe(second);
  await expect(page).toHaveURL(new RegExp(`#saaristo/${encodeURIComponent(second)}$`));
  await page.reload();
  await open(page, 'saaristo', second);
});

test('the last stop opens, and once every other stop is passed it leads to the ending', async ({ page }) => {
  await open(page, `saaristo/${encodeURIComponent(last)}`, last);
  // Every stop the map knows, from its full list, saved as passed except the last one.
  await page.getByRole('button', { name: 'Retkikartta' }).click();
  await page.getByRole('dialog').getByLabel('Näytä myös suunnitteilla olevat taidot').check();
  const ids = await page.getByRole('dialog').locator('[data-node]').evaluateAll(rows => rows.map(row => row.getAttribute('data-node')!));
  expect(ids).toHaveLength(690);
  await page.evaluate(stops => localStorage.setItem('sammakko-journey-3',
    JSON.stringify({ v: 3, attempts: [], events: [], effects: [], storyStops: stops })), ids.filter(id => id !== last));
  await page.reload();
  await expect.poll(async () => (await book(page))?.page, { timeout: 20_000 }).toBe(last);
  await pauseBook(page);
  await finishPage(page, last);
  await expect(page).toHaveURL(/#saaristo\/loppu$/);
});

test('the map takes the learner to another stop and back returns to the same page', async ({ page }) => {
  await open(page, `saaristo/${encodeURIComponent(second)}`, second);
  await page.locator('.book-next').click();
  await expect.poll(async () => (await book(page))?.step).toBe(1);
  await page.getByRole('button', { name: 'Retkikartta' }).click();
  await page.getByRole('dialog').locator(`[data-node="${first}"]`).click();
  await expect.poll(async () => (await book(page))?.page).toBe(first);
  await page.goBack();
  await expect.poll(async () => (await book(page))?.page).toBe(second);
});

 test('old v3 journey resumes before unvisited stops and keeps its history', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sammakko-journey-3', JSON.stringify({ v: 3, attempts: [], events: [], effects: [], storyStops: ['M-FRAC-13'] })));
  await open(page, 'saaristo', first);
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3')!));
  expect(save.storyStops).toEqual(['M-FRAC-13']);
  expect(save.attempts).toEqual([]);
});
