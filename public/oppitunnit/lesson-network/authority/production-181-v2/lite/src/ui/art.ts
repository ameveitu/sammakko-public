// Tiny SVG art kit. Everything is drawn from simple shapes so it stays light
// and works in both themes. Colours come from CSS variables where possible.

export const svg = (w: number, h: number, inner: string, label = '') =>
  `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img"${label ? ` aria-label="${label}"` : ' aria-hidden="true"'} xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

/** Loikka the frog, centred at (x,y), height ~ 2*s. */
export function frog(x: number, y: number, s = 30, mood: 'happy' | 'think' = 'happy') {
  const mouth = mood === 'happy'
    ? `<path d="M${x - s * 0.45} ${y + s * 0.15} Q${x} ${y + s * 0.55} ${x + s * 0.45} ${y + s * 0.15}" stroke="#1f4d2b" stroke-width="${s * 0.08}" fill="none" stroke-linecap="round"/>`
    : `<path d="M${x - s * 0.3} ${y + s * 0.3} L${x + s * 0.3} ${y + s * 0.25}" stroke="#1f4d2b" stroke-width="${s * 0.08}" stroke-linecap="round"/>`;
  return `<g>
    <ellipse cx="${x}" cy="${y + s * 0.55}" rx="${s * 1.05}" ry="${s * 0.55}" fill="#3e9b54"/>
    <ellipse cx="${x}" cy="${y + s * 0.1}" rx="${s}" ry="${s * 0.62}" fill="#5cbf6c"/>
    <circle cx="${x - s * 0.5}" cy="${y - s * 0.45}" r="${s * 0.34}" fill="#5cbf6c"/>
    <circle cx="${x + s * 0.5}" cy="${y - s * 0.45}" r="${s * 0.34}" fill="#5cbf6c"/>
    <circle cx="${x - s * 0.5}" cy="${y - s * 0.47}" r="${s * 0.2}" fill="#fff"/>
    <circle cx="${x + s * 0.5}" cy="${y - s * 0.47}" r="${s * 0.2}" fill="#fff"/>
    <circle cx="${x - s * 0.46}" cy="${y - s * 0.45}" r="${s * 0.1}" fill="#1b2a22"/>
    <circle cx="${x + s * 0.54}" cy="${y - s * 0.45}" r="${s * 0.1}" fill="#1b2a22"/>
    <circle cx="${x - s * 0.62}" cy="${y + s * 0.05}" r="${s * 0.1}" fill="#f2a7a0" opacity=".7"/>
    <circle cx="${x + s * 0.62}" cy="${y + s * 0.05}" r="${s * 0.1}" fill="#f2a7a0" opacity=".7"/>
    ${mouth}
  </g>`;
}

/** Aava the duckling. */
export function duck(x: number, y: number, s = 26) {
  return `<g>
    <ellipse cx="${x}" cy="${y + s * 0.5}" rx="${s * 0.95}" ry="${s * 0.6}" fill="#f4c542"/>
    <circle cx="${x + s * 0.35}" cy="${y - s * 0.25}" r="${s * 0.5}" fill="#f7d35c"/>
    <path d="M${x + s * 0.75} ${y - s * 0.25} l${s * 0.45} ${s * 0.1} l-${s * 0.45} ${s * 0.15}z" fill="#ef8a2e"/>
    <circle cx="${x + s * 0.5}" cy="${y - s * 0.38}" r="${s * 0.08}" fill="#1b2a22"/>
    <path d="M${x - s * 0.5} ${y + s * 0.4} q${s * 0.4} -${s * 0.35} ${s * 0.8} 0" stroke="#d9a520" stroke-width="${s * 0.08}" fill="none"/>
  </g>`;
}

type Draw = (x: number, y: number, s: number) => string;

/** Countable objects. Each is visually distinct and nameable. */
export const THINGS: Record<string, { draw: Draw; one: string; many: string }> = {
  marja: { one: 'marja', many: 'marjaa', draw: (x, y, s) => `<circle cx="${x}" cy="${y}" r="${s * 0.45}" fill="#4a5bd4"/><circle cx="${x - s * 0.15}" cy="${y - s * 0.15}" r="${s * 0.1}" fill="#fff" opacity=".6"/>` },
  simpukka: { one: 'simpukka', many: 'simpukkaa', draw: (x, y, s) => `<path d="M${x - s * 0.5} ${y + s * 0.3} Q${x} ${y - s * 0.8} ${x + s * 0.5} ${y + s * 0.3}Z" fill="#f2b58e" stroke="#c97c55" stroke-width="${s * 0.05}"/><path d="M${x} ${y + s * 0.3} L${x} ${y - s * 0.25} M${x - s * 0.25} ${y + s * 0.3} L${x - s * 0.1} ${y - s * 0.2} M${x + s * 0.25} ${y + s * 0.3} L${x + s * 0.1} ${y - s * 0.2}" stroke="#c97c55" stroke-width="${s * 0.05}"/>` },
  lehti: { one: 'lehti', many: 'lehteä', draw: (x, y, s) => `<path d="M${x - s * 0.5} ${y + s * 0.4} Q${x - s * 0.5} ${y - s * 0.5} ${x + s * 0.5} ${y - s * 0.45} Q${x + s * 0.45} ${y + s * 0.45} ${x - s * 0.5} ${y + s * 0.4}Z" fill="#6cb85c"/><path d="M${x - s * 0.45} ${y + s * 0.35} L${x + s * 0.4} ${y - s * 0.38}" stroke="#3f7f34" stroke-width="${s * 0.05}"/>` },
  kivi: { one: 'kivi', many: 'kiveä', draw: (x, y, s) => `<ellipse cx="${x}" cy="${y}" rx="${s * 0.5}" ry="${s * 0.36}" fill="#9aa3a8"/><ellipse cx="${x - s * 0.15}" cy="${y - s * 0.12}" rx="${s * 0.15}" ry="${s * 0.08}" fill="#c4cbcf"/>` },
  kala: { one: 'kala', many: 'kalaa', draw: (x, y, s) => `<ellipse cx="${x - s * 0.08}" cy="${y}" rx="${s * 0.4}" ry="${s * 0.25}" fill="#ef8a2e"/><path d="M${x + s * 0.28} ${y} l${s * 0.25} -${s * 0.22} v${s * 0.44}z" fill="#ef8a2e"/><circle cx="${x - s * 0.28}" cy="${y - s * 0.05}" r="${s * 0.05}" fill="#1b2a22"/>` },
  kukka: { one: 'kukka', many: 'kukkaa', draw: (x, y, s) => [0, 72, 144, 216, 288].map((a) => `<circle cx="${x + Math.cos((a * Math.PI) / 180) * s * 0.28}" cy="${y + Math.sin((a * Math.PI) / 180) * s * 0.28}" r="${s * 0.2}" fill="#f28cb1"/>`).join('') + `<circle cx="${x}" cy="${y}" r="${s * 0.15}" fill="#f4c542"/>` },
  kapy: { one: 'käpy', many: 'käpyä', draw: (x, y, s) => `<ellipse cx="${x}" cy="${y}" rx="${s * 0.28}" ry="${s * 0.45}" fill="#9a6a3c"/><path d="M${x - s * 0.25} ${y - s * 0.15} h${s * 0.5} M${x - s * 0.27} ${y + s * 0.1} h${s * 0.54} M${x - s * 0.2} ${y + s * 0.32} h${s * 0.4}" stroke="#6f4826" stroke-width="${s * 0.06}"/>` },
  tahti: { one: 'meritähti', many: 'meritähteä', draw: (x, y, s) => { const p = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? s * 0.2 : s * 0.5; const a = (i * Math.PI) / 5 - Math.PI / 2; p.push(`${x + Math.cos(a) * r},${y + Math.sin(a) * r}`); } return `<polygon points="${p.join(' ')}" fill="#e8674a"/>`; } },
};
export const THING_KEYS = Object.keys(THINGS);

/** Lay out n objects without overlap inside w×h: random cells of a grid, jittered. */
export function scatter(n: number, w: number, h: number, size: number, rnd: () => number, line = false): { x: number; y: number }[] {
  if (line) {
    const gap = w / (n + 1);
    return Array.from({ length: n }, (_, i) => ({ x: gap * (i + 1), y: h / 2 }));
  }
  const cell = size * 1.2;
  let cols = Math.max(1, Math.floor(w / cell)), rows = Math.max(1, Math.floor(h / cell));
  while (cols * rows < n) { cols++; rows = Math.max(rows, Math.ceil(n / cols)); }
  const cw = w / cols, ch = h / rows;
  const cells = Array.from({ length: cols * rows }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [cells[i], cells[j]] = [cells[j]!, cells[i]!]; }
  const jx = Math.max(0, (cw - size) / 2), jy = Math.max(0, (ch - size) / 2);
  return cells.slice(0, n).map((c) => ({
    x: (c % cols) * cw + cw / 2 + (rnd() * 2 - 1) * jx * 0.8,
    y: Math.floor(c / cols) * ch + ch / 2 + (rnd() * 2 - 1) * jy * 0.8,
  }));
}

/** A group of things as a standalone SVG. */
export function group(thing: string, n: number, rnd: () => number, w = 160, h = 110, size = 30) {
  const t = THINGS[thing]!;
  return svg(w, h, scatter(n, w, h, size, rnd).map((p) => t.draw(p.x, p.y, size)).join(''), `${n} ${n === 1 ? t.one : t.many}`);
}

/** A row of dots (for ten-frame-like support in teaching only). */
export const dots = (n: number) => svg(n * 22 + 4, 24, Array.from({ length: n }, (_, i) => `<circle cx="${13 + i * 22}" cy="12" r="8" fill="currentColor"/>`).join(''));

export const ICON = {
  speaker: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  undo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7H4v5" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M4.5 12A8 8 0 1 0 7 6.5L4 9.5" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2.5" fill="none"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" fill="currentColor"/></svg>',
  eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="currentColor"/></svg>',
  mute: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 9.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  starOutline: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.6l2.6 5.4 5.9.7-4.4 4.1 1.2 5.9L12 16.8l-5.3 2.9 1.2-5.9-4.4-4.1 5.9-.7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  replay: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.5-5.8" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M4 4v5h5" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
};

/** Sulka the researcher: a tall grey-blue heron with round glasses and a white lab coat.
 *  Deliberately unlike Aava (small yellow duckling). */
export function sulka(x: number, y: number, s = 26) {
  return `<g>
    <path d="M${x - s * 0.2} ${y + s * 1.1} l-${s * 0.1} ${s * 0.5} M${x + s * 0.2} ${y + s * 1.1} l${s * 0.1} ${s * 0.5}" stroke="#c98a3c" stroke-width="${s * 0.08}"/>
    <path d="M${x - s * 0.55} ${y + s * 1.15} L${x - s * 0.4} ${y - s * 0.1} Q${x} ${y - s * 0.35} ${x + s * 0.4} ${y - s * 0.1} L${x + s * 0.55} ${y + s * 1.15}Z" fill="#fff" stroke="#c9d2d6" stroke-width="${s * 0.05}"/>
    <path d="M${x} ${y - s * 0.2} V${y + s * 1.1}" stroke="#c9d2d6" stroke-width="${s * 0.04}"/>
    <circle cx="${x + s * 0.12}" cy="${y + s * 0.35}" r="${s * 0.05}" fill="#9aa3a8"/><circle cx="${x + s * 0.12}" cy="${y + s * 0.6}" r="${s * 0.05}" fill="#9aa3a8"/>
    <path d="M${x - s * 0.05} ${y - s * 0.25} Q${x - s * 0.15} ${y - s * 0.7} ${x + s * 0.05} ${y - s * 0.95}" stroke="#7d93a6" stroke-width="${s * 0.22}" fill="none" stroke-linecap="round"/>
    <circle cx="${x + s * 0.12}" cy="${y - s * 1.05}" r="${s * 0.3}" fill="#8aa0b4"/>
    <path d="M${x + s * 0.38} ${y - s * 1.08} l${s * 0.7} ${s * 0.08} l-${s * 0.7} ${s * 0.1}z" fill="#e0b040"/>
    <circle cx="${x + s * 0.2}" cy="${y - s * 1.1}" r="${s * 0.13}" fill="#fff" stroke="#333" stroke-width="${s * 0.05}"/>
    <circle cx="${x + s * 0.22}" cy="${y - s * 1.1}" r="${s * 0.05}" fill="#1b2a22"/>
    <path d="M${x - s * 0.1} ${y - s * 1.3} q-${s * 0.3} -${s * 0.1} -${s * 0.45} ${s * 0.1}" stroke="#5f7486" stroke-width="${s * 0.06}" fill="none"/>
  </g>`;
}

/** The expedition craft: only the installed modules are drawn. The chassis already rolls. */
export function craft(x: number, y: number, s: number, o: { chassis?: boolean; wings?: 'leveat' | 'kapeat'; engine?: boolean; pennant?: string; spin?: boolean }) {
  let g = '';
  if (o.wings) g += o.wings === 'leveat'
    ? `<path d="M${x - s * 0.5} ${y - s * 0.25} L${x - s * 0.1} ${y - s * 1.1} L${x + s * 0.35} ${y - s * 1.05} L${x + s * 0.25} ${y - s * 0.25}Z" fill="#9fd3e8" stroke="#4b8fb0" stroke-width="2"/>`
    : `<path d="M${x - s * 0.35} ${y - s * 0.25} L${x + s * 0.05} ${y - s * 0.75} L${x + s * 0.3} ${y - s * 0.72} L${x + s * 0.2} ${y - s * 0.25}Z" fill="#f2b58e" stroke="#c97c55" stroke-width="2"/>`;
  if (o.chassis) g += `<rect x="${x - s * 0.8}" y="${y - s * 0.32}" width="${s * 1.6}" height="${s * 0.34}" rx="${s * 0.12}" fill="#c8874a" stroke="#8a5a2c" stroke-width="2"/>
    <circle cx="${x - s * 0.5}" cy="${y + s * 0.08}" r="${s * 0.17}" fill="#333"/><circle cx="${x + s * 0.5}" cy="${y + s * 0.08}" r="${s * 0.17}" fill="#333"/>
    <circle cx="${x - s * 0.5}" cy="${y + s * 0.08}" r="${s * 0.06}" fill="#bbb"/><circle cx="${x + s * 0.5}" cy="${y + s * 0.08}" r="${s * 0.06}" fill="#bbb"/>
    <path d="M${x - s * 0.7} ${y - s * 0.32} V${y - s * 0.8}" stroke="#6f4826" stroke-width="2"/><path d="M${x - s * 0.7} ${y - s * 0.8} l${s * 0.32} ${s * 0.1} l-${s * 0.32} ${s * 0.12}z" fill="${o.pennant ?? '#e8674a'}"/>`;
  else g += `<rect x="${x - s * 0.8}" y="${y - s * 0.32}" width="${s * 1.6}" height="${s * 0.34}" rx="${s * 0.12}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4" opacity=".55"/>`;
  if (o.engine) g += `<g transform="translate(${x + s * 0.85} ${y - s * 0.15})"><circle r="${s * 0.08}" fill="#555"/><g class="${o.spin ? 'spin' : ''}"><ellipse rx="${s * 0.06}" ry="${s * 0.38}" fill="#7a7a7a"/></g></g>`;
  return g;
}
