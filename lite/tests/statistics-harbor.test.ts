import { describe, expect, it } from 'vitest';
import { statisticsHarborEvidence, statisticsHarborSpecs } from '../src/content/statistics-harbor';
import { checkHarborActivity, checkStatisticsHarbor, runHarborExperiment, solutionStatisticsHarbor, wrongStatisticsHarborResponses,
  type HarborReview, type HarborSpace, type StatisticsHarborResponse, type StatisticsHarborTask } from '../src/content/models/statistics-harbor';
import { catalogNode } from '../src/engine/catalog';
import { rng } from '../src/engine/rng';

const kind = 'statistics-harbor' as const;
const context = { title: 'Testi', skills: ['M-DATA-09'] };
const score = checkStatisticsHarbor;
const approve = (task: StatisticsHarborTask, assistance: HarborReview['assistance'] = 'none'): HarborReview => ({
  confirmedByAdult: true, assistance, observations: Object.fromEntries('review' in task ? task.review.rubric.map(criterion => [criterion.id, 'met']) : []),
});
const sample = (id: string, seed: number, phase: 'independent' | 'transfer' = 'independent') =>
  statisticsHarborSpecs.find(node => node.id === id)!.item(rng(seed), phase).task;
const compared = (left: bigint, right: bigint) => left > right ? 'a' as const : left < right ? 'b' as const : 'equal' as const;
const sums = (values: readonly number[]) => values.reduce((a, b) => a + BigInt(b), 0n);

function allPairs(space: HarborSpace): [string, string][] {
  const candidates = space.variant === 'product' ? [space.first, space.second] : [space.symbols, space.symbols];
  const out: [string, string][] = [];
  for (const [i, a] of candidates[0]!.entries()) for (const [j, b] of candidates[1]!.entries()) {
    if (space.variant === 'product' || (space.variant === 'ordered' ? i !== j : i < j)) out.push([a, b]);
  }
  return out;
}

function randomIndex(seed: number, count: number, size: number) {
  const out = [];
  for (let index = 1; index <= count; index++) {
    const x = (seed + Math.imul(0x6d2b79f5, index)) >>> 0;
    const y = Math.imul(x ^ (x >>> 15), x | 1);
    const z = y ^ (y + Math.imul(y ^ (y >>> 7), y | 61));
    const bits = (z ^ (z >>> 14)) >>> 0;
    out.push(Number(BigInt(bits) * BigInt(size) / (1n << 32n)));
  }
  return out;
}
const observed = (task: Extract<StatisticsHarborTask, { mode: 'empirical' }>, id: string) => {
  const trial = task.experiments.find(t => t.id === id)!;
  return randomIndex(trial.seed, trial.count, task.sectors.length).map(i => task.sectors[i]);
};
function medianFraction(values: readonly number[]) {
  const ranks = values.slice().sort((a, b) => a - b);
  return `${ranks[(ranks.length - 1) >> 1]! + ranks[ranks.length >> 1]!}/2`;
}
const count = (values: readonly string[], categories: readonly string[]) => {
  const result = Object.fromEntries(categories.map(label => [label, 0]));
  for (const value of values) result[value] = (result[value] ?? 0) + 1;
  return result;
};

function independent(task: StatisticsHarborTask): StatisticsHarborResponse {
  switch (task.mode) {
    case 'collect': {
      const sites = task.sites.flatMap((site, a) => task.times.map((time, b) => ({ id: `${site.id}-${time.id}`, a, b })));
      const options = Array.from({ length: 1 << sites.length }, (_, bits) => sites.filter((_, index) => (bits & (1 << index)) !== 0));
      const chosen = options.reverse().find(list => list.length === task.budget &&
        task.coverage.every(rule => rule.points.reduce((n, p) => n + Number(list.some(point => point.id === p)), 0) >= rule.minimum))!;
      const visits = chosen.map(({ id, a, b }) => {
        const seed = (task.seed ^ Math.imul(a + 1, 1597334677) ^ Math.imul(b + 1, 122949829)) >>> 0;
        const value = task.variable === 'wind' ? ['Pohjoinen', 'Itä', 'Etelä', 'Länsi'][randomIndex(seed, 1, 4)[0]!]!
          : String(randomIndex(seed, 1, 13)[0]);
        return [id, value] as const;
      });
      return { kind, mode: task.mode, plan: visits.map(([id]) => id), visits: Object.fromEntries(visits), variable: task.variable,
        method: task.variable === 'wind' ? 'vane' : 'count', review: approve(task) };
    }
    case 'structure': {
      const latest = new Map(task.slips.map(slip => [slip.log, slip]));
      const used = [...latest.values()];
      return { kind, mode: task.mode, variable: task.variable, unit: task.unit,
        copies: task.slips.filter(slip => !used.includes(slip)).map(slip => slip.id),
        rows: Object.fromEntries(used.map(slip => [slip.log, { receipt: slip.id, value: slip.value === null ? '' : String(slip.value),
          condition: slip.value === null ? 'missing' : slip.value >= task.usual[0] && slip.value <= task.usual[1] ? 'reading' : 'check' }])) };
    }
    case 'freq': return { kind, mode: task.mode, counts: Object.fromEntries(Object.entries(count(task.values, task.categories)).map(([label, n]) => [label, String(n)])),
      total: String(task.values.length) };
    case 'relative': {
      const [a, b] = task.groups;
      const fraction = (n: number, d: number) => task.format === 'fraction' ? `${2 * n}/${2 * d}` : String(100 * n / d);
      const common = BigInt(a.total * b.total);
      return { kind, mode: task.mode, frequencies: [String(a.value), String(b.value)], ratios: [fraction(a.value, a.total), fraction(b.value, b.total)],
        comparison: compared(BigInt(a.value) * (common / BigInt(a.total)), BigInt(b.value) * (common / BigInt(b.total))) };
    }
    case 'mean': {
      const before = sums(task.values), after = sums([...task.values, task.addition]);
      const n = BigInt(task.values.length);
      const direction = compared(after * n, before * (n + 1n));
      return { kind, mode: task.mode, count: String(n), total: String(before), mean: `${before}/${n}`, newCount: String(n + 1n),
        newMean: `${after}/${n + 1n}`, change: direction === 'a' ? 'rose' : direction === 'b' ? 'fell' : 'equal', meaning: 'equal-share' };
    }
    case 'median': {
      const sorted = [...task.rows].sort((a, b) => a.value - b.value || b.id.localeCompare(a.id));
      const values = sorted.map(row => row.value);
      const ids = new Set([sorted[(values.length - 1) >> 1]!.id, sorted[values.length >> 1]!.id]);
      const before = task.previous && sorted.map(row => row.id === task.previous!.id ? task.previous!.value : row.value);
      return { kind, mode: task.mode, order: sorted.map(row => row.id), middle: [...ids].reverse(),
        median: medianFraction(values), previous: before ? medianFraction(before) : '' };
    }
    case 'mode': {
      const frequency = count(task.values, task.categories);
      const distinct = Object.entries(frequency).filter(([, n]) => n > 0);
      const rank = distinct.slice().sort(([, a], [, b]) => b - a);
      const modes = distinct.length > 1 && new Set(distinct.map(([, n]) => n)).size === 1 ? [] : rank.filter(([, n]) => n === rank[0]![1]).map(([id]) => id);
      return { kind, mode: task.mode, counts: Object.fromEntries(Object.entries(frequency).map(([id, n]) => [id, String(n)])),
        modes, status: modes.length === 0 ? 'none' : modes.length === 1 ? 'one' : 'many' };
    }
    case 'spread': {
      const [a, b] = task.series.map(s => [...s.values].sort((a, b) => a - b));
      const near = [a!, b!].map(values => values.filter(v => v >= task.centre - task.radius && v <= task.centre + task.radius).length);
      return { kind, mode: task.mode, ranges: [String(a!.at(-1)! - a![0]!), String(b!.at(-1)! - b![0]!)],
        near: [String(near[0]), String(near[1])], moreCentral: compared(BigInt(near[0]!), BigInt(near[1]!)) };
    }
    case 'interpret': {
      const [a, b] = task.rows, totals = task.totals;
      return { kind, mode: task.mode, issue: totals ? 'population' : 'axis', compared: task.compareCharts,
        change: String(b.value - a.value), ratios: totals ? [`${a.value}/${totals[0]}`, `${b.value}/${totals[1]}`] : ['', ''],
        comparison: totals ? compared(BigInt(a.value * totals[1]), BigInt(b.value * totals[0])) : null, review: approve(task) };
    }
    case 'chart':
      return { kind, mode: task.mode, draft: { type: 'bar', start: '0', step: '3', top: '15', unit: task.unit, axis: task.axis,
        values: Object.fromEntries(task.rows.map(row => [row.id, String(row.value)])) }, review: approve(task) };
    case 'space': {
      const pairs = allPairs(task.space);
      return { kind, mode: task.mode, pairs: pairs.map(([a, b]) => task.space.variant === 'unordered' ? `${b}|${a}` : `${a}|${b}`),
        count: String(pairs.length) };
    }
    case 'classic': {
      const pairs = allPairs(task.space);
      const match = (name: string) => task.event.grouped ? name.split(' ')[0] === task.event.symbol : name === task.event.symbol;
      const members = pairs.filter(([a, b]) => task.event.test === 'first' ? match(a) : task.event.test === 'equal' ? a === b :
        task.event.test === 'contains' ? match(a) || match(b) : !match(a) && !match(b));
      return { kind, mode: task.mode, members: members.map(x => x.join('|')), favorable: String(members.length), total: String(pairs.length),
        probability: `${3 * members.length}/${3 * pairs.length}`, condition: 'equal-atomic' };
    }
    case 'empirical': {
      const counts = task.experiments.map(test => observed(task, test.id).filter(color => color === task.target).length);
      const model = task.sectors.filter(x => x === task.target).length;
      const common = task.experiments.reduce((p, test) => p * BigInt(test.count), 1n) * BigInt(task.sectors.length);
      const benchmark = BigInt(model) * (common / BigInt(task.sectors.length));
      const distances = task.experiments.map((test, i) => {
        const residue = BigInt(counts[i]!) * (common / BigInt(test.count)) - benchmark;
        return residue < 0n ? -residue : residue;
      });
      return { kind, mode: task.mode, run: task.experiments.map(test => test.id), next: `${model}/${task.sectors.length}`, inference: 'estimate',
        counts: Object.fromEntries(task.experiments.map((test, i) => [test.id, String(counts[i])])),
        ratios: Object.fromEntries(task.experiments.map((test, i) => [test.id, `${counts[i]}/${test.count}`])),
        closest: task.experiments.filter((_, i) => distances.every(d => d >= distances[i]!)).map(test => test.id) };
    }
  }
}

describe('Statistics harbor', () => {
  it('authors thirteen canonical nodes, stable two-family items, and independently valid answers', () => {
    expect(statisticsHarborSpecs).toHaveLength(13);
    for (const node of statisticsHarborSpecs) {
      const families = new Set<string>();
      expect(catalogNode(node.id)).toBeDefined();
      for (const phase of ['guided', 'independent', 'transfer', 'retrieval'] as const) for (let seed = 0; seed < 24; seed++) {
        const { task, tag } = node.item(rng(seed), phase);
        if (phase === 'independent') families.add(tag);
        expect(task).toEqual(node.item(rng(seed), phase).task);
        expect(task.context.skills.every(id => !!catalogNode(id))).toBe(true);
        expect(tag === 'transfer').toBe(phase === 'transfer');
        expect(score(task, independent(task)).ok, `${node.id} ${phase} ${seed}`).toBe(true);
        expect(score(task, solutionStatisticsHarbor(task)).ok).toBe(!('review' in task));
        for (const wrong of wrongStatisticsHarborResponses(task)) expect(score(task, wrong).ok).toBe(false);
      }
      expect(families.size).toBe(2);
      expect(families).toEqual(new Set(statisticsHarborEvidence[node.id]!.families));
      expect(node.validRevs).toEqual([node.rev]);
    }
  });

  it('requires plan coverage and real values before original human-observed justification', () => {
    const task = sample('M79-DATA-COLLECT', 10, 'transfer');
    const a = independent(task);
    if (task.mode !== 'collect' || a.mode !== 'collect') throw Error('Collect fixture');
    expect(a.variable).toBe('wind');
    expect(score(task, a)).toMatchObject({ ok: true, observedByAdult: true });
    expect(score(task, { ...a, review: undefined })).toMatchObject({ ok: false, pendingReview: true });
    expect(score(task, { ...a, review: { ...approve(task), observations: {} } })).toMatchObject({ ok: false, pendingReview: true });
    expect(score(task, { ...a, review: approve(task, 'helped') })).toMatchObject({ ok: true, observedByAdult: true, assisted: true });
    expect(score(task, { ...a, review: { ...approve(task), observations: { evidence: 'not-yet', scope: 'met' } } })).toMatchObject({ ok: false, observedByAdult: true });
    expect(score(task, { ...a, variable: 'visits' })).toMatchObject({ ok: false });
    expect(score(task, { ...a, visits: {} }).pendingReview).toBeUndefined();
    expect(score(task, { ...a, plan: Array(4).fill(a.plan[0]) }).ok).toBe(false);
  });

  it('keeps missing, measured zero, equal independent readings and genuine outliers distinct', () => {
    const task = sample('M79-DATA-STRUCT', 2, 'transfer');
    const answer = independent(task);
    if (task.mode !== 'structure' || answer.mode !== 'structure') throw Error('Structure fixture');
    expect(answer.rows.B?.condition).toBe('missing');
    expect(answer.rows.D).toMatchObject({ value: '0', condition: 'reading' });
    expect(answer.rows.C?.condition).toBe('check');
    expect(score(task, { ...answer, rows: { ...answer.rows, B: { ...answer.rows.B!, value: '0' } } }).ok).toBe(false);
    expect(score(task, { ...answer, rows: { ...answer.rows, C: { ...answer.rows.C!, value: '', condition: 'missing' } } }).ok).toBe(false);
    const alternate = solutionStatisticsHarbor(task);
    if (alternate.mode !== 'structure') throw Error('Structure solution');
    expect(score(task, alternate).ok).toBe(true);
    expect(score(task, { ...alternate, copies: [] }).ok).toBe(false);
  });

  it('checks sample size and relative comparisons separately', () => {
    const task: StatisticsHarborTask = { kind, mode: 'relative', context, format: 'fraction', groups: [
      { id: 'A', label: 'A', value: 4, total: 10 }, { id: 'B', label: 'B', value: 4, total: 20 },
    ] };
    const response = { kind, mode: 'relative', frequencies: ['4', '4'], ratios: ['2/5', '1/5'], comparison: 'a' } satisfies StatisticsHarborResponse;
    expect(score(task, response).ok).toBe(true);
    expect(score(task, { ...response, comparison: 'equal' }).ok).toBe(false);
    expect(score(task, { ...response, ratios: ['4/4', '4/4'] }).ok).toBe(false);
    expect(score({ ...task, format: 'percent' }, { ...response, ratios: ['40', '20'] }).ok).toBe(true);
    expect(score({ ...task, format: 'percent' }, response).ok).toBe(false);
  });

  it('checks both middle ranks, a retained repeated reading, and equal ranges with unequal central counts', () => {
    const task = sample('M79-MEDIAN', 7, 'transfer'), answer = independent(task);
    if (answer.mode !== 'median') throw Error('Median fixture');
    expect(answer.median).toBe(answer.previous);
    expect(score(task, { ...answer, middle: [answer.middle[0]!] }).ok).toBe(false);
    const spread = sample('M79-SPREAD', 7, 'transfer'), proof = independent(spread);
    if (proof.mode !== 'spread') throw Error('Spread fixture');
    expect(proof.ranges[0]).toBe(proof.ranges[1]);
    expect(proof.near[0]).not.toBe(proof.near[1]);
    expect(score(spread, { ...proof, moreCentral: 'equal' }).ok).toBe(false);
    const mean = sample('M79-MEAN', 1, 'transfer'), meanProof = independent(mean);
    if (mean.mode !== 'mean' || meanProof.mode !== 'mean') throw Error('Mean fixture');
    expect(score(mean, { ...meanProof, count: String(new Set(mean.values).size) }).ok).toBe(false);
  });

  it('accepts alternate fair charts while requiring an observed own justification or conclusion', () => {
    const task = sample('M79-DIAGRAM-PROD', 1), good = independent(task);
    if (task.mode !== 'chart' || good.mode !== 'chart') throw Error('Chart fixture');
    expect(score(task, { ...good, draft: { ...good.draft, type: 'line', step: '2', top: '16' } }).ok).toBe(true);
    expect(score(task, { ...good, draft: { ...good.draft, start: '2' } }).ok).toBe(false);
    expect(score(task, { ...good, review: undefined }).pendingReview).toBe(true);
    const interp = sample('M79-DIAGRAM-INTERP', 7, 'transfer'), report = independent(interp);
    if (report.mode !== 'interpret') throw Error('Interpret fixture');
    expect(score(interp, { ...report, compared: false }).ok).toBe(false);
    expect(score(interp, { ...report, review: undefined }).pendingReview).toBe(true);
  });

  it('does not collapse opposite ordered pairs or count colors as equally likely outcomes', () => {
    const ordered: StatisticsHarborTask = { kind, mode: 'space', context, space: { variant: 'ordered', symbols: ['A', 'B', 'C'] } };
    const own = independent(ordered);
    if (own.mode !== 'space') throw Error('Space fixture');
    const unordered: StatisticsHarborTask = { ...ordered, space: { variant: 'unordered', symbols: ['A', 'B', 'C'] } };
    expect(score(ordered, independent(unordered)).ok).toBe(false);
    expect(score(unordered, independent(unordered)).ok).toBe(true);
    expect(score(ordered, { ...own, pairs: [...own.pairs.slice(0, -1), own.pairs[0]!] }).ok).toBe(false);
    const task = sample('M79-PROB-CLASSIC', 5, 'transfer'), a = independent(task);
    if (a.mode !== 'classic') throw Error('Classic fixture');
    expect(score(task, { ...a, condition: 'equal-categories' }).ok).toBe(false);
    expect(score(task, { ...a, members: a.members.slice(1) }).ok).toBe(false);
  });

  it('runs deterministic different samples without guaranteeing that the larger is closer', () => {
    let smallWon = false;
    const pattern = new Set<string>();
    for (let seed = 0; seed < 60; seed++) {
      const task = sample('M79-PROB-EMP', seed, 'transfer'), a = independent(task);
      if (task.mode !== 'empirical' || a.mode !== 'empirical') throw Error('Empirical fixture');
      const one = runHarborExperiment(task, 'A')!, two = runHarborExperiment(task, 'B')!;
      expect(one.sample).toEqual(observed(task, 'A'));
      expect(two.sample).toEqual(observed(task, 'B'));
      pattern.add(JSON.stringify([one.hits, two.hits]));
      if (a.closest.length === 1 && a.closest[0] === 'A') smallWon = true;
      expect(checkHarborActivity(task, { ...a, run: ['A'] }).ok).toBe(false);
      expect(score(task, { ...a, inference: 'compensation' }).ok).toBe(false);
      expect(score(task, { ...a, next: '1' }).ok).toBe(false);
    }
    expect(pattern.size).toBeGreaterThan(15);
    expect(smallWon).toBe(true);
  });
});
