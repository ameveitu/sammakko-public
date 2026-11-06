// Voice audition: one short role line per (role, model, voice), plus pitch-shifted variants.
// Live and paid: every call is reserved and settled in the shared ledger. Output goes to the
// state folder (samples/), never to the app. Usage:
//   node tools/audiogen/samples.mjs --live --budget-usd 3 [--models gpt-realtime-2.1-mini,gpt-realtime-2.1] [--voices marin,cedar]
import fs from 'node:fs';
import path from 'node:path';
import { renderLine, usageUsd, estimateUsd } from './lib/realtime.mjs';
import { getApiKey, appendLedger, budgetCheck, stateDir } from './lib/state.mjs';
import { pcm16ToFloat, encodeWav, finishSpeech } from './lib/wav.mjs';
import { f0Median, shift } from './lib/voicefx.mjs';
import { normText } from './lib/text.mjs';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i < 0 ? d : process.argv[i + 1]; };
if (!process.argv.includes('--live')) { console.log('Dry-run: lisää --live --budget-usd N'); process.exit(0); }
const budget = Number(arg('budget-usd', 'NaN'));
if (!(budget > 0)) throw new Error('--budget-usd puuttuu');
const models = arg('models', 'gpt-realtime-2.1-mini,gpt-realtime-2.1').split(',');
const voices = arg('voices', 'alloy,ash,ballad,coral,echo,sage,shimmer,verse,marin,cedar').split(',');

const BASE = 'Lue annettu suomalainen teksti täsmälleen, sana sanalta. Älä lisää mitään, älä vastaa tehtävään, älä tee sanattomia ääniä. Älä muuta numeroita.';
export const ROLES = {
  aava: { text: 'Hei! Minä olen Aava. Katsotaan tätä yhdessä.', shifts: [3, 5],
    style: 'Hahmo on pieni ankanpoikanen. Ääni on korkea, kirkas, kevyt ja söpö, iloinen ja utelias. Puhu selkeästi ja ystävällisesti.' },
  loikka: { text: 'Minä olen Loikka. Meillä ei ole kiire.', shifts: [2],
    style: 'Hahmo on nuori sammakko. Ääni on keskikorkea ja nuorekas, kuin pojan tai nuoren miehen ääni. Rauhallinen, pyöreä ja ystävällinen.' },
  narrator: { text: 'Kuuntele ensin. Valitse sitten oikea kuva.', shifts: [],
    style: 'Olet kertoja. Ääni on matala, rauhallinen ja lämmin. Puhu hitaasti ja selkeästi, lyhyt tauko lauseiden välissä.' },
};

const out = path.join(stateDir(), 'samples');
fs.mkdirSync(out, { recursive: true });
const key = getApiKey().key;
const jobs = [];
for (const [role, r] of Object.entries(ROLES)) for (const model of models) for (const voice of voices) jobs.push({ role, r, model, voice });
const results = [];
let spent = 0;

async function run(j) {
  const instructions = BASE + ' ' + j.r.style;
  const e = estimateUsd(j.r.text, j.model, instructions);
  if (spent + e > budget) return console.log('SKIP budget', j.role, j.model, j.voice);
  const chk = budgetCheck(e, { runBudgetUsd: budget - spent });
  if (!chk.ok) return console.log('SKIP', chk.reason);
  const id = `sample/${j.role}/${j.model}/${j.voice}/${Date.now()}`;
  appendLedger({ id, kind: 'reserve', usd: e, scope: 'voice-samples' });
  spent += e;
  try {
    const res = await renderLine({ key, model: j.model, voice: j.voice, instructions, text: j.r.text, timeoutMs: 60000 });
    const c = usageUsd(res.usage, j.model) ?? e;
    appendLedger({ id, kind: 'settle', usd: c, scope: 'voice-samples', usage: res.usage });
    spent += c - e;
    const f = finishSpeech(pcm16ToFloat(res.pcm), res.rate).samples;
    const exact = normText(res.transcript ?? '') === normText(j.r.text);
    const base = `${j.role}-${j.voice}-${j.model.replace('gpt-realtime-', 'rt')}`;
    const variants = [{ st: 0, file: base + '.wav' }, ...j.r.shifts.map((st) => ({ st, file: `${base}+${st}.wav` }))];
    for (const v of variants) {
      const y = v.st ? shift(f, res.rate, v.st) : f;
      fs.writeFileSync(path.join(out, v.file), encodeWav(y, res.rate));
      results.push({ role: j.role, model: j.model, voice: j.voice, shift: v.st, file: v.file, f0: f0Median(y, res.rate), sec: +(y.length / res.rate).toFixed(2), exact, transcript: res.transcript, usd: v.st ? 0 : c });
    }
    console.log(exact ? 'ok ' : 'DIFF', base, f0Median(f, res.rate) + 'Hz', '$' + c.toFixed(4), exact ? '' : JSON.stringify(res.transcript));
  } catch (err) {
    appendLedger({ id, kind: err.sent ? 'uncertain' : 'release', usd: err.sent ? e : 0, scope: 'voice-samples' });
    if (!err.sent) spent -= e;
    console.log('FAIL', j.role, j.model, j.voice, String(err.message).slice(0, 200));
  }
}

const queue = [...jobs];
await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) await run(queue.shift()); }));
const prev = fs.existsSync(path.join(out, 'index.json')) ? JSON.parse(fs.readFileSync(path.join(out, 'index.json'))) : [];
const keep = prev.filter((p) => !results.some((r) => r.file === p.file));
fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify([...keep, ...results], null, 1));
console.log('Yhteensä $' + spent.toFixed(4), results.length, 'tiedostoa →', out);
