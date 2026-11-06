/* global document */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require = createRequire(new URL('../../../package.json', import.meta.url));
const {chromium} = require('@playwright/test');
const ID='M79-FUNC-TABLE';
const ownDir = path.dirname(fileURLToPath(import.meta.url));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export function sourceRevision() {
 const p=JSON.parse(fs.readFileSync(path.join(ownDir,'lesson.json')));
 return String(p.revision)+'@'+hash(JSON.stringify({...p,reviews:undefined})+fs.readFileSync(path.join(ownDir,p.body),'utf8')+fs.readFileSync(path.join(ownDir,p.module),'utf8')+p.assets.map(a=>a.sha256).join(''));
}
export async function eventCommitRegression(page) {
 const scope=page.locator('[data-func-table]'),feedback=scope.locator('[data-feedback]');
 const state=()=>feedback.getAttribute('data-verdict');
 const check=()=>scope.locator('[data-check]').click();
 const commit=(selector,value,type)=>scope.locator(selector).evaluate((el,{value,type})=>{el.value=value;el.dispatchEvent(new Event(type,{bubbles:true}));},{value:String(value),type});
 const fill=async(values,type)=>{for(const[x,y]of Object.entries(values))await commit(`[data-answer-x="${x}"]`,y,type);};
 for(const type of ['input','change']) {
  await commit('[data-rule]','fixed',type);await fill({0:4,2:4,5:4},type);await check();assert.equal(await state(),'correct');
  // Exact main reproduction: edit the first visible fixed-4 output to9.
  await scope.locator('[data-answer-x]').first().evaluate((el,type)=>{el.value='9';el.dispatchEvent(new Event(type,{bubbles:true}));},type);
  assert.equal(await state(),'neutral');await check();assert.equal(await state(),'retry');assert.match(await feedback.textContent(),/y = 9/);
  await fill({0:4,2:4,5:4},type);assert.equal(await state(),'neutral');await check();assert.equal(await state(),'correct');
  await commit('[data-rule]','seats',type);assert.equal(await state(),'neutral');assert.equal(await scope.locator('[data-answer-x="0"]').inputValue(),'');assert.equal(await scope.locator('[data-rule-text]').textContent(),'y = 2x + 1');
  const good={0:1,2:5,5:11};await fill(good,type);await check();assert.equal(await state(),'correct');
  for(const x of [0,2,5]) {
   await commit(`[data-answer-x="${x}"]`,9,type);assert.equal(await state(),'neutral');await check();assert.equal(await state(),'retry');
   await commit(`[data-answer-x="${x}"]`,good[x],type);assert.equal(await state(),'neutral');await check();assert.equal(await state(),'correct');
   await commit(`[data-answer-x="${x}"]`,'',type);assert.equal(await state(),'neutral');await check();assert.equal(await state(),'retry');await commit(`[data-answer-x="${x}"]`,good[x],type);await check();assert.equal(await state(),'correct');
  }
  await scope.locator('[data-reorder]').click();assert.equal(await state(),'correct');
  for(const[x,y]of Object.entries(good))assert.equal(await scope.locator(`[data-answer-x="${x}"]`).inputValue(),String(y));
  await commit('[data-rule]','stock',type);assert.equal(await state(),'neutral');assert.equal(await scope.locator('[data-rule-text]').textContent(),'y = 8 − x');await fill({0:8,2:6,5:3},type);await check();assert.equal(await state(),'correct');
 }
 // Explicit checking is a DOM read even if no edit event has arrived. This does
 // not assert immediate invalidation for silent programmatic/no-event writes.
 await scope.locator('[data-rule]').selectOption('seats');await fill({0:1,2:5,5:11},'input');await check();
 await scope.locator('[data-answer-x="2"]').evaluate(el=>{el.value='9';});await check();assert.equal(await state(),'retry');assert.match(await feedback.textContent(),/x = 2/);
 await scope.locator('[data-answer-x="2"]').evaluate(el=>{el.value='5';});await check();assert.equal(await state(),'correct');
 await scope.locator('[data-rule]').evaluate(el=>{el.value='fixed';});await check();assert.equal(await state(),'retry');assert.equal(await scope.locator('[data-rule-text]').textContent(),'y = 4');
 for(const input of await scope.locator('[data-answer-x]').all())await input.evaluate(el=>{el.value='4';});await check();assert.equal(await state(),'correct');
 await scope.locator('[data-reorder]').click();assert.equal(await state(),'correct');await check();assert.equal(await state(),'correct');
 await scope.locator('[data-rule]').selectOption('seats');
 return {events:['input','change'],answerFields:3,ruleCommit:'PASS',mainFixed4To9Reproduction:'PASS',explicitVisibleRowsAndRule:'PASS',pairAssociationReorder:'PASS'};
}
export async function exercise(page, width, dir) {
 const eventCommits=await eventCommitRegression(page);
 const selector='[data-func-table]'; const root=page.locator(selector);
 const feedback=root.locator('[data-feedback]');
 const fill=async values=>{for(const [x,y] of Object.entries(values))await root.locator(`[data-answer-x="${x}"]`).fill(String(y));};
 const check=()=>root.locator('[data-check]').click();
 const verdict=()=>feedback.getAttribute('data-verdict');
 await fill({0:1,2:5,5:11});await check();assert.equal(await verdict(),'correct');
 await root.locator('[data-answer-x="2"]').fill('4');assert.equal(await verdict(),'neutral');await check();assert.equal(await verdict(),'retry');assert.match(await feedback.textContent(),/x = 2/);
 await root.locator('[data-answer-x="2"]').fill('5');assert.equal(await verdict(),'neutral');await check();assert.equal(await verdict(),'correct');
 await root.locator('[data-reorder]').click();assert.equal(await verdict(),'correct');assert.equal(await root.locator('[data-answer-x="2"]').inputValue(),'5');
 await root.locator('details summary').click();assert.equal(await verdict(),'correct');
 await root.locator('[data-clear]').click();assert.equal(await verdict(),'neutral');await check();assert.equal(await verdict(),'retry');
 for(const [rule,values] of [['stock',{0:8,2:6,5:3}],['fixed',{0:4,2:4,5:4}]]){await root.locator('[data-rule]').selectOption(rule);assert.equal(await verdict(),'neutral');assert.equal(await root.locator('[data-answer-x="0"]').inputValue(),'');await fill(values);await check();assert.equal(await verdict(),'correct');}

 const sizeProblems = await root.locator('button,input,select').evaluateAll(nodes=>nodes.filter(n=>n.getClientRects().length).map(n=>({tag:n.tagName,width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height})).filter(n=>n.width<44||n.height<44));
 assert.deepEqual(sizeProblems, []);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth),false);
 await root.screenshot({path:path.join(dir,`practice-${width}.png`)});
 // Actual loader controls first; then explicit repeated-mount/listener ownership.
 await page.locator('details.module-tools').evaluate(el=>{el.open=true;});
 await page.locator('[data-module-action="pause"]').click();
 assert.equal(await root.locator('input:enabled,button:enabled,select:enabled').count(),0);
 await page.locator('[data-module-action="reset"]').click();
 assert.equal(await root.locator('input:enabled,button:enabled,select:enabled').count(),0);
 await page.locator('[data-module-action="resume"]').click();
 assert.ok(await root.locator('input:enabled').count()>0);
 const lifecycle = await page.evaluate(async selector=>{
  const host=document.querySelector('[data-lesson-module]');
  const root=document.querySelector(selector);
  const mod=await import(new URL(host.dataset.lessonModule,document.baseURI).href);
  const add=root.addEventListener.bind(root), remove=root.removeEventListener.bind(root);
  const handlers=new Map();
  const count=()=>[...handlers.values()].reduce((sum,set)=>sum+set.size,0);
  root.addEventListener=(type,handler,...rest)=>{if(!handlers.has(type))handlers.set(type,new Set());handlers.get(type).add(handler);return add(type,handler,...rest);};
  root.removeEventListener=(type,handler,...rest)=>{handlers.get(type)?.delete(handler);return remove(type,handler,...rest);};
  const first=mod.mount(host);
  const second=mod.mount(host); const live=count();
  first.dispose(); const unchanged=count();
  second.pause(); second.reset(); const frozen=[...root.querySelectorAll('input,button,select')].every(n=>n.disabled);
  second.resume(); second.reset(); second.reset(); const resets=count();
  second.dispose(); second.dispose(); const remaining=count();
  root.addEventListener=add;root.removeEventListener=remove;
  return {live,unchanged,frozen,resets,remaining};
 }, selector);
 assert.deepEqual(lifecycle,{live:3,unchanged:3,frozen:true,resets:3,remaining:0});
 return {width, interaction:'PASS', eventCommits, lifecycle, overflow:false, controls44px:true};
}
async function main() {
 const base=(process.env.SAMMAKKO_TEST_URL??'http://127.0.0.1:4191/site/').replace(/\/?$/,'/');
 const dir=process.env.SAMMAKKO_QA_DIR??`/tmp/sammakko-B05-${ID}-integrated`;
 fs.mkdirSync(dir,{recursive:true});
 const browser=await chromium.launch({headless:true});const results=[];
 try {
  for(const width of [390,1280]) {
   const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(new URL(`lessons/${ID}.html`,base).href);await page.locator('article input:enabled:visible').first().waitFor({timeout:10000});
   assert.equal(await page.locator('[data-content-revision]').getAttribute('data-content-revision'),sourceRevision(),'Actual compiled content must match current source');
   const remoteModule=await (await page.request.get(new URL(`content/${ID}/lesson.mjs`,base).href)).body();assert.equal(hash(remoteModule),hash(fs.readFileSync(path.join(ownDir,'lesson.mjs'))));
   results.push(await exercise(page,width,dir));assert.deepEqual(errors,[]);await page.close();
  }
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto(new URL(`lessons/${ID}.html`,base).href);assert.ok(await page.locator('h3').count()>=5);assert.ok(await page.locator('article img').first().getAttribute('alt'));await context.close();
  fs.writeFileSync(path.join(dir,'receipt.json'),JSON.stringify({id:ID,mode:'ACTUAL_INTEGRATED_SITE',base,contentRevision:sourceRevision(),results,noJS:'PASS',humanValidation:'NOT_PERFORMED'},null,2));console.log(ID+' actual integrated-site QA PASS');
 } finally {await browser.close();}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
