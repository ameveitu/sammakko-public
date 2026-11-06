import type { DemoStep } from '../../engine/types';
import { h } from '../../ui/dom';
import { cutScene } from '../fracanim';
import {
  cakeCutSentence, cakeExplanation, cakeFactors, cakeNotation, cakePieceCount, cakeQuestion, cakeStory, cakeWords,
  makeCakeTask, solutionCake, type CakeResponse, type CakeTask,
} from '../fractions/cake-table';

/** start: the cakes as served · cut: same-size pieces · moved: pieces on the plates. */
type Stage = 'start' | 'cut' | 'moved';
type Point = readonly [number, number];

const R = 54;
const BAR_W = 184;
const BAR_H = 42;
const COLOURS = ['#f3bd76', '#e2939b'] as const;
const INK = '#54362a';
const TOP: readonly [Point, Point] = [[120, 78], [360, 78]];
const BOTTOM: readonly [Point, Point] = [[120, 226], [360, 226]];

interface Piece {
  id: string;
  side: 0 | 1;
  /** Position on its own cake, in units of 1/den. */
  index: number;
  den: number;
  /** Position on the plates after moving (common pieces only). */
  plate: 0 | 1;
  slot: number;
}

const polar = (fraction: number, radius: number): Point => {
  const a = fraction * Math.PI * 2 - Math.PI / 2;
  return [radius * Math.cos(a), radius * Math.sin(a)];
};
const fmt = (n: number) => Number(n.toFixed(2));

function tile(task: CakeTask, from: number, to: number, fill: string, attrs = ''): string {
  if (task.shape === 'strip') {
    return `<rect x="${fmt(-BAR_W / 2 + from * BAR_W)}" y="${-BAR_H / 2}" width="${fmt((to - from) * BAR_W)}" height="${BAR_H}" fill="${fill}" stroke="${INK}" stroke-width="1.2" ${attrs}/>`;
  }
  if (to - from >= 1) return `<circle r="${R}" fill="${fill}" stroke="${INK}" stroke-width="1.2" ${attrs}/>`;
  const a = polar(from, R), b = polar(to, R);
  return `<path d="M0 0 L${fmt(a[0])} ${fmt(a[1])} A${R} ${R} 0 ${to - from > 0.5 ? 1 : 0} 1 ${fmt(b[0])} ${fmt(b[1])}Z" fill="${fill}" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round" ${attrs}/>`;
}

function centroid(task: CakeTask, from: number, to: number): Point {
  return task.shape === 'strip' ? [-BAR_W / 2 + (from + to) / 2 * BAR_W, 0] : polar((from + to) / 2, R * 0.62);
}

function plate(task: CakeTask, [x, y]: Point, dashedWhole: boolean): string {
  const base = task.shape === 'strip'
    ? `<rect x="${-BAR_W / 2 - 9}" y="${-BAR_H / 2 - 9}" width="${BAR_W + 18}" height="${BAR_H + 18}" rx="8" fill="#fdfaf3" stroke="#c9b79c" stroke-width="2"/>`
    : `<circle r="${R + 9}" fill="#fdfaf3" stroke="#c9b79c" stroke-width="2"/>`;
  const whole = !dashedWhole ? '' : task.shape === 'strip'
    ? `<rect x="${-BAR_W / 2}" y="${-BAR_H / 2}" width="${BAR_W}" height="${BAR_H}" fill="none" stroke="${INK}" stroke-dasharray="4 4" opacity=".35"/>`
    : `<circle r="${R}" fill="none" stroke="${INK}" stroke-dasharray="4 4" opacity=".35"/>`;
  return `<g transform="translate(${x} ${y})">${base}${whole}</g>`;
}

/** The eaten piece: an empty outline with crumbs. */
function eaten(task: CakeTask, parts: number, kept: number): string {
  const from = kept / parts;
  const [cx, cy] = centroid(task, from, 1);
  const crumbs = [[-6, -3], [5, 4], [1, -8]].map(([dx, dy]) => `<circle cx="${fmt(cx + dx!)}" cy="${fmt(cy + dy!)}" r="1.8" fill="#d9a35f"/>`).join('');
  return tile(task, from, 1, '#fff8e7', 'stroke-dasharray="4 3" opacity=".7"') + crumbs;
}

function pieces(task: CakeTask, stage: Stage): Piece[] {
  const [fl, fr] = stage === 'start' ? [1, 1] : cakeFactors(task);
  const d = task.left.parts * cakeFactors(task)[0];
  const all: Piece[] = [];
  let k = 0;
  for (const [side, source, f] of [[0, task.left, fl], [1, task.right, fr]] as const) {
    for (let index = 0; index < source.kept * f; index++, k++) {
      all.push({ id: `${side ? 'right' : 'left'}-${Math.floor(index / f)}-${index % f}`, side, index, den: source.parts * f, plate: k < d ? 0 : 1, slot: k % d });
    }
  }
  return all;
}

/** Where a piece sits on the plates: translate + rotation (cake) or shift (strip). */
function target(task: CakeTask, piece: Piece): { x: number; y: number; rotate: number } {
  const [x, y] = BOTTOM[piece.plate]!;
  return task.shape === 'strip'
    ? { x: x + (piece.slot - piece.index) * BAR_W / piece.den, y, rotate: 0 }
    : { x, y, rotate: (piece.slot - piece.index) * 360 / piece.den };
}

/** Absolute label position for a numbered piece. */
function labelPoint(task: CakeTask, piece: Piece, stage: Stage): Point {
  if (stage === 'moved') {
    const [x, y] = BOTTOM[piece.plate]!;
    const [cx, cy] = centroid(task, piece.slot / piece.den, (piece.slot + 1) / piece.den);
    return [x + cx, y + cy];
  }
  const [x, y] = TOP[piece.side]!;
  const [cx, cy] = centroid(task, piece.index / piece.den, (piece.index + 1) / piece.den);
  return [x + cx, y + cy];
}

function board(task: CakeTask, stage: Stage, numbers: ReadonlyMap<string, number> = new Map()): string {
  const words = cakeWords(task);
  const all = pieces(task, stage);
  const n = cakePieceCount(task);
  const d = task.left.parts * cakeFactors(task)[0];
  const sources = [task.left, task.right].map((source, side) => {
    const [x, y] = TOP[side]!;
    return `<g transform="translate(${x} ${y})">${plate(task, [0, 0], false)}${eaten(task, source.parts, source.kept)}</g>`;
  }).join('');
  const drawn = all.map((piece) => {
    const fill = COLOURS[piece.side];
    const shape = tile(task, piece.index / piece.den, (piece.index + 1) / piece.den, fill);
    const attrs = `data-piece-id="${piece.id}" data-side="${piece.side}"`;
    if (stage !== 'moved') {
      const [x, y] = TOP[piece.side]!;
      return `<g ${attrs} transform="translate(${x} ${y})">${shape}</g>`;
    }
    const [sx, sy] = TOP[piece.side]!;
    const t = target(task, piece);
    const transform = task.shape === 'strip' ? `translate(${fmt(t.x)} ${t.y})` : `translate(${t.x} ${t.y}) rotate(${fmt(t.rotate)})`;
    return `<g ${attrs} data-from="${sx},${sy}" data-to="${fmt(t.x)},${t.y},${fmt(t.rotate)}" style="cursor:pointer" transform="${transform}">${shape}</g>`;
  }).join('');
  const labels = all.filter((piece) => numbers.has(piece.id)).map((piece) => {
    const [x, y] = labelPoint(task, piece, stage);
    return `<g pointer-events="none"><circle cx="${fmt(x)}" cy="${fmt(y)}" r="9.5" fill="#fff" stroke="${INK}" stroke-width="1"/><text x="${fmt(x)}" y="${fmt(y + 4.5)}" text-anchor="middle" font-size="12.5" font-weight="700" fill="${INK}">${numbers.get(piece.id)}</text></g>`;
  }).join('');
  const label = (x: number, y: number, text: string) => `<text x="${x}" y="${y}" text-anchor="middle" fill="${INK}" font-size="15" font-weight="700">${text}</text>`;
  const top = task.shape === 'strip' ? 122 : 154;
  const bottom = task.shape === 'strip' ? 270 : 302;
  const plateLabels = stage === 'moved'
    ? [label(120, bottom, `Täysi ${words.plate} = 1 ${words.thing}`), label(360, bottom, n > d ? 'Lisäksi' : '')]
    : [label(240, bottom, `Tyhjät ${task.shape === 'cake' ? 'lautaset' : 'pellit'}`)];
  return `<svg viewBox="0 0 480 ${bottom + 10}" width="100%" style="display:block;max-height:340px;background:#fff8e7;border-radius:12px;touch-action:manipulation" role="img" aria-label="${stage === 'moved' ? `Palat ovat ${task.shape === 'cake' ? 'lautasilla' : 'pelleillä'}.` : 'Kaksi pöydälle tuotua kokonaisuutta.'}">
    ${sources}
    ${BOTTOM.map((point) => plate(task, point, true)).join('')}
    ${drawn}${labels}
    ${label(120, top, `1. ${words.thing}`)}${label(360, top, `2. ${words.thing}`)}
    ${plateLabels.join('')}
  </svg>`;
}

const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** New cut lines draw themselves in; the pieces wobble once. */
function animateCut(host: HTMLElement): void {
  if (reducedMotion()) return;
  for (const part of host.querySelectorAll<SVGGElement>('g[data-piece-id]')) {
    part.animate?.([{ opacity: 0.55 }, { opacity: 1 }], { duration: 450, easing: 'ease-out' });
  }
}

function animateMove(host: HTMLElement): void {
  if (reducedMotion()) return;
  [...host.querySelectorAll<SVGGElement>('g[data-from]')].forEach((part, i) => {
    const [fx, fy] = part.dataset.from!.split(',');
    const [tx, ty, rotate] = part.dataset.to!.split(',');
    part.animate?.([
      { transform: `translate(${fx}px, ${fy}px) rotate(0deg)` },
      { transform: `translate(${tx}px, ${ty}px) rotate(${rotate}deg)` },
    ], { duration: 520, delay: i * 110, easing: 'ease-in-out', fill: 'backwards' });
  });
}

export interface CakeWorkbench {
  /** The lesson calls this only after a successful domain verdict. */
  accept(response: CakeResponse): void;
  reveal(): void;
}

/** Only an answer button sends evidence. Cutting, moving and numbering stay local. */
export function mountCakeWorkbench(task: CakeTask, host: HTMLElement, submit: (response: CakeResponse) => void): CakeWorkbench {
  let stage: Stage = 'start';
  const numbers = new Map<string, number>();
  const words = cakeWords(task);
  const picture = h('div', { class: 'cake-board' });
  const status = h('p', { role: 'status', class: 'small', 'aria-live': 'polite' }, 'Palat ovat eri kokoisia, joten niitä ei voi vielä laskea yhteen.');
  const step = h('button', { type: 'button', class: 'btn primary', style: 'min-height:48px' }, '✂️ Leikkaa palat yhtä suuriksi');
  const question = h('p', { style: 'font-weight:700;margin:.2rem 0' }, cakeQuestion(task));
  const options = task.options.map((value) => h('button', {
    type: 'button', class: 'btn', 'data-cake-option': value, 'aria-pressed': 'false',
    style: 'min-width:64px;min-height:56px;font-size:1.4rem;font-weight:700',
  }, String(value)));
  const clear = h('button', { type: 'button', class: 'btn', style: 'min-height:44px' }, 'Pyyhi numerot');
  const answers = h('div', { class: 'stack', style: 'gap:.5rem;display:none' },
    question,
    h('div', { role: 'group', 'aria-label': 'Vastaus', style: 'display:flex;flex-wrap:wrap;gap:.6rem' }, ...options),
    h('p', { class: 'small muted' }, 'Napauta paloja, niin ne saavat numerot.'),
    h('div', {}, clear));
  const book = h('div', { class: 'card', style: 'background:#fffdf6;display:none' });

  const draw = () => { picture.innerHTML = board(task, stage, numbers); };
  const move = (animate: boolean) => {
    stage = 'moved'; draw(); if (animate) animateMove(picture);
    step.style.display = 'none'; answers.style.display = '';
    status.textContent = `Palat ovat ${task.shape === 'cake' ? 'lautasilla' : 'pelleillä'}. Kun ${words.plate} on täynnä, siinä on yksi kokonainen ${words.thing}.`;
  };
  step.addEventListener('click', () => {
    if (stage === 'start') {
      stage = 'cut'; draw(); animateCut(picture);
      step.textContent = `🍽️ Siirrä palat ${task.shape === 'cake' ? 'lautasille' : 'pelleille'}`;
      status.textContent = cakeCutSentence(task);
    } else if (stage === 'cut') move(true);
  });
  picture.addEventListener('click', (event) => {
    if (stage !== 'moved') return;
    const piece = (event.target as Element).closest?.('g[data-piece-id]') as SVGGElement | null;
    const id = piece?.dataset.pieceId;
    if (!id || numbers.has(id)) return;
    numbers.set(id, numbers.size + 1); draw();
  });
  clear.addEventListener('click', () => { numbers.clear(); draw(); });
  for (const button of options) {
    button.addEventListener('click', () => {
      if (button.disabled) return;
      for (const other of options) other.disabled = true;
      button.setAttribute('aria-pressed', 'true');
      submit({ kind: 'cake', count: Number(button.dataset.cakeOption) });
    });
  }
  const showBook = () => {
    book.replaceChildren(
      h('p', { class: 'small muted', style: 'margin:0' }, 'Matematiikan kirjassa tämä kirjoitetaan näin:'),
      h('p', { class: 'formula', style: 'font-size:1.15rem;font-weight:700;margin:.2rem 0 0' }, cakeNotation(task)));
    book.style.display = '';
  };
  draw();
  host.append(h('div', { class: 'stack', style: 'gap:.6rem' }, picture, status, step, answers, book));
  return {
    accept() { showBook(); },
    reveal() {
      if (stage !== 'moved') move(false);
      numbers.clear();
      pieces(task, 'moved').forEach((piece, i) => numbers.set(piece.id, i + 1));
      draw();
      const right = solutionCake(task).count;
      for (const button of options) {
        button.disabled = true;
        if (Number(button.dataset.cakeOption) === right) button.style.outline = '3px solid #2f6f5e';
      }
      showBook();
    },
  };
}

export function cakePartyDemo(): DemoStep[] {
  const task = makeCakeTask(0, 'guided', 'count-pieces');
  const all = pieces(task, 'moved');
  const counted = new Map(all.map((piece, i) => [piece.id, i + 1] as const));
  return [
    { say: `${cakeStory(task)} Palat ovat eri kokoisia, joten niitä ei voi vielä laskea yhteen.`, scene: (host) => { host.innerHTML = board(task, 'start'); } },
    { say: cakeCutSentence(task), scene: (host) => { host.innerHTML = board(task, 'cut'); animateCut(host); } },
    {
      say: 'Siirretään palat lautasille. Kuusi kuudesosaa täyttää yhden lautasen: se on yksi kokonainen kakku. Yksi kuudesosa jää yli.',
      scene: (host) => { host.innerHTML = board(task, 'moved', counted); animateMove(host); },
    },
    {
      say: `${cakeExplanation(task)} Kirjassa: ${cakeNotation(task)}.`,
      scene: (host) => { host.replaceChildren(h('div', { html: board(task, 'moved', counted) }), h('p', { class: 'formula' }, cakeNotation(task))); },
    },
  ];
}

/** Optional exterior comparison for the existing equal-parts lesson. */
export function fairCakePrelude(): DemoStep {
  return {
    say: 'Juhlapöydässä kaksi jakoa voi antaa saman määrän paloja. Kun nostat palat päällekkäin, näet, peittävätkö ne toisensa.',
    scene: cutScene(4, [0.4, 0.15, 0.3, 0.15]),
  };
}
