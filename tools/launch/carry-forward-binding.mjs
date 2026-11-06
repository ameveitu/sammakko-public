// Carry the existing 181 software review decisions over a Lite source change that cannot affect lessons.
// Run after `sync-current-sources.mjs --apply`. It refuses unless, for every node, the only metadata
// change against the base commit is the source binding (revision, currentSource.liteGeneratorSha256,
// currentSource.sourceHashes) and the lesson body, module and assets are byte-identical.
// It grants nothing new: human validation stays pending, the original reviewer and note are kept.
//   node tools/launch/carry-forward-binding.mjs --base <commit> --reason "…" --by "…" [--apply]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadPackages } from '../../public/oppitunnit/lesson-network/content.mjs';
import { sourceBindings } from './source-bindings.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const arg = (n) => { const i = process.argv.indexOf('--' + n); return i < 0 ? null : process.argv[i + 1]; };
const base = arg('base'), reason = arg('reason'), by = arg('by'), apply = process.argv.includes('--apply');
if (!base || !reason || !by) throw Error('Usage: --base <commit> --reason "…" --by "…" [--apply]');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 26 });
const network = 'public/oppitunnit/lesson-network';
const decisionsFile = path.join(root, 'docs/releases/launch/review-decisions.json');
const decisions = JSON.parse(fs.readFileSync(decisionsFile));
const ids = JSON.parse(fs.readFileSync(path.join(root, network, 'reference/inputs/mvp-scope-181.json'))).selected_ids;
const packages = loadPackages(path.join(root, network), ids);
const now = sourceBindings(root);
if (decisions.lessonGeneratorSha256 !== now.lessonGeneratorSha256) throw Error('Lesson generator changed: needs a real review, not a carry-forward');

// Only these Lite paths may differ from the base; anything else needs a real review.
const changedLite = git('diff', '--name-only', base, '--', 'lite/src').trim().split('\n').filter(Boolean);
const allowed = /^lite\/src\/(audio\/|ui\/speech\.ts$|ui\/paja\.ts$|ui\/flight\.ts$|ui\/lesson\.ts$|ui\/widgets\.ts$|main\.ts$)/;
const outside = changedLite.filter((p) => !allowed.test(p));
if (outside.length) throw Error('Lite changes outside the audio layer: ' + outside.join(', '));
const contentDiff = git('diff', '--name-only', base, '--', 'lite/src/content', 'lite/src/engine').trim();
if (contentDiff) throw Error('Lesson content or engine changed: ' + contentDiff);

const strip = (m) => {
  const c = structuredClone(m);
  delete c.revision; delete c.reviews;
  if (c.alignment?.currentSource) { delete c.alignment.currentSource.liteGeneratorSha256; delete c.alignment.currentSource.sourceHashes; }
  return JSON.stringify(c);
};
const rows = [];
for (const row of decisions.nodes) {
  const dir = `${network}/packages/${row.kc}`;
  const before = JSON.parse(git('show', `${base}:${dir}/lesson.json`)), after = JSON.parse(fs.readFileSync(path.join(root, dir, 'lesson.json')));
  if (strip(before) !== strip(after)) throw Error(`${row.kc}: metadata changed beyond the source binding`);
  const files = git('diff', '--name-only', base, '--', dir).trim().split('\n').filter(Boolean);
  if (files.some((f) => f !== `${dir}/lesson.json`)) throw Error(`${row.kc}: lesson files changed: ${files.join(', ')}`);
  for (const [p, h] of Object.entries(row.sourceSha256)) if (sha(fs.readFileSync(path.join(root, p))) !== h) throw Error(`${row.kc}: ${p} changed`);
  const pkg = packages.get(row.kc);
  rows.push({ kc: row.kc, from: row.lessonRevision, to: pkg.metadata.contentRevision });
}

const evidenceRel = `docs/releases/launch/rebind-${now.liteGeneratorSha256.slice(0, 12)}.json`;
const evidence = {
  kind: 'source_binding_carry_forward', base, by, reason, at: new Date().toISOString(),
  liteGeneratorSha256: { from: decisions.liteGeneratorSha256, to: now.liteGeneratorSha256 },
  changedLitePaths: changedLite,
  checks: ['lesson generator inputs unchanged', 'lite/src/content and lite/src/engine unchanged', 'Lite changes limited to the audio layer and its call sites',
    'per node: body.html, lesson.mjs and assets unchanged; lesson.json differs only by revision and currentSource binding'],
  boundary: 'Carries the existing software decisions; grants no new content, technical or human approval. Human validation remains pending.',
  nodes: rows,
};
console.log(JSON.stringify({ nodes: rows.length, changedLite: changedLite.length, liteGeneratorSha256: now.liteGeneratorSha256, action: apply ? 'carried_forward' : 'dry_run' }));
if (!apply) process.exit(0);
fs.writeFileSync(path.join(root, evidenceRel), JSON.stringify(evidence, null, 2) + '\n');
const evSha = sha(fs.readFileSync(path.join(root, evidenceRel)));
const byKc = new Map(rows.map((r) => [r.kc, r]));
decisions.liteGeneratorSha256 = now.liteGeneratorSha256;
(decisions.carryForwards ??= []).push({ at: evidence.at, by, reason, evidence: evidenceRel });
for (const row of decisions.nodes) {
  row.lessonRevision = byKc.get(row.kc).to;
  row.evidence = [...row.evidence.filter((e) => !e.path.startsWith('docs/releases/launch/rebind-')), { path: evidenceRel, sha256: evSha }];
}
fs.writeFileSync(decisionsFile, JSON.stringify(decisions, null, 2) + '\n');
