// Maths text as Finnish words for speech: the browser voice skips or misreads symbols such as ":",
// "<", "m/s²" or "°C", and the piece player (player.ts) needs plain words and numbers to find its
// clips. Pure functions: no DOM, no audio.

const PART = ['', '', 'kahdes', 'kolmas', 'neljäs', 'viides', 'kuudes', 'seitsemäs', 'kahdeksas', 'yhdeksäs', 'kymmenes', 'yhdestoista', 'kahdestoista'];

/** Units after a number: [after 1, after other numbers]. Longest first. */
const UNITS: [string, string, string][] = [
  ['m/s²', 'metri sekunnissa toiseen', 'metriä sekunnissa toiseen'],
  ['km/h', 'kilometri tunnissa', 'kilometriä tunnissa'],
  ['m/s', 'metri sekunnissa', 'metriä sekunnissa'],
  ['cm²', 'neliösenttimetri', 'neliösenttimetriä'], ['dm²', 'neliödesimetri', 'neliödesimetriä'], ['m²', 'neliömetri', 'neliömetriä'], ['km²', 'neliökilometri', 'neliökilometriä'],
  ['cm³', 'kuutiosenttimetri', 'kuutiosenttimetriä'], ['dm³', 'kuutiodesimetri', 'kuutiodesimetriä'], ['m³', 'kuutiometri', 'kuutiometriä'],
  ['°C', 'aste', 'astetta'], ['°', 'aste', 'astetta'], ['€', 'euro', 'euroa'], ['%', 'prosentti', 'prosenttia'],
  ['km', 'kilometri', 'kilometriä'], ['dm', 'desimetri', 'desimetriä'], ['cm', 'senttimetri', 'senttimetriä'], ['mm', 'millimetri', 'millimetriä'],
  ['kg', 'kilogramma', 'kilogrammaa'], ['g', 'gramma', 'grammaa'], ['t', 'tonni', 'tonnia'],
  ['dl', 'desilitra', 'desilitraa'], ['cl', 'senttilitra', 'senttilitraa'], ['ml', 'millilitra', 'millilitraa'], ['l', 'litra', 'litraa'],
  ['min', 'minuutti', 'minuuttia'], ['h', 'tunti', 'tuntia'], ['s', 'sekunti', 'sekuntia'],
  ['kWh', 'kilowattitunti', 'kilowattituntia'], ['kW', 'kilowatti', 'kilowattia'], ['W', 'watti', 'wattia'], ['J', 'joule', 'joulea'], ['kJ', 'kilojoule', 'kilojoulea'],
  ['V', 'voltti', 'volttia'], ['A', 'ampeeri', 'ampeeria'], ['Ω', 'ohmi', 'ohmia'], ['N', 'newton', 'newtonia'],
  ['m', 'metri', 'metriä'],
];
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const UNIT_RE = new RegExp(`(\\d+(?:,\\d+)?|\\))\\s?(${UNITS.map((u) => esc(u[0])).join('|')})(?![\\p{L}\\d²³])`, 'gu');
const UNIT = new Map(UNITS.map((u) => [u[0], u]));

/** Animal and tool pictures used as words in a few tasks. Next to their own name they are dropped. */
const EMOJI: Record<string, string> = { '🐦': 'lintu', '🦆': 'sorsa', '🐟': 'kala', '🐌': 'etana', '🐸': 'sammakko' };

/** Maths symbols as Finnish words: "3/4" → "3 neljäsosaa", "□" → "laatikko", "12 : 3" → "12 jaettuna 3". */
export function spoken(text: string): string {
  return text
    // pictures: dropped beside a word that names them, else said by name
    .replace(/((?![↔↕©®™])\p{Extended_Pictographic})\uFE0F?(\s+(?=\p{Ll}))?/gu, (m, e: string, sp?: string) => (sp ? '' : EMOJI[e] ? ` ${EMOJI[e]} ` : ' '))
    .replace(/✓/g, ' ')
    .replace(UNIT_RE, (m, n: string, u: string) => `${n} ${n === '1' ? UNIT.get(u)![1] : UNIT.get(u)![2]}`)
    .replace(/(\d+)\/(\d+)/g, (m, a: string, b: string) => (PART[+b] ? `${a} ${PART[+b]}osa${a === '1' ? '' : 'a'}` : `${a} per ${b}`))
    .replace(/□/g, ' laatikko ')
    .replace(/\s*·\s*(?=[\d(−-])/g, ' kertaa ').replace(/\s*·\s*/g, ', ')
    .replace(/×/g, ' kertaa ').replace(/÷/g, ' jaettuna ').replace(/\s+\/\s+/g, ' jaettuna ').replace(/\//g, ' per ')
    // ":" as division: "12 : 3", ", : 100", "↔ : 2" (a colon right after a word stays punctuation)
    .replace(/(^|[\d)↔,(]|\p{L})\s+:\s+(?=[\d(])/gu, (m, a: string) => `${a} jaettuna `)
    .replace(/(^|[↔,(])\s*:\s*(?=\d)/g, (m, a: string) => `${a} jaettuna `)
    .replace(/[−-](?=[\d(])/g, (m, i: number, s: string) => (/[\d)]\s*$/.test(s.slice(0, i)) ? ' miinus ' : 'miinus '))
    .replace(/ − /g, ' miinus ')
    .replace(/\+/g, ' plus ')
    .replace(/≠/g, ' ei ole yhtä suuri kuin ').replace(/≈/g, ' on noin ')
    .replace(/≤/g, ' on pienempi tai yhtä suuri kuin ').replace(/≥/g, ' on suurempi tai yhtä suuri kuin ')
    .replace(/</g, ' on pienempi kuin ').replace(/>/g, ' on suurempi kuin ')
    .replace(/=/g, ' on yhtä suuri kuin ')
    .replace(/²/g, ' toiseen').replace(/³/g, ' kolmanteen')
    .replace(/\s*↔\s*/g, ' vastaa ').replace(/\s*[→|]\s*/g, ', ')
    .replace(/[”“"]/g, '')
    .replace(/\s+([,.!?:;])/g, '$1').replace(/,(?=[,.])/g, '').replace(/\s{2,}/g, ' ').trim();
}
