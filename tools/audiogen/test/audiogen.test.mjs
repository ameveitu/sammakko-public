// Run: node --test tools/audiogen/test/audiogen.test.mjs
// No network and no key: the Realtime socket is a fake, and the CLI runs against a refused local port.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareTranscript, fnv64, inputHash, speechKey } from '../lib/text.mjs';
import { analyze, decodeWav, encodeWav, finishSpeech, resample } from '../lib/wav.mjs';
import { renderAll } from '../lib/sfx.mjs';
import { estimateUsd, renderLine, usageUsd } from '../lib/realtime.mjs';
import { audioTotals, budgetCheck } from '../lib/state.mjs';
import { needsSpokenReview } from '../lib/inventory.mjs';
import { scanText } from '../../secret-scan.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.resolve(here, '..', 'cli.mjs');
const FAKE_KEY = ['s', 'k-proj-', 'TESTONLY', 'x'.repeat(30)].join('');
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'audiogen-test-'));
const MODEL = 'gpt-realtime-2.1-mini';

// ---------------------------------------------------------------- text
test('keys are stable and speaker-specific', () => {
  assert.equal(fnv64(''), 'cbf29ce484222325');
  assert.equal(speechKey('narrator', ' Hei  vaan '), speechKey('narrator', 'Hei vaan'));
  assert.notEqual(speechKey('Aava', 'Hei'), speechKey('Loikka', 'Hei'));
  const base = { spokenText: 'Hei', locale: 'fi-FI', speaker: 'Aava', provider: 'p', model: MODEL, voice: 'marin', styleVersion: 'aava/1', processing: 'finish/1' };
  assert.notEqual(inputHash(base), inputHash({ ...base, voice: 'cedar' }));
  assert.notEqual(inputHash(base), inputHash({ ...base, styleVersion: 'aava/2' }));
});

test('transcript check flags differences and always flags numbers', () => {
  const ok = compareTranscript('Hyvä, tämä meni oikein!', 'hyvä tämä meni oikein');
  assert.equal(ok.exact, true); assert.equal(ok.listenFirst, false);
  const bad = compareTranscript('Lennä rantaan.', 'Lennä metsään.');
  assert.deepEqual([bad.missing, bad.extra], [['rantaan'], ['metsään']]);
  assert.equal(compareTranscript('Kolme ja puoli.', 'Kolme ja puoli.').listenFirst, true);
});

test('lines with digits or maths need a reviewed spoken form', () => {
  for (const t of ['3 + 4', 'x = 2', '50 %', '−5', '-5 astetta', '2²']) assert.equal(needsSpokenReview(t), true, t);
  for (const t of ['Hyvä työ!', 'Lennetään järvelle.', 'Aava-sorsa']) assert.equal(needsSpokenReview(t), false, t);
});

// ---------------------------------------------------------------- audio
test('WAV round trip and speech finishing', () => {
  const rate = 24000, x = new Float32Array(rate);
  for (let i = 0; i < x.length; i++) x[i] = i > 4000 && i < 20000 ? 0.05 * Math.sin(i / 7) : 0;
  const fin = finishSpeech(x, rate);
  const a = analyze(fin.samples, rate);
  assert.ok(fin.samples.length < x.length, 'leading/trailing silence is trimmed');
  assert.ok(Math.abs(a.rmsDb + 20) < 1.5, `rms ${a.rmsDb}`);
  assert.ok(a.peakDb <= -0.9, `peak ${a.peakDb}`);
  const back = decodeWav(encodeWav(fin.samples, rate));
  assert.equal(back.rate, rate);
  assert.equal(back.samples.length, fin.samples.length);
  assert.ok(Math.abs(back.samples[1000] - fin.samples[1000]) < 1e-4);
});

test('resample 24 → 22.05 kHz keeps a speech-band tone and its level', () => {
  // lamejs's own resampler turned 24 kHz speech into silence at 32 kbps; pack resamples first.
  const tone = Float32Array.from({ length: 24000 }, (_, i) => 0.3 * Math.sin((2 * Math.PI * 440 * i) / 24000));
  const out = resample(tone, 24000, 22050), a = analyze(tone, 24000), b = analyze(out, 22050);
  assert.equal(out.length, 22050);
  assert.ok(Math.abs(b.rmsDb - a.rmsDb) < 0.2, `${a.rmsDb} → ${b.rmsDb}`);
  assert.ok(Math.abs(b.ms - a.ms) <= 1);
  assert.deepEqual(resample(tone, 24000, 24000), tone);
});

test('effect candidates are deterministic and within their peak', () => {
  const a = renderAll(), b = renderAll();
  assert.equal(a.length, 27);
  for (let i = 0; i < a.length; i++) {
    assert.deepEqual(Buffer.from(encodeWav(a[i].samples, 48000)), Buffer.from(encodeWav(b[i].samples, 48000)), a[i].family);
    let p = 0; for (const s of a[i].samples) p = Math.max(p, Math.abs(s));
    assert.ok(Math.abs(20 * Math.log10(p) - a[i].peakDb) < 0.1, a[i].family);
  }
});

// ---------------------------------------------------------------- cost
test('estimate and usage pricing', () => {
  const e = estimateUsd('Hyvä, tämä meni oikein!', MODEL);
  assert.ok(e > 0.0005 && e < 0.01, String(e));
  const u = usageUsd({ input_tokens: 100, output_tokens: 1000, input_token_details: { text_tokens: 100 }, output_token_details: { audio_tokens: 900, text_tokens: 100 } }, MODEL);
  assert.equal(Math.round(u * 1e8), Math.round((900 * 20 + 100 * 2.4 + 100 * 0.6) * 100));
  assert.throws(() => estimateUsd('x', 'tts-1'));
});

test('ledger: released requests cost nothing, uncertain ones count', () => {
  const m = new Date().toISOString().slice(0, 7);
  const t = audioTotals([
    { id: 'a', kind: 'reserve', usd: 0.01, month: m }, { id: 'a', kind: 'settle', usd: 0.004, month: m },
    { id: 'b', kind: 'reserve', usd: 0.01, month: m }, { id: 'b', kind: 'release', usd: 0, month: m },
    { id: 'c', kind: 'reserve', usd: 0.01, month: m }, { id: 'c', kind: 'uncertain', usd: 0.01, month: m },
    { id: 'd', kind: 'reserve', usd: 0.02, month: m },
  ]);
  assert.deepEqual(t, { settled: 0.004, open: 0.02, uncertain: 0.01, month: 0.034, total: 0.034 });
});

test('budget: run budget, project cap and the shared monthly cap', () => {
  const cfg = { projectCapUsd: 15, monthlyBudgetUsd: 80 };
  const totals = { total: 1, month: 1 };
  assert.equal(budgetCheck(0.5, { runBudgetUsd: 2, runSpent: 1, cfg, totals, imageMonth: 0 }).ok, true);
  assert.match(budgetCheck(0.5, { runBudgetUsd: 2, runSpent: 1.6, cfg, totals, imageMonth: 0 }).reason, /erän/);
  assert.match(budgetCheck(0.5, { runBudgetUsd: 99, cfg, totals: { total: 14.8, month: 1 }, imageMonth: 0 }).reason, /katto 15/);
  // Images already used most of the shared month: audio cannot add its own 80 $ on top.
  assert.match(budgetCheck(0.5, { runBudgetUsd: 99, cfg, totals, imageMonth: 78.8 }).reason, /kuukausikatto/);
});

// ---------------------------------------------------------------- realtime adapter
function fakeSocket(script) {
  return class {
    static last;
    constructor(url, opts) { this.url = url; this.opts = opts; this.sent = []; this.constructor.last = this; queueMicrotask(() => this.onopen?.()); }
    send(s) { this.sent.push(JSON.parse(s)); if (this.sent.length === 2) queueMicrotask(() => script(this)); }
    emit(ev) { this.onmessage?.({ data: JSON.stringify(ev) }); }
    close() { this.closed = true; }
  };
}

test('renderLine: one out-of-band response, audio and transcript collected', async () => {
  const pcm = Buffer.alloc(480); pcm.writeInt16LE(1000, 0);
  const WS = fakeSocket((ws) => {
    ws.emit({ type: 'response.output_audio_transcript.delta', delta: 'Hei ' });
    ws.emit({ type: 'response.output_audio.delta', delta: pcm.subarray(0, 240).toString('base64') });
    ws.emit({ type: 'response.output_audio.delta', delta: pcm.subarray(240).toString('base64') });
    ws.emit({ type: 'response.output_audio_transcript.delta', delta: 'vaan' });
    ws.emit({ type: 'response.done', response: { id: 'resp_1', status: 'completed', usage: { output_tokens: 10 } } });
  });
  const r = await renderLine({ key: FAKE_KEY, model: MODEL, voice: 'marin', instructions: 'i', text: 'Hei vaan', WebSocketImpl: WS });
  assert.equal(r.transcript, 'Hei vaan'); assert.equal(r.pcm.length, 480); assert.equal(r.responseId, 'resp_1');
  const ws = WS.last;
  assert.match(ws.url, /model=gpt-realtime-2\.1-mini/);
  assert.equal(ws.opts.headers.Authorization, `Bearer ${FAKE_KEY}`);
  assert.equal(ws.sent[0].type, 'session.update');
  assert.equal(ws.sent[0].session.audio.output.voice, 'marin');
  assert.deepEqual(ws.sent[0].session.audio.output.format, { type: 'audio/pcm', rate: 24000 });
  assert.equal(ws.sent[1].response.conversation, 'none');
  assert.equal(ws.sent[1].response.input[0].content[0].text, 'Hei vaan');
  assert.equal(ws.closed, true);
});

test('renderLine: API error and incomplete response reject as sent', async () => {
  const err = fakeSocket((ws) => ws.emit({ type: 'error', error: { code: 'invalid_value', message: 'bad voice' } }));
  await assert.rejects(renderLine({ key: FAKE_KEY, model: MODEL, voice: 'x', instructions: '', text: 't', WebSocketImpl: err }), (e) => e.sent === true && /bad voice/.test(e.message));
  const cut = fakeSocket((ws) => ws.emit({ type: 'response.done', response: { status: 'incomplete', status_details: { reason: 'max_output_tokens' } } }));
  await assert.rejects(renderLine({ key: FAKE_KEY, model: MODEL, voice: 'x', instructions: '', text: 't', WebSocketImpl: cut }), /incomplete/);
});

test('renderLine: a socket that never opens is not counted as sent', async () => {
  const dead = class { constructor() { queueMicrotask(() => this.onerror?.({ message: 'refused' })); } send() {} close() {} };
  await assert.rejects(renderLine({ key: FAKE_KEY, model: MODEL, voice: 'x', instructions: '', text: 't', WebSocketImpl: dead }), (e) => e.sent === false);
});

// ---------------------------------------------------------------- CLI
function run(args, env = {}) {
  return new Promise((resolve) => {
    execFile(process.execPath, [CLI, ...args], {
      env: { PATH: process.env.PATH, HOME: process.env.HOME, AUDIOGEN_HOME: tmp(), IMAGEGEN_HOME: tmp(), AUDIOGEN_KEYCHAIN_SERVICE: 'sammakko-audiogen-test-does-not-exist', AUDIOGEN_REALTIME_URL: 'ws://127.0.0.1:9/never', ...env },
    }, (error, stdout, stderr) => resolve({ code: error ? error.code ?? 1 : 0, out: stdout + stderr }));
  });
}

test('CLI render is a dry run by default and never reads a key', async () => {
  const r = await run(['render', '--scope', 'audition-fi']);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /Dry-run: avainta ei luettu/);
});

test('CLI --live needs a budget and a key', async () => {
  assert.match((await run(['render', '--live'])).out, /--budget-usd/);
  assert.match((await run(['render', '--live', '--budget-usd', '0.1'])).out, /Avainta ei löydy/);
});

test('CLI --live: unreachable endpoint releases every reservation, no key in output or state', async () => {
  const home = tmp();
  const r = await run(['render', '--scope', 'audition-fi', '--only', 'aud.aava-intro', '--live', '--budget-usd', '0.05'], { AUDIOGEN_HOME: home, OPENAI_API_KEY: FAKE_KEY });
  assert.doesNotMatch(r.out, /TESTONLY/);
  const ledger = fs.readFileSync(path.join(home, 'ledger.jsonl'), 'utf8');
  assert.doesNotMatch(ledger, /TESTONLY/);
  const kinds = ledger.trim().split('\n').map((l) => JSON.parse(l).kind);
  assert.ok(kinds.length >= 2 && kinds.filter((k) => k === 'release').length === kinds.filter((k) => k === 'reserve').length, kinds.join(','));
  assert.equal(scanText('cli-output', r.out).length, 0);
});

// verify reads Lite's sources with Lite's own typescript; skipped where lite/node_modules is absent.
const hasTs = fs.existsSync(path.resolve(here, '../../../lite/node_modules/typescript'));
test('CLI verify passes on the committed catalog and manifest', { skip: !hasTs && 'lite/node_modules missing' }, async () => {
  const r = await run(['verify']);
  assert.equal(r.code, 0, r.out);
});

test('voice layer: pitch estimate and shift keep duration, raise pitch by the asked interval', async () => {
  const { f0Median, shift } = await import('../lib/voicefx.mjs');
  const rate = 24000, tone = new Float32Array(rate).map((_, i) => 0.5 * Math.sin((2 * Math.PI * 200 * i) / rate));
  assert.equal(f0Median(tone, rate), 200);
  const up = shift(tone, rate, 5);
  assert.ok(Math.abs(up.length - tone.length) <= 1);
  assert.ok(Math.abs(f0Median(up, rate) - 200 * 2 ** (5 / 12)) < 4);
});

// ---------------------------------------------------------------- spoken numbers (lesson lines)
test('numbers are read the recommended Finnish way', async () => {
  const { spokenForm } = await import('../lib/spoken.mjs');
  const cases = {
    '3/4 kakusta.': 'Kolme neljäsosaa kakusta.',
    'Kuka juoksee 100 m 4 sekunnissa?': 'Kuka juoksee sata metriä neljässä sekunnissa?',
    'Ajat 0–3 s.': 'Ajat nollasta kolmeen sekuntiin.',
    'Kello on 9.45.': 'Kello on yhdeksän neljäkymmentäviisi.',
    'Laske 6 : 3 verranto.': 'Laske kuusi suhteessa kolmeen verranto.',
    'Muunna 2 m → cm.': 'Muunna kaksi metriä senttimetreiksi.',
    '5 + 3 = 8': 'Viisi plus kolme on kahdeksan',
  };
  for (const [t, want] of Object.entries(cases)) {
    const r = spokenForm(t);
    assert.equal(r.spoken, want, t);
    assert.deepEqual(r.rest, [], t);
  }
});

test('a transcript with digits matches a spoken-number script', async () => {
  const { spokenForm } = await import('../lib/spoken.mjs');
  const { setTranscriptReader } = await import('../lib/text.mjs');
  setTranscriptReader((t) => spokenForm(t).spoken);
  const r = compareTranscript('Viisi plus kolme on kahdeksan.', '5 + 3 = 8.');
  assert.equal(r.exact, true);
  assert.equal(r.via, 'digits-read');
  assert.equal(compareTranscript('Viisi plus kolme on kahdeksan.', '5 + 3 = 9.').exact, false);
});

// ---------------------------------------------------------------- world kit (Saaristo + Lite effects)
import * as W from '../lib/world.mjs';
const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const noise = (n, seed = 7, amp = 0.1) => { const r = rng(seed); return Float32Array.from({ length: n }, () => (r() * 2 - 1) * amp); };

test('world loudness: a −20 dBFS 1 kHz sine reads about −23 LUFS, and level() respects the peak ceiling', () => {
  const rate = 32000, x = Float32Array.from({ length: rate * 3 }, (_, i) => 0.1 * Math.sin((2 * Math.PI * 1000 * i) / rate));
  assert.ok(Math.abs(W.loudness(x, rate, 'integrated') + 23) < 0.4, `${W.loudness(x, rate, 'integrated')}`);
  assert.ok(Math.abs(W.loudness(x, rate, 'oneshot') + 23) < 0.4);
  const y = Float32Array.from(x), r = W.level(y, rate, -2, 'oneshot');
  assert.ok(W.peakDb(y) <= -3 + 1e-6, 'never above −3 dBFS');
  assert.ok(r.limitedDb > 0 && Math.abs(r.lufs - (-2 - r.limitedDb)) < 0.1);
});

test('world loops: steady noise has a clean seam; a silent tail is caught as a gap', () => {
  const rate = 16000, P = 4, X = 0.5, x = noise(Math.round((P + X) * rate));
  const ok = W.seamReport(x, rate, P, X);
  assert.equal(ok.ok, true, ok.problems.join(', '));
  const gap = Float32Array.from(x); gap.fill(0, Math.round((P - 0.3) * rate));
  const bad = W.seamReport(gap, rate, P, X);
  assert.equal(bad.ok, false);
  assert.ok(bad.problems.some((p) => p.startsWith('kuoppa')), bad.problems.join(', '));
  const found = W.findLoop(noise(rate * 10, 3), rate, { from: 0, to: 10, period: P, xfade: X, step: 0.5 });
  assert.ok(found.length > 0 && found.length <= 8);
  for (let i = 1; i < found.length; i++) assert.ok(found[i].score >= found[i - 1].score);
});

test('world likeness: a delayed copy is recognised with its lag, a different sound is not', () => {
  const rate = 32000, n = rate;
  const chirp = Float32Array.from({ length: n }, (_, i) => { const t = i / rate; return 0.3 * Math.sin(2 * Math.PI * (400 + 1800 * t) * t) * Math.min(1, 4 * t) * Math.min(1, 4 * (1 - t)); });
  const late = new Float32Array(n); late.set(chirp.subarray(0, n - 1280), 1280); // 40 ms encoder-like delay
  const same = W.likeness(chirp, late, rate);
  assert.ok(same.tf >= 0.9, `tf ${same.tf}`); assert.equal(same.lagMs, 40);
  const other = W.likeness(chirp, noise(n, 11, 0.05), rate);
  assert.ok(other.tf < 0.6, `tf ${other.tf}`);
});
