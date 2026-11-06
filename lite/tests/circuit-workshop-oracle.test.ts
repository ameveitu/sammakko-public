import { describe, expect, it } from 'vitest';
import { circuitWorkshopSpecs } from '../src/content/circuit-workshop';
import { checkCircuitWorkshop, circuitWorkshopScene, expectedValues, networkCircuit, networkObservation,
  type CircuitWorkshopInput, type CircuitWorkshopResponse, type CircuitWorkshopTask } from '../src/content/models/circuit-workshop';
import { rng } from '../src/engine/rng';

type Q = readonly [bigint, bigint];
type Network = Extract<CircuitWorkshopInput, { kind: 'network' }>;
const zero: Q = [0n, 1n];
const add = ([a, b]: Q, [c, d]: Q): Q => [a * d + c * b, b * d];
const roundedHundredths = ([a, b]: Q) => Number((200n * a + b) / (2n * b));
const cents = (n: number) => Math.round(n * 100);
const base = { kind: 'circuit-workshop', locked: true, changeApplied: true, observed: true } as const;

function networkOracle(input: Network, changed: boolean) {
  const circuit = networkCircuit(input, changed);
  const count = input.resistances.length, volts = BigInt(input.volts);
  const resistances = Array.from({ length: count }, (_, i) => circuit.edges.find(e => e.id === `r${i}`)?.ohms);
  const connected = resistances.every(r => r !== undefined);
  const totalR = BigInt(resistances.reduce<number>((sum, r) => sum + (r ?? 0), 0));
  const currents = resistances.map((r): Q =>
    r === undefined || input.topology === 'series' && !connected ? zero
      : [volts, input.topology === 'series' ? totalR : BigInt(r)]);
  const total = input.topology === 'parallel' ? currents.reduce(add, zero) : currents[0]!;
  const voltage = resistances.map(r => r === undefined ? null : input.topology === 'parallel' ? [volts, 1n] as const
    : connected ? [volts * BigInt(r), totalR] as const : zero);
  return { currents: currents.map(roundedHundredths), voltage: voltage.map(v => v === null ? null : roundedHundredths(v)),
    total: roundedHundredths(total), resistances };
}
const tasks = function* (phases = ['independent', 'guided', 'transfer'] as const, seeds = 64) {
  for (const spec of circuitWorkshopSpecs) for (const phase of phases) for (let i = 0; i < seeds; i++) {
    const task = spec.item(rng(i), phase).task;
    if (task.kind !== 'circuit-workshop') throw new Error('Unexpected kind');
    yield { spec, task, phase };
  }
};
function predictions(input: Network) {
  const before = networkOracle(input, false), after = networkOracle(input, true);
  switch (input.goal) {
    case 'parallel-current':
      return { total: after.total / 100, branch: after.currents[0]! / 100 };
    case 'parallel-voltage':
      return { uA: input.volts, uB: input.volts };
    case 'series-current':
      return { before: after.total / 100, between: after.total / 100, after: after.total / 100 };
    case 'series-voltage':
      return { uA: after.voltage[0]! / 100, uB: after.voltage[1]! / 100,
        ...(after.voltage.length === 3 ? { uC: after.voltage[2]! / 100 } : {}), total: input.volts };
    case 'series-integrated':
      return { current: before.total / 100, uA: after.voltage[0]! / 100, uB: after.voltage[1]! / 100 };
  }
}
function shape(task: CircuitWorkshopTask, given: Record<string, number | undefined>) {
  const values: Record<string, number> = {};
  for (const field of task.fields) {
    const value = given[field.id];
    if (value === undefined) throw new Error(`No oracle value for ${task.input.kind}.${field.id}`);
    values[field.id] = value;
  }
  return values;
}
describe('Circuit workshop independent arithmetic and evidence audit', () => {
  it('validates ideal Kirchhoff relationships and qualitative predictions from rounded givens in every generated circuit', () => {
    let count = 0;
    for (const { task } of tasks()) {
      const input = task.input;
      if (input.kind !== 'network') continue;
      for (const changed of [false, true]) {
        const circuit = networkCircuit(input, changed), model = networkObservation(input, changed), ideal = networkOracle(input, changed);
        expect(model.branches.map(cents)).toEqual(ideal.currents);
        expect(model.voltages.map(v => v === null ? null : cents(v))).toEqual(ideal.voltage);
        expect(cents(model.sourceCurrent)).toBe(ideal.total);
        const position = circuit.edges.map(e => +e.id.slice(1));
        const remaining = input.resistances.map((_, i) => i).filter(i => !changed || input.change !== 'remove' || i !== input.removeIndex);
        expect(position).toEqual(remaining);
        const order = changed && input.order === 'reversed' ? [...input.resistances].reverse() : input.resistances;
        expect(circuit.edges.map(e => e.ohms)).toEqual(remaining.map(i => order[i]));
        if (input.topology === 'parallel') {
          expect(ideal.currents.reduce((a, b) => a + b, 0)).toBe(ideal.total);
          for (const e of circuit.edges) expect([e.a, e.b]).toEqual(['p', 'n']);
        } else {
          expect(new Set(ideal.currents).size).toBe(1);
          if (remaining.length === input.resistances.length) expect(ideal.voltage.reduce<number>((a, b) => a + (b ?? 0), 0)).toBe(input.volts * 100);
          for (const [i, e] of circuit.edges.entries()) {
            const pos = position[i]!;
            expect([e.a, e.b]).toEqual([pos === 0 ? 'p' : `n${pos}`, pos === input.resistances.length - 1 ? 'n' : `n${pos + 1}`]);
          }
        }
      }
      const scene = circuitWorkshopScene(task), before = networkOracle(input, false), after = networkOracle(input, true);
      expect(scene.outcome).toBeUndefined();
      expect(circuitWorkshopScene(task, { ...base, observed: false, values: {} }).outcome).toBeUndefined();
      expect(cents(scene.given.initialCurrent as number)).toBe(before.total);
      if (input.goal === 'parallel-current') {
        const shown = (scene.given.initialBranches as number[]).map(cents);
        expect(after.total).toBe(shown.reduce((a, b, i) => a + (i === input.removeIndex ? 0 : b), 0));
        expect(after.currents[0]).toBe(input.removeIndex === 0 ? 0 : shown[0]);
      }
      if (input.goal === 'series-current') expect(after.total).toBe(input.change === 'remove' ? 0 : before.total);
      if (input.goal === 'series-voltage' || input.goal === 'series-integrated') {
        const a = cents(scene.given.initialFirstVoltage as number);
        const b = scene.given.initialSecondVoltage === undefined ? undefined : cents(scene.given.initialSecondVoltage as number);
        expect(a).toBe(before.voltage[0]);
        const missingIndex = b === undefined ? 1 : 2;
        expect(before.voltage[missingIndex]).toBe(input.volts * 100 - a - (b ?? 0));
      }
      const response: CircuitWorkshopResponse = { ...base, values: shape(task, predictions(input)),
        ...(input.goal === 'parallel-voltage' ? { nodePair: ['n', 'p'] } : {}) };
      if (task.review) {
        expect(checkCircuitWorkshop(task, response).pendingReview).toBe(true);
        const observations = Object.fromEntries(task.review.criteria.map(c => [c.id, 'met' as const]));
        const completed = { ...response, confirmedByAdult: true, assistance: 'helped', observations } as const;
        expect(checkCircuitWorkshop(task, completed)).toEqual({ ok: true, observedByAdult: true, assisted: true });
        expect(checkCircuitWorkshop(task, { ...completed, values: {} })).toMatchObject({ ok: false, observedByAdult: true, assisted: true });
        expect(checkCircuitWorkshop(task, { ...response, values: {} }).pendingReview).toBe(true);
        expect(checkCircuitWorkshop(task, { ...response, confirmedByAdult: true, assistance: 'none',
          observations: { ...observations, [task.review.criteria[0]!.id]: 'not-yet' } }))
          .toMatchObject({ ok: false, observedByAdult: true });
      } else expect(checkCircuitWorkshop(task, response).ok).toBe(true);
      const first = task.fields[0]!.id;
      expect(checkCircuitWorkshop(task, { ...response, values: { ...response.values, [first]: response.values[first]! + .01 } }).ok).toBe(false);
      count++;
    }
    expect(count).toBe(960);
  });

  it('validates power as J/s or U×I and usage time independently of wattage', () => {
    let count = 0;
    const powerSources = new Set<string>(), energyOrder = new Set<number>();
    for (const { task } of tasks()) {
      const input = task.input;
      if (input.kind !== 'power' && input.kind !== 'energy') continue;
      if (input.kind === 'power') {
        const a = input.mode === 'energy' ? input.energyJ / input.durationS : input.volts * input.amps;
        const b = input.comparison ? input.comparison.volts * input.comparison.amps : undefined;
        const response: CircuitWorkshopResponse = { ...base, values: shape(task, { power: a, otherPower: b, more: a === b ? 0 : a > (b ?? 0) ? 1 : 2 }) };
        expect(checkCircuitWorkshop(task, response).ok).toBe(true);
        expect(checkCircuitWorkshop(task, { ...response, values: { ...response.values, power: a * input.durationS } }).ok).toBe(false);
        const given = circuitWorkshopScene(task).given;
        powerSources.add(input.mode);
        if (input.mode === 'energy') {
          expect(given).toMatchObject({ energyJ: input.energyJ, durationS: input.durationS });
          expect(given).not.toHaveProperty('volts');
          expect(given).not.toHaveProperty('amps');
        } else {
          expect(given).not.toHaveProperty('energyJ');
          expect(given).not.toHaveProperty('durationS');
        }
      } else {
        // Derive watt-hours from joules over an hour, then convert the same energy to kWh.
        const a = (3600 * input.watts * input.hours) / 3600;
        const b = input.comparison ? (3600 * input.comparison.watts * input.comparison.hours) / 3600 : undefined;
        if (b !== undefined) energyOrder.add(Math.sign(a - b));
        const response: CircuitWorkshopResponse = { ...base, values: shape(task, {
          energyWh: a, energyKWh: a / 1000, otherWh: b, otherKWh: b === undefined ? undefined : b / 1000,
          more: a === b ? 0 : a > (b ?? 0) ? 1 : 2 }) };
        expect(checkCircuitWorkshop(task, response).ok).toBe(true);
        expect(checkCircuitWorkshop(task, { ...response, values: { ...response.values, energyKWh: a } }).ok).toBe(false);
      }
      count++;
    }
    expect(count).toBe(384);
    expect([...powerSources].sort()).toEqual(['energy', 'ui']);
    expect([...energyOrder].sort()).toEqual([-1, 0, 1]);
  });

  it('checks measured pairs, three nonlinear ratios and comparisons on both sides of equality', () => {
    const comparison = (a: number, b: number) => a === b ? 0 : a > b ? 1 : 2;
    const plotOrder = new Set<number>(), resistanceOrder = new Set<number>();
    let count = 0;
    for (const { task } of tasks()) {
      const input = task.input;
      if (input.kind !== 'data') continue;
      const quotient = ({ u, i }: { u: number; i: number }) => roundedHundredths([BigInt(cents(u)), BigInt(cents(i))]) / 100;
      let response: CircuitWorkshopResponse;
      if (input.task === 'plot') {
        const pointOrder = input.comparison.length ? comparison(input.rows[0]!.i, input.comparison[0]!.i) : undefined;
        if (pointOrder !== undefined) plotOrder.add(pointOrder);
        const points = [...input.rows].reverse().map(({ u, i }) => [u, i] as const);
        response = { ...base, values: shape(task, { comparison: pointOrder }), points };
        expect(checkCircuitWorkshop(task, { ...response, points: points.map(([u, i]) => [i, u]) }).ok)
          .toBe(points.every(([u, i]) => points.some(([x, y]) => x === i && y === u)));
      } else if (input.task === 'nonlinear') {
        const ratios = input.rows.map(quotient);
        expect(new Set(ratios).size).toBeGreaterThan(1);
        response = { ...base, values: shape(task, { ratio1: ratios[0], ratio2: ratios[1], ratio3: ratios[2], constant: 0 }) };
        expect(checkCircuitWorkshop(task, { ...response, values: { constant: 0 } }).ok).toBe(false);
        expect(checkCircuitWorkshop(task, { ...response, values: { ...response.values, constant: 1 } }).ok).toBe(false);
      } else {
        const resistance = quotient(input.rows[input.targetRow]!);
        const greaterResistance = input.task === 'compare' ? comparison(resistance, quotient(input.comparison[0]!)) : undefined;
        if (greaterResistance !== undefined) resistanceOrder.add(greaterResistance);
        response = { ...base, values: shape(task, { resistance, greaterResistance }) };
        expect(checkCircuitWorkshop(task, { ...response, values: { ...response.values, resistance: 1 / resistance } }).ok).toBe(false);
      }
      expect(checkCircuitWorkshop(task, response).ok).toBe(true);
      count++;
    }
    expect(count).toBe(384);
    expect([...plotOrder].sort()).toEqual([0, 1, 2]);
    expect([...resistanceOrder].sort()).toEqual([0, 1, 2]);
  });

  it('derives the unknown from the shown quantities and compares it against a separate observation', () => {
    const unknowns = new Set<string>();
    let count = 0;
    for (const { task } of tasks()) {
      const input = task.input;
      if (input.kind !== 'ohm') continue;
      unknowns.add(input.unknown);
      const derived = input.unknown === 'u' ? [input.i * input.r, 1]
        : input.unknown === 'i' ? [input.u, input.r] : [input.u, input.i];
      const [n, d] = derived.map(BigInt);
      const answer = roundedHundredths([n!, d!]) / 100;
      const checkVoltage = roundedHundredths([BigInt(input.measured.u * input.verifyCurrent), BigInt(input.measured.i)]) / 100;
      const response: CircuitWorkshopResponse = { ...base, values: shape(task, { answer, checkVoltage }), checkedComparison: 'matches' };
      const before = circuitWorkshopScene(task);
      expect(before.given).not.toHaveProperty(input.unknown);
      expect(before.given).not.toHaveProperty('verificationMeasuredVoltage');
      expect(before.outcome).toBeUndefined();
      expect(circuitWorkshopScene(task, { ...response, observed: false }).outcome).toBeUndefined();
      expect(circuitWorkshopScene(task, response).outcome).toMatchObject({ verificationMeasuredVoltage: checkVoltage });
      expect(checkCircuitWorkshop(task, response).ok).toBe(true);
      expect(checkCircuitWorkshop(task, { ...response, checkedComparison: undefined }).ok).toBe(false);
      const mismatchedMeasurement: CircuitWorkshopTask = { ...task, input: { ...input, [input.unknown]: 0, verificationMeasuredVoltage: checkVoltage + 1 } };
      expect(checkCircuitWorkshop(mismatchedMeasurement, response).ok).toBe(false);
      expect(checkCircuitWorkshop(mismatchedMeasurement, { ...response, checkedComparison: 'differs' }).ok).toBe(true);
      expect(() => expectedValues({ ...input, measured: { ...input.measured, i: 0 } })).toThrow();
      count++;
    }
    expect(count).toBe(192);
    expect([...unknowns].sort()).toEqual(['i', 'r', 'u']);
  });
});
