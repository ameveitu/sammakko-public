import { expect, test } from '@playwright/test';
import { workPowerSpecs } from '../src/content/work-power';
import { itemIdentity } from '../src/engine/item-identity';
import { rng } from '../src/engine/rng';

test('another seed for an already practised item is skipped before independent assessment', async ({ page }) => {
  const spec = workPowerSpecs.find(s => s.id === 'PHY79-POWER-CALC')!;
  const prior = spec.item(rng(0), 'guided'), key = itemIdentity(prior);
  const duplicate = Array.from({ length: 159 }, (_, i) => i + 1).find(seed => itemIdentity(spec.item(rng(seed), 'independent')) === key);
  expect(duplicate).toBeDefined();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(({ id, rev, tag, itemKey }) => {
    HTMLCanvasElement.prototype.getContext = function () { return null; };
    if (!localStorage.getItem('sammakko-journey-3')) localStorage.setItem('sammakko-journey-3', JSON.stringify({
      v: 3, events: [], effects: [], attempts: [{ node: id, rev, tag, itemKey, seed: 0, phase: 'guided', ok: true, at: 1 }],
    }));
  }, { id: spec.id, rev: spec.rev, tag: prior.tag, itemKey: key });
  await page.goto(`./?qa=1&seed=${duplicate}#saaristo/${spec.id}`);
  await page.getByRole('button', { name: 'Kokeilen itse', exact: true }).click();
  const state = await page.evaluate(() => JSON.parse(window.render_game_to_text!()));
  expect(state.seed).not.toBe(duplicate);
  const current = spec.item(rng(state.seed), 'independent');
  expect(itemIdentity(current)).not.toBe(key);
  const lift = state.model.lifts[0];
  await page.keyboard.type(String(lift.forceN * lift.distanceM / lift.durationS));
  await page.keyboard.press('Enter');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3')!));
  expect(saved.attempts).toHaveLength(2);
  expect(saved.attempts[1]).toMatchObject({ ok: true, phase: 'independent', itemKey: itemIdentity(current) });
  expect(saved.attempts[1].replay).toBeUndefined();
  expect(saved.events).toEqual([]);
});
