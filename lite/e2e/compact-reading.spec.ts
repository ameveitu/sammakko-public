import { expect, test } from '@playwright/test';

test('a quiet phone can read the story on demand and answer the visible task', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('sammakko-lite-2', JSON.stringify({
      v: 2, quietUntil: Date.now() + 3600_000, attempts: [], events: [],
    }));
    const plays: string[] = [];
    Object.defineProperty(window, 'heardLines', { value: plays });
    HTMLMediaElement.prototype.play = function () { plays.push(this.src); return Promise.resolve(); };
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: class { constructor(public text: string) {} } });
    Object.defineProperty(window, 'speechSynthesis', { value: {
      getVoices: () => [{ lang: 'fi-FI', name: 'Testi' }], addEventListener() {}, cancel() {},
      speak(line: SpeechSynthesisUtterance) { plays.push(line.text); },
    } });
  });
  await page.goto('./#kc/M-NUM-02');
  const story = page.locator('details.reading-option');
  await expect(story).toBeVisible();
  await expect(story.locator('.say p')).toBeHidden();
  await story.locator('summary').click();
  await expect(story.locator('.goal')).toBeVisible();
  await page.getByRole('button', { name: 'Osaan jo', exact: true }).click();
  await expect(page.locator('#app .say p')).toBeVisible();
  await expect(page.locator('#app button.opt').first()).toBeVisible();

  await page.goto('./#saaristo/M-FRAC-13');
  await expect(story.locator('.exp-instruction')).toBeHidden();
  await story.locator('summary').click();
  await expect(story.locator('.exp-instruction')).toBeVisible();
  await page.getByRole('button', { name: 'Tutkitaan yhdessä', exact: true }).click();
  await expect(page.locator('.exp-desk .exp-instruction')).toBeVisible();
  await expect(page.locator('.exp-story')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Leikkaa palat/ })).toBeVisible();
  const spoken = () => page.evaluate<string[]>(() => Reflect.get(window, 'heardLines'));
  expect(await spoken()).toEqual([]);
  await page.goto('./#kc/M-NUM-02');
  await page.getByRole('button', { name: /Hiljainen tila päällä/ }).click();
  await expect.poll(async () => (await spoken()).length).toBeGreaterThan(0);
});

test('desktop keeps its visible story and goal', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('./#kc/M-NUM-02');
  await expect(page.locator('#app .say p')).toBeVisible();
  await expect(page.locator('#app .goal')).toBeVisible();
  await expect(page.locator('.reading-option')).toHaveCount(0);
});
