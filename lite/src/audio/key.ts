// Lookup key for pre-produced speech. Must stay identical to tools/audiogen/lib/text.mjs
// (tests/audio.test.ts checks both on the same inputs).

/** The text the app passes to say(), normalised only for spacing and Unicode form. */
export const normText = (s: string) => s.normalize('NFC').replace(/\s+/g, ' ').trim();

/** FNV-1a 64-bit as 16 hex chars: stable, synchronous and dependency-free. */
export function fnv64(s: string): string {
  let h = 0xcbf29ce484222325n;
  const bytes = new TextEncoder().encode(s);
  for (const b of bytes) { h ^= BigInt(b); h = (h * 0x100000001b3n) & 0xffffffffffffffffn; }
  return h.toString(16).padStart(16, '0');
}

/** Speaker plus exact display text: a match proves both the role and the words. */
export const speechKey = (speaker: string, text: string) => `${speaker}|${fnv64(`${speaker}\n${normText(text)}`)}`;
