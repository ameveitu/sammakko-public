import { requiredOrder } from './catalog';
import type { Attempt } from './evidence';

// The feast is the existing opening scene. Every other topic follows the catalog's prerequisite order.
const opening = 'M-FRAC-13';
export const STORY_ORDER: readonly string[] = [opening, ...requiredOrder.filter(id => id !== opening)];
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
  const after = STORY_ORDER.indexOf(passed.at(-1) ?? '') + 1;
  const next = passed.length === 0 ? (lastTried ?? opening) :
    STORY_ORDER.slice(after).find(id => !visited.has(id)) ?? STORY_ORDER.find(id => !visited.has(id));
  const review = STORY_ORDER.filter(id => outcomes.has(id) && outcomes.get(id) !== 'independent');
  return { next, review, outcomes, visited: visited.size };
}
