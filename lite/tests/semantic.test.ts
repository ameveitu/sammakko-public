// Independent semantic checks: the expected answer is derived here from the item's own
// numbers or pictures, not from the generator's answer key.
import { describe, expect, it } from 'vitest';
import { check, solution } from '../src/engine/check';
import { ORDER } from '../src/engine/graph';
import { rng } from '../src/engine/rng';
import type { Item, Option, Phase, Task } from '../src/engine/types';
import { NODES } from '../src/content';
import { ROUNDED } from '../src/content/fi';

const PHASES: Phase[] = ['guided', 'independent', 'transfer'];
const seeds = (n: number) => Array.from({ length: n }, (_, i) => i);
const optText = (o: Option) => [o.big, o.text, o.speak, o.quiet].filter(Boolean).join(' ');
const texts = (it: Item) => [it.say, it.explain, it.hint ?? '', ...(it.task.kind === 'choice' || it.task.kind === 'multi' ? it.task.options.map(optText) : []),
  ...(it.task.kind === 'choice' ? (it.task.why ?? []).map((w) => w ?? '') : [])].join('\n');
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('rounded values are never written as exact (C4 family)', () => {
  it.each(ORDER)('%s', (id) => {
    const bad: string[] = [];
    for (const phase of PHASES) for (const s of seeds(150)) {
      ROUNDED.clear();
      const it = NODES[id]!.item(rng(s), phase);
      const all = texts(it);
      for (const v of ROUNDED) if (new RegExp(`=\\s*${esc(v)}(?![0-9])`).test(all)) bad.push(`${phase}/${s}/${it.tag}: ${v}`);
    }
    ROUNDED.clear();
    const demo = NODES[id]!.demo(rng(1)).map((d) => d.say).join('\n');
    for (const v of ROUNDED) if (new RegExp(`=\\s*${esc(v)}(?![0-9])`).test(demo)) bad.push(`demo: ${v}`);
    expect(bad.slice(0, 5)).toEqual([]);
  });
});

/** Sum of a written expansion such as "9000 + 800 + 5 + 50". */
const sum = (s: string) => s.split('+').map((x) => Number(x.trim())).reduce((a, b) => a + b, 0);

describe('M-PLACE-05: exactly one option equals the number (C1)', () => {
  it('seed 127 and every other seed', () => {
    for (const s of seeds(400)) {
      const it = NODES['M-PLACE-05']!.item(rng(s), 'independent');
      if (it.tag !== 'expand' || it.task.kind !== 'choice') continue;
      const n = Number(/luvun (\d+)/.exec(it.say)![1]);
      const equal = it.task.options.map((o, i) => (sum(o.big!) === n ? i : -1)).filter((i) => i >= 0);
      expect(equal, `seed ${s}: ${it.task.options.map((o) => o.big).join(' | ')}`).toEqual([it.task.answer]);
    }
  });
});

/** Shape kinds drawn in an option, read back from the SVG itself. */
function kindsIn(svgText: string): string[] {
  const out: string[] = [];
  for (const m of svgText.matchAll(/<(circle|rect|path)\b([^>]*)>/g)) {
    if (m[1] === 'circle') { if (/r="(\d+(\.\d+)?)"/.test(m[2]!) && !/fill="transparent"/.test(m[2]!)) out.push('ympyra'); continue; }
    if (m[1] === 'path') { if (/Z"/.test(m[2]!)) out.push('kolmio'); continue; }
    const w = Number(/width="([\d.]+)"/.exec(m[2]!)?.[1]), h = Number(/height="([\d.]+)"/.exec(m[2]!)?.[1]);
    out.push(Math.abs(w - h) < 0.01 ? 'nelio' : 'suorakulmio');
  }
  return out;
}
const isRect = (k: string) => k === 'nelio' || k === 'suorakulmio';

describe('rectangles include squares (C2)', () => {
  it('M-TH-02 "valitse kaikki suorakulmiot" selects every rectangle including squares', () => {
    let seen = 0;
    for (const s of seeds(600)) {
      const it = NODES['M-TH-02']!.item(rng(s), 'independent');
      if (it.task.kind !== 'multi' || !/suorakulmiot/.test(it.say)) continue;
      seen++;
      const want = it.task.options.map((o, i) => (kindsIn(o.art ?? '').some(isRect) ? i : -1)).filter((i) => i >= 0);
      expect([...it.task.answer].sort(), `seed ${s}`).toEqual(want);
      expect(check(it.task, solution(it.task)).ok).toBe(true);
    }
    expect(seen).toBeGreaterThan(5);
  });
  it('M-GEO-04: no square is offered as a wrong answer to "where is the rectangle"', () => {
    for (const s of seeds(600)) for (const phase of PHASES) {
      const it = NODES['M-GEO-04']!.item(rng(s), phase);
      if (it.task.kind !== 'choice') continue;
      if (/suorakulmio\?/.test(it.say)) {
        it.task.options.forEach((o, i) => { if (i !== (it.task as { answer: number }).answer) expect(kindsIn(o.art ?? '').some(isRect), `seed ${s}`).toBe(false); });
      }
      if (it.say === 'Mikä kuvio tämä on?') {
        const names = it.task.options.map((o) => o.text);
        const right = names[it.task.answer];
        // A square picture may not have both "neliö" and "suorakulmio" offered with only one accepted.
        if (right === 'neliö') expect(names.includes('suorakulmio'), `seed ${s}`).toBe(false);
      }
    }
  });
});

describe('M-TH-02 transfer: the sorting rule is identifiable (C3)', () => {
  it('only one offered rule is true of the box', () => {
    for (const s of seeds(300)) {
      const it = NODES['M-TH-02']!.item(rng(s), 'transfer');
      const t = it.task as Extract<Task, { kind: 'choice' }>;
      expect(t.kind).toBe('choice');
      // The box must show different sizes, so "same size" is never also true.
      expect(it.say).toMatch(/säännöllä/);
      const box: string[] = [];
      const host = { set innerHTML(v: string) { box.push(v); } } as unknown as HTMLElement;
      it.scene!(host);
      const sizes = new Set([...box.join('').matchAll(/data-size="(\d+)"/g)].map((m) => m[1]));
      expect(sizes.size, `seed ${s}`).toBeGreaterThan(1);
    }
  });
});
