import type { PageText } from '../text';

/** SCI01 Havaintojen laguuni: observing, describing, comparing and recording what was seen. */
export const TEXT: Record<string, PageText> = {
  'SCI-ENV-OBSERVE-01': {
    beats: [
      { text: 'Aava katsoo lehteä suurennuslasilla: lehti on vihreä, ja siinä on reikä. Molemmat näkyvät, joten ne kirjataan vihkoon.', more: 'Söikö toukka reiän? Sitä ei näe, joten se on arvaus.', pic: 0 },
      { text: 'Sienestä näkyy ruskea, sileä hattu. Myrkyllisyyttä ei näe, joten "sieni on myrkyllinen" ei ole havainto vaan arvaus.', more: 'Havainto on se, minkä näet. Vihkoon kirjataan vain havainnot.', pic: 1 },
    ],
    try: 'auto',
  },
  'SCI-ENV-DESCRIBE-01': {
    beats: [
      { text: 'Kuvissa on samasta kohdasta 3 pientä aallonharjaa, ennen ja jälkeen. Lause "Kuvassa on 3 aallonharjaa" kertoo vain näkyvän asian: se on havainto.', pic: 0 },
      { text: '"Vene ajoi juuri ohi" ei näy kuvassa, joten se on arvaus. Kuvaile vain sitä, minkä näet: montako, missä ja minkä kokoisia.', more: 'Tarkan kuvauksen avulla ystäväkin löytää saman kohdan.', pic: 0 },
    ],
    try: 'auto',
  },
  'SCI-ENV-COMPARE-02': {
    beats: [
      { text: 'Kivi A on 6 cm pitkä ja kivi C 7 cm pitkä. Pituutta verrataan pituuteen: C on 1 cm pidempi.', pic: 0 },
      { text: 'Reilussa vertailussa molemmista katsotaan samaa asiaa. A:n pituutta ei verrata C:n leveyteen.', more: 'Myös värejä voi verrata: A on harmaa ja C ruskea.', pic: 0 },
    ],
    try: 'auto',
  },
  'SCI-ENV-CLASSIFY-01': {
    beats: [
      { example: 'Sääntö: koriin menee lehti, jonka pituus on vähintään 6 cm.', text: 'Jokaiselta lehdeltä katsotaan vain pituutta. A (9 cm), C (6 cm) ja E (6 cm) menevät koriin, B ja D eivät.', more: '"Vähintään 6 cm" tarkoittaa 6 cm tai enemmän. Siksi myös 6 cm pitkä lehti menee koriin.', pic: 0 },
      { text: 'Uusi lehti U on 4 cm pitkä. Se on alle 6 cm, joten U ei mene koriin.', more: 'Sama sääntö käytetään jokaiseen lehteen, myös uuteen. Väri ei ratkaise, koska sääntö puhuu pituudesta.', pic: 0 },
    ],
    try: 'auto',
  },
  'SCI-ENV-RECORD-DATA-01': {
    beats: [
      { text: 'Rannalla Aava näkee simpukan ja metsässä kävyn. Kumpikin löytö merkitään heti oman paikkansa riville.', pic: 0 },
      { text: 'Vihkossa on rivi jokaiselle paikalle: niitty, kallio ja ranta. Rivin nimi kertoo paikan, kuva kertoo löydön.', more: 'Kun löydön merkitsee heti, se ei unohdu eikä mene väärälle riville.', pic: 1 },
    ],
    try: {
      say: 'Aava näkee niityllä kukan. Mihin vihkon riviin hän merkitsee sen?',
      options: ['Niityn riville', 'Rannan riville', 'Ensimmäiselle tyhjälle riville'],
      answer: 0,
      explain: 'Löytö merkitään sen paikan riville, jossa se nähtiin. Silloin vihko kertoo oikein, mistä kukka löytyi.',
      why: [null, 'Kukka nähtiin niityllä, ei rannalla.', 'Tyhjä rivi voi kuulua toiselle paikalle. Katso rivin nimeä.'],
    },
  },
  'SCI-ENV-PRESENT-DATA-01': {
    beats: [
      { text: 'Aava tekee havainnoista kuvan: paikat ylös ja löydöt niiden alle. Rannan alle tulee 3 simpukkaa, metsän alle 1 käpy.', pic: 0 },
      { text: 'Kuvasta voi lukea, mitä nähtiin, missä ja kuinka monta: niityllä 2 kukkaa, kalliolla 1 kivi ja rannalla 3 simpukkaa.', more: 'Pisin jono paikan alla kertoo, missä löytöjä oli eniten.', pic: 1 },
    ],
    try: {
      say: 'Missä paikassa nähtiin eniten löytöjä?',
      options: ['Metsässä', 'Niityllä', 'Rannalla'],
      answer: 0,
      explain: 'Metsän alla on pisin jono: 4 sientä. Se on eniten.',
      why: [null, 'Niityn alla on vain 1 kukka.', 'Rannan alla on 2 simpukkaa, metsän alla 4 sientä.'],
    },
  },
  'SCI-ENV-OBS-01': {
    beats: [
      { text: 'Hiekassa on 3 pientä painaumaa. Lause "Kuvassa on 3 painaumaa" kertoo vain näkyvän asian: se on havainto.', pic: 0 },
      { text: '"Lokki kävi rannalla" ei näy kuvassa. Se voi olla totta, mutta se on arvaus.', more: 'Havainnon voi tarkistaa katsomalla kuvaa. Arvausta ei voi.', pic: 0 },
    ],
    try: 'auto',
  },
  'SCI-ENV-COMPARE-01': {
    beats: [
      { text: 'Simpukka A on 9 cm pitkä ja simpukka D 3 cm pitkä. Pituutta verrataan pituuteen: A on 6 cm pidempi.', pic: 0 },
      { text: 'Lajittelussa jokaiseen simpukkaan käytetään samaa sääntöä. Säännöllä "pinta on sileä" A menee koriin, mutta karhea D ei mene.', pic: 0 },
    ],
    try: 'auto',
  },
  'SCI-ENV-RECORD-01': {
    beats: [
      { text: 'Retkellä Aava laskee löydöt joka paikassa ja merkitsee ne heti vihkoon: niityllä 2 kukkaa, kalliolla 1 kivi, rannalla 3 simpukkaa.', pic: 0 },
      { text: 'Kotona vihkosta tehdään kuva. Nyt Loikkakin näkee, mitä retkellä nähtiin, missä ja kuinka monta.', pic: 1 },
    ],
    try: {
      say: 'Kalliolla Aava näki 2 kiveä. Mitä hän merkitsee vihkoon?',
      options: ['kallio: 2 kiveä', 'kallio: 1 kivi', 'ranta: 2 kiveä'],
      answer: 0,
      explain: 'Vihkoon tulee paikka ja määrä: kalliolla 2 kiveä.',
      why: [null, 'Kiviä nähtiin kaksi, ei yksi.', 'Kivet nähtiin kalliolla, ei rannalla.'],
    },
  },
};
