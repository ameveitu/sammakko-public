// @ts-nocheck: node-only test (the project has no @types/node)
// Content sweep over every lesson (review U07). Runs in the normal suite.
//   npx vitest run tests/sweep.test.ts                      all 181 lessons
//   NODE_IDS=M-TH-08,M-GEO-04 npx vitest run tests/sweep.test.ts
//   UPDATE_SWEEP=1 npx vitest run tests/sweep.test.ts       rewrite the quality baseline
// An empty NODE_IDS is an error, never a silent zero-node pass.
// Hard failures: crash, own solution rejected, a wrong choice with the same value as the answer,
// duplicate place cards.
// Quality flags are compared with tests/sweep-baseline.json: none may be added. They are missing
// why/hint/whyAt texts, and deadWhyAt: a misconception message keyed on the right answer, which the
// checker never shows (a right answer is accepted first) but which hides that the misconception
// gives the same number in that case.
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { NODES } from '../src/content';
import { check, solution } from '../src/engine/check';
import { rng } from '../src/engine/rng';
import type { Task } from '../src/engine/types';

const BASE = new URL('./sweep-baseline.json', import.meta.url);
const SEEDS = Number(process.env.SWEEP_SEEDS ?? 100);
const PHASES = ['guided', 'independent', 'transfer', 'retrieval'] as const;

function targets(): string[] {
  const raw = process.env.NODE_IDS;
  if (raw === undefined) return Object.keys(NODES);
  const ids = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (!ids.length) throw new Error('NODE_IDS is set but empty: name lessons, or unset it to sweep all of them.');
  const unknown = ids.filter((id) => !NODES[id]);
  if (unknown.length) throw new Error(`Unknown lessons: ${unknown.join(', ')}`);
  return ids;
}

/** Value of a plain arithmetic option ("3 × 4", "12 : 2", "2 + 2 + 2"), else NaN. */
function value(t?: string): number {
  if (typeof t !== 'string' || /\d,\s/.test(t)) return NaN; // "(−3, 0)" is a point, not a number
  const e = t.replace(/(\d+)\/(\d+)/g, '($1/$2)').replace(/−/g, '-').replace(/[×·]/g, '*').replace(/:/g, '/').replace(/,/g, '.').replace(/\s/g, '');
  if (!/^[\d.+\-*/()]+$/.test(e) || !/[+\-*/]/.test(e.slice(1))) return NaN;
  try { return Function(`return (${e})`)() as number; } catch { return NaN; }
}

function sweep(id: string) {
  const n = NODES[id]!;
  const hard: string[] = [];
  const flags: Record<string, number> = {};
  const flag = (k: string) => { flags[k] = (flags[k] ?? 0) + 1; };
  let items = 0;
  for (let s = 0; s < SEEDS; s++) for (const ph of PHASES) {
    const where = `${ph}#${s}`;
    let q;
    try { q = n.item(rng(s), ph === 'retrieval' ? 'independent' : ph); } catch (e) { hard.push(`crash ${where} ${e}`); continue; }
    items++;
    const t = q.task as Task & Record<string, any>;
    try { if (!check(t, solution(t)).ok) hard.push(`own solution rejected ${where} ${t.kind}`); } catch (e) { hard.push(`check crash ${where} ${e}`); }
    if (!q.hint) flag('nohint');
    if (t.kind === 'choice') {
      const a = value(t.options[t.answer]?.big ?? t.options[t.answer]?.text);
      // Options that all have the same value ask about the form (how to split 7), not the value.
      const sameForm = t.options.every((o: any) => Math.abs(value(o.big ?? o.text) - a) < 1e-9);
      t.options.forEach((o: any, i: number) => {
        if (i === t.answer) return;
        if (!t.why?.[i]) flag('choice-nowhy');
        const v = value(o.big ?? o.text);
        if (!sameForm && Number.isFinite(a) && Math.abs(v - a) < 1e-9) hard.push(`equal-valued option ${where} "${o.big ?? o.text}"`);
      });
    }
    if (t.kind === 'multi' && t.options.some((_: unknown, i: number) => !t.why?.[i])) flag('multi-nowhy');
    if (t.kind === 'place') {
      const ids = t.tokens.map((k: any) => k.id), labels = t.tokens.map((k: any) => `${k.text ?? ''}|${k.art ?? ''}`);
      if (new Set(ids).size !== ids.length || new Set(labels).size !== labels.length) hard.push(`duplicate place card ${where}`);
    }
    if (t.kind === 'numeric' || t.kind === 'line') {
      if (!t.whyAt || !Object.keys(t.whyAt).length) flag('nowhyAt');
      else if (Object.keys(t.whyAt).some((k) => Math.abs(+k - t.answer) <= (t.tolerance ?? 1e-9))) flag('deadWhyAt');
    }
  }
  return { items, hard, flags };
}

describe('content sweep', () => {
  const ids = targets();
  const base: Record<string, Record<string, number>> = existsSync(BASE) ? JSON.parse(readFileSync(BASE, 'utf8')) : {};
  const seen: Record<string, Record<string, number>> = {};
  for (const id of ids) {
    it(id, () => {
      const r = sweep(id);
      seen[id] = r.flags;
      if (r.hard.length) process.stdout.write(`SWEEP ${id}: ${r.hard.length} hard\n  ${r.hard.slice(0, 4).join('\n  ')}\n`);
      expect(r.items).toBe(SEEDS * PHASES.length);
      expect(r.hard.slice(0, 5).join(" / ")).toBe("");
      if (!process.env.UPDATE_SWEEP && SEEDS === 100) {
        // Quality flags may shrink, never grow.
        for (const [k, c] of Object.entries(r.flags)) expect(c, `${id} ${k}`).toBeLessThanOrEqual(base[id]?.[k] ?? 0);
      }
    });
  }
  it('baseline file', () => {
    expect(ids.length).toBeGreaterThan(0);
    if (process.env.UPDATE_SWEEP && ids.length === Object.keys(NODES).length) {
      const out = Object.fromEntries(Object.entries(seen).filter(([, f]) => Object.keys(f).length).sort(([a], [b]) => a.localeCompare(b)));
      writeFileSync(BASE, JSON.stringify(out, null, 1) + '\n');
    }
  });
});
