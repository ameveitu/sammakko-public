// Import Sol's design cards as annotations (never as lesson content).
// Usage: node tools/import-sol.mjs <path/to/slice52_design_cards.json>
// Reads the card file as plain JSON data, keeps only known string/array fields, and writes
// src/data/sol-annotations.json with the source file's sha256. Nothing in the cards is executed,
// and nothing here changes a lesson: the app shows the cards to the adult as design notes.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

const src = process.argv[2];
if (!src) { console.error('usage: node tools/import-sol.mjs <slice52_design_cards.json>'); process.exit(1); }
const raw = readFileSync(src);
const cards = JSON.parse(raw.toString('utf8'));
if (!Array.isArray(cards)) throw new Error('expected a list of cards');

const str = (x, max = 600) => (typeof x === 'string' ? x.slice(0, max) : '');
const ids = (x) => (Array.isArray(x) ? x.filter((v) => typeof v === 'string' && /^[A-Z0-9-]{1,40}$/.test(v)) : []);
const STATUS = new Set(['deferred_design_only_not_production_authorized', 'existing_pack_repair_proposal']);

const out = [];
for (const c of cards) {
  if (!c || typeof c !== 'object' || typeof c.kc_id !== 'string' || !/^[A-Z0-9-]{1,40}$/.test(c.kc_id)) throw new Error('card without a valid kc_id');
  if (!STATUS.has(c.status)) throw new Error(`${c.kc_id}: unknown status ${c.status}`);
  const groups = (Array.isArray(c.required_groups_unchanged) ? c.required_groups_unchanged : []).map((g) =>
    g && Array.isArray(g.all_of) ? { all: ids(g.all_of) } : g && Array.isArray(g.any_of) ? { any: ids(g.any_of) } : null).filter(Boolean);
  out.push({
    id: c.kc_id,
    role: str(c.role, 40),
    status: c.status,
    goal: str(c.plain_goal_fi),
    example: str(c.worked_example_fi),
    task: str(c.independent_task_example_fi),
    expected: str(c.expected_response),
    feedback: str(c.error_feedback_example_fi),
    boundary: str(c.boundary_and_acceptance),
    research: ids(c.research_source_ids),
    findings: ids(c.finding_ids),
    groups,
    source: { path: str(c.source_path, 200), line: typeof c.source_line === 'number' ? c.source_line : null, sha256: str(c.source_sha256, 64) },
  });
}
const data = {
  from: basename(src),
  sha256: createHash('sha256').update(raw).digest('hex'),
  note: 'Sol design cards imported as annotations. Not lesson content; not production authorized unless the status says so.',
  cards: out.sort((a, b) => a.id.localeCompare(b.id)),
};
writeFileSync(new URL('../src/data/sol-annotations.json', import.meta.url), JSON.stringify(data, null, 1) + '\n');
console.log(`${out.length} cards → src/data/sol-annotations.json (${data.sha256.slice(0, 12)})`);
