/* global document, window */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CASES,scaleMarks,rulerGeometry,checkMeasurement,feedbackKey,sceneSvg} from './lesson.mjs';
const lengthAnswer=(value=6,unit='cm',zero=2)=>({tool:'ruler',unit,value,zero});
const temperatureAnswer=(value=18)=>({tool:'thermometer',unit:'°C',value,zero:null});

test('scale divisions encode interval values, not number of tick lines',()=>{
  const s=scaleMarks(0,30,2,10);
  assert.equal(s.length,16);assert.deepEqual(s.filter(m=>m.labelled).map(m=>m.value),[0,10,20,30]);
  for(let i=1;i<s.length;i++)assert.equal(s[i].value-s[i-1].value,2);
  for(const p of [[0,30,0,10],[0,30,-2,10],[0,30,2,3],[0,31,2,10],[0,1000,1,10],[NaN,30,2,10],[0,0,1,1]])assert.throws(()=>scaleMarks(...p),RangeError);
});
test('moving the ruler changes readings while preserving measured geometry',()=>{
  for(const key of ['strip','leaf']){
    const c=CASES[key],base=rulerGeometry(key,c.start);
    assert.equal(base.objectEnd-base.objectStart,c.length*base.unitPx);
    assert.equal(base.startReading,0);assert.equal(base.endReading,c.length);
    for(let z=c.start-1;z<=c.start+1;z++){
      const g=rulerGeometry(key,z);assert.equal(g.objectStart,base.objectStart);assert.equal(g.objectEnd,base.objectEnd);
      assert.equal(g.endReading-g.startReading,c.length);
      assert.equal(g.zeroX+(c.start-z)*g.unitPx,g.objectStart);
      assert.equal(g.zeroX+g.endReading*g.unitPx,g.objectEnd);
    }
    assert.throws(()=>rulerGeometry(key,c.start+2),RangeError);
  }
});
test('length checks both equivalent units and specifically the stated zero-start procedure',()=>{
  for(const key of ['strip','leaf']){
    const c=CASES[key];
    assert.equal(checkMeasurement(key,lengthAnswer(c.length,'cm',c.start)).ok,true);
    assert.equal(checkMeasurement(key,lengthAnswer(c.length*10,'mm',c.start)).ok,true);
    assert.equal(checkMeasurement(key,lengthAnswer(c.length,'mm',c.start)).code,'conversion');
    assert.equal(checkMeasurement(key,lengthAnswer(c.length,'cm',c.start-1)).code,'alignment');
    assert.match(checkMeasurement(key,lengthAnswer(c.length,'cm',c.start-1)).text,/erotuksesta/);
    assert.equal(checkMeasurement(key,lengthAnswer(c.length+1,'cm',c.start)).code,'reading');
  }
});
test('thermometer step is2 degrees, with quantity/unit and blank checks',()=>{
  assert.equal(checkMeasurement('air',temperatureAnswer()).ok,true);
  assert.equal(checkMeasurement('air',temperatureAnswer(14)).code,'reading');
  assert.match(checkMeasurement('air',temperatureAnswer(14)).text,/2 °C/);
  assert.equal(checkMeasurement('air',{...temperatureAnswer(),unit:'cm'}).code,'unit');
  assert.equal(checkMeasurement('air',{...temperatureAnswer(),tool:'scale'}).code,'tool');
  assert.equal(checkMeasurement('strip',lengthAnswer(null)).code,'empty');
  assert.equal(checkMeasurement('strip',lengthAnswer(0)).code,'reading');
  assert.equal(checkMeasurement('air',{...temperatureAnswer(),tool:''}).code,'tool-empty');
  assert.equal(checkMeasurement('air',{...temperatureAnswer(),unit:''}).code,'unit-empty');
});
test('malformed records, sparse arrays, missing/extra fields and invalid domains never pass',()=>{
  const valid=lengthAnswer();
  for(const a of [null,undefined,[],new Array(4),[...Object.values(valid)],{...valid,extra:true},Object.fromEntries(Object.entries(valid).filter(([k])=>k!=='unit')),{...valid,value:NaN},{...valid,value:Infinity},{...valid,value:'6'},{...valid,value:true},{...valid,unit:'m'},{...valid,tool:'tape'},{...valid,zero:1.5},{...valid,zero:999}]) assert.equal(checkMeasurement('strip',a).ok,false);
  for(const id of ['missing','toString','__proto__'])assert.equal(checkMeasurement(id,valid).ok,false);
  assert.equal(checkMeasurement('air',{...temperatureAnswer(),zero:0}).ok,false);
  assert.equal(checkMeasurement('strip',lengthAnswer()).ok,true);
});
test('feedback key covers answer and rule context, not optional visual help',()=>{
  const a=lengthAnswer(),k=feedbackKey('strip',a);
  for(const changed of [{...a,tool:'scale'},{...a,unit:'mm'},{...a,value:7},{...a,value:null},{...a,zero:1}])assert.notEqual(feedbackKey('strip',changed),k);
  assert.notEqual(feedbackKey('leaf',a),k);
  assert.equal(feedbackKey('strip',{zero:2,value:6,unit:'cm',tool:'ruler'}),k);
  assert.equal(checkMeasurement('strip',a).ok,true);
});
test('static and interactive figures use consistent exact coordinates and scale values',()=>{
  assert.equal(fs.readFileSync(new URL('./practice-start.svg',import.meta.url),'utf8'),sceneSvg('strip',1)+'\n');
  const worked=fs.readFileSync(new URL('./ruler-zero.svg',import.meta.url),'utf8');
  assert.equal((worked.match(/data-strip="true" x="84"[^>]*width="150"/g)||[]).length,2);
  const thermo=fs.readFileSync(new URL('./thermometer.svg',import.meta.url),'utf8');
  const tickYs=[...thermo.matchAll(/data-tick="(\d+)"[^>]*y1="(\d+)"/g)].map(m=>[Number(m[1]),Number(m[2])]);
  assert.equal(tickYs.length,16);
  for(const [v,y]of tickYs)assert.equal(y,290-8*v);
  assert.match(thermo,/data-liquid="true"[^>]*y="178"/);assert.equal(290-8*14,178);
  const live=sceneSvg('air',null);
  assert.match(live,/data-liquid="true"[^>]*y="146"/);assert.equal(290-8*18,146);
  for(const key of ['strip','leaf'])for(let z=CASES[key].start-1;z<=CASES[key].start+1;z++){
    const svg=sceneSvg(key,z);assert.equal((svg.match(/data-tick=/g)||[]).length,11);assert.doesNotMatch(svg,/NaN|undefined/);
  }
});

if(process.env.LESSON_PREVIEW_URL)test('Chromium native edits obey exact feedback contract, optional help and full lifecycle',async()=>{
  const {chromium}=await import('playwright');const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(new URL('lessons/SCI-ENV-MEAS-01.html',process.env.LESSON_PREVIEW_URL).href);
    await page.waitForFunction(()=>Boolean(window.controller));
    await page.evaluate(async()=>{
      window.controller.dispose();const area=document.querySelector('[data-scimeasure]');
      const add=area.addEventListener.bind(area),remove=area.removeEventListener.bind(area);window.listenerBalance={click:0,input:0,change:0};
      area.addEventListener=(type,...args)=>{if(type in window.listenerBalance)window.listenerBalance[type]++;return add(type,...args);};
      area.removeEventListener=(type,...args)=>{if(type in window.listenerBalance)window.listenerBalance[type]--;return remove(type,...args);};
      const {mount}=await import('../content/SCI-ENV-MEAS-01/lesson.mjs');window.controller=mount(document.querySelector('[data-lesson-module]'));
    });
    const p=s=>page.locator('[data-scimeasure] '+s),verdict=()=>p('[data-result]').getAttribute('data-verdict'),check=()=>p('[data-action="check"]').click();
    await p('[data-tool]').selectOption('ruler');await p('[data-unit]').selectOption('cm');await p('[data-value]').fill('6');await p('[data-zero]').focus();await page.keyboard.press('ArrowRight');await check();assert.equal(await verdict(),'correct');
    await p('[data-value]').fill('7');assert.equal(await verdict(),'neutral');await check();assert.equal(await verdict(),'retry');
    await p('[data-value]').fill('6');assert.equal(await verdict(),'neutral');await check();assert.equal(await verdict(),'correct');
    await p('[data-value]').fill('');assert.equal(await verdict(),'neutral');await check();assert.equal(await verdict(),'retry');await p('[data-value]').fill('6');assert.equal(await verdict(),'neutral');await check();
    await p('[data-guide]').check();assert.equal(await verdict(),'correct');await p('[data-guide]').uncheck();assert.equal(await verdict(),'correct');
    await p('[data-unit]').selectOption('mm');assert.equal(await verdict(),'neutral');await p('[data-value]').fill('60');await check();assert.equal(await verdict(),'correct');
    await p('[data-tool]').selectOption('scale');assert.equal(await verdict(),'neutral');await check();assert.equal(await verdict(),'retry');await p('[data-tool]').selectOption('ruler');assert.equal(await verdict(),'neutral');await check();
    await p('[data-zero]').focus();await page.keyboard.press('ArrowLeft');assert.equal(await verdict(),'neutral');await check();assert.match(await p('[data-result]').innerText(),/aloittaa nollasta/);await page.keyboard.press('Tab');
    await p('[data-zero]').focus();await page.keyboard.press('ArrowRight');assert.equal(await verdict(),'neutral');await check();assert.equal(await verdict(),'correct');
    // The component accepts either native input OR change; no blanket document listener.
    await page.evaluate(()=>{const v=document.querySelector('[data-value]');v.value='9';v.dispatchEvent(new Event('change',{bubbles:true}));});assert.equal(await verdict(),'neutral');await check();assert.equal(await verdict(),'retry');
    await p('[data-value]').fill('60');await check();assert.equal(await verdict(),'correct');
    await page.evaluate(()=>{const other=document.createElement('input');document.body.append(other);other.dispatchEvent(new Event('input',{bubbles:true}));other.remove();});assert.equal(await verdict(),'correct');
    await p('[data-case]').selectOption('leaf');assert.equal(await verdict(),'neutral');await p('[data-tool]').selectOption('ruler');await p('[data-unit]').selectOption('cm');await p('[data-value]').fill('4');await p('[data-zero]').focus();await page.keyboard.press('ArrowRight');await check();assert.equal(await verdict(),'correct');
    await p('[data-case]').selectOption('air');assert.equal(await verdict(),'neutral');assert.equal(await p('[data-ruler-control]').isVisible(),false);
    await p('[data-tool]').selectOption('thermometer');await p('[data-unit]').selectOption('°C');await p('[data-value]').fill('18');await check();assert.equal(await verdict(),'correct');
    await p('[data-value]').fill('14');assert.equal(await verdict(),'neutral');await check();assert.equal(await verdict(),'retry');await p('[data-value]').fill('18');assert.equal(await verdict(),'neutral');await check();assert.equal(await verdict(),'correct');
    await page.evaluate(()=>{window.controller.pause();const v=document.querySelector('[data-value]');v.value='14';v.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('[data-action="check"]').click();});assert.equal(await verdict(),'correct');assert.equal(await p('[data-controls]').evaluate(el=>el.disabled),true);assert.equal(await p('[data-value]').isDisabled(),true);assert.equal(await p('[data-action="check"]').isDisabled(),true);
    await page.evaluate(()=>window.controller.resume());assert.equal(await verdict(),'neutral');await check();assert.equal(await verdict(),'retry');
    await page.evaluate(()=>{window.controller.reset();window.controller.reset();});assert.equal(await verdict(),'neutral');assert.deepEqual(await page.evaluate(()=>window.listenerBalance),{click:1,input:1,change:1});
    await page.evaluate(()=>{window.controller.pause();window.controller.reset();});assert.equal(await p('[data-controls]').evaluate(el=>el.disabled),true);assert.equal(await p('[data-value]').isDisabled(),true);assert.equal(await p('[data-action="check"]').isDisabled(),true);await page.evaluate(()=>window.controller.resume());
    await page.evaluate(()=>{window.controller.dispose();window.controller.dispose();});assert.deepEqual(await page.evaluate(()=>window.listenerBalance),{click:0,input:0,change:0});
    assert.deepEqual(errors,[]);
  }finally{await browser.close();}
});
