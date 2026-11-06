// Protected-boundary check for the visual-polish branch: every changed path since the base
// must be on the allowlist, and every protected tree must be byte-identical (same git tree
// object, so the same tracked path set and contents). Includes uncommitted changes.
// Usage: node tools/visual-polish/check-boundary.mjs [base=1f65cd4]
import { execFileSync } from 'node:child_process';

const base = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? '1f65cd4';
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const allowed = [
  /^public\/kotisivu\/assets\/visual-polish\//,
  /^public\/kotisivu\/index\.html$/,
  /^public\/kotisivu\/publication-manifest\.json$/,
  /^lite\/public\/visual-polish\//,
  /^lite\/index\.html$/,
  /^lite\/publication-tests\/visual-polish-[a-z-]+\.spec\.ts$/,
  /^tools\/visual-polish\//,
  /^docs\/visual-polish\//,
];
const protectedTrees = ['lite/src', 'lite/reference', 'lite/public/characters', 'lite/public/art', 'lite/public/lite-runtime.json', 'lite/public/canonical-ids.json',
  'lite/e2e', 'lite/launch-tests', 'lite/publication-tests/publication.spec.ts', 'lite/publication-tests/launch-publication.spec.ts', 'lite/package.json', 'lite/package-lock.json',
  'public/oppitunnit', 'public/oppimisverkko', 'public/whitepaper', 'public/kotisivu/assets/brand.css', 'public/kotisivu/assets/site.js', 'public/kotisivu/assets/art',
  'art', 'docs/releases', 'ops', '.github', 'tools/launch', 'tools/imagegen', 'AGENTS.md', '.gitignore'];

const changed = new Set([
  ...git('diff', '--name-only', base, 'HEAD').split('\n'),
  ...git('diff', '--name-only', 'HEAD').split('\n'),
  ...git('ls-files', '--others', '--exclude-standard').split('\n'),
].filter(Boolean));
const problems = [...changed].filter((p) => !allowed.some((re) => re.test(p))).map((p) => `not on allowlist: ${p}`);
const treeOf = (rev, p) => { try { return git('rev-parse', `${rev}:${p}`); } catch { return null; } };
const rows = [];
for (const p of protectedTrees) {
  const a = treeOf(base, p), b = treeOf('HEAD', p);
  const dirty = git('status', '--porcelain', '--', p);
  rows.push({ path: p, base: a?.slice(0, 12) ?? '—', head: b?.slice(0, 12) ?? '—', same: a === b && !dirty });
  if (a !== b || dirty) problems.push(`protected path changed: ${p}`);
}
if (process.argv.includes('--table')) for (const r of rows) console.log(`| ${r.path} | ${r.base} | ${r.head} | ${r.same ? 'sama' : 'MUUTTUNUT'} |`);
console.log(`changed paths: ${changed.size}, protected paths checked: ${protectedTrees.length}`);
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log('protected boundary: OK');
