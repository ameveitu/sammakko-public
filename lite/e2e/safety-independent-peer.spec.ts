import {test,expect,type Page} from '@playwright/test';
import {safetyHarborSpecs} from '../src/content/safety-harbor';
import {rng} from '../src/engine/rng';
import type {SafetyHarborTask,SafetyAnswer} from '../src/content/models/safety-harbor';
import {safetyOracle} from '../tests/safety-independent-fixtures';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });
test.use({launchOptions:{args:['--enable-unsafe-swiftshader']},reducedMotion:'reduce'});
const btn=(p:Page,name:string)=>p.getByRole('button',{name,exact:true});
const field=(p:Page,name:string)=>p.getByLabel(name,{exact:true});
const state=(p:Page)=>p.evaluate(()=>JSON.parse(window.render_game_to_text!()));
const ledger=(p:Page)=>p.evaluate(()=>JSON.parse(localStorage.getItem('sammakko-journey-3')??'{"attempts":[]}'));
async function open(p:Page,id:string,seed:number) {
  await p.emulateMedia({reducedMotion:'reduce'});
  await p.goto(`./?qa=1&full=1&seed=${seed}#saaristo/${id}`);await btn(p,'Kokeilen itse').click();
  await expect.poll(async()=>(await state(p)).renderer).toBe('webgl');
}
async function currentTask(p:Page) {const s=await state(p);return safetyHarborSpecs.find(x=>x.id===s.node)!.item(rng(s.seed),s.phase).task as SafetyHarborTask;}
async function plan(p:Page,a:Extract<SafetyAnswer,{actions:unknown}>) {
  const surface=p.locator(`[data-safety-action-work="${a.caseId}"]`);
  for(const step of a.actions){await field(p,`${a.caseId}, seuraava suunniteltu toimi`).selectOption(step.action);await surface.getByRole('button',{name:'Lisää suunnitelmaan',exact:true}).click();}
  await surface.getByRole('button',{name:'Lukitse suunnitelma',exact:true}).click();
  return async(n:number)=>{for(let i=0;i<n;i++)await surface.getByRole('button',{name:'Toteuta seuraava vaihe',exact:true}).click();};
}
async function fill(p:Page,wrongCircuit=false) {
  const task=await currentTask(p), answer=safetyOracle(task);const tabs=p.getByRole('button',{name:/^Tilanne \d,/});
  for(let i=0;i<answer.answers.length;i++) {
    if(await tabs.count())await tabs.nth(i).click();const a=answer.answers[i]!,c=task.cases[i]!;
    if(a.mode==='fire-conditions') {
      for(const [key,label]of [['fuel','Palava aine'],['oxidizer','Hapettava ympäristö'],['heat','Riittävä lämpötila']] as const)await field(p,`${a.caseId}, ${label}`).selectOption(a.factors[key]?'yes':'no');
      await field(p,`${a.caseId}, oma ennuste`).selectOption(a.prediction!);await expect(btn(p,'Muuta virtuaalimallia')).toBeDisabled();
      await btn(p,'Lukitse oma ennuste').click();await btn(p,'Muuta virtuaalimallia').click();continue;
    }
    if(a.mode==='label') {
      if(c.mode!=='label')throw Error('label');for(const [j,code]of c.pictograms.entries())await field(p,`${a.caseId}, merkin ${j+1} merkitys`).selectOption(code);
      if(a.rejectedClaim)await field(p,`${a.caseId}, korjattava luonnosväite`).selectOption(a.rejectedClaim);
      await btn(p,'Jatka omaan toimintaketjuun').click();
    }
    if(a.mode==='electric-path'||a.mode==='evacuation') {
      const route=a.mode==='electric-path'?a.path:a.route;
      for(const point of route.slice(1)){await field(p,`${a.caseId}, lisättävä piste`).selectOption(point);await btn(p,'Lisää reitille').click();}
      if(a.mode==='electric-path') {
        await btn(p,'Lukitse reitti').click();await field(p,`${a.caseId}, energiansiirron riski`).selectOption(wrongCircuit?(a.risk==='shock'?'heating':'shock'):a.risk!);
        await field(p,`${a.caseId}, eristyksen tehtävä`).selectOption('blocks-contact');
      }
      const perform=await plan(p,a);
      if(a.mode==='evacuation') {
        const early=a.actions.filter(x=>x.action==='close-door'||x.action==='warn-friends').length;await perform(early);
        await btn(p,'Lukitse reitti').click();for(const _ of route.slice(1))await btn(p,'Kulje seuraava karttapiste').click();await perform(a.actions.length-early);
      }else await perform(a.actions.length);
    }else {const perform=await plan(p,a);await perform(a.actions.length);}
  }
  return task;
}
async function finish(p:Page,own:boolean,helped=false,expected=true) {
  await btn(p,own?'Siirry omaan perusteluun':'Tarkista turvapolku').click();
  if(own) {
    const before=(await ledger(p)).attempts.length;await btn(p,'Kirjoitan tähän').click();await field(p,'Oma selitykseni').fill('ROOT_SAFETY_LOCAL_8294. Näkyvä vaara ja oma turvallinen paikkani perustelevat avun hakemisen.');
    await btn(p,'Olen kirjoittanut selitykseni').click();await btn(p,'Vahvista havainto').click();expect((await ledger(p)).attempts).toHaveLength(before);
    for(const select of await p.locator('[data-explanation-adult] select').all())await select.selectOption((await select.getAttribute('aria-label'))==='Saiko oppija apua?'?helped?'helped':'none':'met');
    await p.locator('[data-explanation-adult] input[type=checkbox]').check();await btn(p,'Vahvista havainto').click();
    expect(JSON.stringify(await ledger(p))).not.toContain('ROOT_SAFETY_LOCAL');expect(JSON.stringify(await state(p))).not.toContain('ROOT_SAFETY_LOCAL');
  }
  await expect(p.locator('.exp-feedback')).toHaveAttribute('data-ok',String(expected));
}
test('independent three-situation safety plans, adult gate and a fresh transfer in real WebGL',async({page},info)=>{
  test.setTimeout(240000);await page.setViewportSize({width:1024,height:768});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await open(page,'ENV-CHEM-HOMECHEM-SAFE-01',0);
  for(let i=0;i<4;i++) {
    await fill(page);await finish(page,true);if(i<3)await btn(page,i===2?'Kokeile uudessa tilanteessa':'Seuraava kokeilu').click();
  }
  const saved=await ledger(page);expect(saved.attempts).toHaveLength(4);expect(new Set(saved.attempts.map((a:{itemKey:string})=>a.itemKey)).size).toBe(4);
  expect((await state(page)).progress.checked).toBe(true);
  await expect.poll(()=>page.evaluate(()=>{const host=document.querySelector('.exp-world')!,canvas=host.querySelector('canvas')!;return Math.abs(host.getBoundingClientRect().height-canvas.getBoundingClientRect().height);})).toBeLessThanOrEqual(1);
  await page.screenshot({path:info.outputPath('safety-integration-transfer.png')});expect(errors).toEqual([]);
});
test('a wrong electrical explanation stays pending then records adult and support; local prose is private',async({page},info)=>{
  test.setTimeout(120000);await page.setViewportSize({width:768,height:1024});await open(page,'PHY79-ELEC-SAFE',1);
  await fill(page,true);await finish(page,true,true,false);
  expect((await ledger(page)).attempts.at(-1)).toMatchObject({ok:false,assessor:'adult',help:['support']});
  expect((await state(page)).progress.checked).toBe(false);await page.screenshot({path:info.outputPath('safety-adult-wrong-helped.png')});
});
test('fire changes and actual warning labels remain visible in landscape tablet',async({page},info)=>{
  test.setTimeout(120000);await page.setViewportSize({width:1024,height:768});
  for(const id of ['CHEM79-FIRE-CONDITIONS','CHEM79-HAZARD-LABEL'])for(const seed of [0,1]) {
    await page.goto('./');await page.evaluate(()=>(localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on')));await open(page,id,seed);await fill(page);
    const end=btn(page,'Tarkista turvapolku');await page.screenshot({path:info.outputPath(`${id}-${seed}-active.png`)});
    await expect(end).toBeInViewport({ratio:1});await finish(page,false);
  }
});
