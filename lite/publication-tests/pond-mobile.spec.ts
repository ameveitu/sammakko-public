import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test('the phone landing leaves the pond open and throws from the first screen', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/');
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-saaristo', /^(webgl|static|fallback)$/);
  await expect(page.locator('[data-saaristo-headline]')).toBeInViewport();
  await expect(page.locator('.saaristo-hero-actions, .saaristo-panel').filter({ visible: true })).toHaveCount(1);
  await expect(page.locator('#kivi')).toBeHidden();
  await expect(page.locator('.saaristo-hero .saaristo-eyebrow')).toBeHidden();
  await expect(page.getByRole('link', { name: 'Avaa Sammakko Lite' })).toBeInViewport();
  await expect(page.locator('.saaristo-footer a')).toBeInViewport();
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
});
