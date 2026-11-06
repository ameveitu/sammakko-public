import { expect, test, type Page } from '@playwright/test';
import { rng } from '../src/engine/rng';
import { lifecycleHarborSpecs } from '../src/content/lifecycle-harbor';
import type { LifecycleHarborTask } from '../src/content/models/lifecycle-harbor';
import { lifecycleOracle } from '../tests/lifecycle-harbor-fixtures';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });

test.use({ reducedMotion: 'reduce', launchOptions: { args: ['--enable-unsafe-swiftshader'] } });
const ids = lifecycleHarborSpecs.map(s => s.id), btn = (p: Page, name: string) => p.getByRole('button', { name, exact: true }), field = (p: Page, name: string) => p.getByLabel(name, { exact: true });
const state = (p: Page) => p.evaluate(() => JSON.parse(window.render_game_to_text!()));
const records = (p: Page) => p.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[],"events":[]}'));
const workbench = (p: Page) => p.locator('[data-lifecycle-workbench]');
async function fallback(p: Page) {
  await p.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (id, ...rest) { return /^webgl/.test(String(id)) ? null : Reflect.apply(original, this, [id, ...rest]); } as typeof original; });
}
async function open(p: Page, id: string, seed = 1) { await p.goto(`./?qa=1&seed=${seed}#saaristo/${id}`); await btn(p, 'Kokeilen itse').press('Enter'); await expect(workbench(p)).toBeVisible(); }
async function active(p: Page): Promise<LifecycleHarborTask> { const s = await state(p); return lifecycleHarborSpecs.find(n => n.id === s.node)!.item(rng(s.seed), s.phase).task as LifecycleHarborTask; }
async function fit(p: Page) {
  return p.evaluate(() => [...document.querySelectorAll<HTMLElement>('[data-lifecycle-workbench] button,[data-lifecycle-workbench] select,[data-lifecycle-workbench] input:not([type=checkbox]),[data-lifecycle-workbench] svg,[data-lifecycle-workbench] label:has(input[type=checkbox])')].filter(e => e.checkVisibility()).flatMap(e => {
    const r = e.getBoundingClientRect(), name = e.getAttribute('aria-label') ?? e.textContent?.slice(0, 32) ?? e.tagName;
    return [...(r.x < -1 || r.right > innerWidth + 1 || r.y < -1 || r.bottom > innerHeight + 1 ? [`${name} outside ${Math.round(r.y)}..${Math.round(r.bottom)}/${innerHeight}`] : []), ...(e.tagName !== 'svg' && (r.height < 43 || r.width < 43) ? [`${name} size${Math.round(r.width)}×${Math.round(r.height)}`] : [])];
  }));
}
async function prepare(p: Page, wrong = false, audit?: () => Promise<void>) {
  const task = await active(p), response = lifecycleOracle(task); await audit?.();
  if (response.resource) {
    for (const own of response.resource.roles) { await field(p, 'Alkuperäpassin kortti').selectOption(own.card); await field(p, 'Kortin oma luokka').selectOption(own.role!); await audit?.(); }
    for (const card of response.resource.path) { await field(p, 'Alkuperäpassin kortti').selectOption(card); await btn(p, 'Liitä kortti omaan reittiin').press('Enter'); }
    if (wrong) await btn(p, 'Poista reitin viimeinen').press('Enter'); await audit?.();
  }
  if (response.stages) {
    await btn(p, 'Vaihekartta').count().then(async n => { if (n) await btn(p, 'Vaihekartta').press('Enter'); });
    for (const own of response.stages.assignments) { await field(p, 'Elinkaaren tapahtuma').selectOption(own.event); await field(p, 'Tapahtuman oma vaihe').selectOption(own.stage!); await audit?.(); }
    await btn(p, 'Rakenna omat yhteydet').press('Enter');
    for (const edge of response.stages.edges) { await field(p, 'Tarkasteltava yhteys').selectOption(edge.transition); await field(p, 'Yhteyden oma lähtö').selectOption(edge.from); await field(p, 'Yhteyden oma tulo').selectOption(edge.to); await audit?.(); }
  }
  for (const type of ['material', 'energy'] as const) {
    const answer = response[type]; if (!answer) continue;
    const name = type === 'material' ? 'Ainekirja' : 'Energiakirja', unit = type === 'material' ? 'g' : 'kJ';
    if (await btn(p, name).count()) await btn(p, name).press('Enter');
    for (const f of answer.flows) {
      await field(p, 'Tarkasteltava oma virta').selectOption(f.id); await field(p, 'Virran oma lähtö').selectOption(f.from); await field(p, 'Virran oma määränpää').selectOption(f.to); await field(p, `Virran oma määrä ${unit}`).fill(String(f.amount! + (wrong && f.id === 'product' ? 1 : 0))); await audit?.();
    }
    if ('freshNextG' in answer) await field(p, 'Seuraavan saman erän uusi materiaalitarve g').fill(String(answer.freshNextG));
    else await field(p, 'Seuraavan saman erän ostettava energia kJ').fill(String(answer.nextPurchasedKj));
    await btn(p, 'Katso oma virta-taulukko').press('Enter'); await expect(p.getByRole('region', { name: 'Oma täydellinen virta-taulukko' })).toBeVisible(); await audit?.(); await btn(p, 'Palaa omaan virtaan').press('Enter');
    await expect(btn(p, 'Kokeile lukittua omaa tiliä')).toBeHidden(); await btn(p, 'Lukitse oma virtaennuste').press('Enter'); await expect(field(p, `Virran oma määrä ${unit}`)).toBeDisabled(); await audit?.(); await btn(p, 'Kokeile lukittua omaa tiliä').press('Enter'); await audit?.();
  }
  if (response.comparison) {
    if (await btn(p, 'Sama palvelutarve').count()) await btn(p, 'Sama palvelutarve').press('Enter');
    for (const q of response.comparison.quantities) {
      await field(p, 'Vertailun vaihtoehto').selectOption(q.option); await field(p, 'Tarvittavat kokonaiset esineet').fill(String(q.units)); await field(p, 'Tarvittavat huollot').fill(String(q.repairs)); await field(p, 'Uusi materiaali yhteensä g').fill(String(q.materialG)); await field(p, 'Energiapanos yhteensä kJ').fill(String(q.energyKj)); await field(p, 'Lopun palautusvarasto g').fill(String(q.returnedG)); await audit?.();
    }
    await field(p, 'Oma suositus').selectOption(response.comparison.choice);
  }
  return task;
}
async function adult(p: Page, helped = false, written = false) {
  const before = (await records(p)).attempts.length;
  if (written) { await field(p, 'Oman perustelun tapa').selectOption('written'); await field(p, 'Oma selitykseni').fill('LIFECYCLE_PRIVATE_902. Oma perusteluni käyttää molempia tilejä ja nimeää rajauksen.'); await btn(p, 'Olen kirjoittanut selitykseni').press('Enter'); }
  else await btn(p, 'Olen kertonut selitykseni').press('Enter');
  await btn(p, 'Vahvista havainto').press('Enter'); expect((await records(p)).attempts.length).toBe(before);
  // Technical fixture for human rubric metadata. This does not assess a real learner's spoken content.
  for (const select of await p.locator('[data-explanation-adult] select').all()) await select.selectOption(await select.getAttribute('aria-label') === 'Saiko oppija apua?' ? helped ? 'helped' : 'none' : 'met');
  await p.locator('[data-explanation-adult] input[type=checkbox]').check(); await btn(p, 'Vahvista havainto').press('Enter');
}
async function submit(p: Page, task: LifecycleHarborTask, ok = true, helped = false, written = false) {
  await btn(p, task.review ? 'Kerro oma perustelusi' : 'Tarkista oma telakkamalli').press('Enter'); if (task.review) await adult(p, helped, written);
  await expect(p.locator('.exp-feedback')).toHaveAttribute('data-ok', String(ok));
}
for (const viewport of [{ width: 1366, height: 768 }, { width: 768, height: 1024 }]) test(`all eight active two-family workbenches fit ${viewport.width}`, async ({ page }, info) => {
  test.setTimeout(300000); await page.setViewportSize(viewport); await fallback(page); const errors: string[] = [];
  for (const id of ids) for (const seed of [0, 1]) {
    await page.goto('./'); await page.evaluate(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on'))); await open(page, id, seed);
    const task = await prepare(page, false, async () => { errors.push(...(await fit(page)).map(e => `${id}/${seed} ${e}`)); });
    await page.screenshot({ animations: 'disabled', path: info.outputPath(`${id}-${seed}-${viewport.width}.png`) }); await submit(page, task);
  }
  expect([...new Set(errors)]).toEqual([]);
});
test('all eight own three fresh productions and transfer, with distinct history and delayed story resolution', async ({ page }) => {
  test.setTimeout(300000); await fallback(page);
  for (const id of ids) {
    await page.goto('./'); await page.evaluate(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on'))); await open(page, id);
    for (let n = 0; n < 3; n++) { const task = await prepare(page); await submit(page, task); if (!n) expect((await records(page)).events.filter((e: { node: string }) => e.node === id)).toHaveLength(0); if (n < 2) await btn(page, 'Seuraava kokeilu').press('Enter'); }
    await btn(page, 'Kokeile uudessa tilanteessa').press('Enter'); const task = await prepare(page); await submit(page, task);
    const ledger = await records(page), attempts = ledger.attempts.filter((a: { node: string }) => a.node === id);
    expect(attempts).toHaveLength(4); expect(new Set(attempts.map((a: { itemKey: string }) => a.itemKey)).size).toBe(4); expect(new Set(attempts.filter((a: { phase: string }) => a.phase === 'independent').map((a: { tag: string }) => a.tag)).size).toBe(2); expect((await state(page)).progress.checked).toBe(true); expect(ledger.events.filter((e: { node: string }) => e.node === id)).toHaveLength(1);
  }
});
test('actual WebGL Saaristo hosts all eight exact 2D workbenches', async ({ page }, info) => {
  test.setTimeout(240000); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  for (const id of ids) { await open(page, id); expect((await state(page)).renderer).toBe('webgl'); const task = await prepare(page); await page.screenshot({ animations: 'disabled', path: info.outputPath(`${id}-webgl.png`) }); await submit(page, task); }
  expect(errors).toEqual([]);
});
test('wrong allocation recovers with help, written adult observation persists only assessment metadata', async ({ page }, info) => {
  test.setTimeout(150000); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await open(page, 'CHEM79-LIFECYCLE-FLOWS'); let task = await prepare(page, true); await submit(page, task, false); await btn(page, 'Näytä ja selitä').press('Enter'); await btn(page, 'Uusi yhteinen kokeilu').press('Enter'); task = await prepare(page); await submit(page, task); expect((await state(page)).progress.checked).toBe(false);
  await open(page, 'CHEM79-SUSTAIN'); task = await prepare(page); await submit(page, task, true, true, true);
  const ledger = await records(page), last = ledger.attempts.at(-1); expect(last.assessor).toBe('adult'); expect(last.help).toContain('support'); expect(JSON.stringify(ledger)).not.toContain('LIFECYCLE_PRIVATE_902'); expect(JSON.stringify(await state(page))).not.toContain('LIFECYCLE_PRIVATE_902');
  await page.screenshot({ animations: 'disabled', path: info.outputPath('lifecycle-private-adult-webgl.png') }); expect(errors).toEqual([]);
});
test('adult review and read-only original evidence fit desktop and portrait tablet', async ({ page }, info) => {
  test.setTimeout(120000); await fallback(page);
  for (const viewport of [{ width: 1366, height: 768 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport); await page.goto('./'); await open(page, 'CHEM79-SUSTAIN'); await prepare(page); await btn(page, 'Kerro oma perustelusi').press('Enter');
    await btn(page, 'Katso omaa lukittua aineistoa').press('Enter'); await btn(page, 'Ainekirja').press('Enter'); await expect(field(page, 'Virran oma määrä g')).toBeDisabled(); await btn(page, 'Katso omaa lukittua aineistoa').press('Enter');
    await btn(page, 'Olen kertonut selitykseni').press('Enter'); expect(await fit(page)).toEqual([]); await page.screenshot({ animations: 'disabled', path: info.outputPath(`lifecycle-adult-active-${viewport.width}.png`) });
  }
});

 test('structured numeric fields reject prose before it can enter persisted answers', async ({ page }) => {
  await fallback(page); await open(page, 'CHEM79-LIFECYCLE-FLOWS');
  await field(page, 'Virran oma määrä g').fill('PRIVATE_NUMERIC_661');
  await field(page, 'Virran oma lähtö').focus();
  await expect(field(page, 'Virran oma määrä g')).toHaveValue('');
  expect((await records(page)).attempts).toHaveLength(0);
  const task = await prepare(page); await submit(page, task);
  expect(JSON.stringify(await records(page))).not.toContain('PRIVATE_NUMERIC_661');
 });
