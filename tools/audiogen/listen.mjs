#!/usr/bin/env node
// Listening probe (developer machine only, spends money, ledger-counted).
//   node tools/audiogen/listen.mjs files --match Loikka --limit 6 --budget-usd 0.1
//     transcribes published files whose display text matches, prints shown vs heard.
//   node tools/audiogen/listen.mjs variants --speaker narrator --text "Loikka hyppää." --spell "Loikka|Loi-kka" --word Loikka --repeat 2 --budget-usd 0.3
//   node tools/audiogen/listen.mjs wavs --list rows.txt --budget-usd 0.1   ("<id> <wav>" rows: candidate takes)
//     reads the text with each spelling of --word, transcribes every take, prints what was heard.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hear, earEstimate } from './lib/ear.mjs';
import { estimateUsd, renderLine, usageUsd } from './lib/realtime.mjs';
import { appendLedger, budgetCheck, getApiKey, stateDir } from './lib/state.mjs';
import { shift } from './lib/voicefx.mjs';
import { encodeWav, finishSpeech, pcm16ToFloat } from './lib/wav.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const o = { _: [] };
for (let i = 2; i < process.argv.length; i++) { const a = process.argv[i]; if (a.startsWith('--')) o[a.slice(2)] = process.argv[i + 1]?.startsWith('--') ? true : process.argv[++i]; else o._.push(a); }
const budget = Number(o['budget-usd']);
if (!(budget > 0)) throw new Error('--budget-usd N vaaditaan');
const key = getApiKey();
if (!key) throw new Error('Avainta ei löydy.');
let spent = 0;
async function paid(est, line, f) {
  const chk = budgetCheck(est, { runBudgetUsd: budget, runSpent: spent });
  if (!chk.ok) throw new Error(chk.reason);
  const id = `listen/${line}/${Date.now()}/${Math.random().toString(36).slice(2, 7)}`;
  appendLedger({ id, kind: 'reserve', usd: est, scope: 'listen', line }); spent += est;
  try { const { value, usd } = await f(); appendLedger({ id, kind: 'settle', usd: usd ?? est, scope: 'listen', line }); spent += (usd ?? est) - est; return value; }
  catch (e) { appendLedger({ id, kind: e.sent === false ? 'release' : 'uncertain', usd: e.sent === false ? 0 : est, scope: 'listen', line }); throw e; }
}
const listen = (file, ms) => paid(earEstimate(ms), path.basename(file), async () => ({ value: await hear({ key: key.key, file }) }));

if (o._[0] === 'files') {
  const re = new RegExp(o.match ?? '.', 'u');
  const lines = ['core', 'lite'].flatMap((c) => readJson(path.join(REPO, 'audio/catalog/fi-FI', `${c}.json`)).lines);
  const man = readJson(path.join(REPO, 'lite/public/audio/manifest.json')).speech;
  const byId = new Map(Object.values(man).map((e) => [e.id, e]));
  const hits = lines.filter((l) => re.test(l.displayText) && byId.has(l.id)).slice(0, Number(o.limit ?? 5));
  for (const l of hits) {
    const e = byId.get(l.id);
    const heard = await listen(path.join(REPO, 'lite/public/audio', e.src), e.ms);
    console.log(`${l.id}\n  näyttö: ${l.displayText}\n  kuultu: ${heard}`);
  }
} else if (o._[0] === 'variants') {
  const V = readJson(path.join(REPO, 'audio/voices.json'));
  const prof = V.profiles[o.speaker ?? 'narrator'];
  const dir = path.join(stateDir(), 'probe'); fs.mkdirSync(dir, { recursive: true });
  for (const spell of String(o.spell).split('|')) for (let k = 0; k < Number(o.repeat ?? 1); k++) {
    const text = String(o.text).replaceAll(String(o.word), spell);
    const r = await paid(estimateUsd(text, prof.model, prof.instructions), `probe:${spell}`, async () => {
      const r = await renderLine({ key: key.key, model: prof.model, voice: prof.voice, instructions: prof.instructions, text });
      return { value: r, usd: usageUsd(r.usage, prof.model) };
    });
    const pcm = pcm16ToFloat(r.pcm);
    const fin = finishSpeech(prof.shiftSemitones ? shift(pcm, r.rate, prof.shiftSemitones) : pcm, r.rate);
    const file = path.join(dir, `${o.speaker ?? 'narrator'}-${spell.replace(/[^\p{L}\p{N}-]/gu, '_')}-${k}.wav`);
    fs.writeFileSync(file, encodeWav(fin.samples, r.rate));
    const heard = await listen(file, (fin.samples.length / r.rate) * 1000);
    console.log(`${spell} #${k}: kuultu "${heard}"`);
  }
} else if (o._[0] === 'wavs') {
  // node tools/audiogen/listen.mjs wavs --list file.txt --budget-usd 0.1   (rows: "<id> <wav path>")
  for (const row of fs.readFileSync(o.list, 'utf8').split('\n').filter(Boolean)) {
    const [id, ...rest] = row.split(' '); const file = rest.join(' ');
    const ms = (fs.statSync(file).size - 44) / 48;
    console.log(`${id}\n  kuultu: ${await listen(file, ms)}`);
  }
} else throw new Error('files | variants | wavs');
console.log(`Tämä ajo ≈ ${spent.toFixed(4)} $`);
