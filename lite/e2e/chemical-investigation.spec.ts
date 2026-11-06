import { expect, test, type Page } from '@playwright/test';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });
test.use({ reducedMotion: 'reduce', launchOptions: { args: ['--enable-unsafe-swiftshader'] } });
const ids = ['CHEM79-LAB-01', 'CHEM79-MEAS-01', 'CHEM79-OBS-01', 'CHEM79-QUESTION-01', 'CHEM79-PLAN-01',
  'CHEM79-DATA-COLLECT', 'CHEM79-DATA-PRESENT', 'CHEM79-DATA-01', 'CHEM79-CONCLUSION', 'CHEM79-INVESTIGATION-EVAL', 'CHEM79-CONCL-01'] as const;
type Id = typeof ids[number];
type State = { phase: string; family: string; renderer: string; lastOk?: boolean; progress: { checked: boolean }; model?: Record<string, unknown>; stage?: Record<string, unknown> };
const snapshot = (p: Page): Promise<State> => p.evaluate(() => JSON.parse((window as Window & { render_game_to_text(): string }).render_game_to_text()));
const work = (p: Page) => p.locator('[data-inquiry-workbench]');
const givens = (p: Page) => p.locator('[data-inquiry-givens]');
const button = (p: Page, name: string) => p.getByRole('button', { name, exact: true });
const input = (p: Page, name: string) => p.getByRole('textbox', { name, exact: true });
const menu = (p: Page, name: string) => p.getByRole('combobox', { name, exact: true });
const ledger = (p: Page) => p.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[],"events":[]}'));
const number = (raw: string) => Number(raw.replace('−', '-').replace(',', '.'));
async function open(p: Page, id: Id, seed = 1) {
  await p.emulateMedia({ reducedMotion: 'reduce' }); await p.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await button(p, 'Kokeilen itse').press('Enter'); await expect(work(p)).toBeVisible();
}
async function adult(p: Page, written = false, helped = false) {
  if (written) {
    await button(p, 'Kirjoitan tähän').press('Enter');
    await input(p, 'Oma selitykseni').fill('OMA PAIKALLINEN TUOTOS 8731. Vertaan annettuja havaintoja, pidän olot samoina ja rajaan väitteen näihin näytteisiin.');
    await button(p, 'Olen kirjoittanut selitykseni').press('Enter');
  } else await button(p, 'Olen kertonut selitykseni').press('Enter');
  const before = (await ledger(p)).attempts.length;
  await button(p, 'Vahvista havainto').press('Enter'); expect((await ledger(p)).attempts.length).toBe(before);
  // Deliberate fixture for the adult interface. Browser automation cannot establish the meaning of a learner's explanation.
  for (const select of await p.locator('[data-explanation-adult] select').all()) await select.selectOption(await select.getAttribute('aria-label') === 'Saiko oppija apua?' ? helped ? 'helped' : 'none' : 'met');
  await p.locator('[data-explanation-adult] input[type=checkbox]').check();
  if (written) { await p.getByText('Tallennus ja vapaa palaute', { exact: true }).click(); await input(p, 'Vapaa palaute tähän hetkeen').fill('OMA PALAUTE 6259'); }
  await button(p, 'Vahvista havainto').press('Enter');
}
async function prepare(p: Page, wrong = false) {
  const mode = await work(p).getAttribute('data-inquiry-workbench');
  if (mode === 'tool') {
    const text = await givens(p).innerText(), requested = /Siirrettävä ([\d,]+) (µl|ml)/.exec(text)!;
    const ul = Math.round(number(requested[1]!) * (requested[2] === 'ml' ? 1000 : 1)), division = Number(/jakoväli enintään (\d+) µl/.exec(text)![1]);
    const rows = await p.locator('[data-inquiry-tools] tbody tr').evaluateAll(rows => rows.map(r => [...r.querySelectorAll('td')].map(td => td.textContent!)));
    const acceptable = rows.filter(r => /µl/.test(r[1]!) && Number(r[1]!.split(' ')[0]) >= ul && Number(r[2]!.split(' ')[0]) <= division && ul % Number(r[2]!.split(' ')[0]) === 0);
    const name = acceptable.at(-1)![0]!, option = await menu(p, 'Virtuaaliväline').locator('option').evaluateAll((os, name) => os.find(o => o.textContent === name)!.getAttribute('value')!, name);
    await menu(p, 'Virtuaaliväline').selectOption(option); await input(p, 'Siirrettävä annos, arvo').fill(String(ul)); await menu(p, 'Siirrettävä annos, yksikkö').selectOption('ul');
    await button(p, 'Ota annos välineeseen').press('Enter'); await button(p, 'Siirrä annos vastaanottajaan').press('Enter');
    await input(p, 'Oma lukema, arvo').fill(wrong ? '0' : `${ul}/1000`); await menu(p, 'Oma lukema, yksikkö').selectOption('ml');
  } else if (mode === 'measure') {
    const mass = (await givens(p).innerText()).includes('Virtuaalinen vaaka');
    await menu(p, 'Virtuaaliväline').selectOption(mass ? 'balance' : 'cylinder');
    if (mass) { await button(p, 'Aseta tyhjä astia').press('Enter'); await button(p, 'Taaraa').press('Enter'); await button(p, 'Lisää näyte').press('Enter'); }
    else { await button(p, 'Aseta vesinäyte').press('Enter'); await button(p, 'Aseta silmänkorkeus').press('Enter'); await menu(p, 'Meniskin lukukohta').selectOption(wrong ? 'edge' : 'bottom'); }
    await button(p, 'Ota lukema').press('Enter');
    if (mass) {
      const match = /^([−\d,.-]+) (mg|g)$/.exec((await p.locator('[data-inquiry-meter]').innerText()).trim())!;
      await input(p, 'Oma lukema, arvo').fill(wrong ? '0' : match[1]!); await menu(p, 'Oma lukema, yksikkö').selectOption(match[2]!);
    } else {
      const value = await p.locator('[data-inquiry-instrument] svg').evaluate(svg => {
        const path = svg.querySelector('[data-inquiry-volume-focus]')!.getAttribute('d')!.split(' '), y = Number(path[5]);
        const tick = [...svg.querySelectorAll('[data-inquiry-volume-tick]')].find(t => Math.abs(Number(t.getAttribute('y1')) - y) < 1e-6)!;
        return [...svg.querySelectorAll('text')].find(t => Number(t.getAttribute('x')) === 345 && Math.abs(Number(t.getAttribute('y')) - Number(tick.getAttribute('y1')) - 4) < 1e-6)!.textContent!;
      });
      await input(p, 'Oma lukema, arvo').fill(value); await menu(p, 'Oma lukema, yksikkö').selectOption('ml');
    }
  } else if (mode === 'observe') {
    for (const select of await work(p).getByRole('combobox').all()) {
      const label = await select.getAttribute('aria-label');
      if (label === 'Hyödyllinen lisänäyttö') await select.selectOption('compare-control');
      else await select.selectOption(/varmasti|todistaa/.test(label!) ? 'inference' : 'observation');
    }
  } else if (mode === 'design') {
    const temperature = /Vertailutasot ovat \d+ °C/.test(await givens(p).innerText());
    await menu(p, 'Vaihteleva tekijä').selectOption(temperature ? 'temperature' : 'solvent'); await menu(p, 'Havaittava vaste').selectOption('dissolved-mass');
    if (await input(p, 'Toistojen määrä').count()) {
      for (const checkbox of await work(p).getByRole('checkbox').all()) {
        const label = await checkbox.locator('..').innerText(); await checkbox.setChecked(!/Myös/.test(label));
      }
      await input(p, 'Toistojen määrä').fill('3');
    }
  } else if (mode === 'data') {
    for (const run of await work(p).getByRole('button', { name: /^Tee koe / }).all()) await run.press('Enter');
    const rows = await p.locator('[data-inquiry-original-log] tbody tr').evaluateAll(rs => rs.map(r => [...r.querySelectorAll('td')].map(c => c.textContent!)));
    for (const [name, condition, value] of rows) {
      const [id, source] = name!.split(' · ');
      await menu(p, `Rivi ${id}, alkuperäinen tunniste`).selectOption(source!); await menu(p, `Rivi ${id}, olosuhde`).selectOption(condition!);
      if (value === 'Puuttuu') await p.getByRole('checkbox', { name: `Rivi ${id}, lukema puuttuu`, exact: true }).check();
      else { await input(p, `Rivi ${id}, mittausarvo`).fill(value!); await menu(p, `Rivi ${id}, mittayksikkö`).selectOption('mg'); }
    }
    if (await button(p, '2 · Oma esitys').count()) {
      await button(p, '2 · Oma esitys').press('Enter');
      const numeric = rows.every(r => /°C/.test(r[1]!));
      await menu(p, 'Esitystapa').selectOption(numeric ? 'scatter' : 'bar'); await menu(p, 'Esityksen yksikkö').selectOption('mg');
      await menu(p, 'Esityksen vaaka-akseli').selectOption(numeric ? 'temperature' : 'solvent'); await menu(p, 'Esityksen pystyakseli').selectOption('dissolved-mass');
      const maximum = Math.max(1000, ...rows.map(r => /^\d+$/.test(r[2]!) ? Number(r[2]) : 0)), top = Math.ceil(maximum / 500) * 500 + 500;
      await input(p, 'Asteikon alku').fill('0'); await input(p, 'Asteikon loppu').fill(String(top)); await input(p, 'Asteikon jakoväli').fill('500');
      for (const [name, , value] of rows) {
        const id = name!.split(' · ')[0]!;
        if (value === 'Puuttuu') await p.getByRole('checkbox', { name: `Esityksen arvo ${id} puuttuu`, exact: true }).check(); else await input(p, `Esityksen arvo ${id}`).fill(value!);
      }
      if (await menu(p, 'Esityksen osoitettu rivi').count()) {
        const [name] = rows.find(r => r[2] !== 'Puuttuu')!, [id, source] = name!.split(' · ');
        await menu(p, 'Esityksen osoitettu rivi').selectOption(id!); await menu(p, 'Osoitetun arvon alkuperä').selectOption(source!);
      }
    }
  } else if (mode === 'conclude') {
    const rows = await givens(p).locator('[data-inquiry-conclusions] tbody tr').evaluateAll(rs => rs.map(r => [...r.querySelectorAll('td')].map(c => c.textContent!)));
    const all = rows.map(r => r[2]).join(' '), issue = /etiketti/.test(all) ? 'label' : /lämpötila vaihtui/.test(all) ? 'temperature' : /puuttuu/.test(all) ? 'missing' : /epävarmuus/.test(all) ? 'overlap' : 'none';
    if (await input(p, 'Havainnon B ja A erotus').count()) {
      await p.getByRole('checkbox', { name: 'Päätelmän havainto A', exact: true }).check(); await p.getByRole('checkbox', { name: 'Päätelmän havainto B', exact: true }).check();
      await input(p, 'Havainnon B ja A erotus').fill(String(BigInt(rows[1]![1]!) - BigInt(rows[0]![1]!)));
      await menu(p, 'Aineiston vastaus kysymykseen').selectOption(issue === 'none' ? 'supports' : 'inconclusive');
    }
    if (await menu(p, 'Perusteltu seuraava tutkimustoimi').count()) {
      if (issue !== 'none') await p.getByRole('checkbox', { name: 'Epävarma havainto B', exact: true }).check();
      if (issue === 'overlap') await p.getByRole('checkbox', { name: 'Epävarma havainto A', exact: true }).check();
      await menu(p, 'Perusteltu seuraava tutkimustoimi').selectOption({ none: 'keep-method', label: 'repeat-labelled', temperature: 'control-temperature', missing: 'recover-or-repeat', overlap: 'more-precise' }[issue]);
    }
  }
}
async function solve(p: Page, options: { wrong?: boolean; written?: boolean; helped?: boolean; audit?(): Promise<void> } = {}) {
  await prepare(p, options.wrong); await options.audit?.(); await work(p).locator('[data-inquiry-submit]').press('Enter');
  if (await button(p, 'Olen kertonut selitykseni').count()) await adult(p, options.written, options.helped);
}
async function fallback(p: Page) {
  await p.addInitScript(() => { const get = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (id, ...rest) { return /^webgl/.test(String(id)) ? null : Reflect.apply(get, this, [id, ...rest]); } as typeof get; });
}
for (const viewport of [{ width: 1366, height: 768 }, { width: 768, height: 1024 }]) test(`all11 two-family essential values and controls ${viewport.width}`, async ({ page }) => {
  test.setTimeout(180000); await page.setViewportSize(viewport); await fallback(page);
  for (const id of ids) for (const seed of [1, 7]) {
    await open(page, id, seed);
    for (const control of await work(page).locator('input:visible:not([type=checkbox]),select:visible,button:visible').all()) {
      const box = await control.boundingBox(); expect(box!.height, id).toBeGreaterThanOrEqual(43); expect(box!.width, id).toBeGreaterThanOrEqual(43);
      expect(box!.x + box!.width, id).toBeLessThanOrEqual(viewport.width + 1); expect(box!.y + box!.height, id).toBeLessThanOrEqual(viewport.height + 1);
    }
    await page.screenshot({ path: test.info().outputPath(`${id}-${seed}-${viewport.width}.png`) });
    await solve(page, { audit: async () => {
      for (const control of await work(page).locator('input:visible:not([type=checkbox]),select:visible,button:visible').all()) {
        const box = await control.boundingBox(); expect(box!.height, `${id} active`).toBeGreaterThanOrEqual(43); expect(box!.width, `${id} active`).toBeGreaterThanOrEqual(43);
        expect(box!.x + box!.width, `${id} active`).toBeLessThanOrEqual(viewport.width + 1); expect(box!.y + box!.height, `${id} active`).toBeLessThanOrEqual(viewport.height + 1);
      }
      await page.screenshot({ path: test.info().outputPath(`${id}-${seed}-${viewport.width}-active.png`) });
    } }); await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', 'true');
    await page.evaluate(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on')));
  }
});

test('real WebGL tool conservation and meniscus wrong→help→guided recovery', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 }); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await open(page, 'CHEM79-LAB-01', 7); expect((await snapshot(page)).renderer).toBe('webgl');
  const start = (await snapshot(page)).stage!.transfer as { sourceUl: number };
  await solve(page); await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', 'true');
  const end = (await snapshot(page)).stage!.transfer as { sourceUl: number; heldUl: number; receiverUl: number };
  expect(end.sourceUl + end.heldUl + end.receiverUl).toBe(start.sourceUl); expect(end.heldUl).toBe(0);
  await open(page, 'CHEM79-MEAS-01', 1); const initial = await snapshot(page); expect(initial.model).not.toHaveProperty('liquid');
  await menu(page, 'Virtuaaliväline').selectOption('cylinder');
  await button(page, 'Aseta vesinäyte').press('Enter'); await button(page, 'Aseta silmänkorkeus').press('Enter');
  const unread = await snapshot(page);
  expect(JSON.stringify(unread.model)).not.toMatch(/volumeUl|heightFraction|edgeFraction|readingMg|pointer/);
  expect(JSON.stringify(unread.stage)).not.toMatch(/volumeUl|heightFraction|edgeFraction|readingMg|pointer/);
  expect((await ledger(page)).attempts).toHaveLength(1);
  await button(page, 'Ota lukema').press('Enter');
  expect((await snapshot(page)).stage!.liquid).toHaveProperty('volumeUl');
  await solve(page, { wrong: true }); await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', 'false');
  await button(page, 'Näytä ja selitä').click(); await button(page, 'Uusi yhteinen kokeilu').click(); await solve(page); await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', 'true');
  await page.screenshot({ path: test.info().outputPath('measuring-recovery-webgl.png') }); expect(errors).toEqual([]);
});

test('fresh3+transfer data integration retains source observations and coherent graph', async ({ page }) => {
  test.setTimeout(120000); await fallback(page); await open(page, 'CHEM79-DATA-01', 1);
  for (let n = 0; n < 4; n++) {
    expect((await snapshot(page)).phase).toBe(n === 3 ? 'transfer' : 'independent'); await solve(page); await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', 'true');
    if (n < 3) await button(page, n === 2 ? 'Kokeile uudessa tilanteessa' : 'Seuraava kokeilu').click();
  }
  expect((await snapshot(page)).progress.checked).toBe(true); const saved = await ledger(page);
  expect(saved.attempts).toHaveLength(4); expect(new Set(saved.attempts.map((a: { itemKey: string }) => a.itemKey)).size).toBe(4);
  expect(saved.attempts.every((a: { node: string; ok: boolean }) => a.node === 'CHEM79-DATA-01' && a.ok)).toBe(true);
});

test('written original production stays local, pending is neutral and explicit assistance keeps evidence guided', async ({ page }) => {
  await fallback(page); await open(page, 'CHEM79-CONCL-01', 1); await solve(page, { written: true, helped: true });
  await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', 'true'); const saved = await ledger(page);
  expect(saved.attempts).toHaveLength(1); expect(saved.attempts[0].assessor).toBe('adult'); expect(saved.attempts[0].help).toContain('support');
  expect(JSON.parse(saved.attempts[0].resp).review.channel).toBe('written'); expect(JSON.stringify(saved)).not.toMatch(/OMA PAIKALLINEN|OMA PALAUTE/);
  expect(JSON.stringify(await snapshot(page))).not.toMatch(/OMA PAIKALLINEN|OMA PALAUTE/); expect((await snapshot(page)).progress.checked).toBe(false);
  await expect(page.locator('textarea[aria-label="Oma selitykseni"]')).toBeDisabled();
});

test('observation pictures retain authored bubble/color/precipitate givens across both viewports and transfer', async ({ page }) => {
  test.setTimeout(120000); await fallback(page);
  for (const viewport of [{ width: 1366, height: 768 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport); await page.goto('./'); await page.evaluate(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on')));
    await open(page, 'CHEM79-OBS-01', 1); const features = new Set<string>();
    for (let i = 0; i < 4; i++) {
      const picture = page.locator('[data-inquiry-observation-picture]'); await expect(picture).toBeVisible();
      const feature = (await picture.getAttribute('data-inquiry-observation-picture'))!; features.add(feature);
      const original = await givens(page).innerText();
      if (feature === 'colour') {
        const match = /värilukema muuttuu (\d+):stä (\d+):een/.exec(original)!;
        expect(await picture.innerHTML()).toContain(`Värikoodi ${match[1]}`); expect(await picture.innerHTML()).toContain(`Värikoodi ${match[2]}`);
      } else {
        const count = Number(/(\d+) piirrettyä/.exec(original)![1]);
        await expect(picture.locator('[data-inquiry-observed-marker]')).toHaveCount(count);
      }
      await solve(page, { audit: async () => {
        for (const control of await work(page).locator('select:visible,button:visible').all()) {
          const box = await control.boundingBox(); expect(box!.height).toBeGreaterThanOrEqual(43); expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
        }
        await page.screenshot({ path: test.info().outputPath(`OBS-${feature}-${viewport.width}.png`) });
      } });
      await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', 'true');
      if (i < 3) await button(page, i === 2 ? 'Kokeile uudessa tilanteessa' : 'Seuraava kokeilu').press('Enter');
    }
    expect(features).toEqual(new Set(['bubble', 'colour', 'precipitate'])); expect((await snapshot(page)).progress.checked).toBe(true);
  }
});
