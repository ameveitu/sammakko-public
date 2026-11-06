// @ts-nocheck: node-only developer tool
// Developer tool, skipped in normal runs: every line a lesson can say, by running each generator
// with many seeds. Feeds the audio catalog (tools/audiogen) with what is fixed and what varies.
//   SPEECH_SAMPLE=400 SPEECH_OUT=/abs/path.json npx vitest run tests/zz-speech-sample.test.ts
// The output is large and is not committed; `node tools/audiogen/cli.mjs catalog-lite --sample <file>` reads it.
import { it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NODES } from '../src/content';
import { rng } from '../src/engine/rng';

const PHASES = ['guided', 'independent', 'retrieval', 'transfer'] as const;
const PRACTICE = 5;
/** Same as labelOf() in src/ui/speech.ts: what a tapped answer says. */
const labelOf = (o) => String(o.speak ?? o.text ?? o.big ?? '')
  .replace(/<span class="frac"><span>(.*?)<\/span><span>(.*?)<\/span><\/span>/g, '$1/$2').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

it.skipIf(!process.env.SPEECH_SAMPLE)('sample every spoken line', () => {
  const seeds = Number(process.env.SPEECH_SAMPLE);
  const lines = new Map(); // text → { kind, nodes:Set, n }
  const add = (text, kind, node) => {
    const t = String(text ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();
    if (!t) return;
    const e = lines.get(t) ?? { kind, nodes: new Set(), n: 0 };
    e.n++; e.nodes.add(node); lines.set(t, e);
  };
  const perNode = {};
  for (const [id, s] of Object.entries(NODES)) {
    const intro = s.goal && s.intro.includes(s.goal) ? s.intro.replace(s.goal, '').trim() : s.intro;
    add(`${s.stop}. ${s.intro}`, 'map.intro', id);
    add(intro, 'lesson.intro', id);
    add(`Muistatko vielä? ${intro}`, 'lesson.recall', id);
    add(`Pikatarkistus: ${s.stop}. Kaksi oikein peräkkäin riittää.`, 'lesson.quick', id);
    add(`Harjoitellaan lisää: ${s.stop}. Tulossa ${PRACTICE} tehtävää.`, 'lesson.practice', id);
    add(s.reward, 'lesson.reward', id);
    const kinds = {};
    const seen = (k, t) => { (kinds[k] ??= new Set()).add(t); };
    for (let seed = 1; seed <= seeds; seed++) {
      for (const d of s.demo(rng(seed))) { add(d.say, 'demo', id); seen('demo', d.say); }
      for (const ph of PHASES) {
        const it = s.item(rng(seed * 7919 + PHASES.indexOf(ph)), ph);
        add(it.say, 'item.say', id); seen('say', it.say);
        if (it.listen) { add(it.listen.say, 'item.listen', id); seen('say', it.listen.say); }
        add(it.explain, 'item.explain', id); seen('explain', it.explain);
        const t = it.task;
        for (const w of Array.isArray(t.why) ? t.why : [...Object.values(t.why ?? {}), ...Object.values(t.whyAt ?? {})]) if (typeof w === 'string' && w) { add(w, 'item.why', id); seen('why', w); }
        if (Array.isArray(t.options)) for (const o of t.options) { const l = labelOf(o); add(l, 'item.option', id); seen('option', l); }
        const walk = (x) => { if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) k === 'speak' && typeof v === 'string' ? (add(v, 'item.speak', id), seen('option', v)) : k !== 'options' && walk(v); };
        walk(t);
      }
    }
    perNode[id] = Object.fromEntries(Object.entries(kinds).map(([k, v]) => [k, v.size]));
  }
  const out = [...lines].map(([text, e]) => ({ text, kind: e.kind, nodes: [...e.nodes].sort(), n: e.n }));
  writeFileSync(process.env.SPEECH_OUT ?? join(tmpdir(), 'sammakko-speech-sample.json'), JSON.stringify({
    schema: 'sammakko-speech-sample/1', seeds, phases: PHASES,
    note: 'Lines the lessons say, from running every generator with these seeds. Counts are draws, not coverage of open ranges.',
    perNode, lines: out,
  }) + '\n');
}, 600_000);
