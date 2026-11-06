import { describe, expect, it } from 'vitest';
import { check, solution, wrongs } from '../src/engine/check';
import { ORDER } from '../src/engine/graph';
import { rng } from '../src/engine/rng';
import type { Item, Phase } from '../src/engine/types';
import { NODES } from '../src/content';
import { CHAPTERS } from '../src/content/world';

const PHASES: Phase[] = ['guided', 'independent', 'transfer', 'retrieval'];
const SEEDS = 120;
const fakeHost = () => ({ innerHTML: '', append() {}, appendChild() {}, querySelector: () => null, addEventListener() {} }) as unknown as HTMLElement;

function items(id: string, phase: Phase): Item[] {
  return Array.from({ length: SEEDS }, (_, s) => NODES[id]!.item(rng(s * 7919 + 13), phase));
}

describe('content registry', () => {
  it(`covers exactly the ${ORDER.length} graph nodes`, () => {
    expect(Object.keys(NODES).sort()).toEqual([...ORDER].sort());
  });
  it('every node is on the map exactly once', () => {
    const onMap = CHAPTERS.flatMap((c) => c.nodes);
    expect(onMap.sort()).toEqual([...ORDER].sort());
  });
});

describe.each(ORDER)('%s', (id) => {
  const spec = NODES[id]!;
  it('has child-facing texts and a demo', () => {
    expect(spec.stop.length).toBeGreaterThan(2);
    expect(spec.intro.length).toBeGreaterThan(10);
    expect(spec.goal, 'objective').toMatch(/^Opit[ ,]/);
    expect(spec.reward.length, 'reward').toBeGreaterThan(5);
    const demo = spec.demo(rng(1));
    expect(demo.length).toBeGreaterThan(0);
    demo.forEach((d) => { expect(d.say).toBeTruthy(); try { d.scene(fakeHost()); } catch (e) { if (!String(e).includes('document')) throw e; } });
  });

  it.each(PHASES)('%s items: solution passes, wrong answers fail', (phase) => {
    for (const it of items(id, phase)) {
      expect(it.say, 'instruction').toBeTruthy();
      expect(it.explain, 'explanation').toBeTruthy();
      expect(/undefined|NaN|TODO|lorem ipsum/.test(it.say + it.explain), `placeholder: ${it.say} | ${it.explain}`).toBe(false);
      if (it.task.kind === 'numeric') expect(Number.isFinite(it.task.answer)).toBe(true);
      expect(check(it.task, solution(it.task)).ok, `${it.tag}: ${it.say}`).toBe(true);
      for (const w of wrongs(it.task)) expect(check(it.task, w).ok, `${it.tag} wrong: ${JSON.stringify(w)}`).toBe(false);
      if (it.task.kind === 'choice') {
        // The right option must be unique (identical distractors are fine in "odd one out").
        const keys = it.task.options.map((o) => JSON.stringify(o));
        const ans = it.task.answer;
        expect(keys.filter((k) => k === keys[ans]).length, `ambiguous answer: ${it.say}`).toBe(1);
        if (!/erilainen/.test(it.say)) expect(new Set(keys).size, `duplicate options: ${it.say}`).toBe(keys.length);
        const right = it.task.options[it.task.answer]!;
        const named = it.task.options.filter((o) => o.text && it.say.includes(o.text)).length;
        // Naming every option ("A vai B?") is fine; naming only the right one gives it away.
        // Single words (numbers, names) are naturally part of the question; check sentences only.
        if (right.text && right.text.includes(' ') && named < 2) expect(it.say.includes(right.text), `say leaks answer: ${it.say}`).toBe(false);
        expect(/undefined|NaN/.test(JSON.stringify(it.task.options)), `bad option: ${keys}`).toBe(false);
      }
    }
  });

  it('uses at least two cases and a separate transfer', () => {
    const tags = new Set(items(id, 'independent').map((i) => i.tag));
    expect(tags.size).toBeGreaterThanOrEqual(2);
    expect(items(id, 'transfer').every((i) => i.tag === 'transfer')).toBe(true);
  });

  it('correct answer is not stuck in one position', () => {
    const pos: number[] = [];
    for (const p of ['independent', 'transfer'] as Phase[])
      for (const it of items(id, p)) if (it.task.kind === 'choice') pos.push(it.task.answer);
    if (pos.length < 40) return;
    const max = Math.max(...[0, 1, 2, 3].map((k) => pos.filter((x) => x === k).length));
    expect(max / pos.length).toBeLessThan(0.8);
  });
});
