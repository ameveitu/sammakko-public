// Append a new technical checkpoint after executing the exact181 suite.
// Previous receipt objects and all historical files remain unchanged.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {verifyValidationReceipt} from './validation-receipt.mjs';
import {loadPackages} from './content.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const [run, ...extra] = process.argv.slice(2);
assert(/^[A-Za-z0-9_-]+$/.test(run ?? '') && extra.length === 0, 'Usage: node lesson-network/refresh-technical-receipts.mjs unique-run-name');
const relative = `lesson-network/evidence/production/B16/validation/${run}/receipt.json`;
const proof = JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
assert(verifyValidationReceipt(root, proof), 'Fresh receipt does not validate against the current source and test output');
const selected = JSON.parse(fs.readFileSync(path.join(root, 'lesson-network/reference/inputs/mvp-scope-181.json'), 'utf8')).selected_ids;
assert.equal(selected.length, 181);
assert.equal(new Set(selected).size, 181);
assert.deepEqual(Object.keys(proof.contentRevisions).sort(), [...selected].sort(), 'Only a complete exact181 run can refresh the shared-shell checkpoint');
const filename = path.join(root, 'lesson-network/evidence/production/technical-receipts.json');
const previous = JSON.parse(fs.readFileSync(filename, 'utf8'));
assert(Array.isArray(previous));
const packages=loadPackages(path.join(root,'lesson-network'),selected);
const additions = selected.map(kcId => {
  assert(!previous.some(item => item.kcId === kcId && item.validationReceipt === relative), 'This run is already recorded: ' + kcId);
  const contentRevision = proof.contentRevisions[kcId];
  const previousIndex = previous.findLastIndex(item => item.kcId === kcId && item.status === 'technical_checked');
  assert(previousIndex >= 0, 'No previously reviewed lesson: ' + kcId);
  const metadata=packages.get(kcId)?.metadata;
  assert.equal(metadata?.contentRevision,contentRevision,'Actual content differs from executed proof: '+kcId);
  const unchanged=previous[previousIndex].contentRevision===contentRevision;
  if(!unchanged){
    for(const kind of ['contentReview','alignmentReview'])assert(metadata[kind].state==='reviewed'&&metadata[kind].revision===contentRevision,'Revised lesson needs current content and alignment reviews: '+kcId);
  }
  return {
    kcId, contentRevision, status: 'technical_checked', batch: 'publication-181',
    review: unchanged?'Unchanged lesson content; fresh exact181 package tests and route-contract tests against the current shared build/source closure. Earlier content reviews remain at previousReceiptIndex. This is not new human/learner or efficacy evidence.':'Revised lesson content with current revision-bound content and alignment reviews; fresh exact181 package tests and route-contract tests. The previous revision remains at previousReceiptIndex. No human/learner or efficacy approval.',
    previousReceiptIndex: previousIndex,
    tests: [`node lesson-network/check-package-tests.mjs B16 ${run}${proof.checkpointMode==='current'?' --current':''}`],
    validationReceipt: relative,
    openIssues: ['Human/learner understanding and efficacy not validated.', 'Live endpoint reachability and full manual accessibility review are separate from the source/package checks.'],
    humanReview: 'not_performed',
  };
});
fs.writeFileSync(filename + '.tmp', JSON.stringify([...previous, ...additions], null, 2) + '\n');
fs.renameSync(filename + '.tmp', filename);
console.log(JSON.stringify({appended: additions.length, preserved: previous.length, validationReceipt: relative}));
