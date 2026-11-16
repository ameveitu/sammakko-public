import type { PageText } from '../text';

/** LM22 Ohjelmoitujen lauttojen poukama: algorithms, graphical programming, testing and evaluation. */
export const TEXT: Record<string, PageText> = {
  'M-PROG-01': {
    beats: [
      { text: 'Lautta on ruudussa B2, ja sen keula osoittaa kuvassa alas. Ohjekortissa on kolme käskyä, ja lautta tekee ne yksi kerrallaan.', pic: 0 },
      { text: 'Eteen vie lautan yhden ruudun keulan suuntaan, ruutuun B3. Vasemmalle kääntää vain keulaa, ja lautta pysyy ruudussa B3.', pic: 0 },
      { text: 'Lautta kääntyy omalle vasemmalle puolelleen. Alas katsovan lautan keula kääntyy siksi kuvassa oikealle, ja viimeinen Eteen vie sen ruutuun C3.', pic: 0 },
    ],
    try: {
      say: 'Lautta on ruudussa C2 ja saa käskyn Oikealle. Missä ruudussa se on käskyn jälkeen?',
      options: ['C2', 'B2', 'C3'],
      answer: 0,
      explain: 'Käännös muuttaa vain keulan suuntaa. Lautta pysyy ruudussa C2, kunnes se saa käskyn Eteen.',
      why: [null, 'Oikealle ei siirrä lauttaa, se vain kääntää keulaa.', 'Lautta liikkuu vasta Eteen-käskyllä.'],
    },
  },
  'M-PROG-02': {
    beats: [
      { text: 'Lautan pitää päästä ruudusta B2 ruutuun C3 ja käydä matkalla laiturilla B3. Perillä keulan pitää osoittaa kuvassa oikealle.', pic: 0 },
      { text: 'Lautta tekee vain ne käskyt, jotka ohjeessa on. Tähän riittää kolme käskyä: Eteen, Vasemmalle ja Eteen.', pic: 0 },
      { text: 'Samaan paikkaan voi päästä monella eri ohjeella. Jokainen ohje käy, kun lautta pääsee perille ja kaikki toiveet toteutuvat.', pic: 0 },
    ],
    try: {
      say: 'Lautta on ruudussa A1, ja sen keula osoittaa kuvassa oikealle. Mikä ohje vie sen ruutuun C1?',
      options: ['Eteen, Eteen', 'Eteen', 'Oikealle, Eteen, Eteen'],
      answer: 0,
      explain: 'Keula osoittaa jo kohti ruutua C1. Ensimmäinen Eteen vie ruutuun B1 ja toinen ruutuun C1.',
      why: [null, 'Yksi Eteen vie vain yhden ruudun, ruutuun B1.', 'Oikealle kääntäisi keulan alas, ja lautta lähtisi väärään suuntaan.'],
    },
  },
  'M-PROG-TEST': {
    beats: [
      { text: 'Ohjetta kokeillaan ajamalla se alusta loppuun. Lautan piti päätyä ruutuun C3, mutta se päätyi ruutuun A3.', pic: 0 },
      { text: 'Askelia verrataan yksi kerrallaan siihen, mitä piti tapahtua. Oikea ohje olisi ollut Eteen, Vasemmalle, Eteen.', pic: 0 },
      { text: 'Ensimmäinen askel meni oikein. Toisessa lautta kääntyi oikealle eikä vasemmalle, joten korjaus aloitetaan siitä.', more: 'Ensimmäisen eron jälkeen muutkin askeleet menevät usein väärin. Siksi etsitään aina se kohta, jossa ero alkoi.', pic: 0 },
    ],
    try: {
      say: 'Ohjeen piti olla Eteen, Eteen, Vasemmalle. Lautta teki Eteen, Vasemmalle, Eteen. Missä askeleessa on ensimmäinen ero?',
      options: ['2. askeleessa', '1. askeleessa', '3. askeleessa'],
      answer: 0,
      explain: 'Ensimmäinen askel on molemmissa Eteen. Toisessa askeleessa lautan piti mennä eteen, mutta se kääntyi.',
      why: [null, 'Ensimmäinen askel on molemmissa sama: Eteen.', 'Kolmaskin askel eroaa, mutta ero alkoi jo toisesta askeleesta.'],
    },
  },
  'M-PROG-EVALUATE': {
    beats: [
      { text: 'Lautan piti käydä laiturilla B3 ja päätyä ruutuun C3 keula kuvassa oikealle. Lautta kävi laiturilla ja päätyi ruutuun C3.', pic: 0 },
      { text: 'Viimeinen käsky Oikealle käänsi keulan alas. Ruutu on oikea, mutta keula osoittaa väärään suuntaan.', pic: 0 },
      { text: 'Ohje toimii vasta, kun kaikki toiveet toteutuvat samalla ajolla. Tämä ohje ei vielä toimi.', pic: 0 },
    ],
    try: {
      say: 'Lautan piti hakea paketti laiturilta ja viedä se rantaan. Lautta tuli rantaan, mutta ei käynyt laiturilla. Toimiko ohje?',
      options: ['Ei toiminut', 'Toimi', 'Toimi, koska lautta ei törmännyt'],
      answer: 0,
      explain: 'Ohje toimii vasta, kun jokainen toive toteutuu. Laiturilla käynti oli yksi toiveista, ja se jäi tekemättä.',
      why: [null, 'Lautta tuli rantaan, mutta paketti jäi laiturille.', 'Törmäämättä ajaminen ei riitä, jos jokin toive jää toteutumatta.'],
    },
  },
  'M-PROG-03': {
    beats: [
      { text: 'Lautta ajoi ohjeen Eteen, Vasemmalle, Eteen. Jokainen askel meni niin kuin piti, ja ajo päättyi ruutuun C3.', pic: 0 },
      { text: 'Sen jälkeen tarkistetaan jokainen toive erikseen: laituri B3, ruutu C3 ja keula kuvassa oikealle.', pic: 0 },
      { text: 'Kaikki kolme toteutuivat samalla ajolla, joten ohje toimii. Jos yksikin puuttuisi, ohjetta pitäisi vielä korjata.', pic: 0 },
    ],
    try: {
      say: 'Ajo meni loppuun asti ilman törmäystä, mutta keula jäi väärään suuntaan. Toimiko ohje?',
      options: ['Ei toiminut', 'Toimi'],
      answer: 0,
      explain: 'Ajon onnistuminen ei vielä riitä. Ohje toimii, kun myös jokainen toive toteutuu, ja keulan suunta oli yksi niistä.',
      why: [null, 'Ajo päättyi, mutta keulan suunta oli myös toiveena.'],
    },
  },
  'M-PROG-04': {
    beats: [
      { text: 'Ohjelma on käskyjono, jonka lautta tekee järjestyksessä. Tässä lautta on ruudussa B3 keula etelään, ja ohjelmassa on yksi käsky: Eteen.', pic: 0 },
      { text: 'Ennen ajoa tehdään ennuste. Eteen vie aina yhden ruudun keulan suuntaan, joten ennuste on ruutu B4.', more: 'Jos edessä on kari tai kartan reuna, lautta pysähtyy paikalleen eikä ohjelma jatku.', pic: 0 },
      { text: 'Ajon jälkeen ennustetta verrataan havaintoon. Lautta päätyi ruutuun B4 keula yhä etelään, joten ennuste piti.', pic: 0 },
    ],
    try: {
      say: 'Lautta katsoo etelään eli kuvassa alas. Ohjelma on Vasemmalle, Eteen. Mihin suuntaan lautta liikkuu?',
      options: ['Itään eli kuvassa oikealle', 'Länteen eli kuvassa vasemmalle', 'Pohjoiseen eli kuvassa ylös'],
      answer: 0,
      explain: 'Lautta kääntyy oman vasemman puolensa suuntaan. Etelään katsovan lautan vasemmalla puolella on itä, joten Eteen vie sen itään.',
      why: [null, 'Kuvan vasen ja lautan vasen ovat eri puolilla, kun lautta katsoo alas.', 'Pohjoiseen lautta kääntyisi vasta kahdella käännöksellä.'],
    },
  },
  'M-PROG-05': {
    beats: [
      { text: 'Lautta lähtee ruudusta B1, ja paketti pitää viedä ruutuun D5. Suoraan alas ei pääse, koska ruudussa B3 on kari.', pic: 0 },
      { text: 'Reitti jaetaan osiin, joista jokainen kulkee suoraan. Ensin ruudusta B1 ruutuun D1, sitten ruudusta D1 alas ruutuun D5.', more: 'Osa kulkee aina samaa riviä tai samaa saraketta, eikä sen matkalla saa olla karia.', pic: 0 },
      { text: 'Ruutu D1 on osatavoite: siinä yksi suora osa päättyy ja suunta vaihtuu. Kun osat on suunniteltu, käskyt on helppo kirjoittaa.', pic: 0 },
    ],
    try: {
      say: 'Lautta lähtee ruudusta A1 ja menee ruutuun C3. Ruudussa A3 on kari. Mikä ruutu sopii osatavoitteeksi?',
      options: ['C1', 'A3', 'B2'],
      answer: 0,
      explain: 'Ruudusta A1 pääsee suoraan oikealle ruutuun C1 ja siitä suoraan alas ruutuun C3. Kummallakaan osalla ei ole karia.',
      why: [null, 'Ruudussa A3 on kari, joten sinne ei voi ajaa.', 'Ruutu B2 on vinosti ruudusta A1, joten sinne ei pääse suoraan.'],
    },
  },
  'M-PROG-06': {
    beats: [
      { text: 'Suunnitelmassa on kaksi vaihetta. Ensin kuljetaan kaksi ruutua laiturille B4, sitten käännytään vasemmalle ja kuljetaan kaksi ruutua.', pic: 0 },
      { text: 'Lohko on käskykortti, joka tekee yhden asian. Kahden ruudun matkaan tarvitaan siksi kaksi Eteen-lohkoa.', pic: 0 },
      { text: 'Ohjelmaksi tulee Eteen, Eteen, Vasemmalle, Eteen, Eteen. Lohkot ovat samassa järjestyksessä kuin suunnitelman vaiheet.', more: 'Eteen siirtää lauttaa, Vasemmalle ja Oikealle kääntävät keulaa, ja Odota pitää lautan paikallaan.', pic: 0 },
    ],
    try: {
      say: 'Suunnitelma: odota lähtölupaa, käänny oikealle ja kulje yksi ruutu. Mikä lohkojono toteuttaa sen?',
      options: ['Odota, Oikealle, Eteen', 'Oikealle, Eteen', 'Odota, Eteen, Oikealle'],
      answer: 0,
      explain: 'Jokainen vaihe tulee lohkoiksi samassa järjestyksessä: ensin odotus, sitten käännös ja lopuksi yksi Eteen.',
      why: [null, 'Odotus on myös osa suunnitelmaa, joten Odota-lohko tarvitaan.', 'Järjestys ratkaisee: lautan pitää kääntyä ennen kuin se liikkuu.'],
    },
  },
  'M-PROG-07': {
    beats: [
      { text: 'Ensimmäisessä työvuorossa lautta lähtee ruudusta B2 keula etelään. Ohjelma Eteen, Eteen, Vasemmalle, Eteen, Eteen vie sen laiturin B4 kautta ruutuun D4.', pic: 0 },
      { text: 'Toisessa vuorossa lautta lähtee samasta ruudusta keula itään. Nyt ensimmäinen Eteen osuisi kariin C2, ja lautta pysähtyisi.', pic: 0 },
      { text: 'Testaaminen tarkoittaa, että ohjelma ajetaan jokaisesta lähtötilanteesta. Toisen vuoron ohjelman alkuun lisätään Oikealle, ja se testataan uudelleen.', pic: 0 },
    ],
    try: {
      say: 'Lautta lähtee keula itään, mutta ohjelma on tehty etelään katsovalle lautalle. Minkä lohkon voi lisätä alkuun?',
      options: ['Oikealle', 'Vasemmalle', 'Eteen'],
      answer: 0,
      explain: 'Itään katsova lautta kääntyy Oikealle-lohkolla etelään. Sen jälkeen vanha ohjelma toimii kuten ensimmäisessä vuorossa.',
      why: [null, 'Vasemmalle kääntäisi itään katsovan lautan pohjoiseen.', 'Eteen ei käännä keulaa, joten lautta lähtisi yhä itään.'],
    },
  },
};
