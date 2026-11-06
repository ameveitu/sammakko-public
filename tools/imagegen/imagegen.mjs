#!/usr/bin/env node
// Sammakko imagegen: OpenAI image generation CLI with dry-run by default,
// Keychain-only key handling, budget guard and provenance sidecars.
// Usage: node tools/imagegen/imagegen.mjs help
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import * as C from './lib/core.mjs';
import * as P from './lib/png.mjs';
import * as K from './lib/consistency.mjs';

const HELP = `Sammakko imagegen ${C.VERSION} — OpenAI-kuvat turvallisesti

KÄYTTÖ
  node tools/imagegen/imagegen.mjs <komento> [valinnat]

KOMENNOT
  gen           Luo kuva promptista (oletuksena dry-run)
  edit          Muokkaa kuvaa / luo referenssikuvista (--image, --mask)
  batch <file>  Eräajo JSON-tiedostosta (koko erän budjetti tarkistetaan ensin)
  post <png>    Jälkikäsittely: --trim --pad N --square --resize PX --out FILE
  tile <png>    Saumattomuustesti: 2x2-esikatselu ja saumaluku
  fit <png>     Sovita ruutu talon mittoihin: --match ref.png (koko, jalkalinja, ääriviivan ja rungon väri), --by area (asentoriippumaton koko), --bottom N, --out FILE
  compare <png...> --ref A.png --ref B.png  Hahmon yhdenmukaisuus 0-100 (>=85 = mallin mukainen)
  spend         Kuukauden kulut ja budjetti (--all = kaikki kuukaudet)
  key-set       Tallenna avain Keychainiin: pbpaste | imagegen key-set
  key-check     Kertoo, löytyykö avain (ei tulosta sitä); --verify = ilmainen tarkistus
  templates     Listaa promptipohjat ja esiasetukset
  help          Tämä ohje

GEN/EDIT-VALINNAT
  --live              Tee oikea maksullinen API-kutsu. Ilman tätä ajo on dry-run.
  --prompt "..."      Kuvaus (englanti toimii mallille parhaiten)
  --preset NIMI       sprite | character | icon | texture | background | draft
  --template NIMI     promptipohja (prompts/NIMI.txt); --var avain=arvo täyttää {{avain}}
  --character NIMI    aava | loikka (toistettavissa) — lisää hahmon kuvauksen
  --style / --no-style  Sammakon tyylilohko päälle/pois
  --model NIMI        flare (oletus) | sunburst | 2 | mini | täysi mallinimi
  --size WxH          esim. 1024x1024, 1536x1024, 1024x1536 tai auto
  --quality Q         low | medium | high | xhigh | max | auto
  --background B      transparent | opaque | auto
  --format F          png | webp | jpeg   (--compression 0-100 webp/jpeg)
  --n N               kuvien määrä (1-10)
  --image FILE        syöte-/referenssikuva (edit, toistettavissa, max 16)
  --mask FILE         inpainting-maski (läpinäkyvä alue = muokattava), koskee 1. kuvaa
  --out KANSIO        kohde (oletus tools/imagegen/out/)
  --name NIMI         tiedostonimen alku
  --max-usd X         ajokohtainen kattohinta (oletus asetuksista)
  --moderation M      auto | low

ESIMERKKI
  node tools/imagegen/imagegen.mjs gen --preset sprite --character aava \\
    --prompt "Aava" --var pose="jumping happily" --name aava-jump
`;

// ---------- args ----------

const REPEAT = new Set(['image', 'var', 'character', 'ref']);
const BOOL = new Set(['live', 'style', 'no-style', 'trim', 'square', 'all', 'json', 'help', 'verify', 'no-line-lock', 'no-color-match']);

export function parseArgs(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { o._.push(a); continue; }
    let [k, v] = a.slice(2).split(/=(.*)/s, 2);
    if (BOOL.has(k)) { o[k] = true; continue; }
    if (v === undefined) { v = argv[++i]; if (v === undefined) throw new Error(`--${k} tarvitsee arvon`); }
    if (/^(api-?key|key|token)$/i.test(k)) throw new Error('Avainta ei koskaan anneta komentorivillä. Tallenna se Keychainiin (katso README).');
    if (REPEAT.has(k)) (o[k] ||= []).push(v); else o[k] = v;
  }
  return o;
}

function varsOf(list = []) {
  const v = {};
  for (const kv of list) { const i = kv.indexOf('='); if (i < 1) throw new Error(`--var pitää olla muotoa avain=arvo: ${kv}`); v[kv.slice(0, i)] = kv.slice(i + 1); }
  return v;
}

// ---------- job building ----------

/** Turn CLI options or a batch job into a fully resolved request plan. */
export function planJob(opts, mode) {
  const preset = opts.preset ? C.PRESETS[opts.preset] : {};
  if (opts.preset && !preset) throw new Error(`Tuntematon esiasetus "${opts.preset}" (${Object.keys(C.PRESETS).join(', ')})`);
  const style = opts['no-style'] || opts.style === false ? false : opts.style === true ? true : !!preset.style;
  const template = opts.template ?? preset.template;
  let vars = { ...varsOf(opts.var), ...(opts.vars || {}) };
  if (template === 'texture' && !vars.look) vars.look = 'soft colored-pencil and crayon texture, gentle natural colors';
  if (template === 'background' && !vars.space) vars.space = 'the upper third';
  if ((template === 'sprite' || template === 'character') && !vars.pose) vars.pose = 'standing, friendly, looking at the viewer';
  const built = C.buildPrompt({ prompt: opts.prompt ?? (opts['prompt-file'] ? fs.readFileSync(opts['prompt-file'], 'utf8') : undefined), template, vars, style, character: opts.character });
  const images = [].concat(opts.image || []).map(C.dataUrl);
  const p = {
    mode: images.length ? 'edit' : mode,
    model: C.resolveModel(opts.model ?? preset.model),
    prompt: built.text,
    promptParts: built.parts,
    preset: opts.preset || null,
    size: opts.size ?? preset.size ?? '1024x1024',
    quality: opts.quality ?? preset.quality ?? 'medium',
    background: opts.background ?? preset.background ?? 'auto',
    format: opts.format ?? preset.format ?? 'png',
    compression: opts.compression != null ? Number(opts.compression) : undefined,
    n: Number(opts.n ?? 1),
    moderation: opts.moderation ?? 'auto',
    images,
    mask: opts.mask ? C.dataUrl(opts.mask) : null,
    out: opts.out || null,
    name: C.slug(opts.name || [].concat(opts.character || [])[0] || opts.preset || opts.prompt || 'kuva'),
  };
  if (mode === 'edit' && !images.length) throw new Error('edit tarvitsee vähintään yhden --image');
  const { errs, warns } = C.validateParams(p);
  if (errs.length) throw new Error('Virheelliset parametrit:\n  - ' + errs.join('\n  - '));
  p.warnings = warns;
  p.estimate = C.estimateCost(p);
  return p;
}

// ---------- running ----------

function outDir(opts, cfg, p) {
  const dir = path.resolve(p?.out || opts.out || cfg.outDir || path.join(C.TOOL_DIR, 'out'));
  C.assertWritable(dir, cfg);
  return dir;
}

function printPlan(p, dir, budget) {
  const body = C.describeBody(C.requestBody(p), p);
  console.log(`\n▶ ${p.name}  [${p.mode === 'edit' ? 'POST /v1/images/edits' : 'POST /v1/images/generations'}]`);
  console.log(`  malli ${p.model}, koko ${p.size}, laatu ${p.quality}, tausta ${p.background}, muoto ${p.format}, n=${p.n}`);
  console.log(`  hinta-arvio $${p.estimate.usd.toFixed(4)}  (${p.estimate.basis})`);
  console.log(`  kohde ${path.join(dir, `${p.name}-<aikaleima>.${p.format}`)}`);
  for (const w of p.warnings) console.log(`  ⚠ ${w}`);
  if (budget) console.log(`  budjetti: käytetty $${budget.info.spent.toFixed(2)} / $${budget.info.budget} tässä kuussa${budget.ok ? '' : `  ✖ ${budget.reason}`}`);
  return body;
}

async function runOne(p, opts, cfg, key, keySource) {
  const dir = outDir(opts, cfg, p);
  fs.mkdirSync(dir, { recursive: true });
  const body = C.requestBody(p);
  const started = Date.now();
  const base = {
    ts: new Date().toISOString(), month: C.monthKey(), tool: `sammakko-imagegen ${C.VERSION}`,
    name: p.name, endpoint: p.mode === 'edit' ? 'images/edits' : 'images/generations', model: p.model,
    estimateUsd: p.estimate.usd,
  };
  let res;
  try {
    res = await C.callApi(p.mode === 'edit' ? 'edits' : 'generations', body, key);
  } catch (e) {
    C.appendLedger({ ...base, ok: false, costUsd: 0, error: e.message, requestId: e.requestId || null });
    throw e;
  }
  const usage = res.json.usage || null;
  const actual = C.actualCost(p.model, usage);
  const costUsd = actual ?? p.estimate.usd;
  const files = [];
  const st = C.stamp();
  res.json.data.forEach((d, i) => {
    const buf = Buffer.from(d.b64_json, 'base64');
    const file = C.uniquePath(path.join(dir, `${p.name}-${st}${res.json.data.length > 1 ? `-${i + 1}` : ''}.${p.format}`));
    fs.writeFileSync(file, buf);
    const prov = {
      file: path.basename(file), sha256: C.sha256(buf), bytes: buf.length,
      createdAt: base.ts, tool: base.tool, keySource,
      endpoint: base.endpoint, requestId: res.requestId,
      model: p.model, preset: p.preset,
      params: { size: p.size, quality: p.quality, background: p.background, output_format: p.format, output_compression: body.output_compression ?? null, n: p.n, moderation: p.moderation },
      returned: { size: res.json.size, quality: res.json.quality, background: res.json.background, output_format: res.json.output_format },
      prompt: p.prompt, promptParts: p.promptParts,
      inputs: p.images.map((x) => ({ file: path.relative(process.cwd(), x.file), sha256: x.sha256 })),
      mask: p.mask ? { file: path.relative(process.cwd(), p.mask.file), sha256: p.mask.sha256 } : null,
      cost: { estimateUsd: p.estimate.usd, actualUsd: actual, usage, imagesInRequest: res.json.data.length, note: 'actualUsd koskee koko pyyntöä' },
      seconds: Math.round((Date.now() - started) / 1000),
      license: 'OpenAI-ehdot: tuotos kuuluu käyttäjälle; tarkista README:n lisenssiosio ennen julkaisua.',
    };
    fs.writeFileSync(C.sidecarPath(file), JSON.stringify(prov, null, 2) + '\n');
    if (p.background === 'transparent' && p.format === 'png') {
      try { const r = P.alphaReport(P.decodePng(buf)); if (r.touchesEdge) console.log(`  ⚠ ${path.basename(file)}: kuvio koskettaa reunaa (rajaus voi leikata)`); } catch { /* ignore */ }
    }
    files.push(file);
  });
  C.appendLedger({ ...base, ok: true, costUsd, costSource: actual != null ? 'usage' : 'estimate', usage, requestId: res.requestId, files: files.map((f) => path.relative(process.cwd(), f)) });
  console.log(`  ✔ ${files.map((f) => path.relative(process.cwd(), f)).join(', ')}  ($${costUsd.toFixed(4)}${actual != null ? '' : ' arvio'})`);
  return files;
}

async function execute(plans, opts) {
  const cfg = C.loadConfig();
  const total = plans.reduce((s, p) => s + p.estimate.usd, 0);
  const maxUsd = opts['max-usd'] != null ? Number(opts['max-usd']) : undefined;
  const budget = C.checkBudget(total, cfg, maxUsd);
  for (const p of plans) printPlan(p, outDir(opts, cfg, p), plans.length === 1 ? budget : null);
  if (plans.length > 1) console.log(`\nYhteensä ${plans.length} kuvapyyntöä, arvio $${total.toFixed(4)}. Käytetty tässä kuussa $${budget.info.spent.toFixed(2)} / $${budget.info.budget}.`);
  if (!budget.ok) { console.error(`\n✖ Pysäytetty: ${budget.reason}`); process.exitCode = 3; return; }
  if (budget.warn) console.log(`⚠ Kuukausibudjetista on käytössä yli ${Math.round(cfg.warnRatio * 100)} % tämän ajon jälkeen.`);
  if (!opts.live) {
    console.log('\nDRY-RUN: API-kutsua ei tehty, avainta ei luettu, mitään ei kirjattu. Lisää --live, kun haluat oikeasti generoida.');
    if (opts.json) console.log(JSON.stringify(plans.map((p) => C.describeBody(C.requestBody(p), p)), null, 2));
    return;
  }
  const k = C.getApiKey();
  if (!k) {
    console.error(`\n✖ API-avainta ei löytynyt Keychainista (palvelu "${C.KEYCHAIN_SERVICE}"). Katso README: "API-avaimen tallennus".`);
    process.exitCode = 2; return;
  }
  if (k.source === 'env') console.error('⚠ Avain luettiin ympäristömuuttujasta OPENAI_API_KEY. Suositus: Keychain.');
  for (const p of plans) {
    const again = C.checkBudget(p.estimate.usd, cfg, maxUsd);
    if (!again.ok) { console.error(`✖ ${p.name} ohitettu: ${again.reason}`); process.exitCode = 3; break; }
    try { await runOne(p, opts, cfg, k.key, k.source); }
    catch (e) { console.error(`✖ ${p.name}: ${C.redact(e.message, k.key)}`); process.exitCode = 1; if (plans.length > 1 && e.status !== 400) break; }
  }
}

function loadBatch(file, opts) {
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  const jobs = Array.isArray(doc) ? doc : doc.jobs;
  const defaults = Array.isArray(doc) ? {} : doc.defaults || {};
  const baseDir = path.dirname(path.resolve(file));
  const only = opts.only ? new Set(opts.only.split(',')) : null;
  return jobs.filter((j) => !only || only.has(j.name)).map((j) => {
    const merged = { ...defaults, ...j, vars: { ...(defaults.vars || {}), ...(j.vars || {}) } };
    if (merged.out) merged.out = path.resolve(baseDir, merged.out);
    for (const k of ['image', 'mask']) if (merged[k]) merged[k] = [].concat(merged[k]).map((f) => path.resolve(baseDir, f));
    if (merged.mask) merged.mask = merged.mask[0];
    if (merged.style === undefined) delete merged.style;
    return planJob(merged, merged.image?.length ? 'edit' : 'gen');
  });
}

// ---------- utility commands ----------

function cmdSpend(opts) {
  const cfg = C.loadConfig();
  const all = C.readLedger();
  const months = {};
  for (const e of all) (months[e.month] ||= []).push(e);
  const keys = opts.all ? Object.keys(months).sort() : [C.monthKey()];
  for (const m of keys) {
    const es = months[m] || [];
    const total = es.reduce((s, e) => s + (e.costUsd || 0), 0);
    console.log(`${m}: $${total.toFixed(2)} / $${cfg.monthlyBudgetUsd}  (${es.filter((e) => e.ok).length} onnistunutta, ${es.filter((e) => !e.ok).length} epäonnistunutta pyyntöä)`);
    const byModel = {};
    for (const e of es) byModel[e.model] = (byModel[e.model] || 0) + (e.costUsd || 0);
    for (const [mod, usd] of Object.entries(byModel)) console.log(`   ${mod}: $${usd.toFixed(2)}`);
  }
  console.log(`\nKirjanpito: ${path.join(C.stateDir(), 'ledger.jsonl')}`);
  console.log('Huom: tämä näkee vain tällä työkalulla tehdyt kutsut. Varsinainen raja asetetaan OpenAI:n hallintapaneelissa.');
}

async function cmdKeyCheck(opts) {
  const k = C.getApiKey();
  if (!k) { console.log(`Avainta ei löytynyt. Keychain-palvelu: "${C.KEYCHAIN_SERVICE}", tili: "${C.KEYCHAIN_ACCOUNT}".`); process.exitCode = 2; return; }
  const kind = /^sk-proj-/.test(k.key) ? 'projektiavain (sk-proj-…)' : /^sk-svcacct-/.test(k.key) ? 'palvelutiliavain' : /^sk-/.test(k.key) ? 'käyttäjäavain — suositus: projektiavain' : 'tuntematon muoto';
  console.log(`Avain löytyi: lähde ${k.source === 'keychain' ? 'macOS Keychain' : 'ympäristömuuttuja (varavaihtoehto)'}, tyyppi ${kind}, pituus ${k.key.length} merkkiä.`);
  const problem = C.keyProblem(k.key);
  if (problem) console.log(`⚠ ${problem}`);
  if (k.key.length === 128) console.log('⚠ Pituus on tasan 128: macOS:n salasanakehote katkaisee pidemmät avaimet. Tallenna uudelleen komennolla key-set.');
  if (!opts.verify) { console.log('Avainta ei tulostettu eikä sillä tehty kutsuja. (Ilmainen tarkistus OpenAI:lta: --verify)'); return; }
  try {
    const v = await C.verifyKey(k.key);
    console.log(`${v.ok ? '✔' : '✖'} ${v.msg} (ilmainen tarkistus, ei kuvakutsua)`);
    if (!v.ok) process.exitCode = 1;
  } catch (e) { console.log(`✖ Tarkistus epäonnistui: ${C.redact(e.message, k.key)}`); process.exitCode = 1; }
}

/** Reads the key from a pipe (pbpaste | …) or a hidden prompt, with no length limit. */
async function readSecret() {
  const stdin = process.stdin;
  if (!stdin.isTTY) {
    let s = '';
    for await (const c of stdin) s += c;
    return s.trim();
  }
  process.stderr.write('Liitä avain (ei näy ruudulla) ja paina Enter: ');
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');
  return new Promise((resolve, reject) => {
    let s = '';
    const done = (fn) => { stdin.setRawMode(false); stdin.pause(); stdin.removeListener('data', on); process.stderr.write('\n'); fn(); };
    const on = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n') return done(() => resolve(s.trim()));
        if (ch === '\u0003') return done(() => reject(new Error('Keskeytetty')));
        if (ch === '\u007f' || ch === '\b') s = s.slice(0, -1);
        else if (ch >= ' ' && !/\u001b/.test(ch)) s += ch;
      }
    };
    stdin.on('data', on);
  });
}

async function cmdKeySet() {
  const key = (await readSecret()).replace(/^\u001b\[200~|\u001b\[201~$/g, '');
  const problem = C.keyProblem(key);
  if (problem) throw new Error(`Avainta ei tallennettu: ${problem}.`);
  C.storeKey(key);
  console.log(`✔ Avain tallennettu Keychainiin (palvelu "${C.KEYCHAIN_SERVICE}", ${key.length} merkkiä). Tyhjennä leikepöytä: pbcopy < /dev/null`);
  try {
    const v = await C.verifyKey(key);
    console.log(`${v.ok ? '✔' : '✖'} ${v.msg} (ilmainen tarkistus, ei kuvakutsua)`);
    if (!v.ok) process.exitCode = 1;
  } catch (e) { console.log(`Tarkistus OpenAI:lta ei onnistunut: ${C.redact(e.message, key)}`); }
}

function cmdTemplates() {
  console.log('Promptipohjat (tools/imagegen/prompts/):');
  for (const t of C.listTemplates()) {
    const vars = [...new Set([...C.readTemplate(t).matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
    console.log(`  ${t.padEnd(22)} ${vars.length ? 'muuttujat: ' + vars.join(', ') : ''}`);
  }
  console.log('\nEsiasetukset:');
  for (const [k, v] of Object.entries(C.PRESETS)) console.log(`  ${k.padEnd(11)} ${v.size} ${v.quality} ${v.background}  — ${v.about}`);
  console.log('\nMallit:');
  for (const [k, v] of Object.entries(C.MODELS.models)) console.log(`  ${k.padEnd(24)} ${v.use}`);
}

function cmdPost(file, opts) {
  let img = P.decodePng(fs.readFileSync(file));
  const before = P.alphaReport(img);
  if (opts.trim || opts.pad || opts.square) img = P.trim(img, { pad: Number(opts.pad || 0), square: !!opts.square });
  const out = path.resolve(opts.out || file.replace(/\.png$/i, '') + '-post.png');
  C.assertWritable(path.dirname(out), C.loadConfig());
  const target = opts.out ? out : C.uniquePath(out);
  fs.writeFileSync(target, P.encodePng(img));
  if (opts.resize) execFileSync('sips', ['-Z', String(Number(opts.resize)), target, '--out', target], { stdio: 'ignore' });
  const optimized = [];
  for (const [bin, args] of [['pngquant', ['--force', '--skip-if-larger', '--quality=70-95', '--ext', '.png', target]], ['oxipng', ['-o', '3', '--strip', 'safe', target]]]) {
    try { execFileSync(bin, args, { stdio: 'ignore' }); optimized.push(bin); } catch { /* optional tool missing */ }
  }
  const after = P.alphaReport(P.decodePng(fs.readFileSync(target)));
  console.log(`${path.relative(process.cwd(), target)}: ${before.width}x${before.height} → ${after.width}x${after.height}, ${fs.statSync(target).size} tavua, läpinäkyvää ${Math.round(after.transparentShare * 100)} %${optimized.length ? `, optimoitu: ${optimized.join(' + ')}` : ''}`);
  if (before.touchesEdge) console.log('⚠ Alkuperäinen kuvio koskettaa reunaa — osa hahmosta voi olla leikkautunut jo generoinnissa.');
}

function cmdTile(file, opts) {
  const img = P.decodePng(fs.readFileSync(file));
  const score = P.seamScore(img);
  const out = path.resolve(opts.out || file.replace(/\.png$/i, '') + '-tile2x2.png');
  fs.writeFileSync(out, P.encodePng(P.tile2x2(img)));
  console.log(`Saumaluku ${score} (≈1 = saumaton, yli 2 = sauma todennäköisesti näkyy). Esikatselu: ${path.relative(process.cwd(), out)}`);
}

function refLayout(file) {
  const img = P.decodePng(fs.readFileSync(file));
  const b = P.alphaBounds(img, 128);
  let area = 0; for (let i = 3; i < img.data.length; i += 4) if (img.data[i] >= 128) area++;
  return { area, canvas: img.width, height: b.h, bottom: b.y + b.h, centerX: Math.round(b.x + b.w / 2), lineColor: K.features(img).lineColor, bodyColor: K.features(img).bodyColor };
}

function cmdFit(file, opts) {
  const layout = opts.match ? refLayout(opts.match) : {};
  for (const k of ['canvas', 'height', 'bottom']) if (opts[k] != null) layout[k] = Number(opts[k]);
  if (opts['center-x'] != null) layout.centerX = Number(opts['center-x']);
  if (opts['no-line-lock']) delete layout.lineColor;
  if (opts['no-color-match']) delete layout.bodyColor;
  if (opts.by !== 'area' || opts.height != null) delete layout.area;
  const out = path.resolve(opts.out || file.replace(/\.png$/i, '') + '-fit.png');
  C.assertWritable(path.dirname(out), C.loadConfig());
  const r = K.fitToLayout(file, out, layout);
  console.log(`${path.relative(process.cwd(), out)}: hahmo ${r.width}x${r.height} kohdassa ${r.x},${r.y} (kangas ${layout.canvas || 256})`);
}

function cmdCompare(files, opts) {
  const refs = [].concat(opts.ref || []);
  if (!refs.length || !files.length) throw new Error('Käyttö: compare ehdokas.png [...] --ref viite1.png --ref viite2.png');
  const R = refs.map(K.loadFeatures);
  const rows = files.map((f) => ({ file: f, ...K.score(K.loadFeatures(f), R) }));
  for (const r of rows) console.log(`${String(r.total).padStart(3)}  ${r.total >= 85 ? '✔' : r.total >= 75 ? '~' : '✖'}  ${path.relative(process.cwd(), r.file)}  paletti ${r.parts.palette}, runko ${r.parts.body}, ääriviiva ${r.parts.outline}, viivan paksuus ${r.parts.lineWeight}`);
  if (rows.length > 1) {
    const C2 = files.map(K.loadFeatures);
    let s = 0, n = 0;
    for (let i = 0; i < C2.length; i++) s += K.score(C2[i], C2.filter((_, j) => j !== i)).total, n++;
    console.log(`Ehdokkaiden keskinäinen yhdenmukaisuus: ${Math.round(s / n)}`);
  }
  if (opts.json) console.log(JSON.stringify(rows, null, 2));
}

// ---------- main ----------

export async function main(argv) {
  const opts = parseArgs(argv);
  const [cmd, arg] = opts._;
  if (!cmd || cmd === 'help' || opts.help) { console.log(HELP); return; }
  if (cmd === 'gen' || cmd === 'edit') return execute([planJob(opts, cmd)], opts);
  if (cmd === 'batch') { if (!arg) throw new Error('Anna eräajotiedosto: batch jobs.json'); return execute(loadBatch(arg, opts), opts); }
  if (cmd === 'spend') return cmdSpend(opts);
  if (cmd === 'key-check') return cmdKeyCheck(opts);
  if (cmd === 'key-set') return cmdKeySet();
  if (cmd === 'templates') return cmdTemplates();
  if (cmd === 'post') { if (!arg) throw new Error('Anna PNG: post kuva.png'); return cmdPost(arg, opts); }
  if (cmd === 'fit') { if (!arg) throw new Error('Anna PNG: fit kuva.png --match ref.png'); return cmdFit(arg, opts); }
  if (cmd === 'compare') return cmdCompare(opts._.slice(1), opts);
  if (cmd === 'tile') { if (!arg) throw new Error('Anna PNG: tile kuva.png'); return cmdTile(arg, opts); }
  throw new Error(`Tuntematon komento "${cmd}". Katso: imagegen help`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('imagegen.mjs')) {
  main(process.argv.slice(2)).catch((e) => { console.error(`✖ ${C.redact(e.message)}`); process.exitCode = process.exitCode || 1; });
}
