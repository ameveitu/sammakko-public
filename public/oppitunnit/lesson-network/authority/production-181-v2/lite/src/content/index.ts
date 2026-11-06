// Registry: every graph node has exactly one content spec.
import { ORDER } from '../engine/graph';
import type { NodeSpec } from '../engine/types';
import { ADDED181_NODES } from './added181';
import { ALGEBRA79_NODES } from './algebra79';
import { ALGEBRA79B_NODES } from './algebra79b';
import { ARITH_NODES } from './arith';
import { DECIMAL_NODES } from './decimals';
import { FACT_NODES } from './facts';
import { GOALS } from './goals';
import { MEASURE_NODES } from './measure';
import { NUMBER_NODES } from './numbers';
import { PHYSICS_NODES } from './physics';
import { RANTA2_NODES } from './ranta2';
import { SAARI1_NODES } from './saari1';
import { SAARI2_NODES } from './saari2';
import { SCIENCE_NODES } from './science';
import { THINKING_NODES } from './thinking';
import { WRITTEN_NODES } from './written';
import { setContentRev, setRevPolicy } from '../engine/store';
import { MOTION_REV, SIMS } from './motionsims';

/** Content revision for the whole lesson set. Bump when any item changes meaning; it is
 *  written into every attempt so that old evidence can be told apart from new. */
export const CONTENT_REV = 'lite181-2026-10-27';
setContentRev(CONTENT_REV);

const ALL = [...NUMBER_NODES, ...MEASURE_NODES, ...ARITH_NODES, ...SCIENCE_NODES, ...PHYSICS_NODES, ...RANTA2_NODES, ...SAARI1_NODES, ...SAARI2_NODES, ...ALGEBRA79_NODES,
  ...FACT_NODES, ...THINKING_NODES, ...DECIMAL_NODES, ...WRITTEN_NODES, ...ALGEBRA79B_NODES, ...ADDED181_NODES];
export const NODES: Record<string, NodeSpec> = Object.fromEntries(ALL.map((n) => [n.id, n]));

for (const n of ALL) n.goal ??= GOALS[n.id];

// Mapped motion/time lessons run on the shared player: most guided items, a third of the
// independent ones, and every retrieval check use a scenario. Transfer items stay as they are.
const SIM_SHARE: Record<string, number> = { guided: 0.6, independent: 0.35, retrieval: 0.5, transfer: 0 };
for (const [id, gen] of Object.entries(SIMS)) {
  const n = NODES[id];
  if (!n) throw new Error(`Motion lesson without a node: ${id}`);
  const base = n.item;
  n.item = (r, phase) => (r.next() < (SIM_SHARE[phase] ?? 0) ? { ...gen(r), tag: 'sim' } : base(r, phase));
  // A lesson revised later in the per-lesson audit keeps its own revision.
  n.rev ??= MOTION_REV; n.validRevs ??= [n.rev];
}
setRevPolicy((id) => NODES[id]?.validRevs);
/** The revision recorded with an answer: the lesson's own, else the global one. */
export const revOf = (id: string) => NODES[id]?.rev ?? CONTENT_REV;
const noGoal = ALL.filter((n) => !n.goal).map((n) => n.id);
if (noGoal.length) throw new Error(`Lessons without a goal: ${noGoal.join(', ')}`);

const missing = ORDER.filter((id) => !NODES[id]);
const extra = ALL.filter((n) => !ORDER.includes(n.id)).map((n) => n.id);
if (missing.length || extra.length || ALL.length !== ORDER.length)
  throw new Error(`Content does not match graph. Missing: ${missing.join(', ')}. Extra: ${extra.join(', ')}.`);
