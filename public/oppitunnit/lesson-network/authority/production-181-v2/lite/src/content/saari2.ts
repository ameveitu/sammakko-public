// Aarresaaristo, part 2: fractions (pie party), equations on a balance (scale island),
// measuring and data (research station). Grades 3–6.
import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Option, Task } from '../engine/types';
import { svg, THINGS } from '../ui/art';
import { cases, choose, fixed, groupArt, paint, table, txt } from './kit';
import { balanceArt, fracArt, fracRow, fracText, rulerArt, tallyArt, thermoArt } from './pics';
import { cutScene, eatTwoScene, factoryScene, fracWords, nameScene, shrinkScene } from './fracanim';
import { AUDIT_REV } from './audit-rev';
import { bagScene, buildEqScene, equalsScene } from './alganim';
import { buildTableScene, fairCountScene, stepsScene, tableReadScene, tallyScene, twoWayScene } from './dataanim';
import { matchToolScene, readScaleScene, repeatScene, tareScene, unitFitScene, zeroScene } from './toolanim';

type Q = Omit<Item, 'tag'>;
const t = (s: string): Option => txt(s, false);
const fr = (a: number, b: number): Option => ({ art: `<div class="big-frac">${fracText(a, b)}</div>`, speak: `${a}/${b}` });
const card = (...lines: string[]) => paint(`<div class="formula">${lines.join('<br>')}</div>`);
const ask = (say: string, answer: number, unit: string, explain: string, scene?: string): Q =>
  ({ say, scene: scene ? paint(scene) : undefined, task: { kind: 'numeric', answer, unit }, explain });
const wq = (q: Q, hint: string, whyAt: Record<number, string> = {}): Q => ({ ...q, hint, task: { ...q.task, whyAt } as Task });
const YESNO = (yes: boolean, whyNo?: string, whyYes?: string) => fixed([t('Kyllä'), t('Ei')], yes ? 0 : 1, yes ? [undefined, whyNo] : [whyYes, undefined], 2);

/** Unequal cuts into n parts (still sums to 1). */
function unequal(r: Rng, n: number): number[] {
  const w = Array.from({ length: n }, (_, i) => 1 + (i % 2 ? 0.35 : 1.4) * (0.6 + r.next() * 0.4));
  const s = w.reduce((a, b) => a + b, 0);
  return r.shuffle(w.map((x) => x / s));
}
/** A row of flags, `red` of them red. */
const flags = (n: number, red: number) => svg(n * 40 + 8, 64, Array.from({ length: n }, (_, i) =>
  `<line x1="${14 + i * 40}" y1="8" x2="${14 + i * 40}" y2="60" stroke="currentColor" stroke-width="3"/><path d="M${14 + i * 40} 10 l24 9 l-24 9z" fill="${i < red ? 'var(--red)' : 'var(--blue)'}" stroke="currentColor" stroke-width="1.5"/>`).join(''), `${red} punaista ${n} lipusta`);

const ANIMALS = [['🦆', 'sorsa', 'sorsaa'], ['🐟', 'kala', 'kalaa'], ['🐸', 'sammakko', 'sammakkoa'], ['🐦', 'lokki', 'lokkia'], ['🐌', 'etana', 'etanaa']] as const;
const zoo = (r: Rng, k = 3) => r.shuffle([...ANIMALS]).slice(0, k);
const distinct = (r: Rng, k: number, lo: number, hi: number) => r.shuffle(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)).slice(0, k);

export const SAARI2_NODES: NodeSpec[] = [
  // ============================================================ piirakka: fractions
  {
    id: 'M-FRAC-01', stop: 'Reilut palat', icon: '🥧',
    intro: 'Piirakkajuhlassa jokainen saa yhtä ison palan. Reilu jako tarkoittaa yhtä suuria osia.',
    reward: 'Osaat jakaa reilusti yhtä suuriin osiin!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Piirakka leikataan neljään osaan. Ovatko palat yhtä suuria? Nostetaan ne päällekkäin ja katsotaan.', scene: cutScene(4) },
      { say: 'Tässäkin on neljä palaa, mutta testi paljastaa eron. Palojen määrä ei riitä: niiden pitää olla yhtä suuria.', scene: cutScene(4, [0.4, 0.15, 0.3, 0.15]) },
      { say: 'Kolme ystävää: kolme yhtä suurta palaa. Jokainen saa kolmasosan.', scene: cutScene(3) },
    ],
    item: cases({
      equal: (r) => {
        const n = r.int(3, 6);
        return {
          say: 'Mikä piirakka on jaettu yhtä suuriin osiin?',
          task: choose(r, { art: fracArt(n, 0, 'pie', undefined, 96) }, [{ art: fracArt(n, 0, 'pie', unequal(r, n), 96) }, { art: fracArt(n, 0, 'pie', unequal(r, n), 96) }], ['Palat ovat eri kokoisia.', 'Palat ovat eri kokoisia.'], 3),
          hint: 'Kuvittele palat päällekkäin: reilussa jaossa ne peittävät toisensa täsmälleen.',
          explain: `Reilussa jaossa jokainen ${n} palasta on yhtä suuri.`,
        };
      },
      count: (r) => {
        const n = r.int(3, 8), bar = r.chance(0.4);
        return {
          say: `Moneenko yhtä suureen osaan ${bar ? 'suklaalevy' : 'piirakka'} on jaettu?`,
          scene: paint(fracArt(n, 0, bar ? 'bar' : 'pie', undefined, 150)),
          task: choose(r, { big: String(n) }, [{ big: String(n + 1) }, { big: String(n - 1) }], ['Laskit yhden liikaa. Aloita yhdestä palasta ja merkitse mielessä lasketut.', 'Yksi pala jäi laskematta. Kierrä koko kuva ympäri.']),
          hint: 'Laske palat yksi kerrallaan. Leikkausviivoja ei lasketa, vaan niiden väliset palat.',
          explain: `Osia on ${n}, ja ne ovat kaikki yhtä suuria.`,
        };
      },
      fair: (r) => {
        const n = r.int(3, 5), ok = r.chance(0.5);
        return {
          say: `${n} ystävää jakaa piirakan näin. Saako jokainen yhtä paljon?`,
          scene: paint(fracArt(n, 0, 'pie', ok ? undefined : unequal(r, n), 150)),
          task: YESNO(ok, 'Palat ovat yhtä suuria.', 'Palat ovat eri kokoisia: joku saa enemmän.'),
          hint: 'Älä laske vain palojen määrää. Vertaa niiden kokoa.',
          explain: ok ? 'Kaikki palat ovat yhtä suuria: jako on reilu.' : 'Palojen määrä on oikea, mutta ne ovat eri kokoisia: jako ei ole reilu.',
        };
      },
      sortfair: (r) => {
        const ns = r.shuffle([3, 4, 5, 6]), ok = r.shuffle([true, true, false, false]);
        const items = ns.map((n, i) => ({ art: fracArt(n, 0, i % 2 ? 'bar' : 'pie', ok[i] ? undefined : unequal(r, n), 84) }));
        return {
          say: 'Lajittele: onko jako reilu vai ei?',
          task: { kind: 'sort' as const, items, cats: [{ label: 'Reilu' }, { label: 'Ei reilu' }], answer: ok.map((x) => (x ? 0 : 1)), why: ns.map((n, i) => (ok[i] ? `Kaikki ${n} palaa ovat yhtä suuria.` : `${n} palaa, mutta eri kokoisia.`)) },
          hint: 'Reilu jako = kaikki palat yhtä suuria. Palojen määrä ei ratkaise.',
          explain: 'Reiluissa jaoissa palat peittäisivät toisensa täsmälleen, muissa jokin pala on isompi.',
        };
      },
    }, (r) => {
      const n = r.pick([3, 4, 5]);
      return {
        hint: `Tarvitaan yksi pala jokaiselle ${n} ystävälle, ja palojen pitää olla yhtä suuria.`,
        say: `${n} ystävää jakaa suklaalevyn reilusti. Mikä jako sopii?`,
        task: choose(r, { art: fracArt(n, 0, 'bar', undefined, 110) }, [{ art: fracArt(n, 0, 'bar', unequal(r, n), 110) }, { art: fracArt(n + 1, 0, 'bar', undefined, 110) }], ['Paloja on oikea määrä, mutta ne ovat eri kokoisia.', `Paloja on ${n + 1}, ystäviä ${n}.`], 1),
        explain: `Tarvitaan ${n} yhtä suurta palaa: yksi jokaiselle.`,
      };
    }),
  },
  {
    id: 'M-FRAC-02', stop: 'Murtoluku', icon: '🍰',
    intro: 'Murtoluku kertoo, kuinka suuri osa kokonaisesta on otettu.',
    reward: 'Osaat nimetä palat murtoluvuilla!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Piirakka on jaettu viiteen yhtä suureen osaan. Lasketaan ensin kaikki osat, sitten väritetyt. Murtoluku syntyy laskemalla.', scene: nameScene(5, 2) },
      { say: 'Suklaalevy toimii samoin: alas kaikkien osien määrä, ylös otettujen määrä.', scene: nameScene(8, 3, 'bar') },
      { say: 'Varo: alas ei tule värittämättömien määrä, vaan kaikkien osien määrä.', scene: nameScene(4, 1, 'pie', true) },
    ],
    item: cases({
      name: (r) => {
        const b = r.int(3, 8);
        let a = r.int(1, b - 1); if (2 * a === b) a = a === 1 ? 2 : a - 1;
        return {
          say: 'Mikä osa piirakasta on väritetty?',
          scene: paint(fracArt(b, a, r.chance(0.3) ? 'bar' : 'pie', undefined, 150)),
          task: choose(r, fr(a, b), [fr(a, b - a), fr(b - a, b)], ['Alempi luku on kaikkien osien määrä, ei värittämättömien.', 'Tämä on värittämätön osa.']),
          hint: 'Laske ensin kaikki osat: se on alempi luku. Sitten väritetyt: ylempi luku.',
          explain: `Osia on ${b}, ja niistä ${a} on väritetty: ${a}/${b}, ${fracWords(a, b)}.`,
        };
      },
      trap: (r) => {
        const ok = r.chance(0.5);
        return {
          say: 'Onko väritetty osa neljäsosa koko piirakasta?',
          scene: paint(fracArt(4, 1, 'pie', ok ? undefined : [0.4, 0.2, 0.25, 0.15], 150)),
          task: YESNO(ok, 'Kaikki osat ovat yhtä suuria, joten väritetty on neljäsosa.', 'Osat ovat eri kokoisia, joten väritetty ei ole neljäsosa.'),
          hint: 'Neljäsosa on yksi neljästä yhtä suuresta osasta. Ovatko osat yhtä suuria?',
          explain: ok ? 'Neljä yhtä suurta osaa, yksi väritetty: neljäsosa.' : 'Neljäsosa vaatii neljä yhtä suurta osaa. Tämä pala on muita isompi.',
        };
      },
      shade: (r) => {
        const b = r.int(4, 7), a = r.int(2, b - 2);
        return {
          say: `Missä kuvassa ${a}/${b} on väritetty?`,
          task: choose(r, { art: fracArt(b, a, 'pie', undefined, 96) }, [{ art: fracArt(b, b - a === a ? a + 1 : b - a, 'pie', undefined, 96) }, { art: fracArt(b + 1, a, 'pie', undefined, 96) }], [`Tässä on väritetty ${b - a === a ? a + 1 : b - a} osaa, ei ${a}.`, `Tässä osia on ${b + 1}, ei ${b}.`], 3),
          hint: `Etsi kuva, jossa on ${b} osaa ja niistä ${a} väritetty.`,
          explain: `${b} yhtä suurta osaa, ${a} väritetty.`,
        };
      },
      build: (r) => {
        const b = r.int(3, 8);
        let a = r.int(1, b - 1); if (2 * a === b) a = a === 1 ? 2 : a - 1;
        return {
          say: 'Rakenna murtoluku: vedä luvut oikeille paikoille. Yksi luku jää yli.',
          scene: paint(fracArt(b, a, r.chance(0.4) ? 'bar' : 'pie', undefined, 140)),
          task: {
            kind: 'place',
            slots: [{ id: 'top', text: 'Ylös: väritetyt osat' }, { id: 'bot', text: 'Alas: kaikki osat' }],
            tokens: r.shuffle([String(a), String(b), String(b - a)]).map((x) => ({ id: `n${x}`, text: x })),
            answer: { top: `n${a}`, bot: `n${b}` },
            why: { top: `Väritettyjä osia on ${a}.`, bot: `Kaikkia osia on ${b}; ${b - a} on värittämättömät.` },
          } as Task,
          hint: 'Alas tulee kaikkien osien määrä, ylös väritettyjen.',
          explain: `${a}/${b}: ${a} väritettyä ${b}:stä osasta. ${b - a} jäi yli: se on värittämättömien määrä.`,
        };
      },
    }, (r) => {
      const n = r.int(4, 6), red = r.int(1, n - 1);
      return {
        hint: 'Kokonainen on nyt koko lippurivi. Laske kaikki liput ja sitten punaiset.',
        say: `Laiturilla on ${n} lippua. Mikä osa lipuista on punaisia?`,
        scene: paint(flags(n, red)),
        task: choose(r, fr(red, n), [fr(red, n - red), fr(n - red, n)].filter((o) => o.speak !== `${red}/${n}`), ['Alempi luku on kaikkien lippujen määrä.', 'Tämä on sinisten osuus.']),
        explain: `Kokonaisena on nyt koko lippurivi: ${n} lippua, joista ${red} punaista: ${red}/${n}.`,
      };
    }),
  },
  {
    id: 'M-FRAC-03', stop: 'Osoittaja ja nimittäjä', icon: '✂️',
    intro: 'Murtoluvun alempi luku on nimittäjä ja ylempi osoittaja. Kumpikin kertoo eri asian.',
    reward: 'Osaat lukea murtoluvun kumpaakin lukua!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Nimittäjä kertoo, moneenko yhtä suureen osaan kokonainen jaetaan. Katso, miten yksi pala pienenee, kun nimittäjä kasvaa.', scene: shrinkScene([2, 4, 8]) },
      { say: 'Osoittaja kertoo, montako palaa otetaan. Kun kaksi syöjää ottaa samankokoisia paloja, osoittajat lasketaan yhteen ja nimittäjä pysyy.', scene: eatTwoScene(8, 3, 2) },
    ],
    item: cases({
      meaning: (r) => {
        const b = r.int(3, 9), a = r.int(1, b - 1), top = r.chance(0.5);
        const A = 'Moneenko yhtä suureen osaan kokonainen on jaettu', B = 'Montako osaa on otettu', C = 'Kuinka monta kokonaista on';
        return {
          say: `Murtoluvussa ${a}/${b} mitä ${top ? 'ylempi luku eli osoittaja' : 'alempi luku eli nimittäjä'} kertoo?`,
          scene: paint(`<div class="big-frac">${fracText(a, b)}</div>`),
          task: choose(r, t(top ? B : A), [t(top ? A : B), t(C)], [top ? 'Tämän kertoo alempi luku, nimittäjä.' : 'Tämän kertoo ylempi luku, osoittaja.', `Murtoluku ${a}/${b} on osa yhdestä kokonaisesta; kokonaisten määrää se ei kerro.`]),
          hint: 'Alempi luku = moneenko osaan jaettu. Ylempi = montako otettu.',
          explain: top ? `Osoittaja ${a}: otettuja osia on ${a}.` : `Nimittäjä ${b}: kokonainen on jaettu ${b} yhtä suureen osaan.`,
        };
      },
      unit: (r) => {
        const [a, b] = r.shuffle([r.int(2, 4), r.int(5, 9)]);
        const big = Math.min(a!, b!);
        return {
          say: `Kumpi pala on suurempi: 1/${a} vai 1/${b}?`,
          scene: paint(`<div class="pics">${fracArt(a!, 1, 'pie', undefined, 90)}${fracArt(b!, 1, 'pie', undefined, 90)}</div>`),
          task: choose(r, fr(1, big), [fr(1, Math.max(a!, b!))], ['Suurempi nimittäjä tarkoittaa, että kokonainen jaetaan useampaan osaan: palat ovat pienempiä.'], 2),
          hint: 'Mieti piirakkaa: kumpi pala on isompi, kun piirakka jaetaan harvempaan osaan?',
          explain: `1/${big} on suurempi: mitä vähemmän osia, sitä isompi jokainen pala.`,
        };
      },
      same: (r) => {
        const b = r.int(5, 9), [x, y] = distinct(r, 2, 1, b - 1);
        return {
          say: `Kumpi on enemmän: ${x}/${b} vai ${y}/${b}?`,
          task: choose(r, fr(Math.max(x!, y!), b), [fr(Math.min(x!, y!), b)], ['Palat ovat samankokoisia, joten enemmän paloja on enemmän.'], 2),
          hint: 'Nimittäjät ovat samat, joten palat ovat yhtä suuria. Vertaa osoittajia.',
          explain: `Samat palat (${b}-osat): ${Math.max(x!, y!)} palaa on enemmän kuin ${Math.min(x!, y!)}.`,
        };
      },
      order: (r) => {
        const ns = r.shuffle([2, 3, 4, 5, 6, 8, 10]).slice(0, 3).sort((x, y) => x - y);
        return {
          say: 'Järjestä palat suurimmasta pienimpään: vedä murtoluvut paikoilleen.',
          task: {
            kind: 'place',
            slots: [{ id: 'p0', text: 'Suurin pala' }, { id: 'p1', text: 'Keskikokoinen' }, { id: 'p2', text: 'Pienin pala' }],
            tokens: r.shuffle(ns.map((n) => ({ id: `u${n}`, text: `1/${n}` }))),
            answer: { p0: `u${ns[0]}`, p1: `u${ns[1]}`, p2: `u${ns[2]}` },
            why: { p0: `1/${ns[0]}: kokonainen jaetaan vain ${ns[0]} osaan, joten pala on suurin.`, p1: `1/${ns[1]} on näiden kahden välissä.`, p2: `1/${ns[2]}: eniten osia, joten pienin pala.` },
          } as Task,
          hint: 'Mitä suurempi nimittäjä, sitä pienempi pala.',
          explain: `1/${ns[0]} > 1/${ns[1]} > 1/${ns[2]}.`,
        };
      },
    }, (r) => {
      const b = r.pick([6, 8, 10]), a = r.int(1, 3), c = r.int(1, b - a - 1);
      return {
        say: `Aava söi ${a}/${b} piirakasta ja Loikka ${c}/${b}. Kuinka suuren osan he söivät yhteensä?`,
        scene: paint(fracArt(b, a + c, 'bar', undefined, 160)),
        task: choose(r, fr(a + c, b), [fr(a + c, 2 * b), fr(a * c, b)].filter((o, i, l) => l.findIndex((p) => p.speak === o.speak) === i && o.speak !== `${a + c}/${b}`), ['Palat eivät muutu pienemmiksi, kun niitä syödään. Nimittäjä pysyy samana.', 'Paloja ei kerrota keskenään, vaan ne lasketaan yhteen.']),
        hint: 'Samankokoisia paloja: laske palojen määrät yhteen, nimittäjä pysyy.',
        explain: `Samankokoisia paloja: ${a} + ${c} = ${a + c} palaa, eli ${a + c}/${b}. Nimittäjä ei muutu.`,
      };
    }),
  },
  {
    id: 'M-FRAC-15', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Piirakkatehdas', icon: '🏭',
    intro: 'Tehdas leipoo monta piirakkaa. Lasketaan samanlaiset palat yhteen.',
    reward: 'Tehdas toimii: osaat kertoa murtoluvun!',
    demo: () => [
      { say: 'Kolmesta piirakasta otetaan kustakin kaksi viidesosaa. Katso, kun palat siirtyvät vatiin yksi kerrallaan. Kolme kertaa kaksi palaa on kuusi palaa, ja jokainen on yhä viidesosa: kuusi viidesosaa. Viisi palaa täyttää yhden kokonaisen.', scene: factoryScene(3, 5, 2) },
      { say: 'Neljä vierasta saa kukin kolme neljäsosaa. Kaksitoista neljäsosaa täyttää kolme vatia: kolme kokonaista piirakkaa. Nimittäjää ei kerrota, koska palan koko pysyy samana.', scene: factoryScene(4, 4, 3) },
    ],
    item: cases({
      repeat: (r) => {
        const n = r.int(2, 4), b = r.int(3, 6), a = r.int(1, b - 1);
        return {
          say: `${n} × ${a}/${b} = ?`,
          scene: paint(fracRow(n, b, a)),
          task: choose(r, fr(n * a, b), [fr(n * a, n * b), fr(a, n * b)], ['Palojen koko ei muutu: nimittäjä pysyy samana.', `Kerro palojen määrä: ${n} × ${a}. Nimittäjä pysyy.`]),
          hint: `Laske palat: ${n} piirakkaa, kustakin ${a} palaa. Palan koko on yhä 1/${b}.`,
          explain: `${n} kertaa ${a} palaa = ${n * a} palaa, kukin 1/${b}: ${n * a}/${b}.`,
        };
      },
      count: (r) => {
        const n = r.int(2, 5), b = r.int(3, 6), a = r.int(1, b - 1);
        const whyAt: Record<number, string> = {};
        if (n + a !== n * a) whyAt[n + a] = `Tässä laskettiin ${n} + ${a}. ${n} kertaa ${a} palaa on kertolasku.`;
        if (a !== n * a) whyAt[a] = `${a} palaa on yhdestä piirakasta. Piirakoita on ${n}.`;
        return wq(ask(`Montako ${b === 3 ? 'kolmasosaa' : b === 4 ? 'neljäsosaa' : b === 5 ? 'viidesosaa' : 'kuudesosaa'} on ${n} × ${a}/${b}?`, n * a, 'kpl', `${n} × ${a} = ${n * a}. Siis ${n * a}/${b}.`, fracRow(n, b, a)), `Laske oranssit palat kaikista piirakoista: ${n} × ${a}.`, whyAt);
      },
      whole: (r) => {
        const b = r.int(2, 6);
        return wq(ask(`${b} × 1/${b} = □ kokonaista`, 1, 'kokonaista', `${b} palaa, joista jokainen on 1/${b}: yhteensä ${b}/${b} eli yksi kokonainen.`, fracRow(b, b, 1)), `${b} palaa, kukin 1/${b}: kuinka monta kokonaista ${b}/${b} täyttää?`, { [b]: `${b} on palojen määrä. ${b}/${b} on yksi kokonainen.` });
      },
      line: (r) => {
        const rows: { n: number; a: number; b: number }[] = [];
        while (rows.length < 3) {
          const q = { n: r.int(2, 4), b: r.int(3, 6), a: 0 }; q.a = r.int(1, q.b - 1);
          if (!rows.some((p) => p.n * p.a * q.b === q.n * q.a * p.b || (p.n * p.a === q.n * q.a && p.b === q.b))) rows.push(q);
        }
        const d0 = rows[0]!, decoy = `${d0.n * d0.a}/${d0.n * d0.b}`;
        const toks = r.shuffle([...rows.map((q) => `${q.n * q.a}/${q.b}`), decoy]).map((x, i) => ({ id: `t${i}`, text: x }));
        const idOf = (x: string) => toks.find((q) => q.text === x)!.id;
        return {
          say: 'Tehtaan linjat: vedä oikea tulos jokaisen kertolaskun alle. Yksi kortti jää yli.',
          task: {
            kind: 'place',
            slots: rows.map((q, i) => ({ id: `s${i}`, text: `${q.n} × ${q.a}/${q.b}` })),
            tokens: toks,
            answer: Object.fromEntries(rows.map((q, i) => [`s${i}`, idOf(`${q.n * q.a}/${q.b}`)])),
            why: Object.fromEntries(rows.map((q, i) => [`s${i}`, `${q.n} × ${q.a} = ${q.n * q.a} palaa, nimittäjä pysyy ${q.b}.`])),
          } as Task,
          hint: 'Kerro vain osoittaja. Palan koko eli nimittäjä pysyy.',
          explain: rows.map((q) => `${q.n} × ${q.a}/${q.b} = ${q.n * q.a}/${q.b}`).join(', ') + `. ${decoy} syntyy, jos nimittäjäkin kerrotaan.`,
        };
      },
    }, (r) => {
      const n = r.pick([4, 8, 12]), b = 4, a = 3, ans = (n * a) / b;
      return wq(ask(`Jokaiselle ${n} vieraalle leikataan ${a}/${b} piirakkaa. Montako kokonaista piirakkaa tarvitaan?`, ans, 'piirakkaa', `${n} × ${a}/${b} = ${n * a}/${b} = ${ans} kokonaista, koska ${b} neljäsosaa on yksi piirakka.`, fracRow(Math.min(n, 4), b, a)), `Laske ensin palat: ${n} × ${a}. Montako neljän palan piirakkaa niistä tulee?`, { [n * a]: `${n * a} on palojen määrä. Jokaisessa piirakassa on ${b} palaa.`, [n]: `Vieraita on ${n}, mutta kukin saa vain ${a}/${b} piirakkaa.` });
    }),
  },

  // ============================================================ vaaka: equations
  {
    id: 'M-ALG-04', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Arvoituspussi', icon: '👜',
    intro: 'Vaakasaaren pussissa on piilossa jokin määrä. Vaaka paljastaa, kuinka paljon.',
    reward: 'Arvoitus ratkesi: osaat löytää puuttuvan luvun!',
    demo: () => [
      { say: 'Vasemmalla on pussi ja 3 kilon paino, oikealla 8 kiloa. Vaaka on suorassa. Kahdeksan kiloa on sama kuin 3 ja 5 kiloa. Jos otetaan 3 kiloa vain vasemmalta, vaaka kallistuu. Otetaan siis 3 kiloa molemmilta puolilta: vaaka pysyy suorassa, ja pussi painaa 5 kiloa.', scene: bagScene(3, 5) },
      { say: 'Pussi ja 4 kiloa on yhtä paljon kuin 11 kiloa. Otetaan 4 kiloa molemmilta puolilta. Pussiin jää 7 kiloa. Tarkistus: 7 plus 4 on 11.', scene: bagScene(4, 7) },
      { say: 'Saman voi kirjoittaa: laatikko plus 3 on 8. Laatikko on puuttuva luku. Vähennä kolme molemmilta puolilta.', scene: card('□ + 3 = 8', '□ + 3 − 3 = 8 − 3', '□ = 5') },
    ],
    item: cases({
      add: (r) => {
        const a = r.int(2, 9), x = r.int(2, 12);
        const w: Record<number, string> = { [a + x + a]: `Lisäsit ${a}. Pussista pitää ottaa ${a} pois: ${a + x} − ${a}.` };
        if (a !== x) w[a] = `${a} on jo laatikon vieressä. Paljonko puuttuu luvusta ${a} lukuun ${a + x}?`;
        return wq(ask(`□ + ${a} = ${a + x}`, x, '', `${a + x} − ${a} = ${x}. Tarkistus: ${x} + ${a} = ${a + x}.`), `Ota ${a} pois molemmilta puolilta: ${a + x} − ${a}.`, w);
      },
      bag: (r) => {
        const a = r.int(2, 6), x = r.int(2, 9);
        const w: Record<number, string> = { [a + x + a]: `Paino ${a} kg pitää ottaa pois, ei lisätä.` };
        if (a + x !== x) w[a + x] = `${a + x} kg on koko oikea puoli. Pussin vieressä on vielä ${a} kg.`;
        return wq(ask('Vaaka on tasapainossa. Montako kiloa pussi painaa?', x, 'kg', `Oikealla ${a + x} kg, vasemmalla ${a} kg ja pussi. Pussi on ${a + x} − ${a} = ${x} kg.`, balanceArt(['x', String(a)], [String(a + x)])), `Ota ${a} kg pois molemmilta puolilta.`, w);
      },
      sub: (r) => {
        const a = r.int(2, 9), c = r.int(2, 10);
        const w: Record<number, string> = {};
        if (c - a > 0 && c - a !== a + c) w[c - a] = `Laatikosta otettiin ${a}, joten alussa oli enemmän kuin ${c}. Lisää ${a}.`;
        if (c !== a + c) w[c] = `${c} on se, mitä jäi. Alussa oli ${a} enemmän.`;
        return wq(ask(`□ − ${a} = ${c}`, a + c, '', `Laatikosta otettiin ${a} ja jäi ${c}. Alussa oli ${c} + ${a} = ${a + c}.`), `Lisää ${a} molemmille puolille: ${c} + ${a}.`, w);
      },
      times: (r) => {
        const a = r.int(2, 5), x = r.int(2, 6);
        const w: Record<number, string> = {};
        if (a * x - a !== x) w[a * x - a] = `Tässä vähennettiin. ${a} × □ on kertolasku: jaa ${a * x} luvulla ${a}.`;
        return wq(ask(`${a} × □ = ${a * x}`, x, '', `${a} kertaa mikä on ${a * x}? ${a * x} : ${a} = ${x}.`), `Jaa ${a * x} ${a} yhtä suureen osaan.`, w);
      },
      moves: (r) => {
        const a = r.int(2, 6), x = r.int(2, 8), c = r.int(1, 4);
        const all: [string, number, string][] = [
          [`Ota ${a} kg molemmilta`, 0, 'Sama määrä pois molemmilta: puolet pysyvät yhtä suurina.'],
          [`Lisää ${c} kg molemmille`, 0, 'Sama määrä lisää molemmille: vaaka pysyy suorassa.'],
          [`Ota ${a} kg vain vasemmalta`, 1, 'Vain toinen puoli kevenee: vaaka kallistuu.'],
          [`Lisää ${c} kg vain oikealle`, 1, 'Vain toinen puoli painavammaksi: vaaka kallistuu.'],
          [`Ota ${a} kg vasemmalta, ${a + 1} kg oikealta`, 1, 'Eri määrät pois: puolet eivät ole enää yhtä suuret.'],
        ];
        const pick = r.shuffle(all).slice(0, 4);
        return {
          say: `Vaaka on suorassa: pussi ja ${a} kg vasemmalla, ${a + x} kg oikealla. Lajittele siirrot.`,
          scene: paint(balanceArt(['x', String(a)], [String(a + x)])),
          task: { kind: 'sort' as const, items: pick.map((q) => t(q[0])), cats: [{ label: 'Pysyy suorassa' }, { label: 'Kallistuu' }], answer: pick.map((q) => q[1]), why: pick.map((q) => q[2]) },
          hint: 'Vaaka pysyy suorassa vain, jos molemmille puolille tehdään sama asia.',
          explain: 'Yhtälö pysyy totena, kun molemmille puolille tehdään sama muutos.',
        };
      },
    }, (r) => {
      const a = r.int(4, 9), x = r.int(3, 15);
      const w: Record<number, string> = { [a + x + a]: `Lisäsit ${a}. Hän lisäsi jo ${a}, joten ota se pois.` };
      if (a !== x) w[a] = `${a} on se, mitä hän lisäsi. Mitä lukua hän ajatteli?`;
      return wq(ask(`Loikka ajattelee lukua. Kun hän lisää siihen ${a}, hän saa ${a + x}. Mitä lukua hän ajatteli?`, x, '', `□ + ${a} = ${a + x}, joten □ = ${x}.`), `Kirjoita □ + ${a} = ${a + x} ja ota ${a} pois molemmilta puolilta.`, w);
    }),
  },
  {
    id: 'M-ALG-05', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Tasapainolauta', icon: '⚖️',
    intro: 'Yhtä suuri -merkki ei tarkoita "vastaus tulee tähän". Se tarkoittaa: molemmilla puolilla on yhtä paljon.',
    reward: 'Ymmärrät yhtäsuuruusmerkin kuin vaaka!',
    demo: () => [
      { say: 'Vasemmalla 8 ja 4 eli 12. Oikealla laatikko ja 5. Moni kirjoittaa laatikkoon 12, mutta silloin oikealla on 17, ja vaaka kallistuu. Kokeillaan pienestä alkaen: kun laatikossa on 7, oikealla on 12, ja vaaka on suorassa.', scene: equalsScene(8, 4, 5) },
      { say: 'Toinen vaaka: 6 ja 3 on 9. Oikealla on jo 4. Laatikkoon tarvitaan 5, jotta molemmilla puolilla on 9.', scene: equalsScene(6, 3, 4) },
    ],
    item: cases({
      both: (r) => {
        const a = r.int(3, 9), b = r.int(2, 8), c = r.int(1, a + b - 1);
        const w: Record<number, string> = { [a + b]: `${a + b} on vasen puoli. Oikealla on jo ${c}, joten laatikkoon tarvitaan vähemmän.` };
        if (a + b + c !== a + b - c) w[a + b + c] = 'Tässä laskettiin kaikki luvut yhteen. = ei ole "vastaus tähän".';
        return wq(ask(`${a} + ${b} = □ + ${c}`, a + b - c, '', `Vasen puoli on ${a + b}. Oikealla ${c} + □ = ${a + b}, joten □ = ${a + b - c}.`), 'Laske ensin, paljonko vasemmalla puolella on.', w);
      },
      truth: (r) => {
        const a = r.int(2, 9), b = r.int(2, 9), c = r.int(1, a + b - 1), ok = r.chance(0.5);
        const d = ok ? a + b - c : a + b - c + r.pick([1, 2, -1].filter((k) => a + b - c + k > 0));
        return {
          say: `Onko tämä totta? ${a} + ${b} = ${c} + ${d}`,
          task: YESNO(ok, `Molemmat puolet ovat ${a + b}.`, `Vasen on ${a + b}, oikea ${c + d}.`),
          hint: 'Laske kumpikin puoli erikseen ja vertaa.',
          explain: ok ? `Vasen ${a + b}, oikea ${c + d}: yhtä suuret.` : `Vasen ${a + b}, oikea ${c + d}: eivät ole yhtä suuret.`,
        };
      },
      balance: (r) => {
        const a = r.int(2, 7), b = r.int(2, 7), c = r.int(1, a + b - 1);
        const w: Record<number, string> = { [a + b]: `Silloin oikealla olisi ${a + b + c} kg. Oikealla on jo ${c} kg.` };
        return wq(ask('Mikä paino laitetaan pussin paikalle, jotta vaaka on tasapainossa?', a + b - c, 'kg', `Vasemmalla ${a + b} kg. Oikealla jo ${c} kg, joten puuttuu ${a + b - c} kg.`, balanceArt([String(a), String(b)], [String(c), 'x'])), `Vasemmalla ${a} + ${b} kg. Paljonko oikealta puuttuu?`, w);
      },
      level: (r) => {
        const rows: { a: number; b: number; c: number }[] = [];
        while (rows.length < 3) {
          const q = { a: r.int(3, 9), b: r.int(2, 8), c: 0 }; q.c = r.int(1, q.a + q.b - 1);
          if (!rows.some((p) => p.a + p.b - p.c === q.a + q.b - q.c)) rows.push(q);
        }
        const d0 = rows[0]!, xs = rows.map((q) => q.a + q.b - q.c), decoy = d0.a + d0.b + (xs.includes(d0.a + d0.b) ? d0.c : 0);
        const toks = r.shuffle([...xs.map(String), String(decoy)]).map((x, i) => ({ id: `t${i}`, text: x }));
        const idOf = (x: string) => toks.find((q) => q.text === x)!.id;
        return {
          say: 'Tasapainota laudat: vedä laatikkoon luku, jolla molemmat puolet ovat yhtä suuret. Yksi kortti jää yli.',
          task: {
            kind: 'place',
            slots: rows.map((q, i) => ({ id: `s${i}`, text: `${q.a} + ${q.b} = □ + ${q.c}` })),
            tokens: toks,
            answer: Object.fromEntries(rows.map((q, i) => [`s${i}`, idOf(String(xs[i]))])),
            why: Object.fromEntries(rows.map((q, i) => [`s${i}`, `Vasen ${q.a + q.b}. ${xs[i]} + ${q.c} = ${q.a + q.b}.`])),
          } as Task,
          hint: 'Laske vasen puoli. Mikä luku ja oikean puolen luku tekevät yhtä paljon?',
          explain: rows.map((q, i) => `${q.a} + ${q.b} = ${xs[i]} + ${q.c}`).join(', ') + `. ${decoy} on "vastaus tähän" -virhe.`,
        };
      },
    }, (r) => {
      const a = r.int(26, 49), b = r.int(21, 39), up = Math.ceil(a / 10) * 10 === a ? a + 10 : Math.ceil(a / 10) * 10;
      const w: Record<number, string> = { [a + b]: `${a + b} on vasen puoli. Oikealla on jo ${up}.` };
      if (b + (up - a) !== a + b - up) w[b + (up - a)] = `${a} kasvoi, joten toisen luvun pitää pienentyä, ei kasvaa.`;
      return wq(ask(`${a} + ${b} = ${up} + □`, a + b - up, '', `${a} kasvoi ${up - a}:lla, kun siitä tuli ${up}. Toisen puolen pitää pienentyä yhtä paljon: ${b} − ${up - a} = ${a + b - up}.`), 'Mieti, paljonko ensimmäinen luku muuttui. Laskematta koko summaa!', w);
    }),
  },
  {
    id: 'M-ALG-06', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Yhtälön tunnistaja', icon: '🔍',
    intro: 'Yhtälössä on yhtä suuri -merkki ja tuntematon, jota usein merkitään x:llä.',
    reward: 'Tunnistat yhtälön ja sen ratkaisun!',
    demo: () => [
      { say: 'Rakennetaan vaaka ja kirjoitetaan sama yhtälönä. Jokainen pussi on x, kolmen kilon paino on plus 3, ja suora vaaka on yhtä suuri -merkki. Kaksi pussia ja 3 kiloa painavat 11 kiloa: x + x + 3 = 11. Kokeillaan x = 5: 5 + 5 + 3 on 13, liikaa. Kokeillaan x = 4: 4 + 4 + 3 on 11. Ratkaisu on x = 4.', scene: buildEqScene(2, 3, 4) },
      { say: 'Yksi pussi ja 4 kiloa painavat 9 kiloa: x + 4 = 9. Siinä on yhtä suuri -merkki ja tuntematon x, joten se on yhtälö. Ratkaisu on x = 5, koska 5 + 4 = 9.', scene: buildEqScene(1, 4, 5) },
    ],
    item: cases({
      which: (r) => {
        const a = r.int(2, 8), x = r.int(2, 9);
        return {
          say: 'Mikä näistä on yhtälö, jossa on tuntematon?',
          task: choose(r, { big: `x + ${a} = ${a + x}` }, [{ big: `x + ${a}` }, { big: `${x} + ${a} = ${a + x}` }], ['Tästä puuttuu yhtä suuri -merkki ja toinen puoli.', 'Tässä ei ole tuntematonta.']),
          hint: 'Yhtälössä on kaksi asiaa: yhtä suuri -merkki ja tuntematon x.',
          explain: `x + ${a} = ${a + x}: kaksi yhtä suurta puolta ja tuntematon x.`,
        };
      },
      fromBalance: (r) => {
        const a = r.int(1, 5), x = r.int(2, 6), n = r.int(2, 3);
        const bags = Array(n).fill('x');
        const lhs = `${Array(n).fill('x').join(' + ')} + ${a}`;
        return {
          say: 'Mikä yhtälö kuvaa vaakaa?',
          scene: paint(balanceArt([...bags, String(a)], [String(n * x + a)])),
          task: choose(r, { big: `${lhs} = ${n * x + a}` }, [{ big: `x + ${a} = ${n * x + a}` }, { big: `${lhs} = ${n * x}` }], ['Pusseja on useampi kuin yksi.', 'Oikealla on koko paino.']),
          hint: 'Kirjoita jokainen pussi x:nä, sitten paino, sitten =, sitten oikea puoli.',
          explain: `Vasemmalla ${n} pussia ja ${a} kg, oikealla ${n * x + a} kg.`,
        };
      },
      spot: (r) => {
        const a = r.int(2, 8), x = r.int(2, 9), p = r.int(2, 9), q = r.int(2, 9), c = r.int(1, 5);
        const all: [string, number, string][] = [
          [`x + ${a} = ${a + x}`, 0, 'Yhtä suuri -merkki ja tuntematon x: yhtälö.'],
          [`${x + c} = x + ${c}`, 0, 'Tuntematon voi olla myös oikealla puolella. Tämä on yhtälö.'],
          [`x − ${c} = ${x}`, 0, 'Myös vähennyslaskussa voi olla tuntematon: yhtälö.'],
          [`x + ${a}`, 1, 'Ei yhtä suuri -merkkiä eikä toista puolta: lauseke, ei yhtälö.'],
          [`${p} + ${q} = ${p + q}`, 1, 'Tässä ei ole tuntematonta: pelkkä laskutoimitus.'],
        ];
        const pick = r.shuffle(all).slice(0, 4);
        return {
          say: 'Lajittele: onko tämä yhtälö, jossa on tuntematon?',
          task: { kind: 'sort' as const, items: pick.map((z) => ({ big: z[0] })), cats: [{ label: 'Yhtälö' }, { label: 'Ei yhtälö' }], answer: pick.map((z) => z[1]), why: pick.map((z) => z[2]) },
          hint: 'Etsi kaksi asiaa: =-merkki ja x.',
          explain: 'Yhtälössä on yhtä suuri -merkki ja tuntematon. Ilman =-merkkiä se on lauseke, ilman x:ää pelkkä lasku.',
        };
      },
      check: (r) => {
        const a = r.int(2, 9), x = r.int(2, 9), ok = r.chance(0.5), guess = ok ? x : x + r.pick([1, 2]);
        return {
          say: `Onko x = ${guess} yhtälön x + ${a} = ${x + a} ratkaisu?`,
          task: YESNO(ok, `Kokeile: ${guess} + ${a} = ${guess + a}.`, `Kokeile: ${guess} + ${a} = ${guess + a}, ei ${x + a}.`),
          hint: 'Sijoita luku x:n paikalle ja laske.',
          explain: `${guess} + ${a} = ${guess + a}. ${ok ? 'Puolet ovat yhtä suuret: ratkaisu.' : `Pitäisi olla ${x + a}: ei ratkaisu.`}`,
        };
      },
    }, (r) => {
      const n = r.int(2, 4), a = r.int(1, 5), x = r.int(2, 5);
      return {
        say: `${n} samanlaista kalaa ja ${a} kg jäätä painavat yhteensä ${n * x + a} kg. Mikä yhtälö sopii, kun yksi kala painaa x kg?`,
        task: choose(r, { big: `${n}x + ${a} = ${n * x + a}` }, [{ big: `x + ${n} + ${a} = ${n * x + a}` }, { big: `${n} + ${a}x = ${n * x + a}` }], [`Kaloja on ${n}, joten x otetaan ${n} kertaa.`, 'Kalat ja jää ovat menneet väärin päin.']),
        hint: `Jokainen kala on x. ${n} kalaa on ${n} kertaa x eli ${n}x.`,
        explain: `${n} kalaa: ${n}x. Lisäksi jää ${a} kg. Yhteensä ${n * x + a}: ${n}x + ${a} = ${n * x + a}.`,
      };
    }),
  },

  // ============================================================ asema: measuring and data
  {
    id: 'SCI-ENV-TOOL-01', stop: 'Välinevaja', icon: '🔧', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    intro: 'Tutkimusaseman vajassa on mittausvälineitä. Jokaisella on oma tehtävänsä.',
    reward: 'Osaat valita sopivan mittausvälineen ja lukea sen lukeman kuvasta. Oikeaa välinettä käytetään aikuisen kanssa.',
    demo: () => [
      { say: 'Katso: jokainen asia saa oman välineensä. Pituus viivottimella, massa vaa’alla, lämpötila lämpömittarilla ja aika sekuntikellolla.', scene: matchToolScene([['lammen vesi', '🌡️ lämpömittari', 'lämpötila'], ['kaarnavene', '📏 viivotin', 'pituus'], ['kivi', '⚖️ vaaka', 'massa'], ['kellunta', '⏱️ sekuntikello', 'aika']]) },
      { say: 'Viivottimen reunassa on tyhjä kohta ennen nollaa. Jos keppi alkaa reunasta, lukema on väärä. Siirrä pää nollaan ja lue toinen pää.', scene: zeroScene(7) },
      { say: 'Tyhjä vaaka näyttää 50 g. Silloin kivikin näyttää 50 g liikaa. Nollaa vaaka ensin, sitten punnitse.', scene: tareScene(300, 50) },
    ],
    item: cases({
      tool: (r) => {
        const why: Record<string, string> = {
          '🌡️ lämpömittari': 'Lämpömittari kertoo vain, kuinka lämmintä on.',
          '📏 viivotin': 'Viivotin mittaa pituutta.',
          '⚖️ vaaka': 'Vaaka kertoo massan eli kuinka painava jokin on.',
          '⏱️ sekuntikello': 'Sekuntikello mittaa aikaa.',
        };
        const [q, a, w1, w2, h] = r.pick([
          ['Millä mittaat, kuinka lämmintä lammen vesi on?', '🌡️ lämpömittari', '📏 viivotin', '⚖️ vaaka', 'Lämpöä mitataan asteina.'],
          ['Millä mittaat, kuinka pitkä kaarnavene on?', '📏 viivotin', '🌡️ lämpömittari', '⏱️ sekuntikello', 'Pituutta mitataan senttimetreinä.'],
          ['Millä mittaat, kuinka painava kivi on?', '⚖️ vaaka', '📏 viivotin', '🌡️ lämpömittari', 'Painoa eli massaa mitataan grammoina tai kilogrammoina.'],
          ['Millä mittaat, kuinka kauan vene kelluu?', '⏱️ sekuntikello', '⚖️ vaaka', '📏 viivotin', 'Kestoa mitataan sekunteina.'],
          ['Millä mittaat, kuinka paljon vettä mahtuu ämpäriin?', '🥛 mitta-astia', '📏 viivotin', '🌡️ lämpömittari', 'Vesimäärää mitataan litroina tai desilitroina.'],
        ] as string[][]);
        return { say: q!, task: choose(r, t(a!), [t(w1!), t(w2!)], [why[w1!]!, why[w2!]!]), hint: `Mieti ensin, mikä suure on kyseessä. ${h}`, explain: `${a!.slice(3)[0]!.toUpperCase() + a!.slice(4)} mittaa juuri tätä.` };
      },
      use: (r) => {
        const [q, a, w1, w2, e, y1, y2, h] = r.pick([
          ['Miten viivotinta käytetään oikein?', 'Esineen pää nollan kohdalle', 'Esineen pää viivottimen reunaan', 'Aloitetaan mistä vain', 'Mittaus alkaa nollasta. Reunassa ennen nollaa on usein tyhjä kohta.', 'Reunan ja nollan välissä on tyhjä kohta, joka sotkee lukeman.', 'Jos alku on muualla kuin nollassa, toinen pää ei kerro pituutta.', 'Mistä luvusta mittaus alkaa?'],
          ['Miten lämpömittaria käytetään oikein?', 'Odotetaan, että lukema ei enää muutu', 'Luetaan heti, kun mittari on vedessä', 'Pidetään mittaria lämpimässä kädessä', 'Mittari tarvitsee hetken lämmetäkseen tai jäähtyäkseen.', 'Mittari ei ole vielä ehtinyt veden lämpöiseksi.', 'Silloin mittari näyttää käden lämmön, ei veden.', 'Mittari muuttuu hitaasti.'],
          ['Mitä tehdään ennen punnitsemista?', 'Tarkistetaan, että tyhjä vaaka näyttää nollaa', 'Laitetaan vaa’alle kaksi asiaa kerralla', 'Painetaan vaakaa kädellä', 'Jos tyhjä vaaka ei näytä nollaa, kaikki lukemat ovat väärin.', 'Silloin saat kahden asian yhteismassan.', 'Käden paino lisätään lukemaan.', 'Mitä tyhjän vaa’an pitäisi näyttää?'],
        ] as string[][]);
        return { say: q!, task: choose(r, t(a!), [t(w1!), t(w2!)], [y1!, y2!], 1), hint: h!, explain: e! };
      },
      read: (r) => {
        const a = r.int(1, 4), len = r.int(3, 8), b = a + len;
        const whyAt: Record<number, string> = { [b]: `${b} on kepin loppukohta. Keppi alkaa kohdasta ${a}, ei nollasta.` };
        if (len + 1 !== b) whyAt[len + 1] = 'Laskit viivat. Laske viivojen välit.';
        return wq(ask('Keppi ei ala nollasta. Kuinka monta senttimetriä keppi on?', len, 'cm', `Loppu ${b} − alku ${a} = ${len} cm.`, rulerArt(12, a, b)), 'Pituus = loppukohta − alkukohta.', whyAt);
      },
      tare: (r) => {
        const off = r.pick([20, 30, 50, 100]), g = r.pick([150, 200, 250, 300, 400]);
        return wq(ask(`Tyhjä vaaka näyttää ${off} g. Kun kivi laitetaan vaa’alle, se näyttää ${g + off} g. Kuinka painava kivi oikeasti on?`, g, 'g', `Vaaka näyttää ${off} g liikaa: ${g + off} − ${off} = ${g} g.`), 'Vähennä se, minkä tyhjä vaaka jo näytti.', { [g + off]: 'Tuo on vaa’an lukema. Tyhjä vaaka näytti jo jotain, joten vähennä se.', [g + 2 * off]: 'Lisäsit virheen. Se pitää vähentää.' });
      },
      pick: (r) => {
        const all: [string, number][] = [['vene', 0], ['lankapätkä', 0], ['simpukan leveys', 0], ['kivi', 1], ['omena', 1], ['kirje', 1], ['vesi', 2], ['ilma varjossa', 2], ['hiekka auringossa', 2]];
        const pick = r.shuffle(all).slice(0, 5);
        const cats = [{ label: '📏 pituus' }, { label: '⚖️ massa' }, { label: '🌡️ lämpötila' }];
        return { say: 'Mitä näistä mitataan viivottimella, mitä vaa’alla ja mitä lämpömittarilla?', task: { kind: 'sort' as const, items: pick.map((p) => t(p[0])), cats, answer: pick.map((p) => p[1]), why: pick.map((p) => ['Tästä halutaan tietää, kuinka pitkä se on.', 'Tästä halutaan tietää, kuinka painava se on.', 'Tästä halutaan tietää, kuinka lämmin se on.'][p[1]]!) }, hint: 'Kysy: pituus, paino vai lämpö?', explain: 'Pituus viivottimella, massa vaa’alla ja lämpötila lämpömittarilla.' };
      },
    }, (r) => {
      const plant = r.pick(['auringonkukka', 'herne', 'pavunverso']);
      return {
        say: `Haluat tietää, paljonko ${plant} kasvaa viikossa. Mitä teet?`,
        task: choose(r, t('Mittaan sen nyt ja uudelleen viikon päästä'), [t('Katson sitä tarkasti kerran'), t('Punnitsen sen kerran')], ['Yhdellä katsomisella ei näe muutosta.', 'Kasvu näkyy pituutena, ja tarvitaan kaksi mittausta.'], 1),
        hint: 'Muutos nähdään vertaamalla kahta lukemaa.',
        explain: 'Muutos saadaan vertaamalla kahta mittausta: kasvu = myöhempi pituus − aiempi pituus.',
      };
    }),
  },
  {
    id: 'SCI-ENV-MEAS-01', stop: 'Tarkka mittaaja', icon: '🎯', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    intro: 'Hyvä tutkija valitsee välineen ja yksikön, joka sopii mitattavaan asiaan.',
    reward: 'Luet mittauksen tarkasti kuvasta: nollakohta ja asteikko ovat hallussa!',
    demo: () => [
      { say: 'Sama asia voidaan kertoa monella yksiköllä. Valitse yksikkö, jolla luku on kätevä: ei pitkää desimaalijonoa eikä monta nollaa.', scene: unitFitScene([['🐜 muurahainen', [['0,005 m', 'liian pieni luku'], ['5 mm', 'kätevä luku']], 'millimetrit sopivat pieneen.'], ['🐸 loikka', [['1200 mm', 'liian iso luku'], ['1,2 m', 'kätevä luku']], 'metrit sopivat pihan matkoihin.'], ['🛶 matka saarelle', [['3000 m', 'paljon nollia'], ['3 km', 'kätevä luku']], 'kilometrit sopivat pitkiin matkoihin.']]) },
      { say: 'Mittaa sama asia useamman kerran. Jos yksi tulos poikkeaa paljon, se on luultavasti virhe. Mitataan uudelleen.', scene: repeatScene(12, 19) },
      { say: 'Lämpömittarissa numerot ovat vain joka viidennellä viivalla. Etsi numero ja laske pienet välit.', scene: readScaleScene(13) },
    ],
    item: cases({
      toolUnit: (r) => {
        const [q, a, w1, w2, y1, y2] = r.pick([
          ['Mitataan pituushyppyä pihalla. Mikä sopii?', 'mittanauha, metreinä', 'viivotin, millimetreinä', 'vaaka, kilogrammoina', 'Viivotin on liian lyhyt, ja millimetreinä luku olisi valtava.', 'Vaaka mittaa massaa, ei pituutta.'],
          ['Mitataan simpukan leveyttä. Mikä sopii?', 'viivotin, senttimetreinä', 'mittanauha, kilometreinä', 'kello, minuutteina', 'Kilometri on aivan liian suuri yksikkö simpukalle.', 'Kello mittaa aikaa, ei leveyttä.'],
          ['Punnitaan kirje. Mikä sopii?', 'keittiövaaka, grammoina', 'henkilövaaka, tonneina', 'viivotin, senttimetreinä', 'Kevyt kirje ei edes liikuta henkilövaakaa, ja tonni on valtava.', 'Viivotin mittaa pituutta, ei massaa.'],
          ['Mitataan, kauanko lumipallo sulaa. Mikä sopii?', 'kello, minuutteina', 'lämpömittari, asteina', 'vaaka, grammoina', 'Lämpömittari kertoo lämmön, ei aikaa.', 'Vaaka kertoo massan, ei kestoa.'],
        ] as string[][]);
        return { say: q!, task: choose(r, t(a!), [t(w1!), t(w2!)], [y1!, y2!], 1), hint: 'Mitä mitataan: pituutta, massaa vai aikaa? Kuinka iso asia on?', explain: `Sopiva: ${a}.` };
      },
      unit: (r) => {
        const [q, a, w1, w2, y1, y2] = r.pick([
          ['Missä yksikössä muurahaisen pituus kannattaa ilmoittaa?', 'mm', 'm', 'km', 'Metreinä muurahainen olisi 0,005 m. Luku on hankala.', 'Kilometri on aivan liian iso yksikkö.'],
          ['Missä yksikössä luokkahuoneen pituus kannattaa ilmoittaa?', 'm', 'mm', 'km', 'Millimetreinä luku olisi tuhansia.', 'Kilometreinä luku olisi pieni desimaaliluku.'],
          ['Missä yksikössä saarten välinen matka kannattaa ilmoittaa?', 'km', 'cm', 'mm', 'Senttimetreinä luvussa olisi valtavasti nollia.', 'Millimetreinä luku olisi vielä isompi.'],
          ['Missä yksikössä marjan massa kannattaa ilmoittaa?', 'g', 'kg', 't', 'Kilogrammoina marja olisi 0,002 kg. Luku on hankala.', 'Tonni on auton luokkaa.'],
          ['Missä yksikössä veneen massa kannattaa ilmoittaa?', 'kg', 'mg', 'g', 'Milligramma on hiekanjyvän luokkaa.', 'Grammoina luvussa olisi monta nollaa.'],
        ] as string[][]);
        return { say: q!, task: choose(r, { big: a! }, [{ big: w1! }, { big: w2! }], [y1!, y2!]), hint: 'Valitse yksikkö, jolla luku ei ole valtava eikä pieni desimaaliluku.', explain: `${a} sopii: luku ei ole liian iso eikä liian pieni.` };
      },
      repeat: (r) => {
        const v = r.int(8, 20), odd = v + r.pick([6, 7, 9, -5]);
        return {
          say: `Aava mittasi saman kiven kolme kertaa. Mitä kannattaa tehdä?`,
          scene: paint(table(['Mittaus', '1.', '2.', '3.'], [['cm', v, odd, v]])),
          task: choose(r, t(`Mitata uudelleen, koska ${odd} poikkeaa muista`), [t('Valita suurin lukema'), t('Laskea lukemat yhteen')], ['Suurin ei ole oikein vain siksi, että se on suurin.', 'Summa ei kerro kiven pituutta.'], 1),
          hint: 'Kaksi lukemaa on samoja. Mikä lukema ei sovi joukkoon?',
          explain: `Kaksi mittausta antoi ${v} cm. ${odd} cm on luultavasti mittausvirhe, joten mitataan uudelleen.`,
        };
      },
      scale: (r) => {
        const v = r.pick([1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19]), base = Math.floor(v / 5) * 5;
        const whyAt: Record<number, string> = { [base]: `${base} on lähin numero. Laske vielä pienet välit sen yläpuolelta.` };
        if (base + 5 !== v && base + 5 <= 20) whyAt[base + 5] = `Punainen pää ei ylety numeroon ${base + 5} asti.`;
        const dbl = base + 2 * (v - base);
        if (dbl !== v && whyAt[dbl] === undefined) whyAt[dbl] = 'Jokainen pieni väli on yksi aste, ei kaksi.';
        return wq(ask('Mitä lämpömittari näyttää? Vastaa asteina.', v, '°C', `Lähin numero alapuolella on ${base}. Siitä ${v - base} pientä väliä ylöspäin: ${v} astetta.`, thermoArt(v, 0, 20)), 'Etsi lähin numero punaisen pään alapuolelta ja laske pienet välit.', whyAt);
      },
      fit: (r) => {
        const sets: [string, string][][] = [
          [['🐜 muurahaisen pituus', 'mm'], ['🏫 luokan pituus', 'm'], ['🛶 matka naapurisaarelle', 'km']],
          [['🫐 mustikan massa', 'g'], ['🛶 veneen massa', 'kg'], ['🐋 valaan massa', 't']],
        ];
        const set = r.pick(sets), decoy = set[0]![1] === 'mm' ? 'kg' : 'cm';
        const toks = r.shuffle([...set.map((x) => x[1]), decoy]).map((x, i) => ({ id: `u${i}`, text: x }));
        const idOf = (x: string) => toks.find((k) => k.text === x)!.id;
        return {
          say: 'Vedä jokaiselle asialle sopivin yksikkö. Yksi yksikkö jää yli.',
          task: { kind: 'place', slots: set.map((x, i) => ({ id: `s${i}`, text: x[0] })), tokens: toks, answer: Object.fromEntries(set.map((x, i) => [`s${i}`, idOf(x[1])])), why: Object.fromEntries(set.map((x, i) => [`s${i}`, `${x[0].slice(3)}: ${x[1]} antaa kätevän luvun.`])) } as Task,
          hint: 'Pieni asia pienellä yksiköllä, iso asia isolla.',
          explain: set.map((x) => `${x[0]}: ${x[1]}`).join(' · '),
        };
      },
    }, (r) => {
      const what = r.pick([['kumpi kasvi kasvaa nopeammin, aurinkoinen vai varjoinen paikka', 'Kasvien laji, vesi ja mittaustapa'], ['kumpi vene kelluu pidempään, kaarnavene vai paperivene', 'Vesi, aallot ja ajanottotapa']]);
      return {
        say: `Tutkitaan, ${what[0]}. Mitä pitää pitää samana, jotta vertailu on reilu?`,
        task: choose(r, t(what[1]!), [t('Ei mitään, kunhan mitataan'), t('Vain se, mitä tutkitaan')], ['Jos muutkin asiat muuttuvat, ei tiedetä, mikä tuloksen aiheutti.', 'Tutkittava asia on juuri se, jota muutetaan.'], 1),
        hint: 'Muutetaan vain yhtä asiaa kerrallaan.',
        explain: 'Reilussa kokeessa muutetaan vain yhtä asiaa kerrallaan. Kaikki muu pidetään samana.',
      };
    }),
  },
  {
    id: 'M-DATA-01', stop: 'Havaintolista', icon: '✏️', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    intro: 'Tutkija kerää tietoa sovitusta aiheesta. Nopea tapa kirjata on viivamerkintä: neljä pystyviivaa ja viides vinoon.',
    reward: 'Osaat kerätä ja kirjata havaintoja!',
    demo: () => [
      { say: 'Katso: jokainen eläin saa yhden viivan omalle rivilleen. Viides viiva vedetään vinoon. Lopuksi lasketaan viisiryhmät: 5, 10 ja loput.', scene: tallyScene([['🦆', 'sorsa'], ['🐦', 'lokki'], ['🐟', 'kala']], [0, 1, 1, 0, 2, 1, 1, 0, 1, 2, 1, 1, 0, 1, 1, 2, 0]) },
      { say: 'Ensin sovitaan kysymys. Kysytään luokalta: mikä on lempihedelmäsi? Jokainen vastaus on yksi viiva.', scene: tallyScene([['🍎', 'omena'], ['🍌', 'banaani'], ['🍓', 'mansikka']], [2, 0, 2, 1, 2, 2, 0, 2, 1, 2, 0], 'Mikä on lempihedelmäsi?') },
    ],
    item: cases({
      tally: (r) => {
        const n = r.int(6, 14);
        return {
          say: 'Montako lokkia nähtiin, kun merkinnät ovat tällaiset?',
          scene: paint(tallyArt(n, 52)),
          task: choose(r, { big: String(n) }, [{ big: String(n + 1) }, { big: String(n - 1) }], ['Yksi liikaa. Vinoviiva on ryhmän viides viiva, ei kuudes.', 'Yksi liian vähän. Myös vinoviiva on yksi havainto.']),
          hint: 'Vinoviivalla suljettu ryhmä on viisi.',
          explain: `${Math.floor(n / 5)} viisiryhmää ja ${n % 5} viivaa: ${n}.`,
        };
      },
      log: (r) => {
        const z = zoo(r, 2), a = r.int(4, 9), b = r.int(3, 8), seq = r.shuffle([...Array(a).fill(0), ...Array(b).fill(1)] as number[]);
        const whyAt: Record<number, string> = { [a + b]: 'Laskit kaikki eläimet. Merkitse vain ' + z[0]![2] + '.' };
        if (b !== a) whyAt[b] = `${b} on ${z[1]![2]} määrä.`;
        return wq(ask(`Tutkija näki nämä eläimet tässä järjestyksessä. Montako ${z[0]![2]} hän merkitsi?`, a, '', `Jokaisesta havainnosta ${z[0]![0]} yksi viiva: ${a} viivaa.`, `<div style="font-size:30px;letter-spacing:4px;text-align:center">${seq.map((i) => z[i]![0]).join('')}</div>`), `Käy rivi läpi ja tee viiva aina, kun näet ${z[0]![0]}.`, whyAt);
      },
      sort: (r) => {
        let ns = distinct(r, 4, 3, 16);
        if (!ns.some((x) => x < 10)) ns[0] = 7; if (!ns.some((x) => x >= 10)) ns[0] = 12;
        ns = ns.filter((x, i) => ns.indexOf(x) === i);
        return {
          say: 'Lajittele merkinnät: alle 10 vai vähintään 10?',
          task: { kind: 'sort' as const, items: ns.map((n) => ({ art: tallyArt(n, 34), speak: `${n} viivaa` })), cats: [{ label: 'alle 10' }, { label: '10 tai yli' }], answer: ns.map((n) => (n < 10 ? 0 : 1)), why: ns.map((n) => `${Math.floor(n / 5)} viisiryhmää ja ${n % 5} viivaa = ${n}.`) },
          hint: 'Kaksi täyttä viisiryhmää on jo 10.',
          explain: 'Kaksi viisiryhmää tekee 10. Jos niitä on vähemmän, määrä on alle 10.',
        };
      },
      question: (r) => {
        const [aihe, a, w1, w2] = r.pick([
          ['luokan lempihedelmä', 'Mikä on lempihedelmäsi?', 'Pidätkö omenasta?', 'Montako hedelmää söit tänään?'],
          ['miten oppilaat tulevat kouluun', 'Miten tulit tänään kouluun?', 'Onko sinulla pyörä?', 'Kuinka kaukana asut?'],
          ['mikä eläin on luokan suosikki', 'Mikä on lempieläimesi?', 'Onko sinulla lemmikkiä?', 'Pelkäätkö hämähäkkejä?'],
        ] as string[][]);
        return { say: `Haluamme selvittää, ${aihe}. Mikä kysymys sopii?`, task: choose(r, t(a!), [t(w1!), t(w2!)], ['Tämä kertoo vain yhdestä vaihtoehdosta.', 'Tämä kysyy eri asiaa.'], 1), hint: 'Hyvään kysymykseen jokainen voi vastata, ja vastaus kertoo juuri sen, mitä halutaan tietää.', explain: `"${a}" kysyy juuri sitä, mitä halutaan tietää.` };
      },
      most: (r) => {
        const z = zoo(r), ns = distinct(r, 3, 3, 12);
        const best = ns.indexOf(Math.max(...ns));
        return {
          say: 'Mitä eläintä nähtiin eniten?',
          scene: paint(table(['Eläin', 'Merkinnät'], z.map((a, i) => [`${a[0]} ${a[1]}`, tallyArt(ns[i]!, 30)]))),
          task: choose(r, t(`${z[best]![0]} ${z[best]![1]}`), z.filter((_, i) => i !== best).map((a) => t(`${a[0]} ${a[1]}`)), z.map((a, i) => `${a[1][0]!.toUpperCase() + a[1].slice(1)}: ${ns[i]}. Se ei ole suurin.`).filter((_, i) => i !== best)),
          hint: 'Laske jokaisen rivin viisiryhmät ja loput viivat. Vertaa lukuja.',
          explain: `${z.map((a, i) => `${a[1]} ${ns[i]}`).join(', ')}. Eniten: ${z[best]![1]}.`,
        };
      },
    }, (r) => {
      const [k1, k2] = r.shuffle(['simpukka', 'kivi', 'kala', 'kukka']), n = r.int(5, 9), m = r.int(2, 4);
      return {
        say: `Rannalla on ${THINGS[k1!]!.many} ja ${THINGS[k2!]!.many}. Mikä viivamerkintä kertoo, montako ${THINGS[k1!]!.many} on?`,
        scene: paint(`<div class="pics">${groupArt(r, k1!, n, 'scatter', 180, 120, 26)}${groupArt(r, k2!, m, 'scatter', 140, 120, 26)}</div>`),
        task: choose(r, { art: tallyArt(n, 34) }, [{ art: tallyArt(n + 1, 34) }, { art: tallyArt(m, 34) }], ['Tässä on yksi viiva liikaa. Laske uudelleen.', 'Tämä on toisten esineiden määrä.'], 1),
        hint: 'Laske vain kysytyt esineet. Viisi viivaa tekee yhden ryhmän.',
        explain: `${THINGS[k1!]!.many[0]!.toUpperCase() + THINGS[k1!]!.many.slice(1)} on ${n}: viisiryhmä${n > 5 ? ` ja ${n - 5} viivaa` : ''}.`,
      };
    }),
  },
  {
    id: 'M-DATA-03', stop: 'Taulukon lukija', icon: '📋', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    intro: 'Taulukossa on rivejä ja sarakkeita. Otsikot kertovat, mitä kukin luku tarkoittaa.',
    reward: 'Osaat lukea taulukkoa riveittäin ja sarakkeittain!',
    demo: () => [
      { say: 'Etsi ensin oikea rivi, sitten oikea sarake. Niiden risteyksessä on vastaus.', scene: tableReadScene(['🦆 sorsa', '🐟 kala', '🐸 sammakko'], ['ma', 'ti', 'ke'], [[4, 2, 7], [3, 6, 1], [5, 8, 2]], [[1, 1, 'Montako kalaa tiistaina?'], [2, 0, 'Montako sammakkoa maanantaina?'], [0, 2, 'Montako sorsaa keskiviikkona?']]) },
      { say: 'Sama rivi mutta eri sarake antaa eri luvun: sorsia tiistaina 2, maanantaina 4. Tarkista aina molemmat otsikot.', scene: tableReadScene(['🦆 sorsa', '🐟 kala'], ['ma', 'ti'], [[4, 2], [3, 6]], [[0, 1, 'Sorsat tiistaina?'], [0, 0, 'Entä sorsat maanantaina?']]) },
    ],
    item: cases({
      read: (r) => {
        const z = zoo(r), ns = distinct(r, 3, 2, 12), i = r.int(0, 2);
        return {
          say: `Montako ${z[i]![2]} nähtiin taulukon mukaan?`,
          scene: paint(table(['Eläin', 'Määrä'], z.map((a, k) => [`${a[0]} ${a[1]}`, ns[k]!]))),
          task: choose(r, { big: String(ns[i]) }, z.map((a, k) => [a, k] as const).filter(([, k]) => k !== i).map(([, k]) => ({ big: String(ns[k]) })), z.filter((_, k) => k !== i).map((a) => `Tämä luku on rivillä ${a[1]}.`)),
          hint: `Etsi rivi ${z[i]![0]} ja katso sen luku.`,
          explain: `Rivi ${z[i]![1]}: ${ns[i]}.`,
        };
      },
      twoWay: (r) => {
        const z = zoo(r, 2), v = distinct(r, 4, 1, 12), i = r.int(0, 1), d = r.int(0, 1);
        const cell = v[i * 2 + d]!;
        return {
          say: `Montako ${z[i]![2]} nähtiin ${d ? 'tiistaina' : 'maanantaina'}?`,
          scene: paint(table(['', 'ma', 'ti'], z.map((a, k) => [`${a[0]} ${a[1]}`, v[k * 2]!, v[k * 2 + 1]!]))),
          task: choose(r, { big: String(cell) }, [{ big: String(v[i * 2 + (1 - d)]) }, { big: String(v[(1 - i) * 2 + d]) }], ['Tämä on oikea rivi mutta väärä päivä.', 'Tämä on oikea päivä mutta väärä eläin.']),
          hint: 'Etsi rivi ja sarake. Vastaus on niiden risteyksessä.',
          explain: `Rivi ${z[i]![1]}, sarake ${d ? 'ti' : 'ma'}: ${cell}.`,
        };
      },
      fewest: (r) => {
        const z = zoo(r), ns = distinct(r, 3, 2, 15), lo = ns.indexOf(Math.min(...ns));
        return {
          say: 'Mitä eläintä nähtiin vähiten?',
          scene: paint(table(['Eläin', 'Määrä'], z.map((a, k) => [`${a[0]} ${a[1]}`, ns[k]!]))),
          task: choose(r, t(`${z[lo]![0]} ${z[lo]![1]}`), z.filter((_, k) => k !== lo).map((a) => t(`${a[0]} ${a[1]}`)), z.map((a, k) => `${a[1][0]!.toUpperCase() + a[1].slice(1)}: ${ns[k]}. Löytyy pienempi luku.`).filter((_, k) => k !== lo)),
          hint: 'Vertaa Määrä-sarakkeen lukuja. Vähiten = pienin luku.',
          explain: `Pienin luku on ${ns[lo]}: ${z[lo]![1]}.`,
        };
      },
      cells: (r) => {
        const z = zoo(r, 2), v = distinct(r, 4, 1, 12), days = ['ma', 'ti'];
        const qs = r.shuffle([0, 1, 2, 3]).slice(0, 3), toks = r.shuffle(v.map((x, k) => ({ id: `n${k}`, text: String(x) })));
        return {
          say: 'Vedä jokaiseen kysymykseen oikea luku taulukosta. Yksi luku jää yli.',
          scene: paint(table(['', ...days], z.map((a, k) => [`${a[0]} ${a[1]}`, v[k * 2]!, v[k * 2 + 1]!]))),
          task: { kind: 'place', slots: qs.map((q) => ({ id: `q${q}`, text: `${z[Math.floor(q / 2)]![0]} ${days[q % 2]}` })), tokens: toks, answer: Object.fromEntries(qs.map((q) => [`q${q}`, `n${q}`])), why: Object.fromEntries(qs.map((q) => [`q${q}`, `Rivi ${z[Math.floor(q / 2)]![1]}, sarake ${days[q % 2]}: ${v[q]}.`])) } as Task,
          hint: 'Jokaisessa kysymyksessä on rivi (eläin) ja sarake (päivä).',
          explain: qs.map((q) => `${z[Math.floor(q / 2)]![1]} ${days[q % 2]}: ${v[q]}`).join(' · '),
        };
      },
    }, (r) => {
      const z = zoo(r, 2), v = distinct(r, 4, 2, 12), i = r.int(0, 1);
      const sum = v[i * 2]! + v[i * 2 + 1]!, other = v[(1 - i) * 2]! + v[(1 - i) * 2 + 1]!, wa: Record<number, string> = {};
      if (other !== sum) wa[other] = `Tämä on rivin ${z[1 - i]![1]} summa.`;
      if (v[i * 2]! !== sum && wa[v[i * 2]!] === undefined) wa[v[i * 2]!] = 'Tämä on vain maanantai. Lisää tiistai.';
      if (v[i * 2 + 1]! !== sum && wa[v[i * 2 + 1]!] === undefined) wa[v[i * 2 + 1]!] = 'Tämä on vain tiistai. Lisää maanantai.';
      return wq(ask(`Montako ${z[i]![2]} nähtiin yhteensä kahtena päivänä?`, v[i * 2]! + v[i * 2 + 1]!, '', `Rivi ${z[i]![1]}: ${v[i * 2]} + ${v[i * 2 + 1]} = ${v[i * 2]! + v[i * 2 + 1]!}.`, table(['', 'ma', 'ti'], z.map((a, k) => [`${a[0]} ${a[1]}`, v[k * 2]!, v[k * 2 + 1]!]))), 'Etsi oikea rivi ja laske sen molemmat luvut yhteen.', wa);
    }),
  },
  {
    id: 'M-DATA-04', stop: 'Taulukon tekijä', icon: '🧾', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    intro: 'Nyt sinä teet taulukon: jokaiselle asialle oma rivi ja sen määrä.',
    reward: 'Teit selkeän taulukon!',
    demo: () => [
      { say: 'Katso, miten taulukko syntyy: ensin otsikot, sitten jokaiselle eläimelle rivi. Havainnot siirretään yksi kerrallaan, ja lopuksi tarkistetaan summa.', scene: buildTableScene([['🦆', 'sorsa'], ['🐟', 'kala'], ['🐸', 'sammakko']], [0, 1, 0, 2, 0, 1, 0, 2, 1, 0]) },
      { say: 'Viivamerkinnät muutetaan luvuiksi. Jokainen rivi saa nimen ja määrän.', scene: paint(table(['Eläin', 'Merkinnät', 'Määrä'], [['🦆 sorsa', tallyArt(7, 28), 7], ['🐟 kala', tallyArt(3, 28), 3]])) },
    ],
    item: cases({
      fromTally: (r) => {
        const z = zoo(r), ns = distinct(r, 3, 2, 11), extra = ns[0]! + 1 === ns[1] || ns[0]! + 1 === ns[2] ? Math.max(...ns) + 1 : ns[0]! + 1;
        return {
          say: 'Siirrä oikea luku jokaisen eläimen riville.',
          scene: paint(table(['Eläin', 'Merkinnät'], z.map((a, i) => [`${a[0]} ${a[1]}`, tallyArt(ns[i]!, 30)]))),
          task: { kind: 'place', slots: z.map((a) => ({ id: a[1], text: `${a[0]} ${a[1]}` })), tokens: r.shuffle([...ns, extra].map((n) => ({ id: `n${n}`, text: String(n) }))), answer: Object.fromEntries(z.map((a, i) => [a[1], `n${ns[i]}`])), why: Object.fromEntries(z.map((a, i) => [a[1], `${Math.floor(ns[i]! / 5)} viisiryhmää ja ${ns[i]! % 5} viivaa = ${ns[i]}.`])) } as Task,
          hint: 'Laske jokaisen rivin viisiryhmät ja loput viivat. Yksi luku jää yli.',
          explain: z.map((a, i) => `${a[1]} ${ns[i]}`).join(', ') + '.',
        };
      },
      fromList: (r) => {
        const z = zoo(r, 3), ns = distinct(r, 3, 1, 5);
        const list = r.shuffle(z.flatMap((a, i) => Array(ns[i]).fill(a[0])));
        return {
          say: 'Havainnot on kirjattu järjestyksessä. Tee niistä taulukko: siirrä määrät riveille.',
          scene: paint(`<div class="formula" style="font-size:1.6rem;letter-spacing:.2rem">${list.join(' ')}</div>`),
          task: { kind: 'place', slots: z.map((a) => ({ id: a[1], text: `${a[0]} ${a[1]}` })), tokens: r.shuffle(ns.map((n) => ({ id: `n${n}`, text: String(n) }))), answer: Object.fromEntries(z.map((a, i) => [a[1], `n${ns[i]}`])), why: Object.fromEntries(z.map((a, i) => [a[1], `Jonossa on ${ns[i]} kertaa ${a[0]}.`])) } as Task,
          hint: 'Laske yksi eläin kerrallaan.',
          explain: z.map((a, i) => `${a[0]} ${ns[i]}`).join(', ') + '.',
        };
      },
      header: (r) => {
        const z = zoo(r), ns = distinct(r, 3, 2, 12);
        return {
          say: 'Taulukon toisesta sarakkeesta puuttuu otsikko. Mikä sopii?',
          scene: paint(table(['Eläin', '?'], z.map((a, i) => [`${a[0]} ${a[1]}`, ns[i]!]))),
          task: choose(r, t('Montako nähtiin'), [t('Eläimen väri'), t('Päivämäärä')], ['Sarakkeessa on lukumääriä, ei värejä.', 'Kaikki rivit ovat samalta päivältä.'], 1),
          hint: 'Katso, mitä sarakkeessa on: sanoja vai lukuja?',
          explain: 'Sarakkeen luvut ovat määriä, joten otsikko kertoo määrän.',
        };
      },
      total: (r) => {
        const z = zoo(r), ns = distinct(r, 3, 2, 9), tot = ns[0]! + ns[1]! + ns[2]!, known = ns[0]! + ns[1]!;
        const wa: Record<number, string> = { [tot]: 'Tämä on kaikkien havaintojen määrä. Vähennä siitä taulukon muut rivit.' };
        if (known !== ns[2]) wa[known] = 'Tämä on kahden tunnetun rivin summa. Vähennä se kokonaismäärästä.';
        return wq(ask(`Havaintoja oli yhteensä ${tot}. Montako ${z[2]![2]} taulukkoon pitää kirjoittaa?`, ns[2]!, '', `${tot} − ${ns[0]} − ${ns[1]} = ${ns[2]}. Tarkistus: ${ns.join(' + ')} = ${tot}.`, table(['Eläin', 'Määrä'], [[`${z[0]![0]} ${z[0]![1]}`, ns[0]!], [`${z[1]![0]} ${z[1]![1]}`, ns[1]!], [`${z[2]![0]} ${z[2]![1]}`, '?']])), 'Rivien summan pitää olla sama kuin havaintojen määrä.', wa);
      },
    }, (r) => {
      const ks = r.shuffle(['simpukka', 'kivi', 'kukka', 'kapy']).slice(0, 3), ns = distinct(r, 3, 2, 7);
      return {
        say: 'Laske rannan löydöt ja tee niistä taulukko.',
        scene: paint(`<div class="pics">${ks.map((k, i) => groupArt(r, k, ns[i]!, 'scatter', 120, 100, 24)).join('')}</div>`),
        task: { kind: 'place', slots: ks.map((k) => ({ id: k, text: THINGS[k]!.one })), tokens: r.shuffle([...ns, Math.max(...ns) + 1].map((n) => ({ id: `n${n}`, text: String(n) }))), answer: Object.fromEntries(ks.map((k, i) => [k, `n${ns[i]}`])), why: Object.fromEntries(ks.map((k, i) => [k, `Kuvassa on ${ns[i]} kpl: ${THINGS[k]!.one}.`])) } as Task,
        hint: 'Laske yksi löytölaji kerrallaan. Yksi luku jää yli.',
        explain: ks.map((k, i) => `${THINGS[k]!.one} ${ns[i]}`).join(', ') + '.',
      };
    }),
  },
  {
    id: 'M-DATA-09', stop: 'Järjestelmällinen tutkija', icon: '🗂️', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    intro: 'Hyvä tutkija kerää tiedon aina samalla tavalla: sama aika, sama paikka, sama kesto.',
    reward: 'Tutkimuksesi on suunniteltu järjestelmällisesti!',
    demo: () => [
      { say: 'Jos lintuja lasketaan kerran aamulla viisi minuuttia ja kerran illalla tunnin, tuloksia ei voi verrata. Laskentatapa pitää sopia etukäteen.', scene: fairCountScene() },
      { say: 'Tutkimuksen järjestys: ensin kysymys, sitten suunnitelma, sitten keruu ja lopuksi taulukko.', scene: stepsScene() },
    ],
    item: cases({
      method: (r) => {
        const [q, a, w1, w2] = r.pick([
          ['montako lintua käy ruokinnalla päivässä', 'Lasketaan joka aamu kello 8 kymmenen minuuttia', 'Katsotaan ikkunasta silloin, kun muistetaan', 'Arvataan viikon lopussa'],
          ['montako autoa ajaa koulun ohi', 'Lasketaan joka päivä samaan aikaan vartin ajan', 'Lasketaan yhtenä päivänä tunti ja toisena minuutti', 'Kysytään kaverilta'],
        ] as string[][]);
        return { say: `Haluamme tietää, ${q}. Mikä tapa on järjestelmällisin?`, task: choose(r, t(a!), [t(w1!), t(w2!)], ['Eri kerroilla eri kesto: tuloksia ei voi verrata.', 'Arvaus ei ole havainto.'], 1), hint: 'Etsi tapa, jossa aika ja kesto ovat joka kerta samat.', explain: 'Sama aika ja sama kesto joka kerta: tulokset ovat vertailukelpoisia.' };
      },
      fix: (r) => {
        const k = r.pick(['lintuja', 'perhosia', 'veneitä']);
        return {
          say: `Ville laski ${k} eri päivinä eri aikaan: joskus 5 minuuttia, joskus tunnin. Mitä hänen pitää korjata?`,
          task: choose(r, t('Laskea joka päivä yhtä kauan samaan aikaan'), [t('Laskea vielä useampana päivänä samalla tavalla'), t('Käyttää värikkäämpää vihkoa')], ['Lisää päiviä ei auta, jos kesto vaihtelee.', 'Vihko ei vaikuta tulokseen.'], 1),
          hint: 'Mikä Villen laskennoissa vaihteli?',
          explain: 'Jos kesto vaihtelee, tunnin laskennassa nähdään aina enemmän. Kesto ja aika pitää vakioida.',
        };
      },
      order: (r) => ({
        say: 'Missä järjestyksessä tutkimus tehdään?',
        task: choose(r, t('Kysymys → keruu → taulukko'), [t('Taulukko → kysymys → keruu'), t('Keruu → taulukko → kysymys')], ['Taulukkoon ei ole vielä mitään laitettavaa.', 'Ilman kysymystä ei tiedä, mitä kerätä.'], 1),
        hint: 'Mitä pitää tietää ennen kuin voi alkaa kerätä?',
        explain: 'Ensin päätetään, mitä halutaan tietää. Sitten kerätään, ja lopuksi järjestetään taulukoksi.',
      }),
      steps: (r) => {
        const st = ['❓ kysymys', '📝 suunnitelma', '🔭 keruu', '📋 taulukko'], toks = r.shuffle(st.map((x, i) => ({ id: `s${i}`, text: x })));
        const why = ['Ensin päätetään, mitä halutaan tietää.', 'Sitten sovitaan paikka, aika ja kesto.', 'Vasta sitten kerätään havainnot.', 'Lopuksi havainnot järjestetään taulukoksi.'];
        return {
          say: 'Vedä tutkimuksen vaiheet oikeaan järjestykseen.',
          task: { kind: 'place', slots: st.map((_, i) => ({ id: `p${i}`, text: `${i + 1}.` })), tokens: toks, answer: Object.fromEntries(st.map((_, i) => [`p${i}`, `s${i}`])), why: Object.fromEntries(why.map((w, i) => [`p${i}`, w])) } as Task,
          hint: 'Mitä tarvitset, ennen kuin voit tehdä seuraavan vaiheen?',
          explain: st.join(' → '),
        };
      },
      compare: (r) => {
        const m1 = r.pick([5, 10, 15]), m2 = m1 * r.pick([3, 4, 6]), c1 = r.int(2, 5), c2 = c1 * (m2 / m1) + r.int(-1, 1);
        return {
          say: `Maanantaina laskettiin lintuja ${m1} minuuttia: ${c1} lintua. Tiistaina laskettiin ${m2} minuuttia: ${c2} lintua. Kävikö tiistaina varmasti enemmän lintuja?`,
          task: choose(r, t('Ei voi tietää: laskennat kestivät eri kauan'), [t('Kyllä, koska luku on suurempi'), t('Ei, maanantaina kävi enemmän')], ['Tiistaina laskettiin pidempään, joten lukukin kasvoi.', 'Tätäkään ei voi päätellä eri pituisista laskennoista.'], 1),
          hint: 'Kestivätkö laskennat yhtä kauan?',
          explain: `Kestot olivat ${m1} ja ${m2} minuuttia. Vertailu vaatii saman keston.`,
        };
      },
    }, (r) => {
      const [a, b] = r.shuffle(['Kaislalampi', 'Kivilampi']);
      return {
        say: `Haluat verrata, kummassa on enemmän sammakoita: ${a} vai ${b}. Miten keräät tiedon reilusti?`,
        task: choose(r, t('Lasken molemmissa samaan aikaan päivästä yhtä kauan'), [t('Lasken toisessa aamulla ja toisessa illalla'), t('Lasken vain isommassa lammessa')], ['Sammakot voivat olla aamulla ja illalla eri tavoin esillä.', 'Vertailuun tarvitaan molemmat.'], 1),
        hint: 'Reilussa vertailussa muuttuu vain yksi asia.',
        explain: 'Vertailu on reilu, kun ainoa ero on itse lampi.',
      };
    }),
  },
  {
    id: 'M-DATA-10', stop: 'Taulukon kokoaja', icon: '🗃️', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    intro: 'Pitkä havaintolista on vaikea lukea. Kun sen järjestää taulukoksi, tulos näkyy yhdellä silmäyksellä.',
    reward: 'Järjestit havainnot selkeäksi taulukoksi!',
    demo: () => [
      { say: 'Havainnossa on kaksi tietoa: mikä eläin ja minä päivänä. Silloin taulukossa on eläimet riveillä ja päivät sarakkeissa.', scene: twoWayScene(['🦆', '🐟'], ['ma', 'ti'], [[0, 0], [1, 0], [0, 1], [0, 0], [1, 1], [1, 0], [0, 1], [0, 0]]) },
    ],
    item: cases({
      listToTable: (r) => {
        const z = zoo(r, 3), ns = distinct(r, 3, 1, 5);
        const list = r.shuffle(z.flatMap((a, i) => Array(ns[i]).fill(a[0])));
        const tb = (v: number[]) => table(['', 'määrä'], z.map((a, i) => [a[0], v[i]!]));
        return {
          say: 'Mikä taulukko kuvaa havaintolistaa oikein?',
          scene: paint(`<div class="formula" style="font-size:1.5rem;letter-spacing:.2rem">${list.join(' ')}</div>`),
          task: choose(r, { art: tb(ns) }, [{ art: tb([ns[1]!, ns[0]!, ns[2]!]) }, { art: tb(ns.map((n, i) => (i === 2 ? n + 1 : n))) }], ['Kahden eläimen määrät ovat vaihtaneet paikkaa.', 'Yksi määrä on laskettu väärin.'], 1),
          hint: 'Laske listasta jokainen eläin erikseen ja vertaa taulukoihin.',
          explain: z.map((a, i) => `${a[0]} ${ns[i]}`).join(', ') + '.',
        };
      },
      cell: (r) => {
        const z = zoo(r, 2), v = distinct(r, 4, 0, 4);
        const obs = r.shuffle(z.flatMap((a, i) => [...Array(v[i * 2]).fill(`ma ${a[0]}`), ...Array(v[i * 2 + 1]).fill(`ti ${a[0]}`)]));
        const i = r.int(0, 1), d = r.int(0, 1);
        const ans = v[i * 2 + d]!, wa: Record<number, string> = {}, other = v[i * 2 + 1 - d]!, both = other + ans;
        if (both !== ans) wa[both] = `Laskit ${z[i]![0]} molemmilta päiviltä. Laske vain ${d ? 'ti' : 'ma'}.`;
        if (wa[other] === undefined && other !== ans) wa[other] = `Tämä on toisen päivän luku.`;
        return wq(ask(`Montako ${z[i]![2]} nähtiin ${d ? 'tiistaina' : 'maanantaina'}? Laske listasta taulukon ruutuun tuleva luku.`, ans, '', `Merkintöjä "${d ? 'ti' : 'ma'} ${z[i]![0]}" on ${ans}.`, `<div class="formula">${obs.join(', ') || '–'}</div>`), `Etsi listasta vain merkinnät "${d ? 'ti' : 'ma'} ${z[i]![0]}".`, wa);
      },
      shape: (r) => {
        const head = (h: string[]) => table(h, [h.map(() => '…')]);
        return {
          say: 'Havainnoista kirjattiin eläin ja viikonpäivä. Millainen taulukko sopii?',
          task: choose(r, { art: head(['eläin', 'ma', 'ti', 'ke']) }, [{ art: head(['eläin', 'määrä']) }, { art: head(['ma', 'ti', 'ke']) }], ['Tästä puuttuvat päivät.', 'Tästä puuttuvat eläimet.'], 1),
          hint: 'Taulukossa pitää olla paikka sekä eläimelle että päivälle.',
          explain: 'Kaksi tietoa: eläimet riveille ja päivät sarakkeisiin.',
        };
      },
      fill: (r) => {
        const z = zoo(r, 2), v = distinct(r, 4, 0, 4), days = ['ma', 'ti'];
        const obs = r.shuffle(z.flatMap((a, i) => [...Array(v[i * 2]).fill(`${days[0]} ${a[0]}`), ...Array(v[i * 2 + 1]).fill(`${days[1]} ${a[0]}`)]));
        const toks = r.shuffle([...v, 5].map((x) => ({ id: `n${x}`, text: String(x) })));
        const slots = [0, 1, 2, 3].map((q) => ({ id: `c${q}`, text: `${z[Math.floor(q / 2)]![0]} ${days[q % 2]}` }));
        return {
          say: 'Täytä taulukko listan perusteella: vedä jokaiseen ruutuun oikea luku. Yksi luku jää yli.',
          scene: paint(`<div class="formula">${obs.join(', ') || '–'}</div>`),
          task: { kind: 'place', slots, tokens: toks, answer: Object.fromEntries([0, 1, 2, 3].map((q) => [`c${q}`, `n${v[q]}`])), why: Object.fromEntries([0, 1, 2, 3].map((q) => [`c${q}`, `Merkintöjä "${days[q % 2]} ${z[Math.floor(q / 2)]![0]}" on ${v[q]}.`])) } as Task,
          hint: 'Käy läpi yksi ruutu kerrallaan: sama päivä ja sama eläin.',
          explain: slots.map((sl, q) => `${sl.text}: ${v[q]}`).join(' · '),
        };
      },
    }, (r) => {
      const z = zoo(r, 2), v = distinct(r, 4, 0, 4);
      const obs = r.shuffle(z.flatMap((a, i) => [...Array(v[i * 2]).fill(`ma ${a[0]}`), ...Array(v[i * 2 + 1]).fill(`ti ${a[0]}`)]));
      const tb = (w: number[]) => table(['', 'ma', 'ti'], z.map((a, k) => [a[0], w[k * 2]!, w[k * 2 + 1]!]));
      return {
        say: 'Mikä taulukko vastaa listaa?',
        scene: paint(`<div class="formula">${obs.join(', ') || '–'}</div>`),
        task: choose(r, { art: tb(v) }, [{ art: tb([v[1]!, v[0]!, v[3]!, v[2]!]) }, { art: tb([v[2]!, v[3]!, v[0]!, v[1]!]) }], ['Päivät ovat menneet sekaisin.', 'Eläimet ovat menneet sekaisin.'], 1),
        hint: 'Tarkista yksi ruutu: esimerkiksi montako ma-merkintää on ensimmäiselle eläimelle?',
        explain: z.map((a, k) => `${a[0]}: ma ${v[k * 2]}, ti ${v[k * 2 + 1]}`).join('; ') + '.',
      };
    }),
  },
];
