import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { advance, compass, estimateGroups, pairIds, solutionNumberJourney, type Direction, type NumberJourneyResponse,
  type NumberJourneyTask, type Pair } from '../models/number-journey';

const grid = 'display:grid;gap:5px';
const row = 'display:flex;flex-wrap:wrap;align-items:center;gap:4px 7px';
const panel = `${grid};background:#edf4e9;border:1px solid #acc7b9;border-radius:9px;padding:6px 8px`;
const field = 'min-height:44px;box-sizing:border-box;border:1px solid #8aa99c;border-radius:8px;padding:4px 6px;background:#fffef7;color:#173d39;font:inherit;max-width:100%';
const bold = (text: string) => h('strong', {}, text);
const line = (id: string) => h('p', { 'aria-live': 'polite', 'data-number-live': id, style: 'margin:0;font-weight:700' });
const button = (text: string, onclick: () => void, label?: string) => h('button', {
  type: 'button', class: 'btn small', style: 'min-width:44px;min-height:44px', onclick, 'aria-label': label,
}, text);
const integer = (value: string) => /^[−+-]?\d{1,6}$/.test(value.trim()) ? Number(value.trim().replace('−', '-')) : NaN;

export function numberJourneyBoard(task: NumberJourneyTask): Paint {
  return host => host.replaceChildren(h('div', { 'data-number-givens': '', style: grid },
    h('p', { class: 'small', style: 'margin:0' }, bold('Tuttu ajatus. '), task.context.title),
    h('dl', { style: 'display:grid;grid-template-columns:auto minmax(0,1fr);gap:2px 9px;margin:0' },
      ...task.givens.flatMap(({ label, value }) => [h('dt', { style: 'font-weight:700' }, label), h('dd', { style: 'margin:0;font-size:14px' }, value)]))));
}

function entry(label: string, width = 62) {
  const input = h('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': label, style: `${field};width:${width}px;text-align:center` });
  return { input, node: h('label', { style: row }, bold(label), input), get: () => integer(input.value), set: (value: number) => { input.value = String(value); } };
}

function select<T extends string>(label: string, options: readonly (readonly [T, string])[]) {
  const input = h('select', { 'aria-label': label, style: field }, h('option', { value: '' }, 'Valitse'),
    ...options.map(([value, name]) => h('option', { value }, name)));
  return { input, node: h('label', { style: row }, bold(label), input), get: () => (input.value || null) as T | null,
    set: (value: T | null) => { input.value = value ?? ''; } };
}

type Mode = NumberJourneyTask['mode'];
type Task<M extends Mode> = Extract<NumberJourneyTask, { mode: M }>;
type Response<M extends Mode> = Extract<NumberJourneyResponse, { mode: M }>;
type Board<M extends Mode> = { node: HTMLElement; read(): Response<M>; show(answer: Response<M>): void; ready?(): boolean };

function objectMark(object: string, id: string, size = 14) {
  const edge = object === 'lehti' ? '75% 4px 75% 4px' : object === 'simpukka' ? '60% 60% 36% 36%' : object === 'kaisla' ? '3px' : '43%';
  return h('span', { 'data-number-object': id, 'aria-hidden': 'true', style: `display:inline-block;width:${size}px;height:${object === 'kaisla' ? size * .8 : size}px;border:1px solid #426e60;border-radius:${edge};background:#77a68e` });
}

const dice: Readonly<Record<number, readonly number[]>> = {
  1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9],
};
function groupMarks(object: string, n: number, id: string, pattern: 'dice' | 'rows' | 'uneven' = 'rows') {
  const spots = pattern === 'dice' ? dice[n] : undefined;
  if (spots) return h('div', { 'aria-hidden': 'true', style: 'display:grid;grid-template-columns:repeat(3,15px);grid-auto-rows:15px;gap:2px;margin:auto' },
    ...Array.from({ length: 9 }, (_, i) => spots.includes(i + 1) ? objectMark(object, `${id}-${i}`, 13) : h('i')));
  const width = pattern === 'uneven' ? (n % 3 === 0 ? 3 : 2) : Math.min(5, n);
  return h('div', { 'aria-hidden': 'true', style: `display:grid;grid-template-columns:repeat(${width},15px);gap:2px;margin:auto` },
    ...Array.from({ length: n }, (_, i) => objectMark(object, `${id}-${i}`, 13)));
}

function grouped(task: Task<'grouped'>): Board<'grouped'> {
  const total = entry('Kaikki yhteensä');
  const parts = task.parts.map((n, i) => ({
    input: entry(`Ryhmä ${i + 1}`, 53), art: groupMarks(task.object, n, String(i), task.pattern),
  }));
  return {
    node: h('div', { style: panel }, h('div', { style: row }, ...parts.map(({ input, art }) => h('div', {
      'data-number-group': '', style: `${grid};padding:5px;border:1px solid #9ab9a9;border-radius:8px`,
    }, art, input.node))), total.node),
    read: () => ({ kind: 'number-journey', mode: 'grouped', parts: parts.map(({ input }) => input.get()), total: total.get() }),
    show(a) { parts.forEach(({ input }, i) => input.set(a.parts[i]!)); total.set(a.total); },
  };
}

function estimate(task: Task<'estimate'>): Board<'estimate'> {
  let band = -1, larger = false;
  const choose = select('Arvioalue', task.bands.map(([a, b], i) => [String(i), `${a}–${b}`] as const));
  const exact = entry('Ryhmitelty tarkka määrä');
  const chart = h('div', { 'data-number-estimate': 'rough' });
  const groupedCount = h('div', { hidden: true }, exact.node);
  const changeSize = button('Vaihda simpukoiden kokoa', () => {
    if (band >= 0) return;
    larger = !larger;
    changeSize.setAttribute('aria-pressed', String(larger));
    draw();
  });
  changeSize.setAttribute('aria-pressed', 'false');
  const commit = button('Lukitse arvio', () => {
    if (choose.get() === null) return;
    band = Number(choose.get());
    choose.input.disabled = true; commit.disabled = true;
    draw();
    exact.input.focus();
  });
  commit.disabled = true;
  choose.input.addEventListener('change', () => { commit.disabled = choose.get() === null; });
  function draw() {
    chart.dataset.numberEstimate = band < 0 ? 'rough' : 'grouped';
    groupedCount.hidden = band < 0;
    changeSize.disabled = band >= 0;
    const measure = (i: number) => task.pattern === 'sizes' ? (larger ? 13 : 8) + (i * 11 % 4) : 13;
    if (band < 0) {
      function scatter(start: number, count: number, width: number) {
        const slots = width * 4;
        const spots = Array.from({ length: slots }, (_, i) => {
          const index = (i * 13 + 7) % slots, id = start + index;
          if (index >= count) return h('span');
          const mark = objectMark(task.object, `e${id}`, measure(id));
          mark.style.transform = `translate(${id % 3 - 1}px,${(id * 2) % 5 - 2}px) rotate(${id % 7 * 11}deg)`;
          return mark;
        });
        return h('div', { 'aria-hidden': 'true',
          style: `display:grid;grid-template-columns:repeat(${width},20px);grid-auto-rows:20px;gap:2px;width:max-content` }, ...spots);
      }
      const left = Math.ceil(task.amount / 2) + 1;
      chart.replaceChildren(h('div', { style: `${row};justify-content:center;gap:6px 22px` },
        ...(task.pattern === 'clusters' ? [scatter(0, left, 5), scatter(left, task.amount - left, 5)] : [scatter(0, task.amount, 10)])));
    } else {
      let index = 0;
      chart.replaceChildren(h('div', { style: row }, ...estimateGroups(task.amount).map(n => h('span', {
        style: 'display:flex;align-items:center;gap:2px;padding:3px;border:1px solid #88a99b;border-radius:5px',
      }, ...Array.from({ length: n }, () => { const i = index++; return objectMark(task.object, `e${i}`, measure(i)); })))));
    }
  }
  draw();
  return {
    node: h('div', { style: panel }, chart, task.pattern === 'sizes' ? changeSize : null, h('div', { style: row }, choose.node, commit), groupedCount),
    ready: () => band >= 0,
    read: () => ({ kind: 'number-journey', mode: 'estimate', band, groupedCount: exact.get() }),
    show(a) { choose.set(String(a.band)); band = a.band; exact.set(a.groupedCount); draw(); },
  };
}

function neighbors(task: Task<'neighbors'>): Board<'neighbors'> {
  let noPrevious = false;
  const previous = entry('Edeltäjä'), next = entry('Seuraaja');
  const none = button('Ei edeltäjää', () => { noPrevious = !noPrevious; update(); });
  function update() { previous.input.disabled = noPrevious; none.setAttribute('aria-pressed', String(noPrevious)); }
  update();
  const middle = h('strong', { style: 'font-size:20px;padding:3px 8px;border:1px solid #7aa495;border-radius:7px' }, task.center);
  return {
    node: h('div', { style: panel }, task.view === 'path' ? h('div', { style: row }, previous.node, middle, next.node)
      : h('div', { style: grid }, h('div', { style: row }, bold('Keskimmäinen lappu'), middle), h('div', { style: row }, next.node, previous.node)), none),
    read: () => ({ kind: 'number-journey', mode: 'neighbors', previous: noPrevious ? null : previous.get(), next: next.get() }),
    show(a) { noPrevious = a.previous === null; if (a.previous !== null) previous.set(a.previous); next.set(a.next); update(); },
  };
}

function order(task: Task<'order'>): Board<'order'> {
  let ids: string[] = [];
  const choices = h('div', { style: row });
  const progression = line('ordered-values');
  const undo = button('Peru viimeinen', () => { ids = ids.slice(0, -1); paint(); });
  function paint() {
    choices.replaceChildren(...task.cards.filter(card => !ids.includes(card.id)).map(card => {
      const control = button(String(card.value), () => {
        ids = [...ids, card.id]; paint(); (choices.querySelector('button') ?? undo).focus();
      }, `Kortti ${card.id}, ${card.value}`);
      if (task.view === 'amounts') control.append(groupMarks('lehti', card.value, card.id));
      return control;
    }));
    const values = ids.map(id => task.cards.find(card => card.id === id)!.value);
    progression.textContent = values.length ? values.map((n, i) => i === 0 ? String(n) : `${values[i - 1]! < n ? '<' : values[i - 1] === n ? '=' : '>'} ${n}`).join(' ')
      : 'Jono on tyhjä.';
    undo.disabled = !ids.length;
  }
  paint();
  return {
    node: h('div', { style: panel }, choices, progression, undo),
    read: () => ({ kind: 'number-journey', mode: 'order', ids }),
    show(a) { ids = [...a.ids]; paint(); },
  };
}

function meaning(task: Task<'meaning'>): Board<'meaning'> {
  let built = 0;
  const marked = new Set<string>();
  const rows = task.cards.map(card => ({
    card, button: button(card.text, () => { if (marked.has(card.id)) marked.delete(card.id); else marked.add(card.id); paint(); }),
  }));
  const objects = h('div', { 'data-number-built': '', style: row });
  const counter = line('built-count');
  const add = button('+', () => { built++; paint(); }, 'Lisää yksi kohde');
  const remove = button('−', () => { built--; paint(); }, 'Poista yksi kohde');
  function paint() {
    for (const { card, button } of rows) {
      button.setAttribute('aria-pressed', String(marked.has(card.id)));
      button.style.background = marked.has(card.id) ? '#a6d2b6' : '';
    }
    objects.replaceChildren(...Array.from({ length: built }, (_, i) => objectMark(task.object, `b${i}`)));
    add.disabled = built === 12; remove.disabled = built === 0;
    counter.textContent = `Rakennettu määrä ${built}`;
  }
  paint();
  return {
    node: h('div', { style: panel }, h('div', { style: row }, ...rows.map(row => row.button)),
      h('div', { style: grid }, bold(`Työohje. ${task.cards.find(card => card.id === task.target)!.text}`),
        h('div', { style: row }, remove, add, counter, objects))),
    read: () => ({ kind: 'number-journey', mode: 'meaning', quantities: [...marked], built }),
    show(a) { a.quantities.forEach(id => marked.add(id)); built = a.built; paint(); },
  };
}

function ordinal(task: Task<'ordinal'>): Board<'ordinal'> {
  let picked = '';
  const next = entry('Saman kohteen uusi järjestysnumero');
  const changed = h('div', { hidden: true, 'data-number-ordinal': 'changed' });
  const buttons = task.first.map(object => button(object, () => { picked = object; paint(); }));
  const approach = (end: boolean) => task.vertical ? end ? 'Aloita alhaalta' : 'Aloita ylhäältä' : end ? 'Aloita oikealta' : 'Aloita vasemmalta';
  const style = task.vertical ? 'display:grid;gap:3px' : row;
  function paint() {
    buttons.forEach((button, index) => {
      button.setAttribute('aria-pressed', String(task.first[index] === picked));
      button.style.background = task.first[index] === picked ? '#aad0b7' : '';
    });
    changed.hidden = picked === '';
    changed.replaceChildren(h('div', { style: grid }, bold(`Uusi jono. ${approach(task.changedFromEnd)}.`),
      h('div', { style }, ...task.changed.map(name => h('span', { 'data-number-ordinal-member': name,
        style: `padding:3px 6px;border:1px solid #8eab9c;border-radius:5px;background:${name === picked ? '#b6d6be' : '#fffef7'}`,
      }, name))), next.node));
  }
  paint();
  return {
    node: h('div', { style: panel }, h('div', { style: task.vertical ? 'display:grid;grid-template-columns:1fr 1fr;gap:8px' : grid },
      h('div', { style: grid, 'data-number-ordinal': 'first' }, bold(`Alkujono. ${approach(task.fromEnd)}.`), h('div', { style }, ...buttons)), changed)),
    read: () => ({ kind: 'number-journey', mode: 'ordinal', object: picked, newPlace: next.get() }),
    show(a) { picked = a.object; next.set(a.newPlace); paint(); },
  };
}

function pairs(task: Task<'pair'>): Board<'pair'> {
  const identifiers = pairIds(task);
  let chosen: string | undefined;
  let completed: Pair[] = [];
  let locked = false;
  const work = h('div', { 'data-number-pairs': '', style: grid });
  const message = line('pair-message');
  const single = entry(task.activity === 'parity' ? 'Ilman paria' : 'Erotus');
  const classification = select('Parillisuus', [['even', 'Parillinen'], ['odd', 'Pariton']] as const);
  const larger = select('Kummalla on enemmän?', [['a', 'Aavalla'], ['b', 'Loikalla'], ['equal', 'Yhtä paljon']] as const);
  const minuend = entry('Suurempi määrä'), subtrahend = entry('Pienempi määrä');
  const undo = button('Peru viimeinen pari', () => { completed = completed.slice(0, -1); chosen = undefined; paint(); });
  function choose(id: string) {
    if (chosen === id) chosen = undefined;
    else if (chosen && (task.activity === 'parity' || chosen[0] !== id[0])) {
      completed = [...completed, [chosen, id]]; chosen = undefined;
    } else chosen = id;
    paint();
    (work.querySelector(`[data-pair-object="${id}"]:not(:disabled)`) as HTMLElement | null)?.focus();
  }
  function paint() {
    work.replaceChildren(...identifiers.map((group, groupIndex) => {
      const buttons = group.map((id, index) => {
        const partner = completed.findIndex(pair => pair.includes(id));
        const control = button(partner < 0 ? (task.object === 'kaisla' ? '▮' : '●') : String(partner + 1), () => choose(id),
          task.activity === 'parity' ? `Kohde ${index + 1}` : `${groupIndex === 0 ? 'Aavan' : 'Loikan'} kohde ${index + 1}`);
        control.dataset.pairObject = id;
        control.setAttribute('aria-pressed', String(chosen === id));
        control.style.background = partner >= 0 ? '#b4d2c0' : chosen === id ? '#f1cd8d' : '';
        if (task.activity === 'difference' && task.bars) control.style.borderRadius = '3px';
        if (task.activity === 'parity' && task.dispersed) control.style.transform = `translateY(${index % 2 ? 2 : -2}px)`;
        control.disabled = locked || partner >= 0;
        return control;
      });
      const appearance = task.activity === 'difference' && task.bars ? `${row};gap:1px;border-left:3px solid #41796c` : row;
      return h('div', { style: grid }, identifiers.length === 2 ? bold(groupIndex === 0 ? 'Aava' : 'Loikka') : null, h('div', { style: appearance }, ...buttons));
    }));
    message.textContent = `Pareja ${completed.length}.${chosen ? ' Valitse pariksi toinen vapaa kohde.' : ''}`;
    undo.disabled = !completed.length || locked;
  }
  paint();
  return {
    node: h('div', { style: panel }, work, h('div', { style: row }, undo, message), task.activity === 'parity'
      ? h('div', { style: row }, single.node, classification.node)
      : h('div', { style: grid }, larger.node, h('div', { style: row }, minuend.node, bold('−'), subtrahend.node, single.node))),
    read: () => ({ kind: 'number-journey', mode: 'pair', pairs: completed, single: single.get(), classification: classification.get(),
      larger: larger.get(), minuend: minuend.get(), subtrahend: subtrahend.get() }),
    show(a) {
      completed = [...a.pairs]; chosen = undefined; locked = true; single.set(a.single); classification.set(a.classification);
      larger.set(a.larger); minuend.set(a.minuend); subtrahend.set(a.subtrahend); paint();
    },
  };
}

function addLaw(task: Task<'add-law'>): Board<'add-law'> {
  const seen = new Set<number>();
  const display = h('div', { 'data-number-law-objects': '', style: row });
  const operands = [0, 1].map(view => task.counts.map((_, part) => entry(`Näkymä ${view + 1}, määrä ${part + 1}`, 47)));
  const inside = task.activity === 'associate' ? [entry('Ensimmäiset sulut'), entry('Toiset sulut')] : [];
  const totals = [entry('Ensimmäinen summa'), entry('Toinen summa')];
  const choice = select('Kumpi ryhmittely helpottaa sinua?', [['0', 'Ensimmäinen'], ['1', 'Toinen']] as const);
  const open = [0, 1].map(view => button(`Avaa näkymä ${view + 1}`, () => paint(view)));
  function paint(view: number) {
    seen.add(view);
    open.forEach((button, i) => button.setAttribute('aria-pressed', String(i === view)));
    const ordered = task.activity === 'commute' && view === 1 ? [...task.counts.keys()].reverse() : [...task.counts.keys()];
    const groups = ordered.map(index => h('div', {
      'data-number-law-part': index, style: `${row};padding:4px;border:1px solid #84a79a;border-radius:5px`,
    }, h('small', {}, ['Aavan kori', 'Loikan kori', 'Sulkan kori'][index]), task.symbolic ? bold(String(task.counts[index])) :
      h('span', { style: row }, ...Array.from({ length: task.counts[index]! }, (_, i) => objectMark('kaisla', `g${index}-${i}`, 11)))));
    if (task.activity === 'associate') {
      const wrap = (parts: HTMLElement[]) => h('div', { 'data-number-law-bracket': '', style: `${row};padding:2px;border:2px solid #3d7567;border-radius:7px` }, ...parts);
      display.replaceChildren(...(view === 0 ? [wrap(groups.slice(0, 2)), groups[2]!] : [groups[0]!, wrap(groups.slice(1))]));
    } else display.replaceChildren(...groups);
  }
  const expressionFields = operands.map((fields, i) => {
    const [a, b, c] = fields.map(field => field.input);
    const symbols = task.activity === 'commute' ? [a!, bold('+'), b!]
      : i === 0 ? [bold('('), a!, bold('+'), b!, bold(') +'), c!]
        : [a!, bold('+ ('), b!, bold('+'), c!, bold(')')];
    return h('div', { style: `${grid};border-top:1px solid #adc4b7;padding-top:3px` },
      h('small', {}, `Näkymä ${i + 1}`),
      h('div', { style: row }, ...symbols, bold('='), totals[i]!.input), inside[i]?.node);
  });
  return {
    node: h('div', { style: panel }, h('div', { style: row }, ...open), display, ...expressionFields, task.preferred ? choice.node : null),
    read: () => ({ kind: 'number-journey', mode: 'add-law', views: [...seen], operands: operands.map(fields => fields.map(field => field.get())),
      inside: inside.map(field => field.get()), totals: totals.map(field => field.get()), choice: Number(choice.get() ?? -1) }),
    show(a) {
      a.views.forEach(paint); operands.forEach((fields, i) => fields.forEach((field, j) => field.set(a.operands[i]![j]!)));
      inside.forEach((field, i) => field.set(a.inside[i]!)); totals.forEach((field, i) => field.set(a.totals[i]!));
      choice.set(a.choice ? '1' : '0');
    },
  };
}

function operation(task: Task<'operation'>): Board<'operation'> {
  const op = select('Laskutoimitus', [['+', 'Yhteenlasku (+)'], ['−', 'Vähennyslasku (−)']] as const);
  const first = entry('Ensimmäinen määrä'), second = entry('Toinen määrä'), result = entry('Tulos');
  const tray = (label: string, amount: number, prefix: string) => h('div', { style: row }, h('small', {}, label),
    ...Array.from({ length: amount }, (_, i) => objectMark(task.object, `${prefix}${i}`, 11)));
  const visual = h('div', { style: grid }, tray(task.story === 'compare' ? 'Aavan määrä' : 'Lähtömäärä', task.a, 'm'),
    tray(task.story === 'compare' ? 'Loikan määrä' : task.story === 'join' ? 'Mukaan tulevat' : 'Rantaan otettavat', task.b, 'n'));
  return {
    node: h('div', { style: panel }, visual, op.node, h('div', { style: row }, first.node, second.node, result.node)),
    read: () => ({ kind: 'number-journey', mode: 'operation', operation: op.get(), first: first.get(), second: second.get(), result: result.get() }),
    show(a) { op.set(a.operation); first.set(a.first); second.set(a.second); result.set(a.result); },
  };
}

function move(task: Task<'move'>): Board<'move'> {
  let positions = [task.start];
  const ruler = h('div', { 'data-number-line': '', style: `display:grid;grid-template-columns:repeat(${task.max - task.min + 1},minmax(0,1fr));border-top:2px solid #628b7d` });
  const status = line('number-position');
  const value = entry('Uusi arvo');
  const left = button('←', () => step(-1), 'Askel vasemmalle'), right = button('→', () => step(1), 'Askel oikealle');
  const undo = button('Peru askel', () => { if (positions.length > 1) positions = positions.slice(0, -1); paint(); });
  function step(delta: number) {
    const n = positions.at(-1)! + delta;
    if (n >= task.min && n <= task.max && positions.length <= 18) positions = [...positions, n];
    paint();
  }
  function paint() {
    const last = positions.at(-1)!;
    ruler.replaceChildren(...Array.from({ length: task.max - task.min + 1 }, (_, i) => {
      const n = task.min + i;
      return h('span', { style: `text-align:center;border-left:1px solid #8cac9e;font-size:12px;font-weight:${n === last ? 800 : 500};background:${n === last ? '#e6bb7a' : positions.includes(n) ? '#bcd9c7' : ''}` }, String(n).replace('-', '−'));
    }));
    status.textContent = `Reitti: ${positions.join(' → ').replaceAll('-', '−')}`;
    left.disabled = last === task.min; right.disabled = last === task.max;
    undo.disabled = positions.length === 1;
  }
  paint();
  return {
    node: h('div', { style: panel }, ruler, h('div', { style: row }, left, right, undo), status, value.node),
    read: () => ({ kind: 'number-journey', mode: 'move', positions, value: value.get() }),
    show(a) { positions = [...a.positions]; value.set(a.value); paint(); },
  };
}

export const compassNames = { north: 'pohjoinen', east: 'itä', south: 'etelä', west: 'länsi' };
const arrows = { north: '↑', east: '→', south: '↓', west: '←' };
function route(task: Task<'route'>): Board<'route'> {
  let moves: Direction[] = [];
  const map = h('div', { 'data-number-route': '', style: 'display:grid;grid-template-columns:repeat(5,31px);grid-auto-rows:31px;gap:2px' });
  const status = line('route-status');
  const go = compass.map(direction => button(arrows[direction], () => {
    const end = advance(moves.reduce(advance, task.origin), direction);
    if (moves.length < 8 && end.x >= 0 && end.x < 5 && end.y >= 0 && end.y < 5) moves = [...moves, direction];
    paint();
  }, `Askel kartalla ${compassNames[direction]}`));
  const undo = button('Peru askel', () => { moves = moves.slice(0, -1); paint(); });
  function paint() {
    let current = task.origin;
    const visited = [current];
    for (const direction of moves) { current = advance(current, direction); visited.push(current); }
    map.replaceChildren(...Array.from({ length: 25 }, (_, index) => {
      const x = index % 5, y = Math.floor(index / 5);
      const here = x === current.x && y === current.y;
      const used = visited.some(p => p.x === x && p.y === y);
      return h('span', { 'data-map-cell': `${x}-${y}`, 'aria-hidden': 'true',
        style: `display:grid;place-items:center;border:1px solid #8baa9d;border-radius:3px;background:${here ? '#e5b970' : used ? '#afcfbc' : '#f9fbeb'}` },
      here ? arrows[task.heading] : used ? '·' : '');
    }));
    status.textContent = moves.length ? `Askeleet kartalla: ${moves.map(direction => compassNames[direction]).join(' · ')}` : 'Loikka on lähtöruudussa.';
    undo.disabled = moves.length === 0;
  }
  paint();
  return {
    node: h('div', { style: panel }, h('div', { style: row }, map, h('div', { style: grid }, bold(`↑ Kartan pohjoinen · Loikan katselusuunta on ${compassNames[task.heading]}.`),
      h('div', { style: row }, ...go), undo)), status),
    read: () => ({ kind: 'number-journey', mode: 'route', moves, end: moves.reduce(advance, task.origin) }),
    show(a) { moves = [...a.moves]; paint(); },
  };
}

export function mountNumberJourney(task: NumberJourneyTask, host: HTMLElement, submit: (response: NumberJourneyResponse) => void): { reveal(): void } {
  const mount = <M extends Mode>(activity: Board<M>) => {
    const done = h('button', { type: 'submit', class: 'btn primary wide' }, 'Tarkista työpöytä');
    const form = h('form', { 'data-number-workbench': task.mode, style: grid }, activity.node, done);
    let locked = false;
    if (activity.ready) {
      done.disabled = !activity.ready();
      form.addEventListener('click', () => { if (!locked) done.disabled = !activity.ready!(); });
    }
    function lock() { locked = true; for (const control of form.querySelectorAll('input,select,button')) control.setAttribute('disabled', ''); }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (locked || activity.ready?.() === false) return;
      const answer = activity.read();
      lock(); submit(answer);
    });
    host.append(form);
    return { reveal() { activity.show(solutionNumberJourney(task) as Response<M>); lock(); } };
  };
  switch (task.mode) {
    case 'grouped': return mount(grouped(task));
    case 'estimate': return mount(estimate(task));
    case 'neighbors': return mount(neighbors(task));
    case 'order': return mount(order(task));
    case 'meaning': return mount(meaning(task));
    case 'ordinal': return mount(ordinal(task));
    case 'pair': return mount(pairs(task));
    case 'add-law': return mount(addLaw(task));
    case 'operation': return mount(operation(task));
    case 'move': return mount(move(task));
    case 'route': return mount(route(task));
  }
}

export function numberJourneyExample(task: NumberJourneyTask): Paint {
  return host => {
    const givens = h('div'), example = h('div');
    numberJourneyBoard(task)(givens);
    mountNumberJourney(task, example, () => {}).reveal();
    example.querySelector('button[type="submit"]')?.remove();
    host.replaceChildren(givens, example);
  };
}
