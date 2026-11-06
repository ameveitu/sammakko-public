/* global window, document, innerWidth */
// Source-only author QA. Local bytes composed in memory; no main build or package/state writes.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';
const dir=path.dirname(fileURLToPath(import.meta.url)),network=path.resolve(dir,'../..'),meta=JSON.parse(fs.readFileSync(path.join(dir,'lesson.json'),'utf8')),id=meta.kcId;
const output=path.join('/tmp/sammakko-B04-algebra-author/qa',id);fs.mkdirSync(output,{recursive:true});
const body=fs.readFileSync(path.join(dir,'body.html'),'utf8');
const html=`<!doctype html><html lang="fi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${id} source QA</title><link rel="stylesheet" href="/shell.css"><style>main{max-width:52rem;margin:auto;padding:16px}body{margin:0}</style></head><body><main class="lesson"><h1>Lähdetesti</h1><div id="lesson-body">${body}<div data-mount></div></div></main><script type="module">import {mount} from '/lesson.mjs';window.mountLesson=mount;window.lessonHandle=mount(document.querySelector('[data-mount]'));window.ready=true;</script></body></html>`;
async function route(r){const p=new URL(r.request().url()).pathname;if(p==='/index.html')return r.fulfill({contentType:'text/html',body:html});const local=p==='/shell.css'?path.join(network,'assets/shell.css'):p.startsWith('/shared/')?path.join(network,p.slice(1)):path.join(dir,p.slice(1));if(!fs.existsSync(local))return r.fulfill({status:404,body:'Missing source asset'});return r.fulfill({body:fs.readFileSync(local),contentType:{'.css':'text/css','.mjs':'text/javascript','.svg':'image/svg+xml','.png':'image/png'}[path.extname(local)]??'text/plain'});}
const browser=await chromium.launch({headless:true}),errors=[],results=[];
try{const context=await browser.newContext();await context.route('http://algebra.local/**',route);const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
for(const width of [390,1280]){
 await page.setViewportSize({width,height:900});await page.goto('http://algebra.local/index.html');await page.waitForFunction(()=>window.ready);const area=page.locator('[data-practice]'),f=area.locator('fieldset'),out=area.locator('[data-feedback]'),a=name=>area.locator(`[data-action="${name}"]`);
 const verdict=async want=>assert.equal(await out.getAttribute('data-result'),want);
 if(id==='M79-VAR-UNKNOWN'){
  const input=area.locator('[data-candidate]');await a('check').click();await verdict('retry');await input.fill('12');await verdict('support');await a('check').click();await verdict('correct');
  await a('reverse').click();await verdict('correct');assert.equal(await area.locator('[data-relation]').textContent(),'17 = 12 + 5');
  await input.fill('13');await verdict('support');assert.doesNotMatch(await out.textContent(),/täyttää ehdon/);await a('check').click();await verdict('retry');assert.match(await out.textContent(),/18/);
  await input.fill('10');await verdict('support');await a('check').click();await verdict('retry');await input.fill('12');await verdict('support');await a('check').click();await verdict('correct');
  await a('clear').click();await verdict('support');await a('check').click();await verdict('retry');await a('context').click();await verdict('support');assert.equal(await input.inputValue(),'');await input.fill('7');await a('check').focus();await page.keyboard.press('Enter');await verdict('correct');assert.match(await out.textContent(),/7 \+ 4 = 11/);
 }else if(id==='M79-VAR-VARYING'){
  const input=area.locator('[data-answer]');await input.fill('10');await a('check').click();await verdict('correct');await a('plus').click();await verdict('correct');assert.match(await area.locator('[data-target-note]').textContent(),/n = 3/);
  await area.locator('[data-target]').selectOption('4');await verdict('support');await a('check').click();await verdict('retry');assert.match(await out.textContent(),/12/);await input.fill('12');await verdict('support');await a('check').click();await verdict('correct');
  await area.locator('[data-calculation-help] summary').click();await verdict('correct');await input.fill('13');await verdict('support');await a('check').click();await verdict('retry');await input.fill('12');await verdict('support');await a('check').click();await verdict('correct');
  await a('context').click();await verdict('support');assert.equal(await input.inputValue(),'');await input.fill('8');await a('check').click();await verdict('correct');await a('plus').click();await verdict('correct');assert.match(await area.locator('[data-scene] svg').getAttribute('aria-label'),/1 käytetty, 11 jäljellä/);
  await area.locator('[data-target]').selectOption('6');await verdict('support');await a('check').click();await verdict('retry');await input.fill('6');await verdict('support');await a('check').click();await verdict('correct');
  for(let i=1;i<12;i++)await a('plus').click();assert(await a('plus').isDisabled());assert.match(await area.locator('[data-scene] svg').getAttribute('aria-label'),/12 käytetty, 0 jäljellä/);await verdict('correct');
 }else{
  const toggle=(x,y)=>area.locator(`[data-x="${x}"][data-y="${y}"]`).click();
  await a('check').click();await verdict('retry');assert.match(await out.textContent(),/Syöte 1/);await toggle(1,1);await verdict('support');await a('check').click();await verdict('retry');assert.match(await out.textContent(),/syötteeltä 2/);await toggle(2,0);await verdict('support');await a('check').click();await verdict('correct');
  await area.locator('[data-view]').selectOption('2');await verdict('correct');await toggle(1,0);await verdict('support');await a('check').click();await verdict('retry');assert.match(await out.textContent(),/eri tulokset/);await toggle(1,0);await verdict('support');await a('check').click();await verdict('correct');
  await toggle(2,0);await verdict('support');await a('check').click();await verdict('retry');await toggle(2,0);await verdict('support');await a('check').click();await verdict('correct');
  await a('clear').click();await verdict('support');for(const x of [0,1,2])await toggle(x,2);await a('check').click();await verdict('correct');assert.equal(await area.locator('[data-arrow]').count(),3);for(const x of [0,1,2])assert.equal(await area.locator(`[data-x="${x}"][data-y="2"]`).getAttribute('aria-pressed'),'true');
 }
 for(const img of await page.locator('#lesson-body img').all())assert(await img.evaluate(e=>e.complete&&e.naturalWidth>0&&!!e.alt));
 for(const control of await f.locator('button,input,select').all()){const box=await control.boundingBox();assert(box&&box.width>=44&&box.height>=44,'44px control');}
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await f.screenshot({path:path.join(output,`practice-${width}.png`)});await page.screenshot({path:path.join(output,`full-${width}.png`),fullPage:true});await page.locator('figure').screenshot({path:path.join(output,`diagram-${width}.png`)});
 await page.evaluate(()=>window.lessonHandle.pause());for(const c of await f.locator('button,input,select').all())assert(await c.isDisabled());const paused=await area.innerHTML();await area.locator('button').first().evaluate(b=>b.click());assert.equal(await area.innerHTML(),paused);
 await page.evaluate(()=>window.lessonHandle.reset());assert(await f.evaluate(e=>e.disabled));for(const c of await f.locator('button,input,select').all())assert(await c.isDisabled());await page.evaluate(()=>window.lessonHandle.resume());assert.equal(await f.evaluate(e=>e.disabled),false);
 // Remount without disposing first: module replaces its old own instance, avoiding duplicate handlers.
 await page.evaluate(()=>{window.lessonHandle=window.mountLesson(document.querySelector('[data-mount]'));window.lessonHandle.reset();window.lessonHandle.reset();});
 if(id==='M79-VAR-VARYING'){await a('plus').click();assert.equal(await area.locator('[data-count]').textContent(),'1');}
 if(id==='M79-FUNC-01'){await area.locator('[data-x="0"][data-y="2"]').click();assert.equal(await area.locator('[data-x="0"][data-y="2"]').getAttribute('aria-pressed'),'false');}
 if(id==='M79-VAR-UNKNOWN'){await a('context').click();assert.match(await area.locator('[data-context]').textContent(),/Lippu/);}
 await page.evaluate(()=>{window.lessonHandle.dispose();window.lessonHandle.dispose();});assert.equal(await area.isVisible(),false);const disposed=await area.innerHTML();await area.locator('button').first().evaluate(b=>b.click());assert.equal(await area.innerHTML(),disposed);await page.evaluate(()=>{window.lessonHandle=window.mountLesson(document.querySelector('[data-mount]'));});assert(await area.isVisible());
 results.push({width,constructionAndRepair:true,correctAndRetryEditFeedback:true,viewOnlyPreservesVerdict:true,images:true,controls44:true,noOverflow:true,lifecycle:true});
}
const staticContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});await staticContext.route('http://algebra.local/**',route);const staticPage=await staticContext.newPage();await staticPage.goto('http://algebra.local/index.html');assert.equal(await staticPage.locator('[data-practice]').isVisible(),false);assert(await staticPage.locator('figure img').isVisible());assert(await staticPage.locator('h3').count()>=3);assert((await staticPage.locator('#lesson-body').innerText()).includes('Lopuksi:'));await staticContext.close();assert.deepEqual(errors,[]);
const report={id,status:'PASS_AUTHOR_SOURCE_QA',views:results,staticTeaching:true,pageErrors:errors,limits:'Isolated source composition; no live690 build, independent content approval, learner/human testing or efficacy claim.'};fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}
