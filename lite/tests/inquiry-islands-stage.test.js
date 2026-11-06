import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { rng } from '../src/engine/rng';
import { solution } from '../src/engine/check';
import { inquiryIslandsSpecs } from '../src/content/inquiry-islands';
import { inquiryIslandsScene } from '../src/content/models/inquiry-islands-scene';
import { mountInquiryIslandsStage } from '../src/world/inquiry-islands-stage.js';

describe('Inquiry15 3D stage', () => {
  it('shows only learner-operated apparatus, never adult text or target answers, and disposes completely', () => {
    let staged = 0;
    for (const spec of inquiryIslandsSpecs) for (let seed = 0; seed < 6; seed++) {
      const task = spec.item(rng(seed), 'independent').task;
      if (task.mode !== 'experiment' && task.mode !== 'model') { expect(inquiryIslandsScene(task)).toBeUndefined(); continue; }
      const answer = solution(task);
      for (const scene of [inquiryIslandsScene(task), inquiryIslandsScene(task, answer)]) {
        const text = JSON.stringify(scene);
        expect(text).not.toMatch(/"(review|rubric|confirmedByAdult|forecast|prediction|probe|correspondences|missingFeatures)":/);
        if (task.review) expect(text).not.toContain(task.review.model);
        const parent = new THREE.Group(), stage = mountInquiryIslandsStage(parent, scene);
        expect(stage.snapshot()).toMatchObject({ kind: 'inquiry-islands', mode: scene.mode });
        expect(parent.children).toHaveLength(1);
        stage.dispose(); expect(parent.children).toHaveLength(0); staged++;
      }
      const empty = inquiryIslandsScene(task);
      if (empty.mode === 'experiment') expect(empty.trials.every(t => t.records.length === 0 && !t.observed)).toBe(true);
      else expect(empty.model).toBeNull();
      const done = inquiryIslandsScene(task, answer);
      if (done.mode === 'experiment') expect(done.trials.every(t => t.records.length > 0)).toBe(true);
      else { expect(done.model).not.toBeNull(); expect(done.tests.length).toBeGreaterThan(0); }
    }
    expect(staged).toBeGreaterThan(40);
  });
  it('ignores malformed or foreign actions instead of projecting them', () => {
    const spec = inquiryIslandsSpecs.find(s => s.id === 'SCI-ENV-EXP-01'), task = spec.item(rng(3), 'independent').task;
    const answer = solution(task);
    const foreign = { ...answer, actions: answer.actions.map(a => ({ ...a, run: 'someone-else' })) };
    expect(inquiryIslandsScene(task, foreign)).toEqual(inquiryIslandsScene(task));
  });
});
