import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareRecords } from './serialized181.mjs';
const row = (seed, item = '{"task":{"answer":4}}') => ['KC', 'independent', seed, item];
test('detects one answer change while retaining its case identity', () => {
  const result = compareRecords([row(0), row(1)], [row(0), row(1, '{"task":{"answer":5}}')]);
  assert.equal(result.records, 2); assert.equal(result.changed, 1);
  assert.deepEqual(result.perNode, { KC: 1 }); assert.equal(result.examples[0].seed, 1);
});
test('rejects missing cases and swapped seeds rather than pairing unrelated items', () => {
  assert.throws(() => compareRecords([row(0)], []), /Record count differs/);
  assert.throws(() => compareRecords([row(0), row(1)], [row(1), row(0)]), /Case identity\/order differs/);
});
test('retains byte differences in serialized property order', () => {
  assert.equal(compareRecords([row(0, '{"a":1,"b":2}')], [row(0, '{"b":2,"a":1}')]).changed, 1);
});
test('detects post-call random-state drift with identical item case keys', () => {
  assert.equal(compareRecords([['KC', 'guided', 0, 0.25]], [['KC', 'guided', 0, 0.5]]).changed, 1);
});
