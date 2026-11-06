import { expect,test,type Page } from '@playwright/test';
type Lift={forceN:number;distanceM:number;durationS:number;direction:string};
type State={family:string;lastOk?:boolean;renderer:string;model:{lifts:Lift[]};stage:{results?:{workJ:number;powerW:number;positionM:number}[]}};
const state=(p:Page):Promise<State>=>p.evaluate(()=>JSON.parse(window.render_game_to_text!()));
async function begin(p:Page,id:string,seed=0){await p.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);await p.reload();await p.getByRole('button',{name:'Tutkitaan yhdessä',exact:true}).click();}
test.beforeEach(async({page})=>{await page.emulateMedia({reducedMotion:'reduce'});if(process.env.WORK_POWER_WEBGL)return;await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){return /^webgl/.test(type)?null:Reflect.apply(original,this,[type,...args])} as typeof original});});
test('learner calculates work with keyboard and sees the model outcome',async({page})=>{
 await begin(page,'PHY79-WORK-CALC');const s=await state(page),l=s.model.lifts[0]!;
 await expect(page.locator('.exp-exact')).toContainText(`${l.forceN} N`);await expect(page.locator('.exp-exact')).toContainText(`${l.distanceM} m`);
 if(process.env.WORK_POWER_WEBGL){expect(s.renderer).toBe('webgl');expect(s.stage.results).toBeUndefined();}
 await page.keyboard.type(String(l.forceN*l.distanceM));await page.keyboard.press('Enter');expect((await state(page)).lastOk).toBe(true);
 await expect(page.locator('.exp-exact')).toContainText('1 J = 1 N·m');
 if(process.env.WORK_POWER_WEBGL){await page.getByRole('button',{name:'Näytä liikkeen lopputilanne'}).click();expect((await state(page)).stage.results?.[0]).toMatchObject({workJ:l.forceN*l.distanceM,positionM:l.distanceM});}
});
test('power comparison distinguishes same work from power and gives full reduced-motion outcome',async({page})=>{
 await begin(page,'PHY79-POWER-CONCEPT');const s=await state(page),same=s.family==='same-work';
 await page.locator('.exp-task button.opt').filter({hasText:same?'A:n teho on suurempi':'Tehot ovat yhtä suuret'}).click();expect((await state(page)).lastOk).toBe(true);
 await expect(page.locator('.exp-exact')).toContainText('10 W');
 if(process.env.WORK_POWER_WEBGL){await page.getByRole('button',{name:'Näytä liikkeen lopputilanne'}).click();const result=(await state(page)).stage.results!;expect(result[0]!.positionM).toBe(s.model.lifts[0]!.distanceM);expect(result[1]!.positionM).toBe(s.model.lifts[1]!.distanceM);}
});
test('essential work inputs and answer controls fit desktop and tablet',async({page})=>{
 for(const [width,height] of [[1366,768],[768,1024]]){await page.setViewportSize({width,height});await begin(page,'PHY79-WORK-CALC');for(const loc of [page.locator('.exp-exact'),page.locator('.exp-task .display'),page.locator('.exp-task .keys').getByRole('button',{name:'OK',exact:true})]){const b=await loc.boundingBox();expect(b).not.toBeNull();expect(b!.y).toBeGreaterThanOrEqual(0);expect(b!.y+b!.height).toBeLessThanOrEqual(height);}}
});
test('wrong work does not resolve the story; guided retry can resolve it',async({page})=>{
 await begin(page,'PHY79-WORK-CALC');await page.keyboard.type('999');await page.keyboard.press('Enter');expect((await state(page)).lastOk).toBe(false);
 let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sammakko-journey-3')??'null'));expect(saved?.events??[]).toHaveLength(0);
 await page.getByRole('button',{name:'Uusi kokeilu'}).click();let l=(await state(page)).model.lifts[0]!;await page.keyboard.type(String(l.forceN*l.distanceM));await page.keyboard.press('Enter');expect((await state(page)).lastOk).toBe(true);
 await page.getByRole('button',{name:'Toinen yhteinen kokeilu'}).click();l=(await state(page)).model.lifts[0]!;await page.keyboard.type(String(l.forceN*l.distanceM));await page.keyboard.press('Enter');
 saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sammakko-journey-3')??'null'));expect(saved.events).toEqual(expect.arrayContaining([expect.objectContaining({node:'PHY79-WORK-CALC',assisted:true})]));
});
test.describe('touch power input',()=>{
 test.use({hasTouch:true,viewport:{width:768,height:1024}});
 test('produces a numeric power using the on-screen keys',async({page})=>{
  await begin(page,'PHY79-POWER-CALC');const l=(await state(page)).model.lifts[0]!,answer=l.forceN*l.distanceM/l.durationS;
  for(const digit of String(answer)) await page.locator('.exp-task .keys').getByRole('button',{name:digit,exact:true}).tap();
  await page.locator('.exp-task .keys').getByRole('button',{name:'OK',exact:true}).tap();expect((await state(page)).lastOk).toBe(true);await expect(page.locator('.exp-exact')).toContainText('J/s');
 });
});
