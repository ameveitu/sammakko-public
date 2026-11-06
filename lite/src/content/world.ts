import { family } from './families';
import { ancestors, isUnlocked, ORDER, requiredOf } from '../engine/graph';
import { store, type World } from '../engine/store';

export interface Chapter {
  id: string;
  world: World;
  name: string;
  story: string;
  nodes: string[];
  quick?: boolean;
}

export interface WorldInfo {
  id: World;
  name: string;
  grade: string;
  blurb: string;
  /** The frame story: who needs help, why, and what the fog has to do with it. */
  tale: string;
  /** The goal in one line, shown on the map with how much fog is left. */
  quest: string;
  /** Said when the last place of the world lights up. */
  finale: string;
  /** Each chapter is drawn as its own island (roads between them become ferry routes). */
  islands?: boolean;
  /** Name of the quick foundation chapter (skills from an earlier world). */
  foundation?: { name: string; story: string };
}

export const WORLDS: WorldInfo[] = [
  {
    id: 'ranta', name: 'Rantaretki', grade: '1.–2. luokka', blurb: 'Laskemista, mittaamista, merkkejä ja havaintoja.',
    tale: 'Aamusumu on laskeutunut lammen rannalle, eikä Loikka-sammakko näe retkipaikkoja. Loikka ja hänen ystävänsä Aava tarvitsevat apuasi. Jokainen paikka, jossa autat heitä, alkaa loistaa ja ajaa sumua pois. Kun koko ranta loistaa, Loikka rakentaa lautan ja purjehtii saaristoon.',
    quest: 'Aja sumu pois rannalta, niin Loikka pääsee lautalla saaristoon.',
    finale: 'Koko ranta loistaa! Lautta on valmis, ja Loikka purjehtii kohti Aarresaaristoa.',
  },
  {
    id: 'saari', name: 'Aarresaaristo', grade: '3.–6. luokka', blurb: 'Aarrekartta, jäätynyt lahti, saaren tori, piirakkajuhla ja vaakasaari.', islands: true,
    tale: 'Kapteeni Loikka löysi rannalta pullopostin: vanhan aarrekartan. Saaristo on kuitenkin sakean sumun peitossa. Jokainen ratkaistu paikka sytyttää valon, ja sumu väistyy saari kerrallaan. Kartan viimeisellä saarella, tutkimusasemalla, odottaa aarre.',
    quest: 'Valaise saaret yksi kerrallaan ja löydä aarre tutkimusasemalta.',
    finale: 'Koko saaristo loistaa, ja aarrearkku aukeaa! Sen sisällä on kutsu Lampilaboratorioon.',
    foundation: { name: 'Rantapohja', story: 'Kapteeni tarkistaa ennen lähtöä, että rannan taidot ovat mukana. Nämä ovat nopeita: kaksi oikein riittää.' },
  },
  {
    id: 'lab', name: 'Lampilaboratorio', grade: '7.–9. luokka', blurb: 'Suureet, nopeus, yhtälöt, funktiot, kuvaajat ja kiihtyvyys.',
    tale: 'Tutkija Sulka, silmälasipäinen haikara, valmistelee lammen suurta loikkakisaa, mutta laboratorion mittarit ovat sumussa ja sekaisin. Jokainen taito, jonka hallitset, kalibroi yhden laitteen, ja se syttyy loistamaan. Kun koko laboratorio loistaa, loikkakisa voidaan mitata reilusti.',
    quest: 'Kalibroi laboratorion laitteet, jotta loikkakisa voidaan mitata reilusti.',
    finale: 'Koko laboratorio loistaa! Loikkakisan voittaja voidaan nyt mitata metrin ja sekunnin tarkkuudella.',
    foundation: { name: 'Pohjatarkistus', story: 'Sulka tarkistaa ensin perusmittarit. Nämä ovat nopeita: kaksi oikein riittää.' },
  },
];
export const worldInfo = (w: World): WorldInfo => WORLDS.find((x) => x.id === w)!;

export const CHAPTERS: Chapter[] = [
  // ----------------------------------------------------------- Rantaretki (1–2)
  {
    id: 'loru', world: 'ranta', name: 'Laskuloru',
    story: 'Loikka opettelee laskemaan retkitavarat.',
    nodes: ['M-NUM-STABLE-ORDER', 'M-NUM-1TO1', 'M-NUM-01', 'M-NUM-02', 'M-NUM-WORD-NUMERAL', 'M-NUM-QTY-NUMERAL', 'M-NUM-QTY-WORD', 'M-NUM-03', 'M-NUM-06', 'M-NUM-10'],
  },
  {
    id: 'mitat', world: 'ranta', name: 'Mittaripaja',
    story: 'Aava rakentaa retkiviiriä. Mitataan ja verrataan.',
    nodes: ['M-TH-01', 'M-MEAS-00', 'M-MEAS-02', 'M-MEAS-01', 'M-NUM-14', 'M-TIME-01', 'M-TIME-03', 'M-MEAS-03', 'M-MEAS-04', 'M-TIME-02'],
  },
  {
    id: 'evaat', world: 'ranta', name: 'Eväsretki',
    story: 'Eväät jaetaan ja pakataan.',
    nodes: ['M-NUM-17', 'M-ADD-01', 'M-MUL-01', 'M-DIV-02', 'M-MULTREL-01', 'M-DIV-01'],
  },
  {
    id: 'kivet', world: 'ranta', name: 'Hyppykivet',
    story: 'Loikka hyppii numerokiviä pitkin lammen yli, eteen- ja taaksepäin.',
    nodes: ['M-NUM-07', 'M-NUM-08', 'M-NUM-EQUALSTEP-SEQ', 'M-NUM-MULTIPLE-INTRO', 'M-NUM-16'],
  },
  {
    id: 'merkit', world: 'ranta', name: 'Merkkipaja',
    story: 'Rantakivistä tehdään laskumerkkejä: plus, miinus ja yhtä suuri.',
    nodes: ['M-SYM-PLUS', 'M-SYM-MINUS', 'M-SYM-EQUAL', 'M-REP-04', 'M-ARITH-01', 'M-SUB-01'],
  },
  {
    id: 'simpukat', world: 'ranta', name: 'Simpukkaranta',
    story: 'Aava kerää simpukoita kahteen koriin. Montako on yhteensä, montako jää?',
    nodes: ['M-NUM-18', 'M-ADD-SUB-01', 'M-ADD-FACT-10', 'M-SUB-FACT-10', 'M-ADD-FACT-01', 'M-ADD-20', 'M-SUB-20'],
  },
  {
    id: 'kympit', world: 'ranta', name: 'Kymppilautta',
    story: 'Kaislat sidotaan kymmenen nipuiksi ja niistä rakennetaan lautta.',
    nodes: ['M-PLACE-01', 'M-PLACE-02', 'M-PLACE-03', 'M-MENTAL-01', 'M-ADD-100', 'M-SUB-100'],
  },
  {
    id: 'kertopaja', world: 'ranta', name: 'Kertopaja',
    story: 'Lautan hirret ladotaan riveihin: rivit ja sarakkeet kertovat, montako tarvitaan.',
    nodes: ['M-MULTAB-LOW', 'M-MUL-02', 'M-MULDIV-01', 'M-DIV-FACT-01'],
  },
  {
    id: 'kauppa', world: 'ranta', name: 'Rantakioski',
    story: 'Kioskilla punnitaan marjoja ja mitataan mehua.',
    nodes: ['M-MEAS-05', 'M-MEAS-06', 'M-MEAS-08', 'M-MEAS-09'],
  },
  {
    id: 'lajittelu', world: 'ranta', name: 'Lajittelulaituri',
    story: 'Laiturille on ajautunut kaikenlaista. Lajitellaan, järjestetään ja etsitään sääntöjä.',
    nodes: ['M-GEO-01', 'M-GEO-04', 'M-TH-02', 'M-TH-03', 'M-TH-04', 'M-WORK-01'],
  },
  {
    id: 'vihko', world: 'ranta', name: 'Havaintovihko',
    story: 'Aava tutkii rantaa ja kirjaa havainnot vihkoon. Ensin sovitaan turvasäännöt.',
    nodes: ['SCI-ENV-SAFE-01', 'SCI-ENV-OBSERVE-01', 'SCI-ENV-RECORD-DATA-01', 'SCI-ENV-PRESENT-DATA-01', 'SCI-ENV-RECORD-01', 'SCI-ENV-DATA-01', 'ENV-PHY-MOTION-OBS-01', 'ENV-PHY-MOTION-CHANGE-01', 'ENV-PHY-MOTION-01'],
  },
  // ----------------------------------------------------------- Aarresaaristo (3–6)
  {
    id: 'aarre', world: 'saari', name: 'Aarresaari',
    story: 'Vanha aarrekartta: ruudukko, jossa jokaisella paikalla on osoite. Kartan voi taittaa keskeltä.',
    nodes: ['M-GEO-02', 'M-COORD-READ-Q1', 'M-COORD-PLOT-Q1', 'M-COORD-01', 'M-SYM-01'],
  },
  {
    id: 'talvi', world: 'saari', name: 'Jäälahti',
    story: 'Lahti on jäätynyt. Pakkasasteet ja jään alla olevat luvut vievät nollan alapuolelle.',
    nodes: ['M-NEG-01', 'M-NEG-02', 'M-NEG-03', 'M-COORD-02'],
  },
  {
    id: 'veistamo', world: 'saari', name: 'Laivaveistämö',
    story: 'Veistämöllä lasketaan lankkuja ja nauloja allekkain, jotta laiva valmistuu.',
    nodes: ['M-PLACE-04', 'M-PLACE-05', 'M-WRADD', 'M-WRSUB', 'M-EXPR-01', 'M-GMEAS-01'],
  },
  {
    id: 'majakka', world: 'saari', name: 'Kertomajakka',
    story: 'Majakan valo vilkkuu kertotaulun tahtiin. Kun taulut ovat hallussa, valo kantaa kauas.',
    nodes: ['M-MULTAB-HIGH', 'M-MULTAB-ALL', 'M-WRMUL', 'M-WRDIV', 'M-DIVIS-01', 'M-TH-08'],
  },
  {
    id: 'helmet', world: 'saari', name: 'Helmisimpukka',
    story: 'Simpukoista löytyy helmiä, jotka punnitaan grammojen osien tarkkuudella.',
    nodes: ['M-DEC-01', 'M-DEC-02', 'M-DEC-03', 'M-DEC-READ', 'M-DEC-WRITE', 'M-DEC-DECOMPOSE', 'M-DEC-04', 'M-DEC-ADD', 'M-DEC-08', 'M-DEC-09'],
  },
  {
    id: 'tori', world: 'saari', name: 'Saaren tori',
    story: 'Torilla mitataan metreillä, kiloilla, litroilla ja minuuteilla.',
    nodes: ['M-UNIT-01', 'M-UNIT-02', 'M-UNIT-03', 'M-UNIT-04', 'M-UNIT-05'],
  },
  {
    id: 'piirakka', world: 'saari', name: 'Piirakkajuhla',
    story: 'Mustikkapiirakka jaetaan reilusti kaikille.',
    nodes: ['M-FRAC-01', 'M-FRAC-02', 'M-FRAC-03', 'M-FRAC-05', 'M-FRAC-11', 'M-FRAC-12', 'M-FRAC-06', 'M-FRAC-08', 'M-FRAC-15'],
  },
  {
    id: 'vaaka', world: 'saari', name: 'Vaakasaari',
    story: 'Saaren vanha vaaka kertoo, mitä piilossa olevassa pussissa on.',
    nodes: ['M-ALG-04', 'M-ALG-05', 'M-ALG-06', 'M-ALG-07', 'M-ALG-08'],
  },
  {
    id: 'asema', world: 'saari', name: 'Tutkimusasema',
    story: 'Saaren tutkimusasemalla mitataan, kerätään ja taulukoidaan.',
    nodes: ['SCI-ENV-TOOL-01', 'SCI-ENV-MEAS-01', 'M-DATA-01', 'M-DATA-02', 'M-DATA-03', 'M-DATA-05', 'M-DATA-04', 'M-DATA-09', 'M-DATA-10', 'M-TH-07'],
  },
  // ----------------------------------------------------------- Lampilaboratorio (7–9)
  {
    id: 'suureet', world: 'lab', name: 'Suureet ja yksiköt',
    story: 'Lampilaboratorio kalibroi mittalaitteensa.',
    nodes: ['PHY79-QTY-CONCEPT', 'PHY79-NUMVALUE', 'PHY79-UNIT-CONCEPT', 'PHY79-QTY-01', 'PHY79-UNIT-CONV', 'M79-UNIT-LIN'],
  },
  {
    id: 'nopeus', world: 'lab', name: 'Liike ja nopeus',
    story: 'Mitataan sammakkojen loikkakisa.',
    nodes: ['PHY79-MOTION-REF', 'PHY79-DIST-TIME', 'PHY79-SPEED-CONCEPT', 'PHY79-SPEED-CALC', 'PHY79-SPEED-UNIT', 'PHY79-SPEED-REARR', 'PHY79-SPEED-MIXED'],
  },
  {
    id: 'lauseke', world: 'lab', name: 'Kirjainpaja',
    story: 'Tutkija Sulka kirjoittaa muistiinpanot kirjaimilla. Kirjain on aina luku.',
    nodes: ['M79-VAR-UNKNOWN', 'M79-VAR-VARYING', 'M79-VAR-01', 'M79-EXPR-EVAL', 'M79-EXPR-FORM', 'M79-EQ1-FORM'],
  },
  {
    id: 'yhtalot', world: 'lab', name: 'Yhtälöt ja verrannot',
    story: 'Laboratorion vaaka ja reseptit: tasapaino, osat ja suhteet.',
    nodes: ['M79-FRAC-MUL', 'M79-RECIP-01', 'M79-FRAC-DIV', 'M79-DEC-DIV', 'M79-EQ1-SOLVE', 'M79-PROP-01'],
  },
  {
    id: 'funktiot', world: 'lab', name: 'Funktiot ja suorat',
    story: 'Mittari, joka antaa jokaiselle syötteelle yhden arvon.',
    nodes: ['M79-LOGIC-01', 'M79-DEP-01', 'M79-FUNC-01', 'M79-FUNC-TABLE', 'M79-FUNC-GRAPH', 'M79-LINE-GRAPH', 'M79-SLOPE'],
  },
  {
    id: 'kuvaajat', world: 'lab', name: 'Mittausdata ja kuvaajat',
    story: 'Kisan tulokset taulukkoon ja kuvaajaksi.',
    nodes: ['PHY79-DATA-01', 'PHY79-GRAPH-01', 'PHY79-ST-GRAPH', 'PHY79-VT-GRAPH'],
  },
  {
    id: 'luvut', world: 'lab', name: 'Pakkasloki',
    story: 'Talvinen lampi: lämpötilat ja muutokset miinuksen puolella.',
    nodes: ['M79-INT-ORDER', 'M79-INT-DIST', 'M79-INT-01', 'M79-INT-ADD', 'M79-INT-SUB', 'M79-INT-MUL', 'M79-INT-DIV'],
  },
  {
    id: 'kiihtyvyys', world: 'lab', name: 'Kiihtyvyys',
    story: 'Moottorivene lähtee liikkeelle. Kuinka nopeasti vauhti kasvaa?',
    nodes: ['PHY79-ACCEL-CONCEPT', 'PHY79-ACCEL-CALC', 'PHY79-ACCEL-MOTION-GRAPH', 'PHY79-ACCEL-VT-GRAPH', 'PHY79-ACCEL-GRAPH'],
  },
];

/** What finishing a chapter leaves behind on the map: a find that stays in the backpack. */
/** Lite 177 content revision and the lessons added to its chapters in Lite 181. A 177 save earned a
 *  chapter prize under the 177 membership; the first migration keeps it (review L181-08). */
export const REV_177 = 'lite177-2026-10-27';
export const ADDED_IN_181: Record<string, string[]> = {
  mitat: ['M-MEAS-04', 'M-TIME-02'],
  veistamo: ['M-GMEAS-01'],
  piirakka: ['M-FRAC-12'],
};
/** Was the chapter complete under its Lite 177 membership? */
export const done177 = (c: Chapter, known: (n: string) => boolean) => c.nodes.filter((n) => !ADDED_IN_181[c.id]?.includes(n)).every(known);

export const PRIZES: Record<string, { icon: string; name: string }> = {
  loru: { icon: '🎵', name: 'laskuloru-pilli' },
  mitat: { icon: '📏', name: 'oma mittanauha' },
  evaat: { icon: '🧺', name: 'eväskori' },
  kivet: { icon: '🪨', name: 'hyppykivipolku' },
  merkit: { icon: '🚩', name: 'merkkiviiri' },
  simpukat: { icon: '🐚', name: 'simpukkakaulakoru' },
  kympit: { icon: '🛶', name: 'kaislalautta' },
  kertopaja: { icon: '🪵', name: 'lautan hirsikansi' },
  kauppa: { icon: '🫐', name: 'marjarasia' },
  lajittelu: { icon: '🧩', name: 'lajittelulaatikko' },
  vihko: { icon: '📓', name: 'havaintovihko' },
  pohja: { icon: '🧭', name: 'kompassi' },
  aarre: { icon: '🗺️', name: 'aarrekartan pala' },
  talvi: { icon: '⛸️', name: 'luistimet' },
  veistamo: { icon: '⛵', name: 'pieni purjevene' },
  majakka: { icon: '💡', name: 'majakan valo' },
  helmet: { icon: '🫧', name: 'helmipussi' },
  tori: { icon: '⚖️', name: 'torivaaka' },
  piirakka: { icon: '🥧', name: 'mustikkapiirakka' },
  vaaka: { icon: '🎒', name: 'vaakasaaren pussi' },
  asema: { icon: '💎', name: 'tutkimusaseman aarre' },
  suureet: { icon: '🧪', name: 'kalibroitu mittalasi' },
  nopeus: { icon: '⏱️', name: 'kisakello' },
  lauseke: { icon: '✏️', name: 'Sulkan kynä' },
  yhtalot: { icon: '🔬', name: 'laboratorion vaaka' },
  funktiot: { icon: '📟', name: 'yhden arvon mittari' },
  kuvaajat: { icon: '📈', name: 'tulostaulu' },
  luvut: { icon: '🌡️', name: 'pakkasmittari' },
  kiihtyvyys: { icon: '🏆', name: 'loikkakisan pokaali' },
};

const RANK: Record<World, number> = { ranta: 0, saari: 1, lab: 2 };
const own = (w: World) => CHAPTERS.filter((c) => c.world === w);

/** Skills from earlier worlds that this world's places need directly: checked quickly,
 *  not taught at length. Their own background counts as known through inference. */
export function foundationOf(w: World): string[] {
  const mine = own(w).flatMap((c) => c.nodes);
  const earlier = new Set(CHAPTERS.filter((c) => RANK[c.world] < RANK[w]).flatMap((c) => c.nodes));
  return ORDER.filter((id) => earlier.has(id) && mine.some((m) => requiredOf(m).includes(id)));
}

const cache = new Map<World, Chapter[]>();
export function chaptersFor(world: World): Chapter[] {
  let out = cache.get(world);
  if (!out) {
    const f = worldInfo(world).foundation;
    out = f ? [{ id: 'pohja', world, name: f.name, story: f.story, nodes: foundationOf(world), quick: true }, ...own(world)] : own(world);
    cache.set(world, out);
  }
  return out;
}

export function chapterOf(node: string): Chapter {
  return CHAPTERS.find((c) => c.nodes.includes(node))!;
}

/** The chapter a node belongs to inside a world (lab foundation → 'pohja'). */
export function chapterIn(world: World, node: string): Chapter | undefined {
  return chaptersFor(world).find((c) => c.nodes.includes(node));
}

/** Can this place be practised now in this world? The foundation harbour is always
 *  open: it is a quick check of earlier skills, not something to unlock. */
export function openIn(world: World, id: string): boolean {
  return isUnlocked(id, store.known) || !!chapterIn(world, id)?.quick;
}

/** Nearest place on the path towards `id` that can be practised now. */
export function pathTowards(id: string): string | undefined {
  return ancestors(id).filter((a) => !store.known(a) && isUnlocked(a, store.known)).pop();
}

/** Nearest place to practise first when a topic feels hard: the closest required
 *  prerequisite that is not lit (checked or practised with help), walking back to one
 *  that is open now. Inferred is not the same as checked, so it can still be offered. */
/**
 * Optional help after two misses: one or two lessons that teach what the current family
 * actually uses (families.ts), not the first open ancestor. Lessons not yet lit come
 * first; a support lesson always opens directly, whatever its lock state. Without a
 * declaration the nearest required parents are offered, never a distant root.
 */
export function supportFor(id: string, tag?: string): string[] {
  const declared = tag ? family(id, tag).support : [];
  const near = [...requiredOf(id)].sort((a, b) => ORDER.indexOf(b) - ORDER.indexOf(a));
  const pool = [...new Set([...declared, ...(declared.length ? [] : near)])].filter((x) => x !== id && ORDER.includes(x));
  const fresh = pool.filter((x) => !store.lit(x));
  return (fresh.length ? fresh : pool).slice(0, 2);
}

/** What should the learner do next? Due recalls first, then the frontier. Places the
 *  learner put aside for later come last, but they are never lost. */
export function nextNode(world: World): { node: string; retrieval: boolean } | null {
  const ids = chaptersFor(world).flatMap((c) => c.nodes);
  const due = ids.find((id) => store.due(id) && !store.deferred(id));
  if (due) return { node: due, retrieval: true };
  // Chapter order is the story order; within the map it is already topological.
  const open = ids.filter((id) => !store.known(id) && openIn(world, id));
  const fresh = open.find((id) => !store.deferred(id));
  if (fresh) return { node: fresh, retrieval: false };
  const later = ids.find((id) => store.due(id)) ?? open[0];
  return later ? { node: later, retrieval: store.due(later) } : null;
}
