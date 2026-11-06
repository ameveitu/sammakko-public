// Warm-idle comparison: ?vp=static versus ?vp=on, using 30-second CDP deltas.
// Loading and navigation are excluded. Raw observations are retained for every run.
// Run without competing browser/build processes; this is local evidence, not a device benchmark.
// Usage: node tools/visual-polish/perf-idle.mjs --site .build/site --rounds 3 --pages home,map
// Optional: --executable /path/to/chrome --output .build/visual-polish/idle --window-ms 30000
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const filename = fileURLToPath(import.meta.url);
const directory = path.dirname(filename);
const root = path.resolve(directory, '../..');
const {chromium} = createRequire(path.join(root, 'lite/package.json'))('@playwright/test');
const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i >= 0 ? process.argv[i + 1] : fallback; };
const site = path.resolve(arg('site', path.join(root, '.build/site')));
const output = path.resolve(arg('output', path.join(root, '.build/visual-polish/idle')));
const executablePath = arg('executable', undefined);
const rounds = Number(arg('rounds', '3'));
const windowMs = Number(arg('window-ms', '30000'));
const settleMs = 3000;
const port = Number(arg('port', '5228'));
const pages = arg('pages', 'home,map').split(',');
const durationKeys = ['TaskDuration', 'ScriptDuration', 'LayoutDuration', 'RecalcStyleDuration', 'ThreadTime', 'ProcessTime'];
const countKeys = ['LayoutCount', 'RecalcStyleCount'];
const bindings = [
  ['public/kotisivu/assets/visual-polish/ambient.js', 'assets/visual-polish/ambient.js', 'edited-runtime'],
  ['public/kotisivu/assets/visual-polish/home.css', 'assets/visual-polish/home.css', 'edited-runtime'],
  ['lite/public/visual-polish/decor.js', 'lite/visual-polish/decor.js', 'edited-runtime'],
  ['lite/public/visual-polish/decor.css', 'lite/visual-polish/decor.css', 'edited-runtime'],
  ['public/kotisivu/assets/visual-polish/mode.js', 'assets/visual-polish/mode.js', 'unchanged-baseline'],
];
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const median = values => { const sorted = [...values].sort((a, b) => a - b), m = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2; };
const getMetrics = async cdp => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(metric => [metric.name, metric.value]));

function bindRuntime() {
  return bindings.map(([sourcePath, sitePath, role]) => {
    const source = fs.readFileSync(path.join(root, sourcePath));
    const served = fs.readFileSync(path.join(site, sitePath));
    const sourceSha256 = sha256(source), servedSha256 = sha256(served);
    assert.equal(servedSha256, sourceSha256, `Fixture must contain current source bytes: ${sitePath}`);
    return {sourcePath, sitePath, role, bytes: served.length, sha256: servedSha256, sourceSha256};
  });
}

function pageState() {
  const root = document.documentElement;
  const stage = document.querySelector('.vp-stage');
  const canvas = document.querySelector('.vp-sea canvas');
  const gl = canvas?.getContext('webgl');
  const program = gl?.getParameter(gl.CURRENT_PROGRAM);
  const debug = gl?.getExtension('WEBGL_debug_renderer_info');
  const glints = document.querySelector('#vp-decor .vp-glints-light');
  const glintStyle = glints ? getComputedStyle(glints) : null;
  const describeAnimation = animation => ({
    type: animation.constructor.name,
    name: animation.animationName ?? null,
    playState: animation.playState,
    currentTime: typeof animation.currentTime === 'number' ? animation.currentTime : null,
    target: animation.effect?.target?.id || animation.effect?.target?.className || null,
    pseudoElement: animation.effect?.pseudoElement ?? null,
  });
  return {
    visibility: document.visibilityState,
    vp: root.getAttribute('data-vp'),
    vpLite: root.getAttribute('data-vp-lite'),
    surface: root.getAttribute('data-vp-surface'),
    liteMotion: root.hasAttribute('data-vp-motion'),
    calm: root.classList.contains('calm-chars'),
    ambient: stage?.getAttribute('data-vp-ambient') ?? null,
    shader: gl ? {
      contextLost: gl.isContextLost(),
      width: gl.drawingBufferWidth,
      height: gl.drawingBufferHeight,
      renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : null,
      programLinked: !!program && gl.getProgramParameter(program, gl.LINK_STATUS),
      timeUniform: program ? gl.getUniform(program, gl.getUniformLocation(program, 't')) : null,
    } : null,
    glints: glints ? {
      animationName: glintStyle.animationName,
      transform: glintStyle.transform,
      opacity: glintStyle.opacity,
      animations: glints.getAnimations().map(describeAnimation),
    } : null,
    cssAnimations: document.getAnimations().map(describeAnimation),
  };
}

function requireMode(state, screen, mode) {
  assert.equal(state.visibility, 'visible');
  assert.equal(state.calm, false);
  assert.equal(screen === 'home' ? state.vp : state.vpLite, mode);
  if (screen === 'home') {
    assert.equal(state.ambient, mode === 'on' ? 'running' : 'static');
    if (mode === 'on') {
      assert(state.shader && state.shader.programLinked && !state.shader.contextLost, 'The actual water shader must be active');
      assert(state.shader.width > 10 && state.shader.height > 10);
      assert.equal(typeof state.shader.timeUniform, 'number');
    } else assert.equal(state.shader, null, 'Static mode must not leave an active shader');
  } else {
    assert.equal(state.surface, 'map');
    const actualGlints = state.glints?.animations.filter(animation => animation.name === 'vp-glint') ?? [];
    assert.equal(state.liteMotion, mode === 'on');
    if (mode === 'on') {
      assert.equal(state.glints?.animationName, 'vp-glint');
      assert.equal(actualGlints.length, 1, 'Animated map must have one actual vp-glint animation');
      assert.equal(actualGlints[0].playState, 'running');
      assert.equal(typeof actualGlints[0].currentTime, 'number');
    } else {
      assert.equal(actualGlints.length, 0, 'Static map must not run vp-glint');
      assert.equal(state.glints?.animationName, 'none');
    }
  }
}

async function main() {
  assert(Number.isInteger(rounds) && rounds >= 1 && rounds <= 5, '--rounds must be 1–5');
  assert(Number.isFinite(windowMs) && windowMs >= 1000 && windowMs <= 60000, '--window-ms must be 1000–60000');
  assert(pages.length && pages.every(page => ['home', 'map'].includes(page)) && new Set(pages).size === pages.length, '--pages must select home and/or map once each');
  fs.mkdirSync(output, {recursive: true});
  const runtimeFiles = bindRuntime();
  const fixtureRelease = JSON.parse(fs.readFileSync(path.join(site, 'release.json'), 'utf8'));
  const result = {
    schema: 'sammakko-visual-idle-review/1',
    startedAt: new Date().toISOString(),
    tool: {path: 'tools/visual-polish/perf-idle.mjs', sha256: sha256(fs.readFileSync(filename))},
    fixture: {
      name: path.basename(site),
      packagedSourceCommit: fixtureRelease.sourceCommit,
      runtimeFiles,
      releaseManifestMatchesMeasuredRuntime: runtimeFiles.every(file => fixtureRelease.files?.[file.sitePath]?.sha256 === file.sha256),
      note: 'packagedSourceCommit identifies the base artifact. Exact measured runtime bytes are the five SHA256 bindings; an overlaid fixture can intentionally differ from its release manifest.',
    },
    environment: {platform: process.platform, arch: process.arch, cpuModel: os.cpus()[0]?.model, logicalCpus: os.cpus().length, headless: true, executable: executablePath ? path.basename(executablePath) : 'Playwright default Chromium', viewport: {width: 1440, height: 960}, deviceScaleFactor: 1},
    method: {rounds, windowMs, settleMs, pages, modes: ['static', 'on'], ordering: 'static/on on odd rounds; on/static on even rounds', measurement: 'CDP metric difference across warm idle window; navigation, loading, preparation and state probes excluded'},
    notes: [
      'Local comparison only. CPU-rendered SwiftShader results are not physical GPU, phone, battery or production-device measurements.',
      'Performance samples contain no requestAnimationFrame or WebGL draw wrappers.',
      'Script, layout and style metrics overlap TaskDuration; do not add them to TaskDuration.',
      'No percentage budget is inferred from near-zero static values. Raw paired samples and absolute differences are retained.',
      'Functional motion activity is required. A fallback renderer does not count as an animated sample.',
    ],
    samples: [],
    performanceBudgetEvaluated: false,
  };
  const save = () => fs.writeFileSync(path.join(output, 'raw-samples.json'), JSON.stringify(result, null, 2) + '\n');
  let browser, server;
  try {
    server = spawn(process.execPath, [path.join(directory, 'serve.mjs'), site, String(port)], {stdio: ['ignore', 'pipe', 'pipe']});
    await new Promise((resolve, reject) => { server.stdout.once('data', resolve); server.once('error', reject); server.once('exit', code => reject(new Error(`Review server exited ${code}`))); server.stderr.on('data', data => process.stderr.write(data)); });
    browser = await chromium.launch({headless: true, ...(executablePath ? {executablePath} : {})});
    result.environment.browserVersion = browser.version();
    for (let round = 0; round < rounds; round++) {
      for (const screen of pages) {
        for (const mode of (round % 2 ? ['on', 'static'] : ['static', 'on'])) {
          const context = await browser.newContext({viewport: result.environment.viewport, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'no-preference'});
          try {
            const page = await context.newPage(), errors = [];
            page.on('pageerror', error => errors.push(error.message));
            const cdp = await context.newCDPSession(page);
            await cdp.send('Performance.enable');
            const route = screen === 'home' ? `/?vp=${mode}` : `/lite/?vp=${mode}#alueet`;
            await page.goto(`http://127.0.0.1:${port}${route}`, {waitUntil: 'networkidle'});
            if (screen === 'map') { await page.locator('.worlds button.world').first().click(); await page.locator('.wmap').waitFor(); }
            await page.waitForTimeout(settleMs);
            const beforeState = await page.evaluate(pageState);
            requireMode(beforeState, screen, mode);
            const before = await getMetrics(cdp), wallStart = performance.now();
            await page.waitForTimeout(windowMs);
            const after = await getMetrics(cdp), elapsedMs = performance.now() - wallStart;
            const afterState = await page.evaluate(pageState);
            requireMode(afterState, screen, mode);
            assert.deepEqual(errors, []);
            if (mode === 'on' && screen === 'home') assert(afterState.shader.timeUniform > beforeState.shader.timeUniform, 'Shader time must advance during the sample');
            if (mode === 'on' && screen === 'map') {
              const time = state => state.glints.animations.find(animation => animation.name === 'vp-glint').currentTime;
              assert(time(afterState) > time(beforeState), 'Actual glint animation time must advance during the sample');
            }
            const deltaMs = Object.fromEntries(durationKeys.map(key => { assert(Number.isFinite(before[key]) && Number.isFinite(after[key]), `Missing CDP metric ${key}`); return [key, 1000 * (after[key] - before[key])]; }));
            const deltaCounts = Object.fromEntries(countKeys.map(key => [key, after[key] - before[key]]));
            result.samples.push({round: round + 1, screen, mode, route, elapsedMs, before, after, deltaMs, deltaCounts, beforeState, afterState, heapBytesBefore: before.JSHeapUsedSize, heapBytesAfter: after.JSHeapUsedSize, errors});
            save();
            console.log(JSON.stringify({round: round + 1, screen, mode, elapsedMs, deltaMs, deltaCounts}));
          } finally { await context.close(); }
        }
      }
    }
    result.summary = pages.map(screen => {
      const modes = Object.fromEntries(['static', 'on'].map(mode => {
        const samples = result.samples.filter(sample => sample.screen === screen && sample.mode === mode);
        return [mode, {n: samples.length, medianDeltaMs: Object.fromEntries(durationKeys.map(key => [key, median(samples.map(sample => sample.deltaMs[key]))])), medianDeltaCounts: Object.fromEntries(countKeys.map(key => [key, median(samples.map(sample => sample.deltaCounts[key]))]))}];
      }));
      const pairedDifferencesMs = Array.from({length: rounds}, (_, index) => {
        const pair = result.samples.filter(sample => sample.screen === screen && sample.round === index + 1);
        const on = pair.find(sample => sample.mode === 'on'), fixed = pair.find(sample => sample.mode === 'static');
        return {round: index + 1, ...Object.fromEntries(durationKeys.map(key => [key, on.deltaMs[key] - fixed.deltaMs[key]]))};
      });
      return {screen, modes, pairedDifferencesMs, medianPairedDifferenceMs: Object.fromEntries(durationKeys.map(key => [key, median(pairedDifferencesMs.map(pair => pair[key]))]))};
    });
    assert.deepEqual(bindRuntime(), runtimeFiles, 'Measured runtime must not change during the run');
    result.runtimeUnchanged = true;
    result.valid = true;
  } catch (error) {
    result.valid = false;
    result.failure = String(error);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server) server.kill('SIGTERM');
    result.finishedAt = new Date().toISOString();
    save();
    console.log(JSON.stringify({valid: result.valid, failure: result.failure, summary: result.summary}, null, 2));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
