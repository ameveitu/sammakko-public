import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {SOURCES,checkTable,tableFeedbackKey}from './lesson.mjs';
const headers={kind:'kind',count:'count'};const rows=s=>s.items.map(x=>({kind:x.key,value:x.count}));const permutations=a=>a.length?a.flatMap((x,i)=>permutations(a.filter((_,j)=>j!==i)).map(rest=>[x,...rest])):[[]];
test('construction accepts every row order and equal quantities',()=>{assert.deepEqual(SOURCES[0].items.map(x=>x.count),[3,3,1]);for(const s of SOURCES)for(const order of permutations(rows(s)))assert.equal(checkTable(s,headers,order).ok,true);});
test('headers, category identity, zero and missing values are separate checks',()=>{const s=SOURCES[1];assert.equal(checkTable(s,{kind:'colour',count:'count'},rows(s)).ok,false);assert.equal(checkTable(s,{kind:'kind',count:'length'},rows(s)).ok,false);assert.equal(checkTable(s,headers,[{kind:'cards',value:2},{kind:'cards',value:0},{kind:'pencils',value:4}]).ok,false);const blank=rows(s);blank[1].value=null;assert.match(checkTable(s,headers,blank).text,/Tyhjä ruutu ei ole sama kuin 0/);assert.equal(checkTable(s,headers,rows(s)).ok,true);});
test('correct total cannot hide swapped category quantities',()=>{const wrong=[{kind:'cards',value:3},{kind:'balls',value:1},{kind:'pencils',value:3}];assert.equal(wrong.reduce((s,r)=>s+r.value,0),7);assert.equal(checkTable(SOURCES[0],headers,wrong).ok,false);assert.match(checkTable(SOURCES[0],headers,wrong).text,/Pallot/);});
test('source SVGs contain exactly the declared observations, contained in each category panel',()=>{for(const s of SOURCES){const svg=fs.readFileSync(new URL(s.diagram,import.meta.url),'utf8');s.items.forEach((item,i)=>{const groups=[...svg.matchAll(new RegExp(`<g data-source-kind="${item.key}" transform="translate\\((\\d+) (\\d+)\\)">`,'g'))];assert.equal(groups.length,item.count);for(const g of groups){const x=Number(g[1]),y=Number(g[2]);assert.ok(x-15>=15+i*190&&x+15<=195+i*190);assert.ok(y-25>=55&&y+25<=245);}});}const equal=fs.readFileSync(new URL('equal-table.svg',import.meta.url),'utf8');assert.equal((equal.match(/data-source-kind="cards"/g)||[]).length,3);assert.equal((equal.match(/data-source-kind="balls"/g)||[]).length,3);});

test('checked table identity follows labelled values and headers, not row order',()=>{
 const base=rows(SOURCES[0]),key=tableFeedbackKey('box',headers,base);
 assert.equal(tableFeedbackKey('box',headers,[...base].reverse()),key);
 const edited=base.map(r=>({...r}));edited[0].value=9;assert.notEqual(tableFeedbackKey('box',headers,edited),key);
 edited[0].value=null;assert.notEqual(tableFeedbackKey('box',headers,edited),key);
 assert.notEqual(tableFeedbackKey('box',{...headers,kind:'colour'},base),key);
 edited[0]={kind:'balls',value:3};assert.notEqual(tableFeedbackKey('box',headers,edited),key);
});

/* global window, document */
if(process.env.LESSON_PREVIEW_URL)test('native table edits invalidate checked feedback; recheck, pause and listener disposal remain honest',async()=>{
 const {chromium}=await import('playwright');const browser=await chromium.launch({headless:true});
 try{const page=await browser.newPage();await page.goto(new URL('lessons/M-DATA-04.html',process.env.LESSON_PREVIEW_URL).href);await page.waitForFunction(()=>window.controller);
  await page.evaluate(async()=>{window.controller.dispose();const area=document.querySelector('[data-maker-practice]');const add=area.addEventListener.bind(area),remove=area.removeEventListener.bind(area);window.listenerBalance={click:0,input:0,change:0};area.addEventListener=(type,...args)=>{if(type in window.listenerBalance)window.listenerBalance[type]++;return add(type,...args);};area.removeEventListener=(type,...args)=>{if(type in window.listenerBalance)window.listenerBalance[type]--;return remove(type,...args);};const m=await import('../content/M-DATA-04/lesson.mjs');window.controller=m.mount(document.querySelector('[data-lesson-module]'));});
  const area=page.locator('[data-maker-practice]'),feedback=area.locator('[data-feedback]');
  await area.locator('[data-heading="kind"]').selectOption('kind');await area.locator('[data-heading="count"]').selectOption('count');for(const [i,kind,value]of [[0,'cards','3'],[1,'balls','3'],[2,'pencils','1']]){await area.locator('[data-kind]').nth(i).selectOption(kind);await area.locator('[data-value]').nth(i).fill(value);}
  const check=async()=>area.locator('[data-action="check"]').click();await check();assert.match(await feedback.textContent(),/^Taulukossa/);
  await area.locator('[data-value]').first().fill('9');assert.match(await feedback.textContent(),/^Taulukkoa muutettiin/);await check();assert.match(await feedback.textContent(),/Kortit/);
  await area.locator('[data-value]').first().fill('3');assert.match(await feedback.textContent(),/^Taulukkoa muutettiin/);await check();const correct=await feedback.textContent();assert.match(correct,/^Taulukossa/);
  await area.locator('[data-action="reverse"]').click();assert.equal(await feedback.textContent(),correct);
  await area.locator('[data-heading="kind"]').selectOption('colour');assert.match(await feedback.textContent(),/^Taulukkoa muutettiin/);await area.locator('[data-heading="kind"]').selectOption('kind');assert.doesNotMatch(await feedback.textContent(),/^Taulukossa/);await check();
  await area.locator('[data-kind]').first().selectOption('balls');assert.match(await feedback.textContent(),/^Taulukkoa muutettiin/);await area.locator('[data-kind]').first().selectOption('pencils');await check();assert.match(await feedback.textContent(),/^Taulukossa/);
  await page.evaluate(()=>{const extra=document.createElement('input');document.querySelector('[data-maker-practice]').append(extra);extra.dispatchEvent(new Event('input',{bubbles:true}));extra.remove();});assert.match(await feedback.textContent(),/^Taulukossa/);
  await page.evaluate(()=>window.controller.pause());const paused=await feedback.textContent();await area.locator('[data-value]').first().evaluate(el=>{el.value='9';el.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal(await feedback.textContent(),paused);await page.evaluate(()=>window.controller.resume());assert.match(await feedback.textContent(),/^Taulukkoa muutettiin/);
  assert.deepEqual(await page.evaluate(()=>window.listenerBalance),{click:1,input:1,change:1});await page.evaluate(()=>{window.controller.reset();window.controller.reset();window.controller.dispose();window.controller.dispose();});assert.deepEqual(await page.evaluate(()=>window.listenerBalance),{click:0,input:0,change:0});
 }finally{await browser.close();}
});
