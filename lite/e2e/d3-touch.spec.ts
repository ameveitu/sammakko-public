import { expect, test } from '@playwright/test';

test.use({ hasTouch: true });

for (const [width, height] of [[390, 844], [844, 390]]) test(`touch opens a stop during travel at ${width}×${height}`, async ({ page }) => {
  await page.setViewportSize({ width: width!, height: height! });
  await page.addInitScript(() => {
    localStorage.setItem('sammakko-lite-2', JSON.stringify({ v: 2, world: 'ranta', quietUntil: Date.now() + 3600000, attempts: [], events: [] }));
  });
  await page.goto('./#kc/M-NUM-02');
  await page.getByRole('button', { name: 'Kartalle', exact: true }).first().tap();
  await expect(page.locator('.wmap')).toHaveAttribute('data-travel', 'moving');
  const old = await page.locator('.wmap').elementHandle();
  await page.getByRole('button', { name: 'Pelaa', exact: true }).tap();
  await expect(page.locator('.wmap')).toHaveCount(0);
  expect(await old!.getAttribute('data-travel')).toBe('disposed');
  expect(new URL(page.url()).hash).toBe('#kc/M-NUM-STABLE-ORDER');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-lite-2')!).attempts)).toEqual([]);
});
