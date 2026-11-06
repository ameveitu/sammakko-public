// Kirjainpaja animations (grades 7–9): a letter stands for a number, not for a thing.
import { anim, ease, type AnimPaint } from '../ui/anim';
import { balanceBody } from './pics';
import { fmt } from './fi';

const FRUIT: Record<string, string> = { omena: '🍎', vihko: '📒', lauta: '🪵', pussi: '👜' };

/** k items, each with a price tag "a €". First the wrong reading "a = omena" is crossed out,
 *  then the tags flip one by one to show the number a, and the total k·a is added up. */
export function priceTagScene(k: number, price: number, thing = 'omena'): AnimPaint {
  const W = 320, H = 228, icon = FRUIT[thing] ?? '🍎', gap = W / (k + 1);
  const T1 = 1.6, T2 = 4.2, FL = 0.7, T3 = T2 + k * FL, T4 = T3 + 0.4 + k * 0.6;
  const x = (i: number) => gap * (i + 1);
  return anim({
    dur: T4 + 3.5, w: W, h: H, label: `${k}a, kun a = ${price}`,
    frame: (t) => {
      let s = `<text x="${W / 2}" y="22" text-anchor="middle" font-size="15" font-weight="900" fill="currentColor">a = ${thing === 'omena' ? 'omenan' : thing === 'vihko' ? 'vihkon' : thing === 'lauta' ? 'laudan' : 'pussin'} hinta euroina</text>`;
      for (let i = 0; i < k; i++) {
        const pop = ease(t, 0.2 + i * 0.25, 0.6 + i * 0.25);
        if (pop <= 0) continue;
        s += `<text x="${x(i)}" y="76" text-anchor="middle" font-size="${30 * pop}">${icon}</text>`;
        // Tag flips (scaleY through zero) from "a €" to "price €".
        const f = ease(t, T2 + i * FL, T2 + i * FL + FL * 0.9), sy = Math.max(0.02, Math.abs(Math.cos(f * Math.PI))), shown = f > 0.5;
        s += `<line x1="${x(i)}" y1="80" x2="${x(i)}" y2="90" stroke="currentColor" stroke-width="1.5"/>`;
        s += `<g transform="translate(${x(i)} 104) scale(1 ${sy})" opacity="${pop}"><rect x="-24" y="-14" width="48" height="28" rx="6" fill="${shown ? 'var(--ok, #2f9e44)' : '#e8913a'}" stroke="currentColor" stroke-width="1.5"/><text x="0" y="6" text-anchor="middle" font-size="16" font-weight="900" fill="#fff">${shown ? `${price} €` : 'a €'}</text></g>`;
      }
      // The wrong reading, crossed out.
      if (t >= T1 && t < T2 + 0.4) {
        const o = ease(t, T1, T1 + 0.4) * (1 - ease(t, T2 - 0.2, T2 + 0.4)), cross = ease(t, T1 + 1, T1 + 1.5);
        s += `<g opacity="${o}"><rect x="40" y="128" width="240" height="34" rx="8" fill="#fde8e6" stroke="#c0392b" stroke-width="2"/><text x="160" y="151" text-anchor="middle" font-size="16" font-weight="900" fill="#c0392b">a = ${icon} ${thing}?</text>`;
        if (cross > 0) s += `<line x1="60" y1="${145}" x2="${60 + 200 * cross}" y2="${145}" stroke="#c0392b" stroke-width="4"/><text x="266" y="152" text-anchor="middle" font-size="20" font-weight="900" fill="#c0392b" opacity="${cross}">✗</text>`;
        s += '</g>';
      }
      // Adding up.
      const added = t < T3 + 0.4 ? 0 : Math.min(k, Math.floor((t - T3 - 0.4) / 0.6) + 1);
      if (added > 0) {
        const terms = Array.from({ length: added }, () => String(price)).join(' + ');
        s += `<text x="${W / 2}" y="156" text-anchor="middle" font-size="17" font-weight="900" fill="currentColor">${terms} = ${added * price} €</text>`;
      }
      const e = ease(t, T4, T4 + 0.6);
      if (e > 0) s += `<g opacity="${e}"><text x="${W / 2}" y="196" text-anchor="middle" font-size="20" font-weight="900" fill="var(--pond)">${k}a = ${k} · ${price} = ${k * price} €</text><text x="${W / 2}" y="218" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor" opacity=".75">a on luku. ${k}a tarkoittaa ${k} kertaa a.</text></g>`;
      return s;
    },
    caption: (t) => {
      if (t < T1) return `${k} kappaletta, ja jokaisen hintalapussa lukee a €.`;
      if (t < T2) return `Tarkoittaako a itse esinettä? Ei. Kirjain ei ole lyhenne sanasta.`;
      if (t < T3) return `a on luku: hinta euroina. Käännetään laput: a = ${price}.`;
      if (t < T4) return `Lasketaan hinnat yhteen.`;
      return `${k}a on ${k} kertaa hinta: ${k} · ${price} = ${k * price} €.`;
    },
  });
}

/** The letter as a varying quantity: n counts up 1…steps, an item pops in each time, the value
 *  k·n + b ticks up by k, and a table row is written. The constant b (a start fee) never moves. */
export function varyScene(k: number, b = 0, icon = '🍦', steps = 5): AnimPaint {
  const W = 320, H = 240, T0 = 1.2, ST = 1.5, END = T0 + steps * ST, expr = `${k}n${b ? ` + ${b}` : ''}`;
  const TX = 214, RY = (i: number) => 64 + i * 26;
  return anim({
    dur: END + 4, w: W, h: H, label: `${expr}, kun n kasvaa`,
    frame: (t) => {
      const n = t < T0 ? 0 : Math.min(steps, Math.floor((t - T0) / ST) + 1), local = t < T0 ? 0 : t - T0 - (n - 1) * ST;
      let s = `<text x="100" y="24" text-anchor="middle" font-size="16" font-weight="900" fill="currentColor">hinta = ${expr} €</text>`;
      // Counter.
      const pulse = n > 0 && local < 0.4 ? 1 + 0.25 * (1 - local / 0.4) : 1;
      s += `<g transform="translate(52 66) scale(${pulse})"><rect x="-38" y="-22" width="76" height="40" rx="10" fill="#2b6cb0"/><text x="0" y="7" text-anchor="middle" font-size="20" font-weight="900" fill="#fff">n = ${n}</text></g>`;
      // Items (two rows of up to 5).
      for (let i = 0; i < n; i++) {
        const sc = i === n - 1 ? ease(local, 0, 0.35) : 1;
        s += `<text x="${108 + (i % 5) * 18}" y="${60 + Math.floor(i / 5) * 22}" text-anchor="middle" font-size="${18 * sc}">${icon}</text>`;
      }
      // Value meter.
      const val = k * n + b, prevVal = k * Math.max(0, n - 1) + b, shown = n === 0 ? b : Math.round(prevVal + (val - prevVal) * ease(local, 0.2, 0.8));
      s += `<rect x="20" y="104" width="180" height="48" rx="10" fill="var(--card, #fff)" stroke="currentColor" stroke-width="2"/><text x="110" y="122" text-anchor="middle" font-size="11" font-weight="800" fill="var(--pond)">${expr}</text><text x="110" y="144" text-anchor="middle" font-size="20" font-weight="900" fill="currentColor">${shown} €</text>`;
      if (n > 0 && local < 1.1) s += `<text x="${170}" y="${100 - local * 18}" text-anchor="middle" font-size="15" font-weight="900" fill="var(--ok, #2f9e44)" opacity="${1 - ease(local, 0.7, 1.1)}">+${k} €</text>`;
      if (b) s += `<text x="110" y="172" text-anchor="middle" font-size="12" font-weight="800" fill="#e8913a">aloitusmaksu ${b} € pysyy samana</text>`;
      // Table.
      s += `<text x="${TX}" y="40" font-size="13" font-weight="900" fill="currentColor">n</text><text x="${TX + 34}" y="40" font-size="13" font-weight="900" fill="currentColor">${expr}</text><line x1="${TX - 4}" y1="46" x2="${W - 4}" y2="46" stroke="currentColor" stroke-opacity=".5"/>`;
      for (let i = 1; i <= n; i++) {
        const o = i === n ? ease(local, 0.5, 0.9) : 1;
        s += `<g opacity="${o}"><text x="${TX}" y="${RY(i - 1)}" font-size="15" font-weight="800" fill="#2b6cb0">${i}</text><text x="${TX + 34}" y="${RY(i - 1)}" font-size="15" font-weight="800" fill="currentColor">${k * i + b}</text></g>`;
        if (i > 1 && t >= END) s += `<text x="${W - 8}" y="${RY(i - 1) - 10}" text-anchor="end" font-size="11" font-weight="900" fill="var(--ok, #2f9e44)" opacity="${ease(t, END, END + 0.6)}">+${k}</text>`;
      }
      const e = ease(t, END + 0.6, END + 1.2);
      if (e > 0) s += `<g opacity="${e}"><text x="${W / 2}" y="206" text-anchor="middle" font-size="15" font-weight="900" fill="var(--pond)">n muuttuu → ${expr} muuttuu</text><text x="${W / 2}" y="228" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor" opacity=".8">Joka askeleella +${k} €${b ? `, ${b} € pysyy` : ''}.</text></g>`;
      return s;
    },
    caption: (t) => {
      if (t < T0) return `Kirjain n on jäätelöiden määrä. Se voi saada monta arvoa.`;
      const n = Math.min(steps, Math.floor((t - T0) / ST) + 1);
      if (t < END) return `n = ${n}: ${k} · ${n}${b ? ` + ${b}` : ''} = ${k * n + b} €.`;
      return `Kun n kasvaa yhdellä, hinta kasvaa ${k} €. Luku ${k} pysyy samana${b ? `, samoin ${b}` : ''}; vain n muuttuu.`;
    },
  });
}

/** Two roles of a letter side by side. Left: x + a = s, values 1…tries go in and only one balances.
 *  Right: price = k·n, every n gives a valid row. */
export function roleScene(a = 4, x = 5, k = 3, tries = 8): AnimPaint {
  const W = 320, H = 236, s = a + x, T0 = 1.0, ST = 0.75, END = T0 + tries * ST, L = 80, R = 240;
  return anim({
    dur: END + 4, w: W, h: H, label: `x + ${a} = ${s} ja hinta = ${k}n`,
    frame: (t) => {
      const i = t < T0 ? 0 : Math.min(tries, Math.floor((t - T0) / ST) + 1);
      let o = `<line x1="160" y1="8" x2="160" y2="176" stroke="currentColor" stroke-opacity=".3" stroke-width="2"/>`;
      o += `<text x="${L}" y="24" text-anchor="middle" font-size="12" font-weight="900" fill="#2b6cb0">YHTÄLÖ</text><text x="${L}" y="46" text-anchor="middle" font-size="18" font-weight="900" fill="currentColor">x + ${a} = ${s}</text>`;
      o += `<text x="${R}" y="24" text-anchor="middle" font-size="12" font-weight="900" fill="#e8913a">SÄÄNTÖ</text><text x="${R}" y="46" text-anchor="middle" font-size="18" font-weight="900" fill="currentColor">hinta = ${k}n</text>`;
      // Rows: one per tried value, 4 per column visible (latest shown).
      const first = Math.max(1, i - 3);
      for (let v = first; v <= i; v++) {
        const y = 74 + (v - first) * 26, ok = v + a === s, f = v === i ? ease(t - T0 - (v - 1) * ST, 0, 0.3) : 1;
        o += `<g opacity="${f}"><text x="${L}" y="${y}" text-anchor="middle" font-size="14" font-weight="800" fill="${ok ? 'var(--ok, #2f9e44)' : '#c0392b'}">x = ${v}: ${v + a} ${ok ? '= ' + s + ' ✓' : '≠ ' + s + ' ✗'}</text>`;
        o += `<text x="${R}" y="${y}" text-anchor="middle" font-size="14" font-weight="800" fill="var(--ok, #2f9e44)">n = ${v}: ${k * v} € ✓</text></g>`;
      }
      const e = ease(t, END, END + 0.6);
      if (e > 0) o += `<g opacity="${e}"><rect x="8" y="186" width="146" height="42" rx="8" fill="#2b6cb0"/><text x="${L + 1}" y="203" text-anchor="middle" font-size="12" font-weight="900" fill="#fff">vain x = ${x} toimii</text><text x="${L + 1}" y="220" text-anchor="middle" font-size="12" font-weight="900" fill="#fff">→ yksi tuntematon luku</text>`
        + `<rect x="166" y="186" width="146" height="42" rx="8" fill="#e8913a"/><text x="${R - 1}" y="203" text-anchor="middle" font-size="12" font-weight="900" fill="#fff">jokainen n toimii</text><text x="${R - 1}" y="220" text-anchor="middle" font-size="12" font-weight="900" fill="#fff">→ muuttuva määrä</text></g>`;
      return o;
    },
    caption: (t) => {
      if (t < T0) return 'Kokeillaan samoja lukuja molemmille puolille.';
      const i = Math.min(tries, Math.floor((t - T0) / ST) + 1);
      if (t < END) return i + a === s ? `x = ${i} tekee yhtälöstä totta! Säännössä n = ${i} antaa hinnan ${k * i} €.` : `x = ${i} ei käy yhtälöön, mutta säännössä n = ${i} on ihan hyvä määrä.`;
      return `Yhtälössä kirjain on yksi tietty luku (${x}). Säännössä kirjain voi saada monta arvoa.`;
    },
  });
}

/** x + x = s needs the same number in both boxes; a + b = s allows different ones. */
export function sameLetterScene(x = 5, p = 3): AnimPaint {
  const W = 320, H = 226, s = 2 * x, q = s - p, guesses = [p, x - 1, x];
  const T0 = 1.0, T1 = 3.4, GT = 1.6, T2 = T1 + guesses.length * GT, T3 = T2 + 0.6;
  const box = (cx: number, cy: number, letter: string, val: string, col: string) =>
    `<rect x="${cx - 26}" y="${cy - 22}" width="52" height="44" rx="8" fill="${col}" stroke="currentColor" stroke-width="2"/><text x="${cx}" y="${cy - 28}" text-anchor="middle" font-size="13" font-weight="900" fill="currentColor">${letter}</text><text x="${cx}" y="${cy + 8}" text-anchor="middle" font-size="20" font-weight="900" fill="#fff">${val}</text>`;
  return anim({
    dur: T3 + 4.5, w: W, h: H, label: `x + x = ${s}`,
    frame: (t) => {
      let o = `<text x="${W / 2}" y="22" text-anchor="middle" font-size="17" font-weight="900" fill="currentColor">x + x = ${s}</text>`;
      const Y = 74;
      if (t < T1) {
        // Wrong idea: different numbers in the two x-boxes.
        const f = ease(t, T0, T0 + 0.5);
        o += box(100, Y, 'x', f > 0 ? String(p) : '?', '#7c8a96') + `<text x="160" y="${Y + 8}" text-anchor="middle" font-size="22" font-weight="900" fill="currentColor">+</text>` + box(220, Y, 'x', f > 0 ? String(q) : '?', '#7c8a96');
        if (t > T0 + 0.8) o += `<text x="${W / 2}" y="${Y + 52}" text-anchor="middle" font-size="14" font-weight="900" fill="#c0392b" opacity="${ease(t, T0 + 0.8, T0 + 1.2)}">${p} ja ${q}? Sama kirjain ei voi olla eri luvut ✗</text>`;
      } else {
        const j = Math.min(guesses.length - 1, Math.floor((t - T1) / GT)), g = guesses[j]!, ok = g + g === s;
        o += box(100, Y, 'x', String(g), ok ? 'var(--ok, #2f9e44)' : '#2b6cb0') + `<text x="160" y="${Y + 8}" text-anchor="middle" font-size="22" font-weight="900" fill="currentColor">+</text>` + box(220, Y, 'x', String(g), ok ? 'var(--ok, #2f9e44)' : '#2b6cb0');
        o += `<text x="${W / 2}" y="${Y + 52}" text-anchor="middle" font-size="15" font-weight="900" fill="${ok ? 'var(--ok, #2f9e44)' : '#c0392b'}">${g} + ${g} = ${2 * g} ${ok ? '✓' : `≠ ${s}`}</text>`;
      }
      const e = ease(t, T3, T3 + 0.6);
      if (e > 0) {
        o += `<g opacity="${e}"><line x1="20" y1="148" x2="300" y2="148" stroke="currentColor" stroke-opacity=".3"/><text x="${W / 2}" y="170" text-anchor="middle" font-size="14" font-weight="900" fill="currentColor">Eri kirjaimet saavat olla eri lukuja:</text>`;
        o += `<text x="${W / 2}" y="196" text-anchor="middle" font-size="17" font-weight="900" fill="#e8913a">a + b = ${s}: ${p} + ${q} ✓</text><text x="${W / 2}" y="218" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor" opacity=".8">mutta x + x = ${s} vain, kun x = ${x}</text></g>`;
      }
      return o;
    },
    caption: (t) => {
      if (t < T0) return 'Kaksi x:ää samassa yhtälössä.';
      if (t < T1) return `Voisiko ensimmäinen x olla ${p} ja toinen ${q}? Ei: sama kirjain on samassa yhtälössä aina sama luku.`;
      if (t < T3) { const g = guesses[Math.min(guesses.length - 1, Math.floor((t - T1) / GT))]!; return g + g === s ? `x = ${g}: ${g} + ${g} = ${s}. Löytyi!` : `Sama luku molempiin: x = ${g}, ${g} + ${g} = ${2 * g}.`; }
      return `x + x = ${s} vain, kun x = ${x}. Jos kirjaimet ovat eri, esimerkiksi a + b = ${s}, ne voivat olla ${p} ja ${q}.`;
    },
  });
}

/** Substitution: the value flies into the letter's place in pre+letter+post, the hidden "·" appears
 *  (sub), an optional wrong reading (mis) is crossed out, then the rows of the calculation follow. */
export function evalScene(pre: string, letter: string, post: string, val: number, sub: string, steps: [string, string][], mis?: string): AnimPaint {
  const rows = steps.map((x) => x[0]);
  const W = 320, H = 70 + 34 * (rows.length + 1) + (mis ? 30 : 0) + 10, CW = 15.6, FS = 26;
  const expr = pre + letter + post, x0 = W / 2 - (expr.length * CW) / 2, lx = x0 + (pre.length + 0.5) * CW;
  const vs = val < 0 ? `(−${-val})` : String(val);
  const T1 = 1.0, T2 = 2.2, T3 = 3.4, TM = mis ? 2.0 : 0, R0 = T3 + TM + 0.4, RT = 1.5, END = R0 + rows.length * RT;
  const rowY = (i: number) => 104 + i * 34 + (mis ? 30 : 0);
  return anim({
    dur: END + 3.5, w: W, h: H, label: `${expr}, kun ${letter} = ${val < 0 ? '−' + -val : val}`,
    frame: (t) => {
      let o = `<text x="${W - 12}" y="24" text-anchor="end" font-size="15" font-weight="900" fill="#2b6cb0">${letter} = ${val < 0 ? '−' + -val : val}</text>`;
      const fly = ease(t, T1, T2), swap = t >= T2;
      // Expression row: the letter fades out as the ball lands.
      if (t < T3) {
        o += `<text x="${x0}" y="62" font-family="ui-monospace, Menlo, monospace" font-size="${FS}" font-weight="900" fill="currentColor">${pre}<tspan fill="#e8913a" opacity="${1 - fly}">${letter}</tspan>${post}</text>`;
        if (t >= T1 * 0.5) {
          const bx = W - 40 + (lx - (W - 40)) * fly, by = 20 + (52 - 20) * fly, r = 15 + vs.length * 2;
          if (!swap || t < T2 + 0.4) o += `<circle cx="${bx}" cy="${by}" r="${r}" fill="#2b6cb0" opacity="${swap ? 1 - ease(t, T2, T2 + 0.4) : 1}"/><text x="${bx}" y="${by + 6}" text-anchor="middle" font-size="16" font-weight="900" fill="#fff" opacity="${swap ? 1 - ease(t, T2, T2 + 0.4) : 1}">${vs}</text>`;
        }
      }
      if (t >= T2) o += `<text x="${W / 2}" y="62" text-anchor="middle" font-size="${FS}" font-weight="900" fill="currentColor" opacity="${ease(t, T2, T3)}">${sub}</text>`;
      if (mis && t >= T3) {
        const m = ease(t, T3, T3 + 0.4), c = ease(t, T3 + 0.8, T3 + 1.3);
        o += `<g opacity="${m}"><rect x="${W / 2 - 80}" y="80" width="160" height="28" rx="8" fill="#fde8e6" stroke="#c0392b" stroke-width="1.5"/><text x="${W / 2}" y="100" text-anchor="middle" font-size="16" font-weight="900" fill="#c0392b">ei ${mis} <tspan opacity="${c}">✗</tspan></text></g>`;
      }
      rows.forEach((row, i) => {
        const e = ease(t, R0 + i * RT, R0 + i * RT + 0.5);
        if (e > 0) o += `<text x="${W / 2}" y="${rowY(i)}" text-anchor="middle" font-size="${i === rows.length - 1 ? 26 : 22}" font-weight="900" fill="${i === rows.length - 1 ? 'var(--ok, #2f9e44)' : 'currentColor'}" opacity="${e}">${row}</text>`;
      });
      return o;
    },
    caption: (t) => {
      if (t < T2) return `Sijoitetaan ${letter}:n paikalle ${vs}.`;
      if (t < T3) return /\d$/.test(pre) ? 'Luku ja kirjain vierekkäin tarkoittavat kertolaskua: kertomerkki tulee näkyviin.' : 'Luku on nyt kirjaimen paikalla.';
      if (t < R0) return mis ? `Numeroita ei kirjoiteta peräkkäin: se olisi ${mis}.` : 'Lasketaan järjestyksessä.';
      const i = Math.min(rows.length - 1, Math.floor((t - R0) / RT));
      if (t < END) return steps[i]![1];
      return `Lausekkeen arvo on ${rows[rows.length - 1]!.replace('= ', '')}.`;
    },
  });
}

/** An n-tile travels through two machines. mulFirst: ·k then +b gives "kn + b"; otherwise +b then ·k
 *  wraps the sum in brackets "k(n + b)". Ends with a check at n = 2 for both orders. */
export function pipeScene(k: number, b: number, mulFirst: boolean): AnimPaint {
  const W = 320, H = 232, Y = 66, M1 = 96, M2 = 192, MW = 64;
  const ops = mulFirst ? [`· ${k}`, `+ ${b}`] : [`+ ${b}`, `· ${k}`];
  const after1 = mulFirst ? `${k}n` : `n + ${b}`, after2 = mulFirst ? `${k}n + ${b}` : `${k}(n + ${b})`;
  const T1 = 0.8, T2 = 2.2, T3 = 2.6, T4 = 4.0, T5 = 4.4, T6 = 5.6, T7 = 6.6;
  const n2a = k * 2 + b, n2b = k * (2 + b);
  const tile = (x: number, label: string, col: string) => {
    const w = 16 + label.length * 9;
    return `<rect x="${x - w / 2}" y="${Y - 16}" width="${w}" height="32" rx="8" fill="${col}" stroke="currentColor" stroke-width="1.5"/><text x="${x}" y="${Y + 6}" text-anchor="middle" font-size="15" font-weight="900" fill="#fff">${label}</text>`;
  };
  return anim({
    dur: T7 + 5, w: W, h: H, label: after2,
    frame: (t) => {
      let o = `<line x1="16" y1="${Y}" x2="${W - 8}" y2="${Y}" stroke="currentColor" stroke-opacity=".3" stroke-width="4" stroke-dasharray="6 6"/>`;
      let x = 30, label = 'n', col = '#7c8a96';
      if (t < T1) x = 30;
      else if (t < T2) x = 30 + (M1 - 30) * ease(t, T1, T2);
      else if (t < T3) { x = M1; label = ''; }
      else if (t < T4) { x = M1 + (M2 - M1) * ease(t, T3, T4); label = after1; col = '#e8913a'; }
      else if (t < T5) { x = M2; label = ''; }
      else { x = M2 + (W - 50 - M2) * ease(t, T5, T6); label = after2; col = 'var(--pond, #2b8a6e)'; }
      if (label) o += tile(x, label, col);
      [M1, M2].forEach((mx, i) => {
        const busy = (i === 0 && t >= T2 && t < T3) || (i === 1 && t >= T4 && t < T5);
        o += `<rect x="${mx - MW / 2}" y="${Y - 30}" width="${MW}" height="60" rx="10" fill="${i === 0 ? '#e8913a' : '#2b6cb0'}" opacity="${busy ? 1 : 0.85}" stroke="currentColor" stroke-width="${busy ? 3 : 1.5}"/><text x="${mx}" y="${Y + 8}" text-anchor="middle" font-size="20" font-weight="900" fill="#fff">${ops[i]}</text><text x="${mx}" y="${Y - 38}" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor" opacity=".8">${i === 0 ? 'ensin' : 'sitten'}</text>`;
      });
      if (t >= T6) {
        const e = ease(t, T6, T6 + 0.5);
        o += `<text x="${W / 2}" y="132" text-anchor="middle" font-size="24" font-weight="900" fill="currentColor" opacity="${e}">${after2}</text>`;
        if (!mulFirst) o += `<text x="${W / 2}" y="152" text-anchor="middle" font-size="12" font-weight="800" fill="#c0392b" opacity="${e}">sulut: koko summa kerrotaan</text>`;
      }
      const c = ease(t, T7, T7 + 0.6);
      if (c > 0) {
        o += `<g opacity="${c}"><text x="${W / 2}" y="180" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor" opacity=".8">Tarkistus, kun n = 2:</text>`;
        o += `<text x="${W / 2}" y="202" text-anchor="middle" font-size="15" font-weight="900" fill="${mulFirst ? 'var(--ok, #2f9e44)' : 'currentColor'}" opacity="${mulFirst ? 1 : 0.55}">${k}n + ${b} = ${k} · 2 + ${b} = ${n2a}${mulFirst ? ' ✓' : ''}</text>`;
        o += `<text x="${W / 2}" y="224" text-anchor="middle" font-size="15" font-weight="900" fill="${mulFirst ? 'currentColor' : 'var(--ok, #2f9e44)'}" opacity="${mulFirst ? 0.55 : 1}">${k}(n + ${b}) = ${k} · ${2 + b} = ${n2b}${mulFirst ? '' : ' ✓'}</text></g>`;
      }
      return o;
    },
    caption: (t) => {
      if (t < T2) return `Luku n lähtee koneisiin. Ensin ${mulFirst ? `kerrotaan ${k}:lla` : `lisätään ${b}`}.`;
      if (t < T4) return mulFirst ? `n kertaa ${k} on ${k}n.` : `n plus ${b} on n + ${b}.`;
      if (t < T6) return mulFirst ? `Sitten lisätään ${b}: ${k}n + ${b}.` : `Sitten koko summa kerrotaan ${k}:lla. Sulut pitävät summan yhdessä: ${k}(n + ${b}).`;
      if (t < T7) return `Lauseke on ${after2}.`;
      return `Järjestys ratkaisee: ${k}n + ${b} ja ${k}(n + ${b}) antavat eri arvon (${n2a} ja ${n2b}).`;
    },
  });
}

/** Squares in a row from matchsticks: the first takes 4, each new one 3 more (new sticks lit). */
export function matchScene(steps = 4): AnimPaint {
  const W = 320, H = 200, S = 46, X0 = 40, Y0 = 40, T0 = 0.8, ST = 1.8, END = T0 + steps * ST;
  const stick = (x1: number, y1: number, x2: number, y2: number, col: string, o: number) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="6" stroke-linecap="round" opacity="${o}"/><circle cx="${x2}" cy="${y2}" r="4" fill="#c0392b" opacity="${o}"/>`;
  return anim({
    dur: END + 4, w: W, h: H, label: 'tikkuneliöt 3n + 1',
    frame: (t) => {
      const n = t < T0 ? 0 : Math.min(steps, Math.floor((t - T0) / ST) + 1), local = t < T0 ? 0 : t - T0 - (n - 1) * ST;
      let o = '';
      for (let i = 0; i < n; i++) {
        const x = X0 + i * S, isNew = i === n - 1 && t < END, col = isNew ? '#e8913a' : '#c8a26a';
        const sticks: [number, number, number, number][] = i === 0 ? [[x, Y0 + S, x, Y0], [x, Y0, x + S, Y0], [x + S, Y0, x + S, Y0 + S], [x + S, Y0 + S, x, Y0 + S]] : [[x, Y0, x + S, Y0], [x + S, Y0, x + S, Y0 + S], [x + S, Y0 + S, x, Y0 + S]];
        sticks.forEach((s, j) => { o += stick(...s, col, isNew ? ease(local, j * 0.3, j * 0.3 + 0.3) : 1); });
      }
      // Count table.
      for (let i = 1; i <= n; i++) {
        const o2 = i === n && t < END ? ease(local, 1.0, 1.4) : 1, y = 130;
        const x = 40 + (i - 1) * 70;
        o += `<g opacity="${o2}"><text x="${x}" y="${y}" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor">n = ${i}</text><text x="${x}" y="${y + 22}" text-anchor="middle" font-size="18" font-weight="900" fill="currentColor">${3 * i + 1}</text>${i > 1 ? `<text x="${x - 35}" y="${y + 20}" text-anchor="middle" font-size="12" font-weight="900" fill="#e8913a">+3</text>` : ''}</g>`;
      }
      const e = ease(t, END, END + 0.6);
      if (e > 0) o += `<text x="${W / 2}" y="186" text-anchor="middle" font-size="16" font-weight="900" fill="var(--pond)" opacity="${e}">1 + 3 + 3 + … = 3n + 1</text>`;
      return o;
    },
    caption: (t) => {
      if (t < T0) return 'Rakennetaan neliöitä tulitikuista riviin.';
      const n = Math.min(steps, Math.floor((t - T0) / ST) + 1);
      if (t < END) return n === 1 ? 'Ensimmäinen neliö vie 4 tikkua.' : `Neliö ${n} jakaa seinän edellisen kanssa, joten se tuo vain 3 uutta tikkua: ${3 * n + 1}.`;
      return 'Jokainen neliö tuo 3 tikkua, ja alussa on yksi ylimääräinen: 3n + 1.';
    },
  });
}

/** Story to equation: k bags (unknown x each) and a known weight b drop onto the left pan one by one,
 *  the total sits on the right. Each piece of k·x + b = tot is written under the part it describes. */
export function eqBuildScene(k: number, b: number, tot: number, story = ''): AnimPaint {
  const W = 300, H = 256, T0 = 1.2, DT = 0.8, TB = T0 + k * DT, TL = TB + DT, TE = TL + 0.6, END = TE + 2.4;
  return anim({
    dur: END + 3.5, w: W, h: H, label: `${k}x + ${b} = ${tot}`,
    frame: (t) => {
      const nb = t < T0 ? 0 : Math.min(k, Math.floor((t - T0) / DT) + 1), hasB = t >= TB;
      const left = [...Array(nb).fill('x'), ...(hasB ? [String(b)] : [])];
      const fill = (nb + (hasB ? 1 : 0)) / (k + 1), tilt = t < TL ? 1 - 0.85 * fill : 0.15 * (1 - ease(t, TL, TL + 0.6));
      let o = balanceBody(left, [String(tot)], tilt, W);
      if (story) o += `<text x="${W / 2}" y="16" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor" opacity=".85">${story}</text>`;
      const piece = (x: number, txt: string, col: string, from: number) => {
        const e = ease(t, from, from + 0.5);
        return e > 0 ? `<text x="${x}" y="${236 + (1 - e) * 10}" text-anchor="middle" font-size="22" font-weight="900" fill="${col}" opacity="${e}">${txt}</text>` : '';
      };
      // k·x grows as bags land: "x", "2x", "3x".
      if (nb > 0) o += `<text x="58" y="236" text-anchor="middle" font-size="22" font-weight="900" fill="#c9a26b">${nb === 1 ? 'x' : nb + 'x'}</text>`;
      o += piece(104, `+ ${b}`, '#7c8a96', TB);
      o += piece(150, '=', 'currentColor', TL);
      o += piece(234, String(tot), 'currentColor', TL + 0.3);
      const e = ease(t, TE + 1.2, TE + 1.8);
      if (e > 0) o += `<rect x="20" y="210" width="${W - 40}" height="36" rx="10" fill="none" stroke="var(--ok, #2f9e44)" stroke-width="3" opacity="${e}"/>`;
      return o;
    },
    caption: (t) => {
      if (t < T0) return `Oikealla on yhteensä ${tot}. Mitä vasemmalle tulee?`;
      if (t < TB) { const nb = Math.min(k, Math.floor((t - T0) / DT) + 1); return `${nb} samanlaista tuntematonta: ${nb === 1 ? 'x' : `${nb}x`}.`; }
      if (t < TL) return `Tunnettu osa ${b} lisätään: + ${b}.`;
      if (t < TE + 1.2) return `Vaaka on suorassa: molemmat puolet ovat yhtä suuret. Väliin tulee =.`;
      return `Yhtälö on ${k}x + ${b} = ${tot}. Jokainen pala vastaa jotakin tilanteen osaa.`;
    },
  });
}

const gcd2 = (a: number, b: number): number => (b ? gcd2(b, a % b) : Math.abs(a));

/** a/b · c/d as "a/b of c/d": c of d columns are shaded, then a of b rows of that part get the darker
 *  overlap; the overlap cells are counted one by one out of b·d. Ends with the product (reduced). */
export function partOfPartScene(a: number, b: number, c: number, d: number, what = 'neliöstä'): AnimPaint {
  const W = 300, H = 256, S = 168, X0 = 16, Y0 = 34, cw = S / d, rh = S / b;
  const T0 = 0.8, TA = T0 + 0.4 + c * 0.45 + 0.6, TB = TA + 0.4 + a * 0.45 + 0.6, CT = Math.min(0.45, 3.2 / (a * c)), TC = TB + a * c * CT, TD = TC + 1.2;
  const g = gcd2(a * c, b * d);
  return anim({
    dur: TD + 4, w: W, h: H, label: `${a}/${b} · ${c}/${d}`,
    frame: (t) => {
      let o = `<rect x="${X0}" y="${Y0}" width="${S}" height="${S}" fill="var(--card, #fff)" stroke="currentColor" stroke-width="2"/>`;
      // Columns c/d.
      const vLines = ease(t, T0 - 0.4, T0);
      for (let j = 1; j < d; j++) o += `<line x1="${X0 + j * cw}" y1="${Y0}" x2="${X0 + j * cw}" y2="${Y0 + S * vLines}" stroke="currentColor" stroke-opacity=".5"/>`;
      for (let j = 0; j < c; j++) {
        const e = ease(t, T0 + 0.4 + j * 0.45, T0 + 0.8 + j * 0.45);
        if (e > 0) o += `<rect x="${X0 + j * cw}" y="${Y0}" width="${cw}" height="${S}" fill="#6aa9e0" opacity="${0.55 * e}"/>`;
      }
      if (t >= T0 + 0.4) o += `<text x="${X0 + (c * cw) / 2}" y="${Y0 - 8}" text-anchor="middle" font-size="14" font-weight="900" fill="#2b6cb0" opacity="${ease(t, T0 + 0.4, T0 + 0.8)}">${c}/${d}</text>`;
      // Rows a/b, only inside the shaded columns (the part of the part).
      if (t >= TA) {
        const hl = ease(t, TA, TA + 0.4);
        for (let i = 1; i < b; i++) o += `<line x1="${X0}" y1="${Y0 + i * rh}" x2="${X0 + S * hl}" y2="${Y0 + i * rh}" stroke="currentColor" stroke-opacity=".5"/>`;
        for (let i = 0; i < a; i++) {
          const e = ease(t, TA + 0.4 + i * 0.45, TA + 0.8 + i * 0.45);
          if (e > 0) o += `<rect x="${X0}" y="${Y0 + i * rh}" width="${c * cw}" height="${rh}" fill="#e8913a" opacity="${0.75 * e}"/>`;
        }
        o += `<text x="${X0 + S + 6}" y="${Y0 + (a * rh) / 2 + 5}" font-size="14" font-weight="900" fill="#e8913a" opacity="${ease(t, TA + 0.4, TA + 0.8)}">${a}/${b} siitä</text>`;
      }
      // Count overlap cells.
      if (t >= TB) {
        const k = Math.min(a * c, Math.floor((t - TB) / CT) + 1);
        for (let q = 0; q < k; q++) {
          const i = Math.floor(q / c), j = q % c;
          o += `<text x="${X0 + j * cw + cw / 2}" y="${Y0 + i * rh + rh / 2 + 5}" text-anchor="middle" font-size="${Math.min(15, cw * 0.45)}" font-weight="900" fill="#fff">${q + 1}</text>`;
        }
      }
      const e = ease(t, TC, TC + 0.5);
      if (e > 0) {
        o += `<g opacity="${e}"><text x="${X0 + S + 8}" y="${Y0 + S - 34}" font-size="12" font-weight="800" fill="currentColor">ruutuja</text><text x="${X0 + S + 8}" y="${Y0 + S - 16}" font-size="12" font-weight="800" fill="currentColor">${b} · ${d} = ${b * d}</text></g>`;
        o += `<text x="${W / 2}" y="232" text-anchor="middle" font-size="17" font-weight="900" fill="currentColor" opacity="${e}">${a}/${b} · ${c}/${d} = (${a}·${c})/(${b}·${d}) = ${a * c}/${b * d}</text>`;
      }
      const f = ease(t, TD, TD + 0.5);
      if (f > 0 && g > 1) o += `<text x="${W / 2}" y="252" text-anchor="middle" font-size="14" font-weight="900" fill="var(--ok, #2f9e44)" opacity="${f}">supistettuna ${a * c / g}/${b * d / g}</text>`;
      return o;
    },
    caption: (t) => {
      if (t < TA) return `Ensin ${c}/${d} ${what}: ${c} saraketta ${d}:stä.`;
      if (t < TB) return `Siitä otetaan ${a}/${b}: ${a} riviä ${b}:stä, vain sinisen osan päältä.`;
      if (t < TC) return `Lasketaan päällekkäiset ruudut: ${a} riviä kertaa ${c} saraketta.`;
      return `${a * c} ruutua ${b * d}:stä on ${a * c}/${b * d}. Osoittajat kerrotaan keskenään ja nimittäjät keskenään${g > 1 ? `, ja tulos supistuu: ${a * c / g}/${b * d / g}` : ''}.`;
    },
  });
}

/** The reciprocal machine: a/b flips (numerator and denominator swap places), then a/b · b/a = (a·b)/(b·a) = 1. */
export function flipScene(a: number, b: number): AnimPaint {
  const W = 300, H = 200, X = 70;
  const T1 = 1.0, T2 = 2.6, T3 = 3.8, T4 = 5.2;
  const frac = (x: number, n: string, dn: string, col: string, op = 1) =>
    `<g opacity="${op}"><text x="${x}" y="70" text-anchor="middle" font-size="30" font-weight="900" fill="${col}">${n}</text><line x1="${x - 18}" y1="80" x2="${x + 18}" y2="80" stroke="currentColor" stroke-width="3"/><text x="${x}" y="112" text-anchor="middle" font-size="30" font-weight="900" fill="${col}">${dn}</text></g>`;
  return anim({
    dur: T4 + 3.5, w: W, h: H, label: `${a}/${b} käänteisluku`,
    frame: (t) => {
      let o = frac(X, String(a), String(b), 'currentColor');
      // Machine and flipping copy.
      const m = ease(t, 0.2, 0.7) * (1 - ease(t, T2, T2 + 0.5));
      o += `<rect x="${X + 40}" y="40" width="70" height="80" rx="10" fill="#6aa9e0" opacity="${0.25 * m}" stroke="#2b6cb0" stroke-opacity="${m}"/><text x="${X + 75}" y="135" text-anchor="middle" font-size="11" font-weight="800" fill="#2b6cb0" opacity="${m}">kääntökone</text>`;
      const f = ease(t, T1, T2), x2 = X + 150;
      // Numerator falls, denominator rises (they swap through the machine).
      const yTop = 70 + 42 * f, yBot = 112 - 42 * f, xs = X + (x2 - X) * ease(t, T1 - 0.6, T1);
      if (t >= T1 - 0.6) {
        const sw = Math.sin(Math.PI * f) * 22;
        o += `<text x="${xs + sw}" y="${yTop}" text-anchor="middle" font-size="30" font-weight="900" fill="#e8913a">${a}</text><line x1="${xs - 18}" y1="80" x2="${xs + 18}" y2="80" stroke="currentColor" stroke-width="3"/><text x="${xs - sw}" y="${yBot}" text-anchor="middle" font-size="30" font-weight="900" fill="#2b6cb0">${b}</text>`;
        o += `<text x="${(X + xs) / 2}" y="90" text-anchor="middle" font-size="22" font-weight="900" fill="currentColor" opacity="${ease(t, T2 + 0.3, T2 + 0.7)}">·</text>`;
      }
      const e = ease(t, T3, T3 + 0.5);
      if (e > 0) o += `<text x="${W / 2}" y="160" text-anchor="middle" font-size="18" font-weight="900" fill="currentColor" opacity="${e}">${a}/${b} · ${b}/${a} = ${a * b}/${a * b}</text>`;
      const g = ease(t, T4, T4 + 0.5);
      if (g > 0) o += `<rect x="${W / 2 - 40}" y="170" width="80" height="26" rx="8" fill="var(--ok, #2f9e44)" opacity="${g}"/><text x="${W / 2}" y="189" text-anchor="middle" font-size="16" font-weight="900" fill="#fff" opacity="${g}">= 1</text>`;
      return o;
    },
    caption: (t) => {
      if (t < T1) return `Luku ${a}/${b} menee kääntökoneeseen.`;
      if (t < T3) return `Osoittaja ja nimittäjä vaihtavat paikkaa: ${a}/${b} → ${b}/${a}.`;
      if (t < T4) return `Kerrotaan: osoittajaan ${a}·${b}, nimittäjään ${b}·${a}. Ne ovat samat luvut.`;
      return `Tulo on ${a * b}/${a * b} = 1. Siksi ${b}/${a} on luvun ${a}/${b} käänteisluku.`;
    },
  });
}

/** How many a/b-pieces fit into one whole? Pieces slide onto a 0…1 strip one at a time; the last one is cut.
 *  The count is b/a, the reciprocal of a/b. */
export function fitScene(a: number, b: number): AnimPaint {
  const W = 300, H = 170, X0 = 20, L = 230, Y = 60, h = 34, u = L / b, pw = a * u;
  const full = Math.floor(b / a), rest = b % a, n = full + (rest ? 1 : 0), STEP = Math.min(1.1, 6 / n), T0 = 1.0, TE = T0 + n * STEP;
  const fills = ['#e8913a', '#6aa9e0'];
  return anim({
    dur: TE + 4, w: W, h: H, label: `montako ${a}/${b} mahtuu yhteen`,
    frame: (t) => {
      let o = `<rect x="${X0}" y="${Y}" width="${L}" height="${h}" fill="none" stroke="currentColor" stroke-width="2"/>`;
      for (let j = 1; j < b; j++) o += `<line x1="${X0 + j * u}" y1="${Y}" x2="${X0 + j * u}" y2="${Y + h}" stroke="currentColor" stroke-opacity=".35"/>`;
      o += `<text x="${X0}" y="${Y + h + 18}" text-anchor="middle" font-size="12" fill="currentColor">0</text><text x="${X0 + L}" y="${Y + h + 18}" text-anchor="middle" font-size="12" fill="currentColor">1</text>`;
      // Piece template.
      o += `<rect x="${X0}" y="16" width="${pw}" height="20" rx="4" fill="#e8913a" opacity=".9"/><text x="${X0 + pw + 8}" y="31" font-size="13" font-weight="900" fill="#e8913a">pala ${a}/${b}</text>`;
      for (let k = 0; k < n; k++) {
        const s = T0 + k * STEP, e = ease(t, s, s + STEP * 0.7);
        if (e <= 0) break;
        const last = rest && k === n - 1, w = last ? rest * u : pw, x = X0 + k * pw;
        const yy = 16 + (Y - 16) * e;
        o += `<rect x="${x}" y="${yy}" width="${w}" height="${e < 1 ? 20 : h}" fill="${fills[k % 2]}" opacity=".8"/>`;
        if (last && e >= 1) o += `<rect x="${x + w}" y="${Y - 2}" width="${pw - w}" height="${h + 4}" fill="none" stroke="#e8913a" stroke-dasharray="4 3"/><text x="${x + w / 2}" y="${Y + h + 34}" text-anchor="middle" font-size="12" font-weight="800" fill="#e8913a">${rest}/${a} palaa</text>`;
        if (e >= 1) o += `<text x="${x + w / 2}" y="${Y + h / 2 + 5}" text-anchor="middle" font-size="14" font-weight="900" fill="#fff">${last ? '' : k + 1}</text>`;
      }
      const f = ease(t, TE, TE + 0.5);
      if (f > 0) o += `<text x="${W / 2}" y="${H - 12}" text-anchor="middle" font-size="17" font-weight="900" fill="currentColor" opacity="${f}">yhteen mahtuu ${rest ? `${full} ja ${rest}/${a} = ` : ''}${b}/${a}${a === 1 ? ` = ${b}` : ''} palaa</text>`.replace(`${b}/1 = `, '');
      return o;
    },
    caption: (t) => {
      if (t < T0) return `Kuinka monta ${a}/${b}-palaa mahtuu yhteen kokonaiseen?`;
      if (t < TE) return `Paloja asetetaan peräkkäin 0:sta 1:een.${rest ? ' Viimeinen pala ei mahdu kokonaan.' : ''}`;
      return a === 1 ? `Yhteen mahtuu ${b} palaa. Se on luvun 1/${b} käänteisluku: ${b} · 1/${b} = 1.` : `Yhteen mahtuu ${b}/${a} palaa. Se on luvun ${a}/${b} käänteisluku: ${b}/${a} · ${a}/${b} = 1.`;
    },
  });
}

/** p/q : c/e as measuring: the dividend is shaded on a ruler (whole units marked), then c/e-pieces are laid on it one
 *  at a time and counted; a last cut piece shows the remainder. Ends with p/q · e/c = result. */
export function measureScene(p: number, q: number, c: number, e: number, pieceName?: string): AnimPaint {
  const pn = pieceName ?? `${c}/${e}`;
  const W = 300, H = 200, X0 = 16, Y = 78, h = 30;
  const units = Math.max(1, Math.ceil(p / q)), L = 266, U = L / units;
  const num = p * e, den = q * c, g = gcd2(num, den), full = Math.floor(num / den), rem = num % den;
  const n = full + (rem ? 1 : 0), STEP = Math.min(0.9, 6.5 / Math.max(1, n)), T0 = 1.6, TE = T0 + n * STEP;
  const pw = (c / e) * U, tgt = (p / q) * U;
  const inv = c === 1 ? String(e) : `${e}/${c}`;
  const res = den / g === 1 ? `${num / g}` : `${num / g}/${den / g}`;
  return anim({
    dur: TE + 4.5, w: W, h: H, label: `${p}${q === 1 ? '' : '/' + q} : ${c}/${e}`,
    frame: (t) => {
      let o = `<rect x="${X0}" y="${Y}" width="${L}" height="${h}" fill="none" stroke="currentColor" stroke-opacity=".5"/>`;
      for (let j = 0; j <= units; j++) o += `<line x1="${X0 + j * U}" y1="${Y - 4}" x2="${X0 + j * U}" y2="${Y + h + 4}" stroke="currentColor" stroke-width="2"/><text x="${X0 + j * U}" y="${Y + h + 18}" text-anchor="middle" font-size="12" fill="currentColor">${j}</text>`;
      const sh = ease(t, 0.3, 1.2);
      o += `<rect x="${X0}" y="${Y}" width="${tgt * sh}" height="${h}" fill="#6aa9e0" opacity=".35"/><rect x="${X0}" y="${Y}" width="${tgt * sh}" height="${h}" fill="none" stroke="#2b6cb0" stroke-width="2"/>`;
      o += `<text x="${X0 + tgt / 2}" y="${Y + h + 36}" text-anchor="middle" font-size="13" font-weight="900" fill="#2b6cb0" opacity="${sh}">jaettava ${p}${q === 1 ? '' : '/' + q}</text>`;
      o += `<rect x="${X0}" y="20" width="${pw}" height="18" rx="4" fill="#e8913a"/><text x="${X0 + pw + 8}" y="34" font-size="13" font-weight="900" fill="#e8913a">pala ${pn}</text>`;
      for (let k = 0; k < n; k++) {
        const s = T0 + k * STEP, f = ease(t, s, s + STEP * 0.7);
        if (f <= 0) break;
        const last = rem && k === n - 1, w = last ? (rem / den) * pw : pw, x = X0 + k * pw, yy = 20 + (Y - 20) * f;
        o += `<rect x="${x}" y="${yy}" width="${w}" height="${f < 1 ? 18 : h}" fill="${k % 2 ? '#c9701f' : '#e8913a'}" opacity=".85"/>`;
        if (f >= 1 && !last && pw > 14) o += `<text x="${x + pw / 2}" y="${Y + h / 2 + 5}" text-anchor="middle" font-size="${Math.min(14, pw * 0.6)}" font-weight="900" fill="#fff">${k + 1}</text>`;
        if (f >= 1 && last) o += `<rect x="${x}" y="${Y - 3}" width="${pw}" height="${h + 6}" fill="none" stroke="#e8913a" stroke-dasharray="4 3"/>`;
      }
      const z = ease(t, TE, TE + 0.5);
      if (z > 0) {
        const cnt = full ? `${full}${rem ? ` ja ${rem / gcd2(rem, den)}/${den / gcd2(rem, den)}` : ''}` : `vain ${rem / gcd2(rem, den)}/${den / gcd2(rem, den)}`;
        o += `<text x="${W / 2}" y="166" text-anchor="middle" font-size="14" font-weight="900" fill="#e8913a" opacity="${z}">mahtuu ${cnt} palaa</text>`;
        o += `<text x="${W / 2}" y="192" text-anchor="middle" font-size="17" font-weight="900" fill="currentColor" opacity="${ease(t, TE + 1, TE + 1.5)}">${p}${q === 1 ? '' : '/' + q} : ${c}/${e} = ${p}${q === 1 ? '' : '/' + q} · ${inv} = ${res}</text>`;
      }
      return o;
    },
    caption: (t) => {
      if (t < T0) return `Jakolasku kysyy: montako ${pn}-palaa mahtuu lukuun ${p}${q === 1 ? '' : '/' + q}?`;
      if (t < TE) return full ? 'Paloja asetetaan peräkkäin ja lasketaan.' : 'Pala on suurempi kuin jaettava: kokonaista palaa ei mahdu.';
      if (t < TE + 1) return rem ? `Viimeisestä palasta mahtuu vain osa.` : `Paloja mahtui tasan ${full}.`;
      return `Sama tulos saadaan kertomalla jakajan käänteisluvulla ${inv}: ${res}.`;
    },
  });
}


/** Decimal division by moving the comma: both numbers are multiplied by 10 (comma hops one digit right) until the
 *  divisor is a whole number; the quotient stays the same. a and b are given with at most two decimals. */
export function commaShiftScene(a: number, b: number): AnimPaint {
  const dec = (x: number) => { const s = String(x); return s.includes('.') ? s.split('.')[1].length : 0; };
  const n = dec(b), q = Math.round((a / b) * 1e6) / 1e6, fmtN = (x: number) => String(x).replace('.', ',');
  const pad = (x: number) => { const [i, f = ''] = String(x).split('.'); const fr = f.padEnd(Math.max(n, f.length), '0'); return { i, f: fr, o: i.length + f.length }; };
  const A = pad(a), B = pad(b), CW = 22, W = 300, H = 200, Y = 92, T0 = 1.2, HOP = 1.3, TE = T0 + n * HOP;
  const draw = (P: { i: string; f: string; o: number }, x0: number, t: number, col: string) => {
    const digits = P.i + P.f, shift = Math.min(n, Math.max(0, (t - T0) / HOP));
    const hops = Math.floor(shift), frac = ease(shift - hops, 0, 1), comma = P.i.length + hops + (hops < n ? frac : 0);
    const intEnd = Math.round(P.i.length + Math.min(n, shift));
    let lead = 0; while (lead < intEnd - 1 && digits[lead] === '0') lead++;
    const restF = digits.length - intEnd, done = t >= TE;
    let o = '';
    for (let k = 0; k < digits.length; k++) {
      const fadeLead = k < lead && done ? 1 - ease(t, TE, TE + 0.6) : 1, added = k >= P.o, op = added ? ease(t, T0 + (k - P.i.length) * HOP - 0.5, T0 + (k - P.i.length) * HOP) : fadeLead;
      const slide = done ? lead * CW * ease(t, TE + 0.4, TE + 1) : 0;
      if (op > 0) o += `<text x="${x0 + k * CW + CW / 2 - slide}" y="${Y}" text-anchor="middle" font-family="monospace" font-size="28" font-weight="900" fill="${added ? '#e8913a' : col}" opacity="${op}">${digits[k]}</text>`;
    }
    if (restF > 0 || !done) {
      const cx = x0 + comma * CW, op = (done && restF === 0 ? 1 - ease(t, TE, TE + 0.4) : 1) * (P.o === P.i.length ? ease(t, T0 - 0.4, T0) : 1);
      o += `<text x="${cx}" y="${Y + 6}" text-anchor="middle" font-size="30" font-weight="900" fill="#d6336c" opacity="${op}">,</text>`;
    }
    return o;
  };
  return anim({
    dur: TE + 5, w: W, h: H, label: `${fmtN(a)} : ${fmtN(b)}`,
    frame: (t) => {
      const la = (A.i + A.f).length, lb = (B.i + B.f).length, xa = (W - (la + lb) * CW - 36) / 2, xb = xa + la * CW + 36;
      let o = draw(A, xa, t, 'currentColor') + `<text x="${xa + la * CW + 18}" y="${Y}" text-anchor="middle" font-size="28" font-weight="900" fill="currentColor">:</text>` + draw(B, xb, t, '#2b6cb0');
      for (let k = 0; k < n; k++) {
        const e = ease(t, T0 + k * HOP, T0 + k * HOP + 0.3) * (1 - ease(t, T0 + (k + 1) * HOP - 0.2, T0 + (k + 1) * HOP));
        if (e > 0) o += `<text x="${W / 2}" y="40" text-anchor="middle" font-size="18" font-weight="900" fill="#d6336c" opacity="${e}">molemmat · 10</text>`;
      }
      if (t >= T0) o += `<text x="${W / 2}" y="${Y + 34}" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor" opacity=".8">kerrottu yhteensä · ${10 ** Math.min(n, Math.ceil((t - T0) / HOP))}</text>`;
      const e = ease(t, TE + 0.8, TE + 1.3);
      const ai = Math.round(a * 10 ** n), bi = Math.round(b * 10 ** n);
      if (e > 0) o += `<text x="${W / 2}" y="${Y + 66}" text-anchor="middle" font-size="20" font-weight="900" fill="currentColor" opacity="${e}">${fmtN(ai)} : ${bi} = ${fmtN(q)}</text>`;
      const f = ease(t, TE + 2.2, TE + 2.7);
      if (f > 0) o += `<text x="${W / 2}" y="${Y + 94}" text-anchor="middle" font-size="14" font-weight="800" fill="var(--ok, #2f9e44)" opacity="${f}">tarkistus: ${fmtN(q)} · ${fmtN(b)} = ${fmtN(a)} ✓</text>`;
      return o;
    },
    caption: (t) => {
      if (t < T0) return `Jakaja ${fmtN(b)} on desimaaliluku. Tehdään siitä kokonaisluku.`;
      if (t < TE) return `Kerrotaan jaettava ja jakaja samalla luvulla: pilkku siirtyy molemmissa yhtä monta askelta oikealle.${A.o < A.i.length + n ? ' Tyhjään kohtaan tulee nolla.' : ''}`;
      if (t < TE + 2.2) return 'Nyt jakaja on kokonaisluku, ja osamäärä on sama kuin alussa.';
      return `Tarkistus kertolaskulla: ${fmtN(q)} · ${fmtN(b)} = ${fmtN(a)}.`;
    },
  });
}

const bagIcon = (x: number, y: number) =>
  `<path d="M${x - 14} ${y} l4 -26 h20 l4 26z" fill="#c9a26b" stroke="#8a5a33" stroke-width="2"/><path d="M${x - 8} ${y - 26} q8 -10 16 0" fill="none" stroke="#8a5a33" stroke-width="2"/><text x="${x}" y="${y - 7}" text-anchor="middle" font-size="15" font-weight="800" fill="#5a3a1e">?</text>`;
const wIcon = (x: number, y: number, k: string | number) =>
  `<path d="M${x - 13} ${y} l3 -22 h20 l3 22z" fill="#7c8a96" stroke="#4d5963" stroke-width="2"/><rect x="${x - 4}" y="${y - 27}" width="8" height="6" rx="2" fill="#4d5963"/><text x="${x}" y="${y - 6}" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">${k}</text>`;

/** n·x + b = m·x + D solved on a balance: m bags off both pans, b kg off both pans, the rest split into
 *  k = n − m equal shares (one bag balances one share), then the check. The equation grows line by line. */
export function balanceSolveScene(n: number, b: number, x: number, m = 0): AnimPaint {
  const W = 300, H = 312, cx = W / 2, arm = W * 0.28, k = n - m, D = k * x + b, co = (c: number) => (c === 1 ? '' : String(c));
  const T0 = 1.4, TM = T0, TB0 = m ? TM + 2.4 : T0, TS = TB0, TB = TS + 1.0, TK = TB + 2.4, TK2 = TK + 1.2, TE = k > 1 ? TK2 + 1.6 : TK, TC = TE + 1.0;
  const panY = 52 + 60;
  const lift = (t: number, s: number) => (t < s ? 0 : ease(t, s, s + 1.0));
  const fadeOut = (t: number, s: number) => 1 - ease(t, s + 1.0, s + 1.8);
  const lines = [`${co(n)}x + ${b} = ${m ? `${co(m)}x + ` : ''}${D}`, ...(m ? [`${co(k)}x + ${b} = ${D}  | − ${co(m)}x`] : []), `${co(k)}x = ${D - b}  | − ${b}`, ...(k > 1 ? [`x = ${x}  | : ${k}`] : [])];
  const lineAt = [0, ...(m ? [TM + 1.4] : []), TB + 1.4, ...(k > 1 ? [TK2 + 1.0] : [])];
  return anim({
    dur: TC + 4, w: W, h: H, label: lines[0],
    frame: (t) => {
      const left: string[] = [...Array(t >= TE ? 1 : t >= TK2 ? 1 : (m && t >= TM ? k : n)).fill('x'), ...(t < TB ? [String(b)] : [])];
      let right: string[];
      if (t < TS) right = [...Array(m && t < TM ? m : 0).fill('x'), String(D)];
      else if (t < TB) right = [String(b), String(D - b)];
      else if (k > 1 && t >= TK && t < TK2) right = Array(k).fill(String(x));
      else if (k > 1 && t >= TK2) right = [String(x)];
      else right = [String(D - b)];
      // While lifting, the lifted items are drawn floating instead of in the pans.
      let s = balanceBody(left, right, 0, W);
      if (m && t >= TM && t < TM + 1.8) {
        const e = lift(t, TM), op = fadeOut(t, TM);
        for (let i = 0; i < m; i++) s += `<g opacity="${op}">${bagIcon(cx - arm - 10 + i * 20 - e * 30, panY - e * 64)}${bagIcon(cx + arm - 10 + i * 20 + e * 30, panY - e * 64)}</g>`;
      }
      if (t >= TB - 0.01 && t < TB + 1.8) {
        const e = lift(t, TB), op = fadeOut(t, TB);
        s += `<g opacity="${op}">${wIcon(cx - arm + 20 - e * 34, panY - e * 64, b)}${wIcon(cx + arm - 20 + e * 34, panY - e * 64, b)}</g>`;
      }
      if (t >= TS && t < TS + 0.9) s += `<text x="${cx + arm}" y="24" text-anchor="middle" font-size="13" font-weight="800" fill="#e8913a">${D} = ${b} + ${D - b}</text>`;
      if (k > 1 && t >= TK && t < TK2 + 1) s += `<text x="${cx}" y="22" text-anchor="middle" font-size="14" font-weight="800" fill="#e8913a">${D - b} = ${Array(k).fill(x).join(' + ')}</text>`;
      if (m && t >= TM + 0.3 && t < TM + 1.8) s += `<text x="${cx}" y="22" text-anchor="middle" font-size="14" font-weight="800" fill="var(--pond)">${co(m) || 'yksi'} ${m === 1 ? 'pussi' : 'pussia'} pois molemmilta</text>`;
      if (t >= TB + 0.3 && t < TB + 1.8) s += `<text x="${cx}" y="22" text-anchor="middle" font-size="14" font-weight="800" fill="var(--pond)">${b} kg pois molemmilta</text>`;
      lines.forEach((l, i) => {
        const e = ease(t, lineAt[i], lineAt[i] + 0.4);
        if (e > 0) s += `<text x="${cx}" y="${214 + i * 22}" text-anchor="middle" font-size="16" font-weight="900" fill="${i === lines.length - 1 && t >= TE ? 'var(--ok, #2f9e44)' : 'currentColor'}" opacity="${e}">${l}</text>`;
      });
      const c = ease(t, TC, TC + 0.5);
      if (c > 0) s += `<text x="${cx}" y="${214 + lines.length * 22 + 2}" text-anchor="middle" font-size="13" font-weight="800" fill="var(--ok, #2f9e44)" opacity="${c}">tarkistus: ${co(n) ? `${n} · ${x}` : x} + ${b} = ${n * x + b}${m ? `, ${co(m) ? `${m} · ${x}` : x} + ${D} = ${m * x + D}` : ''} ✓</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T0) return 'Vaaka on suorassa: molemmat puolet painavat yhtä paljon.';
      if (m && t < TS) return `Otetaan ${m === 1 ? 'yksi pussi' : `${m} pussia`} pois molemmilta puolilta. Vaaka pysyy suorassa.`;
      if (t < TB) return `Jaetaan ${D} kg kahdeksi painoksi: ${b} ja ${D - b}.`;
      if (t < TK) return `Otetaan ${b} kg pois molemmilta puolilta. Jäljelle jää ${k === 1 ? 'yksi pussi' : `${k} pussia`} ja ${D - b} kg.`;
      if (k > 1 && t < TE) return `${k} pussia painaa ${D - b} kg. Jaetaan ${D - b} kg ${k} yhtä suureen osaan: yksi pussi on ${x} kg.`;
      if (t < TC) return `Pussi painaa ${x} kg: x = ${x}.`;
      return 'Tarkistus: sijoitetaan x alkuperäiseen yhtälöön. Molemmat puolet ovat yhtä suuret.';
    },
  });
}

/** Proportion as juice: jar 1 gets a cups of concentrate and b of water, jar 2 the same ratio times k, jar 3 the
 *  "add the same number" mistake (a+k : b+k). Cups pour in one at a time, then mix; equal colour = equal taste.
 *  Ends with the cross products. */
export function mixScene(a: number, b: number, k: number): AnimPaint {
  const W = 300, H = 250, JW = 70, JH = 120, JY = 40, xs = [20, 115, 210];
  const jars = [[a, b], [a * k, b * k], [a + k, b + k]] as const;
  const maxT = Math.max(...jars.map(([p, q]) => p + q)), cupH = JH / maxT;
  const mix = (p: number, q: number) => {
    const f = Math.min(1, (2 * p) / (p + q)), c1 = [194, 65, 12], c2 = [219, 234, 254];
    return `rgb(${c1.map((v, i) => Math.round(v * f + c2[i] * (1 - f))).join(',')})`;
  };
  const POUR = Math.min(0.22, 3 / maxT);
  const start = [0.6, 0, 0];
  start[1] = start[0] + (a + b) * POUR + 1.4;
  start[2] = start[1] + (a + b) * k * POUR + 1.4;
  const TE = start[2] + (a + b + 2 * k) * POUR + 1.4, TX = TE + 1.6;
  return anim({
    dur: TX + 4, w: W, h: H, label: `${a} : ${b} = ${a * k} : ${b * k}`,
    frame: (t) => {
      let o = '';
      jars.forEach(([p, q], j) => {
        const x = xs[j], s0 = start[j], n = p + q;
        if (t < s0 - 0.3) { o += `<rect x="${x}" y="${JY}" width="${JW}" height="${JH}" rx="6" fill="none" stroke="currentColor" stroke-opacity=".3"/>`; return; }
        const shown = Math.min(n, Math.max(0, Math.floor((t - s0) / POUR)));
        const mixed = ease(t, s0 + n * POUR + 0.2, s0 + n * POUR + 0.9);
        for (let i = 0; i < shown; i++) {
          o += `<rect x="${x + 3}" y="${JY + JH - (i + 1) * cupH}" width="${JW - 6}" height="${cupH}" fill="${i < p ? '#c2410c' : '#dbeafe'}" stroke="#123" stroke-opacity=".25" stroke-width=".5" opacity="${1 - mixed}"/>`;
        }
        if (mixed > 0) o += `<rect x="${x + 3}" y="${JY + JH - n * cupH}" width="${JW - 6}" height="${n * cupH}" fill="${mix(p, q)}" opacity="${mixed}"/>`;
        o += `<rect x="${x}" y="${JY}" width="${JW}" height="${JH}" rx="6" fill="none" stroke="currentColor" stroke-width="2"/>`;
        o += `<text x="${x + JW / 2}" y="${JY - 10}" text-anchor="middle" font-size="15" font-weight="900" fill="currentColor">${p} : ${q}</text>`;
        if (j && mixed >= 1) {
          const ok = j === 1;
          o += `<text x="${x + JW / 2}" y="${JY + JH + 36}" text-anchor="middle" font-size="12" font-weight="900" fill="${ok ? 'var(--ok, #2f9e44)' : '#c0392b'}">${ok ? `· ${k} ✓ sama` : `+ ${k} ✗ eri`}</text>`;
        }
        if (mixed >= 1) o += `<text x="${x + JW / 2}" y="${JY + JH + 18}" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor">tiivistettä ${p}/${n}</text>`;
      });
      const e = ease(t, TX, TX + 0.6);
      if (e > 0) o += `<text x="${W / 2}" y="${H - 34}" text-anchor="middle" font-size="17" font-weight="900" fill="currentColor" opacity="${e}">${a} : ${b} = ${a * k} : ${b * k}</text><text x="${W / 2}" y="${H - 10}" text-anchor="middle" font-size="14" font-weight="800" fill="var(--ok, #2f9e44)" opacity="${e}">ristiin: ${a} · ${b * k} = ${a * b * k} = ${b} · ${a * k}</text>`;
      return o;
    },
    caption: (t) => {
      if (t < start[1]) return `Mehu: ${a} kuppia tiivistettä (oranssi) ja ${b} kuppia vettä.`;
      if (t < start[2]) return `${k} kertaa enemmän kumpaakin: ${a * k} ja ${b * k} kuppia. Tiivisteen osuus ${a * k}/${(a + b) * k} = ${a}/${a + b} on sama, joten väri ja maku ovat samat.`;
      if (t < TX) return `Virhe: lisätään ${k} kumpaankin, jolloin saadaan ${a + k} ja ${b + k}. Tiivisteen osuus on ${a + k}/${a + b + 2 * k}, joten väri ja maku muuttuvat.`;
      return `Verranto: molemmat jäsenet kerrotaan samalla luvulla. Ristiintulot ovat yhtä suuret.`;
    },
  });
}

/** Rule hunt: a table of machine pairs; candidate rules are tested pair by pair. Each input flies into the
 *  candidate column, the computed value appears with ✓ or ✗. A rule is accepted only if every pair passes. */
export function ruleHuntScene(xs: number[], ys: number[], cands: { label: string; f: (x: number) => number }[]): AnimPaint {
  const W = 300, H = 230, R0 = 74, RH = 30, CX = [138, 222], ST = 0.9, T0 = 1.0;
  const colStart = cands.map((_, j) => T0 + j * (xs.length * ST + 1.2));
  const TE = colStart[cands.length - 1] + xs.length * ST + 0.6;
  const okAll = cands.map((c) => xs.every((x, i) => c.f(x) === ys[i]));
  const sg = (v: number) => String(v).replace('-', '−');
  return anim({
    dur: TE + 4, w: W, h: H, label: 'säännön testaus',
    frame: (t) => {
      let o = `<text x="34" y="${R0 - 30}" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor">sisään</text><text x="84" y="${R0 - 30}" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor">ulos</text>`;
      xs.forEach((x, i) => {
        const y = R0 + i * RH;
        o += `<rect x="12" y="${y - 20}" width="96" height="26" rx="5" fill="none" stroke="currentColor" stroke-opacity=".3"/><text x="34" y="${y}" text-anchor="middle" font-size="16" font-weight="900" fill="currentColor">${sg(x)}</text><text x="84" y="${y}" text-anchor="middle" font-size="16" font-weight="900" fill="#2b6cb0">${sg(ys[i])}</text>`;
      });
      cands.forEach((c, j) => {
        const s0 = colStart[j];
        if (t < s0 - 0.5) return;
        const cx = CX[j], hd = ease(t, s0 - 0.5, s0);
        const done = t >= s0 + xs.length * ST, ok = okAll[j];
        o += `<text x="${cx}" y="${R0 - 30}" text-anchor="middle" font-size="15" font-weight="900" fill="${done ? (ok ? 'var(--ok, #2f9e44)' : '#c0392b') : '#e8913a'}" opacity="${hd}">${c.label}</text>`;
        if (done && !ok) o += `<line x1="${cx - 34}" y1="${R0 - 35}" x2="${cx + 34}" y2="${R0 - 35}" stroke="#c0392b" stroke-width="2.5"/>`;
        xs.forEach((x, i) => {
          const a = s0 + i * ST, e = ease(t, a, a + ST * 0.55), y = R0 + i * RH;
          if (e <= 0) return;
          if (e < 1) { o += `<text x="${34 + (cx - 34) * e}" y="${y - 8 * Math.sin(Math.PI * e)}" text-anchor="middle" font-size="15" font-weight="900" fill="#e8913a">${sg(x)}</text>`; return; }
          const v = c.f(x), good = v === ys[i];
          o += `<text x="${cx - 8}" y="${y}" text-anchor="middle" font-size="16" font-weight="900" fill="currentColor">${sg(v)}</text><text x="${cx + 18}" y="${y}" text-anchor="middle" font-size="16" font-weight="900" fill="${good ? 'var(--ok, #2f9e44)' : '#c0392b'}">${good ? '✓' : '✗'}</text>`;
        });
        if (done && ok) o += `<rect x="${cx - 40}" y="${R0 - 50}" width="80" height="${xs.length * RH + 38}" rx="8" fill="none" stroke="var(--ok, #2f9e44)" stroke-width="2.5" opacity="${ease(t, s0 + xs.length * ST, s0 + xs.length * ST + 0.4)}"/>`;
      });
      const e = ease(t, TE, TE + 0.5), win = cands.findIndex((_, j) => okAll[j]);
      if (e > 0 && win >= 0) o += `<text x="${W / 2}" y="${H - 18}" text-anchor="middle" font-size="16" font-weight="900" fill="var(--ok, #2f9e44)" opacity="${e}">Sääntö ${cands[win].label} pätee kaikkiin pareihin</text>`;
      return o;
    },
    caption: (t) => {
      for (let j = cands.length - 1; j >= 0; j--) {
        const s0 = colStart[j];
        if (t >= s0) {
          if (t >= TE) return 'Sääntö hyväksytään vasta, kun jokainen pari on testattu ja kaikki toimivat.';
          const i = Math.min(xs.length - 1, Math.floor((t - s0) / ST)), v = cands[j].f(xs[i]);
          return `Testataan ${cands[j].label}: sisään ${sg(xs[i])} → ${sg(v)}. ${v === ys[i] ? 'Täsmää.' : `Pitäisi tulla ${sg(ys[i])}: ei täsmää.`}`;
        }
      }
      return 'Kone muuttaa luvut. Mikä sääntö sopii kaikkiin pareihin?';
    },
  });
}

/** Two panels over the same clock. Left: a bucket fills k litres a minute and the table grows column by column
 *  (depends). Right: the weekday sign changes, but the boiling thermometer stays at 100 °C (does not depend). */
let depSeq = 0;
export function dependScene(k: number): AnimPaint {
  const W = 320, H = 236, M = 4, SPM = 1.6, T0 = 0.6, TE = T0 + M * SPM;
  const DAYS = ['ma', 'ti', 'ke', 'to', 'pe'], cid = `bk${++depSeq}`;
  return anim({
    dur: TE + 4.5, w: W, h: H, label: 'riippuuko suure toisesta',
    frame: (t) => {
      const m = Math.max(0, Math.min(M, (t - T0) / SPM)), mi = Math.floor(m + 1e-9);
      let o = `<line x1="${W / 2}" y1="8" x2="${W / 2}" y2="${H - 50}" stroke="currentColor" stroke-opacity=".2"/>`;
      o += `<text x="${W / 2}" y="${H - 34}" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor">aika: ${fmt(Math.round(m * 10) / 10)} min</text>`;
      // left: tap + bucket
      const lv = m / M, bx = 30, by = 40, bw = 56, bh = 70;
      o += `<rect x="${bx + 18}" y="14" width="40" height="8" rx="3" fill="#888"/><rect x="${bx + 50}" y="14" width="8" height="${t < TE ? 26 : 14}" fill="#888"/>`;
      if (t > T0 && t < TE) o += `<rect x="${bx + 52}" y="34" width="4" height="${by + bh - 34 - lv * bh}" fill="#4dabf7" opacity=".85"/>`;
      o += `<path d="M${bx} ${by} L${bx + 8} ${by + bh} L${bx + bw + 8 - 8} ${by + bh} L${bx + bw + 8} ${by}" fill="none" stroke="currentColor" stroke-width="2.5"/>`;
      o += `<clipPath id="${cid}"><path d="M${bx} ${by} L${bx + 8} ${by + bh} L${bx + bw} ${by + bh} L${bx + bw + 8} ${by}Z"/></clipPath><rect x="${bx}" y="${by + bh - lv * bh}" width="${bw + 8}" height="${lv * bh}" fill="#4dabf7" opacity=".7" clip-path="url(#${cid})"/>`;
      o += `<text x="${bx + bw / 2 + 4}" y="${by + bh + 18}" text-anchor="middle" font-size="13" font-weight="900" fill="#2b6cb0">${fmt(Math.round(k * m * 10) / 10)} l</text>`;
      // left table
      const tx = 8, ty = 150, cw = 28;
      o += `<text x="${tx}" y="${ty}" font-size="10" fill="currentColor">min</text><text x="${tx}" y="${ty + 20}" font-size="10" fill="currentColor">l</text>`;
      for (let i = 0; i <= mi; i++) {
        const op = i === 0 ? ease(t, T0 - 0.4, T0) : ease(t, T0 + i * SPM - 0.25, T0 + i * SPM + 0.15);
        o += `<g opacity="${op}"><text x="${tx + 30 + i * cw}" y="${ty}" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor">${i}</text><text x="${tx + 30 + i * cw}" y="${ty + 20}" text-anchor="middle" font-size="13" font-weight="900" fill="#2b6cb0">${k * i}</text></g>`;
        if (i > 0) o += `<text x="${tx + 16 + i * cw}" y="${ty + 34}" text-anchor="middle" font-size="9" fill="#e8913a" opacity="${op}">+${k}</text>`;
      }
      // right: weekday + pot + thermometer
      const day = DAYS[Math.min(DAYS.length - 1, mi)]!, rx = W / 2 + 14;
      o += `<rect x="${rx}" y="14" width="44" height="26" rx="5" fill="none" stroke="currentColor" stroke-opacity=".5"/><text x="${rx + 22}" y="32" text-anchor="middle" font-size="15" font-weight="900" fill="#e8913a">${day}</text>`;
      o += `<rect x="${rx}" y="70" width="70" height="44" rx="6" fill="#868e96"/><rect x="${rx - 8}" y="68" width="86" height="6" rx="3" fill="#495057"/>`;
      for (let j = 0; j < 4; j++) { const ph = (t * 1.7 + j * 0.27) % 1; o += `<circle cx="${rx + 12 + j * 15}" cy="${66 - ph * 26}" r="${2 + ph * 2}" fill="none" stroke="currentColor" stroke-opacity="${0.6 * (1 - ph)}"/>`; }
      const thx = W - 30;
      o += `<rect x="${thx - 5}" y="14" width="10" height="76" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="${thx - 3}" y="22" width="6" height="68" fill="#e03131"/><circle cx="${thx}" cy="94" r="8" fill="#e03131"/>`;
      o += `<text x="${thx - 6}" y="122" text-anchor="middle" font-size="13" font-weight="900" fill="#e03131">100 °C</text>`;
      o += `<text x="${rx - 8}" y="${ty}" font-size="10" fill="currentColor">päivä</text><text x="${rx - 8}" y="${ty + 20}" font-size="10" fill="currentColor">°C</text>`;
      for (let i = 0; i <= mi; i++) {
        const op = i === 0 ? ease(t, T0 - 0.4, T0) : ease(t, T0 + i * SPM - 0.25, T0 + i * SPM + 0.15);
        o += `<g opacity="${op}"><text x="${rx + 36 + i * 23}" y="${ty}" text-anchor="middle" font-size="11" font-weight="800" fill="#e8913a">${DAYS[i]}</text><text x="${rx + 36 + i * 23}" y="${ty + 20}" text-anchor="middle" font-size="10" font-weight="900" fill="#e03131">100</text></g>`;
      }
      const e = ease(t, TE + 0.3, TE + 0.9);
      if (e > 0) o += `<g opacity="${e}"><text x="${W / 4}" y="${H - 10}" text-anchor="middle" font-size="14" font-weight="900" fill="var(--ok, #2f9e44)">riippuu ajasta ✓</text><text x="${(3 * W) / 4}" y="${H - 10}" text-anchor="middle" font-size="14" font-weight="900" fill="#c0392b">ei riipu päivästä ✗</text></g>`;
      return o;
    },
    caption: (t) => {
      if (t < T0) return 'Sama kello käy molemmissa kuvissa. Seuraa, mikä muuttuu.';
      if (t < TE) { const mi = Math.floor((t - T0) / SPM); return `Minuutti ${mi + 1}: ämpäriin tulee ${k} l lisää. Päivä vaihtuu, mutta vesi kiehuu yhä 100 asteessa.`; }
      return 'Vesimäärä muuttuu, kun aika muuttuu: se riippuu ajasta. Kiehumislämpötila pysyy samana päivästä riippumatta.';
    },
  });
}

/** Function machine: input balls enter one by one, outputs leave and are logged in a table. One input comes
 *  twice. A working machine gives the same value again (✓ function); a broken one gives a new value (✗). */
export function funcMachineScene(a: number, b: number, xs: number[], broken = false): AnimPaint {
  const W = 320, H = 226, MY = 34, MX = 116, MW = 88, MH = 62, ST = 1.7, T0 = 0.6, TE = T0 + xs.length * ST;
  const seen = new Map<number, number>();
  const ys = xs.map((x, i) => { const f = a * x + b; if (broken && seen.has(x)) return f + 1; seen.set(x, i); return f; });
  const first = xs.map((x, i) => xs.indexOf(x) < i ? xs.indexOf(x) : -1);
  const sg = (v: number) => String(v).replace('-', '−');
  const rule = `· ${a}${b === 0 ? '' : b > 0 ? ` + ${b}` : ` − ${-b}`}`;
  const ball = (x: number, y: number, v: string, c: string) => `<circle cx="${x}" cy="${y}" r="14" fill="${c}"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="900" fill="#fff">${v}</text>`;
  return anim({
    dur: TE + 4, w: W, h: H, label: broken ? 'rikkinäinen kone' : 'funktiokone',
    frame: (t) => {
      const busy = t > T0 && t < TE && ((t - T0) % ST) > 0.5 && ((t - T0) % ST) < 0.9;
      const sh = busy ? Math.sin(t * 60) * 1.5 : 0;
      let o = `<rect x="${MX + sh}" y="${MY}" width="${MW}" height="${MH}" rx="10" fill="${broken ? '#7c4a03' : '#364fc7'}" opacity=".9"/><text x="${MX + MW / 2 + sh}" y="${MY + 26}" text-anchor="middle" font-size="12" fill="#fff">${broken ? 'kone ?' : 'kone'}</text><text x="${MX + MW / 2 + sh}" y="${MY + 46}" text-anchor="middle" font-size="16" font-weight="900" fill="#fff">${broken ? '???' : `x ${rule}`}</text>`;
      o += `<path d="M${MX + MW + 6} ${MY + MH / 2} h28 m-6 -5 l6 5 l-6 5" fill="none" stroke="currentColor" stroke-opacity=".4" stroke-width="2"/>`;
      // queue of waiting inputs
      xs.forEach((x, i) => {
        const s = T0 + i * ST, eIn = ease(t, s, s + 0.5), eOut = ease(t, s + 0.9, s + 1.3);
        if (t < s) { const q = i - Math.max(0, Math.floor((t - T0) / ST) + (t >= T0 ? 1 : 0)); if (q < 3) o += `<g opacity="${1 - q * 0.25}">${ball(86 - q * 29, MY + MH / 2, sg(x), '#e8913a')}</g>`; return; }
        if (eIn < 1) o += ball(86 + (MX + 20 - 86) * eIn, MY + MH / 2, sg(x), '#e8913a');
        if (eOut > 0 && eOut < 1) o += ball(MX + MW - 10 + (264 - (MX + MW - 10)) * eOut, MY + MH / 2, sg(ys[i]!), '#2b6cb0');
      });
      // table
      const ty = 160, cw = Math.min(42, 250 / xs.length), tx = 62;
      o += `<text x="${tx - 50}" y="${ty}" font-size="12" font-weight="800" fill="currentColor">syöte</text><text x="${tx - 50}" y="${ty + 26}" font-size="12" font-weight="800" fill="currentColor">arvo</text>`;
      xs.forEach((x, i) => {
        const s = T0 + i * ST, op = ease(t, s + 1.2, s + 1.5);
        if (op <= 0) return;
        const cx = tx + 14 + i * cw;
        o += `<g opacity="${op}"><text x="${cx}" y="${ty}" text-anchor="middle" font-size="15" font-weight="900" fill="#e8913a">${sg(x)}</text><text x="${cx}" y="${ty + 26}" text-anchor="middle" font-size="15" font-weight="900" fill="#2b6cb0">${sg(ys[i]!)}</text></g>`;
        const j = first[i]!;
        if (j >= 0) {
          const same = ys[j] === ys[i], c = same ? 'var(--ok, #2f9e44)' : '#c0392b', cj = tx + 14 + j * cw;
          o += `<g opacity="${op}"><rect x="${cj - 15}" y="${ty - 18}" width="30" height="50" rx="6" fill="none" stroke="${c}" stroke-width="2.5"/><rect x="${cx - 15}" y="${ty - 18}" width="30" height="50" rx="6" fill="none" stroke="${c}" stroke-width="2.5"/><path d="M${cj} ${ty + 34} q${(cx - cj) / 2} 16 ${cx - cj} 0" fill="none" stroke="${c}" stroke-width="2"/><text x="${(cj + cx) / 2}" y="${ty + 52}" text-anchor="middle" font-size="12" font-weight="900" fill="${c}">${same ? 'sama arvo ✓' : 'eri arvo ✗'}</text></g>`;
        }
      });
      const e = ease(t, TE + 0.2, TE + 0.7);
      if (e > 0) o += `<text x="${W / 2}" y="${MY + MH + 30}" text-anchor="middle" font-size="15" font-weight="900" fill="${broken ? '#c0392b' : 'var(--ok, #2f9e44)'}" opacity="${e}">${broken ? 'Ei funktio: yksi syöte, kaksi arvoa' : 'Funktio: jokaisella syötteellä yksi arvo'}</text>`;
      return o;
    },
    caption: (t) => {
      if (t < T0) return broken ? 'Tämä kone on oikukas. Seuraa, mitä se tekee samalle syötteelle.' : `Kone laskee x ${rule}. Syötteet menevät sisään yksi kerrallaan.`;
      if (t >= TE) return broken ? `Syöte ${sg(xs[first.findIndex((j) => j >= 0)]!)} antoi kaksi eri arvoa. Funktio ei saa tehdä niin.` : 'Sama syöte antoi saman arvon. Jokaisella syötteellä on täsmälleen yksi arvo.';
      const i = Math.min(xs.length - 1, Math.floor((t - T0) / ST)), x = xs[i]!;
      const rep = first[i]! >= 0 ? ' Tämä syöte on käynyt koneessa jo kerran!' : '';
      return broken ? `Syöte ${sg(x)} → ${sg(ys[i]!)}.${rep}` : `${sg(x)} ${rule} = ${sg(ys[i]!)}.${rep}`;
    },
  });
}

/** Value table built live: each x drops into the rule, the calculation appears and y fills its row. At the end
 *  the +k steps between rows and "x = 0 → b" light up, linking the table back to the rule y = kx + b. */
export function tableFillScene(k: number, b: number, xs = [0, 1, 2, 3, 4]): AnimPaint {
  const W = 320, H = 236, X0 = 40, X1 = 100, R0 = 56, RH = 30, ST = 1.5, T0 = 0.8, TE = T0 + xs.length * ST;
  const sg = (v: number) => String(v).replace('-', '−');
  const B = b === 0 ? '' : b > 0 ? ` + ${b}` : ` − ${-b}`;
  const ys = xs.map((x) => k * x + b);
  const consec = xs.every((x, i) => i === 0 || x === xs[i - 1]! + 1);
  return anim({
    dur: TE + 5, w: W, h: H, label: 'arvotaulukon täyttö',
    frame: (t) => {
      let o = `<rect x="${X0 - 26}" y="${R0 - 44}" width="${X1 - X0 + 54}" height="${xs.length * RH + 28}" rx="6" fill="none" stroke="currentColor" stroke-opacity=".3"/><line x1="${(X0 + X1) / 2}" y1="${R0 - 44}" x2="${(X0 + X1) / 2}" y2="${R0 - 16 + xs.length * RH}" stroke="currentColor" stroke-opacity=".3"/><line x1="${X0 - 26}" y1="${R0 - 20}" x2="${X1 + 28}" y2="${R0 - 20}" stroke="currentColor" stroke-opacity=".3"/>`;
      o += `<text x="${X0}" y="${R0 - 26}" text-anchor="middle" font-size="14" font-weight="900" fill="#e8913a">x</text><text x="${X1}" y="${R0 - 26}" text-anchor="middle" font-size="14" font-weight="900" fill="#2b6cb0">y</text>`;
      o += `<rect x="168" y="14" width="140" height="34" rx="8" fill="#364fc7"/><text x="238" y="37" text-anchor="middle" font-size="16" font-weight="900" fill="#fff">y = ${k}x${B}</text>`;
      xs.forEach((x, i) => {
        const s = T0 + i * ST, y = R0 + i * RH;
        o += `<text x="${X0}" y="${y}" text-anchor="middle" font-size="16" font-weight="900" fill="#e8913a" opacity="${ease(t, s - 0.4, s)}">${sg(x)}</text>`;
        if (t < s) return;
        const fly = ease(t, s, s + 0.45), back = ease(t, s + 0.9, s + 1.3);
        if (fly < 1) o += `<text x="${X0 + (220 - X0) * fly}" y="${y + (70 - y) * fly}" text-anchor="middle" font-size="15" font-weight="900" fill="#e8913a">${sg(x)}</text>`;
        if (fly >= 1 && back < 1) {
          const op = 1 - ease(t, s + 1.25, s + 1.4);
          o += `<text x="238" y="${78}" text-anchor="middle" font-size="15" font-weight="800" fill="currentColor" opacity="${op}">${k} · ${x < 0 ? `(${sg(x)})` : x}${B} = ${sg(ys[i]!)}</text>`;
          if (back > 0) o += `<text x="${238 + (X1 - 238) * back}" y="${86 + (y - 86) * back}" text-anchor="middle" font-size="16" font-weight="900" fill="#2b6cb0">${sg(ys[i]!)}</text>`;
        }
        if (back >= 1) o += `<text x="${X1}" y="${y}" text-anchor="middle" font-size="16" font-weight="900" fill="#2b6cb0">${sg(ys[i]!)}</text>`;
      });
      const e1 = ease(t, TE + 0.2, TE + 0.8), e2 = ease(t, TE + 1.8, TE + 2.4);
      if (e1 > 0 && consec) {
        for (let i = 1; i < xs.length; i++) {
          const y0 = R0 + (i - 1) * RH - 5, y1 = R0 + i * RH - 5;
          o += `<g opacity="${ease(t, TE + 0.2 + i * 0.15, TE + 0.5 + i * 0.15)}"><path d="M${X1 + 16} ${y0} q14 ${(y1 - y0) / 2} 0 ${y1 - y0}" fill="none" stroke="#e8913a" stroke-width="2"/><text x="${X1 + 34}" y="${(y0 + y1) / 2 + 4}" font-size="11" font-weight="900" fill="#e8913a">+${k}</text></g>`;
        }
        o += `<text x="238" y="${122}" text-anchor="middle" font-size="13" font-weight="800" fill="#e8913a" opacity="${e1}">y kasvaa ${k} joka rivillä</text><text x="238" y="${140}" text-anchor="middle" font-size="13" font-weight="800" fill="#e8913a" opacity="${e1}">→ kerroin ${k}</text>`;
      }
      const i0 = xs.indexOf(0);
      if (e2 > 0 && i0 >= 0) {
        o += `<rect x="${X0 - 22}" y="${R0 + i0 * RH - 20}" width="${X1 - X0 + 44}" height="26" rx="6" fill="none" stroke="var(--ok, #2f9e44)" stroke-width="2.5" opacity="${e2}"/>`;
        o += `<text x="238" y="${172}" text-anchor="middle" font-size="13" font-weight="800" fill="var(--ok, #2f9e44)" opacity="${e2}">kun x = 0, y = ${sg(b)}</text><text x="238" y="${190}" text-anchor="middle" font-size="13" font-weight="800" fill="var(--ok, #2f9e44)" opacity="${e2}">→ vakio ${sg(b)}</text>`;
      }
      return o;
    },
    caption: (t) => {
      if (t < T0) return `Sääntö y = ${k}x${B}. Lasketaan y jokaiselle x:lle vuorotellen.`;
      if (t < TE) { const i = Math.min(xs.length - 1, Math.floor((t - T0) / ST)); return `x = ${sg(xs[i]!)}: ${k} · ${xs[i]! < 0 ? `(${sg(xs[i]!)})` : xs[i]}${B} = ${sg(ys[i]!)}. Tulos kirjataan riville.`; }
      if (t < TE + 1.8) return consec ? `Kun x kasvaa yhdellä, y kasvaa aina ${k}. Se on säännön kerroin.` : 'Taulukko on valmis.';
      return `Kun x = 0, y = ${sg(b)}. Se on säännön vakio. Taulukosta näkee säännön.`;
    },
  });
}

/** Table → graph: for each x the table row lights up, a dot starts on the x-axis and climbs (or drops) to
 *  height y along a dashed guide, the pair (x, y) is written; at the end a line is drawn through the dots. */
export function graphPlotScene(k: number, b: number, xs: number[]): AnimPaint {
  const W = 320, H = 240, CX = 204, CY = 124, U = 21, R = 4, ST = 1.5, T0 = 0.8, TE = T0 + xs.length * ST;
  const sg = (v: number) => String(v).replace('-', '−');
  const ys = xs.map((x) => k * x + b);
  const B = b === 0 ? '' : b > 0 ? ` + ${b}` : ` − ${-b}`;
  const K = k === 1 ? '' : k === -1 ? '−' : sg(k);
  const px = (x: number) => CX + x * U, py = (y: number) => CY - y * U;
  return anim({
    dur: TE + 4, w: W, h: H, label: 'pisteet kuvaajaksi',
    frame: (t) => {
      let o = '';
      for (let i = -R; i <= R; i++) o += `<line x1="${px(i)}" y1="${py(R)}" x2="${px(i)}" y2="${py(-R)}" stroke="currentColor" stroke-opacity="${i ? 0.1 : 0.55}"/><line x1="${px(-R)}" y1="${py(i)}" x2="${px(R)}" y2="${py(i)}" stroke="currentColor" stroke-opacity="${i ? 0.1 : 0.55}"/>`;
      for (const i of [-4, -2, 2, 4]) o += `<text x="${px(i)}" y="${CY + 14}" text-anchor="middle" font-size="9" fill="currentColor" opacity=".6">${sg(i)}</text><text x="${CX - 6}" y="${py(i) + 3}" text-anchor="end" font-size="9" fill="currentColor" opacity=".6">${sg(i)}</text>`;
      o += `<text x="${px(R) + 4}" y="${CY - 6}" font-size="11" font-weight="800" fill="#e8913a">x</text><text x="${CX + 6}" y="${py(R) - 4}" font-size="11" font-weight="800" fill="#2b6cb0">y</text>`;
      o += `<text x="54" y="22" text-anchor="middle" font-size="13" font-weight="900" fill="currentColor">y = ${K}x${B}</text>`;
      o += `<text x="34" y="46" text-anchor="middle" font-size="13" font-weight="900" fill="#e8913a">x</text><text x="74" y="46" text-anchor="middle" font-size="13" font-weight="900" fill="#2b6cb0">y</text>`;
      // line at the end (under the dots)
      const eL = ease(t, TE + 0.2, TE + 1.4);
      if (eL > 0) {
        const xa = Math.max(-R, (R * (k > 0 ? -1 : 1) - b) / k), xb = Math.min(R, (R * (k > 0 ? 1 : -1) - b) / k);
        const lo = Math.min(xa, xb), hi = Math.max(xa, xb), xe = lo + (hi - lo) * eL;
        o += `<line x1="${px(lo)}" y1="${py(k * lo + b)}" x2="${px(xe)}" y2="${py(k * xe + b)}" stroke="var(--ok, #2f9e44)" stroke-width="3" stroke-linecap="round"/>`;
      }
      xs.forEach((x, i) => {
        const s = T0 + i * ST, ry = 70 + i * 26, y = ys[i]!;
        const on = t >= s && t < s + ST;
        if (on) o += `<rect x="12" y="${ry - 17}" width="84" height="24" rx="5" fill="#e8913a" fill-opacity=".18"/>`;
        o += `<text x="34" y="${ry}" text-anchor="middle" font-size="15" font-weight="900" fill="#e8913a">${sg(x)}</text>`;
        const eY = ease(t, s + 0.15, s + 0.4);
        if (eY > 0) o += `<text x="74" y="${ry}" text-anchor="middle" font-size="15" font-weight="900" fill="#2b6cb0" opacity="${eY}">${sg(y)}</text>`;
        if (t < s + 0.4) return;
        const eUp = ease(t, s + 0.45, s + 1.05), cy = py(y * eUp);
        o += `<line x1="${px(x)}" y1="${py(0)}" x2="${px(x)}" y2="${cy}" stroke="#2b6cb0" stroke-width="1.5" stroke-dasharray="3 3" opacity="${on ? 1 : 0.35}"/>`;
        if (eUp >= 1) o += `<line x1="${CX}" y1="${py(y)}" x2="${px(x)}" y2="${py(y)}" stroke="#2b6cb0" stroke-width="1.5" stroke-dasharray="3 3" opacity="${on ? 0.8 : 0}"/>`;
        o += `<circle cx="${px(x)}" cy="${cy}" r="5.5" fill="${eUp >= 1 ? '#2b6cb0' : '#e8913a'}" stroke="#fff" stroke-width="1.5"/>`;
        const eLab = ease(t, s + 1.05, s + 1.3);
        if (eLab > 0) o += `<text x="${px(x) + (x <= 0 ? -8 : 8)}" y="${py(y) + (k * (x <= 0 ? -1 : 1) > 0 ? 16 : -8)}" text-anchor="${x <= 0 ? 'end' : 'start'}" font-size="11" font-weight="800" fill="currentColor" opacity="${eLab * (on || t >= TE ? 1 : 0.55)}">(${sg(x)}, ${sg(y)})</text>`;
      });
      return o;
    },
    caption: (t) => {
      if (t < T0) return `Taulukon jokainen rivi on pari (x, y). Jokainen pari on yksi piste.`;
      if (t < TE) { const i = Math.min(xs.length - 1, Math.floor((t - T0) / ST)), x = xs[i]!, y = ys[i]!; return `x = ${sg(x)}: mennään x-akselilla kohtaan ${sg(x)}, sitten ${y > 0 ? `ylös ${y}` : y < 0 ? `alas ${-y}` : 'ei ylös eikä alas'}. Piste (${sg(x)}, ${sg(y)}).`; }
      return 'Pisteet ovat samalla suoralla. Suora on funktion kuvaaja: jokainen sen piste toteuttaa säännön.';
    },
  });
}

/** y = kx + b live: first b changes (k fixed) and the line slides up and down with its y-axis crossing; then
 *  k changes (b fixed) and the line turns around (0, b), with a step triangle "1 right, k up". */
export function kbScene(k0: number, bs: number[], ks: number[]): AnimPaint {
  const W = 320, H = 252, CX = 160, CY = 140, U = 20, R = 5, SEG = 1.6, T0 = 0.6;
  const T1 = T0 + bs.length * SEG, T2 = T1 + 0.8, TE = T2 + ks.length * SEG;
  const sg = (v: number) => String(v).replace('-', '−');
  const px = (x: number) => CX + x * U, py = (y: number) => CY - y * U;
  const lerpSeq = (seq: number[], t: number, start: number) => {
    let v = seq[0]!;
    for (let i = 1; i < seq.length; i++) { const e = ease(t, start + i * SEG - 0.7, start + i * SEG); v = v + (seq[i]! - v) * e; }
    return v;
  };
  const eqTxt = (k: number, b: number) => `y = ${k === 1 ? '' : k === -1 ? '−' : sg(k)}x${b === 0 ? '' : b > 0 ? ` + ${b}` : ` − ${-b}`}`;
  const cur = (t: number) => {
    if (t < T2) { const b = lerpSeq(bs, t, T0); return { k: k0, b, kt: k0, bt: bs[Math.min(bs.length - 1, Math.max(0, Math.round((t - T0) / SEG - 0.06)))]!, phase: 0 }; }
    const b = bs[bs.length - 1]!, k = lerpSeq([k0, ...ks], t, T2);
    return { k, b, kt: [k0, ...ks][Math.min(ks.length, Math.max(0, Math.round((t - T2) / SEG - 0.06)))]!, bt: b, phase: 1 };
  };
  return anim({
    dur: TE + 3, w: W, h: H, label: 'kerroin ja vakio',
    frame: (t) => {
      let o = '';
      for (let i = -R; i <= R; i++) o += `<line x1="${px(i)}" y1="${py(R)}" x2="${px(i)}" y2="${py(-R)}" stroke="currentColor" stroke-opacity="${i ? 0.1 : 0.55}"/><line x1="${px(-R)}" y1="${py(i)}" x2="${px(R)}" y2="${py(i)}" stroke="currentColor" stroke-opacity="${i ? 0.1 : 0.55}"/>`;
      for (const i of [-4, -2, 2, 4]) o += `<text x="${px(i)}" y="${CY + 13}" text-anchor="middle" font-size="9" fill="currentColor" opacity=".6">${sg(i)}</text><text x="${CX - 5}" y="${py(i) + 3}" text-anchor="end" font-size="9" fill="currentColor" opacity=".6">${sg(i)}</text>`;
      const { k, b, kt, bt, phase } = cur(t);
      // clip the line to the grid box
      const xs: number[] = [-R, R];
      if (Math.abs(k) > 1e-6) xs.push((R - b) / k, (-R - b) / k);
      const inside = xs.filter((x) => x >= -R - 1e-9 && x <= R + 1e-9 && Math.abs(k * x + b) <= R + 1e-9).sort((a, c) => a - c);
      if (inside.length >= 2) { const a = inside[0]!, c = inside[inside.length - 1]!; o += `<line x1="${px(a)}" y1="${py(k * a + b)}" x2="${px(c)}" y2="${py(k * c + b)}" stroke="#364fc7" stroke-width="3" stroke-linecap="round"/>`; }
      o += `<circle cx="${CX}" cy="${py(b)}" r="6" fill="var(--ok, #2f9e44)" stroke="#fff" stroke-width="1.5"/>`;
      if (phase === 0) o += `<text x="${CX - 10}" y="${py(b) - 8}" text-anchor="end" font-size="12" font-weight="900" fill="var(--ok, #2f9e44)">(0, ${sg(Math.round(b * 10) / 10)})</text>`;
      if (phase === 1 && Math.abs(k - kt) < 0.02) {
        const ty = k * 1 + b;
        o += `<path d="M${CX} ${py(b)} H${px(1)} V${py(ty)}" fill="none" stroke="#e8913a" stroke-width="2.5"/><text x="${(CX + px(1)) / 2}" y="${py(b) + (k > 0 ? 14 : -6)}" text-anchor="middle" font-size="11" font-weight="900" fill="#e8913a">1</text><text x="${px(1) + 5}" y="${(py(b) + py(ty)) / 2 + 4}" font-size="11" font-weight="900" fill="#e8913a">${k > 0 ? `${sg(kt)} ylös` : `${-kt} alas`}</text>`;
      }
      o += `<rect x="8" y="4" width="128" height="28" rx="7" fill="#364fc7"/><text x="72" y="23" text-anchor="middle" font-size="15" font-weight="900" fill="#fff">${eqTxt(kt, bt)}</text>`;
      o += `<text x="${W - 8}" y="22" text-anchor="end" font-size="13" font-weight="900" fill="${phase === 0 ? 'var(--ok, #2f9e44)' : '#e8913a'}">${phase === 0 ? `b = ${sg(bt)}` : `k = ${sg(kt)}`}</text>`;
      return o;
    },
    caption: (t) => {
      const { kt, bt, phase } = cur(t);
      if (t < T0) return `Suora ${eqTxt(k0, bs[0]!)}. Muutetaan ensin vain lukua b.`;
      if (phase === 0) return `b = ${sg(bt)}: suora siirtyy ${bt >= 0 ? 'ylös' : 'alas'} ja leikkaa y-akselin kohdassa ${sg(bt)}. Kaltevuus ei muutu.`;
      if (t >= TE) return 'b kertoo, missä suora leikkaa y-akselin. k kertoo, paljonko suora nousee tai laskee yhtä askelta kohti.';
      return `k = ${sg(kt)}: yksi askel oikealle, ${kt > 0 ? `${kt} ylös – suora nousee` : `${-kt} alas – suora laskee`}${Math.abs(kt) >= 3 ? ' jyrkästi' : ''}.`;
    },
  });
}

/** Slope from two points: the line appears, a step triangle grows (Δx counted along, then Δy counted up or down),
 *  then the triangle is cut into Δx unit steps, each "1 right, k up", and k = Δy / Δx is written. */
export function slopeScene(x1: number, y1: number, x2: number, y2: number): AnimPaint {
  const W = 320, H = 252, dx = x2 - x1, dy = y2 - y1, k = dy / dx;
  const xa = Math.min(0, x1) - 1, xb = Math.max(0, x2) + 1, ya = Math.min(0, y1, y2) - 1, yb = Math.max(0, y1, y2) + 1;
  const U = Math.min(250 / (xb - xa), 170 / (yb - ya)), OX = 40 + (250 - U * (xb - xa)) / 2, OY = 52;
  const px = (x: number) => OX + (x - xa) * U, py = (y: number) => OY + (yb - y) * U;
  const sg = (v: number) => String(Math.round(v * 100) / 100).replace('-', '−').replace('.', ',');
  const T1 = 1.0, TA = 1.4, TB = TA + 0.45 * dx + 0.4, TC = TB + 0.3 * Math.abs(dy) + 0.6, TD = TC + 0.6 * dx + 0.6;
  return anim({
    dur: TD + 4, w: W, h: H, label: 'kulmakerroin portaista',
    frame: (t) => {
      let o = '';
      for (let x = xa; x <= xb; x++) o += `<line x1="${px(x)}" y1="${py(ya)}" x2="${px(x)}" y2="${py(yb)}" stroke="currentColor" stroke-opacity="${x ? 0.1 : 0.55}"/>`;
      for (let y = ya; y <= yb; y++) o += `<line x1="${px(xa)}" y1="${py(y)}" x2="${px(xb)}" y2="${py(y)}" stroke="currentColor" stroke-opacity="${y ? 0.1 : 0.55}"/>`;
      const eL = ease(t, 0.4, T1);
      if (eL > 0) {
        const yy = (x: number) => y1 + k * (x - x1), ca = x1 + (ya - y1) / k, cb = x1 + (yb - y1) / k;
        const l0 = Math.max(xa, Math.min(ca, cb)), lhi = Math.min(xb, Math.max(ca, cb)), l1 = l0 + (lhi - l0) * eL;
        o += `<line x1="${px(l0)}" y1="${py(yy(l0))}" x2="${px(l1)}" y2="${py(yy(l1))}" stroke="#364fc7" stroke-width="2.5" stroke-opacity=".75"/>`;
      }
      // Δx leg
      const ex = ease(t, TA, TA + 0.45 * dx);
      if (ex > 0) {
        o += `<line x1="${px(x1)}" y1="${py(y1)}" x2="${px(x1 + dx * ex)}" y2="${py(y1)}" stroke="#e8913a" stroke-width="3.5"/>`;
        o += `<text x="${(px(x1) + px(x1 + dx * ex)) / 2}" y="${py(y1) + (dy > 0 ? 16 : -8)}" text-anchor="middle" font-size="12" font-weight="900" fill="#e8913a">Δx = ${Math.round(dx * ex)}</text>`;
      }
      const ey = ease(t, TB, TB + 0.3 * Math.abs(dy));
      if (ey > 0) {
        o += `<line x1="${px(x2)}" y1="${py(y1)}" x2="${px(x2)}" y2="${py(y1 + dy * ey)}" stroke="var(--ok, #2f9e44)" stroke-width="3.5"/>`;
        o += `<text x="${px(x2) + 6}" y="${(py(y1) + py(y1 + dy * ey)) / 2 + 4}" font-size="12" font-weight="900" fill="var(--ok, #2f9e44)">Δy = ${sg(Math.round(dy * ey))}</text>`;
      }
      // unit stairs
      const es = ease(t, TC, TC + 0.6 * dx);
      if (es > 0) {
        const n = Math.ceil(es * dx - 1e-9);
        for (let i = 0; i < n; i++) {
          const ax = x1 + i, ay = y1 + k * i, op = ease(t, TC + 0.6 * i, TC + 0.6 * i + 0.35);
          o += `<path d="M${px(ax)} ${py(ay)} H${px(ax + 1)} V${py(ay + k)}" fill="none" stroke="#c2255c" stroke-width="2" stroke-dasharray="4 2" opacity="${op}"/><text x="${px(ax + 1) + 3}" y="${(py(ay) + py(ay + k)) / 2 + 4}" font-size="10" font-weight="900" fill="#c2255c" opacity="${op}">${sg(k)}</text>`;
        }
      }
      for (const [x, y] of [[x1, y1], [x2, y2]] as [number, number][]) {
        o += `<circle cx="${px(x)}" cy="${py(y)}" r="5.5" fill="#2b6cb0" stroke="#fff" stroke-width="1.5" opacity="${ease(t, 0, 0.4)}"/><text x="${px(x) - 7}" y="${py(y) - 7}" text-anchor="end" font-size="11" font-weight="800" fill="currentColor" opacity="${ease(t, 0, 0.4)}">(${sg(x)}, ${sg(y)})</text>`;
      }
      const eF = ease(t, TD, TD + 0.5);
      o += `<text x="${W / 2}" y="24" text-anchor="middle" font-size="15" font-weight="900" fill="currentColor" opacity="${eF}">k = Δy / Δx = ${sg(dy)} / ${dx} = ${sg(k)}</text>`;
      return o;
    },
    caption: (t) => {
      if (t < TA) return `Suora kulkee pisteiden (${sg(x1)}, ${sg(y1)}) ja (${sg(x2)}, ${sg(y2)}) kautta.`;
      if (t < TB) return `Kuljetaan vaakasuoraan: x kasvaa ${x1} → ${x2}, eli Δx = ${dx}.`;
      if (t < TC) return `Sitten ${dy >= 0 ? 'ylös' : 'alas'}: y muuttuu ${sg(y1)} → ${sg(y2)}, eli Δy = ${sg(dy)}.`;
      if (t < TD) return `Jaetaan porras ${dx} yhtä suureen askeleeseen: jokainen askel on 1 oikealle ja ${sg(Math.abs(k))} ${k >= 0 ? 'ylös' : 'alas'}.`;
      return `Kulmakerroin kertoo muutoksen yhtä x-askelta kohti: k = ${sg(dy)} / ${dx} = ${sg(k)}.`;
    },
  });
}
