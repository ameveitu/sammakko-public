import type { PageText } from '../text';

/** LM16 Kartanlukijoiden saaristo: coordinates, scale and distances on a map. */
export const TEXT: Record<string, PageText> = {
  'M-SCALE-01': {
    beats: [
      {
        example: 'Kartalla saari on 4 cm pitkä. Oikeasti se on 32 m pitkä.',
        text: 'Pituuksia verrataan samassa yksikössä: 32 m = 3200 cm. Kartan 4 cm vastaa siis 3200 cm:ä luonnossa.',
        pic: 0, figure: false,
      },
      {
        text: 'Kun 4 cm vastaa 3200 cm:ä, 1 cm vastaa 800 cm:ä. Mittakaava on 1 : 800, eli kartalla kaikki on 800 kertaa pienempää.',
        more: 'Mittakaava kirjoitetaan järjestyksessä kartta : todellisuus. Molemmat pituudet ilmoitetaan samassa yksikössä.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Kartan mittakaava on 1 : 800, ja polku on kartalla 2 cm. Kuinka pitkä polku on luonnossa?',
      options: ['1600 cm', '800 cm', '802 cm'],
      answer: 0,
      explain: 'Jokainen kartan senttimetri on luonnossa 800 cm: 2 · 800 cm = 1600 cm eli 16 m.',
      why: [null, '800 cm on vain yhden kartan senttimetrin matka.', 'Kartan pituus kerrotaan 800:lla, siihen ei lisätä 800:aa.'],
    },
  },
  'M-COORD-READ-Q1': {
    beats: [
      {
        text: 'Paikka ruudukossa kerrotaan kahdella luvulla, koordinaateilla. Ensin x: montako askelta oikealle nollasta, sitten y: montako ylös.',
        pic: 0,
      },
      {
        text: 'Aarre on 4 askelta oikealle ja 2 ylös. Sen paikka kirjoitetaan (4, 2).',
        more: 'Järjestys on tärkeä: kohta (2, 4) on aivan eri paikka.',
        pic: 1,
      },
    ],
    try: 'auto',
  },
  'M-COORD-PLOT-Q1': {
    beats: [
      { text: 'Kohta (3, 5): lähde nollasta, kulje 3 askelta oikealle ja sitten 5 ylös. Piste merkitään siihen risteykseen.', pic: 0 },
      { text: 'Jos toinen luku on nolla, ylös ei noustakaan. Kohta (4, 0) on vaaka-akselilla.', pic: 1 },
      { text: 'Laivasta (1, 2) kuljetaan 3 askelta oikealle ja 2 ylös. Silloin päästään kohtaan (4, 4).', pic: 2 },
    ],
    try: {
      say: 'Mihin kohta (0, 3) merkitään?',
      options: ['Pystyakselille 3 ylös', 'Vaaka-akselille 3 oikealle', '3 oikealle ja 3 ylös'],
      answer: 0,
      explain: 'Ensimmäinen luku on 0, joten oikealle ei kuljeta ollenkaan. Sitten noustaan 3 ylös, ja piste on pystyakselilla.',
      why: [null, 'Se olisi kohta (3, 0). Ensimmäinen luku kertoo askeleet oikealle.', 'Luku 0 tarkoittaa, että oikealle ei kuljeta ollenkaan.'],
    },
  },
  'M-COORD-01': {
    beats: [
      {
        text: 'Saaren kulmat ovat (1, 1), (5, 1), (5, 4) ja (1, 4). Vaakareunalla vain x muuttuu, pystyreunalla vain y.',
        pic: 0,
      },
      {
        text: 'Kulmat (1, 1), (5, 1) ja (1, 5) ovat tiedossa. Neljäs saa x:n kulmasta (5, 1) ja y:n kulmasta (1, 5), joten se on (5, 5).',
        pic: 1,
      },
      {
        text: 'Palmut ovat kohdissa (1, 3) ja (5, 3). Kun kummastakin kuljetaan 2 askelta toisiaan kohti, tavataan puolivälissä kohdassa (3, 3).',
        pic: 2,
      },
    ],
    try: 'auto',
  },
  'M-SCALE-02': {
    beats: [
      { text: 'Sininen kuvio on 2 ruutua leveä. Kun se suurennetaan kertoimella 2, uusi kuvio on 2 · 2 = 4 ruutua leveä.', pic: 0 },
      {
        text: 'Kaikki pituudet kerrotaan samalla kertoimella: korkeuskin kasvaa 2 ruudusta 4 ruutuun. Siksi muoto säilyy ja vain koko muuttuu.',
        pic: 0,
      },
      { text: 'Pienennöksessä kerroin on pienempi kuin 1. Kertoimella 1/2 jokainen pituus puolittuu.', pic: null },
    ],
    try: 'auto',
  },
  'M-SCALE-03': {
    beats: [
      { text: 'Kartalla ranta ja majakka ovat 3 cm:n päässä toisistaan. Mittakaavan mukaan 1 cm kartalla on 50 m maastossa.', pic: 0 },
      { text: 'Jokainen kartan senttimetri on 50 m, joten matka maastossa on 3 · 50 m = 150 m.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-COORD-02': {
    beats: [
      { text: 'Nyt akselit jatkuvat myös vasemmalle ja alas. Kohta (−3, 2): miinusmerkki vie 3 askelta vasemmalle, sitten noustaan 2 ylös.', pic: 0 },
      {
        text: 'Akselit jakavat tason neljään neljännekseen. Ensimmäinen on oikealla ylhäällä, ja numerointi kiertää vastapäivään.',
        more: 'I: (+, +), II: (−, +), III: (−, −) ja IV: (+, −). Lukujen merkeistä näkee, missä neljänneksessä piste on.',
        pic: 1,
      },
      { text: 'Majakka on kohdassa (2, 3). Sen peilikuva y-akselin yli on (−2, 3): y pysyy samana, x vaihtaa merkkiä.', pic: 2 },
    ],
    try: 'auto',
  },
};
