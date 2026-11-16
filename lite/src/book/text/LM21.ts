import type { PageText } from '../text';

/** LM21 Vaihtoehtojen tuuliluoto: smallest and largest value, mode, mean and the first ideas of probability. */
export const TEXT: Record<string, PageText> = {
  'M-STAT-03': {
    beats: [
      { text: 'Viidessä rasiassa on 3, 2, 5, 2 ja 3 helmeä. Luvut 2 ja 3 esiintyvät kahdesti, luku 5 vain kerran.', pic: 0 },
      { text: 'Useimmin esiintyvä arvo on tyyppiarvo. Tässä tyyppiarvoja on kaksi: 2 ja 3.', pic: 0 },
      { text: 'Jos jokainen arvo esiintyy yhtä monta kertaa, tyyppiarvoa ei merkitä. Esimerkiksi aineistossa 1, 4, 6 jokainen luku on vain kerran.', pic: null },
    ],
    try: {
      say: 'Aineisto on 2, 8, 2, 5 ja 9. Mikä on tyyppiarvo?',
      options: ['2', '5', '9'],
      answer: 0,
      explain: 'Luku 2 esiintyy kahdesti, muut vain kerran. Siksi 2 on tyyppiarvo.',
      why: [null, 'Luku 5 on järjestyksessä keskimmäinen, mutta se esiintyy vain kerran.', 'Luku 9 on suurin, mutta se esiintyy vain kerran.'],
    },
  },
  'M-STAT-04': {
    beats: [
      { text: 'Kolmessa sarakkeessa on 1, 4 ja 7 palikkaa. Yhteensä niitä on 12.', pic: 0 },
      { text: 'Siirretään kolme palikkaa korkeimmasta sarakkeesta matalimpaan. Nyt jokaisessa on 4: se on tasattu arvo eli keskiarvo.', more: 'Palikoita on yhä 12 ja sarakkeita 3, joten 12 : 3 = 4. Alkuperäiset luvut 1, 4 ja 7 eivät muutu, ne vain tasataan.', pic: 1 },
      { text: 'Nauhat ovat 10 cm ja 15 cm pitkiä. Kun pidemmästä siirretään 2,5 cm lyhyempään, kumpikin on 12,5 cm.', more: 'Keskiarvo voi olla luku, jota alkuperäisissä havainnoissa ei ollut lainkaan.', pic: 2 },
    ],
    try: {
      say: 'Sarakkeissa on 2, 3 ja 7 palikkaa. Montako palikkaa jokaisessa on, kun ne tasataan?',
      options: ['4', '7', '12'],
      answer: 0,
      explain: 'Palikoita on 2 + 3 + 7 = 12 ja sarakkeita 3. Tasattuna jokaisessa on 12 : 3 = 4.',
      why: [null, '7 on korkein sarake. Tasatessa siitä siirretään palikoita matalampiin.', '12 on kaikkien palikoiden määrä. Ne jaetaan kolmeen sarakkeeseen.'],
    },
  },
  'M-PROB-01': {
    beats: [
      { text: 'Pussissa on kaksi punaista merkkiä, ja yksi nostetaan katsomatta. Sinistä ei voi saada, joten sininen on mahdoton.', more: 'Loikan toive ei muuta sitä, mitä pussissa on.', pic: 0 },
      { text: 'Pussissa on vain punaisia merkkejä, joten jokainen nosto antaa punaisen. Siksi "punainen tai sininen" on varma: varma tapahtuma toteutuu jokaisella nostolla.', pic: 0 },
      { text: 'Mahdollinen tapahtuma toteutuu joillakin nostoilla, mutta ei kaikilla. Jos pussissa olisi punainen ja sininen, sininen olisi mahdollinen.', pic: null },
    ],
    try: {
      say: 'Pussissa on 3 sinistä ja 1 punainen merkki. Yksi nostetaan katsomatta. Millainen tapahtuma on "saadaan sininen"?',
      options: ['Mahdollinen, mutta ei varma', 'Varma', 'Mahdoton'],
      answer: 0,
      explain: 'Sininen tulee useimmilla nostoilla, mutta punainenkin voi tulla. Siksi sininen on mahdollinen, mutta ei varma.',
      why: [null, 'Punainen merkki voi tulla, joten sininen ei ole varma.', 'Pussissa on sinisiä, joten sininen voi tulla.'],
    },
  },
  'M-PROB-02': {
    beats: [
      { text: 'Viestiin valitaan paikka, Laituri tai Poukama, ja merkki, Sumu tai Kirkas. Kaikki yhdistelmät luetellaan järjestyksessä.', pic: 0 },
      { text: 'Laiturin kanssa käy kaksi merkkiä ja Poukaman kanssa samat kaksi. Yhdistelmiä on 2 × 2 = 4.', more: 'Kun ensimmäinen valinta pidetään samana ja käydään toiset läpi, mikään yhdistelmä ei jää pois eikä tule kahdesti.', pic: 0 },
    ],
    try: {
      say: 'Retkelle valitaan yksi kolmesta eväästä ja yksi kahdesta juomasta. Montako erilaista yhdistelmää on?',
      options: ['6', '5', '3'],
      answer: 0,
      explain: 'Jokaisen kolmen eväänkin kanssa voi valita kaksi juomaa: 3 × 2 = 6 yhdistelmää.',
      why: [null, '3 + 2 = 5 laskee vain vaihtoehdot, ei yhdistelmiä.', 'Jokaisen eväänkin kanssa käy kaksi eri juomaa.'],
    },
  },
  'M-PROB-03': {
    beats: [
      { text: 'Pussissa on kaksi punaista, vihreä ja keltainen merkki. Mahdollisia tuloksia on 4, sillä kumpikin punainen on oma tuloksensa.', pic: 0 },
      { text: 'Toivottu merkki on sininen. Tulokset, joissa toive toteutuu, ovat suotuisia: tässä niitä on 0, koska sinisiä ei ole.', pic: 0 },
      { text: 'Jos toivottaisiin punaista, suotuisia tuloksia olisi 2 kaikista 4:stä.', pic: 0 },
    ],
    try: {
      say: 'Pussissa on 3 sinistä ja 2 punaista merkkiä. Toivotaan sinistä. Montako suotuisaa tulosta on?',
      options: ['3', '5', '1'],
      answer: 0,
      explain: 'Jokainen sininen merkki on oma suotuisa tuloksensa: niitä on 3 kaikista 5:stä.',
      why: [null, '5 on kaikkien tulosten määrä. Suotuisia ovat vain siniset.', 'Siniset näyttävät samalta, mutta jokainen niistä on oma tuloksensa.'],
    },
  },
  'M-PROB-04': {
    beats: [
      { text: 'Pussissa A on 4 merkkiä, joista 2 sinistä: puolet. Pussissa B on 6 merkkiä, joista 4 sinistä: yli puolet.', pic: 0 },
      { text: 'Sinisten osuus on suurempi pussissa B, joten sieltä saa sinisen todennäköisemmin. Yksi nosto voi silti olla punainen.', more: 'Pelkkä sinisten määrä ei ratkaise. Sitä verrataan pussin kaikkiin merkkeihin.', pic: 0 },
    ],
    try: {
      say: 'Pussissa A on 2 sinistä ja 2 punaista. Pussissa B on 3 sinistä ja 6 punaista. Kummasta saa sinisen todennäköisemmin?',
      options: ['Pussista A', 'Pussista B', 'Yhtä todennäköisesti'],
      answer: 0,
      explain: 'Pussissa A puolet merkeistä on sinisiä, pussissa B vain kolmasosa. Osuus ratkaisee, ei pelkkä sinisten määrä.',
      why: [null, 'B:ssä on enemmän sinisiä, mutta myös paljon punaisia: sinisiä on vain 3 kaikista 9:stä.', 'Osuudet ovat eri: A:ssa puolet sinisiä, B:ssä kolmasosa.'],
    },
  },
  'M-PROB-06': {
    beats: [
      { text: 'Pussissa on kaksi sinistä ja yksi vihreä merkki. Tapahtuma on: saadaan sininen.', pic: 0 },
      { text: 'Vastatapahtuma on: ei saada sinistä. Siihen kuuluu vain vihreä merkki.', pic: 0 },
      { text: 'Yhdessä ne kattavat koko pussin, ja jokainen merkki kuuluu vain toiseen. Tässä 2 + 1 = 3 merkkiä.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-PROB-05': {
    beats: [
      { text: 'Kolmesta pussista halutaan sininen merkki. Jokaisesta lasketaan, kuinka suuri osa merkeistä on sinisiä.', pic: 0 },
      { text: 'Pussissa A sinisiä on 1/4, pussissa B 4/5 ja pussissa C 3/6 eli puolet. Suurin osuus on pussissa B.', pic: 0 },
      { text: 'Paras valinta on siis pussi B. Yksi nosto voi silti tuoda punaisen: todennäköisin ei ole varma.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-STAT-05': {
    beats: [
      { text: 'Neljässä astiassa on 4, 6, 2 ja 8 litraa vettä. Yhteensä vettä on 20 litraa.', pic: 0 },
      { text: 'Keskiarvo saadaan, kun yhteismäärä jaetaan astioiden määrällä: 20 : 4 = 5 litraa. Niin paljon jokaisessa olisi, jos vesi tasattaisiin.', more: 'Merkintä 20/4 tarkoittaa samaa kuin 20 : 4.', pic: 0 },
      { text: 'Keskiarvo voi olla murtoluku. Jos vettä olisi 15 litraa neljässä astiassa, keskiarvo olisi 15/4 eli 3,75 litraa.', pic: null },
    ],
    try: {
      say: 'Kolmessa astiassa on 2, 3 ja 7 litraa vettä. Mikä on keskiarvo?',
      options: ['4 litraa', '12 litraa', '3 litraa'],
      answer: 0,
      explain: 'Yhteensä vettä on 2 + 3 + 7 = 12 litraa. Kolmeen astiaan tasattuna 12 : 3 = 4 litraa.',
      why: [null, '12 litraa on yhteismäärä. Se pitää vielä jakaa astioiden määrällä.', '3 litraa on järjestyksessä keskimmäinen luku, ei keskiarvo.'],
    },
  },
  'M-STAT-01': {
    beats: [
      { text: 'Taulukossa on neljän paikan lämpötilat samalta hetkeltä. Kylmin lukema on aineiston pienin arvo.', pic: 0 },
      { text: 'Pakkasluvuista pienin on se, joka on kauimpana nollasta: −4 on pienempi kuin −1. Pienin arvo on siis −4 °C.', pic: 0 },
      { text: 'Sama pienin arvo voi löytyä monesta paikasta. Tässä −4 °C mitattiin sekä Poukamassa että Ruovikossa.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-STAT-02': {
    beats: [
      { text: 'Lämpimin paikka on se, jonka lukema on suurin. Pakkasluvut −3 ja −1 ovat pienempiä kuin nolla, joten suurin arvo on 2 °C.', pic: 0 },
      { text: 'Lukema 2 °C on sekä Laiturilla että Kalliolla. Kaikki paikat, joissa suurin arvo esiintyy, merkitään.', pic: 0 },
    ],
    try: 'auto',
  },
};
