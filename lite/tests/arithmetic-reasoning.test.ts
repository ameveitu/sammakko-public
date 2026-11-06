import { describe, expect, it } from 'vitest';
import { arithmeticReasoningSpecs, arithmeticReasoningEvidence } from '../src/content/arithmetic-reasoning';
import { checkArithmeticReasoning, solutionArithmeticReasoning, wrongArithmeticReasoningResponses, type ArithmeticReasoningResponse, type ArithmeticReasoningTask } from '../src/content/models/arithmetic-reasoning';
import { checkObservedExplanation, solutionObservedExplanation } from '../src/content/models/observed-explanations';
import { catalogNode } from '../src/engine/catalog';
import { rng } from '../src/engine/rng';

const kind = 'arithmetic-reasoning' as const;
const base = { kind, context: { title: 'Testi', skills: [] }, givens: [] };
const spec = (id: string) => arithmeticReasoningSpecs.find(node => node.id === id)!;

describe('arithmetic reasoning workbenches', () => {
  it('covers all thirteen revisions, two families, local context and separately authored transfers', () => {
    expect(arithmeticReasoningSpecs).toHaveLength(13);
    for (const node of arithmeticReasoningSpecs) {
      const families = new Set<string>();
      expect(node.validRevs).toEqual([node.rev]);
      for (const phase of ['independent', 'guided', 'transfer', 'retrieval'] as const) for (let seed = 0; seed < 26; seed++) {
        const { task, tag } = node.item(rng(seed), phase);
        if (phase === 'independent') families.add(tag);
        expect(tag === 'transfer').toBe(phase === 'transfer');
        expect(task.context.skills.length).toBeGreaterThan(0);
        expect(task.context.skills.every(id => catalogNode(id))).toBe(true);
        if (task.kind === 'observed-explanation') {
          expect(node.id).toBe('M-ALG-02');
          expect(task.channel).toBe('spoken');
          expect(checkObservedExplanation(task, solutionObservedExplanation(task)).ok).toBe(false);
        } else {
          expect(checkArithmeticReasoning(task, solutionArithmeticReasoning(task)).ok, `${node.id}/${phase}/${seed}`).toBe(true);
          for (const wrong of wrongArithmeticReasoningResponses(task)) expect(checkArithmeticReasoning(task, wrong).ok).toBe(false);
        }
      }
      expect(families).toEqual(new Set(arithmeticReasoningEvidence[node.id]!.families));
      expect(families.size).toBe(2);
    }
  });

  it('accepts different partitions and checks both part sizes against independent seat enumeration', () => {
    for (const axis of ['rows', 'columns'] as const) for (const cut of [1, 2, 3]) {
      const task: ArithmeticReasoningTask = { ...base, mode: 'split', rows: 4, columns: 5, axis };
      const cells = Array.from({ length: 20 }, (_, i) => [Math.floor(i / 5) + 1, i % 5 + 1]);
      const first = cells.filter(([r, c]) => (axis === 'rows' ? r! : c!) <= cut).length;
      const answer: ArithmeticReasoningResponse = { kind, mode: 'split', cut, first, second: 20 - first, total: 20 };
      expect(checkArithmeticReasoning(task, answer).ok).toBe(true);
      expect(checkArithmeticReasoning(task, { ...answer, first: first + 1, second: 19 - first }).ok).toBe(false);
      expect(checkArithmeticReasoning({ ...task, avoidCut: cut }, answer).ok).toBe(false);
    }
  });

  it('rotates every possible focus correctly in both directions and requires both factor roles', () => {
    for (const clockwise of [false, true]) {
      const original = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]];
      const transposed = original[0]!.map((_, i) => original.map(row => row[i]!));
      const rotated = clockwise ? transposed.map(row => [...row].reverse()) : [...transposed].reverse();
      for (let row = 1; row <= 3; row++) for (let column = 1; column <= 4; column++) {
        const id = original[row - 1]![column - 1]!;
        const newRow = rotated.findIndex(row => row.includes(id));
        const newCol = rotated[newRow]!.indexOf(id);
        const task: ArithmeticReasoningTask = { ...base, mode: 'rotate', rows: 3, columns: 4, focus: { row, column }, clockwise };
        const answer: ArithmeticReasoningResponse = { kind, mode: 'rotate', turned: true,
          before: { row: 3, column: 4 }, after: { row: 4, column: 3 }, landed: { row: newRow + 1, column: newCol + 1 } };
        expect(checkArithmeticReasoning(task, answer).ok).toBe(true);
        expect(checkArithmeticReasoning(task, { ...answer, after: answer.before }).ok).toBe(false);
      }
    }
  });

  it('distinguishes associative parentheses from a new operation or the right total alone', () => {
    const task: ArithmeticReasoningTask = { ...base, mode: 'group', a: 2, b: 3, c: 4 };
    const answer: ArithmeticReasoningResponse = { kind, mode: 'group', seen: [0, 1], leftInner: 6, rightInner: 12, leftTotal: 24, rightTotal: 24 };
    expect(checkArithmeticReasoning(task, answer).ok).toBe(true);
    expect(checkArithmeticReasoning(task, { ...answer, rightInner: 7 }).ok).toBe(false);
    expect(checkArithmeticReasoning(task, { ...answer, seen: [] }).ok).toBe(false);
    for (let seed = 0; seed < 40; seed++) {
      const { task } = spec('M-MUL-ASSOC').item(rng(seed), 'independent');
      if (task.kind === 'arithmetic-reasoning' && task.mode === 'group' && task.draft) expect(task.b + task.c).not.toBe(task.b * task.c);
    }
  });

  it('allows zero as a multiple, forbids it as a divisor and requires explicit overlap and neither', () => {
    const task: ArithmeticReasoningTask = { ...base, mode: 'membership', numbers: [0, 4, 6, 10, 7],
      rules: [{ relation: 'divisor', of: 24 }, { relation: 'multiple', of: 4 }] };
    const correct: ArithmeticReasoningResponse = { kind, mode: 'membership', memberships: [[1], [0, 1], [0], [-1], [-1]] };
    expect(checkArithmeticReasoning(task, correct).ok).toBe(true);
    expect(checkArithmeticReasoning(task, { ...correct, memberships: [[0, 1], [0, 1], [0], [-1], [-1]] }).ok).toBe(false);
    expect(checkArithmeticReasoning(task, { ...correct, memberships: [[1], [1], [0], [], [-1]] }).ok).toBe(false);
    expect(checkArithmeticReasoning({ ...base, mode: 'relation', divisor: 7, multiple: 0, view: 'symbol' },
      { kind, mode: 'relation', divisor: 7, multiple: 0, groups: 0 }).ok).toBe(true);
  });

  it('uses exact nearest bounds and upward ties, distinguishes estimate from equality', () => {
    for (const unit of [10, 100, 1000]) for (const offset of [0, unit / 2 - 1, unit / 2, unit / 2 + 1]) {
      const value = 3 * unit + offset;
      const [lower, upper] = [3, 4].map(n => n * unit);
      const rounded = [lower!, upper!].sort((a, b) => Math.abs(a - value) - Math.abs(b - value) || b - a)[0]!;
      const task: ArithmeticReasoningTask = { ...base, mode: 'round', value, unit, view: 'symbol' };
      expect(checkArithmeticReasoning(task, { kind, mode: 'round', lower: lower!, upper: upper!, rounded }).ok).toBe(true);
    }
    const task: ArithmeticReasoningTask = { ...base, mode: 'estimate', operation: '+', a: 236, b: 187, units: [10, 100] };
    for (const [unit, first, second] of [[10, 240, 190], [100, 200, 200]] as const) {
      const answer: ArithmeticReasoningResponse = { kind, mode: 'estimate', unit, first, second, estimate: first + second, symbol: '≈' };
      expect(checkArithmeticReasoning(task, answer).ok).toBe(true);
      expect(checkArithmeticReasoning(task, { ...answer, symbol: '=' }).ok).toBe(false);
    }
    const audit: ArithmeticReasoningTask = { ...base, mode: 'audit', a: [230, 250], b: [70, 95], operation: '−', proposed: 182 };
    const values = Array.from({ length: 21 }, (_, a) => Array.from({ length: 26 }, (_, b) => 230 + a - (70 + b))).flat();
    expect(checkArithmeticReasoning(audit, { kind, mode: 'audit', lower: Math.min(...values), upper: Math.max(...values), finding: 'above' }).ok).toBe(true);
  });

  it('accepts valid alternative mental and column traces and rejects lucky totals', () => {
    const task: ArithmeticReasoningTask = { ...base, mode: 'strategy', a: 176, b: 29, operation: '+' };
    for (const trace of [
      { method: 'partition', first: 20, second: 9, intermediate: 196 },
      { method: 'adjust', anchor: 30, correction: -1, intermediate: 206 },
      { method: 'adjust', anchor: 20, correction: 9, intermediate: 196 },
      { method: 'columns', digits: [5, 0, 2], exchanges: [1, 1, 0] },
    ] as const) {
      const mutable = trace.method === 'columns' ? { ...trace, digits: [...trace.digits], exchanges: [...trace.exchanges] } : trace;
      expect(checkArithmeticReasoning(task, { kind, mode: 'strategy', trace: mutable, total: 205 }).ok).toBe(true);
    }
    expect(checkArithmeticReasoning(task, { kind, mode: 'strategy', trace: { method: 'columns', digits: [5, 0, 2], exchanges: [1, 0, 0] }, total: 205 }).ok).toBe(false);
    const subtraction: ArithmeticReasoningTask = { ...base, mode: 'strategy', a: 602, b: 198, operation: '−' };
    expect(checkArithmeticReasoning(subtraction, { kind, mode: 'strategy', trace: { method: 'columns', digits: [4, 0, 4], exchanges: [1, 1, 0] }, total: 404 }).ok).toBe(true);
  });

  it('checks several visible transitions and every new term without asserting a unique infinite rule', () => {
    const task: ArithmeticReasoningTask = { ...base, mode: 'sequence', recognize: true, count: 2, shown: [2, 4, 6, 8],
      rules: [{ operation: '+', operand: 2 }, { operation: '×', operand: 2 }] };
    expect(checkArithmeticReasoning(task, { kind, mode: 'sequence', rule: 0, extension: [10, 12] }).ok).toBe(true);
    expect(checkArithmeticReasoning(task, { kind, mode: 'sequence', rule: 1, extension: [16, 32] }).ok).toBe(false);
    expect(checkArithmeticReasoning(task, { kind, mode: 'sequence', rule: 0, extension: [10, 10] }).ok).toBe(false);
    const spoken = spec('M-ALG-02').item(rng(4), 'transfer').task;
    if (spoken.kind !== 'observed-explanation') throw Error('Requires spoken task');
    expect(checkObservedExplanation(spoken, { kind: spoken.kind, channel: 'spoken', observations: {
      'repeatable-rule': 'met', 'checks-two-transitions': 'unobserved',
    }, confirmedByAdult: true, assistance: 'none' }).ok).toBe(false);
  });

  it('requires informative guesses, a shrinking domain and final substitution', () => {
    const task: ArithmeticReasoningTask = { ...base, mode: 'hunt', a: 3, b: 5, target: 23, min: 0, max: 12, start: 9 };
    const correct: ArithmeticReasoningResponse = { kind, mode: 'hunt', trials: [
      { input: 9, finding: 'above' }, { input: 2, finding: 'below' }, { input: 6, finding: 'fits' },
    ], solution: 6, substitution: 23 };
    expect(checkArithmeticReasoning(task, correct).ok).toBe(true);
    expect(checkArithmeticReasoning(task, { ...correct, trials: correct.trials.slice(2) }).ok).toBe(false);
    expect(checkArithmeticReasoning(task, { ...correct, trials: [correct.trials[0]!, correct.trials[0]!, correct.trials[2]!] }).ok).toBe(false);
    expect(checkArithmeticReasoning(task, { ...correct, trials: [correct.trials[0]!, { input: 2, finding: 'above' }, correct.trials[2]!] }).ok).toBe(false);
    expect(checkArithmeticReasoning(task, { ...correct, substitution: 18 }).ok).toBe(false);
  });
});
