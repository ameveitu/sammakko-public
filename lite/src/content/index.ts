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
import { setContentRev, setProducePolicy, setRevPolicy } from '../engine/store';
import { REVIEW_REV, REVIEW2_REV, LAUNCH_REV, LIGHT_REV } from './audit-rev';
import { MOTION_REV, PLAY, SIMS } from './motionsims';

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
  const base = n.item, baseDemo = n.demo;
  n.item = (r, phase) => (r.next() < (SIM_SHARE[phase] ?? 0) ? { ...gen(r), tag: 'sim' } : base(r, phase));
  // Novice path: the first worked example is always the shared player itself, so every learner who opens the
  // lesson runs, pauses and replays one real event before any static picture (review L181-03).
  n.demo = (r) => {
    const q = gen(r);
    // The question is explored first; the answer comes on the next page, not in the same text.
    return [
      { say: `Kokeillaan ensin yhdessä. ${q.say.replace(PLAY, '').trim()} Mieti ensin, mitä arvaat. Käynnistä, pysäytä ja toista niin monta kertaa kuin haluat.`, scene: q.scene! },
      { say: `Katsotaan vastaus: ${q.explain}`, scene: q.scene! },
      ...baseDemo(r),
    ];
  };
  // A lesson revised later in the per-lesson audit keeps its own revision.
  n.rev ??= MOTION_REV; n.validRevs ??= [n.rev];
}
// Production rule (review L181-06, narrowed in review U02): these lessons claim writing, building,
// recording, listing or calculating. A check also needs one correct answer in a family where the learner
// does exactly that. Matching ready-made expressions (translate, parts), computing a count of outfits
// instead of listing them (outfits) and filling one digit of a laid-out sum (step) are recognition or
// part-steps: useful practice, not the claim. Answers collected under earlier revisions stay valid; a
// check earned without a production answer is reported as recognition.
// What a production answer shows. M-WRADD (review V4-01): the column and transfer families ask for the
// sum the learner computes; the written method and the carry digit are not observed, so the claim is the sum.
export const PRODUCE_WHAT: Record<string, string> = {
  'M79-EXPR-FORM': 'lausekkeen rakentamista',
  'M79-EQ1-FORM': 'yhtälön rakentamista',
  'M-DATA-02': 'havaintojen kirjaamista',
  'M-TH-07': 'vaihtoehtojen listaamista',
  'M-WRADD': 'summan laskemista itse',
  'M79-FRAC-DIV': 'osamäärän laskemista itse',
};
export const PRODUCE: Record<string, string[]> = {
  'M79-EXPR-FORM': ['build'],
  'M79-EQ1-FORM': ['build'],
  'M-DATA-02': ['record'],
  'M-TH-07': ['list'],
  'M-WRADD': ['column', 'transfer'],
  'M79-FRAC-DIV': ['fracFrac', 'calc', 'groups', 'transfer'],
};
// Lessons whose generated items changed in the review fixes: answers record the new revision (so a seed
// replays the right item); earlier answers stay valid evidence.
for (const id of ['M-PLACE-05', 'M-TH-08', 'M-SYM-MINUS', 'M-UNIT-05', 'M-DEC-03', 'M-DEC-WRITE', 'M-TH-02']) {
  const n = NODES[id]!;
  if (n.validRevs) n.validRevs = [...n.validRevs, REVIEW_REV];
  n.rev = REVIEW_REV;
}
for (const [id, tags] of Object.entries(PRODUCE)) {
  const n = NODES[id]!;
  n.produce = tags;
  n.produceWhat = PRODUCE_WHAT[id];
  if (n.validRevs) n.validRevs = [...n.validRevs, REVIEW_REV]; // no list: every revision is valid already
  n.rev = REVIEW_REV;
}
// Second review round (U08): a lesson whose generated items or production rule changed records a new
// revision, so a seed and revision replay exactly one item. Validity is a separate decision: every
// earlier revision of these lessons stays valid evidence. tests/item-manifest.test.ts enforces the bump.
export const REVIEW2_NODES = ['M-GEO-04', 'M-TH-02', 'M-TH-08', 'M-PLACE-05', ...Object.keys(PRODUCE)];
for (const id of REVIEW2_NODES) {
  const n = NODES[id]!;
  if (n.validRevs) n.validRevs = [...n.validRevs, REVIEW2_REV];
  n.rev = REVIEW2_REV;
}
export const LAUNCH_PRODUCE_IDS = ['M-NUM-1TO1', 'M-DATA-04', 'M79-FUNC-GRAPH', 'M-DEC-04', 'M-DATA-01'];
export const LAUNCH_REVISED_NODES = ['M-GEO-01', 'M-GEO-04', 'M-SYM-01', 'M-TH-02', ...LAUNCH_PRODUCE_IDS];
// Apply current launch revisions after historical review overlays; keep every older valid revision.
for (const id of LAUNCH_REVISED_NODES) {
  const n = NODES[id]!;
  if (n.validRevs) n.validRevs = [...new Set([...n.validRevs, LAUNCH_REV])];
  n.rev = LAUNCH_REV;
}
// Lighter layout (user request 2026-11-06): one answer area, no scrolling. Launch answers stay valid.
export const LIGHT_PRODUCE_IDS = ['M-DATA-04', 'M-DEC-04'];
for (const id of LIGHT_PRODUCE_IDS) {
  const n = NODES[id]!;
  n.validRevs = [...new Set([...(n.validRevs ?? []), LIGHT_REV])];
  n.rev = LIGHT_REV;
}
setRevPolicy((id) => NODES[id]?.validRevs);
// The production gate applies to answers given under the narrowed rule only.
setProducePolicy((id) => { const n = NODES[id]; return n?.produce ? { tags: n.produce, revs: LIGHT_PRODUCE_IDS.includes(id) ? [LAUNCH_REV, LIGHT_REV] : LAUNCH_PRODUCE_IDS.includes(id) ? [n.rev ?? CONTENT_REV] : [REVIEW2_REV] } : undefined; });
/** The revision recorded with an answer: the lesson's own, else the global one. */
export const revOf = (id: string) => NODES[id]?.rev ?? CONTENT_REV;
const noGoal = ALL.filter((n) => !n.goal).map((n) => n.id);
if (noGoal.length) throw new Error(`Lessons without a goal: ${noGoal.join(', ')}`);

const missing = ORDER.filter((id) => !NODES[id]);
const extra = ALL.filter((n) => !ORDER.includes(n.id)).map((n) => n.id);
if (missing.length || extra.length || ALL.length !== ORDER.length)
  throw new Error(`Content does not match graph. Missing: ${missing.join(', ')}. Extra: ${extra.join(', ')}.`);
