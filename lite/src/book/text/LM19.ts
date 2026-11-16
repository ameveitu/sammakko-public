import type { PageText } from '../text';

/** LM19 Yhteisten mittojen kellotorni: time, clock reading, duration and converting units. */
export const TEXT: Record<string, PageText> = {
  'M-TIME-01': {
    beats: [
      { text: 'Punainen ja sininen auto lähtevät yhtä aikaa. Sininen pääsee perille myöhemmin, joten sen ajo kesti kauemmin.', more: 'Lamppu syttyy, kun auto on perillä. Käynnistä ja katso niin monta kertaa kuin haluat.', pic: 1 },
      { text: 'Kynttilät syttyvät yhtä aikaa, ja punainen sammuu ensin. Sininen paloi kauemmin, ja siksi se myös lyheni enemmän.', pic: 2 },
      { text: 'Nyt sininen syttyy myöhemmin ja sammuu viimeisenä. Silti punainen paloi kauemmin: se lyheni enemmän.', more: 'Kun alut ovat eri aikaan, pelkkä loppu ei kerro, kumpi kesti kauemmin.', pic: 3 },
    ],
    try: 'auto',
  },
  'M-TIME-03': {
    beats: [
      { text: 'Sekuntikello käy, kun ankka ui, ja pysähtyy, kun ankka on perillä. Kello näyttää 3 s: uinti kesti kolme sekuntia.', pic: 1 },
      { text: 'Loikka ja Aava laskevat taputuksia saman valon aikana, mutta saavat eri luvut. Taputus ei ole kaikilla yhtä pitkä.', pic: 3 },
      { text: 'Sekuntikello näyttää kaikille saman ajan. Siksi aikaa mitataan sovitulla mitalla, sekunnilla.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-TIME-02': {
    beats: [
      { text: 'Lyhyt viisari näyttää tunnin, pitkä viisari minuutit. Pitkä osoittaa ylös lukuun 12 ja lyhyt lukuun 3: kello on tasan kolme.', pic: 0 },
      { text: 'Pitkä viisari kiertää alas lukuun 6: puoli tuntia on kulunut. Lyhyt on lukujen 3 ja 4 välissä: kello on puoli neljä.', more: 'Puoli neljä kirjoitetaan 3.30. Kun pitkä viisari jatkaa ylös asti, kello on neljä.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-UNIT-05': {
    beats: [
      { text: 'Jokainen kiekko on yksi tunti eli 60 minuuttia, ei 100. 2 h 15 min = 2 × 60 min + 15 min = 135 min.', pic: 0 },
      { text: 'Lautta lähtee 9.45 ja matka kestää 30 min. Tasatuntiin on 15 min, loput 15 min kuluvat uudella tunnilla: perillä ollaan 10.15.', pic: 1 },
      { text: 'Pisteen jälkeen tulevat minuutit, joita on enintään 59. Siksi 13.40 + 50 min ei ole 13.90 vaan 14.30.', more: '40 min + 50 min = 90 min = 1 h 30 min. Täysi tunti lisätään tunteihin, ja minuutteja jää 30.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-UNIT-06': {
    beats: [
      { text: 'Kuution jokainen särmä eli reunaviiva on 1 dm eli 10 cm. Yksi litra vettä täyttää tällaisen kuution täsmälleen.', pic: 0, figure: false },
      { text: 'Tämän kuution tilavuus on yksi kuutiodesimetri, 1 dm³, ja siihen mahtuu 1 l. Kahteen kuutioon mahtuu 2 l eli 2 dm³.', more: 'Särmä on 10 cm, mutta tilavuus ei ole 10. Kuutioon mahtuisi 10 × 10 × 10 = 1000 pientä 1 cm:n kuutiota.', pic: 1 },
    ],
    try: {
      say: 'Kuution jokainen särmä on 1 dm. Paljonko vettä mahtuu kolmeen tällaiseen kuutioon?',
      options: ['3 l', '3 dl', '30 l'],
      answer: 0,
      explain: 'Yhteen kuutioon mahtuu 1 dm³ eli 1 l. Kolmeen kuutioon mahtuu 3 l.',
      why: [null, 'Yhteen kuutioon mahtuu jo 10 dl. Kolmeen mahtuu 30 dl eli 3 l.', '30 l täyttäisi kolmekymmentä tällaista kuutiota.'],
    },
  },
  'M-UNIT-01': {
    beats: [
      { text: 'Pituusyksiköt ovat portaat: km, hm, dam, m, dm, cm, mm. Jokainen porras alaspäin kertoo luvun kymmenellä: 1 m = 10 dm = 100 cm.', pic: 0 },
      { text: 'Kilometristä metriin on kolme porrasta: 10 × 10 × 10 = 1000. Siksi 1 km = 1000 m.', more: 'Välissä ovat harvoin käytetyt hehtometri ja dekametri, mutta nekin ovat portaita.', pic: 1 },
      { text: 'Ylöspäin jaetaan kymmenellä joka portaalla. Grammasta kilogrammaan on kolme porrasta ylös: 2500 g = 2,5 kg.', pic: 2 },
    ],
    try: {
      say: 'Montako metriä on 3 km?',
      options: ['3000 m', '300 m', '30 m'],
      answer: 0,
      explain: 'Kilometristä metriin on kolme porrasta alas: 3 × 1000 = 3000, joten 3 km = 3000 m.',
      why: [null, 'Kerroit vain sadalla eli kaksi porrasta. Portaita on kolme.', 'Kerroit vain kymmenellä eli yksi porras. Portaita on kolme.'],
    },
  },
  'M-UNIT-02': {
    beats: [
      { text: 'Isosta yksiköstä pieneen luku kasvaa, koska pieniä yksiköitä tarvitaan enemmän. Metristä senttiin on kaksi porrasta: 3 m = 300 cm.', pic: 0 },
      { text: 'Desimaaliluku muuntuu samalla tavalla: 2,5 m = 250 cm. Numerot siirtyvät, pilkku pysyy paikallaan.', pic: 1 },
      { text: 'Pienestä yksiköstä isoon jaetaan: 150 : 100 = 1,5, joten 150 cm = 1,5 m. Tarkista, onko vastaus järkevän kokoinen.', more: 'Puolitoista metriä on suunnilleen koululaisen pituus. Jos saisit 15 000 m, tietäisit heti, että laskussa on virhe.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-UNIT-03': {
    beats: [
      { text: 'Kilogrammasta grammaan on kolme porrasta alas, joten kerrotaan tuhannella: 3 kg = 3000 g. Desimaaliluku muuntuu samoin: 2,5 kg = 2500 g.', pic: 0 },
      { text: 'Grammoista kilogrammoihin jaetaan tuhannella: 1500 g = 1,5 kg. Luku pienenee, koska isoa yksikköä tarvitaan vähemmän.', pic: 2 },
      { text: 'Säkissä on 2 kg ja pussiin mahtuu 250 g. Ensin samaan yksikköön: 2000 g : 250 g = 8 pussia.', pic: 3 },
    ],
    try: 'auto',
  },
  'M-UNIT-04': {
    beats: [
      { text: 'Litrasta desilitraan on yksi porras alas, joten kerrotaan kymmenellä. 3 l = 30 dl ja 2,5 l = 25 dl.', more: 'Millilitraan on litrasta kolme porrasta: 1 l = 1000 ml.', pic: 0 },
      { text: 'Desilitroista litroihin jaetaan kymmenellä: 15 dl = 1,5 l. Litroja tulee vähemmän, koska litra on isompi yksikkö.', pic: 2 },
      { text: 'Kannussa on 1,5 l ja lasiin mahtuu 3 dl. Ensin samaan yksikköön: 15 dl : 3 dl = 5 lasia.', pic: 3 },
    ],
    try: 'auto',
  },
};
