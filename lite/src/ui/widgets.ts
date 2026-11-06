import { mountDecimalLedger } from '../content/scenes/decimal-ledger';
import { mountLifecycleHarbor } from '../content/scenes/lifecycle-harbor';
import { mountReactionLab } from '../content/scenes/reaction-lab';
import { mountMatterCycles } from '../content/scenes/matter-cycles';
import { mountInquiryIslands } from '../content/scenes/inquiry-islands';
import { mountCarbonKitchen } from '../content/scenes/carbon-kitchen';
import { mountAtomicWorld } from '../content/scenes/atomic-world';
import { mountSafetyHarbor } from '../content/scenes/safety-harbor';
import { mountWavesObservatory } from '../content/scenes/waves-observatory';
import { mountSolutionLab } from '../content/scenes/solution-lab';
import { mountLogicWorkshop } from '../content/scenes/logic-workshop';
import { mountChemicalInvestigation } from '../content/scenes/chemical-investigation';
import { mountPhysicsInvestigation } from '../content/scenes/physics-investigation';
import { mountMaterialsMixtures } from '../content/scenes/materials-mixtures';
import { mountChemicalNotation } from '../content/scenes/chemical-notation';
import { mountPlaneMeasures } from '../content/scenes/plane-measures';
import { mountAlgorithmStudio } from '../content/scenes/algorithm-studio';
import { mountNumberEquivalences } from '../content/scenes/number-equivalences';
import { mountEnergyIslands } from '../content/scenes/energy-islands';
import { mountAdvancedSolids } from '../content/scenes/advanced-solids';
import { mountFunctionGarden } from '../content/scenes/function-garden';
import { mountCircuitWorkshop } from '../content/scenes/circuit-workshop';
import { mountCircleObservatory } from '../content/scenes/circle-observatory';
import { mountRightTriangle } from '../content/scenes/right-triangle';
import { mountRelationWorkshop } from '../content/scenes/relation-workshop';
import { mountElectricityHarbor } from '../content/scenes/electricity-harbor';
import { mountStatisticsHarbor } from '../content/scenes/statistics-harbor';
import { mountGeometryRelations } from '../content/scenes/geometry-relations';
import { mountThermalStation } from '../content/scenes/thermal-station';
import { mountRootWorkshop } from '../content/scenes/root-workshop';
import { mountProgrammingFerry } from '../content/scenes/programming-ferries';
import { mountDataProbability } from '../content/scenes/data-probability';
import { mountMeasurementStation } from '../content/scenes/measurement-station';
import { mountSpatialMeasure } from '../content/scenes/spatial-measures';
import { mountNumberJourney } from '../content/scenes/number-journey';
import { mountArithmeticReasoning } from '../content/scenes/arithmetic-reasoning';
import { mountSolidConstruction } from '../content/scenes/solid-construction';
import { mountPowerRule } from '../content/scenes/power-rules';
import { mountSolidWorkshop } from '../content/scenes/solid-workshop';
import { mountCakeWorkbench } from '../content/scenes/cake-party';
import { mountFractionSubtract } from '../content/scenes/fraction-workshop';
import { mountSpaceDay } from '../content/scenes/space-observatory';
import { mountRationalLink } from '../content/scenes/rational-links';
import { mountEquationWorkshop } from '../content/scenes/equation-workshop';
import { mountObservedExplanation } from '../content/scenes/observed-explanations';
import { mountSailShape } from '../content/scenes/sail-shapes';
import { mountProblemWorkbench } from '../content/scenes/problem-workbench';
import { checkCake } from '../content/fractions/cake-table';
import { ribbonAnswer, solution } from '../engine/check';
import type { Option, Response, Task, Token } from '../engine/types';
import { fmt, word } from '../content/fi';
import { duck, frog, ICON, THINGS } from './art';
import { btn, h } from './dom';
import { clockBody } from './clock';
import { bagGeo, bagupFrame, stackBlocks } from '../content/countanim';
import { balanceBody } from '../content/pics';
import { dialBody, jugBody, packetArt, pourScene } from '../content/measureanim';
import { canSpeak, labelOf, say, speechOff } from './speech';
import './launch-controls.css';

let answerBoardId = 0;

/** SVG targets and role=button containers need the same activation as native buttons.
 * Keep pointer handlers separate: a pointerdown followed by click must not mark twice. */
function keyboardAction(el: Element, action: () => void, label?: string) {
  el.classList.add('answer-action');
  el.setAttribute('tabindex', '0');
  el.setAttribute('role', 'button');
  if (label) el.setAttribute('aria-label', label);
  el.addEventListener('keydown', (event) => {
    const e = event as KeyboardEvent;
    if (e.target !== el || (e.key !== ' ' && e.key !== 'Enter')) return;
    e.preventDefault(); e.stopPropagation();
    if (!e.repeat) action();
  });
}

export interface Widget {
  /** After a wrong answer: show the correct answer in place. */
  reveal(): void;
}

type Submit = (r: Response) => void;

function listen(text: string, cls = 'listen') {
  return h('button', {
    class: cls, type: 'button', 'aria-label': 'Kuuntele', html: ICON.speaker,
    onclick: (e: Event) => { e.stopPropagation(); say(text, true); },
  });
}

function optBody(o: Option) {
  return [
    o.art ? h('div', { html: o.art, style: 'width:100%' }) : null,
    o.big ? h('span', { class: 'big' }, o.big) : null,
    o.text ? h('span', { class: 'txt' }, o.text) : null,
    o.quiet && (speechOff() || !(o.speak && canSpeak(o.speak))) ? h('span', { class: 'quiet-cap' }, o.quiet) : null,
    o.speak && canSpeak(o.speak) ? listen(o.speak) : null,
  ];
}

/** onChange observes an unfinished manipulation for its 3D view. Only submit records evidence. */
export function mount(task: Task, host: HTMLElement, submit: Submit, onChange?: Submit): Widget {
  switch (task.kind) {
    case 'fraction-subtract': return mountFractionSubtract(task, host, submit);
    case 'space-day': return mountSpaceDay(task, host, submit, onChange);
    case 'rational-link': return mountRationalLink(task, host, submit);
    case 'equation-workshop': return mountEquationWorkshop(task, host, submit);
    case 'observed-explanation': return mountObservedExplanation(task, host, submit);
    case 'sail-shapes': return mountSailShape(task, host, submit);
    case 'problem-workbench': return mountProblemWorkbench(task, host, submit);
    case 'solid-workshop': return mountSolidWorkshop(task, host, submit);
    case 'solid-construction': return mountSolidConstruction(task, host, submit, onChange);
    case 'power-rules': return mountPowerRule(task, host, submit);
    case 'arithmetic-reasoning': return mountArithmeticReasoning(task, host, submit);
    case 'number-journey': return mountNumberJourney(task, host, submit);
    case 'measurement-station': return mountMeasurementStation(task, host, submit, onChange);
    case 'data-probability': return mountDataProbability(task, host, submit);
    case 'programming-ferries': return mountProgrammingFerry(task, host, submit, onChange);
    case 'root-workshop': return mountRootWorkshop(task, host, submit);
    case 'geometry-relations': return mountGeometryRelations(task, host, submit);
    case 'statistics-harbor': return mountStatisticsHarbor(task, host, submit, onChange);
    case 'electricity-harbor': return mountElectricityHarbor(task, host, submit, onChange);
    case 'right-triangle': return mountRightTriangle(task, host, submit);
    case 'circle-observatory': return mountCircleObservatory(task, host, submit);
    case 'circuit-workshop': return mountCircuitWorkshop(task, host, submit, onChange);
    case 'physics-investigation': return mountPhysicsInvestigation(task, host, submit, onChange);
    case 'materials-mixtures': return mountMaterialsMixtures(task, host, submit, onChange);
    case 'chemical-notation': return mountChemicalNotation(task, host, submit);
    case 'solution-lab': return mountSolutionLab(task, host, submit);
    case 'logic-workshop': return mountLogicWorkshop(task, host, submit, onChange);
    case 'chemical-investigation': return mountChemicalInvestigation(task, host, submit, onChange);
    case 'waves-observatory': return mountWavesObservatory(task, host, submit, onChange);
    case 'decimal-ledger': return mountDecimalLedger(task, host, submit);
    case 'lifecycle-harbor': return mountLifecycleHarbor(task, host, submit);
    case 'reaction-lab': return mountReactionLab(task, host, submit, onChange);
    case 'matter-cycles': return mountMatterCycles(task, host, submit, onChange);
    case 'inquiry-islands': return mountInquiryIslands(task, host, submit, onChange);
    case 'carbon-kitchen': return mountCarbonKitchen(task, host, submit, onChange);
    case 'atomic-world': return mountAtomicWorld(task, host, submit, onChange);
    case 'safety-harbor': return mountSafetyHarbor(task, host, submit);
    case 'plane-measures': return mountPlaneMeasures(task, host, submit);
    case 'algorithm-studio': return mountAlgorithmStudio(task, host, submit, onChange);
    case 'number-equivalences': return mountNumberEquivalences(task, host, submit);
    case 'function-garden': return mountFunctionGarden(task, host, submit);
    case 'advanced-solids': return mountAdvancedSolids(task, host, submit, onChange);
    case 'energy-islands': return mountEnergyIslands(task, host, submit, onChange);
    case 'relation-workshop': return mountRelationWorkshop(task, host, submit);
    case 'thermal-station': return mountThermalStation(task, host, submit, onChange);
    case 'spatial-measures': return mountSpatialMeasure(task, host, submit);
    case 'cake': {
      const workbench = mountCakeWorkbench(task, host, response => {
        if (checkCake(task, response).ok) workbench.accept(response);
        submit(response);
      });
      return workbench;
    }
    case 'choice': return choice(task, host, submit);
    case 'multi': return multi(task, host, submit);
    case 'tapcount': return tapcount(task, host, submit);
    case 'place': return place(task, host, submit);
    case 'ribbons': return ribbons(task, host, submit);
    case 'numeric': return numeric(task, host, submit);
    case 'plot': return plot(task, host, submit);
    case 'line': return numberLine(task, host, submit);
    case 'build': return build(task, host, submit);
    case 'tally': return tally(task, host, submit);
    case 'combos': return combos(task, host, submit);
    case 'frac': return fracEntry(task, host, submit);
    case 'iterate': return iterate(task, host, submit);
    case 'clock': return setClock(task, host, submit);
    case 'deal': return deal(task, host, submit);
    case 'pack': return pack(task, host, submit);
    case 'bagup': return bagup(task, host, submit);
    case 'stack': return stack(task, host, submit);
    case 'balance': return balance(task, host, submit);
    case 'bundle': return bundle(task, host, submit);
    case 'reeds': return reeds(task, host, submit);
    case 'cut': return cut(task, host, submit);
    case 'grid': return grid(task, host, submit);
    case 'weigh': return weigh(task, host, submit);
    case 'grams': return grams(task, host, submit);
    case 'pourtest': return pourtest(task, host, submit);
    case 'fill': return fill(task, host, submit);
    case 'sort': return sort(task, host, submit);
    case 'extend': return extend(task, host, submit);
  }
}

function choice(t: Extract<Task, { kind: 'choice' }>, host: HTMLElement, submit: Submit): Widget {
  const cols = t.cols ?? (t.options.length === 4 ? 2 : Math.min(t.options.length, 3));
  const buttons = t.options.map((o, i) =>
    h('button', { class: `opt${o.speak ? ' has-speak' : ''}`, type: 'button', onclick: () => pick(i) }, ...optBody(o)));
  function pick(i: number) {
    say(labelOf(t.options[i]!));
    buttons.forEach((b) => (b.disabled = true));
    buttons[i]!.classList.add(i === t.answer ? 'right' : 'wrong');
    submit({ kind: 'choice', index: i });
  }
  host.append(h('div', { class: 'opts', style: `--cols:${cols}` }, ...buttons));
  return { reveal: () => buttons[t.answer]!.classList.add('right') };
}

function multi(t: Extract<Task, { kind: 'multi' }>, host: HTMLElement, submit: Submit): Widget {
  const cols = t.cols ?? (t.options.length % 4 === 0 ? 4 : 3);
  const sel = new Set<number>();
  const buttons = t.options.map((o, i) =>
    h('button', {
      class: `opt${o.speak ? ' has-speak' : ''}`, type: 'button', 'aria-pressed': 'false',
      onclick: () => {
        sel.has(i) ? sel.delete(i) : (sel.add(i), say(labelOf(o)));
        buttons[i]!.classList.toggle('sel', sel.has(i));
        buttons[i]!.setAttribute('aria-pressed', String(sel.has(i)));
      },
    }, ...optBody(o)));
  const done = btn(ICON.check, 'Valmis', () => {
    buttons.forEach((b) => (b.disabled = true));
    done.disabled = true;
    submit({ kind: 'multi', indices: [...sel] });
  }, 'primary big wide');
  host.append(h('div', { class: 'opts', style: `--cols:${cols}` }, ...buttons), done);
  return {
    reveal: () => {
      if (t.count === undefined) buttons.forEach((b, i) => b.classList.toggle('right', t.answer.includes(i)));
    },
  };
}

function tapcount(t: Extract<Task, { kind: 'tapcount' }>, host: HTMLElement, submit: Submit): Widget {
  const taps: number[] = [];
  const NS = 'http://www.w3.org/2000/svg';
  const board = document.createElementNS(NS, 'svg');
  board.setAttribute('viewBox', `0 0 ${t.w} ${t.h}`);
  board.setAttribute('class', 'board');
  board.setAttribute('width', '100%');
  const labels = document.createElementNS(NS, 'g');
  const size = 34;
  t.objects.forEach((o, i) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'hit');
    g.innerHTML = `<circle cx="${o.x}" cy="${o.y}" r="${size * 0.75}" fill="transparent"/>` + THINGS[o.thing]!.draw(o.x, o.y, size);
    g.addEventListener('pointerdown', (e) => { e.preventDefault(); tap(i); });
    keyboardAction(g, () => tap(i), `Merkitse: ${THINGS[o.thing]!.one}`);
    board.append(g);
  });
  board.append(labels);
  function tap(i: number) {
    if (locked) return;
    taps.push(i);
    const n = taps.length;
    const o = t.objects[i]!;
    const dup = taps.indexOf(i) !== n - 1;
    const off = dup ? 14 : 0;
    // Number words only as guided support; otherwise a plain mark, so the count is the child's own.
    const mark = t.words ? `<text x="${o.x + 16 + off}" y="${o.y - 13 - off}" text-anchor="middle" fill="#fff" class="tag-num">${n}</text>` : `<path d="M${o.x + 10 + off} ${o.y - 18 - off}l4 4 8 -8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    labels.insertAdjacentHTML('beforeend',
      `<g><circle cx="${o.x + 16 + off}" cy="${o.y - 18 - off}" r="12" fill="${dup ? 'var(--bad)' : 'var(--pond)'}"/>${mark}</g>`);
    // Respects quiet mode: say() is silent when the child asked for quiet.
    if (t.words) say(word(n));
  }
  let locked = false;
  const ask = h('div', { class: 'stack' });
  const again = btn(ICON.undo, 'Pyyhi merkit', () => { taps.length = 0; labels.innerHTML = ''; }, '', true);
  const finish = (count?: number) => { locked = true; submit({ kind: 'tapcount', taps: [...taps], ...(count !== undefined ? { count } : {}) }); };
  const pad = (lockBoard: boolean) => {
    const max = Math.max(10, t.objects.length + 2);
    const nums = Array.from({ length: max }, (_, i) => i + 1).map((k) =>
      h('button', { class: 'opt', type: 'button', onclick: () => { nums.forEach((b) => (b.disabled = true)); again.disabled = true; nums[k - 1]!.classList.add('sel'); say(word(k)); finish(k); } }, h('span', { class: 'big' }, String(k))));
    if (lockBoard) locked = true;
    return [h('p', {}, h('b', {}, 'Montako niitä on?')), h('div', { class: 'opts', style: '--cols:5' }, ...nums)];
  };
  if (t.ask && t.mode !== 'marking') {
    // Direct total: the number buttons are there from the start; marks are an optional aid.
    ask.replaceChildren(...pad(false));
    host.append(h('div', { class: 'scene' }, board), h('div', { class: 'row' }, h('span', { class: 'small muted' }, 'Merkit ovat vapaaehtoisia.'), h('span', { class: 'spacer' }), again), ask);
  } else {
    const done = btn(ICON.check, t.ask ? 'Merkitty, seuraavaksi määrä' : 'Valmis', () => {
      done.disabled = again.disabled = true;
      if (!t.ask) return finish();
      ask.replaceChildren(...pad(true));
      say('Montako niitä on?');
    }, 'primary big');
    host.append(h('div', { class: 'scene' }, board), h('div', { class: 'row' }, again, h('span', { class: 'spacer' }), done), ask);
  }
  return {
    reveal: () => {
      labels.innerHTML = t.objects.map((o, i) =>
        `<g><circle cx="${o.x + 16}" cy="${o.y - 18}" r="12" fill="var(--ok)"/><text x="${o.x + 16}" y="${o.y - 13}" text-anchor="middle" fill="#fff" class="tag-num">${i + 1}</text></g>`).join('');
    },
  };
}

function place(t: Extract<Task, { kind: 'place' }>, host: HTMLElement, submit: Submit): Widget {
  const map: Record<string, string | null> = {};
  for (const s of t.slots) map[s.id] = t.start?.[s.id] ?? null;
  let selected: string | null = null;
  const tokenEl = new Map<string, HTMLButtonElement>();
  const slotEl = new Map<string, HTMLElement>();
  const slotBox = new Map<string, HTMLElement>();
  const tray = h('div', { class: 'tray place-tray', 'aria-label': 'Valittavat' });

  // Two ways to answer, both real (review U05): drag a card onto its place, or tap the card and then the place.
  let dragged = false;
  const tokenButton = (tk: Token) => {
    const b = h('button', { class: 'token', type: 'button', onclick: (e: Event) => { e.stopPropagation(); if (dragged) { dragged = false; return; } select(tk.id); } },
      tk.art ? h('span', { html: tk.art }) : null, tk.text ? h('span', {}, tk.text) : null, tk.speak ? listen(tk.speak) : null);
    tokenEl.set(tk.id, b);
    draggable(b, tk.id);
    return b;
  };
  function draggable(b: HTMLButtonElement, id: string) {
    // Move and release are followed on the window while the card is pressed: a quick drag leaves the
    // card before the first move event, and the drop target is wherever the finger is lifted.
    let pid: number | null = null, sx = 0, sy = 0, ghost: HTMLElement | null = null;
    const stop = () => {
      ghost?.remove(); ghost = null; pid = null; b.classList.remove('dragging');
      removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', cancel);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pid) return;
      if (!ghost) {
        if (Math.hypot(e.clientX - sx, e.clientY - sy) < 8) return;
        ghost = b.cloneNode(true) as HTMLElement;
        ghost.classList.add('drag-ghost');
        document.body.append(ghost);
        b.classList.add('dragging');
        selected = id;
        tokenEl.forEach((x, k) => x.classList.toggle('sel', k === id));
        slotEl.forEach((x) => x.classList.add('armed'));
      }
      ghost.style.left = `${e.clientX}px`; ghost.style.top = `${e.clientY}px`;
      e.preventDefault();
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pid) return;
      if (!ghost) move(e); // a drag reported only by its end point
      const was = !!ghost;
      stop();
      if (!was) return;
      dragged = true; setTimeout(() => { dragged = false; }, 300); // the click that follows a drop is not a tap
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const slot = [...slotEl].find(([, el]) => el.contains(under))?.[0];
      if (slot) return drop(slot);
      if (under && tray.contains(under)) for (const k of Object.keys(map)) if (map[k] === id) map[k] = null;
      selected = null; layout();
    };
    const cancel = (e: PointerEvent) => { if (e.pointerId !== pid) return; const was = !!ghost; stop(); if (was) { selected = null; layout(); } };
    b.addEventListener('pointerdown', (e) => {
      if (locked || e.button > 0) return;
      stop();
      pid = e.pointerId; sx = e.clientX; sy = e.clientY;
      addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', cancel);
    });
  }
  t.tokens.forEach(tokenButton);

  function select(id: string) {
    if (locked) return;
    selected = selected === id ? null : id;
    const tk = t.tokens.find((x) => x.id === id);
    if (selected && tk) say(labelOf(tk));
    tokenEl.forEach((b, k) => b.classList.toggle('sel', k === selected));
    slotEl.forEach((s) => s.classList.toggle('armed', selected !== null));
  }
  function drop(slot: string) {
    if (locked) return;
    if (!selected) {
      // tapping a filled slot without a selection returns its token to the tray
      if (map[slot]) { map[slot] = null; layout(); }
      return;
    }
    for (const k of Object.keys(map)) if (map[k] === selected) map[k] = null;
    map[slot] = selected;
    selected = null;
    layout();
  }
  function layout() {
    tokenEl.forEach((b) => b.classList.remove('sel'));
    slotEl.forEach((s) => s.classList.remove('armed'));
    const used = new Set(Object.values(map));
    tray.replaceChildren(...t.tokens.filter((tk) => !used.has(tk.id)).map((tk) => tokenEl.get(tk.id)!));
    for (const s of t.slots) {
      const id = map[s.id];
      slotBox.get(s.id)!.replaceChildren(...(id ? [tokenEl.get(id)!] : []));
    }
  }
  const slots = t.slots.map((s) => {
    const box = h('div', { class: 'row', style: 'justify-content:center;min-height:56px' });
    slotBox.set(s.id, box);
    const el = h('div', { class: 'slot', role: 'button', tabindex: '0', onclick: () => drop(s.id) },
      h('div', { class: 'lbl', html: s.art ?? '' }, s.text ? h('div', {}, s.text) : null), box);
    keyboardAction(el, () => drop(s.id));
    slotEl.set(s.id, el);
    return el;
  });
  let locked = false;
  const done = btn(ICON.check, 'Valmis', () => {
    locked = true; done.disabled = true;
    submit({ kind: 'place', map: { ...map } });
  }, 'primary big wide');
  // Four short slots go on one row when the screen is wide enough (CSS), so the answer fits without scrolling.
  const short = t.slots.length >= 4 && t.slots.length <= 6 && [...t.slots, ...t.tokens].every((x) => (x.text ?? '').length <= 16);
  const cols = t.slots.length <= 3 ? t.slots.length : 2;
  host.append(h('div', short ? { class: 'slots wide', style: `--wcols:${t.slots.length === 4 ? 4 : 3}` } : { class: 'slots', style: `--cols:${cols}` }, ...slots), tray,
    h('p', { class: 'small muted place-how' }, 'Vedä kortti paikalleen, tai napauta korttia ja sitten paikkaa.'), done);
  layout();
  return {
    reveal: () => {
      for (const s of t.slots) {
        const want = t.answer[s.id];
        slotEl.get(s.id)!.classList.toggle('wrong', (map[s.id] ?? null) !== want);
      }
      Object.assign(map, t.answer);
      layout();
      tokenEl.forEach((b) => (b.disabled = true));
    },
  };
}

function ribbons(t: Extract<Task, { kind: 'ribbons' }>, host: HTMLElement, submit: Submit): Widget {
  const U = 26, W = 14 * U, H = 150;
  const NS = 'http://www.w3.org/2000/svg';
  const board = document.createElementNS(NS, 'svg');
  board.setAttribute('viewBox', `0 0 ${W} ${H}`);
  board.setAttribute('class', 'board');
  board.setAttribute('width', '100%');
  board.innerHTML = Array.from({ length: 15 }, (_, i) => `<line x1="${i * U}" y1="8" x2="${i * U}" y2="${H - 8}" stroke="var(--line)" stroke-dasharray="3 5"/>`).join('');
  const off = { A: t.offsetA, B: t.offsetB };
  const rib = (key: 'A' | 'B', len: number, y: number, col: string) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'hit');
    g.innerHTML = `<rect x="0" y="${y}" width="${len * U}" height="34" rx="8" fill="${col}"/><path d="M10 ${y + 17} h${len * U - 20}" stroke="#fff" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round" opacity=".6"/>`;
    const place = () => g.setAttribute('transform', `translate(${off[key] * U} 0)`);
    place();
    let start: number | null = null, base = 0;
    g.addEventListener('pointerdown', (e) => { start = e.clientX; base = off[key]; g.setPointerCapture(e.pointerId); });
    g.addEventListener('pointermove', (e) => {
      if (start === null) return;
      const scale = W / board.getBoundingClientRect().width;
      off[key] = Math.max(0, Math.min(14 - len, Math.round(base + ((e.clientX - start) * scale) / U)));
      place();
    });
    g.addEventListener('pointerup', () => (start = null));
    board.append(g);
  };
  rib('A', t.a, 28, 'var(--red)');
  rib('B', t.b, 88, 'var(--blue)');
  const opts = [
    { c: 'A' as const, label: 'Punainen', art: `<svg viewBox="0 0 60 20"><rect width="60" height="20" rx="6" fill="var(--red)"/></svg>` },
    { c: 'B' as const, label: 'Sininen', art: `<svg viewBox="0 0 60 20"><rect width="60" height="20" rx="6" fill="var(--blue)"/></svg>` },
    { c: '=' as const, label: 'Yhtä pitkät', art: `<svg viewBox="0 0 60 30"><rect width="60" height="12" rx="4" fill="var(--red)"/><rect y="17" width="60" height="12" rx="4" fill="var(--blue)"/></svg>` },
  ];
  const buttons = opts.map((o) => h('button', {
    class: 'opt has-speak', type: 'button',
    onclick: () => { buttons.forEach((b) => (b.disabled = true)); buttons[opts.indexOf(o)]!.classList.add(o.c === ribbonAnswer(t) ? 'right' : 'wrong'); submit({ kind: 'ribbons', choice: o.c }); },
  }, h('div', { html: o.art, style: 'width:70%' }), h('span', { class: 'txt' }, o.label), listen(o.label)));
  host.append(h('div', { class: 'scene' }, board), h('p', { class: 'muted small' }, 'Voit siirtää nauhoja sormella.'), h('div', { class: 'opts', style: '--cols:3' }, ...buttons));
  return {
    reveal: () => {
      off.A = 0; off.B = 0;
      board.querySelectorAll('g.hit').forEach((g) => g.setAttribute('transform', 'translate(0 0)'));
      buttons[opts.findIndex((o) => o.c === ribbonAnswer(t))]!.classList.add('right');
    },
  };
}

function numeric(t: Extract<Task, { kind: 'numeric' }>, host: HTMLElement, submit: Submit): Widget {
  let txt = '';
  const val = h('span', {});
  const display = h('div', { class: 'display', 'aria-live': 'polite' }, t.label ? h('span', { class: 'unit' }, t.label + ' ') : null, val, t.unit ? h('span', { class: 'unit' }, t.unit) : null);
  const show = () => (val.textContent = txt || '?');
  show();
  const key = (k: string) => {
    if (locked) return;
    if (k === '⌫') txt = txt.slice(0, -1);
    else if (k === '−') txt = txt.startsWith('−') ? txt.slice(1) : '−' + txt;
    else if (k === ',') { if (!txt.includes(',')) txt += txt === '' || txt === '−' ? '0,' : ','; }
    else if (txt.replace(/[−,]/g, '').length < 7) txt += k;
    show();
  };
  let locked = false;
  const go = () => {
    if (locked || !/\d/.test(txt)) return;
    locked = true;
    say(`${txt}${t.unit ? ` ${t.unit}` : ''}`);
    submit({ kind: 'numeric', value: Number(txt.replace('−', '-').replace(',', '.')) });
  };
  const keys = ['7', '8', '9', '⌫', '4', '5', '6', 'OK', '1', '2', '3', '0', ',', '−'];
  const pad = h('div', { class: 'keys' }, ...keys.map((k) =>
    h('button', { type: 'button', class: k === 'OK' ? 'go' : '', onclick: () => (k === 'OK' ? go() : key(k)), 'aria-label': k === '⌫' ? 'Poista' : k === '−' ? 'Miinus' : k }, k)));
  const onKey = (e: KeyboardEvent) => {
    if (!host.isConnected) return document.removeEventListener('keydown', onKey);
    if (/^\d$/.test(e.key)) key(e.key);
    else if (e.key === ',' || e.key === '.') key(',');
    else if (e.key === 'Backspace') key('⌫');
    else if (e.key === '-') key('−');
    else if (e.key === 'Enter') go();
  };
  document.addEventListener('keydown', onKey);
  host.append(display, pad);
  return { reveal: () => { txt = fmt(t.answer).replace('-', '−'); show(); display.style.borderColor = 'var(--ok)'; } };
}

function plot(t: Extract<Task, { kind: 'plot' }>, host: HTMLElement, submit: Submit): Widget {
  const NS = 'http://www.w3.org/2000/svg';
  const x0 = t.xMin ?? 0, y0 = t.yMin ?? 0;
  const four = x0 < 0 || y0 < 0;
  const W = 340, H = four ? 330 : 272, L = four ? 20 : 44, B = four ? 20 : 36, T = 30, R = 14;
  const nx = (t.xMax - x0) / t.xStep, ny = (t.yMax - y0) / t.yStep;
  const px = (x: number) => L + ((x - x0) / (t.xMax - x0)) * (W - L - R);
  const py = (y: number) => H - B - ((y - y0) / (t.yMax - y0)) * (H - B - T);
  const board = document.createElementNS(NS, 'svg');
  const id = `plot-${++answerBoardId}`;
  board.setAttribute('viewBox', `0 0 ${W} ${H}`);
  board.setAttribute('class', 'board answer-board');
  board.setAttribute('width', '100%');
  board.setAttribute('tabindex', '0');
  board.setAttribute('role', 'group');
  board.setAttribute('aria-label', 'Koordinaatisto');
  board.setAttribute('aria-describedby', `${id}-help ${id}-state`);
  // Axis numbers sit next to the axes (at 0), or along the edges in the first quadrant only.
  const ax = four ? py(0) : H - B, ay = four ? px(0) : L;
  let grid = '';
  for (let i = 0; i <= nx; i++) {
    const v = x0 + i * t.xStep;
    grid += `<line x1="${px(v)}" y1="${py(y0)}" x2="${px(v)}" y2="${py(t.yMax)}" stroke="var(--line)"/>`;
    if (!(four && v === 0)) grid += `<text x="${px(v)}" y="${ax + 16}" text-anchor="middle" font-size="12" fill="currentColor">${String(v).replace('-', '−')}</text>`;
  }
  for (let j = 0; j <= ny; j++) {
    const v = y0 + j * t.yStep;
    grid += `<line x1="${px(x0)}" y1="${py(v)}" x2="${px(t.xMax)}" y2="${py(v)}" stroke="var(--line)"/>`;
    if (!(four && v === 0)) grid += `<text x="${ay - 6}" y="${py(v) + 4}" text-anchor="end" font-size="12" fill="currentColor">${String(v).replace('-', '−')}</text>`;
  }
  if (four) grid += `<text x="${px(0) - 6}" y="${py(0) + 16}" text-anchor="end" font-size="12" fill="currentColor">0</text>`;
  grid += `<text x="${W - R}" y="${(four ? py(0) : H) - 4 - (four ? 4 : 0)}" text-anchor="end" font-size="13" font-weight="700" fill="currentColor">${t.xLabel}</text><text x="${(four ? px(0) : L) + 6}" y="16" font-size="13" font-weight="700" fill="currentColor">${t.yLabel}</text>`;
  grid += `<line x1="${px(x0)}" y1="${py(Math.max(0, y0))}" x2="${px(t.xMax)}" y2="${py(Math.max(0, y0))}" stroke="currentColor" stroke-width="2"/><line x1="${px(Math.max(0, x0))}" y1="${py(y0)}" x2="${px(Math.max(0, x0))}" y2="${py(t.yMax)}" stroke="currentColor" stroke-width="2"/>`;
  // Optional given equations, clipped to the same grid. These contain no answer point.
  for (const line of t.referenceLines ?? []) {
    const { a, b, c, style } = line;
    const points: [number, number][] = [];
    const add = (x: number, y: number) => {
      const eps = 1e-8;
      if (Number.isFinite(x) && Number.isFinite(y) && x >= x0-eps && x <= t.xMax+eps && y >= y0-eps && y <= t.yMax+eps && !points.some(p => Math.abs(p[0]-x)<eps && Math.abs(p[1]-y)<eps)) points.push([x,y]);
    };
    if (b !== 0) { add(x0, (c-a*x0)/b); add(t.xMax, (c-a*t.xMax)/b); }
    if (a !== 0) { add((c-b*y0)/a, y0); add((c-b*t.yMax)/a, t.yMax); }
    const [start,end] = points;
    if (start && end) grid += `<line class="plot-reference" x1="${px(start[0])}" y1="${py(start[1])}" x2="${px(end[0])}" y2="${py(end[1])}" stroke="${style === 'blue' ? '#237486' : '#b04432'}" stroke-width="3" ${style === 'red' ? 'stroke-dasharray="7 4"' : ''}/>`;
  }
  board.innerHTML = grid;
  const marks = document.createElementNS(NS, 'g');
  board.append(marks);
  const pts = new Map<string, [number, number]>();
  let cx = Math.max(x0, Math.min(t.xMax, x0 + Math.round(-x0 / t.xStep) * t.xStep)), cy = Math.max(y0, Math.min(t.yMax, y0 + Math.round(-y0 / t.yStep) * t.yStep));
  const state = h('p', { id: `${id}-state`, class: 'answer-state small', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const label = (x: number, y: number) => `(${fmt(x)}; ${fmt(y)})`;
  const draw = (cls = 'var(--pond)') => {
    marks.innerHTML = [...pts.values()].map(([x, y]) => `<circle cx="${px(x)}" cy="${py(y)}" r="7" fill="${cls}"/>`).join('')
      + `<circle class="plot-cursor" cx="${px(cx)}" cy="${py(cy)}" r="11" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2"/>`;
    state.textContent = `Kohdistin ${label(cx, cy)}. ${pts.size ? `Merkityt pisteet: ${[...pts.values()].map(([x, y]) => label(x, y)).join(', ')}.` : 'Ei merkittyjä pisteitä.'}`;
  };
  let locked = false;
  const toggle = () => {
    if (locked) return;
    const k = `${cx},${cy}`;
    pts.has(k) ? pts.delete(k) : pts.set(k, [cx, cy]);
    draw();
  };
  const snap = (v: number) => Math.round(v * 1e6) / 1e6;
  board.addEventListener('keydown', (e) => {
    if (locked || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter', 'Backspace', 'Delete', 'Home'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === ' ' || e.key === 'Enter') { if (!e.repeat) toggle(); return; }
    if (e.key === 'Backspace' || e.key === 'Delete') pts.delete(`${cx},${cy}`);
    else if (e.key === 'Home') { cx = x0; cy = y0; }
    else {
      cx = snap(Math.max(x0, Math.min(t.xMax, cx + (e.key === 'ArrowRight' ? t.xStep : e.key === 'ArrowLeft' ? -t.xStep : 0))));
      cy = snap(Math.max(y0, Math.min(t.yMax, cy + (e.key === 'ArrowUp' ? t.yStep : e.key === 'ArrowDown' ? -t.yStep : 0))));
    }
    draw();
  });
  board.addEventListener('pointerdown', (e) => {
    if (locked) return;
    const matrix = board.getScreenCTM();
    if (!matrix) return;
    const point = board.createSVGPoint(); point.x = e.clientX; point.y = e.clientY;
    const { x: sx, y: sy } = point.matrixTransform(matrix.inverse());
    const x = x0 + Math.round(((sx - L) / (W - L - R)) * nx) * t.xStep;
    const y = y0 + Math.round(((H - B - sy) / (H - B - T)) * ny) * t.yStep;
    if (x < x0 || x > t.xMax || y < y0 || y > t.yMax) return;
    cx = snap(x); cy = snap(y);
    board.focus();
    toggle();
  });
  const done = btn(ICON.check, 'Valmis', () => { if (locked) return; locked = true; done.disabled = true; board.setAttribute('aria-disabled', 'true'); submit({ kind: 'plot', points: [...pts.values()] }); }, 'primary big wide');
  draw();
  host.append(h('div', { class: t.referenceLines?.length ? 'scene plot-with-references' : 'scene' }, board), h('p', { id: `${id}-help`, class: 'muted small' }, 'Napauta ruudukon risteystä.', h('span', { class: 'sr-only' }, ' Tai siirrä kohdistinta nuolinäppäimillä. Välilyönti tai Enter lisää tai poistaa pisteen; Delete poistaa kohdistetun pisteen. Lähetä vastaus Valmis-painikkeella.')), state, done);
  return {
    reveal: () => {
      const sol = solution(t) as Extract<Response, { kind: 'plot' }>;
      pts.clear();
      for (const p of sol.points) pts.set(p.join(), p);
      draw('var(--ok)');
    },
  };
}

/** Number line: tap a tick, a frog jumps there; then "Valmis". */
function numberLine(t: Extract<Task, { kind: 'line' }>, host: HTMLElement, submit: Submit): Widget {
  const W = 340, H = 96, L = 18, R = 18, Y = 58;
  const n = Math.round((t.max - t.min) / t.step);
  const px = (v: number) => L + ((v - t.min) / (t.max - t.min)) * (W - L - R);
  let every = t.labelEvery ?? t.step;
  while ((W - L - R) / ((t.max - t.min) / every) < (t.min < 0 ? 26 : 15)) every *= 2;
  const lab = (v: number) => String(Math.round(v * 1000) / 1000).replace('-', '−').replace('.', ',');
  let ticks = '';
  for (let i = 0; i <= n; i++) {
    const v = t.min + i * t.step;
    const big = Math.abs(v / every - Math.round(v / every)) < 1e-9;
    ticks += `<line x1="${px(v)}" y1="${Y - (big ? 10 : 6)}" x2="${px(v)}" y2="${Y + (big ? 10 : 6)}" stroke="currentColor" stroke-width="${v === 0 ? 3 : 2}"/>`;
    if (big) ticks += `<text x="${px(v)}" y="${Y + 30}" text-anchor="middle" font-size="14" font-weight="${v === 0 ? 800 : 600}" fill="currentColor">${lab(v)}</text>`;
  }
  const id = `line-${++answerBoardId}`;
  const board = h('div', { class: 'board line-board answer-board', tabindex: '0', role: 'slider', 'aria-label': 'Vastaus lukusuoralla', 'aria-valuemin': t.min, 'aria-valuemax': t.max, 'aria-describedby': `${id}-help ${id}-state`, html: `<svg viewBox="0 0 ${W} ${H}" width="100%" aria-hidden="true"><line x1="${L - 10}" y1="${Y}" x2="${W - R + 10}" y2="${Y}" stroke="currentColor" stroke-width="2.5"/><path d="M${W - R + 12} ${Y}l-8 -5v10z" fill="currentColor"/>${ticks}<g class="pick"></g></svg>` });
  const svgEl = board.querySelector('svg')!, pick = board.querySelector('.pick')!;
  let value: number | null = null, locked = false;
  const start = Math.max(t.min, Math.min(t.max, t.min + Math.round((0 - t.min) / t.step) * t.step));
  const state = h('p', { id: `${id}-state`, class: 'answer-state small', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const show = (v: number | null, color = 'var(--pond)') => {
    pick.innerHTML = v === null ? '' : `<circle cx="${px(v)}" cy="${Y}" r="9" fill="${color}"/><path d="M${px(v)} ${Y - 14}l-7 -12h14z" fill="${color}"/>`;
    board.setAttribute('aria-valuenow', String(v ?? start));
    board.setAttribute('aria-valuetext', v === null ? 'Ei vastausta' : `${lab(v)}${t.unit ? ` ${t.unit}` : ''}`);
    state.textContent = v === null ? 'Ei vastausta. Valitse kohta lukusuoralta.' : `Valittu ${lab(v)}${t.unit ? ` ${t.unit}` : ''}. Voit vielä siirtää merkkiä ennen Valmis-painiketta.`;
  };
  const select = (v: number) => {
    if (locked) return;
    value = Math.round(Math.max(t.min, Math.min(t.max, v)) * 1e6) / 1e6;
    show(value); done.disabled = false;
  };
  board.addEventListener('keydown', (e) => {
    if (locked || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', ' ', 'Enter'].includes(e.key)) return;
    e.preventDefault();
    const current = value ?? start;
    select(e.key === 'Home' ? t.min : e.key === 'End' ? t.max : current + (e.key === 'ArrowRight' || e.key === 'ArrowUp' ? t.step : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -t.step : 0));
  });
  board.addEventListener('pointerdown', (e) => {
    if (locked) return;
    const r = svgEl.getBoundingClientRect();
    const sx = ((e.clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(n, Math.round(((sx - L) / (W - L - R)) * n)));
    board.focus();
    select(t.min + i * t.step);
  });
  const done = btn(ICON.check, 'Valmis', () => { if (locked || value === null) return; locked = true; done.disabled = true; board.setAttribute('aria-disabled', 'true'); submit({ kind: 'line', value }); }, 'primary big wide');
  done.disabled = true;
  show(null);
  host.append(h('div', { class: 'scene' }, board), h('p', { id: `${id}-help`, class: 'muted small' }, 'Napauta lukusuoraa.', h('span', { class: 'sr-only' }, ' Tai valitse kohta nuolinäppäimillä. Home valitsee alun ja End lopun. Voit korjata valinnan ennen Valmis-painiketta.')), state, done);
  return { reveal: () => show(t.answer, 'var(--ok)') };
}

// ---------------------------------------------------------------- build from tokens
/** Tap reusable token buttons to build an expression or equation; equivalent forms pass. */
function build(t: Extract<Task, { kind: 'build' }>, host: HTMLElement, submit: Submit): Widget {
  const seq: string[] = [];
  let locked = false;
  const line = h('div', { class: 'display build-line', 'aria-live': 'polite' });
  const show = () => line.replaceChildren(...(seq.length ? seq.map((x) => h('span', { class: 'bt' }, x)) : [h('span', { class: 'unit' }, 'Napauta paloja')]));
  const add = (x: string) => { if (locked || seq.length >= (t.max ?? 12)) return; seq.push(x); say(x === '−' ? 'miinus' : x === '·' || x === '×' ? 'kertaa' : x === '=' ? 'on yhtä kuin' : x); show(); };
  const bank = h('div', { class: 'tray' }, ...t.tokens.map((x) => h('button', { type: 'button', class: 'token', onclick: () => add(x) }, x)));
  const ctl = h('div', { class: 'row', style: 'justify-content:center;gap:8px' },
    btn(ICON.replay, 'Poista viimeinen', () => { if (!locked) { seq.pop(); show(); } }, 'small'),
    btn(ICON.replay, 'Tyhjennä', () => { if (!locked) { seq.length = 0; show(); } }, 'small'));
  // After checking, the tiles and edit buttons look as locked as they are.
  const done = btn(ICON.check, 'Valmis', () => { if (locked || !seq.length) return; locked = true; for (const b of [...bank.children, ...ctl.children, done]) (b as HTMLButtonElement).disabled = true; submit({ kind: 'build', seq: [...seq] }); }, 'primary big wide');
  show();
  host.append(line, bank, ctl, done);
  return { reveal: () => { line.replaceChildren(h('span', { class: 'bt' }, t.target)); line.style.borderColor = 'var(--ok)'; } };
}

// ---------------------------------------------------------------- tally
/** Observations shown in order; the learner adds one mark per observation to its category. */
function tally(t: Extract<Task, { kind: 'tally' }>, host: HTMLElement, submit: Submit): Widget {
  const counts: Record<string, number> = Object.fromEntries(t.cats.map((c) => [c.key, 0]));
  let locked = false;
  const icon = (k: string) => t.cats.find((c) => c.key === k)?.icon ?? '?';
  const strip = h('div', { class: 'tally-strip', 'aria-label': 'Havainnot' }, ...t.items.map((k) => h('span', {}, icon(k))));
  const marks = (n: number) => '𝍸'.repeat(Math.floor(n / 5)) + '|'.repeat(n % 5);
  const rows = t.cats.map((c) => {
    const m = h('span', { class: 'tally-marks' });
    const upd = () => { m.textContent = marks(counts[c.key]!) || '–'; };
    upd();
    const row = h('div', { class: 'tally-row' },
      h('span', { class: 'tally-cat' }, `${c.icon} ${c.label}`), m,
      h('button', { type: 'button', class: 'token', 'aria-label': `Lisää merkki: ${c.label}`, onclick: () => { if (!locked) { counts[c.key]!++; upd(); say(c.label); } } }, '+ |'),
      h('button', { type: 'button', class: 'token', 'aria-label': `Pyyhi merkki: ${c.label}`, onclick: () => { if (!locked && counts[c.key]! > 0) { counts[c.key]!--; upd(); } } }, '−'));
    return { row, upd };
  });
  const done = btn(ICON.check, 'Valmis', () => { locked = true; done.disabled = true; submit({ kind: 'tally', counts: { ...counts } }); }, 'primary big wide');
  host.append(strip, h('div', { class: 'tally-table' }, ...rows.map((r) => r.row)), done);
  return { reveal: () => { for (const c of t.cats) counts[c.key] = t.items.filter((x) => x === c.key).length; rows.forEach((r) => r.upd()); } };
}

// ---------------------------------------------------------------- systematic list
/** Pick one from each group and add the pair to a list; duplicates and gaps are judged. */
function combos(t: Extract<Task, { kind: 'combos' }>, host: HTMLElement, submit: Submit): Widget {
  const pairs: [number, number][] = [];
  let ai: number | null = null, bi: number | null = null, locked = false;
  const listEl = h('ol', { class: 'combo-list' });
  const showList = () => listEl.replaceChildren(...pairs.map(([i, j], k) => h('li', {}, `${t.a[i]} + ${t.b[j]} `,
    h('button', { type: 'button', class: 'linklike small', 'aria-label': 'Poista rivi', onclick: () => { if (!locked) { pairs.splice(k, 1); showList(); } } }, '✕'))));
  const group = (items: string[], label: string, set: (i: number) => void) => {
    const bs = items.map((x, i) => h('button', { type: 'button', class: 'token', onclick: () => { if (locked) return; set(i); bs.forEach((b, k) => b.classList.toggle('sel', k === i)); say(x); } }, x));
    return { el: h('div', {}, h('p', { class: 'combo-label' }, label[0]!.toUpperCase() + label.slice(1)), h('div', { class: 'tray' }, ...bs)), bs };
  };
  const A = group(t.a, t.aLabel, (i) => (ai = i)), B = group(t.b, t.bLabel, (i) => (bi = i));
  const add = btn(ICON.next, 'Lisää listaan', () => {
    if (locked || ai === null || bi === null) return;
    pairs.push([ai, bi]); showList();
    ai = bi = null; [...A.bs, ...B.bs].forEach((b) => b.classList.remove('sel'));
  }, 'big wide');
  const done = btn(ICON.check, 'Lista on valmis', () => { locked = true; done.disabled = true; submit({ kind: 'combos', pairs: pairs.map((p) => [...p] as [number, number]) }); }, 'primary big wide');
  host.append(A.el, B.el, add, listEl, done);
  return { reveal: () => { pairs.length = 0; t.a.forEach((_, i) => t.b.forEach((_, j) => pairs.push([i, j]))); showList(); } };
}

// ---------------------------------------------------------------- fraction entry
function fracEntry(t: Extract<Task, { kind: 'frac' }>, host: HTMLElement, submit: Submit): Widget {
  const v = { n: '', d: '' };
  let at: 'n' | 'd' = 'n', locked = false;
  const nEl = h('button', { type: 'button', class: 'frac-cell' }), dEl = h('button', { type: 'button', class: 'frac-cell' });
  const show = () => {
    nEl.textContent = v.n || '?'; dEl.textContent = v.d || '?';
    nEl.classList.toggle('sel', at === 'n'); dEl.classList.toggle('sel', at === 'd');
  };
  nEl.onclick = () => { at = 'n'; show(); };
  dEl.onclick = () => { at = 'd'; show(); };
  const key = (k: string) => {
    if (locked) return;
    if (k === '⌫') v[at] = v[at].slice(0, -1);
    else if (k === '↕') at = at === 'n' ? 'd' : 'n';
    else if (v[at].length < 4) v[at] += k;
    show();
  };
  const go = () => {
    if (locked || !v.n || !v.d) return;
    locked = true;
    say(`${v.n} per ${v.d}`);
    submit({ kind: 'frac', n: Number(v.n), d: Number(v.d) });
  };
  const keys = ['7', '8', '9', '⌫', '4', '5', '6', 'OK', '1', '2', '3', '0', '↕'];
  const pad = h('div', { class: 'keys' }, ...keys.map((k) =>
    h('button', { type: 'button', class: k === 'OK' ? 'go' : '', onclick: () => (k === 'OK' ? go() : key(k)), 'aria-label': k === '⌫' ? 'Poista' : k === '↕' ? 'Vaihda osoittaja tai nimittäjä' : k }, k)));
  show();
  host.append(h('div', { class: 'display frac-entry' }, h('span', { class: 'frac-stack' }, nEl, h('span', { class: 'frac-bar' }), dEl)), pad);
  return { reveal: () => { v.n = String(t.n); v.d = String(t.d); show(); } };
}

// ---------------------------------------------------------------- measuring by laying unit pieces
function iterate(t: Extract<Task, { kind: 'iterate' }>, host: HTMLElement, submit: Submit): Widget {
  const U = 30, max = t.len + 2, W = max * U + 16, H = 96;
  let n = 0, locked = false, fresh = false;
  const pic = h('div', { class: 'scene' });
  const draw = () => {
    let s = `<rect x="8" y="10" width="${t.len * U}" height="26" rx="7" fill="var(--blue)"/>` +
      `<line x1="${8 + t.len * U}" y1="4" x2="${8 + t.len * U}" y2="${H - 4}" stroke="currentColor" stroke-dasharray="3 4" opacity=".6"/>`;
    for (let k = 0; k < n; k++) {
      const over = k >= t.len && locked;
      const drop = fresh && k === n - 1 ? '<animateTransform attributeName="transform" type="translate" from="0 -26" to="0 0" dur="0.22s"/>' : '';
      s += `<g><rect x="${8 + k * U + 2}" y="46" width="${U - 4}" height="22" rx="4" fill="${over ? 'var(--red)' : 'var(--sun)'}" stroke="#b08a10"/>` +
        `<text x="${8 + k * U + U / 2}" y="62" text-anchor="middle" font-size="13" font-weight="800" fill="#3a2a00">${k + 1}</text>${drop}</g>`;
    }
    pic.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Nauha ja ${n} palaa">${s}</svg>`;
    fresh = false;
  };
  const add = btn('', '＋ Lisää pala', () => { if (locked || n >= max) return; n++; fresh = true; say(String(n)); draw(); }, 'big');
  const undo = btn(ICON.undo, 'Ota pala pois', () => { if (locked || n === 0) return; n--; draw(); }, 'small');
  const done = btn(ICON.check, 'Valmis', () => {
    if (locked || n === 0) return;
    locked = true; [add, undo, done].forEach((b) => ((b as HTMLButtonElement).disabled = true)); draw();
    submit({ kind: 'iterate', count: n });
  }, 'primary big wide');
  draw();
  host.append(pic, h('p', { class: 'muted small' }, 'Lisää paloja peräkkäin, kunnes ne ulottuvat nauhan loppuun.'), h('div', { class: 'row' }, add, undo), done);
  return { reveal: () => { n = t.len; draw(); } };
}

// ---------------------------------------------------------------- set the clock in half-hour steps
function setClock(t: Extract<Task, { kind: 'clock' }>, host: HTMLElement, submit: Submit): Widget {
  let target = ((t.start ?? 12) % 12) * 60, shown = target, locked = false, raf = 0;
  const pic = h('div', { class: 'scene', style: 'justify-content:center' });
  const read = h('p', { class: 'muted small', 'aria-live': 'polite', style: 'text-align:center' });
  const hm = (v: number) => { const x = ((v % 720) + 720) % 720; return { h: Math.floor(x / 60) || 12, m: x % 60 }; };
  const draw = () => {
    const { h: hh } = hm(shown), m = ((shown % 60) + 60) % 60;
    pic.innerHTML = `<svg viewBox="0 0 160 160" width="190" role="img" aria-label="Kello">${clockBody(hh % 12, m, 160)}</svg>`;
  };
  const go = (d: number) => {
    if (locked) return;
    target += d;
    const from = shown, t0 = performance.now();
    cancelAnimationFrame(raf);
    const step = (now: number) => { const k = Math.min(1, (now - t0) / 380); shown = from + (target - from) * k * (2 - k); draw(); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    const { h: hh, m } = hm(target);
    read.textContent = `${hh}.${m ? '30' : '00'}`;
  };
  const back = btn('', '↺ 30 min', () => go(-30), 'big');
  const fwd = btn('', '30 min ↻', () => go(30), 'big');
  const done = btn(ICON.check, 'Valmis', () => {
    if (locked) return;
    locked = true; [back, fwd, done].forEach((b) => ((b as HTMLButtonElement).disabled = true));
    cancelAnimationFrame(raf); shown = target; draw();
    const { h: hh, m } = hm(target);
    submit({ kind: 'clock', h: hh, m });
  }, 'primary big wide');
  draw();
  const { h: h0 } = hm(target); read.textContent = `${h0}.00`;
  host.append(pic, read, h('p', { class: 'muted small' }, 'Käännä viisareita. Molemmat viisarit liikkuvat yhdessä, kuten oikeassa kellossa.'), h('div', { class: 'row' }, back, fwd), done);
  return { reveal: () => { target = (t.h % 12) * 60 + t.m; shown = target; draw(); } };
}

// ---------------------------------------------------------------- deal a pile to Loikka and Aava
function deal(t: Extract<Task, { kind: 'deal' }>, host: HTMLElement, submit: Submit): Widget {
  const W = 320, H = 200, S = 24, draw1 = THINGS[t.thing]!.draw;
  const log: ('L' | 'R')[] = [];
  let locked = false;
  const pic = h('div', { class: 'scene' });
  const at = (side: 'L' | 'R', i: number) => ({ x: (side === 'L' ? W * 0.25 : W * 0.75) - S * 1.1 + (i % 3) * S * 1.1, y: 138 - Math.floor(i / 3) * S });
  const pileAt = (i: number) => ({ x: W / 2 + ((i % 2) - 0.5) * S * 0.9, y: 60 + Math.floor(i / 2) * S * 0.75 });
  const draw = () => {
    const a = log.filter((x) => x === 'L').length, b = log.length - a, left = t.n - log.length;
    let s = frog(W * 0.25, 30, 18) + duck(W * 0.75, 30, 16);
    for (let i = 0; i < left; i++) { const q = pileAt(i); s += draw1(q.x, q.y, S); }
    let ia = 0, ib = 0;
    log.forEach((side, k) => {
      const q = at(side, side === 'L' ? ia++ : ib++);
      const from = pileAt(left), fly = k === log.length - 1
        ? `<animateTransform attributeName="transform" type="translate" from="${from.x - q.x} ${from.y - q.y}" to="0 0" dur="0.3s"/>` : '';
      s += `<g>${draw1(q.x, q.y, S)}${fly}</g>`;
    });
    const col = (_v: number) => (locked && (a !== b || left > 0) ? 'var(--red)' : 'currentColor');
    s += `<text x="${W * 0.25}" y="${H - 6}" text-anchor="middle" font-size="18" font-weight="800" fill="${col(a)}">${a}</text>` +
      `<text x="${W * 0.75}" y="${H - 6}" text-anchor="middle" font-size="18" font-weight="800" fill="${col(b)}">${b}</text>`;
    pic.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Loikalla ${a}, Aavalla ${b}, kasassa ${left}">${s}</svg>`;
  };
  const give = (side: 'L' | 'R') => {
    if (locked || log.length >= t.n) return;
    log.push(side); draw();
    const a = log.filter((x) => x === 'L').length;
    say(side === 'L' ? `Loikalle ${a}` : `Aavalle ${log.length - a}`);
  };
  const toL = btn('', '🐸 Loikalle', () => give('L'), 'big');
  const toR = btn('', '🐥 Aavalle', () => give('R'), 'big');
  const undo = btn(ICON.undo, 'Peru', () => { if (locked || !log.length) return; log.pop(); draw(); }, 'small');
  const done = btn(ICON.check, 'Valmis', () => {
    if (locked || !log.length) return;
    locked = true; [toL, toR, undo, done].forEach((b) => ((b as HTMLButtonElement).disabled = true)); draw();
    const a = log.filter((x) => x === 'L').length;
    submit({ kind: 'deal', a, b: log.length - a });
  }, 'primary big wide');
  draw();
  host.append(pic, h('p', { class: 'muted small' }, 'Napauta, kenelle seuraava annetaan. Jaa koko kasa niin, että kummallekin tulee yhtä monta.'), h('div', { class: 'row' }, toL, toR, undo), done);
  return { reveal: () => { log.length = 0; for (let i = 0; i < t.n; i++) log.push(i % 2 ? 'R' : 'L'); draw(); } };
}

// ---------------------------------------------------------------- pack equal bags
function pack(t: Extract<Task, { kind: 'pack' }>, host: HTMLElement, submit: Submit): Widget {
  const W = 320, H = 180, G = bagGeo(t.k, W), S = 20, draw1 = THINGS[t.thing]!.draw;
  const counts: number[] = Array(t.k).fill(0), log: number[] = [];
  let locked = false, fresh = -1;
  const pic = h('div', { class: 'scene' });
  const left = () => (t.pile ?? Infinity) - log.length;
  const draw = () => {
    let s = '';
    for (let i = 0; i < t.k; i++) {
      s += `<g data-bag="${i}" style="cursor:pointer">${G.bag(i)}<rect x="${G.x0(i)}" y="20" width="${G.bw}" height="150" fill="transparent"/>`;
      for (let q = 0; q < counts[i]!; q++) {
        const p = G.spot(i, q), fly = fresh === i && q === counts[i]! - 1 ? '<animateTransform attributeName="transform" type="translate" from="0 -60" to="0 0" dur="0.25s"/>' : '';
        s += `<g>${draw1(p.x, p.y, S)}${fly}</g>`;
      }
      const bad = locked && counts[i] !== t.g;
      s += `<text x="${G.x0(i) + G.bw / 2}" y="58" text-anchor="middle" font-size="18" font-weight="800" fill="${bad ? 'var(--red)' : 'currentColor'}">${counts[i]}</text></g>`;
    }
    if (t.pile) s += `<text x="${W / 2}" y="22" text-anchor="middle" font-size="14" fill="currentColor">Kasassa ${left()}</text>`;
    pic.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Pussit: ${counts.join(', ')}">${s}</svg>`;
    fresh = -1;
  };
  const add = (i: number) => {
    if (locked || left() <= 0 || counts[i]! >= 8) return;
    counts[i]!++; log.push(i); fresh = i; draw(); say(String(counts[i]));
  };
  pic.addEventListener('click', (e) => {
    const g = (e.target as Element).closest('[data-bag]');
    if (g) add(Number(g.getAttribute('data-bag')));
  });
  const bagBtns = Array.from({ length: t.k }, (_, i) => btn('', `＋ pussiin ${i + 1}`, () => add(i), 'small'));
  const undo = btn(ICON.undo, 'Peru', () => { if (locked || !log.length) return; counts[log.pop()!]!--; draw(); }, 'small');
  const done = btn(ICON.check, 'Valmis', () => {
    if (locked || !log.length) return;
    locked = true; [...bagBtns, undo, done].forEach((b) => ((b as HTMLButtonElement).disabled = true)); draw();
    submit({ kind: 'pack', counts: [...counts] });
  }, 'primary big wide');
  draw();
  host.append(pic, h('p', { class: 'muted small' }, 'Napauta pussia, niin siihen putoaa yksi.'), h('div', { class: 'row' }, ...bagBtns, undo), done);
  return { reveal: () => { counts.fill(t.g); draw(); } };
}

// ---------------------------------------------------------------- quotition: fill bags until the pile runs out
function bagup(t: Extract<Task, { kind: 'bagup' }>, host: HTMLElement, submit: Submit): Widget {
  const q = t.n / t.g, max = q + 1;
  let bags = 0, over = false, locked = false, raf = 0;
  const pic = h('div', { class: 'scene' });
  const draw = (p = 1) => {
    const b = p < 1 ? bags - 1 : bags;
    pic.innerHTML = `<svg viewBox="0 0 320 200" width="100%" role="img" aria-label="${bags} pussia, kasassa ${Math.max(0, t.n - bags * t.g)}">${bagupFrame(t.thing, t.n, t.g, b, p < 1 ? p : 0, over, max)}</svg>`;
  };
  const fill = () => {
    if (locked || over) return;
    if (t.n - bags * t.g < t.g) { over = true; draw(); say('Ei riitä'); return; }
    bags++; say(String(bags));
    const t0 = performance.now(); cancelAnimationFrame(raf);
    const step = (now: number) => { const k = Math.min(1, (now - t0) / 450); draw(k < 1 ? Math.max(0.01, k * (2 - k)) : 1); if (k < 1) raf = requestAnimationFrame(step); };
    draw(0.01); raf = requestAnimationFrame(step);
  };
  const add = btn('', `＋ Täytä pussi (${t.g})`, fill, 'big');
  const undo = btn(ICON.undo, 'Peru', () => { if (locked) return; cancelAnimationFrame(raf); if (over) over = false; else if (bags) bags--; draw(); }, 'small');
  const done = btn(ICON.check, 'Valmis', () => {
    if (locked || (!bags && !over)) return;
    locked = true; cancelAnimationFrame(raf); [add, undo, done].forEach((b) => ((b as HTMLButtonElement).disabled = true)); draw();
    submit({ kind: 'bagup', count: bags + (over ? 1 : 0) });
  }, 'primary big wide');
  draw();
  host.append(pic, h('p', { class: 'muted small' }, `Täytä pusseja, ${t.g} kerrallaan, kunnes kasa on tyhjä. Paina sitten Valmis.`), h('div', { class: 'row' }, add, undo), done);
  return { reveal: () => { bags = q; over = false; draw(); } };
}

// ---------------------------------------------------------------- build a tower k times as tall
function balance(t: Extract<Task, { kind: 'balance' }>, host: HTMLElement, submit: Submit): Widget {
  const L = t.left.reduce((x, y) => x + y, 0), R = t.right.reduce((x, y) => x + y, 0), max = L + 4;
  let n = 0, locked = false, shown = Math.sign(R - L);
  const pic = h('div', { class: 'scene' });
  const label = (parts: number[], extra?: string) => parts.concat([]).map(String).concat(extra === undefined ? [] : [extra]).join(' + ');
  const paintAt = (tilt: number) => {
    const ok = R + n === L, bad = locked && !ok;
    const items = (k: number) => Array.from({ length: k }, () => 'kivi');
    const s = balanceBody(items(L), items(R + n), tilt) +
      `<text x="42" y="212" text-anchor="start" font-size="17" font-weight="800" fill="currentColor">${label(t.left)}</text>` +
      `<text x="258" y="212" text-anchor="end" font-size="17" font-weight="800" fill="${bad ? 'var(--red)' : 'currentColor'}">${label(t.right, String(n))}</text>` +
      `<text x="150" y="212" text-anchor="middle" font-size="22" font-weight="900" fill="${ok ? 'var(--pond)' : '#d9534f'}">${ok ? '=' : '≠'}</text>`;
    pic.innerHTML = `<svg viewBox="0 0 300 220" width="100%" style="max-height:300px" role="img" aria-label="Vaaka: vasemmalla ${L}, oikealla ${R + n}">${s}</svg>`;
  };
  const draw = () => {
    const goal = Math.sign(R + n - L), from = shown;
    shown = goal; paintAt(goal);
    if (from === goal) return;
    const t0 = performance.now();
    const step = (now: number) => { const p = Math.min(1, (now - t0) / 350); if (shown !== goal) return; paintAt(from + (goal - from) * (1 - (1 - p) ** 2)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const add = btn('', '＋ kivi', () => { if (locked || n >= max) return; n++; draw(); say(String(n)); }, 'big');
  const sub = btn('', '－ kivi', () => { if (locked || !n) return; n--; draw(); }, 'small');
  const done = btn(ICON.check, 'Valmis', () => {
    if (locked) return;
    locked = true; [add, sub, done].forEach((b) => ((b as HTMLButtonElement).disabled = true)); draw();
    submit({ kind: 'balance', n });
  }, 'primary big wide');
  draw();
  host.append(pic, h('p', { class: 'muted small' }, 'Lisää kiviä oikealle, kunnes vaaka on suorassa.'), h('div', { class: 'row' }, add, sub), done);
  return { reveal: () => { n = L - R; draw(); } };
}

// ---------------------------------------------------------------- build an order from bundles and loose reeds
function reeds(task: Extract<Task, { kind: 'reeds' }>, host: HTMLElement, submit: Submit): Widget {
  const T0 = Math.floor(task.target / 10), W = task.tens ?? T0;
  let t = task.tens !== undefined ? T0 : task.from ? Math.floor(task.from / 10) : 0, o = task.tens !== undefined ? task.target % 10 : task.from ? task.from % 10 : 0, locked = false;
  const pic = h('div', { class: 'scene' });
  const draw = () => {
    let s = '';
    for (let b = 0; b < t; b++) { const x = 20 + b * 30; for (let k = 0; k < 10; k++) s += `<rect x="${x - 11 + (k % 5) * 4.4 + (k > 4 ? 2 : 0)}" y="${14 + (k > 4 ? 3 : 0)}" width="3.4" height="80" rx="1.6" fill="#8fae5d"/>`; s += `<rect x="${x - 13}" y="50" width="26" height="9" rx="3" fill="var(--red)"/>`; }
    const x0 = 20 + t * 30 + (t ? 6 : -8);
    for (let j = 0; j < o; j++) { const x = x0 + j * 10; s += `<rect x="${x - 2}" y="14" width="4" height="80" rx="2" fill="#8fae5d"/><ellipse cx="${x}" cy="14" rx="3" ry="6" fill="#8a5a33"/>`; }
    const VW = Math.max(300, x0 + o * 10 + 8);
    s += `<text x="12" y="122" font-size="14" font-weight="800" fill="var(--red)">${t} ${t === 1 ? 'nippu' : 'nippua'}</text><text x="${VW - 12}" y="122" text-anchor="end" font-size="14" font-weight="800" fill="#4f7a2b">${o} ${o === 1 ? 'irtokaisla' : 'irtokaislaa'}</text>`;
    pic.innerHTML = `<svg viewBox="0 0 ${VW} 132" width="100%" style="max-height:200px" role="img" aria-label="${t} nippua ja ${o} irtokaislaa">${s}</svg>`;
  };
  const b1 = btn('', '＋ nippu', () => { if (locked || t >= 9) return; t++; draw(); say(word(t * 10)); }, 'big');
  const b2 = btn('', '－ nippu', () => { if (locked || !t) return; t--; draw(); }, 'small');
  const b3 = btn('', '＋ kaisla', () => { if (locked || o >= 19) return; o++; draw(); say(String(o)); }, 'big');
  const b4 = btn('', '－ kaisla', () => { if (locked || !o) return; o--; draw(); }, 'small');
  const b5 = btn('', 'Avaa nippu', () => { if (locked || !t || o > 9) return; t--; o += 10; draw(); say(`${o} irtokaislaa`); });
  const b6 = btn('', 'Sido nippu', () => { if (locked || o < 10 || t >= 9) return; t++; o -= 10; draw(); say(`${t} nippua`); });
  const done = btn(ICON.check, 'Valmis', () => {
    if (locked || (!t && !o)) return;
    locked = true; [b1, b2, b3, b4, b5, b6, done].forEach((b) => ((b as HTMLButtonElement).disabled = true));
    submit({ kind: 'reeds', t, o });
  }, 'primary big wide');
  draw();
  const note = task.from && task.from > task.target ? `Rannalla on ${task.from} kaislaa. Ota pois ${task.from - task.target}. Jos irtokaislat eivät riitä, avaa nippu.` : task.from ? `Lautalla on ${task.from} kaislaa. Tuo lisää ${task.target - task.from}: niput ja irtokaislat. Jos irtokaisloja tulee kymmenen, sido nippu.` : task.tens !== undefined ? `Luku ${task.target}. Avaa nippuja niin, että nippuja on ${W}. Luku ei saa muuttua.` : `Tilaus: ${task.target} kaislaa. Kokoa se nipuista ja irtokaisloista.`;
  host.append(pic, h('p', { class: 'muted small' }, note), h('div', { class: 'row' }, b1, b2, b3, b4), h('div', { class: 'row' }, b5, b6), done);
  return { reveal: () => { t = W; o = task.target - W * 10; draw(); } };
}

// ---------------------------------------------------------------- build a rows × cols array
function grid(task: Extract<Task, { kind: 'grid' }>, host: HTMLElement, submit: Submit): Widget {
  let rows = 1, cols = 1, locked = false;
  const pic = h('div', { class: 'scene' }), U = 28;
  const draw = () => {
    let s = '';
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) s += THINGS[task.thing]!.draw(14 + U / 2 + j * U, 10 + U / 2 + i * U, 24);
    const W = Math.max(300, 28 + 10 * U), H = 10 + 6 * U + 34;
    s += `<text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="16" font-weight="800" fill="currentColor">${rows} ${rows === 1 ? 'rivi' : 'riviä'}, jokaisessa ${cols}</text>`;
    pic.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:300px" role="img" aria-label="${rows} riviä, jokaisessa ${cols}">${s}</svg>`;
  };
  const b1 = btn('', '＋ rivi', () => { if (locked || rows >= 6) return; rows++; draw(); say(`${rows} riviä`); }, 'big');
  const b2 = btn('', '－ rivi', () => { if (locked || rows <= 1) return; rows--; draw(); }, 'small');
  const b3 = btn('', '＋ jokaiseen', () => { if (locked || cols >= 10) return; cols++; draw(); say(`${cols} jokaisessa`); }, 'big');
  const b4 = btn('', '－ jokaisesta', () => { if (locked || cols <= 1) return; cols--; draw(); }, 'small');
  const done = btn(ICON.check, 'Valmis', () => {
    if (locked) return;
    locked = true; [b1, b2, b3, b4, done].forEach((b) => ((b as HTMLButtonElement).disabled = true));
    submit({ kind: 'grid', rows, cols });
  }, 'primary big wide');
  draw();
  host.append(pic, h('p', { class: 'muted small' }, `Rakenna rivistö: ${task.rows} riviä, joissa jokaisessa on ${task.cols}.`), h('div', { class: 'row' }, b1, b2), h('div', { class: 'row' }, b3, b4), done);
  return { reveal: () => { rows = task.rows; cols = task.cols; draw(); } };
}

// ---------------------------------------------------------------- pour one vessel into the other
function pourtest(task: Extract<Task, { kind: 'pourtest' }>, host: HTMLElement, submit: Submit): Widget {
  const { a, b, capA, capB, la, lb } = task, Cap = (x: string) => x[0]!.toUpperCase() + x.slice(1);
  let locked = false, stop: (() => void) | void;
  const pic = h('div', { class: 'scene' });
  const play = (fwd: boolean) => {
    if (locked) return;
    if (stop) stop();
    pic.innerHTML = '';
    const [x, y, cx, cy, lx, ly] = fwd ? [a, b, capA, capB, la, lb] : [b, a, capB, capA, lb, la];
    const v = cx > cy ? `Vettä valui yli: ${ly} oli liian pieni.` : cx < cy ? `${Cap(ly)} ei tullut täyteen.` : `${Cap(ly)} tuli juuri täyteen.`;
    stop = pourScene(x, y, cx, cy, lx, ly, v)(pic);
  };
  const tries = [btn('', `Kaada ${la} → ${lb}`, () => play(true), 'big'), btn('', `Kaada ${lb} → ${la}`, () => play(false), 'big')];
  const picks = [Cap(la), Cap(lb), 'Yhtä paljon'].map((t, i) => btn('', t, () => {
    if (locked) return;
    locked = true; [...tries, ...picks].forEach((x) => ((x as HTMLButtonElement).disabled = true));
    submit({ kind: 'pourtest', pick: i });
  }, 'primary'));
  const cfg = pourScene(a, b, capA, capB, la, lb, '').__anim!;
  pic.innerHTML = `<svg viewBox="0 0 ${cfg.w} ${cfg.h}" width="100%" style="max-height:260px" role="img" aria-label="${la} ja ${lb}">${cfg.frame(0).replace(/>[^<]*täynnä[^<]*</, '><')}</svg>`;
  host.append(pic, h('p', { class: 'muted small' }, 'Kokeile kaatamalla. Täysi astia kaadetaan aina tyhjään.'), h('div', { class: 'row' }, ...tries), h('p', { class: 'small' }, 'Kumpaan mahtuu enemmän?'), h('div', { class: 'row' }, ...picks));
  return { reveal: () => play(capA >= capB) };
}

// ---------------------------------------------------------------- build a weight on a kitchen scale
function sort(task: Extract<Task, { kind: 'sort' }>, host: HTMLElement, submit: Submit): Widget {
  const bins = task.items.map(() => -1);
  let sel = -1, locked = false;
  const tray = h('div', { class: 'tray', 'aria-label': 'Lajiteltavat' });
  const items = task.items.map((o, i) => h('button', { class: 'token', type: 'button', 'aria-label': labelOf(o), onclick: (e: Event) => { e.stopPropagation(); pickItem(i); } }, ...optBody(o)) as HTMLButtonElement);
  const boxes = task.cats.map(() => h('div', { class: 'row', style: 'justify-content:center;gap:6px;min-height:60px' }));
  const binEls = task.cats.map((c, b) => h('div', { class: 'slot', role: 'button', tabindex: '0', onclick: () => drop(b) },
    h('div', { class: 'lbl' }, c.art ? h('span', { html: c.art }) : null, h('span', {}, c.label)), boxes[b]!));
  binEls.forEach((el, b) => keyboardAction(el, () => drop(b)));
  const done = btn(ICON.check, 'Valmis', () => {
    if (locked || bins.some((b) => b < 0)) return;
    locked = true; items.forEach((b) => (b.disabled = true)); (done as HTMLButtonElement).disabled = true;
    submit({ kind: 'sort', bins: [...bins] });
  }, 'primary big wide') as HTMLButtonElement;
  function pickItem(i: number) {
    if (locked) return;
    sel = sel === i ? -1 : i;
    if (sel >= 0) say(labelOf(task.items[i]!));
    items.forEach((b, k) => b.classList.toggle('sel', k === sel));
    binEls.forEach((el) => el.classList.toggle('armed', sel >= 0));
  }
  function drop(b: number) {
    if (locked || sel < 0) return;
    const el = items[sel]!, from = el.getBoundingClientRect();
    bins[sel] = b; sel = -1;
    layout();
    const to = el.getBoundingClientRect();
    el.animate?.([{ transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)` }, { transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.3,.7,.4,1)' });
    say(task.cats[b]!.label);
  }
  function layout() {
    items.forEach((b) => b.classList.remove('sel'));
    binEls.forEach((el) => el.classList.remove('armed'));
    tray.replaceChildren(...items.filter((_, i) => bins[i]! < 0));
    boxes.forEach((box, b) => box.replaceChildren(...items.filter((_, i) => bins[i] === b)));
    done.disabled = bins.some((b) => b < 0);
    tray.style.display = bins.every((b) => b >= 0) ? 'none' : '';
  }
  layout();
  host.append(tray, h('p', { class: 'muted small' }, task.items.every((o) => !o.art) ? 'Napauta korttia ja sitten laatikkoa.' : 'Napauta kuvaa ja sitten laatikkoa.'), h('div', { class: 'slots', style: `--cols:${task.cats.length}` }, ...binEls), done);
  return {
    reveal: () => {
      const moved = task.answer.map((a, i) => bins[i] !== a);
      task.answer.forEach((a, i) => (bins[i] = a));
      layout(); items.forEach((b, i) => b.classList.toggle('sel', moved[i]!));
    },
  };
}

function extend(task: Extract<Task, { kind: 'extend' }>, host: HTMLElement, submit: Submit): Widget {
  const lab = (o: Option) => labelOf(o) || o.quiet || 'kuva';
  const picks: number[] = task.answer.map(() => -1);
  let locked = false;
  const cellStyle = 'min-width:46px;min-height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;padding:2px';
  const shown = task.shown.map((o) => h('span', { class: 'pat', style: cellStyle, 'aria-label': lab(o) }, ...optBody(o)));
  const cells = task.answer.map((_, k) => h('button', { type: 'button', class: 'token', style: `${cellStyle};border-style:dashed`, 'aria-label': `Tyhjä paikka ${k + 1}`, onclick: () => clear(k) }) as HTMLButtonElement);
  const pal = task.palette.map((o, j) => h('button', { type: 'button', class: 'token', 'aria-label': lab(o), onclick: () => put(j) }, ...optBody(o)) as HTMLButtonElement);
  const done = btn(ICON.check, 'Valmis', () => {
    if (locked || picks.some((p) => p < 0)) return;
    locked = true; [...pal, ...cells].forEach((b) => (b.disabled = true)); (done as HTMLButtonElement).disabled = true;
    submit({ kind: 'extend', picks: [...picks] });
  }, 'primary big wide') as HTMLButtonElement;
  function paintCell(k: number) {
    const c = cells[k]!, p = picks[k]!;
    c.replaceChildren(...(p >= 0 ? optBody(task.palette[p]!) : [h('b', { style: 'color:var(--soft);font-size:22px' }, '?')]).filter((x): x is HTMLElement => !!x));
    c.style.borderStyle = p >= 0 ? 'solid' : 'dashed';
    c.setAttribute('aria-label', p >= 0 ? lab(task.palette[p]!) : `Tyhjä paikka ${k + 1}`);
    done.disabled = picks.some((x) => x < 0);
  }
  function put(j: number) {
    if (locked) return;
    const k = picks.indexOf(-1);
    if (k < 0) return;
    picks[k] = j; paintCell(k); say(lab(task.palette[j]!));
    cells[k]!.animate?.([{ transform: 'translateY(-26px) scale(.6)', opacity: 0.3 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'cubic-bezier(.3,.7,.4,1.3)' });
  }
  function clear(k: number) {
    if (locked || picks[k]! < 0) return;
    picks[k] = -1; paintCell(k);
  }
  cells.forEach((_, k) => paintCell(k));
  host.append(h('div', { class: 'row patrow', style: 'flex-wrap:wrap;justify-content:center;gap:4px;padding:8px;border-radius:var(--radius);background:var(--pond-soft)' }, ...shown, ...cells),
    h('p', { class: 'muted small' }, 'Napauta kuvaa: se menee seuraavaan tyhjään paikkaan. Napauta paikkaa, niin se tyhjenee.'),
    h('div', { class: 'row', style: 'justify-content:center;gap:10px' }, ...pal), done);
  return {
    reveal: () => {
      task.answer.forEach((a, k) => { const moved = picks[k] !== a; picks[k] = a; paintCell(k); cells[k]!.classList.toggle('sel', moved); });
    },
  };
}

function fill(task: Extract<Task, { kind: 'fill' }>, host: HTMLElement, submit: Submit): Widget {
  let dl = 0, busy = false, locked = false, queued = 0;
  const pic = h('div', { class: 'scene' });
  const paintAt = (v: number, tilt = 0, cup = 1, stream = false) => {
    pic.innerHTML = `<svg viewBox="0 0 300 230" width="100%" style="max-height:290px" role="img" aria-label="Mittakannu: ${dl} desilitraa">${jugBody(v, task.cap, tilt, cup, stream)}<text x="40" y="150" text-anchor="middle" font-size="26" font-weight="900" fill="currentColor">${Math.round(v)} dl</text></svg>`;
  };
  const run = (dir: 1 | -1) => {
    if (busy && dir > 0 && !locked) { queued++; return; }
    if (locked || busy || (dir < 0 && dl <= 0) || (dir > 0 && dl >= task.cap)) return;
    busy = true;
    const from = dl, t0 = performance.now(), D = dir > 0 ? 700 : 350;
    const step = (now: number) => {
      const f = Math.min(1, (now - t0) / D);
      if (dir > 0) {
        const tilt = f < 0.3 ? f / 0.3 : f < 0.75 ? 1 : 1 - (f - 0.75) / 0.25, pour = Math.min(1, Math.max(0, (f - 0.3) / 0.45));
        paintAt(from + pour, tilt, 1 - pour, f > 0.3 && f < 0.75);
      } else paintAt(from - f);
      if (f < 1) requestAnimationFrame(step);
      else { dl = from + dir; busy = false; paintAt(dl); say(`${dl} desilitraa`); if (queued > 0) { queued--; run(1); } }
    };
    requestAnimationFrame(step);
  };
  const add = btn('', '＋ 1 dl', () => run(1), 'big'), sub = btn('', '－ 1 dl', () => run(-1), 'small');
  const done = btn(ICON.check, 'Valmis', () => {
    if (locked || busy) return;
    queued = 0; locked = true; [add, sub, done].forEach((b) => ((b as HTMLButtonElement).disabled = true));
    submit({ kind: 'fill', dl });
  }, 'primary big wide');
  paintAt(0);
  host.append(pic, h('p', { class: 'muted small' }, 'Kaada desilitran mitalla. Jokainen kaato on 1 dl. Viiva näyttää litran.'), h('div', { class: 'row' }, add, sub), done);
  return { reveal: () => { dl = task.target; paintAt(dl); } };
}

function grams(task: Extract<Task, { kind: 'grams' }>, host: HTMLElement, submit: Submit): Widget {
  const on: number[] = [], max = Math.max(2000, Math.ceil(task.target / 1000) * 1000 + 1000);
  let shown = 0, locked = false;
  const pic = h('div', { class: 'scene' });
  const total = () => on.reduce((x, y) => x + y, 0);
  const paintAt = (g: number) => {
    const s = on.map((p, i) => packetArt(150 - 64 + (i % 4) * 42 + 21, 132 - Math.floor(i / 4) * 34, p)).join('') + dialBody(g, max);
    pic.innerHTML = `<svg viewBox="0 0 300 252" width="100%" style="max-height:300px" role="img" aria-label="Keittiövaaka: ${total()} grammaa">${s}</svg>`;
  };
  const draw = () => {
    const to = total(), from = shown, t0 = performance.now();
    shown = to;
    const step = (now: number) => { if (shown !== to) return; const p = Math.min(1, (now - t0) / 600); paintAt(from + (to - from) * (1 - (1 - p) ** 3)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const adds = task.packs.map((p) => btn('', `＋ ${p >= 1000 ? `${p / 1000} kg` : `${p} g`}`, () => { if (locked || on.length >= 12) return; on.push(p); draw(); say(`${total()} grammaa`); }, 'big'));
  const undo = btn('', '－ viimeinen', () => { if (locked || !on.length) return; on.pop(); draw(); }, 'small');
  const done = btn(ICON.check, 'Valmis', () => {
    if (locked) return;
    locked = true; [...adds, undo, done].forEach((b) => ((b as HTMLButtonElement).disabled = true));
    submit({ kind: 'grams', g: total() });
  }, 'primary big wide');
  paintAt(0);
  host.append(pic, h('p', { class: 'muted small' }, 'Laita vaa\'alle punnuksia. Näyttö kertoo painon grammoina.'), h('div', { class: 'row' }, ...adds), h('div', { class: 'row' }, undo), done);
  return { reveal: () => { shown = task.target; paintAt(task.target); } };
}

// ---------------------------------------------------------------- weigh packages two at a time
function weigh(task: Extract<Task, { kind: 'weigh' }>, host: HTMLElement, submit: Submit): Widget {
  const { names, w } = task;
  let L = -1, R = -1, shown = 0, locked = false, count = 0;
  const pic = h('div', { class: 'scene' }), log = h('p', { class: 'muted small' }, 'Napauta kahta pakettia: ensimmäinen menee vasemmalle, toinen oikealle.');
  const goal = () => (L < 0 ? 0 : R < 0 ? -1 : Math.sign(w[R]! - w[L]!));
  const paintAt = (tilt: number) => {
    const s = balanceBody(L < 0 ? [] : [names[L]!], R < 0 ? [] : [names[R]!], tilt);
    pic.innerHTML = `<svg viewBox="0 0 300 200" width="100%" style="max-height:280px" role="img" aria-label="Vaaka">${s}</svg>`;
  };
  const draw = () => {
    const to = goal(), from = shown, t0 = performance.now();
    shown = to;
    const step = (now: number) => {
      if (shown !== to) return;
      const u = (now - t0) / 1000;
      paintAt(to + (from - to) * Math.exp(-2.6 * u) * Math.cos(7 * u));
      if (u < 1.6) requestAnimationFrame(step); else paintAt(to);
    };
    requestAnimationFrame(step);
  };
  const put = (i: number) => {
    if (locked) return;
    if (L < 0 || R >= 0) { L = i; R = -1; }
    else if (i !== L) { R = i; count++; }
    draw();
    if (R >= 0) {
      const g = Math.sign(w[R]! - w[L]!), txt = g === 0 ? `${names[L]} ja ${names[R]} ovat yhtä painavat.` : `${names[g < 0 ? L : R]} on painavampi kuin ${names[g < 0 ? R : L]}.`;
      log.textContent = `Punnitus ${count}: ${txt}`; say(txt);
    } else log.textContent = `${names[L]} vasemmalla. Valitse toinen paketti oikealle.`;
  };
  const puts = names.map((n, i) => btn('', `⚖ ${n}`, () => put(i), 'big'));
  const picks = names.map((n, i) => btn('', n, () => {
    if (locked) return;
    locked = true; [...puts, ...picks].forEach((b) => ((b as HTMLButtonElement).disabled = true));
    submit({ kind: 'weigh', pick: i });
  }, 'primary'));
  paintAt(0);
  host.append(pic, log, h('div', { class: 'row' }, ...puts), h('p', { class: 'small' }, task.light ? 'Kevyin paketti on:' : 'Painavin paketti on:'), h('div', { class: 'row' }, ...picks));
  return { reveal: () => { const b = w.indexOf(task.light ? Math.min(...w) : Math.max(...w)); log.textContent = `${task.light ? 'Kevyin' : 'Painavin'} on ${names[b]}.`; } };
}

// ---------------------------------------------------------------- cut a number into two handy parts
function cut(task: Extract<Task, { kind: 'cut' }>, host: HTMLElement, submit: Submit): Widget {
  const { a, b, op } = task, sg = op === '+' ? '+' : '−', W = 320, G = 30, x0 = W / 2 - ((b - 1) * G) / 2;
  let at = 0, locked = false;
  const pic = h('div', { class: 'scene' });
  const draw = () => {
    let s = `<text x="${W / 2}" y="30" text-anchor="middle" font-size="24" font-weight="900" fill="currentColor">${a} ${sg} ${b}</text>`;
    const px = (i: number) => x0 + i * G + (at ? (i < at ? -8 : 8) : 0);
    for (let i = 0; i < b; i++) s += `<circle cx="${px(i)}" cy="74" r="11" fill="${!at ? '#9aa3a8' : i < at ? 'var(--red)' : '#4f7a2b'}"/>`;
    for (let g = 1; g < b; g++) { const x = (px(g - 1) + px(g)) / 2; s += `<g data-g="${g}" style="cursor:pointer"><rect x="${x - 12}" y="48" width="24" height="54" fill="transparent"/>${g === at ? `<line x1="${x}" y1="50" x2="${x}" y2="100" stroke="currentColor" stroke-width="2.5" stroke-dasharray="5 4"/><text x="${x}" y="46" text-anchor="middle" font-size="16">✂</text>` : `<line x1="${x}" y1="92" x2="${x}" y2="100" stroke="#9aa3a8" stroke-width="2"/>`}</g>`; }
    if (at) {
      const v = op === '+' ? a + at : a - at;
      s += `<text x="${(px(0) + px(at - 1)) / 2}" y="116" text-anchor="middle" font-size="14" font-weight="900" fill="var(--red)">${at}</text><text x="${(px(at) + px(b - 1)) / 2}" y="116" text-anchor="middle" font-size="14" font-weight="900" fill="#4f7a2b">${b - at}</text>`;
      s += `<text x="${W / 2}" y="146" text-anchor="middle" font-size="18" font-weight="800"><tspan fill="currentColor">${a} ${sg} </tspan><tspan fill="var(--red)">${at}</tspan><tspan fill="currentColor"> = ${v}</tspan><tspan fill="currentColor">, loput </tspan><tspan fill="#4f7a2b">${b - at}</tspan></text>`;
    }
    pic.innerHTML = `<svg viewBox="0 0 ${W} 158" width="100%" style="max-height:280px" role="group" aria-label="${b} kiveä rivissä">${s}</svg>`;
    pic.querySelectorAll<SVGGElement>('g[data-g]').forEach((g) => {
      const choose = () => {
        if (locked) return;
        const focus = document.activeElement === g;
        at = Number(g.dataset.g); draw();
        if (focus) pic.querySelector<SVGGElement>(`[data-g="${at}"]`)?.focus();
        say(`${a} ${op === '+' ? 'plus' : 'miinus'} ${at} on ${op === '+' ? a + at : a - at}`);
      };
      g.addEventListener('click', choose);
      keyboardAction(g, choose, `Leikkaa ${g.dataset.g} kiven jälkeen`);
      g.setAttribute('aria-pressed', String(Number(g.dataset.g) === at));
    });
  };
  const done = btn(ICON.check, 'Valmis', () => {
    if (locked || !at) return;
    locked = true; (done as HTMLButtonElement).disabled = true;
    submit({ kind: 'cut', at });
  }, 'primary big wide');
  draw();
  host.append(pic, h('p', { class: 'muted small' }, `Napauta kivien väliin: mistä kohtaa ${b} kannattaa leikata, jotta ensimmäinen osa vie tasakymppiin?`), done);
  return { reveal: () => { at = solution(task).kind === 'cut' ? (solution(task) as { at: number }).at : 0; draw(); } };
}

// ---------------------------------------------------------------- tie ten loose reeds into one bundle
function bundle(t: Extract<Task, { kind: 'bundle' }>, host: HTMLElement, submit: Submit): Widget {
  const n = t.n, inB = new Set<number>();
  let locked = false, tied = false;
  const pic = h('div', { class: 'scene' });
  const looseX = (i: number) => 14 + i * ((272) / Math.max(1, n - 1));
  const reed = (x: number, y: number, len: number, i: number, sel: boolean) =>
    `<g data-i="${i}" style="cursor:pointer"><rect x="${x - 8}" y="${y - 4}" width="16" height="${len + 8}" fill="transparent"/><rect x="${x - 2}" y="${y}" width="4" height="${len}" rx="2" fill="${sel ? '#7aa04a' : '#8fae5d'}"/><ellipse cx="${x}" cy="${y}" rx="3" ry="6" fill="#8a5a33"/></g>`;
  const draw = () => {
    const order = [...inB];
    let s = `<rect x="70" y="112" width="160" height="98" rx="12" fill="#f3ead2" stroke="#c9b68a" stroke-width="2" stroke-dasharray="6 4"/><text x="150" y="204" text-anchor="middle" font-size="12" font-weight="700" fill="#8a7444">nippu</text>`;
    for (let i = 0; i < n; i++) if (!inB.has(i)) s += reed(looseX(i), 14, 76, i, false);
    order.forEach((i, k) => { const x = 150 - ((order.length - 1) * 7 + Math.floor((order.length - 1) / 5) * 6) / 2 + k * 7 + Math.floor(k / 5) * 6; s += reed(x, 128, 60, i, true); });
    if (tied && order.length) { const w = (order.length - 1) * 7 + Math.floor((order.length - 1) / 5) * 6 + 14; s += `<rect x="${150 - w / 2}" y="156" width="${w}" height="9" rx="3" fill="var(--red)"/>`; }
    pic.innerHTML = `<svg viewBox="0 0 300 216" width="100%" style="max-height:300px" role="group" aria-label="Irrallisia kaisloja ja nippu">${s}</svg>`;
    pic.querySelectorAll<SVGGElement>('g[data-i]').forEach((g) => {
      const i = Number(g.dataset.i);
      const toggle = () => {
        if (locked) return;
        const focus = document.activeElement === g;
        if (inB.has(i)) inB.delete(i); else { inB.add(i); say(String(inB.size)); }
        draw();
        if (focus) pic.querySelector<SVGGElement>(`[data-i="${i}"]`)?.focus();
      };
      g.addEventListener('click', toggle);
      keyboardAction(g, toggle, inB.has(i) ? 'Palauta kaisla nipusta' : 'Siirrä kaisla nippuun');
      g.setAttribute('aria-pressed', String(inB.has(i)));
    });
  };
  const done = btn(ICON.check, 'Sido nippu', () => {
    if (locked || !inB.size) return;
    locked = true; tied = true; (done as HTMLButtonElement).disabled = true; draw();
    submit({ kind: 'bundle', count: inB.size });
  }, 'primary big wide');
  draw();
  host.append(pic, h('p', { class: 'muted small' }, 'Napauta kaisloja nippuun. Kun nipussa on tasan kymmenen, sido se. Napauta nipun kaislaa, niin se palaa.'), done);
  return { reveal: () => { inB.clear(); for (let i = 0; i < 10; i++) inB.add(i); tied = true; draw(); } };
}

function stack(t: Extract<Task, { kind: 'stack' }>, host: HTMLElement, submit: Submit): Widget {
  const max = Math.max(t.a * t.k + t.a, 15);
  let n = 0, locked = false;
  const pic = h('div', { class: 'scene' });
  const draw = () => {
    const ok = n === t.a * t.k;
    const s = `<line x1="0" y1="214" x2="240" y2="214" stroke="currentColor" opacity=".4"/>` + stackBlocks(t.a, 30, t.a, 'var(--sun)', 'var(--sun)') + duck(50, 214 - t.a * 14 - 14, 12) +
      stackBlocks(n, 150, t.a, locked && !ok ? 'var(--red)' : 'var(--pond)', locked && !ok ? '#f3a0a0' : '#7fc59a') + frog(170, 214 - n * 14 - 16, 12) +
      `<text x="170" y="232" text-anchor="middle" font-size="14" font-weight="800" fill="currentColor">${n}</text><text x="50" y="232" text-anchor="middle" font-size="14" font-weight="800" fill="currentColor">${t.a}</text>`;
    pic.innerHTML = `<svg viewBox="0 0 240 236" width="100%" style="max-height:300px" role="img" aria-label="Aavan torni ${t.a}, Loikan torni ${n}">${s}</svg>`;
  };
  const add = btn('', '＋ palikka', () => { if (locked || n >= max) return; n++; draw(); say(String(n)); }, 'big');
  const sub = btn('', '－ palikka', () => { if (locked || !n) return; n--; draw(); }, 'small');
  const done = btn(ICON.check, 'Valmis', () => {
    if (locked || !n) return;
    locked = true; [add, sub, done].forEach((b) => ((b as HTMLButtonElement).disabled = true)); draw();
    submit({ kind: 'stack', n });
  }, 'primary big wide');
  draw();
  host.append(pic, h('p', { class: 'muted small' }, 'Palikat vaihtavat väriä aina, kun yksi Aavan tornin korkeus täyttyy.'), h('div', { class: 'row' }, add, sub), done);
  return { reveal: () => { n = t.a * t.k; draw(); } };
}
