import { expect, it } from 'vitest';
import { NODES, revOf } from '../src/content';
import { rng } from '../src/engine/rng';
import { ANIM, type AnimPaint } from '../src/ui/anim';
import { LAUNCH_REV } from '../src/content/audit-rev';
it('limits quantity counterexamples to labels while preserving measurable colour properties', () => {
  const n = NODES['PHY79-QTY-CONCEPT']!;
  expect(revOf(n.id)).toBe(LAUNCH_REV);
  const demo = n.demo(rng(0)).at(-1)!;
  expect(demo.say).toContain('Valon ja värin ominaisuuksia voidaan mitata');
  const cfg = (demo.scene as AnimPaint)[ANIM]!;
  const all = [cfg.label, ...Array.from({length: 20}, (_, i) => [cfg.frame(i * cfg.dur / 19), cfg.caption?.(i * cfg.dur / 19)].join(' '))].join(' ');
  expect(all).not.toMatch(/Väri ei ole suure|Väriä ei ilmaista/);
  expect(all).toContain('suosikkiväri: vihreä');
  const kinds = new Set<string>();
  for (const phase of ['guided', 'independent', 'transfer'] as const) for(let seed = 0; seed < 100; seed++) {
    const q = n.item(rng(seed), phase); kinds.add(q.tag);
    if (q.tag !== 'pick' && q.tag !== 'sort') continue;
    const t = q.task;
    const labels = t.kind === 'choice' ? t.options.map(o => o.text) : t.kind === 'sort' ? t.items.map(o => o.text) : [];
    expect(labels.every(x => ['pituus','massa','aika','lämpötila','nimi','suosikkiväri','tunnus'].includes(x!))).toBe(true);
    expect(q.explain).not.toContain('ominaisuuksia, joita ei mitata');
  }
  expect([...kinds].sort()).toEqual(['pick','sort','tool','transfer','unitVs']);
});
