import { expect, test, type Page } from '@playwright/test';

type State={family:string;lastOk?:boolean;renderer:string;model:{body:string;given:string;surfaceView?:string;inputs?:{kind:string;direction?:string;newtons?:number;from?:string;netForceN?:number}};stage:{surfaceView?:string;motion?:{velocity:number;displacement:number;relativeVelocity?:number;frictionN?:number}}};
const state=(p:Page):Promise<State>=>p.evaluate(()=>JSON.parse(window.render_game_to_text!()));
async function begin(p:Page,id:string,seed=0){await p.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);await p.reload();await p.getByRole('button',{name:'Tutkitaan yhdessä',exact:true}).click();}
async function assign(p:Page,slot:string,token:string){await p.locator('.place-tray').getByRole('button',{name:token,exact:true}).click();await p.locator('.exp-task .slot').filter({hasText:slot}).locator('.lbl').click();}

async function assignKeyboard(p:Page,slot:string,token:string){const source=p.locator('.place-tray').getByRole('button',{name:token,exact:true});await source.focus();await p.keyboard.press('Enter');const target=p.locator('.exp-task .slot').filter({hasText:slot});await target.focus();await p.keyboard.press('Enter');}

test.beforeEach(async({page})=>{await page.emulateMedia({reducedMotion:'reduce'});if(process.env.FORCE_WORKSHOP_WEBGL==='1')return;await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){return /^webgl/.test(type)?null:Reflect.apply(original,this,[type,...args])} as typeof original});});

test('vector requires target, direction and scaled length; incorrect target is rejected',async({page})=>{
  await begin(page,'PHY79-FORCE-01');
  let m=(await state(page)).model, force=m.inputs!.newtons!, dir=m.inputs!.direction!;
  await expect(page.locator('.exp-exact')).toContainText(`${force} N`);
  await expect(page.locator('.exp-help')).toContainText('Tarkista jokainen osa');
  await assign(page,'Nuolen alkukohta','Köysi');
  await assign(page,'Suunta',dir==='left'?'← vasemmalle':'→ oikealle');
  await assign(page,'Pituus',`${force/2} cm`);
  await page.locator('.exp-task').getByRole('button',{name:'Valmis'}).click();
  expect((await state(page)).lastOk).toBe(false);
  await page.getByRole('button',{name:'Uusi kokeilu'}).click();
  m=(await state(page)).model;force=m.inputs!.newtons!;dir=m.inputs!.direction!;
  await assign(page,'Nuolen alkukohta',m.body);
  await assign(page,'Suunta',dir==='left'?'← vasemmalle':'→ oikealle');
  await assign(page,'Pituus',`${force/2} cm`);
  await page.locator('.exp-task').getByRole('button',{name:'Valmis'}).click();
  expect((await state(page)).lastOk).toBe(true);
  await expect(page.locator('.exp-exact')).toContainText('asteikolla');
  await page.getByRole('button',{name:'Toinen yhteinen kokeilu'}).click();
  m=(await state(page)).model;force=m.inputs!.newtons!;dir=m.inputs!.direction!;
  await assign(page,'Nuolen alkukohta',m.body);
  await assign(page,'Suunta',dir==='left'?'← vasemmalle':'→ oikealle');
  await assign(page,'Pituus',`${force/2} cm`);
  await page.locator('.exp-task').getByRole('button',{name:'Valmis'}).click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sammakko-journey-3') ?? 'null'));
  expect(saved.events).toEqual(expect.arrayContaining([expect.objectContaining({node:'PHY79-FORCE-01',assisted:true})]));
});

test('belt friction follows relative slip even when the box moves right',async({page})=>{
  await begin(page,'PHY79-FRICTION',1);
  expect((await state(page)).family).toBe('belt');
  if(process.env.FORCE_WORKSHOP_WEBGL==='1') expect((await state(page)).renderer).toBe('webgl');
  await expect(page.locator('.exp-exact')).toContainText('hihna 3 m/s oikealle');
  await page.locator('.exp-exact').getByRole('button',{name:'Karkea pinta'}).click();
  expect((await state(page)).model.surfaceView).toBe('rough');
  await page.locator('.exp-exact').getByRole('button',{name:'Sileä pinta'}).click();
  expect((await state(page)).model.surfaceView).toBe('smooth');
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('sammakko-journey-3') ?? 'null'));
  expect(before?.attempts ?? []).toHaveLength(0);
  await assign(page,'Kitkan suunta','Oikealle');
  await assign(page,'Kitka vastustaa','Pintojen suhteellista luistoa');
  await assign(page,'Suurempi kitka','Karkea, 4 N');
  await page.locator('.exp-task').getByRole('button',{name:'Valmis'}).click();
  expect((await state(page)).lastOk).toBe(true);
  expect((await state(page)).model.surfaceView).toBe('rough');
  await expect(page.locator('.exp-exact')).toContainText('Mallitarkistuksessa pinta: karkea');
  await expect(page.locator('.exp-exact').getByRole('button',{name:'Sileä pinta'})).toHaveCount(0);
  if ((await state(page)).renderer==='webgl') {
    expect((await state(page)).stage.surfaceView).toBe('rough');
    await page.getByRole('button',{name:'Näytä liikkeen lopputilanne'}).click();
    expect((await state(page)).stage.motion).toMatchObject({relativeVelocity:0,velocity:3,frictionN:0});
  }
  await expect(page.locator('.exp-exact')).toContainText('sileällä 1.5 m/s, karkealla 0 m/s');
});

test('ramp support is perpendicular rather than always vertical',async({page})=>{
  await begin(page,'PHY79-SUPPORT',1);
  expect((await state(page)).family).toBe('ramp');
  await assignKeyboard(page,'Tukivoiman aiheuttaja','Pinta');
  await assignKeyboard(page,'Tukivoiman suunta laatikkoon','Yläviistoon vasemmalle');
  await page.locator('.exp-task').getByRole('button',{name:'Valmis'}).click();
  expect((await state(page)).lastOk).toBe(true);
});

test('given vector and essential construction controls fit desktop and tablet',async({page})=>{
  for(const viewport of [{width:1366,height:768},{width:768,height:1024}]){
    await page.setViewportSize(viewport);await begin(page,'PHY79-FORCE-01');
    await expect(page.locator('.exp-exact')).toContainText('Asteikko');
    const desk=page.locator('.exp-desk');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    const done=desk.locator('.exp-task').getByRole('button',{name:'Valmis'});
    await expect(done).toBeVisible();
    for(const locator of [desk.locator('.exp-exact'),desk.locator('.exp-task .slots'),desk.locator('.place-tray'),done]) {
      const box=await locator.boundingBox();expect(box).not.toBeNull();expect(box!.y).toBeGreaterThanOrEqual(0);expect(box!.y+box!.height).toBeLessThanOrEqual(viewport.height);
    }
  }
});


test('reduced motion exposes the domain-determined force outcome without autoplay',async({page})=>{
  await begin(page,'ENV-PHY-FORCE-01');
  if(process.env.FORCE_WORKSHOP_WEBGL==='1') expect((await state(page)).renderer).toBe('webgl');
  const m=(await state(page)).model, source=m.inputs!.from!, force=m.inputs!.netForceN!;
  await assign(page,`Voiman aiheuttaja kappaleeseen ${m.body}`,source);
  await assign(page,'Nopeuden muutos',`Muutos ${force>0?'oikealle':'vasemmalle'}`);
  await page.locator('.exp-task').getByRole('button',{name:'Valmis'}).click();
  expect((await state(page)).lastOk).toBe(true);
  await expect(page.locator('.exp-exact')).toContainText('Mallitarkistus 2 s jälkeen');
  if((await state(page)).renderer==='webgl') {
    expect((await state(page)).stage.motion).toBeUndefined();
    await page.getByRole('button',{name:'Näytä liikkeen lopputilanne'}).click();
    expect((await state(page)).stage.motion).toMatchObject({velocity:force*2,displacement:force*2});
  }
});


test('surface comparison keeps given data, surface controls and response visible',async({page})=>{
  for(const viewport of [{width:1366,height:768},{width:768,height:1024}]) {
    await page.setViewportSize(viewport);await begin(page,'PHY79-FRICTION',1);
    for(const locator of [page.locator('.exp-exact'),page.locator('.exp-task .slots'),page.locator('.place-tray'),page.locator('.exp-task').getByRole('button',{name:'Valmis'})]) {
      const box=await locator.boundingBox();expect(box).not.toBeNull();expect(box!.y).toBeGreaterThanOrEqual(0);expect(box!.y+box!.height).toBeLessThanOrEqual(viewport.height);
    }
    await expect(page.locator('.exp-exact').getByRole('button',{name:'Sileä pinta'})).toBeVisible();
    await expect(page.locator('.exp-exact').getByRole('button',{name:'Karkea pinta'})).toBeVisible();
  }
});

test('revealed support shows the same rough model without recording another answer',async({page})=>{
  await begin(page,'PHY79-FRICTION',1);
  if(process.env.FORCE_WORKSHOP_WEBGL==='1') expect((await state(page)).renderer).toBe('webgl');
  await assign(page,'Kitkan suunta','Vasemmalle');
  await assign(page,'Kitka vastustaa','Pintojen suhteellista luistoa');
  await assign(page,'Suurempi kitka','Karkea, 4 N');
  await page.locator('.exp-task').getByRole('button',{name:'Valmis'}).click();
  expect((await state(page)).lastOk).toBe(false);
  await page.getByRole('button',{name:'Näytä ja selitä'}).click();
  expect((await state(page)).model.surfaceView).toBe('rough');
  await expect(page.locator('.exp-exact')).toContainText('Mallitarkistuksessa pinta: karkea');
  await expect(page.locator('.exp-exact')).toContainText('sileällä 1.5 m/s, karkealla 0 m/s');
  const attempts=await page.evaluate(()=>JSON.parse(localStorage.getItem('sammakko-journey-3') ?? 'null').attempts.length);
  expect(attempts).toBe(1);
  if((await state(page)).renderer==='webgl') {
    await page.getByRole('button',{name:'Näytä liikkeen lopputilanne'}).click();
    expect((await state(page)).stage.motion).toMatchObject({relativeVelocity:0,velocity:3,frictionN:0});
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('sammakko-journey-3') ?? 'null').attempts.length)).toBe(1);
  }
});
