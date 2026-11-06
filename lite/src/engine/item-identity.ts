import type { Item } from './types';

/** Canonical structured author data. Rendering callbacks and learner responses are excluded. */
function canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().filter(key => record[key] !== undefined && typeof record[key] !== 'function')
    .map(key => `${JSON.stringify(key)}:${canonical(record[key])}`).join(',')}}`;
}

/** Detects exact structured item repeats across different seeds and family tags.
 * This is a compact local identity, not a security signature or a proof that two
 * different items assess different concepts. Authors still review real variation.
 */
export function itemIdentity(item: Item): string {
  const data = canonical({ task: item.task, say: item.say, scn: item.scn, ...(item.basis === undefined ? {} : { basis: item.basis }),
    sceneModel: (item as Item & { sceneModel?: unknown }).sceneModel });
  let hash = 0xcbf29ce484222325n;
  for (let i = 0; i < data.length; i++) {
    hash ^= BigInt(data.charCodeAt(i));
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return `item1:${data.length}:${hash.toString(16).padStart(16, '0')}`;
}
