// Exercise the real finalizer on isolated synthetic packages, never project reviews.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadPackages } from '../../public/oppitunnit/lesson-network/content.mjs';
import { lessonGeneratorPaths, sourceBindings } from '../../tools/launch/source-bindings.mjs';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sammakko-review-gate-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (relative, bytes) => {
    const file = path.join(root, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  };
  for (const relative of lessonGeneratorPaths) write(relative, '{}\n');
  for (const relative of ['tools/launch/finalize-reviews.mjs', 'tools/launch/source-bindings.mjs',
    'public/oppitunnit/lesson-network/content.mjs', 'public/oppitunnit/lesson-network/audience.mjs']) {
    write(relative, fs.readFileSync(path.join(repo, relative)));
  }
  write('public/oppitunnit/package.json', '{"type":"module"}\n');
  fs.symlinkSync(path.join(repo, 'public/oppitunnit/node_modules'),
    path.join(root, 'public/oppitunnit/node_modules'), 'dir');
  const ids = Array.from({ length: 181 }, (_, i) => `TEST-${String(i + 1).padStart(3, '0')}`);
  const network = path.join(root, 'public/oppitunnit/lesson-network');
  write('public/oppitunnit/lesson-network/reference/inputs/mvp-scope-181.json',
    JSON.stringify({ selected_ids: ids }));
  for (const id of ids) {
    const base = `public/oppitunnit/lesson-network/packages/${id}/`;
    write(base + 'body.html', '<p data-teaching-step="question">Synthetic fixture</p>');
    write(base + 'lesson.json', JSON.stringify({ schemaVersion: 1, kcId: id, revision: 1,
      state: 'draft', body: 'body.html', module: null, assets: [], research: [], reviews: [],
      alignment: {}, planning: {}, extensions: { audienceContract: 1 } }));
  }
  write('lite/src/synthetic.ts', 'export const fixture = 1;\n');
  execFileSync('git', ['init', '--quiet'], { cwd: root });
  execFileSync('git', ['add', 'lite/src/synthetic.ts'], { cwd: root });
  const evidence = 'docs/releases/launch/synthetic-evidence.txt';
  write(evidence, 'Synthetic verifier fixture; no project acceptance.\n');
  const packages = loadPackages(network, ids);
  const decisions = { kind: 'software_source_and_delta_review', humanValidation: 'pending',
    ...sourceBindings(root), nodes: ids.map(kc => {
      const body = `public/oppitunnit/lesson-network/packages/${kc}/body.html`;
      // contentRevision binds all semantic metadata. Raw lesson.json is excluded
      // because --apply appends its review history without changing that revision.
      return { kc, lessonRevision: packages.get(kc).metadata.contentRevision,
        decision: 'reviewed_with_stated_limits', reviewer: 'synthetic-test',
        note: 'Synthetic verification only', sourceSha256: { [body]: sha(fs.readFileSync(path.join(root, body))) },
        evidence: [{ path: evidence, sha256: sha(fs.readFileSync(path.join(root, evidence))) }] };
    }) };
  write('docs/releases/launch/review-decisions.json', JSON.stringify(decisions));
  const run = (...args) => spawnSync(process.execPath, ['tools/launch/finalize-reviews.mjs', ...args],
    { cwd: root, encoding: 'utf8' });
  const metadataBytes = () => ids.map(id => fs.readFileSync(path.join(network, 'packages', id, 'lesson.json'), 'utf8'));
  return { root, network, ids, packages, write, run, metadataBytes, evidence };
}
const passes = result => assert.equal(result.status, 0, result.stderr || result.stdout);

test('appending explicit reviews preserves semantic bindings and remains read-only verifiable', t => {
  const f = fixture(t);
  passes(f.run());
  passes(f.run('--apply'));
  const afterApply = f.metadataBytes();
  passes(f.run());
  assert.deepEqual(f.metadataBytes(), afterApply, 'CI verification must not modify metadata');
  const current = loadPackages(f.network, f.ids);
  for (const [id, pkg] of current) {
    assert.equal(pkg.metadata.contentRevision, f.packages.get(id).metadata.contentRevision);
    assert.equal(pkg.metadata.contentReview.state, 'reviewed');
    assert.equal(pkg.metadata.alignmentReview.state, 'reviewed');
    assert.equal(pkg.metadata.humanReview.state, 'pending');
  }
});

test('a later Lite source edit rejects acceptance before any review metadata is written', t => {
  const f = fixture(t), before = f.metadataBytes();
  f.write('lite/src/synthetic.ts', 'export const fixture = 2;\n');
  const result = f.run('--apply');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /stale global binding: liteGeneratorSha256/);
  assert.deepEqual(f.metadataBytes(), before);
});

test('changed evidence rejects the full batch before any review metadata is written', t => {
  const f = fixture(t), before = f.metadataBytes();
  f.write(f.evidence, 'Changed evidence\n');
  const result = f.run('--apply');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Stale\/unsafe evidence/);
  assert.deepEqual(f.metadataBytes(), before);
});

test('a shared navigation edit invalidates the Lite binding before any reviews are written', t => {
  const f = fixture(t), before = f.metadataBytes();
  f.write('public/shared/navigation.json', '{"changedRoute":true}\n');
  const result = f.run('--apply');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /stale global binding: liteGeneratorSha256/);
  assert.deepEqual(f.metadataBytes(), before);
});

for (const relative of ['public/shared/navigation.mjs', 'public/kotisivu/assets/brand.css', 'public/kotisivu/assets/site.js', 'public/oppitunnit/lesson-network/assets/lesson-flow.js']) {
  test(`${relative} invalidates the lesson-runtime binding before reviews are written`, t => {
    const f = fixture(t), before = f.metadataBytes();
    f.write(relative, '// changed runtime input\n');
    const result = f.run('--apply');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /stale global binding: lessonGeneratorSha256/);
    assert.deepEqual(f.metadataBytes(), before);
  });
}

test('semantic lesson metadata remains bound even without hashing mutable review history', t => {
  const f = fixture(t), id = f.ids[0];
  const relative = `public/oppitunnit/lesson-network/packages/${id}/lesson.json`;
  const meta = JSON.parse(fs.readFileSync(path.join(f.root, relative), 'utf8'));
  meta.alignment = { changedSemanticInput: true };
  f.write(relative, JSON.stringify(meta));
  const before = f.metadataBytes(), result = f.run('--apply');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unaccepted\/stale revision/);
  assert.deepEqual(f.metadataBytes(), before);
});
