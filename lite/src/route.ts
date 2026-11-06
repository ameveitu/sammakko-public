// Inbound KC route (review V4-03, Sol runtime bridge). One documented form:
//   <base>#kc/<encodeURIComponent(canonical KC id)>
// The route opens the lesson in its normal mode (prerequisite preview and free jumps unchanged). Opening a link
// never records an answer, an inference or a reward. Route support says nothing about where the app is
// deployed or who can reach it: see public/lite-runtime.json.

export const KC_ROUTE = { kind: 'hash', prefix: '#kc/', template: '#kc/{encodedCanonicalKCId}', encoding: 'encodeURIComponent', version: 1 } as const;

/** Canonical KC ids look like M-TH-08, PHY79-SPEED-REARR, M79-EQ1-FORM. */
export const KC_ID = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/;

export type KcRoute =
  | { kind: 'kc'; id: string }
  | { kind: 'malformed'; raw: string }
  | null; // not a KC route

/** Parse a location.hash. Returns null for every other route. */
export function parseKcHash(hash: string): KcRoute {
  if (!hash.startsWith(KC_ROUTE.prefix)) return null;
  const raw = hash.slice(KC_ROUTE.prefix.length);
  let id: string;
  try { id = decodeURIComponent(raw).trim(); } catch { return { kind: 'malformed', raw }; }
  return KC_ID.test(id) ? { kind: 'kc', id } : { kind: 'malformed', raw: id };
}

export const kcHash = (id: string) => `${KC_ROUTE.prefix}${encodeURIComponent(id)}`;

/** Absolute game link for this page: same document path, any engineering query removed. */
export function kcLink(id: string, loc: { origin: string; pathname: string }) {
  return `${loc.origin}${loc.pathname}${kcHash(id)}`;
}

/** Local preview hosts: a link from them works only on this machine. */
export function isLocalPreview(loc: { protocol: string; hostname: string }) {
  return loc.protocol === 'file:' || /^(localhost|127(?:\.\d+){3}|\[::1\]|::1|0\.0\.0\.0)$/.test(loc.hostname) || loc.hostname.endsWith('.localhost');
}
