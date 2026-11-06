import { expect, test, type Page } from '@playwright/test';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });
test.use({ reducedMotion: 'reduce', launchOptions: { args: ['--enable-unsafe-swiftshader'] } });
const ids = ['ENV-CHEM-CHEMICAL-SAFE-01', 'ENV-CHEM-POISON-SAFE-01', 'ENV-CHEM-FIRE-SAFE-01', 'ENV-CHEM-HOMECHEM-SAFE-01',
  'ENV-PHY-ELECSAFE-01', 'PHY79-ELEC-SAFE', 'PHY79-SAFE-01', 'CHEM79-SAFE-01', 'CHEM79-CHEMICAL-USE-SAFE', 'CHEM79-HAZARD-LABEL', 'CHEM79-CHEMICAL-SAFE', 'CHEM79-FIRE-CONDITIONS', 'CHEM79-FIRE-ACTION'];
const button = (p: Page, name: string) => p.getByRole('button', { name, exact: true });
const field = (p: Page, name: string) => p.getByLabel(name, { exact: true });
const state = (p: Page) => p.evaluate(() => JSON.parse(window.render_game_to_text!()));
const ledger = (p: Page) => p.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[]}'));
async function fallback(p: Page) {
  await p.addInitScript(() => { const get = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (id, ...rest) { return /^webgl/.test(String(id)) ? null : Reflect.apply(get, this, [id, ...rest]); } as typeof get; });
}
async function open(p: Page, id: string, seed = 1) {
  await p.emulateMedia({ reducedMotion: 'reduce' }); await p.goto(`./?qa=1&full=1&seed=${seed}#saaristo/${id}`); await button(p, 'Kokeilen itse').press('Enter');
  await expect(p.locator('[data-safety-workbench]')).toBeVisible();
}
const names = { 'Räjähtävä pommi': ['ghs01', 'räjähtävä'], Liekki: ['ghs02', 'syttyvä'], 'Liekki ympyrän päällä': ['ghs03', 'hapettava'],
  Kaasupullo: ['ghs04', 'paineen alainen kaasu'], Syöpyminen: ['ghs05', 'syövyttävä'], 'Pääkallo ja ristikkäiset luut': ['ghs06', 'välitön myrkyllisyys'],
  Huutomerkki: ['ghs07', 'terveysvaara / vaarallinen otsonikerrokselle'], 'Ihmishahmo ja rintakehän merkki': ['ghs08', 'vakava terveysvaara'], 'Puu ja kala': ['ghs09', 'vaarallinen ympäristölle'] };
async function graph(p: Page, id: string) {
  const options = await field(p, `${id}, lisättävä piste`).locator('option').evaluateAll(os => os.filter(o => o.value).map(o => ({ id: o.value, label: o.textContent! })));
  const drawing = await p.locator(`[data-safety-map="${id}"] svg`).evaluate(svg => ({ circles: [...svg.querySelectorAll('circle')].map(c => ({ x: Number(c.getAttribute('cx')), y: Number(c.getAttribute('cy')) })), lines: [...svg.querySelectorAll('line')].map(l => [Number(l.getAttribute('x1')), Number(l.getAttribute('y1')), Number(l.getAttribute('x2')), Number(l.getAttribute('y2'))]),
    texts: [...svg.querySelectorAll('text')].map(t => ({ x: Number(t.getAttribute('x')), y: Number(t.getAttribute('y')), text: t.textContent })) }));
  const nodes = options.map((o, i) => ({ ...o, ...drawing.circles[i]!, smoke: drawing.texts.some(t => t.x === drawing.circles[i]!.x && t.y === drawing.circles[i]!.y + 3 && t.text === 'S') }));
  const edges = drawing.lines.map(([x1, y1, x2, y2]) => [nodes.find(n => n.x === x1 && n.y === y1)!.id, nodes.find(n => n.x === x2 && n.y === y2)!.id]);
  return { nodes, edges };
}
async function makePlan(p: Page, id: string, actions: string[]) {
  const surface = p.locator(`[data-safety-action-work="${id}"]`);
  for (const action of actions) { await field(p, `${id}, seuraava suunniteltu toimi`).selectOption(action); await surface.getByRole('button', { name: 'Lisää suunnitelmaan', exact: true }).press('Enter'); }
  await surface.getByRole('button', { name: 'Lukitse suunnitelma', exact: true }).press('Enter');
  return async (count: number) => { for (let i = 0; i < count; i++) await surface.getByRole('button', { name: 'Toteuta seuraava vaihe', exact: true }).press('Enter'); };
}
async function prepareCase(p: Page, wrong = false) {
  const factsNode = p.locator('[data-safety-case-facts]'), id = (await p.locator('[data-safety-active-case]').getAttribute('data-safety-active-case'))!, facts = await factsNode.count() ? await factsNode.innerText() : '';
  const map = p.locator(`[data-safety-map="${id}"]`), condition = p.locator('[data-safety-condition-givens]');
  if (await condition.count()) {
    const given = await condition.innerText(), roles = [['fuel', 'Palava aine'], ['oxidizer', 'Hapettava ympäristö'], ['heat', 'Riittävä lämpötila']] as const;
    const before = Object.fromEntries(roles.map(([key, label]) => [key, given.includes(`${label.toLowerCase()} mukana`)]));
    for (const [key, label] of roles) await field(p, `${id}, ${label}`).selectOption(before[key] ? 'yes' : 'no');
    const after = { ...before }; const changed = roles.find(([, label]) => given.includes(`Muutos ${label.toLowerCase()}`))!;
    after[changed[0]] = given.includes('saataville');
    await field(p, `${id}, oma ennuste`).selectOption(Object.values(after).every(Boolean) ? 'continues' : 'stops');
    await expect(p.locator('[data-safety-condition-observation]')).toBeEmpty(); await expect(button(p, 'Muuta virtuaalimallia')).toBeDisabled();
    await button(p, 'Lukitse oma ennuste').press('Enter'); await button(p, 'Muuta virtuaalimallia').press('Enter'); return;
  }
  if (await map.count()) {
    const electrical = await field(p, `${id}, energiansiirron riski`).count() > 0;
    const { nodes, edges } = await graph(p, id), start = nodes[0]!.id, end = electrical ? nodes.find(n => n.label === 'Paluu lähteeseen')!.id : facts.includes('Pysy sisällä') ? start : nodes.find(n => n.label === 'Turvallinen kokoontumispaikka')!.id;
    const queue = [[start]]; let path: string[] = [];
    while (queue.length) { const candidate = queue.shift()!; if (candidate.at(-1) === end) { path = candidate; break; }
      for (const node of nodes) if (!node.smoke && !candidate.includes(node.id) && edges.some(([a, b]) => a === candidate.at(-1) && b === node.id || b === candidate.at(-1) && a === node.id)) queue.push([...candidate, node.id]); }
    for (const point of path.slice(1)) { await field(p, `${id}, lisättävä piste`).selectOption(point); await button(p, 'Lisää reitille').press('Enter'); }
    if (electrical) {
      await button(p, 'Lukitse reitti').press('Enter');
      await field(p, `${id}, energiansiirron riski`).selectOption(facts.includes('sähköiskun') ? 'shock' : 'heating');
      await field(p, `${id}, eristyksen tehtävä`).selectOption('blocks-contact'); const perform = await makePlan(p, id, ['keep-clear', 'tell-adult']); await perform(2); return;
    }
    const early = [...(facts.includes('Varoita lähellä') ? ['warn-friends'] : []), ...(facts.includes('Suojaava ovi suljetaan') ? ['close-door'] : [])];
    const perform = await makePlan(p, id, [...early, 'call-112', 'wait-permission']); await perform(early.length);
    await button(p, 'Lukitse reitti').press('Enter'); for (const _ of path.slice(1)) await button(p, 'Kulje seuraava karttapiste').press('Enter'); await perform(2); return;
  }
  const images = p.locator('[data-safety-workbench] img');
  if (await images.count()) {
    for (const [index, image] of (await images.all()).entries()) {
      const description = (await image.getAttribute('alt'))!.replace(/^Merkki \d+, /, ''), code = names[description as keyof typeof names][0]!;
      await field(p, `${id}, merkin ${index + 1} merkitys`).selectOption(code);
      await expect.poll(() => image.evaluate(i => (i as HTMLImageElement).naturalWidth)).toBeGreaterThan(100);
    }
    const draft = field(p, `${id}, korjattava luonnosväite`);
    if (await draft.count()) {
      const options = await draft.locator('option').evaluateAll(os => os.filter(o => o.value).map(o => ({ id: o.value, text: o.textContent! })));
      const wrong = options.find(o => { if (!o.text.includes(' tarkoittaa ')) return o.text.includes('Yhdistän');
        const [symbol, meaning] = o.text.split(' tarkoittaa '); return names[symbol as keyof typeof names][1] !== meaning; })!;
      await draft.selectOption(wrong.id);
    }
    const instruction = await p.locator('[data-safety-workbench]').innerText(), actions = ['read-instruction'];
    if (instruction.includes('riittävän ilmanvaihdon')) actions.push('ventilate-plan'); if (instruction.includes('erossa lämmöstä')) actions.push('keep-heat-away');
    if (instruction.includes('pääsy vesistöön')) actions.push('protect-water'); if (instruction.includes('erillään elintarvikkeista')) actions.push('separate-food');
    await button(p, 'Jatka omaan toimintaketjuun').press('Enter');
    actions.push('secure-storage'); const perform = await makePlan(p, id, actions); await perform(actions.length); return;
  }
  if (facts.includes('tajuton tai hengittäminen')) { const actions = ['keep-clear', 'tell-adult', 'call-112']; const perform = await makePlan(p, id, actions); await perform(actions.length); return; }
  const actions: string[] = [];
  if (facts.includes('Varoita heitä')) actions.push('warn-friends'); if (facts.includes('ruokailu suunnitellaan erilleen')) actions.push('separate-food');
  if (facts.includes('virtuaalisen tuulitunnelin') || facts.includes('Virtuaalisen tuulitunnelin') || facts.includes('liikemittarin')) {
    actions.push('read-instruction'); if (facts.includes('Malli on käynnissä')) actions.push('stop-model');
    if (facts.includes('suojalasit')) actions.push('protect'); actions.push('adjust-stopped', 'observe-shield');
    if (wrong) { const index = actions.indexOf('stop-model'); if (index >= 0) actions.splice(index, 1); }
  } else if (facts.includes('Kaikilla virtuaalinäytteillä')) {
    actions.push('read-instruction', 'identify-samples'); if (facts.includes('suojalasit')) actions.push('protect'); actions.push('tell-adult');
  } else {
    actions.push('keep-clear'); if (facts.includes('ohje on luettavissa')) actions.push('read-instruction'); actions.push('tell-adult');
    if (facts.includes('epäillään aineen joutuneen suuhun')) actions.push(facts.includes('tajuton tai hengittäminen') ? 'call-112' : 'contact-poison');
  }
  const perform = await makePlan(p, id, actions); await perform(wrong ? Math.max(1, actions.indexOf('adjust-stopped') + 1) : actions.length);
}
async function prepare(p: Page, options: { wrong?: boolean; audit?(): Promise<void> } = {}) {
  const tabs = p.getByRole('button', { name: /^Tilanne \d,/ });
  const count = await tabs.count();
  for (let index = 0; index < Math.max(1, count); index++) { if (count) await tabs.nth(index).press('Enter'); await options.audit?.(); await prepareCase(p, options.wrong); await options.audit?.(); }
}
async function adult(p: Page, helped = false, written = false) {
  const before = (await ledger(p)).attempts.length;
  if (written) { await button(p, 'Kirjoitan tähän').press('Enter'); await field(p, 'Oma selitykseni').fill('SAFETY_OWN_TEXT_8247. Perustelen näkyvien ohjeiden ja vaarahavainnon yhteyden.'); await button(p, 'Olen kirjoittanut selitykseni').press('Enter'); }
  else await button(p, 'Olen kertonut selitykseni').press('Enter');
  await button(p, 'Vahvista havainto').press('Enter'); expect((await ledger(p)).attempts.length).toBe(before);
  // Synthetic adult-interface fixture. It exercises provenance and privacy, not the meaning of a real learner's explanation.
  for (const select of await p.locator('[data-explanation-adult] select').all()) await select.selectOption(await select.getAttribute('aria-label') === 'Saiko oppija apua?' ? helped ? 'helped' : 'none' : 'met');
  await p.locator('[data-explanation-adult] input[type=checkbox]').check(); await button(p, 'Vahvista havainto').press('Enter');
}
async function finish(p: Page, options: { helped?: boolean; written?: boolean; ok?: boolean } = {}) {
  const own = button(p, 'Siirry omaan perusteluun');
  await (await own.count() ? own : button(p, 'Tarkista turvapolku')).press('Enter');
  if (await button(p, 'Olen kertonut selitykseni').count()) await adult(p, options.helped, options.written);
  await expect(p.locator('.exp-feedback')).toHaveAttribute('data-ok', String(options.ok ?? true));
}
for (const viewport of [{ width: 1366, height: 768 }, { width: 768, height: 1024 }]) test(`all13 both families initial/active controls ${viewport.width}`, async ({ page }) => {
  test.setTimeout(240000); await page.setViewportSize(viewport); await fallback(page); const violations: string[] = [];
  for (const id of ids) for (const seed of [0, 1]) {
    await page.goto('./'); await page.evaluate(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on'))); await open(page, id, seed);
    const audit = async () => {
      for (const control of await page.locator('[data-safety-workbench] button:visible,[data-safety-workbench] select:visible').all()) {
        const box = await control.boundingBox(); const label = await control.getAttribute('aria-label');
        if (!box || box.height < 43 || box.width < 43 || box.x + box.width > viewport.width + 1 || box.y + box.height > viewport.height + 1) violations.push(`${id}/${seed}/${label} ${box ? `${Math.round(box.x + box.width)}×${Math.round(box.y + box.height)}` : 'missing'}`);
      }
    };
    await audit(); await prepare(page, { audit });
    await page.screenshot({ path: test.info().outputPath(`${id}-${seed}-${viewport.width}.png`) }); await finish(page);
  }
  expect([...new Set(violations)]).toEqual([]);
});
test('all13 own3fresh+transfer produces independent node evidence', async ({ page }) => {
  test.setTimeout(360000); await fallback(page);
  for (const id of ids) {
    await page.goto('./'); await page.evaluate(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on'))); await open(page, id, 7);
    for (let i = 0; i < 4; i++) { expect((await state(page)).phase).toBe(i === 3 ? 'transfer' : 'independent'); await prepare(page); await finish(page); if (i < 3) await button(page, i === 2 ? 'Kokeile uudessa tilanteessa' : 'Seuraava kokeilu').press('Enter'); }
    const saved = await ledger(page); expect(saved.attempts).toHaveLength(4); expect(new Set(saved.attempts.map((a: { itemKey: string }) => a.itemKey)).size).toBe(4); expect((await state(page)).progress.checked).toBe(true);
  }
});
test('actual WebGL procedure wrong→hint→guided recovery and original explanation remains private', async ({ page }) => {
  test.setTimeout(90000); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await open(page, 'PHY79-SAFE-01', 1); expect((await state(page)).renderer).toBe('webgl');
  await prepare(page, { wrong: true }); await finish(page, { ok: false }); await button(page, 'Näytä ja selitä').press('Enter'); await button(page, 'Uusi yhteinen kokeilu').press('Enter');
  await prepare(page); await finish(page); expect((await state(page)).progress.checked).toBe(false);
  await page.goto('./'); await page.evaluate(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on'))); await open(page, 'PHY79-ELEC-SAFE', 1); await prepare(page); await finish(page, { helped: true, written: true });
  const saved = await ledger(page); expect(saved.attempts[0].assessor).toBe('adult'); expect(saved.attempts[0].help).toContain('support');
  expect(JSON.stringify(saved)).not.toContain('SAFETY_OWN_TEXT_8247'); expect(JSON.stringify(await state(page))).not.toContain('SAFETY_OWN_TEXT_8247');
  await page.screenshot({ path: test.info().outputPath('safety-adult-webgl.png') }); expect(errors).toEqual([]);
});
