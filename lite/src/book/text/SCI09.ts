import type { PageText } from '../text';

/** SCI09 Mittausvuoren majakka: quantities, units, measuring, graphs, and interpreting and justifying results. */
export const TEXT: Record<string, PageText> = {
  'PHY79-RESULT-EVAL': {
    beats: [
      { text: 'Veneen kulkemaa matkaa mitattiin sekunnin välein: 0, 4, 8 ja 12 m. Joka sekunti matka kasvoi saman verran, 4 m.', pic: 0 },
      { text: 'Tuloksia arvioidaan vertaamalla jokaista mittaparia muihin. Jos hetkellä 2 s olisi saatu 9 m eikä 8 m, se poikkeaisi muiden säännöstä.', pic: null },
      { text: 'Poikkeavaa arvoa ei poisteta ilman selvitystä. Olosuhteet tarkistetaan ja mittaus toistetaan, ja vasta sitten päätetään, mitä tulos kertoo.', more: 'Jos uusinta antaa 8 m, poikkeama oli luultavasti mittausvirhe. Jos 9 m toistuu samoissa oloissa, se on todellinen havainto, ja johtopäätös rajataan sen mukaan.', pic: null },
    ],
    try: {
      say: 'Lämpötila mitattiin minuutin välein: 20, 22, 24, 35 ja 28 °C. Mitä arvolle 35 °C kannattaa tehdä ensin?',
      options: ['Tarkistaa olot ja toistaa mittaus', 'Poistaa arvo, koska se ei sovi', 'Hyväksyä arvo sellaisenaan'],
      answer: 0,
      explain: 'Muut arvot kasvavat 2 °C minuutissa, joten 35 °C poikkeaa. Se voi olla mittausvirhe tai todellinen havainto: toisto samoissa oloissa näyttää, kummasta on kyse.',
      why: [null, 'Poistaminen ilman selvitystä voi piilottaa todellisen ilmiön.', 'Yksittäinen poikkeama voi johtua mittausvirheestä, joten se tarkistetaan ensin.'],
    },
  },
  'PHY79-CONCLUSION-JUSTIFY': {
    beats: [
      { text: 'Johtopäätös on vastaus tutkimuskysymykseen. Tässä se on: veneen matka kasvaa joka sekunti 4 m.', pic: 0 },
      { text: 'Johtopäätös perustellaan mittapareilla: 1 s ja 4 m, 2 s ja 8 m, 3 s ja 12 m. Jokaisessa parissa matka on neljä kertaa aika.', pic: 0 },
      { text: 'Johtopäätös rajataan aineistoon. Se koskee tätä venettä ja mitattua aikaa, ja pidemmästä ajosta tarvittaisiin omat mittaukset.', pic: 0 },
    ],
    try: {
      say: 'Mikä perustelee parhaiten johtopäätöksen "matka kasvaa 4 m sekunnissa"?',
      options: ['Kaikki mittaparit: 4 m, 8 m ja 12 m', 'Yksi mittapari: 2 s ja 8 m', 'Oletus, että vene kulkee tasaisesti'],
      answer: 0,
      explain: 'Kun kaikissa pareissa matka kasvaa 4 m sekunnissa, sääntö on tarkistettu koko aineistosta.',
      why: [null, 'Yhdestä parista ei näe, pysyykö kasvu samana koko ajan.', 'Oletus ei ole havainto. Johtopäätös perustellaan mittauksilla.'],
    },
  },
  'PHY79-CONCL-01': {
    beats: [
      { text: 'Ensin arvioidaan, riittääkö aineisto. Tässä on mitattu neljä eri aikaa samalla menetelmällä, joten vertailuja on tarpeeksi.', pic: 0 },
      { text: 'Kaikki parit noudattavat samaa sääntöä: matka metreinä on neljä kertaa aika sekunteina. Johtopäätös: vene kulkee tasaisesti 4 m sekunnissa.', pic: 0 },
      { text: 'Jos aineistossa olisi vain yksi pari, esimerkiksi 1 s ja 4 m, sääntöä ei voisi tarkistaa. Silloin tarvitaan lisää mittauksia ennen päätöstä.', pic: null },
    ],
    try: {
      say: 'Aava mittasi kolme paria samalla tavalla: 1 s ja 3 m, 2 s ja 6 m, 3 s ja 9 m. Mitä niistä voi päätellä?',
      options: ['Vene kulkee tasaisesti 3 m sekunnissa', 'Mittauksia on liian vähän päätökseen', 'Vene kiihtyy koko ajan'],
      answer: 0,
      explain: 'Jokaisessa parissa matka on kolme kertaa aika, ja vertailuja on useita. Siksi voi päätellä, että vene kulkee tasaisesti 3 m sekunnissa.',
      why: [null, 'Kolme samalla menetelmällä mitattua paria riittää vertailuun: sama sääntö toistuu jokaisessa.', 'Kiihtyessä matka kasvaisi joka sekunti enemmän. Tässä se kasvaa aina 3 m.'],
    },
  },
  'PHY79-QUESTION-01': {
    beats: [
      { text: 'Vaunu laskee radalla, jonka kallistus on joko 10° tai 14°. Muuten vaunu ja rata pysyvät samoina.', pic: null },
      { text: 'Tutkimuskysymys kertoo, mitä muutetaan ja mitä mitataan. Esimerkiksi: miten radan kallistus vaikuttaa vaunun kulkuaikaan?', more: 'Muutettava tekijä on radan kallistus, ja mitattava tulos on kulkuaika sekunteina.', pic: null },
      { text: 'Hyvään tutkimuskysymykseen voi vastata mittaamalla. Kysymykseen "onko jyrkempi rata parempi?" ei saa mittaustulosta, koska "parempi" jää epäselväksi.', pic: null },
    ],
    try: {
      say: 'Mikä näistä on mitattava tutkimuskysymys?',
      options: ['Miten kallistus vaikuttaa vaunun kulkuaikaan?', 'Onko 14° kallistus parempi kuin 10°?', 'Mitä vaunulle tapahtuu radalla?'],
      answer: 0,
      explain: 'Kysymys kertoo, mitä muutetaan (kallistus) ja mitä mitataan (kulkuaika). Siihen voi vastata mittaustuloksilla.',
      why: [null, '"Parempi" ei kerro, mitä mitataan.', 'Kysymys ei kerro, mitä muutetaan eikä mitä mitataan.'],
    },
  },
  'PHY79-PLAN-01': {
    beats: [
      { text: 'Suunnitelmassa päätetään ensin, mitä muutetaan ja mitä mitataan. Tässä muutetaan radan kallistusta, 10° tai 14°, ja mitataan vaunun kulkuaika.', pic: null },
      { text: 'Muut tekijät vakioidaan eli pidetään samoina: sama vaunu, sama rata ja sama lähtökohta. Silloin aikaero johtuu vain kallistuksesta.', pic: null },
      { text: 'Kumpikin kallistus mitataan esimerkiksi kolme kertaa. Toistot näyttävät, kuinka paljon tulokset vaihtelevat itsestään.', pic: null },
    ],
    try: {
      say: 'Vertaat kallistuksia 10° ja 14°. Mitä teet muille tekijöille, kuten vaunulle ja radan pinnalle?',
      options: ['Pidän ne samoina', 'Muutan niitäkin samalla'],
      answer: 0,
      explain: 'Kun vain kallistus muuttuu, kulkuajan ero voidaan liittää kallistukseen.',
      why: [null, 'Jos vaunukin vaihtuu, ei tiedä, johtuuko aikaero kallistuksesta vai vaunusta.'],
    },
  },
  'PHY79-QTY-CONCEPT': {
    beats: [
      { text: 'Sammakko hyppää vaa\'alle, ja vaaka näyttää 0,4 kg. Massa on suure: ominaisuus, jonka voi mitata ja ilmaista luvulla ja yksiköllä.', pic: 0 },
      { text: 'Sammakko loikkii, ja sekuntikello näyttää 3 s. Aikakin on suure.', pic: 1 },
      { text: 'Suosikkiväri vihreä on nimilappu, ei mittaustulos: siinä ei ole lukua eikä yksikköä.', more: 'Valon ominaisuuksia, kuten aallonpituutta, voi silti mitata sopivalla välineellä.', pic: 2 },
    ],
    try: 'auto',
  },
  'PHY79-DATA-01': {
    beats: [
      { text: 'Mittaukset kirjataan taulukkoon. Otsikkoriville tulee suure, sen tunnus ja yksikkö sulkeissa: aika t (s) ja matka s (m).', pic: 2 },
      { text: 'Kun auto ajaa, taulukkoon tulee joka sekunti uusi rivi. Auto etenee 3 m sekunnissa, joten hetkellä 4 s matka on 12 m.', more: 'Saman hetken aika ja matka kirjataan aina samalle riville.', pic: 0 },
      { text: 'Koska yksikkö on jo otsikossa, riveille riittävät pelkät luvut. Taulukosta mittauksia on helppo verrata.', pic: 3 },
    ],
    try: 'auto',
  },
  'PHY79-MODEL-01': {
    beats: [
      { text: 'Mittauksissa matka kasvaa joka sekunti 4 m: 0, 4, 8 ja 12 m. Sama sääntö pätee kaikkiin pareihin.', pic: 0 },
      { text: 'Malli on y = k · x, missä x on aika sekunteina ja y matka metreinä. Kerroin on k = 12 : 3 = 4, joten malli on y = 4x.', pic: 0 },
      { text: 'Malli tarkistetaan kaikilla pisteillä: 4 · 1 = 4 ja 4 · 2 = 8. Mallille ilmoitetaan myös käyttöalue, tässä ajat 0–5 s.', more: 'Käyttöalueen ulkopuolella mallin ennusteisiin ei voi luottaa ilman uusia mittauksia.', pic: 0 },
    ],
    try: {
      say: 'Mittaukset: 1 s → 3 m, 2 s → 6 m ja 3 s → 9 m. Mikä malli sopii kaikkiin pisteisiin?',
      options: ['y = 3x', 'y = 3', 'y = x + 2'],
      answer: 0,
      explain: 'Jokaisessa parissa matka on kolme kertaa aika: 3 · 1 = 3, 3 · 2 = 6 ja 3 · 3 = 9.',
      why: [null, 'Malli y = 3 antaisi joka hetkellä 3 m, mutta matka kasvaa.', 'Malli y = x + 2 sopii vain ensimmäiseen pisteeseen: 2 s antaisi 4 m eikä 6 m.'],
    },
  },
  'PHY79-NUMVALUE': {
    beats: [
      { text: 'Vaaka näyttää 2,5 kg. Lukuarvo 2,5 kertoo, kuinka paljon, ja yksikkö kg kertoo, mihin verrattiin.', pic: 0 },
      { text: 'Merkinnässä s = 12,5 km on neljä osaa: tunnus s, yhtäsuuruusmerkki, lukuarvo 12,5 ja yksikkö km.', pic: 1 },
      { text: 'Lukuarvo ei ole pelkkä 12. Desimaaliosa kuuluu lukuun, joten lukuarvo on 12,5.', pic: 1 },
    ],
    try: 'auto',
  },
  'PHY79-UNIT-CONCEPT': {
    beats: [
      { text: 'Ensin piirretään 5 cm: pieni pätkä. Sitten piirretään 5 m, joka on sata kertaa pidempi.', pic: 0 },
      { text: 'Luku 5 on molemmissa sama, mutta yksikkö muuttaa kaiken. Yksikkö kertoo, mihin mittausta verrattiin.', pic: 0 },
      { text: 'Merkinnässä t = 40 s yksikkö on s eli sekunti. Ilman yksikköä 40 voisi olla minuutteja tai tunteja.', pic: 1 },
    ],
    try: 'auto',
  },
  'PHY79-QTY-01': {
    beats: [
      { text: 'Lämpömittari laitetaan veteen, ja punainen pylväs nousee 18 asteeseen. Tulos on lämpötila 18 °C.', pic: 0 },
      { text: 'Tulos puretaan kolmeen osaan: suure on lämpötila, lukuarvo 18 ja yksikkö °C. Kokonaisesta tuloksesta ei puutu yhtäkään niistä.', pic: 0 },
      { text: 'Merkinnässä v = 6 m/s suure on nopeus, tunnus v, lukuarvo 6 ja yksikkö m/s. Yksikössäkin voi olla kaksi osaa.', pic: 1 },
    ],
    try: 'auto',
  },
  'PHY79-GRAPH-01': {
    beats: [
      { text: 'Taulukossa on neljä mittausta: 0 s ja 0 m, 2 s ja 10 m, 4 s ja 20 m sekä 6 s ja 30 m. Jokaisesta rivistä tulee kuvaajaan yksi piste.', pic: 2 },
      { text: 'Aika t merkitään vaaka-akselille ja matka s pystyakselille. Rivi 4 s ja 20 m on piste (4, 20): ensin 4 oikealle, sitten 20 ylös.', more: 'Kummankin akselin asteikko kasvaa tasaisin välein.', pic: 3 },
      { text: 'Kuvaaja voi piirtyä myös samalla, kun auto ajaa. Tämä auto etenee 4 m sekunnissa, joten ajalla 4 s piste on (4, 16).', pic: 0 },
    ],
    try: 'auto',
  },
  'PHY79-PREDICT-01': {
    beats: [
      { text: 'Mittauksiin sopii malli y = 4x: matka metreinä on neljä kertaa aika sekunteina. Mallin käyttöalue on 0–5 s.', pic: 0 },
      { text: 'Ennuste uudelle ajalle saadaan sijoittamalla se malliin. Ajalla 4 s y = 4 · 4 = 16, joten ennuste on 16 m.', more: 'Aika 4 s on käyttöalueella 0–5 s, joten mallia saa käyttää.', pic: 0 },
      { text: 'Käyttöalueen ulkopuolelle mallia ei venytetä. Ajalle 6 s malli antaisi 24 m, mutta sitä ei voi päätellä näistä mittauksista.', pic: null },
    ],
    try: {
      say: 'Malli y = 4x pätee ajoille 0–5 s. Mitä se ennustaa ajalle 2,5 s?',
      options: ['10 m', '6,5 m', 'Ei voi päätellä'],
      answer: 0,
      explain: 'Aika 2,5 s on käyttöalueella, joten sijoitetaan: y = 4 · 2,5 = 10.',
      why: [null, '6,5 saadaan laskemalla 4 + 2,5, mutta malli kertoo luvut keskenään.', '2,5 s on käyttöalueella 0–5 s, joten mallia voi käyttää.'],
    },
  },
  'PHY79-SI-01': {
    beats: [
      { text: 'SI-järjestelmä on kansainvälinen yhteinen mittakieli. Jokaisella suureella on siinä oma yksikkönsä ja yksikön tunnus.', pic: null },
      { text: 'Pituuden SI-yksikkö on metri (m), massan kilogramma (kg) ja ajan sekunti (s). Sähkövirran yksikkö on ampeeri (A) ja lämpötilan kelvin (K).', pic: null },
      { text: 'Minuutti on tuttu ajan yksikkö, mutta se ei ole SI-yksikkö. Henkilön mukaan nimetyt tunnukset kirjoitetaan isolla, kuten N (newton) ja W (watti).', pic: null },
    ],
    try: {
      say: 'Majakan viestissä lukee: 10 N. Mitä suuretta se kuvaa?',
      options: ['Voimaa', 'Massaa', 'Energiaa'],
      answer: 0,
      explain: 'N on newton, voiman SI-yksikkö. Tunnus kirjoitetaan isolla, koska yksikkö on nimetty Isaac Newtonin mukaan.',
      why: [null, 'Massan SI-yksikkö on kilogramma, kg.', 'Energian SI-yksikkö on joule, J.'],
    },
  },
  'PHY79-UNIT-CONV': {
    beats: [
      { text: 'Muunnetaan 3 km metreiksi. Koska 1 km = 1000 m, kerrotaan: 3 · 1000 m = 3000 m.', pic: 0 },
      { text: 'Muunnetaan 250 cm metreiksi. Koska 100 cm = 1 m, jaetaan sadalla: 250 : 100 = 2,5, eli tulos on 2,5 m.', more: 'Isosta yksiköstä pieneen kerrotaan, pienestä isoon jaetaan.', pic: 1 },
      { text: 'Muunnetaan 3 min sekunneiksi. Minuutissa on 60 sekuntia eikä sataa, joten 3 · 60 s = 180 s.', pic: 2 },
    ],
    try: 'auto',
  },
  'PHY79-MEAS-01': {
    beats: [
      { text: 'Välineen pitää mitata oikeaa suuretta, ja sen mittausalueen pitää riittää. Näytekortin pituus mitataan 0–15 cm:n viivaimella.', more: 'Lyhyt 0–1 cm:n viivain ei riitä kortin mittaamiseen, ja ajastin mittaa aikaa eikä pituutta.', pic: null },
      { text: 'Viivaimen nollakohta asetetaan tarkasti kortin reunaan. Jos nolla jää sivuun, koko lukema on väärin.', pic: null },
      { text: 'Aikaa mitattaessa kello käynnistetään, kun liike alkaa, ja pysäytetään, kun se päättyy. Veneen matka-aika mitataan lähdöstä perille.', pic: null },
    ],
    try: {
      say: 'Kortti on noin 8 cm pitkä. Millä välineellä sen pituus mitataan?',
      options: ['Viivain 0–15 cm', 'Viivain 0–1 cm', 'Ajastin 0–15 s'],
      answer: 0,
      explain: 'Viivain mittaa pituutta, ja sen 15 cm:n mittausalue riittää 8 cm:n kortille.',
      why: [null, '1 cm:n viivain on liian lyhyt 8 cm:n kortille.', 'Ajastin mittaa aikaa, ei pituutta.'],
    },
  },
  'PHY79-REL-01': {
    beats: [
      { text: 'Taulukossa matka kasvaa ajan mukana: 0, 4, 8 ja 13 m. Kahtena ensimmäisenä sekuntina kasvu on 4 m, viimeisenä 5 m.', pic: 0 },
      { text: 'Kun kaikki parit tarkistetaan, matka on lähes neljä kertaa aika. Matka on likimain suoraan verrannollinen aikaan: kaksinkertainen aika antaa noin kaksinkertaisen matkan.', pic: 0 },
      { text: 'Mittauksissa on aina pientä vaihtelua, joten yksi 13 m ei kumoa riippuvuutta. Riippuvuus päätellään kaikista pareista, ei yhdestä.', pic: 0 },
    ],
    try: {
      say: 'Mittaukset: 1 s → 5 m, 2 s → 5 m ja 3 s → 5 m. Mikä riippuvuus näkyy?',
      options: ['Matka pysyy samana', 'Matka kasvaa suorassa suhteessa', 'Matka kasvaa yhä nopeammin'],
      answer: 0,
      explain: 'Kaikissa pareissa matka on 5 m, vaikka aika kasvaa. Matka ei tässä riipu ajasta: kappale pysyy paikallaan.',
      why: [null, 'Matka ei kasva lainkaan: se on joka hetkellä 5 m.', 'Kasvua ei ole lainkaan, joten se ei voi nopeutua.'],
    },
  },
  'PHY79-MEAS-PRECISION': {
    beats: [
      { text: 'Mittarin resoluutio on pienin muutos, jonka se näyttää. Tämän mittarin resoluutio on 0,2 cm, ja toistot antoivat 10,0, 10,2 ja 10,0 cm.', pic: null },
      { text: 'Tässä mallissa ero erottuu, kun se on vähintään yhden resoluutioaskeleen suuruinen. Vertailtava ero 0,6 cm on kolme 0,2 cm:n askelta, joten se erottuu.', pic: null },
      { text: 'Tarkinta välinettä ei aina tarvita. Välineellä A, jonka resoluutio on 0,5 cm, 0,6 cm:n ero erottuu jo, joten 0,01 cm:n välinettä ei tarvita.', pic: null },
    ],
    try: {
      say: 'Mittarin resoluutio on 0,5 cm. Kahden kortin pituudet eroavat 0,1 cm. Erottaako mittari ne?',
      options: ['Ei, ero on alle yhden askeleen', 'Kyllä, mittari näyttää kaikki erot'],
      answer: 0,
      explain: 'Ero erottuu vasta, kun se on vähintään yhden resoluutioaskeleen suuruinen. 0,1 cm on paljon pienempi kuin 0,5 cm.',
      why: [null, 'Mittari näyttää vain 0,5 cm:n askelia, joten 0,1 cm:n ero ei näy.'],
    },
  },
  'PHY79-REPORTED-DIGITS': {
    beats: [
      { text: 'Mittari näyttää pituuden senttimetrin tarkkuudella, ja lukema on 10 cm. Tulos ilmoitetaan yhtä tarkasti kuin mittari näyttää: 10 cm.', pic: null },
      { text: 'Lisänollat, kuten 10,000 cm, väittäisivät mittauksen tarkemmaksi kuin se oli. Mittari ei näyttänyt senttimetrin osia lainkaan.', pic: null },
      { text: 'Jos resoluutio on 0,1 cm ja lukema 12,3 cm, tulos ilmoitetaan muodossa 12,3 cm. Numeroita on yhtä monta kuin mittari antaa.', pic: null },
    ],
    try: {
      say: 'Mittarin resoluutio on 0,1 cm, ja se näyttää 7,4 cm. Miten tulos ilmoitetaan?',
      options: ['7,4 cm', '7,400 cm', '7 cm'],
      answer: 0,
      explain: 'Tulos ilmoitetaan samalla tarkkuudella kuin mittari näyttää, eli yhden desimaalin tarkkuudella.',
      why: [null, 'Lisänollat väittävät tuloksen tarkemmaksi kuin mittari näytti.', 'Pyöristäminen hukkaa mittarin näyttämän desimaalin.'],
    },
  },
  'PHY79-PREC-01': {
    beats: [
      { text: 'Mittarin resoluutio on 0,1 cm. Kolme toistoa antoivat 10,0, 10,1 ja 9,9 cm.', pic: null },
      { text: 'Toistot vaihtelevat 0,2 cm:n välillä, vaikka mittari näyttää 0,1 cm:n tarkkuudella. Vaihtelu kertoo mittaamisesta itsestään, ei pelkästä mittarista.', pic: null },
      { text: 'Vertailtava ero 0,3 cm on kolme resoluutioaskelta ja suurempi kuin toistojen vaihtelu, joten mittari riittää. Tulokset ilmoitetaan yhden desimaalin tarkkuudella.', pic: null },
    ],
    try: {
      say: 'Toistot antoivat 10,0, 10,1 ja 9,9 cm. Kahden narun pituudet eroavat 0,3 cm. Voiko eron havaita?',
      options: ['Kyllä, ero on vaihtelua suurempi', 'Ei, koska toistot vaihtelevat'],
      answer: 0,
      explain: 'Toistot vaihtelevat vain 0,2 cm. Ero 0,3 cm on sitä suurempi ja kolme 0,1 cm:n resoluutioaskelta.',
      why: [null, 'Vaihtelu on vain 0,2 cm, joten 0,3 cm:n ero erottuu siitä.'],
    },
  },
};
