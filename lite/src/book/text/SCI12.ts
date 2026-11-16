import type { PageText } from '../text';

/** SCI12 Valomerkkien satama: charge, circuits, electrical quantities, magnetism and generating electricity. */
export const TEXT: Record<string, PageText> = {
  'ENV-PHY-DEVICE-01': {
    beats: [
      {
        example: 'Retkilyhdyssä on paristo, kytkin, johdot ja lamppu. Mitä tapahtuu, kun kytkin avataan?',
        text: 'Kun kytkin avataan, sähkön kulkureitti katkeaa. Lamppu sammuu, vaikka paristo on yhä kunnossa.',
        pic: 0, figure: false,
      },
      {
        text: 'Sähkö kulkee vain umpinaista reittiä: paristosta lampun kautta takaisin paristoon. Tätä reittiä sanotaan virtapiiriksi.',
        pic: 0, figure: false,
      },
      {
        text: 'Kytkin on virtapiirin portti. Suljettuna se päästää sähkön kulkemaan, ja auki ollessaan se katkaisee reitin.',
        more: 'Osan tehtävän ymmärtää parhaiten kokeilemalla, mitä tapahtuu, kun osaa muutetaan. Jos paristo otetaan pois, lamppu ei myöskään pala.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Lyhdyn kytkin avataan. Miksi lamppu sammuu?',
      options: ['Sähkön kulkureitti katkeaa', 'Paristo tyhjenee heti', 'Lamppu rikkoutuu'],
      answer: 0,
      explain: 'Avoin kytkin tekee virtapiiriin katkon. Kun kytkin suljetaan, reitti on taas umpinainen ja lamppu syttyy.',
      why: [null, 'Paristo ei tyhjene kytkimestä. Kun kytkin suljetaan, lamppu syttyy taas.', 'Lamppu on ehjä. Se syttyy heti, kun kytkin suljetaan.'],
    },
  },
  'PHY79-CHARGE': {
    beats: [
      {
        example: 'Kappaleilla A ja B on kummallakin positiivinen varaus (+). Vetävätkö ne toisiaan vai hylkivätkö?',
        text: 'Varaukset ovat samanmerkkiset, joten kappaleet hylkivät toisiaan. Erimerkkiset varaukset, + ja −, vetäisivät toisiaan puoleensa.',
        pic: 0, figure: false,
      },
      {
        text: 'Varauksen merkki luetaan merkeistä + ja −, ei kappaleen väristä. Punainen pallo voi olla yhtä hyvin negatiivinen kuin positiivinen.',
        more: 'Sähköinen voima heikkenee, kun kappaleiden etäisyys kasvaa. Siksi hylkiminen tuntuu voimakkaimpana, kun kappaleet ovat lähellä toisiaan.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Kappaleella A on negatiivinen ja kappaleella B positiivinen varaus. Mitä tapahtuu?',
      options: ['Ne vetävät toisiaan', 'Ne hylkivät toisiaan', 'Ne eivät vaikuta toisiinsa'],
      answer: 0,
      explain: 'Erimerkkiset varaukset vetävät toisiaan puoleensa. Samanmerkkiset varaukset (+ ja + tai − ja −) hylkivät.',
      why: [null, 'Hylkiminen tapahtuu vain samanmerkkisten varausten välillä.', 'Varatut kappaleet vaikuttavat toisiinsa myös matkan päästä.'],
    },
  },
  'PHY79-MAGNET': {
    beats: [
      {
        example: 'Kahden magneetin N-navat tuodaan vastakkain. Mitä tapahtuu?',
        text: 'Samanlaiset navat hylkivät toisiaan, joten magneetit työntyvät erilleen. Navat N ja S vetäisivät toisiaan puoleensa.',
        pic: 0, figure: false,
      },
      {
        text: 'Kuparinäyte ei vetäytynyt magneettiin. Magneetti vetää selvästi vain ferromagneettisia aineita, kuten rautaa, nikkeliä ja kobolttia.',
        more: 'Kupari ja alumiini ovat metalleja, mutta ne eivät ole ferromagneettisia. Pelkästä metallin näöstä ei siis voi päätellä, tarttuuko se magneettiin.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Mikä näytteistä vetäytyy magneettiin?',
      options: ['Rautanaula', 'Kuparilanka', 'Alumiinifolio'],
      answer: 0,
      explain: 'Rauta on ferromagneettinen aine, joten magneetti vetää sitä. Kupari ja alumiini ovat metalleja, mutta eivät ferromagneettisia.',
      why: [null, 'Kupari on metalli, mutta magneetti ei vedä sitä.', 'Alumiini on metalli, mutta magneetti ei vedä sitä.'],
    },
  },
  'PHY79-CIRCUIT-CLOSED': {
    beats: [
      {
        example: 'Lyhdyssä on 7 V:n lähde, 8 Ω:n lamppu ja kytkin. Miten johdot kytketään, jotta lamppu syttyy?',
        text: 'Johto kulkee plusnavasta lampulle, lampulta kytkimelle ja kytkimeltä miinusnapaan. Kun kytkin suljetaan, syntyy suljettu virtapiiri.',
        pic: 0, figure: false,
      },
      {
        text: 'Virta kulkee vain, jos reitti on umpinainen molempien napojen ja lampun kautta. Yksikin katko sammuttaa lampun.',
        more: 'Johdot kytketään virta pois päältä, ja kytkin suljetaan vasta, kun kaikki liitokset ovat paikallaan.',
        pic: 0, figure: false,
      },
      {
        text: 'Jos johto yhdistää navat suoraan ilman lamppua, syntyy oikosulku. Virta kasvaa suureksi ja johto kuumenee, mutta lamppu ei pala.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Mikä kytkentä sytyttää lampun?',
      options: ['Plusnapa – lamppu – suljettu kytkin – miinusnapa', 'Plusnapa – lamppu, lampun toinen pää irti', 'Johto suoraan plusnavasta miinusnapaan'],
      answer: 0,
      explain: 'Lamppu palaa vain umpinaisessa reitissä, joka kulkee lähteen molempien napojen ja lampun kautta. Suljettu kytkin pitää reitin ehjänä.',
      why: [null, 'Reitti katkeaa lampun jälkeen, joten virta ei kulje.', 'Se on oikosulku: virta ohittaa lampun ja johto kuumenee.'],
    },
  },
  'PHY79-CIRCUIT-COMPONENTS': {
    beats: [
      {
        example: 'Kaavioon on merkitty symboli − | | +. Mikä osa se on?',
        text: 'Kaksi rinnakkaista viivaa, joista pidempi on plusnapa, on jännitelähteen eli pariston merkki. Lähde ylläpitää napojen välistä jännitettä.',
        pic: 0, figure: false,
      },
      {
        text: 'Muilla osilla on omat tehtävänsä: kytkin avaa ja sulkee reitin, johdin yhdistää liitännät ja lamppu muuntaa sähköenergiaa valoksi ja lämmöksi.',
        more: 'Kytkentäkaaviossa osat piirretään sovituilla merkeillä, jotta kaavion voi lukea kuka tahansa. Lampun merkki on ympyrä, jonka sisällä on risti.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Mikä piirin osa muuntaa sähköenergiaa valoksi?',
      options: ['Lamppu', 'Jännitelähde', 'Kytkin', 'Johdin'],
      answer: 0,
      explain: 'Lamppu muuntaa sähköenergiaa valoksi ja lämmöksi. Lähde ylläpitää jännitettä, kytkin avaa ja sulkee reitin, ja johdin yhdistää osat.',
      why: [null, 'Lähde ylläpitää jännitettä, mutta valo syntyy lampussa.', 'Kytkin vain avaa ja sulkee reitin.', 'Johdin yhdistää osat, mutta ei tuota valoa.'],
    },
  },
  'PHY79-CHARGING': {
    beats: [
      {
        example: 'Kappaleiden A ja B varaus on aluksi 0. Kolme elektronia siirtyy A:sta B:hen.',
        text: 'Elektronit ovat negatiivisia, joten B saa varauksen −3. A menettää kolme elektronia, ja sen varaukseksi jää +3.',
        pic: 0, figure: false,
      },
      {
        text: 'Kokonaisvaraus säilyy: (+3) + (−3) = 0, aivan kuten alussa. Varausta ei synny eikä katoa, se vain jakautuu uudelleen.',
        more: 'Siirtyä voivat vain elektronit, sillä positiiviset ytimet pysyvät paikallaan. Luvut ovat alkeisvarauksia eli yhden elektronin varauksen suuruisia yksiköitä.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Varauksettomasta kappaleesta A siirtyy kaksi elektronia kappaleeseen B. Mikä on A:n varaus nyt?',
      options: ['+2', '−2', '0'],
      answer: 0,
      explain: 'A menettää kaksi negatiivista elektronia, joten sen varaus on +2. B:n varaus on −2, ja yhteensä varaus on yhä 0.',
      why: [null, 'B saa elektronit, joten −2 on B:n varaus. A menettää ne.', 'A:n varaus muuttuu, kun elektroneja lähtee. Vain kokonaisvaraus pysyy nollana.'],
    },
  },
  'PHY79-CIRCUIT-01': {
    beats: [
      {
        example: 'Lyhdyssä on 7 V:n lähde, 8 Ω:n lamppu ja kytkin. Mitä kukin osa tekee suljetussa piirissä?',
        text: 'Lähde ylläpitää napojen välistä jännitettä, ja johtimet yhdistävät osat. Kun kytkin suljetaan, virta kulkee plusnavasta lampun kautta miinusnapaan.',
        more: 'Plusnavasta miinusnapaan on virran sovittu suunta. Johtimessa liikkuvat elektronit kulkevat todellisuudessa päinvastaiseen suuntaan.',
        pic: 0, figure: false,
      },
      {
        text: 'Lamppu muuntaa sähköenergiaa valoksi ja lämmöksi. Osien järjestys voi vaihdella: lamppu palaa, kunhan reitti kulkee molempien napojen ja lampun kautta.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Kytkin ja lamppu vaihtavat paikkaa, ja kytkin on kiinni. Palaako lamppu?',
      options: ['Palaa, koska reitti on yhä suljettu', 'Ei pala, koska kytkimen pitää olla ennen lamppua', 'Ei pala, koska lamppu on nyt miinusnavan puolella'],
      answer: 0,
      explain: 'Kun reitti kulkee molempien napojen ja lampun kautta ja kytkin on kiinni, lamppu palaa. Osien järjestyksellä samalla reitillä ei ole väliä.',
      why: [null, 'Kytkin katkaisee reitin missä kohdassa tahansa, joten sen paikka ei ratkaise.', 'Virta on sama koko reitillä, joten lampun paikalla ei ole väliä.'],
    },
  },
  'PHY79-CURRENT': {
    beats: [
      {
        example: 'Johtimen kohdan läpi kulkee 15 C varausta 3 sekunnissa. Kuinka suuri on sähkövirta?',
        text: 'Sähkövirta kertoo, paljonko varausta kulkee kohdan läpi sekunnissa. I = Q / t = 15 C / 3 s = 5 A.',
        pic: 0, figure: false,
      },
      {
        text: 'Virran yksikkö on ampeeri: 1 A = 1 C/s. Tässä kohdan ohi kulkee joka sekunti 5 coulombia varausta.',
        more: 'Jos sama 15 C kulkisi 5 sekunnissa, virta olisi vain 15 C / 5 s = 3 A. Sama varaus lyhyemmässä ajassa tarkoittaa suurempaa virtaa.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Kohdan läpi kulkee 12 C varausta 4 sekunnissa. Mikä on virta?',
      options: ['3 A', '48 A', '16 A'],
      answer: 0,
      explain: 'I = Q / t = 12 C / 4 s = 3 A. Joka sekunti kohdan läpi kulkee 3 coulombia.',
      why: [null, 'Varaus ja aika kerrottiin. Virta saadaan jakamalla varaus ajalla.', 'Varaus ja aika laskettiin yhteen. Virta on varaus jaettuna ajalla.'],
    },
  },
  'PHY79-VOLTAGE': {
    beats: [
      {
        example: 'Kun 3 C varausta kulkee pisteestä A pisteeseen B, siirtyy 15 J energiaa. Mikä on jännite A:n ja B:n välillä?',
        text: 'Jännite kertoo, paljonko energiaa siirtyy jokaista coulombia kohti. U = E / Q = 15 J / 3 C = 5 V.',
        pic: 0, figure: false,
      },
      {
        text: 'Jännitteen yksikkö on voltti: 1 V = 1 J/C. Jännite on aina kahden pisteen välinen ero, ja siksi sitä sanotaan myös potentiaalieroksi.',
        more: 'Virta kulkee piirin kohdan läpi, mutta jännite ei kulje minnekään. Se on kahden pisteen välinen ero, joka saa virran kulkemaan.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Kun 2 C varausta kulkee pisteiden C ja D välillä, siirtyy 12 J energiaa. Mikä on jännite?',
      options: ['6 V', '24 V', '14 V'],
      answer: 0,
      explain: 'U = E / Q = 12 J / 2 C = 6 V. Jokainen coulombi luovuttaa 6 joulea.',
      why: [null, 'Energia ja varaus kerrottiin. Jännite on energia jaettuna varauksella.', 'Energia ja varaus laskettiin yhteen. Jännite on energia jaettuna varauksella.'],
    },
  },
  'PHY79-MEAS-I': {
    beats: [
      {
        example: 'Lähde on 12 V. Lamppu (2 Ω) ja toinen vastus (8 Ω) ovat omissa haaroissaan. Miten mitataan lampun virta?',
        text: 'Virtamittari kytketään sarjaan: lampun haaran johto avataan ja mittari asetetaan katkon kohdalle. Näin koko lampun virta kulkee mittarin läpi.',
        pic: 0, figure: false,
      },
      {
        text: 'Kytkentä tehdään virta pois päältä. Kun virta kytketään, mittari näyttää vain lampun haaran virran, tässä 6 A.',
        pic: 0, figure: false,
      },
      {
        text: 'Virtamittarin oma resistanssi on hyvin pieni. Siksi sitä ei koskaan kytketä rinnan lampun kanssa eikä suoraan lähteen napojen väliin.',
        more: 'Rinnan kytketty virtamittari tekisi oikosulun. Rinnan kahden pisteen väliin kytketään jännitemittari.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Mihin virtamittari kytketään, kun mitataan lampun virtaa?',
      options: ['Sarjaan lampun haaraan', 'Rinnan lampun kanssa', 'Suoraan lähteen napojen väliin'],
      answer: 0,
      explain: 'Lampun virran täytyy kulkea mittarin läpi, joten mittari kytketään lampun haaraan sarjaan.',
      why: [null, 'Rinnankytkentä sopii jännitemittarille. Virtamittari rinnalla oikosulkisi lampun.', 'Silloin syntyy oikosulku, koska virtamittarin resistanssi on hyvin pieni.'],
    },
  },
  'PHY79-MEAS-U': {
    beats: [
      {
        example: 'Lamppu (2 Ω) ja toinen vastus (8 Ω) ovat sarjassa 12 V:n lähteen kanssa. Miten mitataan lampun jännite?',
        text: 'Jännitemittari kytketään rinnan lampun kanssa: johdot pisteisiin p ja m lampun molemmin puolin. Piiriä ei tarvitse avata.',
        pic: 0, figure: false,
      },
      {
        text: 'Mittari näyttää lampun jännitteen, tässä 2,4 V. Pisteiden p ja n väliltä se näyttäisi koko lähteen jännitteen 12 V.',
        more: 'Jos mittarin molemmat johdot ovat samassa pisteessä, lukema on 0 V. Jännite on aina kahden eri pisteen välinen ero.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Mihin jännitemittarin johdot kytketään, kun mitataan lampun jännite?',
      options: ['Lampun molemmille puolille, pisteisiin p ja m', 'Molemmat samaan pisteeseen p', 'Sarjaan lampun kanssa'],
      answer: 0,
      explain: 'Jännite on kahden pisteen välinen ero. Lampun jännite mitataan sen molemmilta puolilta, rinnan lampun kanssa.',
      why: [null, 'Saman pisteen välillä ei ole eroa, joten mittari näyttää 0 V.', 'Sarjaan kytketään virtamittari. Jännitemittari kytketään rinnan.'],
    },
  },
  'PHY79-ELECTROMAG': {
    beats: [
      {
        example: 'Käämissä on 11 kierrosta johdinta. Mitä tapahtuu, kun käämiin kytketään virta?',
        text: 'Sähkövirta synnyttää ympärilleen magneettikentän. Virrallinen käämi toimii kuin sauvamagneetti: tässä sen N-napa on oikealla.',
        pic: 0, figure: false,
      },
      {
        text: 'Kun virran suunta käännetään, käämin navat vaihtavat paikkaa ja N-napa siirtyy vasemmalle. Kun virta katkaistaan, magneettinen vaikutus loppuu.',
        more: 'Tällaista käämiä sanotaan sähkömagneetiksi. Rautasydän käämin sisällä, suurempi virta tai useampi kierros voimistaa sitä.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Käämin N-napa on oikealla. Mitä tapahtuu, kun virran suunta käännetään?',
      options: ['N-napa siirtyy vasemmalle', 'N-napa pysyy oikealla', 'Magneettinen vaikutus loppuu'],
      answer: 0,
      explain: 'Virran suunta määrää käämin napojen paikan. Kun virta käännetään, navat vaihtavat paikkaa.',
      why: [null, 'Navat riippuvat virran suunnasta, joten ne vaihtuvat.', 'Vaikutus loppuu vain, kun virta katkaistaan. Käännetty virta kulkee yhä.'],
    },
  },
  'PHY79-SERIES-CURRENT': {
    beats: [
      {
        example: 'Sarjapiirissä on 12 V:n lähde ja osat A (3 Ω) ja B (6 Ω). Mitä virtamittari näyttää eri kohdissa?',
        text: 'Sarjapiirissä on vain yksi reitti, joten sama virta kulkee kaikkien osien läpi. Mittari näyttää 1,33 A ennen A:ta, osien välissä ja B:n jälkeen.',
        pic: 0, figure: false,
      },
      {
        text: 'Virta ei kulu matkalla: osissa muuntuu energiaa, mutta varaus kulkee läpi. Siksi virta on A:ssa ja B:ssä sama, vaikka resistanssit ovat erilaiset.',
        pic: 0, figure: false,
      },
      {
        text: 'Jännite sen sijaan jakautuu osien kesken. A:n yli on 4 V, joten B:n yli on 12 V − 4 V = 8 V.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Sarjapiirissä on kolme lamppua. Virta ennen ensimmäistä lamppua on 0,8 A. Mikä on virta viimeisen lampun jälkeen?',
      options: ['0,8 A', 'Pienempi kuin 0,8 A', '0 A'],
      answer: 0,
      explain: 'Sarjapiirissä on vain yksi reitti, joten virta on sama joka kohdassa: 0,8 A.',
      why: [null, 'Virta ei kulu lampuissa. Sama varaus kulkee koko piirin läpi.', 'Virta kulkee koko suljetun piirin läpi takaisin lähteeseen.'],
    },
  },
  'PHY79-SERIES-VOLTAGE': {
    beats: [
      {
        example: 'Sarjapiirissä on 12 V:n lähde ja osat A ja B, kumpikin 3 Ω. A:n yli mitataan 6 V. Paljonko on B:n yli?',
        text: 'Sarjapiirissä osien jännitteet laskevat yhteen lähteen jännitteeksi. B:n yli on siis 12 V − 6 V = 6 V.',
        pic: 0, figure: false,
      },
      {
        text: 'Osat ovat yhtä suuret, joten jännite jakautuu tasan. Osilla 3 Ω ja 6 Ω suurempi resistanssi saisi suuremman osan: 4 V ja 8 V.',
        more: 'Molempien osien läpi kulkee sama 2 A:n virta. Siksi jännite jakautuu resistanssien suhteessa.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Sarjapiirin lähde on 9 V, ja osan A yli on 4 V. Paljonko on osan B yli?',
      options: ['5 V', '9 V', '13 V'],
      answer: 0,
      explain: 'Sarjapiirissä osien jännitteet laskevat yhteen lähteen jännitteeksi: 4 V + 5 V = 9 V.',
      why: [null, 'Sarjapiirissä lähteen jännite jakautuu osien kesken, joten kummankin yli ei ole koko 9 V.', 'Osien jännitteiden summa ei voi olla suurempi kuin lähteen 9 V.'],
    },
  },
  'PHY79-PARALLEL-CURRENT': {
    beats: [
      {
        example: 'Haarat A ja B (kumpikin 3 Ω) on kytketty rinnan 12 V:n lähteeseen. Mikä on lähdevirta?',
        text: 'Virta jakautuu haaroihin, ja kummassakin kulkee 4 A. Lähteen kautta kulkee haaravirtojen summa 4 A + 4 A = 8 A.',
        pic: 0, figure: false,
      },
      {
        text: 'Haarojen virrat yhdistyvät solmussa lähdevirraksi. Kun haara B poistetaan, lähdevirta pienenee 4 A:iin, mutta haaran A virta pysyy 4 A:ssa.',
        more: 'Kummankin haaran yli on sama 12 V, joten haara toimii kuin olisi yksin lähteen kanssa. Siksi kodin laitteet kytketään rinnan.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Rinnanpiirin haaroissa kulkee 3 A ja 5 A. Mikä on lähdevirta?',
      options: ['8 A', '5 A', '2 A'],
      answer: 0,
      explain: 'Haarojen virrat yhdistyvät solmussa: 3 A + 5 A = 8 A. Lähde antaa koko tämän virran.',
      why: [null, 'Lähdevirta ei ole suurin haaravirta, vaan haaravirtojen summa.', 'Haaravirtoja ei vähennetä toisistaan, vaan ne lasketaan yhteen.'],
    },
  },
  'PHY79-PARALLEL-VOLTAGE': {
    beats: [
      {
        example: 'Haarat A ja B (kumpikin 3 Ω) on kytketty rinnan 12 V:n lähteeseen. Mikä jännite on kummankin haaran yli?',
        text: 'Molemmat haarat on liitetty samoihin pisteisiin kuin lähteen navat. Siksi kummankin haaran yli on sama 12 V.',
        pic: 0, figure: false,
      },
      {
        text: 'Rinnankytkennässä jännite ei jakaudu, vaan virta jakautuu. Haaroissa kulkee 4 A ja 4 A, yhteensä 8 A.',
        more: 'Sama pätee, vaikka haarojen resistanssit olisivat erilaiset: jännite on sama, mutta pienemmän resistanssin haarassa kulkee suurempi virta.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Kaksi lamppua on kytketty rinnan 6 V:n lähteeseen. Mikä jännite on kummankin lampun yli?',
      options: ['6 V', '3 V', '12 V'],
      answer: 0,
      explain: 'Rinnan kytketyt lamput ovat samojen pisteiden välissä kuin lähde, joten kummankin yli on 6 V.',
      why: [null, 'Jännite jakautuu osien kesken sarjapiirissä, ei rinnanpiirissä.', 'Haarojen jännitteitä ei lasketa yhteen. Kummankin yli on lähteen 6 V.'],
    },
  },
  'PHY79-UI-REL': {
    beats: [
      {
        example: 'Komponentille A mitattiin jännite ja virta kolmesti: (4 V; 1 A), (8 V; 2 A) ja (12 V; 3 A). Miten virta riippuu jännitteestä?',
        text: 'Kun jännite kaksinkertaistuu, myös virta kaksinkertaistuu. Virta on suoraan verrannollinen jännitteeseen.',
        pic: 0, figure: false,
      },
      {
        text: 'Suhde U / I on joka rivillä sama: 4 V / 1 A = 8 V / 2 A = 12 V / 3 A = 4 Ω. (U, I)-kuvaajassa pisteet ovat origon kautta kulkevalla suoralla.',
        pic: 0, figure: false,
      },
      {
        text: 'Tällaista komponenttia sanotaan ohmiseksi. Kaikki komponentit eivät ole ohmisia: hehkulampun resistanssi kasvaa, kun lanka kuumenee.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Ohmisen vastuksen mittaukset ovat (6 V; 2 A) ja (12 V; 4 A). Mikä virta kulkee jännitteellä 9 V?',
      options: ['3 A', '5 A', '27 A'],
      answer: 0,
      explain: 'U / I = 6 V / 2 A = 3 Ω. Siksi jännitteellä 9 V virta on 9 V / 3 Ω = 3 A.',
      why: [null, 'Virta ei kasva samalla määrällä kuin jännite, vaan samassa suhteessa.', 'Jännite jaetaan resistanssilla, ei kerrota: 9 V / 3 Ω = 3 A.'],
    },
  },
  'PHY79-SERIES': {
    beats: [
      {
        example: 'Sarjapiirissä on 12 V:n lähde ja kaksi 3 Ω:n osaa, A ja B. Mitä mittarit näyttävät?',
        text: 'Ensimmäinen sääntö: virta on sama joka kohdassa. Mittari näyttää 2 A ennen A:ta, osien välissä ja B:n jälkeen.',
        pic: 0, figure: false,
      },
      {
        text: 'Toinen sääntö: osien jännitteet laskevat yhteen lähteen jännitteeksi. A:n yli on 6 V ja B:n yli 6 V, yhteensä 12 V.',
        more: 'Jos piiriin lisätään kolmas 3 Ω:n osa, virta pienenee kaikkialla, ja 12 V jakautuu kolmen osan kesken: 4 V kullekin.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Mikä pitää paikkansa sarjapiirissä?',
      options: ['Virta on sama kaikissa osissa', 'Jokaisen osan yli on koko lähteen jännite', 'Virta pienenee jokaisen osan jälkeen'],
      answer: 0,
      explain: 'Sarjapiirissä on yksi reitti, joten virta on joka kohdassa sama. Lähteen jännite jakautuu osien kesken.',
      why: [null, 'Näin on rinnanpiirissä. Sarjapiirissä jännite jakautuu osien kesken.', 'Virta ei kulu osissa. Se on sama koko piirissä.'],
    },
  },
  'PHY79-PARALLEL': {
    beats: [
      {
        text: 'Molemmat lamput on kytketty samojen pisteiden A ja B väliin. Siksi kummankin lampun yli on sama jännite kuin lähteellä, 6 V.',
        pic: 0,
      },
      {
        text: 'Haarassa 1 kulkee 20 mA ja haarassa 2 40 mA. Pääjohdossa haaravirrat yhdistyvät: 20 mA + 40 mA = 60 mA.',
        more: 'Haarassa 2 kulkee samalla jännitteellä kaksinkertainen virta. Sen resistanssi on siis puolet haaran 1 resistanssista.',
        pic: 1,
      },
    ],
    try: {
      say: 'Haaran 1 lamppu irrotetaan. Mitä haaran 2 virralle tapahtuu?',
      options: ['Se pysyy 40 mA:ssa', 'Se kasvaa 60 mA:iin', 'Se pienenee 20 mA:iin'],
      answer: 0,
      explain: 'Haaran 2 yli on yhä lähteen 6 V, joten sen virta pysyy 40 mA:ssa. Pääjohdon virta pienenee 40 mA:iin.',
      why: [null, 'Virta ei siirry haarasta toiseen. Haaran 2 jännite on yhä 6 V.', 'Haaran 2 jännite ei muutu, joten sen virtakaan ei muutu.'],
    },
  },
  'PHY79-GENERATION': {
    beats: [
      {
        example: 'Malliputouksen vesi pyörittää generaattoria. Syntyykö sähköä?',
        text: 'Generaattorissa liike kääntää magneettia käämin lähellä. Kun käämin magneettinen tilanne muuttuu, käämiin syntyy jännite: tätä sanotaan induktioksi.',
        pic: 0, figure: false,
      },
      {
        text: 'Sähköä syntyy vain, kun vesi virtaa ja luovuttaa liike-energiaansa generaattorille. Kun vesi pysähtyy, sähköä ei enää synny.',
        more: 'Generaattori ei tee energiaa tyhjästä, vaan muuntaa liike-energiaa sähköenergiaksi. Laitetta, joka tuottaisi energiaa ilman syöttöä, ei voi rakentaa.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Malliputouksen vesi lakkaa virtaamasta. Mitä generaattorille tapahtuu?',
      options: ['Sähköä ei enää synny', 'Sähköä syntyy, koska magneetti on käämin vieressä', 'Sähköä syntyy, jos käämissä on paljon kierroksia'],
      answer: 0,
      explain: 'Induktio vaatii muuttuvan magneettisen tilanteen. Kun vesi pysähtyy, magneetti ei liiku, eikä sähköä synny.',
      why: [null, 'Paikallaan oleva magneetti ei muuta käämin magneettista tilannetta.', 'Kierrokset voimistavat induktiota vain, kun magneettinen tilanne muuttuu.'],
    },
  },
  'PHY79-RESISTANCE': {
    beats: [
      {
        example: 'Komponentin A ensimmäinen mittaus on 4 V ja 1 A. Mikä on sen resistanssi?',
        text: 'Resistanssi on jännitteen ja virran suhde: R = U / I = 4 V / 1 A = 4 Ω. Yksikkö on ohmi, Ω.',
        more: 'Mitä suurempi resistanssi, sitä pienempi virta kulkee samalla jännitteellä.',
        pic: 0, figure: false,
      },
      {
        text: 'Muilla riveillä suhde on sama: 8 V / 2 A = 4 Ω ja 12 V / 3 A = 4 Ω. A:n resistanssi pysyy vakiona, joten A on ohminen.',
        pic: 0, figure: false,
      },
      {
        text: 'Kaikkien komponenttien resistanssi ei pysy vakiona. Hehkulampun resistanssi kasvaa, kun lanka kuumenee, joten sen U/I-suhde muuttuu.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Lampun mittauksista saadaan U/I-suhteet 2 Ω, 3 Ω ja 4 Ω. Onko lamppu ohminen?',
      options: ['Ei, koska U/I-suhde muuttuu', 'On, koska virta kasvaa jännitteen mukana', 'On, koska kaikki komponentit ovat ohmisia'],
      answer: 0,
      explain: 'Ohmisella komponentilla U/I-suhde eli resistanssi pysyy vakiona. Tässä se kasvaa 2 Ω:sta 4 Ω:iin, joten lamppu ei ole ohminen.',
      why: [null, 'Virta kasvaa monella komponentilla. Ohmisella myös suhde U/I pysyy samana.', 'Kaikki komponentit eivät ole ohmisia, esimerkiksi hehkulamppu.'],
    },
  },
  'PHY79-OHM': {
    beats: [
      {
        example: 'Vastuksen mittauksessa U = 5 V ja I = 1 A. Mikä jännite tarvitaan, jotta virta on 2 A?',
        text: 'Ensin resistanssi: R = U / I = 5 V / 1 A = 5 Ω. Sitten Ohmin laki: U = R · I = 5 Ω · 2 A = 10 V.',
        pic: 0, figure: false,
      },
      {
        text: 'Ohmin laki pätee vain oloissa, joissa resistanssi on todettu vakioksi. Tässä se todettiin virroilla 1–4 A, joten 4 A:n virralla U = 5 Ω · 4 A = 20 V.',
        more: 'Lain kolme muotoa ovat U = R · I, I = U / R ja R = U / I. Jakajana ei voi olla nolla, sillä nollalla ei voi jakaa.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Lampun resistanssi on 5 Ω. Mikä virta kulkee, kun jännite on 15 V?',
      options: ['3 A', '75 A', '20 A'],
      answer: 0,
      explain: 'I = U / R = 15 V / 5 Ω = 3 A. Tulos on mallin käyttöalueella 1–4 A.',
      why: [null, 'Jännite ja resistanssi kerrottiin. Virta on jännite jaettuna resistanssilla.', 'Jännite ja resistanssi laskettiin yhteen. Virta on I = U / R.'],
    },
  },
  'PHY79-ELEC-POWER': {
    beats: [
      {
        example: 'Laitteen A valon jännite on 6 V ja virta 2 A. Mikä on sen teho?',
        text: 'Sähkölaitteen teho on jännitteen ja virran tulo: P = U · I = 6 V · 2 A = 12 W.',
        pic: 0, figure: false,
      },
      {
        text: 'Teho kertoo, paljonko energiaa siirtyy sekunnissa: 1 W = 1 J/s. Valo saa siis joka sekunti 12 J energiaa.',
        more: 'Minuutissa valo saa 60 · 12 J = 720 J energiaa.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Lampun jännite on 12 V ja virta 0,5 A. Mikä on sen teho?',
      options: ['6 W', '24 W', '12,5 W'],
      answer: 0,
      explain: 'P = U · I = 12 V · 0,5 A = 6 W. Lamppu saa joka sekunti 6 joulea energiaa.',
      why: [null, 'Jännite jaettiin virralla. Teho on jännitteen ja virran tulo.', 'Jännite ja virta laskettiin yhteen. Teho on niiden tulo.'],
    },
  },
  'PHY79-ELEC-ENERGY': {
    beats: [
      {
        example: 'Rantamerkin teho on 120 W, ja se palaa 3 tuntia. Paljonko energiaa se käyttää?',
        text: 'Energia on teho kertaa aika: E = P · t = 120 W · 3 h = 360 Wh. Wattitunti on energian yksikkö.',
        pic: 0, figure: false,
      },
      {
        text: 'Koska 1 kWh = 1000 Wh, energia on 360 Wh = 0,36 kWh. Sähkölaskussa energia ilmoitetaan kilowattitunteina.',
        more: 'Watti on teho, wattitunti energiaa. Yksi wattitunti on 3600 J, koska tunnissa on 3600 sekuntia.',
        pic: 0, figure: false,
      },
    ],
    try: {
      say: 'Lampun teho on 60 W, ja se palaa 5 tuntia. Paljonko energiaa se käyttää?',
      options: ['300 Wh eli 0,3 kWh', '300 kWh', '12 Wh'],
      answer: 0,
      explain: 'E = P · t = 60 W · 5 h = 300 Wh. Koska 1 kWh = 1000 Wh, se on 0,3 kWh.',
      why: [null, 'Watit kerrottuna tunneilla antavat wattitunteja, eivät kilowattitunteja.', 'Teho jaettiin ajalla. Energia on teho kertaa aika.'],
    },
  },
};
