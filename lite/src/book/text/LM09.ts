import type { PageText } from '../text';

/** LM09 Helmisimpukan tarkkuusasema: decimals, percents and the same part as a fraction, decimal and percent. */
export const TEXT: Record<string, PageText> = {
  'M-DEC-01': {
    beats: [
      { text: 'Nauha on yksi kokonainen. Se leikataan kymmeneen yhtä suureen osaan, ja yksi osa on kymmenesosa eli 0,1.', more: 'Kun seitsemän osaa väritetään, merkki lukusuoralla siirtyy kohtaan 0,7.', pic: 0 },
      { text: 'Kymmenen kymmenesosaa täyttää koko nauhan: se on 1. Kun toisesta nauhasta väritetään vielä kolme osaa, saadaan 1,3.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-DEC-02': {
    beats: [
      { text: 'Ruudukossa on sata ruutua, ja koko ruudukko on yksi. Yksi ruutu on sadasosa eli 0,01.', pic: 0 },
      { text: 'Kolme täyttä saraketta on kolme kymmenesosaa, ja seitsemän ruutua lisää on seitsemän sadasosaa. Yhteensä 0,37.', pic: 0 },
      { text: 'Kolmessa sarakkeessa on 30 ruutua eli 30 sadasosaa. Siksi 0,3 on yhtä paljon kuin 0,30.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-DEC-03': {
    beats: [
      { text: 'Metri jaetaan kymmeneen osaan: 3 kymmenesosaa. Väli suurennetaan ja jaetaan taas kymmeneen: 7 sadasosaa.', pic: 0 },
      { text: 'Vielä kerran kymmeneen: 5 tuhannesosaa. Saadaan 0,375 metriä eli 375 millimetriä, sillä millimetri on metrin tuhannesosa.', pic: 0 },
      { text: '48 millimetriä on 0,048 metriä. Kokonaisia kymmenesosia ei tule, joten pilkun jälkeen tulee ensin nolla.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-PCT-01': {
    beats: [
      { text: 'Ikkunassa on sata yhtä suurta ruutua. Kaksi kymmenen ruudun riviä on merkitty: 20 ruutua sadasta.', pic: 0 },
      { text: 'Sadasosalla on oma merkki, prosentti %. 20 ruutua sadasta on 20 prosenttia eli 20 %.', pic: 0 },
      { text: 'Prosentti kertoo osuuden, ei tavaroiden määrää. Vaikka jokaisessa ruudussa olisi kaksi helmeä, merkitty osuus olisi silti 20 %.', pic: 0 },
    ],
    try: {
      say: 'Sadan ruudun ikkunasta on merkitty 35 ruutua. Kuinka monta prosenttia ikkunasta on merkitty?',
      options: ['35 %', '65 %', '3,5 %'],
      answer: 0,
      explain: '35 ruutua sadasta on 35 sadasosaa eli 35 %.',
      why: [null, '65 % on se osa, joka jäi merkitsemättä.', '3,5 % olisi vain kolme ja puoli ruutua sadasta.'],
    },
  },
  'M-PCT-02': {
    beats: [
      { text: 'Lähetyslapussa lukee 3/4. Koko laatta on yksi kokonainen eli 100 %, ja siitä on täytetty kolme neljäsosaa.', pic: 0 },
      { text: 'Muutetaan neljäsosat sadasosiksi: 3/4 = 75/100, koska 4 × 25 = 100. 75 sadasosaa on 75 %.', more: 'Toisin päin: 75 % = 75/100 = 3/4.', pic: 1 },
    ],
    try: {
      say: 'Lähetyslapussa lukee 1/4. Kuinka monta prosenttia se on?',
      options: ['25 %', '14 %', '4 %'],
      answer: 0,
      explain: '1/4 = 25/100, koska 4 × 25 = 100. 25 sadasosaa on 25 %.',
      why: [null, 'Numeroita ei kirjoiteta peräkkäin. Neljäsosa on 25 sadasosaa.', '4 % on vain 4 sadasosaa, paljon vähemmän kuin neljäsosa.'],
    },
  },
  'M-PCT-03': {
    beats: [
      { text: 'Viestissä lukee 0,25. Se tarkoittaa 25 sadasosaa koko laatasta, joka on 1,00 eli 100 %.', pic: 0 },
      { text: 'Sadasosa on prosentti, joten 0,25 = 25 %. Kummassakin laatassa on täytetty yhtä suuri osa.', more: 'Toisin päin: 8 % on 8 sadasosaa eli 0,08.', pic: 1 },
    ],
    try: {
      say: 'Mikä desimaaliluku on 6 %?',
      options: ['0,06', '0,6', '6,0'],
      answer: 0,
      explain: '6 % on 6 sadasosaa. Sadasosat ovat toisella paikalla pilkun jälkeen: 0,06.',
      why: [null, '0,6 on 6 kymmenesosaa eli 60 %.', '6,0 on kuusi kokonaista eli 600 %.'],
    },
  },
  'M-PCT-04': {
    beats: [
      { text: 'Varastossa A on 18 helmeä ja varastossa B 28 helmeä. Kummastakin lähtee 50 % eli puolet.', pic: 0 },
      { text: 'Puolet 18:sta on 9 ja puolet 28:sta on 14. Prosentti on sama, mutta isommasta varastosta lähtee enemmän helmiä.', pic: 1 },
      { text: 'Sama prosentti ei siis tarkoita samaa määrää. Määrä riippuu siitä, kuinka suuri kokonainen on.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-DEC-READ': {
    beats: [
      { text: 'Luvussa 3,7 pilkun edessä on kolme kokonaista, ja 7 on kymmenesosien paikalla. Luetaan: kolme kokonaista seitsemän kymmenesosaa.', more: 'Sen voi lukea myös: kolme pilkku seitsemän.', pic: 0 },
      { text: 'Luvussa 3,07 seitsemän on sadasosien paikalla. Luetaan: kolme kokonaista seitsemän sadasosaa.', pic: 1 },
      { text: 'Viimeisen numeron paikka antaa osien nimen. 2,45 luetaan: kaksi kokonaista neljäkymmentäviisi sadasosaa.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-DEC-WRITE': {
    beats: [
      { text: 'Kolme kokonaista neljä sadasosaa: 4 menee sadasosien paikalle, toiseksi pilkun jälkeen. Tyhjälle kymmenesosien paikalle tulee nolla: 3,04.', pic: 0 },
      { text: 'Kaksi kokonaista neljäkymmentäviisi sadasosaa: 5 päättyy sadasosien paikalle ja 4 tulee sen eteen. Tulos on 2,45.', pic: 1 },
      { text: 'Nolla kokonaista kaksitoista tuhannesosaa: 2 tuhannesosien paikalle ja 1 sen eteen. Kymmenesosien paikalle tulee nolla: 0,012.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-DEC-DECOMPOSE': {
    beats: [
      { text: 'Luku 4,62 puretaan osiin, ja jokainen numero putoaa omaan laatikkoonsa. 4,62 = 4 + 0,6 + 0,02.', pic: 0 },
      { text: 'Toisin päin osat 7, 0,3 ja 0,08 kootaan, ja jokainen numero lentää omalle paikalleen. Saadaan 7,38.', pic: 1 },
      { text: 'Kootaan 3 + 0,05. Kymmenesosia ei ole, joten niiden paikalle tulee nolla: 3,05.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-DEC-04': {
    beats: [
      { text: 'Kolme kokonaista ja kahdeksan sadasosaa kirjoitetaan 3,08. Siinä on 3 kokonaista, 0 kymmenesosaa ja 8 sadasosaa.', more: 'Nolla pitää kymmenesosien paikan.', pic: 0 },
      { text: 'Lukukortti 2,45, sanat "kaksi kokonaista neljäkymmentäviisi sadasosaa" ja osat 2 + 0,4 + 0,05 tarkoittavat kaikki samaa määrää.', pic: 1 },
      { text: 'Luvussa 1,007 on yksi kokonainen ja seitsemän tuhannesosaa. Kymmenesosien ja sadasosien paikoilla on nolla.', pic: 2, figure: false },
    ],
    try: {
      say: 'Mikä luku on sama kuin 5 + 0,09?',
      options: ['5,09', '5,9', '5,009'],
      answer: 0,
      explain: '0,09 on yhdeksän sadasosaa. Kymmenesosia ei ole, joten niiden paikalle tulee nolla: 5,09.',
      why: [null, '5,9 on viisi kokonaista ja yhdeksän kymmenesosaa.', '5,009 on viisi kokonaista ja yhdeksän tuhannesosaa.'],
    },
  },
  'M-PCT-05': {
    beats: [
      { text: 'Koko varasto eli 100 % on 60 helmeä. Aava varaa siitä 75 %.', pic: 0 },
      { text: '75 % on kolme neljäsosaa. 60 : 4 = 15, joten varataan 3 × 15 = 45 helmeä.', more: 'Toinen reitti: 10 % on 6 helmeä, joten 70 % on 42 ja 5 % on 3. Yhteensä 45 helmeä.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-RATREP-FRAC-PCT': {
    beats: [
      { text: 'Mittakoriin mahtuu 20 helmeä, ja täysi kori on 1 kokonainen eli 100 %. Lähetykseen varataan 5 helmeä.', pic: 0 },
      { text: 'Viisi helmeä kahdestakymmenestä on neljäsosa eli 1/4. Sadasosina se on 25/100 eli 25 %.', more: 'Murtoluku ja prosentti ovat kaksi tapaa kertoa sama osuus.', pic: 1 },
    ],
    try: {
      say: 'Mittakorissa on 20 helmeä, ja lähetykseen varataan 10. Kuinka monta prosenttia korista se on?',
      options: ['50 %', '10 %', '20 %'],
      answer: 0,
      explain: '10 helmeä 20:stä on puolet eli 1/2 = 50/100 = 50 %.',
      why: [null, '10 on helmien määrä, ei osuus sadasta.', '20 helmeä on koko kori, ja koko kori on 100 %.'],
    },
  },
  'M-RATREP-DEC-PCT': {
    beats: [
      { text: 'Mittakoriin mahtuu 20 helmeä, ja täysi kori on 1 kokonainen eli 100 %. Lähetykseen varataan 5 helmeä.', pic: 0 },
      { text: 'Viisi kahdestakymmenestä on 25 sadasosaa. Desimaalilukuna se on 0,25 ja prosentteina 25 %.', more: 'Desimaaliluvusta saa prosentit sadasosista: 0,25 on 25 sadasosaa eli 25 %.', pic: 1 },
    ],
    try: {
      say: 'Näytössä lukee 0,5. Kuinka monta prosenttia se on?',
      options: ['50 %', '5 %', '0,5 %'],
      answer: 0,
      explain: '0,5 = 0,50 eli 50 sadasosaa. Se on 50 % eli puolet.',
      why: [null, '5 % olisi 0,05 eli viisi sadasosaa.', '0,5 % on alle sadasosan, paljon vähemmän kuin puolet.'],
    },
  },
  'M-DEC-05': {
    beats: [
      { text: 'Varaus A on 0,8 ja varaus B on 0,75. Lyhyempi luku ei ole pienempi: A:n palkki on pidempi.', pic: 0 },
      { text: 'Tee luvuista yhtä pitkät: 0,8 = 0,80. Vertaa samoja paikkoja vasemmalta: 8 kymmenesosaa on enemmän kuin 7, joten 0,80 > 0,75.', more: 'Lopussa oleva nolla ei muuta määrää.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-DEC-06': {
    beats: [
      { text: 'Väli nollasta yhteen on jaettu kymmeneen pikkuväliin. Jokainen pikkuväli on 0,1.', pic: 0 },
      { text: 'Kohtaan 0,5 edetään nollasta viisi pikkuväliä. Se on täsmälleen välin puolivälissä.', more: 'Jos yksi pikkuväli suurennetaan ja jaetaan taas kymmeneen, uusi pikkuväli on 0,01.', pic: 1 },
    ],
    try: {
      say: 'Väli 0–1 on jaettu kymmeneen pikkuväliin. Montako pikkuväliä nollasta edetään kohtaan 0,3?',
      options: ['3', '30', '7'],
      answer: 0,
      explain: 'Yksi pikkuväli on 0,1. Kolme pikkuväliä on 0,3.',
      why: [null, '30 pikkuväliä veisi kohtaan 3, kauas ykkösen ohi.', '7 pikkuväliä vie kohtaan 0,7.'],
    },
  },
  'M-DEC-08': {
    beats: [
      { text: '4 × 0,3 on kolme kymmenesosaa neljä kertaa eli 12 kymmenesosaa. Kymmenen kymmenesosaa on yksi kokonainen, joten tulos on 1,2.', pic: 0 },
      { text: 'Kun 3,45 kerrotaan kymmenellä, jokainen numero siirtyy yhden paikan vasemmalle. Pilkku pysyy paikallaan, ja tulos on 34,5.', pic: 1 },
      { text: 'Kun 0,7 kerrotaan tuhannella, numero siirtyy kolme paikkaa vasemmalle. Tyhjiin paikkoihin tulee nollat: 700.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-DEC-09': {
    beats: [
      { text: '4,8 jaetaan kahdelle lautaselle. Kumpikin saa 2 kokonaista ja 4 kymmenesosaa eli 2,4.', pic: 0 },
      { text: '5,4 jaetaan kolmelle. Kokonaisia riittää yksi kullekin, ja kaksi ylijäänyttä vaihdetaan 20 kymmenesosaksi.', more: 'Nyt kymmenesosia on 20 + 4 = 24, ja jokainen saa niistä 8. Vastaus on 1,8.', pic: 1 },
      { text: 'Kun 45 jaetaan sadalla, jokainen numero siirtyy kaksi paikkaa oikealle. Ykkösten paikalle tulee nolla: 0,45.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-FRACDEC-01': {
    beats: [
      { text: 'Viestissä on murtoluku 3/4. Mittalaatta on yksi kokonainen, ja siitä on täytetty kolme neljäsosaa.', pic: 0 },
      { text: 'Muutetaan sadasosiksi: 3/4 = 75/100. 75 sadasosaa on desimaalilukuna 0,75.', more: 'Toisin päin: 0,75 = 75/100 = 3/4. Osuus samasta kokonaisesta pysyy samana.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-DEC-ADD': {
    beats: [
      { text: 'Jos luvut 2,5 ja 1,25 laitetaan allekkain oikeaan reunaan, kymmenesosat osuvat sadasosien kohdalle. Siksi pilkut asetetaan allekkain.', more: 'Tyhjälle paikalle voi lisätä nollan: 2,50 + 1,25 = 3,75.', pic: 0 },
      { text: '3,47 + 1,8: kymmenesosia tulee 4 + 8 = 12. Kirjoitetaan 2 ja viedään yksi kokonainen muistiin, joten tulos on 5,27.', pic: 1 },
      { text: '5 − 1,7: viitonen kirjoitetaan 5,0. Nollasta ei voi vähentää seitsemää, joten yksi ykkönen vaihdetaan kymmeneksi kymmenesosaksi: tulos on 3,3.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-DEC-SUB': {
    beats: [
      { text: 'Alussa on 0,8 litraa, ja siitä lähtee 0,36 litraa. Kirjoitetaan 0,8 muotoon 0,80, jotta sadasosat ovat kohdakkain.', pic: 0 },
      { text: 'Nollasta sadasosasta ei voi vähentää kuutta, joten yksi kymmenesosa vaihdetaan kymmeneksi sadasosaksi. 0,80 − 0,36 = 0,44 litraa.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-DEC-07': {
    beats: [
      { text: 'Varastossa on alussa 1,38 litraa. Ensin saapuu 0,49 litraa, ja se lisätään: 1,38 + 0,49 = 1,87 litraa.', pic: 0, figure: false },
      { text: 'Sitten lähtee 1,47 litraa, ja se vähennetään: 1,87 − 1,47 = 0,40 litraa.', more: 'Jokainen tapahtuma lasketaan edellisestä välituloksesta.', pic: 1, figure: false },
    ],
    try: {
      say: 'Varastossa on 0,5 litraa. Saapuu 0,25 litraa ja lähtee 0,6 litraa. Paljonko jää?',
      options: ['0,15 l', '1,35 l', '0,75 l'],
      answer: 0,
      explain: 'Ensin 0,50 + 0,25 = 0,75. Sitten 0,75 − 0,60 = 0,15 litraa.',
      why: [null, 'Lähtevä erä vähennetään, sitä ei lisätä.', '0,75 l on välitulos. Lähtevä erä pitää vielä vähentää.'],
    },
  },
  'M-RATREP-FRAC-DEC': {
    beats: [
      { text: 'Mittakoriin mahtuu 20 helmeä, ja täysi kori on 1 kokonainen. Lähetykseen varataan 5 helmeä.', pic: 0 },
      { text: 'Viisi kahdestakymmenestä on 1/4. Neljäsosa on 25 sadasosaa, joten desimaalilukuna se on 0,25.', pic: 1 },
    ],
    try: {
      say: 'Mikä desimaaliluku on 1/2?',
      options: ['0,5', '1,2', '0,12'],
      answer: 0,
      explain: '1/2 = 5/10 eli viisi kymmenesosaa: 0,5.',
      why: [null, '1,2 on enemmän kuin yksi kokonainen. Puolikas on vähemmän.', 'Murtoluvun numeroita ei kirjoiteta pilkun perään.'],
    },
  },
  'M-RATREP-01': {
    beats: [
      { text: 'Mittakoriin mahtuu 20 helmeä, ja täysi kori on 100 %. Lähetykseen varataan 5 helmeä.', pic: 0 },
      { text: 'Viisi helmeä kahdestakymmenestä on 1/4 = 0,25 = 25 %. Kolme eri merkintää kertoo saman osuuden.', pic: 1 },
    ],
    try: {
      say: 'Missä rivissä kaikki kolme merkintää kertovat saman osuuden?',
      options: ['1/2 = 0,5 = 50 %', '1/2 = 0,2 = 20 %', '1/4 = 0,4 = 40 %'],
      answer: 0,
      explain: 'Puolikas on viisi kymmenesosaa eli 50 sadasosaa: 1/2 = 0,5 = 50 %.',
      why: [null, '0,2 ja 20 % ovat viidesosa, eivät puolikas.', 'Neljäsosa on 0,25 eli 25 %.'],
    },
  },
};
