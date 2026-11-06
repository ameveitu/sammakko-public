import { describe, expect, it } from 'vitest';
import { rng } from '../src/engine/rng';
import { check, solution, wrongs } from '../src/engine/check';
import type { Phase } from '../src/engine/types';
import { inquiryIslandsSpecs } from '../src/content/inquiry-islands';
import { EXPEDITION_NODES, EXPEDITION_EVIDENCE } from '../src/content/expedition';
import type { InquiryIslandsTask } from '../src/content/models/inquiry-islands';

const phases: Phase[] = ['guided', 'independent', 'transfer', 'retrieval'];
const NEW = ['SCI-ENV-OBS-01', 'SCI-ENV-DESCRIBE-01', 'SCI-ENV-COMPARE-02', 'SCI-ENV-CLASSIFY-01', 'SCI-ENV-COMPARE-01', 'SCI-ENV-QUESTION-01', 'SCI-ENV-PLAN-01', 'SCI-ENV-EXP-01', 'SCI-ENV-CAUSE-01', 'ENV-PHY-CAUSE-MOTION-01', 'SCI-ENV-MODEL-01', 'SCI-ENV-MODEL-CREATE-01', 'SCI-ENV-MODEL-REVISE-01', 'SCI-ENV-CONCL-01', 'SCI-ENV-EVAL-01'];

describe('Inquiry15 registration', () => {
  it('adds exactly fifteen new nodes and replaces only SCI-ENV-MODEL-02 with its v2 revision', () => {
    expect(inquiryIslandsSpecs.map(s => s.id).sort()).toEqual([...NEW, 'SCI-ENV-MODEL-02'].sort());
    // The Saaristo theory-book layer wraps each spec; ?full=1 still serves the spec itself.
    for (const spec of inquiryIslandsSpecs) {
      const node = EXPEDITION_NODES[spec.id]!;
      expect(node.light, spec.id).toBe(true);
      expect(node.rev, spec.id).toBe(`${spec.rev}-kevyt1`);
    }
    expect(inquiryIslandsSpecs.find(s => s.id === 'SCI-ENV-MODEL-02')!.rev).toBe('inquiry-islands-sci-env-model-02-v2');
    expect(EXPEDITION_EVIDENCE['SCI-ENV-MODEL-02']!.limit).toMatch(/V2/);
  });
});

describe('Inquiry15 generated items', () => {
  it('accepts the oracle response, rejects every countermodel and keeps adult review pending', () => {
    for (const spec of inquiryIslandsSpecs) for (const phase of phases) for (let seed = 0; seed < 10; seed++) {
      const task = spec.item(rng(seed), phase).task;
      const verdict = check(task, solution(task)) as { ok: boolean; pendingReview?: true };
      expect(verdict.ok || verdict.pendingReview, `${spec.id} ${phase} ${seed}`).toBe(true);
      for (const wrong of wrongs(task)) expect((check(task, wrong) as { ok: boolean }).ok, `${spec.id} ${phase} ${seed}`).toBe(false);
    }
  });
  it('has at least eight scientifically distinct situations per node', () => {
    for (const spec of inquiryIslandsSpecs) {
      const runs = new Set<string>();
      for (let seed = 0; seed < 40; seed++) runs.add((spec.item(rng(seed), 'independent').task as InquiryIslandsTask).run);
      expect(runs.size, spec.id).toBeGreaterThanOrEqual(8);
    }
  });
});

