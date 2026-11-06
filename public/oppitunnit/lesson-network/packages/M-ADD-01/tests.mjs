import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {scenarios, sumParts, joinState, drawJoin, checkTotal, checkSentence} from './lesson.mjs';
import {digest, validateModule, loadPackages, composePackage} from '../../content.mjs';

test('joining conserves each piece, origin and final slot across every supported state', () => {
  for (let index = 0; index < scenarios.length; index++) {
    const s = scenarios[index], total = s.parts.reduce((a, b) => a + b, 0);
    for (let step = 0; step <= total * 100; step++) {
      const state = joinState(index, step / 100);
      assert.equal(state.total, total); assert.equal(state.joined + state.remaining, total);
      assert.equal(state.pieces.length, total); assert.equal(new Set(state.pieces.map(p => p.id)).size, total);
      assert.equal(state.pieces.filter(p => p.joined).length, state.joined);
      for (let part = 0; part < s.parts.length; part++) assert.equal(state.pieces.filter(p => p.part === part).length, s.parts[part]);
      for (const p of state.pieces) { assert(Number.isFinite(p.x) && Number.isFinite(p.y)); assert(p.x >= 13 && p.x <= 407 && p.y >= 13 && p.y <= 297); }
    }
    const end = joinState(index, total); assert(end.pieces.every(p => p.joined));
    assert.equal((drawJoin(index, total).match(/data-piece=/g) ?? []).length, total);
    for (const bad of [-1, total + 0.01, NaN, Infinity, '0', null]) assert.throws(() => joinState(index, bad), RangeError);
  }
});
test('direct totals require all parts; optional marks and viewing are absent from truth inputs', () => {
  for (let index = 0; index < scenarios.length; index++) {
    const total = sumParts(scenarios[index].parts);
    for (let n = 0; n <= 10; n++) assert.equal(checkTotal(index, n).ok, n === total);
    for (const value of [null, undefined, '']) assert.equal(checkTotal(index, value).code, 'missing');
    for (const value of [-1, 1.5, NaN, Infinity, '5', false, {}, [], 11]) assert.equal(checkTotal(index, value).ok, false);
  }
});
test('sentence uses the original operand multiset, accepts both orders and preserves repeated operands', () => {
  for (let index = 0; index < scenarios.length; index++) {
    const parts = scenarios[index].parts, total = sumParts(parts);
    assert.equal(checkSentence(index, [...parts], total).ok, true);
    assert.equal(checkSentence(index, [...parts].reverse(), total).ok, true);
    for (let i = 0; i < parts.length; i++) {
      const missing = [...parts]; missing[i] = null; assert.equal(checkSentence(index, missing, total).code, 'missing');
      const invalid = [...parts]; invalid[i] = NaN; assert.equal(checkSentence(index, invalid, total).ok, false);
      const wrong = [...parts]; wrong[i]++; assert.equal(checkSentence(index, wrong, total).ok, false);
      const hole = [...parts]; delete hole[i]; assert.throws(() => checkSentence(index, hole, total), RangeError);
    }
    for (const bad of [[], [...parts, 1], Array(parts.length), null]) assert.throws(() => checkSentence(index, bad, total), RangeError);
    const extra = [...parts]; extra.other = 1; assert.throws(() => checkSentence(index, extra, total), RangeError);
    assert.equal(checkSentence(index, [...parts], null).code, 'missing');
    assert.equal(checkSentence(index, [...parts], total - 1).ok, false);
  }
  assert.equal(checkSentence(0, [1, 4], 5).code, 'parts');
  assert.equal(checkSentence(1, [2, 2], 4).ok, true);
  assert.equal(checkSentence(1, [2, null], 4).ok, false);
  for (const p of [[2, 3, 1], [1, 2, 3], [3, 1, 2], [2, 1, 3], [3, 2, 1], [1, 3, 2]]) assert.equal(checkSentence(4, p, 6).ok, true);
});
test('unsupported cases, sparse/inherited/extra parts and invalid domains cannot become successes', () => {
  for (const index of [-1, 5, NaN, '0', null, {}, [], 'constructor']) {
    assert.throws(() => joinState(index, 0), RangeError); assert.throws(() => checkTotal(index, 5), RangeError); assert.throws(() => checkSentence(index, [3, 2], 5), RangeError);
  }
  const sparse = [3, 2]; delete sparse[0]; const extra = [3, 2]; extra.other = 1;
  const inherited = Array(2); Object.setPrototypeOf(inherited, Object.assign(Object.create(Array.prototype), {0: 3, 1: 2}));
  for (const parts of [sparse, extra, inherited, [3], [1, 2, 3, 4], [0, 2], [-1, 2], [1.5, 2], [NaN, 2], [6, 6], ['3', 2]]) assert.throws(() => sumParts(parts), RangeError);
});
test('exact canonical metadata, assets, source hashes and source-only staged composition', () => {
  const dir = new URL('./', import.meta.url), root = new URL('../../', import.meta.url), p = JSON.parse(fs.readFileSync(new URL('lesson.json', dir)));
  const graphBytes = fs.readFileSync(new URL('reference/inputs/canonical-690-graph.json', root)), node = JSON.parse(graphBytes).nodes.find(n => n.id === 'M-ADD-01');
  assert.equal(p.planning.sourceGraphHash, digest(graphBytes)); assert.deepEqual(p.planning.canonicalPrerequisiteGroups, node.prerequisite_groups);
  assert.equal(p.planning.gradeBand, node.grade_band); assert.equal(p.planning.role, node.mastery_role); assert.equal(p.planning.teacherObjective, node.title);
  const lite = new URL('authority/production-181-v2/lite/', root), manifest = JSON.parse(fs.readFileSync(new URL('authority/production-181-v2/lite-source-hashes.json', root)));
  for (const [file, hash] of Object.entries(p.alignment.sourceHashes)) { assert.equal(digest(fs.readFileSync(new URL(file, lite))), hash); assert.equal(manifest[file], hash); }
  for (const a of p.assets) assert.equal(digest(fs.readFileSync(new URL(a.path, a.path.startsWith('shared/') ? root : dir))), a.sha256);
  validateModule(fs.readFileSync(new URL('lesson.mjs', dir), 'utf8'));
  const svg = fs.readFileSync(new URL('joining.svg', dir), 'utf8'); assert(svg.includes(drawJoin(0, 0))); assert(svg.includes(drawJoin(0, 5)));
  const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'ADD01-isolated-contract-'));
  try {
    fs.mkdirSync(path.join(stage, 'packages'), {recursive: true}); fs.cpSync(dir, path.join(stage, 'packages/M-ADD-01'), {recursive: true});
    fs.mkdirSync(path.join(stage, 'reference/inputs'), {recursive: true}); fs.writeFileSync(path.join(stage, 'reference/inputs/mvp-scope-181.json'), JSON.stringify({selected_ids: ['M-ADD-01']}));
    for (const a of p.assets.filter(a => a.path.startsWith('shared/'))) { const dest = path.join(stage, a.path); fs.mkdirSync(path.dirname(dest), {recursive: true}); fs.copyFileSync(new URL(a.path, root), dest); }
    const packages = loadPackages(stage, ['M-ADD-01']); assert.equal(packages.size, 1);
    const html = composePackage(packages.get('M-ADD-01'), 'M-ADD-01'); assert(html.includes('../content/M-ADD-01/joining.svg')); assert(html.includes('../shared/aava/curious.png'));
    assert.equal(packages.get('M-ADD-01').metadata.humanReview.state, 'pending');
  } finally { fs.rmSync(stage, {recursive: true, force: true}); }
});
