// Run the existing presentation acceptance harness against a quiet, current build.
// Only a temporary plan and new evidence are written; lesson sources stay untouched.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { projectAudience } from '../../public/oppitunnit/lesson-network/audience.mjs';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const network = path.join(repo, 'public/oppitunnit/lesson-network');
const site = path.join(network, 'site');
const plans = path.join(repo, 'docs/releases/launch/lessons');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const args = process.argv.slice(2);
assert(args.length === 0 || (args.length === 2 && args[0] === '--output'),
  'Usage: check-launch-presentations.mjs [--output new-evidence-directory]');
const output = args.length ? path.resolve(args[1]) :
  path.join(repo, '.build', 'launch-presentation-evidence');
assert(!fs.existsSync(output), 'Use a new output directory; previous evidence is immutable');
fs.mkdirSync(path.dirname(output), { recursive: true });

const ids = read(path.join(network, 'reference/inputs/mvp-scope-181.json')).selected_ids;
const lite = read(path.join(repo, 'lite/public/lite-runtime.json')).runtimeAvailability.ids;
assert.equal(ids.length, 181);
assert.equal(new Set(ids).size, 181);
assert.deepEqual([...ids].sort(), [...lite].sort(), 'Presentation and playable scopes must match');
const built = fs.readdirSync(path.join(site, 'presentations'))
  .filter(name => name.endsWith('.html')).map(name => name.slice(0, -5)).sort();
assert.deepEqual(built, [...ids].sort(), 'Build the complete current exact181 presentation site first');
const stages = new Map(ids.map(id => {
  const pkg = path.join(network, 'packages', id), meta = read(path.join(pkg, 'lesson.json'));
  assert.equal(meta.extensions.audienceContract, 1, id + ': explicit audience contract required');
  return [id, projectAudience(fs.readFileSync(path.join(pkg, meta.body), 'utf8'), { strict: true }).steps];
}));

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
const server = http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    let file = path.resolve(site, '.' + pathname);
    if (file !== site && !file.startsWith(site + path.sep)) throw Error('Outside build');
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    const real = fs.realpathSync(file);
    if (!real.startsWith(fs.realpathSync(site) + path.sep) || !fs.statSync(real).isFile()) throw Error('Outside build');
    res.writeHead(200, { 'Content-Type': mime[path.extname(real)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') res.end();
    else fs.createReadStream(real).on('error', () => res.destroy()).pipe(res);
  } catch { res.writeHead(404).end('Not found'); }
});
let plan;
try {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  plan = fs.mkdtempSync(path.join(plans, 'CI-EXACT181-'));
  fs.writeFileSync(path.join(plan, 'plan.json'), JSON.stringify({ ids }, null, 2) + '\n');
  const address = server.address();
  const status = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(plans, 'batch-browser.mjs')], {
      cwd: repo, stdio: 'inherit', env: { ...process.env,
        LESSON_BATCH: path.basename(plan), LESSON_BROWSER_RUN: 'ci-exact181',
        LESSON_BROWSER_OUTPUT: output,
        LESSON_BROWSER_BASE_URL: `http://127.0.0.1:${address.port}/` },
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => resolve({ code, signal }));
  });
  assert.equal(status.code, 0, 'Presentation harness failed; inspect the new receipt and screenshots');
  assert.equal(status.signal, null);
  const receipt = read(path.join(output, 'receipt.json'));
  assert.equal(receipt.passed, true);
  assert.equal(receipt.sourceUnchanged, true);
  assert.deepEqual([...receipt.ids].sort(), [...ids].sort());
  const expectedRows = [], expectedResets = [];
  for (const width of [1280, 1024]) for (const id of ids) {
    for (let index = 0; index < stages.get(id); index++) expectedRows.push(`${id}/${width}/${index}`);
    expectedResets.push(`${id}/${width}`);
  }
  assert.deepEqual(receipt.rows.map(r => `${r.kc}/${r.size.width}/${r.index}`).sort(), expectedRows.sort(),
    'Every current stage must be inspected at both projector sizes exactly once');
  assert.deepEqual(receipt.resetRows.map(r => `${r.kc}/${r.size.width}`).sort(), expectedResets.sort(),
    'Every current presentation must be reset at both projector sizes exactly once');
  console.log(JSON.stringify({ exact181: ids.length, stages: receipt.rows.length,
    resets: receipt.resetRows.length, evidence: output, humanValidation: 'pending' }));
} finally {
  await new Promise(resolve => server.close(resolve));
  if (plan) fs.rmSync(plan, { recursive: true });
}
