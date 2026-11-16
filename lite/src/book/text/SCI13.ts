import type { PageText } from '../text';

/** SCI13 Näkymättömien viestien observatorio: kinds of radiation, ionizing radiation and safe exposure. */
export const TEXT: Record<string, PageText> = {
  'PHY79-RAD-EM': {
    beats: [
      { text: 'Radio, lämpökamera, valo ja röntgenkuva käyttävät kaikki sähkömagneettista säteilyä. Se etenee energiapaketteina eli fotoneina, eikä mukana kulje ainetta.', more: 'Sähkömagneettinen säteily etenee myös tyhjiössä. Siksi auringon valo ja lämpö tulevat avaruuden halki Maahan.', pic: 0, figure: false },
      { text: 'Lajit eroavat fotonin energian mukaan. Energia kasvaa järjestyksessä radioaallot, infrapuna, näkyvä valo, UV, röntgen- ja gammasäteily.', pic: 0, figure: false },
      { text: 'Hiukkassäteily on eri asia: siinä liikkuu ainehiukkasia, kuten elektroneja tai alfahiukkasia. Säteily luokitellaan sen mukaan, mistä se koostuu.', pic: 0, figure: false },
    ],
    try: {
      say: 'Lämpökamera tallentaa kohteen lähettämää infrapunasäteilyä. Mitä säteilyä se on?',
      options: ['Sähkömagneettista säteilyä', 'Hiukkassäteilyä', 'Lämpimiä ilmahiukkasia'],
      answer: 0,
      explain: 'Infrapunasäteily on fotoneina etenevää energiaa, kuten valo. Sen fotonien energia on vain pienempi kuin näkyvän valon.',
      why: [null, 'Hiukkassäteilyssä liikkuu ainehiukkasia, kuten elektroneja. Infrapuna on fotoneja.', 'Infrapuna etenee tyhjiössäkin, joten se ei tarvitse ilmaa.'],
    },
  },
  'PHY79-RAD-PARTICLE': {
    beats: [
      { text: 'Kun atomin ydin muuttuu, siitä voi sinkoutua elektroni. Tällainen liikkuva ainehiukkanen on hiukkassäteilyä, ja ytimestä lähtevä elektroni on beetasäteilyä.', pic: 0, figure: false },
      { text: 'Alfahiukkanen on kahden protonin ja kahden neutronin ryhmä. Hiukkassäteilyä ovat myös esimerkiksi protonit, neutronit ja positronit.', more: 'Positroni on elektronin kaltainen hiukkanen, jolla on positiivinen varaus.', pic: 0, figure: false },
      { text: 'Hiukkassäteilyn hiukkasilla on massa. Sähkömagneettisen säteilyn fotoneilla massaa ei ole.', pic: 0, figure: false },
    ],
    try: {
      say: 'Ytimestä sinkoutuu kaksi protonia ja kaksi neutronia yhdessä. Mitä säteilyä se on?',
      options: ['Alfasäteilyä', 'Beetasäteilyä', 'Gammasäteilyä'],
      answer: 0,
      explain: 'Kahden protonin ja kahden neutronin ryhmä on alfahiukkanen. Se on hiukkassäteilyä, koska siinä liikkuu ainetta.',
      why: [null, 'Beetasäteilyssä ytimestä lähtee elektroni tai positroni.', 'Gammasäteily on sähkömagneettista säteilyä eli fotoneja, ei ainehiukkasia.'],
    },
  },
  'PHY79-RAD-ION-CLASS': {
    beats: [
      { text: 'Mallissa elektronin irrottaminen atomista vaatii 10 eV energiaa. UV-fotonin energia on 4 eV, joten se ei irrota elektronia: säteily on tässä ionisoimatonta.', more: 'Elektronivoltti (eV) on pieni energian yksikkö, joka sopii yksittäisen fotonin tai atomin energialle.', pic: 0, figure: false },
      { text: 'Ionisoiva säteily irrottaa atomista elektronin, jolloin syntyy ioni. Röntgenfotonin 1000 eV ylittää rajan reilusti, joten se ionisoi.', pic: 0, figure: false },
      { text: 'Ionisoimatonta ovat radioaallot, infrapuna ja näkyvä valo. Ionisoivaa ovat röntgen- ja gammasäteily sekä alfa- ja beetasäteily.', more: 'UV on raja-alueella. Tavallinen UV ei ionisoi, mutta energisin UV voi ionisoida.', pic: 0, figure: false },
    ],
    try: {
      say: 'Ionisointiin tarvitaan mallissa 10 eV, ja näkyvän valon fotonissa on 2 eV. Ionisoiko valo?',
      options: ['Ei, fotonin energia jää alle rajan', 'Kyllä, kaikki säteily ionisoi', 'Kyllä, jos valo on tarpeeksi kirkasta'],
      answer: 0,
      explain: 'Yhden fotonin on irrotettava elektroni. 2 eV jää alle 10 eV:n rajan, joten näkyvä valo on ionisoimatonta.',
      why: [null, 'Radioaallot, infrapuna ja näkyvä valo eivät irrota elektroneja.', 'Kirkkaampi valo tuo lisää fotoneja, mutta jokaisessa on silti vain 2 eV.'],
    },
  },
  'PHY79-RAD-ION-SAFETY': {
    beats: [
      { text: 'Ionisoiva säteily voi rikkoa molekyylejä, myös solun perimää. Siksi altistus sille pidetään mahdollisimman pienenä.', pic: 0, figure: false },
      { text: 'A: 8 · 3 · 1 = 24, B: 8 · 5 · 0,5 = 20 ja C: 8 · 4 · 1 = 32. Suojattu reitti B kestää pisimpään, mutta altistus on silti pienin.', example: 'Mallissa altistus = nopeus · aika · läpäisyosuus. Mikä kolmesta reitistä on turvallisin?', pic: 0, figure: false },
      { text: 'Suoja, joka päästää läpi vain puolet, puolittaa altistuksen. Siksi pidempikin aika voi olla turvallisempi, kun suoja on välissä.', pic: 0, figure: false },
    ],
    try: {
      say: 'Reitin A altistus on 6 · 4 · 1 ja suojatun reitin B 6 · 6 · 0,25. Kummassa altistus on pienempi?',
      options: ['B, suoja päästää läpi vain neljäsosan', 'A, koska aika on lyhyempi', 'Yhtä suuri, koska nopeus on sama'],
      answer: 0,
      explain: 'A: 6 · 4 · 1 = 24. B: 6 · 6 · 0,25 = 9. Suoja pienentää altistuksen enemmän kuin pidempi aika kasvattaa sitä.',
      why: [null, 'Aika on vain yksi kerroin. Suojan kerroin 0,25 pienentää tulon paljon.', 'Nopeus on sama, mutta aika ja läpäisyosuus eroavat.'],
    },
  },
  'PHY79-RAD-ION': {
    beats: [
      { text: 'Ionisoivuus kertoo, voiko säteily rikkoa atomeja ja molekyylejä. Riskiin vaikuttaa lisäksi altistus: kuinka voimakasta säteily on ja kuinka kauan siinä ollaan.', pic: 0, figure: false },
      { text: 'Hammaslääkärin röntgenkuvassa säteily on ionisoivaa, mutta annos on hyvin pieni ja kuvaus kestää hetken. Siksi kuvaa otetaan vain tarpeeseen, ja silloin hyöty on riskiä suurempi.', pic: 0, figure: false },
      { text: 'Ionisoimatonkin säteily voi vahingoittaa, jos sitä on paljon: liika UV polttaa ihon. Turvallisuus arvioidaan aina säteilylajin ja altistuksen perusteella.', pic: 0, figure: false },
    ],
    try: {
      say: 'Säteily on ionisoivaa. Mitä muuta tarvitaan riskin arvioimiseen?',
      options: ['Altistuksen määrä ja kesto', 'Säteilyn väri', 'Ei mitään, ionisoiva on aina hengenvaarallista'],
      answer: 0,
      explain: 'Sama säteilylaji voi olla vähäinen riski pienenä ja lyhyenä annoksena mutta vaarallinen suurena. Siksi tarvitaan altistuksen määrä ja kesto.',
      why: [null, 'Ionisoivaa säteilyä ei näe, eikä sillä ole väriä.', 'Pieni annos, kuten hammasröntgen, on vähäinen riski.'],
    },
  },
  'PHY79-RAD-SAFE': {
    beats: [
      { text: 'A: 5 · 5 · 1 = 25, B: 5 · 7 · 0,25 = 8,75 ja C: 5 · 6 · 1 = 30. Suojattu reitti B on pisin, mutta altistus jää pienimmäksi.', example: 'Kolme reittiä: mallin altistus = altistusnopeus · aika · läpäisyosuus.', more: 'Mallin altistusnopeus on 5 yksikköä aikayksikössä. Ajat ovat 5, 7 ja 6, ja suoja päästää läpi osuuden 0,25. Luvut ovat vertailumallin yksiköitä, eivät oikean säteilylähteen turvarajoja.', pic: 0, figure: false },
      { text: 'Altistusta pienennetään kolmella keinolla: lyhyempi aika, suurempi etäisyys ja suojaava materiaali välissä. Gammasäteilyä vaimentaa esimerkiksi paksu lyijy tai betoni.', pic: 0, figure: false },
      { text: 'Jos lähteestä ei tiedetä mitään, turvallista etäisyyttä ei voi arvata. Silloin pysytään erossa ja pyydetään asiantuntijan arvio.', pic: 0, figure: false },
    ],
    try: {
      say: 'Retkellä löytyy metallirasia, jossa on säteilyn varoitusmerkki. Mitä teet?',
      options: ['Pysyn erossa ja kerron aikuiselle', 'Avaan sen ja katson, hehkuuko se', 'Vien sen kotiin tutkittavaksi'],
      answer: 0,
      explain: 'Säteilyä ei näe eikä tunne, joten merkki on syy pysyä erossa. Aikuinen ilmoittaa löydöstä viranomaisille.',
      why: [null, 'Säteily ei yleensä näy. Rasian avaaminen voi lisätä altistusta.', 'Kantaminen pitää lähteen lähellä pitkään, mikä kasvattaa altistusta.'],
    },
  },
};
