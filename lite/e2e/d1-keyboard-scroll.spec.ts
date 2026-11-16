import { pauseBook } from './book-contract';
import { expect, test, type Page } from '@playwright/test';

// The standard config serves the publication prefix on its second preview.
const publication = (path: string) => {
  const base = new URL(test.info().project.use.baseURL as string);
  if (base.port === '5202') base.port = '5203';
  return new URL(`/lite/${path}`, base).toString();
};

type Book = { page: string; step: number; kind: string; answered: boolean; qaAnswer: number };
const book = (p: Page): Promise<Book> => p.evaluate(() => (window as any).render_game_to_text ? JSON.parse((window as any).render_game_to_text()).book : null);
const records = (p: Page): Promise<number> => p.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') || '{}').attempts?.length ?? 0);

async function openTry(page: Page, id: string) {
  await page.goto(publication(`?qa=1&seed=3#saaristo/${id}`));
  await expect.poll(async () => (await book(page))?.page).toBe(id);
  await pauseBook(page);
  for (let n = 0; n < 8 && (await book(page)).kind !== 'try'; n++) await page.locator('.book-next').click();
  await expect.poll(async () => (await book(page)).kind).toBe('try');
}
async function answer(page: Page, wrong: boolean) {
  const state = await book(page), choices = page.locator('.book-task .opt');
  await choices.nth(wrong ? (state.qaAnswer + 1) % await choices.count() : state.qaAnswer).click();
  await expect(page.locator('.book-feedback')).toHaveAttribute('data-ok', String(!wrong));
  expect(await records(page)).toBe(1);
}
/** Wait for native scroll and refit geometry to stop changing, with a bounded failure. */
async function stableScrollport(page: Page, selector: string) {
  await page.locator(selector).evaluate(el => new Promise<void>((resolve, reject) => {
    let previous = '', stable = 0, frames = 0;
    const sample = () => {
      const rect = el.getBoundingClientRect();
      const current = [el.scrollTop, el.scrollHeight, el.clientHeight, rect.height].join('/');
      stable = current === previous ? stable + 1 : 0; previous = current;
      if (stable >= 5) return resolve();
      if (++frames >= 120) return reject(new Error('Scrollport did not stabilize within 120 frames'));
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  }));
}
async function spaceKeepsFeedback(page: Page, selector: string, state: Book) {
  await stableScrollport(page, selector);
  const overflow = await page.locator(selector).evaluate(el => { el.scrollTop = 0; return el.scrollHeight - el.clientHeight; });
  await page.locator(selector).focus();
  await page.keyboard.press('Space');
  // Allow both the native scroll and a wrongly scheduled zero-delay book transition to run.
  await page.waitForTimeout(200);
  expect(await book(page)).toMatchObject({ page: state.page, step: state.step, answered: true });
  if (overflow > 0) await expect.poll(() => page.locator(selector).evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  else expect(await page.locator(selector).evaluate(el => el.scrollTop)).toBe(0);
  expect(await records(page)).toBe(1);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.removeItem('sammakko-journey-3'));
  await page.route('**/*', async route => {
    if (route.request().resourceType() !== 'document') return route.continue();
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace('<head>', '<head><meta name="sammakko-publication" content="site">') });
  });
});

for (const wrong of [false, true]) {
  test(`Space scrolls the context after a ${wrong ? 'wrong' : 'correct'} answer without leaving feedback`, async ({ page }) => {
    await openTry(page, 'PHY79-DATA-01');
    await expect(page.locator('.publication-nav')).toBeVisible();
    await page.locator('.book-context').focus();
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => page.locator('.book-context').evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    await stableScrollport(page, '.book-context');
    console.log('keyboard renderer', await page.evaluate(() => JSON.parse((window as any).render_game_to_text()).renderer));
    expect((await book(page)).answered).toBe(false);
    await answer(page, wrong);
    const state = await book(page);
    await spaceKeepsFeedback(page, '.book-context', state);
    if (wrong) {
      const summary = page.locator('.book-feedback summary');
      await summary.focus();
      await page.keyboard.press('Space');
      await expect(page.locator('.book-feedback details')).toHaveAttribute('open', '');
      expect(await book(page)).toMatchObject({ page: state.page, step: state.step, answered: true });
      // A naturally shorter viewport makes the expanded feedback itself scrollable.
      await page.setViewportSize({ width: 320, height: 480 });
      await expect.poll(() => page.locator('.book-feedback').evaluate(el => el.scrollHeight - el.clientHeight)).toBeGreaterThan(0);
      await spaceKeepsFeedback(page, '.book-feedback', state);
    }
  });
}

for (const next of ['button', 'global'] as const) {
  test(`Space activates a model button and preserves ${next} navigation without duplicate records`, async ({ page }) => {
    await page.goto(publication('?qa=1&seed=3#saaristo/M-NUM-1TO1'));
    await expect.poll(async () => (await book(page))?.page).toBe('M-NUM-1TO1');
    await pauseBook(page);
    await page.locator('.book-desk h1').focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(async () => (await book(page)).step).toBe(1);
    while ((await book(page)).kind !== 'try') await page.locator('.book-next').click();
    const playback = page.getByRole('button', { name: 'Näytä loppu', exact: true });
    await playback.focus();
    await page.keyboard.press('Space');
    await expect(page.locator('.anim-cap')).not.toBeEmpty();
    expect((await book(page)).answered).toBe(false);
    expect(await records(page)).toBe(0);
    await answer(page, false);
    if (next === 'button') await page.locator('.book-next').focus();
    else await page.locator('.book-desk h1').focus();
    await page.keyboard.press('Space');
    await expect.poll(async () => (await book(page))?.page).not.toBe('M-NUM-1TO1');
    await pauseBook(page);
    await page.waitForTimeout(200);
    expect((await book(page)).step).toBe(0);
    expect(await records(page)).toBe(1);
  });
}
