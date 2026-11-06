/* global document */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require = createRequire(new URL('../../../package.json', import.meta.url));
const {chromium} = require('@playwright/test');
const ID='M79-VAR-01';
const ownDir = path.dirname(fileURLToPath(import.meta.url));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export function sourceRevision() {
 const p=JSON.parse(fs.readFileSync(path.join(ownDir,'lesson.json')));
 return String(p.revision)+'@'+hash(JSON.stringify({...p,reviews:undefined})+fs.readFileSync(path.join(ownDir,p.body),'utf8')+fs.readFileSync(path.join(ownDir,p.module),'utf8')+p.assets.map(a=>a.sha256).join(''));
}
export async function eventCommitRegression(page) {
 const scope=page.locator('[data-variable-integration]');
 const plan=scope.locator('[data-plan-feedback]'),order=scope.locator('[data-order-feedback]'),all=scope.locator('[data-all-feedback]');
 const state=out=>out.getAttribute('data-verdict');
 const check=()=>scope.locator('[data-check-integration]').click();
 const commit=(selector,value,type)=>scope.locator(selector).evaluate((el,{value,type})=>{el.value=value;el.dispatchEvent(new Event(type,{bubbles:true}));},{value:String(value),type});
 const fields=[['[data-plan-n="0"]',2,3],['[data-plan-total="0"]',6,7],['[data-plan-n="1"]',5,6],['[data-plan-total="1"]',15,14],['[data-order-n]',4,5]];
 const seed=async type=>{await commit('[data-target]',12,type);for(const[selector,good]of fields)await commit(selector,good,type);await check();assert.equal(await state(all),'correct');};
 for(const type of ['input','change']) {
  await seed(type);
  for(const[selector,good,bad]of fields) {
   const dependent=selector==='[data-order-n]'?order:plan,unaffected=selector==='[data-order-n]'?plan:order;
   await commit(selector,bad,type);assert.equal(await state(dependent),'neutral');assert.equal(await state(all),'neutral');assert.equal(await state(unaffected),'correct');
   await check();assert.equal(await state(dependent),'retry');assert.equal(await state(all),'retry');await commit(selector,good,type);assert.equal(await state(dependent),'neutral');await check();assert.equal(await state(all),'correct');
   await commit(selector,'',type);assert.equal(await state(dependent),'neutral');assert.equal(await state(unaffected),'correct');await check();assert.equal(await state(dependent),'retry');await commit(selector,good,type);await check();assert.equal(await state(all),'correct');
  }
  await commit('[data-target]',15,type);assert.equal(await state(order),'neutral');assert.equal(await state(all),'neutral');assert.equal(await state(plan),'correct');assert.equal(await scope.locator('[data-target-text]').textContent(),'15');
  await check();assert.equal(await state(order),'retry');await commit('[data-order-n]',5,type);await check();assert.equal(await state(all),'correct');
  await commit('[data-explore-n]',6,type);assert.match(await scope.locator('[data-explore-text]').textContent(),/18/);assert.equal(await state(plan),'correct');assert.equal(await state(order),'correct');assert.equal(await state(all),'correct');
 }
 await seed('input');
 return {events:['input','change'],numericAnswerFields:5,targetCommit:'PASS',dependentFeedbackOnly:'PASS',independentModel:'PASS'};
}
export async function exercise(page, width, dir) {
 const eventCommits=await eventCommitRegression(page);
 const selector='[data-variable-integration]';const root=page.locator(selector);
 const plan=root.locator('[data-plan-feedback]'), order=root.locator('[data-order-feedback]'), all=root.locator('[data-all-feedback]');
 const v=out=>out.getAttribute('data-verdict');
 const input=async (selector,value)=>root.locator(selector).fill(String(value));
 const check=()=>root.locator('[data-check-integration]').click();
 await input('[data-plan-n="0"]',2);await input('[data-plan-total="0"]',6);await input('[data-plan-n="1"]',5);await input('[data-plan-total="1"]',15);await input('[data-order-n]',4);await check();assert.equal(await v(all),'correct');
 await root.locator('details').first().evaluate(el=>{el.open=true;});
 await root.locator('[data-explore-n]').fill('6');assert.equal(await v(all),'correct');assert.match(await root.locator('[data-explore-text]').textContent(),/18/);
 await input('[data-plan-n="0"]',3);assert.equal(await v(plan),'neutral');assert.equal(await v(all),'neutral');assert.equal(await v(order),'correct');await check();assert.equal(await v(plan),'retry');assert.equal(await v(order),'correct');
 await input('[data-plan-total="0"]',9);assert.equal(await v(plan),'neutral');await check();assert.equal(await v(all),'correct');
 await input('[data-order-n]','');assert.equal(await v(order),'neutral');assert.equal(await v(plan),'correct');await check();assert.equal(await v(order),'retry');await input('[data-order-n]',4);await check();assert.equal(await v(all),'correct');
 await root.locator('[data-target]').selectOption('15');assert.equal(await v(order),'neutral');assert.equal(await v(plan),'correct');await check();assert.equal(await v(all),'retry');await input('[data-order-n]',5);await check();assert.equal(await v(all),'correct');
 await input('[data-plan-n="1"]',3);await input('[data-plan-total="1"]',9);await check();assert.equal(await v(plan),'retry');assert.match(await plan.textContent(),/sama n/);
 await input('[data-plan-n="1"]',6);await input('[data-plan-total="1"]',18);await check();assert.equal(await v(all),'correct');

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
