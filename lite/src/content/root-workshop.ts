import type { Item, NodeSpec, Phase } from '../engine/types';
import type { Rng } from '../engine/rng';
import { estimateSquare, fixedText, type RealCard, type RootMarker, type RootWorkshopTask } from './models/root-workshop';
import { rootWorkshopBoard, rootWorkshopExample } from './scenes/root-workshop';

type RootItem = Omit<Item, 'task'> & { task: RootWorkshopTask };
type Author = (r: Rng) => Omit<RootItem, 'tag'>;
type Definition = Pick<NodeSpec, 'id' | 'stop' | 'icon' | 'intro' | 'goal' | 'reward' | 'produceWhat'> & {
  families: readonly [readonly [string, Author], readonly [string, Author]];
  transfer: Author;
  limit: string;
};
const ctx = (title: string, ...skills: string[]): RootWorkshopTask['context'] => ({ title, skills });
const squares = ctx('Luvun neliö ja neliön pinta-ala', 'M79-POWER-01');
const rootIdea = ctx('Ei-negatiivinen pääjuuri', 'M79-SQRT-01');
const exactAndEstimate = ctx('Tarkat juuret ja niiden neliövertailu', 'M79-SQRT-EXACT', 'M79-SQRT-EST');
const fraction = ctx('Tarkat murtoluvut ja desimaalit', 'M-FRACDEC-01');
const numbers = ctx('Reaalilukujen esitystavat ja vertailu', 'M79-REAL-01');
const roundingContext = ctx('Pyöristys ja lukujen suuruus', 'M-ROUND-01');

type AuthoredTask<T = RootWorkshopTask> = T extends { kind: string } ? Omit<T, 'kind'> : never;
function item(task: AuthoredTask, say: string, hint: string, explain: string): ReturnType<Author> {
  const full: RootWorkshopTask = { ...task, kind: 'root-workshop' };
  return { task: full, scene: rootWorkshopBoard(full), say, hint, explain };
}

function principal(r: Rng, context: 'garden' | 'repair' | 'symbol') {
  const side = r.pick(context === 'garden' ? [2, 3, 4, 5, 6, 7] : [0, 2, 3, 5, 8]);
  const radicand = side * side;
  const negativeProbe = context === 'garden' ? undefined : -r.pick([4, 9, 16, 25]);
  return item({ mode: 'principal', context: squares, view: context, radicand, negativeProbe },
    'Päätä, onko reaalinen neliöjuuri olemassa. Jos on, anna pääjuuri ja varmista se neliöimällä.',
    'Pääjuuri on yksi ei-negatiivinen luku. Reaaliluvun neliö on vähintään nolla.',
    `${side} × ${side} = ${radicand}. Siksi √${radicand} = ${side}. ${side === 0 ? 'Nolla on ei-negatiivinen.' : 'Pääjuuri on ei-negatiivinen.'}${negativeProbe ? ' Negatiivisella juurrettavalla ei ole reaalista neliöjuurta.' : ''}`);
}
function exact(r: Rng, variation: 'tiles' | 'large' | 'new') {
  const side = r.pick(variation === 'tiles' ? [0, 2, 3, 4, 6, 8] : variation === 'large' ? [10, 11, 12, 13, 14, 15] : [9, 16, 17, 18, 19]);
  const radicand = side ** 2;
  return item({ mode: 'exact', context: rootIdea, view: variation === 'tiles' ? 'tiles' : 'symbol', radicand },
    variation === 'large' ? 'Etsi suuremman täydellisen neliön tarkka pääjuuri ja tarkista se kertomalla luku itsellään.'
      : 'Kirjoita tarkka pääjuuri ja sen neliö. Käytä nollaa, jos sivun pituus on nolla.',
    'Etsi ei-negatiivinen luku, jonka neliö antaa annetun pinta-alan. Kokeile neliöitä yksi kerrallaan.',
    `√${radicand} = ${side}, koska ${side}² = ${radicand}.`);
}
function nearRoot(r: Rng, upper: boolean) {
  const low = r.int(2, 9);
  const split = Math.floor((low + .5) ** 2);
  return upper ? r.int(split + 1, (low + 1) ** 2 - 1) : r.int(low * low + 1, split);
}
function estimate(r: Rng, variation: 'garden' | 'tight' | 'upper') {
  const radicand = nearRoot(r, variation === 'upper' || r.chance(.38));
  const tenths = variation === 'tight';
  return item({ mode: 'estimate', context: rootIdea, view: variation === 'garden' ? 'garden' : 'symbol', radicand, tenths },
    'Rajaa pääjuuri peräkkäisillä kokonaisluvuilla ja merkitse lähin kokonaisluku.',
    'Neliöi ehdotetut rajat. Lähin kokonaisluku selviää vertaamalla juurrettavaa puolivälin neliöön.',
    'Alempi neliö jää juurrettavaa pienemmäksi ja ylempi suuremmaksi. Lähempänä oleva sivun pituus selviää rajojen puolivälistä.');
}
function paired(r: Rng, view: 'symbol' | 'repair' | 'garden') {
  const side = r.int(2, 10);
  const radicand = nearRoot(r, r.chance(.5));
  return item({ mode: 'paired', context: exactAndEstimate, exactRadicand: side ** 2, radicand, view, tenths: view === 'repair' },
    'Kirjoita toisen neliön tarkka sivu ja rajaa toisen sivu. Merkitse = tai ≈ kumpaankin.',
    'Täydellisen neliön pääjuuri on tarkka. Ei-täydellisen neliön lähin kokonaisluku on arvio.',
    'Tarkan juuren neliö on annettu luku. Arvioidun juuren lähin kokonaisluku on vain likiarvo, vaikka juurimerkintä itse on tarkka.');
}
function operation(r: Rng, operation: '+' | '−' | '×') {
  const radicand = r.pick([2, 3, 5, 6, 7, 10]);
  const left = r.int(1, 4);
  const right = operation === '−' ? (left === 1 ? r.int(2, 5) : r.pick([left - 1, left + 1])) : r.int(1, 4);
  const rightRadicand = operation === '×' ? r.pick([radicand, radicand === 2 ? 8 : 2, 3]) : radicand;
  return item({ mode: 'operation', context: exactAndEstimate, operation, radicand, left, right, rightRadicand },
    'Kirjoita tarkka tulos kokonaislukuna tai yhtenä juuriterminä kokonaislukukertoimella. Pyöristä sitten yhteen desimaaliin.',
    operation === '×' ? 'Kerro kertoimet keskenään. Kahden ei-negatiivisen luvun neliöjuurten tulossa voit kertoa myös juurrettavat.'
      : 'Saman juuriosan kertoimet voi laskea yhteen tai vähentää. Juurrettavia ei lasketa yhteen.',
    'Pidä laskun aikana tarkka arvo. Pyöristä vain lopullinen lukema ja valitse merkki sen perusteella, säilyikö arvo samana.');
}
type Card = Omit<RealCard, 'id'>;
function classify(r: Rng, variation: 'symbols' | 'decimals' | 'transfer') {
  const finite = r.pick(['0,125', '1,414', '−2,04']);
  const ratio = r.pick(['3/7', '−11/8', '13/5']);
  const period = r.pick(['27', '18', '4', '9']);
  const n = r.pick([2, 3, 5, 7]);
  const rad: Card = { label: `√${n}`, detail: 'Kokonaisluku juurimerkin alla jää kahden peräkkäisen kokonaisneliön väliin. Tällaisen kokonaisluvun neliöjuuri on irrationaalinen.', basis: 'known-irrational' };
  const pi: Card = { label: 'π', detail: 'Matemaattinen tieto: π:tä ei voi esittää kahden kokonaisluvun osamääränä.', basis: 'known-irrational' };
  const finiteCard: Card = { label: finite, detail: 'Merkintä on tämän luvun koko tarkka desimaaliesitys.', basis: 'finite' };
  const repeated: Card = { label: `0,(${period})`, detail: `Sulkeissa oleva ${period} toistuu loputtomasti.`, basis: 'periodic' };
  const fragment: Card = { label: '1,414…', detail: 'Käytössä ovat vain alkuosan numerot. Jatkoa ei tunneta.', basis: 'fragment' };
  const cards = r.shuffle(variation === 'symbols' ? [{ label: ratio, detail: 'Tarkka osamäärä. Nimittäjä on eri kuin nolla.', basis: 'ratio' } satisfies Card, rad, pi]
    : variation === 'decimals' ? [finiteCard, repeated, fragment]
      : [finiteCard, repeated, { ...rad, detail: 'Luvun koko desimaaliesitys on matemaattisesti tiedetty päättymättömäksi ja jaksottomaksi.' }])
    .map((card, i) => ({ ...card, id: String.fromCharCode(65 + i) }));
  return item({ mode: 'classify', context: fraction, cards },
    'Valitse jokaiselle luvulle laji ja peruste. Valitse ”Tieto ei riitä”, jos näet vain tuntemattoman luvun katkelman.',
    'Murtoluku, päättyvä desimaali ja toistuva desimaalijakso ovat rationaalisia. Irrationaalisuuteen tarvitaan tietoa koko luvusta.',
    'Luvun lajia ei ratkaise näytettyjen numeroiden määrä. Tarkka esitys tai tunnettu matemaattinen ominaisuus antaa perusteen.');
}
function place(r: Rng, variation: 'rational' | 'mixed' | 'zoom') {
  const first = variation === 'rational' ? -200 : variation === 'mixed' ? 0 : 100;
  const last = variation === 'rational' ? 200 : variation === 'mixed' ? 350 : 300;
  const step = variation === 'zoom' ? 10 : 25;
  const known: readonly [number, string, string][] = [[2, '1,40', '1,45'], [3, '1,70', '1,75'], [5, '2,20', '2,25'], [7, '2,60', '2,65']];
  const [n, lo, hi] = r.pick(known);
  const raw: Omit<Extract<RootMarker, { value: string }>, 'id'>[] = variation === 'rational'
    ? [{ label: '−3/4', value: '−3/4' }, { label: '1,25', value: '1,25' }, { label: r.pick(['0,5', '−1,5']), value: '' }]
    : [{ label: '5/4', value: '5/4' }, { label: '2,5', value: '2,5' }];
  const marks = raw.map(card => ({ ...card, value: card.value || card.label }));
  type Unmarked = Omit<Extract<RootMarker, { value: string }>, 'id'> | Omit<Extract<RootMarker, { range: readonly string[] }>, 'id'>;
  const shuffled = r.shuffle<Unmarked>(
    variation === 'rational' ? marks : [...marks, { label: `√${n}`, range: [lo, hi] }]);
  const markers = shuffled.map((card, i) => ({ ...card, id: String.fromCharCode(65 + i) }));
  return item({ mode: 'line', context: numbers, markers, first, last, step, ...(variation === 'zoom' ? { overview: [-200, 500] as const } : {}) },
    'Sijoita jokainen luku lukusuoralle. Valitse = tarkalle kohdalle ja ≈ annetulle juuren likimääräiselle sijainnille.',
    'Lue asteikon väli. Murtoluku ja desimaali voi esittää samana lukuna. Juuren hyväksytty paikka on ilmoitetulla vertailuvälillä.',
    'Asteikko voi muuttua, mutta luvun suuruus säilyy. Tarkka luku ja likimääräinen sijaintimerkki palvelevat eri tarkoituksia.');
}
function exactApprox(r: Rng, variation: 'root' | 'finite' | 'fraction') {
  const n = r.pick([2, 3, 5, 7, 10, 11, 13]);
  const finite = r.pick([['5/4', '1,25'], ['−13/4', '−3,25'], ['3/2', '1,50']]);
  const repeating = r.pick([['2/3', '0,67'], ['4/7', '0,57'], ['−5/6', '−0,83'], ['7/3', '2,33']]);
  const chosen = variation === 'finite' ? finite : repeating;
  return item({ mode: 'exact-approx', context: fraction,
    source: variation === 'root' ? { kind: 'root', radicand: n } : { kind: 'ratio', value: chosen[0]! },
    report: variation === 'root' ? fixedText(estimateSquare(n, 2).nearest, 2) : chosen[1]!, places: 2 },
  'Vertaa tarkkaa arvoa näytön lukuun. Valitse merkki, kerro kumpi on suurempi ja anna näytön rajakohdat.',
  'Tarkkuus 0,01 antaa puolikkaan askeleen 0,005. Vertaile alkuperäistä lukua näytön arvoon, älä niiden kirjoitusasun pituutta.',
  'Näytön rajakohdat ovat puoli askelta lukeman molemmin puolin. Tarkka lähdeluku voi olla sama, pienempi tai suurempi kuin näytön luku.');
}
function rounded(r: Rng, goal: 'decimal' | 'pieces' | 'significant') {
  const value = goal === 'decimal' ? r.pick(['−4,25', '−5,35', '12,15', '18,27', '21,63'])
    : goal === 'pieces' ? r.pick(['3,2', '4,1', '5,75', '6,01', '5,0'])
      : r.pick(['0,0746', '0,01249', '0,007349', '0,00995', '0,0954']);
  return item({ mode: 'round', context: roundingContext, value, goal, places: goal === 'decimal' ? 1 : 0,
    ...(goal === 'significant' ? { figures: 2 } : {}), unit: goal === 'decimal' ? 'km' : goal === 'pieces' ? 'm' : 'mm' },
  goal === 'pieces' ? 'Kirjaa koko pituuden peittämiseen tarvittavien yhden metrin osien määrä.'
    : 'Sijoita alkuperäinen luku asteikon väliin ja kirjoita ilmoitetulla tarkkuudella.',
  goal === 'pieces' ? 'Kokonaisia osia täytyy olla tarpeeksi koko mitan peittämiseen. Vertaa yhtä pienempää määrää tarpeeseen.'
    : goal === 'significant' ? 'Etsi ensimmäinen nollasta poikkeava numero. Laske merkitsevät numerot siitä alkaen, älä pilkusta.'
      : 'Puolivälin merkintä pyöristyy nollasta poispäin. Säilytä alkuperäinen luku laskun loppuun.',
  'Alkuperäinen luku säilyy vertailussa. Sopiva raportti riippuu siitä, pyydetäänkö desimaaleja, merkitseviä numeroita vai varmasti riittäviä kokonaisia osia.');
}

const defs: readonly Definition[] = [
  {
    id: 'M79-SQRT-01', stop: 'Puutarhan puuttuva sivu', icon: '√', intro: 'Aava tietää neliön alan ja Loikka kokeilee samanpituisia sivuja.',
    goal: 'Yhdistät pääjuuren ei-negatiiviseen sivuun ja varmistat sen neliöimällä.', reward: 'Puutarhan sivu saa oman merkkinsä.',
    produceWhat: 'pääjuuren ja tarkistusneliön tuottamista',
    families: [['construct-square-side', r => principal(r, 'garden')], ['repair-principal-root-claim', r => principal(r, 'repair')]], transfer: r => principal(r, 'symbol'),
    limit: 'Tarkistus koskee yhden pääjuuren olemassaoloa reaaliluvuissa ja neliövertailua. Yhtälön x² = a koko ratkaisujoukko arvioidaan erikseen.',
  },
  {
    id: 'M79-SQRT-EXACT', stop: 'Laatat ilman leikkaamista', icon: '▦', intro: 'Loikka varmistaa, että kaikki laatat mahtuvat tasakylkiseen neliöön.',
    goal: 'Lasket täydellisen neliön tarkan pääjuuren ja varmistat sen neliöimällä.', reward: 'Neliötaso saa tarkan sivumitan.',
    produceWhat: 'tarkan pääjuuren ja sen neliön laskemista',
    families: [['verify-tiled-square', r => exact(r, 'tiles')], ['check-larger-numerical-square', r => exact(r, 'large')]], transfer: r => exact(r, 'new'),
    limit: 'Pääjuuri ja oma neliöluku tarkistetaan täydellisistä neliöistä, myös nollasta. Muut juuret kuuluvat arviointipolkuun.',
  },
  {
    id: 'M79-SQRT-EST', stop: 'Kahden sivun väliin', icon: '⟷', intro: 'Puutarhan sivu mahtuu kahden tutun kokonaislukumitan väliin.',
    goal: 'Rajaat neliöjuuren ja löydät lähimmän kokonaisluvun neliövertailulla.', reward: 'Juuriportin arvioitu mitta mahtuu annettuun väliin.',
    produceWhat: 'kokonaislukurajojen, tarkennuksen ja lähimmän kokonaisluvun tuottamista',
    families: [['bracket-square-side', r => estimate(r, 'garden')], ['refine-root-with-tenths', r => estimate(r, 'tight')]], transfer: r => estimate(r, 'upper'),
    limit: 'Rajaus hyväksytään täsmällisen neliövertailun perusteella. Työpöytä näyttää omien kokeilujen neliöt.',
  },
  {
    id: 'M79-SQRT-02', stop: 'Portin kaksi puuttuvaa mittaa', icon: '⊞', intro: 'Toiseen portin neliöön sopii tarkka kokonaislukusivu, toinen tarvitsee arvion.',
    goal: 'Ratkaiset samassa työssä tarkan ja arvioitavan juuren ja merkitset niiden eron.', reward: 'Portin kaksi mittalappua saadaan paikoilleen.',
    produceWhat: 'tarkan pääjuuren ja arvioidun juuren rajojen tuottamista',
    families: [['combine-exact-and-bounded-side', r => paired(r, 'symbol')], ['repair-two-exact-side-labels', r => paired(r, 'repair')]], transfer: r => paired(r, 'garden'),
    limit: 'Tarkka neliövertailu ja arvioidun juuren rajat tuotetaan samassa tehtävässä. Merkintöjen valinta on rajattu esitystavan näyttö.',
  },
  {
    id: 'M79-SQRT-03', stop: 'Katos saa juurimittansa', icon: '⊕', intro: 'Aava säilyttää juurimitat tarkkoina katoksen laskun loppuun.',
    goal: 'Lasket juuritermien kanssa, tuotat tarkan muodon ja raportoit lopputuloksen sovitulla tarkkuudella.', reward: 'Katos saa perustellun mitan.',
    produceWhat: 'tarkan juurilaskun ja pyöristetyn tuloksen tuottamista',
    families: [['add-like-root-terms', r => operation(r, '+')], ['subtract-like-root-terms', r => operation(r, '−')]], transfer: r => operation(r, '×'),
    limit: 'Käsitellään saman juuriosan yhteen- ja vähennyslaskua sekä positiivisten juurten tuloa. Ekvivalentit yhden termin tarkat muodot hyväksytään.',
  },
  {
    id: 'M79-REAL-01', stop: 'Karttamerkkien lukulajit', icon: 'ℝ', intro: 'Aava ja Loikka löytävät kartasta täsmällisiä lukuja ja pelkkiä näytön katkelmia.',
    goal: 'Tunnistat rationaalisen ja irrationaalisen luvun annetuista matemaattisista tiedoista.', reward: 'Karttamerkit saavat oikein perustellut lukulajit.',
    families: [['classify-from-symbol-and-theorem', r => classify(r, 'symbols')], ['distinguish-decimal-completion-and-fragment', r => classify(r, 'decimals')]],
    transfer: r => classify(r, 'transfer'),
    limit: 'Tarkistus kattaa annetun esityksen lukulajin ja perusteen tunnistamisen. Katkelma voi olla riittämätön, eikä vapaata todistusta arvioida.',
  },
  {
    id: 'M79-REAL-02', stop: 'Samalle rantaviivalle', icon: '↔', intro: 'Eri tavoin kirjoitetut luvut saavat paikat samalla kartalla.',
    goal: 'Sijoitat tarkat luvut ja annetuin rajoin arvioidut juuret lukusuoralle.', reward: 'Karttaan löytyy yhteinen asteikko.',
    produceWhat: 'omien sijoitusmerkkien muodostamista',
    families: [['place-signed-rational-markers', r => place(r, 'rational')], ['place-mixed-real-markers', r => place(r, 'mixed')]], transfer: r => place(r, 'zoom'),
    limit: 'Arviointi käyttää ilmoitettua tarkkaa kohtaa tai hyväksyttyä suljettua väliä. Kamerakulma ja osoittimen pikselipaikka eivät vaikuta.',
  },
  {
    id: 'M79-EXACTAPPROX-01', stop: 'Tarkka arvo ja mittarin näyttö', icon: '≈', intro: 'Sulalla on tarkka merkintä ja rajattu mittarilukema.',
    goal: 'Erotat tarkan arvon ja näytön likiarvon sekä löydät mittarin rajakohdat.', reward: 'Mittalapussa on oikea merkki ja tarkkuus.',
    produceWhat: 'mittarin tarkkuudesta seuraavien rajakohtien laskemista',
    families: [['compare-root-and-rounded-display', r => exactApprox(r, 'root')], ['recognize-exact-finite-equivalence', r => exactApprox(r, 'finite')]],
    transfer: r => exactApprox(r, 'fraction'),
    limit: 'Tarkistetaan lähdearvon vertailu, = tai ≈ ja numeeriset rajakohdat. Rajakohtien sisällytys seuraa ilmoitettua puolivälisääntöä.',
  },
  {
    id: 'M79-ROUND-01', stop: 'Korjaajan sopiva tarkkuus', icon: '⌁', intro: 'Aava pitää alkuperäisen mitan näkyvissä ja kirjaa korjaajalle tarpeellisen määrän.',
    goal: 'Pyöristät tilanteen mukaan ja erotat desimaalit, merkitsevät numerot ja riittävät kokonaiset osat.', reward: 'Korjaaja saa työhön sopivan luvun.',
    produceWhat: 'pyöristyksen asteikkokohtien ja lopputuloksen tuottamista',
    families: [['round-to-stated-decimal-places', r => rounded(r, 'decimal')], ['choose-enough-whole-parts', r => rounded(r, 'pieces')]],
    transfer: r => rounded(r, 'significant'),
    limit: 'Puolivälissä pyöristetään nollasta poispäin. Tilaus käyttää riittävää kokonaismäärää ja pienen osan siirtotehtävä merkitseviä numeroita.',
  },
];

type RootSpec = Omit<NodeSpec, 'item'> & { item(r: Rng, phase: Phase): RootItem };
function spec(def: Definition): RootSpec {
  const { families, transfer, limit: _limit, ...meta } = def;
  const rev = `exp690-root-workshop-${def.id.toLowerCase()}-v1`;
  return { ...meta, rev, validRevs: [rev],
    demo(r) {
      return families.map(([, author]) => { const example = author(r); return { say: example.explain!, scene: rootWorkshopExample(example.task) }; });
    },
    item(r, phase) {
      const [tag, author] = phase === 'transfer' ? ['transfer', transfer] as const : r.pick(families);
      return { ...author(r), tag };
    },
  };
}
export const rootWorkshopSpecs: RootSpec[] = defs.map(spec);
export const rootWorkshopEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(defs.map(({ id, families, limit }) => [id, { families: families.map(([tag]) => tag), limit }]));
