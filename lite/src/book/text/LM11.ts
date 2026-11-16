import type { PageText } from '../text';

/** LM11 Tuntemattoman työpaja: sequence rules, the unknown, the equals sign and the first equations. */
export const TEXT: Record<string, PageText> = {
  'M-ALG-01': {
    beats: [
      { text: 'Jono alkaa 5, 10, 15, 20. Ensimmäisessä välissä lisätään viisi, ja niin myös kahdessa seuraavassa.', more: 'Yksi sopiva väli ei vielä riitä. Sääntö tarkistetaan jokaisesta näkyvästä välistä.', pic: 0, figure: false },
      { text: 'Sääntö ”lisää aina 5” sopii jokaiseen väliin. Sillä jono jatkuu: 25, 30.', pic: 1 },
    ],
    try: {
      say: 'Jono on 1, 2, 4, 8. Mikä sääntö sopii jokaiseen väliin?',
      options: ['Tuplaa luku joka kerta', 'Lisää aina 1', 'Lisää aina 2'],
      answer: 0,
      explain: '1 → 2 → 4 → 8: joka välissä luku tuplataan. Seuraava luku on siis 16.',
      why: [null, 'Sopii vain ensimmäiseen väliin: 2 + 1 on 3, ei 4.', 'Sopii vain väliin 2 → 4: 4 + 2 on 6, ei 8.'],
    },
  },
  'M-ALG-04': {
    beats: [
      { text: 'Loikan pussi on kiinni, eikä sisältöä näe. Merkkien määrää ei vielä tiedetä, joten sitä merkitään ruudulla □.', more: 'Ruutu on tuntematon: luku, jota ei vielä tiedetä. Se voi olla mikä tahansa luku, myös nolla.', pic: 0, figure: false },
      { text: 'Peitetyssä kortissa □ on koko luku. Kun kortti käännetään, näkyy 12: luku oli 12 jo ennen kuin se näkyi.', more: 'Ruutu voi tarkoittaa kaksinumeroista lukua, ei vain yhtä numeroa.', pic: 1, figure: false },
      { text: 'Kun samaan pussiin katsotaan uudelleen, mitään ei ole lisätty eikä otettu. Siksi sama ruutu tarkoittaa molemmilla kerroilla samaa lukua.', pic: 2, figure: false },
    ],
    try: {
      say: 'Loikan suljetussa pussissa on □ merkkiä. Hän avaa pussin, ja se on tyhjä. Mikä luku □ oli?',
      options: ['0', 'Ei mikään luku', '1'],
      answer: 0,
      explain: 'Ruutu tarkoittaa lukua, jota ei vielä tiedetä. Se voi olla mikä tahansa luku, myös 0.',
      why: [null, 'Ruutu ei ole tyhjä paikka vaan luku, jota ei vielä nähty. Tässä luku oli 0.', 'Pussissa ei ollut yhtään merkkiä, joten luku oli 0.'],
    },
  },
  'M-ALG-02': {
    beats: [
      { text: 'Jono on 3, 7, 11, 15. Kerro sääntö niin, että toinen osaa jatkaa: mitä edelliselle luvulle tehdään?', pic: 0, figure: false },
      { text: 'Lisää aina 4. Luvusta 3 tulee 7, ja sama askel vie luvusta 7 lukuun 11.', more: 'Hyvä sääntö toimii jokaisessa välissä. Sillä jono jatkuu: 15 + 4 = 19.', pic: 1, figure: false },
    ],
    try: {
      say: 'Jono on 4, 7, 10, 13. Mikä sääntö kertoo, miten jono jatkuu?',
      options: ['Lisää aina 3', 'Lisää aina 4', 'Luvut kasvavat'],
      answer: 0,
      explain: '4 + 3 = 7, 7 + 3 = 10 ja 10 + 3 = 13. Seuraava luku on 16.',
      why: [null, '4 + 4 on 8, ei 7.', 'Totta, mutta siitä ei tiedä, paljonko seuraava luku kasvaa.'],
    },
  },
  'M-ALG-03': {
    beats: [
      { text: 'Ohje sanoo: lisää aina 3. Jono alkaa 5, 8, 11.', pic: 0, figure: false },
      { text: 'Seuraava luku lasketaan aina edellisestä: 11 + 3 = 14, 14 + 3 = 17 ja 17 + 3 = 20.', more: 'Älä palaa jonon alkuun. Jokainen uusi luku on seuraavan lähtökohta.', pic: 1 },
    ],
    try: {
      say: 'Ohje on: lisää aina 4. Jono alkaa 2, 6, 10, 14. Mikä luku tulee seuraavaksi?',
      options: ['18', '6', '15'],
      answer: 0,
      explain: 'Lasketaan viimeisestä luvusta: 14 + 4 = 18.',
      why: [null, '6 tulee, jos aloitetaan alusta: 2 + 4. Lasketaan viimeisestä luvusta.', '14 + 1 on 15. Askel on 4, ei 1.'],
    },
  },
  'M-ALG-05': {
    beats: [
      { text: 'Vasemmalla on 8 ja 4 eli 12. Oikealla on laatikko ja 5: laatikkoon tarvitaan 7, jotta oikeallakin on 12.', more: 'Moni kirjoittaa laatikkoon 12, mutta silloin oikealla on 12 + 5 = 17 ja vaaka kallistuu.', pic: 0 },
      { text: 'Toinen vaaka: 6 + 3 = 9. Oikealla on jo 4, joten laatikkoon tarvitaan 5.', pic: 1 },
      { text: 'Merkki = ei tarkoita, että vastaus tulee perään. Se kertoo, että molemmat puolet ovat yhtä suuret: 6 + 3 = 5 + 4.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-ALG-06': {
    beats: [
      { text: 'Vaa’assa on kaksi samanlaista pussia ja 3 kilon paino, toisella puolella 11 kiloa. Jokainen pussi on x, joten vaaka kirjoitetaan x + x + 3 = 11.', more: 'Kokeillaan x = 4: 4 + 4 + 3 = 11. Vaaka on suorassa, joten x = 4 on ratkaisu.', pic: 0 },
      { text: 'Yksi pussi ja 4 kiloa painavat 9 kiloa: x + 4 = 9. Siinä on =-merkki ja tuntematon x, joten se on yhtälö.', more: 'Ratkaisu on x = 5, koska 5 + 4 = 9.', pic: 1 },
      { text: 'Pelkkä x + 4 ei ole yhtälö, koska siitä puuttuvat =-merkki ja toinen puoli. Lause 5 + 4 = 9 on tosi, mutta siinä ei ole tuntematonta.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-ALG-07': {
    beats: [
      { text: 'Pussi ja 3 kiloa painavat yhtä paljon kuin 8 kiloa: x + 3 = 8. Kokeillaan 2: 2 + 3 = 5 on liian kevyt, joten kokeillaan isompaa.', more: '7 + 3 = 10 on liian painava. 5 + 3 = 8: vaaka on suorassa, joten x = 5.', pic: 0 },
      { text: 'Toinen pussi: x + 6 = 14. 4 + 6 = 10 on liian vähän, 9 + 6 = 15 liikaa, ja 8 + 6 = 14 on juuri oikein.', pic: 1 },
      { text: 'Kokeilu tarkistetaan sijoittamalla: luku laitetaan x:n paikalle. Jos puolet ovat yhtä suuret, luku on ratkaisu.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-ALG-08': {
    beats: [
      { text: 'Tuntematon luku menee koneeseen + 7, ja ulos tulee 15: □ + 7 = 15. Käännetään kone: miinus kumoaa plussan, ja 15 − 7 = 8.', more: 'Tarkistus: 8 + 7 = 15.', pic: 0 },
      { text: 'Toinen kone: □ × 4 = 28. Kertomisen kumoaa jakaminen: 28 : 4 = 7.', more: 'Tarkistus: 7 × 4 = 28. Päättelemällä ratkaisu löytyy ilman arvaamista.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-ALG-09': {
    beats: [
      { text: 'Yhtälö on x + 4 = 10. Kokeillaan x = 4: vasen puoli on 4 + 4 = 8, mikä on liian pieni.', pic: 0, figure: false },
      { text: 'Tulos jäi alle 10, joten seuraavaksi kokeillaan isompaa lukua. Jos tulos menee yli, kokeillaan pienempää.', pic: 0, figure: false },
      { text: 'Kokeillaan x = 6: 6 + 4 = 10, yhtä suuri kuin oikea puoli. Ratkaisu on x = 6.', pic: 1, figure: false },
    ],
    try: {
      say: 'Yhtälö on x + 7 = 12. Kokeilu x = 3 antaa 3 + 7 = 10. Mitä kokeillaan seuraavaksi?',
      options: ['Isompaa lukua', 'Pienempää lukua', 'Samaa lukua uudelleen'],
      answer: 0,
      explain: '10 jäi alle 12, joten x:n pitää olla isompi. Kokeillaan x = 5: 5 + 7 = 12.',
      why: [null, 'Pienempi luku antaisi vielä pienemmän tuloksen kuin 10.', 'Sama luku antaa saman tuloksen 10.'],
    },
  },
};
