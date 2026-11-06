import { describe, expect, it } from 'vitest';
import { numberJourneyEvidence, numberJourneySpecs } from '../src/content/number-journey';
import { checkNumberJourney, solutionNumberJourney, wrongNumberJourneyResponses, type Direction, type NumberJourneyResponse, type NumberJourneyTask } from '../src/content/models/number-journey';
import { catalogNode } from '../src/engine/catalog';
import { rng } from '../src/engine/rng';

const kind = 'number-journey' as const;
const base = { kind, context: { title: 'Testi', skills: [] }, givens: [] };
const spec = (id: string) => numberJourneySpecs.find(node => node.id === id)!;

describe('foundational number journeys', () => {
  it('authors exactly thirteen stable two-family activities with separate transfer and canonical context', () => {
    expect(numberJourneySpecs).toHaveLength(13);
    for (const node of numberJourneySpecs) {
      const families = new Set<string>();
      expect(node.validRevs).toEqual([node.rev]);
      for (const phase of ['independent', 'guided', 'transfer', 'retrieval'] as const) for (let seed = 0; seed < 25; seed++) {
        const { task, tag } = node.item(rng(seed), phase);
        if (phase === 'independent') families.add(tag);
        expect(task).toEqual(node.item(rng(seed), phase).task);
        expect(tag === 'transfer').toBe(phase === 'transfer');
        expect(task.context.skills.length).toBeGreaterThan(0);
        expect(task.context.skills.every(id => catalogNode(id))).toBe(true);
        expect(checkNumberJourney(task, solutionNumberJourney(task)).ok, `${node.id} ${phase} ${seed}`).toBe(true);
        for (const wrong of wrongNumberJourneyResponses(task)) expect(checkNumberJourney(task, wrong).ok).toBe(false);
      }
      expect(families.size).toBe(2);
      expect(families).toEqual(new Set(numberJourneyEvidence[node.id]!.families));
    }
  });

  it('requires the actual group partition as well as the total', () => {
    const task: NumberJourneyTask = { ...base, mode: 'grouped', parts: [5, 3, 2], pattern: 'uneven', object: 'lehti' };
    const response: NumberJourneyResponse = { kind, mode: 'grouped', parts: [5, 3, 2], total: 10 };
    expect(checkNumberJourney(task, response).ok).toBe(true);
    expect(checkNumberJourney(task, { ...response, parts: [4, 4, 2] }).ok).toBe(false);
    expect(checkNumberJourney(task, { ...response, total: 3 }).ok).toBe(false);
  });

  it('uses separated bands, estimates before exact evidence, and accepts only the actual count afterward', () => {
    for (const phase of ['independent', 'transfer'] as const) for (let seed = 0; seed < 30; seed++) {
      const { task } = spec('M-NUM-05').item(rng(seed), phase);
      if (task.mode !== 'estimate') throw Error('Expected quantity estimation');
      const covered = task.bands.map(([min, max]) => Array.from({ length: max - min + 1 }, (_, i) => min + i));
      const band = covered.findIndex(values => values.includes(task.amount));
      expect(covered.filter(values => values.includes(task.amount))).toHaveLength(1);
      expect(covered[1]![0]! - covered[0]!.at(-1)!).toBeGreaterThan(1);
      expect(covered[2]![0]! - covered[1]!.at(-1)!).toBeGreaterThan(1);
      const answer: NumberJourneyResponse = { kind, mode: 'estimate', band, groupedCount: task.amount };
      expect(checkNumberJourney(task, answer).ok).toBe(true);
      expect(checkNumberJourney(task, { ...answer, band: -1 }).ok).toBe(false);
      expect(checkNumberJourney(task, { ...answer, groupedCount: task.amount + 1 }).ok).toBe(false);
    }
  });

  it('keeps the natural-number boundary and accepts interchangeable ties in either sort direction', () => {
    const zero: NumberJourneyTask = { ...base, mode: 'neighbors', center: 0, view: 'quay' };
    expect(checkNumberJourney(zero, { kind, mode: 'neighbors', previous: null, next: 1 }).ok).toBe(true);
    expect(checkNumberJourney(zero, { kind, mode: 'neighbors', previous: -1, next: 1 }).ok).toBe(false);
    expect(checkNumberJourney({ ...zero, center: 1 }, { kind, mode: 'neighbors', previous: 0, next: 2 }).ok).toBe(true);
    for (const descending of [false, true]) {
      const task: NumberJourneyTask = { ...base, mode: 'order', cards: [{ id: 'P', value: 3 }, { id: 'Q', value: 3 }, { id: 'R', value: 8 }], descending, view: 'amounts' };
      const sequence = descending ? ['R', 'Q', 'P'] : ['Q', 'P', 'R'];
      expect(checkNumberJourney(task, { kind, mode: 'order', ids: sequence }).ok).toBe(true);
      expect(checkNumberJourney(task, { kind, mode: 'order', ids: [sequence[0]!, sequence[0]!, sequence[2]!] }).ok).toBe(false);
    }
  });

  it('separates quantity, identifiers and the named end of an ordinal lineup', () => {
    const task: NumberJourneyTask = { ...base, mode: 'meaning', cards: [
      { id: 'P', text: '4 lehteä', meaning: 'quantity' }, { id: 'Q', text: 'lautta numero 4', meaning: 'identifier' },
      { id: 'R', text: '4 metriä', meaning: 'length' }, { id: 'S', text: '4. lautta', meaning: 'ordinal' },
    ], target: 'P', count: 4, object: 'lehti' };
    expect(checkNumberJourney(task, { kind, mode: 'meaning', quantities: ['P'], built: 4 }).ok).toBe(true);
    expect(checkNumberJourney(task, { kind, mode: 'meaning', quantities: ['P', 'Q'], built: 4 }).ok).toBe(false);
    const lineup: NumberJourneyTask = { ...base, mode: 'ordinal', first: ['Aava', 'Loikka', 'Sulka', 'Majava'],
      changed: ['Sulka', 'Aava', 'Loikka', 'Majava'], place: 2, fromEnd: true, vertical: true, changedFromEnd: false };
    expect(checkNumberJourney(lineup, { kind, mode: 'ordinal', object: 'Sulka', newPlace: 1 }).ok).toBe(true);
    expect(checkNumberJourney(lineup, { kind, mode: 'ordinal', object: 'Loikka', newPlace: 3 }).ok).toBe(false);
  });

  it('accepts alternative disjoint pairings, distinguishes parity and requires cross-set matches for difference', () => {
    const parity: NumberJourneyTask = { ...base, mode: 'pair', activity: 'parity', count: 5, object: 'lehti' };
    const pairResponse: NumberJourneyResponse = { kind, mode: 'pair', pairs: [['p3', 'p1'], ['p5', 'p2']], single: 1,
      classification: 'odd', larger: null, minuend: 0, subtrahend: 0 };
    expect(checkNumberJourney(parity, pairResponse).ok).toBe(true);
    expect(checkNumberJourney(parity, { ...pairResponse, pairs: [['p3', 'p1'], ['p3', 'p5']] }).ok).toBe(false);
    expect(checkNumberJourney(parity, { ...pairResponse, classification: 'even' }).ok).toBe(false);
    const compare: NumberJourneyTask = { ...base, mode: 'pair', activity: 'difference', a: 2, b: 3, object: 'kaisla' };
    const opposite = { ...pairResponse, pairs: [['b3', 'a2'], ['a1', 'b2']] as const, larger: 'b' as const, minuend: 3, subtrahend: 2 };
    expect(checkNumberJourney(compare, { ...opposite, pairs: [...opposite.pairs] }).ok).toBe(true);
    expect(checkNumberJourney(compare, { ...opposite, pairs: [['b3', 'b2'], ['a1', 'a2']] }).ok).toBe(false);
  });

  it('checks both addend orders and parentheses with their own intermediate values', () => {
    const task: NumberJourneyTask = { ...base, mode: 'add-law', activity: 'commute', counts: [3, 5] };
    const answer: NumberJourneyResponse = { kind, mode: 'add-law', views: [1, 0], operands: [[3, 5], [5, 3]], inside: [], totals: [8, 8], choice: 0 };
    expect(checkNumberJourney(task, answer).ok).toBe(true);
    expect(checkNumberJourney(task, { ...answer, operands: [[3, 5], [3, 5]] }).ok).toBe(false);
    const assoc: NumberJourneyTask = { ...task, activity: 'associate', counts: [3, 5, 4], preferred: true };
    expect(checkNumberJourney(assoc, { ...answer, operands: [[3, 5, 4], [3, 5, 4]], inside: [8, 9], totals: [12, 12], choice: 1 }).ok).toBe(true);
    expect(checkNumberJourney(assoc, { ...answer, operands: [[3, 5, 4], [3, 5, 4]], inside: [8, 8], totals: [12, 12] }).ok).toBe(false);
  });

  it('checks the operation even when addition and subtraction produce the same value', () => {
    const task: NumberJourneyTask = { ...base, mode: 'operation', story: 'take', a: 6, b: 0, object: 'kaisla' };
    const answer: NumberJourneyResponse = { kind, mode: 'operation', operation: '−', first: 6, second: 0, result: 6 };
    expect(checkNumberJourney(task, answer).ok).toBe(true);
    expect(checkNumberJourney(task, { ...answer, operation: '+' }).ok).toBe(false);
  });

  it('requires all unit steps across zero and translates relative routes from each heading', () => {
    const task: NumberJourneyTask = { ...base, mode: 'move', start: 2, delta: -5, min: -8, max: 8 };
    expect(checkNumberJourney(task, { kind, mode: 'move', positions: [2, 1, 0, -1, -2, -3], value: -3 }).ok).toBe(true);
    expect(checkNumberJourney(task, { kind, mode: 'move', positions: [2, -3], value: -3 }).ok).toBe(false);
    const entries: readonly [Direction, readonly [Direction, Direction], { x: number; y: number }][] = [
      ['north', ['west', 'north'], { x: 1, y: 1 }], ['east', ['north', 'east'], { x: 3, y: 1 }],
      ['south', ['east', 'south'], { x: 3, y: 3 }], ['west', ['south', 'west'], { x: 1, y: 3 }],
    ];
    for (const [heading, moves, end] of entries) {
      const route: NumberJourneyTask = { ...base, mode: 'route', frame: 'actor', origin: { x: 2, y: 2 }, steps: ['left', 'forward'], heading };
      expect(checkNumberJourney(route, { kind, mode: 'route', moves: [...moves], end }).ok).toBe(true);
      expect(checkNumberJourney(route, { kind, mode: 'route', moves: [...moves].reverse(), end }).ok).toBe(false);
    }
  });
});
