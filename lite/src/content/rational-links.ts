import type { Item, NodeSpec, Phase } from '../engine/types';
import type { Rng } from '../engine/rng';
import { decimalLabel } from './models/decimal-workshop';
import { rationalFormatNames, rationalMark, shareHundredths, type RationalFormat, type RationalLinkTask } from './models/rational-links';
import { decimalWorkbench, type DecimalWorkbench } from './scenes/decimal-workshop';
import { showRationalMark } from './scenes/rational-links';

const audit = 'repair-linked-labels';
const construct = 'build-linked-labels';
const families = [audit, construct] as const;
type Family = typeof families[number] | 'transfer';
type LinkItem = Omit<Item, 'task'> & { task: RationalLinkTask; quantityModel: DecimalWorkbench };
type RationalNodeSpec = Omit<NodeSpec, 'item'> & { item: (r: Rng, phase: Phase) => LinkItem };
type Definition = Pick<NodeSpec, 'id' | 'stop' | 'icon' | 'intro' | 'goal' | 'reward'> & {
  formats: readonly RationalFormat[];
  /** [sadasosat, kokonaisen mitta] */
  transfer: readonly (readonly [number, number])[];
  transferDraft?: boolean;
  limit: string;
};

const defs: readonly Definition[] = [
  {
    id: 'M-RATREP-DEC-PCT', stop: 'Aseman kaksi näyttöä', icon: '◉',
    intro: 'Loikan desimaalinäyttö ja Aavan prosentti-ikkuna välittävät saman saaren tilauksen.',
    goal: 'Opit tarkistamaan ja kokoamaan samaa osuutta kuvaavat desimaali- ja prosenttilaput.',
    reward: 'Aseman molemmat näytöt välittävät saman tilauksen.',
    formats: ['decimal', 'percent'], transfer: [[3, 100], [7, 100], [125, 4], [150, 8]],
    limit: 'Korjauksessa annettu näyttö säilyy ja oppija kirjoittaa toisen. Mittauksessa oppija tuottaa molemmat merkinnät. Siirto arpoo pienen tai yli yhden kokonaisen osuuden.',
  },
  {
    id: 'M-RATREP-FRAC-DEC', stop: 'Kaksi nimeä samalle osalle', icon: '◫',
    intro: 'Kaksi viestilappua kuvaa samaa lähetystä. Aava tarkistaa, paljonko osa on samasta kokonaisesta.',
    goal: 'Opit yhdistämään murtoluvun ja desimaaliluvun yhden mitatun osuuden perusteella.',
    reward: 'Kaksi lappua yhdistyi yhdeksi täsmälliseksi lähetykseksi.',
    formats: ['fraction', 'decimal'], transfer: [[15, 20], [35, 40], [45, 20]],
    limit: 'Näyttö kohdistaa ja tuottaa enintään sadasosiin päättyviä osia. Siirrossa käytetään uutta köysimittaa. Murtoluvun samansuuruus riittää.',
  },
  {
    id: 'M-RATREP-FRAC-PCT', stop: 'Majavan osuus asemalla', icon: '◒',
    intro: 'Majavan sopimus käyttää murtolukua ja vastaanottava saari prosentteja. Molemmat viittaavat samaan kokonaisuuteen.',
    goal: 'Opit rakentamaan ja vertaamaan yhtä suuria murto-osia ja prosenttiosuuksia.',
    reward: 'Kumpikin saari sai sopimuksesta saman osuuden.',
    formats: ['fraction', 'percent'], transfer: [[25, 12], [50, 18], [75, 16]], transferDraft: true,
    limit: 'Itsenäisessä mittauksessa tuotetaan molemmat esitykset. Siirrossa valmiin supistamattoman murtoluvun voi säilyttää ja prosentti kirjoitetaan itse. Vapaa perustelu arvioidaan erikseen.',
  },
  {
    id: 'M-RATREP-01', stop: 'Kolmen saaren yhteinen lähetys', icon: '✦',
    intro: 'Kolme saarta käyttää samaan lähetykseen eri merkintöjä. Yhteinen majakkamerkki syttyy, kun koko viestiketju täsmää.',
    goal: 'Opit tarkistamaan saman osuuden murtolukuna, desimaalilukuna ja prosenttina samassa viestissä.',
    reward: 'Yhteinen majakkamerkki syttyi. Kaikki kolme saarta saivat saman viestin.',
    formats: ['fraction', 'decimal', 'percent'], transfer: [[125, 4], [150, 8], [175, 12]],
    limit: 'Korjaus tarkistaa kaikki kolme merkintää, vaikka osa on annettu. Mittauksessa ja siirrossa tuotetaan kaikki kolme itse, myös yli yhden kokonaisen. Tämä kirjaa vain integraatiotehtävän oman näytön.',
  },
];

function expandedFraction(hundredths: number, factor = 2): string {
  const [n, d] = rationalMark('fraction', hundredths).split('/').map(Number);
  return `${n! * factor}/${d! * factor}`;
}

function mistakenMark(format: RationalFormat, hundredths: number): string {
  if (format === 'fraction') return hundredths === 50 ? '1/5' : `${hundredths}/10`;
  if (format === 'decimal') return hundredths === 20 ? '0,5' : String(hundredths);
  return decimalLabel(hundredths);
}

function labelsFor(r: Rng, def: Definition, family: Family, hundredths: number): RationalLinkTask['labels'] {
  if (family === 'transfer' && def.transferDraft) {
    return def.formats.map(format => format === 'fraction'
      ? { format, proposed: expandedFraction(hundredths, 3) }
      : { format });
  }
  if (family !== audit) return def.formats.map(format => ({ format }));

  const reference = r.pick(def.formats);
  const wrong = r.pick(def.formats.filter(format => format !== reference));
  return def.formats.map(format => {
    const value = format === 'fraction' ? expandedFraction(hundredths)
      : format === 'decimal' && hundredths % 10 === 0 ? decimalLabel(hundredths, 1) : rationalMark(format, hundredths);
    if (format === reference) return { format, given: value };
    return { format, proposed: format === wrong ? mistakenMark(format, hundredths) : value };
  });
}

function taskItem(r: Rng, def: Definition, family: Family, phase: Phase): LinkItem {
  const transfer = family === 'transfer';
  const repair = family === audit;
  const [share, full] = transfer ? r.pick(def.transfer) :
    [r.pick([20, 25, 40, 50, 75, 80]), r.pick([20, 40, 60])] as const;
  const part = share * full / 100;
  const expectedHundredths = shareHundredths(part, full);
  const task: RationalLinkTask = { kind: 'rational-link', expectedHundredths, labels: labelsFor(r, def, family, expectedHundredths) };
  const unit = transfer ? 'm' : 'helmeä';
  const whole = transfer ? `Tehtävän vertailuköysi on ${full} m. Se on 1 kokonainen eli 100 %.`
    : `Yksi täysi mittakori vetää ${full} helmeä. Se on 1 kokonainen eli 100 %.`;
  const board: DecimalWorkbench = {
    whole,
    rows: [
      ...(repair ? [] : [{ label: transfer ? 'Tehtävän mitattu köysi' : 'Varattu lähetys', value: `${part} ${unit}`,
        ...(phase === 'guided' ? { fill: expectedHundredths } : {}) }]),
      ...(transfer ? [{ label: 'Toinen saari, mitattu / vertailu', value: `${2 * part} m / ${2 * full} m` }] : []),
    ],
    note: transfer ? `Kirjoita osuus tehtävän omasta ${full} metrin kokonaisesta. Toisella saarella sama osuus voi tarkoittaa eri metrimäärää.`
      : repair ? 'Ensimmäisen saaren vahvistettu merkintä näkyy valmiina. Tarkista kaikki luonnokset sen rinnalla.'
        : undefined,
  };
  const solved: DecimalWorkbench = {
    ...board,
    rows: [
      ...board.rows,
      ...def.formats.map(format => ({
        label: rationalFormatNames[format], value: showRationalMark(format, rationalMark(format, expectedHundredths)),
        fill: expectedHundredths,
      })),
    ],
    receipt: def.reward,
  };
  const equal = def.formats.map(format => showRationalMark(format, rationalMark(format, expectedHundredths))).join(' = ');
  return {
    tag: family, task, quantityModel: board, scene: decimalWorkbench(board), afterCorrect: decimalWorkbench(solved),
    say: repair ? 'Yksi luonnos kuvaa väärää osuutta. Korjaa lähetys niin, että kaikki merkinnät täsmäävät vahvistettuun lappuun.'
      : def.transferDraft && transfer ? 'Tarkista luonnoksen murtoluku ja täydennä osuus myös prosentteina.'
        : 'Kirjoita mitattu osuus jokaisella pyydetyllä merkintätavalla.',
    hint: 'Etsi ensin sama kokonainen. Yksi sadasosa siitä on 1/100, 0,01 tai 1 %.',
    explain: `${equal}. ${repair ? 'Jokainen lappu kertoo saman osuuden yhdestä täydestä korista.'
      : `Suhde on ${part} ${unit} : ${full} ${unit}. Kaikki merkinnät viittaavat samaan nimettyyn kokonaiseen.`}`,
  };
}

function lesson(def: Definition): RationalNodeSpec {
  const { formats, transfer: _transfer, transferDraft: _draft, limit: _limit, ...meta } = def;
  const rev = `exp690-lm09-${def.id.toLowerCase()}-v1`;
  return {
    ...meta, rev, validRevs: [rev],
    demo() {
      const board: DecimalWorkbench = {
        whole: 'Yksi mittakori vetää 20 helmeä. Se on 1 kokonainen eli 100 %.',
        rows: [{ label: 'Lähetykseen varattu', value: '5 helmeä', fill: 25 }],
      };
      const labels = formats.map(format => ({
        label: rationalFormatNames[format], value: showRationalMark(format, rationalMark(format, 25)), fill: 25,
      }));
      return [
        { say: 'Aava tarkistaa, kuinka suuren osuuden viisi helmeä muodostaa yhdestä täydestä mittakorista.', scene: decimalWorkbench(board) },
        { say: `Viisi helmeä kahdestakymmenestä on ${labels.map(label => label.value).join(' = ')}. Sama osuus voidaan kertoa eri merkinnöillä.`,
          scene: decimalWorkbench({ ...board, rows: [...board.rows, ...labels], receipt: def.reward }) },
      ];
    },
    item(r, phase) { return taskItem(r, def, phase === 'transfer' ? 'transfer' : r.pick(families), phase); },
  };
}

export const rationalLinksSpecs: RationalNodeSpec[] = defs.map(lesson);
export const rationalLinksEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(defs.map(({ id, limit }) => [id, { families, limit }]));
