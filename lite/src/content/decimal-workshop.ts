import type { Item, NodeSpec, Phase, Task } from '../engine/types';
import type { Rng } from '../engine/rng';
import { cases, choose } from './kit';
import {
  columnExchanges, decimalLabel, decimalTicks, fractionInHundredths, ledger, percentAmount,
  type DecimalChange,
} from './models/decimal-workshop';
import { decimalWorkbench, type DecimalWorkbench } from './scenes/decimal-workshop';

type DecimalItem = Omit<Item, 'tag' | 'scene' | 'afterCorrect'>;
type Question = (r: Rng, phase: Phase) => Omit<Item, 'tag'>;
type Definition = Omit<NodeSpec, 'item' | 'demo' | 'validRevs' | 'rev'> & {
  families: Record<string, Question>;
  transfer: Question;
  example: Question;
  limit: string;
};

const tile = 'Yksi kokonainen on yksi samanmittainen mittalaatta.';
const percentWhole = 'Yksi kokonainen laatta on 1,00 eli 100 %. Toinen laatta on samankokoinen.';
const number = (answer: number, unit?: string, whyAt?: Record<number, string>): Task =>
  ({ kind: 'numeric', answer, unit, tolerance: 0, whyAt });
const amount = (hundredths: number, unit?: string, whyAt?: Record<number, string>): Task =>
  number(hundredths / 100, unit, whyAt);

function display(board: DecimalWorkbench, result: DecimalWorkbench, item: DecimalItem) {
  return { ...item, scene: decimalWorkbench(board), afterCorrect: decimalWorkbench(result), quantityModel: board };
}

function definition({ families, transfer, example, limit, ...meta }: Definition) {
  const rev = `exp690-lm09-${meta.id.toLowerCase()}-${meta.id==='M-PCT-05'?'v2':'v1'}`;
  const spec: NodeSpec = {
    ...meta, rev, validRevs: [rev], item: cases(families, transfer),
    demo(r) {
      const sample = example(r, 'guided');
      return [{ say: sample.say, scene: sample.scene! }, { say: sample.explain, scene: sample.afterCorrect! }];
    },
  };
  return { spec, evidence: { families: Object.keys(families), limit } };
}

type DecimalCard = readonly [value: number, places: 1 | 2];
const asCard = ([value, places]: DecimalCard) => decimalLabel(value, places);

function pair(r: Rng, guided: boolean, transfer = false) {
  const [left, right] = (transfer
    ? r.pick([[[60, 1], [59, 2]], [[90, 2], [90, 1]], [[108, 2], [110, 1]]] as const)
    : guided ? [[80, 1], [75, 2]] as const
      : r.pick([[[80, 1], [75, 2]], [[50, 2], [50, 1]], [[7, 2], [70, 1]], [[105, 2], [110, 1]]] as const));
  const l = asCard(left), rr = asCard(right);
  const relation = left[0] < right[0] ? '<' : left[0] > right[0] ? '>' : '=';
  const labels = transfer ? ['Köysi A', 'Köysi B'] : ['Varaus A', 'Varaus B'];
  const board: DecimalWorkbench = {
    whole: transfer ? 'Kummankin köyden vertailuyksikkö on yksi metri.' : tile,
    rows: [
      { label: labels[0]!, value: l, ...(guided ? { fill: left[0] } : {}) },
      { label: labels[1]!, value: rr, ...(guided ? { fill: right[0] } : {}) },
    ],
  };
  const symbols = ['<', '=', '>'];
  const why = 'Vertaa samoja lukupaikkoja. Lopussa oleva nolla ei muuta määrää.';
  return display(board, { ...board, rows: board.rows.map((row, i) => ({ ...row, fill: [left, right][i]![0] })),
    receipt: relation === '=' ? 'Sama varaus, sama lähetyslokero.' : `Suurempi varaus siirtyi lokeroon ${relation === '>' ? 'A' : 'B'}.` }, {
    say: 'Valitse merkki, joka sopii A:n ja B:n väliin.',
    hint: 'Vertaa ensin kokonaisia, sitten kymmenesosia ja vasta sitten sadasosia.',
    explain: `${decimalLabel(left[0])} ${relation} ${decimalLabel(right[0])}. ${why}`,
    task: { kind: 'choice', options: symbols.map(big => ({ big })), answer: symbols.indexOf(relation), why: symbols.map(symbol => symbol === relation ? undefined : why) },
  });
}

function order(r: Rng) {
  const cards = r.shuffle(r.pick([
    [[80, 1], [75, 2], [7, 2]], [[60, 1], [69, 2], [61, 2]], [[108, 2], [110, 1], [99, 2]],
  ] as const).map((card, i) => ({ id: `m${i}`, card })));
  const sorted = [...cards].sort((a, b) => a.card[0] - b.card[0]);
  const slots = [{ id: 'small', text: 'Pienin' }, { id: 'middle', text: 'Keskimmäinen' }, { id: 'large', text: 'Suurin' }];
  const board: DecimalWorkbench = {
    whole: tile, rows: [], note: 'Kaikki kolme varausta on mitattu samalla laatalla.',
  };
  return display(board, {
    whole: board.whole, rows: sorted.map(({ card }, i) => ({ label: slots[i]!.text, value: asCard(card), fill: card[0] })),
    receipt: 'Varauslaput ovat lähetyslokeroissa pienimmästä suurimpaan.',
  }, {
    say: 'Järjestä kolme varauslappua pienimmästä suurimpaan.',
    task: { kind: 'place', tokens: cards.map(({ card, id }) => ({ id, text: asCard(card) })), slots,
      answer: Object.fromEntries(slots.map(({ id }, i) => [id, sorted[i]!.id])) },
    hint: 'Vertaa kunkin kortin samoja lukupaikkoja. Voit ajatella lopussa tyhjää paikkaa nollana.',
    explain: `${sorted.map(({ card }) => asCard(card)).join(' < ')}. Merkinnän pituus ei päätä suuruutta.`,
  });
}

const comparison = definition({
  id: 'M-DEC-05', stop: 'Eripituiset varauslaput', icon: '↔', intro: 'Loikka tuo asemalle eri pituisia desimaalilappuja. Aava lajittelee varaukset samankokoisella mittalaatalla.',
  goal: 'Opit vertaamaan ja järjestämään desimaalilukuja samojen lukupaikkojen avulla.',
  reward: 'Varauslaput ovat oikeissa lähetyslokeroissa.',
  families: { 'decimal-compare-pair': r => pair(r, false), 'decimal-order-three': order },
  transfer: r => pair(r, false, true), example: r => pair(r, true),
  limit: 'Näyttö koskee ei-negatiivisten desimaalien vertailua ja järjestystä enintään sadasosan tarkkuudella. Vapaa perustelu ei tallennu.',
});

function position(r: Rng, scale: 'tenths' | 'zoom' | 'transfer', demonstration = false) {
  const tenths = scale === 'tenths';
  const min = tenths ? 0 : scale === 'zoom' ? r.pick([20, 40, 70]) : r.pick([130, 240, 560]);
  const range = decimalTicks(min, min + (tenths ? 100 : 10), tenths ? 10 : 1, min + (tenths ? 10 : 1) * r.int(2, 8));
  const value = decimalLabel(range.target, tenths ? 1 : 2);
  const unit = scale === 'transfer' ? 'm' : undefined;
  const board: DecimalWorkbench = {
    whole: unit ? 'Yksi kokonainen mittayksikkö on 1 m.' : 'Yksi kokonainen väli on 1,00.',
    rows: [{ label: 'Merkittävä kohta', value: `${value}${unit ? ` ${unit}` : ''}` }, {
      label: 'Yksi pikkuväli', value: decimalLabel(range.step, tenths ? 1 : 2),
    }],
    note: tenths ? 'Kokonainen väli näkyy kokonaan.' : 'Näkyvissä on vain suurennettu osa kokonaisesta välistä.',
    ...(demonstration ? { axis: range } : {}),
  };
  return display(board, { ...board, ...(demonstration ? { axis: { ...range, marked: true } } : {}), receipt: `Reittimerkki kiinnitettiin kohtaan ${value}${unit ? ' m' : ''}.` }, {
    say: `Aseta merkki kohtaan ${value}${unit ? ' m' : ''}.`,
    task: { kind: 'line', min: range.min / 100, max: range.max / 100, step: range.step / 100, answer: range.target / 100,
      labelEvery: tenths ? 0.2 : 0.05, unit },
    hint: 'Lähde vasemmalla näkyvästä arvosta. Lisää jokaisella askeleella täsmälleen yhden pikkuvälin verran.',
    explain: `Aloita kohdasta ${decimalLabel(range.min)}. Etene ${(range.target - range.min) / range.step} väliä, kukin ${decimalLabel(range.step)}. Päädyt kohtaan ${value}.`,
  });
}

const line = definition({
  id: 'M-DEC-06', stop: 'Tarkkuusmerkki reitille', icon: '📍', intro: 'Loikka vie aseman merkin tutkimusreitille. Aava pitää koko asteikon mittayksikön selvillä myös suurennuksessa.',
  goal: 'Opit sijoittamaan desimaaliluvun lukusuoralle eri asteikoilla.',
  reward: 'Tarkkuusmerkki on oikealla kohdalla viestireittiä.',
  families: { 'line-whole-tenths': r => position(r, 'tenths'), 'line-zoom-hundredths': r => position(r, 'zoom') },
  transfer: r => position(r, 'transfer'), example: r => position(r, 'tenths', true),
  limit: 'Vastaus osoittaa merkityn desimaalipisteen annetulla positiivisella asteikolla. Menetelmää ei havaita.',
});

type Mode = 'receive' | 'send' | 'both' | 'remove' | 'difference' | 'subtract-transfer';
function ledgerQuestion(r: Rng, mode: Mode, phase: Phase) {
  const guided = phase === 'guided';
  const [start, delta, places] = mode === 'receive'
    ? r.pick([[70, 23, 1], [43, 57, 2], [85, 30, 2]] as const)
    : mode === 'difference'
      ? r.pick([[96, 20, 2], [88, 51, 2], [112, 43, 2]] as const)
      : mode === 'subtract-transfer'
        ? r.pick([[70, 32, 1], [115, 70, 2], [140, 58, 1]] as const)
        : guided ? [80, 36, 1] as const
          : r.pick([[80, 36, 1], [105, 68, 2], [120, 37, 1], [85, 35, 2]] as const);
  const both = mode === 'both';
  const changes: DecimalChange[] = both
    ? [{ direction: '+', hundredths: delta }, { direction: '−', hundredths: r.pick([15, 25, 42]) }]
    : [{ direction: mode === 'receive' ? '+' : '−', hundredths: delta }];
  const balances = ledger(start, changes);
  const final = balances.at(-1)!;
  const first = decimalLabel(start, places);
  const changeLabel = (value: number) => decimalLabel(value, value % 10 === 0 ? 1 : 2);
  const taskWord = mode === 'difference' ? 'Kuinka paljon pidempi on A kuin B?' : 'Kuinka paljon jää?';
  const unit = mode === 'subtract-transfer' || mode === 'difference' ? 'm' : 'l';
  const rows: DecimalWorkbench['rows'] = mode === 'difference'
    ? [{ label: 'Nauha A', value: `${first} m` }, { label: 'Nauha B', value: `${changeLabel(delta)} m` }]
    : [{ label: 'Alussa', value: `${first} ${unit}` }, ...changes.map(({ direction, hundredths }, i) => ({
      label: `${both ? `${i + 1}. ` : ''}${direction === '+' ? 'Saapuu' : 'Lähtee'}`, value: `${changeLabel(hundredths)} ${unit}`,
    }))];
  const columns = guided && !both ? [{ label: 'Alussa', digits: slots(start) }, { label: 'Muutos', digits: slots(delta) }] : undefined;
  const board: DecimalWorkbench = { whole: `Yksi kokonainen on 1 ${unit}.`, rows, columns };
  const exchange = !both && changes[0]!.direction === '−' ? columnExchanges(start, delta) : undefined;
  const exchangeText = exchange ? [
    exchange.tenths ? 'Vaihda yksi kokonainen kymmeneksi kymmenesosaksi.' : '',
    exchange.hundredths ? 'Vaihda yksi kymmenesosa kymmeneksi sadasosaksi.' : '',
  ].filter(Boolean).join(' ') : '';
  const calc = changes.map(({ direction, hundredths }, i) =>
    `${decimalLabel(i ? balances[i - 1]! : start)} ${direction} ${decimalLabel(hundredths)} = ${decimalLabel(balances[i]!)} ${unit}`).join('. ');
  const wrong = ledger(start, changes.map(change => ({ ...change, direction: change.direction === '+' ? '−' : '+' }))).at(-1)!;
  const wrongAt: Record<number, string> = {
    [wrong / 100]: 'Katso tapahtuman suunta: saapuva määrä lisätään ja lähtevä määrä vähennetään.',
  };
  if (start === 80 && delta === 36) wrongAt[0.54] = 'Sadasosissa ei vaihdeta vähennysjärjestystä. Vaihda ensin yksi kymmenesosa kymmeneksi sadasosaksi.';
  return display(board, {
    ...board, columns: undefined,
    rows: [...rows, ...(both ? [{ label: 'Ensimmäisen jälkeen', value: `${decimalLabel(balances[0]!)} ${unit}` }] : []),
      { label: 'Tulos', value: `${decimalLabel(final)} ${unit}`, fill: final }],
    receipt: mode === 'difference' ? 'Nauhojen ero kirjattiin varauslappuun.' : 'Aseman varauslappu päivittyi oikeaan määrään.',
  }, {
    say: both ? 'Kirjaa jäljelle jäävä määrä, kun ensin saapuva erä lisätään ja sitten lähtevä erä viedään.'
      : mode === 'receive' ? 'Kuinka paljon varastossa on toimituksen jälkeen?' : taskWord,
    task: amount(final, unit, wrongAt),
    hint: both ? 'Laske ensimmäinen muutos ensin. Käytä sen jälkeen saatua määrää toisen muutoksen lähtökohtana.'
      : 'Kohdista kokonaiset, kymmenesosat ja sadasosat. Voit täydentää lyhyemmän merkinnän loppuun nollan.',
    explain: `${calc}. ${exchangeText}`.trim(),
  });
}

function slots(value: number): [string, string, string] {
  const [whole, decimals] = decimalLabel(value).split(',');
  return [whole!, decimals![0]!, decimals![1]!];
}

const mixed = definition({
  id: 'M-DEC-07', stop: 'Aseman varauskirja', icon: '📒', intro: 'Varauskirjaan merkitään sekä saapuvat että lähtevät määrät. Aava ja Loikka päivittävät yhden paikallisen varauksen kerrallaan.',
  goal: 'Opit tulkitsemaan saapuvan ja lähtevän desimaalimäärän varastotilanteissa.',
  reward: 'Aseman varauskirja ja näkyvä määrä täsmäävät.',
  families: { 'ledger-incoming': (r, p) => ledgerQuestion(r, 'receive', p), 'ledger-outgoing': (r, p) => ledgerQuestion(r, 'send', p) },
  transfer: (r, p) => ledgerQuestion(r, 'both', p), example: (r, p) => ledgerQuestion(r, 'both', p),
  limit: 'Saapuvan ja lähtevän erän laskut vaativat erilliset vastaukset. Siirto arvioi kahden muutoksen lopputuloksen. Tämä näyttö ei korvaa atomisten yhteen- ja vähennyslaskujen arviointia.',
});

const subtraction = definition({
  id: 'M-DEC-SUB', stop: 'Jäljelle jäävä osuus', icon: '−', intro: 'Loikka noutaa osan aseman varauksesta. Aava merkitsee täsmällisesti, kuinka paljon jäi.',
  goal: 'Opit vähentämään desimaalimääriä samoissa lukuyksiköissä myös vaihdon yli.',
  reward: 'Jäljelle jäävä osuus sai tarkan varauslapun.',
  families: { 'subtract-remainder': (r, p) => ledgerQuestion(r, 'remove', p), 'subtract-comparison': (r, p) => ledgerQuestion(r, 'difference', p) },
  transfer: (r, p) => ledgerQuestion(r, 'subtract-transfer', p), example: (r, p) => ledgerQuestion(r, 'remove', p),
  limit: 'Näyttö on täsmällinen erotus ei-negatiivisessa sadasosadomeenissa. Mahdollinen vaihto havainnollistetaan palautteessa. Vapaata menetelmän selitystä ei arvioida.',
});

type SimpleFraction = readonly [n: number, d: number];
const easyFractions: readonly SimpleFraction[] = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5]];
const pctFractions: readonly SimpleFraction[] = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [4, 5]];
const fractionText = ([n, d]: SimpleFraction) => `${n}/${d}`;

function fractionDecimal(r: Rng, direction: 'to-decimal' | 'to-fraction' | 'transfer', phase: Phase) {
  const sample = direction === 'transfer' ? r.pick([[3, 20], [7, 20], [9, 20]] as const) : r.pick(easyFractions);
  const [n, d] = sample;
  const cents = fractionInHundredths(n, d);
  const label = fractionText(sample);
  const decimal = decimalLabel(cents);
  const back = direction === 'to-fraction';
  const unit = direction === 'transfer' ? 'l' : undefined;
  const whole = unit ? 'Yksi kokonainen pullo on 1 l.' : tile;
  const board: DecimalWorkbench = {
    whole, rows: [{ label: 'Viestin merkintä', value: back ? decimal : label, ...(phase === 'guided' ? { fill: cents, parts: back ? 10 : d } : {}) }],
    note: unit ? 'Murtoluku ilmaisee osuuden yhdestä täydestä pullosta.' : undefined,
  };
  const task: Task = back ? { kind: 'frac', n, d } : amount(cents, unit, {
    [n / 100]: 'Osoittaja kertoo montako nimittäjän kokoista osaa on käytössä. Ensin tarvitaan yhteinen sadasosajako.',
  });
  return display(board, {
    whole, rows: [{ label: 'Murtoluku', value: label, fill: cents, parts: d }, { label: 'Desimaaliluku', value: `${decimal}${unit ? ' l' : ''}`, fill: cents }],
    receipt: 'Vastaanottoasema sai saman osuuden uudella merkintätavalla.',
  }, {
    say: back ? 'Kirjoita viestin määrä samansuuruisena murtolukuna.'
      : unit ? 'Kuinka monta litraa pullossa on? Kirjoita määrä desimaalilukuna.' : 'Kirjoita viestin osuus desimaalilukuna.',
    task, hint: 'Säilytä sama kokonainen. Muuta osan nimi sadasosiksi muuttamatta väritetyn osuuden kokoa.',
    explain: `${label} = ${cents}/100 = ${decimal}. Osuus samasta kokonaisesta säilyy.`,
  });
}

const fracDecimal = definition({
  id: 'M-FRACDEC-01', stop: 'Sama osa kahdella lapulla', icon: '◫', intro: 'Majavan viesti näyttää murtoluvun. Helmisimpukan vastaanotto käyttää desimaalilukuja samasta kokonaisesta.',
  goal: 'Opit muuttamaan yksinkertaisen päättyvän murtoluvun desimaaliksi ja takaisin.',
  reward: 'Vastaanottoasema sai osuuden, joka säilyi matkalla samana.',
  families: { 'fraction-to-decimal': (r, p) => fractionDecimal(r, 'to-decimal', p), 'decimal-to-fraction': (r, p) => fractionDecimal(r, 'to-fraction', p) },
  transfer: (r, p) => fractionDecimal(r, 'transfer', p), example: (r, p) => fractionDecimal(r, 'to-decimal', p),
  limit: 'Tehtävät rajaavat päättyvät ei-negatiiviset osuudet sadasosiin. Siirrossa uusi kahdeskymmenesosajako tulkitaan litroina. Jaksollisia desimaaleja ei arvioida.',
});

function matching(r: Rng, matches: readonly { id: string; text: string; value: string }[], distractors: readonly string[]): Task {
  const values = [...new Set([...matches.map(slot => slot.value), ...distractors])];
  const tokenId = (value: string) => `label-${values.indexOf(value)}`;
  return {
    kind: 'place', tokens: r.shuffle(values.map(text => ({ id: tokenId(text), text }))),
    slots: matches.map(({ id, text }) => ({ id, text })),
    answer: Object.fromEntries(matches.map(({ id, value }) => [id, tokenId(value)])),
  };
}

function fractionPercent(r: Rng, back: boolean, phase: Phase) {
  const sample = r.pick(pctFractions);
  const pct = fractionInHundredths(...sample);
  const label = fractionText(sample);
  const board: DecimalWorkbench = { whole: percentWhole, rows: [
    { label: 'Lähetyslappu', value: back ? `${pct} %` : label, ...(phase === 'guided' ? { fill: pct, parts: back ? 10 : sample[1] } : {}) },
  ] };
  return display(board, {
    ...board, rows: [{ label: 'Murtoluku', value: label, fill: pct, parts: sample[1] }, { label: 'Prosentti', value: `${pct} %`, fill: pct }],
    receipt: 'Kaksi saarta sai saman osuuden omilla merkinnöillään.',
  }, {
    say: back ? 'Kirjoita sama osuus murtolukuna. Samanarvoiset murtoluvut sopivat.' : 'Kirjoita, kuinka monta prosenttia lähetyslappu tarkoittaa.',
    task: back ? { kind: 'frac', n: sample[0], d: sample[1] } : number(pct, '%', {
      [sample[0]]: 'Prosentti kertoo sadasosien määrän. Pelkkä murtoluvun osoittaja ei yleensä ole prosenttiluku.',
    }),
    hint: 'Yksi prosentti on yksi sadasosa samasta kokonaisesta. Moneenko sadasosaan alkuperäinen osuus vastaa?',
    explain: `${label} = ${pct}/100 = ${pct} %. Koko laatta vastaa sataa prosenttia.`,
  });
}

function fractionPercentTransfer(r: Rng) {
  const [first, second] = r.pick([[[1, 10], [2, 5]], [[3, 10], [3, 4]], [[7, 10], [1, 4]]] as const);
  const rateA = fractionInHundredths(first[0], first[1]);
  const rateB = fractionInHundredths(second[0], second[1]);
  const fracA = fractionText(first), fracB = fractionText(second);
  const board: DecimalWorkbench = {
    whole: 'Kummankin samanpituisen lipun kokonainen pituus on 100 %.',
    rows: [{ label: 'Lipun A osuus', value: fracA }, { label: 'Lipun B osuus', value: `${rateB} %` }],
  };
  return display(board, {
    ...board, rows: [{ label: 'Lippu A', value: `${fracA} = ${rateA} %`, fill: rateA, parts: first[1] },
      { label: 'Lippu B', value: `${rateB} % = ${fracB}`, fill: rateB, parts: second[1] }],
    receipt: 'Lippujen mitat saatiin samaan karttaan kahdella merkintätavalla.',
  }, {
    say: 'Merkitse lipun A osuus prosenttina ja lipun B osuus murtolukuna.',
    task: matching(r, [{ id: 'a', text: 'A · prosentti', value: `${rateA} %` }, { id: 'b', text: 'B · murtoluku', value: fracB }],
      [`${first[0]} %`, `1/${second[1] === 4 ? 10 : 4}`]),
    hint: 'Muunnoksessa vaihtuu merkintä. Lipun koko ja merkitty osuus eivät vaihdu.',
    explain: `Lippu A: ${fracA} = ${rateA}/100 = ${rateA} %. Lippu B: ${rateB} % = ${rateB}/100 = ${fracB}.`,
  });
}

const fractionRate = definition({
  id: 'M-PCT-02', stop: 'Lähetyslapun murto-osuus', icon: '%', intro: 'Loikka muuntaa kahden saaren lähetyslaput samaa osuutta kuvaaviksi merkinnöiksi.',
  goal: 'Opit muuttamaan helpon murto-osuuden prosentiksi ja takaisin.',
  reward: 'Lähetyslaput kertovat saman osuuden kummassakin saaressa.',
  families: { 'fraction-to-percent': (r, p) => fractionPercent(r, false, p), 'percent-to-fraction': (r, p) => fractionPercent(r, true, p) },
  transfer: fractionPercentTransfer, example: (r, p) => fractionPercent(r, false, p),
  limit: 'Itsenäiset tapaukset sisältävät itse tuotetun prosentti- tai murtoluvun. Siirrossa kohdistetaan kaksi uutta annettua merkintää. Supistaminen ei ole ehto.',
});

function decimalPercent(r: Rng, back: boolean, phase: Phase) {
  const pct = r.pick([5, 8, 25, 50, 75, 100]);
  const label = decimalLabel(pct, pct % 10 === 0 && r.chance(0.5) ? 1 : 2);
  const board: DecimalWorkbench = { whole: percentWhole, rows: [
    { label: 'Tutkimusikkunan viesti', value: back ? `${pct} %` : label, ...(phase === 'guided' ? { fill: pct } : {}) },
  ] };
  return display(board, {
    ...board, rows: [{ label: 'Desimaaliluku', value: label, fill: pct }, { label: 'Prosentti', value: `${pct} %`, fill: pct }],
    receipt: 'Viestitaulun molemmat merkinnät osoittavat yhtä suuren varauksen.',
  }, {
    say: back ? 'Kirjoita sama osuus desimaalilukuna.' : 'Kirjoita sama osuus prosentteina.',
    task: back ? amount(pct, undefined, { [pct]: 'Prosenttiluku kertoo sadasosien määrän, ei kokonaisten määrää.' })
      : number(pct, '%', { [pct / 100]: 'Kun 1,00 on 100 %, yhdestä sadasosasta tulee yksi prosentti.' }),
    hint: 'Täysi laatta vastaa yhtä kokonaista. Yksi sadasosa on 0,01 eli 1 %.',
    explain: `${label} on ${pct} sadasosaa eli ${pct} % samasta kokonaisesta.`,
  });
}

function decimalPercentTransfer(r: Rng) {
  const [small, large] = r.pick([[3, 125], [7, 150], [2, 175]] as const);
  const smallDecimal = decimalLabel(small), largeDecimal = decimalLabel(large);
  const board: DecimalWorkbench = {
    whole: percentWhole,
    rows: [{ label: 'Saapuva viesti A', value: smallDecimal }, { label: 'Saapuva viesti B', value: `${large} %` }],
    note: 'Yli 100 % täyttää ensimmäisen kokonaisen ja osan toisesta samankokoisesta laatasta.',
  };
  return display(board, {
    ...board, rows: [{ label: 'Viesti A', value: `${smallDecimal} = ${small} %`, fill: small },
      { label: 'Viesti B', value: `${large} % = ${largeDecimal}`, fill: large }],
    receipt: 'Pieni varaus ja yli yhden laatan varaus näkyvät vastaanoton taulussa.',
  }, {
    say: 'Vaihda pieni desimaaliosuus prosentiksi ja yli yhden laatan prosenttiosuus desimaaliksi.',
    task: matching(r, [{ id: 'a', text: 'A · prosentti', value: `${small} %` }, { id: 'b', text: 'B · desimaaliluku', value: largeDecimal }],
      [`${small * 10} %`, decimalLabel(large - 100)]),
    hint: 'Vertaile merkintöjä yhteen täyteen laattaan. Pilkun paikka muuttuu, mutta varattu määrä pysyy samana.',
    explain: `${smallDecimal} = ${small} % ja ${large} % = ${largeDecimal}. Sata prosenttia vastaa 1,00:aa.`,
  });
}

const decimalRate = definition({
  id: 'M-PCT-03', stop: 'Kaksi tutkimusikkunaa', icon: '◉', intro: 'Loikka näkee desimaalin ja Aava prosenttiluvun. He tarkistavat molemmat samalla laatalla.',
  goal: 'Opit muuttamaan desimaaliluvun prosentiksi ja prosentin takaisin desimaaliksi.',
  reward: 'Viestitaulu näyttää saman varauksen kummallakin merkintätavalla.',
  families: { 'decimal-to-percent': (r, p) => decimalPercent(r, false, p), 'percent-to-decimal': (r, p) => decimalPercent(r, true, p) },
  transfer: decimalPercentTransfer, example: (r, p) => decimalPercent(r, false, p),
  limit: 'Itse tuotetut muunnokset koskevat kokonaisprosentteja välillä 5–100 %. Siirrossa kohdistetaan pieni kokonaisprosentti ja annettu 125–175 % osuus.',
});

function percentRoles(r: Rng) {
  const [pct, full] = r.pick([[25, 24], [50, 18], [20, 45], [75, 16]] as const);
  const reserved = percentAmount(pct, full);
  const board: DecimalWorkbench = {
    whole: `Koko varasto eli 100 % on ${full} helmeä.`,
    rows: [{ label: 'Varastoon merkitty lappu', value: `${pct} %` }, { label: 'Lähetyskoriin asetettu', value: `${reserved} helmeä`, fill: pct }],
  };
  return display(board, { ...board, receipt: 'Varastolle, prosentille ja lähetyskorille merkittiin omat laput.' }, {
    say: 'Aseta annettu kokonaismäärä, prosenttiluku ja varattu määrä omiin paikkoihinsa.',
    task: matching(r, [
      { id: 'whole', text: 'Kokonaismäärä', value: `${full} helmeä` },
      { id: 'rate', text: 'Prosenttiluku', value: `${pct} %` },
      { id: 'part', text: 'Prosenttiarvo', value: `${reserved} helmeä` },
    ], []),
    hint: 'Prosenttimerkki kuvaa osuutta. Helmien lukumäärä kuvaa joko koko varastoa tai sen osaa.',
    explain: `${full} helmeä on koko varasto, ${pct} % on osuus ja ${reserved} helmeä on prosenttiarvo.`,
  });
}

function sameRate(r: Rng, rope = false) {
  const [pct, a, b] = rope ? r.pick([[25, 12, 20], [50, 10, 16], [20, 15, 25]] as const)
    : r.pick([[25, 20, 40], [50, 18, 28], [20, 25, 45]] as const);
  const [partA, partB] = [percentAmount(pct, a), percentAmount(pct, b)];
  const unit = rope ? 'm' : 'helmeä';
  const board: DecimalWorkbench = {
    whole: `A: ${a} ${unit} = 100 %. B: ${b} ${unit} = 100 %.`,
    rows: [{ label: 'A · merkitty osuus', value: `${pct} % eli ${partA} ${unit}`, fill: pct, width: 100 * a / b },
      { label: 'B · merkitty osuus', value: `${pct} % eli ${partB} ${unit}`, fill: pct }],
    note: rope ? 'Kokonaiset köydet on piirretty samassa mittakaavassa.' : 'Kokonaiset varastot on piirretty samassa mittakaavassa.',
  };
  return display(board, { ...board, receipt: `A sai lapun ${partA} ${unit}. B sai lapun ${partB} ${unit}.` }, {
    say: rope ? 'Mikä kuvaus sopii merkittyihin köysiosuuksiin?' : 'Mikä kuvaus sopii näihin kahteen varaukseen?',
    task: choose(r, { text: 'Sama prosentti, suurempi määrä B:ssä' }, [
      { text: 'Sama prosentti, sama määrä' }, { text: 'Eri prosentit, suurempi määrä B:ssä' },
    ], ['Prosentti on sama, mutta B:n kokonainen ja varattu määrä ovat suurempia.', 'Molemmissa lapuissa on sama prosenttiluku.']),
    hint: 'Vertaa ensin prosenttimerkillisiä lukuja ja vasta sitten metrejä tai helmiä.',
    explain: `Molemmissa on ${pct} %. A:n määrä on ${partA} ${unit} ja B:n määrä on ${partB} ${unit}, koska kokonaiset ovat eri kokoisia.`,
  });
}

const roles = definition({
  id: 'M-PCT-04', stop: 'Sama prosentti, eri kori', icon: '◒', intro: 'Aavalla on kaksi erikokoista varastoa. Molemmista lähtee sama prosenttiosuus.',
  goal: 'Opit erottamaan prosenttiluvun, kokonaismäärän ja sen osuuden määrän.',
  reward: 'Molemmat varastot saivat oman oikean varauslappunsa.',
  families: { 'rate-whole-part-labels': percentRoles, 'same-rate-different-wholes': r => sameRate(r) },
  transfer: r => sameRate(r, true), example: r => sameRate(r),
  limit: 'Näyttö kohdistaa ja vertailee annettuja prosentteja, kokonaisia ja määrän yksiköitä. Prosenttiarvojen laskemista ei vaadita.',
});

function valueOfPercent(r: Rng, method: 'benchmark' | 'one-percent' | 'transfer') {
  const [pct, full, comparison] = method === 'benchmark' ? r.pick([[25, 40], [50, 36], [75, 60], [20, 80], [10, 90]] as const)
    : method === 'one-percent' ? r.pick([[5, 200], [15, 300], [7, 400], [12, 500], [3, 600]] as const)
      : r.pick([[25, 120, 40], [50, 84, 36], [20, 150, 80], [75, 160, 60], [10, 350, 100]] as const);
  const actual = percentAmount(pct, full);
  const unit = method === 'transfer' ? 'm' : 'helmeä';
  const board: DecimalWorkbench = {
    whole: `Koko ${method === 'transfer' ? 'köysi' : 'varasto'} eli 100 % on ${full} ${unit}.`,
    rows: [{ label: 'Sovittu osuus', value: `${pct} %` }, ...(comparison ? [
      { label: 'Toinen köysi', value: `${pct} % sen ${comparison} metristä` },
    ] : [])],
  };
  const hint = method === 'one-percent' ? 'Etsi ensin sadasosa koko määrästä. Ota sitten niin monta sadasosaa kuin prosenttiluku kertoo.'
    : 'Voit ajatella prosenttia tuttuna murtolukuna, kuten 25 % neljäsosana. Vertaa aina annettuun kokonaiseen.';
  return display(board, {
    ...board, rows: [{ ...board.rows[0]!, fill: pct }, ...board.rows.slice(1), { label: 'Lähtevä määrä', value: `${actual} ${unit}` }],
    receipt: 'Oikea määrä erotettiin kokonaisesta ja merkittiin lähtevään varaukseen.',
  }, {
    say: `Kuinka monta ${unit === 'm' ? 'metriä' : 'helmeä'} varataan?`,
    task: number(actual, unit, { [pct]: 'Tuo on prosenttiluku. Vastauksessa kysytään todellista määrää annetusta kokonaisesta.' }),
    hint,
    explain: `${full} ${unit} on 100 %. Siitä ${pct}/100 on ${actual} ${unit}. Saman määrän voi löytää eri laskureiteillä.`,
  });
}

const percentageAmount = definition({
  id: 'M-PCT-05', stop: 'Aavan sovittu varaus', icon: '◩', intro: 'Aava varaa pienelle saarelle osuuden aseman näkyvästä kokonaismäärästä.',
  goal: 'Opit laskemaan prosenttiosuuden annettuna määränä.',
  reward: 'Sovittu määrä on erotettu varastosta toimitettavaksi.',
  families: { 'amount-familiar-share': r => valueOfPercent(r, 'benchmark'), 'amount-unit-percent': r => valueOfPercent(r, 'one-percent') },
  transfer: r => valueOfPercent(r, 'transfer'), example: r => valueOfPercent(r, 'benchmark'),
  limit: 'Näyttö koskee tarkkoja, kokonaisyksiköiksi päätyviä prosenttiarvoja. Vihjeen käyttö kirjataan; itsenäisen laskureitin valintaa tai vapaata perustelua ei päätellä vastauksesta.',
});

const entries = [comparison, line, mixed, subtraction, fracDecimal, fractionRate, decimalRate, roles, percentageAmount];
export const decimalWorkshopSpecs: NodeSpec[] = entries.map(({ spec }) => spec);
export const decimalWorkshopEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(entries.map(({ spec, evidence }) => [spec.id, evidence]));
