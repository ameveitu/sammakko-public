import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test('the phone landing leaves the pond open and throws from the first screen', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/');
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-saaristo', /^(webgl|static|fallback)$/);
  await expect(page.locator('[data-saaristo-headline]')).toBeInViewport();
  await expect(page.locator('.saaristo-hero-actions, .saaristo-panel').filter({ visible: true })).toHaveCount(0);
  await expect(page.locator('#kivi')).toBeHidden();
  await expect(page.locator('.saaristo-hero .saaristo-eyebrow')).toBeHidden();
  const menu = page.getByRole('button', { name: 'Valikko' });
  await expect(menu).toBeInViewport();
  await expect(page.locator('.saaristo-footer a')).toBeHidden();
  await menu.click();
  const nav = page.locator('#site-nav');
  for (const href of ['/lite/', '/lite/#paja', '/oppimisverkko/', '/whitepaper/', '/tietoa/', '/tietoa/#yhteystiedot']) {
    await expect(nav.locator(`a[href="${href}"]`)).toBeInViewport();
  }
  await expect(nav.locator('[data-saaristo-sound]')).toBeVisible();
  await expect(nav.locator('[data-saaristo-pause]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  const cue = page.locator('[data-throwzone]');
  if (await root.getAttribute('data-saaristo') === 'fallback') {
    await expect(cue).toBeHidden();
    return;
  }
  await expect(cue).toBeInViewport();
  const box = (await cue.boundingBox())!;
  const x = Math.round(box.x + box.width / 2), y = Math.round(box.y + box.height / 2);
  const cdp = await page.context().newCDPSession(page);
  const count = () => page.evaluate(() => (window as any).__saaristo.throws);
  const before = await count();
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (const dy of [20, 50, 100, 160]) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 4, y: y - dy }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(count).toBe(before + 1);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 480 }] });
  for (const y of [450, 420, 380, 340]) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200, y }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('.saaristo-pocket-info')).toBeInViewport();
  expect(await count()).toBe(before + 1);
});


test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('the phone menu opens and closes with native links', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('#site-nav');
    await expect(nav).toBeHidden();
    await page.locator('a[href="#site-nav"]').click();
    await expect(nav.locator('a[href="/lite/"]')).toBeVisible();
    await nav.locator('a[href="#main"]').click();
    await expect(nav).toBeHidden();
  });
});
