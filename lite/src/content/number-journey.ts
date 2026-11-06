import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Phase } from '../engine/types';
import { type Direction, type NumberContext, type NumberJourneyTask, type NumberMode, type Relative } from './models/number-journey';
import { compassNames, numberJourneyBoard, numberJourneyExample } from './scenes/number-journey';

type NumberItem = Omit<Item, 'task'> & { task: NumberJourneyTask };
type Author = (r: Rng) => Omit<NumberItem, 'tag'>;
type Definition = Pick<NodeSpec, 'id' | 'stop' | 'icon' | 'intro' | 'goal' | 'reward' | 'produceWhat'> & {
  families: readonly [readonly [string, Author], readonly [string, Author]];
  transfer: Author;
  limit: string;
};

const given = (label: string, value: string) => ({ label, value });
const context = (title: string, ...skills: string[]): NumberContext => ({ title, skills });
const quantity = context('Määrä kertoo, montako on', 'M-NUM-02');
const role = context('Lukumäärä ja numeromerkintä', 'M-NUM-03');
const numberLine = context('Lukujono eteen ja taakse', 'M-NUM-07', 'M-NUM-08');
const comparison = context('Määrien ja lukujen vertaaminen', 'M-NUM-10');
const ordinalContext = context('Lukujono eteenpäin', 'M-NUM-07');
const addition = context('Kahden määrän yhdistäminen', 'M-ADD-01');
const operationContext = context('Määrien yhdistäminen, vähentäminen ja vertailu', 'M-ADD-01', 'M-SUB-01', 'M-SUB-02');
const signed = context('Kokonaislukujen järjestys lukusuoralla', 'M-NEG-02');
const directions = context('Sijainti ja suunnat', 'M-GEO-02');

function item(problem: NumberMode, familiar: NumberContext, givens: NumberJourneyTask['givens'], say: string, hint: string, explain: string): ReturnType<Author> {
  const task: NumberJourneyTask = { kind: 'number-journey', ...problem, context: familiar, givens };
  return { task, scene: numberJourneyBoard(task), say, hint, explain };
}

function grouped(r: Rng, pattern: 'dice' | 'rows' | 'uneven') {
  const parts = pattern === 'dice' ? r.pick([[5, 3], [4, 2], [6, 3]] as const)
    : pattern === 'rows' ? r.pick([[4, 4, 2], [3, 3, 2], [5, 4, 1]] as const)
      : r.pick([[5, 2, 4], [6, 2, 3], [3, 5, 4]] as const);
  const object = pattern === 'uneven' ? 'simpukka' : 'lehti';
  return item({ mode: 'grouped', parts, pattern, object }, quantity, [],
    'Katso ryhmiä. Kirjoita jokaisen ryhmän määrä ja laske kaikki yhteen.',
    'Tunnista ensin yksi ryhmä. Siirry sitten seuraavaan. Jokainen kohde kuuluu vain yhteen ryhmään.',
    `Näkyvät ryhmät ovat ${parts.join(' + ')}. Yhteensä niitä on ${parts.reduce((a, b) => a + b, 0)}.`);
}

function estimate(r: Rng, pattern: 'loose' | 'clusters' | 'sizes') {
  const amount = pattern === 'sizes' ? r.pick([13, 19, 26]) : r.pick([12, 18, 24, 29]);
  const bands = [[7, 14], [16, 21], [23, 31]] as const;
  const object = pattern === 'sizes' ? 'simpukka' : 'käpy';
  return item({ mode: 'estimate', amount, pattern, object, bands }, quantity, [],
    'Katso joukkoa ja lukitse uskottava arvioalue. Tarkista vasta sitten ryhmitelty määrä.',
    'Ajattele pieniä ryhmiä ja koko joukon kokoa. Suuri esine on silti yksi esine.',
    `Ryhmittelyssä näkyy ${amount} kohdetta. Vertaa tarkkaa määrää siihen alueeseen, jonka lukitsit.`);
}

function neighbors(r: Rng, view: 'path' | 'quay' | 'cards') {
  const center = view === 'path' ? r.pick([2, 4, 6, 9]) : view === 'quay' ? r.pick([0, 1]) : r.pick([10, 11, 15]);
  return item({ mode: 'neighbors', center, view }, numberLine, [],
    'Täydennä keskimmäisen luvun edeltäjä ja seuraaja. Jos edeltäjää ei ole, merkitse se.',
    'Katso yhtä askelta taakse ja yhtä eteen. Tämä jono alkaa nollasta.',
    center === 0 ? 'Luonnollisten lukujen jonossa nollalla ei ole edeltäjää. Nollan seuraaja on yksi.'
      : `${center - 1}, ${center}, ${center + 1}. Keskimmäisen luvun naapurit ovat yhden askeleen päässä.`);
}

function order(r: Rng, view: 'numbers' | 'amounts', descending = false) {
  const values = descending ? r.pick([[12, 21, 18, 21, 9], [15, 5, 15, 23, 28]] as const)
    : view === 'numbers' ? r.pick([[12, 21, 19, 9, 22], [13, 31, 23, 3, 30]] as const)
      : r.pick([[4, 8, 4, 12, 6], [3, 9, 11, 9, 6]] as const);
  const cards = r.shuffle(values.map((value, i) => ({ id: 'ABCDE'[i]!, value })));
  return item({ mode: 'order', cards, descending, view }, comparison, [
    given('Suunta', descending ? 'Suurimmasta pienimpään' : 'Pienimmästä suurimpaan'),
  ], 'Valitse kortit yksi kerrallaan pyydettyyn järjestykseen. Käytä jokaista korttia kerran.',
  'Vertaa ensin kymmeniä ja sitten ykkösiä. Saman suuruiset kortit voivat vaihtaa keskenään paikkaa.',
  'Tarkista jokainen vierekkäinen pari. Yhtä suuret luvut voivat olla kummassa järjestyksessä tahansa.');
}

function meaning(r: Rng, variation: 'ordinal' | 'measure' | 'harbor') {
  const count = r.pick([3, 4, 5, 6]);
  const object = variation === 'harbor' ? 'kaisla' : 'lehti';
  const target = { id: 'make', text: variation === 'harbor' ? `Pakkaa ${count} kaislaa.` : `Rakenna ${count} lehtipaikkaa.`, meaning: 'quantity' as const };
  const cards: Extract<NumberMode, { mode: 'meaning' }>['cards'] = r.shuffle([
    target, { id: 'number', text: `Lautta numero ${count}.`, meaning: 'identifier' },
    { id: 'place', text: `Jonon ${count}. vene.`, meaning: 'ordinal' },
    { id: 'rope', text: `Köysi on ${count} metriä pitkä.`, meaning: 'length' },
    ...(variation === 'measure' ? [{ id: 'leaves', text: 'Korissa on 2 käpyä.', meaning: 'quantity' as const }] : []),
  ]);
  return item({ mode: 'meaning', cards, target: target.id, count, object }, role, [],
    'Valitse kortit, joissa luku kertoo kohteiden määrän. Rakenna sitten pyydetty joukko.',
    'Kysy jokaisesta kortista, kertooko luku kuinka monta, monesko, minkä pituinen vai minkä niminen.',
    `Rakennettava määrä on ${count}. Sama numero voi toisessa kortissa kertoa järjestyksen, pituuden tai tunnuksen.`);
}

function ordinal(r: Rng, fromEnd: boolean, vertical = false) {
  const first = r.shuffle(vertical ? ['Omena', 'Päärynä', 'Luumu', 'Mandariini'] : ['Aava', 'Loikka', 'Sulka', 'Majava']);
  const changed = [...first.slice(1), first[0]!];
  const place = r.pick([2, 3]);
  return item({ mode: 'ordinal', first, changed, place, fromEnd, vertical, changedFromEnd: !fromEnd }, ordinalContext, [
    given('Etsittävä vuoro', `${place}. paikka`),
  ], 'Valitse etsittävä kohde nimetystä aloituspäästä. Katso sitten saman kohteen paikka uudessa jonossa.',
  'Ensimmäinen kohde on heti nimetyssä päässä. Laske siitä eteenpäin.',
  'Sama kohde voi saada eri järjestysnumeron, kun jono tai nimetty aloituspää vaihtuu.');
}

function parity(r: Rng, odd: boolean, transfer = false) {
  const count = transfer ? r.pick([6, 7, 10, 11]) : odd ? r.pick([5, 7, 9]) : r.pick([4, 6, 8]);
  return item({ mode: 'pair', activity: 'parity', count, object: transfer ? 'simpukka' : 'lehti', dispersed: odd }, ordinalContext, [
    ...(transfer ? [given('Numeromerkintä', String(count))] : []),
  ], 'Valitse kaksi vapaata kohdetta kerrallaan pariksi. Merkitse ilman paria jääneet ja luokittele määrä.',
  'Parissa on kaksi. Käytä kutakin kohdetta vain kerran.',
  count % 2 ? 'Yksi kohde jäi ilman paria. Määrä on pariton.' : 'Jokainen kohde sai parin. Määrä on parillinen.');
}

function difference(r: Rng, equal: boolean, bars = false) {
  const [a, b] = equal ? r.pick([[4, 4], [5, 5], [6, 6]] as const) : bars ? r.pick([[7, 4], [5, 8], [8, 6]] as const)
    : r.pick([[5, 3], [4, 6], [7, 4]] as const);
  return item({ mode: 'pair', activity: 'difference', a, b, object: 'kaisla', bars }, comparison, [
    given('Vertailtava asia', bars ? 'Samaan alkukohtaan asetetut pituuspalkit' : 'Aavan ja Loikan kaislat'),
  ], 'Yhdistä aina yksi kohde kummastakin joukosta. Merkitse, kummalla on enemmän, ja kirjoita erotuslasku.',
  'Kohteita ei poisteta. Pienemmän joukon loppu näyttää, kuinka monta suuremmassa jää ilman paria.',
  `${Math.max(a, b)} − ${Math.min(a, b)} = ${Math.abs(a - b)}. Vähennyslasku voi kertoa kahden määrän eron.`);
}

function commute(r: Rng, repair: boolean, symbolic = false) {
  const counts = symbolic ? r.pick([[12, 7], [15, 8], [9, 14]] as const) : r.pick([[3, 5], [2, 6], [4, 7]] as const);
  return item({ mode: 'add-law', activity: 'commute', counts, symbolic }, addition, [
    ...(repair ? [given('Loikan ajatus', 'Kun ensimmäinen kori vaihtuu, myös summan täytyy vaihtua. Tarkista.')] : []),
    ...(symbolic ? [given('Toimituslaput', `${counts[0]} ja ${counts[1]}`)] : []),
  ], 'Avaa molemmat saapumisjärjestykset. Kirjoita määrät oikeaan järjestykseen ja laske molemmat summat.',
  'Korien paikat vaihtuvat. Yksikään kohde ei katoa eikä tule lisää.',
  `${counts[0]} + ${counts[1]} = ${counts[1]} + ${counts[0]}. Vaihdannaisuus muuttaa järjestyksen, ei summaa.`);
}

function associate(r: Rng, tens: boolean, transfer = false) {
  const counts = transfer ? r.pick([[3, 7, 6], [4, 8, 2], [5, 3, 7]] as const)
    : tens ? r.pick([[4, 6, 3], [2, 3, 7], [5, 5, 4]] as const) : r.pick([[2, 4, 3], [3, 4, 5], [5, 2, 4]] as const);
  return item({ mode: 'add-law', activity: 'associate', counts, preferred: tens || transfer }, addition, [],
    'Avaa molemmat ryhmittelyt. Kirjoita kolme määrää, sulkujen summa ja koko summa kummallakin tavalla.',
    'Katso, mitkä kaksi ryhmää ovat kehyksessä. Molemmissa laskuissa kaikki kolme tulevat mukaan.',
    'Sulkujen paikka muuttaa ensin yhteen laskettavat määrät. Jos toinen pari antaa tasakympin, se voi helpottaa laskua.');
}

function operation(r: Rng, story: 'join' | 'take' | 'compare', transfer = false) {
  const [a, b] = story === 'join' ? r.pick([[3, 4], [6, 2], [5, 0]] as const)
    : story === 'take' ? r.pick([[8, 3], [7, 2], [6, 0]] as const) : r.pick([[7, 4], [8, 5], [9, 6]] as const);
  const text = story === 'join' ? `Lautalla on ${a} kaislaa. Mukaan tulee ${b} lisää. Kuinka monta on nyt?`
    : story === 'take' ? `Lautalla on ${a} kaislaa. Siitä otetaan ${b} rantaan. Kuinka monta jää?`
      : `Aavalla on ${a} kaislaa ja Loikalla ${b}. Kuinka monta enemmän Aavalla on?`;
  return item({ mode: 'operation', story, a, b, object: 'kaisla' }, operationContext, [given(transfer ? 'Uusi satama' : 'Tilanne', text)],
    'Valitse tilanteeseen sopiva laskutoimitus. Kirjoita sen luvut ja laske tulos.',
    'Kysy mitä tapahtui tai mitä verrataan. Yksittäinen sana ei yksin kerro laskutoimitusta.',
    story === 'join' ? 'Määrät yhdistetään, joten yhteenlasku kuvaa tilannetta.'
      : story === 'take' ? 'Lähtömäärästä otetaan osa, joten vähennyslasku kuvaa tilannetta.'
        : 'Enemmän-kysymys etsii kahden määrän eroa. Vähennyslasku kertoo eron.');
}

const sign = (n: number) => (n > 0 ? '+' : '') + String(n).replace('-', '−');
function movement(r: Rng, crossing: boolean, transfer = false) {
  const [start, delta] = transfer ? r.pick([[3, -6], [5, -7], [2, -5]] as const)
    : crossing ? r.pick([[-3, 6], [-4, 5], [-2, 6]] as const) : r.pick([[-3, -3], [2, 4], [6, -3]] as const);
  return item({ mode: 'move', start, delta, min: -8, max: 8 }, signed, [
    given('Lähtöarvo', String(start).replace('-', '−')),
    given('Muutos', crossing && !transfer ? `Nouse ${delta} yksikköä` : sign(delta)),
  ], 'Kulje lukusuoralla lähtöarvosta muutoksen verran. Kirjoita uusi arvo.',
  'Nousu vie oikealle. Lasku vie vasemmalle. Nollan kohdalla ei tarvitse pysähtyä.',
  `Reitti alkaa luvusta ${String(start).replace('-', '−')}. Muutoksen ${sign(delta)} jälkeen arvo on ${String(start + delta).replace('-', '−')}.`);
}

const cardinalInstruction = { north: 'pohjoiseen', east: 'itään', south: 'etelään', west: 'länteen' };
const actorInstruction = { forward: 'eteen', back: 'taakse', left: 'vasemmalle', right: 'oikealle' };
function route(r: Rng, actor: boolean, transfer = false) {
  const heading: Direction = transfer ? r.pick(['south', 'west']) : r.pick(['north', 'east']);
  const origin = { x: 2, y: 2 };
  const relative = r.pick([['left', 'forward'], ['right', 'back'], ['forward', 'right']] as const) satisfies readonly Relative[];
  const fixed = r.pick([['east', 'north'], ['south', 'west'], ['west', 'north']] as const) satisfies readonly Direction[];
  const problem: NumberMode = actor ? { mode: 'route', frame: 'actor', heading, origin, steps: relative }
    : { mode: 'route', frame: 'fixed', heading, origin, steps: fixed };
  const line = actor ? `Loikka katsoo ${cardinalInstruction[heading]}. Kulje ensin Loikan ${actorInstruction[relative[0]]}, sitten Loikan ${actorInstruction[relative[1]]}. Loikka katsoo koko reitin samaan suuntaan.`
    : `Käytä kartan suuntia. Pohjoinen on ylöspäin. Kulje ensin ${cardinalInstruction[fixed[0]]}, sitten ${cardinalInstruction[fixed[1]]}.`;
  return item(problem, directions, [
    given('Viitekehys', actor ? 'Loikan oma katselusuunta' : 'Kartan kiinteät suunnat'),
    given('Katselusuunta', compassNames[heading]),
  ], line, actor ? 'Asetu mielessäsi Loikan suuntaan. Hahmon vasen voi olla kartalla eri suunnassa.'
    : 'Kartan pohjoinen on aina ylöspäin, riippumatta Loikan suunnasta.',
  actor ? 'Hahmon vasen ja oikea luetaan hänen omasta katselusuunnastaan. Kartta pysyy paikallaan.'
    : 'Kartan suunnat pysyvät samoina, vaikka hahmo katsoo eri suuntaan.');
}

const defs: readonly Definition[] = [
  {
    id: 'M-NUM-04', stop: 'Viiden lehden salaisuus', icon: '❧', intro: 'Aava näkee ruovikon lehdet pieninä ryhminä.',
    goal: 'Osaat kuvata näkyvät ryhmät osina ja laskea yhteismäärän.', reward: 'Loikka täyttää sopivan kokoisen lautan yhdellä siirrolla.',
    produceWhat: 'ryhmämäärien ja niiden summan tuottamista',
    families: [['read-dice-clusters', r => grouped(r, 'dice')], ['read-short-rows', r => grouped(r, 'rows')]], transfer: r => grouped(r, 'uneven'),
    limit: 'Arvioidaan näkyvien ryhmien määrät ja niiden summa. Laskemisen sisäistä tapaa ei päätellä.',
  },
  {
    id: 'M-NUM-05', stop: 'Sopivan kokoinen lehtikori', icon: '≈', intro: 'Aava tarvitsee rannalle sopivan kokoisen keruukorin.',
    goal: 'Osaat arvioida joukon koon ja verrata arviota ryhmiteltyyn määrään.', reward: 'Kerääjiä odottaa sopivan kokoinen kori.',
    families: [['estimate-loose-objects', r => estimate(r, 'loose')], ['estimate-rough-clusters', r => estimate(r, 'clusters')]], transfer: r => estimate(r, 'sizes'),
    limit: 'Näyttö koskee ennen paljastusta lukittua arvioaluetta ja sen vertailua tarkkaan määrään. Mielensisäistä laskutapaa ei varmisteta eikä arviointia ajasteta.',
  },
  {
    id: 'M-NUM-09', stop: 'Keskimmäisen kiven naapurit', icon: '↔', intro: 'Loikka etsii numerokiven naapurit molemmista suunnista.',
    goal: 'Osaat nimetä luonnollisen luvun edeltäjän ja seuraajan.', reward: 'Kaksi naapurikiveä täydentää polun.',
    families: [['neighbors-on-path', r => neighbors(r, 'path')], ['neighbors-zero-boundary', r => neighbors(r, 'quay')]], transfer: r => neighbors(r, 'cards'),
    limit: 'Luonnolliset luvut alkavat nollasta. Yhden edeltäjä on nolla, ja nollalla ei tässä joukossa ole edeltäjää.',
  },
  {
    id: 'M-NUM-11', stop: 'Laiturien rauhallinen jono', icon: '≦', intro: 'Aava haluaa järjestää laiturien määräkortit rauhalliselle rantakierrokselle.',
    goal: 'Osaat järjestää luonnollisia lukuja ja huomata yhtä suuret määrät.', reward: 'Määräkortit muodostavat selkeän reitin.',
    families: [['order-place-value-cards', r => order(r, 'numbers')], ['order-equal-amount-cards', r => order(r, 'amounts')]], transfer: r => order(r, 'numbers', true),
    limit: 'Käytetään pieniä luonnollisia lukuja. Yhtä suurten korttien keskinäinen järjestys on vapaa.',
  },
  {
    id: 'M-NUM-12', stop: 'Mitä kolme kertoo?', icon: '◉', intro: 'Loikka kysyy, tarkoittaako lapun numero määrää, paikkaa vai nimeä.',
    goal: 'Osaat tunnistaa määrää kuvaavan luvun ja rakentaa sitä vastaavan joukon.', reward: 'Viestissä pyydetty määrä paikkoja valmistuu.',
    families: [['separate-quantity-from-position', r => meaning(r, 'ordinal')], ['separate-quantity-from-measure', r => meaning(r, 'measure')]], transfer: r => meaning(r, 'harbor'),
    limit: 'Valitaan lukumäärää ilmaisevat kortit ja rakennetaan yhden määrä. Arvio kohdistuu valittuun merkitykseen ja rakennettuun joukkoon.',
  },
  {
    id: 'M-NUM-13', stop: 'Aavan paikka jonossa', icon: '⟿', intro: 'Lehtiveneet odottavat pääsyä poukamaan. Aava etsii oikeaa vuoroa.',
    goal: 'Osaat lukea järjestysnumeron nimetystä päästä ja löytää kohteen uudesta jonosta.', reward: 'Oikea vene löytää vuoropaikkansa.',
    families: [['read-queue-from-left', r => ordinal(r, false)], ['read-queue-from-right', r => ordinal(r, true)]], transfer: r => ordinal(r, true, true),
    limit: 'Arvioidaan nimetty aloituspää ja saman kohteen uusi järjestysnumero. Siirrossa jono on pystysuuntainen.',
  },
  {
    id: 'M-NUM-15', stop: 'Vierasparit laiturilla', icon: '◌', intro: 'Aava asettelee vieraille paripaikkoja ja yhden paikan yksin tulevalle.',
    goal: 'Osaat muodostaa parit ja erottaa parillisen määrän parittomasta.', reward: 'Vieraat löytävät sekä paripaikat että yksittäisen istuimen.',
    produceWhat: 'omien parien muodostamista ja ilman paria jäävän määrän merkitsemistä',
    families: [['pair-every-seat', r => parity(r, false)], ['pair-with-one-left', r => parity(r, true)]], transfer: r => parity(r, false, true),
    limit: 'Kaikki kelvolliset täydet paritukset hyväksytään. Määrä ja luokka arvioidaan parien jälkeen.',
  },
  {
    id: 'M-SUB-02', stop: 'Kahden lautan ero', icon: '≠', intro: 'Aava ja Loikka vertaavat lauttojen kaisloja siirtämättä kumpaakaan lastia.',
    goal: 'Osaat merkitä kahden määrän vastaavuuden ja kirjoittaa niiden erotuksen.', reward: 'Erotus kertoo täydennyslastin tarkan koon.',
    families: [['match-unequal-cargo', r => difference(r, false)], ['match-equal-cargo', r => difference(r, true)]], transfer: r => difference(r, false, true),
    limit: 'Arvioidaan yksi yhteen -parit, suurempi määrä ja erotuslasku. Tasamäärän erotus on nolla.',
  },
  {
    id: 'M-ADD-COMM', stop: 'Kumpi kori ensin?', icon: '⇆', intro: 'Aava ja Loikka vaihtavat saapumisjärjestystä mutta tuovat samat korit.',
    goal: 'Osaat tuottaa kaksi yhteenlaskua samoista määristä eri järjestyksissä.', reward: 'Satama hyväksyy kummankin saapumisjärjestyksen.',
    families: [['swap-cargo-order', r => commute(r, false)], ['test-swapped-sum-claim', r => commute(r, true)]], transfer: r => commute(r, false, true),
    limit: 'Molemmat operandijärjestykset ja summat tuotetaan. Sama joukko säilyy mallissa.',
  },
  {
    id: 'M-ADD-ASSOC', stop: 'Kolmen korin yhteinen tauko', icon: '▤', intro: 'Kolme retkiryhmää tuo kaislansa. Aava yhdistää ensin kaksi ryhmää kerrallaan.',
    goal: 'Osaat yhdistää kolme yhteenlaskettavaa kahdella ryhmittelyllä.', reward: 'Kaikki ryhmät mahtuvat samaan veneeseen.',
    families: [['compare-three-addend-groups', r => associate(r, false)], ['find-a-helpful-ten', r => associate(r, true)]], transfer: r => associate(r, true, true),
    limit: 'Arvioidaan molempien ryhmittelyjen sisäsumma, samat kolme määrää ja lopputulos. Oppija voi valita itselleen helpomman ryhmittelyn.',
  },
  {
    id: 'M-ADD-SUB-SELECT', stop: 'Mitä satamassa tapahtui?', icon: '±', intro: 'Satamassa määrät voivat yhdistyä, pienentyä tai tulla verratuiksi.',
    goal: 'Osaat valita laskutoimituksen tilanteesta ja laskea oikeilla määrillä.', reward: 'Laskumalli ohjaa pyydetyn lastauksen.',
    families: [['choose-joining-operation', r => operation(r, 'join')], ['choose-removing-operation', r => operation(r, 'take')]], transfer: r => operation(r, 'compare', true),
    limit: 'Sekä toiminto että operaatioon sijoitetut luvut tarkistetaan, vaikka nollalla molemmista operaatioista tulisi sama arvo.',
  },
  {
    id: 'M-NEG-04', stop: 'Aavan muuttuva mittaus', icon: '±', intro: 'Aava merkitsee lähtöarvon ja muutoksen. Loikka seuraa sitä nollan kummallakin puolella.',
    goal: 'Osaat tehdä suunnatun muutoksen lukusuoralla ja ilmaista uuden arvon.', reward: 'Mittausketju kertoo lähtöarvon, muutoksen ja uuden arvon.',
    families: [['read-signed-change', r => movement(r, false)], ['cross-zero-when-rising', r => movement(r, true)]], transfer: r => movement(r, true, true),
    limit: 'Tarkistetaan lähtöpiste, kaikki yksikköaskeleet ja lopullinen arvo kokonaislukuvälillä −8–8.',
  },
  {
    id: 'M-GEO-03', stop: 'Kummasta suunnasta tulet?', icon: '🧭', intro: 'Aava antaa Loikalle reittiohjeen, ja lähtösuunnan nuoli pysyy näkyvissä.',
    goal: 'Osaat erottaa kartan kiinteän suunnan ja hahmon oman suunnan.', reward: 'Ystävät kohtaavat sovitulla rantapenkillä.',
    families: [['follow-fixed-map-directions', r => route(r, false)], ['follow-actor-directions', r => route(r, true)]], transfer: r => route(r, true, true),
    limit: 'Sama kirjallinen reittiohje on kuunneltavissa. Näyttö koskee suuntia valitussa viitekehyksessä, ilman kamera- tai kuuntelupakkoa.',
  },
];

type NumberSpec = Omit<NodeSpec, 'item'> & { item: (r: Rng, phase: Phase) => NumberItem };
function lesson(def: Definition): NumberSpec {
  const rev = `exp690-number-journey-${def.id.toLowerCase()}-v1`;
  const { families, transfer, limit: _limit, ...meta } = def;
  return {
    ...meta, rev, validRevs: [rev],
    ...(def.produceWhat ? { produce: [...families.map(([tag]) => tag), 'transfer'] } : {}),
    demo(r) {
      const example = families[0][1](r);
      return [{ say: example.hint!, scene: example.scene! }, { say: example.explain, scene: numberJourneyExample(example.task) }];
    },
    item(r, phase) {
      const [tag, author] = phase === 'transfer' ? ['transfer', transfer] as const : r.pick(families);
      return { ...author(r), tag };
    },
  };
}

export const numberJourneySpecs: NumberSpec[] = defs.map(lesson);
export const numberJourneyEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(defs.map(def => [def.id, { families: def.families.map(([tag]) => tag), limit: def.limit }]));
