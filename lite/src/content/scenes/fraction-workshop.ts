import type { Paint } from '../../engine/types';
import { svg } from '../../ui/art';
import { h } from '../../ui/dom';
import { paint, table } from '../kit';
import {
  checkFractionSubtract, fractionSymbol, mixedFraction, solutionFractionSubtract,
  type Fraction, type FractionCompare, type FractionExpand, type FractionLine, type FractionMixed,
  type FractionSubtractResponse, type FractionSubtractTask, type FractionSurface,
} from '../models/fraction-workshop';

const W = 320, X = 22, SPAN = 276;
const ink = '#244658', blue = '#41949e', blueDark = '#246c81', gold = '#e6b456', pale = '#deede7';
const label = (x: number, y: number, value: string) =>
  `<text x="${x}" y="${y}" fill="currentColor" font-weight="700" text-anchor="middle" font-size="13">${value}</text>`;
const rect = (x: number, y: number, w: number, height: number, fill: string, stroke = 'none') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${height}" fill="${fill}" stroke="${stroke}"/>`;
const boundary = (x: number, y: number, height: number, thin = false) =>
  `<path d="M${x} ${y}v${height}" stroke="${thin ? blueDark : ink}" stroke-width="${thin ? '.7' : '1.8'}"${thin ? ' stroke-dasharray="3 2"' : ''}/>`;
const unit = (surface: FractionSurface) => surface === 'rope' ? '1 m köyttä' : '1 malliallas';
const panel = (art: string, details: string) =>
  `<div class="fraction-workshop" style="grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;gap:.55rem;min-width:0">` +
  `<div style="flex:1 1 145px;min-width:0">${art}</div><div style="flex:2 1 248px;min-width:0">${details}</div></div>`;

interface BarOptions {
  cuts?: number;
  onlyFilled?: boolean;
  half?: boolean;
  removed?: number;
}

/** All rows use exactly the same physical scale. Dashed lines supplement the original solid seams. */
function bar(y: number, amount: Fraction, { cuts, onlyFilled, half, removed }: BarOptions = {}) {
  const start = amount.n / amount.d;
  let art = rect(X, y, SPAN, 20, pale) + rect(X, y, SPAN * start, 20, blue);
  if (removed !== undefined) art += rect(X + SPAN * (start - removed), y, SPAN * removed, 20, gold);
  art += rect(X, y, SPAN, 20, 'none', ink);
  for (let i = 1; i < amount.d; i++) art += boundary(X + SPAN * i / amount.d, y, 20);
  if (cuts && cuts <= 96) {
    for (let i = 1; i < cuts; i++) {
      if ((i * amount.d) % cuts === 0 || (onlyFilled && i / cuts >= start)) continue;
      art += boundary(X + SPAN * i / cuts, y, 20, true);
    }
  }
  if (half) art += boundary(X + SPAN / 2, y - 5, 30);
  return art;
}

function inspect(initial: string, changed: string, action: string, description: string): Paint {
  return (host) => {
    const board = h('div', { html: initial });
    const notice = h('p', { role: 'status', class: 'small' });
    const toggle = h('button', {
      type: 'button', class: 'btn small', 'aria-pressed': 'false',
      onclick: () => {
        const selected = toggle.getAttribute('aria-pressed') === 'true';
        board.innerHTML = selected ? initial : changed;
        toggle.setAttribute('aria-pressed', String(!selected));
        notice.textContent = selected ? 'Alkuperäiset rajat näkyvät.' : description;
      },
    }, action);
    host.append(board, toggle, notice);
    return () => { board.remove(); toggle.remove(); notice.remove(); };
  };
}

export function fractionLineArt(model: FractionLine, showPosition = false): Paint {
  const { amount, min, max, surface } = model;
  const width = SPAN / (max - min);
  const ruler = Array.from({ length: max - min }, (_, i) => {
    const start = X + i * width;
    return rect(start, 29, width, 22, i % 2 ? pale : '#c6e3dc', ink) +
      Array.from({ length: amount.d - 1 }, (_, j) => boundary(start + (j + 1) * width / amount.d, 29, 22, true)).join('') +
      label(start + width / 2, 20, unit(surface));
  }).join('');
  const scale = Array.from({ length: max - min + 1 }, (_, i) => label(X + i * width, 70, String(min + i))).join('');
  const position = X + (amount.n / amount.d - min) * width;
  const mark = showPosition ? `<circle cx="${position}" cy="40" r="6" fill="${gold}" stroke="${ink}"/>` : '';
  return paint(panel(svg(W, 78, ruler + scale + mark, 'Samanpituiset yksikkövälit. Jokainen yksikköväli on jaettu samalla tavalla.'),
    table(['Sijoitettava luku', 'Yksikköväli', 'Osia kussakin välissä'], [[fractionSymbol(amount), `${min}–${min + 1}`, amount.d]]) +
    `<p>Jokainen väli vastaa määrää ${unit(surface)}.</p>`));
}

function expansionPanel(model: FractionExpand, showCuts: boolean, showValues = false) {
  const { amount, factor, surface, repair } = model;
  const cuts = showCuts || repair ? amount.d * factor : undefined;
  const original = bar(28, amount);
  const second = showCuts || repair ? bar(65, amount, { cuts, onlyFilled: repair && !showCuts }) : '';
  const art = original + second + label(160, 19, 'Alkuperäinen jako') +
    (showCuts || repair ? label(160, 102, showCuts ? 'Sama määrä, hienompi jako' : 'Luonnos: leikkaus vain sinisellä') : '');
  return panel(svg(W, showCuts || repair ? 112 : 59, art, 'Sama sininen osuus yhdessä alkuperäisessä kokonaisessa.'),
    table(['Alkuperäinen kokonainen', 'Sininen osuus', 'Uusia osia / vanha osa'], [[unit(surface), fractionSymbol(amount), factor]]) +
    (showValues ? `<p>Sinisiä uusia osia on ${amount.n * factor}. Kaikkia uusia osia on ${amount.d * factor}.</p>` : ''));
}

export function fractionExpandArt(model: FractionExpand, demo = false): Paint {
  if (demo) return paint(expansionPanel(model, true, true));
  return inspect(expansionPanel(model, false), expansionPanel(model, true),
    model.repair ? 'Korjaa myös tyhjien osien jako' : `Jaa jokainen osa ${model.factor} osaan`,
    'Jokainen alkuperäinen osa on jaettu samalla tavalla. Sininen määrä pysyi samana.');
}

function comparisonPanel(model: FractionCompare, inspectParts: boolean) {
  const { left, right, method, common, surface } = model;
  const options: BarOptions = !inspectParts ? {} : method === 'half' ? { half: true } : { cuts: common };
  const art = label(160, 19, 'A') + bar(26, left, options) + label(160, 65, 'B') + bar(72, right, options);
  return panel(svg(W, 100, art, 'Yhtä pitkät kokonaiset A ja B samassa asteikossa.'),
    table(['Sama kokonainen', 'A', 'B', 'Vertailuapu'], [[unit(surface), fractionSymbol(left), fractionSymbol(right),
      method === 'half' ? 'Puolikas · 1/2' : `Yhteinen jako · ${common} osaa`]]));
}

export function fractionCompareArt(model: FractionCompare, demo = false): Paint {
  if (demo) return paint(comparisonPanel(model, true));
  return inspect(comparisonPanel(model, false), comparisonPanel(model, true),
    model.method === 'half' ? 'Näytä puolikkaan viiva' : 'Lisää yhteiset rajat',
    model.method === 'half' ? 'Puolikas merkitään samaan kohtaan kummassakin kokonaisessa.'
      : 'Saman kokoiset osat on merkitty kumpaankin kokonaiseen.');
}

function mixedPanel(model: FractionMixed, grouped: boolean) {
  const { direction, surface } = model;
  const { whole, part } = direction === 'to-improper' ? model : mixedFraction(model.amount);
  const unitWidth = SPAN / (whole + 1);
  let art = '';
  for (let i = 0; i <= whole; i++) {
    const start = X + i * unitWidth;
    const filled = i === whole ? part.n : part.d;
    art += rect(start, 28, unitWidth, 25, pale, ink);
    for (let j = 0; j < part.d; j++) {
      art += rect(start + j * unitWidth / part.d + 1, 29, unitWidth / part.d - 2, 23,
        j >= filled ? pale : grouped && i < whole ? blueDark : blue);
      if (j > 0) art += boundary(start + j * unitWidth / part.d, 28, 25, !grouped);
    }
    art += label(start + unitWidth / 2, 70, unit(surface));
  }
  const given = direction === 'to-improper' ? `${whole} ${fractionSymbol(part)}`
    : fractionSymbol(model.amount);
  return panel(svg(W, 80, art, 'Useita samankokoisia kokonaisia. Sininen alue säilyy ryhmittelyssä.'),
    table(['Yksi kokonainen', 'Annettu merkintä', 'Osia kokonaisessa'], [[unit(surface), given, part.d]]));
}

export function fractionMixedArt(model: FractionMixed, demo = false): Paint {
  const grouped = model.direction === 'to-improper';
  if (demo) return paint(mixedPanel(model, !grouped));
  return inspect(mixedPanel(model, grouped), mixedPanel(model, !grouped),
    grouped ? 'Näytä osat yksittäisinä' : 'Ryhmitä kokonaiset',
    'Sinisten osien määrä pysyy samana. Jokainen kokonainen sisältää yhtä monta osaa.');
}

function subtractPanel(task: FractionSubtractTask, common?: number, accepted = false) {
  const { left, right, surface } = task;
  const sameScale = common && Number.isSafeInteger(common) && common > 0 ? common : undefined;
  const removed = accepted ? right.n / right.d : undefined;
  const art = label(160, 17, accepted ? 'Sininen jää · keltainen otetaan pois' : 'Lähtömäärä') +
    bar(24, left, { cuts: sameScale, removed }) +
    label(160, 65, 'Vähennettävä määrä') + bar(72, right, { cuts: sameScale });
  return panel(svg(W, 101, art, 'Kaksi yhtä pitkää alkuperäistä kokonaista. Viivat näyttävät osien rajat.'),
    table(['Kokonainen', 'Alussa', 'Pois'], [[unit(surface), fractionSymbol(left), fractionSymbol(right)]]) +
    (sameScale ? `<p>${accepted ? 'Valittu yhteinen jako' : 'Luonnoksen jako'}: ${sameScale} osaa yhdessä kokonaisessa.</p>` : '') +
    (sameScale && sameScale > 96 ? '<p>Tiheä jaotus on nimetty luvulla.</p>' : ''));
}

export const fractionSubtractArt = (task: FractionSubtractTask, common?: number, accepted = false): Paint =>
  paint(subtractPanel(task, common, accepted));

export function mountFractionSubtract(task: FractionSubtractTask, host: HTMLElement, submit: (response: FractionSubtractResponse) => void) {
  const board = h('div', { class: 'exp-exact', html: subtractPanel(task) });
  const status = h('p', { class: 'small', role: 'status', 'aria-live': 'polite' });
  const field = (name: string) => h('input', {
    type: 'text', inputmode: 'numeric', pattern: '[0-9]+', maxlength: 9, size: 7,
    required: true, 'aria-label': name,
    style: 'min-height:44px;padding:6px 9px;border:1px solid #79908e;border-radius:9px;background:#fffdf7;color:#244658;font:inherit',
  });
  const common = field('Osia yhteisessä jaossa');
  const n = field('Erotuksen osoittaja');
  const d = field('Erotuksen nimittäjä');
  const done = h('button', { type: 'submit', class: 'btn primary' }, 'Tarkista');
  const controls = h('div', { class: 'row', style: 'display:flex;flex-wrap:wrap;gap:.45rem;align-items:end' },
    h('label', { class: 'stack', style: 'gap:.25rem' }, 'Osia yhteisessä jaossa', common),
    h('label', { class: 'stack', style: 'gap:.25rem' }, 'Erotuksen osoittaja', n),
    h('label', { class: 'stack', style: 'gap:.25rem' }, 'Erotuksen nimittäjä', d), done);
  const form = h('form', { class: 'stack' }, board, controls, status);
  common.addEventListener('input', () => {
    const parts = Number(common.value);
    board.innerHTML = subtractPanel(task, parts);
    status.textContent = common.value ? 'Tarkastele katkoviivojen ja alkuperäisten rajojen kohtia kummassakin kokonaisessa.' : '';
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (done.disabled) return;
    const response: FractionSubtractResponse = { kind: 'fraction-subtract', common: Number(common.value), n: Number(n.value), d: Number(d.value) };
    for (const element of [common, n, d, done]) element.disabled = true;
    if (checkFractionSubtract(task, response).ok) {
      board.innerHTML = subtractPanel(task, response.common, true);
      status.textContent = `Jäljelle jää ${response.n}/${response.d} alkuperäisestä kokonaisesta. Sininen osa jää ${task.surface === 'rope' ? 'jäljelle' : 'putoukselle'}.`;
    }
    submit(response);
  });
  host.append(form);
  return {
    reveal() {
      const answer = solutionFractionSubtract(task);
      board.innerHTML = subtractPanel(task, answer.common, true);
      status.textContent = `Yksi toimiva jako: ${answer.common} osaa. Jäljelle jää ${answer.n}/${answer.d} samasta kokonaisesta.`;
    },
  };
}
