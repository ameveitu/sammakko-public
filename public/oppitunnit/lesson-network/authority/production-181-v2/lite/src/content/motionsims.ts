// Motion/time lessons on the shared player (ui/motion.ts). Each mapped lesson gets a `sim`
// family: the learner runs, pauses, replays or scrubs ONE scenario, and every view they see
// (track, ruler, stopwatch, lamps, table, graphs, strobe) shows the same moment. Views are
// limited to representations the lesson or its prerequisites teach (tested). The scenario
// is recorded with the answer (`scn`). When the learner must calculate a speed, no view
// shows it.
import type { Rng } from '../engine/rng';
import type { Item, Option, Task } from '../engine/types';
import { motionScene, type MotionCfg, type View } from '../ui/motion';
import { fmt } from './fi';
import { choose, fixed, txt } from './kit';

type Q = Omit<Item, 'tag'>;
const t = (s: string) => txt(s, false);
const num = (answer: number, unit?: string, tolerance?: number): Task => ({ kind: 'numeric', answer, unit, tolerance });
const sim = (c: MotionCfg, q: Omit<Q, 'scene' | 'scn'>): Q => ({ ...q, scene: motionScene(c), scn: c.scn });
const PLAY = 'Käynnistä ja katso.';

/** Which earlier lessons teach each view. A view is allowed when one of these is the lesson
 *  itself or in its required/strong ancestry. Views not listed need nothing. */
export const VIEW_TAUGHT: Partial<Record<View, RegExp>> = {
  watch: /^(M-TIME-03|PHY79-DIST-TIME)$/,
  ruler: /^(M-MEAS-0[1-4]|PHY79-DIST-TIME|PHY79-QTY-01)$/,
  table: /^(PHY79-DATA-01)$/,
  st: /^(PHY79-GRAPH-01|PHY79-ST-GRAPH|PHY79-ACCEL-MOTION-GRAPH)$/,
  vt: /^(PHY79-VT-GRAPH|PHY79-ACCEL-VT-GRAPH)$/,
  speedo: /^(PHY79-SPEED-CONCEPT|PHY79-SPEED-UNIT|PHY79-SPEED-CALC)$/,
  laps: /^(M-NUM-01|M-NUM-1TO1)$/,
};
/** Tenths on the stopwatch need decimal numbers. */
export const TENTHS_TAUGHT = /^(M-DEC-|M79-DEC-)/;

const lane = (v: number, thing: MotionCfg['lanes'][0]['thing'], label?: string, delay = 0, a = 0) =>
  ({ thing, label, legs: delay ? [{ dur: delay, v: 0 }, { dur: Infinity, v, a }] : [{ dur: Infinity, v, a }] });

export const SIMS: Record<string, (r: Rng) => Q> = {
  // ---------------------------------------------------------------- time, early
  'M-TIME-01': (r) => {
    // Two ducks start together on equal courses; the one that arrives later swam longer.
    const L = 12, ta = r.int(3, 8); let tb = r.int(3, 8); if (r.chance(0.2)) tb = ta; else if (tb === ta) tb = ta + 2;
    const RED: Option = { text: 'Punainen', speak: 'Punainen' }, BLUE: Option = { text: 'Sininen', speak: 'Sininen' };
    return sim({ track: { kind: 'straight', L }, lanes: [lane(L / ta, 'car', 'P'), lane(L / tb, 'car2', 'S')], end: Math.max(ta, tb) + 1, views: ['track', 'lamps'], lampsAt: [L], scn: `kesto ${ta} s / ${tb} s` }, {
      say: `Punainen ja sininen auto lähtevät yhtä aikaa. Lamppu syttyy, kun auto on perillä. Kumpi ajo kesti kauemmin? ${PLAY}`,
      task: fixed([RED, BLUE, { text: 'Yhtä kauan', speak: 'Yhtä kauan' }], ta > tb ? 0 : tb > ta ? 1 : 2, ta === tb ? ['Lamput syttyivät yhtä aikaa.', 'Lamput syttyivät yhtä aikaa.'] : [], 3),
      explain: ta === tb ? 'Autot lähtivät ja pääsivät perille yhtä aikaa: ajot kestivät yhtä kauan.' : `${ta > tb ? 'Punainen' : 'Sininen'} pääsi perille myöhemmin, vaikka autot lähtivät yhtä aikaa. Sen ajo kesti kauemmin.`,
    });
  },
  'M-TIME-03': (r) => {
    const L = 12, tt = r.pick([2, 3, 4, 6]);
    return sim({ track: { kind: 'straight', L }, lanes: [lane(L / tt, 'duck')], end: tt + 2, views: ['track', 'watch', 'lamps'], lampsAt: [L], watchStops: true, scn: `ankka ${tt} s` }, {
      say: `Sekuntikello käy, kun ankka ui. Sekuntikello pysähtyy, kun ankka on perillä. Kuinka monta sekuntia uinti kesti? ${PLAY}`,
      task: num(tt, 's'),
      explain: `Sekuntikello pysähtyi lukemaan ${tt} s. Uinti kesti ${tt} sekuntia.`,
    });
  },
  // ---------------------------------------------------------------- environmental motion
  'ENV-PHY-MOTION-OBS-01': (r) => {
    const moving = r.chance(0.6), L = 10;
    return sim({ track: { kind: 'straight', L }, lanes: [{ thing: 'leaf', legs: [{ dur: Infinity, v: moving ? 1 : 0 }] }], end: 6, views: ['track', 'timeline'], landmark: 3, scn: moving ? 'lehti liikkuu' : 'lehti paikallaan' }, {
      say: `Katso lehteä ja kiveä. Liikkuiko lehti? ${PLAY}`,
      task: fixed([{ text: 'Liikkui', speak: 'Liikkui' }, { text: 'Ei liikkunut', speak: 'Ei liikkunut' }], moving ? 0 : 1),
      explain: moving ? 'Lehden paikka kiveen nähden muuttui: se liikkui.' : 'Lehti pysyi samassa kohdassa kiveen nähden.',
    });
  },
  'ENV-PHY-MOTION-CHANGE-01': (r) => {
    const c = r.pick(['steady', 'faster', 'stop'] as const), L = 12;
    const legs = c === 'steady' ? [{ dur: Infinity, v: 1.6 }] : c === 'faster' ? [{ dur: Infinity, v: 0.4, a: 0.45 }] : [{ dur: 3, v: 2 }, { dur: Infinity, v: 0 }];
    const OPTS = { steady: 'Ui koko ajan samalla tavalla', faster: 'Nopeutui', stop: 'Pysähtyi' };
    return sim({ track: { kind: 'straight', L }, lanes: [{ thing: 'duck', legs }], end: 6, views: ['track', 'strobe', 'timeline'], dt: 1, scn: `ankka ${c}` }, {
      say: `Haamukuvat jäävät ankan paikoista joka sekunti. Mikä ankan liikkeessä tapahtui? ${PLAY}`,
      task: fixed((['steady', 'faster', 'stop'] as const).map((k) => t(OPTS[k])), ['steady', 'faster', 'stop'].indexOf(c), [], 1),
      explain: c === 'steady' ? 'Haamukuvien välit ovat yhtä pitkät: liike ei muuttunut.' : c === 'faster' ? 'Välit kasvavat: ankka eteni joka sekunti pidemmälle.' : 'Lopussa haamukuvat ovat päällekkäin: ankka pysähtyi.',
    });
  },
  'ENV-PHY-MOTION-01': (r) => {
    const top = r.chance(0.5), L = 12, change = r.chance(0.5) ? 'stop' : 'faster';
    const changing = change === 'stop' ? [{ dur: 3, v: 2 }, { dur: Infinity, v: 0 }] : [{ dur: Infinity, v: 0.4, a: 0.45 }];
    const steady = [{ dur: Infinity, v: 1.6 }];
    return sim({ track: { kind: 'straight', L }, lanes: [{ thing: 'duck', legs: top ? changing : steady }, { thing: 'duck', legs: top ? steady : changing }], end: 6, views: ['track', 'strobe', 'timeline'], dt: 1, scn: `muuttuva ${top ? 'ylempi' : 'alempi'} ${change}` }, {
      say: `Kumman ankan liike muuttui? ${PLAY}`,
      task: fixed([t('Ylemmän'), t('Alemman')], top ? 0 : 1),
      explain: `${top ? 'Ylemmän' : 'Alemman'} ankan haamukuvien välit ${change === 'stop' ? 'loppuvat: se pysähtyi' : 'kasvavat: se nopeutui'}. Toisen välit pysyvät samoina.`,
    });
  },
  // ---------------------------------------------------------------- physics 7–9
  'PHY79-MOTION-REF': (r) => {
    const v = r.pick([1, 2]), L = 20;
    const ask = r.pick(['boat', 'shore'] as const);
    return sim({ track: { kind: 'straight', L }, lanes: [lane(v, 'boat', 'vene'), lane(v, 'frog', 'sammakko')], end: 8, views: ['track', 'timeline'], landmark: 4, scn: `rinnakkain ${v} m/s, kysytään ${ask}` }, {
      say: ask === 'boat' ? `Sammakko ui veneen vieressä. Liikkuuko sammakko veneeseen nähden? ${PLAY}` : `Sammakko ui veneen vieressä. Liikkuuko sammakko rannan kiveen nähden? ${PLAY}`,
      task: fixed([t('Liikkuu'), t('Ei liiku')], ask === 'boat' ? 1 : 0, ask === 'boat' ? ['Etäisyys veneeseen pysyy samana.'] : [undefined, 'Etäisyys kiveen kasvaa.']),
      explain: ask === 'boat' ? 'Sammakko ja vene pysyvät rinnakkain: veneeseen nähden sammakko on paikallaan.' : 'Kiveen nähden sammakon paikka muuttuu koko ajan: se liikkuu.',
    });
  },
  'PHY79-DIST-TIME': (r) => {
    const v = r.pick([2, 4, 5]), go = r.int(2, 5), L = 40, s = v * go, which = r.pick(['dist', 'time'] as const);
    return sim({ track: { kind: 'straight', L }, lanes: [{ thing: 'car', legs: [{ dur: go, v }, { dur: Infinity, v: 0 }] }], end: go + 3, views: ['track', 'ruler', 'watch', 'timeline'], scn: `${v} m/s ${go} s, kysytään ${which}` }, {
      say: which === 'dist' ? `Auto ajaa ja pysähtyy. Lue viivaimesta: kuinka pitkän matkan auto kulki? ${PLAY}` : `Auto ajaa ja pysähtyy. Siirrä aikajanaa: kuinka monta sekuntia auto liikkui? ${PLAY}`,
      task: which === 'dist' ? num(s, 'm') : num(go, 's'),
      explain: which === 'dist' ? `Auto pysähtyi viivaimen kohtaan ${s} m. Matka on ${s} m.` : `Auto liikkui ${go} s ja seisoi sen jälkeen. Sekuntikello kävi silti eteenpäin.`,
    });
  },
  'PHY79-SPEED-CONCEPT': (r) => {
    // Rally: choose the speed that finishes the course in the target time. Reuses the player.
    const L = 40, target = r.pick([5, 8, 10]), right = L / target, speeds = [...new Set([2, right, 8, 10, 4, 5])].filter((x) => x <= 10).slice(0, 4).sort((a, b) => a - b);
    if (!speeds.includes(right)) speeds[0] = right;
    speeds.sort((a, b) => a - b);
    return sim({ track: { kind: 'straight', L }, lanes: [lane(0, 'car', '')], end: 22, views: ['track', 'ruler', 'watch', 'speedo'], control: { speeds }, watchStops: true, scn: `ralli ${L} m, tavoite ${target} s` }, {
      say: `Rata on ${L} m. Millä nopeudella auto ajaa radan ${target} sekunnissa? Kokeile nopeuksia.`,
      task: fixed(speeds.map((v) => t(`${fmt(v)} m/s`)), speeds.indexOf(right), speeds.map((v) => v > right ? `Liian nopea: perille ${fmt(L / v)} sekunnissa.` : v < right ? `Liian hidas: perille ${fmt(L / v)} sekunnissa.` : undefined), 2),
      explain: `${fmt(right)} m/s tarkoittaa ${fmt(right)} metriä joka sekunti: ${target} sekunnissa ${L} m.`,
    });
  },
  'PHY79-SPEED-CALC': (r) => {
    const L = 40, v = r.pick([2, 4, 5, 8]), tt = L / v;
    return sim({ track: { kind: 'straight', L }, lanes: [lane(v, 'car')], end: tt + 2, views: ['track', 'ruler', 'watch'], hideSpeed: true, watchStops: true, scn: `${L} m ${tt} s` }, {
      say: `Mittaa: radan pituus viivaimesta ja aika sekuntikellosta. Laske auton nopeus. ${PLAY}`,
      task: num(v, 'm/s'),
      explain: `v = s / t = ${L} m / ${tt} s = ${v} m/s.`,
    });
  },
  'PHY79-SPEED-UNIT': (r) => {
    const L = 30, v = r.pick([3, 5]);
    return sim({ track: { kind: 'straight', L }, lanes: [lane(v, 'car')], end: L / v + 1, views: ['track', 'ruler', 'watch'], hideSpeed: true, watchStops: true, scn: `${L} m / ${L / v} s` }, {
      say: `Viivain näyttää metrejä ja sekuntikello sekunteja. Missä yksikössä auton nopeus ilmoitetaan? ${PLAY}`,
      task: choose(r, t('m/s'), [t('m · s'), t('s/m')], ['Matkaa ja aikaa ei kerrota, vaan jaetaan.', 'Matka jaetaan ajalla, ei toisin päin.']),
      explain: `Nopeus = matka (m) / aika (s), joten yksikkö on m/s. Tässä ${L} m / ${L / v} s = ${v} m/s.`,
    });
  },
  'PHY79-SPEED-REARR': (r) => {
    const v = r.pick([2, 4, 5]), L = 40, which = r.pick(['time', 'dist'] as const), tt = which === 'time' ? L / v : r.int(3, 6);
    return sim({ track: { kind: 'straight', L }, lanes: [lane(v, 'car')], end: L / v + 1, views: ['track', 'ruler', 'speedo'], scn: `${v} m/s, kysytään ${which}` }, {
      say: which === 'time' ? `Mittari näyttää auton nopeuden. Laske, kuinka kauan ${L} m radan ajaminen kestää. Tarkista sitten ajamalla.` : `Mittari näyttää auton nopeuden. Laske, kuinka pitkälle auto pääsee ${tt} sekunnissa.`,
      task: which === 'time' ? num(L / v, 's') : num(v * tt, 'm'),
      explain: which === 'time' ? `t = s / v = ${L} m / ${v} m/s = ${L / v} s.` : `s = v · t = ${v} m/s · ${tt} s = ${v * tt} m.`,
    });
  },
  'PHY79-SPEED-MIXED': (r) => {
    // Optional oval: one lap is L metres of path, so laps × L is the distance.
    const L = 400, v = r.pick([8, 10]), laps = r.pick([3, 6]), secs = (laps * L) / v;
    return sim({ track: { kind: 'oval', L }, lanes: [lane(v, 'car')], end: Math.min(secs, 60), views: ['track', 'laps', 'speedo'], scn: `soikio ${L} m, ${v} m/s, ${laps} kierrosta` }, {
      say: `Yksi kierros soikealla radalla on ${L} m. Auto ajaa ${laps} kierrosta mittarin nopeudella. Kuinka monta minuuttia ajo kestää?`,
      task: num(secs / 60, 'min', 0.01),
      explain: `Matka ${laps} · ${L} m = ${laps * L} m. Aika ${laps * L} m / ${v} m/s = ${secs} s = ${fmt(secs / 60)} min.`,
    });
  },
  'PHY79-DATA-01': (r) => {
    const v = r.pick([2, 3, 4]), k = r.int(3, 6), L = 40;
    return sim({ track: { kind: 'straight', L }, lanes: [lane(v, 'car')], end: 8, views: ['track', 'table'], dt: 1, scn: `${v} m/s, rivi ${k} s` }, {
      say: `Taulukko täyttyy joka sekunti, kun auto ajaa. Mikä matka kirjataan ajan ${k} s kohdalle? ${PLAY}`,
      task: num(v * k, 'm'),
      explain: `Auto etenee ${v} m joka sekunti: ${k} s kohdalla matka on ${v * k} m.`,
    });
  },
  'PHY79-GRAPH-01': (r) => {
    const v = r.pick([2, 4, 5]), k = r.int(2, 6), L = 40;
    return sim({ track: { kind: 'straight', L }, lanes: [lane(v, 'car')], end: 8, views: ['track', 'table', 'st'], dt: 1, scn: `${v} m/s, piste ${k} s` }, {
      say: `Kuvaaja piirtyy samaan aikaan kuin auto ajaa. Kuvaajassa on piste (${k} s, ?). Mikä on matka? ${PLAY}`,
      task: num(v * k, 'm'),
      explain: `Taulukossa ajalla ${k} s matka on ${v * k} m, joten piste on (${k}, ${v * k}).`,
    });
  },
  'PHY79-ST-GRAPH': (r) => {
    const a = r.int(2, 3), b = r.int(2, 3), v = 4, L = 40;
    return sim({ track: { kind: 'straight', L }, lanes: [{ thing: 'car', legs: [{ dur: a, v }, { dur: b, v: 0 }, { dur: Infinity, v }] }], end: 8, views: ['track', 'watch', 'st'], scn: `ajo ${a} s, seis ${b} s` }, {
      say: `Auto ajaa, pysähtyy ja jatkaa. Millä aikavälillä auto seisoi? ${PLAY}`,
      task: choose(r, t(`${a}–${a + b} s`), [t(`0–${a} s`), t(`${a + b}–8 s`)], ['Silloin kuvaaja nousee: auto liikkui.', 'Silloin kuvaaja nousee: auto liikkui.'], 3),
      explain: `Kun auto seisoo, matka ei kasva: kuvaaja on vaakasuora välillä ${a}–${a + b} s.`,
    });
  },
  'PHY79-VT-GRAPH': (r) => {
    const c = r.pick(['steady', 'accel', 'decel'] as const), L = 60;
    const legs = c === 'steady' ? [{ dur: Infinity, v: 5 }] : c === 'accel' ? [{ dur: Infinity, v: 1, a: 1 }] : [{ dur: Infinity, v: 9, a: -1 }];
    const O = { steady: 'Nopeus pysyy samana', accel: 'Nopeus kasvaa', decel: 'Nopeus pienenee' };
    return sim({ track: { kind: 'straight', L }, lanes: [{ thing: 'car', legs }], end: 8, views: ['track', 'speedo', 'vt'], vMax: 10, scn: `v–t ${c}` }, {
      say: `Katso nopeus–aika-kuvaajaa. Mitä auton nopeudelle tapahtuu? ${PLAY}`,
      task: fixed((['steady', 'accel', 'decel'] as const).map((k) => t(O[k])), ['steady', 'accel', 'decel'].indexOf(c), [], 1),
      explain: c === 'steady' ? 'Kuvaaja on vaakasuora: nopeus ei muutu.' : c === 'accel' ? 'Kuvaaja nousee: nopeus kasvaa.' : 'Kuvaaja laskee: nopeus pienenee.',
    });
  },
  'PHY79-ACCEL-CONCEPT': (r) => {
    const c = r.pick(['steady', 'accel', 'decel'] as const), L = 60;
    const legs = c === 'steady' ? [{ dur: Infinity, v: 5 }] : c === 'accel' ? [{ dur: Infinity, v: 1, a: 1 }] : [{ dur: Infinity, v: 9, a: -1 }];
    return sim({ track: { kind: 'straight', L }, lanes: [{ thing: 'boat', legs }], end: 8, views: ['track', 'speedo', 'strobe'], dt: 1, scn: `kiihtyvyys ${c}` }, {
      say: `Seuraa veneen nopeusmittaria. Onko liikkeessä kiihtyvyyttä? ${PLAY}`,
      task: fixed([t('On'), t('Ei ole')], c === 'steady' ? 1 : 0, c === 'steady' ? ['Mittari näyttää koko ajan samaa.'] : [undefined, c === 'decel' ? 'Myös hidastuminen on nopeuden muutos.' : 'Nopeus kasvaa.']),
      explain: c === 'steady' ? 'Nopeus pysyy samana: kiihtyvyyttä ei ole.' : 'Nopeus muuttuu: liikkeessä on kiihtyvyyttä.',
    });
  },
  'PHY79-ACCEL-CALC': (r) => {
    const a = r.int(1, 3), tt = r.pick([2, 3, 4]), L = 60;
    return sim({ track: { kind: 'straight', L }, lanes: [{ thing: 'boat', legs: [{ dur: tt, v: 0, a }, { dur: Infinity, a: 0 }] }], end: tt + 2, views: ['track', 'watch', 'speedo', 'timeline'], scn: `levosta a=${a} ${tt} s` }, {
      say: `Vene lähtee levosta ja kiihdyttää ${tt} s. Lue mittarista nopeus ajan ${tt} s kohdalla ja laske kiihtyvyys. ${PLAY}`,
      task: num(a, 'm/s²'),
      explain: `a = (${a * tt} − 0) m/s / ${tt} s = ${a} m/s².`,
    });
  },
  'PHY79-ACCEL-MOTION-GRAPH': (r) => {
    const c = r.pick(['steady', 'accel'] as const), L = 60;
    const legs = c === 'steady' ? [{ dur: Infinity, v: 5 }] : [{ dur: Infinity, v: 0, a: 1.6 }];
    return sim({ track: { kind: 'straight', L }, lanes: [{ thing: 'car', legs }], end: 8, views: ['track', 'strobe', 'st'], dt: 1, sMax: 60, scn: `s–t ${c}` }, {
      say: `Katso matka–aika-kuvaajaa ja haamukuvia. Millaista liike on? ${PLAY}`,
      task: fixed([t('Tasaista: kuvaaja on suora'), t('Kiihtyvää: kuvaaja kaartuu ylöspäin')], c === 'steady' ? 0 : 1, [], 1),
      explain: c === 'steady' ? 'Joka sekunti sama matka: kuvaaja on suora.' : 'Joka sekunti pidempi matka: kuvaaja kaartuu jyrkemmäksi.',
    });
  },
  'PHY79-ACCEL-VT-GRAPH': (r) => {
    const a = r.pick([1, 2]), v0 = r.int(0, 2), L = 80;
    return sim({ track: { kind: 'straight', L }, lanes: [{ thing: 'car', legs: [{ dur: Infinity, v: v0, a }] }], end: 4, views: ['track', 'vt'], vMax: 10, scn: `v–t v0=${v0} a=${a}` }, {
      say: `Lue nopeus–aika-kuvaajasta, paljonko nopeus kasvaa joka sekunti. Mikä on kiihtyvyys? ${PLAY}`,
      task: num(a, 'm/s²'),
      explain: `Nopeus kasvaa ${v0} m/s → ${v0 + 4 * a} m/s ajassa 4 s: a = ${4 * a} m/s / 4 s = ${a} m/s².`,
    });
  },
  'PHY79-ACCEL-GRAPH': (r) => {
    const c = r.pick(['steady', 'accel'] as const), L = 60;
    const legs = c === 'steady' ? [{ dur: Infinity, v: 5 }] : [{ dur: Infinity, v: 0, a: 1.6 }];
    return sim({ track: { kind: 'straight', L }, lanes: [{ thing: 'car', legs }], end: 8, views: ['track', 'st', 'vt'], vMax: 14, sMax: 60, scn: `kaksi kuvaajaa ${c}` }, {
      say: `Molemmat kuvaajat piirtyvät samasta ajosta, ja pystyviiva näyttää saman hetken. Mikä pari kuvaa ajoa? ${PLAY}`,
      task: fixed([t('v–t vaakasuora, s–t suora nouseva'), t('v–t nouseva, s–t ylöspäin kaartuva')], c === 'steady' ? 0 : 1, [], 1),
      explain: c === 'steady' ? 'Vakionopeus: v–t vaakasuora ja matka kasvaa tasaisesti.' : 'Nopeus kasvaa tasaisesti: v–t nousee suorana, ja s–t kaartuu ylöspäin.',
    });
  },
};

/** Lessons migrated to the shared player (both groups of the brief). */
export const MOTION_NODES = Object.keys(SIMS);
export const MOTION_REV = 'motion1-2026-10-27';
