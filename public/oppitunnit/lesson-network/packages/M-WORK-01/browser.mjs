/* global window, document */
// Author source harness only. No live server or network build; all responses are local bytes.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
const dir=new URL('./',import.meta.url),network=new URL('../../',import.meta.url);
const meta=JSON.parse(fs.readFileSync(new URL('lesson.json',dir),'utf8')),id=meta.kcId;
const body=fs.readFileSync(new URL(meta.body,dir),'utf8');
const folder=fs.mkdtempSync(path.join(os.tmpdir(),id+'-author-'));
const html=js=>`<!doctype html><html lang="fi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/shell.css"><style>main{max-width:52rem;margin:auto;padding:16px}body{margin:0}</style></head><body><main><div id="lesson-body">${body.replaceAll('src="shared/','src="/shared/')}<div data-mount></div></div></main>${js?'<script type="module">import{mount}from"./lesson.mjs";window.b03handle=mount(document.querySelector("[data-mount]"));window.b03mount=mount;window.b03ready=true;</script>':''}</body></html>`;
const browser=await chromium.launch({headless:true}),errors=[];
try{
 const context=await browser.newContext();
 await context.route('http://b03.local/**',async route=>{
  const url=new URL(route.request().url()),p=decodeURIComponent(url.pathname);
  if(p.endsWith('/index.html'))return route.fulfill({contentType:'text/html',body:html(true)});
  let local;if(p==='/shell.css')local=new URL('assets/shell.css',network);else if(p.startsWith('/shared/'))local=new URL(p.slice(1),network);else if(p.startsWith('/'+id+'/')&&!p.includes('..'))local=new URL(p.slice(id.length+2),dir);
  if(!local||!fs.existsSync(local))return route.fulfill({status:404,body:'Missing local test resource'});
  const ext=path.extname(local.pathname),type={'.css':'text/css','.mjs':'text/javascript','.svg':'image/svg+xml','.png':'image/png'}[ext]??'text/plain';
  return route.fulfill({contentType:type,body:fs.readFileSync(local)});
 });
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 for(const width of [390,1280]){
  await page.setViewportSize({width,height:900});await page.goto(`http://b03.local/${id}/index.html`);await page.waitForFunction(()=>window.b03ready===true);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),id+' no horizontal overflow');
  for(const img of await page.locator('#lesson-body img').all())assert(await img.evaluate(e=>e.complete&&e.naturalWidth>0),id+' image loads');
  const s=page.locator('fieldset');const out=s.locator('[data-feedback]');const action=name=>s.locator(`[data-action="${name}"]`);
  if(id==='M-TH-08'){
   await action('check').click();assert.equal(await out.getAttribute('data-result'),'retry');await s.locator('[data-term="4"]').focus();await page.keyboard.press('Enter');assert.equal(await s.locator('[data-sum]').textContent(),'4');await action('clear').click();
   for(let i=0;i<4;i++)await s.locator('[data-term="3"]').click();await s.locator('[data-groups]').selectOption('4');await s.locator('[data-size]').selectOption('3');await action('check').click();assert.equal(await out.getAttribute('data-result'),'correct');
   await s.locator('[data-groups]').selectOption('3');await s.locator('[data-size]').selectOption('4');await action('check').click();assert.equal(await out.getAttribute('data-result'),'retry');assert.match(await out.textContent(),/saman määrän/);
   for(let i=0;i<4;i++){await action('step').click();assert.equal(await s.locator('[data-counter]').count(),12);}assert(await action('step').isDisabled());await action('next').click();for(let i=0;i<3;i++)await s.locator('[data-term="2"]').click();await s.locator('[data-groups]').selectOption('3');await s.locator('[data-size]').selectOption('2');await action('check').click();assert.equal(await out.getAttribute('data-result'),'correct');
  }else if(id==='M-WORK-01'){
   await s.locator('[data-fact="books"]').click();await action('check').click();assert.equal(await out.getAttribute('data-result'),'retry');await s.locator('[data-fact="books"]').click();await s.locator('[data-fact="start"]').click();await action('check').click();assert.equal(await out.getAttribute('data-result'),'retry');await s.locator('[data-fact="added"]').click();await action('check').click();assert.equal(await out.getAttribute('data-result'),'correct');assert.equal(await s.locator('[data-workspace] li').count(),2);
   await action('next').click();assert.equal(await s.locator('[data-workspace] li').count(),0);await s.locator('[data-fact="colour"]').click();await action('check').click();assert.equal(await out.getAttribute('data-result'),'correct');await action('next').click();await s.locator('[data-fact="books"]').click();await action('check').click();assert.equal(await out.getAttribute('data-result'),'correct');
  }else{
   await action('step').click();assert.match(await s.locator('[data-tested]').textContent(),/Täsmää/);await action('step').click();assert.match(await s.locator('[data-tested]').textContent(),/Ei täsmää/);await action('check').click();assert.equal(await out.getAttribute('data-result'),'retry');
   await s.locator('[data-a]').selectOption('3');await s.locator('[data-b]').selectOption('2');assert.equal(await s.locator('[data-tested] li').count(),0);await action('all').click();assert.equal(await s.locator('[data-tested] li').count(),3);await action('check').click();assert.equal(await out.getAttribute('data-result'),'correct');assert.match(await out.textContent(),/ei yksin todista/);
   await action('check-formula').click();assert.equal(await s.locator('[data-formula-feedback]').getAttribute('data-result'),'retry');for(const form of ['first','shared']){await s.locator('[data-formula]').selectOption(form);await action('check-formula').click();assert.equal(await s.locator('[data-formula-feedback]').getAttribute('data-result'),'correct');}for(let i=1;i<8;i++)await action('plus').click();assert.equal(await s.locator('[data-edge]').count(),25);assert(await action('plus').isDisabled());
  }
  const before=await s.locator('button,select').evaluateAll(es=>es.map(e=>e.disabled));await page.evaluate(()=>window.b03handle.pause());for(const control of await s.locator('button,select').all())assert(await control.isDisabled());
  await page.evaluate(()=>window.b03handle.reset());for(const control of await s.locator('button,select').all())assert(await control.isDisabled());await page.evaluate(()=>window.b03handle.resume());assert.equal(await s.isDisabled(),false);assert(before.length>0);
  await page.screenshot({path:path.join(folder,width+'.png'),fullPage:true});
  await page.evaluate(()=>{window.b03handle.dispose();window.b03handle.dispose();window.b03handle=window.b03mount(document.querySelector('[data-mount]'));});
  if(id==='M-TH-08'){await s.locator('[data-term="3"]').click();assert.equal(await s.locator('[data-sum]').textContent(),'3');}
  if(id==='M-WORK-01'){await s.locator('[data-fact="start"]').click();assert.equal(await s.locator('[data-workspace] li').count(),1);}
  if(id==='M79-LOGIC-01'){await action('step').click();assert.equal(await s.locator('[data-tested] li').count(),1);}
 }
 const staticContext=await browser.newContext({javaScriptEnabled:false});await staticContext.route('http://b03.local/**',async route=>{const p=new URL(route.request().url()).pathname;if(p.endsWith('/index.html'))return route.fulfill({contentType:'text/html',body:html(false)});const local=p==='/shell.css'?new URL('assets/shell.css',network):p.startsWith('/shared/')?new URL(p.slice(1),network):new URL(p.slice(id.length+2),dir);const ext=path.extname(local.pathname);return route.fulfill({body:fs.readFileSync(local),contentType:{'.css':'text/css','.png':'image/png','.svg':'image/svg+xml'}[ext]??'text/plain'});});
 const staticPage=await staticContext.newPage();await staticPage.setViewportSize({width:390,height:900});await staticPage.goto(`http://b03.local/${id}/index.html`);assert(await staticPage.locator('h3').count()>=3);assert((await staticPage.locator('#lesson-body').textContent()).includes('Lopuksi'));for(const img of await staticPage.locator('img').all())assert(await img.evaluate(e=>e.complete&&e.naturalWidth>0));await staticPage.screenshot({path:path.join(folder,'static390.png'),fullPage:true});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({kcId:id,status:'PASS',viewports:[390,1280],images:true,noOverflow:true,actualConstructionAndRepair:true,lifecycle:true,staticContent:true,artifacts:folder,limits:'Author source harness; not shared integration, independent pedagogy, human validation or efficacy.'}));
}finally{await browser.close();}
