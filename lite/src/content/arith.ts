// Picnic (eväsretki): joining, equal groups, quotition division, "times as many".
import type { Rng } from '../engine/rng';
import type { NodeSpec, Option } from '../engine/types';
import { svg, THINGS, scatter } from '../ui/art';
import { PLURAL } from './plural';
import { word } from './fi';
import { cases, choose, groupArt, paint, txt } from './kit';
import { bagupScene, joinScene, moreVsTimes, packScene, timesTower } from './countanim';
import { AUDIT_REV } from './audit-rev';

const n$ = (n: number): Option => ({ big: String(n), speak: word(n) });
const many = (k: string, n: number) => (n === 1 ? THINGS[k]!.one : THINGS[k]!.many);
const FOOD = ['marja', 'kala', 'kapy', 'simpukka'];

/** Bags with the given counts of things. */
function bagsArt(r: Rng, kind: string, counts: number[], w = 320) {
  const bw = Math.min(90, (w - 10) / counts.length - 8);
  const H = 110;
  return svg(w, H, counts.map((c, i) => {
    const x0 = 6 + i * (bw + 8);
    const size = c > 4 ? 18 : 22;
    const pts = scatter(c, bw - 10, H - 30, size, r.next);
    return `<path d="M${x0} 22 h${bw} l-6 ${H - 26} h-${bw - 12} z" fill="#e8d7b0" stroke="#b79b62" stroke-width="2"/>` + pts.map((p) => THINGS[kind]!.draw(x0 + 5 + p.x, 26 + p.y, size)).join('');
  }).join(''));
}

function tower(n: number, x: number, col: string, U = 16) {
  return Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${220 - (i + 1) * U}" width="44" height="${U - 2}" rx="3" fill="${col}"/>`).join('');
}

export const ARITH_NODES: NodeSpec[] = [
  {
    id: 'M-ADD-01', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Yhteinen kori', icon: '🧺',
    goal: 'Opit, että yhteenlasku yhdistää kaksi määrää yhdeksi.',
    intro: 'Loikka ja Aava laittavat eväänsä samaan koriin.',
    reward: 'Kaikki eväät ovat korissa!',
    demo: (r) => [
      { say: 'Loikalla on kolme marjaa ja Aavalla kaksi. Ne laitetaan samaan koriin. Kun Loikan kolme on korissa, laskeminen jatkuu: neljä, viisi. Korissa on viisi marjaa. Kolme plus kaksi on viisi.', scene: joinScene('marja', 3, 2) },
      { say: 'Plus tarkoittaa: laitetaan yhteen. Ensin oli kaksi erillistä joukkoa, nyt yksi iso.', scene: joinScene('kala', 4, 3) },
    ],
    item: cases({
      join: (r) => {
        const a = r.int(1, 5), b = r.int(1, 5), k = r.pick(FOOD);
        return {
          say: `Loikalla on ${word(a)} ${many(k, a)}. Aavalla on ${word(b)}. Ne laitetaan samaan koriin. Montako korissa on?`,
          scene: paint(groupArt(r, k, a, 'line', 150, 70, 26) + groupArt(r, k, b, 'line', 150, 70, 26)),
          task: (() => {
            const ws = [...new Set([a, b, a + b + 1])].filter((x) => x !== a + b).slice(0, 2);
            const why = (x: number) => x === a ? `${a} on vain Loikan eväät. Aavan ${b} tulivat myös koriin.` : x === b ? `${b} on vain Aavan eväät. Loikan ${a} tulivat myös koriin.` : 'Yksi liikaa: laske uudelleen, ja sano jokaiselle vain yksi luku.';
            return choose(r, n$(a + b), ws.map(n$), ws.map(why));
          })(),
          hint: 'Laske ensin Loikan ja jatka sitten Aavan eväillä.',
          explain: `${a} ja vielä ${b} on yhteensä ${a + b}. Molempien eväät tulivat koriin.`,
        };
      },
      expr: (r) => {
        const a = r.int(1, 6), b = r.int(1, 4);
        const ws = [...new Set([a + b - 1, a + b + 1, a])].filter((x) => x !== a + b && x >= 0).slice(0, 2);
        const why = (x: number) => x === a ? `${a} on vain ensimmäinen luku. Siihen lisätään vielä ${b}.` : x === a + b - 1 ? `Yksi jäi laskematta: ${a} ja vielä ${b} askelta eteenpäin.` : `Yksi liikaa: aloita luvusta ${a} ja ota ${b} askelta.`;
        return { say: `Paljonko on ${a} + ${b}?`, task: choose(r, n$(a + b), ws.map(n$), ws.map(why)), hint: `Pidä ${a} mielessä ja laske ${b} eteenpäin.`, explain: `${a} + ${b} = ${a + b}.` };
      },
      sentence: (r) => {
        const a = r.int(1, 5), b = r.int(1, 4), k = r.pick(FOOD), n = a + b;
        return {
          say: `Loikalla on ${word(a)} ${many(k, a)} ja Aavalla ${word(b)}. Ne laitetaan samaan koriin. Kirjoita lasku.`,
          scene: paint(groupArt(r, k, a, 'line', 150, 70, 26) + groupArt(r, k, b, 'line', 150, 70, 26)),
          task: { kind: 'build' as const, mode: 'fact' as const, target: `${a} + ${b} = ${n}`, tokens: [...new Set([a, b, n].sort((x, y) => x - y).map(String))].concat(['+', '=']), max: 6 },
          hint: `Ensin Loikan määrä, sitten plus ja Aavan määrä, sitten = ja koko korin määrä.`,
          explain: `${a} + ${b} = ${n}: ${word(a)} ja ${word(b)} yhteen on ${word(n)}.`,
        };
      },
    }, (r) => {
      const a = r.int(2, 4), b = r.int(1, 3), k = r.pick(FOOD);
      return {
        say: `Loikka toi ${word(a)} ${many(k, a)}, Aava toi ${b === 1 ? 'yhden' : word(b)}. Sitten löytyi vielä yksi. Montako niitä on nyt?`,
        task: choose(r, n$(a + b + 1), [n$(a + b), n$(a + b + 2)], [`${a + b} on vain Loikan ja Aavan eväät. Löydetty yksi tulee vielä lisää.`, 'Löytyi vain yksi lisää, ei kahta.']),
        hint: 'Kolme osaa: Loikan, Aavan ja löydetty yksi. Laske ne kaikki yhteen.',
        explain: `${a} + ${b} + 1 = ${a + b + 1}.`,
      };
    }),
  },
  {
    id: 'M-MUL-01', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Eväspussit', icon: '🎒',
    intro: 'Jokaiseen eväspussiin laitetaan yhtä monta.',
    reward: 'Pussit on pakattu tasan!',
    demo: (r) => [
      { say: 'Kolme pussia, ja jokaiseen laitetaan kaksi marjaa. Kaksi, neljä, kuusi. Kaksi plus kaksi plus kaksi on kuusi. Sama lyhyesti: kolme kertaa kaksi on kuusi.', scene: packScene('marja', 3, 2) },
      { say: 'Ensimmäinen luku kertoo, montako pussia. Toinen kertoo, montako jokaisessa pussissa. Neljä kertaa kolme: neljä pussia, jokaisessa kolme.', scene: packScene('simpukka', 4, 3) },
    ],
    item: cases({
      total: (r) => {
        const k = r.int(2, 4), g = r.int(2, 4), f = r.pick(FOOD);
        return {
          say: `Pusseja on ${word(k)}. Jokaisessa on ${word(g)} ${many(f, g)}. Montako on kaikkiaan?`,
          scene: paint(bagsArt(r, f, Array(k).fill(g))),
          task: (() => {
            const ws = [...new Set([k + g, k * g + g, k * g - 1])].filter((x) => x !== k * g).slice(0, 2);
            const why = (x: number) => x === k + g ? `Pussien määrää (${k}) ei lisätä yhden pussin määrään (${g}). Lasketaan kaikkien pussien sisällöt.` : x === k * g + g ? `Siinä on yksi pussi liikaa: pusseja on ${k}.` : 'Yksi jäi laskematta.';
            return choose(r, n$(k * g), ws.map(n$), ws.map(why));
          })(),
          hint: `Laske pussi kerrallaan: ${Array.from({ length: Math.min(k, 2) }, (_, i) => (i + 1) * g).join(', ')}, …`,
          explain: `${Array(k).fill(g).join(' + ')} = ${k * g}, eli ${k} × ${g} = ${k * g}.`,
        };
      },
      expr: (r) => {
        const k = r.int(2, 4), f = r.pick(FOOD); let g = r.int(2, 5); if (g === k) g = k + 1;
        const right = Array(k).fill(g).join(' + ');
        return {
          say: 'Mikä lasku sopii kuvaan?',
          scene: paint(bagsArt(r, f, Array(k).fill(g))),
          task: choose(r, txt(right), [txt(`${k} + ${g}`), txt(Array(k + 1).fill(g).join(' + '))], [`Pussien määrää ei lisätä pussin sisältöön. Jokaisen pussin ${g} lasketaan yhteen.`, `Siinä on ${k + 1} pussia, kuvassa vain ${k}.`], 1),
          hint: 'Jokaisesta pussista tulee laskuun yksi luku.',
          explain: `Pusseja on ${k}, jokaisessa ${g}: ${right}.`,
        };
      },
      pack: (r) => {
        const k = r.int(2, 4), g = r.int(2, 4), f = r.pick(FOOD);
        return {
          say: `Laita jokaiseen ${k === 2 ? 'kahteen' : k === 3 ? 'kolmeen' : 'neljään'} pussiin ${word(g)} ${many(f, g)}.`,
          task: { kind: 'pack' as const, k, g, thing: f },
          hint: `Napauta jokaista pussia ${g} kertaa.`,
          explain: `${Array(k).fill(g).join(' + ')} = ${k * g}, eli ${k} × ${g} = ${k * g}: ${k} pussia, jokaisessa ${g}.`,
        };
      },
      equal: (r) => {
        const k = 3, g = r.int(2, 4), f = r.pick(FOOD);
        const uneq = (): number[] => r.shuffle([g, g, g + r.pick([-1, 1])]);
        return { say: 'Missä kuvassa jokaisessa pussissa on yhtä monta?', hint: 'Laske jokaisen pussin sisältö ja vertaa.', task: choose(r, { art: bagsArt(r, f, Array(k).fill(g)) }, [{ art: bagsArt(r, f, uneq()) }, { art: bagsArt(r, f, uneq()) }], ['Näissä ei ole vielä yhtä monta.', 'Näissä ei ole vielä yhtä monta.'], 1), explain: `Oikeassa kuvassa jokaisessa pussissa on ${g}.` };
      },
    }, (r) => {
      const k = r.int(3, 4), g = r.int(2, 3), e = r.int(1, 3);
      return {
        say: `On ${word(k)} pussia, jokaisessa ${word(g)} marjaa. Lisäksi on ${e === 1 ? 'yksi irtomarja' : `${word(e)} irtomarjaa`}. Montako marjaa on kaikkiaan?`,
        task: choose(r, n$(k * g + e), [n$(k * g), n$(k * (g + e))], [`Irtomarjat puuttuvat.`, `Irtomarjat lisätään vain kerran, ei jokaiseen pussiin.`]),
        hint: 'Laske ensin pussit, lisää sitten irtomarjat.',
        explain: `${k} × ${g} = ${k * g}, ja vielä ${e}: ${k * g + e}.`,
      };
    }),
  },
  {
    id: 'M-DIV-02', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Montako pussia', icon: '🛍️',
    intro: 'Marjat pakataan pusseihin. Montako pussia tarvitaan?',
    reward: 'Pussit riittivät juuri sopivasti!',
    demo: (r) => [
      { say: 'Marjoja on kahdeksan. Yhteen pussiin mahtuu kaksi. Pakataan kaksi kerrallaan, kunnes kasa on tyhjä: yksi, kaksi, kolme, neljä pussia. Pusseja tarvitaan neljä.', scene: bagupScene('marja', 8, 2) },
      { say: 'Isommat pussit: kun yhteen mahtuu neljä, samoista kahdeksasta tulee vain kaksi pussia.', scene: bagupScene('marja', 8, 4) },
    ],
    item: cases({
      pic: (r) => {
        const g = r.pick([2, 3, 5]); let q = r.int(2, 5); if (q === g) q = g === 5 ? 3 : g + 1;
        const n = g * q, f = r.pick(FOOD);
        return {
          say: `${capital(PLURAL[f]!)} on ${word(n)}. Yhteen pussiin mahtuu ${word(g)}. Montako pussia tarvitaan?`,
          scene: paint(groupArt(r, f, n, 'line', 320, n > 10 ? 110 : 70, 24)),
          task: choose(r, n$(q), [n$(g), n$(q + 1 === g ? q - 1 : q + 1)], [`${capital(word(g))} on yhden pussin määrä. Kysyttiin pussien määrää.`, q + 1 === g ? `${q - 1} pussiin mahtuu vain ${(q - 1) * g}.` : `${q + 1} pussiin tarvittaisiin ${(q + 1) * g}.`]),
          hint: `Ryhmittele ${word(g)} kerrallaan ja laske ryhmät.`,
          explain: `${n} = ${Array(q).fill(g).join(' + ')}. Pusseja on ${q}.`,
        };
      },
      fill: (r) => {
        const g = r.pick([2, 3, 4, 5]); let q = r.int(2, 4); if (q === g) q = g + 1;
        const f = r.pick(FOOD);
        return {
          say: `${capital(many(f, 2))} on ${word(g * q)}. Pakkaa ne pusseihin, ${word(g)} jokaiseen.`,
          task: { kind: 'bagup' as const, n: g * q, g, thing: f },
          hint: 'Täytä pusseja, kunnes kasa on tyhjä. Laske sitten pussit.',
          explain: `${Array(q).fill(g).join(' + ')} = ${g * q}: pusseja tuli ${q}.`,
        };
      },
      story: (r) => {
        const g = r.pick([2, 3, 4]); let q = r.int(2, 4); if (q === g) q = g + 1;
        const n = g * q;
        return {
          say: `Yhteen eväspussiin mahtuu ${word(g)} marjaa. Marjoja on ${word(n)}. Montako pussia tarvitaan?`,
          task: choose(r, n$(q), [n$(g), n$(n)], [`${capital(word(g))} on yhden pussin marjat. Kysyttiin, montako pussia tulee.`, `${capital(word(n))} on kaikkien marjojen määrä, ei pussien.`]),
          hint: `Laske ${word(g)} kerrallaan, kunnes pääset lukuun ${n}: montako kertaa?`,
          explain: `${Array(q).fill(g).join(' + ')} = ${n}. Tarvitaan ${q} pussia.`,
        };
      },
    }, (r) => {
      const g = r.pick([2, 3]), boxes = r.int(2, 3), per = 2;
      const bags = boxes * per, n = bags * g;
      return {
        say: `Marjoja on ${word(n)}. Ne pakataan ${g === 2 ? 'kahden' : 'kolmen'} marjan pusseihin. Sitten kaksi pussia mahtuu yhteen laatikkoon. Montako laatikkoa tarvitaan?`,
        task: choose(r, n$(boxes), [n$(bags), n$(n)], [`${bags} on pussien määrä. Pussit pakataan vielä laatikoihin, kaksi kuhunkin.`, `${n} on marjojen määrä.`]),
        hint: 'Kaksi vaihetta: ensin montako pussia, sitten montako laatikkoa.',
        explain: `${n} marjaa on ${bags} pussia. ${bags} pussia kahden pussin laatikoihin on ${boxes} laatikkoa.`,
      };
    }),
  },
  {
    id: 'M-MULTREL-01', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Kertaa niin paljon', icon: '🏰',
    intro: 'Loikka rakentaa tornin, joka on monta kertaa niin korkea kuin Aavan.',
    reward: 'Loikan torni on valmis!',
    demo: () => [
      { say: 'Aavan tornissa on kaksi palikkaa. Loikan torni on kolme kertaa niin korkea: Aavan torni kolme kertaa päällekkäin. Kaksi, kaksi ja kaksi: kuusi palikkaa.', scene: timesTower(2, 3) },
      { say: 'Varo: kolme kertaa niin paljon ei ole kaksi plus kolme. Plus lisää palikat vain kerran, kertolasku lisää kokonaisia torneja.', scene: moreVsTimes(2, 3) },
    ],
    item: cases({
      times: (r) => {
        const a = r.int(2, 4), k = r.int(2, 4);
        return {
          say: `Aavan tornissa on ${word(a)} palikkaa. Loikan torni on ${word(k)} kertaa niin korkea. Montako palikkaa Loikan tornissa on?`,
          scene: paint(svg(120, 230, tower(a, 40, 'var(--sun)'))),
          task: (() => {
            const ws = [...new Set([a + k, a * k + a, a * k - a])].filter((x) => x !== a * k && x > 0).slice(0, 2);
            const why = (x: number) => x === a + k ? `Tässä ovat Aavan palikat ja lisäksi ${k}. ${k} kertaa niin paljon tarkoittaa, että Aavan torni otetaan ${k} kertaa.` : x === a * k + a ? `Siinä on Aavan torni ${k + 1} kertaa, yksi liikaa.` : `Siinä on Aavan torni vain ${k - 1} kertaa.`;
            return choose(r, n$(a * k), ws.map(n$), ws.map(why));
          })(),
          hint: `Ajattele Aavan torni ${word(k)} kertaa päällekkäin.`,
          explain: `${k} kertaa ${a}: ${Array(k).fill(a).join(' + ')} = ${a * k}.`,
        };
      },
      build: (r) => {
        const a = r.int(2, 4), k = r.int(2, 4);
        return {
          say: `Aavan tornissa on ${word(a)} palikkaa. Rakenna Loikalle torni, joka on ${word(k)} kertaa niin korkea.`,
          task: { kind: 'stack' as const, a, k },
          hint: `Rakenna Aavan torni ${word(k)} kertaa päällekkäin: ${Array.from({ length: k }, (_, i) => (i + 1) * a).join(', ')}.`,
          explain: `${k} kertaa ${a}: ${Array(k).fill(a).join(' + ')} = ${a * k}.`,
        };
      },
      howMany: (r) => {
        const a = r.int(2, 3), k = r.int(2, 4);
        return {
          say: 'Kuinka monta kertaa niin korkea Loikan torni on kuin Aavan torni?',
          scene: paint(svg(220, 230, tower(a, 30, 'var(--sun)') + tower(a * k, 140, 'var(--pond)'))),
          task: (() => {
            const ws = [...new Set([a * k - a, k + 1, k - 1, a * k])].filter((x) => x !== k && x > 0).slice(0, 2);
            const why = (x: number) => x === a * k - a ? 'Tämä on erotus: montako palikkaa enemmän. Kysyttiin, montako Aavan tornia mahtuu Loikan torniin.' : x === a * k ? `${a * k} on Loikan palikoiden määrä. Kysyttiin, montako kertaa Aavan torni siihen mahtuu.` : `${x} Aavan tornia olisi ${x * a} palikkaa.`;
            return choose(r, n$(k), ws.map(n$), ws.map(why));
          })(),
          hint: `Mittaa Loikan tornia Aavan tornilla: ${a}, ${2 * a}, … montako kertaa?`,
          explain: `Aavan torni (${a}) mahtuu Loikan torniin (${a * k}) ${k} kertaa.`,
        };
      },
    }, (r) => {
      const a = r.int(2, 4), k = r.int(2, 3);
      return {
        say: `Loikalla on ${word(a * k)} kiveä. Se on ${word(k)} kertaa niin paljon kuin Aavalla. Montako kiveä Aavalla on?`,
        task: (() => {
          const ws = [...new Set([a * k - k, a * k * k, a * k])].filter((x) => x !== a).slice(0, 2);
          const why = (x: number) => x === a * k * k ? `Aavalla on vähemmän, ei enemmän: Loikalla on ${word(k)} kertaa niin paljon.` : x === a * k ? `${a * k} on Loikan kivet.` : `Vähensit ${k}. Kertaa niin paljon: Loikan kivet jakautuvat ${k} yhtä suureen osaan, ja yksi osa on Aavan.`;
          return choose(r, n$(a), ws.map(n$), ws.map(why));
        })(),
        hint: `Jaa Loikan ${a * k} kiveä ${word(k)} yhtä suureen osaan.`,
        explain: `${k} × ${a} = ${a * k}, joten Aavalla on ${a}.`,
      };
    }),
  },
];

function capital(s: string) { return s[0]!.toUpperCase() + s.slice(1); }
