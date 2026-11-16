import type { PageText } from '../text';

/** UM-12 Majakkaviivan kartta: graph of a linear function, slope, constant term and zero. */
export const TEXT: Record<string, PageText> = {
  'M79-LINE-GRAPH': {
    beats: [
      { text: 'Kuvassa on suora y = 2x. Kun yhtälön y = kx + b lukua b muutetaan, suora liukuu ylös tai alas, ja se leikkaa y-akselin aina kohdassa b.', pic: 0 },
      { text: 'Kun lukua k muutetaan, suora kääntyy leikkauspisteen ympäri. Kun x kasvaa yhdellä, y muuttuu k:n verran: positiivinen k nostaa, negatiivinen laskee.', pic: 0 },
      { text: 'Suora y = 2x + 1 leikkaa y-akselin pisteessä (0, 1), koska x = 0 antaa y = 1. Kun x = 1, y = 3, ja kahden pisteen kautta voi piirtää suoran.', pic: 1 },
    ],
    try: 'auto',
  },
  'M79-ZERO-GRAPH': {
    beats: [
      { text: 'Funktion nollakohta on se x:n arvo, jolla y = 0. Kuvaajassa se on kohta, jossa kuvaaja leikkaa x-akselin.', pic: 0 },
      { text: 'Ruudukon yksi ruutu on vaakasuunnassa 0,5. Suora leikkaa x-akselin viiden ruudun päässä origosta, joten nollakohta on x = 2,5 eli 5/2.', pic: 0 },
      { text: 'Jos kuvaaja ei leikkaa x-akselia näkyvällä alueella, siltä alueelta ei löydy nollakohtaa. Vaakasuoralla suoralla y = 3 ei ole nollakohtaa lainkaan.', pic: null },
    ],
    try: {
      say: 'Suora leikkaa y-akselin kohdassa 3 ja x-akselin kohdassa 1. Mikä on funktion nollakohta?',
      options: ['x = 1', 'x = 3', 'x = 0'],
      answer: 0,
      explain: 'Nollakohdassa y = 0, ja niin on juuri x-akselilla. Suora leikkaa x-akselin kohdassa x = 1.',
      why: [null, '3 on leikkauskohta y-akselilla. Siellä x = 0, ei y = 0.', '0 on nollakohdan y-arvo. Nollakohta on x:n arvo.'],
    },
  },
  'M79-ZERO-CALC': {
    beats: [
      { example: 'Mikä on funktion f(x) = −x − 1 nollakohta?', text: 'Nollakohdassa funktion arvo on 0. Kirjoitetaan siis yhtälö −x − 1 = 0.', pic: null },
      { text: 'Siirretään −1 toiselle puolelle, jolloin siitä tulee +1: −x = 1. Jaetaan molemmat puolet luvulla −1, jolloin x = −1.', pic: null },
      { text: 'Tarkistetaan sijoittamalla: f(−1) = −(−1) − 1 = 1 − 1 = 0. Nollakohta on siis x = −1.', pic: null },
    ],
    try: {
      say: 'Mikä on funktion f(x) = 2x − 6 nollakohta?',
      options: ['3', '−3', '−6', '6'],
      answer: 0,
      explain: 'Yhtälöstä 2x − 6 = 0 saadaan 2x = 6 ja x = 3. Tarkistus: f(3) = 2 · 3 − 6 = 0.',
      why: [null, 'Kun −6 siirretään toiselle puolelle, siitä tulee +6: 2x = 6.', '−6 on funktion arvo kohdassa x = 0 eli y-akselin leikkauskohta.', 'Yhtälö 2x = 6 pitää vielä jakaa kahdella.'],
    },
  },
  'M79-SLOPE': {
    beats: [
      { text: 'Pisteestä (1, 2) pisteeseen (3, 8) x kasvaa 2 ja y kasvaa 6. Kulmakerroin on k = Δy / Δx = 6 / 2 = 3, eli yksi askel oikealle nostaa 3.', more: 'Kreikkalainen kirjain Δ (delta) tarkoittaa muutosta: Δx on x:n muutos ja Δy on y:n muutos.', pic: 0 },
      { text: 'Pisteestä (−1, 3) pisteeseen (2, −3) x kasvaa 3, mutta y pienenee 6. Siksi k = −6 / 3 = −2.', pic: 1 },
      { text: 'Oikealle nousevan suoran kulmakerroin on positiivinen ja laskevan negatiivinen. Vaakasuoran suoran kulmakerroin on 0.', pic: 2 },
    ],
    try: 'auto',
  },
  'M79-INTERCEPT': {
    beats: [
      { text: 'Funktio f(x) = −x + 1 kertoo pinnan korkeuden vertailutasosta senttimetreinä, kun x on aika kokeen alusta. Kokeen alussa x = 0.', pic: 0 },
      { text: 'Sijoitetaan x = 0: f(0) = −0 + 1 = 1. Kuvaaja leikkaa y-akselin pisteessä (0, 1), joten pinta on alussa 1 cm vertailutason yläpuolella.', pic: 0 },
      { text: 'Yhtälössä y = kx + b vakiotermi b on aina f(0). Se näkyy y-akselin leikkauskohtana ja kertoo tilanteen alkuarvon.', pic: 0 },
    ],
    try: {
      say: 'Altaan vesimäärä on f(x) = −2x + 50 kuutiometriä, kun x on tunnit tyhjennyksen alusta. Paljonko vettä oli alussa?',
      options: ['50 m³', '−2 m³', '48 m³'],
      answer: 0,
      explain: 'Alussa x = 0, joten f(0) = −2 · 0 + 50 = 50. Vakiotermi 50 on alkuarvo.',
      why: [null, '−2 on kulmakerroin: vettä on joka tunti 2 m³ vähemmän.', '48 m³ on vesimäärä tunnin kuluttua, kun x = 1.'],
    },
  },
  'M79-ZERO': {
    beats: [
      { text: 'Kuvaajasta nähdään, että suora f(x) = −2x + 5 leikkaa x-akselin kohdassa 2,5. Kuvaajasta luettu arvo on kuitenkin vain niin tarkka kuin kuva.', pic: 0 },
      { text: 'Laskulla saadaan tarkka arvo: −2x + 5 = 0, joten −2x = −5 ja x = 5/2 = 2,5.', pic: 0 },
      { text: 'Sijoitus näyttää, että kuvaaja ja lasku kertovat saman: f(2,5) = −2 · 2,5 + 5 = 0.', pic: 0 },
    ],
    try: {
      say: 'Kuvaajan mukaan f(x) = 3x − 4 leikkaa x-akselin noin kohdassa 1,3. Mikä on tarkka nollakohta?',
      options: ['4/3', '1,3', '−4/3', '3/4'],
      answer: 0,
      explain: 'Yhtälöstä 3x − 4 = 0 saadaan 3x = 4 ja x = 4/3 ≈ 1,33. Kuvaajasta luettu 1,3 on vain likiarvo.',
      why: [null, 'f(1,3) = 3 · 1,3 − 4 = −0,1, ei 0. Kuvaajasta luettu arvo on likiarvo.', 'Kun −4 siirretään toiselle puolelle, siitä tulee +4: 3x = 4.', 'Luku 4 jaetaan kertoimella 3, ei päinvastoin: x = 4/3.'],
    },
  },
};
