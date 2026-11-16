import type { PageText } from '../text';

/** UM-15 Kehäpuiston observatorio: parts of a circle, angle relations, circumference, arc, circle and sector area. */
export const TEXT: Record<string, PageText> = {
  'M79-CIRCLE-RADIUS': {
    beats: [
      { text: 'Ympyrän keskipiste on O. Janat OE ja OF kulkevat keskipisteestä kehälle, ja kumpikin on 15 cm pitkä.', pic: 0 },
      { text: 'Jana keskipisteestä kehälle on ympyrän säde, ja sen tunnus on r. Kaikki säteet ovat yhtä pitkiä, koska kehän jokainen piste on yhtä kaukana keskipisteestä.', more: 'Piste X on ympyrän sisällä mutta ei keskellä. Siksi jana X:stä kehälle ei ole säde.', pic: 0 },
    ],
    try: {
      say: 'Ympyrän keskipiste on O, ja pisteet A ja E ovat kehällä. Piste X on ympyrän sisällä. Mikä jana on säde?',
      options: ['OA', 'XA', 'AE'],
      answer: 0,
      explain: 'Säde kulkee keskipisteestä kehälle. Jana OA alkaa keskipisteestä O ja päättyy kehän pisteeseen A.',
      why: [null, 'X ei ole keskipiste. Säde alkaa keskipisteestä O.', 'AE yhdistää kaksi kehän pistettä. Se on jänne, ei säde.'],
    },
  },
  'M79-CIRCLE-DIAMETER': {
    beats: [
      { text: 'Jana AH kulkee kehältä kehälle keskipisteen O kautta. Se koostuu kahdesta säteestä: 15 cm + 15 cm = 30 cm.', pic: 0 },
      { text: 'Keskipisteen kautta kulkeva jana kehältä kehälle on halkaisija. Halkaisija on kaksi kertaa säde: d = 2r.', more: 'Halkaisija on ympyrän pisin jänne. Jana, joka kulkee kehältä kehälle keskipisteen ohi, on lyhyempi.', pic: 0 },
    ],
    try: {
      say: 'Pyöreän pöydän säde on 45 cm. Kuinka pitkä on pöydän halkaisija?',
      options: ['90 cm', '22,5 cm', '45 cm'],
      answer: 0,
      explain: 'Halkaisija on kaksi sädettä peräkkäin: d = 2r = 2 · 45 cm = 90 cm.',
      why: [null, 'Jaoit kahdella. Halkaisija on kaksi kertaa säde, ei puolet siitä.', 'Halkaisija kulkee keskipisteen läpi, joten siinä on kaksi sädettä.'],
    },
  },
  'M79-CIRCLE-CIRCUMFERENCE-CONCEPT': {
    beats: [
      { text: 'Aava kiertää pöydän reunaa pisteestä E pisteiden F, A, C, D, B ja H kautta takaisin E:hen. Hän kulkee koko ympyräviivan kerran ympäri.', pic: 0 },
      { text: 'Ympyrän kehä on koko ympyrän reunaviiva. Kehän pituus kertoo, kuinka pitkä matka reunaa pitkin on kerran ympäri.', more: 'Kehä on viiva, ja pinta-ala on viivan sisään jäävä alue. Kehän pituus mitataan esimerkiksi senttimetreinä, pinta-ala neliösenttimetreinä.', pic: 0 },
    ],
    try: {
      say: 'Mikä kertoo, kuinka pitkä valonauha tarvitaan pyöreän pöydän reunan ympäri?',
      options: ['Kehän pituus', 'Halkaisija', 'Pinta-ala'],
      answer: 0,
      explain: 'Nauha kulkee reunaa pitkin kerran ympäri. Sen pituus on ympyrän kehän pituus.',
      why: [null, 'Halkaisija kulkee pöydän poikki, ei reunaa pitkin.', 'Pinta-ala kertoo, paljonko pintaa on reunan sisällä. Nauha kulkee reunalla.'],
    },
  },
  'M79-CIRCLE-ARC': {
    beats: [
      { text: 'Pisteet A ja B ovat kehällä. Kehää pitkin A:sta B:hen pääsee lyhyempää reittiä C:n ja D:n kautta tai pidempää reittiä F:n, E:n ja H:n kautta.', pic: 0 },
      { text: 'Kehän osa kahden pisteen välillä on kaari. Koska kaksi pistettä jakaa kehän kahdeksi kaareksi, kaari nimetään välipisteen avulla: kaari A–C–B.', pic: 0 },
    ],
    try: {
      say: 'Kehän pisteet A ja B jakavat kehän kahteen osaan. Mikä kumpikin osa on?',
      options: ['Kaari', 'Jänne', 'Säde'],
      answer: 0,
      explain: 'Kaari on kehän osa kahden pisteen välillä. Pisteet A ja B jakavat kehän kahdeksi kaareksi.',
      why: [null, 'Jänne on suora jana A:sta B:hen. Kaari kulkee kehää pitkin.', 'Säde kulkee keskipisteestä kehälle.'],
    },
  },
  'M79-CIRCLE-BASIC': {
    beats: [
      { text: 'Kartassa näkyvät ympyrän osat: säde OA, halkaisija AH, kaari A–C–B ja koko kehä. Säde on 15 cm ja halkaisija 30 cm.', pic: 0 },
      { text: 'Säde kulkee keskipisteestä kehälle, halkaisija keskipisteen kautta kehältä kehälle. Kaari on osa kehää, ja kehä on koko reunaviiva.', pic: 0 },
    ],
    try: {
      say: 'Ympyrän halkaisija on 40 cm. Kuinka kaukana keskipisteestä on jokainen kehän piste?',
      options: ['20 cm', '40 cm', 'Eri pisteet eri kaukana'],
      answer: 0,
      explain: 'Jokainen kehän piste on säteen päässä keskipisteestä. Säde on puolet halkaisijasta: 40 cm : 2 = 20 cm.',
      why: [null, '40 cm on koko halkaisija. Keskipisteestä kehälle on puolet siitä.', 'Kehän jokainen piste on yhtä kaukana keskipisteestä, säteen verran.'],
    },
  },
  'M79-CENTRAL-ANGLE': {
    beats: [
      { text: 'Kulman kärki on keskipisteessä O, ja sen kyljet kulkevat kehän pisteisiin A ja B. Kulma avautuu kaarelle A–C–B, ja se on 96°.', pic: 0 },
      { text: 'Kulma, jonka kärki on ympyrän keskipisteessä, on keskuskulma. Kaaren asteluku on sama kuin sitä vastaavan keskuskulman: kaari A–C–B on 96°.', pic: 0 },
      { text: 'Keskuskulma kertoo kaaren osuuden kehästä ympyrän koosta riippumatta. 96°:n kaari on aina 96/360 = 4/15 koko kehästä.', pic: 0 },
    ],
    try: {
      say: 'Keskuskulma on 90°. Kuinka suuri osa koko kehästä on sitä vastaava kaari?',
      options: ['Neljäsosa', 'Puolet', 'Se riippuu ympyrän koosta'],
      answer: 0,
      explain: 'Täysi kierros on 360°, ja 90° / 360° = 1/4. Kaari on neljäsosa kehästä, oli ympyrä pieni tai suuri.',
      why: [null, 'Puolet kehästä vastaa 180°:n keskuskulmaa.', 'Osuus on aina 90° / 360° = 1/4. Ympyrän koko muuttaa vain kaaren pituutta.'],
    },
  },
  'M79-CIRCLE-CIRC': {
    beats: [
      { example: 'Pyöreän pihan säde on 16 cm. Kuinka pitkä valonauha tarvitaan reunan ympäri?', text: 'Kehän pituus on C = 2πr = 2 · π · 16 cm = 32π cm. Likiarvona se on noin 100,53 cm.', more: 'Tarkka tulos jätetään piin muotoon, 32π cm. Likiarvo saadaan, kun π korvataan luvulla 3,14159… ja tulos pyöristetään.', pic: 0 },
      { text: 'Jokaisen ympyrän kehä on π kertaa halkaisija, ja π ≈ 3,14. Halkaisija on 32 cm, ja 3 · 32 cm = 96 cm < 100,53 cm < 4 · 32 cm = 128 cm, joten tulos on järkevä.', pic: 0 },
    ],
    try: {
      say: 'Ympyrän säde on 5 cm. Kuinka pitkä on sen kehä?',
      options: ['10π cm eli noin 31,4 cm', '5π cm eli noin 15,7 cm', '25π cm eli noin 78,5 cm'],
      answer: 0,
      explain: 'Kehä on C = 2πr = 2 · π · 5 cm = 10π cm ≈ 31,4 cm. Se on π kertaa halkaisija 10 cm.',
      why: [null, 'Kaavassa 2πr säde kerrotaan myös kahdella. Kehä on π kertaa halkaisija 10 cm.', 'πr² on pinta-ala. Kehä on 2πr = 10π cm.'],
    },
  },
  'M79-ARC': {
    beats: [
      { example: 'Säde on 16 cm ja kaaren keskuskulma 96°. Kuinka pitkä on kaari?', text: 'Kaari on 96/360 = 4/15 koko kehästä. Kehä on 32π cm, joten kaari on 4/15 · 32π cm ≈ 26,81 cm.', more: 'Suuruusluokka: 96° on vähän yli 90°. Neljäsosa kehästä on 8π cm eli noin 25 cm, joten noin 27 cm on järkevä.', pic: 0 },
      { text: 'Kaaren pituus on keskuskulman osuus koko kehästä: b = α/360° · 2πr. Kaksi kertaa suurempi keskuskulma antaa kaksi kertaa pidemmän kaaren.', pic: 0 },
    ],
    try: {
      say: 'Ympyrän kehä on 60 cm. Kuinka pitkä on kaari, jonka keskuskulma on 120°?',
      options: ['20 cm', '120 cm', '40 cm'],
      answer: 0,
      explain: '120° on kolmasosa täydestä kulmasta 360°. Kaari on kolmasosa kehästä: 60 cm : 3 = 20 cm.',
      why: [null, 'Kaari on vain osa kehästä, joten se on lyhyempi kuin 60 cm.', '40 cm vastaisi 240°:n keskuskulmaa. 120° on kolmasosa, ei kaksi kolmasosaa.'],
    },
  },
  'M79-CIRCLE-AREA': {
    beats: [
      { example: 'Pyöreän pihan säde on 16 cm. Kuinka paljon peitettä tarvitaan?', text: 'Pinta-ala on A = πr² = π · 16² cm² = 256π cm². Likiarvona se on noin 804,25 cm².', pic: 0 },
      { text: 'Ympyrä leikataan kapeiksi sektoreiksi, jotka asetetaan vuorotellen rinnakkain. Syntyy lähes suorakulmio, jonka korkeus on r ja pituus puolet kehästä, πr: ala on πr · r = πr².', pic: 0 },
      { text: 'Kun säde kaksinkertaistuu, ala nelinkertaistuu, koska säde on kaavassa neliönä. Säteellä 8 cm ala on 64π cm², neljäsosa 256π cm²:stä.', pic: 0 },
    ],
    try: {
      say: 'Ympyrän säde kaksinkertaistetaan. Mitä ympyrän pinta-alalle tapahtuu?',
      options: ['Se nelinkertaistuu', 'Se kaksinkertaistuu', 'Se pysyy samana'],
      answer: 0,
      explain: 'Säde on kaavassa neliönä: π(2r)² = 4πr². Ala on siis neljä kertaa entinen.',
      why: [null, 'Säde on kaavassa neliönä: (2r)² = 4r², ei 2r².', 'Isompi säde antaa isomman ympyrän ja siis isomman alan.'],
    },
  },
  'M79-INSCRIBED-ANGLE-CONCEPT': {
    beats: [
      { text: 'Kulman kärki E on kehällä, ja sen kyljet kulkevat kehän pisteisiin A ja B. Kulma avautuu kaarelle A–C–B.', pic: 0 },
      { text: 'Kulma, jonka kärki on kehällä ja kyljet ovat jänteitä, on kehäkulma. Se vastaa kaarta, joka jää sen kylkien väliin.', more: 'Kärki on aina toisella kaarella kuin vastattava kaari. Tässä kärki E on eri kaarella kuin piste C.', pic: 0 },
    ],
    try: {
      say: 'Kulman kärki on ympyrän keskipisteessä, ja sen kyljet päättyvät kehälle. Onko kulma kehäkulma?',
      options: ['Ei, se on keskuskulma', 'Kyllä, koska kyljet päättyvät kehälle', 'Kyllä, jos kulma on alle 90°'],
      answer: 0,
      explain: 'Kulman lajin ratkaisee kärjen paikka. Kehäkulman kärki on kehällä, keskuskulman kärki keskipisteessä.',
      why: [null, 'Myös keskuskulman kyljet päättyvät kehälle. Kehäkulman kärki on kehällä.', 'Kulman koko ei ratkaise. Lajin ratkaisee kärjen paikka.'],
    },
  },
  'M79-SECTOR': {
    beats: [
      { example: 'Säde on 16 cm ja sektorin keskuskulma 96°. Kuinka suuri on sektorin ala?', text: 'Sektori on 96/360 = 4/15 koko ympyrästä. Ympyrän ala on 256π cm², joten sektorin ala on 4/15 · 256π cm² ≈ 214,47 cm².', pic: 0 },
      { text: 'Sektori on kahden säteen ja kaaren rajaama ympyrän osa. Sen ala on keskuskulman osuus koko ympyrän alasta: A = α/360° · πr².', pic: 0 },
    ],
    try: {
      say: 'Ympyrän ala on 80 cm². Kuinka suuri on sektori, jonka keskuskulma on 90°?',
      options: ['20 cm²', '40 cm²', '90 cm²'],
      answer: 0,
      explain: '90° on neljäsosa täydestä kulmasta 360°. Sektori on neljäsosa ympyrästä: 80 cm² : 4 = 20 cm².',
      why: [null, '40 cm² on puoliympyrä, jonka keskuskulma on 180°.', 'Sektori on osa ympyrää, joten sen ala on alle 80 cm².'],
    },
  },
  'M79-INSCRIBED-CENTRAL-REL': {
    beats: [
      { text: 'Keskuskulma AOB on 96° ja kehäkulma AEB 48°. Molemmat avautuvat samalle kaarelle A–C–B.', pic: 0 },
      { text: 'Kehäkulma on puolet samaa kaarta vastaavasta keskuskulmasta. Keskuskulma on siis kaksi kertaa kehäkulma: 2 · 48° = 96°.', pic: 0 },
      { text: 'Kehäkulman kärjen voi siirtää mihin tahansa kohtaan toisella kaarella, ja kulma pysyy 48°:na. Saman kaaren kehäkulmat ovat yhtä suuret.', pic: 0 },
    ],
    try: {
      say: 'Kehäkulma on 35°. Kuinka suuri on samaa kaarta vastaava keskuskulma?',
      options: ['70°', '17,5°', '35°'],
      answer: 0,
      explain: 'Keskuskulma on kaksi kertaa samaa kaarta vastaava kehäkulma: 2 · 35° = 70°.',
      why: [null, 'Keskuskulma on suurempi: kaksi kertaa kehäkulma, ei puolet.', 'Kulmat eivät ole yhtä suuret. Keskuskulma on kaksinkertainen.'],
    },
  },
  'M79-INSCRIBED-ANGLE': {
    beats: [
      { text: 'Kaaren A–C–B keskuskulma on 96°. Kehäkulman kärki E on kehällä, ja kyljet päättyvät kaaren päihin A ja B.', pic: 0 },
      { text: 'Kehäkulma on puolet samaa kaarta vastaavasta keskuskulmasta: 96° : 2 = 48°.', pic: 0 },
      { text: 'Tarkista ensin rakenne: kärki on kehällä, kyljet päättyvät kaaren päihin ja kärki on toisella kaarella. Vasta silloin puolitussääntö pätee.', pic: 0 },
    ],
    try: {
      say: 'Kaaren A–C–B asteluku on 100°. Kuinka suuri on kehäkulma AEB, joka vastaa samaa kaarta?',
      options: ['50°', '100°', '200°'],
      answer: 0,
      explain: 'Kaaren asteluku on sama kuin sen keskuskulma, 100°. Kehäkulma on puolet siitä: 100° : 2 = 50°.',
      why: [null, '100° on keskuskulma ja kaaren asteluku. Kehäkulma on puolet siitä.', 'Kehäkulma on puolet keskuskulmasta, ei kaksinkertainen.'],
    },
  },
  'M79-THALES': {
    beats: [
      { text: 'Jana AH on halkaisija. Kehäkulmat, joiden kyljet päättyvät pisteisiin A ja H, ovat 90°, olipa kärki E tai F.', pic: 0 },
      { text: 'Halkaisijaa vastaava keskuskulma on oikokulma 180°, joten kehäkulma on 180° : 2 = 90°. Tämä on Thaleen lause: puoliympyrän kehäkulma on suora kulma.', pic: 0 },
      { text: 'Jänne AB ei ole halkaisija, joten sen kehäkulma ei ole suora. Sen keskuskulma on 96° ja kehäkulma 48°.', pic: 0 },
    ],
    try: {
      say: 'Kolmion kärjet ovat ympyrän kehällä, ja yksi sivu on halkaisija. Kuinka suuri on halkaisijaa vastapäätä oleva kulma?',
      options: ['90°', '180°', 'Se riippuu kärjen paikasta'],
      answer: 0,
      explain: 'Kulma on kehäkulma, joka vastaa halkaisijaa. Keskuskulma on 180°, joten kehäkulma on 90°. Tämä on Thaleen lause.',
      why: [null, '180° on halkaisijaa vastaava keskuskulma. Kehäkulma on puolet siitä.', 'Thaleen lauseen mukaan kulma on 90°, missä tahansa kehän kohdassa kärki onkin.'],
    },
  },
};
