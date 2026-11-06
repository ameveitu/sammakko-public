#!/usr/bin/env node
// Builds the local Sammakko art pack from raw generations in art/_raw/.
//   node art/build.mjs            fit, score, pick, write pack + manifest + preview
//   node art/build.mjs --check    only verify manifest hashes against files
// Raw 1024 px generations and their provenance sidecars stay in art/_raw/
// (PNGs git-ignored, sidecars committed). The original approved character
// PNGs in lite/public/characters/ are only read, never written.
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as P from '../tools/imagegen/lib/png.mjs';
import * as K from '../tools/imagegen/lib/consistency.mjs';

const ART = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(ART, '..');
const RAW = path.join(ART, '_raw');
const CANON = path.join(REPO, 'lite', 'public', 'characters');
const rel = (f) => path.relative(REPO, f).split(path.sep).join('/');
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'art-pack-'));

// Reference frames per actor: size/outline come from `layout`, identity score from `refs`.
const ACTORS = {
  aava: { layout: 'idle', refs: ['idle', 'walk_01', 'talk', 'wave'], minScore: 82 },
  loikka: { layout: 'idle', refs: ['idle', 'wave', 'happy', 'crouch'], minScore: 74 },
};
// Poses whose feet are not on the ground line (y 238): airborne or swimming.
const BOTTOM = { 'aava/jump': 200, 'loikka/swim': 208 };
// minScore: identity score a frame needs to enter the pack = weakest canon frame of
// that actor minus 4 (Aava canon 86-97, Loikka canon 78-94; Aava vs Loikka 27-29).

const picks = Object.fromEntries(Object.entries(readJson(path.join(ART, 'picks.json'), {})).filter(([k]) => !k.startsWith('_')));
function readJson(f, dflt) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return dflt; } }

function layoutOf(file) {
  const img = P.decodePng(fs.readFileSync(file));
  const b = P.alphaBounds(img, 128);
  let area = 0; for (let i = 3; i < img.data.length; i += 4) if (img.data[i] >= 128) area++;
  return { area, bottom: b.y + b.h, centerX: Math.round(b.x + b.w / 2), lineColor: K.features(img).lineColor, bodyColor: K.features(img).bodyColor };
}

function sips(args) { execFileSync('sips', args, { stdio: 'ignore' }); }

function sidecarInfo(file) {
  const s = readJson(file + '.json', null);
  if (!s) return null;
  return { requestId: s.requestId, model: s.model, createdAt: s.createdAt, requestUsd: s.cost?.actualUsd ?? null, prompt: s.prompt };
}

const manifest = {
  name: 'sammakko-art-pack', version: '0.1.0', builtAt: null,
  about: 'Paikallinen Sammakko-grafiikkapaketti. Alkuperäiset hahmo-PNG:t ovat kaanon (lite/public/characters), niitä ei korvata.',
  canon: {}, characters: {}, textures: {}, backgrounds: {}, icons: {}, rejected: [],
};

// ---------- characters ----------
function buildCharacters() {
  for (const [actor, cfg] of Object.entries(ACTORS)) {
    const L = layoutOf(path.join(CANON, actor, cfg.layout + '.png'));
    const refs = cfg.refs.map((p) => K.loadFeatures(path.join(CANON, actor, p + '.png')));
    manifest.canon[actor] = fs.readdirSync(path.join(CANON, actor)).filter((f) => f.endsWith('.png')).sort()
      .map((f) => ({ pose: f.replace(/\.png$/, ''), file: rel(path.join(CANON, actor, f)), sha256: sha(path.join(CANON, actor, f)) }));
    const dir = path.join(RAW, actor);
    if (!fs.existsSync(dir)) continue;
    const groups = {};
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort()) {
      const m = f.replace(/^pilot-/, '').match(new RegExp(`^${actor}-(.+?)-\\d{8}-\\d{6}-\\d+\\.png$`));
      if (m) (groups[m[1].replace(/-(\d+)$/, '_$1')] ||= []).push(path.join(dir, f)); // run-01 → run_01 like walk_01
    }
    for (const out of [path.join(ART, 'characters', actor), path.join(ART, 'characters', actor + '@2x')]) fs.mkdirSync(out, { recursive: true });
    manifest.characters[actor] = {};
    for (const [pose, files] of Object.entries(groups)) {
      const key = `${actor}/${pose}`;
      const bottom = BOTTOM[key] ?? 238;
      const cands = files.map((f) => {
        const t = path.join(tmpDir, `${actor}-${pose}-${path.basename(f)}`);
        K.fitToLayout(f, t, { canvas: 256, bottom, centerX: L.centerX, lineColor: L.lineColor, bodyColor: L.bodyColor, area: L.area });
        return { raw: f, fit: t, ...K.score(K.loadFeatures(t), refs) };
      });
      cands.sort((a, b) => b.total - a.total);
      const chosen = picks[key] ? cands.find((c) => path.basename(c.raw) === picks[key]) : cands[0];
      if (!chosen) throw new Error(`picks.json: ${key} → ${picks[key]} ei löydy`);
      if (chosen.total < cfg.minScore && !picks[key]) {
        manifest.rejected.push({ key, best: chosen.total, reason: `alle ${cfg.minScore}`, raw: cands.map((c) => rel(c.raw)) });
        continue;
      }
      const o1 = path.join(ART, 'characters', actor, pose + '.png');
      const o2 = path.join(ART, 'characters', actor + '@2x', pose + '.png');
      fs.copyFileSync(chosen.fit, o1);
      K.fitToLayout(chosen.raw, o2, { canvas: 512, bottom: bottom * 2, centerX: L.centerX * 2, lineColor: L.lineColor, bodyColor: L.bodyColor, area: L.area * 4, margin: 8 });
      manifest.characters[actor][pose] = {
        file: rel(o1), file2x: rel(o2), sha256: sha(o1), sha256_2x: sha(o2),
        score: chosen.total, parts: chosen.parts, pickedBy: picks[key] ? 'picks.json' : 'score',
        alternatives: cands.filter((c) => c !== chosen).map((c) => ({ raw: rel(c.raw), score: c.total })),
        source: { raw: rel(chosen.raw), rawSha256: sha(chosen.raw), ...sidecarInfo(chosen.raw) },
      };
      console.log(`${key.padEnd(20)} ${chosen.total}  (${cands.map((c) => c.total).join(', ')})`);
    }
  }
}

// ---------- world ----------
function worldFiles(prefix) {
  const dir = path.join(RAW, 'world');
  if (!fs.existsSync(dir)) return {};
  const groups = {};
  for (const f of fs.readdirSync(dir).filter((f) => f.startsWith(prefix + '-') && f.endsWith('.png')).sort()) {
    const m = f.match(new RegExp(`^${prefix}-(.+?)-\\d{8}-\\d{6}(?:-\\d+)?\\.png$`));
    if (m) (groups[m[1]] ||= []).push(path.join(dir, f));
  }
  return groups;
}

function pickWorld(kind, name, files, scoreFn) {
  const key = `${kind}/${name}`;
  const scored = files.map((f) => ({ raw: f, ...scoreFn(f) }));
  return picks[key] ? scored.find((c) => path.basename(c.raw) === picks[key]) : scored.sort((a, b) => a.rank - b.rank)[0];
}

function buildTextures() {
  const out = path.join(ART, 'textures'); fs.mkdirSync(out, { recursive: true });
  for (const [name, files] of Object.entries(worldFiles('tex'))) {
    const c = pickWorld('textures', name, files, (f) => { const s = P.seamScore(P.decodePng(fs.readFileSync(f))); return { seam: s, rank: s }; });
    const o = path.join(out, name + '.png');
    sips(['-Z', '512', c.raw, '--out', o]);
    const seam = P.seamScore(P.decodePng(fs.readFileSync(o)));
    manifest.textures[name] = { file: rel(o), sha256: sha(o), size: 512, seamScore: seam, seamless: seam <= 2, source: { raw: rel(c.raw), rawSha256: sha(c.raw), ...sidecarInfo(c.raw) } };
    console.log(`texture ${name.padEnd(14)} saumaluku ${seam}${seam > 2 ? '  ⚠ näkyvä sauma' : ''}`);
  }
}

function buildBackgrounds() {
  const out = path.join(ART, 'backgrounds'); fs.mkdirSync(out, { recursive: true });
  for (const [name, files] of Object.entries(worldFiles('bg'))) {
    const c = pickWorld('backgrounds', name, files, () => ({ rank: 0 }));
    const o = path.join(out, name + '.jpg');
    sips(['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', c.raw, '--out', o]);
    manifest.backgrounds[name] = { file: rel(o), sha256: sha(o), source: { raw: rel(c.raw), rawSha256: sha(c.raw), ...sidecarInfo(c.raw) } };
    console.log(`background ${name}`);
  }
}

function buildIcons() {
  const out = path.join(ART, 'icons'); fs.mkdirSync(out, { recursive: true });
  for (const [name, files] of Object.entries(worldFiles('icon'))) {
    const c = pickWorld('icons', name, files, () => ({ rank: 0 }));
    const t = P.trim(P.decodePng(fs.readFileSync(c.raw)), { square: true, threshold: 8 });
    const pad = Math.round(t.width * 0.06);
    const sq = P.trim(t, { pad, square: true, threshold: 0 });
    const o = path.join(out, name + '.png');
    fs.writeFileSync(o, P.encodePng(sq));
    sips(['-Z', '256', o]);
    manifest.icons[name] = { file: rel(o), sha256: sha(o), size: 256, source: { raw: rel(c.raw), rawSha256: sha(c.raw), ...sidecarInfo(c.raw) } };
    console.log(`icon ${name}`);
  }
}

// ---------- animations + preview ----------
function writePreview() {
  const anim = readJson(path.join(ART, 'animations.json'), null);
  const urlOf = (actor, pose) => manifest.characters[actor]?.[pose] ? `characters/${actor}/${pose}.png` : `../lite/public/characters/${actor}/${pose}.png`;
  const data = { anim: anim?.sequences || {}, urls: {} };
  for (const actor of Object.keys(ACTORS)) {
    data.urls[actor] = {};
    for (const c of manifest.canon[actor] || []) data.urls[actor][c.pose] = urlOf(actor, c.pose);
    for (const pose of Object.keys(manifest.characters[actor] || {})) data.urls[actor][pose] = urlOf(actor, pose);
  }
  const html = fs.readFileSync(path.join(ART, 'preview.template.html'), 'utf8')
    .replace('/*DATA*/null', JSON.stringify(data))
    .replace('/*MANIFEST*/null', JSON.stringify({ textures: manifest.textures, backgrounds: manifest.backgrounds, icons: manifest.icons, characters: manifest.characters }));
  fs.writeFileSync(path.join(ART, 'preview.html'), html);
}

function check() {
  const m = readJson(path.join(ART, 'manifest.json'), null);
  if (!m) throw new Error('manifest.json puuttuu');
  let bad = 0, n = 0;
  const walk = (o) => { for (const v of Object.values(o)) if (v && typeof v === 'object') { if (v.file && v.sha256) { n++; const f = path.join(REPO, v.file); if (!fs.existsSync(f) || sha(f) !== v.sha256) { bad++; console.log('✖', v.file); } } if (v.file2x) { n++; const f = path.join(REPO, v.file2x); if (!fs.existsSync(f) || sha(f) !== v.sha256_2x) { bad++; console.log('✖', v.file2x); } } walk(v); } };
  walk({ c: m.characters, t: m.textures, b: m.backgrounds, i: m.icons, k: m.canon });
  console.log(bad ? `${bad}/${n} tiedostoa ei vastaa manifestia` : `OK: ${n} tiedostoa vastaa manifestia`);
  process.exitCode = bad ? 1 : 0;
}

if (process.argv.includes('--check')) check();
else {
  buildCharacters(); buildTextures(); buildBackgrounds(); buildIcons();
  manifest.builtAt = new Date().toISOString();
  fs.writeFileSync(path.join(ART, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
  writePreview();
  if (manifest.rejected.length) console.log('Hylätyt (alle kynnyksen):', manifest.rejected.map((r) => `${r.key} ${r.best}`).join(', '));
  console.log('Valmis: art/manifest.json, art/preview.html');
}
