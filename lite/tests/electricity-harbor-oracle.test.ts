import { describe, expect, it } from 'vitest';
import { solveDC, voltageAcross, type DCEdge } from '../src/content/models/dc-circuit';
import { checkElectricityHarbor, harborOutcome, type ElectricityHarborResponse, type ElectricityHarborTask } from '../src/content/models/electricity-harbor';

const resistor = (id: string, a: string, b: string, ohms: number, role?: DCEdge['role']): DCEdge =>
  ({ id, a, b, ohms, role, kind: 'resistor' });
const wire = (id: string, a: string, b: string): DCEdge => ({ id, a, b, kind: 'wire' });
const circuit = (volts: number, ...edges: DCEdge[]) => ({ positive: 'p', negative: 'n', volts, edges });

describe('independent electricity harbor oracle', () => {
  it('matches series and parallel closed forms and conserves current at their junctions', () => {
    for (const volts of [1, 5, 12]) {
      for (const first of [1, 3, 8]) {
        for (const second of [2, 3, 7]) {
          const series = solveDC(circuit(volts, resistor('A', 'p', 'x', first), resistor('B', 'n', 'x', second)));
          const seriesCurrent = volts / (first + second);
          expect(series.potentials.x).toBeCloseTo(seriesCurrent * second, 10);
          expect(series.currents.A).toBeCloseTo(seriesCurrent, 10);
          expect(series.currents.B).toBeCloseTo(-seriesCurrent, 10);
          expect(series.sourceCurrent).toBeCloseTo(seriesCurrent, 10);

          const parallel = solveDC(circuit(volts, wire('lead', 'p', 'x'), resistor('A', 'x', 'n', first), resistor('B', 'p', 'n', second)));
          expect(parallel.currents.A).toBeCloseTo(volts / first, 10);
          expect(parallel.currents.B).toBeCloseTo(volts / second, 10);
          expect(parallel.sourceCurrent).toBeCloseTo(volts / first + volts / second, 10);
          expect(voltageAcross(parallel, 'p', 'x')).toBe(0);
        }
      }
    }
  });

  it('distinguishes an open branch, lamp bypass, supply short and floating equipotential', () => {
    const lamp = resistor('lamp', 'p', 'x', 2, 'lamp');
    const open = solveDC(circuit(12, lamp, resistor('return', 'n', 'y', 4),
      resistor('float', 'u', 'v', 3), wire('island', 'u', 'w'), wire('other-island', 'a', 'b')));
    expect(open.lit).toEqual([]);
    expect(open.sourceCurrent).toBe(0);
    expect(open.potentials.x).toBe(12);
    expect(open.potentials.y).toBe(0);
    expect(open.potentials.u).toBeNull();
    expect(open.currents.float).toBe(0);
    expect(voltageAcross(open, 'u', 'w')).toBe(0);
    expect(voltageAcross(open, 'v', 'w')).toBe(0);
    expect(voltageAcross(open, 'v', 'a')).toBeNull();
    expect(voltageAcross(open, 'constructor', 'toString')).toBeNull();

    const bypass = solveDC(circuit(12, lamp, wire('bypass', 'p', 'x'), resistor('__proto__', 'x', 'n', 4)));
    expect(bypass.status).toBe('ok');
    expect(bypass.lit).toEqual([]);
    expect(bypass.currents.lamp).toBe(0);
    expect(Object.hasOwn(bypass.currents, '__proto__')).toBe(true);
    expect(bypass.currents.__proto__).toBe(3);
    expect(bypass.sourceCurrent).toBe(3);

    const short = solveDC(circuit(12, lamp, wire('first', 'p', 'x'), wire('second', 'x', 'n')));
    expect(short.status).toBe('short');
    expect(short.sourceCurrent).toBeNull();
    expect(short.lit).toEqual([]);
  });

  it('matches independently solved balanced and unbalanced bridges', () => {
    const bridge = resistor('bridge', 'a', 'b', 4, 'lamp');
    const balanced = solveDC(circuit(12, resistor('A', 'p', 'a', 2), resistor('B', 'a', 'n', 3),
      resistor('C', 'p', 'b', 4), resistor('D', 'b', 'n', 6), bridge));
    expect(balanced.potentials.a).toBeCloseTo(7.2, 10);
    expect(balanced.potentials.b).toBeCloseTo(7.2, 10);
    expect(balanced.currents.bridge).toBeCloseTo(0, 10);
    expect(balanced.lit).toEqual([]);

    const unbalanced = solveDC(circuit(12, resistor('A', 'p', 'a', 2), resistor('B', 'a', 'n', 4),
      resistor('C', 'p', 'b', 4), resistor('D', 'b', 'n', 2), bridge));
    // The two nodal equations are 4a − b = 24 and 4b − a = 12.
    expect(unbalanced.potentials.a).toBeCloseTo(7.2, 10);
    expect(unbalanced.potentials.b).toBeCloseTo(4.8, 10);
    expect(unbalanced.currents.bridge).toBeCloseTo(0.6, 10);
    expect(unbalanced.sourceCurrent).toBeCloseTo(4.2, 10);
  });

  it('preserves charge when negative carriers move between unequally charged bodies', () => {
    const examples = [
      { initial: [2, 4], direction: 'a-to-b', count: 1, final: [3, 3], total: 6, comparison: 'equal-charge' },
      { initial: [0, -3], direction: 'b-to-a', count: 2, final: [-2, -1], total: -3, comparison: 'a-negative' },
      { initial: [-1, 1], direction: 'a-to-b', count: 3, final: [2, -2], total: 0, comparison: 'b-negative' },
    ] as const;
    for (const { initial, direction, count, final, total, comparison } of examples) {
      const task: ElectricityHarborTask = {
        kind: 'electricity-harbor',
        input: { kind: 'charging', initialA: initial[0], initialB: initial[1], electrons: count, direction },
        question: '', hint: '', choices: [],
      };
      const response: ElectricityHarborResponse = {
        kind: 'electricity-harbor', locked: true, observed: true, prediction: [comparison],
        moves: Array.from({ length: count }, () => direction),
        chargeA: final[0], chargeB: final[1], chargeTotal: total,
      };
      expect(harborOutcome(task, response)).toEqual({ a: final[0], b: final[1], total });
      expect(checkElectricityHarbor(task, response).ok).toBe(true);
      expect(checkElectricityHarbor(task, { ...response, chargeTotal: total + 1 }).ok).toBe(false);
      expect(checkElectricityHarbor(task, { ...response, moves: Array(count) }).ok).toBe(false);
    }
  });

  it('agrees with graph reachability for every distinct wiring of six terminals', () => {
    const task: ElectricityHarborTask = {
      kind: 'electricity-harbor',
      input: { kind: 'build', volts: 6, ohms: 3, device: 'lantern', switchClosed: true, assessRoles: false, prewired: [], layout: 'linear' },
      question: '', hint: '', choices: [],
    };
    type Link = readonly [string, string];
    const terminals = ['p', 'n', 'la', 'lb', 'sa', 'sb'];
    const possible: Link[] = terminals.flatMap((a, i) => terminals.slice(i + 1).map(b => [a, b] as const));
    const reachable = (start: string, edges: readonly Link[]) => {
      const seen = new Set([start]);
      for (const current of seen) {
        for (const [a, b] of edges) {
          if (a === current) seen.add(b);
          if (b === current) seen.add(a);
        }
      }
      return seen;
    };
    const suppliesLamp = (plus: Set<string>, minus: Set<string>) =>
      (plus.has('la') && minus.has('lb')) || (plus.has('lb') && minus.has('la'));
    let valid = 0;
    const mismatches: Link[][] = [];
    for (let mask = 0; mask < 2 ** possible.length; mask++) {
      const wires = possible.filter((_, i) => (mask & (1 << i)) !== 0);
      const closed: Link[] = [...wires, ['sa', 'sb']];
      const closedPlus = reachable('p', closed);
      const expected = !closedPlus.has('n')
        && suppliesLamp(closedPlus, reachable('n', closed))
        && !suppliesLamp(reachable('p', wires), reachable('n', wires));
      const actual = checkElectricityHarbor(task, {
        kind: 'electricity-harbor', locked: true, observed: true, prediction: ['lamp-on'], testedOpen: true, wires,
      }).ok;
      if (expected) valid++;
      if (actual !== expected) mismatches.push(wires);
    }
    expect(mismatches).toEqual([]);
    expect(valid).toBe(8);
  });
});
