import type { PageText } from '../text';

/** SCI22 Uudelleen rakentuvan rannan telakka: natural resources, product life cycle, matter and energy flows, comparing sustainability. */
export const TEXT: Record<string, PageText> = {
  'CHEM79-RESOURCE': {
    beats: [
      { text: 'Lyhdyn alumiinirunko alkaa kaivoksesta. Bauksiittimalmista erotetaan alumiinioksidia, ja siitä valmistetaan elektrolyysillä alumiinia, joka valssataan levyksi.', pic: null },
      { text: 'Ketjun vaiheilla on nimet: bauksiitti on luonnonvara, alumiinioksidi välituote, alumiinilevy materiaali ja runko käyttöesine. Jokainen vaihe jalostaa edellistä.', more: 'Malmit ja öljy ovat uusiutumattomia luonnonvaroja: ne eivät synny uudelleen ihmisen aikaskaalassa. Puu on uusiutuva, kun metsää kasvaa yhtä paljon kuin sitä hakataan.', pic: null },
      { text: 'Ketjua voi seurata myös esineestä taaksepäin. Muovilaatikon polyeteeni on tehty raakaöljystä: öljyn jakeesta krakataan eteeniä, joka polymeroidaan muoviksi.', pic: null },
    ],
    try: {
      say: 'Teräskiinnikkeen ketju on rautamalmi → rauta → teräslevy → kiinnike. Mikä niistä on välituote?',
      options: ['Rauta', 'Rautamalmi', 'Teräslevy', 'Kiinnike'],
      answer: 0,
      explain: 'Rautamalmi on luonnonvara. Siitä pelkistetty rauta on välituote, josta jalostetaan materiaali eli teräslevy.',
      why: [null, 'Malmi hankitaan suoraan luonnosta, joten se on luonnonvara.', 'Teräslevy on materiaali, josta esine tehdään.', 'Kiinnike on valmis käyttöesine.'],
    },
  },
  'CHEM79-SUSTAIN-COMPARE': {
    beats: [
      { text: 'Vertailu tehdään samalle palvelulle, ei yhdelle esineelle. Koko jaksolla kevyt malli kuluttaa 280 g materiaalia ja 492 kJ energiaa, huollettava 264 g ja 622 kJ.', example: 'Retkiryhmä tarvitsee valoa samoille retki-illoille. Kevyttä lyhtyä tarvitaan 4 kpl, huollettavaa 2 kpl ja yksi huolto.', pic: null },
      { text: 'Huollettava malli säästää materiaalia, mutta kuluttaa enemmän energiaa. Kun kumpikaan ei ole paras kaikessa, valinta perustellaan tavoitteella.', pic: null },
      { text: 'Vertailulla on rajat: mukana ovat vain annetut vaiheet, ja todellinen käyttöikä voi poiketa arviosta. Yksi luku ei kerro koko kestävyyttä.', pic: null },
    ],
    try: {
      say: 'Kevyt lyhty kestää 3 retkeä, ja siihen kuluu 70 g materiaalia. Paljonko materiaalia kuluu 12 retkeen?',
      options: ['280 g', '70 g', '840 g'],
      answer: 0,
      explain: '12 retkeen tarvitaan 12 : 3 = 4 lyhtyä. Materiaalia kuluu 4 · 70 g = 280 g.',
      why: [null, '70 g on yhden lyhdyn materiaali, mutta yksi lyhty kestää vain 3 retkeä.', '12 · 70 g tarkoittaisi uutta lyhtyä joka retkelle. Yksi lyhty kestää 3 retkeä.'],
    },
  },
  'CHEM79-LIFECYCLE-STAGES': {
    beats: [
      { text: 'Lyhdyn elinkaari alkaa raaka-aineen hankinnasta. Sitten lyhty valmistetaan, kuljetetaan käyttäjälle ja otetaan käyttöön.', pic: null },
      { text: 'Kun lyhdyn sarana hajoaa, varaosan vaihto palauttaa saman lyhdyn käyttöön. Korjaus vie vähän uutta materiaalia, mutta voi korvata kokonaan uuden lyhdyn.', pic: null },
      { text: 'Käytön jälkeen ehjä lyhty voi siirtyä uudelle käyttäjälle eli uudelleenkäyttöön. Rikkinäisen lyhdyn materiaali voidaan kierrättää uuden tuotteen raaka-aineeksi.', more: 'Kierrätyksessä aina osa materiaalista jää hyödyntämättä. Tämä jäännös menee loppukäsittelyyn.', pic: null },
    ],
    try: {
      say: 'Ehjä retkijakkara annetaan toiselle retkeilijälle. Mikä elinkaaren vaihe on kyseessä?',
      options: ['Uudelleenkäyttö', 'Kierrätys', 'Korjaus'],
      answer: 0,
      explain: 'Sama kokonainen esine jatkaa käyttöä uudella käyttäjällä, eikä sitä hajoteta materiaaliksi. Se on uudelleenkäyttöä.',
      why: [null, 'Kierrätyksessä esine hajotetaan materiaaliksi, josta tehdään uutta.', 'Jakkara on ehjä, joten siinä ei ole mitään korjattavaa.'],
    },
  },
  'CHEM79-LIFECYCLE-FLOWS': {
    beats: [
      { text: 'Varaosiin päätyy 500 g, leikkuujätteeksi 80 g ja pölyksi 20 g. Yhteensä 500 + 80 + 20 = 600 g, joten massa täsmää.', example: 'Varaosien valmistukseen tulee 600 g alumiinia. Mihin kaikki alumiini menee?', pic: null },
      { text: 'Leikkuujätteestä saadaan talteen 3/4 eli 60 g, ja se palaa seuraavan erän raaka-aineeksi. Silloin uutta alumiinia tarvitaan enää 600 − 60 = 540 g.', pic: null },
      { text: 'Talteenotto ei ole täydellistä: osa häviää, ja sekoittunut aines voi heikentää laatua. Siksi uutta materiaalia tarvitaan aina jonkin verran.', pic: null },
    ],
    try: {
      say: 'Valmistukseen tulee 400 g alumiinia. Tuotteisiin menee 340 g ja pölyksi 10 g. Paljonko on leikkuujätettä?',
      options: ['50 g', '60 g', '350 g'],
      answer: 0,
      explain: 'Massa säilyy, joten kaikki 400 g menee jonnekin. Leikkuujätettä on 400 − 340 − 10 = 50 g.',
      why: [null, '400 − 340 = 60 g sisältää vielä pölyn 10 g.', '340 + 10 = 350 g on tuotteet ja pöly yhteensä, ei jäte.'],
    },
  },
  'CHEM79-LIFECYCLE': {
    beats: [
      { text: 'Lainalyhdyn sarana hajoaa. Korjauksessa vaihdetaan 20 g:n varaosa, ja sama lyhty palaa käyttöön.', pic: null },
      { text: 'Ilman korjausta tarvittaisiin kokonaan uusi lyhty raaka-aineen hankinnasta alkaen. Pieni varaosan ainevirta voi siis korvata paljon suuremman.', pic: null },
      { text: 'Korjauskaan ei ole vaikutukseton, sillä varaosa on valmistettava ja siitäkin syntyy jätettä. Elinkaarikartta näyttää sekä vaiheet että niiden ainevirrat.', pic: null },
    ],
    try: {
      say: 'Lyhdyn rikkinäinen osa vaihdetaan uuteen. Mihin elinkaaren vaiheeseen lyhty sen jälkeen palaa?',
      options: ['Käyttöön', 'Kierrätykseen', 'Raaka-aineen hankintaan'],
      answer: 0,
      explain: 'Korjattu sama lyhty palaa takaisin käyttöön. Se ei hajoa materiaaliksi, eikä sen elinkaari ala alusta.',
      why: [null, 'Kierrätyksessä esine hajotetaan materiaaliksi. Korjattu lyhty pysyy kokonaisena.', 'Korjauksessa vaihdetaan vain rikkinäinen osa, eikä koko lyhtyä tehdä alusta.'],
    },
  },
  'CHEM79-SUSTAIN-MATTER-FLOW': {
    beats: [
      { text: 'Puhdas leikkuujäte kerätään erikseen ja sulatetaan seuraavan erän raaka-aineeksi. Jos talteen saadaan 3/4, uutta alumiinia säästyy 60 g.', example: 'Varaosien leikkuusta jää joka erässä 80 g puhdasta alumiinijätettä. Miten hävikkiä voisi pienentää?', pic: null },
      { text: 'Pinnoitettua tai seostettua alumiinia on vaikeampi palauttaa samaan laatuun. Siksi materiaalit lajitellaan jo siellä, missä jäte syntyy.', pic: null },
      { text: 'Vielä parempi on, ettei jätettä synny: tarkempi leikkaus vähentää hävikkiä jo ennen kierrätystä. Kierrätys ei koskaan ole täysin häviötöntä.', pic: null },
    ],
    try: {
      say: 'Talteen kerätään 40 g leikkuujätettä, ja saanto on 3/4. Paljonko materiaalia palaa käyttöön?',
      options: ['30 g', '40 g', '10 g'],
      answer: 0,
      explain: 'Saanto 3/4 tarkoittaa, että kolme neljäsosaa saadaan käyttöön: 40 g : 4 · 3 = 30 g. Loput 10 g häviää.',
      why: [null, 'Kaikkea ei saada talteen. Neljäsosa kerätystä häviää.', '10 g on hävikki. Käyttöön palaa loput 30 g.'],
    },
  },
  'CHEM79-SUSTAIN-ENERGY-FLOW': {
    beats: [
      { text: 'Kappaleiden muotoiluun menee hyödyllisesti 200 kJ, ja 400 kJ siirtyy lämpönä ympäristöön, esimerkiksi katon läpi. Energia ei katoa: 200 + 400 = 600 kJ.', example: 'Telakan uuniin ostetaan 600 kJ energiaa sähkönä ja polttoaineena. Mihin energia menee?', pic: null },
      { text: 'Kun uunin katto eristetään, lämpöä karkaa 100 kJ vähemmän. Saman tuotannon ostoenergia pienenee 600 kJ:sta 500 kJ:een.', pic: null },
      { text: 'Talteen otettu lämpö kelpaa vain matalampaa lämpötilaa vaativaan tarpeeseen, kuten pesuveden lämmitykseen. Sitä ei voi kokonaan palauttaa uunin työksi.', pic: null },
    ],
    try: {
      say: 'Uuniin ostetaan 900 kJ, ja muotoiluun kuluu hyödyllisesti 300 kJ. Paljonko energiaa siirtyy ympäristöön?',
      options: ['600 kJ', '300 kJ', '0 kJ, loput kuluvat loppuun'],
      answer: 0,
      explain: 'Energia säilyy. Hyödyllisen osan jälkeen 900 − 300 = 600 kJ siirtyy lämpönä ympäristöön.',
      why: [null, '300 kJ on hyödyllinen osa. Loput siirtyvät ympäristöön.', 'Energia ei kulu loppuun eikä katoa, vaan siirtyy lämpönä ympäristöön.'],
    },
  },
  'CHEM79-SUSTAIN': {
    beats: [
      { text: 'Kestävyyttä verrataan saman palvelun mukaan, esimerkiksi valaistus 12 retki-illalle. Laskuun otetaan kaikki tarvittavat esineet, korjaukset, materiaali ja energia.', pic: null },
      { text: 'Jos yksi malli kuluttaa vähemmän materiaalia mutta enemmän energiaa, kumpikaan ei ole paras kaikessa. Valinta perustellaan tavoitteella, esimerkiksi niukan materiaalin säästämisellä.', pic: null },
      { text: 'Perusteluun kuuluu myös epävarmuus. Jos lyhty kestääkin arvioitua lyhyemmän ajan, esineitä tarvitaan enemmän ja tulos voi kääntyä.', pic: null },
    ],
    try: {
      say: 'Samaan palveluun malli A kuluttaa 300 g ja 450 kJ, malli B 240 g ja 600 kJ. Mikä väite pitää paikkansa?',
      options: ['B säästää materiaalia, A energiaa', 'B on parempi kaikessa', 'A on parempi kaikessa'],
      answer: 0,
      explain: 'B kuluttaa 60 g vähemmän materiaalia mutta 150 kJ enemmän energiaa. Valinta riippuu siitä, kumpaa halutaan ensisijaisesti säästää.',
      why: [null, 'B kuluttaa energiaa 600 kJ, enemmän kuin A:n 450 kJ.', 'A kuluttaa materiaalia 300 g, enemmän kuin B:n 240 g.'],
    },
  },
};
