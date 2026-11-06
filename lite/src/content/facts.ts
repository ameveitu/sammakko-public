// Rantaretki additions (grades 1–2): halving, number bonds, counting back, comparing,
// basic facts to 10 and 20, mental strategies to 100, the low times tables and the
// inverse relations. Strategy-first, following the fact-fluency references in
// docs/PEDAGOGY_REFERENCES.md (bonds, turnarounds, doubles, bridging ten, think-addition).
import type { NodeSpec } from '../engine/types';
import { word } from './fi';
import { cases, choose, groupArt, paint } from './kit';
import { numberLineArt, reedsArt } from './pics';
import { AUDIT_REV, LAUNCH_REV } from './audit-rev';
import { skipDivScene, shareRoundScene, unpackScene, sumToTimesScene, doubleRowsScene, rowsScene, turnScene, subReedsScene, addReedsScene, bigFirstScene, bridgeDownScene, bridgeScene, countUpScene, cupScene, cutScene, dealScene, doubleScene, evenOut, familyScene, jumpsScene, lineHops, pairScene, signScene, splitScene, takeAway, translateScene, tenFillScene, tensRace } from './countanim';
import { alts, arrayArt, ask, card, ex, many, n$, pickNum, t, tenFrame, YESNO } from './parts';
import { stonesArt } from './numbers';

const FOOD = ['marja', 'simpukka', 'kapy', 'kivi', 'kukka'];
const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);

export const FACT_NODES: NodeSpec[] = [
  // ============================================================ halving
  {
    id: 'M-NUM-17', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Puolikkaat', icon: '✂️',
    goal: 'Opit jakamaan joukon kahteen yhtä suureen osaan.',
    intro: 'Loikka ja Aava jakavat löydöt aina puoliksi: kummallekin yhtä monta.',
    reward: 'Jaoit reilusti kahtia: puolet kummallekin!',
    demo: (r) => [
      { say: 'Tässä on kahdeksan simpukkaa. Annetaan vuorotellen yksi Loikalle ja yksi Aavalle, kunnes kasa on tyhjä. Kumpikin saa neljä: neljä on puolet kahdeksasta, koska neljä ja neljä on kahdeksan.', scene: dealScene('simpukka', 8) },
      { say: 'Jos toinen saa enemmän, jako ei ole puoliksi. Silloin annetaan yksi kerrallaan toiselle, kunnes kummallakin on yhtä monta.', scene: evenOut('kapy', 5, 3) },
    ],
    item: cases({
      share: (r) => {
        const h = r.int(2, 6), k = r.pick(FOOD);
        return {
          say: `${cap(word(2 * h))} ${many(k, 2 * h)} jaetaan Loikalle ja Aavalle puoliksi. Montako kumpikin saa?`,
          scene: paint(groupArt(r, k, 2 * h, 'line', 280, 80, 24)),
          task: pickNum(r, h, [2 * h, h + 1, h - 1], ['Se on kaikkien määrä. Kumpikin saa vain osan.', `Jos kumpikin saisi ${h + 1}, yhteensä olisi ${2 * h + 2}.`, `Jos kumpikin saisi ${h - 1}, yhteensä olisi vain ${2 * h - 2}.`]),
          hint: 'Anna vuorotellen yksi kummallekin.',
          explain: `${h} ja ${h} on ${2 * h}. Puolet luvusta ${2 * h} on ${h}.`,
        };
      },
      deal: (r) => {
        const h = r.int(2, 6), k = r.pick(FOOD);
        return {
          say: `Jaa ${word(2 * h)} ${many(k, 2 * h)} puoliksi Loikalle ja Aavalle.`,
          task: { kind: 'deal' as const, n: 2 * h, thing: k },
          hint: 'Anna vuorotellen: yksi Loikalle, yksi Aavalle.',
          explain: `Kumpikin sai ${h}. ${h} ja ${h} on ${2 * h}, joten puolet luvusta ${2 * h} on ${h}.`,
        };
      },
      fair: (r) => {
        const h = r.int(2, 5), off = r.pick([0, 0, 1]), k = r.pick(FOOD);
        return {
          say: 'Onko tämä jaettu puoliksi, kummallekin yhtä monta?',
          scene: paint(groupArt(r, k, h + off, 'line', 140, 70, 24) + groupArt(r, k, h - off, 'line', 140, 70, 24)),
          task: YESNO(off === 0, 'Kummallakin on yhtä monta.', `Toisella on ${h + off}, toisella ${h - off}. Ne eivät ole yhtä monta.`),
          hint: 'Laske kummankin osa erikseen ja vertaa.',
          explain: off === 0 ? `Kummallakin on ${h}: jako on puoliksi.` : `Toisella on ${h + off} ja toisella ${h - off}. Puoliksi jaettuna kumpikin saisi ${h}.`,
        };
      },
      number: (r) => {
        const h = r.int(2, 10);
        return {
          say: `Mikä on puolet luvusta ${2 * h}?`,
          scene: paint(tenFrame(2 * h, 'marja')),
          task: pickNum(r, h, [2 * h - 2, h + 2, h - 1], [2 * h - 2, h + 2, h - 1].map((w) => `${w} + ${w} = ${2 * w}, ei ${2 * h}.`)),
          hint: `Mikä luku ja sama luku uudestaan tekee ${2 * h}?`,
          explain: `${h} + ${h} = ${2 * h}, joten puolet luvusta ${2 * h} on ${h}.`,
        };
      },
    }, (r) => {
      const h = r.int(3, 8);
      return {
        say: `Loikka sai puolet kävyistä. Hänellä on ${word(h)} käpyä. Montako käpyä oli alussa?`,
        task: pickNum(r, 2 * h, [h, h + 2, 2 * h + 1], ['Se on Loikan osa. Aava sai yhtä monta lisää.', `Aava ei saanut kahta vaan yhtä monta kuin Loikka: ${h} + ${h} = ${2 * h}.`, `${2 * h + 1} ei jakaudu tasan kahtia.`]),
        hint: 'Aava sai yhtä monta kuin Loikka.',
        explain: `Aava sai myös ${h}. Yhteensä ${h} + ${h} = ${2 * h}.`,
      };
    }),
  },
  // ============================================================ number bonds
  {
    id: 'M-NUM-18', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Simpukkaparit', icon: '🐚',
    goal: 'Opit, mistä kahdesta osasta luvut 1–10 voi koota.',
    intro: 'Aava piilottaa osan simpukoista kupin alle. Kuinka monta on piilossa?',
    reward: 'Tunnet lukujen osat: piilossa olevat simpukat eivät jää arvoitukseksi!',
    demo: () => [
      { say: 'Kympin ruudukkoon tulee seitsemän simpukkaa. Lasketaan tyhjät ruudut: yksi, kaksi, kolme. Seitsemän ja kolme on yhdessä kymmenen.', scene: tenFillScene('simpukka', 7) },
      { say: 'Seitsemän voi jakaa kahteen osaan monella tavalla. Katso jakoviivaa: viisi ja kaksi, neljä ja kolme, kuusi ja yksi.', scene: splitScene('simpukka', 7, [5, 4, 6]) },
      { say: 'Simpukoita on seitsemän. Kuppi peittää osan, ja näkyvissä on neljä. Neljä ja montako on seitsemän? Viisi, kuusi, seitsemän: kolme. Kupin alla oli kolme.', scene: cupScene('simpukka', 7, 4) },
    ],
    item: cases({
      hidden: (r) => {
        const n = r.int(4, 10), a = r.int(1, n - 1);
        return {
          say: `Simpukoita on yhteensä ${n}. Näkyvissä on ${a}. Montako on kupin alla?`,
          scene: cupScene('simpukka', n, a, false),
          task: pickNum(r, n - a, [n, a, n - a + 1], [`${n} on kaikki simpukat yhteensä. Kysyttiin kupin alla olevia.`, `${a} on näkyvissä olevat. Kupin alla on loput.`, `Laske uudelleen: ${a} ja ${n - a + 1} on ${n + 1}, ei ${n}.`]),
          hint: `Laske näkyvistä eteenpäin lukuun ${n} asti.`,
          explain: `${a} + ${n - a} = ${n}. Kupin alla on ${n - a}.`,
        };
      },
      pair: (r) => {
        const n = r.int(5, 10), a = r.int(1, n - 1);
        const w1 = r.int(1, n - 1), w2 = r.int(1, n - 2);
        return {
          say: `Mikä pari on yhteensä ${n}?`,
          task: choose(r, ex(`${a} + ${n - a}`), [ex(`${w1} + ${n - w1 + 1}`), ex(`${w2} + ${n - w2 - 1}`)], [`Se on yhteensä ${n + 1}.`, `Se on yhteensä ${n - 1}.`]),
          hint: 'Laske kummankin parin osat yhteen.',
          explain: `${a} + ${n - a} = ${n}.`,
        };
      },
      ten: (r) => {
        const n = r.int(1, 9);
        return {
          say: 'Montako simpukkaa puuttuu, että ruudukko on täynnä?',
          scene: paint(tenFrame(n)),
          task: pickNum(r, 10 - n, [n, 10 - n + 1, 10 - n - 1], [`${n} on simpukat. Kysyttiin tyhjiä ruutuja.`, 'Yksi liikaa: laske tyhjät ruudut uudelleen.', 'Yksi jäi laskematta: laske tyhjät ruudut uudelleen.']),
          hint: 'Laske tyhjät ruudut.',
          explain: `${n} + ${10 - n} = 10. Tyhjiä ruutuja on ${10 - n}.`,
        };
      },
      scale: (r) => {
        const n = r.int(5, 10), a = r.int(1, n - 2);
        return {
          say: `Vasemmalla on ${n} kiveä, oikealla ${a}. Lisää oikealle kiviä, kunnes vaaka on suorassa.`,
          task: { kind: 'balance' as const, left: [n], right: [a] },
          hint: `Laske luvusta ${a} eteenpäin lukuun ${n} asti.`,
          explain: `${n} = ${a} + ${n - a}. Toinen osa on ${n - a}.`,
        };
      },
    }, (r) => {
      const n = r.int(5, 9), a = r.int(1, n - 1);
      return {
        say: `Aavalla on ${n} kiveä kahdessa taskussa. Vasemmassa on ${n - a}. Montako on oikeassa taskussa?`,
        task: pickNum(r, a, [n, n - a, a + 1], [`${n} on kaikki kivet. Kysyttiin oikean taskun kiviä.`, `${n - a} on vasemman taskun kivet.`, `${n - a} ja ${a + 1} on ${n + 1}, ei ${n}.`]),
        hint: `Laske luvusta ${n - a} eteenpäin lukuun ${n} asti.`,
        explain: `${n - a} + ${a} = ${n}, joten oikeassa taskussa on ${a}.`,
      };
    }),
  },
  // ============================================================ counting back
  {
    id: 'M-NUM-08', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Takaperin', icon: '⏪',
    goal: 'Opit jatkamaan lukujonoa taaksepäin.',
    intro: 'Loikka hyppää numerokiviä takaisin rantaan päin: luvut pienenevät yksi kerrallaan.',
    reward: 'Loikka pääsi takaperin takaisin rantaan!',
    demo: () => [
      { say: 'Eteenpäin luvut kasvavat. Taaksepäin ne pienenevät: joka hypyllä yksi vähemmän. Kahdeksan, seitsemän, kuusi, viisi.', scene: lineHops(8, -3, 0, 10) },
      { say: 'Taaksepäin mentäessä kaksikymmentä vaihtuu yhdeksääntoista: kaksikymmentäyksi, kaksikymmentä, yhdeksäntoista, kahdeksantoista.', scene: lineHops(21, -3, 15, 23) },
      { say: 'Lähtökivi ei ole hyppy. Ensimmäinen hyppy vie luvusta 13 lukuun 12.', scene: paint(numberLineArt({ min: 8, max: 16, marks: [{ v: 13, icon: 'frog' }], jumps: [{ from: 13, to: 12, label: '−1' }] })) },
    ],
    item: cases({
      next: (r) => {
        const s = r.int(6, 30);
        return {
          say: 'Mikä luku tulee seuraavaksi, kun lasketaan taaksepäin?',
          scene: paint(stonesArt([s, s - 1, s - 2, null])),
          task: pickNum(r, s - 3, [s - 1, s + 1, s - 4], ['Se luku on jo jonossa.', 'Jono pienenee, ei kasva.']),
          explain: `${s}, ${s - 1}, ${s - 2}, ${s - 3}: joka kerta yksi vähemmän.`,
        };
      },
      hop: (r) => {
        const s = r.int(6, 24), k = r.int(2, 4), lo = Math.max(0, s - 8), hi = lo + 10;
        return {
          say: `Loikka on luvussa ${s} ja hyppää ${word(k)} kertaa yhden taaksepäin. Napauta, mihin hän päätyy.`,
          scene: paint(numberLineArt({ min: lo, max: hi, marks: [{ v: s, icon: 'frog' }] })),
          task: { kind: 'line' as const, min: lo, max: hi, step: 1, answer: s - k, whyAt: { [s - k + 1]: `Lähtöluku ${s} ei ole hyppy. Ensimmäinen hyppy vie lukuun ${s - 1}.`, [s + k]: 'Taaksepäin luvut pienenevät: hyppää vasemmalle.', [s]: 'Loikka ei vielä hypännyt.' } },
          hint: `Sano jokaisesta hypystä luku: ${s - 1}, …`,
          explain: `${Array.from({ length: k + 1 }, (_, i) => s - i).join(', ')}: ${k} hyppyä taaksepäin.`,
        };
      },
      before: (r) => {
        const n = r.int(3, 40);
        return {
          say: `Mikä luku on juuri ennen lukua ${n}?`,
          task: pickNum(r, n - 1, [n + 1, n - 2], ['Se tulee luvun jälkeen.', `${n - 2} on kaksi pienempi. Juuri ennen tarkoittaa yhtä pienempää.`]),
          hint: `Laske taaksepäin luvusta ${n} yksi askel.`,
          explain: `Ennen lukua ${n} tulee ${n - 1}, joka on yhtä pienempi.`,
        };
      },
      gap: (r) => {
        const s = r.int(8, 30);
        return {
          say: 'Mikä luku puuttuu taaksepäin menevästä jonosta?',
          scene: paint(stonesArt([s, null, s - 2, s - 3])),
          task: pickNum(r, s - 1, [s + 1, s - 4, s - 2], ['Jono pienenee: puuttuva on pienempi kuin ' + s + '.', `${s - 4} tulisi vasta jonon lopussa.`, `${s - 2} on jo seuraavassa kivessä.`]),
          hint: 'Lue jono ääneen alusta: mikä luku jää väliin?',
          explain: `${s}, ${s - 1}, ${s - 2}, ${s - 3}.`,
        };
      },
    }, (r) => {
      const s = r.int(10, 18), k = r.int(3, 5);
      return {
        say: `Loikka on kivellä ${s}. Hän hyppää ${word(k)} kertaa yhden kiven taaksepäin. Mihin hän päätyy? Napauta lukusuoralta.`,
        scene: paint(numberLineArt({ min: 0, max: 20, labelEvery: 5, marks: [{ v: s, icon: 'frog' }] })),
        task: { kind: 'line', min: 0, max: 20, step: 1, answer: s - k, labelEvery: 5, whyAt: { [s - k + 1]: `Lähtökivi ${s} ei ole hyppy. Ensimmäinen hyppy vie kivelle ${s - 1}.`, [s + k]: 'Taaksepäin luvut pienenevät: vasemmalle.' } },
        hint: 'Laske hypyt sormilla ja sano jokaisen kiven numero.',
        explain: `${Array.from({ length: k + 1 }, (_, i) => s - i).join(', ')}. Loikka on kivellä ${s - k}.`,
      };
    }),
  },
  // ============================================================ comparing
  {
    id: 'M-NUM-10', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Kumpi enemmän?', icon: '⚖️',
    goal: 'Opit päättelemään, kumpi kahdesta luvusta on suurempi.',
    intro: 'Kaislanippuja kerätään lauttaa varten. Kumpi kasa on suurempi?',
    reward: 'Osaat verrata lukuja: ensin kympit, sitten ykköset!',
    demo: () => [
      { say: 'Rakennetaan luvut 41 ja 38 nipuista. Kymppejä verrataan ensin: neljä nippua on enemmän kuin kolme. Ykkösiä ei tarvitse edes katsoa.', scene: tensRace(41, 38) },
      { say: 'Jos kymppejä on yhtä monta, ratkaisevat ykköset: 52 ja 57.', scene: tensRace(52, 57) },
      { say: 'Merkki osoittaa kärjellä pienempää ja avautuu suurempaa kohti: 41 > 38.', scene: card('41 > 38') },
    ],
    item: cases({
      bigger: (r) => {
        const a = r.int(10, 99); let b = r.int(10, 99); if (b === a) b = a + 1;
        const hi = Math.max(a, b), lo = Math.min(a, b), sameT = Math.floor(hi / 10) === Math.floor(lo / 10);
        return {
          say: 'Kumpi luku on suurempi?',
          task: choose(r, n$(hi), [n$(lo)], [sameT ? `Kympit ovat samat, joten ratkaisevat ykköset: ${lo % 10} on vähemmän kuin ${hi % 10}.` : `Luvussa ${lo} on ${Math.floor(lo / 10)} kymppiä, luvussa ${hi} on ${Math.floor(hi / 10)}. Kympit ratkaisevat.`], 2),
          hint: 'Vertaa ensin kymppejä.',
          explain: `${hi} on suurempi kuin ${lo}. Verrataan ensin kymppejä, sitten ykkösiä.`,
        };
      },
      tens: (r) => {
        // Trap: more ones but fewer tens (e.g. 29 vs 32).
        const t1 = r.int(1, 7), o1 = r.int(6, 9), o2 = r.int(0, 4);
        const small = t1 * 10 + o1, large = (t1 + 1) * 10 + o2;
        return {
          say: 'Kumpi luku on suurempi?',
          scene: paint(reedsArt(t1, o1, 200) + reedsArt(t1 + 1, o2, 200)),
          task: choose(r, n$(large), [n$(small)], [`Luvussa ${small} on enemmän ykkösiä, mutta vähemmän kymppejä. Kympit ratkaisevat.`], 2),
          explain: `${large} on suurempi: siinä on ${t1 + 1} kymppiä, luvussa ${small} vain ${t1}.`,
        };
      },
      symbol: (r) => {
        const a = r.int(5, 99); const b = r.pick([a, r.int(5, 99), r.int(5, 99)]);
        const right = a > b ? '>' : a < b ? '<' : '=';
        const wrong = ['<', '>', '='].filter((s) => s !== right);
        return {
          say: 'Mikä merkki sopii ruutuun?',
          scene: card(`${a} □ ${b}`),
          task: choose(r, ex(right), wrong.map(ex), wrong.map((w) => (a === b ? 'Luvut ovat yhtä suuret, joten kumpikaan ei ole pienempi.' : w === '=' ? `${a} ja ${b} eivät ole yhtä suuret.` : 'Kärki osoittaa nyt suurempaa lukua. Kärjen pitää osoittaa pienempää.'))),
          hint: 'Merkin kärki osoittaa pienempää lukua.',
          explain: a === b ? `${a} = ${b}: luvut ovat yhtä suuret.` : `${a} ${right} ${b}: kärki osoittaa pienempää lukua ${Math.min(a, b)}.`,
        };
      },
      order: (r) => {
        const t0 = r.int(2, 7);
        // One pair with the same tens and one "more ones, fewer tens" trap.
        const v = [t0 * 10 + r.int(6, 9), (t0 + 1) * 10 + r.int(0, 3), t0 * 10 + r.int(0, 4)];
        const sorted = [...v].sort((x, y) => x - y);
        const ids = ['pienin', 'keski', 'suurin'];
        return {
          say: 'Järjestä kaislakasat: pienin ensin, suurin viimeiseksi.',
          task: {
            kind: 'place', slots: [{ id: 'pienin', text: 'Pienin' }, { id: 'keski', text: 'Keskimmäinen' }, { id: 'suurin', text: 'Suurin' }],
            tokens: r.shuffle(v.map((x) => ({ id: `v${x}`, text: String(x), speak: word(x) }))),
            answer: Object.fromEntries(ids.map((id, i) => [id, `v${sorted[i]}`])),
          },
          hint: 'Katso ensin kympit. Jos kympit ovat samat, katso ykköset.',
          explain: `${sorted.join(' < ')}. Kympit ensin, sitten ykköset.`,
        };
      },
    }, (r) => {
      const a = r.int(12, 45), b = a + r.pick([-9, -1, 1, 9, 10]);
      return {
        say: `Loikalla on ${a} kaislaa, Aavalla ${b}. Kummalla on enemmän?`,
        task: choose(r, { text: a > b ? 'Loikalla' : 'Aavalla' }, [{ text: a > b ? 'Aavalla' : 'Loikalla' }], [`${Math.min(a, b)} on pienempi kuin ${Math.max(a, b)}. Vertaa ensin kymppejä.`], 2),
        hint: 'Vertaa ensin kymppejä, sitten ykkösiä.',
        explain: `${Math.max(a, b)} on suurempi kuin ${Math.min(a, b)}.`,
      };
    }),
  },
  // ============================================================ inverse + and −
  {
    id: 'M-ADD-SUB-01', rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV], stop: 'Lukuperhe', icon: '👨‍👩‍👧',
    goal: 'Opit, että vähennyslasku purkaa yhteenlaskun ja päinvastoin.',
    intro: 'Kolme lukua muodostaa perheen: kaksi osaa ja koko. Niistä saa neljä laskua.',
    reward: 'Tunnet lukuperheet: yhdestä laskusta saat kolme muuta!',
    demo: () => [
      { say: 'Kolme ja neljä simpukkaa tulevat yhteen: seitsemän. Sitten neljä lähtee, ja jää kolme. Sitten kolme lähtee, ja jää neljä. Samoista luvuista saadaan neljä laskua.', scene: familyScene('simpukka', 3, 4) },
      { say: 'Vähennyslasku purkaa yhteenlaskun. Loikka hyppää viidestä kolme eteenpäin kahdeksaan, ja kolme taaksepäin takaisin viiteen.', scene: lineHops(5, 3, 0, 10) },
      { say: 'Takaisin: kahdeksan miinus kolme on viisi.', scene: lineHops(8, -3, 0, 10) },
    ],
    item: cases({
      family: (r) => {
        const a = r.int(2, 9), b = r.int(2, 9), c = a + b;
        return {
          say: `${a} + ${b} = ${c}. Mikä vähennyslasku kuuluu samaan perheeseen?`,
          task: choose(r, ex(`${c} − ${b} = ${a}`), [ex(`${c} + ${b} = ${a}`), ex(`${c} − ${a} = ${b + 1}`)], [`Plussalla vastaus kasvaisi: ${c} + ${b} on ${c + b}.`, `${c} − ${a} on ${b}, ei ${b + 1}.`]),
          hint: `Koko on ${c}. Ota siitä toinen osa pois.`,
          explain: `Koko on ${c}. Kun siitä otetaan ${b}, jää ${a}.`,
        };
      },
      undo: (r) => {
        const a = r.int(2, 9), b = r.int(2, 8);
        return ask(`Loikalla oli marjoja. Hän sai ${b} lisää, ja nyt hänellä on ${a + b}. Montako marjaa hänellä oli aluksi?`, a,
          `Puretaan lisäys: ${a + b} − ${b} = ${a}. Tarkistus: ${a} + ${b} = ${a + b}.`, { hint: 'Ota lisätyt pois.', whyAt: { [a + b + b]: 'Lisäsit vielä kerran. Aluksi marjoja oli vähemmän kuin nyt: ota lisätyt pois.', [a + b]: `${a + b} on marjat nyt. Kysyttiin, montako oli aluksi.`, ...(b !== a ? { [b]: `${b} on saadut marjat. Kysyttiin, montako oli ennen niitä.` } : {}) } });
      },
      check: (r) => {
        const c = r.int(8, 18), b = r.int(2, c - 2), a = c - b;
        return {
          say: `Aava laski ${c} − ${b} = ${a}. Millä yhteenlaskulla hän voi tarkistaa vastauksen?`,
          task: choose(r, ex(`${a} + ${b} = ${c}`), [ex(`${c} + ${b} = ${c + b}`), ex(`${a} + ${c} = ${a + c}`)], [`Tässä lisätään koko ${c} ja poistettu ${b}. Tarkistuksessa vastaus ${a} ja poistettu ${b} lasketaan yhteen, ja tuloksen pitää olla ${c}.`, `Tässä lisätään vastaus ja koko. Tarkistuksessa vastaus ${a} ja poistettu ${b} lasketaan yhteen.`]),
          hint: 'Laita takaisin se, mikä otettiin pois. Tuleeko alkuperäinen luku?',
          explain: `${a} + ${b} = ${c}, joten vähennyslasku oli oikein.`,
        };
      },
      write: (r) => {
        const a = r.int(2, 8); let b = r.int(2, 9); if (b === a) b++;
        const c = a + b;
        return {
          say: `Perheen luvut ovat ${a}, ${b} ja ${c}. Kirjoita perheen vähennyslasku.`,
          task: { kind: 'build' as const, mode: 'fact' as const, target: `${c} − ${b} = ${a}`, tokens: [a, b, c].sort((x, y) => x - y).map(String).concat(['+', '−', '=']), max: 5 },
          hint: `Vähennyslasku alkaa kokonaisesta: ${c} − …`,
          explain: `${c} − ${b} = ${a} ja ${c} − ${a} = ${b} kuuluvat molemmat perheeseen.`,
        };
      },
    }, (r) => {
      const a = r.int(3, 9), b = r.int(2, 9); const c = a + b;
      return {
        say: `Perheen luvut ovat ${a}, ${b} ja ${c}. Mikä lasku ei kuulu tähän perheeseen?`,
        task: choose(r, ex(`${a} − ${b} = ${c}`), [ex(`${c} − ${a} = ${b}`), ex(`${b} + ${a} = ${c}`)], [`Tämä kuuluu perheeseen: kokonaisesta ${c} otetaan osa ${a}, jää osa ${b}.`, `Tämä kuuluu perheeseen: osat ${b} ja ${a} ovat yhdessä koko ${c}.`]),
        hint: `Koko on ${c}. Missä laskussa koko on väärässä paikassa?`,
        explain: `Perheessä koko ${c} on aina yhteenlaskun vastaus tai vähennyslaskun alussa.`,
      };
    }),
  },
  // ============================================================ addition facts to 10
  {
    id: 'M-ADD-FACT-10', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Plussasimpukat', icon: '➕',
    goal: 'Opit yhteenlaskut kymmeneen asti nopeasti ja varmasti.',
    intro: 'Simpukkapajassa muistetaan pienet plussalaskut. Niitä tarvitaan kaikkialla.',
    reward: 'Pienet plussalaskut sujuvat: niillä rakennat isommat!',
    demo: () => [
      { say: 'Kaksi plus kuusi. Loikka aloittaa kakkosesta ja hyppää kuusi kertaa. Aava aloittaa kuutosesta ja hyppää vain kaksi kertaa. Molemmat päätyvät kahdeksaan.', scene: bigFirstScene(2, 6) },
      { say: 'Tuplat kannattaa muistaa. Peili tekee jokaiselle simpukalle kaksosen: neljä ja neljä on kahdeksan.', scene: doubleScene('simpukka', 4) },
      { say: 'Lähes tupla: kolme plus neljä on tupla kolme plus kolme ja yksi lisää. Kuusi ja yksi on seitsemän.', scene: doubleScene('simpukka', 3, true) },
    ],
    item: cases({
      fact: (r) => {
        const a = r.int(0, 9), b = r.int(1, 10 - a);
        const big = Math.max(a, b), small = Math.min(a, b);
        return ask(`${a} + ${b} = ?`, a + b, small === 0 ? `Nolla ei lisää mitään: ${a} + ${b} = ${a + b}.` : `Aloita luvusta ${big} ja laske ${word(small)} eteenpäin: ${Array.from({ length: small }, (_, i) => big + 1 + i).join(', ')}.`, {
          hint: small === 0 ? 'Kun lisätään nolla, mikään ei muutu.' : `Aloita isommasta luvusta ${big} ja laske ${word(small)} eteenpäin.`,
          whyAt: { [a + b - 1]: 'Yksi liian vähän. Laskitko lähtöluvun mukaan? Ensimmäinen askel on seuraava luku.', [a + b + 1]: 'Yksi liian paljon. Lähtölukua ei lasketa askeleeksi.', ...(small > 0 && Math.abs(a - b) !== a + b ? { [Math.abs(a - b)]: 'Tämä on miinuslaskun vastaus. Plus lisää.' } : {}) },
        });
      },
      turn: (r) => {
        const a = r.int(1, 3), b = r.int(5, 10 - a);
        return {
          say: `Mikä lasku antaa saman vastauksen kuin ${a} + ${b}?`,
          task: choose(r, ex(`${b} + ${a}`), [ex(`${b} − ${a}`), ex(`${a} + ${b + 1}`)], [`${b} − ${a} = ${b - a}, ei ${a + b}. Miinus vie pois, plus lisää.`, `${a} + ${b + 1} = ${a + b + 1}: luku ${b} muuttui luvuksi ${b + 1}.`]),
          hint: 'Samat luvut, samat merkit, vain järjestys vaihtuu.',
          explain: `Järjestyksen voi vaihtaa: ${a} + ${b} = ${b} + ${a} = ${a + b}. Kätevintä on aloittaa isommasta, ${b}.`,
        };
      },
      double: (r) => {
        const near = r.chance(0.5), a = near ? r.int(1, 4) : r.int(1, 5);
        return near
          ? { ...ask(`${a} + ${a + 1} = ?`, 2 * a + 1, `${a} + ${a} = ${2 * a}, ja yksi lisää: ${2 * a + 1}.`, { hint: `Tupla ${a} + ${a} ja yksi lisää.`, whyAt: { [2 * a]: `${2 * a} on tupla ${a} + ${a}. Toinen luku on ${a + 1}: lisää vielä yksi.`, [2 * a + 2]: `${2 * a + 2} on tupla ${a + 1} + ${a + 1}. Tässä vain toinen luku on ${a + 1}.` } }), scene: doubleScene('simpukka', a, true, false) }
          : ask(`${a} + ${a} = ?`, 2 * a, `Tupla: ${a} + ${a} = ${2 * a}.`, { hint: `Tupla: ${word(a)} ja sen kaksonen.`, whyAt: { [a]: `${a} on vain toinen puoli. Tupla on kaksi kertaa ${a}.`, [2 * a + 1]: 'Yksi liikaa: tupla on täsmälleen kaksi yhtä suurta osaa.' } });
      },
      race: (r) => {
        const small = r.int(1, 3), big = r.int(5, 10 - small);
        return {
          say: `Loikka laskee ${small} + ${big} ja aloittaa isommasta luvusta ${big}. Napauta kivi, jolle se päätyy.`,
          task: { kind: 'line' as const, min: 0, max: 10, step: 1, answer: small + big, whyAt: { [big]: 'Loikka on vasta lähtökivellä. Hyppää eteenpäin.', [small + big - 1]: `Lähtökivi ${big} ei ole hyppy. Ensimmäinen hyppy vie kivelle ${big + 1}.`, [small]: `Aloita isommasta luvusta ${big}, ei luvusta ${small}.` } },
          hint: `Lähde kiveltä ${big} ja hyppää ${small === 1 ? 'kerran' : `${word(small)} kertaa`}: ${big + 1}…`,
          explain: `${big} + ${small} = ${small + big}${small > 1 ? `: ${Array.from({ length: small }, (_, i) => big + 1 + i).join(', ')}` : ''}.`,
        };
      },
    }, (r) => {
      const a = r.int(2, 6), b = r.int(1, 10 - a);
      return ask(`Rannalla on ${word(a)} sorsaa. ${cap(word(b))} lisää ui paikalle. Montako sorsaa on nyt?`, a + b, `Tuli lisää, joten plus: ${a} + ${b} = ${a + b}.`, { hint: `Sorsia oli ${a} ja lisää tuli ${b}. Aloita isommasta luvusta.`, whyAt: { [b]: `${b} on vain uudet sorsat. Lisää myös ne ${a}, jotka olivat jo rannalla.`, [a]: `${a} oli ennen. Uudet ${b} tulivat lisää.`, ...(a !== b ? { [Math.abs(a - b)]: 'Sorsia tuli lisää, ei lähtenyt pois: plus.' } : {}) } });
    }),
  },
  // ============================================================ subtraction facts to 10
  {
    id: 'M-SUB-FACT-10', rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV], stop: 'Miinussimpukat', icon: '➖',
    goal: 'Opit vähennyslaskut kymmeneen asti ajattelemalla yhteenlaskua.',
    intro: 'Kun simpukoita viedään pois, montako jää? Plussalasku auttaa.',
    reward: 'Pienet miinuslaskut sujuvat: ajattelet yhteenlaskua!',
    demo: () => [
      { say: 'Lautasella on seitsemän simpukkaa. Loikka syö kolme. Montako jää? Seitsemän miinus kolme on neljä.', scene: takeAway('simpukka', 7, 3) },
      { say: 'Yhdeksän miinus kuusi. Ajattele: kuusi ja montako on yhdeksän? Loikka hyppää kuutoselta yhdeksään ja laskee hypyt: yksi, kaksi, kolme.', scene: countUpScene(6, 9) },
      { say: 'Kun otetaan pois vähän, voi laskea taaksepäin: kahdeksan miinus kaksi: seitsemän, kuusi.', scene: lineHops(8, -2, 0, 10) },
    ],
    item: cases({
      fact: (r) => {
        const c = r.int(2, 10), b = r.int(1, c);
        const d = c - b;
        return ask(`${c} − ${b} = ?`, d, `${b} + ${d} = ${c}, joten ${c} − ${b} = ${d}.`, { hint: `Ajattele: ${b} ja montako on ${c}?`, whyAt: { ...(c + b <= 20 ? { [c + b]: `${c} + ${b} = ${c + b}. Miinus vie pois, joten vastaus on pienempi kuin ${c}.` } : {}), ...(d > 0 ? { [d - 1]: `Yksi liian vähän. Tarkista: ${b} + ${d - 1} = ${b + d - 1}, ei ${c}.` } : {}), [d + 1]: `Yksi liikaa. Tarkista: ${b} + ${d + 1} = ${c + 1}, ei ${c}.` } });
      },
      think: (r) => {
        const c = r.int(5, 10), b = r.int(2, c - 1);
        return {
          say: `Mikä yhteenlasku auttaa laskemaan ${c} − ${b}?`,
          task: choose(r, ex(`${b} + ${c - b} = ${c}`), [ex(`${c} + ${b} = ${c + b}`), ex(`${b} + ${c} = ${b + c}`)], [`Tässä koko on ${c + b}, ei ${c}. Hyvässä apulaskussa ${c} on vastaus.`, `Tässä ${c} on osa, ei koko. Apulaskussa ${b} ja jokin luku ovat yhdessä ${c}.`]),
          hint: `Etsi lasku, jossa on ${b} ja jonka vastaus on ${c}.`,
          explain: `${b} + ${c - b} = ${c}, joten ${c} − ${b} = ${c - b}.`,
        };
      },
      left: (r) => {
        const c = r.int(4, 8), b = r.int(1, c - 1), k = r.pick(FOOD);
        return {
          say: `Lautasella oli ${c} ${many(k, c)}. Loikka söi ${word(b)}. Montako jäi?`,
          scene: takeAway(k, c, b, { counter: false }),
          task: pickNum(r, c - b, [c + b, b, c - b + 1], [`${c + b} on ${c} + ${b}. Loikka söi, joten määrä pieneni.`, `${b} on se, minkä Loikka söi. Kysytään, montako jäi.`, 'Yksi liikaa. Laske lautasella näkyvät uudelleen.']),
          hint: `Laske, montako lautaselle jäi. Tai ajattele: ${b} ja montako on ${c}?`,
          explain: `${c} − ${b} = ${c - b}, koska ${b} + ${c - b} = ${c}.`,
        };
      },
      up: (r) => {
        const c = r.int(5, 10), b = r.int(c - 4, c - 1), n = c - b;
        return { ...ask(`${c} − ${b} = ?  Loikka hyppää kiveltä ${b} kivelle ${c}. Montako hyppyä?`, n, `${b} + ${n} = ${c}, joten ${c} − ${b} = ${n}.`, {
          hint: `Laske hypyt: ${b + 1} on ensimmäinen, ${b + 2} toinen…`,
          whyAt: { ...(b !== n ? { [b]: `${b} on lähtökivi. Kysytään hyppyjen määrää.` } : {}), [c]: `${c} on maalikivi. Laske vain hypyt kiveltä ${b} alkaen.`, [n + 1]: `Lähtökivi ${b} ei ole hyppy. Ensimmäinen hyppy vie kivelle ${b + 1}.` },
        }), scene: countUpScene(b, c, false) };
      },
    }, (r) => {
      const a = r.int(5, 8), b = r.int(1, a - 1);
      return { ...ask(`Loikalla on ${word(a)} kiveä, Aavalla ${word(b)}. Montako kiveä Loikalla on enemmän?`, a - b, `Erotus: ${a} − ${b} = ${a - b}. Pareiksi jää ${word(a - b)} ilman paria.`, { hint: 'Vertaa: montako Aavalta puuttuu, että hänellä olisi yhtä monta?', whyAt: { [a]: `${a} on kaikki Loikan kivet. Kysytään, montako enemmän kuin Aavalla.`, [a + b]: `${a + b} on kaikki kivet yhteensä. Kysytään eroa.`, ...(b !== a - b ? { [b]: `${b} on Aavan kivet. Kysytään, montako Loikalla on enemmän.` } : {}) } }), scene: pairScene('kivi', a, b, false) };
    }),
  },
  // ============================================================ mixed facts to 10
  {
    id: 'M-ADD-FACT-01', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Simpukkakisa', icon: '🏁',
    goal: 'Opit valitsemaan plussan tai miinuksen ja laskemaan sen varmasti.',
    intro: 'Kisassa tulee sekaisin plussa- ja miinuslaskuja. Katso merkki tarkasti!',
    reward: 'Plussat ja miinukset sujuvat sekaisinkin!',
    demo: () => [
      { say: 'Kuusi simpukkaa, ja aallot tuovat kolme lisää. Tuli lisää, joten plus: kuusi plus kolme on yhdeksän.', scene: signScene('simpukka', 6, 3, '+') },
      { say: 'Kuusi simpukkaa, ja aallot vievät kolme pois. Lähti pois, joten miinus: kuusi miinus kolme on kolme. Samat luvut, eri merkki, eri vastaus!', scene: signScene('simpukka', 6, 3, '−') },
      { say: 'Tarinan sanat kertovat merkin. Lammella oli seitsemän sammakkoa, kaksi hyppäsi pois, viisi jäi.', scene: translateScene([['oli seitsemän', '7'], ['kaksi pois', '− 2'], ['jäi viisi', '= 5']]) },
    ],
    item: cases({
      mixed: (r) => {
        const plus = r.chance(0.5);
        if (plus) { const a = r.int(1, 8), b = r.int(1, 10 - a); return ask(`${a} + ${b} = ?`, a + b, `Plus lisää: ${a} + ${b} = ${a + b}.`, { hint: 'Katso merkki: plus lisää, joten vastaus on isompi.', whyAt: a !== b ? { [Math.abs(a - b)]: `Tämä on miinuslaskun vastaus. Merkki on plus: ${a} + ${b}.` } : {} }); }
        const c = r.int(3, 10), b = r.int(1, c); return ask(`${c} − ${b} = ?`, c - b, `Miinus vähentää: ${c} − ${b} = ${c - b}, koska ${b} + ${c - b} = ${c}.`, { hint: `Katso merkki: miinus vähentää. Ajattele: ${b} ja montako on ${c}?`, whyAt: { [c + b]: `Tämä on pluslaskun vastaus. Merkki on miinus: ${c} − ${b}.` } });
      },
      story: (r) => {
        const plus = r.chance(0.5), a = r.int(4, 8), b = r.int(1, plus ? 10 - a : a - 1);
        return {
          say: plus ? `Lammella oli ${word(a)} sammakkoa. ${cap(word(b))} tuli lisää. Mikä lasku kertoo, montako nyt on?` : `Lammella oli ${word(a)} sammakkoa. ${cap(word(b))} hyppäsi pois. Mikä lasku kertoo, montako jäi?`,
          task: choose(r, ex(plus ? `${a} + ${b}` : `${a} − ${b}`), [ex(plus ? `${a} − ${b}` : `${a} + ${b}`), ex(plus ? `${a} + ${b + 1}` : `${a} − ${b + 1}`)], [plus ? `Sammakoita tuli lisää, joten määrä kasvaa: plus, ei miinus.` : `Sammakoita hyppäsi pois, joten määrä pienenee: miinus, ei plus.`, `Tarinassa ${plus ? 'tuli' : 'hyppäsi'} ${word(b)}, ei ${word(b + 1)}.`]),
          hint: plus ? 'Mikä sana kertoo, mitä tapahtui? Tuli lisää vai lähti pois?' : 'Mikä sana kertoo, mitä tapahtui? Tuli lisää vai lähti pois?',
          explain: plus ? `Tuli lisää: ${a} + ${b} = ${a + b}.` : `Lähti pois: ${a} − ${b} = ${a - b}.`,
        };
      },
      sign: (r) => {
        const plus = r.chance(0.5), a = r.int(4, 8), b = r.int(1, plus ? 10 - a : a - 1), c = plus ? a + b : a - b;
        return {
          say: `Kumpi merkki puuttuu? ${a} □ ${b} = ${c}`,
          task: choose(r, t(plus ? '+' : '−'), [t(plus ? '−' : '+')], [plus ? `${a} − ${b} = ${a - b}, ei ${c}. Vastaus on isompi kuin ${a}, joten lisättiin.` : `${a} + ${b} = ${a + b}, ei ${c}. Vastaus on pienempi kuin ${a}, joten vähennettiin.`]),
          hint: `Onko vastaus ${c} isompi vai pienempi kuin ${a}?`,
          explain: plus ? `${c} on enemmän kuin ${a}, joten lisättiin: ${a} + ${b} = ${c}.` : `${c} on vähemmän kuin ${a}, joten vähennettiin: ${a} − ${b} = ${c}.`,
        };
      },
      missing: (r) => {
        const a = r.int(1, 8), b = r.int(1, 10 - a);
        return { ...ask(`${a} + □ = ${a + b}. Mikä luku on ruudussa?`, b, `${a} + ${b} = ${a + b}. Sen voi laskea myös: ${a + b} − ${a} = ${b}.`, { hint: `Näkyvissä on ${a}. Laske ${a}:sta eteenpäin ${a + b}:ään asti.`, whyAt: { [a + b]: `${a + b} on koko. Ruudussa on osa, joka puuttuu ${a}:sta.`, [2 * a + b]: `Laskit ${a} + ${a + b}. Ruudussa on luku, jonka kanssa ${a} on yhteensä ${a + b}.` } }), scene: cupScene('simpukka', a + b, a, false) };
      },
    }, (r) => {
      const a = r.int(3, 7), b = r.int(1, 3), c = r.int(1, a);
      const end = a + b - c;
      return ask(`Korissa on ${word(a)} marjaa. Aava lisää ${word(b)} ja Loikka syö ${c === 1 ? 'yhden' : word(c)}. Montako korissa on nyt?`, end, `Ensin lisää: ${a} + ${b} = ${a + b}. Sitten pois: ${a + b} − ${c} = ${end}.`, { hint: `Tee kaksi laskua: ensin ${a} + ${b}, sitten pois ${c}.`, whyAt: { [a + b]: `${a + b} on määrä, kun Aava lisäsi. Loikka söi vielä ${c}.`, [a - c]: `Muista myös Aavan lisäämät ${b}.`, [a + b + c]: 'Loikka söi, joten marjoja on vähemmän, ei enemmän.' } });
    }),
  },
  // ============================================================ addition to 20
  {
    id: 'M-ADD-20', rev: LAUNCH_REV, validRevs: [AUDIT_REV, LAUNCH_REV], stop: 'Kympin yli', icon: '🌉',
    goal: 'Opit yhteenlaskut 20:een asti täydentämällä ensin kymppiin.',
    intro: 'Kun summa menee yli kympin, täytä ensin kymppi ja lisää loput.',
    reward: 'Hyppäät kympin yli varmasti!',
    demo: () => [
      { say: 'Kahdeksan plus viisi. Ruudukossa on kahdeksan. Kaksi täyttää kympin. Viidestä jää kolme, ja ne menevät seuraavaan ruudukkoon. Kymmenen ja kolme on kolmetoista.', scene: bridgeScene('simpukka', 8, 5) },
      { say: 'Lukusuoralla sama: kahdeksasta hypätään ensin kaksi tasakymppiin, sitten loput kolme. Kahdeksan plus kaksi plus kolme on kolmetoista.', scene: jumpsScene(0, 20, 8, [2, 3], 10) },
      { say: 'Jos kymppi on jo valmiina, lasketaan vain ykköset: kaksitoista plus neljä. Kaksi ja neljä on kuusi, joten kuusitoista.', scene: jumpsScene(0, 20, 12, [4], 10) },
    ],
    item: cases({
      bridge: (r) => {
        const a = r.int(6, 9), b = r.int(11 - a, 9);
        const fill = 10 - a, rest = b - fill;
        return { ...ask(`${a} + ${b} = ?`, a + b, `${a} + ${fill} = 10, ja vielä ${rest}: ${a + b}.`, { hint: `Täytä ensin kymppi: ${a} + ${fill} = 10. Montako jää luvusta ${b}?`, whyAt: { [a + b - 1]: 'Yksi liian vähän. Laske ruudut uudelleen.', [a + b + 1]: 'Yksi liikaa. Laske ruudut uudelleen.', [rest]: `${rest} on vain loppuosa. Kymppi on myös mukana: 10 + ${rest}.`, [10 + b]: `Ruudukossa oli ${a}, ei 10. Kympin täyttämiseen meni ${fill}.` } }), scene: bridgeScene('simpukka', a, b, false) };
      },
      teen: (r) => {
        const a = r.int(11, 15), b = r.int(1, 19 - a);
        return ask(`${a} + ${b} = ?`, a + b, `Ykköset: ${a - 10} + ${b} = ${a - 10 + b}. Kymppi pysyy: ${a + b}.`, { hint: `Kymppi on jo valmiina. Laske ykköset: ${a - 10} + ${b}.`, whyAt: { [a - 10 + b]: `Ykköset oikein, mutta kymppi puuttuu: 10 + ${a - 10 + b}.`, [a + b + 10]: 'Kymppi lasketaan vain kerran.' } });
      },
      split: (r) => {
        const a = r.int(6, 9), b = r.int(11 - a, 9), fill = 10 - a, rest = b - fill;
        return {
          say: `Miten jaat luvun ${b}, jotta ensimmäinen osa vie luvusta ${a} seuraavaan tasakymppiin laskussa ${a} + ${b}?`,
          ...(() => { const ws = alts(r, fill, [fill + 1, fill - 1, 1], 2, 1, b - 1); return { task: choose(r, ex(`${fill} + ${rest}`), ws.map((x) => ex(`${x} + ${b - x}`)), ws.map((x) => `${a} + ${x} = ${a + x}, ${a + x > 10 ? 'yli' : 'ei vielä'} kymppi. Ensimmäisen osan pitää täyttää kymppi tasan.`)) }; })(),
          hint: `Montako luvusta ${a} puuttuu kymppiin?`,
          explain: `${a} + ${fill} = 10. Sitten 10 + ${rest} = ${a + b}.`,
        };
      },
      chain: (r) => {
        const a = r.int(6, 9), b = r.int(11 - a, 9), fill = 10 - a, rest = b - fill;
        return {
          say: `Kirjoita ${a} + ${b} kympin kautta: ensin ${a}, sitten kympin täyttävä osa, sitten loput.`,
          scene: jumpsScene(0, 20, a, [fill, rest], 10, true),
          task: { kind: 'build' as const, mode: 'seq' as const, target: `${a} + ${fill} + ${rest}`, tokens: r.shuffle([...new Set([a, fill, rest, b, 10].map(String))]).concat(['+']), max: 5 },
          hint: `${a} + ? = 10. Sitten ${b}:stä jää loput.`,
          explain: `${a} + ${b} = ${a} + ${fill} + ${rest} = 10 + ${rest} = ${a + b}.`,
        };
      },
    }, (r) => {
      const a = r.int(7, 9), b = r.int(4, 9);
      return ask(`Loikka keräsi ${word(a)} simpukkaa ja Aava ${word(b)}. Montako simpukkaa he keräsivät yhteensä?`, a + b, `${a} + ${10 - a} = 10, ja vielä ${b - (10 - a)}: ${a + b}.`, { hint: `Täytä ensin kymppi: ${a} + ${10 - a}. Montako Aavan simpukoista jää?`, whyAt: { [b - (10 - a)]: `Se on vain loppuosa. Lisää kymppi: 10 + ${b - (10 - a)}.`, [a + b - 1]: 'Yksi liian vähän.', [a + b + 1]: 'Yksi liikaa.' } });
    }),
  },
  // ============================================================ subtraction to 20
  {
    id: 'M-SUB-20', rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV], stop: 'Kympin ali', icon: '🪜',
    goal: 'Opit vähennyslaskut 20:een asti menemällä ensin kymppiin.',
    intro: 'Kun vähennät yli kympin, mene ensin kymppiin ja ota loput sieltä.',
    reward: 'Laskeudut kympin ali varmasti!',
    demo: () => [
      { say: 'Neljätoista miinus kuusi. Ensin lähtevät irralliset neljä, niin jää tasan kymmenen. Sitten vielä kaksi kympistä: kahdeksan.', scene: bridgeDownScene('simpukka', 14, 6) },
      { say: 'Lukusuoralla sama: neljästätoista hypätään ensin neljä taaksepäin kymppiin, sitten vielä kaksi.', scene: jumpsScene(0, 20, 14, [-4, -2], 10) },
      { say: 'Voit myös ajatella yhteenlaskua: kuusi ja montako on neljätoista? Kuudesta kymppiin neljä, kympistä neljääntoista neljä: yhteensä kahdeksan.', scene: jumpsScene(0, 20, 6, [4, 4], 10) },
    ],
    item: cases({
      bridge: (r) => {
        const a = r.int(11, 17), o = a - 10, b = r.int(o + 1, 9), d = a - b;
        return { ...ask(`${a} − ${b} = ?`, d, `${a} − ${o} = 10, ja vielä ${b - o} pois: ${d}.`, { hint: `Mene ensin kymppiin: ${a} − ${o} = 10. Montako luvusta ${b} on vielä jäljellä?`, whyAt: { [d - 1]: 'Yksi liian vähän. Tarkista: lähti tasan ' + b + '.', [d + 1]: 'Yksi liikaa. Tarkista: lähti tasan ' + b + '.', [10 + b - o]: `Ykkösistä ei voi ottaa ${b}, kun niitä on vain ${o}. Ota ensin ${o}, sitten ${b - o} kympistä.`, [a + b]: 'Tämä on pluslaskun vastaus. Miinus vie pois.' } }), scene: bridgeDownScene('simpukka', a, b, false) };
      },
      noBridge: (r) => {
        const a = r.int(13, 19), b = r.int(1, a - 10);
        return ask(`${a} − ${b} = ?`, a - b, `Ykkösistä: ${a - 10} − ${b} = ${a - 10 - b}. Kymppi jää: ${a - b}.`, { hint: `Ykkösiä on ${a - 10}, ja niistä riittää ${b} pois. Kymppi ei muutu.`, whyAt: { ...(a - 10 - b !== a - b ? { [a - 10 - b]: `Ykköset oikein, mutta kymppi jää: 10 + ${a - 10 - b}.` } : {}), [a + b]: 'Tämä on pluslaskun vastaus. Miinus vie pois.' } });
      },
      think: (r) => {
        const a = r.int(11, 17), b = r.int(a - 9, 9);
        return {
          say: `Mikä yhteenlasku auttaa laskemaan ${a} − ${b}?`,
          task: choose(r, ex(`${b} + ${a - b} = ${a}`), [ex(`${a} + ${b} = ${a + b}`), ex(`${b} + ${a - b + 1} = ${a + 1}`)], [`Tässä ${a} on osa ja koko on ${a + b}. Apulaskussa ${a} on vastaus.`, `Tämän vastaus on ${a + 1}, ei ${a}.`]),
          hint: `Etsi lasku, jossa on ${b} ja vastaus on ${a}.`,
          explain: `${b} + ${a - b} = ${a}, joten ${a} − ${b} = ${a - b}.`,
        };
      },
      steps: (r) => {
        const a = r.int(11, 17), o = a - 10, b = r.int(o + 1, 9);
        return {
          say: `Kirjoita ${a} − ${b} kympin kautta: ensin ${a}, sitten ota kymppiin asti, sitten loput.`,
          scene: jumpsScene(0, 20, a, [-o, -(b - o)], 10, true),
          task: { kind: 'build' as const, mode: 'seq' as const, target: `${a} − ${o} − ${b - o}`, tokens: r.shuffle([...new Set([a, o, b - o, b, 10].map(String))]).concat(['−']), max: 5 },
          hint: `${a} − ? = 10. Sitten luvusta ${b} jää loput.`,
          explain: `${a} − ${b} = ${a} − ${o} − ${b - o} = 10 − ${b - o} = ${a - b}.`,
        };
      },
    }, (r) => {
      const a = r.int(12, 18), b = r.int(a - 9, 9), o = a - 10;
      return ask(`Rannalla on ${a} sorsaa. ${cap(word(b))} lentää pois. Montako sorsaa jää?`, a - b, b > o ? `${a} − ${o} = 10, ja vielä ${b - o} pois: ${a - b}.` : `${a} − ${b} = ${a - b}.`, { hint: b > o ? `Ensin kymppiin: ${a} − ${o} = 10.` : `Ykkösiä riittää: ${o} − ${b}.`, whyAt: { [a + b]: 'Sorsia lähti pois, joten niitä jää vähemmän.', ...(b !== a - b ? { [b]: `${b} on lähteneet sorsat. Kysytään, montako jää.` } : {}) } });
    }),
  },
  // ============================================================ decomposing for mental calculation
  {
    id: 'M-MENTAL-01', rev: LAUNCH_REV, validRevs: [AUDIT_REV, LAUNCH_REV], stop: 'Fiksu jako', icon: '🧩',
    goal: 'Opit hajottamaan luvun niin, että laskeminen helpottuu.',
    intro: 'Lautan rakentajat laskevat päässä. Temppu: jaa luku sopiviin osiin.',
    reward: 'Jaat luvut fiksusti: päässälasku helpottuu!',
    demo: () => [
      { say: 'Kolmekymmentäkahdeksan plus seitsemän. Seitsemän jaetaan kahteen osaan. Leikataan niin, että ensimmäinen osa vie tasakymppiin: kaksi ja viisi. 38 + 2 = 40, ja viisi lisää: 45.', scene: cutScene(38, 7) },
      { say: 'Lukusuoralla sama näyttää kahdelta hypyltä: ensin kaksi tasakymppiin 40, sitten viisi lisää.', scene: jumpsScene(36, 48, 38, [2, 5], 40) },
      { say: 'Miinuksessa leikataan samoin: 53 − 8. Ensin kolme pois, niin päästään tasan 50:een, sitten loput viisi: 45.', scene: cutScene(53, 8, '-') },
      { say: 'Ison luvun voi jakaa kymppeihin ja ykkösiin: 46 + 24 = 46 + 20 + 4. Ensin hyppy 20, sitten 4.', scene: jumpsScene(44, 72, 46, [20, 4], 66) },
    ],
    item: cases({
      toTen: (r) => {
        const t1 = r.int(2, 7), o = r.int(6, 9), a = t1 * 10 + o, b = r.int(11 - o, 9), fill = 10 - o;
        return {
          say: `Miten jaat luvun ${b}, jotta ensimmäinen osa vie luvusta ${a} seuraavaan tasakymppiin laskussa ${a} + ${b}?`,
          task: (() => { const ws = alts(r, fill, [fill + 1, fill - 1, 1], 2, 1, b - 1); return choose(r, ex(`${fill} + ${b - fill}`), ws.map((x) => ex(`${x} + ${b - x}`)), ws.map((x) => `${a} + ${x} = ${a + x}. Se ei ole tasakymppi.`)); })(),
          hint: `Paljonko luvusta ${a} puuttuu seuraavaan tasakymppiin ${a + fill}?`,
          explain: `${a} + ${fill} = ${a + fill}. Sitten ${a + fill} + ${b - fill} = ${a + b}.`,
        };
      },
      tensOnes: (r) => {
        const n = r.int(21, 89);
        if (n % 10 === 0) return ask(`${n} = ${n - 10} + □`, 10, `${n - 10} + 10 = ${n}.`, { hint: `Tasakymppien välissä on aina yksi kymppi.`, whyAt: { 1: `${n - 10} + 1 = ${n - 9}, ei ${n}. Väli on kokonainen kymppi.`, [n - 10]: `${n - 10} on jo mukana. Kysytään, paljonko siihen lisätään.` } });
        return {
          say: `Miten ${n} jaetaan kymppeihin ja ykkösiin?`,
          task: choose(r, ex(`${n - (n % 10)} + ${n % 10}`), [ex(`${Math.floor(n / 10)} + ${n % 10}`), ex(`${n - (n % 10) - 10} + ${(n % 10) + 1}`)], [`${Math.floor(n / 10)} on kymppien määrä. ${Math.floor(n / 10)} kymppiä on ${n - (n % 10)}.`, `${n - (n % 10) - 10} + ${(n % 10) + 1} = ${n - 9}, ei ${n}.`]),
          hint: `Montako kymppiä luvussa ${n} on? Jokainen kymppi on kymmenen.`,
          explain: `${n} = ${n - (n % 10)} + ${n % 10}.`,
        };
      },
      use: (r) => {
        const a = r.int(25, 68), b = r.pick([11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29]), bt = b - (b % 10), bo = b % 10;
        return ask(`${a} + ${b} = ?`, a + b, `${a} + ${bt} = ${a + bt}, ja vielä ${bo}: ${a + b}.`, { hint: `Jaa ${b} kymppeihin ja ykkösiin: ${bt} + ${bo}. Lisää ensin ${bt}.`, whyAt: { [a + b - 10]: `Yksi kymppi jäi pois: ${b} sisältää ${bt / 10 === 1 ? 'yhden kympin' : `${bt / 10} kymppiä`}.`, [a + b + 10]: `Kymppejä tuli yksi liikaa: ${a} + ${bt} = ${a + bt}.`, [a + bo]: `Muista myös kympit: ${a} + ${bt} = ${a + bt}.`, [a + bt]: `Kympit on lisätty, mutta ykköset ${bo} puuttuvat vielä.` } });
      },
      cut: (r) => {
        const sub = r.chance(0.4), b = r.int(5, 9);
        const a = sub ? r.int(3, 8) * 10 + r.int(1, b - 1) : r.int(2, 7) * 10 + r.int(11 - b, 9);
        return {
          say: sub ? `Lasketaan ${a} − ${b}. Leikkaa ${b} kahteen osaan niin, että ensimmäinen osa vie alas tasakymppiin.` : `Lasketaan ${a} + ${b}. Leikkaa ${b} kahteen osaan niin, että ensimmäinen osa vie tasakymppiin.`,
          task: { kind: 'cut' as const, a, b, op: sub ? '-' as const : '+' as const },
          hint: sub ? `Montako pitää ottaa pois luvusta ${a}, jotta päästään tasan ${a - (a % 10)}:een?` : `Paljonko luvusta ${a} puuttuu tasakymppiin ${a + 10 - (a % 10)}?`,
          explain: sub ? `${a} − ${a % 10} = ${a - (a % 10)}, sitten vielä ${b - (a % 10)} pois: ${a - b}.` : `${a} + ${10 - (a % 10)} = ${a + 10 - (a % 10)}, sitten ${b - 10 + (a % 10)} lisää: ${a + b}.`,
        };
      },
    }, (r) => {
      const b = r.int(6, 9), need = r.int(1, b - 1), a = r.int(4, 7) * 10 + need;
      return {
        say: `Lasketaan ${a} − ${b}. Miten jaat luvun ${b}, jotta ensimmäinen osa vie alaspäin tasakymppiin?`,
        task: (() => { const ws = alts(r, need, [need + 1, need - 1, b - 1], 2, 1, b - 1); return choose(r, ex(`${need} + ${b - need}`), ws.map((x) => ex(`${x} + ${b - x}`)), ws.map((x) => `${a} − ${x} = ${a - x}. Se ei ole tasakymppi.`)); })(),
        hint: `Montako pitää ottaa pois, jotta luvusta ${a} tulee tasan ${a - need}?`,
        explain: `${a} − ${need} = ${a - need}, sitten vielä ${b - need} pois: ${a - b}.`,
      };
    }),
  },
  // ============================================================ addition to 100
  {
    id: 'M-ADD-100', rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV], stop: 'Isot lautat', icon: '🛶',
    goal: 'Opit yhteenlaskut sataan asti: kympit kymppeihin, ykköset ykkösiin.',
    intro: 'Lautoille tarvitaan paljon kaisloja. Lasketaan nippuja ja yksittäisiä yhteen.',
    reward: 'Lasket yhteen sataan asti!',
    demo: () => [
      { say: 'Kolmekymmentäneljä plus kaksikymmentäviisi. Ensin niput lautalle: kymmenen, kaksikymmentä, … viisikymmentä. Sitten irtokaislat: yhdeksän. Yhteensä viisikymmentäyhdeksän.', scene: addReedsScene(34, 25) },
      { say: 'Neljäkymmentäseitsemän plus kolmekymmentäviisi. Niput: seitsemänkymmentä. Irtokaisloja tulee kaksitoista: kymmenestä sidotaan uusi nippu. Nyt on kahdeksan nippua ja kaksi irtokaislaa: 82.', scene: addReedsScene(47, 35) },
    ],
    item: cases({
      noCarry: (r) => {
        const a = r.int(1, 6), b = r.int(1, 8 - a), c = r.int(0, 5), e = r.int(0, 9 - c);
        const x = a * 10 + c, y = b * 10 + e;
        return ask(`${x} + ${y} = ?`, x + y, `Kympit ${a * 10} + ${b * 10} = ${(a + b) * 10}, ykköset ${c} + ${e} = ${c + e}. Yhteensä ${x + y}.`, { scene: reedsArt(a, c, 200) + reedsArt(b, e, 200), hint: `Kympit ensin: ${a * 10} + ${b * 10}. Sitten ykköset: ${c} + ${e}.`, whyAt: { ...(c + e > 0 ? { [(a + b) * 10]: `Kympit on laskettu. Lisää vielä ykköset ${c} + ${e}.` } : {}), [(a + b) * 10 + c + e + 10]: `Kymppejä on ${a + b}, ei ${a + b + 1}: ykköset eivät ylitä kymmentä.`, [a + b + c + e]: `Kymppi on kymmenen: ${a} kymppiä on ${a * 10}.` } });
      },
      carry: (r) => {
        const a = r.int(1, 6), b = r.int(1, 8 - a), c = r.int(3, 9), e = r.int(10 - c, 9);
        const x = a * 10 + c, y = b * 10 + e;
        return {
          say: `${x} + ${y} = ?`,
          scene: addReedsScene(x, y, false),
          task: pickNum(r, x + y, [x + y - 10, x + y + 10, x + y + 1], [`Ykkösiä tuli ${c + e}: niistä syntyy yksi nippu lisää. ${(a + b) * 10} + ${c + e} = ${x + y}.`, `Uusi nippu tuli vain yksi: ${(a + b) * 10} + 10 + ${c + e - 10} = ${x + y}.`, `Ykköset ${c} + ${e} = ${c + e}: ykkösiä jää ${c + e - 10}, ei ${c + e - 9}.`]),
          hint: `Ykköset ${c} + ${e} ovat yli kymmenen: kymmenestä tulee uusi nippu.`,
          explain: `Kympit ${(a + b) * 10}, ykköset ${c + e}. ${(a + b) * 10} + ${c + e} = ${x + y}.`,
        };
      },
      tens: (r) => {
        const x = r.int(12, 69), b = r.int(1, Math.floor((99 - x) / 10)) * 10;
        return ask(`${x} + ${b} = ?`, x + b, `Lisätään ${b / 10} ${b === 10 ? 'kymppi' : 'kymppiä'}: ykköset eivät muutu. ${x} + ${b} = ${x + b}.`, { hint: `${b} on ${b === 10 ? 'yksi nippu' : `${b / 10} nippua`}. Ykköset pysyvät samoina.`, whyAt: { [x + b / 10]: `Lisäsit ${b / 10} ykköstä. ${b} on ${b / 10} ${b === 10 ? 'kymppi' : 'kymppiä'}.`, [x + b + 10]: `Yksi kymppi liikaa: ${x} + ${b} = ${x + b}.`, [x + b - 10]: `Yksi kymppi puuttuu: ${b} on ${b / 10} ${b === 10 ? 'kymppi' : 'kymppiä'}.` } });
      },
      raft: (r) => {
        const a = r.int(1, 4), c = r.int(2, 9), b = r.int(1, 4), e = r.int(1, 9), x = a * 10 + c, y = b * 10 + e;
        return {
          say: `Lautalla on ${x} kaislaa. Tuo lisää ${y}. Kokoa lautta ja sido uusi nippu, jos irtokaisloja tulee kymmenen.`,
          task: { kind: 'reeds' as const, target: x + y, from: x },
          hint: c + e >= 10 ? `Ykkösiä tulee ${c} + ${e}: siitä riittää uuteen nippuun.` : `Lisää ensin ${b === 1 ? 'yksi nippu' : `${b} nippua`}, sitten ${e} irtokaislaa.`,
          explain: `${x} + ${y} = ${x + y}: ${Math.floor((x + y) / 10)} nippua ja ${(x + y) % 10} irtokaislaa.`,
        };
      },
    }, (r) => {
      const x = r.int(15, 45), y = r.int(15, 99 - x - 5), carry = (x % 10) + (y % 10) >= 10;
      return ask(`Ensimmäiseen lauttaan tarvitaan ${x} kaislaa ja toiseen ${y}. Montako kaislaa tarvitaan yhteensä?`, x + y, `Kympit ${x - (x % 10)} + ${y - (y % 10)} = ${x - (x % 10) + y - (y % 10)}, ykköset ${x % 10} + ${y % 10} = ${(x % 10) + (y % 10)}. Yhteensä ${x + y}.`, { hint: 'Yhteensä: lasketaan yhteen. Kympit ensin, sitten ykköset.', whyAt: { [x + y - (carry ? 10 : -10)]: carry ? `Ykkösistä syntyi uusi kymppi: ${(x % 10) + (y % 10)} ykköstä.` : 'Ykköset eivät ylitä kymmentä: uutta kymppiä ei tule.', [Math.abs(x - y)]: 'Kysytään yhteensä: luvut lasketaan yhteen.' } });
    }),
  },
  // ============================================================ subtraction to 100
  {
    id: 'M-SUB-100', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Kaislat käyttöön', icon: '🌾',
    goal: 'Opit vähennyslaskut sataan asti ja purat kympin, kun ykköset eivät riitä.',
    intro: 'Kaisloja käytetään lautan tekoon. Montako jää jäljelle?',
    reward: 'Vähennät sataan asti ja osaat purkaa kympin!',
    demo: () => [
      { say: 'Kuusikymmentäkahdeksan miinus kaksikymmentäviisi. Ensin viisi irtokaislaa pois, sitten kaksi nippua. Jäljelle jää neljäkymmentäkolme.', scene: subReedsScene(68, 25) },
      { say: 'Viisikymmentäkaksi miinus seitsemäntoista. Kahdesta ei voi ottaa seitsemää, eikä saa laskea väärin päin seitsemän miinus kaksi. Avataan nippu: nyt on kaksitoista irtokaislaa. Seitsemän pois, sitten yksi nippu pois. Jää kolmekymmentäviisi.', scene: subReedsScene(52, 17) },
      { say: 'Tarkistus: vastaus ja pois otettu yhteen. 35 + 17 = 52, joten lasku meni oikein.', scene: card('52 − 17 = 35', '35 + 17 = 52 ✓') },
    ],
    item: cases({
      noBorrow: (r) => {
        const a = r.int(4, 9), b = r.int(1, a - 1), c = r.int(4, 9), e = r.int(0, c);
        const x = a * 10 + c, y = b * 10 + e;
        return ask(`${x} − ${y} = ?`, x - y, `Kympit ${a * 10} − ${b * 10} = ${(a - b) * 10}, ykköset ${c} − ${e} = ${c - e}. Vastaus ${x - y}.`, { hint: `Ykköset ${c} − ${e}, kympit ${a * 10} − ${b * 10}.`, whyAt: { ...(c !== e ? { [(a - b) * 10]: `Kympit on vähennetty. Ykkösiä jää vielä ${c} − ${e} = ${c - e}.` } : {}), [x + y]: 'Kaisloja otetaan pois: vähennyslasku.', [x - y + 10]: `Kymppejä jää ${a - b}, ei ${a - b + 1}.`, [x - y - 10]: `Kymppejä jää ${a - b}: ykköset riittävät, nippua ei tarvitse avata.` } });
      },
      borrow: (r) => {
        const a = r.int(3, 9), b = r.int(1, a - 1), c = r.int(0, 6), e = r.int(c + 1, 9);
        const x = a * 10 + c, y = b * 10 + e, flip = (a - b) * 10 + (e - c);
        return {
          say: `${x} − ${y} = ?`,
          scene: subReedsScene(x, y, false),
          task: pickNum(r, x - y, [flip, x - y + 10, x - y - 1], [`Ykkösissä ${c} − ${e} ei onnistu suoraan. ${e} − ${c} on väärin päin: avaa yksi nippu.`, `Avattu nippu on poissa nipuista: kymppejä jää ${a - 1 - b}, ei ${a - b}.`, `Ykköset: ${c + 10} − ${e} = ${c + 10 - e}.`]),
          hint: `${c} ykköstä ei riitä: pura yksi kymppi kymmeneksi ykköseksi.`,
          explain: `${x} = ${(a - 1) * 10} + ${c + 10}. ${c + 10} − ${e} = ${c + 10 - e} ja ${(a - 1) * 10} − ${b * 10} = ${(a - 1 - b) * 10}. Vastaus ${x - y}.`,
        };
      },
      take: (r) => {
        const a = r.int(3, 7), c = r.int(0, 5), b = r.int(1, a - 2), e = r.int(c + 1, 9), x = a * 10 + c, y = b * 10 + e;
        return {
          say: `Rannalla on ${x} kaislaa. Lauttaan otetaan ${y}. Ota kaislat pois ja katso, montako jää.`,
          task: { kind: 'reeds' as const, target: x - y, from: x },
          hint: `${c} irtokaislaa ei riitä ${e}:n ottamiseen. Avaa ensin yksi nippu.`,
          explain: `${x} − ${y} = ${x - y}: avattu nippu antoi ${c + 10} irtokaislaa, ${c + 10} − ${e} = ${c + 10 - e}.`,
        };
      },
      check: (r) => {
        const x = r.int(40, 95), y = r.int(12, x - 10), d0 = x - y;
        return {
          say: `Aava laski ${x} − ${y} = ${d0}. Millä laskulla tarkistat?`,
          task: choose(r, ex(`${d0} + ${y} = ${x}`), [ex(`${x} + ${y} = ${x + y}`), ex(`${d0} + ${x} = ${d0 + x}`)], [`${x} + ${y} laskee yhteen alkuperäisen ja pois otetun. Se ei kerro, onko ${d0} oikein.`, `Vastaukseen ${d0} lisätään pois otettu ${y}, ei ${x}.`]),
          hint: 'Jos vastaus on oikein, vastaus + pois otettu = alkuperäinen luku.',
          explain: `${d0} + ${y} = ${x}. Vastaus on oikein.`,
        };
      },
    }, (r) => {
      const x = r.int(50, 99), y = r.int(15, x - 12), c = x % 10, e = y % 10;
      const wa: Record<number, string> = { [x + y]: 'Kaisloja käytettiin, joten niitä jäi vähemmän: vähennyslasku.' };
      if (c < e) wa[(Math.floor(x / 10) - Math.floor(y / 10)) * 10 + (e - c)] = `Ykkösissä ${c} − ${e} ei onnistu: avaa nippu. ${e} − ${c} on väärin päin.`;
      return ask(`Rannalla oli ${x} kaislaa. Lauttaan käytettiin ${y}. Montako kaislaa jäi?`, x - y, `${x} − ${y} = ${x - y}. Tarkistus: ${x - y} + ${y} = ${x}.`, { hint: c < e ? `${c} irtokaislaa ei riitä ${e}:n ottamiseen: avaa ensin nippu.` : `Ykköset ${c} − ${e}, sitten kympit.`, whyAt: wa });
    }),
  },
  // ============================================================ times tables 1–5, 10
  {
    id: 'M-MULTAB-LOW', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Kertopaja', icon: '✖️',
    goal: 'Opit kertotaulut 1, 2, 3, 4, 5 ja 10.',
    intro: 'Kertopajassa simpukoita lasketaan riveittäin. Kertotaulu on oikotie.',
    reward: 'Kertotaulut 1–5 ja 10 ovat hallussa!',
    demo: () => [
      { say: 'Kertolasku on rivistö. Kolme riviä, joissa jokaisessa viisi: lasketaan viisi kerrallaan. Viisi, kymmenen, viisitoista. Kolme kertaa viisi on viisitoista.', scene: rowsScene(3, 5) },
      { say: 'Kahden kertotaulu on tupla: kaksi kertaa seitsemän on seitsemän plus seitsemän, eli neljätoista.', scene: rowsScene(2, 7) },
      { say: 'Neljän kertotaulu on tuplan tupla: kaksi riviä, ja sama uudestaan. Neljä kertaa kuusi on kaksitoista plus kaksitoista, eli kaksikymmentäneljä.', scene: doubleRowsScene(6) },
      { say: 'Järjestyksen voi vaihtaa: kun rivistö käännetään, kolme riviä, joissa on neljä, muuttuu neljäksi riviksi, joissa on kolme. Marjoja on yhä kaksitoista.', scene: turnScene(3, 4) },
      { say: 'Viiden kertotaulu on puolet kymmenen kertotaulusta: kymmenen kertaa kuusi on kuusikymmentä, viisi kertaa kuusi puolet siitä, kolmekymmentä.', scene: card('10 × 6 = 60', '5 × 6 = 60 : 2 = 30') },
    ],
    item: cases({
      fact: (r) => {
        const a = r.pick([1, 2, 3, 4, 5, 10]), b = r.int(1, 10);
        const wa: Record<number, string> = {};
        if (a + b !== a * b) wa[a + b] = `${a} + ${b} on yhteenlasku. ${a} × ${b} tarkoittaa ${a} kertaa ${b}.`;
        if (a > 1) wa[a * b - b] = `Yksi ${b}:n rivi puuttuu: ${a - 1} × ${b} = ${(a - 1) * b}.`;
        wa[a * b + b] = `Yksi ${b}:n rivi liikaa: ${a + 1} × ${b} = ${(a + 1) * b}.`;
        return ask(`${a} × ${b} = ?`, a * b, `${a} × ${b} = ${a * b}.`, { hint: a === 1 ? `Yksi rivi, jossa ${b}.` : a === 2 ? `Tupla: ${b} + ${b}.` : a === 3 ? `Kolme riviä: ${b}, ${2 * b}, …` : a === 4 ? `Tuplan tupla: ${b} + ${b} = ${2 * b}, ja se tuplana.` : a === 5 ? `Puolet luvusta 10 × ${b} = ${10 * b}.` : `Kymmenen kertaa ${b}: ${b} kymppiä.`, whyAt: wa });
      },
      array: (r) => {
        const a = r.int(2, 5), b = r.int(2, 5);
        return {
          say: 'Montako marjaa on rivistössä?',
          scene: paint(arrayArt(a, b)),
          task: pickNum(r, a * b, [a + b, a * b + b, a * b - 1], [`${a} + ${b} laskee vain rivit ja yhden rivin marjat. Rivejä on ${a}, ja jokaisessa ${b}.`, `Rivejä on ${a}, ei ${a + 1}.`, `Laske rivi kerrallaan: ${Array.from({ length: a }, (_, i) => (i + 1) * b).join(', ')}.`]),
          hint: `Laske rivi kerrallaan: ${b}, ${2 * b}, …`,
          explain: `${a} riviä, joissa jokaisessa ${b}: ${a} × ${b} = ${a * b}.`,
        };
      },
      strategy: (r) => {
        const b = r.int(3, 9);
        return {
          say: `Mikä lasku auttaa laskemaan 4 × ${b}?`,
          task: choose(r, t(`2 × ${b} = ${2 * b} ja se tuplana`), [t(`4 + ${b} = ${4 + b}`), t(`3 × ${b} = ${3 * b} ja yksi lisää`)], [`Kertolasku ei ole yhteenlasku: 4 × ${b} on neljä ${b}:n riviä.`, `Neljäs rivi tuo lisää ${b}, ei yhtä.`]),
          hint: 'Neljä riviä on kaksi riviä ja vielä kaksi riviä.',
          explain: `4 × ${b} on tuplan tupla: 2 × ${b} = ${2 * b}, ja ${2 * b} + ${2 * b} = ${4 * b}.`,
        };
      },
      grid: (r) => {
        const a = r.int(2, 5), b = r.int(2, 8), f = r.pick(['marja', 'simpukka', 'kala']);
        return {
          say: `Rakenna rivistö ${a} × ${b}: ${word(a)} riviä, joissa jokaisessa ${word(b)}.`,
          task: { kind: 'grid' as const, rows: a, cols: b, thing: f },
          hint: `Lisää ensin rivejä, kunnes niitä on ${a}. Laita sitten jokaiseen ${b}.`,
          explain: `${a} riviä, joissa ${b}: ${a} × ${b} = ${a * b}.`,
        };
      },
    }, (r) => {
      const a = r.pick([2, 3, 4, 5, 10]), b = r.int(3, 9);
      return ask(`Loikka hyppää joka loikalla ${a} kiveä eteenpäin. Hän lähtee rannalta ja loikkaa ${b} kertaa. Monennellako kivellä hän on?`, a * b, `${b} loikkaa, joka kerta ${a}: ${b} × ${a} = ${a * b}.`, { scene: numberLineArt({ min: 0, max: a * b + a, labelEvery: a, jumps: [{ from: 0, to: a }, { from: a, to: 2 * a }] }), hint: `Laske loikat: ${a}, ${2 * a}, ${3 * a}, …`, whyAt: { [a + b]: `Loikkia on ${b}, ja jokainen on ${a} kiveä: ${b} × ${a}.`, [a * b - a]: `Yksi loikka jäi laskematta: loikkia on ${b}.`, [a * b + a]: `Yksi loikka liikaa: loikkia on ${b}.` } });
    }),
  },
  // ============================================================ inverse × and ÷
  {
    id: 'M-MULDIV-01', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Jakoperhe', icon: '🔄',
    goal: 'Opit, että jakolasku purkaa kertolaskun.',
    intro: 'Pussit pakataan ja puretaan. Kertolasku ja jakolasku ovat saman perheen laskuja.',
    reward: 'Tunnet kerto- ja jakolaskun perheet!',
    demo: () => [
      { say: 'Kolme pussia, joissa on neljä marjaa: kolme kertaa neljä on kaksitoista. Puretaan pussit ja pakataan marjat uudestaan neljä kerrallaan. Pusseja tulee taas kolme.', scene: unpackScene(3, 4) },
      { say: 'Sama toisilla luvuilla: neljä pussia, joissa viisi. Kaksikymmentä jaettuna viidellä on neljä.', scene: unpackScene(4, 5, true, 'simpukka') },
      { say: 'Yhdestä kertolaskusta saa kaksi jakolaskua. Kaikissa on samat kolme lukua, ja suurin luku eli tulo on jakolaskussa ensimmäisenä.', scene: card('3 × 4 = 12', '12 : 4 = 3', '12 : 3 = 4') },
    ],
    item: cases({
      family: (r) => {
        const a = r.int(2, 5); let b = r.int(2, 10); if (b === a) b++;
        const c = a * b;
        return {
          say: `${a} × ${b} = ${c}. Mikä jakolasku kuuluu samaan perheeseen?`,
          task: choose(r, ex(`${c} : ${b} = ${a}`), [ex(`${c} : ${a} = ${a}`), ex(`${b} : ${a} = ${c}`)], [`Tarkista kertolaskulla: ${a} × ${a} = ${a * a}, ei ${c}. Oikeassa perheessä on luvut ${a}, ${b} ja ${c}.`, `Jakolasku alkaa koko määrästä ${c}. ${b} : ${a} ei voi olla ${c}, koska jaettaessa pienempi luku ei kasva.`]),
          hint: `Perheen luvut ovat ${a}, ${b} ja ${c}. Jakolasku alkaa suurimmasta.`,
          explain: `${c} jaettuna ${b}:n ryhmiin antaa ${a} ryhmää, koska ${a} × ${b} = ${c}.`,
        };
      },
      factor: (r) => {
        const a = r.int(2, 5), b = r.int(2, 10);
        const whyAt: Record<number, string> = {};
        if (a * b !== a) whyAt[a * b] = `${a * b} on tulo. Ruutuun tulee luku, joka kerrotaan ${b}:llä.`;
        if (a * b - b !== a && a * b - b > 0) whyAt[a * b - b] = `Se on ${a * b} − ${b}. Kertolaskun pala löytyy jakolaskulla.`;
        if (b !== a && !(b in whyAt)) whyAt[b] = `${b} × ${b} = ${b * b}, ei ${a * b}.`;
        return ask(`□ × ${b} = ${a * b}. Mikä luku on ruudussa?`, a, `${a * b} : ${b} = ${a}, koska ${a} × ${b} = ${a * b}.`, { hint: `Montako ${b}:n pussia saa ${a * b}:stä? Laske ${b}, ${2 * b}, ${3 * b}…`, whyAt });
      },
      check: (r) => {
        const a = r.int(2, 5), b = r.int(2, 9), c = a * b;
        return {
          say: `Loikka laski ${c} : ${a} = ${b}. Millä kertolaskulla hän tarkistaa?`,
          task: choose(r, ex(`${b} × ${a} = ${c}`), [ex(`${c} × ${a} = ${c * a}`), ex(`${b} + ${a} = ${a + b}`)], [`Tässä kerrottiin jaettava ${c}. Tarkistuksessa kerrotaan vastaus ${b} jakajalla ${a}, ja tuloksen pitää olla ${c}.`, `${b} + ${a} ei palaa lukuun ${c}. Jakolaskun purkaa kertolasku.`]),
          hint: 'Kerro vastaus jakajalla. Tuleeko alkuperäinen luku?',
          explain: `${b} × ${a} = ${c}, joten jakolasku oli oikein.`,
        };
      },
      repack: (r) => {
        const b = r.int(2, 5); let a = r.int(2, 4); if (a === b) a++;
        return {
          say: `Aava purki ${word(a)} pussia, joissa oli ${word(b)} marjaa: ${a} × ${b} = ${a * b}. Pakkaa marjat taas pusseihin, ${word(b)} jokaiseen. Montako pussia tulee?`,
          task: { kind: 'bagup' as const, n: a * b, g: b, thing: 'marja' },
          hint: 'Täytä pusseja, kunnes kasa on tyhjä. Laske sitten pussit.',
          explain: `Pusseja tuli ${a}: ${a * b} : ${b} = ${a}, koska ${a} × ${b} = ${a * b}.`,
        };
      },
    }, (r) => {
      const a = r.int(3, 5), b = r.int(3, 8);
      const whyAt: Record<number, string> = {};
      if (a * b - a !== b) whyAt[a * b - a] = `Pussien määrä on pienempi: ${a * b} : ${a}.`;
      if (a !== b) whyAt[a] = `${a} on yhden pussin marjat. Kysytään pussien määrää.`;
      return ask(`${a * b} marjaa pakataan pusseihin, ${a} jokaiseen. Montako pussia tulee?`, b, `${a * b} : ${a} = ${b}, koska ${b} × ${a} = ${a * b}.`, { hint: `Mikä luku kertaa ${a} on ${a * b}?`, whyAt });
    }),
  },
  // ============================================================ division facts
  {
    id: 'M-DIV-FACT-01', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Jakopaja', icon: '➗',
    goal: 'Opit laskemaan helppoja jakolaskuja kertotaulun avulla.',
    intro: 'Jakolaskussa kysytään: mikä luku kerrottuna antaa tämän?',
    reward: 'Jakolaskut ratkeavat kertotaululla!',
    demo: () => [
      { say: 'Kaksikymmentä jaettuna viidellä. Loikka hyppii viisi kerrallaan: viisi, kymmenen, viisitoista, kaksikymmentä. Neljä hyppyä, joten vastaus on neljä.', scene: skipDivScene(20, 5) },
      { say: 'Jakolasku on myös reilu jako. Kaksitoista marjaa jaetaan kolmelle: kierros kerrallaan jokainen saa yhden, kunnes kasa loppuu.', scene: shareRoundScene('marja', 12, 3) },
      { say: 'Nopein tapa on kertotaulu. Kysy: viisi kertaa mikä on kaksikymmentä? Viisi kertaa neljä. Siis kaksikymmentä jaettuna viidellä on neljä.', scene: card('20 : 5 = ?', '5 × ? = 20', '5 × 4 = 20', '20 : 5 = 4') },
    ],
    item: cases({
      fact: (r) => {
        const a = r.pick([2, 3, 4, 5, 10]), b = r.int(1, 10);
        const whyAt: Record<number, string> = {};
        if (a !== b) whyAt[a] = `${a} on jakaja. Kysytään, montako ${a}:n ryhmää luvusta ${a * b} tulee.`;
        if (a * b !== b && a * b !== a) whyAt[a * b] = `${a * b} on jaettava. Jaettaessa saadaan pienempi luku.`;
        if (b + 1 !== a) whyAt[b + 1] = `${a} × ${b + 1} = ${a * (b + 1)}, ei ${a * b}.`;
        if (b > 1 && b - 1 !== a) whyAt[b - 1] = `${a} × ${b - 1} = ${a * (b - 1)}, ei ${a * b}.`;
        return ask(`${a * b} : ${a} = ?`, b, `${a} × ${b} = ${a * b}, joten ${a * b} : ${a} = ${b}.`, { hint: `Ajattele: ${a} × □ = ${a * b}.`, whyAt });
      },
      think: (r) => {
        const a = r.pick([2, 3, 4, 5]), b = r.int(3, 9);
        return {
          say: `Mikä kertolasku auttaa laskemaan ${a * b} : ${a}?`,
          task: choose(r, ex(`${a} × ${b} = ${a * b}`), [ex(`${a} × ${b + 1} = ${a * (b + 1)}`), ex(`${a * b} × ${a} = ${a * a * b}`)], [`Tulo on ${a * (b + 1)}, mutta etsimme lukua ${a * b}.`, `Jaettavaa ${a * b} ei kerrota. Etsitään kertolasku, jonka tulo on ${a * b}.`]),
          hint: `Etsi kertolasku, jossa on ${a} ja jonka tulo on ${a * b}.`,
          explain: `${a} × ${b} = ${a * b}, joten ${a * b} : ${a} = ${b}.`,
        };
      },
      share: (r) => {
        const a = r.pick([2, 3, 4, 5]), b = r.int(2, 6);
        return {
          say: `${a * b} marjaa jaetaan tasan ${a} ystävälle. Montako kukin saa?`,
          scene: paint(groupArt(r, 'marja', a * b, 'line', 300, 90, 20)),
          task: pickNum(r, b, [a, a * b - a, b + 1], [a === b ? '' : 'Se on ystävien määrä.', `Se on ${a * b} − ${a}. Jaossa jokainen saa osan, ei vähennetä kerran.`, `${a} × ${b + 1} = ${a * (b + 1)}: marjat eivät riitä siihen.`]),
          hint: `Kuvittele jako kierroksina: jokainen saa yhden. Montako kierrosta ennen kuin ${a * b} loppuu?`,
          explain: `${a * b} : ${a} = ${b}, koska ${a} × ${b} = ${a * b}.`,
        };
      },
      deal: (r) => {
        const a = r.pick([2, 3, 4]), b = r.int(2, 5), f = r.pick(['marja', 'kala', 'simpukka']);
        return {
          say: `Jaa ${a * b} ${many(f, a * b)} tasan ${a === 2 ? 'kahdelle' : a === 3 ? 'kolmelle' : 'neljälle'} ystävälle. Montako kukin saa?`,
          task: { kind: 'pack' as const, k: a, g: b, thing: f, pile: a * b },
          hint: 'Anna yksi kerrallaan jokaiseen pussiin vuorotellen, kunnes kasa loppuu.',
          explain: `Jokainen sai ${b}: ${a * b} : ${a} = ${b}, koska ${a} × ${b} = ${a * b}.`,
        };
      },
    }, (r) => {
      const a = r.pick([3, 4, 5]), b = r.int(3, 8);
      const whyAt: Record<number, string> = {};
      if (a !== b) whyAt[a] = `${a} on yhden veneen sammakot. Kysytään veneiden määrää.`;
      if (b + 1 !== a) whyAt[b + 1] = `${b} venettä riittää: ${b} × ${a} = ${a * b}. Ylimääräistä venettä ei tarvita.`;
      return ask(`Veneeseen mahtuu ${a} sammakkoa. Rannalla on ${a * b} sammakkoa. Montako venettä tarvitaan, jotta kaikki pääsevät kerralla?`, b, `${a * b} : ${a} = ${b}, koska ${b} × ${a} = ${a * b}.`, { hint: `Montako ${a}:n ryhmää luvusta ${a * b} tulee? ${a} × □ = ${a * b}.`, whyAt });
    }),
  },
  // ============================================================ writing a multiplication
  {
    id: 'M-MUL-02', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Kertolaskuksi', icon: '📝',
    goal: 'Opit kirjoittamaan yhtä suurten ryhmien tilanteen kertolaskuksi.',
    intro: 'Aava kirjoittaa eväsluettelon lyhyesti: kertolaskuna.',
    reward: 'Kirjoitat ryhmät lyhyesti kertolaskuna!',
    demo: () => [
      { say: 'Neljä pussia, joissa jokaisessa kolme marjaa. Pitkästi: kolme plus kolme plus kolme plus kolme. Lyhyesti: neljä kertaa kolme.', scene: sumToTimesScene(4, 3) },
      { say: 'Kertolaskussa ensin tulee ryhmien määrä, sitten montako jokaisessa ryhmässä on.', scene: sumToTimesScene(2, 6, true, 'simpukka') },
      { say: 'Rivistö on samanlainen: rivit ovat ryhmiä. Kolme riviä, joissa viisi: kolme kertaa viisi.', scene: rowsScene(3, 5, true, 'simpukka') },
      { say: 'Varo: neljä plus kolme on vain seitsemän. Se laskee pussit ja yhden pussin marjat yhteen, ei kaikkia marjoja.', scene: card('4 + 3 = 7', '4 × 3 = 12') },
    ],
    item: cases({
      sum: (r) => {
        const k = r.int(2, 5); let g = r.int(2, 9); if (g === k) g++;
        return {
          say: `Mikä kertolasku tarkoittaa samaa kuin ${Array(k).fill(g).join(' + ')}?`,
          task: choose(r, ex(`${k} × ${g}`), [ex(`${k} + ${g}`), ex(`${g} × ${g}`)], [`${k} + ${g} = ${k + g}, mutta summa on ${k * g}. Lukua ${g} ei lisätä vain kerran.`, `${g} × ${g} tarkoittaisi, että lukuja ${g} on ${g} kappaletta. Laske plussalaskun luvut: niitä on ${k}.`]),
          hint: `Laske, montako kertaa luku ${g} toistuu.`,
          explain: `Luku ${g} toistuu ${k} kertaa: ${k} × ${g} = ${k * g}.`,
        };
      },
      picture: (r) => {
        const a = r.int(2, 5); let b = r.int(2, 6); if (b === a) b++;
        return {
          say: 'Mikä kertolasku sopii kuvaan?',
          scene: paint(arrayArt(a, b, 'simpukka')),
          task: choose(r, ex(`${a} × ${b}`), [ex(`${a} + ${b}`), ex(`${a} × ${a * b}`)], [`${a} + ${b} = ${a + b}, mutta simpukoita on ${a * b}. Rivejä ja rivin pituutta ei lasketa yhteen.`, `${a * b} on kaikkien simpukoiden määrä. Yhdessä rivissä on vain ${b}.`]),
          hint: 'Laske ensin rivit. Sitten laske, montako simpukkaa on yhdessä rivissä.',
          explain: `${a} riviä, joissa jokaisessa ${b}: ${a} × ${b}.`,
        };
      },
      story: (r) => {
        const k = r.int(2, 6); let g = r.int(2, 6); if (g === k) g++;
        return {
          say: `Lautalla on ${k} penkkiä. Jokaisella istuu ${g} sammakkoa. Mikä lasku kertoo, montako sammakkoa lautalla on?`,
          task: choose(r, ex(`${k} × ${g}`), [ex(`${k} + ${g}`), ex(`${g} − ${k}`)], [`${k} + ${g} laskee vain yhden penkin sammakot ja penkit yhteen. Jokaisella ${k} penkillä istuu ${g}.`, 'Kukaan ei lähde lautalta, joten vähennyslasku ei sovi. Penkit ovat yhtä suuria ryhmiä.']),
          hint: 'Penkit ovat ryhmiä. Montako ryhmää, ja montako sammakkoa kussakin?',
          explain: `${k} penkkiä, joilla jokaisella ${g}: ${k} × ${g} = ${k * g}.`,
        };
      },
      write: (r) => {
        const k = r.int(2, 5); let g = r.int(2, 8); if (g === k) g++;
        return {
          say: `Kirjoita lyhyesti kertolaskuna: ${Array(k).fill(g).join(' + ')}.`,
          scene: sumToTimesScene(k, g, false),
          task: { kind: 'build' as const, mode: 'seq' as const, target: `${k} × ${g}`, tokens: r.shuffle([...new Set([k, g, k * g, k + g].map(String))]).concat(['×', '+']), max: 3,
            whyAt: { [`${k} + ${g}`]: `${k} + ${g} = ${k + g}. Se lisää luvun ${g} vain kerran. Käytä kertomerkkiä ×.`, [`${g} × ${k}`]: `${g} × ${k} tarkoittaa ${Array(g).fill(k).join(' + ')}. Tulos on sama, mutta tässä luku ${g} toistuu ${k} kertaa: ensin ${k}.`, [`${k} × ${k * g}`]: `${k * g} on jo vastaus. Kertolaskuun tulee ryhmän koko ${g}.` } },
          hint: `Ensin ryhmien määrä (montako lukua ${g} on), sitten ×, sitten ryhmän koko.`,
          explain: `${Array(k).fill(g).join(' + ')} = ${k} × ${g} = ${k * g}.`,
        };
      },
    }, (r) => {
      const k = r.int(3, 6), g = r.int(2, 5), ok = r.chance(0.5);
      return {
        say: `Aavalla on ${k} kukkapenkkiä, joissa jokaisessa on ${g} kukkaa. Hän kirjoitti ${ok ? `${g} × ${k}` : `${g} + ${k}`}. Kertooko lasku, montako kukkaa on kaikkiaan?`,
        task: YESNO(ok, 'Kertolaskussa järjestystä saa vaihtaa: tulos on sama.', `${g} + ${k} = ${g + k}, mutta kukkia on ${k * g}. Penkkejä ja kukkia ei lasketa yhteen.`),
        hint: 'Kuvittele penkit riveinä. Saako rivistön kääntää?',
        explain: ok ? `${g} × ${k} = ${k} × ${g} = ${k * g}. Järjestys saa vaihtua.` : `Oikea lasku on ${k} × ${g} = ${k * g}.`,
      };
    }),
  },
];
