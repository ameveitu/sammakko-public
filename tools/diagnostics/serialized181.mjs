#!/usr/bin/env node
// Read-only diagnosis: output artifacts are explicit and never become approved baselines.
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const hash = data => createHash('sha256').update(data).digest('hex');
const phases = ['guided', 'independent', 'transfer', 'retrieval'];
export function compareRecords(left, right) {
  if (left.length !== right.length) throw Error(`Record count differs: ${left.length} / ${right.length}`);
  const result = { records: left.length, changed: 0, perNode: {}, examples: [] };
  for (let i = 0; i < left.length; i++) {
    const a = left[i], b = right[i];
    if (JSON.stringify(a.slice(0, 3)) !== JSON.stringify(b.slice(0, 3)))
      throw Error(`Case identity/order differs at record ${i}: ${JSON.stringify(a.slice(0, 3))} / ${JSON.stringify(b.slice(0, 3))}`);
    if (JSON.stringify(a) === JSON.stringify(b)) continue;
    result.changed++;
    result.perNode[a[0]] = (result.perNode[a[0]] ?? 0) + 1;
    if (result.examples.length < 5) result.examples.push({ id: a[0], phase: a[1], seed: a[2], before: a[3], after: b[3] });
  }
  return result;
}
async function lines(path) {
  return (await readFile(path, 'utf8')).trimEnd().split('\n').filter(Boolean).map(line => JSON.parse(line));
}
export async function snapshot(liteRoot, prefix) {
  const root = resolve(liteRoot), out = resolve(prefix);
  // Resolve the caller's installed, locked Lite toolchain, including for git-archive roots.
  const require = createRequire(resolve(root, 'package.json'));
  const { createServer } = await import(pathToFileURL(require.resolve('vite')));
  const server = await createServer({ root, configFile: false, appType: 'custom', server: { middlewareMode: true, hmr: false, ws: false } });
  try {
    const { NODES, CONTENT_REV } = await server.ssrLoadModule(resolve(root, 'src/content/index.ts'));
    const { rng } = await server.ssrLoadModule(resolve(root, 'src/engine/rng.ts'));
    const ids = Object.keys(NODES).sort(), itemRows = [], rngRows = [];
    if (ids.length !== 181) throw Error(`Expected 181 classic IDs, got ${ids.length}`);
    const context = { knownChecked() { throw Error('Original content consulted learner knowledge'); } };
    const digest = createHash('sha256');
    for (const id of ids) for (const phase of phases) for (let seed = 0; seed < 128; seed++) {
      const random = rng(seed), serialized = JSON.stringify(NODES[id].item(random, phase, context));
      const row = JSON.stringify([id, phase, seed, serialized]);
      itemRows.push(row); digest.update(row);
      rngRows.push(JSON.stringify([id, phase, seed, random.next()]));
    }
    const items = itemRows.join('\n') + '\n', randomStates = rngRows.join('\n') + '\n';
    const nodes = Object.fromEntries(ids.map(id => [id, { rev: NODES[id].rev ?? null, validRevs: NODES[id].validRevs ?? null }]));
    const summary = { kind: 'diagnostic-only-not-approval', root, contentRev: CONTENT_REV, ids: ids.length, phases, seeds: [0, 127], records: itemRows.length,
      testDigest: digest.digest('hex'), jsonlSha256: hash(items), rngJsonlSha256: hash(randomStates), nodeVersion: process.version,
      note: 'Items use the unchanged readiness test protocol. Drawing functions are omitted by JSON.stringify. RNG artifacts store the next draw after item generation. Revisions are separate metadata.' };
    await writeFile(out + '.items.jsonl', items);
    await writeFile(out + '.rng.jsonl', randomStates);
    await writeFile(out + '.nodes.json', JSON.stringify(nodes, null, 2) + '\n');
    await writeFile(out + '.summary.json', JSON.stringify(summary, null, 2) + '\n');
    return summary;
  } finally { await server.close(); }
}
async function main(args) {
  const [command, left, right] = args;
  if (!left || !right) throw Error('Usage: serialized181.mjs snapshot <lite-root> <output-prefix> | compare <left-prefix> <right-prefix>');
  if (command === 'snapshot') return snapshot(left, right);
  if (command !== 'compare') throw Error('Unknown command: ' + command);
  const items = compareRecords(await lines(left + '.items.jsonl'), await lines(right + '.items.jsonl'));
  const randomStates = compareRecords(await lines(left + '.rng.jsonl'), await lines(right + '.rng.jsonl'));
  const a = JSON.parse(await readFile(left + '.nodes.json')), b = JSON.parse(await readFile(right + '.nodes.json'));
  const nodeChanges = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(id => JSON.stringify(a[id]) !== JSON.stringify(b[id])).map(id => ({ id, before: a[id], after: b[id] }));
  return { kind: 'diagnostic-only-not-approval', items, randomStates, nodeChanges };
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url)
  main(process.argv.slice(2)).then(result => console.log(JSON.stringify(result, null, 2))).catch(error => { console.error(error.message); process.exitCode = 1; });
