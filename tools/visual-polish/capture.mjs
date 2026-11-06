// Paired review captures of the running packaged site with synthetic, repeatable state.
// The harness (not the shipped decor) seeds Math.random and fixes Date so baseline and
// candidate show the same tasks. No learner data: every context starts with empty storage.
// Usage: node tools/visual-polish/capture.mjs --base http://127.0.0.1:5221 --out DIR [--vp off|static|on] [--only regex]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { chromium } = createRequire(path.join(root, 'lite/package.json'))('@playwright/test');
const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : fallback; };
const base = arg('base', 'http://127.0.0.1:5222');
const out = path.resolve(arg('out', '.build/visual-polish-captures'));
const vp = arg('vp', null);
const only = new RegExp(arg('only', '.'));
fs.mkdirSync(out, { recursive: true });

const desktop = { width: 1440, height: 960 }, mobile = { width: 390, height: 844 };
const q = (url) => (vp ? url.replace(/^([^#]*)/, (m) => m + (m.includes('?') ? '&' : '?') + `vp=${vp}`) : url);
// Harness determinism: seeded PRNG and fixed clock injected before any page script.
const seedScript = `(() => { let s = 0x5a5a1234; Math.random = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();`;

async function chooseWorld(page) { await page.goto(q(`${base}/lite/#alueet`)); await page.locator('.worlds button.world').first().click(); await page.locator('.wmap').waitFor(); }
const shots = [
  ['home-desktop', desktop, async (p) => { await p.goto(q(`${base}/`)); }, { fullPage: false }],
  ['home-desktop-full', desktop, async (p) => { await p.goto(q(`${base}/`)); }, { fullPage: true }],
  ['home-mobile', mobile, async (p) => { await p.goto(q(`${base}/`)); }, { fullPage: false }],
  ['home-mobile-full', mobile, async (p) => { await p.goto(q(`${base}/`)); }, { fullPage: true }],
  ['lite-worlds-desktop', desktop, async (p) => { await p.goto(q(`${base}/lite/#alueet`)); await p.locator('.worlds').waitFor(); }, {}],
  ['lite-worlds-mobile', mobile, async (p) => { await p.goto(q(`${base}/lite/#alueet`)); await p.locator('.worlds').waitFor(); }, {}],
  ['lite-map-desktop', desktop, chooseWorld, {}],
  ['lite-map-mobile', mobile, chooseWorld, {}],
  ['lite-map-desktop-dark', desktop, chooseWorld, { scheme: 'dark' }],
  ['lite-paja-desktop', desktop, async (p) => { await p.goto(q(`${base}/lite/#paja`)); await p.locator('.paja').waitFor(); }, {}],
  ['lite-paja-mobile', mobile, async (p) => { await p.goto(q(`${base}/lite/#paja`)); await p.locator('.paja').waitFor(); }, {}],
  ['lite-paja-ranta-desktop', desktop, async (p) => { await p.goto(q(`${base}/lite/#paja/ranta`)); await p.locator('.paja').waitFor(); }, {}],
  ['lite-flight-desktop', desktop, async (p) => { await p.goto(q(`${base}/lite/#paja/lento`)); await p.locator('.paja').waitFor(); }, {}],
  ['lite-lesson-desktop', desktop, async (p) => { await p.goto(q(`${base}/lite/#kc/M-NUM-QTY-NUMERAL`)); await p.locator('#app .scene, #app .stack').first().waitFor(); }, {}],
  ['lite-lesson-mobile', mobile, async (p) => { await p.goto(q(`${base}/lite/#kc/M-NUM-QTY-NUMERAL`)); await p.locator('#app .scene, #app .stack').first().waitFor(); }, {}],
  ['lite-adult-desktop', desktop, async (p) => { await p.goto(q(`${base}/lite/#aikuiselle`)); await p.locator('.adult').waitFor(); }, {}],
  ['lesson-page-desktop', desktop, async (p) => { await p.goto(q(`${base}/oppitunnit/lessons/M-NUM-1TO1.html`)); }, {}],
  ['presentation-desktop', desktop, async (p) => { await p.goto(q(`${base}/oppitunnit/presentations/M-NUM-1TO1.html`)); }, {}],
  ['whitepaper-desktop', desktop, async (p) => { await p.goto(q(`${base}/whitepaper/`)); }, {}],
];

const browser = await chromium.launch();
for (const [name, viewport, go, opts] of shots) {
  if (!only.test(name)) continue;
  const context = await browser.newContext({ viewport, colorScheme: opts.scheme ?? 'light', reducedMotion: opts.reduced ? 'reduce' : 'no-preference', deviceScaleFactor: 1 });
  await context.addInitScript(seedScript);
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date('2026-11-02T09:00:00Z'));
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await go(page);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: !!opts.fullPage, animations: 'disabled' });
  if (errors.length) console.error(name, errors);
  console.log(name);
  await context.close();
}
await browser.close();
