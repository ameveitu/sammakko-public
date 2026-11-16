import type { PageText } from '../text';

/** LM03 Lukusanojen ruovikko: counting, number words and numerals, zero, number sequences and what numbers tell. */
export const TEXT: Record<string, PageText> = {
  'M-NUM-STABLE-ORDER': {
    beats: [
      { text: 'Loikka hyppii kiveltä kivelle ja sanoo joka hypyllä yhden sanan: yksi, kaksi, kolme, neljä, viisi. Sanat tulevat aina samassa järjestyksessä.', pic: 0 },
      { text: 'Nyt Loikka hyppää yhden kiven yli: yksi, kaksi, neljä. Kolme jäi sanomatta, joten lasku menee väärin.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-NUM-1TO1': {
    beats: [
      { text: 'Loikka osoittaa marjoja yksi kerrallaan. Jokainen marja saa yhden sanan: yksi, kaksi, kolme, neljä.', pic: 0 },
      { text: 'Tässä sormi jää yhden marjan kohdalle, ja se saa kaksi sanaa. Marjoja on kolme, mutta lasku sanoo neljä.', pic: 1 },
      { text: 'Tässä sormi hyppää yhden marjan yli. Marjoja on neljä, mutta lasku sanoo vain kolme.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-NUM-WORD-NUMERAL': {
    beats: [
      { text: 'Jokaisella luvulla on nimi ja numero. Junassa numero syttyy, kun sen nimi sanotaan: nolla, yksi, kaksi… kymmenen.', pic: 0 },
      { text: 'Katso tarkasti samannäköisiä numeroita. Kuutosessa pallo on alhaalla, yhdeksikössä ylhäällä.', more: 'Ykkönen on pystyviiva, jossa on pieni nokka. Seitsemässä on ylhäällä vaakaviiva.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-NUM-01': {
    beats: [
      { text: 'Osoita yksi käpy kerrallaan ja sano yksi sana: yksi, kaksi, kolme, neljä, viisi, kuusi. Viimeinen sana kertoo, montako käpyä on.', pic: 0 },
      { text: 'Kun kivet ovat ringissä, muista, mistä aloitit. Lopeta, kun palaat alkuun: kiviä on seitsemän.', pic: 1 },
      { text: 'Jos alkua ei muista, ensimmäinen kivi lasketaan uudestaan. Silloin tulee kahdeksan, vaikka kiviä on seitsemän.', pic: 2 },
    ],
    try: {
      say: 'Ringissä on seitsemän kiveä. Loikka laski ja sai kahdeksan. Mitä tapahtui?',
      options: ['Yksi kivi laskettiin kahdesti', 'Yksi kivi jäi laskematta', 'Loikka laski oikein'],
      answer: 0,
      explain: 'Kahdeksan on yksi liikaa. Loikka ei muistanut, mistä aloitti, ja laski ensimmäisen kiven uudestaan.',
      why: [null, 'Jos kivi jää laskematta, luvuksi tulee liian vähän, eikä kahdeksan.', 'Kiviä on seitsemän, joten kahdeksan on yksi liikaa.'],
    },
  },
  'M-NUM-02': {
    beats: [
      { text: 'Loikka laskee marjat: yksi, kaksi, kolme, neljä. Viimeinen sana on neljä, joten marjoja on neljä.', pic: 0 },
      { text: 'Kun marjat peitetään, niitä on yhä neljä. Viimeinen sana muistetaan, eikä tarvitse laskea uudestaan.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-NUM-04': {
    beats: [
      { text: 'Aava ei laske lehtiä yksitellen. Hän näkee ryhmät heti: yhdessä on neljä lehteä, toisessa kaksi.', more: 'Nopan pisteistäkin näkee määrän laskematta.', pic: 1 },
      { text: 'Ryhmät lasketaan yhteen: neljä ja kaksi on kuusi. Jokainen lehti on vain yhdessä ryhmässä.', pic: 1 },
    ],
    try: {
      say: 'Yhdessä ryhmässä on viisi lehteä ja toisessa kolme. Montako lehteä on yhteensä?',
      options: ['8', '2', '9'],
      answer: 0,
      explain: 'Jatka viidestä kolme askelta: kuusi, seitsemän, kahdeksan. Lehtiä on kahdeksan.',
      why: [null, 'Kaksi on ryhmien ero. Yhteensä lasketaan kaikki lehdet.', 'Yksi liikaa. Viidestä kolme askelta eteenpäin on kahdeksan.'],
    },
  },
  'M-NUM-05': {
    beats: [
      { text: 'Kun esineitä on paljon, voi ensin arvioida eli sanoa suunnilleen, montako niitä on. Tässä arvio on 16–21.', more: 'Iso simpukka on silti yksi simpukka, vaikka se vie enemmän tilaa.', pic: 1 },
      { text: 'Sitten tarkistetaan ryhmistä: 5 + 5 + 5 + 3 = 18. Luku 18 on arvion sisällä, joten arvio oli hyvä.', pic: 1 },
    ],
    try: {
      say: 'Aava arvioi, että lehtiä on noin kymmenen. Laskiessa niitä oli 11. Oliko arvio hyvä?',
      options: ['Oli, koska 11 on lähellä kymmentä', 'Ei, koska arvion pitää osua tasan', 'Ei, koska lehtiä oli enemmän'],
      answer: 0,
      explain: 'Arvio on hyvä, kun se on lähellä oikeaa määrää. Tarkka määrä saadaan laskemalla.',
      why: [null, 'Arvio kertoo vain suunnilleen. Sen ei tarvitse osua tasan.', 'Yksi enemmän on hyvin lähellä. Arvio saa mennä vähän ohi.'],
    },
  },
  'M-NUM-QTY-WORD': {
    beats: [
      { text: 'Aava laskee simpukat: yksi, kaksi, kolme, neljä, viisi. Viimeinen sana on viisi, joten simpukoita on viisi.', pic: 0 },
      { text: 'Nyt Aava levittää simpukat. Rivi pitenee, mutta simpukoita on yhä viisi.', more: 'Määrä muuttuu vain, jos simpukoita tuodaan lisää tai viedään pois.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-NUM-QTY-NUMERAL': {
    beats: [
      { text: 'Aava laittaa kiviä rasiaan yksi kerrallaan. Lappu näyttää aina, montako kiveä rasiassa on.', pic: 0 },
      { text: 'Lappu toimii myös toisin päin. Kun lapussa on 3, rasiaan laitetaan kolme simpukkaa ja lopetetaan.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-NUM-03': {
    beats: [
      { text: 'Lautasella on neljä marjaa. Saman määrän voi kirjoittaa numerona 4 ja sanana neljä.', more: 'Marjat, numero ja sana kertovat kaikki saman: montako on.', pic: 0 },
    ],
    try: {
      say: 'Missä parissa numero ja sana kertovat saman määrän?',
      options: ['5 ja viisi', '5 ja kaksi', '2 ja viisi'],
      answer: 0,
      explain: 'Viisi kirjoitetaan numerona 5. Viisi marjaa, 5 ja viisi kertovat saman määrän.',
      why: [null, 'Kaksi kirjoitetaan 2, ei 5.', 'Viisi kirjoitetaan 5, ei 2.'],
    },
  },
  'M-NUM-06': {
    beats: [
      { text: 'Lautasella on kolme marjaa. Loikka syö ne yksi kerrallaan: kolme, kaksi, yksi…', pic: 0 },
      { text: 'Rasiassa ei ole yhtään marjaa. Kun ei ole yhtään, sanotaan nolla ja kirjoitetaan 0.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-NUM-07': {
    beats: [
      { text: 'Loikka hyppää kiveltä kivelle: neljä, viisi, kuusi. Joka hypyllä luku kasvaa yhdellä, joten seuraavana on seitsemän.', pic: 0 },
      { text: 'Kymmenen jälkeen jono jatkuu samalla tavalla: yksitoista, kaksitoista.', pic: 1 },
      { text: 'Yhdeksäntoista jälkeen alkaa uusi kymppi: kaksikymmentä, sitten kaksikymmentäyksi.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-NUM-10': {
    beats: [
      { text: 'Luvut 41 ja 38 on tehty kaislanipuista. Ensin verrataan kymppejä: neljä nippua on enemmän kuin kolme, joten 41 on suurempi.', more: 'Ykkösiä ei tarvitse edes katsoa.', pic: 0 },
      { text: 'Luvuissa 52 ja 57 on yhtä monta kymppiä. Silloin ykköset ratkaisevat: seitsemän on enemmän kuin kaksi, joten 57 on suurempi.', pic: 1 },
      { text: 'Merkin suu aukeaa suurempaa lukua kohti: 41 > 38. Se luetaan: 41 on suurempi kuin 38.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-NUM-12': {
    beats: [
      { text: 'Kaikissa korteissa on luku 4. Vain yksi kortti kertoo, montako jotakin on: rakenna 4 lehtipaikkaa.', pic: 1 },
      { text: 'Muissa korteissa 4 kertoo jotain muuta: monesko vene on jonossa, mikä on lautan numero tai kuinka pitkä köysi on.', pic: 1 },
    ],
    try: {
      say: 'Missä luku kertoo, montako jotakin on?',
      options: ['Laiturilla on 4 venettä.', 'Loikka on jonossa neljäs.', 'Lautan numero on 4.'],
      answer: 0,
      explain: 'Laiturilla on 4 venettä: luku kertoo, montako venettä on. Ne voi laskea: yksi, kaksi, kolme, neljä.',
      why: [null, 'Neljäs kertoo paikan jonossa, ei määrää.', 'Lautan numero on kuin nimilappu. Se ei kerro määrää.'],
    },
  },
  'M-NUM-14': {
    beats: [
      { text: 'Palat ladotaan nauhan viereen alusta alkaen, ilman rakoja. Nauha on kuusi palaa pitkä: 6 palaa.', pic: 0 },
      { text: 'Sama nauha mitataan isoilla paloilla. Isoja paloja tarvitaan vähemmän: nauha on 3 isoa palaa pitkä.', more: 'Luku kertoo, montako palaa tarvittiin. Siksi pitää aina kertoa, millaisilla paloilla mitattiin.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-NUM-08': {
    beats: [
      { text: 'Loikka on luvussa 8 ja hyppää kolme kertaa taaksepäin: seitsemän, kuusi, viisi. Joka hypyllä luku pienenee yhdellä.', pic: 0 },
      { text: 'Taaksepäin mentäessä kahdestakymmenestä tullaan yhdeksääntoista: kaksikymmentäyksi, kaksikymmentä, yhdeksäntoista, kahdeksantoista.', pic: 1 },
      { text: 'Lähtökivi ei ole hyppy. Ensimmäinen hyppy vie luvusta 13 lukuun 12.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-NUM-11': {
    beats: [
      { text: 'Kortit ovat järjestyksessä pienimmästä suurimpaan: 9, 12, 19, 21, 22. Ensin verrataan kymppejä: luvussa 9 ei ole yhtään, joten se on pienin.', pic: 1 },
      { text: 'Luvuissa 21 ja 22 on yhtä monta kymppiä. Silloin ykköset ratkaisevat: 21 on pienempi.', more: 'Jos kaksi korttia on yhtä suuria, kumpi tahansa voi olla ensin.', pic: 1 },
    ],
    try: {
      say: 'Mikä järjestys menee pienimmästä suurimpaan?',
      options: ['13, 30, 31', '30, 31, 13', '31, 30, 13'],
      answer: 0,
      explain: 'Luvussa 13 on yksi kymppi, joten se on pienin. Luvuissa 30 ja 31 on kolme kymppiä, ja ykköset ratkaisevat.',
      why: [null, 'Tässä verrattiin ensin ykkösiä. Kympit verrataan ensin.', 'Tämä järjestys menee suurimmasta pienimpään.'],
    },
  },
  'M-NUM-13': {
    beats: [
      { text: 'Jonossa ovat Aava, Sulka, Majava ja Loikka. Vasemmalta laskien toinen on Sulka.', more: 'Ensin katsotaan, mistä päästä lasketaan. Ensimmäinen on heti siinä päässä.', pic: 1 },
      { text: 'Uudessa jonossa lasketaan oikealta: Aava, Loikka, Majava, Sulka. Nyt Sulka onkin neljäs.', pic: 1 },
    ],
    try: {
      say: 'Jonossa ovat vasemmalta Aava, Loikka ja Sulka. Monesko Aava on oikealta laskien?',
      options: ['Kolmas', 'Ensimmäinen', 'Toinen'],
      answer: 0,
      explain: 'Oikealta laskien ensimmäinen on Sulka, toinen Loikka ja kolmas Aava.',
      why: [null, 'Aava on ensimmäinen vasemmalta. Oikealta ensimmäinen on Sulka.', 'Toisena on keskellä oleva Loikka.'],
    },
  },
  'M-NUM-09': {
    beats: [
      { text: 'Luvun 4 naapurit ovat 3 ja 5. Juuri ennen neljää tulee kolme ja juuri sen jälkeen viisi.', pic: 1 },
      { text: 'Naapuri on aina yhden askeleen päässä: taaksepäin yksi vähemmän, eteenpäin yksi enemmän.', more: 'Tämä jono alkaa nollasta. Siksi nollaa ennen ei tule lukua, ja nollan jälkeen tulee yksi.', pic: 1 },
    ],
    try: {
      say: 'Mitkä luvut ovat luvun 10 naapurit?',
      options: ['9 ja 11', '8 ja 12', '10 ja 11'],
      answer: 0,
      explain: 'Juuri ennen kymmentä tulee yhdeksän ja juuri sen jälkeen yksitoista.',
      why: [null, 'Luvut 8 ja 12 ovat kahden askeleen päässä.', '10 on itse luku, ei sen naapuri.'],
    },
  },
};
