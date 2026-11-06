// Real-time duration scenes for the early time lessons. A lantern burns for real seconds and
// a stopwatch beside it runs only while it burns; nothing here is a static stand-in for time.
import { duck, frog } from '../ui/art';
import { anim, type AnimPaint } from '../ui/anim';

export interface Burn { on: number; len: number; color: string; label?: string }

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
/** Whole seconds a lamp has burned by time t. */
export const burned = (b: Burn, t: number) => Math.floor(clamp(t - b.on, 0, b.len) + 1e-6);

export function lantern(x: number, y: number, lit: boolean, color: string) {
  const glow = lit ? `<circle cx="${x}" cy="${y}" r="30" fill="${color}" opacity=".22"/><circle cx="${x}" cy="${y}" r="20" fill="${color}" opacity=".3"/>` : '';
  return `${glow}<rect x="${x - 3}" y="${y - 34}" width="6" height="8" fill="#555"/><path d="M${x - 14} ${y - 26} H${x + 14} L${x + 11} ${y + 18} H${x - 11}Z" fill="${lit ? color : '#d6d6d6'}" stroke="#555" stroke-width="2.5"/>` +
    (lit ? `<path d="M${x} ${y + 8} Q${x - 6} ${y - 2} ${x} ${y - 12} Q${x + 6} ${y - 2} ${x} ${y + 8}Z" fill="#fff6c8"/>` : '') +
    `<rect x="${x - 16}" y="${y + 18}" width="32" height="6" rx="2" fill="#555"/>`;
}

/** A stopwatch whose hand goes round once in ten seconds, one tick per second. */
export function stopwatch(x: number, y: number, secs: number, running: boolean) {
  const a = (k: number) => (k / 10) * 2 * Math.PI;
  const ticks = Array.from({ length: 10 }, (_, k) => `<line x1="${x + 14 * Math.sin(a(k))}" y1="${y - 14 * Math.cos(a(k))}" x2="${x + 17 * Math.sin(a(k))}" y2="${y - 17 * Math.cos(a(k))}" stroke="currentColor" stroke-width="1.5"/>`).join('');
  return `<circle cx="${x}" cy="${y}" r="19" fill="var(--card, #fff)" stroke="${running ? '#2a9d55' : 'currentColor'}" stroke-width="3"/><rect x="${x - 3}" y="${y - 25}" width="6" height="5" fill="currentColor"/>` + ticks +
    `<line x1="${x}" y1="${y}" x2="${x + 13 * Math.sin(a(secs % 10))}" y2="${y - 13 * Math.cos(a(secs % 10))}" stroke="#d9534f" stroke-width="3" stroke-linecap="round"/>` +
    `<text x="${x}" y="${y + 38}" text-anchor="middle" font-size="17" font-weight="800" fill="currentColor">${secs} s</text>`;
}

/** Lanterns that burn for real seconds; each has its own stopwatch (unless hidden). */
export function burnScene(lamps: Burn[], opts: { watches?: boolean; say?: (t: number) => string } = {}): AnimPaint {
  const end = Math.max(...lamps.map((b) => b.on + b.len)) + 1;
  const W = 300, H = opts.watches === false ? 110 : 170, gap = W / lamps.length;
  return anim({
    dur: end, w: W, h: H, label: lamps.length === 1 ? 'Palava lyhty ja sekuntikello' : 'Palavat lyhdyt ja sekuntikellot',
    frame: (t) => lamps.map((b, i) => {
      const x = gap * (i + 0.5), lit = t >= b.on && t < b.on + b.len;
      return lantern(x, 48, lit, b.color) + (b.label ? `<text x="${x}" y="100" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">${b.label}</text>` : '') +
        (opts.watches === false ? '' : stopwatch(x, 128 - (b.label ? 0 : 6), burned(b, t), lit));
    }).join(''),
    caption: opts.say,
  });
}

/** One lantern, two counters: Loikka claps fast and Aava slowly while it burns. The stopwatch
 *  gives the same answer for everyone: an agreed unit. */
export function clapScene(len: number, fast: number, slow: number): AnimPaint {
  const b: Burn = { on: 1, len, color: '#f4c542' };
  const claps = (t: number, every: number) => Math.floor(clamp(t - b.on, 0, len - 1e-6) / every + 1e-6) + (t >= b.on ? 1 : 0);
  const fe = len / fast, se = len / slow;
  return anim({
    dur: len + 2, w: 300, h: 170, label: 'Lyhty, sekuntikello ja kaksi taputtajaa',
    frame: (t) => {
      const lit = t >= b.on && t < b.on + len;
      const cf = Math.min(fast, claps(t, fe)), cs = Math.min(slow, claps(t, se));
      const pulse = (every: number) => lit && ((t - b.on) % every) < 0.18;
      return lantern(150, 50, lit, b.color) + stopwatch(150, 122, burned(b, t), lit) +
        frog(52, 70, pulse(fe) ? 40 : 34) + `<text x="52" y="122" text-anchor="middle" font-size="15" font-weight="800" fill="currentColor">👏 ${cf}</text><text x="52" y="142" text-anchor="middle" font-size="12" fill="currentColor">Loikka</text>` +
        duck(248, 70, pulse(se) ? 32 : 27) + `<text x="248" y="122" text-anchor="middle" font-size="15" font-weight="800" fill="currentColor">👏 ${cs}</text><text x="248" y="142" text-anchor="middle" font-size="12" fill="currentColor">Aava</text>`;
    },
  });
}

/** Loikka hops for a seconds, then swims for b seconds; each activity has its own stopwatch. */
export function hopSwimScene(a: number, b: number): AnimPaint {
  const end = a + b + 2;
  return anim({
    dur: end, w: 300, h: 170, label: 'Loikka hyppii ja ui, kaksi sekuntikelloa',
    frame: (t) => {
      const hop = t >= 0.5 && t < 0.5 + a, swim = t >= 1 + a && t < 1 + a + b;
      const ha = Math.floor(clamp(t - 0.5, 0, a) + 1e-6), sb = Math.floor(clamp(t - 1 - a, 0, b) + 1e-6);
      const x = hop ? 30 + ((t - 0.5) / a) * 100 : t < 0.5 ? 30 : swim ? 150 + ((t - 1 - a) / b) * 120 : t < 1 + a ? 140 : 270;
      const y = hop ? 66 - Math.abs(Math.sin((t - 0.5) * Math.PI * 2)) * 22 : x >= 140 ? 76 : 66;
      return `<rect x="0" y="80" width="140" height="10" fill="#8bc47a"/><rect x="140" y="80" width="160" height="16" fill="#7fb8e0"/>` +
        frog(x, y, 30) + stopwatch(70, 122, ha, hop) + `<text x="70" y="18" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">hyppii</text>` +
        stopwatch(220, 122, sb, swim) + `<text x="220" y="18" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">ui</text>`;
    },
  });
}

/** Candles that burn down in real time: the longer a candle burns, the shorter it gets, so the
 *  stubs keep a record of how long each burned, even when they were lit at different moments. */
export function candleScene(lamps: Burn[], opts: { say?: (t: number) => string; names?: string[] } = {}): AnimPaint {
  const end = Math.max(...lamps.map((b) => b.on + b.len)) + 1.2;
  const W = 300, H = 180, gap = W / lamps.length, TOP = 120, RATE = 12, BASE = 150;
  return anim({
    dur: end, w: W, h: H, label: lamps.length === 1 ? 'Palava kynttilä' : 'Palavat kynttilät',
    frame: (t) => lamps.map((b, i) => {
      const x = gap * (i + 0.5), lit = t >= b.on && t < b.on + b.len;
      const burnt = clamp(t - b.on, 0, b.len) * RATE, top = BASE - TOP + burnt;
      const fl = lit ? 1 + 0.12 * Math.sin(t * 17 + i * 2) : 0;
      return `<line x1="${x - 34}" y1="${BASE - TOP}" x2="${x + 34}" y2="${BASE - TOP}" stroke="currentColor" stroke-dasharray="3 4" opacity=".35"/>` +
        `<rect x="${x - 15}" y="${top}" width="30" height="${BASE - top}" rx="4" fill="${b.color}"/>` +
        `<line x1="${x}" y1="${top}" x2="${x}" y2="${top - 7}" stroke="#333" stroke-width="2"/>` +
        (lit ? `<circle cx="${x}" cy="${top - 14}" r="16" fill="#f4c542" opacity=".25"/><path d="M${x} ${top - 6} Q${x - 7 * fl} ${top - 14} ${x} ${top - 6 - 20 * fl} Q${x + 7 * fl} ${top - 14} ${x} ${top - 6}Z" fill="#ffb02e"/>` : '') +
        `<rect x="${x - 30}" y="${BASE}" width="60" height="8" rx="3" fill="#8a7a5c"/>` +
        (opts.names?.[i] ? `<text x="${x}" y="${BASE + 24}" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">${opts.names[i]}</text>` : '');
    }).join(''),
    caption: opts.say,
  });
}
