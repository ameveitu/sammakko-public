// Feature detectors: read what a generated item actually contains (its words, numbers,
// pictures and answer) and name the kinds of knowledge it demands. The family registry
// declares where each demand is taught; the coverage test and report compare the two.
import type { Item, Option } from '../engine/types';

export type Feature =
  | 'negative' | 'decimal' | 'fraction' | 'multiply' | 'divide' | 'clock' | 'perimeter'
  | 'area' | 'convertLength' | 'convertTime' | 'convertMass' | 'convertVolume' | 'speedUnit' | 'coordinate';

/** For each feature: the in-scope KCs whose teaching covers it (by id pattern). */
export const FEATURE_KCS: Record<Feature, RegExp> = {
  negative: /^(M-NEG-|M79-INT-)/,
  decimal: /^(M-DEC-|M79-DEC-)/,
  fraction: /^(M-FRAC-|M79-FRAC-|M79-RECIP)/,
  multiply: /^(M-MUL-|M-MULTAB-|M-MULTREL|M-WRMUL|M79-INT-MUL|M79-FRAC-MUL|M-DEC-08)/,
  divide: /^(M-DIV-|M-WRDIV|M-MULDIV|M-DIVIS|M79-INT-DIV|M79-FRAC-DIV|M79-DEC-DIV|M-DEC-09)/,
  clock: /^M-TIME-02$/,
  perimeter: /^M-GMEAS-01$/,
  area: /^(M-MEAS-0[5-9]|M-ALG-0)/,
  convertLength: /^(M-MEAS-03|M-UNIT-0[1-5]|PHY79-UNIT-CONV|M79-UNIT-LIN)$/,
  convertTime: /^(M-UNIT-0[1-5]|PHY79-UNIT-CONV|M79-UNIT-LIN)$/,
  convertMass: /^(M-MEAS-06|M-UNIT-0[1-5]|M79-UNIT-LIN)$/,
  convertVolume: /^(M-MEAS-09|M-UNIT-0[1-5]|M79-UNIT-LIN)$/,
  speedUnit: /^(PHY79-SPEED-UNIT|PHY79-SPEED-CONCEPT|PHY79-SPEED-CALC)$/,
  coordinate: /^M-COORD-/,
};

const optText = (o: Option) => [o.big, o.text, o.speak, o.quiet, o.art].filter(Boolean).join(' ');

/** All text a learner meets in an item, including the painted scene. With `before`, only what is
 *  shown before answering (no explanation): a fact the learner may use must be there (review L181-07); a prose colon ("5: 6 + 5") has no space before it. */
export function itemText(it: Item, before = false): string {
  const parts = [it.say, before ? '' : it.explain ?? '', it.hint ?? ''];
  const t = it.task;
  if (t.kind === 'choice' || t.kind === 'multi') parts.push(...t.options.map(optText));
  if (it.scene) {
    const box: string[] = [];
    const host = { set innerHTML(v: string) { box.push(v); }, get innerHTML() { return box.join(''); }, querySelector: () => null, querySelectorAll: () => [], append() {}, appendChild() {}, classList: { add() {}, remove() {}, toggle() {} }, style: {}, addEventListener() {}, dataset: {} } as unknown as HTMLElement;
    try { it.scene(host); } catch { /* scenes that need a real DOM are skipped */ }
    parts.push(box.join(''));
  }
  return parts.join('\n');
}

const UNITS = {
  convertLength: ['mm', 'cm', 'dm', 'm', 'km'],
  convertTime: ['s', 'min', 'h'],
  convertMass: ['g', 'kg'],
  convertVolume: ['ml', 'dl', 'l'],
} as const;
/** Units written after a number, e.g. "2,5 km" or "90 min". */
function unitsIn(text: string): Set<string> {
  const out = new Set<string>();
  for (const m of text.matchAll(/\d\s?(mm|cm|dm|km|m|min|s|h|kg|g|ml|dl|l)(?![a-zäöå²³/])/gi)) out.add(m[1]!.toLowerCase());
  return out;
}

/** Answer value(s) of a numeric-style task, when there is one. */
function answers(it: Item): number[] {
  const t = it.task as { kind: string; answer?: unknown };
  if (t.kind === 'numeric' && typeof t.answer === 'number') return [t.answer];
  return [];
}

/** A conversion fact or formula visibly given in the task itself (not only in a hint or in the
 *  feedback): "1 h = 60 min", "Metrissä on 100 cm", "jaa luvulla 3,6", "piiri on 4s". */
export function suppliedBefore(it: Item): boolean {
  const t = itemText({ ...it, hint: undefined }, true).replace(/<[^>]+>/g, ' ');
  return /\b1\s?(mm|cm|dm|m|km|min|h|s|kg|g|l|dl|ml)\s?=\s?\d/i.test(t)
    || /(metrissä|kilossa|kilogrammassa|litrassa|tunnissa|minuutissa|senttimetrissä|desilitrassa) on (\d+|kymmenen|sata|tuhat)/i.test(t)
    || /luvulla \d|kerroin|kaava|portaat|piiri on \d*[a-z]\b|= \d+ ?(mm|cm|dm|m|min|s|g|ml|dl)\b/i.test(t);
}

export function featuresOf(it: Item): Set<Feature> {
  const raw = itemText(it);
  // Strip markup but keep fraction markup recognisable.
  const frac = /class="(big-)?frac"/.test(raw);
  const text = raw.replace(/<[^>]+>/g, ' ');
  const f = new Set<Feature>();
  const ans = answers(it);
  if (ans.some((a) => a < 0) || /(^|[\s(=:])[−-]\d/.test(text)) f.add('negative');
  if (ans.some((a) => !Number.isInteger(a)) || /\d,\d/.test(text)) f.add('decimal');
  if (frac || /\b\d+\/\d+\b/.test(text) || /(?<![a-zäöå])(puolikas|\S+sosa\S*)/i.test(text)) f.add('fraction');
  if (/[\d)a-z]\s*[×·]\s*([\d(−-]|[a-z](?![a-zäöå]))/i.test(text)) f.add('multiply');
  // Division is also written with a colon (120 : 60); a prose colon ("tuli 5: 6 + 5") has no space before it.
  if (/÷/.test(text) || /\d\s:\s?\d/.test(text)) f.add('divide');
  // Placing a point by its coordinates on an x–y grid (graphs of measured data have quantity axes).
  if (it.task.kind === 'plot' && ['', 'x'].includes((it.task as { xLabel?: string }).xLabel ?? '')) f.add('coordinate');
  if (/\bkello\s+(\d|[a-zäö]+)|\b\d{1,2}\.\d\d\b/i.test(text)) f.add('clock');
  if (/(?<![a-zäöå])(piiri|reunaviiva|aitaa|aita kiertää)/i.test(text)) f.add('perimeter');
  if (/pinta-ala|cm²|m²/i.test(text)) f.add('area');
  const u = unitsIn(text);
  for (const [k, list] of Object.entries(UNITS)) if (list.filter((x) => u.has(x)).length >= 2) f.add(k as Feature);
  if (/km\/h|m\/s/.test(text)) f.add('speedUnit');
  return f;
}
