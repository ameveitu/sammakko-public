import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Phase } from '../engine/types';
import type { NumberEquivalencesTask, Operation, PlacePrecision, ProportionPair } from './models/number-equivalences';
import { numberEquivalencesBoard, numberEquivalencesExample } from './scenes/number-equivalences';

type EquivalenceItem = Omit<Item, 'task'> & { task: NumberEquivalencesTask };
type Author = (r: Rng) => Omit<EquivalenceItem, 'tag'>;
type Definition = Pick<NodeSpec, 'id' | 'stop' | 'icon' | 'intro' | 'goal' | 'reward' | 'produceWhat'> & {
  families: readonly [readonly [string, Author], readonly [string, Author]];
  transfer: Author;
  limit: string;
};
type Variant = 'build' | 'repair' | 'transfer';
const kind = 'number-equivalences' as const;
const context = (title: string, ...skills: string[]) => ({ title, skills });
function item(task: NumberEquivalencesTask, say: string, hint: string, explain: string): ReturnType<Author> {
  return { task, say, hint, explain, scene: numberEquivalencesBoard(task) };
}
function line(r: Rng, skill: 'absolute' | 'opposite', variant: Variant) {
  const step = variant === 'transfer' ? r.pick([2, 3, 4, 5]) : r.pick([1, 2, 3]);
  const extent = 5 * step;
  const zero = variant === 'repair' && r.chance(.2);
  const distance = zero ? 0 : step * r.int(1, 4);
  const direction = r.pick([-1, 1]);
  const focus = skill === 'absolute' && variant === 'repair' ? undefined : distance * direction;
  const reference = skill === 'absolute' && variant === 'transfer' ? r.pick([30, 40, 50]) : 0;
  const draft = skill === 'opposite' && variant === 'repair' ? r.pick([-focus!, focus!, step]) : undefined;
  const setting = reference ? 'Mittarin poikkeama lasketaan sovitusta tavoitelukemasta. Sen kohdalla poikkeama on nolla.'
    : variant === 'transfer' ? 'Peilaa kokonaisluku abstraktilla lukusuoralla. Jaotus voi vaihtua.'
      : skill === 'absolute' ? 'Loikka ja Aava mittaavat matkaa nollalaiturille.' : 'Aava siirtää tervehdyksen nollan yli peilikohdalle.';
  const say = skill === 'absolute' ? focus === undefined ? 'Merkitse kaikki paikat annetulla etäisyydellä ja kirjaa niiden etäisyys nollasta.'
    : 'Lue merkin paikkaluku. Kirjaa sen etäisyys nollasta ja merkitse kaikki paikat samalla etäisyydellä.'
    : 'Lue lähtöpaikka ja merkitse vastaluku. Kirjaa peilipaikan puoli, yhteinen etäisyys ja paikkalukujen summa.';
  return item({ kind, mode: 'line', skill, step, extent, reference, unit: reference ? 'cm' : '',
    focus, ...(focus === undefined ? { distanceGiven: distance } : {}), draft, setting, context: context('Kokonaisluvut ja lukusuoran nolla', 'M79-INT-01') },
  say, 'Nolla on vertailukohta. Laske välejä molempiin suuntiin. Paikkaluvulla on merkki, etäisyydellä on suuruus.',
  skill === 'absolute' ? 'Itseisarvo on etäisyys nollasta. Samalla positiivisella etäisyydellä on kaksi paikkaa ja nollaetäisyydellä yksi.'
    : 'Vastaluvut ovat eri puolilla nollaa yhtä kaukana siitä. Niiden summa on nolla. Nollan vastaluku on nolla.');
}

type PlaceTask = Extract<NumberEquivalencesTask, { mode: 'place' }>;
function place(r: Rng, goal: PlaceTask['goal'], variant: Variant) {
  const precision: PlacePrecision = variant === 'transfer' ? 3 : 2;
  const scale = 10 ** precision;
  const unit = variant === 'transfer' ? 'm' : goal === 'add' ? 'mm' : goal === 'sub' ? 'm' : 'kg';
  let start = 0, startShort = variant !== 'repair', allowNegative = false;
  let changes: PlaceTask['changes'];
  let setting: string;
  if (goal === 'add') {
    if (variant === 'repair') {
      start = r.int(1, 8) * scale + 90 + r.int(5, 9);
      changes = [{ name: 'Ilta', amount: 80 + r.int(5, 9), operation: 'add', short: false }];
    } else {
      start = r.int(1, 8) * scale + r.int(4, 9) * scale / 10;
      changes = [{ name: variant === 'transfer' ? 'Liitettävä köysi' : 'Ilta', amount: 6 * scale / 10 + r.int(1, scale / 10 - 1), operation: 'add', short: false }];
    }
    setting = variant === 'transfer' ? 'Kaksi köyttä liitetään ilman päällekkäisyyttä. Laske koko pituus.'
      : 'Aamun ja illan sateet yhdistetään päivän mittakorttiin. Alkulukema on aamun määrä.';
  } else if (goal === 'sub') {
    if (variant === 'transfer') {
      start = r.int(1, 4) * scale + r.pick([20, 120, 300, 450]);
      const offset = r.int(1, 4) * 100 + r.int(1, 8);
      changes = [{ name: 'Vanha lukema', amount: start + r.pick([-1, 1]) * offset, operation: 'sub', short: false }];
      allowNegative = true;
    } else if (variant === 'repair') {
      start = r.int(2, 9) * scale;
      changes = [{ name: 'Leikattu pala', amount: r.int(0, 1) * scale + r.int(1, 8) * 10 + r.int(1, 8), operation: 'sub', short: false }];
      startShort = true;
    } else {
      const tens = r.int(1, 8) * 10;
      start = r.int(2, 9) * scale + tens;
      changes = [{ name: 'Leikattu pala', amount: r.int(0, 1) * scale + tens + r.int(1, 9), operation: 'sub', short: false }];
    }
    setting = allowNegative ? 'Alkuluku on uusi vedenkorkeusmittarin lukema. Selvitä suunnattu muutos: uusi lukema miinus vanha lukema.'
      : 'Kankaasta leikataan merkitty pala. Selvitä jäljelle jäävä mitta ja tarkista se summalla.';
  } else {
    const first: Operation = variant === 'repair' ? 'sub' : 'add', second: Operation = first === 'add' ? 'sub' : 'add';
    start = r.int(3, 8) * scale + r.int(5, 8) * scale / 10;
    const add = 7 * scale / 10 + r.int(1, scale / 10 - 1);
    const sub = r.int(1, 2) * scale + r.int(4, 8) * scale / 10 + r.int(1, scale / 10 - 1);
    const names = variant === 'transfer' ? { add: 'Liitetään nauhaa', sub: 'Leikataan nauhaa' } : { add: 'Pakataan lisää', sub: 'Otetaan pois' };
    changes = [first, second].map(operation => ({ operation, name: names[operation], amount: operation === 'add' ? add : sub, short: false }));
    setting = variant === 'transfer' ? 'Nauha kootaan ja leikataan kahdessa järjestyksessä näkyvässä vaiheessa.'
      : 'Retkilaatikon massa muuttuu kahdessa järjestyksessä näkyvässä vaiheessa. Selvitä lopullinen massa.';
  }
  const say = goal === 'both' ? 'Arvioi lopputulos ensin. Rakenna sitten kummankin tapahtuman paikka-arvolasku ja tarkista vähennys.'
    : goal === 'add' ? 'Kohdista desimaalipaikat, merkitse sarakkeiden siirrot ja laske summa.'
      : 'Kohdista desimaalipaikat, merkitse lainat ja laske erotus. Tarkista lisäämällä vähennetty määrä takaisin.';
  return item({ kind, mode: 'place', goal, precision, unit, start, startShort, changes, allowNegative, setting,
    context: context('Desimaalipaikat ja saman yksikön osat', 'M-DEC-07') },
  say, 'Pilkut ovat samassa kohdassa. Täydennä tarvittaessa nollia. Jokainen sarake vaihtuu viereiseen kymmenen suhteessa.',
  'Desimaalipaikat määräävät osien arvon. Siirto vaihtaa saman määrän toiseen yksikköön. Loppunolla ei muuta lukua.');
}

function multiply(r: Rng, variant: Variant) {
  const travel = variant === 'transfer';
  const places = variant === 'build' ? [1, 1] as const : travel ? [1, 2] as const : [2, 1] as const;
  const left = variant === 'build' ? r.int(2, 9) : travel ? r.int(12, 38) : r.int(21, 95);
  const right = variant === 'build' ? r.int(2, 9) : travel ? r.pick([25, 50, 75, 100, 125, 150]) : r.int(12, 27);
  return item({ kind, mode: 'multiply', left, right, places, outputUnit: travel ? 'km' : 'm²', contextType: travel ? 'travel' : 'area',
    context: context('Paikka-arvo ja kertolasku', 'M-DEC-08'),
    setting: travel ? 'Tässä annetaan laskusääntö: mallimatka = nopeuden mittaluku (km/h) × aika (h).'
      : 'Suorakulmaisesta kangaspalasta mitataan leveys ja korkeus. Kokonainen ruutu on 1 m × 1 m.' },
  'Lukitse ensin tuloksen suuruus verrattuna toiseen kertoimeen 1. Tuota osien kertolasku, kokonaisen jakaja ja tarkka tulos.',
  'Katso kumpikin asteikko erikseen. Osien tulo ja kokonaisen osien määrä kerrotaan samalla rakenteella.',
  'Kymmenesosa kertaa kymmenesosa on sadasosa. Kun toinen mitta ylittää yhden, vastaava pinta tai matka kasvaa samaan lähtöön verrattuna.');
}

function proportion(r: Rng, variant: Variant) {
  const a = r.int(2, 12), b = r.int(2, 13);
  const scale = variant === 'build' ? [r.int(2, 5), 1] as const : r.pick([[3, 2], [5, 2], [4, 3], [2, 3]] as const);
  const scaled = (n: number) => n * scale[0] % scale[1] === 0 ? String(n * scale[0] / scale[1]) : `${n * scale[0]}/${scale[1]}`;
  const pairs: [ProportionPair, ProportionPair] = [[String(a), String(b)],
    variant === 'transfer' ? [scaled(a), 'x'] : ['x', scaled(b)]];
  const method = variant === 'build' ? 'scale' : variant === 'repair' ? 'algebra' : 'either';
  return item({ kind, mode: 'proportion', pairs, method, unit: variant === 'transfer' ? 'cm' : 'm',
    modelNames: variant === 'transfer' ? ['Kohde A', 'Kohde B'] : ['Mallikuva', 'Uusi piirros'],
    measureNames: variant === 'transfer' ? ['Leveys', 'Pituus'] : ['Kannen leveys', 'Kannen pituus'],
    context: context(method === 'algebra' ? 'Vastaavat mitat ja yhtälörivi' : 'Vastaavat mitat ja sama suhde',
      'M79-PROP-01', ...(method === 'algebra' ? ['M79-EQ1-SOLVE'] : [])),
    setting: variant === 'transfer' ? 'Kaksi samanmuotoista tutkimusaluetta tarvitsee vastaavat karttamerkinnät. Tuntematon on nyt toisessa mittarivissä.'
      : 'Aavan ja majavan siltapiirrokset ovat samanmuotoiset. Niiden vastaavat mitat muuttuvat samalla kertoimella.' },
  `Muodosta verranto, ratkaise puuttuva mitta ${method === 'scale' ? 'skaalaamalla' : method === 'algebra' ? 'yhtälörivillä' : 'skaalaamalla tai yhtälörivillä'} ja tarkista molemmat suhteet.`,
  'Päätä, mitkä mitat vastaavat toisiaan. Molempien suhteiden järjestyksen pitää säilyä samana. Nimittäjä ei voi olla nolla.',
  'Sama skaalaus kerrotaan molempiin vastaaviin mittoihin. Kun sijoitamme ratkaisun alkuperäisiin suhteisiin, ne ovat yhtä suuret.');
}

function placeDef(id: string, goal: PlaceTask['goal'], stop: string, reward: string, tags: readonly [string, string], limit: string): Definition {
  return { id, stop, icon: '0,1', intro: 'Aava pitää lähtömitat näkyvissä, kun Loikka järjestää työpöydän.',
    goal: 'Rakennat desimaalien paikka-arvolaskun ja tarkistat mitan.', reward,
    produceWhat: 'omat paikkasarakkeet, vaihdot ja tarkka laskutulos', limit,
    families: [[tags[0], r => place(r, goal, 'build')], [tags[1], r => place(r, goal, 'repair')]], transfer: r => place(r, goal, 'transfer') };
}
const defs: Definition[] = [
  { id: 'M79-ABS-01', stop: 'Kuinka kaukana kodista?', icon: '|x|', intro: 'Loikka ja Aava mittaavat matkaa yhteiselle laiturille.',
    goal: 'Erotat paikan suunnan etäisyydestä ja löydät kaikki saman etäisyyden paikat.',
    reward: 'Ystävät kohtaavat nollalaiturilla.', produceWhat: 'oman etäisyyden ja kaikki vastaavat lukusuoran paikat',
    families: [['read-point-and-build-distance-pair', r => line(r, 'absolute', 'build')], ['recover-all-positions-from-distance', r => line(r, 'absolute', 'repair')]],
    transfer: r => line(r, 'absolute', 'transfer'), limit: 'Arvioidaan nollasta mitattua etäisyyttä ja kaikki vastaavat paikat. Siirrossa mittarin tavoitelukema toimii poikkeaman nollana.' },
  { id: 'M79-OPPOSITE-01', stop: 'Kahden rannan tervehdys', icon: '±', intro: 'Aava etsii Loikan tervehdykselle peilikohdan.',
    goal: 'Tuotat vastaluvun, saman etäisyyden ja summan nolla.',
    reward: 'Vastakkaisten merkkien viesti kohtaa laiturilla.', produceWhat: 'peilatun paikan, etäisyyden ja vastalukujen summan',
    families: [['reflect-a-position-through-zero', r => line(r, 'opposite', 'build')], ['audit-and-rebuild-an-opposite', r => line(r, 'opposite', 'repair')]],
    transfer: r => line(r, 'opposite', 'transfer'), limit: 'Paikka, puoli, etäisyys ja summa tarkistetaan. Luonnoksen oikeellisuus on tunnistusta, matemaattinen rakenne tuotetaan itse.' },
  placeDef('M79-DEC-ADD', 'add', 'Sateen kaksi mittaa', 'Sademäärä valmistuu kasvihuoneen korttiin.',
    ['align-mixed-decimal-lengths-and-carry', 'carry-through-two-adjacent-places'],
    'Paikka-arvosarakkeet ja kantosiirrot tarkistetaan. Tarkka tulos hyväksyy lopun nollat ja samanarvoiset kirjoitustavat.'),
  placeDef('M79-DEC-SUB', 'sub', 'Mittojen erotus', 'Tarkistettu mitta auttaa Saariston retkellä.',
    ['borrow-in-mixed-place-width', 'borrow-through-zero-positions'],
    'Vähennys tarkistetaan summalla. Negatiivinen mittarimuutos lasketaan suuruuden kautta ja merkitään etumerkillä.'),
  placeDef('M79-DEC-ADD-SUB', 'both', 'Retkilaatikon tarkka luettelo', 'Varustelaatikon ilmoitettu sisältö täsmää.',
    ['build-addition-then-removal', 'build-removal-then-addition'],
    'Vaatii molempien tapahtumien omat operaatiot ja saraketyön. Kokonaislukuväli lukitaan ensin. Tämä ei osoita, mitä oppija laski mielessään.'),
  { id: 'M79-DEC-MUL', stop: 'Pienennetyn purjeen pinta', icon: '×', intro: 'Loikka mittaa korjauspalan sivut ja tarkistaa pinta-alan.',
    goal: 'Yhdistät molempien kertoimien paikka-arvot ja oikean tuloksen suuruuden.',
    reward: 'Purjeen korjauspala saa sopivan mitan.', produceWhat: 'oman osien kertolaskun, kokonaisen jakajan ja tarkan tuloksen',
    families: [['multiply-two-fractions-of-a-unit', r => multiply(r, 'build')], ['compare-a-factor-above-one', r => multiply(r, 'repair')]],
    transfer: r => multiply(r, 'transfer'), limit: 'Vertailu käyttää samaa yksikköä ja vertailukerrointa 1. Matkasiirrossa laskusääntö on annettu.' },
  { id: 'M79-PROP-SOLVE', stop: 'Puuttuva karttamitta', icon: '∶', intro: 'Aava ja majava vertaavat samanmuotoisia piirroksia.',
    goal: 'Muodostat verrannon, ratkaiset puuttuvan mitan ja tarkistat molemmat puolet.',
    reward: 'Mallin silta kohtaa molemmat rannat.', produceWhat: 'oman verrannon, ratkaisuvaiheen ja kaksi sijoitusta',
    families: [['derive-unknown-by-corresponding-scale', r => proportion(r, 'build')], ['derive-equivalent-linear-equation', r => proportion(r, 'repair')]],
    transfer: r => proportion(r, 'transfer'), limit: 'Molemmat suhteet voi kääntää, ja yhtälön puolet voi vaihtaa keskenään. Algebrassa kelpaavat nollasta poikkeavalla luvulla kerrotut yhtälöt. Siirrossa x voi olla nimittäjässä.' },
];
type EquivalenceSpec = Omit<NodeSpec, 'item'> & { item(r: Rng, phase: Phase): EquivalenceItem };
function spec(def: Definition): EquivalenceSpec {
  const { families, transfer, limit: _limit, ...meta } = def;
  const rev = `exp690-number-equivalences-${def.id.toLowerCase()}-v1`;
  return { ...meta, rev, validRevs: [rev], produce: [...families.map(([tag]) => tag), 'transfer'],
    demo(r) { return families.map(([, author]) => {
      const example = author(r); return { say: example.explain!, scene: numberEquivalencesExample(example.task) };
    }); },
    item(r, phase) {
      const [tag, author] = phase === 'transfer' ? ['transfer', transfer] as const : r.pick(families);
      return { ...author(r), tag };
    },
  };
}
export const numberEquivalencesSpecs: EquivalenceSpec[] = defs.map(spec);
export const numberEquivalencesEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(defs.map(({ id, families, limit }) => [id, { families: families.map(([tag]) => tag), limit }]));
