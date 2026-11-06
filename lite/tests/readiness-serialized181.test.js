import { createHash } from 'node:crypto';
import { expect, test } from 'vitest';
import { NODES } from '../src/content/index';
import { rng } from '../src/engine/rng';

// Reviewed at the 2026-11-06 release checkpoint. JSON covers the generated questions,
// answer keys and feedback; drawing functions need a separate browser check.
const baseline = '443fb548767938c84670ec45101e45fa3d58912d669d537705e11c68e538f76a';
test('the 181 classic generators match their reviewed serialized items', () => {
  const digest = createHash('sha256');
  const ids = Object.keys(NODES).sort();
  const phases = ['guided', 'independent', 'transfer', 'retrieval'];
  const context = { knownChecked() { throw Error('Original content consulted learner knowledge'); } };
  let count = 0;
  expect(ids).toHaveLength(181);
  for (const id of ids) for (const phase of phases) for (let seed = 0; seed < 128; seed++) {
    const serialized = JSON.stringify(NODES[id].item(rng(seed), phase, context));
    digest.update(JSON.stringify([id, phase, seed, serialized]));
    count++;
  }
  expect(count).toBe(92672);
  expect(digest.digest('hex')).toBe(baseline);
}, 120000);

test('every decimal-division slot has exactly one mathematically equivalent card', () => {
  const quotient = text => {
    const [a, b] = text.replaceAll(',', '.').split(' : ').map(Number);
    return a / b;
  };
  for (const phase of ['guided', 'independent', 'retrieval']) {
    let checked = 0;
    for (let seed = 0; seed < 128; seed++) {
      const {task} = NODES['M79-DEC-DIV'].item(rng(seed), phase);
      if (task.kind !== 'place') continue;
      for (const slot of task.slots) {
        const matches = task.tokens.filter(token => Math.abs(quotient(slot.text) - quotient(token.text)) < 1e-9);
        expect(matches.map(token => token.id)).toEqual([task.answer[slot.id]]);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(0);
  }
});
