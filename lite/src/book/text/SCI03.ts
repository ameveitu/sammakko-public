import type { PageText } from '../text';

/** SCI03 Viestiveneiden lahti: motion, reference point, speed, acceleration and motion graphs. */
export const TEXT: Record<string, PageText> = {
  'ENV-PHY-MOTION-OBS-01': {
    beats: [
      { text: 'Ennen lehti oli kaukana kivestä, jälkeen lähellä. Lehden paikka kiveen verrattuna muuttui, joten lehti liikkui.', pic: 4 },
      { text: 'Lehti 1 ajelehti toiseen kohtaan: se liikkui. Lehti 2 vain vaihtoi väriä ja lehti 3 pysyi paikallaan, joten ne eivät liikkuneet.', more: 'Värin muuttuminen ei ole liikettä. Liikkeen huomaa siitä, että paikka muuttuu.', pic: 2 },
      { text: 'Lehti 1 kävi kauempana ja palasi takaisin. Se liikkui, vaikka se on lopussa samassa kohdassa kuin alussa.', more: 'Seuraa lehteä koko ajan, älä katso vain alkua ja loppua.', pic: 3 },
    ],
    try: 'auto',
  },
  'ENV-PHY-MOTION-CHANGE-01': {
    beats: [
      { text: 'Uivasta ankasta otetaan kuva aina yhtä pitkän ajan välein. Viimeisissä kuvissa ankka on samassa kohdassa: se pysähtyi.', pic: 2 },
      { text: 'Tässä kuvien välit kasvavat. Samassa ajassa ankka ehtii yhä pidemmälle, joten se nopeutuu.', more: 'Jos välit lyhenisivät, ankka hidastuisi.', pic: 3 },
      { text: 'Tässä ankka kääntyy ja ui takaisin: punainen nuoli näyttää paluun. Myös suunnan muuttuminen on liikkeen muutos.', pic: 4 },
    ],
    try: 'auto',
  },
  'ENV-PHY-MOTION-01': {
    beats: [
      { text: 'Kaksi ankkaa ui yhtä aikaa, ja kamera kuvaa ne aina yhtä pitkän ajan välein. Ylemmän ankan välit pysyvät samoina: sen liike ei muutu.', pic: 2 },
      { text: 'Alempi ankka jää lopussa samaan kohtaan. Se pysähtyi, joten sen liike muuttui.', pic: 2 },
      { text: 'Nyt molemmat uivat tasaisesti, mutta alemman ankan välit ovat pidemmät. Se ehtii samassa ajassa pidemmälle, joten se on nopeampi.', pic: 3 },
    ],
    try: 'auto',
  },
  'ENV-PHY-CAUSE-MOTION-01': {
    beats: [
      { text: 'Kaksi kelluvaa kiekkoa liukuu sileällä vedellä samaa vauhtia. Kiekkoa A ei työnnetä, mutta kiekkoa B työnnetään sivulta.', pic: null },
      { text: 'Kiekko A jatkaa suoraan. Kiekko B kääntyy, koska työntö sivulle muuttaa liikkeen suuntaa.', pic: null },
      { text: 'Työntö eteenpäin muuttaa vauhtia. Karhea pinta jarruttaa, kunnes kiekko pysähtyy.', pic: null },
    ],
    try: {
      say: 'Kiekko liukuu suoraan sileällä vedellä. Mikä saa sen kääntymään?',
      options: ['Työntö sivulle', 'Työntö eteenpäin', 'Karhea pinta'],
      answer: 0,
      explain: 'Työntö sivulle muuttaa kiekon suuntaa, joten kiekko kääntyy. Työntö eteenpäin muuttaa vain vauhtia.',
      why: [null, 'Työntö eteenpäin muuttaa vauhtia, mutta kiekko jatkaa samaan suuntaan.', 'Karhea pinta hidastaa kiekkoa, kunnes se pysähtyy. Suunta ei muutu.'],
    },
  },
  'PHY79-MOTION-REF': {
    beats: [
      { text: 'Loikka istuu veneessä. Rannalta katsoen Loikan matka puuhun kasvaa, joten Loikka liikkuu rantaan nähden.', pic: 2 },
      { text: 'Matka veneen mastoon pysyy koko ajan 4 metrissä, joten veneeseen nähden Loikka on paikallaan. Kohdetta, johon liikettä verrataan, sanotaan vertailukohdaksi.', pic: 2 },
      { text: 'Kaksi venettä ajaa rinnakkain, ja niiden väli pysyy 5 metrissä. Veneestä A katsoen vene B on paikallaan, vaikka rannalta katsoen molemmat liikkuvat.', pic: 3 },
    ],
    try: 'auto',
  },
  'PHY79-DIST-TIME': {
    beats: [
      { text: 'Loikka loikkii radan. Mittanauha näyttää matkaksi 12 m, ja sekuntikello pysähtyy maalissa lukemaan 4 s.', pic: 2 },
      { text: 'Matka s kertoo, kuinka pitkälle kuljettiin, ja sen yksikkö on m tai km. Aika t kertoo, kuinka kauan liike kesti, ja sen yksikkö on s, min tai h.', more: 'Matka mitataan mittanauhalla, aika sekuntikellolla.', pic: 2 },
      { text: 'Loikka kulkee 12 m ajassa 4 s, Aava 8 m ajassa 6 s. Aava loikki kauemmin mutta lyhyemmän matkan, joten pidempi aika ei tarkoita pidempää matkaa.', pic: 3 },
    ],
    try: 'auto',
  },
  'PHY79-SPEED-CONCEPT': {
    beats: [
      { text: 'A ja B loikkivat saman 20 m matkan. A on maalissa ajassa 4 s, B vasta ajassa 5 s, joten A on nopeampi.', more: 'Kun matka on sama, nopeampi on se, joka käyttää vähemmän aikaa.', pic: 2 },
      { text: 'Nyt molemmat loikkivat 5 s. A pääsee 15 m ja B 25 m, joten B on nopeampi.', more: 'Kun aika on sama, nopeampi on se, joka pääsee pidemmälle.', pic: 3 },
      { text: 'Jos sekä matkat että ajat ovat erilaiset, katsotaan matkaa joka sekuntia kohti. Loikka kulkee 20 m ajassa 4 s eli 5 m joka sekunti: nopeus on 5 m/s.', pic: 4 },
    ],
    try: 'auto',
  },
  'PHY79-SPEED-CALC': {
    beats: [
      { text: 'Loikka etenee 12 m ajassa 4 s. Joka sekunti matkaa kertyy 3 metrin pala.', pic: 2 },
      { text: 'Nopeus lasketaan jakamalla matka ajalla: v = s / t = 12 m / 4 s = 3 m/s.', pic: 2 },
      { text: 'Loikka loikkii 12 m ajassa 3 s ja lepää sitten 3 s. Keskinopeus on koko matka jaettuna koko ajalla: 12 m / 6 s = 2 m/s.', more: 'Myös tauko kuuluu aikaan. Alempi sammakko kulkee koko ajan 2 m/s ja tulee maaliin yhtä aikaa Loikan kanssa.', pic: 3 },
    ],
    try: 'auto',
  },
  'PHY79-SPEED-UNIT': {
    beats: [
      { text: 'Matka on 12 m ja aika 4 s. Luvuista lasketaan 12 / 4 = 3, ja yksiköistä tulee m/s: nopeus on 3 m/s eli 3 metriä joka sekunti.', pic: 2 },
      { text: 'Sama sääntö toimii kaikilla yksiköillä: matkan yksikkö jaetaan ajan yksiköllä. Matka 120 km ajassa 2 h antaa 120 / 2 = 60, eli nopeus on 60 km/h.', pic: 3 },
      { text: 'Etana ryömii 30 cm ajassa 5 min. Nopeus on 30 / 5 = 6 cm/min eli 6 senttimetriä joka minuutti.', pic: 4 },
    ],
    try: 'auto',
  },
  'PHY79-ST-GRAPH': {
    beats: [
      { text: 'Kynä piirtää matkan ajan funktiona. Neljässä ensimmäisessä sekunnissa Sulka kulkee 20 m ja Loikka 12 m: Sulka on nopeampi, ja sen viiva nousee jyrkemmin.', more: 'Mitä jyrkemmin matka–aika-kuvaaja nousee, sitä suurempi on nopeus.', pic: 2 },
      { text: 'Välillä 4–6 s Sulka lepää: matka ei kasva, joten viiva on vaakasuora. Sitten Sulka jatkaa hitaammin, ja viiva nousee loivemmin.', pic: 2 },
      { text: 'Nopeus luetaan kuvaajasta valitsemalla aikaväli. Loikka kulki 10 sekunnissa 30 m, joten v = 30 m / 10 s = 3 m/s.', pic: 3 },
    ],
    try: 'auto',
  },
  'PHY79-VT-GRAPH': {
    beats: [
      { text: 'Nopeus–aika-kuvaaja näyttää nopeuden joka hetki. Ensin sammakon nopeus kasvaa, ja viiva nousee, kunnes nopeus on 12 m/s.', pic: 2 },
      { text: 'Välillä 4–7 s nopeus pysyy samana, 12 m/s, joten viiva on vaakasuora. Lopuksi nopeus pienenee nollaan ja viiva laskee.', pic: 2 },
      { text: 'Vaakasuora viiva ei tarkoita, että kappale on paikallaan. Tässä nopeus pysyy 10 m/s, joten sammakko liikkuu koko ajan tasaisesti.', more: 'Paikallaan olevan kappaleen viiva kulkisi nollan kohdalla.', pic: 3 },
    ],
    try: 'auto',
  },
  'PHY79-ACCEL-CONCEPT': {
    beats: [
      { text: 'Vene lähtee levosta. Joka sekunti sen nopeus kasvaa 2 m/s: 0, 2, 4, 6 ja 8 m/s.', pic: 2 },
      { text: 'Kiihtyvyys kertoo, kuinka paljon nopeus muuttuu joka sekunti. Veneen kiihtyvyys on 2 m/s², eli nopeus kasvaa 2 m/s joka sekunti.', pic: 2 },
      { text: 'Pyöräilijä jarruttaa nopeudesta 12 m/s, ja nopeus pienenee 3 m/s joka sekunti. Sekin on kiihtyvyyttä: hidastuvassa liikkeessä kiihtyvyys on negatiivinen, −3 m/s².', pic: 3 },
    ],
    try: 'auto',
  },
  'PHY79-SPEED-MIXED': {
    beats: [
      { text: 'Juoksija kulki 1,2 km ajassa 4 min, ja nopeus halutaan yksikössä m/s. Ensin muunnetaan: 1,2 km = 1200 m ja 4 min = 240 s.', more: 'Kilometrissä on 1000 metriä ja minuutissa 60 sekuntia.', pic: 2 },
      { text: 'Nyt matka on metreinä ja aika sekunteina, joten voi jakaa: v = 1200 m / 240 s = 5 m/s.', pic: 4 },
      { text: 'Nopeus 1 m/s on metri joka sekunti. Tunnissa on 3600 s, joten tunnissa kertyy 3600 m eli 3,6 km: 1 m/s = 3,6 km/h.', pic: 5 },
    ],
    try: 'auto',
  },
  'PHY79-SPEED-REARR': {
    beats: [
      { text: 'Loikka etenee 3 m joka sekunti. Viidessä sekunnissa kertyy viisi 3 metrin palaa: s = v · t = 3 m/s · 5 s = 15 m.', pic: 2 },
      { example: 'Kuinka kauan 16 metrin matka kestää nopeudella 4 m/s?', text: 'Matkaan 16 m mahtuu neljä 4 metrin palaa, joten t = s / v = 16 m / 4 m/s = 4 s.', pic: 3 },
      { text: 'Kaavakolmiossa s on ylhäällä, v ja t alhaalla. Peitä se suure, jonka haluat laskea: vierekkäiset kerrotaan ja päällekkäiset jaetaan.', pic: 4 },
    ],
    try: 'auto',
  },
  'PHY79-ACCEL-CALC': {
    beats: [
      { text: 'Vene kulkee aluksi 2 m/s ja kiihdyttää 3 s. Taulukossa nopeus kasvaa 2 → 4 → 6 → 8 m/s, eli 2 m/s joka sekunti.', pic: 2 },
      { text: 'Kiihtyvyys on nopeuden muutos jaettuna ajalla. Muutos on 8 m/s − 2 m/s = 6 m/s, joten a = 6 m/s / 3 s = 2 m/s².', more: 'Kaavana a = (v_loppu − v_alku) / t.', pic: 2 },
      { text: 'Pyöräilijä jarruttaa nopeudesta 12 m/s pysähdyksiin 3 sekunnissa. Loppunopeus on pienempi kuin alkunopeus, joten a = (0 − 12) m/s / 3 s = −4 m/s².', pic: 4 },
    ],
    try: 'auto',
  },
  'PHY79-ACCEL-MOTION-GRAPH': {
    beats: [
      { text: 'Tasa loikkii koko ajan samaa vauhtia: radan merkit ovat tasavälein, ja matka–aika-kuvaaja on suora. Kiito kiihdyttää, joten sen merkit harvenevat.', pic: 2 },
      { text: 'Kun nopeus kasvaa, matka kasvaa joka sekunti enemmän. Siksi Kiidon kuvaaja kaartuu ja jyrkkenee.', pic: 2 },
      { text: 'Hiipu hidastaa: joka sekunti se ehtii lyhyemmän matkan, joten merkit tihenevät. Sen kuvaaja kaartuu ja loivenee.', pic: 3 },
    ],
    try: 'auto',
  },
  'PHY79-ACCEL-VT-GRAPH': {
    beats: [
      { text: 'Sammakko kiihdyttää tasaisesti, joten nopeus–aika-kuvaaja on nouseva suora. Välillä 2–6 s nopeus kasvaa 8 m/s.', pic: 2 },
      { text: 'Kiihtyvyys on kuvaajan jyrkkyys: a = 8 m/s / 4 s = 2 m/s². Tulos on sama millä tahansa välillä, koska viiva on suora.', pic: 2 },
      { text: 'Nouseva viiva: a > 0, vaakasuora: a = 0, laskeva: a < 0. Välillä 5–7 s nopeus pienenee 6 m/s, joten a = −6 m/s / 2 s = −3 m/s².', pic: 3 },
    ],
    try: 'auto',
  },
  'PHY79-ACCEL-GRAPH': {
    beats: [
      { text: 'Sammakko lepää ensin, sitten kiihdyttää, loikkii tasaisesti ja lopuksi hidastaa. Vasen kynä piirtää matkan ja oikea nopeuden samasta liikkeestä.', pic: 2 },
      { text: 'Levossa matka–aika-kuvaaja on vaakasuora ja nopeus on 0. Kiihdytyksessä matka–aika-kuvaaja jyrkkenee ja nopeus–aika-kuvaaja nousee.', more: 'Hidastuessa matka–aika-kuvaaja loivenee ja nopeus–aika-kuvaaja laskee.', pic: 2 },
      { text: 'Tasaisessa liikkeessä matka–aika-kuvaaja on nouseva suora ja nopeus–aika-kuvaaja vaakasuora viiva. Mitä suurempi nopeus, sitä jyrkempi matka–aika-kuvaaja.', pic: 3 },
    ],
    try: 'auto',
  },
};
