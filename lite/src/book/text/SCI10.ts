import type { PageText } from '../text';

/** SCI10 Köysiradan vuoristo: interaction, forces, motion, work and power. */
export const TEXT: Record<string, PageText> = {
  'ENV-PHY-FORCE-01': {
    beats: [
      { text: 'Käsi työntää lauttaa oikealle. Lautta lähtee liikkeelle ja kulkee yhä nopeammin, niin kauan kuin käsi työntää.', pic: 0, figure: false },
      { text: 'Työntöä tai vetoa kutsutaan voimaksi. Voimaan tarvitaan aina kaksi: tässä käsi työntää ja lautta on se, jota työnnetään.', pic: 0, figure: false },
      { text: 'Voima muuttaa liikettä siihen suuntaan, johon se vaikuttaa. Jos köysi vetää lauttaa vasemmalle, lautta lähtee liikkeelle vasemmalle.', more: 'Voiman suuruus mitataan newtoneina (N). Kuvan pieni käsi työntää lauttaa 1 N:n voimalla kahden sekunnin ajan.', pic: 0, figure: false },
    ],
    try: {
      say: 'Köysi vetää paikallaan olevaa lauttaa vasemmalle. Mitä lautalle tapahtuu?',
      options: ['Se lähtee liikkeelle vasemmalle', 'Se lähtee liikkeelle oikealle', 'Se pysyy paikallaan'],
      answer: 0,
      explain: 'Köysi vaikuttaa lauttaan voimalla vasemmalle. Voima muuttaa lautan liikettä samaan suuntaan, joten lautta lähtee vasemmalle.',
      why: [null, 'Lautta lähtee siihen suuntaan, johon voima vaikuttaa. Köysi vetää vasemmalle.', 'Voima muuttaa liikettä: paikallaan oleva lautta lähtee liikkeelle.'],
    },
  },
  'PHY79-INTERACT': {
    beats: [
      { text: 'Köysi vetää kuormaa. Voimassa on aina kaksi osapuolta: kuorma on voiman kohde ja köysi sen aiheuttaja.', pic: 0, figure: false },
      { text: 'Jokainen voima syntyy kahden kappaleen vuorovaikutuksesta. Kappale ei voi vaikuttaa voimalla itseensä.', pic: 0, figure: false },
      { text: 'Köysi koskettaa kuormaa: se on kosketusvuorovaikutus. Maa vetää laatikkoa ja magneetti naulaa koskematta niihin: ne ovat etävuorovaikutuksia.', more: 'Maan ja laatikon vuorovaikutuksen voima on laatikon paino. Magneetin ja naulan vuorovaikutuksen voima on magneettivoima.', pic: 0, figure: false },
    ],
    try: {
      say: 'Magneetti vetää rautanaulaa puoleensa koskematta siihen. Mikä aiheuttaa naulaan vaikuttavan voiman?',
      options: ['Magneetti', 'Naula itse', 'Ei mikään, koska ne eivät kosketa'],
      answer: 0,
      explain: 'Naula on voiman kohde ja magneetti sen aiheuttaja. Ne vuorovaikuttavat, vaikka eivät kosketa toisiaan.',
      why: [null, 'Kappale ei voi vaikuttaa voimalla itseensä. Voimaan tarvitaan toinen kappale.', 'Magneettivoima on etävuorovaikutus: se vaikuttaa myös ilman kosketusta.'],
    },
  },
  'PHY79-ACTIONPAIR': {
    beats: [
      { text: 'Vaunu A työntää vaunua B oikealle 5 N:n voimalla. Samalla hetkellä B työntää A:ta vasemmalle, myös 5 N:n voimalla.', pic: 0 },
      { text: 'Airon lapa työntää vettä vasemmalle, ja vesi työntää lapaa oikealle yhtä suurella voimalla. Vuorovaikutuksen voimat syntyvät aina parina.', pic: 1 },
      { text: 'Parin voimat ovat yhtä suuret ja vastakkaissuuntaiset, mutta ne vaikuttavat eri kappaleisiin. Siksi ne eivät kumoa toisiaan.', more: 'Tämä on Newtonin III laki eli voiman ja vastavoiman laki. Lapaan vaikuttaa veden voima oikealle, ja juuri se vie venettä eteenpäin.', pic: 1 },
    ],
    try: {
      say: 'Pieni vaunu B työntää isoa vaunua A 3 N:n voimalla. Kuinka suurella voimalla A työntää B:tä?',
      options: ['3 N', 'Yli 3 N, koska A on isompi', '0 N, koska A vain ottaa työnnön vastaan'],
      answer: 0,
      explain: 'Voima ja vastavoima ovat aina yhtä suuret: A työntää B:tä 3 N:n voimalla vastakkaiseen suuntaan. Pienempi vaunu vain muuttaa liikettään enemmän.',
      why: [null, 'Kappaleen koko ei muuta parin voimia. Ne ovat aina yhtä suuret.', 'Vuorovaikutuksessa kumpikin vaikuttaa toiseen. A työntää B:tä takaisin.'],
    },
  },
  'PHY79-FORCE-MAGNITUDE': {
    beats: [
      { text: 'Vaunua vedetään oikealle 6 N:n voimalla. Voiman suuruus ilmoitetaan newtoneina, ja newtonin tunnus on N.', pic: 0 },
      { example: 'Asteikolla 1 cm vastaa 2 N. Kuinka pitkä nuoli kuvaa 6 N:n vetoa?', text: 'Jokainen senttimetri kuvaa 2 N:a, joten 6 N : 2 N = 3. Nuoli piirretään 3 cm pitkäksi.', pic: 0 },
      { text: 'Samalla asteikolla kaksi kertaa suurempi voima on kaksi kertaa pidempi nuoli. Kappaleen koko ei muuta nuolta: 6 N on 3 cm myös isossa laatikossa.', pic: 0 },
    ],
    try: {
      say: 'Asteikolla 1 cm vastaa 2 N. Kuinka pitkä nuoli kuvaa 8 N:n voimaa?',
      options: ['4 cm', '8 cm', '16 cm'],
      answer: 0,
      explain: 'Jokainen senttimetri kuvaa 2 N:a, joten 8 N : 2 N = 4. Nuoli on 4 cm pitkä.',
      why: [null, '8 cm kuvaisi 16 N:n voimaa. Jaa newtonit asteikon luvulla: 8 : 2.', 'Kerroit asteikon luvulla. Pituus saadaan jakamalla: 8 : 2 = 4.'],
    },
  },
  'PHY79-FORCE-DIRECTION': {
    beats: [
      { text: 'Köysi vetää vaunua ylös ramppia. Voima osoittaa yläviistoon oikealle, samaan suuntaan kuin kireä köysi.', pic: 0 },
      { text: 'Voimanuoli alkaa kappaleesta, johon voima vaikuttaa, ja osoittaa voiman suuntaan. Tässä nuoli lähtee vaunusta, ei köydestä.', more: 'Jos käsi työntää vaunua ramppia alas, voima osoittaa alaviistoon vasemmalle. Saman kokoinen voima toiseen suuntaan muuttaa liikettä eri tavalla.', pic: 0 },
    ],
    try: {
      say: 'Käsi työntää vaunua ramppia alas. Rampin yläpää on oikealla. Mihin suuntaan vaunuun vaikuttava voima osoittaa?',
      options: ['Alaviistoon vasemmalle', 'Suoraan alas', 'Yläviistoon oikealle'],
      answer: 0,
      explain: 'Käsi työntää vaunua rampin suuntaisesti alaspäin. Rampin alapää on vasemmalla, joten voima osoittaa alaviistoon vasemmalle.',
      why: [null, 'Käsi työntää rampin suuntaisesti, ei suoraan alas.', 'Se on vedon suunta ylös ramppia. Työntö alas osoittaa päinvastaiseen suuntaan.'],
    },
  },
  'PHY79-FORCE-01': {
    beats: [
      { text: 'Köysi vetää vaunua oikealle 6 N:n voimalla. Kuvan yksi nuoli kertoo kaiken tämän.', pic: 0 },
      { text: 'Nuoli alkaa kohteesta, osoittaa voiman suuntaan, ja sen pituus kertoo suuruuden. Asteikolla 1 cm = 2 N nuoli on 6 : 2 = 3 cm pitkä.', pic: 0 },
      { text: 'Voima on vektorisuure: sillä on suuruus ja suunta. Pelkkä ”6 N” ei riitä, vaan on kerrottava myös, mihin suuntaan voima vaikuttaa.', pic: 0 },
    ],
    try: {
      say: 'Köysi vetää laatikkoa vasemmalle 4 N:n voimalla. Asteikko on 1 cm = 2 N. Mikä nuoli kuvaa voimaa?',
      options: ['2 cm laatikosta vasemmalle', '2 cm laatikosta oikealle', '4 cm laatikosta vasemmalle', '2 cm köydestä vasemmalle'],
      answer: 0,
      explain: 'Nuoli alkaa laatikosta, johon voima vaikuttaa, ja osoittaa vasemmalle. Sen pituus on 4 : 2 = 2 cm.',
      why: [null, 'Nuoli osoittaa voiman suuntaan, ja köysi vetää vasemmalle.', '4 cm kuvaisi 8 N:n voimaa. Pituus on 4 : 2 = 2 cm.', 'Nuoli alkaa kappaleesta, johon voima vaikuttaa, eli laatikosta.'],
    },
  },
  'PHY79-FORCE-DIAG': {
    beats: [
      { text: 'Vaunu lepää vaakasuoralla alustalla. Maa vetää sitä alas, ja alusta tukee sitä ylös.', pic: 0 },
      { text: 'Voimakuvaan piirretään vain valittuun kappaleeseen vaikuttavat voimat. Jokaisella on aiheuttaja: paino tulee Maalta, tukivoima alustalta.', more: 'Sama voimakuva pätee, kun vaunu liikkuu tasaisella nopeudella ilman kitkaa ja ilmanvastusta. Tasainen liike ei tarvitse omaa voimaansa.', pic: 0 },
      { text: 'Vaunu painaa myös alustaa alaspäin, mutta se voima vaikuttaa alustaan. Siksi se kuuluu alustan voimakuvaan, ei vaunun.', pic: 0 },
    ],
    try: {
      say: 'Laatikko liukuu tasaisella nopeudella vaakasuoralla alustalla ilman kitkaa ja ilmanvastusta. Mitkä voimat vaikuttavat laatikkoon?',
      options: ['Paino ja tukivoima', 'Paino, tukivoima ja liikkeen voima', 'Paino, tukivoima ja laatikon voima alustaan'],
      answer: 0,
      explain: 'Maa vetää laatikkoa alas ja alusta tukee sitä ylös. Tasainen liike ei tarvitse omaa voimaa, ja laatikon voima alustaan vaikuttaa alustaan.',
      why: [null, 'Tasainen liike ei tarvitse omaa voimaa. Jokaisella voimalla on aiheuttaja.', 'Se voima vaikuttaa alustaan, ei laatikkoon.'],
    },
  },
  'PHY79-WEIGHT': {
    beats: [
      { text: 'Kuorman massa on 3 kg. Maa vetää kuormaa kohti keskustaansa 30 N:n voimalla: tämä voima on kuorman paino.', pic: 0 },
      { text: 'Paino lasketaan kaavalla G = m · g, missä Maassa g ≈ 10 N/kg. Kuorman paino on 3 kg · 10 N/kg = 30 N.', pic: 0 },
      { text: 'Massa ilmoitetaan kilogrammoina, paino newtoneina. Kuussa kuorman massa on yhä 3 kg, mutta g = 1,6 N/kg, joten paino on vain 4,8 N.', pic: 0 },
    ],
    try: {
      say: 'Repun massa on 5 kg. Kuinka suuri on repun paino Maassa, kun g = 10 N/kg?',
      options: ['50 N', '5 N', '50 kg'],
      answer: 0,
      explain: 'Paino G = m · g = 5 kg · 10 N/kg = 50 N. Paino on voima, joten sen yksikkö on newton.',
      why: [null, '5 on massa kilogrammoina. Paino saadaan kertomalla: 5 · 10.', 'Paino on voima: sen yksikkö on newton, ei kilogramma.'],
    },
  },
  'PHY79-FRICTION': {
    beats: [
      { text: 'Laatikko liukuu lattialla oikealle. Kitka vaikuttaa siihen vasemmalle ja hidastaa sitä.', pic: 0, figure: false },
      { text: 'Kitka vastustaa pintojen liukumista toistensa suhteen. Siksi se osoittaa vastakkaiseen suuntaan kuin liukuminen tai sen pyrkimys.', more: 'Kävellessä jalka pyrkii luistamaan taaksepäin, joten maan kitka työntää jalkaa eteenpäin. Ilman kitkaa ei pääsisi liikkeelle.', pic: 0, figure: false },
      { text: 'Karkea pinta antaa suuremman kitkan kuin sileä. Siksi liukuva laatikko pysähtyy karkealla pinnalla nopeammin.', more: 'Mallissa 1 kg:n laatikko liukuu 2 m/s. Sileällä pinnalla kitka on 1 N, ja puolen sekunnin päästä nopeus on 1,5 m/s. Karkealla pinnalla kitka on 4 N, ja laatikko on jo pysähtynyt.', pic: 0, figure: false },
    ],
    try: {
      say: 'Kävelijän jalka työntää maata ja pyrkii luistamaan taaksepäin. Mihin suuntaan maan kitka vaikuttaa jalkaan?',
      options: ['Eteenpäin', 'Taaksepäin, koska kitka vastustaa liikettä', 'Ei mihinkään, koska jalka ei liu’u'],
      answer: 0,
      explain: 'Jalka pyrkii luistamaan taaksepäin, joten kitka vaikuttaa jalkaan eteenpäin. Juuri tämä kitka vie kävelijää eteenpäin.',
      why: [null, 'Kitka vastustaa pintojen liukumista. Jalka pyrkii luistamaan taakse, joten kitka osoittaa eteen.', 'Kitka vaikuttaa myös, kun pinnat vain pyrkivät liukumaan. Juuri se pitää jalan paikallaan.'],
    },
  },
  'PHY79-SUPPORT': {
    beats: [
      { text: 'Laatikko lepää vaakasuoralla pöydällä. Pöytä tukee laatikkoa ylöspäin, eikä laatikko painu pöydän läpi.', pic: 0 },
      { text: 'Tukivoima on kohtisuorassa kosketuspintaa vastaan ja osoittaa pinnasta kappaleeseen. Vaakasuoralla pöydällä se osoittaa suoraan ylös.', more: 'Tukivoima ei ole aina pystysuora. Kaltevalla pinnalla se osoittaa vinosti, ja seinä tukee sitä vasten painettua laatikkoa vaakasuoraan.', pic: 0 },
    ],
    try: {
      say: 'Laatikkoa painetaan oikealla olevaa pystysuoraa seinää vasten. Mihin suuntaan seinän tukivoima vaikuttaa laatikkoon?',
      options: ['Vasemmalle, poispäin seinästä', 'Ylös', 'Oikealle, kohti seinää'],
      answer: 0,
      explain: 'Tukivoima on kohtisuorassa seinää vastaan ja osoittaa seinästä laatikkoon. Seinä on oikealla, joten voima osoittaa vasemmalle.',
      why: [null, 'Tukivoima on kohtisuorassa pintaa vastaan. Pystysuoralla seinällä se on vaakasuora.', 'Tukivoima osoittaa pinnasta kappaleeseen, ei kohti pintaa.'],
    },
  },
  'PHY79-WORK-CONCEPT': {
    beats: [
      { text: 'Vinssi nostaa koria 2 m ylöspäin 10 N:n voimalla. Voima ja siirtymä ovat samansuuntaiset, joten köysi tekee koriin työtä.', more: 'Työn yksikkö on joule (J). Tässä työ on 10 N · 2 m = 20 J.', pic: 0, figure: false },
      { text: 'Mekaanista työtä tehdään, kun voima siirtää kappaletta voiman suuntaan. Työssä energiaa siirtyy: köysi siirtää energiaa koriin.', pic: 0, figure: false },
      { text: 'Jos köysi vain pitää koria paikallaan, siirtymä on 0 m eikä köysi tee koriin työtä. Kannattelu voi silti väsyttää ihmistä.', pic: 0, figure: false },
    ],
    try: {
      say: 'Retkeilijä pitää koria paikallaan köyden varassa minuutin ajan. Paljonko köysi tekee työtä koriin?',
      options: ['Ei lainkaan, 0 J', 'Paljon, koska aikaa kuluu', 'Paljon, koska retkeilijä väsyy'],
      answer: 0,
      explain: 'Mekaaninen työ vaatii siirtymän voiman suuntaan. Kori ei liiku, joten työ koriin on 0 J, vaikka kannattelu väsyttää.',
      why: [null, 'Aika ei ole työn kaavassa. Ilman siirtymää työtä ei tehdä.', 'Väsyminen ei ole mekaanista työtä koriin. Kori ei liiku, joten työ on 0 J.'],
    },
  },
  'PHY79-NETFORCE': {
    beats: [
      { text: 'Köysi A vetää vaunua oikealle 6 N:n voimalla ja köysi B vasemmalle 6 N:n voimalla. Vedot ovat yhtä suuret ja vastakkaiset.', pic: 0 },
      { text: 'Vastakkaiset voimat vähennetään toisistaan: 6 N − 6 N = 0 N. Voimat ovat tasapainossa, eikä nollalla kokonaisvoimalla ole suuntaa.', pic: 0 },
      { example: 'Oikealle vetää 6 N ja vasemmalle 4 N. Mikä on vaunun kokonaisvoima?', text: 'Isommasta vähennetään pienempi: 6 N − 4 N = 2 N. Kokonaisvoima on 2 N oikealle, sillä oikealle vetää enemmän.', more: 'Samansuuntaiset voimat lasketaan yhteen. Kokonaisvoimaa kutsutaan myös resultantiksi.', pic: null },
    ],
    try: {
      say: 'Vaunua vetää 8 N oikealle sekä 4 N ja 2 N vasemmalle. Mikä on vaunun kokonaisvoima?',
      options: ['2 N oikealle', '14 N oikealle', '4 N oikealle', '2 N vasemmalle'],
      answer: 0,
      explain: 'Vasemmalle vetää yhteensä 4 N + 2 N = 6 N. Kokonaisvoima on 8 N − 6 N = 2 N oikealle.',
      why: [null, 'Vastakkaiset voimat vähennetään, ei lasketa yhteen.', 'Muista molemmat vasemmalle vetävät voimat: 4 N + 2 N = 6 N.', 'Oikealle vetää enemmän, 8 N > 6 N, joten suunta on oikealle.'],
    },
  },
  'PHY79-WORK-CALC': {
    beats: [
      { example: 'Vinssi nostaa koria 3 m ylöspäin 6 N:n voimalla. Kuinka paljon työtä se tekee?', text: 'Työ on voima kertaa siirtymä: W = F · s = 6 N · 3 m = 18 J.', pic: 0, figure: false },
      { text: 'Kaava W = F · s pätee, kun voima on vakio ja samansuuntainen kuin siirtymä. Työn yksikkö on joule: 1 J = 1 N · m.', more: 'Aika ei ole kaavassa. Sama nosto tehtynä hitaasti tai nopeasti on yhtä paljon työtä.', pic: 0, figure: false },
    ],
    try: 'auto',
  },
  'PHY79-POWER-CONCEPT': {
    beats: [
      { text: 'Vinssit A ja B nostavat samanlaiset korit 2 m ylös samalla 10 N:n voimalla. Kumpikin tekee 20 J työtä, mutta A tarvitsee 2 s ja B 4 s.', pic: 0, figure: false },
      { text: 'Teho kertoo, kuinka nopeasti työtä tehdään. A tekee saman työn nopeammin, joten sen teho on suurempi.', pic: 0, figure: false },
      { text: 'Teho P = W / t, ja sen yksikkö on watti: 1 W = 1 J/s. Vinssi A: 20 J / 2 s = 10 W, vinssi B: 20 J / 4 s = 5 W.', pic: 0, figure: false },
    ],
    try: {
      say: 'Vinssi C tekee 40 J työtä 4 sekunnissa ja vinssi A 20 J työtä 2 sekunnissa. Kumman teho on suurempi?',
      options: ['Tehot ovat yhtä suuret', 'C:n, koska se tekee enemmän työtä', 'A:n, koska se on nopeampi'],
      answer: 0,
      explain: '40 J / 4 s = 10 W ja 20 J / 2 s = 10 W. Kumpikin tekee 10 J työtä joka sekunti.',
      why: [null, 'Teho riippuu myös ajasta. C tekee kaksi kertaa enemmän työtä kaksi kertaa pidemmässä ajassa.', 'A on nopeampi, mutta C tekee kaksi kertaa enemmän työtä. Laske työ jaettuna ajalla.'],
    },
  },
  'PHY79-FORCE-MOTION': {
    beats: [
      { text: 'Vaunu kulkee kitkattomalla radalla 2 m/s oikealle. Vedon loputtua vaakavoimia ei ole, ja vaunu kulkee yhä 2 m joka sekunti.', pic: 0 },
      { text: 'Nyt jarruvoima 2 N vaikuttaa vasemmalle, liikettä vastaan. Vaunu hidastuu ja pysähtyy kahdessa sekunnissa.', pic: 1 },
      { text: 'Liike muuttuu vain, kun kokonaisvoima ei ole nolla. Jos kokonaisvoima on nolla, kappale pysyy paikallaan tai jatkaa tasaista liikettä.', more: 'Tämä on Newtonin I laki eli jatkavuuden laki. Arjessa liukuva kappale pysähtyy, koska kitka ja ilmanvastus jarruttavat sitä.', pic: 0 },
    ],
    try: {
      say: 'Vaunu liikkuu 2 m/s oikealle. Siihen vaikuttaa 3 N oikealle ja 3 N vasemmalle. Mitä vaunun nopeudelle tapahtuu?',
      options: ['Se pysyy 2 m/s:ssa', 'Se pienenee, kunnes vaunu pysähtyy', 'Se kasvaa'],
      answer: 0,
      explain: 'Kokonaisvoima on 3 N − 3 N = 0 N. Silloin liike jatkuu samanlaisena: 2 m/s oikealle.',
      why: [null, 'Hidastumiseen tarvitaan kokonaisvoima liikettä vastaan. Tässä voimat kumoavat toisensa.', 'Nopeutumiseen tarvitaan kokonaisvoima liikkeen suuntaan. Tässä kokonaisvoima on 0 N.'],
    },
  },
  'PHY79-POWER-CALC': {
    beats: [
      { example: 'Vinssi nostaa koria 3 m ylös 20 N:n voimalla, ja nosto kestää 2 s. Mikä on vinssin teho?', text: 'Ensin työ: W = 20 N · 3 m = 60 J. Sitten teho: P = W / t = 60 J / 2 s = 30 W.', pic: 0, figure: false },
      { text: 'Teho on työ jaettuna ajalla. Jos sama 60 J tehtäisiin puolessa ajassa eli 1 sekunnissa, teho olisi 60 W.', more: 'Watti on joule sekunnissa: 1 W = 1 J/s. Laskettu teho on keskimääräinen teho koko noston ajalta.', pic: 0, figure: false },
    ],
    try: 'auto',
  },
};
