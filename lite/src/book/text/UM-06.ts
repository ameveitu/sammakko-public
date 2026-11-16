import type { PageText } from '../text';

/** UM-06 Juuriportin mittarit: square roots, real numbers, exact values and a fitting approximation. */
export const TEXT: Record<string, PageText> = {
  'M79-SQRT-01': {
    beats: [
      { text: 'Neliön ala on 16. Sivu on se luku, jonka neliö on 16: 4 · 4 = 16, joten sivu on 4.', pic: 0 },
      { text: 'Tätä lukua sanotaan neliöjuureksi: √16 = 4. Tuloksen voi aina tarkistaa neliöimällä: 4² = 16.', pic: 0 },
      {
        text: 'Myös (−3)² = 9, mutta √9 tarkoittaa vain ei-negatiivista pääjuurta 3. Negatiivisella luvulla, kuten −25, ei ole reaalista neliöjuurta.',
        more: 'Minkään reaaliluvun neliö ei ole negatiivinen, koska samanmerkkisten lukujen tulo on aina positiivinen tai nolla. Siksi √(−25) ei ole reaaliluku.',
        pic: 1,
      },
    ],
    try: {
      say: 'Mikä on √49?',
      options: ['7', '−7 ja 7', '24,5'],
      answer: 0,
      explain: '7² = 49, ja juurimerkki tarkoittaa ei-negatiivista pääjuurta. Siksi √49 = 7.',
      why: [null, 'Myös (−7)² = 49, mutta √49 tarkoittaa vain pääjuurta 7.', 'Luku 49 jaettiin kahdella. Tarkista: 24,5² ei ole 49.'],
    },
  },
  'M79-EXACTAPPROX-01': {
    beats: [
      {
        example: 'Mittari näyttää luvun √7 kahden desimaalin tarkkuudella: 2,65. Onko √7 = 2,65?',
        text: 'Ei ole, sillä 2,65² = 7,0225, joten 2,65 on hieman liian suuri. Siksi merkitään √7 ≈ 2,65: näyttö on vain likiarvo.',
        pic: 0,
      },
      {
        text: 'Lukeman 2,65 antaa jokainen luku, joka on vähintään 2,645 ja alle 2,655. Rajakohdat ovat puolen askeleen eli 0,005:n päässä lukemasta.',
        more: 'Tarkemmin √7 = 2,6457…, joten se on lukeman alapuolella mutta rajakohtien välissä. Tarkka arvo kirjoitetaan juurimerkillä √7.',
        pic: 0,
      },
    ],
    try: {
      say: 'Mittari pyöristää kahteen desimaaliin ja näyttää 3,46. Mikä luku voi olla mitattu arvo?',
      options: ['3,4641', '3,4672', '3,4549'],
      answer: 0,
      explain: 'Lukeman 3,46 antavat luvut, jotka ovat vähintään 3,455 ja alle 3,465. Luku 3,4641 on tällä välillä.',
      why: [null, '3,4672 pyöristyy lukuun 3,47, koska kolmas desimaali on 7.', '3,4549 pyöristyy lukuun 3,45, koska se on alle rajan 3,455.'],
    },
  },
  'M79-SQRT-EXACT': {
    beats: [
      { text: 'Yhdeksän laattaa mahtuu neliöön, jonka sivulla on 3 laattaa. Siksi √9 = 3, koska 3² = 9.', pic: 0 },
      {
        text: 'Samoin √144 = 12, koska 12² = 144. Lukuja 9 ja 144 sanotaan neliöluvuiksi: niiden neliöjuuri on kokonaisluku.',
        more: 'Neliölukuja ovat 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121 ja 144. Ne kannattaa tunnistaa ulkoa.',
        pic: 1,
      },
    ],
    try: {
      say: 'Mikä on √121?',
      options: ['11', '60,5', '12'],
      answer: 0,
      explain: '11² = 121, joten √121 = 11.',
      why: [null, 'Luku 121 jaettiin kahdella. Neliöjuuri ei ole puolet luvusta.', '12² = 144, ei 121.'],
    },
  },
  'M79-SQRT-EST': {
    beats: [
      { text: 'Ala 29 ei ole neliöluku. Se on neliöiden 5² = 25 ja 6² = 36 välissä, joten 5 < √29 < 6.', pic: 0 },
      {
        text: 'Lähimmän kokonaisluvun ratkaisee puolivälin neliö 5,5² = 30,25. Luku 29 on sitä pienempi, joten √29 on lähempänä lukua 5.',
        more: 'Neliöt eivät ole tasavälein, joten pelkkä etäisyys luvuista 25 ja 36 voi johtaa harhaan. Puolivälin neliö ratkaisee varmasti. Tarkemmin √29 ≈ 5,39.',
        pic: 0,
      },
    ],
    try: {
      say: 'Mitä kokonaislukua √40 on lähimpänä?',
      options: ['6', '7', '20'],
      answer: 0,
      explain: '6² = 36 ja 7² = 49, joten √40 on lukujen 6 ja 7 välissä. Koska 6,5² = 42,25 on yli 40, √40 on lähempänä lukua 6.',
      why: [null, '√40 on alle 6,5, koska 6,5² = 42,25 on suurempi kuin 40.', 'Luku 40 jaettiin kahdella. Tarkista: 20² = 400.'],
    },
  },
  'M79-ROUND-01': {
    beats: [
      {
        example: 'Matka on 12,15 km. Kirjaa se yhden desimaalin tarkkuudella.',
        text: '12,15 on asteikkokohtien 12,1 ja 12,2 puolivälissä. Puolivälistä pyöristetään nollasta poispäin, joten 12,15 ≈ 12,2.',
        pic: 0,
      },
      {
        text: 'Tarkkuus voidaan pyytää myös merkitsevinä numeroina: kahdella merkitsevällä numerolla 12,15 km ≈ 12 km. Laskeminen alkaa ensimmäisestä nollasta poikkeavasta numerosta.',
        more: 'Esimerkiksi 0,0472 on kahdella merkitsevällä numerolla 0,047. Alun nollat eivät ole merkitseviä.',
        pic: null,
      },
      {
        text: 'Joskus pyöristetään aina ylöspäin. Jos tarvitaan 12,15 km johtoa ja sitä saa vain kokonaisina kilometreinä, tarvitaan 13 km.',
        pic: null,
      },
    ],
    try: {
      say: 'Köyttä tarvitaan 7,2 m, ja sitä myydään vain kokonaisina metreinä. Montako metriä ostetaan?',
      options: ['8 m', '7 m', '7,2 m'],
      answer: 0,
      explain: '7 m ei riitä, koska tarvitaan 7,2 m. Siksi pyöristetään ylöspäin seuraavaan kokonaiseen metriin: 8 m.',
      why: [null, 'Tavallinen pyöristys antaa 7 m, mutta se jää 0,2 m liian lyhyeksi.', 'Köyttä myydään vain kokonaisina metreinä.'],
    },
  },
  'M79-SQRT-02': {
    beats: [
      { text: 'Portin ensimmäinen sivu on √36 = 6 täsmälleen, koska 6² = 36. Siksi merkki on =.', pic: 0 },
      {
        text: '√75 on neliöiden 8² = 64 ja 9² = 81 välissä. Koska 8,5² = 72,25 on alle 75, √75 on lähempänä lukua 9: √75 ≈ 9.',
        pic: 0,
      },
      {
        text: 'Merkintä √75 on itsessään tarkka luku. Vasta kun se korvataan kokonaisluvulla tai desimaaliluvulla, siitä tulee likiarvo.',
        more: 'Tarkemmin √75 ≈ 8,66. Merkki = sopii vain, kun luvut ovat täsmälleen samat.',
        pic: 0,
      },
    ],
    try: {
      say: 'Mikä merkinnöistä on oikein?',
      options: ['√50 ≈ 7', '√50 = 7', '√50 ≈ 25'],
      answer: 0,
      explain: '7² = 49, joten √50 on vähän yli 7 (√50 ≈ 7,07). Koska se ei ole täsmälleen 7, merkki on ≈.',
      why: [null, '7² = 49 eikä 50, joten √50 ei ole täsmälleen 7.', 'Luku 50 jaettiin kahdella. Tarkista: 25² = 625.'],
    },
  },
  'M79-SQRT-03': {
    beats: [
      { text: 'Termit 2√5 ja 4√5 ovat samanlaisia, joten ne yhdistetään kuin 2x + 4x = 6x. Tarkka tulos on 6√5.', pic: 0 },
      {
        text: 'Pyöristä vasta lopuksi: 6√5 ≈ 13,4. Jos pyöristäisit ensin √5 ≈ 2,2, saisit 6 · 2,2 = 13,2, mikä on liian epätarkka.',
        pic: 0,
      },
      {
        text: 'Erilaisia juuria ei voi yhdistää näin. Esimerkiksi √2 + √3 ei ole √5.',
        more: '√2 + √3 ≈ 3,15, mutta √5 ≈ 2,24. Summa jätetään muotoon √2 + √3, jos tarvitaan tarkka arvo.',
        pic: null,
      },
    ],
    try: {
      say: 'Mikä on 3√2 + 5√2?',
      options: ['8√2', '8√4', '15√2'],
      answer: 0,
      explain: 'Termit ovat samanlaisia, joten kertoimet lasketaan yhteen: 3 + 5 = 8. Tulos on 8√2.',
      why: [null, 'Juurrettavia ei lasketa yhteen. √2 pysyy samana, ja vain kertoimet summataan.', 'Kertoimet kerrottiin. Yhteenlaskussa ne lasketaan yhteen.'],
    },
  },
  'M79-REAL-01': {
    beats: [
      {
        text: 'Rationaaliluku voidaan kirjoittaa kahden kokonaisluvun osamääränä. Esimerkiksi −11/8 on rationaalinen, koska nimittäjä 8 ei ole nolla.',
        pic: 0,
      },
      {
        text: 'Irrationaalilukua, kuten π:tä, ei voi kirjoittaa näin. Myös √3 on irrationaalinen, koska 3 on neliölukujen 1 ja 4 välissä.',
        more: 'Jos kokonaisluku ei ole neliöluku, sen neliöjuuri on irrationaalinen. Esimerkiksi √4 = 2 on rationaalinen, mutta √3 ja √5 eivät ole.',
        pic: 0,
      },
      {
        text: 'Näytettyjen numeroiden määrä ei ratkaise lajia. Näyttö 3,14159… on vain katkelma, ja laji päätellään luvun tarkasta esityksestä.',
        more: 'Rationaaliluvun desimaalit päättyvät tai alkavat toistua, kuten 1/3 = 0,333… Irrationaaliluvun desimaalit jatkuvat loputtomiin toistumatta.',
        pic: null,
      },
    ],
    try: {
      say: 'Mikä luvuista on irrationaalinen?',
      options: ['√5', '√16', '−7/3', '0,25'],
      answer: 0,
      explain: '5 on neliölukujen 4 ja 9 välissä, joten √5 ei ole kahden kokonaisluvun osamäärä. Muut luvut voi kirjoittaa murtolukuna.',
      why: [null, '√16 = 4, joka on kokonaisluku ja siis rationaalinen.', '−7/3 on jo kahden kokonaisluvun osamäärä.', '0,25 = 1/4, joten se on rationaalinen.'],
    },
  },
  'M79-REAL-02': {
    beats: [
      {
        text: 'Lukusuoralla jokainen ykkösväli on jaettu neljään osaan, joten yksi pieni väli on 0,25. Luku 1,25 on yhden pienen välin verran luvun 1 oikealla puolella.',
        pic: 0,
      },
      { text: '−3/4 = −0,75, joten B on kolme pientä väliä nollasta vasemmalle. C = 0,5 on nollan ja ykkösen puolivälissä.', pic: 0 },
      {
        text: 'Juuren paikka voidaan rajata, vaikka sen desimaalit eivät pääty. Esimerkiksi √2 on lukujen 1,4 ja 1,5 välissä, koska 1,4² = 1,96 ja 1,5² = 2,25.',
        pic: null,
      },
    ],
    try: {
      say: 'Mikä luku on lukusuoralla lukujen −1 ja 0 välissä?',
      options: ['−2/3', '−3/2', '2/3'],
      answer: 0,
      explain: '−2/3 ≈ −0,67, joten se on lukujen −1 ja 0 välissä.',
      why: [null, '−3/2 = −1,5, joten se on luvun −1 vasemmalla puolella.', '2/3 on positiivinen, joten se on nollan oikealla puolella.'],
    },
  },
};
