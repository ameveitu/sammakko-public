import {expect, test} from '@playwright/test';

for (const width of [320, 390]) {
  test(`secondary pages fit ${width}px and keep site destinations in Valikko`, async ({page}) => {
    await page.setViewportSize({width, height:780});
    for (const path of ['/tietoa/', '/oppimisverkko/', '/whitepaper/', '/oppitunnit/', '/oppitunnit/lessons/M-FRAC-13.html']) {
      await page.goto(path);
      const menu = page.getByRole('button', {name:'Valikko'});
      await expect(menu).toBeVisible();
      await expect(page.locator('footer a:visible')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      await menu.click();
      await expect(page.getByRole('navigation', {name:'Päänavigaatio'}).getByRole('link', {name:'Etusivu'})).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(menu).toBeFocused();
    }
    await page.goto('/whitepaper/');
    const contents = page.locator('[data-paper-contents]');
    await expect(contents).not.toHaveAttribute('open', '');
    await contents.locator('summary').click();
    const chapter = contents.locator('a').first();
    const href = await chapter.getAttribute('href');
    await chapter.click();
    expect(new URL(page.url()).hash).toBe(href);
    await expect(page.locator(':target')).toBeInViewport();
  });
}
