import {expect,test,type Page,type TestInfo} from '@playwright/test';
import {rng} from '../src/engine/rng';
import {logicWorkshopSpecs} from '../src/content/logic-workshop';
import {independentlyAnswerLogic} from '../tests/logic-workshop-fixtures';
import type {LogicWorkshopTask} from '../src/content/models/logic-workshop';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });
test.use({contextOptions:{reducedMotion:'reduce'},launchOptions:{args:['--enable-unsafe-swiftshader']}});
const button=(p:Page,name:string)=>p.getByRole('button',{name,exact:true});
const field=(p:Page,name:string)=>p.getByLabel(name,{exact:true});
const state=(p:Page)=>p.evaluate(()=>JSON.parse(window.render_game_to_text!()));
const pick=(p:Page,name:string,value:string)=>field(p,name).selectOption(value);
const fill=(p:Page,name:string,value:number|string)=>field(p,name).fill(String(value));
async function start(p:Page,id:string,seed=0){await p.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);await button(p,'Kokeilen itse').click();}
async function current(p:Page){const s=await state(p),spec=logicWorkshopSpecs.find(n=>n.id===s.node)!;return {state:s,task:spec.item(rng(s.seed),s.phase).task as LogicWorkshopTask};}
async function visible(p:Page,selector:string,height:number){const box=await p.locator(selector).boundingBox();expect(box,selector).not.toBeNull();expect(box!.y,selector).toBeGreaterThanOrEqual(0);expect(box!.y+box!.height,selector).toBeLessThanOrEqual(height+1);}
async function solve(p:Page,options:{height?:number;pending?:boolean;helped?:boolean;forcedHelped?:boolean;capture?:TestInfo}={}){
  const {task:t,state:currentState}=await current(p),a=independentlyAnswerLogic(t);
  if(a.mode==='cause'&&t.mode==='cause'){
    await pick(p,'Oma ennuste määränpäästä',a.prediction);await button(p,'Lukitse ennuste').click();
    await pick(p,'Kourun suunta',a.settings.direction);await pick(p,t.apparatus==='water'?'Virtauksen asetus':'Lähtökorkeuden asetus',String(a.settings.release));
    await button(p,'Tee vertailukoe').click();expect((await state(p)).stage.mode).toBe('cause');
    await pick(p,'Muutettu tekijä','direction');await pick(p,'Vakiona pidetty asia','release');await pick(p,'Havaittu määränpää',a.conclusion);
  }else if(a.mode==='perspective'){
    await button(p,'Loikka rannassa').click();await button(p,'Aava vedessä').click();
    await pick(p,'Paikka toisessa näkymässä',String(a.position));await pick(p,'Mikä säilyy?',a.stable);await pick(p,'Mikä muuttuu?',a.change);
  }else if(a.mode==='question'&&t.mode==='question'){
    await pick(p,'Kysymyksen alku',a.verb);await pick(p,'Tutkittava määrä',a.quantity);
    for(const id of a.subjects)await field(p,`Kysymyksen kohteet: ${t.subjects.find(s=>s.id===id)!.label}`).check();
    await pick(p,'Miten kysymys tutkitaan?',a.method);
  }else if('judgements' in a&&(t.mode==='truth'||t.mode==='conclusion'||t.mode==='argument')){
    for(const j of a.judgements){await pick(p,`Lause ${j.statement+1}: arvio`,j.value);for(const id of j.witnesses)await field(p,`Lause ${j.statement+1}: havaintotuki: ${t.data.find(d=>d.id===id)!.label}`).check();}
  }else if(a.mode==='combinations'&&t.mode==='combinations'){
    for(const [i,row] of a.rows.entries()){
      if(i)await button(p,'Lisää yhdistelmä').click();
      for(const [j,value] of row.entries())await pick(p,`Rivi ${i+1}: ${t.factors[j]!.label}`,value);
    }
  }else if(a.mode==='rule'&&t.mode==='rule'){
    await fill(p,t.threshold===undefined?'Oma sääntö y =':'Kun x ≤ raja, y =',a.expression);
    if(t.threshold!==undefined){await fill(p,'Oma ehtoraja',a.threshold);await fill(p,'Kun x > raja, y =',a.aboveExpression);}
    await fill(p,'Tulos uudella syötteellä',a.output);
  }else if(a.mode==='proof'){
    for(const step of a.steps){await pick(p,'Seuraava perusteluvaihe',step);await button(p,'Lisää vaihe').click();}
    await pick(p,'Vaihe jonka selitän',a.explainedStep);
  }else if(a.mode==='reading'){
    for(const [id,label] of [['given','Annettu tieto'],['target','Kysytty asia'],['condition','Ehtolause']])await pick(p,label!,a.roles[id!]!);
    await pick(p,'Ehdon matemaattinen suhde',a.relation);
  }else if(a.mode==='writing'){await fill(p,'Viestini tulos',a.result);await pick(p,'Viestini yksikkö',a.unit);}
  if(options.height){await visible(p,'.exp-exact',options.height);const b=await button(p,t.review?'Jatka omaan perusteluun':'Tarkista merkinnät').boundingBox();expect(b!.y+b!.height,`${t.mode} active decision`).toBeLessThanOrEqual(options.height+1);}
  if(options.capture)await p.screenshot({path:options.capture.outputPath(`${t.mode}-${currentState.phase}-active.png`)});
  await button(p,t.review?'Jatka omaan perusteluun':'Tarkista merkinnät').click();
  if(t.review){
    const secret='logic-private-prose-315';
    if(t.review.channel==='written')await fill(p,'Oma selitykseni',secret);
    await button(p,t.review.channel==='written'?'Olen kirjoittanut selitykseni':'Olen kertonut selitykseni').click();
    if(options.pending){await button(p,'Vahvista havainto').click();expect((await state(p)).lastOk).toBeUndefined();}
    for(const c of t.review.rubric)await pick(p,c.label,'met');
    if(options.forcedHelped){await expect(field(p,'Saiko oppija apua?')).toBeDisabled();await expect(field(p,'Saiko oppija apua?')).toHaveValue('helped');}
    else await pick(p,'Saiko oppija apua?',options.helped?'helped':'none');
    await p.getByRole('checkbox',{name:t.review.channel==='written'?'Luin oppijan oman selityksen.':'Kuulin oppijan oman selityksen.'}).check();
    if(options.height){await visible(p,'.exp-exact',options.height);const b=await button(p,'Vahvista havainto').boundingBox();expect(b!.y+b!.height).toBeLessThanOrEqual(options.height+1);}
    if(options.capture)await p.screenshot({path:options.capture.outputPath(`${t.mode}-${currentState.phase}-adult.png`)});
    await button(p,'Vahvista havainto').click();expect(await p.evaluate(()=>JSON.stringify(localStorage))).not.toContain(secret);
  }
  await expect.poll(async()=>(await state(p)).lastOk).toBe(true);
}
for(const spec of logicWorkshopSpecs)test(`${spec.id}: three fresh own answers and transfer`,async({page},info)=>{
  test.setTimeout(120000);await start(page,spec.id);const families=new Set<string>();
  for(let i=0;i<4;i++){
    const s=await state(page);if(i<3)families.add(s.family);else expect(s.phase).toBe('transfer');
    await solve(page,{capture:(i===0&&['M-TH-05','M-TH-06','M79-PROOF-01','M79-COMB-01'].includes(spec.id)||i===3&&['M-TH-05','M-TH-06'].includes(spec.id))?info:undefined});
    if(i<2)await button(page,'Seuraava kokeilu').click();else if(i===2)await button(page,'Kokeile uudessa tilanteessa').click();
  }
  expect(families).toEqual(new Set(spec.produce));expect((await state(page)).progress.checked).toBe(true);
});
test('own production stays pending until observed; assistance does not create independent mastery',async({page})=>{
  await start(page,'M79-TEXT-02');await solve(page,{pending:true,helped:true});expect((await state(page)).progress.checked).toBe(false);
  const storage=await page.evaluate(()=>JSON.stringify(localStorage));expect(storage).toContain('adult');expect(storage).not.toContain('logic-private-prose');
});
test('an automatically corrected own construction stays pending and is recorded as supported',async({page})=>{
  await start(page,'M79-TEXT-02');await fill(page,'Viestini tulos',-1);await pick(page,'Viestini yksikkö','kpl');
  await button(page,'Jatka omaan perusteluun').click();expect((await state(page)).lastOk).toBeUndefined();
  await solve(page,{forcedHelped:true});expect((await state(page)).progress.checked).toBe(false);
  const attempts=await page.evaluate(()=>JSON.parse(localStorage.getItem('sammakko-journey-3')!).attempts);
  expect(attempts.at(-1)).toMatchObject({assessor:'adult'});expect(attempts.at(-1).help).toContain('support');
});
test('a wrong rule and an invalid free string recover through new own work without storing prose',async({page})=>{
  await start(page,'M79-LOGIC-02');const {task:t}=await current(page);if(t.mode!=='rule')throw Error('rule');
  await fill(page,t.threshold===undefined?'Oma sääntö y =':'Kun x ≤ raja, y =','private-unrelated-prose');
  await button(page,'Tarkista merkinnät').click();expect((await state(page)).lastOk).toBe(false);
  expect(await page.evaluate(()=>JSON.stringify(localStorage))).not.toContain('private-unrelated-prose');
  await button(page,'Uusi kokeilu').click();await solve(page);
});
test('both named 3D views survive context loss and keep exact controls available',async({page})=>{
  await start(page,'M-TH-06');expect((await state(page)).renderer).toBe('webgl');await button(page,'Aava vedessä').click();
  expect((await state(page)).stage.view).toBe('water');
  await page.evaluate(()=>document.querySelector<HTMLCanvasElement>('.exp-world canvas')!.getContext('webgl2')!.getExtension('WEBGL_lose_context')!.loseContext());
  await expect.poll(async()=>(await state(page)).renderer).toBe('painted-fallback');await solve(page);
});
test('every independent family keeps givens and active decision or adult handoff visible at both sizes',async({page})=>{
  test.setTimeout(480000);await page.goto('./');
  for(const [width,height] of [[1366,768],[768,1024],[1024,768]])for(const spec of logicWorkshopSpecs)for(const family of spec.produce!){
    const seed=Array.from({length:96},(_,i)=>i).find(seed=>spec.item(rng(seed),'independent').tag===family)!;
    await page.setViewportSize({width,height});await page.evaluate(()=>(localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on')));await start(page,spec.id,seed);
    await solve(page,{height});
  }
});
