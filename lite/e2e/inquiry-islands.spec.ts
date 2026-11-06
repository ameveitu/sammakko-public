import { expect, test, type Page } from '@playwright/test';
import { rng } from '../src/engine/rng';
import { solution } from '../src/engine/check';
import { inquiryIslandsSpecs } from '../src/content/inquiry-islands';
import type { InquiryIslandsResponse, InquiryIslandsTask } from '../src/content/models/inquiry-islands';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });

// The browser driver replays the engine's reference answer through the visible controls only.
// Unit tests check that answer and every generated wrong answer independently of this UI.
test.use({ reducedMotion: 'reduce', launchOptions: { args: ['--enable-unsafe-swiftshader'] } });
const ids = inquiryIslandsSpecs.map(s => s.id);
const btn = (p: Page, name: string | RegExp) => p.getByRole('button', { name, exact: typeof name === 'string' });
const field = (p: Page, name: string) => p.getByLabel(name, { exact: true });
const workshop = (p: Page) => p.locator('[data-inquiry-workshop]');
const state = (p: Page) => p.evaluate(() => JSON.parse(window.render_game_to_text!()));
const ledger = (p: Page) => p.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[],"events":[]}'));
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
async function fallback(p: Page) {
  await p.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (id, ...rest) { return /^webgl/.test(String(id)) ? null : Reflect.apply(original, this, [id, ...rest]); } as typeof original; });
}
async function open(p: Page, id: string, seed = 1) {
  await p.goto(`./?qa=1&full=1&seed=${seed}#saaristo/${id}`); await btn(p, 'Kokeilen itse').press('Enter'); await expect(workshop(p)).toBeVisible();
}
async function activeTask(p: Page): Promise<InquiryIslandsTask> {
  const current = await state(p), spec = inquiryIslandsSpecs.find(s => s.id === current.node)!;
  return spec.item(rng(current.seed), current.phase).task as InquiryIslandsTask;
}
async function fit(p: Page): Promise<string[]> {
  return p.evaluate(() => {
    const root = document.querySelector('[data-inquiry-workshop]')!;
    return [...root.querySelectorAll<HTMLElement>('button,select,input:not([type=checkbox]),textarea,label:has(input[type=checkbox])')].filter(el => el.checkVisibility()).flatMap(el => {
      const r = el.getBoundingClientRect(), name = el.getAttribute('aria-label') ?? el.textContent?.slice(0, 45) ?? el.tagName, errors: string[] = [];
      if (r.x < -1 || r.right > innerWidth + 1) errors.push(`${name} outside ${Math.round(r.x)}..${Math.round(r.right)}/${innerWidth}`);
      if (r.height < 43 || r.width < 43) errors.push(`${name} target ${Math.round(r.width)}x${Math.round(r.height)}`);
      return errors;
    });
  });
}
type Plan = Extract<InquiryIslandsResponse, { mode: 'plan' }>['plan'];
async function fillPlan(p: Page, task: Extract<InquiryIslandsTask, { mode: 'plan' | 'experiment' }>, plan: Plan) {
  const s = task.setup, root = p.locator('[data-inquiry-plan]');
  await field(p, 'Muutettava tekijä').selectOption(plan.variable); await field(p, 'Mitattava tulos').selectOption(plan.outcome);
  for (const [t, trial] of (['A', 'B'] as const).entries()) {
    const selects = root.locator(`select[aria-label^="Koe ${trial}: "]`);
    for (const [i, v] of s.variables.entries()) {
      const value = (plan.configurations[t] as unknown as Record<string, unknown>)[v];
      await selects.nth(i).selectOption({ value: String((s.values[v] ?? []).findIndex(o => o === value)) });
    }
  }
  const boxes = root.locator('input[type=checkbox]');
  for (const [i, v] of s.controlVariables.entries()) await boxes.nth(i).setChecked(plan.controls.includes(v));
  for (const step of plan.sequence) await root.locator(`[data-inquiry-step="${step}"]`).press('Enter');
  await field(p, 'Toistoja kummallekin kokeelle').selectOption(String(plan.repeats));
}
type ModelAnswer = Extract<InquiryIslandsResponse, { mode: 'model' }>;
type Built = Extract<ModelAnswer['actions'][number], { type: 'draft' }>['model'];
async function fillModel(p: Page, model: Built, stones: Set<string>, revising: boolean) {
  if (model.kind === 'terrain') {
    for (const c of model.terrain.cells) {
      const sel = field(p, `Ruudun ${c.id} korkeus`); if (await sel.count()) await sel.selectOption(String(c.height));
      if (revising && c.blocked !== stones.has(c.id)) { await btn(p, `Kivi ruutuun ${c.id}`).press('Enter'); if (c.blocked) stones.add(c.id); else stones.delete(c.id); }
    }
  } else if (model.kind === 'channel-map') {
    const names = { open: 'luukku auki', closed: 'luukku kiinni', new: 'padon jälkeen' } as const;
    for (const l of model.links) await field(p, `Kouru ${l.from} (${names[l.when]}) vie`).selectOption(l.to);
    for (const b of model.barriers) await p.getByLabel(`Pato kohdassa ${b}`, { exact: true }).check();
  } else {
    await field(p, 'Mallin sääntö').selectOption(model.rule);
    for (const r of model.rays) await field(p, `Tapauksen ${r.caseId} varjon kärki`).selectOption(String(r.groundX));
  }
  for (const a of model.annotations) { await field(p, `Havainto ${a.caseId}: allas`).selectOption(a.calm ? 'yes' : 'no'); await field(p, `Havainto ${a.caseId}: putous`).selectOption(a.feed ? 'yes' : 'no'); }
}
/** Drive the visible controls for one item. `wrong` widens the conclusion beyond the evidence. */
async function prepare(p: Page, wrong = false, audit?: () => Promise<void>) {
  const task = await activeTask(p), answer = solution(task) as InquiryIslandsResponse; await audit?.();
  if (task.mode === 'observe' && answer.mode === 'observe') {
    for (const id of answer.description) await p.locator(`[data-inquiry-feature="${id}"]`).press('Enter');
    if (answer.uncertainCause && !wrong) await p.getByLabel('Tekijä tai syy ei näy tästä kuvasta.', { exact: true }).check();
  } else if (task.mode === 'compare' && answer.mode === 'compare') {
    if (answer.property) {
      await field(p, 'Vertailtava ominaisuus').selectOption(answer.property);
      await field(p, `Näytteen ${task.pair[0]} arvo`).fill(answer.first); await field(p, `Näytteen ${task.pair[1]} arvo`).fill(answer.second);
      const relation = wrong ? ['less', 'more', 'equal', 'same', 'different'].find(r => r !== answer.relation)! : answer.relation;
      await field(p, 'Vertailun tulos').selectOption(relation);
    }
    if (answer.rule) {
      await field(p, 'Lajittelusääntö').selectOption(String(task.rules.findIndex(r => JSON.stringify(r) === JSON.stringify(answer.rule))));
      for (const m of answer.memberships) await field(p, `Näytteen ${m.id} kori`).selectOption(String(m.group));
      await field(p, 'Rajatapauksen U kori').selectOption(String(answer.boundaryGroup)); await field(p, 'Mikä ominaisuus ratkaisi U:n korin?').selectOption(answer.boundaryReason);
    }
  } else if (task.mode === 'question' && answer.mode === 'question') {
    await field(p, 'Mitä muutetaan?').selectOption(answer.variable); await field(p, 'Mitä havaitaan?').selectOption(answer.outcome);
    await field(p, 'Voiko tähän vastata tämän pöydän välineillä?').selectOption(answer.investigable !== wrong ? 'yes' : 'no');
  } else if (task.mode === 'plan' && answer.mode === 'plan') {
    await fillPlan(p, task, answer.plan);
  } else if (task.mode === 'experiment' && answer.mode === 'experiment') {
    const lock = answer.actions.find(a => a.type === 'lock')!; if (lock.type !== 'lock') throw new Error('lock');
    if (task.activity !== 'guided') await fillPlan(p, task, lock.plan);
    await field(p, 'Ennuste kokeelle B').selectOption(lock.forecast); await audit?.();
    await btn(p, 'Lukitse suunnitelma ja ennuste').press('Enter'); await expect(p.locator('[data-inquiry-run]')).toBeVisible();
    const words = { place: 'Aseta kohde', start: 'Käynnistä', observe: 'Havainnoi', record: 'Kirjaa', reset: 'Uusi toisto' } as const;
    for (const a of answer.actions.slice(answer.actions.indexOf(lock) + 1)) {
      if (a.type === 'advance') await btn(p, new RegExp(`^${a.trial}: Anna ajan kulua`)).press('Enter');
      else if (a.type in words) await btn(p, `${(a as { trial: string }).trial}: ${words[a.type as keyof typeof words]}`).press('Enter');
      else throw new Error(`unexpected experiment action ${a.type}`);
    }
    await audit?.();
    await field(p, 'Mitä kokeesta voi päätellä?').selectOption(answer.result); await field(p, 'Ennusteeni').selectOption(answer.reflection);
    await field(p, 'Päätelmän rajaus').selectOption(wrong ? 'everywhere' : answer.scope);
  } else if (task.mode === 'model' && answer.mode === 'model') {
    const stones = new Set<string>();
    for (const a of answer.actions) {
      if (a.type === 'draft') await fillModel(p, a.model, stones, false);
      else if (a.type === 'lock-model') { await btn(p, 'Lukitse malli ja ennuste').press('Enter'); await expect(btn(p, 'Lukitse malli ja ennuste')).toBeHidden(); await audit?.(); }
      else if (a.type === 'test-model') await btn(p, `Testaa mallia: ${a.route}`).press('Enter');
      else if (a.type === 'reveal-evidence') { await btn(p, 'Avaa uusi havainto').press('Enter'); await expect(p.locator('[data-inquiry-evidence]')).toContainText(task.newObservation!.label); await audit?.(); }
      else if (a.type === 'revise') { await fillModel(p, a.model, stones, true); await btn(p, 'Tallenna korjattu malli').press('Enter'); await expect(p.getByRole('status').filter({ hasText: 'Korjaus tallennettu' })).toBeVisible(); }
      else throw new Error(`unexpected model action ${a.type}`);
    }
    for (const c of answer.correspondences) await field(p, `Mallissa: ${task.correspondences.find(x => x.id === c.id)!.real}`).selectOption(c.model);
    await field(p, 'Mitä malli jättää pois?').selectOption(answer.missing); await field(p, 'Mikä mallissa ohjaa tulosta?').selectOption(answer.cause);
    await field(p, 'Mallin rajaus').selectOption(wrong ? 'everywhere' : answer.scope);
  } else if (task.mode === 'evidence' && answer.mode === 'evidence') {
    for (const a of answer.actions) if (a.type === 'recheck') { await btn(p, `Mittaa uudelleen ${a.row}`).press('Enter'); await expect(workshop(p)).toContainText(`Uudelleenmittaus ${a.row}:`); }
    for (const id of answer.support) await p.getByLabel(new RegExp(`^Käytän riviä ${esc(id)} \\(`)).check();
    await field(p, 'Oma johtopäätös').selectOption(answer.claim);
    if (task.skill === 'evaluate') { await field(p, 'Tarkistettu arvo').fill(answer.correction); await field(p, 'Tarkistetun arvon yksikkö').selectOption(answer.correctionUnit); await field(p, 'Alkuperäinen arvo').selectOption(String(answer.retain)); }
    await field(p, 'Johtopäätöksen rajaus').selectOption(wrong ? 'everywhere' : answer.scope);
  } else throw new Error(`mode mismatch ${task.mode}`);
  await audit?.();
  return task;
}
async function adult(p: Page, helped = false, written = false) {
  const before = (await ledger(p)).attempts.length;
  if (written) { await btn(p, 'Kirjoitan tähän').press('Enter'); await field(p, 'Oma selitykseni').fill('INQUIRY_PRIVATE_581. Kerron, mitä havaitsin, ja rajaan päätelmän tähän tutkimukseen.'); await btn(p, 'Olen kirjoittanut selitykseni').press('Enter'); }
  else await btn(p, 'Olen kertonut selitykseni').press('Enter');
  await btn(p, 'Vahvista havainto').press('Enter'); expect((await ledger(p)).attempts.length).toBe(before);
  // Synthetic observation fixture. No claim about a real learner's explanation.
  for (const select of await p.locator('[data-explanation-adult] select').all()) await select.selectOption(await select.getAttribute('aria-label') === 'Saiko oppija apua?' ? helped ? 'helped' : 'none' : 'met');
  await p.locator('[data-explanation-adult] input[type=checkbox]').check(); await btn(p, 'Vahvista havainto').press('Enter');
}
async function submit(p: Page, task: InquiryIslandsTask, ok = true, help = false, written = false) {
  await btn(p, task.review ? 'Siirry omaan selitykseen' : 'Tarkista oma tutkimus').press('Enter'); if (task.review) await adult(p, help, written);
  await expect(p.locator('.exp-feedback')).toHaveAttribute('data-ok', String(ok));
}

for (const viewport of [{ width: 1366, height: 768 }, { width: 768, height: 1024 }]) test(`all sixteen inquiry workshops fit ${viewport.width}`, async ({ page }, info) => {
  test.setTimeout(420000); await page.setViewportSize(viewport); await fallback(page); const violations: string[] = [];
  for (const id of ids) {
    await page.goto('./'); await page.evaluate(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on'))); await open(page, id, 0);
    const audit = async () => { violations.push(...(await fit(page)).map(v => `${id} ${v}`)); };
    const task = await prepare(page, false, audit); await page.screenshot({ animations: 'disabled', fullPage: true, path: info.outputPath(`${id}-${viewport.width}.png`) }); await submit(page, task);
  }
  expect([...new Set(violations)]).toEqual([]);
});
test('all sixteen own three fresh situations and a changed-context transfer', async ({ page }) => {
  test.setTimeout(600000); await fallback(page);
  for (const id of ids) {
    await page.goto('./'); await page.evaluate(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on'))); await open(page, id, 1);
    for (let n = 0; n < 3; n++) { const task = await prepare(page); await submit(page, task); if (!n) expect((await ledger(page)).events.filter((e: { node: string }) => e.node === id)).toHaveLength(0); if (n < 2) await btn(page, 'Seuraava kokeilu').press('Enter'); }
    await btn(page, 'Kokeile uudessa tilanteessa').press('Enter'); const task = await prepare(page); await submit(page, task);
    const records = await ledger(page), attempts = records.attempts.filter((a: { node: string }) => a.node === id);
    expect(attempts).toHaveLength(4); expect(new Set(attempts.map((a: { itemKey: string }) => a.itemKey)).size).toBe(4);
    expect((await state(page)).progress.checked).toBe(true); expect(records.events.filter((e: { node: string }) => e.node === id)).toHaveLength(1);
  }
});
test('actual WebGL lanes and models follow the learner actions', async ({ page }, info) => {
  test.setTimeout(240000); const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  for (const id of ['SCI-ENV-EXP-01', 'ENV-PHY-CAUSE-MOTION-01', 'SCI-ENV-MODEL-02', 'SCI-ENV-MODEL-REVISE-01', 'SCI-ENV-MODEL-CREATE-01']) {
    await open(page, id, 2); await expect.poll(async () => (await state(page)).renderer, { timeout: 15000 }).toBe('webgl');
    const task = await prepare(page), current = await state(page), snap = JSON.stringify({ model: current.model, stage: current.stage });
    expect(snap).toContain('inquiry-islands'); expect(snap).toContain('"locked":true');
    for (const word of ['solution', 'rubric', 'forecast', 'prediction', 'probe']) expect(snap).not.toContain(`"${word}"`);
    await page.screenshot({ animations: 'disabled', path: info.outputPath(`${id}-webgl.png`) }); await submit(page, task);
  }
  expect(errors).toEqual([]);
});
test('wrong comparison then guided recovery, and a written adult explanation stays private', async ({ page }, info) => {
  test.setTimeout(180000); const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await open(page, 'SCI-ENV-COMPARE-02', 1); let task = await prepare(page, true); await submit(page, task, false);
  await btn(page, 'Näytä ja selitä').press('Enter'); await btn(page, 'Uusi yhteinen kokeilu').press('Enter'); task = await prepare(page); await submit(page, task); expect((await state(page)).progress.checked).toBe(false);
  await open(page, 'SCI-ENV-MODEL-02', 1); task = await prepare(page, true); await submit(page, task, false, false);
  await open(page, 'SCI-ENV-MODEL-02', 3); task = await prepare(page); await submit(page, task, true, true, true);
  const records = await ledger(page), own = records.attempts.at(-1); expect(own.assessor).toBe('adult'); expect(own.help).toContain('support');
  expect(JSON.stringify(records)).not.toContain('INQUIRY_PRIVATE_581'); expect(JSON.stringify(await state(page))).not.toContain('INQUIRY_PRIVATE_581');
  await page.screenshot({ animations: 'disabled', path: info.outputPath('inquiry-adult.png') }); expect(errors).toEqual([]);
});
test('adult review keeps the locked own work readable at both sizes', async ({ page }, info) => {
  test.setTimeout(120000); await fallback(page);
  for (const viewport of [{ width: 1366, height: 768 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport); await page.goto('./'); await open(page, 'SCI-ENV-MODEL-02', 1); await prepare(page); await btn(page, 'Siirry omaan selitykseen').press('Enter');
    await btn(page, 'Näytä oma tutkimus').press('Enter'); await expect(field(page, 'Mallin rajaus')).toBeDisabled(); await expect(p(page)).toBeVisible();
    await btn(page, 'Palaa omaan selitykseen').press('Enter'); await btn(page, 'Olen kertonut selitykseni').press('Enter');
    await page.screenshot({ animations: 'disabled', path: info.outputPath(`inquiry-adult-${viewport.width}.png`) }); expect(await fit(page)).toEqual([]);
  }
  function p(pg: Page) { return pg.locator('[data-inquiry-evidence]'); }
});
