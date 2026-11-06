import type { DataField, DataProbabilityTask } from '../models/data-probability';
import { dataProbabilityArt } from '../scenes/data-probability';
import { askChoice, askNumber, fi, type LightAdapter } from './core';

const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
const fraction = (text: string) => { const m = /^(\d+)\/(\d+)$/.exec(text.trim()); return m ? [Number(m[1]), Number(m[2])] as const : undefined; };
const numberOf = (text: string) => { const f = fraction(text); return f ? f[0] / f[1] : Number(text.replace(',', '.')); };

function numberQuestion(field: Extract<DataField, { kind: 'number' }>): { say: string; unit?: string } {
  const label = field.label;
  let m = /^Pussi (\w+): sinisiä$/.exec(label);
  if (m) return { say: `Montako sinistä merkkiä pussissa ${m[1]} on?` };
  m = /^Pussi (\w+): kaikki$/.exec(label);
  if (m) return { say: `Montako merkkiä pussissa ${m[1]} on yhteensä?` };
  m = /^(.+): (pylvään arvo|määrä|arvo)$/.exec(label);
  if (m) return { say: `Katso kuvaa. Mikä on arvo kohdassa ${m[1]}?` };
  m = /^(.+) \((\w+)\)$/.exec(label);
  if (m) return { say: m[1] === 'Yhteensä' ? 'Paljonko on kaikkiaan yhteensä?' : `Mikä on ${lower(m[1]!)}?`, unit: m[2] };
  const fixed: Record<string, string> = {
    'Alkeistuloksia yhteensä': 'Montako erilaista yhdistelmää voi syntyä?',
    'Kaikkien määrä': 'Montako mahdollista tulosta on kaikkiaan?',
    'Suotuisten määrä': 'Monessako tuloksessa ehto toteutuu?',
    Asteikkoväli: 'Kuinka paljon asteikon luvut kasvavat viivasta seuraavaan?',
  };
  return { say: fixed[label] ?? `Mikä on ${lower(label)}?` };
}

function choiceQuestion(field: Extract<DataField, { kind: 'choice' }>): string {
  const label = field.label;
  if (label === 'Kummasta sininen todennäköisemmin?') return 'Kummasta pussista saa sinisen merkin todennäköisemmin?';
  if (label === 'Onko tyyppiarvoa?') return 'Tyyppiarvo on luku, joka esiintyy aineistossa useammin kuin mikään muu. Onko tässä aineistossa tyyppiarvoa?';
  if (label.endsWith('?')) return label;
  if (label === 'Luokkien akseli') return 'Kummalla akselilla paikkojen nimet ovat?';
  if (/yksikkö/i.test(label)) return 'Missä yksikössä arvot on ilmoitettu?';
  if (field.options.some(o => o.id === 'impossible' || o.label === 'Mahdoton')) return `Pussista nostetaan yksi merkki katsomatta. Tapahtuma: ${lower(label)}. Onko se mahdoton, mahdollinen vai varma?`;
  return `Valitse oikea: ${lower(label)}.`;
}

export const dataProbabilityLight: LightAdapter<DataProbabilityTask> = (full, context) => {
  const task = full.task;
  const scene = dataProbabilityArt(task, false), afterCorrect = dataProbabilityArt(task, true);
  const action = task.action;
  if (action?.kind === 'chart' && !task.fields.length) {
    const rows = action.rows;
    if (action.types.some(t => t.type === 'line')) {
      const options = [
        { id: 'changes', text: 'Peräkkäiset mittaukset näyttävät, miten määrä muuttuu.' },
        { id: 'classes', text: 'Sillä vertaillaan erillisiä luokkia, joilla ei ole järjestystä.', why: 'Tässä aineistossa on kellonaikoja peräkkäin. Niiden välillä näkyy muutos.' },
        { id: 'color', text: 'Viivan väri kertoo määrän.', why: 'Väri ei kerro määrää. Korkeus kertoo.' },
        { id: 'pictures', text: 'Samankokoiset kuvat kertovat määrän.', why: 'Tämä kuvaa kuvadiagrammia, ei viivadiagrammia.' },
      ];
      return askChoice(full, context, {
        say: 'Havainnot on laskettu tasatunnein. Ne voi piirtää viivadiagrammiksi. Mitä viivadiagrammi näyttää hyvin?',
        scene: afterCorrect, choices: options, correct: 0,
        explain: 'Viivadiagrammi yhdistää peräkkäiset mittaukset. Viivan nousu ja lasku näyttävät, miten määrä muuttui ajan kuluessa.',
      });
    }
    if (context.phase === 'guided') {
      const max = rows.reduce((a, b) => (b.value > a.value ? b : a));
      return askChoice(full, context, {
        say: 'Taulukosta piirretään pylväsdiagrammi. Kenen pylväästä tulee korkein?', scene, afterCorrect, ordered: true,
        choices: rows.map(r => ({ text: r.label, why: r === max ? undefined : `${r.label}: ${r.value}. Korkein pylväs tulee suurimmalle luvulle.` })),
        correct: rows.indexOf(max), explain: `${max.label} saa korkeimman pylvään, koska sen luku ${max.value} on suurin. Pylvään korkeus kertoo määrän.`,
      });
    }
    const low = rows.reduce((a, b) => (b.value < a.value ? b : a));
    return askNumber(full, {
      say: `Taulukosta piirretään pylväsdiagrammi, jonka asteikko alkaa nollasta. Kuinka korkealle kohdan ${low.label} pylväs ulottuu?`, scene, afterCorrect,
      answer: low.value, explain: `Kohdan ${low.label} arvo on ${low.value}, joten pylväs ulottuu asteikon kohtaan ${low.value}.${low.value === 0 ? ' Nolla piirretään tyhjänä paikkana, ei poisjätettynä.' : ''}`,
    });
  }
  const all = task.fields.filter((f): f is Exclude<DataField, { kind: 'set' }> => f.kind !== 'set' && !/kahdessa joukossa/.test(f.label));
  // Unit and axis names are bookkeeping, not the phenomenon: ask them only when nothing else is left.
  const core = all.filter(f => !/yksikkö|^Luokkien akseli$/i.test(f.label));
  const answerable = core.length ? core : all;
  const mode = task.fields.find((f): f is Extract<DataField, { kind: 'set' }> => f.kind === 'set' && /^Tyyppiarvot/.test(f.label));
  if (mode && mode.answer.length === 1 && context.phase !== 'guided') {
    const right = mode.options.findIndex(o => o.id === mode.answer[0]);
    return askChoice(full, context, {
      say: 'Tyyppiarvo on luku, joka esiintyy aineistossa useimmin. Mikä on tämän aineiston tyyppiarvo?', scene, afterCorrect, ordered: true,
      choices: mode.options.map((o, i) => ({ text: o.label, why: i === right ? undefined : 'Laske, montako kertaa kukin luku esiintyy.' })),
      correct: right, explain: full.explain ?? task.why,
    });
  }
  const complement = task.fields.find((f): f is Extract<DataField, { kind: 'set' }> => f.kind === 'set' && f.label === 'Vastatapahtuman tulokset');
  const event = /^Tapahtuma: (.+?)\. /.exec(full.say)?.[1];
  if (complement && event) {
    return askNumber(full, {
      say: `Pussista nostetaan yksi merkki. Tapahtuma: ${lower(event)}. Monessako mahdollisessa tuloksessa tapahtuma ei toteudu?`, scene, afterCorrect,
      answer: complement.answer.length, explain: `Tulokset, joissa tapahtuma ei toteudu, muodostavat vastatapahtuman. Niitä on ${complement.answer.length}. ${task.why}`,
    });
  }
  if (!answerable.length) {
    const set = task.fields.find((f): f is Extract<DataField, { kind: 'set' }> => f.kind === 'set')!;
    return askNumber(full, {
      say: `Montako vaihtoehtoa kuuluu joukkoon: ${lower(set.label)}?`, scene, afterCorrect, answer: set.answer.length, explain: task.why,
    });
  }
  const field = context.phase === 'guided' ? answerable[0]!
    : context.phase === 'transfer' ? answerable.at(-1)! : answerable[context.r.int(0, answerable.length - 1)]!;
  if (field.kind === 'choice') {
    const right = field.options.findIndex(o => o.id === field.answer);
    return askChoice(full, context, {
      say: choiceQuestion(field), scene, afterCorrect, ordered: true,
      choices: field.options.map((o, i) => ({ text: o.label, why: i === right ? undefined : task.why })),
      correct: right, explain: full.explain ?? task.why,
    });
  }
  const parts = fraction(field.answer);
  if (parts && Number.isInteger(parts[0]) && parts[1] > parts[0] && /kaikista/.test(field.label)) {
    // A share as a fraction: the classic mistake compares blue to the others, not to all.
    const [a, n] = parts;
    const wrong = [{ text: `${a}/${n - a}`, why: `Tässä siniset on verrattu muihin. Osuus verrataan kaikkiin ${n} merkkiin.` },
      { text: `${n - a}/${n}`, why: 'Tämä on muiden kuin sinisten osuus.' }, { text: `${n}/${a}`, why: 'Luvut ovat väärin päin: sinisten määrä tulee viivan yläpuolelle.' }]
      .filter((c, i, list) => c.text !== `${a}/${n}` && list.findIndex(d => d.text === c.text) === i).slice(0, 2);
    const choices = [{ text: `${a}/${n}` }, ...wrong];
    return askChoice(full, context, {
      say: `${field.label.replace(/^Pussi (\w+): sinisiä kaikista$/, 'Kuinka suuri osa pussin $1 merkeistä on sinisiä?')}`, scene, afterCorrect,
      choices, correct: 0, explain: `Sinisiä on ${a} ja kaikkia ${n}, joten osuus on ${a}/${n}.`,
    });
  }
  const difference = /erotus/i.test(field.label) ? task.fields.filter((f): f is Extract<DataField, { kind: 'number' }> => f.kind === 'number' && /^(.+): /.test(f.label)) : [];
  if (difference.length === 2) {
    const [x, y] = difference.map(f => ({ name: /^(.+): /.exec(f.label)![1]!, value: numberOf(f.answer) }));
    const [big, small] = x!.value >= y!.value ? [x!, y!] : [y!, x!];
    return askNumber(full, {
      say: `Katso kuvaa. Kuinka paljon suurempi arvo on kohdassa ${big.name} kuin kohdassa ${small.name}?`, scene, afterCorrect,
      answer: big.value - small.value, whyAt: { [big.value]: `Tämä on kohdan ${big.name} arvo. Vähennä siitä kohdan ${small.name} arvo.` },
      explain: `Erotus kertoo, kuinka paljon enemmän: ${fi(big.value)} − ${fi(small.value)} = ${fi(big.value - small.value)}.`,
    });
  }
  const { say, unit } = numberQuestion(field);
  const answer = numberOf(field.answer);
  return askNumber(full, {
    say, unit, scene, afterCorrect, answer, tolerance: parts ? 0.01 : undefined,
    explain: parts ? `${field.answer} = ${fi(answer)}. ${full.explain ?? task.why}` : full.explain ?? task.why,
  });
};
