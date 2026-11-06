// Decimals for the Helmisukeltajat chapter (Aarresaaristo): tenths, hundredths and
// thousandths, reading and writing, decomposing, comparing, adding and subtracting,
// multiplying and dividing. Pictures first (tenth bars, hundred grids, number lines),
// then symbols. Known misconceptions targeted: "longer is larger" (0,45 > 0,5),
// "0,30 ≠ 0,3", place-value confusion (0,07 vs 0,7) and right-aligning in addition.
import type { Rng } from '../engine/rng';
import type { NodeSpec, Task } from '../engine/types';
import { cases, choose, paint } from './kit';
import { word } from './fi';
import { AUDIT_REV, LAUNCH_REV, LIGHT_REV } from './audit-rev';
import { decColumnScene, decomposeScene, hundredsScene, readScene, shareDecScene, shiftScene, tenthsScene, timesTenthsScene, writeScene, zoomScene } from './decanim';
import { ask, d, ex, hundredGrid, n$, numeric, pickNum, pickText, round, tenthsBar } from './parts';

const line = (answer: number, min = 0, max = 1, step = 0.1, labelEvery = 0.5, unit?: string): Task => ({ kind: 'line', min, max, step, answer: round(answer), labelEvery, unit });
const D = (x: number, places: number) => x.toFixed(places).replace('.', ',');
/** Two different digits 1..9. */
const twoDigits = (r: Rng) => { const a = r.int(1, 9); let b = r.int(1, 9); if (b === a) b = a === 9 ? 1 : a + 1; return [a, b] as const; };

export const DECIMAL_NODES: NodeSpec[] = [
  // ============================================================ tenths
  {
    id: 'M-DEC-01', stop: 'Kymmenesosat', icon: '🦪',
    goal: 'Opit, että kokonainen voidaan jakaa kymmeneen osaan ja yksi osa on 0,1.',
    intro: 'Helmisukeltajat jakavat helminauhan kymmeneen yhtä suureen osaan. Yksi osa on kymmenesosa.',
    reward: 'Tunnet kymmenesosat: 0,1 on yksi kymmenestä osasta!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Nauha on yksi kokonainen. Se leikataan kymmeneen yhtä suureen osaan: yksi osa on nolla pilkku yksi. Väritetään seitsemän osaa, ja merkki kulkee lukusuoralla: nolla pilkku seitsemän.', scene: tenthsScene(7) },
      { say: 'Kymmenen kymmenesosaa täyttää koko nauhan: se on yksi kokonainen. Otetaan uusi nauha ja väritetään vielä kolme: yksi pilkku kolme.', scene: tenthsScene(13) },
    ],
    item: cases({
      bar: (r) => {
        const n = r.int(1, 9);
        return {
          say: 'Mikä desimaaliluku kertoo, kuinka paljon nauhasta on väritetty?',
          scene: paint(tenthsBar(n)),
          task: pickNum(r, n / 10, [n, n / 100], ['Koko nauha on yksi. Väritetty osa on vähemmän kuin yksi.', 'Nauha on jaettu kymmeneen, ei sataan osaan.'], { step: 0.1, hi: 10 }),
          hint: 'Laske väritetyt osat. Jokainen osa on 0,1.',
          explain: `${n} osaa kymmenestä on ${n}/10 = ${D(n / 10, 1)}.`,
        };
      },
      names: (r) => {
        const ks = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 2), w = r.int(11, 19);
        if (ks.includes(w % 10)) ks[ks.indexOf(w % 10)] = ks.includes(5) ? 6 : 5;
        if (ks[0] === ks[1]) ks[1] = ks[0] === 9 ? 8 : ks[0]! + 1;
        const vals = [ks[0]!, ks[1]!, w];
        const label = [`${ks[0]} kymmenesosaa`, `${ks[1]}/10`, `1 kokonainen ja ${w % 10} kymmenesosaa`];
        const tokens = r.shuffle([...vals.map((v, i) => ({ id: `t${i}`, text: D(v / 10, 1) })), { id: 'x0', text: D(ks[0]! / 100, 2) }, { id: 'x1', text: String(w) }]);
        return {
          say: 'Mikä desimaaliluku kuuluu kunkin kuvauksen kohdalle?',
          task: {
            kind: 'place' as const,
            slots: label.map((t, i) => ({ id: `s${i}`, text: t })),
            tokens,
            answer: Object.fromEntries(vals.map((_, i) => [`s${i}`, `t${i}`])),
            why: { s0: `${ks[0]} kymmenesosaa on ${D(ks[0]! / 10, 1)}. (${D(ks[0]! / 100, 2)} olisi sadasosia.)`, s1: `${ks[1]}/10 = ${D(ks[1]! / 10, 1)}.`, s2: `Kokonaiset ennen pilkkua, kymmenesosat pilkun jälkeen: ${D(w / 10, 1)}. (${w} olisi ${w} kokonaista.)` },
          },
          hint: 'Kymmenesosat tulevat heti pilkun jälkeen. Kokonaiset ennen pilkkua.',
          explain: label.map((t, i) => `${t} = ${D(vals[i]! / 10, 1)}`).join('; ') + '.',
        };
      },
      line: (r) => {
        const n = r.int(1, 9);
        return {
          say: `Merkitse luku ${D(n / 10, 1)} lukusuoralle.`,
          task: line(n / 10),
          hint: 'Välillä nollasta yhteen on kymmenen askelta. Jokainen askel on 0,1.',
          explain: `${D(n / 10, 1)} on ${n} kymmenesosa-askelta nollasta.`,
        };
      },
      over: (r) => {
        const n = r.int(11, 19);
        return {
          say: 'Nauhoja on kaksi. Mikä luku kertoo väritetyn määrän?',
          scene: paint(tenthsBar(n)),
          task: pickNum(r, n / 10, [n, n / 100, (n % 10) + 0.1], ['Yksi kokonainen nauha on 1, ei 10.', 'Kokonaisia on yksi.', 'Kokonaisia on yksi ja kymmenesosia ' + (n % 10) + '.'], { step: 0.1, hi: 20 }),
          hint: 'Täysi nauha on yksi kokonainen. Montako kymmenesosaa on toisessa nauhassa?',
          explain: `Yksi kokonainen ja ${n % 10} kymmenesosaa: ${D(n / 10, 1)}.`,
        };
      },
    }, (r) => {
      const n = r.int(11, 19);
      return {
        say: `Loikka hyppää ${D(n / 10, 1)} metriä. Merkitse hypyn pituus metrimittaan.`,
        task: line(n / 10, 0, 2, 0.1, 1, 'm'),
        hint: `Ensin yksi kokonainen metri, sitten vielä ${n % 10} pientä askelta.`,
        explain: `${D(n / 10, 1)} m on yksi metri ja ${n % 10} kymmenesosaa metriä.`,
      };
    }),
  },
  // ============================================================ hundredths
  {
    id: 'M-DEC-02', stop: 'Sadasosat', icon: '💯',
    goal: 'Opit sadasosat: kun kokonainen jaetaan sataan osaan, yksi osa on 0,01.',
    intro: 'Helmiruudukossa on sata ruutua. Yksi ruutu on sadasosa.',
    reward: 'Tunnet sadasosat ja tiedät, että 0,3 = 0,30!',
    rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV],
    demo: () => [
      { say: 'Ruudukossa on sata ruutua. Ensin väritetään kolme kokonaista saraketta: kolme kymmenesosaa. Sitten seitsemän yksittäistä ruutua: seitsemän sadasosaa. Yhteensä nolla pilkku kolme seitsemän.', scene: hundredsScene(37) },
      { say: 'Kolme saraketta on kolme kymmenesosaa. Kun ruudut lasketaan, niitä on kolmekymmentä: kolmekymmentä sadasosaa. Siksi nolla pilkku kolme on yhtä paljon kuin nolla pilkku kolme nolla.', scene: hundredsScene(30, 'same') },
    ],
    item: cases({
      grid: (r) => {
        let n = r.int(11, 89); if (n % 10 === 0 || Math.floor(n / 10) === n % 10) n++;
        const swap = (n % 10) / 10 + Math.floor(n / 10) / 100;
        return {
          say: 'Mikä desimaaliluku kertoo väritetyn osan?',
          scene: paint(hundredGrid(n)),
          task: pickNum(r, n / 100, [n / 10, swap], ['Ruudukko on jaettu sataan osaan, ei kymmeneen.', 'Täydet sarakkeet ovat kymmenesosia, irtoruudut sadasosia.'], { step: 0.01, hi: 10 }),
          hint: 'Laske ensin täydet sarakkeet (kymmenesosat), sitten irtoruudut (sadasosat).',
          explain: `${Math.floor(n / 10)} täyttä saraketta ja ${n % 10} ruutua: ${D(n / 100, 2)}.`,
        };
      },
      digit: (r) => {
        const [a, b] = twoDigits(r), w = r.int(0, 3);
        const tenths = r.chance(0.5);
        return {
          say: `Luvussa ${w},${a}${b} mikä numero kertoo ${tenths ? 'kymmenesosat' : 'sadasosat'}?`,
          task: choose(r, n$(tenths ? a : b), [n$(tenths ? b : a), ...(w !== a && w !== b ? [n$(w)] : [])], [tenths ? 'Tämä on sadasosien paikalla, toinen pilkun jälkeen.' : 'Tämä on kymmenesosien paikalla, heti pilkun jälkeen.', 'Tämä numero on ennen pilkkua: kokonaiset.']),
          hint: 'Ensimmäinen numero pilkun jälkeen on kymmenesosat, toinen sadasosat.',
          explain: `Heti pilkun jälkeen tulevat kymmenesosat (${a}), sitten sadasosat (${b}).`,
        };
      },
      equal: (r) => {
        const a = r.int(1, 9);
        const opts: [string, boolean, string][] = [
          [D(a / 10, 2), true, `${D(a / 10, 2)}: perään lisätty nolla ei muuta arvoa.`],
          [`${a * 10} sadasosaa`, true, `${a} saraketta = ${a * 10} ruutua = ${a * 10} sadasosaa.`],
          [`${a} kymmenesosaa`, true, `${a} kymmenesosaa = ${D(a / 10, 1)}.`],
          [D(a / 100, 2), false, `${D(a / 100, 2)} on vain ${a} sadasosaa: ${a} ruutua, ei ${a} saraketta.`],
          [`${a} sadasosaa`, false, `${a} sadasosaa = ${D(a / 100, 2)}, kymmenen kertaa vähemmän.`],
          [String(a), false, `${a} on ${a} kokonaista, ei osa yhdestä.`],
        ];
        const keep = r.shuffle(opts.filter((o) => o[1])).slice(0, 2 + r.int(0, 1)), drop = r.shuffle(opts.filter((o) => !o[1])).slice(0, 5 - keep.length);
        const all = r.shuffle([...keep, ...drop]);
        return {
          say: `Valitse kaikki, jotka ovat yhtä paljon kuin ${D(a / 10, 1)}.`,
          scene: paint(hundredGrid(a * 10, 110)),
          task: { kind: 'multi' as const, options: all.map((o) => ({ big: o[0] })), answer: all.map((o, i) => (o[1] ? i : -1)).filter((i) => i >= 0), cols: 2, why: all.map((o) => o[2]) },
          hint: 'Yksi sarake on 0,1 ja siinä on 10 ruutua eli 10 sadasosaa.',
          explain: `${D(a / 10, 1)} = ${D(a / 10, 2)} = ${a} kymmenesosaa = ${a * 10} sadasosaa.`,
        };
      },
      same: (r) => {
        const a = r.int(1, 9);
        return {
          say: `Montako sadasosaa on ${D(a / 10, 1)}?`,
          scene: paint(hundredGrid(a * 10, 120).replace(/aria-label="[^"]*"/, `aria-label="Neliö on jaettu kymmeneen yhtä leveään sarakkeeseen ja jokainen sarake kymmeneen yhtä suureen ruutuun. Vasemmalta ${a} saraketta on väritetty kokonaan."`)),
          task: numeric(a * 10),
          hint: 'Yksi sarake on kymmenen sadasosaa.',
          explain: `${D(a / 10, 1)} = ${D(a / 10, 2)}: ${a} saraketta, joissa kussakin 10 ruutua, on ${a * 10} sadasosaa.`,
        };
      },
    }, (r) => {
      const e = r.int(1, 5), c = r.int(1, 9);
      return {
        say: `Simpukkakoru maksaa ${e} euroa ${c} senttiä. Miten hinta kirjoitetaan euroina?`,
        task: choose(r, ex(`${D(e + c / 100, 2)} €`), [ex(`${D(e + c / 10, 1)} €`), ex(`${e},00${c} €`)], [`Sentti on sadasosa eurosta. ${c} senttiä on 0,0${c} €, ei 0,${c} €.`, 'Sentti on sadasosa, ei tuhannesosa eurosta.']),
        hint: 'Eurossa on sata senttiä. Yksi sentti on 0,01 €.',
        explain: `Sentti on sadasosa eurosta: ${c} senttiä = 0,0${c} €. Yhteensä ${D(e + c / 100, 2)} €.`,
      };
    }),
  },
  // ============================================================ thousandths
  {
    id: 'M-DEC-03', stop: 'Tuhannesosat', icon: '📐',
    goal: 'Opit tuhannesosat: kolmas numero pilkun jälkeen. Millimetri on tuhannesosa metristä.',
    intro: 'Sukeltajat mittaavat helmiä millimetreinä. Metrissä on tuhat millimetriä.',
    reward: 'Tunnet tuhannesosat ja muunnat millimetrit metreiksi!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Metri jaetaan kymmeneen osaan: kolme kymmenesosaa. Suurennetaan väli ja jaetaan taas kymmeneen: seitsemän sadasosaa. Vielä kerran: viisi tuhannesosaa. Nolla pilkku kolme seitsemän viisi metriä on kolmesataaseitsemänkymmentäviisi millimetriä.', scene: zoomScene(375) },
      { say: 'Neljäkymmentäkahdeksan millimetriä: kokonaisia kymmenesosia ei tule yhtään, joten ensimmäiseksi numeroksi tulee nolla. Neljä sadasosaa ja kahdeksan tuhannesosaa: nolla pilkku nolla neljä kahdeksan.', scene: zoomScene(48) },
    ],
    item: cases({
      mm: (r) => {
        const n = r.int(101, 999);
        return {
          say: `Metrissä on 1000 millimetriä. Kuinka monta metriä on ${n} millimetriä?`,
          task: pickNum(r, n / 1000, [n / 100, n / 10], ['Metrissä on tuhat millimetriä, ei sata.', 'Metrissä on tuhat millimetriä, ei kymmenen.'], { step: 0.001, opt: (x) => ex(`${d(x)} m`) }),
          hint: 'Metrissä on 1000 mm. Yksi millimetri on 0,001 m.',
          explain: `${n} mm = ${n} tuhannesosaa metristä = ${d(n / 1000)} m.`,
        };
      },
      digit: (r) => {
        const ds = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3) as [number, number, number];
        const place = r.int(0, 2);
        const names = ['kymmenesosien', 'sadasosien', 'tuhannesosien'];
        return {
          say: `Mikä numero on luvussa 0,${ds.join('')} ${names[place]} paikalla?`,
          task: choose(r, n$(ds[place]), ds.filter((_, i) => i !== place).map(n$), ds.map((_, i) => `Tämä on ${names[i]} paikalla.`).filter((_, i) => i !== place)),
          hint: 'Pilkun jälkeen: 1. kymmenesosat, 2. sadasosat, 3. tuhannesosat.',
          explain: `0,${ds.join('')}: ${ds[0]} kymmenesosaa, ${ds[1]} sadasosaa, ${ds[2]} tuhannesosaa.`,
        };
      },
      mmPair: (r) => {
        const big = r.int(101, 999), mid = r.pick([1, 2, 3, 4, 5, 6, 7, 8, 9]) * 10 + r.int(1, 9), one = r.int(1, 9);
        const vals = [big, mid, one];
        const dz = r.shuffle([`${d(mid / 100)} m`, `${d(one / 100)} m`, `${d(one / 10)} m`]).slice(0, 2);
        const tokens = r.shuffle([...vals.map((v, i) => ({ id: `t${i}`, text: `${d(v / 1000)} m` })), ...dz.map((t, i) => ({ id: `x${i}`, text: t }))]);
        return {
          say: 'Metrissä on 1000 millimetriä. Muunna millimetrit metreiksi: vie oikea luku jokaisen mitan kohdalle.',
          task: {
            kind: 'place' as const,
            slots: vals.map((v, i) => ({ id: `s${i}`, text: `${v} mm` })),
            tokens,
            answer: Object.fromEntries(vals.map((_, i) => [`s${i}`, `t${i}`])),
            why: { s0: `${big} mm = ${big} tuhannesosaa = ${d(big / 1000)} m.`, s1: `${mid} mm: alle 100 mm, joten kymmenesosia on 0. ${d(mid / 1000)} m.`, s2: `${one} mm on ${one} tuhannesosaa: kaksi nollaa ennen, ${d(one / 1000)} m.` },
          },
          hint: 'Viimeinen numero on aina tuhannesosien paikalla. Tyhjät paikat täytetään nollilla.',
          explain: vals.map((v) => `${v} mm = ${d(v / 1000)} m`).join(', ') + '.',
        };
      },
      write: (r) => {
        const k = r.int(1, 9);
        return {
          say: `Mikä desimaaliluku on ${k} tuhannesosaa?`,
          task: choose(r, ex(`0,00${k}`), [ex(`0,0${k}`), ex(`0,${k}`)], ['Tämä on sadasosia.', 'Tämä on kymmenesosia.']),
          hint: 'Tuhannesosat ovat kolmas numero pilkun jälkeen. Tyhjät paikat täytetään nollilla.',
          explain: `Tuhannesosat ovat kolmannella paikalla pilkun jälkeen: 0,00${k}.`,
        };
      },
    }, (r) => {
      const g = r.pick([125, 250, 375, 500, 750, 45, 80]);
      return {
        say: `Helmipussi painaa ${g} grammaa. Kuinka monta kilogrammaa se on? Kilossa on tuhat grammaa.`,
        task: pickNum(r, g / 1000, [g / 100, g / 10], ['Kilossa on tuhat grammaa, ei sata.', 'Kilossa on tuhat grammaa, ei kymmenen.'], { step: 0.001, opt: (x) => ex(`${d(x)} kg`) }),
        hint: 'Gramma on tuhannesosa kilosta, kuten millimetri metristä.',
        explain: `${g} g = ${g} tuhannesosaa kilosta = ${d(g / 1000)} kg.`,
      };
    }),
  },
  // ============================================================ reading
  {
    id: 'M-DEC-READ', stop: 'Lue desimaaliluku', icon: '🗣️',
    goal: 'Opit lukemaan desimaaliluvun ääneen niin, että kuulija tietää osien koon.',
    intro: 'Helmisukeltajat huutavat syvyyksiä toisilleen. Luvut täytyy lukea oikein.',
    reward: 'Luet desimaaliluvut oikein!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Luku 3,7: pilkun edessä kolme kokonaista. Viimeinen numero on kymmenesosien paikalla, joten se luetaan: kolme kokonaista seitsemän kymmenesosaa. Sen voi lukea myös: kolme pilkku seitsemän.', scene: readScene('3,7') },
      { say: 'Luku 3,07: viimeinen numero on nyt sadasosien paikalla. Pilkun jälkeen on nolla seitsemän, eli seitsemän. Kolme kokonaista seitsemän sadasosaa.', scene: readScene('3,07') },
      { say: 'Luku 2,45: viimeinen numero on sadasosien paikalla, ja pilkun jälkeen on neljäkymmentäviisi. Kaksi kokonaista neljäkymmentäviisi sadasosaa.', scene: readScene('2,45') },
    ],
    item: cases({
      tenths: (r) => {
        const w = r.int(1, 9), [a] = twoDigits(r);
        return {
          say: `Miten luku ${w},${a} luetaan?`,
          task: pickText(r, `${w} kokonaista ${a} kymmenesosaa`, [`${w} kokonaista ${a} sadasosaa`, `${w * 10 + a} kokonaista`], ['Yksi numero pilkun jälkeen: kymmenesosia.', 'Pilkku erottaa kokonaiset osista.']),
          hint: 'Montako numeroa pilkun jälkeen on? Viimeisen numeron paikka antaa nimen.',
          explain: `Heti pilkun jälkeen ovat kymmenesosat: ${w} kokonaista ${a} kymmenesosaa.`,
        };
      },
      hundredths: (r) => {
        const w = r.int(1, 9), [a, b] = twoDigits(r);
        const zero = r.chance(0.5);
        const s = zero ? `${w},0${b}` : `${w},${a}${b}`, h = zero ? b : a * 10 + b;
        return {
          say: `Miten luku ${s} luetaan?`,
          task: pickText(r, `${w} kokonaista ${h} sadasosaa`, zero ? [`${w} kokonaista ${b} kymmenesosaa`, `${w} kokonaista ${b * 10} sadasosaa`] : [`${w} kokonaista ${h} kymmenesosaa`, `${w} kokonaista ${a} sadasosaa`], zero ? ['Nolla on kymmenesosien paikalla. Numero ' + b + ' on sadasosien paikalla.', 'Tämä olisi ' + w + ',' + b + '0.'] : ['Kaksi numeroa pilkun jälkeen: sadasosia.', 'Molemmat numerot pilkun jälkeen kuuluvat mukaan.']),
          hint: 'Lue pilkun jälkeiset numerot yhtenä lukuna. Viimeinen numero kertoo, ovatko ne kymmenes- vai sadasosia.',
          explain: `Kaksi numeroa pilkun jälkeen: sadasosia. ${s} = ${w} kokonaista ${h} sadasosaa.`,
        };
      },
      unit: (r) => {
        const mk = (p: number) => { const w = r.int(0, 9); const ds = Array.from({ length: p }, (_, i) => (i === p - 1 ? r.int(1, 9) : r.int(0, 9))); return `${w},${ds.join('')}`; };
        const want = r.shuffle([1, 1, 2, 2, 3, 3]);
        const seen = new Set<string>(), items: string[] = [];
        for (const p of want) { let x = mk(p); for (let g = 0; g < 20 && seen.has(x); g++) x = mk(p); seen.add(x); items.push(x); }
        const UN = ['kymmenesosaa', 'sadasosaa', 'tuhannesosaa'];
        return {
          say: 'Miten luvut luetaan? Lajittele osien nimen mukaan.',
          task: {
            kind: 'sort' as const,
            items: items.map((x) => ({ big: x })),
            cats: UN.map((u) => ({ label: `… ${u}` })),
            answer: want.map((p) => p - 1),
            why: items.map((x, i) => { const [w, dp] = x.split(','); return `${x}: ${dp!.length} ${dp!.length === 1 ? 'numero' : 'numeroa'} pilkun jälkeen → ${w} ${w === '1' ? 'kokonainen' : 'kokonaista'} ${Number(dp)} ${UN[want[i]! - 1]}.`; }),
          },
          hint: 'Laske pilkun jälkeiset numerot: 1 = kymmenesosat, 2 = sadasosat, 3 = tuhannesosat.',
          explain: 'Viimeisen numeron paikka antaa nimen: yksi numero pilkun jälkeen kymmenesosat, kaksi sadasosat, kolme tuhannesosat.',
        };
      },
      fromWords: (r) => {
        const w = r.int(1, 9), b = r.int(1, 9);
        return {
          say: `Aava huutaa: ${w} kokonaista ${b} sadasosaa! Mikä luku se on?`,
          task: choose(r, ex(`${w},0${b}`), [ex(`${w},${b}`), ex(`${w},00${b}`)], ['Tämä on ' + b + ' kymmenesosaa.', 'Tämä on ' + b + ' tuhannesosaa.']),
          hint: 'Sadasosat ovat toinen numero pilkun jälkeen. Mitä tulee tyhjälle kymmenesosien paikalle?',
          explain: `Sadasosat ovat toisella paikalla pilkun jälkeen. Kymmenesosia ei ole, joten ensin tulee nolla: ${w},0${b}.`,
        };
      },
    }, (r) => {
      const e = r.int(1, 9), c = r.int(1, 9);
      return {
        say: `Hintalapussa lukee ${e},0${c} €. Paljonko hinta on?`,
        task: pickText(r, `${e} euroa ${c} senttiä`, [`${e} euroa ${c * 10} senttiä`, `${e * 10 + c} senttiä`], [`Tämä olisi ${e},${c}0 €.`, 'Pilkun edessä ovat kokonaiset eurot.']),
        hint: 'Sentti on sadasosa eurosta. Lue pilkun jälkeiset numerot yhtenä lukuna.',
        explain: `${e},0${c} € = ${e} euroa ja ${c} sadasosaa eurosta eli ${c} senttiä.`,
      };
    }),
  },
  // ============================================================ writing
  {
    id: 'M-DEC-WRITE', stop: 'Kirjoita desimaaliluku', icon: '✏️',
    goal: 'Opit kirjoittamaan desimaaliluvun, kun kuulet tai luet sen sanoina.',
    intro: 'Sukeltajien loki kirjoitetaan numeroin. Kirjoita luvut näppäimistöllä, pilkku mukaan.',
    reward: 'Kirjoitat desimaaliluvut oikein, nollat oikeille paikoille!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Kolme kokonaista neljä sadasosaa: ensin kolme, sitten pilkku. Sana sadasosaa kertoo, että viimeinen numero menee sadasosien paikalle. Neljä menee sinne, ja tyhjälle kymmenesosien paikalle tulee nolla: kolme pilkku nolla neljä.', scene: writeScene(3, 4, 2) },
      { say: 'Kaksi kokonaista neljäkymmentäviisi sadasosaa: viisi päättyy sadasosien paikalle, ja neljä tulee sen eteen. Tyhjiä paikkoja ei jää: kaksi pilkku neljä viisi.', scene: writeScene(2, 45, 2) },
      { say: 'Nolla kokonaista kaksitoista tuhannesosaa: kaksi menee tuhannesosien paikalle, yksi sen eteen sadasosiin. Kymmenesosien paikka on tyhjä, joten siihen nolla: nolla pilkku nolla yksi kaksi.', scene: writeScene(0, 12, 3) },
    ],
    item: cases({
      tenths: (r) => {
        const w = r.int(0, 9), a = r.int(1, 9);
        return ask(`Kirjoita numeroin: ${w} kokonaista ${a} kymmenesosaa.`, w + a / 10, `${w} kokonaista ja ${a} kymmenesosaa: ${D(w + a / 10, 1)}.`, { hint: 'Kymmenesosat tulevat heti pilkun jälkeen.' });
      },
      hundredths: (r) => {
        const w = r.int(1, 9), b = r.int(1, 9);
        return ask(`Kirjoita numeroin: ${w} kokonaista ${b} sadasosaa.`, w + b / 100, `Kymmenesosia ei ole, joten pilkun jälkeen tulee nolla: ${D(w + b / 100, 2)}.`, { hint: 'Sadasosat ovat toisella paikalla pilkun jälkeen.' });
      },
      build: (r) => {
        const w = r.int(1, 9); let b = r.int(1, 9); if (b === w) b = w === 9 ? 1 : w + 1;
        const others = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== w && x !== b)).slice(0, 2);
        const tokens = r.shuffle([{ id: 'tw', text: String(w) }, { id: 'tz', text: '0' }, { id: 'tb', text: String(b) }, ...others.map((x) => ({ id: `x${x}`, text: String(x) }))]);
        return {
          say: `Rakenna luku: ${w} ${w === 1 ? 'kokonainen' : 'kokonaista'} ${b} sadasosaa.`,
          task: {
            kind: 'place' as const,
            slots: [{ id: 's0', text: 'kokonaiset' }, { id: 's1', text: ', kymmenesosat' }, { id: 's2', text: 'sadasosat' }],
            tokens,
            answer: { s0: 'tw', s1: 'tz', s2: 'tb' },
            why: { s0: `Kokonaisia on ${w}.`, s1: 'Kymmenesosia ei ole, mutta paikka ei saa jäädä tyhjäksi: nolla.', s2: `"sadasosaa": ${b} menee sadasosien paikalle.` },
          },
          hint: 'Sana sadasosaa kertoo viimeisen paikan. Mitä tulee väliin jäävälle paikalle?',
          explain: `${w} ${w === 1 ? 'kokonainen' : 'kokonaista'} ${b} sadasosaa = ${w},0${b}.`,
        };
      },
      teens: (r) => {
        const w = r.int(1, 9), h = r.int(11, 99);
        return ask(`Kirjoita numeroin: ${w} kokonaista ${h} sadasosaa.`, w + h / 100, `${h} sadasosaa = 0,${h}. Yhteensä ${D(w + h / 100, 2)}.`, { hint: `Viimeinen numero menee sadasosien paikalle: ${h} täyttää kaksi paikkaa pilkun jälkeen.`, whyAt: { [round(w + h / 1000)]: `Tämä on tuhannesosia. Sadasosia on kaksi numeroa pilkun jälkeen: ${D(w + h / 100, 2)}.` } });
      },
    }, (r) => {
      const m = r.int(1, 4), c = r.int(1, 9);
      return ask(`Helmilauta on ${m} m ${c} cm pitkä. Metrissä on 100 cm. Kirjoita pituus metreinä.`, m + c / 100, `Sentti on sadasosa metristä: ${c} cm = 0,0${c} m. Yhteensä ${D(m + c / 100, 2)} m.`, { unit: 'm', hint: 'Metrissä on 100 cm, joten sentti on sadasosa metristä.', whyAt: { [round(m + c / 10)]: `Tämä olisi ${m} m ${c} dm. ${c} cm on ${c} ${c === 1 ? 'sadasosa' : 'sadasosaa'}: 0,0${c} m.` } });
    }),
  },
  // ============================================================ decomposing
  {
    id: 'M-DEC-DECOMPOSE', stop: 'Pura osiin', icon: '🧩',
    rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV],
    goal: 'Opit purkamaan desimaaliluvun kokonaisiin, kymmenesosiin ja sadasosiin.',
    intro: 'Helmiaarre jaetaan laatikoihin: kokonaiset, kymmenesosat ja sadasosat.',
    reward: 'Purat desimaaliluvut osiin ja kokoat ne takaisin!',
    demo: () => [
      { say: 'Luku 4,62 puretaan: jokainen numero putoaa omaan laatikkoonsa. Neljä kokonaista, kuusi kymmenesosaa ja kaksi sadasosaa.', scene: decomposeScene(4, 6, 2) },
      { say: 'Sama toisin päin: osat 7, 0,3 ja 0,08 kootaan. Jokaisen osan numero lentää omalle paikalleen.', scene: decomposeScene(7, 3, 8, 'build') },
      { say: 'Kootaan 3 + 0,05. Kymmenesosia ei ole, mutta paikka ei saa jäädä tyhjäksi: siihen tulee nolla. Tulos on 3,05.', scene: decomposeScene(3, 0, 5, 'build') },
    ],
    item: cases({
      missing: (r) => {
        const w = r.int(1, 9), [a, b] = twoDigits(r);
        return ask(`${w},${a}${b} = ${w} + ${D(a / 10, 1)} + ?`, b / 100, `Viimeinen numero on sadasosien paikalla: ${D(b / 100, 2)}.`, { hint: 'Mikä numero on toisella paikalla pilkun jälkeen?', whyAt: { [round(b / 10)]: `${D(b / 10, 1)} olisi ${b} kymmenesosaa. ${b} on toisella paikalla, joten se on ${b} sadasosaa: ${D(b / 100, 2)}.`, [b]: `${b} on pilkun jälkeen, joten se ei ole kokonaisia vaan sadasosia: ${D(b / 100, 2)}.` } });
      },
      pick: (r) => {
        const w = r.int(1, 9), [a, b] = twoDigits(r);
        return {
          say: `Mikä on luvun ${w},${a}${b} oikea purku?`,
          task: choose(r, ex(`${w} + ${D(a / 10, 1)} + ${D(b / 100, 2)}`), [ex(`${w} + ${a} + ${b}`), ex(`${w} + ${D(a / 100, 2)} + ${D(b / 10, 1)}`)], ['Numerot pilkun jälkeen ovat osia, eivät kokonaisia.', 'Kymmenesosat ja sadasosat ovat vaihtaneet paikkaa.']),
          hint: 'Ensimmäinen numero pilkun jälkeen on kymmenesosia (0,_), toinen sadasosia (0,0_).',
          explain: `${w},${a}${b} = ${w} + ${D(a / 10, 1)} + ${D(b / 100, 2)}.`,
        };
      },
      compose: (r) => {
        const w = r.int(1, 9), b = r.int(1, 9), zero = r.chance(0.5), a = zero ? 0 : r.int(1, 9);
        const parts = [String(w), ...(a ? [D(a / 10, 1)] : []), D(b / 100, 2)];
        const whyAt: Record<number, string> = zero
          ? { [round(w + b / 10)]: `${D(b / 100, 2)} on ${b} sadasosaa, ei kymmenesosaa. Kymmenesosien paikalle tulee nolla: ${D(w + b / 100, 2)}.` }
          : a !== b ? { [round(w + a / 100 + b / 10)]: `Kymmenesosat ja sadasosat menivät ristiin. ${a} on kymmenesosia, ${b} sadasosia.` }
          : { [w + a + b]: `Pilkun jälkeiset osat eivät ole kokonaisia: ${a} kymmenesosaa on ${D(a / 10, 1)} ja ${b} sadasosaa on ${D(b / 100, 2)}.` };
        return ask(`Kokoa luku: ${parts.join(' + ')} = ?`, w + a / 10 + b / 100, zero ? `Kymmenesosia ei ole, joten niiden paikalle tulee nolla: ${D(w + b / 100, 2)}.` : `${D(w + a / 10 + b / 100, 2)}.`, { hint: 'Kirjoita kokonaiset, pilkku, sitten kymmenesosat ja sadasosat. Tyhjälle paikalle tulee nolla.', whyAt });
      },
      parts: (r) => {
        const w = r.int(1, 9), [a, b] = twoDigits(r);
        const tok = r.shuffle([String(w), D(a / 10, 1), D(b / 100, 2), D(b / 10, 1), D(a / 100, 2)]);
        return {
          say: `Pura luku ${w},${a}${b}: vedä jokainen osa oikeaan laatikkoon. Kaksi osaa jää yli.`,
          task: {
            kind: 'place',
            slots: [{ id: 'k', text: 'kokonaiset' }, { id: 't', text: 'kymmenesosat' }, { id: 's', text: 'sadasosat' }],
            tokens: tok.map((x) => ({ id: x, text: x })),
            answer: { k: String(w), t: D(a / 10, 1), s: D(b / 100, 2) },
            why: { t: `${a} on ensimmäinen pilkun jälkeen: ${D(a / 10, 1)}.`, s: `${b} on toinen pilkun jälkeen: ${D(b / 100, 2)}, ei ${D(b / 10, 1)}.` },
          } as Task,
          hint: 'Ensimmäinen numero pilkun jälkeen on kymmenesosia, toinen sadasosia.',
          explain: `${w},${a}${b} = ${w} + ${D(a / 10, 1)} + ${D(b / 100, 2)}.`,
        };
      },
    }, (r) => {
      const e = r.int(1, 9), k = r.int(1, 9), s = r.int(1, 4);
      return ask(`Aavalla on ${e} yhden euron kolikkoa, ${k} kymmenen sentin kolikkoa ja ${s} yhden sentin kolikkoa. Paljonko rahaa on euroina?`, e + k / 10 + s / 100, `${e} € + ${k} × 0,10 € + ${s} × 0,01 € = ${D(e + k / 10 + s / 100, 2)} €.`, {
        unit: '€', hint: 'Euro = kokonainen, 10 senttiä = kymmenesosa, 1 sentti = sadasosa.',
        whyAt: { ...(k !== s ? { [round(e + k / 100 + s / 10)]: `Kymppisentit ovat kymmenesosia (0,10 €) ja sentit sadasosia (0,01 €). Paikat menivät ristiin.` } : {}), [round(e + k / 10 + s / 10)]: `Yksi sentti on 0,01 €, ei 0,10 €. ${s} senttiä = ${D(s / 100, 2)} €.` },
      });
    }),
  },
  // ============================================================ joint decimal representations
  {
    id: 'M-DEC-04', stop: 'Sama määrä eri esityksissä', icon: '🧩',
    rev: LIGHT_REV, validRevs: [LAUNCH_REV, AUDIT_REV, LIGHT_REV],
    goal: 'Opit yhdistämään saman desimaalimäärän lukukortin, sanallisen kuvauksen ja lukuyksiköt annetuista korteista.',
    intro: 'Aava kirjaa helminauhan määrän kolmella tavalla. Kaikkien merkintöjen pitää tarkoittaa samaa määrää.',
    reward: 'Yhdistit saman määrän eri esitykset!',
    produce: ['words', 'numeral', 'repair', 'transfer'],
    produceWhat: 'annetun lukukortin ja lukuyksiköiden yhteistä kokoamista',
    demo: () => [
      { say: 'Kolme kokonaista ja kahdeksan sadasosaa on 3,08. Samassa määrässä on 3 kokonaista, 0 kymmenesosaa ja 8 sadasosaa. Nolla pitää kymmenesosien paikan.', scene: decomposeScene(3, 0, 8) },
      { say: 'Lukukortti 2,45 tarkoittaa kahta kokonaista, neljää kymmenesosaa ja viittä sadasosaa. Kortti, sanat ja lukuyksiköt kuvaavat samaa määrää.', scene: decomposeScene(2, 4, 5) },
      { say: 'Luvussa 1,007 kokonaisia on yksi ja tuhannesosia seitsemän. Kymmenesosien ja sadasosien määrä on nolla. Jokaisella pienemmällä lukuyksiköllä on kymmenesosa edellisen arvosta.', scene: paint('<div class="formula">1,007 = 1 + 0 + 0 + 0,007<br>yksi kokonainen ja seitsemän tuhannesosaa</div>') },
    ],
    item: (() => {
      const names = [['kokonainen', 'kokonaista'], ['kymmenesosa', 'kymmenesosaa'], ['sadasosa', 'sadasosaa'], ['tuhannesosa', 'tuhannesosaa']] as const;
      const unitPart = (n: number, i: number, spelled = false) => `${spelled ? word(n) : n} ${names[i]![n === 1 ? 0 : 1]}`;
      const asWords = (ds: number[]) => ds.map((n, i) => unitPart(n, i, true)).join(', ');
      const asNumber = (ds: number[]) => `${ds[0]},${ds.slice(1).join('')}`;
      const joint = (r: Rng, mode: 'words' | 'numeral' | 'repair' | 'transfer') => {
        const places = r.pick([2, 3]), ds = Array.from({ length: places + 1 }, () => r.int(0, 9));
        // Include absent units deliberately; do not drop a zero from the middle of the numeral.
        if (r.chance(0.5)) ds[r.int(1, places)] = 0;
        const changed = [...ds], at = r.int(1, places); changed[at] = (changed[at]! + 1) % 10;
        const number = asNumber(ds), words = asWords(ds), wrongNumber = asNumber(changed);
        // The given form is not copied onto a card; the other forms are built. One decoy card, not one per box.
        const given = mode === 'numeral' ? `Lukukortti: ${number}.`
          : mode === 'repair' ? `Määrä: ${words}. Lukukortti ${wrongNumber} on väärin.`
          : mode === 'transfer' ? `Nauhan pituus metreinä: ${words}.`
          : `Määrä: ${words}.`;
        const cap = (t: string) => t[0]!.toUpperCase() + t.slice(1);
        const slots = [...(mode === 'numeral' ? [] : [{ id: 'number', text: 'Lukukortti' }]), ...ds.map((_, i) => ({ id: `part${i}`, text: cap(names[i]![1]) }))];
        const tokens = [
          ...(mode === 'numeral' ? [] : [{ id: 'number', text: number }, { id: 'wrong-number', text: wrongNumber }]),
          ...ds.map((n, i) => ({ id: `part${i}`, text: unitPart(n, i) })),
          { id: 'wrong-part', text: unitPart(changed[at]!, at) },
        ];
        return {
          say: `${given} ${mode === 'numeral' ? 'Mitä osia siinä on?' : mode === 'repair' ? 'Valitse oikea lukukortti ja osat.' : 'Valitse lukukortti ja osat.'}`,
          task: {
            kind: 'place' as const, slots, tokens: r.shuffle(tokens),
            answer: Object.fromEntries(slots.map(s => [s.id, s.id])),
            why: {
              number: `Oikea lukukortti on ${number}. Nolla pitää tyhjän paikan.`,
              ...Object.fromEntries(ds.map((n, i) => [`part${i}`, `Tässä määrässä on ${unitPart(n, i)}.`])),
            },
          },
          hint: 'Ennen pilkkua kokonaiset. Pilkun jälkeen kymmenesosat, sadasosat, tuhannesosat. Nolla pitää tyhjän paikan.',
          explain: `${number} tarkoittaa ${words}. Nämä lukuyksiköt muodostavat yhdessä saman määrän${mode === 'transfer' ? ' metreinä' : ''}.`,
        };
      };
      return cases({ words: r => joint(r, 'words'), numeral: r => joint(r, 'numeral'), repair: r => joint(r, 'repair') }, r => joint(r, 'transfer'));
    })(),
  },
  // ============================================================ adding and subtracting
  {
    id: 'M-DEC-ADD', stop: 'Helmien yhteenlasku', icon: '➕',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit laskemaan desimaalilukuja yhteen ja vähentämään niitä: samat osat kohdakkain.',
    intro: 'Sukeltajat laskevat yhteen helmien painoja ja nauhojen pituuksia.',
    reward: 'Lasket desimaaliluvut yhteen ja vähennät, pilkut kohdakkain!',
    demo: () => [
      { say: 'Lasketaan 2,5 + 1,25. Jos numerot laitetaan oikeaan reunaan, viisi kymmenesosaa joutuu sadasosien alle. Siirretään pilkut kohdakkain, lisätään nolla ja lasketaan oikealta: sadasosat, kymmenesosat, ykköset.', scene: decColumnScene('2,5', '1,25') },
      { say: 'Lasketaan 3,47 + 1,8. Kymmenesosia tulee kaksitoista: kirjoitetaan kaksi ja yksi kokonainen muistiin.', scene: decColumnScene('3,47', '1,8') },
      { say: 'Vähennetään 5 − 1,7. Viitonen kirjoitetaan 5,0. Nollasta ei voi vähentää seitsemää, joten lainataan yksi ykkönen: kymmenen kymmenesosaa.', scene: decColumnScene('5', '1,7', '−') },
    ],
    item: cases({
      tenths: (r) => {
        const a = r.int(1, 9), b = r.int(1, 9);
        return ask(`${D(a / 10, 1)} + ${D(b / 10, 1)} = ?`, (a + b) / 10, `${a} kymmenesosaa + ${b} kymmenesosaa = ${a + b} kymmenesosaa = ${D((a + b) / 10, 1)}.`, { scene: tenthsBar(a + b, 220), hint: `Laske kymmenesosina: ${a} + ${b} kymmenesosaa. Kymmenen kymmenesosaa on 1.`, whyAt: { [round((a + b) / 100)]: 'Kymmenesosat plus kymmenesosat ovat kymmenesosia, eivät sadasosia.', [a + b]: `${a + b} kymmenesosaa on ${D((a + b) / 10, 1)}, ei ${a + b}.` } });
      },
      mixed: (r) => {
        const w1 = r.int(1, 5), x = r.int(1, 9), w2 = r.int(1, 4), y = r.int(1, 9), z = r.int(1, 9);
        const a = w1 + x / 10, b = w2 + y / 10 + z / 100, ans = a + b;
        const wrong = w1 + w2 + (x + y * 10 + z) / 100; // right-aligned digits
        return {
          say: `${D(a, 1)} + ${D(b, 2)} = ?`,
          task: pickNum(r, ans, [wrong, ans + 0.1], ['Kymmenesosat ja sadasosat sekoittuivat. Laita pilkut kohdakkain: ' + D(a, 2) + ' + ' + D(b, 2) + '.', 'Tarkista kymmenesosat.'], { step: 0.01, opt: (v) => ex(d(v)) }),
          hint: `Kirjoita ${D(a, 1)} muotoon ${D(a, 2)}, pilkut kohdakkain, ja laske oikealta.`,
          explain: `${D(a, 2)} + ${D(b, 2)} = ${D(ans, 2)}.`,
        };
      },
      detective: (r) => {
        const rows: { txt: string; ok: boolean; why: string }[] = [];
        const okFlags = r.shuffle([true, false, r.chance(0.5), r.chance(0.5)]);
        for (const ok of okFlags) {
          let w1: number, x: number, w2: number, y: number, z: number, right: number, wrong: number, txt: string;
          do {
            w1 = r.int(1, 5); x = r.int(1, 9); w2 = r.int(1, 4); y = r.int(1, 9); z = r.int(1, 9);
            right = round(w1 + x / 10 + w2 + y / 10 + z / 100); wrong = round(w1 + w2 + (x + y * 10 + z) / 100);
            txt = `${D(w1 + x / 10, 1)} + ${D(w2 + y / 10 + z / 100, 2)} = ${D(ok ? right : wrong, 2)}`;
          } while (right === wrong || rows.some((q) => q.txt === txt));
          rows.push({ txt, ok, why: ok ? `Pilkut kohdakkain: ${D(w1 + x / 10, 2)} + ${D(w2 + y / 10 + z / 100, 2)} = ${D(right, 2)}.` : `${x} kymmenesosaa on laskettu sadasosien kanssa. Oikein: ${D(w1 + x / 10, 2)} + ${D(w2 + y / 10 + z / 100, 2)} = ${D(right, 2)}.` });
        }
        return {
          say: 'Helmisukeltajan laskut: kumpi lasku on oikein, kumpi väärin? Lajittele.',
          task: { kind: 'sort' as const, items: rows.map((q) => ({ big: q.txt })), cats: [{ label: '✓ oikein' }, { label: '✗ väärin' }], answer: rows.map((q) => (q.ok ? 0 : 1)), why: rows.map((q) => q.why) },
          hint: 'Lisää lyhyempään nolla loppuun (esim. 2,5 = 2,50) ja laske itse. Vertaa tulosta.',
          explain: 'Väärissä laskuissa numerot on laitettu oikeaan reunaan, ja kymmenesosat on laskettu sadasosien kanssa.',
        };
      },
      sub: (r) => {
        const w = r.int(3, 9), x = r.int(1, 9), b = r.int(1, w - 1) + r.int(1, 9) / 10;
        const a = w + (r.chance(0.4) ? 0 : x / 10);
        return ask(`${d(a)} − ${d(b)} = ?`, a - b, `${D(a, 1)} − ${D(b, 1)} = ${D(a - b, 1)}. Tarkistus: ${D(a - b, 1)} + ${D(b, 1)} = ${D(a, 1)}.`, { hint: 'Kirjoita molempiin yksi desimaali, esimerkiksi 5 = 5,0.', whyAt: Math.round(a * 10) % 10 < Math.round(b * 10) % 10 ? { [round(a - b + 1)]: 'Lainasit kymmenen kymmenesosaa, mutta unohdit vähentää lainatun ykkösen kokonaisista.' } : {} });
      },
    }, (r) => {
      const a = r.pick([0.5, 0.75, 1.25, 1.5]), b = r.pick([0.25, 0.5, 0.75]);
      return ask(`Aava sukeltaa ${d(a)} tuntia aamulla ja ${d(b)} tuntia illalla. Montako tuntia yhteensä?`, a + b, `${D(a, 2)} + ${D(b, 2)} = ${D(a + b, 2)} tuntia.`, { unit: 'h', hint: `Kirjoita molemmat kahdella desimaalilla: ${D(a, 2)} + ${D(b, 2)}.` });
    }),
  },
  // ============================================================ multiplying
  {
    id: 'M-DEC-08', stop: 'Helmikertolasku', icon: '✖️',
    rev: LIGHT_REV, validRevs: [AUDIT_REV, LIGHT_REV],
    goal: 'Opit kertomaan desimaaliluvun kokonaisluvulla sekä luvuilla 10, 100 ja 1000.',
    intro: 'Sukeltajat kertovat: montako metriä nauhaa tarvitaan, kun jokainen koru vie saman verran?',
    reward: 'Kerrot desimaalilukuja ja siirrät pilkkua oikein!',
    demo: () => [
      { say: 'Neljä kertaa 0,3: otetaan kolme kymmenesosaa neljä kertaa. Kymmenen kymmenesosaa täyttää yhden kokonaisen. Kaksitoista kymmenesosaa on 1,2.', scene: timesTenthsScene(4, 3) },
      { say: 'Kerrotaan 3,45 kymmenellä. Pilkku pysyy paikallaan, ja jokainen numero siirtyy yhden paikan vasemmalle eli tulee kymmenen kertaa suuremmaksi: 34,5.', scene: shiftScene('3,45', 10) },
      { say: 'Kerrotaan 0,7 tuhannella. Numero siirtyy kolme paikkaa, ja tyhjiin paikkoihin tulee nollat: 700.', scene: shiftScene('0,7', 1000) },
    ],
    item: cases({
      whole: (r) => {
        const k = r.int(2, 9), a = r.int(2, 9);
        const ans = (k * a) / 10;
        return {
          say: `${k} × ${D(a / 10, 1)} = ?`,
          task: pickNum(r, ans, [(k * a) / 100, k * a, k + a / 10], ['Kymmenesosia kerrottuna kokonaisluvulla tulee kymmenesosia, ei sadasosia.', 'Pilkku unohtui.', `Kerro koko luku: ${k} × ${a} kymmenesosaa.`], { step: 0.1, opt: (v) => ex(d(v)) }),
          hint: `Laske kymmenesosina: ${k} × ${a} kymmenesosaa. Kymmenen kymmenesosaa on yksi kokonainen.`,
          explain: `${k} × ${a} kymmenesosaa = ${k * a} kymmenesosaa = ${d(ans)}.`,
        };
      },
      tens: (r) => {
        const x = r.int(101, 999) / 100, p = r.pick([10, 100, 1000]);
        const st = String(p).length - 1;
        return ask(`${d(x)} × ${p} = ?`, x * p, `Kertominen luvulla ${p} siirtää jokaista numeroa ${st} paikkaa suuremmaksi: ${d(x * p)}.`, {
          hint: `Pilkku pysyy, numerot siirtyvät ${st} ${st === 1 ? 'paikan' : 'paikkaa'} vasemmalle. Nollien määrä kertoo siirtojen määrän.`,
          whyAt: { [round(x / p)]: 'Kerrottaessa luku kasvaa: numerot siirtyvät vasemmalle, ei oikealle.', ...(st > 1 ? { [round(x * 10)]: `Siirsit vain yhden paikan. Luvussa ${p} on ${st} nollaa, joten siirtoja on ${st}.` } : {}) },
        });
      },
      shift: (r) => {
        const x = r.int(101, 999) / 100, f = (v: number) => d(round(v));
        const tok = r.shuffle([f(x * 10), f(x * 100), f(x * 1000), f(x / 10)]);
        return {
          say: `Helmipurkissa on ${d(x)} kg helmiä. Vedä oikea tulos jokaisen kertolaskun kohdalle. Yksi kortti jää yli.`,
          task: {
            kind: 'place',
            slots: [{ id: 'a', text: `${d(x)} × 10` }, { id: 'b', text: `${d(x)} × 100` }, { id: 'c', text: `${d(x)} × 1000` }],
            tokens: tok.map((v) => ({ id: v, text: v })),
            answer: { a: f(x * 10), b: f(x * 100), c: f(x * 1000) },
            why: { a: 'Yksi nolla: yksi siirto vasemmalle.', b: 'Kaksi nollaa: kaksi siirtoa.', c: 'Kolme nollaa: kolme siirtoa, tyhjään paikkaan nolla.' },
          } as Task,
          hint: 'Jokainen nolla kertojassa siirtää numeroita yhden paikan vasemmalle. Pilkku pysyy.',
          explain: `${d(x)} × 10 = ${f(x * 10)}, × 100 = ${f(x * 100)}, × 1000 = ${f(x * 1000)}.`,
        };
      },
      repeated: (r) => {
        const a = r.pick([0.2, 0.25, 0.4, 0.5, 0.75, 1.5]), k = r.int(2, 6);
        return ask(`Yksi helminauha on ${d(a)} metriä. Kuinka monta metriä on ${k} nauhaa?`, a * k, `${k} × ${d(a)} m = ${d(a * k)} m.`, { unit: 'm', hint: `Laske ${d(a)} + ${d(a)} + … ${k} kertaa, tai ${k} × ${Math.round(a * 100)} sadasosaa.` });
      },
    }, (r) => {
      const hrs = r.pick([1.5, 2.5, 0.5]);
      return ask(`Sukellusretki kestää ${d(hrs)} tuntia. Montako minuuttia se on?`, hrs * 60, `Tunnissa on 60 minuuttia: ${d(hrs)} × 60 = ${hrs * 60} min.`, { unit: 'min', hint: 'Puoli tuntia on 30 minuuttia.' });
    }),
  },
  // ============================================================ dividing
  {
    id: 'M-DEC-09', stop: 'Helmijako', icon: '➗',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit jakamaan desimaaliluvun kokonaisluvulla sekä luvuilla 10, 100 ja 1000.',
    intro: 'Sukeltajat jakavat saaliin tasan. Jokainen saa yhtä paljon.',
    reward: 'Jaat desimaalilukuja tasan ja siirrät pilkkua oikein!',
    demo: () => [
      { say: '4,8 jaetaan kahdelle lautaselle. Ensin neljä kokonaista: kumpikin saa kaksi. Sitten kahdeksan kymmenesosaa: kumpikin saa neljä. Vastaus 2,4.', scene: shareDecScene(4, 8, 2) },
      { say: '5,4 jaetaan kolmelle. Kokonaisia riittää yksi jokaiselle, kaksi jää yli. Ne vaihdetaan kahdeksikymmeneksi kymmenesosaksi: kymmenesosia on nyt 24. Jokainen saa kahdeksan. Vastaus 1,8.', scene: shareDecScene(5, 4, 3) },
      { say: 'Kun jaetaan sadalla, pilkku pysyy ja jokainen numero siirtyy kaksi paikkaa oikealle eli pienemmäksi. Ykkösten paikalle tulee nolla.', scene: shiftScene('45', 100, '÷') },
    ],
    item: cases({
      share: (r) => {
        const k = r.int(2, 4), q = r.int(11, 29) / 10;
        const total = round(k * q);
        return ask(`${d(total)} : ${k} = ?`, q, `${d(total)} : ${k} = ${d(q)}. Tarkistus: ${k} × ${d(q)} = ${d(total)}.`, { hint: 'Jaa ensin kokonaiset, sitten kymmenesosat.' });
      },
      tens: (r) => {
        const x = r.int(5, 950), p = r.pick([10, 100, 1000]);
        return {
          say: `${x} : ${p} = ?`,
          task: pickNum(r, x / p, p < 1000 ? [x / (p * 10), (x * 10) / p] : [(x * 10) / p, x / 10], p < 1000 ? ['Siirsit yhden paikan liikaa.', 'Siirsit yhden paikan liian vähän.'] : ['Siirsit yhden paikan liian vähän.', 'Siirsit kaksi paikkaa liian vähän.'], { step: 1 / p, opt: (v) => ex(d(v)) }),
          hint: `Pilkku pysyy, numerot siirtyvät ${String(p).length - 1} ${p === 10 ? 'paikan' : 'paikkaa'} oikealle. Luku pienenee.`,
          explain: `Jakaminen luvulla ${p} siirtää jokaista numeroa ${String(p).length - 1} paikkaa pienemmäksi: ${d(x / p)}.`,
        };
      },
      money: (r) => {
        const k = r.int(2, 5), each = r.pick([0.5, 1.5, 2.5, 1.2, 0.8, 2.25]);
        return ask(`${k} sukeltajaa jakaa ${d(each * k)} euroa tasan. Paljonko kukin saa?`, each, `${d(each * k)} € : ${k} = ${d(each)} €.`, { unit: '€', hint: 'Jaa ensin kokonaiset eurot. Yli jääneet eurot vaihdetaan senteiksi ja jaetaan.' });
      },
      steps: (r) => {
        let w = 0, t = 0, k = 0, q1 = 0, r1 = 0, T = 0, q2 = 0;
        do { k = r.int(2, 4); q1 = r.int(1, 2); q2 = r.int(2, 9); T = q2 * k; r1 = Math.floor(T / 10); t = T - 10 * r1; w = q1 * k + r1; }
          while (r1 === 0 || new Set([q1, r1, T, q2, t]).size < 5);
        const tot = t ? `${w},${t}` : `${w}`;
        return {
          say: `Jaetaan ${tot} helmikiloa ${k} sukeltajalle. Vedä luvut oikeisiin kohtiin. Yksi kortti jää yli.`,
          task: {
            kind: 'place',
            slots: [{ id: 'a', text: 'kokonaisia jokaiselle' }, { id: 'b', text: 'kokonaisia jää yli' }, { id: 'c', text: 'kymmenesosia vaihdon jälkeen' }, { id: 'd', text: 'kymmenesosia jokaiselle' }],
            tokens: r.shuffle([q1, r1, T, q2, t]).map((v) => ({ id: `n${v}`, text: String(v) })),
            answer: { a: `n${q1}`, b: `n${r1}`, c: `n${T}`, d: `n${q2}` },
            why: { a: `${w} : ${k} → ${q1} jokaiselle.`, b: `${w} − ${q1 * k} = ${r1}.`, c: `${r1} ${r1 === 1 ? 'kokonainen' : 'kokonaista'} = ${10 * r1} kymmenesosaa, ja ${t} kymmenesosaa oli jo: ${T}.`, d: `${T} : ${k} = ${q2}.` },
          } as Task,
          hint: 'Yksi kokonainen = 10 kymmenesosaa. Lisää vaihdetut kymmenesosat niihin, joita oli jo.',
          explain: `${tot} : ${k} = ${q1},${q2}.`,
        };
      },
    }, (r) => {
      const cm = r.int(5, 95);
      return ask(`Helmilauta on ${cm} senttiä pitkä. Kirjoita pituus metreinä. Metrissä on 100 senttiä.`, cm / 100, `${cm} : 100 = ${D(cm / 100, 2)}. ${cm} cm = ${D(cm / 100, 2)} m.`, { unit: 'm', hint: 'Jaa sadalla: numerot siirtyvät kaksi paikkaa oikealle.', whyAt: { [round(cm / 10)]: 'Jaoit kymmenellä. Metrissä on 100 senttiä, joten jaa sadalla.' } });
    }),
  },
];
