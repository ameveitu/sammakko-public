// Collect findings without upgrading a source review into release or human approval.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const dir = root + 'docs/releases/launch/';
const reports = ['calibration-review', 'feedback-risk-review', 'other-review-lite', 'other-review-root'];
const findings = [], reviewed = new Set(), sources = {};
for (const name of reports) {
  const path = `reviews/${name}.json`, bytes = fs.readFileSync(dir + path);
  sources[path] = crypto.createHash('sha256').update(bytes).digest('hex');
  const report = JSON.parse(bytes);
  for (const row of report.nodes ?? report.reviews) {
    reviewed.add(row.kc);
    for (const finding of row.findings ?? []) findings.push({
      key: `${row.kc}:${finding.id ?? finding.code}`,
      kc: row.kc, severity: finding.severity,
      observation: finding.detail ?? finding.observation,
      originalStatus: finding.status, source: path,
      status: 'awaiting_final_source_and_integration_decision',
    });
  }
}
const decisionsPath = dir + 'finding-decisions.json';
const decisions = fs.existsSync(decisionsPath) ? JSON.parse(fs.readFileSync(decisionsPath)).decisions : {};
for (const finding of findings) if (decisions[finding.key]) finding.resolution = decisions[finding.key];
const ledger = JSON.parse(fs.readFileSync(dir + 'review-ledger.json'));
const ids = ledger.nodes.map(n => n.kc);
if (reviewed.size !== 181 || ids.some(id => !reviewed.has(id))) throw Error('Review coverage is not exact181');
fs.writeFileSync(dir + 'findings.json', JSON.stringify({
  schemaVersion: 1, generatedAt: new Date().toISOString(),
  head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  meaning: '181 source assessments exist. This does not assert current revision acceptance, manual full play, teacher or learner validation.',
  sourceReportSha256: sources, sourceReviewCoverage: 181,
  findings,
}, null, 2) + '\n');
console.log(JSON.stringify({ sourceReviewCoverage: reviewed.size, findings: findings.length, finalDecisions: Object.keys(decisions).length }));
