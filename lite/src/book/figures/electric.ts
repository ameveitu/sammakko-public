import type { Paint } from '../../engine/types';
import { C, arrow, figure, pill, tx } from './kit';

/** One part of a circuit diagram. */
export interface Part {
  kind: 'lamp' | 'resistor' | 'switch' | 'ammeter' | 'voltmeter' | 'motor';
  /** Name and value under the part, e.g. 'A 3 Ω'. */
  label?: string;
  /** A meter's reading, shown on a pill. */
  reading?: string;
  /** An open switch. */
  open?: boolean;
}

export interface CircuitOptions {
  /** The source's voltage, e.g. '12 V'. Without it the source is unlabelled. */
  source?: string;
  /** Parts on the top wire, left to right. */
  top?: Part[];
  /** Parallel branches to the right of the top parts; each branch lists its parts from top to bottom. */
  branches?: Part[][];
  /** A voltmeter across top part `at`. */
  across?: { at: number; reading?: string };
  /** A wire straight across the source: short circuit. */
  short?: boolean;
  /** Show moving charge (default: when no switch is open). */
  flow?: boolean;
  label: string;
}

const L = 82, R = 352, T = 70, B = 192, BAT = 132;

/** Wire segments along one line, skipping the gaps where parts sit. */
function wire(fixed: number, from: number, to: number, gaps: number[], horizontal: boolean) {
  const cuts = gaps.map(g => [g - 22, g + 22] as const).sort((a, b) => a[0] - b[0]);
  let at = from, d = '';
  for (const [a, b] of cuts) { if (a > at) d += horizontal ? `M${at} ${fixed}H${a}` : `M${fixed} ${at}V${a}`; at = Math.max(at, b); }
  if (to > at) d += horizontal ? `M${at} ${fixed}H${to}` : `M${fixed} ${at}V${to}`;
  return d ? `<path d="${d}" stroke="${C.ink}" stroke-width="3" fill="none" stroke-linecap="round"/>` : '';
}

function symbol(p: Part, x: number, y: number, vertical: boolean, lit: boolean): string {
  const turn = vertical ? ` transform="rotate(90 ${x} ${y})"` : '';
  const stub = (from: number, to: number) => `<line x1="${x + from}" y1="${y}" x2="${x + to}" y2="${y}" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/>`;
  switch (p.kind) {
    case 'lamp':
      return (lit ? `<circle cx="${x}" cy="${y}" r="25" fill="${C.glow}" class="bf-glow"/>` : '') +
        `<g${turn}>${stub(-22, -13)}${stub(13, 22)}<circle cx="${x}" cy="${y}" r="13" fill="${lit ? C.sun : '#fff'}" stroke="${C.ink}" stroke-width="3"/>` +
        `<path d="M${x - 9} ${y - 9}L${x + 9} ${y + 9}M${x + 9} ${y - 9}L${x - 9} ${y + 9}" stroke="${C.ink}" stroke-width="2.5"/></g>`;
    case 'resistor':
      return `<g${turn}>${stub(-22, -19)}${stub(19, 22)}<rect x="${x - 19}" y="${y - 8}" width="38" height="16" rx="2" fill="#fff" stroke="${C.ink}" stroke-width="3"/></g>`;
    case 'switch': {
      const tip = p.open ? `${x + 15} ${y - 15}` : `${x + 16} ${y}`;
      return `<g${turn}>${stub(-22, -16)}${stub(16, 22)}<circle cx="${x - 16}" cy="${y}" r="3.5" fill="${C.ink}"/><circle cx="${x + 16}" cy="${y}" r="3.5" fill="${C.ink}"/>` +
        `<path d="M${x - 16} ${y}L${tip}" stroke="${p.open ? C.red : C.ink}" stroke-width="3.5" stroke-linecap="round"/></g>`;
    }
    default: {
      const letter = p.kind === 'ammeter' ? 'A' : p.kind === 'voltmeter' ? 'V' : 'M';
      return `<g${turn}>${stub(-22, -14)}${stub(14, 22)}</g><circle cx="${x}" cy="${y}" r="14" fill="#fff" stroke="${C.ink}" stroke-width="3"/>` +
        tx(x, y + 5, letter, { size: 15, weight: 900 });
    }
  }
}

/** A circuit diagram with standard symbols. Moving dots show the current when the path is closed. */
export function circuit(o: CircuitOptions): Paint {
  const top = o.top ?? [], branches = o.branches ?? [];
  const closed = ![...top, ...branches.flat()].some(p => p.kind === 'switch' && p.open);
  const flow = o.flow ?? closed;
  const lit = closed && !o.short;
  const RUNG = 106, topEnd = branches.length ? R - (branches.length - 1) * RUNG - 46 : R - 10;
  const topX = top.map((_, i) => L + 34 + (topEnd - L - 34) * (i + 0.5) / top.length);
  const rungX = branches.map((_, i) => branches.length === 1 ? R : R - (branches.length - 1 - i) * RUNG);
  const right = branches.length ? rungX[rungX.length - 1]! : R;
  let s = '';
  // Wires: left side (with the source), top, bottom, right side or the branch rungs.
  s += wire(L, T, BAT - 7, [], false) + wire(L, BAT + 7, B, [], false);
  s += wire(T, L, right, topX, true) + wire(B, L, right, [], true);
  if (!branches.length) s += wire(R, T, B, [], false);
  const rungParts = branches.map(parts => parts.map((_, j) => parts.length === 1 ? (T + B) / 2 : T + 34 + (B - T - 68) * j / (parts.length - 1)));
  branches.forEach((_, i) => { s += wire(rungX[i]!, T, B, rungParts[i]!, false); });
  // Junctions where a branch leaves the main wire.
  rungX.slice(0, -1).forEach(x => { s += `<circle cx="${x}" cy="${T}" r="4.5" fill="${C.ink}"/><circle cx="${x}" cy="${B}" r="4.5" fill="${C.ink}"/>`; });
  // The source: long plate +, short plate −.
  s += `<line x1="${L - 18}" y1="${BAT - 7}" x2="${L + 18}" y2="${BAT - 7}" stroke="${C.ink}" stroke-width="3.5"/>` +
    `<line x1="${L - 9}" y1="${BAT + 7}" x2="${L + 9}" y2="${BAT + 7}" stroke="${C.ink}" stroke-width="7"/>` +
    tx(L + 27, BAT - 9, '+', { size: 15, fill: C.red, weight: 900 }) + tx(L + 27, BAT + 19, '−', { size: 15, fill: C.blue, weight: 900 });
  if (o.source) s += tx(L - 24, BAT + 5, o.source, { anchor: 'end', size: 14 });
  // Short circuit: a bare wire straight from pole to pole.
  const sx = L + 34;
  if (o.short) s += `<path d="M${sx} ${T}V${B}" stroke="${C.red}" stroke-width="3.5"/><circle cx="${sx}" cy="${T}" r="4.5" fill="${C.ink}"/><circle cx="${sx}" cy="${B}" r="4.5" fill="${C.ink}"/>`;
  // Moving charge (drawn under the parts, so it seems to pass through them).
  if (flow) {
    const loops = o.short ? [`M${L} ${BAT - 7}V${T}H${sx}V${B}H${L}V${BAT + 7}`]
      : branches.length ? rungX.map(x => `M${L} ${BAT - 7}V${T}H${x}V${B}H${L}V${BAT + 7}`)
      : [`M${L} ${BAT - 7}V${T}H${R}V${B}H${L}V${BAT + 7}`];
    s += loops.map(d => `<path d="${d}" class="bf-flow${o.short ? ' bf-fast' : ''}" fill="none" stroke="${o.short ? C.red : C.sun}" stroke-width="6" stroke-linecap="round" stroke-dasharray="0.1 16"/>`).join('');
  }
  top.forEach((p, i) => {
    const x = topX[i]!;
    s += symbol(p, x, T, false, lit);
    if (p.label) s += tx(x, T + 34, p.label, { size: 13 });
    if (p.reading) s += pill(x, T - 24, p.reading, { size: 13, stroke: C.pond });
  });
  branches.forEach((parts, i) => parts.forEach((p, j) => {
    const x = rungX[i]!, y = rungParts[i]![j]!;
    s += symbol(p, x, y, true, lit);
    if (p.label) s += tx(x + 20, y + 5, p.label, { anchor: 'start', size: 13 });
    if (p.reading) s += pill(x - 18, y + 5, p.reading, { anchor: 'end', size: 13, stroke: C.pond });
  }));
  if (o.across) {
    const x = topX[o.across.at]!, y = T - 40;
    s += `<path d="M${x - 34} ${T}V${y}H${x - 14}M${x + 14} ${y}H${x + 34}V${T}" stroke="${C.ink}" stroke-width="2.5" fill="none"/>` +
      `<circle cx="${x - 34}" cy="${T}" r="4.5" fill="${C.ink}"/><circle cx="${x + 34}" cy="${T}" r="4.5" fill="${C.ink}"/>` +
      symbol({ kind: 'voltmeter' }, x, y, false, false).replace(/<g>.*?<\/g>/, '');
    if (o.across.reading) s += pill(x + 42, y + 5, o.across.reading, { anchor: 'start', size: 13, stroke: C.pond });
  }
  if (o.short) s += pill(sx + 10, (T + B) / 2 + 5, 'oikosulku', { anchor: 'start', fill: C.red, stroke: C.red });
  return figure(400, 222, s, o.label);
}

/** The symbols of a circuit diagram with their names. */
export function symbols(label = 'Virtapiirin merkit'): Paint {
  const items: [string, string][] = [['source', 'paristo'], ['switch', 'kytkin'], ['lamp', 'lamppu'], ['resistor', 'vastus'], ['ammeter', 'virtamittari'], ['voltmeter', 'jännitemittari']];
  let s = '';
  items.forEach(([kind, name], i) => {
    const x = 70 + (i % 3) * 125, y = 52 + Math.floor(i / 3) * 92;
    s += `<rect x="${x - 56}" y="${y - 34}" width="112" height="80" rx="12" fill="#fff" stroke="${C.line}"/>`;
    if (kind === 'source') {
      s += `<path d="M${x - 30} ${y}H${x - 6}M${x + 6} ${y}H${x + 30}" stroke="${C.ink}" stroke-width="3"/>` +
        `<line x1="${x - 6}" y1="${y - 17}" x2="${x - 6}" y2="${y + 17}" stroke="${C.ink}" stroke-width="3.5"/>` +
        `<line x1="${x + 6}" y1="${y - 9}" x2="${x + 6}" y2="${y + 9}" stroke="${C.ink}" stroke-width="7"/>` +
        tx(x - 16, y - 12, '+', { size: 13, fill: C.red, weight: 900 }) + tx(x + 18, y - 12, '−', { size: 13, fill: C.blue, weight: 900 });
    } else {
      s += `<path d="M${x - 30} ${y}H${x - 22}M${x + 22} ${y}H${x + 30}" stroke="${C.ink}" stroke-width="3"/>` +
        symbol({ kind: kind as Part['kind'], open: kind === 'switch' }, x, y, false, false);
    }
    s += tx(x, y + 36, name, { size: 13 });
  });
  return figure(400, 196, s, label);
}

/** Two charged balls: like charges push apart, unlike pull together. */
export function charges(o: { a: '+' | '−'; b: '+' | '−'; colors?: [string, string]; label: string }): Paint {
  const same = o.a === o.b, y = 82;
  const ball = (x: number, sign: string, color?: string) =>
    `<circle cx="${x}" cy="${y}" r="36" fill="${color ?? (sign === '+' ? C.warm : C.cool)}" stroke="${C.ink}" stroke-width="2.5"/>` +
    tx(x, y + 13, sign, { size: 38, weight: 900, fill: sign === '+' ? C.red : C.blue });
  let s = ball(130, o.a, o.colors?.[0]) + ball(270, o.b, o.colors?.[1]);
  s += tx(130, 34, 'A', { size: 14 }) + tx(270, 34, 'B', { size: 14 });
  s += same
    ? arrow(88, y, 30, y, { color: C.pond, width: 4, cls: 'bf-push-l' }) + arrow(312, y, 370, y, { color: C.pond, width: 4, cls: 'bf-push-r' })
    : arrow(170, y, 196, y, { color: C.pond, width: 4 }) + arrow(230, y, 204, y, { color: C.pond, width: 4 });
  s += pill(200, 150, same ? 'samanmerkkiset hylkivät' : 'erimerkkiset vetävät', { size: 14, stroke: C.pond });
  return figure(400, 166, s, o.label);
}

/** Electrons hop from A to B: A is left positive, B negative, the total stays 0. */
export function electronTransfer(o: { n: number; label: string }): Paint {
  let s = `<rect x="40" y="54" width="110" height="80" rx="16" fill="${C.warm}" stroke="${C.ink}" stroke-width="2.5"/>` +
    `<rect x="250" y="54" width="110" height="80" rx="16" fill="${C.cool}" stroke="${C.ink}" stroke-width="2.5"/>` +
    tx(95, 42, 'A', { size: 14 }) + tx(305, 42, 'B', { size: 14 });
  for (let i = 0; i < o.n; i++) {
    s += `<g class="bf-hop" style="animation-delay:${(i * 0.7).toFixed(1)}s"><circle cx="${110 + i * 4}" cy="${94}" r="9" fill="${C.blue}"/>${tx(110 + i * 4, 99, '−', { size: 14, fill: '#fff', weight: 900 })}</g>`;
  }
  s += `<path d="M150 80 Q200 30 250 80" fill="none" stroke="${C.line}" stroke-width="2" stroke-dasharray="5 5"/>`;
  s += pill(95, 160, `A: +${o.n}`, { fill: C.red, size: 14 }) + pill(305, 160, `B: −${o.n}`, { fill: C.blue, size: 14 }) +
    tx(200, 164, `yhteensä ${o.n} − ${o.n} = 0`, { size: 13, fill: C.soft });
  return figure(400, 176, s, o.label);
}

/** Two bar magnets: like poles push apart, unlike poles pull together. */
export function magnets(o: { facing: 'NN' | 'NS'; label: string }): Paint {
  const bar = (x: number, left: 'N' | 'S') => {
    const right = left === 'N' ? 'S' : 'N', col = (p: string) => p === 'N' ? C.red : C.blue;
    return `<rect x="${x}" y="58" width="65" height="44" fill="${col(left)}" rx="6"/><rect x="${x + 65}" y="58" width="65" height="44" fill="${col(right)}" rx="6"/>` +
      `<rect x="${x + 59}" y="58" width="12" height="44" fill="${col(right)}"/>` +
      tx(x + 32, 87, left, { size: 20, fill: '#fff', weight: 900 }) + tx(x + 98, 87, right, { size: 20, fill: '#fff', weight: 900 });
  };
  const same = o.facing === 'NN';
  let s = bar(24, 'S') + bar(same ? 246 : 226, same ? 'N' : 'S');
  s += same
    ? arrow(110, 130, 50, 130, { color: C.pond, width: 4 }) + arrow(290, 130, 350, 130, { color: C.pond, width: 4 })
    : arrow(140, 130, 186, 130, { color: C.pond, width: 4 }) + arrow(260, 130, 214, 130, { color: C.pond, width: 4 });
  s += pill(200, 30, same ? 'N ja N hylkivät' : 'N ja S vetävät', { size: 14, stroke: C.pond });
  return figure(400, 150, s, o.label);
}

/** A magnet holds an iron clip but not a copper coin. */
export function magnetPick(label: string): Paint {
  const u = `<path d="M150 40h40v70a30 30 0 0 0 60 0v-70h40v70a70 70 0 0 1 -140 0Z" fill="${C.red}"/>` +
    `<rect x="150" y="40" width="40" height="22" fill="${C.metal}"/><rect x="250" y="40" width="40" height="22" fill="${C.metal}"/>`;
  const s = `<g transform="rotate(180 220 100)">${u}</g>` +
    `<path d="M162 162v30a8 8 0 0 0 16 0v-24a5 5 0 0 0 -10 0v20" fill="none" stroke="${C.grey}" stroke-width="3.5" stroke-linecap="round"/>` +
    tx(170, 226, 'rauta tarttuu ✓', { size: 13, fill: C.leaf }) +
    `<circle cx="340" cy="196" r="18" fill="#d08a4a" stroke="#9a5a2a" stroke-width="2.5"/>` + tx(340, 230, 'kupari ei ✗', { size: 13, fill: C.red });
  return figure(400, 240, s, label);
}

/** A coil with current is a magnet: N at one end, S at the other. */
export function coil(o: { north: 'left' | 'right'; turns?: number; label: string }): Paint {
  const n = o.turns ?? 8, x0 = 110, x1 = 290, y = 80;
  let s = `<rect x="${x0 - 8}" y="${y - 16}" width="${x1 - x0 + 16}" height="32" rx="6" fill="${C.metal}"/>`;
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * (i + 0.5) / n;
    s += `<ellipse cx="${x}" cy="${y}" rx="7" ry="28" fill="none" stroke="#c07a2c" stroke-width="4"/>`;
  }
  const north = o.north === 'right' ? x1 + 30 : x0 - 30, south = o.north === 'right' ? x0 - 30 : x1 + 30;
  s += tx(north, y + 8, 'N', { size: 24, fill: C.red, weight: 900 }) + tx(south, y + 8, 'S', { size: 24, fill: C.blue, weight: 900 });
  // Field lines: out of N, around, into S.
  for (const k of [1, 2]) {
    const ry = 30 + k * 20;
    s += `<path d="M${north} ${y - 18} C${north} ${y - ry - 18}, ${south} ${y - ry - 18}, ${south} ${y - 18}" fill="none" stroke="${C.pond}" stroke-width="2" stroke-dasharray="6 6" class="bf-flow-slow"/>`;
  }
  // The circuit that feeds the coil.
  s += `<path d="M${x0} ${y + 28}V${y + 80}H180M220 ${y + 80}H${x1}V${y + 28}" fill="none" stroke="${C.ink}" stroke-width="3"/>` +
    `<line x1="194" y1="${y + 66}" x2="194" y2="${y + 94}" stroke="${C.ink}" stroke-width="3.5"/><line x1="206" y1="${y + 72}" x2="206" y2="${y + 88}" stroke="${C.ink}" stroke-width="7"/>` +
    pill(200, y + 120, 'virta → magneettikenttä', { size: 13, stroke: C.pond });
  return figure(400, 218, s, o.label);
}

/** Charges pass a marked spot in a wire: current is charge per second. */
export function chargeFlow(o: { perSecond: string; label: string }): Paint {
  let s = `<rect x="20" y="60" width="360" height="56" rx="28" fill="${C.metal}" stroke="${C.grey}" stroke-width="2"/>` +
    `<line x1="200" y1="44" x2="200" y2="132" stroke="${C.pond}" stroke-width="3" stroke-dasharray="6 5"/>`;
  s += `<path d="M30 88H370" stroke="${C.blue}" stroke-width="12" stroke-linecap="round" stroke-dasharray="0.1 28" class="bf-flow"/>`;
  s += pill(200, 34, 'mittauskohta', { size: 13, stroke: C.pond }) + pill(200, 160, o.perSecond, { size: 14, stroke: C.pond });
  return figure(400, 172, s, o.label);
}

/** Voltage as a drop in energy per coulomb between two points. */
export function voltageDrop(o: { high: string; low: string; value: string; label: string }): Paint {
  let s = `<path d="M40 60H120L280 140H360" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>` +
    `<circle cx="80" cy="60" r="7" fill="${C.ink}"/><circle cx="320" cy="140" r="7" fill="${C.ink}"/>` +
    tx(80, 44, o.high, { size: 15 }) + tx(320, 124, o.low, { size: 15 });
  s += `<g class="bf-roll"><circle cx="0" cy="0" r="9" fill="${C.sun}" stroke="${C.ink}" stroke-width="2"/></g>`;
  s += `<path d="M370 60V140" stroke="${C.pond}" stroke-width="2.5"/>` + arrow(370, 66, 370, 136, { color: C.pond, width: 2.5 });
  s += pill(200, 186, o.value, { size: 14, stroke: C.pond });
  return figure(400, 200, s, o.label);
}

/** Measured (U, I) points of a component: on a line through the origin when the resistance stays the same. */
export function uiGraph(o: { points: [number, number][]; maxU: number; maxI: number; lamp?: boolean; label: string }): Paint {
  const X0 = 60, Y0 = 180, W = 300, H = 150;
  const px = (u: number) => X0 + W * u / o.maxU, py = (i: number) => Y0 - H * i / o.maxI;
  let s = arrow(X0, Y0, X0 + W + 16, Y0, { width: 2 }) + arrow(X0, Y0, X0, Y0 - H - 14, { width: 2 });
  s += tx(X0 + W + 16, Y0 - 8, 'U (V)', { size: 13, anchor: 'end' }) + tx(X0 - 8, Y0 - H - 4, 'I (A)', { size: 13, anchor: 'end' });
  for (let u = 0; u <= o.maxU; u += o.maxU / 4) s += tx(px(u), Y0 + 18, String(u).replace('.', ','), { size: 12, fill: C.soft, weight: 600 });
  for (let i = 1; i <= o.maxI; i++) s += tx(X0 - 10, py(i) + 4, String(i), { size: 12, fill: C.soft, weight: 600, anchor: 'end' }) + `<line x1="${X0}" y1="${py(i)}" x2="${X0 + W}" y2="${py(i)}" stroke="${C.line}" stroke-width="1" stroke-dasharray="3 4"/>`;
  const last = o.points[o.points.length - 1]!;
  s += `<line x1="${X0}" y1="${Y0}" x2="${px(last[0] * 1.08)}" y2="${py(last[1] * 1.08)}" stroke="${C.pond}" stroke-width="3"/>`;
  if (o.lamp) {
    s += `<path d="M${X0} ${Y0} Q${px(o.maxU * 0.3)} ${py(o.maxI * 0.75)} ${px(o.maxU)} ${py(o.maxI * 0.82)}" fill="none" stroke="${C.red}" stroke-width="3" stroke-dasharray="7 5"/>` +
      tx(px(o.maxU) - 4, py(o.maxI * 0.82) - 10, 'hehkulamppu', { size: 12, fill: C.red, anchor: 'end' });
  }
  for (const [u, i] of o.points) s += `<circle cx="${px(u)}" cy="${py(i)}" r="6" fill="${C.sun}" stroke="${C.ink}" stroke-width="2"/>`;
  return figure(400, 206, s, o.label);
}
