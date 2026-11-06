import { expect, test, type Page } from '@playwright/test';

const ids = ['M-RATREP-DEC-PCT', 'M-RATREP-FRAC-DEC', 'M-RATREP-FRAC-PCT', 'M-RATREP-01'] as const;
type Id = typeof ids[number];
type Form = 'fraction' | 'decimal' | 'percent';
type Ratio = readonly [bigint, bigint];
type Snapshot = { node: Id; phase: string; family: string; progress: { helped: boolean; checked: boolean } };
const shot = (page: Page): Promise<Snapshot> => page.evaluate(() =>
  JSON.parse((window as Window & { render_game_to_text: () => string }).render_game_to_text()));
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const form = (page: Page) => page.locator('[data-rational-link-form]');
const scene = (page: Page) => page.locator('[data-decimal-workbench]');
const feedback = (page: Page) => page.locator('.exp-feedback');
const saved = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3')!));
const mark = (page: Page, kind: Form) => form(page).locator(`[data-rational-format="${kind}"]`);

async function open(page: Page, id: Id, seed = 7, guided = false) {
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await button(page, guided ? 'Tutkitaan yhdessä' : 'Kokeilen itse').click();
  await expect(form(page)).toBeVisible();
  expect((await shot(page)).node).toBe(id);
}

function parse(format: Form, value: string): Ratio {
  if (format === 'fraction') {
    const [n, d] = value.split('/').map(BigInt);
    return [n!, d!];
  }
  const [whole, tail = ''] = value.trim().replace(/\s*%$/, '').split(/[,.]/);
  const scale = 10n ** BigInt(tail.length);
  return [BigInt(whole!) * scale + BigInt(tail || '0'), format === 'percent' ? scale * 100n : scale];
}

async function givenRatio(page: Page): Promise<Ratio> {
  const given = form(page).locator('[data-given="true"]');
  if (await given.count()) {
    const format = await given.getAttribute('data-rational-format') as Form;
    return parse(format, await given.locator('[data-trusted-label]').innerText());
  }
  const whole = (await scene(page).locator('.decimal-whole').innerText()).match(/(?:on|vetää) (\d+) /)![1]!;
  const part = (await scene(page).locator('.decimal-givens dd').first().innerText()).split(' ')[0]!;
  return [BigInt(part), BigInt(whole)];
}

async function setMarks(page: Page, [n, d]: Ratio, fractionMultiplier = 2n) {
  const thousandths = n * 1000n / d;
  const fraction = mark(page, 'fraction').locator('input');
  if (await fraction.count()) {
    await page.getByRole('textbox', { name: 'Osoittaja', exact: true }).fill(String(n * fractionMultiplier));
    await page.getByRole('textbox', { name: 'Nimittäjä', exact: true }).fill(String(d * fractionMultiplier));
  }
  const decimal = mark(page, 'decimal').locator('input');
  if (await decimal.count()) await decimal.fill(`${thousandths / 1000n}.${String(thousandths % 1000n).padStart(3, '0')}`);
  const percent = mark(page, 'percent').locator('input');
  if (await percent.count()) await percent.fill(`${thousandths / 10n},${thousandths % 10n}`);
}

async function checkLabels(page: Page, expected = true) {
  await button(page, 'Tarkista lähetys').click();
  await expect(feedback(page)).toHaveAttribute('data-ok', String(expected));
  if (expected) {
    await expect(scene(page)).toHaveCount(1);
    await expect(scene(page)).toHaveAttribute('data-decimal-workbench', 'solved');
  }
}

test.describe('Tarkkuusaseman yhteiset viestit', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
  });

  test('auditing a mismatched draft does not award it, and recovery starts guided', async ({ page }) => {
    await open(page, 'M-RATREP-FRAC-DEC', 7);
    expect((await shot(page)).family).toBe('repair-linked-labels');
    await expect(form(page).locator('[data-given="true"]')).toHaveCount(1);
    await checkLabels(page, false);
    await expect(feedback(page)).toContainText('Tarkista');
    await button(page, 'Näytä ja selitä').click();
    await expect(feedback(page)).toContainText('1/5 = 0,20');
    await button(page, 'Uusi yhteinen kokeilu').click();
    expect((await shot(page)).phase).toBe('guided');
    await setMarks(page, await givenRatio(page));
    await checkLabels(page);
    expect((await shot(page)).progress.checked).toBe(false);
    expect((await saved(page)).events).toHaveLength(0);
  });

  test('the lighthouse requires all three labels and the target island’s own whole', async ({ page }) => {
    await open(page, 'M-RATREP-01', 7, true);
    for (let i = 0; i < 2; i++) {
      await setMarks(page, await givenRatio(page));
      await checkLabels(page);
      if (i === 0) {
        expect((await saved(page)).events).toHaveLength(0);
        await button(page, 'Toinen yhteinen kokeilu').click();
      }
    }
    expect((await shot(page)).progress).toMatchObject({ helped: true, checked: false });
    expect((await saved(page)).events).toEqual([expect.objectContaining({ node: 'M-RATREP-01', assisted: true })]);
    await button(page, 'Kokeilen nyt itse').click();
    const families = new Set<string>();
    for (let i = 0; i < 3; i++) {
      families.add((await shot(page)).family);
      await expect(form(page).locator('[data-rational-format]')).toHaveCount(3);
      await setMarks(page, await givenRatio(page));
      await checkLabels(page);
      if (i < 2) await button(page, 'Seuraava kokeilu').click();
    }
    expect(families).toEqual(new Set(['repair-linked-labels', 'build-linked-labels']));
    await button(page, 'Kokeile uudessa tilanteessa').click();
    expect((await shot(page)).phase).toBe('transfer');
    const [part, whole] = await givenRatio(page);
    expect(part > whole).toBe(true);
    await expect(scene(page)).toContainText(`${2n * part} m / ${2n * whole} m`);
    await setMarks(page, [part, 2n * whole]);
    await checkLabels(page, false);
    expect((await shot(page)).progress.checked).toBe(false);
    await button(page, 'Uusi kokeilu').click();
    expect((await shot(page)).phase).toBe('transfer');
    await setMarks(page, await givenRatio(page), 3n);
    await checkLabels(page);
    await expect(scene(page)).toContainText('majakkamerkki syttyi');
    expect((await shot(page)).progress.checked).toBe(true);
    expect((await saved(page)).attempts.every((row: { node: string }) => row.node === 'M-RATREP-01')).toBe(true);
    expect((await saved(page)).events).toHaveLength(1);
  });

  for (const [label, viewport] of [
    ['desktop', { width: 1366, height: 768 }],
    ['tablet', { width: 768, height: 1024 }],
  ] as const) {
    test(`both families keep all reference values and editable labels visible on ${label}`, async ({ page }, testInfo) => {
      test.setTimeout(60_000);
      await page.setViewportSize(viewport);
      for (const id of ids) {
        const families = new Set<string>();
        for (const seed of [1, 7]) {
          await open(page, id, seed);
          families.add((await shot(page)).family);
          await page.evaluate(() => window.scrollTo(0, 0));
          const bounds = await page.evaluate(() => {
            const essentials = [...document.querySelectorAll('[data-decimal-workbench], [data-rational-link-form] input, [data-trusted-label], [data-rational-link-form] button')]
              .map(node => node.getBoundingClientRect());
            return { x: Math.min(...essentials.map(r => r.left)), right: Math.max(...essentials.map(r => r.right)),
              y: Math.min(...essentials.map(r => r.top)), bottom: Math.max(...essentials.map(r => r.bottom)),
              scrollWidth: document.documentElement.scrollWidth };
          });
          const info = `${id} · ${seed} · ${JSON.stringify(bounds)}`;
          expect(bounds.x, info).toBeGreaterThanOrEqual(0);
          expect(bounds.right, info).toBeLessThanOrEqual(viewport.width);
          expect(bounds.scrollWidth, info).toBeLessThanOrEqual(viewport.width);
          expect(bounds.y, info).toBeGreaterThanOrEqual(0);
          expect(bounds.bottom, info).toBeLessThanOrEqual(viewport.height);
        }
        expect(families.size, id).toBe(2);
      }
      const path = testInfo.outputPath(`rational-links-${label}.png`);
      await page.screenshot({ path });
      await testInfo.attach(`rational-links-${label}`, { path, contentType: 'image/png' });
    });
  }
});
