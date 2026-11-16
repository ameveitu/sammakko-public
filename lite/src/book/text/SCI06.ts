import type { PageText } from '../text';

/** SCI06 Taivaan karttahuone: near space, day and night, seasons and the structure and scales of the universe. */
export const TEXT: Record<string, PageText> = {
  'ENV-PHY-SPACE-NEAR-01': {
    beats: [
      { text: 'Halkaisija on matka pallon poikki sen keskikohdan kautta. Maan halkaisija on noin 12 742 km ja Kuun noin 3 474 km.', pic: 0 },
      { text: 'Maa on lähes neljä kertaa niin leveä kuin Kuu. Kuvan pallojen koot ovat oikeassa suhteessa, mutta niiden väli ei ole.', pic: 0 },
      { text: 'Kuun keskietäisyys Maasta on noin 384 400 km. Väliin mahtuisi noin 30 Maapalloa rivissä, joten koko ja etäisyys tutkitaan eri kuvissa.', more: 'Marsin pieni kuu Fobos on keskimäärin vain noin 22 km leveä. Se kiertää noin 9 400 km:n päässä Marsin keskipisteestä.', pic: 0 },
    ],
    try: {
      say: 'Mikä luku kertoo, kuinka kaukana Kuu on Maasta?',
      options: ['Keskietäisyys 384 400 km', 'Kuun halkaisija 3 474 km', 'Pallojen väli kuvassa'],
      answer: 0,
      explain: 'Etäisyys on kahden kohteen välinen matka. Halkaisija kertoo vain koon, ja kuvan pallojen väli ei ole mittakaavassa.',
      why: [null, 'Halkaisija kertoo Kuun koon, ei sitä, kuinka kaukana se on.', 'Kuvassa koot ovat oikeassa suhteessa, mutta pallojen väli ei ole.'],
    },
  },
  'ENV-PHY-DAYNIGHT-01': {
    beats: [
      { text: 'Aurinko valaisee Maasta aina sen puoliskon, joka on Aurinkoon päin. Valoisalla puoliskolla on päivä ja varjon puolella yö.', pic: 0, figure: false },
      { text: 'Maa pyörii akselinsa ympäri kerran vuorokaudessa. Kotisaari A on nyt Aurinkoon päin, joten siellä on päivä.', more: 'Akseli on kuviteltu viiva, joka kulkee Maan läpi pohjoisnavalta etelänavalle.', pic: 0, figure: false },
      { text: 'Kun Maa on pyörähtänyt puoli kierrosta, kotisaari on varjon puolella ja siellä on yö. Aurinko ei kierrä Maata, vaan Maan pyöriminen tuo päivän ja yön.', pic: 0, figure: false },
    ],
    try: {
      say: 'Kotisaari on Aurinkoon päin. Maa pyörähtää puoli kierrosta akselinsa ympäri. Mitä kotisaarella on nyt?',
      options: ['Yö', 'Päivä', 'Talvi'],
      answer: 0,
      explain: 'Puolen kierroksen jälkeen kotisaari on Maan varjon puolella, poispäin Auringosta. Siksi siellä on yö.',
      why: [null, 'Puolen kierroksen jälkeen kotisaari on kääntynyt poispäin Auringosta.', 'Pyöriminen tuo päivän ja yön. Vuodenajat syntyvät Maan kiertäessä Aurinkoa.'],
    },
  },
  'ENV-PHY-SEASONS-01': {
    beats: [
      { text: 'Taulukossa on kaksi paikkaa yhtä kaukana päiväntasaajasta, toinen pohjoisessa ja toinen etelässä. Kesäkuussa päivä kestää pohjoisessa 15,4 h ja etelässä vain 8,6 h.', pic: 0 },
      { text: 'Keskipäivällä Aurinko nousee pohjoisessa 68,4 asteen korkeuteen, etelässä vain 21,6 asteeseen. Korkealta paistava Aurinko lämmittää maata enemmän.', pic: 0 },
      { text: 'Maan akseli on kallellaan ja osoittaa koko vuoden samaan suuntaan. Kesäkuussa pohjoinen puolisko on kallistunut Aurinkoon päin, joten siellä on kesä.', more: 'Kun Maa kiertää Auringon, puoliskot kallistuvat vuorotellen Aurinkoon päin. Joulukuussa tilanne on toisin päin: etelässä on kesä ja pohjoisessa talvi.', pic: 0 },
    ],
    try: {
      say: 'Kesäkuussa pohjoisessa on kesä. Mikä vuodenaika on samaan aikaan paikassa, joka on yhtä kaukana päiväntasaajasta etelässä?',
      options: ['Talvi', 'Kesä'],
      answer: 0,
      explain: 'Akseli kallistaa pohjoisen puoliskon Aurinkoon päin ja eteläisen poispäin. Jos vuodenajat johtuisivat etäisyydestä Aurinkoon, koko Maassa olisi sama vuodenaika.',
      why: [null, 'Kun pohjoinen puolisko on kallistunut Aurinkoon päin, eteläinen on kallistunut siitä poispäin.'],
    },
  },
  'PHY79-UNIVERSE-SCALE': {
    beats: [
      { text: 'Planeettojen välejä mitataan astronomisina yksikköinä. 1 AU on Maan keskietäisyys Auringosta, noin 150 miljoonaa km.', pic: 0 },
      { text: 'Tähtien välit mitataan valovuosina. Valovuosi on matka, jonka valo kulkee vuodessa: noin 9,46 biljoonaa km.', more: 'Valovuosi on pituuden yksikkö, ei aika. Auringon lähin naapuritähti Proxima Centauri on noin 4,2 valovuoden päässä.', pic: 0 },
      { text: 'Galaksin mittoihin käytetään kiloparsekkia: 1 kpc ≈ 3 260 valovuotta. Linnunradan läpimitta on noin 30 kpc eli noin 100 000 valovuotta.', pic: 0 },
    ],
    try: {
      say: 'Auringon lähin naapuritähti on noin 4 valovuoden päässä. Mihin mittakaavaan tämä väli kuuluu?',
      options: ['Tähtien välit', 'Planeettojen välit', 'Galaksin mitta'],
      answer: 0,
      explain: 'Valovuosi on tähtien välien yksikkö. 4 valovuotta on yli 250 000 AU, mutta vain pieni osa Linnunradan läpimitasta.',
      why: [null, 'Planeetat ovat korkeintaan kymmenien AU:iden päässä Auringosta, ja 4 valovuotta on yli 250 000 AU.', 'Linnunrata on noin 100 000 valovuotta leveä, joten 4 valovuotta on sen rinnalla pieni matka.'],
    },
  },
  'PHY79-UNIVERSE-STRUCT': {
    beats: [
      { text: 'Kuu kiertää Maata, ja Maa kiertää Aurinkoa. Aurinko on tähti, ja se muodostaa kiertolaistensa kanssa Aurinkokunnan.', pic: 0, figure: false },
      { text: 'Aurinkokunta on pieni osa Linnunradan galaksia. Järjestys pienestä suureen on Kuu, Maa–Kuu-järjestelmä, Aurinkokunta ja Linnunrata.', pic: 0, figure: false },
      { text: 'Tähtijoukko on tiivis tähtien ryhmä galaksin sisällä. Galaksi on paljon suurempi: Linnunradassa on satoja miljardeja tähtiä sekä kaasua ja pölyä.', pic: 0, figure: false },
    ],
    try: {
      say: 'Linnunradasta löytyy tiivis, noin tuhannen tähden ryhmä. Mikä se on?',
      options: ['Tähtijoukko', 'Galaksi', 'Aurinkokunta'],
      answer: 0,
      explain: 'Tähtijoukko on tähtien ryhmä galaksin sisällä. Galaksi on paljon suurempi rakenne, jossa voi olla monia tähtijoukkoja.',
      why: [null, 'Galaksissa on satoja miljardeja tähtiä, ja tämä ryhmä on Linnunradan sisällä.', 'Aurinkokunnassa on vain yksi tähti, Aurinko.'],
    },
  },
};
