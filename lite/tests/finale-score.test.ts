import {it,expect} from 'vitest';
import {FINALE_SECONDS} from '../src/content/finale';
import {FINALE_SCORE,renderFinaleScore} from '../src/content/finale-score';
it('original score stays inside the film, leaves its opening quiet and produces finite unclipped PCM',()=>{
  expect(FINALE_SCORE.length).toBeGreaterThan(200);
  expect(new Set(FINALE_SCORE.map(n=>n.id)).size).toBe(FINALE_SCORE.length);
  for(const n of FINALE_SCORE){expect(n.at).toBeGreaterThanOrEqual(2);expect(n.at+n.duration).toBeLessThanOrEqual(FINALE_SECONDS);}
  const pcm=renderFinaleScore(8000);let peak=0,total=0;
  expect(pcm.every(Number.isFinite)).toBe(true);
  for(const sample of pcm){peak=Math.max(peak,Math.abs(sample));total+=sample*sample;}
  expect(peak).toBeGreaterThan(.02);expect(peak).toBeLessThan(.5);expect(Math.sqrt(total/pcm.length)).toBeGreaterThan(.001);
  expect(pcm.slice(0,15000).every(x=>x===0)).toBe(true);
});
it('rendering a late excerpt produces the same score as seeking through the complete composition',()=>{
  const all=renderFinaleScore(8000),end=renderFinaleScore(8000,502,46);
  expect(end).toEqual(all.slice(502*8000));
});
