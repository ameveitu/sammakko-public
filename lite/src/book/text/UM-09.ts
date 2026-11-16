import type { PageText } from '../text';

/** UM-09 Tasapainon sulku: forming, solving and checking equations, inequalities and incomplete quadratic equations. */
export const TEXT: Record<string, PageText> = {
  'M79-QUAD-INCOMP-01': {
    beats: [
      {
        text: 'Toisen asteen yhtälö kirjoitetaan ensin nollamuotoon ax² + bx + c = 0. Yhtälö on vaillinainen, jos x²-termi säilyy mutta x-termi tai vakio puuttuu.',
        more: 'Esimerkiksi 3x² = 0, x² − 9 = 0 ja x² + 5x = 0 ovat vaillinaisia. Yhtälö x² + 5x − 6 = 0 on täydellinen, koska siinä ovat kaikki termit.',
        pic: 0,
      },
      { text: 'Yhtälössä A, 2x² − 3 = 0, x²-termi säilyy ja x-termi puuttuu. Se on vaillinainen toisen asteen yhtälö.', pic: 0 },
      {
        text: 'Yhtälössä B, x² + 2x + 4 = x² + 4, termit x² ja 4 kumoutuvat. Jäljelle jää 2x = 0, joka on ensimmäisen asteen yhtälö.',
        pic: 0,
      },
    ],
    try: {
      say: 'Mikä yhtälöistä on vaillinainen toisen asteen yhtälö?',
      options: ['x² − 9 = 0', 'x² + 2x − 3 = 0', 'x² + 3x = x² + 6'],
      answer: 0,
      explain: 'Yhtälössä x² − 9 = 0 x²-termi säilyy ja x-termi puuttuu. Siksi se on vaillinainen toisen asteen yhtälö.',
      why: [null, 'Siinä ovat kaikki termit, joten se on täydellinen toisen asteen yhtälö.', 'x²-termit kumoutuvat, ja jäljelle jää ensimmäisen asteen yhtälö 3x = 6.'],
    },
  },
  'M79-INEQ-01': {
    beats: [
      {
        example: 'Sillan kuorma m saa olla enintään 4 kg: m ≤ 4. Mitkä massat ovat sallittuja?',
        text: 'Sallittuja ovat kaikki massat nollasta neljään kilogrammaan, myös esimerkiksi 2,5 kg. Ratkaisujoukko on 0 ≤ m ≤ 4.',
        pic: 0,
      },
      {
        text: 'Merkki ≤ ottaa rajan mukaan, joten 4 kg kelpaa ja lukusuoralla 4 on umpinainen piste. Negatiivista massaa ei ole, joten alue alkaa nollasta.',
        pic: 0,
      },
      {
        text: 'Epäyhtälössä x > 4 merkki on tiukka, joten 4 ei kuulu joukkoon, ja raja merkitään avoimella pisteellä. Kaikki neljää suuremmat reaaliluvut kuuluvat.',
        pic: 1,
      },
    ],
    try: {
      say: 'Mikä luku kuuluu epäyhtälön x > 4 ratkaisujoukkoon?',
      options: ['4,1', '4', '3,9'],
      answer: 0,
      explain: 'Ratkaisujoukkoon kuuluvat kaikki luvut, jotka ovat suurempia kuin 4. Luku 4,1 on suurempi kuin 4.',
      why: [null, 'Merkki > on tiukka, joten raja 4 ei kuulu joukkoon.', '3,9 on pienempi kuin 4.'],
    },
  },
  'M79-INEQ-SOLVE': {
    beats: [
      {
        example: 'Ratkaise −2x + 1 < 5.',
        text: 'Epäyhtälö ratkaistaan kuten yhtälö: vähennetään ensin 1 molemmilta puolilta, jolloin −2x < 4.',
        pic: 0,
      },
      {
        text: 'Kun jaetaan negatiivisella luvulla −2, epäyhtälön suunta kääntyy: x > −2. Kokeile: x = 0 antaa 1 < 5, joten 0 kuuluu joukkoon.',
        more: 'Ilman kääntämistä saisi x < −2. Mutta esimerkiksi x = −3 antaa −2 · (−3) + 1 = 7, joka ei ole pienempi kuin 5.',
        pic: 0,
      },
      { text: 'Epäyhtälössä −2x + 1 ≤ 5 myös raja kuuluu mukaan: x ≥ −2. Suunta kääntyy samalla tavalla.', pic: 1 },
    ],
    try: {
      say: 'Ratkaise −3x < 12.',
      options: ['x > −4', 'x < −4', 'x > 4'],
      answer: 0,
      explain: 'Jaetaan luvulla −3. Negatiivisella luvulla jakaminen kääntää suunnan, joten x > −4.',
      why: [null, 'Negatiivisella luvulla jaettaessa merkin suunta kääntyy.', '12 : (−3) = −4, ei 4.'],
    },
  },
  'M79-EQ1-FORM': {
    beats: [
      {
        text: 'Kolme samanhintaista koeputkea ja 4 €:n teline maksavat yhteensä 19 €. Kun koeputken hinta on x euroa, yhtälö on 3x + 4 = 19.',
        more: 'Yhtälössä yhtäsuuruusmerkin eri puolille kirjoitetaan kaksi yhtä suurta asiaa. Tuntematon määrä merkitään kirjaimella.',
        pic: 0,
      },
      {
        text: 'Vaa’assa on toisella puolella kolme samanlaista pussia ja 2 kg, toisella 11 kg. Kun pussin massa on x kg, yhtälö on 3x + 2 = 11.',
        pic: 1,
      },
    ],
    try: 'auto',
  },
  'M79-EQ1-SOLVE': {
    beats: [
      {
        example: 'Ratkaise 3x + 2 = 14.',
        text: 'Otetaan molemmilta puolilta pois 2 kg: 3x = 12. Sitten molemmat puolet jaetaan kolmeen yhtä suureen osaan: x = 4.',
        pic: 0,
      },
      {
        text: 'Yhtälössä 5x + 1 = 2x + 10 pusseja on molemmilla puolilla. Otetaan ensin 2 pussia pois: 3x + 1 = 10, sitten 1 kg: 3x = 9, ja lopuksi x = 3.',
        pic: 1,
      },
      {
        text: 'Yhtälössä 3x − 2 = 10 lisätään 2 molemmille puolille: 3x = 12. Jaetaan kolmella: x = 4.',
        more: 'Tasapaino säilyy, kun molemmille puolille tehdään sama muutos. Tarkistus: 3 · 4 − 2 = 10.',
        pic: 2,
      },
    ],
    try: 'auto',
  },
  'M79-EQ1-CHECK': {
    beats: [
      {
        example: 'Toteuttaako x = 3 yhtälön 3x − 2 = x + 4?',
        text: 'Vasen puoli on 3 · 3 − 2 = 7 ja oikea puoli 3 + 4 = 7. Puolet ovat yhtä suuret, joten x = 3 on ratkaisu.',
        pic: 0,
      },
      {
        text: 'Kokeillaan x = 2: vasen puoli on 3 · 2 − 2 = 4 ja oikea 2 + 4 = 6. Koska 4 ≠ 6, x = 2 ei ole ratkaisu.',
        more: 'Ehdokas sijoitetaan aina alkuperäiseen yhtälöön. Näin löytyy myös ratkaisuvaiheissa tehty virhe.',
        pic: 1,
      },
    ],
    try: {
      say: 'Toteuttaako x = 5 yhtälön 2x + 1 = x + 6?',
      options: ['Toteuttaa: molemmat puolet ovat 11', 'Ei toteuta: vasen puoli on 26', 'Ei toteuta: oikea puoli on 6'],
      answer: 0,
      explain: 'Vasen puoli on 2 · 5 + 1 = 11 ja oikea puoli 5 + 6 = 11. Puolet ovat yhtä suuret, joten x = 5 on ratkaisu.',
      why: [null, '2x tarkoittaa 2 · 5 = 10, ei lukua 25. Vasen puoli on 10 + 1 = 11.', 'Myös oikealle sijoitetaan x = 5: 5 + 6 = 11.'],
    },
  },
  'M79-QUAD-INCOMP-02': {
    beats: [
      {
        example: 'Ratkaise x² = 8.',
        text: 'Sekä √8:n että −√8:n neliö on 8, joten yhtälöllä on kaksi ratkaisua: x = √8 tai x = −√8. Neliöjuuren pääarvo on vain √8.',
        more: '√8 ≈ 2,83, joten ratkaisut ovat lukusuoralla yhtä kaukana nollasta, sen eri puolilla.',
        pic: 0,
      },
      { text: 'Yhtälöllä x² = 0 on vain yksi ratkaisu, x = 0, koska vain nollan neliö on nolla.', pic: 1 },
      {
        text: 'Yhtälöllä x² = −4 ei ole reaalista ratkaisua, koska reaaliluvun neliö ei ole koskaan negatiivinen. Ratkaisujoukko on tyhjä: ∅.',
        pic: 2,
      },
    ],
    try: {
      say: 'Mitkä luvut ratkaisevat yhtälön x² = 25?',
      options: ['5 ja −5', 'Vain 5', '12,5'],
      answer: 0,
      explain: '5² = 25 ja (−5)² = 25, joten yhtälöllä on kaksi ratkaisua. Pääarvo √25 = 5 on niistä vain toinen.',
      why: [null, 'Myös (−5)² = 25, joten −5 on toinen ratkaisu.', '25 jaettiin kahdella. Tarkista: 12,5² ei ole 25.'],
    },
  },
};
