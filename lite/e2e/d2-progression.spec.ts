import { expect, test } from '@playwright/test';
import { answerBook, book, fallbackBook, journey, openBook, reachQuestion } from './book-contract';
test.beforeEach(async ({ page }) => fallbackBook(page));
test('pause, manual navigation, retry and skip do not create stale advances or false attempts', async ({ page }) => {
  await openBook(page, 'M-FRAC-13', 3);
  await page.getByRole('button', { name: 'Keskeytä automaattinen eteneminen' }).click();
  const first = await book(page); await page.waitForTimeout(6000); expect(await book(page)).toEqual(first);
  await reachQuestion(page); await answerBook(page, false); const saved = await journey(page);
  await page.getByRole('button', { name: 'Toinen kysymys' }).click(); expect((await book(page)).answered).toBe(false);
  await page.waitForTimeout(6000); expect((await book(page)).answered).toBe(false); expect(await journey(page)).toEqual(saved);
  await page.getByRole('button', { name: 'Ohita' }).click(); await expect.poll(async () => (await book(page)).page).not.toBe(first.page);
  expect((await journey(page)).attempts).toEqual(saved.attempts);
});
test('map holds progression until explicitly resumed', async ({ page }) => {
  await openBook(page, 'M-FRAC-13', 3); const before = await book(page);
  await page.getByRole('button', { name: 'Retkikartta' }).click(); await page.waitForTimeout(5000);
  await page.keyboard.press('Escape'); await page.waitForTimeout(5000); expect(await book(page)).toEqual(before);
  await page.getByRole('button', { name: 'Jatka automaattista etenemistä' }).click();
  await expect.poll(async () => (await book(page)).step, { timeout: 30000 }).toBe(before.step + 1);
});

test('Lite speech replay before answering leaves progression visibly paused', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: class { constructor(public text: string) {} } });
    Object.defineProperty(window, 'speechSynthesis', { value: {
      getVoices: () => [{ lang: 'fi-FI', name: 'Testi', localService: true }], addEventListener() {}, cancel() {},
      speak(line: SpeechSynthesisUtterance) { line.onstart?.(new Event('start') as SpeechSynthesisEvent); setTimeout(() => line.onend?.(new Event('end') as SpeechSynthesisEvent), 100); },
    } });
  });
  await page.goto('./#kc/M-NUM-06');
  await page.getByRole('button', { name: 'Osaan jo', exact: true }).click();
  await page.getByRole('button', { name: 'Kuuntele ohje' }).click();
  await page.locator('button.opt').first().click();
  await expect(page.getByRole('button', { name: 'Jatka automaattista etenemistä' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Keskeytä automaattinen eteneminen' })).toHaveCount(0);
});

test('an answer with an optional listen control still advances normally', async ({page}) => {
  test.setTimeout(30000); await openBook(page, 'M-NUM-STABLE-ORDER', 3); await reachQuestion(page);
  const question = await book(page); await answerBook(page);
  await expect(page.getByRole('button', { name: 'Keskeytä automaattinen eteneminen' })).toBeVisible();
  await expect.poll(async () => (await book(page)).page, { timeout: 20000 }).not.toBe(question.page);
});
for (const interruption of ['modal', 'background'] as const) {
  test(`regular-motion departure waits through ${interruption} and resumes once`, async ({ page }) => {
    test.setTimeout(30000); await page.emulateMedia({ reducedMotion: 'no-preference' });
    await openBook(page, 'M-FRAC-13', 3);
    await page.getByRole('button', { name: 'Keskeytä automaattinen eteneminen' }).click();
    await reachQuestion(page); const before = await book(page); await answerBook(page);
    const saved = await journey(page); await page.getByRole('button', { name: 'Eteenpäin', exact: true }).click();
    if (interruption === 'modal') await page.getByRole('button', { name: 'Retkikartta' }).click();
    else await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
    await page.waitForTimeout(850); expect((await book(page)).page).toBe(before.page);
    expect((await journey(page)).attempts).toEqual(saved.attempts);
    expect((await journey(page)).storyStops ?? []).not.toContain(before.page);
    if (interruption === 'modal') await page.keyboard.press('Escape');
    else await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); });
    await page.getByRole('button', { name: 'Jatka automaattista etenemistä' }).click();
    await expect.poll(async () => (await book(page)).page).not.toBe(before.page);
    const after = await journey(page); expect(after.attempts).toEqual(saved.attempts);
    expect(after.storyStops.filter((id: string) => id === before.page)).toHaveLength(1);
  });
}

test('back at the first beat leaves its automatic advance running', async ({page}) => {
  test.setTimeout(30000); await openBook(page, 'M-FRAC-13', 3); const first = await book(page);
  await page.keyboard.press('ArrowLeft');
  await expect.poll(async () => (await book(page)).step, { timeout: 25000 }).toBe(first.step + 1);
});
test('retry cancels a held departure rather than skipping the new question', async ({ page }) => {
  test.setTimeout(30000); await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openBook(page, 'M-FRAC-13', 3); await page.getByRole('button', { name: 'Keskeytä automaattinen eteneminen' }).click();
  await reachQuestion(page); const question = await book(page); await answerBook(page, false); const saved = await journey(page);
  await page.getByRole('button', { name: 'Jatka automaattista etenemistä' }).click();
  await page.getByRole('button', { name: 'Eteenpäin', exact: true }).click();
  await page.getByRole('button', { name: 'Retkikartta' }).click(); await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Toinen kysymys' }).click();
  await page.getByRole('button', { name: 'Jatka automaattista etenemistä' }).click();
  await page.waitForTimeout(1500); expect(await book(page)).toMatchObject({ page: question.page, step: question.step, answered: false });
  expect((await journey(page)).attempts).toEqual(saved.attempts);
  expect((await journey(page)).storyStops ?? []).not.toContain(question.page);
});

test('replaying feedback cancels held departure and resume waits for speech', async ({page}) => {
  test.setTimeout(45000); await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: class { constructor(public text: string) {} } });
    const lines: SpeechSynthesisUtterance[] = []; Object.defineProperty(window, '__lines', { value: lines });
    Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => [{lang:'fi-FI',name:'Testi',localService:true}], addEventListener() {}, cancel() {}, speak(line:SpeechSynthesisUtterance) { lines.push(line); line.onstart?.(new Event('start') as SpeechSynthesisEvent); } } });
  });
  await page.route(/\.(mp3|wav|ogg)(\?.*)?$/, route => route.abort());
  await openBook(page,'M-FRAC-13',3); await page.getByRole('button',{name:'Keskeytä automaattinen eteneminen'}).click();
  await reachQuestion(page); const question=await book(page); await answerBook(page,false);
  await page.getByRole('button',{name:'Jatka automaattista etenemistä'}).click();
  await page.getByRole('button',{name:'Eteenpäin',exact:true}).click();
  await page.getByRole('button', { name: 'Retkikartta' }).click(); await page.keyboard.press('Escape');
  await page.locator('.book-nav').getByRole('button',{name:'Kuuntele',exact:true}).click();
  await expect.poll(() => page.evaluate(() => (Reflect.get(window,'__lines') as unknown[]).length)).toBeGreaterThan(0);
  await page.getByRole('button',{name:'Jatka automaattista etenemistä'}).click();
  await page.waitForTimeout(1500); expect(await book(page)).toMatchObject({page:question.page,answered:true});
  await page.evaluate(() => { const lines=Reflect.get(window,'__lines') as SpeechSynthesisUtterance[]; lines.at(-1)?.onend?.(new Event('end') as SpeechSynthesisEvent); });
  await expect.poll(async () => (await book(page)).page,{timeout:30000}).not.toBe(question.page);
});
test('back cancels a held departure before reviewing the previous beat', async ({page}) => {
  test.setTimeout(30000); await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openBook(page,'M-FRAC-13',3); await page.getByRole('button',{name:'Keskeytä automaattinen eteneminen'}).click();
  await reachQuestion(page); const question=await book(page); await answerBook(page,false); const saved=await journey(page);
  await page.getByRole('button',{name:'Jatka automaattista etenemistä'}).click(); await page.getByRole('button',{name:'Eteenpäin',exact:true}).click();
  await page.getByRole('button', { name: 'Retkikartta' }).click(); await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Edellinen kohta'}).click(); const previous=await book(page);
  expect(previous.step).toBe(question.step-1); await page.getByRole('button',{name:'Jatka automaattista etenemistä'}).click();
  await page.waitForTimeout(1500); expect(await book(page)).toMatchObject({page:question.page,step:previous.step});
  expect((await journey(page)).attempts).toEqual(saved.attempts); expect((await journey(page)).storyStops ?? []).not.toContain(question.page);
});
test('departure fallback remains visible if hidden precedes its event', async ({page}) => {
  test.setTimeout(30000); await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openBook(page,'M-FRAC-13',3); await page.getByRole('button',{name:'Keskeytä automaattinen eteneminen'}).click();
  await reachQuestion(page); const before=await book(page); await answerBook(page);
  await page.getByRole('button',{name:'Eteenpäin',exact:true}).click();
  await page.evaluate(() => Object.defineProperty(document,'hidden',{configurable:true,value:true}));
  await page.waitForTimeout(850); expect((await book(page)).page).toBe(before.page);
  await expect(page.locator('.book-desk')).not.toHaveClass(/book-leaving/);
  await expect(page.getByRole('button',{name:'Jatka automaattista etenemistä'})).toBeVisible();
  await page.evaluate(() => Object.defineProperty(document,'hidden',{configurable:true,value:false}));
  await page.getByRole('button',{name:'Jatka automaattista etenemistä'}).click();
  await expect.poll(async () => (await book(page)).page).not.toBe(before.page);
});
for (const [width,height] of [[320,640],[390,844],[768,1024],[1366,768]]) {
  test(`feedback footer labels keep padding at ${width}px`, async ({page}) => {
    await page.setViewportSize({width,height}); await openBook(page,'M-NUM-1TO1',3);
    await page.getByRole('button',{name:'Keskeytä automaattinen eteneminen'}).click();
    await reachQuestion(page); await answerBook(page);
    for (const selector of ['.book-next','.book-again']) {
      const inset = await page.locator(selector).evaluate(el => {
        const range=document.createRange(); const node=[...el.childNodes].find(n=>n.nodeType===Node.TEXT_NODE && n.textContent?.trim());
        if(!node) return -1; range.selectNodeContents(node); const box=el.getBoundingClientRect();
        return Math.min(...[...range.getClientRects()].map(r=>Math.min(r.left-box.left,box.right-r.right)));
      });
      expect(inset, `${selector} text inset`).toBeGreaterThanOrEqual(2);
    }
  });
}
