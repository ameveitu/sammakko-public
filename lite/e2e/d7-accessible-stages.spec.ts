import { expect, test, type Page } from '@playwright/test';

const cases = [
  { id: 'ENV-PHY-SPACE-01', answer: 'Kesän kohta: pohjoinen kallistuu Aurinkoa kohti', key: 'Enter' },
  { id: 'ENV-PHY-ELECSAFE-01', answer: 'Pysyn kaukana, varoitan kavereita ja kerron aikuiselle', key: 'Space' },
] as const;

async function tabToButton(page: Page, name: string) {
  const target = page.getByRole('button', { name, exact: true });
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((element) => element === document.activeElement)) break;
  }
  await expect(target).toBeFocused();
  expect(await target.evaluate((element) => element.closest('[aria-hidden="true"]'))).toBeNull();
  expect(await target.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');
  expect(await target.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return rect.width > 0 && rect.height > 0 && x >= 0 && x < innerWidth && y >= 0 && y < innerHeight && !!hit && (hit === element || element.contains(hit));
  })).toBe(true);
}

for (const { id, answer, key } of cases) {
  test(`${id}: keyboard reaches the accessible book choice and records one answer`, async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`./?qa=1&seed=1#saaristo/${id}`);
    await expect(page.getByRole('button', { name: 'Eteenpäin', exact: true })).toBeVisible();
    while (await page.getByRole('button', { name: 'Eteenpäin', exact: true }).count()) {
      await tabToButton(page, 'Eteenpäin');
      await page.keyboard.press('Enter');
    }
    await expect(page.locator('.exp-world')).toHaveAttribute('aria-hidden', 'true');
    const renderer = await page.evaluate(() => {
      const render = (window as Window & { render_game_to_text?: () => string }).render_game_to_text;
      return render ? JSON.parse(render()).renderer : 'unavailable';
    });
    console.log(`${id} renderer=${renderer}`);
    await expect(page.getByRole('button', { name: answer, exact: true })).toBeVisible();
    await tabToButton(page, answer);
    await page.screenshot({ path: info.outputPath(`${id}-focus.png`) });
    await page.keyboard.press(key);
    await expect(page.getByRole('status')).toContainText('Oikein!');
    const save = await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? 'null'));
    expect(save.v).toBe(3);
    expect(save.attempts).toHaveLength(1);
    expect(save.attempts[0]).toMatchObject({ node: id, phase: 'guided', ok: true, mode: 'saaristo-kirja' });
  });
}
