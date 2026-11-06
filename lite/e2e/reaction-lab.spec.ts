import { expect, test, type Page } from '@playwright/test';
import { reactionLabSpecs } from '../src/content/reaction-lab';
import { reactionRecipe, type ReactionLabTask, type ReactionConfiguration, type ReactionRateModel } from '../src/content/models/reaction-lab';
import { rng } from '../src/engine/rng';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });
test.use({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce', launchOptions: { args: ['--enable-unsafe-swiftshader'] } });
const b = (p: Page, name: string) => p.getByRole('button', { name, exact: true }), f = (p: Page, name: string) => p.getByLabel(name, { exact: true });
const state = (p: Page) => p.evaluate(() => JSON.parse(window.render_game_to_text!()));
const weights: Record<string, number> = { H2: 2, O2: 32, H2O: 18, H2O2: 34, C: 12, CO2: 44, CaCO3: 100, CaO: 56, CH4: 16, Mg: 24, MgO: 40, C2H6O: 46, C6H10O5: 162 };
const composition: Record<string, Record<string, number>> = { H2: { H: 2 }, O2: { O: 2 }, H2O: { H: 2, O: 1 }, H2O2: { H: 2, O: 2 }, C: { C: 1 }, CO2: { C: 1, O: 2 }, CH4: { C: 1, H: 4 } };
test.beforeEach(async ({ page }, info) => { await page.addInitScript(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on'))); if (!info.title.includes('WebGL'))
    await page.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) { return /^webgl/.test(type) ? null : Reflect.apply(original, this, [type, ...args]); } as typeof original; }); });
async function begin(p: Page, id: string, seed = 1, guided = false) { await p.goto(`./?qa=1&full=1&seed=${seed}#saaristo/${id}`); await b(p, guided ? 'Tutkitaan yhdessä' : 'Kokeilen itse').click(); await p.locator('[data-reaction-workshop]').waitFor(); }
async function given(p: Page): Promise<ReactionLabTask> { const s = await state(p); return reactionLabSpecs.find(n => n.id === s.node)!.item(rng(s.seed), s.phase).task as ReactionLabTask; }
async function adult(p: Page, assistance = 'none') { await b(p, 'Olen kertonut selitykseni').click(); for (const select of await p.locator('[data-explanation-adult] select').all())
    await select.selectOption(await select.getAttribute('aria-label') === 'Saiko oppija apua?' ? assistance : 'met'); await p.getByText('Kuulin oppijan oman selityksen.', { exact: true }).click(); await b(p, 'Vahvista havainto').click(); }
async function success(p: Page) { await b(p, 'Tarkista reaktiopajan tutkimus').click(); expect((await state(p)).answered).toBe(false); await adult(p); await expect.poll(async () => (await state(p)).lastOk).toBe(true); }
function extent(m: ReactionRateModel, c: ReactionConfiguration, t: number) { const tf = m.temperatures.find(v => v.value === c.temperatureC)!.factor, cf = m.concentrations.find(v => v.value === c.concentration)!.factor, n = BigInt(m.baseRate[0] * tf[0] * cf[0]), d = BigInt(m.baseRate[1] * tf[1] * cf[1]), v = BigInt(c.shape.width * c.shape.height * c.shape.depth), remaining = [c.shape.width, c.shape.height, c.shape.depth].reduce((p, w, i) => { const length = BigInt(w) * d - 2n * n * BigInt(t * c.shape.cuts[i]!); return p * (length > 0n ? length : 0n); }, 1n); return Number(BigInt(c.extentLimit) * (v * d ** 3n - remaining) / (v * d ** 3n)); }
async function answer(p: Page, t: ReactionLabTask) {
    const choose = async (name: string, value: string) => f(p, name).selectOption(value), fill = async (name: string, value: string | number) => f(p, name).fill(String(value));
    switch (t.mode) {
        case 'change':
        case 'reaction':
            for (const c of t.cases) {
                const added = c.after.filter(a => !c.before.some(s => s.id === a.id)), unknown = c.identityEvidence === 'appearance-only';
                await choose(`${c.id} muutoksen luokka`, unknown ? 'insufficient' : added.length ? 'chemical' : 'physical');
                await choose(`${c.id} päätelmän peruste`, unknown ? 'need-data' : added.length ? 'new-identity' : 'same-identity');
                if (!unknown)
                    for (const s of added)
                        await f(p, `${c.id} uusi aine ${s.name}`).check();
            }
            break;
        case 'roles':
            for (const c of t.cases) {
                const r = reactionRecipe(c.recipe)!;
                for (const s of r.reactants)
                    await choose(`${c.id} ${s.formula} rooli`, 'reactant');
                for (const s of r.products)
                    await choose(`${c.id} ${s.formula} rooli`, 'product');
            }
            break;
        case 'energy':
            for (const c of t.cases) {
                const r = reactionRecipe(c.recipe)!, net = r.netEnergy * c.extents;
                await fill(`${c.id} järjestelmän energiamuutos`, `${net * 2}/2`);
                await fill(`${c.id} ympäristön energiamuutos`, -net);
                await fill(`${c.id} käynnistysenergia`, r.activation);
                await choose(`${c.id} energian suunta`, net < 0 ? 'out' : 'in');
                await choose(`${c.id} energiamuutoksen nimi`, net < 0 ? 'exothermic' : 'endothermic');
            }
            break;
        case 'conservation': {
            await fill('Oma ennuste kammion massa', 1);
            await fill('Oma ennuste keräysastian massa', 1);
            await expect(b(p, 'Käynnistä kammion muutos')).toBeDisabled();
            await b(p, 'Lukitse massaennuste').press('Enter');
            await expect(f(p, 'Oma ennuste kammion massa')).toBeDisabled();
            await b(p, 'Käynnistä kammion muutos').click();
            await b(p, 'Suorita muutos loppuun').click();
            if (t.boundary.open)
                await b(p, 'Siirrä annettu kaasu keräysastiaan').click();
            const r = reactionRecipe(t.recipe)!, total = r.reactants.reduce((n, s) => n + weights[s.formula]! * s.coefficient, 0) * t.groups * t.massScaleMg + (t.boundary.gasFormula ? weights[t.boundary.gasFormula]! * t.outsideInitialGroups * t.massScaleMg : 0), outside = (t.boundary.escapedGroups + t.outsideInitialGroups) * (t.boundary.gasFormula ? weights[t.boundary.gasFormula]! : 0) * t.massScaleMg;
            await fill('Kammion massa havainnon jälkeen', `${total - outside}/1000`);
            await fill('Keräysastian massa havainnon jälkeen', `${outside}/1000`);
            await fill('Koko järjestelmän massa', `${total}/1000`);
            await choose('Vastauksen massayksikkö', 'g');
            await choose('Ennusteen tarkistus', 'revised');
            break;
        }
        case 'rearrange': {
            const r = reactionRecipe(t.recipe)!, pool: {
                id: string;
                element: string;
            }[] = [];
            for (const s of r.reactants)
                for (let i = 0; i < s.coefficient * t.groups; i++)
                    for (const [element, n] of Object.entries(composition[s.formula]!))
                        for (let j = 0; j < n; j++)
                            pool.push({ id: `R${pool.length + 1}`, element });
            const available = [...pool].reverse();
            let group = 0;
            for (const s of [...r.products].reverse())
                for (let i = 0; i < s.coefficient * t.groups; i++) {
                    await choose('Oma tuoteryhmä', `p${++group}`);
                    await choose('Tuoteryhmän kaava', s.formula);
                    const atoms: {
                        id: string;
                        element: string;
                    }[] = [];
                    for (const [element, n] of Object.entries(composition[s.formula]!))
                        for (let j = 0; j < n; j++) {
                            const a = available.splice(available.findIndex(a => a.element === element), 1)[0]!;
                            atoms.push(a);
                            await choose('Siirrettävä alkuperäinen atomi', a.id);
                            await b(p, 'Siirrä atomi omaan ryhmään').press('Enter');
                        }
                    const center = atoms.find(a => a.element === (s.formula === 'H2O' ? 'O' : s.formula === 'CO2' ? 'C' : atoms[0]!.element))!;
                    for (const a of atoms.filter(a => a !== center)) {
                        await choose('Sidoksen alkuatomi', a.id);
                        await choose('Sidoksen loppuatomi', center.id);
                        await choose('Sidoksen kertaluku', s.formula === 'O2' || s.formula === 'CO2' ? '2' : '1');
                        await b(p, 'Lisää tai muuta sidos').press('Enter');
                    }
                }
            await b(p, 'Oma atomitili').click();
            for (const element of new Set(pool.map(a => a.element))) {
                const n = pool.filter(a => a.element === element).length;
                await fill(`${element} atomit ennen`, n);
                await fill(`${element} atomit jälkeen`, n);
            }
            break;
        }
        case 'rate': {
            const dataOnly = !!t.givenReadings;
            let configurations: readonly ReactionConfiguration[] = t.initial;
            if (!dataOnly) {
                const factor = t.allowedFactors[0]!, a = t.initial[0], c = { ...a, shape: { ...a.shape } };
                if (factor === 'temperature')
                    c.temperatureC = 30;
                if (factor === 'concentration')
                    c.concentration = 16;
                if (factor === 'surface')
                    c.shape.cuts = [2, 2, 2];
                configurations = [a, c];
                await choose('Kokeen B lämpötila', String(c.temperatureC));
                await choose('Kokeen B pitoisuus', String(c.concentration));
                await choose('Kokeen B palajako', c.shape.cuts.join(','));
                await choose('Oma muuttuva tekijä', factor);
                await choose('Oma nopeusennuste', 'slower');
                await b(p, 'Lukitse suunnitelma ja ennuste').press('Enter');
                for (const trial of ['A', 'B']) {
                    await choose('Suoritettava koe', trial);
                    await b(p, 'Käynnistä valittu koe').press('Enter');
                    if (t.interval[0]) {
                        await choose('Ajan siirto sekunteina', String(t.interval[0]));
                        await b(p, 'Siirrä mallin kelloa').press('Enter');
                    }
                    await b(p, 'Kirjaa nykyinen havainto').press('Enter');
                    await choose('Ajan siirto sekunteina', String(t.interval[1] - t.interval[0]));
                    await b(p, 'Siirrä mallin kelloa').press('Enter');
                    await b(p, 'Kirjaa nykyinen havainto').press('Enter');
                }
                await b(p, 'Omat laskut').click();
            }
            const delta: number[] = [], product = reactionRecipe(t.model.recipe)!.products.find(s => s.formula === t.model.product)!;
            for (const [i, trial] of ['A', 'B'].entries()) {
                const values = t.interval.map(time => extent(t.model, configurations[i]!, time) * weights[product.formula]! * product.coefficient * t.massScaleMg);
                for (const [j, time] of t.interval.entries())
                    await fill(`${trial} tuotemassa hetkellä ${time} s`, values[j]!);
                delta.push(values[1]! - values[0]!);
                await fill(`Kokeen ${trial} tuotemäärän muutos`, `${delta[i]}/1000`);
                await fill(`Kokeen ${trial} oma nopeus`, `${delta[i]}/${(t.interval[1] - t.interval[0]) * 1000}`);
            }
            await choose('Määrän muutoksen yksikkö', 'g');
            await choose('Nopeuden yksikkö', 'g/s');
            await fill('Havaintovälin kesto sekunteina', t.interval[1] - t.interval[0]);
            const relation = delta[1]! > delta[0]! ? 'faster' : delta[1]! < delta[0]! ? 'slower' : 'same';
            await choose('Nopeuksien vertailu', relation);
            await choose('Ennusteen jälkeinen päätelmä', dataOnly ? 'data-only' : relation === 'slower' ? 'confirmed' : 'revised');
            await choose('Päätelmän käyttöalue', dataOnly ? 'given-window' : 'model-only');
            if (dataOnly)
                await choose('Lopullisten saantojen vertailu', t.initial[1].extentLimit < t.initial[0].extentLimit ? 'less' : 'same');
            break;
        }
    }
}
async function fit(p: Page, width: number, height: number, label: string, adultMode = false) { await p.evaluate(() => window.scrollTo(0, 0)); const targets = [p.locator('[data-reaction-board]'), ...(adultMode ? [b(p, 'Vahvista havainto'),...await p.locator('[data-explanation-adult] > div > label').all()] : [b(p, 'Tarkista reaktiopajan tutkimus'), ...await p.locator('[data-reaction-workshop] select:visible,[data-reaction-workshop] input:visible,[data-reaction-workshop] button:visible').all()])]; for (const target of targets) {
    const box = await target.boundingBox();
    expect.soft(box, `${label} exists`).not.toBeNull();
    expect.soft(box!.x, `${label} left`).toBeGreaterThanOrEqual(0);
    expect.soft(box!.x + box!.width, `${label} right`).toBeLessThanOrEqual(width);
    expect.soft(box!.y, `${label} top`).toBeGreaterThanOrEqual(0);
    expect.soft(box!.y + box!.height, `${label} bottom`).toBeLessThanOrEqual(height);
    if (await target.evaluate(n => n.matches('select,input,button,label')))
        expect.soft(box!.height, `${label} target`).toBeGreaterThanOrEqual(44);
} }
test('all13 both initial families fit desktop portrait tablet and landscape tablet', async ({ page }) => { test.setTimeout(420000); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); for (const [width, height] of [[1366, 768], [768, 1024], [1024, 768]])
    for (const spec of reactionLabSpecs)
        for (const seed of [0, 1]) {
            await page.setViewportSize({ width, height });
            await begin(page, spec.id, seed, true);
            await fit(page, width, height, `${spec.id}/${seed}/${width}`);
        } expect(errors).toEqual([]); });
test('active and adult phases retain source plus essential controls at1024 and768', async ({ page }) => { test.setTimeout(240000); for (const [width, height] of [[1024, 768], [768, 1024]])
    for (const id of ['CHEM79-RATE-TEMP', 'CHEM79-REACTION-MODEL', 'CHEM79-EXOENDO']) {
        await page.setViewportSize({ width, height });
        await begin(page, id, 1);
        await answer(page, await given(page));
        await fit(page, width, height, `${id}/${width}/active`);
        await page.screenshot({ path: `output/playwright/reaction-lab/active-${id}-${width}.png`, animations: 'disabled' });
        await b(page, 'Tarkista reaktiopajan tutkimus').click();
        await b(page, 'Olen kertonut selitykseni').click();
        await fit(page, width, height, `${id}/${width}/adult`, true);
        await page.screenshot({ path: `output/playwright/reaction-lab/adult-${id}-${width}.png`, animations: 'disabled' });
    } });
test('all13 own3fresh plus transfer succeeds without solution assistance', async ({ page }) => { test.setTimeout(480000); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); for (const spec of reactionLabSpecs) {
    await begin(page, spec.id, 1);
    const runs = new Set();
    for (let i = 0; i < 4; i++) {
        const t = await given(page);
        runs.add(t.run);
        await answer(page, t);
        await success(page);
        if (i < 2)
            await b(page, 'Seuraava kokeilu').click();
        else if (i === 2)
            await b(page, 'Kokeile uudessa tilanteessa').click();
    }
    expect(runs.size, spec.id).toBe(4);
    expect((await state(page)).progress.checked, spec.id).toBe(true);
} expect(errors).toEqual([]); });
test('wrong rate then named hint recovery retains pending adult help and numeric privacy', async ({ page }) => { await begin(page, 'CHEM79-RATE-TEMP', 1); await answer(page, await given(page)); const secret = 'henkilökohtainen selitys tähän'; await f(page, 'Kokeen A oma nopeus').fill(secret); await b(page, 'Tarkista reaktiopajan tutkimus').click(); expect((await state(page)).answered).toBe(false); await adult(page, 'helped'); expect((await state(page)).lastOk).toBe(false); expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(secret); expect(JSON.stringify(await state(page))).not.toContain(secret); await b(page, 'Uusi kokeilu').click(); await b(page, 'Pieni vihje').click(); await answer(page, await given(page)); await success(page); expect((await state(page)).progress.checked).toBe(false); });
test('WebGL primary5 have conserved visible models with real own construction and disposal', async ({ page }) => { test.setTimeout(240000); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); for (const id of ['CHEM79-MATTER-CONS', 'CHEM79-REACTION-MODEL', 'CHEM79-RATE-TEMP', 'CHEM79-RATE-CONC', 'CHEM79-RATE-SURF']) {
    await begin(page, id, 1);
    expect((await state(page)).renderer).toBe('webgl');
    const pause = b(page, 'Pysäytä maiseman liike');
    if (await pause.isVisible() && await pause.isEnabled())
        await pause.click();
    await answer(page, await given(page));
    await page.screenshot({ path: `output/playwright/reaction-lab/${id}-WebGL.png`, animations: 'disabled' });
    await success(page);
} await page.goto('./?qa=1&full=1&seed=1#saaristo/CHEM79-EXOENDO'); expect((await state(page)).model?.kind).not.toBe('reaction-lab'); expect(errors).toEqual([]); });

test('WebGL controlled surface records the full stated final window and preserves the whole ledger',async({page})=>{
 test.setTimeout(90000);await page.setViewportSize({width:1024,height:768});await begin(page,'CHEM79-RATE-SURF',1);const t=await given(page);if(t.mode!=='rate')throw new Error('rate task');expect((await state(page)).renderer).toBe('webgl');
 const before=(await state(page)).model;expect(before.vessels.every((v:any)=>v.sampled===false&&v.insideMassMg===undefined)).toBe(true);
 const pause=b(page,'Pysäytä maiseman liike');if(await pause.isVisible()&&await pause.isEnabled())await pause.click();await answer(page,t);
 await expect(page.locator('[data-reaction-settings]')).toContainText('Oma B 20 °C · c 8 · 2×2×2 palaa · 20 s');
 const after=(await state(page)).model;for(const [i,v]of after.vessels.entries()){const c=i?{...t.initial[0],shape:{...t.initial[0].shape,cuts:[2,2,2] as const}}:t.initial[0];expect(v.timeS).toBe(20);expect(v.sampled).toBe(true);expect(v.reacted).toBe(extent(t.model,c,20));}
 expect(after.vessels[0].totalMassMg).toBe(after.vessels[1].totalMassMg);await page.screenshot({path:'output/playwright/reaction-lab/final-surface-window-WebGL-1024.png',animations:'disabled'});await success(page);
});
