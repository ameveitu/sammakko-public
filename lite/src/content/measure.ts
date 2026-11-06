// Comparing, measuring and time (grades 1–2).
import type { Rng } from '../engine/rng';
import type { NodeSpec, Option } from '../engine/types';
import { svg } from '../ui/art';
import { word } from './fi';
import { cases, choose, fixed, near, num, paint, spoken, txt, unitsArt } from './kit';
import { AUDIT_REV, LAUNCH_REV } from './audit-rev';
import { burnScene, candleScene, clapScene, hopSwimScene } from './timeanim';
import { anim, ease, type AnimPaint } from '../ui/anim';
import { layScene, twoUnitScene } from './measureanim';

const RED: Option = { art: svg(60, 20, '<rect width="60" height="20" rx="6" fill="var(--red)"/>'), text: 'Punainen', speak: 'Punainen' };
const BLUE: Option = { art: svg(60, 20, '<rect width="60" height="20" rx="6" fill="var(--blue)"/>'), text: 'Sininen', speak: 'Sininen' };
const SAME = (t: string): Option => ({ text: t, speak: t, art: svg(60, 30, '<rect width="60" height="12" rx="4" fill="var(--red)"/><rect y="17" width="60" height="12" rx="4" fill="var(--blue)"/>') });

// A counting alternative describes each supplied unit without giving the resulting number.
const measurementNumberArt = (n: number) => unitsArt(n).replace('aria-hidden="true"',
  `aria-label="Nauhan alla samankokoiset palat alusta loppuun: ${Array(n).fill('mittapala').join(', ')}."`);

// ---- shapes for "same and different"
const SHAPES = ['ympyrä', 'neliö', 'kolmio'] as const;
const COLORS = { punainen: '#e0533f', sininen: '#3b7fd6', keltainen: '#f4c542' } as const;
type Col = keyof typeof COLORS;
interface Shape { s: (typeof SHAPES)[number]; c: Col; big: boolean }
function shapeBody(x: Shape, cx = 40, cy = 40) {
  const r = x.big ? 34 : 20, c = COLORS[x.c];
  return x.s === 'ympyrä' ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"/>`
    : x.s === 'neliö' ? `<rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" rx="4" fill="${c}"/>`
      : `<polygon points="${cx},${cy - r} ${cx + r},${cy + r * 0.8} ${cx - r},${cy + r * 0.8}" fill="${c}"/>`;
}
const shapeArt = (x: Shape) => svg(80, 80, shapeBody(x), shapeName(x));
const SIZE_WORD = (x: Shape) => (x.big ? 'iso' : 'pieni');
const shapeName = (x: Shape) => `${SIZE_WORD(x)} ${x.c} ${x.s}`;
/** A shape option: picture plus a spoken name for the listen button. */
const shapeOpt = (x: Shape): Option => ({ art: shapeArt(x), speak: shapeName(x) });
const PL = { ympyrä: 'ympyröitä', neliö: 'neliöitä', kolmio: 'kolmioita', punainen: 'punaisia', sininen: 'sinisiä', keltainen: 'keltaisia' } as const;
/** "both are …" for an attribute two shapes share. */
const bothSame = (x: Shape, a: 's' | 'c' | 'big') =>
  a === 's' ? `Muoto on sama: molemmat ovat ${PL[x.s]}.` : a === 'c' ? `Väri on sama: molemmat ovat ${PL[x.c]}.` : `Koko on sama: molemmat ovat ${x.big ? 'isoja' : 'pieniä'}.`;

/** Worked comparison in time: two shapes, then shape, colour and size are checked one at a time. */
function compareScene(a: Shape, b: Shape): AnimPaint {
  const rows = (['s', 'c', 'big'] as const).map((k) => ({ k, same: a[k] === b[k] }));
  const at = (i: number) => 1.2 + i * 1.6;
  const verdict = rows.every((x) => x.same) ? 'Kaikki on samaa: kuviot ovat samanlaiset.' : `${cap(ATTR_NAME[rows.find((x) => !x.same)!.k])} on eri: kuviot ovat erilaiset.`;
  return anim({
    dur: at(3) + 1.2, w: 300, h: 200, label: 'Kaksi kuviota verrataan: muoto, väri ja koko',
    frame: (t) => {
      const cur = rows.findIndex((_, i) => t < at(i + 1));
      const look = cur < 0 ? -1 : cur;
      let s = shapeBody(a, 70, 52) + shapeBody(b, 230, 52);
      if (look >= 0 && t >= at(0) - 0.6) s += `<text x="150" y="62" text-anchor="middle" font-size="28">🔍</text>`;
      rows.forEach((x, i) => {
        const y = 118 + i * 28;
        const shown = t >= at(i);
        const hl = i === look && t >= at(i) - 0.6;
        s += `<rect x="40" y="${y - 19}" width="220" height="25" rx="7" fill="${hl ? 'rgba(244,197,66,.25)' : 'none'}"/>`;
        s += `<text x="56" y="${y}" font-size="16" font-weight="700" fill="currentColor">${cap(ATTR_NAME[x.k])}</text>`;
        if (shown) s += `<text x="176" y="${y}" font-size="16" font-weight="800" fill="${x.same ? '#2a9d55' : '#d9534f'}">${x.same ? '✓ sama' : '✗ eri'}</text>`;
      });
      return s;
    },
    caption: (t) => {
      const i = [0, 1, 2].filter((j) => t >= at(j)).pop();
      if (t >= at(3)) return verdict;
      if (i === undefined) return 'Katsotaan kuvioita yksi asia kerrallaan.';
      const x = rows[i]!;
      return `${cap(ATTR_NAME[x.k])}: ${x.same ? 'sama' : 'eri'}.`;
    },
  });
}
function vary(r: Rng, x: Shape, attr: 's' | 'c' | 'big'): Shape {
  if (attr === 's') return { ...x, s: r.pick(SHAPES.filter((s) => s !== x.s)) };
  if (attr === 'c') return { ...x, c: r.pick((Object.keys(COLORS) as Col[]).filter((c) => c !== x.c)) };
  return { ...x, big: !x.big };
}
const randShape = (r: Rng): Shape => ({ s: r.pick(SHAPES), c: r.pick(Object.keys(COLORS) as Col[]), big: r.chance(0.5) });
const ATTR_NAME = { s: 'muoto', c: 'väri', big: 'koko' } as const;
const cap = (w: string) => w[0]!.toUpperCase() + w.slice(1);

// ---- towers on steps (height comparison)
function towersArt(a: number, b: number, baseA: number, baseB: number) {
  const U = 18, H = 230;
  const tower = (x: number, n: number, base: number, col: string) =>
    `<rect x="${x - 10}" y="${H - base * U}" width="80" height="${base * U}" fill="#b9a27a"/>` +
    Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${H - (base + i + 1) * U}" width="60" height="${U - 2}" rx="3" fill="${col}"/>`).join('');
  return svg(260, H, tower(30, a, baseA, 'var(--red)') + tower(160, b, baseB, 'var(--blue)'));
}


// ---- direct comparison in time: ribbons slide to a common start, a balance tips
/** Two ribbons start at different places; one slides to the start line, then the longer end glows. */
function alignScene(lens: [number, number], offs: [number, number]): AnimPaint {
  const U = 20, X0 = 10, cols = ['var(--red)', 'var(--blue)'];
  const longer = lens[0] > lens[1] ? 0 : lens[1] > lens[0] ? 1 : -1;
  return anim({
    dur: 6, w: 300, h: 130, label: 'Nauhojen alkupäät siirretään samaan kohtaan',
    frame: (t) => {
      const k = ease(t, 1.5, 3.5);
      let s = `<line x1="${X0}" y1="4" x2="${X0}" y2="112" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" opacity="${0.3 + 0.7 * ease(t, 0.5, 1.2)}"/>`;
      lens.forEach((l, i) => {
        const x = X0 + offs[i] * U * (1 - k), y = 14 + i * 50;
        const glow = t >= 4 && i === longer;
        s += `<rect x="${x}" y="${y}" width="${l * U}" height="28" rx="7" fill="${cols[i]}" ${glow ? 'stroke="#f4c542" stroke-width="4"' : ''}/>`;
        if (glow) s += `<text x="${x + l * U + 6}" y="${y + 21}" font-size="18" font-weight="800" fill="#f4c542">◀</text>`;
      });
      return s + `<text x="${X0 + 2}" y="126" font-size="12" fill="currentColor">alkuviiva</text>`;
    },
    caption: (t) => t < 1.5 ? 'Alkupäät ovat eri kohdissa. Ei voi vielä tietää.'
      : t < 3.6 ? 'Siirretään alkupäät samaan kohtaan…'
        : longer < 0 ? 'Loppupäät ovat kohdakkain: yhtä pitkät.' : `Nyt näkyy: ${longer === 0 ? 'punainen' : 'sininen'} on pidempi.`,
  });
}

interface Thing { e: string; nom: string; big: number }
const LIGHT: Thing[] = [{ e: '🎈', nom: 'ilmapallo', big: 46 }, { e: '🪶', nom: 'sulka', big: 44 }, { e: '🧸', nom: 'nalle', big: 44 }];
const HEAVY: Thing[] = [{ e: '🪨', nom: 'kivi', big: 26 }, { e: '📕', nom: 'kirja', big: 28 }, { e: '🍉', nom: 'meloni', big: 30 }];
/** A balance that starts level and tips toward the heavier side (tip -1 = left down, 0 = level). */
function balanceScene(L: Thing, R: Thing, tip: -1 | 0 | 1, sizes: [number, number]): AnimPaint {
  const P = { x: 150, y: 58 }, A = 100;
  return anim({
    dur: 4, w: 300, h: 170, label: `Vaaka: vasemmalla ${L.nom}, oikealla ${R.nom}`,
    frame: (t) => {
      const th = -tip * 0.2 * ease(t, 1, 2.6);
      const pan = (sd: -1 | 1, o: Thing, size: number) => {
        const e = { x: P.x + sd * A * Math.cos(th), y: P.y + -sd * A * Math.sin(th) };
        const py = e.y + 52;
        return `<line x1="${e.x}" y1="${e.y}" x2="${e.x - 26}" y2="${py}" stroke="currentColor" stroke-width="1.5"/><line x1="${e.x}" y1="${e.y}" x2="${e.x + 26}" y2="${py}" stroke="currentColor" stroke-width="1.5"/>` +
          `<path d="M${e.x - 34} ${py} Q${e.x} ${py + 16} ${e.x + 34} ${py}Z" fill="#b9a27a"/>` +
          `<text x="${e.x}" y="${py - 4}" text-anchor="middle" font-size="${size}">${o.e}</text>`;
      };
      return `<polygon points="${P.x},${P.y} ${P.x - 22},158 ${P.x + 22},158" fill="#8a7a5c"/><rect x="${P.x - 50}" y="156" width="100" height="8" rx="3" fill="#8a7a5c"/>` +
        `<line x1="${P.x - A * Math.cos(th)}" y1="${P.y + A * Math.sin(th)}" x2="${P.x + A * Math.cos(th)}" y2="${P.y - A * Math.sin(th)}" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>` +
        pan(-1, L, sizes[0]) + pan(1, R, sizes[1]) + `<circle cx="${P.x}" cy="${P.y}" r="5" fill="currentColor"/>`;
    },
    caption: (t) => t < 1 ? 'Laitetaan esineet vaakaan…' : t < 2.7 ? 'Vaaka liikkuu…' : tip === 0 ? 'Vaaka on suorassa.' : `Vaaka laski ${tip < 0 ? 'vasemmalle' : 'oikealle'}.`,
  });
}
const thingOpt = (o: Thing): Option => ({ art: svg(60, 50, `<text x="30" y="40" text-anchor="middle" font-size="36">${o.e}</text>`), text: cap(o.nom), speak: cap(o.nom) });

// ---- length is kept: a ribbon is a chain of equal pieces, so bending never changes its length
/** Points of a chain that starts at (x, y), pieces d long, each turned by its angle. */
function chain(x: number, y: number, d: number, angles: number[]) {
  const pts = [[x, y]];
  let a = 0;
  for (const t of angles) { a = t; x += d * Math.cos(a); y += d * Math.sin(a); pts.push([x, y]); }
  return pts;
}
const polyD = (pts: number[][]) => 'M' + pts.map(([x, y]) => `${x!.toFixed(1)} ${y!.toFixed(1)}`).join(' L');
const wave = (n: number, k: number) => Array.from({ length: n }, (_, i) => k * 1.1 * Math.cos((i + 0.5) / n * 2 * Math.PI * 2.5));

/** A straight ribbon bends into waves (and straightens back when `back`). A faint copy shows the ends. */
function bendScene(back = true): AnimPaint {
  const N = 40, d = 6.5, L = N * d, X = (300 - L) / 2;
  const dur = back ? 8 : 4.5;
  return anim({
    dur, w: 300, h: 140, label: 'Nauha taipuu mutkalle' + (back ? ' ja oikenee takaisin' : ''),
    frame: (t) => {
      const k = ease(t, 1, 3) - (back ? ease(t, 4.8, 6.6) : 0);
      const pts = chain(0, 0, d, wave(N, k));
      const w = pts[N]![0]!, off = (300 - w) / 2;
      const ghost = `<path d="M${X} 22 H${X + L}" stroke="var(--red)" stroke-width="10" stroke-linecap="round" opacity=".3"/>` +
        `<line x1="${X}" y1="10" x2="${X}" y2="130" stroke="currentColor" stroke-dasharray="3 4" opacity=".5"/><line x1="${X + L}" y1="10" x2="${X + L}" y2="130" stroke="currentColor" stroke-dasharray="3 4" opacity=".5"/>`;
      return ghost + `<path d="${polyD(pts.map(([x, y]) => [x! + off, y! + 88]))}" stroke="var(--red)" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    },
    caption: (t) => t < 1 ? 'Suora nauha. Haalea nauha ylhäällä näyttää pituuden.'
      : t < 3.2 ? 'Taivutetaan nauha mutkalle…'
        : !back ? 'Nauha on mutkalla. Päät ovat nyt lähempänä toisiaan.'
          : t < 4.8 ? 'Päät ovat lähempänä toisiaan. Mutta onko nauha lyhyempi?'
            : t < 6.7 ? 'Oikaistaan nauha…' : 'Päät osuvat taas viivoille: pituus ei muuttunut.',
  });
}

/** Two paths between the same flowers; then both are pulled straight to compare their lengths. */
function pathScene(): AnimPaint {
  const N = 8, d = 30, th = 0.75;
  const zigLen = N * d, straight = zigLen * Math.cos(th);
  const X = 20;
  return anim({
    dur: 7, w: 300, h: 150, label: 'Mutkapolku ja suora polku oikaistaan rinnakkain',
    frame: (t) => {
      const k = 1 - ease(t, 2.5, 4.5);
      const zig = chain(X, 50, d, Array.from({ length: N }, (_, i) => (i % 2 ? -th : th) * k));
      const flowers = t < 2.5 ? `<text x="${X}" y="26" text-anchor="middle" font-size="20">🌼</text><text x="${X + straight}" y="26" text-anchor="middle" font-size="20">🌼</text>` : '';
      const glow = t >= 4.6;
      return flowers +
        `<path d="${polyD(zig.map(([x, y]) => [x!, y! + (1 - k) * 45]))}" stroke="var(--red)" stroke-width="8" fill="none" stroke-linejoin="round" stroke-linecap="round" ${glow ? 'filter="drop-shadow(0 0 4px #f4c542)"' : ''}/>` +
        `<path d="M${X} 125 H${X + straight}" stroke="var(--blue)" stroke-width="8" stroke-linecap="round"/>` +
        (glow ? `<line x1="${X + straight}" y1="70" x2="${X + straight}" y2="140" stroke="currentColor" stroke-dasharray="3 4"/><text x="${X + (straight + zigLen) / 2}" y="80" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">lisämatka</text>` : '');
    },
    caption: (t) => t < 2.5 ? 'Kaksi polkua kukasta kukkaan. Päät ovat yhtä kaukana.' : t < 4.6 ? 'Oikaistaan punainen polku suoraksi…' : 'Oikaistuna punainen ulottuu pidemmälle: mutkapolku on pidempi.',
  });
}

/** A ribbon is cut in two and the right half slides under the left half. */
function cutScene(): AnimPaint {
  return anim({
    dur: 4.5, w: 300, h: 90, label: 'Nauha leikataan kahtia ja osat laitetaan päällekkäin',
    frame: (t) => {
      const k = ease(t, 1.6, 3.4);
      const cut = t >= 1;
      const rx = 150 - 140 * k, ry = 22 + 34 * k;
      return (cut ? `<path d="M10 22 H${cut ? 146 : 290}" stroke="var(--blue)" stroke-width="14" stroke-linecap="round"/><path d="M${rx + 4} ${ry} H${rx + 140}" stroke="var(--blue)" stroke-width="14" stroke-linecap="round"/>`
        : `<path d="M10 22 H290" stroke="var(--blue)" stroke-width="14" stroke-linecap="round"/>`) +
        (t > 0.6 && t < 1.6 ? `<text x="150" y="16" text-anchor="middle" font-size="22">✂️</text>` : '');
    },
    caption: (t) => t < 1 ? 'Yksi pitkä nauha.' : t < 1.6 ? 'Leikataan keskeltä…' : t < 3.4 ? 'Toinen puolikas siirtyy alle…' : 'Nyt nauhat ovat päällekkäin.',
  });
}

/** Same ribbon with small pieces on one row and big pieces on the other (static). */
function twoUnitArt(small: number, f: number) {
  const U = Math.min(26, 250 / small), X = 8, big = small / f;
  let s = `<rect x="${X}" y="6" width="${small * U}" height="22" rx="6" fill="var(--blue)"/>`;
  for (let k = 0; k < small; k++) s += `<rect x="${X + k * U + 2}" y="36" width="${U - 4}" height="16" rx="4" fill="var(--sun)" stroke="#7a6a3a"/>`;
  for (let k = 0; k < big; k++) s += `<rect x="${X + k * U * f + 2}" y="62" width="${U * f - 4}" height="16" rx="4" fill="#f29a52" stroke="#7a6a3a"/>`;
  s += `<text x="${X + small * U + 6}" y="49" font-size="12" font-weight="700" fill="currentColor">Aava</text><text x="${X + small * U + 6}" y="75" font-size="12" font-weight="700" fill="currentColor">Loikka</text>`;
  return svg(small * U + 60, 84, s);
}

/** Two candles lit at sa and sb that burn a and b seconds; which burned longer? */
function candles(a: number, b: number, sa: number, sb: number) {
  const same = 'Kynttilät sammuivat yhtä aikaa ja lyhenivät yhtä paljon.';
  return {
    say: 'Kynttilät syttyvät yhtä aikaa. Kumpi palaa kauemmin?',
    scene: candleScene([{ on: 1 + sa, len: a, color: '#e0533f' }, { on: 1 + sb, len: b, color: '#3b7fd6' }]),
    task: fixed([RED, BLUE, SAME('Yhtä kauan')], a > b ? 0 : b > a ? 1 : 2, a === b ? [same, same]
      : [a > b ? undefined : 'Punainen sammui ensin.', b > a ? undefined : 'Sininen sammui ensin.', 'Toinen sammui ensin: ne eivät palaneet yhtä kauan.']),
    hint: 'Kumpi sammui ensin? Kumpi lyheni enemmän?',
    explain: a === b ? 'Kynttilät sammuivat yhtä aikaa: ne paloivat yhtä kauan.' : `${a > b ? 'Sininen' : 'Punainen'} sammui ensin. ${a > b ? 'Punainen' : 'Sininen'} paloi kauemmin.`,
  };
}
const secs = (n: number) => (n === 1 ? 'yksi sekunti' : `${word(n)} sekuntia`);


export const MEASURE_NODES: NodeSpec[] = [
  {
    id: 'M-TH-01', rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV], stop: 'Sama ja eri', icon: '🔺',
    intro: 'Aava järjestää retkiviirejä. Mitkä ovat samanlaisia, mikä on erilainen?',
    reward: 'Huomaat pienetkin erot!',
    demo: () => [
      { say: 'Verrataan yksi asia kerrallaan: muoto, väri, koko. Kaikki on samaa, joten kuviot ovat samanlaiset.', scene: compareScene({ s: 'kolmio', c: 'sininen', big: true }, { s: 'kolmio', c: 'sininen', big: true }) },
      { say: 'Muoto on sama ja koko on sama, mutta väri on eri. Yksi ero riittää: kuviot ovat erilaiset.', scene: compareScene({ s: 'kolmio', c: 'sininen', big: true }, { s: 'kolmio', c: 'punainen', big: true }) },
      { say: 'Tässä ero on koossa. Muoto ja väri ovat samat.', scene: compareScene({ s: 'ympyrä', c: 'keltainen', big: true }, { s: 'ympyrä', c: 'keltainen', big: false }) },
    ],
    item: cases({
      same: (r) => {
        const m = randShape(r);
        const [a1, a2] = r.shuffle(['s', 'c', 'big'] as const);
        return {
          say: 'Etsi samanlainen kuin tämä.', scene: paint(shapeArt(m)),
          task: choose(r, shapeOpt(m), [shapeOpt(vary(r, m, a1!)), shapeOpt(vary(r, m, a2!))], [`Tässä ${ATTR_NAME[a1!]} on eri.`, `Tässä ${ATTR_NAME[a2!]} on eri.`]),
          hint: 'Tarkista muoto, väri ja koko.',
          explain: 'Samanlaisessa on sama muoto, sama väri ja sama koko.',
        };
      },
      odd: (r) => {
        const m = randShape(r);
        const a = r.pick(['s', 'c', 'big'] as const);
        const same = `Tämä on samanlainen kuin kaksi muuta. Etsi se, jossa ${ATTR_NAME[a]} on eri.`;
        return {
          say: 'Mikä näistä on erilainen kuin muut?',
          task: choose(r, shapeOpt(vary(r, m, a)), [shapeOpt(m), shapeOpt(m), shapeOpt(m)], [same, same, same], 4),
          hint: 'Kolme on keskenään samanlaisia. Katso muotoa, väriä ja kokoa.',
          explain: `Erilaisessa ${ATTR_NAME[a]} on eri.`,
        };
      },
      which: (r) => {
        const m = randShape(r);
        const a = r.pick(['s', 'c', 'big'] as const);
        const o = vary(r, m, a);
        const opts = (['s', 'c', 'big'] as const).map((k) => txt(cap(ATTR_NAME[k])));
        const idx = (['s', 'c', 'big'] as const).indexOf(a);
        return {
          say: 'Mikä näissä kahdessa on eri?', scene: paint(svg(180, 80, shapeBody(m, 45, 40) + shapeBody(o, 135, 40), `${shapeName(m)} ja ${shapeName(o)}`)),
          task: fixed(opts, idx, (['s', 'c', 'big'] as const).map((k) => (k === a ? undefined : bothSame(m, k)))),
          hint: 'Katso ensin muotoa, sitten väriä, sitten kokoa.',
          explain: `${cap(ATTR_NAME[a])} on eri: ${shapeName(m)} ja ${shapeName(o)}.`,
        };
      },
    }, (r) => {
      const m = randShape(r);
      const goal = vary(r, m, 's');
      const wc = vary(r, m, 'c');
      return {
        say: 'Etsi se, jolla on sama väri, mutta eri muoto.',
        scene: paint(shapeArt(m)),
        task: choose(r, shapeOpt(goal), [shapeOpt(wc), shapeOpt(m)], ['Tässä väri on eri. Värin pitää olla sama.', 'Tässä muoto on sama. Muodon pitää olla eri.']),
        hint: 'Kaksi ehtoa: väri sama, muoto eri.',
        explain: 'Oikealla on sama väri, mutta muoto on eri.',
      };
    }),
  },
  {
    id: 'M-MEAS-00', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Kumpi pidempi', icon: '🎀',
    intro: 'Aava rakentaa viiriä. Kumpi nauha on pidempi?',
    reward: 'Nauhat on verrattu. Viiri valmistuu!',
    demo: () => [
      { say: 'Punainen ulottuu pidemmälle, mutta se alkaa myöhemmin. Siirretään alkupäät samaan kohtaan: nyt näkyy, että sininen on pidempi.', scene: alignScene([6, 7], [4, 0]) },
      { say: 'Nämä näyttävät erilaisilta, mutta kun alkupäät ovat samassa kohdassa, loppupäät ovat kohdakkain. Nauhat ovat yhtä pitkät.', scene: alignScene([5, 5], [0, 4]) },
      { say: 'Painoa verrataan vaa’alla. Ilmapallo on isompi, mutta kivi painaa vaa’an alas. Kivi on painavampi.', scene: balanceScene(LIGHT[0]!, HEAVY[0]!, 1, [46, 26]) },
    ],
    item: cases({
      aligned: (r) => { const a = r.int(3, 10); let b = r.int(3, 10); if (b === a) b = a > 5 ? a - 2 : a + 2; return rib(r, a, b, 0, 0); },
      tricky: (r) => {
        const long = r.int(6, 9), short = long - r.int(1, 3);
        const redLong = r.chance(0.5);
        // the shorter ribbon starts further right so its end sticks out
        return redLong ? rib(r, long, short, 0, 14 - short - r.int(0, 1)) : rib(r, short, long, 14 - short - r.int(0, 1), 0);
      },
      equal: (r) => { const a = r.int(4, 9); return rib(r, a, a, r.int(0, 14 - a), r.int(0, 14 - a)); },
      heavy: (r) => {
        const i = r.int(0, 2), even = r.chance(0.2);
        const light = LIGHT[i]!, heavy = HEAVY[r.int(0, 2)]!;
        const [L, R] = even ? [heavy, heavy] : r.chance(0.5) ? [light, heavy] : [heavy, light];
        const tip: -1 | 0 | 1 = even ? 0 : L === heavy ? -1 : 1;
        const side = (o: Thing, w: string) => (even ? { ...thingOpt(o), text: `${w} ${o.nom}`, speak: `${w} ${o.nom}` } : thingOpt(o));
        const opts = [side(L, 'Vasen'), side(R, 'Oikea'), { ...SAME('Yhtä painavat'), art: svg(60, 30, '<line x1="4" y1="15" x2="56" y2="15" stroke="currentColor" stroke-width="4"/>') }];
        const ans = tip === 0 ? 2 : tip < 0 ? 0 : 1;
        const sz = (o: Thing) => (even ? 30 : o.big);
        const whyBig = (o: Thing) => o.big > 40 ? `${cap(o.nom)} on isompi, mutta sen puoli nousi ylös. Iso ei aina ole painava.` : `${cap(o.nom)} nousi ylös. Painavampi puoli laskee alas.`;
        const why = tip === 0 ? ['Vaaka jäi suoraan: kumpikaan ei ole painavampi.', 'Vaaka jäi suoraan: kumpikaan ei ole painavampi.', undefined]
          : [ans === 0 ? undefined : whyBig(L), ans === 1 ? undefined : whyBig(R), 'Vaaka ei ole suorassa: toinen puoli laski alas.'];
        return {
          say: 'Kumpi on painavampi? Katso, kumpi puoli laskee alas.',
          scene: balanceScene(L, R, tip, [sz(L), sz(R)]),
          task: fixed(opts, ans, why),
          hint: 'Painavampi puoli painuu alas.',
          explain: tip === 0 ? 'Vaaka on suorassa: molemmat puolet ovat yhtä painavat.' : `Vaaka laski ${tip < 0 ? 'vasemmalle' : 'oikealle'}: ${heavy.nom} on painavampi.`,
        };
      },
    }, (r) => {
      const a = r.int(3, 7), b = r.chance(0.3) ? a : a + r.pick([-2, -1, 1, 2]);
      const baseA = a > b ? 0 : 3, baseB = a > b ? 3 : 0;
      return {
        say: 'Kumpi torni on korkeampi? Tornit seisovat eri korkeilla jalustoilla.',
        scene: paint(towersArt(a, b, a === b ? r.pick([0, 3]) : baseA, a === b ? 1 : baseB)),
        task: fixed([RED, BLUE, SAME('Yhtä korkeat')], a > b ? 0 : b > a ? 1 : 2, [
          a > b ? undefined : `Punaisessa on ${a} palikkaa, sinisessä ${b}. Jalusta ei kuulu torniin.`,
          b > a ? undefined : `Sinisessä on ${b} palikkaa, punaisessa ${a}. Jalusta ei kuulu torniin.`,
          a === b ? undefined : 'Huiput voivat olla eri korkeudella jalustan takia. Laske palikat jalustan yläpuolelta.',
        ]),
        hint: 'Laske vain palikat, älä jalustaa.',
        explain: `Lasketaan palikat jalustan yläpuolelta: punaisessa ${a}, sinisessä ${b}.`,
      };
    }),
  },
  {
    id: 'M-MEAS-02', stop: 'Nauhan pituus', icon: '〰️',
    intro: 'Pituus on nauhan ominaisuus. Muuttuuko se, jos nauhaa taivuttaa?',
    reward: 'Tiedät, mitä pituus tarkoittaa!',
    demo: () => [
      { say: 'Katso nauhaa. Se taipuu mutkalle ja oikenee taas. Päät osuvat samoihin kohtiin: pituus ei muuttunut.', scene: bendScene() },
      { say: 'Polku voi mutkitella. Kun mutkapolku oikaistaan suoran viereen, näkyy, että se on pidempi.', scene: pathScene() },
      { say: 'Leveys ei ole pituutta. Leveä punainen on lyhyempi kuin ohut sininen.', scene: paint(svg(300, 110, '<rect x="10" y="6" width="150" height="46" rx="8" fill="var(--red)"/><rect x="10" y="80" width="270" height="12" rx="6" fill="var(--blue)"/>')) },
    ],
    item: cases({
      bend: () => ({
        say: 'Aava taivutti suoran nauhan mutkalle. Onko nauha nyt pidempi, lyhyempi vai yhtä pitkä kuin ennen?',
        scene: bendScene(false),
        hint: 'Lisättiinkö nauhaa tai leikattiinko siitä pois?',
        task: fixed([{ text: 'Pidempi', speak: 'Pidempi' }, { text: 'Lyhyempi', speak: 'Lyhyempi' }, { text: 'Yhtä pitkä', speak: 'Yhtä pitkä' }], 2, ['Nauhaa ei lisätty.', 'Nauhaa ei leikattu. Mutka ei lyhennä nauhaa.']),
        explain: 'Nauha on sama. Taivuttaminen ei muuta pituutta.',
      }),
      thick: (r) => {
        const redThick = r.chance(0.5);
        const thick = (y: number, c: string) => `<rect x="10" y="${y}" width="150" height="46" rx="8" fill="${c}"/>`;
        const thin = (y: number, c: string) => `<rect x="10" y="${y + 16}" width="270" height="12" rx="6" fill="${c}"/>`;
        return {
          say: 'Kumpi on pidempi?',
          scene: paint(svg(300, 120, (redThick ? thick(6, 'var(--red)') + thin(64, 'var(--blue)') : thin(6, 'var(--red)') + thick(64, 'var(--blue)')))),
          task: fixed([RED, BLUE], redThick ? 1 : 0, redThick ? ['Punainen on leveämpi, mutta ei pidempi.'] : [undefined, 'Sininen on leveämpi, mutta ei pidempi.']),
          hint: 'Katso, kuinka pitkälle nauha ulottuu, ei kuinka leveä se on.',
          explain: 'Pituus mitataan päästä päähän. Leveys on eri asia.',
        };
      },
      path: (r) => {
        const redWiggly = r.chance(0.5);
        const straight = (y: number, c: string) => `<path d="M30 ${y} H270" stroke="${c}" stroke-width="8" stroke-linecap="round"/>`;
        const zig = (y: number, c: string) => `<path d="M30 ${y} l30 -22 l30 44 l30 -44 l30 44 l30 -44 l30 44 l30 -44 l30 22" stroke="${c}" stroke-width="8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
        return {
          say: 'Molemmat polut menevät kukasta kukkaan. Kumpaa polkua pitkin matka on pidempi?',
          scene: paint(svg(300, 170, (redWiggly ? zig(45, 'var(--red)') + straight(130, 'var(--blue)') : straight(40, 'var(--red)') + zig(125, 'var(--blue)')))),
          task: fixed([RED, BLUE], redWiggly ? 0 : 1, redWiggly ? [undefined, 'Suora polku on lyhin tie. Mutkat lisäävät matkaa.'] : ['Suora polku on lyhin tie. Mutkat lisäävät matkaa.']),
          hint: 'Kuvittele, että polku oikaistaan suoraksi.',
          explain: 'Mutkitteleva polku on pidempi, vaikka päät ovat yhtä kaukana.',
        };
      },
    }, () => ({
      say: 'Loikka leikkasi nauhansa kahteen osaan ja laittoi osat päällekkäin. Onko Loikalla nyt enemmän, vähemmän vai yhtä paljon nauhaa?',
      scene: cutScene(),
      task: fixed([{ text: 'Enemmän', speak: 'Enemmän' }, { text: 'Vähemmän', speak: 'Vähemmän' }, { text: 'Yhtä paljon', speak: 'Yhtä paljon' }], 2, ['Nauhaa ei tullut lisää: kaksi palaa on yhä sama nauha.', 'Mitään ei heitetty pois. Palat yhteen laitettuina ovat koko nauha.']),
      hint: 'Jos palat laittaisi taas peräkkäin, kuinka pitkä nauha olisi?',
      explain: 'Kaksi osaa yhteensä on yhtä pitkä kuin koko nauha.',
    })),
  },
  {
    id: 'M-MEAS-01', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Klemmarimittari', icon: '📎',
    intro: 'Loikka ja Aava mittaavat nauhoja keltaisilla paloilla.',
    reward: 'Mittaat kuin oikea mittari!',
    demo: () => [
      { say: 'Palat laitetaan nauhan alle peräkkäin, alkupäästä alkaen, ilman rakoja. Yksi, kaksi, kolme, neljä, viisi. Nauha on viisi palaa pitkä.', scene: layScene(5) },
      { say: 'Tässä jäi rako. Paloja on neljä, mutta nauha on pidempi: rakoon mahtuisi vielä yksi pala.', scene: layScene(4, 1) },
    ],
    item: cases({
      count: (r) => {
        const n = r.int(3, 8);
        const wr = near(r, n, 2, 1, 10);
        return {
          say: 'Kuinka monta palaa pitkä nauha on?', scene: paint(unitsArt(n)),
          task: choose(r, spoken(n), wr.map(spoken), wr.map((m) => (m < n ? 'Liian vähän: osa paloista jäi laskematta.' : 'Liian monta: jokin pala tuli laskettua kahdesti.'))),
          hint: 'Osoita jokaista palaa vuorollaan ja laske.',
          explain: `Paloja on ${word(n)}, joten nauha on ${word(n)} palaa pitkä.`,
        };
      },
      lay: (r) => {
        const n = r.int(3, 8);
        return { say: 'Mittaa nauha paloilla.', task: { kind: 'iterate' as const, len: n }, hint: 'Aloita nauhan alusta. Lopeta, kun palat yltävät nauhan loppuun.', explain: `Nauha on ${word(n)} palaa pitkä.` };
      },
      judge: (r) => {
        const n = r.int(4, 6);
        const bad = r.shuffle([
          { art: unitsArt(n - 1, { gapAt: 1, len: n }), why: 'Palojen välissä on rako. Rakoon mahtuisi vielä pala.' },
          { art: unitsArt(n + 1, { overlapAt: 2, len: n }), why: 'Kaksi palaa menee päällekkäin. Silloin paloja tulee liikaa.' },
          { art: unitsArt(n - 1, { mixed: true, len: n }), why: 'Palat ovat eri kokoisia. Mittaamiseen tarvitaan samankokoiset palat.' },
        ]).slice(0, 2);
        return {
          say: 'Kuka mittasi oikein?',
          task: choose(r, { art: unitsArt(n) }, bad.map((x) => ({ art: x.art })), bad.map((x) => x.why), 1),
          hint: 'Katso rakoja, päällekkäisyyksiä ja palojen kokoa.',
          explain: 'Oikein mitatessa palat ovat samankokoisia, peräkkäin, ilman rakoja ja päällekkäisyyksiä.',
        };
      },
    }, (r) => {
      const a = r.int(3, 6), b = a + r.pick([-2, -1, 1, 2]);
      const U = 22;
      const rowArt = (n: number, x0: number, y: number, c: string) => `<rect x="${x0}" y="${y}" width="${n * U}" height="22" rx="6" fill="${c}"/>` + Array.from({ length: n }, (_, i) => `<rect x="${x0 + i * U + 2}" y="${y + 26}" width="${U - 4}" height="10" rx="3" fill="var(--sun)"/>`).join('');
      return {
        say: 'Nauhat ovat eri kohdissa. Mittaa paloilla: kumpi on pidempi?',
        scene: paint(svg(300, 110, rowArt(a, 150 - a * 6, 8, 'var(--red)') + rowArt(b, 10, 60, 'var(--blue)'))),
        task: fixed([RED, BLUE], a > b ? 0 : 1, a > b ? [undefined, `Sinisen alla on vain ${word(b)} palaa, punaisen alla ${word(a)}.`] : [`Punaisen alla on vain ${word(a)} palaa, sinisen alla ${word(b)}.`]),
        hint: 'Nauhan paikka ei ratkaise. Laske kummankin palat.',
        explain: `Punaisen alla on ${word(a)} palaa, sinisen alla ${word(b)}.`,
      };
    }),
  },
  {
    id: 'M-NUM-14', rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV], stop: 'Mittausluku', icon: '📏',
    intro: 'Kun mittaat, luku kertoo, kuinka monta palaa pitkä esine on.',
    reward: 'Osaat kertoa mittauksen luvulla!',
    demo: () => [
      { say: 'Ladotaan palat ja lasketaan: yksi, kaksi, kolme, neljä, viisi, kuusi. Nauha on kuusi palaa pitkä. Kirjoitetaan: 6 palaa.', scene: layScene(6) },
      { say: 'Luku kertoo, montako palaa tarvittiin. Isoja paloja tarvitaan vähemmän: sama nauha on 6 pientä tai 3 isoa palaa.', scene: twoUnitScene(6, 2) },
    ],
    item: cases({
      read: (r) => {
        const n = r.int(2, 9), wr = near(r, n, 2, 1, 10);
        return {
          say: 'Mikä luku kertoo nauhan pituuden paloina?', scene: paint(measurementNumberArt(n)),
          task: choose(r, num(n), wr.map(num), wr.map((m) => (m < n ? `${m} on liian vähän: osa paloista jäi laskematta.` : `${m} on liian monta: jokin pala tuli laskettua kahdesti.`))),
          hint: 'Laske palat nauhan alta.',
          explain: `Paloja on ${n}. Nauha on ${n} palaa pitkä.`,
        };
      },
      make: (r) => {
        const n = r.int(3, 8), wr = near(r, n, 2, 2, 9);
        return {
          say: `Missä nauha on ${word(n)} palaa pitkä?`,
          task: choose(r, { art: measurementNumberArt(n) }, wr.map((m) => ({ art: measurementNumberArt(m) })), wr.map((m) => `Tässä nauhassa on ${word(m)} palaa.`), 1),
          hint: 'Laske jokaisen nauhan palat.',
          explain: `Oikean nauhan alla on ${n} palaa.`,
        };
      },
      unit: (r) => {
        const small = r.pick([4, 6, 8]), big = small / 2;
        return {
          say: `Aava mittasi nauhan pienillä paloilla: ${word(small)} palaa. Loikka mittasi saman nauhan isoilla paloilla: ${word(big)} palaa. Kumman mittaama nauha on pidempi?`,
          scene: paint(twoUnitArt(small, 2)),
          task: fixed([{ text: 'Aavan', speak: 'Aavan' }, { text: 'Loikan', speak: 'Loikan' }, { text: 'Yhtä pitkä', speak: 'Yhtä pitkä' }], 2, [
            `${small} on isompi luku, mutta Aavan palat ovat pienempiä. Nauha on sama.`,
            'Loikan palat ovat isompia, mutta nauha on sama.',
          ]),
          hint: 'Mitattiinko kahta eri nauhaa vai samaa nauhaa?',
          explain: `Nauha on sama. Isoja paloja tarvittiin vähemmän kuin pieniä.`,
        };
      },
    }, (r) => {
      const a = r.int(3, 9), b = a + r.pick([-3, -2, 2, 3]);
      return {
        say: `Molemmat kepit mitataan samankokoisilla paloilla. Loikan keppi on ${word(a)} palaa pitkä. Aavan keppi on ${word(b)} palaa pitkä. Kumpi keppi on pidempi?`,
        task: fixed([{ text: 'Loikan', speak: 'Loikan' }, { text: 'Aavan', speak: 'Aavan' }], a > b ? 0 : 1, a > b ? [undefined, `Aavan keppi on vain ${word(b)} palaa.`] : [`Loikan keppi on vain ${word(a)} palaa.`]),
        hint: 'Kumpi keppi tarvitsi enemmän samankokoisia paloja?',
        explain: `${Math.max(a, b)} palaa on enemmän kuin ${Math.min(a, b)} palaa.`,
      };
    }),
  },
  {
    id: 'M-TIME-01', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Kumpi kestää', icon: '⏳',
    intro: 'Kaksi kynttilää syttyy. Kumpi palaa kauemmin?',
    reward: 'Huomaat, mikä kestää kauemmin!',
    demo: () => [
      { say: 'Kynttilät syttyvät yhtä aikaa. Punainen sammuu ensin. Sininen palaa kauemmin, ja siksi se myös lyheni enemmän.',
        scene: candleScene([{ on: 1, len: 3, color: '#e0533f' }, { on: 1, len: 6, color: '#3b7fd6' }], { say: (t) => t < 1 ? 'Kynttilät syttyvät yhtä aikaa…' : t < 4 ? 'Molemmat palavat…' : t < 7 ? 'Punainen sammui. Sininen palaa yhä…' : 'Sininen paloi kauemmin: se lyheni enemmän.' }) },
      { say: 'Nyt sininen syttyy myöhemmin ja sammuu viimeisenä. Silti punainen paloi kauemmin: katso, kumpi lyheni enemmän.',
        scene: candleScene([{ on: 0.5, len: 5, color: '#e0533f' }, { on: 3, len: 3, color: '#3b7fd6' }], { say: (t) => t < 3 ? 'Punainen palaa. Sininen ei vielä…' : t < 5.5 ? 'Nyt molemmat palavat…' : t < 6 ? 'Punainen sammui.' : 'Sininen sammui viimeisenä, mutta punainen paloi kauemmin.' }) },
    ],
    item: cases({
      diff: (r) => { const a = r.int(2, 6); let b = r.int(2, 6); if (a === b) b = a === 6 ? 3 : a + 2; return candles(a, b, 0, 0); },
      equal: (r) => { const a = r.int(3, 6); return candles(a, a, 0, 0); },
      life: (r) => {
        const [short, long] = r.pick([['silmänräpäys', 'laulu'], ['aivastus', 'yöuni'], ['hampaiden pesu', 'kesäloma'], ['käsien taputus', 'koulupäivä'], ['oven avaus', 'jalkapallo-ottelu']] as const);
        const shortFirst = r.chance(0.5);
        const opts = shortFirst ? [short, long] : [long, short];
        return {
          say: `Kumpi kestää kauemmin: ${opts[0]} vai ${opts[1]}?`,
          task: fixed(opts.map((o) => txt(cap(o))), shortFirst ? 1 : 0, opts.map((o) => (o === short ? `${cap(short)} on ohi hetkessä. ${cap(long)} kestää paljon kauemmin.` : undefined))),
          hint: 'Kuvittele, että molemmat alkavat yhtä aikaa. Kumpi loppuu ensin?',
          explain: `${cap(long)} kestää kauemmin kuin ${short}.`,
        };
      },
    }, (r) => {
      const a = r.int(4, 6), b = a - r.int(1, 2);
      const longRed = r.chance(0.5);
      const [la, lb] = longRed ? [a, b] : [b, a];
      const [sa, sb] = longRed ? [0.5, a - b + 2.5] : [a - b + 2.5, 0.5];
      return {
        say: 'Nyt kynttilät syttyvät eri aikaan. Kumpi palaa kauemmin? Katso, kumpi lyhenee enemmän.',
        scene: candleScene([{ on: sa, len: la, color: '#e0533f' }, { on: sb, len: lb, color: '#3b7fd6' }]),
        task: fixed([RED, BLUE, SAME('Yhtä kauan')], longRed ? 0 : 1, longRed
          ? [undefined, 'Sininen sammui viimeisenä, mutta se syttyi myöhemmin. Punainen lyheni enemmän.', 'Kynttilät eivät lyhentyneet yhtä paljon.']
          : ['Punainen sammui viimeisenä, mutta se syttyi myöhemmin. Sininen lyheni enemmän.', undefined, 'Kynttilät eivät lyhentyneet yhtä paljon.']),
        hint: 'Viimeisenä sammuva ei aina palanut kauimmin. Katso kynttilöiden pituutta.',
        explain: `${longRed ? 'Punainen' : 'Sininen'} paloi kauemmin: se lyheni enemmän.`,
      };
    }),
  },
  {
    id: 'M-TIME-03', stop: 'Sekunnit', icon: '⏱️', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    intro: 'Loikka ja Aava sopivat yhteisen aikamitan: sekunti.',
    reward: 'Osaat kertoa keston sekunteina!',
    demo: () => [
      { say: 'Katso: sekuntikello käy niin kauan kuin lyhty palaa. Kun valo sammuu, kello pysähtyy.',
        scene: burnScene([{ on: 1, len: 4, color: '#f4c542' }], { say: (t) => t < 1 ? 'Valo syttyy pian…' : t < 5 ? `Valo palaa… ${Math.floor(t - 1)} s` : 'Valo paloi 4 sekuntia. Kirjoitetaan 4 s.' }) },
      { say: 'Loikka ja Aava laskevat taputuksia saman valon aikana. He saavat eri luvut! Sekuntikello näyttää kaikille saman. Siksi sovitaan yhteinen mitta: sekunti.', scene: clapScene(5, 10, 3) },
    ],
    item: cases({
      lamp: (r, phase) => {
        const n = r.int(2, 7);
        return {
          say: 'Lyhty palaa ja sekuntikello käy. Kuinka kauan valo paloi?',
          scene: burnScene([{ on: 1, len: n, color: '#f4c542' }]),
          hint: phase === 'guided' ? 'Katso sekuntikelloa, kun valo sammuu.' : undefined,
          task: choose(r, { big: `${n} s`, speak: secs(n) }, near(r, n, 2, 1, 9).map((m) => ({ big: `${m} s`, speak: secs(m) })),
            near(r, n, 2, 1, 9).map(() => 'Sekuntikello pysähtyi, kun valo sammui. Katso sen lukemaa.')),
          explain: `Sekuntikello pysähtyi lukemaan ${n} s. Valo paloi ${secs(n)}.`,
        };
      },
      compare: (r, phase) => {
        const a = r.int(2, 7); let b = r.int(2, 7); if (a === b) b = a === 7 ? 4 : a + 2;
        const GEN: Record<string, string> = { Punainen: 'punaisen', Sininen: 'sinisen' };
        const long = a > b ? 'Punainen' : 'Sininen', short = a > b ? 'Sininen' : 'Punainen', L = Math.max(a, b), S = Math.min(a, b);
        return {
          say: 'Lyhdyt syttyvät yhtä aikaa. Kumpi paloi kauemmin, ja kuinka kauan?',
          scene: burnScene([{ on: 1, len: a, color: '#e0533f', label: 'punainen' }, { on: 1, len: b, color: '#3b7fd6', label: 'sininen' }]),
          hint: phase === 'guided' ? 'Kumpikin sekuntikello pysähtyy, kun oma lyhty sammuu.' : undefined,
          task: choose(r, txt(`${long}, ${L} s`), [txt(`${short}, ${S} s`), txt(`${long}, ${S} s`), txt(`${short}, ${L} s`)],
            [`${short} sammui ensin: se paloi lyhyemmän ajan.`, `${S} s on ${GEN[short]} lyhdyn kellossa.`, `${short} sammui ensin. ${L} s on ${GEN[long]} kellossa.`], 2),
          explain: `${long} lyhty paloi ${L} s ja ${short.toLowerCase()} ${S} s. ${L} s on pidempi aika.`,
        };
      },
      unit: (r) => {
        const n = r.pick([4, 5, 6]), fast = n * 2, slow = r.pick([2, 3]);
        return {
          say: 'Loikka ja Aava taputtavat, kun valo palaa. Mikä kertoo valon keston niin, että kaikki saavat saman luvun?',
          scene: clapScene(n, fast, slow),
          task: fixed([txt(`Sekuntikello: ${n} s`), txt(`Loikan taputukset: ${fast}`), txt(`Aavan taputukset: ${slow}`)], 0,
            [undefined, 'Loikka taputtaa nopeasti. Joku toinen saisi eri luvun.', 'Aava taputtaa hitaasti. Joku toinen saisi eri luvun.'], 1),
          explain: `Taputuksia tulee eri määrä taputtajasta riippuen. Sekunti on sovittu mitta: sekuntikello näyttää kaikille ${n} s.`,
        };
      },
    }, (r) => {
      const a = r.int(2, 4), b = r.int(2, 4);
      return {
        say: 'Ensin Loikka hyppii, sitten se ui. Kumpaakin mitataan omalla kellolla. Kuinka kauan se puuhasi yhteensä?',
        scene: hopSwimScene(a, b),
        task: choose(r, { big: `${a + b} s`, speak: secs(a + b) }, [{ big: `${Math.max(a, b)} s` }, { big: `${a + b + 1} s` }],
          ['Se on vain toisen puuhan aika. Lisää molemmat.', 'Laske kellojen lukemat yhteen: ei yhtään ylimääräistä sekuntia.']),
        explain: `Hyppiminen kesti ${a} s ja uinti ${b} s. Yhteensä ${a} s + ${b} s = ${a + b} s.`,
      };
    }),
  },
];

function rib(r: Rng, a: number, b: number, oa: number, ob: number) {
  void r;
  return {
    say: 'Kumpi nauha on pidempi?',
    task: { kind: 'ribbons' as const, a, b, offsetA: oa, offsetB: ob },
    hint: 'Siirrä nauhojen alkupäät samaan kohtaan.',
    explain: a === b ? 'Kun alkupäät ovat samassa kohdassa, nauhat ovat yhtä pitkät.' : `Kun alkupäät ovat samassa kohdassa, ${a > b ? 'punainen' : 'sininen'} on pidempi.`,
  };
}

