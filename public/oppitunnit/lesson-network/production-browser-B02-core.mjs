/* global document */
// Independent B02 semantic interaction checks. Run after main integrates/builds.
// Does not build, mutate packages, write receipts/screenshots, or test other KCs.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const root = new URL('./', import.meta.url);
const base = 'http://127.0.0.1:4191/site/';
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const results = [], errors = [];
const browser = await chromium.launch({headless: true});
const page = await browser.newPage({viewport: {width: 390, height: 900}});
page.on('pageerror', error => errors.push(error.message));

function revision(id) {
  const dir = new URL(`packages/${id}/`, root);
  const p = JSON.parse(fs.readFileSync(new URL('lesson.json', dir), 'utf8'));
  for (const asset of p.assets) {
    const url = new URL(asset.path, asset.path.startsWith('shared/') ? root : dir);
    assert.equal(sha(fs.readFileSync(url)), asset.sha256, `${id}: actual asset hash`);
  }
  const body = fs.readFileSync(new URL(p.body, dir), 'utf8');
  const module = p.module ? fs.readFileSync(new URL(p.module, dir), 'utf8') : '';
  return `${p.revision}@${sha(JSON.stringify({...p, reviews: undefined}) + body + module + p.assets.map(a => a.sha256).join(''))}`;
}
async function lesson(id, selector, check) {
  const expectedRevision = revision(id);
  try {
    await page.goto(`${base}lessons/${id}.html?mode=presentation`);
    assert.equal(await page.locator('main').getAttribute('data-kc'), id);
    assert.equal(await page.locator('article[data-content-revision]').getAttribute('data-content-revision'), expectedRevision, `${id}: built page must match current source`);
    const scope = page.locator(`#lesson-body ${selector}`);
    await scope.waitFor({state: 'visible'});
    await page.waitForFunction(() => {
      const status = document.querySelector('[data-module-status]');
      return status && !status.textContent.includes('odottaa');
    });
    assert(!(await page.locator('[data-module-status]').textContent()).includes('Moduulivirhe'), `${id}: module mount`);
    await check(scope);
    assert.equal(revision(id), expectedRevision, `${id}: source changed during checks`);
    results.push({kcId: id, revision: expectedRevision, status: 'PASS'});
  } catch (error) {
    results.push({kcId: id, revision: expectedRevision, status: 'FAIL', error: error.message});
  }
}
const resultIs = async (scope, selector, expected) => assert.equal(await scope.locator(selector).getAttribute('data-result'), expected);
const textHas = async (scope, selector, expected) => assert.match(await scope.locator(selector).textContent(), expected);
const action = (scope, name) => scope.locator(`[data-action="${name}"]`);

try {
  await lesson('M-NUM-WORD-NUMERAL', '[data-source-lesson="M-NUM-WORD-NUMERAL"][data-module-ready="true"]', async s => {
    await action(s, 'check-pairs').click();
    await resultIs(s, '[data-feedback="pairs"]', 'retry');
    await s.locator('[data-slot="6"]').click();
    await textHas(s, '[data-feedback="pairs"]', /Valitse ensin sana/);
    const pair = async (word, slot) => {
      await s.locator(`[data-word="${word}"]`).click();
      await s.locator(`[data-slot="${slot}"]`).click();
    };
    await pair('kaksi', 2); await pair('yhdeksän', 6); await pair('kuusi', 9);
    await action(s, 'check-pairs').click();
    await resultIs(s, '[data-feedback="pairs"]', 'retry');
    await pair('kuusi', 6);
    assert.equal(await s.locator('[data-pair="9"]').textContent(), 'valitse sana', 'moving a word clears its old pairing');
    await pair('yhdeksän', 9); await action(s, 'check-pairs').click();
    await resultIs(s, '[data-feedback="pairs"]', 'correct');
    for (const [slot, word] of [[2, 'kaksi'], [6, 'kuusi'], [9, 'yhdeksän']]) assert.equal(await s.locator(`[data-pair="${slot}"]`).textContent(), word);
    await s.locator('[data-reverse="kuusi"]').click(); await resultIs(s, '[data-feedback="reverse"]', 'retry');
    await s.locator('[data-reverse="viisi"]').click(); await resultIs(s, '[data-feedback="reverse"]', 'correct');
    await action(s, 'clear').click();
    assert.deepEqual(await s.locator('[data-pair]').allTextContents(), ['valitse sana', 'valitse sana', 'valitse sana']);
  });

  await lesson('M-TH-01', '[data-source-lesson="M-TH-01"][data-module-ready="true"]', async s => {
    const cases = [
      {shape: 'same', color: 'different', size: 'same'},
      {shape: 'different', color: 'same', size: 'same'},
      {shape: 'same', color: 'same', size: 'different'}
    ];
    for (let i = 0; i < cases.length; i++) {
      if (i) await action(s, 'next').click();
      await action(s, 'check').click(); await resultIs(s, '[data-feedback]', 'retry');
      for (const [attribute, value] of Object.entries(cases[i])) {
        const answer = attribute === 'shape' ? (value === 'same' ? 'different' : 'same') : value;
        await s.locator(`[data-attribute="${attribute}"][data-value="${answer}"]`).click();
      }
      await action(s, 'check').click(); await resultIs(s, '[data-feedback]', 'retry');
      await s.locator(`[data-attribute="shape"][data-value="${cases[i].shape}"]`).click();
      await action(s, 'check').click(); await resultIs(s, '[data-feedback]', 'correct');
      assert.equal(await s.locator('[data-attribute][aria-pressed="true"]').count(), 3);
    }
  });

  await lesson('M-TH-02', '[data-source-lesson="M-TH-02"][data-module-ready="true"]', async s => {
    await action(s, 'check').click(); await resultIs(s, '[data-feedback]', 'retry');
    const striped = ['yes', 'no', 'no', 'yes', 'yes', 'no'];
    for (let i = 0; i < striped.length; i++) await s.locator(`[data-bin="${i === 0 ? 'no' : striped[i]}"]`).click();
    assert.equal(await s.locator('[data-return]').count(), 6, 'every item is actually placed in a visible group');
    await action(s, 'check').click(); await resultIs(s, '[data-feedback]', 'retry');
    await s.locator('[data-return="0"]').click(); await s.locator('[data-bin="yes"]').click();
    await action(s, 'check').click(); await resultIs(s, '[data-feedback]', 'correct');
    assert.deepEqual((await s.locator('[data-group="yes"] [data-return]').evaluateAll(es => es.map(e => +e.dataset.return))).sort(), [0, 3, 4]);
    await action(s, 'rule').click();
    assert.equal(await s.locator('[data-return]').count(), 0, 'new rule clears previous placements');
    await textHas(s, '[data-rule]', /pyöreät/);
    for (const bin of ['yes', 'no', 'yes', 'no', 'yes', 'no']) await s.locator(`[data-bin="${bin}"]`).click();
    await action(s, 'check').click(); await resultIs(s, '[data-feedback]', 'correct');
    assert.deepEqual((await s.locator('[data-group="yes"] [data-return]').evaluateAll(es => es.map(e => +e.dataset.return))).sort(), [0, 2, 4]);
  });

  await lesson('SCI-ENV-SAFE-01', '[data-safety-practice]', async s => {
    const card = key => s.locator(`[data-card="${key}"]`);
    await action(s, 'check').click(); await textHas(s, '[data-feedback]', /puuttuu/);
    await card('permission').click(); await action(s, 'check').click(); await textHas(s, '[data-feedback]', /järjestystä/);
    await action(s, 'clear').click(); await card('rush').click(); await action(s, 'check').click();
    await textHas(s, '[data-feedback]', /Ennen lupaa ei aloiteta/);
    await action(s, 'clear').click();
    for (const key of ['read', 'permission', 'place', 'look', 'return']) await card(key).click();
    assert.equal(await s.locator('[data-plan] li').count(), 5);
    await action(s, 'check').click(); await textHas(s, '[data-feedback]', /^Polku vastaa annettua ohjetta/);
    await textHas(s, '[data-feedback]', /Oikean työn luvan antaa oma aikuinen/);
    await action(s, 'scenario').click();
    await card('sweep').click(); await action(s, 'check').click(); await textHas(s, '[data-feedback]', /Sirpaleet siivoaa aikuinen/);
    await action(s, 'undo').click(); assert.equal(await s.locator('[data-plan] li').count(), 0);
    // Protective acts may be concurrent; no arbitrary single sequence is required.
    for (const plan of [['tell', 'stop', 'distance'], ['distance', 'tell', 'stop']]) {
      await action(s, 'clear').click();
      for (const key of plan) await card(key).click();
      await action(s, 'check').click(); await textHas(s, '[data-feedback]', /^Valitsit kaikki ohjeen teot/);
    }
  });

  await lesson('SCI-ENV-TOOL-01', '[data-tool-practice]', async s => {
    await action(s, 'check').click(); await textHas(s, '[data-feedback]', /Tehtävä pyytää kohtaa A/);
    await s.locator('[data-spot="A"]').click();
    await action(s, 'check').click(); await textHas(s, '[data-feedback]', /aivan lähellä/);
    assert(await action(s, 'closer').isDisabled());
    await action(s, 'farther').click();
    await action(s, 'check').click(); await textHas(s, '[data-feedback]', /^Nyt katsot pyydettyä kohtaa ja pisteet erottuvat/);
    // Same-target magnification must preserve dots, rather than create new ones.
    const readFeatures = async pattern => s.locator('[data-tool-scene] svg').evaluate((svg, name) => {
      const read = selector => {
        const group = svg.querySelector(selector);
        if (!group) throw new Error(`Missing rendered feature group: ${selector}`);
        const matrix = group.transform.baseVal.consolidate().matrix;
        return {a: matrix.a, b: matrix.b, c: matrix.c, d: matrix.d,
          features: [...group.querySelectorAll('[data-feature]')].map(e => ({tag: e.tagName, attributes: Object.fromEntries([...e.attributes].map(a => [a.name, a.value]))}))};
      };
      return {source: read(`[data-features="base-${name}"]`), zoom: read('[data-features="zoom"]')};
    }, pattern);
    const dots = await readFeatures('A');
    await action(s, 'farther').click(); assert(await action(s, 'farther').isDisabled());
    await action(s, 'check').click(); await textHas(s, '[data-feedback]', /sumea/);
    await action(s, 'closer').click();
    await action(s, 'target').click(); await textHas(s, '[data-task]', /kankaan kohtaa B/);
    await action(s, 'check').click(); await textHas(s, '[data-feedback]', /Tehtävä pyytää kohtaa B/);
    await s.locator('[data-spot="B"]').click(); await action(s, 'farther').click();
    await action(s, 'check').click(); await textHas(s, '[data-feedback]', /^Nyt katsot pyydettyä kohtaa ja langat erottuvat/);
    const threads = await readFeatures('B');
    for (const [name, views] of [['paper', dots], ['fabric', threads]]) {
      assert.equal(views.source.features.length, 4, `${name}: four target features`);
      assert.deepEqual(views.zoom.features, views.source.features, `${name}: same rendered features, including positions, radii/widths and colours`);
      assert.equal(views.zoom.a / views.source.a, 2.5, `${name}: horizontal magnification`);
      assert.equal(views.zoom.d / views.source.d, 2.5, `${name}: vertical magnification`);
      assert.equal(views.source.b, 0); assert.equal(views.source.c, 0);
      assert.equal(views.zoom.b, 0); assert.equal(views.zoom.c, 0);
    }
    assert.deepEqual(dots.source.features.map(e => e.attributes['data-feature']), ['dot', 'dot', 'dot', 'dot']);
    assert.deepEqual(threads.source.features.map(e => e.attributes['data-feature']), ['horizontal', 'horizontal', 'vertical', 'vertical']);
  });

  await lesson('M-DATA-01', '[data-collection-practice]', async s => {
    const item = id => s.locator(`[data-observation="${id}"]`);
    await action(s, 'check').click(); await textHas(s, '[data-feedback]', /Tietoa puuttuu/);
    await item('f-left').click(); await item('f-left').click();
    assert.equal(await s.locator('[data-records] li').count(), 0, 'second click removes the record, not a duplicate');
    await item('f-left').click(); await item('f-right').click();
    await action(s, 'check').click(); await textHas(s, '[data-feedback]', /puuttuu.*keltainen/);
    await item('f-yellow').click(); await item('can').click();
    await action(s, 'check').click(); await textHas(s, '[data-feedback]', /eri aiheesta.*kastelukannu/);
    await item('can').click(); await action(s, 'check').click();
    await textHas(s, '[data-feedback]', /^Lista vastaa kysymykseen tämän kuvan kukista/);
    assert.equal(await s.locator('[data-records] li').count(), 3);
    assert.deepEqual(await s.locator('[data-records] li').allTextContents(), ['Punainen kukka vasemmalla', 'Punainen kukka oikealla', 'Keltainen kukka keskellä']);
    await action(s, 'topic').click(); await textHas(s, '[data-topic]', /kiviä/);
    assert.equal(await s.locator('[data-records] li').count(), 0, 'different topic starts a separate record list');
    await item('s-grey').click(); await action(s, 'check').click(); await textHas(s, '[data-feedback]', /puuttuu.*ruskea/);
    await item('s-brown').click(); await action(s, 'check').click();
    await textHas(s, '[data-feedback]', /^Lista vastaa kysymykseen tämän kuvan kivistä/);
    await item('f-left').click(); await action(s, 'check').click(); await textHas(s, '[data-feedback]', /eri aiheesta.*kukka/);
    await action(s, 'clear').click(); assert.equal(await s.locator('[data-records] li').count(), 0);
  });
} finally {
  await browser.close();
}
const failed = results.some(r => r.status === 'FAIL') || errors.length > 0;
console.log(JSON.stringify({status: failed ? 'FAIL' : 'PASS', testFileSha256: sha(fs.readFileSync(new URL(import.meta.url))), base, results, pageErrors: errors, limits: ['Independent synthetic DOM checks only; no human/learner validation, physical safety compliance, or tool-handling certification. No build or package edits.']}, null, 2));
if (failed) process.exitCode = 1;
