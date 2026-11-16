import type { PageText } from '../text';

/** LM18 Mittaajien retkisatama: comparing, measuring and checking length, mass and volume. */
export const TEXT: Record<string, PageText> = {
  'M-MEAS-00': {
    beats: [
      { text: 'Punainen nauha ulottuu pidemmälle, mutta se alkaa myöhemmin. Kun alkupäät siirretään samaan kohtaan, näkyy, että sininen on pidempi.', pic: 0 },
      { text: 'Nämä nauhat näyttävät erilaisilta. Kun alkupäät ovat samassa kohdassa, loppupäätkin ovat kohdakkain: nauhat ovat yhtä pitkät.', pic: 1 },
      { text: 'Painoa verrataan vaa’alla. Ilmapallo on isompi, mutta kivi painaa vaa’an alas: kivi on painavampi.', pic: 2 },
    ],
    try: 'auto',
    title: 'Pidempi vai painavampi',
    trySay: 'Kumpi on painavampi, vai ovatko ne yhtä painavat? Katso vaakaa.',
  },
  'M-MEAS-02': {
    beats: [
      { text: 'Nauha taipuu mutkalle ja oikenee taas. Päät osuvat samoihin kohtiin: pituus ei muuttunut.', pic: 0 },
      { text: 'Kahdella polulla on samat päät, mutta toinen mutkittelee. Kun mutkapolku oikaistaan suoran viereen, se on pidempi.', pic: 1 },
      { text: 'Leveä ei ole sama kuin pitkä. Leveä punainen nauha on lyhyempi kuin ohut sininen.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-MEAS-05': {
    beats: [
      { text: 'Kivi on vasemmalla ja lehti oikealla. Kiven puoli painuu alas, joten kivi on painavampi.', pic: 0 },
      { text: 'Kolme isoa lehteä ja pieni kivi. Kivi painaa silti vaa’an alas: iso ei aina ole painava.', pic: 1 },
      { text: 'Kun molemmat puolet ovat yhtä painavia, vaaka jää suoraan.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-MEAS-08': {
    beats: [
      { text: 'Täysi muki kaadetaan tyhjään kannuun. Kannu ei tule täyteen, joten kannuun mahtuu enemmän kuin mukiin.', pic: 0 },
      { text: 'Toisin päin: täysi kannu kaadetaan tyhjään mukiin. Muki täyttyy heti ja loput valuvat yli.', pic: 1 },
      { text: 'Kulhon vesi kaadetaan kapeaan lasiin. Vesi nousee korkealle, mutta vettä on yhtä paljon kuin ennen.', more: 'Veden määrä ei muutu, kun kaikki vesi kaadetaan toiseen astiaan eikä mitään valu yli.', pic: 2 },
    ],
    try: {
      say: 'Kulhon vesi kaadettiin kapeaan lasiin, ja pinta nousi korkealle. Onko vettä nyt enemmän?',
      options: ['Yhtä paljon kuin ennen', 'Enemmän', 'Vähemmän'],
      answer: 0,
      explain: 'Vettä ei lisätty eikä otettu pois. Kapeassa lasissa sama vesi vain nousee korkeammalle.',
      why: [null, 'Pinta on korkealla, koska lasi on kapea. Vettä ei tullut lisää.', 'Vettä ei valunut pois, joten sitä ei ole vähemmän.'],
    },
  },
  'M-MEAS-01': {
    beats: [
      { text: 'Palat laitetaan nauhan alle peräkkäin alkupäästä alkaen, ilman rakoja. Yksi, kaksi, kolme, neljä, viisi: nauha on viisi palaa pitkä.', pic: 0 },
      { text: 'Tässä jäi rako. Paloja on neljä, mutta rakoon mahtuisi vielä yksi, joten nauha on pidempi kuin neljä palaa.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-MEAS-03': {
    beats: [
      { text: 'Viivoittimessa jokainen väli on yksi senttimetri. Keppi alkaa nollasta ja loppuu kohtaan 6: se on kuusi senttimetriä pitkä.', pic: 0 },
      { text: 'Tämä keppi alkaa kohdasta 2. Lasketaan välit kohdasta 2 kohtaan 7: viisi senttimetriä.', more: 'Loppukohta 7 ei ole kepin pituus, koska keppi ei ala nollasta.', pic: 1 },
      { text: 'Kymmenen senttiä, kaksikymmentä… sata senttiä. Sata senttimetriä on yksi metri.', more: 'Metri on suunnilleen aikuisen askeleen pituinen.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-MEAS-06': {
    beats: [
      { text: 'Yksi marja vaa’alle: osoitin tuskin liikkuu. Marja painaa noin yhden gramman, ja gramma on tosi kevyt.', pic: 0 },
      { text: 'Kymmenen sadan gramman pussia vaa’alle yksi kerrallaan: sata, kaksisataa… tuhat grammaa. Tuhat grammaa on yksi kilogramma.', pic: 1 },
      { text: 'Litran maitopurkki painaa noin kilon. Osoitin pysähtyy kohtaan 1 kg.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-MEAS-09': {
    beats: [
      { text: 'Pieni mitta on yksi desilitra. Kymmenen täyttä desilitraa nostaa kannun veden litran viivaan asti.', pic: 0 },
      { text: 'Kahdeksan desilitraa jää litran viivan alle. 8 dl on vähemmän kuin 1 l, vaikka 8 on isompi luku kuin 1.', pic: 1 },
      { text: 'Yksi litra on kymmenen desilitraa: 1 l = 10 dl.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-MEAS-04': {
    beats: [
      { text: 'Pituus mitataan toistamalla samaa yksikköä alusta loppuun. Jokainen pala on yksi senttimetri, ja viisi palaa on viisi senttimetriä.', pic: 0 },
      { text: 'Viivoittimessa yksiköt ovat valmiina. Keppi alkaa kohdasta 2 ja loppuu kohtaan 8: välejä on kuusi, joten keppi on 6 cm.', pic: 1 },
      { text: 'Sama nauha on 6 pientä palaa tai 2 isoa palaa. Luku muuttuu yksikön mukana, siksi tulokseen kirjoitetaan aina yksikkö.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-MEAS-07': {
    beats: [
      { text: 'Tyhjä vaaka voi näyttää jotain muuta kuin nollaa, esimerkiksi 30 g. Silloin vaaka nollataan: painetaan nappia, kunnes se näyttää 0 g.', pic: 0, figure: false },
      { text: 'Vasta sitten kivi laitetaan vaa’alle. Vaaka näyttää 200 g, joten kivi painaa 200 grammaa.', pic: 1 },
    ],
    try: {
      say: 'Tyhjä vaaka näyttää 50 g. Aava haluaa punnita omenan. Mitä hän tekee ensin?',
      options: ['Nollaa tyhjän vaa’an', 'Laittaa omenan heti vaa’alle', 'Lisää omenan painoon 50 g'],
      answer: 0,
      explain: 'Kun tyhjä vaaka näyttää 0 g, lukema kertoo vain omenan painon.',
      why: [null, 'Silloin lukemassa olisi mukana ylimääräiset 50 g.', 'Ylimääräiset 50 g ovat jo lukemassa. Niitä ei pidä lisätä toista kertaa.'],
    },
  },
  'M-MEAS-10': {
    beats: [
      { text: 'Kannussa on vettä, ja pinta kaartuu reunoilla vähän ylöspäin. Siksi määrä luetaan pinnan alimmasta kohdasta.', pic: 0, figure: false },
      { text: 'Silmä on pinnan korkeudella. Pinnan alin kohta on viivalla 3: kannussa on 3 dl vettä.', more: 'Jos katsot ylhäältä tai alhaalta, pinta näyttää osuvan väärään viivaan.', pic: 1 },
    ],
    try: {
      say: 'Mistä katsot, kun luet kannun asteikkoa?',
      options: ['Pinnan korkeudelta', 'Ylhäältä kannun yläpuolelta', 'Alhaalta pöydän tasolta'],
      answer: 0,
      explain: 'Kun silmä on pinnan korkeudella, näet tarkasti, mihin viivaan pinta osuu.',
      why: [null, 'Ylhäältä katsoen pinta näyttää osuvan eri viivaan kuin oikeasti.', 'Alhaalta katsoen pinta näyttää osuvan eri viivaan kuin oikeasti.'],
    },
  },
  'M-MEAS-11': {
    beats: [
      { text: 'Ennen mittaamista tehdään arvio. Vertailukohde auttaa: karttalaatta on 12 cm, joten mieti, montako laattaa mahtuisi nauhan pituudelle.', pic: 1 },
      { example: 'Arvio oli 23 cm. Mittanauha näyttää 29 cm.', text: 'Arvio on 6 cm mittaa pienempi. Arvio kertoi suuruusluokan, ja mittaus antoi tarkan luvun.', more: 'Nauhaan mahtuu vähän yli kaksi 12 cm:n laattaa, sillä kaksi laattaa on 24 cm.', pic: 1 },
    ],
    try: {
      say: 'Nauhaan mahtuu noin kolme 12 cm:n laattaa: mikä arvio sopii?',
      options: ['Noin 36 cm', 'Noin 15 cm', 'Noin 3 cm', 'Noin 120 cm'],
      answer: 0,
      explain: 'Kolme laattaa on 3 × 12 cm = 36 cm.',
      why: [null, 'Se on vain vähän yli yhden laatan.', '3 on laattojen määrä, ei senttimetrit.', 'Se olisi kymmenen laattaa.'],
    },
  },
  'M-MEAS-12': {
    beats: [
      { text: 'Listapala voi olla jopa 280 mm pitkä, ja se mitataan millin tarkkuudella. Pituutta mittaavat viivain ja mittanauha, eivät vaaka tai mitta-astia.', pic: 1 },
      { text: 'Asteikkoväli on kahden viivan väli. Viivaimessa se on 1 mm ja viivain ulottuu 300 mm:iin, joten viivain sopii.', more: 'Mittanauhan asteikkoväli on 10 mm. Se ei erota yksittäisiä millejä, vaikka nauha onkin pitkä.', pic: 1 },
    ],
    try: {
      say: 'Mikä taulukon välineistä sopii 250 g jauhojen punnitsemiseen gramman tarkkuudella?',
      options: ['Pöytävaaka, 1 g', 'Lattiavaaka, 50 g', 'Mitta-astia, 100 ml', 'Viivain, 1 mm'],
      answer: 0,
      explain: 'Massa mitataan vaa’alla, ja pöytävaa’an asteikkoväli 1 g erottaa yksittäiset grammat.',
      why: [null, 'Vaaka on oikea, mutta 50 g:n asteikkoväli on liian karkea.', 'Mitta-astia mittaa tilavuutta, ei massaa.', 'Viivain mittaa pituutta, ei massaa.'],
    },
  },
  'M-MEAS-13': {
    beats: [
      { text: 'Lipputikku on 0,24 m pitkä, mutta lappuun mahtuu vain kokonaisluku 1–99 ja yksikkö. Pituus kirjoitetaan toisella yksiköllä.', pic: 1 },
      { text: 'Metrissä on 100 senttimetriä, joten 0,24 m = 24 cm. Luku muuttuu, mutta tikun pituus pysyy samana.', pic: 1 },
    ],
    try: {
      say: 'Mikä merkintä tarkoittaa samaa pituutta kuin 0,5 m?',
      options: ['50 cm', '5 cm', '500 cm'],
      answer: 0,
      explain: 'Metrissä on 100 cm, joten puoli metriä on 50 cm.',
      why: [null, '5 cm on vain sormen levyinen pätkä, paljon alle puoli metriä.', '500 cm on viisi metriä.'],
    },
  },
  'M-MEAS-14': {
    beats: [
      { text: 'Tämän asteikon viivojen väli on 1 cm. Osoitin on tasan viivalla 3, joten lukema on 3 cm.', pic: 1 },
      { text: 'Jos osoitin on kahden viivan välissä, kirjataan lähin viiva. Tasan puolivälistä valitaan ylempi viiva.', more: 'Esimerkiksi kohdasta 3,3 cm kirjataan 3 cm ja kohdasta 3,5 cm kirjataan 4 cm. Tällä asteikolla tarkkuus on siis 1 cm.', pic: 1 },
    ],
    try: {
      say: 'Osoitin on viivojen 4 ja 5 välissä, lähempänä viivaa 4. Mikä lukema kirjataan?',
      options: ['4 cm', '5 cm', '4,5 cm'],
      answer: 0,
      explain: 'Välissä olevasta kohdasta kirjataan lähin viiva. Lähin on 4, joten lukema on 4 cm.',
      why: [null, 'Viiva 5 on kauempana osoittimesta.', 'Tällä asteikolla kirjataan lähin viiva, ei puolikkaita.'],
    },
  },
  'M-MEAS-15': {
    beats: [
      { text: 'Karttalaukun kokoinen kohde painaa 200–450 g. Loikan lapussa lukee 0,325 kg: onko se uskottava?', pic: 1 },
      { text: 'Muutetaan grammoiksi: 1 kg = 1000 g, joten 0,325 kg = 325 g. Se on välillä 200–450 g, joten lukema on uskottava.', more: 'Mikä tahansa luku väliltä 200–450 g olisi uskottava, esimerkiksi 200 g. Tarkka massa selviää vasta punnitsemalla.', pic: 1 },
    ],
    try: {
      say: 'Karttalaukun lapussa lukee 3,25 kg, kun uskottava väli on 200–450 g. Onko lukema uskottava?',
      options: ['Ei, koska se on 3250 g', 'Kyllä, koska 3,25 on pieni luku', 'Kyllä, koska siinä on yksikkö'],
      answer: 0,
      explain: '3,25 kg = 3250 g. Se on paljon yli 450 g, joten lapussa on virhe.',
      why: [null, 'Luku on pieni, mutta kilogramma on iso yksikkö: 3,25 kg on 3250 g.', 'Yksikkö on tärkeä, mutta määrän pitää myös osua väliin.'],
    },
  },
  'M-MEAS-16': {
    beats: [
      { text: 'Loikka kirjasi nauhan pituudeksi 18 cm. Mittanauha alkaa kuitenkin kohdasta 6, ja nauha loppuu kohtaan 18.', pic: 1 },
      { text: 'Pituus on loppulukema miinus alkulukema: 18 − 6 = 12 cm. Neljä 3 cm:n mittapalaa antaa saman: 4 × 3 cm = 12 cm.', pic: 1 },
      { text: 'Kun kaksi eri tapaa antaa saman tuloksen, mittaukseen voi luottaa. Loikan 18 cm syntyi, kun alkulukemaa ei vähennetty.', pic: 1 },
    ],
    try: {
      say: 'Mittanauha alkaa kohdasta 10 ja nauha loppuu kohtaan 25. Kuinka pitkä nauha on?',
      options: ['15 cm', '25 cm', '35 cm'],
      answer: 0,
      explain: 'Alkulukema vähennetään loppulukemasta: 25 − 10 = 15 cm.',
      why: [null, '25 on vain loppulukema. Alkulukema 10 pitää vähentää.', 'Lukemat laskettiin yhteen, vaikka ne pitää vähentää.'],
    },
  },
};
