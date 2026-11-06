import { expect, test, type Page } from '@playwright/test';

test.use({ contextOptions: { reducedMotion: 'reduce' } });
const snapshot = (page: Page) => page.evaluate(() => JSON.parse(window.render_game_to_text!()));
const saved = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? 'null'));
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      return /^webgl/.test(type) ? null : Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
});

test('readiness describes the selected quantity and does not turn its story into mastery', async ({ page }) => {
  await page.goto('./?qa=1&seed=1#saaristo/M-MEAS-12');
  await page.getByRole('button', { name: 'Aikuiselle: retken tiedot' }).click();
  await expect(page.locator('[data-item-readiness]')).toHaveAttribute('data-item-readiness', 'no-item');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Kokeilen itse', exact: true }).click();
  const first = await snapshot(page);
  expect(first.itemReadiness).toMatchObject({ diagnosticAvailable: true, dynamic: { status: 'missing' } });
  expect(first.itemReadiness.dynamic.alternatives).toHaveLength(1);
  const prerequisites: string[] = first.itemReadiness.dynamic.alternatives[0].all;
  expect(prerequisites).toHaveLength(1);
  const fixture = {
    v: 3, attempts: [],
    events: prerequisites.map(node => ({ node, id: `story.${node}.resolved`, at: 1, assisted: true })),
    effects: prerequisites.map(node => `world.${node}.resolved`),
  };
  await page.evaluate(value => localStorage.setItem('sammakko-journey-3', JSON.stringify(value)), fixture);
  await page.reload();
  await page.getByRole('button', { name: 'Kokeilen itse', exact: true }).click();
  expect((await snapshot(page)).itemReadiness.dynamic.status).toBe('missing');
  await page.getByRole('button', { name: 'Aikuiselle: retken tiedot' }).click();
  await expect(page.locator('[data-item-readiness]')).toContainText('ei vielä ole itsenäistä näyttöä');
  await page.keyboard.press('Escape');
  expect((await snapshot(page)).phase).toBe('independent');
  expect(await saved(page)).toEqual(fixture);
});

// Every live item producer now supplies an audited context (Lite 690), so an unresolved context can no longer be reached
// in the running game; tests/item-readiness*.test.ts cover it with unknown structures. This keeps the browser check that
// readiness only informs the adult and never blocks or records direct investigation.
test('an audited equation context reports missing evidence while direct investigation remains possible', async ({ page }) => {
  await page.goto('./?qa=1&seed=1#saaristo/M79-EQ1-SOLVE');
  await page.getByRole('button', { name: 'Kokeilen itse', exact: true }).click();
  const current = await snapshot(page);
  expect(current.itemReadiness).toMatchObject({ diagnosticAvailable: true, dynamic: { status: 'missing' } });
  expect(current.phase).toBe('independent');
  await page.getByRole('button', { name: 'Aikuiselle: retken tiedot' }).click();
  await expect(page.locator('[data-item-readiness]')).toContainText('ei vielä ole itsenäistä näyttöä');
  expect((await saved(page))?.attempts ?? []).toHaveLength(0);
});
