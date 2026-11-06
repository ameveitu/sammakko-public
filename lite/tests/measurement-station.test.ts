import { describe, expect, it } from 'vitest';
import { measurementStationEvidence, measurementStationSpecs } from '../src/content/measurement-station';
import { checkMeasurementStation, liquidHeightFraction, solutionMeasurementStation, wrongMeasurementStationResponses,
  type MeasurementStationTask, type MeasurementStationResponse, type MeasureReading, type MeasureUnit } from '../src/content/models/measurement-station';
import { catalogNode } from '../src/engine/catalog';
import { rng } from '../src/engine/rng';

const kind = 'measurement-station' as const;
const base = { kind, object: 'Testi', context: { title: 'Testi', skills: ['M-MEAS-01'] } };
const check = (task: MeasurementStationTask, answer: MeasurementStationResponse) => checkMeasurementStation(task, answer).ok;
const read = (value: string | number, unit: MeasureUnit): MeasureReading => ({ value: String(value), unit });
const si: Readonly<Record<MeasureUnit, number>> = { mm: 1, cm: 10, m: 1000, g: 1, kg: 1000, ml: 1, dl: 100, l: 1000 };

function fixed(n: number, unit: MeasureUnit): MeasureReading {
  // Separate integer arithmetic formats every base-unit multiple without a floating-point division.
  const base = BigInt(n), denominator = BigInt(si[unit]);
  const whole = base / denominator;
  const remainder = (base % denominator).toString().padStart(String(si[unit]).length - 1, '0').replace(/0+$/, '');
  return read(remainder ? `${whole},${remainder}` : whole.toString(), unit);
}
function independentlySolve(task: MeasurementStationTask): MeasurementStationResponse {
  switch (task.mode) {
    case 'mass': return { kind, mode: task.mode, placed: true, basketPlaced: task.basket > 0, zeroed: task.basket > 0 ? 'basket' : 'empty', reading: fixed(task.grams, task.unit) };
    case 'liquid': return { kind, mode: task.mode, filled: task.target, eye: 'level', meniscus: 'bottom', reading: fixed(task.target, task.unit) };
    case 'estimate': return { kind, mode: task.mode, measured: true, estimate: read(task.rangeMm[1], 'mm'),
      reading: fixed(task.lengthMm, 'm'), comparison: task.rangeMm[1] > task.lengthMm ? 'larger' : 'same' };
    case 'tool': return { kind, mode: task.mode, ...(task.dimension === 'length' ? { tool: task.maximum <= 300 && task.resolution < 10 ? 'ruler' : 'tape', reason: 'distance' } as const
      : task.dimension === 'mass' ? { tool: task.maximum <= 1000 && task.resolution < 50 ? 'scale' : 'platform', reason: 'mass' } as const : { tool: 'jug', reason: 'capacity' } as const) };
    case 'unit': return { kind, mode: task.mode, reading: task.amount > 990 ? fixed(task.amount, 'm') : fixed(task.amount, 'cm') };
    case 'precision': {
      let nearest = 0;
      for (let v = 0; v <= task.end; v += task.step) if (Math.abs(v - task.actual) <= Math.abs(nearest - task.actual)) nearest = v;
      return { kind, mode: task.mode, step: fixed(task.step, task.unit), reading: fixed(nearest, task.unit), approximate: nearest !== task.actual };
    }
    case 'plausibility': {
      const value = Number(task.proposal.value.replace(',', '.')) * (task.proposal.unit ? si[task.proposal.unit] : 0);
      const matching = task.dimension === 'length' ? ['mm', 'cm', 'm'] : task.dimension === 'mass' ? ['g', 'kg'] : ['ml', 'dl', 'l'];
      const judgment = !task.proposal.unit || !matching.includes(task.proposal.unit) ? 'wrong-dimension' :
        value < task.expected[0] ? 'too-small' : value > task.expected[1] ? 'too-large' : 'fits';
      return { kind, mode: task.mode, judgment, reading: fixed(task.expected[1], task.dimension === 'length' ? 'm' : task.dimension === 'mass' ? 'kg' : 'l') };
    }
    case 'recheck': {
      const scale = Array.from({ length: task.segments }, (_, i) => task.origin + (i + 1) * task.segmentCm);
      const result = scale.at(-1)! - task.origin;
      const fault = task.oldRuler !== result ? 'origin' : task.oldSegments !== result ? 'gaps' : 'none';
      return { kind, mode: task.mode, tape: read(result, 'cm'), segmentCount: scale.length, fault, reading: read(result * 10, 'mm') };
    }
    case 'cube': {
      const unitCubeCm3 = 10n * 10n * 10n;
      const totalVolumeCm3 = BigInt(task.amount) * unitCubeCm3;
      return { kind, mode: task.mode, filled: task.amount, pouredDl: task.amount * 10, edge: read(10, 'cm'),
        litres: String(totalVolumeCm3 / 1000n), cubicDecimetres: String(totalVolumeCm3 / unitCubeCm3) };
    }
  }
}

describe('river-valley measurement station', () => {
  it('authors nine canonical nodes, two stable independent families and independent transfer oracles', () => {
    expect(measurementStationSpecs.map(node => node.id)).toEqual(
      ['M-MEAS-07', 'M-MEAS-10', 'M-MEAS-11', 'M-MEAS-12', 'M-MEAS-13', 'M-MEAS-14', 'M-MEAS-15', 'M-MEAS-16', 'M-UNIT-06']);
    for (const node of measurementStationSpecs) {
      const families = new Set<string>();
      const revision = node.rev;
      if (!revision) throw new Error('Missing measurement revision');
      expect(node.validRevs).toEqual(revision.endsWith('-v2') ? [revision.replace(/-v2$/, '-v1'), revision] : [revision]);
      for (const phase of ['guided', 'independent', 'transfer', 'retrieval'] as const) for (let seed = 0; seed < 32; seed++) {
        const { task, tag } = node.item(rng(seed), phase);
        if (phase === 'independent') families.add(tag);
        expect(tag === 'transfer').toBe(phase === 'transfer');
        expect(task).toEqual(node.item(rng(seed), phase).task);
        expect(task.context.skills.length).toBeGreaterThan(0);
        expect(task.context.skills.every(skill => catalogNode(skill))).toBe(true);
        expect(check(task, independentlySolve(task)), `${node.id} ${phase} ${seed}`).toBe(true);
        expect(check(task, solutionMeasurementStation(task))).toBe(true);
        for (const wrong of wrongMeasurementStationResponses(task)) expect(check(task, wrong)).toBe(false);
      }
      expect(families).toEqual(new Set(measurementStationEvidence[node.id]!.families));
      expect(families.size).toBe(2);
    }
  });

  it('provides at least eight materially different independent choices and quantities after the three assessment revisions', () => {
    for (const id of ['M-MEAS-12', 'M-MEAS-15', 'M-UNIT-06']) {
      const spec = measurementStationSpecs.find(node => node.id === id)!;
      const seen = new Set<string>();
      const tools = new Set<string>();
      for (let seed = 0; seed < 160; seed++) {
        const { task } = spec.item(rng(seed), 'independent');
        if (task.mode === 'tool') {
          seen.add(JSON.stringify([task.dimension, task.maximum, task.resolution]));
          const response = independentlySolve(task);
          if (response.mode === 'tool' && response.tool) tools.add(response.tool);
        } else if (task.mode === 'plausibility') seen.add(JSON.stringify([task.expected, task.proposal]));
        else if (task.mode === 'cube') seen.add(JSON.stringify([task.amount, task.direction, task.portionDl]));
      }
      expect(spec.rev).toMatch(/-v2$/);
      expect(seen.size, id).toBeGreaterThanOrEqual(8);
      if (id === 'M-MEAS-12') expect(tools).toEqual(new Set(['ruler', 'tape', 'scale', 'platform']));
    }
  });

  it('excludes scale offset and container mass, and reads equivalent decimal text exactly', () => {
    const task: MeasurementStationTask = { ...base, mode: 'mass', grams: 650, offset: 50, basket: 80, unit: 'kg', display: 'beam' };
    const answer = { kind, mode: 'mass', placed: true, basketPlaced: true, zeroed: 'basket', reading: read('0.6500', 'kg') } as const;
    expect(check(task, answer)).toBe(true);
    expect(check(task, { ...answer, zeroed: 'empty' })).toBe(false);
    expect(check(task, { ...answer, basketPlaced: false })).toBe(false);
    for (const raw of [0.7, 0.73, 0.78, '0.64999999', '6.5e-1', '0,65x']) {
      expect(check(task, { ...answer, reading: read(raw, 'kg') })).toBe(false);
    }
  });

  it('calibrates volume to height in two vessel shapes and rejects correct-looking answers from the wrong viewpoint', () => {
    for (const shape of ['cylinder', 'flared'] as const) for (let volume = 0; volume <= 1200; volume += 100) {
      const height = liquidHeightFraction(shape, volume, 1200);
      const measured = shape === 'cylinder' ? height : (54 + (54 + 58 * height)) * height / (54 + 112);
      expect(measured * 1200).toBeCloseTo(volume, 10);
    }
    const task: MeasurementStationTask = { ...base, mode: 'liquid', target: 600, initial: 1000, capacity: 1200, portion: 200, step: 200, unit: 'l', shape: 'flared' };
    const answer = { kind, mode: 'liquid', filled: 600, eye: 'level', meniscus: 'bottom', reading: read('0,60', 'l') } as const;
    expect(check(task, answer)).toBe(true);
    expect(check(task, { ...answer, eye: 'below' })).toBe(false);
    expect(check(task, { ...answer, meniscus: 'edge' })).toBe(false);
    expect(check(task, { ...answer, filled: 800 })).toBe(false);
    expect(check(task, { ...answer, reading: read('6', 'l') })).toBe(false);
  });

  it('accepts an estimate at either exact bound after lock and checks the comparison in consistent units', () => {
    const task: MeasurementStationTask = { ...base, mode: 'estimate', reference: 'puupala', referenceMm: 100, lengthMm: 300, rangeMm: [240, 360] };
    const answer = { kind, mode: 'estimate', measured: true, estimate: read('0,24', 'm'), reading: read(30, 'cm'), comparison: 'smaller' } as const;
    expect(check(task, answer)).toBe(true);
    expect(check(task, { ...answer, estimate: read('0.23999999', 'm') })).toBe(false);
    expect(check(task, { ...answer, estimate: read('0.36000001', 'm'), comparison: 'larger' })).toBe(false);
    expect(check(task, { ...answer, estimate: read('0,36', 'm'), comparison: 'larger' })).toBe(true);
    expect(check(task, { ...answer, estimate: read('0,36', 'm') })).toBe(false);
    expect(check(task, { ...answer, measured: false })).toBe(false);
  });

  it('separates practical unit choice from mere dimensional equivalence, and accepts all compact alternatives', () => {
    const task: MeasurementStationTask = { ...base, mode: 'unit', source: read('0,09', 'm'), amount: 90, dimension: 'length', allowedUnits: ['mm', 'cm', 'm', 'g'] };
    expect(check(task, { kind, mode: 'unit', reading: read(9, 'cm') })).toBe(true);
    expect(check(task, { kind, mode: 'unit', reading: read(90, 'mm') })).toBe(true);
    expect(check(task, { kind, mode: 'unit', reading: read('0,09', 'm') })).toBe(false);
    expect(check(task, { kind, mode: 'unit', reading: read(90, 'g') })).toBe(false);
  });

  it('distinguishes exact ticks and interval estimates, including the stated upward midpoint tie', () => {
    const task: MeasurementStationTask = { ...base, mode: 'precision', unit: 'cm', step: 20, actual: 50, end: 120 };
    const answer = { kind, mode: 'precision', step: read('2', 'cm'), reading: read('6', 'cm'), approximate: true } as const;
    expect(check(task, answer)).toBe(true);
    expect(check(task, { ...answer, reading: read(4, 'cm') })).toBe(false);
    expect(check(task, { ...answer, reading: read(5, 'cm') })).toBe(false);
    expect(check(task, { ...answer, reading: read('6.0', 'cm') })).toBe(false);
    expect(check({ ...task, actual: 60 }, { ...answer, approximate: false })).toBe(true);
    expect(check({ ...task, step: 5, actual: 55 }, { ...answer, step: read('0,5', 'cm'), reading: read('5,5', 'cm'), approximate: false })).toBe(true);
  });

  it('judges proposed dimensions before magnitudes and permits multiple plausible repairs', () => {
    const task: MeasurementStationTask = { ...base, mode: 'plausibility', dimension: 'mass', expected: [400, 800], reference: 'Kori',
      proposal: read(600, 'ml') };
    const response = { kind, mode: 'plausibility', judgment: 'wrong-dimension', reading: read('0,4', 'kg') } as const;
    expect(check(task, response)).toBe(true);
    expect(check(task, { ...response, reading: read('800', 'g') })).toBe(true);
    expect(check(task, { ...response, reading: read('0.80000001', 'kg') })).toBe(false);
    expect(check(task, { ...response, judgment: 'fits' })).toBe(false);
    expect(check(task, { ...response, reading: read(600, 'ml') })).toBe(false);
  });

  it('requires the independently collected data even when the old measurements agree', () => {
    const task: MeasurementStationTask = { ...base, mode: 'recheck', segments: 4, segmentCm: 5, origin: 7, oldRuler: 20, oldSegments: 20, fault: 'none' };
    const answer = { kind, mode: 'recheck', tape: read(20, 'cm'), segmentCount: 4, fault: 'none', reading: read(20, 'cm') } as const;
    expect(check(task, answer)).toBe(true);
    expect(check(task, { ...answer, tape: null })).toBe(false);
    expect(check(task, { ...answer, tape: read(27, 'cm') })).toBe(false);
    expect(check(task, { ...answer, segmentCount: 20 })).toBe(false);
    expect(check(task, { ...answer, fault: 'origin' })).toBe(false);
  });

  it('separates the 10 cm length from the 1 dm³ volume and conserves the number of litre portions', () => {
    const task: MeasurementStationTask = { ...base, mode: 'cube', amount: 3, direction: 'from-cubes', portionDl: 5 };
    const answer = { kind, mode: 'cube', filled: 3, pouredDl: 30, edge: read('10', 'cm'), litres: '3', cubicDecimetres: '3' } as const;
    expect(check(task, answer)).toBe(true);
    expect(check(task, { ...answer, edge: read(1, 'cm') })).toBe(false);
    expect(check(task, { ...answer, litres: '30' })).toBe(false);
    expect(check(task, { ...answer, filled: 1 })).toBe(false);
    expect(check(task, { ...answer, pouredDl: 25 })).toBe(false);
  });
});
