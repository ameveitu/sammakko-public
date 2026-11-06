// Pond laboratory additions for the 177-node MVP (grades 7–9): the letter as an unknown
// and as a varying quantity, evaluating and forming expressions, forming equations,
// reciprocals and fraction division ("how many groups fit?"), deeper decimal division,
// value tables, and adding, multiplying and dividing integers. Targeted misconceptions:
// letter-as-object ("a means apple"), "3x with x = 4 is 34", "division always makes
// smaller", adding denominators, and sign rules learned without meaning.
import type { Rng } from '../engine/rng';
import type { NodeSpec, Task } from '../engine/types';
import { cases, choose, paint, table } from './kit';
import { balanceArt, fracText, neg } from './pics';
import { ask, card, d, ex, fr, gcd, pickNum, pickText, t, YESNO } from './parts';
import { eqv } from './fi';
import { AUDIT_REV } from './audit-rev';
import { bagScene, guessScene } from './alganim';
import { commaShiftScene, eqBuildScene, evalScene, fitScene, flipScene, matchScene, measureScene, pipeScene, priceTagScene, roleScene, sameLetterScene, tableFillScene, varyScene } from './alg79anim';
import type { Q } from './parts';
import { divChipScene, iceHops, mulPatternScene, zeroPairScene } from './neganim';

const N = neg;
/** Numeric item with feedback for typical wrong answers (keys equal to the answer are dropped). */
const wz = (q: Q, whyAt: Record<number, string>): Q => {
  const ans = (q.task as { answer: number }).answer, w: Record<number, string> = {};
  for (const [k, v] of Object.entries(whyAt)) if (Math.abs(+k - ans) > 1e-9 && Number.isFinite(+k)) w[+(+k).toFixed(6)] = v;
  return { ...q, task: { ...q.task, whyAt: w } as Q['task'] };
};
/** [notation, 0 = one unknown number / 1 = a varying quantity, why]. */
const VAR_ROLE: [string, number, string][] = [
  ['x + 4 = 9', 0, 'Yhtälö toteutuu vain, kun x = 5.'],
  ['3a = 12', 0, 'Vain a = 4 käy.'],
  ['y − 2 = 7', 0, 'Vain y = 9 käy.'],
  ['n + n = 14', 0, 'Sama kirjain on sama luku: n = 7.'],
  ['5t = 20', 0, 'Vain t = 4 käy.'],
  ['hinta = 3n', 1, 'Hinta riippuu määrästä n, joka voi olla mikä tahansa.'],
  ['matka = 5t', 1, 'Aika t kuluu, ja matka muuttuu sen mukana.'],
  ['piiri = 4s', 1, 'Sääntö pätee kaikille neliöille: s voi olla mikä tahansa sivu.'],
  ['y = x + 2', 1, 'Jokaiselle x:lle saadaan oma y.'],
];
/** [notation, 0 = a number (right) / 1 = a thing or word (wrong), why]. */
const LETTER_SORT: [string, number, string][] = [
  ['h = talon korkeus metreinä', 0, 'h on luku: korkeus metreinä.'],
  ['n = pussien määrä', 0, 'n on luku: montako pussia.'],
  ['m = kissan massa kilogrammoina', 0, 'm on luku: massa kilogrammoina.'],
  ['t = matkaan kulunut aika minuutteina', 0, 't on luku: aika minuutteina.'],
  ['p = lipun hinta euroina', 0, 'p on luku: hinta euroina.'],
  ['h = talo', 1, 'Talo ei ole luku. Kirjain voisi olla talon korkeus tai hinta.'],
  ['k = kissa', 1, 'Kissa ei ole luku. Kirjain voisi olla kissan massa.'],
  ['p = pussi', 1, 'Pussi ei ole luku. Kirjain voisi olla pussien määrä.'],
  ['t = tunti', 1, 'Tunti on yksikkö, ei luku. Kirjain voisi olla aika tunteina.'],
];
const P = (x: number) => (x < 0 ? `(${N(x)})` : String(x));
const line = (answer: number, min = -10, max = 10, labelEvery = 5): Task => ({ kind: 'line', min, max, step: 1, answer, labelEvery });
const F = (a: number, b: number) => `<span class="formula">${fracText(a, b)}</span>`;
/** a/b with a < b, gcd 1. */
function properFrac(r: Rng, maxB = 9): [number, number] {
  for (;;) { const b = r.int(3, maxB), a = r.int(1, b - 1); if (gcd(a, b) === 1) return [a, b]; }
}

/** Exact quotient a : b in words a child can check: integer, terminating decimal, or a fraction with ≈. */
const quot = (a: number, b: number) => {
  const g = gcd(a, b), p = a / g, q = b / g;
  if (q === 1) return String(p);
  let k = q; while (k % 2 === 0) k /= 2; while (k % 5 === 0) k /= 5;
  return k === 1 ? d(p / q) : `${p}/${q} ${eqv(p / q)}`;
};

export const ALGEBRA79B_NODES: NodeSpec[] = [
  // ============================================================ reciprocal
  {
    id: 'M79-RECIP-01', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Käänteisluku', icon: '🔄',
    goal: 'Opit, että luvun ja sen käänteisluvun tulo on yksi: 3/5 ja 5/3 ovat toistensa käänteislukuja.',
    intro: 'Laboratorion kone kääntää murtoluvun ylösalaisin. Mitä tapahtuu, kun luku kerrotaan käänteisluvullaan?',
    reward: 'Tunnet käänteisluvut ja tiedät, että niiden tulo on yksi!',
    demo: () => [
      { say: 'Luku kolme viidesosaa menee kääntökoneeseen. Osoittaja ja nimittäjä vaihtavat paikkaa: tulee viisi kolmasosaa. Katso, mitä tulosta tulee.', scene: flipScene(3, 5) },
      { say: 'Kuinka monta neljäsosan palaa mahtuu yhteen kokonaiseen? Neljä. Siksi luvun 1/4 käänteisluku on 4.', scene: fitScene(1, 4) },
      { say: 'Kahden viidesosan paloja mahtuu yhteen kaksi ja vielä puolikas: viisi kahdesosaa. Se on luvun 2/5 käänteisluku.', scene: fitScene(2, 5) },
      { say: 'Kokonaisluku on murtoluku, jonka nimittäjä on yksi. Luvun neljä käänteisluku on yksi neljäsosa.', scene: card('4 = 4/1 → 1/4', '4 · 1/4 = 4/4 = 1') },
    ],
    item: cases({
      pick: (r) => {
        const [a, b] = properFrac(r);
        return {
          say: `Mikä on luvun ${a}/${b} käänteisluku?`,
          scene: paint(F(a, b)),
          task: choose(r, fr(b, a), [ex(`−${a}/${b}`), fr(b - a, b)], ['Tämä on vastaluku, ei käänteisluku. Vastaluvun kanssa summa on nolla.', `Tämä on se, mitä puuttuu ykkösestä. Käänteisluvulla kerrottuna tulo on yksi.`]),
          hint: 'Käännä murtoluku ylösalaisin: osoittaja ja nimittäjä vaihtavat paikkaa.',
          explain: `${a}/${b} · ${b}/${a} = 1, joten käänteisluku on ${b}/${a}.`,
        };
      },
      missing: (r) => {
        const [a, b] = properFrac(r);
        return wz(ask(`${a}/${b} · □/${a} = 1. Mikä luku tulee ruutuun?`, b, `${a}/${b} · ${b}/${a} = ${a * b}/${a * b} = 1, joten ruutuun tulee ${b}.`, { scene: `<div class="formula">${fracText(a, b)} · □/${a} = 1</div>`, hint: 'Tulon osoittajan ja nimittäjän pitää olla samat, jotta tulo on yksi.' }), {
          [a]: `Silloin tulo olisi ${a * a}/${b * a}, ei yksi. Osoittaja ja nimittäjä vaihtavat paikkaa.`,
          [1]: `Silloin tulo olisi ${a}/${b * a}, ei yksi.`,
          [b - a]: `${b - a}/${b} puuttuisi ykkösestä yhteenlaskussa. Tässä kerrotaan.`,
        });
      },
      whole: (r) => {
        const n = r.int(3, 9);
        return {
          say: `Mikä on luvun ${n} käänteisluku?`,
          task: choose(r, fr(1, n), [ex(`−${n}`), ex(d(n / 10))], ['Tämä on vastaluku.', `Tämä on ${d(n / 10)}, ja ${n} · ${d(n / 10)} ei ole yksi.`]),
          hint: `Kirjoita ${n} murtolukuna ${n}/1 ja käännä se.`,
          explain: `${n} · 1/${n} = 1.`,
        };
      },
      pairs: (r) => {
        const yes: [string, string][] = [], no: [string, string][] = [], seen = new Set<string>();
        const push = (l: [string, string][], s: string, w: string) => { if (!seen.has(s)) { seen.add(s); l.push([s, w]); } };
        while (yes.length < 3) {
          if (r.chance(0.35)) { const n = r.int(2, 9); push(yes, `${n} ja 1/${n}`, `${n} · 1/${n} = 1.`); }
          else { const [a, b] = properFrac(r); push(yes, `${a}/${b} ja ${b}/${a}`, `${a}/${b} · ${b}/${a} = ${a * b}/${a * b} = 1.`); }
        }
        while (no.length < 3) {
          const k = r.int(0, 2), [a, b] = properFrac(r), n = r.int(2, 9);
          if (k === 0) push(no, `${a}/${b} ja −${a}/${b}`, 'Nämä ovat vastalukuja: summa on nolla, tulo ei ole yksi.');
          else if (k === 1 && b - a !== a) push(no, `${a}/${b} ja ${b - a}/${b}`, `Summa on yksi, mutta tulo on ${a * (b - a)}/${b * b}.`);
          else if (k === 2) push(no, `${n} ja ${d(n / 10)}`, `${n} · ${d(n / 10)} = ${d(n * n / 10)}, ei yksi.`);
        }
        const rows = r.shuffle([...yes.map(([s, w]) => [s, 0, w] as const), ...no.map(([s, w]) => [s, 1, w] as const)]);
        return {
          say: 'Lajittele parit: ovatko luvut toistensa käänteislukuja?',
          task: { kind: 'sort' as const, items: rows.map((x) => t(x[0])), cats: [{ label: 'Tulo on 1 ✓' }, { label: 'Ei käänteislukuja ✗' }], answer: rows.map((x) => x[1]), why: rows.map((x) => x[2]) },
          hint: 'Kerro parin luvut keskenään. Jos tulo on yksi, ne ovat käänteislukuja.',
          explain: 'Käänteislukujen tulo on aina yksi. Vastalukujen summa on nolla, se on eri asia.',
        };
      },
    }, (r) => {
      const n = r.pick([3, 4, 5, 8, 10]);
      return wz(ask(`Montako 1/${n} litran mukillista saa yhdestä litrasta?`, n, `1 : 1/${n} = ${n}, koska ${n} · 1/${n} = 1. Luvun 1/${n} käänteisluku on ${n}.`, { hint: `Kuinka monta ${n}-osaa on yhdessä kokonaisessa?` }), {
        [1]: `Yksi mukillinen on vain 1/${n} litraa. Litraan mahtuu useampi.`,
        [1 / n]: `1/${n} on yhden mukillisen koko. Kysytään mukillisten määrää.`,
      });
    }),
  },
  // ============================================================ letter as an unknown
  {
    id: 'M79-VAR-UNKNOWN', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Kirjain on luku', icon: '🔤',
    goal: 'Opit, että kirjain yhtälössä tarkoittaa tiettyä lukua, jota ei vielä tiedetä, ei esinettä.',
    intro: 'Laboratorion muistiinpanoissa on kirjaimia. Kirjain ei ole lyhenne sanasta, vaan luku.',
    reward: 'Tiedät, että kirjain on luku, jonka voi päätellä!',
    demo: () => [
      { say: 'Yhtälössä x plus viisi on kaksitoista. Kirjain x on yksi tietty luku, jota ei vielä tiedetä. Kokeillaan lukuja vaa’alla ja katsotaan, milloin se on suorassa.', scene: guessScene(5, 7, [4, 9, 7]) },
      { say: 'Hintalapussa lukee a euroa. Kirjain a ei ole omena, vaan omenan hinta euroina: luku. Kun lappu käännetään, luku näkyy.', scene: priceTagScene(3, 2) },
      { say: 'Pussissa on x kiloa. Vaaka pysyy suorassa, kun molemmilta puolilta otetaan yhtä paljon. Lopuksi näkyy, mikä luku x on.', scene: bagScene(4, 6) },
    ],
    item: cases({
      solve: (r) => {
        const x = r.int(3, 15), a = r.int(2, 12);
        return wz(ask(`x + ${a} = ${x + a}. Mikä luku x on?`, x, `${x} + ${a} = ${x + a}, joten x = ${x}.`, { hint: `Mikä luku plus ${a} on ${x + a}? Voit laskea ${x + a} − ${a}.` }), {
          [x + 2 * a]: `Lisäsit ${a}. Tarkista: ${x + 2 * a} + ${a} on ${x + 3 * a}, ei ${x + a}. Vähennä.`,
          [x + a]: `${x + a} on koko summa. x on se osa, johon lisätään ${a}.`,
          [a]: `${a} on luku, joka lisätään. x on toinen yhteenlaskettava.`,
        });
      },
      meaning: (r) => {
        const [thing, about, unit] = r.pick([
          ['omena', 'omenan hintaa', 'omenan hinta euroina'],
          ['vihko', 'vihkon hintaa', 'vihkon hinta euroina'],
          ['lauta', 'laudan pituutta', 'laudan pituus metreinä'],
          ['pussi', 'pussin painoa', 'pussin paino kilogrammoina'],
        ] as const);
        return {
          say: `Merkinnässä a tarkoittaa ${about}. Mitä a on?`,
          task: pickText(r, `Luku: ${unit}`, [`Itse ${thing}`, 'Aina luku yksi'], ['Kirjain ei ole esine: se on luku, joka kertoo määrän.', 'Kirjain voi tarkoittaa mitä tahansa lukua.']),
          hint: 'Voiko kirjaimella laskea? Laskea voi vain luvuilla.',
          explain: `a on luku: ${unit}.`,
        };
      },
      tags: (r) => {
        const k = r.int(2, 5), p = r.int(2, 6), thing = r.pick(['omena', 'vihko'] as const);
        return { ...wz(ask(`Yksi ${thing} maksaa a euroa, ja a = ${p}. Paljonko ${k} kappaletta maksaa yhteensä? Laske ${k}a euroina.`, k * p, `${k}a = ${k} · ${p} = ${k * p} €.`, { unit: '€', hint: `${k}a tarkoittaa ${k} kertaa a. Kerro ${k} · ${p}.` }), {
          [Number(`${k}${p}`)]: `${k}a ei tarkoita lukujen kirjoittamista peräkkäin. ${k}a = ${k} · a.`,
          [k + p]: `Laskit yhteen. ${k}a on ${k} kertaa a, eli kertolasku.`,
          [k]: `${k} on kappalemäärä. Kerro se hinnalla ${p} €.`,
        }), scene: priceTagScene(k, p, thing) };
      },
      bags: (r) => {
        const n = r.int(3, 9), k = r.int(2, 3), e = r.int(1, 5);
        return wz(ask(`Jokaisessa pussissa on yhtä monta helmeä, n kappaletta. ${k} pussia ja ${e} irtohelmeä on yhteensä ${k * n + e} helmeä. Mikä luku n on?`, n, `${k}n + ${e} = ${k * n + e}, joten ${k}n = ${k * n} ja n = ${n}.`, { scene: balanceArt([...Array(k).fill('x'), String(e)], [String(k * n + e)]), hint: `Ota ensin irtohelmet pois: ${k * n + e} − ${e}. Jaa sitten ${k} pussiin.` }), {
          [k * n]: `${k * n} on kaikkien pussien helmet yhteensä. Jaa vielä ${k} pussiin.`,
          [k * n + e]: `${k * n + e} on kaikki helmet. Kysytään yhden pussin helmiä.`,
          [k * n + e - k]: `Vähensit pussien määrän. Vähennä irtohelmet ${e} ja jaa ${k}:lla.`,
        });
      },
      sort: (r) => {
        const pool = r.shuffle(LETTER_SORT), rows = r.shuffle([...pool.filter((x) => x[1] === 0).slice(0, 3), ...pool.filter((x) => x[1] === 1).slice(0, 2)]);
        return {
          say: 'Lajittele merkinnät. Kertooko kirjain luvun, vai onko se kirjoitettu kuin esine tai sana?',
          task: { kind: 'sort' as const, items: rows.map((x) => t(x[0])), cats: [{ label: 'Luku 🔢 oikein' }, { label: 'Esine tai sana ✗' }], answer: rows.map((x) => x[1]), why: rows.map((x) => x[2]) },
          hint: 'Kirjain on oikein, jos sen paikalle voi kirjoittaa luvun.',
          explain: 'Kirjain tarkoittaa aina lukua: hintaa, pituutta, määrää tai aikaa. Ei itse esinettä.',
        };
      },
    }, (r) => {
      const k = r.int(3, 6), x = r.int(3, 9);
      return {
        say: `Aava ajattelee lukua. Kun hän kertoo sen luvulla ${k}, tulee ${k * x}. Merkitään luku kirjaimella x. Mikä yhtälö kertoo tämän?`,
        task: choose(r, ex(`${k}x = ${k * x}`), [ex(`x + ${k} = ${k * x}`), ex(`${k} + ${k * x} = x`)], ['Luku kerrottiin, ei lisätty.', 'x on ajateltu luku, ei tulos.']),
        hint: 'Mitä luvulle tehtiin, ja mitä siitä tuli?',
        explain: `${k} kertaa luku on ${k * x}: ${k}x = ${k * x}. Silloin x = ${x}.`,
      };
    }),
  },
  // ============================================================ letter as a varying quantity
  {
    id: 'M79-VAR-VARYING', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Muuttuva määrä', icon: '📈',
    goal: 'Opit, että kirjain voi kertoa määrän, joka muuttuu: kun n kasvaa, myös lausekkeen arvo muuttuu.',
    intro: 'Laboratorion kioskissa yksi jäätelö maksaa 2 €. Hinta riippuu jäätelöiden määrästä n.',
    reward: 'Ymmärrät, miten lausekkeen arvo muuttuu, kun muuttuja muuttuu!',
    demo: () => [
      { say: 'Hinta on kaksi kertaa n euroa. Katso, kun n kasvaa yksi kerrallaan: jokainen jäätelö tuo kaksi euroa lisää, ja taulukko täyttyy.', scene: varyScene(2) },
      { say: 'Taksissa on aloitusmaksu neljä euroa ja kolme euroa jokaiselta kilometriltä: kolme n plus neljä. Kun n kasvaa, hinta kasvaa kolme euroa kerrallaan, mutta aloitusmaksu pysyy samana.', scene: varyScene(3, 4, '📍') },
    ],
    item: cases({
      step: (r) => {
        const k = r.int(2, 9);
        return wz(ask(`Hinta on ${k}n euroa, kun ostetaan n tuotetta. Paljonko hinta kasvaa, kun n kasvaa yhdellä?`, k, `Jokainen uusi tuote maksaa ${k} €: ${k}(n + 1) = ${k}n + ${k}.`, { unit: '€', scene: table(['n', `${k}n`], [[1, k], [2, 2 * k], [3, 3 * k]]), hint: 'Katso taulukosta, paljonko arvo kasvaa rivistä seuraavaan.' }), {
          1: `n kasvaa yhdellä, mutta hinta kasvaa yhden tuotteen hinnan: ${k} €.`,
          [2 * k]: `${2 * k} € on koko hinta, kun n = 2. Kysytään kasvua: ${2 * k} − ${k}.`,
          [k + 1]: `Hinta ei kasva ${k} + 1. Uusi tuote tuo ${k} € lisää.`,
        });
      },
      fill: (r) => {
        const k = r.int(2, 6), b = r.int(0, 5), miss = r.int(2, 5);
        const rows = [1, 2, 3, 4, 5].map((n) => [n, n === miss ? '?' : k * n + b]);
        const expr = `${k}n${b ? ` + ${b}` : ''}`;
        return wz(ask(`Täydennä taulukko. Arvo on ${expr}.`, k * miss + b, `Kun n = ${miss}: ${k} · ${miss}${b ? ` + ${b}` : ''} = ${k * miss + b}.`, { scene: table(['n', expr], rows), hint: `Sijoita n = ${miss}: ${k} · ${miss}${b ? ` + ${b}` : ''}. Tai lisää ${k} edelliseen riviin.` }), {
          [Number(`${k}${miss}`) + b]: `${k}n ei tarkoita lukuja peräkkäin. ${k}n = ${k} · ${miss}.`,
          ...(b ? { [k * miss]: `Unohdit lisätä ${b}.` } : {}),
          [k * (miss - 1) + b]: `Tämä on rivin n = ${miss - 1} arvo. Lisää vielä ${k}.`,
          [k * (miss + 1) + b]: `Tämä on rivin n = ${miss + 1} arvo.`,
          [k + miss + b]: `${k}n tarkoittaa kertolaskua ${k} · n, ei yhteenlaskua.`,
        });
      },
      which: (r) => {
        const s = r.int(2, 9);
        return {
          say: `Sammakon matka metreinä on ${s}t, kun t on aika sekunteina. Mikä muuttuu, kun aika kuluu?`,
          task: pickText(r, `t ja matka ${s}t`, [`luku ${s}`, 'ei mikään'], [`${s} on sammakon vauhti: se pysyy samana.`, 'Kun aika kuluu, sammakko etenee.']),
          hint: 'Mikä kirjain kertoo ajan? Muuttuuko luku, joka on kirjoitettu numeroin?',
          explain: `t kasvaa koko ajan, ja matka ${s}t kasvaa sen mukana. Luku ${s} pysyy samana.`,
        };
      },
      grow: (r) => {
        const k = r.int(2, 5), b = r.int(0, 4), ns = r.shuffle([1, 2, 3, 4, 5, 6]).slice(0, 3).sort((x, y) => x - y);
        const expr = `${k}n${b ? ` + ${b}` : ''}`, vals = ns.map((n) => k * n + b);
        const cands = [Number(`${k}${ns[1]}`) + b, k + ns[2]! + b, k * (ns[2]! + 1) + b, k * ns[0]!];
        const decoy = cands.find((c) => !vals.includes(c)) ?? Math.max(...vals) + 1;
        return {
          say: `Arvokone laskee ${expr}. Vedä oikea arvo jokaiselle n:lle.`,
          task: { kind: 'place', slots: ns.map((n, i) => ({ id: `s${i}`, text: `n = ${n} → ▢` })), tokens: r.shuffle([...vals.map((v, i) => ({ id: `v${i}`, text: String(v) })), { id: 'x', text: String(decoy) }]), answer: Object.fromEntries(ns.map((_, i) => [`s${i}`, `v${i}`])), why: Object.fromEntries(ns.map((n, i) => [`s${i}`, `${k} · ${n}${b ? ` + ${b}` : ''} = ${vals[i]}.`])) } as Q['task'],
          hint: `Sijoita jokainen n vuorollaan: ${k} kertaa n${b ? `, sitten + ${b}` : ''}.`,
          explain: ns.map((n, i) => `n = ${n}: ${vals[i]}`).join(', ') + `. Kun n kasvaa yhdellä, arvo kasvaa ${k}.`,
        };
      },
    }, (r) => {
      const base = r.int(3, 6), per = r.int(2, 3), k = r.int(3, 8);
      return wz(ask(`Taksimatka maksaa ${base} € + ${per} € jokaiselta kilometriltä: ${base} + ${per}k. Paljonko enemmän maksaa ${k + 1} km kuin ${k} km?`, per, `Yksi kilometri lisää tuo ${per} € lisää. Aloitusmaksu ${base} € pysyy samana.`, { unit: '€', hint: 'Mikä osa hinnasta muuttuu, kun matka pitenee yhden kilometrin? Mikä pysyy?' }), {
        [base + per * (k + 1)]: `Tämä on koko hinta ${k + 1} km:n matkasta. Kysytään eroa.`,
        [base + per]: `Aloitusmaksu ${base} € maksetaan vain kerran. Ero on vain ${per} €.`,
        1: 'Matka pitenee 1 km, mutta hinta kasvaa yhden kilometrin hinnan.',
      });
    }),
  },
  // ============================================================ variable: unknown or varying
  {
    id: 'M79-VAR-01', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Tuntematon vai muuttuja?', icon: '🧭',
    goal: 'Opit erottamaan, onko kirjain yksi tuntematon luku vai muuttuva määrä. Sama kirjain tarkoittaa samassa lausekkeessa samaa lukua.',
    intro: 'Kirjaimella on kaksi tehtävää. Yhtälössä se on piilossa oleva luku, säännössä se voi saada monta arvoa.',
    reward: 'Tunnistat kirjaimen roolin ja tiedät, että sama kirjain on sama luku!',
    demo: () => [
      { say: 'Kokeillaan samoja lukuja kahteen paikkaan. Yhtälössä x plus neljä on yhdeksän vain yksi luku toimii: viisi. Säännössä hinta on kolme n jokainen n kelpaa.', scene: roleScene(4, 5, 3) },
      { say: 'Kun samassa yhtälössä on kaksi x:ää, ne ovat sama luku. x plus x on kymmenen: kolme ja seitsemän ei käy, mutta viisi ja viisi käy. Eri kirjaimet a ja b saavat olla eri lukuja.', scene: sameLetterScene(5, 3) },
    ],
    item: cases({
      classify: (r) => {
        const unknown = r.chance(0.5);
        const s = unknown ? r.pick(['x + 4 = 9', '3a = 12', 'y − 2 = 7', 'n + n = 14']) : r.pick(['hinta = 3n', 'matka = 5t', 'y = x + 2', 'piiri = 4s']);
        return {
          say: `Merkinnässä ${s}: onko kirjain yksi tuntematon luku vai muuttuva määrä?`,
          scene: card(s),
          task: { kind: 'choice', options: [t('Yksi tuntematon luku'), t('Muuttuva määrä')], answer: unknown ? 0 : 1, why: unknown ? [undefined, 'Yhtälö toteutuu vain yhdellä luvulla.'] : ['Säännössä kirjain voi saada monta arvoa.', undefined], cols: 1 },
          hint: 'Onko merkinnässä =-merkki ja luku, jonka pitää täsmätä? Vai kertooko se säännön, joka toimii monella arvolla?',
          explain: unknown ? 'Yhtälössä kirjain on yksi tietty luku, joka voidaan ratkaista.' : 'Säännössä kirjain voi saada monta arvoa, ja toinen määrä muuttuu sen mukana.',
        };
      },
      same: (r) => {
        const x = r.int(3, 12), k = r.int(2, 3);
        const lhs = Array(k).fill('x').join(' + ');
        return wz(ask(`${lhs} = ${k * x}. Mikä luku x on?`, x, `Sama kirjain on sama luku: ${k}x = ${k * x}, joten x = ${x}.`, { hint: `Sama kirjain tarkoittaa samaa lukua. Mikä luku ${k} kertaa on ${k * x}?` }), {
          [k * x]: `${k * x} on summa. Yksi x on vain osa siitä.`,
          [k * x / 2]: `Tässä on ${k} x:ää, joten jaa ${k}:lla.`,
          [k * x - x]: `Jokainen x on sama luku. Jaa ${k * x} tasan ${k} osaan.`,
          [k * x - k]: `Et voi vähentää x:ien määrää. ${k}x = ${k * x}, joten jaa ${k}:lla.`,
        });
      },
      can: (r) => {
        const s = r.int(8, 14), a = r.int(2, s - 2), sameLetter = r.chance(0.5);
        const yes = sameLetter ? 2 * a === s : true;
        return sameLetter
          ? {
              say: `x + x = ${s}. Voiko x olla ${a}?`,
              task: YESNO(yes, `${a} + ${a} = ${s}.`, `${a} + ${a} = ${2 * a}, ei ${s}. Molemmat x:t ovat sama luku.`),
              hint: `Laita ${a} molempien x:ien paikalle ja laske.`,
              explain: `x + x = ${s}, joten x = ${s / 2}.`,
            }
          : {
              say: `a + b = ${s}. Voiko a olla ${a}?`,
              task: YESNO(true, `Voi: silloin b = ${s - a}. Eri kirjaimet voivat olla eri lukuja.`),
              hint: 'Ovatko kirjaimet samat vai eri? Eri kirjaimet saavat olla eri lukuja.',
              explain: `Kyllä: ${a} + ${s - a} = ${s}. Eri kirjaimet voivat saada eri arvot.`,
            };
      },
      roles: (r) => {
        const pool = r.shuffle(VAR_ROLE), rows = r.shuffle([...pool.filter((x) => x[1] === 0).slice(0, 3), ...pool.filter((x) => x[1] === 1).slice(0, 2)]);
        return {
          say: 'Lajittele merkinnät: onko kirjain yksi tuntematon luku vai muuttuva määrä?',
          task: { kind: 'sort' as const, items: rows.map((x) => t(x[0])), cats: [{ label: 'Yksi luku 🔒' }, { label: 'Monta arvoa 🔁' }], answer: rows.map((x) => x[1]), why: rows.map((x) => x[2]) },
          hint: 'Yhtälö, jossa on annettu luku, toteutuu yhdellä luvulla. Sääntö toimii monella arvolla.',
          explain: 'Yhtälössä kirjain on yksi luku, joka voidaan ratkaista. Säännössä kirjain voi saada monta arvoa.',
        };
      },
    }, (r) => {
      const fixed = r.chance(0.5), s = r.int(3, 9);
      return {
        say: fixed ? `Neliön piiri on 4s, ja tämän neliön piiri on ${4 * s} cm. Onko s tässä yksi tuntematon luku vai muuttuva määrä?` : 'Neliön piiri on 4s, kun sivu on s. Onko s tässä yksi tuntematon luku vai muuttuva määrä?',
        task: { kind: 'choice', options: [t('Yksi tuntematon luku'), t('Muuttuva määrä')], answer: fixed ? 0 : 1, why: fixed ? [undefined, `Piiri on annettu: 4s = ${4 * s} toteutuu vain yhdellä luvulla.`] : ['Sääntö koskee kaikkia neliöitä: s voi olla mikä tahansa sivu.', undefined], cols: 1 },
        hint: fixed ? 'Onko piirin pituus annettu? Silloin s on yksi tietty sivu.' : 'Koskeeko sääntö yhtä neliötä vai kaikkia neliöitä?',
        explain: fixed ? `4s = ${4 * s}, joten s = ${s}: yksi luku.` : 'Sääntö 4s pätee kaikille neliöille: s voi saada monta arvoa.',
      };
    }),
  },
  // ============================================================ evaluating expressions
  {
    id: 'M79-EXPR-EVAL', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Sijoita ja laske', icon: '🧷',
    goal: 'Opit laskemaan lausekkeen arvon, kun muuttujan tilalle sijoitetaan luku. Muista: 3x tarkoittaa 3 · x.',
    intro: 'Laboratorion kaavat odottavat lukuja. Sijoita luku kirjaimen paikalle.',
    reward: 'Sijoitat lukuja lausekkeisiin ja lasket oikein!',
    demo: () => [
      { say: 'Lasketaan kolme x plus kaksi, kun x on neljä. Neljä menee x:n paikalle, ja piilossa ollut kertomerkki tulee näkyviin. Kolme x ei ole kolmekymmentäneljä, vaan kolme kertaa neljä.', scene: evalScene('3', 'x', ' + 2', 4, '3 · 4 + 2', [['= 12 + 2', 'Kertolasku ennen yhteenlaskua: 3 · 4 = 12.'], ['= 14', 'Lopuksi 12 + 2 = 14.']], '34 + 2') },
      { say: 'Kaksi kertaa sulkeissa a plus viisi, kun a on kolme. Sulut lasketaan ensin.', scene: evalScene('2(', 'a', ' + 5)', 3, '2 · (3 + 5)', [['= 2 · 8', 'Sulut ensin: 3 + 5 = 8.'], ['= 16', 'Sitten 2 · 8 = 16.']]) },
      { say: 'Negatiivinen luku sijoitetaan sulkeisiin. Neljä x plus yhdeksän, kun x on miinus kaksi.', scene: evalScene('4', 'x', ' + 9', -2, '4 · (−2) + 9', [['= −8 + 9', 'Positiivinen kertaa negatiivinen on negatiivinen: 4 · (−2) = −8.'], ['= 1', '−8 + 9 = 1.']]) },
    ],
    item: cases({
      linear: (r) => {
        const k = r.int(2, 6), b = r.int(1, 9), x = r.int(2, 9);
        return {
          say: `Laske ${k}x + ${b}, kun x = ${x}.`,
          task: pickNum(r, k * x + b, [Number(`${k}${x}`) + b, k + x === k * x ? k * x : k + x + b], ['Numero ja kirjain vierekkäin tarkoittavat kertolaskua.', k + x === k * x ? `Lisää vielä ${b}.` : 'Kertomerkki ei ole plus.']),
          hint: `Kirjoita näkyviin ${k} · ${x} + ${b} ja laske kertolasku ensin.`,
          explain: `${k} · ${x} + ${b} = ${k * x} + ${b} = ${k * x + b}.`,
        };
      },
      paren: (r) => {
        const k = r.int(2, 5), a = r.int(1, 6), b = r.int(2, 8);
        return wz(ask(`Laske ${k}(a + ${b}), kun a = ${a}.`, k * (a + b), `Sulut ensin: ${a} + ${b} = ${a + b}. Sitten ${k} · ${a + b} = ${k * (a + b)}.`, { hint: `Laske ensin sulut: ${a} + ${b}. Kerro sitten ${k}:lla.` }), {
          [k * a + b]: `Kerroit vain a:n. ${k} kertoo koko sulkeiden sisällön: laske ${a} + ${b} ensin.`,
          [k + a + b]: `${k}(…) tarkoittaa kertolaskua: ${k} · (${a} + ${b}).`,
          [a + b]: `Tämä on sulkeiden arvo. Kerro vielä ${k}:lla.`,
          [Number(`${k}${a + b}`)]: `Numeroita ei kirjoiteta peräkkäin. ${k} · ${a + b}.`,
        });
      },
      neg: (r) => {
        const k = r.int(2, 5), b = r.int(1, 9), x = -r.int(1, 5);
        return wz(ask(`Laske ${k}x + ${b}, kun x = ${N(x)}.`, k * x + b, `${k} · ${P(x)} + ${b} = ${N(k * x)} + ${b} = ${N(k * x + b)}.`, { hint: 'Kirjoita sulut negatiivisen luvun ympärille.' }), {
          [-k * x + b]: `${k} · ${P(x)} on negatiivinen: ${N(k * x)}. Miinusmerkki unohtui.`,
          [k * x - b]: `${b} lisätään, ei vähennetä: ${N(k * x)} + ${b}.`,
          [-(k * x + b)]: `Etumerkki meni väärin. ${N(k * x)} + ${b} = ${N(k * x + b)}.`,
          [k + x + b]: `${k}x tarkoittaa kertolaskua ${k} · ${P(x)}.`,
        });
      },
      match: (r) => {
        let k = 2, b = 1, x = 3, vals: number[] = [];
        for (;;) { k = r.int(2, 4); b = r.int(1, 4); x = r.int(2, 6); vals = [k * x + b, k * (x + b), b * x + k]; if (new Set(vals).size === 3) break; }
        const ex3 = [`${k}x + ${b}`, `${k}(x + ${b})`, `${b === 1 ? '' : b}x + ${k}`];
        const decoy = [Number(`${k}${x}`) + b, k + x + b, k * x].find((c) => !vals.includes(c)) ?? Math.max(...vals) + 1;
        return {
          say: `Sijoita x = ${x} jokaiseen lausekkeeseen. Vedä oikea arvo jokaiselle.`,
          task: { kind: 'place', slots: ex3.map((e, i) => ({ id: `s${i}`, text: `${e} → ▢` })), tokens: r.shuffle([...vals.map((v, i) => ({ id: `v${i}`, text: String(v) })), { id: 'x', text: String(decoy) }]), answer: Object.fromEntries(ex3.map((_, i) => [`s${i}`, `v${i}`])), why: { s0: `${k} · ${x} + ${b} = ${vals[0]}.`, s1: `Sulut ensin: ${k} · (${x} + ${b}) = ${k} · ${x + b} = ${vals[1]}.`, s2: `${b} · ${x} + ${k} = ${vals[2]}.` } } as Q['task'],
          hint: `Kirjoita jokaiseen x:n paikalle ${x}. Sulut ensin, sitten kertolasku, viimeisenä yhteenlasku.`,
          explain: `${ex3[0]} = ${vals[0]}, ${ex3[1]} = ${vals[1]}, ${ex3[2]} = ${vals[2]}.`,
        };
      },
    }, (r) => {
      const base = r.int(3, 6), per = r.int(2, 3), km = r.int(4, 12);
      return wz(ask(`Taksimatkan hinta on ${base} + ${per}k euroa, kun matka on k km. Paljonko maksaa ${km} km?`, base + per * km, `${base} + ${per} · ${km} = ${base} + ${per * km} = ${base + per * km} €.`, { unit: '€', hint: `Sijoita k = ${km}. Laske ensin ${per} · ${km}.` }), {
        [(base + per) * km]: `Laskit ensin ${base} + ${per}. Kertolasku tehdään ennen yhteenlaskua: ${per} · ${km}.`,
        [base + per + km]: `${per}k tarkoittaa ${per} · k, ei ${per} + k.`,
        [per * km]: `Tämä on kilometrien hinta. Lisää aloitusmaksu ${base} €.`,
        [base + Number(`${per}${km}`)]: `${per}k ei ole numerot peräkkäin: ${per} · ${km}.`,
      });
    }),
  },
  // ============================================================ forming expressions
  {
    id: 'M79-EXPR-FORM', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Kirjoita lauseke', icon: '🖊️',
    goal: 'Opit kirjoittamaan lausekkeen sanallisesta tilanteesta.',
    intro: 'Laboratorion tutkija kuvaa tilanteita lyhyesti kirjaimilla ja numeroilla.',
    reward: 'Kirjoitat lausekkeita tilanteista!',
    demo: () => [
      { say: 'Luku n kulkee koneiden läpi: ensin kerrotaan kolmella, sitten lisätään viisi. Syntyy kolme n plus viisi.', scene: pipeScene(3, 5, true) },
      { say: 'Nyt järjestys on toisin päin: ensin lisätään viisi, sitten koko summa kerrotaan kolmella. Sulut pitävät summan yhdessä: kolme kertaa sulut n plus viisi. Tarkistus näyttää, että lausekkeet ovat eri.', scene: pipeScene(3, 5, false) },
      { say: 'Tulitikkuneliöt: ensimmäinen neliö vie neljä tikkua, ja jokainen uusi neliö tuo kolme lisää. Säännöstä tulee lauseke.', scene: matchScene(4) },
    ],
    item: cases({
      words: (r) => {
        const k = r.int(2, 6), b = r.int(1, 9), first = r.chance(0.5);
        const right = first ? `${k}n + ${b}` : `${k}(n + ${b})`, other = first ? `${k}(n + ${b})` : `${k}n + ${b}`;
        return {
          say: first ? `Luku n kerrotaan luvulla ${k} ja tulokseen lisätään ${b}. Mikä lauseke?` : `Lukuun n lisätään ${b} ja summa kerrotaan luvulla ${k}. Mikä lauseke?`,
          task: choose(r, ex(right), [ex(other), ex(`n + ${k} + ${b}`)], [first ? 'Tässä lisätään ensin.' : 'Ilman sulkuja vain n kerrottaisiin.', `Luvulla ${k} kerrotaan, ei lisätä.`]),
          hint: 'Mitä tehdään ensin? Jos ensin lisätään ja vasta sitten kerrotaan, tarvitaan sulut.',
          explain: first ? `Ensin ${k}n, sitten + ${b}: ${right}.` : `Summa n + ${b} kerrotaan: ${right}.`,
        };
      },
      price: (r) => {
        const k = r.int(3, 9), thing = r.pick(['vihko', 'kynä', 'koeputki']);
        return {
          say: `Yksi ${thing} maksaa a euroa. Mikä lauseke kertoo, mitä ${k} kappaletta maksaa?`,
          task: choose(r, ex(`${k}a`), [ex(`a + ${k}`), ex(`${k}`)], [`Hinta ei kasva vain ${k} euroa.`, 'Hinta riippuu myös yhden hinnasta a.']),
          hint: `Kokeile: jos a = 2 €, paljonko ${k} kappaletta maksaa? Kirjoita sama laskutoimitus a:lla.`,
          explain: `${k} kertaa a euroa: ${k}a.`,
        };
      },
      shape: (r) => {
        const sq = r.chance(0.5);
        return {
          say: sq ? 'Neliön sivu on s. Mikä lauseke kertoo piirin?' : 'Tasasivuisen kolmion sivu on s. Mikä lauseke kertoo piirin?',
          task: choose(r, ex(sq ? '4s' : '3s'), [ex(sq ? 's + 4' : 's + 3'), ex('s · s')], ['Sivut lasketaan yhteen, joten s otetaan monta kertaa.', 'Tämä on neliön pinta-ala, ei piiri.']),
          hint: `Piiri on sivujen summa. Montako s:n pituista sivua kuviossa on?`,
          explain: sq ? 'Neljä yhtä pitkää sivua: s + s + s + s = 4s.' : 'Kolme yhtä pitkää sivua: s + s + s = 3s.',
        };
      },
      build: (r) => {
        const k = r.int(2, 6), b = r.int(1, 9), first = r.chance(0.5);
        const target = first ? `${k}n + ${b}` : `${k}(n + ${b})`;
        return {
          say: first ? `Luku n kerrotaan luvulla ${k} ja tulokseen lisätään ${b}. Rakenna lauseke paloista.` : `Lukuun n lisätään ${b} ja summa kerrotaan luvulla ${k}. Rakenna lauseke paloista.`,
          task: { kind: 'build', mode: 'expr', target, tokens: [...new Set([k, b].sort((x, y) => x - y).map(String))].concat(['n', '+', '−', '·', '(', ')']), max: 9 },
          explain: first ? `Ensin ${k}n, sitten + ${b}: ${target}. Myös ${b} + ${k}n kelpaa.` : `Summa n + ${b} kerrotaan: ${target}. Sulut tarvitaan.`,
          hint: 'Kertomerkin voi jättää pois: 3n tarkoittaa kolme kertaa n.',
        };
      },
      translate: (r) => {
        const k = r.int(2, 5), b = r.int(1, 9);
        const rows: [string, string, string][] = [
          [`Luku n kerrotaan luvulla ${k}, ja tulokseen lisätään ${b}.`, `${k}n + ${b}`, `Ensin kerrotaan, sitten lisätään: ${k}n + ${b}.`],
          [`Lukuun n lisätään ${b}, ja summa kerrotaan luvulla ${k}.`, `${k}(n + ${b})`, `Koko summa kerrotaan, joten tarvitaan sulut: ${k}(n + ${b}).`],
          [`Luvusta n vähennetään ${b}.`, `n − ${b}`, `Luvusta n otetaan pois ${b}: n − ${b}. Järjestys on tärkeä.`],
        ];
        return {
          say: 'Lausekekääntäjä: vedä oikea lauseke jokaisen kuvauksen kohdalle.',
          task: { kind: 'place', slots: rows.map((x, i) => ({ id: `s${i}`, text: x[0] })), tokens: r.shuffle([...rows.map((x, i) => ({ id: `v${i}`, text: x[1] })), { id: 'x', text: `${b} − n` }]), answer: Object.fromEntries(rows.map((_, i) => [`s${i}`, `v${i}`])), why: Object.fromEntries(rows.map((x, i) => [`s${i}`, x[2]])) } as Q['task'],
          hint: 'Lue, mitä tehdään ensin. Vähennyslaskussa järjestys on tärkeä: n − 5 ei ole 5 − n.',
          explain: rows.map((x) => x[1]).join(', ') + `. ${b} − n olisi luvusta ${b} vähennetty n.`,
        };
      },
    }, () => {
      return {
        say: 'Tulitikuista tehdään neliöitä riviin. 1 neliö vie 4 tikkua, 2 neliötä 7, 3 neliötä 10. Mikä lauseke kertoo tikkujen määrän, kun neliöitä on n?',
        scene: paint(table(['neliöitä n', 'tikkuja'], [[1, 4], [2, 7], [3, 10]])),
        task: { kind: 'choice', options: [ex('3n + 1'), ex('4n'), ex('n + 3')], answer: 0, why: [undefined, 'Neliöt jakavat seinän: 2 neliötä vie 7 tikkua, ei 8.', 'Kokeile: n = 3 antaa 6, ei 10.'], cols: 3 },
        hint: 'Paljonko tikkuja tulee lisää jokaisesta uudesta neliöstä? Kokeile lauseketta arvolla n = 3.',
        explain: 'Jokainen neliö tuo 3 tikkua lisää, ja alussa on yksi lisätikku: 3n + 1. Tarkistus: 3 · 3 + 1 = 10.',
      };
    }),
  },
  // ============================================================ forming equations
  {
    id: 'M79-EQ1-FORM', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Tilanteesta yhtälöksi', icon: '📝',
    goal: 'Opit muodostamaan yhtälön tilanteesta: tuntematon kirjaimeksi ja kaksi yhtä suurta asiaa yhtäsuuruusmerkin eri puolille.',
    intro: 'Laboratoriossa tutkitaan arvoituksia. Ensin arvoitus kirjoitetaan yhtälöksi.',
    reward: 'Muodostat yhtälöitä tilanteista!',
    demo: () => [
      { say: 'Kolme samanhintaista koeputkea ja neljän euron teline maksavat yhteensä yhdeksäntoista euroa. Koeputken hinta on x: kolme x plus neljä on yhdeksäntoista.', scene: eqBuildScene(3, 4, 19, '3 koeputkea + 4 € teline = 19 €') },
      { say: 'Vaa’assa on kolme pussia ja kahden kilon paino, toisella puolella yksitoista kiloa. Sama yhtälö: kolme x plus kaksi on yksitoista.', scene: eqBuildScene(3, 2, 11, '3 pussia + 2 kg paino = 11 kg') },
    ],
    item: cases({
      shop: (r) => {
        const k = r.int(2, 5), x = r.int(2, 6), b = r.int(2, 8);
        return {
          say: `${k} samanhintaista jäätelöä ja ${b} euron mehu maksavat yhteensä ${k * x + b} €. Jäätelön hinta on x. Mikä yhtälö kertoo tämän?`,
          task: choose(r, ex(`${k}x + ${b} = ${k * x + b}`), [ex(`${k}(x + ${b}) = ${k * x + b}`), ex(`${k} + x + ${b} = ${k * x + b}`)], ['Mehu ostetaan vain kerran.', `Jäätelöitä on ${k}: x kerrotaan luvulla ${k}.`]),
          hint: 'Mitä on monta samanlaista? Mitä ostetaan vain kerran? Mikä on yhteensä?',
          explain: `${k} jäätelöä maksaa ${k}x, mehu ${b} €: ${k}x + ${b} = ${k * x + b}.`,
        };
      },
      age: (r) => {
        const x = r.int(6, 12), dlt = r.int(2, 5);
        return {
          say: `Aava on x vuotta. Loikka on ${dlt} vuotta vanhempi. Yhteensä he ovat ${2 * x + dlt} vuotta. Mikä yhtälö?`,
          task: choose(r, ex(`x + (x + ${dlt}) = ${2 * x + dlt}`), [ex(`x + ${dlt} = ${2 * x + dlt}`), ex(`2x = ${2 * x + dlt} + ${dlt}`)], ['Tämä on vain Loikan ikä. Aavan ikä puuttuu.', `Vanhempi tarkoittaa ${dlt} lisää Loikalle.`]),
          hint: `Kirjoita ensin kummankin ikä: Aava x, Loikka x + ${dlt}. Laske ne yhteen.`,
          explain: `Aava x, Loikka x + ${dlt}: x + (x + ${dlt}) = ${2 * x + dlt}. Silloin x = ${x}.`,
        };
      },
      balance: (r) => {
        const k = r.int(2, 3), x = r.int(2, 5), b = r.int(1, 4);
        return {
          say: 'Mikä yhtälö kertoo, mitä vaa’assa on?',
          scene: paint(balanceArt([...Array(k).fill('x'), String(b)], [String(k * x + b)])),
          task: choose(r, ex(`${k}x + ${b} = ${k * x + b}`), [ex(`x + ${b} = ${k * x + b}`), ex(`${k}x = ${k * x + b} + ${b}`)], [`Pusseja on ${k}.`, 'Paino on vasemmalla puolella pussien kanssa.']),
          hint: 'Kirjoita vasen kuppi =-merkin vasemmalle ja oikea kuppi oikealle.',
          explain: `Vasemmalla ${k} pussia ja ${b}: ${k}x + ${b}. Oikealla ${k * x + b}.`,
        };
      },
      build: (r) => {
        const k = r.int(2, 5), x = r.int(2, 6), b = r.int(2, 8), tot = k * x + b;
        return {
          say: `${k} samanhintaista kynää ja ${b} euron vihko maksavat yhteensä ${tot} €. Kynän hinta on x. Rakenna paloista yhtälö. Älä ratkaise sitä vielä.`,
          task: { kind: 'build', mode: 'eq', target: `${k}x + ${b} = ${tot}`, tokens: [...new Set([k, b, tot].sort((p, q) => p - q).map(String))].concat(['x', '+', '−', '·', '=']), max: 9 },
          hint: 'Kynät maksavat yhteensä luku kertaa x. Lisää vihko. Yhteishinta tulee =-merkin toiselle puolelle.',
          explain: `${k} kynää maksaa ${k}x, vihko ${b} €: ${k}x + ${b} = ${tot}. Myös ${tot} = ${b} + ${k}x kelpaa.`,
        };
      },
      parts: (r) => {
        const k = r.int(2, 5), x = r.int(2, 6), b = r.pick([2, 3, 4, 5, 6, 7, 8].filter((v) => v !== k)), tot = k * x + b;
        const [many, one] = r.pick([['kynää', 'vihko'], ['koeputkea', 'teline'], ['jäätelöä', 'mehu']] as const);
        const rows: [string, string, string][] = [
          ['x tarkoittaa', `yhden hinta`, `x on tuntematon: yhden ${many === 'kynää' ? 'kynän' : many === 'koeputkea' ? 'koeputken' : 'jäätelön'} hinta.`],
          ['x kerrotaan luvulla', String(k), `Samanhintaisia on ${k}, joten ${k}x.`],
          ['lisätään', String(b), `${one} ostetaan kerran: + ${b}.`],
          ['=-merkin toiselle puolelle', String(tot), `Yhteishinta ${tot} € on yhtä suuri kuin ${k}x + ${b}.`],
        ];
        const decoy = [k + b, tot - b, tot + b].find((c) => ![k, b, tot].includes(c))!;
        return {
          say: `${k} samanhintaista ${many} ja ${b} euron ${one} maksavat yhteensä ${tot} €. Vedä tilanteen palat yhtälön osiin.`,
          task: { kind: 'place', slots: rows.map((x2, i) => ({ id: `s${i}`, text: x2[0] })), tokens: r.shuffle([...rows.map((x2, i) => ({ id: `v${i}`, text: x2[1] })), { id: 'x', text: String(decoy) }]), answer: Object.fromEntries(rows.map((_, i) => [`s${i}`, `v${i}`])), why: Object.fromEntries(rows.map((x2, i) => [`s${i}`, x2[2]])) } as Q['task'],
          hint: 'Etsi tuntematon, montako samanlaista, mitä lisätään kerran ja mikä on yhteensä.',
          explain: `${k}x + ${b} = ${tot}.`,
        };
      },
    }, (r) => {
      const x = r.int(2, 6), dlt = r.int(1, 3), p = 2 * x + 2 * (x + dlt);
      return {
        say: `Suorakulmion leveys on x cm ja pituus ${dlt} cm enemmän. Piiri on ${p} cm. Mikä yhtälö?`,
        task: choose(r, ex(`2x + 2(x + ${dlt}) = ${p}`), [ex(`x + x + ${dlt} = ${p}`), ex(`2x + ${dlt} = ${p}`)], ['Piirissä on kaksi leveyttä ja kaksi pituutta.', 'Pituus on x + ' + dlt + ', ja sivuja on neljä.']),
        hint: 'Piiri = kaksi leveyttä + kaksi pituutta. Kirjoita pituus ensin x:n avulla.',
        explain: `Kaksi leveyttä 2x ja kaksi pituutta 2(x + ${dlt}): 2x + 2(x + ${dlt}) = ${p}. Silloin x = ${x}.`,
      };
    }),
  },
  // ============================================================ dividing fractions
  {
    id: 'M79-FRAC-DIV', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Montako mahtuu?', icon: '🥤',
    goal: 'Opit jakamaan murtoluvulla: jakolasku kysyy, montako osaa mahtuu. Jakaminen murtoluvulla on kertomista käänteisluvulla.',
    intro: 'Laboratoriossa kaadetaan liuosta pieniin koeputkiin. Montako koeputkea täyttyy?',
    reward: 'Jaat murtoluvuilla ja tiedät, miksi tulos voi kasvaa!',
    demo: () => [
      { say: 'Kolme jaettuna yhdellä neljäsosalla kysyy: montako neljäsosaa mahtuu kolmeen? Paloja asetetaan janalle ja lasketaan.', scene: measureScene(3, 1, 1, 4) },
      { say: 'Kolme neljäsosaa litraa kaadetaan kahdeksasosan mukeihin. Montako mukia täyttyy?', scene: measureScene(3, 4, 1, 8) },
      { say: 'Kaksi kolmasosaa jaettuna neljällä viidesosalla: pala on isompi kuin jaettava, joten kokonaista palaa ei mahdu. Tulos on alle yhden.', scene: measureScene(2, 3, 4, 5) },
      { say: 'Sääntö: jakaminen murtoluvulla on kertomista sen käänteisluvulla. Käännetään jakaja, ei jaettavaa.', scene: card('a/b : c/d = a/b · d/c', '2/3 : 4/5 = 2/3 · 5/4 = 10/12 = 5/6') },
    ],
    item: cases({
      groups: (r) => {
        const w = r.int(2, 5), n = r.pick([2, 3, 4, 5]);
        return wz(ask(`Montako ${n}-osaa (1/${n}) mahtuu lukuun ${w}?`, w * n, `Jokaiseen kokonaiseen mahtuu ${n}: ${w} : 1/${n} = ${w} · ${n} = ${w * n}.`, { scene: `<div class="formula">${w} : ${fracText(1, n)}</div>`, hint: `Montako ${n}-osaa mahtuu yhteen kokonaiseen? Entä ${w} kokonaiseen?` }), {
          [w / n]: `Tämä on ${w} : ${n}. Kysytään, montako pientä 1/${n}-osaa mahtuu: niitä on paljon.`,
          [w + n]: `Osia ei lasketa yhteen. Jokaiseen kokonaiseen mahtuu ${n} osaa.`,
          [n]: `${n} osaa mahtuu yhteen kokonaiseen. Kokonaisia on ${w}.`,
        });
      },
      fracFrac: (r) => {
        // Same denominator: count how many unit parts fit, e.g. 6/8 : 2/8 = 3.
        const den = r.pick([6, 8, 10, 12]), c = r.int(1, 3), k = r.int(2, Math.floor((den - 1) / c));
        const a = c * k;
        return wz(ask(`${a}/${den} : ${c}/${den} = ?`, k, `Montako ${c}/${den}:aa mahtuu lukuun ${a}/${den}? ${a} osaa jaettuna ${c} osan ryhmiin: ${a} : ${c} = ${k}.`, { scene: `<div class="formula">${fracText(a, den)} : ${fracText(c, den)}</div>`, hint: 'Nimittäjät ovat samat: montako ryhmää osista saa?' }), {
          [a * c]: `Jakolaskussa ei kerrota osoittajia. Montako ${c} osan ryhmää ${a} osasta saa?`,
          [a - c]: 'Tämä on erotus. Jakolasku kysyy, montako kertaa jakaja mahtuu.',
        });
      },
      rule: (r) => {
        const [a, b] = properFrac(r, 5);
        let c = 2, e = 3;
        do { [c, e] = properFrac(r, 7); } while (c < 2 || (c === a && e === b) || (e === a && c === b) || (c === b && e === a));
        return {
          say: `${a}/${b} : ${c}/${e} = ${a}/${b} · ?`,
          task: choose(r, fr(e, c), [fr(c, e), fr(b, a)], ['Jakajan käänteisluku: osoittaja ja nimittäjä vaihtavat paikkaa.', 'Käännetään jakaja, ei jaettavaa.']),
          hint: 'Jakaja on jakomerkin jälkeinen luku. Käännä se ylösalaisin.',
          explain: `Jakaminen luvulla ${c}/${e} on kertomista sen käänteisluvulla ${e}/${c}.`,
        };
      },
      bigger: (r) => {
        const w = r.int(4, 9), n = r.pick([2, 3, 4]);
        return {
          say: `Kumpi on suurempi: ${w} : 1/${n} vai ${w} : ${n}?`,
          task: choose(r, ex(`${w} : 1/${n}`), [ex(`${w} : ${n}`)], ['Jakaminen pienellä luvulla antaa suuren tuloksen: pieniä osia mahtuu paljon.']),
          hint: `Montako 1/${n}-osaa mahtuu lukuun ${w}? Entä montako kertaa ${n} mahtuu lukuun ${w}?`,
          explain: `${w} : 1/${n} = ${w * n}, mutta ${w} : ${n} = ${quot(w, n)}. Jakaminen ei aina pienennä.`,
        };
      },
      grow: (r) => {
        const w = r.int(2, 9);
        const small = r.shuffle(['1/2', '1/3', '1/4', '2/3', '3/4', '2/5', '3/5', '4/5']).slice(0, 3), big = r.shuffle(['2', '3', '4', '3/2', '5/4', '4/3', '5/2']).slice(0, 3);
        const rows = r.shuffle([...small.map((x) => [`${w} : ${x}`, 0, `Jakaja ${x} on alle yksi, joten sitä mahtuu lukuun ${w} enemmän kuin ${w} kertaa.`] as const), ...big.map((x) => [`${w} : ${x}`, 1, `Jakaja ${x} on yli yksi, joten sitä mahtuu lukuun ${w} vähemmän kuin ${w} kertaa.`] as const)]);
        return {
          say: `Lajittele jakolaskut: tuleeko tulokseksi enemmän vai vähemmän kuin ${w}?`,
          task: { kind: 'sort' as const, items: rows.map((x) => t(x[0])), cats: [{ label: `Yli ${w} 📈` }, { label: `Alle ${w} 📉` }], answer: rows.map((x) => x[1]), why: rows.map((x) => x[2]) },
          hint: 'Katso jakajaa: onko se alle vai yli yhden?',
          explain: 'Jos jakaja on alle yksi, tulos on suurempi kuin jaettava. Jos jakaja on yli yksi, tulos on pienempi.',
        };
      },
      calc: (r) => {
        let a = 1, b = 2, c = 1, e = 3;
        do { [a, b] = properFrac(r, 6); [c, e] = properFrac(r, 6); } while (b === e || (a * e) % (b * c) === 0);
        const g = gcd(a * e, b * c);
        return {
          say: `Laske ${a}/${b} : ${c}/${e}. Kirjoita vastaus murtolukuna.`,
          scene: paint(`<div class="formula">${fracText(a, b)} : ${fracText(c, e)}</div>`),
          task: { kind: 'frac', n: (a * e) / g, d: (b * c) / g },
          explain: `Kerrotaan käänteisluvulla: ${a}/${b} · ${e}/${c} = ${a * e}/${b * c}${g > 1 ? ` = ${(a * e) / g}/${(b * c) / g}` : ''}.`,
          hint: 'Käännä jakaja ja kerro: osoittaja kertaa osoittaja, nimittäjä kertaa nimittäjä.',
        };
      },
    }, (r) => {
      const [a, b] = r.pick([[3, 4], [1, 2], [5, 8], [3, 8], [7, 8]] as [number, number][]);
      const cups = (a * 8) / b;
      return wz(ask(`Pullossa on ${a}/${b} litraa mehua. Se kaadetaan 1/8 litran mukeihin. Montako mukia täyttyy?`, cups, `${a}/${b} = ${cups}/8, joten ${a}/${b} : 1/8 = ${cups}.`, { hint: 'Muuta litramäärä kahdeksasosiksi.' }), {
        [8]: 'Kahdeksan mukia on yksi kokonainen litra. Pullossa on vähemmän.',
        [a]: `${a} on vain osoittaja. Muuta ${a}/${b} kahdeksasosiksi.`,
      });
    }),
  },
  // ============================================================ deeper decimal division
  {
    id: 'M79-DEC-DIV', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Desimaalijakaja', icon: '🔬',
    goal: 'Opit jakamaan desimaaliluvulla: kerro jaettava ja jakaja samalla luvulla, niin jakajasta tulee kokonaisluku.',
    intro: 'Mittauksissa jaetaan desimaaliluvuilla. Temppu: siirrä pilkkua molemmissa yhtä paljon.',
    reward: 'Jaat desimaaliluvuilla ja tiedät, että tulos voi kasvaa!',
    demo: () => [
      { say: 'Neljä pilkku viisi jaettuna nolla pilkku yhdeksällä. Kerrotaan molemmat kymmenellä: pilkku hyppää kummassakin yhden askeleen. Osamäärä ei muutu.', scene: commaShiftScene(4.5, 0.9) },
      { say: 'Jakajassa 0,25 on kaksi desimaalia, joten pilkku hyppää kaksi kertaa. Jaettavaan 1,5 tulee nolla tyhjään kohtaan.', scene: commaShiftScene(1.5, 0.25) },
      { say: 'Kun jakaja on alle yksi, tulos on suurempi kuin jaettava. Nollapistevitosia mahtuu kolmeen kuusi.', scene: measureScene(3, 1, 1, 2, '0,5') },
    ],
    item: cases({
      scale: (r) => {
        const q = r.int(2, 9), dv = r.int(2, 9);
        return wz(ask(`${d((q * dv) / 10)} : ${d(dv / 10)} = ${q * dv} : ?`, dv, `Molemmat kerrotaan kymmenellä: ${d((q * dv) / 10)} · 10 = ${q * dv} ja ${d(dv / 10)} · 10 = ${dv}.`, { hint: `Jaettava kerrottiin kymmenellä. Kerro jakajakin kymmenellä.` }), {
          [dv / 10]: 'Jakaja pitää kertoa samalla luvulla kuin jaettava, muuten osamäärä muuttuu.',
          [dv * 10]: 'Kerroit sadalla. Jaettava kerrottiin vain kymmenellä.',
          [q]: `${q} on osamäärä. Kysytään uutta jakajaa.`,
        });
      },
      compute: (r) => {
        const q = r.int(2, 9), dv = r.int(2, 9);
        return wz(ask(`${d((q * dv) / 10)} : ${d(dv / 10)} = ?`, q, `${d((q * dv) / 10)} : ${d(dv / 10)} = ${q * dv} : ${dv} = ${q}.`, { hint: 'Kerro molemmat kymmenellä, niin jakaja on kokonaisluku.' }), {
          [q / 10]: `Siirsit pilkkua vain jakajassa. Myös jaettava kerrotaan kymmenellä: ${q * dv} : ${dv}.`,
          [q * 10]: 'Siirsit pilkkua liikaa. Molempia kerrotaan samalla luvulla.',
        });
      },
      grows: (r) => {
        // Divisors chosen so that every quotient terminates and is written exactly.
        const a = r.int(2, 9), small = r.chance(0.5), dv = small ? r.pick([0.5, 0.2, 0.25]) : r.pick([2, 2.5, 4]);
        return {
          say: `Onko ${a} : ${d(dv)} suurempi kuin ${a}?`,
          task: YESNO(small, `${d(dv)} on alle yksi, joten osia mahtuu enemmän kuin ${a}: ${a} : ${d(dv)} = ${d(a / dv)}.`, `${d(dv)} on yli yksi: ${a} : ${d(dv)} = ${d(a / dv)}.`),
          hint: `Onko jakaja ${d(dv)} alle vai yli yksi?`,
          explain: small ? `${a} : ${d(dv)} = ${d(a / dv)}, enemmän kuin ${a}.` : `${a} : ${d(dv)} = ${d(a / dv)}, vähemmän kuin ${a}.`,
        };
      },
      shift: (r) => {
        const rows: [number, number, number][] = [];
        while (rows.length < 3) {
          const q = r.int(2, 9), dv = r.int(2, 9), n = r.chance(0.6) ? 1 : 2;
          if (!rows.some(([q2, d2, n2]) => q2 * d2 === q * dv && d2 === dv) && !rows.some(([q2, d2, n2]) => d2 === dv && n2 === n && q2 === q)) rows.push([q, dv, n]);
        }
        const lab = ([q, dv, n]: [number, number, number]) => `${d((q * dv) / 10 ** n)} : ${d(dv / 10 ** n)}`;
        const [q0, d0, n0] = rows[0];
        const decoy = `${d((q0 * d0) / 10 ** n0)} : ${d0}`;
        return {
          say: 'Yhdistä jokainen jakolasku samanarvoiseen jakolaskuun, jossa jakaja on kokonaisluku. Yksi lappu on houkutus.',
          task: {
            kind: 'place',
            slots: rows.map((x, i) => ({ id: `s${i}`, text: lab(x) })),
            tokens: r.shuffle([...rows.map(([q, dv], i) => ({ id: `v${i}`, text: `${q * dv} : ${dv}` })), { id: 'x', text: decoy }]),
            answer: Object.fromEntries(rows.map((_, i) => [`s${i}`, `v${i}`])),
            why: Object.fromEntries(rows.map(([q, dv, n], i) => [`s${i}`, `Molemmat kerrotaan ${10 ** n}:lla: ${q * dv} : ${dv} = ${q}.`])),
          } as Q['task'],
          hint: 'Pilkku siirtyy jaettavassa ja jakajassa yhtä monta askelta.',
          explain: rows.map(([q, dv, n]) => `${lab([q, dv, n])} = ${q * dv} : ${dv}`).join(', ') + '.',
        };
      },
    }, (r) => {
      const ms = r.pick([5, 10, 15, 20, 25]);
      const kmh = ms * 3.6;
      return ask(`Vene kulkee ${d(kmh)} km/h. Muunna metreiksi sekunnissa jakamalla luvulla 3,6.`, ms, `${d(kmh)} : 3,6 = ${d(kmh * 10)} : 36 = ${ms} m/s.`, { unit: 'm/s', hint: 'Kerro molemmat kymmenellä: jakajasta tulee 36.', whyAt: { [Math.round(kmh * 3.6 * 100) / 100]: 'Kerroit luvulla 3,6. Muunnettaessa km/h → m/s jaetaan.', [kmh]: 'Tämä on alkuperäinen nopeus km/h.' } });
    }),
  },
  // ============================================================ value tables
  {
    id: 'M79-FUNC-TABLE', stop: 'Arvotaulukko', icon: '🗂️', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit tekemään funktiolle arvotaulukon: jokaiselle x:lle lasketaan y sääntöä käyttäen.',
    intro: 'Funktiokone tuottaa lukuja. Arvotaulukkoon kirjataan, mitä mistäkin tulee.',
    reward: 'Teet arvotaulukoita ja tunnistat säännön taulukosta!',
    demo: () => [
      { say: 'Funktio y on kaksi x plus yksi. Jokainen x lasketaan säännöllä vuorotellen, ja tulos kirjataan omalle rivilleen. Lopuksi katsotaan, mitä taulukko kertoo säännöstä.', scene: tableFillScene(2, 1) },
      { say: 'Sama toimii negatiivisilla luvuilla: y on kolme x miinus kaksi. Kun x on miinus yksi, y on miinus viisi. Kerroin näkyy kasvuna, vakio rivillä x on nolla.', scene: tableFillScene(3, -2, [-1, 0, 1, 2]) },
    ],
    item: cases({
      fill: (r) => {
        const k = r.int(2, 4), b = r.int(-3, 4), miss = r.int(1, 4), y = k * miss + b;
        const B = b ? (b > 0 ? ` + ${b}` : ` − ${-b}`) : '';
        const expr = `y = ${k}x${B}`;
        return wz(ask(`Täydennä taulukko: ${expr}.`, y, `Kun x = ${miss}: ${k} · ${miss}${B} = ${N(y)}.`, { scene: table(['x', expr], [0, 1, 2, 3, 4].map((x) => [x, x === miss ? '?' : N(k * x + b)])), hint: `Sijoita x = ${miss} sääntöön, tai lisää ${k} edellisen rivin y-arvoon.` }),
          { [k + miss + b]: `${k}x tarkoittaa ${k} · x, ei ${k} + x.`, [k * miss]: b ? `Vakio ${N(b)} unohtui.` : '', [k * (miss + b)]: `Kerro ensin: ${k} · ${miss}, sitten ${b < 0 ? 'vähennä' : 'lisää'} ${Math.abs(b)}.`, [y + k]: 'Tämä on seuraavan rivin arvo.', [y - k]: 'Tämä on edellisen rivin arvo.' });
      },
      rule: (r) => {
        const k = r.int(2, 5), b = r.int(1, 5);
        const rows = [0, 1, 2, 3].map((x) => [x, k * x + b]);
        const good = `y = ${k}x + ${b}`;
        const opts: [string, string][] = [[`y = x + ${k + b}`, `Kokeile x = 0: y:n pitää olla ${b}, mutta tästä tulee ${k + b}.`], [`y = ${b}x + ${k}`, `Kerroin ja vakio ovat vaihtaneet paikkaa: x = 0 antaisi ${k}, ei ${b}.`], [`y = ${k + b}x`, `Toimii vain rivillä x = 1. Kun x = 0, y:n pitää olla ${b}.`]];
        const seen = new Set([good]), keep = opts.filter((o) => !seen.has(o[0]) && (seen.add(o[0]), true));
        return {
          say: 'Mikä sääntö tuottaa taulukon?',
          scene: paint(table(['x', 'y'], rows)),
          task: choose(r, ex(good), keep.map((o) => ex(o[0])), keep.map((o) => o[1])),
          hint: 'Paljonko y kasvaa joka rivillä? Mikä y on, kun x = 0?',
          explain: `Kun x kasvaa yhdellä, y kasvaa ${k}: kerroin on ${k}. Kun x = 0, y = ${b}.`,
        };
      },
      table: (r) => {
        const k = r.int(2, 4), b = r.int(0, 3);
        const ok = [0, 1, 2].map((x) => `${x} → ${k * x + b}`).join(', ');
        const cands: [string, string][] = [
          [[0, 1, 2].map((x) => `${x} → ${k * x + b + (x === 2 ? 1 : 0)}`).join(', '), `Viimeinen arvo on väärin: ${k} · 2${b ? ` + ${b}` : ''} = ${2 * k + b}.`],
          [[0, 1, 2].map((x) => `${x} → ${b * x + k}`).join(', '), 'Kerroin ja vakio ovat vaihtaneet paikkaa.'],
          [[0, 1, 2].map((x) => `${x} → ${x + k + b}`).join(', '), `Tässä y kasvaa vain yhdellä. Kertoimen ${k} takia y kasvaa ${k} joka askeleella.`],
        ];
        const seen = new Set([ok]), keep = cands.filter((o) => !seen.has(o[0]) && (seen.add(o[0]), true));
        return {
          say: `Mikä taulukko kuuluu säännölle y = ${k}x${b ? ` + ${b}` : ''}?`,
          task: choose(r, t(ok), keep.map((o) => t(o[0])), keep.map((o) => o[1])),
          hint: 'Laske itse y, kun x = 0, 1 ja 2, ja vertaa.',
          explain: `Lasketaan: ${ok}.`,
        };
      },
      detect: (r) => {
        let k = 2, b = 1;
        for (;;) { k = r.int(2, 5); b = r.int(1, 7); const v = [k, b, 5 * k + b, k + b, 5 * k]; if (new Set(v).size === v.length) break; }
        return {
          say: 'Säännönetsivä: lue taulukosta kerroin ja vakio, ja ennusta y, kun x = 5. Yksi lappu jää yli.',
          scene: paint(table(['x', 'y'], [0, 1, 2, 3].map((x) => [x, k * x + b]))),
          task: {
            kind: 'place',
            slots: [{ id: 'k', text: 'kerroin: y kasvaa joka rivillä ▢' }, { id: 'b', text: 'vakio: y, kun x = 0 → ▢' }, { id: 'p', text: 'ennuste: x = 5 → y = ▢' }],
            tokens: r.shuffle([{ id: 'vk', text: String(k) }, { id: 'vb', text: String(b) }, { id: 'vp', text: String(5 * k + b) }, { id: 'd1', text: String(k + b) }, { id: 'd2', text: String(5 * k) }]),
            answer: { k: 'vk', b: 'vb', p: 'vp' },
            why: { k: `${b} → ${k + b} → ${2 * k + b}: kasvu on ${k}.`, b: `Rivillä x = 0 lukee y = ${b}.`, p: `y = ${k} · 5 + ${b} = ${5 * k + b}.` },
          } as Q['task'],
          hint: 'Kasvu on kahden peräkkäisen y:n erotus. Ennusteessa muista lisätä vakio.',
          explain: `Sääntö on y = ${k}x + ${b}, joten x = 5 antaa ${5 * k + b}.`,
        };
      },
    }, (r) => {
      const b = r.int(0, 2);
      const xs = [0, 1, 2, 3], ys = xs.map((x) => x + b);
      return {
        say: `Laske arvotaulukko säännölle y = x${b ? ` + ${b}` : ''} ja merkitse pisteet, kun x = 0, 1, 2 ja 3.`,
        task: { kind: 'plot', xs, ys, xMax: 6, yMax: 6, xStep: 1, yStep: 1, xLabel: 'x', yLabel: 'y' },
        hint: `Laske ensin y jokaiselle x:lle. Piste (x, y): ensin oikealle x, sitten ylös y.`,
        explain: `Pisteet: ${xs.map((x, i) => `(${x}, ${ys[i]})`).join(', ')}.`,
      };
    }),
  },
  // ============================================================ adding integers
  {
    id: 'M79-INT-ADD', stop: 'Hypyt lukusuoralla', icon: '🐸', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit laskemaan yhteen negatiivisia lukuja lukusuoran avulla: positiivinen luku vie oikealle, negatiivinen vasemmalle.',
    intro: 'Loikka hyppii jäälahden lukusuoralla. Plus-hyppy menee oikealle, miinus-hyppy vasemmalle.',
    reward: 'Lasket kokonaislukuja yhteen varmasti!',
    demo: () => [
      { say: 'Miinus kolme plus viisi: aloitetaan kohdasta miinus kolme ja hypätään viisi oikealle.', scene: iceHops(-6, 6, [{ from: -3, to: 2, say: '−3 + 5 = 2' }], 'Plus vie oikealle. Nollan yli mentiin ja päädyttiin kahteen.') },
      { say: 'Miinus neljä plus miinus kolme: negatiivisen lisääminen vie vasemmalle.', scene: iceHops(-9, 3, [{ from: -4, to: -7, say: '(−4) + (−3) = −7' }], 'Kaksi miinusta peräkkäin: mennään yhä kauemmas vasemmalle.') },
      { say: 'Toinen tapa: plus- ja miinusnapit. Plus ja miinus yhdessä on nolla, joten parit kumoavat toisensa. Jäljelle jäävät napit ovat summa.', scene: zeroPairScene(-6, 4) },
    ],
    item: cases({
      line: (r) => {
        const a = -r.int(2, 7), b = r.int(2, 9);
        return {
          say: `${N(a)} + ${b} = ? Merkitse vastaus lukusuoralle.`,
          task: { ...line(a + b), whyAt: { [a - b]: 'Hyppäsit vasemmalle. Plus vie oikealle.', [-a + b]: `Aloitit kohdasta ${-a}, mutta lähtö on ${N(a)}.`, [-(a + b)]: 'Etumerkki on väärin päin.' } },
          hint: `Aloita kohdasta ${N(a)} ja hyppää ${b} askelta oikealle.`,
          explain: `${N(a)}:sta ${b} askelta oikealle: ${N(a + b)}.`,
        };
      },
      negneg: (r) => {
        const a = -r.int(2, 9), b = -r.int(2, 9);
        return wz(ask(`${P(a)} + ${P(b)} = ?`, a + b, `Kaksi miinus-hyppyä vasemmalle: ${N(a)} − ${-b} = ${N(a + b)}.`, { hint: 'Negatiivisen luvun lisääminen vie vasemmalle.' }),
          { [-(a + b)]: 'Kaksi negatiivista yhteen antaa negatiivisen: molemmat hypyt menevät vasemmalle.', [a - b]: `Hyppäsit ${-b} oikealle. Negatiivisen lisääminen vie vasemmalle.` });
      },
      mixed: (r) => {
        const a = -r.int(4, 9), b = r.int(1, 3);
        return {
          say: `${N(a)} + ${b} = ?`,
          task: pickNum(r, a + b, [a - b, -(a + b), -a + b], ['Plus vie oikealle, ei vasemmalle.', 'Merkki on väärin päin: miinusnappeja on enemmän, joten tulos on negatiivinen.', `Aloita kohdasta ${N(a)}, ei ${-a}.`], { lo: -20, opt: (x) => ex(N(x)) }),
          hint: `${b} plusnappia kumoaa ${b} miinusnappia. Montako miinusnappia jää?`,
          explain: `${N(a)}:sta ${b} oikealle: ${N(a + b)}.`,
        };
      },
      sign: (r) => {
        const mk = (): [number, number] => { for (;;) { const x = r.int(-9, 9), y = r.int(-9, 9); if (x && y && x + y && (x < 0 || y < 0)) return [x, y]; } };
        const rows = [mk(), mk(), mk(), mk(), mk()];
        if (rows.every(([x, y]) => x + y < 0)) rows[0] = [-2, 7]; else if (rows.every(([x, y]) => x + y > 0)) rows[0] = [3, -8];
        const s = ([x, y]: [number, number]) => `${N(x)} + ${y < 0 ? `(${N(y)})` : y}`;
        return {
          say: 'Laskematta loppuun: tuleeko summasta negatiivinen vai positiivinen?',
          task: { kind: 'sort' as const, items: rows.map((q) => t(s(q))), cats: [{ label: 'Negatiivinen ❄️' }, { label: 'Positiivinen ☀️' }], answer: rows.map(([x, y]) => (x + y < 0 ? 0 : 1)), why: rows.map(([x, y]) => (x < 0 && y < 0 ? 'Molemmat ovat negatiivisia: summa on negatiivinen.' : `${Math.abs(Math.min(x, y))} miinusta ja ${Math.max(x, y)} plussaa: ${x + y < 0 ? 'miinuksia' : 'plussia'} on enemmän.`)) },
          hint: 'Vertaa: kumpia nappeja on enemmän, plussia vai miinuksia?',
          explain: 'Etumerkki tulee siltä, jonka itseisarvo on suurempi. Kaksi negatiivista antaa aina negatiivisen.',
        };
      },
    }, (r) => {
      const a = -r.int(3, 9), b = r.int(4, 12);
      return wz(ask(`Aamulla lämpötila oli ${N(a)} °C. Päivällä se nousi ${b} astetta. Mikä oli lämpötila päivällä?`, a + b, `${N(a)} + ${b} = ${N(a + b)} °C.`, { unit: '°C', hint: `Lähde mittarissa kohdasta ${N(a)} ja nouse ${b} astetta.` }),
        { [a - b]: 'Lämpötila nousi, joten mennään ylöspäin, ei alaspäin.', [-a + b]: `Aloitit ${-a} asteesta, mutta aamulla oli pakkasta: ${N(a)}.`, [-(a + b)]: 'Etumerkki on väärin päin.' });
    }),
  },
  {
    id: 'M79-INT-MUL', stop: 'Merkkisääntö kertolaskussa', icon: '✖️', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit kertomaan kokonaislukuja: eri merkkiset tekijät antavat negatiivisen tulon, samanmerkkiset positiivisen.',
    intro: 'Laboratorion kaavat tuottavat negatiivisia lukuja. Mitä tapahtuu, kun niitä kerrotaan?',
    reward: 'Osaat merkkisäännön ja ymmärrät, mistä se tulee!',
    demo: () => [
      { say: 'Kolme kertaa miinus kaksi: kolme kahden askeleen hyppyä vasemmalle.', scene: iceHops(-8, 2, [{ from: 0, to: -2, say: '1. hyppy' }, { from: -2, to: -4, color: 'var(--blue)', say: '2. hyppy' }, { from: -4, to: -6, say: '3. hyppy' }], '3 · (−2) = −6: kolme kertaa −2.') },
      { say: 'Kaava: kolme kertaa kaksi, yksi, nolla… Tulos pienenee joka rivillä kolmella. Mitä tapahtuu, kun kaava jatkuu nollan ohi?', scene: mulPatternScene(3, [2, 1, 0, -1, -2]) },
      { say: 'Sama kaava luvulla miinus kolme: nyt tulos kasvaa joka rivillä kolmella. Siksi miinus kertaa miinus on plus.', scene: mulPatternScene(-3, [2, 1, 0, -1, -2]) },
    ],
    item: cases({
      pattern: (r) => {
        const k = r.int(2, 5), m = -r.int(1, 3);
        return wz(ask(`Jatka kaavaa: ${k} · 2 = ${2 * k}, ${k} · 1 = ${k}, ${k} · 0 = 0, ${k} · ${P(m)} = ?`, k * m, `Tulos pienenee joka askeleella ${k}: ${k} · ${P(m)} = ${N(k * m)}.`, { hint: 'Paljonko tulos pienenee joka askeleella?' }),
          { [-k * m]: 'Tulos pienenee joka askeleella, joten nollan jälkeen se menee negatiiviseksi.', [0]: 'Nolla oli edellisen rivin tulos. Kaava jatkuu siitä alaspäin.' });
      },
      sign: (r) => {
        const a = -r.int(2, 9), b = r.int(2, 9), [x, y] = r.shuffle([a, b]);
        return {
          say: `${P(x!)} · ${P(y!)} = ?`,
          task: pickNum(r, a * b, [-a * b, a + b, a * b + b], ['Eri merkkiset tekijät: tulo on negatiivinen.', 'Tämä on summa, ei tulo.', `Tulossa on yksi ${b} liikaa: ${b} kertaa ${-a} on ${-a * b}.`], { lo: -100, opt: (v) => ex(N(v)) }),
          hint: 'Laske ensin ilman merkkejä. Sitten: ovatko tekijät eri merkkisiä?',
          explain: `Eri merkkiset: tulo negatiivinen. ${-a} · ${b} = ${-a * b}, joten vastaus on ${N(a * b)}.`,
        };
      },
      negneg: (r) => {
        const a = -r.int(2, 9), b = -r.int(2, 9);
        return wz(ask(`${P(a)} · ${P(b)} = ?`, a * b, `Samanmerkkiset tekijät: tulo on positiivinen. ${-a} · ${-b} = ${a * b}.`, { hint: 'Kaksi miinusta kertolaskussa: tulo on positiivinen.' }),
          { [-a * b]: 'Samanmerkkiset tekijät antavat positiivisen tulon.', [a + b]: 'Tämä on summa, ei tulo.' });
      },
      signs: (r) => {
        const f = () => r.int(2, 7), rows: [string, number][] = r.shuffle([
          [`${N(-f())} · ${f()}`, -1], [`${f()} · ${P(-f())}`, -1], [`${P(-f())} · ${P(-f())}`, 1], [`${f()} · ${f()}`, 1],
          [`${P(-f())} · ${P(-f())} · ${P(-f())}`, -1], [`${P(-1)} · ${P(-1)} · ${f()}`, 1],
        ] as [string, number][]).slice(0, 5);
        if (new Set(rows.map((x) => x[1])).size < 2) rows[0] = rows[0]![1] < 0 ? ['(−2) · (−3)', 1] : ['(−2) · 3', -1];
        const minus = (s: string) => (s.match(/−/g) ?? []).length;
        return {
          say: 'Laskematta: onko tulo negatiivinen vai positiivinen?',
          task: { kind: 'sort' as const, items: rows.map(([s]) => t(s)), cats: [{ label: 'Negatiivinen ❄️' }, { label: 'Positiivinen ☀️' }], answer: rows.map(([, v]) => (v < 0 ? 0 : 1)), why: rows.map(([s, v]) => `${minus(s)} miinusmerkkistä tekijää: ${v < 0 ? 'pariton määrä, tulo negatiivinen' : minus(s) ? 'parillinen määrä, miinukset kumoavat toisensa pareittain' : 'ei miinuksia, tulo positiivinen'}.`) },
          hint: 'Laske miinusmerkkiset tekijät. Kaksi miinusta kumoaa toisensa.',
          explain: 'Parillinen määrä negatiivisia tekijöitä antaa positiivisen tulon, pariton negatiivisen.',
        };
      },
    }, (r) => {
      const rate = r.int(2, 6), h = r.int(2, 5);
      return wz(ask(`Altaan vedenpinta laskee ${rate} cm tunnissa: muutos on ${N(-rate)} cm tunnissa. Paljonko pinta muuttuu ${h} tunnissa? Kirjoita muutos etumerkillä.`, -rate * h, `${h} · ${P(-rate)} = ${N(-rate * h)} cm: pinta laskee ${rate * h} cm.`, { unit: 'cm', hint: `Kerro tunnit muutoksella tunnissa: ${h} · ${P(-rate)}.` }),
        { [rate * h]: 'Pinta laskee, joten muutos on negatiivinen.', [-rate - h]: 'Laskit yhteen. Joka tunti muutos on sama, joten kerro.' });
    }),
  },
  {
    id: 'M79-INT-DIV', stop: 'Merkkisääntö jakolaskussa', icon: '➗', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit jakamaan kokonaislukuja: merkkisääntö on sama kuin kertolaskussa, koska jakolasku tarkistetaan kertolaskulla.',
    intro: 'Laboratoriossa muutos jaetaan tasan. Merkki päätellään kertolaskusta.',
    reward: 'Jaat kokonaislukuja ja tarkistat merkin kertolaskulla!',
    demo: () => [
      { say: 'Miinus kaksitoista jaetaan tasan kolmeen laatikkoon. Napit jaetaan yksi kerrallaan.', scene: divChipScene(-12, 3) },
      { say: 'Miinus kaksikymmentä jaettuna miinus neljällä: montako miinus neljän ryhmää saadaan? Ryhmien määrä on positiivinen.', scene: divChipScene(-20, -4) },
      { say: 'Merkki tarkistetaan aina kertolaskulla: jakaja kertaa vastaus on jaettava.', scene: card('(−12) : 3 = −4, koska 3 · (−4) = −12', '(−20) : (−4) = 5, koska (−4) · 5 = −20', '12 : (−3) = −4, koska (−3) · (−4) = 12') },
    ],
    item: cases({
      sign: (r) => {
        const q = r.int(2, 9), dv = r.int(2, 6);
        return wz(ask(`${P(-q * dv)} : ${dv} = ?`, -q, `${dv} · ${P(-q)} = ${N(-q * dv)}, joten vastaus on ${N(-q)}.`, { hint: 'Mikä luku kerrottuna jakajalla antaa jaettavan?' }),
          { [q]: `Tarkista: ${dv} · ${q} = ${q * dv}, ei ${N(-q * dv)}. Eri merkkiset antavat negatiivisen.`, [-q * dv - dv]: 'Tämä on erotus, ei osamäärä.' });
      },
      negneg: (r) => {
        const q = r.int(2, 9), dv = -r.int(2, 6);
        return wz(ask(`${P(q * dv)} : ${P(dv)} = ?`, q, `${P(dv)} · ${q} = ${N(q * dv)}, joten vastaus on ${q}.`, { hint: 'Samanmerkkiset luvut: onko osamäärä positiivinen vai negatiivinen?' }),
          { [-q]: `Tarkista: ${P(dv)} · ${P(-q)} = ${-q * dv}, ei ${N(q * dv)}. Samanmerkkiset antavat positiivisen.` });
      },
      check: (r) => {
        const q = -r.int(2, 9), dv = r.int(2, 6);
        return {
          say: `Miten tarkistat, että ${P(q * dv)} : ${dv} = ${N(q)}?`,
          task: choose(r, ex(`${dv} · ${P(q)} = ${N(q * dv)}`), [ex(`${dv} · ${-q} = ${-q * dv}`), ex(`${P(q * dv)} + ${dv} = ${N(q * dv + dv)}`)], ['Merkki jäi pois: tuloksen pitää olla jaettava, ' + N(q * dv) + '.', 'Jakolasku tarkistetaan kertolaskulla.']),
          hint: 'Jakaja kertaa vastaus = jaettava.',
          explain: `Jakaja kertaa osamäärä on jaettava: ${dv} · ${P(q)} = ${N(q * dv)}.`,
        };
      },
      quot: (r) => {
        for (;;) {
          const a = r.int(2, 6), b = r.int(2, 5), c = r.int(2, 6), d = r.int(2, 5), e = r.int(2, 6), f = r.int(2, 5);
          const rows: [string, number, string][] = [[`${P(-a * b)} : ${b}`, -a, `${b} · ${P(-a)} = ${N(-a * b)}.`], [`${P(-c * d)} : ${P(-d)}`, c, `${P(-d)} · ${c} = ${N(-c * d)}.`], [`${e * f} : ${P(-f)}`, -e, `${P(-f)} · ${P(-e)} = ${e * f}.`]];
          const vals = [...rows.map((x) => x[1]), a];
          if (new Set(vals).size < 4) continue;
          return {
            say: 'Yhdistä jokainen jakolasku vastaukseensa. Yksi lappu jää yli.',
            task: { kind: 'place', slots: rows.map(([s], i) => ({ id: `s${i}`, text: `${s} → ▢` })), tokens: r.shuffle([...rows.map(([, v], i) => ({ id: `q${i}`, text: N(v) })), { id: 'x', text: N(a) }]), answer: Object.fromEntries(rows.map((_, i) => [`s${i}`, `q${i}`])), why: Object.fromEntries(rows.map(([, , w], i) => [`s${i}`, `Tarkistus: ${w}`])) },
            hint: 'Eri merkkiset → negatiivinen, samanmerkkiset → positiivinen. Tarkista kertolaskulla.',
            explain: `Lappu ${a} jää yli: siinä ensimmäisen jakolaskun etumerkki on väärin.`,
          };
        }
      },
    }, (r) => {
      const x = -r.int(2, 6), b = r.int(1, 5), k = r.int(2, 3);
      const rhs = k * x - b;
      return wz(ask(`Ratkaise yhtälö ${k}x − ${b} = ${N(rhs)}.`, x, `${k}x = ${N(rhs)} + ${b} = ${N(rhs + b)}. x = ${P(rhs + b)} : ${k} = ${N(x)}.`, { hint: `Lisää ensin ${b} molemmille puolille.` }),
        { [-x]: `Etumerkki: ${P(rhs + b)} : ${k} on negatiivinen.`, [(rhs - b) / k]: `Vähensit ${b}, mutta −${b} kumotaan lisäämällä ${b}.` });
    }),
  },
];


