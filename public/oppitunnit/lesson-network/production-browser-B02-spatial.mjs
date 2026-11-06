/* global document, innerWidth, DOMParser */
// Independent synthetic B02 review: main runs this AFTER stable source integration.
// Scope: four packages only. No build, package writes, screenshots, or receipt writes.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const root = new URL('./', import.meta.url);
const base = 'http://127.0.0.1:4191/site/';
const ids = ['M-FRAC-01', 'M-GEO-01', 'M-GEO-02', 'M-DATA-03'];
const selectors = ['[data-frac-work]', '[data-geo-work]', '[data-position-work]', '[data-table-work]'];
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const results = [], errors = [];
const sourceRevision = id => {
  const dir = new URL(`packages/${id}/`, root);
  const p = JSON.parse(fs.readFileSync(new URL('lesson.json', dir), 'utf8'));
  for (const a of p.assets) assert.equal(sha(fs.readFileSync(new URL(a.path, a.path.startsWith('shared/') ? root : dir))), a.sha256, `${id}: asset ${a.path}`);
  return `${p.revision}@${sha(JSON.stringify({...p, reviews: undefined}) + fs.readFileSync(new URL(p.body, dir), 'utf8') + fs.readFileSync(new URL(p.module, dir), 'utf8') + p.assets.map(a => a.sha256).join(''))}`;
};
const initialRevisions = Object.fromEntries(ids.map(id => [id, sourceRevision(id)]));
const textHas = async (s, selector, re) => assert.match(await s.locator(selector).textContent(), re);
const click = async (s, selector) => s.locator(selector).click();
const browser = await chromium.launch({headless: true});

async function practice(id, s) {
  if (id === 'M-FRAC-01') {
    await click(s, '[data-frac-check]');
    await textHas(s, '[data-frac-feedback]', /Osia on 1.*jakajia 2/);
    await click(s, '[data-frac-cut="1"]'); await click(s, '[data-frac-check]');
    await textHas(s, '[data-frac-feedback]', /sopiva määrä.*eri kokoisia/);
    assert.equal(await s.locator('[data-frac-compare] rect').count(), 2);
    const widths = await s.locator('[data-frac-compare] rect').evaluateAll(es => es.map(e => +e.getAttribute('width')));
    assert.equal(widths[1], widths[0] * 5, 'actual comparison depicts 1:5 unequal pieces');
    await click(s, '[data-frac-clear]'); await click(s, '[data-frac-cut="3"]'); await click(s, '[data-frac-check]');
    await textHas(s, '[data-frac-feedback]', /Kaikki 2 osaa ovat yhtä suuria/);
    assert.deepEqual(await s.locator('[data-frac-compare] rect').evaluateAll(es => es.map(e => +e.getAttribute('width'))), [138, 138]);
    await click(s, '[data-frac-task="3"]');
    assert.equal(await s.locator('[data-frac-cut][aria-pressed="true"]').count(), 0);
    for (const n of [1, 3]) await click(s, `[data-frac-cut="${n}"]`);
    await click(s, '[data-frac-check]'); await textHas(s, '[data-frac-feedback]', /sopiva määrä.*eri kokoisia/);
    await click(s, '[data-frac-clear]');
    for (const n of [4, 2]) await click(s, `[data-frac-cut="${n}"]`);
    await click(s, '[data-frac-check]'); await textHas(s, '[data-frac-feedback]', /Kaikki 3 osaa ovat yhtä suuria/);
    assert.deepEqual(await s.locator('[data-frac-compare] rect').evaluateAll(es => es.map(e => +e.getAttribute('width'))), [92, 92, 92]);
    await click(s, '[data-frac-demo]'); await textHas(s, '[data-frac-feedback]', /kaksi osaa, mutta eri kokoiset/);
  } else if (id === 'M-GEO-01') {
    for (const model of ['cube', 'can']) {
      await click(s, `[data-geo-model="${model}"]`);
      await textHas(s, '[data-geo-caption]', /Oikeassa kokeilussa käytä oikeaa esinettä/);
      await click(s, '[data-geo-step]'); await textHas(s, '[data-geo-caption]', /paperia koskettavan pohjan/);
      assert.equal(await s.locator('[data-geo-scene] [stroke-dasharray]').count(), 1);
      await click(s, '[data-geo-step]');
      await textHas(s, '[data-geo-caption]', model === 'cube' ? /suoraan ylhäältä.*neliötä/ : /suoraan ylhäältä.*ympyrää/);
      assert(await s.locator('[data-geo-step]').isDisabled());
      assert.equal(await s.locator(model === 'cube' ? '[data-geo-scene] rect[width="108"][height="108"]' : '[data-geo-scene] circle[r="54"]').count(), 1);
      await click(s, '[data-geo-start]'); assert(!(await s.locator('[data-geo-step]').isDisabled()));
    }
    const truth = ['object', 'drawing', 'drawing', 'object'];
    const reasons = [/Oikea pallo vie tilaa/, /Paperilla on silti piirros/, /eri asia kuin paperi/, /hieman paksuutta/];
    for (let i = 0; i < truth.length; i++) {
      if (i) await click(s, '[data-geo-next]');
      await click(s, `[data-geo-answer="${truth[i] === 'object' ? 'drawing' : 'object'}"]`);
      await textHas(s, '[data-geo-feedback]', /^Katso, mistä tehtävä puhuu/);
      await textHas(s, '[data-geo-feedback]', reasons[i]);
      await click(s, `[data-geo-answer="${truth[i]}"]`); await textHas(s, '[data-geo-feedback]', /^Näin on/);
    }
    // Preserve a naturally disabled control through shared pause/resume.
    await click(s, '[data-geo-step]'); await click(s, '[data-geo-step]');
  } else if (id === 'M-GEO-02') {
    const move = async direction => click(s, `[data-position-move="${direction}"]`);
    await move('up'); await textHas(s, '[data-position-feedback]', /reunassa/);
    await click(s, '[data-position-check]'); await textHas(s, '[data-position-feedback]', /eri hyllyllä/);
    await move('down'); await click(s, '[data-position-check]'); await textHas(s, '[data-position-feedback]', /vastakkaisella puolella/);
    await move('right'); await click(s, '[data-position-check]'); await textHas(s, '[data-position-feedback]', /laatikon kohdalla/);
    await move('right'); await click(s, '[data-position-check]'); await textHas(s, '[data-position-feedback]', /^Paikka sopii.*oikealla/);
    await textHas(s, '[data-position-scene] svg', /oikea/);
    const plans = [
      {moves: ['up', 'left'], wrong: /sivussa/, good: /ylempänä, suoraan/},
      {moves: ['left', 'down'], wrong: /eri hyllyllä/, good: /vasemmalla/},
      {moves: ['down', 'right'], wrong: /sivussa/, good: /alempana, suoraan/}
    ];
    for (const plan of plans) {
      await click(s, '[data-position-next]'); await click(s, '[data-position-check]');
      await textHas(s, '[data-position-feedback]', plan.wrong);
      for (const d of plan.moves) await move(d);
      await click(s, '[data-position-check]'); await textHas(s, '[data-position-feedback]', plan.good);
    }
    await click(s, '[data-position-next]'); await move('left');
    await click(s, '[data-position-check]'); await textHas(s, '[data-position-feedback]', /toisen kirjan kohdalla/);
    await move('right'); await click(s, '[data-position-check]'); await textHas(s, '[data-position-feedback]', /^Paikka sopii.*kirjojen välissä/);
    assert.match(await s.locator('[data-position-scene] svg').getAttribute('aria-label'), /keskellä, alahyllyllä/);
  } else if (id === 'M-DATA-03') {
    const row = async r => click(s, `[data-table-row="${r}"]`);
    const column = async c => click(s, `[data-table-column="${c}"]`);
    const cell = async (r, c) => click(s, `[data-table-cell="${r},${c}"]`);
    const good = async value => textHas(s, '[data-table-feedback]', new RegExp(`^Löytyi:.*Risteyksessä on ${value}`));
    assert.equal(await s.locator('th[scope="row"]').count(), 2);
    assert.equal(await s.locator('th[scope="col"]').count(), 3);
    await cell(1, 1); await textHas(s, '[data-table-feedback]', /Merkitse myös rivin ja sarakkeen/);
    await column(1); await row(0); await cell(0, 1); await textHas(s, '[data-table-feedback]', /Kysymys koskee riviä Loikka/);
    await row(1); await column(0); await cell(1, 0); await textHas(s, '[data-table-feedback]', /Sarake Juoma kertoo eri tiedon/);
    await column(1); await cell(0, 1); await textHas(s, '[data-table-feedback]', /juuri niiden risteys/);
    await cell(1, 1); await good('Leipä');
    assert.equal(await s.locator('td strong').innerText(), 'Leipä');
    await click(s, '[data-table-next]');
    assert.equal(await s.locator('button[aria-pressed="true"]').count(), 0);
    await row(0); await column(0); await cell(1, 0); // Both answers read Vesi.
    await textHas(s, '[data-table-feedback]', /juuri niiden risteys/);
    await cell(0, 0); await good('Vesi');
    await click(s, '[data-table-next]');
    await column(1); await row(0); await cell(0, 1); await good('Reppu');
    await textHas(s, '[data-table-surface]', /ennen retkeä ja retken jälkeen/);
    await click(s, '[data-table-next]'); await row(1); await column(0); await cell(1, 0); await good('Kori');
    await click(s, '[data-table-clear]');
    assert.equal(await s.locator('button[aria-pressed="true"]').count(), 0);
    await textHas(s, '[data-table-question]', /pelin paikka ennen retkeä/);
  }
}

async function initialState(id, s) {
  if (id === 'M-FRAC-01') {
    await textHas(s, '[data-frac-instruction]', /kahteen/);
    assert.equal(await s.locator('[aria-pressed="true"]').count(), 0);
    assert.equal(await s.locator('[data-frac-compare] svg').count(), 0);
  } else if (id === 'M-GEO-01') {
    await textHas(s, '[data-geo-caption]', /kuutiota/);
    await textHas(s, '[data-geo-question]', /^Pidät oikeaa palloa/);
    assert(!(await s.locator('[data-geo-step]').isDisabled()));
  } else if (id === 'M-GEO-02') {
    await textHas(s, '[data-position-goal]', /laatikon oikealle/);
    assert.match(await s.locator('[data-position-scene] svg').getAttribute('aria-label'), /vasemmalla, ylähyllyllä/);
  } else {
    await textHas(s, '[data-table-question]', /Loikan eväs/);
    assert.equal(await s.locator('[aria-pressed="true"]').count(), 0);
  }
}

async function lifecycle(page, id, s) {
  const tools = page.locator('[data-lesson-module]');
  const details = tools.locator('details.module-tools');
  if (await details.getAttribute('open') === null) await details.locator('summary').click();
  const action = name => tools.locator(`[data-module-action="${name}"]`);
  const trigger = s.locator(id === 'M-FRAC-01' ? '[data-frac-cut="2"]' : id === 'M-GEO-01' ? '[data-geo-next]' : id === 'M-GEO-02' ? '[data-position-move="left"]' : '[data-table-next]');
  const disabledBefore = await s.locator('button').evaluateAll(bs => bs.map(b => b.disabled));
  await action('pause').click();
  assert(await s.locator('button').evaluateAll(bs => bs.every(b => b.disabled)));
  const paused = await s.innerHTML();
  await trigger.dispatchEvent('click'); // Also falsify the module's own paused guard.
  assert.equal(await s.innerHTML(), paused, 'direct dispatched click must not mutate a paused module');
  // Deterministic DOM visibility events exercise loader policy; no claim of OS tab testing.
  const visibility = await page.evaluate(selector => {
    const previous = Object.getOwnPropertyDescriptor(document, 'hidden');
    let hidden = true;
    Object.defineProperty(document, 'hidden', {configurable: true, get: () => hidden});
    try {
      document.dispatchEvent(new Event('visibilitychange'));
      const hiddenDisabled = [...document.querySelectorAll(`${selector} button`)].every(b => b.disabled);
      hidden = false; document.dispatchEvent(new Event('visibilitychange'));
      return {hiddenDisabled, visibleDisabled: [...document.querySelectorAll(`${selector} button`)].every(b => b.disabled), status: document.querySelector('[data-module-status]').textContent};
    } finally {
      if (previous) Object.defineProperty(document, 'hidden', previous);
      else delete document.hidden;
    }
  }, `#lesson-body ${selectors[ids.indexOf(id)]}`);
  assert.deepEqual(visibility, {hiddenDisabled: true, visibleDisabled: true, status: 'Keskeytetty'}, 'manual pause survives visibility transitions');
  assert.equal(await s.innerHTML(), paused);
  await action('resume').click();
  assert.deepEqual(await s.locator('button').evaluateAll(bs => bs.map(b => b.disabled)), disabledBefore, 'restore original disabled states, including completed step control');
  const resumed = await s.innerHTML(); await trigger.click();
  assert.notEqual(await s.innerHTML(), resumed, 'resume restores actual interaction');
  await action('pause').click(); await action('reset').click();
  assert(await s.locator('button').evaluateAll(bs => bs.every(b => b.disabled)), 'reset while paused freezes freshly rendered controls');
  const resetPaused = await s.innerHTML(); await trigger.dispatchEvent('click');
  assert.equal(await s.innerHTML(), resetPaused);
  await action('reset').click(); assert.equal(await s.innerHTML(), resetPaused, 'paused reset is repeatable');
  await action('resume').click(); await initialState(id, s);
  await action('reset').click(); await initialState(id, s);
}

async function figures(page, id) {
  if (id === 'M-FRAC-01') {
    const response = await page.request.get(`${base}content/${id}/equal-parts.svg`);
    assert(response.ok());
    const rectangles = await page.evaluate(svg => [...new DOMParser().parseFromString(svg, 'image/svg+xml').querySelectorAll('rect')].map(r => [Number(r.getAttribute('width')), Number(r.getAttribute('height'))]), await response.text());
    assert.equal(rectangles.length, 3);
    assert.deepEqual(rectangles[0], rectangles[1], 'same whole must retain both dimensions before and after cutting (B02-SPATIAL-01)');
    assert.deepEqual(rectangles[0], rectangles[2]);
  } else if (id === 'M-GEO-01') {
    const alt = await page.locator('[data-geo-figure] img').getAttribute('alt');
    assert.doesNotMatch(alt, /Oikealla on piirros tölkistä/, 'SVG puts cube/neliö above can/ympyrä, not in left/right pairs (B02-SPATIAL-02)');
    assert.match(alt, /Kaikki ovat ruudulla kuvia/);
  } else if (id === 'M-GEO-02') {
    assert.match(await page.locator('#lesson-body').innerText(), /Katselupaikka ei vaihdu/);
  } else {
    assert.match(await page.locator('[data-table-figure] img').getAttribute('alt'), /Loikan rivi.*vaakaan.*Eväs-sarake pystyyn.*Leipä/);
  }
}

// Run all independent groups even if a figure assertion fails.
async function check(id, viewport, name, fn) {
  try { await fn(); results.push({kcId: id, viewport, check: name, status: 'PASS', revision: initialRevisions[id]}); }
  catch (e) { results.push({kcId: id, viewport, check: name, status: 'FAIL', revision: initialRevisions[id], error: e.message}); }
}

try {
  for (const width of [390, 1280]) {
    const context = await browser.newContext({viewport: {width, height: 900}});
    const page = await context.newPage();
    page.on('pageerror', e => errors.push({width, url: page.url(), message: e.message}));
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]; let s;
      const beforeErrors = errors.length;
      const ready = await (async () => {
        try {
          await page.goto(`${base}lessons/${id}.html?mode=presentation`);
          assert.equal(await page.locator('main').getAttribute('data-kc'), id);
          assert.equal(await page.locator('article[data-content-revision]').getAttribute('data-content-revision'), initialRevisions[id], 'integrated page must match current source revision');
          await page.waitForFunction(() => /Harjoitus käytettävissä|Voit jatkaa|Moduulivirhe/.test(document.querySelector('[data-module-status]')?.textContent ?? ''));
          assert.doesNotMatch(await page.locator('[data-module-status]').innerText(), /Moduulivirhe/);
          s = page.locator(`#lesson-body ${selectors[i]}`); await s.waitFor({state: 'visible'});
          return true;
        } catch (e) { results.push({kcId: id, viewport: width, check: 'integrated-source-and-mount', status: 'FAIL', revision: initialRevisions[id], error: e.message}); return false; }
      })();
      if (!ready) continue;
      await check(id, width, 'figure-and-wording-semantics', () => figures(page, id));
      await check(id, width, 'actual-positive-negative-practice', () => practice(id, s));
      await check(id, width, 'pause-reset-resume-visibility', () => lifecycle(page, id, s));
      await check(id, width, 'asset-bytes-and-responsive-layout', async () => {
        await page.evaluate(async () => Promise.all([...document.querySelectorAll('#lesson-body img')].map(im => im.decode())));
        assert(await page.locator('#lesson-body img').evaluateAll(es => es.length > 0 && es.every(im => im.naturalWidth > 0)));
        const p = JSON.parse(fs.readFileSync(new URL(`packages/${id}/lesson.json`, root), 'utf8'));
        for (const a of p.assets) {
          const url = `${base}${a.path.startsWith('shared/') ? a.path : `content/${id}/${a.path}`}`;
          const response = await page.request.get(url); assert(response.ok(), url);
          assert.equal(sha(await response.body()), a.sha256, `served asset bytes ${url}`);
        }
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no horizontal document overflow');
        assert.equal(errors.length, beforeErrors, 'no page errors');
        assert.equal(sourceRevision(id), initialRevisions[id], 'source stayed stable during tests');
      });
    }
    await context.close();
  }
} finally { await browser.close(); }
for (const id of ids) await check(id, null, 'source-stable-through-whole-run', async () => assert.equal(sourceRevision(id), initialRevisions[id]));
const failed = results.some(r => r.status === 'FAIL') || errors.length > 0;
console.log(JSON.stringify({kind: 'independent_synthetic_integrated_DOM_checks', status: failed ? 'FAIL' : 'PASS', base, testFileSha256: sha(fs.readFileSync(new URL(import.meta.url))), results, pageErrors: errors, limits: ['No build or package edits. Run by main after integration; this file does not attest to its own execution.', 'No human review, learner observations, mastery, retention, physical investigation, data-collection, or release certification.', 'Different-shape equal-area partitions are a source-review scope limitation, outside this strip-only practice.']}, null, 2));
if (failed) process.exitCode = 1;
