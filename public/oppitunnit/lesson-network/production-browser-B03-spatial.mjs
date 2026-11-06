/* global document, window, localStorage, innerWidth */
// Author-owned QA for these two packages only; main runs after integration.
// No build, package mutation, screenshot/receipt writes, or independent approval.
import {chromium} from '@playwright/test';
import crypto from 'node:crypto';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('./',import.meta.url),base='http://127.0.0.1:4191/site/',ids=['M-FRAC-02','M-GEO-04'],results=[],errors=[];
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function binding(id){
 const dir=new URL('packages/'+id+'/',root),p=JSON.parse(fs.readFileSync(new URL('lesson.json',dir)));
 for(const a of p.assets)assert.equal(sha(fs.readFileSync(new URL(a.path,a.path.startsWith('shared/')?root:dir))),a.sha256);
 return {revision:p.revision+'@'+sha(JSON.stringify({...p,reviews:undefined})+fs.readFileSync(new URL(p.body,dir),'utf8')+fs.readFileSync(new URL(p.module,dir),'utf8')+p.assets.map(a=>a.sha256).join('')),assets:p.assets};
}
const bindings={packages:Object.fromEntries(ids.map(id=>[id,binding(id)]))};
const browser=await chromium.launch({headless:true});
const text=async(s,q,re)=>assert.match(await s.locator(q).textContent(),re);
const click=async(s,q)=>s.locator(q).click();
try{
 for(const width of[320,390,1280])for(const id of ids){
  const page=await browser.newPage({viewport:{width,height:900}});page.on('pageerror',e=>errors.push({id,width,error:e.message}));
  try{
   await page.goto(base+'lessons/'+id+'.html');await page.locator('[data-module-ready="true"]').waitFor();
   assert.equal(await page.locator('article').getAttribute('data-content-revision'),bindings.packages[id].revision);
   const storageBefore=await page.evaluate(()=>Object.entries(localStorage));
   const scope=page.locator(id==='M-FRAC-02'?'[data-fraction-lesson]':'[data-shape-lesson]');
   if(id==='M-FRAC-02'){
    for(let i=0;i<3;i++)await click(scope,'[data-fraction-demo-step]');assert(await scope.locator('[data-fraction-demo-step]').isDisabled());
    await text(scope,'[data-fraction-demo-notation]',/3\/5/);
    await click(scope,'[data-build-check]');await text(scope,'[data-build-feedback]',/Valitsit 0 osaa/);
    for(const i of[4,0])await click(scope,`[data-build-part="${i}"]`);await click(scope,'[data-build-check]');assert.equal(await scope.locator('[data-build-feedback]').getAttribute('data-code'),'few');
    await click(scope,'[data-build-part="2"]');await click(scope,'[data-build-check]');assert.equal(await scope.locator('[data-build-feedback]').getAttribute('data-result'),'correct');
    await click(scope,'[data-build-part="1"]');await click(scope,'[data-build-check]');assert.equal(await scope.locator('[data-build-feedback]').getAttribute('data-code'),'many');
    await click(scope,'[data-build-next]');assert.equal(await scope.locator('[data-build-part][aria-pressed="true"]').count(),0);
    await click(scope,'[data-build-part="3"]');await click(scope,'[data-build-check]');assert.equal(await scope.locator('[data-build-feedback]').getAttribute('data-result'),'correct');
    await click(scope,'[data-build-next]');for(const i of[1,4])await click(scope,`[data-build-part="${i}"]`);await click(scope,'[data-build-check]');assert.equal(await scope.locator('[data-build-feedback]').getAttribute('data-result'),'correct');
    await click(scope,'[data-read-check]');assert.equal(await scope.locator('[data-read-feedback]').getAttribute('data-code'),'missing');
    const answer=async(a,b)=>{await scope.locator('[data-read-top]').fill(a);await scope.locator('[data-read-bottom]').fill(b);await click(scope,'[data-read-check]');};
    await answer('5','3');assert.equal(await scope.locator('[data-read-feedback]').getAttribute('data-code'),'swapped');
    await answer('3','2');assert.equal(await scope.locator('[data-read-feedback]').getAttribute('data-code'),'whole');
    await answer('3','0');assert.equal(await scope.locator('[data-read-feedback]').getAttribute('data-code'),'invalid');
    await answer('2','5');assert.equal(await scope.locator('[data-read-feedback]').getAttribute('data-code'),'selected');
    await answer('3','5');assert.equal(await scope.locator('[data-read-feedback]').getAttribute('data-code'),'exact');
    await click(scope,'[data-read-next]');await answer('1','4');assert.equal(await scope.locator('[data-read-feedback]').getAttribute('data-code'),'exact');
    await click(scope,'[data-read-next]');await answer('1','3');assert.equal(await scope.locator('[data-read-feedback]').getAttribute('data-code'),'equivalent');await text(scope,'[data-read-feedback]',/ei tarvitse vaihtaa/);
   }else{
    await scope.locator('[data-shape-model]').selectOption('square');for(let i=0;i<4;i++)await click(scope,'[data-shape-step]');assert(await scope.locator('[data-shape-step]').isDisabled());
    await click(scope,'[data-shape-turn]');assert.equal(await scope.locator('[data-shape-demo] g').getAttribute('transform'),'rotate(15)');
    await scope.locator('[data-shape-model]').selectOption('circle');for(let i=0;i<4;i++)await click(scope,'[data-shape-step]');await text(scope,'[data-shape-demo-caption]',/kaari jatkuu ilman terävää/);assert.equal(await scope.locator('[data-shape-demo] circle[r="6"]').count(),0);
    await click(scope,'[data-shape-card="open"]');await click(scope,'[data-shape-check]');await text(scope,'[data-shape-feedback]',/aukko/);await click(scope,'[data-shape-clear]');
    await click(scope,'[data-shape-card="curved"]');await click(scope,'[data-shape-check]');await text(scope,'[data-shape-feedback]',/kaartuu/);await click(scope,'[data-shape-clear]');
    for(const key of['triangle','thin'])await click(scope,`[data-shape-card="${key}"]`);await click(scope,'[data-shape-check]');assert.equal(await scope.locator('[data-shape-feedback]').getAttribute('data-result'),'correct');
    await click(scope,'[data-shape-transfer]');assert.equal(await scope.locator('[aria-pressed="true"]').count(),2);await click(scope,'[data-shape-check]');assert.equal(await scope.locator('[data-shape-feedback]').getAttribute('data-result'),'correct');
    await click(scope,'[data-shape-rule-next]');await click(scope,'[data-shape-card="rectangle"]');await click(scope,'[data-shape-check]');await text(scope,'[data-shape-feedback]',/Myös neliössä/);
    await click(scope,'[data-shape-card="square"]');await click(scope,'[data-shape-check]');assert.equal(await scope.locator('[data-shape-feedback]').getAttribute('data-result'),'correct');
    await click(scope,'[data-shape-rule-next]');await click(scope,'[data-shape-card="rhombus"]');await click(scope,'[data-shape-check]');await text(scope,'[data-shape-feedback]',/kulmat eivät/);await click(scope,'[data-shape-clear]');
    await click(scope,'[data-shape-card="square"]');await click(scope,'[data-shape-check]');assert.equal(await scope.locator('[data-shape-feedback]').getAttribute('data-result'),'correct');
    await click(scope,'[data-shape-rule-next]');await click(scope,'[data-shape-card="circle"]');await click(scope,'[data-shape-check]');assert.equal(await scope.locator('[data-shape-feedback]').getAttribute('data-result'),'correct');
   }
   const details=page.locator('.module-tools');await details.locator('summary').click();const action=n=>page.locator(`[data-module-action="${n}"]`);
   const control=scope.locator(id==='M-FRAC-02'?'[data-build-next]':'[data-shape-rule-next]');
   const disabledBefore=await scope.locator('button,input,select').evaluateAll(es=>es.map(e=>e.disabled));await action('pause').click();assert(await scope.locator('button,input,select').evaluateAll(es=>es.every(e=>e.disabled)));
   const paused=await scope.innerHTML();await control.dispatchEvent('click');assert.equal(await scope.innerHTML(),paused);
   await action('resume').click();assert.deepEqual(await scope.locator('button,input,select').evaluateAll(es=>es.map(e=>e.disabled)),disabledBefore);
   await action('pause').click();await action('reset').click();assert(await scope.locator('button,input,select').evaluateAll(es=>es.every(e=>e.disabled)));const reset=await scope.innerHTML();await control.dispatchEvent('click');assert.equal(await scope.innerHTML(),reset);await action('reset').click();assert.equal(await scope.innerHTML(),reset);await action('resume').click();
   await page.evaluate(async()=>{for(const im of document.querySelectorAll('#lesson-body img'))await im.decode();});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');assert.deepEqual(await page.evaluate(()=>Object.entries(localStorage)),storageBefore,'practice does not change browser storage');
   for(const asset of bindings.packages[id].assets){
    const response=await page.request.get(base+(asset.path.startsWith('shared/')?asset.path:'content/'+id+'/'+asset.path));
    assert(response.ok());assert.equal(sha(await response.body()),asset.sha256,'served asset matches current source');
   }
   await page.evaluate(async(id)=>{
    window.dispatchEvent(new Event('pagehide'));const m=await import('../content/'+id+'/lesson.mjs');const host=document.querySelector('[data-lesson-module]');const s=document.querySelector(id==='M-FRAC-02'?'[data-fraction-lesson]':'[data-shape-lesson]');
    const old=m.mount(host);const active=m.mount(host);const initial=s.innerHTML;old.reset();assertNever();
    function assertNever(){if(s.innerHTML!==initial)throw Error('disposed old instance mutated current mount');}
    active.pause();if(![...s.querySelectorAll('button,input,select')].every(b=>b.disabled))throw Error('direct pause failed');active.reset();if(![...s.querySelectorAll('button,input,select')].every(b=>b.disabled))throw Error('direct paused reset failed');active.resume();
    const control=s.querySelector(id==='M-FRAC-02'?'[data-build-part="0"]':'[data-shape-card="triangle"]');const before=s.innerHTML;control.click();if(s.innerHTML===before)throw Error('active mount lost');active.dispose();const after=s.innerHTML;control.click();if(s.innerHTML!==after)throw Error('disposed listener remains');
   },id);
   results.push({id,width,revision:bindings.packages[id].revision,status:'PASS',practice:true,lifecycle:true,images:true,servedAssetHashes:true,overflow:false,storageUnchanged:true});
  }catch(e){results.push({id,width,status:'FAIL',error:e.message});}
  await page.close();
 }
}finally{await browser.close();}
const report={kind:'author_owned_integrated_interaction_QA_not_independent_review',status:results.every(r=>r.status==='PASS')&&!errors.length?'PASS':'FAIL',results,errors,limits:['Main executes after integration; no build or source mutation. Passing this author-owned QA is not independent pedagogical acceptance.','No human or learner validation, mastery, retention or efficacy claim.']};
for(const id of ids)assert.equal(binding(id).revision,bindings.packages[id].revision,'source stable through QA');report.testFileSha256=sha(fs.readFileSync(new URL(import.meta.url)));report.base=base;console.log(JSON.stringify(report,null,2));if(report.status==='FAIL')process.exitCode=1;
