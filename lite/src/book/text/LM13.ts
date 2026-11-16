import type { PageText } from '../text';

/** LM13 Lehtipurjeiden kuviopoukama: recognising, building, describing and classifying plane shapes. */
export const TEXT: Record<string, PageText> = {
  'M-GEO-04': {
    beats: [
      { text: 'Kynä kiertää kolmion reunan. Se piirtää kolme suoraa sivua ja kääntyy kolmessa kulmassa.', more: 'Ympyrässä ei ole yhtään kulmaa. Sen reuna kaartuu tasaisesti koko matkan.', pic: 0 },
      { text: 'Suorakulmiossa on neljä sivua, ja jokainen kulma on suora kuin kirjan nurkka. Neliö on suorakulmio, jonka kaikki sivut ovat yhtä pitkiä.', pic: 1 },
      { text: 'Käännetty neliö näyttää vinolta. Sivut ja kulmat pysyvät samoina, joten se on yhä neliö.', pic: 3 },
    ],
    try: 'auto',
  },
  'M-GEO-06': {
    beats: [
      { text: 'Mallipurje on kolmio. Sen pohja on viisi ruutua pitkä, ja huippu on neljä ruutua pohjan yläpuolella.', pic: 0 },
      { text: 'Uusi purje tehdään kärki kerrallaan: lasketaan ruudut kärjestä seuraavaan. Lopuksi viimeinen kärki yhdistetään ensimmäiseen.', pic: 0 },
      { text: 'Kun sivut ovat yhtä pitkiä kuin mallissa, purjeet ovat samanlaiset. Uusi purje sopii, vaikka sen kääntäisi.', pic: 0 },
    ],
    try: {
      say: 'Loikan kolmiopurjeesta puuttuu viimeinen sivu. Mitä hän tekee?',
      options: ['Yhdistää viimeisen kärjen ensimmäiseen', 'Lisää neljännen kärjen', 'Aloittaa alusta'],
      answer: 0,
      explain: 'Kuvio suljetaan yhdistämällä viimeinen kärki ensimmäiseen. Silloin kolmiossa on kolme sivua.',
      why: [null, 'Kolmiossa on vain kolme kärkeä. Neljäs kärki tekisi toisen kuvion.', 'Valmiit sivut ovat oikein, joten alusta ei tarvitse aloittaa.'],
    },
  },
  'M-GEO-2D-PROP-NAME': {
    beats: [
      { text: 'Kuvion reunan suora osa on sivu. Kohta, jossa kaksi sivua kohtaavat, on kärki.', pic: 0 },
      { text: 'Kärjessä sivujen väliin jää kulma. Tämä kulma on suora, kuin kirjan nurkka.', pic: 1 },
      { text: 'Suoraa kulmaa kapeampi kulma on terävä. Suoraa kulmaa leveämpi kulma on tylppä.', pic: 1 },
    ],
    try: {
      say: 'Kulma on kapeampi kuin kirjan nurkka. Millainen kulma se on?',
      options: ['Terävä', 'Tylppä', 'Suora'],
      answer: 0,
      explain: 'Kirjan nurkka on suora kulma. Sitä kapeampi kulma on terävä.',
      why: [null, 'Tylppä kulma on leveämpi kuin kirjan nurkka.', 'Suora kulma on juuri yhtä leveä kuin kirjan nurkka.'],
    },
  },
  'M-GEO-2D-CLASSIFY': {
    beats: [
      { text: 'Ryhmän sääntö on: kaikki sivut yhtä pitkiä. Jokainen kuvio tarkistetaan erikseen.', pic: 0 },
      { text: 'Neliö C pääsee ryhmään. Suorakulmio A ja kolmio B jäävät pois, koska niiden sivut ovat eri pituisia.', pic: 0 },
      { text: 'Säännön pitää kertoa kuviosta itsestään. Asento ei käy säännöksi, koska se muuttuu, kun kuviota käännetään.', pic: 0 },
    ],
    try: {
      say: 'Mikä näistä on hyvä ryhmän sääntö?',
      options: ['Kuviossa on neljä sivua', 'Kuvio on pystyssä', 'Kuvio on pöydän vasemmalla puolella'],
      answer: 0,
      explain: 'Sivujen määrä pysyy samana, vaikka kuviota käännettäisiin tai siirrettäisiin.',
      why: [null, 'Asento muuttuu, kun kuviota käännetään. Kuvio pysyy silti samana.', 'Paikka pöydällä ei kerro kuviosta mitään.'],
    },
  },
  'M-GEO-10': {
    beats: [
      { text: 'Kuvio A on monikulmio. Sen reuna kulkee pelkkiä suoria sivuja pitkin ja palaa takaisin alkuun.', more: 'Monikulmiossa saa olla sisäänpäin kääntyvä lovi, kuten A:ssa.', pic: 0 },
      { text: 'B ei ole monikulmio, koska sen reunassa on kaari. C ei ole, koska sen reuna jää auki.', pic: 0 },
      { text: 'Monikulmion reuna on siis suljettu, sen sivut ovat suoria, eivätkä sivut risteä keskenään.', pic: 0 },
    ],
    try: {
      say: 'Onko kolmio monikulmio?',
      options: ['On', 'Ei ole'],
      answer: 0,
      explain: 'Kolmion reuna on suljettu ja kulkee kolmea suoraa sivua pitkin. Se on monikulmio, vaikka sivuja on vain kolme.',
      why: [null, 'Monikulmioksi riittää suljettu reuna ja suorat sivut. Kolme sivua riittää.'],
    },
  },
  'M-GEO-CIRCLE-ID': {
    beats: [
      { text: 'B on ympyrä: litteä kuvio, jonka reuna on joka kohdasta yhtä kaukana keskipisteestä.', pic: 0 },
      { text: 'A on pallo. Pallo on kappale, jonka voi ottaa käteen, mutta ympyrä piirretään paperille.', more: 'Soikea kuvio eli ellipsi ei ole ympyrä. Sen reuna on toisista kohdista kauempana keskeltä kuin toisista.', pic: 0 },
    ],
    try: {
      say: 'Mikä näistä on ympyrä?',
      options: ['Kolikon ympäri piirretty viiva', 'Jalkapallo', 'Kananmunan ääriviiva'],
      answer: 0,
      explain: 'Kolikon ympäri piirretty viiva tekee litteän kuvion, jonka reuna on joka kohdasta yhtä kaukana keskeltä.',
      why: [null, 'Jalkapallo on kappale eli pallo. Ympyrä on litteä.', 'Munan ääriviiva on soikea: se on eri kohdista eri kaukana keskeltä.'],
    },
  },
  'M-GEO-CIRCLE-PROP': {
    beats: [
      { text: 'Ympyrän keskellä on keskipiste A. Jana keskipisteestä kehälle on säde, esimerkiksi A–C ja A–D.', pic: 0 },
      { text: 'Kaikki säteet ovat yhtä pitkiä, koska kehän jokainen piste on yhtä kaukana keskipisteestä.', pic: 0 },
      { text: 'Halkaisija B–D kulkee kehältä kehälle keskipisteen kautta. Siihen mahtuu kaksi sädettä.', pic: 0 },
    ],
    try: {
      say: 'Ympyrän säde on 3 cm. Kuinka pitkä on halkaisija?',
      options: ['6 cm', '3 cm', '1,5 cm'],
      answer: 0,
      explain: 'Halkaisija kulkee keskipisteen kautta, joten se on kaksi sädettä: 3 cm + 3 cm = 6 cm.',
      why: [null, '3 cm on säde. Halkaisija on kaksi kertaa niin pitkä.', '1,5 cm olisi puolet säteestä.'],
    },
  },
  'M-GEO-13': {
    beats: [
      { text: 'Ikkunaan tarvitaan ympyrä. Kuvio A on soikea ja C on pallo, joten ympyrä on B.', pic: 0 },
      { text: 'Alemmassa ympyrässä keskipiste on B. Säteet B–A ja B–D ovat yhtä pitkiä.', more: 'Piste C on lähellä keskustaa, mutta se ei ole keskipiste.', pic: 0 },
      { text: 'Halkaisija D–E kulkee kehältä kehälle keskipisteen B kautta. Se on kahden säteen pituinen.', pic: 0 },
    ],
    try: {
      say: 'Ympyrän halkaisija on 10 cm. Kuinka pitkä on säde?',
      options: ['5 cm', '10 cm', '20 cm'],
      answer: 0,
      explain: 'Säde on puolet halkaisijasta: 10 cm : 2 = 5 cm.',
      why: [null, '10 cm on koko halkaisija. Säde ulottuu vain keskipisteestä kehälle.', '20 cm olisi kaksi halkaisijaa.'],
    },
  },
  'M-GEO-TRI-PROP': {
    beats: [
      { text: 'Kolmiossa on kolme kärkeä ja kolme sivua. Kärjet nimetään kirjaimilla A, B ja C.', pic: 0 },
      { text: 'Sivu nimetään sen päissä olevien kärkien kirjaimilla, esimerkiksi AB. Kulma nimetään kärkensä mukaan: tämän kolmion suora kulma on kärjessä A.', pic: 0 },
    ],
    try: {
      say: 'Mitkä kaksi sivua kohtaavat kärjessä A?',
      options: ['AB ja AC', 'AB ja BC', 'BC ja AC'],
      answer: 0,
      explain: 'Kärjessä A kohtaavat ne sivut, joiden nimessä on A: AB ja AC.',
      why: [null, 'BC kulkee kärjestä B kärkeen C, ei kärjen A kautta.', 'BC kulkee kärjestä B kärkeen C, ei kärjen A kautta.'],
    },
  },
  'M-GEO-TRI-CLASS': {
    beats: [
      { text: 'Kolmiot voi luokitella sivujen mukaan. Tasasivuisessa kaikki kolme sivua ovat yhtä pitkiä, tasakylkisessä vähintään kaksi.', pic: 0 },
      { text: 'Purjeen A kaikki sivut ovat eri pituisia. Siksi se on erisivuinen.', more: 'Purjeen A kaikki kulmat ovat teräviä, joten kulmien mukaan se on teräväkulmainen.', pic: 0 },
      { text: 'Kulmien mukaan saadaan toinen luokka. Suora kulma tekee kolmiosta suorakulmaisen, tylppä kulma tylppäkulmaisen, muuten se on teräväkulmainen.', pic: 0 },
    ],
    try: {
      say: 'Kolmiossa on suora kulma ja kaksi yhtä pitkää sivua. Mikä se on?',
      options: ['Suorakulmainen ja tasakylkinen', 'Vain suorakulmainen', 'Vain tasakylkinen'],
      answer: 0,
      explain: 'Sivuluokka ja kulmaluokka kertovat eri asioista, joten kolmiolla voi olla kummastakin oma nimi.',
      why: [null, 'Myös sivut kertovat luokan: kaksi yhtä pitkää sivua tekee siitä tasakylkisen.', 'Myös kulma kertoo luokan: suora kulma tekee siitä suorakulmaisen.'],
    },
  },
  'M-GEO-QUAD-PROP': {
    beats: [
      { text: 'Tässä ikkunassa on neljä kärkeä ja neljä sivua. Niin on jokaisessa nelikulmiossa.', pic: 0 },
      { text: 'Kaikki neljä kulmaa ovat suoria. Sivut eivät ole kaikki yhtä pitkiä: pystysivut ovat pidempiä kuin vaakasivut.', pic: 0 },
      { text: 'Vastakkaiset sivut eivät kosketa toisiaan, kuten AB ja CD. Tässä ikkunassa ne ovat yhtä pitkiä.', pic: 0 },
    ],
    try: {
      say: 'Mitkä sivut ovat vastakkaiset?',
      options: ['AB ja CD', 'AB ja BC', 'CD ja DA'],
      answer: 0,
      explain: 'AB ja CD eivät kosketa toisiaan, joten ne ovat ikkunan vastakkaiset sivut.',
      why: [null, 'AB ja BC kohtaavat kärjessä B, joten ne ovat vierekkäiset.', 'CD ja DA kohtaavat kärjessä D, joten ne ovat vierekkäiset.'],
    },
  },
  'M-GEO-QUAD-CLASS': {
    beats: [
      { text: 'Tässä ikkunassa on neljä suoraa kulmaa, joten se on suorakulmio. Lisäksi kaikki sivut ovat yhtä pitkiä, joten se on myös neliö.', pic: 0 },
      { text: 'Samaan kuvioon sopii monta nimeä. Neliö on myös suorakulmio, suunnikas, trapetsi ja nelikulmio.', more: 'Suunnikkaassa vastakkaiset sivut ovat pareittain yhdensuuntaisia. Trapetsissa on vähintään yksi yhdensuuntainen sivupari, joten neliökin kelpaa.', pic: 0 },
      { text: 'Toisin päin ei käy: kaikki suorakulmiot eivät ole neliöitä. Pitkässä suorakulmiossa sivut ovat eri pituisia.', pic: 0 },
    ],
    try: {
      say: 'Onko jokainen neliö suorakulmio?',
      options: ['On', 'Ei ole'],
      answer: 0,
      explain: 'Suorakulmiossa on neljä suoraa kulmaa. Neliössä ne ovat, joten neliö on aina myös suorakulmio.',
      why: [null, 'Neliössä on neljä suoraa kulmaa, ja se riittää suorakulmioksi.'],
    },
  },
  'M-GEO-11': {
    beats: [
      { text: 'Purjeen pitää olla tasakylkinen: siinä on vähintään kaksi yhtä pitkää sivua. Sivuja verrataan yksi kuvio kerrallaan.', pic: 0 },
      { text: 'Kuviossa C sivut BC ja CA ovat yhtä pitkät. Siksi C on tasakylkinen, ja se kelpaa purjeeksi.', more: 'Valinta perustellaan havainnolla: osoitetaan juuri ne kaksi sivua, jotka ovat yhtä pitkät.', pic: 0 },
    ],
    try: {
      say: 'Kolmion sivut ovat 5 cm, 5 cm ja 3 cm. Mikä kolmio se on sivujen mukaan?',
      options: ['Tasakylkinen', 'Tasasivuinen', 'Erisivuinen'],
      answer: 0,
      explain: 'Kaksi sivua on 5 cm pitkiä. Vähintään kaksi yhtä pitkää sivua tekee kolmiosta tasakylkisen.',
      why: [null, 'Tasasivuisessa kaikki kolme sivua ovat yhtä pitkiä, tässä vain kaksi.', 'Erisivuisessa kaikki sivut ovat eri pituisia, tässä kaksi on samoja.'],
    },
  },
  'M-GEO-12': {
    beats: [
      { text: 'Ikkunaan tarvitaan nelikulmio, jossa on tasan yksi pari yhdensuuntaisia vastakkaisia sivuja. Yhdensuuntaiset sivut kulkevat samaan suuntaan eivätkä koskaan kohtaa.', pic: 0 },
      { text: 'Kuviossa 3 sivut BC ja DA ovat yhdensuuntaiset, mutta AB ja CD eivät. Siksi kuvio 3 on trapetsi ja nelikulmio.', more: 'Neliössä 1 yhdensuuntaisia pareja on kaksi, joten se ei täytä ehtoa "tasan yksi pari".', pic: 0 },
    ],
    try: {
      say: 'Nelikulmiossa on tasan yksi pari yhdensuuntaisia sivuja. Mikä se on?',
      options: ['Trapetsi', 'Suunnikas', 'Suorakulmio'],
      answer: 0,
      explain: 'Yksi yhdensuuntainen sivupari riittää trapetsiin. Suunnikkaaseen ja suorakulmioon tarvitaan kaksi paria.',
      why: [null, 'Suunnikkaassa yhdensuuntaisia pareja on kaksi.', 'Suorakulmiossa on kaksi yhdensuuntaista paria ja neljä suoraa kulmaa.'],
    },
  },
};
