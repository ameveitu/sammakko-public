import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {packageDeployment} from './site-config.mjs';
import {resolveGame} from './runtime.mjs';
import {verifyGameActions} from './verify-game-actions.mjs';

const baseline = JSON.parse(fs.readFileSync(new URL('./reference/RUNTIME_LINKS.json', import.meta.url), 'utf8'));
const kcId = 'M-ALG-08', outside = 'OUTSIDE-LITE';
const ids = [kcId, ...Array.from({length: 180}, (_, i) => `KC-${i}`)];
const canonical = [...ids, outside];
function manifest() {
  return {schema: 'sammakko-lite-runtime/1', adapter: 'lite', route: {template: '#kc/{encodedCanonicalKCId}', encoding: 'encodeURIComponent'}, build: {kcCount: 181, contentRev: 'test-build'}, runtimeAvailability: {state: 'build_manifest', ids}};
}
const config = () => packageDeployment(baseline, manifest(), ids, 'a'.repeat(64));
function section(kind, result) {
  return `<section data-game-kind="${kind}"><h3>${kind}</h3><p>${result.status}</p>${result.packageReady || result.classroomReady ? `<a data-game-action="open" href="${result.url}" target="_blank" rel="noopener">Avaa</a><button type="button" data-game-action="copy" data-copy-url="${result.url}">Kopioi</button>` : '<button data-game-action="open" disabled>Avaa</button><button data-game-action="copy" disabled>Kopioi</button>'}</section>`;
}
function audit(deployment, id = kcId) {
  const links = Object.fromEntries(['lite', 'sammakko'].map(kind => [kind, resolveGame(id, kind, deployment, canonical, ids)]));
  return {kcId: id, config: deployment, canonicalIds: canonical, liteIds: ids, recordLinks: links, manifestLinks: structuredClone(links), html: `<main data-kc="${id}">${section('lite', links.lite)}${section('sammakko', links.sammakko)}</main>`};
}

test('same-origin package opens exactly the selected KC without claiming a live endpoint', () => {
  const deployment = config();
  assert.equal(deployment.adapters.lite.endpointVerification, 'not_configured');
  assert.equal(deployment.adapters.lite.studentReachability, 'unverified');
  const result = resolveGame(kcId, 'lite', deployment, canonical, ids);
  assert.equal(result.url, `/lite/#kc/${kcId}`);
  assert.equal(result.packageReady, true);
  assert.equal(result.classroomReady, false);
  assert.deepEqual(verifyGameActions(audit(deployment)), []);
});

test('standalone reference contract is preserved and not activated by scope membership', () => {
  const before = JSON.stringify(baseline);
  config();
  assert.equal(JSON.stringify(baseline), before);
  assert.equal(resolveGame(kcId, 'lite', baseline, canonical, ids).url, null);
  assert.equal(resolveGame(kcId, 'lite', undefined, canonical, ids).status, 'route_unsupported');
});

test('scaffolds and unknown IDs cannot acquire a Lite launch', () => {
  assert.equal(resolveGame(outside, 'lite', config(), canonical, ids).status, 'outside_current_lite_scope');
  assert.equal(resolveGame('UNKNOWN', 'lite', config(), canonical, ids).status, 'unknown_kc');
  assert.deepEqual(verifyGameActions(audit(config(), outside)), []);
});

for (const [name, mutate] of [
  ['wrong route', m => {m.route.template = '#journey/{encodedCanonicalKCId}';}],
  ['wrong encoding', m => {m.route.encoding = 'none';}],
  ['wrong manifest schema', m => {m.schema = 'unknown';}],
  ['missing availability', m => {delete m.runtimeAvailability;}],
  ['extra ID', m => {m.runtimeAvailability.ids = [...ids, outside];}],
  ['duplicate ID', m => {m.runtimeAvailability.ids = [...ids.slice(0, 180), kcId];}],
  ['different exact181', m => {m.runtimeAvailability.ids = [...ids.slice(0, 180), outside];}],
]) test(`package fails closed for ${name}`, () => {
  const m = manifest(); mutate(m); assert.throws(() => packageDeployment(baseline, m, ids, 'a'.repeat(64)));
});

for (const base of ['//elsewhere.example/lite/', 'https://elsewhere.example/lite/', '/lite/?profile=secret', '/other/', 'javascript:alert(1)', '/lite/#kc/WRONG']) {
  test(`same-origin mount rejects unexpected base: ${base}`, () => {
    const deployment = config(); deployment.adapters.lite.baseUrl = base;
    assert.equal(resolveGame(kcId, 'lite', deployment, canonical, ids).status, 'invalid_base_url');
    assert.deepEqual(verifyGameActions(audit(deployment)), []);
  });
}

test('same-origin bridge still requires route, runtime membership and independent audits', () => {
  for (const [mutate, status] of [
    [a => {a.bridgeVerification = 'unverified';}, 'route_unsupported'],
    [a => {a.routeKind = 'journey_hash';}, 'invalid_base_url'],
    [a => {a.runtimeAvailability.ids = [];}, 'kc_not_implemented'],
    [a => {delete a.runtimeAvailability;}, 'runtime_index_missing'],
  ]) {
    const deployment = config(); mutate(deployment.adapters.lite);
    assert.equal(resolveGame(kcId, 'lite', deployment, canonical, ids).status, status);
    assert.deepEqual(verifyGameActions(audit(deployment)), []);
  }
});

test('a forged active link or classroom-ready claim cannot pass the independent audit', () => {
  const wrong = audit(config()); wrong.html = wrong.html.replace(`/lite/#kc/${kcId}`, '/lite/#kc/WRONG');
  assert(verifyGameActions(wrong).some(error => error.includes('open action')));
  const claim = audit(config()); claim.recordLinks.lite.classroomReady = true;
  assert(verifyGameActions(claim).some(error => error.includes('classroomReady')));
  const outsideClaim = audit(config(), outside);
  outsideClaim.html = outsideClaim.html.replace('<button data-game-action="open" disabled>Avaa</button>', `<a data-game-action="open" href="/lite/#kc/${outside}" target="_blank" rel="noopener">Avaa</a>`);
  assert(verifyGameActions(outsideClaim).some(error => error.includes('disabled button')));
});

test('kc_hash is not silently applied to the historical full game', () => {
  const deployment = config(); deployment.adapters.sammakko = {...deployment.adapters.lite};
  assert.equal(resolveGame(kcId, 'sammakko', deployment, canonical, ids).status, 'route_unsupported');
  assert.deepEqual(verifyGameActions(audit(deployment)), []);
});
