import { describe, expect, it } from 'vitest';
import { NODES, revOf } from '../src/content';
import { rng } from '../src/engine/rng';
import { check } from '../src/engine/check';
import { store } from '../src/engine/store';
import type { Attempt } from '../src/engine/evidence';
import { AUDIT_REV, LAUNCH_REV, LIGHT_REV } from '../src/content/audit-rev';
const wordValues: Record<string, number> = {nolla:0,yksi:1,kaksi:2,kolme:3,neljä:4,viisi:5,kuusi:6,seitsemän:7,kahdeksan:8,yhdeksän:9};
describe('canonical M-DEC-04: joint representations from supplied cards', () => {
 it('builds the missing forms from one given form, one decoy each, including zero units (lighter layout, user request 2026-11-06)', () => {
  const tags=new Set<string>(); let zeros=0, thousandths=0;
  for(const phase of ['guided','independent','transfer'] as const) for(let seed=0;seed<100;seed++) {
   const q=NODES['M-DEC-04']!.item(rng(seed),phase), t=q.task; tags.add(q.tag);
   expect(t.kind).toBe('place'); if(t.kind!=='place') continue;
   // Derive the quantity from the given form, independent of the checker/answer.
   const fromNumeral=q.say.match(/^Lukukortti: (\d+,\d+)\./)?.[1];
   const parts=t.slots.filter(s=>s.id.startsWith('part'));
   const counts=fromNumeral ? fromNumeral.replace(',','').split('').map(Number) : [...q.say.matchAll(/(nolla|yksi|kaksi|kolme|neljä|viisi|kuusi|seitsemän|kahdeksan|yhdeksän) (?:kokonai|kymmenes|sadas|tuhannes)/g)].map(m=>wordValues[m[1]!]!);
   expect(counts.length).toBe(parts.length); if(counts.includes(0)) zeros++; if(counts.length===4) thousandths++;
   expect(t.slots.length).toBeLessThanOrEqual(5); expect(t.tokens.length).toBe(t.slots.length+(fromNumeral?1:2));
   const selected=(id:string)=>t.tokens.find(x=>x.id===t.answer[id])!.text!;
   const expected=counts[0]!+counts.slice(1).reduce((s,n,i)=>s+n/10**(i+1),0);
   if(fromNumeral) expect(t.slots.some(s=>s.id==='number')).toBe(false);
   else expect(Number(selected('number').replace(',','.'))).toBeCloseTo(expected,9);
   for(let i=0;i<counts.length;i++) expect(Number(selected(`part${i}`).split(' ')[0])).toBe(counts[i]);
   expect(check(t,{kind:'place',map:{...t.answer}}).ok).toBe(true);
   for(const slot of t.slots) {
    const bad={...t.answer,[slot.id]:slot.id==='number'?'wrong-number':'wrong-part'};
    expect(check(t,{kind:'place',map:bad}).ok,`${phase}/${q.tag}/${seed}/${slot.id}`).toBe(false);
    expect(check(t,{kind:'place',map:bad}).why).toBeTruthy();
   }
  }
  expect([...tags].sort()).toEqual(['numeral','repair','transfer','words']); expect(zeros).toBeGreaterThan(100); expect(thousandths).toBeGreaterThan(100);
 });
 it('retains historical comparison evidence without calling it current joint production', () => {
  const id='M-DEC-04'; expect(revOf(id)).toBe(LIGHT_REV);
  const a=(at:number,rev:string,tag='transfer',extra:Partial<Attempt>={}):Attempt=>({node:id,phase:'quick',tag,ok:true,at,rev,...extra});
  const old=[a(1,AUDIT_REV,'trap'),a(2,AUDIT_REV,'transfer')]; store.load({world:'ranta',attempts:old});
  expect(store.state(id).checked).toBe(true);expect(store.state(id).produced).toBe(false);expect(store.get().attempts).toEqual(old);
  for(const tag of ['words','numeral','repair','transfer']) {
   store.load({world:'ranta',attempts:[...old,a(3,LAUNCH_REV,tag)]});expect(store.state(id).produced).toBe(true);
   for(const extra of [{ok:false},{phase:'guided' as const,help:['hint' as const]},{help:['reveal' as const]},{replay:true}]) {
    store.load({world:'ranta',attempts:[...old,a(3,LAUNCH_REV,tag,extra)]});expect(store.state(id).produced).toBe(false);
   }
  }
 });
});
it('M-DEC-02 hundredths question names column structure without announcing the total', () => {
 let found=0;
 for(let seed=0;seed<100;seed++) {
  const q=NODES['M-DEC-02']!.item(rng(seed),'independent');if(q.tag!=='same')continue;found++;
  const host={innerHTML:''};q.scene!(host as HTMLElement);
  const label=host.innerHTML.match(/aria-label="([^"]+)"/)![1]!;
  expect(label).not.toMatch(/\d+ sadasosaa/);expect(label).toContain('saraketta');expect(label).toContain('kymmeneen');
  const tenths=Number(q.say.match(/0,(\d)/)![1]);
  expect((host.innerHTML.match(/fill="var\(--pond\)"/g)||[]).length).toBe(tenths*10);
 }
 expect(found).toBeGreaterThan(15);
});
