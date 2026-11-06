import { expect, test, type Page } from '@playwright/test';
import { rng } from '../src/engine/rng';
import { matterCyclesSpecs } from '../src/content/matter-cycles';
import type { MatterCyclesTask } from '../src/content/models/matter-cycles';
import { matterOracle } from '../tests/matter-cycles-fixtures';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });

test.use({ reducedMotion: 'reduce', launchOptions: { args: ['--enable-unsafe-swiftshader'] } });
const ids = matterCyclesSpecs.map(s => s.id);
const btn = (p: Page, name: string) => p.getByRole('button', { name, exact: true });
const field = (p: Page, name: string) => p.getByLabel(name, { exact: true });
const board = (p: Page) => p.locator('[data-cycle-workbench]');
const state = (p: Page) => p.evaluate(() => JSON.parse(window.render_game_to_text!()));
const ledger = (p: Page) => p.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[],"events":[]}'));
async function fallback(p: Page) {
  await p.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (id, ...rest) { return /^webgl/.test(String(id)) ? null : Reflect.apply(original, this, [id, ...rest]); } as typeof original; });
}
async function open(p: Page, id: string, seed = 1) {
  await p.goto(`./?qa=1&full=1&seed=${seed}#saaristo/${id}`); await btn(p, 'Kokeilen itse').press('Enter'); await expect(board(p)).toBeVisible();
}
async function activeTask(p: Page): Promise<MatterCyclesTask> {
  const current = await state(p), spec = matterCyclesSpecs.find(s => s.id === current.node)!;
  // Reconstruct only the public scientific givens. The oracle derives directions from their text
  // and computes stocks through its own BigInt incidence matrix, never the production solution.
  return spec.item(rng(current.seed), current.phase).task as MatterCyclesTask;
}
async function fit(p: Page): Promise<string[]> {
  return p.evaluate(() => {
    const root = document.querySelector('[data-cycle-workbench]')!;
    return [...root.querySelectorAll<HTMLElement>('button,select,input:not([type=checkbox]),svg,label:has(input[type=checkbox])')].filter(el => el.checkVisibility()).flatMap(el => {
      const r = el.getBoundingClientRect(), name = el.getAttribute('aria-label') ?? el.textContent?.slice(0, 45) ?? el.tagName, errors: string[] = [];
      if (r.x < -1 || r.right > innerWidth + 1 || r.top < -1 || r.bottom > innerHeight + 1) errors.push(`${name} outside ${Math.round(r.top)}..${Math.round(r.bottom)}/${innerHeight}`);
      if (el.tagName !== 'svg' && (r.height < 43 || r.width < 43)) errors.push(`${name} target ${Math.round(r.width)}x${Math.round(r.height)}`);
      return errors;
    });
  });
}
async function prepare(p: Page, wrong = false, audit?: () => Promise<void>) {
  const task = await activeTask(p), response = matterOracle(task); await audit?.();
  if (task.mode === 'conservation' && response.mode === task.mode) {
    await expect(board(p)).toContainText('Suljettu kammio');
    await expect(btn(p, 'Toteuta oma aineensiirto')).toBeHidden();
    await field(p, 'Ennustettu koko kammion massa milligrammoina').fill(String(response.predictedTotalMg! + (wrong ? 1 : 0)));
    await btn(p, 'Lukitse massaennuste').press('Enter'); await expect(field(p, 'Ennustettu koko kammion massa milligrammoina')).toBeDisabled(); await audit?.();
    const move = response.moves[0]!;
    await expect(board(p)).toContainText(task.operation.description);
    await field(p, 'Siirron lähtövarasto').selectOption(move.from); await field(p, 'Siirron tulovarasto').selectOption(move.to); await field(p, 'Oma siirrettävä massa milligrammoina').fill(String(move.amountMg)); await btn(p, 'Toteuta oma aineensiirto').press('Enter'); await audit?.();
    await btn(p, 'Kirjaa oma massatili').press('Enter');
    await field(p, 'Havaittu koko kammion massa milligrammoina').fill(String(response.totalMg)); await field(p, 'Vastaanottavan varaston massa milligrammoina').fill(String(response.targetMg)); await field(p, 'Onko energia tämän massakirjan ainetta?').selectOption('no'); await audit?.();
  } else if (task.mode === 'photosynthesis' && response.mode === task.mode) {
    for (const role of response.roles) { const card = task.cards.find(c => c.id === role.card)!; await expect(board(p)).toContainText(card.label); await expect(board(p)).toContainText(card.description); await field(p, `${role.card} tehtävä yhteyttämisessä`).selectOption(role.role!); }
    await expect(p.locator('[data-cycle-photo-picture=own]')).toBeVisible(); await audit?.(); await btn(p, 'Jatka hiilen jäljitykseen').press('Enter');
    await field(p, 'Hiilen lähtökortti').selectOption(response.trace[0]!); await field(p, 'Hiilen reitin eliö').selectOption(response.trace[1]!); await field(p, 'Hiilen tulokortti').selectOption(response.trace[2]!);
    await field(p, 'Valomallin orgaaniseen aineeseen siirtyvä hiili milligrammoina').fill(String(response.dayCarbonMg)); await field(p, 'Pimeän yhteyttämisen hiili milligrammoina').fill(String(response.darkPhotoCarbonMg));
    if (response.rejectedCard) await field(p, 'Korjattava ainekorin kortti').selectOption(response.rejectedCard);
    await expect(board(p)).not.toContainText('Havainto ·'); await audit?.(); await btn(p, 'Lukitse hiilireitti ja ennusteet').press('Enter'); await btn(p, 'Aja valo- ja pimeämalli').press('Enter');
    await expect(p.locator('[data-cycle-photo-picture=observation]')).toBeVisible(); await expect(field(p, 'Valomallin orgaaniseen aineeseen siirtyvä hiili milligrammoina')).toBeDisabled(); await audit?.();
  } else if (task.mode === 'reservoirs' && response.mode === task.mode) {
    for (const assignment of response.assignments) {
      await field(p, 'Tarkasteltava näytekortti').selectOption(assignment.card); const card = task.cards.find(c => c.id === assignment.card)!;
      await expect(p.locator('[data-cycle-card-given]')).toContainText(card.description); await expect(p.locator('[data-cycle-card-given]')).toContainText(`${card.carbonMg} mg C`);
      await field(p, `${assignment.card} hiilivarasto`).selectOption(assignment.reservoir ?? 'none'); await audit?.();
    }
    await btn(p, 'Katso oma sijoitustaulukko').press('Enter'); await audit?.();
    await field(p, 'Näytteiden hiilen kokonaismassa milligrammoina').fill(String(response.totalCarbonMg));
  } else if ((task.mode === 'water-path' || task.mode === 'carbon-network') && (response.mode === 'water-path' || response.mode === 'carbon-network')) {
    if (task.mode === 'carbon-network' && task.cards && response.mode === task.mode) {
      for (const assignment of response.assignments) { await field(p, 'Tarkasteltava näytekortti').selectOption(assignment.card); const card = task.cards.find(c => c.id === assignment.card)!; await expect(p.locator('[data-cycle-card-given]')).toContainText(card.description); await field(p, `${assignment.card} hiilivarasto`).selectOption(assignment.reservoir ?? 'none'); await audit?.(); }
      await btn(p, 'Katso oma sijoitustaulukko').press('Enter'); await audit?.();
      await btn(p, 'Jatka omaan hiilitiliin').press('Enter');
    }
    for (const edge of response.edges) {
      await field(p, 'Tarkasteltava prosessi').selectOption(edge.process); const process = task.processes.find(card => card.id === edge.process)!;
      await expect(board(p)).toContainText(process.description); await field(p, 'Prosessin lähtövarasto').selectOption(edge.from); await field(p, 'Prosessin tulovarasto').selectOption(edge.to); await audit?.();
    }
    await btn(p, task.mode === 'water-path' ? 'Jatka omaan vesireittiin' : task.requireReturn ? 'Jatka omaan paluureittiin' : 'Jatka omaan hiilitiliin').press('Enter');
    if (response.mode === 'water-path') { await field(p, 'Pilven veden muoto').selectOption(response.cloud!); await field(p, 'Reitillä vaadittu viipymävarasto').selectOption(response.storedAt ?? 'none'); }
    else {
      if (response.returnPath.length) { for (const id of response.returnPath) { await field(p, 'Paluureitin seuraava varasto').selectOption(id); await btn(p, 'Lisää reitille').press('Enter'); } await audit?.(); await btn(p, 'Jatka muutosennusteeseen').press('Enter'); }
      await field(p, 'Oma ennuste fokusvaraston hiilen muutoksesta milligrammoina').fill(String(response.focusChangeMg! + (wrong ? 1 : 0)));
      if (task.mode === 'carbon-network' && task.goal === 'burn-trace') await field(p, 'Mitä palamisen energianuoli siirtää?').selectOption('energy');
      if (response.longStore) await field(p, 'Pitkäaikainen polttoaineen lähtövarasto').selectOption(response.longStore);
    }
    await audit?.(); await btn(p, 'Lukitse ennuste ja oma malli').press('Enter');
    const before = await state(p); if (task.mode === 'water-path') expect(before.model.operated).toBe(0);
    for (const move of response.moves) {
      await field(p, 'Toteutettava prosessi').selectOption(move.process); await expect(board(p)).toContainText(task.processes.find(card => card.id === move.process)!.description);
      await field(p, 'Oma siirrettävä määrä milligrammoina').fill(String(move.amountMg)); await btn(p, 'Toteuta prosessin siirto').press('Enter'); await audit?.();
    }
  }
  return task;
}
async function adult(p: Page, helped = false, written = false) {
  const before = (await ledger(p)).attempts.length;
  if (written) { await btn(p, 'Kirjoitan tähän').press('Enter'); await field(p, 'Oma selitykseni').fill('CYCLE_PRIVATE_493. Perustelen oman mallini ainevirrat ja rajaan päätelmän tähän jaksoon.'); await btn(p, 'Olen kirjoittanut selitykseni').press('Enter'); }
  else await btn(p, 'Olen kertonut selitykseni').press('Enter');
  await btn(p, 'Vahvista havainto').press('Enter'); expect((await ledger(p)).attempts.length).toBe(before);
  // Synthetic observation fixture. No assertion about a real learner's explanation or physical lab skill.
  for (const select of await p.locator('[data-explanation-adult] select').all()) await select.selectOption(await select.getAttribute('aria-label') === 'Saiko oppija apua?' ? helped ? 'helped' : 'none' : 'met');
  await p.locator('[data-explanation-adult] input[type=checkbox]').check(); await btn(p, 'Vahvista havainto').press('Enter');
}
async function submit(p: Page, task: MatterCyclesTask, ok = true, help = false, written = false) {
  await btn(p, task.review ? 'Siirry omaan kiertoselitykseen' : 'Tarkista oma kiertomalli').press('Enter'); if (task.review) await adult(p, help, written);
  await expect(p.locator('.exp-feedback')).toHaveAttribute('data-ok', String(ok));
}
for (const viewport of [{ width: 1366, height: 768 }, { width: 768, height: 1024 }]) test(`all twelve two-family active workbenches fit ${viewport.width}`, async ({ page }, info) => {
  test.setTimeout(300000); await page.setViewportSize(viewport); await fallback(page); const violations: string[] = [];
  for (const id of ids) for (const seed of [0, 1]) {
    await page.goto('./'); await page.evaluate(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on'))); await open(page, id, seed);
    const audit = async () => { violations.push(...(await fit(page)).map(v => `${id}/${seed} ${v}`)); };
    const task = await prepare(page, false, audit); await page.screenshot({ animations: 'disabled', path: info.outputPath(`${id}-${seed}-${viewport.width}.png`) }); await submit(page, task);
  }
  expect([...new Set(violations)]).toEqual([]);
});
test('all twelve own three fresh situations in both families and a changed-context transfer', async ({ page }) => {
  test.setTimeout(300000); await fallback(page);
  for (const id of ids) {
    await page.goto('./'); await page.evaluate(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on'))); await open(page, id, 1);
    for (let n = 0; n < 3; n++) { const task = await prepare(page); await submit(page, task); if (!n) expect((await ledger(page)).events.filter((e: { node: string }) => e.node === id)).toHaveLength(0); if (n < 2) await btn(page, 'Seuraava kokeilu').press('Enter'); }
    await btn(page, 'Kokeile uudessa tilanteessa').press('Enter'); const task = await prepare(page); await submit(page, task);
    const records = await ledger(page), attempts = records.attempts.filter((a: { node: string }) => a.node === id);
    expect(attempts).toHaveLength(4); expect(new Set(attempts.map((a: { itemKey: string }) => a.itemKey)).size).toBe(4); expect(new Set(attempts.filter((a: { phase: string }) => a.phase === 'independent').map((a: { tag: string }) => a.tag)).size).toBe(2);
    expect((await state(page)).progress.checked).toBe(true); expect(records.events.filter((e: { node: string }) => e.node === id)).toHaveLength(1);
  }
});
test('actual WebGL chamber and reservoir models conserve their exact tracked quantities', async ({ page }, info) => {
  test.setTimeout(180000); const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  for (const id of ['ENV-CHEM-MATTERCONS-01', 'ENV-CHEM-WATERCYCLE-01', 'CHEM79-CARBON-RESERVOIRS']) {
    await open(page, id, 1); const initial = (await state(page)).model; expect((await state(page)).renderer).toBe('webgl'); const task = await prepare(page), after = (await state(page)).model;
    if (task.mode !== 'reservoirs') { expect(after.parcels.reduce((sum: number, p: { amountMg: number }) => sum + p.amountMg, 0)).toBe(initial.parcels.reduce((sum: number, p: { amountMg: number }) => sum + p.amountMg, 0)); expect(after.operated).toBeGreaterThan(0); }
    else expect(after.samples.some((s: { at: string }) => s.at === 'geological')).toBe(true);
    await page.screenshot({ animations: 'disabled', path: info.outputPath(`${id}-webgl.png`) }); await submit(page, task);
  }
  expect(errors).toEqual([]);
});
test('wrong mass prediction then guided recovery and original written adult observation stay private', async ({ page }, info) => {
  test.setTimeout(180000); const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await open(page, 'ENV-CHEM-MATTERCONS-01', 1); let task = await prepare(page, true); await submit(page, task, false);
  await btn(page, 'Näytä ja selitä').press('Enter'); await btn(page, 'Uusi yhteinen kokeilu').press('Enter'); task = await prepare(page); await submit(page, task); expect((await state(page)).progress.checked).toBe(false);
  await open(page, 'CHEM79-CARBONCYCLE', 1); task = await prepare(page); await submit(page, task, true, true, true);
  const records = await ledger(page), own = records.attempts.at(-1); expect(own.assessor).toBe('adult'); expect(own.help).toContain('support'); expect(JSON.stringify(records)).not.toContain('CYCLE_PRIVATE_493'); expect(JSON.stringify(await state(page))).not.toContain('CYCLE_PRIVATE_493');
  await page.screenshot({ animations: 'disabled', path: info.outputPath('cycle-adult-webgl.png') }); expect(errors).toEqual([]);
});
test('adult pending criteria and read-only source inspection fit both viewport sizes', async ({ page }, info) => {
  test.setTimeout(90000); await fallback(page);
  for (const viewport of [{ width: 1366, height: 768 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport); await page.goto('./'); await open(page, 'CHEM79-CARBONCYCLE', 1); await prepare(page); await btn(page, 'Siirry omaan kiertoselitykseen').press('Enter');
    await btn(page, 'Näytä oma kiertomalli ja havainnot').press('Enter'); await btn(page, 'Katso lukittu ennuste ja reitti').press('Enter'); await expect(field(page, 'Oma ennuste fokusvaraston hiilen muutoksesta milligrammoina')).toBeDisabled(); await btn(page, 'Palaa omaan selitykseen').press('Enter'); await btn(page, 'Olen kertonut selitykseni').press('Enter');
    await page.screenshot({ animations: 'disabled', path: info.outputPath(`cycle-adult-active-${viewport.width}.png`) }); expect(await fit(page)).toEqual([]);
  }
});
