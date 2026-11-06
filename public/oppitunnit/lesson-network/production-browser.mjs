/* global document, innerWidth */
import {chromium} from '@playwright/test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {loadPackages,digest} from './content.mjs';
const root=new URL('./',import.meta.url),graph=JSON.parse(fs.readFileSync(new URL('reference/inputs/canonical-690-graph.json',root))),allPackages=loadPackages(root.pathname,graph.nodes.map(n=>n.id));
// An explicit selection must never silently become a whole-suite run or an empty PASS.
const requested=process.env.SAMMAKKO_KC_IDS;
const selectedIds=requested===undefined?[...allPackages.keys()]:requested.split(',').map(id=>id.trim());
if(selectedIds.length===0||selectedIds.some(id=>!id||!/^[A-Z0-9-]+$/.test(id)||!allPackages.has(id)))throw Error('SAMMAKKO_KC_IDS must name existing authored KCs with no empty/unknown entries');
if(new Set(selectedIds).size!==selectedIds.length)throw Error('Duplicate KC in SAMMAKKO_KC_IDS');
const wanted=new Set(selectedIds),packages=new Map([...allPackages].filter(([id])=>wanted.has(id)));
const scope={kind:requested===undefined?'all_authored':'selected_kcs',selectedKcIds:[...packages.keys()],availableAuthoredLessons:allPackages.size};
const base=process.env.LESSON_TEST_URL??'http://127.0.0.1:4191/site/';
const batch=process.env.SAMMAKKO_BATCH??'B01';if(!/^B[0-9]+$/.test(batch))throw Error('Invalid batch');
const receipts=JSON.parse(fs.readFileSync(new URL('evidence/production/technical-receipts.json',root)));
const capture=id=>!receipts.some(r=>r.kcId===id&&r.contentRevision===packages.get(id).metadata.contentRevision)||packages.get(id).metadata.extensions.productionBatch===batch||receipts.findLast(r=>r.kcId===id)?.batch===batch;
const evidence=new URL('evidence/production/'+batch+'/browser/',root);fs.mkdirSync(evidence,{recursive:true});
const browser=await chromium.launch({headless:true}),errors=[],results=[];
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 for(const [id,pkg]of packages){
  for(const width of [390,1280]){
   await page.setViewportSize({width,height:900});await page.goto(base+'lessons/'+id+'.html?mode=presentation');
   assert.equal(await page.locator('main').getAttribute('data-kc'),id);assert.equal(await page.locator('article[data-content-revision]').getAttribute('data-content-revision'),pkg.metadata.contentRevision);
   assert((await page.locator('#lesson-body').textContent()).includes('Oppituntiluonnos'));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),id+' horizontal overflow');
   for(const img of await page.locator('#lesson-body img').all())assert(await img.evaluate(e=>e.complete&&e.naturalWidth>0),id+' loaded image');
   if(pkg.module){await page.waitForFunction(()=>!document.querySelector('[data-module-status]').textContent.includes('odottaa'));assert(!(await page.locator('[data-module-status]').textContent()).includes('Moduulivirhe'),id+' module loaded');}
   if(capture(id))await page.screenshot({path:new URL(id+'-'+width+'.png',evidence).pathname,fullPage:true});
   results.push({kcId:id,width,revision:pkg.metadata.contentRevision,staticIdentity:true,images:true,noOverflow:true,module:pkg.module?'mounted':'not_needed'});
  }
 }
 // Specific deterministic temporal renderer checks (not a generic teaching-quality proxy).
 if(packages.has('PHY79-SPEED-CONCEPT')){
  await page.goto(base+'lessons/PHY79-SPEED-CONCEPT.html');await page.locator('[data-speed-action=step]').waitFor();await page.locator('[data-speed-action=step]').click();assert((await page.locator('[data-speed-readout]').textContent()).includes('Kellon aika 1 s. A: 2 m / 1 s; B: 3 m / 1 s.'));
  await page.locator('[data-speed-scenario]').selectOption('pause');for(let i=0;i<3;i++)await page.locator('[data-speed-action=step]').click();assert((await page.locator('[data-speed-readout]').textContent()).includes('A: 12 m / 3 s; B: 6 m / 3 s.'));
  for(let i=0;i<3;i++)await page.locator('[data-speed-action=step]').click();await page.locator('[data-speed-answer="0"]').click();assert((await page.locator('[data-speed-feedback]').textContent()).startsWith('Oikein.'));assert((await page.locator('[data-speed-feedback]').textContent()).includes('2 m/s'));
  await page.locator('[data-speed-scenario]').selectOption('different');await page.locator('[data-speed-answer="1"]').click();assert((await page.locator('[data-speed-feedback]').textContent()).startsWith('Oikein.'));
  await page.locator('.module-tools>summary').click();await page.locator('[data-module-action=reset]').click();assert((await page.locator('[data-speed-readout]').textContent()).includes('Kellon aika 0 s.'));
 }
 if(packages.has('M-NUM-1TO1')){
  await page.goto(base+'lessons/M-NUM-1TO1.html');await page.locator('[data-counting][data-module-ready=true]').waitFor();
  for(const i of [2,0,3,1]){const b=page.locator(`[data-action=tag][data-object="${i}"]`);await b.click();assert(await b.isDisabled());}
  assert.equal(await page.locator('[data-feedback=tags]').getAttribute('data-result'),'correct');assert.equal(await page.locator('[data-count-label]').count(),4);if(capture('M-NUM-1TO1'))await page.screenshot({path:new URL('M-NUM-1TO1-counted.png',evidence).pathname,fullPage:true});
  await page.locator('[data-action=clear-tags]').click();assert.equal(await page.locator('[data-action=tag]:disabled').count(),0);
 }
 if(packages.has('M-NUM-STABLE-ORDER')){
  await page.goto(base+'lessons/M-NUM-STABLE-ORDER.html');await page.locator('[data-module-ready=true]').waitFor();for(const word of ['yksi','kaksi','kolme','neljä','viisi'])await page.locator(`[data-word="${word}"]`).click();await page.locator('[data-action=check-sequence]').click();assert.equal(await page.locator('[data-feedback=sequence]').getAttribute('data-result'),'correct');
 }
 if(packages.has('M-NUM-01')){
  await page.goto(base+'lessons/M-NUM-01.html');await page.locator('[data-module-ready=true]').waitFor();await page.locator('[data-question=total][data-answer="8"]').click();assert.equal(await page.locator('[data-feedback=total]').getAttribute('data-result'),'correct');assert.equal(await page.locator('[data-action=visit][aria-pressed=true]').count(),0);
 }
 if(packages.has('M-NUM-02')){
  await page.goto(base+'lessons/M-NUM-02.html');await page.locator('[data-module-ready=true]').waitFor();await page.locator('[data-question=covered][data-answer="5"]').click();assert.equal(await page.locator('[data-feedback=covered]').getAttribute('data-result'),'correct');for(const i of [4,0,2])await page.locator(`[data-action=give][data-object="${i}"]`).click();await page.locator('[data-action=check-give]').click();assert.equal(await page.locator('[data-feedback=give]').getAttribute('data-result'),'correct');
 }
 if(packages.has('M-MEAS-00')){
  await page.goto(base+'lessons/M-MEAS-00.html');await page.locator('[data-measure-interactive]').waitFor();await page.locator('[data-action=align]').click();assert.equal(await page.locator('[data-ribbon=A]').getAttribute('x'),await page.locator('[data-ribbon=B]').getAttribute('x'));await page.locator('[data-answer=B]').click();assert((await page.locator('[data-measure-feedback]').textContent()).startsWith('Kyllä. B'));
 }
 if(packages.has('SCI-ENV-OBSERVE-01')){
  await page.goto(base+'lessons/SCI-ENV-OBSERVE-01.html');await page.locator('[data-observe-interactive]').waitFor();await page.locator('[data-category=visible]').click();assert((await page.locator('[data-observe-feedback]').textContent()).includes('näkyy'));await page.locator('[data-action=next]').click();await page.locator('[data-category=unknown]').click();assert((await page.locator('[data-observe-feedback]').textContent()).startsWith('Kyllä. Reikä näkyy, mutta tekijää ei näy.'));
 }
 for(const [id,selector]of [['M-TH-03','[data-order-case]'],['M-ALG-04','[data-unknown-case]']])if(packages.has(id)){
  await page.goto(base+'lessons/'+id+'.html');await page.locator(selector).waitFor();await page.locator('.module-tools>summary').click();
  await page.locator('[data-module-action=pause]').click();assert(await page.locator(selector).isDisabled());
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});assert(await page.locator(selector).isDisabled(),'manual pause persists');
  await page.locator('[data-module-action=reset]').click();assert(await page.locator(selector).isDisabled(),'reset stays paused');
  await page.locator('[data-module-action=resume]').click();assert(await page.locator(selector).isEnabled());
  if(id==='M-TH-03'){
   for(const i of [1,2,0])await page.locator(`[data-order-item="${i}"]`).click();await page.getByRole('button',{name:'Tarkista jono',exact:true}).click();assert.equal(await page.locator('[data-order-feedback]').getAttribute('data-result'),'correct');
   await page.locator('[data-order-case]').selectOption('1');for(const i of [1,2,0,3])await page.locator(`[data-order-item="${i}"]`).click();await page.getByRole('button',{name:'Tarkista jono',exact:true}).click();assert.equal(await page.locator('[data-order-feedback]').getAttribute('data-result'),'correct');
  }else{
   await page.locator(selector).selectOption('card');await page.getByRole('button',{name:'Paljasta',exact:true}).click();assert((await page.locator('[data-unknown-lab]').textContent()).includes('kaksitoista'));await page.locator('[data-unknown-answer=zero]').click();assert((await page.locator('[data-unknown-feedback]').textContent()).includes('ei tiedetä'));await page.locator('[data-unknown-answer=amount]').click();assert((await page.locator('[data-unknown-feedback]').textContent()).startsWith('Kyllä.'));
  }
  if(capture(id))await page.screenshot({path:new URL(id+'-practice.png',evidence).pathname,fullPage:true});
 }
 if(packages.has('M79-DEP-01')){
  await page.goto(base+'lessons/M79-DEP-01.html');await page.locator('[data-depend-mode]').waitFor();const readout=page.locator('[data-depend-readout]');
  await page.locator('[data-depend-action=step]').click();assert((await readout.textContent()).includes('1 min. Vesimäärä 2 l.'));await page.locator('[data-depend-answer=less]').click();assert.equal(await page.locator('[data-depend-feedback]').getAttribute('data-result'),'retry');await page.locator('[data-depend-answer=more]').click();assert.equal(await page.locator('[data-depend-feedback]').getAttribute('data-result'),'correct');
  await page.locator('[data-depend-mode]').selectOption('drain');await page.locator('[data-depend-action=step]').click();assert((await readout.textContent()).includes('1 min. Vesimäärä 6 l.'));await page.locator('[data-depend-answer=less]').click();assert.equal(await page.locator('[data-depend-feedback]').getAttribute('data-result'),'correct');await page.locator('[data-depend-target]').selectOption('container');await page.locator('[data-depend-answer=same]').click();assert.equal(await page.locator('[data-depend-feedback]').getAttribute('data-result'),'correct');
  await page.locator('[data-depend-action=play]').click();await page.waitForTimeout(250);await page.locator('[data-depend-action=stop]').click();const frozen=await readout.textContent();await page.waitForTimeout(180);assert.equal(await readout.textContent(),frozen);assert.notEqual(frozen,'Mallin aika 1 min. Vesimäärä 6 l. Kanisterin oma korkeus 20 cm.');
  await page.locator('.module-tools>summary').click();await page.locator('[data-module-action=pause]').click();assert(await page.locator('[data-depend-mode]').isDisabled());await page.locator('[data-module-action=reset]').click();assert((await readout.textContent()).includes('0 min. Vesimäärä 8 l.'));await page.locator('[data-module-action=resume]').click();assert(await page.locator('[data-depend-mode]').isEnabled());if(capture('M79-DEP-01'))await page.screenshot({path:new URL('M79-DEP-01-practice.png',evidence).pathname,fullPage:true});
 }
 assert.deepEqual(errors,[]);
 const bindings=Object.fromEntries(['build.mjs','content.mjs','verify.mjs','assets/shell.css','assets/lesson-loader.js','production-browser.mjs'].map(p=>[p,digest(fs.readFileSync(new URL(p,root)))]));
 fs.writeFileSync(new URL('results.json',evidence),JSON.stringify({status:'PASS',scope,results,errors,bindings,limits:['Screenshots and controls are technical evidence; no learner validation or efficacy claim.']},null,2)+'\n');console.log(JSON.stringify({status:'PASS',scope,lessons:packages.size,viewports:results.length}));
}finally{await browser.close();}
