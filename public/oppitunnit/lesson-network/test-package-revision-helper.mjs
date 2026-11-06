// Test-only source contract: later reviewed revisions must keep a full semantic binding.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { loadPackages } from './content.mjs';

export function assertPackageRevision(testUrl, minimum) {
  const directory = path.dirname(fileURLToPath(testUrl));
  const id = path.basename(directory), network = path.resolve(directory, '../..');
  const metadata = JSON.parse(fs.readFileSync(path.join(directory, 'lesson.json'), 'utf8'));
  assert(Number.isSafeInteger(metadata.revision) && metadata.revision >= minimum,
    `${id}: source revision must be an integer at least ${minimum}`);
  const pkg = loadPackages(network, [id], false, { onlySelected: true }).get(id);
  assert(pkg, `${id}: validated source package required`);
  // The contract includes semantic metadata, body, module and declared assets;
  // review-history appends intentionally do not change the reviewed content.
  const semanticBytes = JSON.stringify({ ...metadata, reviews: undefined }) +
    pkg.body + (pkg.module ?? '') + metadata.assets.map(asset => asset.sha256).join('');
  const hash = createHash('sha256').update(semanticBytes).digest('hex');
  assert.equal(pkg.metadata.contentHash, hash);
  assert.equal(pkg.metadata.contentRevision, `${metadata.revision}@${hash}`);
  return pkg.metadata.contentRevision;
}
