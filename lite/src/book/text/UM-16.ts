import type { PageText } from '../text';

/** UM-16 Leiripihan pinta-alapuutarha: perimeter of polygons, areas of triangles and quadrilaterals, length and area units. */
export const TEXT: Record<string, PageText> = {
  'M79-POLY-PERIM': {
    beats: [
      { text: 'Leiripihan reuna kulkee A–B–C–D–E–F–A. Sivut ovat 11, 6, ?, 2, 7 ja 8 cm, ja sivun C–D pituus puuttuu.', pic: 0 },
      { text: 'Vaakasivuista A–B = E–F + C–D, joten C–D = 11 − 7 = 4 cm. Pystysivut täsmäävät: 6 + 2 = 8.', pic: 0 },
      { text: 'Piiri on kaikkien sivujen summa: 11 + 6 + 4 + 2 + 7 + 8 = 38 cm. Sisäinen katkoviiva ei kuulu piiriin, koska se ei ole reunaa.', pic: 0 },
    ],
    try: {
      say: 'Pihan koko on 10 m × 6 m. Sen nurkasta rajataan pois 4 m × 3 m pala. Mikä on uuden pihan piiri?',
      options: ['32 m', '25 m', '48 m'],
      answer: 0,
      explain: 'Nurkan kohdalla kaksi sivua lyhenee 4 m ja 3 m, mutta tilalle tulee yhtä pitkät uudet sivut. Piiri pysyy 2 · (10 + 6) = 32 m.',
      why: [null, 'Leikatut 4 m ja 3 m eivät katoa reunasta, vaan siirtyvät nurkan sisäsivuiksi.', '48 on pinta-ala neliömetreinä: 60 − 12. Piiri on reunan pituus.'],
    },
  },
  'M79-TRI-AREA': {
    beats: [
      { text: 'Kolmion kanta AB on 7 cm. Korkeus on kohtisuora jana kärjestä C kannalle, ja se on 5 cm.', pic: 0 },
      { text: 'Kolmio on puolet suorakulmiosta, jonka sivut ovat kanta ja korkeus. Siksi A = k · h : 2 = 7 · 5 : 2 = 17,5 cm².', pic: 0 },
      { text: 'Korkeus mitataan aina suorassa kulmassa kantaan, ei vinoa sivua pitkin. Tylpässä kolmiossa korkeuden jalkapiste voi osua kannan jatkeelle.', pic: 0 },
    ],
    try: {
      say: 'Kolmion kanta on 6 cm, vino sivu 5 cm ja korkeus 4 cm. Mikä on kolmion pinta-ala?',
      options: ['12 cm²', '15 cm²', '24 cm²'],
      answer: 0,
      explain: 'Ala = kanta · korkeus : 2 = 6 · 4 : 2 = 12 cm². Vinoa sivua ei tarvita.',
      why: [null, '6 · 5 : 2 käyttää vinoa sivua. Korkeus on kohtisuora etäisyys kantaan.', '6 · 4 on suorakulmion ala. Kolmio on siitä puolet.'],
    },
  },
  'M79-QUAD-AREA': {
    beats: [
      { text: 'Puutarha ABCD on suorakulmio, jonka sivut ovat 9 cm ja 5 cm. Sen ala on 9 · 5 = 45 cm².', pic: 0 },
      { text: 'Lävistäjä AC jakaa sen kahdeksi yhtä suureksi kolmioksi ABC ja ACD. Kumpikin on 45 : 2 = 22,5 cm², ja yhdessä ne ovat 45 cm².', pic: 0 },
      { text: 'Suunnikkaan ala on kanta · korkeus, kun korkeus mitataan kohtisuoraan. Puolisuunnikkaan ala on (a + b) : 2 · h, missä a ja b ovat yhdensuuntaiset kannat.', more: 'Kun suunnikkaan vinosta päästä leikataan kolmio ja siirretään toiseen päähän, siitä tulee suorakulmio, jolla on sama kanta ja korkeus.', pic: 0 },
    ],
    try: {
      say: 'Suunnikkaan kanta on 8 cm, vino sivu 5 cm ja korkeus 4 cm. Mikä on suunnikkaan ala?',
      options: ['32 cm²', '40 cm²', '16 cm²'],
      answer: 0,
      explain: 'Suunnikkaan ala = kanta · korkeus = 8 · 4 = 32 cm². Vino sivu ei ole korkeus.',
      why: [null, '8 · 5 käyttää vinoa sivua. Korkeus mitataan kohtisuoraan kantaa vastaan.', '8 · 4 : 2 on kolmion ala. Suunnikas koostuu kahdesta tällaisesta kolmiosta.'],
    },
  },
  'M79-POLY-AREA': {
    beats: [
      { text: 'Leiripihan monikulmio ABCDE jaetaan janalla AC kahteen osaan: kolmioon ABC ja nelikulmioon ACDE.', pic: 0 },
      { text: 'Osat lasketaan erikseen: kolmion ABC ala on 44 cm² ja nelikulmion ACDE 66 cm². Koko pihan ala on 44 + 66 = 110 cm².', pic: 0 },
      { text: 'Jakotapoja on monta, mutta oikein jaettuna tulos on aina sama. Osat eivät saa mennä päällekkäin eivätkä jättää aukkoja.', more: 'Joskus on helpompaa laskea ympäröivän suorakulmion ala ja vähentää siitä puuttuvat palat.', pic: 0 },
    ],
    try: {
      say: 'Piha on 10 m × 6 m suorakulmio, jonka nurkasta puuttuu kolmio. Kolmion kateetit ovat 4 m ja 3 m. Mikä on pihan ala?',
      options: ['54 m²', '48 m²', '66 m²'],
      answer: 0,
      explain: 'Suorakulmion ala on 10 · 6 = 60 m², ja puuttuva kolmio on 4 · 3 : 2 = 6 m². Pihan ala on 60 − 6 = 54 m².',
      why: [null, '4 · 3 = 12 on suorakulmion ala. Kolmio on siitä puolet eli 6 m².', 'Puuttuva kolmio vähennetään, ei lisätä.'],
    },
  },
  'M79-UNIT-LIN': {
    beats: [
      { text: 'Pituusyksiköt ovat portaat km, hm, dam, m, dm, cm ja mm. Metristä senttimetriin on kaksi askelta alas, joten pilkku siirtyy kaksi paikkaa oikealle: 1,25 m = 125 cm.', pic: 0 },
      { text: 'Ylöspäin jaetaan. Millimetristä metriin on kolme askelta, joten pilkku siirtyy kolme paikkaa vasemmalle: 450 mm = 0,45 m.', pic: 1 },
      { text: 'Jos numeroita ei riitä, tyhjiin paikkoihin tulee nollia. Kilometristä metriin on kolme askelta alas: 2,3 km = 2300 m.', pic: 2 },
    ],
    try: 'auto',
  },
  'M79-UNIT-AREA': {
    beats: [
      { text: 'Kuvan neliö on 1 dm × 1 dm eli 1 dm². Sen sivu on 10 cm, joten sisään mahtuu 10 · 10 = 100 neliösenttimetriä.', pic: 0 },
      { text: 'Pinta-alassa kerroin tulee kahdesta suunnasta: 10 · 10 = 100. Siksi 1 dm² = 100 cm² ja 4,5 dm² = 450 cm².', pic: 0 },
      { text: 'Pinta-alayksiköiden portaissa jokainen askel kertoo sadalla eli siirtää pilkkua kaksi paikkaa. Esimerkiksi 1 m² = 100 dm² = 10 000 cm².', pic: 0 },
    ],
    try: {
      say: 'Paljonko on 3 m² neliösenttimetreinä?',
      options: ['30 000 cm²', '300 cm²', '3000 cm²'],
      answer: 0,
      explain: '1 m = 100 cm, joten 1 m² = 100 · 100 = 10 000 cm². Siksi 3 m² = 30 000 cm².',
      why: [null, 'Kerroin 100 kuuluu pituuksille. Pinta-alassa se kerrotaan kahdesti.', '1 m² sisältää 10 000 neliösenttimetriä, joten 3000 on liian vähän.'],
    },
  },
};
