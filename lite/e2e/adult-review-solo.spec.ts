import { expect, test, type Page } from '@playwright/test';
import { rng } from '../src/engine/rng';
import { solution } from '../src/engine/check';
import { withoutAdultReview } from '../src/content/adult-review';
import { inquiryIslandsSpecs } from '../src/content/inquiry-islands';
import type { InquiryIslandsResponse, InquiryIslandsTask } from '../src/content/models/inquiry-islands';

// Default solo play: adult review is off, so a learner alone can finish every task.
test.use({ reducedMotion: 'reduce', launchOptions: { args: ['--enable-unsafe-swiftshader'] } });
test.beforeEach(() => { test.setTimeout(120000); });
const btn = (p: Page, name: string) => p.getByRole('button', { name, exact: true });
const state = (p: Page) => p.evaluate(() => JSON.parse(window.render_game_to_text!()));
type Attempt = { node: string; phase: string; ok: boolean; help: string[]; assessor?: string; unreviewed?: boolean };
const ledger = (p: Page): Promise<{ attempts: Attempt[] }> => p.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[]}'));

test('pure explanation becomes a guided self-check that lets the story continue', async ({ page }) => {
  await page.goto('./?qa=1&seed=7#saaristo/M-REP-03');
  await btn(page, 'Kokeilen itse').click();
  await expect(page.locator('[data-explanation-board]')).toBeVisible();
  for (let round = 0; round < 2; round++) {
    await expect(page.locator('[data-explanation-adult]')).toHaveCount(0);
    await expect(page.locator('[data-self-explanation-compare]')).toBeHidden();
    await btn(page, 'Olen selittänyt').click();
    await expect(page.locator('[data-explanation-model]')).toBeVisible();
    await page.locator('[data-self-explanation-compare] input[type=checkbox]').first().check();
    await btn(page, 'Jatka retkeä').click();
    await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', 'true');
    if (round === 0) await btn(page, 'Toinen yhteinen kokeilu').click();
  }
  await expect(btn(page, 'Eteenpäin')).toBeVisible();
  const attempts = (await ledger(page)).attempts.filter(a => a.node === 'M-REP-03');
  expect(attempts).toHaveLength(2);
  // Practice only: guided, unreviewed, never adult-observed or independent.
  for (const a of attempts) expect(a).toMatchObject({ phase: 'guided', ok: true, unreviewed: true });
  expect(attempts.some(a => a.assessor)).toBe(false);
  expect((await state(page)).progress).toMatchObject({ helped: true, checked: false });
});

test('an attached adult review is left out and the checked part decides', async ({ page }) => {
  await page.goto('./?qa=1&full=1&seed=1#saaristo/SCI-ENV-OBS-01');
  await btn(page, 'Kokeilen itse').press('Enter');
  await expect(page.locator('[data-inquiry-workshop]')).toBeVisible();
  const current = await state(page), spec = inquiryIslandsSpecs.find(s => s.id === current.node)!;
  const raw = spec.item(rng(current.seed), current.phase).task as InquiryIslandsTask;
  expect(raw.review).toBeDefined();
  const task = withoutAdultReview(raw), answer = solution(task) as InquiryIslandsResponse;
  if (answer.mode !== 'observe') throw Error('observe task expected');
  for (const id of answer.description) await page.locator(`[data-inquiry-feature="${id}"]`).press('Enter');
  if (answer.uncertainCause) await page.getByLabel('Tekijä tai syy ei näy tästä kuvasta.', { exact: true }).check();
  await expect(btn(page, 'Siirry omaan selitykseen')).toHaveCount(0);
  await btn(page, 'Tarkista oma tutkimus').press('Enter');
  await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', 'true');
  await expect(page.locator('[data-explanation-adult]')).toHaveCount(0);
  const last = (await ledger(page)).attempts.at(-1)!;
  expect(last).toMatchObject({ node: 'SCI-ENV-OBS-01', ok: true, unreviewed: true });
  expect(last.assessor).toBeUndefined();
});

test('the adult can switch review on from the adult dialog', async ({ page }) => {
  await page.goto('./?qa=1&full=1&seed=1#saaristo/SCI-ENV-OBS-01');
  await page.getByRole('button', { name: /aikuiselle/i }).first().click();
  await page.getByText('Aikuisen arvio omista selityksistä').click();
  const toggle = page.locator('[data-adult-review-toggle]');
  await expect(toggle).not.toBeChecked();
  await toggle.check();
  expect(await page.evaluate(() => localStorage.getItem('sammakko-saaristo-adult-review'))).toBe('on');
  await toggle.uncheck();
  expect(await page.evaluate(() => localStorage.getItem('sammakko-saaristo-adult-review'))).toBeNull();
});
