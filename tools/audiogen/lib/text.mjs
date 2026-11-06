// Speech lookup key and transcript checks. normText/fnv64/speechKey must match
// lite/src/audio/key.ts exactly (lite/tests/audio.test.ts checks both).

export const normText = (s) => String(s).normalize('NFC').replace(/\s+/g, ' ').trim();

export function fnv64(s) {
  let h = 0xcbf29ce484222325n;
  for (const b of new TextEncoder().encode(s)) { h ^= BigInt(b); h = (h * 0x100000001b3n) & 0xffffffffffffffffn; }
  return h.toString(16).padStart(16, '0');
}

export const speechKey = (speaker, text) => `${speaker}|${fnv64(`${speaker}\n${normText(text)}`)}`;

/** Generation cache key: everything that changes the produced audio. */
export const inputHash = (o) => fnv64(JSON.stringify([normText(o.spokenText), o.locale, o.speaker, o.provider, o.model, o.voice, o.styleVersion, o.processing]));

const words = (s) => normText(s).toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, ' ').split(/\s+/).filter(Boolean);
const NUMBERISH = /^(\d|nolla|yksi|kaksi|kolme|neljä|viisi|kuusi|seitsemän|kahdeksan|yhdeksän|kymmenen|sata|tuhat|miinus|plus|kertaa|jaettuna|pilkku|potenssiin)/;

/** Word-level comparison of the returned transcript with the approved spoken text.
 *  A clean match does not prove the audio is right; numbers are always flagged for listening. */
let toWords = null;
/** Spoken-form reader for digits in transcripts (lib/spoken.mjs), set by the CLI to avoid a cycle. */
export const setTranscriptReader = (f) => { toWords = f; };
const letters = (s) => normText(s).toLowerCase().replace(/[^\p{L}]/gu, '');
export function compareTranscript(expected, transcript) {
  const a = words(expected), b = words(transcript);
  // LCS for a small, readable diff.
  const m = a.length, n = b.length, L = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const missing = [], extra = [];
  let i = 0, j = 0;
  while (i < m && j < n) { if (a[i] === b[j]) { i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) missing.push(a[i++]); else extra.push(b[j++]); }
  missing.push(...a.slice(i)); extra.push(...b.slice(j));
  const numbers = a.some((w) => NUMBERISH.test(w));
  const exact = !missing.length && !extra.length;
  // Transcripts often write numbers as digits ("12 metriä"). Read them with the same rules that made the
  // spoken text and compare letters only; a match is marked so it is still listened to (numbers: true).
  const loose = !exact && toWords && letters(expected) === letters(toWords(transcript));
  return { exact: exact || loose, ...(loose ? { via: 'digits-read' } : {}), missing: loose ? [] : missing, extra: loose ? [] : extra, numbers, listenFirst: numbers || (!exact && !loose) };
}
