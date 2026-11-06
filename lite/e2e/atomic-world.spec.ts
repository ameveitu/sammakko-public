import { expect, test, type Page } from '@playwright/test';
import { atomicWorldSpecs } from '../src/content/atomic-world';
import { rng } from '../src/engine/rng';
import type { AtomicWorldTask } from '../src/content/models/atomic-world';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });
test.use({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce', launchOptions: { args: ['--enable-unsafe-swiftshader'] } });
const b = (p: Page, name: string) => p.getByRole('button', { name, exact: true });
const f = (p: Page, name: string) => p.getByLabel(name, { exact: true });
const state = (p: Page) => p.evaluate(() => JSON.parse(window.render_game_to_text!()));
const symbols = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca'];
const ids = ['ATOM-01', 'ATOM-NUCLEUS', 'ATOMICNUM', 'COMP-MODEL', 'COMPOUND', 'ELECTRON', 'ELEM-PROP', 'ELEMENT', 'MODEL-01', 'NEUTRON', 'PERIOD-GROUP', 'PERIODIC-01', 'PROTON', 'SCALE', 'STATE-01', 'STATECHANGE', 'STRUCTURE-MODEL-USE'].map(s => 'CHEM79-' + s);
test.beforeEach(async ({ page }, info) => { await page.addInitScript(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on'))); if (!info.title.includes('WebGL'))
    await page.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) { return /^webgl/.test(type) ? null : Reflect.apply(original, this, [type, ...args]); } as typeof original; }); });
async function begin(p: Page, id: string, seed = 1, guided = false) { await p.goto(`./?qa=1&full=1&seed=${seed}#saaristo/${id}`); await b(p, guided ? 'Tutkitaan yhdessä' : 'Kokeilen itse').click(); await p.locator('[data-atomic-workshop]').waitFor(); }
async function adult(p: Page, assistance = 'none') {
    await b(p, 'Olen kertonut selitykseni').click();
    const selects = p.locator('[data-explanation-adult] select');
    for (const select of await selects.all())
        await select.selectOption(await select.getAttribute('aria-label') === 'Saiko oppija apua?' ? assistance : 'met');
    await p.getByText('Kuulin oppijan oman selityksen.', { exact: true }).click();
    await b(p, 'Vahvista havainto').click();
}
async function numberAnswer(p: Page) {
    const atoms = p.locator('[data-atomic-atom]');
    for (const panel of await atoms.all()) {
        const id = (await panel.getAttribute('data-atomic-atom'))!, count = await panel.locator('svg text').evaluateAll(nodes => nodes.filter(n => n.textContent === '+').length);
        await f(p, `Malli ${id} järjestysluku`).fill(`${count * 2}/2`);
        await f(p, `Malli ${id} alkuaine`).selectOption(symbols[count - 1]!);
    }
}
async function moleculeAnswer(p: Page, omit = false) {
    const source = await p.locator('[data-atomic-board]').innerText(), matches = [...source.matchAll(/([A-Z][a-z]?) × (\d+)/g)], valences = Object.fromEntries([...source.matchAll(/([A-Z][a-z]?), sidosten kertalukusumma (\d+)/g)].map(m => [m[1]!, Number(m[2])]));
    const selected: {
        id: string;
        symbol: string;
    }[] = [];
    for (const m of matches) {
        const symbol = m[1]!, count = Number(m[2]), buttons = p.getByRole('button', { name: new RegExp(`^Valitse atomi ${symbol}\\d+$`) }), pool = await buttons.all();
        for (const button of pool.slice(-count)) {
            const id = (await button.getAttribute('aria-label'))!.replace('Valitse atomi ', '');
            await button.click();
            selected.push({ id, symbol });
        }
    }
    const center = selected.find(a => valences[a.symbol]! > 1)!;
    let skipped = false;
    for (const atom of selected.filter(a => a !== center)) {
        if (omit && !skipped) {
            skipped = true;
            continue;
        }
        await f(p, 'Sidoksen ensimmäinen atomi').selectOption(atom.id);
        await f(p, 'Sidoksen toinen atomi').selectOption(center.id);
        await f(p, 'Sidoksen kertaluku').selectOption(String(valences[atom.symbol]));
        await b(p, 'Lisää sidos').press('Enter');
    }
}
async function lattice(p: Page, prefix = 'k') {
    const options = await f(p, `${prefix} hilan paikka`).locator('option').evaluateAll(nodes => nodes.filter(n => (n as HTMLOptionElement).value).map(n => ({ id: (n as HTMLOptionElement).value, label: n.textContent! }))), source = await p.locator('[data-atomic-board]').innerText(), species = source.includes('MgO') ? ['Mg', 'O'] : ['Na', 'Cl'];
    for (const option of options) {
        const coords = /\((\d+),(\d+),(\d+)\)/.exec(option.label)!, sum = Number(coords[1]) + Number(coords[2]) + Number(coords[3]);
        await f(p, `${prefix} hilan paikka`).selectOption(option.id);
        await f(p, `${prefix} ionilaji`).selectOption(species[sum % 2]!);
        await b(p, 'Sijoita hilan osa').press('Enter');
    }
    await f(p, `${prefix} selitysmalli`).selectOption('structure');
    await f(p, `${prefix} ovatko pallot ja tikut kirjaimellisia?`).selectOption('no');
    if (await b(p, 'Siirrä rakennettu kerros').count())
        await b(p, 'Siirrä rakennettu kerros').click();
}
async function phaseAnswer(p: Page) {
    const source = await p.locator('[data-atomic-board]').innerText(), initial = /Sali A · vesi H2O · (\d+) rakenneosaa · (-?\d+) °C/.exec(source)!, temperature = Number(initial[2]), phase = temperature < 0 ? 'solid' : temperature > 100 ? 'gas' : 'liquid';
    await f(p, 'A olomuoto').selectOption(phase);
    await f(p, 'A liike').selectOption(phase === 'solid' ? 'vibrate' : phase === 'liquid' ? 'slide' : 'free');
    await f(p, 'A hiukkasvälit').selectOption(phase === 'solid' ? 'open' : phase === 'liquid' ? 'near' : 'far');
    await f(p, 'Muuttuuko hiukkasen oma koko?').selectOption('same');
    const after = source.includes('lämmitä vesi höyryksi') ? 'gas' : 'liquid';
    await f(p, 'Oma muutoksen jälkeinen olomuoto').selectOption(after);
    await f(p, 'Muutoksen jälkeinen hiukkaslaji').selectOption('same');
    await f(p, 'Muutoksen jälkeinen rakenneosien määrä').fill(initial[1]!);
    await expect(b(p, 'Suorita muutoksen alku')).toBeDisabled();
    await b(p, 'Lukitse oma ennuste').press('Enter');
    await expect(f(p, 'Oma muutoksen jälkeinen olomuoto')).toBeDisabled();
    await b(p, 'Suorita muutoksen alku').press('Enter');
    await b(p, 'Suorita muutos loppuun').press('Enter');
}
async function success(p: Page, hasAdult = false) { await b(p, 'Tarkista tutkimusikkuna').click(); if (hasAdult)
    await adult(p); await expect.poll(async () => (await state(p)).lastOk).toBe(true); }
async function next(p: Page, i: number) { if (i < 2)
    await b(p, 'Seuraava kokeilu').click();
else if (i === 2)
    await b(p, 'Kokeile uudessa tilanteessa').click(); }
test('all17 two families retain visible givens and essential controls at both viewports', async ({ page }) => {
    test.setTimeout(480000);
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const [width, height] of [[1366, 768], [768, 1024], [1024, 768]])
        for (const id of ids)
            for (const seed of [0, 1]) {
                await page.setViewportSize({ width, height });
                await begin(page, id, seed, true);
                for (const target of [page.locator('[data-atomic-board]'), b(page, 'Tarkista tutkimusikkuna'), ...await page.locator('[data-atomic-workshop] select:visible,[data-atomic-workshop] input:visible').all()]) {
                    const box = await target.boundingBox();
                    expect.soft(box, `${id}/${seed}/${width}`).not.toBeNull();
                    expect(box!.x, `${id} x`).toBeGreaterThanOrEqual(0);
                    expect(box!.x + box!.width, `${id} width`).toBeLessThanOrEqual(width);
                    expect(box!.y, `${id} top`).toBeGreaterThanOrEqual(0);
                    expect.soft(box!.y + box!.height, `${id}/${seed}/${width} bottom`).toBeLessThanOrEqual(height);
                }
                if (seed === 1 && ['CHEM79-STATECHANGE', 'CHEM79-COMP-MODEL', 'CHEM79-MODEL-01', 'CHEM79-ATOM-NUCLEUS'].includes(id))
                    await page.screenshot({ path: `output/playwright/atomic-world/${id}-${width}.png`, animations: 'disabled' });
            }
    expect(errors).toEqual([]);
});
test('atomic number accepts independent counts and neutron variant across3fresh and transfer', async ({ page }) => {
    await begin(page, 'CHEM79-ATOMICNUM');
    for (let i = 0; i < 4; i++) {
        await numberAnswer(page);
        await success(page);
        await next(page, i);
    }
    expect((await state(page)).progress.checked).toBe(true);
});
test('own molecule bonds reject missing connection then recover with named support', async ({ page }) => {
    await begin(page, 'CHEM79-COMP-MODEL', 0);
    await moleculeAnswer(page, true);
    await b(page, 'Tarkista tutkimusikkuna').click();
    expect((await state(page)).answered).toBe(false);
    await adult(page, 'helped');
    expect((await state(page)).lastOk).toBe(false);
    await b(page, 'Uusi kokeilu').click();
    await b(page, 'Pieni vihje').click();
    if (await f(page, 'Hilan paikka').count()) {
        const opts = await f(page, 'Hilan paikka').locator('option').evaluateAll(nodes => nodes.filter(n => (n as HTMLOptionElement).value).map(n => ({ id: (n as HTMLOptionElement).value, text: n.textContent! })));
        const species = (await page.locator('[data-atomic-board]').innerText()).includes('MgO') ? ['Mg', 'O'] : ['Na', 'Cl'];
        for (const o of opts) {
            const c = /\((\d+),(\d+),(\d+)\)/.exec(o.text)!;
            await f(page, 'Hilan paikka').selectOption(o.id);
            await f(page, 'Paikan ionilaji').selectOption(species[(Number(c[1]) + Number(c[2]) + Number(c[3])) % 2]!);
            await b(page, 'Sijoita oma osa').press('Enter');
        }
    }
    else
        await moleculeAnswer(page);
    await success(page, true);
    expect((await state(page)).progress.checked).toBe(false);
});
test('WebGL phase transition locks forecast and conserves the H2O model through genuine controls', async ({ page }) => {
    test.setTimeout(90000);
    await begin(page, 'CHEM79-STATECHANGE');
    expect((await state(page)).renderer).toBe('webgl');
    const pause = b(page, 'Pysäytä maiseman liike');
    if (await pause.isVisible() && await pause.isEnabled())
        await pause.click();
    for (let i = 0; i < 4; i++) {
        await phaseAnswer(page);
        const snapshot = await state(page);
        expect(snapshot.model.observed).toBe(true);
        expect(snapshot.model.view).toBe('after');
        expect(JSON.stringify(snapshot.model)).not.toContain('temperatureC');
        await success(page, true);
        if (i === 3)
            await page.screenshot({ path: 'output/playwright/atomic-world/water-condensation-WebGL.png', animations: 'disabled' });
        await next(page, i);
    }
    expect((await state(page)).progress.checked).toBe(true);
});
test('integration requires own structure plus own particle experiment and private adult handoff', async ({ page }) => {
    test.setTimeout(120000);
    await begin(page, 'CHEM79-MODEL-01');
    await lattice(page);
    const source = await page.locator('[data-atomic-board]').innerText(), count = /Hiukkasikkuna · (\d+) argonatomia/.exec(source)![1]!;
    await f(page, 'Liikeikkunan selitysmalli').selectOption('particle');
    await f(page, 'Liikeikkunan oma ennuste').selectOption(source.includes('avaa väliseinä') ? 'spread' : 'faster');
    await f(page, 'Liikeikkunan säilyvä lukumäärä').fill(count);
    await b(page, 'Lukitse liike-ennuste').click();
    await b(page, 'Suorita hiukkaskoe').click();
    await b(page, 'Tarkista tutkimusikkuna').click();
    expect((await state(page)).answered).toBe(false);
    await b(page, 'Olen kertonut selitykseni').click();
    await page.getByText('Tallennus ja vapaa palaute', { exact: true }).click();
    const secret = 'PRIVATE_ATOMIC_NOTE72';
    await f(page, 'Vapaa palaute tähän hetkeen').fill(secret);
    const selects = page.locator('[data-explanation-adult] select');
    for (const select of await selects.all())
        await select.selectOption(await select.getAttribute('aria-label') === 'Saiko oppija apua?' ? 'helped' : 'met');
    await page.getByText('Kuulin oppijan oman selityksen.', { exact: true }).click();
    await b(page, 'Vahvista havainto').click();
    expect((await state(page)).lastOk).toBe(true);
    expect((await state(page)).progress.checked).toBe(false);
    expect(JSON.stringify(await state(page))).not.toContain(secret);
    expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(secret);
});
test('worked explanation uses human model steps and never JSON task keys', async ({ page }) => {
    await begin(page, 'CHEM79-ATOMICNUM');
    const id = (await page.locator('[data-atomic-atom]').first().getAttribute('data-atomic-atom'))!;
    await f(page, `Malli ${id} järjestysluku`).fill('0');
    await b(page, 'Tarkista tutkimusikkuna').click();
    expect((await state(page)).lastOk).toBe(false);
    await b(page, 'Näytä ja selitä').click();
    const text = await page.locator('[data-atomic-worked]').innerText();
    expect(text).toContain('Protonien määrä');
    expect(text).not.toContain('"mode"');
    expect(text).not.toContain('"locked"');
    expect((await state(page)).progress.checked).toBe(false);
    await page.screenshot({ path: 'output/playwright/atomic-world/worked-counting.png', animations: 'disabled' });
});
/** Read the reproducible authored givens. The expected relations below are independently calculated. */
async function givenTask(p: Page): Promise<AtomicWorldTask> { const s = await state(p); return atomicWorldSpecs.find(n => n.id === s.node)!.item(rng(s.seed), s.phase).task as AtomicWorldTask; }
const table = [['H', 1, 1, 1], ['He', 2, 18, 1], ['Li', 3, 1, 2], ['Be', 4, 2, 2], ['B', 5, 13, 2], ['C', 6, 14, 2], ['N', 7, 15, 2], ['O', 8, 16, 2], ['F', 9, 17, 2], ['Ne', 10, 18, 2], ['Na', 11, 1, 3], ['Mg', 12, 2, 3], ['Al', 13, 13, 3], ['Si', 14, 14, 3], ['P', 15, 15, 3], ['S', 16, 16, 3], ['Cl', 17, 17, 3], ['Ar', 18, 18, 3], ['K', 19, 1, 4], ['Ca', 20, 2, 4], ['Br', 35, 17, 4], ['Kr', 36, 18, 4], ['Rb', 37, 1, 5], ['I', 53, 17, 5], ['Xe', 54, 18, 5], ['Cs', 55, 1, 6]] as const;
async function completeGivens(p: Page, t: AtomicWorldTask, submit = true) {
    const choose = async (name: string, value: string) => f(p, name).selectOption(value), fill = async (name: string, value: number | string) => f(p, name).fill(String(value));
    if (t.mode === 'atom') {
        if (t.activity === 'number')
            await numberAnswer(p);
        else if (t.activity === 'link') {
            await choose('Näytettä edustava atomi', t.atoms.find(a => a.symbol === t.sample!.symbol)!.id);
            await fill('Mallin atomien kokonaismäärä', t.sample!.units * t.sample!.atomsPerUnit);
            await choose('Yksi laskettava atomi on', 'atom');
            await choose('Märkyys tai kiinteys kuuluu', 'sample');
        }
        else if (t.activity === 'regions') {
            await choose('Alue A nimi', 'nucleus');
            await choose('Alue B nimi', 'cloud');
            await choose('Ovatko mittasuhteet kirjaimelliset?', 'no');
            if (t.comparison) {
                const a = t.atoms[0]!, c = t.comparison;
                await choose('Ovatko ikkunoissa samat hiukkasmäärät?', a.protons === c.protons && a.neutrons === c.neutrons && a.electrons === c.electrons ? 'yes' : 'no');
            }
        }
        else
            for (const a of t.atoms) {
                await choose(`Malli ${a.id} hiukkanen`, t.particle!);
                await fill(`Malli ${a.id} varaus`, t.particle === 'proton' ? 1 : t.particle === 'electron' ? -1 : 0);
                await choose(`Malli ${a.id} sijainti`, t.particle === 'electron' ? 'cloud' : 'nucleus');
            }
    }
    else if (t.mode === 'sample') {
        for (const s of t.samples) {
            const atoms = new Set(s.species.flatMap(sp => sp.atoms)), species = new Set(s.species.map(sp => sp.atoms.slice().sort().join('/') + '-' + sp.structure));
            await choose(`${s.id} aineen luokka`, species.size > 1 ? 'mixture' : atoms.size > 1 ? 'compound' : 'element');
            await fill(`${s.id} atomilajien määrä`, atoms.size);
            await fill(`${s.id} rakenneyksikköjen määrä`, s.species.reduce((a, sp) => a + sp.units, 0));
        }
    }
    else if (t.mode === 'build') {
        if (t.structure === 'molecule')
            await moleculeAnswer(p);
        else
            for (const site of t.sites) {
                await choose('Hilan paikka', site.id);
                await choose('Paikan ionilaji', t.species[(site.x + site.y + site.z) % 2]!);
                await b(p, 'Sijoita oma osa').press('Enter');
            }
    }
    else if (t.mode === 'periodic') {
        const row = table.find(e => e[0] === t.target)!;
        if (t.activity === 'order')
            for (const [i, s] of t.cards.slice().sort((a, b) => table.find(e => e[0] === a)![1] - table.find(e => e[0] === b)![1]).entries())
                await choose(`Järjestyspaikka ${i + 1}`, s);
        else {
            await choose('Kohteen alkuaine', row[0]);
            if (t.activity !== 'fill') {
                await fill('Kohteen ryhmä', row[2]);
                await fill('Kohteen jakso', row[3]);
            }
        }
    }
    else if (t.mode === 'property') {
        const melting: Record<string, number> = { Li: 180.5, Na: 97.794, K: 63.5, Rb: 39.3, Cs: 28.5 }, boiling: Record<string, number> = { He: -268.928, Ne: -246.046, Ar: -185.848, Kr: -153.415, Xe: -108.099 }, phases: Record<string, string> = { F: 'gas', Cl: 'gas', Br: 'liquid', I: 'solid' }, values = t.property === 'melting' ? melting : boiling;
        const forecast = t.property === 'state' ? phases[t.target]! : values[t.target]! < values[t.comparison]! ? 'lower' : values[t.target]! > values[t.comparison]! ? 'higher' : 'same';
        await choose('Oma ominaisuusennuste', forecast);
        await fill('Ennusteen ryhmä', t.group);
        await choose('Ennusteen vertailukortti', t.comparison);
        await expect(b(p, 'Avaa kohteen havainto')).toBeDisabled();
        await b(p, 'Lukitse oma ennuste').press('Enter');
        await b(p, 'Avaa kohteen havainto').press('Enter');
    }
    else if (t.mode === 'phase') {
        if (t.activity === 'change')
            await phaseAnswer(p);
        else {
            for (const c of t.chambers) {
                const phase = t.activity === 'construct' ? c.phase : c.substance === 'water' ? (c.temperatureC < 0 ? 'solid' : c.temperatureC > 100 ? 'gas' : 'liquid') : (c.temperatureC < -189.34 ? 'solid' : c.temperatureC > -185.848 ? 'gas' : 'liquid');
                if (t.activity !== 'construct')
                    await choose(`${c.id} olomuoto`, phase);
                await choose(`${c.id} liike`, phase === 'solid' ? 'vibrate' : phase === 'liquid' ? 'slide' : 'free');
                await choose(`${c.id} hiukkasvälit`, phase === 'gas' ? 'far' : phase === 'solid' && c.substance === 'water' ? 'open' : 'near');
            }
            await choose('Muuttuuko hiukkasen oma koko?', 'same');
        }
    }
    else if (t.mode === 'model-use') {
        await lattice(p);
        if (t.particle) {
            await choose('Liikeikkunan selitysmalli', 'particle');
            await choose('Liikeikkunan oma ennuste', t.particle.kind === 'diffusion' ? 'spread' : 'faster');
            await fill('Liikeikkunan säilyvä lukumäärä', t.particle.count);
            await b(p, 'Lukitse liike-ennuste').press('Enter');
            await b(p, 'Suorita hiukkaskoe').press('Enter');
        }
    }
    else {
        for (const [i, level] of ['macro', 'structure', 'particle'].entries())
            await choose(`Mittakaavan paikka ${i + 1}`, t.cards.find(c => c.level === level)!.id);
        for (const c of t.cards)
            await choose(`Ikkuna ${c.id} sama ilmiö`, t.phenomenon);
        await choose('Ensimmäinen selitysmalli', ['macro', 'structure', 'particle'].map(level => t.cards.find(c => c.level === level)!).find(c => c.source === 'model')!.id);
    }
    if (submit)
        await success(p, !!t.review);
}
test('all17 independently produced workflows achieve3fresh two families and changed transfer', async ({ page }) => {
    test.setTimeout(480000);
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const id of ids) {
        await begin(page, id);
        const families = new Set<string>();
        for (let i = 0; i < 4; i++) {
            const before = await state(page);
            if (i < 3)
                families.add(before.family);
            await completeGivens(page, await givenTask(page));
            await next(page, i);
        }
        expect(families.size, id).toBe(2);
        expect((await state(page)).progress.checked, id).toBe(true);
    }
    expect(errors).toEqual([]);
});
test('WebGL learner-selected atom connection labels and all seven primary models remain separate from debug answers', async ({ page }) => {
    test.setTimeout(120000);
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const id of ['ATOM-01', 'ATOM-NUCLEUS', 'COMP-MODEL', 'MODEL-01', 'STATE-01', 'STATECHANGE', 'STRUCTURE-MODEL-USE']) {
        await begin(page, 'CHEM79-' + id);
        expect((await state(page)).renderer).toBe('webgl');
        const pause = b(page, 'Pysäytä maiseman liike');
        // Keyboard activation: the landscape keeps moving under the button until it is paused, so a pointer click never sees a stable target.
        if (await pause.isVisible() && await pause.isEnabled())
            await pause.press('Enter');
        const model = (await state(page)).model;
        expect(model.observed).toBe(false);
        expect(model).not.toHaveProperty('atoms');
        expect(model).not.toHaveProperty('particles');
        expect(model).not.toHaveProperty('chambers');
        if (id === 'ATOM-01') {
            const t = await givenTask(page);
            if (t.mode !== 'atom')
                throw Error('Expected atom task');
            await f(page, 'Näytettä edustava atomi').selectOption(t.atoms.find(a => a.symbol === t.sample!.symbol)!.id);
            await page.screenshot({ path: 'output/playwright/atomic-world/learner-atom-link-WebGL.png', animations: 'disabled' });
            await completeGivens(page, t);
        }
        else if (id === 'COMP-MODEL') {
            await completeGivens(page, await givenTask(page));
            await page.screenshot({ path: 'output/playwright/atomic-world/learner-compound-WebGL.png', animations: 'disabled' });
        }
        else
            await page.screenshot({ path: `output/playwright/atomic-world/primary-${id}-WebGL.png`, animations: 'disabled' });
    }
    expect(errors).toEqual([]);
});
test('active construction and adult review retain source and44px actions at three sizes', async ({ page }) => {
    test.setTimeout(180000);
    for (const [width, height] of [[1366, 768], [768, 1024], [1024, 768]])
        for (const id of ['CHEM79-MODEL-01', 'CHEM79-STATECHANGE', 'CHEM79-COMP-MODEL']) {
            await page.setViewportSize({ width, height });
            await begin(page, id, 1);
            await completeGivens(page, await givenTask(page), false);
            await page.evaluate(() => window.scrollTo(0, 0));
            for (const target of [page.locator('[data-atomic-board]'), b(page, 'Tarkista tutkimusikkuna'), ...await page.locator('[data-atomic-workshop] input:visible,[data-atomic-workshop] select:visible,[data-atomic-workshop] button:visible').all()]) {
                const box = await target.boundingBox();
                expect(box, `${id}/${width}`).not.toBeNull();
                expect.soft(box!.y, `${id}/${width} top`).toBeGreaterThanOrEqual(0);
                expect.soft(box!.y + box!.height, `${id}/${width} active bottom`).toBeLessThanOrEqual(height);
                if (await target.evaluate(n => n.matches('select,button,input')))
                    expect.soft(box!.height, `${id}/${width} tap`).toBeGreaterThanOrEqual(44);
            }
            await page.screenshot({ path: `output/playwright/atomic-world/active-${id}-${width}.png`, animations: 'disabled' });
            await b(page, 'Tarkista tutkimusikkuna').click();
            await b(page, 'Olen kertonut selitykseni').click();
            await page.evaluate(() => window.scrollTo(0, 0));
            for (const target of [page.locator('[data-atomic-board]'), b(page, 'Vahvista havainto')]) {
                const box = await target.boundingBox();
                expect.soft(box!.y, `${id}/${width} adult top`).toBeGreaterThanOrEqual(0);
                expect.soft(box!.y + box!.height, `${id}/${width} adult bottom`).toBeLessThanOrEqual(height);
            }
            await page.screenshot({ path: `output/playwright/atomic-world/adult-${id}-${width}.png`, animations: 'disabled' });
        }
});

test('WebGL largest molecular bank keeps own bonds and source visible at all three sizes',async({page})=>{
 test.setTimeout(90000);
 const spec=atomicWorldSpecs.find(s=>s.id==='CHEM79-COMP-MODEL')!;
 const candidates=Array.from({length:160},(_,i)=>({seed:i,task:spec.item(rng(i),'independent').task as AtomicWorldTask})).filter((x):x is {seed:number;task:Extract<AtomicWorldTask,{structure:'molecule'}>}=>x.task.mode==='build'&&x.task.structure==='molecule').sort((a,b)=>b.task.bank.length-a.task.bank.length);
 await begin(page,'CHEM79-COMP-MODEL',candidates[0]!.seed);expect((await state(page)).renderer).toBe('webgl');const pause=b(page,'Pysäytä maiseman liike');if(await pause.isVisible()&&await pause.isEnabled())await pause.click();await moleculeAnswer(page);
 const lines=await page.locator('[data-atomic-preview] line[data-atomic-bond]').evaluateAll(nodes=>nodes.map(n=>({a:[Number(n.getAttribute('x1')),Number(n.getAttribute('y1'))],b:[Number(n.getAttribute('x2')),Number(n.getAttribute('y2'))]})));
 expect(lines).toHaveLength(4);const endpoints=lines.flatMap(l=>[l.a.join(','),l.b.join(',')]);const hub=endpoints.find(p=>endpoints.filter(q=>q===p).length===4)!;expect(hub).toBeTruthy();const leaves=lines.map(l=>l.a.join(',')===hub?l.b:l.a);expect(new Set(leaves.map(v=>v.join(','))).size).toBe(4);expect(leaves.every(v=>v[1]!==Number(hub.split(',')[1]))).toBe(true);
 for(const [width,height]of [[1366,768],[768,1024],[1024,768]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>window.scrollTo(0,0));
  for(const target of [page.locator('[data-atomic-board]'),b(page,'Tarkista tutkimusikkuna'),...await page.locator('[data-atomic-workshop] button:visible,[data-atomic-workshop] select:visible').all()]){
   const box=await target.boundingBox();expect.soft(box!.y,`molecule/${width} top`).toBeGreaterThanOrEqual(0);expect.soft(box!.y+box!.height,`molecule/${width} bottom`).toBeLessThanOrEqual(height);
  }
  await page.screenshot({path:`output/playwright/atomic-world/molecule-largest-WebGL-${width}.png`,animations:'disabled'});
 }
 await success(page,true);
});


test('WebGL carbon dioxide shows two separate double bonds in the own2D network',async({page})=>{
 test.setTimeout(60000);const spec=atomicWorldSpecs.find(s=>s.id==='CHEM79-COMP-MODEL')!;
 const seed=Array.from({length:160},(_,i)=>i).find(i=>{const t=spec.item(rng(i),'independent').task;return t.kind==='atomic-world'&&t.mode==='build'&&t.structure==='molecule'&&t.compound==='CO2';})!;
 await begin(page,'CHEM79-COMP-MODEL',seed);const pause=b(page,'Pysäytä maiseman liike');if(await pause.isVisible()&&await pause.isEnabled())await pause.click();await moleculeAnswer(page);
 const lines=page.locator('[data-atomic-preview] line[data-atomic-bond]');await expect(lines).toHaveCount(4);const pairs=await lines.evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-atomic-bond')));expect(new Set(pairs).size).toBe(2);for(const pair of new Set(pairs))expect(pairs.filter(p=>p===pair)).toHaveLength(2);
 await page.screenshot({path:'output/playwright/atomic-world/co2-own-double-bonds-WebGL.png',animations:'disabled'});await success(page,true);
});

test('numeric fields omit invalid prose from wrong attempt storage while exact signed fractions survive',async({page})=>{
 const secret='yksityinen kertomus numeron sijasta';
 await begin(page,'CHEM79-ATOMICNUM',1);await numberAnswer(page);
 const first=page.locator('[data-atomic-atom]').first(),id=(await first.getAttribute('data-atomic-atom'))!;
 await f(page,`Malli ${id} järjestysluku`).fill(secret);await b(page,'Tarkista tutkimusikkuna').click();
 expect((await state(page)).lastOk).toBe(false);
 expect(await page.evaluate(()=>JSON.stringify(localStorage))).not.toContain(secret);
 expect(JSON.stringify(await state(page))).not.toContain(secret);
 await b(page,'Uusi kokeilu').click();await numberAnswer(page);await success(page);
 const saved=await page.evaluate(()=>JSON.stringify(localStorage));expect(saved).toContain('/2');
 await begin(page,'CHEM79-ELECTRON',1);const task=await givenTask(page);await completeGivens(page,task,false);
 for(const row of await page.locator('[data-atomic-atom]').all()){
  const atomId=(await row.getAttribute('data-atomic-atom'))!;
  await f(page,`Malli ${atomId} varaus`).fill('-1,0');
 }
 await success(page);expect(await page.evaluate(()=>JSON.stringify(localStorage))).toContain('-1,0');
});
