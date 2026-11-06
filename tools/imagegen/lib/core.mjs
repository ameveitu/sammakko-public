// Core logic for imagegen: config, key lookup, prompts, cost, budget ledger, API calls.
// The API key is never printed, logged, written to disk or accepted as a CLI argument.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const TOOL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const VERSION = '1.0.0';
export const MODELS = JSON.parse(fs.readFileSync(path.join(TOOL_DIR, 'models.json'), 'utf8'));
export const PRESETS = JSON.parse(fs.readFileSync(path.join(TOOL_DIR, 'presets.json'), 'utf8'));

export const KEYCHAIN_SERVICE = process.env.IMAGEGEN_KEYCHAIN_SERVICE || 'sammakko-openai-imagegen';
export const KEYCHAIN_ACCOUNT = 'imagegen';
const API_BASE = process.env.IMAGEGEN_API_BASE || 'https://api.openai.com/v1';

// ---------- state dir (outside every repo) ----------

export function stateDir() {
  return process.env.IMAGEGEN_HOME || path.join(os.homedir(), 'Library', 'Application Support', 'sammakko-imagegen');
}

const DEFAULT_CONFIG = {
  monthlyBudgetUsd: 80,
  warnRatio: 0.8,
  perRunMaxUsd: 5,
  outDir: null,
  protectedPaths: ['lite/public/characters'],
};

export function loadConfig() {
  const file = path.join(stateDir(), 'config.json');
  let user = {};
  if (fs.existsSync(file)) user = JSON.parse(fs.readFileSync(file, 'utf8'));
  const cfg = { ...DEFAULT_CONFIG, ...user };
  if (process.env.IMAGEGEN_BUDGET_USD) cfg.monthlyBudgetUsd = Number(process.env.IMAGEGEN_BUDGET_USD);
  return cfg;
}

// ---------- API key ----------

/** Returns { key, source }. Keychain first; OPENAI_API_KEY only as fallback. */
export function getApiKey() {
  try {
    const key = execFileSync('security', ['find-generic-password', '-s', KEYCHAIN_SERVICE, '-a', KEYCHAIN_ACCOUNT, '-w'], {
      stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8', timeout: 15000,
    }).trim();
    if (key) return { key, source: 'keychain' };
  } catch { /* not found or not macOS */ }
  const env = (process.env.OPENAI_API_KEY || '').trim();
  if (env) return { key: env, source: 'env' };
  return null;
}

/** Removes anything that looks like an OpenAI key from a string. */
export function redact(text, key) {
  let s = String(text);
  if (key) s = s.split(key).join('[REDACTED]');
  // Also covers OpenAI's own masked form (sk-proj-****abcd), which leaks the last characters.
  return s.replace(/\bsk-[A-Za-z0-9_*•-]{4,}/g, 'sk-[REDACTED]');
}

/** Basic shape check; never returns the key itself. */
export function keyProblem(key) {
  if (!key) return 'avain on tyhjä';
  if (/\s/.test(key)) return 'avaimessa on välilyönti tai rivinvaihto';
  if (!/^sk-/.test(key)) return 'avain ei ala "sk-"';
  if (!/^[A-Za-z0-9_-]+$/.test(key.slice(3))) return 'avaimessa on outoja merkkejä';
  if (key.length < 40) return `avain on epäilyttävän lyhyt (${key.length} merkkiä)`;
  return null;
}

/** Saves the key to the login Keychain (replaces an older one). */
export function storeKey(key) {
  // The key is passed as an argument to /usr/bin/security for a moment (visible only to this
  // user's processes); it never touches shell history, files or stdout.
  execFileSync('security', ['add-generic-password', '-U', '-s', KEYCHAIN_SERVICE, '-a', KEYCHAIN_ACCOUNT,
    '-l', 'Sammakko imagegen (OpenAI)', '-w', key], { stdio: ['ignore', 'ignore', 'pipe'], timeout: 15000 });
}

/** Free check: GET /models. 401 = key invalid, 403 = key valid but lacks model read permission. */
export async function verifyKey(key) {
  const res = await fetch(`${API_BASE}/models`, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(20000) });
  await res.text();
  if (res.ok) return { ok: true, msg: 'OpenAI hyväksyi avaimen.' };
  if (res.status === 403) return { ok: true, msg: 'Avain on voimassa (mallilistaan ei ole lukuoikeutta, mikä on rajatulle avaimelle normaalia).' };
  if (res.status === 401) return { ok: false, msg: 'OpenAI hylkäsi avaimen (401): avain on väärin tallennettu, katkennut tai mitätöity.' };
  return { ok: false, msg: `Tarkistus palautti HTTP ${res.status}.` };
}

// ---------- models, sizes ----------

export function resolveModel(name) {
  const id = MODELS.aliases[name] || name || MODELS.default;
  if (!MODELS.models[id]) throw new Error(`Tuntematon malli "${name}". Vaihtoehdot: ${Object.keys(MODELS.models).join(', ')}`);
  return id;
}

export function validateParams(p) {
  const L = MODELS.limits;
  const m = MODELS.models[p.model];
  const errs = [], warns = [];
  if (!m.qualities.includes(p.quality)) errs.push(`laatu "${p.quality}" ei käy mallille ${p.model} (${m.qualities.join(', ')})`);
  if (p.size !== 'auto') {
    const mm = /^(\d+)x(\d+)$/.exec(p.size || '');
    if (!mm) errs.push(`koko "${p.size}" pitää olla muotoa LEVEYSxKORKEUS`);
    else {
      const [w, h] = [Number(mm[1]), Number(mm[2])];
      if (!m.customSizes && !L.standardSizes.includes(p.size)) errs.push(`malli ${p.model} tukee vain kokoja ${L.standardSizes.join(', ')}`);
      if (w % L.multipleOf || h % L.multipleOf) errs.push(`leveyden ja korkeuden pitää olla ${L.multipleOf}:n monikertoja`);
      if (Math.max(w, h) > L.maxEdge) errs.push(`pisin sivu enintään ${L.maxEdge} px`);
      if (Math.max(w, h) / Math.min(w, h) > L.maxRatio) errs.push(`kuvasuhde enintään ${L.maxRatio}:1`);
      if (w * h < L.minPixels || w * h > L.maxPixels) errs.push(`pikselimäärän pitää olla ${L.minPixels}–${L.maxPixels} (nyt ${w * h})`);
      if (w * h > 2560 * 1440) warns.push(`yli ${L.experimentalAbove} on OpenAI:n mukaan kokeellinen`);
    }
  }
  if (p.background === 'transparent') {
    if (!['png', 'webp'].includes(p.format)) errs.push('läpinäkyvä tausta vaatii muodon png tai webp');
    if (m.transparency === 'preview') warns.push(`${p.model}: läpinäkyvyys on vasta esikatseluvaiheessa`);
  }
  if (!(p.n >= 1 && p.n <= L.maxN)) errs.push(`n pitää olla 1–${L.maxN}`);
  if (p.prompt.length > L.promptMaxChars) errs.push(`prompti on liian pitkä (${p.prompt.length} > ${L.promptMaxChars})`);
  if ((p.images || []).length > L.maxInputImages) errs.push(`enintään ${L.maxInputImages} syötekuvaa`);
  if (p.mask && !(p.images || []).length) errs.push('maski vaatii syötekuvan (--image)');
  return { errs, warns };
}

// ---------- prompts ----------

export function readTemplate(name) {
  const file = path.join(TOOL_DIR, 'prompts', `${name}.txt`);
  if (!fs.existsSync(file)) throw new Error(`Promptipohjaa "${name}" ei ole (katso: imagegen templates)`);
  return fs.readFileSync(file, 'utf8').trim();
}

export function listTemplates() {
  return fs.readdirSync(path.join(TOOL_DIR, 'prompts')).filter((f) => f.endsWith('.txt')).map((f) => f.slice(0, -4)).sort();
}

export function fillTemplate(text, vars) {
  const missing = [];
  const out = text.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (vars[k] == null || vars[k] === '') { missing.push(k); return `{{${k}}}`; }
    return vars[k];
  });
  if (missing.length) throw new Error(`Pohjasta puuttuu muuttuja: ${[...new Set(missing)].map((k) => `--var ${k}=...`).join(', ')}`);
  return out;
}

/** Builds the final prompt and returns its parts for provenance. */
export function buildPrompt({ prompt, template, vars = {}, style, character }) {
  const parts = [];
  if (style) parts.push({ from: 'style-sammakko', text: readTemplate('style-sammakko') });
  for (const c of [].concat(character || [])) parts.push({ from: `character-${c}`, text: readTemplate(`character-${c}`) });
  if (template) parts.push({ from: template, text: fillTemplate(readTemplate(template), { subject: prompt, ...vars }) });
  else if (prompt) parts.push({ from: 'cli', text: prompt });
  if (template && prompt && !readTemplate(template).includes('{{subject}}')) parts.push({ from: 'cli', text: prompt });
  if (!parts.some((p) => p.from === 'cli' || p.from === template)) throw new Error('Anna --prompt tai --template');
  return { text: parts.map((p) => p.text).join('\n\n'), parts };
}

// ---------- cost ----------

export function estimateCost(p) {
  const m = MODELS.models[p.model];
  const table = MODELS.perImageUsdAt1024;
  const [w, h] = p.size === 'auto' ? [1536, 1024] : p.size.split('x').map(Number);
  const scale = (w * h) / (1024 * 1024);
  const perImage = table[p.quality] * scale * (m.imageOut / 30);
  const textUsd = (Math.ceil(p.prompt.length / 4) * m.textIn) / 1e6;
  const inputImgs = (p.images || []).length + (p.mask ? 1 : 0);
  const imageInUsd = (inputImgs * MODELS.inputImageTokensEstimate * m.imageIn) / 1e6;
  const usd = perImage * p.n + textUsd + imageInUsd;
  return { usd: roundUsd(usd), perImage: roundUsd(perImage), basis: 'arvio: gpt-image-2:n virallinen taulukko × pinta-ala, xhigh/max varovaisesti' };
}

/** Cost from the API's usage block (output tokens priced as image output = upper bound). */
export function actualCost(model, usage) {
  if (!usage) return null;
  const m = MODELS.models[model];
  const d = usage.input_tokens_details || {};
  const imgIn = d.image_tokens ?? 0;
  const textIn = d.text_tokens ?? Math.max(0, (usage.input_tokens || 0) - imgIn);
  return roundUsd((textIn * m.textIn + imgIn * m.imageIn + (usage.output_tokens || 0) * m.imageOut) / 1e6);
}

const roundUsd = (x) => Math.round(x * 1e6) / 1e6;

// ---------- ledger / budget ----------

const ledgerFile = () => path.join(stateDir(), 'ledger.jsonl');
export const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export function readLedger() {
  const f = ledgerFile();
  if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

export function appendLedger(entry) {
  fs.mkdirSync(stateDir(), { recursive: true, mode: 0o700 });
  fs.appendFileSync(ledgerFile(), JSON.stringify(entry) + '\n', { mode: 0o600 });
}

export function monthSpent(month = monthKey()) {
  return roundUsd(readLedger().filter((e) => e.month === month).reduce((s, e) => s + (e.costUsd || 0), 0));
}

/** Throws if the planned spend would break the per-run cap or monthly budget. */
export function checkBudget(estimateUsd, cfg, maxUsd) {
  const spent = monthSpent();
  const cap = maxUsd ?? cfg.perRunMaxUsd;
  const info = { spent, budget: cfg.monthlyBudgetUsd, remaining: roundUsd(cfg.monthlyBudgetUsd - spent), estimate: estimateUsd, cap };
  if (estimateUsd > cap) return { ok: false, info, reason: `arvio $${estimateUsd.toFixed(3)} ylittää ajokohtaisen katon $${cap} (nosta: --max-usd)` };
  if (spent + estimateUsd > cfg.monthlyBudgetUsd) return { ok: false, info, reason: `kuukausibudjetti ylittyisi: käytetty $${spent.toFixed(2)} + arvio $${estimateUsd.toFixed(3)} > $${cfg.monthlyBudgetUsd}` };
  const warn = spent + estimateUsd > cfg.monthlyBudgetUsd * cfg.warnRatio;
  return { ok: true, info, warn };
}

// ---------- files ----------

export const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

export function slug(s) {
  return String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'kuva';
}

export function stamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

/** Refuses to write into protected asset folders (approved character PNGs). */
export function assertWritable(dir, cfg) {
  const abs = path.resolve(dir).split(path.sep).join('/');
  for (const p of cfg.protectedPaths) if (abs.includes(`/${p.replace(/^\/|\/$/g, '')}`)) {
    throw new Error(`Kansio ${dir} on suojattu (${p}): hyväksyttyjä hahmokuvia ei korvata. Generoi muualle ja vaihda kuva käsin luvan kanssa.`);
  }
}

export function uniquePath(file) {
  if (!fs.existsSync(file)) return file;
  const { dir, name, ext } = path.parse(file);
  for (let i = 2; ; i++) { const f = path.join(dir, `${name}-${i}${ext}`); if (!fs.existsSync(f)) return f; }
}

/** Sidecar provenance path. Inside a public/ folder it goes to tools/imagegen/provenance/ so it is not shipped. */
export function sidecarPath(imageFile) {
  const parts = path.resolve(imageFile).split(path.sep);
  if (parts.includes('public')) {
    const dir = path.join(TOOL_DIR, 'provenance');
    fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, `${path.basename(imageFile)}.json`);
  }
  return `${imageFile}.json`;
}

export function dataUrl(file) {
  const buf = fs.readFileSync(file);
  const ext = path.extname(file).slice(1).toLowerCase().replace('jpg', 'jpeg');
  if (!['png', 'jpeg', 'webp'].includes(ext)) throw new Error(`${file}: syötekuvan pitää olla png, jpg tai webp`);
  return { url: `data:image/${ext};base64,${buf.toString('base64')}`, bytes: buf.length, sha256: sha256(buf), file };
}

// ---------- request ----------

export function requestBody(p) {
  const body = {
    model: p.model, prompt: p.prompt, n: p.n, size: p.size, quality: p.quality,
    background: p.background, output_format: p.format, moderation: p.moderation,
  };
  if (p.compression != null && p.format !== 'png') body.output_compression = p.compression;
  if (p.images?.length) body.images = p.images.map((i) => ({ image_url: i.url }));
  if (p.mask) body.mask = { image_url: p.mask.url };
  return body;
}

/** Same body with image data replaced by short descriptions, for dry-run and provenance. */
export function describeBody(body, p) {
  const b = { ...body };
  if (b.images) b.images = p.images.map((i) => ({ image_url: `<${path.basename(i.file)}: ${i.bytes} t, sha256 ${i.sha256.slice(0, 12)}…>` }));
  if (b.mask) b.mask = { image_url: `<${path.basename(p.mask.file)}: ${p.mask.bytes} t>` };
  return b;
}

export async function callApi(endpoint, body, key, { retries = 3 } = {}) {
  for (let attempt = 0; ; attempt++) {
    let res;
    try {
      res = await fetch(`${API_BASE}/images/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(300000),
      });
    } catch (e) {
      if (attempt < retries) { await sleep(2000 * 2 ** attempt); continue; }
      throw new Error(redact(`Verkkovirhe: ${e.message}`, key));
    }
    const requestId = res.headers.get('x-request-id');
    const text = await res.text();
    if (res.ok) return { json: JSON.parse(text), requestId };
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      const ra = Number(res.headers.get('retry-after')) || 2 * 2 ** attempt;
      process.stderr.write(`  HTTP ${res.status}, yritetään uudelleen ${ra} s päästä…\n`);
      await sleep(ra * 1000);
      continue;
    }
    let msg = text;
    try { const j = JSON.parse(text); msg = `${j.error?.code || ''} ${j.error?.message || text}`.trim(); } catch { /* raw */ }
    const err = new Error(redact(`OpenAI HTTP ${res.status}: ${msg}`, key));
    err.status = res.status; err.requestId = requestId;
    throw err;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
