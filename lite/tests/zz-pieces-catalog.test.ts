// @ts-nocheck: node-only developer tool
// Developer tool, skipped in normal runs: the recorded pieces maths lines are said from (src/audio/pieces.ts).
// Reads a speech sample (tests/zz-speech-sample.test.ts) and writes audio/catalog/fi-FI/pieces.json:
// every number word, every word of a maths line no line file covers, and the phrases between numbers
// that come back often enough to be worth a clip of their own (they sound more natural than words).
//   PIECES_SAMPLE=/abs/sample.json [PIECES_MIN=4] npx vitest run tests/zz-pieces-catalog.test.ts
import { it } from 'vitest';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fnv64 } from '../src/audio/key';
import { NUMBER_PIECES, pieceNeeds } from '../src/audio/pieces';
import { spoken } from '../src/audio/spoken';
import { setManifest, speechAssets } from '../src/audio/player';

const OUT = new URL('../../audio/catalog/fi-FI/pieces.json', import.meta.url);
const MATHS = /[\d□×÷=<>+−²³%€°≠≈≤≥]/;
/** Single letters (variables, points, columns) by their Finnish names. */
const LETTER = { a: 'aa', b: 'bee', c: 'see', d: 'dee', e: 'ee', f: 'äf', g: 'gee', h: 'hoo', i: 'ii', j: 'jii', k: 'koo', l: 'äl', m: 'äm', n: 'än', o: 'oo', p: 'pee', q: 'kuu', r: 'är', s: 'äs', t: 'tee', u: 'uu', v: 'vee', w: 'kaksoisvee', x: 'äks', y: 'yy', z: 'tset', å: 'ruotsalainen oo', ä: 'ää', ö: 'öö' };
/** Short forms that are words when said. */
const ABBR = { esim: 'esimerkiksi', mm: 'millimetri', cm: 'senttimetri', dm: 'desimetri', km: 'kilometri', kg: 'kilogramma', dl: 'desilitra', ml: 'millilitra', cl: 'senttilitra', min: 'minuutti', jne: 'ja niin edelleen', ns: 'niin sanottu', vrt: 'vertaa', kpl: 'kappaletta', mg: 'milligramma', ma: 'maanantai', ti: 'tiistai', 'δx': 'delta äks', 'δy': 'delta yy' };
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28);

it.skipIf(!process.env.PIECES_SAMPLE)('piece catalog', () => {
  setManifest(JSON.parse(readFileSync(new URL('../public/audio/manifest.json', import.meta.url), 'utf8')));
  const d = JSON.parse(readFileSync(process.env.PIECES_SAMPLE, 'utf8'));
  const min = Number(process.env.PIECES_MIN ?? 4);
  const phrases = new Map(), words = new Map();
  let lines = 0;
  for (const l of d.lines) {
    if (!MATHS.test(l.text) || speechAssets('narrator', l.text)) continue;
    lines++;
    const need = pieceNeeds(spoken(l.text));
    for (const p of new Set(need.phrases)) phrases.set(p, (phrases.get(p) ?? 0) + 1);
    for (const w of need.words) words.set(w, (words.get(w) ?? 0) + 1);
  }
  const out = new Map();
  const add = (displayText, spokenText, kind) => { if (!out.has(displayText)) out.set(displayText, { id: `piece.${slug(displayText) || 'x'}-${fnv64(`narrator\n${displayText}`).slice(0, 6)}`, speaker: 'narrator', kind, displayText, spokenText, spokenStatus: spokenText === displayText ? 'identity' : 'manual' }); };
  for (const n of NUMBER_PIECES) add(n, n, 'piece.number');
  for (const w of [...words.keys()].sort()) add(w, LETTER[w] ?? ABBR[w] ?? w, 'piece.word');
  const common = [...phrases].filter(([p, n]) => n >= min && p.includes(' ') && p.length <= 120 && !/\d/.test(p)).sort((a, b) => b[1] - a[1]);
  for (const [p] of common) add(p, p, 'piece.phrase');
  const all = [...out.values()];
  const chars = all.reduce((s, l) => s + l.spokenText.length, 0);
  const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')).lines.length : 0;
  writeFileSync(OUT, JSON.stringify({ schema: 'sammakko-audio-catalog/1', locale: 'fi-FI', contentVersion: 1,
    note: 'Pieces for maths lines that have no file of their own (lite/src/audio/pieces.ts): number words, single words, and phrases between numbers that recur. Written by tests/zz-pieces-catalog.test.ts from a speech sample.',
    sample: { seeds: d.seeds, lines, minPhraseLines: min }, lines: all }, null, 1) + '\n');
  console.log(`maths lines without a file ${lines}; pieces ${all.length} (numbers ${NUMBER_PIECES.length}, words ${words.size}, phrases ${common.length}); ${chars} chars; before ${prev}`);
}, 600_000);
