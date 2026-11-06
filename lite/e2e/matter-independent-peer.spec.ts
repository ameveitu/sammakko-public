import {test,expect,type Page} from '@playwright/test';
import {rng} from '../src/engine/rng';
import {matterCyclesSpecs} from '../src/content/matter-cycles';
import type {MatterCyclesTask} from '../src/content/models/matter-cycles';
import {matterPeerAnswer} from '../tests/matter-independent-fixtures';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });
test.use({viewport:{width:1024,height:768},reducedMotion:'reduce',launchOptions:{args:['--enable-unsafe-swiftshader']}});
const state=(p:Page)=>p.evaluate(()=>JSON.parse(window.render_game_to_text!()));
const button=(p:Page,name:string)=>p.getByRole('button',{name,exact:true});
const field=(p:Page,name:string)=>p.getByLabel(name,{exact:true});
async function task(p:Page){const s=await state(p);return matterCyclesSpecs.find(t=>t.id===s.node)!.item(rng(s.seed),s.phase).task as MatterCyclesTask;}
async function open(p:Page,id:string){await p.goto(`./?qa=1&full=1&seed=6#saaristo/${id}`);await button(p,'Kokeilen itse').press('Enter');}
async function prepare(p:Page,t:MatterCyclesTask,onStorage?:()=>Promise<void>){
  const r=matterPeerAnswer(t,'surface');
  if(t.mode!=='water-path'&&t.mode!=='carbon-network')throw Error('peer path');
  if(r.mode!=='water-path'&&r.mode!=='carbon-network')throw Error('peer answer');
  if(t.mode==='carbon-network'&&t.cards&&r.mode==='carbon-network'){
    for(const a of r.assignments){await field(p,'Tarkasteltava näytekortti').selectOption(a.card);await field(p,`${a.card} hiilivarasto`).selectOption(a.reservoir??'none');}
    await button(p,'Katso oma sijoitustaulukko').press('Enter');await button(p,'Jatka omaan hiilitiliin').press('Enter');
  }
  for(const e of r.edges){await field(p,'Tarkasteltava prosessi').selectOption(e.process);await field(p,'Prosessin lähtövarasto').selectOption(e.from);await field(p,'Prosessin tulovarasto').selectOption(e.to);}
  await button(p,t.mode==='water-path'?'Jatka omaan vesireittiin':t.requireReturn?'Jatka omaan paluureittiin':'Jatka omaan hiilitiliin').press('Enter');
  if(r.mode==='water-path'){await field(p,'Pilven veden muoto').selectOption(r.cloud!);await field(p,'Reitillä vaadittu viipymävarasto').selectOption(r.storedAt??'none');}
  else {
    for(const id of r.returnPath){await field(p,'Paluureitin seuraava varasto').selectOption(id);await button(p,'Lisää reitille').press('Enter');}
    if(r.returnPath.length)await button(p,'Jatka muutosennusteeseen').press('Enter');
    await field(p,'Oma ennuste fokusvaraston hiilen muutoksesta milligrammoina').fill(String(r.focusChangeMg));
    if(r.longStore)await field(p,'Pitkäaikainen polttoaineen lähtövarasto').selectOption(r.longStore);
  }
  await button(p,'Lukitse ennuste ja oma malli').press('Enter');
  for(const m of r.moves){
    await field(p,'Toteutettava prosessi').selectOption(m.process);await field(p,'Oma siirrettävä määrä milligrammoina').fill(String(m.amountMg));await button(p,'Toteuta prosessin siirto').press('Enter');
    if(m.from===m.to)await onStorage?.();
  }
}
test('peer real WebGL: snow storage remains solid and the alternative surface return conserves the same water',async({page},info)=>{
  test.setTimeout(180000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await open(page,'ENV-CHEM-WATERCYCLE-01');expect((await state(page)).renderer).toBe('webgl');
  for(let i=0;i<3;i++){
    await prepare(page,await task(page));await button(page,'Tarkista oma kiertomalli').press('Enter');await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok','true');
    if(i<2)await button(page,'Seuraava kokeilu').press('Enter');
  }
  await button(page,'Kokeile uudessa tilanteessa').press('Enter');const transfer=await task(page);expect(transfer.mode).toBe('water-path');
  await prepare(page,transfer,async()=>{
    const model=(await state(page)).model;expect(model.parcels.every((p:{reservoir:string;form:string})=>p.reservoir==='snow'&&p.form==='solid')).toBe(true);
    expect(model.transfers.some((m:{from:string;to:string})=>m.from==='snow'&&m.to==='snow')).toBe(true);
    await page.screenshot({path:info.outputPath('peer-snow-storage-webgl.png'),animations:'disabled'});
  });
  const model=(await state(page)).model;expect(model.parcels.every((p:{reservoir:string;form:string})=>p.reservoir==='sea'&&p.form==='liquid')).toBe(true);
  expect(model.parcels.reduce((n:number,p:{amountMg:number})=>n+p.amountMg,0)).toBe(transfer.mode==='water-path'?transfer.amountMg:0);
  expect(model.transfers.at(-1)).toMatchObject({from:'river',to:'sea'});
  await button(page,'Tarkista oma kiertomalli').press('Enter');await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok','true');expect((await state(page)).progress.checked).toBe(true);
  await page.screenshot({path:info.outputPath('peer-snow-return-webgl.png'),animations:'disabled'});expect(errors).toEqual([]);
});
test('peer: fossil and recent carbon share an atmosphere while the original written comparison remains local',async({page},info)=>{
  test.setTimeout(90000);await open(page,'CHEM79-CARBON-BURN');const t=await task(page);await prepare(page,t);
  await button(page,'Siirry omaan kiertoselitykseen').press('Enter');await button(page,'Kirjoitan tähän').press('Enter');
  await field(page,'Oma selitykseni').fill('PEER_CARBON_PRIVATE_175. Tarkastelen kahta lähtövarastoa vain annetun jakson aikana.');await button(page,'Olen kirjoittanut selitykseni').press('Enter');
  const before=await page.evaluate(()=>localStorage.getItem('sammakko-journey-3'));
  await button(page,'Vahvista havainto').press('Enter');expect(await page.evaluate(()=>localStorage.getItem('sammakko-journey-3'))).toBe(before);
  for(const input of await page.locator('[data-explanation-adult] select').all())await input.selectOption(await input.getAttribute('aria-label')==='Saiko oppija apua?'?'helped':'met');
  await page.locator('[data-explanation-adult] input[type=checkbox]').check();
  const confirm=await button(page,'Vahvista havainto').boundingBox();expect(confirm!.y+confirm!.height).toBeLessThanOrEqual(768);
  await page.screenshot({path:info.outputPath('peer-carbon-adult-written-1024.png'),animations:'disabled'});
  await button(page,'Vahvista havainto').press('Enter');await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok','true');
  const records=await page.evaluate(()=>JSON.parse(localStorage.getItem('sammakko-journey-3')!));expect(records.attempts.at(-1)).toMatchObject({assessor:'adult'});expect(records.attempts.at(-1).help).toContain('support');
  expect(JSON.stringify(records)).not.toContain('PEER_CARBON_PRIVATE_175');expect(JSON.stringify(await state(page))).not.toContain('PEER_CARBON_PRIVATE_175');expect((await state(page)).progress.checked).toBe(false);
});
