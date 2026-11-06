import {expect,test,type Page} from '@playwright/test';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });
test.use({viewport:{width:1366,height:768},reducedMotion:'reduce',launchOptions:{args:['--enable-unsafe-swiftshader']}});
const button=(p:Page,name:string)=>p.getByRole('button',{name,exact:true});
const field=(p:Page,name:string)=>p.getByLabel(name,{exact:true});
const state=(p:Page)=>p.evaluate(()=>JSON.parse(window.render_game_to_text!()));
test.beforeEach(async({page},info)=>{if(!info.title.includes('WebGL'))await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type:string,...args:unknown[]){return /^webgl/.test(type)?null:Reflect.apply(get,this,[type,...args]);} as typeof get;});});
const ids=['CHEM79-CONC-01','CHEM79-CONC-COMP','CHEM79-CONC-CALC','CHEM79-ACIDBASE','CHEM79-PH','CHEM79-INDICATOR'];
async function begin(p:Page,id:string,seed=1,phase='Kokeilen itse'){
 await p.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);await button(p,phase).click();await p.locator('[data-solution-lab]').waitFor();
}
async function numeric(p:Page,name:string,value:string|number){await field(p,name).fill(String(value));}
async function select(p:Page,name:string,value:string){await field(p,name).selectOption(value);}
async function complete(p:Page,submit=true,height?:number){
 const board=p.locator('[data-solution-board]'),mode=await board.getAttribute('data-mode'),text=await board.innerText();
 if(mode==='concentration'){
  const part=Number(/Aineosa (\d+) g/i.exec(text)![1]),totalMatch=/koko liuos (\d+) g/i.exec(text),solvent=/liuotin (\d+) g/i.exec(text),whole=totalMatch?Number(totalMatch[1]):part+Number(solvent![1]);
  const aliquot=/Ota tasakoosteisesta liuoksesta (\d+) g/.exec(text),dilute=/Lisää (\d+) g/.exec(text);
  const target=aliquot?Number(aliquot[1]):whole+(dilute?Number(dilute[1]):0);
  await numeric(p,'Aineosan massa',aliquot?`${part*target}/${whole}`:part);await numeric(p,'Koko liuoksen massa',target);await select(p,'Pitoisuuden perusta','mass-mass');
  if(await field(p,'Massaprosentti').count())await numeric(p,'Massaprosentti',aliquot?`${part*100}/${whole}`:`${part*100}/${target}`);
  if(aliquot||dilute){await button(p,'Lukitse massaennuste').press('Enter');await button(p,aliquot?'Ota virtuaalinen osa':'Lisää virtuaalinen liuotin').press('Enter');}
 }else if(mode==='compare'){
  const samples=await board.locator('[data-solution-sample]').evaluateAll(nodes=>nodes.map(n=>({id:n.getAttribute('data-solution-sample')!,text:n.textContent!}))),values=samples.map(s=>({id:s.id,label:`Näyte ${s.id.toUpperCase()}`,part:Number(/Aineosa (\d+) g/.exec(s.text)![1]),whole:Number(/koko liuos (\d+) g/.exec(s.text)![1])}));
  for(const s of values){await numeric(p,`${s.label}, aineosan massa`,s.part);await numeric(p,`${s.label}, koko massa`,s.whole);}
  const [a,b]=values,x=a!.part*b!.whole,y=b!.part*a!.whole;
  await numeric(p,'Ensimmäisen aineosa kertaa toisen kokonaismassa',x);await numeric(p,'Toisen aineosa kertaa ensimmäisen kokonaismassa',y);await select(p,'Väkevämpi näyte',x===y?'same':x>y?a!.id:b!.id);
 }else if(mode==='ph'){
  const samples=await board.locator('[data-solution-ph-sample]').evaluateAll(nodes=>nodes.map(n=>({id:n.getAttribute('data-solution-ph-sample')!,text:n.textContent!})));
  const values=samples.map(s=>{const given=/Mitattu pH ([\d.]+)/.exec(s.text),value=given?Number(given[1]):s.text.includes('Hapan')?6.5:s.text.includes('Emäksinen')?7.5:7;return {...s,label:s.text.split(/Mitattu|Pyydetty/)[0]!.trim(),value};});
  for(const s of values){await numeric(p,`${s.label}, oma pH`,s.value);await select(p,`${s.label}, happamuusluokka`,s.value<7?'acidic':s.value>7?'basic':'neutral');}
  if(await field(p,'Järjestyksen paikka 1').count())for(const [i,s] of [...values].sort((a,b)=>a.value-b.value).entries())await select(p,`Järjestyksen paikka ${i+1}`,s.id);
  if(await field(p,'Aktiivisuuksien suhde').count()){
   const a=values.find(s=>s.id==='1')!,b=values.find(s=>s.id==='2')!;
   await select(p,'Vertailuparin happamampi',a.value===b.value?'same':a.value<b.value?a.id:b.id);await numeric(p,'Aktiivisuuksien suhde',String(10n**BigInt(Math.abs(a.value-b.value))));
  }
 }else{
  // Independently pinned primary-reference limits. Endpoints use the visible teaching-table convention.
  const definitions=[{name:'Metyylioranssi',low:'Punainen',high:'Keltainen',a:3.2,b:4.4},{name:'Bromitymolisininen',low:'Keltainen',high:'Sininen',a:6,b:7.6},{name:'Fenoliftaleiini',low:'Väritön',high:'Vaaleanpunainen',a:8.2,b:10}];
  let lo=0,hi=14,loClosed=true,hiClosed=true;
  for(const definition of definitions){
   const color=new RegExp(`${definition.name} · näytteen havainto ([^\\n]+)`).exec(text)?.[1];if(!color)continue;
   const a=color===definition.low?0:color===definition.high?definition.b:definition.a,b=color===definition.low?definition.a:color===definition.high?14:definition.b,
    ac=color!==definition.high,bc=color!==definition.low;
   if(a>lo){lo=a;loClosed=ac;}else if(a===lo)loClosed&&=ac;
   if(b<hi){hi=b;hiClosed=bc;}else if(b===hi)hiClosed&&=bc;
  }
  const consistent=lo<hi||lo===hi&&loClosed&&hiClosed;await select(p,'Havaintojen yhteensopivuus',consistent?'yes':'no');
  if(consistent){
   await numeric(p,'Sallitun alueen alaraja',lo);await numeric(p,'Sallitun alueen yläraja',hi);await field(p,'Alaraja kuuluu mukaan').setChecked(loClosed);await field(p,'Yläraja kuuluu mukaan').setChecked(hiClosed);
   await field(p,'Mahdollinen luokka hapan').setChecked(lo<7);await field(p,'Mahdollinen luokka neutraali').setChecked((lo<7||lo===7&&loClosed)&&(hi>7||hi===7&&hiClosed));await field(p,'Mahdollinen luokka emäksinen').setChecked(hi>7);
  }
 }
 if(height){
  for(const control of [board,button(p,'Tarkista tutkimusikkuna')]){const b=await control.boundingBox();expect(b).not.toBeNull();expect(b!.y).toBeGreaterThanOrEqual(0);expect(b!.y+b!.height).toBeLessThanOrEqual(height);}
  for(const control of await p.locator('[data-solution-lab] input:visible,[data-solution-lab] select:visible').all()){
   const b=await control.boundingBox();expect(b).not.toBeNull();expect(b!.x).toBeGreaterThanOrEqual(0);expect(b!.x+b!.width).toBeLessThanOrEqual((await p.viewportSize())!.width);expect(b!.y+b!.height).toBeLessThanOrEqual(height);
  }
 }
 if(!submit)return;
 await button(p,'Tarkista tutkimusikkuna').click();
 if(mode==='indicator'){
  await button(p,'Olen kertonut selitykseni').click();
  // Synthetic adult fixture exercises the handoff, without claiming a human explanation was evaluated.
  await select(p,'Yhdistää havainnot selitteisiin','met');await select(p,'Perustelee tarkkuusrajan','met');await select(p,'Saiko oppija apua?','none');await p.getByText('Kuulin oppijan oman selityksen.',{exact:true}).click();
  if(height){const box=await button(p,'Vahvista havainto').boundingBox();expect(box).not.toBeNull();expect(box!.y+box!.height).toBeLessThanOrEqual(height);await p.screenshot({path:`output/playwright/solution-lab/indicator-adult-${height}.png`,animations:'disabled'});}
  await button(p,'Vahvista havainto').click();
 }
 await expect.poll(async()=>(await state(p)).lastOk).toBe(true);
}
test('six targets accept own exact production across3fresh plus transfer',async({page})=>{
 test.setTimeout(240000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const id of ids){await page.goto('./');await page.evaluate(()=>(localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on')));await begin(page,id);for(let i=0;i<4;i++){await complete(page);if(i<2)await button(page,'Seuraava kokeilu').click();else if(i===2)await button(page,'Kokeile uudessa tilanteessa').click();}expect((await state(page)).progress.checked,id).toBe(true);}
 expect(errors).toEqual([]);
});
test('whole-solution denominator misconception requires recovery and help remains supported',async({page})=>{
 await begin(page,'CHEM79-CONC-CALC',1);const given=await page.locator('[data-solution-board]').innerText(),part=Number(/Aineosa (\d+) g/i.exec(given)![1]),whole=Number(/koko liuos (\d+) g/i.exec(given)![1]),added=Number(/Lisää (\d+) g/.exec(given)?.[1]??0),wrongWhole=whole-part+added;
 await numeric(page,'Aineosan massa',part);await numeric(page,'Koko liuoksen massa',wrongWhole);await numeric(page,'Massaprosentti',`${part*100}/${wrongWhole}`);await select(page,'Pitoisuuden perusta','mass-mass');
 if(await button(page,'Lukitse massaennuste').count()){await button(page,'Lukitse massaennuste').click();await button(page,'Lisää virtuaalinen liuotin').click();}
 await button(page,'Tarkista tutkimusikkuna').click();expect((await state(page)).lastOk).toBe(false);await button(page,'Uusi kokeilu').click();await button(page,'Pieni vihje').click();await complete(page);expect((await state(page)).progress.checked).toBe(false);
});
test('both families keep source data and essential controls within desktop and tablet',async({page})=>{
 test.setTimeout(240000);for(const [width,height] of [[1366,768],[768,1024]])for(const id of ids)for(const seed of [0,1]){
  await page.setViewportSize({width,height});await page.goto('./');await page.evaluate(()=>(localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on')));await begin(page,id,seed,'Tutkitaan yhdessä');await complete(page,id==='CHEM79-INDICATOR',height);
  if(seed===0&&['CHEM79-CONC-CALC','CHEM79-INDICATOR','CHEM79-PH'].includes(id))await page.screenshot({path:`output/playwright/solution-lab/${id}-${width}.png`,animations:'disabled'});
 }
});
test('indicator adult review is pending until own explanation handoff and stores no local feedback',async({page})=>{
 await begin(page,'CHEM79-INDICATOR',1);await complete(page,false);await button(page,'Tarkista tutkimusikkuna').click();expect((await state(page)).lastOk).toBeUndefined();
 await button(page,'Olen kertonut selitykseni').click();await page.getByText('Tallennus ja vapaa palaute',{exact:true}).click();const secret='PRIVATE_SOLUTION_NOTE928';await field(page,'Vapaa palaute tähän hetkeen').fill(secret);
 await select(page,'Yhdistää havainnot selitteisiin','met');await select(page,'Perustelee tarkkuusrajan','met');await select(page,'Saiko oppija apua?','helped');await page.getByText('Kuulin oppijan oman selityksen.',{exact:true}).click();await button(page,'Vahvista havainto').click();expect((await state(page)).lastOk).toBe(true);expect((await state(page)).progress.checked).toBe(false);
 expect(await page.evaluate(()=>JSON.stringify(localStorage))).not.toContain(secret);expect(JSON.stringify(await state(page))).not.toContain(secret);
});

test('primary2D workspace remains operable beside actual WebGL archipelago',async({page})=>{
 test.setTimeout(90000);await begin(page,'CHEM79-CONC-COMP',1);expect((await state(page)).renderer).toBe('webgl');await button(page,'Pysäytä maiseman liike').click();await complete(page);
 await page.screenshot({path:'output/playwright/solution-lab/webgl-comparison.png',animations:'disabled'});
});

test('worked demonstration and answer explanation remain separate from independent evidence',async({page})=>{
 await begin(page,'CHEM79-CONC-CALC',0);await numeric(page,'Aineosan massa',0);await numeric(page,'Koko liuoksen massa',0);await numeric(page,'Massaprosentti',0);await select(page,'Pitoisuuden perusta','mass-mass');
 if(await button(page,'Lukitse massaennuste').count()){await button(page,'Lukitse massaennuste').click();await button(page,'Lisää virtuaalinen liuotin').click();}
 await button(page,'Tarkista tutkimusikkuna').click();expect((await state(page)).lastOk).toBe(false);await button(page,'Näytä ja selitä').click();
 await expect(page.locator('[data-solution-worked]')).toBeVisible();expect((await state(page)).progress.checked).toBe(false);
 await button(page,'Uusi yhteinen kokeilu').click();await button(page,'Katso mallia').click();await button(page,'Seuraava havainto').click();await expect(page.locator('[data-solution-worked]')).toBeVisible();
 await button(page,'Kokeilen yhdessä').click();await complete(page);expect((await state(page)).progress.checked).toBe(false);
});

test('wrong indicator range waits for its own explanation and keeps adult assistance on failure',async({page})=>{
 await begin(page,'CHEM79-INDICATOR',1);await complete(page,false);await select(page,'Havaintojen yhteensopivuus','yes');
 await numeric(page,'Sallitun alueen alaraja',0);await numeric(page,'Sallitun alueen yläraja',14);await field(page,'Alaraja kuuluu mukaan').check();await field(page,'Yläraja kuuluu mukaan').check();
 for(const label of ['hapan','neutraali','emäksinen'])await field(page,`Mahdollinen luokka ${label}`).check();
 await button(page,'Tarkista tutkimusikkuna').click();expect((await state(page)).lastOk).toBeUndefined();expect((await state(page)).answered).toBe(false);
 await button(page,'Olen kertonut selitykseni').click();await select(page,'Yhdistää havainnot selitteisiin','met');await select(page,'Perustelee tarkkuusrajan','met');await select(page,'Saiko oppija apua?','helped');await page.getByText('Kuulin oppijan oman selityksen.',{exact:true}).click();
 await button(page,'Vahvista havainto').click();expect((await state(page)).lastOk).toBe(false);expect((await state(page)).help).toContain('support');
 await button(page,'Uusi kokeilu').click();await complete(page);expect((await state(page)).progress.checked).toBe(false);
});
