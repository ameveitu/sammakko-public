// Reproduce the two all181 mobile findings against the served production artifact.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../lite/node_modules/playwright/index.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const run = process.env.PROMPT_FRAMING_RUN;
if (!['before', 'after'].includes(run)) throw Error('Set PROMPT_FRAMING_RUN=before|after');
const out = path.join(root, 'docs/releases/launch/integration/prompt-framing', run);
fs.mkdirSync(out, { recursive: true });
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sources = ['lite/src/ui/style.css', 'lite/src/content/written.ts'];
const receipt = { run, sourceSha256: Object.fromEntries(sources.map(p => [p, sha(path.join(root, p))])),
  distIndexSha256: sha(path.join(root, 'lite/dist/index.html')), rows: [], pageErrors: [], humanValidation: 'pending' };
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  page.on('pageerror', e => receipt.pageErrors.push(e.message));
  for (const kc of ['M-WRDIV', 'M-DEC-03']) {
    await page.goto(`http://127.0.0.1:5290/#kc/${kc}`);
    await page.getByRole('button', { name: /^Näytä ensin(?: esimerkki)?$/ }).click();
    const state = await page.evaluate(() => {
      const prompt = document.querySelector('.say p');
      return { prompt: prompt.textContent, promptWidth: prompt.getBoundingClientRect().width,
        documentWidth: document.documentElement.scrollWidth, viewport: innerWidth,
        minWidth: getComputedStyle(prompt).minWidth, overflowWrap: getComputedStyle(prompt).overflowWrap };
    });
    await page.screenshot({ path: path.join(out, kc + '.png'), fullPage: true });
    receipt.rows.push({ kc, stage: 'demo-0', ...state });
    await page.getByRole('button', { name: 'Näytä loppu', exact: true }).click();
    receipt.rows.push({ kc, stage: 'demo-0-ended', scene: await page.locator('.scene').innerText(),
      svgMarks: await page.locator('.scene svg rect, .scene svg line, .scene svg path, .scene svg text').count() });
    await page.screenshot({ path: path.join(out, kc + '-ended.png'), fullPage: true });
    if (kc === 'M-WRDIV') {
      await page.getByRole('button', { name: 'Seuraava', exact: true }).click();
      await page.getByRole('button', { name: 'Seuraava', exact: true }).click();
      receipt.rows.push({ kc, stage: 'demo-2', prompt: await page.locator('.say p').innerText(),
        independentCalculation: '156 = 15 tens + 6 ones; 15 tens / 4 gives 3 tens with 3 tens left; 36 ones / 4 gives 9; 4 × 39 = 156.' });
      await page.screenshot({ path: path.join(out, kc + '-demo2.png'), fullPage: true });
    }
  }
} finally {
  await browser.close();
  fs.writeFileSync(path.join(out, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
}
console.log(JSON.stringify(receipt));
if (run === 'after' && (receipt.rows.some(r => r.documentWidth > r.viewport || r.stage === 'demo-0-ended' && r.svgMarks === 0)
  || !receipt.rows.find(r => r.stage === 'demo-2').prompt.startsWith('Sataviisikymmentäkuusi')
  || receipt.pageErrors.length)) process.exitCode = 1;
