import { expect, it } from 'vitest';
import { NODES } from '../src/content';
import { LAUNCH_REV } from '../src/content/audit-rev';
import { check } from '../src/engine/check';
import { rng } from '../src/engine/rng';

const html = (q: ReturnType<typeof NODES[string]['item']>) => { const host = { innerHTML: '' }; q.scene?.(host as HTMLElement); return host.innerHTML; };
const mapping = (text: string) => {
  const groups = new Map<number, Set<number>>();
  for (const m of text.matchAll(/(\d+)\s*→\s*(\d+)/g)) { const x = Number(m[1]), ys = groups.get(x) ?? new Set<number>(); ys.add(Number(m[2])); groups.set(x, ys); }
  return groups;
};
it('DEP pattern and transfer read given direction/pairs without an arithmetic answer', () => {
  expect(NODES['M79-DEP-01']!.rev).toBe(LAUNCH_REV);
  let pattern = 0;
  for (let seed = 1; seed <= 80; seed++) {
    const q = NODES['M79-DEP-01']!.item(rng(seed), 'independent');
    if (q.tag === 'pattern') {
      pattern++; expect(q.task.kind).toBe('choice');
      if (q.task.kind === 'choice') {
        const index = q.task.options.findIndex(o => o.text === 'y kasvaa');
        expect(index).toBeGreaterThanOrEqual(0);
        expect(check(q.task, { kind: 'choice', index }).ok).toBe(true);
      }
    }
    const transfer = NODES['M79-DEP-01']!.item(rng(seed), 'transfer');
    expect(transfer.task.kind).toBe('choice');
    expect(transfer.say).toContain('Annetut tiedot');
    expect(transfer.hint).not.toMatch(/kerro|jaa|vähennä/i);
  }
  expect(pattern).toBeGreaterThan(0);
});
it('FUNC finite mapping permits repeated pairs and shared outputs, detects conflict and missing input without solving', () => {
  expect(NODES['M79-FUNC-01']!.rev).toBe(LAUNCH_REV);
  const cases = new Set<string>(), tags = new Set<string>();
  for (let seed = 1; seed <= 120; seed++) {
    const q = NODES['M79-FUNC-01']!.item(rng(seed), 'independent'); tags.add(q.tag);
    if (q.tag === 'run') {
      expect(q.task.kind).toBe('choice');
      const markup = html(q), input = Number(q.say.match(/syötteelle (\d+)/)?.[1]);
      const xs = [...markup.matchAll(/<th>(\d+)<\/th>/g)].map(m => Number(m[1]));
      const ys = [...markup.matchAll(/<td>(\d+)<\/td>/g)].map(m => Number(m[1]));
      const value = ys[xs.indexOf(input)]; expect(value).toBeDefined();
      if (q.task.kind === 'choice') {
        const index = q.task.options.findIndex(o => o.big === String(value));
        expect(check(q.task, { kind: 'choice', index }).ok).toBe(true);
      }
    }
    if (q.tag === 'rule') {
      const pairs = mapping(q.say), missing = [0, 1, 2].find(x => !pairs.has(x));
      const conflict = [...pairs].find(([, ys]) => ys.size > 1);
      const type = missing !== undefined ? 'missing' : conflict ? 'conflict' : 'valid'; cases.add(type);
      expect(q.task.kind).toBe('choice');
      if (q.task.kind === 'choice') {
        const index = q.task.options.findIndex(o => type === 'missing' ? o.text?.includes('puuttuu') : type === 'conflict' ? o.text?.includes('kaksi eri arvoa') : o.text?.startsWith('Jokaisella'));
        expect(index).toBeGreaterThanOrEqual(0);
        expect(check(q.task, { kind: 'choice', index }).ok).toBe(true);
      }
    }
    if (q.tag === 'pairs' && q.task.kind === 'sort') {
      const bins = q.task.items.map(o => [...mapping(o.text!).values()].some(ys => ys.size > 1) ? 1 : 0);
      expect(check(q.task, { kind: 'sort', bins }).ok).toBe(true);
      expect(bins.filter(b => b === 0)).toHaveLength(3); // repeated pair and constant map remain valid.
    }
    const transfer = NODES['M79-FUNC-01']!.item(rng(seed), 'transfer');
    expect(transfer.task.kind).toBe('choice');
    expect(transfer.say).toContain('Sallitut syötteet');
  }
  expect([...cases].sort()).toEqual(['conflict', 'missing', 'valid']);
  expect([...tags].sort()).toEqual(['isFunc', 'pairs', 'rule', 'run']);
});
