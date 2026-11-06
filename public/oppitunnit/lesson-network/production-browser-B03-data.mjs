/* global document, innerWidth */
// Independent B03 DATA04/05/09 QA. Main runs AFTER integration and serving.
// No build, package edits, screenshots, saved receipts, or other-KC tests.
// stdout is synthetic technical evidence, never human/learner validation.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const root = new URL('./', import.meta.url);
const base = new URL(process.env.LESSON_TEST_URL ?? 'http://127.0.0.1:4191/site/');
assert(base.pathname.endsWith('/'), 'LESSON_TEST_URL must end at the site directory with /');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const expected = {
  'M-DATA-04': '2@e818b8d4b2fc6564ae2a513ab455763ffcdd5575ff5b69ea5357e38cea8f8c9f',
  'M-DATA-05': '1@1e6a3f82d2f2a5dac4441a4b0279d617e6231957014d09b50f2ccedf2af6015d',
  'M-DATA-09': '3@49cfedf3f441609587c76bbc7ecb7011b0bcc4ff66e993121a7936c77c87607a'
};
const roots = {
  'M-DATA-04': '[data-table-maker]',
  'M-DATA-05': '[data-table-reader]',
  'M-DATA-09': '[data-systematic-collection]'
};
const results = [], errors = [];

function revision(id) {
  const dir = new URL('packages/' + id + '/', root);
  const p = JSON.parse(fs.readFileSync(new URL('lesson.json', dir), 'utf8'));
  for (const a of p.assets) {
    assert.equal(sha(fs.readFileSync(new URL(a.path, a.path.startsWith('shared/') ? root : dir))), a.sha256, id + ': source asset hash');
  }
  return p.revision + '@' + sha(JSON.stringify({...p, reviews: undefined}) +
    fs.readFileSync(new URL(p.body, dir), 'utf8') +
    (p.module ? fs.readFileSync(new URL(p.module, dir), 'utf8') : '') +
    p.assets.map(a => a.sha256).join(''));
}
for (const id of Object.keys(expected)) assert.equal(revision(id), expected[id], id + ': reviewed source binding');

const action = (scope, name) => scope.locator('[data-action="' + name + '"]');
const feedback = async (scope, pattern) => assert.match(await scope.locator('[data-feedback]').textContent(), pattern);
const tableNeutral = 'Taulukkoa muutettiin. Tarkista muokattu taulukko uudelleen, kun haluat.';
const collectionNeutral = 'Suunnitelmaa tai havaintoluvun luonnosta muutettiin. Kirjaa mahdollinen havaintomuutos ja tarkista uudelleen, kun haluat.';
const neutralIs = async (scope, expectedText) => assert.equal(await scope.locator('[data-feedback]').textContent(), expectedText);
async function lifecycle(page, scope, afterReset) {
  const tools = page.locator('[data-lesson-module] .module-tools');
  if (await tools.count() && await tools.getAttribute('open') === null) await tools.locator('summary').click();
  const fieldset = scope.locator('fieldset[data-controls]');
  assert.equal(await fieldset.count(), 1, 'one native authored fieldset');
  const assertDisabledState = async (disabled, phase) => {
    // Playwright's disabled-state API targets interactive controls, not FIELDSET.
    // Check the native fieldset property AND effective child-control behavior.
    assert.equal(await fieldset.evaluate(element => element.disabled), disabled, phase + ': native fieldset.disabled');
    const native = scope.locator('button,input,select,textarea');
    assert((await native.count()) > 0, phase + ': child controls exist');
    for (let i = 0; i < await native.count(); i++) {
      assert.equal(await native.nth(i).isDisabled(), disabled, phase + ': effective disabled state of child ' + i);
    }
  };
  await page.locator('[data-module-action="pause"]').click();
  await assertDisabledState(true, 'pause');
  await page.locator('[data-module-action="reset"]').click();
  await assertDisabledState(true, 'reset while paused');
  await page.locator('[data-module-action="resume"]').click();
  await assertDisabledState(false, 'resume after reset');
  await afterReset();
}
async function fillRows(scope, values) {
  const rows = scope.locator('[data-maker-rows] tr');
  assert.equal(await rows.count(), values.length);
  for (let i = 0; i < values.length; i++) {
    await rows.nth(i).locator('[data-kind]').selectOption(values[i][0]);
    await rows.nth(i).locator('[data-value]').fill(values[i][1] === null ? '' : String(values[i][1]));
  }
}
async function maker(scope) {
  await action(scope, 'check').click(); await feedback(scope, /otsikko Tavara/);
  await scope.locator('[data-heading="kind"]').selectOption('colour');
  await scope.locator('[data-heading="count"]').selectOption('count');
  await action(scope, 'check').click(); await feedback(scope, /otsikko Tavara/);
  await scope.locator('[data-heading="kind"]').selectOption('kind');
  await scope.locator('[data-heading="count"]').selectOption('length');
  await action(scope, 'check').click(); await feedback(scope, /otsikko Määrä/);
  await scope.locator('[data-heading="count"]').selectOption('count');
  await fillRows(scope, [['cards', 3], ['balls', 1], ['pencils', 3]]);
  await action(scope, 'check').click(); await feedback(scope, /Tarkista rivi Pallot/);
  await fillRows(scope, [['cards', 3], ['cards', 3], ['pencils', 1]]);
  await action(scope, 'check').click(); await feedback(scope, /Sama tavaralaji/);
  await fillRows(scope, [['pencils', 1], ['cards', 3], ['balls', 3]]);
  await action(scope, 'check').focus(); await action(scope, 'check').press('Enter');
  await feedback(scope, /^Taulukossa on sopivat otsikot/);
  // A changed answer cannot retain its previous checked pass, even if restored.
  const cardValue = scope.locator('[data-maker-rows] tr').nth(1).locator('[data-value]');
  await cardValue.fill('9'); await neutralIs(scope, tableNeutral);
  await action(scope, 'check').click(); await feedback(scope, /Tarkista rivi Kortit/);
  await cardValue.fill('3'); await neutralIs(scope, tableNeutral);
  await action(scope, 'check').click(); await feedback(scope, /^Taulukossa on sopivat otsikot/);
  await scope.locator('[data-heading="kind"]').selectOption('colour'); await neutralIs(scope, tableNeutral);
  await action(scope, 'check').click(); await feedback(scope, /otsikko Tavara/);
  await scope.locator('[data-heading="kind"]').selectOption('kind'); await neutralIs(scope, tableNeutral);
  await action(scope, 'check').click(); await feedback(scope, /^Taulukossa on sopivat otsikot/);
  const firstKind = scope.locator('[data-maker-rows] tr').first().locator('[data-kind]');
  await firstKind.selectOption('cards'); await neutralIs(scope, tableNeutral);
  await action(scope, 'check').click(); await feedback(scope, /Sama tavaralaji/);
  await firstKind.selectOption('pencils'); await neutralIs(scope, tableNeutral);
  await action(scope, 'check').click(); await feedback(scope, /^Taulukossa on sopivat otsikot/);
  const checkedBeforeReverse = await scope.locator('[data-feedback]').textContent();
  const before = await scope.locator('[data-maker-rows] tr').evaluateAll(rows =>
    rows.map(row => [row.querySelector('[data-kind]').value, row.querySelector('[data-value]').value]));
  await action(scope, 'reverse').click();
  const after = await scope.locator('[data-maker-rows] tr').evaluateAll(rows =>
    rows.map(row => [row.querySelector('[data-kind]').value, row.querySelector('[data-value]').value]));
  assert.deepEqual(after, before.reverse(), 'reversal keeps names and values paired');
  assert.equal(await scope.locator('[data-feedback]').textContent(), checkedBeforeReverse, 'equivalent row order preserves checked meaning');
  assert.deepEqual(await scope.locator('[data-maker-rows] tr th').evaluateAll(cells => cells.map(c => c.scope)), ['row', 'row', 'row']);
  await action(scope, 'check').click(); await feedback(scope, /^Taulukossa on sopivat otsikot/);
  await action(scope, 'source').click();
  assert.equal(await scope.locator('[data-heading="kind"]').inputValue(), '');
  await scope.locator('[data-heading="kind"]').selectOption('kind');
  await scope.locator('[data-heading="count"]').selectOption('count');
  await fillRows(scope, [['cards', 2], ['balls', null], ['pencils', 4]]);
  await action(scope, 'check').click(); await feedback(scope, /Tyhjä ruutu ei ole sama kuin 0/);
  await scope.locator('[data-maker-rows] tr').nth(1).locator('[data-value]').fill('0');
  await action(scope, 'check').click(); await feedback(scope, /^Taulukossa on sopivat otsikot/);
}
async function reader(scope) {
  assert.deepEqual(await scope.locator('[data-reader-table] thead th').allTextContents(), ['Tavara', 'Määrä']);
  assert.match(await scope.locator('[data-question]').textContent(), /Rasiat/);
  // Optional tracing is never made a condition for a valid literal answer.
  await scope.locator('[data-answer="2"]').click(); await feedback(scope, /^Kyllä.*Rasiat/);
  await scope.locator('[data-answer="4"]').click(); await feedback(scope, /kuuluu riville Vesipullot/);
  await scope.locator('[data-row="bottles"]').click();
  assert.equal(await scope.locator('[data-row="bottles"]').getAttribute('aria-pressed'), 'true');
  await scope.locator('[data-answer="2"]').click(); await feedback(scope, /^Kyllä.*Rasiat/);
  await action(scope, 'reverse').click();
  assert.deepEqual(await scope.locator('[data-reader-table] tbody tr').evaluateAll(rows =>
    rows.map(r => [r.dataset.rowKey, r.querySelector('button').textContent, r.querySelector('td').textContent])),
  [['spoons', 'Lusikat', '0'], ['boxes', 'Rasiat', '2'], ['bottles', 'Vesipullot', '4']]);
  await scope.locator('[data-answer="2"]').click(); await feedback(scope, /^Kyllä.*Rasiat/);
  await action(scope, 'question').click(); assert.match(await scope.locator('[data-question]').textContent(), /Lusikat/);
  await scope.locator('[data-answer="unknown"]').click(); await feedback(scope, /kirjattu määrä/);
  await scope.locator('[data-answer="0"]').click(); await feedback(scope, /^Kyllä.*Lusikat/);
  await action(scope, 'table').click(); assert.match(await scope.locator('[data-question]').textContent(), /Kansiot/);
  await scope.locator('[data-answer="0"]').click(); await feedback(scope, /Tyhjä tieto ei tarkoita nollaa/);
  await scope.locator('[data-answer="unknown"]').click(); await feedback(scope, /^Kyllä.*Ei kirjattu/);
  await action(scope, 'question').click(); assert.match(await scope.locator('[data-question]').textContent(), /Kirjat/);
  await scope.locator('[data-answer="3"]').click(); await feedback(scope, /^Kyllä.*Kirjat/);
  await action(scope, 'question').click(); assert.match(await scope.locator('[data-question]').textContent(), /Vihkot/);
  await scope.locator('[data-answer="3"]').focus(); await scope.locator('[data-answer="3"]').press('Enter');
  await feedback(scope, /^Kyllä.*Vihkot/);
}
async function plan(scope, area) {
  for (const [key, value] of Object.entries({area, when: 'before', visits: 'all', record: 'each'})) {
    await scope.locator('[data-protocol="' + key + '"]').selectOption(value);
  }
}
async function record(scope, value) {
  await scope.locator('[data-observed-value]').fill(value === null ? '' : String(value));
  await action(scope, 'record').click();
}
async function notebook(scope) {
  await action(scope, 'protocol').click(); await feedback(scope, /Kysymys koskee rajattua työalustaa/);
  await plan(scope, 'desk'); await action(scope, 'protocol').click(); await feedback(scope, /rajattua työalustaa/);
  await plan(scope, 'mat'); await action(scope, 'protocol').click(); await feedback(scope, /^Suunnitelma vastaa/);
  // Each protocol response edit makes checked feedback neutral until rechecked.
  for (const [key, wrong, right, error] of [
    ['area', 'desk', 'mat', /rajattua työalustaa/],
    ['when', 'after', 'before', /ennen siivousta/],
    ['visits', 'one', 'all', /kolmea sovittua päivää/],
    ['record', 'max', 'each', /jokaisen kerran oma luku/]
  ]) {
    const select = scope.locator('[data-protocol="' + key + '"]');
    await select.selectOption(wrong); await neutralIs(scope, collectionNeutral);
    await action(scope, 'protocol').click(); await feedback(scope, error);
    await select.selectOption(right); await neutralIs(scope, collectionNeutral);
    await action(scope, 'protocol').click(); await feedback(scope, /^Suunnitelma vastaa/);
  }
  await action(scope, 'check').click(); await feedback(scope, /Kirjaus puuttuu.*Maanantai/);
  // Visit Wednesday first: the notebook must key by observation, not entry order.
  await action(scope, 'previous').click(); assert.match(await scope.locator('[data-visit-title]').textContent(), /Keskiviikko/);
  assert.equal(await scope.locator('[data-visit-picture] [data-area="mat"]').count(), 2);
  assert.equal(await scope.locator('[data-visit-picture] [data-area="outside"]').count(), 1);
  await record(scope, 1);
  await action(scope, 'next').click(); assert.match(await scope.locator('[data-visit-title]').textContent(), /Maanantai/);
  await record(scope, 3);
  await action(scope, 'next').click(); assert.match(await scope.locator('[data-visit-title]').textContent(), /Tiistai/);
  assert.equal(await scope.locator('[data-visit-picture] [data-area="mat"]').count(), 0);
  assert.equal(await scope.locator('[data-visit-picture] [data-area="outside"]').count(), 4);
  await record(scope, null); await feedback(scope, /Tyhjä ruutu ei ole nolla/);
  await action(scope, 'check').click(); await feedback(scope, /Kirjaus puuttuu.*Tiistai/);
  await record(scope, 0);
  await action(scope, 'check').click(); await feedback(scope, /Keskiviikko.*määrä on 2/);
  await action(scope, 'next').click(); await record(scope, 2); await feedback(scope, /Saman kerran kirjaus korjattiin/);
  assert.equal(await scope.locator('[data-notebook] tbody tr').count(), 3);
  await action(scope, 'check').click(); await feedback(scope, /^Vihkossa on jokaisen sovitun kerran oikea/);
  assert.deepEqual(await scope.locator('[data-notebook] tbody tr td:last-child').allTextContents(), ['3', '0', '2']);
  await scope.locator('[data-observed-value]').fill('9'); await neutralIs(scope, collectionNeutral);
  await scope.locator('[data-observed-value]').fill('2'); await neutralIs(scope, collectionNeutral);
  await action(scope, 'check').click(); await feedback(scope, /^Vihkossa on jokaisen sovitun kerran oikea/);
  await record(scope, 9);
  await action(scope, 'check').click(); await feedback(scope, /Keskiviikko.*määrä on 2/);
  await scope.locator('[data-observed-value]').fill('2'); await neutralIs(scope, collectionNeutral);
  await action(scope, 'record').click();
  await action(scope, 'check').click(); await feedback(scope, /^Vihkossa on jokaisen sovitun kerran oikea/);
  await action(scope, 'question').click();
  assert.equal(await scope.locator('[data-notebook] tbody tr').count(), 0);
  assert.match(await scope.locator('[data-study-question]').textContent(), /koko pöydällä/);
  await plan(scope, 'mat'); await action(scope, 'protocol').click(); await feedback(scope, /Kysymys koskee koko pöytää/);
  await plan(scope, 'desk');
  for (const [i, value] of [5, 4, 3].entries()) { if (i) await action(scope, 'next').click(); await record(scope, value); }
  await action(scope, 'check').click(); await feedback(scope, /^Vihkossa on jokaisen sovitun kerran oikea/);
  assert.deepEqual(await scope.locator('[data-notebook] tbody tr td:last-child').allTextContents(), ['5', '4', '3']);
  await scope.locator('[data-protocol="area"]').selectOption('mat'); await neutralIs(scope, collectionNeutral);
  await action(scope, 'check').click(); await feedback(scope, /Kysymys koskee koko pöytää/);
  await scope.locator('[data-protocol="area"]').selectOption('desk'); await neutralIs(scope, collectionNeutral);
  await action(scope, 'check').click(); await feedback(scope, /^Vihkossa on jokaisen sovitun kerran oikea/);
}

const browser = await chromium.launch({headless: true});
try {
  for (const width of [390, 1280]) for (const id of Object.keys(expected)) {
    const page = await browser.newPage({viewport: {width, height: 900}});
    page.on('pageerror', e => errors.push({id, width, message: e.message}));
    try {
      await page.goto(new URL('lessons/' + id + '.html?mode=presentation', base).href);
      assert.equal(await page.locator('main').getAttribute('data-kc'), id);
      assert.equal(await page.locator('article[data-content-revision]').getAttribute('data-content-revision'), expected[id], 'built page matches frozen source');
      const scope = page.locator('#lesson-body ' + roots[id]);
      await scope.locator('[data-controls]').waitFor({state: 'visible'});
      assert(!/odottaa|Moduulivirhe/.test(await page.locator('[data-module-status]').textContent()));
      await page.waitForFunction(() => [...document.querySelectorAll('#lesson-body img')].every(i => i.complete && i.naturalWidth > 0));
      await ({'M-DATA-04': maker, 'M-DATA-05': reader, 'M-DATA-09': notebook}[id])(scope);
      await lifecycle(page, scope, async () => {
        if (id === 'M-DATA-04') assert.equal(await scope.locator('[data-heading="kind"]').inputValue(), '');
        if (id === 'M-DATA-05') assert.match(await scope.locator('[data-question]').textContent(), /Rasiat/);
        if (id === 'M-DATA-09') assert.equal(await scope.locator('[data-notebook] tbody tr').count(), 0);
      });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no document overflow');
      const controlHeights = await scope.locator('button,input,select').evaluateAll(es =>
        es.filter(e => e.getClientRects().length).map(e => e.getBoundingClientRect().height));
      assert(controlHeights.every(h => h >= 44), 'visible native controls remain at least44px high');
      assert.equal(revision(id), expected[id], 'source unchanged during browser run');
      results.push({kcId: id, width, revision: expected[id], status: 'PASS'});
    } catch (e) { results.push({kcId: id, width, revision: expected[id], status: 'FAIL', error: e.message}); }
    finally { await page.close(); }
  }
  const context = await browser.newContext({javaScriptEnabled: false});
  try {
    const page = await context.newPage();
    for (const id of Object.keys(expected)) {
      try {
        await page.goto(new URL('lessons/' + id + '.html', base).href);
        const scope = page.locator('#lesson-body ' + roots[id]);
        assert.equal(await page.locator('article[data-content-revision]').getAttribute('data-content-revision'), expected[id]);
        assert((await scope.locator('h3').count()) >= 2, 'worked static examples survive without JavaScript');
        assert(await scope.locator('[data-controls]').isHidden(), 'inert practice does not masquerade as working');
        results.push({kcId: id, javaScript: false, revision: expected[id], status: 'PASS'});
      } catch (e) { results.push({kcId: id, javaScript: false, status: 'FAIL', error: e.message}); }
    }
  } finally { await context.close(); }
} finally { await browser.close(); }
const failed = results.some(r => r.status === 'FAIL') || errors.length > 0;
console.log(JSON.stringify({status: failed ? 'FAIL' : 'PASS', base: base.href,
  testFileSha256: sha(fs.readFileSync(new URL(import.meta.url))), expectedRevisions: expected,
  results, pageErrors: errors, limits: [
    'This file is not evidence of its own execution. Main must run after integration.',
    'Synthetic browser actions only; no human/child validation, mastery, retention or physical fieldwork certification.',
    'Optional DATA05 tracing is ungraded; numeric answers do not prove a lookup strategy.',
    'No build, authored-package mutation, screenshots, receipt writes or tests of other KCs.'
  ]}, null, 2));
if (failed) process.exitCode = 1;
