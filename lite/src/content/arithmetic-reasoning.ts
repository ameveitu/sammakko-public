import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Phase } from '../engine/types';
import { type ArithmeticContext, type ArithmeticMode, type ArithmeticReasoningTask, type Membership, type Operation, type SequenceRule, rotatedMark, ruleLabel } from './models/arithmetic-reasoning';
import { type ObservedExplanationTask } from './models/observed-explanations';
import { arithmeticBoard, arithmeticExample } from './scenes/arithmetic-reasoning';
import { explanationBoard } from './scenes/observed-explanations';

type Task = ArithmeticReasoningTask | (ObservedExplanationTask & { context: ArithmeticContext });
type ArithmeticItem = Omit<Item, 'task'> & { task: Task };
type Author = (r: Rng) => Omit<ArithmeticItem, 'tag'>;
type Definition = Pick<NodeSpec, 'id' | 'stop' | 'icon' | 'intro' | 'goal' | 'reward' | 'produceWhat'> & {
  families: readonly [readonly [string, Author], readonly [string, Author]];
  transfer: Author;
  limit: string;
};

const given = (label: string, value: string) => ({ label, value });
const context = (title: string, ...skills: string[]): ArithmeticContext => ({ title, skills });
const arrays = context('Kertolasku ja yhtä suuret ryhmät', 'M-MUL-01');
const divisibility = context('Jaollisuus ja täysien ryhmien laskeminen', 'M-DIVIS-01');
const magnitude = context('Lukuyksiköt ja paikat', 'M-PLACE-04');
const operationSkill = (op: Operation) => op === '×' ? 'M-MUL-01' : op === '+' ? 'M-WRADD' : 'M-WRSUB';
const nearest = (op: Operation) => context('Pyöristäminen ja tutulla laskutavalla laskeminen', 'M-ROUND-01', operationSkill(op));
const estimation = (op: Operation) => context('Likiarvot ja tuttu laskutyyppi', 'M-EST-01', operationSkill(op));
const sequence = context('Lukujonon jatkaminen', 'M-NUM-07');
const knownSequence = context('Lukujonon toistuvan säännön tunnistaminen', 'M-ALG-01');
const equalSides = context('Arvon kokeileminen yhtälöön', 'M-ALG-07');
const arithmetic = (op: '+' | '−') => op === '+'
  ? context('Moninumeroisten lukujen yhteenlasku', 'M-WRADD')
  : context('Moninumeroisten lukujen vähennyslasku', 'M-WRSUB');

function item(problem: ArithmeticMode, familiar: ArithmeticContext, givens: ArithmeticReasoningTask['givens'],
  say: string, hint: string, explain: string): ReturnType<Author> {
  const task: ArithmeticReasoningTask = { kind: 'arithmetic-reasoning', ...problem, context: familiar, givens };
  return { task, scene: arithmeticBoard(task), say, hint, explain };
}

function split(r: Rng, axis: 'rows' | 'columns', transfer = false) {
  const [rows, columns] = transfer ? r.pick([[4, 9], [5, 8], [3, 10]] as const)
    : axis === 'columns' ? r.pick([[3, 7], [4, 8], [5, 9]] as const) : r.pick([[6, 4], [7, 5], [8, 3]] as const);
  const avoidCut = transfer ? r.pick([1, 2, 3]) : undefined;
  const direction = axis === 'columns' ? 'sarakkeiden välistä' : 'rivien välistä';
  return item({ mode: 'split', rows, columns, axis, avoidCut }, arrays, [
    given('Kansi', `${rows} riviä, ${columns} paikkaa rivissä`),
    ...(avoidCut === undefined ? [] : [given('Vertailuositus', `Ensimmäisessä osassa ${avoidCut} saraketta. Valitse nyt eri kohta.`)]),
  ], `Osita lautta ${direction}. Laske molempien lohkojen paikat ja kokoa kokonaismäärä.`,
  'Pidä molemmat osat mukana. Kummassakin osassa on yhtä monta paikkaa joka rivillä.',
  'Osittaminen muuttaa tapaa laskea paikat. Kummankin lohkon tulo kuuluu samaan summaan, joten kokonaismäärä säilyy.');
}

function groups(r: Rng, draft: boolean, transfer = false) {
  const [a, b, c] = transfer ? r.pick([[2, 4, 3], [3, 2, 5], [4, 2, 3]] as const)
    : r.pick([[2, 3, 4], [3, 4, 2], [4, 3, 2]] as const);
  return item({ mode: 'group', a, b, c, ...(draft ? { draft: 'right' as const } : {}) }, arrays, [
    given(transfer ? 'Merkit varastossa' : 'Eväät veneissä', transfer ? `${a} laatikkoa, ${b} pussia laatikossa, ${c} merkkiä pussissa`
      : `${a} venettä, ${b} koria veneessä, ${c} evästä korissa`),
    ...(draft ? [given('Loikan luonnos', `Oikeissa suluissa ${b} + ${c}. Tarkista, onko yhteenlasku oikea.`)] : []),
  ], 'Avaa molemmat ryhmittelyt. Kirjoita ensin kummankin sulun tulo, sitten sen antama kokonaismäärä.',
  'Vasemmat sulut laskevat pienryhmien määrän. Oikeat sulut laskevat yhden ison ryhmän sisällön.',
  `(${a} × ${b}) × ${c} ja ${a} × (${b} × ${c}) laskevat samat ${a * b * c} esinettä. Sulut muuttavat ryhmittelyä.`);
}

function rotate(r: Rng, clockwise: boolean, abstract = false, inverse = false) {
  const [rows, columns] = abstract ? r.pick([[3, 6], [5, 7], [4, 6]] as const) : clockwise ? r.pick([[2, 4], [3, 4]] as const) : r.pick([[3, 5], [2, 5]] as const);
  const focus = { row: r.int(1, rows), column: r.int(1, columns) };
  const indicated = inverse ? rotatedMark(rows, columns, focus, clockwise) : focus;
  return item({ mode: 'rotate', rows, columns, focus, clockwise, abstract, inverse }, arrays, [
    given('Lähtöasento', `${rows} riviä ja ${columns} saraketta`),
    given(inverse ? 'Istuin käännöksen jälkeen' : 'Seurattava istuin', `Rivi ${indicated.row}, sarake ${indicated.column}`),
    given('Käännös', clockwise ? 'Neljänneskierros myötäpäivään' : 'Neljänneskierros vastapäivään'),
  ], inverse ? 'Käännä lautta. Kirjoita molempien asentojen mitat ja päättele, mistä seurattu istuin lähti.'
    : 'Käännä lautta. Kirjoita molempien asentojen rivi- ja sarakemäärät ja osoita, mihin seurattu istuin siirtyy.',
  'Kokonainen rivi kääntyy sarakkeeksi. Tarkista käännössuunta, kun seuraat merkittyä istuinta.',
  `Paikkojen määrä pysyy samana: ${rows} × ${columns} = ${columns} × ${rows}. Jokainen lähtöpaikka vastaa yhtä paikkaa uudessa suunnassa.`);
}

function divisorRelation(r: Rng, view: 'array' | 'rebuild' | 'symbol') {
  const divisor = r.pick(view === 'symbol' ? [4, 6, 7, 9] : [3, 4, 5]);
  const count = r.pick(view === 'symbol' ? [0, 5, 7] : [2, 3, 4, 5]);
  const multiple = count * divisor;
  return item({ mode: 'relation', divisor, multiple, view }, divisibility, [
    given(view === 'symbol' ? 'Lukupari' : 'Kaislat', view === 'symbol' ? `${multiple} ja ${divisor}` : `${multiple} kaislaa, ${divisor} kaislaa kimpussa`),
    given('Rajaus', 'Jakaja on positiivinen. Monikerta voi olla nolla.'),
  ], 'Merkitse jakaja, monikerta ja täysien ryhmien määrä. Tarkista yhteys kertolaskusta.',
  'Jakaja kertoo yhden ryhmän koon. Monikerta on koko määrä.',
  `${multiple} = ${divisor} × ${count}. Siksi ${divisor} on luvun ${multiple} jakaja ja ${multiple} on luvun ${divisor} monikerta.`);
}

const multipleOf = (of: number): Membership => ({ of, relation: 'multiple' });
const divisorOf = (of: number): Membership => ({ of, relation: 'divisor' });
function membership(r: Rng, mixed: boolean, transfer = false) {
  const cases = transfer ? [
    { rules: [multipleOf(4), multipleOf(6)], numbers: [0, 8, 12, 18, 11] },
    { rules: [multipleOf(3), multipleOf(5)], numbers: [0, 6, 10, 15, 11] },
  ] : mixed ? [
    { rules: [divisorOf(24), multipleOf(4)], numbers: [0, 6, 8, 20, 7] },
    { rules: [divisorOf(30), multipleOf(5)], numbers: [0, 6, 10, 20, 7] },
  ] : [
    { rules: [multipleOf(2), multipleOf(3)], numbers: [0, 8, 9, 12, 11] },
    { rules: [multipleOf(2), multipleOf(5)], numbers: [0, 8, 15, 20, 13] },
  ];
  const choice = r.pick(cases);
  return item({ mode: 'membership', rules: choice.rules, numbers: r.shuffle(choice.numbers) }, divisibility, [
    given('Kaksi ryhmää', choice.rules.map(({ relation, of }) => relation === 'divisor' ? `luvun ${of} jakajat` : `luvun ${of} monikerrat`).join(' ja ')),
  ], 'Merkitse jokaiselle luvulle kaikki sopivat ryhmät. Jos kumpikaan ei sovi, merkitse sekin.',
  'Testaa jokainen ryhmä erikseen. Esimerkiksi 0 = 4 × 0, mutta nollaa ei käytetä jakajana.',
  'Nolla on jokaisen positiivisen luvun monikerta. Tämän pajan jakajat ovat positiivisia. Sama luku voi toteuttaa molemmat ehdot.');
}

function round(r: Rng, tie: boolean, transfer = false) {
  const unit = transfer ? 1000 : tie ? 100 : 10;
  const first = r.pick([2, 3, 6, 8]) * unit;
  const value = first + (tie ? unit / 2 : r.pick([2, 3, 7, 8]) * unit / 10);
  return item({ mode: 'round', value, unit, view: transfer ? 'symbol' : tie ? 'place' : 'line' }, magnitude, [
    given('Tarkka määrä', String(value)), given('Pyöristysyksikkö', String(unit)),
    given('Tasatilanne', 'Yhtä kaukana olevista rajoista valitaan suurempi.'),
  ], 'Kirjoita kaksi peräkkäistä rajalukua ja valitse lähempi. Jos määrä on jo rajalla, käytä sitä pienempänä rajana.',
  'Katso vain pyydetyn lukuyksikön kerrannaisia. Vertaa etäisyyksiä molempiin.',
  'Pyöristetty arvo on lähempi rajaluku. Tasatilanteessa suurempi valitaan tässä sovitun säännön mukaan.');
}

function estimate(r: Rng, operation: Operation) {
  const [a, b] = operation === '+' ? r.pick([[238, 174], [367, 189], [425, 267]] as const)
    : operation === '×' ? r.pick([[27, 16], [43, 18], [46, 23]] as const)
      : r.pick([[548, 167], [619, 283], [735, 247]] as const);
  return item({ mode: 'estimate', a, b, operation, units: operation === '×' ? [10] : [10, 100] }, nearest(operation), [
    given('Tarkka lasku', `${a} ${operation} ${b}`),
    given('Likiarvopöytä', operation === '×' ? 'Pyöristä lähimpään kymmeneen.' : 'Valitse kymmenet tai sadat. Kumpikin sopii tähän arvioon.'),
    given('Tasatilanne', 'Pyöristä puolivälistä suurempaan.'),
  ], 'Kirjoita molemmat likiarvot ja laske niillä. Merkitse, miten arvio suhteutuu alkuperäiseen laskuun.',
  'Likiarvolaskun tulos voi poiketa tarkasta tuloksesta. Käytä ≈-merkkiä.',
  'Valittu tarkkuus määrää lähtölukujen likiarvot. Noin-merkki erottaa arvion alkuperäisen laskun tarkasta arvosta.');
}

function audit(r: Rng, operation: Operation) {
  const a: readonly [number, number] = operation === '×' ? [20, 30] : r.pick([[200, 300], [300, 400]] as const);
  const b: readonly [number, number] = operation === '×' ? [10, 20] : [60, 90];
  const proposed = operation === '×' ? r.pick([48, 480, 4800]) : operation === '+' ? r.pick([45, a[0] + 100, 4500]) : r.pick([25, a[0] - 20, 2000]);
  return item({ mode: 'audit', a, b, operation, proposed }, estimation(operation), [
    given('Laskutyyppi', operation === '+' ? 'Yhdistä määrät' : operation === '−' ? 'Vähennä toinen ensimmäisestä' : 'Kerro määrät'),
    given('Ensimmäinen määrä', `${a[0]}–${a[1]}`), given('Toinen määrä', `${b[0]}–${b[1]}`),
    given('Tarkistuslapun tulos', String(proposed)),
  ], 'Muodosta väljistä lähtöluvuista tuloksen ala- ja yläraja. Vertaa tarkistuslapun lukua niihin.',
  operation === '−' ? 'Pienin erotus tulee, kun pienimmästä ensimmäisestä vähennetään suurin toinen.' : 'Käytä alarajoihin pieniä määriä ja ylärajoihin suuria.',
  'Sallitun alueen ulkopuolelle osuva tulos ei sovi lähtölukuihin. Alueella oleva arvio kertoo suuruusluokan.');
}

function strategy(r: Rng, operation: '+' | '−', transfer = false) {
  const [a, b] = transfer ? r.pick([[803, 267], [602, 198], [907, 356]] as const)
    : operation === '+' ? r.pick([[176, 29], [287, 98], [462, 27]] as const)
      : r.pick([[384, 67], [426, 59], [524, 86]] as const);
  return item({ mode: 'strategy', a, b, operation }, arithmetic(operation), [
    given('Toimituksen lasku', `${a} ${operation} ${b}`),
    given('Työkalut', 'Osita, käytä tasakymppiä tai laske sarakkeittain.'),
  ], 'Valitse toimiva tapa, tee sen välivaiheet ja kirjoita tarkka tulos.',
  'Voit jakaa toisen luvun osiin tai käyttää läheistä tasakymppiä ja korjausta. Sarakkeissa merkitään myös vaihdot.',
  'Lukujen rakenne voi tehdä eri tavoista sujuvia. Sama tarkka arvo voidaan saada usealla oikealla työjäljellä.');
}

const add = (operand: number): SequenceRule => ({ operation: '+', operand });
const times = (operand: number): SequenceRule => ({ operation: '×', operand });
const prefix = (start: number, rule: SequenceRule, count: number) => Array.from({ length: count }, (_, i) =>
  rule.operation === '×' ? start * rule.operand ** i : start + i * rule.operand * (rule.operation === '+' ? 1 : -1));

function series(r: Rng, recognize: boolean, multiply: boolean, transfer = false) {
  const start = transfer ? r.pick([7, 9, 11]) : multiply ? r.pick([2, 3, 4]) : r.pick([2, 5, 6]);
  const increment = recognize && !multiply ? start : r.pick([2, 3, 4]);
  const rule = multiply ? times(2) : add(increment);
  const shown = prefix(start, rule, recognize ? 4 : 3);
  const distractors = multiply ? [add(start), times(3)] : [times(2), add(increment + 1)];
  return item({ mode: 'sequence', shown, rules: recognize ? r.shuffle([rule, ...distractors]) : [rule], recognize, count: recognize ? 2 : 3 },
    multiply ? context('Lukujono ja toistuva kertolasku', ...(recognize ? sequence : knownSequence).skills, 'M-MUL-01')
      : recognize ? sequence : knownSequence, [given('Näkyvä alku', shown.join(' · ')),
      ...(recognize ? [] : [given('Annettu sääntö', ruleLabel(rule))])],
  recognize ? 'Valitse näistä säännöistä näkyvään alkuun sopiva. Testaa sitä kaikissa näkyvissä väleissä ja kirjoita kaksi uutta lukua.'
    : 'Kirjoita kolme uutta lukua annetulla säännöllä. Käytä joka kerta viimeksi saatua lukua.',
  recognize ? 'Yksi onnistunut siirtymä ei riitä. Tarkista seuraavat välit samalla säännöllä.'
    : 'Laske aina uudesta edellisestä luvusta, älä aloita uudelleen jonon ensimmäisestä.',
  recognize ? 'Valittu sääntö sopii kaikkiin näytettyihin siirtymiin ja antaa tämän jatkon. Äärelliselle alulle voi keksiä muitakin jatkoja.'
    : 'Sama ohje vaikuttaa jokaiseen vierekkäiseen pariin. Jokainen uusi luku tarvitaan seuraavan lähtökohdaksi.');
}

function describeSeries(r: Rng, multiply: boolean, transfer = false): ReturnType<Author> {
  const rule = multiply ? times(2) : add(r.pick([3, 4, 5]));
  const start = transfer ? r.pick([7, 8, 9]) : r.pick([2, 3, 4]);
  const [a, b, c, d] = prefix(start, rule, 4);
  const task: ObservedExplanationTask & { context: ArithmeticContext } = {
    kind: 'observed-explanation', channel: 'spoken', context: knownSequence,
    givens: [given('Tuttu rakenne', knownSequence.title), given(transfer ? 'Uuden kuulijan jono' : 'Näkyvä lukujono', [a, b, c, d].join(' · '))],
    prompt: 'Kerro aikuiselle omin sanoin yksi sääntö, joka sopii koko näkyvään alkuun. Näytä puheessa, miten sääntö toimii kahdessa eri välissä.',
    rubric: [
      { id: 'repeatable-rule', label: 'Sanoo toistettavan säännön', guide: 'Kuulija voi tehdä saman toiminnon jokaisesta luvusta. Pelkkä seuraava luku ei riitä.' },
      { id: 'checks-two-transitions', label: 'Testaa säännön kahdessa välissä', guide: `Ohjeen pitää tuottaa näkyvät siirtymät. Tarkista esimerkiksi ${a} → ${b} ja ${b} → ${c}.` },
    ],
    model: `${ruleLabel(rule)}. Silloin luvusta ${a} tulee ${b}, ja sama askel vie luvusta ${b} lukuun ${c}.`,
  };
  return {
    task, say: task.prompt, scene: explanationBoard(task), explain: task.model,
    hint: 'Kerro ensin, mitä teet edelliselle luvulle. Käytä samaa ohjetta kahdessa eri välissä.',
  };
}

function hunt(r: Rng, mode: 'add' | 'scale' | 'mixed') {
  const a = mode === 'add' ? 1 : r.pick([2, 3, 4]), b = mode === 'scale' ? 0 : r.pick([3, 4, 7]);
  const root = r.pick([4, 6, 7, 8]), start = mode === 'add' ? root - 2 : root + 2;
  const target = a * root + b;
  const expression = `${a === 1 ? 'x' : `${a} × x`}${b ? ` + ${b}` : ''} = ${target}`;
  return item({ mode: 'hunt', a, b, target, min: 0, max: 12, start }, equalSides, [
    given('Yhtälö', expression), given('Sallitut arvot', 'Kokonaisluvut 0–12. Vasen puoli kasvaa, kun x kasvaa.'),
  ], 'Tee aloituskoe. Kirjaa havainto ja rajaa seuraava kokeilu sen perusteella. Tarkista lopuksi ratkaisu sijoittamalla.',
  'Jos vasen puoli jäi tavoitteen alle, seuraavan luvun pitää olla suurempi. Jos tulos meni yli, kokeile pienempää.',
  `Ratkaisun tarkistus: kun x = ${root}, vasen puoli on ${target}, yhtä suuri kuin oikea puoli.`);
}

const defs: readonly Definition[] = [
  {
    id: 'M-DISTRIB', stop: 'Leveän lautan kaksi osaa', icon: '▦', intro: 'Loikka jakaa leveän kannen kahteen helpommin laskettavaan osaan.',
    goal: 'Osaat osittaa ruudukon ja laskea osien kautta koko määrän.', reward: 'Lohkot liittyvät yhdeksi ehjäksi lautan kanneksi.',
    produceWhat: 'osituskohdan valintaa, osien tuloja ja niiden summaa',
    families: [['split-columns', r => split(r, 'columns')], ['split-rows', r => split(r, 'rows')]], transfer: r => split(r, 'columns', true),
    limit: 'Oppijan jakokohta ja molemmat osatulot arvioidaan. Mikä tahansa sallittu epätyhjä ositus käy.',
  },
  {
    id: 'M-MUL-ASSOC', stop: 'Korit veneissä', icon: '▤', intro: 'Aava näkee samat eväät kahtena eri ryhmittelynä.',
    goal: 'Osaat yhdistää kolmen tekijän kaksi ryhmittelyä samaan määrään.', reward: 'Eväät pakataan molempia ryhmittelyjä seuraten samoihin veneisiin.',
    families: [['compare-two-groupings', r => groups(r, false)], ['repair-inside-parentheses', r => groups(r, true)]],
    transfer: r => groups(r, false, true), limit: 'Molemmat ryhmittelyt avataan. Oppija tuottaa sulkujen tulot ja kokonaismäärät.',
  },
  {
    id: 'M-MUL-COMM', stop: 'Rivit kääntyvät', icon: '↻', intro: 'Loikka kääntää lautan piirustuksen. Aava seuraa yhtä istuinta.',
    goal: 'Osaat kääntää ruudukon, vaihtaa tekijöiden roolit ja seurata samaa paikkaa.', reward: 'Käännetty lautta sopii uuteen laituriin samoilla istuimilla.',
    families: [['rotate-clockwise-track-seat', r => rotate(r, true)], ['rotate-find-original-seat', r => rotate(r, false, false, true)]],
    transfer: r => rotate(r, r.chance(.5), true), limit: 'Rivi ja sarake tuotetaan molemmille asennoille. Osoitetaan yhden istuimen vastaavuus, ja ruudukko säilyttää kaikkien paikkojen tunnisteet.',
  },
  {
    id: 'M-DIVIS-02', stop: 'Sama suhde kahdesta suunnasta', icon: '⇆', intro: 'Aava kuvaa kaislakimppuja jakajan ja monikerran sanoilla.',
    goal: 'Osaat merkitä jakajan ja monikerran samaan kertolaskurakenteeseen.', reward: 'Kimpun ja koko lastin kyltit muodostavat parin.',
    families: [['read-complete-bundles', r => divisorRelation(r, 'array')], ['rebuild-bundles-from-numbers', r => divisorRelation(r, 'rebuild')]],
    transfer: r => divisorRelation(r, 'symbol'), limit: 'Positiivinen jakaja, luonnollinen monikerta nolla mukaan lukien, ja täysien ryhmien määrä arvioidaan yhdessä.',
  },
  {
    id: 'M-DIVIS-03', stop: 'Veistämön sopivat lastit', icon: '◫', intro: 'Loikka huomaa, että osa lastiluvuista kuuluu kahteen ryhmään yhtä aikaa.',
    goal: 'Osaat luokitella luvut jaollisuuden perusteella ja tunnistaa päällekkäiset luokat.', reward: 'Varasto löytää useita toimivia tapoja lastata sama määrä.',
    families: [['overlapping-multiples', r => membership(r, false)], ['divisor-and-multiple-roles', r => membership(r, true)]],
    transfer: r => membership(r, false, true), limit: 'Ryhmät arvioidaan erikseen. Oppija merkitsee myös tyhjän jäsenyyden. Jakaja on positiivinen ja nolla voi olla monikerta.',
  },
  {
    id: 'M-ROUND-01', stop: 'Lähimmän varastomerkin luona', icon: '⌖', intro: 'Aava tekee yleiskartan ja tarvitsee tarkkojen määrien rinnalle pyöristetyt luvut.',
    goal: 'Osaat löytää kaksi pyöristysrajaa ja käyttää sovittua tasatilannesääntöä.', reward: 'Varasto saa yleiskarttaan oikean pyöristetyn merkin.',
    families: [['nearest-of-two-boundaries', r => round(r, false)], ['decide-midpoint-up', r => round(r, true)]],
    transfer: r => round(r, r.chance(.5), true), limit: 'Luonnolliset luvut pyöristetään annettuun kymmen-, sata- tai tuhattarkkuuteen. Tasatilanteessa valitaan suurempi.',
  },
  {
    id: 'M-EST-01', stop: 'Suurtilauksen ensimmäinen arvio', icon: '≈', intro: 'Loikka varaa toimitukselle tilaa ja tarkistaa ensin sen suuruusluokan.',
    goal: 'Osaat laskea likiarvoilla ja merkitä tuloksen arvioksi.', reward: 'Paja varaa toimitukselle sopivan kokoisen työalueen.',
    families: [['estimate-add-with-rounding', r => estimate(r, '+')], ['estimate-product-with-rounding', r => estimate(r, '×')]],
    transfer: r => estimate(r, '−'), limit: 'Arvio käyttää tehtävän ilmoittamia tarkkuuksia. Molemmat likiarvot, lasku ja noin-merkki arvioidaan.',
  },
  {
    id: 'M-EST-02', stop: 'Onko laivalasti mahdollinen?', icon: '↕', intro: 'Aava vertaa epäilyttävää tarkistuslappua alkuperäisiin määriin.',
    goal: 'Osaat muodostaa tulosalueen ja tarkistaa ehdotetun suuruusluokan.', reward: 'Väärän kokoinen lasti korjataan suunnitelmassa.',
    families: [['audit-sum-with-bounds', r => audit(r, '+')], ['audit-difference-with-bounds', r => audit(r, '−')]],
    transfer: r => audit(r, '×'), limit: 'Lähtöarvojen väljät rajat annetaan. Oppija tuottaa tuloksen rajat ja luokittelee ehdotuksen suhteessa niihin.',
  },
  {
    id: 'M-CALC-STRAT', stop: 'Aavan vapaa työkalupöytä', icon: '✦', intro: 'Aava tarjoaa eri tapoja laskea lasti ja pyytää jättämään tarkistettavan työjäljen.',
    goal: 'Osaat toteuttaa tilanteeseen toimivan päässälaskun tai kirjallisen laskutavan.', reward: 'Toimitus valmistuu valitulla tavalla ja työjälki jää näkyviin.',
    families: [['choose-method-for-sum', r => strategy(r, '+')], ['choose-method-for-difference', r => strategy(r, '−')]],
    transfer: r => strategy(r, '−', true), limit: 'Ositus, tasakymppikorjaus ja sarakkeittainen lasku ovat sallittuja. Arvio perustuu työvaiheisiin ja arvoon, ei nopeuteen tai omaan sanalliseen perusteluun.',
  },
  {
    id: 'M-ALG-01', stop: 'Pajan kasvavat merkit', icon: '⋯', intro: 'Aava etsii sääntöä, joka sopii useaan näkyvään siirtymään.',
    goal: 'Osaat kokeilla valittua sääntöä koko näkyvään lukujonon alkuun.', reward: 'Pajan seuraavat suunnitelmamerkit voidaan ennakoida.',
    families: [['recognize-constant-addition', r => series(r, true, false)], ['recognize-fixed-multiplication', r => series(r, true, true)]],
    transfer: r => series(r, true, r.chance(.5), true), limit: 'Näyttö koskee tarjotuista säännöistä valitun sopivuutta annettuun alkuun ja kahteen uuteen siirtymään.',
  },
  {
    id: 'M-ALG-02', stop: 'Sääntö toiselle kerrottuna', icon: '◌', intro: 'Loikka kertoo omin sanoin, miten Aava voi jatkaa koristejonoa.',
    goal: 'Osaat sanoa toistettavan säännön ja testata sitä kahdessa näkyvässä siirtymässä.', reward: 'Aava jatkaa merkkejä ymmärtämänsä ohjeen mukaan.',
    families: [['speak-additive-rule', r => describeSeries(r, false)], ['speak-multiplicative-rule', r => describeSeries(r, true)]],
    transfer: r => describeSeries(r, r.chance(.5), true), limit: 'Aikuinen kuuntelee oman säännön ja tarkistaa kaksi siirtymää. Puhetta ei tallenneta eikä luokitella automaattisesti.',
  },
  {
    id: 'M-ALG-03', stop: 'Ohje tekee seuraavan merkin', icon: '↦', intro: 'Pajakortin ohje kulkee mukana, kun Loikka jatkaa merkkikaistaa.',
    goal: 'Osaat käyttää annettua sääntöä jokaisessa uudessa siirtymässä.', reward: 'Merkkikaista saavuttaa työpisteensä.',
    families: [['continue-additive-rule', r => series(r, false, false)], ['continue-multiplicative-rule', r => series(r, false, true)]],
    transfer: r => series(r, false, r.chance(.5), true), limit: 'Kolme seuraavaa lukua tuotetaan annetusta säännöstä. Jokainen siirtymä tarkistetaan.',
  },
  {
    id: 'M-ALG-09', stop: 'Loikan järjestelmälliset kokeet', icon: '▣', intro: 'Aava jättää koetulokset näkyviin, jotta Loikka voi rajata hakua.',
    goal: 'Osaat käyttää koetulosta seuraavan arvon valinnassa ja tarkistaa ratkaisun sijoittamalla.', reward: 'Oikea osa löytyy ja laatikko avautuu.',
    produceWhat: 'kokeiden kirjaamista, haun rajaamista ja lopullista sijoitusta',
    families: [['hunt-additive-unknown', r => hunt(r, 'add')], ['hunt-scale-unknown', r => hunt(r, 'scale')]], transfer: r => hunt(r, 'mixed'),
    limit: 'Rajatut kokonaislukuyhtälöt kasvavalla vasemmalla puolella. Näyttö vaatii aloituskokeen, sitä seuraavan rajatun haun ja lopputarkistuksen.',
  },
];

type ArithmeticSpec = Omit<NodeSpec, 'item'> & { item: (r: Rng, phase: Phase) => ArithmeticItem };
function lesson(def: Definition): ArithmeticSpec {
  const rev = `exp690-arithmetic-${def.id.toLowerCase()}-v1`;
  const { families, transfer, limit: _limit, ...meta } = def;
  return {
    ...meta, rev, validRevs: [rev],
    ...(def.produceWhat ? { produce: [...families.map(([tag]) => tag), 'transfer'] } : {}),
    demo(r) {
      const example = families[0][1](r);
      return [{ say: example.hint!, scene: example.scene! }, { say: example.explain,
        scene: example.task.kind === 'arithmetic-reasoning' ? arithmeticExample(example.task) : explanationBoard(example.task) }];
    },
    item(r, phase) {
      const [tag, author] = phase === 'transfer' ? ['transfer', transfer] as const : r.pick(families);
      return { ...author(r), tag };
    },
  };
}

export const arithmeticReasoningSpecs: ArithmeticSpec[] = defs.map(lesson);
export const arithmeticReasoningEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(defs.map(def => [def.id, { families: def.families.map(([tag]) => tag), limit: def.limit }]));
