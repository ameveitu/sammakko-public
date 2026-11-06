// Microgame checking: equivalent forms pass, solving instead of forming fails,
// duplicate and missing list rows are named, fraction answers accept equal values.
import { describe, expect, it } from 'vitest';
import { check } from '../src/engine/check';
import { sameEquation, sameExpr, sameFact } from '../src/engine/expr';
import type { Task } from '../src/engine/types';
import { audit } from '../src/content/audit';
import { DECL } from '../src/content/families';

const build = (mode: 'expr' | 'eq' | 'fact', target: string, seq: string[]) =>
  check({ kind: 'build', mode, target, tokens: [] } as Task, { kind: 'build', seq });

describe('expression parser', () => {
  it('accepts equivalent expressions and implicit products', () => {
    expect(sameExpr('3n + 5', '5 + 3 · n')).toBe(true);
    expect(sameExpr('3(n + 5)', '3n + 15')).toBe(true);
    expect(sameExpr('3(n + 5)', '3n + 5')).toBe(false);
    expect(sameExpr('2,5 · a', '5a : 2')).toBe(true);
  });
  it('equations are equivalent up to rearrangement', () => {
    expect(sameEquation('3x + 4 = 19', '19 = 4 + 3x')).toBe(true);
    expect(sameEquation('3x + 4 = 19', '3x = 19 − 4')).toBe(true);
    expect(sameEquation('3x + 4 = 19', '3(x + 4) = 19')).toBe(false);
  });
  it('a fact must be true and use the same numbers and operations', () => {
    expect(sameFact('4 + 2 = 6', '2 + 4 = 6')).toBe(true);
    expect(sameFact('6 = 2 + 4', '2 + 4 = 6')).toBe(true);
    expect(sameFact('2 + 4 = 7', '2 + 4 = 6')).toBe(false);
    expect(sameFact('6 − 2 = 4', '2 + 4 = 6')).toBe(false);
  });
});

describe('build family checking', () => {
  it('forming, not solving: x = 5 is rejected with a reason', () => {
    const r = build('eq', '3x + 4 = 19', ['x', '=', '5']);
    expect(r.ok).toBe(false);
    expect(r.why).toMatch(/tilanteen luvuista/);
    expect(build('eq', '3x + 4 = 19', ['19', '=', '3', 'x', '+', '4']).ok).toBe(true);
  });
  it('names the "=" mistake', () => {
    expect(build('expr', '3n + 5', ['3', 'n', '+', '5', '=']).why).toMatch(/yhtäsuuruusmerkkiä/);
    expect(build('eq', '3x + 4 = 19', ['3', 'x', '+', '4']).why).toMatch(/yksi yhtäsuuruusmerkki/);
  });
});

describe('tally, list and fraction checking', () => {
  const tally: Task = { kind: 'tally', items: ['a', 'b', 'a'], cats: [{ key: 'a', label: 'Sorsa', icon: '🦆' }, { key: 'b', label: 'Kala', icon: '🐟' }] };
  it('tally names the category that is off', () => {
    expect(check(tally, { kind: 'tally', counts: { a: 2, b: 1 } }).ok).toBe(true);
    expect(check(tally, { kind: 'tally', counts: { a: 1, b: 1 } }).why).toMatch(/Sorsa: havaintoja on 2, merkkejä 1/);
  });
  const combos: Task = { kind: 'combos', a: ['h1', 'h2'], b: ['s1', 's2', 's3'], aLabel: 'hattu', bLabel: 'huivit' };
  it('list: duplicate and missing rows are named; order does not matter', () => {
    const all: [number, number][] = [[1, 2], [0, 0], [0, 1], [0, 2], [1, 0], [1, 1]];
    expect(check(combos, { kind: 'combos', pairs: all }).ok).toBe(true);
    expect(check(combos, { kind: 'combos', pairs: [...all.slice(1), [0, 0]] }).why).toMatch(/kahdesti/);
    expect(check(combos, { kind: 'combos', pairs: all.slice(2) }).why).toMatch(/puuttuu 2 yhdistelmää/);
  });
  it('fraction: equal values pass, zero denominator is named', () => {
    const f: Task = { kind: 'frac', n: 5, d: 6 };
    expect(check(f, { kind: 'frac', n: 10, d: 12 }).ok).toBe(true);
    expect(check(f, { kind: 'frac', n: 6, d: 5 }).ok).toBe(false);
    expect(check(f, { kind: 'frac', n: 5, d: 0 }).why).toMatch(/nolla/);
  });
});

describe('registry limits name families that exist', () => {
  const rows = audit(80);
  it('every "perhe X" / "perheessä X" in a limit text is a real tag of that lesson', () => {
    let n = 0;
    for (const [key, d] of Object.entries(DECL)) {
      const node = key.split('/')[0]!;
      for (const m of (d.limit ?? '').matchAll(/perhe(?:essä)? ([a-z]+)/gi)) {
        n++;
        expect(rows.some((r) => r.node === node && r.tag === m[1]), `${key}: ${m[1]}`).toBe(true);
      }
    }
    expect(n).toBeGreaterThanOrEqual(9);
  });
  it('new microgame kinds are used in the lessons that promise them', () => {
    const kinds = (id: string) => rows.filter((r) => r.node === id).flatMap((r) => r.kinds);
    expect(kinds('M-REP-04')).toContain('build');
    expect(kinds('M79-EXPR-FORM')).toContain('build');
    expect(kinds('M79-EQ1-FORM')).toContain('build');
    expect(kinds('M-DATA-02')).toContain('tally');
    expect(kinds('M-TH-07')).toContain('combos');
    expect(kinds('M79-FRAC-DIV')).toContain('frac');
  });
});

describe('build in exact order (counting words)', () => {
  const t: Task = { kind: 'build', tokens: ['kolme', 'yksi', 'kaksi'], target: 'yksi kaksi kolme', mode: 'seq' };
  const say = (...seq: string[]) => check(t, { kind: 'build', seq });
  it('only the exact order is right, and the feedback names the slip', () => {
    expect(say('yksi', 'kaksi', 'kolme').ok).toBe(true);
    expect(say('yksi', 'kolme', 'kaksi').why).toMatch(/Kohdassa 2 pitäisi olla kaksi/);
    expect(say('yksi', 'kolme').why).toMatch(/Kaksi jäi välistä/);
    expect(say('yksi', 'kaksi').why).toMatch(/seuraavaksi tulee kolme/);
    expect(say('yksi', 'kaksi', 'kolme', 'kolme').why).toMatch(/ylimääräinen/);
  });
});

describe('ribbon feedback names the start-point trap', () => {
  it('a shorter ribbon that only reaches further because it starts later', () => {
    const t: Task = { kind: 'ribbons', a: 4, b: 6, offsetA: 9, offsetB: 0 };
    const res = check(t, { kind: 'ribbons', choice: 'A' });
    expect(res.ok).toBe(false);
    expect(res.why).toMatch(/alkaa myöhemmin/);
    expect(check(t, { kind: 'ribbons', choice: '=' }).why).toMatch(/eivät ole yhtä pitkät/);
  });
});

describe('measuring by laying unit pieces', () => {
  it('stops exactly at the end of the ribbon', () => {
    const t: Task = { kind: 'iterate', len: 5 };
    expect(check(t, { kind: 'iterate', count: 5 }).ok).toBe(true);
    expect(check(t, { kind: 'iterate', count: 4 }).why).toMatch(/ei yllä loppuun/);
    expect(check(t, { kind: 'iterate', count: 6 }).why).toMatch(/yli/);
  });
});

describe('number line feedback for typical wrong points', () => {
  it('uses the task-specific reason when given', () => {
    const t: Task = { kind: 'line', min: 0, max: 10, step: 1, answer: 7, whyAt: { 5: 'Keppi ei ala nollasta.' } };
    expect(check(t, { kind: 'line', value: 5 }).why).toBe('Keppi ei ala nollasta.');
    expect(check(t, { kind: 'line', value: 7 }).ok).toBe(true);
  });
});
