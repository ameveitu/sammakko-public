import type { PageText } from '../text';

/** UM-05 Kivien salainen tähtitorni: divisibility, primes and prime factors, powers and the power rules. */
export const TEXT: Record<string, PageText> = {
  'M79-POWER-SIMPLIFY': {
    beats: [
      { text: 'Saman kannan potenssien säännöt tulevat tekijöiden laskemisesta. Tulossa eksponentit lasketaan yhteen, osamäärässä vähennetään ja potenssin potenssissa kerrotaan.', more: 'Esimerkiksi a² · a³ = a⁵, a⁵ : a³ = a² ja (a²)³ = a⁶.', pic: 0, figure: false },
      { text: 'Lauseke (a³)³ · a sievennetään vaihe kerrallaan. Ensin (a³)³ = a⁹, koska eksponentit kerrotaan, ja sitten a⁹ · a¹ = a¹⁰.', more: 'Pelkkä a tarkoittaa samaa kuin a¹. Koska lausekkeessa ei jaeta, kanta saa olla myös nolla.', pic: 1 },
    ],
    try: {
      say: 'Sievennä (a²)³ · a⁴.',
      options: ['a¹⁰', 'a⁹', 'a²⁴'],
      answer: 0,
      explain: 'Ensin (a²)³ = a⁶, koska eksponentit kerrotaan. Sitten a⁶ · a⁴ = a¹⁰, koska tulossa eksponentit lasketaan yhteen.',
      why: [null, 'Potenssin potenssissa eksponentit kerrotaan: (a²)³ = a⁶, ei a⁵.', 'Tulossa eksponentit lasketaan yhteen: a⁶ · a⁴ = a¹⁰, ei a²⁴.'],
    },
  },
  'M79-DIVIS-01': {
    beats: [
      { text: '16 kiveä asettuu tasan neljään riviin, joissa kussakin on neljä kiveä: 16 = 4 · 4 + 0. Yli ei jää mitään, joten 16 on jaollinen neljällä.', pic: 1 },
      { text: '18 kivestä tulee neljä täyttä neljän kiven riviä, ja kaksi jää yli: 18 = 4 · 4 + 2. Jakojäännös ei ole nolla, joten 18 ei ole jaollinen neljällä.', pic: 0, figure: false },
      { text: 'Yleisesti jaettava = jakaja · osamäärä + jakojäännös, ja jakojäännös on pienempi kuin jakaja. Luku on jaollinen, kun jakojäännös on nolla.', pic: 0, figure: false },
    ],
    try: {
      say: 'Mikä on jakojäännös, kun 23 jaetaan viidellä?',
      options: ['3', '4', '0'],
      answer: 0,
      explain: '23 = 5 · 4 + 3. Neljän täyden viisikon jälkeen yli jää 3.',
      why: [null, '4 on osamäärä eli täysien viisikkojen määrä. Jakojäännös on se, mikä jää yli.', 'Jakojäännös on nolla vain, jos jako menee tasan. 5 · 4 = 20, joten yli jää 3.'],
    },
  },
  'M79-POWER-01': {
    beats: [
      { text: 'Potenssissa 2³ luku 2 on kanta ja pieni yläindeksi 3 on eksponentti. Eksponentti kertoo, montako kertaa kanta on tekijänä: 2³ = 2 · 2 · 2 = 8.', pic: 0 },
      { text: 'Tässä kannan ja eksponentin vaihtaminen muuttaa arvoa. 3² = 3 · 3 = 9, mutta 2³ = 8.', pic: 0 },
    ],
    try: {
      say: 'Mikä on potenssin 4³ arvo?',
      options: ['64', '12', '81'],
      answer: 0,
      explain: 'Kanta 4 on tekijänä kolme kertaa: 4³ = 4 · 4 · 4 = 64.',
      why: [null, 'Tämä on 4 · 3. Eksponentti kertoo tekijöiden määrän, ei kerrointa.', 'Tämä on 3⁴ = 3 · 3 · 3 · 3. Tässä kanta on 4, ja se on tekijänä kolme kertaa.'],
    },
  },
  'M79-PRIME-01': {
    beats: [
      { text: 'Luvun 13 ainoat positiiviset jakajat ovat 1 ja 13. Luku, jolla on tasan kaksi positiivista jakajaa, on alkuluku.', pic: 0, figure: false },
      { text: 'Luvut 15 ja 18 eivät ole alkulukuja, koska 15 = 3 · 5 ja 18 = 2 · 9. Niitä sanotaan yhdistetyiksi luvuiksi.', pic: 1 },
      { text: 'Luvulla 1 on vain yksi positiivinen jakaja, se itse. Siksi 1 ei ole alkuluku eikä yhdistetty luku.', pic: 0, figure: false },
    ],
    try: {
      say: 'Mikä luvuista on alkuluku?',
      options: ['17', '21', '1', '27'],
      answer: 0,
      explain: 'Luku 17 jakautuu tasan vain luvuilla 1 ja 17, joten sillä on tasan kaksi positiivista jakajaa.',
      why: [null, '21 = 3 · 7, joten sillä on muitakin jakajia.', 'Luvulla 1 on vain yksi positiivinen jakaja, joten se ei ole alkuluku.', '27 = 3 · 9, joten se on yhdistetty luku.'],
    },
  },
  'M79-POWER-POS': {
    beats: [
      { text: 'Tornin jokainen lyhty haarautuu kolmeen uuteen lyhtyyn. Kolmen haarautumisen jälkeen lyhtyjä on 3 · 3 · 3 = 27.', pic: 0, figure: false },
      { text: 'Toistuvan kertolaskun voi kirjoittaa potenssina: 3 · 3 · 3 = 3³ = 27. Arvo on suurempi kuin 3² = 9, koska tekijöitä on yksi enemmän.', pic: 1 },
    ],
    try: {
      say: 'Mikä on 2⁵?',
      options: ['32', '10', '25'],
      answer: 0,
      explain: 'Kanta 2 on tekijänä viisi kertaa: 2 · 2 · 2 · 2 · 2 = 32.',
      why: [null, 'Tämä on 2 · 5. Eksponentti kertoo, montako kertaa kanta on tekijänä.', 'Tämä on 5² = 5 · 5. Tässä kanta on 2 ja eksponentti 5.'],
    },
  },
  'M79-POWER-ZERO': {
    beats: [
      { text: 'Kolmosen potensseissa 3² = 9 ja 3¹ = 3. Kun eksponentti pienenee yhdellä, arvo jaetaan kolmella.', pic: 0, figure: false },
      { text: 'Kaava jatkuu: 3⁰ = 3 : 3 = 1. Nollasta poikkeavan luvun nollas potenssi on aina 1.', more: 'Merkintä 0⁰ jää tämän säännön ulkopuolelle, koska nollalla ei voi jakaa.', pic: 1 },
    ],
    try: {
      say: 'Mikä on 7⁰?',
      options: ['1', '0', '7'],
      answer: 0,
      explain: 'Kaavassa 7² = 49 ja 7¹ = 7 arvo jaetaan joka askeleella seitsemällä. Siksi 7⁰ = 7 : 7 = 1.',
      why: [null, 'Nollas potenssi ei ole nolla: luku 7¹ = 7 jaetaan vielä seitsemällä, jolloin saadaan 1.', 'Tämä on 7¹. Kun eksponentti pienenee yhdellä, arvo jaetaan vielä seitsemällä.'],
    },
  },
  'M79-POWER-NEG': {
    beats: [
      { text: 'Kaava jatkuu nollan ohi: 3¹ = 3, 3⁰ = 1, 3⁻¹ = 1/3 ja 3⁻² = 1/9. Joka askeleella arvo jaetaan kolmella.', pic: 0, figure: false },
      { text: 'Negatiivinen eksponentti tarkoittaa käänteislukua: 3⁻² = 1/3² = 1/9. Tulos on pienempi kuin 1, koska kanta on suurempi kuin 1.', more: 'Sääntö a⁻ⁿ = 1/aⁿ pätee kaikille kannoille, jotka eivät ole nolla.', pic: 1 },
    ],
    try: {
      say: 'Mikä on 2⁻³?',
      options: ['1/8', '−8', '−6'],
      answer: 0,
      explain: 'Negatiivinen eksponentti tarkoittaa käänteislukua: 2⁻³ = 1/2³ = 1/8.',
      why: [null, 'Negatiivinen eksponentti ei tee arvosta negatiivista. Se tarkoittaa käänteislukua 1/2³.', 'Tämä on 2 · (−3). Potenssi ei ole kannan ja eksponentin kertolasku.'],
    },
  },
  'M79-POWER-PROD': {
    beats: [
      { text: 'Tulossa 3² · 3⁴ on ensin kaksi ja sitten neljä kolmosta tekijöinä. Kolmosia on yhteensä 2 + 4 = 6.', pic: 0, figure: false },
      { text: 'Saman kannan potenssien tulossa eksponentit lasketaan yhteen: 3² · 3⁴ = 3⁶. Kanta pysyy samana.', more: 'Eri kannoilla sääntö ei toimi: 2² · 3⁴ ei ole 6⁶.', pic: 1 },
    ],
    try: {
      say: 'Sievennä 5³ · 5⁴.',
      options: ['5⁷', '5¹²', '25⁷'],
      answer: 0,
      explain: 'Viitosia on tekijöinä 3 + 4 = 7, joten 5³ · 5⁴ = 5⁷.',
      why: [null, 'Eksponentit kerrottiin. Tulossa ne lasketaan yhteen.', 'Kanta pysyy samana. Kantoja ei kerrota keskenään.'],
    },
  },
  'M79-POWER-QUOT': {
    beats: [
      { text: 'Osamäärässä 3⁵ : 3³ jaettavassa on viisi kolmosta ja jakajassa kolme. Kolme paria supistuu pois, ja jäljelle jää kaksi kolmosta.', pic: 1 },
      { text: 'Saman kannan potenssien osamäärässä eksponentit vähennetään: 3⁵ : 3³ = 3², koska 5 − 3 = 2. Jaettavan eksponentista vähennetään jakajan eksponentti.', more: 'Kanta ei saa olla nolla, koska nollalla ei voi jakaa.', pic: 1 },
    ],
    try: {
      say: 'Sievennä 2⁸ : 2².',
      options: ['2⁶', '2⁴', '1⁶'],
      answer: 0,
      explain: 'Jaettavassa on kahdeksan kakkosta ja jakajassa kaksi. Kaksi paria supistuu, joten jää 2⁶.',
      why: [null, 'Eksponentit jaettiin. Osamäärässä ne vähennetään: 8 − 2 = 6.', 'Kanta pysyy samana, sitä ei jaeta.'],
    },
  },
  'M79-POWER-POWER': {
    beats: [
      { text: 'Potenssissa (3²)⁴ ryhmä 3² toistuu neljä kertaa: 3² · 3² · 3² · 3². Kolmosia on yhteensä 4 · 2 = 8.', pic: 1 },
      { text: 'Potenssin potenssissa eksponentit kerrotaan: (3²)⁴ = 3⁸. Tulossa 3² · 3⁴ taas eksponentit lasketaan yhteen, ja tulos on 3⁶.', pic: 1 },
    ],
    try: {
      say: 'Sievennä (5³)².',
      options: ['5⁶', '5⁵', '5⁹'],
      answer: 0,
      explain: '(5³)² = 5³ · 5³, joten viitosia on 2 · 3 = 6. Tulos on 5⁶.',
      why: [null, 'Eksponentit laskettiin yhteen. Potenssin potenssissa ne kerrotaan.', 'Tämä olisi (5³)³. Tässä ryhmä 5³ toistuu vain kaksi kertaa.'],
    },
  },
  'M79-PRIMEFACT-01': {
    beats: [
      { text: 'Tekijäpuussa 36 = 2 · 18, 18 = 2 · 9 ja 9 = 3 · 3. Haarautuminen loppuu, kun jokainen lehti on alkuluku.', pic: 1 },
      { text: 'Lehdistä saadaan alkutekijähajotelma 36 = 2 · 2 · 3 · 3. Tarkistuksessa lehtien tulo on taas 36.', more: 'Puun voi aloittaa myös toisella parilla, kuten 36 = 6 · 6. Lopussa saadaan aina samat alkutekijät: 36 = 2² · 3².', pic: 1 },
    ],
    try: {
      say: 'Mikä on luvun 12 alkutekijähajotelma?',
      options: ['2 · 2 · 3', '2 · 6', '3 · 4'],
      answer: 0,
      explain: '12 = 2 · 6 ja 6 = 2 · 3, joten 12 = 2 · 2 · 3. Kaikki tekijät ovat alkulukuja.',
      why: [null, '6 ei ole alkuluku, koska 6 = 2 · 3.', '4 ei ole alkuluku, koska 4 = 2 · 2.'],
    },
  },
};
