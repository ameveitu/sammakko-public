import type { PageText } from '../text';

/** UM-11 Kasvihuoneen säännöt: dependence, the function concept and its representations, sequences and parabolas. */
export const TEXT: Record<string, PageText> = {
  'M79-DEP-01': {
    beats: [
      { text: 'Ämpäriin valuu 4 litraa vettä minuutissa. Kun aika kuluu, vesimäärä kasvaa: vesimäärä riippuu ajasta.', more: 'Kahden minuutin kuluttua ämpärissä on 8 litraa ja viiden minuutin kuluttua 20 litraa.', pic: 0 },
      { text: 'Samaan aikaan kattilan vesi kiehuu 100 °C:ssa, oli mikä viikonpäivä tahansa. Kiehumislämpötila ei riipu viikonpäivästä.', more: 'Lukema 100 °C koskee puhdasta vettä tavallisessa ilmanpaineessa.', pic: 0 },
      { text: 'Jos hana suljetaan hetkeksi, vesimäärä pysyy tauon ajan samana, mutta riippuvuus ei katoa. Yhtäaikainen muutos ei myöskään yksin todista, että toinen aiheuttaa toisen.', pic: 1, figure: false },
    ],
    try: 'auto',
  },
  'M79-FUNC-01': {
    beats: [
      { text: 'Kone laskee x · 2 + 1. Syötteet 3, 0, 5 ja 3 antavat arvot 7, 1, 11 ja 7: sama syöte 3 antaa molemmilla kerroilla saman arvon.', pic: 0 },
      { text: 'Toinen kone antaa syötteelle 2 ensin arvon 4 ja myöhemmin arvon 5. Kun yksi syöte antaa kaksi eri arvoa, kone ei ole funktio.', pic: 1 },
      { text: 'Funktiossa jokaiselle sallitulle syötteelle kuuluu täsmälleen yksi arvo. Merkintä f(x) = 2x + 1 kertoo säännön, ja f(3) = 2 · 3 + 1 = 7.', more: 'Eri syötteet saavat antaa saman arvon. Esimerkiksi syötteet 0, 1 ja 2 voivat kaikki antaa arvon 2.', pic: 2, figure: false },
    ],
    try: 'auto',
  },
  'M79-FUNC-TABLE': {
    beats: [
      { text: 'Sääntö on y = 2x + 1. Kun x = 0, 1, 2, 3 ja 4, saadaan y = 1, 3, 5, 7 ja 9, ja jokainen pari kirjataan taulukkoon omalle rivilleen.', pic: 0 },
      { text: 'Sama toimii negatiivisilla luvuilla. Säännöllä y = 3x − 2 saadaan x = −1 → y = −5, x = 0 → y = −2, x = 1 → y = 1 ja x = 2 → y = 4.', pic: 1 },
      { text: 'Taulukosta näkee säännön: kun x kasvaa yhdellä, y kasvaa kertoimen verran. Rivillä x = 0 näkyy vakio, esimerkiksi säännössä y = 3x − 2 se on −2.', pic: 1 },
    ],
    try: 'auto',
  },
  'M79-SEQ-STRUCTURE': {
    beats: [
      { text: 'Kasvihuoneen seinään lisätään ikkunaryhmiä vaiheittain, ja ikkunoita on vaiheissa 8, 11, 14 ja 17. Lukujonon rakennetta tutkitaan katsomalla, miten luku muuttuu seuraavaan.', pic: 0, figure: false },
      { example: 'Mikä luku tulee luvun 17 jälkeen?', text: 'Peräkkäisten lukujen erotus on aina 3: 11 − 8 = 3, 14 − 11 = 3 ja 17 − 14 = 3. Seuraava luku on 17 + 3 = 20.', pic: 0, figure: false },
      { text: 'Jonossa voi myös kertoa joka kerta samalla luvulla. Jonossa 2, 6, 18, 54 jokainen luku on 3 kertaa edellinen, joten erotukset kasvavat.', more: 'Tarkista ensin erotukset. Jos ne eivät pysy samoina, kokeile jakaa luku edellisellä.', pic: 0, figure: false },
    ],
    try: 'auto',
  },
  'M79-SEQ-RULE': {
    beats: [
      { text: 'Seinän ikkunamäärät etenevät vaiheittain: 8, 11, 14 ja 17. Sääntö kertoo, miten jonon jokainen luku saadaan.', pic: 0, figure: false },
      { example: 'Mikä on jonon sääntö, ja mikä luku tulee seuraavaksi?', text: 'Sääntö on ”lisää edelliseen 3”, koska jokainen luku on 3 suurempi kuin edellinen. Seuraava luku on 17 + 3 = 20.', pic: 0, figure: false },
      { text: 'Sääntö voi olla myös ”kerro edellinen samalla luvulla”. Jonossa 3, 6, 12, 24 jokainen luku on 2 kertaa edellinen, joten seuraava on 24 · 2 = 48.', more: 'Säännön voi kirjoittaa myös järjestysnumeron avulla. Jonossa 8, 11, 14, 17 n:s luku on 3n + 5: esimerkiksi 4. luku on 3 · 4 + 5 = 17.', pic: 0, figure: false },
    ],
    try: 'auto',
  },
  'M79-SEQ-01': {
    beats: [
      { text: 'Loikka ja Aava lisäävät seinään ikkunaryhmiä, ja ikkunoita on vaiheissa 8, 11, 14 ja 17. Lukujono on lukujen sarja, joka etenee saman säännön mukaan.', pic: 0, figure: false },
      { example: 'Mikä luku tulee seuraavaksi?', text: 'Jokainen luku on 3 suurempi kuin edellinen. Seuraava luku on 17 + 3 = 20.', pic: 0, figure: false },
      { text: 'Sääntö tarkistetaan kaikista luvuista, ei vain kahdesta ensimmäisestä. Jonossa 1, 2, 4, 8 erotukset kasvavat, mutta jokainen luku on 2 kertaa edellinen.', more: 'Kertovassa jonossa luvut kasvavat nopeasti: jonon 1, 2, 4, 8 kymmenes luku on jo 512.', pic: 0, figure: false },
    ],
    try: 'auto',
  },
  'M79-FUNC-GRAPH': {
    beats: [
      { text: 'Funktion y = 2x − 1 taulukosta saadaan pisteet (−1, −3), (0, −1), (1, 1) ja (2, 3). Piste merkitään kulkemalla ensin x-akselia pitkin kohtaan x ja sitten ylös tai alas y:n verran.', more: 'Pisteiden läpi piirretään suora. Suora on funktion kuvaaja.', pic: 0 },
      { text: 'Funktiolla y = −x + 2 pisteet ovat (−1, 3), (0, 2), (1, 1), (2, 0) ja (3, −1). Kun x kasvaa, y pienenee, ja kuvaaja on laskeva suora.', pic: 1 },
      { text: 'Kuvaajalta luetaan y:n arvo kulkemalla x-akselilla kohtaan x ja siitä suoraan kuvaajalle. Suoralta y = 2x − 1 luetaan kohdassa x = 2 arvo y = 3.', pic: 0 },
    ],
    try: 'auto',
  },
  'M79-GRAPH-MONO': {
    beats: [
      { text: 'Kuvaaja näyttää vedenpinnan poikkeaman vertailutasosta. Ajan 1 h kohdalla poikkeama on 0 cm, 3 h kohdalla 1 cm, 4 h ja 5 h kohdalla 2 cm ja 6 h kohdalla taas 0 cm.', pic: 0 },
      { example: 'Mitä pinnalle tapahtuu aikavälillä 1–4 h?', text: 'Pinta nousee, koska kuvaaja kulkee vasemmalta oikealle ylöspäin. Välillä 4–5 h se pysyy samalla korkeudella ja välillä 5–6 h laskee.', pic: 0 },
      { text: 'Nousu ja lasku kertovat muutoksen suunnan, nollaan vertaaminen vain korkeuden. Jos pinta muuttuu −2 cm:stä −1 cm:iin, se nousee, vaikka on yhä nollan alapuolella.', pic: 0 },
    ],
    try: {
      say: 'Ajan 2 h kohdalla pinta on 3 cm vertailutason yläpuolella ja 4 h kohdalla enää 1 cm. Mitä pinnalle tapahtuu välillä?',
      options: ['Se laskee.', 'Se nousee.', 'Se pysyy samalla korkeudella.'],
      answer: 0,
      explain: 'Poikkeama pienenee 3 cm:stä 1 cm:iin, joten pinta laskee. Se on yhä vertailutason yläpuolella, mutta suunta on alaspäin.',
      why: [null, 'Pinta on nollan yläpuolella, mutta 1 cm on vähemmän kuin 3 cm. Korkeus ja suunta ovat eri asioita.', 'Poikkeama muuttui 3 cm:stä 1 cm:iin, joten pinta ei pysynyt samana.'],
    },
  },
  'M79-PARABOLA': {
    beats: [
      { text: 'Kuvassa on kolme kuvaajaa: ylin ja alin ovat kaaria, keskimmäinen on suora. Kaaret näyttävät samantapaisilta, sillä molemmat laskevat, kääntyvät ja nousevat.', pic: 0 },
      { example: 'Kumpi kaarista on paraabeli y = (x − 2)² − 2?', text: 'Lasketaan yksi piste: kun x = 1, y = (1 − 2)² − 2 = 1 − 2 = −1. Alin kaari kulkee pisteen (1, −1) kautta, ylin kulkee siinä selvästi alempana.', pic: 0 },
      { text: 'Paraabeli y = (x − 2)² − 2 kääntyy kohdassa x = 2, jossa y = −2. Kaari on symmetrinen: esimerkiksi kohdissa x = 1 ja x = 3 korkeus on sama, −1.', more: 'Samannäköinen kaari voi noudattaa eri sääntöä. Siksi kuvaaja tunnistetaan laskemalla ja tarkistamalla pisteitä, ei pelkän muodon perusteella.', pic: 0 },
    ],
    try: {
      say: 'Mikä pisteistä on paraabelilla y = (x − 2)² − 2?',
      options: ['(4, 2)', '(4, 4)', '(4, −2)'],
      answer: 0,
      explain: 'Sijoitetaan x = 4: (4 − 2)² − 2 = 2² − 2 = 4 − 2 = 2. Piste (4, 2) on paraabelilla.',
      why: [null, 'Lopusta puuttuu − 2: (4 − 2)² − 2 = 4 − 2 = 2.', 'Korkeus −2 on kääntymiskohdassa x = 2, ei kohdassa x = 4.'],
    },
  },
  'M79-PARABOLA-GRAPH': {
    beats: [
      { text: 'Loikka mittasi ikkunan kaaresta viisi kohtaa: kun x = 0, 1, 2, 3 ja 4, korkeus y on 2, −1, −2, −1 ja 2. Pisteet merkitään koordinaatistoon ja yhdistetään kaarella.', pic: 0 },
      { example: 'Missä kohdassa x kaari kääntyy ylöspäin?', text: 'Kaari kääntyy kohdassa x = 2, jossa korkeus on −2. Sen molemmin puolin korkeudet toistuvat: x = 1 ja x = 3 antavat −1, x = 0 ja x = 4 antavat 2.', pic: 0 },
      { text: 'Paraabeli on symmetrinen kääntymiskohdan kautta kulkevan pystysuoran suoran suhteen. Siksi puuttuvan pisteen voi päätellä peilaamalla.', more: 'Pisteet yhdistetään kaarella eikä suorilla viivoilla, koska paraabeli kaartuu tasaisesti.', pic: 0 },
    ],
    try: 'auto',
  },
};
