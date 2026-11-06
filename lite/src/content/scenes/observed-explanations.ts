import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { checkObservedExplanation, type CriterionObservation, type ObservedExplanationResponse, type ObservedExplanationTask } from '../models/observed-explanations';

const grid = 'display:grid;gap:6px';
const muted = 'margin:0;color:#415f58';
const area = 'width:100%;box-sizing:border-box;border:1px solid #8aa99e;border-radius:8px;background:#fffef8;color:#163e3c;padding:6px 8px;font:inherit';
const menu = `${area};min-height:36px`;

export function explanationBoard(task: ObservedExplanationTask): Paint {
  return host => host.replaceChildren(h('div', { 'data-explanation-board': '', style: grid },
    h('dl', { style: 'margin:0;display:grid;gap:3px;grid-template-columns:minmax(0,auto) minmax(0,1fr)' },
      ...task.givens.flatMap(({ label, value }) => [
        h('dt', { style: 'font-weight:700;padding-right:10px' }, label),
        h('dd', { style: 'margin:0' }, value),
      ]))));
}

/** An on-device handoff. No recording, transcription, text analysis, or adult authentication. */
export function mountObservedExplanation(
  task: ObservedExplanationTask,
  host: HTMLElement,
  submit: (response: ObservedExplanationResponse) => void,
): { reveal(): void } {
  if (task.allowEitherChannel) {
    const inner=h('div',{});let current:{reveal():void};let revealed=false;
    const choices=(['spoken','written'] as const).map(channel=>h('button',{type:'button',class:'btn small','aria-pressed':String(channel===task.channel),onclick:()=>select(channel)},channel==='spoken'?'Kerron omin sanoin':'Kirjoitan tähän'));
    function select(channel:'spoken'|'written'){
      inner.replaceChildren();choices.forEach((button,i)=>button.setAttribute('aria-pressed',String((i===0?'spoken':'written')===channel)));
      const {allowEitherChannel:_,...fixed}=task;current=mountObservedExplanation({...fixed,channel},inner,submit);
      if(revealed)current.reveal();
    }
    host.append(h('div',{'data-explanation-options':'',style:grid},h('div',{style:'display:flex;gap:6px;flex-wrap:wrap'},...choices),inner));select(task.channel);
    return {reveal(){revealed=true;current.reveal();}};
  }
  const spoken = task.channel === 'spoken';
  const draft = h('textarea', { rows: 2, 'aria-label': 'Oma selitykseni', style: area });
  const go = h('button', { type: 'button', class: 'btn primary wide' }, spoken ? 'Olen kertonut selitykseni' : 'Olen kirjoittanut selitykseni');
  go.disabled = !spoken;
  draft.addEventListener('input', () => { go.disabled = !draft.value.trim(); });
  const learner = h('div', { 'data-explanation-learner': '' }, h('div', { style: grid },
    spoken
      ? h('p', { style: muted }, 'Kerro omin sanoin vieressä olevalle aikuiselle. Puhetta ei tallenneta.')
      : h('label', { style: grid }, h('strong', {}, 'Oma selitykseni'), draft),
    go));

  const fields = task.rubric.map(criterion => {
    const select = h('select', { 'aria-label': criterion.label, style: menu },
      h('option', { value: 'unobserved' }, 'Ei havaittu'),
      h('option', { value: 'met' }, 'Näkyi selityksessä'),
      h('option', { value: 'not-yet' }, 'Tarvitsee harjoittelua'));
    return { criterion, select, row: h('label', {
      style: 'display:grid;grid-template-columns:minmax(0,1fr) minmax(114px,37%);gap:6px;align-items:center',
    }, h('span', {}, h('strong', {}, criterion.label), h('small', { style: 'display:block;line-height:1.2' }, criterion.guide)), select) };
  });
  const assistance = h('select', { 'aria-label': 'Saiko oppija apua?', style: menu },
    h('option', { value: '' }, 'Valitse'),
    h('option', { value: 'none' }, 'Ilman apua'),
    h('option', { value: 'helped' }, 'Sai apua'));
  const confirmed = h('input', { type: 'checkbox', style: 'width:18px;height:18px;flex:none' });
  const note = h('input', { type: 'text', maxlength: 160, 'aria-label': 'Vapaa palaute tähän hetkeen', style: area });
  const back = h('button', { type: 'button', class: 'btn small' }, 'Palaa selitykseen');
  const done = h('button', { type: 'submit', class: 'btn primary wide' }, 'Vahvista havainto');
  const pending = h('p', { role: 'status', style: muted });
  const heading = h('h3', { tabindex: -1, style: 'margin:0;font-size:16px' }, 'Aikuisen arvio');
  const review = h('blockquote', { style: 'margin:0;padding:5px 8px;border-left:3px solid #8aa99e;white-space:pre-wrap;overflow-wrap:anywhere;max-height:70px;overflow:auto' });
  const adult = h('form', { 'data-explanation-adult': '', hidden: true },
    h('div', { style: `${grid};padding:7px 9px;border:1px solid #acc2ba;border-radius:10px;background:#edf4e9;font-size:13px` },
      heading,
      spoken ? h('p', { style: muted }, 'Arvioi kuulemasi oma selitys.') : review,
      ...fields.map(field => field.row),
      h('label', { style: 'display:grid;grid-template-columns:minmax(0,1fr) minmax(114px,37%);gap:6px;align-items:center' }, 'Saiko oppija apua?', assistance),
      h('label', { style: 'display:flex;align-items:center;gap:7px;min-height:32px' }, confirmed,
        spoken ? 'Kuulin oppijan oman selityksen.' : 'Luin oppijan oman selityksen.'),
      h('details', {}, h('summary', {}, 'Tallennus ja vapaa palaute'),
        h('p', { style: muted }, 'Laitteelle jäävät arvio ja tieto avusta. Puhetta, vastaustekstiä ja palautetekstiä ei tallenneta.'), note),
      pending,
      h('div', { style: 'display:flex;align-items:center;gap:5px' }, back, done)));
  const model = h('p', { 'data-explanation-model': '', hidden: true, style: 'margin:0;padding:7px 8px;border-left:3px solid #8aa99e;background:#eef4ec' },
    h('strong', {}, 'Malliselitys. '), task.model);
  let locked = false;
  let revealed = false;
  const resetObservations = () => {
    confirmed.checked = false;
    for (const { select } of fields) select.value = 'unobserved';
    assistance.value = revealed ? 'helped' : '';
    note.value = '';
    pending.textContent = '';
  };
  go.addEventListener('click', () => {
    review.textContent = draft.value;
    learner.hidden = true;
    adult.hidden = false;
    heading.focus();
  });
  back.addEventListener('click', () => {
    resetObservations();
    adult.hidden = true;
    learner.hidden = false;
    (spoken ? go : draft).focus();
  });
  adult.addEventListener('submit', event => {
    event.preventDefault();
    if (locked) return;
    if (!assistance.value) {
      pending.textContent = 'Merkitse, käytettiinkö selittämiseen apua.';
      assistance.focus();
      return;
    }
    const response: ObservedExplanationResponse = {
      kind: 'observed-explanation', channel: task.channel,
      ...(spoken ? {} : { text: draft.value }),
      observations: Object.fromEntries(fields.map(({ criterion, select }) => [criterion.id, select.value as CriterionObservation])),
      confirmedByAdult: confirmed.checked,
      assistance: revealed || assistance.value === 'helped' ? 'helped' : 'none',
      ...(note.value.trim() ? { note: note.value.trim() } : {}),
    };
    const verdict = checkObservedExplanation(task, response);
    if (!verdict.observedByAdult) {
      pending.textContent = verdict.why ?? '';
      return;
    }
    locked = true;
    for (const control of adult.querySelectorAll('input,select,button')) (control as HTMLInputElement).disabled = true;
    submit(response);
  });
  host.append(h('div', { 'data-observed-explanation': task.channel, style: grid }, learner, adult, model));
  return {
    reveal() {
      model.hidden = false;
      revealed = true;
      resetObservations();
      assistance.disabled = true;
    },
  };
}

/** Solo play without adult review. The learner explains aloud or in thought, then compares with the model
 *  explanation. Nothing is graded: the self-check is practice and never counts as independent evidence. */
export function mountSelfExplanation(
  task: ObservedExplanationTask,
  host: HTMLElement,
  submit: (response: ObservedExplanationResponse) => void,
): { reveal(): void } {
  const go = h('button', { type: 'button', class: 'btn primary wide' }, 'Olen selittänyt');
  const learner = h('div', { 'data-self-explanation-learner': '', style: grid },
    h('p', { style: muted }, 'Selitä omin sanoin ääneen tai mielessäsi. Mitään ei tallenneta.'), go);
  const checks = task.rubric.map(criterion => {
    const box = h('input', { type: 'checkbox', style: 'width:20px;height:20px;flex:none' });
    return { criterion, box, row: h('label', { style: 'display:flex;align-items:center;gap:8px;min-height:44px' }, box,
      h('span', {}, h('strong', {}, criterion.label))) };
  });
  const done = h('button', { type: 'button', class: 'btn primary wide' }, 'Jatka retkeä');
  const model = h('p', { 'data-explanation-model': '', style: 'margin:0;padding:7px 8px;border-left:3px solid #8aa99e;background:#eef4ec' },
    h('strong', {}, 'Malliselitys. '), task.model);
  const compare = h('div', { 'data-self-explanation-compare': '', style: `${grid};display:none` },
    model, h('p', { style: muted }, 'Mitä sinun selityksessäsi oli? Rastita ne kohdat.'), ...checks.map(c => c.row), done);
  let locked = false;
  const open = () => { learner.style.display = 'none'; compare.style.display = 'grid'; };
  go.addEventListener('click', () => { open(); done.focus(); });
  done.addEventListener('click', () => {
    if (locked) return;
    locked = true;
    for (const control of compare.querySelectorAll('input,button')) (control as HTMLInputElement).disabled = true;
    submit({ kind: 'observed-explanation', channel: task.channel, observations: Object.fromEntries(checks.map(({ criterion, box }) => [criterion.id, box.checked ? 'met' : 'not-yet'])),
      confirmedByAdult: false, assistance: 'none' });
  });
  host.append(h('div', { 'data-self-explanation': '', style: grid }, learner, compare));
  return { reveal: open };
}
