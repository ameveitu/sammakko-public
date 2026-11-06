import { rng, type Rng } from '../engine/rng';
import type { Item, NodeSpec, Phase } from '../engine/types';
import type { ObservedExplanationTask } from './models/observed-explanations';
import { explanationBoard } from './scenes/observed-explanations';

type Scenario = Pick<ObservedExplanationTask, 'givens' | 'prompt' | 'rubric' | 'model'>;
type ExplanationSpec = Omit<NodeSpec, 'item'> & { item: (r: Rng, phase: Phase) => Omit<Item, 'task'> & { task: ObservedExplanationTask } };
type Author = (r: Rng) => Scenario;
type Definition = Pick<NodeSpec, 'id' | 'stop' | 'icon' | 'intro' | 'goal' | 'reward'> & {
  channel: ObservedExplanationTask['channel'];
  families: readonly [readonly [string, Author], readonly [string, Author]];
  transfer: Author;
  demo: Author;
  limit: string;
};
const given = (label: string, value: string) => ({ label, value });
const criterion = (id: string, label: string, guide: string) => ({ id, label, guide });
const strategyPrompt = 'Vertaa kahta tapaa omin sanoin. Mitä kummassakin tehdään, miksi tulos on sama ja milloin valitsisit toisen?';

function compareWays(givens: Scenario['givens'], steps: string, same: string, advantage: string, model: string): Scenario {
  return {
    givens, prompt: strategyPrompt,
    rubric: [
      criterion('steps', 'Erottaa tavat', steps),
      criterion('same-total', 'Perustelee saman tuloksen', same),
      criterion('situated-choice', 'Perustelee valinnan', advantage),
    ],
    model,
  };
}

function compareAddition(r: Rng, [a, b] = r.pick([[27, 19], [36, 29], [43, 39], [34, 49]])): Scenario {
  const tens = b - 9, total = a + b;
  return compareWays([
    given('Pulma', `Yhdistä ${a} ja ${b} kiveä.`),
    given('Aavan tapa', `${a} + ${tens} = ${a + tens} → + 9 = ${total}`),
    given('Loikan tapa', `${a} + ${b + 1} = ${total + 1} → − 1 = ${total}`),
  ], 'Pilkkooko oppija lisättävän toisessa ja tunnistaako hän pyöristyksen korjauksen toisessa?',
  `Kummassakin lisätään lopulta ${b}. Tulos on ${total}.`,
  'Esimerkiksi tasakympin läheisyys tai tutut kympit puoltavat valintaa.',
  `Aava lisää ensin kympit ja sitten yhdeksän. Loikka lisää yhden liikaa ja ottaa sen pois. Molemmat lisäävät ${b}. Valitsen Loikan tavan, koska ${b} on vain yhden päässä tasakympistä.`);
}

function compareDifference(r: Rng): Scenario {
  const [a, b] = r.pick([[54, 48], [72, 67], [83, 77], [62, 58]] as const);
  const ten = a - a % 10, d = a - b;
  return compareWays([
    given('Pulma', `Kuinka paljon ${a} cm on pidempi kuin ${b} cm?`),
    given('Aavan tapa', `${a} − ${ten} = ${a - ten}; ${ten} − ${b} = ${ten - b}; yhteensä ${d} cm`),
    given('Loikan tapa', `${b} → ${ten} (+${ten - b}) → ${a} (+${a - ten}); yhteensä ${d} cm`),
  ], 'Kuvaako oppija välien kulkemisen eri suunnista?', `Molemmat laskevat saman ${b}–${a} cm välin pituuden.`,
  'Yhdistää valinnan mittaan, tasakymmeneen tai siihen, mistä mittaaminen aloitetaan.',
  `Aava mittaa välin kahdessa osassa suuremmasta luvusta päin. Loikka laskee ylöspäin lyhyemmästä. Välit ovat samat. Jos lyhyen köyden pää on mittanauhalla valmiina, aloittaisin siitä kuten Loikka.`);
}

const decimal = (tenths: number) => `${Math.floor(tenths / 10)},${tenths % 10}`;
function compareDecimal(r: Rng): Scenario {
  const [a, b] = r.pick([[27, 19], [36, 29], [43, 39]] as const);
  const wholes = b - 9, total = a + b;
  return compareWays([
    given('Pulma', `Liitä ${decimal(a)} m ja ${decimal(b)} m nauhat.`),
    given('Aavan tapa', `${decimal(a)} + ${decimal(wholes)} = ${decimal(a + wholes)} → + 0,9 = ${decimal(total)}`),
    given('Loikan tapa', `${decimal(a)} + ${decimal(b + 1)} = ${decimal(total + 1)} → − 0,1 = ${decimal(total)}`),
  ], 'Kuvaako oppija kokonaiset metrit ja desimaaliosat sekä 0,1 metrin korjauksen?',
  `Kummassakin lisätään ${decimal(b)} m ja saadaan ${decimal(total)} m.`,
  'Perustele esimerkiksi, milloin täyteen metriin pyöristäminen selkeyttää mittaa.',
  `Aava lisää täydet metrit ja sitten 0,9 m. Loikka täydentää toisen nauhan ensin täyteen metriin ja vähentää ylimääräisen 0,1 m. Molemmat lisäävät saman pituuden. Loikan tapa auttaa, jos mittanauhassa täydet metrit erottuvat hyvin.`);
}

function speakCount(r: Rng, [a, b] = r.pick([[5, 4], [4, 3], [6, 3], [3, 5]])): Scenario {
  return {
    givens: [given('Telttapöytä', `${a} isoa ja ${b} pientä kiilaa`), given('Loikan merkintä', `${a} + ${b} = ${a + b} kiilaa`)],
    prompt: 'Kerro kuulijalle, miten Loikka sai kiilojen yhteismäärän. Kerro myös, mitä luvut tarkoittavat.',
    rubric: [
      criterion('connect-quantity', 'Yhdistää luvut kiiloihin', 'Nimeää kummankin ryhmän tai osoittaa ne ja kertoo määrät.'),
      criterion('explain-combine', 'Kertoo miten määrä löytyy', 'Kuvaa ryhmien yhdistämisen, yhteenlaskun tai jatkolaskun ymmärrettävästi.'),
    ],
    model: `Isoja kiiloja on ${a} ja pieniä ${b}. Lasken molemmat samaan kasaan, koska tarvitaan yhteismäärä. Saan ${a + b} kiilaa.`,
  };
}

function speakMissing(r: Rng): Scenario {
  const [need, have] = r.pick([[10, 6], [9, 5], [8, 3], [7, 4]] as const);
  return {
    givens: [given('Telttakatos', `Tarvitaan ${need} kiilaa. Valmiina on ${have}.`), given('Aavan merkintä', `${have} + ${need - have} = ${need} kiilaa`)],
    prompt: 'Kerro omin sanoin, miten Aava tietää, montako kiilaa vielä tarvitaan.',
    rubric: [
      criterion('connect-quantity', 'Nimeää tavoitteen ja valmiit', 'Erottelee tarvittavan kokonaismäärän ja jo valmiina olevat kiilat.'),
      criterion('explain-gap', 'Selittää puuttuvan määrän', 'Kuvaa, miten täydentäminen tai erotus antaa puuttuvat kiilat. Pelkkä tulos ei riitä.'),
    ],
    model: `Kiiloja tarvitaan ${need}. Meillä on ${have}, joten täydennän siitä ${need}:ään. Lisään ${need - have} kiilaa.`,
  };
}

function speakTransfer(r: Rng): Scenario {
  const [a, b] = r.pick([[7, 5], [8, 6], [6, 7]] as const);
  return {
    givens: [given('Sulkan eväslaukku', `${a} omenaa ja ${b} päärynää`), given('Muistilappu', `${a} + ${b} = ${a + b} hedelmää`)],
    prompt: 'Kuvittele, että Sulka on uusi kuulija. Kerro aikuiselle, miten Sulka voi tarkistaa hedelmien yhteismäärän.',
    rubric: [
      criterion('connect-quantity', 'Selittää luvut uudelle kuulijalle', 'Kertoo, mitkä luvut ovat omenia, päärynöitä ja kaikkia hedelmiä.'),
      criterion('explain-combine', 'Perustelee yhteismäärän', 'Selittää, miten molemmat hedelmäryhmät lasketaan mukaan.'),
    ],
    model: `Omenat ja päärynät ovat eri ryhmiä, mutta kysytään kaikkia hedelmiä. Lasken ${a} ja ${b} yhteen. Yhteensä niitä on ${a + b}.`,
  };
}

function chooseMessage(givens: Scenario['givens'], prompt: string, shown: string, fit: string, model: string): Scenario {
  return {
    givens, prompt,
    rubric: [
      criterion('choose', 'Nimeää oman esitystapansa', 'Sopiva vaihtoehto tai muu toimiva esitys käy.'),
      criterion('show', 'Osoittaa tiedon viestistä', shown),
      criterion('fit', 'Perustelee vastaanottajan hyödyn', fit),
    ],
    model,
  };
}

function messageMeasure(r: Rng, n = r.pick([3, 4, 5])): Scenario {
  return chooseMessage([
    given('Majavan tarve', `Pituus ${n} m. Hän tarkistaa pituuden metrin palalla.`),
    given('Viestipöytä', `Mitta: ${Array(n).fill('1 m').join(' | ')}.  Lappu: ${n} m.`),
  ], 'Kirjoita, kumman viestin antaisit Majavalle. Mitä hän voi siitä nähdä ja tehdä?',
  `Nimeää pituuden ${n} m ja osoittaa, mistä se käy valitussa esityksessä ilmi.`,
  'Kytkee esityksen metrin palalla tarkistamiseen. Myös selitetty merkintä käy.',
  `Lähettäisin mittakuvan. Siinä näkyy ${n} peräkkäistä metrin palaa. Majava voi tarkistaa oman köytensä siirtämällä metrin palaa yhtä monta kertaa.`);
}

function messageGroups(r: Rng): Scenario {
  const n = r.pick([3, 4, 5] as const);
  return chooseMessage([
    given('Majavan tarve', `Jaa ${2 * n} tappia kahteen telttaan niin, että kumpikin saa yhtä monta.`),
    given('Viestipöytä', `Ryhmäkuva: ${n} | ${n}.  Yhteismäärän lappu: ${2 * n} tappia.`),
  ], 'Kirjoita, millä esitystavalla neuvoisit tasajaon. Osoita, mistä saaja näkee kummankin teltan määrän.',
  `Osoittaa kaksi ${n} tapin ryhmää tai vastaavan tasajaon.`,
  'Perustelee, miten viesti kertoo kummankin teltan osuuden pelkän yhteismäärän lisäksi.',
  `Valitsisin ryhmäkuvan. Pystyviiva erottaa teltat, ja molemmilla puolilla lukee ${n}. Majava näkee siitä, montako tappia kumpaankin telttaan viedään.`);
}

function messageTransfer(r: Rng): Scenario {
  const [a, b] = r.pick([[8, 5], [7, 10], [9, 6], [6, 8]] as const);
  const unit = (n: number) => '●'.repeat(n);
  return chooseMessage([
    given('Sulkan tarve', `Kummalla rannalla on enemmän ja kuinka monta enemmän? Aava: ${a}. Loikka: ${b}.`),
    given('Aavan pisterivi', unit(a)),
    given('Loikan pisterivi', unit(b)),
    given('Yhteismäärän lappu', `${a + b} kiveä`),
  ], 'Valitse Sulkalle viesti määrien vertaamiseen. Osoita, miten viesti kertoo sekä suuremman määrän että eron.',
  `Osoittaa, että ${a > b ? 'Aavalla' : 'Loikalla'} on ${Math.abs(a - b)} kiveä enemmän.`,
  'Kertoo, miten valitusta esityksestä eron voi tarkistaa, esimerkiksi kohdistamalla pisteet pareiksi.',
  `Lähettäisin pisterivit rinnakkain niin, että ne alkavat samasta kohdasta. Kun kivet paritetaan, ${a > b ? 'Aavalle' : 'Loikalle'} jää ${Math.abs(a - b)} paritonta pistettä. Siitä näkee sekä suuremman määrän että eron.`);
}

const definitions: readonly Definition[] = [
  {
    id: 'M-PS-04', stop: 'Kaksi siltaa samaan vastaukseen', icon: '↔', channel: 'written',
    intro: 'Aava ja Loikka ovat ratkaisseet saman pulman eri tavoin. Kummankin tapa mahtuu telttaseinälle.',
    goal: 'Opit vertaamaan kahta toimivaa ratkaisua ja perustelemaan, milloin käyttäisit kumpaakin tapaa.',
    reward: 'Molemmat selitykset mahtuvat telttaseinälle. Ystävät sopivat tilanteeseen sopivan tavan.',
    families: [['compare-compensation', compareAddition], ['compare-difference-directions', compareDifference]],
    transfer: compareDecimal, demo: r => compareAddition(r, [22, 19]),
    limit: 'Aikuinen lukee oman vertailun. Kriteerit koskevat vaiheita, yhteistä tulosta ja tilanteeseen sopivaa etua. Harjoitus käyttää annettuja toimivia ratkaisuja.',
  },
  {
    id: 'M-REP-03', stop: 'Kerro miten tiesit', icon: '◌', channel: 'spoken',
    intro: 'Aava antaa Loikalle aikaa kertoa, mistä hän tiesi teltan tarvitseman kiilamäärän.',
    goal: 'Opit kertomaan tutun ratkaisun omin sanoin niin, että kuulija ymmärtää, miten päättelit.',
    reward: 'Aava kääntää vihkon kuulijaa kohti. Ystävät jakavat oman ajatuksensa rauhassa.',
    families: [['speak-combine-groups', speakCount], ['speak-explain-missing-part', speakMissing]],
    transfer: speakTransfer, demo: r => speakCount(r, [2, 4]),
    limit: 'Suullinen havainto vaatii vieressä olevan kuulijan. Puhetta ei tallenneta tai pisteytetä automaattisesti. Esimerkit käyttävät tuttuja pieniä määriä.',
  },
  {
    id: 'M-REP-05', stop: 'Majavan ymmärrettävä viesti', icon: '◇', channel: 'written',
    intro: 'Majava tarvitsee viestin, josta hän ymmärtää oman rakennusvuoronsa myös veden toisella puolella.',
    goal: 'Opit valitsemaan vastaanottajalle sopivan esitystavan ja osoittamaan, mitä siitä voi nähdä.',
    reward: 'Majava ymmärsi viestin ja toteuttaa oman paikallisen rakennusvuoronsa.',
    families: [['choose-measuring-message', messageMeasure], ['choose-sharing-message', messageGroups]],
    transfer: messageTransfer, demo: r => messageMeasure(r, 2),
    limit: 'Oppija perustelee valinnan omin sanoin. Aikuinen arvioi yhteyden esityksen ja vastaanottajan tarpeen välillä. Harjoitus ei arvioi vapaata kuvan piirtämistä.',
  },
];

function taskFor(def: Definition, r: Rng, phase: Phase): { task: ObservedExplanationTask; tag: string } {
  const [tag, create] = phase === 'transfer' ? ['transfer', def.transfer] as const : r.pick(def.families);
  return { tag, task: { kind: 'observed-explanation', channel: def.channel, ...create(r) } };
}

function lesson(def: Definition): ExplanationSpec {
  const rev = `exp690-lm02-${def.id.toLowerCase()}-v1`;
  return {
    id: def.id, stop: def.stop, icon: def.icon, intro: def.intro, goal: def.goal, reward: def.reward,
    rev, validRevs: [rev],
    demo() {
      const task: ObservedExplanationTask = { kind: 'observed-explanation', channel: def.channel, ...def.demo(rng(1)) };
      return [{ say: task.prompt, scene: explanationBoard(task) }, { say: task.model, scene: explanationBoard(task) }];
    },
    item(r, phase) {
      const { task, tag } = taskFor(def, r, phase);
      return {
        task, tag, say: task.prompt, scene: explanationBoard(task),
        hint: def.id === 'M-PS-04' ? 'Seuraa ensin kummankin tavan ensimmäistä vaihetta ja katso, mihin ne päätyvät.'
          : def.id === 'M-REP-03' ? 'Aloita kertomalla, mitä luvut tarkoittavat. Kerro sitten, mitä teit niille.'
            : 'Kysy ensin, mitä viestin saajan pitää tehdä. Etsi merkintä, joka auttaa juuri siinä.',
        explain: task.model,
      };
    },
  };
}

export const observedExplanationSpecs: ExplanationSpec[] = definitions.map(lesson);
export const observedExplanationEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(definitions.map(def => [def.id, { families: def.families.map(([tag]) => tag), limit: def.limit }]));
