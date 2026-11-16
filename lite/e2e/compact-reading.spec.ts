import { expect, test } from '@playwright/test';
import { answerBook, book, fallbackBook, openBook, pauseBook, reachQuestion } from './book-contract';

test('a quiet phone can read the story on demand and answer the visible task', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await fallbackBook(page);
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

  await openBook(page, 'M-FRAC-13', 1);
    await pauseBook(page);
  const beat = (await book(page)).beat;
  await expect(page.locator('.book-text')).toBeVisible();
  expect(beat).toBeTruthy();
  await expect(page.locator('.book-text')).toHaveText(beat!);
  await reachQuestion(page);
  await expect(page.locator('.book-q')).toBeVisible();
  await expect(page.locator('.book-task')).toBeVisible();
  await answerBook(page);
  await expect(page.locator('.book-feedback[role="status"]')).toContainText('Oikein!');
  const spoken = () => page.evaluate<string[]>(() => Reflect.get(window, 'heardLines'));
  expect(await spoken()).toEqual([]);
  // A deliberate listen reads the visible feedback without turning quiet mode off.
  await page.locator('.book-nav').getByRole('button', { name: 'Kuuntele', exact: true }).click();
  await expect.poll(async () => (await spoken()).length).toBeGreaterThan(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-lite-2')!).quietUntil)).toBeGreaterThan(Date.now());
  await page.evaluate(() => Reflect.get(window, 'heardLines').splice(0));
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
