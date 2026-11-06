import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Phase } from '../engine/types';
import type { Affine, Factored, LinearEquation, RelationAxis, RelationContext, RelationMode, RelationPoint, PlottedFunction, RelationWorkshopTask } from './models/relation-workshop';
import { relationWorkshopBoard, relationWorkshopExample } from './scenes/relation-workshop';

type RelationItem = Omit<Item, 'task'> & { task: RelationWorkshopTask };
type Author = (r: Rng) => Omit<RelationItem, 'tag'>;
type Definition = Pick<NodeSpec, 'id' | 'stop' | 'icon' | 'intro' | 'goal' | 'reward' | 'produceWhat'> & {
  families: readonly [readonly [string, Author], readonly [string, Author]];
  transfer: Author;
  limit: string;
};
const context = (title: string, ...skills: string[]): RelationContext => ({ title, skills });
const dependency = context('Taulukon muuttujat ja riippuvuus', 'M79-DEP-01');
const equations = context('Sijoittaminen yhtälöön', 'M-ALG-06', 'M79-EQ1-SOLVE');
const lines = context('Yhteinen lukupari ja suoran kuvaaja', 'M79-SYSTEM-01', 'M79-LINE-GRAPH');
const functions = context('Funktion lauseke ja kuvaaja', 'M79-FUNC-GRAPH');
const graph: RelationAxis = { x: [-5, 5], y: [-6, 6], xStep: 1, yStep: 1 };
const fine: RelationAxis = { x: [-4, 4], y: [-6, 6], xStep: .5, yStep: 1 };
const textPoint = (x: number, y: number): RelationPoint => ({ x: String(x), y: String(y) });
const scalar = (num: number, den = 1) => num % den === 0 ? String(num / den) : `${num}/${den}`;

function item(problem: RelationMode, familiar: RelationContext, say: string, hint: string, explain: string): ReturnType<Author> {
  const task: RelationWorkshopTask = { kind: 'relation-workshop', context: familiar, ...problem };
  return { task, scene: relationWorkshopBoard(task), say, hint, explain };
}
function direct(r: Rng, variation: 'ratio' | 'offset' | 'speed') {
  const step = r.int(1, 4), numerator = r.int(2, 11), denominator = r.pick([1, 1, 2, 3]);
  const offset = variation === 'offset' ? r.int(1, 6) : 0;
  const input = [0, step, step + 1, step + 3];
  const rows = input.map(x => ({ x: String(x), y: scalar(numerator * x + offset * denominator, denominator) }));
  const xName = variation === 'speed' ? 'Aika (h)' : 'Laitureita (kpl)';
  const yName = variation === 'speed' ? 'Matka (km)' : 'Näytteitä (kpl)';
  const setting = variation === 'speed' ? 'Vene liikkuu koko mallimatkan samalla nopeudella ja matkamittari alkaa nollasta.' :
    variation === 'offset' ? 'Loikan suunnitelmassa on jo ennen lähtöä valmiita näytteitä. Tutki taulukon suhdetta.' :
      'Jokaiselta samanlaiselta laiturilta tuodaan mallissa sama määrä. Nollan tilanne on myös näkyvissä.';
  // Sample counts are whole objects. Distance may be fractional.
  if (variation !== 'speed') for (const row of rows) row.y = String(numerator * Number(row.x) + offset);
  return item({ mode: 'direct', rows, xName, yName, setting }, dependency,
    'Laske jokainen määritelty suhde y/x. Kirjaa nollan syötteen tulos erikseen ja päättele, sopiiko taulukko suoraan verrannollisuuteen.',
    'Nollalla ei jaeta. Vertaa muiden rivien osamääriä ja tarkista kohdassa x = 0 funktion arvo.',
    'Suorassa verrannollisuudessa osamäärä on vakio kaikilla nollasta poikkeavilla syötteillä. Kiinteä alkulisä muuttaa mallia.');
}
function inverse(r: Rng, variation: 'work' | 'delay' | 'area') {
  const x = r.pick([[1, 2, 4], [2, 3, 6], [1, 3, 6], [2, 4, 8]] as const);
  const amount = r.int(8, 30), delay = variation === 'delay' ? r.int(1, 5) : 0;
  const rows = x.map(value => ({ x: String(value), y: scalar(amount + delay * value, value) }));
  const area = variation === 'area';
  return item({ mode: 'inverse', rows, xName: area ? 'Leveys (m)' : 'Pumppuja (kpl)', yName: area ? 'Pituus (m)' : 'Aika (h)',
    condition: area ? 'area' : 'work', setting: area ? 'Suorakulmiolla on mallissa sama pinta-ala. Molemmat sivut ovat positiivisia.'
      : 'Ihannemallissa samanlaiset pumput tekevät saman kokonaistyön yhtä tehokkaasti ilman viiveitä. Tarkista, sopiiko annettu taulukko malliin.' }, dependency,
    'Laske x·y kaikista riveistä. Tarkista vakiotulo, x = 0 ja ihannemallin vakioehto.',
    'Pelkkä pienenevä aika ei riitä. Kerro jokaisen parin x ja y keskenään.',
    'Vakiotulo vastaa samaa kokonaismäärää. Mallin positiivista syötettä ei voi korvata nollalla.');
}
function atSolution(a: number, b: number, x: number, y: number): LinearEquation {
  return [a, b, a * x + b * y];
}
function concept(r: Rng, variation: 'shared' | 'nonunique' | 'tickets') {
  const x = r.int(1, 5), y = r.int(2, 6);
  const a = r.int(1, 3), b = r.int(1, 4);
  const first = variation === 'tickets' ? atSolution(1, 1, x, y) : atSolution(a, b, x, y);
  const factor = r.pick([-3, -2, 2, 3]), delta = r.chance(.5) ? 0 : r.int(1, 4);
  const second: LinearEquation = variation === 'nonunique' ? [first[0] * factor, first[1] * factor, first[2] * factor + delta] :
    variation === 'tickets' ? atSolution(2, r.int(3, 6), x, y) : atSolution(a + 1, -b, x, y);
  const candidates = r.shuffle([textPoint(x, y), textPoint(x + first[1], y - first[0]), textPoint(x - second[1], y + second[0])]);
  const setting = variation === 'tickets' ? 'x on ensimmäisten ja y toisten lippujen määrä. Ensimmäinen yhtälö kertoo lippujen määrän, toinen yhteishinnan.'
    : 'Ensimmäinen yhtälö kuvaa Aavan ehtoa. Toinen kuvaa majavan ehtoa. Saman lukuparin täytyy sopia molempiin.';
  return item({ mode: 'system-concept', equations: [first, second], candidates, setting }, equations,
    'Laske kummankin yhtälön vasen puoli jokaisella lukuparilla. Merkitse yhteiset ratkaisut ja koko ratkaisujoukon laji.',
    'Sijoita sama x ja sama y molempiin ehtoihin. Jos toisen vasen puoli on ensimmäisen monikerta, vertaa myös oikeita puolia.',
    'Yksi pari voi täyttää molemmat ehdot. Jos suorat ovat samat, yhteisiä pareja on äärettömästi. Eri yhdensuuntaisilla suorilla niitä ei ole.');
}
function algebra(r: Rng, method: 'eliminate' | 'substitute' | 'either') {
  const x = r.pick([-3, -2, -1, 1, 2, 4]), y = r.pick([-4, -2, 1, 3, 5]);
  const a = r.int(2, 5), b = r.pick([-3, -2, 2, 3, 4]);
  const eq = method === 'eliminate' ? [atSolution(a, b, x, y), atSolution(a, b + 5, x, y)] as const :
    method === 'substitute' ? [atSolution(r.pick([-1, 1]), b, x, y), atSolution(a, b > 0 ? -2 : 3, x, y)] as const :
      [atSolution(2 * a, 2 * b, x / 2, y / 2), atSolution(-2 * (a + 1), 2 * b, x / 2, y / 2)] as const;
  // With a negative unit coefficient and b = 2, the opposing slopes still have nonzero determinant since a ≥ 2.
  return item({ mode: 'system-algebra', method, equations: eq, setting: 'Aava tarvitsee tarkan parin ilman kuvaajasta pyöristämistä.' },
    context('Yhteinen ratkaisu ja yhtälön ratkaiseminen', 'M79-SYSTEM-01', 'M79-EQ1-SOLVE'),
    method === 'eliminate' ? 'Eliminoi x tai y. Kirjaa kertoimet, syntynyt yhtälö ja ratkaisu. Tarkista molemmat alkuperäiset ehdot.'
      : method === 'substitute' ? 'Erota x tai y kummasta tahansa sopivasta yhtälöstä ja sijoita toiseen. Tarkista molemmat alkuperäiset ehdot.'
        : 'Valitse eliminointi tai sijoitus. Tuota välivaihe, tarkka lukupari ja molemmat tarkistuslaskut.',
    'Kerro koko yhtälö, myös oikea puoli. Sijoituksessa kopioi erotetun muuttujan koko lauseke toiseen yhtälöön.',
    'Yhden tuntemattoman yhtälö antaa yhden arvon. Sijoita molemmat arvot kumpaankin alkuperäiseen yhtälöön.');
}
function systemGraph(r: Rng, variation: 'cross' | 'parallel' | 'transfer') {
  const axis = variation === 'transfer' ? fine : graph;
  const x = variation === 'transfer' ? -r.pick([.5, 1.5, 2.5, 3.5]) : r.pick([-3, -2, 1, 2, 3]);
  const y = variation === 'transfer' ? r.pick([1, 2, 3, 4]) : r.pick([-3, -2, 1, 2, 3]);
  const vertical = r.chance(.5);
  const a = variation === 'transfer' ? r.pick([2, -2]) : r.pick([-1, 1, 2]);
  const slope = r.pick([-1, 1]);
  const intercept = r.pick([-3, -2, -1, 1, 2, 3]);
  const same = r.chance(.5), shift = same ? 0 : r.pick([-2, -1, 1, 2]);
  const first: LinearEquation = variation === 'parallel' ? (vertical ? [1, 0, intercept] : [slope, -1, intercept]) :
    vertical ? [variation === 'transfer' ? 2 : 1, 0, x * (variation === 'transfer' ? 2 : 1)] : atSolution(a, 1, x, y);
  const second: LinearEquation = variation === 'parallel' ? [2 * first[0], 2 * first[1], 2 * (first[2] + shift)] :
    atSolution(vertical ? a : -a, 1, x, y);
  return item({ mode: 'system-graph', equations: [first, second], axis, setting: 'Yhtenäinen viiva on ensimmäinen ehto. Katkoviiva on toinen ehto.' },
    lines, 'Lue yhteinen piste tai selvitä, ovatko suorat samat tai eri yhdensuuntaiset. Kirjaa pyydetyt pisteet ja tarkistukset.',
    'Yhtenäinen ja katkoviiva voivat olla samassa kohdassa. Pystysuoralla x on sama kaikissa pisteissä.',
    'Yhteinen piste toteuttaa molemmat yhtälöt. Samalla suoralla on enemmän kuin yksi yhteinen piste, yhdensuuntaisilla eri suorilla ei yhtään.');
}
function intercept(r: Rng, variation: 'formula' | 'plot' | 'orders') {
  const fn: Affine = { kind: 'affine', a: r.pick([-2, -1, 1, 2]), b: r.pick([-4, -3, -2, 1, 2, 3, 4]) };
  const order = variation === 'orders';
  if (order) { fn.a = r.int(1, 3); fn.b = r.int(1, 5); }
  return item({ mode: 'intercept', fn, axis: graph, view: variation === 'plot' ? 'graph' : 'formula',
    setting: order ? 'x on tilattujen osien määrä. y on kokonaishinta, johon kuuluu kiinteä aloitusosa.'
      : 'x on aika kokeen alusta. y kertoo pinnan korkeuden vertailutasosta.', unit: order ? '€' : 'cm' },
    context('Suoran kuvaaja ja koordinaatit', 'M79-LINE-GRAPH'),
    'Kirjaa f(0), sijoita y-akselin leikkauspiste ja ilmoita mallin alkuarvo.',
    'Y-akselilla x = 0. X-akselin kohdalla y = 0. Nämä ovat eri kysymyksiä.',
    'Vakiotermi on f(0). Pisteen x-koordinaatti on nolla ja y-koordinaatti kertoo tilanteen alkuarvon.');
}
function affine(r: Rng, fraction = false): Affine {
  const a = fraction ? r.pick([-6, -4, -2, 2, 4, 6]) : r.pick([-3, -2, -1, 1, 2, 3]);
  const root = fraction ? r.pick([-3.5, -2.5, -1.5, -.5, .5, 1.5, 2.5, 3.5]) : r.pick([-4, -3, -2, -1, 1, 2, 3, 4]);
  return { kind: 'affine', a, b: -a * root };
}
function factored(r: Rng): Factored {
  const first = r.pick([-3, -2, -1, 0]), second = r.pick([1, 2, 3, 4]);
  const a = r.pick([-2, -1, 1, 2]), c = r.pick([1, 2]);
  return { kind: 'factored', a, b: -a * first, c, d: -c * second };
}
function zeroCalc(r: Rng, variation: 'line' | 'factors' | 'fraction') {
  const fn = variation === 'factors' ? factored(r) : affine(r, variation === 'fraction');
  return item({ mode: 'zero-calc', fn, setting: 'Majakka tarvitsee x-arvon, jossa mallin poikkeama on nolla.' }, functions,
    'Muodosta yhtälö tai yhtälöt ennen jakoa. Ratkaise nollakohdat ja tarkista jokainen sijoittamalla.',
    fn.kind === 'factored' ? 'Tulo on nolla, kun vähintään yksi tekijä on nolla. Ratkaise kummankin tekijän yhtälö erikseen.'
      : 'Aseta koko funktion arvo nollaksi. Siirrä vakiotermi toiselle puolelle ja jaa x:n kertoimella.',
    'Nollakohta on x-arvo. Sijoittamalla se alkuperäiseen funktioon saadaan tulokseksi nolla.');
}
function zeroAxis(fn: PlottedFunction): RelationAxis {
  if (fn.kind === 'affine') return { ...fine, x: [-5, 5] };
  if (fn.kind === 'raised-square') return { ...graph, y: [-2, 10], yStep: 2 };
  const difference = fn.b / fn.a - fn.d / fn.c;
  const vertexMagnitude = Math.abs(fn.a * fn.c) * (difference / 2) ** 2;
  const step = vertexMagnitude >= 25 ? 10 : vertexMagnitude >= 10 ? 5 : 2;
  const depth = (Math.ceil(vertexMagnitude / step) + 1) * step;
  return { ...graph, y: fn.a * fn.c > 0 ? [-depth, 2 * step] : [-2 * step, depth], yStep: step };
}
function zeroGraph(r: Rng, variation: 'line' | 'curve' | 'transfer') {
  const fn = variation === 'line' ? affine(r, r.chance(.5)) :
    variation === 'curve' && r.chance(.5) ? { kind: 'raised-square' as const, centre: r.int(-3, 3), rise: r.int(1, 3) } :
      variation === 'transfer' && r.chance(.5) ? { kind: 'affine' as const, a: 2, b: r.pick([3, 5, 7]) } : factored(r);
  const axis = zeroAxis(fn);
  return item({ mode: 'zero-graph', fn, axis, setting: 'Lue vain näkyvä x-väli. Tämän pajan kuvaajissa nollakohta on yksittäinen piste tai nollakohtia ei ole.' }, functions,
    'Merkitse x-koordinaatit, joissa kuvaaja kohtaa x-akselin. Merkitse erikseen, jos näkyviä nollakohtia ei ole.',
    'Nollakohdassa y = 0. Y-akselin leikkaus kertoo funktion arvon kohdassa x = 0.',
    'Jokainen näkyvä x-akselin kohtaus antaa yhden nollakohdan x-arvon. Jos kuvaaja ei kohtaa akselia, tältä väliltä ei löydy nollakohtaa.');
}
function zeroIntegrated(r: Rng, variation: 'line' | 'factors' | 'profit') {
  const fn = variation === 'profit' ? { kind: 'affine' as const, a: r.pick([2, 4, 6]), b: 0 }
    : variation === 'factors' ? factored(r) : affine(r, r.chance(.5));
  if (variation === 'profit') fn.b = -fn.a * r.pick([.5, 1.5, 2.5, 3.5]);
  return item({ mode: 'zero-integration', fn, axis: zeroAxis(fn),
    setting: variation === 'profit' ? 'x on myyty määrä sovitussa mittayksikössä. Kuvaaja näyttää tuoton ja menon erotuksen. Etsi tasatulos.'
      : 'Kuvaaja näyttää veneen poikkeaman sovitusta tasosta. Nollassa reitit kohtaavat.' },
    context('Graafinen ja laskettu nollakohta', 'M79-ZERO-GRAPH', 'M79-ZERO-CALC'),
    'Lue ja lukitse kuvaajan nollakohdat. Ratkaise samat kohdat avautuvasta lausekkeesta ja tarkista sijoittamalla.',
    'Kuvaajassa luetaan x, kun y on nolla. Laskussa asetetaan f(x) = 0. Vertaa saamiasi x-arvoja.',
    'Kuvaajan x-akselin kohtaus ja laskun ehto f(x) = 0 kuvaavat samaa arvoa. Sijoitus varmistaa yhteyden.');
}

const defs: readonly Definition[] = [
  { id: 'M79-DIRECTPROP', stop: 'Samaa tahtia kasvavat korit', icon: '⇗', intro: 'Aava vertailee laitureita ja niiltä saatuja näytteitä.',
    goal: 'Tunnistat suoran verrannollisuuden vakiosuhteesta ja tarkistat nollan erikseen.', reward: 'Näytekorit saadaan kuljetussuunnitelmaan.',
    produceWhat: 'taulukon osamäärien ja nollan syötteen tuloksen tuottamista',
    families: [['verify-constant-ratio', r => direct(r, 'ratio')], ['reject-fixed-starting-amount', r => direct(r, 'offset')]], transfer: r => direct(r, 'speed'),
    limit: 'Tarkistus kattaa näkyvien rivien suhteet ja mukana olevan nollasyötteen. Havaituista riveistä ei päätellä tuntematonta yleistä sääntöä.' },
  { id: 'M79-INVERSEPROP', stop: 'Sama työ eri määrällä', icon: '↘', intro: 'Yhteinen työ jaetaan mallissa usean samanlaisen pumpun kesken.',
    goal: 'Tunnistat vakiotulon ja käytetyn mallin ehdot.', reward: 'Koemallin säiliö saa suunnitellun tyhjennysajan.',
    produceWhat: 'kunkin parin tuloa ja mallin ehtojen tunnistamista',
    families: [['verify-fixed-work-product', r => inverse(r, 'work')], ['reject-decrease-without-constant-product', r => inverse(r, 'delay')]], transfer: r => inverse(r, 'area'),
    limit: 'Omat tulot tarkistetaan täsmällisesti. Nolla on tämän mallin syötejoukon ulkopuolella. Mallioletusten valinta on tunnistusnäyttö.' },
  { id: 'M79-SYSTEM-01', stop: 'Kahden toiveen kohtaaminen', icon: '⇄', intro: 'Aavalla ja majavalla on koekanavalle kaksi ehtoa.',
    goal: 'Testaat saman parin molemmissa ehdoissa ja erotat ratkaisujoukkojen lajit.', reward: 'Yhteinen koesuunnitelma saa tarkistetut ehdot.',
    produceWhat: 'annettujen parien sijoituksia ja riippuvien yhtälöiden vertailua',
    families: [['test-pairs-against-two-conditions', r => concept(r, 'shared')], ['compare-dependent-equations', r => concept(r, 'nonunique')]], transfer: r => concept(r, 'tickets'),
    limit: 'Sijoitukset tarkistetaan erikseen. Samojen ja eri yhdensuuntaisten suorien erottamisessa verrataan myös skaalattuja oikeita puolia.' },
  { id: 'M79-SYSTEM-ALG', stop: 'Sopimuksen kaksi tuntematonta', icon: '⋈', intro: 'Loikka tarvitsee tarkan ratkaisun suunnittelupöytään.',
    goal: 'Rakennat yhden tuntemattoman välivaiheen ja varmistat parin alkuperäisillä ehdoilla.', reward: 'Yhteinen koesulku saa tarkan sopimuksen.',
    produceWhat: 'oman algebra-askeleen, lukuparin ja molemmat tarkistukset',
    families: [['derive-row-by-elimination', r => algebra(r, 'eliminate')], ['derive-row-by-substitution', r => algebra(r, 'substitute')]], transfer: r => algebra(r, 'either'),
    limit: 'Eliminointi käyttää kahta nollasta poikkeavaa kerrointa. Sijoitus sallii kumman tahansa kelvollisen erottamisen. Siirrossa kumpikin menetelmä käy.' },
  { id: 'M79-SYSTEM-GRAPH', stop: 'Suorien leikkauspiste', icon: '╳', intro: 'Kaksi ehtoa näkyy samassa koordinaatistossa.',
    goal: 'Etsit yhteisen pisteen tai erottelet samat ja eri yhdensuuntaiset suorat.', reward: 'Kartan merkit näyttävät, missä koesulun ehdot kohtaavat.',
    produceWhat: 'omien koordinaattien ja tarkistuslaskujen tuottamista',
    families: [['read-a-shared-intersection', r => systemGraph(r, 'cross')], ['distinguish-parallel-and-coincident-lines', r => systemGraph(r, 'parallel')]], transfer: r => systemGraph(r, 'transfer'),
    limit: 'Kuvaajan pisteet ja molemmat yhtälöt tarkistetaan täsmällisesti. Tekstivastine antaa vastaavat näytepisteet.' },
  { id: 'M79-INTERCEPT', stop: 'Mistä matka alkaa?', icon: '⊢', intro: 'Aava etsii reitin lähtötasoa.',
    goal: 'Yhdistät funktion arvon kohdassa x = 0, y-akselin pisteen ja alkuarvon.', reward: 'Veneen koeloki saa oikean lähtötason.',
    produceWhat: 'funktion arvon, alkuarvon ja y-akselin pisteen tuottamista',
    families: [['substitute-zero-for-intercept', r => intercept(r, 'formula')], ['read-y-axis-intercept', r => intercept(r, 'plot')]], transfer: r => intercept(r, 'orders'),
    limit: 'Tarkistetaan f(0), piste (0, f(0)) ja sama tilanteen alkuarvo. Alkuarvon merkityksen valinta on tunnistusnäyttö.' },
  { id: 'M79-ZERO-CALC', stop: 'Kohta, jota kartta ei erota', icon: 'ƒ', intro: 'Aava ratkaisee tarkan kohtaamiskohdan lausekkeesta.',
    goal: 'Muodostat f(x) = 0 -yhtälön, ratkaiset ja tarkistat sijoittamalla.', reward: 'Majakan tarkka kohtaamisluku saapuu karttaan.',
    produceWhat: 'laskuvaiheen, nollakohtien ja sijoitustarkistusten tuottamista',
    families: [['solve-affine-zero-exactly', r => zeroCalc(r, 'line')], ['use-zero-product-rule', r => zeroCalc(r, 'factors')]], transfer: r => zeroCalc(r, 'fraction'),
    limit: 'Harjoiteltavat lausekkeet ovat affiineja tai kahden lineaaritekijän tuloja. Tekijöiden järjestys on vapaa.' },
  { id: 'M79-ZERO-GRAPH', stop: 'Rantaviivan kohtaaminen', icon: '⟷', intro: 'Loikka etsii kartalta kohtia, joissa poikkeama häviää.',
    goal: 'Luet kaikki näkyvät nollakohdat x-akselilta.', reward: 'Kartta näyttää kohtaamiskohdat tai niiden puuttumisen.',
    produceWhat: 'kuvaajan nollakohtien x-koordinaattien tuottamista',
    families: [['read-single-line-zero', r => zeroGraph(r, 'line')], ['read-curve-zeros-or-none', r => zeroGraph(r, 'curve')]], transfer: r => zeroGraph(r, 'transfer'),
    limit: 'Arviointi kattaa näkyvän välin erilliset nollakohdat. Tässä funktioperheessä kuvaaja ei kulje x-akselilla kokonaista väliä.' },
  { id: 'M79-ZERO', stop: 'Majakan kohtaamishetki', icon: '◈', intro: 'Aava ja Loikka tarkistavat saman paikan kartasta ja laskulla.',
    goal: 'Yhdistät saman funktion lukemasi nollakohdat laskettuihin ja osoitat yhteyden sijoittamalla.', reward: 'Paikallinen majakkamerkki ja vene kohtaavat.',
    produceWhat: 'lukitun kuvaajahavainnon, oman laskun ja tarkan tarkistuksen',
    families: [['link-affine-graph-and-equation', r => zeroIntegrated(r, 'line')], ['link-two-graph-roots-to-factors', r => zeroIntegrated(r, 'factors')]], transfer: r => zeroIntegrated(r, 'profit'),
    limit: 'Kuvaajan oma merkintä lukitaan ennen kaavaa. Laskuvaihe ja f(x) = 0 -sijoitukset osoittavat matemaattisen yhteyden.' },
];

type RelationSpec = Omit<NodeSpec, 'item'> & { item(r: Rng, phase: Phase): RelationItem };
function spec(def: Definition): RelationSpec {
  const { families, transfer, limit: _limit, ...meta } = def;
  const rev = `exp690-relation-workshop-${def.id.toLowerCase()}-v1`;
  return { ...meta, rev, validRevs: [rev], produce: [...families.map(([tag]) => tag), 'transfer'],
    demo(r) { return families.map(([, author]) => {
      const example = author(r);
      return { say: example.explain!, scene: relationWorkshopExample(example.task) };
    }); },
    item(r, phase) {
      const [tag, author] = phase === 'transfer' ? ['transfer', transfer] as const : r.pick(families);
      return { ...author(r), tag };
    },
  };
}
export const relationWorkshopSpecs: RelationSpec[] = defs.map(spec);
export const relationWorkshopEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(defs.map(({ id, families, limit }) => [id, { families: families.map(([tag]) => tag), limit }]));
