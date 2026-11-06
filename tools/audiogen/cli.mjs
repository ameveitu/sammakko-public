#!/usr/bin/env node
// Sammakko audio production CLI. Dry-run by default: without --live nothing reads the key,
// opens a connection or spends money. See docs/audio/AUDIO_FI.md.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { compareTranscript, fnv64, inputHash, normText, setTranscriptReader, speechKey } from './lib/text.mjs';
import { spokenForm } from './lib/spoken.mjs';
import { shift } from './lib/voicefx.mjs';
import { analyze, decodeWav, encodeWav, finishSpeech, pcm16ToFloat, resample } from './lib/wav.mjs';
import { RATE as SFX_RATE, RECIPE_VERSION, RECIPES, renderAll } from './lib/sfx.mjs';
import { cutClip, loadSource } from './lib/library.mjs';
import * as W from './lib/world.mjs';
import { inventory, loadTs, needsSpokenReview } from './lib/inventory.mjs';
setTranscriptReader((t) => spokenForm(t).spoken);
import { PROVIDER, estimateUsd, renderLine, usageUsd } from './lib/realtime.mjs';
import { appendLedger, archiveDir, audioTotals, budgetCheck, candidatesDir, getApiKey, imagegenMonthSpent, loadConfig, setApiKey, stateDir } from './lib/state.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const P = (...p) => path.join(REPO, ...p);
const CATALOG = P('audio/catalog/fi-FI');
const PUBLIC = P('lite/public/audio');
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const writeJson = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(v, null, 2) + '\n'); };
const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28) || 'x';
const usd = (x) => `${x.toFixed(4)} $`;

function args(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const k = a.slice(2); const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; o[k] = v; } else o._.push(a);
  }
  return o;
}

// ---------------------------------------------------------------- catalog
const voices = () => readJson(P('audio/voices.json'));
/** Entries of a scope with the voice each one is produced with. */
function scopeJobs(scope) {
  const V = voices();
  if (scope === 'audition-fi') {
    const A = readJson(path.join(CATALOG, 'audition.json'));
    return A.lines.filter((l) => l.pilot).flatMap((l) => V.audition.voices.map((voice) => ({ ...l, voice, profile: V.audition.profile })));
  }
  if (scope === 'core-fi') {
    const C = readJson(path.join(CATALOG, 'core.json'));
    return C.lines.map((l) => {
      const prof = V.profiles[l.speaker] ?? V.profiles.narrator;
      return { ...l, voice: prof.voice, profile: prof };
    });
  }
  if (scope === 'lite-fi') {
    const C = readJson(path.join(CATALOG, 'lite.json'));
    return C.lines.map((l) => ({ ...l, voice: V.profiles[l.speaker].voice, profile: V.profiles[l.speaker] }));
  }
  if (scope === 'pieces-fi') {
    // Maths-line pieces (lite/src/audio/pieces.ts): always the narrator.
    const C = readJson(path.join(CATALOG, 'pieces.json'));
    return C.lines.map((l) => ({ ...l, voice: V.profiles.narrator.voice, profile: V.profiles.narrator }));
  }
  throw new Error(`Tuntematon scope: ${scope} (audition-fi | core-fi | lite-fi | pieces-fi)`);
}
const jobKey = (j) => inputHash({ spokenText: j.spokenText, locale: 'fi-FI', speaker: j.speaker, provider: PROVIDER, model: j.profile.model, voice: j.voice, styleVersion: j.profile.styleVersion, processing: processing(j.profile) });
// Pitch/formant shift (semitones) is part of the produced file, so it is part of the key.
const processing = (p) => (p.shiftSemitones ? `shift${p.shiftSemitones}+finish/1` : 'finish/1');

function cmdInventory() {
  const inv = inventory(REPO);
  const unique = inv.lines.length, chars = inv.lines.reduce((s, l) => s + l.displayText.length, 0);
  writeJson(path.join(CATALOG, 'inventory.json'), { schema: 'sammakko-audio-inventory/1', note: 'Source occurrences (counts) and deduplicated fixed lines the app speaks. Not coverage.', counts: inv.counts, fixedLines: { unique, chars }, lines: inv.lines });
  console.log('Kenttä        kiinteät  merkit  lasketut');
  for (const [k, c] of Object.entries(inv.counts)) console.log(`${k.padEnd(12)} ${String(c.literal).padStart(8)} ${String(c.literalChars).padStart(7)} ${String(c.computed).padStart(9)}`);
  const kinds = {}; for (const l of inv.lines) kinds[l.kind] = (kinds[l.kind] ?? 0) + 1;
  console.log(`\nKiinteitä puhuttuja repliikkejä (deduplikoitu puhuja+teksti): ${unique}, ${chars} merkkiä`);
  for (const [k, n] of Object.entries(kinds)) console.log(`  ${k.padEnd(16)} ${n}`);
  console.log(`\n→ ${path.relative(REPO, path.join(CATALOG, 'inventory.json'))}`);
}

/** core.json: the fixed lines of v1 with stable ids. Existing reviewed spoken texts are kept. */
function cmdCatalog() {
  const inv = inventory(REPO);
  const file = path.join(CATALOG, 'core.json');
  const old = fs.existsSync(file) ? readJson(file) : { lines: [] };
  const prev = new Map(old.lines.map((l) => [`${l.speaker}|${l.displayText}`, l]));
  const KINDS = ['world.tale', 'world.finale', 'world.chapter', 'ui.praise', 'ui.say', 'ui.script', 'ui.talk', 'ui.sayAs'];
  const lines = inv.lines.filter((l) => KINDS.includes(l.kind)).map((l) => {
    const p = prev.get(`${l.speaker}|${l.displayText}`);
    const review = needsSpokenReview(l.displayText);
    return {
      id: p?.id ?? `${l.kind.split('.')[1]}.${slug(l.displayText)}-${fnv64(`${l.speaker}\n${l.displayText}`).slice(0, 6)}`,
      speaker: l.speaker, kind: l.kind, displayText: l.displayText,
      spokenText: p?.spokenText ?? l.displayText,
      spokenStatus: p?.spokenStatus ?? (review ? 'needs-review' : 'identity'),
      refs: l.refs,
    };
  });
  writeJson(file, { schema: 'sammakko-audio-catalog/1', locale: 'fi-FI', contentVersion: 1, note: 'Fixed lines of the v1 core catalog. spokenStatus: identity = no numbers or symbols, read as shown; needs-review = a person must write spokenText before production; reviewed = done.', lines });
  const need = lines.filter((l) => l.spokenStatus === 'needs-review').length;
  console.log(`core.json: ${lines.length} repliikkiä, ${lines.reduce((s, l) => s + l.spokenText.length, 0)} merkkiä; tarkistettavia puhemuotoja ${need}.`);
}

// ---------------------------------------------------------------- lite catalog
/** MP3 bitrate per scope: the core library at 80 kbps, the large lesson expansion at 32 kbps (speech, mono). */
const BITRATE = { 'core-fi': 80, 'lite-fi': 32, 'pieces-fi': 32 };
const SCOPES = ['core-fi', 'lite-fi', 'pieces-fi'];
const findLine = (id) => { for (const sc of SCOPES) { if ((sc === 'lite-fi' && !fs.existsSync(path.join(CATALOG, 'lite.json'))) || (sc === 'pieces-fi' && !fs.existsSync(path.join(CATALOG, 'pieces.json')))) continue; const l = scopeJobs(sc).find((x) => x.id === id); if (l) return { ...l, scope: sc }; } return null; };
// Order of production: what the map says first, then the lesson frame, then the lesson texts.
const LITE_KINDS = ['map.intro', 'lesson.intro', 'lesson.quick', 'lesson.practice', 'lesson.reward', 'ui.segment', 'ui.count', 'demo', 'item.say', 'item.listen', 'item.explain', 'item.why', 'item.option', 'item.speak'];
function contentLiterals() {
  const ts = loadTs(REPO), lits = new Set(), dir = P('lite/src/content');
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.ts'))) {
    const src = ts.createSourceFile(f, fs.readFileSync(path.join(dir, f), 'utf8'), ts.ScriptTarget.Latest, true);
    const v = (n) => { if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) lits.add(normText(n.text)); ts.forEachChild(n, v); }; v(src);
  }
  return lits;
}
/** lite.json: the lesson lines that do not depend on a random draw: map and lesson frame lines, demos,
 *  and task texts that are written out as such in the content (a string literal). Lines in core.json are
 *  left out. spokenStatus 'rules' = spoken form from lib/spoken.mjs (Finnish number reading rules the
 *  user approved on 2026-11-02), not read by a person; 'reviewed' entries are kept as they are. */
function cmdCatalogLite(o) {
  if (!o.sample || o.sample === true) throw new Error('käyttö: catalog-lite --sample <näyte.json> (lite/tests/zz-speech-sample.test.ts)');
  const S = readJson(o.sample), lits = contentLiterals();
  const core = new Set(readJson(path.join(CATALOG, 'core.json')).lines.map((l) => `${l.speaker}|${normText(l.displayText)}`));
  const file = path.join(CATALOG, 'lite.json');
  const prev = new Map((fs.existsSync(file) ? readJson(file).lines : []).map((l) => [l.displayText, l]));
  const ovr = path.join(CATALOG, 'spoken-overrides.json');
  const manual = fs.existsSync(ovr) ? Object.fromEntries(Object.entries(readJson(ovr).lines).map(([k, v]) => [normText(k), v])) : {};
  const pick = [];
  for (const l of S.lines) {
    const frame = /^(map|lesson)\./.test(l.kind) || l.kind === 'demo';
    if (l.kind === 'lesson.recall' || !(frame || lits.has(normText(l.text)))) continue;
    pick.push({ kind: l.kind, text: l.text, nodes: l.nodes });
  }
  // "Muistatko vielä? <intro>" plays as two files (segment playback); counter widgets say bare numbers.
  pick.push({ kind: 'ui.segment', text: 'Muistatko vielä?', nodes: [] });
  for (let n = 0; n <= 100; n++) pick.push({ kind: 'ui.count', text: String(n), nodes: [] });
  const seen = new Set(), lines = [];
  for (const x of pick.sort((a, b) => LITE_KINDS.indexOf(a.kind) - LITE_KINDS.indexOf(b.kind))) {
    const t = normText(x.text);
    if (seen.has(t) || core.has(`narrator|${t}`)) continue;
    seen.add(t);
    const p = prev.get(t);
    let spokenText = t, spokenStatus = 'identity';
    if (p?.spokenStatus === 'reviewed') ({ spokenText, spokenStatus } = p);
    else if (manual[t]) { spokenText = manual[t]; spokenStatus = 'manual'; }
    else if (needsSpokenReview(t) || /→|(?<!\p{L})(?:km|hm|dam|dm|cm|mm|kg|dl|ml|m|g|l|s|h|min)(?!\p{L})/u.test(t)) { const r = spokenForm(t); spokenText = r.spoken; spokenStatus = r.rest.length ? 'needs-review' : 'rules'; }
    const node = x.nodes[0] ?? 'ui';
    lines.push({ id: `lite.${node}.${slug(t)}-${fnv64(t).slice(0, 6)}`, speaker: 'narrator', kind: x.kind, displayText: t, spokenText, spokenStatus, nodes: x.nodes });
  }
  writeJson(file, { schema: 'sammakko-audio-catalog/1', locale: 'fi-FI', contentVersion: 1, sample: { seeds: S.seeds },
    note: 'Lesson lines that do not depend on a random draw (map/lesson frame, demos, literal task texts). spokenStatus: identity = read as shown; rules = Finnish number reading rules (tools/audiogen/lib/spoken.mjs, approved by the user 2026-11-02), not read by a person; manual = written by hand by Claude (spoken-overrides.json), not read by a person; reviewed = read by a person; needs-review = blocked.', lines });
  const by = {}; for (const l of lines) { const k = (by[l.kind] ??= { lines: 0, chars: 0 }); k.lines++; k.chars += l.spokenText.length; }
  console.log(`lite.json: ${lines.length} repliikkiä, ${lines.reduce((s, l) => s + l.spokenText.length, 0)} merkkiä; tarkistamatta ${lines.filter((l) => l.spokenStatus === 'needs-review').length}.`);
  for (const [k, v] of Object.entries(by)) console.log(`  ${k}: ${v.lines} / ${v.chars} merkkiä`);
}

function cmdPlan(o) {
  const scope = o.scope ?? 'core-fi', jobs = scopeJobs(scope);
  const V = voices();
  let total = 0, chars = 0;
  const blocked = [];
  for (const j of jobs) {
    if (!j.voice) blocked.push(`${j.id}: ääni valitsematta (${j.speaker})`);
    if (j.spokenStatus === 'needs-review') blocked.push(`${j.id}: puhemuoto tarkistamatta`);
    chars += j.spokenText.length;
    total += estimateUsd(j.spokenText, j.profile.model, j.profile.instructions);
  }
  const t = audioTotals();
  console.log(`Scope ${scope}: ${jobs.length} pyyntöä, ${chars} merkkiä, arvio ${usd(total)} (sis. 1,5× varmuuskerroin).`);
  console.log(`Ääniprojekti: käytetty ${t.settled} $, avoimia varauksia ${t.open} $, epävarmoja ${t.uncertain} $; katto ${loadConfig().projectCapUsd} $. Kuvat tässä kuussa: ${imagegenMonthSpent()} $ (yhteinen kuukausikatto ${loadConfig().monthlyBudgetUsd} $).`);
  if (o['budget-usd'] && total > Number(o['budget-usd'])) console.log(`⚠ Arvio ylittää annetun budjetin ${o['budget-usd']} $.`);
  if (blocked.length) { console.log(`\nEi vielä tuotettavissa (${blocked.length}):`); blocked.slice(0, 20).forEach((b) => console.log(`  ${b}`)); if (blocked.length > 20) console.log(`  … ja ${blocked.length - 20} muuta`); }
  console.log(`\nAudition-äänet: ${V.audition.voices.join(', ')}. Valitut: ${Object.entries(V.profiles).map(([k, p]) => `${k}=${p.voice ?? '–'}`).join(', ')}`);
}

// ---------------------------------------------------------------- render
async function cmdRender(o) {
  const scope = o.scope ?? 'audition-fi';
  let jobs = scopeJobs(scope);
  if (o.only) { const ids = String(o.only).split(','); jobs = jobs.filter((j) => ids.includes(j.id)); }
  if (o.kind) { const ks = String(o.kind).split(','); jobs = jobs.filter((j) => ks.includes(j.kind)); }
  const blocked = jobs.filter((j) => !j.voice || j.spokenStatus === 'needs-review');
  if (blocked.length) throw new Error(`${blocked.length} repliikkiä ei voi tuottaa (ääni valitsematta tai puhemuoto tarkistamatta). Aja plan.`);
  // Skip what already exists with the same input hash, unless --regenerate.
  const todo = jobs.filter((j) => o.regenerate || !fs.existsSync(candidatesDir(scope, j.id, `${j.voice}-${jobKey(j)}.json`)));
  const est = todo.map((j) => estimateUsd(j.spokenText, j.profile.model, j.profile.instructions));
  console.log(`${scope}: ${todo.length}/${jobs.length} tuotettavana, arvio ${usd(est.reduce((a, b) => a + b, 0))}.`);
  if (!o.live) { todo.slice(0, 30).forEach((j, i) => console.log(`  [dry-run] ${j.id} · ${j.speaker} · ${j.voice} · ${usd(est[i])} · "${j.spokenText.slice(0, 60)}"`)); console.log('Dry-run: avainta ei luettu, mitään ei lähetetty. Maksullinen ajo: --live --budget-usd N'); return; }
  const budget = Number(o['budget-usd']);
  if (!(budget > 0)) throw new Error('--live vaatii --budget-usd N (erän katto dollareina).');
  const key = getApiKey();
  if (!key) throw new Error('Avainta ei löydy. Tallenna: pbpaste | node tools/audiogen/cli.mjs key-set');
  const cfg = loadConfig();
  let runSpent = 0, i = 0, failed = 0;
  const worker = async () => {
    while (i < todo.length) {
      const j = todo[i], e = est[i]; i++;
      for (let attempt = 0; attempt <= cfg.retries; attempt++) {
        // Reserve before sending; a request that never left is released, an unknown outcome stays counted.
        const chk = budgetCheck(e, { runBudgetUsd: budget, runSpent, cfg });
        if (!chk.ok) { console.log(`⏹ ${j.id}: ${chk.reason}. Erä pysäytetty.`); i = todo.length; return; }
        runSpent += e;
        const rid = `${j.id}/${j.voice}/${Date.now()}/${attempt}`;
        appendLedger({ id: rid, kind: 'reserve', usd: e, scope, line: j.id });
        try {
          const r = await renderLine({ key: key.key, model: j.profile.model, voice: j.voice, instructions: j.profile.instructions, text: j.spokenText });
          const cost = usageUsd(r.usage, j.profile.model) ?? e;
          appendLedger({ id: rid, kind: 'settle', usd: cost, scope, line: j.id, usage: r.usage });
          runSpent += cost - e;
          saveCandidate(scope, j, r, cost);
          console.log(`✔ ${j.id} · ${j.voice} · ${usd(cost)}`);
          break;
        } catch (err) {
          if (err.sent) appendLedger({ id: rid, kind: 'uncertain', usd: e, scope, line: j.id, error: String(err.message).slice(0, 200) });
          else { appendLedger({ id: rid, kind: 'release', usd: 0, scope, line: j.id }); runSpent -= e; }
          console.log(`✖ ${j.id} (yritys ${attempt + 1}/${cfg.retries + 1}): ${err.message}`);
          if (attempt === cfg.retries) failed++;
        }
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(cfg.concurrency, 2) }, worker));
  const t = audioTotals();
  console.log(`Erä valmis: tämä ajo ≈ ${usd(runSpent)}, epäonnistuneita ${failed}. Ääniprojekti yhteensä ${t.total} $ (sis. avoimet ja epävarmat).`);
}

/** A take the API cut short or left empty: the transcript can still match, only the audio shows it.
 *  Finnish speech here runs about 90 ms per letter (median); under 50 ms per letter is not speech of the whole line. */
function takeProblem(level, spokenText) {
  const letters = String(spokenText).replace(/[^\p{L}\p{N}]/gu, '').length;
  if (!(level.rmsDb > -45)) return 'otto on hiljainen';
  if (level.ms < 250) return `otto on vain ${level.ms} ms`;
  if (letters >= 10 && level.ms < 50 * letters) return `otto on katkennut (${level.ms} ms, ${letters} kirjainta)`;
  return null;
}

function saveCandidate(scope, j, r, cost) {
  const dir = candidatesDir(scope, j.id);
  fs.mkdirSync(dir, { recursive: true });
  const pcm = pcm16ToFloat(r.pcm);
  const raw = j.profile.shiftSemitones ? shift(pcm, r.rate, j.profile.shiftSemitones) : pcm;
  const fin = finishSpeech(raw, r.rate);
  const wav = encodeWav(fin.samples, r.rate);
  const base = `${j.voice}-${jobKey(j)}`, level = analyze(fin.samples, r.rate);
  // The API can return a correct transcript with no audio (a 60 ms empty take). Such a take never passes.
  const check = compareTranscript(j.spokenText, r.transcript);
  const cut = takeProblem(level, j.spokenText);
  if (cut) Object.assign(check, { exact: false, audioProblem: cut });
  fs.writeFileSync(path.join(dir, `${base}.wav`), wav);
  writeJson(path.join(dir, `${base}.json`), {
    id: j.id, scope, speaker: j.speaker, displayText: j.displayText, spokenText: j.spokenText, voice: j.voice,
    provider: PROVIDER, model: j.profile.model, styleVersion: j.profile.styleVersion, processing: processing(j.profile), inputHash: jobKey(j), producedAt: new Date().toISOString(),
    responseId: r.responseId, transcript: r.transcript, check,
    usage: r.usage, costUsd: cost, wav: { sha256: sha256(wav), ...level, rate: r.rate, gainDb: fin.gainDb },
  });
}

// ---------------------------------------------------------------- approve / pack / verify
function cmdApprove(o, status = 'approved') {
  const id = o._[1], from = o.candidate;
  if (!id || !from) throw new Error('käyttö: approve <id> --candidate <polku.wav> [--note "…"] [--by nimi]');
  const meta = readJson(from.replace(/\.wav$/, '.json'));
  if (meta.id !== id) throw new Error(`ehdokas kuuluu repliikille ${meta.id}`);
  const line = findLine(id);
  if (status !== 'rejected' && !line) throw new Error(`${id} ei ole core- tai lite-katalogissa (koeäänet eivät mene sovellukseen)`);
  if (line && normText(line.spokenText) !== normText(meta.spokenText)) throw new Error('ehdokkaan puheteksti ei vastaa katalogia: tuota uudelleen');
  const wav = fs.readFileSync(from);
  const arch = archiveDir('speech', `${id}.${sha256(wav).slice(0, 12)}.wav`);
  fs.mkdirSync(path.dirname(arch), { recursive: true }); fs.copyFileSync(from, arch);
  const dec = decodeWav(wav);
  writeJson(P('audio/provenance/speech', `${id}.json`), {
    id, locale: 'fi-FI', scope: line?.scope ?? meta.scope, speaker: meta.speaker, refs: line?.refs ?? (line?.nodes ?? []).map((n) => `lite/src/content#${n}`), contentVersion: 1,
    displayText: meta.displayText, spokenText: meta.spokenText, spokenStatus: line?.spokenStatus ?? null, speechTextHash: fnv64(normText(meta.spokenText)), normalization: 'nfc-ws/1',
    provider: meta.provider, model: meta.model, voice: meta.voice, styleVersion: meta.styleVersion, processing: meta.processing ?? 'finish/1', producedAt: meta.producedAt, inputHash: meta.inputHash,
    transcriptCheck: meta.check,
    master: { sha256: sha256(wav), archive: `sammakko-audiogen/masters/speech/${path.basename(arch)}`, rate: dec.rate, channels: 1, ...analyze(dec.samples, dec.rate) },
    status, review: { by: o.by ?? null, at: new Date().toISOString(), notes: o.note ?? '' },
    rights: meta.provider === 'self-recorded'
      ? { basis: 'Own recording by the project owner (studio.mjs)', aiVoice: false, distribution: 'Sammakko app asset; not offered as a separate sound library' }
      : { basis: 'OpenAI API output (Services Agreement §4); not ChatGPT Voice', aiVoice: true, distribution: 'Sammakko app asset; not offered as a separate sound library' },
  });
  if (status !== 'provisional') console.log(`${status === 'approved' ? '✔ hyväksytty' : '✖ hylätty'}: ${id} (${meta.voice})`);
}

/** Provisional: every current core candidate whose transcript matched word for word, so the app can
 *  play produced speech before anyone has listened. Shipped only by `pack --pilot`; `approve` replaces it. */
function cmdProvisional(o = {}) {
  let n = 0; const skipped = [];
  const scope = o.scope && o.scope !== true ? o.scope : 'core-fi';
  for (const j of scopeJobs(scope)) {
    if (!j.voice) { skipped.push(`${j.id}: ääni valitsematta`); continue; }
    const wav = candidatesDir(scope, j.id, `${j.voice}-${jobKey(j)}.wav`);
    if (!fs.existsSync(wav)) { skipped.push(`${j.id}: ei ehdokasta`); continue; }
    const meta = readJson(wav.replace(/\.wav$/, '.json'));
    const cut = takeProblem(meta.wav ?? {}, meta.spokenText);
    if (!meta.check?.exact || cut) { skipped.push(`${j.id}: ${cut ?? 'litterointi poikkesi'}`); continue; }
    const prov = P('audio/provenance/speech', `${j.id}.json`);
    if (fs.existsSync(prov) && readJson(prov).status === 'approved') continue;
    cmdApprove({ _: ['provisional', j.id], candidate: wav, by: 'audiogen (automaattinen sanatarkistus)', note: 'Väliaikainen: kukaan ei ole kuunnellut. Äänen valitsi käyttäjä koenäytteistä.' }, 'provisional');
    n++;
  }
  skipped.forEach((x) => console.log(`  ohitettu ${x}`));
  console.log(`${n} väliaikaista puhetiedostoa. Sovellukseen ne menevät vain komennolla pack --pilot.`);
}

/** Studio picks (takes/picks.json, written by studio.mjs) become listening decisions:
 *  'ai' approves the current AI candidate; a take file approves the user's own recording. */
function cmdTakes() {
  const dir = path.join(stateDir(), 'takes'), picksFile = path.join(dir, 'picks.json');
  const picks = fs.existsSync(picksFile) ? readJson(picksFile) : {};
  const by = 'käyttäjä (valinta äänitysstudiossa)';
  let ai = 0, own = 0; const skipped = [];
  for (const j of scopeJobs('core-fi')) {
    const pick = picks[j.id];
    if (!pick) continue;
    if (pick === 'ai') {
      const wav = candidatesDir('core-fi', j.id, `${j.voice}-${jobKey(j)}.wav`);
      if (!fs.existsSync(wav)) { skipped.push(`${j.id}: tekoälyehdokas puuttuu`); continue; }
      cmdApprove({ _: ['approve', j.id], candidate: wav, by, note: 'Kuunneltu ja valittu tekoälyotto.' }); ai++;
      continue;
    }
    const take = path.join(dir, j.id, pick);
    if (!/^self-[a-z0-9-]+\.wav$/.test(pick) || !fs.existsSync(take)) { skipped.push(`${j.id}: otto ${pick} puuttuu`); continue; }
    const dec = decodeWav(fs.readFileSync(take));
    const fin = finishSpeech(dec.samples, dec.rate), wav = encodeWav(fin.samples, dec.rate);
    const key = inputHash({ spokenText: j.spokenText, locale: 'fi-FI', speaker: j.speaker, provider: 'self-recorded', take: sha256(fs.readFileSync(take)), processing: 'finish/1' });
    const out = candidatesDir('core-fi', j.id, `self-${key}.wav`);
    fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, wav);
    const rec = readJson(take.replace(/\.wav$/, '.json'));
    writeJson(out.replace(/\.wav$/, '.json'), {
      id: j.id, scope: 'core-fi', speaker: j.speaker, displayText: j.displayText, spokenText: j.spokenText, voice: 'self',
      provider: 'self-recorded', model: null, styleVersion: 'self/1', processing: 'finish/1', inputHash: key, producedAt: rec.recordedAt,
      transcript: null, check: { exact: null, selfRecorded: true, note: 'Ihmisen lukema; käyttäjä kuunteli ja valitsi.' },
      take: { file: `sammakko-audiogen/takes/${j.id}/${pick}`, sha256: rec.sha256 }, wav: { sha256: sha256(wav), ...analyze(fin.samples, dec.rate), rate: dec.rate, gainDb: fin.gainDb },
    });
    cmdApprove({ _: ['approve', j.id], candidate: out, by, note: 'Oma äänitys.' }); own++;
  }
  skipped.forEach((x) => console.log(`  ohitettu ${x}`));
  console.log(`Studiovalinnat: ${own} omaa ottoa ja ${ai} tekoälyottoa hyväksytty. Aja seuraavaksi pack (tai pack --pilot).`);
}

/** The user's listening decision for the whole current library: provisional speech and candidate
 *  effects become approved, except the ids listed in --except (they stay as they are). */
function cmdAccept(o) {
  if (!o.by || o.by === true) throw new Error('käyttö: accept --by "nimi (päivä)" [--note …] [--except id,..]');
  const except = new Set(String(o.except ?? '').split(',').filter(Boolean));
  const review = { by: o.by, at: new Date().toISOString(), notes: o.note && o.note !== true ? o.note : '' };
  let speech = 0, sfx = 0;
  const provDir = P('audio/provenance/speech');
  for (const f of fs.readdirSync(provDir).filter((x) => x.endsWith('.json'))) {
    const pr = readJson(path.join(provDir, f));
    if (pr.status !== 'provisional' || except.has(pr.id)) continue;
    pr.status = 'approved'; pr.review = review; writeJson(path.join(provDir, f), pr); speech++;
  }
  const sfxFile = P('audio/provenance/sfx.json'), S = readJson(sfxFile);
  for (const a of S.assets) if (a.status === 'candidate' && !except.has(`${a.family}-${a.n}`)) { a.status = 'approved'; a.review = review; sfx++; }
  writeJson(sfxFile, S);
  console.log(`Hyväksytty: ${speech} puhetta, ${sfx} tehostetta${except.size ? `; ennallaan ${[...except].join(', ')}` : ''}.`);
}

function mp3Encoder() {
  for (const bin of ['ffmpeg', 'lame']) { try { execFileSync('which', [bin], { stdio: 'ignore' }); return bin; } catch { /* next */ } }
  return null;
}
/** Pure-JS fallback, installed outside the repo so the tool itself stays dependency-free:
 *  npm install --prefix "<state>/tools" @breezystack/lamejs@1.2.7 */
async function lameJs() {
  const file = path.join(stateDir(), 'tools', 'node_modules', '@breezystack', 'lamejs', 'dist', 'lamejs.js');
  return fs.existsSync(file) ? import(file) : null;
}
async function toMp3(wavFile, out, kbps = 80) {
  const enc = mp3Encoder();
  if (!enc) {
    const lame = await lameJs();
    if (!lame) throw new Error('MP3-kooderi puuttuu: brew install lame, tai npm install --prefix "<tilakansio>/tools" @breezystack/lamejs@1.2.7');
    const src = decodeWav(fs.readFileSync(wavFile));
    // At low bitrates LAME picks 22.05 kHz and lamejs's internal 24→22.05 kHz resampler can output pure
    // silence. Resample here so lamejs never resamples.
    const rate = kbps <= 32 && src.rate > 22050 ? 22050 : src.rate;
    const samples = resample(src.samples, src.rate, rate);
    const pcm = Int16Array.from(samples, (x) => Math.max(-32768, Math.min(32767, Math.round(x * 32767))));
    const m = new lame.Mp3Encoder(1, rate, kbps), parts = [];
    for (let i = 0; i < pcm.length; i += 1152) { const b = m.encodeBuffer(pcm.subarray(i, i + 1152)); if (b.length) parts.push(Buffer.from(b)); }
    const end = m.flush(); if (end.length) parts.push(Buffer.from(end));
    fs.writeFileSync(out, Buffer.concat(parts));
    return;
  }
  if (enc === 'ffmpeg') execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', wavFile, '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', `${kbps}k`, '-map_metadata', '-1', out]);
  else execFileSync('lame', ['--quiet', '-m', 'm', '-b', String(kbps), '--noreplaygain', wavFile, out]);
}

/** Decodes a finished MP3 (macOS afconvert, or ffmpeg) and measures it. null: no decoder on this machine. */
function mp3Signal(file) {
  const tmp = path.join(stateDir(), 'tmp-decoded.wav');
  try {
    try { execFileSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16', file, tmp], { stdio: 'ignore' }); }
    catch (e) {
      if (e.code !== 'ENOENT') throw e;
      try { execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-ac', '1', '-c:a', 'pcm_s16le', tmp], { stdio: 'ignore' }); }
      catch (e2) { if (e2.code === 'ENOENT') return null; throw e2; }
    }
    const { samples, rate } = decodeWav(fs.readFileSync(tmp));
    return { ...analyze(samples, rate), rate };
  } finally { fs.rmSync(tmp, { force: true }); }
}
/** A packed file must carry the master's sound: same level within 3 dB, same length within 0.3 s. */
const SIGNAL_DB = 3, SIGNAL_MS = 300;
const signalProblem = (d, master) => !d ? 'tasoa ei voitu mitata'
  : !(Math.abs(d.rmsDb - master.rmsDb) <= SIGNAL_DB) ? `taso ${d.rmsDb} dB, masterissa ${master.rmsDb} dB`
  : Math.abs(d.ms - master.ms) > SIGNAL_MS ? `kesto ${d.ms} ms, masterissa ${master.ms} ms` : null;

/** Writes lite/public/audio: hashed files + manifest.json. Default: approved only. --pilot also ships
 *  synthesized effect candidates, flagged as such in the manifest. */
async function cmdPack(o) {
  const pilot = !!o.pilot;
  const manifest = { schema: 'sammakko-audio-manifest/1', pilot, speech: {}, sfx: {} };
  const keep = new Set(['manifest.json']);
  // Speech
  const provDir = P('audio/provenance/speech');
  for (const f of fs.existsSync(provDir) ? fs.readdirSync(provDir).filter((x) => x.endsWith('.json')).sort() : []) {
    const pr = readJson(path.join(provDir, f));
    if (!(pr.status === 'approved' || (pilot && pr.status === 'provisional'))) continue;
    const cut = takeProblem(pr.master, pr.spokenText);
    if (cut) { console.warn(`⚠ ${pr.id}: ${cut}, ei paketoida (selaimen ääni lukee repliikin)`); continue; }
    const master = path.join(stateDir(), 'masters', 'speech', path.basename(pr.master.archive));
    if (!fs.existsSync(master)) throw new Error(`${pr.id}: master puuttuu arkistosta (${pr.master.archive})`);
    if (sha256(fs.readFileSync(master)) !== pr.master.sha256) throw new Error(`${pr.id}: masterin SHA256 ei täsmää`);
    const kbps = BITRATE[pr.scope ?? 'core-fi'] ?? 80;
    const tmp = path.join(stateDir(), 'tmp.mp3'); await toMp3(master, tmp, kbps);
    // Decode what will ship: a silent or truncated file never reaches the manifest.
    const d = mp3Signal(tmp);
    if (d === null) throw new Error('MP3-tiedostojen signaalitarkistus vaatii dekooderin (macOS afconvert tai ffmpeg).');
    const bad = signalProblem(d, pr.master);
    if (bad) throw new Error(`${pr.id}: pakattu MP3 ei vastaa masteria (${bad})`);
    const bytes = fs.readFileSync(tmp), rel = `speech/fi-FI/${pr.id}.${sha256(bytes).slice(0, 10)}.mp3`;
    fs.mkdirSync(path.dirname(path.join(PUBLIC, rel)), { recursive: true }); fs.writeFileSync(path.join(PUBLIC, rel), bytes); keep.add(rel);
    pr.asset = { path: `lite/public/audio/${rel}`, sha256: sha256(bytes), format: 'audio/mpeg', bitrateKbps: kbps, bytes: bytes.length, ms: pr.master.ms, channels: 1, rate: d.rate,
      decoded: { rmsDb: d.rmsDb, peakDb: d.peakDb, ms: d.ms } };
    writeJson(path.join(provDir, f), pr);
    manifest.speech[speechKey(pr.speaker, pr.displayText)] = { id: pr.id, src: rel, ms: pr.master.ms, ...(pr.status === 'provisional' ? { provisional: true } : {}) };
  }
  // Effects
  const sfxProv = P('audio/provenance/sfx.json');
  if (fs.existsSync(sfxProv)) for (const a of readJson(sfxProv).assets) {
    if (!(a.status === 'approved' || (pilot && a.status === 'candidate'))) continue;
    const file = path.join(PUBLIC, a.path);
    if (!fs.existsSync(file) || sha256(fs.readFileSync(file)) !== a.sha256) throw new Error(`${a.path}: tiedosto puuttuu tai SHA256 ei täsmää (aja sfx)`);
    keep.add(a.path);
    (manifest.sfx[a.family] ??= []).push({ src: a.path, ms: a.ms });
  }
  // Soundscape loops (opt-in in the app), approved after listening in the world kit.
  manifest.ambient = liteAmbient(keep);
  // Remove stale hashed files.
  const walk = (d) => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]) : [];
  for (const f of walk(PUBLIC)) { const rel = path.relative(PUBLIC, f).split(path.sep).join('/'); if (!keep.has(rel)) { fs.rmSync(f); console.log(`  poistettu vanha ${rel}`); } }
  writeJson(path.join(PUBLIC, 'manifest.json'), manifest);
  const nS = Object.keys(manifest.speech).length, nF = Object.values(manifest.sfx).flat().length;
  console.log(`manifest.json: ${nS} puhetta, ${nF} tehostetta (${Object.keys(manifest.sfx).length} perhettä), ${Object.keys(manifest.ambient).length} äänimaisemasilmukkaa${pilot ? ', pilotti: sisältää kuuntelemattomia ehdokkaita' : ''}.`);
}

/** Lite soundscape: the world kit's approved loops (audio/provenance/world.json), copied byte for byte
 *  from the kit build (stateDir()/world/files) to lite/public/audio/amb/ after a SHA-256 check.
 *  One loop per family; the app crossfades copies every `loop.period` s over `loop.xfade` s, the same
 *  mix the kit's seam check measured. Returns the manifest's `ambient` map and marks the files kept. */
function liteAmbient(keep) {
  const provFile = P('audio/provenance/world.json'), out = {};
  if (!fs.existsSync(provFile)) return out;
  for (const a of readJson(provFile).assets) {
    if (!(a.loop && a.status === 'approved' && a.path)) continue;
    if (out[a.family]) throw new Error(`${a.family}: useampi hyväksytty silmukka; Lite soittaa yhtä perhettä kohden yhden`);
    const rel = `amb/${a.family}-${a.n}.${a.sha256.slice(0, 10)}.mp3`, dest = path.join(PUBLIC, rel);
    if (!(fs.existsSync(dest) && sha256(fs.readFileSync(dest)) === a.sha256)) {
      const src = path.join(stateDir(), 'world', 'files', `${a.family}-${a.n}.mp3`);
      if (!fs.existsSync(src) || sha256(fs.readFileSync(src)) !== a.sha256) throw new Error(`${a.family}-${a.n}: hyväksytty silmukka puuttuu tai SHA256 ei täsmää (aja world)`);
      fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.copyFileSync(src, dest);
    }
    keep.add(rel);
    out[a.family] = { src: rel, ms: a.ms, loop: { period: a.loop.period, xfade: a.loop.xfade } };
  }
  return out;
}

/** Updates only the manifest's soundscape (speech and effects stay as packed). */
function cmdAmbient() {
  const file = path.join(PUBLIC, 'manifest.json'), man = readJson(file), keep = new Set();
  man.ambient = liteAmbient(keep);
  const dir = path.join(PUBLIC, 'amb');
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) if (!keep.has(`amb/${f}`)) { fs.rmSync(path.join(dir, f)); console.log(`  poistettu vanha amb/${f}`); }
  writeJson(file, man);
  const kb = [...keep].reduce((s, r) => s + fs.statSync(path.join(PUBLIC, r)).size, 0) / 1024;
  console.log(`manifest.json: ${keep.size} äänimaisemasilmukkaa (${kb.toFixed(0)} kt): ${Object.keys(man.ambient).join(', ') || '–'}.`);
}

function cmdSfx() {
  const out = [];
  fs.mkdirSync(path.join(PUBLIC, 'sfx'), { recursive: true });
  const lib = readJson(P('audio/library/sfx.json'));
  const libFamilies = new Set(lib.clips.map((c) => c.family));
  for (const c of renderAll()) {
    if (libFamilies.has(c.family)) continue; // replaced by a library recording
    const wav = encodeWav(c.samples, SFX_RATE), h = sha256(wav);
    const rel = `sfx/${c.family}-${c.n}.${h.slice(0, 10)}.wav`;
    fs.writeFileSync(path.join(PUBLIC, rel), wav);
    out.push({ family: c.family, n: c.n, path: rel, sha256: h, bytes: wav.length, format: 'audio/wav', rate: SFX_RATE, channels: 1, bits: 16, ...analyze(c.samples, SFX_RATE),
      source: { kind: 'procedural', recipe: RECIPE_VERSION, seed: c.seed, code: 'tools/audiogen/lib/sfx.mjs' },
      rights: { basis: 'Own procedural synthesis in this repository; no third-party samples', distribution: 'same terms as the repository code' },
      status: 'candidate', review: null });
  }
  const sources = new Map();
  for (const c of lib.clips) {
    const src = lib.sources[c.source];
    if (!sources.has(c.source)) sources.set(c.source, loadSource(src, path.join(stateDir(), 'library'), path.join(stateDir(), 'tmp'), SFX_RATE));
    const y = cutClip(sources.get(c.source), SFX_RATE, c), wav = encodeWav(y, SFX_RATE), h = sha256(wav);
    const rel = `sfx/${c.family}-${c.n}.${h.slice(0, 10)}.wav`;
    fs.writeFileSync(path.join(PUBLIC, rel), wav);
    out.push({ family: c.family, n: c.n, path: rel, sha256: h, bytes: wav.length, format: 'audio/wav', rate: SFX_RATE, channels: 1, bits: 16, ...analyze(y, SFX_RATE),
      source: { kind: 'library', title: src.title, author: src.author, page: src.page, original: src.original, download: src.download, excerpt: { start: c.start, dur: c.dur }, processing: 'afconvert mono + high-pass 180 Hz + 12 ms fades + peak ' + c.peakDb + ' dB', code: 'tools/audiogen/lib/library.mjs' },
      rights: { basis: src.license, distribution: 'Sammakko app asset; source credited in docs/audio/AUDIO_FI.md' },
      status: 'candidate', review: null });
  }
  const prev = fs.existsSync(P('audio/provenance/sfx.json')) ? readJson(P('audio/provenance/sfx.json')).assets : [];
  // A listening decision survives regeneration only when the file is byte-identical.
  for (const a of out) { const p = prev.find((x) => x.sha256 === a.sha256); if (p) { a.status = p.status; a.review = p.review; } }
  writeJson(P('audio/provenance/sfx.json'), { schema: 'sammakko-audio-sfx-provenance/1', note: 'Synthesized candidates and free-library clips (audio/library/sfx.json). Status changes only after listening (approved/rejected).', assets: out });
  const bytes = out.reduce((s, a) => s + a.bytes, 0);
  console.log(`${out.length} tehosteehdokasta (${lib.clips.length} kirjastosta), ${new Set(out.map((a) => a.family)).size} perhettä, ${(bytes / 1024).toFixed(0)} kt yhteensä.`);
}

function cmdVerify(o) {
  const problems = [];
  // 1. Every catalog line still exists in the source (source-bound).
  const inv = inventory(REPO), live = new Set(inv.lines.map((l) => `${l.speaker}|${l.displayText}`));
  const core = readJson(path.join(CATALOG, 'core.json')).lines;
  const gone = core.filter((l) => !live.has(`${l.speaker}|${l.displayText}`));
  gone.forEach((l) => problems.push(`katalogi: ${l.id} ei enää löydy lähteestä`));
  // 2. Manifest files exist with the declared hashes; every speech hit matches an approved provenance.
  const man = readJson(path.join(PUBLIC, 'manifest.json'));
  const provs = new Map();
  const provDir = P('audio/provenance/speech');
  if (fs.existsSync(provDir)) for (const f of fs.readdirSync(provDir)) { const p = readJson(path.join(provDir, f)); provs.set(p.id, p); }
  for (const [k, e] of Object.entries(man.speech)) {
    const p = provs.get(e.id);
    const ok = p && (p.status === 'approved' || (p.status === 'provisional' && man.pilot && e.provisional));
    if (!ok) problems.push(`manifesti: ${e.id} ilman hyväksyntää`);
    else if (speechKey(p.speaker, p.displayText) !== k) problems.push(`manifesti: ${e.id} avain ei vastaa tekstiä/roolia`);
    else if (!fs.existsSync(path.join(PUBLIC, e.src)) || sha256(fs.readFileSync(path.join(PUBLIC, e.src))) !== p.asset?.sha256) problems.push(`manifesti: ${e.src} puuttuu tai tiiviste väärä`);
    else {
      // The level measured from the packed file at pack time; --signal decodes every file again.
      const bad = signalProblem(o.signal ? mp3Signal(path.join(PUBLIC, e.src)) : p.asset.decoded && { ...p.asset.decoded }, p.master);
      if (bad) problems.push(`signaali: ${e.src}: ${bad}`);
    }
  }
  const sfxProv = fs.existsSync(P('audio/provenance/sfx.json')) ? readJson(P('audio/provenance/sfx.json')).assets : [];
  for (const [fam, vs] of Object.entries(man.sfx)) for (const v of vs) {
    const a = sfxProv.find((x) => x.path === v.src);
    if (!a) problems.push(`manifesti: ${v.src} ilman alkuperätietoa`);
    else if (!fs.existsSync(path.join(PUBLIC, v.src)) || sha256(fs.readFileSync(path.join(PUBLIC, v.src))) !== a.sha256) problems.push(`manifesti: ${v.src} puuttuu tai tiiviste väärä`);
    else if (a.status !== 'approved' && !man.pilot) problems.push(`manifesti: ${v.src} ei hyväksytty`);
    if (a && a.family !== fam) problems.push(`manifesti: ${v.src} väärässä perheessä`);
  }
  // Soundscape loops: an approved world-kit loop each, byte-identical, with the loop timing it was checked with.
  const worldProv = fs.existsSync(P('audio/provenance/world.json')) ? readJson(P('audio/provenance/world.json')).assets : [];
  for (const [fam, v] of Object.entries(man.ambient ?? {})) {
    const sha = fs.existsSync(path.join(PUBLIC, v.src)) ? sha256(fs.readFileSync(path.join(PUBLIC, v.src))) : null;
    const a = sha && worldProv.find((x) => x.sha256 === sha);
    if (!sha) problems.push(`äänimaisema: ${v.src} puuttuu`);
    else if (!a) problems.push(`äänimaisema: ${v.src} ilman alkuperätietoa (audio/provenance/world.json)`);
    else {
      if (a.status !== 'approved') problems.push(`äänimaisema: ${v.src} ei hyväksytty`);
      if (a.family !== fam) problems.push(`äänimaisema: ${v.src} väärässä perheessä`);
      if (!v.src.includes(`.${sha.slice(0, 10)}.`)) problems.push(`äänimaisema: ${v.src} nimen tiiviste väärä`);
      if (!a.loop || a.loop.period !== v.loop?.period || a.loop.xfade !== v.loop?.xfade) problems.push(`äänimaisema: ${v.src} silmukan ajoitus eri kuin tarkistetussa`);
    }
  }
  // 3. Coverage of the core catalog (reported, not guessed).
  const covered = core.filter((l) => man.speech[speechKey(l.speaker, l.displayText)]).length;
  const prov = Object.values(man.speech).filter((e) => e.provisional).length;
  console.log(`Ydinkatalogi: ${covered}/${core.length} repliikillä äänite (${((100 * covered) / core.length).toFixed(1)} %), joista väliaikaisia ${prov}.`);
  const sfxOpen = Object.values(man.sfx).flat().filter((v) => sfxProv.find((x) => x.path === v.src)?.status !== 'approved').length;
  console.log(`Tehosteet: ${Object.values(man.sfx).flat().length} tiedostoa, joista kuuntelemattomia ehdokkaita ${sfxOpen}.`);
  console.log(`Äänimaisema: ${Object.keys(man.ambient ?? {}).length} silmukkaa.`);
  // 4. Candidate transcripts for a scope.
  if (o.scope) {
    const dir = candidatesDir(o.scope);
    const metas = fs.existsSync(dir) ? fs.readdirSync(dir).flatMap((id) => fs.readdirSync(path.join(dir, id)).filter((f) => f.endsWith('.json')).map((f) => readJson(path.join(dir, id, f)))) : [];
    for (const m of metas) if (!m.check.exact) problems.push(`ehdokas ${m.id}/${m.voice}: puuttuu [${m.check.missing.join(' ')}], lisätty [${m.check.extra.join(' ')}]`);
    console.log(`Ehdokkaita (${o.scope}): ${metas.length}; numeroita sisältäviä kuunneltavia ${metas.filter((m) => m.check.numbers).length}.`);
  }
  if (problems.length) { problems.forEach((p) => console.log(`✖ ${p}`)); process.exitCode = 1; } else console.log('✔ Ei ongelmia.');
}

// ---------------------------------------------------------------- audition page
function cmdAudition(o) {
  const scope = o.scope ?? 'audition-fi';
  const dir = candidatesDir(scope);
  const metas = fs.existsSync(dir) ? fs.readdirSync(dir).flatMap((id) => fs.readdirSync(path.join(dir, id)).filter((f) => f.endsWith('.json')).map((f) => ({ ...readJson(path.join(dir, id, f)), file: path.join(dir, id, f.replace(/\.json$/, '.wav')) }))) : [];
  const sfx = fs.existsSync(P('audio/provenance/sfx.json')) ? readJson(P('audio/provenance/sfx.json')).assets : [];
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // Level matching: each clip is played at a volume that brings its RMS to the quietest clip's level.
  const vol = (rmsDb, floorDb) => Math.min(1, 10 ** ((floorDb - rmsDb) / 20)).toFixed(3);
  const floorS = Math.min(...metas.map((m) => m.wav.rmsDb), 0), floorF = Math.min(...sfx.map((a) => a.rmsDb), 0);
  const byLine = new Map(); for (const m of metas) (byLine.get(m.id) ?? byLine.set(m.id, []).get(m.id)).push(m);
  const rows = [...byLine.values()].map((ms) => `<section><h3>${esc(ms[0].displayText)}</h3><p class="muted">Puheteksti: ${esc(ms[0].spokenText)} · rooli ${esc(ms[0].speaker)}</p>
    ${ms.map((m) => `<div class="cand"><b>${esc(m.voice)}</b> <audio controls preload="none" data-vol="${vol(m.wav.rmsDb, floorS)}" src="file://${esc(m.file)}"></audio>
    <span class="${m.check.exact ? 'ok' : 'bad'}">${m.check.exact ? 'transkriptio täsmää' : `ero: −[${esc(m.check.missing.join(' '))}] +[${esc(m.check.extra.join(' '))}]`}</span>${m.check.numbers ? ' <span class="warn">numerot: kuuntele</span>' : ''}
    <div class="muted small">“${esc(m.transcript)}” · ${m.wav.ms} ms · ${esc(m.model)}</div></div>`).join('')}</section>`).join('');
  const sfxRows = Object.entries(Object.groupBy(sfx, (a) => a.family)).map(([fam, as]) => `<section><h3>${esc(fam)}</h3>${as.map((a) => `<div class="cand">#${a.n} <audio controls preload="none" data-vol="${vol(a.rmsDb, floorF)}" src="file://${esc(P('lite/public/audio', a.path))}"></audio> <span class="muted small">${a.ms} ms · huippu ${a.peakDb} dBFS · ${esc(a.status)}</span></div>`).join('')}</section>`).join('');
  const html = `<!doctype html><meta charset="utf-8"><title>Sammakko – koeäänet</title><style>body{font:15px system-ui;max-width:860px;margin:24px auto;padding:0 16px}section{border-top:1px solid #ddd;padding:8px 0}.cand{margin:6px 0}.muted{color:#666}.small{font-size:12px}.ok{color:#2a7a2a}.bad{color:#b33}.warn{color:#a60}audio{vertical-align:middle;height:32px}</style>
<h1>Koeäänet: ${esc(scope)}</h1><p>Kehityksen työväline, ei lasten näkymä. Toistot on tasattu RMS-tasoon, jotta kovempi näyte ei voita voimakkuudellaan. Kuuntele samoilla kuulokkeilla. Arvioi: sananmukaisuus, ääntäminen, matemaattinen merkitys, nopeus, tauot, hahmon sävy, toiston väsyttävyys.</p>
<h2>Puhe (${metas.length} ehdokasta)</h2>${rows || '<p class="muted">Ei vielä puhe-ehdokkaita. Aja: node tools/audiogen/cli.mjs render --scope audition-fi --live --budget-usd 2</p>'}
<h2>Tehosteet (${sfx.length})</h2>${sfxRows}
<script>document.querySelectorAll('audio').forEach(a=>{a.volume=+a.dataset.vol;a.addEventListener('play',()=>document.querySelectorAll('audio').forEach(b=>b!==a&&b.pause()))})</script>`;
  const out = path.join(stateDir(), `audition-${scope}.html`);
  fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, html);
  console.log(`→ ${out}`);
}

// ---------------------------------------------------------------- world sound kit (/saaristo/)
const WORLD_OUT = P('public/kotisivu/assets/saaristo/audio');
const WORLD_URL = '/assets/saaristo/audio';
const WORLD_KIT = P('lite/src/world/saaristo/sound-kit.json');
/** Size caps per packed file and for the shipped kit. */
const WORLD_BYTES = { oneshot: 24 * 1024, loop: 160 * 1024, total: 640 * 1024 };
/** Packed-file checks: level within ±1 LU of the master, band spectrogram correlation above 0.9. */
const WORLD_LU = 1, WORLD_LIKE = 0.9;

function decodeMp3(file) {
  const tmp = path.join(stateDir(), 'tmp-world-decoded.wav');
  try { execFileSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16', '-c', '1', file, tmp], { stdio: 'ignore' }); return decodeWav(fs.readFileSync(tmp)); }
  finally { fs.rmSync(tmp, { force: true }); }
}

/** Builds the pond-world kit from audio/library/world.json: cut, shape, level against the anchor,
 *  encode, decode and check, then write public/kotisivu/assets/saaristo/audio, the bundle's kit list,
 *  audio/provenance/world.json and a listening page (studio.mjs → /world). */
async function cmdWorld(o) {
  const lib = readJson(P('audio/library/world.json')), rate = lib.rate;
  const only = o.only ? new Set(String(o.only).split(',')) : null;
  const libDir = path.join(stateDir(), 'library'), tmpDir = path.join(stateDir(), 'tmp');
  const cache = new Map();
  const source = (id) => {
    if (!cache.has(id)) { const s = lib.sources[id]; if (!s) throw new Error(`tuntematon lähde ${id}`); cache.set(id, loadSource(s, libDir, tmpDir, rate)); }
    return cache.get(id);
  };
  const sfxProv = readJson(P('audio/provenance/sfx.json')).assets;
  const reused = (family) => sfxProv.filter((a) => a.family === family && a.status !== 'rejected').sort((a, b) => a.n - b.n).map((a) => {
    const d = decodeWav(fs.readFileSync(path.join(PUBLIC, a.path)));
    return { a, x: resample(d.samples, d.rate, rate) };
  });
  const anchorClips = reused(lib.anchor);
  if (!anchorClips.length) throw new Error(`ankkuriperhe ${lib.anchor} puuttuu (audio/provenance/sfx.json)`);
  const anchor = anchorClips.reduce((s, c) => s + W.loudness(c.x, rate, 'oneshot'), 0) / anchorClips.length;
  console.log(`Ankkuri ${lib.anchor}: ${anchor.toFixed(1)} LUFS (lyhyt ikkuna, ${anchorClips.length} näytettä)`);

  const workDir = path.join(stateDir(), 'world'), filesDir = path.join(workDir, 'files');
  fs.mkdirSync(filesDir, { recursive: true }); fs.mkdirSync(WORLD_OUT, { recursive: true });
  const prevProv = fs.existsSync(P('audio/provenance/world.json')) ? readJson(P('audio/provenance/world.json')).assets : [];
  const assets = [], problems = [];
  for (const [family, fam] of Object.entries(lib.families)) {
    if (only && !only.has(family)) { assets.push(...prevProv.filter((a) => a.family === family)); continue; }
    const loop = fam.loop ?? null, mode = loop ? 'integrated' : 'oneshot';
    const clips = fam.reuse ? reused(fam.reuse).map((c, i) => ({ n: i + 1, reuse: c })) : fam.clips.map((c, i) => ({ n: i + 1, ...c }));
    for (const c of clips) {
      let x, excerpt, found;
      if (c.reuse) { x = Float32Array.from(c.reuse.x); excerpt = { reuse: `lite/public/audio/${c.reuse.a.path}` }; }
      else {
        const spec = { hp: fam.hp, lp: fam.lp, env: fam.env, ...c };
        if (loop) {
          const src = source(c.source);
          spec.dur = loop.period + loop.xfade;
          if (c.start === undefined) {
            // Of the starts whose head and tail sound alike, keep the one whose simulated seam has the
            // widest margin to a bump or a dip.
            found = W.findLoop(src, rate, { from: c.search[0], to: c.search[1], period: loop.period, xfade: loop.xfade }).map((f) => {
              const r = W.seamReport(W.renderClip(source, rate, { ...spec, start: f.start }), rate, loop.period, loop.xfade);
              return { ...f, ok: r.ok, margin: Math.min(r.marginHiDb, r.marginLoDb) };
            }).sort((p, q) => (q.ok - p.ok) || (q.margin - p.margin));
            spec.start = found[0].start;
          }
        }
        x = W.renderClip(source, rate, spec);
        excerpt = spec.parts ? { parts: spec.parts.map((p) => ({ source: p.source, start: p.start, dur: p.dur, semitones: p.semitones ?? 0, at: p.at })) } : { source: spec.source, start: spec.start, dur: +spec.dur.toFixed(3), semitones: spec.semitones ?? 0 };
        excerpt.filters = { hp: spec.hp ?? 150, lp: spec.lp ?? null, env: spec.env ?? null };
        if (found) excerpt.loopSearch = { range: c.search, best: found };
      }
      const lev = fam.level === false ? { gainDb: 0, limitedDb: 0, lufs: +W.loudness(x, rate, mode).toFixed(2) } : W.level(x, rate, anchor + (fam.offset ?? 0), mode);
      const id = `${family}-${c.n}`, wavFile = path.join(filesDir, `${id}.wav`);
      fs.writeFileSync(wavFile, encodeWav(x, rate));
      const kbps = lib.kbps[loop ? 'loop' : 'oneshot'], tmp = path.join(filesDir, `${id}.mp3`);
      await toMp3(wavFile, tmp, kbps);
      const d = decodeMp3(tmp), bytes = fs.readFileSync(tmp), bad = [];
      if (d.rate !== rate) bad.push(`dekoodattu ${d.rate} Hz, odotettiin ${rate}`);
      const packedLufs = W.loudness(d.samples, d.rate, mode), like = W.likeness(x, d.samples, rate);
      if (!(Math.abs(packedLufs - lev.lufs) <= WORLD_LU)) bad.push(`taso ${packedLufs.toFixed(1)} vs ${lev.lufs} LUFS`);
      if (!(like.tf >= WORLD_LIKE)) bad.push(`tunnistettavuus ${like.tf} < ${WORLD_LIKE}`);
      let seam = null;
      if (loop) {
        const m = W.seamReport(x, rate, loop.period, loop.xfade), p = W.seamReport(d.samples, d.rate, loop.period, loop.xfade);
        seam = { master: m, packed: p };
        if (!m.ok) bad.push(`master-sauma: ${m.problems.join(', ')}`);
        if (!p.ok) bad.push(`pakattu sauma: ${p.problems.join(', ')}`);
      }
      if (bytes.length > WORLD_BYTES[mode === 'integrated' ? 'loop' : 'oneshot']) bad.push(`koko ${bytes.length} t`);
      const ms = Math.round((x.length / rate) * 1000);
      const h = sha256(bytes), rel = `${id}.${h.slice(0, 10)}.mp3`;
      const src = c.reuse ? c.reuse.a.source : null;
      const parts = c.reuse ? [] : [...new Set((c.parts ?? [c]).map((p) => p.source ?? c.source))];
      const asset = { family, n: c.n, path: c.audition ? null : `public/kotisivu/assets/saaristo/audio/${rel}`, audition: !!c.audition, sha256: h, bytes: bytes.length, format: 'audio/mpeg', bitrateKbps: kbps, rate, channels: 1, ms,
        ...(loop ? { loop: { period: loop.period, xfade: loop.xfade } } : {}),
        source: c.reuse ? { kind: 'reuse', asset: excerpt.reuse, sha256: c.reuse.a.sha256, origin: src } : { kind: 'library', sources: parts.map((s) => ({ id: s, title: lib.sources[s].title, author: lib.sources[s].author, page: lib.sources[s].page, download: lib.sources[s].download })), excerpt },
        rights: c.reuse ? c.reuse.a.rights : { basis: [...new Set(parts.map((s) => lib.sources[s].license))].join('; '), licenseUrl: lib.sources[parts[0]].licenseUrl, distribution: 'Sammakko site asset; sources credited in audio/library/world.json' },
        level: { anchorLufs: +anchor.toFixed(2), offsetLu: fam.level === false ? null : fam.offset ?? 0, mode, ...lev, peakDb: +W.peakDb(x).toFixed(2) },
        packed: { lufs: +packedLufs.toFixed(2), deltaLu: +(packedLufs - lev.lufs).toFixed(2), likeness: like, ...(seam ? { seam } : {}), problems: bad },
        code: 'tools/audiogen/lib/world.mjs', status: 'candidate', review: null };
      const prev = prevProv.find((p) => p.sha256 === h); if (prev) { asset.status = prev.status; asset.review = prev.review; }
      assets.push(asset);
      if (bad.length) problems.push(`${id}: ${bad.join('; ')}`);
      const loopTxt = loop ? ` · alku ${excerpt.start ?? '-'} s · sauma ${seam.packed.ok ? 'ok' : 'VIRHE'} (+${seam.packed.marginHiDb}/${seam.packed.marginLoDb} dB)` : '';
      console.log(`${bad.length ? '✖' : '✓'} ${id.padEnd(16)} ${String(ms).padStart(5)} ms ${(bytes.length / 1024).toFixed(1).padStart(6)} kt  ${lev.lufs.toFixed(1)} LUFS (${lev.gainDb >= 0 ? '+' : ''}${lev.gainDb} dB${lev.limitedDb ? `, huippuraja −${lev.limitedDb}` : ''}) → pakattu ${packedLufs.toFixed(1)} · tunnistettavuus ${like.tf}${loopTxt}${c.audition ? ' · vain kuunteluun' : ''}`);
    }
  }
  if (problems.length) { console.error(problems.map((p) => `  ${p}`).join('\n')); throw new Error(`${problems.length} äänessä tarkistusvirhe; mitään ei kirjoitettu julkaisukansioon`); }

  // Ship: hashed files, kit list for the bundle, publication manifest entries, provenance.
  const shipped = assets.filter((a) => a.path), total = shipped.reduce((s, a) => s + a.bytes, 0);
  if (total > WORLD_BYTES.total) throw new Error(`äänipaketti ${total} t > ${WORLD_BYTES.total} t`);
  const keep = new Set();
  for (const a of shipped) {
    const name = path.basename(a.path), from = path.join(filesDir, `${a.family}-${a.n}.mp3`);
    if (fs.existsSync(from) && sha256(fs.readFileSync(from)) === a.sha256) fs.copyFileSync(from, path.join(WORLD_OUT, name));
    if (!fs.existsSync(path.join(WORLD_OUT, name)) || sha256(fs.readFileSync(path.join(WORLD_OUT, name))) !== a.sha256) throw new Error(`${a.path}: puuttuu tai tiiviste ei täsmää`);
    keep.add(name);
  }
  for (const f of fs.readdirSync(WORLD_OUT)) if (!keep.has(f)) { fs.rmSync(path.join(WORLD_OUT, f)); console.log(`  poistettu vanha ${f}`); }
  const kit = { schema: 'sammakko-saaristo-sound-kit/1', note: 'Generated by tools/audiogen/cli.mjs world. Do not edit.', families: {} };
  for (const a of shipped) {
    const f = (kit.families[a.family] ??= { clips: [] });
    if (a.loop) f.loop = a.loop;
    f.clips.push({ src: `${WORLD_URL}/${path.basename(a.path)}`, ms: a.ms });
  }
  writeJson(WORLD_KIT, kit);
  const pubFile = P('public/kotisivu/publication-manifest.json'), pub = readJson(pubFile);
  pub.files = [...pub.files.filter((f) => !f.startsWith('assets/saaristo/audio/')), ...shipped.map((a) => `assets/saaristo/audio/${path.basename(a.path)}`)];
  writeJson(pubFile, pub);
  writeJson(P('audio/provenance/world.json'), { schema: 'sammakko-audio-world-provenance/1', note: 'Pond-world kit (audio/library/world.json). Status changes only after listening (approved/rejected). path null: audition-only candidate.', anchor: { family: lib.anchor, lufs: +anchor.toFixed(2) }, assets });
  worldAudition(assets, anchor, workDir);
  console.log(`${shipped.length} ääntä julkaisuun (${(total / 1024).toFixed(0)} kt), ${assets.length - shipped.length} vain kuunteluun. Kuuntele: node tools/audiogen/studio.mjs → http://127.0.0.1:5230/world`);
}

/** Listening page for the kit, served by studio.mjs at /world. Loops play as the page will play them. */
function worldAudition(assets, anchor, dir) {
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fams = Object.entries(Object.groupBy(assets, (a) => a.family));
  const row = (a) => {
    const file = `/world/files/${a.family}-${a.n}.mp3`, src = a.source.kind === 'reuse' ? `nykyinen Lite-ääni ${a.source.asset.split('/').pop()}` : a.source.sources.map((s) => `<a href="${esc(s.page)}">${esc(s.title)}</a> (${esc(s.author)})`).join(' + ');
    const ex = a.source.excerpt; const cut = ex?.parts ? `${ex.parts.length} osaa` : ex?.start !== undefined ? `${ex.start}–${(ex.start + ex.dur).toFixed(2)} s${ex.semitones ? `, ${ex.semitones > 0 ? '+' : ''}${ex.semitones} st` : ''}` : '';
    const seam = a.packed.seam ? ` · sauma +${a.packed.seam.packed.marginHiDb}/${a.packed.seam.packed.marginLoDb} dB` : '';
    return `<div class="clip${a.audition ? ' alt' : ''}"><b>#${a.n}</b>${a.audition ? ' <span class="tag">vaihtoehto, ei julkaisussa</span>' : ''}
      ${a.loop ? `<button data-loop="${file}" data-period="${a.loop.period}" data-xfade="${a.loop.xfade}">▶ soita silmukkana</button> <span class="pos"></span>` : `<button data-one="${file}">▶</button>`}
      <audio controls preload="none" src="${file}"></audio>
      <div class="meta">${a.ms} ms · ${(a.bytes / 1024).toFixed(1)} kt · ${a.level.lufs} LUFS (${a.level.offsetLu === null ? 'ennallaan' : `ankkuri ${a.level.offsetLu >= 0 ? '+' : ''}${a.level.offsetLu} LU`}) · pakattu ${a.packed.deltaLu >= 0 ? '+' : ''}${a.packed.deltaLu} LU · tunnistettavuus ${a.packed.likeness.tf}${seam} · ${esc(a.status)}</div>
      <div class="meta">${src}${cut ? ` · ${cut}` : ''}</div></div>`;
  };
  const html = `<!doctype html><meta charset="utf-8"><title>Saariston äänet</title><style>body{font:15px system-ui;max-width:900px;margin:24px auto;padding:0 16px;color:#222}section{border-top:1px solid #ddd;padding:8px 0}.clip{margin:8px 0}.alt{background:#f6f3ea;padding:4px 6px;border-radius:6px}.meta{color:#666;font-size:12px}.tag{color:#a60;font-size:12px}audio{vertical-align:middle;height:30px}button{font:inherit;padding:2px 10px}</style>
<h1>Saariston äänipaketti</h1><p>Kehityksen työväline. Äänet soivat tällä sivulla samalla tasolla kuin sivulla: tasot on sovitettu Loikan kurnaukseen (${anchor.toFixed(1)} LUFS). ▶-nappi soittaa pakatun MP3:n Web Audiolla kuten sivu. "Soita silmukkana" soittaa taustaäänen ristihäivytettynä kuten sivu; saumakohdat näkyvät laskurissa.</p>
<p>Kuuntele erityisesti: tunnistuuko ankanpoikanen, onko jokin perhe liian kova tai hiljainen kurnaukseen nähden, kuuluuko silmukan saumassa (merkitty ●) naksahdus, tauko tai tasohyppy.</p>
${fams.map(([f, as]) => `<section><h3>${esc(f)}</h3>${as.map(row).join('')}</section>`).join('')}
<script>
const ctx = new AudioContext(), bufs = new Map();
const load = (u) => bufs.get(u) ?? bufs.set(u, fetch(u).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b))).get(u);
let stopLoop = null;
document.querySelectorAll('[data-one]').forEach((b) => b.onclick = async () => { await ctx.resume(); const s = ctx.createBufferSource(); s.buffer = await load(b.dataset.one); s.connect(ctx.destination); s.start(); });
const curve = (n, f) => Float32Array.from({ length: n }, (_, i) => f(i / (n - 1)));
document.querySelectorAll('[data-loop]').forEach((b) => b.onclick = async () => {
  await ctx.resume(); if (stopLoop) { const same = stopLoop.btn === b; stopLoop(); if (same) return; }
  const buf = await load(b.dataset.loop), P = +b.dataset.period, X = +b.dataset.xfade, t0 = ctx.currentTime + 0.05, out = ctx.createGain(); out.connect(ctx.destination);
  const fin = curve(64, (u) => Math.sin(u * Math.PI / 2)), fout = curve(64, (u) => Math.cos(u * Math.PI / 2));
  let k = 0, live = [], timer;
  const schedule = () => { while (t0 + k * P < ctx.currentTime + 2 * P) { const t = t0 + k * P, s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = buf; s.connect(g).connect(out);
    if (k > 0) g.gain.setValueCurveAtTime(fin, t, X); g.gain.setValueCurveAtTime(fout, t + P, X); s.start(t); s.stop(t + P + X); live.push(s); k++; } };
  schedule(); timer = setInterval(() => { schedule(); const e = ctx.currentTime - t0, ph = e % P; b.nextElementSibling.textContent = \`\${e.toFixed(1)} s · seuraava sauma \${(P - ph).toFixed(1)} s \${ph < X ? '●' : ''}\`; }, 100);
  b.textContent = '■ pysäytä';
  stopLoop = Object.assign(() => { clearInterval(timer); live.forEach((s) => { try { s.stop(); } catch {} }); out.disconnect(); b.textContent = '▶ soita silmukkana'; b.nextElementSibling.textContent = ''; stopLoop = null; }, { btn: b });
});
document.querySelectorAll('audio').forEach((a) => a.addEventListener('play', () => document.querySelectorAll('audio').forEach((x) => x !== a && x.pause())));
</script>`;
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

// ---------------------------------------------------------------- key / ledger
async function cmdKeySet() {
  const chunks = []; for await (const c of process.stdin) chunks.push(c);
  setApiKey(Buffer.concat(chunks).toString('utf8').trim());
  console.log('✔ Avain tallennettu Keychainiin (palvelu sammakko-openai-audiogen). Tyhjennä leikepöytä: pbcopy < /dev/null');
}
function cmdKeyCheck() { const k = getApiKey(); console.log(k ? `Avain löytyy (${k.source}), pituus ${k.key.length}.` : 'Avainta ei ole tallennettu.'); }
function cmdLedger() { const t = audioTotals(); console.log(JSON.stringify({ audio: t, imagegenThisMonth: imagegenMonthSpent(), config: loadConfig() }, null, 2)); }

const HELP = `node tools/audiogen/cli.mjs <komento>
  inventory                         AST-inventaario → audio/catalog/fi-FI/inventory.json
  catalog                           ydinkatalogi → audio/catalog/fi-FI/core.json
  catalog-lite --sample <f.json>    tehtävien kiinteät repliikit → audio/catalog/fi-FI/lite.json
  plan --scope core-fi [--budget-usd N]
  render --scope audition-fi [--only id,..] [--regenerate] [--live --budget-usd N]
  approve <id> --candidate <wav> [--note …] [--by …]   |  reject <id> --candidate <wav>
  accept --by … [--except id,..]    kuunneltu kirjasto hyväksytyksi (väliaikaiset puheet + tehoste-ehdokkaat)
  takes                             äänitysstudion valinnat (studio.mjs) hyväksytyiksi
  provisional                       sanatarkat core-ehdokkaat väliaikaisiksi (vain pack --pilot)
  sfx                               tehoste-ehdokkaat → lite/public/audio/sfx + audio/provenance/sfx.json
  world [--only perhe,..]           Saariston äänipaketti (audio/library/world.json) → public/kotisivu/assets/saaristo/audio
  ambient                           hyväksytyt maailman silmukat → lite/public/audio/amb + manifestin ambient
  pack [--pilot]                    lite/public/audio/manifest.json (oletus: vain hyväksytyt; --pilot myös väliaikaiset)
  verify [--scope audition-fi]      lähde-, tiiviste- ja kattavuustarkistus
  audition [--scope audition-fi]    kuuntelusivu tilakansioon
  key-set (stdin) | key-check | ledger`;

const o = args(process.argv.slice(2));
const cmds = { inventory: cmdInventory, catalog: cmdCatalog, 'catalog-lite': cmdCatalogLite, plan: cmdPlan, render: cmdRender, approve: (x) => cmdApprove(x, 'approved'), provisional: cmdProvisional, takes: cmdTakes, accept: cmdAccept, reject: (x) => cmdApprove(x, 'rejected'), sfx: cmdSfx, world: cmdWorld, ambient: cmdAmbient, pack: cmdPack, verify: cmdVerify, audition: cmdAudition, 'key-set': cmdKeySet, 'key-check': cmdKeyCheck, ledger: cmdLedger };
const f = cmds[o._[0]];
if (!f) { console.log(HELP); process.exitCode = o._[0] ? 1 : 0; }
else Promise.resolve(f(o)).catch((e) => { console.error(`✖ ${e.message}`); process.exitCode = 1; });
