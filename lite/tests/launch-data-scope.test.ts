import { expect, it } from 'vitest';
import { NODES } from '../src/content';
import { rng } from '../src/engine/rng';
import { check } from '../src/engine/check';
import { ANIM, type AnimPaint } from '../src/ui/anim';
import type { Item } from '../src/engine/types';
const sceneText = (q: Item) => { const h={innerHTML:''}; q.scene?.(h as HTMLElement); return h.innerHTML; };
it('collects every topic observation, including repeated-looking cards, without a count response', () => {
  let seen=0;
  for(const phase of ['independent','transfer'] as const) for(let seed=1;seed<=80;seed++) {
    const q=NODES['M-DATA-01']!.item(rng(seed),phase);
    if(!['collect','transfer'].includes(q.tag)) continue;
    expect(q.task.kind).toBe('multi'); if(q.task.kind!=='multi')continue; seen++;
    const topic=q.say.includes('kukkien')?'kukka':'kivi';
    const indices=q.task.options.flatMap((o,i)=>o.text?.includes(topic)?[i]:[]);
    expect(indices.length).toBeGreaterThan(1);
    expect(check(q.task,{kind:'multi',indices}).ok).toBe(true);
    expect(check(q.task,{kind:'multi',indices:indices.slice(1)}).ok).toBe(false);
    expect(check(q.task,{kind:'multi',indices:[...indices,indices[0]!]}).ok).toBe(false);
    expect(check(q.task,{kind:'multi',indices:q.task.options.map((_,i)=>i)}).ok).toBe(false);
  }
  expect(seen).toBeGreaterThan(80);
});
it('reads a supplied total from a named table column instead of requiring addition', () => {
  for(let seed=1;seed<=80;seed++) {
    const q=NODES['M-DATA-03']!.item(rng(seed),'transfer'), html=sceneText(q);
    expect(html).toContain('Yhteensä');
    expect(q.hint).toMatch(/sarake/);
    expect(q.task.kind).toBe('numeric');
    if(q.task.kind==='numeric') {
      const rows=[...html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(m=>[...m[1]!.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(c=>c[1]!.replace(/<[^>]*>/g,'')));
      const row=rows.find(r=>r.length===4&&q.say.includes(r[0]!.replace(/^[^ ]+ /,'')));
      expect(row).toBeDefined(); if(row)expect(q.task.answer).toBe(Number(row[3]));
    }
  }
});
it('does not teach longer observation always means more animals or that a blank table is forbidden before collection', () => {
  const n=NODES['M-DATA-09']!;
  for(const d of n.demo(rng(1))) {
    const cfg=(d.scene as AnimPaint)[ANIM]; if(!cfg)continue;
    for(let t=0;t<=cfg.dur;t+=0.2) expect(cfg.frame(t)+(cfg.caption?.(t)??'')).not.toMatch(/aina isompi|ainoa ero on päivä|taulukkoa ei voi tehdä/);
  }
  for(let seed=1;seed<=80;seed++){
    const q=n.item(rng(seed),'independent'); expect(q.explain).not.toMatch(/aina enemmän/);
    if(q.tag==='order')expect(q.explain).toContain('Tyhjän taulukkopohjan');
  }
  expect(n.item(rng(1),'transfer').explain).toContain('koko populaation');
});

it('unit comparison never attaches a false less-than statement to the correct option', () => {
  for(let seed=1;seed<=120;seed++) {
    const q=NODES['PHY79-UNIT-CONV']!.item(rng(seed),'transfer');
    if(q.task.kind==='choice') expect(q.task.why?.[q.task.answer]).toBeUndefined();
  }
});
