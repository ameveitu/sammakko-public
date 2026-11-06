import type { Paint } from '../../engine/types';
import {
  inquiryConclusion, inquiryConfigurationForSetup, inquiryMembership, inquiryModelWitness, inquiryMotionChange, inquiryRead, inquiryTerrainRoute,
  type InquiryConfiguration, type InquiryDataRow, type InquiryIslandsTask, type InquiryOutcome, type InquiryProperty,
  type InquiryRule, type InquirySample, type InquirySetup, type InquiryTerrain, type InquiryVariable,
} from '../models/inquiry-islands';
import { askChoice, askNumber, card, figuresOf, fi, type Choice, type LightContext, type LightAdapter } from './core';
import { inquiryIslandsPaint } from '../scenes/inquiry-islands';

type Mode<M extends InquiryIslandsTask['mode']> = Extract<InquiryIslandsTask, { mode: M }>;

/* Pictures: drawn samples, a two-column A/B table, measuring bars, a height grid and a lamp-and-stick drawing. */

const INK = '#24443a';
const esc = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const list = (names: readonly string[]) => names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} ja ${names.at(-1)}`;
const text = (x: number, y: number, s: string, size = 13, anchor = 'middle', weight = 400, fill = INK) =>
  `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;

function picture(markup: string, label: string, width: number, height: number): Paint {
  return host => {
    const wrap = document.createElement('div');
    wrap.setAttribute('data-light-figure', '');
    wrap.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}" style="display:block;width:100%;max-height:260px;font-family:inherit">${markup}</svg>`;
    host.replaceChildren(wrap);
  };
}

/** Rows of the A and B trials side by side; rows that differ are bold and tinted. */
function trialTable(rows: readonly (readonly [string, string, string])[], intro?: string, outro?: string): Paint {
  return host => {
    const wrap = document.createElement('div');
    wrap.setAttribute('data-light-figure', '');
    wrap.style.cssText = 'display:grid;gap:6px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.72);border:1px solid rgba(0,0,0,.08)';
    const line = (s: string) => { const p = document.createElement('p'); p.style.margin = '0'; p.textContent = s; return p; };
    if (intro) wrap.append(line(intro));
    const table = document.createElement('table');
    table.style.cssText = 'border-collapse:collapse;width:100%;font-size:15px';
    const head = table.insertRow();
    for (const [i, s] of ['', 'Koe A', 'Koe B'].entries()) {
      const th = document.createElement('th'); th.textContent = s;
      th.style.cssText = `padding:3px 6px;text-align:${i ? 'center' : 'left'};color:#445`;
      head.append(th);
    }
    for (const [label, a, b] of rows) {
      const tr = table.insertRow(), differs = a !== b;
      if (differs) tr.style.background = 'rgba(242,190,92,.28)';
      for (const [i, s] of [label, a, b].entries()) {
        const td = tr.insertCell(); td.textContent = s;
        td.style.cssText = `padding:4px 6px;text-align:${i ? 'center' : 'left'};${i && differs ? 'font-weight:700' : i ? '' : 'color:#445'}`;
      }
    }
    wrap.append(table);
    if (outro) { const p = line(outro); p.className = 'small'; wrap.append(p); }
    host.replaceChildren(wrap);
  };
}

// ------------------------------------------------------------------ words
const VARIABLE: Partial<Record<InquiryVariable, string>> = {
  wind: 'puhaltimen teho', area: 'purjeen koko', mass: 'massa', gate: 'veräjä', flow: 'veden virtaus', drag: 'pyörän jarru',
  lampX: 'lyhdyn paikka', height: 'kepin pituus', material: 'materiaali', water: 'veden määrä', seconds: 'koeaika',
  initialSpeed: 'alkuvauhti', forceX: 'työntö eteenpäin', forceY: 'työntö sivulle', surface: 'pinta', initialVX: 'alkuvauhti', retardation: 'jarrutus',
};
const PER_KIND: Partial<Record<InquiryConfiguration['kind'], Partial<Record<InquiryVariable, string>>>> = { absorb: { area: 'palan koko' }, wheel: { gate: 'veräjän asento' } };
let kindNow: InquiryConfiguration['kind'] | undefined;
const word = (v: InquiryVariable) => (kindNow && PER_KIND[kindNow]?.[v]) ?? VARIABLE[v] ?? v;
/** "Miten X vaikuttaa …" */
const OUTCOME: Record<InquiryOutcome, string> = {
  'forward-displacement': 'siihen, kuinka pitkälle kiekko liukuu', 'side-displacement': 'siihen, kuinka paljon vene siirtyy sivulle',
  turn: 'siihen, kääntyykö vene', 'wheel-speed': 'pyörän vauhtiin', 'shadow-length': 'varjon pituuteen', absorbed: 'siihen, kuinka paljon vettä pala imee',
};
const MATERIAL: Record<string, string> = { cloth: 'kangas', paper: 'paperi', plastic: 'muovi' };
const squares = (n: number) => `${fi(n)} ${n === 1 ? 'ruutu' : 'ruutua'}`;
function valueText(c: InquiryConfiguration, v: InquiryVariable): string {
  const x = (c as unknown as Record<string, string | number | boolean>)[v];
  if (v === 'gate') return x ? 'auki' : 'kiinni';
  if (v === 'surface') return x === 'rough' ? 'karhea' : 'sileä';
  if (v === 'material') return MATERIAL[String(x)] ?? String(x);
  if (v === 'lampX') return `${squares(Math.abs(Number(x)))} ${Number(x) < 0 ? 'vasemmalla' : 'oikealla'}`;
  if (v === 'water') return `${x} ml`;
  if (v === 'seconds') return `${x} s`;
  if (v === 'height') return squares(Number(x));
  return String(x);
}
/** Which variables a learner sees for each apparatus (the declared model constants stay out). */
const SHOWN: Record<InquiryConfiguration['kind'], readonly InquiryVariable[]> = {
  sail: ['wind', 'area', 'mass'], wheel: ['gate', 'flow', 'drag'], shadow: ['height', 'lampX'], absorb: ['material', 'area', 'water'],
  motion: ['forceY', 'forceX', 'surface', 'mass'],
};
const THING: Record<InquiryConfiguration['kind'], string> = { sail: 'lehtivene', wheel: 'vesipyörä', shadow: 'varjo', absorb: 'imupala', motion: 'kiekko' };
const configRows = (a: InquiryConfiguration, b: InquiryConfiguration) => SHOWN[a.kind].map(v => [cap(word(v)), valueText(a, v), valueText(b, v)] as const);
const changedOf = (a: InquiryConfiguration, b: InquiryConfiguration) => SHOWN[a.kind].filter(v => valueText(a, v) !== valueText(b, v));
const num = (q: readonly [bigint, bigint]) => Number(q[0]) / Number(q[1]);

/** The measured result of one trial, as a number and as words. */
function result(c: InquiryConfiguration, seconds: number): { value: number; unit: string; words: string } | undefined {
  const r = inquiryRead(c, 'A', seconds);
  if (!r) return;
  switch (c.kind) {
    case 'sail': { const v = num(r.y); return { value: v, unit: 'cm', words: `siirtyi sivulle ${fi(v)} cm` }; }
    case 'motion': { const v = num(r.x); return { value: v, unit: 'cm', words: `liukui ${fi(v)} cm` }; }
    case 'wheel': { const v = num(r.quantity); return { value: v, unit: '', words: v ? `pyörii, vauhti ${fi(v)}` : 'seisoo' }; }
    case 'shadow': { const v = Math.abs(num(r.quantity)); return { value: v, unit: 'ruutua', words: `varjo ${fi(v)} ruutua` }; }
    case 'absorb': { const v = num(r.quantity); return { value: v, unit: 'ml', words: `imi ${fi(v)} ml` }; }
  }
}

/** A fair contrast for a setup whose two trials are still equal: change exactly one shown variable. */
function contrast(setup: InquirySetup, context: LightContext, differ = context.phase === 'guided'): [InquiryConfiguration, InquiryConfiguration] | undefined {
  const a = setup.initial[0];
  const variables = context.phase === 'guided' ? setup.variables : context.r.shuffle([...setup.variables]);
  for (const v of variables) for (const option of setup.values[v] ?? []) {
    const b = { ...a, [v]: option } as InquiryConfiguration;
    if (valueText(a, v) === valueText(b, v) || !inquiryConfigurationForSetup(setup, b) || !result(b, setup.seconds)) continue;
    if (result(a, setup.seconds)!.value === result(b, setup.seconds)!.value && differ) continue;
    return [a, b];
  }
  return;
}

// ------------------------------------------------------------------ observe
function observe(full: Parameters<LightAdapter>[0], context: LightContext, task: Mode<'observe'>) {
  const scene = figuresOf(inquiryIslandsPaint(task), task.image.before ? 'Kaksi kuvaa samasta kohdasta: ennen ja jälkeen.' : undefined);
  const seen = task.features.filter(f => f.observable && f.property !== 'change');
  const guesses = task.features.filter(f => !f.observable && f.value === 'cause');
  const wrongFacts = task.features.filter(f => !f.observable && f.value !== 'cause');
  const guessWhy = 'Tätä ei näe kuvasta. Se on arvaus.';
  if (context.phase === 'guided') {
    const fact = seen.find(f => f.property === 'count') ?? seen[0]!;
    return askChoice(full, context, {
      say: 'Havainto on se, mikä kuvassa näkyy. Mikä lause on havainto?', scene,
      choices: [{ text: fact.label }, ...guesses.map(g => ({ text: g.label, why: guessWhy }))], correct: 0,
      explain: `Lause "${fact.label}" kertoo vain sen, mikä kuvassa näkyy. Siksi se on havainto. Muita lauseita ei näe kuvasta, joten ne ovat arvauksia.`,
    });
  }
  if (context.phase === 'independent') {
    const facts = context.r.shuffle(seen).slice(0, 2), guess = guesses[0]!;
    return askChoice(full, context, {
      say: 'Mikä lause on arvaus eikä havainto?', scene,
      choices: [{ text: guess.label }, ...facts.map(f => ({ text: f.label, why: 'Tämä näkyy kuvasta, joten se on havainto.' }))], correct: 0,
      explain: `Lause "${guess.label}" on arvaus, koska sitä ei näe kuvasta. Muut lauseet kertovat vain sen, mikä kuvassa näkyy.`,
    });
  }
  const fact = context.r.pick(seen);
  return askChoice(full, context, {
    say: 'Katso kuvaa tarkasti. Mikä lause pitää paikkansa?', scene,
    choices: [{ text: fact.label }, ...wrongFacts.map(f => ({ text: f.label, why: f.property === 'count' ? 'Laske jäljet uudelleen yksi kerrallaan.' : 'Katso reunoja tarkemmin.' }))], correct: 0,
    explain: `Lause "${fact.label}" pitää paikkansa: sen näkee kuvasta. Hyvä havainto on tarkka, joten jäljet lasketaan ja katsotaan huolella.`,
  });
}

// ------------------------------------------------------------------ compare and classify
const SAMPLE_NAME: Record<InquirySample['kind'], [string, string]> = { stone: ['kivi', 'kiveä'], leaf: ['lehti', 'lehteä'], shell: ['simpukka', 'simpukkaa'], material: ['näyte', 'näytettä'] };
const COLOUR: Record<InquirySample['colour'], [string, string]> = { grey: ['harmaa', '#a5aaa8'], brown: ['ruskea', '#a87b4f'], green: ['vihreä', '#7fae63'] };
function propertyText(s: InquirySample, p: InquiryProperty): string {
  switch (p) {
    case 'length': return `pituus ${s.length} cm`;
    case 'width': return `leveys ${s.width} cm`;
    case 'colour': return COLOUR[s.colour][0];
    case 'surface': return s.surface === 'rough' ? 'karhea' : 'sileä';
    case 'floats': return s.floats ? 'kelluu' : 'uppoaa';
    case 'bend': return `taipuisuus ${s.bend}/3`;
    case 'transparent': return s.transparent ? 'läpinäkyvä' : 'ei läpinäkyvä';
  }
}
function ruleText(rule: InquiryRule): string {
  switch (rule.property) {
    case 'length': return `pituus on vähintään ${rule.value} cm`;
    case 'width': return `leveys on vähintään ${rule.value} cm`;
    case 'bend': return `taipuisuus on vähintään ${rule.value}/3`;
    case 'colour': return `väri on ${COLOUR[rule.value as InquirySample['colour']]?.[0] ?? rule.value}`;
    case 'surface': return `pinta on ${rule.value === 'rough' ? 'karhea' : 'sileä'}`;
    case 'floats': return 'näyte kelluu';
    case 'transparent': return 'näyte on läpinäkyvä';
  }
}
/** Each sample drawn to scale with its letter and its values; `basket` puts a basket mark on members. */
function samplesPicture(samples: readonly InquirySample[], properties: readonly InquiryProperty[], basket?: (s: InquirySample) => boolean): Paint {
  // At most three samples per row keeps the values readable on a phone.
  const w = 120, cols = Math.min(3, samples.length), rowH = 96 + properties.length * 17;
  const shapes = samples.map((s, i) => {
    const x = (i % cols) * w + w / 2, top = Math.floor(i / cols) * rowH + 18;
    const rx = Math.min(48, 6 + s.length * 3.8), ry = Math.min(24, 4 + s.width * 4), y = top + 36;
    const stroke = s.surface === 'rough' ? 'stroke-dasharray="3 2"' : '';
    const fill = s.kind === 'material' && s.transparent ? '#e3f1f7' : COLOUR[s.colour][1];
    const body = s.kind === 'leaf'
      ? `<path d="M${x - rx} ${y}Q${x} ${y - ry * 2} ${x + rx} ${y}Q${x} ${y + ry * 2} ${x - rx} ${y}Z" fill="${fill}" stroke="#4d5a43" stroke-width="1.6" ${stroke}/><path d="M${x - rx} ${y}H${x + rx}" stroke="#4d5a43"/>`
      : s.kind === 'material' ? `<rect x="${x - rx}" y="${y - ry}" width="${rx * 2}" height="${ry * 2}" rx="4" fill="${fill}" stroke="#4d5a43" stroke-width="1.6" ${stroke}/>`
        : `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="#4d5a43" stroke-width="1.6" ${stroke}/>`;
    const facts = properties.map((p, k) => text(x, top + 82 + k * 17, propertyText(s, p), 14));
    const mark = basket?.(s) ? `<rect x="${x - 57}" y="${top - 16}" width="114" height="${rowH - 6}" rx="10" fill="rgba(242,190,92,.16)" stroke="#c98a2b" stroke-width="2.5"/>` : '';
    return mark + text(x, top + 2, s.id === 'U' ? 'Uusi U' : s.id, 16, 'middle', 700) + body + facts.join('');
  });
  return picture(shapes.join(''), `${samples.length} näytettä ja niiden ominaisuudet`, cols * w, Math.ceil(samples.length / cols) * rowH + 4);
}

function compare(full: Parameters<LightAdapter>[0], context: LightContext, task: Mode<'compare'>) {
  const [one, many] = SAMPLE_NAME[task.samples[0]!.kind];
  const a = task.samples.find(s => s.id === task.pair[0])!, b = task.samples.find(s => s.id === task.pair[1])!;
  const comparing = task.skill === 'compare' || (task.skill === 'compare-classify' && context.phase === 'guided');
  if (comparing) {
    const pairScene = samplesPicture([a, b], task.properties);
    if (context.phase === 'guided' || task.skill === 'compare-classify') {
      // A fair comparison looks at the same property in both samples.
      const [p, q] = task.properties.length > 1 ? [task.properties[0]!, task.properties[1]!] : [task.properties[0]!, task.properties[0]!];
      return askChoice(full, context, {
        say: `Aava vertaa kahta ${many}: ${a.id} ja ${b.id}. Mikä vertailu on reilu?`, scene: pairScene,
        choices: [
          { text: `${a.id}:n ${propertyName(p)} ja ${b.id}:n ${propertyName(p)}` },
          { text: `${a.id}:n ${propertyName(p)} ja ${b.id}:n ${propertyName(q)}`, why: 'Tässä verrataan kahta eri asiaa. Vertaa samaa ominaisuutta molemmista.' },
          { text: `${a.id}:n ${propertyName(q)} ja ${b.id}:n ${propertyName(p)}`, why: 'Tässä verrataan kahta eri asiaa. Vertaa samaa ominaisuutta molemmista.' },
        ], correct: 0,
        explain: `Vertailu on reilu, kun molemmista katsotaan samaa ominaisuutta. ${a.id}: ${propertyText(a, p)}. ${b.id}: ${propertyText(b, p)}.`,
      });
    }
    const numeric = task.properties.filter((p): p is 'length' | 'width' => (p === 'length' || p === 'width') && a[p] !== b[p]);
    if (numeric.length && context.phase === 'independent') {
      const p = context.r.pick(numeric), [big, small] = a[p] > b[p] ? [a, b] : [b, a], diff = big[p] - small[p];
      return askNumber(full, {
        say: `Kuinka monta senttimetriä ${p === 'length' ? 'pidempi' : 'leveämpi'} ${one} ${big.id} on kuin ${one} ${small.id}?`, scene: pairScene, unit: 'cm',
        answer: diff, whyAt: { [big[p]]: `Tämä on ${one} ${big.id}:n ${propertyName(p)}. Vähennä siitä ${small.id}:n ${propertyName(p)}.` },
        explain: `${big.id}: ${big[p]} cm ja ${small.id}: ${small[p]} cm. Ero on ${big[p]} − ${small[p]} = ${diff} cm.`,
      });
    }
    const kinds = task.properties.filter(x => x !== 'length' && x !== 'width'), differ = kinds.filter(x => propertyText(a, x) !== propertyText(b, x));
    const p = context.r.pick(differ.length && context.r.chance(0.5) ? differ : kinds), same = propertyText(a, p) === propertyText(b, p);
    return askChoice(full, context, {
      say: `Vertaa näytteitä ${a.id} ja ${b.id}: ovatko ne samanlaisia vai erilaisia, kun katsotaan ominaisuutta "${propertyName(p)}"?`, scene: pairScene, ordered: true,
      choices: [{ text: 'Samanlaisia', why: same ? undefined : `${a.id}: ${propertyText(a, p)}, ${b.id}: ${propertyText(b, p)}.` }, { text: 'Erilaisia', why: same ? `Molemmat: ${propertyText(a, p)}.` : undefined }],
      correct: same ? 0 : 1, explain: `${a.id}: ${propertyText(a, p)}. ${b.id}: ${propertyText(b, p)}. Ne ovat ${same ? 'samanlaisia' : 'erilaisia'} tässä ominaisuudessa.`,
    });
  }
  const rules = task.rules;
  if (context.phase === 'transfer' && rules.length > 1) {
    // Which rule made these baskets? The other rules split the samples differently.
    const rule = context.r.pick(rules), inBasket = (s: InquirySample) => inquiryMembership(s, rule) === 1;
    const key = (r: InquiryRule) => task.samples.map(s => inquiryMembership(s, r)).join('');
    const others = rules.filter(r => key(r) !== key(rule));
    if (others.length) {
      return askChoice(full, context, {
        say: `Sulka laittoi koriin näytteet, joiden ympärillä on kehys. Millä säännöllä hän lajitteli?`, scene: samplesPicture(task.samples, [...new Set(rules.map(r => r.property))], inBasket),
        choices: [{ text: cap(ruleText(rule)) }, ...others.slice(0, 2).map(r => ({ text: cap(ruleText(r)), why: `Tällä säännöllä koriin menisivät ${list(task.samples.filter(s => inquiryMembership(s, r)).map(s => s.id)) || 'ei mikään'}.` }))],
        correct: 0, explain: `Koriin menivät ${list(task.samples.filter(inBasket).map(s => s.id))}. Sääntö "${ruleText(rule)}" sopii niihin kaikkiin, mutta ei muihin näytteisiin.`,
      });
    }
  }
  const rule = rules[0]!, members = task.samples.filter(s => inquiryMembership(s, rule) === 1);
  if (context.phase === 'guided') {
    const inside = inquiryMembership(task.boundary, rule) === 1;
    return askChoice(full, context, {
      say: `Lajittelusääntö: koriin menee, jos ${ruleText(rule)}. Kuuluuko uusi näyte U koriin?`, scene: samplesPicture([...task.samples, task.boundary], [rule.property]), ordered: true,
      choices: [{ text: 'Kuuluu koriin', why: `U: ${propertyText(task.boundary, rule.property)}. Sääntö ei täyty.` }, { text: 'Ei kuulu koriin', why: `U: ${propertyText(task.boundary, rule.property)}. Sääntö täyttyy.` }],
      correct: inside ? 0 : 1, explain: `U: ${propertyText(task.boundary, rule.property)}. Sääntö ${inside ? 'täyttyy, joten U kuuluu koriin' : 'ei täyty, joten U ei kuulu koriin'}. Sama sääntö pätee jokaiseen näytteeseen.`,
    });
  }
  return askNumber(full, {
    say: `Lajittelusääntö: koriin menee, jos ${ruleText(rule)}. Montako näytettä kuvasta menee koriin?`, scene: samplesPicture(task.samples, [rule.property]),
    answer: members.length, explain: members.length ? `Koriin menevät ${list(members.map(s => s.id))}, koska sääntö "${ruleText(rule)}" sopii niihin. Yhteensä ${members.length}.` : `Sääntö "${ruleText(rule)}" ei sovi mihinkään näytteeseen, joten koriin menee 0.`,
  });
}
const PROPERTY_NAME: Record<InquiryProperty, string> = { length: 'pituus', width: 'leveys', colour: 'väri', surface: 'pinta', floats: 'kelluminen', bend: 'taipuisuus', transparent: 'läpinäkyvyys' };
const propertyName = (p: InquiryProperty) => PROPERTY_NAME[p];

// ------------------------------------------------------------------ question and plan
const NOT_TESTABLE: Record<InquiryConfiguration['kind'], readonly string[]> = {
  sail: ['Onko lehtivene kaunis?', 'Pitääkö Loikka purjehtimisesta?'], wheel: ['Onko vesipyörä hauska?', 'Kuka rakensi ensimmäisen vesipyörän?'],
  absorb: ['Mikä imupala on kaunein?', 'Mistä kaupasta kangas on ostettu?'], shadow: ['Onko varjo pelottava?', 'Kuka sytytti lyhdyn?'], motion: ['Onko kiekko kaunis?', 'Mitä kiekko ajattelee?'],
};
function setupCard(setup: InquirySetup): Paint {
  return card([['Voit muuttaa', list(setup.variables.map(word))], ['Voit mitata', list(setup.outcomes.map(o => OUTCOME[o].replace(/^siihen, /, '')))]], `${setup.name}`);
}
function question(full: Parameters<LightAdapter>[0], context: LightContext, task: Mode<'question'>) {
  kindNow = task.setup.kind;
  const s = task.setup, variable = context.phase === 'guided' ? s.variables[0]! : context.r.pick(s.variables), outcome = context.r.pick(s.outcomes);
  const good = `Miten ${word(variable)} vaikuttaa ${OUTCOME[outcome]}?`;
  return askChoice(full, context, {
    say: 'Mihin kysymykseen voi vastata kokeella tällä tutkimuspöydällä?', scene: setupCard(s),
    choices: [{ text: good }, ...NOT_TESTABLE[s.kind].map(q => ({ text: q, why: /kaun|hausk|pelott|pitää|ajattel/.test(q) ? 'Tämä on mielipide. Siihen ei voi vastata mittaamalla.' : 'Tähän ei voi vastata tämän pöydän välineillä.' }))],
    correct: 0, explain: `Kokeella tutkittava kysymys kertoo, mitä muutetaan (${word(variable)}) ja mitä mitataan. Mielipiteeseen ei voi vastata mittaamalla.`,
  });
}
function plan(full: Parameters<LightAdapter>[0], context: LightContext, task: Mode<'plan'>) {
  kindNow = task.setup.kind;
  const s = task.setup, pair = contrast(s, context);
  if (!pair) return null;
  const [a, b] = pair, changed = changedOf(a, b)[0]!;
  if (context.phase === 'guided') {
    const others = SHOWN[a.kind].filter(v => v !== changed);
    return askChoice(full, context, {
      say: 'Reilussa kokeessa vain yksi asia muuttuu. Mikä asia muuttuu kokeiden A ja B välillä?', scene: trialTable(configRows(a, b)),
      choices: [{ text: cap(word(changed)) }, ...others.map(v => ({ text: cap(word(v)), why: `${cap(word(v))} on molemmissa sama: ${valueText(a, v)}.` }))], correct: 0,
      explain: `Vain ${word(changed)} muuttuu: ${valueText(a, changed)} ja ${valueText(b, changed)}. Kaikki muu pidetään samana, joten ero tuloksessa johtuu tästä yhdestä asiasta.`,
    });
  }
  if (context.phase === 'independent') {
    // Loikka's version may change a second thing too.
    const second = SHOWN[a.kind].find(v => v !== changed && (s.values[v]?.length ?? 0) > 1);
    const unfair = second && context.r.chance(0.6);
    const bb = unfair ? { ...b, [second]: s.values[second]!.find(x => valueText({ ...a, [second]: x } as InquiryConfiguration, second) !== valueText(a, second)) } as InquiryConfiguration : b;
    const fair = changedOf(a, bb).length === 1;
    return askChoice(full, context, {
      say: 'Loikka suunnitteli kokeet A ja B. Onko vertailu reilu?', scene: trialTable(configRows(a, bb)), ordered: true,
      choices: [
        { text: 'On, vain yksi asia muuttuu', why: fair ? undefined : 'Katso korostetut rivit: niitä on kaksi.' },
        { text: 'Ei, kaksi asiaa muuttuu yhtä aikaa', why: fair ? 'Vain yksi rivi on korostettu.' : undefined },
      ], correct: fair ? 0 : 1,
      explain: fair ? `Vain ${word(changed)} muuttuu, joten ero tuloksessa johtuu siitä.` : `Sekä ${word(changed)} että ${word(second!)} muuttuvat. Silloin ei tiedä, kumpi aiheutti eron.`,
    });
  }
  return askChoice(full, context, {
    say: `Koe tehdään kaksi kertaa samalla tavalla. Miksi koe toistetaan?`, scene: trialTable(configRows(a, b)),
    choices: [
      { text: 'Nähdään, saadaanko sama tulos uudelleen' },
      { text: 'Koe kestää silloin pidempään', why: 'Toiston tarkoitus ei ole pidentää koetta.' },
      { text: 'Voidaan muuttaa monta asiaa kerralla', why: 'Reilussa kokeessa muuttuu silti vain yksi asia.' },
    ], correct: 0, explain: 'Toisto näyttää, oliko tulos sattumaa. Jos sama tulos tulee uudelleen, siihen voi luottaa enemmän.',
  });
}

// ------------------------------------------------------------------ experiments
/** Measuring bars for A and B with a scale, like reading a ruler or a measuring cup. */
function barsPicture(values: readonly [number, number], unit: string, label: string): Paint {
  const max = Math.max(2, Math.ceil(Math.max(...values))), x0 = 46, len = 300, step = len / max;
  const ticks = Array.from({ length: max + 1 }, (_, i) => `<path d="M${x0 + i * step} 84v6" stroke="${INK}"/>${text(x0 + i * step, 104, String(i), 11)}`).join('');
  const bars = values.map((v, i) => `${text(18, 34 + i * 30, i ? 'B' : 'A', 14, 'middle', 700)}<rect x="${x0}" y="${22 + i * 30}" width="${Math.max(2, v * step)}" height="18" rx="4" fill="${i ? '#e3a65b' : '#7fb3c9'}"/>`).join('');
  return picture(`${bars}<path d="M${x0} 84H${x0 + len}" stroke="${INK}"/>${ticks}${text(x0 + len, 120, unit, 11, 'end')}`, label, 360, 126);
}
const MORE: Partial<Record<InquiryConfiguration['kind'], [string, string]>> = {
  sail: ['Kumpi lehtivene siirtyi enemmän sivulle?', 'Lue asteikolta: kuinka monta senttimetriä vene B siirtyi sivulle?'],
  absorb: ['Kumpi imupala imi enemmän vettä?', 'Lue asteikolta: montako millilitraa vettä pala B imi?'],
};
function experiment(full: Parameters<LightAdapter>[0], context: LightContext, task: Mode<'experiment'>) {
  const s = task.setup;
  kindNow = s.kind;
  if (task.skill === 'motion') return motion(full, context, task);
  // Use the given pair unless it shows no difference in an execute task; then build a fair pair that does.
  const given = changedOf(...s.initial).length ? [s.initial[0], s.initial[1]] as [InquiryConfiguration, InquiryConfiguration] : undefined;
  const flat = (p: [InquiryConfiguration, InquiryConfiguration]) => result(p[0], s.seconds)?.value === result(p[1], s.seconds)?.value;
  const pair = given && !(task.skill === 'execute' && flat(given)) ? given : contrast(s, context, task.skill === 'execute');
  if (!pair) return null;
  const [a, b] = pair, ra = result(a, s.seconds), rb = result(b, s.seconds);
  if (!ra || !rb) return null;
  const changed = changedOf(a, b);
  if (task.skill === 'execute' && MORE[a.kind]) {
    const [which, read] = MORE[a.kind]!, scene = trialTable(configRows(a, b), `Koe kestää ${s.seconds} s. Tulokset näkyvät alla.`);
    const bars = barsPicture([ra.value, rb.value], ra.unit, 'Kokeiden A ja B tulokset asteikolla');
    const both: Paint = host => { const top = document.createElement('div'), bottom = document.createElement('div'); scene(top); bars(bottom); host.replaceChildren(top, bottom); };
    if (context.phase !== 'guided' && Number.isInteger(rb.value) && rb.value > 0 && rb.value !== ra.value) {
      return askNumber(full, {
        say: read, scene: both, unit: ra.unit, answer: rb.value, whyAt: { [ra.value]: 'Tämä on kokeen A tulos. Katso palkkia B.' },
        explain: `Palkki B päättyy kohtaan ${fi(rb.value)}. Havainto kirjataan heti ja tarkasti: B ${rb.words}.`,
      });
    }
    const right = ra.value === rb.value ? 2 : ra.value > rb.value ? 0 : 1;
    return askChoice(full, context, {
      say: which, scene: both, ordered: true,
      choices: [{ text: 'A' }, { text: 'B' }, { text: 'Yhtä paljon' }].map((c, i) => ({ ...c, why: i === right ? undefined : `A ${ra.words}, B ${rb.words}.` })),
      correct: right, explain: `A ${ra.words} ja B ${rb.words}. Kokeissa muuttui vain ${list(changed.map(word))}, joten ero johtuu siitä tässä mallissa.`,
    });
  }
  const rows = [...configRows(a, b), ['Tulos', cap(ra.words), cap(rb.words)] as const];
  if (changed.length > 1) {
    return askChoice(full, context, {
      say: `Pyörä B ${rb.words}. Voiko kokeesta päätellä, kumpi muutos sen aiheutti?`, scene: trialTable(rows), ordered: true,
      choices: [
        { text: 'Ei, koska kaksi asiaa muuttui yhtä aikaa' },
        ...changed.map(v => ({ text: `Kyllä, ${word(v)} aiheutti sen`, why: `Myös ${word(changed.find(x => x !== v)!)} muuttui. Kumpikin voi olla syy.` })),
      ], correct: 0,
      explain: `Kokeissa muuttuivat sekä ${word(changed[0]!)} että ${word(changed[1]!)}. Korjattu koe muuttaa vain yhtä asiaa kerrallaan, ja muut pidetään samoina.`,
    });
  }
  const v = changed[0]!, same = ra.value === rb.value;
  if (same) {
    return askChoice(full, context, {
      say: `Kokeessa B muutettiin vain ${word(v)}. Muuttuiko tulos?`, scene: trialTable(rows), ordered: true,
      choices: [{ text: 'Muuttui', why: `Molemmissa: ${ra.words}.` }, { text: 'Ei muuttunut' }], correct: 1,
      explain: `Tulos pysyi samana (${ra.words}). Tässä mallissa ${word(v)} ei vaikuttanut tähän tulokseen.`,
    });
  }
  const others = SHOWN[a.kind].filter(x => x !== v);
  return askChoice(full, context, {
    say: `Kokeiden tulokset ovat erilaiset. Mikä aiheutti eron tässä kokeessa?`, scene: trialTable(rows),
    choices: [{ text: cap(word(v)) }, ...others.slice(0, 2).map(x => ({ text: cap(word(x)), why: `${cap(word(x))} oli molemmissa sama, joten se ei voi selittää eroa.` }))], correct: 0,
    explain: `Vain ${word(v)} muuttui (${valueText(a, v)} → ${valueText(b, v)}). Kun kaikki muu pysyy samana, eron syy on tämä yksi muutos.`,
  });
}
const MOTION_CHANGE: Record<string, string> = { direction: 'Suunta muuttui', speed: 'Vauhti muuttui', stop: 'Se pysähtyi', same: 'Liike pysyi samanlaisena' };
const MOTION_WHY: Record<string, string> = {
  direction: 'Työntö sivulle kääntää liikkeen suuntaa.', speed: 'Työntö eteenpäin muuttaa vauhtia.',
  stop: 'Karhea pinta jarruttaa, kunnes liike loppuu.', same: 'Kun mikään ei työnnä eikä jarruta, liike jatkuu samalla vauhdilla samaan suuntaan.',
};
function motion(full: Parameters<LightAdapter>[0], context: LightContext, task: Mode<'experiment'>) {
  const s = task.setup, [a, b] = s.initial, reading = inquiryRead(b, 'B', s.seconds);
  if (!reading) return null;
  const change = inquiryMotionChange(b, reading);
  if (!MOTION_CHANGE[change]) return null;
  kindNow = b.kind;
  const thing = THING[b.kind], order = ['direction', 'speed', 'stop', 'same'];
  return askChoice(full, context, {
    say: `${cap(thing)} B liikkuu ${s.seconds} s. Katso taulukosta, mikä siihen vaikuttaa. Miten sen liike muuttuu?`, scene: trialTable(configRows(a, b), `Molemmat lähtevät liikkeelle samalla vauhdilla.`), ordered: true,
    choices: order.map(k => ({ text: MOTION_CHANGE[k]!, why: k === change ? undefined : MOTION_WHY[change] })), correct: order.indexOf(change),
    explain: `${MOTION_CHANGE[change]}. ${MOTION_WHY[change]}`,
  });
}

// ------------------------------------------------------------------ models
const CELL = 62;
const letterOf = (t: InquiryTerrain, id: string) => { const sorted = [...t.cells].sort((p, q) => p.y - q.y || p.x - q.x); return String.fromCharCode(65 + sorted.findIndex(c => c.id === id)); };
function terrainPicture(t: InquiryTerrain, opts: { unknown?: ReadonlySet<string>; start?: string; routes?: readonly (readonly string[])[]; route?: readonly string[] }): Paint {
  const at = (id: string) => { const c = t.cells.find(x => x.id === id)!; return [c.x * CELL + CELL / 2 + 4, c.y * CELL + CELL / 2 + 4] as const; };
  const cells = t.cells.map(c => {
    const x = c.x * CELL + 4, y = c.y * CELL + 4, unknown = opts.unknown?.has(c.id);
    const fill = c.blocked ? '#9aa09a' : unknown ? '#f6f1dc' : `hsl(${100 - c.height * 10} 40% ${90 - c.height * 7}%)`;
    return `<rect x="${x}" y="${y}" width="${CELL - 4}" height="${CELL - 4}" rx="7" fill="${fill}" stroke="#7d8a72"/>${text(x + 9, y + 15, letterOf(t, c.id), 12, 'middle', 700)}`
      + (c.blocked ? text(x + CELL / 2 - 2, y + 38, 'kivi', 13, 'middle', 700, '#2f3330') : text(x + CELL / 2 - 2, y + 42, unknown ? '?' : String(c.height), 22, 'middle', 700));
  }).join('');
  const line = (path: readonly string[], color: string, dash = '') => `<polyline points="${path.map(id => at(id).join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="4" opacity=".75" stroke-linecap="round" ${dash} marker-end="url(#tip-${color.slice(1)})"/>`;
  const marker = (color: string) => `<marker id="tip-${color.slice(1)}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${color}"/></marker>`;
  const colours = ['#3b7fb0', '#b0603b'];
  const routes = (opts.routes ?? []).map((p, i) => line(p, colours[i % 2]!)).join('');
  const route = opts.route ? line(opts.route, '#2e8a4a', 'stroke-dasharray="7 5"') : '';
  const start = opts.start ? (() => { const [x, y] = at(opts.start); return `<ellipse cx="${x + 16}" cy="${y - 16}" rx="10" ry="6" fill="#5f9e45" stroke="#2f5a25" transform="rotate(-30 ${x + 16} ${y - 16})"/>`; })() : '';
  const defs = `<defs>${[...colours, '#2e8a4a'].map(marker).join('')}</defs>`;
  return picture(defs + cells + routes + route + start, 'Ruudukko, jonka luvut kertovat hiekan korkeuden', t.width * CELL + 8, t.height * CELL + 8);
}
const RULE = 'Mallin sääntö: lehti siirtyy aina viereiseen ruutuun, joka on matalin. Se pysähtyy, kun vieressä ei ole matalampaa.';
const TIE = 'Jos matalimpia ruutuja on kaksi, lehti valitsee tässä järjestyksessä: oikealle, alas, vasemmalle, ylös.';
function neighbours(t: InquiryTerrain, id: string) {
  const c = t.cells.find(x => x.id === id)!;
  return ([[1, 0], [0, 1], [-1, 0], [0, -1]] as const).map(([dx, dy]) => t.cells.find(n => n.x === c.x + dx && n.y === c.y + dy && !n.blocked)).filter(n => !!n);
}
function hasTie(t: InquiryTerrain, path: readonly string[], steps: number) {
  return path.slice(0, steps).some(id => { const here = t.cells.find(c => c.id === id)!, lower = neighbours(t, id).filter(n => n.height < here.height), min = Math.min(...lower.map(n => n.height)); return lower.filter(n => n.height === min).length > 1; });
}
function terrainQuestion(full: Parameters<LightAdapter>[0], context: LightContext, task: Mode<'model'>, t: InquiryTerrain, start: string, firstStep: boolean, lead: string) {
  const path = inquiryTerrainRoute(t, start);
  if (!path || path.length < 2) return null;
  const L = (id: string) => letterOf(t, id), h = (id: string) => t.cells.find(c => c.id === id)!.height;
  const steps = firstStep ? 1 : path.length - 1, tie = hasTie(t, path, steps);
  const say = `${lead}${RULE}${tie ? ` ${TIE}` : ''} Lehti lähtee ruudusta ${L(start)}. ${firstStep ? 'Mihin ruutuun se siirtyy ensin?' : 'Mihin ruutuun se lopulta pysähtyy?'}`;
  const answer = firstStep ? path[1]! : path.at(-1)!;
  const pool = firstStep ? neighbours(t, start).map(n => n.id) : [...new Set([...path.slice(1, -1), ...neighbours(t, path.at(-1)!).map(n => n.id), ...neighbours(t, start).map(n => n.id)])];
  const wrong = context.r.shuffle(pool.filter(id => id !== answer && id !== start)).slice(0, 3);
  const trail = path.map(id => `${L(id)} (${h(id)})`).join(' → ');
  return askChoice(full, context, {
    say, scene: terrainPicture(t, { start }), afterCorrect: terrainPicture(t, { start, route: path }),
    choices: [{ text: `Ruutuun ${L(answer)}` }, ...wrong.map(id => ({ text: `Ruutuun ${L(id)}`, why: path.includes(id) ? 'Lehti kulkee tämän kautta, mutta jatkaa vielä matalampaan ruutuun.' : `Ruudun ${L(id)} korkeus on ${h(id)}. Etsi viereisistä ruuduista matalin.` }))],
    correct: 0, explain: `Reitti: ${trail}. ${firstStep ? `Ruudun ${L(start)} viereisistä ruuduista ${L(answer)} on matalin.` : `Ruudun ${L(answer)} vieressä ei ole matalampaa ruutua, joten lehti pysähtyy.`}`,
  });
}
/** Lamp, stick and ground; candidate ground points get letters so that no negative numbers are needed. */
function shadowPicture(c: { lampX: number; lampY: number; poleHeight: number }, points: readonly number[], tip?: number): Paint {
  const u = 22, ox = 10 * u, gy = 7 * u;
  const X = (x: number) => ox + x * u, Y = (y: number) => gy - y * u;
  const grid = Array.from({ length: 21 }, (_, i) => `<path d="M${i * u} ${Y(7)}V${gy}" stroke="#dfe6dc"/>`).join('') + Array.from({ length: 8 }, (_, i) => `<path d="M0 ${Y(i)}H${20 * u}" stroke="#dfe6dc"/>`).join('');
  const ground = `<path d="M0 ${gy}H${20 * u}" stroke="#a88a55" stroke-width="4"/>`;
  const pole = `<path d="M${X(0)} ${gy}V${Y(c.poleHeight)}" stroke="#7b5a2e" stroke-width="5" stroke-linecap="round"/>`;
  const lamp = `<circle cx="${X(c.lampX)}" cy="${Y(c.lampY)}" r="9" fill="#f6c94c" stroke="#a5781c" stroke-width="2"/>`;
  const flags = points.map((p, i) => `<circle cx="${X(p)}" cy="${gy}" r="5" fill="#ffffff" stroke="${INK}" stroke-width="2"/>${text(X(p), gy + 20, 'PQRS'[i]!, 14, 'middle', 700)}`).join('');
  const ray = tip === undefined ? '' : `<path d="M${X(c.lampX)} ${Y(c.lampY)}L${X(tip)} ${gy}" stroke="#d58a1c" stroke-width="2.5" stroke-dasharray="6 4"/><path d="M${X(0)} ${gy}H${X(tip)}" stroke="#3a3a3a" stroke-width="6" opacity=".55"/>`;
  return picture(grid + ground + ray + pole + lamp + flags, 'Lyhty, keppi ja maan merkityt kohdat ruudukossa', 20 * u, gy + 28);
}
function shadowQuestion(full: Parameters<LightAdapter>[0], context: LightContext, task: Mode<'model'>, lead = '') {
  if (task.board.kind !== 'shadow-ray') return null;
  const probe = task.probe.query.kind === 'shadow-ray' ? task.probe.query.caseId : '';
  const c = task.board.cases.find(x => x.id === probe);
  if (!c) return null;
  const tip = -c.lampX * c.poleHeight / (c.lampY - c.poleHeight);
  // Wrong points stay at least two squares from each other and from the stick so the letters never overlap.
  const others: number[] = [];
  for (const p of context.r.shuffle([-tip, tip + 2, tip - 2, tip + 3, tip - 3, tip + 4]))
    if (others.length < 2 && Math.abs(p) >= 2 && Math.abs(p) <= 9 && [tip, ...others].every(q => Math.abs(p - q) >= 2)) others.push(p);
  const points = [tip, ...others].sort((p, q) => p - q), letter = (p: number) => 'PQRS'[points.indexOf(p)]!;
  return askChoice(full, context, {
    say: `${lead}Valo kulkee suoraan lyhdystä kepin latvan ohi maahan. Mihin kohtaan kepin varjon kärki osuu?`,
    scene: shadowPicture(c, points), afterCorrect: shadowPicture(c, points, tip), ordered: true,
    choices: points.map(p => ({ text: `Kohtaan ${letter(p)}`, why: p === tip ? undefined : p === -tip ? 'Varjo osuu kepin toiselle puolelle kuin lyhty.' : 'Jatka suoraa viivaa lyhdystä kepin latvan kautta maahan asti.' })),
    correct: points.indexOf(tip), explain: `Suora viiva lyhdystä kepin latvan kautta osuu maahan kohdassa ${letter(tip)}. Varjo on kepin toisella puolella kuin lyhty.`,
  });
}
const REVISE_CHOICES: Choice[] = [
  { text: 'Korjataan malli niin, että se sopii vanhoihin ja uuteen havaintoon' },
  { text: 'Jätetään uusi havainto pois, koska malli oli valmis', why: 'Havaintoa ei saa ohittaa. Malli korjataan havaintojen mukaan.' },
  { text: 'Tehdään uusi malli, joka sopii vain uuteen havaintoon', why: 'Myös vanhat havainnot ovat yhä totta. Mallin pitää selittää nekin.' },
];
function channelPicture(task: Mode<'model'>, showNew: boolean): Paint {
  if (task.board.kind !== 'channel-map') return () => {};
  const ports = task.board.ports, at = (id: string) => { const p = ports.find(x => x.id === id)!; return [30 + p.x * 80, 30 + p.y * 60] as const; };
  const route = (path: readonly string[], color: string, dy: number, dash = '') => `<polyline points="${path.map(id => { const [x, y] = at(id); return `${x},${y + dy}`; }).join(' ')}" fill="none" stroke="${color}" stroke-width="4" ${dash} stroke-linejoin="round"/>`;
  const obs = task.observations.map((o, i) => route(o.path, i ? '#c9762e' : '#3b7fb0', i ? 4 : -4)).join('') + (showNew && task.newObservation ? route(task.newObservation.path, '#2e8a4a', 0, 'stroke-dasharray="7 5"') : '');
  const nodes = ports.map(p => { const [x, y] = at(p.id); const name = p.id === 'P' ? 'allas' : p.id === 'F' ? 'putous' : ''; return `<circle cx="${x}" cy="${y}" r="13" fill="${p.id === 'P' ? '#bfe0ef' : p.id === 'F' ? '#d9eef8' : '#fff'}" stroke="${INK}" stroke-width="2"/>${text(x, y + 5, p.id, 13, 'middle', 700)}${name ? text(x, y + 30, name, 11) : ''}`; }).join('');
  const dam = showNew && task.newFeature ? (() => { const [x, y] = at(task.newFeature!); return `<rect x="${x - 17}" y="${y - 17}" width="34" height="34" rx="6" fill="none" stroke="#7b5a2e" stroke-width="5"/>`; })() : '';
  const legend = `${text(10, 182, '— luukku auki', 11, 'start', 700, '#3b7fb0')}${text(120, 182, '— luukku kiinni', 11, 'start', 700, '#c9762e')}${showNew ? text(240, 182, '- - padon jälkeen', 11, 'start', 700, '#2e8a4a') : ''}`;
  return picture(obs + dam + nodes + legend, 'Kourukartta: vesi lähtee kohdasta S altaaseen P tai putoukselle F', 380, 190);
}
function model(full: Parameters<LightAdapter>[0], context: LightContext, task: Mode<'model'>) {
  const board = task.board;
  if (board.kind === 'shadow-ray') {
    if ((task.skill === 'revise' || task.skill === 'integrate') && context.phase === 'guided') {
      return askChoice(full, context, {
        say: 'Vanha malli sanoi: varjo on aina yhtä pitkä. Lyhty siirrettiin, ja varjon pituus muuttui. Mikä malli selittää kaikki havainnot?', scene: shadowQuestionScene(task),
        choices: [
          { text: 'Valo kulkee suoraan lyhdystä kepin latvan ohi maahan' },
          { text: 'Varjo on aina yhtä pitkä', why: 'Tämä vanha malli ei sovi uuteen havaintoon: varjo muuttui.' },
          { text: 'Varjon pituutta ei voi ennustaa', why: 'Suoran valon malli ennustaa varjon jokaiselle lyhdyn paikalle.' },
        ], correct: 0, explain: 'Kun lyhty siirtyy, valon suora viiva kepin latvan ohi osuu maahan eri kohtaan. Siksi varjon pituus muuttuu. Tämä malli sopii vanhoihin ja uuteen havaintoon.',
      });
    }
    return shadowQuestion(full, context, task, task.skill === 'revise' ? 'Lyhty siirrettiin uuteen paikkaan. ' : '');
  }
  if (board.kind === 'channel-map') {
    const [open, closed] = task.observations;
    if (context.phase === 'guided' && open && closed) {
      const feeds = [open, closed].find(o => o.path.at(-1) === 'F');
      if (!feeds) return null;
      return askChoice(full, context, {
        say: 'Kartan reitit ovat havaintoja. Majavan allas P pysyy rauhallisena, kun vesi ei mene sinne. Milloin vesi menee putoukselle F?', scene: channelPicture(task, false), ordered: true,
        choices: [{ text: 'Kun luukku on auki', why: open === feeds ? undefined : 'Sininen reitti päättyy altaaseen P.' }, { text: 'Kun luukku on kiinni', why: closed === feeds ? undefined : 'Oranssi reitti päättyy altaaseen P.' }],
        correct: feeds === open ? 0 : 1, explain: `${feeds === open ? 'Sininen' : 'Oranssi'} reitti ${feeds.path.join(' → ')} päättyy putoukselle F. Silloin allas pysyy rauhallisena ja putous saa vettä.`,
      });
    }
    return askChoice(full, context, {
      say: `Majava rakensi padon kohtaan ${task.newFeature}. Uusi havainto (vihreä) ei kulje samaa reittiä kuin vanha kartta näyttää. Mitä kartalle tehdään?`, scene: channelPicture(task, true),
      choices: REVISE_CHOICES, correct: 0, explain: 'Malli korjataan niin, että se sopii kaikkiin havaintoihin: kartta saa padon ja uuden reitin, ja vanhat reitit pysyvät totena.',
    });
  }
  const truth = inquiryModelWitness(task, task.skill === 'revise' || task.skill === 'integrate');
  if (!truth || truth.kind !== 'terrain' || task.probe.query.kind !== 'terrain') return null;
  const t = truth.terrain, start = task.probe.query.start;
  if (task.skill === 'create' && context.phase !== 'transfer') {
    // The routes tell which way the sand slopes: the leaf always moves to a lower cell.
    const unknown = new Set(board.template.cells.filter(c => !board.fixedHeights.some(f => f.id === c.id)).map(c => c.id));
    const shown: InquiryTerrain = { ...board.template, cells: board.template.cells.map(c => ({ ...c, height: board.fixedHeights.find(f => f.id === c.id)?.height ?? 0 })) };
    const all = task.observations.flatMap(o => o.path.slice(1).map((to, i) => ({ from: o.path[i]!, to })));
    const steps = all.filter(s => unknown.has(s.to) && !unknown.has(s.from)), back = all.filter(s => unknown.has(s.from) && !unknown.has(s.to) && (board.fixedHeights.find(f => f.id === s.to)?.height ?? 0) > 0);
    const L = (id: string) => letterOf(t, id);
    const scene = terrainPicture(shown, { unknown, routes: task.observations.map(o => o.path) });
    if (context.phase === 'independent' && back.length) {
      const step = context.r.pick(back), toHeight = board.fixedHeights.find(f => f.id === step.to)!.height;
      return askChoice(full, context, {
        say: `Nuolet ovat kahden lehden havaittuja reittejä. Lehti siirtyy aina matalampaan ruutuun. Lehti kulki ruudusta ${L(step.from)} ruutuun ${L(step.to)} (korkeus ${toHeight}). Mitä tiedät ruudun ${L(step.from)} korkeudesta?`,
        scene, ordered: true,
        choices: [
          { text: `Se on matalampi kuin ${toHeight}`, why: 'Lehti ei nouse ylämäkeen.' }, { text: `Se on täsmälleen ${toHeight}`, why: 'Lehti ei siirry yhtä korkeaan ruutuun.' },
          { text: `Se on korkeampi kuin ${toHeight}` },
        ], correct: 2, explain: `Lehti siirtyy vain matalampaan ruutuun. Koska se lähti ruudusta ${L(step.from)} ruutuun ${L(step.to)}, ruudun ${L(step.from)} korkeus on yli ${toHeight}. Näin havainnot rakentavat mallin.`,
      });
    }
    const step = context.phase === 'guided' ? steps[0] : context.r.pick(steps);
    if (!step) return null;
    const fromHeight = board.fixedHeights.find(f => f.id === step.from)!.height;
    return askChoice(full, context, {
      say: `Nuolet ovat kahden lehden havaittuja reittejä. Lehti siirtyy aina matalampaan ruutuun. Lehti kulki ruudusta ${L(step.from)} (korkeus ${fromHeight}) ruutuun ${L(step.to)}. Mitä tiedät ruudun ${L(step.to)} korkeudesta?`,
      scene, ordered: true,
      choices: [
        { text: `Se on matalampi kuin ${fromHeight}` }, { text: `Se on täsmälleen ${fromHeight}`, why: 'Lehti ei siirry yhtä korkeaan ruutuun.' },
        { text: `Se on korkeampi kuin ${fromHeight}`, why: 'Lehti ei nouse ylämäkeen.' },
      ], correct: 0, explain: `Lehti siirtyy vain matalampaan ruutuun. Koska se meni ruutuun ${L(step.to)}, ruudun ${L(step.to)} korkeus on alle ${fromHeight}. Näin havainnot rakentavat mallin.`,
    });
  }
  if ((task.skill === 'revise' || task.skill === 'integrate') && context.phase === 'guided' && task.newFeature) {
    return askChoice(full, context, {
      say: `Malli ennusti lehden reitin, mutta ruutuun ${letterOf(t, task.newFeature)} putosi kivi, ja lehti kulki toista reittiä. Mitä mallille tehdään?`,
      scene: terrainPicture(t, { routes: task.newObservation ? [task.newObservation.path] : [] }), choices: REVISE_CHOICES, correct: 0,
      explain: 'Malli korjataan: kivi lisätään malliin. Korjattu malli selittää sekä vanhat reitit että uuden reitin.',
    });
  }
  const lead = task.newFeature ? `Ruudussa ${letterOf(t, task.newFeature)} on nyt kivi, eikä lehti pääse sen läpi. ` : '';
  return terrainQuestion(full, context, task, t, start, context.phase === 'guided' && !task.newFeature, lead);
}
function shadowQuestionScene(task: Mode<'model'>): Paint {
  if (task.board.kind !== 'shadow-ray') return () => {};
  const c = task.board.cases.find(x => task.newObservation?.query.kind === 'shadow-ray' && x.id === task.newObservation.query.caseId) ?? task.board.cases[0]!;
  return shadowPicture(c, [], -c.lampX * c.poleHeight / (c.lampY - c.poleHeight));
}

// ------------------------------------------------------------------ data and conclusions
/** Two number lines: A dots above, B dots below. Rows measured another way are hollow. */
function dotsPicture(rows: readonly InquiryDataRow[], unit: string, groups: boolean, highlight?: string): Paint {
  const values = rows.map(r => r.value), lo = Math.floor(Math.min(...values)) - 1, hi = Math.ceil(Math.max(...values)) + 1;
  const span = hi - lo, x0 = 30, len = 340, X = (v: number) => x0 + (v - lo) / span * len, every = span > 24 ? 5 : span > 12 ? 2 : 1;
  const ticks = Array.from({ length: span + 1 }, (_, i) => lo + i).filter(v => v % every === 0).map(v => `<path d="M${X(v)} 96v6" stroke="${INK}"/>${text(X(v), 116, String(v), 11)}`).join('');
  const lanes = groups ? (['A', 'B'] as const) : (['A'] as const);
  const dots = lanes.map((g, li) => {
    const y = groups ? 36 + li * 34 : 60, inGroup = rows.filter(r => r.group === g);
    const stacked = new Map<number, number>();
    return (groups ? text(14, y + 5, g, 14, 'middle', 700) : '') + inGroup.map(r => {
      const k = stacked.get(r.value) ?? 0; stacked.set(r.value, k + 1);
      const fill = !r.sameMethod ? '#ffffff' : r.id === highlight ? '#d0573c' : li ? '#e3a65b' : '#7fb3c9';
      return `<circle cx="${X(r.value)}" cy="${y - k * 12}" r="6" fill="${fill}" stroke="${INK}" stroke-width="1.5"/>${r.id === highlight || !r.sameMethod ? text(X(r.value), y - k * 12 - 11, r.sameMethod ? r.id : `${r.id} eri tapa`, 10) : ''}`;
    }).join('');
  }).join('');
  return picture(`<path d="M${x0} 96H${x0 + len}" stroke="${INK}"/>${ticks}${text(x0 + len, 132, unit, 11, 'end')}${dots}`, 'Mittaustulokset pisteinä lukusuoralla', 380, 138);
}
const CLAIM: Record<string, string> = { 'A-higher': 'A:n tulokset ovat suurempia', 'B-higher': 'B:n tulokset ovat suurempia', same: 'Ryhmät ovat yhtä suuria', inconclusive: 'Tulos jää epävarmaksi' };
function evidence(full: Parameters<LightAdapter>[0], context: LightContext, task: Mode<'evidence'>) {
  const unitName = (u: string) => u === '°C' ? 'astetta' : u === 'mm' ? 'millimetriä' : 'senttimetriä';
  if (task.skill === 'conclusion') {
    const mm = task.rows.find(r => r.unit === 'mm' && task.rangeUnit === 'cm');
    if (mm) {
      return askNumber(full, {
        say: `Taimi ${mm.id} on mitattu millimetreinä: ${mm.value} mm. Muut tulokset ovat senttimetreinä. Montako senttimetriä taimi ${mm.id} on?`,
        scene: card(task.rows.map(r => [`Taimi ${r.id}`, `${r.value} ${r.unit}`] as const), 'Taimien pituudet:'), unit: 'cm',
        answer: mm.value / 10, whyAt: { [mm.value]: 'Tämä on millimetreinä. 10 mm on 1 cm.' },
        explain: `10 mm = 1 cm, joten ${mm.value} mm = ${fi(mm.value / 10)} cm. Tulokset verrataan vasta, kun ne ovat samassa yksikössä.`,
      });
    }
    const claim = inquiryConclusion(task), unit = task.rangeUnit, few = task.rows.some(r => !r.sameMethod);
    const options = ['A-higher', 'B-higher', 'inconclusive'];
    const why = claim === 'inconclusive'
      ? few ? 'Yksi tulos on mitattu eri tavalla, joten samalla tavalla mitattuja toistoja on liian vähän.' : 'Ryhmien pisteet menevät päällekkäin, joten ero ei ole selvä.'
      : 'Kaikki toisen ryhmän pisteet ovat toisen ryhmän pisteiden yläpuolella.';
    return askChoice(full, context, {
      say: `Kumpikin ryhmä mitattiin kolme kertaa. Mitä mittauksista voi päätellä?`, scene: dotsPicture(task.rows, unit, true), ordered: true,
      choices: options.map(k => ({ text: CLAIM[k]!, why: k === claim ? undefined : why })), correct: options.indexOf(claim),
      explain: `${CLAIM[claim]}. ${why} Päätelmä koskee vain näitä mittauksia.`,
    });
  }
  const suspect = task.rows.find(r => r.id === task.suspect)!, others = task.rows.filter(r => r !== suspect), typical = others[0]!.value;
  const changed = suspect.confirmed !== suspect.value, unit = task.rangeUnit;
  const scene = dotsPicture(task.rows, unit, false, suspect.id);
  if (context.phase === 'guided') {
    return askChoice(full, context, {
      say: `Tulos ${suspect.id} on ${suspect.value} ${unit}, muut ovat noin ${typical} ${unit}. Mitä tehdään ensin?`, scene,
      choices: [
        { text: 'Tarkistetaan tulos mittaamalla uudelleen' },
        { text: 'Poistetaan tulos heti', why: 'Poikkeava tulos voi olla oikea. Se tarkistetaan ensin.' },
        { text: 'Pidetään tulos tarkistamatta', why: 'Tulos voi olla kirjausvirhe. Se tarkistetaan ensin.' },
      ], correct: 0, explain: 'Poikkeava tulos tarkistetaan ennen kuin sitä korjataan tai pidetään. Tarkistus kertoo, onko se virhe vai oikea poikkeus.',
    });
  }
  if (changed) {
    return askNumber(full, {
      say: `Tulos ${suspect.id} oli kirjattu: ${suspect.value} ${unit}. Uudelleenmittaus antoi ${suspect.confirmed} ${unit}. Mikä luku taulukkoon kirjataan?`, scene, unit,
      answer: suspect.confirmed!, whyAt: { [suspect.value]: 'Tämä oli kirjausvirhe. Uusi mittaus kertoo oikean arvon.' },
      explain: `Tarkistus osoitti kirjausvirheen. Taulukkoon kirjataan tarkistettu arvo ${suspect.confirmed} ${unit}.`,
    });
  }
  return askChoice(full, context, {
    say: `Tulos ${suspect.id} on ${suspect.value} ${unit}, muut noin ${typical} ${unit}. Uudelleenmittaus antoi saman: ${suspect.confirmed} ${unit}. Mitä tulokselle tehdään?`, scene, ordered: true,
    choices: [
      { text: 'Pidetään tulos, koska tarkistus vahvisti sen' },
      { text: 'Poistetaan tulos, koska se on erilainen', why: 'Tarkistettu tulos on oikea. Erilaisuus ei ole syy poistaa sitä.' },
      { text: `Muutetaan se lukuun ${typical}`, why: 'Tuloksia ei muuteta arvaamalla.' },
    ], correct: 0, explain: `Uusi mittaus vahvisti tuloksen ${suspect.value} ${unit}. Se on oikea, vaikka se on ${unitName(unit) === 'astetta' ? 'muita lämpimämpi' : 'muita suurempi'}, joten se säilytetään.`,
  });
}

export const inquiryIslandsLight: LightAdapter<InquiryIslandsTask & { kind: 'inquiry-islands' }> = (full, context) => {
  const task = full.task as unknown as InquiryIslandsTask;
  switch (task.mode) {
    case 'observe': return observe(full, context, task);
    case 'compare': return compare(full, context, task);
    case 'question': return question(full, context, task);
    case 'plan': return plan(full, context, task);
    case 'experiment': return experiment(full, context, task);
    case 'model': return model(full, context, task);
    case 'evidence': return evidence(full, context, task);
  }
};
