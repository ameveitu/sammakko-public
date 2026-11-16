import type { PageText } from '../text';

/** UM-10 Kahden virran sopimus: systems of equations, proportions, direct and inverse proportionality. */
export const TEXT: Record<string, PageText> = {
  'M79-DIRECTPROP': {
    beats: [
      { text: 'Jokaiselta laiturilta tuodaan 6 näytettä. Kahdelta laiturilta saadaan 12, kolmelta 18 ja viideltä 30 näytettä.', pic: 0 },
      { text: 'Osamäärä on joka rivillä sama: 12 : 2 = 18 : 3 = 30 : 5 = 6. Silloin näytteiden määrä y on suoraan verrannollinen laitureiden määrään x, ja y = 6x.', pic: 0 },
      { text: 'Nollarivi tarkistetaan erikseen, koska nollalla ei voi jakaa. Suorassa verrannollisuudessa x = 0 antaa aina y = 0.', more: 'Kiinteä lisä rikkoo verrannollisuuden. Jos laiturien näytteiden lisäksi tulee aina 4 näytettä varastosta, 2 laiturilla saadaan 16 ja 4 laiturilla 28. Osamäärät 8 ja 7 eivät ole samat.', pic: 0 },
    ],
    try: {
      say: 'Taulukossa x = 1, 2, 3 ja y = 7, 9, 11. Ovatko x ja y suoraan verrannolliset?',
      options: ['Ei, koska osamäärät eivät ole samat', 'Kyllä, koska y kasvaa aina 2:lla', 'Kyllä, koska molemmat kasvavat'],
      answer: 0,
      explain: '7 : 1 = 7, mutta 9 : 2 = 4,5. Lisäksi x = 0 antaisi y = 5 eikä 0, joten mallissa on kiinteä lisä.',
      why: [null, 'Tasainen kasvu ei riitä. Osamäärät 7 ja 4,5 eivät ole samat.', 'Molempien kasvu ei riitä. Suorassa verrannollisuudessa y : x on aina sama.'],
    },
  },
  'M79-INVERSEPROP': {
    beats: [
      { text: 'Saman työn tekemiseen kuluu 2 pumpulla 9 h, 3 pumpulla 6 h ja 6 pumpulla 3 h. Kun pumppuja on enemmän, aikaa kuluu vähemmän.', pic: 0 },
      { text: 'Tulo on joka rivillä sama: 2 · 9 = 3 · 6 = 6 · 3 = 18. Silloin aika on kääntäen verrannollinen pumppujen määrään.', more: 'Tulo 18 kertoo työn määrän pumpputunteina: yksi pumppu tekisi saman työn 18 tunnissa.', pic: 0 },
      { text: 'Malli pätee vain, kun pumput ovat samanlaisia ja työ on sama. Pumppujen määrä ei voi olla 0, sillä ilman pumppuja työ ei valmistu koskaan.', pic: 0 },
    ],
    try: {
      say: 'Neljä samanlaista pumppua tekee työn 6 tunnissa. Kuinka kauan samaan työhön kuluu kolmella pumpulla?',
      options: ['8 h', '4,5 h', '7 h'],
      answer: 0,
      explain: 'Tulo pysyy samana: 4 · 6 = 24. Kolmella pumpulla aikaa kuluu 24 : 3 = 8 h.',
      why: [null, 'Pumppuja on vähemmän, joten aikaa kuluu enemmän, ei vähemmän.', 'Aika ei kasva tunnilla pumppua kohti. Tulon pitää pysyä samana: 3 · 8 = 24.'],
    },
  },
  'M79-PROP-01': {
    beats: [
      { text: 'Mehuun tulee 2 kuppia tiivistettä 5 kuppia vettä kohti. Kun kumpaakin otetaan kolme kertaa enemmän, 6 ja 15 kuppia, väri ja maku pysyvät samoina.', more: 'Jos kumpaankin lisätään 3 kuppia, saadaan 5 ja 8 kuppia. Silloin maku muuttuu, koska 5 : 8 ei ole sama suhde kuin 2 : 5.', pic: 0 },
      { text: 'Taulukon jokainen rivi on sama suhde, koska kumpikin luku kerrotaan samalla luvulla. Suhteet 2 : 5, 4 : 10 ja 6 : 15 ovat yhtä suuret.', pic: 1 },
      { text: 'Verranto kertoo, että kaksi suhdetta ovat yhtä suuret: 2 : 5 = 6 : 15. Verrannossa ristiintulot ovat yhtä suuret: 2 · 15 = 30 ja 5 · 6 = 30.', pic: 2 },
    ],
    try: 'auto',
  },
  'M79-PROP-SOLVE': {
    beats: [
      { example: 'Mallikuvassa sillan kansi on 7 m leveä ja 7 m pitkä. Samanmuotoisessa uudessa piirroksessa kansi on 35 m pitkä. Kuinka leveä se on?', text: 'Pituus kasvoi 35 : 7 = 5-kertaiseksi, joten myös leveys kasvaa 5-kertaiseksi. Verranto 7 / 7 = x / 35 antaa x = 5 · 7 = 35 m.', pic: 0, figure: false },
      { text: 'Samanmuotoisissa kuvioissa kaikki vastaavat mitat kerrotaan samalla kertoimella. Siksi verrannossa vastaavat mitat kirjoitetaan samoille paikoille.', more: 'Jos mallin kansi olisi 3 m leveä ja 7 m pitkä, uusi leveys olisi 5 · 3 = 15 m. Silloin verranto on 3 / 7 = 15 / 35.', pic: 0, figure: false },
      { text: 'Ratkaisu tarkistetaan sijoittamalla se verrantoon: 7 / 7 = 1 ja 35 / 35 = 1. Suhteet ovat yhtä suuret, joten x = 35 m on oikein.', pic: 0, figure: false },
    ],
    try: {
      say: 'Kartalla 2 cm vastaa 50 m:ä maastossa. Kuinka monta metriä vastaa 6 cm?',
      options: ['150 m', '54 m', '300 m'],
      answer: 0,
      explain: 'Verranto 2 / 50 = 6 / x. 6 cm on 3 kertaa 2 cm, joten x = 3 · 50 m = 150 m. Tarkistus: 2 · 150 = 300 = 50 · 6.',
      why: [null, 'Verrannossa ei lisätä vaan kerrotaan. 6 cm on 3 kertaa 2 cm, joten 3 · 50 m.', '6 cm on 3 kertaa 2 cm, ei 6 kertaa. Siis 3 · 50 m = 150 m.'],
    },
  },
  'M79-SYSTEM-01': {
    beats: [
      { text: 'Aavan ehto on 3x + 2y = 17 ja majavan ehto 4x − 2y = 4. Pari (5, 1) sopii ensimmäiseen, mutta toisessa vasen puoli on 18 eikä 4.', pic: 0 },
      { text: 'Pari (3, 4) sopii molempiin: 9 + 8 = 17 ja 12 − 8 = 4. Yhtälöparin ratkaisu on lukupari, joka toteuttaa molemmat yhtälöt yhtä aikaa.', pic: 0 },
      { text: 'Usein yhtälöparilla on yksi ratkaisu. Joskus ratkaisuja on äärettömän monta tai ei yhtään.', more: 'Parilla x + y = 3 ja 2x + 2y = 6 on äärettömän monta ratkaisua, koska ne ovat sama ehto eri muodossa. Parilla x + y = 3 ja x + y = 5 ei ole yhtään, koska summa ei voi olla yhtä aikaa 3 ja 5.', pic: 0 },
    ],
    try: {
      say: 'Yhtälöpari on x + y = 7 ja x − y = 1. Mikä lukupari on sen ratkaisu?',
      options: ['(4, 3)', '(5, 2)', '(3, 4)'],
      answer: 0,
      explain: '4 + 3 = 7 ja 4 − 3 = 1. Pari (4, 3) toteuttaa molemmat yhtälöt.',
      why: [null, '5 + 2 = 7, mutta 5 − 2 = 3 eikä 1. Parin on sovittava molempiin.', '3 + 4 = 7, mutta 3 − 4 = −1. Parissa x on ensin, y toisena.'],
    },
  },
  'M79-SYSTEM-GRAPH': {
    beats: [
      { text: 'Yhtenäinen suora kuvaa ehtoa −x + y = 0 ja katkoviiva ehtoa x + y = 2. Suorat leikkaavat pisteessä (1, 1).', pic: 0 },
      { text: 'Leikkauspiste on yhtälöparin ratkaisu, koska se on kummallakin suoralla. Tarkistus: −1 + 1 = 0 ja 1 + 1 = 2.', more: 'Kuvaajasta luettu piste kannattaa aina tarkistaa sijoittamalla, sillä piirroksesta voi lukea hieman väärin.', pic: 0 },
      { text: 'Yhdensuuntaisilla eri suorilla ei ole yhteistä pistettä, joten ratkaisua ei ole. Jos suorat ovat sama suora, yhteisiä pisteitä on äärettömän monta.', pic: 0 },
    ],
    try: {
      say: 'Suorat y = x + 1 ja y = x + 3 ovat yhdensuuntaiset. Montako ratkaisua yhtälöparilla on?',
      options: ['Ei yhtään', 'Yksi', 'Äärettömän monta'],
      answer: 0,
      explain: 'Yhdensuuntaiset eri suorat eivät leikkaa. Lisäksi x + 1 ei voi koskaan olla sama kuin x + 3.',
      why: [null, 'Yksi ratkaisu on vain, kun suorat leikkaavat. Yhdensuuntaiset eri suorat eivät kohtaa.', 'Niin käy vain, kun suorat ovat sama suora. Nämä kulkevat eri kohdista.'],
    },
  },
  'M79-SYSTEM-ALG': {
    beats: [
      { example: 'Ratkaise yhtälöpari 5x − 2y = −7 ja 5x + 3y = −2.', text: 'Kummassakin yhtälössä on 5x. Kun ensimmäinen yhtälö vähennetään toisesta, x häviää: 5y = 5, joten y = 1.', more: 'Tätä kutsutaan eliminointimenetelmäksi. Yhtälöitä kerrotaan sopivilla luvuilla ja lasketaan yhteen tai vähennetään niin, että toinen tuntematon häviää.', pic: 0, figure: false },
      { text: 'Sijoitetaan y = 1 ensimmäiseen yhtälöön: 5x − 2 = −7. Siitä 5x = −5, joten x = −1.', pic: 0, figure: false },
      { text: 'Pari tarkistetaan kummassakin alkuperäisessä yhtälössä: −5 − 2 = −7 ja −5 + 3 = −2. Molemmat toteutuvat, joten ratkaisu on x = −1, y = 1.', pic: 0, figure: false },
    ],
    try: {
      say: 'Yhtälöpari on x + y = 10 ja x − y = 4. Mikä yhtälö saadaan, kun yhtälöt lasketaan yhteen?',
      options: ['2x = 14', '2y = 14', '2x = 6'],
      answer: 0,
      explain: '(x + y) + (x − y) = 2x ja 10 + 4 = 14. Siis 2x = 14, josta x = 7 ja y = 3.',
      why: [null, 'y-termit kumoavat toisensa: y + (−y) = 0. Jäljelle jää 2x.', 'Myös oikeat puolet lasketaan yhteen: 10 + 4 = 14.'],
    },
  },
};
