import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { solutionProblemWorkbench, trialUnits, type ProblemWorkbenchResponse, type ProblemWorkbenchTask } from '../models/problem-workbench';

const grid = 'display:grid;gap:6px';
const row = 'display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px';
const card = `${grid};padding:6px 8px;background:#edf4e9;border:1px solid #adc6ba;border-radius:9px`;
const field = 'min-height:36px;box-sizing:border-box;border:1px solid #86a99b;border-radius:8px;padding:4px 6px;background:#fffef8;color:#153d39;font:inherit;max-width:100%';

export function problemWorkbenchBoard(task: ProblemWorkbenchTask): Paint {
  return host => host.replaceChildren(h('div', { 'data-problem-givens': '', style: grid },
    h('p', { class: 'small', style: 'margin:0' }, h('strong', {}, 'Tuttu työväline. '), task.context.title),
    h('dl', { style: 'margin:0;display:grid;gap:2px 10px;grid-template-columns:auto minmax(0,1fr)' },
      ...task.givens.flatMap(given => [h('dt', { style: 'font-weight:700' }, given.label), h('dd', { style: 'margin:0' }, given.value)]))));
}

function action(text: string, onclick: () => void, label?: string) {
  return h('button', { type: 'button', class: 'btn small', style: 'min-height:36px', onclick, 'aria-label': label }, text);
}

function select<T extends string>(label: string, options: readonly (readonly [T, string])[]) {
  const input = h('select', { 'aria-label': label, style: field },
    h('option', { value: '' }, 'Valitse'), ...options.map(([value, text]) => h('option', { value }, text)));
  return {
    input,
    get: () => (input.value || null) as T | null,
    set: (value: T | null) => { input.value = value ?? ''; },
  };
}

function indexed(label: string, options: readonly string[]) {
  const control = select(label, options.map((text, index) => [String(index), text] as const));
  return { input: control.input, get: () => Number(control.get() ?? -1), set: (index: number) => control.set(String(index)) };
}

function entry(label: string, unit = '') {
  const input = h('input', {
    type: 'text', inputmode: 'numeric', 'aria-label': label,
    style: `${field};width:65px;text-align:center;font-weight:700`,
  });
  return {
    node: h('label', { style: row }, h('span', {}, label), input, h('span', {}, unit)),
    input,
    get: () => /^\d{1,4}$/.test(input.value.trim()) ? Number(input.value) : -1,
    set: (amount: number) => { input.value = String(amount); },
  };
}

function labeled(label: string, input: HTMLElement) {
  return h('label', { style: row }, h('strong', {}, label), input);
}

const marksArt = {
  stone: 'border-radius:47% 53% 51% 49%;background:#77a49a;border:1px solid #426c62',
  tile: 'border-radius:2px;background:#dbad6a;border:1px solid #966427',
  point: 'border-radius:50%;background:#216860;border:1px solid #216860',
  square: 'border-radius:0;background:#c2dfd4;border:2px solid #407569',
};

function markCounter(label: string, medium: keyof typeof marksArt, changed: (value: number) => void = () => {}) {
  let count = 0;
  const visual = h('span', { 'aria-hidden': 'true', style: 'display:flex;flex-wrap:wrap;gap:3px;min-height:16px;align-items:center' });
  const quantity = h('span', { 'aria-live': 'polite', style: 'min-width:2ch;font-weight:750;text-align:center' });
  const less = action('−', () => set(count - 1), `${label}: poista yksi`);
  const more = action('+', () => set(count + 1), `${label}: lisää yksi`);
  function set(value: number) {
    count = Math.max(0, Math.min(24, value));
    visual.replaceChildren(...Array.from({ length: count }, () => h('span', { style: `width:12px;height:12px;${marksArt[medium]}` })));
    quantity.textContent = String(count);
    less.disabled = count === 0;
    more.disabled = count === 24;
    changed(count);
  }
  set(0);
  return { node: h('div', { style: row }, less, quantity, more, visual), get: () => count, set };
}

type Mode = ProblemWorkbenchTask['mode'];
type Task<M extends Mode> = Extract<ProblemWorkbenchTask, { mode: M }>;
type Answer<M extends Mode> = Extract<ProblemWorkbenchResponse, { mode: M }>;
type Board<M extends Mode> = { node: HTMLElement; read(): Answer<M>; show(answer: Answer<M>): void };

function sortBoard(task: Task<'sort'>): Board<'sort'> {
  const roles = task.cards.map((item, index) => {
    const name = `Kortti ${index + 1}`;
    const pocket = select(name, [['given', 'Annetut'], ['question', 'Kysymys'], ['unused', 'Sivuun']] as const);
    const label = h('label', { style: 'display:grid;grid-template-columns:minmax(0,1fr) 120px;gap:4px;align-items:center' },
      h('span', {}, item.text), pocket.input);
    const paint = () => { label.style.background = ({ given: '#dfefe5', question: '#f6e8c9', unused: '#e7e7e7' } as const)[pocket.get()!] ?? ''; };
    pocket.input.addEventListener('change', paint);
    return { pocket, label, paint };
  });
  const unknown = indexed('Etsittävä määrä', task.unknowns);
  return {
    node: h('div', { style: grid }, h('div', { style: card }, ...roles.map(role => role.label)), labeled('Etsittävä määrä ?', unknown.input)),
    read: () => ({ kind: 'problem-workbench', mode: 'sort', roles: roles.map(({ pocket }) => pocket.get()), unknown: unknown.get() }),
    show(answer) {
      roles.forEach(({ pocket, paint }, i) => { pocket.set(answer.roles[i] ?? null); paint(); });
      unknown.set(answer.unknown);
    },
  };
}

function trialBoard(task: Task<'trial'>): Board<'trial'> {
  const observation = select('Koehavainto', [['short', 'Liian vähän'], ['fits', 'Juuri sopiva'], ['surplus', 'Liian paljon']] as const);
  const seen = h('p', { 'data-problem-trial-measure': '', 'aria-live': 'polite', style: 'margin:0;font-weight:700' });
  const changed = h('p', { 'data-problem-trial-second': '', 'aria-live': 'polite', style: 'margin:0' });
  const correction = markCounter('Uusi koe', 'stone', count => {
    changed.textContent = `Uusi koe: ${trialUnits(task, count)} ${task.unit}`;
  });
  let committed = -1;
  let correctionStarted = false;
  const changePanel = h('div', { hidden: true }, h('div', { style: grid },
    h('strong', {}, 'Muuta kokeen määrää'), correction.node, changed));
  const revise = h('div', { hidden: true }, h('div', { style: card },
    seen, labeled('Mitä ensimmäinen koe antoi?', observation.input), changePanel));
  observation.input.addEventListener('change', () => {
    correction.set(committed);
    correctionStarted = false;
    changePanel.hidden = observation.get() === null;
  });
  const freeze = action('Mittaa ensimmäinen koe', () => commit());
  const start = markCounter('Ensimmäinen koe', 'stone', count => { freeze.disabled = count !== task.startingCount; });
  function commit() {
    committed = start.get();
    seen.textContent = `Ensimmäinen koe: ${trialUnits(task, committed)} ${task.unit}`;
    correction.set(committed);
    correctionStarted = false;
    revise.hidden = false;
    for (const button of start.node.querySelectorAll('button')) button.disabled = true;
    freeze.disabled = true;
    observation.input.focus();
  }
  correction.node.addEventListener('click', event => {
    if ((event.target as Element).closest('button')) correctionStarted = true;
  });
  return {
    node: h('div', { style: grid }, h('div', { style: card },
      h('strong', {}, `Ensimmäinen koe: lisää luonnoksen ${task.startingCount} ${task.piece}`), start.node, freeze), revise),
    read: () => ({ kind: 'problem-workbench', mode: 'trial', first: committed, finding: observation.get(),
      second: correctionStarted ? correction.get() : -1 }),
    show(answer) {
      start.set(answer.first); commit(); observation.set(answer.finding);
      changePanel.hidden = false; correction.set(answer.second);
      correctionStarted = true;
    },
  };
}

function strategyBoard(task: Task<'strategy'>): Board<'strategy'> {
  const method = indexed('Työtapa', task.methods.map(item => item.label));
  const reason = indexed('Miksi tapa sopii?', task.reasons);
  const stepFields = h('div', { style: row });
  const plan = h('p', { 'data-problem-plan': '', 'aria-live': 'polite', style: 'margin:0;font-weight:700' });
  let steps: ReturnType<typeof entry>[] = [];
  function paintPlan() {
    const amount = steps[0]?.get() ?? -1;
    const load = task.methods[method.get()]?.plan;
    plan.textContent = amount < 0 || !load ? '' : `Suunnitelmassa: ${load.fixed + amount * load.perStep} ${load.unit}.`;
  }
  function draw() {
    steps = (task.methods[method.get()]?.steps ?? []).map(step => entry(step.label, step.unit));
    stepFields.replaceChildren(...steps.map(step => step.node));
    for (const step of steps) step.input.addEventListener('input', paintPlan);
    reason.set(-1);
    paintPlan();
  }
  method.input.addEventListener('change', draw);
  return {
    node: h('div', { style: card }, labeled('Työtapa', method.input), stepFields, plan, labeled('Miksi tapa sopii?', reason.input)),
    read: () => ({ kind: 'problem-workbench', mode: 'strategy', method: method.get(), steps: steps.map(step => step.get()), reason: reason.get() }),
    show(answer) { method.set(answer.method); draw(); steps.forEach((step, i) => step.set(answer.steps[i]!)); reason.set(answer.reason); paintPlan(); },
  };
}

function estimateBoard(task: Task<'estimate'>): Board<'estimate'> {
  const range = indexed('Arvioalue', task.ranges.map(([lo, hi]) => `${lo}–${hi} ${task.unit}`));
  const comparison = select('Ehdotus verrattuna arvioon', [['short', 'Alle arvion'], ['fits', 'Arvion sisällä'], ['surplus', 'Yli arvion']] as const);
  const proposal = h('div', { 'data-problem-estimate-proposal': '', hidden: true });
  function showProposal() {
    proposal.replaceChildren(h('div', { style: card },
      h('strong', {}, `Loikan ehdotus: ${task.proposed} ${task.unit}`),
      labeled('Mihin ehdotus osuu?', comparison.input)));
    proposal.hidden = false;
  }
  let committed = -1;
  const commit = action('Aseta arvioalue', () => {
    if (committed >= 0) {
      committed = -1;
      proposal.hidden = true;
      proposal.replaceChildren();
      comparison.set(null);
      range.input.disabled = false;
      commit.textContent = 'Aseta arvioalue';
      range.input.focus();
    } else if (range.get() >= 0) {
      committed = range.get();
      range.input.disabled = true;
      showProposal();
      commit.textContent = 'Muuta arvioaluetta';
      comparison.input.focus();
    }
  });
  commit.disabled = true;
  range.input.addEventListener('change', () => { commit.disabled = range.get() < 0; });
  return {
    node: h('div', { style: grid }, h('div', { style: card }, h('strong', {}, task.anchors), labeled('Arvioalue', range.input), commit), proposal),
    read: () => ({ kind: 'problem-workbench', mode: 'estimate', range: committed, comparison: comparison.get() }),
    show(answer) {
      range.set(answer.range); committed = answer.range; showProposal(); comparison.set(answer.comparison);
    },
  };
}

function repairBoard(task: Task<'repair'>): Board<'repair'> {
  const step = indexed('Ensimmäinen katkennut vaihe', task.chain.map((_line, i) => `Vaihe ${i + 1}`));
  const sign = select('Korjattu laskutoimitus', [['+', '+'], ['−', '−'], ['×', '×'], ['÷', '÷']] as const);
  const value = entry('Tulos', task.unit);
  const path = task.chain.map(line => h('li', {}, line));
  function markStep() {
    path.forEach((line, index) => {
      const selected = step.get() === index;
      line.style.background = selected ? '#f6e8c9' : '';
      if (selected) line.setAttribute('aria-current', 'step');
      else line.removeAttribute('aria-current');
    });
  }
  step.input.addEventListener('change', markStep);
  return {
    node: h('div', { style: card }, h('ol', { style: 'padding-left:23px;margin:0' }, ...path),
      labeled('Ensimmäinen katkennut vaihe', step.input),
      h('div', { style: row }, h('strong', {}, `Korjaus: ${task.left}`), sign.input, h('strong', {}, `${task.right} =`), value.node)),
    read: () => ({ kind: 'problem-workbench', mode: 'repair', step: step.get(), sign: sign.get(), value: value.get() }),
    show(answer) { step.set(answer.step); markStep(); sign.set(answer.sign); value.set(answer.value); },
  };
}

function representBoard(task: Task<'represent'>): Board<'represent'> {
  const groups = task.parts.map((_part, i) => {
    const group = `Mallin osa ${i + 1}`;
    const label = indexed(group, task.parts.map(part => part.label));
    const marks = markCounter(group, task.medium);
    return { label, marks, node: h('div', { 'data-problem-group': '', style: card }, labeled(group, label.input), marks.node) };
  });
  return {
    node: h('div', { style: grid }, ...groups.map(group => group.node)),
    read: () => ({ kind: 'problem-workbench', mode: 'represent',
      groups: groups.map(({ label, marks }) => ({ part: label.get(), marks: marks.get() })) }),
    show(answer) {
      groups.forEach(({ label, marks }, i) => { label.set(answer.groups[i]!.part); marks.set(answer.groups[i]!.marks); });
    },
  };
}

export function mountProblemWorkbench(
  task: ProblemWorkbenchTask, host: HTMLElement, submit: (response: ProblemWorkbenchResponse) => void,
): { reveal(): void } {
  const mount = <M extends Mode>(board: Board<M>) => {
    const done = h('button', { type: 'submit', class: 'btn primary wide' }, 'Tarkista työpöytä');
    const form = h('form', { 'data-problem-workbench': task.mode, style: grid }, board.node, done);
    let locked = false;
    function lock() {
      locked = true;
      for (const control of form.querySelectorAll('input,select,button')) control.setAttribute('disabled', '');
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (locked) return;
      const answer = board.read();
      lock();
      submit(answer);
    });
    host.append(form);
    return { reveal() { board.show(solutionProblemWorkbench(task) as Answer<M>); lock(); } };
  };
  switch (task.mode) {
    case 'sort': return mount(sortBoard(task));
    case 'trial': return mount(trialBoard(task));
    case 'strategy': return mount(strategyBoard(task));
    case 'estimate': return mount(estimateBoard(task));
    case 'repair': return mount(repairBoard(task));
    case 'represent': return mount(representBoard(task));
  }
}

/** Demonstrations show the assembled workbench without submitting an attempt. */
export function problemWorkbenchExample(task: ProblemWorkbenchTask): Paint {
  return host => {
    const givens = h('div');
    const example = h('div');
    problemWorkbenchBoard(task)(givens);
    mountProblemWorkbench(task, example, () => {}).reveal();
    example.querySelector('button[type="submit"]')?.remove();
    host.replaceChildren(givens, example);
  };
}
