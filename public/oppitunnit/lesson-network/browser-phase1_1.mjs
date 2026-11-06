/* global document, navigator, dispatchEvent, innerWidth, PageTransitionEvent */
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {digest} from './content.mjs';
const base=process.env.LESSON_TEST_URL??'http://127.0.0.1:4191/';
const browser=await chromium.launch({headless:true});
const batch=process.env.SAMMAKKO_BATCH;if(batch&&!/^B[0-9]+$/.test(batch))throw Error('Invalid batch');
const evidence=new URL(batch?'evidence/production/'+batch+'/phase1_1-regression/':'evidence/phase1_1/',import.meta.url);fs.mkdirSync(evidence,{recursive:true});
const errors=[],checks=[];
try{
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const requests=[];page.on('request',r=>requests.push(r.url()));
 for(const width of [390,1280]){
  await page.setViewportSize({width,height:900});await page.goto(base+'site/index.html');
  await page.locator('[name=q]').fill('M-ALG-08');await page.locator('[name=lite]').selectOption('kyllä');assert.equal(await page.locator('#catalogue li:visible').count(),1);
  await page.locator('#catalogue a:visible').click();await page.goBack();assert.equal(await page.locator('[name=q]').inputValue(),'M-ALG-08');assert.equal(await page.locator('#catalogue li:visible').count(),1);assert.equal(await page.locator('#count').textContent(),'1 aihetta');
  await page.reload();assert.equal(await page.locator('#catalogue li:visible').count(),1);
  await page.goto(base+'fixture-preview/site/lessons/M-ALG-08.html?mode=presentation');
  assert(await page.locator('body').evaluate(e=>e.classList.contains('presentation')));
  assert((await page.locator('#lesson-body').boundingBox()).y<900);assert(await page.locator('#lesson-body img').evaluate(e=>e.complete&&e.naturalWidth>0));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:new URL(`presentation-${width}.png`,evidence).pathname,fullPage:true});
  await page.locator('.support-details>summary').click();await page.locator('#upstream a').first().click();assert(new URL(page.url()).searchParams.get('mode')==='presentation');
  await page.goto(base+'fixture-preview/site/lessons/M-ALG-08.html');await page.locator('#copy-lesson').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),page.url());
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('test denied');}},configurable:true});});await page.locator('#copy-lesson').click();assert.equal(await page.locator('#copy-status input').inputValue(),page.url());
  await page.locator('.teacher[data-shell-teacher]>summary').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:new URL(`teacher-${width}.png`,evidence).pathname,fullPage:true});
  checks.push({width,filterBackReload:true,presentationAboveFold:true,modeNavigation:true,asset:true,clipboardFallback:true,noOverflow:true});
 }
 assert(!requests.some(u=>u.endsWith('/control.mjs')),'static host must not load interactive module');
 await page.goto(base+'fixture-preview/site/lessons/M-SCALE-02.html');await page.locator('[data-fixture-step]').waitFor();
 const value=page.locator('[data-fixture-value]');await page.locator('[data-fixture-step]').click();assert.equal(await value.textContent(),'1');
 await page.locator('[data-module-action=pause]').click();assert(await page.locator('[data-fixture-step]').isDisabled());assert.equal(await value.textContent(),'1');
 await page.locator('[data-module-action=resume]').click();await page.locator('[data-fixture-step]').click();assert.equal(await value.textContent(),'2');
 for(let i=0;i<3;i++){await page.locator('[data-module-action=reset]').click();await page.locator('[data-fixture-step]').click();assert.equal(await value.textContent(),'1');assert.equal(await page.locator('[data-fixture-step]').count(),1);}
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});assert(await page.locator('[data-fixture-step]').isDisabled());assert.equal(await value.textContent(),'1');
 await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pagehide')));assert.equal(await page.locator('[data-fixture-step]').count(),0);await page.reload();await page.locator('[data-fixture-step]').waitFor();assert.equal(await value.textContent(),'0');
 const plain=await browser.newContext({javaScriptEnabled:false});const nojs=await plain.newPage();await nojs.goto(base+'fixture-preview/site/lessons/M-ALG-08.html');assert((await nojs.locator('#lesson-body').textContent()).includes('SENTINEL'));await nojs.locator('.support-details>summary').click();await nojs.locator('#upstream a').first().click();assert(!nojs.url().includes('M-ALG-08.html'));
 assert.deepEqual(errors,[]);
 const hashes=Object.fromEntries(['build.mjs','content.mjs','assets/shell.css','assets/shell.js','assets/lesson-loader.js','browser-phase1_1.mjs'].map(p=>[p,digest(fs.readFileSync(new URL(p,import.meta.url)))]));
 fs.writeFileSync(new URL('browser.json',evidence),JSON.stringify({status:'PASS',checks,lifecycle:{mountPauseResumeResetDispose:true,visibilityEvent:'synthetic hidden-property test',freshNavigation:true},noJavaScriptBodyNavigation:true,errors,hashes},null,2)+'\n');console.log('PASS Phase1.1 browser checks');
}finally{await browser.close();}
