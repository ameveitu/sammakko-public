import { hasRotation, type SpatialField, type SpatialMeasureTask } from '../models/spatial-measures';
import { spatialMeasureArt } from '../scenes/spatial-measures';
import { askChoice, askNumber, fi, type Choice, type LightAdapter } from './core';

const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
const numberOf = (text: string) => { const m = /^(-?\d+)\/(\d+)$/.exec(text.trim()); return m ? Number(m[1]) / Number(m[2]) : Number(text.replace(',', '.')); };
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
/** The picture without the workbench instructions printed under it. */
const art = (task: SpatialMeasureTask, solved = false) => spatialMeasureArt({ ...task, board: { ...task.board, legend: undefined } as SpatialMeasureTask['board'] }, solved);

const ANGLE_TYPES = [
  { id: 'acute', text: 'terävä kulma', fits: (d: number) => d > 0 && d < 90 },
  { id: 'right', text: 'suora kulma', fits: (d: number) => d === 90 },
  { id: 'obtuse', text: 'tylppä kulma', fits: (d: number) => d > 90 && d < 180 },
  { id: 'straight', text: 'oikokulma', fits: (d: number) => d === 180 },
];
const UNIT_WHY: Record<string, string> = {
  cm: 'cm on pituuden yksikkö.', 'cm²': 'cm² on pinta-alan yksikkö.', 'cm³': 'cm³ on tilavuuden yksikkö.',
  dm: 'dm on pituuden yksikkö.', 'dm²': 'dm² on pinta-alan yksikkö.', 'm²': 'm² on pinta-alan yksikkö.',
};

function choiceSay(label: string): string {
  const fixed: Record<string, string> = {
    'Mitä piirretyn pisteen koko kertoo?': 'Ruudukkoon on merkitty paikka isolla pisteellä. Mitä pisteen koko kertoo?',
    'Rakennetun janan ominaisuus': 'Kuvaan on piirretty jana kahden pisteen välille. Mikä kuvaa janaa?',
    'Koko suoran esitys': 'Mikä piirroksista esittää suoraa?',
    Jatkuminen: 'Suoran piirroksessa on nuolet molemmissa päissä. Miten suora jatkuu kuvan ulkopuolella?',
    'Kulman A kärki': 'Mikä piste on kulman A kärki?',
    'Kulman A kyljet': 'Mitkä janat ovat kulman A kyljet?',
    'Avautumisen vertailu': 'Kumpi kulmista avautuu enemmän?',
    'Pinta-alan yksikkö': 'Missä yksikössä pinta-ala ilmoitetaan?',
    'Tilavuuden yksikkö': 'Missä yksikössä tilavuus ilmoitetaan?',
  };
  if (fixed[label]) return fixed[label]!;
  const angle = /^Kulma (\w)$/.exec(label);
  if (angle) return `Millainen kulma ${angle[1]} on?`;
  return label.endsWith('?') ? label : `Valitse oikea: ${lower(label)}.`;
}

function numberSay(task: SpatialMeasureTask, field: Extract<SpatialField, { kind: 'number' }>): { say: string; unit?: string } {
  const unit = task.board.kind === 'cells' ? task.board.unit : undefined;
  const square = unit ? `Yksi ruutu on 1 ${unit}. ` : '';
  const fixed: Record<string, string> = {
    'Peitetty pinta-ala': `${square}Kuinka suuri on vihreän alueen pinta-ala?`,
    'Vihreän alueen ala': `${square}Kuinka suuri on vihreän alueen pinta-ala?`,
    'Koko ulkosuorakulmion ala': `${square}Kuinka suuri on koko suorakulmion pinta-ala, kun aukko lasketaan mukaan?`,
    'Aukon ala': `${square}Kuinka suuri on valkoisen aukon pinta-ala?`,
    Tilavuus: 'Kuvassa on rakennelman jokainen kerros erikseen ylhäältä katsottuna. Yksi vihreä ruutu on yksi 1 cm³ kuutio. Montako kuutiota rakennelmassa on?',
  };
  if (fixed[field.label]) return { say: fixed[field.label]!, unit };
  const m = /^(.+) \((\w+)\)$/.exec(field.label);
  return m ? { say: `Mikä on ${lower(m[1]!)}?`, unit: m[2] } : { say: `Mikä on ${lower(field.label)}?`, unit };
}

export const spatialMeasuresLight: LightAdapter<SpatialMeasureTask> = (full, context) => {
  const task = full.task, board = task.board, action = task.action;
  const scene = art(task), solved = art(task, true);
  const explain = full.explain ?? task.why;

  if (action?.kind === 'degree') {
    // Drawing an angle becomes reading what kind of angle that size makes.
    const right = ANGLE_TYPES.findIndex(t => t.fits(action.opening));
    return askChoice(full, context, {
      say: `Aava piirtää ${action.opening}° kulman. Millainen kulma siitä tulee?`, scene: solved, ordered: true,
      choices: ANGLE_TYPES.map((t, i) => ({ text: t.text, why: i === right ? undefined : 'Terävä kulma on alle 90°, suora kulma tasan 90°, tylppä kulma 90°–180° ja oikokulma tasan 180°.' })),
      correct: right, explain: `${action.opening}° on ${action.opening < 90 ? 'alle 90°' : 'yli 90° mutta alle 180°'}, joten se on ${ANGLE_TYPES[right]!.text}.`,
    });
  }
  if (action?.kind === 'protractor') {
    // The protractor is already in place: the one idea left is reading the scale that starts from zero.
    const wrong = 180 - action.opening;
    return askChoice(full, context, {
      say: 'Kulmamitta on asetettu kulman kärkeen, ja sen pohjaviiva on sinisen alkukyljen päällä. Mitassa on kaksi asteikkoa. Kuinka suuri kulma on?',
      scene: solved, ordered: true,
      choices: [{ text: `${action.opening}°` }, { text: `${wrong}°`, why: 'Tämä luku on luettu väärältä asteikolta. Lue asteikkoa, jonka nolla on sinisen alkukyljen kohdalla.' }]
        .sort((a, b) => parseInt(a.text) - parseInt(b.text)),
      correct: action.opening < wrong ? 0 : 1,
      explain: `Asteikko, jonka nolla on alkukyljen kohdalla, näyttää toisen kyljen kohdalla ${action.opening}°. Kulma on ${action.opening < 90 ? 'terävä' : 'tylppä'}, joten ${action.opening}° sopii myös silmämääräisesti.`,
    });
  }
  if (action?.kind === 'rotation') {
    const turn = action.allowed.find(d => hasRotation(action.spokes, d));
    return askChoice(full, context, {
      say: 'Tuulimerkki kääntyy keskipisteensä ympäri. Katso sakaroiden pituuksia. Näyttääkö merkki samalta jo ennen täyttä kierrosta?',
      scene, afterCorrect: solved,
      choices: [{ text: 'Näyttää', why: turn === undefined ? 'Sakarat ovat eripituisia. Mikään vajaa kierto ei vie jokaista sakaraa samanpituisen kohdalle.' : undefined },
        { text: 'Ei näytä, vasta täysi kierros', why: turn === undefined ? undefined : `Kokeile kiertoa ${turn}°: jokainen sakara osuu samanpituisen sakaran kohdalle.` }],
      correct: turn === undefined ? 1 : 0, ordered: true, explain,
    });
  }
  if (action?.kind === 'partition') {
    const unit = board.kind === 'cells' ? board.unit : 'cm²';
    return askNumber(full, {
      say: `Yksi ruutu on 1 ${unit}. Vihreä alue ei ole suorakulmio, mutta sen voi jakaa kahdeksi suorakulmioksi. Kuinka suuri on vihreän alueen pinta-ala?`,
      scene, afterCorrect: solved, answer: action.cells.length, unit,
      hint: context.phase === 'guided' ? 'Jaa alue viivalla kahteen suorakulmioon. Laske kummankin ruudut ja lisää ne yhteen.' : undefined,
      explain,
    });
  }
  if (action?.kind === 'points' && !task.fields.length && board.kind === 'grid' && board.path) {
    // Scaling: the width of the figure is enough to see the factor at work.
    const path = board.path, xs = path.map(p => p[0]), xt = action.expected.map(p => p[0]);
    const width = Math.max(...xs) - Math.min(...xs), answer = Math.max(...xt) - Math.min(...xt);
    const factor = answer / width, reduce = factor < 1;
    const k = reduce ? `1/${fi(1 / factor)}` : fi(factor);
    return askNumber(full, {
      say: `Sininen kuvio ${reduce ? 'pienennetään' : 'suurennetaan'} kertoimella ${k}. Kuvio on ${width} ruutua leveä. Kuinka leveä on uusi kuvio?`,
      scene, afterCorrect: solved, answer, unit: 'ruutua',
      whyAt: { [width]: 'Tämä on alkuperäisen kuvion leveys. Kerro se kertoimella.' },
      explain: `${width} · ${k} = ${fi(answer)}. Kaikki pituudet muuttuvat samalla kertoimella, joten kuvion muoto säilyy.`,
    });
  }
  if (action?.kind === 'points' && board.kind === 'grid' && board.motifs?.length === 2) {
    // Translation: compare the same corner in the two copies, one direction at a time.
    const [first, second] = board.motifs as [readonly (readonly [number, number])[], readonly (readonly [number, number])[]];
    const moves = [{ axis: 'vaakasuunnassa', value: second[0]![0] - first[0]![0] }, { axis: 'pystysuunnassa', value: second[0]![1] - first[0]![1] }]
      .filter(m => m.value !== 0);
    const move = context.phase === 'transfer' ? moves.at(-1)! : moves[0]!;
    return askNumber(full, {
      say: `Rantakaistan kuvio toistuu siirtämällä. Kuvassa on kaksi samanlaista sinistä kuviota. Montako ruutua kuvio on siirtynyt ${move.axis}?`,
      scene, afterCorrect: solved, answer: Math.abs(move.value), unit: 'ruutua',
      hint: 'Vertaa samannumeroisia kärkiä: esimerkiksi kärkeä 1 toisen kuvion kärkeen 1.',
      explain: `Jokainen kärki on siirtynyt ${Math.abs(move.value)} ruutua ${move.axis}. Siirrossa kuvion koko ja asento pysyvät samoina.`,
    });
  }

  // Field questions: one field, picked by phase.
  const fields = task.fields;
  if (!fields.length) return null;
  const field = context.phase === 'guided' ? fields[0]! : context.phase === 'transfer' ? fields.at(-1)! : fields[context.r.int(0, fields.length - 1)]!;
  const picture = action?.kind === 'points' ? solved : scene;
  const after = picture === scene ? solved : undefined;

  if (board.kind === 'measure' && board.divisions) {
    // Unit square conversion: first the area factor, then the converted value.
    const start = board.givens[0]!.value, target = board.givens[2]!.value, side = board.givens[1]!.value, n = board.divisions;
    const converted = fields.find(f => f.label === 'Muunnettu pinta-ala')!;
    if (context.phase === 'guided') {
      return askNumber(full, {
        say: `Kuvan iso neliö on 1 ${target}. Sen sivu on jaettu ${n} osaan, koska ${side}. Montako pientä neliötä mahtuu isoon neliöön?`, scene,
        answer: n * n, whyAt: { [n]: `${n} on vain yhden reunan osien määrä. Rivejä on myös ${n}.` },
        explain: `Rivejä on ${n} ja jokaisessa rivissä ${n} pientä neliötä: ${n} · ${n} = ${n * n}.`,
      });
    }
    const answer = numberOf(converted.answer);
    return askNumber(full, {
      say: `Kuvan iso neliö on 1 ${target}, ja siihen mahtuu ${n * n} pientä neliötä. Paljonko ${start} on yksikössä ${target}?`, scene,
      answer, unit: target, tolerance: 0.01,
      whyAt: { [answer * n]: `Pinta-alassa kerroin ei ole ${n} vaan ${n} · ${n} = ${n * n}.` },
      explain: `${start} : ${n * n} = ${fi(answer)} ${target}. Pinta-alan muunnoksessa sivun kerroin otetaan kahdesti.`,
    });
  }
  if (field.kind === 'choice') {
    const right = field.options.findIndex(o => o.id === field.answer);
    const choices: Choice[] = field.options.map((o, i) => ({ text: o.label,
      why: i === right ? undefined : UNIT_WHY[o.label] ?? task.why }));
    return askChoice(full, context, {
      say: choiceSay(field.label), scene: picture, afterCorrect: after, choices, correct: right,
      ordered: field.options.every(o => /^(Piirros )?[A-Z]$/.test(o.label)) || /^Kulma \w$/.test(field.label),
      explain: UNIT_WHY[field.options[right]!.label] ? `${UNIT_WHY[field.options[right]!.label]} ${explain}` : explain,
    });
  }
  if (field.label === 'Suhde kuva : todellinen') {
    // Scale as "1 : k", with the classic slips as alternatives.
    const [a, b] = field.answer.split('/').map(Number) as [number, number];
    const g = gcd(a, b), small = a / g, big = b / g;
    const shown = numberOf(fields.find(f => f.id === 'shown')?.answer ?? '0'), actual = numberOf(fields.find(f => f.id === 'actual')?.answer ?? '0');
    const right = `${small} : ${big}`;
    const wrong: Choice[] = [
      { text: `${big} : ${small}`, why: 'Järjestys on kuva : todellinen. Kuva on pienempi, joten sen luku tulee ensin.' },
      { text: `${small} : ${big * 10}`, why: 'Tarkista yksiköt: molempien pituuksien pitää olla senttimetreinä.' },
      { text: `${small} : ${big / 10}`, why: 'Tarkista yksiköt: molempien pituuksien pitää olla senttimetreinä.' },
    ].filter(c => !c.text.includes('.') && c.text !== right).slice(0, 3);
    return askChoice(full, context, {
      say: `Kuvan pituus on ${fi(shown)} cm ja todellinen pituus ${fi(actual)} cm. Mikä on mittakaava kuva : todellinen?`, scene,
      choices: [{ text: right }, ...wrong], correct: 0,
      explain: `${fi(actual)} : ${fi(shown)} = ${big}. Todellinen pituus on ${big} kertaa kuvan pituus, joten mittakaava on ${right}.`,
    });
  }
  if (board.kind === 'measure' && /^(Kuvan|Todellinen) pituus \(cm\)$/.test(field.label)) {
    const given = board.givens[field.id === 'shown' ? 0 : 1]!;
    const answer = numberOf(field.answer);
    return askNumber(full, {
      say: `${given.label} on ${given.value}. Kuinka monta senttimetriä se on?`, scene, answer, unit: 'cm', tolerance: 0.01,
      explain: `${board.givens[2]?.value ?? ''}. Siksi ${given.value} = ${fi(answer)} cm.`.replace(/^\. /, ''),
    });
  }
  const { say, unit } = numberSay(task, field);
  return askNumber(full, { say, unit, scene: picture, afterCorrect: after, answer: numberOf(field.answer), tolerance: field.answer.includes('/') ? 0.01 : undefined, explain });
};
