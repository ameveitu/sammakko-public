// One status per lesson for the adult view, the summary line and the export (review V4-02).
// statusOf picks the first matching status in STATUS_ORDER, so every lesson is counted exactly once.
import { isUnlocked } from '../engine/graph';
import { store } from '../engine/store';
import { NODES } from '../content';

export type StatusKey = 'recognised' | 'retained' | 'checked' | 'helped' | 'inferred' | 'prior' | 'deferred' | 'unchecked';

/** Priority order: a lesson gets the first status it qualifies for. The summary lists them in this order. */
export const STATUS_ORDER: { key: StatusKey; label: string }[] = [
  { key: 'retained', label: 'muistettu' },
  { key: 'checked', label: 'tarkistettu' },
  { key: 'recognised', label: 'tarkistettu tunnistamalla' },
  { key: 'helped', label: 'avun kanssa' },
  { key: 'inferred', label: 'päätelty' },
  { key: 'prior', label: 'aiemmassa versiossa tehty' },
  { key: 'deferred', label: 'myöhemmäksi' },
  { key: 'unchecked', label: 'ei vielä tarkistettu' },
];

/** What a production answer in this lesson shows ("lausekkeen rakentamista"). */
export const produceWhat = (id: string) => NODES[id]?.produceWhat ?? 'kirjoittamista tai rakentamista';

/** The same without "itse", for "omaa … ei vielä nähty". */
export const produceNoun = (id: string) => produceWhat(id).replace(/ itse$/, '');

/** The adult's status words. Never a probability; unknown is not weak. */
export function statusOf(id: string): { key: StatusKey; text: string } {
  const st = store.state(id);
  // Checked without a production answer (earlier revision, or recognition only): say what was observed.
  if (st.checked && st.produced === false) return { key: 'recognised', text: `tarkistettu tunnistamalla (omaa ${produceNoun(id)} ei vielä havaittu)` };
  if (st.checked) return { key: st.retained !== undefined ? 'retained' : 'checked', text: st.retained !== undefined ? 'tarkistettu + muistettu tauon jälkeen' : st.quick ? 'tarkistettu (pika)' : 'tarkistettu' };
  if (st.helped) return { key: 'helped', text: 'harjoiteltu avun kanssa' };
  const src = store.inferredFrom(id);
  if (src.length) return { key: 'inferred', text: `päätelty: ${src.slice(0, 3).map((s) => NODES[s]!.stop).join(', ')}${src.length > 3 ? ' …' : ''}` };
  if (store.prior(id)) return { key: 'prior', text: 'aiemmassa versiossa tehty (ei nykyinen tarkistus)' };
  if (store.deferred(id)) return { key: 'deferred', text: 'jätetty myöhemmäksi' };
  return { key: 'unchecked', text: store.attemptsOf(id).length ? 'ei vielä tarkistettu' : isUnlocked(id, store.known) ? 'ei vielä yritetty' : 'ei vielä yritetty (polun takana)' };
}

/** Count statuses: every id exactly once. */
export function statusCounts(ids: string[]): Record<StatusKey, number> {
  const out = Object.fromEntries(STATUS_ORDER.map((s) => [s.key, 0])) as Record<StatusKey, number>;
  for (const id of ids) out[statusOf(id).key]++;
  return out;
}

/** "181 aihetta: 0 muistettu, 1 tarkistettu, …". Empty optional groups are left out; the parts always add up. */
export function statusSummary(ids: string[]): string {
  const c = statusCounts(ids);
  const optional = new Set<StatusKey>(['recognised', 'prior']);
  const parts = STATUS_ORDER.filter((s) => !optional.has(s.key) || c[s.key] > 0).map((s) => `${c[s.key]} ${s.label}`);
  return `${ids.length} aihetta: ${parts.join(', ')}.`;
}
