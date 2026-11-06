import { describe, expect, it } from 'vitest';
import { rng } from '../src/engine/rng';
import { chemicalNotationSpecs, chemicalReactions } from '../src/content/chemical-notation';
import { checkChemicalNotation, parseChemicalFormula, chemicalInventory, type ChemicalNotationTask,
  type ChemicalNotationResponse, type ChemicalReaction, type AtomInventory } from '../src/content/models/chemical-notation';

// Independently authored element names and AST arithmetic. No production solution/search generates an expectation.
const names: Record<string, string> = { H: 'vety', He: 'helium', C: 'hiili', N: 'typpi', O: 'happi', F: 'fluori', Ne: 'neon',
  Na: 'natrium', Mg: 'magnesium', Al: 'alumiini', Si: 'pii', P: 'fosfori', S: 'rikki', Cl: 'kloori', K: 'kalium',
  Ca: 'kalsium', Fe: 'rauta', Co: 'koboltti', Cu: 'kupari', Zn: 'sinkki', Br: 'bromi' };
type Counts = Record<string, bigint>;
type Q = readonly [bigint, bigint];
const abs = (n: bigint) => n < 0n ? -n : n;
const gcd = (a: bigint, b: bigint): bigint => b ? gcd(b, a % b) : abs(a);
const q = (n: bigint, d = 1n): Q => {
  if (!d) throw Error('Independent oracle attempted division by zero');
  const g = gcd(n, d) || 1n; return d < 0n ? [-n / g, -d / g] : [n / g, d / g];
};
const sub = ([a, b]: Q, [c, d]: Q) => q(a * d - c * b, b * d);
const mul = ([a, b]: Q, [c, d]: Q) => q(a * c, b * d);
const div = ([a, b]: Q, [c, d]: Q) => q(a * d, b * c);
const lcm = (a: bigint, b: bigint) => a / gcd(a, b) * b;
function expand(raw: string): Counts {
  // The independent oracle expands a flat group by repetition, then aggregates symbols.
  const flat = raw.replace(/\(([A-Za-z0-9]+)\)(\d*)/g, (_, group: string, count: string) => group.repeat(Number(count || 1)));
  const counts: Counts = {};
  for (const [, symbol, digits] of flat.matchAll(/([A-Z][a-z]?)(\d*)/g)) counts[symbol!] = (counts[symbol!] ?? 0n) + BigInt(digits || 1);
  return counts;
}
const scaled = (counts: Counts, factor = 1n): AtomInventory => Object.fromEntries(Object.entries(counts).map(([symbol, n]) => [symbol, Number(n * factor)]));
function tally(samples: ChemicalReaction['left'], coefficients: readonly number[]): Counts {
  const total: Counts = {};
  samples.forEach((sample, i) => {
    for (const [symbol, count] of Object.entries(expand(sample.formula))) total[symbol] = (total[symbol] ?? 0n) + count * BigInt(coefficients[i]!);
  });
  return total;
}
/** Exact rational RREF nullspace, independent of the production bounded exhaustive search. */
function balance(reaction: ChemicalReaction): number[] | undefined {
  const samples = [...reaction.left, ...reaction.right], inventories = samples.map(s => expand(s.formula));
  const elements = [...new Set(inventories.flatMap(Object.keys))];
  const matrix = elements.map(symbol => inventories.map((row, j) => q((j < reaction.left.length ? 1n : -1n) * (row[symbol] ?? 0n))));
  const pivots: number[] = [];
  for (let col = 0, row = 0; col < samples.length && row < matrix.length; col++) {
    const found = matrix.findIndex((line, i) => i >= row && line[col]![0] !== 0n);
    if (found < 0) continue;
    [matrix[row], matrix[found]] = [matrix[found]!, matrix[row]!];
    const pivot = matrix[row]![col]!;
    matrix[row] = matrix[row]!.map(n => div(n, pivot));
    matrix.forEach((line, i) => {
      if (i === row) return;
      const factor = line[col]!; matrix[i] = line.map((n, j) => sub(n, mul(factor, matrix[row]![j]!)));
    });
    pivots.push(col); row++;
  }
  const free = samples.map((_, i) => i).filter(i => !pivots.includes(i));
  if (free.length !== 1) return;
  const vector: Q[] = samples.map(() => q(0n)); vector[free[0]!] = q(1n);
  pivots.forEach((col, row) => { vector[col] = q(-matrix[row]![free[0]!]![0], matrix[row]![free[0]!]![1]); });
  const denominator = vector.reduce((n, [, d]) => lcm(n, d), 1n), integers = vector.map(([n, d]) => n * denominator / d);
  if (!integers.every(n => n > 0n)) return;
  const divisor = integers.reduce(gcd); return integers.map(n => Number(n / divisor));
}
function reference(task: ChemicalNotationTask): ChemicalNotationResponse {
  const kind = 'chemical-notation' as const;
  if (task.mode === 'symbols') return { kind, mode: task.mode, rows: task.samples.map(s => {
    const symbol = s.name ? Object.keys(names).find(key => names[key] === s.name)! : s.shown;
    return { id: s.id, element: symbol, symbol };
  }) };
  if (task.mode === 'formula') {
    const counts = expand(task.sample.formula);
    return { kind, mode: task.mode, species: Object.keys(counts).reverse(), atoms: scaled(counts, 5n), model: scaled(counts) };
  }
  if (task.mode === 'subscript') {
    const token = [...task.sample.formula.matchAll(/([A-Z][a-z]?)(\d*)/g)][task.target]!;
    return { kind, mode: task.mode, element: token[1]!, count: Number(token[2] || 1), implicit: !token[2], atoms: scaled(expand(task.sample.formula)) };
  }
  if (task.mode === 'groups') return { kind, mode: task.mode, groups: task.coefficient, atoms: scaled(expand(task.sample.formula), BigInt(task.coefficient)) };
  if (task.mode === 'roles') return { kind, mode: task.mode, roles: [...task.reaction.left.map(() => 'reactant'), ...task.reaction.right.map(() => 'product')], arrow: 'change' };
  const coefficients = balance(task.reaction);
  if (!coefficients) throw Error('Authored reaction has no one-dimensional positive nullspace');
  return { kind, mode: task.mode, coefficients, left: scaled(tally(task.reaction.left, coefficients)), right: scaled(tally(task.reaction.right, coefficients.slice(task.reaction.left.length))) };
}

describe('independent ChemicalNotation8 peer', () => {
  it('matches independently generated formula ASTs and bounded grammar edges', () => {
    const elements = Object.keys(names);
    for (let i = 0; i < 192; i++) {
      const a = elements[i % elements.length]!, b = elements[(i + 3) % elements.length]!, c = elements[(i + 7) % elements.length]!;
      const n = i % 24 + 1, m = (i * 7) % 24 + 1, p = (i * 11) % 24 + 1, factor = i % 6 + 1;
      const formula = `${a}${n}${b}${m}(${c}${p}${a})${factor}`;
      const expected = { [a]: n + factor, [b]: m, [c]: p * factor };
      expect(parseChemicalFormula(formula)?.atoms, formula).toEqual(expected);
      for (const coefficient of [1, 7, 1000]) expect(chemicalInventory(formula, coefficient)).toEqual(Object.fromEntries(Object.entries(expected).map(([symbol, amount]) => [symbol, amount * coefficient])));
    }
    expect(parseChemicalFormula('(H24)10H16')?.atoms).toEqual({ H: 256 });
    for (const raw of ['', '2H2O', 'H0', 'H01', 'H25', '(H24)11', '((OH)2)2', 'H2O·5H2O', 'Na+', 'SO4-2', 'h2o', 'CL', 'co', 'Xx', 'Na Cl', '()2', '(OH', 'OH)', 'H2O\n']) expect(parseChemicalFormula(raw), raw).toBeUndefined();
    expect(parseChemicalFormula('Co')?.atoms).toEqual({ Co: 1 }); expect(parseChemicalFormula('CO')?.atoms).toEqual({ C: 1, O: 1 });
  });
  it('accepts 3072 independently derived authored responses, rejects per-mode wrong concepts and keeps genuine variation', () => {
    let count = 0;
    for (const spec of chemicalNotationSpecs) {
      const inputs = new Set<string>(), tags = new Set<string>();
      for (const phase of ['independent', 'transfer'] as const) for (let seed = 0; seed < 192; seed++) {
        const item = spec.item(rng(seed), phase), task = item.task as ChemicalNotationTask, response = reference(task);
        expect(checkChemicalNotation(task, response), `${spec.id}/${seed}/${phase}`).toEqual({ ok: true });
        if (phase === 'independent') {
          tags.add(item.tag);
          const { title: _title, ...data } = task;
          inputs.add(JSON.stringify({ ...data, ...('palette' in data ? { palette: undefined } : {}), ...('monochrome' in data ? { monochrome: undefined } : {}) }));
        }
        expect(checkChemicalNotation(task, null as unknown as ChemicalNotationResponse).ok).toBe(false);
        if (response.mode === 'formula') {
          const wrong = { ...response, species: [...response.species, response.species[0]!], atoms: {}, model: {} };
          expect(checkChemicalNotation(task, wrong).ok).toBe(false);
          if (task.mode === 'formula' && task.objective === 'both') expect(checkChemicalNotation(task, { ...response, model: response.atoms }).ok).toBe(false);
        } else if (response.mode === 'groups') {
          expect(checkChemicalNotation(task, { ...response, groups: 0 }).ok).toBe(false);
          expect(checkChemicalNotation(task, { ...response, atoms: scaled(expand((task as Extract<ChemicalNotationTask, { mode: 'groups' }>).sample.formula)) }).ok).toBe(false);
        } else if (response.mode === 'subscript') expect(checkChemicalNotation(task, { ...response, implicit: !response.implicit }).ok).toBe(false);
        else if (response.mode === 'roles') expect(checkChemicalNotation(task, { ...response, arrow: 'equals' }).ok).toBe(false);
        else if (response.mode === 'symbols') expect(checkChemicalNotation(task, { ...response, rows: response.rows.map(r => ({ ...r, symbol: r.symbol.toLowerCase() })) }).ok).toBe(false);
        else expect(checkChemicalNotation(task, { ...response, coefficients: response.coefficients.map(() => 0) }).ok).toBe(false);
        count++;
      }
      expect(tags.size, spec.id).toBe(2); expect(inputs.size, spec.id).toBeGreaterThanOrEqual(8);
    }
    expect(count).toBe(3072);
  });
  it('matrix-derived balances accept common multiples and reject atom-sum-only conservation', () => {
    for (const reaction of Object.values(chemicalReactions).flat()) {
      const task: ChemicalNotationTask = { kind: 'chemical-notation', mode: 'balance', title: 'Independent nullspace', reaction, draft: [], primitive: false };
      const correct = reference(task); if (correct.mode !== 'balance') throw Error('Expected balance');
      expect(correct.coefficients.reduce((a, b) => Number(gcd(BigInt(a), BigInt(b))))).toBe(1);
      for (const factor of [1, 2, 13, 71]) {
        const coefficients = correct.coefficients.map(n => n * factor);
        if (coefficients.some(n => n > 1000)) continue;
        const alternative = { ...correct, coefficients, left: scaled(tally(reaction.left, coefficients)), right: scaled(tally(reaction.right, coefficients.slice(reaction.left.length))) };
        expect(checkChemicalNotation(task, alternative)).toEqual({ ok: true });
        expect(checkChemicalNotation({ ...task, primitive: true }, alternative).ok).toBe(factor === 1);
      }
    }
    const hydrogen = { formula: 'H2', name: 'Vety', form: 'molecule' as const }, oxygen = { formula: 'O2', name: 'Happi', form: 'molecule' as const };
    const task: ChemicalNotationTask = { kind: 'chemical-notation', mode: 'balance', title: 'Equal total is insufficient', reaction: { left: [hydrogen, oxygen], right: [hydrogen, oxygen], condition: 'Counterexample' }, draft: [], primitive: false };
    expect(checkChemicalNotation(task, { kind: 'chemical-notation', mode: 'balance', coefficients: [1, 2, 2, 1], left: { H: 2, O: 4 }, right: { H: 4, O: 2 } }).ok).toBe(false);
    for (const coefficients of [[1, 2, 1, 2], [3, 4, 3, 4]]) expect(checkChemicalNotation(task, { kind: 'chemical-notation', mode: 'balance', coefficients, left: { H: coefficients[0]! * 2, O: coefficients[1]! * 2 }, right: { H: coefficients[2]! * 2, O: coefficients[3]! * 2 } }).ok).toBe(true);
    const impossible = { ...task, reaction: { left: [hydrogen], right: [oxygen], condition: 'Impossible, no nuclear changes' } };
    for (const a of [1, 2, 1000]) expect(checkChemicalNotation(impossible, { kind: 'chemical-notation', mode: 'balance', coefficients: [a, a], left: { H: a * 2 }, right: { O: a * 2 } }).ok).toBe(false);
  });
  it('covers large supported grammar/coefficient combinations without truncating atom inventories', () => {
    const task: ChemicalNotationTask = { kind: 'chemical-notation', mode: 'groups', title: 'Bounded model only', sample: { formula: '(C8H8)24', name: 'Named formula fixture', form: 'molecule' }, coefficient: 1000, source: 'notation', palette: ['C', 'H'] };
    expect(checkChemicalNotation(task, reference(task))).toEqual({ ok: true });
    if (task.mode !== 'groups') throw Error('Groups');
    for (const wrong of [-1, 0, .5, Infinity, NaN]) expect(checkChemicalNotation(task, { ...reference(task), mode: 'groups', groups: wrong, atoms: { C: 192000, H: 192000 } }).ok).toBe(false);
    for (const atoms of [{ C: NaN, H: 192000 }, { C: Infinity, H: 192000 }, { C: -1, H: 192000 }, { C: 192000, H: 192000, Xx: 0 }, Object.create({ C: 192000, H: 192000 })])
      expect(checkChemicalNotation(task, { kind: 'chemical-notation', mode: 'groups', groups: 1000, atoms } as ChemicalNotationResponse).ok).toBe(false);
    let invoked = 0;
    const accessor = Object.defineProperty({ H: 192000 }, 'C', { enumerable: true, get() { invoked++; return 192000; } });
    expect(checkChemicalNotation(task, { kind: 'chemical-notation', mode: 'groups', groups: 1000, atoms: accessor }).ok).toBe(false);
    expect(invoked).toBe(0);
    const safe = Object.assign(Object.create(null), { C: 192000, H: 192000 });
    expect(checkChemicalNotation(task, { kind: 'chemical-notation', mode: 'groups', groups: 1000, atoms: safe }).ok).toBe(true);

  });
});
