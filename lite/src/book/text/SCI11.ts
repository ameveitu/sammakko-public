import type { PageText } from '../text';

/** SCI11 Tuulien voimaluodot: forms of energy, transfer and transformation, conservation, sources and their impacts. */
export const TEXT: Record<string, PageText> = {
  'ENV-PHY-ENERGYFORM-01': {
    beats: [
      { text: 'Saaren rannassa vesi virtaa vauhdilla. Liikkuvalla vedellä on energiaa, koska se voi esimerkiksi pyörittää vesipyörää.', pic: 0, figure: false },
      { text: 'Liikkeeseen liittyvää energiaa sanotaan liike-energiaksi. Mitä nopeammin vesi virtaa, sitä enemmän sillä on liike-energiaa.', pic: 0, figure: false },
      { text: 'Energia ei ole esine, jonka voisi nähdä tai poimia. Se on tapa kuvata tilannetta: liikettä, korkeutta tai lämpöä.', more: 'Ylös nostettu kori voi pudota, ja auringon lämmittämä kivi voi lämmittää kättä. Niissäkin on energiaa, mutta eri muodossa kuin virtaavassa vedessä.', pic: 0, figure: false },
    ],
    try: {
      say: 'Lapsi istuu paikallaan liukumäen yläpäässä. Onko hänellä energiaa?',
      options: ['On, koska hän on korkealla', 'Ei, koska hän ei liiku', 'Ei, koska energiaa ei näe'],
      answer: 0,
      explain: 'Korkealla olevalla on energiaa, vaikka se ei liiku. Kun lapsi laskee alas, korkeuteen liittyvä energia muuttuu liike-energiaksi.',
      why: [null, 'Liike on vain yksi energian muoto. Myös korkeus tuo energiaa.', 'Energia ei ole näkyvä esine, mutta sen voi päätellä tilanteesta.'],
    },
  },
  'ENV-PHY-ENERGYTRANS-01': {
    beats: [
      { text: 'Virtaava vesi pyörittää vesipyörää, ja pyörä pyörittää sähkölaitetta. Laitteesta sähkö kulkee lamppuun, joka syttyy.', pic: 0, figure: false },
      { text: 'Energia kulkee ketjuna: liikkuva vesi → sähkö → valo ja lämpö. Energian muoto vaihtuu matkalla, eli energia muuntuu.', pic: 0, figure: false },
      { text: 'Alussa vedellä on 90 J energiaa, ja valoksi päätyy 45 J. Loput 45 J lämmittävät ympäristöä, joten energiaa ei synny eikä katoa.', more: 'J tarkoittaa joulea, joka on energian yksikkö. Lamppu ei siis tee energiaa itse: kaikki sen valo ja lämpö tulevat virtaavasta vedestä.', pic: 0, figure: false },
    ],
    try: {
      say: 'Taskulampun paristo sytyttää lampun. Mitä lampussa tapahtuu energialle?',
      options: ['Se muuntuu valoksi ja lämmöksi', 'Lamppu tekee sitä tyhjästä lisää', 'Se katoaa, kun lamppu palaa'],
      answer: 0,
      explain: 'Lamppu ei tee eikä hävitä energiaa. Pariston energia muuntuu valoksi, ja osa siitä lämmittää lamppua ja ympäristöä.',
      why: [null, 'Mikään laite ei tee energiaa tyhjästä. Lampun energia tulee paristosta.', 'Energia ei katoa: se muuttuu valoksi ja lämmöksi, jotka leviävät ympäristöön.'],
    },
  },
  'ENV-PHY-ENERGYCONS-01': {
    beats: [
      { text: 'Tutkitaan venettä, vettä ja ilmaa yhtenä kokonaisuutena. Alussa energiaa on 90 J, ja veneen liikkeeseen päätyy siitä 45 J.', pic: 0, figure: false },
      { text: 'Puuttuvat 45 J eivät katoa, vaan ne lämmittävät hieman vettä ja ilmaa. Yhteensä 45 J + 45 J = 90 J, eli energiaa on yhtä paljon kuin alussa.', pic: 0, figure: false },
      { text: 'Tätä sanotaan energian säilymiseksi: energiaa ei katoa eikä synny tyhjästä. Se vain siirtyy paikasta toiseen ja muuttaa muotoaan.', more: 'Ympäristöön siirtynyt lämpö leviää laajalle, joten sitä on vaikea huomata. Siksi näyttää helposti siltä, että energiaa katosi.', pic: 0, figure: false },
    ],
    try: {
      say: 'Lapsi laskee liukumäkeä. Ylhäällä energiaa on 100 J, alhaalla liikkeessä 70 J. Mihin loput 30 J menivät?',
      options: ['Ne lämmittivät mäkeä ja housuja', 'Ne katosivat kokonaan', 'Niitä ei ollut alun perinkään'],
      answer: 0,
      explain: 'Kitka lämmittää mäen pintaa ja housuja. Lämmöksi muuttui 30 J, joten yhteensä 70 J + 30 J = 100 J, yhtä paljon kuin alussa.',
      why: [null, 'Energia ei katoa. Se siirtyi lämpönä ympäristöön.', 'Alussa energiaa oli 100 J, ja kaikki 100 J löytyvät lopusta.'],
    },
  },
  'PHY79-ENERGY-01': {
    beats: [
      { text: 'Rajataan tarkasteltavaksi systeemiksi vene, vesi ja ilma. Alussa systeemin energia on 90 J, ja veneen liikkeeseen eli hyödylliseen osaan päätyy 45 J.', pic: 0, figure: false },
      { text: 'Energiatili täsmää, kun mukaan lasketaan veden ja ilman lämpeneminen: 90 J − 45 J = 45 J. Kokonaisenergia on edelleen 90 J.', pic: 0, figure: false },
      { text: 'Energian säilymislaki: suljetun systeemin kokonaisenergia ei muutu. Hyödyllisen osan osuus kaikesta on hyötysuhde, tässä 45 J / 90 J = 50 %.', more: 'Suljettu systeemi ei vaihda energiaa ympäristönsä kanssa. Siksi vesi ja ilma, joihin lämpö siirtyy, rajataan tässä systeemin sisään.', pic: 0, figure: false },
    ],
    try: {
      say: 'Lamppu saa 60 J sähköenergiaa, ja siitä 12 J muuttuu valoksi. Paljonko energiaa muuttuu lämmöksi?',
      options: ['48 J', '0 J', '72 J'],
      answer: 0,
      explain: 'Energia säilyy: 60 J = 12 J + lämpö, joten lämmöksi muuttuu 60 J − 12 J = 48 J. Lampun hyötysuhde on 12 J / 60 J = 20 %.',
      why: [null, 'Lampun kuori lämpenee, joten osa energiasta muuttuu lämmöksi.', 'Lämpöä ei voi syntyä enempää kuin lamppu sai energiaa. Vähennä, älä lisää.'],
    },
  },
  'PHY79-ENERGY-TRANSFER': {
    beats: [
      { text: 'Liikkuva vesi työntää vesipyörän siipiä ja antaa pyörälle 70 J. Energia siirtyy vedestä pyörään, mutta pysyy liike-energiana.', pic: 0, figure: false },
      { text: 'Lampussa käy toisin: sähköinen energia muuttuu valoksi saman laitteen sisällä. Silloin energia muuntuu eli sen muoto vaihtuu.', pic: 0, figure: false },
      { text: 'Siirtyminen kertoo, mistä mihin energia kulkee, ja muuntuminen, mistä muodosta mihin. Usein molemmat tapahtuvat yhtä aikaa.', more: 'Esimerkiksi puhelinta ladattaessa energia siirtyy sähköverkosta akkuun ja muuntuu samalla akun kemialliseksi energiaksi.', pic: 0, figure: false },
    ],
    try: {
      say: 'Kuuma kivi lasketaan kylmään veteen, ja vesi lämpenee. Onko kyse energian siirtymisestä vai muuntumisesta?',
      options: ['Siirtymisestä kivestä veteen', 'Muuntumisesta toiseksi muodoksi', 'Ei kummastakaan, koska mikään ei liiku'],
      answer: 0,
      explain: 'Energia kulkee kivestä veteen, mutta on koko ajan lämpöön liittyvää sisäenergiaa. Osapuoli vaihtuu, muoto ei.',
      why: [null, 'Energia on lämpönä sekä kivessä että vedessä, joten muoto ei vaihdu.', 'Energia voi siirtyä ilman näkyvää liikettä, esimerkiksi lämpönä.'],
    },
  },
  'PHY79-KINETIC': {
    beats: [
      { text: 'Vaunun massa on 3 kg ja nopeus 3 m/s. Liike-energia on E = ½mv² = ½ · 3 kg · (3 m/s)² = 13,5 J.', pic: 0, figure: false },
      { example: 'Mitä tapahtuu, kun massa kaksinkertaistuu 6 kg:aan?', text: 'Nopeus pysyy 3 m/s, joten E = ½ · 6 kg · (3 m/s)² = 27 J. Kaksinkertainen massa antaa kaksinkertaisen liike-energian.', pic: 0, figure: false },
      { text: 'Nopeus on kaavassa toiseen potenssiin, joten nopeuden kaksinkertaistus nelinkertaistaa energian. 3 kg:n vaunu nopeudella 6 m/s: ½ · 3 · 36 = 54 J.', more: 'Siksi kaksinkertainen ajonopeus nelinkertaistaa auton jarrutusmatkan: jarrujen on muutettava neljä kertaa enemmän liike-energiaa lämmöksi.', pic: 0, figure: false },
    ],
    try: {
      say: 'Pyöräilijä kiihdyttää nopeudesta 5 m/s nopeuteen 10 m/s. Montako kertaa suurempi on nyt liike-energia?',
      options: ['4 kertaa', '2 kertaa', 'Yhtä suuri, koska massa ei muutu'],
      answer: 0,
      explain: 'Nopeus kaksinkertaistuu, ja liike-energia riippuu nopeuden neliöstä: 2² = 4. Liike-energia on siis nelinkertainen.',
      why: [null, 'Kaksinkertaistuminen pätee massaan. Nopeus on kaavassa toiseen potenssiin.', 'Myös nopeus vaikuttaa liike-energiaan, ja jopa enemmän kuin massa.'],
    },
  },
  'PHY79-POTENTIAL': {
    beats: [
      { text: 'Vesikorin massa on 3 kg, ja se on 5 m viitetason yläpuolella. Potentiaalienergia E = mg(h − h₀) = 3 kg · 10 N/kg · 5 m = 150 J.', more: 'Mallissa käytetään pyöristettyä arvoa g = 10 N/kg. Tarkempi arvo Maan pinnalla on noin 9,81 N/kg.', pic: 0, figure: false },
      { example: 'Mitä tapahtuu, kun massa kaksinkertaistetaan 6 kg:aan?', text: 'Korkeus pysyy samana, joten E = 6 kg · 10 N/kg · 5 m = 300 J. Kaksinkertainen massa antaa kaksinkertaisen potentiaalienergian.', pic: 0, figure: false },
      { text: 'Viitetaso eli nollataso valitaan itse. Jos se nostetaan 2 metriin, lukemat pienenevät, mutta saman korkeusmuutoksen energiaero pysyy samana.', more: 'Kun 3 kg:n kori nousee 5 metristä 7 metriin, ero on 3 kg · 10 N/kg · 2 m = 60 J. Ero on sama, oli nollataso lattialla tai 2 metrin korkeudella.', pic: 0, figure: false },
    ],
    try: {
      say: 'Kirja (1 kg) on hyllyllä 2 m lattian yläpuolella. Mikä on sen potentiaalienergia, kun nollataso on lattia ja g = 10 N/kg?',
      options: ['20 J', '2 J', '10 J'],
      answer: 0,
      explain: 'E = mgh = 1 kg · 10 N/kg · 2 m = 20 J. Jos nollatasoksi valittaisiin pöydän pinta, lukema olisi pienempi.',
      why: [null, 'Massa ja korkeus pitää kertoa vielä luvulla g = 10 N/kg.', '1 kg · 10 N/kg pitää kertoa vielä korkeudella 2 m.'],
    },
  },
  'PHY79-ENERGY-SOURCE': {
    beats: [
      { text: 'Tuuli pyörittää tuulivoimalan roottoria, ja generaattori muuntaa liikkeen sähköksi. Johtoja pitkin sähkö vie lampulle 70 J.', pic: 0, figure: false },
      { text: 'Ketju on lähde → muunnin → siirtotapa → käyttökohde, eli tuuli → generaattori → sähkö → lamppu. Energialähde on tuuli, ei sähkö.', pic: 0, figure: false },
      { text: 'Sähkö on siirtotapa, joka voi kuljettaa energiaa monesta lähteestä. Samaan johtoon voi tulla energiaa tuulesta, virtaavasta vedestä tai auringosta.', more: 'Aurinkovoimalassa muunnin on aurinkokenno. Se muuntaa valon suoraan sähköksi ilman pyörivää generaattoria.', pic: 0, figure: false },
    ],
    try: {
      say: 'Pistorasiasta saatu sähkö pyörittää tehosekoitinta. Mikä on energian alkuperäinen lähde?',
      options: ['Voimalan lähde, esimerkiksi tuuli tai vesi', 'Pistorasia', 'Sähkö itse'],
      answer: 0,
      explain: 'Sähkö on siirtotapa ja pistorasia sen liitäntä. Energia on peräisin voimalan lähteestä, kuten tuulesta, virtaavasta vedestä tai polttoaineesta.',
      why: [null, 'Pistorasia on vain liitäntä sähköverkkoon. Energia tulee voimaloista.', 'Sähkö kuljettaa energiaa, mutta se ei ole alkuperäinen lähde.'],
    },
  },
  'PHY79-RENEW': {
    beats: [
      { text: 'Tuuli on uusiutuva energialähde, koska sitä syntyy koko ajan lisää. Kolmen vuoden aikana tuulesta saadaan 11 yksikköä energiaa ja käytetään 6.', pic: 0, figure: false },
      { text: 'Uusiutuva ei silti tarkoita aina saatavilla olevaa. Tyynellä säällä tuulivoimala seisoo, joten tarvitaan varastoa tai muita lähteitä.', pic: 0, figure: false },
      { text: 'Kivihiili on uusiutumaton, koska sitä ei synny lisää ihmisen elinaikana. Biomassakin vähenee, jos puuta poltetaan nopeammin kuin sitä kasvaa.', more: 'Jos metsä kasvaa vuodessa 10 yksikköä ja puuta käytetään 12, varanto pienenee 2 yksikköä vuodessa, vaikka puu on uusiutuva luonnonvara.', pic: 0, figure: false },
    ],
    try: {
      say: 'Metsää kasvaa vuodessa 8 yksikköä, ja puuta poltetaan 10 yksikköä vuodessa. Mitä metsävarannolle tapahtuu?',
      options: ['Se pienenee, vaikka puu on uusiutuva', 'Se pysyy samana, koska puu on uusiutuva', 'Se kasvaa koko ajan'],
      answer: 0,
      explain: 'Käyttö 10 on suurempi kuin kasvu 8, joten varanto pienenee 2 yksikköä vuodessa. Uusiutuva lähde riittää vain, jos käyttö ei ylitä uusiutumista.',
      why: [null, 'Uusiutuvuus ei riitä, jos käyttö on nopeampaa kuin kasvu.', 'Puuta käytetään enemmän kuin sitä kasvaa, joten varanto ei voi kasvaa.'],
    },
  },
  'PHY79-ENERGY-IMPACT': {
    beats: [
      { text: 'Majakka tarvitsee kesällä 7 kWh energiaa, ja pesimäluodon luontovaikutus saa olla enintään 4 pistettä. Tarjolla on kolme vaihtoehtoa.', pic: 0, figure: false },
      { text: 'Pesimäluodon lähilaite antaisi 18 kWh, mutta sen vaikutus 6 ylittää rajan. Rantapaneeli (10 kWh, vaikutus 3) ja kauempi tuulilaite (16 kWh, vaikutus 4) täyttävät ehdot.', pic: 0, figure: false },
      { text: 'Valinta on kompromissi: paneelin luontovaikutus on pienempi, mutta sen tuotto vaihtelee paljon. Tuulilaite ja suurempi varasto ovat varmempia, mutta vaikutus on rajalla.', more: 'Luvut ovat tämän luodon paikallisia tietoja. Toisessa paikassa sama laite voi saada aivan eri arvion, joten yleistä paremmuusjärjestystä ei synny.', pic: 0, figure: false },
    ],
    try: {
      say: 'Kylä tarvitsee 5 kWh, ja vaikutusraja on 3. A antaa 4 kWh (vaikutus 1), B 8 kWh (vaikutus 3) ja C 12 kWh (vaikutus 5). Mikä kelpaa?',
      options: ['Vain B', 'A, koska sen vaikutus on pienin', 'C, koska se antaa eniten'],
      answer: 0,
      explain: 'A ei riitä 5 kWh:n tarpeeseen, ja C ylittää vaikutusrajan 3. Vain B täyttää molemmat ehdot: 8 kWh riittää, ja vaikutus on rajalla.',
      why: [null, 'A antaa vain 4 kWh, mikä ei riitä 5 kWh:n tarpeeseen.', 'C:n vaikutus 5 ylittää rajan 3, vaikka energiaa on runsaasti.'],
    },
  },
};
