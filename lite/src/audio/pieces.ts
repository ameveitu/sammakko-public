// Generated maths lines ("Laske 72 : 8. Vastaus on 9.") have too many number combinations for a
// recording per line. They are said from recorded pieces instead: number words ("seitsemänkymmentä",
// "kaksi"), fixed phrases between the numbers ("Laske", "jaettuna"), and single words when a phrase
// has no clip of its own. All pieces are the narrator's voice. The words come from spoken(): symbols are
// already Finnish words there. Pure: the lookup is passed in.

const ONES = ['nolla', 'yksi', 'kaksi', 'kolme', 'neljä', 'viisi', 'kuusi', 'seitsemän', 'kahdeksan', 'yhdeksän', 'kymmenen',
  'yksitoista', 'kaksitoista', 'kolmetoista', 'neljätoista', 'viisitoista', 'kuusitoista', 'seitsemäntoista', 'kahdeksantoista', 'yhdeksäntoista'];
const TENS = ['', '', 'kaksikymmentä', 'kolmekymmentä', 'neljäkymmentä', 'viisikymmentä', 'kuusikymmentä', 'seitsemänkymmentä', 'kahdeksankymmentä', 'yhdeksänkymmentä'];
const HUNDREDS = ['', 'sata', 'kaksisataa', 'kolmesataa', 'neljäsataa', 'viisisataa', 'kuusisataa', 'seitsemänsataa', 'kahdeksansataa', 'yhdeksänsataa'];

/** Every number piece there is: the catalog records exactly these. */
export const NUMBER_PIECES = [...ONES, ...TENS.filter(Boolean), ...HUNDREDS.filter(Boolean), 'tuhat', 'tuhatta', 'miljoona', 'miljoonaa', 'pilkku'];

function below1000(n: number): string[] {
  const out: string[] = [];
  const h = Math.floor(n / 100), r = n % 100;
  if (h) out.push(HUNDREDS[h]!);
  if (r >= 20) { out.push(TENS[Math.floor(r / 10)]!); if (r % 10) out.push(ONES[r % 10]!); }
  else if (r || !h) out.push(ONES[r]!);
  return out;
}
function whole(n: number): string[] {
  if (n < 1000) return below1000(n);
  if (n < 1e6) {
    const t = Math.floor(n / 1000), r = n % 1000;
    return [...(t === 1 ? ['tuhat'] : [...below1000(t), 'tuhatta']), ...(r ? below1000(r) : [])];
  }
  const m = Math.floor(n / 1e6), r = n % 1e6;
  return [...(m === 1 ? ['miljoona'] : [...below1000(m), 'miljoonaa']), ...(r ? whole(r) : [])];
}

/** "45" → neljäkymmentä viisi; "3,09" → kolme pilkku nolla yhdeksän; "0,25" → nolla pilkku kaksikymmentä viisi.
 *  undefined when the number is too big to say in pieces. */
export function numberWords(numeral: string): string[] | undefined {
  const [a, b] = numeral.replace(/[\s  ]/g, '').split(',');
  if (!a || a.length > 9) return undefined;
  const out = whole(Number(a));
  if (b === undefined) return out;
  if (!b) return undefined;
  out.push('pilkku');
  if (b.startsWith('0') || b.length > 3) for (const d of b) out.push(ONES[+d]!);
  else out.push(...whole(Number(b)));
  return out;
}

/** Number tokens: "12", "3,5", "12 000" (thin or no-break space between thousands). */
const NUM = /(\d{1,3}(?:[   ]\d{3})+(?:,\d+)?|\d+(?:,\d+)?)/;
/** Edge punctuation around a phrase piece; the key is the phrase without it. */
export const phraseKey = (s: string) => s.replace(/^[\s,.;:!?()–—-]+|[\s,.;:!?()–—-]+$/g, '');
/** A single word as recorded: lower case, no punctuation. */
export const wordKey = (s: string) => s.toLowerCase().replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, '');
const words = (s: string) => s.split(/[\s,.;:!?()–—]+/).map(wordKey).filter(Boolean);

export interface Piece { key: string; gapMs: number }
/** Pause after a piece, from the punctuation that follows it. */
const gapAfter = (tail: string) => (/[.!?]/.test(tail) ? 380 : /[,:;–—]/.test(tail) ? 180 : 40);

/** A spoken line as the pieces that say it, or undefined if some piece has no recording.
 *  `has(key)` tells whether a recording exists for that exact phrase or word. */
export function piecePlan(spokenText: string, has: (key: string) => boolean): Piece[] | undefined {
  const out: Piece[] = [];
  for (const sentence of spokenText.split(/(?<=[.!?])\s+/)) {
    const whole = phraseKey(sentence);
    if (!whole) continue;
    if (has(whole)) { out.push({ key: whole, gapMs: gapAfter(sentence.slice(-2)) }); continue; }
    const parts = sentence.split(NUM);
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      if (i % 2) {
        const ws = numberWords(part);
        if (!ws || ws.some(word => !has(word))) return undefined;
        const next = parts[i + 1] ?? '';
        const gap = next.trim() === '' && i === parts.length - 2 ? 380 : gapAfter(next.match(/^\s*[,.;:!?–—]?/)![0]);
        ws.forEach((w, k) => out.push({ key: w, gapMs: k < ws.length - 1 ? 0 : gap }));
        continue;
      }
      const key = phraseKey(part);
      if (!key) continue;
      const end = gapAfter(part.slice(part.lastIndexOf(key) + key.length));
      if (has(key)) { out.push({ key, gapMs: end }); continue; }
      // No clip for the phrase: word by word, pausing at the punctuation inside it.
      for (const chunk of key.split(/(?<=[,;:–—])\s+/)) {
        const ws = words(chunk);
        for (let k = 0; k < ws.length; k++) {
          if (!has(ws[k]!)) return undefined;
          out.push({ key: ws[k]!, gapMs: k < ws.length - 1 ? 40 : 180 });
        }
      }
      if (out.length) out[out.length - 1]!.gapMs = end;
    }
  }
  return out.length ? out : undefined;
}

/** What a line needs recorded (for the catalog tool): the sentences or phrases between numbers, and
 *  their words, so a phrase without its own clip can still be said word by word. */
export function pieceNeeds(spokenText: string): { phrases: string[]; words: string[] } {
  const phrases: string[] = [], ws: string[] = [];
  for (const sentence of spokenText.split(/(?<=[.!?])\s+/)) {
    sentence.split(NUM).forEach((part, i) => {
      if (i % 2) return;
      const key = phraseKey(part);
      if (key) { phrases.push(key); ws.push(...words(key)); }
    });
  }
  return { phrases, words: ws };
}
