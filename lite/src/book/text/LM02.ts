import type { PageText } from '../text';

/** LM02 Selitysten telttakylä: problem solving, strategies and showing a mathematical idea. */
export const TEXT: Record<string, PageText> = {
  'M-PS-01': {
    beats: [
      {
        example: 'Köysi on 15 m pitkä. Telttaan käytetään 6 m. Montako metriä köyttä jää jäljelle?',
        text: 'Kaksi lausetta kertoo, mitä jo tiedetään: köysi on 15 m ja telttaan menee 6 m. Ne ovat annetut tiedot.',
        pic: 0, figure: false,
      },
      {
        text: 'Kysymys kertoo, mitä etsitään: jäljelle jäävän köyden pituus. Sitä ei vielä tiedetä.',
        more: 'Kun tiedot ja kysymys on erotettu, laskun voi valita: 15 − 6 = 9. Köyttä jää 9 metriä.',
        pic: 1,
      },
    ],
    try: {
      say: 'Loikalla on 10 kiveä, ja hän antaa Aavalle 4. Mitä tehtävässä etsitään, kun kysytään, montako jää?',
      options: ['Montako kiveä Loikalle jää', 'Montako kiveä Loikalla oli alussa', 'Montako kiveä Aava sai'],
      answer: 0,
      explain: 'Kysymys kertoo etsittävän: Loikalle jäävät kivet. Alun 10 kiveä ja Aavalle annetut 4 ovat annettuja tietoja.',
      why: [null, 'Alussa kiviä oli 10. Se on jo annettu tieto.', 'Aava sai 4 kiveä. Sekin on jo annettu tieto.'],
    },
  },
  'M-PS-02': {
    beats: [
      {
        text: 'Tavoite on 10 painoyksikköä, ja jokainen pala tuo 2. Ensimmäinen koe 4 palalla antaa 8.',
        pic: 0, figure: false,
      },
      {
        text: '8 on vähemmän kuin 10, joten lisätään yksi pala. Uusi koe 5 palalla antaa juuri 10.',
        more: 'Kokeile, katso tulosta ja muuta yritystä sen mukaan. Jos tulos olisi liian suuri, paloja otettaisiin pois.',
        pic: 1,
      },
    ],
    try: {
      say: 'Jos 6 palaa antaisi 12 painoyksikköä ja tavoite on 10, mitä teet seuraavaksi?',
      options: ['Otan yhden palan pois', 'Lisään yhden palan', 'Aloitan aivan alusta'],
      answer: 0,
      explain: '12 on liikaa, koska tavoite on 10. Yksi pala tuo 2, joten kun yksi pala otetaan pois, tulos on 10.',
      why: [null, 'Lisäys kasvattaisi tulosta, vaikka sitä on jo liikaa.', 'Koe kertoi jo paljon. Riittää, että muutat yritystä vähän.'],
    },
  },
  'M-REP-01': {
    beats: [
      {
        example: 'Jaa 6 evästä Aavalle ja Loikalle tasan.',
        text: 'Pöydälle laitetaan yksi kivi jokaista evästä kohden. Kiviä on siis 6, yhtä monta kuin eväitä.',
        pic: 0, figure: false,
      },
      {
        text: 'Kivet jaetaan kahteen ryhmään: Aavalle 3 ja Loikalle 3. Ryhmät ovat yhtä suuret, joten jako on tasan.',
        more: 'Ryhmän sisällä kivien paikalla ei ole väliä. Tärkeää on, että jokainen kivi vastaa yhtä evästä.',
        pic: 1,
      },
    ],
    try: {
      say: 'Nyt jaetaan 8 evästä tasan Aavalle ja Loikalle. Montako kiveä tulee kumpaankin ryhmään?',
      options: ['4', '8', '2'],
      answer: 0,
      explain: 'Kahdeksan kiveä jaetaan kahteen yhtä suureen ryhmään: kumpaankin tulee 4, ja 4 + 4 = 8.',
      why: [null, 'Kiviä on yhteensä vain 8, joten molemmille ei voi tulla kaikkia.', 'Kaksi on syöjien määrä, ei yhden ryhmän kivien määrä.'],
    },
  },
  'M-REP-02': {
    beats: [
      {
        example: 'Loikka piirtää Aavalle kuvan: 6 evästä jaetaan heille kahdelle tasan.',
        text: 'Piirroksessa yksi pallo tarkoittaa yhtä evästä. Pallot piirretään kahteen ryhmään, yksi kummallekin.',
        pic: 0, figure: false,
      },
      {
        text: 'Aavan ryhmässä on 3 palloa ja Loikan ryhmässä 3. Kuvasta näkee heti, että osuudet ovat yhtä suuret.',
        more: 'Hyvä piirros on yksinkertainen: pallo riittää, evästä ei tarvitse piirtää tarkasti. Kun ryhmille kirjoittaa nimet, toinenkin ymmärtää kuvan.',
        pic: 1,
      },
    ],
    try: {
      say: 'Mikä piirros näyttää, että 6 evästä on jaettu tasan kahdelle?',
      options: ['●●● ja ●●●', '●●●● ja ●●', '●●●●●● ja ●●●●●●'],
      answer: 0,
      explain: 'Kummassakin ryhmässä on 3 palloa, ja yhteensä palloja on 6. Ryhmät ovat yhtä suuret.',
      why: [null, 'Ryhmät ovat eri kokoiset: 4 ja 2 ei ole tasan.', 'Palloja on 12, mutta eväitä on vain 6.'],
    },
  },
  'M-REP-03': {
    beats: [
      {
        text: 'Teltalle tarvitaan 2 isoa ja 4 pientä kiilaa. Loikka kirjoittaa: 2 + 4 = 6 kiilaa.',
        pic: 0, figure: false,
      },
      {
        text: 'Loikka selittää: ”Isoja on 2 ja pieniä 4. Lasken ne yhteen, koska kysytään kaikkia kiiloja.”',
        more: 'Pelkkä vastaus 6 ei kerro, miten siihen päästiin. Hyvä selitys kertoo, mitä luvut tarkoittavat ja miksi lasketaan juuri niin.',
        pic: 1, figure: false,
      },
    ],
    try: {
      say: 'Mikä selitys kertoo parhaiten, miten Loikka sai 6 kiilaa?',
      options: ['Isoja on 2 ja pieniä 4, lasken ne yhteen: 6.', 'Vastaus on 6.', 'Laskin sen päässäni.'],
      answer: 0,
      explain: 'Hyvä selitys kertoo, mitä luvut tarkoittavat ja miksi ne lasketaan yhteen. Silloin kuulija voi seurata ajatusta.',
      why: [null, 'Pelkkä vastaus ei kerro, mistä se tuli.', 'Kuulija ei tiedä, mitä laskit ja miksi.'],
    },
  },
  'M-REP-04': {
    beats: [
      { text: 'Lammessa on 3 kalaa, ja 2 ui lisää. Merkeillä sen voi kirjoittaa lyhyesti: 3 + 2 = 5.', pic: 0 },
      { text: 'Loikalla on 7 kiveä ja Aavalla 4, joten Loikalla on enemmän: 7 > 4. Merkin kärki osoittaa pienempää lukua.', pic: 1 },
      { text: '”Viisi on kolme vähemmän kuin kahdeksan” muutetaan merkeiksi pala kerrallaan: 5 = 8 − 3.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-PS-03': {
    beats: [
      {
        example: 'Vie 12 evästä. Koriin mahtuu 4, ja matkoja saa tehdä enintään 4.',
        text: 'Yksi eväs kerrallaan vaatisi 12 matkaa. Se on liikaa, joten tarvitaan parempi tapa.',
        pic: 0, figure: false,
      },
      {
        text: 'Täytetään korit: 12 evästä mahtuu kolmeen täyteen koriin, koska 3 × 4 = 12. Kolme matkaa riittää.',
        more: 'Tapa valitaan kysymyksen mukaan. Tässä kysytään, montako täyttä koria tarvitaan, joten eväät ryhmitellään neljän ryhmiin.',
        pic: 1,
      },
    ],
    try: {
      say: 'Vie 20 evästä, kun koriin mahtuu 5. Montako matkaa tarvitaan, kun korit ovat täynnä?',
      options: ['4', '20', '5'],
      answer: 0,
      explain: 'Täysiä koreja tulee 4, koska 4 × 5 = 20. Jokainen matka vie yhden täyden korin.',
      why: [null, 'Niin monta matkaa tarvittaisiin, jos veisit eväät yksitellen.', 'Viisi on yhden korin koko, ei matkojen määrä.'],
    },
  },
  'M-PS-04': {
    beats: [
      {
        example: 'Yhdistä 22 ja 19 kiveä.',
        text: 'Aava lisää ensin kympin ja sitten ykköset: 22 + 10 = 32 ja 32 + 9 = 41.',
        pic: 0, figure: false,
      },
      {
        text: 'Loikka lisää tasakympit ja ottaa ylimääräisen pois: 22 + 20 = 42 ja 42 − 1 = 41.',
        pic: 1, figure: false,
      },
      {
        text: 'Kumpikin lisää yhteensä 19, joten tulos on sama. Loikan tapa on kätevä, kun luku on lähellä tasakymmentä.',
        pic: 1, figure: false,
      },
    ],
    try: {
      say: 'Loikka laskee omalla tavallaan 35 + 29. Mitä hän laskee?',
      options: ['35 + 30 − 1', '35 + 30 + 1', '35 + 20 − 1'],
      answer: 0,
      explain: '29 on yhden vähemmän kuin 30. Lisätään 30 ja otetaan ylimääräinen 1 pois: 65 − 1 = 64.',
      why: [null, 'Lisäsit jo yhden liikaa, joten se otetaan pois eikä lisätä.', '20 on liian vähän: 29 on lähellä lukua 30.'],
    },
  },
  'M-PS-05': {
    beats: [
      {
        example: 'Pöydällä on 4 koria, ja jokaisessa on 4–6 evästä. Loikka ehdottaa 60 evästä.',
        text: 'Pienin mahdollinen määrä on 4 × 4 = 16. Suurin mahdollinen on 4 × 6 = 24.',
        pic: 0, figure: false,
      },
      {
        text: 'Eväitä on siis 16–24. Ehdotus 60 on paljon yli arvion, joten se ei voi olla oikein.',
        more: 'Tarkkaa määrää ei tarvitse laskea. Väljä arvio riittää paljastamaan, että tulos on aivan liian suuri.',
        pic: 1,
      },
    ],
    try: {
      say: 'Korien eväsmäärä on välillä 16–24. Mikä näistä ehdotuksista on järkevä?',
      options: ['20 evästä', '60 evästä', '6 evästä'],
      answer: 0,
      explain: '20 on välillä 16–24, joten se sopii arvioon.',
      why: [null, '60 on paljon yli suurimman mahdollisen määrän 24.', '6 on alle pienimmän mahdollisen määrän 16.'],
    },
  },
  'M-PS-06': {
    beats: [
      {
        example: 'Laatikossa oli 15 tappia. Telttaan käytettiin 4. Paljonko jäi?',
        text: 'Loikka laski 15 + 4 = 19 tappia. Tappeja jäi enemmän kuin alussa oli, vaikka niitä käytettiin.',
        pic: 0, figure: false,
      },
      {
        text: 'Vaihe 2 meni vikaan: käytetyt tapit lähtevät laatikosta, joten ne vähennetään. Oikein on 15 − 4 = 11.',
        more: 'Tarkista vaihe kerrallaan: vastaako lasku sitä, mitä pulmassa tapahtuu? Ensimmäinen vaihe, joka ei vastaa, korjataan.',
        pic: 1,
      },
    ],
    try: {
      say: 'Laatikossa oli 12 kiilaa, ja 5 käytettiin. Loikka laski 12 + 5 = 17. Mikä on oikea lasku?',
      options: ['12 − 5 = 7', '12 + 5 = 17', '17 − 5 = 12'],
      answer: 0,
      explain: 'Käytetyt kiilat lähtevät laatikosta, joten ne vähennetään alun määrästä: 12 − 5 = 7.',
      why: [null, 'Käytetyt kiilat lähtevät laatikosta, joten niitä ei lisätä.', 'Luku 17 tuli väärästä laskusta. Aloita alun määrästä 12.'],
    },
  },
  'M-REP-05': {
    beats: [
      {
        text: 'Majava tarvitsee 2 metrin köyden, ja hän mittaa metrin palalla. Viestiksi käy lappu ”2 m” tai kuva kahdesta metrin palasta peräkkäin.',
        pic: 0, figure: false,
      },
      {
        text: 'Kuva sopii Majavalle paremmin. Hän voi siirtää metrin palaa kaksi kertaa ja tarkistaa köyden itse.',
        more: 'Esitystapa valitaan vastaanottajan mukaan: mitä hän osaa lukea ja mitä hänen pitää tehdä viestillä.',
        pic: 1, figure: false,
      },
    ],
    try: {
      say: 'Pikkusisko ei osaa vielä lukea numeroita, mutta hänen pitää hakea 3 omenaa. Mikä viesti sopii?',
      options: ['Kuva, jossa on 3 omenaa', 'Lappu, jossa lukee 3', 'Lappu, jossa lukee ”kolme”'],
      answer: 0,
      explain: 'Kuvan omenat voi laskea, vaikka ei osaisi lukea. Viesti toimii, kun vastaanottaja ymmärtää sen.',
      why: [null, 'Numeroita hän ei vielä osaa lukea.', 'Sanoja hän ei vielä osaa lukea.'],
    },
  },
};
