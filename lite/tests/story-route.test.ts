import { describe, expect, it } from 'vitest';
import { STORY_ORDER, storyProgress } from '../src/engine/story-route';
import { createJourney, JOURNEY_KEY } from '../src/engine/journey';
import type { Attempt } from '../src/engine/evidence';

const [cake, second, third, fourth, fifth, sixth] = STORY_ORDER;
const answer = (node: string, fields: Partial<Attempt> = {}): Attempt => ({
  node, phase: 'independent', tag: 'make', at: 1, ok: true, ...fields,
});

describe('Saaristo story and review', () => {
  it('can advance every stop with no answer, finish, and review once per stop without creating evidence', () => {
    const journey = createJourney(null);
    expect(cake).toBe('M-FRAC-13');
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
});
