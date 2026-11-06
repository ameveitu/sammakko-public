// Thinking skills and geometry added for the 177-node MVP: flat vs solid, shapes,
// mirror symmetry, classifying, ordering, patterns, noticing what matters, writing
// ideas with symbols, safe-work rules (virtual only), systematic listing, links
// between ideas and finding a rule.
import type { Rng } from '../engine/rng';
import type { NodeSpec, Option } from '../engine/types';
import { svg } from '../ui/art';
import { word } from './fi';
import { cases, choose, groupArt, paint, table, withItemReadiness } from './kit';
import { gridArt } from './pics';
import { AUDIT_REV, LAUNCH_REV } from './audit-rev';
import { anim, ease, type AnimPaint } from '../ui/anim';
import { pairScene, signScene, translateScene } from './countanim';
import { ruleHuntScene } from './alg79anim';
import { edgeScene, pressScene, sortScene, traceScene, turnScene } from './geoanim';
import { fracShareScene, repeatScene } from './multanim';
import { perimScene } from './perimanim';
import { digitTreeScene, growScene, guessOutfitsScene, handshakeScene, orderScene, patternScene, sieveScene, systemOutfitsScene } from './thinkanim';
import { hazardScene, prepScene, type Hazard } from './safeanim';

const PILE: { k: ShapeKind; c: ColorName }[] = [{ k: 'kolmio', c: 'punainen' }, { k: 'ympyra', c: 'sininen' }, { k: 'kolmio', c: 'sininen' }, { k: 'nelio', c: 'punainen' }, { k: 'ympyra', c: 'punainen' }, { k: 'nelio', c: 'keltainen' }];
const swatch = (c: ColorName) => svg(40, 28, `<rect x="2" y="2" width="36" height="24" rx="8" fill="${COLOR[c]}" stroke="currentColor" stroke-width="2"/>`, c).replace('width="100%"', 'width="40"');

const PAT_COL: Record<ShapeKind, ColorName> = { kolmio: 'vihreä', ympyra: 'sininen', nelio: 'keltainen', suorakulmio: 'punainen' };
const PAT_UNITS: ShapeKind[][] = [['kolmio', 'ympyra'], ['nelio', 'nelio', 'kolmio'], ['ympyra', 'kolmio', 'nelio'], ['kolmio', 'kolmio', 'ympyra', 'ympyra']];
const CORNER_TXT: Record<ShapeKind, string> = { kolmio: 'on kolme kulmaa', nelio: 'on neljä yhtä pitkää sivua', suorakulmio: 'on neljä suoraa kulmaa', ympyra: 'ei ole yhtään kulmaa' };
const INE: Record<ShapeKind, string> = { kolmio: 'Kolmiossa', nelio: 'Neliössä', suorakulmio: 'Suorakulmiossa', ympyra: 'Ympyrässä' };
const capF = (x: string) => x[0]!.toUpperCase() + x.slice(1);
/** Misconception messages never sit on the right answer (e.g. s = 4: 4 · 4 = 4 + 4 + 4 + 4). */
const offAnswer = (ans: number, w: Record<number, string>) => Object.fromEntries(Object.entries(w).filter(([k]) => Number(k) !== ans));
import {
  arrayArt, ask, card, COLOR, COLOR_NAMES, COLOR_PL, type ColorName, ex, n$, pickNum, pickText, isA, notA, SHAPE_KINDS, SHAPE_NAME, type ShapeKind, shapeRow, shapeSvg,
  SOLID, SOLID_NAME, SOLID_PRINT, type SolidKind, stick, t, YESNO,
} from './parts';

// Recognition tasks describe observable properties rather than announcing the name.
const GEO_CORNER_TXT = { ...CORNER_TXT, nelio: 'on neljä yhtä pitkää sivua ja neljä suoraa kulmaa' };
const SHAPE_DESCRIPTION: Record<ShapeKind, string> = {
  kolmio: 'Suljettu reuna, kolme suoraa sivua ja kolme kulmaa',
  nelio: 'Suljettu reuna, neljä yhtä pitkää sivua ja neljä suoraa kulmaa',
  suorakulmio: 'Suljettu reuna, neljä suoraa kulmaa; kaksi pitkää ja kaksi lyhyttä sivua',
  ympyra: 'Suljettu tasaisesti kaartuva reuna, jokainen reunan piste yhtä kaukana keskipisteestä',
};
const describedShape = (...args: Parameters<typeof shapeSvg>) => shapeSvg(...args)
  .replace(/aria-label="[^"]*"/, `aria-label="${SHAPE_DESCRIPTION[args[0]]}"`);

// Color and geometry are the supplied data in classification, not a correctness verdict.
const classifiedShape = (...args: Parameters<typeof shapeSvg>) => shapeSvg(...args)
  .replace(/aria-label="[^"]*"/, `aria-label="${args[1] ?? 'sininen'}; ${SHAPE_DESCRIPTION[args[0]]}; ${args[2] === 32 ? 'pieni' : args[2] === 56 ? 'suuri' : 'keskikokoinen'} kuvio"`);

const SOLIDS = Object.keys(SOLID) as SolidKind[];
const art = (s: string): Option => ({ art: s });

/** Cells on a small grid with a dashed mirror line after column `axis`. */
function cellsArt(cells: [number, number][], cols = 6, rows = 4, axis = 3, U = 26) {
  let s = '';
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    const on = cells.some(([x, y]) => x === c && y === r);
    s += `<rect x="${4 + c * U}" y="${4 + r * U}" width="${U}" height="${U}" fill="${on ? 'var(--pond)' : 'var(--card)'}" stroke="currentColor" stroke-opacity=".3"/>`;
  }
  if (axis > 0) s += `<line x1="${4 + axis * U}" y1="0" x2="${4 + axis * U}" y2="${rows * U + 8}" stroke="var(--red)" stroke-width="3" stroke-dasharray="6 5"/>`;
  return svg(cols * U + 8, rows * U + 8, s);
}
/** A random connected-ish half shape in columns 0..2. */
function halfShape(r: Rng): [number, number][] {
  const out: [number, number][] = [];
  for (let y = 0; y < 4; y++) {
    const from = r.int(0, 2);
    for (let x = from; x < 3; x++) if (x === 2 || r.chance(0.8)) out.push([x, y]);
  }
  if (out.length < 4) out.push([1, 1], [0, 2]);
  return out.filter((p, i) => out.findIndex((q) => q[0] === p[0] && q[1] === p[1]) === i);
}
const mirror = (cells: [number, number][]) => cells.map(([x, y]) => [5 - x, y] as [number, number]);
const shift = (cells: [number, number][]) => cells.map(([x, y]) => [x + 3, y] as [number, number]);

/** Classic shapes with a dashed line that is (or is not) a line of symmetry. */
const SYMS: { name: string; yes: boolean; draw: string; why: string }[] = [
  { name: 'suorakulmio', yes: true, draw: '<rect x="10" y="30" width="120" height="70" fill="var(--sun)" stroke="currentColor" stroke-width="2"/><line x1="70" y1="20" x2="70" y2="110" stroke="var(--red)" stroke-width="3" stroke-dasharray="6 5"/>', why: 'Kun suorakulmio taitetaan keskeltä, puolikkaat menevät täsmälleen päällekkäin.' },
  { name: 'suorakulmio', yes: false, draw: '<rect x="10" y="30" width="120" height="70" fill="var(--sun)" stroke="currentColor" stroke-width="2"/><line x1="4" y1="24" x2="136" y2="106" stroke="var(--red)" stroke-width="3" stroke-dasharray="6 5"/>', why: 'Tämä suorakulmio ei ole neliö. Sen lävistäjä ei ole symmetria-akseli: taitettaessa kulmat eivät osu päällekkäin.' },
  { name: 'neliö', yes: true, draw: '<rect x="25" y="20" width="90" height="90" fill="var(--blue)" stroke="currentColor" stroke-width="2"/><line x1="18" y1="13" x2="122" y2="117" stroke="var(--red)" stroke-width="3" stroke-dasharray="6 5"/>', why: 'Neliön lävistäjä on symmetria-akseli: taitettaessa puolikkaat osuvat päällekkäin.' },
  { name: 'kolmio', yes: true, draw: '<path d="M70 14 L125 112 L15 112Z" fill="var(--pond)" stroke="currentColor" stroke-width="2"/><line x1="70" y1="6" x2="70" y2="120" stroke="var(--red)" stroke-width="3" stroke-dasharray="6 5"/>', why: 'Tasakylkisen kolmion keskiviiva jakaa sen kahteen peilikuvaan.' },
  { name: 'kolmio', yes: false, draw: '<path d="M30 14 L125 112 L15 112Z" fill="var(--pond)" stroke="currentColor" stroke-width="2"/><line x1="70" y1="6" x2="70" y2="120" stroke="var(--red)" stroke-width="3" stroke-dasharray="6 5"/>', why: 'Puolikkaat ovat eri muotoiset: ne eivät mene päällekkäin.' },
  { name: 'sydän', yes: true, draw: '<path d="M70 112 C10 70 10 20 45 20 C60 20 70 32 70 40 C70 32 80 20 95 20 C130 20 130 70 70 112Z" fill="var(--red)" stroke="currentColor" stroke-width="2"/><line x1="70" y1="8" x2="70" y2="122" stroke="currentColor" stroke-width="3" stroke-dasharray="6 5"/>', why: 'Sydämen vasen ja oikea puoli ovat toistensa peilikuvat.' },
  { name: 'sydän', yes: false, draw: '<path d="M70 112 C10 70 10 20 45 20 C60 20 70 32 70 40 C70 32 80 20 95 20 C130 20 130 70 70 112Z" fill="var(--red)" stroke="currentColor" stroke-width="2"/><line x1="8" y1="62" x2="132" y2="62" stroke="currentColor" stroke-width="3" stroke-dasharray="6 5"/>', why: 'Ylä- ja alaosa ovat eri muotoiset: vaakaviiva ei ole symmetria-akseli.' },
];
const symArt = (i: number) => svg(140, 128, SYMS[i]!.draw);
let foldId = 0;
/** The shape is really folded along its dashed line: one half turns over onto the other. Halves
 *  that match cover each other exactly; otherwise the parts that stick out are shown. */
function foldScene(i: number): AnimPaint {
  const S = SYMS[i]!, id = `fold${++foldId}`;
  const m = S.draw.match(/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"[^>]*\/>/)!;
  const [x1, y1, x2, y2] = [m[1], m[2], m[3], m[4]].map(Number) as [number, number, number, number];
  const shape = S.draw.replace(m[0], ''), line = m[0];
  const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, nx = -uy, ny = ux;
  const A = [x1 - ux * 400, y1 - uy * 400], B = [x2 + ux * 400, y2 + uy * 400];
  const half = (sg: number) => `${A[0]},${A[1]} ${B[0]},${B[1]} ${B[0]! + sg * nx * 400},${B[1]! + sg * ny * 400} ${A[0]! + sg * nx * 400},${A[1]! + sg * ny * 400}`;
  const ang = (Math.atan2(uy, ux) * 180) / Math.PI, cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
  const T0 = 1.2, T1 = 3.6, dur = 8;
  return anim({
    dur, w: 140, h: 128, label: 'Taittelu',
    frame: (t) => {
      const u = ease(t, T0, T1) - ease(t, dur - 1.6, dur - 0.4), c = Math.cos(Math.PI * u);
      const tf = `translate(${cx} ${cy}) rotate(${ang}) scale(1 ${c}) rotate(${-ang}) translate(${-cx} ${-cy})`;
      const show = t > T1 && t < dur - 1.6 ? ease(t, T1, T1 + 0.4) : 0;
      return `<defs><clipPath id="${id}a"><polygon points="${half(1)}"/></clipPath><clipPath id="${id}b"><polygon points="${half(-1)}"/></clipPath></defs>`
        + `<g clip-path="url(#${id}b)">${shape}</g>`
        + `<g transform="${tf}"><g clip-path="url(#${id}a)" opacity="${c < 0 ? 0.75 : 1}">${shape}</g></g>`
        + (show && !S.yes ? `<g transform="translate(${cx} ${cy}) rotate(${ang}) scale(1 -1) rotate(${-ang}) translate(${-cx} ${-cy})"><g clip-path="url(#${id}a)" opacity="${show}">${shape.replace(/fill="[^"]*"/g, 'fill="none"').replace(/stroke="[^"]*"/g, 'stroke="var(--bad)"').replace(/stroke-width="[^"]*"/g, 'stroke-width="3.5"')}</g></g>` : '')
        + line;
    },
    caption: (t) => t < T0 ? 'Taitetaan kuva katkoviivaa pitkin.'
      : t < T1 ? 'Toinen puolikas kääntyy toisen päälle…'
      : t < dur - 1.6 ? (S.yes ? 'Puolikkaat osuvat täsmälleen päällekkäin: viiva on symmetria-akseli.' : 'Punaiset reunat jäävät yli: puolikkaat eivät osu päällekkäin. Viiva ei ole symmetria-akseli.')
      : 'Avataan taitos.',
  });
}
/** Each cell of the left half flies over the mirror line to the same distance on the other side. */
function mirrorScene(h: [number, number][], U = 26): AnimPaint {
  const cells = [...h].sort((a, b) => b[0] - a[0] || a[1] - b[1]), STEP = 1.1, t0 = 0.8, dur = t0 + cells.length * STEP + 1.6;
  const base = cellsArt(h).replace(/^<svg[^>]*>|<\/svg>$/g, '');
  const X = (c: number) => 4 + c * U, AX = X(3);
  return anim({
    dur, w: 6 * U + 8, h: 4 * U + 8, label: 'Peilaus',
    frame: (t) => {
      let s = base;
      const k = Math.floor((t - t0) / STEP);
      cells.forEach(([x, y], i) => {
        if (t < t0 + i * STEP) return;
        const f = ease(t, t0 + i * STEP + 0.3, t0 + i * STEP + 0.9), mx = 5 - x, d = 3 - x;
        const cx = X(x) + (X(mx) - X(x)) * f;
        if (i === k && t < t0 + (i + 1) * STEP) {
          s += `<rect x="${X(x)}" y="${4 + y * U}" width="${U}" height="${U}" fill="none" stroke="var(--sun)" stroke-width="3"/>`;
          s += `<path d="M${X(x) + U}  ${4 + y * U + U / 2}H${AX}" stroke="var(--blue)" stroke-width="3"/><text x="${(X(x) + U + AX) / 2}" y="${4 + y * U + U / 2 - 3}" text-anchor="middle" font-size="10" font-weight="900" fill="var(--blue)">${d}</text>`;
          if (f > 0) s += `<path d="M${AX} ${4 + y * U + U / 2}H${AX + (X(mx) - AX) * f}" stroke="#d9822b" stroke-width="3"/>`;
        }
        s += `<rect x="${cx}" y="${4 + y * U}" width="${U}" height="${U}" fill="var(--pond)" opacity="${f < 1 ? 0.6 : 1}" stroke="currentColor" stroke-opacity=".3"/>`;
      });
      return s + `<line x1="${AX}" y1="0" x2="${AX}" y2="${4 * U + 8}" stroke="var(--red)" stroke-width="3" stroke-dasharray="6 5"/>`;
    },
    caption: (t) => {
      if (t < t0) return 'Peilataan ruudut yksi kerrallaan viivan yli.';
      const k = Math.floor((t - t0) / STEP);
      if (k >= cells.length) return 'Valmis: jokaisella ruudulla on pari yhtä kaukana viivan toisella puolella.';
      const d = 3 - cells[k]![0];
      return `Ruutu on ${d} ${d === 1 ? 'ruudun' : 'ruudun'} päässä viivasta, joten peilikuva on ${d} ruudun päässä toisella puolella.`;
    },
  });
}

const SAFE: { q: string; right: string; wrong: string[]; why: string[]; hz?: Hazard }[] = [
  { q: 'Aava aikoo lämmittää vettä keittolevyllä tutkimusta varten. Mikä on turvallinen tapa?', right: 'Aikuinen on vieressä koko ajan', wrong: ['Aava kokeilee yksin, kun aikuinen on poissa', 'Aava koskee levyä, onko se jo kuuma'], why: ['Kuumien laitteiden kanssa aikuisen pitää olla mukana.', 'Kuumaa levyä ei kosketa: siitä saa palovamman.'], hz: 'levy' },
  { q: 'Tutkimuksessa käytetään nestettä, joka voi roiskua. Mitä laitetaan ensin?', right: 'Suojalasit silmille', wrong: ['Ei mitään, roiskeet kuivuvat', 'Aurinkolasit'], why: ['Silmät suojataan aina ennen kuin aloitetaan.', 'Aurinkolasit eivät suojaa roiskeilta.'] },
  { q: 'Lasipurkki putosi ja meni rikki. Mitä teet?', right: 'Kerron heti aikuiselle enkä koske sirpaleisiin', wrong: ['Keräilen sirpaleet käsin', 'Jatkan tutkimusta ja jätän sirpaleet lattialle'], why: ['Sirpaleet viiltävät. Aikuinen siivoaa ne turvallisesti.', 'Lattialla olevat sirpaleet ovat vaarallisia muille.'], hz: 'lasi' },
  { q: 'Pöydällä on tuntematon pullo. Mitä teet?', right: 'En haista enkä maista, vaan kysyn aikuiselta', wrong: ['Maistan vähän, mitä se on', 'Haistan suoraan pullon suulta'], why: ['Tuntematonta ainetta ei koskaan maisteta.', 'Tuntematonta ainetta ei haisteta suoraan.'], hz: 'pullo' },
  { q: 'Ohjeessa sanotaan: odota, kunnes opettaja antaa luvan aloittaa. Mitä teet?', right: 'Odotan lupaa ja kuuntelen ohjeen loppuun', wrong: ['Aloitan heti, koska osaan jo', 'Teen vain sen osan, joka näyttää kivalta'], why: ['Ohje kuunnellaan loppuun ennen aloittamista.', 'Ohjeen kaikki vaiheet tehdään.'] },
  { q: 'Pitkät hiukset voivat osua liekkiin tai laitteeseen. Mitä teet?', right: 'Sidon hiukset kiinni ennen työtä', wrong: ['Pidän hiuksia kädellä työn aikana', 'En tee mitään, kyllä ne pysyvät'], why: ['Kädet tarvitaan työhön.', 'Irtonaiset hiukset voivat syttyä tai tarttua.'] },
  { q: 'Vettä läikkyi lattialle sähköjohdon viereen. Mitä teet?', right: 'Kerron aikuiselle heti', wrong: ['Kuivaan veden johtoa siirtämällä', 'Jätän sen, se kuivuu itsestään'], why: ['Vesi ja sähkö ovat vaarallinen yhdistelmä: aikuinen hoitaa.', 'Märkä lattia on liukas ja vaarallinen.'], hz: 'vesi' },
];

const SAFE_OK = [
  { t: 'Sidon pitkät hiukset kiinni', w: 'Sidotut hiukset eivät osu liekkiin tai laitteeseen. Tämä on turvallista.' },
  { t: 'Laitan suojalasit', w: 'Suojalasit suojaavat silmiä. Tämä on turvallista.' },
  { t: 'Kerron aikuiselle, kun jotain sattuu', w: 'Aikuiselle kertominen on aina oikein. Tämä on turvallista.' },
  { t: 'Odotan luvan ennen aloittamista', w: 'Luvan odottaminen on turvallista.' },
  { t: 'Kuuntelen ohjeen loppuun', w: 'Kun kuuntelee koko ohjeen, tietää mitä tehdä. Tämä on turvallista.' },
];
const SAFE_BAD = [
  { t: 'Maistan tuntematonta ainetta', w: 'Tuntematon aine voi olla myrkyllistä. Tämä on vaarallista.' },
  { t: 'Kerään sirpaleet käsin', w: 'Sirpaleet viiltävät. Tämä on vaarallista.' },
  { t: 'Kosken keittolevyyn', w: 'Kuumasta levystä saa palovamman. Tämä on vaarallista.' },
  { t: 'Aloitan ennen kuin ohje loppuu', w: 'Kesken jäänyt ohje voi unohtaa tärkeän asian. Tämä on vaarallista.' },
  { t: 'Haistan suoraan pullon suulta', w: 'Tuntematonta ainetta ei haisteta suoraan. Tämä on vaarallista.' },
];

export const THINKING_NODES: NodeSpec[] = [
  // ============================================================ flat vs solid
  {
    id: 'M-GEO-01', rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV], stop: 'Litteä vai kappale?', icon: '🧊',
    goal: 'Opit erottamaan litteät tasokuviot ja tilaa vievät kappaleet.',
    intro: 'Aava tutkii kappaleita ja niiden tasaisia pohjia. Mallissa tasaisen pohjan muoto näkyy litteänä kuviona.',
    reward: 'Erotat litteät kuviot ja kappaleet!',
    demo: () => [
      { say: 'Pallo vie tilaa kolmessa suunnassa: se on kappale. Ympyrä on tasokuvio ilman paksuutta. Paperi on ohut kappale, mutta siihen piirrettyä kuviota tarkastellaan tasokuvion mallina.', scene: edgeScene('pallo', 'ympyra') },
      { say: 'Mallissa kuution tasainen pohja jättää neliön muotoisen jäljen. Kuution tasaiset pinnat ovat neliöitä. Kappaleella voi olla myös kaareva pinta, kuten pallolla.', scene: pressScene('kuutio') },
      { say: 'Mallissa tölkin tasaisen pohjan muoto on ympyrä. Tölkki on kappale, pohjan muoto on tasokuvio.', scene: pressScene('tolkki') },
    ],
    item: cases({
      solid: (r) => {
        const s = r.pick(SOLIDS), f = r.shuffle(SHAPE_KINDS).slice(0, 2);
        return {
          say: 'Mikä kuva esittää tilaa vievää kappaletta?',
          task: choose(r, art(SOLID[s]()), f.map((k) => art(shapeSvg(k as ShapeKind, r.pick(COLOR_NAMES)))), f.map((k) => `${SHAPE_NAME[k as ShapeKind][0][0]!.toUpperCase() + SHAPE_NAME[k as ShapeKind][0].slice(1)} esittää tasokuviota, jota tarkastellaan ilman paksuutta.`)),
          hint: 'Tarkastellaanko tilaa vievää esinettä vai sen pinnan muotoa? Kuvan varjostus auttaa hahmottamaan tilaa.',
          explain: `${SOLID_NAME[s][0]!.toUpperCase() + SOLID_NAME[s].slice(1)} on kappale. Litteät kuviot ovat kuin piirroksia.`,
        };
      },
      flat: (r) => {
        const f = r.pick(SHAPE_KINDS), ss = r.shuffle(SOLIDS).slice(0, 2);
        return {
          say: 'Mikä näistä on litteä tasokuvio?',
          task: choose(r, art(shapeSvg(f, r.pick(COLOR_NAMES))), ss.map((k) => art(SOLID[k]())), ss.map((k) => `${SOLID_NAME[k][0]!.toUpperCase() + SOLID_NAME[k].slice(1)} esittää kappaletta, jolla on pituutta, leveyttä ja korkeutta.`)),
          hint: 'Litteä kuvio on kuin piirros: sivulta katsottuna siitä näkyisi vain viiva.',
          explain: `${SHAPE_NAME[f][0][0]!.toUpperCase() + SHAPE_NAME[f][0].slice(1)} on litteä kuvio.`,
        };
      },
      print: (r) => {
        const s = r.pick(['kuutio', 'tolkki', 'kartio'] as SolidKind[]);
        const right = SOLID_PRINT[s];
        const others = SHAPE_KINDS.filter((k) => k !== right && k !== 'suorakulmio').slice(0, 2);
        const GEN = { kuutio: 'kuution', tolkki: 'tölkin', kartio: 'kartion' } as const;
        return {
          say: `Mallissa Aava painaa ${GEN[s as keyof typeof GEN]} tasaisen pohjan hiekkaan. Mikä on pohjan muoto?`,
          scene: pressScene(s, false),
          task: choose(r, art(shapeSvg(right, 'keltainen')), others.map((k) => art(shapeSvg(k, 'keltainen'))), others.map((k) => k === 'kolmio' ? 'Kolmiossa on kärjet. Katso, onko painetussa pinnassa kärkiä.' : k === 'nelio' ? 'Neliössä on neljä suoraa sivua. Onko painetussa pinnassa suoria sivuja?' : 'Ympyrä on pyöreä. Onko painettu pinta pyöreä?')),
          hint: 'Jälki on samanmuotoinen kuin se pinta, joka koskettaa hiekkaa.',
          explain: s === 'kuutio' ? 'Kuution jokainen pinta on neliö.' : `${s === 'tolkki' ? 'Tölkin' : 'Kartion'} pohja on ympyrä.`,
        };
      },
      sort: (r) => {
        const ss = r.shuffle(SOLIDS).slice(0, 3), fs = r.shuffle(SHAPE_KINDS).slice(0, 3);
        const all = r.shuffle([...ss.map((k) => ({ o: art(SOLID[k](52)), c: 0, why: `${SOLID_NAME[k][0]!.toUpperCase() + SOLID_NAME[k].slice(1)} esittää kappaletta, jolla on pituutta, leveyttä ja korkeutta.` })),
          ...fs.map((k) => ({ o: art(shapeSvg(k, r.pick(COLOR_NAMES), 48)), c: 1, why: `${SHAPE_NAME[k][0][0]!.toUpperCase() + SHAPE_NAME[k][0].slice(1)} on litteä kuvio, kuin piirros.` }))]);
        return {
          say: 'Lajittele: kappaleet yhteen laatikkoon, litteät kuviot toiseen.',
          task: { kind: 'sort' as const, items: all.map((x) => x.o), cats: [{ label: 'Kappaleet', art: SOLID.kuutio(34) }, { label: 'Litteät kuviot', art: shapeSvg('nelio', 'sininen', 30) }], answer: all.map((x) => x.c), why: all.map((x) => x.why) },
          hint: 'Voisiko sen nostaa käteen? Silloin se on kappale.',
          explain: 'Kappaleilla on paksuus, ja niitä voi pidellä. Litteät kuviot ovat kuin piirroksia paperilla.',
        };
      },
    }, (r) => {
      const n = r.int(3, 5);
      const objs = r.shuffle([...SOLIDS, ...SOLIDS]).slice(0, n);
      return {
        say: 'Montako kappaletta kuvassa on? Litteitä kuvioita ei lasketa.',
        scene: paint(`<div class="pics">${r.shuffle([...objs.map((k) => SOLID[k](44)), ...r.shuffle(SHAPE_KINDS).slice(0, 2).map((k) => shapeSvg(k, r.pick(COLOR_NAMES), 40))]).join('')}</div>`),
        task: pickNum(r, n, [n + 2, n - 1, n + 1], ['Laskit myös litteät kuviot. Ne eivät ole kappaleita.', 'Yksi kappale jäi laskematta.', 'Yksi liikaa: litteä kuvio ei ole kappale.']),
        hint: 'Laske kuvat, jotka esittävät tilaa vievää kappaletta.',
        explain: `Kappaleita on ${n}. Kaksi litteää kuviota ei ole kappaleita.`,
      };
    }),
  },
  // ============================================================ shapes
  {
    id: 'M-GEO-04', rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV], stop: 'Muotojen nimet', icon: '🔺',
    goal: 'Opit tunnistamaan kolmion, neliön, suorakulmion ja ympyrän, vaikka ne olisivat käännettyinä.',
    intro: 'Lautan purjeeseen ommellaan kuvioita. Niiden nimet pitää tietää.',
    reward: 'Tunnistat tasokuviot, käännettyinäkin!',
    demo: () => [
      { say: 'Kynä kiertää kolmion reunan. Se piirtää kolme suoraa sivua ja kääntyy kolmessa kulmassa.', scene: traceScene('kolmio', 'vihreä') },
      { say: 'Suorakulmiossa on neljä sivua ja neljä suoraa kulmaa. Neliö on suorakulmio, jonka kaikki sivut ovat yhtä pitkiä.', scene: traceScene('suorakulmio', 'keltainen') },
      { say: 'Ympyrää piirtäessä kynän suunta muuttuu tasaisesti ilman teräviä käännöksiä. Ympyrässä ei ole yhtään kulmaa.', scene: traceScene('ympyra', 'punainen') },
      { say: 'Kun neliötä käännetään, se näyttää vinolta. Sivut ja kulmat pysyvät samoina, joten se on yhä neliö.', scene: turnScene('nelio', 'sininen') },
    ],
    item: cases({
      find: (r) => {
        const k = r.pick(SHAPE_KINDS), rot = r.pick([0, 20, 45, 70]);
        // Inclusive: a square is also a rectangle, so it is never a wrong answer for "rectangle".
        const others = r.shuffle(notA(k)).slice(0, 2);
        return {
          say: `Missä on ${SHAPE_NAME[k][0]}?`,
          task: choose(r, art(describedShape(k, r.pick(COLOR_NAMES), 56, rot)), others.map((x) => art(describedShape(x, r.pick(COLOR_NAMES), 56, r.pick([0, 30])))), others.map((x) => `Tämä on ${SHAPE_NAME[x][0]}: siinä ${GEO_CORNER_TXT[x]}.`)),
          hint: `${INE[k]} ${GEO_CORNER_TXT[k]}. Kuvio voi olla käännettynä.`,
          explain: rot ? `${SHAPE_NAME[k][0][0]!.toUpperCase() + SHAPE_NAME[k][0].slice(1)} on käännetty, mutta se on yhä ${SHAPE_NAME[k][0]}.` : `Tämä on ${SHAPE_NAME[k][0]}.`,
        };
      },
      name: (r) => {
        const k = r.pick(SHAPE_KINDS);
        // A square picture is both "neliö" and "suorakulmio": offer only one of the two names.
        const others = r.shuffle(notA(k)).slice(0, 2);
        return {
          say: 'Mikä kuvio tämä on?',
          scene: paint(describedShape(k, r.pick(COLOR_NAMES), 90, r.pick([0, 15, 40]))),
          task: choose(r, t(SHAPE_NAME[k][0]), others.map((x) => t(SHAPE_NAME[x][0])), others.map((x) => `${INE[x]} ${GEO_CORNER_TXT[x]}. Tässä kuviossa ${GEO_CORNER_TXT[k]}.`)),
          hint: 'Laske kulmat. Ovatko sivut suoria?',
          explain: k === 'ympyra' ? 'Ympyrä on pyöreä, eikä siinä ole kulmia.' : k === 'kolmio' ? 'Kolme sivua ja kolme kulmaa: kolmio.' : k === 'nelio' ? 'Neljä yhtä pitkää sivua ja neljä suoraa kulmaa: neliö.' : 'Neljä suoraa kulmaa, vastakkaiset sivut yhtä pitkät: suorakulmio.',
        };
      },
      sort: (r) => {
        const kinds: ShapeKind[] = ['kolmio', 'nelio', 'ympyra'];
        const picks = r.shuffle([...kinds, ...kinds.map(() => r.pick(kinds))]);
        return {
          say: 'Lajittele kuviot: kolmiot, neliöt ja ympyrät omiin laatikoihinsa. Osa on käännetty!',
          task: {
            kind: 'sort' as const,
            items: picks.map((k) => art(describedShape(k, r.pick(COLOR_NAMES), r.pick([40, 48]), k === 'ympyra' ? 0 : r.pick([0, 20, 45, 65])))),
            cats: kinds.map((k) => ({ label: capF(SHAPE_NAME[k][1]), art: describedShape(k, 'sininen', 28) })),
            answer: picks.map((k) => kinds.indexOf(k)),
            why: picks.map((k) => `Tämä on ${SHAPE_NAME[k][0]}: siinä ${GEO_CORNER_TXT[k]}${k !== 'ympyra' ? ', vaikka se on käännetty' : ''}.`),
          },
          hint: 'Laske kulmat. Käännetty kuvio on yhä sama kuvio.',
          explain: 'Kolmiossa on kolme kulmaa, neliössä neljä yhtä pitkää sivua ja neljä suoraa kulmaa, ympyrässä ei kulmia. Kääntäminen ei muuta kuviota.',
        };
      },
      corners: (r) => {
        const k = r.pick(['kolmio', 'nelio', 'suorakulmio', 'ympyra'] as ShapeKind[]);
        const c = { kolmio: 3, nelio: 4, suorakulmio: 4, ympyra: 0 }[k];
        return {
          say: 'Montako kulmaa kuviossa on? Katso, kun kynä kiertää reunan.',
          scene: traceScene(k, r.pick(COLOR_NAMES), r.pick([0, 25]), false),
          task: pickNum(r, c, c === 0 ? [1, 2, 4] : [c + 1, c - 1, c === 3 ? 0 : 2], c === 0 ? ['Ympyrässä kynän suunta muuttuu tasaisesti ilman teräviä kulmia.', 'Ympyrän reuna on yhtä kaarta: siinä ei ole kulmia.', 'Ympyrässä ei ole sivuja eikä kulmia.'] : ['Laskitko jonkin kulman kahdesti? Aloituskulma lasketaan vain kerran.', 'Yksi kulma jäi laskematta.', `Kynän suunta muuttui terävästi ${word(c)} kohdassa. Nämä kohdat ovat kulmia.`]),
          hint: 'Kulmassa kynän suunta muuttuu terävästi. Tasainen kaari ei ole kulma.',
          explain: `${{ kolmio: 'Kolmiossa', nelio: 'Neliössä', suorakulmio: 'Suorakulmiossa', ympyra: 'Ympyrässä' }[k]} on ${c === 0 ? 'nolla kulmaa' : `${word(c)} kulmaa`}.`,
        };
      },
    }, (r) => {
      const open = r.chance(0.5);
      const odd = open
        ? svg(68, 68, '<path d="M34 6 L64 60 L4 60 L28 16" fill="none" stroke="currentColor" stroke-width="3"/>', 'avoin kuvio')
        : svg(68, 68, '<path d="M34 6 Q70 40 64 60 L4 60Z" fill="var(--pond)" stroke="currentColor" stroke-width="2"/>', 'kaareva sivu');
      return {
        say: 'Mikä näistä ei ole kolmio?',
        task: choose(r, art(odd), [art(describedShape('kolmio', 'vihreä', 56, 30)), art(svg(68, 68, '<path d="M6 60 L64 60 L60 8Z" fill="var(--sun)" stroke="currentColor" stroke-width="2"/>', 'Suljettu reuna, kolme suoraa sivua ja kolme kulmaa'))], ['Tämä on kolmio, vaikka se on käännetty.', 'Tämä on kolmio, vaikka se on kapea.']),
        hint: 'Kolmiossa on kolme suoraa sivua, ja reuna on kokonaan kiinni.',
        explain: open ? 'Kolmio on suljettu: sen reuna ei saa jäädä auki.' : 'Kolmion sivut ovat suoria. Kaareva sivu ei käy.',
      };
    }),
  },
  // ============================================================ mirror symmetry
  {
    id: 'M-SYM-01', stop: 'Jääpeili', icon: '🪞',
    goal: 'Opit tunnistamaan, onko viiva kuvion symmetria-akseli, ja tekemään peilikuvan.',
    intro: 'Jäälahden pinta on kuin peili. Peilikuva on yhtä kaukana peilistä kuin alkuperäinen.',
    reward: 'Tunnistat symmetrian ja teet peilikuvia!',
    rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV],
    demo: () => [
      { say: 'Jos kuvion voi taittaa viivaa pitkin niin, että puolikkaat menevät täsmälleen päällekkäin, viiva on symmetria-akseli.', scene: foldScene(0) },
      { say: 'Tämä suorakulmio ei ole neliö. Sen lävistäjä ei ole symmetria-akseli. Taita ja katso: kulmat eivät osu päällekkäin.', scene: foldScene(1) },
      { say: 'Neliössä lävistäjä kelpaa: taitettaessa puolikkaat osuvat päällekkäin.', scene: foldScene(2) },
      { say: 'Peilikuvassa jokainen ruutu on yhtä kaukana peiliviivasta, mutta toisella puolella.', scene: mirrorScene([[2, 0], [1, 1], [2, 1], [2, 2], [0, 2]]) },
    ],
    item: cases({
      axis: (r) => {
        const i = r.int(0, SYMS.length - 1), s = SYMS[i]!;
        return {
          say: 'Onko katkoviiva symmetria-akseli?',
          scene: paint(symArt(i)),
          task: YESNO(s.yes, s.why, s.why),
          hint: 'Kuvittele, että taitat kuvan viivaa pitkin.',
          explain: s.why,
        };
      },
      grid: (r) => {
        const h = halfShape(r), ok = r.chance(0.5);
        let other = mirror(h);
        if (!ok) { const i = r.int(0, other.length - 1); const [x, y] = other[i]!; const moved: [number, number] = [x === 5 ? 4 : x + 1, y]; other = other.filter((_, j) => j !== i); if (!other.some((p) => p[0] === moved[0] && p[1] === moved[1]) && !h.some((p) => p[0] === moved[0] && p[1] === moved[1])) other.push(moved); else other.push([5, (y + 2) % 4]); }
        const same = ok || JSON.stringify([...other].sort()) === JSON.stringify([...mirror(h)].sort());
        return {
          say: 'Onko kuva symmetrinen punaisen viivan suhteen?',
          scene: paint(cellsArt([...h, ...other])),
          task: YESNO(same, 'Jokaisella ruudulla on peilikuva toisella puolella yhtä kaukana viivasta.', 'Yksi ruutu ei ole peilikuvan paikalla.'),
          hint: 'Käy rivit läpi: onko jokaisella ruudulla pari yhtä kaukana viivan toisella puolella?',
          explain: same ? 'Jokaisella ruudulla on pari toisella puolella yhtä kaukana viivasta.' : 'Kaikilla ruuduilla ei ole paria yhtä kaukana viivan toisella puolella.',
        };
      },
      complete: (r) => {
        const h = halfShape(r);
        const key = (c: [number, number][]) => JSON.stringify([...c].sort((a, b) => a[0] - b[0] || a[1] - b[1]));
        const right = [...h, ...mirror(h)];
        const wrong = [[...h, ...shift(h)], [...h, ...mirror(h).slice(1)]].filter((w) => key(w) !== key(right));
        return {
          say: 'Missä kuvassa vasen puoli on peilattu oikein viivan yli?',
          task: choose(r, art(cellsArt(right)), wrong.map((w) => art(cellsArt(w))), wrong.length === 2 ? ['Puolikas on siirretty, ei peilattu. Peilikuvassa viivan vieressä oleva ruutu pysyy viivan vieressä.', 'Peilikuvasta puuttuu ruutu.'] : ['Peilikuvasta puuttuu ruutu.']),
          hint: 'Viivan vieressä olevan ruudun peilikuva on myös viivan vieressä.',
          explain: 'Peilikuvassa viivan vieressä oleva ruutu pysyy viivan vieressä, ja kauimmainen pysyy kauimpana.',
        };
      },
      paint: (r) => {
        const h = halfShape(r), want = mirror(h);
        const opts = Array.from({ length: 12 }, (_, i) => [3 + (i % 3), Math.floor(i / 3)] as [number, number]);
        const on = (c: [number, number]) => want.some(([x, y]) => x === c[0] && y === c[1]);
        const sq = (edge: boolean) => svg(40, 40, '<rect x="3" y="3" width="34" height="34" rx="4" fill="var(--card)" stroke="currentColor" stroke-opacity=".4"/>' + (edge ? '<line x1="1.5" y1="0" x2="1.5" y2="40" stroke="var(--red)" stroke-width="3" stroke-dasharray="6 5"/>' : '')).replace('width="100%"', 'width="40"');
        return {
          say: 'Maalaa peilikuva. Alla on viivan oikea puoli: napauta ne ruudut, jotka tarvitaan.',
          scene: paint(cellsArt(h)),
          task: {
            kind: 'multi' as const, cols: 3,
            options: opts.map(([x]) => ({ art: sq(x === 3) })),
            answer: opts.map((c, i) => (on(c) ? i : -1)).filter((i) => i >= 0),
            why: opts.map(([x, y]) => { const d = x - 2, row = ['ylimmällä', 'toisella', 'kolmannella', 'alimmalla'][y]; return on([x, y]) ? `${capF(row!)} rivillä vasemmalla on ruutu ${d} ruudun päässä viivasta: sen peilikuva puuttuu.` : `${capF(row!)} rivillä vasemmalla ei ole ruutua ${d} ruudun päässä viivasta, joten tätä ei maalata.`; }),
          },
          hint: 'Rivi kerrallaan: laske, montako ruutua vasen ruutu on viivasta, ja laske sama määrä oikealle.',
          explain: 'Jokainen vasemman puolen ruutu saa parin yhtä kauas viivan oikealle puolelle samalle riville.',
        };
      },
    }, (r) => {
      const m = 4, x = r.int(1, 3), y = r.int(1, 5), x2 = 2 * m - x;
      return {
        say: `Peiliviiva kulkee kohdassa x = ${m}. Merkitse pisteen (${x}, ${y}) peilikuva.`,
        scene: paint(gridArt({ xMax: 8, yMax: 6, sea: false, pins: [{ x, y, icon: 'dot', label: 'A' }], lines: [{ pts: [[m, 0], [m, 6]], color: 'var(--red)' }] })),
        task: { kind: 'plot', xs: [x2], ys: [y], xMax: 8, yMax: 6, xStep: 1, yStep: 1, xLabel: 'x', yLabel: 'y' },
        hint: 'Laske askeleet pisteestä viivalle. Jatka yhtä monta askelta viivan yli. Korkeus ei muutu.',
        explain: `Piste A on ${m - x} askelta viivan vasemmalla puolella. Peilikuva on ${m - x} askelta oikealla: (${x2}, ${y}).`,
      };
    }),
  },
  // ============================================================ classifying
  {
    id: 'M-TH-02', rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV], stop: 'Lajittelulaatikot', icon: '🗃️',
    goal: 'Opit lajittelemaan asioita annetun ominaisuuden mukaan.',
    intro: 'Rannalta löytyi kasa kuvioita. Ne lajitellaan laatikoihin ohjeen mukaan.',
    reward: 'Lajittelet ohjeen mukaan, vaikka muut ominaisuudet hämäävät!',
    demo: () => [
      { say: 'Ohje sanoo: punaiset yhteen laatikkoon. Jokaiselta kuviolta kysytään vain: onko se punainen? Muoto ei ratkaise.', scene: sortScene(PILE, ['Punaiset', 'Muut'], (i) => (PILE[i]!.c === 'punainen' ? 0 : 1), (i) => `${capF(PILE[i]!.c)} ${SHAPE_NAME[PILE[i]!.k][0]}: onko se punainen? ${PILE[i]!.c === 'punainen' ? 'Kyllä.' : 'Ei.'}`, 'Kaikki punaiset ovat samassa laatikossa, vaikka muodot ovat erilaisia.') },
      { say: 'Sama kasa, uusi ohje: kolmiot yhteen laatikkoon. Nyt kysytään vain: onko se kolmio? Väri ei ratkaise.', scene: sortScene(PILE, ['Kolmiot', 'Muut'], (i) => (PILE[i]!.k === 'kolmio' ? 0 : 1), (i) => `${capF(PILE[i]!.c)} ${SHAPE_NAME[PILE[i]!.k][0]}: onko se kolmio? ${PILE[i]!.k === 'kolmio' ? 'Kyllä.' : 'Ei.'}`, 'Sama kasa, eri sääntö: nyt laatikoissa on eri kuviot.') },
    ],
    item: cases({
      color: (r) => {
        const c = r.pick(COLOR_NAMES);
        const items = Array.from({ length: 6 }, (_, i) => ({ k: r.pick(SHAPE_KINDS), c: i < 2 + r.int(0, 1) ? c : r.pick(COLOR_NAMES.filter((x) => x !== c)) }));
        const sh = r.shuffle(items);
        return {
          say: `Valitse kaikki ${COLOR_PL[c]} kuviot.`,
          task: { kind: 'multi', options: sh.map((x) => art(classifiedShape(x.k, x.c, 44))), answer: sh.map((x, i) => (x.c === c ? i : -1)).filter((i) => i >= 0), cols: 3, why: sh.map((x) => (x.c === c ? `Tämä ${SHAPE_NAME[x.k][0]} on ${x.c}. Valitse sekin: muoto ei ratkaise.` : `Tämä on ${x.c}, ei ${c}. Vain väri ratkaisee.`)) },
          hint: 'Katso vain väriä. Muoto ei ratkaise.',
          explain: `Väri ratkaisee: ${COLOR_PL[c]} kuviot kuuluvat samaan laatikkoon, olipa muoto mikä tahansa.`,
        };
      },
      shape: (r) => {
        const k = r.pick(SHAPE_KINDS);
        const items = Array.from({ length: 6 }, (_, i) => ({ k: i < 2 + r.int(0, 1) ? k : r.pick(SHAPE_KINDS.filter((x) => x !== k)), c: r.pick(COLOR_NAMES) }));
        const sh = r.shuffle(items);
        // Membership is inclusive and derived per picture: squares are rectangles too.
        const square = k === 'suorakulmio' && sh.some((x) => x.k === 'nelio');
        return {
          say: `Valitse kaikki ${SHAPE_NAME[k][1]}.`,
          task: { kind: 'multi', options: sh.map((x, i) => art(classifiedShape(x.k, x.c, 44, i % 2 ? 20 : 0))), answer: sh.map((x, i) => (isA(x.k, k) ? i : -1)).filter((i) => i >= 0), cols: 3, why: sh.map((x) => (isA(x.k, k) ? (x.k === k ? `Tämä on ${SHAPE_NAME[k][0]}. Valitse sekin: väri ja asento eivät ratkaise.` : 'Neliökin on suorakulmio: siinä on neljä suoraa kulmaa. Valitse sekin.') : `Tämä on ${SHAPE_NAME[x.k][0]}, ei ${SHAPE_NAME[k][0]}. Vain muoto ratkaisee.`)) },
          hint: 'Katso vain muotoa. Väri ja asento eivät ratkaise.',
          explain: `Muoto ratkaisee: kaikki ${SHAPE_NAME[k][1]} kuuluvat samaan laatikkoon, olipa väri mikä tahansa.${square ? ' Neliökin on suorakulmio: siinä on neljä suoraa kulmaa.' : ''}`,
        };
      },
      boxes: (r) => {
        const cs = r.shuffle(COLOR_NAMES).slice(0, 3) as ColorName[];
        const pile = r.shuffle([...cs, ...cs.map(() => r.pick(cs))].map((c) => ({ k: r.pick(SHAPE_KINDS), c })));
        return {
          say: 'Lajittele kuviot värin mukaan: jokainen väri omaan laatikkoonsa.',
          task: { kind: 'sort' as const, items: pile.map((x) => art(classifiedShape(x.k, x.c, 46))), cats: cs.map((c) => ({ label: capF(COLOR_PL[c]), art: swatch(c) })), answer: pile.map((x) => cs.indexOf(x.c)), why: pile.map((x) => `Tämä ${SHAPE_NAME[x.k][0]} on ${x.c}. Muoto ei ratkaise, vain väri.`) },
          hint: 'Katso vain väriä. Saman väriset menevät samaan laatikkoon.',
          explain: 'Väri ratkaisee: muoto ei vaikuta siihen, mihin laatikkoon kuvio kuuluu.',
        };
      },
      rule: (r) => {
        const byColor = r.chance(0.5), c = r.pick(COLOR_NAMES), k = r.pick(['kolmio', 'ympyra'] as ShapeKind[]);
        // three that match the rule and three that do not; the other property is random, so it can mislead
        const pile = Array.from({ length: 6 }, (_, i) => byColor
          ? { k: r.pick(SHAPE_KINDS), c: i < 3 ? c : r.pick(COLOR_NAMES.filter((x) => x !== c)) }
          : { k: i < 3 ? k : r.pick(SHAPE_KINDS.filter((x) => x !== k)), c: r.pick(COLOR_NAMES) });
        const sh = r.shuffle(pile), inA = (x: { k: ShapeKind; c: ColorName }) => (byColor ? x.c === c : x.k === k);
        const label = byColor ? capF(COLOR_PL[c]) : capF(SHAPE_NAME[k][1]);
        return {
          say: `Ohje: ${byColor ? COLOR_PL[c] : SHAPE_NAME[k][1]} yhteen laatikkoon, kaikki muut toiseen.`,
          task: { kind: 'sort' as const, items: sh.map((x) => art(classifiedShape(x.k, x.c, 46))), cats: [{ label, art: byColor ? swatch(c) : classifiedShape(k, 'sininen', 28) }, { label: 'Muut' }], answer: sh.map((x) => (inA(x) ? 0 : 1)),
            why: sh.map((x) => (byColor ? `Tämä on ${x.c}. ${x.c === c ? `Se kuuluu laatikkoon ”${label}”, vaikka on ${SHAPE_NAME[x.k][0]}.` : 'Se ei ole oikean värinen, joten se kuuluu muihin, vaikka muoto olisi sama.'}` : `Tämä on ${SHAPE_NAME[x.k][0]}. ${x.k === k ? `Väri ei ratkaise: se kuuluu laatikkoon ”${label}”.` : 'Se kuuluu muihin, vaikka väri olisi sama.'}`)) },
          hint: byColor ? `Kysy jokaiselta: onko se ${c}?` : `Kysy jokaiselta: onko se ${SHAPE_NAME[k][0]}?`,
          explain: byColor ? 'Vain väri ratkaisee, muoto ei.' : 'Vain muoto ratkaisee, väri ei.',
        };
      },
      odd: (r) => {
        const c = r.pick(COLOR_NAMES), k = r.pick(SHAPE_KINDS), oc = r.pick(COLOR_NAMES.filter((x) => x !== c));
        return {
          say: 'Laatikkoon lajiteltiin saman värisiä kuvioita. Mikä ei kuulu joukkoon?',
          task: choose(r, art(classifiedShape(k, oc, 50)), r.shuffle(SHAPE_KINDS.filter((x) => x !== k)).slice(0, 3).map((x) => art(classifiedShape(x, c, 50))), [0, 1, 2].map(() => `Tämä on ${c}, kuten muutkin. Muoto ei ratkaise, sillä laatikko lajiteltiin värin mukaan.`), 4),
          hint: 'Mikä väri on melkein kaikilla?',
          explain: `Muut ovat ${COLOR_PL[c]}. Tämä on eri värinen.`,
        };
      },
    }, (r) => {
      const byColor = r.chance(0.5), c = r.pick(COLOR_NAMES), k = r.pick(SHAPE_KINDS);
      // Sizes always differ, so "same size" is never also a true rule; a colour box never
      // mixes a square and a rectangle (a square is a rectangle, which would blur "shape").
      const sizes = r.shuffle([32, 44, 56]);
      const kinds = r.shuffle(['kolmio', 'ympyra', r.pick(['nelio', 'suorakulmio'])] as ShapeKind[]);
      const row = byColor
        ? kinds.map((x, i) => ({ kind: x, color: c, size: sizes[i]! }))
        : r.shuffle(COLOR_NAMES).slice(0, 3).map((x, i) => ({ kind: k, color: x, size: sizes[i]!, rot: i * 20 }));
      return {
        say: 'Millä säännöllä tämän laatikon kuviot on lajiteltu?',
        scene: paint(`<div class="shape-row">${shapeRow(row).replace(/aria-label="[^"]*"/, `aria-label="${row.map(x => `${x.color}; ${SHAPE_DESCRIPTION[x.kind]}; ${x.size === 32 ? 'pieni' : x.size === 56 ? 'suuri' : 'keskikokoinen'} kuvio`).join('; seuraava: ')}"`)}</div>`),
        task: choose(r, t(byColor ? 'Saman värisiä' : 'Saman muotoisia'), [t(byColor ? 'Saman muotoisia' : 'Saman värisiä'), t('Saman kokoisia')], [byColor ? 'Muodot ovat erilaisia.' : 'Värit ovat erilaisia.', 'Kuviot ovat erikokoisia.']),
        hint: 'Mikä on kaikilla kuvioilla sama: väri, muoto vai koko?',
        explain: byColor ? `Kaikki ovat ${COLOR_PL[c]}, mutta muodot vaihtelevat.` : `Kaikki ovat ${SHAPE_NAME[k][1]}, mutta värit vaihtelevat.`,
      };
    }),
  },
  // ============================================================ ordering
  {
    id: 'M-TH-03', stop: 'Jonoon järjestys', icon: '📏', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit järjestämään asioita annetun ominaisuuden mukaan.',
    intro: 'Kepit ja luvut laitetaan jonoon: lyhyimmästä pisimpään tai pienimmästä suurimpaan.',
    reward: 'Järjestät asiat jonoon sääntöä noudattaen!',
    demo: () => [
      { say: 'Järjestetään kepit lyhyimmästä pisimpään. Katsotaan jokainen jäljellä oleva keppi, löydetään lyhyin ja siirretään se seuraavalle paikalle.', scene: orderScene([5, 8, 3, 6]) },
      { say: 'Luvuilla sama keino: etsitään pienin jäljellä olevista ja laitetaan se seuraavaksi.', scene: orderScene([27, 9, 31, 14], { labels: ['27', '9', '31', '14'], unit: 4 }) },
      { say: 'Suurimmasta pienimpään on toisin päin: etsitään joka kerta suurin.', scene: orderScene([12, 30, 7], { labels: ['12', '30', '7'], unit: 4, down: true }) },
    ],
    item: cases({
      sticks: (r) => {
        const ls = r.shuffle([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
        const sorted = [...ls].sort((a, b) => a - b);
        return {
          say: 'Laita kepit järjestykseen lyhyimmästä pisimpään.',
          task: { kind: 'place', slots: [{ id: 's1', text: '1. lyhyin' }, { id: 's2', text: '2.' }, { id: 's3', text: '3. pisin' }], tokens: ls.map((l) => ({ id: `k${l}`, art: stick(l, '#8a5a33', 9) })), answer: { s1: `k${sorted[0]}`, s2: `k${sorted[1]}`, s3: `k${sorted[2]}` },
            why: { s1: 'Ensimmäiselle paikalle kuuluu lyhyin keppi. Katso, minkä kepin pää loppuu aikaisimmin.', s2: 'Toiselle paikalle tulee keppi, joka on pidempi kuin lyhyin mutta lyhyempi kuin pisin.', s3: 'Viimeiselle paikalle kuuluu pisin keppi.' } },
          hint: 'Etsi ensin lyhyin keppi. Sitten lyhyin niistä, jotka jäivät.',
          explain: 'Lyhyin ensin, sitten keskimmäinen ja lopuksi pisin. Kepit nousevat kuin portaat.',
        };
      },
      numbers: (r) => {
        const ns = r.shuffle(Array.from({ length: 40 }, (_, i) => i + 1)).slice(0, 4);
        const down = r.chance(0.4);
        const sorted = [...ns].sort((a, b) => (down ? b - a : a - b));
        return {
          say: down ? 'Järjestä luvut suurimmasta pienimpään.' : 'Järjestä luvut pienimmästä suurimpaan.',
          task: { kind: 'place', slots: sorted.map((_, i) => ({ id: `p${i}`, text: `${i + 1}.` })), tokens: ns.map((n) => ({ id: `n${n}`, text: String(n) })), answer: Object.fromEntries(sorted.map((n, i) => [`p${i}`, `n${n}`])),
            why: Object.fromEntries(sorted.map((n, i) => [`p${i}`, i === 0 ? `Ensimmäiseksi tulee ${down ? 'suurin' : 'pienin'} luku: ${n}.` : `Paikalle ${i + 1} kuuluu ${n}. Se tulee luvun ${sorted[i - 1]} jälkeen, koska ${n} on ${down ? 'pienempi' : 'suurempi'}.`])) },
          hint: down ? 'Etsi suurin luku. Vertaa ensin kymmeniä, sitten ykkösiä.' : 'Etsi pienin luku. Vertaa ensin kymmeniä, sitten ykkösiä.',
          explain: `${down ? 'Suurimmasta pienimpään' : 'Pienimmästä suurimpaan'}: ${sorted.join(', ')}.`,
        };
      },
      middle: (r) => {
        const ls = r.shuffle([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
        const [lo, mid, hi] = [...ls].sort((a, b) => a - b) as [number, number, number];
        return {
          say: 'Mikä keppi on keskimmäinen, kun kepit järjestetään pituuden mukaan?',
          task: choose(r, art(stick(mid, '#8a5a33', 9)), [art(stick(lo, '#8a5a33', 9)), art(stick(hi, '#8a5a33', 9))], ['Tämä on lyhyin, se tulisi jonossa ensimmäiseksi.', 'Tämä on pisin, se tulisi jonossa viimeiseksi.'], 1),
          hint: 'Ajattele jono: lyhyin alkuun, pisin loppuun. Mikä jää väliin?',
          explain: 'Keskimmäinen on pidempi kuin lyhyin mutta lyhyempi kuin pisin.',
        };
      },
      fix: (r) => {
        const ns = r.shuffle(Array.from({ length: 30 }, (_, i) => i + 2)).slice(0, 4).sort((a, b) => a - b);
        const k = r.int(0, 2), wrong = [...ns];
        [wrong[k], wrong[k + 1]] = [wrong[k + 1]!, wrong[k]!];
        const slots = ns.map((_, i) => ({ id: `p${i}`, text: `${i + 1}.` }));
        return {
          say: 'Aava järjesti luvut pienimmästä suurimpaan, mutta kaksi lukua meni väärin päin. Korjaa jono.',
          task: { kind: 'place', slots, tokens: ns.map((n) => ({ id: `n${n}`, text: String(n) })), start: Object.fromEntries(wrong.map((n, i) => [`p${i}`, `n${n}`])), answer: Object.fromEntries(ns.map((n, i) => [`p${i}`, `n${n}`])),
            why: Object.fromEntries(ns.map((n, i) => [`p${i}`, i === k || i === k + 1 ? `${ns[k + 1]} on suurempi kuin ${ns[k]}, joten ${ns[k]} tulee ennen lukua ${ns[k + 1]}.` : `Paikalle ${i + 1} kuuluu ${n}. Siirrä vain väärin päin olevat.`])) },
          hint: 'Kulje jono läpi vasemmalta. Jokaisen luvun pitää olla suurempi kuin edellinen.',
          explain: `${ns[k + 1]} ja ${ns[k]} olivat väärin päin. Oikein: ${ns.join(', ')}.`,
        };
      },
    }, (r) => {
      const ages = r.shuffle([3, 5, 7, 9]).slice(0, 3), names = ['Loikka', 'Aava', 'Sulka'];
      const sorted = names.map((n, i) => ({ n, a: ages[i]! })).sort((a, b) => a.a - b.a);
      return {
        say: `Loikka on ${ages[0]}-vuotias, Aava ${ages[1]}-vuotias ja Sulka ${ages[2]}-vuotias. Järjestä nuorimmasta vanhimpaan.`,
        task: { kind: 'place', slots: [{ id: 'a', text: '1. nuorin' }, { id: 'b', text: '2.' }, { id: 'c', text: '3. vanhin' }], tokens: names.map((n) => ({ id: n, text: n })), answer: { a: sorted[0]!.n, b: sorted[1]!.n, c: sorted[2]!.n } },
        hint: 'Nuorin on se, jolla on vähiten vuosia.',
        explain: 'Nuorimmasta vanhimpaan: ' + sorted.map((s) => `${s.n} ${s.a} v`).join(', ') + '.',
      };
    }),
  },
  // ============================================================ patterns
  {
    id: 'M-TH-04', stop: 'Toistuvat kuviot', icon: '🔁', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit huomaamaan, miten kuvio toistuu tai kasvaa, ja jatkamaan sitä.',
    intro: 'Aava tekee rannalle kivi- ja simpukkarivejä. Mikä tulee seuraavaksi?',
    reward: 'Löydät säännön ja jatkat kuviota!',
    demo: () => [
      { say: 'Tämä kuvio toistuu: kolmio, ympyrä, ympyrä. Sitten taas kolmio, ympyrä, ympyrä. Kun osa on valmis, aletaan alusta.', scene: patternScene((['kolmio', 'ympyra', 'ympyra', 'kolmio', 'ympyra', 'ympyra'] as ShapeKind[]).map((k) => ({ k, c: PAT_COL[k] })), 3, { k: 'kolmio', c: PAT_COL.kolmio }) },
      { say: 'Jos osa on kesken, katso mihin kohtaan osaa jäätiin.', scene: patternScene((['nelio', 'kolmio', 'ympyra', 'nelio', 'kolmio', 'ympyra', 'nelio'] as ShapeKind[]).map((k) => ({ k, c: PAT_COL[k] })), 3, { k: 'kolmio', c: PAT_COL.kolmio }) },
      { say: 'Tämä kuvio kasvaa: jokainen kuva on edellinen ja kaksi uutta pistettä.', scene: growScene(2, 2) },
    ],
    item: cases({
      repeat: (r) => {
        const unit = r.pick(PAT_UNITS);
        const col = PAT_COL;
        const len = unit.length * 2 + r.int(0, unit.length - 1);
        const seq = Array.from({ length: len }, (_, i) => unit[i % unit.length]!);
        const next = unit[len % unit.length]!, ut = unit.map((k) => SHAPE_NAME[k][0]).join(', ');
        const others = SHAPE_KINDS.filter((k) => k !== next && k !== 'suorakulmio').slice(0, 2);
        return {
          say: 'Mikä kuvio tulee seuraavaksi?',
          scene: patternScene(seq.map((k) => ({ k, c: col[k] })), unit.length, { k: next, c: col[next] }, false),
          task: choose(r, art(shapeSvg(next, col[next], 50)), others.map((k) => art(shapeSvg(k, col[k], 50))), others.map((k) => unit.includes(k) ? `${capF(SHAPE_NAME[k][0])} on kuviossa, mutta ei vielä tällä kohtaa. Toistuva osa on ${ut}.` : `${capF(SHAPE_NAME[k][0])} ei kuulu kuvioon ollenkaan. Toistuva osa on ${ut}.`)),
          hint: 'Etsi osa, joka toistuu. Katso sitten, mihin kohtaan osaa rivi jäi.',
          explain: `Toistuva osa on ${ut}. Seuraavaksi tulee ${SHAPE_NAME[next][0]}.`,
        };
      },
      extend: (r) => {
        const unit = r.pick(PAT_UNITS), u = unit.length, len = u * 2 + r.int(0, u - 1);
        const kinds = [...new Set(unit)], extra = SHAPE_KINDS.find((k) => !kinds.includes(k) && k !== 'suorakulmio') ?? 'suorakulmio';
        const pal = r.shuffle([...kinds, extra]), ut = unit.map((k) => SHAPE_NAME[k][0]).join(', ');
        const opt = (k: ShapeKind): Option => ({ art: shapeSvg(k, PAT_COL[k], 40), quiet: SHAPE_NAME[k][0] });
        const want = [0, 1, 2].map((j) => unit[(len + j) % u]!);
        return {
          say: 'Jatka Aavan kuviota kolmella kuvalla.',
          task: { kind: 'extend', shown: Array.from({ length: len }, (_, i) => opt(unit[i % u]!)), palette: pal.map(opt), answer: want.map((k) => pal.indexOf(k)),
            why: want.map((k, j) => `Paikalle ${j + 1} tulee ${SHAPE_NAME[k][0]}. Toistuva osa on ${ut}.`) },
          hint: 'Sano osa ääneen ja jatka siitä, mihin rivi jäi.',
          explain: `Toistuva osa on ${ut}. Rivi jatkuu: ${want.map((k) => SHAPE_NAME[k][0]).join(', ')}.`,
        };
      },
      grow: (r) => {
        const s = r.int(1, 5), d = r.int(2, 5);
        const seq = [0, 1, 2, 3].map((i) => s + i * d);
        return {
          say: `Mikä luku tulee seuraavaksi? ${seq.join(', ')}, …`,
          task: pickNum(r, s + 4 * d, [s + 4 * d + 1, seq[3]! + 1, s + 5 * d], [`Lähellä! Laske uudelleen: ${seq[3]} ja ${d} lisää.`, `Luvut eivät kasva yhdellä vaan ${d}.`, `Tämä on kahden askeleen päässä. Seuraava on vain ${d} enemmän kuin ${seq[3]}.`]),
          hint: 'Katso, paljonko luku kasvaa joka askeleella.',
          explain: `Joka kerta tulee ${d} lisää: ${seq[3]} + ${d} = ${s + 4 * d}.`,
        };
      },
      dots: (r) => {
        const d = r.int(2, 3), s = r.int(1, 3);
        return {
          say: 'Kuvio kasvaa. Montako pistettä on seuraavassa kuvassa?',
          scene: growScene(s, d, 3, false),
          task: pickNum(r, s + 3 * d, [s + 3 * d + 1, s + 2 * d + 1, s + 4 * d], [`Lähellä! Kolmannessa kuvassa on ${s + 2 * d}, ja siihen tulee ${d} lisää.`, `Kuvio ei kasva yhdellä vaan ${d} pisteellä.`, `Tämä on kahden kuvan päässä. Seuraavassa kuvassa tulee vain ${d} lisää.`]),
          hint: 'Katso keltaisia pisteitä: montako uutta tulee joka kuvaan?',
          explain: `Joka kuvassa tulee ${d} ${d === 1 ? 'piste' : 'pistettä'} lisää: ${s + 2 * d} + ${d} = ${s + 3 * d}.`,
        };
      },
    }, (r) => {
      const unit = ['A', 'B', 'B'];
      const len = 9, bad = r.int(3, 8);
      const seq = Array.from({ length: len }, (_, i) => unit[i % 3]!);
      seq[bad] = seq[bad] === 'A' ? 'B' : 'A';
      const shape = (c: string) => (c === 'A' ? shapeSvg('kolmio', 'vihreä', 30) : shapeSvg('ympyra', 'sininen', 30));
      return {
        say: 'Aava teki rivin, jossa toistuu kolmio, ympyrä, ympyrä. Monesko kuvio on väärin?',
        scene: paint(`<div class="pics">${seq.map(shape).join('')}</div>`),
        task: pickNum(r, bad + 1, [bad, bad + 2, 1], [`Kuvio ${bad} on oikein: se sopii osaan kolmio, ympyrä, ympyrä.`, `Kuvio ${bad + 2} on oikein. Väärä on juuri ennen sitä.`, 'Ensimmäinen kolmio aloittaa osan, se on oikein.'], { lo: 1, hi: 9 }),
        hint: 'Kulje rivi kolmen kuvan osissa: kolmio, ympyrä, ympyrä.',
        explain: `Kuvio numero ${bad + 1} rikkoo säännön: siinä pitäisi olla ${unit[bad % 3] === 'A' ? 'kolmio' : 'ympyrä'}.`,
      };
    }),
  },
  // ============================================================ noticing what matters
  {
    id: 'M-WORK-01', stop: 'Tarkka havainto', icon: '🔍', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit huomaamaan, mikä tieto on tärkeää laskemisen kannalta ja mikä ei.',
    intro: 'Aava kirjaa havaintoja. Kaikki tieto ei ole tärkeää: mitä kysymykseen vastaamiseen tarvitaan?',
    reward: 'Huomaat tärkeän tiedon ja jätät turhan pois!',
    demo: () => [
      { say: 'Loikalla on viisi marjaa ja sininen reppu. Aava antaa kolme marjaa lisää. Montako marjaa Loikalla on? Käydään tiedot läpi kysymys mielessä.', scene: sieveScene([
        { text: 'Loikalla on 5 marjaa.', keep: true, chip: '5', say: 'Viisi marjaa: tarvitaan, siitä lasku alkaa.' },
        { text: 'Loikan reppu on sininen.', keep: false, say: 'Repun väri ei muuta marjojen määrää. Ei tarvita.' },
        { text: 'Aava antaa 3 marjaa lisää.', keep: true, chip: '+ 3', say: 'Kolme marjaa lisää: tarvitaan, ne lisätään.' },
      ], 'Montako marjaa Loikalla on?', '5 + 3 = 8') },
      { say: 'Lukukin voi olla turha! Kysymys ratkaisee, mitä tarvitaan.', scene: sieveScene([
        { text: 'Rannalla on 6 kiveä.', keep: false, say: 'Kivien määrä ei kerro sammakoista. Luku, mutta ei tarvita.' },
        { text: 'Kivillä istuu 4 sammakkoa.', keep: true, chip: '4', say: 'Neljä sammakkoa: tarvitaan, siitä lasku alkaa.' },
        { text: 'Aurinko paistaa.', keep: false, say: 'Sää ei muuta sammakoiden määrää. Ei tarvita.' },
        { text: '2 sammakkoa hyppää veteen.', keep: true, chip: '− 2', say: 'Kaksi hyppää pois: tarvitaan, ne otetaan pois.' },
      ], 'Montako sammakkoa jää kiville?', '4 − 2 = 2') },
    ],
    item: cases({
      extra: (r) => {
        const a = r.int(3, 8), b = r.int(2, 6);
        const fluff = r.pick([['Loikan hattu on punainen', 'hatun väri'], ['Aava on seitsemänvuotias', 'Aavan ikä'], ['Päivä on aurinkoinen', 'sää']]);
        return {
          say: `Loikalla on ${a} käpyä. ${fluff[0]}. Aava antaa hänelle ${b} käpyä. Montako käpyä Loikalla on? Mitä tietoa ei tarvita?`,
          task: pickText(r, fluff[1]!, ['Loikan käpyjen määrä', 'annettujen käpyjen määrä'], [`Tämä tarvitaan: ${a} käpyä on laskun aloitusluku.`, `Tämä tarvitaan: ${b} käpyä lisätään.`]),
          hint: 'Lue kysymys ensin. Mikä tieto ei muuta käpyjen määrää?',
          explain: `Lasku on ${a} + ${b} = ${a + b}. ${fluff[1]![0]!.toUpperCase() + fluff[1]!.slice(1)} ei vaikuta siihen.`,
        };
      },
      need: (r) => {
        const which = r.pick(['enemmän', 'yhteensä'] as const);
        return {
          say: which === 'enemmän' ? 'Haluat tietää, kummalla kivellä on enemmän sammakoita. Mitä sinun pitää katsoa?' : 'Haluat tietää, montako sammakkoa kivillä on yhteensä. Mitä sinun pitää katsoa?',
          scene: paint(groupArt(r, 'kivi', 2, 'line', 120, 60, 40)),
          task: pickText(r, 'Sammakoiden määrä kummallakin kivellä', ['Kivien väri', 'Sammakoiden nimet'], ['Väri ei kerro sammakoiden määrää.', 'Nimet eivät kerro määrää.']),
          hint: 'Mikä tieto kertoo, montako sammakkoa on?',
          explain: which === 'enemmän' ? 'Määriä verrataan: kummallakin kivellä olevat sammakot lasketaan.' : 'Kummankin kiven sammakot lasketaan ja lasketaan yhteen.',
        };
      },
      notice: (r) => {
        const a = r.int(2, 5), b = a + r.int(1, 3);
        return {
          say: 'Mikä havainto kuvasta pitää paikkansa?',
          scene: paint(groupArt(r, 'kala', a, 'line', 150, 60, 26) + groupArt(r, 'kukka', b, 'line', 150, 60, 26)),
          task: pickText(r, `Kukkia on ${b - a} enemmän kuin kaloja`, [`Kaloja on ${b - a} enemmän kuin kukkia`, 'Kaloja ja kukkia on yhtä monta'], [`Väärin päin: kaloja on ${a} ja kukkia ${b}.`, `Laske molemmat: kaloja on ${a}, kukkia ${b}. Ne eivät ole yhtä monta.`]),
          hint: 'Laske ensin kalat, sitten kukat.',
          explain: `Kaloja on ${a}, kukkia ${b}. Kukkia on ${b - a} enemmän.`,
        };
      },
      sieve: (r) => {
        const a = r.int(4, 9), b = r.int(2, 3), k = r.int(3, 8), add = r.chance(0.5);
        const facts = [
          { text: `Loikalla on ${a} simpukkaa.`, keep: true, why: `${a} simpukkaa tarvitaan: siitä lasku alkaa.` },
          { text: add ? `Aava antaa Loikalle ${b} simpukkaa lisää.` : `Loikka antaa Aavalle ${b} simpukkaa.`, keep: true, why: add ? `${b} simpukkaa lisätään, joten tämä tarvitaan.` : `${b} simpukkaa lähtee pois, joten tämä tarvitaan.` },
          { text: `Rannalla on ${k} kiveä.`, keep: false, why: 'Kivien määrä ei muuta Loikan simpukoita. Luku, mutta ei tarvita.' },
          r.pick([{ text: 'Simpukat ovat valkoisia.', keep: false, why: 'Väri ei muuta määrää.' }, { text: 'Loikka on iloinen.', keep: false, why: 'Loikan mieliala ei muuta simpukoiden määrää.' }, { text: 'Tuulee kovasti.', keep: false, why: 'Sää ei muuta simpukoiden määrää.' }]),
        ];
        const order = r.shuffle([0, 1, 2, 3]);
        return {
          say: `Montako simpukkaa Loikalla on lopuksi? Lajittele tiedot: mitkä tarvitaan, mitkä eivät?`,
          task: { kind: 'sort', items: order.map((i) => ({ text: facts[i]!.text })), cats: [{ label: 'Tarvitaan' }, { label: 'Ei tarvita' }], answer: order.map((i) => (facts[i]!.keep ? 0 : 1)), why: order.map((i) => facts[i]!.why) },
          hint: 'Kysy jokaisesta tiedosta: muuttaako tämä Loikan simpukoiden määrää?',
          explain: `Tarvitaan vain simpukkatiedot: ${a} ${add ? '+' : '−'} ${b} = ${add ? a + b : a - b}. Kivet ja muut tiedot eivät vaikuta.`,
        };
      },
    }, (r) => {
      const n = r.int(3, 6), legs = 4;
      return {
        say: `Rannalla istuu ${word(n)} sammakkoa kiven päällä, ja aurinko paistaa. Haluat tietää, montako jalkaa sammakoilla on yhteensä. Mitä tietoa tarvitset?`,
        task: pickText(r, 'Sammakoiden määrä ja jalkojen määrä yhdellä sammakolla', ['Kiven koko ja sää', 'Pelkästään se, että aurinko paistaa'], ['Kivi ja sää eivät vaikuta jalkojen määrään.', 'Sää ei vaikuta jalkojen määrään.']),
        hint: 'Mikä tieto muuttaa jalkojen määrää?',
        explain: `Tarvitaan sammakoiden määrä (${n}) ja jalat yhdellä sammakolla (${legs}): ${Array(n).fill(legs).join(' + ')} = ${n * legs} jalkaa. Kivi ja sää eivät vaikuta.`,
      };
    }),
  },
  // ============================================================ writing ideas with symbols
  {
    id: 'M-REP-04', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Merkkikieli', icon: '✍️',
    goal: 'Opit kirjoittamaan tilanteen lyhyesti numeroilla ja merkeillä.',
    intro: 'Aava kirjoittaa vihkoon lyhyesti: numeroita ja merkkejä sanojen sijaan.',
    reward: 'Kirjoitat tilanteita merkkikielellä!',
    demo: () => [
      { say: 'Lammessa on kolme kalaa, ja kaksi ui lisää. Merkkikielellä: kolme plus kaksi on viisi.', scene: signScene('kala', 3, 2, '+') },
      { say: 'Loikalla on seitsemän kiveä ja Aavalla neljä. Pareja tehdessä Loikalle jää ylimääräisiä. Seitsemän on enemmän kuin neljä: merkin kärki osoittaa pienempää.', scene: pairScene('kivi', 7, 4, 'cmp') },
      { say: 'Lauseen voi kääntää merkeiksi pala kerrallaan. Viisi, on, kolme vähemmän kuin kahdeksan: viisi on yhtä kuin kahdeksan miinus kolme.', scene: translateScene([['viisi', '5'], ['on', '='], ['kahdeksan', '8'], ['kolme vähemmän', '− 3']]) },
    ],
    item: cases({
      add: (r) => {
        const a = r.int(2, 6), b = r.int(1, 4), k = r.pick(['marja', 'kala', 'simpukka']);
        return {
          say: 'Mikä merkintä kertoo kuvan tilanteen?',
          scene: signScene(k, a, b, '+', false),
          task: choose(r, ex(`${a} + ${b} = ${a + b}`), [ex(`${Math.max(a, b)} − ${Math.min(a, b)} = ${Math.abs(a - b)}`), ex(`${a} + ${b} = ${a + b + 1}`)], ['Kuvassa tulee lisää, ei lähde pois.', `Laske kaikki yhteen: ${a} ja ${b} on ${a + b}, ei ${a + b + 1}.`]),
          hint: 'Montako oli alussa? Montako tuli? Montako on nyt?',
          explain: `${a} ja ${b} lisää on ${a + b}: ${a} + ${b} = ${a + b}.`,
        };
      },
      compare: (r) => {
        const a = r.int(2, 9); let b = r.int(2, 9); if (b === a) b = a === 9 ? 8 : a + 1;
        return withItemReadiness('M-REP-04', {
          say: `Loikalla on ${a} kiveä, Aavalla ${b}. Mikä merkintä kertoo tämän, kun Loikan luku on ensin?`,
          scene: pairScene('kivi', a, b, false),
          task: choose(r, ex(`${a} ${a > b ? '>' : '<'} ${b}`), [ex(`${a} ${a > b ? '<' : '>'} ${b}`), ex(`${a} = ${b}`)], [`Merkin kärki osoittaa pienempää. Pienempi on ${Math.min(a, b)}.`, 'Määrät eivät ole yhtä suuret: kaikille ei löydy paria.']),
          hint: 'Kumpi on pienempi? Merkin kärki osoittaa sitä.',
          explain: `${a} ${a > b ? 'on suurempi kuin' : 'on pienempi kuin'} ${b}: ${a} ${a > b ? '>' : '<'} ${b}.`,
        }, { kind: 'content', skills: ['M-NUM-10'] });
      },
      words: (r) => {
        const a = r.int(5, 12), b = r.int(1, 4);
        const plus = r.chance(0.5);
        return withItemReadiness('M-REP-04', {
          say: plus ? `Kirjoita merkein: ${word(a + b)} on ${word(b)} enemmän kuin ${word(a)}.` : `Kirjoita merkein: ${word(a)} on ${word(b)} vähemmän kuin ${word(a + b)}.`,
          task: choose(r, ex(plus ? `${a + b} = ${a} + ${b}` : `${a} = ${a + b} − ${b}`), [ex(plus ? `${a + b} = ${a} − ${b}` : `${a} = ${a + b} + ${b}`), ex(plus ? `${a} = ${a + b} + ${b}` : `${a + b} = ${a} − ${b}`)],
            plus ? [`${a} − ${b} on ${a - b}, ei ${a + b}. "Enemmän kuin" lisää.`, `${a + b} + ${b} on ${a + b + b}, ei ${a}.`] : [`${a + b} + ${b} on ${a + b + b}, ei ${a}. "Vähemmän kuin" ottaa pois.`, `${a} − ${b} on ${a - b}, ei ${a + b}.`]),
          hint: plus ? `Kumpi on suurempi, ${a + b} vai ${a}? Paljonko pitää lisätä?` : `Kumpi on pienempi, ${a} vai ${a + b}? Paljonko otetaan pois?`,
          explain: plus ? `${a} + ${b} = ${a + b}.` : `${a + b} − ${b} = ${a}.`,
        }, { kind: 'content', skills: [plus ? 'M-ADD-01' : 'M-SUB-01', plus ? 'M-SYM-PLUS' : 'M-SYM-MINUS', 'M-SYM-EQUAL'] });
      },
      build: (r) => {
        const a = r.int(3, 8), b = r.int(1, 5), plus = r.chance(0.5), big = a + b;
        return withItemReadiness('M-REP-04', {
          say: plus ? `Kivellä istuu ${word(a)} sammakkoa, ja ${word(b)} hyppää viereen. Rakenna paloista lasku ja sen tulos.` : `Kivellä istui ${word(big)} sammakkoa, ja ${word(b)} hyppäsi pois. Rakenna paloista lasku ja sen tulos.`,
          task: { kind: 'build', mode: 'fact', target: plus ? `${a} + ${b} = ${big}` : `${big} − ${b} = ${a}`, tokens: [...new Set([a, b, big].sort((x, y) => x - y).map(String))].concat(['+', '−', '=']), max: 7 },
          hint: plus ? `Ensin ${a}, sitten + ${b}, sitten = ja montako on nyt.` : `Ensin ${big}, sitten − ${b}, sitten = ja montako jäi.`,
          explain: plus ? `${a} + ${b} = ${big}. Myös ${b} + ${a} = ${big} kelpaa.` : `${big} − ${b} = ${a}.`,
        }, { kind: 'content', skills: [plus ? 'M-ADD-01' : 'M-SUB-01', plus ? 'M-SYM-PLUS' : 'M-SYM-MINUS', 'M-SYM-EQUAL'] });
      },
    }, (r) => {
      const k = r.int(2, 4); let g = r.int(2, 5); if (g === k) g++;
      return {
        say: `Aava näkee ${k} riviä, joissa jokaisessa on ${g} simpukkaa. Mikä merkintä kertoo, montako simpukkaa on?`,
        scene: paint(arrayArt(k, g, 'simpukka')),
        task: choose(r, ex(`${k} × ${g} = ${k * g}`), [ex(`${k} + ${g} = ${k + g}`), ex(`${k} × ${g} = ${k * g + g}`)], ['Rivejä ei lasketa yhteen rivin pituuden kanssa.', 'Laske uudelleen: rivejä on ' + k + '.']),
        hint: `Rivejä on ${k}, ja jokaisessa on ${g}. Sama määrä monta kertaa: ×.`,
        explain: `${k} riviä, joissa ${g}: ${k} × ${g} = ${k * g}.`,
      };
    }),
  },
  // ============================================================ safety (virtual only)
  {
    id: 'SCI-ENV-SAFE-01', stop: 'Turvallinen tutkija', icon: '🦺', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit tunnistamaan turvallisen tavan toimia tutkimuksessa. Oikeita välineitä käytetään aina aikuisen kanssa.',
    intro: 'Ennen kuin Aava tutkii, hän kertaa turvaohjeet. Tässä harjoitellaan kuvista ja tarinoista: oikeat välineet otetaan käyttöön vasta aikuisen kanssa.',
    reward: 'Tunnistat turvalliset toimintatavat. Muista: oikeassa tutkimuksessa aikuinen on aina mukana.',
    demo: () => [
      { say: 'Katso, miten Aava valmistautuu: hän kuuntelee ohjeen loppuun, odottaa lupaa, laittaa suojalasit ja tekee ohjeen mukaan. Pitkät hiukset sidotaan kiinni.', scene: prepScene() },
      { say: 'Jos jotain sattuu: seis, älä koske, astu kauemmas ja kerro heti aikuiselle.', scene: hazardScene('lasi') },
      { say: 'Tuntematonta ainetta ei haisteta eikä maisteta. Kysy aikuiselta.', scene: hazardScene('pullo') },
    ],
    item: cases({
      ...Object.fromEntries(SAFE.slice(0, 6).map((s, i) => [`s${i}`, (r: Rng) => ({
        say: s.q,
        ...(s.hz ? { scene: hazardScene(s.hz, false) } : {}),
        task: pickText(r, s.right, s.wrong, s.why),
        hint: 'Mikä tapa pitää kaikki turvassa? Jos epäröit, kysy aikuiselta.',
        explain: `${s.right}. ${s.why[0]}`,
      })])),
      order: (r) => {
        const steps = ['Kuuntelen ohjeen loppuun', 'Odotan luvan aloittaa', 'Teen työn ohjeen mukaan', 'Siivoan ja pesen kädet'];
        const why = ['Ensin kuunnellaan koko ohje, muuten ei tiedä, mitä tehdä.', 'Ohjeen jälkeen odotetaan lupaa. Vasta sitten aloitetaan.', 'Työ tehdään vasta, kun ohje on kuultu ja lupa saatu.', 'Lopuksi siivotaan ja pestään kädet.'];
        return {
          say: 'Laita tutkijan työvaiheet oikeaan järjestykseen.',
          task: { kind: 'place', slots: steps.map((_, i) => ({ id: `p${i}`, text: `${i + 1}.` })), tokens: r.shuffle(steps.map((x, i) => ({ id: `v${i}`, text: x }))), answer: Object.fromEntries(steps.map((_, i) => [`p${i}`, `v${i}`])), why: Object.fromEntries(why.map((w, i) => [`p${i}`, w])) },
          hint: 'Mitä tehdään ennen kuin mihinkään kosketaan?',
          explain: steps.join(' → ') + '.',
        };
      },
      sort: (r) => {
        const ok = r.shuffle(SAFE_OK).slice(0, 3), bad = r.shuffle(SAFE_BAD).slice(0, 3), all = r.shuffle([...ok.map((x) => ({ ...x, b: 0 })), ...bad.map((x) => ({ ...x, b: 1 }))]);
        return {
          say: 'Lajittele teot: mikä on turvallista, mikä vaarallista?',
          task: { kind: 'sort', items: all.map((x) => ({ text: x.t })), cats: [{ label: 'Turvallista' }, { label: 'Vaarallista' }], answer: all.map((x) => x.b), why: all.map((x) => x.w) },
          hint: 'Voiko teosta tulla haava, palovamma tai myrkytys? Silloin se on vaarallista.',
          explain: `Turvallista: ${ok.map((x) => x.t.toLowerCase()).join(', ')}.`,
        };
      },
    }, (r) => {
      const s = SAFE[6]!;
      return { say: s.q, scene: hazardScene('vesi', false), task: pickText(r, s.right, s.wrong, s.why), hint: 'Vesi ja sähkö: kuka hoitaa?', explain: `${s.right}. ${s.why[0]}` };
    }),
  },
  // ============================================================ systematic listing
  {
    id: 'M-TH-07', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Kaikki vaihtoehdot', icon: '🧮',
    goal: 'Opit etsimään kaikki vaihtoehdot järjestelmällisesti, ettei mikään jää pois.',
    intro: 'Tutkimusasemalla kokeillaan kaikki yhdistelmät. Temppu: pidä yksi asia paikallaan ja vaihda muita.',
    reward: 'Löydät kaikki vaihtoehdot järjestyksessä!',
    demo: () => [
      { say: 'Loikalla on kaksi hattua ja kolme huivia. Ensin Loikka arpoo asuja sattumalta. Kuusi arvausta, mutta sama asu tulee kahdesti ja osa jää kokonaan löytymättä.', scene: guessOutfitsScene(['punainen', 'sininen'], ['raita', 'pallo', 'tähti'], [[0, 1], [1, 0], [0, 1], [1, 2], [0, 0], [1, 0]]) },
      { say: 'Nyt järjestyksessä: punainen hattu pysyy paikallaan ja huivi vaihtuu, kolme asua. Sitten sininen hattu ja taas kaikki huivit. Kaksi kertaa kolme on kuusi asua, eikä mikään jäänyt pois.', scene: systemOutfitsScene(['punainen', 'sininen'], ['raita', 'pallo', 'tähti']) },
      { say: 'Numeroista yksi, kaksi ja kolme tehdään kaksinumeroisia lukuja. Ykkönen alkuun ja perään vuorotellen muut. Yksitoista ei käy, koska samaa numeroa ei käytetä kahdesti. Sitten kakkonen alkuun, sitten kolmonen.', scene: digitTreeScene([1, 2, 3]) },
      { say: 'Neljä ystävää kättelee. A kättelee kaikki muut, kolme kättelyä. B on jo kätellyt A:n kanssa, joten uusia on kaksi. C:llä yksi. Kolme plus kaksi plus yksi on kuusi.', scene: handshakeScene(4) },
    ],
    item: cases({
      outfits: (r) => {
        const a = r.int(2, 4), b = r.int(2, 4);
        const whyAt: Record<number, string> = {};
        if (a + b !== a * b) whyAt[a + b] = `Laskit paidat ja housut yhteen. Jokainen paita käy jokaisten housujen kanssa: ${a} × ${b}.`;
        if (a !== a * b && a !== a + b) whyAt[a] = `Se on vain paitojen määrä. Jokaisen paidan kanssa on ${b} eri housut.`;
        return ask(`Aavalla on ${a} paitaa ja ${b} housut. Montako erilaista asua hän voi koota?`, a * b, `Jokaisen paidan kanssa voi olla ${b} housut: ${a} × ${b} = ${a * b}.`, { hint: 'Pidä yksi paita paikallaan ja vaihda housuja. Montako asua yhdellä paidalla?', whyAt });
      },
      digits: (r) => {
        const ds = r.shuffle([1, 2, 3, 4, 5, 6, 7]).slice(0, 3).sort();
        const all = ds.flatMap((x) => ds.filter((y) => y !== x).map((y) => `${x}${y}`));
        const missing = r.pick(all);
        const shown = all.filter((s) => s !== missing);
        const inList = r.pick(shown), foreign = r.pick([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !ds.includes(d)));
        return {
          say: `Loikka kirjoittaa kaksinumeroisia lukuja numeroista ${ds.join(', ')}. Samaa numeroa ei käytetä kahdesti. Mikä luku puuttuu listasta?`,
          scene: card(shown.join(', ')),
          task: choose(r, n$(+missing), [n$(+(missing[1]! + missing[1]!)), n$(+inList), n$(ds[0]! * 10 + foreign)], [`Luvussa ${missing[1]}${missing[1]} sama numero on kahdesti. Sitä ei saa tehdä.`, `${inList} on jo listassa. Etsi luku, jota ei vielä ole.`, `Numeroa ${foreign} ei ole Loikan numeroissa.`]),
          hint: `Käy alut järjestyksessä: ensin kaikki ${ds[0]}-alkuiset, sitten ${ds[1]}-alkuiset, sitten ${ds[2]}-alkuiset.`,
          explain: `Kaikki luvut järjestyksessä: ${all.join(', ')}. Puuttui ${missing}.`,
        };
      },
      system: (r) => {
        const good = 'ensin kaikki punaisella alkaen, sitten kaikki sinisellä alkaen';
        return {
          say: 'Miten löydät varmasti kaikki tavat yhdistää kaksi väriä ja kolme kuviota?',
          task: pickText(r, `Käyn läpi ${good}`, ['Kokeilen sattumanvaraisesti, kunnes en keksi enempää', 'Lasken värit ja kuviot yhteen'], ['Sattumanvaraisesti jokin voi jäädä pois.', 'Yhdistelmiä on 2 × 3, ei 2 + 3.']),
          explain: 'Pidä yksi väri paikallaan ja käy läpi kaikki kuviot, sitten seuraava väri. 2 × 3 = 6 yhdistelmää.',
          hint: 'Mikä tapa varmistaa, ettei mikään jää pois eikä tule kahdesti?',
        };
      },
      valid: (r) => {
        const ds = r.shuffle([1, 2, 3, 4, 5]).slice(0, 3).sort();
        const out = [6, 7, 8, 9][r.int(0, 3)]!;
        const good = r.shuffle(ds.flatMap((x) => ds.filter((y) => y !== x).map((y) => `${x}${y}`))).slice(0, 3);
        const twin = r.shuffle(ds).slice(0, 2).map((d) => `${d}${d}`);
        const odd = `${r.pick(ds)}${out}`;
        const all = r.shuffle([...good.map((v) => ({ v, c: 0, why: `${v}: molemmat numerot ovat listassa ja eri numeroita. Kelpaa.` })), ...twin.map((v) => ({ v, c: 1, why: `${v}: sama numero kahdesti. Ei kelpaa.` })), { v: odd, c: 1, why: `${odd}: numeroa ${out} ei ole käytössä. Ei kelpaa.` }]);
        return {
          say: `Numerot ovat ${ds.join(', ')}. Samaa numeroa ei käytetä kahdesti. Lajittele: mitkä luvut kelpaavat?`,
          task: { kind: 'sort' as const, items: all.map((x) => ({ big: x.v })), cats: [{ label: 'Kelpaa ✓' }, { label: 'Ei kelpaa ✗' }], answer: all.map((x) => x.c), why: all.map((x) => x.why) },
          explain: `Kelpaavat luvut tehdään numeroista ${ds.join(', ')} niin, että numerot ovat eri.`,
          hint: 'Tarkista kaksi asiaa: onko numero listassa, ja ovatko numerot eri.',
        };
      },
      list: (r) => {
        const a = r.shuffle(['punainen', 'sininen', 'keltainen']).slice(0, r.int(2, 3)), b = r.shuffle(['raita', 'pallo', 'tähti']).slice(0, r.int(2, 3));
        return {
          say: `Loikalla on ${a.length} hattua ja ${b.length} huivia. Listaa kaikki asut: valitse hattu ja huivi ja lisää pari listaan. Jokainen asu kerran.`,
          task: { kind: 'combos', a: a.map((x) => `${x} hattu`), b: b.map((x) => `${x}huivi`), aLabel: 'hattu', bLabel: 'huivit' },
          explain: `Pidä yksi hattu paikallaan ja käy läpi kaikki huivit, sitten seuraava hattu: ${a.length * b.length} asua.`,
          hint: 'Aloita ensimmäisestä hatusta ja käy kaikki huivit läpi.',
        };
      },
    }, (r) => {
      const n = r.pick([3, 4, 5]);
      const pairs = (n * (n - 1)) / 2;
      const whyAt: Record<number, string> = { [n * (n - 1)]: `Laskit jokaisen kättelyn kahdesti: A–B ja B–A ovat sama kättely. Puolita: ${pairs}.` };
      if (n - 1 !== pairs) whyAt[n - 1] = `Se on vain ensimmäisen ystävän kättelyt. Muutkin kättelevät vielä uusia.`;
      return ask(`${n} ystävää kättelee toisiaan. Jokainen kättelee jokaista kerran. Montako kättelyä tulee?`, pairs,
        `Ensimmäinen kättelee ${n - 1} muuta, toinen enää ${n - 2} uutta, ja niin edelleen: ${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' + ')} = ${pairs}.`, { hint: 'Listaa parit järjestyksessä: ensin kaikki ensimmäisen kanssa.', whyAt });
    }),
  },
  // ============================================================ links between ideas
  {
    id: 'M-TH-08', stop: 'Sama asia, eri tapa', icon: '🔗',
    goal: 'Opit huomaamaan, että kaksi opittua asiaa kertovat samasta asiasta.',
    intro: 'Laskuverstaalla huomataan: monella laskulla on kaksoisolento.',
    reward: 'Löydät yhteydet: yksi asia, monta esitystapaa!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Kolme plus kolme plus kolme plus kolme: neljä ryhmää, joissa kussakin kolme. Kun ryhmät nostetaan allekkain, näkyy neljä kertaa kolme. Sama määrä, kaksi kirjoitustapaa.', scene: repeatScene(4, 3) },
      { say: 'Neljäsosa luvusta kaksitoista: kivet jaetaan neljään yhtä suureen osaan. Yhdessä osassa on kolme. Se on sama kuin kaksitoista jaettuna neljällä.', scene: fracShareScene(4, 12) },
      { say: 'Neliön piiri: neljä yhtä pitkää sivua. Viisi plus viisi plus viisi plus viisi on sama kuin neljä kertaa viisi.', scene: perimScene({ pts: [[0, 0], [5, 0], [5, 5], [0, 5]], unit: 'cm' }) },
    ],
    item: cases({
      mulAdd: (r) => {
        const k = r.int(3, 5), g = r.int(2, 9);
        return {
          say: `Mikä kertoo saman kuin ${k} × ${g}?`,
          task: choose(r, ex(Array(k).fill(g).join(' + ')), [ex(`${k} + ${g}`), ex(Array(g === k ? k + 1 : k).fill(k === g ? g : k).join(' + '))].filter((o, i, l) => o.big !== Array(k).fill(g).join(' + ') && l.findIndex((x) => x.big === o.big) === i), ['Kertolasku ei ole kahden luvun summa.', 'Toistettava luku on väärä.']),
          hint: `${k} × ${g} tarkoittaa ${k} ryhmää, joissa kussakin ${g}.`,
          explain: `${k} × ${g} = ${Array(k).fill(g).join(' + ')} = ${k * g}.`,
        };
      },
      pairs: (r) => {
        // Each description has a different value, and no decoy card has the value of a description:
        // a card whose value fits elsewhere would be a second right answer (review U06: 3 × 2 and 12 : 2).
        let k = 0, g = 0, n = 0, q = 0, sq = 0;
        do {
          k = r.int(3, 5); g = r.int(2, 6); n = r.pick([2, 3, 4, 5].filter((x) => x !== k)); q = r.int(2, 6); sq = r.pick([5, 6, 7, 8, 9].filter((x) => x !== g));
        } while (new Set([k * g, q, 4 * sq]).size < 3 || [k + g, n * q * n, sq * sq].some((v) => [k * g, q, 4 * sq].includes(v)));
        const left = [`${k} × ${g}`, `1/${n} luvusta ${n * q}`, `neliön piiri, sivu ${sq}`];
        const right = [Array(k).fill(g).join(' + '), `${n * q} : ${n}`, `4 × ${sq}`];
        const decoy = [`${k} + ${g}`, `${n * q} × ${n}`, `${sq} × ${sq}`];
        const dz = r.shuffle([0, 1, 2]).slice(0, 2);
        const tokens = r.shuffle([...right.map((t, i) => ({ id: `t${i}`, text: t })), ...dz.map((i) => ({ id: `d${i}`, text: decoy[i]! }))]);
        return {
          say: 'Etsi jokaiselle kaksoisolento: sama asia toisella tavalla kirjoitettuna. Kaksoisolennolla on sama arvo. Kaksi korttia jää yli.',
          task: {
            kind: 'place' as const,
            slots: left.map((t, i) => ({ id: `s${i}`, text: t })),
            tokens,
            answer: Object.fromEntries(left.map((_, i) => [`s${i}`, `t${i}`])),
            why: { s0: `${k} × ${g} on ${k} kertaa ${g}: ${right[0]}.`, s1: `1/${n} saadaan jakamalla ${n} osaan: ${n * q} : ${n} = ${q}.`, s2: `Neliöllä on 4 sivua, kukin ${sq}: piiri on 4 × ${sq}. (${sq} × ${sq} olisi pinta-ala.)` },
          },
          hint: 'Kertolasku on toistettua yhteenlaskua, murto-osa on jakolasku ja neliön piiri on neljä sivua.',
          explain: left.map((t, i) => `${t} = ${right[i]}`).join('; ') + '.',
        };
      },
      fracDiv: (r) => {
        const n = r.pick([2, 3, 4, 5]);
        let q = r.int(2, 6);
        if (n * q - n === q) q++; // 4 − 2 = 2 would also give the right amount
        return {
          say: `Mikä lasku kertoo, paljonko on 1/${n} luvusta ${n * q}?`,
          task: choose(r, ex(`${n * q} : ${n}`), [ex(`${n * q} × ${n}`), ex(`${n * q} − ${n}`)], ['Osa on pienempi kuin koko. Kertolasku suurentaa.', 'Osaa ei saada vähentämällä nimittäjää.']),
          hint: `1/${n} on yksi osa, kun koko jaetaan ${n} yhtä suureen osaan.`,
          explain: `1/${n} luvusta ${n * q} on ${n * q} : ${n} = ${q}.`,
        };
      },
      areaMul: (r) => {
        const a = r.int(2, 5);
        let b = r.int(3, 7);
        if (2 * a + 2 * b === a * b) b++; // 3 × 6 and 2 × 3 + 2 × 6 are both 18: the wrong option would count right
        return {
          say: 'Suorakulmio on jaettu ruutuihin. Mikä lasku kertoo ruutujen määrän nopeasti?',
          scene: paint(arrayArt(a, b, 'kivi', 18)),
          task: choose(r, ex(`${a} × ${b}`), [ex(`${a} + ${b}`), ex(`2 × ${a} + 2 × ${b}`)], ['Tämä on rivien ja sarakkeiden summa.', 'Tämä on reunan pituus, ei ruutujen määrä.']),
          hint: 'Montako riviä ja montako ruutua yhdessä rivissä?',
          explain: `${a} riviä, joissa ${b}: ${a} × ${b} = ${a * b}.`,
        };
      },
    }, (r) => {
      const s = r.int(3, 9);
      return ask(`Neliön jokainen sivu on ${s} cm. Neljän kertotaulu auttaa: kuinka pitkä on neliön piiri?`, 4 * s, `Neljä yhtä pitkää sivua: ${s} + ${s} + ${s} + ${s} = 4 × ${s} = ${4 * s} cm.`, { unit: 'cm', hint: 'Neliöllä on neljä yhtä pitkää sivua.', whyAt: offAnswer(4 * s, { [s * s]: `Tämä on ${s} × ${s}, ruutujen määrä. Piiri on reunan pituus: 4 × ${s}.`, [s + 4]: `Neljä sivua lisätään toisiinsa: ${s} + ${s} + ${s} + ${s}.`, [2 * s]: 'Neliöllä on neljä sivua, ei kaksi.' }) });
    }),
  },
  // ============================================================ finding a rule
  {
    id: 'M79-LOGIC-01', stop: 'Säännön jäljillä', icon: '🕵️', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit löytämään säännön, joka pätee kaikkiin esimerkkeihin, ei vain ensimmäiseen.',
    intro: 'Laboratorion kone muuttaa luvut. Sulka haluaa tietää koneen säännön.',
    reward: 'Löydät säännön ja testaat sen kaikilla esimerkeillä!',
    demo: () => [
      { say: 'Kone muuttaa luvun 2 luvuksi 5, luvun 4 luvuksi 9 ja luvun 5 luvuksi 11. Testataan ensin sääntöä x + 3: se toimii ensimmäiselle parille, mutta kaatuu toisella. Sitten testataan 2x + 1.', scene: ruleHuntScene([2, 4, 5], [5, 9, 11], [{ label: 'x + 3', f: (x) => x + 3 }, { label: '2x + 1', f: (x) => 2 * x + 1 }]) },
      { say: 'Toinen kone: 1 → 1, 3 → 7, 4 → 10. Sääntö 2x − 1 näyttää hyvältä alussa. Pysyykö se?', scene: ruleHuntScene([1, 3, 4], [1, 7, 10], [{ label: '2x − 1', f: (x) => 2 * x - 1 }, { label: '3x − 2', f: (x) => 3 * x - 2 }]) },
      { say: 'Muista: yksi sopiva pari ei vielä todista mitään. Sääntö hyväksytään vasta, kun jokainen pari on testattu.', scene: card('testaa jokainen pari') },
    ],
    item: cases({
      rule: (r) => {
        const k = r.int(2, 4), b = r.int(-1, 5), xs = [1, 2, 3].map((i) => i + r.int(0, 1) * 2);
        const ys = xs.map((x) => k * x + b);
        const B = (v: number) => (v === 0 ? '' : v > 0 ? ` + ${v}` : ` − ${-v}`);
        const good = `${k}x${B(b)}`, c0 = ys[0]! - xs[0]!;
        const cands: [string, string][] = [
          [c0 === 0 ? 'x' : `x${B(c0)}`, `Tämä toimii vain ensimmäiselle parille: ${xs[1]}${B(c0)} = ${xs[1]! + c0}, ei ${ys[1]}.`.replace(/-(\d)/g, '−$1')],
          [`${k + 1}x${B(b - xs[0]!)}`, `Testaa toisella parilla: ${k + 1} · ${xs[1]}${B(b - xs[0]!)} = ${(k + 1) * xs[1]! + b - xs[0]!}, ei ${ys[1]}.`.replace(/-(\d)/g, '−$1')],
          [`${k}x${B(b + 1)}`, `Kerroin on oikein, mutta lisäys ei: ${k} · ${xs[0]}${B(b + 1)} = ${ys[0]! + 1}, ei ${ys[0]}.`.replace(/-(\d)/g, '−$1')],
        ];
        const seen = new Set([good]), opts: [string, string][] = [];
        for (const c of cands) if (!seen.has(c[0])) { seen.add(c[0]); opts.push(c); }
        return {
          say: 'Mikä sääntö sopii kaikkiin koneen pareihin?',
          scene: paint(table(['sisään', 'ulos'], xs.map((x, i) => [x, String(ys[i]).replace('-', '−')]))),
          task: choose(r, ex(good), opts.map((o) => ex(o[0])), opts.map((o) => o[1])),
          hint: 'Laske jokaisen säännön tulos kaikilla pareilla. Ensimmäinen pari ei riitä.',
          explain: `${good}: ${xs.map((x, i) => `${k} · ${x}${B(b)} = ${ys[i]}`).join(', ')}.`.replace(/-(\d)/g, '−$1'),
        };
      },
      next: (r) => {
        const k = r.int(2, 5), b = r.int(0, 4);
        const ys = [1, 2, 3, 4].map((n) => k * n + b), ans = k * 5 + b;
        return ask(`Taulukossa sääntö toistuu. Mikä on seuraava luku? ${ys.join(', ')}, …`, ans, `Luvut kasvavat aina ${k}: ${ys[3]} + ${k} = ${ans}.`, {
          hint: 'Katso, paljonko luku kasvaa joka askeleella.',
          whyAt: { ...(b > 0 ? { [ys[3]! + ys[0]!]: `Lisäys on ero kahden peräkkäisen luvun välillä: ${ys[1]} − ${ys[0]} = ${k}.` } : {}), [ys[3]! + 1]: `Luvut eivät kasva yhdellä vaan ${k}:lla.`, [2 * ys[3]!]: 'Luvut eivät kaksinkertaistu, vaan niihin lisätään sama määrä.' },
        });
      },
      test: (r) => {
        const k = r.int(2, 4), xs = [1, 2, 3], ys = xs.map((x) => k * x);
        const breakIt = r.chance(0.5); if (breakIt) ys[2] = ys[2]! + 1;
        return {
          say: `Sulka väittää, että sääntö on ”kerro luvulla ${k}”. Päteekö se kaikkiin pareihin?`,
          scene: paint(table(['sisään', 'ulos'], xs.map((x, i) => [x, ys[i]!]))),
          task: YESNO(!breakIt, `Tarkista: ${xs.map((x) => `${k} · ${x} = ${k * x}`).join(', ')}.`, `Kolmas pari ei käy: ${k} · 3 = ${k * 3}, ei ${ys[2]}.`),
          hint: 'Laske jokainen rivi. Yksikin väärä rivi kaataa säännön.',
          explain: breakIt ? `Sääntö pätee kahteen ensimmäiseen, mutta ei kolmanteen: ${k} · 3 = ${k * 3}.` : 'Sääntö pätee jokaiseen pariin.',
        };
      },
      rules: (r) => {
        const k = r.int(2, 4), b = r.int(1, 5), xs = [1, 2, 4];
        const ys = xs.map((x) => k * x + b);
        const c0 = ys[0]! - xs[0]!;
        const rows: [string, number, string][] = r.shuffle([
          [`${k}x + ${b}`, 0, `Pätee: ${xs.map((x, i) => `${k} · ${x} + ${b} = ${ys[i]}`).join(', ')}.`],
          [`${b} + ${k}x`, 0, `Sama sääntö eri järjestyksessä: yhteenlaskun voi vaihtaa päittäin.`],
          [`x · ${k} + ${b}`, 0, `Sama sääntö: x · ${k} = ${k}x.`],
          [`x + ${c0}`, 1, `Toimii vain ensimmäiselle: ${xs[1]} + ${c0} = ${xs[1]! + c0}, ei ${ys[1]}.`],
          [`${k + 1}x + ${b - 1}`, 1, `Ensimmäinen täsmää, mutta ${k + 1} · ${xs[1]} + ${b - 1} = ${(k + 1) * xs[1]! + b - 1}, ei ${ys[1]}.`],
          [`${k}x + ${b + 1}`, 1, `${k} · ${xs[0]} + ${b + 1} = ${ys[0]! + 1}, ei ${ys[0]}.`],
        ] as [string, number, string][]);
        return {
          say: `Kone: ${xs.map((x, i) => `${x} → ${ys[i]}`).join(', ')}. Lajittele säännöt: mitkä pätevät kaikkiin pareihin?`,
          scene: paint(table(['sisään', 'ulos'], xs.map((x, i) => [x, ys[i]!]))),
          task: { kind: 'sort' as const, items: rows.map((x) => t(x[0])), cats: [{ label: 'Pätee kaikkiin ✓' }, { label: 'Ei päde ✗' }], answer: rows.map((x) => x[1]), why: rows.map((x) => x[2]) },
          hint: 'Sama sääntö voi näyttää erilaiselta. Testaa jokainen kortti kaikilla kolmella parilla.',
          explain: `Pätevä sääntö on ${k}x + ${b}, kirjoitettiinpa se missä järjestyksessä tahansa. Muut kaatuvat johonkin pariin.`,
        };
      },
    }, (r) => {
      const n = r.int(6, 12);
      return ask(`Tulitikuista tehdään neliöitä riviin: 1 neliö vie 4 tikkua, 2 neliötä 7 tikkua, 3 neliötä 10 tikkua. Montako tikkua vie ${n} neliötä?`, 3 * n + 1, `Jokainen uusi neliö tarvitsee 3 tikkua lisää. Sääntö: 3n + 1. 3 · ${n} + 1 = ${3 * n + 1}.`, {
        scene: table(['neliöitä', 'tikkuja'], [[1, 4], [2, 7], [3, 10], [n, '?']]),
        hint: 'Paljonko tikkuja tulee lisää jokaista uutta neliötä kohti? Mistä lähdetään?',
        whyAt: { [4 * n]: 'Vierekkäiset neliöt jakavat yhden sivun, joten uusi neliö vie vain 3 tikkua.', [3 * n]: 'Ensimmäinen tikku unohtui: 1 neliö vie 4 tikkua, eli 3 · 1 + 1.', [3 * n + 4]: 'Laskit ensimmäisen neliön kahteen kertaan.' },
      });
    }),
  },
];
