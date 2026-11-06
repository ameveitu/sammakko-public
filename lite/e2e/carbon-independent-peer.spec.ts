import {test,expect,type Page} from '@playwright/test';
import {carbonKitchenSpecs} from '../src/content/carbon-kitchen';
import type {CarbonKitchenTask} from '../src/content/models/carbon-kitchen';
import {rng} from '../src/engine/rng';
import {carbonOwnAnswer} from '../tests/carbon-independent-fixtures';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });
test.use({reducedMotion:'reduce',launchOptions:{args:['--enable-unsafe-swiftshader']}});
const b=(p:Page,name:string)=>p.getByRole('button',{name,exact:true});
const f=(p:Page,name:string)=>p.getByLabel(name,{exact:true});
const state=(p:Page)=>p.evaluate(()=>JSON.parse(window.render_game_to_text!()));
const saved=(p:Page)=>p.evaluate(()=>JSON.parse(localStorage.getItem('sammakko-journey-3')??'{"attempts":[]}'));
async function go(p:Page,id:string,seed=1){await p.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);await b(p,'Kokeilen itse').click();await expect.poll(async()=>(await state(p)).renderer).toBe('webgl');}
async function task(p:Page){const s=await state(p);return carbonKitchenSpecs.find(n=>n.id===s.node)!.item(rng(s.seed),s.phase).task as CarbonKitchenTask;}
async function composition(p:Page,wrong=false){const t=await task(p),a=carbonOwnAnswer(t);if(t.mode!=='composition'||a.mode!=='composition')throw Error('composition');await f(p,'Hiilen alkuaineen tunnus').selectOption('C');for(const row of a.rows){await f(p,`${row.id} hiiliatomien määrä`).fill(String(row.carbon));await f(p,`${row.id} aineen tyyppi`).selectOption(row.type!);}if(t.claim)await f(p,'Väitteen vastaesimerkki').selectOption(wrong?'d':a.counterexample!);return t;}
test('a second valid counterexample survives the visible repair and fresh transfer path',async({page},info)=>{
 test.setTimeout(90000);await page.setViewportSize({width:1024,height:768});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await go(page,'CHEM79-CARBON',1);
 const t=await composition(page);expect(t.mode==='composition'&&!!t.claim).toBe(true);await expect(b(page,'Tarkista oma tutkimus')).toBeInViewport({ratio:1});await page.screenshot({path:info.outputPath('carbon-second-counterexample-tablet.png')});
 for(let i=0;i<4;i++){if(i)await composition(page);await b(page,'Tarkista oma tutkimus').click();await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok','true');if(i<3)await b(page,i===2?'Kokeile uudessa tilanteessa':'Seuraava kokeilu').click();}
 const records=await saved(page);expect(records.attempts).toHaveLength(4);expect(new Set(records.attempts.map((x:{itemKey:string})=>x.itemKey)).size).toBe(4);expect((await state(page)).progress.checked).toBe(true);expect(errors).toEqual([]);
});
test('organic evidence waits for observation, keeps the written note private and preserves helped wrong provenance',async({page},info)=>{
 test.setTimeout(90000);await page.setViewportSize({width:1024,height:768});await go(page,'CHEM79-ORG-GROUP',1);const t=await task(page),a=carbonOwnAnswer(t);if(t.mode!=='organic-group'||a.mode!=='organic-group')throw Error('organic');
 for(const m of t.molecules){await b(page,m.name).click();const mark=a.marks.find(r=>r.molecule===m.id)!;await f(page,`${m.id} ryhmän C`).selectOption(mark.carbon);await f(page,`${m.id} ryhmän O`).selectOption(mark.oxygen);await f(page,`${m.id} ryhmän H`).selectOption(mark.hydrogen);}
 await b(page,'Jatka ominaisuusvertailuun').click();await f(page,'Korkeampi annettu kiehumispiste').selectOption(a.higherBoiling!);await f(page,'Kiehumispisteiden ero celsiusasteina').fill('-1');if(t.proposal)await f(page,'Virheellisen ryhmäväitteen rakenne').selectOption(t.contrast.id);
 await expect(b(page,'Siirry omaan perusteluun')).toBeInViewport({ratio:1});await page.screenshot({path:info.outputPath('carbon-alcohol-own-comparison-tablet.png')});await b(page,'Siirry omaan perusteluun').click();expect((await saved(page)).attempts).toHaveLength(0);
 await b(page,'Kirjoitan tähän').click();await f(page,'Oma selitykseni').fill('ROOT_CARBON_PRIVATE_4289. Osoitan oman rakennepiirteeni ja vertaan annettua aineistoa.');await b(page,'Olen kirjoittanut selitykseni').click();await b(page,'Vahvista havainto').click();expect((await saved(page)).attempts).toHaveLength(0);
 for(const select of await page.locator('[data-explanation-adult] select').all())await select.selectOption((await select.getAttribute('aria-label'))==='Saiko oppija apua?'?'helped':'met');await page.locator('[data-explanation-adult] input[type=checkbox]').check();await page.evaluate(()=>scrollTo(0,0));await expect(page.getByRole('heading',{level:1})).toBeInViewport({ratio:1});await expect(b(page,'Retkikartta')).toBeInViewport({ratio:1});await expect(b(page,'Vahvista havainto')).toBeInViewport({ratio:1});await page.screenshot({path:info.outputPath('carbon-adult-written-tablet.png')});await b(page,'Vahvista havainto').click();
 await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok','false');const records=await saved(page);expect(records.attempts.at(-1).assessor).toBe('adult');expect(records.attempts.at(-1).help).toContain('support');expect((await state(page)).progress.checked).toBe(false);expect(JSON.stringify(records)).not.toContain('ROOT_CARBON_PRIVATE');expect(JSON.stringify(await state(page))).not.toContain('ROOT_CARBON_PRIVATE');
});
test('learner-built protein fragment retains its ordered residues through bending and straightening',async({page},info)=>{
 test.setTimeout(90000);await page.setViewportSize({width:1024,height:768});await go(page,'CHEM79-NUTRIENT-PROT',0);const t=await task(page),a=carbonOwnAnswer(t);if(t.mode!=='protein-fragment'||a.mode!=='protein-fragment')throw Error('protein');
 for(const id of t.proposal??[]){await b(page,`${t.units.find(u=>u.id===id)!.label} ×`).click();}
 for(const id of a.chain){await f(page,'Ketjuun lisättävä rakenneosa').selectOption(id);await b(page,'Liitä ketjuun').click();}
 const straight=(await state(page)).model;expect(straight.residues.map((r:{id:string})=>r.id)).toEqual(a.chain);await b(page,'Taivuta mallia').click();const bent=(await state(page)).model;expect(bent.folded).toBe(true);expect(bent.residues).toEqual(straight.residues);
 for(const id of a.proteinFoods)await b(page,`${id} sisältää proteiinia`).click();await expect(b(page,'Tarkista oma tutkimus')).toBeInViewport({ratio:1});await page.screenshot({path:info.outputPath('carbon-protein-own-fold-tablet.png')});await b(page,'Ojenna mallia').click();expect((await state(page)).model.residues).toEqual(straight.residues);await b(page,'Tarkista oma tutkimus').click();await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok','true');
});
