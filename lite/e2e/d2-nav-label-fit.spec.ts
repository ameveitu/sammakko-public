import { expect, test } from '@playwright/test';
import { answerBook, fallbackBook, openBook, pauseBook, reachQuestion } from './book-contract';

for (const [width, height] of [[320, 640], [390, 844], [768, 1024], [1366, 768]]) {
  test(`book navigation text and arrows fit all states at ${width}px`, async ({ page }, info) => {
    await fallbackBook(page);
    await page.setViewportSize({ width, height });
    await openBook(page, 'CHEM79-REACTION-01', 45);
    await pauseBook(page);
    await page.evaluate(() => document.fonts.ready);
    const measurements = [];
    for (const state of ['beat', 'question', 'feedback']) {
      if (state === 'question') await reachQuestion(page);
      if (state === 'feedback') await answerBook(page, false);
      await page.mouse.move(0, 0);
      await page.locator('.book-nav').evaluate(async nav => {
        await Promise.all(nav.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {})));
      });
      if (width === 320 && state === 'beat') await page.screenshot({ path: info.outputPath('320-beat.png') });
      const measured = await page.locator('.book-nav').evaluate(nav => {
        const navBox = nav.getBoundingClientRect();
        return {
          height: navBox.height,
          buttons: [...nav.querySelectorAll<HTMLButtonElement>('button')].map(button => {
            const box = button.getBoundingClientRect();
            const text = [...button.childNodes].filter(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
            const rects = text.flatMap(node => {
              const range = document.createRange(); range.selectNodeContents(node);
              return [...range.getClientRects()];
            });
            const arrow = button.querySelector('span');
            if (arrow) rects.push(arrow.getBoundingClientRect());
            return {
              label: button.textContent?.trim(), width: box.width, height: box.height,
              // The borderless skip link intentionally has no painted padding.
              requiredInset: button.classList.contains('book-skip') ? 0 : 2,
              inset: Math.min(...rects.map(rect => Math.min(rect.left - box.left, box.right - rect.right))),
              visible: box.left >= navBox.left - .5 && box.right <= navBox.right + .5,
            };
          }),
        };
      });
      measurements.push({ state, ...measured });
    }
    console.log(JSON.stringify({ viewport: [width, height], navigation: measurements }));
    for (const row of measurements) for (const button of row.buttons) {
      expect(button.visible, `${row.state}: ${button.label} button stays inside navigation`).toBe(true);
      expect(button.width, `${row.state}: ${button.label} touch width`).toBeGreaterThanOrEqual(43.9);
      expect(button.height, `${row.state}: ${button.label} touch height`).toBeGreaterThanOrEqual(43.9);
      expect(button.inset, `${row.state}: ${button.label} text/arrow inset`).toBeGreaterThanOrEqual(button.requiredInset);
    }
  });
}
