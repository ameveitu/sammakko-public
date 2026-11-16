import type { PageText } from '../text';

/** UM-13 Kulmatuulen niemimaa: lines and rays, constructions, angle relations, congruence and similarity. */
export const TEXT: Record<string, PageText> = {
  'M79-CURVE': {
    beats: [
      { text: 'Kuvan kolme polkua ovat erilaisia viivoja. Ylin taittuu kulmassa, keskimmäinen kulkee suoraan ja alin kaartuu tasaisesti.', pic: 0 },
      { text: 'Suora viiva pysyy koko ajan samassa suunnassa. Murtoviiva koostuu suorista osista ja vaihtaa suuntaa kulmissa, kaareva viiva vaihtaa suuntaa jatkuvasti ilman kulmia.', more: 'Kaareva viiva voi olla avoin tai suljettu. Kuvan kaari on avoin, koska sillä on kaksi erillistä päätepistettä. Ympyrä on suljettu kaareva viiva.', pic: 0 },
    ],
    try: {
      say: 'Polku kulkee suoraan, kääntyy jyrkästi yhdessä kohdassa ja jatkuu taas suoraan. Millainen viiva se on?',
      options: ['Murtoviiva', 'Kaareva viiva', 'Suora viiva'],
      answer: 0,
      explain: 'Murtoviiva koostuu suorista osista, ja se vaihtaa suuntaa kulmissa. Tässä polussa on yksi kulma.',
      why: [null, 'Kaareva viiva vaihtaa suuntaa tasaisesti ilman teräviä kulmia.', 'Suora viiva ei vaihda suuntaa lainkaan.'],
    },
  },
  'M79-CONSTRUCT': {
    beats: [
      { text: 'Janan AB pituus on 28. Kun pisteistä A ja B piirretään samansäteiset ympyränkaaret, ne leikkaavat toisensa pisteissä P ja Q.', pic: 0 },
      { text: 'P ja Q ovat yhtä kaukana sekä A:sta että B:stä. Niiden kautta kulkeva suora on janan keskinormaali: se puolittaa janan pisteessä M ja on kohtisuorassa sitä vastaan.', more: 'Siksi AM = MB = 14. Keskinormaalin jokainen piste on yhtä kaukana janan päätepisteistä. Säteen pitää olla yli puolet janasta, muuten kaaret eivät kohtaa.', pic: 0 },
    ],
    try: 'auto',
  },
  'M79-RAY': {
    beats: [
      { text: 'Puolisuoralla on yksi alkupiste, ja se jatkuu toiseen suuntaan loputtomiin. Kuvan puolisuora alkaa pisteestä A ja kulkee pisteiden B ja C kautta nuolen suuntaan.', pic: 0 },
      { text: 'Piste D on samalla suoralla, mutta A:n toisella puolella, joten se ei ole puolisuoralla. Piste E ei ole edes samalla suoralla.', more: 'Puolisuoran nimeävät alkupiste ja mikä tahansa toinen sen piste: AB ja AC ovat sama puolisuora. Jana päättyy kumpaankin päähän, suora taas jatkuu kumpaankin suuntaan.', pic: 0 },
    ],
    try: 'auto',
  },
  'M79-LINEREL': {
    beats: [
      { text: 'Suorat r ja s on piirretty lyhyinä, mutta suora jatkuu kumpaankin suuntaan loputtomiin. Katkoviivat näyttävät jatkeet: r ja s kulkevat samaan suuntaan eivätkä koskaan kohtaa.', pic: 0 },
      { text: 'Suorat, jotka eivät leikkaa, ovat yhdensuuntaiset: r ∥ s. Jos suorat eivät ole yhdensuuntaiset, ne leikkaavat jossain, vaikka leikkauspiste olisi kuvan ulkopuolella.', pic: 0 },
      { text: 'Kohtisuorat suorat ovat leikkaavien suorien erikoistapaus: ne leikkaavat suorassa eli 90°:n kulmassa. Merkintä r ⊥ s tarkoittaa, että r on kohtisuorassa s:ää vastaan.', pic: null },
    ],
    try: 'auto',
  },
  'M79-POLY-ANGLES': {
    beats: [
      { text: 'Viisikulmion ABCDE kärjestä A piirretään lävistäjät AC ja AD. Ne jakavat viisikulmion kolmeen kolmioon.', pic: 0 },
      { text: 'Jokaisen kolmion kulmien summa on 180°, ja kolmioiden kulmat muodostavat yhdessä viisikulmion kulmat. Viisikulmion kulmien summa on siis 3 · 180° = 540°.', more: 'Yhden kulman saa jakamalla summan kulmien määrällä vain, jos kulmat ovat yhtä suuret. Kuvan viisikulmion kulmat ovat erisuuret, joten 540° : 5 = 108° ei kerro yksittäistä kulmaa.', pic: 0 },
      { text: 'Kupera n-kulmio jakautuu yhdestä kärjestä n − 2 kolmioon, joten sen kulmien summa on (n − 2) · 180°. Esimerkiksi kuusikulmiossa summa on 4 · 180° = 720°.', pic: null },
    ],
    try: 'auto',
  },
  'M79-CONGRUENCE': {
    beats: [
      { text: 'Yhtenevät kuviot ovat täsmälleen samankokoiset ja samanmuotoiset. Ne voidaan sovittaa päällekkäin siirtämällä, kiertämällä tai peilaamalla.', pic: 0 },
      { text: 'Kuvan malli 3 on yhtenevä: sen sivut ovat yhtä pitkät kuin alkuperäisessä, vaikka se on kierretty eri asentoon. Mallit 1 ja 2 ovat kaksi kertaa suuremmat, joten ne eivät ole yhteneviä.', more: 'Kaikki mallit on piirretty samassa mittakaavassa, joten kokoja voi verrata suoraan. Peilikuvakin on yhtenevä, koska peilaus säilyttää kaikki pituudet ja kulmat.', pic: 0 },
    ],
    try: 'auto',
  },
  'M79-SIMILARITY': {
    beats: [
      { text: 'Yhdenmuotoisilla kuvioilla on sama muoto, mutta koko voi olla eri. Jokainen pituus kerrotaan samalla luvulla, jota sanotaan pituuskertoimeksi.', pic: 0 },
      { text: 'Mallissa 2 alkuperäisen sivut 5 ja 2 ovat muuttuneet sivuiksi 15 ja 6, ja muutkin sivut ovat kolminkertaiset. Malli 2 on siis yhdenmuotoinen, ja pituuskerroin on 3.', more: 'Mallissa 1 pisin sivu on 20 ja lyhin 6. Alkuperäisessä vastaavat sivut ovat 5 ja 2, joten kertoimet olisivat 4 ja 3. Koska ne ovat eri, malli 1 ei ole yhdenmuotoinen.', pic: 0 },
      { text: 'Kierto ja peilaus eivät muuta muotoa. Yhtenevät kuviot ovat yhdenmuotoisia kuvioita, joiden pituuskerroin on 1.', pic: null },
    ],
    try: 'auto',
  },
  'M79-CONG-CRIT': {
    beats: [
      { text: 'Varaosan sivut ovat AB = 5, BC = 5 ja AC = √10, ja uuden mallin sivut FD = 5, DE = 5 ja FE = √10. Kaikki kolme sivua ovat pareittain yhtä pitkät.', pic: 0 },
      { text: 'Kolme sivua määräävät kolmion koon ja muodon yksiselitteisesti, joten kolmiot ovat yhtenevät. Uusi malli on varaosan peilikuva, ja peilikuvakin on yhtenevä.', pic: 0 },
      { text: 'Yhtenevyyteen riittävät myös kaksi sivua ja niiden välinen kulma tai kaksi kulmaa ja sivu. Pelkät kolme kulmaa eivät riitä, koska ne eivät kerro kolmion kokoa.', pic: null },
    ],
    try: 'auto',
  },
  'M79-SIM-CRIT': {
    beats: [
      { text: 'Varaosan kulmat ovat ∠A ≈ 71,57° ja ∠B ≈ 36,87°. Uuden mallin kulmat ∠F ja ∠D ovat samat, vaikka malli on kaksi kertaa suurempi.', pic: 0 },
      { text: 'Kun kaksi kulmaa ovat yhtä suuret, kolmaskin on, koska kulmien summa on aina 180°. Siksi kaksi kulmaa riittää osoittamaan kolmiot yhdenmuotoisiksi.', more: 'Yhdenmuotoisuuteen riittävät myös kolme sivua samassa suhteessa tai kaksi sivua samassa suhteessa ja niiden välinen kulma. Kulmat eivät kerro kokoa, joten yhdenmuotoiset kolmiot voivat olla eri kokoisia.', pic: 0 },
    ],
    try: 'auto',
  },
  'M79-VERTICAL-ANGLES': {
    beats: [
      { text: 'Kun kaksi suoraa leikkaa, syntyy neljä kulmaa. Vastakkaiset kulmat ovat ristikulmia: kuvassa A ja C ovat ristikulmat, samoin B ja D.', pic: 0 },
      { text: 'Ristikulmat ovat yhtä suuret, koska kumpikin täydentää saman kulman B oikokulmaksi: A + B = 180° ja C + B = 180°. Siksi C = A = 62°.', more: 'Vierekkäiset kulmat eivät yleensä ole yhtä suuret: B = 180° − 62° = 118°. Sen ristikulma on D = 118°.', pic: 0 },
    ],
    try: 'auto',
  },
  'M79-SUPPLEMENTARY-ANGLES': {
    beats: [
      { text: 'Oikokulma on 180°, puolet täydestä kulmasta. Kuvassa kulmat A ja B ovat vierekkäin saman suoran varrella, ja yhdessä ne muodostavat oikokulman.', pic: 0 },
      { text: 'Siksi A + B = 180°, joten B = 180° − 67° = 113°. Kulma C on B:n vieressä, mutta B ja C eivät yhdessä muodosta oikokulmaa: 113° + 33° = 146°.', more: 'Kulmia, jotka yhdessä muodostavat oikokulman, sanotaan vieruskulmiksi. Pelkkä vierekkäisyys ei riitä: B:n ja C:n ulommat kyljet eivät ole samalla suoralla.', pic: 0 },
    ],
    try: 'auto',
  },
  'M79-ANGLE-REL': {
    beats: [
      { text: 'Kun kaksi suoraa leikkaa, yksi tunnettu kulma riittää kaikkien neljän kulman laskemiseen. Kuvassa A = 54°.', pic: 0 },
      { text: 'Ristikulma C on yhtä suuri kuin A, eli C = 54°. Vieruskulma B täydentää A:n oikokulmaksi: B = 180° − 54° = 126°, ja sen ristikulma on D = 126°.', more: 'Tarkistus: neljä kulmaa muodostavat yhdessä täyden kulman, ja 54° + 126° + 54° + 126° = 360°.', pic: 0 },
    ],
    try: 'auto',
  },
  'M79-TRI-ANGLE-SUM': {
    beats: [
      { text: 'Kuvan kolmiossa A = 35° ja C = 30°. Kun kolmion kulmat asetetaan vierekkäin samaan kärkeen, ne täyttävät yhdessä oikokulman eli 180°.', pic: 0 },
      { text: 'Kolmion kulmien summa on siis aina 180°. Puuttuva kulma saadaan vähentämällä tunnetut kulmat: B = 180° − 35° − 30° = 115°.', more: 'Kolmiossa voi siksi olla vain yksi tylppä tai suora kulma. Jos ehdotettujen kulmien summa ei ole 180°, niistä ei voi koota kolmiota. Kolmion kulma ei voi myöskään olla 0°.', pic: 0 },
    ],
    try: {
      say: 'Kolmion kaksi kulmaa ovat 50° ja 60°. Kuinka suuri on kolmas kulma?',
      options: ['70°', '110°', '250°'],
      answer: 0,
      explain: 'Kolmion kulmien summa on 180°, joten kolmas kulma on 180° − 50° − 60° = 70°.',
      why: [null, 'Tämä on annettujen kulmien summa. Se pitää vielä vähentää 180 asteesta.', 'Tässä vähennettiin 360 asteesta. Kolmion kulmien summa on 180°, ei 360°.'],
    },
  },
  'M79-SIMILAR-SCALE': {
    beats: [
      { text: 'Pienoismallin vertailusivu on 5 cm ja suurennoksen 10 cm. Pituuskerroin on siis k = 10 : 5 = 2, ja jokainen pituus kerrotaan kahdella.', pic: 0 },
      { text: 'Toinen sivu kasvaa samalla kertoimella: 4 cm · 2 = 8 cm.', more: 'Jos suurennoksen pituus tunnetaan, alkuperäinen saadaan jakamalla kertoimella: 8 cm : 2 = 4 cm. Pienennöksessä kerroin on alle 1.', pic: 0 },
      { text: 'Pinta-ala kasvaa kertoimella k² ja tilavuus kertoimella k³. Kun k = 2, pinta-ala on 2 · 2 = 4-kertainen ja tilavuus 2 · 2 · 2 = 8-kertainen.', more: 'Pinta-alassa pituus muuttuu kahteen suuntaan, tilavuudessa kolmeen. Esimerkiksi 1 cm:n sivuisesta neliöstä tulee 2 cm:n sivuinen neliö, jonka ala on 4 cm².', pic: null },
    ],
    try: 'auto',
  },
};
