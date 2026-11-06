import { expect, test, type Page } from '@playwright/test';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });
test.use({ reducedMotion: 'reduce', launchOptions: { args: ['--enable-unsafe-swiftshader'] } });
const ids = ['ENV-CHEM-MATERIAL-ID-01', 'ENV-CHEM-MATERIAL-COMPARE-01', 'ENV-CHEM-MATERIAL-01', 'ENV-CHEM-PROP-01',
  'ENV-CHEM-STATE-01', 'ENV-CHEM-STATECHANGE-01', 'CHEM79-SUBSTANCE-01', 'CHEM79-PURE-MIX', 'CHEM79-MIX-HOM',
  'CHEM79-SOLUBILITY', 'CHEM79-WATERFAT-SOL', 'CHEM79-SOLUTION', 'CHEM79-SEPARATE-01', 'CHEM79-EVAPORATION', 'CHEM79-DECANTING', 'CHEM79-SEPARATE-02'] as const;
type State = { renderer: string; family: string; phase: string; progress: { checked: boolean }; model?: { operated: number; vessels: Vessel[] }; stage?: { operated: number; vessels: Vessel[] } };
type Parcel = { root: string; substance: string; massMg: number; phase: string; zone: string; grainUm?: number; volatile?: boolean };
type Vessel = { id: string; label: string; parcels: Parcel[] };
const state = (p: Page): Promise<State> => p.evaluate(() => JSON.parse((window as Window & { render_game_to_text(): string }).render_game_to_text()));
const btn = (p: Page, name: string) => p.getByRole('button', { name, exact: true });
const work = (p: Page) => p.locator('[data-mixture-workbench]');
const field = (p: Page, name: string) => work(p).getByRole('textbox', { name, exact: true });
const menu = (p: Page, name: string) => work(p).getByRole('combobox', { name, exact: true });
async function open(page: Page, id: typeof ids[number], seed = 7) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`./?qa=1&full=1&seed=${seed}#saaristo/${id}`); await btn(page, 'Kokeilen itse').click(); await expect(work(page)).toBeVisible();
}
const countAttempts = (p: Page) => p.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[]}').attempts.length as number);
async function adult(page: Page, helped = false) {
  await btn(page, 'Olen kertonut selitykseni').press('Enter');
  const before = await countAttempts(page);
  await btn(page, 'Vahvista havainto').press('Enter'); expect(await countAttempts(page)).toBe(before);
  // A deliberate test fixture. Automated clicks are not a real adult's semantic observation.
  for (const control of await page.locator('[data-explanation-adult] select').all()) await control.selectOption(await control.getAttribute('aria-label') === 'Saiko oppija apua?' ? helped ? 'helped' : 'none' : 'met');
  if (helped) {
    await page.getByText('Tallennus ja vapaa palaute', { exact: true }).click();
    await page.getByRole('textbox', { name: 'Vapaa palaute tähän hetkeen', exact: true }).fill('SALAINEN PALAUTE 6532');
  }
  await page.locator('[data-explanation-adult] input[type=checkbox]').check();
  await btn(page, 'Vahvista havainto').press('Enter');
}
async function solve(page: Page, wrong: boolean | 'prose' = false, helped = false) {
  const mode = await work(page).getAttribute('data-mixture-workbench');
  if (mode === 'materials') {
    const table = page.locator('[data-mixture-materials]');
    if (await table.count()) {
      const rows = await table.locator('tbody tr').evaluateAll(rows => rows.map(r => [...r.querySelectorAll('td')].map(c => c.textContent!)));
      for (const [label, absorption, , transmission] of rows) {
        const own = menu(page, `${label!.split(' · ')[0]} on`);
        if (await own.count()) await own.selectOption(Number(absorption) ? 'wood' : Number(transmission) ? 'glass' : 'metal');
      }
      if (await field(page, 'Suurimman ja pienimmän havainnon ero').count()) {
        const text = await page.locator('[data-mixture-givens]').innerText();
        const col = text.includes('ratkaisee tässä') ? /Valon läpäisy ratkaisee/.test(text) ? 3 : /Taipuma ratkaisee/.test(text) ? 2 : 1 : 1;
        const values = rows.map(r => Number(r[col])), wanted = col === 1 ? Math.min(...values) : Math.max(...values);
        await field(page, 'Suurimman ja pienimmän havainnon ero').fill(String(Math.max(...values) - Math.min(...values)));
        const choice = work(page).getByRole('combobox', { name: 'Valitse tarkoitukseen sopiva näyte', exact: true });
        await choice.selectOption(rows[values.indexOf(wanted)]![0]!.split(' · ')[0]!.replace('Pala ', ''));
      }
    }
    for (const control of await work(page).getByRole('combobox').all()) {
      const label = await control.getAttribute('aria-label');
      if (/Valosta/.test(label!)) await control.selectOption('transmission');
      if (/Samalla kuormalla/.test(label!)) await control.selectOption('bend');
      if (/koetin/.test(label!)) await control.selectOption('hardness');
      if (/minusta/.test(label!)) await control.selectOption('opinion');
    }
  }
  if (mode === 'levels') for (const [i, control] of (await work(page).getByRole('combobox').all()).entries()) await control.selectOption(['object', 'material', 'substance'][i]!);
  if (mode === 'state') {
    const rows = await page.locator('[data-mixture-states] tbody tr').evaluateAll(rows => rows.map(r => [...r.querySelectorAll('td')].map(c => c.textContent!)));
    for (const [label, behavior] of rows) {
      const name = label!.split(' · ')[1]!, phase = /oman muotonsa|^Muoto/.test(behavior!) ? 'solid' : /virtaa|^Virtaa/.test(behavior!) ? 'liquid' : 'gas';
      await menu(page, name).selectOption(phase);
      if (await menu(page, `${name}, tilavuus kevyessä puristuksessa`).count()) await menu(page, `${name}, tilavuus kevyessä puristuksessa`).selectOption(phase === 'gas' ? 'smaller' : 'same');
    }
  }
  if (mode === 'phase') {
    const text = await page.locator('[data-mixture-givens]').innerText(), mass = /lähtömassa (\d+) mg/.exec(text)![1]!;
    const pair = text.includes('Jäätä') ? ['solid', 'liquid', 'melting'] : text.includes('Vesihöyryä') ? ['gas', 'liquid', 'condensation'] : text.includes('haihtuu') ? ['liquid', 'gas', 'evaporation'] : ['liquid', 'solid', 'freezing'];
    await menu(page, 'Olomuoto ennen').selectOption(pair[0]!); await menu(page, 'Olomuoto jälkeen').selectOption(pair[1]!); await menu(page, 'Muutoksen nimi').selectOption(pair[2]!);
    await field(page, 'Saman aineen massa lopussa').fill(mass);
  }
  if (mode === 'composition') for (const card of await page.locator('[data-mixture-composition]').all()) {
    const text = await card.innerText(), label = text.split('\n')[0]!, count = [...text.matchAll(/\d+ malliosuutta/g)].length;
    await field(page, `${label}, kemiallisten aineiden määrä`).fill(String(count));
    const classification = menu(page, `${label}, luokitus`), options = await classification.locator('option').evaluateAll(os => os.map(o => o.getAttribute('value')));
    await classification.selectOption(options.includes('pure') ? count === 1 ? 'pure' : 'mixture' : /1 faasi/.test(text) ? 'homogeneous' : 'heterogeneous');
  }
  if (mode === 'dissolve') {
    const rows = await page.locator('[data-mixture-trials] tbody tr').evaluateAll(rows => rows.map(r => [...r.querySelectorAll('td')].map(c => c.textContent!)));
    const dissolved: number[] = [];
    for (const [name, solvent, dose, capacity] of rows) {
      const [label, substances] = name!.split(' · '), liquid = substances!.split(' + ')[0]!;
      const amount = Math.min(Number(dose), Number(capacity)); dissolved.push(amount);
      await field(page, `${label}, liuennut`).fill(String(amount)); await field(page, `${label}, liukenematta`).fill(String(Number(dose) - amount));
      await menu(page, `${label}, liuotin`).selectOption(liquid);
      if (label === 'Koe A' && await field(page, 'Kokeen A aineiden massa yhteensä').count()) await field(page, 'Kokeen A aineiden massa yhteensä').fill(String(Number(solvent) + Number(dose)));
    }
    await menu(page, 'Enemmän ainetta liuennut').selectOption(dissolved[0] === dissolved[1] ? 'equal' : dissolved[0]! > dissolved[1]! ? 'a' : 'b');
    if (await menu(page, 'Kirkas liuososa on').count()) await menu(page, 'Kirkas liuososa on').selectOption('homogeneous');
  }
  if (mode === 'separate') {
    const original = (await state(page)).model?.vessels;
    // 2D plan cards use the same visible information, without needing a 3D projector.
    const panels = work(page).locator('[data-mixture-station-work]');
    for (const panel of await panels.all()) {
      const id = await panel.getAttribute('data-mixture-station-work'), label = `Piste ${id!.toUpperCase()}`;
      if (await btn(page, label).count()) await btn(page, label).press('Enter');
      const text = await panel.locator('[data-mixture-station]').innerText();
      const method = text.includes('Laskeutunut ja') ? 'decant' : text.includes('Liuennut aine ei haihdu') ? 'evaporate' : 'filter';
      const parcels = original?.find(v => v.id === id)?.parcels ?? [...text.matchAll(/(?:^|; )(.*?) (\d+) mg · (.*?)(?=;|\n|$)/gm)].map((m, i) => ({
        root: `${id}:${i === 0 ? 'water' : /liuennut/.test(m[3]!) ? 'sugar' : 'grain'}`, substance: m[1]!, massMg: Number(m[2]),
        phase: /haihtuva neste/.test(m[3]!) ? 'liquid' : 'solid', zone: /liuennut/.test(m[3]!) ? 'dissolved' : 'bulk', grainUm: Number(/rae (\d+)/.exec(m[3]!)?.[1]), volatile: /haihtuva neste/.test(m[3]!),
      }));
      const targetName = /tavoite (.*?) →/.exec(text)![1]!, target = parcels.find(p => p.substance === targetName)!;
      const output = (p: Parcel) => method === 'evaporate' ? p.volatile ? p.massMg : 0 : method === 'decant' ? p.phase === 'liquid' || p.zone === 'dissolved' ? p.massMg * 3 / 4 : 0 : p.zone !== 'dissolved' && p.phase === 'solid' && p.grainUm! > 20 ? 0 : p.massMg;
      const targetAmount = text.split('\n')[0]!.includes('jäännösastia') ? target.massMg - output(target) : output(target);
      const solvent = parcels.find(p => p.phase === 'liquid')!, solute = parcels.find(p => p.zone === 'dissolved');
      await expect(menu(page, `${label}, menetelmä`)).toBeEnabled({ timeout: 3000 });
      await menu(page, `${label}, menetelmä`).selectOption(method, { timeout: 3000 });
      await field(page, `${label}, tavoiteastian kohdeaine`).fill(String(targetAmount));
      await field(page, `${label}, muissa astioissa kohdeainetta`).fill(String(target.massMg - targetAmount));
      await field(page, `${label}, siirtynyt liuotin`).fill(String(output(solvent)));
      await field(page, `${label}, siirtynyt alun liuennut aine`).fill(String(solute ? output(solute) : 0));
      await field(page, `${label}, jäännöksen kokonaismassa`).fill(String(parcels.reduce((sum, p) => sum + p.massMg - output(p), 0)));
      if (method === 'decant') await menu(page, `${label}, käytettävä näyte`).selectOption('settled');
      if (wrong) await field(page, `${label}, siirtynyt liuotin`).fill('0');
      await btn(page, `Lukitse · ${label}`).press('Enter'); await btn(page, `Tee erotus · ${label}`).press('Enter');
    }
  } else {
    if (wrong) {
      const input = work(page).getByRole('textbox').first();
      if (await input.count()) await input.fill(wrong === 'prose' ? 'SALAINEN OMA AJATUS 7841' : '999999'); else await work(page).getByRole('combobox').first().selectOption({ index: 0 });
    }
    const lock = btn(page, 'Lukitse ennusteet');
    if (await lock.count()) {
      await lock.press('Enter');
      for (const control of await work(page).getByRole('button', { name: /^(Sekoita ·|Vaihda astia ·|Purista näytettä ·|Tee lämpötilakoe)/ }).all()) await control.press('Enter');
    }
  }
  await work(page).locator('[data-mixture-submit]').press('Enter');
  if (await btn(page, 'Olen kertonut selitykseni').count()) await adult(page, helped);
}

for (const viewport of [{ width: 1366, height: 768 }, { width: 768, height: 1024 }]) test(`all16 exact boards and controls ${viewport.width}`, async ({ page }) => {
  test.setTimeout(180000); await page.setViewportSize(viewport);
  await page.addInitScript(() => { const get = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (id, ...rest) {
    return /^webgl/.test(String(id)) ? null : Reflect.apply(get, this, [id, ...rest]);
  } as typeof get; });
  for (const id of ids) for (const seed of [1, 7]) {
    await open(page, id, seed);
    for (const control of await work(page).locator('input:visible,select:visible,button:visible').all()) {
      const box = await control.boundingBox(); expect(box!.height, id).toBeGreaterThanOrEqual(43); expect(box!.width, id).toBeGreaterThanOrEqual(43);
      expect(box!.x + box!.width, id).toBeLessThanOrEqual(viewport.width + 1); expect(box!.y + box!.height, id).toBeLessThanOrEqual(viewport.height + 1);
    }
    await page.screenshot({ path: test.info().outputPath(`${id}-${seed}-${viewport.width}.png`) });
    await solve(page); await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', 'true');
    await page.evaluate(() => localStorage.removeItem('sammakko-journey-3'));
  }
});

test('real WebGL conserving separation, wrong→help→guided and independent3+transfer with honest adult fixture', async ({ page }) => {
  test.setTimeout(180000); await page.setViewportSize({ width: 1366, height: 768 });
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await open(page, 'CHEM79-DECANTING'); await expect.poll(async () => (await state(page)).renderer).toBe('webgl');
  const initial = (await state(page)).model!.vessels.flatMap(v => v.parcels).reduce((a, p) => a + p.massMg, 0);
  await solve(page, true); await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', 'false');
  await btn(page, 'Näytä ja selitä').click(); await btn(page, 'Uusi yhteinen kokeilu').click();
  await solve(page); await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', 'true');
  const stage = (await state(page)).stage!;
  expect(stage.operated).toBe(1); expect(stage.vessels.some(v => v.id.endsWith(':output'))).toBe(true);
  expect(stage.vessels.flatMap(v => v.parcels).reduce((a, p) => a + p.massMg, 0)).toBeGreaterThan(0); expect(initial).toBeGreaterThan(0);
  await page.screenshot({ path: test.info().outputPath('decant-webgl.png') });
  await page.evaluate(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on'))); await open(page, 'CHEM79-SEPARATE-02', 1);
  for (let n = 0; n < 4; n++) {
    const before = await state(page); expect(before.phase).toBe(n === 3 ? 'transfer' : 'independent');
    await solve(page); await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', 'true');
    const snapshot = await state(page); expect(snapshot.model!.operated).toBe(3); expect(snapshot.stage!.operated).toBe(3);
    if (n < 3) await btn(page, n === 2 ? 'Kokeile uudessa tilanteessa' : 'Seuraava kokeilu').click();
  }
  expect((await state(page)).progress.checked).toBe(true);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3')!));
  expect(stored.attempts).toHaveLength(4); expect(stored.attempts.every((a: { assessor: string }) => a.assessor === 'adult')).toBe(true);
  expect(errors).toEqual([]);
});

test('adult incomplete review stays pending; assisted wrong observation persists without prose; fresh guided recovery stays supported', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.addInitScript(() => { const get = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (id, ...rest) {
    return /^webgl/.test(String(id)) ? null : Reflect.apply(get, this, [id, ...rest]);
  } as typeof get; });
  await open(page, 'ENV-CHEM-MATERIAL-COMPARE-01');
  await solve(page, 'prose', true); await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', 'false');
  const ledger = await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3')!));
  expect(ledger.attempts).toHaveLength(1); expect(ledger.attempts[0]).toMatchObject({ ok: false, assessor: 'adult' });
  expect(ledger.attempts[0].help).toContain('support'); expect(JSON.parse(ledger.attempts[0].resp).values.difference).toBe('');
  expect(JSON.stringify(ledger)).not.toMatch(/SALAINEN/); expect(JSON.stringify(await state(page))).not.toMatch(/SALAINEN/);
  await btn(page, 'Näytä ja selitä').click(); await btn(page, 'Uusi yhteinen kokeilu').click();
  await solve(page); await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', 'true');
  expect((await state(page)).progress.checked).toBe(false);
});
