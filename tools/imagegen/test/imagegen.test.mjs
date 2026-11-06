// Run: node --test tools/imagegen/test/imagegen.test.mjs
// No real network: live tests talk to a local fake server via IMAGEGEN_API_BASE.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as P from '../lib/png.mjs';
import { scanText } from '../../secret-scan.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.resolve(here, '..', 'imagegen.mjs');
const FAKE_KEY = ['s', 'k-proj-', 'TESTONLY', 'x'.repeat(30)].join('');

function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'imagegen-test-')); }

function run(args, env = {}) {
  const home = env.IMAGEGEN_HOME || tmp();
  return new Promise((resolve) => {
    execFile(process.execPath, [CLI, ...args], {
      env: {
        PATH: process.env.PATH, HOME: process.env.HOME,
        IMAGEGEN_HOME: home,
        IMAGEGEN_KEYCHAIN_SERVICE: 'sammakko-imagegen-test-does-not-exist',
        IMAGEGEN_API_BASE: 'http://127.0.0.1:9/never',
        ...env,
      },
    }, (err, stdout, stderr) => resolve({ code: err ? err.code : 0, stdout, stderr, home }));
  });
}

function solidPng(w, h, rgba, box) {
  const data = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const inside = !box || (x >= box.x && x < box.x + box.w && y >= box.y && y < box.y + box.h);
    data.set(inside ? rgba : [0, 0, 0, 0], (y * w + x) * 4);
  }
  return { width: w, height: h, data };
}

test('dry-run works without any key and makes no ledger entry', async () => {
  const r = await run(['gen', '--preset', 'sprite', '--character', 'aava', '--prompt', 'Aava', '--var', 'pose=waving']);
  assert.equal(r.code, 0, r.stderr);
  assert.match(r.stdout, /DRY-RUN/);
  assert.match(r.stdout, /gpt-image-2\.5-flare/);
  assert.match(r.stdout, /hinta-arvio \$0\.2/);
  assert.equal(fs.existsSync(path.join(r.home, 'ledger.jsonl')), false);
});

test('dry-run --json shows the request body with the style and character blocks', async () => {
  const r = await run(['gen', '--preset', 'sprite', '--character', 'loikka', '--prompt', 'Loikka', '--json']);
  const body = JSON.parse(r.stdout.slice(r.stdout.indexOf('\n[') + 1))[0];
  assert.equal(body.background, 'transparent');
  assert.equal(body.output_format, 'png');
  assert.match(body.prompt, /sky-blue frog/);
  assert.match(body.prompt, /colored-pencil/);
});

test('live run without a key stops before any request', async () => {
  const r = await run(['gen', '--prompt', 'test', '--live']);
  assert.equal(r.code, 2);
  assert.match(r.stderr, /API-avainta ei löytynyt/);
});

test('key is refused as a command-line argument', async () => {
  const r = await run(['gen', '--prompt', 'x', `--api-key=${FAKE_KEY}`]);
  assert.notEqual(r.code, 0);
  assert.doesNotMatch(r.stderr + r.stdout, new RegExp(FAKE_KEY));
});

test('monthly budget blocks a live run before the network', async () => {
  const home = tmp();
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  fs.writeFileSync(path.join(home, 'ledger.jsonl'), JSON.stringify({ month, costUsd: 79.95, model: 'gpt-image-2.5-flare', ok: true }) + '\n');
  const r = await run(['gen', '--prompt', 'x', '--quality', 'high', '--live'], { IMAGEGEN_HOME: home, OPENAI_API_KEY: FAKE_KEY });
  assert.equal(r.code, 3);
  assert.match(r.stderr, /kuukausibudjetti ylittyisi/);
});

test('per-run cap blocks an expensive batch-sized request', async () => {
  const r = await run(['gen', '--prompt', 'x', '--quality', 'max', '--size', '2048x2048', '--n', '10']);
  assert.equal(r.code, 3);
  assert.match(r.stderr, /ajokohtaisen katon/);
});

test('invalid sizes and protected folders are rejected', async () => {
  assert.match((await run(['gen', '--prompt', 'x', '--size', '1000x1000'])).stderr, /16:n monikertoja/);
  assert.match((await run(['gen', '--prompt', 'x', '--size', '3840x1024'])).stderr, /kuvasuhde/);
  assert.match((await run(['gen', '--prompt', 'x', '--out', '/tmp/x/lite/public/characters/aava'])).stderr, /suojattu/);
});

test('batch plans every job and totals the estimate', async () => {
  const r = await run(['batch', path.resolve(here, '..', 'examples', 'batch.example.json')]);
  assert.equal(r.code, 0, r.stderr);
  assert.match(r.stdout, /Yhteensä \d+ kuvapyyntöä/);
});

test('live run against a fake server writes image, provenance and ledger, never the key', async () => {
  const png = P.encodePng(solidPng(64, 64, [250, 220, 60, 255], { x: 8, y: 8, w: 40, h: 40 }));
  let auth = null, seenBody = null;
  const server = http.createServer((req, res) => {
    let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => {
      auth = req.headers.authorization; seenBody = JSON.parse(b);
      res.setHeader('content-type', 'application/json'); res.setHeader('x-request-id', 'req_test');
      res.end(JSON.stringify({ data: [{ b64_json: png.toString('base64') }], size: '1024x1024', quality: 'low', background: 'transparent', output_format: 'png',
        usage: { input_tokens: 50, output_tokens: 200, input_tokens_details: { text_tokens: 50, image_tokens: 0 } } }));
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const out = tmp();
  const r = await run(['gen', '--preset', 'draft', '--prompt', 'test duck', '--name', 'fake', '--out', out, '--live'],
    { IMAGEGEN_API_BASE: `http://127.0.0.1:${server.address().port}`, OPENAI_API_KEY: FAKE_KEY });
  server.close();
  assert.equal(r.code, 0, r.stderr);
  assert.equal(auth, `Bearer ${FAKE_KEY}`);
  assert.equal(seenBody.model, 'gpt-image-2.5-flare');
  const files = fs.readdirSync(out);
  const img = files.find((f) => f.endsWith('.png'));
  const prov = JSON.parse(fs.readFileSync(path.join(out, `${img}.json`), 'utf8'));
  assert.equal(prov.model, 'gpt-image-2.5-flare');
  assert.equal(prov.requestId, 'req_test');
  assert.match(prov.prompt, /test duck/);
  assert.equal(prov.cost.actualUsd, (50 * 5 + 200 * 30) / 1e6);
  const ledger = fs.readFileSync(path.join(r.home, 'ledger.jsonl'), 'utf8');
  for (const text of [ledger, JSON.stringify(prov), r.stdout, r.stderr]) assert.equal(text.includes(FAKE_KEY), false);
  assert.match(r.stderr, /ympäristömuuttujasta/);
});

test('API error messages are redacted', async () => {
  const server = http.createServer((req, res) => { res.statusCode = 401; res.end(JSON.stringify({ error: { code: 'invalid_api_key', message: `Incorrect API key provided: ${FAKE_KEY}` } })); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const r = await run(['gen', '--prompt', 'x', '--live'], { IMAGEGEN_API_BASE: `http://127.0.0.1:${server.address().port}`, OPENAI_API_KEY: FAKE_KEY });
  server.close();
  assert.equal(r.code, 1);
  assert.match(r.stderr, /invalid_api_key/);
  assert.equal((r.stderr + r.stdout).includes(FAKE_KEY), false);
  assert.equal(fs.readFileSync(path.join(r.home, 'ledger.jsonl'), 'utf8').includes(FAKE_KEY), false);
});

test('png: roundtrip, trim with padding, tiling and seam score', () => {
  const img = solidPng(32, 20, [10, 120, 200, 255], { x: 5, y: 4, w: 10, h: 6 });
  const back = P.decodePng(P.encodePng(img));
  assert.deepEqual([back.width, back.height], [32, 20]);
  assert.deepEqual(P.alphaBounds(back), { x: 5, y: 4, w: 10, h: 6 });
  const t = P.trim(back, { pad: 2, square: true });
  assert.deepEqual([t.width, t.height], [14, 14]);
  const tiled = P.tile2x2(back);
  assert.deepEqual([tiled.width, tiled.height], [64, 40]);
  const flat = solidPng(16, 16, [90, 160, 90, 255]);
  assert.ok(P.seamScore(flat) <= 1);
});

test('png: real character sprite decodes', () => {
  const f = path.resolve(here, '..', '..', '..', 'lite', 'public', 'characters', 'aava', 'idle.png');
  if (!fs.existsSync(f)) return;
  const r = P.alphaReport(P.decodePng(fs.readFileSync(f)));
  assert.equal(r.width, 256);
  assert.ok(r.transparentShare > 0.3);
});

test('secret scan finds keys and browser-side OpenAI use, but not placeholders', () => {
  assert.equal(scanText('notes.md', `key ${FAKE_KEY}`).length, 1);
  assert.equal(scanText('lite/src/x.ts', 'fetch("https://api.openai.com/v1/images")').length, 1);
  assert.equal(scanText('tools/imagegen/README.md', 'security find-generic-password -s sammakko-openai-imagegen -w').length, 0);
  assert.equal(scanText('lite/.env', '').length, 1);
  assert.equal(scanText('.env.example', '').length, 0);
  assert.equal(scanText('README.md', 'OPENAI_API_KEY=<avain>').length, 0);
});

test('redact also hides OpenAI masked keys that show the last characters', async () => {
  const { redact } = await import('../lib/core.mjs');
  const masked = ['s', 'k-proj-', '*'.repeat(40), 'abcd'].join('');
  const out = redact(`Incorrect API key provided: ${masked}. You can find`);
  assert.equal(out.includes('abcd'), false);
  assert.match(out, /sk-\[REDACTED\]\. You can find/);
});

test('key shape check catches truncation-free problems without echoing the key', async () => {
  const { keyProblem } = await import('../lib/core.mjs');
  assert.equal(keyProblem(FAKE_KEY), null);
  assert.match(keyProblem(`${FAKE_KEY} `), /välilyönti/);
  assert.match(keyProblem('hello'), /ei ala/);
});

test('key-set refuses a malformed key before touching the Keychain', async () => {
  const r = await new Promise((resolve) => {
    const p = execFile(process.execPath, [CLI, 'key-set'], { env: { PATH: process.env.PATH, HOME: process.env.HOME, IMAGEGEN_HOME: tmp(), IMAGEGEN_KEYCHAIN_SERVICE: 'sammakko-imagegen-test-does-not-exist' } },
      (err, stdout, stderr) => resolve({ code: err ? err.code : 0, stdout, stderr }));
    p.stdin.end('not-a-key\n');
  });
  assert.equal(r.code, 1);
  assert.match(r.stderr, /Avainta ei tallennettu/);
  assert.equal((r.stdout + r.stderr).includes('not-a-key'), false);
});

test('key-check --verify reports a rejected key (401) without printing it', async () => {
  const server = http.createServer((req, res) => { res.statusCode = req.url.endsWith('/models') ? 401 : 500; res.end('{}'); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const r = await run(['key-check', '--verify'], { IMAGEGEN_API_BASE: `http://127.0.0.1:${server.address().port}`, OPENAI_API_KEY: FAKE_KEY });
  server.close();
  assert.equal(r.code, 1);
  assert.match(r.stdout, /hylkäsi avaimen/);
  assert.equal((r.stdout + r.stderr).includes(FAKE_KEY), false);
});

test('compare separates Aava from Loikka and fit keeps the house layout', async () => {
  const K = await import('../lib/consistency.mjs');
  const root = path.resolve(here, '..', '..', '..');
  const ch = (c, f) => path.join(root, 'lite', 'public', 'characters', c, f);
  const refs = ['idle.png', 'walk_01.png', 'talk.png'].map((f) => K.loadFeatures(ch('aava', f)));
  assert.ok(K.score(K.loadFeatures(ch('aava', 'wave.png')), refs).total >= 85);
  assert.ok(K.score(K.loadFeatures(ch('loikka', 'idle.png')), refs).total < 40);
  if (process.platform !== 'darwin') return; // fit uses sips
  const dir = tmp();
  const out = path.join(dir, 'fit.png');
  const r = await run(['fit', ch('aava', 'wave.png'), '--match', ch('aava', 'idle.png'), '--out', out]);
  assert.equal(r.code, 0, r.stderr);
  const img = P.decodePng(fs.readFileSync(out));
  const b = P.alphaBounds(img, 128);
  assert.equal(img.width, 256);
  assert.ok(Math.abs(b.y + b.h - 238) <= 2, `baseline ${b.y + b.h}`);
});

test('outline lock recolours only blue ink, never the orange bill or body', async () => {
  const K = await import('../lib/consistency.mjs');
  const px = [[0, 76, 144], [174, 69, 0], [245, 210, 101], [80, 190, 225]]; // ink, dark orange, yellow body, blue body
  const img = { width: 4, height: 1, data: new Uint8Array(px.flatMap((p) => [...p, 255])) };
  K.lockLine(img, [36, 72, 104]);
  const out = [0, 1, 2, 3].map((i) => [...img.data.slice(i * 4, i * 4 + 3)]);
  assert.notDeepEqual(out[0], px[0]);
  assert.deepEqual(out.slice(1), px.slice(1));
});
