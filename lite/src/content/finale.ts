export const FINALE_TITLE = 'Kun valo löytää uuden rannan';
export const STORY_SECONDS = 8 * 60 + 40;
export const FINALE_SECONDS = STORY_SECONDS + 28;

export type FinaleArt =
  | 'water' | 'spring' | 'summer' | 'autumn' | 'winter' | 'growth' | 'adult-bank'
  | 'hatch' | 'map' | 'tools' | 'keepsakes' | 'nest' | 'shelter' | 'choice'
  | 'feast' | 'wood-box' | 'bench' | 'toast' | 'cape' | 'luggage' | 'embrace'
  | 'departure' | 'launch' | 'islands' | 'cabin' | 'turn-home' | 'stars'
  | 'notebook' | 'recording' | 'evening-nest' | 'shell' | 'crack' | 'bill' | 'credits';

export interface FinaleShot {
  start: number;
  art: FinaleArt;
  description: string;
}
export interface FinaleCaption {
  start: number;
  end: number;
  text: string;
  speaker?: 'Aava' | 'Loikka' | 'Sulka' | 'Majava';
}
export interface FinaleChapter {
  id: string;
  title: string;
  start: number;
  end: number;
  shots: readonly FinaleShot[];
  captions: readonly FinaleCaption[];
}

const shot = (start: number, art: FinaleArt, description: string): FinaleShot => ({ start, art, description });
const line = (start: number, end: number, text: string, speaker?: FinaleCaption['speaker']): FinaleCaption => ({ start, end, text, speaker });

export const FINALE_CHAPTERS: readonly FinaleChapter[] = [
  {
    id: 'vuodet', title: 'Vuosien vesi', start: 0, end: 55,
    shots: [
      shot(0, 'water', 'Pimeästä avautuu lammen pinta. Yksi pisara tekee renkaan.'),
      shot(8, 'spring', 'Kevätvalo osuu tuttuun rantakiveen.'),
      shot(14, 'summer', 'Kesällä ruoko kasvaa kiven vieressä.'),
      shot(20, 'autumn', 'Syksyllä kiven varjo pitenee ja lehti putoaa.'),
      shot(26, 'winter', 'Talvella sama rantakivi pilkistää lumen alta.'),
      shot(32, 'growth', 'Laiturin mittaviivat lisääntyvät. Verstaassa ovenpielen kasvumerkit nousevat.'),
      shot(39, 'adult-bank', 'Aikuinen Aava asettaa sileän kiven tutulle paikalleen. Verstaasta kuuluu tuttu kilahdus.'),
      shot(47, 'hatch', 'Aikuinen Loikka kurkistaa raketin luukusta, poskella vaalea pölyjälki. Aava naurahtaa.'),
    ],
    captions: [
      line(33, 38, 'Vuodet kuluvat.'),
      line(43, 47, 'Tuo on kolmas kerta.', 'Aava'),
      line(48, 54, 'Neljäs. Kolmas oli harjoitus.', 'Loikka'),
    ],
  },
  {
    id: 'kartta', title: 'Kartta, jossa on tilaa', start: 55, end: 125,
    shots: [
      shot(55, 'map', 'Työpajan kartalla on tarkat rannat ja tyhjät reunat. Aava tuo taitetun arkin.'),
      shot(76, 'tools', 'Tähtikartta avautuu. Sulka tuo korjattuja työkaluja ja oman ensimmäisen mittansa.'),
      shot(109, 'keepsakes', 'Pöydällä ovat kivi, korjattu puukappale ja tyhjä vihko. Toinen kivi jää Aavalle.'),
    ],
    captions: [
      line(61, 68, 'Tämä ei taida mahtua vanhaan karttaan.', 'Loikka'),
      line(69, 76, 'Silloin karttaan tarvitaan lisää paperia.', 'Aava'),
      line(81, 88, 'Tämä oli joskus minun ensimmäinen mittani.', 'Sulka'),
      line(89, 98, 'Muista jättää muistiinpanoihin paikka sillekin, mitä et vielä tiedä.', 'Sulka'),
      line(99, 104, 'Siihen tarvitaan iso vihko.', 'Loikka'),
      line(105, 109, 'Ota kaksi.', 'Aava'),
      line(113, 117, 'Saanko?', 'Loikka'),
      line(118, 124, 'Saat. Toinen jää tänne.', 'Aava'),
    ],
  },
  {
    id: 'pesä', title: 'Aavan suunnitelma', start: 125, end: 190,
    shots: [
      shot(125, 'nest', 'Aava tunnustelee pesän reunaa ja siirtää yhden korren.'),
      shot(135, 'shelter', 'Loikka tuo tuulensuojan ja siirtää sitä Aavan näyttämään kohtaan.'),
      shot(151, 'choice', 'Aava katsoo ensin taivaalle, sitten pesälle. Ystävät jakavat saman hiljaisen tilan.'),
    ],
    captions: [
      line(140, 148, 'Oletko aivan varma, ettet halua tulla?', 'Loikka'),
      line(152, 157, 'Haluan vielä nähdä monta paikkaa.', 'Aava'),
      line(158, 164, 'Ja tämän haluan nähdä alusta asti.', 'Aava'),
      line(166, 170, 'Minua vähän pelottaa.', 'Loikka'),
      line(171, 174, 'Niin minuakin.', 'Aava'),
      line(175, 179, 'Lähteminen vai jääminen?', 'Loikka'),
      line(180, 183, 'Uusi.', 'Aava'),
      line(183, 190, 'Sinä saat lähteä. Minä saan jäädä. Me saamme silti olla me.', 'Aava'),
    ],
  },
  {
    id: 'pöytä', title: 'Yhteinen pöytä', start: 190, end: 255,
    shots: [
      shot(190, 'feast', 'Lähtöniemen juurella pitkä pöytä kerää ystävien tuomiset.'),
      shot(200, 'wood-box', 'Majavan taitettavan rasian puuliitos napsahtaa kohdalleen.'),
      shot(224, 'bench', 'Sisi torkahtaa penkillä oman lehtivarjonsa alla ja raottaa silmää naurun kohdalla. Hän saa levätä rauhassa.'),
      shot(233, 'toast', 'Taustalla näkyvät vene, taimi ja lyhty. Sulka nostaa mukinsa.'),
    ],
    captions: [
      line(201, 207, 'Tämä ei ole pato. Vaikka siinä onkin hyvä liitos.', 'Majava'),
      line(208, 215, 'Hyvä. Avaruusaluksen ovelle en ehkä tarvitse patoa.', 'Loikka'),
      line(217, 224, 'Ensin kannattaa kuitenkin katsoa, mistä virtaa.', 'Majava'),
      line(234, 239, 'Hyville kysymyksille.', 'Sulka'),
      line(240, 246, 'Ja sille, että joku kuuntelee vastauksen.', 'Aava'),
      line(247, 253, 'Myös silloin, kun vastaus muuttuu.', 'Loikka'),
    ],
  },
  {
    id: 'lähtöniemi', title: 'Ennen lähtöä', start: 255, end: 345,
    shots: [
      shot(255, 'cape', 'Lähtöniemen valot palavat tasaisesti. Aava ja Loikka seisovat turvallisella etäisyydellä raketista.'),
      shot(266, 'luggage', 'Loikka tarkistaa kiven vihkon vieressä ja avaa luukun vielä kerran.'),
      shot(292, 'cape', 'Aava tulee lähemmäs. Loikka katsoo häntä.'),
      shot(307, 'embrace', 'Ystävät halaavat. Aava asettaa siipensä uudelleen.'),
      shot(327, 'departure', 'Loikka nousee alukseen. Aava astuu taakse. Loikka vilkuttaa ikkunasta, Aava vastaa siivellään.'),
    ],
    captions: [
      line(269, 276, 'Jos löydän paikan, jota en osaa selittää?', 'Loikka'),
      line(277, 280, 'Piirrä.', 'Aava'),
      line(281, 286, 'Jos piirroskaan ei riitä?', 'Loikka'),
      line(287, 296, 'Aloita siitä, mikä on samanlaista. Sitten kerro, mikä on eri tavalla.', 'Aava'),
      line(297, 302, 'Entä jos minulle tulee ikävä?', 'Loikka'),
      line(303, 309, 'Silloin sinulla on täällä jotain tärkeää.', 'Aava'),
      line(317, 322, 'Nähdään vielä.', 'Loikka'),
      line(323, 329, 'Nähdään. Ja siihen asti kerrotaan.', 'Aava'),
    ],
  },
  {
    id: 'suunnat', title: 'Kaksi suuntaa', start: 345, end: 420,
    shots: [
      shot(345, 'launch', 'Alus nousee matalalla, lämpimällä äänellä. Ensin katsomme lähtöä Aavan rinnalta.'),
      shot(365, 'islands', 'Loikan ikkunasta näkyvät saariston metsät ja haarautuvat joet.'),
      shot(384, 'cabin', 'Loikka pitelee kiveä ja palauttaa sen turvalliseen lokeroon.'),
      shot(401, 'turn-home', 'Aava seuraa valopistettä, kääntyy sitten kohti rantaa ja omaa pesäänsä.'),
    ],
    captions: [
      line(410, 418, 'Aava kääntyy kohti rantaa.'),
    ],
  },
  {
    id: 'havainto', title: 'Uusi havainto', start: 420, end: 480,
    shots: [
      shot(420, 'stars', 'Myöhemmässä matkavaiheessa aluksen ikkunan takana on vieras tähtikenttä.'),
      shot(432, 'notebook', 'Loikka avaa vihkon ja piirtää ympyrän sekä kysymysmerkin.'),
      shot(447, 'recording', 'Loikka tallentaa viestin Aavalle. Hän tallettaa sen myöhempää lähettämistä varten.'),
      shot(466, 'evening-nest', 'Toisessa kuvassa Aava lämmittää munia. Rantakivi on pesän vieressä. Hän kuulee pienen äänen.'),
    ],
    captions: [
      line(422, 430, 'Paljon myöhemmin, tähtien keskellä.'),
      line(449, 457, 'Aava. Täällä on jotain, mitä en ole ennen nähnyt.', 'Loikka'),
      line(458, 465, 'Aloitan siitä, mikä on samanlaista.', 'Loikka'),
      line(474, 479, 'Hei.', 'Aava'),
    ],
  },
  {
    id: 'kuori', title: 'Kuori', start: 480, end: STORY_SECONDS,
    shots: [
      shot(480, 'shell', 'Aavan tuttu katse ja yksi muna ovat samassa lähikuvassa.'),
      shot(490, 'crack', 'Pieni napautus. Kuoreen ilmestyy hiuksenhieno särö. Aava siirtää siipeään pois valosta.'),
      shot(502, 'bill', 'Aukosta kurkistaa Aavan muotoinen pieni oranssi kuono. Poikasesta näkyy vain kuono. Aava hymyilee. Lammesta kuuluu sama pisara kuin alussa. Kuva häipyy lämpimään tummaan siniseen.'),
    ],
    captions: [],
  },
  {
    id: 'tekstit', title: 'Lopputekstit', start: STORY_SECONDS, end: FINALE_SECONDS,
    shots: [shot(STORY_SECONDS, 'credits', 'Kuoren kuva on häipynyt. Lopputekstit tulevat tummansiniselle taustalle.')],
    captions: [],
  },
];

export const FINALE_CREDITS = [
  { label: 'Käsikirjoitus', text: 'Kun valo löytää uuden rannan · Aavan matkassa' },
  { label: 'Hahmokuvitus', text: 'Sammakon alkuperäiset Aavan ja Loikan poseerauskuvat sekä Sulan Lite-kuvitus' },
  { label: '3D-hahmot ja maisemat', text: 'Sammakko Lite · paikalliset Blender-hahmot, Sisi ja Saariston näyttämöt' },
  { label: 'Musiikki ja tehosteet', text: 'Tätä tarinaa varten sävelletyt Aavan ja Loikan teemat sekä ohjelmoidut ympäristöäänet' },
];

export function finaleTime(seconds: number): number {
  return Number.isFinite(seconds) ? Math.max(0, Math.min(seconds, FINALE_SECONDS)) : 0;
}

export function finaleAt(seconds: number) {
  const time = finaleTime(seconds);
  const chapter = FINALE_CHAPTERS.find((part) => time >= part.start && time < part.end) ?? FINALE_CHAPTERS.at(-1)!;
  const following = chapter.shots.findIndex((frame) => time < frame.start);
  const index = following < 0 ? chapter.shots.length - 1 : following - 1;
  const current = chapter.shots[index]!;
  const end = chapter.shots[index + 1]?.start ?? chapter.end;
  const caption = chapter.captions.find((cue) => time >= cue.start && time < cue.end);
  return { time, chapter, shot: current, caption, progress: (time - current.start) / (end - current.start), ended: time >= FINALE_SECONDS };
}

export interface FinaleClock {
  position: number;
  /** Performance clock in milliseconds, or null when paused. */
  playingSince: number | null;
}

export function finaleElapsed(clock: FinaleClock, now: number): number {
  return finaleTime(clock.position + (clock.playingSince === null ? 0 : Math.max(0, now - clock.playingSince) / 1000));
}

export function pauseFinale(clock: FinaleClock, now: number): FinaleClock {
  return { position: finaleElapsed(clock, now), playingSince: null };
}

export function seekFinale(clock: FinaleClock, position: number, now: number): FinaleClock {
  const time = finaleTime(position);
  return { position: time, playingSince: clock.playingSince === null || time === FINALE_SECONDS ? null : now };
}


export const FINALE_SOUNDS = [
  { at: 2, cue: 'drop' },
  { at: 42, cue: 'tool' },
  { at: 51, cue: 'loikka' },
  { at: 183, cue: 'aava' },
  { at: 201, cue: 'tool' },
  { at: 347, cue: 'launch' },
  { at: 386, cue: 'loikka' },
  { at: 490, cue: 'shell' },
  { at: 510, cue: 'drop' },
  { at: 511, cue: 'together' },
  { at: STORY_SECONDS, cue: 'credits' },
] as const;
