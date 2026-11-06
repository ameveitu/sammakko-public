#!/usr/bin/env node
// Blocks API keys from entering the repository and OpenAI access from browser code.
//   node tools/secret-scan.mjs --staged   (pre-commit hook: staged contents)
//   node tools/secret-scan.mjs --all      (CI: every tracked file)
// Exit 1 on findings. Matching values are never printed.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

// Built from parts so this file does not match itself.
const SK = 's' + 'k-';
export const KEY_PATTERNS = [
  { name: 'OpenAI-avain', re: new RegExp(`\\b${SK}(?:proj-|svcacct-|admin-)?[A-Za-z0-9_-]{20,}`) },
  { name: 'avain sijoitettuna muuttujaan', re: /\b(?:OPENAI_API_KEY|OPENAI_KEY|VITE_OPENAI\w*)\s*[=:]\s*["']?[A-Za-z0-9_-]{12,}/ },
  { name: 'Bearer-avain', re: new RegExp(`Bearer\\s+${SK}[A-Za-z0-9_-]{12,}`) },
  { name: 'yksityinen avain', re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];

// Files served to browsers (Vite build, homepage, lesson site) must never talk to OpenAI.
const BROWSER_PATHS = [/^lite\/src\//, /^lite\/public\//, /^lite\/index\.html$/, /^public\//];
const BROWSER_FORBIDDEN = [/api\.openai\.com/, /OPENAI_API_KEY/, /VITE_OPENAI/, /dangerouslyAllowBrowser/];

const FORBIDDEN_NAMES = [/(^|\/)\.env(\.(?!example$)[^/]*)?$/, /(^|\/)[^/]*\.(pem|p12|key)$/, /(^|\/)openai[-_]?key[^/]*$/i];

export function scanText(file, text) {
  const hits = [];
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const p of KEY_PATTERNS) if (p.re.test(line)) hits.push({ file, line: i + 1, what: p.name });
    if (BROWSER_PATHS.some((r) => r.test(file))) for (const r of BROWSER_FORBIDDEN) if (r.test(line)) hits.push({ file, line: i + 1, what: `OpenAI-viittaus selaimeen menevässä tiedostossa (${r.source})` });
  });
  if (FORBIDDEN_NAMES.some((r) => r.test(file))) hits.push({ file, line: 0, what: 'salaisuustiedosto ei kuulu repoon' });
  return hits;
}

function git(args) { return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 << 20 }); }

function isBinary(buf) { return buf.subarray(0, 8000).includes(0); }

export function run(mode) {
  const files = mode === '--staged'
    ? git(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']).split('\0').filter(Boolean)
    : git(['ls-files', '-z']).split('\0').filter(Boolean);
  const hits = [];
  for (const f of files) {
    let buf;
    try { buf = mode === '--staged' ? execFileSync('git', ['show', `:${f}`], { maxBuffer: 256 << 20 }) : fs.readFileSync(f); }
    catch { continue; }
    if (buf.length > 20 << 20) continue;
    if (isBinary(buf)) { hits.push(...scanText(f, '').filter((h) => h.line === 0)); continue; }
    hits.push(...scanText(f, buf.toString('utf8')));
  }
  return { files: files.length, hits };
}

if (process.argv[1]?.endsWith('secret-scan.mjs')) {
  const mode = process.argv[2] || '--all';
  const { files, hits } = run(mode);
  if (hits.length) {
    console.error(`✖ Salaisuusskannaus pysäytti (${hits.length} löydöstä):`);
    for (const h of hits) console.error(`  ${h.file}${h.line ? `:${h.line}` : ''}  ${h.what}`);
    console.error('\nPoista avain tiedostosta. Jos avain ehti commitiin tai GitHubiin, mitätöi se heti OpenAI:n hallintapaneelissa ja luo uusi.');
    process.exit(1);
  }
  console.log(`Salaisuusskannaus OK (${files} tiedostoa).`);
}
