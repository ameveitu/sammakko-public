import { expect, test, type Page } from '@playwright/test';

type State = {node:string;family:string;taskKind:string;lastOk?:boolean;model:{kind:string;rotation:number;site:'A'|'B';siteOffset:0|180;mode:string;latitude:number;month:'june'|'december';pair:string}};
const state=(page:Page):Promise<State>=>page.evaluate(()=>JSON.parse(window.render_game_to_text!()));
async function begin(page:Page,id:string,seed=0) { await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`); await page.reload(); await page.getByRole('button',{name:'Tutkitaan yhdessä',exact:true}).click(); }

test.beforeEach(async ({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){return /^webgl/.test(type)?null:Reflect.apply(original,this,[type,...args])} as typeof original});
});

test('day model rotates in steps before the learner predicts; correct and wrong are distinct',async({page})=>{
  await begin(page,'ENV-PHY-DAYNIGHT-01');
  const current=await state(page); expect(current.model.kind).toBe('observatory-day');
  const yes=page.locator('.exp-task').getByRole('button',{name:'Päivä',exact:true}), no=page.locator('.exp-task').getByRole('button',{name:'Yö',exact:true});
  await expect(yes).toBeDisabled(); await expect(no).toBeDisabled();
  const arrow=page.getByRole('button',{name:'Käännä Maata 90 astetta oikealle'});
  let rotation=current.model.rotation;
  while(rotation!==180){await arrow.focus();await page.keyboard.press('Enter');rotation=(rotation+90)%360;expect((await state(page)).model.rotation).toBe(rotation);}
  await expect(yes).toBeEnabled(); await expect(no).toBeEnabled();
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('sammakko-journey-3') ?? 'null'));
  expect(before?.attempts ?? []).toHaveLength(0);
  await expect(page.locator('.exp-help')).toContainText('Auringon suunta ei vaihdu');
  const right=current.model.siteOffset===0?no:yes;
  await right.click(); expect((await state(page)).lastOk).toBe(true);
  await page.getByRole('button',{name:'Toinen yhteinen kokeilu'}).click();
  const second=await state(page); let secondRotation=second.model.rotation;
  while(secondRotation!==180){await page.getByRole('button',{name:'Käännä Maata 90 astetta oikealle'}).click();secondRotation=(secondRotation+90)%360;}
  await page.locator('.exp-task').getByRole('button',{name:second.model.siteOffset===0?'Yö':'Päivä',exact:true}).click();
  expect((await state(page)).lastOk).toBe(true);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sammakko-journey-3') ?? 'null'));
  expect(saved.events).toEqual(expect.arrayContaining([expect.objectContaining({node:'ENV-PHY-DAYNIGHT-01',assisted:true})]));
  await begin(page,'ENV-PHY-DAYNIGHT-01');
  const retry=await state(page); let other=retry.model.rotation;
  while(other!==180){await page.getByRole('button',{name:'Käännä Maata 90 astetta oikealle'}).click();other=(other+90)%360;}
  const wrong=retry.model.siteOffset===0?yes:no; await wrong.click(); expect((await state(page)).lastOk).toBe(false);
});

test('season comparison shows equivalent latitude, daylight and elevation',async({page})=>{
  await begin(page,'ENV-PHY-SEASONS-01');
  const m=(await state(page)).model, given=page.locator('.exp-exact');
  await expect(given).toContainText('päivän pituus',{ignoreCase:true});
  await expect(given).toContainText('Auringon keskipäivän korkeus');
  await expect(given).toContainText(`${Math.abs(m.latitude)}° pohjoista`);
  await expect(given).toContainText(`${Math.abs(m.latitude)}° eteläistä`);
  const summer=(m.latitude>0)===(m.month==='june');
  await page.locator('.exp-task button.opt').filter({hasText:summer?'kesä':'talvi'}).first().click();
  expect((await state(page)).lastOk).toBe(true);
});

test('nearby-space and cosmic-scale modes switch without submitting an answer',async({page})=>{
  await begin(page,'ENV-PHY-SPACE-NEAR-01');
  await expect(page.locator('.exp-exact')).toContainText('Kokojen vertailutila');
  await page.locator('.exp-exact').getByRole('button',{name:'Etäisyys',exact:true}).click();
  await expect(page.locator('.exp-exact')).toContainText('Etäisyyksien vertailutila');
  expect((await state(page)).model.mode).toBe('distance');
  expect((await state(page)).lastOk).toBeUndefined();
  await begin(page,'PHY79-UNIVERSE-SCALE');
  for(const unit of ['AU','valovuosi','kpc']) await expect(page.locator('.exp-exact').getByRole('button',{name:unit,exact:true})).toBeVisible();
  await page.locator('.exp-exact').getByRole('button',{name:'kpc',exact:true}).click();
  expect((await state(page)).model.mode).toBe('galaxy');
  expect((await state(page)).lastOk).toBeUndefined();
});

test('structure requires a constructed hierarchy and names star-cluster distinction',async({page})=>{
  await begin(page,'PHY79-UNIVERSE-STRUCT');
  expect((await state(page)).family).toBe('build');
  await expect(page.locator('.exp-exact')).toContainText('tähtijoukko ja galaksi eivät tarkoita samaa');
  for(const token of ['Kuu','Maa–Kuu-järjestelmä','Aurinkokunta','Linnunrata']) await page.locator('.exp-task .tray').getByRole('button',{name:token,exact:true}).click();
  await page.locator('.exp-task').getByRole('button',{name:'Valmis'}).click();
  expect((await state(page)).lastOk).toBe(true);
});

test('day instructions, controls and choices fit desktop and tablet viewport',async({page})=>{
  for(const viewport of [{width:1366,height:768},{width:768,height:1024}]) {
    await page.setViewportSize(viewport); await begin(page,'ENV-PHY-DAYNIGHT-01');
    const controls=page.locator('.exp-task'), diagram=controls.locator('.space-day-diagram'), buttons=controls.getByRole('button',{name:'Päivä',exact:true});
    for(const item of [diagram,buttons]) {const box=await item.boundingBox();expect(box).not.toBeNull();expect(box!.y+box!.height).toBeLessThanOrEqual(viewport.height);}
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  }
});
