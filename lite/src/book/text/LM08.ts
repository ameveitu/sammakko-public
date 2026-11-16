import type { PageText } from '../text';

/** LM08 Majavan sivu-uoman sopimus: fair parts, fractions, equivalence, comparison and fraction arithmetic. */
export const TEXT: Record<string, PageText> = {
  'M-FRAC-01': {
    beats: [
      { text: 'Piirakka leikataan neljään palaan. Kun palat nostetaan päällekkäin, ne peittävät toisensa tarkasti: palat ovat yhtä suuria.', pic: 0 },
      { text: 'Tässäkin on neljä palaa, mutta ne ovat eri kokoisia. Reilussa jaossa kaikki palat ovat yhtä suuria.', pic: 1 },
      { text: 'Kolme ystävää jakaa piirakan kolmeen yhtä suureen palaan. Jokaisen pala on kolmasosa piirakasta.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-FRAC-02': {
    beats: [
      { text: 'Piirakka on jaettu viiteen yhtä suureen palaan, ja kaksi niistä on väritetty. Väritetty osa on 2/5 eli kaksi viidesosaa.', pic: 0 },
      { text: 'Lukua 2/5 sanotaan murtoluvuksi. Viivan alle tulee kaikkien palojen määrä ja viivan päälle väritettyjen: suklaalevystä on väritetty 3/8.', pic: 1 },
      { text: 'Varo: alas tulee kaikkien palojen määrä, ei värittämättömien. Yksi neljästä palasta on 1/4, ei 1/3.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-FRAC-03': {
    beats: [
      { text: 'Viivan alla on nimittäjä. Se kertoo, moneenko yhtä suureen palaan kokonainen jaetaan: 1/2, 1/4, 1/8.', more: 'Mitä suurempi nimittäjä, sitä pienempi yksi pala on.', pic: 0 },
      { text: 'Viivan päällä on osoittaja. Se kertoo, montako palaa otetaan: Aava ottaa levystä 3/8 ja Loikka 2/8.', more: 'Yhteensä he ottavat 5/8. Palat ovat samankokoisia, joten nimittäjä pysyy 8:ssa.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-FRAC-06': {
    beats: [
      { text: 'Nauhasta on väritetty 1/2. Kun jokainen pala leikataan kahtia, väritetty osa on 2/4, ja kun vielä kahtia, 4/8.', more: 'Väritetty osa ei kasva eikä pienene. Siksi 1/2 = 2/4 = 4/8.', pic: 0 },
      { text: 'Kun 2/3 palat leikataan kahtia, saadaan 4/6, sama määrä. Jos ylös ja alas vain lisätään yksi, saadaan 3/4, ja se on eri määrä.', pic: 1 },
      { text: 'Sääntö: kerro osoittaja ja nimittäjä samalla luvulla. Kun molemmat kerrotaan kolmella, 1/3 = 3/9.', pic: 2 },
    ],
    try: {
      say: 'Mikä murtoluku on yhtä suuri kuin 3/4?',
      options: ['6/8', '4/5', '6/4'],
      answer: 0,
      explain: 'Kerrotaan osoittaja ja nimittäjä kahdella: 3 · 2 = 6 ja 4 · 2 = 8. Siis 3/4 = 6/8.',
      why: [null, '4/5 saatiin lisäämällä yksi ylös ja alas. Lisääminen muuttaa määrää.', 'Vain osoittaja kerrottiin. Myös nimittäjä pitää kertoa samalla luvulla.'],
    },
  },
  'M-FRAC-05': {
    beats: [
      { text: 'Molemmat levyt on leikattu kahdeksaan samankokoiseen palaan. Aava ottaa 3/8 ja Loikka 5/8, joten Loikka saa kaksi palaa enemmän.', pic: 0 },
      { text: 'Kun nimittäjä on sama, palat ovat samankokoisia. Silloin verrataan vain osoittajia: 5/6 > 2/6, koska 5 > 2.', more: 'Jos osoittajatkin ovat samat, määrät ovat yhtä suuret: 3/5 = 3/5.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-FRAC-08': {
    beats: [
      { text: 'Nauhasta on väritetty 6/8. Kun palat yhdistetään kaksi kerrallaan, kahdeksasta palasta tulee neljä ja kuudesta väritetystä kolme: 6/8 = 3/4.', pic: 0 },
      { text: 'Tätä sanotaan supistamiseksi: osoittaja ja nimittäjä jaetaan samalla luvulla. 8/12 = 4/6 = 2/3, kun jaetaan kahdesti kahdella.', more: 'Väri pysyy paikallaan, vain palat suurenevat. Jos molemmista vain vähennettäisiin yksi, väri siirtyisi: se ei ole supistamista.', pic: 1 },
      { text: 'Joskus jaetaan kolmella. Kun palat yhdistetään kolme kerrallaan, 6/9 = 2/3.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-FRAC-09': {
    beats: [
      { text: 'Samasta altaasta A on 2/5 ja B on 3/4. Puolikas auttaa: 2/5 jää puolikkaan alle ja 3/4 menee sen yli, joten B on enemmän.', pic: 0 },
      { text: 'Metrin köysistä A on 4/5 ja B on 7/10. Jaetaan molemmat kymmeneen osaan: 4/5 = 8/10, ja 8/10 > 7/10.', more: 'Jokainen viidesosa jaetaan kahteen, jolloin siitä tulee kaksi kymmenesosaa.', pic: 1 },
    ],
    try: {
      say: 'Kumpi on enemmän samasta kakusta: 3/8 vai 2/3?',
      options: ['2/3', '3/8', 'Yhtä paljon'],
      answer: 0,
      explain: 'Puolet kakusta on 4/8, joten 3/8 on alle puolet. 2/3 on yli puolet. Siis 2/3 on enemmän.',
      why: [null, 'Isommat luvut eivät tarkoita isompaa osaa. 3/8 on alle puolet, koska puolet olisi 4/8.', 'Toinen on alle puolet ja toinen yli puolet, joten ne eivät ole yhtä suuret.'],
    },
  },
  'M-FRAC-10': {
    beats: [
      { text: 'Vettä on kaksi kokonaista allasta ja kolmasosa: 2 1/3. Jokainen kokonainen on kolme kolmasosaa, joten kolmasosia on 3 + 3 + 1 = 7.', pic: 0 },
      { text: 'Siis 2 1/3 = 7/3. Merkintää 2 1/3 sanotaan sekaluvuksi: siinä on kokonaiset ja murto-osa.', pic: 0 },
      { text: 'Toisin päin: köyttä on 7/3 metriä. Kolme kolmasosaa tekee metrin, joten seitsemästä palasta tulee kaksi metriä ja 1/3 jää yli.', pic: 1 },
    ],
    try: {
      say: 'Mikä on 1 3/4 yhtenä murtolukuna?',
      options: ['7/4', '4/4', '3/4'],
      answer: 0,
      explain: 'Yksi kokonainen on 4/4. Kun siihen lisätään 3/4, neljäsosia on 4 + 3 = 7. Siis 1 3/4 = 7/4.',
      why: [null, 'Kokonainen on neljä neljäsosaa, ei yksi: 4 + 3 = 7.', 'Tästä puuttuu kokonainen, joka on vielä neljä neljäsosaa lisää.'],
    },
  },
  'M-FRAC-11': {
    beats: [
      { text: 'Lautasilla on 2/8 ja 3/8. Palat siirretään samaan vatiin, ja siellä on viisi kahdeksasosaa: 2/8 + 3/8 = 5/8.', pic: 0 },
      { text: 'Palojen määrä kasvaa, mutta palan koko pysyy. Siksi nimittäjiä ei lasketa yhteen: 5/16 olisi liian vähän.', pic: 0 },
      { text: 'Sama kuudesosilla: 1/6 + 4/6 = 5/6. Osoittajat lasketaan yhteen, ja nimittäjä pysyy.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-FRAC-12': {
    beats: [
      { text: 'Vadissa on 5/8 piirakkaa, ja Loikka syö kaksi palaa. Jäljelle jää kolme palaa: 5/8 − 2/8 = 3/8.', pic: 0 },
      { text: 'Kun vähennetään kokonaisesta, piirakka leikataan ensin: 1 = 8/8. Kun kolme palaa syödään, jää 8/8 − 3/8 = 5/8.', pic: 1 },
      { text: 'Nimittäjää ei vähennetä, koska palan koko ei muutu: 6/10 − 4/10 = 2/10.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-FRAC-16': {
    beats: [
      { text: 'Pöydällä on puolet kakusta, ja kolme saajaa jakaa sen tasan. Jokainen saa yhtä suuren palan.', pic: 0 },
      { text: 'Koko kakusta tulisi kuusi tällaista palaa. Jokainen saa siis 1/6 kakusta: 1/2 : 3 = 1/6.', pic: 1 },
      { text: 'Nauhassa sama: puoli metriä jaetaan kolmeen yhtä pitkään osaan. Jokainen osa on 1/6 metriä.', pic: 2 },
    ],
    try: {
      say: 'Neljäsosa pizzasta jaetaan tasan kahdelle. Kuinka suuren osan koko pizzasta kumpikin saa?',
      options: ['1/8', '1/2', '1/6'],
      answer: 0,
      explain: 'Kun jokainen neljäsosa jaetaan kahtia, koko pizzasta tulee kahdeksan palaa. Kumpikin saa 1/8: 1/4 : 2 = 1/8.',
      why: [null, 'Kumpikin saa puolet neljäsosasta, mutta koko pizzasta se on paljon vähemmän.', 'Koko pizzasta tulisi kahdeksan tällaista palaa, ei kuusi.'],
    },
  },
  'M-FRAC-07': {
    beats: [
      { text: 'Altaasta on sinistä 2/3. Nyt jokainen kolmasosa jaetaan kahteen osaan, myös tyhjä osa.', pic: 0 },
      { text: 'Sinisiä osia on nyt 4 ja kaikkia 6, mutta sinistä on yhtä paljon: 2/3 = 4/6. Tätä sanotaan laventamiseksi.', more: 'Laventaessa osoittaja ja nimittäjä kerrotaan samalla luvulla: 2 · 2 = 4 ja 3 · 2 = 6.', pic: 1 },
    ],
    try: {
      say: 'Altaasta on sinistä 3/4. Jokainen osa jaetaan kolmeen. Mikä murtoluku saadaan?',
      options: ['9/12', '9/4', '3/12'],
      answer: 0,
      explain: 'Sinisiä osia on 3 · 3 = 9 ja kaikkia osia 4 · 3 = 12. Siis 3/4 = 9/12.',
      why: [null, 'Myös kaikkien osien määrä kasvaa: 4 · 3 = 12.', 'Osia on enemmän, mutta niin on sinisiäkin: 3 · 3 = 9.'],
    },
  },
  'M-FRAC-15': {
    beats: [
      { text: 'Kolmesta piirakasta otetaan kustakin 2/5. Vatiin tulee 3 · 2 = 6 palaa, ja jokainen on viidesosa: 3 × 2/5 = 6/5.', more: 'Viisi viidesosaa täyttää yhden kokonaisen, joten 6/5 on yksi kokonainen ja 1/5.', pic: 0 },
      { text: 'Neljästä piirakasta otetaan kustakin 3/4. Yhteensä 4 × 3/4 = 12/4, ja se täyttää kolme kokonaista vatia.', more: 'Nimittäjää ei kerrota, koska palan koko pysyy samana.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-FRAC-04': {
    beats: [
      { text: 'Lukusuoran jokainen väli on jaettu neljään osaan. Luku 5/4 on viisi neljäsosa-askelta nollasta: yksi kokonainen ja vielä 1/4.', pic: 0 },
      { text: 'Tämä köysiasteikko alkaa luvusta 1, ei nollasta. Luku 9/4 on 2 1/4, joten se on heti kakkosen jälkeisessä merkissä.', pic: 1 },
    ],
    try: {
      say: 'Lukusuoran välit on jaettu neljään osaan. Missä on 7/4?',
      options: ['Ykkösen ja kakkosen välissä', 'Nollan ja ykkösen välissä', 'Kohdassa 7'],
      answer: 0,
      explain: '7/4 on seitsemän neljäsosa-askelta: neljä askelta vie ykköseen ja kolme vielä eteenpäin. Siis 7/4 = 1 3/4.',
      why: [null, 'Nollan ja ykkösen välissä on vain neljä neljäsosaa, ja 7/4 on enemmän kuin yksi.', '7/4 on seitsemän neljäsosaa, ei seitsemän kokonaista.'],
    },
  },
  'M-FRAC-13': {
    beats: [
      { text: 'Kakuista on jäljellä 1/2 ja 2/3. Palat ovat eri kokoisia, joten niitä ei voi vielä laskea yhteen.', pic: 0 },
      { text: 'Puolikas leikataan kolmeen ja jokainen kolmasosa kahteen. Nyt kaikki palat ovat kuudesosia: 1/2 = 3/6 ja 2/3 = 4/6.', pic: 1 },
      { text: 'Kuudesosia on yhteensä 3 + 4 = 7. Kuusi niistä täyttää yhden kakun, ja yksi jää yli: 7/6 = 1 1/6.', pic: 3 },
    ],
    try: {
      say: 'Paljonko on 1/2 + 1/4?',
      options: ['3/4', '2/6', '2/4'],
      answer: 0,
      explain: 'Puolikas on 2/4. Nyt palat ovat neljäsosia: 2/4 + 1/4 = 3/4.',
      why: [null, 'Nimittäjiä ei lasketa yhteen. Palat pitää ensin tehdä samankokoisiksi.', 'Puolikas on kaksi neljäsosaa, ei yksi: 2/4 + 1/4 = 3/4.'],
    },
  },
  'M-FRAC-14': {
    beats: [
      { text: 'Samasta altaasta on varattu 3/4, ja siitä otetaan pois 1/3 altaasta. Neljäsosat ja kolmasosat ovat eri kokoisia.', pic: 0 },
      { text: 'Jaetaan allas 12 yhtä suureen osaan. Silloin 3/4 = 9/12 ja 1/3 = 4/12.', pic: 1 },
      { text: 'Nyt vähennetään palat: 9/12 − 4/12 = 5/12. Köydessä on 24 osaa: 18/24 − 8/24 = 10/24, sama määrä.', pic: 2 },
    ],
    try: {
      say: 'Paljonko on 3/4 − 1/2?',
      options: ['1/4', '2/2', '2/4'],
      answer: 0,
      explain: 'Puolikas on 2/4. Nyt palat ovat neljäsosia: 3/4 − 2/4 = 1/4.',
      why: [null, 'Nimittäjiä ei vähennetä. Tee palat ensin samankokoisiksi: 1/2 = 2/4.', 'Puolikas on kaksi neljäsosaa, ei yksi: 3/4 − 2/4 = 1/4.'],
    },
  },
};
