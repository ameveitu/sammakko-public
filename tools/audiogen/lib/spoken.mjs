// Finnish spoken forms for numbers, units and maths symbols (rules approved by the project owner
// 2026-11-02: "3/4" → "kolme neljäsosaa" and the usual recommended Finnish readings).
// spokenForm(text) → { spoken, rest }: `rest` lists what the rules could not read; such a line
// needs a hand-written form (audio/catalog/fi-FI/spoken-overrides.json) before production.
//
// Readings:
//   integers in words (compounds written together: kaksikymmentäkolme), negative: miinus …
//   decimals digit by digit after the comma: 3,45 → kolme pilkku neljä viisi (keeps place value audible)
//   fractions: 3/4 → kolme neljäsosaa, 1/4 → yksi neljäsosa
//   + plus, − miinus, × and · kertaa, a : b jaettuna (b in the adessive: viidellä), = on yhtä suuri kuin,
//   < on pienempi kuin, > on suurempi kuin, □ laatikko
//   units after a number: 1 metri, 3 metriä; m/s metriä sekunnissa; ranges 0–3 s → nollasta kolmeen sekuntiin
//   case endings written after a colon: 10:llä → kymmenellä, 18 m/s:sta → kahdeksastatoista metristä sekunnissa

const ONES = ['nolla', 'yksi', 'kaksi', 'kolme', 'neljä', 'viisi', 'kuusi', 'seitsemän', 'kahdeksan', 'yhdeksän'];

/** Nominative cardinal, written as one word. */
export function cardinal(n) {
  if (!Number.isInteger(n) || n < 0) throw new Error(`cardinal: ${n}`);
  if (n < 10) return ONES[n];
  if (n === 10) return 'kymmenen';
  if (n < 20) return ONES[n - 10] + 'toista';
  if (n < 100) return ONES[Math.floor(n / 10)] + 'kymmentä' + (n % 10 ? ONES[n % 10] : '');
  if (n < 1000) return (n < 200 ? 'sata' : ONES[Math.floor(n / 100)] + 'sataa') + (n % 100 ? cardinal(n % 100) : '');
  if (n < 1e6) return (n < 2000 ? 'tuhat' : cardinal(Math.floor(n / 1000)) + 'tuhatta') + (n % 1000 ? cardinal(n % 1000) : '');
  if (n < 1e9) return (n < 2e6 ? 'miljoona' : cardinal(Math.floor(n / 1e6)) + 'miljoonaa') + (n % 1e6 ? ' ' + cardinal(n % 1e6) : '');
  throw new Error(`cardinal: ${n} too large`);
}

// Case forms of the number words. weak = stem of the local cases (-ssa, -sta, -lla, -lta, -lle, -n),
// part = partitive, ill = illative, ess = essive stem. Back/front vowel per word.
const W = {
  nolla: { weak: 'nolla', part: 'nollaa', ill: 'nollaan', back: true },
  yksi: { weak: 'yhde', part: 'yhtä', ill: 'yhteen', back: false },
  kaksi: { weak: 'kahde', part: 'kahta', ill: 'kahteen', back: true },
  kolme: { weak: 'kolme', part: 'kolmea', ill: 'kolmeen', back: true },
  neljä: { weak: 'neljä', part: 'neljää', ill: 'neljään', back: false },
  viisi: { weak: 'viide', part: 'viittä', ill: 'viiteen', back: false },
  kuusi: { weak: 'kuude', part: 'kuutta', ill: 'kuuteen', back: true },
  seitsemän: { weak: 'seitsemä', part: 'seitsemää', ill: 'seitsemään', back: false },
  kahdeksan: { weak: 'kahdeksa', part: 'kahdeksaa', ill: 'kahdeksaan', back: true },
  yhdeksän: { weak: 'yhdeksä', part: 'yhdeksää', ill: 'yhdeksään', back: false },
  kymmenen: { weak: 'kymmene', part: 'kymmentä', ill: 'kymmeneen', back: false },
  sata: { weak: 'sada', part: 'sataa', ill: 'sataan', back: true },
  tuhat: { weak: 'tuhanne', part: 'tuhatta', ill: 'tuhanteen', back: true },
};
const LOCAL = { gen: 'n', ine: 'ssa', ela: 'sta', ade: 'lla', abl: 'lta', all: 'lle', ess: 'na', tra: 'ksi' };
const harm = (s, back) => (back ? s : s.replace(/a/g, 'ä'));
function wordCase(w, c) {
  const f = W[w];
  if (!f) throw new Error(`no case forms for ${w}`);
  if (c === 'nom') return w;
  if (c === 'part') return f.part;
  if (c === 'ill') return f.ill;
  if (c === 'ess') return { yksi: 'yhtenä', kaksi: 'kahtena', viisi: 'viitenä', kuusi: 'kuutena', tuhat: 'tuhantena' }[w] ?? f.weak + harm('na', f.back);
  if (c === 'gen') return f.weak + 'n';
  return f.weak + harm(LOCAL[c], f.back);
}
/** Cardinal in a case: every part inflects, "toista" stays (viidestätoista, kahdellekymmenelle). */
export function cardinalCase(n, c) {
  if (c === 'nom') return cardinal(n);
  if (n < 10) return wordCase(ONES[n], c);
  if (n === 10) return wordCase('kymmenen', c);
  if (n < 20) return wordCase(ONES[n - 10], c) + 'toista';
  if (n < 100) return wordCase(ONES[Math.floor(n / 10)], c) + wordCase('kymmenen', c) + (n % 10 ? wordCase(ONES[n % 10], c) : '');
  if (n < 1000) return (n < 200 ? wordCase('sata', c) : wordCase(ONES[Math.floor(n / 100)], c) + hundredsCase(c)) + (n % 100 ? cardinalCase(n % 100, c) : '');
  if (n < 1e6) return (n < 2000 ? wordCase('tuhat', c) : cardinalCase(Math.floor(n / 1000), c) + thousandsCase(c)) + (n % 1000 ? cardinalCase(n % 1000, c) : '');
  throw new Error(`cardinalCase: ${n}`);
}
const hundredsCase = (c) => wordCase('sata', c);
const thousandsCase = (c) => wordCase('tuhat', c);

// ---------------------------------------------------------------- units
// Noun forms: nom, part (after numbers other than 1), weak stem (local cases, genitive), ill, back vowels.
const N = {
  metri: { part: 'metriä', weak: 'metri', ill: 'metriin', back: false },
  senttimetri: { part: 'senttimetriä', weak: 'senttimetri', ill: 'senttimetriin', back: false },
  millimetri: { part: 'millimetriä', weak: 'millimetri', ill: 'millimetriin', back: false },
  desimetri: { part: 'desimetriä', weak: 'desimetri', ill: 'desimetriin', back: false },
  kilometri: { part: 'kilometriä', weak: 'kilometri', ill: 'kilometriin', back: false },
  gramma: { part: 'grammaa', weak: 'gramma', ill: 'grammaan', back: true },
  kilogramma: { part: 'kilogrammaa', weak: 'kilogramma', ill: 'kilogrammaan', back: true },
  tonni: { part: 'tonnia', weak: 'tonni', ill: 'tonniin', back: true },
  millilitra: { part: 'millilitraa', weak: 'millilitra', ill: 'millilitraan', back: true },
  desilitra: { part: 'desilitraa', weak: 'desilitra', ill: 'desilitraan', back: true },
  litra: { part: 'litraa', weak: 'litra', ill: 'litraan', back: true },
  sekunti: { part: 'sekuntia', weak: 'sekunni', ill: 'sekuntiin', back: true },
  minuutti: { part: 'minuuttia', weak: 'minuuti', ill: 'minuuttiin', back: true },
  tunti: { part: 'tuntia', weak: 'tunni', ill: 'tuntiin', back: true },
  aste: { part: 'astetta', weak: 'astee', ill: 'asteeseen', back: true },
  euro: { part: 'euroa', weak: 'euro', ill: 'euroon', back: true },
  prosentti: { part: 'prosenttia', weak: 'prosenti', ill: 'prosenttiin', back: true },
  neliösenttimetri: { part: 'neliösenttimetriä', weak: 'neliösenttimetri', ill: 'neliösenttimetriin', back: false },
  neliömetri: { part: 'neliömetriä', weak: 'neliömetri', ill: 'neliömetriin', back: false },
  kuutiosenttimetri: { part: 'kuutiosenttimetriä', weak: 'kuutiosenttimetri', ill: 'kuutiosenttimetriin', back: false },
};
function nounCase(w, c) {
  const f = N[w];
  if (c === 'nom') return w;
  if (c === 'part') return f.part;
  if (c === 'ill') return f.ill;
  if (c === 'gen') return f.weak + 'n';
  if (c === 'ess') return w + harm('na', f.back);
  return f.weak + harm(LOCAL[c], f.back);
}
// Symbol → [noun, rest]: m/s is "metri" + " sekunnissa" (only the first part inflects).
const UNITS = {
  mm: ['millimetri'], cm: ['senttimetri'], dm: ['desimetri'], m: ['metri'], km: ['kilometri'],
  g: ['gramma'], kg: ['kilogramma'], t: ['tonni'], ml: ['millilitra'], dl: ['desilitra'], l: ['litra'],
  s: ['sekunti'], min: ['minuutti'], h: ['tunti'], '°C': ['aste'], '€': ['euro'], '%': ['prosentti'],
  'cm²': ['neliösenttimetri'], 'm²': ['neliömetri'], 'cm³': ['kuutiosenttimetri'],
  'm/s': ['metri', ' sekunnissa'], 'km/h': ['kilometri', ' tunnissa'], 'cm/min': ['senttimetri', ' minuutissa'], 'm/min': ['metri', ' minuutissa'],
  'm/s²': ['metri', ' sekunnissa toiseen'],
};
// A unit on its own (an answer option such as "km/h" or "°C", or "yksikkö kg").
const UNIT_NAMES = {
  'm/s': 'metriä sekunnissa', 'km/h': 'kilometriä tunnissa', 'cm/min': 'senttimetriä minuutissa', 'm/min': 'metriä minuutissa', 'm/s²': 'metriä sekunnissa toiseen', 'km/min': 'kilometriä minuutissa',
  's/m': 'sekuntia metrillä', 'h/km': 'tuntia kilometrillä', 'min/cm': 'minuuttia senttimetrillä', 'm · s': 'metri kertaa sekunti', '°C': 'celsiusaste',
  m: 'metri', cm: 'senttimetri', mm: 'millimetri', km: 'kilometri', g: 'gramma', kg: 'kilogramma', l: 'litra', dl: 'desilitra', s: 'sekunti', min: 'minuutti', h: 'tunti',
};
const UNIT_RE = Object.keys(UNITS).sort((a, b) => b.length - a.length).map((u) => u.replace(/[/^$.*+?()[\]{}|\\]/g, '\\$&')).join('|');

// Letter names of variables and named points (single letters only), with the adessive for "jaettuna".
const LETTERS = { a: 'aa', b: 'bee', c: 'cee', k: 'koo', n: 'än', s: 'äs', t: 'tee', x: 'äks', y: 'yy', v: 'vee', A: 'aa', B: 'bee', C: 'cee' };
const LETTER_ADE = { aa: 'aalla', bee: 'beellä', cee: 'ceellä', koo: 'koolla', 'än': 'änällä', 'äs': 'äsällä', tee: 'teellä', 'äks': 'äksällä', yy: 'yyllä', vee: 'veellä' };

const PART = { 2: 'kahdes', 3: 'kolmas', 4: 'neljäs', 5: 'viides', 6: 'kuudes', 7: 'seitsemäs', 8: 'kahdeksas', 9: 'yhdeksäs', 10: 'kymmenes', 11: 'yhdestoista', 12: 'kahdestoista', 13: 'kolmastoista', 14: 'neljästoista', 15: 'viidestoista', 16: 'kuudestoista', 17: 'seitsemästoista', 18: 'kahdeksastoista', 19: 'yhdeksästoista', 20: 'kahdeskymmenes', 100: 'sadas', 1000: 'tuhannes' };
// Case endings written after a colon (10:llä, m/s:sta, 2:een).
const SUFFIX = { n: 'gen', ssa: 'ine', ssä: 'ine', sta: 'ela', stä: 'ela', lla: 'ade', llä: 'ade', lta: 'abl', ltä: 'abl', lle: 'all', na: 'ess', nä: 'ess', ksi: 'tra', een: 'ill', iin: 'ill', ään: 'ill', aan: 'ill', ta: 'part', tä: 'part', a: 'part', ä: 'part', ttä: 'part' };

const int = (s) => Number(s.replace(/\s/g, ''));
const neg = (s) => /^[−-]/.test(s);
/** A plain number token: −12, 3,45, 1 000. */
function number(tok, c = 'nom') {
  const minus = neg(tok); const t = tok.replace(/^[−-]/, '');
  const [i, d] = t.split(',');
  let w = cardinalCase(int(i), c);
  if (d !== undefined) {
    // Inflected decimals inflect every part: jaettuna nollalla pilkku kahdella viidellä.
    w += ' pilkku ' + [...d].map((x) => cardinalCase(+x, c)).join(' ');
  }
  return (minus ? 'miinus ' : '') + w;
}
const unitWord = (u, n, c = 'nom') => {
  const [w, tail = ''] = UNITS[u];
  return (c === 'nom' ? (n.replace(/^[−-]/, '') === '1' ? w : nounCase(w, 'part')) : nounCase(w, c)) + tail;
};

const NUM = String.raw`[−-]?\d{1,3}(?:\s\d{3})*(?:,\d+)?|[−-]?\d+(?:,\d+)?`;

/** Rule-based spoken form. Leaves anything it cannot read in `rest`. */
// The case of the word after a number decides the number's case: "4 sekunnissa" → "neljässä sekunnissa".
const CASE_OF = [[/(?:ss[aä])$/, 'ine'], [/(?:st[aä])$/, 'ela'], [/(?:ll[aä])$/, 'ade'], [/(?:lt[aä])$/, 'abl'], [/(?:lle)$/, 'all']];
// Words ending in -n that are not genitives after a number.
const NOT_GEN = new Set(['kymmenen', 'kuin', 'kun', 'on', 'niin', 'sitten', 'ennen', 'hänen', 'sen', 'tämän', 'jälkeen', 'asteen', 'kahdeksan', 'seitsemän', 'yhdeksän']);
// Words after a number that are not its noun (kuvassa 5 samassa kohdassa) or whose partitive looks like a case (5 askelta, 3 ykköstä).
const NOT_CASE = /^(samassa|samaan|samalla|samasta|välillä|kanssa|alussa|lopussa|joista|joilla|joissa|nipuista|askel|ykkös|kakkos|kolmos|nelos|vitos|kutos|kokonais|kymmenesos|sadasos|tuhannesos)/;
function caseOf(word, n) {
  const w = word.toLowerCase();
  if (NOT_CASE.test(w)) return null;
  for (const [re, c] of CASE_OF) if (re.test(w) && w.length > 4) return c;
  if (n !== '1' && /[aeiouyäö]n$/.test(w) && w.length > 4 && !NOT_GEN.has(w)) return 'gen';
  return null;
}

/** Rule-based spoken form. Leaves anything it cannot read in `rest`. */
export function spokenForm(text) {
  const whole = text.trim();
  if (UNIT_NAMES[whole]) return { spoken: UNIT_NAMES[whole], rest: [] };
  const SYM = { '<': 'pienempi kuin', '>': 'suurempi kuin', '=': 'yhtä suuri kuin', '+': 'plus', '−': 'miinus', '-': 'miinus', '×': 'kertaa', '·': 'kertaa', ':': 'jaettuna' };
  if (SYM[whole]) return { spoken: SYM[whole], rest: [] };
  let s = ` ${text} `;
  const sub = (re, f) => { s = s.replace(re, f); };
  const L = Object.keys(LETTERS).join('');
  // "20 : 5 = ?" → "Paljonko on 20 : 5?"
  sub(/^\s*(.+?)\s=\s\?\s*$/, (m, e) => ` Paljonko on ${e}? `);
  // Unit conversions: "2,5 m → cm" → "kaksi pilkku viisi metriä senttimetreiksi"; "m → cm" → "metreistä senttimetreiksi";
  // ladders of three or more: "km → hm → dam → m" → "kilometri, hehtometri, dekametri, metri".
  const LADDER = { km: 'kilometri', hm: 'hehtometri', dam: 'dekametri', m: 'metri', dm: 'desimetri', cm: 'senttimetri', mm: 'millimetri', kg: 'kilogramma', g: 'gramma', l: 'litra', dl: 'desilitra', ml: 'millilitra' };
  const PL = { km: 'kilometre', hm: 'hehtometre', dam: 'dekametre', m: 'metre', dm: 'desimetre', cm: 'senttimetre', mm: 'millimetre', kg: 'kilogrammo', g: 'grammo', l: 'litro', dl: 'desilitro', ml: 'millilitro' };
  const LU = 'km|hm|dam|dm|cm|mm|kg|dl|ml|m|g|l';
  sub(new RegExp(String.raw`(\d) (${LU}) → (${LU})(?!\p{L})`, 'gu'), (m, d, a, b) => `${d} ${a} ${PL[b]}iksi`);
  sub(new RegExp(String.raw`(?<!\p{L})(?:${LU})(?: → (?:${LU})){2,}(?!\p{L})`, 'gu'), (m) => m.split(' → ').map((u) => LADDER[u]).join(', '));
  sub(new RegExp(String.raw`(?<!\p{L})(${LU}) → (${LU})(?!\p{L})`, 'gu'), (m, a, b) => `${PL[a]}${/[aou]/.test(PL[a]) ? "ista" : "istä"} ${PL[b]}iksi`);
  // Prose operations after a comma or colon: ", : 100" → ", jaettuna sadalla"; ", · 1000" → ", kertaa tuhat".
  sub(new RegExp(String.raw`(?<=[,:]) : (${NUM})(?![\d,])`, 'gu'), (m, n) => ` jaettuna ${number(n, 'ade')}`);
  // Phrases the rules below would misread.
  sub(/km, hm, dam, m, dm, cm, mm/g, 'kilometri, hehtometri, dekametri, metri, desimetri, senttimetri, millimetri');
  sub(/matka \(m\) \/ aika \(s\)/g, 'matka metreinä jaettuna ajalla sekunteina');
  sub(/ \/ (nopeus|aika|matka)(?!\p{L})/gu, (m, w) => ` jaettuna ${{ nopeus: 'nopeudella', aika: 'ajalla', matka: 'matkalla' }[w]}`);
  sub(/([Mm]erkki) = /g, '$1 yhtä kuin ');
  sub(/=-merkk/g, 'yhtäsuuruusmerkk');
  sub(/, = ja /g, ', yhtä kuin ja ');
  sub(/ → (g|cm|dl|mm|m)(?![\p{L}\d])/gu, (m, u) => ` ${{ g: 'grammoiksi', cm: 'senttimetreiksi', dl: 'desilitroiksi', mm: 'millimetreiksi', m: 'metreiksi' }[u]}`);
  // Proportions: 2 : 5 = 6 : 15 → kaksi suhteessa viiteen on kuusi suhteessa viiteentoista.
  if (/verran|suhte/i.test(text)) sub(new RegExp(String.raw`(${NUM}) : (${NUM})`, 'gu'), (m, a, b) => ` ${number(a)} suhteessa ${number(b, 'ill')} `);
  // Machine pairs: "1 → 1, 3 → 7." → "yhdestä tulee yksi, kolmesta tulee seitsemän."
  sub(/(?<=[:,]\s)(\d+) → (\d+)(?=[,.])/g, (m, x, y) => `${number(x, 'ela')} tulee ${number(y)}`);
  // Clock times: 9.45 → yhdeksän neljäkymmentäviisi.
  sub(/(?<![\d,.])([0-2]?\d)\.(\d\d)(?![\d,])/g, (m, h, mm) => ` ${cardinal(+h)} ${mm[0] === '0' ? 'nolla ' + cardinal(+mm[1]) : cardinal(+mm)} `);
  // "km per h" in prose.
  sub(/(?<![\p{L}\d])(km|cm|m) per (h|min|s)(?![\p{L}\d])/gu, (m, a, b) => ` ${UNIT_NAMES[a]} per ${UNIT_NAMES[b]} `);
  // f(x) → äf äks.
  sub(/(?<![\p{L}])f\(/gu, ' äf (');
  // Ranges: 0–3 s → nollasta kolmeen sekuntiin; 1–5 → yhdestä viiteen.
  sub(new RegExp(String.raw`(?<![\d,])(\d+)–(\d+)(?:\s(${UNIT_RE}))?(?![\d\p{L}])`, 'gu'), (m, a, b, u) => ` ${number(a, 'ela')} ${number(b, 'ill')}${u ? ' ' + unitWord(u, b, 'ill') : ''} `);
  // Number + unit + case ending: 18 m/s:sta.
  sub(new RegExp(String.raw`(${NUM})\s(${UNIT_RE}):(\p{L}+)`, 'gu'), (m, n, u, suf) => { const c = SUFFIX[suf]; return c ? ` ${number(n, c)} ${unitWord(u, n, c)} ` : m; });
  // Number + case ending: 10:llä, 5:een.
  sub(new RegExp(String.raw`(?<![\d,])(${NUM}):(\p{L}+)`, 'gu'), (m, n, suf) => { const c = SUFFIX[suf]; return c ? ` ${number(n, c)} ` : m; });
  // a : b → a jaettuna b:llä (division, with spaces around the colon).
  sub(new RegExp(String.raw`(${NUM}) : (${NUM})`, 'gu'), (m, a, b) => ` ${number(a)} jaettuna ${number(b, 'ade')} `);
  // "x / y" with spaces: the divisor in the adessive (number, number + unit, letter, Δletter).
  sub(new RegExp(String.raw`\s/\s(${NUM})(?:\s(${UNIT_RE}))?(?![\p{L}\d/])`, 'gu'), (m, n, u) => ` jaettuna ${number(n, 'ade')}${u ? ' ' + unitWord(u, n, 'ade') : ''} `);
  sub(new RegExp(String.raw`\s/\s(Δ?)([${L}])(?![\p{L}\d])`, 'gu'), (m, d, v) => ` jaettuna ${d ? 'delta ' : ''}${LETTER_ADE[LETTERS[v]]} `);
  // "jaettuna 240 s" in prose: the divisor in the adessive.
  sub(new RegExp(String.raw`jaettuna (${NUM})(?:\s(${UNIT_RE}))?(?![\p{L}\d/])`, 'gu'), (m, n, u) => `jaettuna ${number(n, 'ade')}${u ? ' ' + unitWord(u, n, 'ade') : ''}`);
  // Fractions.
  sub(/(?<![\d,])(\d+)\/(\d+)(?![\d/])/g, (m, a, b) => (PART[+b] ? ` ${cardinal(+a)} ${PART[+b]}osa${a === '1' ? '' : 'a'} ` : m));
  // Number + unit, inflected by a following case word ("3 m:n" is written out in the texts, so only words).
  sub(new RegExp(String.raw`(${NUM})(?:\s(${UNIT_RE})|(°C|%|€))(?![\p{L}\d²³/])(?!:\p{L})(\s(\p{L}+))?`, 'gu'), (m, n, u1, u2, sp, w) => {
    const u = u1 ?? u2;
    const c = w && /(?:n)$/.test(w) && !NOT_GEN.has(w.toLowerCase()) && n !== '1' && w.length > 4 && /(?:in|an|än|en)$/.test(w) ? 'gen' : 'nom';
    return ` ${number(n, c)} ${unitWord(u, n, c)}${sp ?? ''} `;
  });
  // Number + inflected word: 4 sekunnissa → neljässä sekunnissa, 3 metrin → kolmen metrin.
  sub(new RegExp(String.raw`(?<![\p{L}\d,])(${NUM})(\s)(\p{L}+)`, 'gu'), (m, n, sp, w) => {
    const c = /,/.test(n) ? null : caseOf(w, n.replace(/^[−-]/, ''));
    return c ? ` ${number(n, c)}${sp}${w}` : m;
  });
  // Points: (1, 3) → piste yksi, kolme.
  sub(new RegExp(String.raw`\((${NUM}), (${NUM})\)`, 'gu'), (m, a, b) => ` piste ${number(a)}, ${number(b)} `);
  // Remaining brackets: (4 − 0) m/s is read without them.
  sub(/[()]/g, ' ');
  // Operators between terms.
  sub(/\s[×·]\s/g, ' kertaa ');
  sub(/\s[−-]\s/g, ' miinus ');
  sub(/\s\+\s/g, ' plus ');
  sub(/\s=\s/g, ' on ');
  sub(/\s<\s/g, ' on pienempi kuin ');
  sub(/\s>\s/g, ' on suurempi kuin ');
  sub(/□/g, ' laatikko ');
  // Unit symbols on their own in prose: "yksikkö kg" → "yksikkö kilogramma".
  sub(/(?<![\p{L}\d/])(km\/min|km\/h|m\/s|cm\/min|°C|kg|km|cm|mm|dl|min)(?![\p{L}\d/])/gu, (m, u) => ` ${UNIT_NAMES[u]} `);
  // Letters with a case ending or a hyphen: y:n → yyn, x-akseli → äks-akseli; kx → koo äks; −x → miinus äks.
  const LNAME = (v, suf) => { const w = LETTERS[v]; return /[aeiouyäö]$/.test(w) ? w + suf : w + 'ä' + suf; };
  sub(new RegExp(String.raw`(?<![\p{L}\d])([${L}]):(\p{L}+)`, 'gu'), (m, v, suf) => ` ${LNAME(v, suf)} `);
  sub(new RegExp(String.raw`(?<![\p{L}\d])([${L}])-(?=\p{L})`, 'gu'), (m, v) => ` ${LETTERS[v]}-`);
  sub(/(?<![\p{L}\d])kx(?![\p{L}\d])/gu, ' koo äks ');
  sub(new RegExp(String.raw`(?<![\p{L}\d])[−-]([${L}])(?![\p{L}\d])`, 'gu'), (m, v) => ` miinus ${LETTERS[v]} `);
  // Variables and coefficients: 3n → kolme än, Δx → delta äks, x → äks.
  sub(new RegExp(String.raw`(?<![\p{L}\d,])(\d+)([${L}])(?![\p{L}\d])`, 'gu'), (m, n, v) => ` ${cardinal(+n)} ${LETTERS[v]} `);
  sub(new RegExp(String.raw`Δ([${L}])(?![\p{L}\d])`, 'gu'), (m, v) => ` delta ${LETTERS[v]} `);
  sub(new RegExp(String.raw`(?<![\p{L}\d-])([${L}])(?![\p{L}\d-])`, 'gu'), (m, v) => ` ${LETTERS[v]} `);
  // Remaining plain numbers.
  sub(new RegExp(String.raw`(?<![\p{L}\d,])(${NUM})(?![\d\p{L}/])(?!:\p{L})`, 'gu'), (m, n) => ` ${number(n)} `);
  sub(/\s→\s/g, ', ');
  let spoken = s.replace(/\s+([.,!?;:])/g, '$1').replace(/\s+/g, ' ').trim();
  spoken = spoken.replace(/(^|[.!?]\s)(\p{Ll})/gu, (m, a, b) => a + b.toUpperCase());
  const rest = [...new Set(spoken.match(/[0-9□×·÷/=+−<>%€°^²³Δ()]|(?<!\p{L})-(?=\d)|(?<!\p{L})\p{L}(?!\p{L})|(?<!\p{L})\p{L}{2}(?!\p{L})/gu) ?? [])]
    .filter((x) => !['on', 'ja', 'se', 'ei', 'jo', 'yy', 'aa', 'än', 'äs', 'ne', 'me', 'te', 'he', 'nyt', 'ja', 'tai', 'jos', 'kun', 'Se', 'Ei', 'Jo', 'Ne', 'On', 'Ja', 'Me', 'Aa', 'Än', 'Äs', 'Yy', 'äf', 'et'].includes(x));
  return { spoken, rest };
}
