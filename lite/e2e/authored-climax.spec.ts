import { expect,test,type Page } from '@playwright/test';
test.use({launchOptions:{args:['--enable-unsafe-swiftshader']}});
const ids=['M-FRAC-13','M-GMEAS-05','M-SCALE-03','PHY79-FORCE-MOTION','PHY79-ACTIONPAIR','PHY79-PARALLEL','CHEM79-FIRE-SAFE','M-GEO-06','M-GEO-17','M79-POWER-POWER','PHY79-UNIVERSE-STRUCT','M-REP-02'];
type State={charactersVisible?:boolean;renderer:string;node:string;model:{segmentsCm:number[];metersPerCm:number};climax:{activeNode:string|null;phase:string;remaining:number;fixtures:string[]};stage:{kind:string|null}};
const state=(page:Page):Promise<State>=>page.evaluate(()=>JSON.parse(window.render_game_to_text!()));
const save=(page:Page)=>page.evaluate(()=>JSON.parse(localStorage.getItem('sammakko-journey-3')??'null'));
async function numberAnswer(page:Page,value:number){for(const digit of String(value))await page.locator('.exp-task .keys').getByRole('button',{name:digit,exact:true}).click();await page.locator('.exp-task .keys').getByRole('button',{name:'OK',exact:true}).click();}

test.beforeEach(async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 if(info.title.includes('WebGL lifecycle'))return;
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){return /^webgl/.test(type)?null:Reflect.apply(original,this,[type,...args])} as typeof original});
});

test('a real guided resolution starts memory; skip and replay do not record again',async({page})=>{
 await page.goto('./?qa=1&full=1&seed=1#saaristo/M-SCALE-03');await expect(page.getByRole('button',{name:'Katso retkimuisto'})).toHaveCount(0);
 await page.getByRole('button',{name:'Tutkitaan yhdessä',exact:true}).click();
 for(let i=0;i<2;i++){const m=(await state(page)).model;await numberAnswer(page,m.segmentsCm.reduce((a,b)=>a+b,0)*m.metersPerCm);if(!i)await page.getByRole('button',{name:'Toinen yhteinen kokeilu'}).click();}
 const before=await save(page);expect(before.events).toHaveLength(1);expect((await state(page)).climax).toMatchObject({activeNode:'M-SCALE-03',phase:'start'});
 await page.getByRole('button',{name:'Näytä retkimuiston lopputilanne'}).click();expect((await state(page)).climax).toMatchObject({phase:'end',remaining:0});
 await page.getByRole('button',{name:'Takaisin tutkimukseen'}).click();expect((await state(page)).climax.activeNode).toBeNull();await page.getByRole('button',{name:'Katso retkimuisto'}).click();expect((await state(page)).climax.phase).toBe('start');expect(await save(page)).toEqual(before);
});

test('all twelve saved memories restore silently and have usable tablet fallback states',async({page})=>{
 const saved={v:3,attempts:[],events:ids.map(id=>({id:`story.${id}.resolved`,node:id,at:1,assisted:true})),effects:ids.map(id=>`world.${id}.resolved`)};
 await page.goto('./');await page.evaluate(value=>localStorage.setItem('sammakko-journey-3',JSON.stringify(value)),saved);await page.reload();
 for(const [width,height] of [[1366,768],[768,1024]]) {
 await page.setViewportSize({width,height});
 for(const id of ids){
  await page.goto(`./?qa=1&full=1&seed=1#saaristo/${id}`);await page.getByRole('button',{name:'Katso retkimuisto'}).click();let current=await state(page);expect(current.climax).toMatchObject({activeNode:id,phase:'start'});expect(current.climax.fixtures).toHaveLength(12);
  const panel=page.getByRole('dialog',{name:'Retkimuisto'});await expect(panel.locator('svg')).toBeVisible();const start=await panel.locator('svg').innerHTML();
  for(const name of ['Näytä retkimuiston lopputilanne','Takaisin tutkimukseen']){const box=await panel.getByRole('button',{name}).boundingBox();expect(box).not.toBeNull();expect(box!.y).toBeGreaterThanOrEqual(0);expect(box!.y+box!.height).toBeLessThanOrEqual(height);}
  await panel.getByRole('button',{name:'Näytä retkimuiston lopputilanne'}).click();current=await state(page);expect(current.climax.phase).toBe('end');expect(await panel.locator('svg').innerHTML()).not.toBe(start);
  await panel.getByRole('button',{name:'Takaisin tutkimukseen'}).click();expect((await state(page)).climax.activeNode).toBeNull();
 }
 }
 expect((await save(page)).events).toHaveLength(12);expect((await save(page)).attempts).toHaveLength(0);
});


test.describe('WebGL lifecycle',()=>{
 test('WebGL lifecycle restores characters, switches to SVG on loss, and never records replay',async({page})=>{
  test.setTimeout(90000);await page.setViewportSize({width:1366,height:768});
  const id='M-GEO-17',saved={v:3,attempts:[],events:[{id:`story.${id}.resolved`,node:id,at:1,assisted:true}],effects:[`world.${id}.resolved`]};
  await page.goto('./');await page.evaluate(value=>localStorage.setItem('sammakko-journey-3',JSON.stringify(value)),saved);await page.reload();
  await page.goto(`./?qa=1&full=1&seed=1#saaristo/${id}`);await expect(page.getByRole('button',{name:'Katso retkimuisto'})).toBeVisible();await expect.poll(async()=>(await state(page)).renderer,{timeout:30000}).toBe('webgl');
  expect((await state(page)).charactersVisible).toBe(true);await page.getByRole('button',{name:'Katso retkimuisto'}).click();
  let current=await state(page);expect(current.climax).toMatchObject({activeNode:id,phase:'start',remaining:10000});expect(current.charactersVisible).toBe(false);
  await page.evaluate(()=>window.advanceTime?.(50));expect((await state(page)).climax.remaining).toBe(10000);
  await page.getByRole('button',{name:'Näytä retkimuiston lopputilanne'}).click();expect((await state(page)).climax.phase).toBe('end');
  await page.getByRole('button',{name:'Takaisin tutkimukseen'}).click();expect((await state(page)).charactersVisible).toBe(true);expect((await state(page)).climax.activeNode).toBeNull();
  await page.getByRole('button',{name:'Katso retkimuisto'}).click();
  const lost=await page.evaluate(()=>{const canvas=document.querySelector<HTMLCanvasElement>('.exp-world canvas');const context=canvas?.getContext('webgl2');const ext=context?.getExtension('WEBGL_lose_context');if(!ext)return false;ext.loseContext();return true;});expect(lost).toBe(true);
  await expect.poll(async()=>(await state(page)).renderer,{timeout:15000}).toBe('painted-fallback');const panel=page.getByRole('dialog',{name:'Retkimuisto'});await expect(panel.locator('svg')).toBeVisible();await panel.getByRole('button',{name:'Näytä retkimuiston lopputilanne'}).click();expect((await state(page)).climax.phase).toBe('end');
  await panel.getByRole('button',{name:'Takaisin tutkimukseen'}).click();expect((await state(page)).charactersVisible).toBe(true);expect(await save(page)).toEqual(saved);
  await page.goto('./?qa=1&full=1&seed=1#saaristo/M-GEO-06');await expect(page.getByRole('button',{name:'Tutkitaan yhdessä',exact:true})).toBeVisible();expect((await state(page)).climax.activeNode).toBeNull();expect(await save(page)).toEqual(saved);
 });
});
