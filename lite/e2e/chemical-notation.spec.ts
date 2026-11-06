import { expect,test,type Page } from '@playwright/test';
import { chemicalNotationSpecs } from '../src/content/chemical-notation';
import { rng } from '../src/engine/rng';

test.use({launchOptions:{args:['--enable-unsafe-swiftshader']}});

type Inventory=Record<string,number>;
const work=(p:Page)=>p.locator('[data-chemical-notation]');
const given=(p:Page)=>p.locator('[data-chemical-givens]');
const field=(p:Page,name:string)=>p.getByLabel(name,{exact:true});
const btn=(p:Page,name:string)=>p.getByRole('button',{name,exact:true});
const fill=(p:Page,name:string,n:number|string)=>field(p,name).fill(String(n));
const select=(p:Page,name:string,value:string)=>field(p,name).selectOption(value);
const snapshot=(p:Page)=>p.evaluate(()=>JSON.parse(window.render_game_to_text!()));
const ids=chemicalNotationSpecs.map(spec=>spec.id);
const seedFor=(id:string,family:number)=>{
  const spec=chemicalNotationSpecs.find(spec=>spec.id===id)!;
  return Array.from({length:60},(_,i)=>i).find(seed=>spec.item(rng(seed),'independent').tag===spec.produce![family])!;
};
function atomCounts(raw:string):Inventory{
  // Independent token expansion for the visible school formulas.
  const flat=raw.replace(/\(([A-Za-z0-9]+)\)(\d+)/g,(_,inside:string,multiplier:string)=>inside.repeat(Number(multiplier)));
  const counts:Inventory={};
  for(const token of flat.matchAll(/([A-Z][a-z]?)(\d*)/g))counts[token[1]!]=(counts[token[1]!]??0)+Number(token[2]||1);
  return counts;
}
async function start(p:Page,id:string,seed=1,independent=true){
  await p.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await btn(p,independent?'Kokeilen itse':'Tutkitaan yhdessä').click();
  await expect(work(p)).toBeVisible();
}
async function verify(p:Page,ok:boolean){
  await btn(p,'Valmis').press('Enter');await expect.poll(async()=>(await snapshot(p)).lastOk).toBe(ok);
}
async function inventory(p:Page,prefix:string,counts:Inventory,factor=1){
  const fields=work(p).locator(`input[aria-label^="${prefix}, "]`);
  for(const entry of await fields.all()){
    const symbol=(await entry.getAttribute('aria-label'))!.split(', ')[1]!;
    await entry.fill(String((counts[symbol]??0)*factor));
  }
}
async function solveFormula(p:Page,wrongModel=false){
  const raw=(await given(p).locator('[data-chemical-formula]').first().getAttribute('data-chemical-formula'))!;
  const counts=atomCounts(raw);
  for(const input of await work(p).locator('input[type=checkbox]').all()){
    const element=(await input.getAttribute('aria-label'))!.split(' ')[1]!;
    await input.setChecked(!!counts[element]);
  }
  await inventory(p,'Lukusuhde',counts,2);await inventory(p,'Koostumus',counts);
  if(wrongModel){const symbol=Object.keys(counts)[0]!;await fill(p,`Koostumus, ${symbol}`,counts[symbol]!+1);}
}
async function solveSubscript(p:Page){
  const formula=given(p).locator('[data-chemical-formula]');
  const raw=(await formula.getAttribute('data-chemical-formula'))!,target=await formula.locator('u').innerText();
  const [,element,index]=/([A-Z][a-z]?)(\d*)/.exec(target)!;
  await select(p,'Alaindeksin alkuaine',element!);await fill(p,'Paikallinen atomimäärä',Number(index||1));
  await select(p,'Onko ykkönen jätetty kirjoittamatta',index?'no':'yes');await inventory(p,'Koko kaava',atomCounts(raw));
}
async function solveGroups(p:Page){
  const formula=given(p).locator('[data-chemical-formula]');
  const raw=(await formula.getAttribute('data-chemical-formula'))!;
  const fromModels=await given(p).locator('[data-chemical-model]').count();
  const n=fromModels||Number(await formula.evaluate(node=>node.previousElementSibling!.textContent));
  await fill(p,'Kokonaisten kaavaryhmien määrä',n);await inventory(p,'Atomit yhteensä',atomCounts(raw),n);
  return n;
}
async function reactionData(p:Page){
  return given(p).locator('[data-chemical-formula]').evaluateAll(nodes=>{
    const list=nodes.map(node=>node.getAttribute('data-chemical-formula')!);
    const siblings=[...nodes[0]!.parentElement!.parentElement!.children];
    const arrow=siblings.findIndex(node=>node.textContent==='→');
    const left=siblings.slice(0,arrow).filter(node=>node.querySelector('[data-chemical-formula]')).length;
    return {list,left};
  });
}
async function solveBalance(p:Page,scale=1,wrongLedger=false){
  const {list,left}=await reactionData(p),counts=list.map(atomCounts);
  const elements=[...new Set(counts.flatMap(row=>Object.keys(row)))];
  const coefficient=Array(list.length).fill(1) as number[];
  let found:number[]|undefined;
  function visit(i:number){
    if(found)return;
    if(i===list.length){
      if(elements.every(symbol=>counts.reduce((n,row,j)=>n+(j<left?1:-1)*(row[symbol]??0)*coefficient[j]!,0)===0))found=[...coefficient];
      return;
    }
    for(let n=1;n<=12&&!found;n++){coefficient[i]=n;visit(i+1);}
  }
  visit(0);if(!found)throw Error('Visible equation has no positive balance');
  const totals=[{},{}] as [Inventory,Inventory];
  for(const [i,n] of found.entries()){
    await fill(p,`Kaavan ${i+1} kerroin`,n*scale);
    for(const [symbol,count] of Object.entries(counts[i]!))totals[i<left?0:1][symbol]=(totals[i<left?0:1][symbol]??0)+n*scale*count;
  }
  await inventory(p,'Vasen atomimäärä',totals[0]);await inventory(p,'Oikea atomimäärä',totals[1]);
  if(wrongLedger)await fill(p,`Vasen atomimäärä, ${elements[0]}`,totals[0][elements[0]!]!+1);
}
async function solveRoles(p:Page){
  const {list,left}=await reactionData(p);
  for(let i=0;i<list.length;i++)await select(p,`Aineen ${i+1} rooli`,i<left?'reactant':'product');
  await select(p,'Reaktionuolen merkitys','change');
}
async function solveSymbols(p:Page){
  for(let i=1;i<=3;i++){
    const row=work(p).locator('select').nth((i-1)*2).locator('..').locator('..');
    const description=(await row.innerText()).split('\n')[0]!;
    const name=/\(([^)]+)\)/.exec(description)?.[1];
    const shown=/Näyte \d+ · ([A-Za-z]+)/.exec(description)![1]!;
    const element=field(p,`Näytteen ${i} alkuaine`);
    const value=name?await element.locator('option').evaluateAll((options,name)=>options.find(option=>option.textContent===name)!.getAttribute('value')!,name):shown;
    await element.selectOption(value);await select(p,`Näytteen ${i} tarkka merkki`,value);
  }
}
async function solveCurrent(p:Page){
  switch(await work(p).getAttribute('data-chemical-notation')){
    case 'formula':return solveFormula(p);
    case 'subscript':return solveSubscript(p);
    case 'groups':return solveGroups(p);
    case 'symbols':return solveSymbols(p);
    case 'balance':return solveBalance(p,2);
    case 'roles':return solveRoles(p);
    default:throw Error('Unknown workbench');
  }
}
async function fallback(p:Page){await p.addInitScript(()=>{
  const old=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){return /^webgl/.test(type)?null:Reflect.apply(old,this,[type,...args]);} as typeof old;
});}

test('symbol labels retain case and match the supplied element table',async({page})=>{
  await fallback(page);await start(page,'CHEM79-SYMBOL',seedFor('CHEM79-SYMBOL',1));
  await solveSymbols(page);await verify(page,true);
});
test('formula integration needs species, ratio and its own complete model, with hint recovery',async({page})=>{
  await fallback(page);await start(page,'CHEM79-FORMULA');
  await solveFormula(page,true);await verify(page,false);
  await expect(page.locator('.exp-feedback')).toContainText('koostumusmalli');
  await btn(page,'Uusi kokeilu').click();await btn(page,'Pieni vihje').click();
  await solveFormula(page);await verify(page,true);expect((await snapshot(page)).progress.checked).toBe(false);
});
test('implicit one is local while the entire formula inventory includes repeated symbols',async({page})=>{
  const spec=chemicalNotationSpecs.find(spec=>spec.id==='CHEM79-SUBSCRIPT')!;
  const seed=Array.from({length:300},(_,i)=>i).find(seed=>{
    const item=spec.item(rng(seed),'independent'),task=item.task;
    return item.tag===spec.produce![1]&&task.kind==='chemical-notation'&&task.mode==='subscript'&&task.sample.formula==='CH3COOH';
  })!;
  expect(seed).toBeDefined();await fallback(page);await start(page,'CHEM79-SUBSCRIPT',seed);
  await solveSubscript(page);await verify(page,true);
});
test('own whole-group changes preserve the fixed formula and multiply all atom species',async({page})=>{
  await fallback(page);await start(page,'CHEM79-COEFF',seedFor('CHEM79-COEFF',0));
  await btn(page,'Lisää ryhmä').press('Enter');expect(await field(page,'Kokonaisten kaavaryhmien määrä').inputValue()).toBe('1');
  await btn(page,'Poista ryhmä').click();expect(await field(page,'Kokonaisten kaavaryhmien määrä').inputValue()).toBe('0');
  await fill(page,'Kokonaisten kaavaryhmien määrä',1000);await btn(page,'Lisää ryhmä').click();
  expect(await field(page,'Kokonaisten kaavaryhmien määrä').inputValue()).toBe('1000');
  const n=await solveGroups(page);await expect(work(page).locator('[data-chemical-model]')).toHaveCount(n);await verify(page,true);
});
test('scaled own balances keep atoms conserved across three fresh problems and transfer',async({page},info)=>{
  test.setTimeout(100_000);await fallback(page);await start(page,'CHEM79-BALANCE');
  for(let i=0;i<4;i++){
    expect((await snapshot(page)).phase).toBe(i===3?'transfer':'independent');
    await solveBalance(page,2);
    if(i===3)await page.screenshot({animations:'disabled',path:info.outputPath('balance-transfer.png')});
    await verify(page,true);
    if(i<2)await btn(page,'Seuraava kokeilu').click();if(i===2)await btn(page,'Kokeile uudessa tilanteessa').click();
  }
  expect((await snapshot(page)).progress.checked).toBe(true);
});
test('real WebGL backdrop supports own role and arrow interpretation with exact 2D notation',async({page},info)=>{
  test.setTimeout(110_000);const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await start(page,'CHEM79-REACTION-EQ-01');
  await expect.poll(async()=>(await snapshot(page)).renderer,{timeout:60_000}).toBe('webgl');
  await solveRoles(page);await page.screenshot({animations:'disabled',path:info.outputPath('reaction-webgl.png')});await verify(page,true);expect(errors).toEqual([]);
});
for(const viewport of [{width:1366,height:768},{width:768,height:1024}])test(`all 16 families keep givens, own models and controls visible at ${viewport.width}×${viewport.height}`,async({page},info)=>{
  test.setTimeout(100_000);await fallback(page);await page.setViewportSize(viewport);
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  for(const id of ids)for(const family of [0,1]){
    await start(page,id,seedFor(id,family));await solveCurrent(page);
    await expect(given(page),`${id} givens`).toBeInViewport({ratio:1});
    await expect(work(page),`${id} model and controls`).toBeInViewport({ratio:1});
    await expect(btn(page,'Valmis'),id).toBeInViewport({ratio:1});
    for(const control of await work(page).locator('input:not([type=checkbox]),select,button').all()){
      const box=(await control.boundingBox())!;expect(Math.round(box.width*100)/100,id).toBeGreaterThanOrEqual(44);expect(Math.round(box.height*100)/100,id).toBeGreaterThanOrEqual(44);
    }
    for(const checkbox of await work(page).locator('input[type=checkbox]').all()){
      const target=(await checkbox.locator('..').boundingBox())!;
      expect(Math.round(target.height*100)/100,id).toBeGreaterThanOrEqual(44);
      expect(target.width,id).toBeGreaterThanOrEqual(44);
    }
    if(['CHEM79-FORMULA','CHEM79-COEFF'].includes(id))await page.screenshot({animations:'disabled',path:info.outputPath(`${id}-${family}.png`)});
  }
  expect(errors).toEqual([]);
});

for(const id of ids.filter(id=>id!=='CHEM79-BALANCE'))test(`${id} produces three fresh independent instances and its changed-context transfer`,async({page})=>{
  test.setTimeout(65_000);await fallback(page);await start(page,id);
  for(let i=0;i<4;i++){
    expect((await snapshot(page)).phase).toBe(i===3?'transfer':'independent');
    await solveCurrent(page);await verify(page,true);
    if(i<2)await btn(page,'Seuraava kokeilu').click();
    if(i===2)await btn(page,'Kokeile uudessa tilanteessa').click();
  }
  expect((await snapshot(page)).progress.checked).toBe(true);
});


test('a supported coefficient of 1000 accepts atom inventories above 1000 through the real form',async({page})=>{
  const spec=chemicalNotationSpecs.find(spec=>spec.id==='CHEM79-BALANCE')!;
  const seed=Array.from({length:100},(_,i)=>i).find(seed=>{
    const task=spec.item(rng(seed),'independent').task;
    return task.kind==='chemical-notation'&&task.mode==='balance'&&
      [...task.reaction.left,...task.reaction.right].map(s=>s.formula).sort().join(',')==='H2,H2O,O2';
  })!;
  expect(seed).toBeDefined();await fallback(page);await start(page,'CHEM79-BALANCE',seed);
  await solveBalance(page,500);
  expect(await field(page,'Vasen atomimäärä, H').inputValue()).toBe('2000');
  expect(await field(page,'Vasen atomimäärä, H').evaluate(input=>(input as HTMLInputElement).max)).toBe('2048000');
  await fill(page,'Vasen atomimäärä, H',192000);
  expect(await field(page,'Vasen atomimäärä, H').evaluate(input=>(input as HTMLInputElement).validity.valid)).toBe(true);
  await fill(page,'Vasen atomimäärä, H',2000);
  await verify(page,true);
});
