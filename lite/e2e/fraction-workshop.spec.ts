import { expect, test, type Page } from '@playwright/test';

const ids = ['M-FRAC-04', 'M-FRAC-07', 'M-FRAC-09', 'M-FRAC-10', 'M-FRAC-14'] as const;
type Id = typeof ids[number];
const desk = (page: Page) => page.locator('.exp-desk');
const workbench = (page: Page) => desk(page).locator('.fraction-workshop');
const task = (page: Page) => desk(page).locator('.exp-task');
const feedback = (page: Page) => desk(page).locator('.exp-feedback');
const values = (page: Page) => workbench(page).locator('table tbody td').allTextContents();
const fraction = (text: string) => text.split('/').map(Number) as [number, number];
const write = (n: number, d: number) => [...String(n), '/', ...String(d)];
const goto = async (page: Page, id: Id) => {
  await page.goto(`./?qa=1&seed=1#saaristo/${id}`);
  await page.getByRole('button', { name: 'Kokeilen itse', exact: true }).click();
  await expect(workbench(page)).toBeVisible();
};
const drawPoint = async (page: Page, tick: number) => {
  const slider = task(page).getByRole('slider', { name: 'Vastaus lukusuoralla' });
  await slider.press('Home');
  for (let i = 0; i < tick; i++) await slider.press('ArrowRight');
  await task(page).getByRole('button', { name: 'Valmis', exact: true }).click();
};
const build = async (page: Page, tokens: string[]) => {
  for (const token of tokens) await task(page).locator('.tray').getByRole('button', { name: token, exact: true }).click();
  await task(page).getByRole('button', { name: 'Valmis', exact: true }).click();
};
const subtract = async (page: Page, wrong: boolean) => {
  const [, a, b] = await values(page);
  const [an, ad] = fraction(a!);
  const [bn, bd] = fraction(b!);
  const product = ad * bd;
  const delta = an * bd - bn * ad;
  const cuts = wrong ? product + 1 : product * 2;
  await task(page).getByRole('textbox', { name: 'Osia yhteisessä jaossa' }).fill(String(cuts));
  await expect(workbench(page)).toContainText(`Luonnoksen jako: ${cuts} osaa`);
  await task(page).getByRole('textbox', { name: 'Erotuksen osoittaja' }).fill(String(wrong ? delta : delta * 2));
  const denominator = task(page).getByRole('textbox', { name: 'Erotuksen nimittäjä' });
  await denominator.fill(String(wrong ? product : cuts));
  await denominator.press('Enter');
  return { cuts, delta };
};

test.describe('LM08 fraction workshop', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...options: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(getContext, this, [type, ...options]);
      } as typeof getContext;
    });
  });

  test('recovers from dropping the whole part and records a keyboard success with a hint', async ({ page }) => {
    await goto(page, 'M-FRAC-04');
    const [given] = await values(page);
    const [n, d] = fraction(given!);
    expect(n).toBeGreaterThan(d);
    await drawPoint(page, n % d);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await expect(feedback(page)).toContainText('kokonaiset');
    await page.getByRole('button', { name: 'Uusi kokeilu', exact: true }).click();
    await page.getByRole('button', { name: 'Pieni vihje', exact: true }).click();
    await expect(desk(page).locator('.exp-help')).toContainText('yhtä suurta osaväliä');
    const [next] = await values(page);
    const [nextN] = fraction(next!);
    await drawPoint(page, nextN);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    const attempts = await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3')!).attempts);
    expect(attempts).toMatchObject([{ ok: false, help: [] }, { ok: true, help: ['hint'] }]);
  });

  test('redraws unfilled cuts and requires both expanded numbers', async ({ page }) => {
    await goto(page, 'M-FRAC-07');
    const toggle = desk(page).getByRole('button', { name: 'Korjaa myös tyhjien osien jako' });
    const dashed = workbench(page).locator('path[stroke-dasharray]');
    const before = await dashed.count();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(await dashed.count()).toBeGreaterThan(before);
    const blueWidths = await workbench(page).locator('rect[fill="#41949e"]').evaluateAll(rects => rects.map(rect => rect.getAttribute('width')));
    expect(blueWidths).toHaveLength(2);
    expect(blueWidths[0]).toBe(blueWidths[1]);

    const [, part, factor] = await values(page);
    const [n, d] = fraction(part!);
    await build(page, write(n, d * Number(factor)));
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await expect(feedback(page)).toContainText('siniset osat');
    await page.getByRole('button', { name: 'Uusi kokeilu', exact: true }).click();
    const [, nextPart, nextFactor] = await values(page);
    const [nextN, nextD] = fraction(nextPart!);
    await build(page, write(nextN * Number(nextFactor), nextD * Number(nextFactor)));
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
  });

  test('requires a common cut before accepting an equivalent unsimplified subtraction', async ({ page }) => {
    await goto(page, 'M-FRAC-14');
    await subtract(page, true);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await expect(feedback(page)).toContainText('jaollinen');
    await page.getByRole('button', { name: 'Uusi kokeilu', exact: true }).click();
    const { cuts, delta } = await subtract(page, false);
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    await expect(workbench(page)).toContainText(`Valittu yhteinen jako: ${cuts} osaa`);
    await expect(task(page).getByRole('status')).toContainText(`Jäljelle jää ${delta * 2}/${cuts}`);

    await page.goto('./?qa=1&seed=20#saaristo/M-FRAC-14');
    await page.getByRole('button', { name: 'Tutkitaan yhdessä', exact: true }).click();
    await subtract(page, false);
    await page.getByRole('button', { name: 'Toinen yhteinen kokeilu', exact: true }).click();
    await subtract(page, false);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3')!));
    expect(saved.events).toEqual([expect.objectContaining({ node: 'M-FRAC-14', assisted: true })]);
    expect(saved.effects).toContain('world.M-FRAC-14.resolved');
  });

  for (const [name, viewport] of [
    ['desktop', { width: 1440, height: 900 }],
    ['tablet', { width: 820, height: 1180 }],
  ] as const) {
    test(`all five workbenches fit the ${name} viewport width`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      for (const id of ids) {
        await goto(page, id);
        const overflow = await workbench(page).locator('.table-wrap').evaluate(el => el.scrollWidth - el.clientWidth);
        expect(overflow, id).toBeLessThanOrEqual(1);
        const last = task(page).locator('button:visible').last();
        await last.scrollIntoViewIfNeeded();
        await expect(last).toBeInViewport();
        const widths = await desk(page).evaluate(host => {
          const controls = [...host.querySelectorAll('button,input,[role="slider"]')].filter(element => element.getClientRects().length);
          return {
            screen: document.documentElement.scrollWidth,
            left: Math.min(...controls.map(element => element.getBoundingClientRect().left)),
            right: Math.max(...controls.map(element => element.getBoundingClientRect().right)),
          };
        });
        expect(widths.screen, id).toBeLessThanOrEqual(viewport.width);
        expect(widths.left, id).toBeGreaterThanOrEqual(0);
        expect(widths.right, id).toBeLessThanOrEqual(viewport.width);
        if (id === 'M-FRAC-14') {
          const path = testInfo.outputPath(`fraction-workshop-${name}.png`);
          await page.screenshot({ path });
          await testInfo.attach(`fraction-subtraction-${name}`, { path, contentType: 'image/png' });
        }
      }
    });
  }
});
