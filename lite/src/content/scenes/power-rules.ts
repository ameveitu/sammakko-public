import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { applyPowerStep, checkPowerRule, expressionLabel, focused, powerLabel, requiredPowerActions, solutionPowerRule, type FactorTree, type PowerRuleTask, type PowerRuleResponse } from '../models/power-rules';

const grid = 'display:grid;gap:5px';
const row = 'display:flex;flex-wrap:wrap;gap:5px 8px;align-items:center';
const plate = `${grid};background:#eaf2e9;border:1px solid #adc6b9;border-radius:9px;padding:6px 8px`;
const field = 'min-height:38px;box-sizing:border-box;border:1px solid #8aa89a;border-radius:8px;background:#fffef7;color:#163d3a;padding:4px 7px;max-width:100%;font:inherit';
const caption = (text: string) => h('strong', {}, text);
const live = (key: string) => h('p', { 'data-power-display': key, 'aria-live': 'polite', style: 'margin:0;font-weight:700' });
const button = (text: string, onclick: () => void, label?: string) => h('button', {
  type: 'button', class: 'btn small', style: 'min-height:38px', onclick, 'aria-label': label,
}, text);
const integer = (value: string) => /^[+−-]?\d{1,8}$/.test(value.trim()) ? Number(value.trim().replace('−', '-')) : null;

function equalGrids(task: PowerRuleTask): HTMLElement | null {
  if (task.mode !== 'expansion' || task.view !== 'grid') return null;
  const size = Number(task.base), layers = task.exponent === 2 ? 1 : size;
  return h('div', { 'aria-hidden': 'true', 'data-power-grid-model': '', style: row },
    ...Array.from({ length: layers }, () => h('div', { style: `display:grid;grid-template-columns:repeat(${size},8px);gap:2px;padding:3px;border:1px solid #91a99a;border-radius:3px` },
      ...Array.from({ length: size * size }, () => h('i', { style: 'width:8px;height:8px;background:#74a89a;border:1px solid #547f73' })))));
}

export const powerNotationContrast: Paint = host => {
  const examples = [[2, 3], [3, 2]].map(([base, exponent]) => {
    const factors = Array.from({ length: exponent! }, () => base).join(' × ');
    return h('div', { style: `${plate};flex:1 1 130px` },
      h('strong', { style: 'font-size:20px' }, powerLabel(String(base), exponent!)),
      h('span', {}, `Kanta ${base}, eksponentti ${exponent}`),
      h('strong', {}, `${factors} = ${base! ** exponent!}`));
  });
  host.replaceChildren(h('div', { 'data-power-role-contrast': '', style: row }, ...examples));
};

export function powerRuleBoard(task: PowerRuleTask): Paint {
  return host => host.replaceChildren(h('div', { 'data-power-givens': '', style: grid },
    h('p', { class: 'small', style: 'margin:0' }, caption('Tuttu rakenne. '), task.context.title),
    h('dl', { style: 'margin:0;display:grid;gap:2px 10px;grid-template-columns:auto minmax(0,1fr)' },
      ...task.givens.flatMap(({ label, value }) => [h('dt', { style: 'font-weight:700' }, label), h('dd', { style: 'margin:0;font-size:14px' }, value)])), equalGrids(task)));
}

function entry(label: string, width = 74, inputmode = 'text') {
  const input = h('input', { type: 'text', inputmode, autocomplete: 'off', 'aria-label': label, style: `${field};width:${width}px;text-align:center` });
  return {
    input, node: h('label', { style: row }, caption(label), input),
    get: () => input.value, int: () => integer(input.value),
    set(value: string | number | null) { input.value = value === null ? '' : String(value); },
  };
}

function pick<T extends string>(label: string, options: readonly (readonly [T, string])[]) {
  const input = h('select', { style: field, 'aria-label': label }, h('option', { value: '' }, 'Valitse'),
    ...options.map(([value, text]) => h('option', { value }, text)));
  return { input, node: h('label', { style: row }, caption(label), input), get: () => (input.value || null) as T | null,
    set(value: T | null) { input.value = value ?? ''; } };
}

type Mode = PowerRuleTask['mode'];
type Task<M extends Mode> = Extract<PowerRuleTask, { mode: M }>;
type Answer<M extends Mode> = Extract<PowerRuleResponse, { mode: M }>;
type Board<M extends Mode> = { node: HTMLElement; read(): Answer<M>; show(answer: Answer<M>): void };

function divisionBoard(task: Task<'division'>): Board<'division'> {
  const quotient = entry('Kokonaisosamäärä'), remainder = entry('Jakojäännös');
  const divisible = pick('Onko luku jaollinen?', [['yes', 'Kyllä'], ['no', 'Ei']] as const);
  const equation = live('division');
  const marks = h('div', { 'aria-hidden': 'true', style: 'display:flex;flex-wrap:wrap;gap:4px;align-items:center' });
  function paint() {
    const q = quotient.int(), r = remainder.int();
    equation.textContent = `${task.dividend} = (${task.divisor}) × (${q ?? '?'}) + ${r ?? '?'}`.replaceAll('-', '−');
    const groups = task.divisor > 0 && q !== null && q > 0 && q <= 10 ? q : 0;
    const extras = r !== null && r >= 0 && r <= 12 ? r : 0;
    marks.replaceChildren(...Array.from({ length: groups }, () => h('span', { style: 'padding:0 3px;border:1px solid #91aa9b;border-radius:5px;color:#32685c' },
      '●'.repeat(Math.min(task.divisor, 8)))), h('span', { style: 'color:#986326' }, '●'.repeat(extras)));
  }
  quotient.input.addEventListener('input', paint);
  remainder.input.addEventListener('input', paint);
  paint();
  return {
    node: h('div', { style: plate }, equation, marks, h('div', { style: row }, quotient.node, remainder.node), divisible.node),
    read() {
      const chosen = divisible.get();
      return { kind: 'power-rules', mode: 'division', quotient: quotient.int() ?? NaN, remainder: remainder.int() ?? NaN,
        divisible: chosen === null ? null : chosen === 'yes' };
    },
    show(answer) { quotient.set(answer.quotient); remainder.set(answer.remainder); divisible.set(answer.divisible ? 'yes' : 'no'); paint(); },
  };
}

function primeBoard(task: Task<'prime'>): Board<'prime'> {
  const controls = task.numbers.map(n => {
    const cls = pick(`Luku ${n}`, [['prime', 'Alkuluku'], ['composite', 'Yhdistetty'], ['one', 'Ei kumpikaan']] as const);
    const divisor = entry(`Luvun ${n} jakaja`, 57, 'numeric');
    const divisorCount = entry('Luvun 1 positiivisia jakajia', 52, 'numeric');
    const product = live(`prime-${n}`);
    const line = h('div', { style: row }, divisor.node, product);
    const extra = h('div', { hidden: true }, line);
    function paint() {
      extra.hidden = cls.get() !== 'composite';
      const d = divisor.int();
      product.textContent = d && d > 1 && n % d === 0 ? `${d} × ${n / d} = ${n}` : '';
    }
    cls.input.addEventListener('change', paint);
    divisor.input.addEventListener('input', paint);
    return { cls, divisor, divisorCount, paint, node: h('div', { style: plate }, cls.node, extra, n === 1 ? divisorCount.node : null) };
  });
  return {
    node: h('div', { style: grid }, ...controls.map(item => item.node)),
    read: () => ({ kind: 'power-rules', mode: 'prime', rows: controls.map(({ cls, divisor, divisorCount }) => ({
      classification: cls.get(), divisor: cls.get() === 'composite' ? divisor.int() : null, divisorCount: divisorCount.int(),
    })) }),
    show(answer) { controls.forEach(({ cls, divisor, divisorCount, paint }, i) => { cls.set(answer.rows[i]!.classification); divisor.set(answer.rows[i]!.divisor); divisorCount.set(answer.rows[i]!.divisorCount); paint(); }); },
  };
}

function changeBranch(tree: FactorTree, path: readonly (0 | 1)[], children?: FactorTree['children']): FactorTree {
  const [head, ...tail] = path;
  if (head === undefined) return children ? { value: tree.value, children } : { value: tree.value };
  if (!tree.children) return tree;
  const pair: [FactorTree, FactorTree] = [...tree.children];
  pair[head] = changeBranch(pair[head], tail, children);
  return { value: tree.value, children: pair };
}

function treeBoard(task: Task<'factor-tree'>): Board<'factor-tree'> {
  const seed: FactorTree = task.givenPair ? { value: task.number, children: task.givenPair.map(value => ({ value })) as [FactorTree, FactorTree] }
    : { value: task.number };
  let tree = seed;
  let chosen: { path: readonly (0 | 1)[]; value: number } | undefined;
  let locked = false;
  const drawing = h('div', { 'data-power-tree': '', style: 'display:flex;justify-content:center;text-align:center;overflow-wrap:anywhere' });
  const leaves = live('leaves');
  const first = entry('Ensimmäinen tekijä', 55, 'numeric'), second = entry('Toinen tekijä', 55, 'numeric'), product = entry('Lehtien tulo', 72, 'numeric');
  const message = live('tree-status');
  const split = button('Hajota haara', () => {
    const a = first.int(), b = second.int();
    if (!chosen || a === null || b === null || a <= 1 || b <= 1 || a >= chosen.value || b >= chosen.value || BigInt(a) * BigInt(b) !== BigInt(chosen.value)) {
      message.textContent = 'Kirjoita kaksi yhtä suurempaa tekijää, joiden tulo on valittu luku.';
      return;
    }
    tree = changeBranch(tree, chosen.path, [{ value: a }, { value: b }]);
    chosen = undefined; message.textContent = ''; paint();
  });
  const reset = button('Aloita puu uudelleen', () => { tree = seed; chosen = undefined; message.textContent = ''; paint(); });
  const editor = h('div', { hidden: true }, h('div', { style: row }, first.node, second.node, split));
  function paint() {
    const ends: number[] = [];
    const render = (node: FactorTree, path: readonly (0 | 1)[]): HTMLElement => {
      if (!node.children) ends.push(node.value);
      const tag = node.children || locked ? h('strong', { style: 'display:inline-block;padding:2px 6px;color:#244f4a' }, node.value)
        : button(String(node.value), () => {
          chosen = { path, value: node.value };
          editor.hidden = false;
          message.textContent = `Hajotetaan ${node.value}.`;
          first.set(''); second.set(''); first.input.focus();
        }, `Valitse haara ${node.value}`);
      return h('div', { style: 'flex:1;min-width:0;padding:0 1px' }, tag, node.children ? h('div', {
        style: 'display:flex;align-items:start;border-top:1px solid #8da998;margin-top:2px;padding-top:3px',
      }, render(node.children[0], [...path, 0]), render(node.children[1], [...path, 1])) : null);
    };
    drawing.replaceChildren(render(tree, []));
    editor.hidden = !chosen || locked;
    leaves.textContent = `Lehdet: ${ends.join(' × ')}`;
  }
  for (const input of [first.input, second.input]) input.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); split.click(); }
  });
  paint();
  return {
    node: h('div', { style: plate }, drawing, editor, message, leaves, h('div', { style: row }, product.node, reset)),
    read: () => ({ kind: 'power-rules', mode: 'factor-tree', tree, product: product.int() ?? NaN }),
    show(answer) { locked = true; chosen = undefined; tree = answer.tree; product.set(answer.product); message.textContent = ''; paint(); },
  };
}

const relations = [['less', 'Pienempi'], ['equal', 'Yhtä suuri'], ['greater', 'Suurempi']] as const;
const restrictions = [['any', 'Myös nollakanta käy'], ['nonzero', 'Kanta ei saa olla nolla']] as const;

function expansionBoard(task: Task<'expansion'>): Board<'expansion'> {
  const base = entry('Kanta'), exponent = entry('Eksponentti', 57, 'numeric'), value = entry('Arvo', 80);
  const other = task.compareExponent === undefined ? '' : (task.compareOutsideMinus ? '−' : '') + powerLabel(task.compareBase ?? task.base, task.compareExponent);
  const compare = pick(`Arvo verrattuna potenssiin ${other}`, relations);
  const display = live('factor-sequence');
  let factors: string[] = [];
  function paint() {
    display.textContent = factors.length ? (task.outsideMinus ? '−(' : '') + factors.map(n => /^[-−]|\//.test(n) ? `(${n})` : n).join(' × ')
      + (task.outsideMinus ? ')' : '') : 'Tekijäjono on tyhjä.';
  }
  const alternate = task.view === 'signed' ? (task.base.startsWith('-') ? task.base.slice(1) : '-' + task.base) : '1';
  const candidates = [...new Set([task.base, String(task.exponent), alternate])].sort((a, b) => Number(a) - Number(b));
  const tiles = candidates.map(candidate => button(candidate.replace('-', '−'), () => {
    if (factors.length < 12) { factors = [...factors, candidate]; paint(); }
  }, `Lisää tekijä ${candidate.replace('-', '−')}`));
  const undo = button('Poista viimeinen', () => { factors = factors.slice(0, -1); paint(); });
  paint();
  return {
    node: h('div', { style: plate }, task.identify ? h('div', { style: row }, base.node, exponent.node) : null, display,
      h('div', { style: row }, ...tiles, undo), value.node, other ? compare.node : null),
    read: () => ({ kind: 'power-rules', mode: 'expansion', base: base.get(), exponent: exponent.int() ?? NaN, factors,
      value: value.get(), comparison: compare.get() }),
    show(answer) { base.set(answer.base); exponent.set(answer.exponent); value.set(answer.value); compare.set(answer.comparison); factors = [...answer.factors]; paint(); },
  };
}

function tableBoard(task: Task<'exponent-table'>): Board<'exponent-table'> {
  const value = entry('Arvo'), divisor = entry('Jakaja');
  const base = entry('Nimittäjän kanta'), exponent = entry('Positiivinen eksponentti', 55, 'numeric');
  const other = entry(task.comparisonBase ? `Vertailun ${powerLabel(task.comparisonBase, task.exponent)} arvo` : 'Vertailuarvo');
  const condition = pick('Kannan ehto', restrictions);
  const comparison = pick('Oma arvo verrattuna yhteen', relations);
  const lamp = h('div', { hidden: true, 'data-power-zero-lamp': '' }, h('div', { style: row },
    h('span', { 'aria-hidden': 'true', style: 'width:17px;height:17px;border:2px solid #936629;background:#e9bf67;border-radius:50%' }),
    h('strong', {}, 'Nollakerroksessa on yksi valo.')));
  return {
    node: h('div', { style: plate }, task.exponent === 0 ? h('div', { style: row }, divisor.node, value.node)
      : h('div', { style: grid }, h('div', { style: row }, caption('1 ÷ (kanta ^ eksponentti)'), base.node, exponent.node),
        h('div', { style: row }, value.node, task.comparisonBase ? other.node : null), comparison.node), condition.node, task.exponent === 0 ? lamp : null),
    read: () => ({ kind: 'power-rules', mode: 'exponent-table', value: value.get(), divisor: divisor.get(), reciprocalBase: base.get(),
      positiveExponent: exponent.int() ?? NaN, otherValue: other.get(), restriction: condition.get(), comparison: comparison.get() }),
    show(answer) {
      value.set(answer.value); divisor.set(answer.divisor); base.set(answer.reciprocalBase);
      exponent.set(answer.positiveExponent); other.set(answer.otherValue); condition.set(answer.restriction); comparison.set(answer.comparison);
      lamp.hidden = task.exponent !== 0;
    },
  };
}

const rules = [['sum', 'Laske eksponentit yhteen'], ['difference', 'Vähennä eksponentit'], ['multiply', 'Kerro eksponentit'],
  ['keep', 'Pidä kannat erillään']] as const;

function manipulateRule(task: Task<'rewrite'>) {
  const { source, visual } = task;
  let actions = 0;
  const diagram = h('div', { 'data-power-rule-diagram': visual, 'aria-live': 'polite', style: grid });
  const clickName = visual === 'join' ? 'Liitä jonot' : visual === 'cancel' ? 'Supista pari' : 'Lisää ryhmä';
  const add = button(clickName, () => set(actions + 1));
  const undo = button('Peru viimeinen', () => set(actions - 1));
  function factorRow(base: string, count: number, crossed = 0) {
    return h('div', { style: row }, ...Array.from({ length: count }, (_, i) => h('span', {
      style: `border:1px solid #a8baad;border-radius:4px;padding:0 4px;${i < crossed ? 'text-decoration:line-through;color:#956137' : 'color:#24554c'}`,
      'aria-label': i < crossed ? `${base}, supistettu` : base,
    }, base)));
  }
  function set(value: number) {
    actions = Math.max(0, value);
    const max = visual === 'repeat' ? 6 : requiredPowerActions(task);
    add.disabled = actions >= max;
    undo.disabled = actions === 0;
    if (visual === 'repeat' && source.kind === 'nested') {
      diagram.replaceChildren(actions ? factorRow(powerLabel(source.inner.base, source.inner.exponent), actions)
        : h('span', {}, 'Ryhmiä ei vielä ole.'));
    } else if (source.kind !== 'nested' && source.kind !== 'power' && source.left.kind === 'power' && source.right.kind === 'power') {
      const { left, right } = source;
      diagram.replaceChildren(visual === 'join' && actions ? factorRow(left.base, left.exponent + right.exponent)
        : h('div', { style: grid }, factorRow(left.base, left.exponent, actions), factorRow(right.base, right.exponent, actions)));
      if (visual === 'cancel' && actions === left.exponent && right.exponent > actions) {
        const remaining = Array(right.exponent - actions).fill(right.base).join(' × ');
        diagram.append(h('p', { 'data-power-reciprocal-model': '', style: 'margin:0;font-weight:700' }, `Jäljelle jää 1 ÷ (${remaining}).`));
      }
    }
  }
  set(0);
  return { node: visual ? h('div', { style: plate }, diagram, h('div', { style: row }, add, undo)) : null, get: () => actions, set };
}

function rewriteBoard(task: Task<'rewrite'>): Board<'rewrite'> {
  const activity = manipulateRule(task);
  const finalBase = entry('Lopullinen kanta'), finalExponent = entry('Lopullinen eksponentti', 55, 'numeric');
  const sourceValue = entry('Tulon arvo'), proposedValue = entry('Ehdotuksen arvo');
  const condition = pick('Kannan ehto', restrictions);
  const stages = task.focuses.map((_focus, i) => {
    const rule = pick(`Vaihe ${i + 1}: sääntö`, rules);
    const exponent = entry(`Vaihe ${i + 1}: eksponentti`, 55);
    const part = live(`focus-${i + 1}`);
    const exponentSlot = h('div', {}, exponent.node);
    return { rule, exponent, part, exponentSlot, node: h('div', { style: plate }, part, h('div', { style: row }, rule.node, exponentSlot)) };
  });
  const trail = live('rewrite');
  function paint() {
    let current = task.source;
    let waiting = false;
    stages.forEach(({ rule, exponent, part, exponentSlot }, i) => {
      const chosen = rule.get(), value = exponent.int(), focus = task.focuses[i]!;
      part.textContent = waiting ? 'Täydennä edellinen vaihe.' : `Vaihe ${i + 1}. ${expressionLabel(focused(current, focus))}`;
      rule.input.disabled = waiting;
      exponent.input.disabled = waiting;
      exponentSlot.hidden = chosen === 'keep';
      if (!waiting && chosen && (chosen === 'keep' || value !== null)) {
        // A proposed exponent changes only the preview. The checker validates the actual rule and step.
        current = applyPowerStep(current, focus, chosen === 'keep' ? null : value);
        if (chosen === 'keep' && i + 1 < stages.length) waiting = true;
      } else waiting = true;
    });
    trail.textContent = waiting ? '' : `Työrivi: ${expressionLabel(current)}`;
  }
  for (const { rule, exponent } of stages) {
    rule.input.addEventListener('change', paint);
    exponent.input.addEventListener('input', paint);
  }
  paint();
  return {
    node: h('div', { style: grid }, activity.node, ...stages.map(stage => stage.node), trail,
      h('div', { style: plate }, task.counterexample ? h('div', { style: row }, sourceValue.node, proposedValue.node)
        : h('div', { style: row }, finalBase.node, finalExponent.node), condition.node)),
    read: () => ({ kind: 'power-rules', mode: 'rewrite', steps: stages.map(({ rule, exponent }) => ({
      rule: rule.get(), exponent: rule.get() === 'keep' ? null : exponent.int(),
    })), finalBase: finalBase.get(), finalExponent: finalExponent.int(), restriction: condition.get(), sourceValue: sourceValue.get(), proposedValue: proposedValue.get(), actions: activity.get() }),
    show(answer) {
      stages.forEach(({ rule, exponent }, i) => { rule.set(answer.steps[i]!.rule); exponent.set(answer.steps[i]!.exponent); });
      finalBase.set(answer.finalBase); finalExponent.set(answer.finalExponent); sourceValue.set(answer.sourceValue);
      proposedValue.set(answer.proposedValue); condition.set(answer.restriction); activity.set(answer.actions); paint();
    },
  };
}

export function mountPowerRule(task: PowerRuleTask, host: HTMLElement, submit: (response: PowerRuleResponse) => void): { reveal(): void } {
  const mount = <M extends Mode>(board: Board<M>) => {
    const done = h('button', { type: 'submit', class: 'btn primary wide' }, 'Tarkista tähtipaja');
    const form = h('form', { 'data-power-workbench': task.mode, style: grid }, board.node, done);
    let locked = false;
    function lock() { locked = true; for (const control of form.querySelectorAll('input,select,button')) control.setAttribute('disabled', ''); }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (locked) return;
      const answer = board.read();
      if (checkPowerRule(task, answer).ok) board.show(answer);
      lock();
      submit(answer);
    });
    host.append(form);
    return { reveal() { board.show(solutionPowerRule(task) as Answer<M>); lock(); } };
  };
  switch (task.mode) {
    case 'division': return mount(divisionBoard(task));
    case 'prime': return mount(primeBoard(task));
    case 'factor-tree': return mount(treeBoard(task));
    case 'expansion': return mount(expansionBoard(task));
    case 'exponent-table': return mount(tableBoard(task));
    case 'rewrite': return mount(rewriteBoard(task));
  }
}

export function powerRuleExample(task: PowerRuleTask): Paint {
  return host => {
    const givens = h('div'), model = h('div');
    powerRuleBoard(task)(givens);
    mountPowerRule(task, model, () => {}).reveal();
    model.querySelector('button[type="submit"]')?.remove();
    host.replaceChildren(givens, model);
  };
}
