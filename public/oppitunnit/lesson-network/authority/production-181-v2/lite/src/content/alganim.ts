// Equations as a balance: take the same weight off both pans and the beam stays level.
// Taking it off one pan only tips the beam — the classic "do it to both sides" lesson.
import { anim, ease, type AnimPaint } from '../ui/anim';
import { balanceBody } from './pics';

const wgt = (x: number, y: number, k: string | number) =>
  `<path d="M${x - 13} ${y} l3 -22 h20 l3 22z" fill="#7c8a96" stroke="#4d5963" stroke-width="2"/><rect x="${x - 4}" y="${y - 27}" width="8" height="6" rx="2" fill="#4d5963"/><text x="${x}" y="${y - 6}" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">${k}</text>`;

/** Bag + a = s. Split s into a and x, try removing a from the left only (tips), then from both (level). */
export function bagScene(a: number, x: number): AnimPaint {
  const W = 300, H = 250, s = a + x, arm = W * 0.28, cx = W / 2;
  const T1 = 1.6, T2 = 3.0, T3 = 5.2, T4 = 6.4, T5 = 8.4, T6 = 9.6;
  const panY = (side: -1 | 1, tilt: number) => 52 + side * tilt * 14 + 60;
  return anim({
    dur: T6 + 3.5, w: W, h: H, label: `□ + ${a} = ${s}`,
    frame: (t) => {
      // Tilt: right side goes down while the left a is lifted alone.
      const tilt = t < T2 ? 0 : t < T3 ? ease(t, T2 + 0.3, T2 + 1.1) : t < T4 ? 1 - ease(t, T3, T3 + 0.8) : 0;
      const split = t >= T1;
      const liftL = t >= T2 && t < T4 ? (t < T3 ? ease(t, T2, T2 + 0.8) : 1 - ease(t, T3, T3 + 0.8)) : t >= T4 ? ease(t, T4, T4 + 0.9) : 0;
      const liftR = t >= T4 ? ease(t, T4, T4 + 0.9) : 0;
      const left = ['x', ...(liftL > 0 ? [] : [String(a)])];
      const right = split ? [...(liftR > 0 ? [] : [String(a)]), String(x)] : [String(s)];
      let g = balanceBody(t >= T6 ? [String(x)] : left, right, tilt, W);
      if (t >= T6) g = balanceBody(['x'], [String(x)], 0, W);
      // Floating weights.
      if (liftL > 0 && t < T5) g += `<g opacity="${t >= T4 ? 1 - ease(t, T4 + 0.9, T5) : 1}">${wgt(cx - arm + 15 - liftL * 30, panY(-1, tilt) - liftL * 40, a)}</g>`;
      if (liftR > 0 && t < T5) g += `<g opacity="${1 - ease(t, T4 + 0.9, T5)}">${wgt(cx + arm - 15 + liftR * 30, panY(1, tilt) - liftR * 40, a)}</g>`;
      // Equation line.
      const eq = t < T1 ? `□ + ${a} = ${s}` : t < T4 ? `□ + ${a} = ${a} + ${x}` : t < T5 ? `□ + ${a} − ${a} = ${a} + ${x} − ${a}` : `□ = ${x}`;
      g += `<text x="${cx}" y="226" text-anchor="middle" font-size="20" font-weight="900" fill="currentColor">${eq}</text>`;
      if (t >= T2 + 0.9 && t < T3 + 0.4) g += `<text x="${cx}" y="22" text-anchor="middle" font-size="15" font-weight="800" fill="#c0392b">Vain vasemmalta → kallistuu ✗</text>`;
      if (t >= T4 + 0.9 && t < T6) g += `<text x="${cx}" y="22" text-anchor="middle" font-size="15" font-weight="800" fill="var(--pond)">Molemmilta → yhä suorassa ✓</text>`;
      if (t >= T6) g += `<text x="${cx}" y="22" text-anchor="middle" font-size="16" font-weight="900" fill="var(--pond)">Pussissa on ${x} kg</text><text x="${cx}" y="246" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor" opacity=".7">Tarkistus: ${x} + ${a} = ${s}</text>`;
      return g;
    },
    caption: (t) => {
      if (t < T1) return `Vaaka on suorassa: pussi ja ${a} kg painavat yhtä paljon kuin ${s} kg.`;
      if (t < T2) return `${s} kg on sama kuin ${a} kg ja ${x} kg. Vaihdetaan paino kahdeksi.`;
      if (t < T3) return `Jos otetaan ${a} kg pois vain vasemmalta, vaaka kallistuu. Silloin puolet eivät ole enää yhtä suuret.`;
      if (t < T4) return 'Laitetaan paino takaisin.';
      if (t < T6) return `Otetaan ${a} kg pois molemmilta puolilta. Vaaka pysyy suorassa.`;
      return `Pussi yksin painaa yhtä paljon kuin ${x} kg: □ = ${s} − ${a} = ${x}.`;
    },
  });
}

/** a + b = □ + c. First the "answer goes here" mistake (a+b in the box) tips the beam; then the box counts up until level. */
export function equalsScene(a: number, b: number, c: number): AnimPaint {
  const W = 300, H = 250, L = a + b, x = L - c, cx = W / 2;
  const T1 = 1.6, T2 = 3.8, T3 = 4.6, ST = 0.55, T4 = T3 + x * ST, T5 = T4 + 0.8;
  const tiltOf = (R: number) => Math.max(-1, Math.min(1, (R - L) / 5));
  return anim({
    dur: T5 + 4, w: W, h: H, label: `${a} + ${b} = □ + ${c}`,
    frame: (t) => {
      let box = 0, wrong = false;
      if (t >= T1 && t < T2) { box = L; wrong = true; }
      else if (t >= T3) box = Math.min(x, Math.floor((t - T3) / ST) + 1);
      const target = tiltOf(c + box), prevBox = t >= T3 && box > 1 ? box - 1 : t >= T2 && t < T3 ? L : 0;
      const p = t < T1 ? 1 : t < T2 ? ease(t, T1, T1 + 0.6) : t < T3 ? ease(t, T2, T2 + 0.6) : ease((t - T3) % ST, 0, 0.35);
      const from = t < T1 ? target : t < T2 ? tiltOf(c) : t < T3 ? tiltOf(c + L) : tiltOf(c + prevBox);
      const tilt = t >= T4 ? 0 : t >= T2 && t < T3 ? tiltOf(c + L) + (tiltOf(c) - tiltOf(c + L)) * p : from + (target - from) * p;
      let s = balanceBody([String(a), String(b)], box ? [String(box), String(c)] : ['x', String(c)], tilt, W);
      s += `<text x="40" y="214" font-size="15" font-weight="800" fill="currentColor">${a} + ${b} = ${L}</text>`;
      s += `<text x="${W - 40}" y="214" text-anchor="end" font-size="15" font-weight="800" fill="${wrong ? '#c0392b' : t >= T4 ? 'var(--pond)' : 'currentColor'}">${box ? `${box} + ${c} = ${box + c}` : `□ + ${c}`}</text>`;
      if (wrong && t >= T1 + 0.7) s += `<text x="${cx}" y="22" text-anchor="middle" font-size="15" font-weight="800" fill="#c0392b">${L} ≠ ${L + c} ✗ kallistuu</text>`;
      if (t >= T4) s += `<text x="${cx}" y="22" text-anchor="middle" font-size="16" font-weight="900" fill="var(--pond)">${L} = ${L} ✓ suorassa</text><text x="${cx}" y="244" text-anchor="middle" font-size="20" font-weight="900" fill="currentColor" opacity="${ease(t, T4, T5)}">${a} + ${b} = ${x} + ${c}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T1) return `Vasemmalla ${a} ja ${b} eli ${L}. Oikealla laatikko ja ${c}. Laatikko on vielä tyhjä.`;
      if (t < T2) return `Moni kirjoittaa laatikkoon ${L}. Silloin oikealla on ${L} + ${c} = ${L + c}: liikaa!`;
      if (t < T3) return 'Otetaan se pois. Kokeillaan pienestä alkaen.';
      if (t < T4) { const k = Math.min(x, Math.floor((t - T3) / ST) + 1); return `Laatikossa ${k}: oikealla ${k + c}. ${k + c < L ? 'Vielä kevyempi.' : 'Yhtä paljon!'}`; }
      return `= tarkoittaa: molemmilla puolilla yhtä paljon. ${L} = ${x} + ${c}, joten laatikko on ${x}.`;
    },
  });
}

/** n bags + a kg = total. Items land on the balance one by one while the equation is written in step;
 *  then two guesses are substituted: a wrong one tips the beam, the right one keeps it level. */
export function buildEqScene(n: number, a: number, x: number): AnimPaint {
  const W = 300, H = 250, tot = n * x + a, cx = W / 2, IT = 0.7;
  const toks: { s: string; side: 'L' | 'R' | '=' }[] = [];
  for (let i = 0; i < n; i++) { if (i) toks.push({ s: '+', side: 'L' }); toks.push({ s: 'x', side: 'L' }); }
  toks.push({ s: '+', side: 'L' }, { s: String(a), side: 'L' }, { s: '=', side: '=' }, { s: String(tot), side: 'R' });
  const items = n + 2; // bags, a, total (the = is the level beam)
  const T0 = 0.8, T1 = T0 + items * IT + 0.4, G1 = T1 + 1.0, G2 = G1 + 2.6, END = G2 + 2.2, g = x + 1;
  const eqAt = (k: number) => { let shown = 0, c = 0; for (const q of toks) { if (q.s === 'x' || (q.s === String(a) && q.side === 'L') || q.side === '=') c++; if (c > k) break; shown++; } return toks.slice(0, shown).map((q) => q.s).join(' '); };
  return anim({
    dur: END + 4, w: W, h: H, label: `${n} pussia ja ${a} kg = ${tot} kg`,
    frame: (t) => {
      const k = t < T0 ? 0 : Math.min(items, Math.floor((t - T0) / IT) + 1);
      const val = t >= G2 ? x : t >= G1 ? g : 0;
      const bagsShown = Math.min(n, k), aShown = k > n, rShown = k > n + 1;
      const left = [...Array(bagsShown).fill(val ? String(val) : 'x'), ...(aShown ? [String(a)] : [])], right = rShown ? [String(tot)] : [];
      const Ls = val ? n * val + a : null;
      const tilt = t < T1 ? (rShown ? 0 : left.length ? -0.6 : 0) : t < G1 ? 0 : t < G2 ? -ease(t, G1, G1 + 0.6) * 0.8 : -0.8 + ease(t, G2, G2 + 0.6) * 0.8;
      let s = balanceBody(left, right, tilt, W);
      const line = t < G1 ? eqAt(k) : `${Array(n).fill(val).join(' + ')} + ${a} ${Ls === tot ? '=' : '≠'} ${tot}`;
      s += `<text x="${cx}" y="222" text-anchor="middle" font-size="20" font-weight="900" fill="currentColor">${line}</text>`;
      if (t >= T1 && t < G1) s += `<text x="${cx}" y="22" text-anchor="middle" font-size="14" font-weight="800" fill="var(--pond)">Yhtälö: = ja tuntematon x</text>`;
      if (t >= G1 && Ls !== null) {
        const ok = Ls === tot;
        s += `<text x="${cx}" y="246" text-anchor="middle" font-size="14" font-weight="800" fill="${ok ? 'var(--pond)' : '#c0392b'}">vasen ${Ls}, oikea ${tot} ${ok ? '✓ ratkaisu' : '✗'}</text>`;
        s += `<text x="${cx}" y="22" text-anchor="middle" font-size="15" font-weight="800" fill="${ok ? 'var(--pond)' : '#c0392b'}">Kokeillaan x = ${val}</text>`;
      }
      return s;
    },
    caption: (t) => {
      if (t < T0) return 'Rakennetaan vaaka ja kirjoitetaan sama yhtälönä.';
      if (t < T1) { const k = Math.min(items, Math.floor((t - T0) / IT) + 1); return k <= n ? `Pussi ${k}: kirjoitetaan x.` : k === n + 1 ? `${a} kg: kirjoitetaan + ${a}.` : `Oikealla ${tot} kg. Vaaka on suorassa: kirjoitetaan = ${tot}.`; }
      if (t < G1) return `Yhtälössä on yhtä suuri -merkki ja tuntematon x. Mikä luku x on?`;
      if (t < G2) return `Kokeillaan x = ${g}: ${n} · ${g} + ${a} = ${n * g + a}. Liikaa, vaaka kallistuu.`;
      return `Kokeillaan x = ${x}: ${n} · ${x} + ${a} = ${tot}. Molemmat puolet yhtä suuret: x = ${x} on ratkaisu.`;
    },
  });
}

/** x + a = tot, solved by guess and check: each guess goes in the bag, the beam reacts, and a table
 *  records "too light / too heavy / level". Wrong guesses steer the next one. */
export function guessScene(a: number, x: number, guesses: number[]): AnimPaint {
  const W = 320, H = 250, BW = 200, tot = a + x, T0 = 1.2, GT = 2.2, END = T0 + guesses.length * GT;
  const tiltOf = (g: number) => Math.max(-1, Math.min(1, (tot - g - a) / 3));
  return anim({
    dur: END + 3.5, w: W, h: H, label: `x + ${a} = ${tot}`,
    frame: (t) => {
      const j = t < T0 ? -1 : Math.min(guesses.length - 1, Math.floor((t - T0) / GT));
      const g = j >= 0 ? guesses[j]! : null, local = j >= 0 ? t - T0 - j * GT : 0;
      const prev = j > 0 ? tiltOf(guesses[j - 1]!) : -0.7;
      const tilt = g === null ? -0.7 : prev + (tiltOf(g) - prev) * ease(local, 0.3, 0.9);
      let s = `<g transform="translate(0 6)">${balanceBody([g === null ? 'x' : String(g), String(a)], [String(tot)], tilt, BW)}</g>`;
      s += `<text x="${BW / 2}" y="232" text-anchor="middle" font-size="18" font-weight="900" fill="currentColor">${g === null ? `x + ${a} = ${tot}` : `${g} + ${a} ${g + a === tot ? '=' : '≠'} ${tot}`}</text>`;
      // Table.
      const TX = BW + 8;
      s += `<text x="${TX}" y="22" font-size="13" font-weight="800" fill="currentColor">x</text><text x="${TX + 30}" y="22" font-size="13" font-weight="800" fill="currentColor">x + ${a}</text>`;
      s += `<line x1="${TX}" y1="28" x2="${W - 4}" y2="28" stroke="currentColor" stroke-opacity=".4"/>`;
      for (let i = 0; i <= j; i++) {
        if (i === j && local < 0.9) break;
        const q = guesses[i]!, v = q + a, y = 50 + i * 28, ok = v === tot;
        s += `<text x="${TX}" y="${y}" font-size="15" font-weight="800" fill="currentColor">${q}</text><text x="${TX + 30}" y="${y}" font-size="15" font-weight="800" fill="${ok ? 'var(--pond)' : '#c0392b'}">${v} ${ok ? '✓' : v < tot ? '↑' : '↓'}</text>`;
        s += `<text x="${TX + 30}" y="${y + 12}" font-size="10" font-weight="700" fill="currentColor" opacity=".7">${ok ? 'ratkaisu' : v < tot ? 'liian kevyt' : 'liian painava'}</text>`;
      }
      return s;
    },
    caption: (t) => {
      if (t < T0) return `Mitä pussissa on? x + ${a} = ${tot}. Kokeillaan ja tarkistetaan.`;
      const j = Math.min(guesses.length - 1, Math.floor((t - T0) / GT)), g = guesses[j]!, v = g + a;
      return v === tot ? `x = ${g}: ${g} + ${a} = ${tot}. Vaaka on suorassa: ${g} on ratkaisu!`
        : v < tot ? `x = ${g}: ${g} + ${a} = ${v}, vähemmän kuin ${tot}. Liian kevyt, kokeillaan isompaa.`
        : `x = ${g}: ${g} + ${a} = ${v}, enemmän kuin ${tot}. Liian painava, kokeillaan pienempää.`;
    },
  });
}

/** A function machine: □ goes through "+a" (or "×a") to the result; then the machine is turned around
 *  ("−a" / ":a") and the result goes back through it to reveal □; finally a forward check. */
export function machineScene(op: '+' | '×', a: number, x: number): AnimPaint {
  const W = 320, H = 200, Y = 92, LX = 36, RX = 284, M0 = 112, M1 = 208, out = op === '+' ? x + a : x * a, inv = op === '+' ? '−' : ':';
  const P1 = 2.4, FLIP = 3.6, P2 = 6.2, P3 = 8.6;
  const ball = (cx: number, label: string, col: string) => `<circle cx="${cx}" cy="${Y}" r="20" fill="${col}" stroke="currentColor" stroke-width="2"/><text x="${cx}" y="${Y + 6}" text-anchor="middle" font-size="17" font-weight="900" fill="#fff">${label}</text>`;
  return anim({
    dur: P3 + 4, w: W, h: H, label: `□ ${op} ${a} = ${out}`,
    frame: (t) => {
      const flipP = t < P1 ? 0 : t < FLIP ? ease(t, P1, FLIP) : t < P2 ? 1 : 1 - ease(t, P2, P2 + 0.6);
      const col = flipP > 0.5 ? '#2b6cb0' : '#e8913a';
      let s = `<line x1="${LX}" y1="${Y}" x2="${RX}" y2="${Y}" stroke="currentColor" stroke-opacity=".35" stroke-width="4" stroke-dasharray="6 6"/>`;
      // Machine body with a label that flips (scaleY through zero).
      const sy = Math.abs(Math.cos(flipP * Math.PI)) || 0.01;
      s += `<rect x="${M0}" y="${Y - 34}" width="${M1 - M0}" height="68" rx="12" fill="${col}" opacity=".9" stroke="currentColor" stroke-width="2"/>`;
      s += `<g transform="translate(${(M0 + M1) / 2} ${Y}) scale(1 ${sy})"><text x="0" y="9" text-anchor="middle" font-size="28" font-weight="900" fill="#fff">${flipP > 0.5 ? `${inv} ${a}` : `${op} ${a}`}</text></g>`;
      s += `<text x="${(M0 + M1) / 2}" y="${Y - 44}" text-anchor="middle" font-size="18" font-weight="900" fill="${col}">${flipP > 0.5 ? '←' : '→'}</text>`;
      // Ball position along the track.
      let bx = LX, label = '□', bc = '#7c8a96';
      if (t < P1) { const f = ease(t, 0.4, P1 - 0.2); bx = LX + (RX - LX) * f; label = bx > (M0 + M1) / 2 ? String(out) : '□'; bc = bx > (M0 + M1) / 2 ? '#e8913a' : '#7c8a96'; }
      else if (t < FLIP) { bx = RX; label = String(out); bc = '#e8913a'; }
      else if (t < P2) { const f = ease(t, FLIP, P2 - 0.2); bx = RX + (LX - RX) * f; label = bx < (M0 + M1) / 2 ? String(x) : String(out); bc = bx < (M0 + M1) / 2 ? '#2b6cb0' : '#e8913a'; }
      else if (t < P3) { const f = ease(t, P2 + 0.6, P3 - 0.2); bx = LX + (RX - LX) * f; label = bx > (M0 + M1) / 2 ? String(out) : String(x); bc = bx > (M0 + M1) / 2 ? 'var(--pond)' : '#2b6cb0'; }
      else { bx = RX; label = String(out); bc = 'var(--pond)'; }
      if (!(bx > M0 + 6 && bx < M1 - 6)) s += ball(bx, label, bc);
      // Equation lines.
      s += `<text x="${W / 2}" y="160" text-anchor="middle" font-size="19" font-weight="900" fill="currentColor">${t < P1 ? `□ ${op} ${a} = ${out}` : t < P2 ? `□ = ${out} ${inv} ${a}${t >= P2 - 0.6 ? ` = ${x}` : ''}` : `${x} ${op} ${a} = ${out}${t >= P3 ? ' ✓' : ''}`}</text>`;
      if (t >= P3 + 0.6) s += `<text x="${W / 2}" y="188" text-anchor="middle" font-size="13" font-weight="800" fill="#c0392b" opacity="${ease(t, P3 + 0.6, P3 + 1.2)}">Ei ${out} ${op} ${a}: sama lasku ei kumoa itseään ✗</text>`;
      return s;
    },
    caption: (t) => {
      if (t < P1) return `Tuntematon luku menee koneeseen ${op} ${a}. Ulos tulee ${out}.`;
      if (t < FLIP) return `Käännetään kone: ${op === '+' ? 'vähennyslasku kumoaa yhteenlaskun' : 'jakolasku kumoaa kertolaskun'}. ${op} ${a} muuttuu muotoon ${inv} ${a}.`;
      if (t < P2) return `${out} kulkee takaisin: ${out} ${inv} ${a} = ${x}.`;
      if (t < P3) return `Tarkistus eteenpäin: ${x} ${op} ${a} = ${out}.`;
      return `□ = ${x}. ${out} ${op} ${a} olisi väärin: se vain jatkaisi samaa laskua.`;
    },
  });
}
