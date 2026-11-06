// Aarresaaristo additions for the 177-node MVP: written methods (Laskuverstas),
// times tables 6–9, divisibility, order of operations, recording and reading data,
// comparing negative numbers, same-denominator fractions, and testing and solving
// simple equations. Known errors targeted: "smaller from larger" in subtraction,
// the forgotten zero in expanded form, forgotten carries, adding denominators,
// "−7 > −3", and computing strictly left to right.
import type { Rng } from '../engine/rng';
import type { NodeSpec, Option, Task } from '../engine/types';
import { cases, choose, fixed, paint, table } from './kit';
import { iceHops, thermoScene } from './neganim';
import { breakScene, exchangeScene, expandScene } from './placeanim';
import { packScene, skipScene } from './divisanim';
import { addColumnScene, dealDivScene, exprScene, mulColumnScene, partsMulScene, subColumnScene } from './writtenanim';
import { AUDIT_REV } from './audit-rev';
import { joinScene, mergeScene, raceScene, splitScene } from './fracanim';
import { guessScene, machineScene } from './alganim';
import { checkTallyScene, compareBarsScene, tableReadScene, tallyScene } from './dataanim';
import { factorScene, neighbourScene, trickScene } from './multanim';
import { balanceArt, blocksArt, fracArt, fracText, neg, numberLineArt, tallyArt, thermoArt } from './pics';
import { ask, column, ex, fr, gcd, n$, pickNum, pickText, YESNO } from './parts';

const N = neg;
const art = (s: string): Option => ({ art: s });
/** n with digits d (thousands..ones). */
const digits = (n: number) => String(n).split('').map(Number);
const ANIMALS = [['sorsa', 'sorsaa', 'sorsia'], ['lokki', 'lokkia', 'lokkeja'], ['kala', 'kalaa', 'kaloja'], ['sammakko', 'sammakkoa', 'sammakoita'], ['etana', 'etanaa', 'etanoita']] as const;

/** a − b computed column by column as |a_i − b_i| (the "smaller from larger" error). */
function smallerFromLarger(a: number, b: number) {
  const A = String(a).padStart(3, '0'), B = String(b).padStart(3, '0');
  return Number([0, 1, 2].map((i) => Math.abs(+A[i]! - +B[i]!)).join(''));
}
/** a + b without carrying (each column mod 10). */
const noCarry = (a: number, b: number) => {
  const A = String(a).padStart(3, '0'), B = String(b).padStart(3, '0');
  return Number([0, 1, 2].map((i) => (+A[i]! + +B[i]!) % 10).join(''));
};
/** Two 3-digit numbers whose sum needs at least one carry. */
function carryPair(r: Rng): [number, number] {
  for (;;) {
    const a = r.int(125, 689), b = r.int(117, 299);
    if (a + b < 1000 && noCarry(a, b) !== a + b) return [a, b];
  }
}
/** a > b, 3-digit, needing at least one exchange. */
function borrowPair(r: Rng): [number, number] {
  for (;;) {
    const a = r.int(312, 950), b = r.int(105, a - 100);
    if (smallerFromLarger(a, b) !== a - b) return [a, b];
  }
}

export const WRITTEN_NODES: NodeSpec[] = [
  // ============================================================ expanded form
  {
    id: 'M-PLACE-05', stop: 'Lukujen purku', icon: '🧱',
    goal: 'Opit purkamaan luvun tuhansiin, satoihin, kymppeihin ja ykkösiin, ja kokoamaan sen takaisin.',
    intro: 'Laskuverstaalla luvut puretaan palikoiksi ja kootaan uudelleen.',
    reward: 'Purat ja kokoat lukuja, nollat paikoillaan!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Luku 3405 on 3000 + 400 + 5. Kymppejä ei ole, joten kymppien kohdalta ei tule mitään, mutta luvussa nolla pitää paikkaa.', scene: expandScene(3405) },
      { say: 'Samaa lukua voi purkaa monella tavalla: 340 on 3 sataa ja 4 kymppiä, mutta myös 34 kymppiä. Jokainen satanen on kymmenen kymppiä.', scene: breakScene(3, 4) },
      { say: 'Toisin päin: kun kymppejä on kymmenen tai enemmän, kymmenen niistä vaihdetaan yhdeksi sataseksi. Siksi 13 kymppiä on 1 sata ja 3 kymppiä.', scene: exchangeScene([10]) },
    ],
    item: cases({
      expand: (r) => {
        const th = r.int(1, 9), h = r.int(1, 9), o = r.int(1, 9), tn = r.chance(0.5) ? 0 : r.int(1, 9);
        const n = th * 1000 + h * 100 + tn * 10 + o;
        const right = [th * 1000, h * 100, tn * 10, o].filter(Boolean).join(' + ');
        const flat = [th, h, tn, o].filter(Boolean).join(' + ');
        // Distractors are checked by value: a reordered sum such as 9000 + 800 + 5 + 50 equals 9855,
        // so it is never offered as a wrong expansion.
        const total = (parts: number[]) => parts.reduce((a, b) => a + b, 0);
        const shiftCands: [number[], string][] = tn
          ? [[[th * 1000, h * 100, tn, o * 10], 'Kymmenet ja ykköset ovat vaihtaneet paikkaa.'], [[th * 1000, h * 10, tn * 100, o], 'Sadat ja kymmenet ovat vaihtaneet paikkaa.'], [[th * 100, h * 1000, tn * 10, o], 'Tuhannet ja sadat ovat vaihtaneet paikkaa.']]
          : [[[th * 1000, h * 10, o], 'Nolla pitää kymppien paikkaa: ' + h + ' on satojen paikalla.'], [[th * 100, h * 10, o], 'Nolla pitää kymppien paikkaa, ja ' + th + ' on tuhansien paikalla.']];
        const [shiftParts, shiftWhy] = shiftCands.find(([p]) => total(p) !== n)!;
        const shifted = shiftParts.join(' + ');
        return {
          say: `Mikä on luvun ${n} oikea purku?`,
          task: choose(r, ex(right), [ex(flat), ex(shifted)], ['Numeroiden arvo riippuu paikasta: ' + th + ' tarkoittaa ' + th * 1000 + '.', shiftWhy]),
          hint: 'Jokainen numero saa perään yhtä monta nollaa kuin sen oikealla puolella on numeroita.',
          explain: `${n} = ${right}.`,
        };
      },
      missing: (r) => {
        const [a, b, c, e] = [r.int(1, 9), r.int(1, 9), r.int(1, 9), r.int(1, 9)] as const;
        const pos = r.int(1, 2), parts = [a * 1000, b * 100, c * 10, e];
        const shown = parts.map((p, i) => (i === pos ? '?' : String(p))).join(' + ');
        const n = a * 1000 + b * 100 + c * 10 + e;
        return ask(`${n} = ${shown}`, parts[pos]!, `${[b, c][pos - 1]} on ${pos === 1 ? 'satojen' : 'kymppien'} paikalla, joten se tarkoittaa ${parts[pos]}.`, { hint: 'Katso, mikä numero on puuttuvan osan paikalla.' });
      },
      regroup: (r) => {
        const tens = r.int(12, 89), hundreds = r.chance(0.5);
        return hundreds
          ? ask(`Montako kymppiä on luvussa ${tens * 10} yhteensä?`, tens, `${tens * 10} = ${tens} × 10. Satasissakin on kymppejä: yksi sata on kymmenen kymppiä.`, { hint: 'Jokainen satanen on kymmenen kymppiä. Älä unohda satasia.' })
          : ask(`${Math.floor(tens / 10)} sataa ja ${tens % 10 + 10} kymppiä. Mikä luku?`, Math.floor(tens / 10) * 100 + (tens % 10 + 10) * 10, `${tens % 10 + 10} kymppiä on ${(tens % 10 + 10) * 10}. ${Math.floor(tens / 10) * 100} + ${(tens % 10 + 10) * 10} = ${Math.floor(tens / 10) * 100 + (tens % 10 + 10) * 10}.`, { hint: 'Kymmenen kymppiä on yksi sata. Montako kymppiä jää yli?' });
      },
      split: (r) => {
        const zeroAt = r.int(1, 2), ds = [r.int(2, 9), r.int(1, 9), r.int(1, 9), r.int(1, 9)];
        ds[zeroAt] = 0;
        if (ds[3] === ds[0]) ds[3] = ds[0] === 9 ? 1 : ds[0]! + 1;
        const n = ds[0]! * 1000 + ds[1]! * 100 + ds[2]! * 10 + ds[3]!;
        const vals = ds.map((d, i) => d * 10 ** (3 - i));
        const names = ['tuhannet', 'sadat', 'kymmenet', 'ykköset'];
        const nz = ds.findIndex((d, i) => i > 0 && d > 0 && i < 3);
        const decoys = [ds[0]! * 100, nz > 0 ? ds[nz]! * 10 ** (4 - nz) : ds[3]! * 10].filter((v) => !vals.includes(v));
        const tokens = r.shuffle([...vals.map((v, i) => ({ id: `v${i}`, text: String(v) })), ...decoys.map((v, i) => ({ id: `x${i}`, text: String(v) }))]);
        return {
          say: `Pura luku ${n}: laita jokainen osa oikealle paikalle.`,
          task: {
            kind: 'place' as const,
            slots: names.map((nm, i) => ({ id: `p${i}`, text: nm })),
            tokens,
            answer: Object.fromEntries(names.map((_, i) => [`p${i}`, `v${i}`])),
            why: Object.fromEntries(names.map((nm, i) => [`p${i}`, ds[i] ? `${ds[i]} on ${['tuhansien', 'satojen', 'kymppien', 'ykkösten'][i]} paikalla: ${vals[i]}.` : `${nm[0]!.toUpperCase() + nm.slice(1)}-paikalla on 0, joten osa on 0.`])),
          },
          hint: 'Ensimmäinen numero on tuhansia: perään kolme nollaa. Nollapaikalle tulee 0.',
          explain: `${n} = ${vals.join(' + ')}.`,
        };
      },
    }, (r) => {
      const th = r.int(1, 2), h = r.int(1, 3), tn = r.int(11, 13), o = r.int(1, 5);
      const n = th * 1000 + h * 100 + tn * 10 + o;
      return ask('Palikoita on enemmän kuin kymmenen sauvaa! Mikä luku palikoista muodostuu?', n, `${th * 1000} + ${h * 100} + ${tn * 10} + ${o} = ${n}. Kymmenen sauvaa on yhtä paljon kuin yksi levy.`, { scene: blocksArt(th, h, tn, o), hint: 'Kymmenen kymppisauvaa on sata.' });
    }),
  },
  // ============================================================ written addition
  {
    id: 'M-WRADD', stop: 'Allekkain yhteen', icon: '🧮',
    goal: 'Opit laskemaan yhteen allekkain: ensin ykköset, sitten kymmenet, ja muistinumero mukaan.',
    intro: 'Laskuverstaan kassakone laskee allekkain. Sinä opetat sen.',
    reward: 'Lasket allekkain yhteen muistinumeroineen!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Lasketaan 348 + 275. Ykköset: kahdeksan plus viisi on kolmetoista. Kirjoitetaan kolme ja yksi kymppi muistiin. Kymmenet: neljä plus seitsemän plus muistissa ollut yksi on kaksitoista. Sadat: kolme plus kaksi plus yksi on kuusi.', scene: addColumnScene(348, 275) },
      { say: 'Aina ei tule muistinumeroa. Lasketaan 352 + 136: jokainen sarake mahtuu yhteen paikkaan.', scene: addColumnScene(352, 136) },
      { say: 'Kun satojenkin summa on kymmenen tai enemmän, viimeinen muistinumero kirjoitetaan vastaukseen uudeksi numeroksi: 685 + 347.', scene: addColumnScene(685, 347) },
    ],
    item: cases({
      column: (r) => {
        const [a, b] = carryPair(r);
        return ask('Laske allekkain.', a + b, `${a} + ${b} = ${a + b}.`, { scene: column([a, b], '+'), hint: 'Aloita ykkösistä. Jos summa on 10 tai enemmän, kymppi menee muistiin.' });
      },
      ones: (r) => {
        const x = r.int(4, 9), y = r.int(11 - x, 9);
        const a = r.int(1, 6) * 100 + r.int(1, 8) * 10 + x, b = r.int(1, 3) * 100 + r.int(0, 8) * 10 + y;
        return {
          say: `Ykkösten summa on ${x} + ${y} = ${x + y}. Mitä kirjoitetaan ykkösten paikalle vastaukseen?`,
          scene: paint(column([a, b], '+')),
          task: pickNum(r, (x + y) % 10, [x + y, 1, 10], [`${x + y} ei mahdu yhteen paikkaan: kymppi menee muistiin.`, 'Yksi on muistinumero, joka siirtyy kymppeihin.', 'Kymppi menee muistiin. Ykkösiin kirjoitetaan vain jäljelle jäävät ykköset.']),
          hint: `${x + y} on yksi kymppi ja montako ykköstä?`,
          explain: `${x + y} = 1 kymppi ja ${(x + y) % 10} ykköstä. ${(x + y) % 10} kirjoitetaan ykkösiin, 1 muistiin.`,
        };
      },
      check: (r) => {
        const [a, b] = carryPair(r), ok = r.chance(0.5);
        const shown = ok ? a + b : noCarry(a, b);
        return {
          say: `Loikka laski ${a} + ${b} = ${shown}. Onko vastaus oikein?`,
          scene: paint(column([a, b], '+', shown)),
          task: YESNO(ok, `Tarkista: ${a} + ${b} = ${a + b}.`, 'Muistinumero unohtui: kymppi ei siirtynyt seuraavaan sarakkeeseen.'),
          hint: 'Laske itse sarake kerrallaan ykkösistä alkaen ja vertaa.',
          explain: ok ? `Oikein: ${a} + ${b} = ${a + b}.` : `Muistinumero unohtui. Oikea vastaus on ${a + b}.`,
        };
      },
      step: (r) => {
        const o1 = r.int(3, 9), o2 = r.int(11 - o1, 9), t1 = r.int(1, 7), t2 = r.int(0, 8 - t1);
        const a = r.int(1, 6) * 100 + t1 * 10 + o1, b = r.int(1, 3) * 100 + t2 * 10 + o2;
        const tens = (t1 + t2 + 1) % 10;
        return ask(`Ykkösistä tuli muistiin yksi kymppi. Mikä numero kirjoitetaan vastauksen kymppien paikalle?`, tens,
          `Kymmenet: ${t1} + ${t2} + muistinumero 1 = ${t1 + t2 + 1}. Kymppien paikalle ${tens}. Koko summa ${a + b}.`,
          { scene: column([a, b], '+', String((o1 + o2) % 10), '1  '), hint: 'Laske kymppien numerot yhteen ja lisää muistinumero.' });
      },
      where: (r) => {
        // Exactly one carry; Loikka forgot it, so the column after it is off by one.
        for (;;) {
          const a = r.int(112, 689), b = r.int(111, 299);
          const c1 = (a % 10) + (b % 10) >= 10, c2 = (Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) + (c1 ? 1 : 0) >= 10;
          if (c1 === c2 || a + b >= 1000) continue;
          const wrong = a + b - (c1 ? 10 : 100), col = c1 ? 1 : 2;
          const names = ['Ykköset', 'Kymmenet', 'Sadat'];
          return {
            say: `Loikka laski ${a} + ${b} = ${wrong}. Missä sarakkeessa muistinumero unohtui?`,
            scene: paint(column([a, b], '+', wrong)),
            task: fixed(names.map((n) => ({ text: n })), col, names.map((n, i) => (i === col ? undefined : i === 0 ? 'Ykkösiin ei koskaan tule muistinumeroa: ne lasketaan ensimmäisinä.' : `${n}-sarake on laskettu oikein. Etsi sarake, jonka edellisen sarakkeen summa oli 10 tai yli.`)), 3),
            hint: 'Laske jokaisen sarakkeen summa. Missä edellisestä sarakkeesta olisi pitänyt tulla 1 muistiin?',
            explain: `${c1 ? 'Ykkösten' : 'Kymppien'} summa oli yli 10, joten ${names[col]!.toLowerCase()}-sarakkeeseen olisi pitänyt lisätä muistinumero 1. Oikea vastaus on ${a + b}.`,
          };
        }
      },
    }, (r) => {
      const [a, b] = carryPair(r);
      return ask(`Lautalla oli aamulla ${a} matkustajaa ja illalla ${b}. Montako matkustajaa yhteensä?`, a + b, `${a} + ${b} = ${a + b}.`, { hint: 'Kirjoita luvut allekkain ja laske ykkösistä alkaen. Muista muistinumero.' });
    }),
  },
  // ============================================================ written subtraction
  {
    id: 'M-WRSUB', stop: 'Allekkain vähennys', icon: '🔻',
    goal: 'Opit vähentämään allekkain. Kun ylempi numero on pienempi, vaihdetaan kymppi kymmeneksi ykköseksi.',
    intro: 'Kassakoneen vähennyslasku: aina ylhäältä alhaalta pois, ei koskaan toisin päin.',
    reward: 'Vähennät allekkain ja vaihdat oikein!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Lasketaan 352 − 178. Ykköset: kahdesta ei voi ottaa kahdeksaa. Vaihdetaan yksi kymppi kymmeneksi ykköseksi: kaksitoista miinus kahdeksan on neljä. Kympeissä sama uudestaan.', scene: subColumnScene(352, 178) },
      { say: 'Jos viereinen sarake on nolla, vaihdetaan kauempaa: sata kymmeneksi kympiksi, ja niistä yksi kymppi ykkösiksi. Nollasta tulee yhdeksän.', scene: subColumnScene(405, 178) },
      { say: 'Väärin olisi laskea kahdeksan miinus kaksi. Tarkistus tehdään yhteenlaskulla: erotus plus vähentäjä on alkuperäinen luku, 174 + 178 = 352.', scene: addColumnScene(174, 178) },
    ],
    item: cases({
      column: (r) => {
        const [a, b] = borrowPair(r);
        return ask('Laske allekkain.', a - b, `${a} − ${b} = ${a - b}. Tarkistus: ${a - b} + ${b} = ${a}.`, { scene: column([a, b], '−'), hint: 'Jos ylempi numero on pienempi, vaihda yksi seuraavan sarakkeen yksikkö kymmeneksi.' });
      },
      flip: (r) => {
        const [a, b] = borrowPair(r), w = smallerFromLarger(a, b);
        return {
          say: `Loikka laski ${a} − ${b} = ${w}. Mikä meni vikaan?`,
          scene: paint(column([a, b], '−', w)),
          task: pickText(r, 'Hän vähensi pienemmän suuremmasta joka sarakkeessa, vaikka olisi pitänyt vaihtaa', ['Hän laski oikein', 'Hän laski yhteen eikä vähentänyt'], [`Tarkista: ${w} + ${b} = ${w + b}, ei ${a}.`, `${a} + ${b} olisi ${a + b}.`]),
          hint: 'Katso ykkösiä: kummasta luvusta Loikka otti pois?',
          explain: `Ylhäältä alhaalta pois: kun ylempi numero on pienempi, vaihdetaan. Oikea vastaus on ${a - b}.`,
        };
      },
      check: (r) => {
        const [a, b] = borrowPair(r);
        return {
          say: `Miten tarkistat laskun ${a} − ${b} = ${a - b}?`,
          task: choose(r, ex(`${a - b} + ${b} = ${a}`), [ex(`${a} + ${b} = ${a + b}`), ex(`${a} + ${a - b} = ${2 * a - b}`)], ['Tämä ei tarkista mitään: se on eri lasku.', 'Erotukseen lisätään vähentäjä, ei alkuperäistä lukua.']),
          hint: 'Vähennyslaskun voi purkaa yhteenlaskulla: vastaus + otettu = alussa ollut.',
          explain: `Erotus + vähentäjä = alkuperäinen luku: ${a - b} + ${b} = ${a}.`,
        };
      },
      step: (r) => {
        const o1 = r.int(0, 7), o2 = r.int(o1 + 1, 9), t1 = r.int(2, 9), t2 = r.int(0, t1 - 1);
        const a = r.int(3, 9) * 100 + t1 * 10 + o1, b = r.int(1, 2) * 100 + t2 * 10 + o2;
        return ask(`Ykkösissä ${o1} − ${o2} ei onnistu, joten vaihdetaan yksi kymppi kymmeneksi ykköseksi. Mikä numero tulee vastauksen ykkösten paikalle?`, o1 + 10 - o2,
          `Vaihdon jälkeen ykkösiä on ${o1 + 10}: ${o1 + 10} − ${o2} = ${o1 + 10 - o2}. Kymppejä jää ${t1 - 1}. Koko erotus ${a - b}.`,
          { scene: column([a, b], '−'), hint: `Kymppi vaihdetaan: ${o1} + 10 = ${o1 + 10} ykköstä.` });
      },
      needs: (r) => {
        const [a, b] = borrowPair(r);
        const need: number[] = [];
        let borrow = 0;
        for (let i = 0; i < 3; i++) {
          const top = (Math.floor(a / 10 ** i) % 10) - borrow, bot = Math.floor(b / 10 ** i) % 10;
          if (top < bot) { need.push(i); borrow = 1; } else borrow = 0;
        }
        const names = ['Ykköset', 'Kymmenet', 'Sadat'];
        return {
          say: `${a} − ${b}: missä sarakkeissa pitää vaihtaa? Valitse kaikki.`,
          scene: paint(column([a, b], '−')),
          task: { kind: 'multi' as const, options: names.map((n) => ({ text: n })), answer: need, why: names.map((n, i) => need.includes(i) ? `${n}: ylempi numero on (vaihdon jälkeenkin) pienempi kuin alempi, joten tarvitaan vaihto.` : `${n}: ylempi numero riittää${i > 0 && need.includes(i - 1) ? ', vaikka siitä annettiin yksi edelliseen sarakkeeseen' : ''}.`), cols: 3 },
          hint: 'Käy sarakkeet läpi ykkösistä. Muista, että vaihdossa ylempi numero pienenee yhdellä.',
          explain: `Vaihto tarvitaan: ${need.map((i) => names[i]!.toLowerCase()).join(' ja ')}. ${a} − ${b} = ${a - b}.`,
        };
      },
    }, (r) => {
      const a = r.int(2, 9) * 100 + r.int(1, 8), b = r.int(1, Math.floor(a / 100) - 1) * 100 + r.int(1, 9) * 10 + r.int(a % 10 + 1, 9);
      return ask(`Verstaalla oli ${a} naulaa. Niistä käytettiin ${b}. Montako jäi?`, a - b, `${a} − ${b} = ${a - b}. Kymppejä ei ollut, joten ensin vaihdetaan sata kymmeneksi kympiksi.`, { scene: column([a, b], '−'), hint: 'Nollan kohdalla vaihdetaan ensin sata kympeiksi.' });
    }),
  },
  // ============================================================ times tables 6-9
  {
    id: 'M-MULTAB-HIGH', stop: 'Isot kertotaulut', icon: '9️⃣',
    goal: 'Opit kertotaulut 6–9 helpompien taulujen avulla: 9 × 7 = 10 × 7 − 7 ja 6 × 7 = 5 × 7 + 7.',
    intro: 'Verstaan seinällä on kertotaulut. Isot taulut saa pienistä, kun tietää tempun.',
    reward: 'Osaat isot kertotaulut ja niiden temput!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Yhdeksän kertaa seitsemän: kymmenen seitsemän riviä on seitsemänkymmentä. Yksi rivi liikaa, otetaan se pois: seitsemänkymmentä miinus seitsemän on kuusikymmentäkolme.', scene: trickScene(9, 7) },
      { say: 'Kuusi kertaa seitsemän: viisi riviä on kolmekymmentäviisi. Lisätään yksi rivi: neljäkymmentäkaksi.', scene: trickScene(6, 7) },
      { say: 'Kahdeksan kertaa kuusi: neljä riviä on kaksikymmentäneljä. Kahdeksan riviä on kaksi kertaa niin paljon: tuplataan, neljäkymmentäkahdeksan.', scene: trickScene(8, 6) },
      { say: 'Seitsemän kertaa kahdeksan: viisi riviä ja vielä kaksi riviä. Neljäkymmentä plus kuusitoista on viisikymmentäkuusi.', scene: trickScene(7, 8) },
    ],
    item: cases({
      nine: (r) => {
        const k = r.int(3, 9);
        return ask(`9 × ${k} = ?`, 9 * k, `10 × ${k} = ${10 * k}. Yksi ${k} pois: ${10 * k} − ${k} = ${9 * k}.`, { hint: `Laske ensin 10 × ${k} ja ota yksi ${k} pois.`, whyAt: { [10 * k]: `Tämä on 10 × ${k}. Yksi rivi on liikaa: ota vielä ${k} pois.`, [10 * k - 9]: `Pois otetaan yksi ${k}:n rivi, ei 9.`, [10 * k - 1]: `Pois otetaan kokonainen rivi, ${k}, ei yksi.` } });
      },
      six: (r) => {
        const k = r.int(3, 9);
        const w6: Record<number, string> = { [5 * k]: `Tämä on 5 × ${k}. Lisää vielä yksi rivi, ${k}.` };
        if (5 * k + 6 !== 6 * k) w6[5 * k + 6] = `Lisätään yksi ${k}:n rivi, ei 6.`;
        if (7 * k !== 6 * k) w6[7 * k] = `Tämä on 7 × ${k}: yksi rivi liikaa.`;
        return ask(`6 × ${k} = ?`, 6 * k, `5 × ${k} = ${5 * k}. Yksi ${k} lisää: ${5 * k} + ${k} = ${6 * k}.`, { hint: `Laske ensin 5 × ${k} ja lisää yksi ${k}.`, whyAt: w6 });
      },
      trick: (r) => {
        const a = r.pick([6, 8, 9]), k = r.pick([4, 5, 6, 7, 8, 9].filter((x) => x !== a && !(a === 8 && x === 4)));
        const right = a === 9 ? `10 × ${k} − ${k}` : a === 6 ? `5 × ${k} + ${k}` : `4 × ${k} + 4 × ${k}`;
        const wrongs = a === 9 ? [`10 × ${k} − 9`, `10 × ${k} − 1`] : a === 6 ? [`5 × ${k} + 6`, `5 × ${k} + 1`] : [`4 × ${k} + 4`, `4 × ${k} + ${k}`];
        const whys = a === 9 ? [`Pois otetaan yksi ${k}:n rivi, ei 9.`, `Pois otetaan kokonainen rivi, eli ${k}.`] : a === 6 ? [`Lisätään yksi ${k}:n rivi, ei 6.`, `Lisätään kokonainen rivi, eli ${k}.`] : [`Neljä riviä lisää on 4 × ${k}, ei 4.`, `Tämä olisi 5 × ${k}: vain yksi rivi lisää.`];
        return {
          say: `Mikä temppu antaa saman kuin ${a} × ${k}?`,
          task: choose(r, ex(right), wrongs.map(ex), whys),
          hint: a === 9 ? 'Yhdeksän riviä on kymmenen riviä miinus yksi rivi.' : a === 6 ? 'Kuusi riviä on viisi riviä ja yksi rivi lisää.' : 'Kahdeksan riviä on neljä riviä kahdesti.',
          explain: `${a} × ${k} = ${right} = ${a * k}.`,
        };
      },
      fact: (r) => {
        const a = r.int(6, 9), b = r.int(3, 9);
        return {
          say: `${a} × ${b} = ?`,
          task: pickNum(r, a * b, [a * (b + 1), a * (b - 1), a + b], [`Tämä on ${a} × ${b + 1}.`, `Tämä on ${a} × ${b - 1}.`, 'Tämä on summa, ei tulo.']),
          hint: a === 9 ? `10 × ${b} ja yksi ${b} pois.` : a === 8 ? `Tuplaa 4 × ${b}.` : `5 × ${b} ja lisää ${a - 5} × ${b}.`,
          explain: a === 9 ? `9 × ${b} = 10 × ${b} − ${b} = ${10 * b} − ${b} = ${a * b}.` : a === 8 ? `8 × ${b} = 4 × ${b} + 4 × ${b} = ${4 * b} + ${4 * b} = ${a * b}.` : `${a} × ${b} = 5 × ${b} + ${a - 5} × ${b} = ${5 * b} + ${(a - 5) * b} = ${a * b}.`,
        };
      },
    }, (r) => {
      const k = r.int(3, 9);
      return ask(`Loikka tietää, että 4 × ${k} = ${4 * k}. Paljonko on 8 × ${k}?`, 8 * k, `Kahdeksan on kaksi kertaa neljä, joten tulo tuplataan: 2 × ${4 * k} = ${8 * k}.`, { hint: 'Kahdeksan on kaksi kertaa neljä.', whyAt: { [4 * k + 4]: `Lisättiin 4. Kahdeksan riviä on kaksi kertaa neljä riviä: ${4 * k} + ${4 * k}.`, [4 * k + k]: `Tämä on 5 × ${k}: lisättiin vain yksi rivi.` } });
    }),
  },
  // ============================================================ all tables fluently
  {
    id: 'M-MULTAB-ALL', stop: 'Kertotaulumestari', icon: '🏅',
    goal: 'Opit kaikki kertotaulut 1–10 sujuvasti ja osaat päätellä puuttuvan tekijän.',
    intro: 'Kertotaulumestari muistaa taulut ja osaa myös päätellä: jos tiedän yhden, tiedän naapurinkin.',
    reward: 'Kertotaulut sujuvat ja osaat päätellä naapureita!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Jos tiedät, että seitsemän kertaa kahdeksan on viisikymmentäkuusi, tiedät myös seitsemän kertaa yhdeksän: jokaiseen seitsemään riviin tulee yksi lisää, eli seitsemän lisää. Kuusikymmentäkolme.', scene: neighbourScene(7, 8, true) },
      { say: 'Samoin alaspäin: kuusi kertaa yhdeksän on viisikymmentäneljä, joten kuusi kertaa kahdeksan on kuusi vähemmän, neljäkymmentäkahdeksan.', scene: neighbourScene(6, 9, false) },
      { say: 'Puuttuva tekijä: montako seitsemän riviä tarvitaan, jotta tulee neljäkymmentäkaksi? Lisätään rivejä, kunnes tavoite täyttyy: kuusi.', scene: factorScene(7, 42) },
    ],
    item: cases({
      mixed: (r) => {
        const a = r.int(2, 10), b = r.int(3, 10);
        return { say: `${a} × ${b} = ?`, task: pickNum(r, a * b, [a * b + a, a * b - b, a * b + 10], [`Tämä on ${a} × ${b + 1}: yksi ${a} liikaa.`, `Tämä on ${a - 1} × ${b}: yksi ${b} liian vähän.`, 'Kymmenen liikaa: tarkista kymmenet.']), hint: `Jos et muista, käytä naapuria: ${a} × ${b - 1} = ${a * (b - 1)}, ja lisää ${a}.`, explain: `${a} × ${b} = ${a * b}.` };
      },
      factor: (r) => {
        const a = r.int(3, 9), b = r.int(3, 9);
        return ask(`? × ${b} = ${a * b}`, a, `${a} × ${b} = ${a * b}. Puuttuva tekijä on ${a}.`, { hint: `Käy läpi luvun ${b} kertotaulua.`, whyAt: { [a * b - b]: `Tämä on ${a * b} − ${b}. Etsi luku, jolla kerrotaan: montako ${b}:n riviä?`, [a + 1]: `${a + 1} × ${b} = ${(a + 1) * b}, liian paljon.`, [a - 1]: `${a - 1} × ${b} = ${(a - 1) * b}, liian vähän.` } });
      },
      row: (r) => {
        const a = r.int(3, 9), st = r.int(3, 6), gaps = [st, st + 1, st + 2];
        const tok = r.shuffle([...gaps.map((n) => ({ id: `g${n}`, text: String(a * n) })), { id: 'd1', text: String(a * st + 1) }, { id: 'd2', text: String(a * (st + 2) + a + 1) }]);
        return {
          say: `Täydennä luvun ${a} kertotaulun aukot.`,
          scene: paint(`<div class="formula" style="font-size:24px">${[st - 1, st, st + 1, st + 2, st + 3].map((n) => gaps.includes(n) ? `${a} × ${n} = ?` : `${a} × ${n} = ${a * n}`).join('<br>')}</div>`),
          task: {
            kind: 'place' as const,
            slots: gaps.map((n) => ({ id: `s${n}`, text: `${a} × ${n}` })),
            tokens: tok,
            answer: Object.fromEntries(gaps.map((n) => [`s${n}`, `g${n}`])),
            why: Object.fromEntries(gaps.map((n) => [`s${n}`, `${a} × ${n} = ${a * (n - 1)} + ${a} = ${a * n}. Taulussa jokainen luku on edellinen + ${a}.`])),
          },
          hint: `Lähde valmiista: ${a} × ${st - 1} = ${a * (st - 1)}, ja lisää ${a} joka kerta.`,
          explain: `${gaps.map((n) => `${a} × ${n} = ${a * n}`).join(', ')}.`,
        };
      },
      neighbour: (r) => {
        const a = r.int(6, 9), b = r.int(4, 8), up = r.chance(0.5);
        return ask(`${a} × ${b} = ${a * b}. Paljonko on ${a} × ${up ? b + 1 : b - 1}?`, a * (up ? b + 1 : b - 1), `Yksi ${a} ${up ? 'lisää' : 'vähemmän'}: ${a * b} ${up ? '+' : '−'} ${a} = ${a * (up ? b + 1 : b - 1)}.`, { hint: `Jokaiseen ${a} riviin tulee yksi ${up ? 'lisää' : 'vähemmän'}: muutos on ${a}.`, whyAt: { [a * b + (up ? 1 : -1)]: `Muutos ei ole 1 vaan kokonainen ${a}: jokaisessa ${a} rivissä yksi ${up ? 'lisää' : 'vähemmän'}.`, [a * b + (up ? b : -b)]: `Tämä muuttaa ${b}:llä. Toinen tekijä ${a} pysyy, joten muutos on ${a}.` } });
      },
    }, (r) => {
      const rows = r.int(6, 9), per = r.int(6, 9);
      return ask(`Munakennossa on ${rows} riviä ja jokaisessa ${per} munaa. Montako munaa on yhteensä?`, rows * per, `${rows} × ${per} = ${rows * per}.`, { hint: `Rivejä ${rows}, jokaisessa ${per}: ${rows} × ${per}.`, whyAt: { [rows + per]: 'Rivit ja munat laskettiin yhteen. Jokaisessa rivissä on monta munaa: kerro.' } });
    }),
  },
  // ============================================================ written multiplication
  {
    id: 'M-WRMUL', stop: 'Allekkain kertominen', icon: '✖️',
    goal: 'Opit kertomaan moninumeroisen luvun yksinumeroisella: osa kerrallaan tai allekkain.',
    intro: 'Verstas valmistaa sarjoja. Iso kertolasku puretaan pieniksi osiksi.',
    reward: 'Kerrot isoja lukuja osa kerrallaan!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Neljä kertaa kaksisataakolmekymmentäkuusi: luku pilkotaan osiin, kaksisataa, kolmekymmentä ja kuusi. Jokainen osa kerrotaan neljällä, ja osat lasketaan yhteen.', scene: partsMulScene(4, 236) },
      { say: 'Allekkain sama tehdään oikealta: neljä kertaa kuusi on kaksikymmentäneljä. Neljä kirjoitetaan, kaksi muistiin. Muistinumero lisätään vasta kertomisen jälkeen.', scene: mulColumnScene(236, 4) },
      { say: 'Kahdeksan kertaa viisikymmentäseitsemän: kahdeksan kertaa seitsemän on viisikymmentäkuusi, kuusi alas ja viisi muistiin. Kahdeksan kertaa viisi on neljäkymmentä, plus viisi on neljäkymmentäviisi.', scene: mulColumnScene(57, 8) },
    ],
    item: cases({
      partial: (r) => {
        const k = r.int(3, 6), n = r.int(112, 389);
        const [h, tn, o] = digits(n) as [number, number, number];
        return ask(`${k} × ${n} = ${k} × ${h * 100} + ${k} × ${tn * 10} + ${k} × ${o} = ?`, k * n, `${k * h * 100} + ${k * tn * 10} + ${k * o} = ${k * n}.`, { hint: 'Laske jokainen osa ja sitten osat yhteen.' });
      },
      parts: (r) => {
        const k = r.int(3, 6), h = r.int(1, 3), tn = r.int(1, 9), o = r.int(1, 9), n = h * 100 + tn * 10 + o;
        const right = [k * h * 100, k * tn * 10, k * o];
        const decoys = [k * h, k * tn, k * h * 10].filter((d, i, all) => !right.includes(d) && all.indexOf(d) === i).slice(0, 2);
        const tok = r.shuffle([...right.map((v, i) => ({ id: `p${i}`, text: String(v) })), ...decoys.map((v, i) => ({ id: `d${i}`, text: String(v) }))]);
        const labels = [`${k} × ${h * 100}`, `${k} × ${tn * 10}`, `${k} × ${o}`];
        return {
          say: `${k} × ${n}: laita jokaisen osan tulo paikalleen.`,
          scene: paint(`<div class="formula">${k} × ${n} = ${labels.join(' + ')}</div>`),
          task: {
            kind: 'place' as const,
            slots: labels.map((l, i) => ({ id: `s${i}`, text: l })),
            tokens: tok,
            answer: { s0: 'p0', s1: 'p1', s2: 'p2' },
            why: { s0: `${k} × ${h} = ${k * h}, ja sadoissa kaksi nollaa perään: ${k * h * 100}.`, s1: `${k} × ${tn} = ${k * tn}, ja kymmenissä nolla perään: ${k * tn * 10}.`, s2: `${k} × ${o} = ${k * o}.` },
          },
          hint: 'Kerro numero ja lisää osan nollat perään: sadoissa kaksi, kymmenissä yksi.',
          explain: `${right.join(' + ')} = ${k * n}.`,
        };
      },
      column: (r) => {
        const k = r.int(3, 9), n = r.int(23, 98);
        return ask('Laske allekkain.', k * n, `${k} × ${n} = ${k * n}.`, { scene: column([n, k], '×'), hint: 'Kerro ensin ykköset. Kymmenet menevät muistiin.' });
      },
      check: (r) => {
        const k = r.int(3, 8), n = r.int(24, 89), ok = r.chance(0.5);
        const o = n % 10, tn = Math.floor(n / 10);
        const forgot = tn * k * 10 + ((o * k) % 10);
        const shown = ok || forgot === k * n ? k * n : forgot;
        return {
          say: `Aava laski ${k} × ${n} = ${shown}. Onko vastaus oikein?`,
          scene: paint(column([n, k], '×', shown)),
          task: YESNO(shown === k * n, `Tarkista osina: ${k} × ${tn * 10} + ${k} × ${o} = ${k * tn * 10} + ${k * o} = ${k * n}.`, 'Muistinumero unohtui: ykkösten tulosta jäi kymppi pois.'),
          hint: `Laske osina: ${k} × ${tn * 10} ja ${k} × ${o}, sitten yhteen.`,
          explain: shown === k * n ? `Oikein: ${k * tn * 10} + ${k * o} = ${k * n}.` : `Muistinumero unohtui. ${k * tn * 10} + ${k * o} = ${k * n}.`,
        };
      },
      step: (r) => {
        let k = 3, n = 24;
        do { k = r.int(3, 9); n = r.int(23, 98); } while (k * (n % 10) < 10);
        const o = n % 10, tn = Math.floor(n / 10), carry = Math.floor((k * o) / 10), tens = (k * tn + carry) % 10;
        return ask(`${k} × ${o} = ${k * o}: ${(k * o) % 10} kirjoitetaan ja ${carry} kymppiä muistiin. Mikä numero tulee vastauksen kymppien paikalle?`, tens,
          `${k} × ${tn} = ${k * tn}, ja muistista ${carry}: ${k * tn + carry}. Kymppien paikalle ${tens}. Koko tulo ${k * n}.`,
          { scene: column([n, k], '×', String((k * o) % 10), `${carry} `), hint: 'Kerro kymmenet ja lisää muistinumero.' });
      },
    }, (r) => {
      const km = r.int(112, 245), days = r.int(3, 6);
      return ask(`Lautta kulkee ${km} kilometriä päivässä. Kuinka monta kilometriä se kulkee ${days} päivässä?`, km * days, `${days} × ${km} = ${km * days} km.`, { unit: 'km', hint: `Sama matka ${days} kertaa: ${days} × ${km}. Laske osina tai allekkain.`, whyAt: { [km + days]: 'Matka toistuu joka päivä: kerro, älä lisää.' } });
    }),
  },
  // ============================================================ division by place
  {
    id: 'M-WRDIV', stop: 'Jako paikoittain', icon: '➗',
    goal: 'Opit jakamaan luvun osa kerrallaan: ensin sadat, sitten kymmenet, sitten ykköset.',
    intro: 'Verstaalla jaetaan nauloja laatikoihin: ensin satasen pussit, sitten kymmenen nipput, sitten irtonaulat.',
    reward: 'Jaat isoja lukuja paikka kerrallaan ja vaihdat ylijäämän!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Kuusisataakahdeksankymmentäneljä jaettuna kahdella: kuusi sataa jaetaan, kumpikin saa kolme sataa. Kahdeksan kymppiä: neljä kumpikin. Neljä ykköstä: kaksi kumpikin.', scene: dealDivScene(684, 2) },
      { say: 'Seitsemänkymmentäkaksi jaettuna kolmella: seitsemän kymppiä, kukin saa kaksi kymppiä, yksi kymppi jää. Se vaihdetaan kymmeneksi ykköseksi: kaksitoista ykköstä, kukin saa neljä.', scene: dealDivScene(72, 3) },
      { say: 'Satakuusikymmentäkuusi jaettuna neljällä: yhtä sataa ei voi jakaa neljälle, joten se vaihdetaan kymmeneksi kympiksi. Viisitoista kymppiä: kukin saa kolme, kolme kymppiä jää. Ne vaihdetaan ykkösiksi: kolmekymmentäkuusi ykköstä, kukin saa yhdeksän. Vastaus kolmekymmentäyhdeksän.', scene: dealDivScene(156, 4) },
    ],
    item: cases({
      exch: (r) => {
        const k = r.pick([2, 3, 4]);
        const pool = Array.from({ length: 30 }, (_, i) => k * (i + 4)).filter((n) => n >= 12 && n < 100);
        let picks: number[] = [];
        for (let g = 0; g < 50; g++) { picks = r.shuffle(pool).slice(0, 4); const m = picks.filter((n) => Math.floor(n / 10) % k).length; if (m >= 1 && m <= 3) break; }
        const need = picks.map((n, i) => (Math.floor(n / 10) % k ? i : -1)).filter((i) => i >= 0);
        return {
          say: `Missä jakolaskuissa joudut vaihtamaan kympin ykkösiksi? Valitse kaikki.`,
          task: { kind: 'multi' as const, options: picks.map((n) => ({ big: `${n} : ${k}` })), answer: need, cols: 2, why: picks.map((n) => { const t = Math.floor(n / 10); return t % k ? `${t} kymppiä : ${k} = ${Math.floor(t / k)}, ja ${t % k} jää yli: vaihto tarvitaan.` : `${t} kymppiä jakautuu tasan ${k}:lle (${t / k} kullekin): ei vaihtoa.`; }) },
          hint: `Katso vain kymppien numeroa: jakautuuko se tasan ${k}:lle?`,
          explain: picks.map((n) => `${n} : ${k} = ${n / k}${Math.floor(n / 10) % k ? ' (vaihto)' : ''}`).join(', ') + '.',
        };
      },
      byPlace: (r) => {
        const k = r.pick([2, 3]), q = Array.from({ length: 3 }, () => r.int(1, Math.floor(9 / k)));
        const n = q[0]! * k * 100 + q[1]! * k * 10 + q[2]! * k;
        return ask(`${n} : ${k} = ?`, n / k, `${q[0]! * k * 100} : ${k} + ${q[1]! * k * 10} : ${k} + ${q[2]! * k} : ${k} = ${q[0]! * 100} + ${q[1]! * 10} + ${q[2]} = ${n / k}.`, { hint: 'Jaa ensin sadat, sitten kymmenet, sitten ykköset.' });
      },
      exchange: (r) => {
        let k = 3, q = 24;
        for (;;) { k = r.pick([3, 4, 6]); q = r.int(12, Math.floor(99 / k)); if (Math.floor((k * q) / 10) % k !== 0) break; }
        const n = k * q, wrong = Math.floor(Math.floor(n / 10) / k) * 10 + Math.floor((n % 10) / k);
        return ask(`${n} : ${k} = ?`, q, `${Math.floor(n / 10)} kymppiä: kukin saa ${Math.floor(Math.floor(n / 10) / k)}, ${Math.floor(n / 10) % k} jää. Vaihdetaan ykkösiksi ja jaetaan loput. Vastaus ${q}. Tarkistus: ${k} × ${q} = ${n}.`, { hint: 'Jos kymppejä jää yli, vaihda ne ykkösiksi.', ...(wrong !== q ? { whyAt: { [wrong]: `Ylijäänyt kymppi unohtui. ${Math.floor(n / 10) % k} kymppiä vaihdetaan ykkösiksi: ${(Math.floor(n / 10) % k) * 10 + (n % 10)} ykköstä jaetaan ${k}:lle.` } } : {}) });
      },
      check: (r) => {
        const k = r.int(3, 6), q = r.int(13, 29);
        return {
          say: `Miten tarkistat, että ${k * q} : ${k} = ${q}?`,
          task: choose(r, ex(`${k} × ${q} = ${k * q}`), [ex(`${k * q} + ${k} = ${k * q + k}`), ex(`${q} − ${k} = ${q - k}`)], ['Jakolasku tarkistetaan kertolaskulla, ei yhteenlaskulla.', 'Tämä ei liity jakolaskuun.']),
          hint: `Jos ${k} laatikkoa saa kukin ${q}, paljonko niissä on yhteensä?`,
          explain: `Osamäärä kertaa jakaja on jaettava: ${k} × ${q} = ${k * q}.`,
        };
      },
      step: (r) => {
        let k = 3, q = 24;
        for (;;) { k = r.pick([3, 4, 6, 7]); q = r.int(12, Math.floor(99 / k)); if (Math.floor((k * q) / 10) % k !== 0) break; }
        const n = k * q, tens = Math.floor(n / 10), first = Math.floor(tens / k), rest = tens % k, askRest = r.chance(0.5);
        return ask(askRest ? `${n} : ${k}. Jaetaan ensin ${tens} kymppiä: kukin saa ${first}. Montako kymppiä jää yli?` : `${n} : ${k}. Jaetaan ensin ${tens} kymppiä. Montako kymppiä kukin saa?`,
          askRest ? rest : first,
          `${tens} kymppiä : ${k} = ${first}, ja ${rest} kymppiä jää. Ne vaihdetaan ykkösiksi: ${rest * 10 + (n % 10)} ykköstä : ${k} = ${q - first * 10}. Vastaus ${q}.`,
          { hint: askRest ? `${k} × ${first} = ${k * first}. Paljonko jää ${tens}:stä?` : `Montako kertaa ${k} mahtuu lukuun ${tens}?` });
      },
    }, (r) => {
      const k = r.int(3, 5), q = r.int(31, 62);
      return ask(`Rannalla on ${k * q} simpukkaa. Ne jaetaan tasan ${k} ämpäriin. Montako simpukkaa tulee kuhunkin?`, q, `${k * q} : ${k} = ${q}. Tarkistus: ${k} × ${q} = ${k * q}.`, { hint: 'Jaa ensin sadat, sitten kympit, sitten ykköset. Ylijäämä vaihdetaan seuraavaan.', whyAt: { [k * q - k]: 'Tämä on vähennyslasku. Jaetaan tasan: kuinka monta kuhunkin?' } });
    }),
  },
  // ============================================================ divisibility
  {
    id: 'M-DIVIS-01', stop: 'Jakautuuko tasan?', icon: '🔢',
    goal: 'Opit, mitä jaollinen tarkoittaa: luku jakautuu tasan ilman jakojäännöstä. Opit myös luvuilla 2, 5 ja 10 jaollisuuden tunnusmerkit.',
    intro: 'Verstaan laatikoihin pakataan tasan. Jos jotain jää yli, luku ei ole jaollinen.',
    reward: 'Tunnistat jaollisuuden ja sen merkit!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Kaksikymmentäneljä palloa pakataan laatikoihin, joihin mahtuu neljä. Kuusi täyttä laatikkoa, eikä mitään jää yli: kaksikymmentäneljä on jaollinen neljällä.', scene: packScene(24, 4) },
      { say: 'Yksi pallo lisää: kaksikymmentäviisi. Taas kuusi täyttä laatikkoa, mutta yksi pallo jää yli. Kaksikymmentäviisi ei ole jaollinen neljällä.', scene: packScene(25, 4) },
      { say: 'Loikka hyppii kaksi ruutua kerrallaan. Kaikki osumat päättyvät numeroon nolla, kaksi, neljä, kuusi tai kahdeksan. Siitä tunnistaa kahdella jaollisen.', scene: skipScene(2) },
      { say: 'Viiden hypyillä osumat päättyvät aina nollaan tai viiteen. Ja kymmenen hypyillä aina nollaan.', scene: skipScene(5) },
    ],
    item: cases({
      lastDigit: (r) => {
        const k = r.pick([2, 5, 10]), yes = r.chance(0.5);
        let n = r.int(21, 199);
        while ((n % k === 0) !== yes) n++;
        return {
          say: `Onko ${n} jaollinen luvulla ${k}?`,
          task: YESNO(yes, `Viimeinen numero on ${n % 10}, joten ${n} on jaollinen luvulla ${k}.`, `Viimeinen numero on ${n % 10}. Luvulla ${k} jaollinen päättyy ${k === 2 ? 'numeroon 0, 2, 4, 6 tai 8' : k === 5 ? 'numeroon 0 tai 5' : 'nollaan'}.`),
          hint: 'Katso viimeistä numeroa.',
          explain: yes ? `${n} : ${k} = ${n / k}, ei jää mitään.` : `${n} : ${k} = ${Math.floor(n / k)}, jää ${n % k}.`,
        };
      },
      threes: (r) => {
        const pool = r.shuffle(Array.from({ length: 30 }, (_, i) => i + 10));
        const yes = pool.filter((x) => x % 3 === 0).slice(0, 2 + r.int(0, 1)), no = pool.filter((x) => x % 3 !== 0).slice(0, 6 - yes.length);
        const opts = r.shuffle([...yes, ...no]);
        return {
          say: 'Valitse kaikki luvut, jotka ovat jaollisia luvulla 3.',
          task: { kind: 'multi', options: opts.map(n$), answer: opts.map((x, i) => (x % 3 === 0 ? i : -1)).filter((i) => i >= 0), cols: 3, why: opts.map((x) => (x % 3 ? `${x} : 3 = ${Math.floor(x / 3)}, jää ${x % 3}.` : `3 × ${x / 3} = ${x}.`)) },
          hint: 'Käy läpi kolmosen kertotaulu.',
          explain: `Jaollisia ovat ${opts.filter((x) => x % 3 === 0).sort((a, b) => a - b).join(', ')}: ne ovat kolmosen kertotaulussa.`,
        };
      },
      tags: (r) => {
        const pool = r.shuffle(Array.from({ length: 180 }, (_, i) => i + 11));
        const ten = pool.filter((x) => x % 10 === 0).slice(0, 2), five = pool.filter((x) => x % 5 === 0 && x % 10).slice(0, 2), two = pool.filter((x) => x % 2 === 0 && x % 10).slice(0, 2);
        const all = r.shuffle([...ten, ...five, ...two]);
        const cat = (x: number) => (x % 10 === 0 ? 0 : x % 5 === 0 ? 1 : 2);
        return {
          say: 'Lajittele luvut. Mihin laatikkoon kukin kuuluu?',
          task: {
            kind: 'sort' as const,
            items: all.map((x) => ({ big: String(x) })),
            cats: [{ label: 'jaollinen 10:llä' }, { label: 'jaollinen 5:llä, ei 10:llä' }, { label: 'jaollinen 2:lla, ei 5:llä' }],
            answer: all.map(cat),
            why: all.map((x) => `${x} päättyy numeroon ${x % 10}: ${x % 10 === 0 ? 'nolla, joten jaollinen 10:llä (ja myös 2:lla ja 5:llä).' : x % 5 === 0 ? 'viisi, joten jaollinen 5:llä mutta ei 10:llä.' : 'parillinen mutta ei 0 tai 5, joten jaollinen vain 2:lla.'}`),
          },
          hint: 'Katso jokaisen luvun viimeistä numeroa: 0, 5 vai parillinen?',
          explain: `Nollaan päättyvät jakautuvat 10:llä, viitoseen päättyvät 5:llä, muut parilliset vain 2:lla.`,
        };
      },
      meaning: (r) => {
        const k = r.int(3, 6), q = r.int(4, 9), yes = r.chance(0.5), n = k * q + (yes ? 0 : r.int(1, k - 1));
        return {
          say: `Onko ${n} jaollinen luvulla ${k}?`,
          task: YESNO(yes, `${k} × ${q} = ${n}, joten mitään ei jää yli.`, `${k} × ${q} = ${k * q}, ja ${n - k * q} jää yli.`),
          hint: `Pakkaa ${k} kerrallaan: jääkö yhtään yli? Mieti ${k}:n kertotaulua.`,
          explain: yes ? `${n} : ${k} = ${q}, ei jakojäännöstä.` : `${n} : ${k} = ${q}, jakojäännös ${n - k * q}.`,
        };
      },
    }, (r) => {
      const k = r.pick([3, 4, 5]), yes = r.chance(0.5), n = k * r.int(5, 9) + (yes ? 0 : r.int(1, k - 1));
      return {
        say: `${n} sammakkoa menee veneisiin. Jokaiseen veneeseen mahtuu ${k}. Menevätkö kaikki veneet aivan täyteen?`,
        task: YESNO(yes, `${n} on jaollinen luvulla ${k}: ${n} : ${k} = ${n / k}.`, `${n} ei ole jaollinen luvulla ${k}: yksi vene jää vajaaksi.`),
        hint: `Täyttyvätkö veneet tasan? Onko ${n} ${k}:n kertotaulussa?`,
        explain: yes ? `${n} : ${k} = ${n / k}. Kaikki veneet täyttyvät.` : `${n} : ${k} = ${Math.floor(n / k)}, ja ${n % k} jää yli. Viimeinen vene ei täyty.`,
      };
    }),
  },
  // ============================================================ order of operations
  {
    id: 'M-EXPR-01', stop: 'Laskujärjestys', icon: '📜',
    goal: 'Opit laskujärjestyksen: ensin sulut, sitten kerto- ja jakolaskut, viimeisenä yhteen- ja vähennyslaskut.',
    intro: 'Verstaan ohjekirjassa on pitkiä laskuja. Kaikki saavat saman vastauksen, kun noudatetaan samaa järjestystä.',
    reward: 'Lasket pitkät lausekkeet oikeassa järjestyksessä!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Kaksi plus kolme kertaa neljä: kertolasku ensin. Kolme kertaa neljä on kaksitoista, plus kaksi on neljätoista. Jokainen välivaihe kirjoitetaan uudelle riville.', scene: exprScene('2 + 3 × 4') },
      { say: 'Samat luvut, mutta sulut: sulut lasketaan ensin. Kaksi plus kolme on viisi, kertaa neljä on kaksikymmentä. Sulut muuttivat vastauksen!', scene: exprScene('( 2 + 3 ) × 4') },
      { say: 'Pidempi lasku: ensin sulut, sitten jako- ja kertolaskut vasemmalta oikealle, viimeisenä yhteenlasku.', scene: exprScene('18 : ( 4 − 1 ) + 2 × 5') },
    ],
    item: cases({
      mulFirst: (r) => {
        const a = r.int(2, 9), b = r.int(2, 6), c = r.int(2, 6);
        return {
          say: `${a} + ${b} × ${c} = ?`,
          task: pickNum(r, a + b * c, [(a + b) * c, a + b + c, a * b + c], [`Tämä tulee, jos lasketaan ensin ${a} + ${b}. Kertolasku lasketaan ennen yhteenlaskua.`, 'Kertomerkki ei ole plus.', `Kerrottiin väärät luvut: kertomerkin vieressä ovat ${b} ja ${c}.`]),
          hint: `Etsi ensin kertomerkki: paljonko on ${b} × ${c}?`,
          explain: `Kertolasku ensin: ${b} × ${c} = ${b * c}. Sitten ${a} + ${b * c} = ${a + b * c}.`,
        };
      },
      paren: (r) => {
        const a = r.int(2, 9), b = r.int(2, 6), c = r.int(2, 5);
        return ask(`(${a} + ${b}) × ${c} = ?`, (a + b) * c, `Sulut ensin: ${a} + ${b} = ${a + b}. Sitten ${a + b} × ${c} = ${(a + b) * c}.`, { hint: 'Sulkujen sisältä aloitetaan aina.', whyAt: { [a + b * c]: `Tämä olisi ${a} + ${b} × ${c} ilman sulkuja. Sulut lasketaan ensin: ${a} + ${b} = ${a + b}.`, [a + b + c]: 'Kerro sulkujen tulos, älä lisää.' } });
      },
      steps: (r) => {
        const NAME: Record<string, string> = { '+': 'yhteenlasku', '−': 'vähennyslasku', '×': 'kertolasku', ':': 'jakolasku' };
        const pat = r.int(0, 2);
        let e: string, ord: string[];
        if (pat === 0) { const d = r.int(1, 4), c = d + r.int(1, 5); e = `${r.int(2, 9)} + ${r.int(2, 5)} × (${c} − ${d})`; ord = ['−', '×', '+']; }
        else if (pat === 1) { const a = r.int(2, 6), b = r.int(1, 5), c = r.int(2, 4); e = `(${a} + ${b}) × ${c} − ${r.int(1, (a + b) * c - 1)}`; ord = ['+', '×', '−']; }
        else { const d = r.int(1, 4), c = d + r.int(1, 4), q = r.int(2, 5); e = `${r.int(2, 9)} + ${(c - d) * q} : (${c} − ${d})`; ord = ['−', ':', '+']; }
        const tok = r.shuffle(ord.map((o) => ({ id: `o${o}`, text: `${o}  ${NAME[o]}`, speak: NAME[o] })));
        if (tok.every((x, i) => x.id === `o${ord[i]}`)) tok.push(tok.shift()!);
        const whyOf = (o: string, i: number) => i === 0 ? `Sulkujen sisällä on ${NAME[o]}: sulut lasketaan aina ensin.` : i === 1 ? `${NAME[o]![0]!.toUpperCase() + NAME[o]!.slice(1)} tehdään ennen yhteen- ja vähennyslaskua.` : `${NAME[o]![0]!.toUpperCase() + NAME[o]!.slice(1)} on sulkujen ulkopuolella, joten se jää viimeiseksi.`;
        return {
          say: `Missä järjestyksessä laskut tehdään? Laita ne järjestykseen.`,
          scene: paint(`<div class="formula" style="font-size:32px">${e}</div>`),
          task: {
            kind: 'place' as const,
            slots: [{ id: 's1', text: '1. ensin' }, { id: 's2', text: '2.' }, { id: 's3', text: '3. viimeisenä' }],
            tokens: tok,
            answer: { s1: `o${ord[0]}`, s2: `o${ord[1]}`, s3: `o${ord[2]}` },
            why: { s1: whyOf(ord[0]!, 0), s2: whyOf(ord[1]!, 1), s3: whyOf(ord[2]!, 2) },
          },
          hint: 'Sulut ensin, sitten kerto- ja jakolaskut, viimeisenä yhteen- ja vähennyslaskut.',
          explain: `${e}: ensin ${NAME[ord[0]!]} (sulut), sitten ${NAME[ord[1]!]}, viimeisenä ${NAME[ord[2]!]}.`,
        };
      },
      sub: (r) => {
        const b = r.int(2, 5), c = r.int(2, 5), a = b * c + r.int(3, 15);
        return ask(`${a} − ${b} × ${c} = ?`, a - b * c, `Kertolasku ensin: ${b} × ${c} = ${b * c}. Sitten ${a} − ${b * c} = ${a - b * c}.`, { hint: `Kertolasku ensin: ${b} × ${c}. Vähennä se luvusta ${a}.`, whyAt: { [(a - b) * c]: `Tämä tulee, jos lasketaan ensin ${a} − ${b}. Kertolasku lasketaan ennen vähennyslaskua.` } });
      },
    }, (r) => {
      const n = r.int(3, 5), p = r.int(3, 6), q = r.int(1, 3);
      return {
        say: `Lipun hinta on ${p} € ja ohjelma ${q} €. ${n} lasta ostaa kukin lipun ja ohjelman. Mikä lasku kertoo kokonaishinnan?`,
        task: choose(r, ex(`${n} × (${p} + ${q})`), [ex(`${n} × ${p} + ${q}`), ex(`${n} + ${p} + ${q}`)], ['Ilman sulkuja ohjelma maksettaisiin vain kerran.', 'Lasten määrä kerrotaan, ei lisätä.']),
        hint: 'Mitä yksi lapsi maksaa yhteensä? Se pitää kertoa lasten määrällä.',
        explain: `Jokainen maksaa ${p} + ${q} = ${p + q} €. ${n} × (${p} + ${q}) = ${n * (p + q)} €.`,
      };
    }),
  },
  // ============================================================ recording observations
  {
    id: 'M-DATA-02', stop: 'Havaintoviivat', icon: '📝', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit merkitsemään havainnot muistiin yksi kerrallaan, esimerkiksi viivoilla.',
    intro: 'Aava laskee rannalla eläimiä. Jokaisesta tulee yksi viiva. Viides viiva vedetään vinoon neljän yli.',
    reward: 'Merkitset havainnot tarkasti ja korjaat virheet!',
    demo: () => [
      { say: 'Katso: jokainen ohi uiva eläin saa yhden viivan omalle rivilleen. Viides viiva vedetään vinoon neljän yli, ja viisi on helppo laskea.', scene: tallyScene([['🦆', 'sorsa'], ['🐸', 'sammakko']], [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]) },
      { say: 'Tarkista lopuksi: jokaisella havainnolla pitää olla oma viiva. Jos yksi puuttuu, lisää se.', scene: checkTallyScene(['🦆', '🐟', '🦆', '🦆', '🐟', '🦆', '🦆', '🐟', '🦆'], '🦆', 'sorsa', 5) },
    ],
    item: cases({
      pick: (r) => {
        const n = r.int(3, 12), [, part] = r.pick([...ANIMALS]);
        return {
          say: `Aava näki ${n} ${part}. Mikä merkintä kertoo sen?`,
          task: choose(r, art(tallyArt(n)), [art(tallyArt(n + 1)), art(tallyArt(n - 1))], ['Tässä on yksi viiva liikaa.', 'Tästä puuttuu yksi viiva.'], 1),
          hint: 'Laske jokaisesta vaihtoehdosta viisiryhmät ja loput viivat.',
          explain: `${n} = ${Math.floor(n / 5) ? `${Math.floor(n / 5)} viiden nippua${n % 5 ? ` ja ${n % 5}` : ''}` : `${n} viivaa`}.`,
        };
      },
      count: (r) => {
        const kinds = r.shuffle([...ANIMALS]).slice(0, 3);
        const seq = Array.from({ length: r.int(7, 11) }, () => r.pick(kinds));
        const target = kinds[0]!, n = seq.filter((k) => k === target).length;
        const em: Record<string, string> = { sorsa: '🦆', lokki: '🐦', kala: '🐟', sammakko: '🐸', etana: '🐌' };
        return {
          say: `Ohi kulki eläimiä tässä järjestyksessä. Montako viivaa Aava merkitsee riville ${target[0]}?`,
          scene: paint(`<div class="formula" style="font-size:30px;letter-spacing:4px">${seq.map((k) => em[k[0]]).join(' ')}</div>`),
          task: pickNum(r, n, [seq.length, n + 1, n - 1], ['Tämä on kaikkien eläinten määrä.', 'Yksi liikaa. Laske uudelleen.', 'Yksi jäi laskematta.'], { lo: 0 }),
          hint: `Katso vain eläimiä ${em[target[0]]} ja tee jokaisesta viiva.`,
          explain: `Jokaisesta ohi kulkeneesta tulee yksi viiva: ${n} ${n === 1 ? target[0] : target[1]}.`,
        };
      },
      add: (r) => {
        const n = r.int(3, 9), [one, part] = r.pick([...ANIMALS]);
        return {
          say: `${one[0]!.toUpperCase() + one.slice(1)}-rivillä on jo ${n} viivaa. Vielä yksi ${one} ui ohi. Montako viivaa rivillä on nyt?`,
          scene: paint(tallyArt(n)),
          task: pickNum(r, n + 1, [n, n + 2], ['Uusi eläin pitää merkitä: viivoja tulee yksi lisää.', 'Ohi ui vain yksi eläin, joten viivoja tulee yksi lisää.']),
          hint: 'Yksi uusi havainto on yksi uusi viiva.',
          explain: `Jokaisesta uudesta havainnosta tulee yksi viiva: ${n} + 1 = ${n + 1} ${part}.`,
        };
      },
      record: (r) => {
        const em: Record<string, string> = { sorsa: '🦆', lokki: '🐦', kala: '🐟', sammakko: '🐸', etana: '🐌' };
        const kinds = r.shuffle([...ANIMALS]).slice(0, 3);
        const items = r.shuffle([...kinds.map((k) => k[0] as string), ...Array.from({ length: r.int(3, 7) }, () => r.pick(kinds)[0] as string)]);
        const cats = kinds.map((k) => ({ key: k[0] as string, label: k[0][0]!.toUpperCase() + k[0].slice(1), icon: em[k[0]]! }));
        return {
          say: 'Eläimet uivat ohi tässä järjestyksessä. Merkitse jokaisesta eläimestä yksi viiva oikealle riville.',
          task: { kind: 'tally', items, cats },
          explain: cats.map((c) => `${c.label}: ${items.filter((x) => x === c.key).length}`).join(', ') + '.',
          hint: 'Käy eläimet läpi vasemmalta oikealle. Jokaisesta tulee yksi viiva.',
        };
      },
      fix: (r) => {
        const em: Record<string, string> = { sorsa: '🦆', lokki: '🐦', kala: '🐟', sammakko: '🐸', etana: '🐌' };
        const kinds = r.shuffle([...ANIMALS]).slice(0, 2), a = r.int(3, 8), b = r.int(2, 6), drop = r.int(0, 1);
        const seq = r.shuffle([...Array(a).fill(0), ...Array(b).fill(1)] as number[]);
        const marks = [a - (drop === 0 ? 1 : 0), b - (drop === 1 ? 1 : 0)];
        return {
          say: 'Eläimet uivat ohi tässä järjestyksessä. Yhdeltä riviltä puuttuu viiva. Kummalta?',
          scene: paint(`<div class="formula" style="font-size:28px;letter-spacing:4px">${seq.map((i) => em[kinds[i]![0]]).join(' ')}</div>` + table(['eläin', 'viivat'], kinds.map((k, i) => [`${em[k[0]]} ${k[0]}`, tallyArt(marks[i]!, 28)]))),
          task: fixed(kinds.map((k) => ({ text: `${em[k[0]]} ${k[0]}`, speak: k[0] })), drop, kinds.map((k, i) => (i === drop ? undefined : `${k[0][0]!.toUpperCase() + k[0].slice(1)}-rivillä on ${marks[i]} viivaa ja ${[a, b][i]} havaintoa: täsmää.`)), 2),
          hint: 'Laske kummankin eläimen havainnot ja vertaa viivoihin.',
          explain: `${kinds[drop]![0]}: havaintoja ${[a, b][drop]}, viivoja ${marks[drop]}. Yksi puuttuu.`,
        };
      },
    }, (r) => {
      const n = r.int(4, 8);
      return {
        say: `Loikka merkitsi ${n - 1} viivaa sorsien riville, mutta sorsia oli ${n}. Mitä hänen pitää tehdä?`,
        scene: paint(table(['eläin', 'viivat'], [['sorsa', tallyArt(n - 1, 28)], ['lokki', tallyArt(3, 28)]])),
        task: pickText(r, 'Lisätä yksi viiva sorsien riville', ['Lisätä yksi viiva lokkien riville', 'Pyyhkiä kaikki viivat pois'], ['Lokkien määrä oli oikein.', 'Virhe korjataan lisäämällä puuttuva viiva.']),
        hint: 'Vertaa viivojen määrää siihen, montako sorsaa oikeasti oli.',
        explain: `Sorsia oli ${n}, viivoja ${n - 1}: yksi viiva puuttuu sorsien riviltä.`,
      };
    }),
  },
  // ============================================================ reading a table
  {
    id: 'M-DATA-05', stop: 'Taulukon tieto', icon: '📊', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit lukemaan taulukosta: etsi oikea rivi ja oikea sarake.',
    intro: 'Tutkimusasemalla on taulukko eilisistä havainnoista. Mitä siitä selviää?',
    reward: 'Luet taulukoita ja vertailet niiden lukuja!',
    demo: () => [
      { say: 'Etsi ensin rivi, jossa lukee lokki. Sitten katso samalta riviltä luku: lokkeja oli seitsemän.', scene: tableReadScene(['sorsa', 'lokki', 'kala'], ['määrä'], [[4], [7], [2]], [[1, 0, 'Montako lokkia?'], [2, 0, 'Montako kalaa?']]) },
      { say: 'Taulukon luvut voi ajatella palkkeina. Pisin palkki on suurin luku. Montako enemmän? Katso, paljonko pidempi palkki jatkuu lyhyemmän ohi.', scene: compareBarsScene([['sorsa', 4], ['lokki', 7], ['kala', 2]], 1, 0) },
    ],
    item: cases({
      cell: (r) => {
        const vs = r.shuffle([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).slice(0, 3);
        const rows = r.shuffle([...ANIMALS]).slice(0, 3).map(([one], i) => [one, vs[i]!] as [string, number]);
        const [name, val] = r.pick(rows);
        return {
          say: `Montako havaintoa riville ${name} on merkitty?`,
          scene: paint(table(['eläin', 'määrä'], rows)),
          task: pickNum(r, val, rows.filter(([, v]) => v !== val).map(([, v]) => v), rows.filter(([, v]) => v !== val).map(([n]) => `Tämä luku on rivillä ${n}.`)),
          hint: `Etsi rivi, jossa lukee ${name}, ja katso samalta riviltä.`,
          explain: `Rivillä ${name} on luku ${val}.`,
        };
      },
      most: (r) => {
        const vals = r.shuffle([3, 5, 8, 11, 6]).slice(0, 3);
        const rows = r.shuffle([...ANIMALS]).slice(0, 3).map(([one], i) => [one, vals[i]!] as [string, number]);
        const top = rows.reduce((a, b) => (b[1] > a[1] ? b : a));
        return {
          say: 'Mitä eläintä nähtiin eniten?',
          scene: paint(table(['eläin', 'määrä'], rows)),
          task: pickText(r, top[0], rows.filter((x) => x !== top).map((x) => x[0]), rows.filter((x) => x !== top).map((x) => `${x[0]}: ${x[1]}, vähemmän kuin ${top[1]}.`)),
          hint: 'Etsi määrä-sarakkeen suurin luku.',
          explain: `Suurin luku on ${top[1]}: ${top[0]}.`,
        };
      },
      diff: (r) => {
        const rows = r.shuffle([...ANIMALS]).slice(0, 2).map(([one]) => [one, r.int(2, 14)] as [string, number]);
        if (rows[0]![1] === rows[1]![1]) rows[0]![1] += 3;
        const [hi, lo] = rows[0]![1] > rows[1]![1] ? [rows[0]!, rows[1]!] : [rows[1]!, rows[0]!];
        const wa: Record<number, string> = { [hi[1] + lo[1]]: 'Laskit yhteen. Kysytään, montako enemmän: vähennä.' };
        if (hi[1] !== hi[1] - lo[1]) wa[hi[1]] = `${hi[1]} on rivin ${hi[0]} luku. Vähennä siitä ${lo[1]}.`;
        return ask(`Montako havaintoa enemmän on rivillä ${hi[0]} kuin rivillä ${lo[0]}?`, hi[1] - lo[1], `${hi[1]} − ${lo[1]} = ${hi[1] - lo[1]}.`, { scene: table(['eläin', 'määrä'], rows), hint: 'Montako enemmän = isompi luku − pienempi luku.', whyAt: wa });
      },
      rank: (r) => {
        const vs = r.shuffle([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).slice(0, 3);
        const rows = r.shuffle([...ANIMALS]).slice(0, 3).map(([one], i) => [one, vs[i]!] as [string, number]);
        const order = [...rows].sort((x, y) => y[1] - x[1]), toks = r.shuffle(rows.map(([n], i) => ({ id: `a${i}`, text: n })));
        const idOf = (n: string) => toks.find((k) => k.text === n)!.id, names = ['1. eniten', '2.', '3. vähiten'];
        return {
          say: 'Järjestä eläimet taulukon mukaan: eniten ylimmäksi.',
          scene: paint(table(['eläin', 'määrä'], rows)),
          task: { kind: 'place', slots: names.map((x, i) => ({ id: `p${i}`, text: x })), tokens: toks, answer: Object.fromEntries(order.map(([n], i) => [`p${i}`, idOf(n)])), why: Object.fromEntries(order.map(([n, v], i) => [`p${i}`, `${n}: ${v}.`])) } as Task,
          hint: 'Etsi ensin suurin luku, sitten pienin.',
          explain: order.map(([n, v]) => `${n} ${v}`).join(' > '),
        };
      },
    }, (r) => {
      const v = r.int(2, 4), k = r.int(2, 5);
      return {
        say: `Taulukkoon on merkitty, kuinka kaukana sammakko on lähdöstä. Kuinka kaukana se on ${k} sekunnin kohdalla?`,
        scene: paint(table(['aika (s)', 'matka (m)'], [0, 1, 2, 3, 4, 5].map((s) => [s, s * v]))),
        task: pickNum(r, k * v, [k, (k + 1) * v, (k - 1) * v], ['Tämä on aika, ei matka.', 'Tämä on seuraavan rivin matka.', 'Tämä on edellisen rivin matka.'], { opt: (x) => ex(`${x} m`) }),
        hint: `Etsi rivi, jossa aika on ${k}, ja lue saman rivin matka.`,
        explain: `Rivillä ${k} s matka on ${k * v} m.`,
      };
    }),
  },
  // ============================================================ comparing negatives
  {
    id: 'M-NEG-03', stop: 'Kylmin aamu', icon: '🥶',
    goal: 'Opit vertaamaan ja järjestämään negatiivisia lukuja: lukusuoralla oikealla on aina suurempi.',
    intro: 'Jäälahdella mitataan pakkasia. Kumpi on kylmempi, −7 vai −3 astetta?',
    reward: 'Vertaat negatiivisia lukuja varmasti!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Miinus seitsemän on kauempana nollasta vasemmalla kuin miinus kolme. Siksi miinus seitsemän on pienempi, vaikka seitsemän on enemmän kuin kolme.', scene: iceHops(-8, 4, [
        { from: 0, to: -7, say: '−7: seitsemän askelta vasemmalle.' },
        { from: 0, to: -3, color: 'var(--blue)', say: '−3: vain kolme askelta vasemmalle.' },
      ], '−7 on vasemmempana, joten −7 < −3. Kärki osoittaa pienempään.') },
      { say: 'Lämpömittarissa sama näkyy pystysuunnassa: kylmempi on alempana ja pienempi luku.', scene: thermoScene([
        { from: 0, to: -3, label: 'aamu', say: 'Aamulla −3 °C.' },
        { from: 0, to: -7, label: 'ilta', say: 'Illalla pinta laski alemmas: −7 °C.' },
      ], 'Ilta oli kylmempi: −7 °C < −3 °C.') },
    ],
    item: cases({
      bigger: (r) => {
        const a = -r.int(6, 12), b = -r.int(1, 5);
        return {
          say: `Kumpi luku on suurempi: ${N(a)} vai ${N(b)}?`,
          task: choose(r, ex(N(b)), [ex(N(a))], ['Tämä on kauempana nollasta vasemmalla: se on pienempi.']),
          hint: 'Suurempi on lukusuoralla oikealla, lähempänä nollaa.',
          explain: `${N(b)} on lukusuoralla oikeammalla, joten ${N(b)} > ${N(a)}.`,
        };
      },
      order: (r) => {
        const v = [-r.int(8, 12), -r.int(3, 7), -r.int(1, 2), r.int(1, 6)];
        let tokens = r.shuffle(v);
        if (tokens.every((x, i) => x === v[i])) tokens = [...tokens.slice(1), tokens[0]!];
        return {
          say: 'Järjestä luvut pienimmästä suurimpaan.',
          task: { kind: 'place', slots: v.map((_, i) => ({ id: `p${i}`, text: i === 0 ? 'pienin' : i === 3 ? 'suurin' : '' })), tokens: tokens.map((x) => ({ id: `n${x}`, text: N(x) })), answer: Object.fromEntries(v.map((x, i) => [`p${i}`, `n${x}`])),
            why: Object.fromEntries(v.map((x, i) => [`p${i}`, i === 0 ? `Pienin on kauimpana vasemmalla: ${N(x)}.` : i === 3 ? `Suurin on ainoa positiivinen: ${N(x)}.` : `${N(x)} on ${N(v[i - 1]!)}:n oikealla ja ${N(v[i + 1]!)}:n vasemmalla.`])) },
          hint: 'Mitä kauempana vasemmalla nollasta, sitä pienempi.',
          explain: v.map(N).join(' < ') + '.',
        };
      },
      colder: (r) => {
        const a = -r.int(2, 6), b = a - r.int(2, 6);
        const [x, y] = r.shuffle([a, b]);
        return {
          say: `Aamulla oli ${N(x!)} °C ja illalla ${N(y!)} °C. Kumpi oli kylmempi?`,
          scene: paint(`<div class="pics">${thermoArt(x!, -15, 5, 'aamu')}${thermoArt(y!, -15, 5, 'ilta')}</div>`),
          task: pickText(r, x === b ? 'Aamu' : 'Ilta', [x === b ? 'Ilta' : 'Aamu'], ['Kylmempi on se, jossa lukema on pienempi: kauempana nollasta alaspäin.'], 2),
          hint: 'Kummassa mittarissa pinta on alempana?',
          explain: `${N(b)} < ${N(a)}, joten ${N(b)} °C on kylmempi.`,
        };
      },
      symbol: (r) => {
        const a = -r.int(1, 12);
        let b = r.chance(0.2) ? a : -r.int(1, 12);
        if (b === a && r.chance(0.5)) b = a === -12 ? -11 : a - 1;
        if (Math.abs(a - b) === 1) b = b > a ? (b + 1 <= -1 ? b + 1 : a - 2) : (b - 1 >= -12 ? b - 1 : a + 2);
        const q = a < b ? 0 : a === b ? 1 : 2;
        const lt = `Väärin päin: ${N(a)} on ${a > b ? 'oikeammalla eli suurempi' : 'vasemmalla eli pienempi'}.`;
        return {
          say: `Mikä merkki tulee väliin? ${N(a)} ? ${N(b)}`,
          scene: paint(numberLineArt({ min: -12, max: 2, labelEvery: 2, marks: [{ v: a, label: N(a) }, ...(a === b ? [] : [{ v: b, label: N(b), color: 'var(--blue)' }])] })),
          task: fixed([{ big: '<' }, { big: '=' }, { big: '>' }], q, [q === 0 ? undefined : a === b ? 'Luvut ovat samat, joten ne ovat yhtä suuret.' : lt, q === 1 ? undefined : 'Luvut eivät ole samat.', q === 2 ? undefined : a === b ? 'Luvut ovat samat, joten ne ovat yhtä suuret.' : lt], 3),
          hint: 'Merkin kärki osoittaa pienempään. Pienempi on lukusuoralla vasemmalla.',
          explain: a === b ? `${N(a)} = ${N(b)}.` : `${N(Math.min(a, b))} on vasemmalla, joten ${N(a)} ${a < b ? '<' : '>'} ${N(b)}.`,
        };
      },
    }, (r) => {
      const a = -r.int(5, 9), b = a - r.int(2, 6);
      const [x, y] = r.shuffle([a, b]);
      return {
        say: `Sukeltaja Aava on ${N(x!)} metrissä ja sukeltaja Loikka ${N(y!)} metrissä. Kumpi on syvemmällä?`,
        task: pickText(r, x === b ? 'Aava' : 'Loikka', [x === b ? 'Loikka' : 'Aava'], ['Syvemmällä on se, jonka lukema on pienempi.'], 2),
        hint: 'Syvemmällä tarkoittaa kauempana pinnasta (nollasta) alaspäin: pienempi luku.',
        explain: `${N(b)} < ${N(a)}: ${N(b)} metriä on syvemmällä.`,
      };
    }),
  },
  // ============================================================ comparing same-denominator fractions
  {
    id: 'M-FRAC-05', stop: 'Palavertailu', icon: '🥧',
    goal: 'Opit vertaamaan murtolukuja, joilla on sama nimittäjä: palat ovat samankokoisia, joten enemmän paloja on enemmän.',
    intro: 'Piirakat on leikattu samankokoisiin paloihin. Kummalla on enemmän?',
    reward: 'Vertaat samannimisiä murtolukuja!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Molemmat levyt on leikattu kahdeksaan palaan. Otetaan paloja rinnakkain: kumpi saa enemmän?', scene: raceScene(8, 3, 5) },
      { say: 'Kun nimittäjä on sama, palat ovat samankokoisia. Silloin riittää verrata osoittajia.', scene: raceScene(6, 5, 2) },
      { say: 'Yhtä monta samankokoista palaa on yhtä paljon.', scene: raceScene(5, 3, 3) },
    ],
    item: cases({
      pick: (r) => {
        const n = r.pick([5, 6, 8, 10]), a = r.int(1, n - 2), b = r.int(a + 1, n - 1);
        return {
          say: `Kumpi on enemmän: ${a}/${n} vai ${b}/${n}?`,
          scene: paint(`<div class="pics">${fracArt(n, a, 'pie', undefined, 90)}${fracArt(n, b, 'pie', undefined, 90)}</div>`),
          task: choose(r, fr(b, n), [fr(a, n)], ['Palat ovat samankokoisia. Tässä on vähemmän paloja.']),
          hint: 'Nimittäjä on sama, joten palat ovat yhtä suuria. Kummassa on enemmän paloja?',
          explain: `Sama nimittäjä: ${b} palaa on enemmän kuin ${a} palaa.`,
        };
      },
      symbol: (r) => {
        const n = r.pick([4, 5, 7, 9]), a = r.int(1, n - 1), eq = r.chance(0.25);
        let b = eq ? a : r.int(1, n - 1); if (!eq && b === a) b = a === 1 ? 2 : a - 1;
        const sym = a === b ? '=' : a > b ? '>' : '<', opts = ['<', '=', '>'];
        return {
          say: `Mikä merkki tulee väliin? ${a}/${n} ? ${b}/${n}`,
          scene: paint(`<div class="formula">${fracText(a, n)} ? ${fracText(b, n)}</div>`),
          task: { kind: 'choice', options: opts.map((s) => ({ big: s })), answer: opts.indexOf(sym), why: opts.map((o) => (o === '=' ? `Osoittajat ${a} ja ${b} ovat eri: palojen määrä ei ole sama.` : `Väärin päin: ${a} ${sym} ${b}. Merkin kärki osoittaa pienempää.`)), cols: 3 },
          hint: 'Nimittäjät ovat samat. Vertaa ylempiä lukuja, osoittajia.',
          explain: `${a}/${n} ${sym} ${b}/${n}, koska ${a} ${sym} ${b}.`,
        };
      },
      order: (r) => {
        const n = r.pick([6, 8, 10]), as = r.shuffle(Array.from({ length: n - 1 }, (_, i) => i + 1)).slice(0, 3);
        const sorted = [...as].sort((x, y) => x - y);
        return {
          say: 'Järjestä pienimmästä suurimpaan.',
          task: { kind: 'place', slots: sorted.map((_, i) => ({ id: `p${i}`, text: i === 0 ? 'pienin' : i === 2 ? 'suurin' : '' })), tokens: as.map((a) => ({ id: `f${a}`, text: `${a}/${n}` })), answer: Object.fromEntries(sorted.map((a, i) => [`p${i}`, `f${a}`])), why: Object.fromEntries(sorted.map((a, i) => [`p${i}`, `${a}/${n}: ${a} palaa, ${i === 0 ? 'vähiten' : i === 2 ? 'eniten' : 'näiden välissä'}.`])) },
          hint: 'Kaikilla sama nimittäjä: järjestä osoittajien mukaan.',
          explain: sorted.map((a) => `${a}/${n}`).join(' < ') + '.',
        };
      },
      half: (r) => {
        const n = r.pick([6, 8, 10]), h = n / 2;
        let as = r.shuffle(Array.from({ length: n - 1 }, (_, i) => i + 1)).slice(0, 4);
        if (!as.some((x) => x < h)) as[0] = 1; if (!as.some((x) => x > h)) as[1] = n - 1;
        as = [...new Set(as)];
        const cat = (x: number) => (x < h ? 0 : x === h ? 1 : 2);
        return {
          say: `Lajittele: onko murtoluku alle puolet, tasan puolet vai yli puolet? Puolet on ${h}/${n}.`,
          task: { kind: 'sort' as const, items: as.map((x) => ({ big: `${x}/${n}` })), cats: [{ label: 'Alle puolet' }, { label: 'Tasan puolet' }, { label: 'Yli puolet' }], answer: as.map(cat), why: as.map((x) => `${x}/${n} ${x < h ? '<' : x === h ? '=' : '>'} ${h}/${n}, koska ${x} ${x < h ? '<' : x === h ? '=' : '>'} ${h}.`) },
          hint: `Puolet ${n} palasta on ${h} palaa. Vertaa jokaista osoittajaa lukuun ${h}.`,
          explain: `Puolet = ${h}/${n}. ` + as.map((x) => `${x}/${n} ${['alle', 'tasan', 'yli'][cat(x)]}`).join(', ') + '.',
        };
      },
    }, (r) => {
      const n = r.pick([7, 9, 11]), a = r.int(1, n - 3);
      return {
        hint: `Samankokoisia paloja: etsi osoittaja lukujen ${a} ja ${a + 2} väliltä.`,
        say: `Mikä murtoluku on lukujen ${a}/${n} ja ${a + 2}/${n} välissä?`,
        task: choose(r, fr(a + 1, n), [fr(a + 1, 2 * n), fr(a + 3, n)], ['Nimittäjä muuttui: palat ovat pienempiä.', 'Tämä on suurempi kuin ' + (a + 2) + '/' + n + '.']),
        explain: `Samankokoisia paloja: ${a} < ${a + 1} < ${a + 2}, joten ${a + 1}/${n} on välissä.`,
      };
    }),
  },
  // ============================================================ equivalent fractions
  {
    id: 'M-FRAC-06', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Yhtä isot palat', icon: '🟰',
    goal: 'Opit tunnistamaan, milloin kaksi murtolukua ovat yhtä suuria, vaikka niissä on eri luvut.',
    intro: 'Kaksi piirakkaa on leikattu eri tavoin. Silti syötyä voi olla yhtä paljon!',
    reward: 'Tunnistat samansuuruiset murtoluvut!',
    demo: () => [
      { say: 'Nauhasta on väritetty puolet. Katso, kun jokainen pala leikataan kahtia, ja sitten vielä kahtia. Palojen määrä kasvaa: kaksi neljäsosaa, neljä kahdeksasosaa. Väritetty osa ei liiku mihinkään. Yksi kahdesosa on yhtä suuri kuin kaksi neljäsosaa ja neljä kahdeksasosaa.', scene: splitScene(1, 2, [2, 2]) },
      { say: 'Kaksi kolmasosaa: leikataan jokainen pala kahtia, saadaan neljä kuudesosaa. Mutta jos osoittajaan ja nimittäjään vain lisätään yksi, saadaan kolme neljäsosaa, ja väri ulottuu eri kohtaan. Se ei ole sama luku.', scene: splitScene(2, 3, [2]) },
      { say: 'Yksi kolmasosa, leikataan kolmeen: kolme yhdeksäsosaa. Kerro osoittaja ja nimittäjä samalla luvulla.', scene: splitScene(1, 3, [3]) },
    ],
    item: cases({
      same: (r) => {
        const b = r.pick([2, 3, 4]), a = r.int(1, b - 1), k = r.pick([2, 3]), yes = r.chance(0.5);
        const c = yes ? a * k : a * k + (r.chance(0.5) || a * k === 1 ? 1 : -1);
        return {
          say: `Ovatko ${a}/${b} ja ${c}/${b * k} yhtä suuret?`,
          scene: paint(`<div class="pics" style="flex-direction:column">${fracArt(b, a, 'bar')}${fracArt(b * k, c, 'bar')}</div>`),
          task: YESNO(yes, `Väritetty osa on yhtä pitkä: ${a}/${b} = ${a * k}/${b * k}.`, `Väritetyt osat ovat eri pitkiä: ${a}/${b} = ${a * k}/${b * k}, ei ${c}/${b * k}.`),
          hint: 'Vertaa, mihin kohtaan väritys ulottuu kummassakin nauhassa.',
          explain: `${a}/${b} = ${a * k}/${b * k}: osoittaja ja nimittäjä on kerrottu samalla luvulla ${k}.`,
        };
      },
      pick: (r) => {
        const [a, b] = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]] as [number, number][]), k = r.pick([2, 3, 4]);
        return {
          say: `Mikä on yhtä suuri kuin ${a}/${b}?`,
          task: choose(r, fr(a * k, b * k), [fr(a + k, b + k), fr(a * k, b)], ['Osoittajaan ja nimittäjään ei lisätä samaa lukua: ne kerrotaan samalla luvulla.', 'Vain osoittaja kerrottiin.']),
          hint: 'Etsi murtoluku, jossa osoittaja ja nimittäjä on kerrottu samalla luvulla.',
          explain: `${a}/${b} = ${a} · ${k} / ${b} · ${k} = ${a * k}/${b * k}.`,
        };
      },
      missing: (r) => {
        const [a, b] = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5]] as [number, number][]), k = r.pick([2, 3, 4]);
        const whyAt: Record<number, string> = {};
        if (a + b * k - b !== a * k) whyAt[a + b * k - b] = `Nimittäjään ei lisätty ${b * k - b}, vaan se kerrottiin luvulla ${k}. Kerro osoittajakin.`;
        if (a !== a * k) whyAt[a] = `Palat leikattiin ${k} osaan, joten väritettyjä paloja on ${k} kertaa enemmän.`;
        return ask(`${a}/${b} = ?/${b * k}`, a * k, `Nimittäjä kerrottiin luvulla ${k}, joten osoittajakin: ${a} · ${k} = ${a * k}.`, { scene: `<div class="formula">${fracText(a, b)} = ${fracText('?', b * k)}</div>`, hint: `Millä luvulla ${b} kerrotaan, jotta saadaan ${b * k}? Kerro osoittaja samalla.`, whyAt });
      },
      family: (r) => {
        const [a, b] = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]] as [number, number][]);
        const [k1, k2] = r.shuffle([2, 3, 4]).slice(0, 2) as [number, number];
        const yes = [[a * k1, b * k1], [a * k2, b * k2]], no = [[a + k1, b + k1], [a * k2, b * k1 === b * k2 ? b * k2 + 1 : b * k1]].filter(([x, y], i, arr) => x! * b !== a * y! && arr.findIndex(([p, q]) => p === x && q === y) === i);
        const items = r.shuffle([...yes.map((q) => [q, 0] as const), ...no.map((q) => [q, 1] as const)]);
        return {
          say: `Lajittele: onko murtoluku yhtä suuri kuin ${a}/${b}?`,
          task: { kind: 'sort' as const, items: items.map(([[x, y]]) => ({ big: `${x}/${y}` })), cats: [{ label: `= ${a}/${b}` }, { label: `≠ ${a}/${b}` }], answer: items.map(([, c]) => c), why: items.map(([[x, y], c]) => c ? `${x}/${y} ei synny kertomalla ${a}/${b}:n molemmat luvut samalla luvulla.` : `${a}/${b} = ${a}·${y! / b}/${b}·${y! / b} = ${x}/${y}.`) },
          hint: `Tarkista: onko osoittaja ja nimittäjä kerrottu samalla luvulla?`,
          explain: `Yhtä suuria kuin ${a}/${b}: ${yes.map(([x, y]) => `${x}/${y}`).join(', ')}. Muut syntyivät lisäämällä tai kertomalla vain toisen luvun.`,
        };
      },
    }, (r) => {
      const k = r.pick([2, 3, 4]);
      return {
        say: `Aava söi ${k}/${2 * k} pizzasta ja Loikka 1/2 samankokoisesta pizzasta. Kumpi söi enemmän?`,
        task: pickText(r, 'He söivät yhtä paljon', ['Aava, koska luvut ovat isompia', 'Loikka, koska puolikas on iso pala'], [`Isommat luvut eivät tarkoita enempää: ${k}/${2 * k} = 1/2.`, `${k}/${2 * k} on myös puolet: ${k} on puolet luvusta ${2 * k}.`]),
        hint: `Onko ${k} puolet luvusta ${2 * k}?`,
        explain: `${k}/${2 * k} = 1/2: molemmat söivät puolet.`,
      };
    }),
  },
  // ============================================================ simplifying
  {
    id: 'M-FRAC-08', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Supistus', icon: '🔽',
    goal: 'Opit supistamaan murtoluvun: jaetaan osoittaja ja nimittäjä samalla luvulla.',
    intro: 'Pienet luvut ovat helpompia. Supistaminen ei muuta murtoluvun arvoa, vain palojen kokoa.',
    reward: 'Supistat murtolukuja!',
    demo: () => [
      { say: 'Kuusi kahdeksasosaa. Ryhmitellään palat kaksi kerrallaan: kahdeksasta palasta tulee neljä isoa palaa, ja väritetyistä kuudesta tulee kolme. Väliviivat häviävät, mutta väri pysyy paikallaan. Kuusi kahdeksasosaa on kolme neljäsosaa.', scene: joinScene(6, 8, [2]) },
      { say: 'Kahdeksan kahdestoistaosaa: ensin jaetaan kahdella, saadaan neljä kuudesosaa. Vielä voi jakaa kahdella: kaksi kolmasosaa. Nyt ei enää löydy yhteistä jakajaa. Jos molemmista vain vähennettäisiin yksi, väri siirtyisi: se ei ole supistamista.', scene: joinScene(8, 12, [2, 2]) },
      { say: 'Kuusi yhdeksäsosaa: ryhmitellään kolme palaa kerrallaan, eli jaetaan kolmella. Saadaan kaksi kolmasosaa.', scene: joinScene(6, 9, [3]) },
    ],
    item: cases({
      simplify: (r) => {
        const [a, b] = r.pick([[2, 3], [3, 4], [1, 3], [2, 5], [3, 5], [1, 4]] as [number, number][]), k = r.pick([2, 3]);
        return {
          say: `Supista ${a * k}/${b * k} niin pitkälle kuin voi.`,
          task: choose(r, fr(a, b), [fr(a, b * k), fr(a * k - 1, b * k - 1)].filter((o, i) => i === 0 || (a * k - 1) * b !== a * (b * k - 1)), ['Vain osoittaja jaettiin. Jaa molemmat samalla luvulla.', 'Supistaminen on jakamista, ei vähentämistä.']),
          hint: `Etsi luku, jolla sekä ${a * k} että ${b * k} jakautuvat tasan, ja jaa molemmat.`,
          explain: `Jaetaan molemmat luvulla ${k}: ${a * k}/${b * k} = ${a}/${b}.`,
        };
      },
      factor: (r) => {
        const [a, b] = r.pick([[1, 2], [2, 3], [3, 4], [1, 3], [2, 5], [4, 5]] as [number, number][]), k = r.pick([2, 3, 5]);
        const A = a * k, B = b * k;
        const ws = [2, 3, 4, 5, 7].filter((x) => x !== k && !(A % x === 0 && B % x === 0));
        return {
          say: `Millä luvulla murtoluvun ${A}/${B} voi supistaa?`,
          task: choose(r, n$(k), r.shuffle(ws).slice(0, 2).map(n$), [`Tällä ei voi jakaa sekä lukua ${A} että ${B}.`, `Tällä ei voi jakaa sekä lukua ${A} että ${B}.`]),
          hint: `Kokeile jokaista vaihtoehtoa: jakautuvatko ${A} ja ${B} molemmat tasan?`,
          explain: `${A} : ${k} = ${a} ja ${B} : ${k} = ${b}.`,
        };
      },
      simplest: (r) => {
        const yes = r.chance(0.5);
        const [a, b] = yes ? r.pick([[2, 3], [3, 4], [3, 5], [5, 6], [4, 7], [3, 8]] as [number, number][]) : r.pick([[2, 4], [4, 6], [3, 6], [6, 9], [4, 10], [6, 8]] as [number, number][]);
        const g = gcd(a, b);
        return {
          say: `Onko ${a}/${b} jo supistetussa muodossa?`,
          task: YESNO(yes, `${a} ja ${b} eivät ole yhdessä jaollisia millään luvulla, joka on suurempi kuin yksi.`, `Molemmat ovat jaollisia luvulla ${g}: ${a}/${b} = ${a / g}/${b / g}.`),
          hint: 'Kokeile jakaa molemmat luvulla 2, 3 tai 5. Jos jokin käy, murtoluku supistuu vielä.',
          explain: yes ? `${a}/${b} ei supistu.` : `${a}/${b} = ${a / g}/${b / g}.`,
        };
      },
      reduce: (r) => {
        const pool: [number, number][] = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5]];
        const rows = r.shuffle(pool).slice(0, 3).map(([a, b]) => { const k = r.pick([2, 3, 4]); return { a, b, A: a * k, B: b * k }; });
        const d0 = rows[0]!, texts = rows.map((q) => `${q.a}/${q.b}`);
        const decoy = ([[d0.A - 1, d0.B - 1], [d0.a, d0.B], [d0.A, d0.b]] as [number, number][]).find(([x, y]) => rows.every((q) => x * q.b !== y * q.a))!;
        const toks = r.shuffle([...texts, `${decoy[0]}/${decoy[1]}`]).map((x, i) => ({ id: `t${i}`, text: x }));
        const idOf = (x: string) => toks.find((q) => q.text === x)!.id;
        return {
          say: 'Supista jokainen murtoluku ja vedä tulos sen alle. Yksi kortti jää yli.',
          task: {
            kind: 'place',
            slots: rows.map((q, i) => ({ id: `s${i}`, text: `${q.A}/${q.B}` })),
            tokens: toks,
            answer: Object.fromEntries(rows.map((q, i) => [`s${i}`, idOf(`${q.a}/${q.b}`)])),
            why: Object.fromEntries(rows.map((q, i) => [`s${i}`, `${q.A} : ${q.A / q.a} = ${q.a} ja ${q.B} : ${q.A / q.a} = ${q.b}.`])),
          } as Task,
          hint: 'Jaa osoittaja ja nimittäjä samalla luvulla, kunnes ei enää voi.',
          explain: rows.map((q) => `${q.A}/${q.B} = ${q.a}/${q.b}`).join(', ') + '. Ylimääräinen kortti syntyy vähentämällä tai jakamalla vain toinen luku.',
        };
      },
    }, (r) => {
      const [a, b] = r.pick([[6, 12], [4, 8], [5, 10], [3, 9], [4, 12], [8, 12], [9, 12], [10, 15]] as [number, number][]);
      const g = gcd(a, b), sa = a / g, sb = b / g;
      const cands: [number, number][] = [[1, 2], [1, 3], [2, 3], [3, 4], [1, 4], [1, 6]];
      const wrong = r.shuffle(cands.filter(([x, y]) => x * sb !== y * sa)).slice(0, 2);
      return {
        say: `Jäätelökakusta on syöty ${a}/${b}. Mikä on sama luku supistettuna?`,
        scene: paint(fracArt(b, a, 'pie', undefined, 110)),
        task: choose(r, fr(sa, sb), wrong.map(([x, y]) => fr(x, y)), wrong.map(([x, y]) => `${x}/${y} on ${x * sb > y * sa ? 'enemmän' : 'vähemmän'} kuin ${a}/${b}. Jaa ${a} ja ${b} samalla luvulla.`)),
        hint: `Millä luvulla sekä ${a} että ${b} jakautuvat? Jaa molemmat.`,
        explain: `Jaetaan molemmat luvulla ${g}: ${a}/${b} = ${sa}/${sb}.`,
      };
    }),
  },
  // ============================================================ adding same-denominator fractions
  {
    id: 'M-FRAC-11', stop: 'Palat yhteen', icon: '➕',
    goal: 'Opit laskemaan yhteen murtolukuja, joilla on sama nimittäjä: palat lasketaan yhteen, palan koko pysyy.',
    intro: 'Piirakkajuhlassa kootaan paloja samaan vatiin. Palat ovat samankokoisia.',
    reward: 'Lasket samannimisiä murtolukuja yhteen!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Kaksi kahdeksasosaa plus kolme kahdeksasosaa. Palat siirretään samaan vatiin: palojen määrä kasvaa, mutta palan koko pysyy. Lopuksi näet, miksi 5/16 on väärin.', scene: mergeScene(8, 2, 3) },
      { say: 'Sama kuudesosilla: 1/6 + 4/6 = 5/6. Nimittäjä kertoo palan koon, ja se ei muutu.', scene: mergeScene(6, 1, 4) },
    ],
    item: cases({
      add: (r) => {
        const n = r.pick([5, 6, 7, 8, 9, 10]), a = r.int(1, n - 2), b = r.int(1, n - 1 - a);
        return {
          say: `${a}/${n} + ${b}/${n} = ?`,
          scene: paint(`<div class="formula">${fracText(a, n)} + ${fracText(b, n)}</div>`),
          task: choose(r, fr(a + b, n), [fr(a + b, 2 * n), fr(a + b < n ? a + b + 1 : a + b - 1, n)], ['Nimittäjiä ei lasketa yhteen: palan koko ei muutu.', 'Laske palat uudelleen.']),
          hint: 'Laske osoittajat yhteen. Nimittäjä kertoo palan koon, ja se pysyy.',
          explain: `${a} palaa + ${b} palaa = ${a + b} palaa: ${a + b}/${n}.`,
        };
      },
      picture: (r) => {
        const n = r.pick([4, 5, 6, 8]), a = r.int(1, n - 2), b = r.int(1, n - 1 - a);
        return ask(`Kuvassa on ${a}/${n} ja ${b}/${n}. Montako ${n}-osaa on yhteensä?`, a + b, `${a}/${n} + ${b}/${n} = ${a + b}/${n}.`, { scene: `<div class="pics">${fracArt(n, a, 'bar')}${fracArt(n, b, 'bar')}</div>`, hint: 'Laske väritetyt palat yhteen.' });
      },
      missing: (r) => {
        const n = r.pick([6, 7, 8, 9]), a = r.int(1, n - 3), b = r.int(1, n - 1 - a);
        return ask(`${a}/${n} + ?/${n} = ${a + b}/${n}`, b, `${a} + ${b} = ${a + b}, joten puuttuva osoittaja on ${b}.`, { scene: `<div class="formula">${fracText(a, n)} + ${fracText('?', n)} = ${fracText(a + b, n)}</div>`, hint: `Montako palaa pitää lisätä ${a}:een, jotta saadaan ${a + b}?`, whyAt: { [a + b]: 'Tämä on koko summa. Kysytään, montako palaa lisätään.', ...(a !== b ? { [a]: 'Tämä on jo valmiina oleva osa.' } : {}) } });
      },
      sums: (r) => {
        const n = r.pick([7, 8, 9, 10]);
        const tot = r.shuffle(Array.from({ length: n - 2 }, (_, i) => i + 2)).slice(0, 3);
        const rows = tot.map((s) => { const a = r.int(1, s - 1); return { a, b: s - a, s }; });
        const decoyRow = rows[0]!, decoy = `${decoyRow.s}/${2 * n}`;
        const toks = r.shuffle([...rows.map((q) => `${q.s}/${n}`), decoy]).map((x, i) => ({ id: `t${i}`, text: x }));
        const idOf = (x: string) => toks.find((q) => q.text === x)!.id;
        return {
          say: 'Laske summat ja vedä oikea tulos jokaisen alle. Yksi kortti jää yli.',
          task: {
            kind: 'place',
            slots: rows.map((q, i) => ({ id: `s${i}`, text: `${q.a}/${n} + ${q.b}/${n}` })),
            tokens: toks,
            answer: Object.fromEntries(rows.map((q, i) => [`s${i}`, idOf(`${q.s}/${n}`)])),
            why: Object.fromEntries(rows.map((q, i) => [`s${i}`, `${q.a} + ${q.b} = ${q.s} palaa, nimittäjä pysyy ${n}.`])),
          } as Task,
          hint: 'Osoittajat yhteen, nimittäjä pysyy.',
          explain: rows.map((q) => `${q.a}/${n} + ${q.b}/${n} = ${q.s}/${n}`).join(', ') + `. ${decoy} syntyy, jos nimittäjätkin lasketaan yhteen.`,
        };
      },
    }, (r) => {
      const n = r.pick([6, 8, 10]), a = r.int(1, n / 2 - 1), b = r.int(1, n / 2 - 1), left = n - a - b;
      return {
        hint: `Koko piirakka on ${n}/${n}. Laske ensin syöty osa, sitten jäljelle jäänyt.`,
        say: `Piirakasta söi Loikka ${a}/${n} ja Aava ${b}/${n}. Kuinka paljon piirakkaa jäi?`,
        scene: paint(fracArt(n, a + b, 'pie', undefined, 110)),
        task: choose(r, fr(left, n), [left === a + b ? fr(left + 1, n) : fr(a + b, n), fr(left, 2 * n)], [left === a + b ? 'Laske jäljelle jääneet palat uudelleen.' : 'Tämä on syöty osa, ei jäljelle jäänyt.', 'Palan koko ei muutu: nimittäjä pysyy samana.']),
        explain: `Syötiin ${a}/${n} + ${b}/${n} = ${a + b}/${n}. Jäljelle jäi ${n}/${n} − ${a + b}/${n} = ${left}/${n}.`,
      };
    }),
  },
  // ============================================================ testing a proposed solution
  {
    id: 'M-ALG-07', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Kokeile ja tarkista', icon: '🧪',
    goal: 'Opit testaamaan, ratkaiseeko luku yhtälön: sijoita luku ja katso, ovatko puolet yhtä suuret.',
    intro: 'Vaakasaarella arvataan, mitä pussissa on. Arvaus tarkistetaan vaa’alla.',
    reward: 'Testaat ehdotuksia ja tiedät, milloin luku on ratkaisu!',
    demo: () => [
      { say: 'Yhtälö: pussi plus kolme on kahdeksan. Kokeillaan kahta: kaksi plus kolme on viisi, liian kevyt, joten kokeillaan isompaa. Seitsemän plus kolme on kymmenen, liian painava. Viisi plus kolme on kahdeksan: vaaka on suorassa, joten viisi on ratkaisu. Taulukko muistaa jokaisen kokeilun.', scene: guessScene(3, 5, [2, 7, 5]) },
      { say: 'Pussi plus kuusi on neljätoista. Neljä on liian vähän, kymmenen liikaa, yhdeksän vielä liikaa. Kahdeksan plus kuusi on neljätoista: ratkaisu.', scene: guessScene(6, 8, [4, 10, 9, 8]) },
    ],
    item: cases({
      test: (r) => {
        const x = r.int(2, 12), a = r.int(2, 9), yes = r.chance(0.5), guess = yes ? x : x + r.pick([-2, -1, 1, 2]);
        return {
          say: `Onko x = ${guess} yhtälön x + ${a} = ${x + a} ratkaisu?`,
          task: YESNO(yes, `${guess} + ${a} = ${x + a}: puolet ovat yhtä suuret.`, `${guess} + ${a} = ${guess + a}, ei ${x + a}.`),
          hint: `Laske ${guess} + ${a}.`,
          explain: yes ? `${guess} + ${a} = ${x + a} ✓` : `${guess} + ${a} = ${guess + a} ≠ ${x + a}. Ratkaisu on ${x}.`,
        };
      },
      which: (r) => {
        const k = r.int(3, 6), x = r.int(3, 9);
        return {
          say: `Mikä luku toteuttaa yhtälön ${k} × □ = ${k * x}? Kokeile jokaista.`,
          task: pickNum(r, x, [x + 1, x - 1, k * x - k], [`${k} × ${x + 1} = ${k * (x + 1)}.`, `${k} × ${x - 1} = ${k * (x - 1)}.`, 'Kokeile: kerro tämä luvulla ' + k + '.'], { lo: 1 }),
          hint: `Kerro jokainen vaihtoehto luvulla ${k}. Mikä antaa ${k * x}?`,
          explain: `${k} × ${x} = ${k * x} ✓`,
        };
      },
      balance: (r) => {
        const x = r.int(2, 6), a = r.int(1, 4), yes = r.chance(0.5), guess = yes ? x : x + r.pick([-1, 1, 2]);
        return {
          say: `Pussissa on ehkä ${guess} painoyksikköä. Pysyykö vaaka silloin tasapainossa?`,
          scene: paint(balanceArt(['x', String(a)], [String(x + a)])),
          task: YESNO(yes, `${guess} + ${a} = ${x + a}: vaaka pysyy tasapainossa.`, `${guess} + ${a} = ${guess + a}, mutta oikealla on ${x + a}.`),
          hint: `Laita ${guess} pussin paikalle: ${guess} + ${a} = ?`,
          explain: yes ? `${guess} + ${a} = ${x + a} ✓` : `${guess} + ${a} = ${guess + a} ≠ ${x + a}. Pussissa on ${x}.`,
        };
      },
      steer: (r) => {
        const a = r.int(2, 9), x = r.int(3, 12), tot = x + a;
        const gs = r.shuffle([x - r.int(1, 2), x, x + r.int(1, 3), r.chance(0.5) ? x - 3 : x + 4]).filter((g, i, arr) => g > 0 && arr.indexOf(g) === i);
        const cat = (g: number) => (g < x ? 0 : g === x ? 1 : 2);
        return {
          say: `Yhtälö x + ${a} = ${tot}. Lajittele kokeilut: liian pieni, ratkaisu vai liian suuri?`,
          task: { kind: 'sort' as const, items: gs.map((g) => ({ big: `x = ${g}` })), cats: [{ label: 'Liian pieni' }, { label: 'Ratkaisu' }, { label: 'Liian suuri' }], answer: gs.map(cat), why: gs.map((g) => `${g} + ${a} = ${g + a}${g + a < tot ? ` < ${tot}` : g + a > tot ? ` > ${tot}` : ` = ${tot}`}.`) },
          hint: `Laske jokaiselle x + ${a} ja vertaa lukuun ${tot}.`,
          explain: gs.map((g) => `${g} + ${a} = ${g + a}`).join(', ') + `. Ratkaisu on ${x}.`,
        };
      },
    }, (r) => {
      const x = r.int(2, 9), yes = r.chance(0.5), guess = yes ? x : x + 1;
      const lhs = 2 * x + 3;
      return {
        say: `Loikka väittää, että x = ${guess} ratkaisee yhtälön 2x + 3 = ${lhs}. Pitääkö väite paikkansa?`,
        task: YESNO(yes, `2 · ${guess} + 3 = ${2 * guess + 3} ✓`, `2 · ${guess} + 3 = ${2 * guess + 3}, ei ${lhs}.`),
        hint: `Sijoita x = ${guess}: laske 2 · ${guess} + 3.`,
        explain: yes ? `2 · ${guess} + 3 = ${lhs} ✓` : `2 · ${guess} + 3 = ${2 * guess + 3} ≠ ${lhs}. Ratkaisu on ${x}.`,
      };
    }),
  },
  // ============================================================ solving by reasoning
  {
    id: 'M-ALG-08', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Päättele puuttuva', icon: '🧠',
    goal: 'Opit ratkaisemaan yksinkertaisen yhtälön päättelemällä käänteisen laskun avulla.',
    intro: 'Vaakasaaren mestari ei arvaa: hän päättelee. Mikä lasku kumoaa toisen?',
    reward: 'Ratkaiset yhtälöitä päättelemällä!',
    demo: () => [
      { say: 'Tuntematon luku menee koneeseen plus seitsemän, ja ulos tulee viisitoista. Käännetään kone: vähennyslasku kumoaa yhteenlaskun. Viisitoista kulkee takaisin koneen miinus seitsemän läpi: kahdeksan. Tarkistus: kahdeksan plus seitsemän on viisitoista.', scene: machineScene('+', 7, 8) },
      { say: 'Neljä kertaa ruutu on kaksikymmentäkahdeksan. Kone kertaa neljä käännetään: jaettuna neljällä. Kaksikymmentäkahdeksan jaettuna neljällä on seitsemän.', scene: machineScene('×', 4, 7) },
    ],
    item: cases({
      add: (r) => {
        const x = r.int(3, 15), a = r.int(4, 12);
        return ask(`□ + ${a} = ${x + a}`, x, `□ = ${x + a} − ${a} = ${x}. Tarkistus: ${x} + ${a} = ${x + a}.`, { hint: 'Mikä lasku kumoaa yhteenlaskun?', whyAt: { [x + 2 * a]: `Lisäsit ${a}. Kumoa yhteenlasku vähentämällä: ${x + a} − ${a}.` } });
      },
      mul: (r) => {
        const k = r.int(3, 9), x = r.int(3, 9);
        const w: Record<number, string> = { [k * x * k]: `Kerroit uudelleen. Kertolaskun kumoaa jakolasku: ${k * x} : ${k}.` };
        if (k * x - k !== x) w[k * x - k] = `Vähennit ${k}. Kertolaskun kumoaa jakolasku, ei vähennyslasku.`;
        return ask(`${k} × □ = ${k * x}`, x, `□ = ${k * x} : ${k} = ${x}. Tarkistus: ${k} × ${x} = ${k * x}.`, { hint: 'Mikä lasku kumoaa kertolaskun?', whyAt: w });
      },
      sub: (r) => {
        const a = r.int(12, 30), x = r.int(3, a - 4);
        const w: Record<number, string> = { [2 * a - x]: `Laskit ${a} + ${a - x}. Kysytään, paljonko otettiin pois: ${a} − ${a - x}.` };
        if (a - x !== x) w[a - x] = `${a - x} on se, mitä jäi. Paljonko otettiin pois?`;
        return ask(`${a} − □ = ${a - x}`, x, `${a} − ${x} = ${a - x}, joten □ = ${a} − ${a - x} = ${x}.`, { hint: `Kuinka paljon luvusta ${a} pitää ottaa pois, että jää ${a - x}?`, whyAt: w });
      },
      undo: (r) => {
        const kinds = r.shuffle(['+', '−', '×', ':'] as const).slice(0, 3);
        const rows = kinds.map((op) => ({ op, n: r.int(2, 9) }));
        const invOf = { '+': '−', '−': '+', '×': ':', ':': '×' } as const;
        const texts = rows.map((q) => `${invOf[q.op]} ${q.n}`), d0 = rows[0]!;
        const decoy = texts.includes(`${d0.op} ${d0.n}`) ? `${d0.op} ${d0.n + 1}` : `${d0.op} ${d0.n}`;
        const toks = r.shuffle([...texts, decoy]).map((x, i) => ({ id: `t${i}`, text: x }));
        const idOf = (x: string) => toks.find((q) => q.text === x)!.id;
        const nameOf = { '+': 'yhteenlaskun', '−': 'vähennyslaskun', '×': 'kertolaskun', ':': 'jakolaskun' } as const;
        return {
          say: 'Mikä lasku kumoaa koneen? Vedä kumoava kortti jokaisen koneen alle. Yksi kortti jää yli.',
          task: {
            kind: 'place',
            slots: rows.map((q, i) => ({ id: `s${i}`, text: `${q.op} ${q.n}` })),
            tokens: toks,
            answer: Object.fromEntries(rows.map((q, i) => [`s${i}`, idOf(texts[i]!)])),
            why: Object.fromEntries(rows.map((q, i) => [`s${i}`, `${texts[i]} kumoaa ${nameOf[q.op]} ${q.op} ${q.n}.`])),
          } as Task,
          hint: 'Plus ja miinus kumoavat toisensa, samoin kerto ja jako. Luku pysyy samana.',
          explain: rows.map((q, i) => `${q.op} ${q.n} ↔ ${texts[i]}`).join(', ') + '.',
        };
      },
    }, (r) => {
      const x = r.int(4, 15), a = r.int(3, 9);
      return ask(`Pussissa on helmiä. Kun Aava lisää ${a} helmeä, niitä on ${x + a}. Montako helmeä pussissa oli alussa?`, x, `□ + ${a} = ${x + a}, joten □ = ${x + a} − ${a} = ${x}.`, { hint: `Kirjoita □ + ${a} = ${x + a} ja kumoa lisäys.`, whyAt: { [x + 2 * a]: `Aava lisäsi helmiä, joten alussa oli vähemmän: ${x + a} − ${a}.`, [x + a]: `${x + a} on helmiä lisäyksen jälkeen. Alussa oli ${a} vähemmän.` } });
    }),
  },
];

