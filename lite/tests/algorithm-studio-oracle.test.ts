import { describe, expect, it } from 'vitest';
import { runStudio, researchBest, researchValue, checkAlgorithmStudio, type StudioExpr, type StudioProgram, type AlgorithmStudioTask, type AlgorithmStudioResponse, type StudioBlock } from '../src/content/models/algorithm-studio';
import { algorithmStudioSpecs } from '../src/content/algorithm-studio';
import { rng } from '../src/engine/rng';

const c = (value: number): StudioExpr => ({ kind: 'const', value });
const input: StudioExpr = { kind: 'input' };
const acc: StudioExpr = { kind: 'var', name: 'sum' };
const add = (left: StudioExpr, right: StudioExpr): StudioExpr => ({ kind: 'add', left, right });

function independentlyProduce(task: AlgorithmStudioTask): AlgorithmStudioResponse {
  const q = task.requirement, name = { lantern: 'lanternTotal', samples: 'sampleTotal', snacks: 'snackTotal' }[q.context];
  const value: StudioExpr = { kind: 'var', name };
  const program: StudioBlock[] = q.rule === 'share'
    ? [{ kind: 'output', value: { kind: 'quotient', left: c(q.factor), right: input } }]
    : [{ kind: 'set', name, value: c(q.offset) }, { kind: 'repeat', count: input, body: [{ kind: 'set', name, value: add(value, c(q.factor)) }] },
      ...(q.rule === 'even-bonus' ? [{ kind: 'if-even' as const, body: [{ kind: 'set' as const, name, value: add(value, c(q.bonus)) }] }] : []), { kind: 'output', value }];
  const prediction = (n: number) => n < 0 ? null : q.rule === 'share' ? n === 0 ? null : Math.floor(q.factor / n) : q.offset + n * q.factor + (q.rule === 'even-bonus' && n % 2 === 0 ? q.bonus : 0);
  const tests = [0, 1, q.maxInput, -1].map(n => {
    const bug = task.activity === 'test';
    const status = n < 0 ? 'invalid-input' as const : q.rule === 'share' && n === 0 && !bug ? 'divide-by-zero' as const : 'ok' as const;
    const actual = n < 0 ? null : !bug ? prediction(n) : q.rule === 'share' ? Math.floor(q.factor / (n + 1)) : task.bug === 'omit-bonus' ? q.offset + n * q.factor : q.offset + (n + 1) * q.factor;
    return { input: n, prediction: prediction(n), actual, status };
  });
  const r: AlgorithmStudioResponse = { kind: 'algorithm-studio', program, plan: ['read', 'iterate', ...(q.rule === 'even-bonus' ? ['decide'] : []), 'finish'],
    interfaces: { input: 'count', output: 'total', stop: 'count' }, variableName: name, grouped: true, tests, locked: true,
    ...(task.activity === 'test' ? { bugInput: 0 } : {}), ...(task.review ? { confirmedByAdult: true, assistance: 'none', observations: Object.fromEntries(task.review.criteria.map(criterion => [criterion.id, 'met'])) } : {}) };
  if (task.research) {
    const research = task.research;
    const rows = Array.from({ length: research.max - 1 }, (_, i) => {
      const x = i + 1;
      let y = 0;
      for (let row = 0; row < x; row++) for (let col = 0; col < (research.kind === 'rectangle' ? research.max - x : research.kind === 'square' ? x : row + 1); col++) y++;
      return { x, y };
    });
    return { ...r, researchTool: research.kind, researchPrediction: 1, researchRows: rows, researchConclusion: rows.reduce((best, row) => row.y >= best.y ? row : best).x };
  }
  return r;
}

describe('independent bounded-machine oracle', () => {
  it('requires an actual grouped refactor instead of accepting a claimed grouping flag', () => {
    const task: AlgorithmStudioTask = { kind: 'algorithm-studio', activity: 'refactor', question: '', hint: '',
      requirement: { rule: 'linear', factor: 4, offset: 2, bonus: 0, maxInput: 6, context: 'lantern' } };
    const reply = independentlyProduce(task), name = reply.variableName;
    const ungrouped = reply.program.map(block => block.kind === 'repeat' ? { ...block,
      body: Array.from({ length: 4 }, (): StudioBlock => ({ kind: 'set', name, value: add({ kind: 'var', name }, c(1)) })) } : block);
    expect(checkAlgorithmStudio(task, { ...reply, program: ungrouped, grouped: true }).ok).toBe(false);
    expect(checkAlgorithmStudio(task, reply).ok).toBe(true);
  });
  it('independently produces all seven authored tasks, including genuine division transfer and adult evidence boundaries', () => {
    for (const spec of algorithmStudioSpecs) for (const phase of ['independent', 'transfer'] as const) for (let seed = 0; seed < 128; seed++) {
      const task = spec.item(rng(seed), phase).task as AlgorithmStudioTask, reply = independentlyProduce(task);
      expect(checkAlgorithmStudio(task, reply), `${spec.id}/${phase}/${seed}`).toMatchObject({ ok: true });
      expect(checkAlgorithmStudio(task, { ...reply, locked: false }).ok).toBe(false);
      if (task.activity !== 'research') expect(checkAlgorithmStudio(task, { ...reply, tests: reply.tests.map(row => row.input === 1 ? { ...row, actual: 999 } : row) }).ok).toBe(false);
      if (task.activity === 'decompose') expect(checkAlgorithmStudio(task, { ...reply, plan: [...reply.plan].reverse() }).ok).toBe(false);
      if (task.review) {
        expect(checkAlgorithmStudio(task, { ...reply, confirmedByAdult: false }).pendingReview).toBe(true);
        expect(checkAlgorithmStudio(task, { ...reply, observations: Object.create(reply.observations!) }).pendingReview).toBe(true);
        expect(checkAlgorithmStudio(task, { ...reply, assistance: 'helped' })).toMatchObject({ ok: true, assisted: true });
      }
    }
  });
  it('agrees with counted tokens for positive and negative updates, including both parity paths', () => {
    // Expectations come from an explicit token ledger, not the production solver or generator.
    for (let factor = -3; factor <= 4; factor++) for (let offset = -4; offset <= 4; offset++) for (let bonus = -2; bonus <= 3; bonus++) {
      const program: StudioProgram = [
        { kind: 'set', name: 'sum', value: c(offset) },
        { kind: 'repeat', count: input, body: [{ kind: 'set', name: 'sum', value: add(acc, c(factor)) }] },
        { kind: 'if-even', body: [{ kind: 'set', name: 'sum', value: add(acc, c(bonus)) }] },
        { kind: 'output', value: acc },
      ];
      for (let n = 0; n <= 8; n++) {
        const tokens = [offset, ...Array<number>(n).fill(factor), ...(n % 2 === 0 ? [bonus] : [])];
        const expected = tokens.reduce((total, token) => total + token, 0);
        const result = runStudio(program, n);
        expect(result.status).toBe('ok');
        expect(result.output).toBe(expected);
        expect(result.trace).toHaveLength(n + 4 + (n % 2 === 0 ? 1 : 0));
        expect(result.trace.map(frame => frame.step)).toEqual(Array.from({ length: result.trace.length }, (_, i) => i + 1));
        expect(result.trace[0]!.variables.sum).toBe(offset);
        expect(result.trace.at(-1)!.variables.sum).toBe(expected);
      }
    }
  });

  it('uses mathematical floor division, overwrites assignments, and stops at the executed-step boundary', () => {
    for (let numerator = -17; numerator <= 17; numerator++) for (let denominator = -6; denominator <= 6; denominator++) {
      const program: StudioProgram = [
        { kind: 'set', name: 'sum', value: c(999) },
        { kind: 'set', name: 'sum', value: { kind: 'quotient', left: c(numerator), right: c(denominator) } },
        { kind: 'output', value: acc },
      ];
      const result = runStudio(program, 0);
      if (denominator === 0) {
        expect(result.status).toBe('divide-by-zero'); expect(result.output).toBeNull();
      } else {
        // Unique integer q with q*d <= n < (q+1)*d, reversing inequalities for d<0.
        const q = Array.from({ length: 41 }, (_, i) => i - 20).find(q => denominator > 0
          ? q * denominator <= numerator && numerator < (q + 1) * denominator
          : q * denominator >= numerator && numerator > (q + 1) * denominator)!;
        expect(result.output === q).toBe(true); expect(result.trace[0]!.variables.sum).toBe(999);
      }
    }
    const nested: StudioProgram = [{ kind: 'repeat', count: c(4), body: [
      { kind: 'repeat', count: c(3), body: [{ kind: 'output', value: input }] },
    ] }];
    expect(runStudio(nested, 7, 17).status).toBe('ok');
    const bounded = runStudio(nested, 7, 16);
    expect(bounded.status).toBe('limit'); expect(bounded.output).toBeNull(); expect(bounded.trace).toHaveLength(16);
  });

  it('rejects malformed inactive branches, cycles, oversized integers and sparse instruction arrays', () => {
    const invalid = [null, { kind: 'javascript', source: 'private text' }, { kind: 'set', name: '__proto__', value: c(1) },
      { kind: 'output', value: c(NaN) }, { kind: 'output', value: c(Infinity) }, { kind: 'output', value: c(1_000_001) }];
    for (const bad of invalid) {
      expect(runStudio([{ kind: 'if-even', body: [bad] }] as unknown as StudioProgram, 1).status).toBe('invalid-program');
      expect(runStudio([{ kind: 'repeat', count: c(0), body: [bad] }] as unknown as StudioProgram, 1).status).toBe('invalid-program');
    }
    const cyclic: unknown[] = []; cyclic.push({ kind: 'repeat', count: c(0), body: cyclic });
    expect(runStudio(cyclic as StudioProgram, 1).status).toBe('invalid-program');
    expect(runStudio(Array(2), 1).status).toBe('invalid-program');
    expect(runStudio([{ kind: 'output', value: acc }], 0).status).toBe('invalid-program');
    expect(runStudio([{ kind: 'output', value: { kind: 'multiply', left: c(1000), right: c(1001) } }], 0).status).toBe('invalid-program');
    for (const n of [-1, 9, 0.5, NaN]) expect(runStudio([], n).status).toBe('invalid-input');
  });

  it('matches enumerated unit cells and retains every tied optimum only within the declared research domain', () => {
    for (let max = 5; max <= 10; max++) for (const kind of ['rectangle', 'triangular', 'square'] as const) {
      const values: { x: number; cells: number }[] = [];
      for (let x = 1; x < max; x++) {
        let cells = 0;
        for (let row = 0; row < x; row++) for (let column = 0; column < (kind === 'rectangle' ? max - x : kind === 'square' ? x : row + 1); column++) cells++;
        values.push({ x, cells }); expect(researchValue(kind, max, x)).toBe(cells);
      }
      const highest = Math.max(...values.map(row => row.cells));
      expect(researchBest(kind, max)).toEqual(values.filter(row => row.cells === highest).map(row => row.x));
      expect(researchValue(kind, max, 0)).toBeNull(); expect(researchValue(kind, max, max)).toBeNull();
    }
  });
});
