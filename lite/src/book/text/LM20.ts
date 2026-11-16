import type { PageText } from '../text';

/** LM20 Havaintojen majakka: collecting observations, tables and diagrams. */
export const TEXT: Record<string, PageText> = {
  'M-DATA-01': {
    beats: [
      { text: 'Tutkimme pihan kukkien värejä. Kortit ovat A punainen kukka, B harmaa kivi, C keltainen kukka ja D punainen kukka.', pic: 0, figure: false },
      { text: 'Kerätään kaikki kukat: A, C ja D. Kivi B ei ole kukka, joten se jää pois.', pic: 0, figure: false },
      { text: 'Jos aiheena ovatkin kivien värit, samoista korteista kerätään vain B.', pic: 1, figure: false },
    ],
    try: {
      say: 'Aiheena ovat kukkien värit. Kortit: A sininen kukka, B ruskea käpy, C valkoinen kukka. Mitkä kerätään?',
      options: ['A ja C', 'Vain A', 'A, B ja C'],
      answer: 0,
      explain: 'Aiheeseen kuuluvat kaikki kukat, siis A ja C. Käpy ei ole kukka, joten se jätetään pois.',
      why: [null, 'Myös C on kukka, joten sekin kerätään.', 'Käpy B ei ole kukka, joten se ei kuulu aiheeseen.'],
    },
  },
  'M-DATA-03': {
    beats: [
      { example: 'Montako kalaa nähtiin tiistaina?', text: 'Etsi kalan rivi, joka kulkee sivulle, ja tiistain sarake, joka kulkee alas. Ne kohtaavat luvussa 6.', pic: 0 },
      { text: 'Sama rivi, eri sarake antaa eri luvun: sorsia nähtiin maanantaina 4 ja tiistaina 2. Katso siksi aina molemmat otsikot.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-DATA-06': {
    beats: [
      { text: 'Pylväsdiagrammissa jokaisella kalalla on oma pylväs. Pylvään yläpää näyttää vasemman reunan luvuista, montako kalaa nähtiin.', pic: 0 },
      { example: 'Montako särkeä nähtiin?', text: 'Luvut kasvavat yksi kerrallaan: 0, 1, 2… Särjen pylväs ulottuu lukuun 1, joten särkiä nähtiin yksi.', pic: 0 },
      { text: 'Ahvenen pylväs on korkein. Ahvenia nähtiin 5, eniten kaikista.', pic: 0 },
    ],
    try: {
      say: 'Ahvenen pylväs on korkeampi kuin hauen pylväs. Mitä se kertoo?',
      options: ['Ahvenia nähtiin enemmän', 'Ahven on isompi kala', 'Ahvenia nähtiin vähemmän'],
      answer: 0,
      explain: 'Pylvään korkeus kertoo, montako kalaa nähtiin. Korkeampi pylväs tarkoittaa enemmän havaintoja.',
      why: [null, 'Pylväs ei kerro kalan kokoa vaan sen, montako kalaa nähtiin.', 'Korkeampi pylväs tarkoittaa enemmän, ei vähemmän.'],
    },
  },
  'M-DATA-04': {
    beats: [
      { text: 'Taulukko tehdään näin: ensin otsikot, sitten jokaiselle eläimelle oma rivi. Havainnot siirretään yksi kerrallaan.', more: 'Lopuksi tarkistetaan, että taulukossa on yhtä monta havaintoa kuin alussa.', pic: 0 },
      { text: 'Viivat ja numero kertovat saman määrän: sorsia 7 ja kaloja 3. Jokainen rivi saa nimen ja määrän.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-DATA-05': {
    beats: [
      { example: 'Montako lokkia nähtiin?', text: 'Etsi rivi, jossa lukee lokki. Samalla rivillä on luku 7: lokkeja nähtiin seitsemän.', pic: 0 },
      { example: 'Minkä eläimen rivillä on luku 2?', text: 'Luku 2 on kalan rivillä. Taulukosta voi siis etsiä myös luvun avulla.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-DATA-07': {
    beats: [
      { text: 'Taulukossa on jokaisen kalan määrä. Pylväsdiagrammissa jokainen kala saa pylvään, joka nousee oman lukunsa kohdalle.', pic: 0 },
      { text: 'Hauki saa korkeimman pylvään, koska sen luku 6 on suurin. Ahvenia nähtiin 0, joten ahvenella ei ole pylvästä lainkaan.', pic: 0 },
    ],
    try: {
      say: 'Ahvenia nähtiin 0. Millainen pylväs ahvenelle piirretään?',
      options: ['Ei pylvästä lainkaan', 'Pieni pylväs, jotta ahven näkyy', 'Yhtä korkea kuin muille'],
      answer: 0,
      explain: 'Pylvään korkeus on määrä. Kun määrä on 0, pylvästä ei ole, ja ahvenen kohta jää tyhjäksi.',
      why: [null, 'Pienikin pylväs näyttäisi, että ahvenia nähtiin.', 'Pylväiden korkeus vaihtelee määrän mukaan.'],
    },
  },
  'M-DATA-08': {
    beats: [
      { text: 'Diagrammi näyttää tämän aamun havainnot. Laiturin pylväs on korkein: siellä havaintoja oli 5, eniten kaikista.', pic: 0 },
      { text: 'Poukamassa havaintoja oli vain 1, eli 4 vähemmän kuin laiturilla. Diagrammi kertoo vain tästä aamusta, ei huomisesta.', pic: 0 },
    ],
    try: {
      say: 'Laiturilla oli tänä aamuna eniten havaintoja. Mitä siitä voi sanoa varmasti?',
      options: ['Tänä aamuna laiturilla nähtiin eniten', 'Huomennakin laiturilla nähdään eniten', 'Laituri on eläinten lempipaikka'],
      answer: 0,
      explain: 'Diagrammi kertoo vain tämän aamun havainnoista. Huomisesta tai syistä se ei kerro mitään.',
      why: [null, 'Huomista ei ole vielä katsottu.', 'Diagrammi ei kerro, miksi eläimiä oli juuri siellä.'],
    },
  },
  'M-DATA-02': {
    beats: [
      { text: 'Jokainen ohi uiva eläin saa yhden viivan omalle rivilleen. Viides viiva vedetään vinoon neljän yli, jolloin viisi on helppo laskea.', pic: 0 },
      { text: 'Lopuksi tarkistetaan, että jokaisella havainnolla on oma viiva. Jos yksi puuttuu, se lisätään.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-DATA-12': {
    beats: [
      { text: 'Tässä kuvadiagrammissa jokainen ruutu on yhtä suuri. Selite kertoo, mitä yksi kuva tarkoittaa: yksi ruutu on 2 havaintoa.', pic: 0 },
      { example: 'Montako havaintoa tehtiin laiturilla?', text: 'Laiturilla on 4 ruutua, ja jokainen on 2 havaintoa: 4 × 2 = 8. Poukamassa on 1 ruutu eli 2 havaintoa.', pic: 0 },
    ],
    try: {
      say: 'Selitteen mukaan yksi kuva on 5 havaintoa, ja kalliolla on 3 kuvaa. Montako havaintoa siellä tehtiin?',
      options: ['15', '3', '8'],
      answer: 0,
      explain: 'Jokainen kuva on 5 havaintoa, joten 3 kuvaa on 3 × 5 = 15 havaintoa.',
      why: [null, '3 on kuvien määrä. Katso selitteestä, mitä yksi kuva tarkoittaa.', 'Kuvien määrää ja selitteen lukua ei lasketa yhteen vaan kerrotaan.'],
    },
  },
  'M-DATA-09': {
    beats: [
      { text: 'Maanantaina lintuja laskettiin 5 minuuttia, tiistaina tunnin. Tiistaina lintuja tuli enemmän vain siksi, että laskenta kesti kauemmin.', pic: 0 },
      { text: 'Järjestelmällinen tutkija sopii etukäteen, milloin ja kuinka kauan lasketaan. Kun tapa on joka kerta sama, tuloksia voi verrata.', pic: 0 },
      { text: 'Ensin kysymys, sitten havaintojen keruu ja lopuksi koonnin tarkistus. Tyhjän taulukon voi tehdä valmiiksi jo ennen keruuta.', pic: 1 },
    ],
    try: {
      say: 'Haluamme selvittää, minä päivänä koulun ohi ajaa eniten autoja. Mikä laskutapa on paras?',
      options: ['Joka päivä samaan aikaan vartin ajan', 'Yhtenä päivänä tunnin, toisena minuutin', 'Silloin kun ehtii, vaihtelevan ajan'],
      answer: 0,
      explain: 'Kun aika ja kesto ovat joka päivä samat, erot johtuvat autoista eivätkä laskutavasta.',
      why: [null, 'Tunnissa ehtii ohi enemmän autoja kuin minuutissa, vaikka liikenne olisi sama.', 'Vaihteleva aika muuttaa tulosta, joten päiviä ei voi verrata.'],
    },
  },
  'M-DATA-10': {
    beats: [
      { text: 'Jokaisessa merkinnässä on kaksi tietoa: päivä ja eläin. Taulukossa eläimet ovat riveillä ja päivät sarakkeissa.', pic: 0 },
      { text: 'Merkinnät lasketaan ruutuihin yksi kerrallaan. Merkintöjä ma 🦆 on kolme, joten maanantain sorsaruutuun tulee 3.', more: 'Maanantain kalaruutuun tulee 2, tiistain sorsaruutuun 2 ja tiistain kalaruutuun 1. Yhteensä 8, yhtä monta kuin merkintöjä.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-DATA-11': {
    beats: [
      { text: 'Rannat ovat erillisiä luokkia, joten niitä verrataan pylväsdiagrammilla. Poukaman pylväs on korkein, koska sen luku 10 on suurin.', pic: 0 },
      { text: 'Viivadiagrammi sopii, kun sama asia muuttuu ajan kuluessa. Esimerkiksi lämpötila mitataan joka tunti, ja viiva näyttää nousut ja laskut.', pic: null },
    ],
    try: {
      say: 'Järven veden lämpötila mitattiin joka päivä viikon ajan. Mikä diagrammi näyttää muutoksen parhaiten?',
      options: ['Viivadiagrammi', 'Pylväsdiagrammi', 'Kuvadiagrammi'],
      answer: 0,
      explain: 'Viivadiagrammi yhdistää peräkkäiset mittaukset viivaksi, joten lämpötilan nousut ja laskut näkyvät heti.',
      why: [null, 'Pylväät sopivat erillisten luokkien vertailuun. Muutos ajan kuluessa näkyy paremmin viivana.', 'Kuvat sopivat lukumäärille, eivät lämpötilalle.'],
    },
  },
};
