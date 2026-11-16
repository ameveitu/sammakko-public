import { pauseBook } from './book-contract';
import { expect, test, type Page } from '@playwright/test';

// The standard config serves the publication prefix on its second preview.
const publication = (path: string) => {
  const base = new URL(test.info().project.use.baseURL as string);
  if (base.port === '5202') base.port = '5203';
  return new URL(`/lite/${path}`, base).toString();
};

type Book = { page: string; step: number; kind: string; answered: boolean; tryKind: string; qaAnswer: number };
const state = (p: Page): Promise<Book> => p.evaluate(() => JSON.parse((window as any).render_game_to_text()).book);
const settle = (p: Page) => p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));

async function controls(page: Page) {
  return page.evaluate(() => {
    const issues: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>('.book-task button:not(:disabled),.book-task input:not(:disabled),.book-nav button:not(:disabled)')) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const name = el.getAttribute('aria-label') || el.textContent;
      if (r.width < 43.9 || r.height < 43.9) issues.push(`${name}: ${r.width}×${r.height}`);
      for (let p: HTMLElement | null = el; p; p = p.parentElement) {
        const s = getComputedStyle(p), b = p.getBoundingClientRect();
        if (/auto|scroll|hidden|clip/.test(s.overflowY) && (r.top < b.top - 1 || r.bottom > b.bottom + 1)) issues.push(`${name}: clipped vertically`);
        if (/auto|scroll|hidden|clip/.test(s.overflowX) && (r.left < b.left - 1 || r.right > b.right + 1)) issues.push(`${name}: clipped horizontally`);
      }
      if (r.top < 0 || r.left < 0 || r.bottom > innerHeight + 1 || r.right > innerWidth + 1) issues.push(`${name}: outside viewport`);
      const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      if (!hit || !(hit === el || el.contains(hit))) issues.push(`${name}: covered`);
    }
    for (const el of document.querySelectorAll<HTMLElement>('.book-task .txt,.book-task .quiet-cap,.book-task .book-axes')) {
      if (!el.getBoundingClientRect().width) continue;
      let zoom = 1;
      for (let p: HTMLElement | null = el; p; p = p.parentElement) zoom *= Number(getComputedStyle(p).zoom) || 1;
      if (parseFloat(getComputedStyle(el).fontSize) * zoom < 14.9) issues.push('Answer text below 15px');
    }
    if (document.documentElement.scrollWidth > innerWidth + 1) issues.push('Horizontal document overflow');
    if (document.documentElement.scrollHeight > innerHeight + 1) issues.push('Vertical document overflow');
    return issues;
  });
}

async function answer(page: Page, wrong: boolean) {
  const s = await state(page);
  if (s.tryKind === 'choice') {
    const options = page.locator('.book-task .opt');
    await options.nth(wrong ? (s.qaAnswer + 1) % await options.count() : s.qaAnswer).click();
  } else {
    const value = String(wrong ? s.qaAnswer + 1 : s.qaAnswer).replace('.', ',').replace('-', '−');
    for (const digit of value) await page.locator('.book-task .keys button').filter({ hasText: new RegExp(`^${digit}$`) }).click();
    await page.locator('.book-task .keys button').filter({ hasText: /^OK$/ }).click();
  }
}

for (const [width, height] of [[320, 640], [390, 844], [768, 1024], [1366, 768]]) {
  test(`book controls stay readable and available at ${width}×${height}`, async ({ page, context }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    // Exact production packager marker: assert the resulting navigation is actually present.
    await page.route('**/*', async route => {
      if (route.request().resourceType() !== 'document') return route.continue();
      const response = await route.fetch();
      await route.fulfill({ response, body: (await response.text()).replace('<head>', '<head><meta name="sammakko-publication" content="site">') });
    });
    for (const seed of [3, 37]) for (const id of ['M-NUM-1TO1', 'M-DATA-02', 'PHY79-ACCEL-GRAPH', 'PHY79-SPEED-MIXED', 'M-PLACE-02', 'PHY79-DATA-01']) {
      await page.emulateMedia({ colorScheme: seed === 37 ? 'dark' : 'light', reducedMotion: 'reduce' });
      await page.goto(publication(`?qa=1&seed=${seed}#saaristo/${id}`));
      await expect.poll(async () => (await state(page))?.page, { timeout: 20_000 }).toBe(id);
      await pauseBook(page);
      await expect(page.locator('.publication-nav')).toBeVisible();
      for (let n = 0; (await state(page)).kind !== 'try' && n < 8; n++) await page.locator('.book-next').click();
      await expect.poll(async () => (await state(page)).kind).toBe('try');
      await settle(page);
      await expect.poll(() => controls(page)).toEqual([]);
      if (id === 'PHY79-ACCEL-GRAPH' && seed === 3) {
        await expect(page.locator('.book-axes')).toHaveText('Kuvaajien akselit: t (s) · v (m/s)');
      }
      await answer(page, seed === 37);
      await expect(page.locator('.book-feedback')).toHaveAttribute('data-ok', String(seed !== 37));
      await expect(page.locator('.book-feedback')).not.toBeEmpty();
      await expect.poll(() => controls(page)).toEqual([]);
      await expect(page.locator('.book-next')).toBeFocused();
      await page.locator('.book-context').evaluate(el => el.scrollTo(0, el.scrollHeight));
      if (await page.locator('.book-more summary').count()) {
        await page.locator('.book-more summary').click();
        await page.locator('.book-feedback').evaluate(el => el.scrollTo(0, el.scrollHeight));
      }
      await expect.poll(() => controls(page)).toEqual([]);
      await page.getByRole('button', { name: 'Toinen kysymys' }).click();
      await expect.poll(async () => (await state(page)).answered).toBe(false);
      await expect.poll(() => controls(page)).toEqual([]);
      const before = await state(page);
      await page.locator('.book-next').click();
      await expect.poll(async () => { const s = await state(page); return s.page !== before.page || s.step !== before.step; }).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test('a live try restores its layout when the viewport grows and shrinks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto(publication('?qa=1&seed=3#saaristo/M-NUM-1TO1'));
  await expect.poll(async () => (await state(page))?.page).toBe('M-NUM-1TO1');
  await pauseBook(page);
  while ((await state(page)).kind !== 'try') await page.locator('.book-next').click();
  for (const [width, height] of [[320, 640], [768, 1024], [390, 844], [1366, 768], [320, 640]]) {
    await page.setViewportSize({ width, height });
    await expect.poll(() => controls(page)).toEqual([]);
    const playback = page.locator('.book-figure .motion-ctl button').first();
    await playback.scrollIntoViewIfNeeded();
    const box = await playback.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
    await playback.click();
    await expect.poll(async () => (await state(page)).answered).toBe(false);
  }
});
