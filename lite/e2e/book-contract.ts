import { expect, type Page } from '@playwright/test';

export type Book = {
  page: string; step: number; steps: string[]; kind: 'beat' | 'try';
  beat?: string; answered: boolean; lastOk: boolean | null; tryKind: 'choice' | 'numeric'; qaAnswer: number;
};
export const book = (page: Page): Promise<Book> => page.evaluate(() => JSON.parse(window.render_game_to_text!()).book);
export const journey = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? 'null'));
export const bookTask = (page: Page) => page.getByRole('region', { name: 'Teoriakirja' }).locator('.book-task');

/** Enter the default learner route: deliberately no full=1. */
export async function openBook(page: Page, id: string, seed = 3) {
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await page.waitForFunction(() => typeof window.render_game_to_text === 'function');
  await expect.poll(async () => (await book(page))?.page).toBe(id);
  await expect(page.getByRole('region', { name: 'Teoriakirja' })).toBeVisible();
}
export async function reachQuestion(page: Page) {
  for (let n = 0; n < 12 && (await book(page)).kind === 'beat'; n++) {
    const before = (await book(page)).step;
    await page.getByRole('button', { name: 'Eteenpäin', exact: true }).click();
    await expect.poll(async () => (await book(page)).step).toBe(before + 1);
  }
  expect((await book(page)).kind).toBe('try');
  expect((await book(page)).answered).toBe(false);
}
export async function answerBook(page: Page, correct = true) {
  const state = await book(page);
  expect(state.kind).toBe('try');
  if (state.tryKind === 'choice') {
    const options = bookTask(page).locator('button.opt');
    expect(await options.count()).toBeGreaterThan(1);
    await options.nth(correct ? state.qaAnswer : (state.qaAnswer + 1) % await options.count()).click();
  } else {
    expect(state.tryKind).toBe('numeric');
    const value = correct ? state.qaAnswer : state.qaAnswer + 1;
    for (const key of String(value).replace('.', ',').replace('-', '−')) {
      await bookTask(page).getByRole('button', { name: key, exact: true }).click();
    }
    await bookTask(page).getByRole('button', { name: 'OK', exact: true }).click();
  }
  await expect.poll(async () => (await book(page)).lastOk).toBe(correct);
  await expect(page.locator('.book-feedback[role="status"]')).toHaveAttribute('data-ok', String(correct));
  const saved = await journey(page);
  expect(saved.attempts.at(-1)).toMatchObject({ phase: 'guided', ok: correct, mode: 'saaristo-kirja' });
  expect(saved.attempts.every((row: { phase: string }) => row.phase === 'guided')).toBe(true);
  expect(await page.evaluate(() => JSON.parse(window.render_game_to_text!()).progress.checked)).toBe(false);
}

export async function fallbackBook(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      return /^webgl/.test(type) ? null : Reflect.apply(get, this, [type, ...args]);
    } as typeof get;
  });
}

/** Manual-flow tests use the same pause control as the learner. */
export async function pauseBook(page: Page) {
  const pause = page.getByRole('button', { name: 'Keskeytä automaattinen eteneminen' });
  const focused = page.locator(':focus');
  if (await pause.count()) {
    const wasFocused = await focused.count() ? await focused.elementHandle() : null;
    await pause.click();
    if (wasFocused) await wasFocused.focus();
  }
}
