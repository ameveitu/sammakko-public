import type { PageText } from '../text';

/** UM-14 Köysisillan mittausretki: the Pythagorean theorem and its converse, sine, cosine and tangent. */
export const TEXT: Record<string, PageText> = {
  'M79-TRIG-SIDE': {
    beats: [
      { text: 'Rannan merkin korkeutta XZ ei voi mitata suoraan. Kolmiossa on suora kulma pisteessä X, matka XY on 10 m ja pisteestä Y mitattu kulma 42°.', pic: 0 },
      { text: 'Kulman Y vastainen kateetti on XZ ja viereinen kateetti XY, joten tan(42°) = XZ / XY. Kerrotaan yhtälö luvulla XY: XZ = 10 m · tan(42°) ≈ 10 m · 0,90 = 9,0 m.', more: 'Tangentti on vastaisen ja viereisen kateetin suhde. Tangentin arvon saa laskimesta: tan(42°) ≈ 0,90.', pic: 0 },
    ],
    try: {
      say: 'Kulman 42° viereinen kateetti on 10 m. Millä laskulla saadaan vastainen kateetti x?',
      options: ['x = 10 · tan(42°)', 'x = 10 : tan(42°)', 'x = 10 · sin(42°)'],
      answer: 0,
      explain: 'Yhtälöstä tan(42°) = x / 10 saadaan x = 10 · tan(42°) ≈ 9,0 m.',
      why: [null, 'Näin laskettaisiin viereinen kateetti, jos vastainen olisi 10 m. Nyt tunnettu sivu on viereinen kateetti.', 'Sini on vastaisen kateetin ja hypotenuusan suhde. Tunnettu sivu on kateetti, ei hypotenuusa.'],
    },
  },
  'M79-TRIG-ANGLE': {
    beats: [
      { text: 'Havaintoputken kolmiossa suora kulma on pisteessä X. Hypotenuusa YZ on 26 m ja kulman Y viereinen kateetti XY on 24 m.', pic: 0 },
      { text: 'Viereisen kateetin ja hypotenuusan suhde on kosini: cos Y = 24/26 ≈ 0,923. Kulma saadaan laskimen käänteisfunktiolla: Y = cos⁻¹(24/26) ≈ 22,6°.', more: 'Laskimessa käänteisfunktion nimi on usein cos⁻¹ tai arccos. Laskimen pitää olla astetilassa (DEG).', pic: 0 },
    ],
    try: {
      say: 'Kulman A viereinen kateetti on 8 m ja hypotenuusa 10 m. Millä laskulla kulma A saadaan?',
      options: ['A = cos⁻¹(8/10)', 'A = cos(8/10)', 'A = tan⁻¹(8/10)'],
      answer: 0,
      explain: 'Viereisen kateetin ja hypotenuusan suhde on kosini. Kun suhde tunnetaan, kulma saadaan käänteisfunktiolla: cos⁻¹(8/10) ≈ 36,9°.',
      why: [null, 'Kosini laskee suhteen kulmasta. Kun kulma on tuntematon, tarvitaan käänteisfunktio cos⁻¹.', 'Tangentti on kateettien suhde, mutta 10 m on hypotenuusa.'],
    },
  },
  'M79-TRIG-CALC': {
    beats: [
      { text: 'Ensimmäisessä kolmiossa hypotenuusa YZ on 10 m ja kulma Y 42°. Kysytty XZ on kulman Y vastainen kateetti, joten käytetään siniä: XZ = 10 m · sin(42°) ≈ 6,7 m.', pic: 0 },
      { text: 'Toisessa kolmiossa tunnetaan kateetit AC = 10 m ja AB = 24 m. Kulman B vastainen ja viereinen kateetti antavat tangentin: B = tan⁻¹(10/24) ≈ 22,6°.', pic: 0 },
      { text: 'Ensin katsotaan, mitkä sivut tunnetaan tai kysytään kulmaan nähden. Vastainen ja hypotenuusa antavat sinin, viereinen ja hypotenuusa kosinin, kateetit tangentin.', more: 'Sivu ratkaistaan kertomalla tai jakamalla. Kulma ratkaistaan käänteisfunktiolla sin⁻¹, cos⁻¹ tai tan⁻¹.', pic: null },
    ],
    try: {
      say: 'Suorakulmaisen kolmion hypotenuusa on 20 m ja yksi kulma 30°. Kuinka pitkä on tämän kulman vastainen kateetti?',
      options: ['10 m', '40 m', 'noin 17,3 m'],
      answer: 0,
      explain: 'Vastainen kateetti = hypotenuusa · sin(30°) = 20 m · 0,5 = 10 m.',
      why: [null, 'Tässä jaettiin sinillä. Kateetti on lyhyempi kuin hypotenuusa, joten pitää kertoa.', 'Tämä on 20 m · cos(30°), eli kulman viereinen kateetti.'],
    },
  },
  'M79-SIN': {
    beats: [
      { text: 'Mittauskolmiossa suora kulma on pisteessä X. Kulmaa Y vastapäätä on kateetti XZ = 10 m, ja suoran kulman vastainen pisin sivu on hypotenuusa YZ = 26 m.', pic: 0 },
      { text: 'Kulman sini on vastaisen kateetin ja hypotenuusan suhde: sin Y = XZ / YZ = 10/26 ≈ 0,38.', more: 'Sini riippuu vain kulmasta, ei kolmion koosta. Kaksi kertaa suuremmassa yhdenmuotoisessa kolmiossa suhde on 20/52, eli edelleen noin 0,38.', pic: 0 },
    ],
    try: {
      say: 'Kolmion sivut ovat 5, 12 ja 13 cm, ja kulman vastainen kateetti on 5 cm. Mikä on kulman sini?',
      options: ['5/13', '12/13', '5/12'],
      answer: 0,
      explain: 'Hypotenuusa on pisin sivu 13 cm. Sini on vastainen kateetti jaettuna hypotenuusalla: 5/13.',
      why: [null, '12/13 on kosini: viereinen kateetti jaettuna hypotenuusalla.', '5/12 on tangentti: vastainen kateetti jaettuna viereisellä.'],
    },
  },
  'M79-COS': {
    beats: [
      { text: 'Kulman Y kyljillä ovat kateetti XY = 24 m ja hypotenuusa YZ = 26 m. Kateetti XY on kulman Y viereinen kateetti.', pic: 0 },
      { text: 'Kulman kosini on viereisen kateetin ja hypotenuusan suhde: cos Y = XY / YZ = 24/26 ≈ 0,92.', more: 'Kosini on aina alle 1, koska kateetti on hypotenuusaa lyhyempi. Mitä pienempi kulma, sitä lähempänä lukua 1 kosini on.', pic: 0 },
    ],
    try: {
      say: 'Kulman viereinen kateetti on 12 cm, vastainen kateetti 5 cm ja hypotenuusa 13 cm. Mikä on kulman kosini?',
      options: ['12/13', '5/13', '13/12'],
      answer: 0,
      explain: 'Kosini on viereinen kateetti jaettuna hypotenuusalla: 12/13.',
      why: [null, '5/13 on sini: siinä on vastainen kateetti.', 'Suhde on käännetty. Hypotenuusa tulee nimittäjään, joten kosini on alle 1.'],
    },
  },
  'M79-TAN': {
    beats: [
      { text: 'Kulman Y vastainen kateetti on XZ = 10 m ja viereinen kateetti XY = 24 m. Tangentissa käytetään vain kateetteja, ei hypotenuusaa.', pic: 0 },
      { text: 'Kulman tangentti on vastaisen ja viereisen kateetin suhde: tan Y = XZ / XY = 10/24 ≈ 0,42.', more: 'Tangentti kertoo kaltevuuden: kuinka monta metriä noustaan yhtä etenemisen metriä kohti. Toisin kuin sini ja kosini, tangentti voi olla myös yli 1.', pic: 0 },
    ],
    try: {
      say: 'Kulman vastainen kateetti on 5 cm, viereinen kateetti 12 cm ja hypotenuusa 13 cm. Mikä on kulman tangentti?',
      options: ['5/12', '12/5', '5/13'],
      answer: 0,
      explain: 'Tangentti on vastainen kateetti jaettuna viereisellä kateetilla: 5/12.',
      why: [null, 'Suhde on käännetty: tangentti on vastainen jaettuna viereisellä.', '5/13 on sini: siinä nimittäjänä on hypotenuusa.'],
    },
  },
  'M79-PYTH-01': {
    beats: [
      { text: 'Suorakulmaisen kolmion sivuille piirretään neliöt. Kateettien XZ ja XY neliöiden alat ovat yhteensä yhtä suuret kuin hypotenuusan YZ neliön ala.', pic: 0 },
      { text: 'Tämä on Pythagoraan lause: XZ² + XY² = YZ². Hypotenuusa on suoran kulman vastainen ja kolmion pisin sivu.', pic: null },
      { text: 'Vertailukolmiossa 10² + 24² = 676, mutta 25² = 625. Luvut eivät ole samat, joten kolmio ei ole suorakulmainen: se on teräväkulmainen.', more: 'Lause pätee vain suorakulmaisille kolmioille. Kun pisimmän sivun neliö on pienempi kuin muiden sivujen neliöiden summa, kolmion suurin kulma on terävä.', pic: 0 },
    ],
    try: {
      say: 'Suorakulmaisen kolmion kateetit ovat 6 cm ja 8 cm. Mikä yhtälö pätee hypotenuusaan c?',
      options: ['c² = 6² + 8²', 'c = 6 + 8', '8² = 6² + c²'],
      answer: 0,
      explain: 'Kateettien neliöiden summa on hypotenuusan neliö: c² = 36 + 64 = 100, joten c = 10 cm.',
      why: [null, 'Sivujen pituuksia ei lasketa suoraan yhteen. Yhteen lasketaan niiden neliöt.', 'Tässä 8 cm on hypotenuusan paikalla. Hypotenuusa c on pisin sivu, ja sen neliö on yhtälössä yksin.'],
    },
  },
  'M79-TRIG-01': {
    beats: [
      { text: 'Samasta kolmiosta saadaan kolme suhdetta kulmalle Y. Sivut ovat vastainen kateetti XZ = 10 m, viereinen kateetti XY = 24 m ja hypotenuusa YZ = 26 m.', pic: 0 },
      { text: 'Sini = vastainen / hypotenuusa, kosini = viereinen / hypotenuusa ja tangentti = vastainen / viereinen. Siksi sin Y = 10/26, cos Y = 24/26 ja tan Y = 10/24.', more: 'Vastainen ja viereinen kateetti määräytyvät aina tarkasteltavan kulman mukaan. Kulmalle Z ne vaihtavat paikkaa, joten esimerkiksi sin Z = 24/26.', pic: 0 },
    ],
    try: {
      say: 'Kulman B vastainen kateetti on 6 m, viereinen 8 m ja hypotenuusa 10 m. Mikä suhde on 6/10?',
      options: ['sin B', 'tan B', 'cos B'],
      answer: 0,
      explain: 'Sini on vastaisen kateetin ja hypotenuusan suhde: sin B = 6/10.',
      why: [null, 'Tangentissa nimittäjänä on viereinen kateetti: tan B = 6/8.', 'Kosinissa ovat viereinen kateetti ja hypotenuusa: cos B = 8/10.'],
    },
  },
  'M79-PYTH-CONVERSE': {
    beats: [
      { text: 'Tukikolmion sivut ovat XZ = 16 cm, XY = 30 cm ja YZ = 34 cm. Kulmaa ei mitata, vaan suorakulmaisuus päätellään sivuista.', pic: 0 },
      { text: 'Pisimmän sivun neliö on 34² = 1156, ja muiden sivujen neliöiden summa on 16² + 30² = 256 + 900 = 1156. Luvut ovat samat, joten kolmio on suorakulmainen ja suora kulma on pisteessä X.', pic: 0 },
      { text: 'Merkitään pisintä sivua c:llä ja muita a:lla ja b:llä. Jos a² + b² = c², kolmio on suorakulmainen; jos summa on suurempi, teräväkulmainen, ja jos pienempi, tylppäkulmainen.', pic: null },
    ],
    try: {
      say: 'Kolmion sivut ovat 5 cm, 6 cm ja 8 cm. Onko kolmio suorakulmainen?',
      options: ['Ei, koska 5² + 6² ≠ 8²', 'On, koska 5 + 6 > 8', 'On, koska 8 cm on pisin sivu'],
      answer: 0,
      explain: '5² + 6² = 25 + 36 = 61, mutta 8² = 64. Neliöt eivät täsmää, joten kolmio ei ole suorakulmainen: se on tylppäkulmainen.',
      why: [null, 'Tämä kertoo vain, että sivuista voi koota kolmion. Suoraa kulmaa tutkitaan neliöillä.', 'Jokaisessa kolmiossa on pisin sivu. Pitää vielä verrata neliöitä.'],
    },
  },
  'M79-PYTH-CALC': {
    beats: [
      { text: 'Kahden tasanteen välinen köysi MN on suorakulmaisen kolmion hypotenuusa. Kateetit ovat LN = 10 m ja LM = 24 m.', pic: 0 },
      { text: 'Pythagoraan lauseella MN² = 10² + 24² = 100 + 576 = 676. Köyden pituus on neliöjuuri: MN = √676 = 26 m.', pic: 0 },
      { text: 'Jos kysytty sivu on kateetti, hypotenuusan neliöstä vähennetään toisen kateetin neliö. Esimerkiksi √(26² − 24²) = √(676 − 576) = √100 = 10.', pic: null },
    ],
    try: {
      say: 'Suorakulmaisen kolmion hypotenuusa on 13 cm ja yksi kateetti 5 cm. Kuinka pitkä on toinen kateetti?',
      options: ['12 cm', '8 cm', 'noin 13,9 cm'],
      answer: 0,
      explain: 'Toinen kateetti on √(13² − 5²) = √(169 − 25) = √144 = 12 cm.',
      why: [null, 'Tässä pituudet vähennettiin suoraan: 13 − 5. Vähennä neliöt: 169 − 25.', 'Tässä neliöt laskettiin yhteen. Kateetti on hypotenuusaa lyhyempi, joten neliöt vähennetään.'],
    },
  },
};
