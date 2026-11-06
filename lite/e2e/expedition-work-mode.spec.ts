import {test,expect,type Page} from '@playwright/test';
import {logicWorkshopSpecs} from '../src/content/logic-workshop';
import {rng} from '../src/engine/rng';
test.use({launchOptions:{args:['--enable-unsafe-swiftshader']}});
const state=(p:Page)=>p.evaluate(()=>JSON.parse(window.render_game_to_text!()));
test('quiet task background keeps exact work responsive while its own experiment clock runs',async({page})=>{
  test.setTimeout(90000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('./?qa=1&seed=0#saaristo/M-TH-05');await page.waitForLoadState('networkidle');
  const intro=await state(page);expect(intro.renderer).toBe('webgl');expect(intro.world.workMode).toBe(false);
  await expect.poll(async()=>(await state(page)).world.time).toBeGreaterThan(intro.world.time);
  await page.getByRole('button',{name:'Kokeilen itse',exact:true}).click();await page.waitForLoadState('networkidle');
  const before=await state(page);expect(before.paused).toBe(false);expect(before.world.workMode).toBe(true);
  await page.waitForTimeout(350);const quiet=await state(page);expect(quiet.world.time).toBe(before.world.time);expect(quiet.world.frames-before.world.frames).toBeLessThanOrEqual(1);
  const task=logicWorkshopSpecs[0]!.item(rng(quiet.seed),'independent').task;if(task.kind!=='logic-workshop'||task.mode!=='cause')throw Error('cause');
  await page.getByLabel('Oma ennuste määränpäästä',{exact:true}).selectOption(task.target);await page.getByRole('button',{name:'Lukitse ennuste',exact:true}).click();
  await page.getByLabel('Kourun suunta',{exact:true}).selectOption(task.target);await page.getByLabel('Virtauksen asetus',{exact:true}).selectOption(String(task.baseline.release));await page.getByRole('button',{name:'Tee vertailukoe',exact:true}).click();
  await expect.poll(async()=>(await state(page)).stage.elapsed).toBeGreaterThan(0);
  await page.getByRole('button',{name:'Pysäytä maiseman liike',exact:true}).click();const paused=await state(page);await page.waitForTimeout(150);expect((await state(page)).stage.elapsed).toBe(paused.stage.elapsed);
  await page.evaluate(()=>window.advanceTime!(500));const stepped=await state(page);expect(stepped.stage.elapsed).toBeGreaterThan(paused.stage.elapsed);
  expect(stepped.world.time).toBe(paused.world.time);expect(stepped.world.frames-paused.world.frames).toBeLessThanOrEqual(2);
  await page.getByRole('link',{name:'Sammakko',exact:true}).click();await expect.poll(async()=>(await state(page)).world.workMode).toBe(false);expect(errors).toEqual([]);
});
test('an earlier frame timestamp cannot run the island clock backwards',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.addInitScript(()=>{
    const request=window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame=callback=>request(time=>callback(time-1000));
  });
  await page.goto('./?qa=1#saaristo/M-TH-05');
  await expect.poll(async()=>(await state(page)).renderer).toBe('webgl');
  const first=(await state(page)).world.time;expect(first).toBeGreaterThanOrEqual(0);
  await page.waitForTimeout(120);expect((await state(page)).world.time).toBeGreaterThanOrEqual(first);
});
