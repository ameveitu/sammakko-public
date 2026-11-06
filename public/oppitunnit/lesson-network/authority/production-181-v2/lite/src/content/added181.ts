// The four lessons added for the 181-node scope (reference/scope-addendum-181.json):
// measuring length by repeating a unit, perimeter as the length of the boundary,
// subtracting same-denominator fractions, and the basic idea of reading a clock.
import type { NodeSpec, Option, Task } from '../engine/types';
import { svg } from '../ui/art';
import { clockBody } from '../ui/clock';
import { anim, ease, type AnimPaint } from '../ui/anim';
import { word } from './fi';
import { cases, choose, fixed, paint } from './kit';
import { fracArt, fracText, rulerArt } from './pics';
import { ask, fr, t } from './parts';
import { layScene, rulerScene, twoUnitScene } from './measureanim';
import { cellBoundary, perimScene } from './perimanim';
import { takeAwayScene } from './fracanim';
import { AUDIT_REV } from './audit-rev';

// ---------------------------------------------------------------- pictures
/** A stick with a row of equal unit blocks under it (no gaps). */
function unitRow(n: number, unit = 24, label = '') {
  const W = Math.max(220, n * unit + 40);
  let s = `<rect x="20" y="20" width="${n * unit}" height="14" rx="6" fill="#8a5a33"/>`;
  for (let i = 0; i < n; i++) s += `<rect x="${20 + i * unit + 1}" y="42" width="${unit - 2}" height="16" rx="3" fill="var(--sun)" stroke="currentColor" stroke-width="1"/>`;
  return svg(W, 70, s, label || `${n} palaa`);
}

/** A rectangle with labelled sides; `edge` highlights the boundary (perimeter) or fills the inside (area). */
function rectArt(a: number, b: number, show: 'edge' | 'inside' | 'plain' = 'plain', U = 22) {
  const x = 30, y = 20, w = a * U, h = b * U;
  const fill = show === 'inside' ? 'color-mix(in srgb, var(--pond) 45%, transparent)' : 'var(--card)';
  const stroke = show === 'edge' ? 'var(--red)' : 'currentColor';
  return svg(w + 80, h + 60, `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${show === 'edge' ? 6 : 2}"/>`
    + `<text x="${x + w / 2}" y="${y + h + 22}" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">${a} cm</text>`
    + `<text x="${x + w + 8}" y="${y + h / 2 + 5}" font-size="15" font-weight="700" fill="currentColor">${b} cm</text>`, `${a} cm kertaa ${b} cm`);
}

/** A polygon on a 1 cm grid, given as unit steps around its boundary. */
function gridShape(cells: [number, number][], cols = 7, rows = 5, U = 26) {
  const set = new Set(cells.map(([c, r]) => `${c},${r}`));
  let s = '';
  for (let r = 0; r <= rows; r++) s += `<line x1="10" y1="${10 + r * U}" x2="${10 + cols * U}" y2="${10 + r * U}" stroke="currentColor" stroke-opacity=".18"/>`;
  for (let c = 0; c <= cols; c++) s += `<line x1="${10 + c * U}" y1="10" x2="${10 + c * U}" y2="${10 + rows * U}" stroke="currentColor" stroke-opacity=".18"/>`;
  for (const [c, r] of cells) s += `<rect x="${10 + c * U}" y="${10 + r * U}" width="${U}" height="${U}" fill="color-mix(in srgb, var(--sun) 55%, transparent)"/>`;
  // Boundary: every cell side that does not touch another cell.
  for (const [c, r] of cells) {
    const X = 10 + c * U, Y = 10 + r * U;
    if (!set.has(`${c},${r - 1}`)) s += `<line x1="${X}" y1="${Y}" x2="${X + U}" y2="${Y}" stroke="var(--red)" stroke-width="4"/>`;
    if (!set.has(`${c},${r + 1}`)) s += `<line x1="${X}" y1="${Y + U}" x2="${X + U}" y2="${Y + U}" stroke="var(--red)" stroke-width="4"/>`;
    if (!set.has(`${c - 1},${r}`)) s += `<line x1="${X}" y1="${Y}" x2="${X}" y2="${Y + U}" stroke="var(--red)" stroke-width="4"/>`;
    if (!set.has(`${c + 1},${r}`)) s += `<line x1="${X + U}" y1="${Y}" x2="${X + U}" y2="${Y + U}" stroke="var(--red)" stroke-width="4"/>`;
  }
  return svg(cols * U + 20, rows * U + 20, s, 'kuvio ruudukossa');
}
/** Unit edges on the boundary of a set of grid cells (independent of the drawing). */
export function boundaryLength(cells: [number, number][]) {
  const set = new Set(cells.map(([c, r]) => `${c},${r}`));
  let n = 0;
  for (const [c, r] of cells) for (const [dc, dr] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) if (!set.has(`${c + dc},${r + dr}`)) n++;
  return n;
}

/** Analogue clock face showing h:m (m = 0 or 30). */
export function clockArt(h: number, m: number, size = 140) {
  return svg(size, size, clockBody(h, m, size), m === 0 ? `kello ${h}` : `kello ${h}.30`);
}
const next12 = (h: number) => (h % 12) + 1;
/** Finnish clock words: 3.00 "kello kolme", 3.30 "puoli neljä". */
const clockWords = (h: number, m: number) => (m === 0 ? `kello ${word(h)}` : `puoli ${word(next12(h))}`);
/** Time passes on the clock: from h.00 the long hand goes round once, stopping at the half hour,
 *  while the short hand creeps from h to the next number. */
function clockScene(h: number): AnimPaint {
  const mAt = (t: number) => 30 * ease(t, 1, 4.5) + 30 * ease(t, 6.5, 10);
  return anim({
    dur: 11.5, w: 220, h: 170, label: `Kello kulkee: ${h}.00, ${h}.30, ${next12(h)}.00`,
    frame: (t) => `<g transform="translate(40 4)">${clockBody(h, mAt(t), 140)}</g>` +
      `<text x="110" y="166" text-anchor="middle" font-size="15" font-weight="800" fill="currentColor">${mAt(t) >= 59.5 ? `${next12(h)}.00` : `${h}.${String(Math.floor(mAt(t))).padStart(2, '0')}`}</text>`,
    caption: (t) => t < 1 ? `${cap(clockWords(h, 0))}: pitkä viisari ylhäällä.`
      : t < 4.6 ? 'Pitkä viisari kulkee… katso myös lyhyttä.'
        : t < 6.5 ? `${cap(clockWords(h, 30))}: pitkä viisari alhaalla, lyhyt lukujen ${h} ja ${next12(h)} välissä.`
          : t < 10.1 ? 'Pitkä viisari jatkaa ylös…' : `${cap(clockWords(next12(h), 0))}: tunti kului, lyhyt viisari siirtyi yhden luvun.`,
  });
}
const cap = (w: string) => w[0]!.toUpperCase() + w.slice(1);
const clockOpt = (h: number, m: number): Option => ({ text: clockWords(h, m), speak: clockWords(h, m) });

export const ADDED181_NODES: NodeSpec[] = [
  // ============================================================ measuring with a unit
  {
    id: 'M-MEAS-04', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Mittaa yksiköllä', icon: '📐',
    goal: 'Opit mittaamaan pituuden toistamalla samaa yksikköä alusta loppuun ja kertomaan tuloksen luvulla ja yksiköllä.',
    intro: 'Lentopajan siipiin tarvitaan oikean pituisia rimoja. Mitataan ne yksiköllä.',
    reward: 'Mittaat pituuden yksiköllä, alusta loppuun!',
    demo: () => [
      { say: 'Pituus mitataan toistamalla samaa yksikköä: palat peräkkäin, ilman rakoja, alusta loppuun. Jokainen pala on yksi senttimetri. Viisi palaa: viisi senttimetriä.', scene: layScene(5) },
      { say: 'Viivoittimessa yksiköt ovat valmiina. Jos rima alkaa kohdasta kaksi, lasketaan välit kohdasta kaksi loppuun asti: kuusi senttiä.', scene: rulerScene(2, 8) },
      { say: 'Sama rima isommilla paloilla antaa pienemmän luvun. Siksi tulokseen kirjoitetaan aina yksikkö.', scene: twoUnitScene(6, 2) },
    ],
    item: cases({
      units: (r) => {
        const n = r.int(3, 9);
        return ask(`Jokainen keltainen pala on 1 cm. Kuinka pitkä rima on?`, n, `Paloja on ${n}, ja jokainen on 1 cm: ${n} cm.`, { unit: 'cm', scene: unitRow(n), hint: 'Laske palat rimaa pitkin alusta loppuun.', whyAt: { [n - 1]: 'Yksi pala jäi laskematta.', [n + 1]: 'Laskit yhden palan liikaa.' } });
      },
      offset: (r) => {
        const a = r.int(1, 4), len = r.int(3, 7), b = a + len;
        return ask('Kuinka monta senttimetriä rima on?', len, `Rima alkaa kohdasta ${a} ja loppuu kohtaan ${b}: välejä on ${len}, eli ${len} cm.`, { unit: 'cm', scene: rulerArt(12, a, b), hint: 'Rima ei ala nollasta. Laske välit.', whyAt: { [len + 1]: 'Laskit viivat, et välejä. Laske välit.', [b]: `${b} on riman loppukohta. Rima alkaa kohdasta ${a}, joten laske välit siitä.` } });
      },
      unitSize: (r) => {
        const big = r.pick([2, 3]), n = r.int(2, 4);
        return {
          say: `Loikka mittasi riman isoilla paloilla: ${word(n)} palaa. Aava mittaa saman riman pienillä paloilla. Saako Aava suuremman vai pienemmän luvun?`,
          scene: paint(unitRow(n, 24 * big, `${n} isoa palaa`) + unitRow(n * big, 24, `${n * big} pientä palaa`)),
          task: fixed([t('suuremman'), t('pienemmän'), t('saman')], 0, [undefined, 'Pieniä paloja mahtuu samaan pituuteen enemmän.', 'Luku riippuu siitä, kuinka iso yksikkö on.'], 3),
          hint: 'Kumpia paloja tarvitaan enemmän samaan pituuteen: isoja vai pieniä?',
          explain: `Pienempiä paloja tarvitaan enemmän: ${n * big} pientä palaa. Siksi tulokseen kirjoitetaan aina myös yksikkö.`,
        };
      },
    }, (r) => {
      const a = r.int(3, 6), len = r.int(4, 8), b = a + len;
      return {
        say: `Viivoittimen alkupää on katkennut. Rima on kohdasta ${a} kohtaan ${b}. Sulka sanoo: "Rima on ${b} cm." Kuinka pitkä rima on?`,
        scene: paint(rulerArt(14, a, b)),
        task: choose(r, t(`${len} cm`), [t(`${b} cm`), t(`${len + 1} cm`)], [`Riman pää on kohdassa ${b}, mutta alku ei ole nollassa.`, 'Laske välit, älä viivoja.']),
        hint: 'Loppukohta ei ole pituus, kun alku ei ole nollassa.',
        explain: `Välejä kohdasta ${a} kohtaan ${b} on ${len}: rima on ${len} cm.`,
      };
    }),
  },
  // ============================================================ perimeter
  {
    id: 'M-GMEAS-01', stop: 'Reunan pituus', icon: '🔲',
    goal: 'Opit, että piiri on kuvion reunaviivan koko pituus, ja lasket sen sivujen pituuksista.',
    intro: 'Lentopajan siiven reunaan liimataan nauha. Kuinka pitkä nauha tarvitaan?',
    reward: 'Tiedät, mitä piiri tarkoittaa, ja lasket sen!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Piiri on kuvion reunaviivan pituus. Loikka kiertää suorakulmion reunan ja vetää nauhaa perässään: 4 + 2 + 4 + 2 = 12. Kun nauha vedetään suoraksi, se on 12 senttiä pitkä.', scene: perimScene({ pts: [[0, 0], [4, 0], [4, 2], [0, 2]], unit: 'cm' }) },
      { say: 'Ruudukossa lasketaan reunan ruudun sivut yksi kerrallaan. Sisällä olevat viivat eivät kuulu piiriin.', scene: perimScene({ pts: cellBoundary([[0, 0], [1, 0], [2, 0], [0, 1]]), unit: 'cm', count: true, cells: [[0, 0], [1, 0], [2, 0], [0, 1]] }) },
      { say: 'Kolmiossa on kolme sivua: 3 + 5 + 4 = 12. Eri muotoisilla kuvioilla voi olla sama piiri.', scene: perimScene({ pts: [[0, 3], [0, 0], [4, 3]], unit: 'cm' }) },
    ],
    item: cases({
      rect: (r) => {
        const a = r.int(2, 7), b = r.int(1, 4);
        const whyAt: Record<number, string> = { [a + b]: `Tämä on vain kaksi sivua. Kierroksella kuljetaan neljä sivua: ${a} + ${b} + ${a} + ${b}.` };
        if (a * b !== 2 * (a + b)) whyAt[a * b] = `${a} × ${b} = ${a * b} on pinta-ala, ruutujen määrä sisällä. Piiri on reunan pituus.`;
        return ask('Kuinka pitkä on suorakulmion piiri?', 2 * (a + b), `Piiri on kaikkien sivujen summa: ${a} + ${b} + ${a} + ${b} = ${2 * (a + b)} cm.`, { unit: 'cm', scene: rectArt(a, b, 'edge'), hint: 'Vastakkaiset sivut ovat yhtä pitkät. Sivuja on neljä.', whyAt });
      },
      grid: (r) => {
        const shapes: [number, number][][] = [
          [[1, 1], [2, 1], [3, 1], [1, 2]],
          [[1, 1], [2, 1], [1, 2], [2, 2], [3, 2]],
          [[2, 1], [1, 2], [2, 2], [3, 2]],
          [[1, 1], [2, 1], [3, 1], [4, 1], [1, 2], [4, 2]],
        ];
        const cells = r.pick(shapes);
        const p = boundaryLength(cells);
        return ask('Ruudun sivu on 1 cm. Kuinka pitkä on punainen reunaviiva?', p, `Reunalla on ${p} ruudun sivua, joten piiri on ${p} cm.`, { unit: 'cm', scene: gridShape(cells), hint: 'Kulje reunaa pitkin ja laske ruudun sivut.' });
      },
      same: (r) => {
        const P1 = r.pick([10, 12]), P2 = P1 === 10 ? 14 : 16;
        const of = (p: number) => Array.from({ length: p / 2 - 1 }, (_, i) => [i + 1, p / 2 - i - 1] as [number, number]).filter(([x, y]) => x >= y && y <= 4 && x <= 7);
        const A = r.shuffle(of(P1)).slice(0, 2), B = r.shuffle(of(P2)).slice(0, 2);
        const all = r.shuffle([...A.map((x) => [...x, 0] as const), ...B.map((x) => [...x, 1] as const)]);
        if (all.every((x, i) => x[2] === [0, 0, 1, 1][i])) all.reverse();
        return {
          say: `Laske jokaisen suorakulmion piiri ja lajittele: ${P1} cm vai ${P2} cm?`,
          task: {
            kind: 'sort' as const,
            items: all.map(([x, y]) => ({ art: rectArt(x, y, 'edge', 14) })),
            cats: [{ label: `piiri ${P1} cm` }, { label: `piiri ${P2} cm` }],
            answer: all.map((x) => x[2]),
            why: all.map(([x, y]) => `${x} + ${y} + ${x} + ${y} = ${2 * (x + y)} cm.`),
          },
          hint: 'Laske jokaisesta: pitkä + lyhyt + pitkä + lyhyt.',
          explain: `Eri muotoisilla suorakulmioilla voi olla sama piiri: ${all.map(([x, y]) => `sivut ${x} ja ${y} → ${2 * (x + y)} cm`).join(', ')}.`,
        };
      },
      meaning: (r) => {
        const a = r.int(3, 5), b = r.int(2, 3);
        return {
          say: 'Missä kuvassa on näytetty piiri?',
          task: choose(r, { art: rectArt(a, b, 'edge') }, [{ art: rectArt(a, b, 'inside') }], ['Tämä on kuvion sisäpuoli, pinta-ala. Piiri on reunaviiva.'], 2),
          hint: 'Piiri on kuin aita tai nauha kuvion ympärillä.',
          explain: 'Piiri on reunaviiva, joka kiertää koko kuvion.',
        };
      },
    }, (r) => {
      const [a, b, c] = r.pick([[3, 4, 5], [5, 5, 6], [4, 4, 4], [6, 8, 10]]);
      return ask(`Kolmionmuotoisen kasvimaan sivut ovat ${a} m, ${b} m ja ${c} m. Sen ympäri tehdään aita. Kuinka monta metriä aitaa tarvitaan?`, a! + b! + c!, `Aita kiertää reunan: ${a} + ${b} + ${c} = ${a! + b! + c!} m.`, { unit: 'm', hint: 'Aita kiertää koko reunan: laske kaikki kolme sivua yhteen.', ...(a! * b! !== a! + b! + c! ? { whyAt: { [a! + b!]: 'Yksi sivu jäi pois: kolmiossa on kolme sivua.' } } : {}) });
    }),
  },
  // ============================================================ subtracting same-denominator fractions
  {
    id: 'M-FRAC-12', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Palat pois', icon: '➖',
    goal: 'Opit vähentämään murtolukuja, joilla on sama nimittäjä: palat vähennetään, palan koko pysyy.',
    intro: 'Piirakkajuhlassa paloja syödään. Kuinka paljon jää jäljelle?',
    reward: 'Vähennät samannimisiä murtolukuja!',
    demo: () => [
      { say: 'Vadissa on viisi kahdeksasosaa. Loikka syö kaksi palaa, yksi kerrallaan. Palojen määrä pienenee, mutta jokainen pala on yhä kahdeksasosa: viisi kahdeksasosaa miinus kaksi kahdeksasosaa on kolme kahdeksasosaa.', scene: takeAwayScene(8, 5, 2) },
      { say: 'Entä yksi miinus kolme kahdeksasosaa? Kokonainen leikataan ensin kahdeksaan palaan: yksi on kahdeksan kahdeksasosaa. Kun kolme palaa syödään, jää viisi kahdeksasosaa.', scene: takeAwayScene(8, 8, 3, true) },
      { say: 'Vielä yksi: kuusi kymmenesosaa miinus neljä kymmenesosaa. Nimittäjää ei vähennetä, koska palan koko ei muutu.', scene: takeAwayScene(10, 6, 4) },
    ],
    item: cases({
      sub: (r) => {
        const n = r.pick([5, 6, 7, 8, 9, 10]), a = r.int(3, n), b = r.int(1, a - 1);
        const near = a - b + 1 <= n && a - b + 1 !== a + b ? a - b + 1 : a - b - 1;
        return {
          say: `${a}/${n} − ${b}/${n} = ?`,
          scene: paint(`<div class="formula">${fracText(a, n)} − ${fracText(b, n)}</div>`),
          task: choose(r, fr(a - b, n), [fr(a + b, n), ...(near > 0 && near !== a - b ? [fr(near, n)] : [])], ['Tässä laskettiin yhteen. Paloja otetaan pois.', `Laske palat uudelleen: ${a} − ${b}.`]),
          hint: `Vähennä vain osoittajat: ${a} palaa − ${b} palaa. Nimittäjä ${n} pysyy.`,
          explain: `${a} palaa − ${b} palaa = ${a - b} palaa: ${a - b}/${n}.`,
        };
      },
      picture: (r) => {
        const n = r.pick([4, 5, 6, 8]), a = r.int(2, n), b = r.int(1, a - 1);
        const whyAt: Record<number, string> = { [a + b]: 'Syödyt palat eivät tule lisää, ne lähtevät pois.' };
        if (a !== a - b) whyAt[a] = `${a} palaa oli alussa. Kuinka monta jää, kun ${b} syödään?`;
        if (b !== a - b) whyAt[b] = `${b} palaa syötiin. Kysytään, montako jäi.`;
        return ask(`Vadissa oli ${a}/${n} piirakkaa. Siitä syötiin ${b}/${n}. Montako ${n}-osaa jäi?`, a - b, `${a}/${n} − ${b}/${n} = ${a - b}/${n}.`, { scene: fracArt(n, a, 'bar'), hint: 'Peitä syödyt palat sormella ja laske loput.', whyAt });
      },
      whole: (r) => {
        const n = r.pick([3, 4, 5, 6, 8, 10]), b = r.int(1, n - 1);
        const whyAt: Record<number, string> = { [n + b]: 'Tässä laskettiin yhteen. Paloja otetaan pois.' };
        if (b !== n - b) whyAt[b] = `${b}/${n} on se osa, joka otetaan pois. Paljonko jää?`;
        if (n - 1 !== n - b) whyAt[n - 1] = `Ykkönen on ${n}/${n}, ei 1/${n}. Laske ${n} − ${b}.`;
        return ask(`1 − ${b}/${n} = ?/${n}`, n - b, `Kokonainen on ${n}/${n}. ${n}/${n} − ${b}/${n} = ${n - b}/${n}.`, { scene: `<div class="formula">1 − ${fracText(b, n)} = ${fracText('?', n)}</div>`, hint: `Kirjoita ykkönen muotoon ${n}/${n}.`, whyAt });
      },
      diffs: (r) => {
        const n = r.pick([7, 8, 9, 10]);
        const ds = r.shuffle(Array.from({ length: n - 2 }, (_, i) => i + 1)).slice(0, 3);
        const rows = ds.map((d) => { const b = r.int(1, n - d); return { a: d + b, b, d }; });
        const dr = rows.find((q) => !ds.includes(q.a + q.b));
        const decoy = dr ? `${dr.a + dr.b}/${n}` : `${rows[0]!.d}/0`;
        const toks = r.shuffle([...rows.map((q) => `${q.d}/${n}`), decoy]).map((x, i) => ({ id: `t${i}`, text: x }));
        const idOf = (x: string) => toks.find((q) => q.text === x)!.id;
        return {
          say: 'Paljonko jää? Vedä oikea tulos jokaisen laskun alle. Yksi kortti jää yli.',
          task: {
            kind: 'place',
            slots: rows.map((q, i) => ({ id: `s${i}`, text: `${q.a}/${n} − ${q.b}/${n}` })),
            tokens: toks,
            answer: Object.fromEntries(rows.map((q, i) => [`s${i}`, idOf(`${q.d}/${n}`)])),
            why: Object.fromEntries(rows.map((q, i) => [`s${i}`, `${q.a} − ${q.b} = ${q.d} palaa, nimittäjä pysyy ${n}.`])),
          } as Task,
          hint: 'Osoittajat vähennetään, nimittäjä pysyy.',
          explain: rows.map((q) => `${q.a}/${n} − ${q.b}/${n} = ${q.d}/${n}`).join(', ') + `. ${decoy} on harhautus${dr ? ': se syntyy, jos palat lasketaan yhteen' : ''}.`,
        };
      },
    }, (r) => {
      const n = r.pick([6, 8, 10, 12]), a = r.int(Math.ceil(n / 2), n - 1), b = r.int(1, Math.floor(n / 3));
      const whyAt: Record<number, string> = { [a + b]: 'Aava joi mehua, joten pullossa on vähemmän, ei enemmän.' };
      if (b !== a - b) whyAt[b] = `${b}/${n} litraa juotiin. Kysytään, mitä pulloon jäi.`;
      if (n - b !== a - b) whyAt[n - b] = `Pullo ei ollut täynnä: alussa oli ${a}/${n}, ei ${n}/${n}.`;
      return ask(`Pullossa oli ${a}/${n} litraa mehua. Aava joi ${b}/${n} litraa. Monta ${n}-osaa litraa jäi pulloon?`, a - b, `${a}/${n} − ${b}/${n} = ${a - b}/${n} litraa.`, { hint: `Alussa ${a} osaa, juotiin ${b} osaa. Vähennä.`, whyAt });
    }),
  },
  // ============================================================ reading a clock
  {
    id: 'M-TIME-02', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Kellotaulu', icon: '🕒',
    goal: 'Opit lukemaan kellosta tasatunnit ja puolet tunnit: lyhyt viisari näyttää tunnin, pitkä minuutit.',
    intro: 'Lentopajan koelento alkaa tietyllä kellonlyömällä. Luetaan kellotaulua.',
    reward: 'Luet kellosta tasat ja puolet!',
    demo: () => [
      { say: 'Kellossa on kaksi viisaria. Lyhyt paksu viisari näyttää tunnin. Pitkä viisari näyttää minuutit. Kun pitkä viisari osoittaa ylös kahteentoista, on tasatunti: kello kolme.', scene: paint(clockArt(3, 0)) },
      { say: 'Katso, kun aika kuluu. Pitkä viisari kiertää alas kuuteen: puoli tuntia on kulunut, ja lyhyt viisari on kolmen ja neljän välissä. Kello on puoli neljä, eli 3.30. Sitten pitkä viisari jatkaa ylös, ja on kello neljä.', scene: clockScene(3) },
    ],
    item: cases({
      full: (r) => {
        const h = r.int(1, 12);
        const others = r.shuffle([next12(h), next12(next12(h)), ((h + 5) % 12) + 1].filter((x) => x !== h)).slice(0, 2);
        return { say: 'Paljonko kello on?', scene: paint(clockArt(h, 0)), task: choose(r, clockOpt(h, 0), others.map((x) => clockOpt(x, 0)), others.map((x) => `Lyhyt viisari osoittaa lukua ${h}, ei lukua ${x}.`)), hint: 'Katso lyhyttä viisaria: mitä lukua se osoittaa?', explain: `Pitkä viisari on ylhäällä ja lyhyt osoittaa lukua ${h}: kello ${word(h)}.` };
      },
      half: (r) => {
        const h = r.int(1, 12);
        return {
          say: 'Paljonko kello on?',
          scene: paint(clockArt(h, 30)),
          task: choose(r, clockOpt(h, 30), [{ text: `puoli ${word(h)}`, speak: `puoli ${word(h)}` }, clockOpt(h, 0)], [`Lyhyt viisari on jo ohittanut luvun ${h}. Puoli tarkoittaa puolta tuntia ennen seuraavaa tasaa.`, 'Pitkä viisari on alhaalla: on kulunut puoli tuntia.']),
          explain: `Pitkä viisari on alhaalla, ja lyhyt on lukujen ${h} ja ${next12(h)} välissä: ${clockWords(h, 30)} eli ${h}.30.`,
        };
      },
      set: (r) => {
        const h = r.int(1, 12), m = r.pick([0, 30]);
        return {
          say: `Aseta kello: ${clockWords(h, m)}.`,
          task: { kind: 'clock' as const, h, m, start: h === 12 && m === 0 ? 6 : 12 },
          hint: m === 30 ? `Puoli ${word(next12(h))}: pitkä viisari alas, lyhyt lukujen ${h} ja ${next12(h)} väliin.` : `Pitkä viisari ylös, lyhyt lukuun ${h}.`,
          explain: m === 30 ? `${cap(clockWords(h, 30))} on ${h}.30: puoli tuntia ennen kuin kello on ${word(next12(h))}.` : `${cap(clockWords(h, 0))}: pitkä viisari ylhäällä, lyhyt luvussa ${h}.`,
        };
      },
      hands: (r) => {
        const h = r.int(1, 12);
        return {
          say: 'Kumpi viisari näyttää tunnin?',
          scene: paint(clockArt(h, 0)),
          task: fixed([t('lyhyt paksu viisari'), t('pitkä ohut viisari')], 0, [undefined, 'Pitkä viisari näyttää minuutit.'], 1),
          explain: 'Lyhyt viisari näyttää tunnin, pitkä minuutit.',
        };
      },
    }, (r) => {
      const h = r.int(1, 12), half = r.chance(0.5), m = half ? 30 : 0;
      const shown = `${h}.${half ? '30' : '00'}`;
      const wrongs = half ? [clockArt(h, 0, 110), clockArt(next12(h), 30, 110)] : [clockArt(h, 30, 110), clockArt(next12(h), 0, 110)];
      return {
        say: `Koelento alkaa kello ${shown}. Mikä kello näyttää sen ajan?`,
        task: choose(r, { art: clockArt(h, m, 110) }, wrongs.map((art) => ({ art })), half
          ? ['Tässä pitkä viisari on ylhäällä: se on tasatunti.', `Tässä on ${next12(h)}.30: lyhyt viisari on jo luvun ${next12(h)} ohi.`]
          : ['Tässä pitkä viisari on alhaalla: se on puoli.', `Tässä lyhyt viisari osoittaa lukua ${next12(h)}.`], 3),
        hint: half ? '.30 tarkoittaa, että pitkä viisari on alhaalla.' : '.00 tarkoittaa, että pitkä viisari on ylhäällä.',
        explain: half ? `${shown} on ${clockWords(h, 30)}: pitkä viisari alhaalla, lyhyt lukujen ${h} ja ${next12(h)} välissä.` : `${shown}: pitkä viisari ylhäällä, lyhyt luvussa ${h}.`,
      };
    }),
  },
];
