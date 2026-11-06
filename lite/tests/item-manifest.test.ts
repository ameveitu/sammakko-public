// @ts-nocheck: node-only test (the project has no @types/node)
// Item manifest (review U08): a hash of each lesson's generated items, per revision.
// If a lesson's items change while its `rev` stays the same, old answers would replay as different
// items. Then either bump the lesson's rev (and keep the old one in validRevs) or, if the change is
// cosmetic only, regenerate:  UPDATE_MANIFEST=1 npx vitest run tests/item-manifest.test.ts
import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { NODES } from '../src/content';
import { rng } from '../src/engine/rng';

const FILE = new URL('./item-manifest.json', import.meta.url);
const PHASES = ['guided', 'independent', 'transfer'] as const;
const SEEDS = 20;

/** JSON without functions or DOM-only values; key order as generated. */
const plain = (v: unknown) => JSON.stringify(v, (_k, x) => (typeof x === 'function' || typeof x === 'symbol' ? undefined : x));

function hash(id: string): string {
  const n = NODES[id]!;
  const h = createHash('sha256');
  for (let s = 0; s < SEEDS; s++) for (const ph of PHASES) h.update(plain(n.item(rng(s), ph)) + '\n');
  return h.digest('hex').slice(0, 16);
}

describe('item manifest', () => {
  const old: Record<string, { rev: string; hash: string }> = existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : {};
  const now: Record<string, { rev: string; hash: string }> = {};
  for (const id of Object.keys(NODES).sort()) now[id] = { rev: NODES[id]!.rev ?? '', hash: hash(id) };

  it('generation is deterministic', () => {
    for (const id of Object.keys(NODES)) expect(hash(id), id).toBe(now[id]!.hash);
  });

  if (process.env.UPDATE_MANIFEST) {
    it('write manifest', () => { writeFileSync(FILE, JSON.stringify(now, null, 1) + '\n'); });
    return;
  }

  it('manifest covers every lesson', () => {
    expect(Object.keys(old).sort()).toEqual(Object.keys(now));
  });
  it('items change only with a new rev', () => {
    const silent = Object.keys(now).filter((id) => old[id] && old[id].rev === now[id].rev && old[id].hash !== now[id].hash);
    expect(silent, 'items changed without a rev bump').toEqual([]);
  });
});
