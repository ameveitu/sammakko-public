import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Phase } from '../engine/types';
import { evaluateGardenCurve, type FunctionGardenTask, type GardenAxis, type GardenCurve, type GardenDirection, type GardenPoint,
  type GardenPattern } from './models/function-garden';
import { functionGardenBoard, functionGardenExample } from './scenes/function-garden';

type GardenItem = Omit<Item, 'task'> & { task: FunctionGardenTask };
type Author = (r: Rng) => Omit<GardenItem, 'tag'>;
type Definition = Pick<NodeSpec, 'id' | 'stop' | 'icon' | 'intro' | 'goal' | 'reward' | 'produceWhat'> & {
  families: readonly [readonly [string, Author], readonly [string, Author]];
  transfer: Author;
  limit: string;
};
type Variant = 'build' | 'repair' | 'transfer';
const context = (title: string, ...skills: string[]) => ({ title, skills });
const functionContext = context('Arvoparit ja funktion kuvaaja', 'M79-FUNC-GRAPH');
const squareContext = context('Neliöön korottaminen ja kuvaajan lukeminen', 'M79-POWER-POS', 'M79-FUNC-GRAPH');
const plottingContext = context('Arvotaulukko ja paraabelin muoto', 'M79-FUNC-TABLE', 'M79-PARABOLA');
const sequenceContext = context('Lukujonon vaihe ja termin arvo', 'M-ALG-03');
function item(task: FunctionGardenTask, say: string, hint: string, explain: string): ReturnType<Author> {
  return { task, scene: functionGardenBoard(task), say, hint, explain };
}
const kind = 'function-garden' as const;
function monotonic(r: Rng, variant: Variant) {
  const right = variant === 'transfer' ? 3 : 4;
  const x = [r.int(0, 3)];
  for (let i = 0; i < right; i++) x.push(x[i]! + r.int(1, 2));
  const rising = [r.int(1, 3), r.int(1, 3)] as const;
  let y: number[];
  if (variant === 'transfer') {
    const first = -r.int(9, 13);
    y = [first, first + rising[0], first + rising[0] + rising[1], first + rising[0] + rising[1] + 1];
  } else if (variant === 'repair') {
    const first = r.int(-4, 2);
    y = [first, first - rising[0], first - rising[0] - rising[1], first - rising[0] - rising[1] + r.int(1, 3), 0];
    y[4] = y[3]!;
  } else {
    const first = r.int(-7, 0);
    y = [first, first + rising[0], first + rising[0] + rising[1], first + rising[0] + rising[1],
      first + rising[0] + rising[1] - r.int(1, 4)];
  }
  const signIndex = variant === 'transfer' ? r.pick([1, 2]) : r.pick([0, 2, 3]);
  const signAt = x[signIndex]!;
  const points: GardenPoint[] = x.map((value, i) => [value, y[i]!]);
  const draft = variant === 'repair' ? { from: x[2]!, to: x[3]!, direction: r.pick(['constant', 'falling', 'rising'] as const) as GardenDirection } : undefined;
  const axis: GardenAxis = { x: [x[0]!, x.at(-1)!], y: [Math.min(-1, ...y) - 1, Math.max(1, ...y) + 1], xStep: 1,
    yStep: Math.max(1, ...y) - Math.min(-1, ...y) > 10 ? 2 : 1,
    xName: 'Aika (h)', yName: variant === 'transfer' ? 'Lämpötila (°C)' : 'Pinnan poikkeama (cm)' };
  return item({ kind, mode: 'mono', context: functionContext, points, axis, signAt, draft,
    setting: variant === 'transfer' ? 'Ulkona mitattu lämpötila voi nousta, vaikka se pysyy pakkasella.'
      : 'Mallivesisäiliön pinnan poikkeama voi olla vertailutason ylä- tai alapuolella.' },
  'Merkitse pisimmät nousevat, laskevat ja vakiona pysyvät jaksot. Kirjaa myös nimetyn kohdan arvo ja sen merkki.',
  'Seuraa kuvaajaa vasemmalta oikealle. Kuvaaja voi nousta myös x-akselin alapuolella.',
  'Jakson suunta kertoo muutoksesta. Arvon merkki kertoo korkeudesta nollatasoon nähden.');
}
function curveFor(r: Rng, variant: Variant, graph = false): GardenCurve {
  const a = variant === 'transfer' && graph ? -r.int(1, 2) : variant === 'transfer' ? r.pick([2, 3]) : r.int(1, 2);
  return { type: 'parabola', a, h: r.int(-3, 3), k: variant === 'transfer' && !graph ? r.pick([-3, -2, 1, 2, 3]) : r.int(-4, 4) };
}
function curveAxis(curve: GardenCurve, other: readonly GardenCurve[] = []): GardenAxis {
  const values = [curve, ...other].flatMap(fn => [-2, 0, 2].map(dx => evaluateGardenCurve(fn, curve.h + dx)));
  const low = Math.min(0, ...values), high = Math.max(0, ...values);
  const step = high - low > 10 ? 2 : 1;
  return { x: [curve.h - 2, curve.h + 2], y: [Math.floor(low / step) * step - step, Math.ceil(high / step) * step + step],
    xStep: 1, yStep: step, xName: 'x', yName: 'y' };
}
function recognition(r: Rng, variant: Variant) {
  const curve = curveFor(r, variant), checkX = curve.h + r.pick([-1, 1]);
  const alternatives: GardenCurve[] = [{ ...curve, type: 'quartic' }, { ...curve, type: variant === 'repair' ? 'absolute' : 'line' }];
  const choices = r.shuffle([curve, ...alternatives]).map((fn, i) => ({ id: String.fromCharCode(65 + i), curve: fn }));
  const samples: GardenPoint[] = [curve.h - 2, curve.h, checkX, curve.h + 2].sort((a, b) => a - b).map(x => [x, evaluateGardenCurve(curve, x)]);
  return item({ kind, mode: 'parabola', view: variant === 'repair' ? 'samples' : 'formula', curve, choices, samples, checkX,
    axis: curveAxis(curve, alternatives), context: squareContext,
    setting: variant === 'transfer' ? 'Kasvihuoneen toisessa siivessä kaareva ikkuna on leveydeltään ja korkeudeltaan erilainen.'
      : 'Aava vertailee kolmea tarkkaa kuvaajaa. Samantapainen kaari voi seurata eri sääntöä.' },
  'Tuota pyydetty arvopari ja valitse siihen sekä muihin annettuihin tietoihin sopiva kuvaaja.',
  'Vertaa kuvaajia myös lähellä huippua. Pelkkä U-muoto ei yksilöi paraabelia.',
  'Paraabeli kuvaa tässä neliöllistä riippuvuutta. Samoista reuna- ja huippupisteistä voi kulkea myös erilainen käyrä.');
}
function construction(r: Rng, variant: Variant) {
  const curve = curveFor(r, variant, true);
  const table = [-2, -1, 0, 1, 2].map(d => {
    const x = curve.h + d;
    return { x, ...(variant === 'repair' && d < 0 ? {} : { y: evaluateGardenCurve(curve, x) }) };
  });
  return item({ kind, mode: 'parabola-graph', curve, table, axis: curveAxis(curve), context: plottingContext,
    setting: variant === 'repair' ? 'Kaari on symmetrinen huipun suhteen. Täydennä taulukon puuttuvat kohdat kuvaajaan.'
      : variant === 'transfer' ? 'Uusi valoikkuna kaartuu alaspäin. Käytä saman taulukon pisteitä ja tarkista huippu.'
        : 'Loikka on mitannut ikkunan viisi kohtaa. Aseta pisteet ennen kuin tarkistat niiden välin.' },
  'Sijoita arvoparit. Merkitse huippu ja sen kummaltakin puolelta symmetrinen pari. Valitse kuvaajan kulku ja lukitse piirros.',
  'Huipun molemmin puolin yhtä kaukana olevat pisteet ovat samalla korkeudella. Janojen liitos tekisi mutkan.',
  'Paraabeli on jatkuva sileä kaari. Huippu ja symmetriset arvoparit tarkistavat sijoittelun.');
}
function sequence(r: Rng, target: 'structure' | 'rule' | 'integration', variant: Variant) {
  const pattern: GardenPattern = variant === 'build' ? 'difference' : 'ratio';
  const start = variant === 'transfer' ? r.int(2, 5) : r.pick([0, 1]);
  const first = r.int(2, 9);
  const step = pattern === 'difference' ? r.int(1, 7) : r.pick([2, 3, 4]);
  const value = (n: number) => pattern === 'difference' ? first + step * (n - start) : first * step ** (n - start);
  const observedFirst = variant === 'transfer' && target === 'structure' ? start + 1 : start;
  const observed = Array.from({ length: 4 }, (_, i) => ({ index: observedFirst + i, value: value(observedFirst + i) }));
  const testIndex = target === 'structure' && variant === 'transfer' ? start : observedFirst + (target === 'structure' ? 4 : r.int(5, 7));
  const view = variant === 'build' ? 'windows' : 'numbers';
  return item({ kind, mode: 'sequence', target, ...(target === 'rule' ? { pattern } : {}),
    start, observed, testIndex, view, context: sequenceContext,
    setting: variant === 'transfer' ? 'Uuden kasvihuoneen vaihenumerot alkavat eri kohdasta. Tarkista mallisi puuttuvaan vaiheeseen.'
      : view === 'windows' ? 'Kasvihuoneen seinään lisätään ikkunaryhmiä. Tutki vaiheiden lukumääriä.'
        : 'Kasvihuoneen toisessa siivessä ikkunaryhmät moninkertaistuvat. Käytä annettua havaintolokia.' },
  target === 'structure' ? 'Tutki jokainen näkyvä siirtymä, päättele yhteinen rakenne ja laske puuttuva vaihe.'
    : target === 'rule' ? 'Kirjaa ensimmäinen indeksi. Rakenna oma sääntö ja kokeile sitä näkyvään sekä uuteen vaiheeseen.'
      : 'Tutki siirtymät, rakenna niistä oma sääntö ja koeta sääntöä sekä näkyvään että etäiseen vaiheeseen.',
  'Vertaile vierekkäisiä termejä. Erotus on uusi miinus vanha. Suhde on uusi jaettuna vanhalla. Indeksi kertoo vaiheen.',
  'Tulos sopii havaintoihin tässä tehtävässä sallitun mallin mukaan. Pelkkä rajallinen lista sallii myös muita jatkoja.');
}
function seqDef(id: string, target: 'structure' | 'rule' | 'integration', stop: string, reward: string, tags: readonly [string, string], limit: string): Definition {
  return { id, stop, icon: '⋮', intro: 'Loikka ja Aava suunnittelevat kasvihuoneen ikkunarivejä.',
    goal: target === 'structure' ? 'Tuotat siirtymät ja koetat havaittua rakennetta.' :
      target === 'rule' ? 'Rakennat oman säännön ja tarkistat sen kahdessa vaiheessa.' : 'Yhdistät samassa ikkunajonossa siirtymät ja oman koetellun säännön.',
    reward, produceWhat: target === 'structure' ? 'peräkkäiset erotukset tai suhteet ja puuttuvan termin'
      : 'oman kaavan tai rekursion ja kaksi koetta', limit,
    families: [[tags[0], r => sequence(r, target, 'build')], [tags[1], r => sequence(r, target, 'repair')]], transfer: r => sequence(r, target, 'transfer') };
}
const defs: Definition[] = [
  { id: 'M79-GRAPH-MONO', stop: 'Milloin vedenpinta nousee?', icon: '⌁', intro: 'Aava lukee kasvihuoneen mittauskuvaajaa.',
    goal: 'Erotat kuvaajan kulkusuunnan funktion arvon merkistä.', reward: 'Seurantakyltti näyttää ystäville sopivan havaintoajan.',
    produceWhat: 'omat x-välit, kulkusuunnat ja arvon merkin',
    families: [['compose-maximal-monotonic-intervals', r => monotonic(r, 'build')], ['audit-direction-not-sign', r => monotonic(r, 'repair')]],
    transfer: r => monotonic(r, 'transfer'), limit: 'Kuvaaja on paloittain suora. Arviointi kattaa pisimmät nousevat, laskevat ja vakiojaksot näkyvällä välillä.' },
  { id: 'M79-PARABOLA', stop: 'Kaareva ikkuna', icon: '∪', intro: 'Loikka vertailee saman oloisia ikkunoita.',
    goal: 'Yhdistät neliöllisen säännön tai arvoparit oikeaan paraabeliin.', reward: 'Kaari-ikkunan muoto löytyy.',
    produceWhat: 'erottavan arvoparin ja sitä vastaavan kuvaajan',
    families: [['evaluate-quadratic-and-match-curve', r => recognition(r, 'build')], ['distinguish-curves-from-samples', r => recognition(r, 'repair')]],
    transfer: r => recognition(r, 'transfer'), limit: 'Oma arvopari ja oikean kuvaajan tunnistus arvioidaan. Muut saman U-muodon käyrät ovat näkyviä vertailuja.' },
  { id: 'M79-PARABOLA-GRAPH', stop: 'Kaari valoa varten', icon: '⌒', intro: 'Loikka tarvitsee viiden arvoparin ikkunapiirroksen.',
    goal: 'Rakennat pisteet ja huipun ennen kaaren havainnointia.', reward: 'Kaareva valoikkuna avautuu kasveille.',
    produceWhat: 'omat arvoparit, huipun ja symmetriaparin',
    families: [['place-known-vertices-and-select-smooth-curve', r => construction(r, 'build')], ['derive-missing-mirror-coordinates', r => construction(r, 'repair')]],
    transfer: r => construction(r, 'transfer'), limit: 'Lukitut omat pisteet, huippu ja symmetria arvioidaan täsmällisesti. Sileän käyrätyypin valinta on tunnistusta, ja mallikaari näkyy vasta lukituksen jälkeen.' },
  seqDef('M79-SEQ-STRUCTURE', 'structure', 'Ikkunarivien kasvava kuvio', 'Puuttuva ikkunaryhmä löytyy.',
    ['measure-every-additive-window-step', 'measure-every-multiplicative-step'],
    'Kaikista näkyvistä siirtymistä tuotetaan oma erotus tai suhde. Siirrossa puuttuva kohta on ennen havaittua jonoa.'),
  seqDef('M79-SEQ-RULE', 'rule', 'Pitkän kasvihuoneen ohje', 'Ohje löytää kaukaisenkin ikkunan paikan.',
    ['construct-and-test-additive-rule', 'construct-and-test-multiplicative-rule'],
    'Rajatuissa malleissa oma kaava tai rekursio tarkistetaan kaikilla havaituilla arvoilla. Oppija tuottaa myös näkyvän ja uuden koearvon.'),
  seqDef('M79-SEQ-01', 'integration', 'Valoa koko seinälle', 'Uusi ikkunarivi valmistuu.',
    ['link-additive-structure-to-authored-rule', 'link-multiplicative-structure-to-authored-rule'],
    'Integraatio vaatii omat siirtymät, säännön sekä näkyvän ja etäisen kokeen samassa jonossa. Se ei kirjaa osataidoille näyttöä.'),
];

type GardenSpec = Omit<NodeSpec, 'item'> & { item(r: Rng, phase: Phase): GardenItem };
function spec(def: Definition): GardenSpec {
  const { families, transfer, limit: _limit, ...meta } = def;
  const rev = `exp690-function-garden-${def.id.toLowerCase()}-v1`;
  return { ...meta, rev, validRevs: [rev], produce: [...families.map(([tag]) => tag), 'transfer'],
    demo(r) { return families.map(([, author]) => {
      const example = author(r);
      return { say: example.explain!, scene: functionGardenExample(example.task) };
    }); },
    item(r, phase) {
      const [tag, author] = phase === 'transfer' ? ['transfer', transfer] as const : r.pick(families);
      return { ...author(r), tag };
    },
  };
}
export const functionGardenSpecs: GardenSpec[] = defs.map(spec);
export const functionGardenEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(defs.map(({ id, families, limit }) => [id, { families: families.map(([tag]) => tag), limit }]));
