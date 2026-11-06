// The combined website is opt-in. Standalone exports retain their original
// conservative deployment contract. No live audience/endpoint claim is inferred.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

export function packageDeployment(baseline, manifest, selectedIds, manifestHash) {
  assert.equal(manifest.schema, 'sammakko-lite-runtime/1', 'Unsupported Lite manifest');
  assert.equal(manifest.adapter, 'lite');
  assert.equal(manifest.route?.template, '#kc/{encodedCanonicalKCId}', 'Unverified Lite route contract');
  assert.equal(manifest.route?.encoding, 'encodeURIComponent');
  assert.equal(manifest.runtimeAvailability?.state, 'build_manifest');
  const ids = manifest.runtimeAvailability.ids;
  assert(Array.isArray(ids) && ids.length === 181 && new Set(ids).size === 181, 'Lite availability must contain exactly181 distinct IDs');
  assert.deepEqual([...ids].sort(), [...selectedIds].sort(), 'Lesson and Lite scopes differ');
  assert.equal(manifest.build?.kcCount, 181);
  return {
    ...structuredClone(baseline),
    kind: 'same_origin_site_package',
    sitePackage: {version: 1, endpointsVerified: false},
    adapters: {
      ...structuredClone(baseline.adapters),
      lite: {
        referenceBuild: manifest.build.contentRev,
        sourceManifest: 'lite/public/lite-runtime.json',
        sourceManifestSha256: manifestHash,
        baseUrl: '/lite/', routeKind: 'kc_hash', routeSyntaxState: 'source_verified',
        bridgeVerification: 'verified',
        runtimeAvailability: {state: 'verified_compiled_index', ids: [...ids]},
        deploymentScope: 'same_origin_package',
        endpointVerification: 'not_configured', studentReachability: 'unverified',
        releaseReview: 'technical_site_integration',
      },
    },
  };
}

export function loadDeployment(root, sourceRepo) {
  const local = path.join(root, 'deployment.json');
  const baseline = JSON.parse(fs.readFileSync(fs.existsSync(local) ? local : path.join(root, 'reference/RUNTIME_LINKS.json'), 'utf8'));
  if (process.env.SAMMAKKO_SITE_PACKAGE !== '1') return baseline;
  assert.notEqual(process.env.LESSON_FIXTURES, '1', 'Technical fixtures cannot be packaged as lessons');
  const bytes = fs.readFileSync(path.resolve(sourceRepo, '../../lite/public/lite-runtime.json'));
  const selected = JSON.parse(fs.readFileSync(path.join(root, 'reference/inputs/mvp-scope-181.json'), 'utf8')).selected_ids;
  return packageDeployment(baseline, JSON.parse(bytes), selected, createHash('sha256').update(bytes).digest('hex'));
}
