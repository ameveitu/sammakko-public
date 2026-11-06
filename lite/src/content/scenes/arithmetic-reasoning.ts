import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { columnCount, huntBounds, ruleLabel, solutionArithmeticReasoning, substituted,
  type ArithmeticReasoningResponse, type ArithmeticReasoningTask, type Trace } from '../models/arithmetic-reasoning';

const grid = 'display:grid;gap:5px';
const row = 'display:flex;align-items:center;gap:4px 8px;flex-wrap:wrap';
const board = `${grid};background:#edf4e9;border:1px solid #afc5b9;border-radius:9px;padding:6px 8px`;
const field = 'min-height:44px;box-sizing:border-box;border:1px solid #8aa89a;border-radius:8px;padding:4px 6px;background:#fffef8;color:#193d3b;max-width:100%;font:inherit';
const title = (text: string) => h('strong', {}, text);
const line = (id: string) => h('p', { 'data-arithmetic-live': id, 'aria-live': 'polite', style: 'margin:0;font-weight:700' });
const button = (text: string, onclick: () => void, label?: string) => h('button', {
  type: 'button', class: 'btn small', style: 'min-width:44px;min-height:44px', onclick, 'aria-label': label,
}, text);
const int = (s: string) => /^[−+-]?\d{1,7}$/.test(s.trim()) ? Number(s.trim().replace('−', '-')) : NaN;
const comparison = [['below', 'Liian pieni'], ['fits', 'Sopii'], ['above', 'Liian suuri']] as const;

export function arithmeticBoard(task: ArithmeticReasoningTask): Paint {
  return host => host.replaceChildren(h('div', { 'data-arithmetic-givens': '', style: grid },
    h('p', { class: 'small', style: 'margin:0' }, title('Tuttu rakenne. '), task.context.title),
    h('dl', { style: 'display:grid;grid-template-columns:auto minmax(0,1fr);margin:0;gap:2px 9px' },
      ...task.givens.flatMap(({ label, value }) => [h('dt', { style: 'font-weight:700' }, label), h('dd', { style: 'margin:0;font-size:14px' }, value)]))));
}

function entry(label: string, width = 63) {
  const input = h('input', { type: 'text', autocomplete: 'off', 'aria-label': label, inputmode: 'decimal',
    style: `${field};width:${width}px;text-align:center` });
  return { input, node: h('label', { style: row }, title(label), input), get: () => int(input.value), set: (value: number) => { input.value = String(value); } };
}

function menu<T extends string>(label: string, options: readonly (readonly [T, string])[]) {
  const input = h('select', { 'aria-label': label, style: field }, h('option', { value: '' }, 'Valitse'),
    ...options.map(([value, text]) => h('option', { value }, text)));
  return { input, node: h('label', { style: row }, title(label), input), get: () => (input.value || null) as T | null,
    set: (value: T | null) => { input.value = value ?? ''; } };
}

function numbered(label: string, options: readonly string[], values?: readonly number[]) {
  const select = menu(label, options.map((text, i) => [String(values?.[i] ?? i), text] as const));
  return { ...select, get: () => Number(select.get() ?? NaN), set: (value: number) => select.set(String(value)) };
}

type Mode = ArithmeticReasoningTask['mode'];
type Task<M extends Mode> = Extract<ArithmeticReasoningTask, { mode: M }>;
type Answer<M extends Mode> = Extract<ArithmeticReasoningResponse, { mode: M }>;
type Board<M extends Mode> = { node: HTMLElement; read(): Answer<M>; show(answer: Answer<M>): void };

function seatGrid(rows: number, columns: number, cell: (r: number, c: number) => HTMLElement, width: number) {
  return h('div', { style: `display:grid;grid-template-columns:repeat(${columns},${width}px);grid-auto-rows:${width}px;gap:2px;justify-content:center` },
    ...Array.from({ length: rows * columns }, (_, i) => cell(Math.floor(i / columns) + 1, i % columns + 1)));
}

function splitBoard(task: Task<'split'>): Board<'split'> {
  const length = task.axis === 'rows' ? task.rows : task.columns;
  const cross = task.axis === 'rows' ? task.columns : task.rows;
  const cut = numbered('Jakokohta', Array.from({ length: length - 1 }, (_, i) => `Ensimmäisessä osassa ${i + 1}`),
    Array.from({ length: length - 1 }, (_, i) => i + 1));
  const first = entry('Osa 1'), second = entry('Osa 2'), total = entry('Yhteensä');
  const drawing = h('div', { 'data-arithmetic-split': '' });
  const relation = line('split-expression');
  function paint() {
    const n = cut.get();
    drawing.replaceChildren(seatGrid(task.rows, task.columns, (r, c) => h('span', {
      'data-seat': `${r}-${c}`, style: `border:1px solid #4e7267;border-radius:3px;background:${(task.axis === 'rows' ? r : c) <= n ? '#e2b777' : '#8ab9a5'}`,
    }), 16));
    relation.textContent = Number.isFinite(n) ? task.axis === 'columns'
      ? `${task.rows} × (${n} + ${length - n}) = ${task.rows} × ${n} + ${task.rows} × ${length - n}`
      : `(${n} + ${length - n}) × ${cross} = ${n} × ${cross} + ${length - n} × ${cross}` : 'Valitse jakokohta.';
  }
  cut.input.addEventListener('change', paint);
  paint();
  return {
    node: h('div', { style: board }, drawing, cut.node, relation, h('div', { style: row }, first.node, second.node, total.node)),
    read: () => ({ kind: 'arithmetic-reasoning', mode: 'split', cut: cut.get(), first: first.get(), second: second.get(), total: total.get() }),
    show(a) { cut.set(a.cut); first.set(a.first); second.set(a.second); total.set(a.total); paint(); },
  };
}

function groupBoard(task: Task<'group'>): Board<'group'> {
  const seen = new Set<number>();
  const view = h('div', { 'data-arithmetic-group': '', style: row });
  const l = entry('Vasemmat sulut'), r = entry('Oikeat sulut'), lTotal = entry('Vasemmalta yhteensä'), rTotal = entry('Oikealta yhteensä');
  const leftButton = button('Avaa vasen ryhmittely', () => paint(0));
  const rightButton = button('Avaa oikea ryhmittely', () => paint(1));
  function paint(side: number) {
    seen.add(side);
    leftButton.setAttribute('aria-pressed', String(side === 0));
    rightButton.setAttribute('aria-pressed', String(side === 1));
    const cells = Array.from({ length: task.a * task.b * task.c }, (_, i) => h('span', {
      'data-item': i + 1, 'aria-hidden': 'true', style: 'width:7px;height:7px;background:#437d6d;border-radius:1px',
    }));
    const small = Array.from({ length: task.a * task.b }, (_, i) => h('span', {
      'data-arithmetic-inner-group': '', style: 'display:flex;gap:2px;padding:2px;border:1px solid #81a49a;border-radius:4px',
    }, ...cells.slice(i * task.c, (i + 1) * task.c)));
    const groups = side === 0 ? small : Array.from({ length: task.a }, (_, i) => h('span', {
      'data-arithmetic-outer-group': '', style: 'display:flex;flex-wrap:wrap;gap:3px;padding:3px;border:2px solid #567b70;border-radius:6px',
    }, ...small.slice(i * task.b, (i + 1) * task.b)));
    view.replaceChildren(title(side === 0 ? `(${task.a} × ${task.b}) × ${task.c}` : `${task.a} × (${task.b} × ${task.c})`), ...groups);
  }
  return {
    node: h('div', { style: board }, h('div', { style: row }, leftButton, rightButton), view,
      h('div', { style: row }, l.node, lTotal.node), h('div', { style: row }, r.node, rTotal.node)),
    read: () => ({ kind: 'arithmetic-reasoning', mode: 'group', seen: [...seen], leftInner: l.get(), rightInner: r.get(), leftTotal: lTotal.get(), rightTotal: rTotal.get() }),
    show(a) { a.seen.forEach(paint); l.set(a.leftInner); r.set(a.rightInner); lTotal.set(a.leftTotal); rTotal.set(a.rightTotal); },
  };
}

function rotateBoard(task: Task<'rotate'>): Board<'rotate'> {
  const r = entry('Rivejä alussa', 44), c = entry('Sarakkeita alussa', 44), r2 = entry('Rivejä lopussa', 44), c2 = entry('Sarakkeita lopussa', 44);
  const rowInput = entry(task.inverse ? 'Istuimen alkurivi' : 'Istuimen rivi', 44);
  const columnInput = entry(task.inverse ? 'Istuimen alkusarake' : 'Istuimen sarake', 44);
  const drawing = h('div', { 'data-arithmetic-rotate': '' });
  const products = line('rotation-products');
  let turned = false, locked = false;
  const turnedButton = button(task.clockwise ? 'Käännä myötäpäivään' : 'Käännä vastapäivään', () => {
    turned = !turned; rowInput.input.value = ''; columnInput.input.value = ''; paint();
  });
  function mark(r: number, c: number) {
    rowInput.set(r); columnInput.set(c); paint();
  }
  function paint() {
    turnedButton.textContent = turned ? 'Palaa alkuasentoon' : task.clockwise ? 'Käännä myötäpäivään' : 'Käännä vastapäivään';
    const values = [r.get(), c.get(), r2.get(), c2.get()];
    products.textContent = values.every(Number.isFinite) ? `${values[0]} × ${values[1]} ↔ ${values[2]} × ${values[3]}` : '';
    if (task.abstract) {
      drawing.textContent = turned ? 'Rivit ja sarakkeet vaihtoivat paikkaa. Kirjoita uuden suunnan merkinnät.' : '';
      return;
    }
    const original = (r: number, c: number) => turned ? task.clockwise ? { row: task.rows + 1 - c, column: r }
      : { row: c, column: task.columns + 1 - r } : { row: r, column: c };
    drawing.replaceChildren(seatGrid(turned ? task.columns : task.rows, turned ? task.rows : task.columns, (r, c) => {
      const id = original(r, c);
      const tracked = id.row === task.focus.row && id.column === task.focus.column;
      const active = task.inverse ? (turned ? tracked : rowInput.get() === r && columnInput.get() === c)
        : turned ? rowInput.get() === r && columnInput.get() === c : tracked;
      const style = `border:1px solid #4e7566;border-radius:4px;background:${active ? '#e6b365' : '#afd0bb'};color:#274c43`;
      return turned && !locked && !task.inverse ? h('button', { type: 'button', 'data-seat': `${id.row}-${id.column}`, style, onclick: () => mark(r, c),
        'aria-label': `Rivi ${r}, sarake ${c}`, 'aria-pressed': String(active) }, active ? '●' : '·')
        : h('span', { 'data-seat': `${id.row}-${id.column}`, 'aria-hidden': 'true', style }, active ? '●' : '');
    }, turned && !locked && !task.inverse ? 44 : 17));
  }
  for (const i of [r.input, c.input, r2.input, c2.input, rowInput.input, columnInput.input]) i.addEventListener('input', paint);
  paint();
  return {
    node: h('div', { style: board }, turnedButton,
      h('div', { style: 'display:flex;gap:6px 10px;align-items:start;flex-wrap:wrap' }, drawing,
        h('div', { style: `${grid};flex:1 1 210px;min-width:0` },
          h('div', { style: row }, r.node, c.node), h('div', { style: row }, r2.node, c2.node),
          h('div', { style: row }, rowInput.node, columnInput.node), products))),
    read: () => ({ kind: 'arithmetic-reasoning', mode: 'rotate', turned,
      before: { row: r.get(), column: c.get() }, after: { row: r2.get(), column: c2.get() }, landed: { row: rowInput.get(), column: columnInput.get() } }),
    show(a) { turned = a.turned; locked = true; r.set(a.before.row); c.set(a.before.column); r2.set(a.after.row); c2.set(a.after.column); mark(a.landed.row, a.landed.column); },
  };
}

function relationBoard(task: Task<'relation'>): Board<'relation'> {
  const divisor = entry('Jakaja'), multiple = entry('Monikerta'), groups = entry('Ryhmiä');
  const diagram = line('divisor-relation');
  const bundles = h('div', { 'aria-hidden': 'true', style: row });
  function paint() {
    const d = divisor.get(), n = groups.get(), all = multiple.get();
    const use = (value: number) => Number.isNaN(value) ? '?' : String(value);
    diagram.textContent = `${use(d)} × ${use(n)} = ${use(all)}`;
    if (task.view !== 'symbol') {
      const size = task.view === 'array' ? task.divisor : Number.isSafeInteger(d) && d > 0 && d <= 10 ? d : 0;
      const count = task.view === 'array' ? task.multiple / task.divisor : Number.isSafeInteger(n) && n >= 0 && n <= 8 ? n : 0;
      bundles.replaceChildren(...Array.from({ length: count }, () => h('span', { style: 'padding:1px 4px;border:1px solid #93afa1;border-radius:4px' }, '▮'.repeat(size))));
    }
  }
  for (const i of [divisor.input, multiple.input, groups.input]) i.addEventListener('input', paint);
  paint();
  return {
    node: h('div', { style: board }, bundles, h('div', { style: row }, divisor.node, multiple.node, groups.node), diagram),
    read: () => ({ kind: 'arithmetic-reasoning', mode: 'relation', divisor: divisor.get(), multiple: multiple.get(), groups: groups.get() }),
    show(a) { divisor.set(a.divisor); multiple.set(a.multiple); groups.set(a.groups); paint(); },
  };
}

function membershipBoard(task: Task<'membership'>): Board<'membership'> {
  const names = task.rules.map(rule => rule.relation === 'multiple' ? `Luvun ${rule.of} monikerta` : `Luvun ${rule.of} jakaja`);
  const columns = 'display:grid;grid-template-columns:34px repeat(3,minmax(44px,1fr));gap:4px;align-items:center;text-align:center';
  const header = h('div', { style: `${columns};font-size:13px;font-weight:700` }, h('span', {}, 'Luku'),
    ...names.map(name => h('span', {}, name)), h('span', {}, 'Ei kumpaankaan'));
  const rows = task.numbers.map(n => {
    const selected = new Set<number>();
    const options = [...names.map((label, i) => ({ label, id: i })), { label: 'Ei kumpaankaan', id: -1 }];
    const toggles = options.map(({ label, id }) => button('○', () => {
      if (selected.has(id)) selected.delete(id);
      else {
        if (id === -1) selected.clear();
        else selected.delete(-1);
        selected.add(id);
      }
      paint();
    }, `${n}: ${label}`));
    function paint() {
      toggles.forEach((toggle, i) => {
        const active = selected.has(options[i]!.id);
        toggle.setAttribute('aria-pressed', String(active));
        toggle.style.background = active ? '#a6ceb4' : '';
        toggle.textContent = active ? '✓' : '○';
      });
    }
    paint();
    return { selected, paint, node: h('div', { style: columns }, h('strong', {}, n), ...toggles) };
  });
  return {
    node: h('div', { style: board }, header, ...rows.map(row => row.node)),
    read: () => ({ kind: 'arithmetic-reasoning', mode: 'membership', memberships: rows.map(row => [...row.selected]) }),
    show(a) { rows.forEach(({ selected, paint }, i) => { selected.clear(); a.memberships[i]!.forEach(id => selected.add(id)); paint(); }); },
  };
}

function roundBoard(task: Task<'round'>): Board<'round'> {
  const lower = entry('Pienempi raja'), upper = entry('Suurempi raja'), rounded = entry('Lähin rajaluku');
  const model = h('div', { 'data-arithmetic-live': 'round-line' });
  function paint() {
    const low = lower.get(), high = upper.get();
    const valid = low < high && low <= task.value && high >= task.value;
    const label = (n: number) => Number.isNaN(n) ? '?' : String(n);
    const track = h('div', { style: 'position:relative;border-top:2px solid #4d7e71;height:7px;margin:5px 8px' },
      valid ? h('span', { style: `position:absolute;left:${100 * (task.value - low) / (high - low)}%;top:-7px;transform:translateX(-50%);width:12px;height:12px;background:#c98d42;border:2px solid #835b37;border-radius:50%` }) : null);
    model.replaceChildren(h('p', { style: 'margin:0;text-align:center;font-weight:700' }, task.value),
      track, h('div', { style: 'display:flex;justify-content:space-between' }, label(low), label(high)));
  }
  for (const i of [lower.input, upper.input]) i.addEventListener('input', paint);
  paint();
  const digits = [...String(task.value)];
  const targetIndex = digits.length - String(task.unit).length;
  const place = task.view === 'place' ? h('div', { 'aria-label': 'Lukuyksikkölaatikot', style: row },
    ...digits.map((digit, index) => h('span', { style: `min-width:28px;text-align:center;border:1px solid #7ba395;border-radius:5px;padding:3px;background:${index === targetIndex ? '#efd2a1' : '#f7fbf1'}` }, digit))) : null;
  return {
    node: h('div', { style: board }, place, task.view !== 'symbol' ? model : null, h('div', { style: row }, lower.node, upper.node), rounded.node),
    read: () => ({ kind: 'arithmetic-reasoning', mode: 'round', lower: lower.get(), upper: upper.get(), rounded: rounded.get() }),
    show(a) { lower.set(a.lower); upper.set(a.upper); rounded.set(a.rounded); paint(); },
  };
}

function estimateBoard(task: Task<'estimate'>): Board<'estimate'> {
  const precision = numbered('Pyöristä lähimpään', task.units.map(String), task.units);
  const first = entry('Ensimmäinen likiarvo'), second = entry('Toinen likiarvo'), amount = entry('Arvio');
  const symbol = menu('Merkki alkuperäiseen laskuun', [['≈', '≈ (noin)'], ['=', '= (täsmälleen)']] as const);
  return {
    node: h('div', { style: board }, precision.node, h('div', { style: row }, first.node, title(task.operation), second.node),
      h('div', { style: row }, symbol.node, amount.node)),
    read: () => ({ kind: 'arithmetic-reasoning', mode: 'estimate', unit: precision.get(), first: first.get(), second: second.get(), estimate: amount.get(), symbol: symbol.get() }),
    show(a) { precision.set(a.unit); first.set(a.first); second.set(a.second); amount.set(a.estimate); symbol.set(a.symbol); },
  };
}

function auditBoard(): Board<'audit'> {
  const lower = entry('Arvion alaraja'), upper = entry('Arvion yläraja');
  const finding = menu('Ehdotus suhteessa arvioon', [['below', 'Alle arvion'], ['fits', 'Arvion sisällä'], ['above', 'Yli arvion']] as const);
  return {
    node: h('div', { style: board }, h('div', { style: row }, lower.node, upper.node), finding.node),
    read: () => ({ kind: 'arithmetic-reasoning', mode: 'audit', lower: lower.get(), upper: upper.get(), finding: finding.get() }),
    show(a) { lower.set(a.lower); upper.set(a.upper); finding.set(a.finding); },
  };
}

function strategyBoard(task: Task<'strategy'>): Board<'strategy'> {
  const method = menu('Oma laskutapa', [['partition', 'Jaa toinen luku osiin'], ['adjust', 'Käytä tasakymppiä ja korjaa'],
    ['columns', 'Laske sarakkeittain']] as const);
  const first = entry('Osa 1'), second = entry('Osa 2'), anchor = entry('Tasakymppi'), correction = entry('Korjaus'), intermediate = entry('Välitulos'), total = entry('Tarkka tulos');
  const details = h('div', { style: grid });
  const places = ['Ykköset', 'Kymmenet', 'Sadat', 'Tuhannet'];
  const columns = Array.from({ length: columnCount(task.a, task.b) }, (_, i) => ({
    digit: entry(`${places[i]}: numero`, 44),
    exchange: numbered(`${places[i]}: vaihto`, ['0', '1']),
    values: `${String(task.a).at(-1 - i) ?? '0'} ${task.operation} ${String(task.b).at(-1 - i) ?? '0'}`,
  }));
  function paint() {
    const choice = method.get();
    if (choice === 'columns') {
      const all = columns.map(({ digit, exchange, values }) => h('div', { style: row }, title(values), digit.node, exchange.node));
      details.replaceChildren(h('small', {}, task.operation === '+' ? 'Vaihto tarkoittaa siirtoa seuraavaan sarakkeeseen.'
        : 'Vaihto tarkoittaa lainausta seuraavasta sarakkeesta.'), ...all);
    } else if (choice === 'partition') details.replaceChildren(h('div', { style: row }, first.node, second.node, intermediate.node));
    else if (choice === 'adjust') details.replaceChildren(h('div', { style: row }, anchor.node, correction.node, intermediate.node));
    else details.replaceChildren();
  }
  method.input.addEventListener('change', paint);
  const read = (): Trace | null => {
    const selected = method.get();
    if (selected === 'partition') return { method: selected, first: first.get(), second: second.get(), intermediate: intermediate.get() };
    if (selected === 'adjust') return { method: selected, anchor: anchor.get(), correction: correction.get(), intermediate: intermediate.get() };
    if (selected === 'columns') return { method: selected, digits: columns.map(c => c.digit.get()), exchanges: columns.map(c => c.exchange.get()) };
    return null;
  };
  return {
    node: h('div', { style: board }, method.node, details, total.node),
    read: () => ({ kind: 'arithmetic-reasoning', mode: 'strategy', trace: read(), total: total.get() }),
    show(a) {
      const trace = a.trace;
      method.set(trace?.method ?? null);
      if (trace?.method === 'partition') { first.set(trace.first); second.set(trace.second); intermediate.set(trace.intermediate); }
      if (trace?.method === 'adjust') { anchor.set(trace.anchor); correction.set(trace.correction); intermediate.set(trace.intermediate); }
      if (trace?.method === 'columns') columns.forEach(({ digit, exchange }, i) => { digit.set(trace.digits[i]!); exchange.set(trace.exchanges[i]!); });
      total.set(a.total); paint();
    },
  };
}

function sequenceBoard(task: Task<'sequence'>): Board<'sequence'> {
  const rule = numbered('Näkyvään alkuun sopiva sääntö', task.rules.map(ruleLabel));
  const slots = Array.from({ length: task.count }, (_, i) => entry(`Uusi luku ${i + 1}`));
  return {
    node: h('div', { style: board }, task.recognize ? rule.node : null, h('div', { style: row }, ...slots.map(slot => slot.node))),
    read: () => ({ kind: 'arithmetic-reasoning', mode: 'sequence', rule: task.recognize ? rule.get() : 0, extension: slots.map(slot => slot.get()) }),
    show(a) { rule.set(a.rule); slots.forEach((slot, i) => slot.set(a.extension[i]!)); },
  };
}

function huntBoard(task: Task<'hunt'>): Board<'hunt'> {
  const attempt = entry('Kokeiltava arvo'), observation = menu('Koetulos verrattuna tavoitteeseen', comparison);
  const solution = entry('Ratkaisu'), substitution = entry('Vasen puoli sijoittamalla');
  const log = h('ol', { 'data-arithmetic-hunt-log': '', style: 'margin:0;padding-left:22px;font-size:14px' });
  const measured = line('measured'), range = line('hunt-range');
  const trials: Answer<'hunt'>['trials'] = [];
  let low = task.min, high = task.max, current: number | undefined;
  const infer = h('div', { hidden: true }, h('div', { style: row }, observation.node, button('Kirjaa havainto', () => commit())));
  const final = h('div', { hidden: true }, h('div', { style: row }, solution.node, substitution.node));
  const test = button('Kokeile arvoa', () => {
    const value = attempt.get();
    if (value < low || value > high || Number.isNaN(value) || (!trials.length && value !== task.start)) {
      measured.textContent = 'Valitse arvo annetusta hakuvälistä. Aloita ohjeen kokeesta.';
      return;
    }
    current = value;
    measured.textContent = `Kun x = ${value}, vasen puoli on ${substituted(task, value)}.`;
    observation.set(null); infer.hidden = false; observation.input.focus();
  });
  function commit() {
    const finding = observation.get();
    if (current === undefined || !finding) return;
    trials.push({ input: current, finding });
    current = undefined; infer.hidden = true; measured.textContent = '';
    paint();
    if (finding === 'fits') solution.input.focus();
    else { attempt.input.value = ''; attempt.input.focus(); }
  }
  function paint() {
    [low, high] = trials.reduce<readonly [number, number]>(([a, b], trial) => huntBounds(a, b, trial.input, trial.finding), [task.min, task.max]);
    const ready = trials.at(-1)?.finding === 'fits';
    test.disabled = !!ready;
    attempt.input.disabled = !!ready;
    final.hidden = !ready;
    range.textContent = !trials.length ? `Hakuväli ${low}–${high}. Aloita luvusta ${task.start}.` : `Havainnon jälkeinen hakuväli ${low}–${high}.`;
    log.replaceChildren(...trials.map(({ input, finding }) => h('li', {}, `x = ${input} → ${substituted(task, input)} · ${comparison.find(([id]) => id === finding)![1]}`)));
  }
  const reset = button('Aloita kokeet uudelleen', () => {
    trials.length = 0; current = undefined; infer.hidden = true; measured.textContent = ''; attempt.input.value = ''; paint(); attempt.input.focus();
  });
  paint();
  return {
    node: h('div', { style: board }, range, log, h('div', { style: row }, attempt.node, test), measured, infer, final, reset),
    read: () => ({ kind: 'arithmetic-reasoning', mode: 'hunt', trials: [...trials], solution: solution.get(), substitution: substitution.get() }),
    show(a) { trials.splice(0, trials.length, ...a.trials); infer.hidden = true; solution.set(a.solution); substitution.set(a.substitution); paint(); },
  };
}

export function mountArithmeticReasoning(task: ArithmeticReasoningTask, host: HTMLElement, submit: (response: ArithmeticReasoningResponse) => void): { reveal(): void } {
  const mount = <M extends Mode>(activity: Board<M>) => {
    const done = h('button', { type: 'submit', class: 'btn primary wide' }, 'Tarkista ratkaisu');
    const form = h('form', { 'data-arithmetic-workbench': task.mode, style: grid }, activity.node, done);
    let locked = false;
    function lock() { locked = true; for (const control of form.querySelectorAll('input,select,button')) control.setAttribute('disabled', ''); }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (locked) return;
      const answer = activity.read();
      lock();
      submit(answer);
    });
    host.append(form);
    return { reveal() { activity.show(solutionArithmeticReasoning(task) as Answer<M>); lock(); } };
  };
  switch (task.mode) {
    case 'split': return mount(splitBoard(task));
    case 'group': return mount(groupBoard(task));
    case 'rotate': return mount(rotateBoard(task));
    case 'relation': return mount(relationBoard(task));
    case 'membership': return mount(membershipBoard(task));
    case 'round': return mount(roundBoard(task));
    case 'estimate': return mount(estimateBoard(task));
    case 'audit': return mount(auditBoard());
    case 'strategy': return mount(strategyBoard(task));
    case 'sequence': return mount(sequenceBoard(task));
    case 'hunt': return mount(huntBoard(task));
  }
}

export function arithmeticExample(task: ArithmeticReasoningTask): Paint {
  return host => {
    const givens = h('div'), work = h('div');
    arithmeticBoard(task)(givens);
    mountArithmeticReasoning(task, work, () => {}).reveal();
    work.querySelector('button[type="submit"]')?.remove();
    host.replaceChildren(givens, work);
  };
}
