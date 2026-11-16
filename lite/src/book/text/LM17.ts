import type { PageText } from '../text';

/** LM17 Rantapenkereiden rakennuspiha: perimeter, area, volume and area units. */
export const TEXT: Record<string, PageText> = {
  'M-GMEAS-02': {
    beats: [
      { example: 'Yksi ruutu on 1 cm². Kuinka suuri on alueen pinta-ala?', text: 'Alueen peittää 12 ruutua, eikä väliin jää rakoja. Pinta-ala on siis 12 cm².', pic: 0 },
      { text: 'Pinta-ala kertoo, montako yksikköruutua pintaan mahtuu. Merkintä cm² luetaan neliösenttimetri: neliö, jonka sivu on 1 cm.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GMEAS-04': {
    beats: [
      { example: 'Rakennelman kolme kerrosta näkyvät ylhäältä vierekkäin. Yksi ruutu on yksi 1 cm³ kuutio. Montako kuutiota rakennelmassa on?', text: 'Jokaisessa kerroksessa on 3 · 4 = 12 kuutiota. Kolmessa kerroksessa on 12 + 12 + 12 = 36, joten tilavuus on 36 cm³.', pic: 0 },
      { text: 'Tilavuus kertoo, montako yksikkökuutiota tilaan mahtuu. Myös taakse ja alle piiloon jäävät kuutiot lasketaan.', more: 'Merkintä cm³ luetaan kuutiosenttimetri: kuutio, jonka jokainen särmä on 1 cm.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GMEAS-01': {
    beats: [
      { text: 'Loikka kiertää suorakulmion reunan ja vetää nauhaa perässään. Nauhan pituus on kuvion piiri: 4 + 2 + 4 + 2 = 12 cm.', pic: 0 },
      { text: 'Ruudukossa lasketaan reunalla olevat ruudun sivut. Tämän kuvion reunalla on 10 sivua, joten piiri on 10 cm.', more: 'Kuvion sisällä olevat viivat eivät kuulu piiriin.', pic: 1 },
      { text: 'Kolmion piiri on sen kolmen sivun summa: 3 + 5 + 4 = 12 cm. Eri muotoisilla kuvioilla voi olla sama piiri.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-GMEAS-03': {
    beats: [
      { example: 'Yksi ruutu on 1 cm². Alue ei ole suorakulmio. Kuinka suuri on sen pinta-ala?', text: 'Jaetaan alue kahdeksi suorakulmioksi. Kapea osa on 1 · 3 = 3 cm² ja leveä osa 3 · 2 = 6 cm², yhteensä 9 cm².', pic: 0 },
      { text: 'Jokainen ruutu lasketaan vain kerran. Osat eivät saa mennä päällekkäin, eikä yksikään ruutu saa jäädä pois.', more: 'Toinen tapa: koko suorakulmio miinus puuttuva osa. Koko suorakulmio on 4 · 3 = 12 cm², ja siitä puuttuu 3 cm², joten 12 − 3 = 9 cm².', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GMEAS-05': {
    beats: [
      { text: 'Laatikon pohjakerros on 3 kuutiota pitkä ja 2 leveä. Siinä on 3 · 2 = 6 yksikkökuutiota.', pic: 0 },
      { text: 'Korkeus on 2 cm, joten kerroksia on kaksi: 2 · 6 = 12. Laatikon tilavuus on 12 cm³.', pic: 1 },
      { text: 'Lyhyesti: tilavuus = pituus · leveys · korkeus = 3 cm · 2 cm · 2 cm = 12 cm³. Senttimetreistä tulee kuutiosenttimetrejä.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-GMEAS-06': {
    beats: [
      { example: 'Montako neliödesimetriä mahtuu neliöön, jonka ala on 1 m²?', text: 'Neliön sivu on 1 m = 10 dm. Rivejä on 10 ja jokaisessa rivissä 10 pientä neliötä: 10 · 10 = 100.', pic: 0 },
      { text: 'Siksi 1 m² = 100 dm², ei 10 dm². Kerroin 10 otetaan kahdesti, kerran kummallekin sivulle.', pic: 0 },
      { example: 'Paljonko 3 m² on neliödesimetreinä?', text: 'Jokaisessa neliömetrissä on 100 dm². Siis 3 m² = 3 · 100 dm² = 300 dm².', pic: 0 },
    ],
    try: {
      say: 'Neliön sivu on 1 dm = 10 cm. Montako neliösenttimetriä on 1 dm²?',
      options: ['100 cm²', '10 cm²', '1000 cm²'],
      answer: 0,
      explain: 'Neliössä on 10 riviä, ja jokaisessa rivissä on 10 neliösenttimetriä: 10 · 10 = 100 cm².',
      why: [null, '10 on vain yhden sivun osien määrä. Rivejä on myös 10.', '1000 kuuluu tilavuuteen: 1 dm³ = 1000 cm³.'],
    },
  },
};
