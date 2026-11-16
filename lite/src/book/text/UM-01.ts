import type { PageText } from '../text';

/** UM-01 Vihjeiden neuvosto: logical reasoning, mathematical language, justification and systematic listing. */
export const TEXT: Record<string, PageText> = {
  'M79-LOGIC-01': {
    beats: [
      { text: 'Kone muuttaa luvun 2 luvuksi 5, luvun 4 luvuksi 9 ja luvun 5 luvuksi 11. Sääntö x + 3 toimii ensimmäiselle parille, mutta 4 + 3 = 7 eikä 9.', more: 'Sääntö 2x + 1 toimii kaikille: 2 · 2 + 1 = 5, 2 · 4 + 1 = 9 ja 2 · 5 + 1 = 11.', pic: 0 },
      { text: 'Toinen kone: 1 → 1, 3 → 7 ja 4 → 10. Sääntö 2x − 1 sopii ensimmäiseen pariin, mutta 2 · 3 − 1 = 5 eikä 7.', more: 'Sääntö 3x − 2 sopii kaikkiin pareihin: 3 · 1 − 2 = 1, 3 · 3 − 2 = 7 ja 3 · 4 − 2 = 10.', pic: 1 },
      { text: 'Yksi sopiva pari ei vielä todista sääntöä. Sääntö hyväksytään vasta, kun se on testattu jokaisella parilla.', pic: 2, figure: false },
    ],
    try: {
      say: 'Kone muuttaa luvun 1 luvuksi 4, luvun 2 luvuksi 7 ja luvun 5 luvuksi 16. Mikä sääntö sopii kaikkiin pareihin?',
      options: ['3x + 1', 'x + 3', '4x'],
      answer: 0,
      explain: 'Testataan jokainen pari: 3 · 1 + 1 = 4, 3 · 2 + 1 = 7 ja 3 · 5 + 1 = 16. Sääntö 3x + 1 sopii kaikkiin.',
      why: [null, 'Sopii pariin 1 → 4, mutta 2 + 3 = 5 eikä 7.', 'Sopii pariin 1 → 4, mutta 4 · 2 = 8 eikä 7.'],
    },
  },
  'M79-COMB-01': {
    beats: [
      { text: 'Juhlapöytään pääsee kahta reittiä, ja reitin jälkeen valitaan yksi kolmesta laiturista. Montako eri yhdistelmää on?', pic: 0, figure: false },
      { text: 'Käydään reitit läpi yksi kerrallaan. Reitti 1 yhdistetään laitureihin 1, 2 ja 3, ja sitten reitti 2 samoihin kolmeen laituriin.', pic: 0, figure: false },
      { text: 'Yhdistelmiä on 2 · 3 = 6, ja jokainen on luettelossa tasan kerran. Järjestelmällinen luettelo näyttää, ettei mitään puutu eikä mikään toistu.', more: 'Pelkkä oikea luku 6 ei vielä osoita, että kaikki vaihtoehdot on löydetty. Luettelon rivit saavat silti olla missä järjestyksessä tahansa.', pic: 0, figure: false },
    ],
    try: {
      say: 'Jäätelöön valitaan yksi kolmesta mausta ja yksi kahdesta kastikkeesta. Montako eri yhdistelmää on?',
      options: ['6', '5', '3'],
      answer: 0,
      explain: 'Jokaiseen kolmeen makuun voi liittää kumman tahansa kahdesta kastikkeesta: 3 · 2 = 6 yhdistelmää.',
      why: [null, 'Tässä vaihtoehdot on laskettu yhteen. Jokainen maku yhdistyy jokaiseen kastikkeeseen, joten kerrotaan.', 'Tässä on laskettu vain maut. Jokaiseen makuun voi valita kaksi kastiketta.'],
    },
  },
  'M79-ARG-01': {
    beats: [
      { text: 'Laattojen pituudet ovat 14, 16, 18, 20 ja 22 cm, eikä muita laattoja ole. Väite kuuluu: ”Kaikkien laattojen pituus on parillinen luku.”', pic: 0, figure: false },
      { text: 'Kaikkia koskeva väite perustellaan tarkistamalla jokainen tapaus. Kaikki viisi pituutta ovat parillisia, joten väite on tosi.', pic: 0, figure: false },
      { text: 'Väitteen ”Kaikki laatat ovat yli 15 cm” kumoaa yksi vastaesimerkki: 14 cm:n laatta. Yksi vastaesimerkki riittää osoittamaan kaikki-väitteen epätodeksi.', more: 'Jos pituus on jaollinen 4:llä, se on parillinen. Käänteinen väite ei päde: 14 on parillinen, mutta se ei ole jaollinen 4:llä.', pic: 0, figure: false },
    ],
    try: {
      say: 'Laattojen pituudet ovat 14, 16, 18, 20 ja 22 cm. Mikä perustelee parhaiten väitteen ”Kaikki laatat ovat alle 25 cm”?',
      options: ['Jokainen viidestä pituudesta on alle 25 cm.', 'Laatta 1 on 14 cm, joten väite pätee.', 'Useimmat laatat ovat alle 25 cm.'],
      answer: 0,
      explain: 'Kaikkia koskeva väite on tosi vasta, kun jokainen tapaus täyttää sen. Tässä kaikki viisi pituutta ovat alle 25 cm.',
      why: [null, 'Yksi sopiva tapaus ei riitä: myös muut laatat pitää tarkistaa.', '”Useimmat” ei riitä, kun väite koskee kaikkia laattoja.'],
    },
  },
  'M79-TEXT-01': {
    beats: [
      { text: 'Pullopostissa kerrotaan, että korissa on 9 köyttä ja toisessa korissa pitää olla vähintään 14 köyttä. Kysymys kuuluu: montako köyttä toiseen koriin tarvitaan?', pic: 0, figure: false },
      { text: 'Annettu tieto on, että ensimmäisessä korissa on 9 köyttä, ja kysytty on toisen korin köysien määrä. Ehto ”vähintään 14” kertoo, mitä vastauksen pitää täyttää.', pic: 0, figure: false },
      { example: 'Montako köyttä toiseen koriin tarvitaan?', text: 'Ehdon mukaan toiseen koriin tarvitaan vähintään 14 köyttä. Luku 9 koskee ensimmäistä koria, joten sitä ei tarvita vastaukseen.', more: 'Kaikkia tehtävän lukuja ei aina käytetä. ”Vähintään 14” tarkoittaa 14 tai enemmän.', pic: 0, figure: false },
    ],
    try: {
      say: 'Veneessä on 6 airoa. Toisessa veneessä pitää olla vähintään 4 airoa. Montako airoa toiseen veneeseen tarvitaan vähintään?',
      options: ['4 airoa', '10 airoa', '2 airoa'],
      answer: 0,
      explain: 'Kysymys koskee toista venettä, ja ehto sanoo suoraan: vähintään 4. Ensimmäisen veneen 6 airoa eivät vaikuta vastaukseen.',
      why: [null, 'Tässä on laskettu molempien veneiden airot yhteen. Kysymys koskee vain toista venettä.', 'Tässä on laskettu erotus 6 − 4. Ehto ei pyydä vertaamaan veneitä.'],
    },
  },
  'M79-TEXT-02': {
    beats: [
      { text: 'Seuraavalle retkelle jätetään viesti tarvikkeiden määrästä. Ryhmiä on 5, ja jokainen ryhmä tarvitsee 7 kappaletta.', pic: 0, figure: false },
      { text: 'Hyvä matemaattinen viesti kertoo, mistä luvut tulevat, mitä laskettiin ja mikä vastaus on yksikköineen. Silloin lukija voi tarkistaa laskun itse.', pic: 0, figure: false },
      { example: 'Miten viesti kirjoitetaan?', text: '”Ryhmiä on 5, ja kukin tarvitsee 7 kpl. 5 · 7 = 35, joten yhteensä tarvitaan 35 kpl.”', more: 'Pelkkä ”35” ei riitä viestiksi, koska lukija ei tiedä, mitä luku tarkoittaa.', pic: 0, figure: false },
    ],
    try: {
      say: 'Mikä viesti kertoo seuraavalle retkelle selvimmin, paljonko köyttä tarvitaan?',
      options: ['Ryhmiä on 4, kukin tarvitsee 3 m köyttä: 4 · 3 m = 12 m.', '12', '4 · 3 = 12'],
      answer: 0,
      explain: 'Selkeä viesti kertoo, mistä luvut tulevat, laskun ja vastauksen yksikköineen. Silloin lukija ymmärtää sen ja voi tarkistaa sen.',
      why: [null, 'Pelkästä luvusta ei näe, mitä se tarkoittaa tai mistä se tuli.', 'Lasku on oikein, mutta siitä puuttuvat selitys ja yksikkö.'],
    },
  },
  'M79-TRUTH-01': {
    beats: [
      { text: 'Merkkikivissä ovat luvut 7, 10 ja 6, eikä muita kiviä ole. Väite on lause, joka on joko tosi tai epätosi.', pic: 0, figure: false },
      { example: 'Onko väite ”Kaikki kivien luvut ovat suurempia kuin 6” tosi?', text: 'Väite on epätosi, koska kolmannessa kivessä on luku 6, joka ei ole suurempi kuin 6. Yksi vastaesimerkki riittää kumoamaan kaikki-väitteen.', pic: 0, figure: false },
      { text: 'Kysymys ”Onko jossakin kivessä luku 8?” ei ole väite, eikä sillä ole totuusarvoa. Lause ”Jossakin kivessä on parillinen luku” on väite, ja se on tosi.', more: 'Jokin-väitteen todistamiseen riittää yksi esimerkki, tässä luku 10. Kaikki-väite vaatii, että jokainen tapaus tarkistetaan.', pic: 0, figure: false },
    ],
    try: {
      say: 'Kivissä ovat luvut 7, 10 ja 6. Onko väite ”Kaikki luvut ovat parittomia” tosi?',
      options: ['Epätosi, koska 10 on parillinen.', 'Tosi, koska 7 on pariton.', 'Sillä ei ole totuusarvoa.'],
      answer: 0,
      explain: 'Kaikki-väitteen kumoaa yksi vastaesimerkki. Luku 10 ei ole pariton, joten väite on epätosi.',
      why: [null, 'Yksi sopiva luku ei riitä, kun väite koskee kaikkia lukuja.', 'Lause on väite eikä kysymys, joten se on joko tosi tai epätosi.'],
    },
  },
  'M79-LOGIC-02': {
    beats: [
      { text: 'Majakan lyhtyjen määrä riippuu luvusta x, joka on kokonaisluku 0–9. Jokaista x:n yksikköä kohti tulee 4 lyhtyä, ja lisäksi tulee aina 4 lyhtyä.', pic: 0, figure: false },
      { text: 'Sanallinen sääntö kirjoitetaan täsmällisesti kaavaksi y = 4x + 4. Kaava kertoo lyhtyjen määrän y jokaisella x:n arvolla.', pic: 0, figure: false },
      { example: 'Montako lyhtyä tulee, kun x = 7?', text: 'Sijoitetaan x = 7 kaavaan: y = 4 · 7 + 4 = 32. Lyhtyjä tulee 32.', more: 'Täsmällinen sääntö kertoo myös, mille x:n arvoille se pätee: tässä kokonaisluvuille 0–9. Muutama sopiva esimerkki ei yksin riitä säännöksi.', pic: 0, figure: false },
    ],
    try: {
      say: 'Jokaista pöytää kohti tarvitaan 6 tuolia, ja lisäksi 2 tuolia päätyihin. Mikä kaava kertoo tuolien määrän y, kun pöytiä on x?',
      options: ['y = 6x + 2', 'y = 2x + 6', 'y = 8x'],
      answer: 0,
      explain: 'Jokainen pöytä tuo 6 tuolia, joten 6x. Päätyjen 2 tuolia tulevat vain kerran, joten lisätään 2: y = 6x + 2.',
      why: [null, 'Tässä pöytäkohtainen määrä ja lisäys ovat vaihtaneet paikkaa.', 'Tässä 2 lisätuolia lasketaan jokaiselle pöydälle, vaikka ne tulevat vain kerran.'],
    },
  },
  'M79-PROOF-01': {
    beats: [
      { text: 'Tavoite on osoittaa, että silta yltää aukon yli ja kantaa korin. Tiedetään, että lauta on 9 m ja aukko 7 m, tuki kantaa 7 kg ja kori painaa 5 kg.', pic: 0, figure: false },
      { text: 'Perusteluketjussa jokainen vaihe nojaa tunnettuihin tietoihin. Lauta (9 m) on pidempi kuin aukko (7 m), joten se yltää yli, ja tuki (7 kg) kantaa korin (5 kg).', pic: 0, figure: false },
      { text: 'Lopuksi yhdistetään molemmat tarkistetut ehdot: silta yltää ja kantaa. Tavoitetta ei saa käyttää perusteluna, vaan se on ketjun viimeinen lenkki.', more: 'Todistus on ketju, jossa jokainen väite seuraa annetuista tiedoista tai aiemmista vaiheista. Jos yksikin lenkki puuttuu, ketju ei todista tavoitetta.', pic: 0, figure: false },
    ],
    try: {
      say: 'Miksi perustelu ”Silta kantaa, koska se on silta, joka kantaa” ei kelpaa?',
      options: ['Se käyttää tavoitetta omana perustelunaan.', 'Se on liian lyhyt.', 'Perustelussa pitää aina olla kaava.'],
      answer: 0,
      explain: 'Perustelun pitää nojata annettuihin tietoihin, kuten tuen kantavuuteen 7 kg ja korin massaan 5 kg. Tavoitetta ei voi käyttää omana todisteenaan.',
      why: [null, 'Lyhytkin perustelu kelpaa, jos se nojaa annettuihin tietoihin.', 'Perustelu voi olla sanallinen, kunhan jokainen vaihe nojaa tunnettuihin tietoihin.'],
    },
  },
};
