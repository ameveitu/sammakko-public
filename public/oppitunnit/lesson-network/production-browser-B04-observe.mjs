/* global document, innerWidth, dispatchEvent */
// Independent B04 observe/present/record integration QA. Run AFTER main builds and serves site/.
// Reads only these three packages. No intercepted routes, builds, package/state writes or screenshots.
// stdout reports actual execution; the existence of this file is not a passing receipt.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {digest} from './content.mjs';

const root=new URL('./',import.meta.url);
const base=new URL(process.env.LESSON_TEST_URL??'http://127.0.0.1:4191/site/');
assert(base.pathname.endsWith('/'),'LESSON_TEST_URL must end at the served site directory with /');
const expected={
 'ENV-PHY-MOTION-OBS-01':'1@569b6b192b0db82577d9699d96bd690f3595db21eea5a72dc72e6398569509df',
 'SCI-ENV-PRESENT-DATA-01':'1@7c449d2970073731db961722e8ee4608e55a24179cde266f6c323ddca7a69e8a',
 'SCI-ENV-RECORD-DATA-01':'1@26455e01d30e998b97885e8d77e2f24fae18c95f6a58892c2feb52356292157f'
};
const selectors={'ENV-PHY-MOTION-OBS-01':'[data-motion-observe]','SCI-ENV-PRESENT-DATA-01':'[data-present-data]','SCI-ENV-RECORD-DATA-01':'[data-record-data]'};
const source=new Map(),results=[],pageErrors=[];
function readSource(id){
 const dir=new URL('packages/'+id+'/',root),p=JSON.parse(fs.readFileSync(new URL('lesson.json',dir)));
 const body=fs.readFileSync(new URL(p.body,dir),'utf8'),module=fs.readFileSync(new URL(p.module,dir),'utf8');
 for(const a of p.assets)assert.equal(digest(fs.readFileSync(new URL(a.path,a.path.startsWith('shared/')?root:dir))),a.sha256,id+': declared source asset');
 const revision=String(p.revision)+'@'+digest(JSON.stringify({...p,reviews:undefined})+body+module+p.assets.map(a=>a.sha256).join(''));
 assert.equal(revision,expected[id],id+': exact independently reviewed source');
 return{p,dir,body,module,revision};
}
for(const id of Object.keys(expected))source.set(id,readSource(id));
const action=(scope,key)=>scope.locator('[data-action="'+key+'"]');
const result=async(scope,state)=>assert.equal(await scope.locator('[data-feedback]').getAttribute('data-result'),state);
const check=async(scope,state)=>{await action(scope,'check').click();await result(scope,state);};
async function ready(page,id){
 assert.equal(await page.locator('main[data-kc]').getAttribute('data-kc'),id);
 assert.equal(await page.locator('#lesson-body article[data-content-revision]').getAttribute('data-content-revision'),expected[id]);
 await page.locator(selectors[id]+'[data-module-ready="true"]').waitFor();
 assert(!/odottaa|Moduulivirhe|Suljettu/.test(await page.locator('[data-module-status]').textContent()),id+': shared loader mounted');
 return page.locator('#lesson-body '+selectors[id]);
}
async function servedIdentity(page,id){
 const s=source.get(id),host=page.locator('[data-lesson-module]');
 const moduleUrl=new URL(await host.getAttribute('data-lesson-module'),page.url());
 assert.equal(moduleUrl.href,new URL('content/'+id+'/'+s.p.module,base).href,'compiled module route');
 const moduleResponse=await page.request.get(moduleUrl.href);assert(moduleResponse.ok());assert.equal(digest(await moduleResponse.body()),digest(s.module),'served module equals frozen source');
 const loaderUrl=new URL(await page.locator('script[src$="lesson-loader.js"]').getAttribute('src'),page.url());
 const loaderResponse=await page.request.get(loaderUrl.href);assert(loaderResponse.ok());assert.equal(digest(await loaderResponse.body()),digest(fs.readFileSync(new URL('assets/lesson-loader.js',root))),'actual shared loader bytes');
 for(const a of s.p.assets){const url=new URL(a.path.startsWith('shared/')?a.path:'content/'+id+'/'+a.path,base),response=await page.request.get(url.href);assert(response.ok(),id+': asset request '+a.path);assert.equal(digest(await response.body()),a.sha256,id+': served asset bytes '+a.path);}
 await page.waitForFunction(()=>[...document.querySelectorAll('#lesson-body img')].every(i=>i.complete&&i.naturalWidth>0));
}
async function motion(scope,page){
 const answer=n=>scope.locator('[data-answer="'+n+'"]'),object=n=>scope.locator('[data-object="'+n+'"]');
 const ref=await scope.locator('[data-reference="0"]').getAttribute('transform'),start=await object(0).getAttribute('transform');
 await page.waitForTimeout(100);assert.equal(await object(0).getAttribute('transform'),start,'no automatic decorative movement');
 await action(scope,'play').click();await page.waitForFunction(()=>document.querySelector('[data-motion-observe] [data-object="0"]').getAttribute('transform')!=='translate(70 62)');
 await action(scope,'stop').click();const held=await object(0).getAttribute('transform');await page.waitForTimeout(100);assert.equal(await object(0).getAttribute('transform'),held,'stop freezes actual geometry');assert.equal(await object(1).getAttribute('transform'),'translate(70 162)');assert.equal(await scope.locator('[data-reference="0"]').getAttribute('transform'),ref);
 await answer(0).selectOption('yes');await answer(1).selectOption('no');await action(scope,'check').focus();await action(scope,'check').press('Enter');await result(scope,'correct');
 await answer(0).selectOption('no');await result(scope,'neutral');await check(scope,'retry');await answer(0).selectOption('yes');await result(scope,'neutral');await check(scope,'correct');
 await answer(1).selectOption('');await result(scope,'neutral');await check(scope,'retry');await answer(1).selectOption('no');await result(scope,'neutral');await check(scope,'correct');
 const checked=await scope.locator('[data-feedback]').textContent();await action(scope,'rewind').click();assert.equal(await scope.locator('[data-feedback]').textContent(),checked,'same complete trajectory/replay preserves checked meaning');assert.equal(await object(0).getAttribute('transform'),start);
 await action(scope,'next').click();await result(scope,'neutral');assert.equal(await answer(0).inputValue(),'');
 for(let i=0;i<6;i++)await action(scope,'step').click();assert.equal(await object(0).getAttribute('transform'),'translate(195 62)','out-and-back midpoint observed');
 for(let i=0;i<6;i++)await action(scope,'step').click();assert.equal(await object(0).getAttribute('transform'),'translate(70 62)','returns to exact start');assert.equal(await object(1).getAttribute('transform'),'translate(70 162)','colour change has no displacement');assert(await action(scope,'step').isDisabled());
 await answer(0).selectOption('no');await answer(1).selectOption('no');await check(scope,'retry');assert.match(await scope.locator('[data-feedback]').textContent(),/palasi/);await answer(0).selectOption('yes');await result(scope,'neutral');await check(scope,'correct');
 for(const pair of [['no','yes'],['yes','yes'],['no','no']]){await action(scope,'next').click();await result(scope,'neutral');await answer(0).selectOption(pair[0]);await answer(1).selectOption(pair[1]);await check(scope,'correct');}
}
async function recording(scope){
 const row=n=>scope.locator('[data-row="'+n+'"]');
 await check(scope,'retry');await row(0).selectOption('lehti');await row(1).selectOption('kukka');await check(scope,'correct');
 await row(0).selectOption('kivi');await result(scope,'neutral');await check(scope,'retry');await row(0).selectOption('lehti');await result(scope,'neutral');await check(scope,'correct');
 await row(1).selectOption('');await result(scope,'neutral');await check(scope,'retry');await row(1).selectOption('kukka');await result(scope,'neutral');await check(scope,'correct');
 await action(scope,'reorder').click();await result(scope,'correct');assert.equal(await row(0).inputValue(),'kukka');assert.equal(await row(1).inputValue(),'lehti');await check(scope,'correct');
 const oldSource=await scope.locator('[data-observations] svg').getAttribute('aria-label');await action(scope,'next').click();await result(scope,'neutral');assert.notEqual(await scope.locator('[data-observations] svg').getAttribute('aria-label'),oldSource);await check(scope,'retry');
 await row(0).selectOption('kukka');await row(1).selectOption('lehti');await check(scope,'correct');
 await action(scope,'next').click();await result(scope,'neutral');for(const[i,value]of ['kivi','lehti','kukka'].entries())await row(i).selectOption(value);await check(scope,'correct');
 await action(scope,'clear').click();await result(scope,'neutral');await check(scope,'retry');
}
async function presentation(scope){
 const place=n=>scope.locator('[data-place="'+n+'"]'),count=n=>scope.locator('[data-count="'+n+'"]');
 await place(0).selectOption('penkki');await count(0).fill('3');await place(1).selectOption('kivi');await count(1).fill('1');assert.equal(await scope.locator('[data-output] [data-mark]').count(),4);await check(scope,'correct');
 await count(0).fill('2');await result(scope,'neutral');assert.equal(await scope.locator('[data-output] [data-mark]').count(),3,'output shows learner answer, not target');await check(scope,'retry');await count(0).fill('3');await result(scope,'neutral');await check(scope,'correct');
 await count(0).fill('');await result(scope,'neutral');await check(scope,'retry');await count(0).fill('3');await result(scope,'neutral');await check(scope,'correct');
 await place(0).selectOption('kivi');await result(scope,'neutral');await check(scope,'retry');assert.equal(await scope.locator('[data-feedback]').getAttribute('data-code'),'duplicate');await place(0).selectOption('penkki');await result(scope,'neutral');await check(scope,'correct');
 await scope.locator('[data-format]').selectOption('table');await result(scope,'correct');assert.equal(await scope.locator('[data-output] tbody tr').count(),2);
 await action(scope,'reorder').click();await result(scope,'correct');assert.equal(await place(0).inputValue(),'kivi');assert.equal(await count(0).inputValue(),'1');await check(scope,'correct');
 await scope.locator('[data-format]').selectOption('picture');await result(scope,'correct');assert.equal(await scope.locator('[data-output] [data-mark]').count(),4);
 await action(scope,'next').click();await result(scope,'neutral');for(const[i,value]of ['sininen','keltainen'].entries()){await place(i).selectOption(value);await count(i).fill('2');}await check(scope,'correct');assert.equal(await scope.locator('[data-mark="flower"]').count(),4,'equal counts remain valid');
 await action(scope,'next').click();await result(scope,'neutral');for(const[i,value]of ['valkoinen','keltainen','sininen'].entries()){await place(i).selectOption(value);await count(i).fill(String([0,1,3][i]));}await check(scope,'correct');
 await count(0).fill('');await result(scope,'neutral');await check(scope,'retry');await count(0).fill('0');await result(scope,'neutral');await check(scope,'correct');
 await count(0).fill('4');await result(scope,'neutral');await check(scope,'retry');assert.equal(await scope.locator('[data-feedback]').getAttribute('data-code'),'invalid');await count(0).fill('0');await result(scope,'neutral');await check(scope,'correct');
 await action(scope,'clear').click();await result(scope,'neutral');await check(scope,'retry');
}
async function lifecycle(page,scope,id){
 const tools=page.locator('[data-lesson-module] .module-tools');if(await tools.getAttribute('open')===null)await tools.locator('summary').click();
 const shell=name=>page.locator('[data-module-action="'+name+'"]'),controls=scope.locator('button,input,select');
 await shell('pause').click();assert(await controls.evaluateAll(es=>es.every(e=>e.disabled)));
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});assert(await controls.evaluateAll(es=>es.every(e=>e.disabled)),'manual pause survives visibility notification');
 await shell('reset').click();await shell('reset').click();assert(await controls.evaluateAll(es=>es.every(e=>e.disabled)),'repeated reset stays paused');
 await shell('resume').click();assert(await action(scope,'check').isEnabled());await result(scope,'neutral');
 if(id.startsWith('ENV')){assert(await action(scope,'stop').isDisabled());for(let n=0;n<3;n++)await action(scope,'step').click();assert.equal(await scope.locator('[data-object="0"]').getAttribute('transform'),'translate(85.625 62)','one step listener only');}
 else if(id.includes('RECORD')){assert.equal(await scope.locator('[data-row="0"]').inputValue(),'');await action(scope,'demo-step').click();assert.equal(await scope.locator('[data-demo-caption]').textContent(),'Merkitse lehden kuva vihkon Penkki-riville.','one demo listener only');}
 else{assert.equal(await scope.locator('[data-count="0"]').inputValue(),'');await scope.locator('[data-place="0"]').selectOption('penkki');await scope.locator('[data-place="1"]').selectOption('kivi');await action(scope,'reorder').click();assert.equal(await scope.locator('[data-place="0"]').inputValue(),'kivi','one reversal listener only');}
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});assert(await controls.evaluateAll(es=>es.every(e=>e.disabled)),'actual shared visibility handler freezes controls');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});assert(await action(scope,'check').isEnabled());
 const text=await scope.locator('[data-feedback]').textContent(),context=await scope.locator(id.startsWith('ENV')?'[data-case]':id.includes('RECORD')?'[data-task]':'[data-context]').textContent();
 await page.evaluate(()=>{dispatchEvent(new Event('pagehide'));dispatchEvent(new Event('pagehide'));});assert.equal(await page.locator('[data-module-status]').textContent(),'Suljettu');
 await action(scope,'next').click();await action(scope,'check').click();assert.equal(await scope.locator('[data-feedback]').textContent(),text,'dispose removed practice handlers');assert.equal(await scope.locator(id.startsWith('ENV')?'[data-case]':id.includes('RECORD')?'[data-task]':'[data-context]').textContent(),context);
 await page.goto('about:blank');await page.goBack({waitUntil:'load'});scope=await ready(page,id);await result(scope,'neutral');
 if(id.startsWith('ENV')){for(let i=0;i<3;i++)await action(scope,'step').click();assert.equal(await scope.locator('[data-object="0"]').getAttribute('transform'),'translate(85.625 62)');}
 else if(id.includes('RECORD')){await action(scope,'demo-step').click();assert.equal(await scope.locator('[data-demo-caption]').textContent(),'Merkitse lehden kuva vihkon Penkki-riville.');}
 else{await scope.locator('[data-place="0"]').selectOption('penkki');await scope.locator('[data-place="1"]').selectOption('kivi');await action(scope,'reorder').click();assert.equal(await scope.locator('[data-place="0"]').inputValue(),'kivi');}
}
const browser=await chromium.launch({headless:true});
try{
 for(const width of [390,1280])for(const id of Object.keys(expected)){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});page.on('pageerror',e=>pageErrors.push({id,width,error:e.message}));
  try{
   await page.goto(new URL('lessons/'+id+'.html?mode=presentation',base).href);const scope=await ready(page,id);await servedIdentity(page,id);
   if(id.startsWith('ENV'))await motion(scope,page);else if(id.includes('RECORD'))await recording(scope);else await presentation(scope);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no compiled page overflow');
   const controls=await scope.locator('button,select,input').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({height:e.getBoundingClientRect().height,label:e.tagName==='BUTTON'?e.textContent.trim():e.labels?.length>0})));
   assert(controls.length>0&&controls.every(c=>c.height>=44&&c.label),'native controls:44px and accessible names/labels');
   await lifecycle(page,scope,id);assert.equal(readSource(id).revision,expected[id],'source remains frozen');results.push({kcId:id,width,revision:expected[id],status:'PASS',servedIdentity:true,criticalInteraction:true,feedbackContract:true,sharedLoaderLifecycle:true});
  }catch(e){results.push({kcId:id,width,revision:expected[id],status:'FAIL',error:e.stack??e.message});}finally{await page.close();}
 }
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});
 try{for(const id of Object.keys(expected)){
  const page=await context.newPage();try{await page.goto(new URL('lessons/'+id+'.html',base).href);assert.equal(await page.locator('#lesson-body article[data-content-revision]').getAttribute('data-content-revision'),expected[id]);const body=page.locator('#lesson-body');assert(await body.locator('h3').count()>=3,'worked examples before practice survive without JavaScript');assert((await body.textContent()).includes('Lopuksi'));await page.getByText(id.startsWith('ENV')?'Opettajalle: tuki ja rajat':id.includes('RECORD')?'Opettajalle: menettely, tuki ja rajat':'Opettajalle: esittäminen, tuki ja rajat',{exact:true}).click();assert.match(await body.innerText(),/Offline/);results.push({kcId:id,javaScript:false,revision:expected[id],status:'PASS'});}catch(e){results.push({kcId:id,javaScript:false,status:'FAIL',error:e.message});}finally{await page.close();}
 }}finally{await context.close();}
}finally{await browser.close();}
const failed=results.some(r=>r.status==='FAIL')||pageErrors.length>0;
console.log(JSON.stringify({status:failed?'FAIL':'PASS',base:base.href,testFileSha256:digest(fs.readFileSync(new URL(import.meta.url))),expectedRevisions:expected,results,pageErrors,limits:['Run after main stable43 build; no intercepts or live build performed by this test.','Synthetic technical QA; no human/learner/efficacy/retention or actual physical observation/recording/communication certification.','Row/view/replay transformations preserve the meaning of the bounded task; model observations are explicitly fictional.','Navigation back confirms a fresh usable module; not a claim that every browser used BFCache.','No package, shared state, generated file or receipt mutation; stdout only.']},null,2));
if(failed)process.exitCode=1;
