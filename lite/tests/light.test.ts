import { describe, expect, it } from 'vitest';
import { EXPEDITION_NODES } from '../src/content/expedition';
import { LIGHT_ADAPTERS } from '../src/content/light';
import { LIGHT_GOALS } from '../src/content/light/goals';
import { rng } from '../src/engine/rng';
import type { Phase } from '../src/engine/types';

const PHASES: Phase[] = ['guided', 'independent', 'transfer'];
const light = Object.values(EXPEDITION_NODES).filter(node => node.light);

describe('Saaristo light (theory book) layer', () => {
  it('covers every node of each adapted kind', () => {
    for (const node of Object.values(EXPEDITION_NODES)) {
      const kind = node.item(rng(1), 'guided').basis as { kind?: string } | undefined;
      if (node.light) expect(kind?.kind && kind.kind in LIGHT_ADAPTERS).toBe(true);
    }
    expect(light.length).toBeGreaterThan(0);
  });

  it('asks one multiple choice or one number with a consistent answer', () => {
    for (const node of light) {
      expect(node.validRevs).toEqual([node.rev]);
      expect(node.produce).toBeUndefined();
      for (const phase of PHASES) for (let seed = 1; seed <= 12; seed += 1) {
        const item = node.item(rng(seed * 7919), phase);
        const where = `${node.id} ${phase} seed ${seed}`;
        expect(['choice', 'numeric'], where).toContain(item.task.kind);
        expect(item.say.length, where).toBeGreaterThan(10);
        expect(item.explain?.length ?? 0, where).toBeGreaterThan(10);
        if (phase !== 'guided') expect(item.hint, where).toBeUndefined();
        if (item.task.kind === 'choice') {
          const { options, answer } = item.task;
          expect(options.length, where).toBeGreaterThanOrEqual(2);
          expect(answer, where).toBeGreaterThanOrEqual(0);
          expect(answer, where).toBeLessThan(options.length);
          const texts = options.map(o => `${o.text ?? ''}${o.big ?? ''}${o.art ?? ''}`);
          expect(new Set(texts).size, where).toBe(texts.length);
        } else if (item.task.kind === 'numeric') {
          expect(Number.isFinite(item.task.answer), where).toBe(true);
        }
      }
    }
  });

  it('shows the light question as the worked example and a goal without workbench actions', () => {
    const workbench = /^(Rakenna|Rakennat|Tuota|Tuotat|Piirrät|Merkitset|Kohdistat|Peität|Täytät|Kolmioit|Muodostat|Luettelet|Suunnittelet)\b/;
    for (const node of light) {
      const steps = node.demo(rng(5));
      const example = node.item(rng(5), 'guided');
      expect(steps.length, node.id).toBe(2);
      expect(steps[0]!.say, node.id).toBe(example.say);
      expect(steps[1]!.say, node.id).toBe(example.explain);
      expect(node.goal ?? '', node.id).not.toMatch(workbench);
    }
    for (const id of Object.keys(LIGHT_GOALS)) expect(EXPEDITION_NODES[id]?.light, id).toBe(true);
  });
});
