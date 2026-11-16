import { CATALOG, FAMILIES, catalogNode } from './catalog';
import type { Attempt } from './evidence';
import gradeBands from '../data/grade-bands.json';

/**
 * The Saaristo theory book reads the 690 graph from its pedagogical roots outward, one
 * generation at a time: first grades 1–2, then 3–6, then 7–9. Inside one band and one
 * generation the route takes one node from each family in turn, so the next page is usually
 * a cousin or an aunt rather than the child of the page before. Every node still comes after
 * all of its required parents.
 *
 * Grade bands come from the frozen 690 source (docs/lite-690/source/data/sammakko_690_story.json).
 */
const BAND_RANK: Record<string, number> = { '1-2': 0, '1-6': 0, '3-6': 1, '7-9': 2 };
const bandOf = (id: string) => BAND_RANK[(gradeBands as Record<string, string>)[id] ?? '7-9'] ?? 2;

function wideOrder(): string[] {
  const band = new Map<string, number>(), depth = new Map<string, number>();
  const visit = (id: string): void => {
    if (depth.has(id)) return;
    const parents = catalogNode(id)?.requiredParents ?? [];
    parents.forEach(visit);
    // A node never comes before a parent, even when the parent belongs to a later band.
    band.set(id, Math.max(bandOf(id), ...parents.map(p => band.get(p) ?? 0)));
    depth.set(id, parents.length ? 1 + Math.max(...parents.map(p => depth.get(p) ?? 0)) : 0);
  };
  CATALOG.forEach(node => visit(node.id));
  const familyRank = new Map(FAMILIES.map((family, i) => [family.id, i]));
  const levels = new Map<string, string[]>();
  for (const node of CATALOG) {
    const key = `${band.get(node.id)}:${String(depth.get(node.id)).padStart(3, '0')}`;
    levels.set(key, [...levels.get(key) ?? [], node.id]);
  }
  const order: string[] = [];
  for (const key of [...levels.keys()].sort()) {
    // Round-robin across families: one page from each family, then the next round.
    const byFamily = new Map<string, string[]>();
    for (const id of levels.get(key)!) {
      const family = catalogNode(id)!.familyId;
      byFamily.set(family, [...byFamily.get(family) ?? [], id]);
    }
    const queues = [...byFamily.entries()].sort((a, b) => (familyRank.get(a[0]) ?? 0) - (familyRank.get(b[0]) ?? 0)).map(([, ids]) => ids);
    while (queues.some(q => q.length)) for (const q of queues) { const id = q.shift(); if (id) order.push(id); }
  }
  return order;
}

export const STORY_ORDER: readonly string[] = wideOrder();
const opening = STORY_ORDER[0]!;
export type StoryOutcome = 'independent' | 'assisted' | 'open';

/** Best actual result per topic; travelling past a stop alone yields no learning evidence. */
export function storyProgress(passed: readonly string[], attempts: readonly Attempt[]) {
  const outcomes = new Map<string, StoryOutcome>();
  const visited = new Set(passed);
  for (const id of visited) outcomes.set(id, 'open');
  let lastTried: string | undefined;
  for (const a of attempts) {
    if (a.syn) continue;
    lastTried = a.node;
    const best = outcomes.get(a.node);
    if (best === 'independent') continue;
    if (!a.ok || a.proc === false) {
      if (!best) outcomes.set(a.node, 'open');
      continue;
    }
    const unaided = ['independent', 'transfer', 'retrieval'].includes(a.phase)
      && !a.help?.length && !a.unreviewed && !a.replay;
    outcomes.set(a.node, unaided ? 'independent' : 'assisted');
  }
  // Saved stops can reflect a previous route order or a direct visit. Never infer that
  // earlier stops were passed from the last stored ID.
  const next = passed.length === 0 ? (lastTried ?? opening) : STORY_ORDER.find(id => !visited.has(id));
  const review = STORY_ORDER.filter(id => outcomes.has(id) && outcomes.get(id) !== 'independent');
  return { next, review, outcomes, visited: visited.size };
}
