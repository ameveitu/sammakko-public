// Safety shown in time: Aava gets ready step by step (listen, wait for permission, goggles), and
// in a mishap she stops, steps back and calls an adult instead of handling it herself.
import { anim, ease, type AnimPaint } from '../ui/anim';
import { duck } from '../ui/art';

const FLOOR = 206;
const adult = (x: number, wave = 0) =>
  `<g><rect x="${x - 15}" y="96" width="30" height="${FLOOR - 96}" rx="12" fill="var(--pond)"/><circle cx="${x}" cy="80" r="15" fill="#e9b98f" stroke="currentColor" stroke-width="1.5"/>` +
  `<line x1="${x - 13}" y1="108" x2="${x - 26}" y2="${140 - 30 * wave}" stroke="var(--pond)" stroke-width="8" stroke-linecap="round"/>` +
  `<text x="${x}" y="${FLOOR + 12}" text-anchor="middle" font-size="10" font-weight="800" fill="var(--soft)">aikuinen</text></g>`;
const goggles = (x: number, y: number, s: number, op = 1) =>
  `<g opacity="${op}"><line x1="${x - s * 0.1}" y1="${y - s * 0.42}" x2="${x + s * 0.8}" y2="${y - s * 0.42}" stroke="#2b5d8a" stroke-width="${s * 0.1}"/><rect x="${x + s * 0.32}" y="${y - s * 0.56}" width="${s * 0.38}" height="${s * 0.3}" rx="${s * 0.12}" fill="rgba(160,210,255,.55)" stroke="#2b5d8a" stroke-width="2.5"/></g>`;
const bubble = (x: number, y: number, w: number, txt: string, op = 1, tail: 'l' | 'r' = 'l') =>
  `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="30" rx="12" fill="var(--card)" stroke="currentColor" stroke-width="2"/>` +
  `<path d="M${tail === 'l' ? x + 16 : x + w - 16} ${y + 29} l${tail === 'l' ? -8 : 8} 12 l${tail === 'l' ? 16 : -16} -12" fill="var(--card)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>` +
  `<text x="${x + w / 2}" y="${y + 20}" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor">${txt}</text></g>`;
const stopSign = (x: number, y: number, g: number) => {
  const r = 22 * (0.3 + 0.7 * g), pts = Array.from({ length: 8 }, (_, i) => { const a = Math.PI / 8 + (i * Math.PI) / 4; return `${x + r * Math.cos(a)},${y + r * Math.sin(a)}`; }).join(' ');
  return `<g opacity="${g}"><polygon points="${pts}" fill="var(--bad)" stroke="#fff" stroke-width="2.5"/><text x="${x}" y="${y + 5 * (0.3 + 0.7 * g)}" text-anchor="middle" font-size="${13 * (0.3 + 0.7 * g)}" font-weight="900" fill="#fff">SEIS</text></g>`;
};
const table = (x0: number, x1: number, y: number) => `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="8" rx="3" fill="#b07a45"/><rect x="${x0 + 8}" y="${y + 8}" width="6" height="${FLOOR - y - 8}" fill="#8a5a33"/><rect x="${x1 - 14}" y="${y + 8}" width="6" height="${FLOOR - y - 8}" fill="#8a5a33"/>`;

/** Getting ready: listen to the end, wait for permission, goggles on, then work by the instructions. */
export function prepScene(): AnimPaint {
  const W = 320, H = 226, AX = 120, AY = 172, S = 30;
  const steps = ['Kuuntele ohje', 'Odota lupaa', 'Suojalasit', 'Ohjeen mukaan'], TK = [2.8, 4.9, 6.3, 8.2];
  return anim({
    dur: 10.4, w: W, h: H, label: 'Tutkijan valmistautuminen',
    frame: (t) => {
      let s = `<line x1="0" y1="${FLOOR}" x2="${W}" y2="${FLOOR}" stroke="var(--line)" stroke-width="3"/>` + table(150, 210, 170);
      s += adult(40, ease(t, 4.3, 4.6) * (1 - ease(t, 5.4, 5.8)));
      s += duck(AX, AY, S) + goggles(AX, AY, S, 0);
      // 1. instructions: three lines appear in the bubble
      if (t > 0.3 && t < 3.2) {
        const op = ease(t, 0.3, 0.6) * (1 - ease(t, 2.9, 3.2));
        s += `<g opacity="${op}"><rect x="62" y="14" width="96" height="58" rx="12" fill="var(--card)" stroke="currentColor" stroke-width="2"/>`;
        for (let i = 0; i < 3; i++) { const g = ease(t, 0.7 + i * 0.6, 1.2 + i * 0.6); s += `<text x="70" y="${32 + i * 15}" font-size="11" font-weight="800" fill="currentColor">${i + 1}.</text><rect x="84" y="${25 + i * 15}" width="${62 * g}" height="7" rx="3" fill="var(--soft)"/>`; }
        s += `</g>`;
      }
      // 2. waiting: a clock above Aava, then the adult says go
      if (t > 3.2 && t < 5.6) {
        const op = ease(t, 3.2, 3.5) * (1 - ease(t, 5.2, 5.6)), a = ease(t, 3.4, 4.3) * Math.PI * 2;
        s += `<g opacity="${op}"><circle cx="${AX}" cy="${AY - 58}" r="14" fill="var(--card)" stroke="currentColor" stroke-width="2"/><line x1="${AX}" y1="${AY - 58}" x2="${AX + 10 * Math.sin(a)}" y2="${AY - 58 - 10 * Math.cos(a)}" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></g>`;
        s += bubble(58, 20, 110, 'Nyt saa aloittaa!', ease(t, 4.3, 4.6) * (1 - ease(t, 5.3, 5.6)));
      }
      // 3. goggles slide down onto the eyes
      const gg = ease(t, 5.6, 6.3);
      if (gg > 0) s += `<g transform="translate(0 ${-50 * (1 - gg)})">${goggles(AX, AY, S, Math.min(1, gg * 2))}</g>`;
      // 4. careful work: a beaker with rising bubbles
      const bk = ease(t, 6.5, 6.9);
      if (bk > 0) {
        s += `<g opacity="${bk}"><path d="M170 136 L170 168 Q170 170 172 170 L190 170 Q192 170 192 168 L192 136" fill="rgba(120,180,240,.35)" stroke="currentColor" stroke-width="2"/>`;
        for (let i = 0; i < 3; i++) { const p = ((t - 6.8 + i * 0.4) % 1.2) / 1.2; if (t > 6.8) s += `<circle cx="${176 + i * 6}" cy="${166 - p * 26}" r="2.5" fill="#fff" stroke="#2b5d8a" stroke-width="1" opacity="${1 - p}"/>`; }
        s += `</g>`;
      }
      // checklist
      steps.forEach((st, i) => {
        const y = 22 + i * 30, tick = ease(t, TK[i]!, TK[i]! + 0.3);
        s += `<rect x="198" y="${y}" width="18" height="18" rx="4" fill="${tick > 0 ? 'var(--ok-soft)' : 'var(--card)'}" stroke="${tick > 0 ? 'var(--ok)' : 'var(--line)'}" stroke-width="2"/>`;
        if (tick > 0) s += `<path d="M202 ${y + 9} l4 5 l7 -10" fill="none" stroke="var(--ok)" stroke-width="3" stroke-linecap="round" stroke-dasharray="20" stroke-dashoffset="${20 * (1 - tick)}"/>`;
        s += `<text x="222" y="${y + 13}" font-size="11" font-weight="800" fill="${tick > 0 ? 'currentColor' : 'var(--soft)'}">${st}</text>`;
      });
      return s;
    },
    caption: (t) => t < 3 ? 'Aikuinen kertoo ohjeen. Aava kuuntelee loppuun asti.'
      : t < 5.1 ? 'Aava odottaa, kunnes aikuinen antaa luvan.'
      : t < 6.4 ? 'Ennen työtä suojalasit silmille.'
      : t < 8.4 ? 'Nyt Aava tekee juuri niin kuin ohjeessa sanottiin.'
      : 'Kuuntele, odota lupaa, suojaa silmät ja tee ohjeen mukaan.',
  });
}

export type Hazard = 'lasi' | 'pullo' | 'vesi' | 'levy';
const HZ: Record<Hazard, { what: string; call: string; rule: string }> = {
  lasi: { what: 'Lasipurkki putoaa ja menee rikki!', call: 'Aikuinen, lasi meni rikki!', rule: 'Sirpaleisiin ei kosketa. Aikuinen siivoaa ne.' },
  pullo: { what: 'Pöydällä on pullo, jossa ei ole nimeä.', call: 'Mikä tämä pullo on?', rule: 'Tuntematonta ainetta ei haisteta eikä maisteta. Kysy aikuiselta.' },
  vesi: { what: 'Vettä läikkyy lattialle johdon viereen!', call: 'Aikuinen, vettä johdon luona!', rule: 'Vesi ja sähkö ovat vaarallisia yhdessä. Aikuinen hoitaa.' },
  levy: { what: 'Keittolevy kuumenee punaiseksi.', call: 'Aikuinen, levy on kuuma!', rule: 'Kuumaan ei kosketa, eikä sen kanssa toimita yksin.' },
};

/** Something goes wrong; with `reveal` Aava stops, steps back and calls an adult who comes. */
export function hazardScene(k: Hazard, reveal = true): AnimPaint {
  const W = 320, H = 226, S = 30, AY = 172, T1 = 2.6, end = reveal ? 7.2 : T1 + 1.2;
  return anim({
    dur: end + 2, w: W, h: H, label: HZ[k].what,
    frame: (t) => {
      let s = `<line x1="0" y1="${FLOOR}" x2="${W}" y2="${FLOOR}" stroke="var(--line)" stroke-width="3"/>` + table(140, 230, 150);
      const back = reveal ? ease(t, 3.2, 3.8) : 0, lean = k === 'pullo' ? ease(t, 0.8, 1.8) * (1 - back) : 0;
      const AX = 80 + 22 * lean - 26 * back;
      if (k === 'lasi') {
        const slide = ease(t, 0.4, 1.0), fall = ease(t, 1.0, 1.45), boom = ease(t, 1.45, 2.1);
        const jx = 200 + 40 * slide + 8 * fall, jy = 150 + (FLOOR - 150) * fall * fall;
        if (boom <= 0) s += `<g transform="rotate(${70 * fall} ${jx} ${jy})"><rect x="${jx - 10}" y="${jy - 26}" width="20" height="26" rx="4" fill="rgba(160,210,255,.6)" stroke="currentColor" stroke-width="2"/><rect x="${jx - 11}" y="${jy - 30}" width="22" height="5" rx="2" fill="#b07a45"/></g>`;
        else for (let i = 0; i < 7; i++) { const a = Math.PI * (1.05 + i * 0.15), d = 10 + 26 * boom * (0.6 + (i % 3) * 0.25), x = 248 + d * Math.cos(a) * -1, y = FLOOR - 3 - Math.abs(Math.sin(a)) * 14 * Math.sin(Math.PI * boom); s += `<path d="M${x} ${y} l6 -7 l4 9z" fill="rgba(160,210,255,.8)" stroke="currentColor" stroke-width="1.2" transform="rotate(${i * 50 * boom} ${x} ${y})"/>`; }
      } else if (k === 'pullo') {
        s += `<path d="M190 150 L190 116 Q190 110 196 108 L196 98 L206 98 L206 108 Q212 110 212 116 L212 150Z" fill="#9b7fd1" stroke="currentColor" stroke-width="2"/><rect x="193" y="120" width="16" height="16" rx="3" fill="#fff"/><text x="201" y="133" text-anchor="middle" font-size="13" font-weight="900" fill="var(--bad)">?</text>`;
      } else if (k === 'vesi') {
        const tip = ease(t, 0.4, 1.0), spill = ease(t, 1.0, 2.4);
        s += `<g transform="rotate(${-80 * tip} 176 150)"><rect x="166" y="126" width="20" height="24" rx="3" fill="#fff" stroke="currentColor" stroke-width="2"/><rect x="168" y="${132 + 14 * tip}" width="16" height="${16 - 14 * tip}" fill="rgba(90,160,230,.7)"/></g>`;
        if (spill > 0) s += `<path d="M150 150 q-4 ${28 * spill} -2 ${54 * spill}" stroke="rgba(90,160,230,.8)" stroke-width="${4 * (1 - spill * 0.5)}" fill="none" opacity="${1 - ease(t, 2.2, 2.6)}"/><ellipse cx="${150 + 40 * spill}" cy="${FLOOR - 2}" rx="${10 + 56 * spill}" ry="${3 + 3 * spill}" fill="rgba(90,160,230,.6)"/>`;
        s += `<path d="M${W} ${FLOOR - 4} L262 ${FLOOR - 4}" stroke="#333" stroke-width="4"/><rect x="246" y="${FLOOR - 12}" width="18" height="14" rx="3" fill="#ddd" stroke="#333" stroke-width="2"/><path d="M256 ${FLOOR - 34} l-8 12 h7 l-5 12 l12 -16 h-7 l5 -8z" fill="var(--sun)" stroke="currentColor" stroke-width="1" opacity="${ease(t, 2.0, 2.4)}"/>`;
      } else {
        const heat = ease(t, 0.4, 2.2);
        s += `<rect x="176" y="140" width="44" height="10" rx="3" fill="#555"/><ellipse cx="198" cy="140" rx="18" ry="3.5" fill="rgb(${90 + 150 * heat},${90 - 40 * heat},${90 - 50 * heat})"/>`;
        for (let i = 0; i < 3; i++) { const p = ((t + i * 0.5) % 1.5) / 1.5; if (heat > 0.3) s += `<path d="M${188 + i * 10} ${134 - p * 30} q4 -5 0 -10 q-4 -5 0 -10" stroke="var(--bad)" stroke-width="2" fill="none" opacity="${(1 - p) * heat}"/>`; }
      }
      s += duck(AX, AY, S);
      if (!reveal && t > T1) s += `<text x="${AX + 10}" y="${AY - 40}" text-anchor="middle" font-size="30" font-weight="900" fill="var(--pond)" opacity="${ease(t, T1, T1 + 0.4)}">?</text>`;
      if (reveal) {
        const sg = ease(t, 2.8, 3.2);
        if (sg > 0) s += stopSign(k === 'lasi' ? 228 : k === 'vesi' ? 214 : 200, k === 'lasi' || k === 'vesi' ? 108 : 84, sg);
        s += bubble(20, 20, 196, HZ[k].call, ease(t, 3.9, 4.2) * (1 - ease(t, 6.4, 6.7)), 'l');
        const walk = ease(t, 4.6, 6.0);
        if (walk > 0) s += adult(W + 30 - 58 * walk, ease(t, 6.0, 6.3));
      }
      return s;
    },
    caption: (t) => {
      if (t < T1) return HZ[k].what;
      if (!reveal) return 'Mitä Aavan pitää tehdä nyt?';
      if (t < 3.9) return 'Seis! Aava ei koske, vaan astuu kauemmas.';
      if (t < 6.2) return 'Aava kertoo heti aikuiselle.';
      return HZ[k].rule;
    },
  });
}
