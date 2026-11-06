// Shared source boundary for launch decisions and the per-node ledger.
// Package revisions separately bind each lesson body/module/declared asset.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const network = 'public/oppitunnit/lesson-network/';
export const lessonGeneratorPaths = [
  'build.mjs', 'content.mjs', 'audience.mjs', 'runtime.mjs', 'site-config.mjs',
  'assets/audience.js', 'assets/shell.js', 'assets/shell.css', 'assets/lesson-loader.js', 'assets/lesson-flow.js',
  'deployment.json', 'reference/RUNTIME_LINKS.json', 'reference/CONTRACT.json',
  'reference/HANDOVER_MANIFEST.json', 'reference/inputs/canonical-690-graph.json',
  'reference/inputs/mvp-scope-181.json',
].map(p => network + p).concat([
  'lite/public/lite-runtime.json', 'public/oppitunnit/CONTENT_STATUS.yaml',
  'public/oppitunnit/AUTONOMOUS_52_STATE.json',
  'public/shared/navigation.json', 'public/shared/navigation.mjs',
  'public/kotisivu/assets/brand.css', 'public/kotisivu/assets/site.js',
]).sort();
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
export function sourceBindings(root) {
  const trackedLitePaths = execFileSync('git', ['ls-files', 'lite/src'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  if (!trackedLitePaths.length) throw Error('No tracked Lite source boundary');
  // Lite imports the publication route contract at build time. Bind that dependency
  // as well as its own source; otherwise a link/label edit could reuse stale evidence.
  const liteGeneratorPaths = [...trackedLitePaths, 'public/shared/navigation.json'].sort();
  const digest = paths => sha(paths.map(p => {
    const file = path.join(root, p);
    // The loader uses RUNTIME_LINKS.json when this optional override is absent.
    // Bind absence too: creating the override must invalidate the decision.
    const value = p === network + 'deployment.json' && !fs.existsSync(file) ? 'ABSENT' : sha(fs.readFileSync(file));
    return p + '\0' + value;
  }).join('\n'));
  return { sourceBindingsVersion: 2, liteGeneratorPaths, lessonGeneratorPaths,
    liteGeneratorSha256: digest(liteGeneratorPaths), lessonGeneratorSha256: digest(lessonGeneratorPaths) };
}
export function requireCurrentBindings(decisions, current) {
  if (decisions.sourceBindingsVersion !== 2) throw Error('Missing current source binding version');
  for (const key of ['liteGeneratorSha256', 'lessonGeneratorSha256']) {
    if (!/^[a-f0-9]{64}$/.test(decisions[key] ?? '') || decisions[key] !== current[key]) throw Error(`Missing/stale global binding: ${key}`);
  }
}
