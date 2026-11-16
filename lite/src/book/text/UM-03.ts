import type { PageText } from '../text';

/** UM-03 Nollalaiturin syvänne: integers on the number line, distance, the four operations, opposite numbers and absolute value. */
export const TEXT: Record<string, PageText> = {
  'M79-INT-ORDER': {
    beats: [
      { text: 'Lukusuoralla luvut kasvavat vasemmalta oikealle. Siksi luvut −3, 5, −8 ja 0 asettuvat järjestykseen −8 < −3 < 0 < 5.', pic: 0 },
      { text: 'Lämpömittari on pystyssä oleva lukusuora. Kuopiossa on −3 °C ja Oulussa −7 °C: Kuopion mittarin pinta on korkeammalla, joten −3 > −7.', more: 'Negatiivisista luvuista suurempi on se, joka on lähempänä nollaa. Siksi −3 > −7, vaikka 7 on suurempi kuin 3.', pic: 1 },
    ],
    try: 'auto',
  },
  'M79-INT-DIST': {
    beats: [
      { text: 'Lukujen −4 ja 3 välissä on nolla. Luvusta −4 on nollaan 4 askelta ja siitä lukuun 3 vielä 3, joten etäisyys on 4 + 3 = 7.', pic: 0 },
      { text: 'Kun luvut ovat nollan samalla puolella, nollan kautta ei kuljeta. Lukujen −9 ja −4 etäisyys on 9 − 4 = 5 askelta.', pic: 1 },
      { text: 'Luvun etäisyyttä nollasta sanotaan itseisarvoksi. Sekä −6 että 6 ovat kuuden askeleen päässä nollasta: |−6| = 6 ja |6| = 6.', more: 'Etäisyys ei ole koskaan negatiivinen. Siksi itseisarvo on aina positiivinen tai nolla.', pic: 2 },
    ],
    try: 'auto',
  },
  'M79-INT-01': {
    beats: [
      { text: 'Kohdasta −3 hypätään seitsemän askelta oikealle. Kolme askelta vie nollaan ja loput neljä lukuun 4.', pic: 0 },
      { text: 'Puoliväli on yhtä kaukana molemmista luvuista. Lukujen −7 ja 3 väli on 10 askelta, joten puolivälissä on −7 + 5 = −2.', more: 'Kaksi sammakkoa hyppää yhtä aikaa toisiaan kohti askel kerrallaan. Ne kohtaavat viiden hypyn jälkeen kohdassa −2.', pic: 1 },
      { example: 'Kumpi on lähempänä lukua −1: −5 vai 2?', text: 'Luvusta −1 lukuun −5 on 4 askelta, mutta lukuun 2 vain 3 askelta. Siksi 2 on lähempänä.', pic: null },
    ],
    try: 'auto',
  },
  'M79-INT-ADD': {
    beats: [
      { text: 'Positiivisen luvun lisääminen vie lukusuoralla oikealle. Laskussa −3 + 5 lähdetään kohdasta −3 ja hypätään viisi askelta oikealle lukuun 2.', pic: 0 },
      { text: 'Negatiivisen luvun lisääminen vie vasemmalle. Laskussa (−4) + (−3) hypätään kohdasta −4 kolme askelta vasemmalle, ja tulos on −7.', pic: 1 },
      { text: 'Napeilla −6 on kuusi miinusnappia ja 4 neljä plusnappia. Plus- ja miinusnappi kumoavat toisensa, joten jäljelle jää kaksi miinusnappia: −6 + 4 = −2.', more: 'Plus- ja miinusnapin pari on yhteensä nolla. Sitä sanotaan nollapariksi.', pic: 2 },
    ],
    try: 'auto',
  },
  'M79-INT-SUB': {
    beats: [
      { text: 'Lämpötila laskee −3 asteesta −10 asteeseen, eli seitsemän astetta. Muutos on loppu − alku: −10 − (−3) = −7.', pic: 0 },
      { text: 'Laskussa 5 − (−3) pitäisi ottaa pois kolme miinusnappia, mutta niitä ei ole. Lisätään kolme nollaparia ja otetaan miinukset pois, jolloin jää 8 plusnappia.', more: 'Siis 5 − (−3) = 5 + 3 = 8. Negatiivisen luvun vähentäminen on sama kuin sen vastaluvun lisääminen.', pic: 1 },
      { text: 'Laskussa −2 − (−5) lisätään kolme nollaparia, jotta miinusnappeja on viisi, ja otetaan ne pois. Jäljelle jää kolme plusnappia: −2 − (−5) = −2 + 5 = 3.', pic: 2 },
    ],
    try: 'auto',
  },
  'M79-INT-MUL': {
    beats: [
      { text: 'Lasku 3 · (−2) tarkoittaa kolmea kahden askeleen hyppyä vasemmalle. Nollasta päädytään lukuun −6, joten 3 · (−2) = −6.', pic: 0 },
      { text: 'Rivit 3 · 2 = 6, 3 · 1 = 3 ja 3 · 0 = 0 pienenevät joka kerta kolmella. Kaava jatkuu nollan ohi: 3 · (−1) = −3 ja 3 · (−2) = −6.', pic: 1 },
      { text: 'Luvulla −3 kerrottaessa tulo kasvaa joka rivillä kolmella: (−3) · 1 = −3, (−3) · 0 = 0 ja (−3) · (−1) = 3. Siksi negatiivinen kertaa negatiivinen on positiivinen.', more: 'Merkkisääntö: jos tekijöillä on sama etumerkki, tulo on positiivinen. Jos etumerkit ovat eri, tulo on negatiivinen.', pic: 2 },
    ],
    try: 'auto',
  },
  'M79-INT-DIV': {
    beats: [
      { text: 'Luku −12 jaetaan tasan kolmeen laatikkoon, ja jokaiseen tulee neljä miinusnappia. Siis (−12) : 3 = −4.', pic: 0 },
      { text: 'Lasku (−20) : (−4) kysyy, montako −4:n ryhmää luvusta −20 saadaan. Ryhmiä tulee viisi, joten (−20) : (−4) = 5.', pic: 1 },
      { text: 'Jakolaskun voi tarkistaa kertolaskulla: jakaja kertaa vastaus on jaettava. Siksi jakolaskussa on sama merkkisääntö kuin kertolaskussa.', pic: 2 },
    ],
    try: 'auto',
  },
  'M79-OPPOSITE-01': {
    beats: [
      { text: 'Luvun 4 vastaluku on −4. Ne ovat nollan eri puolilla, mutta yhtä kaukana nollasta: kumpikin on neljän askeleen päässä.', pic: 0 },
      { text: 'Vastalukujen summa on aina nolla: 4 + (−4) = 0.', more: 'Nollan vastaluku on nolla itse. Vastaluvun voi merkitä miinusmerkillä: luvun −4 vastaluku on −(−4) = 4.', pic: 0 },
    ],
    try: {
      say: 'Mikä on luvun −7 vastaluku?',
      options: ['7', '−7', '−1/7'],
      answer: 0,
      explain: 'Luvut −7 ja 7 ovat yhtä kaukana nollasta eri puolilla, ja −7 + 7 = 0.',
      why: [null, 'Tämä on luku itse. Vastaluku on nollan toisella puolella.', 'Tämä on käänteisluku, jonka kanssa tulo on 1. Vastaluvun kanssa summa on 0.'],
    },
  },
  'M79-ABS-01': {
    beats: [
      { text: 'Itseisarvo kertoo luvun etäisyyden nollasta. |4| = 4 ja |−4| = 4, koska kumpikin on neljän askeleen päässä nollasta.', pic: 0 },
      { text: 'Samalla etäisyydellä on kaksi paikkaa: etäisyydellä 4 ovat luvut 4 ja −4. Vain etäisyydellä 0 on yksi paikka, nolla itse.', pic: 0 },
    ],
    try: {
      say: 'Mitkä luvut ovat kuuden askeleen päässä nollasta?',
      options: ['6 ja −6', 'Vain 6', 'Vain −6'],
      answer: 0,
      explain: '|6| = 6 ja |−6| = 6. Itseisarvo kertoo etäisyyden nollasta, ei suuntaa.',
      why: [null, 'Myös −6 on kuuden askeleen päässä nollasta, nollan vasemmalla puolella.', 'Myös 6 on kuuden askeleen päässä nollasta, nollan oikealla puolella.'],
    },
  },
};
