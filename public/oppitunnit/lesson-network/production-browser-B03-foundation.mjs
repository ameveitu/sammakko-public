/* global document, innerWidth */
// Integration-only QA for the three Feynman-authored B03 packages.
// Run by main after build: LESSON_TEST_URL=http://127.0.0.1:4191/ node lesson-network/production-browser-B03-foundation.mjs
// This script never builds, writes package/state files, or awards lesson status.
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
const base=process.env.LESSON_TEST_URL??'http://127.0.0.1:4191/';
const browser=await chromium.launch({headless:true}),errors=[];
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 for(const width of [390,1280])for(const kc of ['M-REP-04','M-TH-04','M-TH-07']){
  await page.setViewportSize({width,height:900});await page.goto(new URL(`site/lessons/${kc}.html`,base).href);
  const root=page.locator(`[data-b03="${kc}"]`);await root.locator('[data-action]').first().waitFor();await page.locator(`[data-b03="${kc}"][data-module-ready="true"]`).waitFor();
  const action=async a=>root.locator(`[data-action="${a}"]`).click();
  if(kc==='M-REP-04'){
   const build=async ts=>{await action('clear');for(const t of ts)await root.locator(`[data-token="${t}"]`).click();await action('check');};
   await build(['5']);assert.equal(await root.locator('[data-feedback]').getAttribute('data-result'),'retry');
   await build(['5','=','2','+','3']);assert.equal(await root.locator('[data-feedback]').getAttribute('data-result'),'correct');

   // B03-FND-01: a checked verdict belongs to the exact current expression.
   await build(['5','=','2','+','3']);
   await action('step');assert.equal(await root.locator('[data-feedback]').getAttribute('data-result'),'correct','model-only step preserves the checked answer');
   await root.locator('[data-token="5"]').click();assert.equal(await root.locator('[data-expression]').textContent(),'5 = 2 + 3 5');assert.equal(await root.locator('[data-feedback]').getAttribute('data-result'),'support','correct → actual token insertion invalidates verdict');assert.doesNotMatch(await root.locator('[data-feedback]').textContent(),/Merkintäsi on tosi/);
   await action('check');assert.equal(await root.locator('[data-feedback]').getAttribute('data-result'),'retry');await root.locator('[data-token="2"]').click();assert.equal(await root.locator('[data-feedback]').getAttribute('data-result'),'support','retry → actual token insertion invalidates verdict');
   await action('context');await build(['4','=','6','−','2']);assert.equal(await root.locator('[data-feedback]').getAttribute('data-result'),'correct');
  }else if(kc==='M-TH-04'){
   const put=async(i,k)=>{await root.locator(`[data-slot="${i}"]`).click();await root.locator(`[data-pattern="${k}"]`).click();};
   for(const [i,k] of ['angular','angular','round'].entries())await put(i,k);await action('check-repeat');assert.equal(await root.locator('[data-repeat-feedback]').getAttribute('data-result'),'retry');
   await put(0,'round');await action('check-repeat');assert.equal(await root.locator('[data-repeat-feedback]').getAttribute('data-result'),'correct');

   // B03-FND-02: erasing a filled slot invalidates only the repeat answer.
   await put(2,'round');await action('check-repeat');assert.equal(await root.locator('[data-repeat-feedback]').getAttribute('data-result'),'correct');
   await action('support');assert.equal(await root.locator('[data-repeat-feedback]').getAttribute('data-result'),'correct','support-only change preserves verdict');
   await action('erase');assert.equal(await root.locator('[data-slot="2"]').getAttribute('aria-label'),'Jatkopaikka 3: tyhjä');assert.equal(await root.locator('[data-repeat-feedback]').getAttribute('data-result'),'support','correct → erase invalidates verdict');assert.doesNotMatch(await root.locator('[data-repeat-feedback]').textContent(),/Jatko on pyöreä/);
   await put(2,'angular');await action('check-repeat');assert.equal(await root.locator('[data-repeat-feedback]').getAttribute('data-result'),'retry');await action('erase');assert.equal(await root.locator('[data-repeat-feedback]').getAttribute('data-result'),'support','retry → erase invalidates verdict');
   await put(2,'round');await action('check-repeat');assert.equal(await root.locator('[data-repeat-feedback]').getAttribute('data-result'),'correct');
   await action('support');
   await action('growth-step');await action('growth-step');await action('add-dot');await action('check-growth');assert.equal(await root.locator('[data-growth-feedback]').getAttribute('data-result'),'retry');
   await action('add-dot');await action('check-growth');assert.equal(await root.locator('[data-growth-feedback]').getAttribute('data-result'),'correct');
  }else{
   const pairs=[['dots','star'],['stripe','triangle'],['dots','circle'],['stripe','star'],['dots','triangle'],['stripe','circle']];
   for(const [bg,em] of pairs){await root.locator(`[data-background="${bg}"]`).click();await root.locator(`[data-emblem="${em}"]`).click();await action('add-pair');}
   await action('add-pair');assert.equal(await root.locator('[data-record] li').count(),6);await action('check-pairs');assert.equal(await root.locator('[data-pairs-feedback]').getAttribute('data-result'),'correct');
   await root.locator('summary').filter({hasText:'Kokeile siirtoa'}).click();
   for(let a=0;a<4;a++)for(let b=a+1;b<4;b++){await root.locator(`[data-station="${a}"]`).click();await root.locator(`[data-station="${b}"]`).click();await action('add-link');}
   await action('check-links');assert.equal(await root.locator('[data-links-feedback]').getAttribute('data-result'),'correct');
  }
  for(const b of await root.locator('button:visible').all()){const box=await b.boundingBox();assert(box&&box.width>=44&&box.height>=44,`${kc}: small button`);}
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${kc}: overflow`);
  for(const img of await root.locator('img').all())assert(await img.evaluate(e=>e.complete&&e.naturalWidth>0),`${kc}: image missing`);
  await page.locator('.module-tools>summary').click();await page.locator('[data-module-action="pause"]').click();assert.equal(await root.locator('button:enabled').count(),0);
  await page.locator('[data-module-action="reset"]').click();assert.equal(await root.locator('button:enabled').count(),0);await page.locator('[data-module-action="resume"]').click();assert((await root.locator('button:enabled').count())>0);
  console.log(`${kc} ${width}: integrated constructive interaction, local CSS/assets and pause/reset PASS`);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
