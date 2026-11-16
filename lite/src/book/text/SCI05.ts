import type { PageText } from '../text';

/** SCI05 Valon ja kaiun luolat: light paths and shadows, vibration and how sound travels. */
export const TEXT: Record<string, PageText> = {
  'ENV-PHY-LIGHT-OBS-01': {
    beats: [
      { text: 'Lamppu valaisee seinää, ja lampun ja seinän välissä on pieni levy. Seinään jää levyn varjo, koska valo ei pääse levyn läpi.', pic: 0, figure: false },
      { text: 'Kun levyä siirretään ylöspäin, varjo siirtyy seinällä myös ylöspäin. Varjo liikkuu samaan suuntaan kuin este.', pic: 0, figure: false },
      { text: 'Varjo on isompi kuin levy, koska lampun valo leviää. Siksi varjo myös siirtyy pidemmän matkan kuin levy.', more: 'Tässä mallissa levy on lähempänä lamppua kuin seinää. Mitä lähempänä lamppua este on, sitä suurempi varjo.', pic: 0, figure: false },
    ],
    try: {
      say: 'Taskulamppu on pöydällä, ja sen edessä on lelu. Lelua siirretään alaspäin. Mihin varjo seinällä liikkuu?',
      options: ['Alaspäin', 'Ylöspäin', 'Ei mihinkään'],
      answer: 0,
      explain: 'Valo kulkee suoraan. Kun este laskee, sen varjostama kohta seinällä laskee myös.',
      why: [null, 'Kun lamppu pysyy paikallaan, varjo liikkuu samaan suuntaan kuin este.', 'Este liikkui, joten valo pysähtyy eri kohdassa ja varjo siirtyy.'],
    },
  },
  'ENV-PHY-SOUND-OBS-01': {
    beats: [
      { text: 'Ääni syntyy, kun jokin värähtelee eli liikkuu nopeasti edestakaisin. Rummun kalvo värähtelee, kun siihen lyödään.', pic: 0, figure: false },
      { text: 'Kalvo värähtelee 300 kertaa sekunnissa. Kun värähtely nopeutuu 400 kertaan sekunnissa, sävel kuulostaa korkeammalta.', more: 'Värähdysten määrää sekunnissa sanotaan taajuudeksi. Sen yksikkö on hertsi: 400 Hz on 400 värähdystä sekunnissa.', pic: 0, figure: false },
      { text: 'Jos kalvo liikkuu laajemmin edestakaisin, ääni on voimakkaampi. Sävel pysyy samana, jos värähtelyn nopeus ei muutu.', pic: 0, figure: false },
    ],
    try: {
      say: 'Kitaran kieli värähtelee nopeammin kuin äsken. Miten ääni muuttuu?',
      options: ['Sävel nousee korkeammaksi', 'Sävel laskee matalammaksi', 'Ääni hiljenee'],
      answer: 0,
      explain: 'Nopeampi värähtely eli suurempi taajuus kuulostaa korkeammalta säveleltä.',
      why: [null, 'Matala sävel syntyy hitaasta värähtelystä.', 'Voimakkuus riippuu siitä, kuinka laajasti kieli värähtelee, ei nopeudesta.'],
    },
  },
  'ENV-PHY-LIGHT-EXPLAIN-01': {
    beats: [
      { text: 'Valo lähtee lampusta ja kulkee suoraan, kunnes se osuu johonkin. Reitti on lähde → este → pinta.', pic: 0, figure: false },
      { text: 'Läpinäkymätön este pysäyttää osan valosta. Pinnalle jää varjo juuri sinne, minne suora valo ei pääse.', pic: 0, figure: false },
      { text: 'Varjon paikan voi päätellä piirtämällä suoran viivan lampusta esteen reunan ohi pinnalle.', pic: 0, figure: false },
    ],
    try: {
      say: 'Missä järjestyksessä lampun, esteen ja seinän pitää olla, jotta seinään tulee esteen varjo?',
      options: ['Lamppu → este → seinä', 'Este → lamppu → seinä', 'Lamppu → seinä → este'],
      answer: 0,
      explain: 'Este on lampun ja seinän välissä, joten se pysäyttää osan valosta ennen kuin valo ehtii seinälle.',
      why: [null, 'Este on lampun takana, joten valo pääsee seinälle esteettä.', 'Este on seinän takana, eikä se voi varjostaa seinää.'],
    },
  },
  'ENV-PHY-SOUND-EXPLAIN-01': {
    beats: [
      { text: 'Värähtelevä kalvo tönii vieressään olevaa ilmaa. Ilma välittää tönäisyn eteenpäin, kunnes värähtely saapuu korvaan.', pic: 0, figure: false },
      { text: 'Ilma itse ei matkusta kalvolta korvaan, vain värähtely kulkee. Ketju on lähde → väliaine → kuulija.', more: 'Väliaine on aine, jossa ääni kulkee: esimerkiksi ilma, vesi tai puu.', pic: 0, figure: false },
      { text: 'Ääni kulkee myös vedessä ja kiinteissä aineissa. Tyhjiössä ei ole ainetta, joten siellä ääni ei kulje.', pic: 0, figure: false },
    ],
    try: {
      say: 'Miksi avaruuden tyhjiössä ei kuulu ääntä?',
      options: ['Ei ole ainetta, joka välittäisi värähtelyn', 'Avaruudessa on liian kylmä', 'Ääni kulkee siellä liian nopeasti'],
      answer: 0,
      explain: 'Ääni tarvitsee väliaineen, kuten ilman tai veden. Tyhjiössä värähtely ei pääse etenemään.',
      why: [null, 'Kylmässäkin ilmassa ääni kulkee. Ratkaisevaa on, onko ainetta.', 'Ääni ei kulje tyhjiössä lainkaan.'],
    },
  },
  'ENV-PHY-LIGHT-01': {
    beats: [
      { text: 'Tutkimus etenee näin: ensin ennuste, sitten koe ja lopuksi selitys. Ennuste: kun este nousee, varjo nousee.', pic: 0, figure: false },
      { text: 'Kokeessa siirretään vain estettä, ja lamppu ja seinä pysyvät paikallaan. Varjo nousi, kuten ennustettiin.', pic: 0, figure: false },
      { text: 'Selitys: valo kulkee suoraan, ja este pysäyttää sen. Varjo on siellä, minne valo ei pääse.', pic: 0, figure: false },
    ],
    try: {
      say: 'Loikka siirtää yhtä aikaa estettä ja lamppua. Miksi koe ei ole hyvä?',
      options: ['Ei tiedetä, kumpi siirsi varjoa', 'Lamppua ei saa koskaan liikuttaa', 'Varjo ei voi liikkua'],
      answer: 0,
      explain: 'Kun muutetaan vain yhtä asiaa kerrallaan, tiedetään, mikä muutoksen aiheutti.',
      why: [null, 'Lampun saa siirtää, mutta silloin estettä ei siirretä samalla kertaa.', 'Varjo liikkuu, kun este tai lamppu liikkuu.'],
    },
  },
  'ENV-PHY-SOUND-01': {
    beats: [
      { text: 'Tutkitaan kahta asiaa: värähtelyn nopeutta eli taajuutta ja värähtelyn laajuutta. Muutetaan vain yhtä kerrallaan, toinen pysyy samana.', pic: 0, figure: false },
      { text: 'Kun taajuus nousee 300 hertsistä 400 hertsiin, sävel korkenee mutta voimakkuus pysyy. Kun laajuus kasvaa, ääni voimistuu mutta sävel pysyy.', pic: 0, figure: false },
      { text: 'Sama kuuluu soittimissa: lyhyt ja kireä kieli värähtelee nopeasti ja soi korkealta. Kovempi näppäys saa kielen soimaan voimakkaammin.', pic: 0, figure: false },
    ],
    try: {
      say: 'Aava haluaa tietää, muuttaako kova näppäys kielen säveltä. Mitä hän muuttaa kokeessa?',
      options: ['Vain näppäyksen voimakkuutta', 'Voimakkuutta ja kielen pituutta', 'Ei mitään'],
      answer: 0,
      explain: 'Kun muuttuu vain yksi asia, tiedetään, että juuri se vaikutti ääneen.',
      why: [null, 'Kaksi muutosta yhtä aikaa: ei tiedetä, kumpi vaikutti.', 'Jos mitään ei muuteta, vertailtavaa ei ole.'],
    },
  },
};
