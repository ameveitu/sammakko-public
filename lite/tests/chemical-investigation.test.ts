import { describe, expect, it } from 'vitest';
// @ts-expect-error Runtime Three.js contract is exercised without optional declaration packages.
import * as THREE from 'three';
import { rng } from '../src/engine/rng';
import { itemIdentity } from '../src/engine/item-identity';
import { chemicalInvestigationSpecs, chemicalInvestigationEvidence } from '../src/content/chemical-investigation';
import { applyInvestigationInstrument, initialInvestigationInstrument, checkChemicalInvestigation, replayInvestigationInstrument,
  solutionChemicalInvestigation, wrongChemicalInvestigationResponses, investigationResult,
  type ChemicalInvestigationTask, type ChemicalInvestigationResponse, type InvestigationAction, type InvestigationObservation } from '../src/content/models/chemical-investigation';
import { chemicalInvestigationScene } from '../src/content/models/chemical-investigation-scene';
// @ts-expect-error Authored JS stage has a runtime lifecycle checked below.
import { mountChemicalInvestigationStage } from '../src/world/chemical-investigation-stage.js';
const kind = 'chemical-investigation' as const;
const reading = (base: number, unit: 'mg' | 'g' | 'ul' | 'ml') => ({ value: `${base}/${unit === 'g' || unit === 'ml' ? 1000 : 1}`, unit });
const adult = (task: ChemicalInvestigationTask, assistance: InvestigationObservation['assistance'] = 'none'): InvestigationObservation => ({ channel: 'spoken', observations: Object.fromEntries(('review' in task ? task.review.rubric : []).map(c => [c.id, 'met'])), confirmedByAdult: true, assistance });
function action(task: ChemicalInvestigationTask, id: string, type: InvestigationAction['type'], extra: Partial<InvestigationAction> = {}): InvestigationAction {
  return { run: task.run, id, type, ...extra };
}
/** Independent physical arithmetic. The production solution supplies no expected values. */
function oracle(task: ChemicalInvestigationTask): ChemicalInvestigationResponse {
  if (task.mode === 'tool') {
    const device = task.instruments.filter(t => t.quantity === 'volume' && t.transferable && t.division <= task.requiredDivisionUl && t.capacity >= task.requestedUl && task.requestedUl % t.division === 0).at(-1)!;
    return { kind, mode: 'tool', actions: [action(task, 'choice', 'select', { instrument: device.id }), action(task, 'take', 'aspirate', { amountUl: task.requestedUl }), action(task, 'give', 'dispense', { amountUl: task.requestedUl })], reading: reading(task.requestedUl, task.unit) };
  }
  if (task.mode === 'measure') {
    const device = task.instruments.find(t => t.quantity === task.quantity && t.capacity >= task.amount + (task.quantity === 'mass' ? task.containerMg : 0) && t.division <= task.requiredDivision)!;
    const stages: InvestigationAction['type'][] = task.quantity === 'mass' ? ['empty-container', 'tare', 'load-sample', 'read'] : ['load-sample', 'eye-level', 'read'];
    return { kind, mode: 'measure', actions: [action(task, 'choice', 'select', { instrument: device.id }), ...stages.map((type, i) => action(task, `step${i}`, type))],
      reading: reading(task.amount, task.unit), meniscus: task.quantity === 'mass' ? null : 'bottom' };
  }
  if (task.mode === 'observe') return { kind, mode: 'observe', categories: Object.fromEntries(task.cards.map(c => [c.id, c.category])), extraEvidence: task.evidenceNeeded.at(-1)! };
  if (task.mode === 'design') return { kind, mode: 'design', variable: task.variable, response: task.response, controls: task.controls.filter(c => c.required).map(c => c.id).reverse(), repetitions: 4, safeProtocol: true, review: adult(task) };
  if (task.mode === 'data') {
    const raw = (row: typeof task.rows[number]) => row.missing ? null : BigInt(row.doseMg) < BigInt(row.capacityMg) ? row.doseMg : row.capacityMg;
    const factor = task.unit === 'g' ? 1000 : 1;
    const topMg = Math.max(1000, ...task.rows.map(s => raw(s) ?? 0)) + 1000;
    const chartType = task.numericX ? 'line' as const : 'bar' as const;
    const row = task.rows.find(s => raw(s) !== null)!;
    return { kind, mode: 'data', actions: task.publicResults ? [] : task.rows.map(s => action(task, `own-run-${s.id}`, 'run', { sample: s.id })),
      table: [...task.rows].reverse().map(s => ({ rowId: s.id, sourceId: s.sourceId, condition: s.condition, reading: raw(s) === null ? null : reading(raw(s)!, task.unit) })),
      chart: { type: chartType, xLabel: task.xKind, yLabel: 'dissolved-mass', unit: task.unit, start: '0', top: `${Math.ceil(topMg / 500) * 500}/${factor}`, step: `500/${factor}`,
        values: Object.fromEntries(task.rows.map(s => [s.id, raw(s) === null ? null : `${raw(s)}/${factor}`])) }, sourceLink: { rowId: row.id, sourceId: row.sourceId } };
  }
  const repairs = { none: 'keep-method', label: 'repeat-labelled', temperature: 'control-temperature', missing: 'recover-or-repeat', overlap: 'more-precise' } as const;
  return { kind, mode: 'conclude', citedRows: task.rows.slice(0, 2).map(s => s.id).reverse(), difference: String(BigInt(task.rows[1]!.massMg) - BigInt(task.rows[0]!.massMg)),
    confidence: task.issue === 'none' ? 'supports' : 'inconclusive', issueRows: [...task.issueRows], repair: repairs[task.issue], review: adult(task) };
}

describe('ChemicalInvestigation11 domain', () => {
  it('has exact eleven IDs, genuine family tags, transfer, stable givens and sufficient real variation', () => {
    expect(chemicalInvestigationSpecs.map(s => s.id).sort()).toEqual(['CHEM79-LAB-01', 'CHEM79-MEAS-01', 'CHEM79-OBS-01', 'CHEM79-QUESTION-01', 'CHEM79-PLAN-01', 'CHEM79-DATA-COLLECT', 'CHEM79-DATA-PRESENT', 'CHEM79-DATA-01', 'CHEM79-CONCLUSION', 'CHEM79-INVESTIGATION-EVAL', 'CHEM79-CONCL-01'].sort());
    for (const spec of chemicalInvestigationSpecs) {
      const values = new Set<string>(), tags = new Set<string>();
      for (let seed = 0; seed < 160; seed++) {
        const item = spec.item(rng(seed), 'independent'); tags.add(item.tag);
        const { run: _run, title: _title, ...givens } = item.task; values.add(JSON.stringify(givens));
        expect(itemIdentity(item as never)).toBe(itemIdentity(spec.item(rng(seed), 'independent') as never));
      }
      expect(values.size, spec.id).toBeGreaterThanOrEqual(8); expect(tags.size).toBe(2); expect(chemicalInvestigationEvidence[spec.id]!.families).toHaveLength(2);
      expect(spec.item(rng(1), 'transfer').tag).toBe('transfer'); expect(spec.validRevs).toContain(spec.rev);
    }
  });
  it('the same scientific instrument situation has the same run and item identity across seed calls', () => {
    let duplicates = 0;
    for (const id of ['CHEM79-LAB-01', 'CHEM79-MEAS-01']) {
      const spec = chemicalInvestigationSpecs.find(s => s.id === id)!;
      const seen = new Map<string, { run: string; key: string }>();
      for (let seed = 0; seed < 256; seed++) {
        const item = spec.item(rng(seed), 'independent'), task = item.task;
        if (task.mode !== 'tool' && task.mode !== 'measure') throw Error('Instrument');
        const { run, instruments, ...physical } = task;
        const normalized = { ...physical, instruments: [...instruments].sort((a, b) => a.id.localeCompare(b.id)) };
        const signature = JSON.stringify(normalized), previous = seen.get(signature);
        const key = itemIdentity(item as never);
        if (previous) { expect(run).toBe(previous.run); expect(key).toBe(previous.key); duplicates++; }
        seen.set(signature, { run, key });
      }
      expect(seen.size).toBeGreaterThanOrEqual(8);
    }
    expect(duplicates).toBeGreaterThan(0);
  });
  it('independent oracle accepts 1408 authored/transfer procedures and rejects the specific wrong models', () => {
    for (const spec of chemicalInvestigationSpecs) for (const phase of ['independent', 'transfer'] as const) for (let seed = 0; seed < 64; seed++) {
      const task = spec.item(rng(seed), phase).task, correct = oracle(task);
      expect(checkChemicalInvestigation(task, correct), `${spec.id}/${seed}/${phase}`).toMatchObject({ ok: true });
      for (const wrong of wrongChemicalInvestigationResponses(task)) {
        const review = 'review' in task ? adult(task) : undefined;
        expect(checkChemicalInvestigation(task, { ...wrong, ...(review ? { review } : {}) } as ChemicalInvestigationResponse).ok, `${spec.id}/${seed}`).toBe(false);
      }
    }
  });
  it('virtual transfer conserves integer microlitres, keeps retries idempotent and rejects a different run', () => {
    const task = chemicalInvestigationSpecs.find(s => s.id === 'CHEM79-LAB-01')!.item(rng(4), 'independent').task;
    if (task.mode !== 'tool') throw Error('Tool');
    const answer = oracle(task); if (answer.mode !== 'tool') throw Error('Tool answer');
    let state = initialInvestigationInstrument(task);
    for (const step of answer.actions) {
      state = applyInvestigationInstrument(task, state, step);
      expect(BigInt(state.sourceUl) + BigInt(state.heldUl) + BigInt(state.receiverUl)).toBe(BigInt(task.sourceUl));
      expect(applyInvestigationInstrument(task, state, step)).toBe(state);
    }
    expect(state.receiverUl).toBe(task.requestedUl); expect(state.heldUl).toBe(0);
    expect(applyInvestigationInstrument(task, state, { ...answer.actions[0]!, id: 'other', run: 'another' })).toBe(state);
    expect(initialInvestigationInstrument(task).operations).toEqual([]);
    let held = replayInvestigationInstrument(task, answer.actions.slice(0, 2));
    const other = task.instruments.find(t => t.id !== held.instrument)!;
    expect(applyInvestigationInstrument(task, held, action(task, 'switch', 'select', { instrument: other.id }))).toBe(held);
    held = applyInvestigationInstrument(task, held, action(task, 'negative', 'dispense', { amountUl: -1 })); expect(held.heldUl).toBe(task.requestedUl);
  });
  it('own production needs every explicit adult observation; reveal never supplies one and helped stays guided', () => {
    for (const spec of chemicalInvestigationSpecs) {
      const task = spec.item(rng(2), 'independent').task; if (!('review' in task)) continue;
      expect(checkChemicalInvestigation(task, solutionChemicalInvestigation(task))).toMatchObject({ pendingReview: true, ok: false });
      const correct = oracle(task), review = adult(task, 'helped');
      expect(checkChemicalInvestigation(task, { ...correct, review } as ChemicalInvestigationResponse)).toMatchObject({ ok: true, observedByAdult: true, assisted: true });
      const missing = { ...review, observations: {} };
      expect(checkChemicalInvestigation(task, { ...correct, review: missing } as ChemicalInvestigationResponse)).toMatchObject({ pendingReview: true });
      const notYet = { ...review, observations: { ...review.observations, [task.review.rubric[0]!.id]: 'not-yet' as const } };
      expect(checkChemicalInvestigation(task, { ...correct, review: notYet } as ChemicalInvestigationResponse)).toMatchObject({ ok: false, observedByAdult: true, assisted: true });
      const noHelp = { ...review } as Partial<InvestigationObservation>; delete noHelp.assistance;
      expect(checkChemicalInvestigation(task, { ...correct, review: noHelp } as ChemicalInvestigationResponse)).toMatchObject({ pendingReview: true });
      expect(checkChemicalInvestigation(task, { ...correct, review: { ...review, channel: 'written' } } as ChemicalInvestigationResponse).ok).toBe(true);
    }
  });
  it('a graph cannot replace collection and a pleasing graph cannot alter the original records', () => {
    for (const spec of chemicalInvestigationSpecs.filter(s => /DATA/.test(s.id))) {
      const task = spec.item(rng(2), 'transfer').task; if (task.mode !== 'data') throw Error('Data');
      const answer = oracle(task); if (answer.mode !== 'data') throw Error('Data answer');
      expect(task.rows.some(row => row.missing)).toBe(true);
      if (!task.publicResults) expect(checkChemicalInvestigation(task, { ...answer, actions: [] }).ok).toBe(false);
      const row = task.rows.find(s => !s.missing)!;
      expect(checkChemicalInvestigation(task, { ...answer, table: answer.table.map(s => s.rowId === row.id ? { ...s, reading: reading(investigationResult(row)! + 1, task.unit) } : s) }).ok).toBe(false);
      if (task.objective !== 'collect') {
        expect(checkChemicalInvestigation(task, { ...answer, chart: { ...answer.chart, values: { ...answer.chart.values, [row.id]: '999999' } } }).ok).toBe(false);
        expect(checkChemicalInvestigation(task, { ...answer, chart: { ...answer.chart, type: 'scatter' } }).ok).toBe(true);
      }
      if (task.objective === 'both') expect(checkChemicalInvestigation(task, { ...answer, sourceLink: { rowId: task.rows.find(s => s.missing)!.id, sourceId: task.rows.find(s => s.missing)!.sourceId } }).ok).toBe(false);
    }
  });
  it('accepts valid unit/representation alternatives while preserving zero and missing observations', () => {
    let zeroes = 0;
    for (const spec of chemicalInvestigationSpecs.filter(s => /DATA/.test(s.id))) for (let seed = 0; seed < 48; seed++) {
      const task = spec.item(rng(seed), 'independent').task; if (task.mode !== 'data') throw Error('Data');
      zeroes += task.rows.filter(row => !row.missing && row.capacityMg === 0).length;
      if (task.objective === 'collect') continue;
      const response = oracle(task); if (response.mode !== 'data') throw Error('Data response');
      const oldFactor = response.chart.unit === 'g' ? 1000n : 1n, newFactor = oldFactor === 1000n ? 1n : 1000n;
      const convert = (value: string) => { const [n, d = '1'] = value.split('/'); return `${BigInt(n!) * oldFactor}/${BigInt(d) * newFactor}`; };
      const chart = { ...response.chart, unit: oldFactor === 1000n ? 'mg' as const : 'g' as const, start: convert(response.chart.start), top: convert(response.chart.top), step: convert(response.chart.step),
        values: Object.fromEntries(Object.entries(response.chart.values).map(([id, value]) => [id, value === null ? null : convert(value)])) };
      expect(checkChemicalInvestigation(task, { ...response, chart })).toEqual({ ok: true });
      expect(checkChemicalInvestigation(task, { ...response, chart: { ...response.chart, type: 'bar', xLabel: 'sample' } })).toEqual({ ok: true });
      if (task.objective === 'present') expect(checkChemicalInvestigation(task, { ...response, chart: { ...response.chart, type: 'table', xLabel: 'sample' } })).toEqual({ ok: true });
    }
    expect(zeroes).toBeGreaterThan(0);
  });
  it('rejects inherited or accessor-only records and adult metadata without invoking getters', () => {
    const data = chemicalInvestigationSpecs.find(s => s.id === 'CHEM79-DATA-COLLECT')!.item(rng(1), 'independent').task;
    const answer = oracle(data);
    if (answer.mode !== 'data') throw Error('Data response');
    const inherited = answer.table.map(row => Object.assign(Object.create(row), { dummy: true }));
    expect(checkChemicalInvestigation(data, { ...answer, table: inherited }).ok).toBe(false);
    let reads = 0;
    const accessor = { ...answer.table[0]! };
    Object.defineProperty(accessor, 'rowId', { enumerable: true, get() { reads++; return answer.table[0]!.rowId; } });
    expect(checkChemicalInvestigation(data, { ...answer, table: [accessor, ...answer.table.slice(1)] }).ok).toBe(false);
    expect(reads).toBe(0);
    const inheritedReading = answer.table.map(row => row.reading ? { ...row, reading: Object.create(row.reading) } : row);
    expect(checkChemicalInvestigation(data, { ...answer, table: inheritedReading }).ok).toBe(false);
    for (const spec of chemicalInvestigationSpecs) {
      const task = spec.item(rng(3), 'independent').task;
      if (!('review' in task)) continue;
      const correct = oracle(task), review = adult(task);
      for (const invalid of [Object.create(review), { ...review, observations: Object.create(review.observations) }]) {
        expect(checkChemicalInvestigation(task, { ...correct, review: invalid } as ChemicalInvestigationResponse)).toMatchObject({ ok: false, pendingReview: true });
      }
      const accessorReview = { ...review };
      Object.defineProperty(accessorReview, 'confirmedByAdult', { enumerable: true, get() { reads++; return true; } });
      expect(checkChemicalInvestigation(task, { ...correct, review: accessorReview } as ChemicalInvestigationResponse)).toMatchObject({ pendingReview: true });
      const serialized = JSON.parse(JSON.stringify(correct));
      expect(checkChemicalInvestigation(task, serialized).ok).toBe(true);
    }
    expect(reads).toBe(0);
  });
  it('evaluation transfer keeps identified samples and exposes the changed temperature as the repair target', () => {
    const spec = chemicalInvestigationSpecs.find(s => s.id === 'CHEM79-INVESTIGATION-EVAL')!;
    for (let seed = 0; seed < 96; seed++) {
      const task = spec.item(rng(seed), 'transfer').task;
      if (task.mode !== 'conclude') throw Error('Conclude');
      expect(task.rows[0]!.sample).toBe(task.rows[1]!.sample);
      expect(task.rows[1]!.note).toContain('lämpötila vaihtui');
      const response = { kind, mode: 'conclude' as const, citedRows: [], difference: '', confidence: null,
        issueRows: ['B'], repair: 'control-temperature' as const, review: adult(task) };
      expect(checkChemicalInvestigation(task, response)).toMatchObject({ ok: true, observedByAdult: true });
      expect(checkChemicalInvestigation(task, { ...response, repair: 'recover-or-repeat' }).ok).toBe(false);
    }
  });
  it('the selected transfer instrument has its own 3D geometry and retains the same volume ledger', () => {
    const spec = chemicalInvestigationSpecs.find(s => s.id === 'CHEM79-LAB-01')!;
    const task = spec.item(rng(1), 'independent').task;
    if (task.mode !== 'tool') throw Error('Tool');
    const geometry = { 'pipette-small': 'operated-pipette', 'pipette-large': 'operated-pipette', cylinder: 'operated-measuring-cylinder', beaker: 'operated-beaker', balance: 'selected-unsuitable-balance' };
    for (const tool of task.instruments) {
      const response = { kind, mode: 'tool' as const, reading: reading(0, 'ul'), actions: [action(task, 'select', 'select', { instrument: tool.id })] };
      const model = chemicalInvestigationScene(task, response)!, parent = new THREE.Group();
      const stage = mountChemicalInvestigationStage(parent, model);
      expect(parent.getObjectByName(geometry[tool.id])).toBeTruthy();
      if (!tool.id.startsWith('pipette')) expect(parent.getObjectByName('pipette-stem')).toBeUndefined();
      expect(stage.snapshot().transfer).toEqual({ sourceUl: task.sourceUl, heldUl: 0, receiverUl: 0, capacityUl: task.sourceUl, receiverCapacityUl: Math.max(task.sourceUl, task.requestedUl) });
      stage.dispose();
    }
    const parent = new THREE.Group(), stage = mountChemicalInvestigationStage(parent, chemicalInvestigationScene(task)!);
    expect(parent.getObjectByName('instrument-awaits-selection')).toBeTruthy();
    expect(parent.getObjectByName('pipette-stem')).toBeUndefined(); stage.dispose();
  });
  it('unread stage snapshots expose calibration but no exact sample quantity, height or meter reading', () => {
    let mass = 0, volume = 0;
    for (let seed = 0; seed < 48; seed++) {
      const task = chemicalInvestigationSpecs.find(s => s.id === 'CHEM79-MEAS-01')!.item(rng(seed), 'independent').task;
      const answer = oracle(task);
      if (task.mode !== 'measure' || answer.mode !== 'measure') throw Error('Measure');
      task.quantity === 'mass' ? mass++ : volume++;
      for (let length = 1; length < answer.actions.length; length++) {
        const partial = { ...answer, actions: answer.actions.slice(0, length) };
        const model = chemicalInvestigationScene(task, partial)!, parent = new THREE.Group();
        const stage = mountChemicalInvestigationStage(parent, model), snapshot = stage.snapshot();
        expect(snapshot.read).toBe(false);
        expect(JSON.stringify(snapshot)).not.toMatch(/readingMg|pointer|volumeUl|heightFraction|edgeFraction|ticks/);
        expect(snapshot.instrument).toEqual(model.instrument);
        if (model.samplePlaced) {
          const name = task.quantity === 'mass' ? 'named-sample' : 'calibrated-liquid-content';
          expect(parent.getObjectByName(name)).toBeTruthy();
        }
        stage.dispose();
      }
      const final = chemicalInvestigationScene(task, answer)!, parent = new THREE.Group();
      const stage = mountChemicalInvestigationStage(parent, final);
      expect(stage.snapshot()).toEqual(final);
      stage.dispose();
    }
    expect(mass).toBeGreaterThan(0); expect(volume).toBeGreaterThan(0);
  });
  it('3D scenes reveal only current instruments and use exact matching calibrations and an idempotent lifecycle', () => {
    for (const id of ['CHEM79-LAB-01', 'CHEM79-MEAS-01']) for (let seed = 0; seed < 24; seed++) {
      const task = chemicalInvestigationSpecs.find(s => s.id === id)!.item(rng(seed), 'transfer').task;
      const scene = chemicalInvestigationScene(task)!, response = oracle(task), final = chemicalInvestigationScene(task, response)!;
      expect(JSON.stringify(scene)).not.toMatch(/review|expected|capacityMg|amount/);
      expect(scene.meter).toBeUndefined(); expect(scene.liquid).toBeUndefined();
      const parent = new THREE.Group(), stage = mountChemicalInvestigationStage(parent, final);
      expect(stage.snapshot()).toEqual(final); expect(parent.children).toHaveLength(1);
      if (final.liquid) {
        const { heightFraction: f, baseWidth: base, topWidth: top, volumeUl, capacityUl } = final.liquid;
        const fraction = final.liquid.shape === 'cylinder' ? f : (base * f + (top - base) * f * f / 2) / ((base + top) / 2);
        expect(fraction).toBeCloseTo(volumeUl / capacityUl, 12);
      }
      stage.dispose(); stage.dispose(); expect(parent.children).toHaveLength(0);
    }
  });
});
