// Measuring tools in use: where a ruler really starts, why a scale must read zero first, and which
// tool measures which quantity. Each mistake is shown happening, then corrected.
import { anim, ease, type AnimPaint } from '../ui/anim';
import { dialBody } from './measureanim';
import { thermoInner } from './pics';

/** A stick of `len` cm. First laid against the ruler's edge (which sits `gap` cm before 0) and misread;
 *  then slid so its end sits on 0 and read correctly. */
export function zeroScene(len: number, gap = 1): AnimPaint {
  const W = 320, H = 170, N = 12, X0 = 14 + gap * 22, U = 22, X = (v: number) => X0 + v * U, Y = 70;
  const T1 = 1.0, T2 = 3.4, T3 = 5.0, T4 = 7.0;
  return anim({
    dur: T4 + 3.5, w: W, h: H, label: `Viivotin: ${len} cm`,
    frame: (t) => {
      let s = `<rect x="8" y="${Y}" width="${X(N) + 8 - 8}" height="40" rx="5" fill="color-mix(in srgb, var(--sun) 50%, var(--card))" stroke="currentColor" stroke-width="2"/>`;
      for (let v = 0; v <= N; v++) s += `<line x1="${X(v)}" y1="${Y}" x2="${X(v)}" y2="${Y + (v % 5 === 0 ? 18 : 12)}" stroke="currentColor" stroke-width="1.8"/><text x="${X(v)}" y="${Y + 34}" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">${v}</text>`;
      // Stick start: ruler edge (x=8) first, then slides to 0.
      const start = t < T3 ? 8 : 8 + (X(0) - 8) * ease(t, T3, T3 + 1.2), end = start + len * U, wrong = t >= T1 && t < T3;
      s += `<rect x="${start}" y="${Y - 18}" width="${len * U}" height="14" rx="6" fill="#8a5a33" opacity="${ease(t, 0, 0.6)}"/>`;
      if (t >= T1) {
        const read = t < T3 ? (end - X0) / U : len;
        s += `<line x1="${end}" y1="${Y - 26}" x2="${end}" y2="${Y}" stroke="${wrong ? '#c0392b' : 'var(--pond)'}" stroke-width="2" stroke-dasharray="3 3"/>`;
        if (t < T3 || t >= T3 + 1.2) s += `<text x="${end}" y="${Y - 32}" text-anchor="middle" font-size="16" font-weight="900" fill="${wrong ? '#c0392b' : 'var(--pond)'}">${t < T3 ? `${Math.round(read * 10) / 10} cm?` : `${len} cm ✓`}</text>`;
      }
      if (t >= T1 + 0.8 && t < T3) {
        s += `<path d="M8 ${Y + 46} H${X(0)}" stroke="#c0392b" stroke-width="3"/><text x="${(8 + X(0)) / 2 + 30}" y="${Y + 64}" text-anchor="start" font-size="12" font-weight="800" fill="#c0392b">tyhjä reuna ennen nollaa</text>`;
      }
      if (t >= T2 && t < T3) s += `<text x="${W / 2}" y="18" text-anchor="middle" font-size="14" font-weight="800" fill="#c0392b">Keppi ei ala nollasta ✗</text>`;
      if (t >= T4) s += `<text x="${W / 2}" y="18" text-anchor="middle" font-size="14" font-weight="800" fill="var(--pond)">Pää nollaan, lue toinen pää ✓</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T1) return 'Mitataan keppi viivottimella.';
      if (t < T2) return 'Keppi on laitettu viivottimen reunaan. Toinen pää näyttää lukua, mutta onko se oikein?';
      if (t < T3) return `Viivottimen reunassa on tyhjä kohta ennen nollaa. Lukema on liian ${gap > 0 ? 'pieni' : 'suuri'}!`;
      if (t < T4) return 'Siirretään kepin pää nollan kohdalle.';
      return `Nyt toinen pää näyttää ${len}. Keppi on ${len} cm pitkä.`;
    },
  });
}

/** Kitchen scale that shows `off` g when empty: a stone of `g` grams reads too much; zero the scale, weigh again. */
export function tareScene(g: number, off: number): AnimPaint {
  const W = 300, H = 252, cx = W / 2, T1 = 1.4, T3 = 5.0, T4 = 6.2, T5 = 8.2;
  const stone = (y: number) => `<ellipse cx="${cx}" cy="${y - 14}" rx="30" ry="18" fill="#8d8f93" stroke="currentColor" stroke-width="2"/><ellipse cx="${cx - 8}" cy="${y - 20}" rx="8" ry="4" fill="#fff" opacity=".25"/>`;
  return anim({
    dur: T5 + 3.5, w: W, h: H, label: `Vaaka nollaan: ${g} g`,
    frame: (t) => {
      const zero = t < T3 ? off : off * (1 - ease(t, T3, T3 + 0.8));
      const on1 = t >= T1 && t < T3 ? ease(t, T1, T1 + 0.5) * (1 - ease(t, T3 - 0.6, T3 - 0.1)) : 0, on2 = t >= T4 ? ease(t, T4, T4 + 0.5) : 0, on = Math.max(on1, on2);
      const needle = zero + g * ease(t, (t < T3 ? T1 : T4) + 0.3, (t < T3 ? T1 : T4) + 1.2) * (on > 0.5 ? 1 : 0);
      let s = on > 0 ? `<g opacity="${on}" transform="translate(0 ${-(1 - on) * 50})">${stone(132)}</g>` : '';
      s += dialBody(needle, 1000, W);
      if (t >= T3 - 0.2 && t < T4) s += `<circle cx="${cx - 90}" cy="194" r="12" fill="#7c8a96" stroke="currentColor" stroke-width="2"/><path d="M${cx - 96} 194 h12" stroke="#fff" stroke-width="3" transform="rotate(${ease(t, T3, T3 + 0.8) * -270} ${cx - 90} 194)"/><text x="${cx - 90}" y="222" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor">nollaus</text>`;
      if (t < T1) s += `<text x="${cx}" y="22" text-anchor="middle" font-size="15" font-weight="800" fill="#c0392b">Tyhjä vaaka: ${off} g?</text>`;
      if (t >= T1 + 1.2 && t < T3) s += `<text x="${cx}" y="22" text-anchor="middle" font-size="15" font-weight="800" fill="#c0392b">${g + off} g ✗ (${off} g liikaa)</text>`;
      if (t >= T4 + 1.2) s += `<text x="${cx}" y="22" text-anchor="middle" font-size="16" font-weight="900" fill="var(--pond)">${g} g ✓</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T1) return `Tyhjä vaaka näyttää ${off} grammaa, vaikka sillä ei ole mitään.`;
      if (t < T3) return `Kivi vaa'alle: ${g + off} g. Mukana on ne ${off} g, jotka vaaka näytti jo tyhjänä.`;
      if (t < T4) return 'Otetaan kivi pois ja nollataan vaaka: osoitin nollaan.';
      return `Uusi punnitus: ${g} g. Tämä on kiven oikea massa.`;
    },
  });
}

/** Questions are paired with tools one by one: a line is drawn from each thing to the tool that measures it. */
export function matchToolScene(pairs: [string, string, string][]): AnimPaint {
  const W = 320, n = pairs.length, H = 40 + n * 44, ST = 1.6, T0 = 0.8;
  const order = pairs.map((_, j) => (j + Math.ceil(n / 2)) % n);
  return anim({
    dur: T0 + n * ST + 3, w: W, h: H, label: 'Mittausvälineet',
    frame: (t) => {
      let s = '';
      pairs.forEach(([thing], i) => { s += `<rect x="6" y="${24 + i * 44}" width="118" height="34" rx="8" fill="var(--card)" stroke="currentColor" stroke-opacity=".4"/><text x="65" y="${(ease(t, T0 + i * ST + 0.9, T0 + i * ST + 1.2) > 0 ? 40 : 46) + i * 44}" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor">${thing}</text>`; });
      order.forEach((k, j) => { const [, tool] = pairs[k]!; s += `<rect x="196" y="${24 + j * 44}" width="118" height="34" rx="8" fill="var(--card)" stroke="currentColor" stroke-opacity=".4"/><text x="255" y="${46 + j * 44}" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor">${tool}</text>`; });
      pairs.forEach((p, i) => {
        const p0 = ease(t, T0 + i * ST, T0 + i * ST + 0.9); if (p0 <= 0) return;
        const j = order.indexOf(i), y1 = 41 + i * 44, y2 = 41 + j * 44, x2 = 124 + (196 - 124) * p0, y = y1 + (y2 - y1) * p0;
        s += `<line x1="124" y1="${y1}" x2="${x2}" y2="${y}" stroke="var(--pond)" stroke-width="3" stroke-linecap="round"/>`;
        if (p0 >= 1) s += `<text x="65" y="${54 + i * 44}" text-anchor="middle" font-size="10" font-weight="800" fill="var(--pond)">${p[2]}</text>`;
      });
      s += `<text x="65" y="16" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor" opacity=".7">mitä mitataan</text><text x="255" y="16" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor" opacity=".7">väline</text>`;
      return s;
    },
    caption: (t) => {
      const i = Math.min(n - 1, Math.floor((t - T0) / ST));
      if (t < T0) return 'Jokaisella välineellä on oma tehtävänsä. Yhdistetään.';
      const [thing, tool, q] = pairs[i]!;
      return `${thing}: ${q} → ${tool}.`;
    },
  });
}

/** Same thing, different units: awkward numbers are tried first (✗), then the unit that gives a handy number (✓). */
export function unitFitScene(rows: [string, [string, string][], string][]): AnimPaint {
  const W = 320, n = rows.length, RH = 62, H = 20 + n * RH, ST = 3.2, T0 = 0.6;
  return anim({
    dur: T0 + n * ST + 2.5, w: W, h: H, label: 'Sopiva yksikkö',
    frame: (t) => {
      let s = '';
      rows.forEach(([thing, tries], i) => {
        const y = 12 + i * RH, t0 = T0 + i * ST, on = ease(t, t0 - 0.4, t0);
        s += `<g opacity="${0.35 + 0.65 * on}"><rect x="4" y="${y}" width="132" height="${RH - 10}" rx="10" fill="var(--card)" stroke="currentColor" stroke-opacity=".4"/><text x="70" y="${y + 31}" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor">${thing}</text></g>`;
        const k = Math.floor((t - t0) / (ST / tries.length));
        if (t < t0) return;
        const step = Math.min(tries.length - 1, k), [val, why] = tries[step]!, ok = step === tries.length - 1;
        const pop = ease(t, t0 + step * (ST / tries.length), t0 + step * (ST / tries.length) + 0.3);
        s += `<rect x="144" y="${y}" width="170" height="${RH - 10}" rx="10" fill="${ok ? 'color-mix(in srgb, var(--pond) 18%, var(--card))' : 'color-mix(in srgb, #c0392b 12%, var(--card))'}" stroke="${ok ? 'var(--pond)' : '#c0392b'}" stroke-width="2"/>`;
        s += `<text x="229" y="${y + 26}" text-anchor="middle" font-size="${16 + 2 * pop}" font-weight="900" fill="${ok ? 'var(--pond)' : '#c0392b'}">${val} ${ok ? '✓' : '✗'}</text><text x="229" y="${y + 44}" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" opacity=".8">${why}</text>`;
      });
      return s;
    },
    caption: (t) => {
      const i = Math.max(0, Math.min(n - 1, Math.floor((t - T0) / ST)));
      if (t < T0) return 'Sama asia voidaan kertoa monella yksiköllä. Mikä on kätevin?';
      return `${rows[i]![0]}: ${rows[i]![2]}`;
    },
  });
}

/** A stone of `v` cm is measured three times; one reading (`odd`) does not match the stone's end. Measure again. */
export function repeatScene(v: number, odd: number): AnimPaint {
  const W = 320, H = 220, N = 30, U = 9.6, X = (c: number) => 16 + c * U, Y = 64, M = 1.8, T0 = 0.6, TF = T0 + 3 * M, TR = TF + 1.4;
  const reads = [v, odd, v];
  return anim({
    dur: TR + M + 3, w: W, h: H, label: `Toistomittaus: ${v} cm`,
    frame: (t) => {
      let s = `<rect x="8" y="${Y}" width="${X(N) - 8 + 8}" height="30" rx="4" fill="color-mix(in srgb, var(--sun) 50%, var(--card))" stroke="currentColor" stroke-width="2"/>`;
      for (let c = 0; c <= N; c++) s += `<line x1="${X(c)}" y1="${Y}" x2="${X(c)}" y2="${Y + (c % 5 === 0 ? 14 : 8)}" stroke="currentColor" stroke-width="1.4"/>` + (c % 5 === 0 ? `<text x="${X(c)}" y="${Y + 26}" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor">${c}</text>` : '');
      s += `<rect x="${X(0)}" y="${Y - 26}" width="${v * U}" height="22" rx="10" fill="#8d8f93" stroke="currentColor" stroke-width="1.5"/>`;
      const cur = t < TF ? Math.floor((t - T0) / M) : t >= TR ? 3 : -1;
      if (cur >= 0) {
        const val = cur === 3 ? v : reads[cur]!, p = ease(t, (cur === 3 ? TR : T0 + cur * M), (cur === 3 ? TR : T0 + cur * M) + 0.7), bad = val !== v;
        const x = X(0) + (X(val) - X(0)) * p;
        s += `<path d="M${x} ${Y - 30} l-6 -10 h12z" fill="${bad && p >= 1 ? '#c0392b' : 'var(--pond)'}"/><line x1="${x}" y1="${Y - 30}" x2="${x}" y2="${Y + 14}" stroke="${bad && p >= 1 ? '#c0392b' : 'var(--pond)'}" stroke-width="2" stroke-dasharray="3 3"/>`;
        if (p >= 1 && bad) s += `<text x="${Math.min(x, W - 60)}" y="${Y - 46}" text-anchor="middle" font-size="12" font-weight="800" fill="#c0392b">ei kiven päässä!</text>`;
      }
      // Results table.
      const ty = 130, cw = 70;
      ['1.', '2.', '3.', 'uusi'].forEach((h, i) => {
        const x = 20 + i * cw + cw / 2, shown = i < 3 ? t >= T0 + i * M + 0.8 : t >= TR + 0.8, val = i < 3 ? reads[i]! : v;
        const bad = i === 1 && t >= TF, gone = i === 1 && t >= TR + 0.8;
        s += `<text x="${x}" y="${ty}" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor" opacity=".7">${h}</text><rect x="${x - 28}" y="${ty + 8}" width="56" height="34" rx="8" fill="var(--card)" stroke="${bad ? '#c0392b' : i === 3 && shown ? 'var(--pond)' : 'currentColor'}" stroke-opacity="${bad || (i === 3 && shown) ? 1 : 0.4}" stroke-width="${bad ? 3 : 1.5}"/>`;
        if (shown) s += `<text x="${x}" y="${ty + 31}" text-anchor="middle" font-size="16" font-weight="900" fill="${bad ? '#c0392b' : i === 3 ? 'var(--pond)' : 'currentColor'}" opacity="${gone ? 0.45 : 1}" ${gone ? 'text-decoration="line-through"' : ''}>${val}</text>`;
        if (gone) s += `<line x1="${x - 18}" y1="${ty + 25}" x2="${x + 18}" y2="${ty + 25}" stroke="#c0392b" stroke-width="2"/>`;
      });
      if (t >= TF && t < TR) s += `<text x="${W / 2}" y="${ty + 66}" text-anchor="middle" font-size="13" font-weight="800" fill="#c0392b">${odd} poikkeaa muista → mitataan uudelleen</text>`;
      if (t >= TR + 0.8) s += `<text x="${W / 2}" y="${ty + 66}" text-anchor="middle" font-size="13" font-weight="800" fill="var(--pond)">Uusi mittaus: ${v} cm ✓ Kivi on ${v} cm.</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T0 + M) return `Ensimmäinen mittaus: ${v} cm.`;
      if (t < T0 + 2 * M) return `Toinen mittaus: ${odd} cm. Osoitin ei ole kiven päässä.`;
      if (t < TF) return `Kolmas mittaus: taas ${v} cm.`;
      if (t < TR) return `${odd} poikkeaa paljon muista. Se on luultavasti virhe.`;
      return `Mitataan uudelleen: ${v} cm. Poikkeava lukema jätetään pois.`;
    },
  });
}

/** Reading a thermometer whose labels are only every 5 degrees: count small steps up from the label below. */
export function readScaleScene(v: number): AnimPaint {
  const W = 300, H = 230, min = 0, max = 20, base = Math.floor(v / 5) * 5, T1 = 1.2, T2 = 2.6, ST = 0.6;
  const py = (x: number) => 170 - ((x - min) / (max - min)) * 154 + 8;
  return anim({
    dur: T2 + (v - base) * ST + 3, w: W, h: H, label: `Lämpömittari: ${v} astetta`,
    frame: (t) => {
      let s = `<g transform="translate(40 8)">${thermoInner(v, min, max)}</g>`;
      if (t >= T1) s += `<rect x="102" y="${py(base) - 10}" width="34" height="20" rx="6" fill="none" stroke="var(--blue)" stroke-width="2.5" opacity="${ease(t, T1, T1 + 0.4)}"/>`;
      const k = Math.max(0, Math.min(v - base, Math.floor((t - T2) / ST) + 1));
      if (t >= T2) for (let i = 1; i <= k; i++) s += `<path d="M${152} ${py(base + i - 1)} q14 ${(py(base + i) - py(base + i - 1)) / 2} 0 ${py(base + i) - py(base + i - 1)}" fill="none" stroke="var(--pond)" stroke-width="2"/>`;
      if (t >= T2 && k > 0) s += `<text x="172" y="${py(base + k) + 4}" font-size="13" font-weight="900" fill="var(--pond)">+${k}</text>`;
      if (t >= T2 + (v - base) * ST + 0.4) s += `<text x="244" y="${py(v) + 6}" text-anchor="middle" font-size="18" font-weight="900" fill="var(--pond)">${v} °C ✓</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T1) return 'Numerot on vain joka viidennellä viivalla. Pienet viivat ovat yhden asteen välein.';
      if (t < T2) return `Etsi lähin numero punaisen pään alapuolelta: ${base}.`;
      return `Laske pienet välit ylöspäin: ${base} + ${v - base} = ${v} astetta.`;
    },
  });
}
