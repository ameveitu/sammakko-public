/* global document,window,innerWidth */
// Independent integrated QA for Mill's frozen B05 sources. No build, source writes or routing/interception.
// Main runs after normal55 is served. Optional LESSON_QA_OUTPUT saves screenshots only to that directory.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {chromium} from '@playwright/test';

const root = new URL('./', import.meta.url), base = new URL(process.env.LESSON_TEST_URL ?? 'http://127.0.0.1:4191/site/');
assert(base.pathname.endsWith('/'), 'LESSON_TEST_URL must end at the site directory with /');
const expected = {
  'M-MEAS-01': '1@e04c550c7b748c8d06507e3b65bce330542be34884d923c979b4797828f63564',
  'M-DIV-01': '1@3c846d33ba721466bf8bd34cbe9715c4359cd14523170195840ae5f9cb0be963',
  'M-DIV-02': '1@f26f3541d8ecd2cffccff085885c21c1463e5094799ed8eb2be098f6e82632a3'
};
const selectors = {'M-MEAS-01': '[data-unit-measure]', 'M-DIV-01': '[data-sharing]', 'M-DIV-02': '[data-grouping]'};
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
function revision(id) {
  const dir = new URL('packages/' + id + '/', root), p = JSON.parse(fs.readFileSync(new URL('lesson.json', dir)));
  for (const a of p.assets) assert.equal(hash(fs.readFileSync(new URL(a.path, a.path.startsWith('shared/') ? root : dir))), a.sha256, id + ': declared asset');
  return p.revision + '@' + hash(JSON.stringify({...p, reviews: undefined}) + fs.readFileSync(new URL(p.body, dir), 'utf8') + fs.readFileSync(new URL(p.module, dir), 'utf8') + p.assets.map(a => a.sha256).join(''));
}
for (const [id, value] of Object.entries(expected)) assert.equal(revision(id), value, id + ': exact source binding');
const out = process.env.LESSON_QA_OUTPUT; if (out) fs.mkdirSync(out, {recursive: true});
const action = (s, name) => s.locator('[data-action="' + name + '"]');
const resultIs = async (s, value) => assert.equal(await s.locator('[data-feedback]').getAttribute('data-result'), value);
async function report(s, value) { await s.locator('[data-reported]').fill(value === null ? '' : String(value)); }
async function check(s, result) { await action(s, 'check').click(); await resultIs(s, result); }
async function caseIs(s, value) { await s.locator('[data-case]').selectOption(value); await resultIs(s, 'neutral'); assert.equal(await s.locator('[data-reported]').inputValue(), ''); }
async function tokens(s, total, groups = null) { assert.equal(await s.locator('circle[data-token]').count(), total); if (groups !== null) assert.equal(await s.locator('[data-group]').count(), groups); }

async function measurement(s) {
  await report(s, 4); await check(s, 'retry');
  for (let i = 0; i < 4; i++) await action(s, 'add').click(); await check(s, 'correct');
  assert.deepEqual(await s.locator('[data-piece-index]').evaluateAll(es => es.map(e => Number(e.dataset.start))), [0, 1, 2, 3]);
  const geometry = await s.locator('[data-picture]').evaluate(el => ({length: Number(el.querySelector('[data-measured]').getAttribute('width')), units: [...el.querySelectorAll('[data-piece-index] rect')].map(e => Number(e.getAttribute('width')))}));
  assert.equal(geometry.length, 168); assert.deepEqual(geometry.units, [42, 42, 42, 42]);
  await s.locator('[data-piece="0"]').click(); await s.locator('[data-shift="1"]').click(); await resultIs(s, 'neutral'); await check(s, 'retry');
  await s.locator('[data-piece="1"]').click(); await s.locator('[data-shift="-1"]').click(); await resultIs(s, 'neutral'); await check(s, 'correct');
  assert.deepEqual(await s.locator('[data-piece-index]').evaluateAll(es => es.map(e => Number(e.dataset.start))), [1, 0, 2, 3]);
  const text = await s.locator('[data-feedback]').textContent(); await s.locator('[data-guide]').check(); assert.equal(await s.locator('[data-feedback]').textContent(), text); await resultIs(s, 'correct');
  await report(s, 3); await resultIs(s, 'neutral'); await check(s, 'retry'); await report(s, 4); await resultIs(s, 'neutral'); await check(s, 'correct');
  await caseIs(s, 'gap'); await report(s, 4); await check(s, 'retry'); assert.match(await s.locator('[data-feedback]').textContent(), /rako/);
  await action(s, 'add').click(); await resultIs(s, 'neutral'); await s.locator('[data-shift="-1"]').click(); await check(s, 'retry'); assert.match(await s.locator('[data-feedback]').textContent(), /samassa kohdassa/);
  await s.locator('[data-shift="-1"]').click(); await resultIs(s, 'neutral'); await check(s, 'correct');
  await caseIs(s, 'overlap'); await report(s, 4); await check(s, 'retry'); await s.locator('[data-piece="2"]').click(); await s.locator('[data-shift="1"]').click(); await resultIs(s, 'neutral'); await check(s, 'correct');
  await caseIs(s, 'card'); for (let i = 0; i < 3; i++) await action(s, 'add').click(); await report(s, 3); await check(s, 'correct');
}
async function sharing(s) {
  const add = i => s.locator('[data-recipient="' + i + '"][data-delta="1"]'), remove = i => s.locator('[data-recipient="' + i + '"][data-delta="-1"]');
  await report(s, 2); await check(s, 'retry'); await action(s, 'round').click(); await action(s, 'round').click(); await check(s, 'correct'); await tokens(s, 6);
  const before = await s.locator('[data-picture]').innerHTML(), text = await s.locator('[data-feedback]').textContent(); await action(s, 'reorder').click(); assert.equal(await s.locator('[data-picture]').innerHTML(), before); assert.equal(await s.locator('[data-feedback]').textContent(), text); await resultIs(s, 'correct');
  await remove(2).click(); await resultIs(s, 'neutral'); await check(s, 'retry'); assert.match(await s.locator('[data-feedback]').textContent(), /Kasassa on vielä 1/);
  await add(0).click(); await check(s, 'retry'); assert.match(await s.locator('[data-feedback]').textContent(), /määrät eroavat/);
  await remove(0).click(); await add(2).click(); await resultIs(s, 'neutral'); await check(s, 'correct');
  await report(s, 3); await resultIs(s, 'neutral'); await check(s, 'retry'); assert.match(await s.locator('[data-feedback]').textContent(), /alustojen määrän/); await report(s, 2); await resultIs(s, 'neutral'); await check(s, 'correct');
  await action(s, 'clear').click(); await resultIs(s, 'neutral'); for (const i of [2, 2, 0, 0, 1, 1]) { await add(i).click(); await tokens(s, 6); } await report(s, 2); await check(s, 'correct');
  for (const [key, recipients, per] of [['two', 2, 4], ['four', 4, 2]]) { await caseIs(s, key); for (let i = recipients - 1; i >= 0; i--) for (let n = 0; n < per; n++) { await add(i).click(); await tokens(s, 8); } await report(s, per); await check(s, 'correct'); }
}
async function grouping(s) {
  await report(s, 4); await check(s, 'retry');
  for (let n = 1; n <= 3; n++) { await action(s, 'add').click(); await tokens(s, 8, n); } await check(s, 'retry'); assert.match(await s.locator('[data-feedback]').textContent(), /Kasassa on vielä 2/);
  await action(s, 'add').click(); await check(s, 'correct'); await tokens(s, 8, 4); assert.equal(await action(s, 'add').isDisabled(), true);
  const text = await s.locator('[data-feedback]').textContent(); await s.locator('[data-guide]').check(); assert.equal(await s.locator('[data-feedback]').textContent(), text); await resultIs(s, 'correct');
  await action(s, 'undo').click(); await resultIs(s, 'neutral'); await check(s, 'retry'); await action(s, 'add').click(); await resultIs(s, 'neutral'); await check(s, 'correct');
  await report(s, 2); await resultIs(s, 'neutral'); await check(s, 'retry'); assert.match(await s.locator('[data-feedback]').textContent(), /yhden ryhmän koon/); await report(s, 4); await resultIs(s, 'neutral'); await check(s, 'correct');
  for (const [key, total, target] of [['fours', 8, 2], ['threes', 12, 4], ['equal', 9, 3]]) { await caseIs(s, key); for (let n = 1; n <= target; n++) { await action(s, 'add').click(); await tokens(s, total, n); } await report(s, target); await check(s, 'correct'); }
}
async function lifecycle(page, s, id) {
  const toolbar = page.locator('[data-lesson-module] .module-tools'); if (await toolbar.count() && await toolbar.getAttribute('open') === null) await toolbar.locator('summary').click();
  const fieldset = s.locator('fieldset[data-controls]'), before = await s.locator('[data-picture]').innerHTML(), value = await s.locator('[data-reported]').inputValue();
  async function frozen() { assert.equal(await fieldset.evaluate(e => e.disabled), true, 'native fieldset.disabled'); for (const e of await s.locator('button,input,select,textarea').all()) assert.equal(await e.isDisabled(), true, 'effective native child state'); }
  await page.locator('[data-module-action="pause"]').click(); await frozen();
  await s.locator('button').first().evaluate(e => e.dispatchEvent(new Event('click', {bubbles: true}))); assert.equal(await s.locator('[data-picture]').innerHTML(), before); assert.equal(await s.locator('[data-reported]').inputValue(), value);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', {configurable: true, value: true}); document.dispatchEvent(new Event('visibilitychange')); Object.defineProperty(document, 'hidden', {configurable: true, value: false}); document.dispatchEvent(new Event('visibilitychange')); }); await frozen();
  await page.locator('[data-module-action="resume"]').click(); assert.equal(await fieldset.evaluate(e => e.disabled), false); assert.equal(await s.locator('[data-case]').isDisabled(), false); assert.equal(await s.locator('[data-reported]').isDisabled(), false);
  await page.locator('[data-module-action="pause"]').click(); await s.locator('[data-reported]').evaluate(e => { e.value = '0'; }); await page.locator('[data-module-action="resume"]').click(); await resultIs(s, 'neutral'); await check(s, 'retry');
  await report(s, Number(value)); await resultIs(s, 'neutral'); await check(s, 'correct'); await report(s, null); await resultIs(s, 'neutral'); await check(s, 'retry'); await report(s, Number(value)); await check(s, 'correct');
  await page.locator('[data-module-action="pause"]').click(); await page.locator('[data-module-action="reset"]').click(); await frozen(); await page.locator('[data-module-action="reset"]').click(); await frozen();
  assert.equal(await s.locator('[data-reported]').inputValue(), ''); assert.equal(await s.locator('[data-case]').inputValue(), id === 'M-MEAS-01' ? 'ribbon' : id === 'M-DIV-01' ? 'three' : 'pairs');
  await page.locator('[data-module-action="resume"]').click(); assert.equal(await fieldset.evaluate(e => e.disabled), false); await resultIs(s, 'neutral');
  if (id === 'M-MEAS-01') { await action(s, 'add').click(); assert.equal(await s.locator('[data-piece-index]').count(), 1); }
  else if (id === 'M-DIV-01') { await s.locator('[data-recipient="0"][data-delta="1"]').click(); assert.equal(await s.locator('circle[data-token="r0"]').count(), 1); await tokens(s, 6); }
  else { await action(s, 'add').click(); await tokens(s, 8, 1); }
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', {configurable: true, value: true}); document.dispatchEvent(new Event('visibilitychange')); }); await frozen(); await page.evaluate(() => { Object.defineProperty(document, 'hidden', {configurable: true, value: false}); document.dispatchEvent(new Event('visibilitychange')); }); assert.equal(await fieldset.evaluate(e => e.disabled), false);
}
const browser = await chromium.launch({headless: true}), results = [], pageErrors = [];
try {
  for (const width of [320, 390, 1280]) for (const id of Object.keys(expected)) {
    const page = await browser.newPage({viewport: {width, height: 900}}), errors = []; page.on('pageerror', e => errors.push(e.message));
    try {
      const moduleResponse = page.waitForResponse(r => new URL(r.url()).pathname.endsWith('/content/' + id + '/lesson.mjs'));
      await page.goto(new URL('lessons/' + id + '.html', base).href); assert.equal(await page.locator('[data-content-revision]').getAttribute('data-content-revision'), expected[id]);
      const response = await moduleResponse; assert.equal(response.ok(), true); assert.equal(hash(await response.body()), hash(fs.readFileSync(new URL('packages/' + id + '/lesson.mjs', root))), 'actually served module bytes');
      const s = page.locator(selectors[id]); await page.waitForFunction(selector => document.querySelector(selector)?.dataset.moduleReady === 'true', selectors[id]);
      if (id === 'M-MEAS-01') await measurement(s); else if (id === 'M-DIV-01') await sharing(s); else await grouping(s);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'no horizontal overflow'); if (out) await page.screenshot({path: path.join(out, id + '-' + width + '-constructed.png'), fullPage: true});
      await lifecycle(page, s, id);
      const finalPicture = await s.locator('[data-picture]').innerHTML(); await page.evaluate(() => window.dispatchEvent(new Event('pagehide'))); assert.equal(await s.getAttribute('data-module-ready'), null); assert.equal(await s.locator('fieldset').evaluate(e => e.disabled), true);
      await action(s, id === 'M-DIV-01' ? 'round' : 'add').evaluate(e => e.dispatchEvent(new Event('click', {bubbles: true}))); assert.equal(await s.locator('[data-picture]').innerHTML(), finalPicture, 'disposed listener cannot mutate model');
      await page.reload(); await page.waitForFunction(selector => document.querySelector(selector)?.dataset.moduleReady === 'true', selectors[id]); assert.equal(await page.locator(selectors[id]).locator('[data-reported]').inputValue(), '');
      assert.deepEqual(errors, []); results.push({id, width, revision: expected[id], status: 'PASS'});
    } catch (error) { results.push({id, width, revision: expected[id], status: 'FAIL', error: error.message}); }
    pageErrors.push(...errors); await page.close();
  }
  for (const id of Object.keys(expected)) {
    const context = await browser.newContext({javaScriptEnabled: false, viewport: {width: 390, height: 900}}), page = await context.newPage();
    try { await page.goto(new URL('lessons/' + id + '.html', base).href); assert.equal(await page.locator('[data-content-revision]').getAttribute('data-content-revision'), expected[id]); const s = page.locator(selectors[id]); assert.equal(await s.getAttribute('data-module-ready'), null); assert.equal(await s.locator('fieldset').evaluate(e => e.disabled), true); for (const el of await s.locator('button,input,select').all()) assert.equal(await el.isDisabled(), true); results.push({id, noJS: true, revision: expected[id], status: 'PASS'}); } catch (error) { results.push({id, noJS: true, status: 'FAIL', error: error.message}); } finally { await context.close(); }
  }
} finally { await browser.close(); }
for (const [id, value] of Object.entries(expected)) assert.equal(revision(id), value, id + ': source preserved');
console.log(JSON.stringify({kind: 'independent_integrated_B05_measure_division_QA',base: base.href,status: results.every(r => r.status === 'PASS') && !pageErrors.length ? 'PASS' : 'FAIL',results,pageErrors,limits: ['Real normal site only; no routing/interception, builds or package edits', 'Synthetic technical QA; no learner/human/full nonvisual or mastery validation']}, null, 2));
if (results.some(r => r.status !== 'PASS') || pageErrors.length) process.exitCode = 1;
