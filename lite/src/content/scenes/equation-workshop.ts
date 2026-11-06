import type { Paint } from '../../engine/types';
import { svg } from '../../ui/art';
import { h } from '../../ui/dom';
import { paint, table } from '../kit';
import {
  checkEquationWorkshop, inequalitySet, linearText, quadraticText, setText, signedText,
  solutionEquationWorkshop, zeroForm,
  type Direction, type EquationWorkshopResponse, type EquationWorkshopTask, type InequalityTask,
  type QuadraticCandidate, type SquareRootsTask, type SubstitutionTask,
} from '../models/equation-workshop';

const ink = '#214b54', blue = '#267b76', gold = '#d8a853', faded = '#dbe8df';
const text = (x: number, y: number, label: string, size = 14) =>
  `<text x="${x}" y="${y}" text-anchor="middle" fill="${ink}" font-size="${size}" font-weight="700">${label}</text>`;
const rect = (x: number, y: number, w: number, height: number, fill: string) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${height}" rx="6" fill="${fill}" stroke="${ink}"/>`;
const panel = (art: string, detail: string) =>
  `<div class="equation-workshop" style="grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;gap:.45rem;min-width:0">
    ${art ? `<div style="flex:1 1 142px;min-width:0">${art}</div>` : ''}
    <div style="flex:2 1 225px;min-width:0;overflow-wrap:anywhere">${detail}</div>
  </div>`;
const leftEdge = 22, rightEdge = 298;
const scale = (value: number, min: number, max: number) => leftEdge + (rightEdge - leftEdge) * (value - min) / (max - min);

function lineArt(min: number, max: number, overlay: string, description: string) {
  const ticks = Array.from({ length: max - min + 1 }, (_, index) => {
    const n = min + index, x = scale(n, min, max);
    return `<path d="M${x} 31v12" stroke="${ink}" stroke-width="1.5"/>` +
      ((n % 2 === 0 || n === min || n === max) ? text(x, 62, signedText(n), 11) : '');
  }).join('');
  return svg(320, 70, `<path d="M${leftEdge - 8} 37H${rightEdge + 8}m-5 -4 5 4-5 4M${leftEdge - 3} 33l-5 4 5 4" fill="none" stroke="${ink}" stroke-width="2"/>` +
    ticks + overlay, description);
}
interface DraftSet { boundary: number; direction: Direction; inclusive: boolean }

function inequalityPanel(task: InequalityTask, draft?: DraftSet, completed = false) {
  const min = task.activity === 'inequality-solve' ? -6 : Math.min(-2, ...task.samples);
  const max = task.activity === 'inequality-solve' ? 6 : Math.max(6, ...task.samples);
  const zero = scale(0, min, max);
  const excluded = task.domain === 'nonnegative' ? `<path d="M${leftEdge - 6} 37H${zero}" stroke="#a5b8ae" stroke-width="5" stroke-dasharray="3 3"/>` : '';
  let ray = '';
  if (draft && draft.boundary >= min && draft.boundary <= max) {
    const x = scale(draft.boundary, min, max);
    const end = draft.direction === 'lower' ? task.domain === 'nonnegative' ? zero : leftEdge - 8 : rightEdge + 8;
    if (task.domain === 'nonnegative' && (draft.boundary < 0 || (draft.boundary === 0 && !draft.inclusive && draft.direction === 'lower'))) {
      if (draft.direction === 'higher') ray = `<path d="M${zero} 37H${rightEdge + 8}m-7 -5 7 5-7 5" fill="none" stroke="${blue}" stroke-width="4"/><circle cx="${zero}" cy="37" r="4" fill="${blue}"/>`;
    } else {
      const arrow = task.domain === 'nonnegative' && draft.direction === 'lower' ? '' :
        `M${end + (draft.direction === 'lower' ? 7 : -7)} 32L${end} 37l${draft.direction === 'lower' ? 7 : -7} 5`;
      ray = `<path d="M${x} 37H${end}${arrow}" fill="none" stroke="${blue}" stroke-width="4"/>` +
        `<circle cx="${x}" cy="37" r="5.5" fill="${draft.inclusive ? blue : 'white'}" stroke="${blue}" stroke-width="2.5"/>` +
        (task.domain === 'nonnegative' && draft.direction === 'lower' ? `<circle cx="${zero}" cy="37" r="4" fill="${blue}"/>` : '');
    }
  }
  const condition = `${linearText(task.left, task.variable)} ${task.relation} ${signedText(task.right)}`;
  const set = draft ? `<p><strong>${completed ? 'Ratkaisujoukko' : 'Merkitsemäsi alue'}: ${setText(draft.boundary, draft.direction, draft.inclusive, task.variable, task.domain)}.</strong></p>` : '';
  return panel(lineArt(min, max, excluded + ray, draft ? 'Lukusuoralla näkyy valittu alue.' : 'Lukusuora odottaa valittua rajaa ja aluetta.'),
    table(['Ehto', 'Lähtöjoukko'], [[condition, task.domain === 'nonnegative' ? `${task.variable} ≥ 0, reaaliluvut` : 'Kaikki reaaliluvut']]) +
    `<p>${task.label}</p>${set}`);
}

function substitutionPanel(task: SubstitutionTask, solved = false) {
  const response = solved ? solutionEquationWorkshop(task) : undefined;
  const values = response?.activity === 'substitute' ? [signedText(response.left), signedText(response.right)] : ['?', '?'];
  const art = rect(22, 18, 122, 39, faded) + rect(175, 18, 122, 39, faded) +
    text(83, 43, values[0]!) + text(236, 43, values[1]!) + text(160, 43, response?.activity === 'substitute' ? response.equal ? '=' : '≠' : '↔') +
    text(83, 75, 'Vasen puoli', 12) + text(236, 75, 'Oikea puoli', 12);
  return panel(svg(320, 82, art, 'Kaksi erikseen laskettavaa yhtälön puolta.'),
    table(['Alkuperäinen yhtälö', 'Kokeiltava arvo'], [[`${linearText(task.left)} = ${linearText(task.right)}`, `x = ${signedText(task.candidate)}`]]) +
    (response?.activity === 'substitute' ? `<p>${values[0]} ${response.equal ? '=' : '≠'} ${values[1]}. Ehdokas ${response.equal ? 'on ratkaisu' : 'ei toteuta yhtälöä'}.</p>` : ''));
}

function squarePanel(task: SquareRootsTask, solved = false) {
  const response = solved ? solutionEquationWorkshop(task) : undefined;
  let overlay = '';
  if (solved && task.radicand >= 0) {
    const root = Math.sqrt(task.radicand);
    overlay = (root === 0 ? [0] : [-root, root]).map(n => `<circle cx="${scale(n, -6, 6)}" cy="37" r="5.5" fill="${gold}" stroke="${ink}"/>`).join('');
  }
  const art = lineArt(-6, 6, overlay, solved ? 'Kaikki ratkaisupisteet samalla lukusuoralla.' : 'Suunnattu lukusuora mahdollisille ratkaisupisteille.');
  const labels = task.context === 'gate' ? ['Portin ehto', 'Lähtöjoukko'] : ['Yhtälö', 'Lähtöjoukko'];
  const outcome = response?.activity === 'square-roots' ? `<p><strong>Ratkaisujoukko:</strong> ${response.roots.length ? '{ ' + response.roots.join(', ') + ' }' : '∅'}. <strong>Pääarvo:</strong> ${response.principal ?? 'ei reaalista arvoa'}.</p>` : '';
  return panel(art, table(labels, [[`x² = ${signedText(task.radicand)}`, 'Kaikki reaaliluvut']]) + outcome +
    (solved && task.context === 'gate' && task.radicand < 0 ? '<p>Piirros siirtyy korjattavaksi. Mallin kiertoreitti on valmiina.</p>' : ''));
}

export function equationWorkshopArt(task: EquationWorkshopTask, solved = false): Paint {
  if (task.activity === 'substitute') return paint(substitutionPanel(task, solved));
  if (task.activity === 'square-roots') return paint(squarePanel(task, solved));
  return paint(inequalityPanel(task, solved ? inequalitySet(task) : undefined, solved));
}

export function quadraticWorkshopArt(candidates: readonly QuadraticCandidate[], order: readonly (0 | 1 | 2)[], resolved = false): Paint {
  const labels = candidates.map((candidate, index) => [
    String.fromCharCode(65 + index), `${quadraticText(candidate.left, order)} = ${quadraticText(candidate.right, order)}`,
    ...(resolved ? [quadraticText(zeroForm(candidate)) + ' = 0'] : []),
  ]);
  return paint(panel('', table(resolved ? ['Piirros', 'Alkuperäinen yhtälö', 'Nollamuoto'] : ['Piirros', 'Alkuperäinen yhtälö'], labels)));
}

const inputStyle = 'width:100%;min-width:0;min-height:44px;padding:6px 8px;border:1px solid #78918b;border-radius:8px;background:#fffdf5;color:#214b54;font:inherit';
const rowStyle = 'display:flex;flex-wrap:wrap;gap:.45rem;align-items:end';
const label = (caption: string, control: HTMLElement, basis = 115) =>
  h('label', { class: 'stack', style: `flex:1 1 ${basis}px;min-width:0;gap:.2rem;font-size:14px` }, caption, control);
const field = (caption: string, inputmode = 'decimal') =>
  h('input', { type: 'text', inputmode, maxlength: 32, required: true, 'aria-label': caption, style: inputStyle });
const select = (caption: string, entries: readonly (readonly [string, string])[]) =>
  h('select', { required: true, 'aria-label': caption, style: inputStyle },
    h('option', { value: '', disabled: true, selected: true }, 'Valitse'),
    ...entries.map(([value, name]) => h('option', { value }, name)));
function readNumber(text: string): number {
  const source = text.trim().replace(/[−–]/g, '-').replace(',', '.');
  return /^[+-]?\d+(?:\.\d+)?$/.test(source) ? Number(source) : NaN;
}
const validNumber = (n: number) => Number.isFinite(n) && Math.abs(n) <= Number.MAX_SAFE_INTEGER;

export function mountEquationWorkshop(task: EquationWorkshopTask, host: HTMLElement, submit: (response: EquationWorkshopResponse) => void) {
  const exact = h('div', { class: 'exp-exact' });
  equationWorkshopArt(task)(exact);
  const controls = h('div', { style: rowStyle });
  const status = h('p', { role: 'status', 'aria-live': 'polite', class: 'small' });
  const done = h('button', { type: 'submit', class: 'btn primary' }, 'Tarkista');
  const form = h('form', { class: 'stack', style: 'gap:.55rem' }, exact, controls, done, status);
  const read = task.activity === 'substitute' ? substitutionControls(task, controls)
    : task.activity === 'square-roots' ? squareControls(task, controls) : inequalityControls(task, controls, exact);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (done.disabled) return;
    const response = read();
    if (!response) {
      status.textContent = 'Täytä vastausruudut luvuilla tai pyydetyillä merkinnöillä.';
      return;
    }
    for (const element of form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>('input,select,button')) element.disabled = true;
    if (checkEquationWorkshop(task, response).ok) equationWorkshopArt(task, true)(exact);
    submit(response);
  });
  host.append(form);
  return {
    reveal() {
      equationWorkshopArt(task, true)(exact);
      status.textContent = 'Mallitaululla näkyy koko tarkistus.';
    },
  };
}

function substitutionControls(task: SubstitutionTask, host: HTMLElement) {
  const left = field('Vasemman puolen arvo'), right = field('Oikean puolen arvo');
  const equal = select('Ovatko arvot samat?', [['yes', 'Samat (=)'], ['no', 'Eri (≠)']]);
  host.append(label('Vasemman puolen arvo', left), label('Oikean puolen arvo', right), label('Ovatko arvot samat?', equal));
  return (): EquationWorkshopResponse | undefined => {
    const l = readNumber(left.value), r = readNumber(right.value);
    if (!validNumber(l) || !validNumber(r) || !equal.value) return;
    return { kind: task.kind, activity: task.activity, left: l, right: r, equal: equal.value === 'yes' };
  };
}

function inequalityControls(task: InequalityTask, host: HTMLElement, exact: HTMLElement) {
  const boundary = field('Raja-arvo');
  const direction = select('Alueen suunta', [['lower', 'Pienemmät luvut'], ['higher', 'Suuremmat luvut']]);
  const included = select('Kuuluuko rajakohta?', [['open', 'Avoin ○'], ['closed', 'Suljettu ●']]);
  const divisor = field('Jaa luvulla');
  if (task.activity === 'inequality-solve') host.append(label('Jaa luvulla', divisor, 90));
  host.append(label('Raja-arvo', boundary, 85), label('Alueen suunta', direction, 110), label('Kuuluuko rajakohta?', included, 110));
  const sampleOptions = task.samples.map(n => select(`Kuuluuko ${signedText(n)} joukkoon?`, [['yes', 'Kuuluu'], ['no', 'Ei kuulu']]));
  if (task.activity === 'inequality-interpret') {
    const samples = h('div', { style: rowStyle + ';width:100%' });
    sampleOptions.forEach((choice, index) => samples.append(label(signedText(task.samples[index]!) + ' kuuluu?', choice, 90)));
    host.append(samples);
  }
  const read = () => {
    const value = readNumber(boundary.value);
    if (!validNumber(value) || (direction.value !== 'lower' && direction.value !== 'higher') || !included.value) return;
    return { boundary: value, direction: direction.value, inclusive: included.value === 'closed' } satisfies DraftSet;
  };
  const preview = () => { exact.innerHTML = inequalityPanel(task, read()); };
  boundary.addEventListener('input', preview);
  direction.addEventListener('change', preview);
  included.addEventListener('change', preview);
  return (): EquationWorkshopResponse | undefined => {
    const draft = read();
    if (!draft) return;
    if (task.activity === 'inequality-solve') {
      const value = readNumber(divisor.value);
      if (!validNumber(value)) return;
      return { kind: task.kind, activity: task.activity, ...draft, divisor: value };
    }
    if (sampleOptions.some(choice => !choice.value)) return;
    return { kind: task.kind, activity: task.activity, ...draft, members: sampleOptions.map(choice => choice.value === 'yes') };
  };
}

function squareControls(task: SquareRootsTask, host: HTMLElement) {
  const count = select('Reaaliratkaisujen määrä', [['0', '0'], ['1', '1'], ['2', '2']]);
  const roots = [field('Ratkaisu 1', 'text'), field('Ratkaisu 2', 'text')];
  const rootLabels = roots.map((control, index) => label(`Ratkaisu ${index + 1}`, control, 90));
  const hasPrincipal = select('Onko reaalista pääarvoa?', [['yes', 'On'], ['no', 'Ei reaalista']]);
  const principal = field('Neliöjuuren pääarvo', 'text');
  const principalLabel = label('Neliöjuuren pääarvo', principal, 126);
  let active = principal;
  for (const control of [...roots, principal]) control.addEventListener('focus', () => { active = control; });
  const update = () => {
    const visibility = (entry: HTMLElement, control: HTMLInputElement, shown: boolean) => {
      entry.hidden = !shown;
      entry.style.display = shown ? '' : 'none';
      control.required = shown;
    };
    rootLabels.forEach((entry, index) => visibility(entry, roots[index]!, index < Number(count.value)));
    visibility(principalLabel, principal, hasPrincipal.value === 'yes');
    const canInsert = Number(count.value) > 0 || hasPrincipal.value === 'yes';
    for (const button of symbols.querySelectorAll('button')) button.disabled = !canInsert;
  };
  count.addEventListener('change', update);
  hasPrincipal.addEventListener('change', update);
  const symbols = h('div', { style: 'display:flex;gap:.3rem' },
    ...['−', '√'].map(symbol => h('button', {
      type: 'button', class: 'btn', 'aria-label': symbol === '√' ? 'Lisää neliöjuurimerkki' : 'Lisää miinusmerkki',
      onclick: () => {
        if (active.closest('[hidden]')) active = [...roots, principal].find(control => !control.closest('[hidden]')) ?? principal;
        if (active.closest('[hidden]')) return;
        active.setRangeText(symbol, active.selectionStart ?? active.value.length, active.selectionEnd ?? active.value.length, 'end');
        active.focus();
      },
    }, symbol)));
  host.append(label('Reaaliratkaisujen määrä', count, 150), ...rootLabels,
    label('Onko reaalista pääarvoa?', hasPrincipal, 155), principalLabel, symbols);
  update();
  return (): EquationWorkshopResponse | undefined => {
    if (!count.value || !hasPrincipal.value) return;
    return { kind: task.kind, activity: task.activity, roots: roots.slice(0, Number(count.value)).map(control => control.value),
      principal: hasPrincipal.value === 'yes' ? principal.value : null };
  };
}
