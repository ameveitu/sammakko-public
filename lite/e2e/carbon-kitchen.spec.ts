import { expect, test, type Page } from '@playwright/test';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });
test.use({ reducedMotion: 'reduce', launchOptions: { args: ['--enable-unsafe-swiftshader'] } });
const ids = ['CHEM79-CARBON', 'CHEM79-CARBON-COMPOUND', 'CHEM79-NUTRIENT-01', 'CHEM79-NUTRIENT-CARB', 'CHEM79-NUTRIENT-FAT', 'CHEM79-NUTRIENT-PROT', 'CHEM79-ORG-GROUP'];
const btn = (p: Page, name: string) => p.getByRole('button', { name, exact: true });
const field = (p: Page, name: string) => p.getByLabel(name, { exact: true });
const board = (p: Page) => p.locator('[data-carbon-workbench]');
const state = (p: Page) => p.evaluate(() => JSON.parse(window.render_game_to_text!()));
const ledger = (p: Page) => p.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[],"events":[]}'));
async function fallback(p: Page) {
  await p.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (id, ...rest) { return /^webgl/.test(String(id)) ? null : Reflect.apply(original, this, [id, ...rest]); } as typeof original; });
}
async function open(p: Page, id: string, seed = 1) {
  await p.goto(`./?qa=1&seed=${seed}#saaristo/${id}`); await btn(p, 'Kokeilen itse').press('Enter'); await expect(board(p)).toBeVisible();
}
function nutrientGroup(text: string) {
  if (/Glukoosi|Fruktoosi|Sakkaroosi|Maltoosi|Tärkkelys/.test(text)) return 'carbohydrate';
  if (/Trioleiini|Tripalmitiini/.test(text)) return 'fat';
  if (/proteiin/i.test(text)) return 'protein';
  return 'other';
}
async function molecules(p: Page) {
  const options = await field(p, 'Sidoksen ensimmäinen atomi').locator('option').evaluateAll(os => os.filter(o => o.value).map(o => ({ id: o.value, element: o.textContent!.split(' · ')[1]! })));
  const carbon = options.filter(a => a.element === 'C'), oxygen = options.filter(a => a.element === 'O'), hydrogen = options.filter(a => a.element === 'H').reverse();
  const bonds: { a: string; b: string; order: number }[] = [];
  if (oxygen.length === 2) bonds.push({ a: carbon[0]!.id, b: oxygen[0]!.id, order: 2 }, { a: carbon[0]!.id, b: oxygen[1]!.id, order: 2 });
  else {
    for (let i = 1; i < carbon.length; i++) bonds.push({ a: carbon[i - 1]!.id, b: carbon[i]!.id, order: carbon.length === 2 && hydrogen.length <= 4 && !oxygen.length ? hydrogen.length === 2 ? 3 : 2 : 1 });
    if (oxygen.length) bonds.push({ a: carbon.at(-1)!.id, b: oxygen[0]!.id, order: hydrogen.length === carbon.length * 2 ? 2 : 1 });
    let h = 0;
    for (const atom of [...carbon, ...oxygen]) {
      const used = bonds.filter(b => b.a === atom.id || b.b === atom.id).reduce((n, b) => n + b.order, 0);
      for (let n = used; n < (atom.element === 'C' ? 4 : 2); n++) bonds.push({ a: atom.id, b: hydrogen[h++]!.id, order: 1 });
    }
  }
  const remove = board(p).getByRole('button', { name: /^Poista sidos / });
  while (await remove.count()) await remove.first().press('Enter');
  for (const bond of bonds) {
    await field(p, 'Sidoksen ensimmäinen atomi').selectOption(bond.a); await field(p, 'Sidoksen toinen atomi').selectOption(bond.b); await field(p, 'Sidoksen kertaluku').selectOption(String(bond.order)); await btn(p, 'Liitä').press('Enter');
  }
  await btn(p, 'Jatka näytevertailuun').press('Enter');
  for (const [id, type] of [['carbon', 'element'], ['co2', 'compound'], ['mix', 'mixture']]) await field(p, `${id} näytteen tyyppi`).selectOption(type!);
  await field(p, 'Ovatko kaikki hiiliyhdisteet orgaanisia?').selectOption('no');
}
async function nutrients(p: Page, wrong = false) {
  const rows = await board(p).locator('tbody tr').all(), groups: { id: string; group: string; a: number; b: number }[] = [];
  for (const row of rows) {
    const cells = row.locator('td'), name = await cells.nth(0).innerText(), select = row.getByRole('combobox'), group = nutrientGroup(name);
    const label = (await select.getAttribute('aria-label'))!, id = label.replace(' aineryhmä', '');
    groups.push({ id, group, a: Number(await cells.nth(1).innerText()), b: Number(await cells.nth(2).innerText()) }); await select.selectOption(group);
  }
  await btn(p, 'Rakenna evästaulukko').press('Enter');
  for (const [id, key] of [['food-a', 'a'], ['food-b', 'b']] as const) {
    const expected = [...new Set(groups.filter(row => row[key] > 0 && row.group !== 'other').map(row => row.group))];
    const names: Record<string, string> = { carbohydrate: 'Hiilihydraatti', fat: 'Rasva', protein: 'Proteiini' };
    for (const group of expected) await btn(p, `${id} ${names[group]}`).press('Enter');
  }
  const request = await board(p).locator('label').filter({ has: field(p, 'Pyydetyn ravintoaineryhmän massa grammoina') }).innerText();
  const group = request.includes('Hiilihydraatti') ? 'carbohydrate' : request.includes('Rasva') ? 'fat' : 'protein';
  const amount = groups.filter(row => row.group === group).reduce((sum, row) => sum + BigInt(row.a), 0n);
  await field(p, 'Pyydetyn ravintoaineryhmän massa grammoina').fill(String(amount + (wrong ? 1n : 0n)));
  if (await field(p, 'Korjattava eväsväite').count()) await field(p, 'Korjattava eväsväite').selectOption('food-a');
}
async function protein(p: Page) {
  const text = await board(p).innerText(), length = Number(/Kokoa (\d+) eri palaa/.exec(text)![1]);
  const remove = board(p).getByRole('button', { name: /^(Gly|Ala|Ser|Val|Leu|Thr|Glukoosiosa|Rasvahappotähde) ×$/ });
  while (await remove.count()) await remove.first().press('Enter');
  const units = await field(p, 'Ketjuun lisättävä rakenneosa').locator('option').evaluateAll(os => os.filter(o => o.value && o.textContent!.includes('aminohappotähde')).map(o => o.value));
  for (const unit of units.reverse().slice(0, length)) { await field(p, 'Ketjuun lisättävä rakenneosa').selectOption(unit); await btn(p, 'Liitä ketjuun').press('Enter'); }
  await btn(p, 'Taivuta mallia').press('Enter');
  for (const card of await p.locator('[data-carbon-protein-food]').all()) {
    const data = await card.innerText(), id = (await card.getAttribute('data-carbon-protein-food'))!;
    if (/proteiin[^·]*? ([1-9]\d*) g/i.test(data)) await btn(p, `${id} sisältää proteiinia`).press('Enter');
  }
}
async function organic(p: Page) {
  const before = await state(p);
  const molecules = before.model?.molecules ?? before.stage?.molecules;
  expect(molecules).toBeTruthy();
  const choices = await field(p, 'Korkeampi annettu kiehumispiste').locator('option').evaluateAll(os => os.filter(o => o.value).map(o => ({ id: o.value, name: o.textContent! })));
  for (const choice of choices) {
    await btn(p, choice.name).press('Enter');
    const molecule = molecules.find((m: { id: string }) => m.id === choice.id), atoms = molecule.atoms as { id: string; element: string }[], bonds = molecule.bonds as { a: string; b: string; order: number }[];
    const oxygen = atoms.find(a => a.element === 'O')!, connected = bonds.filter(b => b.a === oxygen.id || b.b === oxygen.id).map(b => b.a === oxygen.id ? b.b : b.a);
    const hydrogen = atoms.find(a => a.element === 'H' && connected.includes(a.id))!, carbon = atoms.find(a => a.element === 'C' && connected.includes(a.id))!;
    await field(p, `${choice.id} ryhmän C`).selectOption(carbon.id); await field(p, `${choice.id} ryhmän O`).selectOption(oxygen.id); await field(p, `${choice.id} ryhmän H`).selectOption(hydrogen.id);
  }
  const text = await board(p).innerText(), values = choices.map(choice => ({ ...choice, value: Number(text.match(new RegExp(`${choice.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} ≈ (\\d+) °C`))![1]) }));
  await btn(p, 'Jatka ominaisuusvertailuun').press('Enter');
  await field(p, 'Korkeampi annettu kiehumispiste').selectOption([...values].sort((a, b) => b.value - a.value)[0]!.id);
  await field(p, 'Kiehumispisteiden ero celsiusasteina').fill(String(Math.abs(values[0]!.value - values[1]!.value)));
  if (await field(p, 'Virheellisen ryhmäväitteen rakenne').count()) await field(p, 'Virheellisen ryhmäväitteen rakenne').selectOption('ether');
}
async function prepare(p: Page, wrong = false) {
  const mode = await board(p).getAttribute('data-carbon-workbench');
  if (mode === 'composition') {
    await field(p, 'Hiilen alkuaineen tunnus').selectOption('C');
    for (const card of await p.locator('[data-carbon-card]').all()) {
      const id = (await card.getAttribute('data-carbon-card'))!, inventory = await card.locator('strong').innerText(), carbon = /C × (\d+)/.exec(inventory), elements = [...inventory.matchAll(/[CHO] × \d+/g)].length;
      await field(p, `${id} hiiliatomien määrä`).fill(carbon?.[1] ?? '0'); await field(p, `${id} aineen tyyppi`).selectOption(elements === 1 ? 'element' : 'compound');
    }
    if (await field(p, 'Väitteen vastaesimerkki').count()) await field(p, 'Väitteen vastaesimerkki').selectOption('b');
  } else if (mode === 'molecule-build') await molecules(p);
  else if (mode === 'nutrient-matrix') await nutrients(p, wrong);
  else if (mode === 'protein-fragment') await protein(p);
  else await organic(p);
}
async function adult(p: Page, helped = false, written = false) {
  const count = (await ledger(p)).attempts.length;
  if (written) { await btn(p, 'Kirjoitan tähän').press('Enter'); await field(p, 'Oma selitykseni').fill('CARBON_PRIVATE_2983. Kerron tämän aineiston rakennepiirteen ja vertailun rajat.'); await btn(p, 'Olen kirjoittanut selitykseni').press('Enter'); }
  else await btn(p, 'Olen kertonut selitykseni').press('Enter');
  await btn(p, 'Vahvista havainto').press('Enter'); expect((await ledger(p)).attempts.length).toBe(count);
  // Technical adult-interface fixture. It does not assess a real child's reasoning.
  for (const menu of await p.locator('[data-explanation-adult] select').all()) await menu.selectOption(await menu.getAttribute('aria-label') === 'Saiko oppija apua?' ? helped ? 'helped' : 'none' : 'met');
  await p.locator('[data-explanation-adult] input[type=checkbox]').check(); await btn(p, 'Vahvista havainto').press('Enter');
}
async function submit(p: Page, id: string, ok = true, help = false, written = false) {
  await btn(p, id === 'CHEM79-ORG-GROUP' ? 'Siirry omaan perusteluun' : 'Tarkista oma tutkimus').press('Enter');
  if (id === 'CHEM79-ORG-GROUP') await adult(p, help, written);
  await expect(p.locator('.exp-feedback')).toHaveAttribute('data-ok', String(ok));
}
async function fit(p: Page) {
  return p.evaluate(() => {
    const root = document.querySelector('[data-carbon-workbench]')!, visible = [...root.querySelectorAll<HTMLElement>('button,select,input:not([type=checkbox]),svg,label:has(input[type=checkbox])')].filter(el => el.checkVisibility());
    return visible.flatMap(el => { const r = el.getBoundingClientRect(), name = el.getAttribute('aria-label') ?? el.textContent?.slice(0, 50) ?? el.tagName; const issues = [];
      if (r.x < -1 || r.right > innerWidth + 1 || r.top < -1 || r.bottom > innerHeight + 1) issues.push(`${name} outside ${Math.round(r.bottom)}/${innerHeight}`);
      if (el.tagName !== 'svg' && (r.height < 43 || r.width < 43)) issues.push(`${name} target ${Math.round(r.width)}x${Math.round(r.height)}`);
      return issues;
    });
  });
}
for (const viewport of [{ width: 1366, height: 768 }, { width: 768, height: 1024 }]) test(`all seven families and controls visible ${viewport.width}`, async ({ page }, info) => {
  test.setTimeout(180000); await page.setViewportSize(viewport); await fallback(page); const violations: string[] = [];
  for (const id of ids) for (const seed of [0, 1]) {
    await page.goto('./'); await page.evaluate(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on'))); await open(page, id, seed);
    violations.push(...(await fit(page)).map(v => `${id}/${seed}/initial ${v}`));
    await prepare(page); violations.push(...(await fit(page)).map(v => `${id}/${seed}/active ${v}`));
    await page.screenshot({ animations: 'disabled', path: info.outputPath(`${id}-${seed}-${viewport.width}.png`) });
    await submit(page, id);
  }
  expect(violations).toEqual([]);
});
test('all seven require three fresh independent families plus changed-context transfer', async ({ page }) => {
  test.setTimeout(180000); await fallback(page);
  for (const id of ids) {
    await page.goto('./'); await page.evaluate(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on'))); await open(page, id, 1);
    for (let n = 0; n < 3; n++) { await prepare(page); await submit(page, id); if (n < 2) await btn(page, 'Seuraava kokeilu').press('Enter'); }
    await expect(btn(page, 'Kokeile uudessa tilanteessa')).toBeVisible(); await btn(page, 'Kokeile uudessa tilanteessa').press('Enter'); await prepare(page); await submit(page, id);
    const result = await ledger(page), attempts = result.attempts.filter((a: { node: string }) => a.node === id);
    expect(attempts.length).toBe(4); expect(new Set(attempts.map((a: { itemKey: string }) => a.itemKey)).size).toBe(4); expect((await state(page)).progress.checked).toBe(true);
  }
});
test('actual WebGL own molecular bonds and protein bending remain consistent', async ({ page }, info) => {
  test.setTimeout(90000); const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await open(page, ids[1]!, 1); await prepare(page); expect((await state(page)).renderer).toBe('webgl');
  const model = await state(page); expect(model.model.molecules[0].bonds.length).toBeGreaterThan(0); await page.screenshot({ animations: 'disabled', path: info.outputPath('carbon-molecule-webgl.png') }); await submit(page, ids[1]!);
  await open(page, ids[5]!, 1); await prepare(page); const bent = (await state(page)).model; expect(bent.folded).toBe(true); expect(bent.residues.length).toBeGreaterThanOrEqual(3);
  await page.screenshot({ animations: 'disabled', path: info.outputPath('carbon-protein-bent-webgl.png') });
  await btn(page, 'Ojenna mallia').press('Enter'); expect((await state(page)).model.residues).toEqual(bent.residues); await page.screenshot({ animations: 'disabled', path: info.outputPath('carbon-protein-webgl.png') }); await submit(page, ids[5]!); expect(errors).toEqual([]);
});
test('wrong model then guided recovery and adult written production preserve privacy and support', async ({ page }, info) => {
  test.setTimeout(90000); const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await open(page, ids[4]!, 1); await prepare(page, true); await submit(page, ids[4]!, false);
  await btn(page, 'Näytä ja selitä').press('Enter'); await btn(page, 'Uusi yhteinen kokeilu').press('Enter'); await prepare(page); await submit(page, ids[4]!); expect((await state(page)).progress.checked).toBe(false);
  await open(page, ids[6]!, 1); await prepare(page); await submit(page, ids[6]!, true, true, true); expect((await state(page)).renderer).toBe('webgl');
  const records = await ledger(page), own = records.attempts.at(-1); expect(own.assessor).toBe('adult'); expect(own.help).toContain('support'); expect(JSON.stringify(records)).not.toContain('CARBON_PRIVATE_2983'); expect(JSON.stringify(await state(page))).not.toContain('CARBON_PRIVATE_2983');
  await page.screenshot({ animations: 'disabled', path: info.outputPath('carbon-adult-webgl.png') }); expect(errors).toEqual([]);
});
test('adult criteria and controls fit both viewports while own evidence remains inspectable', async ({ page }, info) => {
  test.setTimeout(60000); await fallback(page);
  for (const viewport of [{ width: 1366, height: 768 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport); await page.goto('./'); await open(page, ids[6]!, 1); await prepare(page); await btn(page, 'Siirry omaan perusteluun').press('Enter');
    await btn(page, 'Näytä oma tutkimus').press('Enter'); await expect(btn(page, 'Palaa perusteluun')).toBeVisible(); await btn(page, 'Muokkaa omia rakennepiirteitä').press('Enter'); await expect(board(page).locator('select').first()).toBeDisabled(); await expect(board(page).locator('[data-carbon-navigation]').first()).toBeEnabled(); await btn(page, 'Palaa perusteluun').press('Enter');
    await btn(page, 'Olen kertonut selitykseni').press('Enter');
    await page.screenshot({ animations: 'disabled', path: info.outputPath(`carbon-adult-active-${viewport.width}.png`) });
    expect(await fit(page)).toEqual([]);
  }
});
