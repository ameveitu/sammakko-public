/* global navigator, document, innerWidth, localStorage */
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const base=process.env.LESSON_TEST_URL??'http://127.0.0.1:4186/site/';
const out=new URL('./evidence/phase1_1/legacy-browser/',import.meta.url);fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const errors=[]; const results=[];
try{
  const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const width of [390,1280]){
    await page.setViewportSize({width,height:900});
    await page.goto(base+'index.html');
    await page.locator('[name=lite]').selectOption('kyllä');assert.equal(await page.locator('#catalogue li:visible').count(),181);
    await page.locator('[name=q]').fill('M-ALG-08');await page.locator('[name=lite]').selectOption('');assert.equal(await page.locator('#catalogue li:visible').count(),1);
    await page.locator('#catalogue a:visible').click();assert.equal(await page.locator('main').getAttribute('data-kc'),'M-ALG-08');
    await page.locator('#copy-lesson').click();const copied=await page.evaluate(()=>navigator.clipboard.readText());assert.equal(copied,base+'lessons/M-ALG-08.html');
    await page.goto(copied);await page.reload();assert.equal(await page.locator('main').getAttribute('data-kc'),'M-ALG-08');
    await page.locator('#mode').click();assert(await page.locator('body').evaluate(e=>e.classList.contains('presentation')));
    assert(await page.locator('#lesson-body').isVisible());assert(!(await page.locator('.teacher[data-shell-teacher]').isVisible()));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:new URL(`presentation-${width}.png`,out).pathname,fullPage:true});
    await page.locator('#mode').click();await page.locator('.teacher[data-shell-teacher]>summary').click();assert(await page.locator('.teacher[data-shell-teacher] h2').first().isVisible());
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Open teacher panel must not overflow');
    await page.screenshot({path:new URL(`teacher-${width}.png`,out).pathname,fullPage:true});
    await page.locator('.support-details>summary').click();await page.locator('#upstream a').first().click();await page.goBack();assert.equal(await page.locator('main').getAttribute('data-kc'),'M-ALG-08');
    assert.equal(await page.evaluate(()=>localStorage.length),0);results.push({width,filter181:true,copyReloadBack:true,presentation:true,noOverflow:true,noHistoryWrites:true});
  }
  const plain=await browser.newContext({javaScriptEnabled:false});const p=await plain.newPage();await p.goto(base+'lessons/CHEM79-ELEMENT.html');
  await p.locator('.support-details>summary').click();await p.locator('#upstream a[href="CHEM79-ATOM-01.html"]').click();assert.equal(await p.locator('main').getAttribute('data-kc'),'CHEM79-ATOM-01');
  assert(await p.locator('#downstream a[href="CHEM79-ELEMENT.html"]').isVisible());assert.deepEqual(errors,[]);
  const bindings=Object.fromEntries(['build.mjs','runtime.mjs','assets/shell.css','assets/shell.js','browser-check.mjs','site/data/lesson-manifest.json'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(new URL(p,import.meta.url))).digest('hex')]));
  fs.writeFileSync(new URL('browser-results.json',out),JSON.stringify({status:'PASS',base,bindings,results,javaScriptDisabledCycle:true,errors},null,2)+'\n');
  console.log('PASS: browser prefix /site/, 390/1280, filters, copy/paste/reload/back, teacher/presentation, no JS cycle navigation, no storage writes');
}finally{await browser.close();}
