/* global window, document */
// Actual integrated-site QA only. No routing/interception, source preview, build or learner writes.
// SAMMAKKO_TEST_URL=http://127.0.0.1:4191/site/ node lesson-network/production-browser-B04-scimeasure.mjs
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
const id='SCI-ENV-MEAS-01',dir=new URL('./packages/'+id+'/',import.meta.url),p=JSON.parse(fs.readFileSync(new URL('lesson.json',dir),'utf8'));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const revision=p.revision+'@'+sha(JSON.stringify({...p,reviews:undefined})+fs.readFileSync(new URL(p.body,dir),'utf8')+fs.readFileSync(new URL(p.module,dir),'utf8')+p.assets.map(a=>a.sha256).join(''));
const base=(process.env.SAMMAKKO_TEST_URL??'http://127.0.0.1:4191/site/').replace(/\/?$/,'/');
const output=process.env.SAMMAKKO_QA_DIR??fs.mkdtempSync(path.join(os.tmpdir(),'B04-scimeasure-integrated-'));fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true}),results=[],errors=[];
try{for(const width of [390,1280]){
 const page=await browser.newPage({viewport:{width,height:900}});page.on('pageerror',e=>errors.push({width,message:e.message}));
 try{
  // Observe module-owned listeners before the actual compiled module mounts.
  await page.addInitScript(()=>{
   window.__sciCounts={click:0,input:0,change:0};const add=EventTarget.prototype.addEventListener,remove=EventTarget.prototype.removeEventListener;
   EventTarget.prototype.addEventListener=function(type,...args){if(typeof this.matches==='function'&&this.matches('[data-scimeasure]')&&Object.hasOwn(window.__sciCounts,type))window.__sciCounts[type]++;return add.call(this,type,...args);};
   EventTarget.prototype.removeEventListener=function(type,...args){if(typeof this.matches==='function'&&this.matches('[data-scimeasure]')&&Object.hasOwn(window.__sciCounts,type))window.__sciCounts[type]--;return remove.call(this,type,...args);};
  });
  await page.goto(new URL('lessons/'+id+'.html',base).href);
  assert.equal(await page.locator('article[data-content-revision]').getAttribute('data-content-revision'),revision,'compiled page must match current frozen source');
  await page.waitForFunction(()=>{const f=document.querySelector('[data-scimeasure] fieldset');return f&&!f.disabled;});
  const s=page.locator('[data-scimeasure]'),q=x=>s.locator(x),verdict=()=>q('[data-result]').getAttribute('data-verdict'),check=()=>q('[data-action="check"]').click();
  const equal=async want=>assert.equal(await verdict(),want);
  const align=async z=>q('[data-zero]').evaluate((e,v)=>{e.value=String(v);e.dispatchEvent(new Event('input',{bubbles:true}));},z);
  await q('[data-tool]').selectOption('ruler');await q('[data-unit]').selectOption('cm');await q('[data-value]').fill('6');await align(2);await check();await equal('correct');
  await q('[data-value]').fill('7');await equal('neutral');await check();await equal('retry');await q('[data-value]').fill('6');await equal('neutral');await check();await equal('correct');
  await q('[data-value]').fill('');await equal('neutral');await check();await equal('retry');await q('[data-value]').fill('6');await equal('neutral');await check();await equal('correct');
  await q('[data-guide]').check();await equal('correct');await q('[data-guide]').uncheck();await equal('correct');
  await q('[data-unit]').selectOption('mm');await equal('neutral');await check();await equal('retry');await q('[data-value]').fill('60');await equal('neutral');await check();await equal('correct');
  await align(1);await equal('neutral');await check();await equal('retry');assert.match(await q('[data-result]').textContent(),/aloittaa nollasta/);await align(2);await equal('neutral');await check();await equal('correct');
  await q('[data-tool]').selectOption('scale');await equal('neutral');await check();await equal('retry');await q('[data-tool]').selectOption('ruler');await equal('neutral');await check();await equal('correct');
  await q('[data-case]').selectOption('leaf');await equal('neutral');await q('[data-tool]').selectOption('ruler');await q('[data-unit]').selectOption('cm');await q('[data-value]').fill('4');await align(3);await check();await equal('correct');
  await q('[data-unit]').selectOption('mm');await equal('neutral');await q('[data-value]').fill('40');await check();await equal('correct');
  await q('[data-case]').selectOption('air');await equal('neutral');assert.equal(await q('[data-ruler-control]').isVisible(),false);await q('[data-tool]').selectOption('thermometer');await q('[data-unit]').selectOption('°C');await q('[data-value]').fill('18');await check();await equal('correct');
  await q('[data-value]').fill('14');await equal('neutral');await check();await equal('retry');assert.match(await q('[data-result]').textContent(),/2 °C/);await q('[data-value]').fill('18');await equal('neutral');await check();await equal('correct');
  await page.locator('.module-tools>summary').click();const shared=x=>page.locator(`[data-module-action="${x}"]`).click();await shared('pause');
  assert(await q('[data-controls]').evaluate(e=>e.disabled));for(const el of await s.locator('button,input,select').all())assert(await el.isDisabled());
  await page.evaluate(()=>{const e=document.querySelector('[data-value]');e.value='14';e.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('[data-action="check"]').click();});await equal('correct');
  await shared('resume');await equal('neutral');await check();await equal('retry');await q('[data-value]').fill('18');await equal('neutral');await check();await equal('correct');
  await shared('pause');await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));assert(await q('[data-controls]').evaluate(e=>e.disabled));await shared('reset');await shared('reset');assert(await q('[data-controls]').evaluate(e=>e.disabled));assert(await q('[data-action="check"]').isDisabled());await shared('resume');await equal('neutral');
  assert.deepEqual(await page.evaluate(()=>window.__sciCounts),{click:1,input:1,change:1});
  for(const img of await page.locator('#lesson-body img').all())assert(await img.evaluate(e=>e.complete&&e.naturalWidth>0&&!!e.alt));
  for(const el of await s.locator('button,input,select').all()){const b=await el.boundingBox();assert(b&&b.width>=44&&b.height>=44,'component control >=44px');}
  const layout=await page.evaluate(()=>{const body=document.querySelector('#lesson-body'),component=document.querySelector('[data-scimeasure]'),heading=document.querySelector('h1');return{documentOverflow:document.documentElement.scrollWidth-window.innerWidth,bodyOverflow:body.scrollWidth-body.clientWidth,componentOverflow:component.scrollWidth-component.clientWidth,heading:heading?.textContent};});
  assert(layout.componentOverflow<=1,'component overflow');
  for(const asset of p.assets){const url=new URL(asset.path.startsWith('shared/')?'../'+asset.path:'../content/'+id+'/'+asset.path,page.url());const response=await page.request.get(url.href);assert(response.ok());assert.equal(sha(await response.body()),asset.sha256);}
  const moduleResponse=await page.request.get(new URL('../content/'+id+'/'+p.module,page.url()).href);assert(moduleResponse.ok());assert.equal(sha(await moduleResponse.body()),sha(fs.readFileSync(new URL(p.module,dir))));
  await s.screenshot({path:path.join(output,`${id}-${width}-reset.png`)});await page.screenshot({path:path.join(output,`${id}-${width}-page.png`),fullPage:true});
  // Exercise actual loader disposal, then remount the actual compiled module explicitly.
  await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));assert.deepEqual(await page.evaluate(()=>window.__sciCounts),{click:0,input:0,change:0});assert.match(await page.locator('[data-module-status]').textContent(),/Suljettu/);
  await page.evaluate(async()=>{const m=await import('../content/SCI-ENV-MEAS-01/lesson.mjs');window.__sciHandle=m.mount(document.querySelector('[data-lesson-module]'));window.__sciHandle.pause();window.__sciHandle.reset();});assert(await q('[data-controls]').evaluate(e=>e.disabled));await page.evaluate(()=>{window.__sciHandle.resume();window.__sciHandle.reset();window.__sciHandle.reset();});assert.deepEqual(await page.evaluate(()=>window.__sciCounts),{click:1,input:1,change:1});
  await page.evaluate(()=>{window.__sciHandle.dispose();window.__sciHandle.dispose();});assert.deepEqual(await page.evaluate(()=>window.__sciCounts),{click:0,input:0,change:0});
  results.push({width,status:layout.documentOverflow<=1?'PASS':'FAIL_SHARED_LAYOUT',interactions:'PASS',exactCompiledRevision:true,feedback:'current-answer edits and equivalent cm/mm, wrong/blank repair, optional guide preserves; no blanket reset',lifecycle:'actual loader pause/resume/reset/pagehide, compiled module remount and listener cleanup',layout});
 }catch(error){results.push({width,status:'FAIL',message:error.message});}finally{await page.close();}
}
const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}}),page=await context.newPage();await page.goto(new URL('lessons/'+id+'.html',base).href);assert.equal(await page.locator('article[data-content-revision]').getAttribute('data-content-revision'),revision);assert(await page.locator('[data-controls]').evaluate(e=>e.disabled));for(const img of await page.locator('#lesson-body img').all())assert(await img.evaluate(e=>e.complete&&e.naturalWidth>0));assert((await page.locator('#lesson-body').textContent()).includes('Lähtökysymys'));results.push({noJavaScript:true,status:'PASS',staticTeaching:true});await context.close();
}finally{await browser.close();}
const report={id,revision,base,status:results.every(x=>x.status==='PASS')&&!errors.length?'PASS':'FAIL',results,errors,scope:'Actual compiled site, no source preview/interception/build. Synthetic interaction/lifecycle verification, not physical measurement, human review or efficacy.'};fs.writeFileSync(path.join(output,'SCI-ENV-MEAS-01-integrated-browser.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,output},null,2));if(report.status!=='PASS')process.exitCode=1;
