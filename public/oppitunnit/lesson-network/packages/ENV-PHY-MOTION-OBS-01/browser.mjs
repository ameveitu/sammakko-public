/* global window, document */
// Author-only source preview: intercepted local bytes, no live build or server mutation.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
const dir=new URL('./',import.meta.url),network=new URL('../../',import.meta.url);
const meta=JSON.parse(fs.readFileSync(new URL('lesson.json',dir))),id=meta.kcId;
const folder=fs.mkdtempSync(path.join(os.tmpdir(),id+'-B04-author-'));
const body=fs.readFileSync(new URL('body.html',dir),'utf8').replaceAll('src="shared/','src="/shared/');
const html=js=>`<!doctype html><html lang="fi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/shell.css"></head><body><main><section class="lesson" id="lesson-body"><article>${body}</article><div data-mount></div></section></main>${js?'<script type="module">import{mount}from"./lesson.mjs";window.handle=mount(document.querySelector("[data-mount]"));window.remount=()=>{window.handle=mount(document.querySelector("[data-mount]"));};window.ready=true;</script>':''}</body></html>`;
async function route(context,js){await context.route('http://b04.local/**',async r=>{const p=decodeURIComponent(new URL(r.request().url()).pathname);if(p.endsWith('/index.html'))return r.fulfill({contentType:'text/html',body:html(js)});let f;if(p==='/shell.css')f=new URL('assets/shell.css',network);else if(p.startsWith('/shared/'))f=new URL(p.slice(1),network);else if(p.startsWith('/'+id+'/')&&!p.includes('..'))f=new URL(p.slice(id.length+2),dir);if(!f||!fs.existsSync(f))return r.fulfill({status:404,body:'Missing local resource'});const type={'.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'}[path.extname(f.pathname)]??'text/plain';await r.fulfill({contentType:type,body:fs.readFileSync(f)});});}
const browser=await chromium.launch({headless:true}),errors=[],runs=[];
try{
 const context=await browser.newContext({reducedMotion:'reduce'});await route(context,true);const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,1280]){
  await page.setViewportSize({width,height:900});await page.goto(`http://b04.local/${id}/index.html`);await page.waitForFunction(()=>window.ready===true);
  const scope=page.locator(id.startsWith('ENV')?'[data-motion-observe]':id.includes('RECORD')?'[data-record-data]':'[data-present-data]');
  const action=name=>scope.locator(`[data-action="${name}"]`),out=scope.locator('[data-feedback]');
  const result=async state=>assert.equal(await out.getAttribute('data-result'),state);
  const check=async state=>{await action('check').click();await result(state);};
  if(id.startsWith('ENV')){
   const object=n=>scope.locator(`[data-object="${n}"]`),ref=scope.locator('[data-reference="0"]');
   const start=await object(0).getAttribute('transform'),stationary=await object(1).getAttribute('transform'),reference=await ref.getAttribute('transform');
   await action('play').click();await page.waitForFunction(()=>document.querySelector('[data-object="0"]').getAttribute('transform')!=='translate(70 62)');await action('stop').click();assert.notEqual(await object(0).getAttribute('transform'),start);assert.equal(await object(1).getAttribute('transform'),stationary);assert.equal(await ref.getAttribute('transform'),reference);
   const held=await object(0).getAttribute('transform');await page.waitForTimeout(120);assert.equal(await object(0).getAttribute('transform'),held);
   const answer=n=>scope.locator(`[data-answer="${n}"]`);await answer(0).selectOption('yes');await answer(1).selectOption('no');await check('correct');await answer(0).selectOption('no');await result('neutral');await check('retry');await answer(0).selectOption('yes');await check('correct');await answer(0).selectOption('');await result('neutral');await check('retry');await answer(0).selectOption('yes');await check('correct');
   await action('next').click();await result('neutral');assert.equal(await answer(0).inputValue(),'');
   for(let n=0;n<6;n++)await action('step').click();assert.equal(await object(0).getAttribute('transform'),'translate(195 62)');for(let n=0;n<6;n++)await action('step').click();assert.equal(await object(0).getAttribute('transform'),'translate(70 62)');assert(await action('step').isDisabled());await answer(0).selectOption('yes');await answer(1).selectOption('no');await check('correct');
   for(const choices of [['no','yes'],['yes','yes'],['no','no']]){await action('next').click();await result('neutral');await answer(0).selectOption(choices[0]);await answer(1).selectOption(choices[1]);await check('correct');}
  }else if(id.includes('RECORD')){
   const row=n=>scope.locator(`[data-row="${n}"]`);await row(0).selectOption('lehti');await row(1).selectOption('kukka');await check('correct');await row(0).selectOption('kivi');await result('neutral');await check('retry');await row(0).selectOption('lehti');await check('correct');await row(0).selectOption('');await result('neutral');await check('retry');await row(0).selectOption('lehti');await check('correct');await action('reorder').click();await result('correct');assert.equal(await row(0).inputValue(),'kukka');await check('correct');
   await action('next').click();await result('neutral');await check('retry');await row(0).selectOption('kukka');await row(1).selectOption('lehti');await check('correct');await action('next').click();await row(0).selectOption('kivi');await row(1).selectOption('lehti');await row(2).selectOption('kukka');await check('correct');
  }else{
   const place=n=>scope.locator(`[data-place="${n}"]`),count=n=>scope.locator(`[data-count="${n}"]`);
   await place(0).selectOption('penkki');await count(0).fill('3');await place(1).selectOption('kivi');await count(1).fill('1');assert.equal(await scope.locator('[data-mark]').count(),4);await check('correct');await count(0).fill('2');await result('neutral');assert.equal(await scope.locator('[data-mark]').count(),3);await check('retry');await count(0).fill('3');await check('correct');await count(0).fill('');await result('neutral');await check('retry');await count(0).fill('3');await check('correct');
   await scope.locator('[data-format]').selectOption('table');await result('correct');assert.equal(await scope.locator('[data-output] tbody tr').count(),2);await action('reorder').click();await result('correct');assert.equal(await place(0).inputValue(),'kivi');await check('correct');await scope.locator('[data-format]').selectOption('picture');await result('correct');assert.equal(await scope.locator('[data-mark]').count(),4);
   await action('next').click();await result('neutral');for(const [n,p]of ['sininen','keltainen'].entries()){await place(n).selectOption(p);await count(n).fill('2');}await check('correct');assert.equal(await scope.locator('[data-mark="flower"]').count(),4);
   await action('next').click();for(const[n,p]of ['valkoinen','keltainen','sininen'].entries()){await place(n).selectOption(p);await count(n).fill(String([0,1,3][n]));}await check('correct');assert.equal(await scope.locator('[data-mark="leaf"]').count(),4);await count(0).fill('4');await result('neutral');await check('retry');await count(0).fill('0');await check('correct');
  }
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),id+' horizontal overflow');for(const img of await page.locator('img').all())assert(await img.evaluate(e=>e.complete&&e.naturalWidth>0));
  await scope.screenshot({path:path.join(folder,width+'-practice.png')});await page.screenshot({path:path.join(folder,width+'-full.png'),fullPage:true});
  const controls=scope.locator('button,select,input'),before=await controls.evaluateAll(es=>es.map(e=>e.disabled));await page.evaluate(()=>window.handle.pause());assert(await controls.evaluateAll(es=>es.every(e=>e.disabled)));await page.evaluate(()=>window.handle.resume());assert.deepEqual(await controls.evaluateAll(es=>es.map(e=>e.disabled)),before);
  await page.evaluate(()=>{window.handle.pause();window.handle.reset();window.handle.reset();});assert(await scope.locator('button,select,input').evaluateAll(es=>es.every(e=>e.disabled)));await page.evaluate(()=>window.handle.resume());await result('neutral');assert.equal(await action('check').isDisabled(),false);
  const neutralText=await out.textContent();await page.evaluate(()=>{window.handle.dispose();window.handle.dispose();});await action('check').click();assert.equal(await out.textContent(),neutralText);await page.evaluate(()=>{window.remount();window.remount();});
  if(id.startsWith('ENV')){for(let i=0;i<3;i++)await action('step').click();assert.equal(await scope.locator('[data-object="0"]').getAttribute('transform'),'translate(85.625 62)');}
  else if(id.includes('RECORD')){await action('demo-step').click();assert.equal(await scope.locator('[data-demo-caption]').textContent(),'Merkitse lehden kuva vihkon Penkki-riville.');}
  else{await scope.locator('[data-place="0"]').selectOption('penkki');await scope.locator('[data-place="1"]').selectOption('kivi');await action('reorder').click();assert.equal(await scope.locator('[data-place="0"]').inputValue(),'kivi');}
  runs.push({width,actualPositiveNegative:true,correctEditNeutralRecheckRepair:true,lifecycle:true,images:true,noOverflow:true});
 }
 const staticContext=await browser.newContext({javaScriptEnabled:false});await route(staticContext,false);const staticPage=await staticContext.newPage();await staticPage.setViewportSize({width:390,height:900});await staticPage.goto(`http://b04.local/${id}/index.html`);assert(await staticPage.locator('h3').count()>=3);assert((await staticPage.locator('#lesson-body').textContent()).includes('Lopuksi'));for(const img of await staticPage.locator('img').all())assert(await img.evaluate(e=>e.complete&&e.naturalWidth>0));await staticPage.screenshot({path:path.join(folder,'static390.png'),fullPage:true});for(const [i,figure]of (await staticPage.locator('figure').all()).entries())await figure.screenshot({path:path.join(folder,'figure-'+i+'.png')});assert.deepEqual(errors,[]);
 console.log(JSON.stringify({kcId:id,status:'PASS',runs,static:true,pageErrors:errors,artifacts:folder,limits:'Author source harness only. Main integrated review, different independent reviewer and human/learner validation remain.'}));
}finally{await browser.close();}
