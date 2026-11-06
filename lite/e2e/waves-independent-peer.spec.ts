import {expect,test,type Page,type TestInfo} from '@playwright/test';
import {rng} from '../src/engine/rng';
import {wavesObservatorySpecs} from '../src/content/waves-observatory';
import type {WavesObservatoryTask} from '../src/content/models/waves-observatory';
import {independentlyAnswerWaves} from '../tests/waves-observatory-fixtures';
test.use({contextOptions:{reducedMotion:'reduce'},launchOptions:{args:['--enable-unsafe-swiftshader']}});
const state=(p:Page)=>p.evaluate(()=>JSON.parse(window.render_game_to_text!()));
const button=(p:Page,name:string)=>p.getByRole('button',{name,exact:true});
async function start(p:Page,id:string,seed=8){await p.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);await button(p,'Kokeilen itse').click();}
async function answer(p:Page,info?:TestInfo,helped=false){
  const before=await state(p),spec=wavesObservatorySpecs.find(s=>s.id===before.node)!;
  const task=spec.item(rng(before.seed),before.phase,{knownChecked:id=>id===(before.contentContext?.route==='particle'?'PHY79-RAD-PARTICLE':'PHY79-RAD-EM')}).task as WavesObservatoryTask;
  const a=independentlyAnswerWaves(task);
  for(const f of task.fields)await p.getByLabel(f.label,{exact:true}).selectOption(a.values[f.id]!);
  if(task.input.kind==='light')expect(before.model).not.toHaveProperty('observation');
  await button(p,'Lukitse ennuste').click();
  if(task.input.kind==='light'){
    await p.getByLabel('Esteen uusi y',{exact:true}).fill(String(a.action!.objectY));await button(p,'Tee havainto').click();
    const current=await state(p);expect(current.renderer).toBe('webgl');
    if(a.observed?.kind!=='light')throw Error('light observation');
    expect(current.model.observation.shadowLow).toBeCloseTo(a.observed.shadowLow!,10);expect(current.model.observation.shadowHigh).toBeCloseTo(a.observed.shadowHigh!,10);
  }else if(task.input.kind==='sound'){
    await p.getByLabel('Mallin taajuus Hz',{exact:true}).fill(String(a.action!.frequency));await p.getByLabel('Mallin laajuus',{exact:true}).fill(String(a.action!.amplitude));
    await button(p,'Tee havainto').click();
    const particles=p.getByRole('img',{name:'Väliaineen pisteet värähtelevät paikallisesti; häiriö etenee.',exact:true});
    const positions=await particles.locator('circle').evaluateAll(xs=>xs.map(x=>x.getAttribute('cx')));
    await button(p,'Seuraava värähtelyvaihe').click();const after=await particles.locator('circle').evaluateAll(xs=>xs.map(x=>x.getAttribute('cx')));
    if(task.input.targetAmplitude>0)expect(after).not.toEqual(positions);else expect(after).toEqual(positions);
  }
  if(task.review){
    await button(p,'Tarkista tutkimus').click();expect((await state(p)).lastOk).toBeUndefined();
    await p.getByText('Kirjoita oma selitys',{exact:true}).click();await p.getByLabel('Oma selitys',{exact:true}).fill('Private peer explanation 7442');
    await p.getByText('Kirjoita oma selitys',{exact:true}).click();
    await p.getByLabel('Aikuinen vahvistaa havainnon',{exact:true}).check();await p.getByLabel('Selityksen tuki',{exact:true}).selectOption(helped?'helped':'none');
    for(const c of task.review.criteria)await p.getByLabel(c.label,{exact:true}).selectOption('met');
  }
  if(info)await p.screenshot({path:info.outputPath(`${before.node}-${before.family}.png`)});
  const bounds=await button(p,'Tarkista tutkimus').boundingBox();expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(p.viewportSize()!.height+1);
  await button(p,'Tarkista tutkimus').click();expect((await state(p)).lastOk).toBe(true);
  expect(await p.evaluate(()=>JSON.stringify(localStorage))).not.toContain('Private peer explanation');
}
test('independent exact light oracle agrees with actual 3D through fresh cases and parallel-ray transfer',async({page},info)=>{
  test.setTimeout(90000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await start(page,'ENV-PHY-LIGHT-01');
  const identities=new Set<string>();for(let i=0;i<4;i++){
    const s=await state(page);if(i===3){expect(s.phase).toBe('transfer');expect(s.model.context).toBe('sun');}
    await answer(page,i===0||i===3?info:undefined);
    identities.add(await page.evaluate(()=>JSON.parse(localStorage.getItem('sammakko-journey-3')!).attempts.at(-1).itemKey));
    if(i<2)await button(page,'Seuraava kokeilu').click();else if(i===2)await button(page,'Kokeile uudessa tilanteessa').click();
  }
  expect(identities.size).toBe(4);expect((await state(page)).progress.checked).toBe(true);expect(errors).toEqual([]);
});
test('tablet sound changes produce local oscillation with no stored free explanation',async({page},info)=>{
  test.setTimeout(120000);await page.setViewportSize({width:1024,height:768});await page.goto('./');
  for(const seed of [0,1,4,8]){await page.evaluate(()=>localStorage.clear());await start(page,'ENV-PHY-SOUND-01',seed);await answer(page,info,true);expect((await state(page)).progress.checked).toBe(false);}
});
test('particle-only prerequisite supports an ion pair without requiring electromagnetic mastery',async({page},info)=>{
  await page.setViewportSize({width:768,height:1024});await page.goto('./');
  await page.evaluate(()=>{const node='PHY79-RAD-PARTICLE',rev='waves-observatory-phy79-rad-particle-v1';localStorage.setItem('sammakko-journey-3',JSON.stringify({v:3,events:[],effects:[],attempts:['particles','em','particles','transfer'].map((tag,i)=>({node,rev,tag,seed:60+i,phase:i===3?'transfer':'independent',ok:true,at:1000+i}))}));});
  await start(page,'PHY79-RAD-ION',1);expect((await state(page)).contentContext.route).toBe('particle');await answer(page,info);
});
test('given exposure and unknown-information cases retain their own explanation',async({page},info)=>{
  test.setTimeout(90000);await page.setViewportSize({width:1024,height:768});await page.goto('./');
  for(const seed of [0,1,8,11]){await page.evaluate(()=>localStorage.clear());await start(page,'PHY79-RAD-SAFE',seed);await answer(page,info);}
});
