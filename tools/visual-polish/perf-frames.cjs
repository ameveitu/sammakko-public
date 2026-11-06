// Review-only bounded map tail probe: exactly two pairs, on/static then static/on.
// Usage: node tools/visual-polish/perf-frames.cjs --site .build/site --output result.json
// Optional: --executable /path/to/chrome --playwright-module /path/to/playwright/package
// Run on an otherwise idle host. This is not device, input-latency or compositor validation.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { createHash } = require('node:crypto');
const { createRequire } = require('node:module');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const arg = (name, fallback) => { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : fallback; };
const site = path.resolve(arg('site', path.join(root, '.build/site')));
const output = path.resolve(arg('output', path.join(root, '.build/visual-polish/review-frames-repeat.json')));
const executablePath = arg('executable', undefined);
const playwrightModule = arg('playwright-module', '@playwright/test');
const { chromium } = createRequire(path.join(root, 'lite/package.json'))(playwrightModule);
const port = Number(arg('port', '5261'));
const settleMs = 3000, sampleMs = 12000, seed = 0x5a5a1234;
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

function initProbe(initialSeed) {
  let s = initialSeed;
  Math.random = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const probe = window.__reviewFrameProbe = { frames: [], entries: {}, observerErrors: [],
    supportedEntryTypes: [...PerformanceObserver.supportedEntryTypes], startedAt: performance.now(), initialSeed };
  for (const type of ['longtask', 'long-animation-frame']) {
    probe.entries[type] = [];
    if (!probe.supportedEntryTypes.includes(type)) continue;
    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) probe.entries[type].push(entry.toJSON());
      });
      observer.observe({ type, buffered: true });
    } catch (error) { probe.observerErrors.push({ type, message: String(error) }); }
  }
  let previous = null;
  const frame = timestamp => {
    if (previous !== null) probe.frames.push({ startTime: previous, endTime: timestamp, duration: timestamp - previous });
    previous = timestamp;
    if (!probe.finished) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function pageState() {
  const root = document.documentElement, glints = document.querySelector('#vp-decor .vp-glints');
  const light = document.querySelector('#vp-decor .vp-glints-light');
  const style = light ? getComputedStyle(light) : null;
  return { visibility: document.visibilityState, route: location.hash, mode: root.getAttribute('data-vp-lite'),
    surface: root.getAttribute('data-vp-surface'), motion: root.hasAttribute('data-vp-motion'),
    calm: root.classList.contains('calm-chars'), reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    glintsDisplay: glints ? getComputedStyle(glints).display : null,
    glintsStyle: style ? { animationName: style.animationName, opacity: style.opacity, transform: style.transform } : null,
    animations: light ? light.getAnimations().map(a => ({ name: a.animationName ?? null, playState: a.playState,
      currentTime: typeof a.currentTime === 'number' ? a.currentTime : null })) : [],
    mapText: document.querySelector('.wmap')?.textContent ?? null };
}

function requireState(state, mode) {
  assert.equal(state.visibility, 'visible'); assert.equal(state.mode, mode); assert.equal(state.surface, 'map');
  assert.equal(state.calm, false); assert.equal(state.reducedMotion, false); assert.equal(state.motion, mode === 'on');
  assert.equal(state.glintsDisplay, mode === 'on' ? 'block' : 'none');
  const glint = state.animations.find(a => a.name === 'vp-glint');
  if (mode === 'on') assert.equal(glint?.playState, 'running'); else assert.equal(glint, undefined);
}

function percentile(values, p) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b), at = (sorted.length - 1) * p;
  const lo = Math.floor(at), hi = Math.ceil(at);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (at - lo);
}
function framesSummary(frames) {
  const durations = frames.map(f => f.duration);
  return { count: durations.length, p50Ms: percentile(durations, .5), p95Ms: percentile(durations, .95),
    p99Ms: percentile(durations, .99), maxMs: durations.length ? Math.max(...durations) : null,
    over33_4Ms: durations.filter(t => t > 33.4).length, over50Ms: durations.filter(t => t > 50).length };
}
function tasksSummary(entries) {
  return { count: entries.length, cumulativeDurationMs: entries.reduce((sum, e) => sum + e.duration, 0),
    maxDurationMs: entries.length ? Math.max(...entries.map(e => e.duration)) : null,
    cumulativeBlockingDurationMs: entries.some(e => 'blockingDuration' in e)
      ? entries.reduce((sum, e) => sum + (e.blockingDuration || 0), 0) : null };
}
function summarize(raw, start, end) {
  const startsInWindow = e => e.startTime >= start && e.startTime < end;
  return { startTime: start, endTime: end, elapsedMs: end - start,
    frames: framesSummary(raw.frames.filter(f => f.startTime >= start && f.endTime <= end)),
    longTasks: raw.supportedEntryTypes.includes('longtask') ? tasksSummary(raw.entries.longtask.filter(startsInWindow)) : null,
    longAnimationFrames: raw.supportedEntryTypes.includes('long-animation-frame')
      ? tasksSummary(raw.entries['long-animation-frame'].filter(startsInWindow)) : null,
    boundaryCrossingEntries: Object.fromEntries(Object.entries(raw.entries).map(([type, entries]) => [type,
      entries.filter(e => e.startTime < end && e.startTime + e.duration > start &&
        (e.startTime < start || e.startTime + e.duration > end))])) };
}

function bindRuntime() {
  return [
    ['lite/public/visual-polish/decor.js', 'lite/visual-polish/decor.js'],
    ['lite/public/visual-polish/decor.css', 'lite/visual-polish/decor.css'],
  ].map(([sourcePath, sitePath]) => {
    const source = fs.readFileSync(path.join(root, sourcePath)), served = fs.readFileSync(path.join(site, sitePath));
    assert.equal(sha256(source), sha256(served), 'Served fixture must match current source: ' + sitePath);
    return { sourcePath, sitePath, bytes: served.length, sha256: sha256(served) };
  });
}

async function main() {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const result = { schemaVersion: 1, createdAt: new Date().toISOString(), site,
    sourceArtifactCommit: JSON.parse(fs.readFileSync(path.join(site, 'release.json'), 'utf8')).sourceCommit,
    runtimeBindings: bindRuntime(),
    probe: { sourcePath: path.relative(root, __filename), sha256: sha256(fs.readFileSync(__filename)),
      exactArgv: process.argv, nodeVersion: process.version },
    environment: { executablePath: executablePath ?? 'Playwright-managed default', headless: true,
      viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'no-preference',
      cpuThrottling: false, physicalDeviceValidation: false, platform: os.platform(), arch: os.arch(),
      logicalCpuCount: os.cpus().length, initialHostLoadAverage: os.loadavg() },
    protocol: { settleMs, sampleMs, randomSeed: seed, randomGenerator: 'Mulberry32, reset in each document before app scripts',
      dateAndAnimationClocks: 'Unmodified: Date, performance.now and requestAnimationFrame use real browser clocks',
      pairs: [['on', 'static'], ['static', 'on']], freshBrowserPerPair: true, freshContextPerCondition: true,
      percentile: 'linear interpolation at (n-1)*p', thresholds: 'descriptive counts only; no arbitrary performance pass budget',
      phaseDefinition: 'Initialization: navigation until warm start, including network idle, route setup, 3s settle and state checks. Warm: requested 12s measured by page performance.now().',
      entryAssignment: 'Tasks and long animation frames assigned by startTime; boundary-crossing entries reported separately. rAF intervals must fit wholly inside the phase.',
      inputProbe: 'None. The world-selection click is setup only; no input-latency or Event Timing claim.' },
    limitations: ['Two additional pairs, with reversed ordering and one fresh browser per pair; still not a statistical population or physical-device validation.',
      'Headless Chromium uses the available software renderer; results do not represent a phone or a physical GPU.',
      'An extra requestAnimationFrame callback and PerformanceObservers introduce probe overhead; this is not uninstrumented idle CPU-cost measurement.',
      'rAF intervals are callback cadence, not compositor presentation or GPU duration.',
      'Unattributed stalls cannot be assigned to host scheduling, GPU/compositor work or application code from these observations alone.',
      'A short idle window does not establish input latency, lesson load latency, or absence of rare long-tail stalls.'],
    browserRuns: [], samples: [] };
  const priorEvidence = arg('prior-evidence', undefined), priorProbe = arg('prior-probe-source', undefined);
  if (priorEvidence || priorProbe) {
    result.precedingProbe = {};
    if (priorEvidence) result.precedingProbe.evidence = { path: priorEvidence, sha256: sha256(fs.readFileSync(priorEvidence)) };
    if (priorProbe) { const source = fs.readFileSync(priorProbe, 'utf8'); result.precedingProbe.source = {
      path: priorProbe, sha256: sha256(source), text: source,
      note: 'Exact original temporary probe preserved here for reproducibility; original evidence has not been modified.' }; }
  }
  const save = () => fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
  const server = spawn(process.execPath, [path.join(__dirname, 'serve.mjs'), site, String(port)], { stdio: ['ignore', 'pipe', 'pipe'] });
  let browser;
  try {
    await new Promise((resolve, reject) => { server.stdout.once('data', resolve); server.once('error', reject);
      server.once('exit', code => reject(Error('Review server exited: ' + code))); server.stderr.on('data', d => process.stderr.write(d)); });
    for (const [pairIndex, order] of result.protocol.pairs.entries()) {
      browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
      const system = await browser.newBrowserCDPSession();
      const { gpu } = await system.send('SystemInfo.getInfo'); await system.detach();
      result.browserRuns.push({ pair: pairIndex + 1, browserVersion: browser.version(), gpu, hostLoadAverage: os.loadavg() });
      for (const mode of order) {
        const context = await browser.newContext({ viewport: result.environment.viewport, deviceScaleFactor: 1,
          colorScheme: 'light', reducedMotion: 'no-preference' });
        await context.addInitScript(initProbe, seed);
        const page = await context.newPage(), errors = [], consoleMessages = [], requestFailures = [], httpErrors = [];
        page.on('pageerror', error => errors.push({ message: String(error), observedAt: new Date().toISOString() }));
        page.on('console', message => { if (['error', 'warning'].includes(message.type())) consoleMessages.push({
          type: message.type(), text: message.text(), location: message.location(), observedAt: new Date().toISOString() }); });
        page.on('requestfailed', request => requestFailures.push({ url: request.url(), failure: request.failure(), observedAt: new Date().toISOString() }));
        page.on('response', response => { if (response.status() >= 400) httpErrors.push({ url: response.url(),
          status: response.status(), resourceType: response.request().resourceType(), observedAt: new Date().toISOString() }); });
        const url = 'http://127.0.0.1:' + port + '/lite/?vp=' + mode + '#alueet';
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.locator('.worlds button.world').first().click(); await page.locator('.wmap').waitFor();
        await page.waitForTimeout(settleMs);
        const beforeState = await page.evaluate(pageState); requireState(beforeState, mode);
        const warmStartedAt = new Date().toISOString();
        await page.evaluate(async ms => { const p = window.__reviewFrameProbe; p.warmStart = performance.now();
          await new Promise(resolve => setTimeout(resolve, ms)); p.warmEnd = performance.now(); p.finished = true; }, sampleMs);
        const warmEndedAt = new Date().toISOString();
        const afterState = await page.evaluate(pageState); requireState(afterState, mode);
        if (mode === 'on') assert(afterState.animations.find(a => a.name === 'vp-glint').currentTime >
          beforeState.animations.find(a => a.name === 'vp-glint').currentTime, 'Glints timeline must advance during sample');
        await page.waitForTimeout(100); // Drain observer delivery; excluded by warm timestamps.
        const raw = await page.evaluate(() => window.__reviewFrameProbe);
        const sample = { pair: pairIndex + 1, mode, url, beforeState, afterState, warmStartedAt, warmEndedAt,
          errors, consoleMessages, requestFailures, httpErrors,
          initialization: summarize(raw, raw.startedAt, raw.warmStart), warm: summarize(raw, raw.warmStart, raw.warmEnd), raw };
        result.samples.push(sample); save();
        assert.deepEqual(errors, []); assert.deepEqual(raw.observerErrors, []);
        console.log(JSON.stringify({ pair: sample.pair, mode, warm: sample.warm, errors, consoleMessages, requestFailures, httpErrors }));
        await context.close();
      }
      await browser.close(); browser = null;
    }
    assert.deepEqual(bindRuntime(), result.runtimeBindings, 'Runtime bytes must remain unchanged throughout probe');
    result.functionalContractPass = true;
  } catch (error) { result.functionalContractPass = false; result.failure = String(error); process.exitCode = 1; }
  finally { if (browser) await browser.close(); server.kill('SIGTERM'); result.finishedAt = new Date().toISOString();
    result.environment.finalHostLoadAverage = os.loadavg(); save();
    console.log(JSON.stringify({ output, functionalContractPass: result.functionalContractPass, failure: result.failure })); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
