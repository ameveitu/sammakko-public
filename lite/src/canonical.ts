// Titles of all canonical KC ids (public/canonical-ids.json), fetched only when a link names an id
// that is not in Lite. A failed load is reported as a failure, never as "unknown id" (review G03).
// It is a plain file, not a code chunk, so a retry really asks the server again.

export interface CanonicalIds { source?: string; sha256?: string; titles: Record<string, string> }
export type TitleLookup = { kind: 'ok'; title: string | undefined } | { kind: 'failed'; reason: string };

export const CANONICAL_URL = 'canonical-ids.json';
const TIMEOUT_MS = 10_000;
let cached: CanonicalIds | null = null;

const isTitles = (x: unknown): x is CanonicalIds =>
  !!x && typeof x === 'object' && !!(x as CanonicalIds).titles && typeof (x as CanonicalIds).titles === 'object' &&
  Object.values((x as CanonicalIds).titles).every((t) => typeof t === 'string');

/** Look up one id. Successful loads are kept for the page; failures are not, so a retry fetches again. */
export async function canonicalTitle(id: string, f: typeof fetch = fetch): Promise<TitleLookup> {
  if (!cached) {
    const ctl = typeof AbortController === 'function' ? new AbortController() : undefined;
    const timer = setTimeout(() => ctl?.abort(), TIMEOUT_MS);
    try {
      const r = await f(CANONICAL_URL, { signal: ctl?.signal, cache: 'no-cache' });
      if (!r.ok) return { kind: 'failed', reason: `HTTP ${r.status}` };
      const j: unknown = await r.json();
      if (!isTitles(j)) return { kind: 'failed', reason: 'muoto' };
      cached = j;
    } catch (e) {
      return { kind: 'failed', reason: (e as Error)?.name === 'AbortError' ? 'aikakatkaisu' : 'verkko' };
    } finally { clearTimeout(timer); }
  }
  return { kind: 'ok', title: cached.titles[id] };
}

/** For tests. */
export const _resetCanonical = () => { cached = null; };
