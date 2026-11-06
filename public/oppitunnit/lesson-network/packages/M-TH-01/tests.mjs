import {assertPackageRevision} from '../../test-package-revision-helper.mjs';
/* global document, window, innerWidth */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import * as logic from './lesson.mjs';
import {loadPackages} from '../../content.mjs';
const directory=path.dirname(fileURLToPath(import.meta.url)),kc=path.basename(directory),network=path.resolve(directory,'../..');
const meta=JSON.parse(fs.readFileSync(path.join(directory,'lesson.json'),'utf8'));
const node=JSON.parse(fs.readFileSync(path.join(network,'reference/inputs/canonical-690-graph.json'),'utf8')).nodes.find(n=>n.id===kc);
const boundRevision = assertPackageRevision(import.meta.url,2);assert.equal(meta.state,'draft');assert.equal(meta.planning.gradeBand,node.grade_band);assert.equal(meta.planning.canonicalRole,node.mastery_role);assert.deepEqual(meta.planning.canonicalPrerequisiteGroups,node.prerequisite_groups);assert.deepEqual(meta.planning.strongSupport,node.relations.filter(r=>r.strength==='strong'));
assert(meta.research.every(r=>r.url.startsWith('https://')&&r.retrieved==='2026-10-29'&&r.title&&r.organization&&r.adopted.length&&r.rejected.length&&r.usageRestrictions));
const body=fs.readFileSync(path.join(directory,'body.html'),'utf8'),module=fs.readFileSync(path.join(directory,'lesson.mjs'),'utf8');
assert(!/localStorage|sessionStorage|fetch\(|indexedDB|setInterval|setTimeout|speechSynthesis/.test(module));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),`${kc}-check-`));
try{
 fs.mkdirSync(path.join(temp,'packages'),{recursive:true});fs.cpSync(directory,path.join(temp,'packages',kc),{recursive:true});
 fs.mkdirSync(path.join(temp,'reference/inputs'),{recursive:true});fs.copyFileSync(path.join(network,'reference/inputs/mvp-scope-181.json'),path.join(temp,'reference/inputs/mvp-scope-181.json'));
 for(const a of meta.assets.filter(a=>a.path.startsWith('shared/'))){const dest=path.join(temp,a.path);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(network,a.path),dest);}
 const loaded=loadPackages(temp,[kc]);assert.equal(loaded.size,1);assert.equal(loaded.get(kc).metadata.contentRevision,boundRevision);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
if(kc==='M-TH-01')for(const c of logic.CASES)assert.doesNotMatch(c.description,/yhtä|molemmat|vasen iso ja oikea pieni/i,'practice describes individual givens rather than comparison answers');
let semanticCases=0;
if(kc==='M-NUM-WORD-NUMERAL'){
 const entries=Object.entries(logic.PAIRS);
 for(const route of [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]){let map={};for(const i of route){const [n,w]=entries[i],before={...map};const next=logic.assignPair(map,w,n);assert.deepEqual(map,before);map=next;}assert(logic.checkPairs(map).ok);semanticCases++;}
 let map=logic.assignPair({},'kuusi','9');assert(!logic.checkPairs(map).ok);map=logic.assignPair(map,'kuusi','6');assert.equal(map['9'],null);assert.equal(map['6'],'kuusi');
 assert.deepEqual(logic.assignPair(map,'bad','6'),map);assert.deepEqual(logic.assignPair(map,'kuusi','42'),map);assert(!logic.checkPairs({}).ok);
 for(const a of Object.values(logic.PAIRS))for(const b of Object.values(logic.PAIRS))for(const c of Object.values(logic.PAIRS)){assert.equal(logic.checkPairs({2:a,6:b,9:c}).ok,a==='kaksi'&&b==='kuusi'&&c==='yhdeksän');semanticCases++;}
}
if(kc==='M-TH-01'){
 const items=[];for(const shape of ['round','angular'])for(const color of ['blue','red'])for(const size of [20,34])items.push({shape,color,size});
 for(const left of items)for(const right of items){const target=logic.compareAttributes(left,right);for(let mask=0;mask<8;mask++){const answers=Object.fromEntries(logic.ATTRIBUTES.map((a,i)=>[a,mask&(1<<i)?'same':'different']));const allMatch=logic.ATTRIBUTES.every(k=>answers[k]===target[k]);assert.equal(logic.checkComparison(left,right,answers).ok,allMatch);semanticCases++;}}
 assert(!logic.checkComparison(items[0],items[0],{}).ok);assert.deepEqual(logic.compareAttributes(items[0],items[0]),{shape:'same',color:'same',size:'same'});
 for(const c of logic.CASES)assert(logic.checkComparison(c.left,c.right,logic.compareAttributes(c.left,c.right)).ok);
}
if(kc==='M-TH-02'){
 for(const rule of ['striped','round']){
  const target=logic.ITEMS.map(item=>logic.targetBin(item,rule));
  for(let mask=0;mask<64;mask++){const answer=logic.ITEMS.map((_,i)=>mask&(1<<i)?'yes':'no');assert.equal(logic.checkSort(answer,rule).ok,answer.every((b,i)=>b===target[i]));semanticCases++;}
  for(let i=0;i<logic.ITEMS.length;i++){const before=[...target],missing=logic.placeItem(target,i,null);assert.deepEqual(target,before);assert(!logic.checkSort(missing,rule).ok);assert(logic.checkSort(logic.placeItem(missing,i,target[i]),rule).ok);}
 }
 assert.notDeepEqual(logic.ITEMS.map(i=>logic.targetBin(i,'striped')),logic.ITEMS.map(i=>logic.targetBin(i,'round')));assert.deepEqual(logic.placeItem([],99,'yes'),[]);
}
console.log(`${kc}: schema/canonical/hash PASS; ${semanticCases} semantic cases PASS`);
if(process.argv.includes('--browser')){
 const {chromium}=await import('@playwright/test');
 const css=fs.readFileSync(path.join(network,'assets/shell.css'),'utf8');
 const harness=`import {mount} from '/package/lesson.mjs';window.lessonHandle=mount(document.querySelector('[data-lesson-module]'));window.remount=()=>{window.lessonHandle.dispose();window.lessonHandle=mount(document.querySelector('[data-lesson-module]'));};document.querySelectorAll('[data-harness]').forEach(b=>b.addEventListener('click',()=>window.lessonHandle[b.dataset.harness]()));`;
 const server=createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/lesson'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<!doctype html><html lang="fi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/package/"><title>${kc} source check</title><style>${css}</style><main><section id="lesson-body" class="lesson">${body}<div data-lesson-module><button data-harness="pause">Tauko</button><button data-harness="resume">Jatka</button><button data-harness="reset">Alusta</button></div></section></main><script type="module" src="/harness.mjs"></script></html>`);return;}
  if(pathname==='/harness.mjs'){res.setHeader('Content-Type','text/javascript');res.end(harness);return;}
  if(pathname.startsWith('/package/')){const rel=pathname.slice(9),base=rel.startsWith('shared/')?network:directory,target=path.resolve(base,rel);if(target.startsWith(base+path.sep)&&fs.existsSync(target)&&fs.statSync(target).isFile()){res.setHeader('Content-Type',({'.svg':'image/svg+xml','.png':'image/png','.mjs':'text/javascript'})[path.extname(target)]??'text/plain');res.end(fs.readFileSync(target));return;}}
  res.writeHead(404);res.end();
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const browser=await chromium.launch({headless:true}),errors=[];
 try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));const url=`http://127.0.0.1:${server.address().port}/lesson`;
 for(const width of [390,1280]){
  await page.setViewportSize({width,height:900});await page.goto(url);await page.locator('[data-module-ready="true"]').waitFor();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(const img of await page.locator('img').all())assert(await img.evaluate(e=>e.complete&&e.naturalWidth>0));
  const root=page.locator(`[data-source-lesson="${kc}"]`),feedback=root.locator('[data-feedback]').first();
  const action=async a=>root.locator(`[data-action="${a}"]`).click();
  if(kc==='M-NUM-WORD-NUMERAL'){
   const word=async w=>root.locator(`[data-word="${w}"]`).click(),slot=async n=>root.locator(`[data-slot="${n}"]`).click();
   await slot(6);assert.match(await feedback.textContent(),/ensin sana/);await word('kuusi');await slot(9);await action('check-pairs');assert.equal(await feedback.getAttribute('data-result'),'retry');
   for(const [n,w] of Object.entries(logic.PAIRS)){await word(w);await slot(n);}await action('check-pairs');assert.equal(await feedback.getAttribute('data-result'),'correct');
   await root.locator('[data-reverse="kuusi"]').click();assert.equal(await root.locator('[data-feedback="reverse"]').getAttribute('data-result'),'retry');await root.locator('[data-reverse="viisi"]').focus();await page.keyboard.press('Enter');assert.equal(await root.locator('[data-feedback="reverse"]').getAttribute('data-result'),'correct');
  }else if(kc==='M-TH-01'){
   for(const [index,c] of logic.CASES.entries()){
    const target=logic.compareAttributes(c.left,c.right);
    for(const [attribute,value] of Object.entries(target))await root.locator(`[data-attribute="${attribute}"][data-value="${value}"]`).click();
    await action('check');assert.equal(await feedback.getAttribute('data-result'),'correct');
    await root.locator('[data-attribute="shape"][data-value="'+(target.shape==='same'?'different':'same')+'"]').click();await action('check');assert.equal(await feedback.getAttribute('data-result'),'retry');
    if(index<logic.CASES.length-1)await action('next');
   }
  }else{
   await action('check');assert.equal(await feedback.getAttribute('data-result'),'retry');
   await root.locator('[data-bin="no"]').click();assert.equal(await root.locator('[data-return]').count(),1);
   for(let i=1;i<logic.ITEMS.length;i++)await root.locator(`[data-bin="${logic.targetBin(logic.ITEMS[i],'striped')}"]`).click();
   await action('check');assert.equal(await feedback.getAttribute('data-result'),'retry');assert.match(await feedback.textContent(),/vain raidoista/);
   await root.locator('[data-return="0"]').click();await root.locator('[data-bin="yes"]').click();await action('check');assert.equal(await feedback.getAttribute('data-result'),'correct');
   await action('rule');assert.equal(await root.locator('[data-return]').count(),0);assert.match(await root.locator('[data-rule]').textContent(),/pyöreät/);
   for(const item of logic.ITEMS)await root.locator(`[data-bin="${logic.targetBin(item,'round')}"]`).click();await action('check');assert.equal(await feedback.getAttribute('data-result'),'correct');
  }
  for(const button of await root.locator('button').all()){const box=await button.boundingBox();assert(box&&box.height>=44&&box.width>=44,'undersized control');}
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(width===390)await root.locator('section[aria-label="Lyhyt harjoitus"]').screenshot({path:path.join(os.tmpdir(),`${kc}-B02-practice-390.png`)});
  await page.locator('[data-harness="pause"]').click();const unchanged=await root.innerHTML();await action(kc==='M-NUM-WORD-NUMERAL'?'clear':kc==='M-TH-01'?'next':'clear');assert.equal(await root.innerHTML(),unchanged);
  await page.locator('[data-harness="reset"]').click();const reset=await root.innerHTML();await action(kc==='M-NUM-WORD-NUMERAL'?'check-pairs':'check');assert.equal(await root.innerHTML(),reset);
  await page.locator('[data-harness="resume"]').click();await action(kc==='M-NUM-WORD-NUMERAL'?'check-pairs':'check');assert.notEqual(await root.innerHTML(),reset);
  for(let i=0;i<5;i++)await page.locator('[data-harness="reset"]').click();
  if(kc==='M-TH-01'){await action('next');assert.match(await root.locator('[data-pair-description]').textContent(),/^Pari 2:/);}
  if(kc==='M-TH-02'){await root.locator('[data-bin="yes"]').click();assert.equal(await root.locator('[data-return]').count(),1);}
  await page.evaluate(()=>window.lessonHandle.dispose());const disposed=await root.innerHTML();await action(kc==='M-NUM-WORD-NUMERAL'?'clear':kc==='M-TH-01'?'next':'clear');assert.equal(await root.innerHTML(),disposed);assert.equal(await root.getAttribute('data-module-ready'),null);
  await page.evaluate(()=>window.remount());assert.equal(await root.getAttribute('data-module-ready'),'true');
 }
 const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}}),staticPage=await noJS.newPage();await staticPage.goto(url);assert(await staticPage.locator('figure img').isVisible());const teaching=await staticPage.locator('[data-source-lesson]').innerText();for(const label of ['Tavoite:','Ennusta:','Lopuksi:'])assert(teaching.includes(label));assert((await staticPage.locator('h3').count())>=4);await noJS.close();assert.deepEqual(errors,[]);
 console.log(`${kc}: browser PASS 390/1280; constructive practice and repair; rule/reverse/attribute branches; keyboard; >=44px; no overflow; pause/reset/dispose/remount; static teaching`);
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
