import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {MAT,VISITS,QUESTIONS,visitCount,checkProtocol,recordVisit,checkNotebook,drawVisit,collectionFeedbackKey}from './lesson.mjs';
const protocol=area=>({area,when:'before',visits:'all',record:'each'});const records=area=>VISITS.map(v=>({visitKey:v.key,area,when:'before',value:visitCount(v,area)}));
test('protocol checks the actual question: either area is valid for its matching question',()=>{for(const q of QUESTIONS){let valid=0;for(const area of ['', 'mat','desk'])for(const when of ['', 'before','after'])for(const visits of ['', 'all','one'])for(const record of ['', 'each','max']){const p={area,when,visits,record};const expected=area===q.area&&when==='before'&&visits==='all'&&record==='each';assert.equal(checkProtocol(q,p).ok,expected);valid+=Number(expected);}assert.equal(valid,1);assert.equal(checkProtocol(q,protocol(q.area)).ok,true);}});
test('complete records can arrive in any order, but zero is never inferred from a missing visit',()=>{assert.deepEqual(VISITS.map(v=>visitCount(v,'mat')),[3,0,2]);assert.deepEqual(VISITS.map(v=>visitCount(v,'desk')),[5,4,3]);for(const q of QUESTIONS){const rs=records(q.area);for(const order of [rs,[...rs].reverse(),[rs[1],rs[2],rs[0]]])assert.equal(checkNotebook(q,protocol(q.area),order).ok,true);}assert.match(checkNotebook(QUESTIONS[0],protocol('mat'),records('mat').filter(r=>r.visitKey!=='ti')).text,/Tiistai/);const noZero=records('mat');noZero[1].value=null;assert.equal(checkNotebook(QUESTIONS[0],protocol('mat'),noZero).ok,false);});
test('correction replaces a visit, while duplicates, wrong scope/time and wrong counts are detected',()=>{let rs=recordVisit([],'ma',protocol('mat'),2);rs=recordVisit(rs,'ma',protocol('mat'),3);assert.equal(rs.length,1);assert.equal(rs[0].value,3);assert.equal(checkNotebook(QUESTIONS[0],protocol('mat'),[...records('mat'),records('mat')[0]]).ok,false);for(const patch of [{area:'desk'},{when:'after'},{value:9}]){const bad=records('mat');bad[0]={...bad[0],...patch};assert.equal(checkNotebook(QUESTIONS[0],protocol('mat'),bad).ok,false);}assert.throws(()=>recordVisit([],'ti',protocol('mat'),null),RangeError);});
test('actual rendered pencil counts and full geometry respect the mat boundary',()=>{for(const v of VISITS){const svg=drawVisit(v);for(const zone of ['mat','outside']){const groups=[...svg.matchAll(new RegExp(`<g data-pencil="[^"]+" data-area="${zone}" transform="translate\\((\\d+) (\\d+)\\)">([\\s\\S]*?)</g>`,'g'))];assert.equal(groups.length,zone==='mat'?v.inside.length:v.outside.length);for(const g of groups){const x=Number(g[1]),y=Number(g[2]),coords=g[3].match(/d="M56 0 L68 6 L56 12Z"/);assert.ok(coords,'pencil extent must match checked boundary geometry');if(zone==='mat')assert.ok(x>=MAT.x&&y>=MAT.y&&x+68<=MAT.x+MAT.width&&y+12<=MAT.y+MAT.height);else assert.ok(x>MAT.x+MAT.width||y>MAT.y+MAT.height||x+68<MAT.x||y+12<MAT.y);assert.ok(x>=8&&x+68<=592&&y>=8&&y+12<=318);}}}assert.equal(fs.readFileSync(new URL('scope.svg',import.meta.url),'utf8'),drawVisit(VISITS[0]));});

test('dense observation lists are required at both read and update boundaries',()=>{
 const complete=records('mat');
 const trailing=[...complete];trailing.length=4;
 const middle=[complete[0],...new Array(1),complete[1],complete[2]];delete middle[1];
 const leading=new Array(4);complete.forEach((r,i)=>{leading[i+1]=r;});
 for(const bad of [trailing,middle,leading,[...complete,undefined],[...complete,null]]){
  assert.throws(()=>checkNotebook(QUESTIONS[0],protocol('mat'),bad),RangeError);
  assert.throws(()=>recordVisit(bad,'ma',protocol('mat'),3),RangeError);
 }
 assert.equal(checkNotebook(QUESTIONS[0],protocol('mat'),complete).ok,true);
});

test('checked collection identity changes with protocol, recorded values or pending draft, but not record order',()=>{
 const rs=records('mat'),p=protocol('mat'),key=collectionFeedbackKey('mat',p,rs,2);
 assert.equal(collectionFeedbackKey('mat',p,[...rs].reverse(),2),key);
 for(const changed of [{area:'desk'},{when:'after'},{visits:'one'},{record:'max'}])assert.notEqual(collectionFeedbackKey('mat',{...p,...changed},rs,2),key);
 for(const draft of [null,0,9])assert.notEqual(collectionFeedbackKey('mat',p,rs,draft),key);
 const edited=rs.map(r=>({...r}));edited[0].value=9;assert.notEqual(collectionFeedbackKey('mat',p,edited,2),key);
});

/* global window, document */
if(process.env.LESSON_PREVIEW_URL)test('native protocol and observation edits invalidate checked feedback without automatically restoring a pass',async()=>{
 const {chromium}=await import('playwright');const browser=await chromium.launch({headless:true});
 try{const page=await browser.newPage();await page.goto(new URL('lessons/M-DATA-09.html',process.env.LESSON_PREVIEW_URL).href);await page.waitForFunction(()=>window.controller);
  await page.evaluate(async()=>{window.controller.dispose();const area=document.querySelector('[data-systematic-practice]');const add=area.addEventListener.bind(area),remove=area.removeEventListener.bind(area);window.listenerBalance={click:0,input:0,change:0};area.addEventListener=(type,...args)=>{if(type in window.listenerBalance)window.listenerBalance[type]++;return add(type,...args);};area.removeEventListener=(type,...args)=>{if(type in window.listenerBalance)window.listenerBalance[type]--;return remove(type,...args);};const m=await import('../content/M-DATA-09/lesson.mjs');window.controller=m.mount(document.querySelector('[data-lesson-module]'));});
  const area=page.locator('[data-systematic-practice]'),feedback=area.locator('[data-feedback]');for(const [key,value]of Object.entries(protocol('mat')))await area.locator(`[data-protocol="${key}"]`).selectOption(value);
  const planCheck=async()=>area.locator('[data-action="protocol"]').click();await planCheck();assert.match(await feedback.textContent(),/^Suunnitelma vastaa/);
  await area.locator('[data-protocol="area"]').selectOption('desk');assert.match(await feedback.textContent(),/^Suunnitelmaa tai/);await planCheck();assert.match(await feedback.textContent(),/rajattua työalustaa/);
  await area.locator('[data-protocol="area"]').selectOption('mat');assert.match(await feedback.textContent(),/^Suunnitelmaa tai/);await planCheck();assert.match(await feedback.textContent(),/^Suunnitelma vastaa/);
  for(const [i,value]of ['3','0','2'].entries()){if(i)await area.locator('[data-action="next"]').click();await area.locator('[data-observed-value]').fill(value);await area.locator('[data-action="record"]').click();}await area.locator('[data-action="check"]').click();assert.match(await feedback.textContent(),/^Vihkossa on/);
  await area.locator('[data-observed-value]').fill('9');assert.match(await feedback.textContent(),/^Suunnitelmaa tai/);await area.locator('[data-observed-value]').fill('2');assert.doesNotMatch(await feedback.textContent(),/^Vihkossa on/);await area.locator('[data-action="check"]').click();assert.match(await feedback.textContent(),/^Vihkossa on/);
  for(const [key,wrong,right]of [['when','after','before'],['visits','one','all'],['record','max','each']]){await area.locator(`[data-protocol="${key}"]`).selectOption(wrong);assert.match(await feedback.textContent(),/^Suunnitelmaa tai/);await area.locator(`[data-protocol="${key}"]`).selectOption(right);assert.doesNotMatch(await feedback.textContent(),/^Vihkossa on/);await area.locator('[data-action="check"]').click();assert.match(await feedback.textContent(),/^Vihkossa on/);}
  await page.evaluate(()=>window.controller.pause());const paused=await feedback.textContent();await area.locator('[data-protocol="area"]').evaluate(el=>{el.value='desk';el.dispatchEvent(new Event('change',{bubbles:true}));});assert.equal(await feedback.textContent(),paused);await page.evaluate(()=>window.controller.resume());assert.match(await feedback.textContent(),/^Suunnitelmaa tai/);
  assert.deepEqual(await page.evaluate(()=>window.listenerBalance),{click:1,input:1,change:1});await page.evaluate(()=>{window.controller.reset();window.controller.reset();window.controller.dispose();window.controller.dispose();});assert.deepEqual(await page.evaluate(()=>window.listenerBalance),{click:0,input:0,change:0});
 }finally{await browser.close();}
});
