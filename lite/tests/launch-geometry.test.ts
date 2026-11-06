import { describe, expect, it } from 'vitest';
import { NODES } from '../src/content';
import { AUDIT_REV, LAUNCH_REV, REVIEW2_REV } from '../src/content/audit-rev';
import { rng } from '../src/engine/rng';
import { ANIM, type AnimPaint } from '../src/ui/anim';
const names = /(?:^|\s)(kolmio|neliö|suorakulmio|ympyrä)(?:$|\s)/;
const labels = (html: string) => [...html.matchAll(/aria-label="([^"]+)"/g)].map(m => m[1]!);
describe('shape recognition: accessible properties without naming the answer', () => {
  it('naming, finding, sorting and transfer pictures have neutral descriptions', () => {
    const tags = new Set<string>();
    for (const phase of ['guided', 'independent', 'transfer'] as const) for (let seed = 1; seed <= 60; seed++) {
      const q = NODES['M-GEO-04']!.item(rng(seed), phase); tags.add(q.tag);
      const t = q.task;
      const pictures = t.kind === 'choice' ? t.options.filter(o => o.art).map(o => o.art!) : t.kind === 'sort' ? t.items.map(o => o.art!) : [];
      if (q.tag === 'name') { const host = { innerHTML: '' }; q.scene!(host as HTMLElement); pictures.push(host.innerHTML); }
      for (const html of pictures) {
        expect(labels(html).length, `${phase}/${seed}/${q.tag}`).toBeGreaterThan(0);
        for (const label of labels(html)) expect(label, `${phase}/${seed}/${q.tag}`).not.toMatch(names);
      }
    }
    for (const tag of ['find','name','sort','corners','transfer']) expect(tags.has(tag)).toBe(true);
  });
  it('unrevealed tracing does not name the shape or narrate an incorrect circle rule', () => {
    let n = 0;
    for (let seed=1; seed<=100; seed++) {
      const q = NODES['M-GEO-04']!.item(rng(seed), 'independent'); if(q.tag !== 'corners') continue; n++;
      const cfg = (q.scene as AnimPaint)[ANIM]!; expect(cfg.label).not.toMatch(names);
      for(let t=0; t<=cfg.dur; t+=0.2) expect(cfg.caption?.(t)).not.toMatch(/ei käänny|Kääntyikö kynä missään/);
    }
    expect(n).toBeGreaterThan(10);
  });
});

it('comparison and classification provide color and shape data in accessible picture names', () => {
  for(const id of ['M-TH-01','M-TH-02']) for(let seed=1;seed<=60;seed++) {
    const q=NODES[id]!.item(rng(seed), 'independent'), t=q.task;
    const pictures=t.kind==='choice'||t.kind==='multi'?t.options.filter(o=>o.art).map(o=>o.art!):t.kind==='sort'?t.items.map(o=>o.art!):[];
    for(const html of pictures) {
      expect(labels(html).length, `${id}/${q.tag}/${seed}`).toBeGreaterThan(0);
      for(const label of labels(html)) expect(label).toMatch(/punainen|sininen|keltainen|vihreä/);
    }
  }
});

it('current geometry revision survives historical index overlays while old evidence stays valid', () => {
  for(const id of ['M-GEO-01','M-GEO-04','M-SYM-01','M-TH-01','M-TH-02']) {
    expect(NODES[id]!.rev,id).toBe(LAUNCH_REV);
    expect(NODES[id]!.validRevs,id).toContain(AUDIT_REV);
  }
  expect(NODES['M-TH-02']!.validRevs).toContain(REVIEW2_REV);
});
