// Counting, numerals and number sequences (grades 1–2).
import type { Rng } from '../engine/rng';
import type { NodeSpec, Option, Task } from '../engine/types';
import { duck, frog, scatter, svg, THINGS } from '../ui/art';
import { word } from './fi';
import { AUDIT_REV, LAUNCH_REV } from './audit-rev';
import { countAlong, diffArcs, fillBox, hopWords, lineHops, twoHoppers, numeralTrain, spreadRow, threeWays } from './countanim';
import { YESNO } from './parts';
import { boxArt, cases, choose, fixed, groupArt, lineLayout, near, num, paint, spoken, thing, txt } from './kit';

const many = (k: string, n: number) => (n === 1 ? THINGS[k]!.one : THINGS[k]!.many);
const YES: Option = { big: '👍', text: 'Kyllä', speak: 'Kyllä' };
const NO: Option = { big: '👎', text: 'Ei', speak: 'Ei' };
/** Digits children often mix up, and how to tell them apart. */
const LOOKALIKE: Record<number, number> = { 6: 9, 9: 6, 1: 7, 7: 1, 2: 5, 5: 2, 3: 8, 8: 3 };
const SHAPE: Record<number, string> = {
  6: 'Kuudessa pallo on alhaalla, yhdeksässä ylhäällä.', 1: 'Seitsemässä on ylhäällä vaakaviiva, ykkösessä ei.',
  2: 'Kakkonen alkaa kaarella, viitonen suoralla viivalla.', 3: 'Kahdeksikko on kiinni kummaltakin puolelta, kolmonen on auki.',
};
const cap = (w: string) => w[0]!.toUpperCase() + w.slice(1);
const words = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => word(from + i)).join(', ');

/** Counting objects. By default the learner gives the total (`ask`). 'total': only the number is
 *  judged and tapping marks is optional. 'marking': one-to-one practice where marking each object
 *  once is a stated requirement. Number words appear on taps only as guided support (recorded as help). */
function tapTask(r: Rng, n: number, layout: 'line' | 'scatter' | 'circle', kinds: string[], guided = false, mode: 'total' | 'marking' = 'total'): Extract<Task, { kind: 'tapcount' }> {
  const w = 320, h = 200, size = 34;
  let pts: { x: number; y: number }[];
  if (layout === 'line') pts = lineLayout(n, w, h, size * 1.4);
  else if (layout === 'circle') pts = Array.from({ length: n }, (_, i) => ({ x: w / 2 + Math.cos((i / n) * 2 * Math.PI) * 75, y: h / 2 + Math.sin((i / n) * 2 * Math.PI) * 68 }));
  else pts = scatter(n, w, h, size * 1.35, r.next);
  return { kind: 'tapcount', w, h, objects: pts.map((p) => ({ ...p, thing: r.pick(kinds) })), words: guided, ask: true, mode };
}

/** Stepping stones with numbers; null shows '?'. */
export function stonesArt(vals: (number | null)[]) {
  const W = 66;
  return svg(vals.length * W + 10, 90, vals.map((v, i) => {
    const x = 5 + i * W + W / 2;
    return `<ellipse cx="${x}" cy="56" rx="29" ry="20" fill="${v === null ? 'var(--sun)' : '#9aa3a8'}"/><text x="${x}" y="64" text-anchor="middle" font-size="24" font-weight="800" fill="${v === null ? '#3a2c00' : '#fff'}">${v ?? '?'}</text>`;
  }).join('') + frog(5 + W / 2, 20, 13));
}

/** Number line 0..max with jump arcs of size k from 0 (first `jumps` jumps). */
function jumpsArt(max: number, k: number, jumps: number) {
  const W = 320, s = (W - 20) / max;
  let out = `<line x1="10" y1="70" x2="${W - 10}" y2="70" stroke="currentColor" stroke-width="2"/>`;
  for (let i = 0; i <= max; i++) out += `<line x1="${10 + i * s}" y1="64" x2="${10 + i * s}" y2="76" stroke="currentColor"/><text x="${10 + i * s}" y="94" text-anchor="middle" font-size="12" fill="currentColor">${i}</text>`;
  for (let j = 0; j < jumps; j++) out += `<path d="M${10 + j * k * s} 66 Q${10 + (j + 0.5) * k * s} ${66 - 18 - k * 4} ${10 + (j + 1) * k * s} 66" fill="none" stroke="var(--pond)" stroke-width="3"/>`;
  return svg(W, 100, out);
}

export const NUMBER_NODES: NodeSpec[] = [
  {
    id: 'M-NUM-STABLE-ORDER', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Laskuloru', icon: '🎵',
    intro: 'Loikka opettelee laskuloruja. Kuuntele tarkasti: laskeeko se oikein?',
    reward: 'Loikan laskuloru toimii! Nyt voidaan laskea retkitavarat.',
    demo: () => [
      { say: 'Loikka hyppii kiveltä kivelle ja sanoo joka hypyllä yhden sanan. Sanat tulevat aina samassa järjestyksessä.', scene: hopWords(['yksi', 'kaksi', 'kolme', 'neljä', 'viisi']) },
      { say: 'Nyt Loikka hyppää yhden kiven yli: yksi, kaksi, neljä. Kolme jäi sanomatta, ja loru menee rikki!', scene: hopWords(['yksi', 'kaksi', 'kolme', 'neljä', 'viisi'], { jumpOver: 2 }) },
    ],
    item: cases({
      next: (r) => {
        const k = r.int(2, 7);
        const wrong = near(r, k + 1, 2, 1, 10);
        return {
          say: `Loikka laskee: ${words(1, k)}. Mikä sana tulee seuraavaksi?`,
          task: choose(r, spoken(k + 1), wrong.map(spoken), wrong.map((w) => w <= k ? `${cap(word(w))} sanottiin jo.` : `${cap(word(w))} tulee myöhemmin. Ensin tulee ${word(k + 1)}.`)),
          hint: 'Sano loru itse ääneen alusta asti.',
          explain: `Loru jatkuu näin: ${words(1, k + 1)}.`,
        };
      },
      swap: (r) => fixFrog(r, 'swap'),
      spot: (r) => {
        const m = r.int(5, 7), i = r.int(1, m - 2);
        const wrong = near(r, i + 1, 2, 1, m);
        return {
          say: 'Katso, kun Loikka hyppii ja laskee. Yksi kivi jää ilman sanaa. Mikä sana jäi sanomatta?',
          scene: hopWords(Array.from({ length: m }, (_, k) => word(k + 1)), { jumpOver: i }),
          task: choose(r, spoken(i + 1), wrong.map(spoken), wrong.map((w) => `${cap(word(w))} sanottiin. Etsi kivi, jossa on kysymysmerkki.`)),
          hint: 'Sano loru itse ja vertaa: missä kohdassa Loikka hyppäsi yli?',
          explain: `Loikka sanoi ${word(i)} ja sitten heti ${word(i + 2)}. Välistä jäi ${word(i + 1)}.`,
        };
      },
      rhyme: (r) => {
        const k = r.int(4, 6);
        const ws = Array.from({ length: k }, (_, i) => word(i + 1));
        return {
          say: 'Rakenna Loikan laskuloru itse. Napauta sanat oikeassa järjestyksessä alusta loppuun.',
          task: { kind: 'build', tokens: r.shuffle(ws), target: ws.join(' '), mode: 'seq', max: k + 2 },
          hint: `Aloita sanasta yksi. Sanoja on ${word(k)}.`,
          explain: `Loru menee näin: ${ws.join(', ')}.`,
        };
      },
    }, (r) => {
      const s = r.int(3, 7);
      return {
        say: `Aava aloittaa keskeltä: ${words(s, s + 2)}. Mikä sana tulee seuraavaksi?`,
        task: choose(r, spoken(s + 3), [spoken(s + 4), spoken(s + 1)], [`${cap(word(s + 4))} tulee vasta sen jälkeen.`, `${cap(word(s + 1))} sanottiin jo.`]),
        explain: `Järjestys on sama, vaikka aloitetaan keskeltä: ${words(s, s + 3)}.`,
      };
    }),
  },
  {
    id: 'M-NUM-1TO1', rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV],
    produce: ['tap', 'transfer'], produceWhat: 'esineiden kertamerkintää',
    stop: 'Yksi kerrallaan', icon: '👆',
    intro: 'Jokainen esine saa yhden laskusanan. Ei yhtään kahdesti, ei yhtään väliin.',
    reward: 'Jokainen esine sai yhden merkin. Hienoa tarkkaa laskemista!',
    demo: (r) => [
      { say: 'Katso, kun Loikka osoittaa: jokainen marja saa yhden sanan. Yksi, kaksi, kolme, neljä.', scene: countAlong('marja', [[1], [2], [3], [4]]) },
      { say: 'Nyt sormi jää yhden marjan kohdalle, ja se saa kaksi sanaa. Marjoja on kolme, mutta lasku sanoo neljä. Se on virhe!', scene: countAlong('marja', [[1], [2, 3], [4]], { mark: true }) },
      { say: 'Tässä sormi hyppää yhden marjan yli. Se jää ilman sanaa, ja lasku jää liian pieneksi.', scene: countAlong('marja', [[1], [], [2], [3]], { mark: true }) },
    ],
    item: cases({
      tap: (r, p) => {
        const n = r.int(3, 6);
        const k = thing(r);
        return { say: 'Merkitse jokainen esine kerran. Ei yhtään kahdesti eikä yhtään väliin.', task: { ...tapTask(r, n, r.pick(['line', 'scatter']), [k], p === 'guided', 'marking'), ask: false }, hint: 'Merkitse yksi kerrallaan. Merkki jää näkyviin.', explain: 'Jokainen esine sai yhden merkin. Jokainen lasketaan kerran.' };
      },
      judge: (r) => {
        const n = r.int(3, 5), k = thing(r);
        const kind = r.pick(['ok', 'double', 'skip'] as const);
        let c = 1;
        const labels = Array.from({ length: n }, () => [c++]);
        const i = r.int(0, n - 1);
        if (kind === 'double') labels[i] = [labels[i]![0]!, labels[i]![0]! + 1], labels.forEach((l, j) => { if (j > i) l[0] = l[0]! + 1; });
        if (kind === 'skip') { labels[i] = []; labels.forEach((l, j) => { if (j > i) l[0] = l[0]! - 1; }); }
        const said = labels.flat().length;
        const miss = { ok: 'Katso uudelleen: jokaisella on yksi numero, ei yhtään tyhjää eikä kahta.', double: 'Katso tarkasti: yhdellä esineellä on kaksi numeroa.', skip: 'Katso tarkasti: yksi esine jäi ilman numeroa.' };
        const order = ['ok', 'double', 'skip'] as const;
        return {
          say: 'Katso, kun Loikka laskee. Mitä tapahtui?',
          scene: countAlong(k, labels),
          task: fixed([txt('Jokainen sai yhden sanan'), txt('Yksi sai kaksi sanaa'), txt('Yksi jäi ilman sanaa')], order.indexOf(kind), order.map((o) => (o === kind ? undefined : miss[kind])), 1),
          hint: 'Katso jokaista esinettä: montako numeroa sillä on?',
          explain: kind === 'ok' ? `Jokainen sai täsmälleen yhden sanan. Niitä on ${word(n)}.`
            : kind === 'double' ? `Yksi esine sai kaksi sanaa. Loikka sanoi ${word(said)}, mutta niitä on ${word(n)}.`
            : `Yksi esine jäi ilman sanaa. Loikka sanoi ${word(said)}, mutta niitä on ${word(n)}.`,
        };
      },
    }, (r) => {
      const n = r.int(5, 7);
      return { say: 'Nyt esineitä on sekaisin. Merkitse jokainen kerran, ei yhtään kahdesti eikä yhtään väliin.', task: { ...tapTask(r, n, 'scatter', r.shuffle(['kivi', 'lehti', 'kukka', 'simpukka']).slice(0, 3), false, 'marking'), ask: false }, explain: 'Kaikki lasketaan, oli esine mikä tahansa. Jokainen kerran.' };
    }),
  },
  {
    id: 'M-NUM-01', rev: 'count2-2026-10-27', validRevs: ['count2-2026-10-27'],
    stop: 'Laske kaikki', icon: '🔢',
    intro: 'Loikka laskee retkitavarat. Laske sinäkin!',
    reward: 'Kaikki tavarat on laskettu!',
    demo: (r) => [
      { say: 'Aloita yhdestä. Osoita yksi kerrallaan ja sano sana: yksi, kaksi, kolme, neljä, viisi, kuusi. Viimeinen sana kertoo, montako niitä on.', scene: countAlong('kapy', [[1], [2], [3], [4], [5], [6]]) },
      { say: 'Kun esineet ovat ringissä, muista mistä aloitit. Lopeta, kun palaat alkuun.', scene: countAlong('kivi', [[1], [2], [3], [4], [5], [6], [7]], { circle: true, mark: true, h: 190 }) },
      { say: 'Katso, mitä tapahtuu, jos alkua ei muista: ensimmäinen kivi lasketaan uudestaan, ja tulee kahdeksan. Kiviä on kuitenkin seitsemän.', scene: countAlong('kivi', [[1, 8], [2], [3], [4], [5], [6], [7]], { circle: true, mark: true, h: 190 }) },
    ],
    item: cases({
      line: (r, p) => { const n = r.int(5, 10); return { say: 'Montako niitä on? Voit merkitä esineitä napauttamalla, jos se auttaa.', task: tapTask(r, n, 'line', [thing(r)], p === 'guided'), explain: `Niitä on ${word(n)}.` }; },
      scatter: (r, p) => { const n = r.int(5, 9); return { say: 'Montako niitä on? Voit merkitä esineitä napauttamalla, jos se auttaa.', task: tapTask(r, n, 'scatter', [thing(r)], p === 'guided'), explain: `Niitä on ${word(n)}.` }; },
      circle: (r, p) => { const n = r.int(5, 8); return { say: 'Esineet ovat ringissä. Montako niitä on? Voit merkitä esineitä napauttamalla.', task: tapTask(r, n, 'circle', [thing(r)], p === 'guided'), hint: 'Muista, mistä aloitit.', explain: `Niitä on ${word(n)}. Ringissä pitää muistaa aloituskohta.` }; },
    }, (r) => {
      const n = r.int(8, 10);
      return { say: 'Iso kasa sekaisin! Montako esinettä on kaikkiaan? Merkitseminen on vapaaehtoista.', task: tapTask(r, n, 'scatter', ['kivi', 'simpukka', 'kala']), explain: `Esineitä on ${word(n)}.` };
    }),
  },
  {
    id: 'M-NUM-02', stop: 'Montako kaikkiaan', icon: '🧺',
    intro: 'Kun lasket, viimeinen sana kertoo, montako niitä on kaikkiaan.',
    reward: 'Viimeinen sana kertoo määrän. Nyt tiedät sen!',
    demo: (r) => [
      { say: 'Loikka laskee: yksi, kaksi, kolme, neljä. Viimeinen sana on neljä. Se on koko joukon nimi: marjoja on neljä.', scene: countAlong('marja', [[1], [2], [3], [4]], { total: true }) },
      { say: 'Kun marjat peitetään, niitä on yhä neljä. Viimeinen sana muistetaan, eikä tarvitse laskea uudestaan.', scene: countAlong('marja', [[1], [2], [3], [4]], { cover: true }) },
    ],
    item: cases({
      howmany: (r) => {
        const n = r.int(3, 8), k = thing(r);
        return {
          say: `Loikka laski: ${words(1, n)}. Montako niitä on?`,
          scene: countAlong(k, Array.from({ length: n }, (_, i) => [i + 1]), { total: true }),
          task: choose(r, spoken(n), [spoken(1), spoken(n + 1)], ['Yksi on vain ensimmäinen. Viimeinen sana kertoo määrän.', `Loikka lopetti sanaan ${word(n)}. ${cap(word(n + 1))} olisi yksi liikaa.`]),
          hint: 'Mikä oli viimeinen sana?',
          explain: `Viimeinen sana oli ${word(n)}. Niitä on ${word(n)}.`,
        };
      },
      give: (r) => {
        const n = r.int(2, 6), k = thing(r);
        const art = groupArt(r, k, 1, 'line', 60, 60, 36);
        return {
          say: `Anna Aavalle ${word(n)} ${many(k, n)}. Valitse ${word(n)} ja paina valmis.`,
          task: { kind: 'multi', count: n, answer: [], cols: 4, options: Array.from({ length: 8 }, () => ({ art })) },
          hint: 'Laske ääneen, kun valitset.',
          explain: `Lasketaan: ${words(1, n)}. Kun sanot ${word(n)}, lopeta.`,
        };
      },
    }, (r) => {
      const n = r.int(4, 8), k = thing(r);
      return {
        say: `Loikka laski ${many(k, 2)} ja peitti ne laatikolla. Se sanoi: ${words(1, n)}. Montako laatikon alla on?`,
        scene: countAlong(k, Array.from({ length: n }, (_, i) => [i + 1]), { cover: true, caption: false }),
        task: choose(r, spoken(n), [spoken(1), spoken(n - 1)], ['Yksi oli vain ensimmäinen sana. Viimeinen sana kertoo määrän.', `${cap(word(n - 1))} ei ollut viimeinen sana. Loikka sanoi vielä ${word(n)}.`]),
        explain: `Viimeinen sana oli ${word(n)}, joten niitä on ${word(n)}.`,
      };
    }),
  },
  {
    id: 'M-NUM-WORD-NUMERAL', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Sana ja numero', icon: '🔤',
    intro: 'Jokaisella laskusanalla on oma numeronsa. Etsitään parit.',
    reward: 'Tunnet numerot nimeltä!',
    demo: () => [
      { say: 'Katso numerojunaa. Jokainen numero syttyy, kun sen nimi sanotaan: nolla, yksi, kaksi… kymmenen.', scene: numeralTrain(0, 10) },
      { say: 'Jotkin numerot ovat samannäköisiä. Kuudessa pallo on alhaalla, yhdeksässä ylhäällä. Seitsemässä on ylhäällä vaakaviiva.', scene: paint(svg(240, 100, ['6', '9', '1', '7'].map((d, i) => `<text x="${30 + i * 60}" y="78" text-anchor="middle" font-size="70" font-weight="800" fill="${i < 2 ? '#4a5bd4' : '#c0392b'}">${d}</text>`).join(''))) },
    ],
    item: cases({
      w2n: (r) => {
        const n = r.int(0, 10), c = LOOKALIKE[n];
        const wrong = c !== undefined ? [c, ...near(r, n, 3, 0, 10, 3).filter((x) => x !== c).slice(0, 1)] : near(r, n, 2, 0, 10, 3);
        return {
          say: `Missä on numero ${word(n)}?`,
          task: choose(r, num(n), wrong.map(num), wrong.map((w) => (w === c ? `${w} on ${word(w)}. ${SHAPE[Math.min(n, w)]}` : `${w} on ${word(w)}.`))),
          explain: `${cap(word(n))} kirjoitetaan näin: ${n}.`,
        };
      },
      n2w: (r) => {
        const n = r.int(1, 10);
        const wrong = near(r, n, 2, 0, 10, 3);
        return {
          say: 'Mikä sana sopii tähän numeroon? Kuuntele vaihtoehdot.',
          listen: { say: 'Mikä sana sopii tähän numeroon? Lue vaihtoehdot.' },
          scene: paint(svg(120, 100, `<text x="60" y="82" text-anchor="middle" font-size="90" font-weight="800" fill="currentColor">${n}</text>`)),
          task: choose(r, spoken(n), wrong.map(spoken), wrong.map((w) => `${cap(word(w))} kirjoitetaan ${w}. Tässä on ${n}.`)),
          explain: `Numero ${n} on ${word(n)}.`,
        };
      },
      pairs: (r) => {
        const ns = r.shuffle(Array.from({ length: 10 }, (_, i) => i + 1)).slice(0, 3).sort((x, y) => x - y);
        return {
          say: 'Vie jokainen sana oikean numeron alle.',
          task: {
            kind: 'place', slots: ns.map((n) => ({ id: `s${n}`, art: svg(80, 60, `<text x="40" y="50" text-anchor="middle" font-size="52" font-weight="800" fill="currentColor">${n}</text>`) })),
            tokens: r.shuffle(ns.map((n) => ({ id: `w${n}`, text: word(n), speak: word(n) }))),
            answer: Object.fromEntries(ns.map((n) => [`s${n}`, `w${n}`])),
          },
          hint: 'Sano numeron nimi ääneen ja etsi sama sana.',
          explain: ns.map((n) => `${n} on ${word(n)}`).join(', ') + '.',
        };
      },
    }, (r) => {
      const n = r.int(12, 19);
      const rev = Number(String(n).split('').reverse().join(''));
      return {
        say: `Missä on ${word(n)}?`,
        task: choose(r, num(n), [num(rev), num(n - 10)], [`Numerot ovat väärin päin. Luvussa ${n} on ensin kymppi eli 1 ja sitten ${n - 10}.`, `${n - 10} on ${word(n - 10)}. Luvussa ${n} on lisäksi kymppi.`]),
        explain: `${word(n)} = ${n}: ensin kymppi, sitten ${n - 10}.`,
      };
    }),
  },
  {
    id: 'M-NUM-QTY-NUMERAL', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Rasian lappu', icon: '🏷️',
    intro: 'Aavan retkirasioihin tarvitaan numerolaput.',
    reward: 'Kaikissa rasioissa on oikea lappu. Retkivarusteet ovat valmiina!',
    demo: () => [
      { say: 'Katso, kun Aava laittaa kiviä rasiaan. Lappu kertoo aina, montako rasiassa on.', scene: fillBox('kivi', 4) },
      { say: 'Lappu toimii myös toisin päin: jos lapussa on 3, rasiaan laitetaan kolme ja sitten lopetetaan.', scene: fillBox('simpukka', 3) },
    ],
    item: cases({
      q2n: (r) => {
        const n = r.int(1, 9), k = thing(r);
        const wrong = near(r, n, 2, 0, 10);
        return { say: 'Mikä numerolappu sopii tähän rasiaan?', scene: paint(boxArt(r, k, n)), task: choose(r, num(n), wrong.map(num), wrong.map((w) => `Lappu ${w} tarkoittaa: ${word(w)}. Laske rasian esineet uudelleen.`)), hint: 'Laske ensin esineet.', explain: `Rasiassa on ${word(n)} ${many(k, n)}. Lappu on ${n}.` };
      },
      n2q: (r) => {
        const n = r.int(2, 8), k = thing(r);
        const wrong = near(r, n, 2, 1, 10);
        return {
          say: 'Missä rasiassa on yhtä monta kuin numero näyttää?',
          scene: paint(svg(120, 100, `<text x="60" y="82" text-anchor="middle" font-size="90" font-weight="800" fill="currentColor">${n}</text>`)),
          task: choose(r, { art: boxArt(r, k, n) }, wrong.map((m) => ({ art: boxArt(r, k, m) })), wrong.map((m) => `Siinä rasiassa on ${word(m)}. Numero ${n} on ${word(n)}.`)),
          explain: `Numero ${n} on ${word(n)}. Oikeassa rasiassa on ${word(n)} ${many(k, n)}.`,
        };
      },
      fill: (r) => {
        const n = r.int(2, 7), k = thing(r);
        const art = groupArt(r, k, 1, 'line', 60, 60, 36);
        return {
          say: 'Rasian lappu näyttää tämän numeron. Valitse rasiaan yhtä monta ja paina valmis.',
          scene: paint(svg(120, 100, `<text x="60" y="82" text-anchor="middle" font-size="90" font-weight="800" fill="currentColor">${n}</text>`)),
          task: { kind: 'multi', count: n, answer: [], cols: 4, options: Array.from({ length: 8 }, () => ({ art })) },
          hint: 'Sano numeron nimi. Laske ääneen, kun valitset, ja pysähdy siihen.',
          explain: `Numero ${n} on ${word(n)}: rasiaan ${word(n)} ${many(k, n)}.`,
        };
      },
    }, (r) => {
      const a = r.int(2, 4), b = a + r.int(2, 4), k = thing(r);
      return {
        say: 'Kahden rasian laput menivät sekaisin. Korjaa ne.',
        task: {
          kind: 'place', slots: [{ id: 'A', art: boxArt(r, k, a) }, { id: 'B', art: boxArt(r, k, b) }],
          tokens: [{ id: `n${a}`, text: String(a) }, { id: `n${b}`, text: String(b) }],
          start: { A: `n${b}`, B: `n${a}` }, answer: { A: `n${a}`, B: `n${b}` },
        },
        explain: `Rasiassa on ${word(a)}, joten lappu ${a}. Toisessa on ${word(b)}, lappu ${b}.`,
      };
    }),
  },
  {
    id: 'M-NUM-QTY-WORD', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Määrä ja sana', icon: '🗣️',
    intro: 'Aava kertoo Loikalle, mitä rasioissa on. Valitaan oikea sana.',
    reward: 'Osaat sanoa, montako niitä on!',
    demo: () => [
      { say: 'Aava laskee simpukat. Viimeinen sana on viisi, joten simpukoita on viisi.', scene: countAlong('simpukka', [[1], [2], [3], [4], [5]], { total: true }) },
      { say: 'Nyt Aava levittää simpukat. Rivi pitenee, mutta simpukoita on yhä viisi. Määrä ei muutu, kun esineitä vain siirretään.', scene: spreadRow('simpukka', 5) },
    ],
    item: cases({
      q2w: (r) => {
        const n = r.int(1, 9), k = thing(r);
        const wrong = near(r, n, 2, 1, 10);
        return { say: 'Montako niitä on? Kuuntele sanat ja valitse.', listen: { say: 'Montako niitä on? Lue sanat ja valitse.' }, scene: paint(groupArt(r, k, n)), task: choose(r, spoken(n), wrong.map(spoken), wrong.map((w) => (w > n ? `${cap(word(w))} on liikaa. Ehkä jokin tuli laskettua kahdesti.` : `${cap(word(w))} on liian vähän. Ehkä jokin jäi laskematta.`))), hint: 'Osoita jokaista kerran ja laske ääneen.', explain: `Niitä on ${word(n)}.` };
      },
      w2q: (r) => {
        const n = r.int(2, 8), k = thing(r);
        const wrong = near(r, n, 2, 1, 10);
        return { say: `Missä on ${word(n)} ${many(k, n)}?`, task: choose(r, { art: groupArt(r, k, n, 'scatter', 150, 110, 26) }, wrong.map((m) => ({ art: groupArt(r, k, m, 'scatter', 150, 110, 26) })), wrong.map((m) => `Siinä kuvassa on ${word(m)}.`)), explain: `Oikeassa kuvassa on ${word(n)} ${many(k, n)}.` };
      },
      spread: (r) => {
        const n = r.int(4, 7), k = thing(r), apart = r.chance(0.6);
        return {
          say: `Tässä on ${word(n)} ${many(k, n)}. Katso, kun ne siirretään. Montako niitä on nyt?`,
          scene: spreadRow(k, n, apart),
          task: choose(r, spoken(n), [spoken(apart ? n + 2 : n - 2), spoken(apart ? n + 1 : n - 1)], [
            apart ? 'Rivi on pidempi, mutta yhtään ei tullut lisää.' : 'Rivi on lyhyempi, mutta yhtään ei viety pois.',
            apart ? 'Rivi on pidempi, mutta yhtään ei tullut lisää.' : 'Rivi on lyhyempi, mutta yhtään ei viety pois.']),
          hint: 'Tuliko yhtään lisää tai vietiinkö yhtään pois?',
          explain: `Niitä on yhä ${word(n)}. Siirtäminen ei muuta määrää.`,
        };
      },
    }, (r) => {
      const n = r.int(3, 8), k = thing(r);
      const m = r.chance(0.5) ? n : n + r.pick([-1, 1]);
      return {
        say: `Aava sanoo: täällä on ${word(m)} ${many(k, m)}. Onko se oikein?`,
        scene: paint(groupArt(r, k, n)),
        task: fixed([YES, NO], m === n ? 0 : 1, m === n ? [undefined, 'Laske itse yksi kerrallaan ja vertaa Aavan sanaan.'] : ['Laske itse yksi kerrallaan. Saatko saman luvun kuin Aava?', undefined]),
        explain: `Niitä on ${word(n)}.${m === n ? ' Aava oli oikeassa.' : ` Aava sanoi ${word(m)}, se ei täsmää.`}`,
      };
    }),
  },
  {
    id: 'M-NUM-03', stop: 'Kolme tapaa', icon: '🎯',
    intro: 'Sama määrä voidaan näyttää kolmella tavalla: esineinä, numerona ja sanana.',
    reward: 'Esineet, numero ja sana kertovat saman. Olet laskumestari!',
    demo: (r) => [
      { say: 'Lasketaan marjat: neljä. Sama määrä voidaan kirjoittaa numerona 4 ja sanana neljä. Kaikki kolme kertovat saman.', scene: threeWays('marja', 4) },
    ],
    item: cases({
      fromQty: (r) => {
        const n = r.int(2, 9), k = thing(r);
        const [a, b] = near(r, n, 2, 1, 10);
        return {
          say: 'Laita oikea numero ja oikea sana näille esineille.',
          scene: paint(groupArt(r, k, n)),
          task: {
            kind: 'place', slots: [{ id: 'num', text: 'Numero' }, { id: 'word', text: 'Sana' }],
            tokens: r.shuffle([n, a!, b!].flatMap((m) => [{ id: `n${m}`, text: String(m) }, { id: `w${m}`, text: word(m), speak: word(m) }])),
            answer: { num: `n${n}`, word: `w${n}` },
            why: { num: 'Numero ei vastaa esineiden määrää.', word: 'Sana ei vastaa esineiden määrää.' },
          },
          explain: `Esineitä on ${word(n)}: numero ${n} ja sana ${word(n)}.`,
        };
      },
      fromNumeral: (r) => {
        const n = r.int(2, 8), k = thing(r);
        const [a, b] = near(r, n, 2, 1, 9);
        return {
          say: 'Etsi tälle numerolle oikea määrä ja oikea sana.',
          scene: paint(svg(120, 100, `<text x="60" y="82" text-anchor="middle" font-size="90" font-weight="800" fill="currentColor">${n}</text>`)),
          task: {
            kind: 'place', slots: [{ id: 'qty', text: 'Määrä' }, { id: 'word', text: 'Sana' }],
            tokens: r.shuffle([n, a!, b!].flatMap((m) => [{ id: `q${m}`, art: groupArt(r, k, m, 'line', 120, 60, 18) }, { id: `w${m}`, text: word(m), speak: word(m) }])),
            answer: { qty: `q${n}`, word: `w${n}` },
            why: { qty: 'Esineitä on eri määrä kuin numero näyttää.', word: 'Sana ei ole sama kuin numero.' },
          },
          explain: `${n} on ${word(n)}, ja siihen kuuluu ${word(n)} esinettä.`,
        };
      },
    }, (r) => {
      const n = r.int(3, 7), k = thing(r);
      const bad = r.pick(['num', 'word'] as const);
      const wrongN = n + r.pick([-1, 1]);
      const good = { art: boxArt(r, k, n, `${n} · ${word(n)}`, 170, 130) };
      const odd = { art: boxArt(r, k, n, bad === 'num' ? `${wrongN} · ${word(n)}` : `${n} · ${word(wrongN)}`, 170, 130) };
      return {
        say: 'Kummassa laatikossa esineet, numero ja sana kertovat saman määrän?',
        task: choose(r, good, [odd], [`Laske esineet: niitä on ${word(n)}. Tässä laatikossa ${bad === 'num' ? 'numero' : 'sana'} kertoo eri määrän.`], 2),
        hint: 'Laske ensin esineet. Vertaa sitten numeroon ja sanaan.',
        explain: `Esineitä on ${word(n)}. Toisessa laatikossa ${bad === 'num' ? 'numero' : 'sana'} on väärin.`,
      };
    }),
  },

  // ------------------------------------------------------------ Hyppykivet
  {
    id: 'M-NUM-07', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Numerokivet', icon: '🪨',
    intro: 'Loikka hyppii numerokiviä lammen yli. Mikä numero on seuraavassa kivessä?',
    reward: 'Loikka pääsi lammen yli!',
    demo: () => [
      { say: 'Loikka hyppää kiveltä kivelle. Joka hypyllä luku kasvaa yhdellä: neljä, viisi, kuusi. Seuraavana on seitsemän.', scene: hopWords(['4', '5', '6', '7'], { say: (_t, k) => k ? `${[4, 5, 6, 7].slice(0, k).join(', ')}${k === 4 ? ': joka hypyllä yksi lisää.' : '…'}` : 'Mikä luku on seuraavassa kivessä?' }) },
      { say: 'Kymmenen jälkeen tulee yksitoista, sitten kaksitoista. Luku kasvaa edelleen yhdellä.', scene: hopWords(['9', '10', '11', '12']) },
      { say: 'Yhdeksäntoista jälkeen alkaa uusi kymmenen: kaksikymmentä, sitten kaksikymmentäyksi.', scene: hopWords(['18', '19', '20', '21'], { say: (_t, k) => k >= 3 ? `${[18, 19, 20, 21].slice(0, k).join(', ')}: 19:n jälkeen tulee 20.` : [18, 19, 20, 21].slice(0, k).join(', ') }) },
    ],
    item: cases({
      small: (r) => seqNext(r, r.int(1, 6), 1),
      teen: (r) => seqNext(r, r.int(8, 15), 1),
      big: (r) => seqNext(r, r.int(17, 26), 1),
      order: (r) => {
        const s0 = r.pick([7, 8, 17, 18, 27]), vals = Array.from({ length: 5 }, (_, i) => String(s0 + i));
        return {
          say: 'Numerot putosivat kiviltä. Laita ne takaisin järjestykseen pienimmästä alkaen.',
          task: { kind: 'build' as const, tokens: r.shuffle([...vals]), target: vals.join(' '), mode: 'seq' as const, max: 5 },
          hint: `Aloita luvusta ${s0} ja lisää aina yksi.`,
          explain: `${vals.join(', ')}: joka kivellä yksi enemmän, myös kymmenen yli.`,
        };
      },
    }, (r) => {
      const a = r.int(5, 25);
      return { say: 'Yhdestä kivestä on numero kulunut pois. Mikä siinä oli?', scene: paint(stonesArt([a, null, a + 2, a + 3])), task: choose(r, num(a + 1), [num(a + 2), num(a + 4)], [`${a + 2} on jo seuraavassa kivessä.`, `${a + 4} tulisi vasta viimeisen kiven jälkeen.`]), hint: 'Mikä luku tulee heti luvun ' + a + ' jälkeen?', explain: `${a}, ${a + 1}, ${a + 2}: puuttuva on ${a + 1}.` };
    }),
  },
  {
    id: 'M-NUM-EQUALSTEP-SEQ', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Hyppyjono', icon: '🐸',
    intro: 'Loikka hyppää aina yhtä pitkän hypyn. Mihin se hyppää seuraavaksi?',
    reward: 'Löysit hyppyjen säännön!',
    demo: () => [
      { say: 'Loikka hyppää aina kaksi eteenpäin: kaksi, neljä, kuusi, kahdeksan, kymmenen. Joka hypyllä luku kasvaa kahdella.', scene: lineHops(2, 4, 0, 12, 2) },
      { say: 'Pidempi hyppy: viisi kerrallaan. Nolla, viisi, kymmenen, viisitoista, kaksikymmentä.', scene: lineHops(0, 4, 0, 22, 5, 5) },
      { say: 'Kun tiedät hypyn pituuden, tiedät seuraavan luvun. Hypyn pituuden saat, kun katsot, paljonko luku kasvaa kiveltä seuraavalle.', scene: lineHops(0, 4, 0, 44, 10, 10) },
    ],
    item: cases({
      step2: (r) => seqNext(r, r.int(0, 6), 2),
      step5: (r) => seqNext(r, 5 * r.int(0, 3), 5),
      step10: (r) => seqNext(r, 10 * r.int(0, 3), 10),
      rule: (r) => {
        const d = r.pick([2, 3, 5, 10]), s = d * r.int(0, 3) + r.pick([0, 0, 1]);
        const vals = [s, s + d, s + 2 * d, s + 3 * d];
        return {
          say: 'Kuinka pitkä on jokainen hyppy?',
          scene: paint(stonesArt(vals)),
          task: choose(r, txt(`+${d}`), [...new Set([1, 2 * d, d + 1])].filter((x) => x !== d).slice(0, 2).map((x) => txt(`+${x}`)), [...new Set([1, 2 * d, d + 1])].filter((x) => x !== d).slice(0, 2).map((x) => `Jos hyppy olisi ${x}, ${s}:n jälkeen tulisi ${s + x}, ei ${s + d}.`)),
          hint: `Paljonko on luvusta ${s} lukuun ${s + d}?`,
          explain: `${vals.join(', ')}: joka hyppy on + ${d}.`,
        };
      },
      extend: (r) => {
        const d = r.pick([2, 5, 10]), s = d * r.int(0, 2), a1 = s + 3 * d, a2 = s + 4 * d;
        return {
          say: 'Jatka jonoa kahdella kivellä.',
          scene: paint(stonesArt([s, s + d, s + 2 * d, null, null])),
          task: { kind: 'build' as const, tokens: r.shuffle([a1, a2, a1 + 1, a2 - d + 1].map(String)).filter((x, i, arr) => arr.indexOf(x) === i), target: `${a1} ${a2}`, mode: 'seq' as const, max: 2 },
          hint: `Hyppy on ${d}. Lisää ${d} viimeiseen lukuun.`,
          explain: `${s}, ${s + d}, ${s + 2 * d}, ${a1}, ${a2}: joka kerta + ${d}.`,
        };
      },
      which: (r) => {
        const s = r.int(1, 5), d = r.pick([2, 3]);
        const good = [s, s + d, s + 2 * d, s + 3 * d];
        const bad1 = [s, s + d, s + 2 * d + 1, s + 3 * d + 1];
        const bad2 = [s, s + 1, s + 3, s + 6];
        return { say: 'Missä jonossa hypyt ovat kaikki yhtä pitkiä?', task: choose(r, txt(good.join(', ')), [txt(bad1.join(', ')), txt(bad2.join(', '))], [`Hypyt: ${d}, ${d + 1}, ${d}. Keskimmäinen on pidempi.`, 'Hypyt: 1, 2, 3. Ne pitenevät.'], 1), hint: 'Laske jokaisen hypyn pituus: paljonko luku kasvaa?', explain: `${good.join(', ')}: joka kerta + ${d}.` };
      },
    }, (r) => {
      const d = r.pick([2, 5, 10]), s = d * r.int(1, 3);
      return { say: 'Yhden kiven numero puuttuu. Mikä siinä on?', scene: paint(stonesArt([s, s + d, null, s + 3 * d])), task: choose(r, num(s + 2 * d), [num(s + d + 1), num(s + 3 * d + d)], ['Hyppy ei ole yksi vaan ' + d + '.', `${s + 4 * d} tulisi viimeisen kiven jälkeen.`]), hint: 'Katso kahta ensimmäistä kiveä: kuinka pitkä hyppy on?', explain: `Hyppy on ${d}: ${s}, ${s + d}, ${s + 2 * d}, ${s + 3 * d}.` };
    }),
  },
  {
    id: 'M-NUM-MULTIPLE-INTRO', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Loikan hypyt', icon: '🦘',
    intro: 'Loikka lähtee nollasta ja hyppää aina saman verran. Mihin kiviin se osuu?',
    reward: 'Tiedät, mihin Loikka osuu!',
    demo: () => [
      { say: 'Loikka hyppää kolme kerrallaan: nollasta kolmeen, kolmesta kuuteen, kuudesta yhdeksään, yhdeksästä kahteentoista. Muihin kiviin hän ei osu.', scene: lineHops(0, 4, 0, 13, 3) },
      { say: 'Viisi kerrallaan: viisi, kymmenen, viisitoista, kaksikymmentä. Laske hypyt: neljännellä hypyllä Loikka on kivellä kaksikymmentä.', scene: lineHops(0, 4, 0, 22, 5, 5) },
    ],
    item: cases(Object.fromEntries([2, 3, 5].map((k) => [`k${k}`, (r: Rng) => {
      const j = r.int(2, 5);
      const target = k * j;
      const wrong = r.shuffle([target - 1, target + 1, target + (k === 2 ? 3 : 2)].filter((x) => x % k !== 0 && x > 0)).slice(0, 2);
      return {
        say: `Loikka hyppää aina ${word(k)} kiveä kerrallaan nollasta. Mihin näistä se osuu?`,
        scene: paint(jumpsArt(k * 5 > 20 ? 20 : k * 6, k, 2)),
        task: choose(r, num(target), wrong.map(num), wrong.map((x) => `Hypyt menevät ${k}, ${2 * k}, ${3 * k}… Kivi ${x} jää hyppyjen väliin.`)),
        hint: `Laske hypyt: ${k}, ${2 * k}, ${3 * k}…`,
        explain: `Hypyt: ${Array.from({ length: j }, (_, i) => k * (i + 1)).join(', ')}. Loikka osuu kiveen ${target}.`,
      };
    }]).concat([
      ['nth', (r: Rng) => {
        const k = r.pick([2, 3, 5]), j = r.int(2, 4), max = k * 5;
        return {
          say: `Loikka hyppää nollasta ${word(k)} kerrallaan. Napauta kivi, jolle hän osuu ${['', '', 'toisella', 'kolmannella', 'neljännellä'][j]} hypyllä.`,
          task: { kind: 'line' as const, min: 0, max, step: 1, answer: k * j, labelEvery: k === 5 ? 5 : 1, whyAt: { [k * (j - 1)]: `Se on hyppy ${j - 1}. Hyppää vielä kerran.`, [k * (j + 1)]: `Se on jo hyppy ${j + 1}: yksi liikaa.`, [j]: `${j} on hyppyjen määrä. Jokainen hyppy on ${k} pitkä.` } },
          hint: `Laske hypyt sormilla: ensimmäinen päättyy kivelle ${k}, toinen kivelle ${2 * k}…`,
          explain: `${Array.from({ length: j }, (_, i) => k * (i + 1)).join(', ')}: ${j}. hyppy päättyy kivelle ${k * j}.`,
        };
      }],
      ['hits', (r: Rng) => {
        const k = r.pick([2, 3, 5]), n = r.int(k + 1, 4 * k), yes = n % k === 0;
        const near = Math.floor(n / k) * k;
        return {
          say: `Loikka hyppää nollasta ${word(k)} kerrallaan. Osuuko hän kivelle ${n}?`,
          task: YESNO(yes, `Osuu: ${Array.from({ length: n / k }, (_, i) => k * (i + 1)).join(', ')}.`, `Ei osu: hypyt menevät ${near} ja sitten ${near + k}. ${n} jää väliin.`),
          hint: `Laske ${k} kerrallaan: ${k}, ${2 * k}, ${3 * k}…`,
          explain: yes ? `${n} on hyppyjen ${k}, ${2 * k}, … joukossa.` : `${near}, ${near + k}: ${n} jää väliin.`,
        };
      }],
    ] as [string, (r: Rng) => ReturnType<typeof Object>][])), (r) => {
      const k = r.pick([2, 3]);
      const nums = Array.from({ length: 12 }, (_, i) => i + 1);
      return {
        say: `Loikka hyppää ${word(k)} kerrallaan nollasta. Valitse kaikki kivet, joihin se osuu.`,
        task: { kind: 'multi', options: nums.map(num), answer: nums.map((n, i) => (n % k === 0 ? i : -1)).filter((i) => i >= 0), cols: 4 },
        hint: `Aloita nollasta ja laske ${word(k)} kerrallaan.`,
        explain: `Loikka osuu kiviin ${nums.filter((n) => n % k === 0).join(', ')}.`,
      };
    }),
  },
  {
    id: 'M-NUM-16', rev: LAUNCH_REV, validRevs: [AUDIT_REV, LAUNCH_REV], stop: 'Hyppyjen salaisuus', icon: '🔍',
    intro: 'Kivien numeroista näkee, kuinka pitkiä hyppyjä Loikka teki.',
    reward: 'Ratkaisit hyppyjen salaisuuden!',
    demo: () => [
      { say: 'Viisi, kymmenen, viisitoista, kaksikymmentä. Katso, paljonko luku kasvaa kiveltä seuraavalle: joka kerta viisi. Hyppy on viisi, ja nämä ovat viiden hyppyjä nollasta.', scene: diffArcs([5, 10, 15, 20]) },
      { say: 'Loikka hyppää kaksi kerrallaan ja Aava kolme kerrallaan. Joihinkin kiviin osuvat molemmat: kuusi, kaksitoista. Ensimmäinen yhteinen kivi nollan jälkeen on kuusi.', scene: twoHoppers(2, 3, 13) },
    ],
    item: cases({
      step: (r) => {
        const k = r.pick([2, 3, 4, 5, 10]);
        const s = [k, 2 * k, 3 * k, 4 * k];
        const ws = r.shuffle([...new Set([1, k + 1, 2 * k, k - 1])].filter((x) => x > 0 && x !== k)).slice(0, 2);
        const why = (x: number) => x === 2 * k ? `${2 * k} on kahden hypyn pituus: ${k} ja ${k}.` : `Jos hyppy olisi ${x}, ensimmäisen kiven jälkeen tulisi ${k + x}, ei ${2 * k}.`;
        return { say: 'Loikka lähti nollasta. Kuinka pitkiä hyppyjä se teki?', scene: paint(stonesArt(s)), task: choose(r, num(k), ws.map(num), ws.map(why)), hint: `Paljonko on luvusta ${k} lukuun ${2 * k}?`, explain: `Joka kivellä luku kasvaa ${k}:llä.` };
      },
      gaps: (r) => {
        const k = r.pick([2, 3, 4, 5]), vals = [k, 2 * k, 3 * k, 4 * k, 5 * k];
        return {
          say: 'Kahdesta kivestä numero on kulunut pois. Laita puuttuvat numerot paikoilleen järjestyksessä.',
          scene: paint(stonesArt([vals[0]!, vals[1]!, null, vals[3]!, null])),
          task: { kind: 'build' as const, tokens: r.shuffle([...new Set([3 * k, 5 * k, 3 * k + 1, 6 * k])].map(String)), target: `${3 * k} ${5 * k}`, mode: 'seq' as const, max: 2 },
          hint: `Hyppy on ${k}. Mikä tulee luvun ${2 * k} jälkeen?`,
          explain: `${vals.join(', ')}: joka kerta + ${k}.`,
        };
      },
      next: (r) => {
        const k = r.pick([2, 3, 4, 5, 10]), a = r.int(1, 3);
        return seqNext(r, k * a, k);
      },
    }, (r) => {
      const [a, b, lcm] = r.pick([[2, 3, 6], [2, 5, 10], [3, 4, 12], [4, 6, 12], [3, 5, 15]] as const);
      const wrong = [...new Set([a + b, b, a * b === lcm ? lcm + a : a * b].filter((x) => x !== lcm))].slice(0, 2);
      return {
        say: `Loikka hyppää ${word(a)} kerrallaan ja Aava ${word(b)} kerrallaan. Molemmat lähtevät nollasta. Mihin kiveen he osuvat molemmat ensimmäisenä nollan jälkeen?`,
        task: choose(r, num(lcm), wrong.map(num), wrong.map((x) => x === a + b ? 'Hyppyjen pituuksia ei lasketa yhteen. Etsi kivi, johon molemmat osuvat.' : x === b ? `Aava osuu kiveen ${b}, mutta Loikka hyppää ${a}, ${2 * a}… eikä osu siihen.` : `Molemmat osuvat kiveen ${x}, mutta jo aiemmin kiveen ${lcm}.`)),
        hint: 'Kirjoita kummankin kivet nollan jälkeen ja etsi ensimmäinen yhteinen. Lähtökiveä 0 ei lasketa.',
        explain: `Loikka: ${[1, 2, 3, 4, 5, 6].map((i) => a * i).join(', ')}… Aava: ${[1, 2, 3, 4].map((i) => b * i).join(', ')}… Ensimmäinen yhteinen nollan jälkeen on ${lcm}.`,
      };
    }),
  },
];

function fixFrog(r: Rng, how: 'swap' | 'skip') {
  const m = r.int(4, 7);
  const good = Array.from({ length: m }, (_, i) => i + 1);
  const bad = [...good];
  const i = r.int(1, m - 2);
  if (how === 'swap') [bad[i], bad[i + 1]] = [bad[i + 1]!, bad[i]!];
  else bad.splice(i, 1);
  const g = good.map(word).join(', '), b = bad.map(word).join(', ');
  const loikkaRight = r.chance(0.5);
  const gq = good.join(' '), bq = bad.join(' ');
  return {
    say: 'Kuuntele Loikan ja Aavan laskut. Kumpi laski oikein?',
    listen: { say: 'Lue Loikan ja Aavan laskut. Kumpi laski oikein?' },
    task: fixed([
      { art: svg(80, 70, frog(40, 36, 22)), text: 'Loikka', speak: loikkaRight ? g : b, quiet: loikkaRight ? gq : bq },
      { art: svg(80, 70, duck(36, 36, 22)), text: 'Aava', speak: loikkaRight ? b : g, quiet: loikkaRight ? bq : gq },
    ], loikkaRight ? 0 : 1, [], 2),
    hint: 'Paina keltaista kaiutinta kuullaksesi laskun.',
    explain: `Oikea järjestys: ${g}.`,
  };
}

function seqNext(r: Rng, start: number, d: number) {
  const vals = [start, start + d, start + 2 * d];
  const ans = start + 3 * d;
  const wrong = d === 1 ? [ans + 1, ans - 2] : [ans - d + 1, ans + d];
  return {
    say: d === 1 ? 'Mikä numero on seuraavassa kivessä?' : 'Hypyt ovat yhtä pitkiä. Mikä numero on seuraavassa kivessä?',
    scene: paint(stonesArt([...vals, null])),
    task: choose(r, num(ans), wrong.map(num), d === 1 ? [`${ans + 1} hyppää yhden kiven yli: ennen sitä tulee ${ans}.`, `${ans - 2} on jo kivissä. Jono menee eteenpäin.`] : [`Hyppy ei ole yksi vaan ${d}.`, `${ans + d} on kahden hypyn päässä: ennen sitä tulee ${ans}.`]),
    hint: d === 1 ? 'Sano luvut ääneen.' : `Paljonko luku kasvaa joka kerta?`,
    explain: `${vals.join(', ')}, ${ans}: joka kerta + ${d}.`,
  };
}
