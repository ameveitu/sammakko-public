// Builds src/data/graph.json from the frozen MVP manifest (reference/mvp-scope.json) plus the
// reviewed 181-node addendum (reference/scope-addendum-181.json). The merged manifest is also
// written to reference/mvp-scope-181.json so that it can be read on its own.
// Usage: node tools/build-graph.mjs            (writes src/data/graph.json)
//        node tools/build-graph.mjs --check    (fails if graph.json is out of date)
//
// The manifest is the single source of the node set. This tool never adds or drops
// a node: it copies the canonical records, keeps every relation type and strength,
// keeps prerequisite groups (all_of / any_of), entry roles and dynamic rules, and
// computes a lesson order that respects every required and strong relation.
// Activity-level coverage (task_context_coverage) is copied separately; it is not
// turned into graph edges.
import fs from 'node:fs';
import crypto from 'node:crypto';

const root = new URL('..', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root));
const manifestBytes = read('reference/mvp-scope.json');
const M177 = JSON.parse(manifestBytes);
const addendumBytes = read('reference/scope-addendum-181.json');
const A = JSON.parse(addendumBytes);
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

// Frozen inputs (see reference/SCOPE_REPORT.md).
const EXPECT = {
  'mvp-scope.json': '58f7ca8bb7868dde2a4e4189259871e83d18681510f7841dad22e4eae2114ab8',
  'canonical-690-graph.json': '17eca8c1675ffe14aa3d6836e1ce7109020f440b22df09b7a7b15a8e95bb39fb',
  'scope-addendum-181.json': '877dde86f7eb127813c84646dcbdb2d30448eec6b6542b5fdbc9483aee14204f',
};
const canonicalBytes = read('reference/canonical-690-graph.json');
for (const [f, b] of [['mvp-scope.json', manifestBytes], ['canonical-690-graph.json', canonicalBytes], ['scope-addendum-181.json', addendumBytes]])
  if (sha(b) !== EXPECT[f]) throw new Error(`${f} differs from the frozen reference. Update EXPECT only together with a reviewed new manifest.`);

const canonical = new Map(JSON.parse(canonicalBytes).nodes.map((n) => [n.id, n]));

// ---- 181: the 177 manifest + the addendum's nodes, copied from the canonical graph itself.
if (A.canonical_sha256 !== EXPECT['canonical-690-graph.json'] || A.original_manifest_sha256 !== EXPECT['mvp-scope.json']) throw new Error('addendum was made for other inputs');
for (const n of A.added_canonical_nodes) {
  const c = canonical.get(n.id);
  if (!c || JSON.stringify(c.relations) !== JSON.stringify(n.relations)) throw new Error(`addendum node ${n.id} differs from canonical`);
}
const addedIds = A.added_ids;
// The addendum gives no worked example for its five activity uses; these are written here
// from the current lesson code and marked as local.
const EXAMPLES = {
  'M-TH-08>M-GMEAS-01': 'Square with side 5 cm: perimeter 4 * 5 = 20 cm.',
  'M79-EXPR-FORM>M-GMEAS-01': 'Square with side a: perimeter a + a + a + a = 4a.',
  'M79-EQ1-FORM>M-GMEAS-01': 'Rectangle 2x by 3: 2(2x + 3) = 26.',
  'M-FRAC-11>M-FRAC-12': '8/8 - 3/8 = 5/8 of the pie remains.',
  'M-UNIT-05>M-TIME-02': 'Departs at 9.30, sails 2 h: arrives at 11.30.',
};
const M = {
  ...M177,
  schema_version: 'sammakko-lite-mvp-scope/181',
  status: 'APPLIED_181_NODE_SCOPE_FROM_177_BASELINE_AND_REVIEWED_ADDENDUM',
  selected_node_count: M177.selected_ids.length + addedIds.length,
  derived_from: { 'mvp-scope.json': EXPECT['mvp-scope.json'], 'scope-addendum-181.json': EXPECT['scope-addendum-181.json'], 'canonical-690-graph.json': EXPECT['canonical-690-graph.json'] },
  selected_ids: [...M177.selected_ids, ...addedIds],
  added_ids: [...M177.added_ids, ...addedIds],
  nodes: [...M177.nodes, ...addedIds.map((id) => canonical.get(id))],
  task_context_coverage: [...M177.task_context_coverage, ...A.activity_uses_to_register.map((u) => ({
    usesKCId: u.uses, targetKCId: u.target, activityFamily: u.family, role: u.role, reason: u.reason,
    example: u.example || EXAMPLES[`${u.target}>${u.uses}`] || '', example_source: u.example ? 'addendum' : 'lite-local (addendum gives none)', canonical_edge_added: false, source: 'scope-addendum-181',
  }))],
  addition_reasons: [...M177.addition_reasons, ...addedIds.map((id) => {
    const uses = A.activity_uses_to_register.filter((u) => u.uses === id);
    const viaClosure = A.added_relations.find((r) => r.source === id);
    return { id, title: canonical.get(id).title, selection_reason_type: uses.length ? 'activity_context_use' : 'canonical_ancestor_of_activity_use',
      reason: uses.length ? uses.map((u) => `${u.target}/${u.family}: ${u.reason}`).join(' ') : `Required parent of ${viaClosure.target}.`,
      witness_path: uses.length ? [uses[0].target, id] : [viaClosure.target, id] };
  })],
};
if (JSON.stringify([...M.selected_ids].sort()) !== JSON.stringify([...A.proposed_selected_ids].sort())) throw new Error('181 selection differs from the addendum proposal');
const ids = M.selected_ids;
const S = new Set(ids);
if (S.size !== ids.length) throw new Error('Duplicate ids in manifest');
for (const id of M.original_107_ids) if (!S.has(id)) throw new Error(`Original node ${id} missing`);

const nodes = M.nodes.map((n) => {
  const c = canonical.get(n.id);
  if (!c) throw new Error(`${n.id} not in canonical graph`);
  if (JSON.stringify(c.relations ?? []) !== JSON.stringify(n.relations ?? [])) throw new Error(`${n.id}: relations differ from canonical`);
  const rel = (n.relations ?? []).map((r) => ({ id: r.id, type: r.relation_type, strength: r.strength }));
  const outside = rel.filter((r) => !S.has(r.id));
  if (outside.length) throw new Error(`${n.id}: relation outside the manifest: ${outside.map((r) => r.id).join(', ')}`);
  const groups = (n.prerequisite_groups ?? []).map((g) => (g.all_of ? { all: g.all_of } : { any: g.any_of }));
  return {
    id: n.id,
    title: n.title,
    subject: n.subject,
    grade: n.grade_band,
    kind: n.node_kind,
    role: n.mastery_role,
    entry: n.entry_role,
    foundation: !!n.foundation_entry,
    dynamic: n.dynamic_prerequisite_rule ?? null,
    groups,
    rel,
    // strong relations of any type: content that must exist, never a lock
    soft: rel.filter((r) => r.strength === 'strong').map((r) => r.id),
    curriculum: n.curriculum_refs ?? [],
    original: M.original_107_ids.includes(n.id),
  };
});
const byId = new Map(nodes.map((n) => [n.id, n]));

// Lesson order: a topological order over required + strong relations. Original
// nodes keep their previous relative order; an added node goes right after its
// latest parent, so supports sit next to the places that use them.
const prev = JSON.parse(read('tools/order107.json')).order;
const rank = new Map(prev.map((id, i) => [id, i]));
const parents = (id) => byId.get(id).rel.filter((r) => r.strength === 'required' || r.strength === 'strong').map((r) => r.id);
const rankOf = (id, seen = new Set()) => {
  if (rank.has(id)) return rank.get(id);
  if (seen.has(id)) throw new Error(`cycle at ${id}`);
  seen.add(id);
  const ps = parents(id);
  const r = ps.length ? Math.max(...ps.map((p) => rankOf(p, seen))) + 0.5 : -0.5;
  rank.set(id, r);
  return r;
};
ids.forEach((id) => rankOf(id));
const order = [], done = new Set();
const indeg = new Map(ids.map((id) => [id, parents(id).length]));
const kids = new Map(ids.map((id) => [id, []]));
for (const id of ids) for (const p of parents(id)) kids.get(p).push(id);
const ready = ids.filter((id) => indeg.get(id) === 0);
while (ready.length) {
  ready.sort((a, b) => rank.get(a) - rank.get(b) || a.localeCompare(b));
  const id = ready.shift();
  order.push(id); done.add(id);
  for (const k of kids.get(id)) { indeg.set(k, indeg.get(k) - 1); if (indeg.get(k) === 0) ready.push(k); }
}
if (order.length !== ids.length) throw new Error('Required/strong graph has a cycle');

const out = {
  source: 'reference/mvp-scope.json + reference/scope-addendum-181.json (Sammakko Lite closed-subgraph MVP manifest, 181 nodes)',
  manifest: { schema: M.schema_version, status: M.status, sha256: EXPECT['mvp-scope.json'], addendumSha256: EXPECT['scope-addendum-181.json'], canonicalSha256: EXPECT['canonical-690-graph.json'], canonicalCommit: M.source_commit_as_recorded, count: ids.length },
  sha256: sha(Buffer.from(JSON.stringify({ order, nodes }))),
  order,
  nodes: order.map((id) => byId.get(id)),
  coverage: M.task_context_coverage.map((t) => ({ target: t.targetKCId, uses: t.usesKCId, role: t.role, family: t.activityFamily, reason: t.reason, example: t.example ?? '' })),
  additions: M.addition_reasons.map((a) => ({ id: a.id, type: a.selection_reason_type, reason: a.reason, witness: a.witness_path })),
};
const text = JSON.stringify(out, null, 1) + '\n';
const target = new URL('src/data/graph.json', root);
const manifestText = JSON.stringify(M, null, 1) + '\n';
const manifestTarget = new URL('reference/mvp-scope-181.json', root);
if (process.argv.includes('--check')) {
  if (!fs.existsSync(manifestTarget) || fs.readFileSync(manifestTarget, 'utf8') !== manifestText) { console.error('reference/mvp-scope-181.json is out of date: run node tools/build-graph.mjs'); process.exit(1); }
} else fs.writeFileSync(manifestTarget, manifestText);
if (process.argv.includes('--check')) {
  if (fs.readFileSync(target, 'utf8') !== text) { console.error('src/data/graph.json is out of date: run node tools/build-graph.mjs'); process.exit(1); }
  console.log(`graph.json up to date (${ids.length} nodes)`);
} else {
  fs.writeFileSync(target, text);
  console.log(`wrote src/data/graph.json: ${ids.length} nodes, ${nodes.reduce((s, n) => s + n.rel.length, 0)} relations`);
}
