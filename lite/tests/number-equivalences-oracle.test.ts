import { assert, expect, test } from 'vitest';
import { numberEquivalencesSpecs as specs } from '../src/content/number-equivalences';
import { checkNumberEquivalences as check, type NumberEquivalencesResponse, type NumberEquivalencesTask } from '../src/content/models/number-equivalences';
import { rng } from '../src/engine/rng';
// Deliberately malformed and partial response fixtures cross the public checker boundary.
type Fixture = Record<string, any>;
type Q = readonly [
    bigint,
    bigint
];
const kind = 'number-equivalences';
const stats = { generated: 0, accepted: 0, rejected: 0, negativeDifferences: 0, zeroLines: 0, denominatorX: 0, carryingColumns: 0, borrowingColumns: 0 };
function q(raw: string | number): Q {
    const text = String(raw).replace('−', '-').replace(',', '.');
    if (text.includes('/')) {
        const [numerator, denominator] = text.split('/');
        return [BigInt(numerator!), BigInt(denominator!)];
    }
    const [whole, decimals = ''] = text.split('.');
    return [BigInt(whole + decimals), 10n ** BigInt(decimals.length)];
}
const mul = ([a, b]: Q, [c, d]: Q): Q => [a * c, b * d];
const div = ([a, b]: Q, [c, d]: Q): Q => d * c < 0n ? [-a * d, -b * c] : [a * d, b * c];
const fmt = ([n, d]: Q, multiplier = 1n) => `${n * multiplier}/${d * multiplier}`;
function verdict(task: NumberEquivalencesTask, response: unknown, wanted: boolean) {
    const outcome = check(task, response as NumberEquivalencesResponse);
    assert.equal(outcome.ok, wanted, JSON.stringify({ task, response, outcome }));
    stats[wanted ? 'accepted' : 'rejected']++;
}
function mutated(task: NumberEquivalencesTask, answer: Fixture, path: (string | number)[], value: unknown) {
    const response: Fixture = structuredClone(answer);
    let target = response;
    for (const key of path.slice(0, -1)) target = target[key];
    target[path.at(-1)!] = value;
    verdict(task, response, false);
}
function independent(t: NumberEquivalencesTask): Fixture {
    const r: Fixture = { kind, mode: t.mode };
    if (t.mode === 'line') {
        const d = t.distanceGiven ?? Math.abs(t.focus!), op = -t.focus!;
        Object.assign(r, { location: String(t.focus ?? ''), distance: String(d), positions: t.skill === 'absolute' ? (d ? [d, -d] : [0]).map(n => `${n * 13}/13`) : [], opposite: String(op), side: op === 0 ? 'zero' : op > 0 ? 'right' : 'left', sum: '0', draftWorks: t.draft === undefined ? null : t.draft === op });
        if (d === 0)
            stats.zeroLines++;
    }
    else if (t.mode === 'place') {
        let n = t.start;
        const f = 10 ** t.precision, rows = [];
        const digits = (n: number) => [Math.trunc(n / f), ...String(n % f).padStart(t.precision, '0')].map(String);
        for (const e of t.changes) {
            const before = n;
            n += e.operation === 'add' ? e.amount : -e.amount;
            const [a, b] = e.operation === 'sub' && n < 0 ? [e.amount, before] : [before, e.amount];
            assert.ok(a >= 0 && b >= 0, 'authored operand scope');
            const moves = Array.from({ length: t.precision }, (_, i) => {
                const width = 10 ** (t.precision - i);
                // A suffix overflow carries to its next position. A deficient suffix borrows.
                const move = e.operation === 'add' ? a % width + b % width >= width : a % width < b % width;
                if (move) stats[e.operation === 'add' ? 'carryingColumns' : 'borrowingColumns']++;
                return String(Number(move));
            });
            rows.push({ operation: e.operation, left: digits(a), right: digits(b), moves, result: `${n * 7}/${f * 7}`, inverse: `${before * 9}/${f * 9}` });
            if (n < 0)
                stats.negativeDifferences++;
        }
        Object.assign(r, { rows, estimate: { lower: String(Math.floor(n / f)), upper: String(Math.ceil(n / f)), locked: true } });
    }
    else if (t.mode === 'multiply') {
        const [p, s] = t.places;
        Object.assign(r, { left: String(t.left), right: String(t.right), product: String(t.left * t.right), divisor: String(10 ** (p + s)), result: `${t.left * t.right * 3}/${3 * 10 ** (p + s)}`, prediction: t.left === 0 || t.right === 10 ** s ? 'same' : t.right < 10 ** s ? 'smaller' : 'larger', locked: true, unit: t.outputUnit });
    }
    else {
        const [a, b] = t.pairs, known = a[0] === 'x' || b[0] === 'x' ? 1 : 0;
        const scale = div(q(b[known]!), q(a[known]!));
        let x: Q;
        if (b.includes('x'))
            x = mul(q(a[1 - known]!), scale);
        else
            x = div(q(b[1 - known]!), scale);
        const relation = [b, a].map(pair => [pair[1], pair[0]]);
        const sub = (pair: readonly string[]) => div(pair[0] === 'x' ? x : q(pair[0]!), pair[1] === 'x' ? x : q(pair[1]!));
        const work = t.method === 'scale' ? { method: 'scale', direction: 'backward', factor: fmt(div([1n, 1n], scale), 3n) } : { method: 'algebra', coefficient: String(-7n * x[1]), constant: String(-7n * x[0]) };
        Object.assign(r, { relation, work, unknown: fmt(x, 5n), leftCheck: fmt(sub(relation[0]!)), rightCheck: fmt(sub(relation[1]!)) });
        if (t.pairs.some(p => p[1] === 'x'))
            stats.denominatorX++;
    }
    return r;
}
test('independent rational arithmetic, place suffixes and alternate proportional work', () => {
    for (const spec of specs)
        for (const phase of ['independent', 'transfer'] as const)
            for (let seed = 0; seed < 192; seed++) {
                const t = spec.item(rng(seed), phase).task;
                stats.generated++;
                const a = independent(t);
                verdict(t, a, true);
                verdict(t, null, false);
                verdict(t, { kind, mode: 'nonsense' }, false);
                if (t.mode === 'line') {
                    mutated(t, a, ['distance'], '-1');
                    if (t.skill === 'absolute') {
                        mutated(t, a, ['positions'], []);
                        mutated(t, a, ['positions'], [...a.positions, a.positions[0]]);
                    }
                    else {
                        mutated(t, a, ['opposite'], String(t.focus! + 1));
                        mutated(t, a, ['side'], 'bad');
                        mutated(t, a, ['sum'], '1');
                    }
                }
                else if (t.mode === 'place') {
                    mutated(t, a, ['rows', 0, 'result'], '999');
                    mutated(t, a, ['rows', 0, 'operation'], 'bad');
                    mutated(t, a, ['rows', 0, 'moves', 0], String(1 - Number(a.rows[0].moves[0])));
                    mutated(t, a, ['rows', 0, 'left', 1], '11');
                    if (t.goal === 'sub')
                        mutated(t, a, ['rows', 0, 'inverse'], '999');
                    if (t.goal === 'both') {
                        mutated(t, a, ['estimate', 'locked'], false);
                        mutated(t, a, ['rows'], [a.rows[0]]);
                    }
                }
                else if (t.mode === 'multiply') {
                    for (const [key, v] of [['locked', false], ['divisor', '10'], ['result', '999'], ['unit', 'm'], ['prediction', 'bad']] as const)
                        mutated(t, a, [key], v);
                }
                else {
                    mutated(t, a, ['unknown'], '0');
                    mutated(t, a, ['unknown'], '-1');
                    mutated(t, a, ['relation', 0, 1], '0');
                    mutated(t, a, ['leftCheck'], '999');
                    if (a.work.method === 'algebra')
                        mutated(t, a, ['work', 'coefficient'], '0');
                    if (t.method === 'either') {
                        const [u, v] = t.pairs, k = u[0] === 'x' || v[0] === 'x' ? 1 : 0, f = div(q(v[k]!), q(u[k]!));
                        verdict(t, { ...a, work: { method: 'scale', direction: 'forward', factor: fmt(f) } }, true);
                        verdict(t, { ...a, work: { method: 'scale', direction: 'backward', factor: fmt(div([1n, 1n], f)) } }, true);
                    }
                }
            }
    expect(stats).toEqual({ generated: 2688, accepted: 3072, rejected: 17567, negativeDifferences: 92, zeroLines: 26, denominatorX: 192, carryingColumns: 877, borrowingColumns: 1182 });
});
