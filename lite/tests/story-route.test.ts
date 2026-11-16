import { describe, expect, it } from 'vitest';
import { STORY_ORDER, storyProgress } from '../src/engine/story-route';
import { createJourney, JOURNEY_KEY } from '../src/engine/journey';
import type { Attempt } from '../src/engine/evidence';
import { catalogNode, requiredOrder } from '../src/engine/catalog';
import bands from '../src/data/grade-bands.json';
import { ROUTE_FIRST, ROUTE_LAST, ROUTE_SECOND } from '../e2e/route-ends';

// `cake` keeps its historical name: it is simply the first stop of the route.
const [cake, second, third, fourth, fifth, sixth] = STORY_ORDER;
const answer = (node: string, fields: Partial<Attempt> = {}): Attempt => ({
  node, phase: 'independent', tag: 'make', at: 1, ok: true, ...fields,
});

describe('Saaristo story and review', () => {
  it('reads the graph wide from the pedagogical roots: grades 1–2, then 3–6, then 7–9', () => {
    const band = (id: string) => ({ '1-2': 0, '1-6': 0, '3-6': 1, '7-9': 2 } as Record<string, number>)[(bands as Record<string, string>)[id]!]!;
    const seen = new Set<string>();
    for (const id of STORY_ORDER) {
      for (const parent of catalogNode(id)!.requiredParents) expect(seen.has(parent), `${parent} before ${id}`).toBe(true);
      seen.add(id);
    }
    expect(catalogNode(cake)!.requiredParents).toEqual([]);
    // Bands only move forward, except where a node waits for a parent from a later band.
    const firstLater = STORY_ORDER.findIndex(id => band(id) === 1);
    expect(STORY_ORDER.slice(0, firstLater).every(id => band(id) === 0)).toBe(true);
    expect(STORY_ORDER.slice(firstLater).some(id => band(id) === 0)).toBe(false);
    // Wide, not deep: the first twelve pages come from at least eight different families.
    expect(new Set(STORY_ORDER.slice(0, 12).map(id => catalogNode(id)!.familyId)).size).toBeGreaterThanOrEqual(8);
  });

  it('can advance every stop with no answer, finish, and review once per stop without creating evidence', () => {
    const journey = createJourney(null);
    expect(new Set(STORY_ORDER).size).toBe(690);
    expect(journey.storyProgress().next).toBe(cake);
    for (let i = 0; i < STORY_ORDER.length; i++) {
      expect(journey.advanceStory(STORY_ORDER[i])).toBe(STORY_ORDER[i + 1]);
    }
    expect(journey.get()).toMatchObject({ attempts: [], events: [], effects: [], storyStops: STORY_ORDER });
    expect(journey.storyProgress().review).toEqual(STORY_ORDER);
    for (let i = 0; i < STORY_ORDER.length; i++) {
      expect(journey.advanceStory(STORY_ORDER[i], true)).toBe(STORY_ORDER[i + 1]);
    }
    expect(journey.storyProgress().visited).toBe(690);
  });

  it('classifies real attempts and upgrades a stop after a later unaided success', () => {
    const attempts = [
      answer(cake, { ok: false }), answer(second, { phase: 'guided' }),
      answer(third, { help: ['hint'] }), answer(fourth, { replay: true }),
      answer(fifth, { unreviewed: true }), answer(sixth, { syn: true }),
    ];
    const before = storyProgress([cake, second], attempts);
    expect([...before.outcomes.values()]).toEqual(['open', 'assisted', 'assisted', 'assisted', 'assisted']);
    expect(before.review).toEqual([cake, second, third, fourth, fifth]);
    attempts.push(answer(cake), answer(cake, { ok: false }));
    expect(storyProgress([cake, second], attempts).outcomes.get(cake)).toBe('independent');
    expect(storyProgress([cake, second], attempts).review).toEqual([second, third, fourth, fifth]);
  });

  it('resumes historic v3 progress and merges later travel across reloads and tabs', () => {
    let raw = JSON.stringify({ v: 3, attempts: [answer(cake, { ok: false })], events: [], effects: [] });
    const storage = {
      getItem: (key: string) => key === JOURNEY_KEY ? raw : null,
      setItem: (_key: string, value: string) => { raw = value; },
    };
    const first = createJourney(storage);
    const other = createJourney(storage);
    expect(first.storyProgress().next).toBe(cake);
    expect(first.advanceStory(cake)).toBe(second);
    other.record(answer(second, { phase: 'guided' }));
    expect(other.advanceStory(second)).toBe(third);
    expect(first.storyProgress().next).toBe(third);
    const reloaded = createJourney(storage);
    expect(reloaded.get().attempts).toHaveLength(2);
    expect(reloaded.storyProgress().review).toEqual([cake, second]);
    reloaded.record(answer(cake, { at: 2 }));
    expect(reloaded.advanceStory(cake, true)).toBe(second);
    expect(reloaded.advanceStory(second, true)).toBeUndefined();
    expect(reloaded.storyProgress().next).toBe(third);
    expect(reloaded.storyProgress().review).toEqual([second]);
  });

  it('resumes old v3 route prefixes and direct skips at the earliest unvisited stop', () => {
    const oldOrder = ['M-FRAC-13', ...requiredOrder.filter(id => id !== 'M-FRAC-13')];
    for (const passed of [oldOrder.slice(0, 1), oldOrder.slice(0, 10), [STORY_ORDER[20]!]]) {
      let raw = JSON.stringify({ v: 3, attempts: [], events: [], effects: [], storyStops: passed });
      const storage = { getItem: () => raw, setItem: (_key: string, value: string) => { raw = value; } };
      const journey = createJourney(storage);
      const expected = STORY_ORDER.find(id => !passed.includes(id))!;
      expect(journey.storyProgress().next).toBe(expected);
      expect(catalogNode(expected)!.requiredParents.every(id => passed.includes(id))).toBe(true);
      expect(journey.get().storyStops).toEqual(passed);
      expect(journey.advanceStory(expected)).toBe(STORY_ORDER.find(id => ![...passed, expected].includes(id)));
      expect(createJourney(storage).get().storyStops).toEqual([...passed, expected]);
      expect(createJourney(storage).get().attempts).toEqual([]);
    }
  });

  it('names the same route ends as the browser route test', () => {
    expect([ROUTE_FIRST, ROUTE_SECOND, ROUTE_LAST]).toEqual([STORY_ORDER[0], STORY_ORDER[1], STORY_ORDER.at(-1)]);
  });
});
