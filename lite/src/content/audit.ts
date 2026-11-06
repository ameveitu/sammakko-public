// Family audit: sample every lesson's generators, group items by family (tag), and
// compare what the items demand (features.ts) with what the registry (families.ts)
// and the lesson's own canonical ancestry explain. Used by tests and the coverage tool.
import { kc, ORDER } from '../engine/graph';
import { rng } from '../engine/rng';
import type { Phase, Task } from '../engine/types';
import { family, type Family } from './families';
import { FEATURE_KCS, featuresOf, suppliedBefore, type Feature } from './features';
import { NODES } from './index';

export interface AuditRow {
  node: string; tag: string; phases: Phase[]; kinds: Task['kind'][];
  features: Feature[]; answer?: [number, number]; reg: Family;
  /** Detected demands with nowhere declared to learn them. */
  unexplained: Feature[];
  /** How each detected feature is explained. */
  why: Partial<Record<Feature, string>>;
}

/** Required and strong canonical ancestry (the lesson's own teaching path). */
export function closure(id: string): Set<string> {
  const s = new Set<string>();
  const walk = (x: string) => { for (const r of kc(x).rel) if ((r.strength === 'required' || r.strength === 'strong') && !s.has(r.id)) { s.add(r.id); walk(r.id); } };
  walk(id);
  return s;
}

const SUPPLIABLE: Feature[] = ['convertLength', 'convertTime', 'convertMass', 'convertVolume', 'speedUnit', 'perimeter'];
const PHASES: Phase[] = ['guided', 'independent', 'transfer'];

export function audit(seeds = 120, only?: string[]): AuditRow[] {
  const rows = new Map<string, AuditRow>();
  for (const id of only ?? ORDER) {
    const anc = closure(id);
    for (const phase of PHASES) for (let s = 0; s < seeds; s++) {
      const it = NODES[id]!.item(rng(s * 31 + phase.length), phase);
      const key = `${id}/${it.tag}`;
      let row = rows.get(key);
      if (!row) { row = { node: id, tag: it.tag, phases: [], kinds: [], features: [], reg: family(id, it.tag, it.task.kind), unexplained: [], why: {} }; rows.set(key, row); }
      if (!row.phases.includes(phase)) row.phases.push(phase);
      if (!row.kinds.includes(it.task.kind)) row.kinds.push(it.task.kind);
      const a = it.task.kind === 'numeric' || it.task.kind === 'line' ? it.task.answer : undefined;
      if (a !== undefined) row.answer = row.answer ? [Math.min(row.answer[0], a), Math.max(row.answer[1], a)] : [a, a];
      const given = suppliedBefore(it);
      for (const f of featuresOf(it)) {
        if (!row.features.includes(f)) row.features.push(f);
        // "Supplied" holds per item: an item that does not show the fact before the answer is not covered.
        if (row.why[f]?.startsWith('annettu') && !given) { row.why[f] = undefined; }
        if (row.why[f]) continue;
        const re = FEATURE_KCS[f];
        const reg = row.reg;
        const own = re.test(id) ? 'oma sisältö' : [...anc].find((k) => re.test(k));
        const declared = [...reg.assumed, ...reg.coTaught.map((c) => c.kc)].find((k) => re.test(k));
        const why = own === 'oma sisältö' ? own
          : own ? `polku: ${own}`
          : declared ? `rekisteri: ${declared}`
          : reg.incidental[f] ? `ei vaadita: ${reg.incidental[f]}`
          : SUPPLIABLE.includes(f) && reg.supplied.length && given ? `annettu: ${reg.supplied[0]}`
          : undefined;
        if (why) { row.why[f] = why; row.unexplained = row.unexplained.filter((x) => x !== f); }
        else if (!row.unexplained.includes(f)) row.unexplained.push(f);
      }
    }
  }
  return [...rows.values()];
}
