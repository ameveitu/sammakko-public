import type { Item, NodeSpec, Phase } from '../engine/types';
import type { Rng } from '../engine/rng';
import { pointId, solutionStatisticsHarbor, type HarborContext, type HarborCoverage, type HarborMode, type HarborRow,
  type HarborRubric, type HarborSite, type HarborSlip, type StatisticsHarborTask } from './models/statistics-harbor';
import { statisticsHarborScene, type StatisticsHarborScene } from './models/statistics-harbor-scene';
import { statisticsHarborBoard, statisticsHarborExample } from './scenes/statistics-harbor';

type HarborItem = Omit<Item, 'task'> & { task: StatisticsHarborTask; sceneModel?: StatisticsHarborScene };
type Author = (r: Rng) => Omit<HarborItem, 'tag'>;
type Definition = Pick<NodeSpec, 'id' | 'stop' | 'icon' | 'intro' | 'goal' | 'reward' | 'produceWhat'> & {
  families: readonly [readonly [string, Author], readonly [string, Author]]; transfer: Author; limit: string;
};
const ctx = (title: string, ...skills: string[]): HarborContext => ({ title, skills });
const collectionContext = ctx('Tutkimuskysymys ja havainto', 'M-DATA-09');
const structuralContext = ctx('Havaintojen järjestäminen', 'M-DATA-10');
const countingContext = ctx('Havaintojen erottaminen ja laskeminen', 'M79-DATA-STRUCT');
const ratioContext = ctx('Frekvenssi ja osa kokonaisesta', 'M79-FREQ', 'M-FRAC-03');
const chartContext = ctx('Taulukon ja diagrammin lukeminen', 'M-DATA-12', 'M79-DATA-STRUCT');
const probabilityContext = ctx('Erilliset alkeistulokset', 'M-PROB-02');
const partContext = ctx('Alkeistulokset ja suhteet', 'M79-PROB-SPACE', 'M-FRAC-03');

function item(problem: HarborMode, context: HarborContext, say: string, hint: string, explain: string): ReturnType<Author> {
  const task: StatisticsHarborTask = { kind: 'statistics-harbor', context, ...problem };
  return { task, scene: statisticsHarborBoard(task), sceneModel: statisticsHarborScene(task), say, hint, explain };
}
const rubric = (prompt: string, a: string, b: string, model: string): HarborRubric => ({
  prompt, model, rubric: [
    { id: 'evidence', label: 'Osoittaa oman havaintonsa tai laskunsa', guide: a },
    { id: 'scope', label: 'Perustelee valinnan ja rajaa päätelmän', guide: b },
  ],
});
const rows = (labels: readonly string[], values: readonly number[]): HarborRow[] =>
  labels.map((label, i) => ({ id: String.fromCharCode(65 + i), label, value: values[i]! }));

const harbors: readonly HarborSite[] = [
  { id: 'A', label: 'Pohjoislaituri', x: -1.5, z: -.65 },
  { id: 'B', label: 'Kalliolaituri', x: 1.48, z: -.65 },
  { id: 'C', label: 'Ruovikkolaituri', x: -.08, z: .52 },
];
const periods = [{ id: 'AM', label: 'Aamu' }, { id: 'PM', label: 'Keskipäivä' }, { id: 'EV', label: 'Ilta' }] as const;
function collection(r: Rng, route: 'shores' | 'times' | 'wind') {
  const times = route === 'times' ? periods.slice(0, 2) : periods;
  const sites = r.shuffle(harbors);
  const coverage: HarborCoverage[] = route === 'times' ?
    harbors.slice(0, 2).flatMap(site => times.map(time => ({ id: pointId(site.id, time.id), label: `${site.label} · ${time.label}`,
      points: [pointId(site.id, time.id)], minimum: 1 }))) :
    [...harbors.map(site => ({ id: site.id, label: site.label, points: times.map(time => pointId(site.id, time.id)), minimum: 1 })),
      ...[times[0]!, times.at(-1)!].map(time => ({ id: time.id, label: time.label, points: sites.map(site => pointId(site.id, time.id)), minimum: 1 }))];
  const question = route === 'times' ? 'Miten laiturikäynnit eroavat aamulla ja keskipäivällä kahdella nimetyllä laiturilla?'
    : route === 'wind' ? 'Mistä tuuli tulee valitsemissamme havaintoikkunoissa? Mukaan tarvitaan jokainen laituri sekä aamu- ja iltahavainto.'
      : 'Mitä käyntimääriä havaitaan neljässä valitussa havaintoikkunassa, kun kaikki kolme laituria otetaan mukaan?';
  const review = rubric('Kerro, mitä mittasit, miten keräsit tiedon ja miksi valitsemasi paikat ja ajat vastaavat kysymykseen.',
    route === 'wind' ? 'Nimeää tuulen tulosuunnan ja selittää tuuliviirin lukemisen valituissa paikoissa.' : 'Nimeää käyntimäärän ja selittää yhtä pitkän laskentaikkunan.',
    route === 'times' ? 'Kertoo miksi samojen kahden laiturin molemmat ajat tarvitaan. Rajaa päätelmän näihin havaintoihin.'
      : 'Kuvaa miten jokainen laituri ja sekä aamu että ilta tulevat mukaan. Rajaa päätelmän näihin havaintoihin.',
    'Valitsin kysyttyä muuttujaa mittaavan välineen. Kävin kaikissa kysymykseen tarvittavissa paikoissa ja ajoissa. Havaintoni koskevat näitä mallin käyntejä.');
  return item({ mode: 'collect', sites, times, coverage, budget: 4, question, variable: route === 'wind' ? 'wind' : 'visits', seed: r.int(1, 0x7fffffff), review },
    collectionContext, 'Valitse muuttuja ja keruutapa. Lukitse neljän käynnin suunnitelma, kerää havainnot ja perustele valintasi.',
    'Yhden paikan loki ei kata muita rantoja. Katso mitä paikkoja ja aikoja kysymys vaatii.', review.model);
}

function structure(r: Rng, variant: 'missing' | 'copies' | 'temperature') {
  const temperature = variant === 'temperature';
  const regular = temperature ? r.pick([5, 7, 9]) : r.pick([2, 3, 4]);
  const outlier = temperature ? r.pick([22, 24, 25]) : r.pick([14, 15, 18]);
  const slips: HarborSlip[] = [
    { id: '1', log: 'A', site: 'Kallio', time: 'Aamu', value: variant === 'missing' ? 0 : regular },
    { id: '2', log: 'B', site: 'Kallio', time: 'Ilta', value: variant === 'copies' ? regular : null },
    { id: '3', log: 'C', site: 'Ruovikko', time: 'Aamu', value: outlier },
    { id: '4', log: 'D', site: 'Ruovikko', time: 'Ilta', value: temperature ? 0 : regular },
  ];
  slips.push({ ...slips[variant === 'missing' ? 2 : 0]!, id: '5' });
  return item({ mode: 'structure', variable: temperature ? 'temperature' : 'visits', unit: temperature ? '°C' : 'kpl',
    slips: r.shuffle(slips), usual: temperature ? [-5, 18] : [0, 10] }, structuralContext,
    'Siirrä jokainen eri havainto taulukkoon. Merkitse puuttuva, tarkistettava ja saman lapun kopio oikein.',
    'Sama tunnus tarkoittaa samaa havaintoa. Sama luku eri tunnuksella on edelleen eri havainto. Säilytä poikkeava lukema ja merkitse se tarkistettavaksi.',
    'Puuttuva tieto jää puuttuvaksi. Todellinen nolla säilyy arvona, ja poikkeava arvo jää näkyviin tarkistamista varten.');
}

function frequency(r: Rng, variant: 'species' | 'places' | 'number') {
  const categories = variant === 'species' ? ['Lokki', 'Tiira', 'Sorsa', 'Kuikka']
    : variant === 'places' ? ['Laituri', 'Kallio', 'Ruovikko'] : ['0', '1', '2', '3'];
  const counts = variant === 'places' ? r.shuffle([2, 3, 4]) : r.shuffle([0, 2, 3, 4]);
  const values = r.shuffle(categories.flatMap((label, i) => Array<string>(counts[i]!).fill(label)));
  return item({ mode: 'freq', name: variant === 'species' ? 'Havaitut lintulajit' : variant === 'places' ? 'Havaintopaikat' : 'Lokkikäyntejä havaintoikkunassa',
    categories, values }, countingContext, 'Täytä frekvenssitaulukko ja kirjoita havaintojen yhteismäärä.',
    'Käy havainnot yksi kerrallaan läpi. Myös kokonaan puuttuvan luokan frekvenssi voidaan kirjata nollaksi.',
    'Frekvenssi on esiintymien lukumäärä. Frekvenssien summa on kaikkien havaintojen määrä.');
}

function relative(r: Rng, variation: 'same-count' | 'equal-share' | 'percent') {
  const source = variation === 'same-count' ? r.pick([[4, 10, 4, 20], [6, 12, 6, 24]])
    : variation === 'equal-share' ? r.pick([[2, 8, 6, 24], [4, 10, 10, 25]]) : r.pick([[6, 25, 16, 40], [7, 20, 9, 50]]);
  const observations = r.shuffle([[source[0]!, source[1]!], [source[2]!, source[3]!]]);
  const groups = observations.map(([value, total], i) => ({ label: i ? 'Kalliopäivä' : 'Ruovikkopäivä', id: i ? 'B' : 'A', value: value!, total: total! })) as
    [HarborRow & { total: number }, HarborRow & { total: number }];
  return item({ mode: 'relative', groups, format: variation === 'percent' ? 'percent' : 'fraction' }, ratioContext,
    'Kirjaa kummankin päivän frekvenssi ja suhteellinen frekvenssi. Vertaa osuuksia.',
    'Suhteellinen frekvenssi saadaan jakamalla tapahtumien määrä saman päivän kaikkien havaintojen määrällä.',
    'Yhtä suuri frekvenssi voi tarkoittaa erisuuria osuuksia. Eri frekvensseistä voi myös muodostua yhtä suuret osuudet.');
}

function mean(r: Rng, variant: 'large' | 'small' | 'transfer') {
  const centre = r.int(7, 15);
  const values = r.shuffle(variant === 'small' ? [centre - 2, centre, centre, centre + 2] : [centre - 2, centre - 1, centre + 1, centre + 2, centre + 2]);
  const addition = variant === 'small' ? centre - 6 : centre + (variant === 'transfer' ? 15 : 8);
  return item({ mode: 'mean', values, addition, unit: variant === 'small' ? 'mm' : 'cm' }, ctx('Keskiarvon laskeminen kaikista havainnoista', 'M-STAT-05'),
    'Laske alkuperäinen keskiarvo ja uusi keskiarvo yhden lisähavainnon jälkeen. Kuvaa muutosta.',
    'Alkuperäisiä havaintoja ei korvata. Lisää uusi lukema summaan ja yksi lukumäärään.',
    'Keskiarvo kuvaa tasattua arvoa. Uusi havainto voi siirtää keskiarvoa, vaikka yksikään vanha havainto ei muutu.');
}
function median(r: Rng, variant: 'odd' | 'even' | 'extreme') {
  const mid = r.int(6, 12);
  const values = variant === 'odd' ? [mid - 4, mid, mid, mid + 2, mid + 4] :
    variant === 'even' ? [mid - 5, mid - 1, mid - 1, mid + 2, mid + 2, mid + 5] :
      [mid - 3, mid - 1, mid + 2, mid + 12];
  const data = rows(values.map((_, i) => `Havainto ${i + 1}`), values);
  return item({ mode: 'median', rows: r.shuffle(data), unit: 'mm',
    ...(variant === 'extreme' ? { previous: { ...data.at(-1)!, value: mid + 5 } } : {}) },
  ctx('Lukujen järjestäminen', 'M-NUM-11'),
  'Järjestä kaikki havaintokortit. Merkitse keskimmäinen havainto tai keskimmäiset havainnot ja kirjoita mediaani.',
  'Samansuuruisia havaintoja ei poisteta. Parillisessa joukossa käytetään molempia keskimmäisiä arvoja.',
  'Mediaani perustuu järjestykseen. Ääriluvun muuttaminen voi jättää mediaanin samaksi, jos keskimmäiset havainnot eivät muutu.');
}

function mode(r: Rng, variant: 'peak' | 'equal' | 'numbers') {
  const categories = variant === 'numbers' ? ['2', '5', '8', '11'] : ['Laituri', 'Kallio', 'Ruovikko'];
  const equal = r.int(1, 4);
  const sizes = variant === 'equal' ? [equal, equal, equal] : variant === 'numbers' ? r.pick([[3, 3, 2, 1], [2, 2, 2, 2]]) : r.pick([[3, 3, 1], [4, 2, 1], [2, 4, 4], [1, 3, 1], [4, 3, 2]]);
  const values = r.shuffle(categories.flatMap((label, i) => Array<string>(sizes[i]!).fill(label)));
  return item({ mode: 'mode', values, categories }, ctx('Esiintymistiheys ja tyyppiarvo', 'M-STAT-03'),
    'Täytä frekvenssit, merkitse tyyppiarvot ja ilmoita onko niitä yksi, useita vai ei nimettyä.',
    'Tarkista mikä frekvenssi on suurin. Jos kaikki eri havaitut arvot ovat yhtä yleisiä, pajassa ei nimetä tyyppiarvoa.',
    'Kun harvinaisempia arvoja on, tasan yhtä yleiset huiput voivat kaikki olla tyyppiarvoja.');
}
function spread(r: Rng, variant: 'different-range' | 'concentration' | 'same-range') {
  const centre = r.int(6, 12);
  const offsets = variant === 'different-range' ? [[-4, -2, 0, 0, 2, 4], [-2, -1, 0, 0, 1, 2]]
    : variant === 'concentration' ? [[-5, -4, -1, 1, 4, 5], [-3, -1, 0, 0, 1, 3]]
      : [[-4, -4, 0, 0, 4, 4], [-4, -1, 0, 0, 1, 4]];
  const series = r.shuffle(offsets).map((values, i) => ({ label: i ? 'Kallio' : 'Ruovikko', values: values.map(value => value + centre) })) as
    [ { label: string; values: number[] }, { label: string; values: number[] } ];
  return item({ mode: 'spread', series, centre, radius: variant === 'different-range' ? 2 : 1, unit: 'mm' },
    ctx('Ääriarvot ja aineiston vertailu', 'M-STAT-01', 'M-STAT-02'),
    'Vertaa pistejakaumia. Kirjaa vaihteluvälien leveydet ja yhteisen keskialueen havaintojen määrät.',
    'Vaihteluväli kertoo ääriarvojen eron. Katso myös, kasaantuvatko pisteet keskelle vai reunoille.',
    'Sama keskiarvo ja jopa sama vaihteluvälin leveys voivat peittää erilaisen pisteiden jakauman.');
}

function interpret(r: Rng, variation: 'axis' | 'population' | 'both') {
  const raw = variation === 'population' ?
    r.pick([[12, 9, 40, 20], [14, 10, 50, 25], [16, 13, 48, 26], [11, 8, 44, 20], [15, 10, 60, 22], [9, 12, 15, 40]]) :
    r.pick([[48, 51, 0, 0], [52, 54, 0, 0], [42, 46, 0, 0], [37, 41, 0, 0], [56, 57, 0, 0], [63, 61, 0, 0]]);
  const observations = rows(['Aamun otos', 'Illan otos'], raw.slice(0, 2)) as [HarborRow, HarborRow];
  const issue = variation === 'population' ? 'population' : 'axis';
  const review = rubric('Muotoile neuvostolle yksi aineiston tukema johtopäätös. Kerro myös, mikä julisteessa voi johtaa harhaan.',
    issue === 'axis' ? 'Mainitsee oikean muutoksen ja sen, mistä asteikko alkaa. Selittää, miksi pylväiden korkeuksien suhde voi liioitella muutosta.'
      : 'Vertaa molempien otosten osuuksia oikeisiin havaintomääriin. Erottaa määrän muutoksen osuuden muutoksesta.',
    'Rajaa väitteen näihin kahteen sataman otokseen. Ei päättele tulevaa, syy-yhteyttä tai koko saariston tilannetta.',
    issue === 'axis' ? 'Näissä kahdessa otoksessa muutos on laskettu alkuperäisistä arvoista. Katkaistu asteikko voi suurentaa muutoksen vaikutelmaa.'
      : 'Näissä kahdessa otoksessa lukumäärä ja osuus voivat muuttua eri suuntiin, koska otoskoot ovat erilaiset.');
  const low = Math.min(raw[0]!, raw[1]!);
  const step = issue === 'axis' ? (low % 2 === 0 ? 2 : 1) : 4;
  const start = issue === 'axis' ? low - 2 * step : 0;
  return item({ mode: 'interpret', issue, rows: observations, firstChart: 'bar', firstStart: start,
    firstTop: issue === 'axis' ? start + step * 8 : 16, firstStep: step,
    ...(issue === 'population' ? { totals: [raw[2]!, raw[3]!] as const } : {}), compareCharts: variation === 'both', review },
    chartContext, 'Tutki julistetta ja havaintolukuja. Tuota numeerinen vertailu ja muotoile sitten oma rajattu johtopäätös.',
    'Vertaa arvojen erotusta niiden korkeuseron vaikutelmaan. Tarkista asteikon alku ja kummankin otoksen kokonaismäärä.',
    review.model);
}

function chart(r: Rng, variation: 'ordered-trend' | 'ordered-comparison' | 'classes') {
  const order = variation === 'classes' ? 'category' : 'time';
  const labels = order === 'time' ? ['8.00', '10.00', '12.00', '14.00'] : ['Kallio', 'Ruovikko', 'Poukama', 'Laituri'];
  const values = variation === 'ordered-trend' ? r.pick([[4, 6, 9, 11], [5, 7, 7, 12], [12, 10, 7, 5],
    [10, 8, 8, 3], [3, 5, 8, 13], [5, 7, 6, 11]]) :
    variation === 'ordered-comparison' ? r.pick([[0, 9, 4, 12], [3, 10, 7, 6], [12, 7, 11, 3],
      [8, 11, 7, 10], [9, 4, 12, 4], [3, 10, 0, 8]]) : r.shuffle([3, 6, 8, 12]);
  const axis = order === 'time' ? 'Kellonaika' : 'Havaintopaikka';
  const question = variation === 'ordered-trend' ? 'Miten havaintomäärä muuttui päivän mittaan?' :
    variation === 'ordered-comparison' ? 'Mihin aikaan havaittiin eniten, ja miten muut mitatut ajankohdat vertautuvat siihen?' :
      'Miten laitureiden havaintomäärät eroavat toisistaan?';
  const review = rubric('Arvioi oma kuvasi. Kerro, miksi valittu esitystapa sopii tähän kysymykseen ja miten tarkistit kuvan.',
    order === 'time' ? 'Perustelee järjestyksen ja yhteyden peräkkäisiin ajankohtiin tai erillisiin ajankohtavertailuihin.'
      : 'Perustelee erillisten paikkaluokkien vertailun eikä väitä paikkojen muodostavan ajallista kehitystä.',
    'Tarkistaa vähintään yhden arvon lähdetaulukosta ja selittää asteikon ja yksikön merkityksen.',
    'Kuva sopii kysymykseen, koska luokat näkyvät oikein. Tarkistin lähdetaulukosta yhden arvon, akselien nimet, yksikön ja asteikon.');
  return item({ mode: 'chart', rows: rows(labels, values), order, question, axis, unit: 'Havaintoja (kpl)', review },
    ctx('Kysymykseen sopiva diagrammi', 'M-DATA-11', 'M79-DATA-STRUCT'),
    'Rakenna lähdetaulukosta diagrammi. Valitse tyyppi, nimeä akselit, aseta asteikko ja kirjoita jokainen arvo. Arvioi oma kuvasi.',
    'Erota ajassa järjestetyt havainnot erillisistä paikkaluokista. Yhden asteikkovälin pituuden tulee tarkoittaa samaa määrää kaikkialla.',
    review.model);
}

function sampleSpace(r: Rng, variant: 'ordered' | 'unordered' | 'product') {
  const symbols = r.shuffle(r.pick([['A', 'B', 'C'], ['K', 'L', 'M', 'N']]));
  const space = variant === 'product' ? { variant, first: ['A', 'B'], second: r.shuffle(['1', '2', '3']) } as const : { variant, symbols };
  return item({ mode: 'space', space }, probabilityContext, 'Rakenna kaikki mahdolliset alkeistulokset ja merkitse niiden lukumäärä.',
    variant === 'unordered' ? 'Samassa parissa ovat samat kaksi eri tunnusta. Niiden järjestys ei merkitse tässä kokeessa.'
      : 'Pidä ensimmäinen valinta samana ja käy mahdolliset toiset valinnat läpi.',
    'Kun järjestys merkitsee, vastakkainen järjestys voi muodostaa toisen tuloksen. Muuten sama pari luetellaan kerran.');
}
function classic(r: Rng, variant: 'atomic' | 'grouped' | 'complement') {
  const letterCount = r.int(3, 4), grouped = variant !== 'atomic';
  const blue = r.int(1, 3), sectorCount = r.int(4, 5);
  const first = grouped ? r.shuffle([
    ...Array.from({ length: blue }, (_, i) => `Sininen ${i + 1}`),
    ...Array.from({ length: sectorCount - blue }, (_, i) => `Punainen ${i + 1}`),
  ]) : Array.from({ length: letterCount }, (_, i) => String.fromCharCode(65 + i));
  const second = r.shuffle(Array.from({ length: r.int(2, 3) }, (_, i) => String(i + 1)));
  const symbol = grouped ? 'Sininen' : r.pick(first);
  const event = { test: variant === 'atomic' ? 'first' : variant === 'grouped' ? 'contains' : 'excludes', symbol, grouped } as const;
  return item({ mode: 'classic', space: { variant: 'product', first, second }, event }, partContext,
    `Merkitse tapahtuman alkeistulokset ja laske niiden osuus. Ehto: ${variant === 'atomic' ? `ensimmäinen kiekko näyttää tunnusta ${symbol}`
      : variant === 'grouped' ? 'pari sisältää sinisen sektorin' : 'parissa ei ole sinistä sektoria'}.`,
    'Laske yhtä suuret sektorit erillisinä tuloksina. Sama väri voi esiintyä useassa sektorissa.',
    'Suhde suotuisat / kaikki pätee tässä, koska jokainen sektoripari on yhtä mahdollinen.');
}
function empirical(r: Rng, variant: 'balance' | 'repetition' | 'transfer') {
  const sectors = variant === 'balance' ? ['Sininen', 'Punainen', 'Sininen', 'Punainen']
    : ['Sininen', 'Punainen', 'Sininen', 'Sininen'];
  const sizes = variant === 'repetition' ? [12, 60, 60] : [12, 60];
  const experiments = sizes.map((count, i) => ({ id: String.fromCharCode(65 + i), count, seed: r.int(1, 0x7fffffff) }));
  return item({ mode: 'empirical', sectors, target: 'Sininen', experiments }, ctx('Havainto-osuus ja mallin todennäköisyys', 'M79-RELFREQ', 'M79-PROB-CLASSIC'),
    'Käynnistä otokset. Kirjaa jokaisen frekvenssi ja osuus. Vertaa niitä malliin ja arvioi riippumattoman seuraavan pyöräytyksen todennäköisyys.',
    'Mallikiekon sektorit pysyvät samoina. Havainto-osuudet voivat vaihdella otoksesta toiseen myös samassa otoskoossa.',
    'Suuri otos on yleensä vakaampi. Yksittäisessä kokeessa pieni otos voi osua lähemmäs mallin arvoa, eikä aiempi sarja muuta seuraavaa riippumatonta pyöräytystä.');
}

const defs: readonly Definition[] = [
  { id: 'M79-DATA-COLLECT', stop: 'Kenen ranta näkyy havainnoissa?', icon: '⚑', intro: 'Aava etsii havaintoja usealta rannalta ja eri kellonaikoina.',
    goal: 'Suunnittelet tutkimuskysymykseen sopivan keruun, teet käynnit ja perustelet kattavuuden.', reward: 'Tutkimusryhmällä on kattava paikallinen havaintosuunnitelma.',
    produceWhat: 'oman keruusuunnitelman toteuttamista ja perustelua',
    families: [['cover-named-shores-and-times', r => collection(r, 'shores')], ['match-sites-across-time-slots', r => collection(r, 'times')]], transfer: r => collection(r, 'wind'),
    limit: 'Mallikäynnit arvioidaan deterministisesti. Oma kattavuus- ja menetelmäperustelu edellyttää aikuishavaintoa. Ei väitettä todellisen otoksen edustavuudesta.' },
  { id: 'M79-DATA-STRUCT', stop: 'Märkien lappujen järjestys', icon: '▤', intro: 'Loikka avaa havaintovihon, jossa on puuttuva merkintä, kaksoiskappale ja tarkistettava lukema.',
    goal: 'Rakennat aineiston säilyttävän taulukon, jossa nolla ja puuttuva tieto erottuvat.', reward: 'Havaintokirja kuivuu luettavaksi.',
    produceWhat: 'aineistotaulukon ja havaintojen tilamerkintöjen tuottamista',
    families: [['retain-missing-and-zero', r => structure(r, 'missing')], ['separate-copy-from-equal-value', r => structure(r, 'copies')]],
    transfer: r => structure(r, 'temperature'), limit: 'Tarkistettava lukema säilyy. Sama havaintotunnus tarkoittaa kopiotapauksessa samaa havaintoa, yhtä suuret arvot eri tunnuksilla säilyvät. Vapaa perustelu arvioidaan erikseen.' },
  { id: 'M79-FREQ', stop: 'Montako kertaa lokki palasi?', icon: '≡', intro: 'Aava laskee, miten usein kukin havaintoluokka löytyy vihosta.',
    goal: 'Muodostat frekvenssitaulukon ja varmistat, että havaintojen kokonaismäärä säilyy.', reward: 'Rantavihko näyttää havaintojen frekvenssit.',
    produceWhat: 'frekvenssien ja tarkistussumman laskemista',
    families: [['count-including-empty-category', r => frequency(r, 'species')], ['count-a-distribution-by-site', r => frequency(r, 'places')]],
    transfer: r => frequency(r, 'number'), limit: 'Arviointi koskee annetun aineiston luokkien frekvenssejä, myös luokkaa, joka ei esiinny otoksessa.' },
  { id: 'M79-RELFREQ', stop: 'Eri päivien reilu vertailu', icon: '÷', intro: 'Loikka vertaa kahta päivää, joina havaintoja tehtiin eri määrä.',
    goal: 'Lasket osuudet omista nimittäjistään ja vertailet niitä täsmällisesti.', reward: 'Tutkimusviesti kertoo päivien oikeat osuudet.',
    produceWhat: 'suhteellisten frekvenssien laskemista',
    families: [['same-frequency-different-share', r => relative(r, 'same-count')], ['different-frequency-equal-share', r => relative(r, 'equal-share')]],
    transfer: r => relative(r, 'percent'), limit: 'Samanarvoiset murtoluvut hyväksytään. Prosenttinäkymässä kenttä on prosenttiluku, jonka nimittäjä on sata.' },
  { id: 'M79-MEAN', stop: 'Sataman yhteinen keskimitta', icon: '≋', intro: 'Aava katsoo, mitä uusi poikkeava havainto tekee sataman keskiarvolle.',
    goal: 'Lasket keskiarvon ja sen muutoksen sekä tulkitset sen tasattuna arvona.', reward: 'Sataman raportti kertoo keskimäärän ja sen muutoksen.',
    produceWhat: 'alkuperäisen ja päivitetyn keskiarvon laskemista',
    families: [['include-high-observation', r => mean(r, 'large')], ['include-low-observation', r => mean(r, 'small')]], transfer: r => mean(r, 'transfer'),
    limit: 'Arviointi kattaa kaksi keskiarvoa, molemmat havaintomäärät ja annetun aineiston tasajaon tulkinnan.' },
  { id: 'M79-MEDIAN', stop: 'Havaintojonon keskellä', icon: '↔', intro: 'Loikka järjestää sataman kortit ja tutkii, mikä jää keskelle.',
    goal: 'Järjestät havainnot, löydät keskimmäiset ja lasket mediaanin.', reward: 'Raportti saa perustellun keskikohdan.',
    produceWhat: 'järjestetyn aineiston ja mediaanin tuottamista',
    families: [['order-odd-sample', r => median(r, 'odd')], ['average-two-middle-observations', r => median(r, 'even')]],
    transfer: r => median(r, 'extreme'), limit: 'Samanarvoisten havaintojen järjestys voi vaihdella. Parillisessa aineistossa tarkistetaan molemmat keskimmäiset.' },
  { id: 'M79-MODE', stop: 'Yleisin retkivalinta', icon: '▥', intro: 'Aava selvittää, sopiiko retkitauluun yksi suosikki vai useampi.',
    goal: 'Tuotat frekvenssit ja nimeät tyyppiarvot sovitulla tasatilannesäännöllä.', reward: 'Retkikorttien yhteenveto näyttää yleisimmät valinnat.',
    produceWhat: 'frekvenssien ja tyyppiarvojen merkitsemistä',
    families: [['find-tied-or-single-peak', r => mode(r, 'peak')], ['recognize-all-equal-frequencies', r => mode(r, 'equal')]],
    transfer: r => mode(r, 'numbers'), limit: 'Pajan sopimus jättää tyyppiarvon nimeämättä, jos useita eri havaittuja arvoja on täsmälleen yhtä paljon.' },
  { id: 'M79-SPREAD', stop: 'Sama keskiarvo, eri hajonta', icon: '·', intro: 'Kaksi aineistoa näyttää saman keskimitan, mutta pisteet jakautuvat eri tavoin.',
    goal: 'Vertaat vaihteluvälin leveyttä ja pisteiden keskittymistä yhteisellä asteikolla.', reward: 'Retken havaintoaika joustaa vaihtelun mukaan.',
    produceWhat: 'vaihteluvälien ja keskialueen havaintomäärien laskemista',
    families: [['compare-different-ranges', r => spread(r, 'different-range')], ['compare-central-counts', r => spread(r, 'concentration')]],
    transfer: r => spread(r, 'same-range'), limit: 'Vaihteluväli ja ilmoitettu keskialue ovat kaksi nimettyä kuvausta. Näistä ei päätellä yleistä hajontajärjestystä.' },
  { id: 'M79-DIAGRAM-INTERP', stop: 'Liian hurja otsikko', icon: '⌕', intro: 'Sataman neuvosto tarkistaa julisteen ennen päätöstä.',
    goal: 'Selvität asteikon tai perusjoukon vaikutuksen ja tuotat oman rajatun päätelmän.', reward: 'Juliste saa reilun selitteen.',
    produceWhat: 'numeerisen vertailun ja oman johtopäätöksen tuottamista',
    families: [['critique-truncated-axis', r => interpret(r, 'axis')], ['compare-unequal-base-populations', r => interpret(r, 'population')]],
    transfer: r => interpret(r, 'both'), limit: 'Numeerinen vertailu tarkistetaan mallissa. Oma rajattu johtopäätös arvioidaan aikuisen kuulemana.' },
  { id: 'M79-DIAGRAM-PROD', stop: 'Reilu kuva saaristolle', icon: '▧', intro: 'Aava tekee havaintopöydästä kuvan, jonka toinenkin saari osaa lukea.',
    goal: 'Rakennat oikeat akselit ja arvot sekä perustelet, miksi kuva vastaa kysymykseen.', reward: 'Rannat saavat luettavan havaintotaulun.',
    produceWhat: 'oman diagrammin rakentamista ja kriteereihin sidottua perustelua',
    families: [['plot-an-ordered-trend', r => chart(r, 'ordered-trend')], ['plot-discrete-time-comparisons', r => chart(r, 'ordered-comparison')]],
    transfer: r => chart(r, 'classes'), limit: 'Ajalliseen aineistoon käy tarkoituksenmukainen viiva tai järjestetty pylväskuva. Oman valinnan perustelu tarvitsee aikuishavainnon.' },
  { id: 'M79-PROB-SPACE', stop: 'Kaikki tuulikellon vastaukset', icon: '⊗', intro: 'Loikka luettelee tuulikellon viestit ja tarkistaa, milloin järjestys muuttaa viestiä.',
    goal: 'Muodostat täydellisen alkeistulosjoukon oikealla järjestyssäännöllä.', reward: 'Jokainen sallittu viesti saa oman korttinsa.',
    produceWhat: 'kaikkien alkeistulosten muodostamista',
    families: [['order-matters-in-drawing', r => sampleSpace(r, 'ordered')], ['same-unordered-pair-once', r => sampleSpace(r, 'unordered')]],
    transfer: r => sampleSpace(r, 'product'), limit: 'Alkeistulokset arvioidaan annettujen tunnusten perusteella. Täydellisestä luettelosta ei päätellä tasatodennäköisyyttä.' },
  { id: 'M79-PROB-CLASSIC', stop: 'Reilu valinta havaintovuoroon', icon: '⚖', intro: 'Aava laskee yhden sektoriparin kerrallaan ennen havaintovuoron jakoa.',
    goal: 'Muodostat suotuisan joukon ja lasket sen osuuden yhtä mahdollisista tuloksista.', reward: 'Havaintovuoroille löytyy ymmärrettävä valintasääntö.',
    produceWhat: 'suotuisan joukon ja tarkan todennäköisyyssuhteen tuottamista',
    families: [['count-equiprobable-sector-pairs', r => classic(r, 'atomic')], ['separate-colour-from-equal-sectors', r => classic(r, 'grouped')]],
    transfer: r => classic(r, 'complement'), limit: 'Tasatodennäköisyys kuuluu yksittäisille sektoripareille. Värit eivät välttämättä ole yhtä todennäköisiä.' },
  { id: 'M79-PROB-EMP', stop: 'Mitä monta koetta kertoo?', icon: '◉', intro: 'Loikka tekee mallikiekolla monta riippumatonta koetta kerralla ja vertaa osuuksia.',
    goal: 'Lasket koeosuudet ja tunnistat eron mallin arvon, havaitun osuuden ja seuraavan tuloksen välillä.', reward: 'Tutkimuskortti näyttää havaitun osuuden ja epävarmuuden.',
    produceWhat: 'kahden tai kolmen otoksen osuuksien ja mallin todennäköisyyden laskemista',
    families: [['compare-small-and-large-sample', r => empirical(r, 'balance')], ['compare-repeated-large-samples', r => empirical(r, 'repetition')]],
    transfer: r => empirical(r, 'transfer'), limit: 'Siemennetty malli tuottaa näkyvät otokset. Onnekas tulos ei tuo näyttöä, eikä suurempi otos takaa läheisempää arviota jokaisessa kokeessa.' },
];

type HarborSpec = Omit<NodeSpec, 'item'> & { item(r: Rng, phase: Phase): HarborItem };
function spec(def: Definition): HarborSpec {
  const { families, transfer, limit: _limit, ...meta } = def;
  const rev = `exp690-statistics-harbor-${def.id.toLowerCase()}-v1`;
  return { ...meta, rev, validRevs: [rev], produce: [...families.map(([tag]) => tag), 'transfer'],
    demo(r) { return families.map(([, author]) => {
      const example = author(r);
      return { say: example.explain!, scene: statisticsHarborExample(example.task),
        sceneModel: statisticsHarborScene(example.task, solutionStatisticsHarbor(example.task)) };
    }); },
    item(r, phase) {
      const [tag, author] = phase === 'transfer' ? ['transfer', transfer] as const : r.pick(families);
      return { ...author(r), tag };
    },
  };
}

export const statisticsHarborSpecs: HarborSpec[] = defs.map(spec);
export const statisticsHarborEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(defs.map(({ id, families, limit }) => [id, { families: families.map(([tag]) => tag), limit }]));
