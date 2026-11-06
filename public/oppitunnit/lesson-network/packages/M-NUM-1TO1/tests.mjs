import {assertPackageRevision} from '../../test-package-revision-helper.mjs';
/* global document, window, innerWidth, getComputedStyle */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import * as logic from './lesson.mjs';
import {loadPackages} from '../../content.mjs';
const directory=path.dirname(fileURLToPath(import.meta.url));
const kc=path.basename(directory);
const network=path.resolve(directory,'../..');
const meta=JSON.parse(fs.readFileSync(path.join(directory,'lesson.json'),'utf8'));
const canonical=JSON.parse(fs.readFileSync(path.join(network,'reference/inputs/canonical-690-graph.json'),'utf8')).nodes.find(n=>n.id===kc);
assert.equal(meta.kcId,kc);assert.equal(meta.state,'draft');const boundRevision = assertPackageRevision(import.meta.url,3);
assert.deepEqual(meta.planning.canonicalPrerequisiteGroups,canonical.prerequisite_groups);
assert(meta.research.every(r=>r.url.startsWith('https://')&&r.title&&r.organization&&r.retrieved==='2026-10-29'&&r.adopted.length&&r.rejected.length));
const source=fs.readFileSync(path.join(directory,'lesson.mjs'),'utf8');
assert(!/localStorage|sessionStorage|fetch\(|indexedDB|sendBeacon/.test(source));
const body=fs.readFileSync(path.join(directory,'body.html'),'utf8');
assert(!/Marja [A-H]|Kivi [A-H]/.test(body));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),kc+'-source-check-'));
try {
 fs.mkdirSync(path.join(temp,'reference/inputs'),{recursive:true});fs.copyFileSync(path.join(network,'reference/inputs/mvp-scope-181.json'),path.join(temp,'reference/inputs/mvp-scope-181.json'));
 fs.mkdirSync(path.join(temp,'packages'),{recursive:true});fs.cpSync(directory,path.join(temp,'packages',kc),{recursive:true});
 for(const a of meta.assets.filter(a=>a.path.startsWith('shared/'))){const dest=path.join(temp,a.path);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(network,a.path),dest);}
 const loaded=loadPackages(temp,[kc]);assert.equal(loaded.size,1);assert.equal(loaded.get(kc).metadata.contentRevision,boundRevision);
} finally {fs.rmSync(temp,{recursive:true,force:true});}
if(kc==='M-NUM-STABLE-ORDER'){
 const correct=['yksi','kaksi','kolme','neljä','viisi'];assert(logic.sequenceFeedback(correct).ok);
 for(let i=0;i<5;i++){const swap=[...correct];swap[i]='kuusi';assert(!logic.sequenceFeedback(swap).ok);}
 assert(!logic.sequenceFeedback([]).ok);assert.match(logic.sequenceFeedback(['yksi','kaksi']).text,/kolme/);
 assert(!logic.sequenceFeedback(['yksi','kolme']).ok);assert(!logic.sequenceFeedback([...correct,'kuusi']).ok);
}
if(kc==='M-NUM-1TO1'||kc==='M-NUM-01'){
 const size=kc==='M-NUM-1TO1'?4:8;
 const permutations=(xs)=>xs.length<2?[xs]:xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>j!==i)).map(rest=>[x,...rest]));
 const routes=size===4?permutations([0,1,2,3]):[[0,1,2,3,4,5,6,7],[7,6,5,4,3,2,1,0],[2,5,0,7,1,6,3,4]];
 for(const route of routes){let seen=[];for(const id of route){const prev=[...seen];const next=logic.visitOnce(seen,id,size);assert.deepEqual(seen,prev);seen=next.values;assert.equal(logic.visitOnce(seen,id,size).kind,'repeat');assert.equal(logic.visitOnce(seen,id,size).values.length,seen.length);}assert.equal(new Set(seen).size,size);}
 for(const invalid of [-1,size,1.5,NaN])assert.equal(logic.visitOnce([],invalid,size).kind,'invalid');
 if(size===8){assert(logic.amountFeedback(8,8).ok);assert(!logic.amountFeedback(7,8).ok);assert(!logic.amountFeedback(9,8).ok);}
}
if(kc==='M-NUM-02'){
 let selected=[];for(const id of [4,1,3])selected=logic.toggleSelection(selected,id,5);assert.equal(selected.length,3);
 selected=logic.toggleSelection(selected,1,5);assert.deepEqual(selected,[4,3]);assert.deepEqual(logic.toggleSelection(selected,-1,5),selected);
 for(let a=0;a<5;a++)for(let b=a+1;b<5;b++)for(let c=b+1;c<5;c++){let x=[];for(const id of [a,b,c])x=logic.toggleSelection(x,id,5);assert.equal(x.length,3);}
 assert.deepEqual(logic.toggleSelection([1],1,5),[]);
}
console.log(`${kc}: source schema, canonical prerequisites and boundary-specific logic PASS`);
if(process.argv.includes('--browser')){
 const {chromium}=await import('@playwright/test');
 const mime={'.svg':'image/svg+xml','.png':'image/png','.mjs':'text/javascript','.css':'text/css'};
 const shell=fs.readFileSync(path.join(network,'assets/shell.css'),'utf8');
 const harness=`import {mount} from '/package/lesson.mjs';window.lessonHandle=mount(document.querySelector('[data-lesson-module]'));document.querySelectorAll('[data-shell]').forEach(b=>b.addEventListener('click',()=>window.lessonHandle[b.dataset.shell]()));`;
 const server=createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/lesson'){
   res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<!doctype html><html lang="fi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/package/"><title>${kc} source-only check</title><style>${shell}</style><main><section id="lesson-body" class="lesson">${body}<div data-lesson-module><button data-shell="pause">Tauko</button><button data-shell="resume">Jatka</button><button data-shell="reset">Alusta</button></div></section></main><script type="module" src="/harness.mjs"></script></html>`);return;
  }
  if(pathname==='/harness.mjs'){res.setHeader('Content-Type','text/javascript');res.end(harness);return;}
  if(pathname.startsWith('/package/')){
   const relative=pathname.slice('/package/'.length);const base=relative.startsWith('shared/')?network:directory;const target=path.resolve(base,relative);
   if(target.startsWith(base+path.sep)&&fs.existsSync(target)&&fs.statSync(target).isFile()){res.setHeader('Content-Type',mime[path.extname(target)]??'text/plain');res.end(fs.readFileSync(target));return;}
  }
  res.writeHead(404);res.end();
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true});const errors=[];
 try {
 const context=await browser.newContext();const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const url=`http://127.0.0.1:${server.address().port}/lesson`;
 for(const width of [390,1280]){
  await page.setViewportSize({width,height:900});await page.goto(url);await page.locator('[data-module-ready="true"]').waitFor();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(const img of await page.locator('img').all())assert(await img.evaluate(e=>e.complete&&e.naturalWidth>0));
  for(const button of await page.locator('button').all()){const box=await button.boundingBox();assert(box&&box.height>=44&&box.width>=44,`small control ${await button.textContent()}`);}
  const result=async key=>page.locator(`[data-feedback="${key}"]`).getAttribute('data-result');
  const click=async action=>page.locator(`[data-action="${action}"]`).click();
  const answer=async (question,value)=>page.locator(`[data-question="${question}"][data-answer="${value}"]`).click();
  const object=async (action,id)=>page.locator(`[data-action="${action}"][data-object="${id}"]`).click();
  if(kc==='M-NUM-STABLE-ORDER'){
   await page.locator('[data-word="kolme"]').click();await click('check-sequence');assert.equal(await result('sequence'),'retry');
   await page.locator('[data-shell="reset"]').click();
   for(const word of ['yksi','kaksi','kolme','neljä','viisi'])await page.locator(`[data-word="${word}"]`).click();
   await click('check-sequence');assert.equal(await result('sequence'),'correct');
   await answer('next','viisi');assert.equal(await result('next'),'retry');await answer('next','seitsemän');assert.equal(await result('next'),'correct');
  } else if(kc==='M-NUM-1TO1'){
   assert.equal(await page.locator('[data-action="check-tags"]').count(),0);
   const positions=await page.locator('[data-action="tag"]').evaluateAll(bs=>bs.map(b=>{const r=b.getBoundingClientRect();return [r.x,r.y+window.scrollY,r.width,r.height];}));
   for(const [index,id] of [2,0,3,1].entries()){
    await object('tag',id);const b=page.locator(`[data-action="tag"][data-object="${id}"]`);assert(await b.isDisabled());assert.equal(await b.locator('[data-count-label]').textContent(),String(index+1));assert((await b.getAttribute('aria-label')).includes(logic.WORDS[index]));assert(Number(await b.evaluate(e=>getComputedStyle(e).opacity))<1);
   }
   assert.deepEqual(await page.locator('[data-action="tag"]').evaluateAll(bs=>bs.map(b=>{const r=b.getBoundingClientRect();return [r.x,r.y+window.scrollY,r.width,r.height];})),positions);
   assert.equal(await result('tags'),'correct');if(width===390)await page.locator('section[aria-label="Lyhyt harjoitus"]').screenshot({path:path.join(os.tmpdir(),`${kc}-completed-390.png`)});assert.equal(await page.locator('[data-action="tag"][aria-pressed="true"]').count(),4);
   await click('clear-tags');assert.equal(await page.locator('[data-action="tag"]:disabled').count(),0);
   await answer('repair','double');assert.equal(await result('repair'),'retry');await answer('repair','add');assert.equal(await result('repair'),'correct');
  } else if(kc==='M-NUM-01'){
   await answer('total','8');assert.equal(await result('total'),'correct');assert.equal(await page.locator('[data-action="visit"][aria-pressed="true"]').count(),0);
   await object('visit',5);await object('visit',5);assert.equal(await page.locator('[data-action="visit"][aria-pressed="true"]').count(),1);
   await answer('total','7');assert.equal(await result('total'),'retry');await answer('total','9');assert.equal(await result('total'),'retry');await answer('total','8');assert.equal(await result('total'),'correct');
   await answer('ring','again');assert.equal(await result('ring'),'retry');await answer('ring','stop');assert.equal(await result('ring'),'correct');
  } else {
   await answer('covered','5');assert.equal(await result('covered'),'correct');assert.equal(await page.locator('[data-action="give"][aria-pressed="true"]').count(),0);
   await answer('covered','1');assert.equal(await result('covered'),'retry');await answer('covered','6');assert.equal(await result('covered'),'retry');await answer('covered','5');
   await object('give',4);await click('check-give');assert.equal(await result('give'),'retry');await object('give',1);await object('give',2);await click('check-give');assert.equal(await result('give'),'correct');
   await object('give',0);await click('check-give');assert.equal(await result('give'),'retry');await object('give',0);await click('check-give');assert.equal(await result('give'),'correct');
  }
  await click('step');assert(await page.locator('[data-demo-scene] svg').isVisible());
  if(width===390){await page.locator('section[aria-label="Lyhyt harjoitus"]').screenshot({path:path.join(os.tmpdir(),`${kc}-practice-390.png`)});await page.locator('[data-demo]').screenshot({path:path.join(os.tmpdir(),`${kc}-model-390.png`)});}
  const before=await page.locator('[data-demo-view]').textContent();await page.locator('[data-shell="pause"]').click();await click('step');assert.equal(await page.locator('[data-demo-view]').textContent(),before);
  await page.locator('[data-shell="reset"]').click();const reset=await page.locator('[data-demo-view]').textContent();await click('step');assert.equal(await page.locator('[data-demo-view]').textContent(),reset);
  await page.locator('[data-shell="resume"]').click();await click('step');assert.notEqual(await page.locator('[data-demo-view]').textContent(),reset);
 }
 // Exercise a real interval, pausing it before a tick and disposing another live playback.
 await page.goto(url);await page.locator('[data-module-ready="true"]').waitFor();
 await page.locator('[data-action="play"]').click();const first=await page.locator('[data-demo-view]').textContent();await page.waitForTimeout(2100);assert.notEqual(await page.locator('[data-demo-view]').textContent(),first);
 await page.locator('[data-shell="pause"]').click();const paused=await page.locator('[data-demo-view]').textContent();await page.waitForTimeout(2100);assert.equal(await page.locator('[data-demo-view]').textContent(),paused);
 await page.locator('[data-shell="resume"]').click();await page.locator('[data-action="demo-reset"]').click();await page.locator('[data-action="play"]').click();await page.evaluate(()=>window.lessonHandle.dispose());
 const disposed=await page.locator('[data-demo-view]').textContent();await page.waitForTimeout(2100);await page.locator('[data-action="step"]').click();assert.equal(await page.locator('[data-demo-view]').textContent(),disposed);assert.equal(await page.locator('[data-module-ready]').count(),0);
 assert.deepEqual(errors,[]);
 // Static HTML remains useful without scripts.
 const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});const staticPage=await noJS.newPage();await staticPage.goto(url);assert(await staticPage.locator('figure img').isVisible());assert((await staticPage.locator('h3').count())>=5);await noJS.close();
 console.log(`${kc}: browser PASS (390/1280, direct-answer/novel activity, feedback, pause/reset/dispose, source images, no horizontal overflow, >=44px controls, no-JS text)`);
 } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
}
