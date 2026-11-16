import {expect, test, type Page} from '@playwright/test';
async function question(page:Page,id:string) {
  await page.goto(`/lite/?qa=1&seed=3#saaristo/${id}`);
  await page.waitForFunction(id=>{try{return JSON.parse((window as any).render_game_to_text()).book?.page===id}catch{return false}},id);
  const pause=page.getByRole('button',{name:'Keskeytä automaattinen eteneminen'}); if(await pause.count())await pause.click();
  for(let n=0;n<10;n++){if(await page.evaluate(()=>JSON.parse((window as any).render_game_to_text()).book.kind)==='try')return;await page.getByRole('button',{name:'Eteenpäin',exact:true}).click();}
  throw new Error(`No try for ${id}`);
}
for(const [width,height] of [[320,640],[390,844],[768,1024],[1366,768]])test(`header, question and figure fit at ${width}`,async({page})=>{
  await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'reduce'});await question(page,'PHY79-DATA-01');
  const back=await page.getByRole('link',{name:'Palaa aihevalintaan'}).boundingBox();expect(back).not.toBeNull();expect(back!.x+back!.width).toBeLessThanOrEqual(width+1);
  const context=page.locator('.book-context'),cue=page.locator('.book-scroll-cue');
  if(await context.evaluate(e=>e.scrollHeight-e.clientHeight>1))await expect(cue).toBeVisible();else await expect(cue).toBeHidden();
  for(const option of await page.locator('.book-task .opt').all()){
    const bounds=await option.boundingBox();expect(bounds).not.toBeNull();expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(height+1);
    expect(await option.evaluate(e=>{const r=e.getBoundingClientRect();for(let p=e.parentElement;p;p=p.parentElement){const s=getComputedStyle(p),b=p.getBoundingClientRect();if(/hidden|clip|auto|scroll/.test(s.overflowY)&&(r.top<b.top-1||r.bottom>b.bottom+1))return false;}return true;})).toBe(true);
  }
  if(await cue.isVisible()){await context.focus();await page.keyboard.press('End');await expect.poll(()=>context.evaluate(e=>e.scrollHeight-e.clientHeight-e.scrollTop)).toBeLessThanOrEqual(1);await expect(cue).toBeHidden();}
  await question(page,'M-GMEAS-05');const wrap=page.locator('.book-figure .table-wrap');await expect(wrap).toContainText('Korkeus');expect(await wrap.evaluate(e=>e.scrollWidth-e.clientWidth)).toBeLessThanOrEqual(1);expect(await wrap.locator('th').allTextContents()).toEqual(['Pituus','Leveys','Korkeus']);expect(await wrap.locator('td').allTextContents()).toEqual(['4 cm','2 cm','3 cm']);
  expect(await wrap.evaluate(e=>{const r=e.getBoundingClientRect(),p=e.closest('.book-context')!.getBoundingClientRect();return r.top>=p.top-1&&r.bottom<=p.bottom+1;})).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
});

test('cue follows content changes, retry and disposal',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await question(page,'M-GMEAS-05');
  const context=page.locator('.book-context'),cue=page.locator('.book-scroll-cue');
  await expect(cue).toBeHidden();
  await context.evaluate(e=>{const p=document.createElement('p');p.id='cue-probe';p.textContent='Lisätietoa '.repeat(400);e.append(p);});
  await expect(cue).toBeVisible();
  await context.locator('#cue-probe').evaluate(e=>e.remove());await expect(cue).toBeHidden();
  for(const key of ['1','OK'])await page.locator('.book-task .keys button').filter({hasText:new RegExp(`^${key}$`)}).click();
  await expect(page.locator('.book-feedback')).toHaveAttribute('data-ok','false');
  await page.getByRole('button',{name:'Toinen kysymys'}).click();
  await expect(page.locator('.book-feedback')).toBeEmpty();
  await page.getByRole('link',{name:'Palaa aihevalintaan'}).click();
  await expect(page.locator('.book-context')).toHaveCount(0);expect(errors).toEqual([]);
});
