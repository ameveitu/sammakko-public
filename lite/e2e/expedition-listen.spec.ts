import { expect, test } from '@playwright/test';
import { answerBook, book, journey, openBook, reachQuestion } from './book-contract';

// A usable speech channel is deliberately supplied: a quiet/headless browser
// otherwise omits the very controls whose overlapping layout regressed.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      return /^webgl/.test(type) ? null : Reflect.apply(getContext, this, [type, ...args]);
    } as typeof getContext;
    const plays: string[] = [];
    Object.defineProperty(window, 'bookSpeech', { value: plays });
    HTMLMediaElement.prototype.play = function () { plays.push(this.src); return Promise.resolve(); };
    class Utterance {
      onstart?: () => void;
      onend?: () => void;
      constructor(public text = '') {}
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: Utterance, configurable: true });
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      getVoices: () => [{ lang: 'fi-FI', name: 'Finnish layout fixture', localService: true }],
      addEventListener() {}, cancel() {}, resume() {}, pause() {},
      speak(utterance: Utterance) { plays.push(utterance.text); queueMicrotask(() => { utterance.onstart?.(); utterance.onend?.(); }); },
    } });
  });
});

for (const viewport of [{ width: 1366, height: 768 }, { width: 768, height: 1024 }]) {
  test(`full workbench speech buttons leave the answers readable and never submit (${viewport.width})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    // ENV-PHY-SPACE-01 became an own-explanation task (no answer options); its sibling keeps the long space answers.
    for (const id of ['PHY79-FORCE-MOTION', 'ENV-PHY-SPACE-NEAR-01']) {
      await page.goto(`./?qa=1&full=1&seed=1#saaristo/${id}`);
      await page.getByRole('button', { name: 'Kokeilen itse', exact: true }).click();
      const buttons = page.locator('.exp-task .opt .listen');
      await expect(buttons.first()).toBeVisible();
      const boxes = await page.locator('.exp-task .opt').evaluateAll(options => options.map(option => {
        const text = option.querySelector('.txt')!.getBoundingClientRect();
        const audio = option.querySelector('.listen')!.getBoundingClientRect();
        return {
          overlap: Math.min(text.right, audio.right) > Math.max(text.left, audio.left) && Math.min(text.bottom, audio.bottom) > Math.max(text.top, audio.top),
          audioWidth: audio.width, audioHeight: audio.height, bottom: option.getBoundingClientRect().bottom,
        };
      }));
      for (const box of boxes) {
        expect(box.overlap).toBe(false);
        expect(box.audioWidth).toBeGreaterThanOrEqual(44);
        expect(box.audioHeight).toBeGreaterThanOrEqual(44);
        expect(box.bottom).toBeLessThanOrEqual(viewport.height);
      }
      const before = await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[]}').attempts.length);
      await buttons.first().focus();
      await page.keyboard.press('Enter');
      expect(await page.evaluate(() => JSON.parse(window.render_game_to_text!()).answered)).toBe(false);
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[]}').attempts.length)).toBe(before);
      await page.locator('.exp-task .opt .txt').first().click();
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3')!).attempts.length)).toBe(before + 1);
    }
    expect(errors).toEqual([]);
  });
}

for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }]) {
  test(`default book speech reads beats, questions and feedback without submitting (${viewport.width})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openBook(page, 'PHY79-FORCE-MOTION', 1);
    const listen = () => page.locator('.book-nav').getByRole('button', { name: 'Kuuntele', exact: true });
    const spokenCount = () => page.evaluate<number>(() => Reflect.get(window, 'bookSpeech').length);
    const first = await book(page);
    const beforeBeat = await spokenCount();
    await listen().focus();
    await page.keyboard.press('Enter');
    await expect.poll(spokenCount).toBeGreaterThan(beforeBeat);
    expect(await book(page)).toEqual(first);
    expect((await journey(page))?.attempts ?? []).toHaveLength(0);
    await reachQuestion(page);
    const question = await book(page);
    const beforeQuestion = await spokenCount();
    const box = await listen().boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
    await expect(listen()).toBeInViewport();
    await listen().focus();
    await page.keyboard.press('Enter');
    await expect.poll(spokenCount).toBeGreaterThan(beforeQuestion);
    expect(await book(page)).toEqual(question);
    expect((await journey(page))?.attempts ?? []).toHaveLength(0);
    await answerBook(page);
    const answered = await book(page), saved = await journey(page);
    const beforeFeedback = await spokenCount();
    await listen().focus();
    await page.keyboard.press('Enter');
    await expect.poll(spokenCount).toBeGreaterThan(beforeFeedback);
    expect(await book(page)).toEqual(answered);
    expect(await journey(page)).toEqual(saved);
  });
}
