// Executes the existing eleven Lite test bodies using a direct Chromium process.
// Local diagnostic adapter for hosts where runner workers cannot launch Chromium.
// This does not replace the required Playwright CLI job in CI.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import ts from '../../lite/node_modules/typescript/lib/typescript.js';
import { chromium } from '../../public/oppitunnit/node_modules/playwright/index.mjs';
import { expect } from '../../lite/node_modules/@playwright/test/index.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = path.join(root, 'docs/releases/launch/integration/native-lite-e2e');
fs.mkdirSync(output, { recursive: true });
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const tests = [], sourceSha256 = {};
let hooks = [], scopes = [];
const test = (name, run) => tests.push({ name: [...scopes, name].join(' / '), run, hooks: [...hooks] });
test.beforeEach = hook => hooks.push(hook);
test.describe = (name, define) => {
  const previousHooks = hooks, previousScopes = scopes;
  hooks = [...hooks]; scopes = [...scopes, name];
  try { define(); } finally { hooks = previousHooks; scopes = previousScopes; }
};
globalThis.__launchNativeTests = { test, expect };
for (const relative of ['lite/e2e/kc-and-tabs.spec.ts', 'lite/e2e/launch-controls.spec.ts']) {
  hooks = []; scopes = [];
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  sourceSha256[relative] = sha(source);
  const stripped = source.replace(/import \{[^}]+\} from '@playwright\/test';/, 'const { test, expect } = globalThis.__launchNativeTests;');
  if (stripped === source) throw Error(`Unsupported test import in ${relative}`);
  const compiled = ts.transpileModule(stripped, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
}
if (tests.length !== 11) throw Error(`Expected eleven existing test bodies, found ${tests.length}`);
for (const relative of execFileSync('git', ['ls-files', 'lite/src'], { cwd: root, encoding: 'utf8' }).trim().split('\n')) sourceSha256[relative] = sha(fs.readFileSync(path.join(root, relative)));
const dist = {};
function inventory(dir) { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
  const file = path.join(dir, entry.name);
  if (entry.isDirectory()) inventory(file); else dist[path.relative(path.join(root, 'lite/dist'), file)] = sha(fs.readFileSync(file));
} }
inventory(path.join(root, 'lite/dist'));
const receipt = { kind: 'direct_chromium_existing_test_bodies', startedAt: new Date().toISOString(), sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), sourceCommitMeaning: 'HEAD base; actual source and served dist are bound below', sourceSha256, distSha256: dist, limitation: 'Native adapter, not a Playwright CLI or GitHub CI pass. No human validation.', results: [] };
let browser;
try {
  browser = await chromium.launch({ headless: true });
  receipt.browserVersion = browser.version();
  for (const [index, item] of tests.entries()) {
    const context = await browser.newContext({ baseURL: 'http://127.0.0.1:5202/', viewport: { width: 1280, height: 720 } });
    context.setDefaultTimeout(10000);
    await context.tracing.start({ screenshots: true, snapshots: true });
    const page = await context.newPage(), started = Date.now();
    const result = { name: item.name, status: 'pending' };
    try {
      for (const hook of item.hooks) await hook({ page, context });
      await item.run({ page, context });
      result.status = 'passed';
      if (index >= 8) await page.screenshot({ path: path.join(output, `case-${index + 1}.png`) });
    } catch (error) {
      result.status = 'failed'; result.error = String(error.stack ?? error);
      await page.screenshot({ path: path.join(output, `failure-${index + 1}.png`) }).catch(() => {});
    } finally {
      result.elapsedMs = Date.now() - started;
      await context.tracing.stop(result.status === 'failed' ? { path: path.join(output, `trace-${index + 1}.zip`) } : {});
      await context.close();
    }
    receipt.results.push(result);
    console.log(`${result.status}: ${item.name}`);
  }
} catch (error) { receipt.environmentError = String(error.stack ?? error); }
finally {
  await browser?.close();
  receipt.finishedAt = new Date().toISOString();
  receipt.passed = receipt.results.filter(r => r.status === 'passed').length;
  receipt.failed = receipt.results.filter(r => r.status === 'failed').length;
  fs.writeFileSync(path.join(output, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
}
console.log(JSON.stringify({ passed: receipt.passed, failed: receipt.failed, environmentError: receipt.environmentError ?? null }));
if (receipt.passed !== 11) process.exitCode = 1;
