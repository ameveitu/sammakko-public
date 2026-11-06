// Build the learner-facing catalog from the frozen canonical graph and authored story registry.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const canonicalFile = new URL('../reference/canonical-690-graph.json', import.meta.url);
const storyFile = new URL('../../docs/lite-690/source/data/sammakko_690_story.json', import.meta.url);
const target = new URL('../src/data/journey-catalog.json', import.meta.url);
const canonicalBytes = readFileSync(canonicalFile);
const storyBytes = readFileSync(storyFile);
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const canonicalSha = sha(canonicalBytes);
const storySha = sha(storyBytes);
if (canonicalSha !== '17eca8c1675ffe14aa3d6836e1ce7109020f440b22df09b7a7b15a8e95bb39fb') {
  throw new Error('Canonical graph differs from the frozen 690-node source');
}
const canonical = JSON.parse(canonicalBytes);
const registry = JSON.parse(storyBytes);

function index(rows, label) {
  const byId = new Map(rows.map((row) => [row.id, row]));
  if (byId.size !== rows.length) throw new Error(`Duplicate ${label} ID`);
  return byId;
}
function expect(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: got ${actual}; expected ${expected}`);
}

const byId = index(canonical.nodes, 'canonical');
const stories = index(registry.nodes, 'story');
const familyById = index(registry.families, 'family');
expect(stories.size, byId.size, 'Canonical and story node counts');

const parents = new Map();
const children = new Map(canonical.nodes.map((node) => [node.id, []]));
for (const node of canonical.nodes) {
  const refs = new Set(node.prerequisite_groups.flatMap((group) => group.all_of ?? group.any_of));
  parents.set(node.id, refs);
  for (const id of refs) {
    if (!children.has(id)) throw new Error(`${node.id}: unknown prerequisite ${id}`);
    children.get(id).push(node.id);
  }
  const required = new Set(node.relations.filter((r) => r.relation_type === 'prerequisite' && r.strength === 'required').map((r) => r.id));
  if (required.size !== refs.size || [...required].some((id) => !refs.has(id))) {
    throw new Error(`${node.id}: prerequisite groups disagree with required relation IDs`);
  }
  for (const id of [...node.relations.map((r) => r.id), ...node.integration_of ?? []]) {
    if (!byId.has(id)) throw new Error(`${node.id}: unknown canonical relation target ${id}`);
  }
}

const depth = new Map();
const ancestors = new Map();
const visiting = new Set();
const order = [];
function visit(id) {
  if (depth.has(id)) return;
  if (visiting.has(id)) throw new Error(`Required prerequisite cycle at ${id}`);
  visiting.add(id);
  const above = new Set();
  let level = 0;
  for (const parent of parents.get(id)) {
    visit(parent);
    level = Math.max(level, depth.get(parent) + 1);
    above.add(parent);
    for (const grandparent of ancestors.get(parent)) above.add(grandparent);
  }
  ancestors.set(id, above);
  depth.set(id, level);
  order.push(id);
  visiting.delete(id);
}
for (const node of canonical.nodes) visit(node.id);

const events = new Set();
const effects = new Set();
const nodes = canonical.nodes.map((node) => {
  const story = stories.get(node.id);
  if (!story) throw new Error(`Missing story for ${node.id}`);
  const family = familyById.get(story.family_id);
  if (!family?.node_ids.includes(node.id)) throw new Error(`${node.id}: family membership mismatch`);
  expect(story.canonical_title ?? story.canonical.title, node.title, `${node.id}: canonical title`);
  expect(story.required_depth, depth.get(node.id), `${node.id}: required depth`);
  expect(story.is_required_leaf, !children.get(node.id).length, `${node.id}: required leaf`);
  expect([...story.required_parents].sort().join(), [...parents.get(node.id)].sort().join(), `${node.id}: required parents`);
  if (story.story_parent_ids.some((id) => !ancestors.get(node.id).has(id))) {
    throw new Error(`${node.id}: story parent outside required ancestry`);
  }
  const eventId = story.story_contract.success_event_id;
  const effectId = story.story_contract.world_effect_id;
  if (typeof eventId !== 'string' || !eventId || events.has(eventId) ||
      typeof effectId !== 'string' || !effectId || effects.has(effectId)) {
    throw new Error(`${node.id}: invalid or duplicate story event/effect`);
  }
  events.add(eventId);
  effects.add(effectId);
  return {
    id: node.id,
    title: node.title,
    familyId: story.family_id,
    sceneTitle: story.scene_title,
    story: story.story,
    action: story.learning_action,
    success: story.success_event,
    transfer: story.transfer,
    representation: story.representation,
    scope: story.scope,
    requiredParents: story.required_parents,
    isLeaf: story.is_required_leaf,
    groups: node.prerequisite_groups.map((group) => group.all_of ? { all: group.all_of } : { any: group.any_of }),
    relations: node.relations.map((rel) => ({ id: rel.id, type: rel.relation_type, strength: rel.strength })),
    foundation: node.foundation_entry === true,
    operationalGate: node.operational_gate === true,
    dynamic: node.dynamic_prerequisite_rule ?? null,
    integrationOf: node.integration_of ?? [],
    storyParents: story.story_parent_ids,
    eventId,
    effectId,
  };
});
const families = registry.families.map((family) => {
  const actual = nodes.filter((node) => node.familyId === family.id).map((node) => node.id);
  expect([...family.node_ids].sort().join(), actual.sort().join(), `${family.id}: family members`);
  return {
    id: family.id, title: family.title, theme: family.learning_theme,
    description: family.world_description, nodeIds: family.node_ids,
  };
});
const counts = {
  nodes: nodes.length,
  existing_181: nodes.filter((n) => n.scope === 'existing_181_exterior_wrapper').length,
  new_509: nodes.filter((n) => n.scope === 'new_509_content').length,
  families: families.length,
  required_edges: nodes.reduce((sum, n) => sum + n.requiredParents.length, 0),
  required_leaves: nodes.filter((n) => n.isLeaf).length,
  required_roots: nodes.filter((n) => n.requiredParents.length === 0).length,
  all_typed_relations: nodes.reduce((sum, n) => sum + n.relations.length, 0),
  integration_nodes: nodes.filter((n) => n.integrationOf.length > 0).length,
  nonempty_dynamic_rules: nodes.filter((n) => n.dynamic !== null).length,
  any_of_groups: nodes.reduce((sum, n) => sum + n.groups.filter((group) => 'any' in group).length, 0),
  foundation_entries: nodes.filter((n) => n.foundation).length,
  max_required_depth: Math.max(...depth.values()),
};
const { foundation_entries, max_required_depth, ...sourceCounts } = counts;
for (const [key, value] of Object.entries(sourceCounts)) expect(value, registry.counts[key], key);
expect(foundation_entries, 7, 'Foundation entries');
expect(max_required_depth, 14, 'Maximum required depth');

const rowLines = (rows) => rows.map((row) => `    ${JSON.stringify(row)}`).join(',\n');
const output = `{\n  "canonicalSha": "${canonicalSha}",\n  "storySha": "${storySha}",\n  "counts": ${JSON.stringify(counts)},\n  "order": ${JSON.stringify(order)},\n  "nodes": [\n${rowLines(nodes)}\n  ],\n  "families": [\n${rowLines(families)}\n  ]\n}\n`;
if (process.argv.includes('--check')) {
  expect(readFileSync(target, 'utf8') === output, true, 'Journey catalog is current');
} else {
  writeFileSync(target, output);
}
