import {test,expect,type Page} from '@playwright/test';
import {atomicWorldSpecs} from '../src/content/atomic-world';
import {rng} from '../src/engine/rng';
import type {AtomicWorldTask} from '../src/content/models/atomic-world';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });
test.use({launchOptions:{args:['--enable-unsafe-swiftshader']}});
const button=(p:Page,name:string)=>p.getByRole('button',{name,exact:true});
const field=(p:Page,name:string)=>p.getByLabel(name,{exact:true});
const state=(p:Page)=>p.evaluate(()=>JSON.parse(window.render_game_to_text!()));
const saved=(p:Page)=>p.evaluate(()=>JSON.parse(localStorage.getItem('sammakko-journey-3')??'{"attempts":[]}'));
async function go(p:Page,id:string,seed=0){await p.emulateMedia({reducedMotion:'reduce'});await p.goto(`./?qa=1&full=1&seed=${seed}#saaristo/${id}`);await button(p,'Kokeilen itse').click();await expect.poll(async()=>(await state(p)).renderer).toBe('webgl');}
async function task(p:Page){const s=await state(p);return atomicWorldSpecs.find(x=>x.id===s.node)!.item(rng(s.seed),s.phase).task as AtomicWorldTask;}
async function sample(p:Page,wrong=false){const t=await task(p);if(t.mode!=='atom'||!t.sample)throw Error('sample');await field(p,'Näytettä edustava atomi').selectOption(t.atoms.find(a=>a.symbol===t.sample!.symbol)!.id);await field(p,'Mallin atomien kokonaismäärä').fill(String(t.sample.units*t.sample.atomsPerUnit));await field(p,'Yksi laskettava atomi on').selectOption('atom');await field(p,'Märkyys tai kiinteys kuuluu').selectOption(wrong?'atom':'sample');}
test('the learner connects the actual sample to an atom; a macro-property error recovers through fresh evidence',async({page},info)=>{
  test.setTimeout(120000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1024,height:768});
  await go(page,'CHEM79-ATOM-01',1);await sample(page,true);await button(page,'Tarkista tutkimusikkuna').click();await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok','false');await button(page,'Uusi kokeilu').click();
  for(let i=0;i<4;i++){
    await sample(page);await expect(button(page,'Tarkista tutkimusikkuna')).toBeInViewport({ratio:1});
    if(i===3)await page.screenshot({path:info.outputPath('atomic-sample-transfer-selected.png')});
    await button(page,'Tarkista tutkimusikkuna').click();await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok','true');
    if(i<3)await button(page,i===2?'Kokeile uudessa tilanteessa':'Seuraava kokeilu').click();
  }
  const ledger=await saved(page);expect(ledger.attempts).toHaveLength(5);expect(new Set(ledger.attempts.map((x:{itemKey:string})=>x.itemKey)).size).toBe(5);expect((await state(page)).progress.checked).toBe(true);expect(errors).toEqual([]);
});
test('water keeps its identity through the visible during and after phases, then requires an adult observation',async({page},info)=>{
  test.setTimeout(90000);await page.setViewportSize({width:1024,height:768});await go(page,'CHEM79-STATECHANGE',0);
  const t=await task(page);if(t.mode!=='phase')throw Error('phase');
  for(const c of t.chambers){await field(page,`${c.id} olomuoto`).selectOption(c.phase);await field(page,`${c.id} liike`).selectOption(c.phase==='solid'?'vibrate':c.phase==='gas'?'free':'slide');await field(page,`${c.id} hiukkasvälit`).selectOption(c.phase==='solid'?'open':c.phase==='gas'?'far':'near');}
  await field(page,'Muuttuuko hiukkasen oma koko?').selectOption('same');await field(page,'Oma muutoksen jälkeinen olomuoto').selectOption(t.change==='vaporize'?'gas':'liquid');await field(page,'Muutoksen jälkeinen hiukkaslaji').selectOption('same');await field(page,'Muutoksen jälkeinen rakenneosien määrä').fill(String(t.chambers[0]!.count));
  await expect(button(page,'Suorita muutoksen alku')).toBeDisabled();await button(page,'Lukitse oma ennuste').click();await button(page,'Suorita muutoksen alku').click();expect((await state(page)).model.view).toBe('during');await page.evaluate(()=>window.advanceTime!(700));
  await page.screenshot({path:info.outputPath('atomic-water-during.png')});await button(page,'Suorita muutos loppuun').click();expect((await state(page)).model).toMatchObject({view:'after',observed:true});
  await expect(button(page,'Tarkista tutkimusikkuna')).toBeInViewport({ratio:1});await page.screenshot({path:info.outputPath('atomic-water-after.png')});await button(page,'Tarkista tutkimusikkuna').click();
  await button(page,'Olen kertonut selitykseni').click();await page.getByText('Tallennus ja vapaa palaute',{exact:true}).click();await field(page,'Vapaa palaute tähän hetkeen').fill('ROOT_ATOMIC_PRIVATE_7431. Samat vesimolekyylit säilyvät ja niiden liike sekä järjestys muuttuvat.');await button(page,'Vahvista havainto').click();expect((await saved(page)).attempts).toHaveLength(0);
  for(const select of await page.locator('[data-explanation-adult] select').all())await select.selectOption((await select.getAttribute('aria-label'))==='Saiko oppija apua?'?'none':'met');await page.locator('[data-explanation-adult] input[type=checkbox]').check();await button(page,'Vahvista havainto').click();
  await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok','true');expect((await saved(page)).attempts.at(-1).assessor).toBe('adult');expect(JSON.stringify(await saved(page))).not.toContain('ROOT_ATOMIC_PRIVATE');expect(JSON.stringify(await state(page))).not.toContain('ROOT_ATOMIC_PRIVATE');
});
test('diffusion remains a learner-triggered observation and replay does not become an answer',async({page},info)=>{
  test.setTimeout(90000);await page.setViewportSize({width:1366,height:768});await go(page,'CHEM79-MODEL-01',0);const t=await task(page);if(t.mode!=='model-use'||t.particle?.kind!=='diffusion')throw Error('diffusion seed');
  await page.evaluate(()=>window.advanceTime!(4000));expect((await state(page)).model.observed).toBe(false);await page.screenshot({path:info.outputPath('atomic-diffusion-closed.png')});
  await field(page,'Liikeikkunan selitysmalli').selectOption('particle');await field(page,'Liikeikkunan oma ennuste').selectOption('spread');await field(page,'Liikeikkunan säilyvä lukumäärä').fill(String(t.particle.count));await expect(button(page,'Suorita hiukkaskoe')).toBeDisabled();
  await button(page,'Lukitse liike-ennuste').click();await button(page,'Suorita hiukkaskoe').click();await page.evaluate(()=>window.advanceTime!(4000));expect((await state(page)).model.observed).toBe(true);await page.screenshot({path:info.outputPath('atomic-diffusion-open.png')});
  await button(page,'Toista mallin liike').click();expect((await state(page)).model.observed).toBe(true);expect((await saved(page)).attempts).toHaveLength(0);
});
