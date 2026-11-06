import { expect, test, type Page } from '@playwright/test';

const journeyKey = 'sammakko-journey-3';
const legacyKey = 'sammakko-lite-2';
const previousSave = JSON.stringify({
  v: 2, graph: 'legacy-graph', rev: 'legacy-revision', created: 123, world: 'ranta', quietUntil: 0,
  clockOffset: 0, tester: false, attempts: [], events: [{ type: 'note', at: 123, text: 'Edellinen retki' }],
});
type Snapshot = {
  mode: 'home' | 'intro' | 'task' | 'result';
  node: string | null;
  phase: 'guided' | 'independent' | 'transfer' | 'retrieval';
  family: string;
  seed: number;
  progress: { checked: boolean; helped: boolean; streak: number };
  model: {
    segmentsCm?: number[];
    metersPerCm?: number;
    mode?: 'size' | 'distance' | 'day' | 'seasons';
    rotation?: 0 | 180;
    orbit?: 'june' | 'december';
    partitions?: { denominator: number; pieces: { id: string }[] }[];
  };
};

const snapshot = (page: Page): Promise<Snapshot> => page.evaluate(() => {
  const world = window as Window & { render_game_to_text?: () => string };
  return JSON.parse(world.render_game_to_text!());
});
const save = (page: Page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null'), journeyKey);
const task = (page: Page) => page.locator('.exp-task');
const choice = (page: Page, pattern: RegExp) => task(page).locator('button.opt').filter({ hasText: pattern });
const numberAnswer = async (page: Page, value: number) => {
  for (const digit of String(value)) await task(page).getByRole('button', { name: digit, exact: true }).click();
  await task(page).getByRole('button', { name: 'OK', exact: true }).click();
};
const scaleAnswer = async (page: Page) => {
  const { model } = await snapshot(page);
  return model.segmentsCm!.reduce((a, b) => a + b, 0) * model.metersPerCm!;
};
test.describe('Saaristo expedition', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    // The exact workbench remains usable on devices without WebGL. GPU stage geometry has its own tests.
    await page.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...options: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(getContext, this, [type, ...options]);
      } as typeof getContext;
    });
  });

  test('guided story resolution, fresh independent retry and modal keyboard isolation preserve v2', async ({ page }) => {
    await page.goto('./?qa=1&seed=1#saaristo/M-SCALE-03');
    await page.getByRole('heading', { name: 'Matka kartasta rantaan' }).waitFor();
    await page.evaluate(({ key, contents }) => localStorage.setItem(key, contents), { key: legacyKey, contents: previousSave });
    await page.getByRole('button', { name: 'Tutkitaan yhdessä', exact: true }).click();
    await numberAnswer(page, await scaleAnswer(page));
    await page.getByRole('button', { name: 'Toinen yhteinen kokeilu' }).click();
    await numberAnswer(page, await scaleAnswer(page));
    expect((await snapshot(page)).progress).toMatchObject({ helped: true, checked: false });
    expect((await save(page)).events).toEqual([expect.objectContaining({ node: 'M-SCALE-03', assisted: true })]);

    const resolvedSave = await save(page);
    await expect(page.getByRole('dialog', { name: 'Retkimuisto' })).toBeVisible();
    await page.getByRole('button', { name: 'Takaisin tutkimukseen' }).click();
    expect(await save(page)).toEqual(resolvedSave);
    await page.getByRole('button', { name: 'Kokeilen nyt itse' }).click();
    const first = await snapshot(page);
    await task(page).getByRole('button', { name: '1', exact: true }).click();
    await page.getByRole('button', { name: 'Retkikartta', exact: true }).click();
    await page.getByRole('searchbox').fill('690');
    await page.getByRole('searchbox').press('Enter');
    expect((await save(page)).attempts).toHaveLength(2);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await task(page).getByRole('button', { name: 'OK', exact: true }).click();
    await expect(task(page).getByRole('button', { name: 'OK', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Uusi kokeilu', exact: true }).click();
    expect(await snapshot(page)).toMatchObject({ phase: 'independent' });
    expect((await snapshot(page)).seed).not.toBe(first.seed);
    await numberAnswer(page, await scaleAnswer(page));
    expect((await save(page)).attempts.map((row: { phase: string; ok: boolean }) => [row.phase, row.ok])).toEqual([
      ['guided', true], ['guided', true], ['independent', false], ['independent', true],
    ]);
    expect((await save(page)).events).toHaveLength(1);
    expect(await page.evaluate((key) => localStorage.getItem(key), legacyKey)).toBe(previousSave);

    await page.getByRole('link', { name: 'Palaa aihevalintaan' }).click();
    await expect(page.locator('.expedition')).toHaveCount(0);
    expect(await page.evaluate(() => document.body.classList.contains('on-expedition'))).toBe(false);
    expect(await page.evaluate(() => (window as Window & { render_game_to_text?: () => string }).render_game_to_text?.().includes('"screen":"saaristo"') ?? false)).toBe(false);
    expect(await page.evaluate((key) => localStorage.getItem(key), legacyKey)).toBe(previousSave);
  });

  // ENV-PHY-SPACE-01 is now an own-explanation task (exp690 v2); e2e/integration-revisions.spec.ts covers its flow.

  test('cake cuts both plates into sixths, moves them and counts seven pieces', async ({ page }) => {
    await page.goto('./?qa=1&seed=1#saaristo/M-FRAC-13');
    await page.getByRole('button', { name: 'Tutkitaan yhdessä', exact: true }).click();
    await expect(task(page).locator('[data-cake-option]').first()).toBeHidden();
    await task(page).getByRole('button', { name: '✂️ Leikkaa palat yhtä suuriksi' }).click();
    await expect(task(page).getByRole('status')).toContainText('kuudesosia');
    await task(page).getByRole('button', { name: '🍽️ Siirrä palat lautasille' }).click();
    await expect(task(page).getByText('Kuinka monta kuudesosaa on yhteensä?')).toBeVisible();
    expect(await save(page)).toBeNull();
    await task(page).locator('[data-cake-option="7"]').click();

    await expect(task(page)).toContainText('1/2 + 2/3 = 3/6 + 4/6 = 7/6 = 1 1/6');
    await expect(task(page).locator('[data-piece-id]')).toHaveCount(7);
    const { partitions } = (await snapshot(page)).model;
    expect(partitions?.map(({ denominator, pieces }) => [denominator, pieces.length])).toEqual([[6, 3], [6, 4]]);
    await expect(task(page).locator('[data-cake-option="6"]')).toBeDisabled();
    expect((await save(page)).attempts).toHaveLength(1);
  });

  test('a completed task offers a fresh recall only after the 20-hour interval', async ({ page }) => {
    const started = new Date('2026-11-05T08:00:00Z');
    await page.clock.setFixedTime(started);
    await page.goto('./?qa=1&seed=1#saaristo/M-SCALE-03');
    await page.getByRole('button', { name: 'Kokeilen itse', exact: true }).click();
    for (let i = 0; i < 3; i++) {
      await numberAnswer(page, await scaleAnswer(page));
      if (i < 2) await page.getByRole('button', { name: 'Seuraava kokeilu', exact: true }).click();
    }
    await page.getByRole('button', { name: 'Kokeile uudessa tilanteessa', exact: true }).click();
    await numberAnswer(page, await scaleAnswer(page));
    expect((await snapshot(page)).progress.checked).toBe(true);
    const first = await save(page);

    await page.clock.setFixedTime(new Date(started.getTime() + 20 * 60 * 60 * 1000 - 1));
    await page.reload();
    await page.getByRole('button', { name: 'Kokeilen itse', exact: true }).waitFor();
    await expect(page.getByRole('button', { name: 'Kokeilen, mitä muistan', exact: true })).toHaveCount(0);

    await page.clock.setFixedTime(new Date(started.getTime() + 20 * 60 * 60 * 1000));
    await page.reload();
    await page.getByRole('button', { name: 'Kokeilen, mitä muistan', exact: true }).click();
    const recall = await snapshot(page);
    expect(recall.phase).toBe('retrieval');
    expect(first.attempts.map((attempt: { seed: number }) => attempt.seed)).not.toContain(recall.seed);
    await numberAnswer(page, await scaleAnswer(page));
    await expect(page.locator('.exp-feedback')).toContainText('Muistit tämän myös tauon jälkeen');
    const after = await save(page);
    expect(after.attempts.at(-1)).toMatchObject({ phase: 'retrieval', ok: true, help: [] });
    expect(after.events).toEqual(first.events);
    expect(after.effects).toEqual(first.effects);
  });

  test('an unknown stop opens the map with no learner evidence', async ({ page }) => {
    await page.goto('./?qa=1&seed=1#saaristo/UNKNOWN-001');
    await expect(page.getByRole('dialog', { name: 'Retkikartta' }).getByRole('status')).toContainText('Tuntematon retki');
    expect(await snapshot(page)).toMatchObject({ mode: 'home', node: null });
    expect(await save(page)).toBeNull();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Laitteen asetus vähentää maiseman liikettä' })).toBeDisabled();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.getByRole('button', { name: 'Pysäytä maiseman liike' }).click();
    await expect(page.getByRole('button', { name: 'Jatka maiseman liikettä' })).toHaveAttribute('aria-pressed', 'true');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.getByRole('button', { name: 'Laitteen asetus vähentää maiseman liikettä' })).toBeDisabled();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.getByRole('button', { name: 'Jatka maiseman liikettä' })).toHaveAttribute('aria-pressed', 'true');
  });
});
