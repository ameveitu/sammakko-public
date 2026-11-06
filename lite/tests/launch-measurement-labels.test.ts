import { expect, it } from 'vitest';
import { NODES, revOf } from '../src/content';
import { rng } from '../src/engine/rng';
import { ANIM, type AnimPaint } from '../src/ui/anim';
import { LAUNCH_REV } from '../src/content/audit-rev';
it('clock practice describes hand positions without supplying clock readings', () => {
  expect(revOf('M-TIME-02')).toBe(LAUNCH_REV);
  const tags = new Set<string>();
  for (const phase of ['guided', 'independent', 'transfer'] as const) for (let seed = 0; seed < 100; seed++) {
    const q = NODES['M-TIME-02']!.item(rng(seed), phase); tags.add(q.tag);
    const host = {innerHTML: ''}; q.scene?.(host as HTMLElement);
    const arts = [host.innerHTML, ...(q.task.kind === 'choice' ? q.task.options.map(o=>o.art??'') : [])].filter(Boolean);
    for(const s of arts) {
      const label = s.match(/aria-label="([^"]*)"/)?.[1];
      expect(label).toContain('lyhyt paksu viisari'); expect(label).toContain('pitkä ohut viisari');
      expect(label).not.toMatch(/kello \d|puoli |\d[.:]30/i);
    }
  }
  expect([...tags].sort()).toEqual(['full','half','hands','set','transfer']);
});
it('distance-time read scene keeps measured scales but no initial answer in its name', () => {
  expect(revOf('PHY79-DIST-TIME')).toBe(LAUNCH_REV);
  const prompts = new Set<string>();
  for(let seed=0;seed<100;seed++) {
    const q=NODES['PHY79-DIST-TIME']!.item(rng(seed),'independent'); if(q.tag!=='read') continue;
    const cfg=(q.scene as AnimPaint)[ANIM]!; prompts.add(q.task.kind==='numeric'?q.task.unit!:'');
    expect(cfg.label).toBe('Loikan kisa: mittanauha ja sekuntikello');
    expect(cfg.frame(cfg.dur)).toMatch(/ m| s|>\d/);
    expect(q.explain).toMatch(/\d/);
  }
  expect([...prompts].sort()).toEqual(['m','s']);
});

it('average-speed transfer name does not supply the requested average', () => {
 expect(revOf('PHY79-SPEED-CALC')).toBe(LAUNCH_REV);
 for(let seed=0;seed<30;seed++) {
  const q=NODES['PHY79-SPEED-CALC']!.item(rng(seed),'transfer'), cfg=(q.scene as AnimPaint)[ANIM]!;
  expect(cfg.label).toBe('Pyörämatka ja tauko: matka ja koko aika');
  expect(q.explain).toContain('Myös tauko kuuluu aikaan');
  expect(cfg.frame(cfg.dur)).toContain('km');
 }
});
