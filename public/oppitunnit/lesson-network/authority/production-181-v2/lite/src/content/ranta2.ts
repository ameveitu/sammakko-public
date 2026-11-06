// Rantaretki, second half: zero, the signs + − =, take-away, tens, fair sharing,
// metre and centimetre, mass, capacity. Early-reader friendly: short text, numerals and pictures
// as options, every word option speaks.
import type { Rng } from '../engine/rng';
import type { NodeSpec, Option } from '../engine/types';
import { scatter, svg, THINGS } from '../ui/art';
import { word } from './fi';
import { boxArt, cases, choose, fixed, groupArt, paint, txt } from './kit';
import { balanceArt, reedsArt, rulerArt, vesselArt } from './pics';
import { takeAway } from './countanim';
import { AUDIT_REV } from './audit-rev';
import { dlFillScene, dlText, kiloScene, metreScene, onScaleScene, pourScene, rulerScene } from './measureanim';
import { weighScene, balanceScene, bundleScene, joinScene, lineHops, pairScene, placeScene, roundRobin, signScene, translateScene, unbundleScene } from './countanim';

const n$ = (n: number): Option => ({ big: String(n), speak: word(n) });
const many = (k: string, n: number) => (n === 1 ? THINGS[k]!.one : THINGS[k]!.many);
const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);
/** A litre milk carton standing on the kitchen scale's platform (bottom y = 132). */
const MILK = '<path d="M134 132 v-46 l8 -12 h16 l8 12 v46 z" fill="#f4f7fb" stroke="#5a6b7a" stroke-width="2"/><path d="M142 74 v-6 h16 v6" fill="#cfe3f5" stroke="#5a6b7a" stroke-width="2"/><rect x="138" y="96" width="24" height="18" rx="3" fill="#3f7fc4"/><text x="150" y="109" text-anchor="middle" font-size="9" font-weight="900" fill="#fff">1 l</text>';
const SIGN: Record<string, string> = { '+': 'plus', '−': 'miinus', '=': 'on yhtä paljon kuin' };
const sign = (s: '+' | '−' | '='): Option => ({ big: s, speak: SIGN[s] });
const SIGNS: ('+' | '−' | '=')[] = ['+', '−', '='];
/** An expression option: shown with symbols, spoken in words. */
const ex = (s: string): Option => ({ big: s, speak: s.replace(/(\d+)/g, (d) => word(+d)).replace(/\+/g, 'plus').replace(/−/g, 'miinus').replace(/=/g, 'on yhtä paljon kuin') });
const big = (s: string, w = 260, h = 70, size = 44) => svg(w, h, `<text x="${w / 2}" y="${h * 0.72}" text-anchor="middle" font-size="${size}" font-weight="800" fill="currentColor">${s}</text>`);
const YES = [txt('Totta'), txt('Ei totta')];
const FOOD = ['marja', 'kala', 'kapy', 'simpukka', 'kivi', 'kukka'];

/** a things, then b more arriving (arrow). */
function joinArt(r: Rng, k: string, a: number, b: number, w = 300) {
  const pa = scatter(a, 120, 80, 24, r.next), pb = scatter(b, 90, 80, 24, r.next);
  return svg(w, 96, pa.map((p) => THINGS[k]!.draw(p.x + 8, p.y + 8, 24)).join('') +
    `<path d="M${w - 112} 50 h-30" stroke="var(--pond)" stroke-width="4" stroke-linecap="round"/><path d="M${w - 148} 50 l10 -7 v14z" fill="var(--pond)"/>` +
    `<rect x="${w - 104}" y="4" width="98" height="88" rx="12" fill="none" stroke="var(--pond)" stroke-dasharray="5 4" stroke-width="2"/>` +
    pb.map((p) => THINGS[k]!.draw(p.x + w - 100, p.y + 8, 24)).join(''), `${a} ja ${b} lisää`);
}
/** a things, b of them crossed out / leaving. */
function takeArt(r: Rng, k: string, a: number, b: number, w = 260) {
  const pts = scatter(a, w - 16, 84, 26, r.next);
  return svg(w, 96, pts.map((p, i) => THINGS[k]!.draw(p.x + 8, p.y + 6, 26) +
    (i < b ? `<path d="M${p.x - 6} ${p.y - 8}l28 28M${p.x + 22} ${p.y - 8}l-28 28" stroke="var(--red)" stroke-width="4" stroke-linecap="round"/>` : '')).join(''), `${a}, joista ${b} pois`);
}
/** Plates with given counts. */
function platesArt(r: Rng, k: string, counts: number[], w = 320) {
  const pw = Math.min(96, (w - 8) / counts.length - 8);
  return svg(w, 100, counts.map((c, i) => {
    const x0 = 6 + i * (pw + 8);
    const pts = scatter(c, pw - 20, 50, 20, r.next);
    return `<ellipse cx="${x0 + pw / 2}" cy="54" rx="${pw / 2}" ry="36" fill="var(--card)" stroke="currentColor" stroke-opacity=".45" stroke-width="3"/>` + pts.map((p) => THINGS[k]!.draw(x0 + 10 + p.x, 30 + p.y, 20)).join('');
  }).join(''));
}
const icon = (k: string, s = 56) => svg(s, s, THINGS[k]!.draw(s / 2, s / 2, s * 0.9));

/** A ruler with the start of a stick marked at a (the end is for the learner to find). */
function startArt(a: number) {
  const U = 27, X = (v: number) => 15 + v * U;
  let s = `<rect x="6" y="40" width="288" height="40" rx="5" fill="color-mix(in srgb, var(--sun) 50%, var(--card))" stroke="currentColor" stroke-width="2"/>`;
  for (let v = 0; v <= 10; v++) s += `<line x1="${X(v)}" y1="40" x2="${X(v)}" y2="${v % 5 === 0 ? 58 : 52}" stroke="currentColor" stroke-width="1.8"/><text x="${X(v)}" y="75" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">${v}</text>`;
  return svg(300, 84, s + `<rect x="${X(a)}" y="20" width="18" height="14" rx="4" fill="#8a5a33"/><path d="M${X(a) + 22} 27 h26" stroke="#8a5a33" stroke-width="3" stroke-dasharray="4 4"/><text x="${X(a)}" y="14" font-size="12" font-weight="700" fill="currentColor">alku</text>`, `Viivoitin, kepin alku kohdassa ${a}`);
}

const ALL: Record<number, string> = { 2: 'kahdelle', 3: 'kolmelle', 4: 'neljälle', 5: 'viidelle' };
export const RANTA2_NODES: NodeSpec[] = [
  // ============================================================ loru: zero
  {
    id: 'M-NUM-06', stop: 'Tyhjä pesä', icon: '🪺',
    intro: 'Aavan pesä on tyhjä: poikaset ovat jo lentäneet. Kun ei ole yhtään, sanotaan nolla. Katsotaan, miten nolla syntyy.',
    reward: 'Nolla on luku: se tarkoittaa, ettei ole yhtään!',
    demo: (r) => [
      { say: 'Lautasella on kolme marjaa. Katso, kun Loikka syö ne yksi kerrallaan: kolme, kaksi, yksi…', scene: takeAway('marja', 3, 3, { zero: true }) },
      { say: 'Nyt korissa ei ole yhtään marjaa. Yhtään ei ole: se on nolla. Numerona nolla kirjoitetaan näin.', scene: paint(boxArt(r, 'marja', 0, '0', 180, 130)) },
    ],
    item: cases({
      empty: (r) => {
        const k = r.pick(FOOD);
        const [a, b] = r.shuffle([1, 2, 3]);
        return {
          say: `Missä rasiassa ei ole yhtään?`,
          task: choose(r, { art: boxArt(r, k, 0, '', 120, 100) }, [{ art: boxArt(r, k, a!, '', 120, 100) }, { art: boxArt(r, k, b!, '', 120, 100) }], ['Tässä on jotain.', 'Tässä on jotain.']),
          explain: 'Tyhjässä rasiassa on nolla.',
        };
      },
      count: (r) => {
        const k = r.pick(FOOD), n = r.chance(0.6) ? 0 : r.int(1, 4);
        const opts = n === 0 ? [1, 10] : [0, n + 1];
        return {
          say: `Montako ${THINGS[k]!.many} rasiassa on?`,
          scene: paint(boxArt(r, k, n, '', 180, 130)),
          task: choose(r, n$(n), opts.map(n$), n === 0 ? ['Rasiassa ei ole yhtään, ei edes yhtä.', 'Kymmenessä on nolla perässä, mutta se on iso luku.'] : []),
          explain: n === 0 ? 'Rasia on tyhjä. Yhtään ei ole: nolla.' : `Rasiassa on ${word(n)}.`,
        };
      },
      takeAll: (r) => {
        const k = r.pick(['marja', 'kala']), n = r.int(2, 5);
        return {
          say: `Lautasella on ${word(n)} ${many(k, n)}. Loikka syö ne kaikki. Montako jää?`,
          scene: takeAway(k, n, n, { counter: false }),
          task: choose(r, n$(0), [n$(n), n$(1)], ['Ne kaikki syötiin.', 'Yksikään ei jäänyt.']),
          explain: `Kaikki ${word(n)} syötiin, joten jäi nolla.`,
        };
      },
    }, (r) => {
      const s = r.int(3, 5);
      // s, …, kaksi, then "yksi" once (each word once).
      return {
        say: `Loikka laskee hyppykiviä alaspäin: ${Array.from({ length: s - 1 }, (_, i) => word(s - i)).join(', ')}, yksi... Mikä luku tulee seuraavaksi?`,
        task: choose(r, n$(0), [n$(10), n$(2)], ['Kymmenen on paljon. Alaspäin ykkösen jälkeen tulee nolla.', 'Kaksi tuli jo. Alaspäin mennään pienempään.']),
        explain: 'Yhden jälkeen alaspäin tulee nolla: kivi, jolla ei ole yhtään.',
      };
    }),
  },

  // ============================================================ merkit
  {
    id: 'M-SYM-PLUS', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Plusmerkki', icon: '➕',
    intro: 'Rantakivistä rakennetaan merkki, joka kertoo: tulee lisää.',
    reward: 'Plus tarkoittaa: lisää tai yhdessä!',
    demo: (r) => [
      { say: 'Lammessa ui kaksi kalaa. Sinne ui vielä yksi. Kun tulee lisää, kirjoitetaan plusmerkki. Kaksi plus yksi on kolme.', scene: signScene('kala', 2, 1, '+') },
      { say: 'Kolme simpukkaa, ja aallot tuovat vielä kaksi. Kolme plus kaksi on viisi.', scene: signScene('simpukka', 3, 2, '+') },
      { say: 'Plus sopii myös, kun kaksi joukkoa laitetaan yhteen. Loikan kolme marjaa ja Aavan kaksi marjaa samaan koriin: kolme plus kaksi.', scene: joinScene('marja', 3, 2) },
    ],
    item: cases({
      picToSign: (r) => {
        const k = r.pick(FOOD), a = r.int(1, 4), b = r.int(1, 3);
        return {
          say: 'Tulee lisää. Mikä merkki kertoo sen?',
          scene: signScene(k, a, b, '+', false),
          task: choose(r, sign('+'), [sign('−'), sign('=')], ['Miinus tarkoittaa, että otetaan pois. Nyt tuli lisää.', 'Yhtä paljon -merkki vertaa kahta puolta. Se ei kerro, että tulee lisää.']),
          hint: 'Tuliko lisää vai lähtikö pois?',
          explain: 'Kun tulee lisää, käytetään plusmerkkiä.',
        };
      },
      story: (r) => {
        const a = r.int(3, 6), b = r.int(1, a - 1), k = r.pick(['kala', 'tahti']);
        return {
          say: `Rannalla on ${word(a)} ${many(k, a)}. Aallot tuovat vielä ${word(b)}. Mikä lasku kertoo tämän?`,
          task: choose(r, ex(`${a} + ${b}`), [ex(`${a} − ${b}`), ex(`${b} + ${b}`)], ['Miinuksella otettaisiin pois. Nyt tuli lisää.', `Alussa oli ${a}, ei ${b}.`]),
          hint: 'Ensin kirjoitetaan, montako oli alussa. Sitten merkki ja montako tuli.',
          explain: `Alussa ${a}, ja tuli lisää ${b}: ${a} + ${b}.`,
        };
      },
      meaning: (r) => {
        const k = r.pick(FOOD), a = r.int(2, 4), b = r.int(1, 3);
        return {
          say: `Mikä kuva sopii laskuun ${a} + ${b}?`,
          scene: paint(big(`${a} + ${b}`)),
          task: choose(r, { art: joinArt(r, k, a, b) }, [{ art: takeArt(r, k, a + b, b) }, { art: joinArt(r, k, a + 1, b) }], ['Tässä otetaan pois. Plus tarkoittaa lisää.', `Tässä on alussa ${a + 1}.`], 1),
          hint: `Etsi kuva, jossa on ensin ${a} ja sitten tulee lisää.`,
          explain: `${a} ja tulee lisää ${b}.`,
        };
      },
      write: (r) => {
        const k = r.pick(FOOD), a = r.int(2, 5), b = r.pick([1, 2, 3].filter((x) => x !== a));
        return {
          say: 'Kirjoita lasku: montako oli, mikä merkki, montako tuli.',
          scene: signScene(k, a, b, '+', false),
          task: { kind: 'build' as const, mode: 'seq' as const, target: `${a} + ${b}`, tokens: r.shuffle([...new Set([a, b, a + b].map(String))]).concat(['+', '−']), max: 3 },
          hint: `Alussa ${a}. Tuli lisää ${b}.`,
          explain: `${a} + ${b}: alussa ${a}, ja tuli lisää ${b}.`,
        };
      },
    }, (r) => {
      const a = r.int(2, 5), b = r.int(1, 4);
      const [c1, c2] = r.shuffle(['punaista', 'sinistä']);
      return {
        say: `Loikalla on ${word(a)} ${c1} ja ${word(b)} ${c2} kiveä. Mikä lasku kertoo, montako kiveä on yhteensä?`,
        task: (() => { const ws = [`${a} + ${a}`, `${a + b} + ${b}`].filter((x) => x !== `${a} + ${b}`); return choose(r, ex(`${a} + ${b}`), ws.map(ex), ws.map((x) => x === `${a + b} + ${b}` ? `${a + b} on jo kaikki kivet yhteensä. Laskussa ovat ne kaksi joukkoa, jotka yhdistetään.` : `Kumpaakin väriä ei ole ${a}. Toista väriä on ${b}.`)); })(),
        hint: 'Kaksi väriä on kaksi joukkoa. Plus laittaa ne yhteen.',
        explain: `Kivet yhdessä: ${a} + ${b} = ${a + b}. Plus sopii myös silloin, kun mitään ei tule lisää, vaan kaksi joukkoa yhdistetään.`,
      };
    }),
  },
  {
    id: 'M-SYM-MINUS', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Miinusmerkki', icon: '➖',
    intro: 'Toinen kivimerkki kertoo: otetaan pois.',
    reward: 'Miinus tarkoittaa: pois tai vähemmän!',
    demo: (r) => [
      { say: 'Oksalla on neljä kukkaa. Aava poimii yhden pois. Kun otetaan pois, kirjoitetaan miinusmerkki. Neljä miinus yksi on kolme.', scene: signScene('kukka', 4, 1, '−') },
      { say: 'Viisi kalaa, ja kaksi ui pois. Viisi miinus kaksi on kolme.', scene: signScene('kala', 5, 2, '−') },
      { say: 'Miinus kertoo myös eron. Loikalla on viisi kiveä ja Aavalla kolme. Tehdään pareja: kaksi jää ilman paria. Viisi miinus kolme on kaksi.', scene: pairScene('kivi', 5, 3) },
    ],
    item: cases({
      picToSign: (r) => {
        const k = r.pick(FOOD), a = r.int(3, 6), b = r.int(1, a - 1);
        return {
          say: 'Osa otetaan pois. Mikä merkki kertoo sen?',
          scene: signScene(k, a, b, '−', false),
          task: choose(r, sign('−'), [sign('+'), sign('=')], ['Plus tarkoittaa, että tulee lisää. Nyt osa lähti.', 'Yhtä paljon -merkki vertaa kahta puolta. Se ei kerro, että otetaan pois.']),
          hint: 'Tuliko lisää vai lähtikö pois?',
          explain: 'Kun otetaan pois, käytetään miinusmerkkiä.',
        };
      },
      story: (r) => {
        const a = r.int(4, 7), b = r.int(1, a - 2);
        return {
          say: `Lammella ui ${word(a)} ankkaa. ${cap(word(b))} ui pois. Mikä lasku kertoo tämän?`,
          task: choose(r, ex(`${a} − ${b}`), [ex(`${a} + ${b}`), ex(`${b} − ${b}`)], ['Plussalla tulisi lisää. Nyt ankkoja lähti.', `Alussa oli ${a} ankkaa.`]),
          hint: 'Ensin kirjoitetaan, montako oli alussa. Sitten merkki ja montako lähti.',
          explain: `Alussa ${a}, pois lähti ${b}: ${a} − ${b}.`,
        };
      },
      meaning: (r) => {
        const k = r.pick(FOOD), a = r.int(3, 5), b = r.int(1, 2);
        return {
          say: `Mikä kuva sopii laskuun ${a} − ${b}?`,
          scene: paint(big(`${a} − ${b}`)),
          task: choose(r, { art: takeArt(r, k, a, b) }, [{ art: joinArt(r, k, a, b) }, { art: takeArt(r, k, a, b + 1) }], ['Tässä tulee lisää. Miinus tarkoittaa pois.', `Tässä otetaan pois ${b + 1}.`], 1),
          hint: `Etsi kuva, jossa on ensin ${a} ja niistä lähtee ${b}.`,
          explain: `${a}, joista ${b} otetaan pois.`,
        };
      },
      write: (r) => {
        const k = r.pick(FOOD), a = r.int(4, 7), b = r.pick([1, 2, 3].filter((x) => x !== a - x));
        return {
          say: 'Kirjoita lasku: montako oli, mikä merkki, montako lähti.',
          scene: signScene(k, a, b, '−', false),
          task: { kind: 'build' as const, mode: 'seq' as const, target: `${a} − ${b}`, tokens: r.shuffle([...new Set([a, b, a - b].map(String))]).concat(['+', '−']), max: 3 },
          hint: `Alussa ${a}. Pois lähti ${b}.`,
          explain: `${a} − ${b}: alussa ${a}, ja ${b} otettiin pois.`,
        };
      },
    }, (r) => {
      const b = r.int(2, 4), a = b + r.int(1, 4);
      const [p, q] = r.shuffle(['Loikalla', 'Aavalla']);
      return {
        say: `${p} on ${word(a)} kiveä ja ${q} ${word(b)}. Mikä lasku kertoo, montako enemmän ${p} on?`,
        scene: pairScene('kivi', p === 'Loikalla' ? a : b, p === 'Loikalla' ? b : a, false),
        task: choose(r, ex(`${a} − ${b}`), [ex(`${a} + ${b}`), ex(`${b} + ${b}`)], ['Plus kertoisi, montako kiveä on yhteensä.', `${b} + ${b} on ${2 * b}. Ero löytyy, kun pienempi määrä otetaan suuremmasta.`]),
        hint: 'Tee pareja. Montako jää ilman paria?',
        explain: `Vertaillaan: ${a} − ${b} = ${a - b}. Miinus kertoo myös erotuksen, vaikka mitään ei oteta pois.`,
      };
    }),
  },
  {
    id: 'M-SYM-EQUAL', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Tasapainokivi', icon: '🟰',
    intro: 'Rannalla on keinulauta. Se on suorassa, kun molemmilla puolilla on yhtä paljon.',
    reward: 'Merkki = tarkoittaa: molemmilla puolilla on yhtä paljon!',
    demo: () => [
      { say: 'Vasemmalla on viisi kiveä, oikealla neljä. Vasen puoli painaa enemmän. Lisätään oikealle yksi: nyt vaaka on suorassa. Merkki = kertoo sen: viisi on yhtä paljon kuin neljä plus yksi.', scene: balanceScene([5], [4], 1) },
      { say: 'Vasemmalla on kolme ja yksi. Oikealla on kaksi. Montako lisätään? Yksi, kaksi: nyt suorassa. Kolme plus yksi on yhtä paljon kuin kaksi plus kaksi.', scene: balanceScene([3, 1], [2], 2) },
      { say: 'Varo! Merkki = ei tarkoita, että vastaus tulee perään. Jos oikealle laitetaan neljä, oikealla on kuusi. Vaaka kallistuu.', scene: balanceScene([3, 1], [2], 4) },
    ],
    item: cases({
      trueFalse: (r) => {
        const a = r.int(1, 5), b = r.int(1, 4), ok = r.chance(0.5);
        const s = a + b + (ok ? 0 : r.pick([-1, 1]));
        const form = r.pick(['left', 'right', 'same']);
        const e = form === 'left' ? `${s} = ${a} + ${b}` : form === 'right' ? `${a} + ${b} = ${s}` : ok ? `${a + b} = ${a + b}` : `${a + b} = ${s}`;
        const truth = ok;
        return {
          say: `Onko tämä totta? ${e}`,
          scene: paint(big(e)),
          task: fixed(YES, truth ? 0 : 1, truth ? [undefined, 'Laske molemmat puolet: ne ovat yhtä paljon.'] : ['Laske molemmat puolet: ne eivät ole yhtä paljon.', undefined], 2),
          hint: 'Laske merkin = kumpikin puoli erikseen. Onko niissä yhtä paljon?',
          explain: truth ? `Molemmilla puolilla on ${a + b}. Totta.` : `Puolet eivät ole yhtä paljon, joten ei totta.`,
        };
      },
      fillLeft: (r) => {
        const a = r.int(1, 5), b = r.int(1, 4);
        return {
          say: `Mikä luku sopii laatikkoon? □ = ${a} + ${b}`,
          scene: paint(big(`□ = ${a} + ${b}`)),
          task: (() => { const ws = [...new Set([a, b, a + b + 1])].filter((x) => x !== a + b).slice(0, 2); return choose(r, n$(a + b), ws.map(n$), ws.map((x) => x === a + b + 1 ? `${a} + ${b} on ${a + b}. ${x} on yksi liikaa.` : `${x} on vain toinen osa. Laatikossa pitää olla yhtä paljon kuin ${a} ja ${b} yhteensä.`)); })(),
          hint: 'Laatikon pitää olla yhtä paljon kuin toinen puoli.',
          explain: `${a} + ${b} on ${a + b}, joten □ = ${a + b}. Vastaus voi olla myös merkin vasemmalla puolella.`,
        };
      },
      plates: (r) => {
        const k = r.pick(FOOD), n = r.int(2, 5);
        const other = n + r.pick([-1, 1]);
        return {
          say: 'Kummassa kuvassa molemmilla lautasilla on yhtä paljon?',
          task: choose(r, { art: platesArt(r, k, [n, n], 220) }, [{ art: platesArt(r, k, r.shuffle([n, other]), 220) }], ['Laske molemmat lautaset.'], 1),
          hint: 'Laske kummankin lautasen määrä.',
          explain: `Oikeassa kuvassa molemmilla lautasilla on ${n}.`,
        };
      },
      level: (r) => {
        const a = r.int(2, 4), b = r.int(1, 3), c = r.int(1, a + b - 1);
        return {
          say: `Vasemmalla on ${a} ja ${b} kiveä, oikealla ${c}. Lisää oikealle kiviä, kunnes vaaka on suorassa.`,
          task: { kind: 'balance' as const, left: [a, b], right: [c] },
          hint: `Vasemmalla on yhteensä ${a + b}. Oikealla on jo ${c}.`,
          explain: `${a} + ${b} = ${c} + ${a + b - c}. Molemmilla puolilla on ${a + b}.`,
        };
      },
    }, (r) => {
      const a = r.int(2, 4), b = r.int(1, 3), c = r.int(1, a + b - 1);
      const box = a + b - c;
      const opts = [...new Set([a + b, a + b + c])].filter((x) => x !== box);
      return {
        say: `Mikä luku sopii laatikkoon? ${a} + ${b} = ${c} + □`,
        scene: paint(big(`${a} + ${b} = ${c} + □`)),
        task: choose(r, n$(box), opts.map(n$), opts.map((x) => x === a + b ? `${a + b} on vasemman puolen summa. Oikealla puolella on jo ${c}, joten ${c} + ${a + b} olisi liikaa.` : 'Merkki = ei tarkoita "laske kaikki yhteen".')),
        hint: `Laske ensin vasen puoli. Paljonko oikealta vielä puuttuu, kun siellä on jo ${c}?`,
        explain: `Vasemmalla on ${a + b}. Oikealla on ${c} ja laatikko: ${c} + ${box} = ${a + b}. Molemmat puolet ovat yhtä paljon.`,
      };
    }),
  },
  {
    id: 'M-ARITH-01', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Merkkien kieli', icon: '🔣',
    intro: 'Kolme kivimerkkiä on valmiina. Nyt niillä kirjoitetaan kokonaisia laskulauseita.',
    reward: 'Osaat kirjoittaa laskun merkeillä!',
    demo: () => [
      { say: 'Kolme kalaa, tulee kaksi lisää, ja on viisi. Laskulauseena: kolme plus kaksi on yhtä paljon kuin viisi.', scene: signScene('kala', 3, 2, '+') },
      { say: 'Viisi kalaa, kaksi ui pois, jää kolme: viisi miinus kaksi on yhtä paljon kuin kolme.', scene: signScene('kala', 5, 2, '−') },
      { say: 'Tarinan voi kirjoittaa laskulauseeksi pala kerrallaan: pesässä kuusi munaa, lintu munii kolme lisää, nyt on yhdeksän.', scene: translateScene([['pesässä kuusi', '6'], ['munii kolme lisää', '+ 3'], ['nyt on yhdeksän', '= 9']]) },
    ],
    item: cases({
      missingSign: (r) => {
        const plus = r.chance(0.5), a = r.int(3, 7), b = r.int(1, plus ? 3 : a - 1);
        const c = plus ? a + b : a - b;
        return {
          say: `Mikä merkki puuttuu? ${a} □ ${b} = ${c}`,
          scene: paint(big(`${a} □ ${b} = ${c}`)),
          task: fixed(SIGNS.map(sign), plus ? 0 : 1, plus ? [undefined, `${a} − ${b} olisi ${a - b}, ei ${c}.`, 'Merkki = on jo laskun lopussa.'] : [`${a} + ${b} olisi ${a + b}, ei ${c}.`, undefined, 'Merkki = on jo laskun lopussa.'], 3),
          hint: `Onko ${c} enemmän vai vähemmän kuin ${a}?`,
          explain: `${a} ${plus ? '+' : '−'} ${b} = ${c}.`,
        };
      },
      story: (r) => {
        const plus = r.chance(0.5), a = r.int(4, 7), b = r.int(1, 3);
        const c = plus ? a + b : a - b;
        const s = plus ? `Pesässä on ${word(a)} munaa. Lintu munii ${word(b)} lisää.` : `Pesässä on ${word(a)} munaa. ${cap(word(b))} kuoriutuu ja poikaset lähtevät.`;
        return {
          say: `${s} Mikä laskulause kertoo tämän?`,
          task: choose(r, ex(`${a} ${plus ? '+' : '−'} ${b} = ${c}`), [ex(`${a} ${plus ? '−' : '+'} ${b} = ${plus ? a - b : a + b}`), ex(`${a} ${plus ? '+' : '−'} ${b} = ${c + 1}`)], [plus ? 'Munia tuli lisää, ei pois.' : 'Munia lähti pois, ei tullut lisää.', `Merkit ovat oikein, mutta ${a} ${plus ? '+' : '−'} ${b} on ${c}, ei ${c + 1}.`], 1),
          hint: plus ? 'Tuli lisää: mikä merkki? Laske sitten, montako on nyt.' : 'Lähti pois: mikä merkki? Laske sitten, montako jäi.',
          explain: `${a} ${plus ? '+' : '−'} ${b} = ${c}.`,
        };
      },
      trueFalse: (r) => {
        const plus = r.chance(0.5), a = r.int(3, 6), b = r.int(1, 3), ok = r.chance(0.5);
        const right = plus ? a + b : a - b;
        const c = right + (ok ? 0 : right === 0 ? 1 : r.pick([-1, 1])); // no negative numbers in grade 1–2
        const e = `${a} ${plus ? '+' : '−'} ${b} = ${c}`;
        return {
          say: `Onko tämä totta? ${e}`,
          scene: paint(big(e)),
          task: fixed(YES, ok ? 0 : 1, ok ? [undefined, `${a} ${plus ? '+' : '−'} ${b} on ${right}. Molemmat puolet ovat yhtä paljon, joten totta.`] : [`${a} ${plus ? '+' : '−'} ${b} on ${right}, ei ${c}.`, undefined], 2),
          hint: `Laske ensin ${a} ${plus ? '+' : '−'} ${b}. Onko tulos ${c}?`,
          explain: `${a} ${plus ? '+' : '−'} ${b} on ${plus ? a + b : a - b}. ${ok ? 'Totta.' : 'Ei totta.'}`,
        };
      },
      write: (r) => {
        const plus = r.chance(0.5), k = r.pick(FOOD), a = r.int(3, 6), b = r.pick([1, 2, 3].filter((x) => x !== a && (plus || (x < a && x !== a - x))));
        const c = plus ? a + b : a - b, op = plus ? '+' : '−';
        return {
          say: 'Kirjoita koko laskulause paloista: alussa, merkki, muutos, = ja lopussa.',
          scene: signScene(k, a, b, op, false),
          task: { kind: 'build' as const, mode: 'fact' as const, target: `${a} ${op} ${b} = ${c}`, tokens: r.shuffle([...new Set([a, b, c].map(String))]).concat(['+', '−', '=']), max: 5 },
          hint: `Alussa ${a}. ${plus ? 'Tuli lisää' : 'Lähti pois'} ${b}. Montako ${plus ? 'on nyt' : 'jäi'}?`,
          explain: `${a} ${op} ${b} = ${c}.`,
        };
      },
    }, (r) => {
      const a = r.int(5, 8), b = r.int(1, 3), plus = r.chance(0.5);
      const c = plus ? a + b : a - b, op = plus ? '+' : '−';
      return {
        say: `Mikä merkki puuttuu? ${c} = ${a} □ ${b}`,
        scene: paint(big(`${c} = ${a} □ ${b}`)),
        task: fixed(SIGNS.map(sign), plus ? 0 : 1, plus ? [undefined, `${a} − ${b} olisi ${a - b}.`, 'Merkki = on jo laskussa.'] : [`${a} + ${b} olisi ${a + b}.`, undefined, 'Merkki = on jo laskussa.'], 3),
        hint: `Lue lause lopusta: ${a} □ ${b} on ${c}. Onko ${c} enemmän vai vähemmän kuin ${a}?`,
        explain: `${a} ${op} ${b} = ${c}, joten ${c} = ${a} ${op} ${b}. Lause voi alkaa myös vastauksella.`,
      };
    }),
  },
  {
    id: 'M-SUB-01', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Aallon vietävää', icon: '🌊',
    intro: 'Aallot vievät rannalta simpukoita. Kun osa viedään pois, montako jää?',
    reward: 'Osaat vähentää: pois otettu ei enää ole mukana!',
    demo: () => [
      { say: 'Rannalla on viisi simpukkaa. Aalto vie kaksi mukanaan. Niiden paikalle jää tyhjä rengas. Jäljelle jää kolme: viisi miinus kaksi on kolme.', scene: signScene('simpukka', 5, 2, '−') },
      { say: 'Toinen tapa: Loikka seisoo kivellä viisi ja hyppää kaksi kertaa taaksepäin. Neljä, kolme. Lähtökivi ei ole hyppy.', scene: lineHops(5, -2, 0, 10) },
      { say: 'Isommasta luvusta: yhdeksän miinus kolme. Kahdeksan, seitsemän, kuusi.', scene: lineHops(9, -3, 0, 10) },
    ],
    item: cases({
      picture: (r) => {
        const k = r.pick(FOOD), a = r.int(4, 8), b = r.int(1, a - 1);
        return {
          say: 'Yliviivatut otetaan pois. Montako jää jäljelle?',
          scene: paint(takeArt(r, k, a, b, 300)),
          task: (() => { const ws = [...new Set([b, a, a - b + 1])].filter((x) => x !== a - b).slice(0, 2); return choose(r, n$(a - b), ws.map(n$), ws.map((x) => x === a ? `${a} on kaikki alussa. Yliviivatut eivät ole enää mukana.` : x === b ? `${b} on yliviivatut. Kysyttiin, montako jää.` : 'Laske uudelleen vain ne, joita ei ole yliviivattu.')); })(),
          hint: 'Laske vain ne, joita ei ole yliviivattu.',
          explain: `${a} − ${b} = ${a - b}.`,
        };
      },
      story: (r) => {
        const a = r.int(5, 9), b = r.int(2, a - 1), k = r.pick(['kala', 'marja']);
        return {
          say: `Ämpärissä on ${word(a)} ${many(k, a)}. Loikka antaa ${word(b)} Aavalle. Montako jää Loikalle?`,
          task: (() => { const ws = [...new Set([a + b, b, a - b - 1])].filter((x) => x !== a - b && x >= 0).slice(0, 2); return choose(r, n$(a - b), ws.map(n$), ws.map((x) => x === a + b ? 'Loikka antaa pois, joten hänelle jää vähemmän, ei enemmän.' : x === b ? `${b} on ne, jotka Aava sai. Kysyttiin, montako jää Loikalle.` : `Laske uudelleen: lähde luvusta ${a} ja laske ${b} taaksepäin.`)); })(),
          hint: `Loikalla on ${a}. ${cap(word(b))} lähtee pois. Laske taaksepäin.`,
          explain: `${a} − ${b} = ${a - b}. Annetut lähtivät pois Loikalta.`,
        };
      },
      expr: (r) => {
        const a = r.int(4, 10), b = r.int(1, Math.min(5, a));
        return {
          say: `Paljonko on ${a} − ${b}?`,
          scene: paint(big(`${a} − ${b}`)),
          task: (() => { const ws = [...new Set([a + b, a - b + 1, a - b - 1])].filter((x) => x !== a - b && x >= 0).slice(0, 2); return choose(r, n$(a - b), ws.map(n$), ws.map((x) => x === a + b ? `Miinus vie pois, joten tulos on pienempi kuin ${a}.` : x === a - b + 1 ? `Yksi askel jäi puuttumaan. Taaksepäin tulee ${b} askelta. Lähtöluku ${a} ei ole askel.` : `Yksi askel liikaa. Taaksepäin tulee vain ${b} askelta.`)); })(),
          hint: `Lähde luvusta ${a} ja laske ${b} askelta taaksepäin.`,
          explain: `${a} − ${b} = ${a - b}.`,
        };
      },
      back: (r) => {
        const s0 = r.int(5, 10), k = r.int(2, 4);
        return {
          say: `Loikka on kivellä ${s0} ja hyppää ${word(k)} kertaa taaksepäin. Napauta kivi, jolle se päätyy. Mikä on ${s0} − ${k}?`,
          task: { kind: 'line' as const, min: 0, max: 12, step: 1, answer: s0 - k, whyAt: { [s0 - k + 1]: `Lähtökivi ${s0} ei ole hyppy. Ensimmäinen hyppy vie kivelle ${s0 - 1}.`, [s0 + k]: 'Taaksepäin luvut pienenevät: hyppää vasemmalle.', [s0]: 'Loikka ei vielä hypännyt.' } },
          hint: `Lähde kiveltä ${s0}. Ensimmäinen hyppy vie kivelle ${s0 - 1}.`,
          explain: `${s0} − ${k} = ${s0 - k}: ${Array.from({ length: k }, (_, i) => s0 - 1 - i).join(', ')}.`,
        };
      },
    }, (r) => {
      const a = r.int(7, 10), b = r.int(1, 3), c = r.int(1, 3);
      return {
        say: `Puussa istuu ${word(a)} lintua. ${cap(word(b))} lentää pois. Sitten vielä ${word(c)} lentää pois. Montako jää puuhun?`,
        task: (() => { const ws = [...new Set([a - b, a - b + c, a - c])].filter((x) => x !== a - b - c).slice(0, 2); return choose(r, n$(a - b - c), ws.map(n$), ws.map((x) => x === a - b ? `Toinen parvi unohtui: ${a} − ${b} on vasta ${a - b}.` : x === a - c ? `Ensimmäinen parvi unohtui: ${b} lensi pois ensin.` : `Toiset ${c} lensivät pois, eivät tulleet lisää.`)); })(),
        hint: 'Kaksi kertaa lentää pois. Vähennä ensin ensimmäiset, sitten toiset.',
        explain: `${a} − ${b} = ${a - b}, ja ${a - b} − ${c} = ${a - b - c}.`,
      };
    }),
  },

  // ============================================================ kympit
  {
    id: 'M-PLACE-01', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Kaislanippu', icon: '🌾',
    intro: 'Lauttaan tarvitaan kaislanippuja. Yhteen nippuun sidotaan aina kymmenen kaislaa.',
    reward: 'Kymmenen yksittäistä on yksi kymppi!',
    demo: () => [
      { say: 'Lasketaan kaislat yksi kerrallaan. Kun kaisloja on kymmenen, ne sidotaan yhdeksi nipuksi. Nippu on yksi kymppi, ja siinä on kymmenen kaislaa.', scene: bundleScene(10) },
      { say: 'Kaisloja on kolmetoista. Kymmenen sidotaan nippuun, ja kolme jää irralleen. Kolmetoista on kymmenen ja kolme.', scene: bundleScene(13) },
      { say: 'Kaksikymmentäneljä kaislaa: kaksi nippua ja neljä irrallista.', scene: bundleScene(24) },
    ],
    item: cases({
      enough: (r) => {
        const n = r.pick([7, 8, 9, 10, 11, 12]);
        return {
          say: 'Riittävätkö nämä kaislat yhteen nippuun?',
          scene: paint(reedsArt(0, n)),
          task: fixed([txt('Riittää'), txt('Ei riitä')], n >= 10 ? 0 : 1, n >= 10 ? [undefined, `Kaisloja on ${n}. Kymmenen löytyy.`] : [`Kaisloja on vain ${n}. Nippuun tarvitaan kymmenen.`, undefined], 2),
          hint: 'Laske kaislat. Yhteen nippuun tarvitaan kymmenen.',
          explain: `Kaisloja on ${word(n)}. ${n >= 10 ? 'Se riittää nippuun.' : `Kymmeneen puuttuu ${10 - n}.`}`,
        };
      },
      missing: (r) => {
        const n = r.int(5, 9);
        return {
          say: 'Montako kaislaa puuttuu, jotta saadaan kymmenen nippu?',
          scene: paint(reedsArt(0, n)),
          task: choose(r, n$(10 - n), [...new Set([n, 10 - n + 1, 10])].filter((x) => x !== 10 - n).slice(0, 2).map(n$), [n, 10 - n + 1, 10].filter((x) => x !== 10 - n).slice(0, 2).map((x) => x === n ? `Kaisloja on jo ${n}. Kysyttiin, montako puuttuu.` : x === 10 ? 'Kymmenen on koko nippu. Osa kaisloista on jo valmiina.' : `${n} + ${x} = ${n + x}, yksi liikaa.`)),
          hint: `Laske kaislat. Jatka sitten laskemista kymmeneen asti: ${n + 1}, …`,
          explain: `${n} + ${10 - n} = 10. Puuttuu ${word(10 - n)}.`,
        };
      },
      tie: (r) => {
        const n = r.int(12, 17);
        return {
          say: `Rannalla on ${word(n)} kaislaa. Kerää niistä tasan kymmenen nippuun ja sido nippu.`,
          task: { kind: 'bundle' as const, n },
          hint: 'Laske ääneen jokaisen kaislan kohdalla. Kymmenennen jälkeen lopeta.',
          explain: `Nippuun meni kymmenen, ja irralleen jäi ${word(n - 10)}: ${n} = 10 + ${n - 10}.`,
        };
      },
      bundles: (r) => {
        const t = r.int(2, 5);
        return {
          say: `Kaisloja on ${word(t * 10)}. Montako kymmenen nippua niistä saa?`,
          task: choose(r, n$(t), [n$(t * 10), n$(t + 1)], ['Tämä on kaislojen määrä. Kysyttiin nippujen määrää.', `${t + 1} nippuun tarvittaisiin ${(t + 1) * 10} kaislaa.`]),
          hint: 'Jokaisessa nipussa on kymmenen. Laske kymmenin.',
          explain: `${Array(t).fill(10).join(' + ')} = ${t * 10}. Nippuja on ${t}.`,
        };
      },
    }, (r) => {
      const o = r.int(2, 7), n = 10 + o;
      return {
        say: `Kaisloja on ${word(n)}. Loikka sitoo niistä yhden kymmenen nipun. Montako kaislaa jää irralleen?`,
        scene: paint(reedsArt(0, n)),
        task: choose(r, n$(o), [n$(10), n$(n)], ['Nippuun meni kymmenen. Kysyttiin irrallisia.', `${n} on kaikki kaislat. Kymmenen niistä meni nippuun.`]),
        hint: `Nippuun menee kymmenen. Montako jää, kun luvusta ${n} otetaan kymmenen?`,
        explain: `${n} = 10 + ${o}. Yksi nippu ja ${o} irrallista.`,
      };
    }),
  },
  {
    id: 'M-PLACE-02', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Nipputori', icon: '🪵',
    intro: 'Kaislat myydään nippuina ja irrallisina. Luvusta näkee, montako kumpaakin on.',
    reward: 'Luvun numerot kertovat niput ja irtokaislat!',
    demo: () => [
      { say: 'Kolme nippua ja neljä irtokaislaa. Niput lasketaan kymmenin: kymmenen, kaksikymmentä, kolmekymmentä. Sitten irtokaislat: kolmekymmentäyksi, …, kolmekymmentäneljä. Niput menevät kymmenten numeroksi 3, irtokaislat ykkösten numeroksi 4.', scene: placeScene(3, 4) },
      { say: 'Neljäkymmentä: neljä nippua eikä yhtään irtokaislaa. Nolla ykkösten paikalla kertoo, että irtokaisloja ei ole.', scene: placeScene(4, 0) },
    ],
    item: cases({
      picToNum: (r) => {
        const t = r.int(1, 5), o = r.int(1, 9);
        const opts = [...new Set([o * 10 + t, t + o, t * 10 + o + 10])].filter((x) => x !== t * 10 + o).slice(0, 2);
        return {
          say: 'Montako kaislaa kuvassa on?',
          scene: paint(reedsArt(t, o)),
          task: choose(r, n$(t * 10 + o), opts.map(n$), opts.map((x) => (x === o * 10 + t ? 'Niput ja irtokaislat menivät väärin päin.' : x === t + o ? 'Jokaisessa nipussa on kymmenen, ei yksi.' : undefined))),
          hint: 'Laske niput kymmenin: kymmenen, kaksikymmentä... sitten irtokaislat.',
          explain: `${t} ${t === 1 ? 'nippu' : 'nippua'} on ${t * 10}, ja ${o} lisää: ${t * 10 + o}.`,
        };
      },
      numToPic: (r) => {
        const t = r.int(1, 4), o = r.int(1, 6);
        const wrong = [o !== t ? reedsArt(o, t) : reedsArt(t + 1, o), reedsArt(t, o === 6 ? o - 1 : o + 1)];
        return {
          say: `Missä kuvassa on ${word(t * 10 + o)} kaislaa?`,
          scene: paint(big(String(t * 10 + o), 160)),
          task: choose(r, { art: reedsArt(t, o) }, wrong.map((art) => ({ art })), [o !== t ? `Tässä on ${o} nippua ja ${t} irtokaislaa: väärin päin.` : `Tässä on ${t + 1} nippua: yksi liikaa.`, `Tässä on ${o === 6 ? o - 1 : o + 1} irtokaislaa. Viimeinen numero ${o} kertoo irtokaislat.`], 1),
          hint: `Ensimmäinen numero ${t} kertoo niput, viimeinen ${o} irtokaislat.`,
          explain: `${t * 10 + o}: ${t} ${t === 1 ? 'nippu' : 'nippua'} ja ${o} irtokaislaa.`,
        };
      },
      order: (r) => {
        const T = r.int(1, 5), O = r.pick([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== T)), n = T * 10 + O;
        return {
          say: `Torille tulee tilaus: ${word(n)} kaislaa. Kokoa tilaus nipuista ja irtokaisloista.`,
          scene: paint(big(String(n), 160)),
          task: { kind: 'reeds' as const, target: n },
          hint: `Ensimmäinen numero ${T} kertoo nippujen määrän, viimeinen ${O} irtokaislojen.`,
          explain: `${n} = ${T * 10} + ${O}: ${T} ${T === 1 ? 'nippu' : 'nippua'} ja ${O} irtokaislaa.`,
        };
      },
      digit: (r) => {
        // Different digits, so "the digit 4" names exactly one place (no 44).
        const t = r.int(2, 8), o = r.pick([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== t));
        const which = r.chance(0.5) ? 't' : 'o';
        const d = which === 't' ? t : o;
        return {
          say: `Mitä numero ${d} tarkoittaa luvussa ${t * 10 + o}?`,
          scene: paint(big(String(t * 10 + o), 160)),
          task: choose(r, { art: which === 't' ? reedsArt(d, 0, 0) : reedsArt(0, d, 0), speak: which === 't' ? `${word(d)} nippua` : `${word(d)} irtokaislaa` },
            [{ art: which === 't' ? reedsArt(0, d, 0) : reedsArt(d, 0, 0), speak: which === 't' ? `${word(d)} irtokaislaa` : `${word(d)} nippua` }], [which === 't' ? 'Ensimmäinen numero kertoo kymmenet eli niput.' : 'Viimeinen numero kertoo ykköset eli irtokaislat.'], 1),
          hint: 'Ensimmäinen numero kertoo niput, viimeinen irtokaislat.',
          explain: which === 't' ? `${d} on kymmenten paikalla: ${d} nippua eli ${d * 10}.` : `${d} on ykkösten paikalla: ${d} irtokaislaa.`,
        };
      },
    }, (r) => {
      const t = r.int(2, 5);
      return {
        say: `Missä kuvassa on ${word(t * 10)} kaislaa?`,
        scene: paint(big(String(t * 10), 160)),
        task: choose(r, { art: reedsArt(t, 0) }, [{ art: reedsArt(0, t) }, { art: reedsArt(t, t) }], ['Nämä ovat irtokaisloja. Nolla ykkösten paikalla tarkoittaa: ei yhtään irtokaislaa.', 'Nolla tarkoittaa, ettei irtokaisloja ole.'], 1),
        hint: `Ensimmäinen numero ${t} kertoo niput. Mitä nolla kertoo irtokaisloista?`,
        explain: `${t * 10}: ${t} nippua ja nolla irtokaislaa.`,
      };
    }),
  },
  {
    id: 'M-PLACE-03', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Lautan rakentaja', icon: '🛶',
    intro: 'Lautta kootaan nipuista ja irtokaisloista. Saman luvun voi koota monella tavalla.',
    reward: 'Lautta on valmis! Osaat koota ja purkaa lukuja.',
    demo: () => [
      { say: 'Neljä nippua ja kuusi irtokaislaa: neljä kymppiä ja kuusi ykköstä. 46 on 40 ja 6.', scene: placeScene(4, 6) },
      { say: 'Lautan reunaan tarvitaan irtokaisloja. Avataan yksi nippu: sen kymmenen kaislaa lähtevät irtokaislojen luo. Nyt on kolme nippua ja kuusitoista irtokaislaa. Luku on yhä 46: 46 = 30 + 16.', scene: unbundleScene(4, 6) },
      { say: 'Sama toimii kaikilla luvuilla: 23 on kaksi nippua ja kolme irtokaislaa, tai yksi nippu ja kolmetoista irtokaislaa.', scene: unbundleScene(2, 3) },
    ],
    item: cases({
      compose: (r) => {
        const t = r.int(1, 8), o = r.int(1, 9);
        const opts = [...new Set([o * 10 + t, t + o, t * 10 + o + 1])].filter((x) => x !== t * 10 + o).slice(0, 2);
        return {
          say: `${cap(word(t))} ${t === 1 ? 'kymppi' : 'kymppiä'} ja ${word(o)} ${o === 1 ? 'ykkönen' : 'ykköstä'}. Mikä luku se on?`,
          scene: paint(reedsArt(t, o)),
          task: choose(r, n$(t * 10 + o), opts.map(n$), opts.map((x) => (x === o * 10 + t ? `${x} olisi ${o} kymppiä ja ${t} ykköstä. Kympit kirjoitetaan ensin, ykköset viimeiseksi.` : x === t + o ? `${t} + ${o} = ${x}, mutta kymppi on kymmenen, ei yksi: ${t * 10} + ${o}.` : `${x} olisi ${t} kymppiä ja ${o + 1} ykköstä.`))),
          hint: 'Ensimmäinen numero kertoo kympit, viimeinen ykköset.',
          explain: `${t * 10} + ${o} = ${t * 10 + o}.`,
        };
      },
      split: (r) => {
        const t = r.int(2, 9), o = r.int(1, 9), n = t * 10 + o;
        const first = r.chance(0.5);
        return {
          say: first ? `Mikä luku sopii laatikkoon? ${n} = ${t * 10} + □` : `Mikä luku sopii laatikkoon? ${n} = □ + ${o}`,
          scene: paint(big(first ? `${n} = ${t * 10} + □` : `${n} = □ + ${o}`)),
          task: (() => {
            const ws = first ? [...new Set([t, o * 10, o + 1])].filter((x) => x !== o).slice(0, 2) : [...new Set([t, n - 1, t * 10 + 10])].filter((x) => x !== t * 10).slice(0, 2);
            const why = (x: number) => first
              ? (x === t ? `${t} on kymppien määrä. Laatikkoon tulevat ykköset.` : x === o * 10 ? `${x} olisi ${o} kymppiä. Tässä ${o} on ykköset.` : `${t * 10} + ${x} = ${t * 10 + x}, ei ${n}.`)
              : (x === t ? `${t} kymppiä on ${t * 10}, ei ${t}.` : `${x} + ${o} = ${x + o}, ei ${n}.`);
            return choose(r, n$(first ? o : t * 10), ws.map(n$), ws.map(why));
          })(),
          hint: first ? `Mitä jää, kun luvusta ${n} otetaan kympit pois?` : `Montako kymppiä luvussa ${n} on? Jokainen on kymmenen.`,
          explain: `${n} = ${t * 10} + ${o}.`,
        };
      },
      build: (r) => {
        const t = r.int(1, 4), o = r.int(2, 8), n = t * 10 + o;
        return {
          say: `Missä kuvassa on luku ${n}?`,
          task: choose(r, { art: reedsArt(t, o) }, [{ art: o !== t ? reedsArt(o, t) : reedsArt(t + 1, o) }, { art: reedsArt(t, o - 1) }], [o !== t ? `Niput ja irtokaislat ovat väärin päin: siinä on ${o * 10 + t}.` : `Siinä on ${t + 1} nippua: ${n + 10}.`, `Siinä on vain ${o - 1} irtokaislaa: ${n - 1}.`], 1),
          hint: `Etsi kuva, jossa on ${t} ${t === 1 ? 'nippu' : 'nippua'} ja ${o} irtokaislaa.`,
          explain: `${n}: ${t} ${t === 1 ? 'kymppi' : 'kymppiä'} ja ${o} ykköstä.`,
        };
      },
      open: (r) => {
        const t = r.int(2, 5), o = r.int(0, 7), n = t * 10 + o;
        return {
          say: `Lautan reunaan tarvitaan paljon irtokaisloja. Pidä luku ${n}, mutta tee siitä ${t - 1 === 1 ? 'yksi nippu' : `${word(t - 1)} nippua`} ja irtokaisloja. Avaa nippu!`,
          task: { kind: 'reeds' as const, target: n, tens: t - 1 },
          hint: 'Avatusta nipusta tulee kymmenen irtokaislaa. Kaislojen määrä ei muutu.',
          explain: `${n} = ${(t - 1) * 10} + ${o + 10}: ${t - 1} ${t - 1 === 1 ? 'nippu' : 'nippua'} ja ${o + 10} irtokaislaa.`,
        };
      },
    }, (r) => {
      const t = r.int(3, 6), o = r.int(1, 8), n = t * 10 + o;
      return {
        say: `Loikka avaa yhden nipun luvusta ${n}. Nyt on ${word(t - 1)} kymppiä ja □ ykköstä. Mikä luku sopii laatikkoon?`,
        scene: unbundleScene(t, o, false),
        task: choose(r, n$(10 + o), [n$(o), n$(o + 1)], [`${o} oli ennen avaamista. Avatun nipun kymmenen kaislaa ovat nyt ykkösiä.`, 'Nipusta tulee kymmenen kaislaa, ei yksi.']),
        hint: `Irtokaisloja oli ${o}. Paljonko tulee lisää, kun nippu avataan?`,
        explain: `${n} = ${(t - 1) * 10} + ${10 + o}. Avatun nipun kymmenen kaislaa tulivat ykkösiin.`,
      };
    }),
  },

  // ============================================================ eväät: partitive division
  {
    id: 'M-DIV-01', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Reilu jako', icon: '🍓',
    intro: 'Ystävät tulevat eväille. Marjat jaetaan niin, että jokainen saa yhtä monta.',
    reward: 'Jako meni reilusti: kaikki saivat yhtä monta!',
    demo: () => [
      { say: 'Kuusi marjaa jaetaan kolmen ystävän eväspusseihin. Annetaan yksi kerrallaan jokaiseen vuorotellen, kunnes kasa loppuu. Nyt jokaisessa on kaksi: kuusi jaettuna kolmelle on kaksi kullekin.', scene: roundRobin('marja', 6, 3) },
      { say: 'Kun ystäviä on vähemmän, kukin saa enemmän: kuusi jaettuna kahdelle on kolme.', scene: roundRobin('marja', 6, 2) },
    ],
    item: cases({
      deal: (r) => {
        const k = r.int(2, 4), per = r.int(2, 4), n = k * per, f = r.pick(['marja', 'kala', 'simpukka']);
        return {
          say: `${cap(many(f, 2))} on ${word(n)}. Ne jaetaan tasan ${ALL[k]} ystävälle. Montako kukin saa?`,
          scene: paint(groupArt(r, f, n, 'line', 300, n > 10 ? 100 : 60, 24)),
          task: (() => {
            const ws = [...new Set([k, n, per + 1])].filter((x) => x !== per).slice(0, 2);
            const why = (x: number) => x === k ? `${cap(word(k))} on ystävien määrä.` : x === n ? `${cap(word(n))} on kaikkien määrä. Jokainen saa vain osan.` : `Jos kukin saisi ${x}, tarvittaisiin ${x * k}.`;
            return choose(r, n$(per), ws.map(n$), ws.map(why));
          })(),
          hint: 'Anna yksi kerrallaan jokaiselle, kunnes marjat loppuvat.',
          explain: `${Array(k).fill(per).join(' + ')} = ${n}. Kukin saa ${per}.`,
        };
      },
      fair: (r) => {
        const k = 3, per = r.int(2, 4), f = r.pick(FOOD);
        const un = () => r.shuffle([per - 1, per, per + 1]);
        return {
          say: 'Missä kuvassa jako on reilu?',
          task: choose(r, { art: platesArt(r, f, Array(k).fill(per)) }, [{ art: platesArt(r, f, un()) }, { art: platesArt(r, f, r.shuffle([per, per, per + 1])) }], ['Joku saa enemmän kuin toinen.', 'Joku saa enemmän kuin toinen.'], 1),
          hint: 'Laske jokaisen lautasen määrä ja vertaa.',
          explain: `Reilussa jaossa jokainen saa yhtä monta: ${per}.`,
        };
      },
      share: (r) => {
        const k = r.int(2, 4), per = r.int(2, 4), f = r.pick(['marja', 'kala', 'simpukka']);
        return {
          say: `Jaa ${word(k * per)} ${many(f, k * per)} ${k === 2 ? 'kahden' : k === 3 ? 'kolmen' : 'neljän'} ystävän pusseihin niin, että jokainen saa yhtä monta.`,
          task: { kind: 'pack' as const, k, g: per, thing: f, pile: k * per },
          hint: 'Anna yksi kerrallaan jokaiseen pussiin vuorotellen, kunnes kasa loppuu.',
          explain: `${Array(k).fill(per).join(' + ')} = ${k * per}: ${k * per} jaettuna ${ALL[k]} on ${per} kullekin.`,
        };
      },
      story: (r) => {
        const k = r.pick([2, 3]), per = r.int(2, 5), n = k * per;
        return {
          say: `Aavalla on ${word(n)} kalaa ja ${word(k)} poikasta. Jokainen poikanen saa yhtä monta. Montako kalaa kukin saa?`,
          task: (() => {
            const ws = [...new Set([k, n - k, per + 1])].filter((x) => x !== per && x > 0).slice(0, 2);
            const why = (x: number) => x === k ? `${cap(word(k))} on poikasten määrä.` : x === n - k ? `Vähensit poikasten määrän. Kalat jaetaan, ei vähennetä.` : `Jos kukin saisi ${x}, kaloja tarvittaisiin ${x * k}.`;
            return choose(r, n$(per), ws.map(n$), ws.map(why));
          })(),
          hint: `Anna kaloja yksi kerrallaan jokaiselle poikaselle, kunnes ${word(n)} on jaettu.`,
          explain: `${n} jaettuna ${k} poikaselle: kukin saa ${per}, koska ${Array(k).fill(per).join(' + ')} = ${n}.`,
        };
      },
    }, (r) => {
      const k = r.int(2, 4), per = r.int(2, 4);
      return {
        say: `${cap(word(k))} ystävää jakoi marjat reilusti. Jokainen sai ${word(per)}. Montako marjaa oli alussa?`,
        task: (() => {
          const ws = [...new Set([k + per, per, k * per + per])].filter((x) => x !== k * per).slice(0, 2);
          const why = (x: number) => x === k + per ? 'Ystävien ja marjojen määrää ei lasketa yhteen.' : x === per ? `${per} on yhden ystävän osuus. Kaikilla ${k}:lla oli yhtä monta.` : `Siinä on yksi ystävä liikaa: ystäviä on ${k}.`;
          return choose(r, n$(k * per), ws.map(n$), ws.map(why));
        })(),
        hint: `Pura jako: ${k} ystävää, jokaisella ${per}. Laske kaikki yhteen.`,
        explain: `${Array(k).fill(per).join(' + ')} = ${k * per}. Jaon voi purkaa takaisin.`,
      };
    }),
  },

  // ============================================================ mitat: metre and centimetre
  {
    id: 'M-MEAS-03', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Mittanauha', icon: '📏',
    intro: 'Aava mittaa viiritankoa. Pieniä asioita mitataan senttimetreinä, isoja metreinä.',
    reward: 'Osaat valita metrin tai sentin ja lukea viivoitinta!',
    demo: () => [
      { say: 'Viivoittimessa jokainen väli on yksi senttimetri. Keppi alkaa nollasta. Lasketaan välit: yksi, kaksi, kolme, neljä, viisi, kuusi. Keppi on kuusi senttimetriä.', scene: rulerScene(0, 6) },
      { say: 'Jos keppi ei ala nollasta, loppukohta ei kerro pituutta. Lasketaan välit kohdasta kaksi kohtaan seitsemän: viisi senttiä.', scene: rulerScene(2, 7) },
      { say: 'Kymmenen senttiä, kaksikymmentä, … sata senttiä. Sata senttimetriä on yksi metri.', scene: metreScene() },
    ],
    item: cases({
      unit: (r) => {
        const [what, cm] = r.pick([['lyijykynän', true], ['muurahaisen', true], ['kirjan', true], ['luokkahuoneen', false], ['uima-altaan', false], ['puun korkeuden', false]] as [string, boolean][]);
        return {
          say: `Mitataanko ${what} pituus senttimetreinä vai metreinä?`,
          task: fixed([txt('senttimetreinä'), txt('metreinä')], cm ? 0 : 1, cm ? [undefined, 'Metri on pitkä, noin askeleen mittainen. Tämä on paljon lyhyempi.'] : ['Senttimetri on pieni, sormen leveyden verran. Tämä on paljon pidempi.', undefined], 2),
          hint: 'Mahtuuko se kämmenelle? Silloin senttimetreinä.',
          explain: cm ? 'Pieni asia: senttimetreinä.' : 'Iso asia: metreinä.',
        };
      },
      estimate: (r) => {
        const [what, right, w1, w2] = r.pick([['lyijykynä', '15 cm', '15 m', '1 cm'], ['ovi', '2 m', '2 cm', '20 m'], ['sammakko', '8 cm', '8 m', '80 m'], ['sänky', '2 m', '2 cm', '20 cm']] as string[][]);
        return {
          say: `Kuinka pitkä on ${what}?`,
          task: choose(r, txt(right!), [txt(w1!), txt(w2!)], [w1!, w2!].map((w) => w.endsWith(' m') && !right!.endsWith(' m') ? `${w} olisi pidempi kuin huone. Katso yksikköä: metri vai sentti?` : w.endsWith(' cm') && right!.endsWith(' m') ? `${w} mahtuisi kämmenelle. ${cap(what!)} on paljon isompi.` : `${w} on liian ${parseFloat(w) > parseFloat(right!) ? 'pitkä' : 'lyhyt'}.`)),
          hint: 'Mieti ensin yksikkö: sentti vai metri? Sitten luku.',
          explain: `${cap(what!)} on noin ${right}.`,
        };
      },
      mark: (r) => {
        const a = r.int(0, 3), len = r.int(2, 6), b = a + len;
        const whyAt: Record<number, string> = {};
        if (a > 0) whyAt[len] = `Keppi alkaa kohdasta ${a}, ei nollasta. Laske ${len} väliä kohdasta ${a} eteenpäin.`;
        whyAt[b - 1] = 'Yksi väli jäi laskematta.';
        whyAt[b + 1] = 'Laskit yhden välin liikaa.';
        return {
          say: `Keppi alkaa kohdasta ${a} ja on ${word(len)} senttimetriä pitkä. Napauta kohta, johon keppi loppuu.`,
          scene: paint(startArt(a)),
          task: { kind: 'line' as const, min: 0, max: 10, step: 1, answer: b, labelEvery: 1, unit: 'cm', whyAt },
          hint: `Lähde kohdasta ${a} ja hyppää ${word(len)} väliä.`,
          explain: `${a} + ${len} = ${b}. Keppi loppuu kohtaan ${b}.`,
        };
      },
      ruler: (r) => {
        const a = r.chance(0.5) ? 0 : r.int(1, 3), len = r.int(3, 7), b = a + len;
        const opts = [...new Set([b, len + 1, len - 1])].filter((x) => x !== len).slice(0, 2);
        return {
          say: 'Kuinka monta senttimetriä keppi on?',
          scene: paint(rulerArt(10, a, b)),
          task: choose(r, txt(`${len} cm`), opts.map((x) => txt(`${x} cm`)), opts.map((x) => (x === b && a > 0 ? `Keppi ei ala nollasta. Laske välit kohdasta ${a} kohtaan ${b}.` : undefined))),
          hint: 'Katso, mistä keppi alkaa ja mihin se loppuu. Laske välit.',
          explain: `Kohdasta ${a} kohtaan ${b} on ${len} väliä: ${len} cm.`,
        };
      },
    }, (r) => {
      const short = r.pick([80, 90, 95]);
      const [p, q] = r.shuffle(['Loikka', 'Aava']);
      return {
        say: `${p} hyppäsi yhden metrin. ${q} hyppäsi ${short} senttimetriä. Kumpi hyppäsi pidemmälle?`,
        task: choose(r, txt(p!), [txt(q!), txt('Yhtä pitkälle')], [`${short} on isompi luku kuin 1, mutta metri on sata senttiä.`, `Ei aivan: ${short} cm on vähemmän kuin 100 cm.`], 3),
        hint: 'Muuta metri senteiksi: 1 m = 100 cm.',
        explain: `1 m = 100 cm, ja 100 cm on enemmän kuin ${short} cm.`,
      };
    }),
  },

  // ============================================================ kioski: mass and capacity
  {
    id: 'M-MEAS-05', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Kioskin vaaka', icon: '⚖️',
    intro: 'Kioskilla on vanha vaaka. Painavampi puoli painuu alas.',
    reward: 'Osaat lukea vaakaa: painavampi painuu alas!',
    demo: () => [
      { say: 'Kivi vasemmalle, lehti oikealle. Vaaka heilahtaa ja asettuu: kivi painuu alas, joten kivi on painavampi.', scene: weighScene(['kivi'], ['lehti'], -1, 'Kivi on alhaalla: kivi on painavampi. Lehti nousi ylös: se on kevyempi.') },
      { say: 'Iso ei aina ole painava. Kolme isoa lehteä vasemmalle, pieni kivi oikealle. Kivi painaa vaa\'an alas.', scene: weighScene(['lehti', 'lehti', 'lehti'], ['kivi'], 1, 'Pieni kivi painoi alas: se on painavampi kuin iso lehtikasa.') },
      { say: 'Kun molemmilla puolilla on yhtä paljon painoa, vaaka jää suoraan.', scene: weighScene(['simpukka', 'simpukka'], ['simpukka', 'simpukka'], 0, 'Vaaka on suorassa: puolet ovat yhtä painavat.') },
    ],
    item: cases({
      balance: (r) => {
        const [a, b] = r.shuffle(['kivi', 'kapy', 'simpukka', 'marja']).slice(0, 2) as string[];
        const tilt = r.pick([-1, 1] as const);
        const heavy = tilt === -1 ? a! : b!, light = tilt === -1 ? b! : a!;
        return {
          say: 'Kumpi on painavampi?',
          scene: paint(balanceArt([a!], [b!], tilt)),
          task: choose(r, { art: icon(heavy), speak: THINGS[heavy]!.one }, [{ art: icon(light), speak: THINGS[light]!.one }, txt('Yhtä painavat')], [`${cap(THINGS[light]!.one)} on ylhäällä. Kevyempi puoli nousee ylös.`, 'Vaaka on vinossa, joten toinen on painavampi. Yhtä painavat pitävät vaa\'an suorassa.'], 3),
          hint: 'Kumpi kuppi on alempana?',
          explain: `${cap(THINGS[heavy]!.one)} painuu alas, joten se on painavampi.`,
        };
      },
      size: (r) => {
        const n = r.int(3, 4);
        const tilt = r.pick([-1, 1] as const);
        const left = tilt === -1 ? ['kivi'] : Array(n).fill('lehti'), right = tilt === -1 ? Array(n).fill('lehti') : ['kivi'];
        return {
          say: 'Kumpi on painavampi: pieni kivi vai iso lehtikasa?',
          scene: paint(balanceArt(left, right, tilt)),
          task: choose(r, { art: icon('kivi'), speak: 'kivi' }, [{ art: icon('lehti'), speak: 'lehtikasa' }, txt('Yhtä painavat')], ['Lehtikasa on isompi, mutta se nousi ylös. Vaaka näyttää painon, ei kokoa.', 'Vaaka on vinossa, joten toinen on painavampi.'], 3),
          hint: 'Älä katso kokoa. Katso, kumpi puoli on alhaalla.',
          explain: 'Kivi painuu alas. Iso ei aina ole painavampi.',
        };
      },
      equal: (r) => {
        const k = r.pick(['marja', 'kapy', 'simpukka']), n = r.int(2, 4);
        return {
          say: 'Vaaka on suorassa. Kumpi puoli on painavampi?',
          scene: paint(balanceArt(Array(n).fill(k), Array(n).fill(k), 0)),
          task: choose(r, txt('Yhtä painavat'), [txt('Vasen'), txt('Oikea')], ['Jos vasen olisi painavampi, vasen kuppi olisi alhaalla. Nyt kupit ovat yhtä korkealla.', 'Jos oikea olisi painavampi, oikea kuppi olisi alhaalla. Nyt kupit ovat yhtä korkealla.'], 3),
          hint: 'Onko kumpikaan kuppi alempana?',
          explain: 'Suorassa oleva vaaka tarkoittaa: yhtä painavat.',
        };
      },
      weigh: (r) => {
        const names = ['A', 'B', 'C'], w = r.shuffle([1, 2, 3]), light = r.chance(0.35);
        return {
          say: `Kioskilla on kolme pakettia. Punnitse niitä kaksi kerrallaan ja etsi ${light ? 'kevyin' : 'painavin'}.`,
          task: { kind: 'weigh' as const, names, w, light },
          hint: light ? 'Kevyempi nousee ylös. Punnitse se, joka nousi, vielä kolmannen kanssa.' : 'Painavampi painuu alas. Punnitse voittaja vielä kolmannen kanssa.',
          explain: `${light ? 'Kevyin' : 'Painavin'} on ${names[w.indexOf(light ? 1 : 3)]}. Se ${light ? 'nousi' : 'painui alas'} kummankin muun paketin kanssa.`,
        };
      },
    }, (r) => {
      const [a, b] = r.shuffle(['höyheniä', 'kiviä']);
      return {
        say: `Kumpi on painavampi: kilo ${a} vai kilo ${b}?`,
        task: choose(r, txt('Yhtä painavat'), [txt(`kilo ${a}`), txt(`kilo ${b}`)], [a, b].map((x) => x === 'kiviä' ? 'Kivikilo on pieni kasa, mutta se painaa saman kilon kuin höyhenkilo.' : 'Höyhenkilo on iso kasa, mutta se painaa saman kilon kuin kivikilo.'), 1),
        hint: 'Kumpaakin on kilo. Mitä vaaka näyttäisi?',
        explain: 'Molemmat painavat kilon. Höyhenkasa on vain paljon isompi.',
      };
    }),
  },
  {
    id: 'M-MEAS-06', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Marjapunnitus', icon: '🍎',
    intro: 'Marjat myydään painon mukaan. Kevyet asiat punnitaan grammoina, painavat kilogrammoina.',
    reward: 'Kilo on tuhat grammaa: osaat punnita kuin kauppias!',
    demo: () => [
      { say: 'Laitetaan yksi marja vaa\'alle. Osoitin tuskin liikkuu: marja painaa noin yhden gramman. Gramma on tosi kevyt.', scene: onScaleScene(THINGS.marja!.draw(150, 120, 22), 1, 'Marja: noin 1 g') },
      { say: 'Kymmenen sadan gramman pussia vaa\'alle yksi kerrallaan. Osoitin kiertää: sata, kaksisataa… tuhat grammaa. Tuhat grammaa on yksi kilogramma.', scene: kiloScene() },
      { say: 'Litran maitopurkki painaa noin kilon. Osoitin pysähtyy kohtaan yksi kilo.', scene: onScaleScene(MILK, 1000, 'Maitopurkki: noin 1 kg = 1000 g') },
    ],
    item: cases({
      unit: (r) => {
        const [what, g] = r.pick([['marja', true], ['kolikko', true], ['lyijykynä', true], ['perunasäkki', false], ['koira', false], ['ihminen', false]] as [string, boolean][]);
        return {
          say: `Punnitaanko ${what} grammoina vai kilogrammoina?`,
          task: fixed([txt('grammoina'), txt('kilogrammoina')], g ? 0 : 1, g ? [undefined, 'Tämä on kevyt. Kilo olisi liian iso yksikkö.'] : ['Tämä on painava. Grammoja tulisi tuhansia.', undefined], 2),
          explain: g ? 'Kevyt: grammoina.' : 'Painava: kilogrammoina.',
        };
      },
      estimate: (r) => {
        const [what, right, w1, w2, y1, y2] = r.pick([
          ['maitopurkki', '1 kg', '1 g', '100 kg', 'Yksi gramma on yhden marjan paino. Maitopurkki on paljon painavampi.', '100 kg painaa aikuinen ihminen tai enemmän. Maitopurkin jaksaa nostaa yhdellä kädellä.'],
          ['omena', '150 g', '150 kg', '1 g', '150 kg olisi painavampi kuin kaksi aikuista.', 'Omena on paljon painavampi kuin yksi marja.'],
          ['polkupyörä', '15 kg', '15 g', '150 kg', '15 g on vain muutaman kolikon paino.', '150 kg painaa enemmän kuin kaksi aikuista. Pyörän jaksaa nostaa.'],
          ['kolikko', '5 g', '5 kg', '500 g', '5 kg on kuin viisi maitopurkkia.', '500 g on puoli maitopurkkia. Kolikko on paljon kevyempi.'],
        ] as string[][]);
        return {
          say: `Paljonko ${what} painaa?`,
          task: choose(r, txt(right!), [txt(w1!), txt(w2!)], [y1!, y2!]),
          hint: 'Vertaa tuttuun: marja on noin 1 g, maitopurkki noin 1 kg.',
          explain: `${cap(what!)} painaa noin ${right}.`,
        };
      },
      thousand: (r) => {
        const k = r.int(1, 3);
        return {
          say: `Montako grammaa on ${k === 1 ? 'yksi kilogramma' : `${word(k)} kilogrammaa`}?`,
          task: choose(r, txt(`${k * 1000} g`), [txt(`${k * 100} g`), txt(`${k * 10} g`)], [`${k * 100} g on vasta ${k === 1 ? 'yksi' : word(k)} sadan gramman ${k === 1 ? 'pussi' : 'pussia'}. Kiloon tarvitaan kymmenen.`, `${k * 10} g on vain ${k * 10} marjan paino. Kilossa on tuhat grammaa.`]),
          hint: 'Yhdessä kilossa on tuhat grammaa.',
          explain: `1 kg = 1000 g, joten ${k} kg = ${k * 1000} g.`,
        };
      },
      scale: (r) => {
        const kg = r.int(0, 1), h = r.pick([200, 300, 500, 700, 800]), target = kg * 1000 + h;
        return {
          say: `Aava tilaa ${kg ? `1 kg ${h} g` : `${h} g`} marjoja. Punnitse vaa\'alle sama paino punnuksilla.`,
          task: { kind: 'grams' as const, target, packs: [100, 500, 1000] },
          hint: kg ? `1 kg on 1000 g. Tarvitset siis yhteensä ${target} g.` : `Isolla punnuksella pääsee nopeammin. 500 g + 100 g + …`,
          explain: kg ? `1 kg ${h} g = 1000 g + ${h} g = ${target} g.` : `${h} g = ${h >= 500 ? `500 g + ${h - 500} g` : Array(h / 100).fill('100 g').join(' + ')}.`,
        };
      },
    }, (r) => {
      const kg = r.int(1, 2), g = r.pick([kg * 1000 - 500, kg * 1000 + 500]);
      const kgBigger = kg * 1000 > g;
      const A = `${kg} kg`, B = `${g} g`;
      return {
        say: `Kumpi on painavampi: ${A} vai ${B}?`,
        task: choose(r, txt(kgBigger ? A : B), [txt(kgBigger ? B : A), txt('Yhtä painavat')], [kgBigger ? `${g} on iso luku, mutta grammat ovat pieniä. ${kg} kg on ${kg * 1000} g.` : `${kg} kg on vain ${kg * 1000} g.`, `${kg} kg on ${kg * 1000} g, ja ${kg * 1000} ≠ ${g}.`], 3),
        hint: `Muuta kilot grammoiksi: ${kg} kg = ? g.`,
        explain: `${kg} kg = ${kg * 1000} g. Verrataan: ${kg * 1000} g ja ${g} g.`,
      };
    }),
  },
  {
    id: 'M-MEAS-08', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Mehukannu', icon: '🧃',
    intro: 'Kioskilla myydään mehua. Mihin astiaan mahtuu eniten?',
    reward: 'Osaat vertailla, mihin mahtuu enemmän!',
    demo: () => [
      { say: 'Kaadetaan täysi muki kannuun. Kannu ei tule täyteen. Kannuun mahtuu siis enemmän kuin mukiin.', scene: pourScene('muki', 'kannu', 3, 10, 'muki', 'kannu', 'Kannu ei tullut täyteen: kannuun mahtuu enemmän kuin mukiin.') },
      { say: 'Entä toisin päin? Täysi kannu kaadetaan mukiin. Muki täyttyy heti, ja loput valuvat yli.', scene: pourScene('kannu', 'muki', 10, 3, 'kannu', 'muki', 'Vettä valui yli: mukiin mahtuu vähemmän kuin kannuun.') },
      { say: 'Vesi ei muutu, vaikka se kaadetaan eri muotoiseen astiaan. Matalan kulhon vesi nousee kapeassa lasissa korkealle, mutta vettä on yhtä paljon.', scene: pourScene('ampari', 'lasi', 8, 3.5, 'kulho', 'lasi', 'Pinta on korkealla, mutta vettä on yhtä paljon kuin kulhossa oli.', 0.4) },
    ],
    item: cases({
      pour: (r) => {
        const ILL: Record<string, string> = { kannu: 'kannuun', muki: 'mukiin', pullo: 'pulloon' };
        const CAP: Record<string, number> = { muki: 3, pullo: 5, kannu: 10 };
        const [a, b] = r.shuffle(['kannu', 'muki', 'pullo']).slice(0, 2) as ('kannu' | 'muki' | 'pullo')[];
        const over = CAP[a!]! > CAP[b!]!, more = over ? a! : b!, less = over ? b! : a!;
        return {
          say: `Täysi ${a} kaadetaan tyhjään astiaan, ${ILL[b!]}. ${over ? 'Vettä valuu yli.' : `${cap(b!)} ei tule täyteen.`} Kumpaan mahtuu enemmän?`,
          scene: pourScene(a!, b!, CAP[a!]!, CAP[b!]!, a!, b!, 'Kumpaan mahtuu enemmän?'),
          hint: over ? 'Jos vettä valuu yli, toinen astia oli liian pieni.' : 'Jos astia ei tule täyteen, siihen mahtuisi vielä lisää.',
          task: choose(r, { art: vesselArt(more, 0.6, more), speak: more }, [{ art: vesselArt(less, 0.6, less), speak: less }, txt('Yhtä paljon')], [over ? 'Vettä valui yli, joten tähän mahtuu vähemmän.' : 'Toinen astia ei tullut täyteen, joten siihen mahtuu enemmän.', 'Toinen astia vuoti yli tai jäi vajaaksi, joten ne eivät ole yhtä suuria.'], 3),
          explain: over ? `Vettä jäi yli: astiaan ${more} mahtuu enemmän.` : `Täysi ${a} ei täyttänyt astiaa ${b}: ${ILL[b!]} mahtuu enemmän.`,
        };
      },
      cups: (r) => {
        const x = r.int(3, 6), y = x + r.int(1, 3);
        const [A, B] = r.shuffle([['Punaisesta', x], ['Sinisestä', y]] as [string, number][]);
        const bigger = A![1] > B![1] ? A! : B!, smaller = bigger === A ? B! : A!;
        return {
          say: `${A![0]} kannusta saa täytettyä ${word(A![1])} mukia. ${B![0]} kannusta saa ${word(B![1])} mukia. Kumpaan kannuun mahtuu enemmän?`,
          task: choose(r, txt(bigger[0] === 'Punaisesta' ? 'Punaiseen' : 'Siniseen'), [txt(smaller[0] === 'Punaisesta' ? 'Punaiseen' : 'Siniseen'), txt('Yhtä paljon')], [`Siitä saa vain ${smaller[1]} mukia.`, `${x} ja ${y} mukia eivät ole yhtä monta.`], 3),
          hint: 'Mukit ovat samanlaisia. Kummasta kannusta saa enemmän mukillisia?',
          explain: `${bigger[1]} mukia on enemmän kuin ${smaller[1]}, kun mukit ovat samanlaisia.`,
        };
      },
      conserve: (r) => {
        const v = r.pick(['Vesi kaadetaan matalasta kulhosta korkeaan lasiin. Onko lasissa nyt enemmän, vähemmän vai yhtä paljon vettä kuin kulhossa oli?', 'Vesi kaadetaan korkeasta lasista matalaan kulhoon. Onko kulhossa nyt enemmän, vähemmän vai yhtä paljon vettä kuin lasissa oli?']);
        return {
          say: v,
          scene: paint(`<div class="pics">${vesselArt('ampari', 0.35, 'kulho')}${vesselArt('lasi', 0.8, 'lasi')}</div>`),
          task: choose(r, txt('Yhtä paljon'), [txt('Enemmän'), txt('Vähemmän')], ['Pinta voi näyttää korkeammalta, mutta vettä ei tullut lisää.', 'Pinta voi näyttää matalammalta, mutta vettä ei kaatunut pois.'], 3),
          hint: 'Tuliko vettä lisää tai kaatuiko sitä pois?',
          explain: 'Vettä ei lisätty eikä otettu pois. Sen määrä pysyy samana, vaikka astian muoto muuttuu.',
        };
      },
      test: (r) => {
        const CAP: Record<string, number> = { muki: 3, lasi: 2, pullo: 5, kannu: 10 };
        const [a, b] = r.shuffle(['muki', 'lasi', 'pullo', 'kannu']).slice(0, 2) as ('muki' | 'lasi' | 'pullo' | 'kannu')[];
        return {
          say: `Kumpaan mahtuu enemmän: ${a} vai ${b}? Kokeile kaatamalla.`,
          task: { kind: 'pourtest' as const, a: a!, b: b!, capA: CAP[a!]!, capB: CAP[b!]!, la: a!, lb: b! },
          hint: 'Kaada täysi astia tyhjään. Valuuko yli, vai jääkö tilaa?',
          explain: `${cap(CAP[a!]! > CAP[b!]! ? a! : b!)} on isompi: siihen mahtuu enemmän.`,
        };
      },
    }, (r) => {
      const n = r.int(4, 6);
      const [p, q] = r.shuffle(['Loikan', 'Aavan']);
      return {
        say: `${p} kannusta saa ${word(n)} isoa mukia. ${q} kannusta saa ${word(n)} pientä lasia. Kumpaan kannuun mahtuu enemmän?`,
        task: choose(r, txt(`${p} kannuun`), [txt(`${q} kannuun`), txt('Yhtä paljon')], [`${q} kannusta saa yhtä monta, mutta vain pieniä laseja.`, `Lukumäärä on sama, mutta ${p!.toLowerCase()} mukit ovat isompia.`], 1),
        hint: 'Sama määrä astioita. Kummat astiat ovat isompia?',
        explain: 'Yhtä monta astiallista, mutta isoja mukeja: isompaan kannuun mahtuu enemmän. Mittayksikön koko ratkaisee.',
      };
    }),
  },
  {
    id: 'M-MEAS-09', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Litra ja desi', icon: '🥛',
    intro: 'Mehua myydään litroina ja desilitroina. Desilitra on pieni mitta, litra iso.',
    reward: 'Litrassa on kymmenen desiä: mehukauppa pyörii!',
    demo: () => [
      { say: 'Tämä pieni mitta on yksi desilitra. Kaadetaan sillä kannuun ja lasketaan: yksi desi, kaksi desiä… Kymmenen desilitraa täyttää kannun litran viivaan asti.', scene: dlFillScene(10) },
      { say: 'Jos kaadetaan vain kahdeksan desilitraa, pinta jää litran viivan alle. 8 dl on vähemmän kuin litra, vaikka 8 on isompi luku kuin 1.', scene: dlFillScene(8) },
      { say: 'Yksi litra on kymmenen desilitraa.', scene: paint(svg(240, 60, '<text x="120" y="42" text-anchor="middle" font-size="32" font-weight="800" fill="currentColor">1 l = 10 dl</text>')) },
    ],
    item: cases({
      unit: (r) => {
        const [what, dl] = r.pick([['mehulasiin', true], ['maitokuppiin', true], ['jogurttipurkkiin', true], ['kylpyammeeseen', false], ['ämpäriin', false], ['akvaarioon', false]] as [string, boolean][]);
        return {
          say: `Paljonko ${what} mahtuu? Mitataanko se desilitroina vai litroina?`,
          task: fixed([txt('desilitroina'), txt('litroina')], dl ? 0 : 1, dl ? [undefined, 'Tämä on pieni. Litra on iso mitta.'] : ['Tämä on iso. Desilitroja tulisi tosi paljon.', undefined], 2),
          hint: 'Desilitra on pieni mitta, kuin pieni lasi. Litra on iso, kuin maitopurkki.',
          explain: dl ? 'Pieni astia: desilitroina.' : 'Iso astia: litroina.',
        };
      },
      ten: (r) => {
        const l = r.int(1, 3);
        return {
          say: `Montako desilitraa on ${l === 1 ? 'yksi litra' : `${word(l)} litraa`}?`,
          task: choose(r, txt(`${l * 10} dl`), [txt(`${l * 100} dl`), txt(`${l} dl`)], ['Litrassa on kymmenen desilitraa, ei sata.', 'Litra on isompi kuin desilitra: litrassa on monta desiä.']),
          hint: 'Jokaiseen litraan mahtuu kymmenen desilitraa.',
          explain: `1 l = 10 dl, joten ${l} l = ${l * 10} dl.`,
        };
      },
      compare: (r) => {
        const dl = r.pick([6, 8, 9, 12, 15]);
        const lBig = 10 > dl;
        return {
          say: `Kumpi on enemmän: 1 l vai ${dl} dl?`,
          task: choose(r, txt(lBig ? '1 l' : `${dl} dl`), [txt(lBig ? `${dl} dl` : '1 l'), txt('Yhtä paljon')], [lBig ? `${dl} on isompi luku, mutta litra on kymmenen desiä.` : `Litra on vain 10 dl, ja ${dl} dl on enemmän.`, `Yhtä paljon olisi 10 dl. Nyt on ${dl} dl.`], 3),
          hint: 'Muuta litra desilitroiksi: 1 l = 10 dl. Vertaa sitten.',
          explain: `1 l = 10 dl. Verrataan: 10 dl ja ${dl} dl.`,
        };
      },
      fill: (r) => {
        const T = r.pick([5, 7, 10, 10, 12, 15, 20]);
        return {
          say: `Asiakas haluaa ${dlText(T)} mehua. Kaada kannuun ${dlText(T)}.`,
          task: { kind: 'fill' as const, target: T, cap: T > 10 ? 20 : 10 },
          hint: T >= 10 ? `1 l = 10 dl.${T % 10 ? ` Kaada litran viivaan ja vielä ${T % 10} dl.` : T === 20 ? ' Kaada toisen litran viivaan asti.' : ' Kaada litran viivaan asti.'}` : `Kaada ${word(T)} kertaa.`,
          explain: T >= 10 ? `${dlText(T)} = ${T} dl${T % 10 ? `, eli 10 dl ja vielä ${T % 10} dl` : ''}.` : `${T} dl on ${word(T)} desilitraa.`,
        };
      },
    }, (r) => {
      const g = r.pick([2, 5]), l = r.int(1, 2);
      return {
        say: `${l === 1 ? 'Litran' : 'Kahden litran'} pullosta kaadetaan ${word(g)} desilitran laseja. Montako lasia saa täyteen?`,
        task: choose(r, n$((l * 10) / g), [n$(l * g), n$(l * 10)], [`Muuta ensin litrat desilitroiksi: ${l} l = ${l * 10} dl.`, `${l * 10} on desilitrat. Yhteen lasiin menee ${g} dl.`]),
        hint: `Muuta litrat desilitroiksi. Montako kertaa ${g} dl mahtuu niihin?`,
        explain: `${l} l = ${l * 10} dl. ${l * 10} dl on ${(l * 10) / g} kertaa ${g} dl.`,
      };
    }),
  },
];

