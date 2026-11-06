// Paired local performance comparison (VP06), ?vp=off vs default, same machine, same server.
// Not a device measurement: headless Chromium on the review machine, medians of N cold runs.
// Usage: node tools/visual-polish/perf.mjs [--base http://127.0.0.1:5222] [--runs 9] [--modes "?vp=off,?vp=static,"]
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { chromium } = createRequire(path.join(root, 'lite/package.json'))('@playwright/test');
const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : fallback; };
const base = arg('base', 'http://127.0.0.1:5222');
const runs = Number(arg('runs', 9));
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

const pages = [
  ['koti (1440)', (q) => `${base}/${q}`, async () => {}],
  ['Lite kartta (1440)', (q) => `${base}/lite/${q}#alueet`, async (p) => { await p.locator('.worlds button.world').first().click(); await p.locator('.wmap').waitFor(); }],
];

const browser = await chromium.launch();
const rows = [];
const modes = arg('modes', '?vp=off,').split(',');
for (const [label, url, after] of pages) {
  // Modes alternate run by run so drift on the machine hits every mode alike.
  const samples = Object.fromEntries(modes.map((q) => [q, { bytes: [], load: [], script: [], layout: [], style: [] }]));
  for (let i = 0; i < runs; i++) {
    for (const q of modes) {
      const s = samples[q];
      const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send('Performance.enable');
      let bytes = 0;
      cdp.on('Network.loadingFinished', (e) => { bytes += e.encodedDataLength; });
      await cdp.send('Network.enable');
      await page.goto(url(q), { waitUntil: 'load' });
      await after(page);
      // Three idle seconds so ongoing work (shimmer, animations) is included in the totals.
      await page.waitForTimeout(3000);
      const { metrics } = await cdp.send('Performance.getMetrics');
      const m = Object.fromEntries(metrics.map((x) => [x.name, x.value]));
      s.bytes.push(bytes); s.load.push(await page.evaluate(() => performance.getEntriesByType('navigation')[0].loadEventEnd));
      s.script.push(m.ScriptDuration * 1000); s.layout.push(m.LayoutDuration * 1000); s.style.push(m.RecalcStyleDuration * 1000);
      await context.close();
    }
  }
  for (const q of modes) {
    const s = samples[q];
    rows.push({ sivu: label, tila: q || 'oletus (on)', siirto_kt: (median(s.bytes) / 1024).toFixed(0), load_ms: median(s.load).toFixed(0), skripti_ms: median(s.script).toFixed(0), asettelu_ms: median(s.layout).toFixed(0), tyyli_ms: median(s.style).toFixed(0) });
  }
}
await browser.close();
console.log(`| Sivu | Tila | Siirto kt | load ms | Skripti ms | Asettelu ms | Tyyli ms |\n|---|---|---|---|---|---|---|`);
for (const r of rows) console.log(`| ${r.sivu} | ${r.tila} | ${r.siirto_kt} | ${r.load_ms} | ${r.skripti_ms} | ${r.asettelu_ms} | ${r.tyyli_ms} |`);
console.log(`\n${runs} kylmää ajoa per rivi, mediaani; headless Chromium, ${process.platform}, palvelin ${base}.`);
