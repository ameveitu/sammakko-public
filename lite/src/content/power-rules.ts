import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Phase } from '../engine/types';
import { expressionLabel, power, powerLabel, powerValue, type PowerContext, type PowerExpression, type PowerMode, type PowerRuleTask } from './models/power-rules';
import { powerNotationContrast, powerRuleBoard, powerRuleExample } from './scenes/power-rules';

type RuleItem = Omit<Item, 'task'> & { task: PowerRuleTask };
type Author = (r: Rng) => Omit<RuleItem, 'tag'>;
type Definition = Pick<NodeSpec, 'id' | 'stop' | 'icon' | 'intro' | 'goal' | 'reward' | 'produceWhat'> & {
  families: readonly [readonly [string, Author], readonly [string, Author]];
  transfer: Author;
  limit: string;
  demo?: NodeSpec['demo'];
};

const given = (label: string, value: string) => ({ label, value });
const context = (title: string, skills: readonly string[], rules: readonly string[] = []): PowerContext => ({ title, skills, rules });
const division = context('Kertolasku ja jakojäännös', ['M-DIVIS-01']);
const prime = context('Positiiviset jakajat', ['M79-DIVIS-01']);
const factor = context('Alkuluvut ja tekijät', ['M79-PRIME-01', 'M79-DIVIS-01']);
const repeat = context('Toistuva kertolasku', ['M-MUL-01']);
const knownPower = ['M79-POWER-01'];
const powerRule = (title: string, ...rules: string[]) => context(title, knownPower, rules);
const sign = (n: number) => String(n).replace('-', '−');

function item(problem: PowerMode, familiar: PowerContext, givens: PowerRuleTask['givens'], say: string, hint: string, explain: string): ReturnType<Author> {
  const task: PowerRuleTask = { kind: 'power-rules', ...problem, context: familiar, givens };
  return { task, scene: powerRuleBoard(task), say, hint, explain };
}

function divide(dividend: number, divisor: number, draft?: number, transfer = false) {
  return item({ mode: 'division', dividend, divisor, draft }, division, [
    given(transfer ? 'Lukumerkintä' : 'Kivet', transfer ? `${sign(dividend)} : (${sign(divisor)})` : `${dividend} kiveä, ${divisor} paikkaa rivissä.`),
    ...(draft === undefined ? [] : [given('Loikan arvio', `${draft} täyttä riviä. Tarkista, mihin mahdolliset loput jäävät.`)]),
    ...(transfer ? [given('Jäännöksen rajat', `Vähintään 0 ja pienempi kuin ${Math.abs(divisor)}.`)] : []),
  ], transfer ? 'Täydennä kokonaisosamäärä ja jäännös lukumerkinnästä. Ilmoita jaollisuus.'
    : 'Rakenna täydet rivit ja merkitse ylijääneet kivet. Ilmoita, onko jako tasainen.',
  'Etsi kertolasku, johon jäännös voidaan lisätä. Tasajaossa jäännös on nolla.',
  'Jaettava on jakaja kertaa kokonaisosamäärä plus jäännös. Negatiivinen merkki voi muuttaa osamäärän, mutta tässä jäännös on aina vähintään nolla.');
}
const divideRows: Author = r => { const d = r.pick([3, 4, 5]); return divide(d * r.pick([3, 4, 5, 6]), d); };
const divideDraft: Author = r => { const d = r.pick([4, 5, 6]), q = r.pick([3, 4]); return divide(d * q + r.int(1, d - 1), d, q + 1); };
const divideTransfer: Author = r => {
  const [n, d] = r.pick([[-17, 4], [-21, -7], [17, -5], [-28, 7]] as const);
  return divide(n, d, undefined, true);
};

function classify(numbers: readonly number[], transfer: boolean) {
  return item({ mode: 'prime', numbers }, prime, [given('Tutkittavat luvut', numbers.join(' · '))],
    'Luokittele luvut. Merkitse yhdistetyn luvun aito jakaja ja luvun 1 positiivisten jakajien määrä.',
    'Alkuluvulla on tasan kaksi positiivista jakajaa. Kokeile, saako luvusta kaksi suurempaa tekijää.',
    transfer ? 'Luku 2 on alkuluku, koska sen ainoat positiiviset jakajat ovat 1 ja 2. Pariton luku voi olla yhdistetty.'
      : 'Yhdistetyllä luvulla on ainakin yksi aito jakaja. Ykkösellä on vain yksi positiivinen jakaja, joten se ei kuulu kumpaankaan ryhmään.');
}
const primeOdd: Author = r => classify(r.shuffle([r.pick([11, 13, 17, 19]), r.pick([9, 15, 21, 25]), r.pick([14, 16, 18])]), false);
const primeBoundary: Author = r => classify(r.shuffle([1, r.pick([3, 5, 7]), r.pick([4, 6, 8])]), false);
const primeTransfer: Author = r => classify(r.shuffle([2, r.pick([29, 31, 37]), r.pick([27, 33, 35, 49])]), true);

function factorTree(number: number, givenPair?: readonly [number, number], avoidPair?: readonly [number, number]) {
  return item({ mode: 'factor-tree', number, givenPair, avoidPair }, factor, [
    given('Juuri', String(number)),
    ...(givenPair ? [given('Valmis alku', `${givenPair[0]} × ${givenPair[1]}`)] : []),
    ...(avoidPair ? [given('Vertailupuun alku', `${avoidPair[0]} × ${avoidPair[1]}. Käytä nyt toista paria.`)] : []),
  ], givenPair ? 'Jatka valmiista haaroista. Jätä alkuluvut lehdiksi ja kirjoita lehtien tulo.'
    : 'Valitse haara ja hajota se kahdeksi tekijäksi. Jatka alkulukulehtiin asti ja kirjoita lehtien tulo.',
  'Valitse kaksi yhtä suurempaa lukua, joiden tulo on haaran luku. Jos sopivia tekijöitä ei ole, haara on alkuluku.',
  'Eri tekijäparit voivat avata eri puun. Jokaisen haaran tulo säilyttää emoluvun, ja lopussa toistuvatkin alkutekijät kerrotaan mukaan.');
}
const treeOpen: Author = r => factorTree(r.pick([24, 36, 48, 60]));
const treeContinue: Author = r => { const [a, b] = r.pick([[4, 9], [6, 8], [8, 9], [4, 15]] as const); return factorTree(a * b, [a, b]); };
const treeTransfer: Author = r => { const [a, b] = r.pick([[2, 18], [4, 12], [3, 20], [6, 12]] as const); return factorTree(a * b, undefined, [a, b]); };

function expansion(base: string, exponent: number, view: Extract<PowerMode, { mode: 'expansion' }>['view'], identify: boolean, compareExponent?: number,
  signed?: { outsideMinus: boolean; compareBase: string; compareOutsideMinus: boolean }) {
  const label = (signed?.outsideMinus ? '−' : '') + powerLabel(base, exponent);
  const values = view === 'factors' ? [given('Toisto', Array(exponent).fill(base).join(' × '))]
    : view === 'grid' ? [given('Tasasuuri ruudukko', exponent === 2 ? `${base} riviä, ${base} paikkaa rivissä. Laske ${label}.`
      : `${base} kerrosta, ${base} riviä kerroksessa ja ${base} paikkaa rivissä. Laske ${label}.`)]
      : [given('Merkintä', label)];
  if (compareExponent !== undefined) values.push(given('Vertailu', (signed?.compareOutsideMinus ? '−' : '') + powerLabel(signed?.compareBase ?? base, compareExponent)));
  return item({ mode: 'expansion', base, exponent, view, identify, compareExponent, ...signed }, identify ? repeat : powerRule('Potenssi ja sen tekijät', 'toisto'), values,
    identify ? 'Merkitse kanta ja eksponentti. Kokoa tekijäjono ja laske sen arvo.'
      : 'Kokoa tekijäjono. Laske merkinnän arvo ja vertaa sitä toiseen merkintään.',
    signed ? 'Katso kuuluuko miinus sulkeisiin. Sulkujen ulkopuolinen miinus ei kuulu tekijöihin.'
      : 'Kanta toistuu tekijänä. Eksponentti kertoo toistojen määrän.',
    signed ? 'Esimerkiksi −2² = −(2 × 2) = −4. Sulkeissa miinus kuuluu kumpaankin tekijään: (−2)² = (−2) × (−2) = 4.'
      : `${label} vastaa ${exponent} tekijää. Sen arvo on ${powerValue(base, exponent)}.`);
}
const interpretSymbol: Author = r => { const [b, e] = r.pick([[2, 3], [3, 2], [4, 2], [2, 2]] as const); return expansion(String(b), e, 'grid', true); };
const interpretFactors: Author = r => { const [b, e] = r.pick([[2, 5], [3, 3], [4, 3]] as const); return expansion(String(b), e, 'factors', true); };
const interpretTransfer: Author = r => { const [b, e] = r.pick([[5, 2], [3, 4], [2, 6]] as const); return expansion(String(b), e, 'symbol', true); };
const expandLayers: Author = r => { const b = r.pick(['2', '3', '4']), e = r.pick([2, 3, 4]); return expansion(b, e, 'symbol', false, e - 1); };
const expandSigned: Author = r => {
  const b = r.pick(['2', '3', '4']), outsideMinus = r.chance(.5);
  return expansion(outsideMinus ? b : '-' + b, 2, 'signed', false, 2, { outsideMinus, compareBase: outsideMinus ? '-' + b : b, compareOutsideMinus: !outsideMinus });
};
const expandGrid: Author = r => { const b = r.pick(['2', '3', '4']), e = r.pick([2, 3]); return expansion(b, e, 'grid', false, e + 1); };

function zero(base: string, view: 'steps' | 'quotient') {
  return item({ mode: 'exponent-table', base, exponent: 0, view }, powerRule('Peräkkäiset kerrokset ja jakaminen', 'nollaeksponentti'), [
    ...(view === 'quotient' ? [given('Vertailusuhde', `${powerLabel(base, 2)} ÷ ${powerLabel(base, 2)}`)]
      : [given('Toinen kerros', `${powerLabel(base, 2)} = ${powerValue(base, 2)}`), given('Ensimmäinen kerros', `${powerLabel(base, 1)} = ${base}`)]),
    given('Täydennä', `${powerLabel(base, 0)} = ?`),
  ], view === 'quotient' ? 'Laske saman potenssin suhde. Kirjoita jakajan arvo, nollakerroksen arvo ja sääntöön kuuluva ehto.'
    : 'Siirry taulukossa yhtä kerrosta alemmas. Kirjoita jakaja, nollakerroksen arvo ja kannan ehto.',
  'Mitä saat, kun jaat nollasta poikkeavan luvun itsellään?',
  'Nollasta poikkeavan kantaluvun nollas potenssi on 1. Merkintä 0⁰ jää tämän säännön ulkopuolelle.');
}
const zeroTable: Author = r => zero(r.pick(['2', '3', '4']), 'steps');
const zeroRatio: Author = r => zero(r.pick(['-2', '5', '1/2']), 'quotient');
const zeroTransfer: Author = r => zero(r.pick(['6', '7', '8']), 'steps');

function negative(base: string, exponent: number, view: 'steps' | 'symbol', comparisonBase?: string) {
  return item({ mode: 'exponent-table', base, exponent, view, comparisonBase },
    context('Potenssi ja käänteisluku', ['M79-POWER-01', 'M79-RECIP-01'], ['negatiivinen-eksponentti']), [
      ...(view === 'steps' ? [given('Ensimmäinen kerros', `${powerLabel(base, 1)} = ${base}`), given('Nollakerros', `${powerLabel(base, 0)} = 1`)] : []),
      given('Täydennä', `${powerLabel(base, exponent)} = ?`),
      ...(comparisonBase ? [given('Sama eksponentti, toinen kanta', powerLabel(comparisonBase, exponent))] : []),
    ], comparisonBase ? 'Rakenna käänteispotenssi ja laske molemmat arvot. Vertaa omaa arvoasi yhteen ja merkitse kannan ehto.'
      : 'Rakenna käänteispotenssi. Kirjoita tarkka arvo ja kannan ehto. Vertaa omaa arvoasi yhteen.',
  'Negatiivinen eksponentti vaihtaa positiivisen eksponentin potenssin käänteisluvuksi. Tarkista myös, mikä luku jää nimittäjään.',
  `${powerLabel(base, exponent)} = 1 ÷ ${powerLabel(base, -exponent)} = ${powerValue(base, exponent)}. Valomallin kanta on yli 1. Yleinen sääntö pätee kaikille nollasta poikkeaville kannoille.`);
}
const negativeWhole: Author = r => negative(r.pick(['2', '3', '4']), -r.pick([1, 2, 3]), 'steps');
const negativeFraction: Author = r => negative(r.pick(['1/3', '2/3', '-2']), -r.pick([1, 2]), 'symbol');
const negativeTransfer: Author = r => negative('1/2', -r.pick([2, 3]), 'symbol', '2');

const product = (left: PowerExpression, right: PowerExpression): PowerExpression => ({ kind: 'product', left, right });
const quotient = (left: PowerExpression, right: PowerExpression): PowerExpression => ({ kind: 'quotient', left, right });
const nested = (base: string, inner: number, exponent: number): PowerExpression => ({ kind: 'nested', inner: power(base, inner), exponent });
const rewrite = (source: PowerExpression, focuses: Extract<PowerMode, { mode: 'rewrite' }>['focuses'], contextRules: readonly string[],
  counterexample?: ReturnType<typeof power>, explain = 'Merkitse eri toiminnoille niiden oma sääntö. Saman kannan tulo yhdistää, osamäärä supistaa ja sisäkkäinen potenssi toistaa kokonaisia ryhmiä.',
  visual?: 'join' | 'cancel' | 'repeat') =>
  item({ mode: 'rewrite', source, focuses, counterexample, visual }, powerRule('Potenssien tekijärakenteet', ...contextRules), [
    given('Lauseke', expressionLabel(source)),
    ...(counterexample ? [given('Loikan ehdotus', expressionLabel(counterexample))] : []),
  ], counterexample ? 'Tarkista, voiko eksponenttien summasääntöä käyttää. Laske alkuperäinen tulo ja Loikan ehdotus.'
    : visual === 'join' ? 'Liitä tekijäjonot. Merkitse sääntö, uusi eksponentti, lopullinen potenssi ja kannan ehto.'
      : visual === 'cancel' ? 'Supista kaikki yhteiset tekijäparit. Merkitse sääntö, uusi eksponentti, lopullinen potenssi ja kannan ehto.'
        : visual === 'repeat' ? 'Rakenna toistuvat ryhmät. Merkitse sääntö, uusi eksponentti, lopullinen potenssi ja kannan ehto.'
          : 'Merkitse joka vaiheessa sääntö ja uusi eksponentti. Kirjoita lopullinen potenssi ja kannan ehto.',
  'Vertaa saman kannan tekijöitä. Sääntö määräytyy siitä, ovatko ne tulossa, osamäärässä vai kokonaisena toistuvana ryhmänä.', explain);

const productRule: Author = r => { const b = r.pick(['2', '3', '0']), a = r.pick([2, 3]), c = r.pick([1, 4]); return rewrite(product(power(b, a), power(b, c)), [[]], ['tulo'], undefined, undefined, 'join'); };
const productCounter: Author = r => {
  const [a, b, m, n] = r.pick([[2, 3, 2, 3], [3, 2, 3, 2], [2, 5, 3, 2]] as const);
  return rewrite(product(power(String(a), m), power(String(b), n)), [[]], ['tulo'], power(String(a), m + n),
    'Eksponenttien summa kuvaa yhden saman tekijän toistoja. Eri kantojen tulo ja yhdeksi kannaksi pakotettu ehdotus voivat antaa eri luvut.');
};
const productTransfer: Author = r => { const b = r.pick(['a', 'x']); return rewrite(product(power(b, r.int(2, 4)), power(b, r.int(1, 4))), [[]], ['tulo'], undefined, undefined, 'join'); };

const quotientRule: Author = r => {
  const b = r.pick(['2', '3', 'a']); return rewrite(quotient(power(b, r.int(4, 6)), power(b, r.int(1, 3))), [[]], ['osamäärä'], undefined, undefined, 'cancel');
};
const quotientEmpty: Author = r => {
  const b = r.pick(['2', '4', 'x']), n = r.int(2, 4); return rewrite(quotient(power(b, n), power(b, n)), [[]], ['osamäärä'], undefined, undefined, 'cancel');
};
const quotientTransfer: Author = r => {
  const b = r.pick(['a', 'y']), a = r.int(1, 3);
  return {
    ...rewrite(quotient(power(b, a), power(b, a + r.int(1, 3))), [[]], ['osamäärä'], undefined, undefined, 'cancel'),
    hint: 'Jos supistuksen jälkeen jää tekijöitä vain nimittäjään, osoittajaksi jää 1. Tämän suhteen voi merkitä negatiivisella eksponentilla. Kanta ei saa olla nolla.',
  };
};

const nestedLayers: Author = r => rewrite(nested(r.pick(['2', '3', '5']), r.int(2, 3), r.int(2, 4)), [[]], ['potenssin-potenssi'], undefined, undefined, 'repeat');
const nestedSign: Author = r => rewrite(nested(r.pick(['-2', '-3', '1/2']), r.int(2, 3), r.int(2, 3)), [[]], ['potenssin-potenssi'], undefined, undefined, 'repeat');
const nestedTransfer: Author = r => rewrite(nested(r.pick(['x', 'a']), r.int(2, 4), r.int(2, 3)), [[]], ['potenssin-potenssi'], undefined, undefined, 'repeat');

const simplifyMultiply: Author = r => {
  const b = r.pick(['a', 'x']); return rewrite(product(nested(b, r.int(2, 4), r.int(2, 3)), power(b, r.int(1, 3))), [['left'], []], ['potenssin-potenssi', 'tulo']);
};
const simplifyDivide: Author = r => {
  const b = r.pick(['b', 'y']); return rewrite(quotient(product(power(b, r.int(2, 3)), power(b, r.int(1, 3))), power(b, r.int(2, 5))),
    [['left'], []], ['tulo', 'osamäärä']);
};
const simplifyTransfer: Author = r => {
  const b = r.pick(['k', 't']); return rewrite(quotient(power(b, r.int(2, 5)), nested(b, r.int(2, 4), r.int(2, 3))),
    [['right'], []], ['potenssin-potenssi', 'osamäärä']);
};

const defs: readonly Definition[] = [
  {
    id: 'M79-DIVIS-01', stop: 'Tasaiset kivikehät', icon: '◉', intro: 'Loikka asettelee näköalapaikan kiviä riveihin. Aava tarkistaa, jääkö yli.',
    goal: 'Tutkit kokonaislukujen jaollisuutta kertolaskun ja jakojäännöksen avulla.',
    reward: 'Kivikehä sulkeutuu tasaisesti, ja polun tulokohdat merkitään.',
    families: [['build-even-rows', divideRows], ['repair-overfull-rows', divideDraft]], transfer: divideTransfer,
    limit: 'Osamäärä ja ei-negatiivinen jakojäännös tuotetaan annetulle nollasta poikkeavalle jakajalle. Siirto sisältää etumerkit.',
  },
  {
    id: 'M79-PRIME-01', stop: 'Kivet, jotka eivät jakaudu riveiksi', icon: '✧', intro: 'Aava lajittelee pajan laatat. Ykkösen paikka pitää tutkia erikseen.',
    goal: 'Erotat alkuluvut, yhdistetyt luvut ja luvun yksi jakajien avulla.',
    reward: 'Alkulukukivet muodostavat oman tähtikuvionsa pajan seinään.',
    families: [['compare-odd-and-composite', primeOdd], ['classify-one-boundary', primeBoundary]], transfer: primeTransfer,
    limit: 'Luokka valitaan. Yhdistetyn luvun aito jakaja ja ykkösen jakajien määrä kirjoitetaan. Näyttö ei ole yleinen alkulukutodistus.',
  },
  {
    id: 'M79-PRIMEFACT-01', stop: 'Vuoren kiven sukupuu', icon: '⌘', intro: 'Sulkan karttakiveen kätkeytyy tekijäpuu. Aava avaa jokaisen haaran.',
    goal: 'Rakennat tekijäpuun ja tarkistat tulon kaikista alkulukulehdistä.',
    reward: 'Kivimerkin osat sopivat toisiinsa. Vuoren karttahuone avaa uuden ikkunan.',
    produceWhat: 'tekijäpuun rakentamista ja alkulukulehtien tulon laskemista',
    families: [['open-factor-tree', treeOpen], ['continue-given-branches', treeContinue]], transfer: treeTransfer,
    limit: 'Kaikki lailliset puut hyväksytään. Annettu aloituspari säilyy jatkotehtävässä ja siirto vaatii eri aloitusparin.',
  },
  {
    id: 'M79-POWER-01', stop: 'Tähtilyhdyn kolme tietoa', icon: '✦', intro: 'Loikka löytää lyhdystä ison luvun ja pienen yläindeksin. Aava tutkii niiden tehtäviä.',
    goal: 'Erotat kannan, eksponentin ja arvon sekä yhdistät ne tekijäjonoon.',
    reward: 'Lyhty avautuu sovituksi haarautuvaksi kuvioksi, ja tähdenmerkki paljastuu.',
    families: [['read-power-notation', interpretSymbol], ['recover-notation-from-factors', interpretFactors]], transfer: interpretTransfer,
    demo: () => [{ say: 'Vertaa kahta merkintää. Kun kanta ja eksponentti vaihtavat paikkaa, vaihtuvat sekä toistettava tekijä että toistojen määrä.', scene: powerNotationContrast }],
    limit: 'Kanta, eksponentti, tekijäjono ja arvo tuotetaan pienille positiivisille kokonaisluvuille.',
  },
  {
    id: 'M79-POWER-POS', stop: 'Monistuvien valojen torni', icon: '☀', intro: 'Tornin jokainen lyhty haarautuu yhtä moneen uuteen lyhtyyn.',
    goal: 'Lasket positiivisen eksponentin potenssin tekijäjonosta ja vertaat arvoja.',
    reward: 'Oikean kerroksen lyhdyt valaisevat pienen vuoristosillan.',
    produceWhat: 'tekijäjonon rakentamista ja arvon laskemista',
    families: [['compare-successive-layers', expandLayers], ['distinguish-minus-parentheses', expandSigned]], transfer: expandGrid,
    limit: 'Arvo tarkistetaan täsmällisesti. Vertailu tehdään annetuilla pienillä eksponenteilla sekä suljetulla tai ulkopuolisella miinuksella.',
  },
  {
    id: 'M79-POWER-ZERO', stop: 'Yhden valon kerros', icon: '◎', intro: 'Loikka luulee nollakerrosta tyhjäksi. Aava jatkaa kerrosten jakosääntöä.',
    goal: 'Yhdistät nollaeksponentin jakosuhteeseen ja sen määrittelyehtoon.',
    reward: 'Yksi yhteinen lamppu jää palamaan tornin perustaan.',
    families: [['step-down-to-zero', zeroTable], ['equal-powers-ratio', zeroRatio]], transfer: zeroTransfer,
    limit: 'Tehtävä arvioi nollasta poikkeavan kannan jakosuhteen ja sen ehdon. 0⁰ jää tässä käytetyn säännön ulkopuolelle.',
  },
  {
    id: 'M79-POWER-NEG', stop: 'Lyhdyn käänteinen asteikko', icon: '☾', intro: 'Aava tarvitsee yöpolulle sopivan valoasteikon. Symbolitaululla hän kokeilee myös murto-osakantaa.',
    goal: 'Rakennat negatiivisen eksponentin käänteispotenssin ja vertaat tulosta yhteen.',
    reward: 'Koelyhdyn asteikko jättää yöpolulle sopivasti valoa ja eläimille rauhalliset varjot.',
    produceWhat: 'käänteispotenssin ja sen täsmällisen arvon kirjoittamista',
    families: [['reciprocal-light-scale', negativeWhole], ['reciprocal-symbol-bases', negativeFraction]], transfer: negativeTransfer,
    limit: 'Käänteispotenssin rakenne, arvo ja ehto arvioidaan. Valomalli käyttää kantaa yli yksi. Siirron 1/2-kanta erottaa mallin yleisestä säännöstä.',
  },
  {
    id: 'M79-POWER-PROD', stop: 'Kahden valopuun liitos', icon: '✚', intro: 'Aava yhdistää kaksi valosuunnitelmaa. Loikka tarkistaa, toistuuko niissä sama tekijä.',
    goal: 'Yhdistät saman kannan potenssit ja tunnistat väärän yhdistämisen vastatapauksesta.',
    reward: 'Yhdistetty valokuvio syttyy pajan holviin.',
    families: [['merge-same-base', productRule], ['test-different-base-counterexample', productCounter]], transfer: productTransfer,
    limit: 'Saman kannan tulo sievennetään ja eri kantojen väärä summa kumotaan laskemalla vastaesimerkki. Sääntönimi valitaan.',
  },
  {
    id: 'M79-POWER-QUOT', stop: 'Turhien kerrosten purku', icon: '÷', intro: 'Aava vertaa kahta saman kannan suunnitelmaa ja etsii yhteiset tekijät.',
    goal: 'Sievennät osamäärän vähentämällä eksponentit oikeassa järjestyksessä.',
    reward: 'Yöpolulle jää juuri tarvittava valon määrä.',
    families: [['cancel-some-factors', quotientRule], ['cancel-all-factors', quotientEmpty]], transfer: quotientTransfer,
    limit: 'Saman nollasta poikkeavan kannan osamäärä arvioidaan positiiviseen, nollaan tai negatiiviseen eksponenttiin.',
  },
  {
    id: 'M79-POWER-POWER', stop: 'Tornin sisäiset kerrokset', icon: '▤', intro: 'Sulkan suunnitelmassa kokonainen lyhtyryhmä toistuu. Loikka avaa sulut.',
    goal: 'Tunnistat toistuvan potenssiryhmän ja kerrot sen eksponentit.',
    reward: 'Kerrostettu koetorni asettuu suunnitelmaan.',
    families: [['repeat-layer-powers', nestedLayers], ['repeat-signed-or-fraction-groups', nestedSign]], transfer: nestedTransfer,
    limit: 'Sisäkkäisen potenssin välivaihe ja kanta arvioidaan. Kanta säilyy myös negatiivisena tai murto-osana.',
  },
  {
    id: 'M79-POWER-SIMPLIFY', stop: 'Tähtikartan tiivis kieli', icon: '✷', intro: 'Tähtikartan merkintä on liian pitkä viestilippuun. Aava tiivistää sen yksi rakenne kerrallaan.',
    goal: 'Sievennät yhdistelmälausekkeen ja osoitat sen välivaiheet sekä määrittelyehdon.',
    reward: 'Täsmällinen tähtimerkintä mahtuu viestiin ja pääsee observatoriolle.',
    produceWhat: 'välivaiheiden eksponenttien, lopullisen potenssin ja määrittelyehdon esittämistä',
    families: [['nested-before-product', simplifyMultiply], ['product-before-quotient', simplifyDivide]], transfer: simplifyTransfer,
    limit: 'Kohdistettu symbolinen välivaihe, valittu sääntö ja määrittelyehto arvioidaan vain tehtävän omille säännöille. Vapaamuotoinen todistus arvioidaan erikseen.',
  },
];

type PowerSpec = Omit<NodeSpec, 'item'> & { item: (r: Rng, phase: Phase) => RuleItem };
function lesson(def: Definition): PowerSpec {
  const rev = `exp690-um05-${def.id.toLowerCase()}-v1`;
  const { families, transfer, limit: _limit, ...meta } = def;
  return {
    ...meta, rev, validRevs: [rev],
    ...(def.produceWhat ? { produce: [...families.map(([tag]) => tag), 'transfer'] } : {}),
    demo(r) {
      if (def.demo) return def.demo(r);
      const example = families[0][1](r);
      return [{ say: example.hint!, scene: example.scene! }, { say: example.explain, scene: powerRuleExample(example.task) }];
    },
    item(r, phase) {
      const [tag, author] = phase === 'transfer' ? ['transfer', transfer] as const : r.pick(families);
      return { ...author(r), tag };
    },
  };
}

export const powerRuleSpecs: PowerSpec[] = defs.map(lesson);
export const powerRuleEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(defs.map(def => [def.id, { families: def.families.map(([tag]) => tag), limit: def.limit }]));
