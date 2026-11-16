import { expect, test } from '@playwright/test';
import { answerBook, book, bookTask, fallbackBook, journey, openBook, pauseBook, reachQuestion } from './book-contract';

test.beforeEach(async ({ page }) => fallbackBook(page));

for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 640 }]) {
  test(`default phone book permits wrong, fresh replay, correct, skip and return (${viewport.width})`, async ({ page }, info) => {
    await page.setViewportSize(viewport);
    await openBook(page, 'M-FRAC-13', 1);
    await pauseBook(page);
    await reachQuestion(page);
    const question = await book(page);
    await answerBook(page, false);
    await expect(page.locator('.book-feedback')).toContainText('Oikea vastaus:');
    await expect(page.getByRole('button', { name: 'Eteenpäin', exact: true })).toBeInViewport();
    const wrong = await journey(page);
    expect(wrong.attempts).toEqual([expect.objectContaining({ node: question.page, phase: 'guided', ok: false, mode: 'saaristo-kirja' })]);
    await page.getByRole('button', { name: 'Toinen kysymys', exact: true }).click();
    expect((await book(page)).page).toBe(question.page);
    expect((await book(page)).answered).toBe(false);
    expect(await journey(page)).toEqual(wrong);
    await answerBook(page);
    const saved = await journey(page);
    expect(saved.attempts).toHaveLength(2);
    expect(saved.attempts[1]).toMatchObject({ phase: 'guided', ok: true, mode: 'saaristo-kirja' });
    expect(saved.attempts[1].seed).not.toBe(saved.attempts[0].seed);
    await page.screenshot({ path: info.outputPath('book-feedback.png') });
    await page.getByRole('button', { name: 'Eteenpäin', exact: true }).click();
    await expect.poll(async () => (await book(page)).page).not.toBe(question.page);
    const next = (await book(page)).page;
    await page.getByRole('button', { name: 'Retkikartta', exact: true }).click();
    await page.getByRole('dialog').locator(`[data-node="${question.page}"]`).click();
    await expect.poll(async () => (await book(page)).page).toBe(question.page);
    await page.goBack();
    await expect.poll(async () => (await book(page)).page).toBe(next);
    await reachQuestion(page);
    const beforeSkip = await journey(page);
    await page.getByRole('button', { name: 'Ohita', exact: true }).click();
    await expect.poll(async () => (await book(page)).page).not.toBe(next);
    const skipped = await journey(page);
    expect(skipped.attempts).toEqual(beforeSkip.attempts);
    expect(skipped.events).toEqual(beforeSkip.events);
    expect(skipped.effects).toEqual(beforeSkip.effects);
    expect(skipped.storyStops).toContain(next);
    const afterSkip = (await book(page)).page;
    await page.reload();
    await page.waitForFunction(() => typeof window.render_game_to_text === 'function');
    await expect.poll(async () => (await book(page))?.page).toBe(afterSkip);
    expect((await journey(page)).attempts).toEqual(skipped.attempts);
  });
}

test('default book keyboard navigates beats, isolates the map and answers once with status feedback', async ({ page }) => {
  await openBook(page, 'CHEM79-COMPOUND', 3);
  await pauseBook(page);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await book(page)).step).toBe(1);
  await page.keyboard.press('ArrowLeft');
  await expect.poll(async () => (await book(page)).step).toBe(0);
  await reachQuestion(page);
  const question = await book(page);
  expect(question.tryKind).toBe('choice');
  await page.getByRole('button', { name: 'Retkikartta', exact: true }).click();
  await page.getByRole('searchbox').fill('690');
  await page.getByRole('searchbox').press('Enter');
  expect(await book(page)).toEqual(question);
  expect((await journey(page))?.attempts ?? []).toHaveLength(0);
  await page.keyboard.press('Escape');
  await bookTask(page).locator('button.opt').first().focus();
  await page.keyboard.press(String(question.qaAnswer + 1));
  await expect(page.locator('.book-feedback[role="status"]')).toHaveAttribute('aria-live', 'polite');
  await expect(page.locator('.book-feedback')).toContainText('Oikein!');
  await expect(page.getByRole('button', { name: 'Eteenpäin', exact: true })).toBeFocused();
  expect((await journey(page)).attempts).toEqual([expect.objectContaining({ phase: 'guided', mode: 'saaristo-kirja', ok: true })]);
  expect(await page.evaluate(() => JSON.parse(window.render_game_to_text!()).progress.checked)).toBe(false);
  await page.keyboard.press(String(question.qaAnswer + 1));
  expect((await journey(page)).attempts).toHaveLength(1);
  // Reduced motion avoids a delayed leaving transition and still moves to the next page.
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await book(page)).page).not.toBe(question.page);
  await expect(page.locator('.book-leaving')).toHaveCount(0);
});
