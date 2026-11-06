#!/usr/bin/env node
// Independent, read-only Phase 1 audit. No generator/runtime imports and no dependencies.
import fs from 'node:fs';
import {loadPackages,composePackage} from './content.mjs';
import {projectAudience,teacherNode,parseFragment} from './audience.mjs';
import {verifyGameActions} from './verify-game-actions.mjs';
import {loadDeployment} from './site-config.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';

const ROOT = process.env.LESSON_STAGING??process.env.LESSON_VERIFY_ROOT??path.dirname(fileURLToPath(import.meta.url));
let packages, canonicalById;
const sitePackage = process.env.SAMMAKKO_SITE_PACKAGE === '1';
const SITE = path.join(ROOT, 'site');
const PIN = '17eca8c1675ffe14aa3d6836e1ce7109020f440b22df09b7a7b15a8e95bb39fb';
const pins = {
  'canonical-690-graph.json': PIN,
  'mvp-scope-181.json': '394daa811285dec750d7428f42c84e4a0a237229fd09170eae0ddcafb3777715',
  'lite181-review-findings.json': '1bd6e783fe9959c20fa38bef38fa6af8c5fde1c20ac0e2c44e2971fe8cd6c2b5',
};
const failures = [];
let checks = 0;
const args = process.argv.slice(2);
const allowPending = args.includes('--allow-pending');
const validationCounts = { verified: 0, pending_validation: 0, invalid: 0 };
for (const arg of args) if (arg !== '--allow-pending') failures.push(`Unknown argument: ${arg}`);
const hash = value => createHash('sha256').update(value).digest('hex');
const check = (condition, label) => { checks++; if (!condition) failures.push(label); };
const equal = (actual, expected, label) => check(isDeepStrictEqual(actual, expected), label);
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const sorted = values => [...values].sort();
const encode = value => JSON.stringify(value, null, 2) + '\n';
const relationLabels = { prerequisite: 'Esitieto', representation_support: 'Esitystavan tuki', process_support: 'Työskentelyn tuki', safety_gate: 'Turvallisuusehto (toiminnallinen)' };
const strengthLabels = { required: 'Vaadittu', strong: 'Vahva tuki', helpful: 'Hyödyllinen tuki' };
const countBy = (values, key) => values.reduce((out, item) => {
  const k = key(item); out[k] = (out[k] || 0) + 1; return out;
}, {});
function files(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const full = path.join(dir, e.name);
    check(!e.isSymbolicLink(), `No output symlink: ${full}`);
    return e.isDirectory() ? files(full) : [full];
  }).sort();
}

// A conservative tokenizer for the static shell, including quoted attributes and
// raw-text elements. Comments/script text cannot masquerade as real nav links.
function decode(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (all, name) => {
    if (name[0] === '#') {
      const number = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : Number(name.slice(1));
      return number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : '\ufffd';
    }
    return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }[name.toLowerCase()];
  });
}
function parseHTML(source, label) {
  const root = { tag: '#document', attrs: {}, children: [] };
  const stack = [root], elements = [];
  const tokens = /<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][^>"']*(?:(?:"[^"]*"|'[^']*')[^>"']*)*>|[^<]+|</g;
  const voids = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
  let match;
  while ((match = tokens.exec(source))) {
    const token = match[0];
    if (token.startsWith('<!')) continue;
    if (token.startsWith('</')) {
      const tag = token.match(/^<\/([\w-]+)/)?.[1].toLowerCase();
      const index = stack.findLastIndex(n => n.tag === tag);
      check(index > 0, `${label}: unmatched closing ${tag}`);
      if (index > 0) stack.length = index;
    } else if (/^<[A-Za-z]/.test(token)) {
      const tag = token.match(/^<([\w-]+)/)[1].toLowerCase();
      const attrs = {};
      const attrText = token.slice(tag.length + 1).replace(/\/?\s*>$/, '');
      for (const attr of attrText.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
        const key = attr[1].toLowerCase();
        check(!(key in attrs), `${label}: duplicate attribute ${key}`);
        attrs[key] = decode(attr[2] ?? attr[3] ?? attr[4] ?? '');
      }
      const node = { tag, attrs, children: [], parent: stack.at(-1) };
      node.parent.children.push(node); elements.push(node);
      if (['script', 'style', 'textarea', 'title'].includes(tag)) {
        const close = new RegExp(`</${tag}\\s*>`, 'ig'); close.lastIndex = tokens.lastIndex;
        const end = close.exec(source);
        check(!!end, `${label}: closed ${tag}`);
        node.children.push(source.slice(tokens.lastIndex, end?.index ?? source.length));
        tokens.lastIndex = end ? close.lastIndex : source.length;
      } else if (!voids.has(tag)) stack.push(node);
    } else stack.at(-1).children.push(decode(token));
  }
  check(stack.length === 1, `${label}: closed HTML elements`);
  const ids = elements.filter(e => e.attrs.id !== undefined).map(e => e.attrs.id);
  check(new Set(ids).size === ids.length, `${label}: unique DOM ids`);
  return { root, elements, ids: new Set(ids) };
}
const descendants = node => node.children.flatMap(c => typeof c === 'string' ? [] : [c, ...descendants(c)]);
const text = node => node ? node.children.map(c => typeof c === 'string' ? c : ['script', 'style', 'template'].includes(c.tag) ? '' : text(c)).join(' ').replace(/\s+/g, ' ').trim() : '';
const within = (node, ancestor) => { for (let p = node; p; p = p.parent) if (p === ancestor) return true; return false; };
const byId = (doc, id) => doc.elements.find(e => e.attrs.id === id);

function cyclicComponents(nodes, edges) {
  const adj = new Map(nodes.map(n => [n.id, []]));
  for (const edge of edges) adj.get(edge.sourceKCId)?.push(edge.targetKCId);
  let next = 0; const index = new Map(), low = new Map(), active = new Set(), stack = [], cycles = [];
  function visit(id) {
    index.set(id, next); low.set(id, next++); active.add(id); stack.push(id);
    for (const other of adj.get(id) || []) {
      if (!index.has(other)) { visit(other); low.set(id, Math.min(low.get(id), low.get(other))); }
      else if (active.has(other)) low.set(id, Math.min(low.get(id), index.get(other)));
    }
    if (low.get(id) === index.get(id)) {
      const component = []; let other;
      do { other = stack.pop(); active.delete(other); component.push(other); } while (other !== id);
      if (component.length > 1 || adj.get(id).includes(id)) cycles.push(component.sort());
    }
  }
  for (const n of nodes) if (!index.has(n.id)) visit(n.id);
  return cycles.sort((a, b) => a.join().localeCompare(b.join()));
}

function graphAudit(graph, facts, lite) {
  const nodes = graph.nodes, ids = nodes.map(n => n.id), byKC = new Map(nodes.map(n => [n.id, n]));
  equal(nodes.length, 690, '690 canonical nodes'); equal(new Set(ids).size, 690, '690 unique canonical IDs');
  check(ids.every(id => /^[A-Z0-9-]+$/.test(id)), 'Canonical IDs safe for filenames');
  const edges = nodes.flatMap(n => (n.relations || []).map((r, index) => ({
    sourceKCId: r.id, targetKCId: n.id, relationType: r.relation_type,
    strength: r.strength, rationale: r.rationale, sourceRelationIndex: index,
  })));
  const top = new Map(ids.map(id => [id, edges.filter(e => e.targetKCId === id)]));
  const bottom = new Map(ids.map(id => [id, edges.filter(e => e.sourceKCId === id)]));
  const groups = nodes.flatMap(n => n.prerequisite_groups || []);
  const derived = {
    kc_count: nodes.length, relation_count: edges.length,
    subjects: countBy(nodes, n => n.subject), node_kinds: countBy(nodes, n => n.node_kind), mastery_roles: countBy(nodes, n => n.mastery_role),
    relations_by_type_strength: countBy(edges, e => `${e.relationType}:${e.strength}`),
    cross_subject_relations: edges.filter(e => byKC.get(e.sourceKCId)?.subject !== byKC.get(e.targetKCId)?.subject).length,
    prerequisite_group_count: groups.length, nodes_with_groups: nodes.filter(n => n.prerequisite_groups?.length).length,
    all_of_count: groups.filter(g => g.all_of).length, any_of_count: groups.filter(g => g.any_of).length,
    multi_group_ids: nodes.filter(n => n.prerequisite_groups?.length > 1).map(n => n.id),
    dynamic_rule_count: nodes.filter(n => n.dynamic_prerequisite_rule != null).length,
    dynamic_entry_count: nodes.filter(n => n.entry_role === 'dynamic').length,
    foundation_entry_count: nodes.filter(n => n.foundation_entry).length,
    zero_required_indegree_flag_count: nodes.filter(n => n.zero_required_indegree).length,
    no_recorded_top_relations_count: ids.filter(id => !top.get(id).length).length,
    no_direct_dependents_count: ids.filter(id => !bottom.get(id).length).length,
    dangling_ids: sorted(new Set(edges.filter(e => !byKC.has(e.sourceKCId)).map(e => e.sourceKCId))),
    duplicate_source_target_pairs: edges.length - new Set(edges.map(e => `${e.sourceKCId}:${e.targetKCId}`)).size,
    self_edges: edges.filter(e => e.sourceKCId === e.targetKCId).length,
    required_prerequisite_only_acyclic: cyclicComponents(nodes, edges.filter(e => e.relationType === 'prerequisite' && e.strength === 'required')).length === 0,
    full_network_is_acyclic: cyclicComponents(nodes, edges).length === 0,
    full_network_cyclic_components: cyclicComponents(nodes, edges),
    lite181_count: lite.size, outside_lite181_count: ids.filter(id => !lite.has(id)).length,
  };
  for (const [key, value] of Object.entries(derived)) equal(value, facts[key], `Pinned graph fact: ${key}`);
  equal([edges.length, derived.cross_subject_relations, groups.length, derived.any_of_count, derived.dynamic_rule_count, lite.size], [1287, 127, 599, 12, 18, 181], 'Required fixed counts');
  for (const id of lite) check(byKC.has(id), `Lite identity exists: ${id}`);
  equal(graph.catalogs.map(c => ({ catalogue: c.catalog_id, count: c.node_count })), facts.catalogue_counts, 'Catalogue counts');
  for (const f of facts.navigation_fixtures) {
    const n = byKC.get(f.kcId);
    check(!!n, `Fixture exists: ${f.kcId}`); if (!n) continue;
    const actual = { kcId: n.id, topRelations: n.relations || [], bottomRelations: bottom.get(n.id), prerequisiteGroups: n.prerequisite_groups || [], nodeKind: n.node_kind, masteryRole: n.mastery_role, entryRole: n.entry_role, foundationEntry: n.foundation_entry, dynamicRule: n.dynamic_prerequisite_rule ?? null, integrationOf: n.integration_of ?? null, splitChildren: n.split_children ?? null };
    equal(actual, f, `Pinned fixture: ${n.id}`);
  }
  return { nodes, ids, edges, byKC, top, bottom, derived };
}

function verifyNav(doc, regionId, edges, direction, label) {
  const region = byId(doc, regionId);
  check(region?.tag === 'nav', `${label}: nav#${regionId}`);
  if (!region) return;
  const links = descendants(region).filter(e => e.tag === 'a');
  equal(links.length, edges.length, `${label}: ${regionId} exact link count`);
  equal(sorted(links.map(a => a.attrs['data-edge'])), sorted(edges.map(e => `${e.targetKCId}:${e.sourceRelationIndex}`)), `${label}: ${regionId} exact edge identities`);
  for (const edge of edges) {
    const key = `${edge.targetKCId}:${edge.sourceRelationIndex}`;
    const a = links.find(e => e.attrs['data-edge'] === key); if (!a) continue;
    const other = direction === 'top' ? edge.sourceKCId : edge.targetKCId;
    equal(a.attrs.href, `${other}.html`, `${label}: ${regionId}/${key} href`);
    check(text(a).includes(other), `${label}: ${regionId}/${key} visible KC ID`);
    const alternative=(canonicalById.get(edge.targetKCId).prerequisite_groups??[]).some(g=>g.any_of?.includes(edge.sourceKCId));
    if(alternative)check(text(a.parent).includes('Vaihtoehtoinen esitieto — yksi TAI-ryhmästä riittää'),`${label}: ${regionId}/${key} primary alternative label`);
    // Metadata must be displayed beside its edge, not merely embedded in JSON.
    const item = (() => { let p = a; while (p.parent && p.parent !== region && !['li', 'article'].includes(p.tag)) p = p.parent; return p; })();
    for (const value of [relationLabels[edge.relationType], strengthLabels[edge.strength], edge.rationale]) check(text(item).includes(value), `${label}: ${regionId}/${key} visible metadata ${value}`);
  }
  if (!edges.length) check(text(region).includes(direction === 'top' ? 'Ei kirjattuja suoria tukiyhteyksiä' : 'Ei kirjattuja suoria jatkoaiheita'), `${label}: ${regionId} truthful empty state`);
}

function auditRecord(record, n, expected, lite, htmlBytes, contract, version, inventory) {
  const label = n.id;
  equal(record.kcId, n.id, `${label}: record identity`);
  equal(record.canonicalNode, n, `${label}: full canonicalNode unchanged`);
  equal(record.prerequisiteGroups, n.prerequisite_groups || [], `${label}: prerequisiteGroups unchanged`);
  equal(record.top, expected.top.get(n.id), `${label}: normalized top edges`);
  equal(record.bottom, expected.bottom.get(n.id), `${label}: normalized bottom edges`);
  equal(record.liteAlignment?.subsetMembership, lite.has(n.id), `${label}: exact Lite subset membership`);
  if(!packages.has(n.id)){
  equal(record.newInstructionalContent?.body, null, `${label}: no new lesson body`);
  equal(record.newInstructionalContent?.state, 'awaiting_reviewed_handover', `${label}: content pending`);
  equal(record.newPedagogicalResearch?.records, [], `${label}: no new research`);
  equal(record.newPedagogicalResearch?.state, 'not_started_this_phase', `${label}: research not started`);
  equal(record.contentReview?.state, 'not_performed_for_new_lesson', `${label}: content review pending`);
  equal(record.humanReview?.state, 'not_performed_for_new_lesson', `${label}: human review pending`);
  } else {
   const p=packages.get(n.id);equal(record.authoredPackage,p.metadata,`${label}: source-owned metadata/reviews preserved`);
   equal(record.newInstructionalContent.revision,p.metadata.contentRevision,`${label}: content revision`);
   equal(record.newPedagogicalResearch.records,p.metadata.research,`${label}: research preserved`);
   equal(record.contentReview,p.metadata.contentReview,`${label}: exact review binding`);
   equal(record.humanReview,p.metadata.humanReview,`${label}: exact human binding`);
   if(p.module!==null)equal(fs.readFileSync(path.join(SITE,'content',n.id,p.metadata.module),'utf8'),p.module,`${label}: published executable module matches source`);
   for(const asset of p.assets)equal(hash(fs.readFileSync(path.join(SITE,...(asset.path.startsWith('shared/')?[asset.path]:['content',n.id,asset.path])))),asset.sha256,`${label}: asset integrity`);
  }
  equal(record.canonicalSourceHash, PIN, `${label}: canonical source hash`);
  equal(record.canonicalNodeId, n.id, `${label}: canonicalNodeId`);
  equal(record.pagePath, `lessons/${n.id}.html`, `${label}: pagePath`);
  equal(record.schemaVersion, 1, `${label}: schema revision`);
  equal(record.templateVersion, version, `${label}: template bound to actual generator/assets/config/contract`);
  equal(record.generationState, 'generated', `${label}: generation state`);
  const state = record.validationState;
  validationCounts[Object.hasOwn(validationCounts, state) && state !== 'invalid' ? state : 'invalid']++;
  check(state === 'verified' || (allowPending && state === 'pending_validation'), `${label}: validation state must be ${allowPending ? 'verified or pending_validation' : 'verified'}`);
  equal(record.outputHash, hash(htmlBytes), `${label}: actual HTML output hash`);
  equal(record.dynamicPrerequisite, { rule: n.dynamic_prerequisite_rule ?? null, binding: 'unresolved' }, `${label}: dynamic rule remains unresolved`);
  equal(record.newInstructionalContent?.slots, Object.fromEntries(contract.future_content_slots.map(s => [s, null])), `${label}: every future lesson slot is null`);
  equal(record.newPedagogicalResearch?.recordSchema, Object.fromEntries(contract.future_research_fields.map(s => [s, null])), `${label}: research schema remains empty`);
  equal(record.activityFamily, { state: 'unresolved', fields: Object.fromEntries(contract.future_family_fields.map(s => [s, null])) }, `${label}: future activity fields unresolved`);
  equal(record.renderer, contract.future_renderer_interfaces, `${label}: shared future renderer lifecycle`);
  equal(record.existingDrafts?.inventoryState, 'inventoried', `${label}: source inventory state`);
  equal(record.existingDrafts?.preserveOriginalStatuses, true, `${label}: original status preservation`);
  const refs = record.existingDrafts?.references;
  check(Array.isArray(refs), `${label}: source references array`);
  const referencePaths = Object.keys(inventory.protectedHashes).filter(p => path.basename(p).startsWith(n.id + '.')).sort();
  equal(sorted((refs || []).map(r => r.path)), referencePaths, `${label}: existing named drafts all referenced`);
  for (const ref of refs || []) {
    equal(ref.sha256, inventory.protectedHashes[ref.path], `${label}: source reference hash ${ref.path}`);
    const sourceStatus = ref.originalSourceStatus ?? ref.status;
    check(typeof sourceStatus === 'string' && sourceStatus.length > 0, `${label}: source reference status ${ref.path}`);
  }
  const checkpoint = {
    canonicalInputHash: PIN,
    sourceReferenceHash: hash(encode({ references: refs, task: record.existingDrafts?.originalTaskStatus })),
    schemaVersion: record.schemaVersion, templateVersion: version,
    outputHash: hash(htmlBytes), validationResult: state, blockers: [],
  };
  equal(record.checkpoint, checkpoint, `${label}: embedded checkpoint integrity`);
  equal(json(path.join(ROOT, 'checkpoints', `${n.id}.json`)), checkpoint, `${label}: persisted checkpoint integrity`);
  equal(record.liteAlignment?.alignmentState, lite.has(n.id) ? 'awaiting_corrected_reviewed_baseline' : 'outside_current_lite_scope', `${label}: alignment remains pending/outside scope`);
  equal(record.liteAlignment?.reviewReference, 'reference/inputs/lite181-review-findings.json', `${label}: pinned review reference`);
}

function auditPage(doc, n) {
  const label = n.id, main = byId(doc, 'main');
  equal(main?.tag, 'main', `${label}: main region`);
  equal(main?.attrs['data-kc'], n.id, `${label}: exact document identity`);
  equal(doc.elements.filter(e => e.attrs['data-kc'] !== undefined).length, 1, `${label}: one document identity`);
  equal(doc.elements.find(e => e.tag === 'html')?.attrs.lang, 'fi', `${label}: Finnish document language`);
  check(text(doc.elements.find(e => e.tag === 'title')).includes(n.title), `${label}: canonical document title`);
  const lesson = byId(doc, 'lesson-body');
  check(!!lesson && (packages.has(n.id)||text(lesson).includes('Oppituntisisältö valmistellaan seuraavassa vaiheessa')), `${label}: explicit lesson pending region`);
  check(packages.has(n.id)||!doc.elements.some(e => ['canvas', 'iframe', 'video', 'audio'].includes(e.tag)), `${label}: no authored simulations/media`);
  const upstream = byId(doc, 'upstream'), downstream = byId(doc, 'downstream');
  check(doc.elements.indexOf(upstream) < doc.elements.indexOf(lesson) && doc.elements.indexOf(lesson) < doc.elements.indexOf(downstream), `${label}: top/body/bottom order`);
  const groups = n.prerequisite_groups || [], groupRegion = byId(doc, 'prerequisites');
  equal(!!groupRegion, groups.length > 0, `${label}: prerequisite group region presence`);
  if (groupRegion) {
    check(text(groupRegion).includes('Ryhmien välillä JA'), `${label}: AND across prerequisite groups`);
    const items = descendants(groupRegion).filter(e => e.tag === 'li');
    equal(items.length, groups.length, `${label}: exact prerequisite group count`);
    groups.forEach((g, i) => {
      const item = items[i]; if (!item) return;
      check(text(item).includes(g.any_of ? 'Vähintään yksi (TAI)' : 'Kaikki (JA)'), `${label}: group ${i} correct operator`);
      equal(descendants(item).filter(e => e.tag === 'a').map(e => e.attrs.href), (g.any_of || g.all_of).map(id => `${id}.html`), `${label}: group ${i} exact members`);
      check(text(item).includes(g.rationale), `${label}: group ${i} rationale`);
    });
  }
  const teacher = doc.elements.find(e => e.tag === 'details' && Object.hasOwn(e.attrs,'data-shell-teacher'));
  check(!!teacher, `${label}: teacher details panel`);
  check(text(teacher).includes(`Rooli: ${n.mastery_role}`) && text(teacher).includes(`Noodityyppi: ${n.node_kind}`), `${label}: canonical roles in teacher details`);
  if (n.dynamic_prerequisite_rule) {
    check(text(teacher).includes(n.dynamic_prerequisite_rule), `${label}: visible dynamic rule`);
    check(text(teacher).includes('sidonta ratkaisematta'), `${label}: visible unresolved binding`);
  }
  const mode = byId(doc, 'mode');
  if(packages.has(n.id))check(mode?.tag==='a'&&mode.attrs.href===`../presentations/${n.id}.html`&&mode.attrs.target==='_blank',`${label}: clean audience document opens in its own tab`);
  else check(!mode,`${label}: empty scaffold does not pretend to offer a lesson presentation`);
  check(byId(doc, 'copy-lesson')?.tag === 'button', `${label}: copy lesson action`);
  const copyId = doc.elements.filter(e => e.attrs['data-copy-id'] !== undefined);
  equal(copyId.length, 1, `${label}: one copy ID action`);
  equal(copyId[0]?.attrs['data-copy-id'], n.id, `${label}: copy ID exact identity`);
  check(sitePackage ? text(byId(doc, 'sharing')) === 'Oppituntiluonnos · tutustu sisältöön ennen käyttöä ryhmän kanssa.' : /Paikallinen|varmentamaton/.test(text(byId(doc, 'sharing'))), `${label}: honest sharing label`);
  equal(doc.elements.filter(e => e.tag === 'script').map(e => e.attrs.src), [...(sitePackage?['/assets/site.js']:[]),'../assets/lesson-flow.js','../assets/shell.js',...(packages.get(n.id)?.module?['../assets/lesson-loader.js']:[])], `${label}: only source-declared shared scripts`);
  const sourceStyles=packages.has(n.id)?parseHTML(packages.get(n.id).body,label+' source fragment').elements.filter(e=>e.tag==='link'&&e.attrs.rel==='stylesheet').map(e=>'../content/'+n.id+'/'+e.attrs.href):[];
  equal(doc.elements.filter(e => e.tag === 'link' && e.attrs.rel === 'stylesheet').map(e => e.attrs.href), [...(sitePackage?['/assets/brand.css']:[]),'../assets/shell.css',...sourceStyles], `${label}: shared and exact source-declared stylesheets only`);
}

function auditInventory(graph) {
  const inventory = json(path.join(ROOT, 'inventory.json'));
  equal(inventory.canonicalHash, PIN, 'Inventory canonical hash');
  const repo = process.env.LESSON_SOURCE_REPO??path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const protectedFiles = ['canonical', 'content-design', 'baseline'].flatMap(d => files(path.join(repo, d)));
  equal(sorted(Object.keys(inventory.protectedHashes)), sorted(protectedFiles.map(f => path.relative(repo, f))), 'Protected-source inventory complete');
  for (const file of protectedFiles) equal(inventory.protectedHashes[path.relative(repo, file)], hash(fs.readFileSync(file)), `Protected source current byte integrity: ${path.relative(repo, file)}`);
  equal(inventory.catalogueComparison, graph.catalogs.map(c => ({ path: c.source_relative_path, pinnedHash: c.source_sha256, localHash: inventory.protectedHashes[c.source_relative_path] ?? null, matches: inventory.protectedHashes[c.source_relative_path] === c.source_sha256 })), 'Local/pinned catalogue differences explicitly reported');
  return inventory;
}

function auditIndexes(expected, lite, records, docs, config, version) {
  equal(json(path.join(SITE, 'data/navigation.json')), { top: Object.fromEntries(expected.top), bottom: Object.fromEntries(expected.bottom) }, 'Published navigation exact independently derived graph');
  equal(json(path.join(SITE, 'data/runtime-links.json')), config, 'Published runtime config unchanged');
  const manifest = json(path.join(SITE, 'data/lesson-manifest.json'));
  equal(manifest.map(m => m.kcId), expected.ids, 'Manifest exact canonical identities/order');
  for (const m of manifest) {
    const n = expected.byKC.get(m.kcId), record = records.get(m.kcId); if (!n || !record) continue;
    equal(m, { kcId: n.id, title: n.title, subject: n.subject, gradeBand: n.grade_band, role: n.mastery_role, pagePath: `lessons/${n.id}.html`, scaffold: record.validationState, content: record.newInstructionalContent.state,contentRevision:packages.get(n.id)?.metadata.contentRevision??null, liteAlignment: record.liteAlignment, gameLinks: record.runtimeAvailability }, `${n.id}: manifest matches actual record/canonical identity`);
  }
  equal(json(path.join(SITE, 'data/teacher-integration.json')), { schemaVersion: 1, lessonRevision: version, entries: manifest }, 'Teacher integration exact manifest binding');
  const coverage = json(path.join(ROOT, 'coverage.json'));
  equal(coverage, { phase: 'phase2_selected181', pages: 690, lite: 181, outsideLite: 509, checkpoints: expected.ids.map(id => ({ kcId: id, ...records.get(id)?.checkpoint })), contentApproved: 0, phase2Authorized: true }, 'Coverage complete; no content approval or phase2 authorization');
  const doc = docs.get(path.join(SITE, 'index.html')), catalogue = doc && byId(doc, 'catalogue');
  check(!!catalogue, 'Index catalogue exists');
  if (!catalogue) return;
  const rows = descendants(catalogue).filter(e => e.tag === 'li');
  equal(rows.length, 690, '690 actual HTML index entries');
  equal(sorted(rows.flatMap(row => descendants(row).filter(e => e.tag === 'a').map(a => a.attrs.href))), sorted(expected.ids.map(id => `lessons/${id}.html`)), 'HTML index links exact canonical set');
  for (const row of rows) {
    const a = descendants(row).find(e => e.tag === 'a');
    const id = a?.attrs.href?.match(/^lessons\/(.+)\.html$/)?.[1], n = expected.byKC.get(id);
    if (!n) continue;
    equal(text(a), n.title, `${id}: index title`);
    equal(row.attrs['data-subject'], n.subject, `${id}: index subject`);
    equal(row.attrs['data-grade'], n.grade_band, `${id}: index grade band`);
    equal(row.attrs['data-role'], n.mastery_role, `${id}: index role`);
    equal(row.attrs['data-lite'], lite.has(id) ? 'kyllä' : 'ei', `${id}: index exact subset`);
    equal(row.attrs['data-content'], records.get(id).newInstructionalContent.state, `${id}: index exact content state`);
    equal(row.attrs['data-search'], `${id} ${n.title}`.toLocaleLowerCase('fi'), `${id}: index searchable identity/title`);
  }
  const filters = byId(doc, 'filters');
  equal(sorted(descendants(filters || { children: [] }).filter(e => ['input', 'select'].includes(e.tag)).map(e => e.attrs.name)), ['content', 'grade', 'lite', 'q', 'role', 'subject'], 'All six index search/filter dimensions');
}

function auditLocalLinks(docs) {
  const origin = 'https://phase1.invalid';
  const prefix = '/independent-prefix/';
  for (const [file, doc] of docs) for (const e of doc.elements) {
    for (const attr of ['href', 'src', 'action', 'poster']) {
      if (!(attr in e.attrs)) continue;
      const raw = e.attrs[attr], label = `${path.relative(SITE, file)}: ${e.tag}[${attr}]=${raw}`;
      check(raw.trim().length > 0, `${label}: nonempty URL`);
      check(!/^(javascript|data|vbscript):/i.test(raw), `${label}: no executable/inline URL`);
      if (/^[a-z][a-z\d+.-]*:/i.test(raw) || raw.startsWith('//')) continue;
      if (sitePackage && raw.startsWith('/')) {
        // Only the combined artifact's fixed mounts may leave the lesson site.
        // package-site's whole-output audit checks actual targets and resources.
        const fixed = ['/', '/oppitunnit/', '/oppimisverkko/', '/lite/', '/whitepaper/', '/tietoa/', '/assets/brand.css', '/assets/favicon.svg', '/assets/site.js', '/lite/characters/aava/wave.png', '/lite/characters/aava/map.png'];
        check(fixed.includes(raw) || (e.tag === 'a' && raw === `/lite/#kc/${encodeURIComponent(doc.elements.find(e => e.attrs['data-kc'])?.attrs['data-kc'] ?? '')}`), `${label}: declared combined-site destination`);
        continue;
      }
      check(!raw.startsWith('/'), `${label}: host path prefix preserved`);
      let url;
      try { url = new URL(raw, `${origin}${prefix}${path.relative(SITE, file).split(path.sep).join('/')}`); }
      catch { check(false, `${label}: valid URL`); continue; }
      check(url.origin === origin && url.pathname.startsWith(prefix), `${label}: stays inside site`);
      if (!url.pathname.startsWith(prefix)) continue;
      const target = path.resolve(SITE, decodeURIComponent(url.pathname.slice(prefix.length)) || 'index.html');
      check(target.startsWith(SITE + path.sep), `${label}: safe local path`);
      check(fs.existsSync(target) && fs.statSync(target).isFile(), `${label}: existing local file`);
      if (url.hash && docs.has(target)) check(docs.get(target).ids.has(decodeURIComponent(url.hash.slice(1))), `${label}: existing fragment target`);
    }
    check(e.tag !== 'base', `${path.relative(SITE, file)}: no base URL overriding prefix`);
  }
}

function main() {
  for (const [file, pin] of Object.entries(pins)) equal(hash(fs.readFileSync(path.join(ROOT, 'reference/inputs', file))), pin, `Pinned input bytes: ${file}`);
  const graph = json(path.join(ROOT, 'reference/inputs/canonical-690-graph.json'));
  const scope = json(path.join(ROOT, 'reference/inputs/mvp-scope-181.json'));
  equal(scope.selected_ids.length, new Set(scope.selected_ids).size, 'Lite subset unique');
  const lite = new Set(scope.selected_ids);
  const expected = graphAudit(graph, json(path.join(ROOT, 'reference/GRAPH_FACTS.json')), lite);
  canonicalById=expected.byKC;
  const contract = json(path.join(ROOT, 'reference/CONTRACT.json'));
  const config = loadDeployment(ROOT, process.env.LESSON_SOURCE_REPO ?? path.dirname(ROOT));
  const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
  const publicationRoot = path.resolve(process.env.LESSON_SOURCE_REPO ?? path.dirname(ROOT), '..');
  const publicationShellSource = sitePackage ? ['shared/navigation.mjs','shared/navigation.json','kotisivu/assets/brand.css','kotisivu/assets/site.js'].map(name=>name+'\0'+fs.readFileSync(path.join(publicationRoot,name),'utf8')).join('\n') : '';
  const version = hash(read('build.mjs') + read('site-config.mjs') + read('runtime.mjs') + read('content.mjs') + read('audience.mjs') + read('assets/audience.js') + read('assets/lesson-loader.js') + read('assets/shell.css') + read('assets/shell.js') + read('assets/lesson-flow.js') + publicationShellSource + encode(config) + encode(contract));
  packages=loadPackages(ROOT,expected.ids,process.env.LESSON_FIXTURES==='1');
  if(process.env.LESSON_FIXTURES!=='1')for(const id of scope.selected_ids)check(packages.get(id)?.metadata.extensions.audienceContract===1,id+': selected181 explicit audience source contract required');
  const inventory = auditInventory(graph), records = new Map();
  for (const asset of ['shell.css', 'shell.js','lesson-loader.js','audience.js','lesson-flow.js']) equal(hash(fs.readFileSync(path.join(SITE, 'assets', asset))), hash(fs.readFileSync(path.join(ROOT, 'assets', asset))), `Published shared asset integrity: ${asset}`);
  const pageFiles = files(path.join(SITE, 'lessons'));
  equal(pageFiles.map(f => path.relative(path.join(SITE, 'lessons'), f)), sorted(expected.ids.map(id => `${id}.html`)), 'Exactly 690 lesson HTML files; no extras, nested copies or temporary outputs');
  const recordFiles = files(path.join(ROOT, 'records'));
  equal(recordFiles.map(f => path.relative(path.join(ROOT, 'records'), f)), sorted(expected.ids.map(id => `${id}.json`)), 'Exactly 690 scaffold records');
  equal(files(path.join(ROOT, 'checkpoints')).map(f => path.relative(path.join(ROOT, 'checkpoints'), f)), sorted(expected.ids.map(id => `${id}.json`)), 'Exactly 690 checkpoint records');
  const docs = new Map();
  for (const file of files(SITE).filter(f => f.endsWith('.html'))) {
    const source = fs.readFileSync(file, 'utf8');
    check(/^\s*<!doctype html>/i.test(source), `${file}: HTML5 doctype`);
    const doc = parseHTML(source, path.relative(SITE, file)); docs.set(file, doc);
    equal(doc.elements.filter(e => e.tag === 'html').length, 1, `${file}: one HTML document`);
    equal(doc.elements.filter(e => e.tag === 'body').length, 1, `${file}: one body`);
    equal(doc.elements.filter(e => e.tag === 'h1').length, 1, `${file}: one primary heading`);
  }
  check(docs.has(path.join(SITE, 'index.html')), 'Index HTML exists');
  equal(sorted([...docs.keys()].map(f => path.relative(SITE, f))), sorted(['index.html', ...expected.ids.map(id => `lessons/${id}.html`),...[...packages.keys()].map(id=>`presentations/${id}.html`)]), 'Exactly canonical teacher pages and authored audience projections');
  for (const n of expected.nodes) {
    const page = path.join(SITE, 'lessons', `${n.id}.html`), doc = docs.get(page);
    if (doc) {
      const h1 = doc.elements.find(e => e.tag === 'h1');
      equal(text(h1), n.title, `${n.id}: canonical title in h1`);
      check(text(doc.root).includes(n.id), `${n.id}: visible KC identity`);
      check(packages.has(n.id)||text(doc.root).includes('Oppituntisisältö valmistellaan seuraavassa vaiheessa'), `${n.id}: visible pending-content state`);
      verifyNav(doc, 'upstream', expected.top.get(n.id), 'top', n.id);
      verifyNav(doc, 'downstream', expected.bottom.get(n.id), 'bottom', n.id);
      const edgeLinks = doc.elements.filter(e => e.attrs['data-edge'] !== undefined);
      check(edgeLinks.every(e => within(e, byId(doc, 'upstream')) || within(e, byId(doc, 'downstream'))), `${n.id}: dependency edges only in their nav regions`);
      auditPage(doc, n);
    }
    try {
      const record = json(path.join(ROOT, 'records', `${n.id}.json`));
      records.set(n.id, record);
      auditRecord(record, n, expected, lite, fs.readFileSync(page), contract, version, inventory);
      const manifest=json(path.join(SITE,'data/lesson-manifest.json')).find(m=>m.kcId===n.id);
      for(const error of verifyGameActions({kcId:n.id,config,canonicalIds:expected.ids,liteIds:[...lite],recordLinks:record.runtimeAvailability,manifestLinks:manifest.gameLinks,html:fs.readFileSync(page,'utf8')}))check(false,n.id+': '+error);
      const pkg=packages.get(n.id);
      if(pkg)check(fs.readFileSync(page,'utf8').includes(composePackage(pkg,n.id)),n.id+': actual source composition');
    } catch (error) { check(false, `${n.id}: record/page readable: ${error.message}`); }
  }
  for(const [id,pkg]of packages){
    const filename=path.join(SITE,'presentations',id+'.html'),doc=docs.get(filename),source=fs.readFileSync(filename,'utf8');
    check(!!doc,id+': separate audience document exists');
    check(source.includes(composePackage(pkg,id,{audience:true})),id+': audience is projected from the same package source');
    const projection=projectAudience(pkg.body,{strict:pkg.metadata.extensions.audienceContract===1});
    for(const n of parseFragment(projection.body).nodes)check(!teacherNode(projection.body,n),id+': no teacher/source metadata in audience projection');
    for(const selectorId of ['upstream','downstream','prerequisites','sharing'])check(!byId(doc,selectorId),id+': no '+selectorId+' in audience DOM');
    check(!doc.elements.some(e=>e.tag==='footer'||e.attrs['data-shell-teacher']!==undefined),id+': no teacher shell/footer in audience DOM');
    const audienceSteps=doc.elements.filter(e=>e.attrs['data-audience-step']!==undefined);
    if(pkg.metadata.extensions.audienceContract===1){check(audienceSteps.length>0,id+': source-owned audience steps');equal(audienceSteps.filter(e=>e.attrs.hidden===undefined).length,1,id+': one initial visible step');}
    check(doc.elements.some(e=>e.tag==='meta'&&e.attrs.name==='robots'&&e.attrs.content==='noindex, follow'),id+': separate projection stays noindex');
  }
  auditLocalLinks(docs);
  auditIndexes(expected, lite, records, docs, config, version);
  return expected.derived;
}

let coverage;
try { coverage = main(); } catch (error) { failures.push(`Audit could not finish: ${error.stack}`); }
// --allow-pending is a pre-promotion structural gate. Exit zero permits the
// generator to promote; it does not itself promote or certify pending records.
const structuralChecksPassed = failures.length === 0;
const passed = structuralChecksPassed && validationCounts.verified === 690 && validationCounts.pending_validation === 0;
console.log(JSON.stringify({ validator: 'independent-phase1/1', passed, structuralChecksPassed, allowPending, validationCounts, completionState: !structuralChecksPassed ? 'failed' : passed ? 'verified' : 'pending_validation', checks, failureCount: failures.length, coverage, failures, limits: ['Static/data/hash audit only; browser layout, copying, idempotence and interrupted resume require separate execution review.', 'Scaffold verification is not pedagogical approval or endpoint verification.', '--allow-pending may exit zero for structurally valid pending output; only passed:true certifies a complete verified set.'] }, null, 2));
if (failures.length) process.exitCode = 1;

