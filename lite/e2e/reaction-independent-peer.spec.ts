import { test, expect, type Page } from '@playwright/test';
import { reactionLabSpecs } from '../src/content/reaction-lab';
import { reactionRecipes, type ReactionLabTask } from '../src/content/models/reaction-lab';
import { rng } from '../src/engine/rng';
import { peerReactionAnswer } from '../tests/reaction-independent-peer-fixtures';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });
// Adult confirmations below are technical fixtures, not semantic observations of real learners.
test.use({ reducedMotion: 'reduce', launchOptions: { args: ['--enable-unsafe-swiftshader'] } });
const recipes = new Map(reactionRecipes.map(r => [r.id, r]));
const button = (p: Page, name: string) => p.getByRole('button', { name, exact: true });
const field = (p: Page, name: string) => p.getByLabel(name, { exact: true });
const state = (p: Page) => p.evaluate(() => JSON.parse(window.render_game_to_text!()));
const history = (p: Page) => p.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[],"events":[]}'));
async function open(p: Page, id: string, seed = 3) {
    await p.goto(`./?qa=1&full=1&seed=${seed}#saaristo/${id}`);
    await button(p, 'Kokeilen itse').press('Enter'); await expect(p.locator('[data-reaction-workshop]')).toBeVisible();
    await expect.poll(async () => (await state(p)).renderer).toBe('webgl');
}
async function current(p: Page) { const s = await state(p); return reactionLabSpecs.find(n => n.id === s.node)!.item(rng(s.seed), s.phase).task as ReactionLabTask; }
async function fit(p: Page) {
    await p.evaluate(() => window.scrollTo(0, 0));
    const failures = await p.evaluate(() => [...document.querySelectorAll<HTMLElement>('[data-reaction-board], [data-reaction-workshop] button, [data-reaction-workshop] select, [data-reaction-workshop] input:not([type=checkbox]), [data-reaction-workshop] label:has(input[type=checkbox])')].filter(n => n.checkVisibility()).flatMap(n => {
        const r = n.getBoundingClientRect(), name = n.getAttribute('aria-label') ?? n.textContent?.slice(0, 45);
        return [...(r.top < -1 || r.bottom > innerHeight + 1 || r.left < -1 || r.right > innerWidth + 1 ? [`${name} outside ${r.y}..${r.bottom}`] : []), ...(n.matches('button,input,select,label') && (r.height < 43 || r.width < 43) ? [`${name} target ${r.width}×${r.height}`] : [])];
    }));
    expect(failures).toEqual([]);
}
/** Writes the own explanation when this review offers a written channel; a spoken-only review is told aloud instead, so no text exists to leak. */
async function writeOwn(p: Page, text: string) {
    if (!await button(p, 'Kirjoitan tähän').count()) { await button(p, 'Olen kertonut selitykseni').press('Enter'); return; }
    await button(p, 'Kirjoitan tähän').press('Enter');
    await field(p, 'Oma selitykseni').fill(text);
    await button(p, 'Olen kirjoittanut selitykseni').press('Enter');
}
async function adult(p: Page, helped = false, written = false, screenshotPath?: string) {
    const count = (await history(p)).attempts.length;
    if (written) {
        await writeOwn(p, 'REACTION_PEER_PRIVATE_731. Vertaan juuri oman kokeeni aineistoa ja vakioita.');
    } else await button(p, 'Olen kertonut selitykseni').press('Enter');
    await button(p, 'Vahvista havainto').press('Enter');
    expect((await history(p)).attempts.length).toBe(count);
    for (const s of await p.locator('[data-explanation-adult] select').all()) await s.selectOption(await s.getAttribute('aria-label') === 'Saiko oppija apua?' ? helped ? 'helped' : 'none' : 'met');
    await p.locator('[data-explanation-adult] input[type=checkbox]').check(); await fit(p);
    if (screenshotPath) await p.screenshot({ animations: 'disabled', path: screenshotPath });
    await button(p, 'Vahvista havainto').press('Enter');
}
async function prepare(p: Page, wrong = false) {
    const t = await current(p), r = peerReactionAnswer(t, recipes);
    const fill = async (name: string, value: unknown) => field(p, name).fill(String(value));
    const select = async (name: string, value: string) => field(p, name).selectOption(value);
    if (r.mode === 'rate' && t.mode === 'rate') {
        if (r.plan) {
            const c = r.plan.configurations[1];
            await expect(button(p, 'Käynnistä valittu koe')).toBeHidden();
            await select('Kokeen B lämpötila', String(c.temperatureC)); await select('Kokeen B pitoisuus', String(c.concentration)); await select('Kokeen B palajako', c.shape.cuts.join(','));
            await select('Oma muuttuva tekijä', r.plan.factor); await select('Oma nopeusennuste', r.plan.forecast);
            await fit(p); await button(p, 'Lukitse suunnitelma ja ennuste').press('Enter');
            for (const trial of ['B', 'A']) {
                await select('Suoritettava koe', trial); await button(p, 'Käynnistä valittu koe').press('Enter');
                if (t.interval[0]) { await select('Ajan siirto sekunteina', String(t.interval[0])); await button(p, 'Siirrä mallin kelloa').press('Enter'); }
                await button(p, 'Kirjaa nykyinen havainto').press('Enter');
                await select('Ajan siirto sekunteina', String(t.interval[1] - t.interval[0])); await button(p, 'Siirrä mallin kelloa').press('Enter');
                const beforeSample = await state(p); expect(JSON.stringify(beforeSample.model)).not.toContain('productMassMg');
                await button(p, 'Kirjaa nykyinen havainto').press('Enter');
            }
            await button(p, 'Oma suunnitelma').press('Enter'); await expect(field(p, 'Oma nopeusennuste')).toBeDisabled();
            await expect(field(p, 'Oma nopeusennuste')).toHaveValue('slower'); await button(p, 'Omat laskut').press('Enter');
        }
        for (const reading of r.readings) await fill(`${reading.trial} tuotemassa hetkellä ${reading.timeS} s`, reading.productMass);
        for (const [i, trial] of ['A', 'B'].entries()) { await fill(`Kokeen ${trial} tuotemäärän muutos`, r.delta[i]); await fill(`Kokeen ${trial} oma nopeus`, wrong && !i ? '99999' : r.rates[i]); }
        await fill('Havaintovälin kesto sekunteina', r.duration); await select('Määrän muutoksen yksikkö', r.quantityUnit); await select('Nopeuden yksikkö', r.rateUnit); await select('Nopeuksien vertailu', r.relation); await select('Ennusteen jälkeinen päätelmä', r.reflection); await select('Päätelmän käyttöalue', r.boundaryScope);
        if (r.yieldRelation) await select('Lopullisten saantojen vertailu', r.yieldRelation);
    } else if (r.mode === 'conservation' && t.mode === 'conservation') {
        await fill('Oma ennuste kammion massa', '0'); await fill('Oma ennuste keräysastian massa', '0');
        await expect(button(p, 'Käynnistä kammion muutos')).toBeDisabled(); await button(p, 'Lukitse massaennuste').press('Enter');
        await expect(field(p, 'Oma ennuste kammion massa')).toBeDisabled(); await button(p, 'Käynnistä kammion muutos').press('Enter'); await button(p, 'Suorita muutos loppuun').press('Enter');
        if (t.boundary.open) await button(p, 'Siirrä annettu kaasu keräysastiaan').press('Enter');
        await fill('Kammion massa havainnon jälkeen', r.inside); await fill('Keräysastian massa havainnon jälkeen', r.outside); await fill('Koko järjestelmän massa', wrong ? '99999' : r.whole); await select('Vastauksen massayksikkö', r.unit); await select('Ennusteen tarkistus', 'revised');
    } else if (r.mode === 'energy') {
        for (const row of r.rows) {
            await fill(`${row.id} järjestelmän energiamuutos`, row.systemChange); await fill(`${row.id} ympäristön energiamuutos`, row.surroundingsChange); await fill(`${row.id} käynnistysenergia`, row.activation); await select(`${row.id} energian suunta`, row.direction); await select(`${row.id} energiamuutoksen nimi`, row.term);
        }
    } else throw Error('Unimplemented independent browser path');
    await fit(p); return t;
}
async function submit(p: Page, ok = true, helped = false, written = false, screenshotPath?: string) {
    await button(p, 'Tarkista reaktiopajan tutkimus').press('Enter'); expect((await state(p)).answered).toBe(false);
    await adult(p, helped, written, screenshotPath); await expect.poll(async () => (await state(p)).lastOk).toBe(ok);
}
test.beforeEach(async ({ page }) => { await page.addInitScript(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on'))); });
test('peer real WebGL surface experiment, wrong prediction kept, 3 fresh+transfer; desktop and 1024 adult fit', async ({ page }, info) => {
    test.setTimeout(600000); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewportSize({ width: 1024, height: 768 }); await open(page, 'CHEM79-RATE-SURF', 7);
    for (let i = 0; i < 4; i++) {
        const task = await prepare(page); expect(task.mode).toBe('rate');
        if (!i) await page.screenshot({ animations: 'disabled', path: info.outputPath('surface-1024-calculation-webgl.png') });
        await submit(page, true, false, false, !i ? info.outputPath('surface-1024-adult-webgl.png') : undefined);
        if (!i) await page.setViewportSize({ width: 1366, height: 768 }); if (i < 2) await button(page, 'Seuraava kokeilu').press('Enter'); else if (i === 2) await button(page, 'Kokeile uudessa tilanteessa').press('Enter');
    }
    const ledger = await history(page), attempts = ledger.attempts.filter((a: { node: string }) => a.node === 'CHEM79-RATE-SURF');
    expect(attempts).toHaveLength(4); expect(new Set(attempts.map((a: { itemKey: string }) => a.itemKey)).size).toBe(4); expect((await state(page)).progress.checked).toBe(true); expect(errors).toEqual([]);
    await page.screenshot({ animations: 'disabled', path: info.outputPath('surface-transfer-result-webgl.png') });
});
test('peer open-boundary mass transfer and helped written wrong-to-guided recovery preserve privacy', async ({ page }, info) => {
    test.setTimeout(600000); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewportSize({ width: 768, height: 1024 }); await open(page, 'CHEM79-MATTER-CONS', 13);
    await prepare(page, true); await button(page, 'Tarkista reaktiopajan tutkimus').press('Enter');
    await writeOwn(page, 'REACTION_PEER_PRIVATE_731. Koko järjestelmä on kaksi astiaa.');
    await button(page, 'Vahvista havainto').press('Enter'); expect((await history(page)).attempts).toHaveLength(0);
    for (const s of await page.locator('[data-explanation-adult] select').all()) await s.selectOption(await s.getAttribute('aria-label') === 'Saiko oppija apua?' ? 'helped' : 'met'); await page.locator('[data-explanation-adult] input[type=checkbox]').check(); await fit(page);
    await page.screenshot({ animations: 'disabled', path: info.outputPath('matter-tablet-adult-webgl.png') }); await button(page, 'Vahvista havainto').press('Enter');
    await expect.poll(async () => (await state(page)).lastOk).toBe(false);
    let ledger = await history(page); expect(ledger.attempts[0].assessor).toBe('adult'); expect(ledger.attempts[0].help).toContain('support'); expect(JSON.stringify(ledger)).not.toContain('REACTION_PEER_PRIVATE_731'); expect(JSON.stringify(await state(page))).not.toContain('REACTION_PEER_PRIVATE_731');
    await button(page, 'Näytä ja selitä').press('Enter'); await button(page, 'Uusi yhteinen kokeilu').press('Enter'); await prepare(page); await submit(page); expect((await state(page)).progress.checked).toBe(false); ledger = await history(page); expect(ledger.attempts.at(-1).phase).toBe('guided');
    expect(errors).toEqual([]);
});
test('peer energy net vs activation and nonzero-start rate window fit landscape tablet', async ({ page }, info) => {
    test.setTimeout(300000); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); await page.setViewportSize({ width: 1024, height: 768 });
    await open(page, 'CHEM79-REACTION-ENERGY', 0); await prepare(page); await page.screenshot({ animations: 'disabled', path: info.outputPath('energy-1024-givens.png') }); await submit(page);
    await page.goto('./'); await open(page, 'CHEM79-RATE-01', 1); let task = await current(page);
    for (let i = 0; task.mode === 'rate' && task.interval[0] === 0 && i < 6; i++) { await prepare(page); await submit(page); await button(page, 'Seuraava kokeilu').press('Enter'); task = await current(page); }
    if (task.mode !== 'rate') throw Error('rate'); expect(task.interval[0]).toBeGreaterThan(0); await prepare(page); await page.screenshot({ animations: 'disabled', path: info.outputPath('rate-nonzero-1024.png') }); await submit(page); expect(errors).toEqual([]);
});
