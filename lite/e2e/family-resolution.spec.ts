import {test,expect,type Page} from '@playwright/test';
test.use({launchOptions:{args:['--enable-unsafe-swiftshader']}});
const state=(p:Page)=>p.evaluate(()=>JSON.parse(window.render_game_to_text!()));
const save=(p:Page)=>p.evaluate(()=>JSON.parse(localStorage.getItem('sammakko-journey-3')??'null'));
async function sameAndDifferent(p:Page) {
  const instruction=await p.locator('.exp-instruction').innerText(), options=p.locator('.exp-task button.opt');
  if(instruction.includes('kahdessa')) {
    const [a,b]=(await p.locator('.exp-exact svg').getAttribute('aria-label'))!.split(' ja ').map(x=>x.split(' '));
    const difference=a!.findIndex((word,i)=>word!==b![i]);
    await options.filter({hasText:['Koko','Väri','Muoto'][difference]!}).click();return;
  }
  const labels=await options.locator('svg').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label')));
  const target=instruction.includes('samanlainen')?await p.locator('.exp-exact svg').getAttribute('aria-label'):labels.find(label=>labels.filter(x=>x===label).length===1);
  expect(target).toBeTruthy();await options.nth(labels.indexOf(target!)).click();
}
test('a real guided observation resolves a local world once; pause, skip and reload preserve evidence',async({page},info)=>{
  test.setTimeout(90000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1024,height:768});await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('./?qa=1&seed=1#saaristo/M-TH-01');await page.getByRole('button',{name:'Tutkitaan yhdessä',exact:true}).click();
  await expect.poll(async()=>(await state(page)).renderer).toBe('webgl');
  await sameAndDifferent(page);await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok','true');
  await page.getByRole('button',{name:'Toinen yhteinen kokeilu',exact:true}).click();
  await page.getByRole('button',{name:'Pysäytä maiseman liike',exact:true}).click();await sameAndDifferent(page);
  const resolved=await state(page), stored=await save(page);
  expect(resolved.progress).toMatchObject({helped:true,checked:false});
  expect(resolved.familyWorld).toMatchObject({familyId:'LM01',phase:'consequence',remaining:2500,paused:true});
  expect(stored.events).toHaveLength(1);expect(stored.effects).toEqual(['world.M-TH-01.resolved']);
  await page.waitForTimeout(100);expect((await state(page)).familyWorld.remaining).toBe(2500);
  await page.getByRole('button',{name:'Näytä ympäristön muutos',exact:true}).click();
  expect((await state(page)).familyWorld.remaining).toBe(0);expect(await save(page)).toEqual(stored);
  await page.screenshot({path:info.outputPath('family-guided-local-result.png')});
  await page.reload();expect((await state(page)).familyWorld.effects).toContain('world.M-TH-01.resolved');
  expect((await state(page)).familyWorld.remaining).toBe(0);expect(await save(page)).toEqual(stored);
  await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(async()=>(await state(page)).familyWorld.reducedMotion).toBe(true);
  await page.emulateMedia({reducedMotion:'no-preference'});await expect.poll(async()=>(await state(page)).familyWorld.reducedMotion).toBe(false);
  expect(errors).toEqual([]);
});
