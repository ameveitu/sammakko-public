// State outside every repo: config, key lookup, ledger, raw candidates.
// The audio budget is carved out of the same OpenAI balance as imagegen: the monthly cap check
// adds imagegen's month spend, so the two tools never get two independent 80 $ allowances.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const KEYCHAIN_SERVICE = process.env.AUDIOGEN_KEYCHAIN_SERVICE || 'sammakko-openai-audiogen';
export const KEYCHAIN_ACCOUNT = 'audiogen';
const IMAGEGEN_KEYCHAIN_SERVICE = 'sammakko-openai-imagegen';

export const stateDir = () => process.env.AUDIOGEN_HOME || path.join(os.homedir(), 'Library', 'Application Support', 'sammakko-audiogen');
const imagegenDir = () => process.env.IMAGEGEN_HOME || path.join(os.homedir(), 'Library', 'Application Support', 'sammakko-imagegen');

const DEFAULTS = {
  /** All audio work in this project, all months together (plan 15 $, raised to 20 $ by the user 2.11.2026). */
  projectCapUsd: 20,
  /** Shared OpenAI monthly cap; taken from imagegen's config when present. */
  monthlyBudgetUsd: 80,
  concurrency: 2,
  retries: 2,
};

const readJson = (f, fallback) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return fallback; } };

export function loadConfig() {
  const own = readJson(path.join(stateDir(), 'config.json'), {});
  const img = readJson(path.join(imagegenDir(), 'config.json'), {});
  return { ...DEFAULTS, ...(img.monthlyBudgetUsd ? { monthlyBudgetUsd: img.monthlyBudgetUsd } : {}), ...own };
}

// ---------------------------------------------------------------- key
/** Keychain only (OPENAI_API_KEY as an explicit fallback). Never printed, never written to the repo. */
export function getApiKey() {
  // Own item first, then the image tool's item (same OpenAI project, same shared budget).
  const items = [[KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT, 'keychain']];
  if (!process.env.AUDIOGEN_KEYCHAIN_SERVICE) items.push([IMAGEGEN_KEYCHAIN_SERVICE, 'imagegen', 'keychain:imagegen']);
  for (const [service, account, source] of items) {
    try {
      const key = execFileSync('security', ['find-generic-password', '-s', service, '-a', account, '-w'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      if (key) return { key, source };
    } catch { /* not stored */ }
  }
  if (process.env.OPENAI_API_KEY) return { key: process.env.OPENAI_API_KEY, source: 'env' };
  return null;
}
export function setApiKey(key) {
  if (!/^sk-[A-Za-z0-9_-]{20,}$/.test(key)) throw new Error('Avain ei näytä OpenAI-avaimelta (sk-…).');
  execFileSync('security', ['add-generic-password', '-U', '-s', KEYCHAIN_SERVICE, '-a', KEYCHAIN_ACCOUNT, '-w', key], { stdio: 'ignore' });
}

// ---------------------------------------------------------------- ledger
// Entries: reserve (before a request), settle (actual usage), release (request never sent),
// uncertain (sent, outcome unknown: counted as spent). One id per request.
const ledgerFile = () => path.join(stateDir(), 'ledger.jsonl');
export const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const round = (x) => Math.round(x * 1e6) / 1e6;

export function readLedger(file = ledgerFile()) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}
export function appendLedger(entry) {
  fs.mkdirSync(stateDir(), { recursive: true, mode: 0o700 });
  fs.appendFileSync(ledgerFile(), JSON.stringify({ at: new Date().toISOString(), month: monthKey(), ...entry }) + '\n', { mode: 0o600 });
}

/** Per request: settled cost if settled, else the reservation (open or uncertain), released = 0. */
export function audioTotals(entries = readLedger()) {
  const byId = new Map();
  for (const e of entries) {
    const r = byId.get(e.id) ?? { month: e.month, reserved: 0, settled: null, released: false, uncertain: false };
    if (e.kind === 'reserve') r.reserved = e.usd;
    if (e.kind === 'settle') r.settled = e.usd;
    if (e.kind === 'release') r.released = true;
    if (e.kind === 'uncertain') r.uncertain = true;
    byId.set(e.id, r);
  }
  const t = { settled: 0, open: 0, uncertain: 0, month: 0 };
  const now = monthKey();
  for (const r of byId.values()) {
    const cost = r.settled ?? (r.released ? 0 : r.reserved);
    if (r.settled !== null) t.settled += r.settled; else if (r.uncertain) t.uncertain += r.reserved; else if (!r.released) t.open += r.reserved;
    if (r.month === now) t.month += cost;
  }
  for (const k of Object.keys(t)) t[k] = round(t[k]);
  t.total = round(t.settled + t.open + t.uncertain);
  return t;
}

export function imagegenMonthSpent() {
  const month = monthKey();
  return round(readLedger(path.join(imagegenDir(), 'ledger.jsonl')).filter((e) => e.month === month).reduce((s, e) => s + (e.costUsd || 0), 0));
}

/** Can `usd` more be reserved? Checks the run budget, the project cap and the shared monthly cap. */
export function budgetCheck(usd, { runBudgetUsd, runSpent = 0, cfg = loadConfig(), totals = audioTotals(), imageMonth = imagegenMonthSpent() }) {
  if (runSpent + usd > runBudgetUsd) return { ok: false, reason: `erän budjetti ${runBudgetUsd} $ ylittyisi (${round(runSpent)} + ${round(usd)})` };
  if (totals.total + usd > cfg.projectCapUsd) return { ok: false, reason: `ääniprojektin katto ${cfg.projectCapUsd} $ ylittyisi (käytetty/varattu ${totals.total})` };
  if (imageMonth + totals.month + usd > cfg.monthlyBudgetUsd) return { ok: false, reason: `yhteinen kuukausikatto ${cfg.monthlyBudgetUsd} $ ylittyisi (kuvat ${imageMonth} + ääni ${totals.month})` };
  return { ok: true };
}

export const candidatesDir = (...p) => path.join(stateDir(), 'candidates', ...p);
export const archiveDir = (...p) => path.join(stateDir(), 'masters', ...p);
