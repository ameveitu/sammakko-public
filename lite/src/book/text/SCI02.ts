import type { PageText } from '../text';

/** SCI02 Sulan tutkimusasema: a question, planning a test, a conclusion and fixing a model. */
export const TEXT: Record<string, PageText> = {
  'SCI-ENV-TOOL-01': {
    beats: [
      {
        text: 'Jokaisella välineellä on oma tehtävä. Viivotin kertoo, kuinka pitkä, vaaka kuinka painava, lämpömittari kuinka lämmin ja sekuntikello kuinka kauan.',
        pic: 0,
      },
      { text: 'Viivottimen reunassa on tyhjä kohta ennen nollaa. Laita kepin pää nollan kohdalle, niin toinen pää näyttää oikein: 7 cm.', pic: 1 },
      { text: 'Tyhjä vaaka näyttää jo 50 g, joten kivi näyttää 350 g. Kun vaaka nollataan ensin, kivi näyttää oikean painonsa: 300 g.', pic: 2 },
    ],
    try: 'auto',
  },
  'SCI-ENV-EXP-01': {
    beats: [
      {
        example: 'Kumpi lehtivene siirtyi enemmän sivulle?',
        text: 'Katso palkkeja: vene A siirtyi 4 cm, vene B ei siirtynyt ollenkaan. A siirtyi enemmän.',
        pic: 0,
      },
      {
        text: 'Kummassakin kokeessa oli yhtä iso purje ja yhtä painava vene. Vain puhallin oli eri: kokeessa A se puhalsi, kokeessa B ei.',
        more: 'Kun vain yksi asia on eri, ero johtuu siitä. Tässä puhallin siirsi venettä.',
        pic: 0,
      },
    ],
    try: {
      say: 'Mikä sai veneen A liikkumaan, kun vene B pysyi paikallaan?',
      options: ['Puhallin puhalsi', 'Purje oli isompi', 'Vene oli kevyempi'],
      answer: 0,
      explain: 'Kokeissa vain puhallin oli eri. Purje ja vene olivat samanlaiset, joten puhallin teki eron.',
      why: [null, 'Purje oli molemmissa kokeissa yhtä iso.', 'Vene oli molemmissa kokeissa yhtä painava.'],
    },
  },
  'SCI-ENV-QUESTION-01': {
    beats: [
      {
        text: 'Tällä pöydällä voi muuttaa puhaltimen voimaa ja purjeen kokoa. Voi myös mitata, kuinka paljon vene siirtyy.',
        pic: 0,
      },
      {
        text: 'Kokeella voi vastata kysymykseen: siirtyykö vene enemmän, kun puhallin puhaltaa kovempaa? Kysymykseen ”Onko vene kaunis?” ei voi vastata mittaamalla.',
        pic: 0,
      },
    ],
    try: {
      say: 'Mihin kysymykseen voit vastata kokeella tällä pöydällä?',
      options: ['Siirtyykö vene enemmän isolla purjeella?', 'Onko vene kaunis?', 'Kuka keksi purjeen?'],
      answer: 0,
      explain: 'Purjeen kokoa voi muuttaa ja veneen siirtymän voi mitata. Siksi kokeella saa vastauksen.',
      why: [null, 'Kauneus on mielipide. Sitä ei voi mitata.', 'Siihen ei saa vastausta tällä pöydällä tehtävällä kokeella.'],
    },
  },
  'SCI-ENV-EVAL-01': {
    beats: [
      {
        example: 'Simpukoiden pituudet mitattiin. Mitä tehdään oudolle tulokselle?',
        text: 'Kolme simpukkaa on noin 27 mm pitkiä. Tulos R2 on 260 mm, melkein kymmenen kertaa enemmän.',
        pic: 0,
      },
      {
        text: 'Poikkeava tulos tarkistetaan ensin, esimerkiksi mittaamalla uudelleen. Vasta sitten tiedetään, onko se virhe vai oikea poikkeus.',
        more: 'Ehkä luku kirjoitettiin väärin, ehkä simpukka todella on iso. Tulosta ei poisteta eikä pidetä ennen tarkistusta.',
        pic: 0,
      },
    ],
    try: 'auto',
  },
  'SCI-ENV-CAUSE-01': {
    beats: [
      {
        example: 'Vesipyörä A pyörii, mutta B seisoo. Mikä aiheutti eron?',
        text: 'Verrataan kokeita rivi kerrallaan. Veden virtaus ja jarru ovat samat, vain veräjä on eri: A:ssa auki, B:ssä kiinni.',
        pic: 0,
      },
      {
        text: 'Kun kaikki muu pysyy samana, eron syy on se yksi muutos. Kiinni oleva veräjä pysäytti pyörän.',
        more: 'Jos kokeissa muuttuisi kaksi asiaa yhtä aikaa, ei voisi tietää, kumpi aiheutti eron.',
        pic: 0,
      },
    ],
    try: 'auto',
  },
  'SCI-ENV-MEAS-01': {
    beats: [
      {
        text: 'Saman pituuden voi kertoa monella yksiköllä: muurahainen on 5 mm eli 0,005 m. Valitse yksikkö, jolla luku on kätevä.',
        more: 'Loikan hyppy on kätevin metreinä: 1,2 m eikä 1200 mm. Matka saarelle on kätevin kilometreinä: 3 km eikä 3000 m.',
        pic: 0,
      },
      {
        text: 'Kivi mitattiin kolmesti: 12 cm, 19 cm ja 12 cm. Tulos 19 cm poikkeaa paljon, joten se on luultavasti virhe.',
        more: 'Mitataan uudelleen: taas 12 cm. Poikkeava lukema jätetään pois.',
        pic: 1,
      },
      {
        text: 'Lämpömittarissa numerot ovat vain joka viidennellä viivalla. Punainen pää on 3 pientä väliä luvun 10 yläpuolella: 13 astetta.',
        pic: 2,
      },
    ],
    try: 'auto',
  },
  'SCI-ENV-MODEL-01': {
    beats: [
      {
        example: 'Mallin sääntö: lehti siirtyy aina viereiseen ruutuun, joka on matalin. Lehti lähtee ruudusta C.',
        text: 'Ruudun C korkeus on 3. Sen vieressä ovat B (6), D (2) ja G (1).',
        pic: 0,
      },
      {
        text: 'Matalin naapuri on G, joten lehti siirtyy sinne. G:n vieressä ei ole matalampaa ruutua, joten lehti pysähtyy.',
        more: 'Malli on yksinkertainen sääntö. Sen avulla voi ennustaa, mitä tapahtuu, ennen kuin kokeillaan.',
        pic: 0,
      },
    ],
    try: 'auto',
  },
  'SCI-ENV-PLAN-01': {
    beats: [
      {
        example: 'Reilussa kokeessa vain yksi asia muuttuu. Mikä muuttuu kokeiden A ja B välillä?',
        text: 'Verrataan rivejä: purjeen koko on molemmissa 2 ja massa 1. Puhaltimen teho on eri: A:ssa 1, B:ssä 0.',
        pic: 0,
      },
      {
        text: 'Vain puhaltimen teho muuttuu, ja kaikki muu pidetään samana. Siksi tuloksen ero johtuu juuri puhaltimesta.',
        pic: 0,
      },
    ],
    try: 'auto',
  },
  'SCI-ENV-CONCL-01': {
    beats: [
      {
        example: 'Kumpikin ryhmä mitattiin kolme kertaa. Mitä mittauksista voi päätellä?',
        text: 'A:n tulokset ovat 10, 10 ja 11 cm, B:n tulokset 7, 8 ja 8 cm. Jokainen A:n piste on kaikkien B:n pisteiden oikealla puolella.',
        pic: 0,
      },
      {
        text: 'Siksi voi päätellä, että A:n tulokset ovat suurempia. Päätelmä koskee vain näitä mittauksia.',
        more: 'Jos ryhmien pisteet menisivät päällekkäin, ero ei olisi selvä. Silloin tulos jäisi epävarmaksi.',
        pic: 0,
      },
    ],
    try: 'auto',
  },
  'SCI-ENV-MODEL-CREATE-01': {
    beats: [
      {
        example: 'Lehti siirtyy aina matalampaan ruutuun. Lehti kulki ruudusta A (korkeus 5) ruutuun E.',
        text: 'Ruutujen E, F ja G korkeutta ei tiedetä. Nuolet näyttävät, mihin kaksi lehteä kulki.',
        pic: 0,
      },
      {
        text: 'Lehti meni A:sta ruutuun E, joten E on matalampi kuin 5. Näin havainnot kertovat, millainen mallin pitää olla.',
        more: 'Samoin F on matalampi kuin E, koska lehti jatkoi E:stä F:ään.',
        pic: 0,
      },
    ],
    try: 'auto',
  },
  'SCI-ENV-MODEL-REVISE-01': {
    beats: [
      {
        example: 'Malli ennusti lehden reitin, mutta ruutuun H putosi kivi. Lehti kulki toista reittiä.',
        text: 'Lehti kulki ruudusta G ruutuun K ja sieltä ruutuun L. Vanha malli ei tiennyt kivestä, joten sen ennuste ei pitänyt.',
        pic: 0,
      },
      {
        text: 'Malli korjataan: kivi lisätään malliin. Korjattu malli selittää sekä vanhat reitit että uuden reitin.',
        more: 'Havaintoa ei jätetä huomiotta, vaikka se ei sovi malliin. Juuri siksi malli korjataan.',
        pic: 0,
      },
    ],
    try: 'auto',
  },
  'SCI-ENV-DATA-01': {
    beats: [
      {
        text: 'Joka päivä merkittiin vihkoon nähdyt sammakot. Jokainen sivu lasketaan, ja luku viedään taulukkoon: maanantai 3, tiistai 5 ja keskiviikko 2.',
        pic: 0,
      },
      {
        text: 'Taulukosta näkee kaikki päivät yhdellä silmäyksellä. Tässä luvut ovat 4, 1 ja 6, joten eniten sammakoita nähtiin keskiviikkona.',
        pic: 1,
      },
    ],
    try: {
      say: 'Maanantaina nähtiin 2 sammakkoa, tiistaina 5 ja keskiviikkona 3. Minä päivänä sammakoita nähtiin eniten?',
      options: ['Tiistaina', 'Maanantaina', 'Keskiviikkona'],
      answer: 0,
      explain: 'Suurin luku on 5, ja se on tiistain kohdalla.',
      why: [null, 'Maanantain luku 2 on pienin.', 'Keskiviikon luku 3 on pienempi kuin tiistain 5.'],
    },
  },
  'SCI-ENV-MODEL-02': {
    beats: [
      {
        example: 'Majavan allas P pysyy rauhallisena, kun vesi ei mene sinne. Milloin vesi menee putoukselle F?',
        text: 'Kartan reitit ovat havaintoja. Sininen reitti kuljettiin luukku auki, oranssi luukku kiinni.',
        pic: 0,
      },
      {
        text: 'Sininen reitti S → A → C → F päättyy putoukselle. Kun luukku on auki, putous saa vettä ja allas pysyy rauhallisena.',
        more: 'Jos uusi havainto näyttäisi toisenlaisen reitin, kartta korjattaisiin sen mukaan.',
        pic: 0,
      },
    ],
    try: 'auto',
  },
};
