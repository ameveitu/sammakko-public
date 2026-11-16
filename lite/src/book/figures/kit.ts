import type { Paint } from '../../engine/types';

/**
 * Shared drawing kit for the book's own figures: one palette, one text style, readable sizes.
 * Figures are drawn in a viewBox about 380 wide, shown 400–580 px wide, so 13 units ≈ 15 px text.
 */
export const C = {
  ink: '#163e46', soft: '#536c6c', line: '#9fb3a8', paper: '#fffaf0', pond: '#176b65', leaf: '#2f9e5b',
  sun: '#f4c542', glow: '#ffe58a', red: '#e0533f', blue: '#3b7fd6', sky: '#cfe3f7', warm: '#fbe2db', cool: '#dbe9f8',
  grey: '#8a9690', metal: '#b9c4c9', purple: '#7a5bc7',
} as const;

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

type TextOpts = { size?: number; anchor?: 'start' | 'middle' | 'end'; fill?: string; weight?: number; cls?: string; italic?: boolean };
/** A text label. */
export function tx(x: number, y: number, s: string, o: TextOpts = {}) {
  return `<text x="${x}" y="${y}" font-size="${o.size ?? 13}" text-anchor="${o.anchor ?? 'middle'}" fill="${o.fill ?? C.ink}" font-weight="${o.weight ?? 700}"${o.italic ? ' font-style="italic"' : ''}${o.cls ? ` class="${o.cls}"` : ''}>${esc(s)}</text>`;
}

/** A text on a light pill, for readings and values that sit on top of a drawing. */
export function pill(x: number, y: number, s: string, o: TextOpts & { bg?: string; stroke?: string } = {}) {
  const size = o.size ?? 13, w = Math.max(24, s.length * size * 0.58 + 16), h = size + 9;
  const left = o.anchor === 'start' ? x : o.anchor === 'end' ? x - w : x - w / 2;
  return `<rect x="${left}" y="${y - h + 5}" width="${w}" height="${h}" rx="${h / 2}" fill="${o.bg ?? '#fff'}" stroke="${o.stroke ?? C.line}" stroke-width="1"/>` +
    tx(left + w / 2, y, s, { ...o, anchor: 'middle' });
}

/** An arrow from (x1,y1) to (x2,y2). */
export function arrow(x1: number, y1: number, x2: number, y2: number, o: { color?: string; width?: number; head?: number; cls?: string; dash?: string } = {}) {
  const color = o.color ?? C.ink, w = o.width ?? 3, head = o.head ?? 9;
  const a = Math.atan2(y2 - y1, x2 - x1), bx = x2 - head * Math.cos(a), by = y2 - head * Math.sin(a);
  const l = [bx + head * 0.55 * Math.sin(a), by - head * 0.55 * Math.cos(a)], r = [bx - head * 0.55 * Math.sin(a), by + head * 0.55 * Math.cos(a)];
  return `<g${o.cls ? ` class="${o.cls}"` : ''}><line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>` +
    `<path d="M${x2} ${y2} L${l[0]} ${l[1]} L${r[0]} ${r[1]} Z" fill="${color}"/></g>`;
}

/** The whole figure: an SVG with the book-figure class (animations and reduced motion live in book.css). */
export function figure(w: number, h: number, inner: string, label: string): Paint {
  const markup = `<svg class="bf" viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  return host => { host.innerHTML = markup; };
}

/** A figure made of HTML (formula cards and the like). */
export function html(markup: string): Paint {
  return host => { host.innerHTML = markup; };
}

/** Points packed in a disc (sunflower pattern): for nuclei and particle clusters. */
export function packed(n: number, cx: number, cy: number, step: number): [number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const r = step * Math.sqrt(i + 0.5) * 0.62, a = i * 2.39996;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
  });
}

/** A small deterministic random sequence, so a figure looks the same every time. */
export function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; };
}
