/* global document,window,innerWidth */
// Author QA, not an independent review. No build or package writes.
// Default: source composition + actual source loader, fulfilled in memory.
// After main builds: LESSON_PREVIEW_URL=http://127.0.0.1:4191/site/lessons/M-ADD-01.html node <this-file>
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {digest, composePackage} from '../../content.mjs';
import {scenarios, sumParts} from './lesson.mjs';

const dir = new URL('./', import.meta.url), root = new URL('../../', import.meta.url);
const p = JSON.parse(fs.readFileSync(new URL('lesson.json', dir)));
const body = fs.readFileSync(new URL(p.body, dir), 'utf8'), source = fs.readFileSync(new URL(p.module, dir), 'utf8');
const revision = p.revision + '@' + digest(JSON.stringify({...p, reviews: undefined}) + body + source + p.assets.map(a => a.sha256).join(''));
const sourceFiles = Object.fromEntries(fs.readdirSync(dir).filter(f => fs.statSync(new URL(f, dir)).isFile()).map(f => [f, digest(fs.readFileSync(new URL(f, dir)))]));
for (const a of p.assets) assert.equal(digest(fs.readFileSync(new URL(a.path, a.path.startsWith('shared/') ? root : dir))), a.sha256);
const target = process.env.LESSON_PREVIEW_URL ?? 'https://add-source.invalid/lessons/M-ADD-01.html';
const isolated = !process.env.LESSON_PREVIEW_URL;
const output = process.env.LESSON_QA_OUTPUT ?? fs.mkdtempSync(path.join(os.tmpdir(), 'sammakko-B05-ADD01-QA-'));
fs.mkdirSync(output, {recursive: true});
const pkg = {metadata: {...p, contentRevision: revision}, body, module: source, assets: p.assets.map(a => ({...a, bytes: fs.readFileSync(new URL(a.path, a.path.startsWith('shared/') ? root : dir))}))};
async function setup(page) {
  if (!isolated) return;
  await page.route('https://add-source.invalid/**', route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/lessons/M-ADD-01.html') return route.fulfill({contentType: 'text/html; charset=utf-8', body: '<!doctype html><html lang="fi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/assets/shell.css"><main><h1>Yhteenlasku kahden määrän yhdistämisenä</h1><section class="lesson" id="lesson-body">' + composePackage(pkg, 'M-ADD-01') + '</section></main><script src="/assets/lesson-loader.js"></script></html>'});
    if (url.pathname === '/content/M-ADD-01/lesson.mjs') return route.fulfill({contentType: 'text/javascript; charset=utf-8', body: source});
    if (url.pathname === '/content/M-ADD-01/joining.svg') return route.fulfill({contentType: 'image/svg+xml', body: fs.readFileSync(new URL('joining.svg', dir))});
    if (url.pathname.startsWith('/shared/') || ['/assets/shell.css', '/assets/lesson-loader.js'].includes(url.pathname)) return route.fulfill({path: new URL(url.pathname.slice(1), root).pathname});
    return route.fulfill({status: 404, body: ''});
  });
}
const browser = await chromium.launch({headless: true}), results = [], errors = [];
try {
  for (const width of [320, 390, 1280]) {
    const page = await browser.newPage({viewport: {width, height: 900}}); page.on('pageerror', e => errors.push(e.message)); await setup(page); await page.goto(target);
    assert.equal(await page.locator('[data-content-revision]').getAttribute('data-content-revision'), revision);
    await page.waitForFunction(() => !!document.querySelector('[data-add-total]'));
    const lab = page.locator('[data-add-lab]'), select = lab.locator('[data-add-case]'), totalInput = lab.locator('[data-add-total]'), feedback = lab.locator('[data-add-feedback]'), sentenceFeedback = lab.locator('[data-add-sentence-feedback]');
    const action = name => lab.locator('[data-add-action="' + name + '"]'); let neutralChecks = 0, steps = 0, swaps = 0;
    const neutral = async e => { assert.equal(await e.textContent(), 'Vastaus muuttui. Tarkista uusi vastaus, kun haluat.'); assert.equal(await e.getAttribute('data-result'), null); neutralChecks++; };
    const checkPieces = async (total, joined) => { assert.equal(await lab.locator('[data-piece]').count(), total); assert.equal(await lab.locator('[data-piece][data-joined="true"]').count(), joined); };
    for (let index = 0; index < scenarios.length; index++) {
      await select.selectOption(String(index)); const parts = scenarios[index].parts, total = sumParts(parts); await checkPieces(total, 0);
      assert.equal(await totalInput.inputValue(), ''); assert.equal(await feedback.getAttribute('data-result'), null);
      await totalInput.fill(String(total)); await action('check').focus(); await page.keyboard.press('Enter'); assert.equal(await feedback.getAttribute('data-result'), 'correct');
      assert.equal(await lab.locator('[aria-pressed="true"]').count(), 0); await checkPieces(total, 0);
      await totalInput.fill(String(parts[0])); await neutral(feedback); await action('check').click(); assert.equal(await feedback.getAttribute('data-result'), 'retry'); assert.match(await feedback.textContent(), /vain yhden osan/);
      await totalInput.fill(String(total)); await neutral(feedback); await action('check').click(); assert.equal(await feedback.getAttribute('data-result'), 'correct');
      await totalInput.fill(''); await neutral(feedback); await action('check').click(); assert.match(await feedback.textContent(), /Kirjoita koko määrä/);
      await totalInput.fill('1.5'); await neutral(feedback); await action('check').click(); assert.match(await feedback.textContent(), /kokonainen määrä/);
      await totalInput.fill(String(total)); await neutral(feedback); await action('check').click();
      const correct = await feedback.textContent();
      for (let n = 1; n <= total; n++) { await action('step').click(); await checkPieces(total, n); assert.equal(await feedback.textContent(), correct); steps++; }
      assert.equal(await action('step').isDisabled(), true); await action('rewind').click(); await checkPieces(total, 0); assert.equal(await feedback.textContent(), correct);
      if (!await action('mark').first().isVisible()) await lab.getByText('Laskemisapu, jos haluat', {exact: true}).click();
      await action('mark').first().focus(); await page.keyboard.press('Enter'); assert.equal(await lab.locator('[aria-pressed="true"]').count(), 1);
      assert.equal(await page.evaluate(() => document.activeElement.dataset.addPiece), '0', 'mark rebuild preserves initiating keyboard focus');
      await page.keyboard.press('Tab'); assert.equal(await page.evaluate(() => document.activeElement.dataset.addPiece), '1', 'Tab continues to the next helper');
      await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Enter'); assert.equal(await lab.locator('[aria-pressed="true"]').count(), 0); assert.equal(await page.evaluate(() => document.activeElement.dataset.addPiece), '0');
      // An unfocused activation may change an optional mark, but cannot steal focus.
      await totalInput.focus(); await action('mark').nth(1).evaluate(e => e.click()); assert.equal(await totalInput.evaluate(e => e === document.activeElement), true); await action('mark').nth(1).evaluate(e => e.click()); assert.equal(await totalInput.evaluate(e => e === document.activeElement), true);
      assert.equal(await lab.locator('[aria-pressed="true"]').count(), 0); assert.equal(await feedback.textContent(), correct);
      if (!await action('sentence-check').isVisible()) await lab.getByText('Lisäksi: täydennä lasku', {exact: true}).click();
      const operands = lab.locator('[data-add-operand]'), result = lab.locator('[data-add-result]'); const reversed = [...parts].reverse();
      for (let i = 0; i < parts.length; i++) await operands.nth(i).selectOption(String(reversed[i])); await result.fill(String(total)); await action('sentence-check').click(); assert.equal(await sentenceFeedback.getAttribute('data-result'), 'correct');
      const sentenceText = await sentenceFeedback.textContent(); await action('swap').click(); assert.equal(await sentenceFeedback.getAttribute('data-result'), 'correct'); assert.equal(await sentenceFeedback.textContent(), sentenceText); assert.deepEqual(await operands.evaluateAll(els => els.map(e => Number(e.value))), parts); swaps++;
      await operands.first().selectOption(String(parts[0] + 1)); await neutral(sentenceFeedback); await action('sentence-check').click(); assert.equal(await sentenceFeedback.getAttribute('data-result'), 'retry');
      await operands.first().selectOption(String(parts[0])); await neutral(sentenceFeedback); await action('sentence-check').click(); assert.equal(await sentenceFeedback.getAttribute('data-result'), 'correct');
      await result.fill(''); await neutral(sentenceFeedback); await action('sentence-check').click(); assert.match(await sentenceFeedback.textContent(), /Täytä/); await result.fill(String(total)); await neutral(sentenceFeedback); await action('sentence-check').click(); assert.equal(await sentenceFeedback.getAttribute('data-result'), 'correct'); assert.equal(await feedback.textContent(), correct);
    }
    // Actual native RAF: stop, pause, reset, repeat and natural completion.
    await select.selectOption('1'); await action('play').click(); await page.waitForFunction(() => document.querySelectorAll('[data-add-view] [data-joined="true"]').length >= 1); await action('stop').click();
    const frozen = await lab.locator('[data-add-view]').innerHTML(); await page.waitForTimeout(100); assert.equal(await lab.locator('[data-add-view]').innerHTML(), frozen);
    const tools = page.locator('[data-lesson-module] .module-tools'); if (await tools.count() && await tools.getAttribute('open') === null) await tools.locator('summary').click();
    const paused = async () => { for (const e of await lab.locator('button,input,select').all()) assert.equal(await e.isDisabled(), true); };
    await page.locator('[data-module-action="pause"]').click(); await paused();
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', {configurable: true, value: true}); document.dispatchEvent(new Event('visibilitychange')); Object.defineProperty(document, 'hidden', {configurable: true, value: false}); document.dispatchEvent(new Event('visibilitychange')); }); await paused();
    await page.locator('[data-module-action="reset"]').click(); await paused(); await page.locator('[data-module-action="resume"]').click(); assert.equal(await select.isDisabled(), false); await checkPieces(5, 0); assert.equal(await totalInput.inputValue(), '');
    await select.selectOption('1'); await action('play').click(); await page.waitForFunction(() => document.querySelectorAll('[data-add-view] [data-joined="true"]').length === 4, null, {timeout: 9000}); await checkPieces(4, 4); assert.equal(await action('step').isDisabled(), true); assert.equal(await action('stop').isDisabled(), true);
    await action('rewind').click(); await totalInput.fill('4'); await action('check').click();
    // Programmatic changes while paused cannot retain a checked verdict on resume.
    await page.locator('[data-module-action="pause"]').click(); await totalInput.evaluate(e => { e.value = '3'; }); await page.locator('[data-module-action="resume"]').click(); await neutral(feedback); await action('check').click(); assert.equal(await feedback.getAttribute('data-result'), 'retry');
    await totalInput.fill('4'); await action('check').click(); assert.equal(await feedback.getAttribute('data-result'), 'correct');
    for (const image of await page.locator('.lesson-intro img').all()) assert.equal(await image.evaluate(e => e.complete && e.naturalWidth > 0), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({path: path.join(output, 'ADD01-' + width + '.png'), fullPage: true});
    if (isolated) {
      await page.evaluate(async () => { const host = document.querySelector('[data-lesson-module]'), m = await import(new URL(host.dataset.lessonModule, window.location.href)); const old = m.mount(host), current = m.mount(host); old.dispose(); window.testApi = current; });
      assert.equal(await lab.locator('[data-add-total]').count(), 1); await action('step').click(); await checkPieces(5, 1);
      await page.evaluate(() => { window.testApi.pause(); window.testApi.reset(); }); await paused(); await page.evaluate(() => window.testApi.resume()); await checkPieces(5, 0); await page.evaluate(() => { window.testApi.dispose(); window.testApi.dispose(); window.testApi.reset(); window.testApi.resume(); }); assert.equal(await lab.textContent(), '');
    } else { await page.evaluate(() => window.dispatchEvent(new Event('pagehide'))); assert.equal(await lab.textContent(), ''); }
    results.push({width, status: 'PASS', neutralChecks, steps, swaps, nativePlaybackAndLifecycle: 'PASS'}); await page.close();
  }
  const context = await browser.newContext({javaScriptEnabled: false}), page = await context.newPage(); await setup(page); await page.goto(target); assert.match(await page.locator('[data-add-lab]').textContent(), /Ilman liikkuvaa kuvaa/); assert.equal(await page.locator('[data-add-total]').count(), 0); await context.close();
} finally { await browser.close(); }
assert.deepEqual(errors, []);
for (const [file, hash] of Object.entries(sourceFiles)) assert.equal(digest(fs.readFileSync(new URL(file, dir))), hash, 'source unchanged: ' + file);
const result = {kind: 'author_QA_not_independent_review',revision, mode: isolated ? 'isolated_composed_source_with_actual_loader' : 'integrated_site',status: 'PASS',results,noJS: 'PASS',errors,sourceFiles,output,limits: ['No build/source changes', 'No human/child review or mastery/effectiveness claim', 'Independent review pending another agent']};
fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify(result, null, 2) + '\n', {flag: 'wx'}); console.log(JSON.stringify(result, null, 2));
