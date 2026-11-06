// Writes or checks tools/visual-polish/assets/<module>.json: every shipped visual-polish file
// with module, bytes, SHA-256, size budget and source. Raw sources are local and git-ignored;
// their hashes are in provenance/raw-sha256.txt and the imagegen sidecars next to it.
// Usage: node tools/visual-polish/manifest.mjs [--check]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const rel = (p) => path.join(root, p);
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(rel(p))).digest('hex');
const sources = JSON.parse(fs.readFileSync(rel('tools/visual-polish/sources.json'), 'utf8')).assets;
const rawHashes = Object.fromEntries(fs.readFileSync(rel('tools/visual-polish/provenance/raw-sha256.txt'), 'utf8').trim().split('\n').map((l) => { const [h, f] = l.split(/\s+/); return [f, h]; }));

// Code files per module, each with a byte budget (uncompressed).
const code = [
  { out: 'public/kotisivu/assets/visual-polish/mode.js', module: 'VP02', budget: 1024 },
  { out: 'public/kotisivu/assets/visual-polish/home.css', module: 'VP02', budget: 4096 },
  { out: 'public/kotisivu/assets/visual-polish/ambient.js', module: 'VP03', budget: 9216 },
  { out: 'lite/public/visual-polish/decor.js', module: 'VP04', budget: 12288 },
  { out: 'lite/public/visual-polish/decor.css', module: 'VP04', budget: 6144 },
  { out: 'lite/public/visual-polish/world/world.js', module: 'VP05', budget: 24576 },
  { out: 'lite/public/visual-polish/world/stages.json', module: 'VP05', budget: 8192 },
];
const imageBudget = 80 * 1024;

const files = [];
for (const s of sources) {
  if (!fs.existsSync(rel(s.out))) continue; // module not present in this checkout
  const base = path.basename(s.source);
  const raw = s.source.includes('/_work/') ? rawHashes[`blender:${base}`] : rawHashes[base];
  files.push({
    out: s.out, module: s.module, kind: 'image', bytes: fs.statSync(rel(s.out)).size, sha256: sha(s.out), budget: imageBudget,
    source: s.source.includes('/_work/')
      ? { generator: 'tools/visual-polish/blender/reeds.py (Blender 5.2.1 LTS, Cycles CPU, seed 20261102, 32 samples)', rawSha256: raw }
      : { generator: 'tools/imagegen/imagegen.mjs batch tools/visual-polish/batches/plates.json (gpt-image-2.5-sunburst, style reference art/backgrounds/hero-island.jpg)', sidecar: `tools/visual-polish/provenance/${base}.json`, rawSha256: raw },
    derived: `tools/visual-polish/build-assets.py: width ${s.width}, WebP quality ${s.quality}${s.alpha ? ', alpha' : ''}${s.cropAlpha ? ', alpha-cropped' : ''}`,
  });
}
// VP05 living painting: painting + motion mask per world, one character atlas (tools/visual-polish/world).
const world = JSON.parse(fs.readFileSync(rel('tools/visual-polish/world/paintings.json'), 'utf8'));
const worldGen = 'tools/visual-polish/world/build-world.py (Blender 5.2.1 LTS, tools/visual-polish/world/paintings.json)';
for (const p of world.paintings) {
  const base = path.basename(p.source);
  const source = { generator: 'tools/imagegen/imagegen.mjs batch tools/visual-polish/batches/world.json (gpt-image-2.5-sunburst, style reference art/backgrounds/hero-island.jpg)', sidecar: `tools/visual-polish/provenance/${base}.json`, rawSha256: rawHashes[base] };
  for (const [out, budget, derived] of [[p.out, p.maxBytes, `width ${p.width}, WebP lossy, largest quality under budget`], [p.mask, 24 * 1024, `motion mask ${p.maskWidth} px, WebP lossless: R water, G sway, B sky/stars`]]) {
    if (fs.existsSync(rel(out))) files.push({ out, module: 'VP05', kind: 'image', bytes: fs.statSync(rel(out)).size, sha256: sha(out), budget, source, derived: `${worldGen}: ${derived}` });
  }
}
if (fs.existsSync(rel(world.atlas.out))) {
  const a = world.atlas;
  files.push({
    out: a.out, module: 'VP05', kind: 'image', bytes: fs.statSync(rel(a.out)).size, sha256: sha(a.out), budget: a.maxBytes,
    source: { approvedFrames: a.frames.map(([frame, src]) => ({ frame, src, sha256: sha(src) })), rawSha256: 'approved-frames' },
    derived: `${worldGen}: ${a.cols} columns of ${a.cell} px cells, area-resampled only (never redrawn), WebP quality ${a.quality}, alpha`,
  });
}
for (const c of code) if (fs.existsSync(rel(c.out))) files.push({ ...c, kind: 'code', bytes: fs.statSync(rel(c.out)).size, sha256: sha(c.out) });
const dir = rel('tools/visual-polish/assets');
const modules = [...new Set(files.map((f) => f.module))].sort();
const note = (m) => m === 'VP05'
  ? 'Koristekerros: ei opetussisältöä eikä oppijadataa. Hahmot ovat hyväksyttyjä Liten PNG-kuvia vain uudelleenskaalattuina. Raakakuvat ja promptit eivät kuulu selainpakettiin.'
  : 'Koristekerros: ei opetussisältöä, ei hahmoja, ei oppijadataa. Raakakuvat ja promptit eivät kuulu selainpakettiin.';
const texts = Object.fromEntries(modules.map((m) => [m, JSON.stringify({ schema: 'sammakko-visual-polish-assets/1', module: m, note: note(m), files: files.filter((f) => f.module === m) }, null, 1) + '\n']));
const problems = [];
for (const f of files) if (f.bytes > f.budget) problems.push(`${f.out}: ${f.bytes} B > budget ${f.budget} B`);
for (const f of files) if (f.kind === 'image' && !f.source.rawSha256) problems.push(`${f.out}: raw source hash missing`);
if (process.argv.includes('--check')) {
  const present = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort() : [];
  if (present.join() !== modules.join()) problems.push(`module manifests ${present.join(',')} != modules with files ${modules.join(',')}`);
  for (const m of modules) if (!fs.existsSync(path.join(dir, `${m}.json`)) || fs.readFileSync(path.join(dir, `${m}.json`), 'utf8') !== texts[m]) problems.push(`assets/${m}.json is stale: run node tools/visual-polish/manifest.mjs`);
} else { fs.mkdirSync(dir, { recursive: true }); for (const m of modules) fs.writeFileSync(path.join(dir, `${m}.json`), texts[m]); }
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`visual-polish assets: ${files.length} files, ${files.reduce((a, f) => a + f.bytes, 0)} bytes`);
