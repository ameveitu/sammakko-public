/* global document */
// Adversarial case-commit/readback regression; requires the built local HTTP preview.
import {chromium} from '@playwright/test';
import fs from 'node:fs';import assert from 'node:assert/strict';import path from 'node:path';import {digest} from './content.mjs';
const root=new URL('./',import.meta.url),base=process.env.LESSON_TEST_URL??'http://127.0.0.1:4191/site/',out=process.env.SPEED_COMMIT_QA_OUTPUT;
if(!out||fs.existsSync(out))throw Error('Set SPEED_COMMIT_QA_OUTPUT to a new evidence directory');fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(new URL('packages/PHY79-SPEED-CONCEPT/lesson.mjs',root)),browser=await chromium.launch({headless:true}),results=[],errors=[];
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,1280]){
  await page.setViewportSize({width,height:844});await page.goto(base+'lessons/PHY79-SPEED-CONCEPT.html?mode=presentation');
  const response=await page.request.get(base+'content/PHY79-SPEED-CONCEPT/lesson.mjs');assert.equal(digest(await response.body()),digest(source));
  const choice=page.locator('[data-speed-scenario]'),feedback=page.locator('[data-speed-feedback]');await choice.waitFor();
  await page.locator('[data-speed-answer="-1"]').click();assert.match(await feedback.innerText(),/^Oikein/);
  await choice.evaluate(e=>{e.value='sameDistance';e.dispatchEvent(new Event('input',{bubbles:true}));});
  assert.equal(await feedback.innerText(),'');assert.match(await page.locator('[data-speed-lab]').innerText(),/A 12 m \/ 4 s, B 12 m \/ 6 s/);
  await page.locator('[data-speed-answer="-1"]').click();assert.match(await feedback.innerText(),/^Tutki/);assert.match(await feedback.innerText(),/A:n keskinopeus on 3 m\/s, B:n 2 m\/s/);
  await page.locator('[data-speed-answer="1"]').click();assert.match(await feedback.innerText(),/^Oikein/);
  await choice.evaluate(e=>{e.value='sameTime';e.dispatchEvent(new Event('change',{bubbles:true}));});assert.equal(await feedback.innerText(),'');
  await choice.evaluate(e=>{e.value='equal';});await page.locator('[data-speed-answer="0"]').click();assert.match(await feedback.innerText(),/^Oikein/);assert.match(await feedback.innerText(),/4 m\/s/);
  await choice.evaluate(e=>{e.value='pause';});await page.locator('[data-speed-action=step]').click();assert.match(await page.locator('[data-speed-readout]').innerText(),/Kellon aika 1 s\. A: 4 m \/ 1 s; B: 2 m \/ 1 s/);
  const timeline=page.locator('[data-speed-lab] input[type=range]');await timeline.evaluate(e=>{e.value='3';e.dispatchEvent(new Event('change',{bubbles:true}));});assert.match(await page.locator('[data-speed-readout]').innerText(),/Kellon aika 3 s\. A: 12 m \/ 3 s; B: 6 m \/ 3 s/);
  await page.locator('[data-speed-answer="0"]').click();const wholeTripVerdict=await feedback.innerText();assert.match(wholeTripVerdict,/^Oikein/);
  await timeline.evaluate(e=>{e.value='2';e.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal(await feedback.innerText(),wholeTripVerdict,'time inspection does not change whole-trip truth');
  await choice.evaluate(e=>{const o=document.createElement('option');o.value='unsupported_accelerated_motion';o.textContent='Unsupported QA sentinel';e.append(o);e.value=o.value;e.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.locator('[data-speed-answer="1"]').click();assert.equal(await feedback.innerText(),'Valitse jokin annetuista vertailuista.');
  await choice.selectOption('sameDistance');await page.locator('[data-speed-answer="1"]').click();assert.match(await feedback.innerText(),/^Oikein/);
  await page.screenshot({path:path.join(out,'speed-commits-'+width+'.png')});results.push({width,inputOnlyCase:true,changeOnlyCase:true,visibleCaseReadback:true,changeOnlyTime:true,wholeTripInvariant:true,unsupportedCaseRejected:true});
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify({status:'PASS',moduleSha256:digest(source),results,errors,scope:'Actual HTTP Chromium case-commit regression; no learner or formal mastery claim.'},null,2)+'\n');console.log(JSON.stringify({status:'PASS',views:results.length,out}));
}catch(error){fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({error:error.message,stack:error.stack,results,errors},null,2));throw error;}finally{await browser.close();}
