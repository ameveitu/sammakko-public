import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { mountObservedExplanation } from './observed-explanations';
import {
  inquiryDefaultPlan, inquiryChangedVariable, inquiryExplanation, inquiryModelPath, inquiryMembership, replayInquiryExperiment, replayInquiryModel, replayInquiryRechecks,
  solutionInquiryIslands, validInquiryModel,
  type InquiryAction, type InquiryConfiguration, type InquiryConstructedModel, type InquiryDirection, type InquiryIslandsResponse, type InquiryIslandsTask,
  type InquiryModelObservation, type InquiryOutcome, type InquiryPlan, type InquiryProperty, type InquiryRule, type InquirySample, type InquirySetup, type InquiryStep, type InquiryVariable,
} from '../models/inquiry-islands';

type Task<M extends InquiryIslandsTask['mode']> = Extract<InquiryIslandsTask, { mode: M }>;
type Answer = InquiryIslandsResponse;
interface Work { node: HTMLElement; ready(): boolean; read(): Answer; preview?(): Answer }

const kind = 'inquiry-islands' as const;
const stack = 'display:grid;gap:5px;min-width:0';
const row = 'display:flex;align-items:center;gap:5px;flex-wrap:wrap;min-width:0';
const small = 'margin:0;font-size:13px;line-height:1.25;color:#284e45';
const panel = `${stack};padding:6px 8px;background:#edf3e7;border:1px solid #a7beaf;border-radius:9px`;
const control = 'min-height:44px;box-sizing:border-box;min-width:0;padding:5px 7px;font:inherit;font-size:14px;color:#23473e;background:#fffef6;border:1px solid #8ba79a;border-radius:9px';
const note = (text: string) => h('p', { style: small }, text);
const button = (name: string, onclick: () => void, attrs: Record<string, unknown> = {}) => h('button', { type: 'button', class: 'btn small', style: 'min-height:44px', onclick, ...attrs }, name);
function menu(label: string, options: readonly (readonly [string, string])[], value = '') {
  const select = h('select', { 'aria-label': label, style: `${control};flex:1;min-width:110px` }, h('option', { value: '' }, 'Valitse'), ...options.map(([v, name]) => h('option', { value: v }, name)));
  select.value = value; return select;
}
const labelled = (text: string, field: HTMLElement) => h('label', { style: 'display:grid;grid-template-columns:minmax(0,1fr) minmax(130px,55%);gap:6px;align-items:center;font-size:13px' }, h('span', {}, text), field);
function check(label: string) {
  const input = h('input', { type: 'checkbox', style: 'width:20px;height:20px;flex:none' });
  return { input, node: h('label', { style: 'display:flex;align-items:center;gap:7px;min-height:44px;font-size:13px' }, input, label) };
}

// ------------------------------------------------------------------ words
export const variableWords: Record<InquiryVariable, string> = {
  wind: 'Puhaltimen teho', area: 'Purjeen koko', mass: 'Massa', gate: 'Veräjä', flow: 'Uoman virtaama', forceY: 'Sivutyöntö', surface: 'Pinta', lampX: 'Lyhdyn sivupaikka',
  height: 'Kepin korkeus', material: 'Materiaali', lampY: 'Lyhdyn korkeus', water: 'Vettä astiassa', seconds: 'Koeaika', initialSpeed: 'Alkuvauhti', forceX: 'Työntö eteenpäin',
  initialVX: 'Alkuvauhti eteenpäin', initialVY: 'Alkuvauhti sivulle', retardation: 'Jarrutus', drag: 'Pyörän jarru',
};
const outcomeWords: Record<InquiryOutcome, string> = {
  'forward-displacement': 'Matka eteenpäin', 'side-displacement': 'Siirtymä sivulle', turn: 'Kääntyykö suunta', 'wheel-speed': 'Pyörän vauhti', 'shadow-length': 'Varjon pituus', absorbed: 'Imeytynyt vesi',
};
const stepWords: Record<InquiryStep, string> = { configure: 'Säädä', predict: 'Ennusta', place: 'Aseta kohde', start: 'Käynnistä', observe: 'Havainnoi', record: 'Kirjaa', reset: 'Palauta alkuun', repeat: 'Toista' };
const allSteps = Object.keys(stepWords) as InquiryStep[];
const directionWords: Record<InquiryDirection, string> = { left: 'vasemmalle', right: 'oikealle', straight: 'suoraan', back: 'taaksepäin', stopped: 'paikallaan' };
function directionText(apparatus: InquiryConfiguration['kind'], d: InquiryDirection) {
  if (apparatus === 'wheel') return d === 'stopped' ? 'pyörä seisoo' : 'pyörä pyörii';
  if (apparatus === 'shadow') return `varjo ${directionWords[d]}`;
  if (apparatus === 'absorb') return 'imeytyminen luettu';
  return directionWords[d];
}
function valueText(v: string | number | boolean): string {
  if (v === true) return 'auki'; if (v === false) return 'kiinni';
  return ({ cloth: 'kangas', paper: 'paperi', plastic: 'muovi', smooth: 'sileä', rough: 'karhea' } as Record<string, string>)[String(v)] ?? String(v);
}
const propertyWords: Record<InquiryProperty, string> = { length: 'Pituus (cm)', width: 'Leveys (cm)', colour: 'Väri', surface: 'Pinta', floats: 'Kelluuko', bend: 'Taipuminen', transparent: 'Läpinäkyvyys' };
function sampleValueText(property: InquiryProperty, v: string | number | boolean): string {
  if (property === 'floats') return String(v) === 'true' ? 'kelluu' : 'uppoaa';
  if (property === 'transparent') return String(v) === 'true' ? 'läpinäkyvä' : 'ei läpinäkyvä';
  return ({ brown: 'ruskea', green: 'vihreä', grey: 'harmaa', smooth: 'sileä', rough: 'karhea' } as Record<string, string>)[String(v)] ?? String(v);
}
const ruleText = (r: InquiryRule) => r.operator === 'equal' ? `${propertyWords[r.property].replace(' (cm)', '')}: ${sampleValueText(r.property, r.value)}` : `${propertyWords[r.property].replace(' (cm)', '')} vähintään ${r.value} cm`;
const configurationText = (c: InquiryConfiguration, setup: InquirySetup) => setup.controlVariables.map(v => `${variableWords[v]} ${valueText((c as unknown as Record<string, string | number | boolean>)[v]!)}`).join(' · ');
const sampleKinds = { stone: 'Kivi', leaf: 'Lehti', shell: 'Simpukka', material: 'Materiaali' } as const;
const samplePropertiesText = (s: InquirySample, properties: readonly InquiryProperty[]) => properties.map(p => `${propertyWords[p].replace(' (cm)', '')} ${sampleValueText(p, s[p])}${p === 'length' || p === 'width' ? ' cm' : ''}`).join(' · ');

export function inquiryInstruction(task: InquiryIslandsTask): string {
  switch (task.mode) {
    case 'observe': return task.skill === 'describe' ? 'Valitse kuvauksesi lauseet: kerro vain, mitä kuvassa todella näkyy.' : 'Osoita kuvasta havainnot ja kuvaile ne. Arvaus tekijästä ei ole havainto.';
    case 'compare': return task.skill === 'compare' ? 'Vertaa kahta näytettä saman ominaisuuden avulla.' : task.skill === 'classify' ? 'Valitse lajittelusääntö ja lajittele jokainen näyte sekä uusi rajatapaus.' : 'Vertaa kahta näytettä ja lajittele kaikki samalla säännöllä.';
    case 'question': return 'Muodosta kysymys, johon tämän tutkimuspöydän välineillä voi vastata.';
    case 'plan': return 'Suunnittele reilu koe: muuta yhtä tekijää, pidä muut samoina ja aseta vaiheet järjestykseen.';
    case 'experiment': return task.activity === 'guided' ? 'Tee annettu koe: ennusta, aseta, käynnistä, havainnoi ja kirjaa jokainen toisto.' : 'Säädä reilu vertailu, lukitse ennuste ja tee koe itse. Päättele vain tästä mallista.';
    case 'model': return task.skill === 'use' ? 'Käytä mallia uuden tapauksen ennustamiseen ja testaa se havaintoja vasten.' : task.skill === 'create' ? 'Rakenna havaintoja vastaava malli, ennusta sillä ja testaa.' : 'Lukitse vanha malli ja ennuste, avaa uusi havainto ja korjaa malli.';
    case 'evidence': return task.skill === 'conclusion' ? 'Tee johtopäätös koko aineistosta ja rajaa se näihin mittauksiin.' : 'Tarkista poikkeava tulos ennen kuin korjaat tai säilytät sen.';
  }
}

// ------------------------------------------------------------------ given boards
function imagePicture(task: Task<'observe'>, highlight: readonly string[] = []): SVGSVGElement {
  const i = task.image, lit = new Set(task.features.filter(f => highlight.includes(f.id) && f.observable).map(f => f.mark));
  const shape = (m: { position: { x: number; y: number }; width: number; height: number }, style: string) => i.marks[0]!.shape === 'line'
    ? `<path d="M${m.position.x - m.width / 2} ${m.position.y}h${m.width}" ${style}/>`
    : `<ellipse cx="${m.position.x}" cy="${m.position.y}" rx="${m.width / 2}" ry="${(i.marks[0]!.shape === 'circle' ? m.width : m.height) / 2}" ${style}/>`;
  const panelSvg = (x: number, title: string, marks: string) => `<g transform="translate(${x} 0)"><rect width="${i.width}" height="${i.height}" rx="8" fill="#e9dcb4" stroke="#9b8a62"/><text x="8" y="14" font-size="11" fill="#5b4b2c">${title}</text>${marks}</g>`;
  const rough = i.marks[0]?.surface === 'rough' ? 'stroke-dasharray="2 2"' : '';
  const now = i.marks.map(m => shape(m, `fill="#8a7650" stroke="${lit.has(m.id) ? '#c4372c' : '#3f3523'}" stroke-width="${lit.has(m.id) ? 3 : 1.5}" ${rough}`)).join('');
  const before = i.before ? panelSvg(0, 'Ennen', i.before.map(b => shape({ ...b }, 'fill="#a4936c" stroke="#3f3523" stroke-dasharray="3 2"')).join('')) : '';
  const width = i.before ? i.width * 2 + 10 : i.width;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${i.height}`); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Tutkimuskuva rannalta. Merkit näkyvät kuvassa.');
  svg.setAttribute('style', 'width:100%;max-height:170px'); svg.setAttribute('data-inquiry-image', '');
  svg.innerHTML = before + panelSvg(i.before ? i.width + 10 : 0, i.before ? 'Jälkeen' : 'Kuva', now);
  return svg;
}
function sampleTable(samples: readonly InquirySample[], properties: readonly InquiryProperty[]) {
  return h('table', { style: 'width:100%;border-collapse:collapse;font-size:12px', 'data-inquiry-samples': '' },
    h('tr', {}, h('th', {}, 'Näyte'), ...properties.map(p => h('th', {}, propertyWords[p]))),
    ...samples.map(s => h('tr', {}, h('td', {}, `${sampleKinds[s.kind]} ${s.id}`), ...properties.map(p => h('td', {}, sampleValueText(p, s[p]))))));
}
function setupBoard(setup: InquirySetup, initial = true) {
  return h('div', { style: panel }, h('strong', {}, setup.name), note(setup.scope),
    ...(initial ? setup.initial.map((c, i) => note(`${i ? 'B' : 'A'} · ${configurationText(c, setup)}`)) : []),
    note(`Muutettavissa: ${setup.variables.map(v => variableWords[v]).join(', ')}. Mitattava: ${setup.outcomes.map(o => outcomeWords[o]).join(', ')}.${setup.seconds ? ` Koe kestää ${setup.seconds} s.` : ''}`));
}
function modelBoardNotes(task: Task<'model'>, observations: readonly InquiryModelObservation[]) {
  return observations.map(o => note(`${o.id} · ${o.label}: ${o.path.join(' → ')}${o.calm === null ? '' : ` · allas ${o.calm ? 'rauhallinen' : 'levoton'}, putous ${o.feed ? 'saa vettä' : 'kuivana'}`}`));
}
function terrainPicture(task: Task<'model'>, terrain?: { cells: readonly { id: string; x: number; y: number; height: number; blocked: boolean }[] }) {
  if (task.board.kind !== 'terrain') return h('div', {});
  const b = task.board, cells = terrain?.cells ?? b.template.cells.map(c => ({ ...c, height: b.fixedHeights.find(f => f.id === c.id)?.height ?? -1 }));
  return h('div', { style: `display:grid;grid-template-columns:repeat(${b.template.width},1fr);gap:3px`, 'data-inquiry-terrain': '' }, ...[...cells].sort((p, q) => p.y - q.y || p.x - q.x).map(c =>
    h('div', { style: `padding:4px;border-radius:6px;text-align:center;font-size:12px;background:${c.blocked ? '#8b8f87' : c.height < 0 ? '#f6f1dc' : `hsl(${40 + c.height * 12} 45% ${88 - c.height * 6}%)`}` }, `${c.id} · ${c.blocked ? 'kivi' : c.height < 0 ? '?' : `k${c.height}`}`)));
}
export function inquiryIslandsPaint(task: InquiryIslandsTask): Paint {
  return host => {
    const board = h('div', { style: stack, 'data-inquiry-board': task.mode });
    switch (task.mode) {
      case 'observe': board.append(imagePicture(task), note(task.image.before ? 'Kaksi kuvaa samasta kohdasta: ennen ja jälkeen.' : 'Katso kuvaa tarkasti. Kuvaile vain näkyvää.')); break;
      case 'compare': board.append(sampleTable(task.samples, task.properties), note(task.skill === 'classify' ? `Uusi rajatapaus U: ${samplePropertiesText(task.boundary, task.properties)}` : `Vertailtava pari ${task.pair[0]} ja ${task.pair[1]}.`)); break;
      case 'question': case 'plan': board.append(setupBoard(task.setup, task.mode === 'question')); break;
      case 'experiment': board.append(setupBoard(task.setup)); break;
      case 'model': board.append(note(task.scope), ...(task.board.kind === 'terrain' ? [terrainPicture(task)] : task.board.kind === 'channel-map' ? [note(`Kourujen solmut ${task.board.ports.map(p => p.id).join(', ')}. Alku ${task.board.start}, päätepisteet ${task.board.terminals.join(' ja ')}.`)] : [note(task.board.cases.map(c => `${c.id}: lyhty (${c.lampX}, ${c.lampY}), keppi ${c.poleHeight}`).join(' · '))]), ...modelBoardNotes(task, task.observations), note(`${task.probe.label}${task.probe.query.kind === 'terrain' ? ` (alku ${task.probe.query.start})` : task.probe.query.kind === 'shadow-ray' ? ` (${task.probe.query.caseId})` : ''}.`)); break;
      case 'evidence': board.append(h('table', { style: 'width:100%;border-collapse:collapse;font-size:13px', 'data-inquiry-data': '' }, h('tr', {}, h('th', {}, 'Rivi'), h('th', {}, 'Ryhmä'), h('th', {}, 'Tulos'), h('th', {}, 'Menetelmä')),
        ...task.rows.map(r => h('tr', {}, h('td', {}, r.id), h('td', {}, r.group), h('td', {}, `${r.value} ${r.unit}`), h('td', {}, r.sameMethod ? 'sama' : 'eri menetelmä')))), note(task.scope)); break;
    }
    host.replaceChildren(board);
  };
}
export function inquiryIslandsWorkedPaint(task: InquiryIslandsTask): Paint {
  return host => {
    inquiryIslandsPaint(task)(host);
    const answer = solutionInquiryIslands(task), lines: string[] = [];
    switch (answer.mode) {
      case 'observe': if (task.mode === 'observe') lines.push(...answer.description.map(id => task.features.find(f => f.id === id)!.label), 'Tekijä tai syy ei näy kuvasta.'); break;
      case 'compare': if (answer.property) lines.push(`${propertyWords[answer.property as InquiryProperty]}: ${answer.first} ja ${answer.second}.`); if (answer.rule) lines.push(`Sääntö ${ruleText(answer.rule)}. Koriin: ${answer.memberships.filter(m => m.group).map(m => m.id).join(', ') || 'ei yhtään'}. U ${answer.boundaryGroup ? 'kuuluu' : 'ei kuulu'} koriin.`); break;
      case 'question': lines.push(`Miten ${variableWords[answer.variable as InquiryVariable].toLowerCase()} vaikuttaa: ${outcomeWords[answer.outcome as InquiryOutcome].toLowerCase()}?`); break;
      case 'plan': lines.push(`Muutetaan ${variableWords[answer.plan.variable].toLowerCase()}, pidetään samana ${answer.plan.controls.map(v => variableWords[v].toLowerCase()).join(', ')}. Vaiheet ${answer.plan.sequence.map(s => stepWords[s].toLowerCase()).join(' → ')}. Toistoja ${answer.plan.repeats}.`); break;
      case 'experiment': lines.push(`Kirjatut havainnot: ${answer.observations.map(o => `${o.trial}${o.repeat} ${o.timeS} s ${directionWords[o.direction as InquiryDirection]}`).join(', ')}.`, 'Päätelmä koskee tätä mallia.'); break;
      case 'model': lines.push(`Malli ennustaa reitin ${answer.prediction.join(' → ')}. Mallin jokainen havainto testattiin.`); break;
      case 'evidence': lines.push(answer.claim === 'inconclusive' ? 'Tulos jää epävarmaksi tällä aineistolla.' : answer.claim === 'correct-error' ? `Uudelleenmittaus vahvisti kirjausvirheen: oikea arvo ${answer.correction} ${answer.correctionUnit}.` : answer.claim === 'retain-outlier' ? `Uudelleenmittaus vahvisti poikkeaman ${answer.correction} ${answer.correctionUnit}; se säilyy.` : `Johtopäätös: ${answer.claim === 'same' ? 'ryhmät yhtä suuret' : `ryhmä ${answer.claim[0]} suurempi`} näissä mittauksissa.`); break;
    }
    if (task.review) lines.push(task.review.model, 'Tämä malliselitys ei ole aikuisen havainto oppijan omasta selityksestä.');
    host.append(h('div', { style: panel, 'data-inquiry-model': '' }, h('strong', {}, 'Sulan malliesimerkki'), ...lines.map(note)));
  };
}

// ------------------------------------------------------------------ works
function observeWork(task: Task<'observe'>, changed: () => void): Work {
  const picked: string[] = [], picture = h('div', {}, imagePicture(task)), status = note('');
  const cause = check('Tekijä tai syy ei näy tästä kuvasta.');
  const cards = task.features.map(f => button(f.label, () => { const i = picked.indexOf(f.id); if (i >= 0) picked.splice(i, 1); else picked.push(f.id); render(); changed(); }, { 'aria-pressed': 'false', 'data-inquiry-feature': f.id }));
  function render() {
    cards.forEach((c, i) => c.setAttribute('aria-pressed', String(picked.includes(task.features[i]!.id))));
    picture.replaceChildren(imagePicture(task, task.skill === 'observe-describe' ? picked : []));
    status.textContent = `Valittu ${picked.length}/${task.required} havaintoa.`;
  }
  cause.input.addEventListener('change', changed); render();
  return {
    node: h('div', { style: stack }, picture, note(task.skill === 'observe-describe' ? 'Valitse lause: sen kohta korostuu kuvassa.' : 'Valitse kuvauksesi lauseet.'), h('div', { style: stack }, ...cards), status, cause.node),
    ready: () => picked.length > 0,
    read: () => ({ kind, mode: 'observe', selected: task.skill === 'observe-describe' ? [...picked] : [], description: [...picked], uncertainCause: cause.input.checked }),
  };
}
function compareWork(task: Task<'compare'>, changed: () => void): Work {
  const parts: HTMLElement[] = [], comparing = task.skill !== 'classify', classifying = task.skill !== 'compare';
  const property = menu('Vertailtava ominaisuus', task.properties.map(p => [p, propertyWords[p]] as const));
  const valueField = (label: string) => h('input', { type: 'text', maxlength: 12, 'aria-label': label, style: `${control};width:100%` });
  const first = valueField(`Näytteen ${task.pair[0]} arvo`), second = valueField(`Näytteen ${task.pair[1]} arvo`);
  const relation = menu('Vertailun tulos', [['less', `${task.pair[0]} pienempi`], ['more', `${task.pair[0]} suurempi`], ['equal', 'Yhtä suuret'], ['same', 'Sama'], ['different', 'Eri']]);
  const categorical = (p: InquiryProperty) => ['colour', 'surface', 'floats', 'transparent'].includes(p);
  const valueRead = (field: HTMLInputElement) => { const p = property.value as InquiryProperty; if (!p || !categorical(p)) return field.value.trim().replace(',', '.'); const typed = field.value.trim().toLowerCase(); const options = p === 'floats' || p === 'transparent' ? ['true', 'false'] : p === 'colour' ? ['brown', 'green', 'grey'] : ['smooth', 'rough']; return options.find(o => sampleValueText(p, o) === typed || o === typed) ?? typed; };
  if (comparing) parts.push(h('div', { style: panel }, h('strong', {}, `Vertaa ${task.pair[0]} ja ${task.pair[1]}`), labelled('Ominaisuus', property), labelled(`${task.pair[0]}:n arvo`, first), labelled(`${task.pair[1]}:n arvo`, second), labelled('Tulos', relation)));
  const rule = menu('Lajittelusääntö', task.rules.map((r, i) => [String(i), ruleText(r)] as const));
  const groups = task.samples.map(s => menu(`Näytteen ${s.id} kori`, [['1', 'Sääntö pätee'], ['0', 'Ei päde']]));
  const boundary = menu('Rajatapauksen U kori', [['1', 'Sääntö pätee'], ['0', 'Ei päde']]);
  const reason = menu('Mikä ominaisuus ratkaisi U:n korin?', task.properties.map(p => [p, propertyWords[p]] as const));
  if (classifying) parts.push(h('div', { style: panel }, h('strong', {}, 'Lajittele samalla säännöllä'), labelled('Sääntö', rule), ...task.samples.map((s, i) => labelled(`${s.id}: ${samplePropertiesText(s, task.properties)}`, groups[i]!)), labelled(`U: ${samplePropertiesText(task.boundary, task.properties)}`, boundary), labelled('Ratkaiseva ominaisuus', reason)));
  const node = h('div', { style: stack }, ...parts); node.addEventListener('change', changed); node.addEventListener('input', changed);
  const ruleValue = () => rule.value === '' ? null : { ...task.rules[Number(rule.value)]! };
  return {
    node,
    ready: () => (!comparing || !!property.value && !!relation.value) && (!classifying || !!rule.value && groups.every(g => g.value) && !!boundary.value && !!reason.value),
    read: () => ({ kind, mode: 'compare', property: comparing ? property.value : '', first: comparing ? valueRead(first) : '', second: comparing ? valueRead(second) : '', relation: comparing ? relation.value : '',
      rule: classifying ? ruleValue() : null, memberships: classifying ? task.samples.map((s, i) => ({ id: s.id, group: Number(groups[i]!.value || -1) })) : [], boundaryGroup: classifying ? Number(boundary.value || -1) : -1, boundaryReason: classifying ? reason.value : '' }),
  };
}
function questionWork(task: Task<'question'>, changed: () => void): Work {
  const variable = menu('Mitä muutetaan?', [...task.setup.variables.map(v => [v, variableWords[v]] as const), ['beauty', 'Lehden kauneus']]);
  const outcome = menu('Mitä havaitaan?', [...task.setup.outcomes.map(o => [o, outcomeWords[o]] as const), ['opinion', 'Pitääkö Loikka siitä']]);
  const investigable = menu('Voiko tähän vastata tämän pöydän välineillä?', [['yes', 'Voi: muutan ja mittaan'], ['no', 'Ei voi']]);
  const node = h('div', { style: panel }, h('strong', {}, 'Oma tutkimuskysymys: miten ___ vaikuttaa ___?'), labelled('Muutan', variable), labelled('Havaitsen', outcome), labelled('Tutkittavissa', investigable));
  node.addEventListener('change', changed);
  return { node, ready: () => !!variable.value && !!outcome.value && !!investigable.value, read: () => ({ kind, mode: 'question', variable: variable.value, outcome: outcome.value, investigable: investigable.value === 'yes' }) };
}
/** Own plan: one changed variable, named controls, ordered steps and repeats. */
function planEditor(setup: InquirySetup, changed: () => void, startRepeats: number) {
  const variable = menu('Muutettava tekijä', setup.variables.map(v => [v, variableWords[v]] as const));
  const outcome = menu('Mitattava tulos', setup.outcomes.map(o => [o, outcomeWords[o]] as const));
  const settings = (['A', 'B'] as const).map((trial, t) => setup.variables.map(v => {
    const options = setup.values[v] ?? [], start = (setup.initial[t] as unknown as Record<string, unknown>)[v];
    return { v, options, select: menu(`Koe ${trial}: ${variableWords[v]}`, options.map((o, i) => [String(i), valueText(o)] as const), String(Math.max(0, options.findIndex(o => o === start)))) };
  }));
  const controls = setup.controlVariables.map(v => ({ v, ...check(`Pidän samana: ${variableWords[v]}`) }));
  const sequence: InquiryStep[] = [], order = note('');
  const stepButtons = allSteps.map(s => button(stepWords[s], () => { if (!sequence.includes(s)) sequence.push(s); render(); changed(); }, { 'data-inquiry-step': s }));
  const clear = button('Tyhjennä järjestys', () => { sequence.length = 0; render(); changed(); });
  const repeats = menu('Toistoja kummallekin kokeelle', [['1', '1'], ['2', '2'], ['3', '3']], String(startRepeats));
  function render() { order.textContent = sequence.length ? `Järjestys: ${sequence.map(s => stepWords[s]).join(' → ')}` : 'Valitse vaiheet järjestyksessä.'; stepButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(sequence.includes(allSteps[i]!)))); }
  render();
  const configuration = (t: 0 | 1): InquiryConfiguration => { const c = { ...setup.initial[0] } as unknown as Record<string, unknown>; for (const s of settings[t]!) c[s.v] = s.options[Number(s.select.value)]; return c as unknown as InquiryConfiguration; };
  const node = h('div', { style: panel, 'data-inquiry-plan': '' }, h('strong', {}, 'Oma koesuunnitelma'), labelled('Muutan', variable), labelled('Mittaan', outcome),
    ...settings.flatMap(t => t.map(s => labelled(s.select.getAttribute('aria-label')!, s.select))), h('div', { style: stack }, ...controls.map(c => c.node)),
    note('Vaiheet järjestyksessä:'), h('div', { style: row }, ...stepButtons), order, clear, labelled('Toistot', repeats));
  node.addEventListener('change', changed);
  return {
    node,
    complete: () => !!variable.value && !!outcome.value && sequence.length > 0,
    configuration,
    read: (): InquiryPlan => ({ variable: variable.value as InquiryVariable, outcome: outcome.value as InquiryOutcome, configurations: [configuration(0), configuration(1)], controls: controls.filter(c => c.input.checked).map(c => c.v), sequence: [...sequence], repeats: Number(repeats.value || 1) }),
    disable(off: boolean) { for (const f of node.querySelectorAll<HTMLButtonElement | HTMLSelectElement | HTMLInputElement>('button,select,input')) f.disabled = off; },
  };
}
function planWork(task: Task<'plan'>, changed: () => void): Work {
  const editor = planEditor(task.setup, changed, 1);
  return { node: editor.node, ready: editor.complete, read: () => ({ kind, mode: 'plan', plan: editor.read() }) };
}
function experimentWork(task: Task<'experiment'>, changed: () => void): Work {
  const s = task.setup, actions: InquiryAction[] = [], status = h('p', { role: 'status', style: small });
  const add = (a: Record<string, unknown>) => { const next = [...actions, { ...a, id: `a${actions.length + 1}`, run: task.run } as InquiryAction]; const r = replayInquiryExperiment(task, next); if (!r || r.actionCount !== next.length) { status.textContent = 'Tätä vaihetta ei voi tehdä vielä. Katso kokeen tila.'; return false; } actions.push(next.at(-1)!); status.textContent = ''; render(); changed(); return true; };
  const replay = () => replayInquiryExperiment(task, actions)!;
  let guidedPlan: InquiryPlan | undefined;
  if (task.activity === 'guided') {
    const base = inquiryDefaultPlan(s, task.minimumRepeats), variable = inquiryChangedVariable(...s.initial);
    if (base && variable) guidedPlan = { ...base, variable, configurations: s.initial, controls: s.controlVariables.filter(v => v !== variable), ...(task.givenSequence ? { sequence: task.givenSequence } : {}) };
  }
  const editor = guidedPlan ? undefined : planEditor(s, changed, task.minimumRepeats);
  const forecast = menu('Ennuste kokeelle B', (Object.keys(directionWords) as InquiryDirection[]).map(d => [d, directionText(s.kind, d)] as const));
  const lock = button('Lukitse suunnitelma ja ennuste', () => {
    const plan = guidedPlan ?? editor!.read();
    if (!forecast.value) { status.textContent = 'Valitse ensin ennuste.'; return; }
    if (!guidedPlan && !editor!.complete()) { status.textContent = 'Täydennä suunnitelma: muutettava tekijä, mitattava tulos ja vaiheet.'; return; }
    const before = actions.length;
    if (!add({ type: 'configure', trial: 'A', configuration: plan.configurations[0] }) || !add({ type: 'configure', trial: 'B', configuration: plan.configurations[1] }) || !add({ type: 'lock', forecast: forecast.value, plan })) { actions.length = before; render(); return; }
  });
  const trialAreas = (['A', 'B'] as const).map(trial => ({ trial, info: h('div', { style: stack }), buttons: h('div', { style: row }) }));
  const result = menu('Mitä kokeesta voi päätellä?', task.skill === 'motion'
    ? [['same', 'Liike pysyi samana'], ['speed', 'Vauhti muuttui'], ['direction', 'Suunta muuttui'], ['stop', 'Kiekko pysähtyi'], ['start', 'Kiekko lähti liikkeelle']]
    : task.skill === 'cause' ? [['model-cause', 'Muutettu tekijä aiheutti eron tässä mallissa'], ['no-difference', 'Eroa ei syntynyt'], ['all-world-causes', 'Tämä on syy kaikkialla luonnossa']]
      : [['observed', 'Havaitsin ja kirjasin jokaisen toiston'], ['all-world-causes', 'Sama pätee kaikkialla']]);
  const reflection = menu('Ennusteeni', [['confirmed', 'Ennusteeni piti'], ['revised', 'Korjaan ennustettani havainnon perusteella']]);
  const scope = menu('Päätelmän rajaus', [['this-model', 'Koskee tätä mallia ja näitä kokeita'], ['everywhere', 'Koskee kaikkia vesiä ja tuulia']]);
  const conclusion = h('div', { style: panel }, h('strong', {}, 'Oma päätelmä'), labelled('Päätelmä', result), labelled('Ennuste', reflection), labelled('Rajaus', scope));
  const run = h('div', { style: stack, 'data-inquiry-run': '' });
  function trialButtons(trial: 'A' | 'B') {
    const t = replay().trials[trial], left = s.seconds - t.timeS;
    return [button(`${trial}: Aseta kohde`, () => add({ type: 'place', trial })), button(`${trial}: Käynnistä`, () => add({ type: 'start', trial })),
      ...(s.seconds ? [button(`${trial}: Anna ajan kulua ${left > 0 ? left : 0} s`, () => add({ type: 'advance', trial, seconds: left }))] : []),
      button(`${trial}: Havainnoi`, () => add({ type: 'observe', trial })), button(`${trial}: Kirjaa`, () => add({ type: 'record', trial })), button(`${trial}: Uusi toisto`, () => add({ type: 'reset', trial }))];
  }
  function render() {
    const r = replay();
    editor?.disable(r.locked); forecast.disabled = r.locked; lock.style.display = r.locked ? 'none' : 'block';
    run.style.display = conclusion.style.display = r.locked ? 'grid' : 'none';
    for (const area of trialAreas) {
      const t = r.trials[area.trial];
      area.info.replaceChildren(note(`Koe ${area.trial} · toisto ${t.repeat} · ${t.placed ? 'asetettu' : 'ei asetettu'} · ${t.started ? `käynnissä, aikaa kulunut ${t.timeS} s` : 'ei käynnissä'}`),
        ...(t.observed ? [note(`Havainto ${t.observed.timeS} s: ${directionText(s.kind, t.observed.direction)}, ${(Number(t.observed.quantity[0]) / Number(t.observed.quantity[1])).toLocaleString('fi-FI')} ${t.observed.unit}`)] : []),
        ...t.records.map(rec => note(`Kirjattu ${area.trial}${rec.repeat}: ${rec.reading.timeS} s, ${directionText(s.kind, rec.reading.direction)}, ${(Number(rec.reading.quantity[0]) / Number(rec.reading.quantity[1])).toLocaleString('fi-FI')} ${rec.reading.unit}`)));
      area.buttons.replaceChildren(...trialButtons(area.trial));
    }
  }
  run.append(...trialAreas.map(a => h('div', { style: panel, 'data-inquiry-trial': a.trial }, a.info, a.buttons)));
  const node = h('div', { style: stack },
    guidedPlan ? h('div', { style: panel }, h('strong', {}, 'Annettu koe'), note(`A: ${configurationText(s.initial[0], s)}`), note(`B: ${configurationText(s.initial[1], s)}`), note(`Vaiheet: ${guidedPlan.sequence.map(x => stepWords[x]).join(' → ')}. Toistoja ${guidedPlan.repeats} kummallekin.`)) : editor!.node,
    labelled('Ennuste', forecast), lock, status, run, conclusion);
  conclusion.addEventListener('change', changed); render();
  const read = (): Answer => {
    const r = replay();
    return { kind, mode: 'experiment', actions: actions.map(a => structuredClone(a)), observations: (['A', 'B'] as const).flatMap(trial => r.trials[trial].records.map(x => ({ trial, repeat: x.repeat, timeS: x.reading.timeS, direction: x.reading.direction }))), result: result.value, reflection: reflection.value, scope: scope.value };
  };
  return { node, ready: () => replay().locked && !!result.value && !!reflection.value && !!scope.value, read };
}
function modelWork(task: Task<'model'>, changed: () => void): Work {
  const board = task.board, actions: InquiryAction[] = [], status = h('p', { role: 'status', style: small });
  const add = (a: Record<string, unknown>) => { const next = [...actions, { ...a, id: `a${actions.length + 1}`, run: task.run } as InquiryAction]; const r = replayInquiryModel(task, next); if (!r || r.actionCount !== next.length) return false; actions.push(next.at(-1)!); return true; };
  const replay = () => replayInquiryModel(task, actions)!;
  const editor = h('div', { style: panel, 'data-inquiry-editor': board.kind });
  // Editor state
  const heights = new Map<string, number>(), blocked = new Set<string>();
  const links = new Map<string, string>(), barriers = new Set<string>(), annotations = new Map<string, { calm: string; feed: string }>();
  const ground = new Map<string, string>(); let rule: 'fixed-length' | 'point-lamp' | '' = task.skill === 'use' || task.skill === 'create' ? 'point-lamp' : '';
  if (board.kind === 'terrain') for (const c of board.template.cells) { const f = board.fixedHeights.find(x => x.id === c.id); if (f) heights.set(c.id, f.height); }
  const visible = () => [...task.observations, ...(replay().revealed && task.newObservation ? [task.newObservation] : [])];
  function model(): InquiryConstructedModel | undefined {
    const ann = visible().filter(o => o.calm !== null || o.feed !== null).flatMap(o => { const a = annotations.get(o.id); return a?.calm && a.feed ? [{ caseId: o.id, calm: a.calm === 'yes', feed: a.feed === 'yes' }] : []; });
    let m: InquiryConstructedModel;
    if (board.kind === 'terrain') { if (board.template.cells.some(c => !heights.has(c.id))) return; m = { kind: 'terrain', terrain: { width: board.template.width, height: board.template.height, cells: board.template.cells.map(c => ({ id: c.id, x: c.x, y: c.y, height: heights.get(c.id)!, blocked: blocked.has(c.id) })) }, annotations: ann }; }
    else if (board.kind === 'channel-map') m = { kind: 'channel-map', links: [...links].filter(([, to]) => to).map(([key, to]) => { const [from, when] = key.split('|'); return { from: from!, to, when: when as 'open' | 'closed' | 'new' }; }), barriers: [...barriers], annotations: ann };
    else { if (!rule) return; m = { kind: 'shadow-ray', rule, rays: board.cases.filter(c => ground.get(c.id)).map(c => ({ caseId: c.id, lampX: c.lampX, lampY: c.lampY, poleHeight: c.poleHeight, groundX: Number(ground.get(c.id)) })), annotations: ann }; }
    return validInquiryModel(m, board) ? m : undefined;
  }
  function renderEditor() {
    const r = replay(), open = !r.locked || r.revealed, revising = r.revealed;
    const parts: HTMLElement[] = [h('strong', {}, revising ? 'Korjaa malli uuden havainnon mukaan' : 'Oma malli')];
    if (board.kind === 'terrain') {
      parts.push(h('div', { style: `display:grid;grid-template-columns:repeat(${board.template.width},minmax(0,1fr));gap:4px` }, ...[...board.template.cells].sort((p, q) => p.y - q.y || p.x - q.x).map(c => {
        const fixed = board.fixedHeights.find(f => f.id === c.id), cell = h('div', { style: 'display:grid;gap:3px;padding:3px;border:1px solid #a7beaf;border-radius:7px;background:#fffef6;font-size:12px' }, h('strong', {}, c.id));
        if (fixed) cell.append(note(`korkeus ${fixed.height}`));
        else { const sel = menu(`Ruudun ${c.id} korkeus`, Array.from({ length: 7 }, (_, i) => [String(i), String(i)] as const), heights.has(c.id) ? String(heights.get(c.id)) : ''); sel.style.minWidth = '60px'; sel.disabled = !open; sel.addEventListener('change', () => { if (sel.value === '') heights.delete(c.id); else heights.set(c.id, Number(sel.value)); update(); }); cell.append(sel); }
        if (revising) cell.append(button(blocked.has(c.id) ? 'Poista kivi' : 'Kivi tähän', () => { if (blocked.has(c.id)) blocked.delete(c.id); else blocked.add(c.id); update(); renderEditor(); }, { 'aria-label': `Kivi ruutuun ${c.id}` }));
        return cell;
      })));
    } else if (board.kind === 'channel-map') {
      const conditions: ('open' | 'closed' | 'new')[] = revising ? ['open', 'closed', 'new'] : ['open', 'closed'];
      const names = { open: 'luukku auki', closed: 'luukku kiinni', new: 'padon jälkeen' } as const;
      for (const p of board.ports.filter(p => !board.terminals.includes(p.id))) for (const when of conditions) {
        const key = `${p.id}|${when}`, sel = menu(`Kouru ${p.id} (${names[when]}) vie`, board.ports.filter(q => q.id !== p.id).map(q => [q.id, q.id] as const), links.get(key) ?? '');
        sel.disabled = !open; sel.addEventListener('change', () => { links.set(key, sel.value); update(); }); parts.push(labelled(`${p.id}, ${names[when]} →`, sel));
      }
      if (revising) for (const p of board.ports.filter(p => p.id !== board.start && !board.terminals.includes(p.id))) { const c = check(`Pato kohdassa ${p.id}`); c.input.checked = barriers.has(p.id); c.input.addEventListener('change', () => { if (c.input.checked) barriers.add(p.id); else barriers.delete(p.id); update(); }); parts.push(c.node); }
      for (const o of visible().filter(o => o.calm !== null || o.feed !== null)) {
        const a = annotations.get(o.id) ?? { calm: '', feed: '' }; annotations.set(o.id, a);
        const calm = menu(`Havainto ${o.id}: allas`, [['yes', 'rauhallinen'], ['no', 'levoton']], a.calm), feed = menu(`Havainto ${o.id}: putous`, [['yes', 'saa vettä'], ['no', 'kuivana']], a.feed);
        calm.disabled = feed.disabled = !open; calm.addEventListener('change', () => { a.calm = calm.value; update(); }); feed.addEventListener('change', () => { a.feed = feed.value; update(); });
        parts.push(labelled(`Merkintä ${o.id}: allas`, calm), labelled(`Merkintä ${o.id}: putous`, feed));
      }
    } else {
      const ruleSel = menu('Mallin sääntö', [['fixed-length', 'Varjo on aina yhtä pitkä'], ['point-lamp', 'Suora säde lyhdystä kepin kärjen kautta']], rule);
      ruleSel.disabled = !open; ruleSel.addEventListener('change', () => { rule = ruleSel.value as typeof rule; update(); }); parts.push(labelled('Sääntö', ruleSel));
      for (const c of board.cases) { const sel = menu(`Tapauksen ${c.id} varjon kärki`, board.groundCandidates.map(g => [String(g), `x = ${g}`] as const), ground.get(c.id) ?? ''); sel.disabled = !open; sel.addEventListener('change', () => { ground.set(c.id, sel.value); update(); }); parts.push(labelled(`${c.id}: lyhty (${c.lampX}, ${c.lampY}), keppi ${c.poleHeight}`, sel)); }
    }
    editor.replaceChildren(...parts, live);
  }
  const live = h('div', { style: stack, 'data-inquiry-live': '' }), evidence = h('div', { style: panel, 'data-inquiry-evidence': '' });
  function update() {
    const m = model();
    evidence.replaceChildren(...modelBoardNotes(task, visible()));
    live.replaceChildren(...[...visible(), task.probe].map(o => { const path = m ? inquiryModelPath(m, o.query, board) : undefined; return note(`${o.id === task.probe.id ? 'Ennuste' : `Havainto ${o.id}`}: mallisi reitti ${path ? path.join(' → ') : '–'}${o.id === task.probe.id ? '' : ` · havaittu ${o.path.join(' → ')}`}`); }));
    render(); changed();
  }
  const lock = button('Lukitse malli ja ennuste', () => {
    const m = model(); if (!m) { status.textContent = 'Täydennä malli ensin.'; return; }
    const prediction = inquiryModelPath(m, task.probe.query, board); const before = actions.length;
    if (!prediction || !add({ type: 'draft', model: m }) || !add({ type: 'lock-model', prediction })) { actions.length = before; status.textContent = 'Malli ei vielä selitä kaikkia annettuja havaintoja. Vertaa mallisi reittejä havaintoihin.'; return; }
    status.textContent = `Lukittu ennuste: ${prediction.join(' → ')}`; renderEditor(); update();
  });
  const reveal = button('Avaa uusi havainto', () => { if (!add({ type: 'reveal-evidence' })) { status.textContent = 'Testaa ensin lukittua ennustetta.'; return; } renderEditor(); update(); });
  const revise = button('Tallenna korjattu malli', () => { const m = model(); if (!m || !add({ type: 'revise', model: m })) { status.textContent = 'Korjattu malli ei ole vielä kelvollinen.'; return; } status.textContent = 'Korjaus tallennettu. Testaa malli uudelleen.'; update(); });
  const tests = h('div', { style: row, 'data-inquiry-tests': '' }), results = h('div', { style: stack });
  const pick = (label: string, options: readonly (readonly [string, string])[]) => menu(label, options);
  const partWords: Record<string, string> = { 'high-cell': 'Korkea ruutu', 'low-cell': 'Matala ruutu', 'path-line': 'Reittiviiva', link: 'Kouruyhteys', barrier: 'Este', terminal: 'Päätepiste', lamp: 'Lyhtypiste', pole: 'Keppi', 'ground-point': 'Maapiste' };
  const corr = task.correspondences.map(c => ({ c, sel: pick(`Mallissa: ${c.real}`, Object.entries(partWords).filter(([k]) => task.correspondences.some(x => x.model === k)).map(([k, v]) => [k, v] as const)) }));
  const missing = pick('Mitä malli jättää pois?', [['real-weather', 'Oikea sää'], ['water-amount', 'Veden määrä'], ['light-colour', 'Valon väri'], ['heights', 'Korkeuserot'], ['paths', 'Kulkureitit']]);
  const cause = pick('Mikä mallissa ohjaa tulosta?', [['declared-route-rule', 'Ilmoitettu reittisääntö matalimpaan ruutuun'], ['observed-connections', 'Havaitut kouruyhteydet'], ['straight-ray', 'Suora valonsäde'], ['leaf-wish', 'Lehti haluaa kulkea sinne']]);
  const scope = pick('Mallin rajaus', [['local-model', 'Koskee tätä mallia ja näitä havaintoja'], ['everywhere', 'Koskee kaikkia puroja ja lyhtyjä']]);
  const meaning = h('div', { style: panel }, h('strong', {}, 'Mitä malli vastaa?'), ...corr.map(x => labelled(x.c.real, x.sel)), labelled('Pois jäävä', missing), labelled('Ohjaava sääntö', cause), labelled('Rajaus', scope));
  meaning.addEventListener('change', changed);
  function render() {
    const r = replay();
    lock.style.display = r.locked ? 'none' : 'block';
    reveal.style.display = r.locked && !r.revealed && task.newObservation ? 'block' : 'none';
    revise.style.display = r.revealed ? 'block' : 'none';
    tests.replaceChildren(...(r.locked ? [...visible(), task.probe].map(o => button(`Testaa mallia: ${o.id}`, () => { if (!add({ type: 'test-model', route: o.id })) status.textContent = 'Tätä testiä ei voi tehdä vielä.'; else status.textContent = ''; update(); })) : []));
    results.replaceChildren(...r.tests.map(t => { const o = [...visible(), task.probe].find(x => x.id === t.observation); const fits = o && o.path.length === t.path.length && o.path.every((id, i) => id === t.path[i]); return note(`Testi ${t.observation}: malli ${t.path.join(' → ')} · ${o === task.probe && !r.revealed ? 'ennuste' : fits ? 'sopii havaintoon' : 'ei sovi havaintoon'}`); }));
  }
  if (task.initialDraft) { const d = task.initialDraft; if (d.kind === 'terrain') for (const c of d.terrain.cells) heights.set(c.id, c.height); }
  renderEditor(); update();
  const node = h('div', { style: stack }, evidence, editor, lock, reveal, revise, status, tests, results, meaning);
  return {
    node,
    ready: () => replay().locked && corr.every(x => x.sel.value) && !!missing.value && !!cause.value && !!scope.value,
    read: () => { const r = replay(); return { kind, mode: 'model', actions: actions.map(a => structuredClone(a)), correspondences: corr.map(x => ({ id: x.c.id, model: x.sel.value })), missing: missing.value, prediction: r.current ? inquiryModelPath(r.current, task.probe.query, board) ?? [] : [], cause: cause.value, scope: scope.value }; },
    preview: () => { const m = model(), r = replay(); return { kind, mode: 'model', actions: [...actions, ...(m && (!r.locked || r.revealed) ? [{ type: r.locked ? 'revise' : 'draft', model: m, id: `a${actions.length + 1}`, run: task.run } as InquiryAction] : [])], correspondences: [], missing: '', prediction: [], cause: '', scope: '' }; },
  };
}
function evidenceWork(task: Task<'evidence'>, changed: () => void): Work {
  const actions: InquiryAction[] = [], rechecked = h('div', { style: stack });
  const support = task.rows.map(r => ({ r, ...check(`Käytän riviä ${r.id} (${r.group}: ${r.value} ${r.unit})`) }));
  const evaluate = task.skill === 'evaluate';
  const claim = menu('Oma johtopäätös', evaluate
    ? [['correct-error', 'Kirjausvirhe: korjaan tarkistettuun arvoon'], ['retain-outlier', 'Poikkeama vahvistui: säilytän sen'], ['discard-without-check', 'Poistan rivin tarkistamatta']]
    : [['A-higher', 'Ryhmän A tulokset ovat suurempia'], ['B-higher', 'Ryhmän B tulokset ovat suurempia'], ['same', 'Ryhmät ovat yhtä suuret'], ['inconclusive', 'Tulos jää epävarmaksi']]);
  const scope = menu('Johtopäätöksen rajaus', [['these-samples', 'Koskee näitä mittauksia'], ['everywhere', 'Koskee kaikkia paikkoja']]);
  const correction = h('input', { type: 'text', maxlength: 10, 'aria-label': 'Tarkistettu arvo', style: `${control};width:100%` });
  const unit = menu('Tarkistetun arvon yksikkö', [...new Set(['mm', 'cm', task.rangeUnit, ...task.rows.map(r => r.unit)])].map(u => [u, u] as const));
  const retain = menu('Alkuperäinen arvo', [['true', 'Säilyy sellaisenaan'], ['false', 'Korvataan tarkistetulla']]);
  const checks = evaluate ? h('div', { style: row }, ...task.rows.map(r => button(`Mittaa uudelleen ${r.id}`, () => { if (actions.some(a => a.type === 'recheck' && a.row === r.id)) return; const next = [...actions, { type: 'recheck', row: r.id, id: `a${actions.length + 1}`, run: task.run } as InquiryAction]; const seen = replayInquiryRechecks(task, next); if (!seen) return; actions.push(next.at(-1)!); rechecked.replaceChildren(...[...seen].map(([id, v]) => note(`Uudelleenmittaus ${id}: ${v} ${task.rows.find(x => x.id === id)!.unit}`))); changed(); }))) : null;
  const node = h('div', { style: stack }, checks, rechecked, h('div', { style: panel }, h('strong', {}, 'Mitä rivejä käytät?'), ...support.map(s => s.node)), labelled('Johtopäätös', claim),
    ...(evaluate ? [labelled('Tarkistettu arvo', correction), labelled('Yksikkö', unit), labelled('Alkuperäinen arvo', retain)] : []), labelled('Rajaus', scope));
  node.addEventListener('change', changed); node.addEventListener('input', changed);
  return {
    node,
    ready: () => !!claim.value && !!scope.value && support.some(s => s.input.checked) && (!evaluate || !!retain.value),
    read: () => ({ kind, mode: 'evidence', actions: actions.map(a => ({ ...a })), claim: claim.value, support: support.filter(s => s.input.checked).map(s => s.r.id), scope: scope.value,
      correction: evaluate ? correction.value.trim().replace(',', '.') : '', correctionUnit: evaluate ? unit.value : '', retain: evaluate ? retain.value === 'true' : true }),
  };
}

export function mountInquiryIslands(task: InquiryIslandsTask, host: HTMLElement, submit: (response: InquiryIslandsResponse) => void, onChange?: (response: InquiryIslandsResponse) => void): { reveal(): void } {
  let work: Work, done = false, reviewing = false;
  const check = button(task.review ? 'Siirry omaan selitykseen' : 'Tarkista oma tutkimus', () => {
    if (done) return;
    const response = work.read() as InquiryIslandsResponse;
    if (!task.review) { done = true; submit(response); return; }
    reviewing = true; check.style.display = 'none';
    for (const field of work.node.querySelectorAll<HTMLInputElement | HTMLButtonElement | HTMLSelectElement>('input,button,select')) field.disabled = true;
    work.node.style.display = 'none';
    const toggle = button('Näytä oma tutkimus', () => { const show = work.node.style.display === 'none'; work.node.style.display = show ? 'grid' : 'none'; area.style.display = show ? 'none' : 'grid'; toggle.textContent = show ? 'Palaa omaan selitykseen' : 'Näytä oma tutkimus'; });
    const area = h('div', { style: stack });
    mountObservedExplanation({ ...inquiryExplanation(task)!, allowEitherChannel: true }, area, observation => { done = true; submit({ ...response, review: { observations: observation.observations, confirmedByAdult: observation.confirmedByAdult, assistance: observation.assistance } }); });
    for (const control of area.querySelectorAll<HTMLElement>('button,select,textarea,summary,input:not([type=checkbox]),label:has(input[type=checkbox])')) control.style.minHeight = '44px';
    reviewArea.replaceChildren(note(task.review.prompt), toggle, area);
  }, { class: 'btn primary wide' });
  const changed = () => { if (!work) return; onChange?.((work.preview?.() ?? work.read()) as InquiryIslandsResponse); if (!reviewing) { const ready = work.ready(); check.disabled = !ready; check.style.display = ready ? 'block' : 'none'; } };
  switch (task.mode) {
    case 'observe': work = observeWork(task, changed); break;
    case 'compare': work = compareWork(task, changed); break;
    case 'question': work = questionWork(task, changed); break;
    case 'plan': work = planWork(task, changed); break;
    case 'experiment': work = experimentWork(task, changed); break;
    case 'model': work = modelWork(task, changed); break;
    case 'evidence': work = evidenceWork(task, changed); break;
  }
  const reviewArea = h('div', { style: stack }), model = h('div', { style: stack });
  host.replaceChildren(h('div', { style: stack, 'data-inquiry-workshop': task.mode }, work.node, check, reviewArea, model));
  changed();
  return { reveal() { inquiryIslandsWorkedPaint(task)(model); } };
}
export { inquiryMembership };
