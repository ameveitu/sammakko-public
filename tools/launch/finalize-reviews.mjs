// Apply only explicit, exact-current-revision software review decisions.
// It cannot grant human approval or infer approval from passing tests.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadPackages } from '../../public/oppitunnit/lesson-network/content.mjs';
import { sourceBindings, requireCurrentBindings } from './source-bindings.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const network = path.join(root, 'public/oppitunnit/lesson-network');
const read = file => JSON.parse(fs.readFileSync(file));
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const ids = read(path.join(network, 'reference/inputs/mvp-scope-181.json')).selected_ids;
const decisionPath = path.join(root, 'docs/releases/launch/review-decisions.json');
if (!fs.existsSync(decisionPath)) throw Error('No explicit review-decisions.json: acceptance remains pending');
const decisions = read(decisionPath);
if (decisions.kind !== 'software_source_and_delta_review' || decisions.humanValidation !== 'pending') throw Error('Wrong review boundary');
requireCurrentBindings(decisions, sourceBindings(root));
const rows = new Map(decisions.nodes.map(row => [row.kc, row]));
if (rows.size !== 181 || decisions.nodes.length !== 181 || ids.some(id => !rows.has(id))) throw Error('Decision scope must be exact181');
const packages = loadPackages(network, ids);
// Validate every decision first, so a stale decision cannot partially apply a batch.
for (const [id, pkg] of packages) {
  const row = rows.get(id);
  if (row.lessonRevision !== pkg.metadata.contentRevision || row.decision !== 'reviewed_with_stated_limits') throw Error(`Unaccepted/stale revision: ${id}`);
  if (!row.reviewer || !row.note || !Array.isArray(row.evidence) || !row.evidence.length) throw Error(`Incomplete decision: ${id}`);
  for (const [relative, expected] of Object.entries(row.sourceSha256 ?? {})) {
    if (relative.includes('..') || path.isAbsolute(relative) || sha(path.join(root, relative)) !== expected) throw Error(`Stale/unsafe source: ${id}/${relative}`);
  }
  if (!Object.keys(row.sourceSha256 ?? {}).some(p => p.endsWith(`/packages/${id}/body.html`))) throw Error(`No body binding: ${id}`);
  for (const evidence of row.evidence) {
    if (evidence.path.includes('..') || path.isAbsolute(evidence.path) || sha(path.join(root, evidence.path)) !== evidence.sha256) throw Error(`Stale/unsafe evidence: ${id}`);
  }
}
const apply = process.argv.includes('--apply');
if (apply) for (const [id, pkg] of packages) {
  const row = rows.get(id), file = path.join(pkg.dir, 'lesson.json'), meta = read(file);
  const note = `Launch software review by ${row.reviewer}: ${row.note} Evidence: docs/releases/launch/review-decisions.json. No teacher/learner validation or live release approval.`;
  for (const kind of ['content', 'alignment']) {
    if (!meta.reviews.some(r => r.kind === kind && r.state === 'reviewed' && r.revision === row.lessonRevision && r.note === note)) meta.reviews.push({ kind, state: 'reviewed', revision: row.lessonRevision, note });
  }
  if (!meta.reviews.some(r => r.kind === 'human' && r.revision === row.lessonRevision && r.state === 'pending')) meta.reviews.push({ kind: 'human', state: 'pending', revision: row.lessonRevision, note: 'Actual teacher and learner validation has not been performed.' });
  fs.writeFileSync(file, JSON.stringify(meta, null, 2) + '\n');
}
console.log(JSON.stringify({ exact181: rows.size, action: apply ? 'software_reviews_appended' : 'decisions_verified_only', humanValidation: 'pending' }));
