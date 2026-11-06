import { polygonVertexIds, shapePairings, type GeometryRelationField, type GeometryRelationsTask } from '../models/geometry-relations';
import { mountGeometryRelations } from '../scenes/geometry-relations';
import { askChoice, askNumber, figuresOf, fi, type Choice, type LightAdapter } from './core';

const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
const numberOf = (text: string) => { const m = /^(-?\d+)\/(\d+)$/.exec(text.trim()); return m ? Number(m[1]) / Number(m[2]) : Number(text.replace(',', '.')); };
const POLYGON: Record<number, string> = { 3: 'kolmio', 4: 'nelikulmio', 5: 'viisikulmio', 6: 'kuusikulmio', 7: 'seitsenkulmio', 8: 'kahdeksankulmio' };
const LETTER = 'ABC';

/** The workbench's own drawing, without its controls; `solved` shows the finished construction. */
const picture = (task: GeometryRelationsTask, solved = false) => figuresOf(host => {
  const widget = mountGeometryRelations(task, host, () => {});
  if (solved) widget.reveal();
});

const CRITERIA: Record<string, string> = {
  SSS: 'kolme sivua', SAS: 'kaksi sivua ja niiden välinen kulma', ASA: 'kaksi kulmaa ja niiden välinen sivu', AAS: 'kaksi kulmaa ja sivu',
  ratioSSS: 'kolme sivua samassa suhteessa', ratioSAS: 'kaksi sivua samassa suhteessa ja niiden välinen kulma', AA: 'kaksi kulmaa',
};

export const geometryRelationsLight: LightAdapter<GeometryRelationsTask> = (full, context) => {
  const task = full.task, board = task.board, action = task.action;
  const scene = picture(task), solved = picture(task, true);
  const explain = full.explain ?? task.why;

  if (action?.kind === 'match' && board.kind === 'shapes') {
    const [source, ...models] = board.shapes;
    const right = models.findIndex(m => shapePairings(source!, m, action.invariant).length > 0);
    if (right < 0) return null;
    const congruent = action.invariant === 'congruent';
    return askChoice(full, context, {
      say: congruent
        ? 'Yhtenevä kuvio saadaan siirtämällä, kiertämällä tai peilaamalla, ilman venytystä. Mikä malleista on yhtenevä alkuperäisen kanssa?'
        : 'Yhdenmuotoisessa kuviossa jokainen pituus muuttuu samalla kertoimella. Mikä malleista on yhdenmuotoinen alkuperäisen kanssa?',
      scene, afterCorrect: solved, ordered: true,
      choices: models.map((m, i) => ({ text: m.label, why: i === right ? undefined : congruent
        ? 'Vertaa sivujen pituuksia. Tässä mallissa jokin sivu on eri pituinen kuin alkuperäisessä.'
        : 'Vertaa sivujen suhteita. Tässä mallissa sivut eivät muutu samalla kertoimella.' })),
      correct: right, explain,
    });
  }
  if (action?.kind === 'criterion') {
    const ids = action.invariant === 'congruent' ? ['SSS', 'SAS', 'ASA', 'AAS'] : ['ratioSSS', 'ratioSAS', 'AA'];
    const right = ids.indexOf(action.expected);
    const shown = board.kind === 'criterion' ? { ...task, board: { ...board, shapes: board.shapes.slice(0, 2) } } : task;
    return askChoice(full, context, {
      say: action.invariant === 'congruent'
        ? 'Kolmioissa on merkitty pareittain yhtä suuret sivut ja kulmat. Mitkä tiedot on merkitty?'
        : 'Kolmioissa on merkitty samassa suhteessa olevat sivut ja yhtä suuret kulmat. Mitkä tiedot on merkitty?',
      scene: picture(shown), ordered: true,
      choices: ids.map((id, i) => ({ text: CRITERIA[id]!, why: i === right ? undefined : 'Laske kuvasta merkityt sivut ja kulmat. Katso myös, onko kulma merkittyjen sivujen välissä.' })),
      correct: right,
      explain: `Merkitty on ${CRITERIA[action.expected]}. Ne riittävät: niistä kolmion ${action.invariant === 'congruent' ? 'koko ja muoto määräytyvät' : 'muoto määräytyy'} yksiselitteisesti.`,
    });
  }
  if (action?.kind === 'construct') {
    if (context.phase === 'transfer') {
      return askNumber(full, {
        say: 'Janan päätepisteistä piirretään samalla säteellä kaaret. Kaarien leikkauspisteiden kautta piirretään suora. Kuinka suuren kulman suora muodostaa janan kanssa?',
        scene: solved, answer: 90, unit: '°', explain,
      });
    }
    return askChoice(full, context, {
      say: 'Janan päätepisteistä A ja B piirretään samalla säteellä kaaret. Kaarien leikkauspisteiden kautta piirretään suora. Mikä suora syntyy?',
      scene, afterCorrect: solved,
      choices: [{ text: 'Keskinormaali: se kulkee janan keskipisteen kautta kohtisuoraan janaa vastaan.' },
        { text: 'Janan suuntainen suora.', why: 'Leikkauspisteet ovat janan eri puolilla, joten niiden kautta kulkeva suora leikkaa janan.' },
        { text: 'Suora, joka kulkee pisteen A kautta.', why: 'Leikkauspisteet ovat yhtä kaukana A:sta ja B:stä, joten suora kulkee A:n ja B:n puolivälistä.' }],
      correct: 0, explain,
    });
  }
  if (action?.kind === 'triangulate' && board.kind === 'polygon') {
    const n = polygonVertexIds(board).length, name = POLYGON[n] ?? `${n}-kulmio`;
    if (context.phase === 'guided') {
      return askNumber(full, {
        say: `${name.charAt(0).toUpperCase() + name.slice(1)} jaetaan kolmioiksi piirtämällä lävistäjät yhdestä kärjestä. Montako kolmiota syntyy?`,
        scene, afterCorrect: solved, answer: n - 2, whyAt: { [n]: 'Piirrä lävistäjät: kärjestä ei voi piirtää lävistäjää viereisiin kärkiin.' },
        hint: 'Laske kuvasta: jokainen lävistäjä lisää yhden kolmion.', explain: `${name.charAt(0).toUpperCase()}${name.slice(1)} jakautuu ${n - 2} kolmioon. ${explain}`,
      });
    }
    return askNumber(full, {
      say: `${name.charAt(0).toUpperCase() + name.slice(1)} on jaettu ${n - 2} kolmioon. Jokaisen kolmion kulmien summa on 180°. Mikä on ${name}n kulmien summa?`,
      scene: solved, answer: 180 * (n - 2), unit: '°', whyAt: { [180 * n]: `Kolmioita on ${n - 2}, ei ${n}.` },
      explain: `${n - 2} · 180° = ${180 * (n - 2)}°. ${explain}`,
    });
  }
  if (board.kind === 'scale') {
    const k = task.fields.find((f): f is Extract<GeometryRelationField, { kind: 'number' }> => f.kind === 'number' && f.label === 'Pituuskerroin');
    if (k && context.phase !== 'guided') {
      const kk = numberOf(k.answer), area = context.phase === 'independent';
      const fmt = (v: number) => (kk < 1 ? `1/${fi(1 / v)}` : fi(v));
      const choices: Choice[] = [
        { text: fmt(kk), why: `Tämä on pituuksien kerroin. ${area ? 'Pinta-alassa' : 'Tilavuudessa'} pituus kerrotaan ${area ? 'kahteen' : 'kolmeen'} suuntaan.` },
        { text: fmt(kk ** 2), why: area ? undefined : 'Tämä on pinta-alan kerroin. Tilavuudessa on kolme suuntaa.' },
        { text: fmt(kk ** 3), why: area ? 'Tämä on tilavuuden kerroin. Pinta-alassa on kaksi suuntaa.' : undefined },
      ];
      return askChoice(full, context, {
        say: `Malli ${kk < 1 ? 'pienennetään' : 'suurennetaan'} niin, että kaikki pituudet kerrotaan luvulla ${fmt(kk)}. Millä luvulla ${area ? 'pinta-ala' : 'tilavuus'} kerrotaan?`,
        scene, choices, correct: area ? 1 : 2, ordered: true,
        explain: `${area ? 'Pinta-alassa pituus muuttuu kahteen suuntaan' : 'Tilavuudessa pituus muuttuu kolmeen suuntaan'}: ${fmt(kk)} · ${fmt(kk)}${area ? '' : ` · ${fmt(kk)}`} = ${fmt(area ? kk ** 2 : kk ** 3)}.`,
      });
    }
  }

  const fields = task.fields;
  if (!fields.length) return null;
  const numberFirst = board.kind === 'scale' ? fields.filter(f => /Puuttuva sivu/.test(f.label)) : fields;
  const pool = numberFirst.length ? numberFirst : fields;
  const field = context.phase === 'guided' ? pool[0]! : context.phase === 'transfer' ? pool.at(-1)! : pool[context.r.int(0, pool.length - 1)]!;
  const lead = leadFor(task, field);
  const view = board.kind === 'ray' ? solved : scene;
  const after = view === scene ? solved : undefined;

  if (field.kind === 'choice') {
    const right = field.options.findIndex(o => o.id === field.answer);
    return askChoice(full, context, {
      say: lead + choiceSay(task, field), scene: view, afterCorrect: after, correct: right,
      ordered: field.options.every(o => /^(Kyllä|Ei|[A-D])$/.test(o.label)) || /^Viiva \w$/.test(field.label),
      choices: field.options.map((o, i) => ({ text: o.label, why: i === right ? undefined : task.why })), explain,
    });
  }
  if (field.kind === 'set') return null;
  const answer = numberOf(field.answer);
  const unit = /\((°|cm|cm²|cm³)\)$/.exec(field.label)?.[1];
  return askNumber(full, {
    say: lead + numberSay(task, field), scene: view, afterCorrect: after, answer, unit, tolerance: field.answer.includes('/') ? 0.01 : undefined,
    explain,
  });
};

function anglesText(task: GeometryRelationsTask) {
  if (task.board.kind !== 'triangle') return '';
  const { angles, hide } = task.board;
  return angles.map((a, i) => (i === hide ? null : `${LETTER[i]} = ${a}°`)).filter(Boolean).join(', ');
}

function leadFor(task: GeometryRelationsTask, field: GeometryRelationField): string {
  const before = task.fields.slice(0, task.fields.indexOf(field)).find(f => f.kind === 'choice' && /ristikulma$/.test(f.label));
  if (before && before.kind === 'choice') return `${before.label} on ${before.options.find(o => o.id === before.answer)?.label}. `;
  if (field.label === 'Mikä ehto estää?') return `Kulmista ${anglesText(task)} ei synny kolmiota. `;
  return '';
}

function choiceSay(task: GeometryRelationsTask, field: Extract<GeometryRelationField, { kind: 'choice' }>): string {
  const label = field.label;
  const fixed: Record<string, string> = {
    'Rakennetun viivan jatkuminen': 'Kuvaan on piirretty puolisuora, joka alkaa pisteestä A. Miten se jatkuu?',
    'Suorat leikkaavat': 'Jatka suoria mielessäsi kuvan ulkopuolelle. Leikkaavatko ne toisensa?',
    'Suorat ovat kohtisuorassa': 'Ovatko suorat kohtisuorassa toisiaan vastaan, eli muodostavatko ne suoran kulman?',
    'Suorat ovat yhdensuuntaiset': 'Jatka suoria mielessäsi kuvan ulkopuolelle. Ovatko ne yhdensuuntaiset?',
    'Yhdessä oikokulman muodostava pari': 'Mitkä kaksi kulmaa muodostavat yhdessä oikokulman eli 180°?',
    'Voiko näistä syntyä kolmio?': `Ehdotetut kulmat ovat ${anglesText(task)}. Voiko niistä koota kolmion?`,
    'Voiko jokaisen kulman päätellä jakamalla summan tasan?': 'Kuvion kulmat eivät ole kaikki yhtä suuria. Saako yhden kulman jakamalla kulmien summan kulmien määrällä?',
  };
  if (fixed[label]) return fixed[label]!;
  let m = /^Viiva (\w)$/.exec(label);
  if (m) return `Millainen viiva ${m[1]} on?`;
  m = /^Kaareva (\w) on$/.exec(label);
  if (m) return `Onko kaareva viiva ${m[1]} avoin vai suljettu?`;
  m = /^Kulman (\w) ristikulma$/.exec(label);
  if (m) return `Ristikulmat ovat toistensa vastapäätä, kun kaksi suoraa leikkaa. Mikä kulma on kulman ${m[1]} ristikulma?`;
  m = /^Miten (\w) liittyy annettuun\?$/.exec(label);
  if (m) return `Miten kulma ${m[1]} liittyy annettuun kulmaan?`;
  m = /^(\w):n ja (\w):n yhteinen sääntö$/.exec(label);
  if (m) return `Miten kulmat ${m[1]} ja ${m[2]} liittyvät annettuun kulmaan?`;
  return label.endsWith('?') ? label : `Valitse oikea: ${lower(label)}.`;
}

function numberSay(task: GeometryRelationsTask, field: Extract<GeometryRelationField, { kind: 'number' }>): string {
  const label = field.label.replace(/ \((°|cm|cm²|cm³)\)$/, '');
  const fixed: Record<string, string> = {
    'Annettujen kulmien summa': `Ehdotetut kulmat ovat ${anglesText(task)}. Mikä on niiden summa?`,
    'Kärkien muodostama kulma': 'Kolmion kolme kulmaa leikataan irti ja asetetaan vierekkäin samaan kärkeen. Kuinka suuren kulman ne muodostavat yhdessä?',
    'Ristikulman suuruus': 'Kuinka suuri ristikulma on?',
    'Puuttuva sivu': 'Kuvioiden vastaavat sivut ovat samassa suhteessa. Kuinka pitkä on puuttuva sivu?',
    Pituuskerroin: 'Millä luvulla pituudet kerrotaan?',
    'Kolmioiden määrä': 'Montako kolmiota lävistäjät muodostavat?',
    'Sisäkulmien summa': 'Mikä on kuvion kulmien summa?',
  };
  if (fixed[label]) return fixed[label]!;
  let m = /^Puuttuva kulma (\w)$/.exec(label);
  if (m) return `Kolmion kulmat ovat ${anglesText(task)}. Kuinka suuri on kulma ${m[1]}?`;
  m = /^Kulma (\w)$/.exec(label) ?? /^(\w)$/.exec(label);
  if (m) return `Kuinka suuri on kulma ${m[1]}?`;
  m = /^Viereinen kulma (\w)$/.exec(label);
  if (m) return `Kuinka suuri on viereinen kulma ${m[1]}?`;
  return `Mikä on ${lower(label)}?`;
}
