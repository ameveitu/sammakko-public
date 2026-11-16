import type { PageText } from '../text';

/** LM01 Kaislarannan havaintoreitti: comparing, sorting, patterns and the first questions. */
export const TEXT: Record<string, PageText> = {
  'M-TH-01': {
    beats: [
      { text: 'Verrataan yksi asia kerrallaan: muoto, väri ja koko. Kaikki on samaa, joten kuviot ovat samanlaiset.', pic: 0 },
      { text: 'Muoto ja koko ovat samat, mutta väri on eri. Yksi ero riittää: kuviot ovat erilaiset.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-TH-02': {
    beats: [
      { text: 'Ohje sanoo: punaiset yhteen laatikkoon. Jokaiselta kuviolta kysytään vain: onko se punainen?', more: 'Muoto ei ratkaise.', pic: 0 },
      { text: 'Sama kasa, uusi ohje: kolmiot yhteen laatikkoon. Nyt väri ei ratkaise, vain muoto.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-TH-03': {
    beats: [
      { text: 'Kepit jonoon lyhyimmästä pisimpään: etsi lyhyin jäljellä oleva ja siirrä se seuraavaksi.', pic: 0 },
      { text: 'Luvuilla sama keino: pienin ensin. Suurimmasta pienimpään mennään toisin päin.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-TH-04': {
    beats: [
      { text: 'Tämä kuvio toistuu: kolmio, ympyrä, ympyrä. Kun osa on valmis, aletaan alusta.', pic: 0 },
      { text: 'Tämä kuvio kasvaa: joka kuvassa on kaksi pistettä enemmän kuin edellisessä.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-TH-05': {
    beats: [
      { text: 'Lehtivene meni väärään poukamaan. Aava kääntää vain kourun suunnan ja päästää veneen samasta kohdasta.', pic: 0, figure: false },
      { text: 'Kun muutetaan vain yhtä asiaa, tiedetään, mikä muutoksen teki.', pic: 0, figure: false },
    ],
    try: {
      say: 'Aava haluaa tietää, ratkaiseeko kourun suunta. Mitä hän muuttaa?',
      options: ['Vain kourun suuntaa', 'Suuntaa ja lähtökorkeutta', 'Ei mitään'],
      answer: 0,
      explain: 'Kun vain suunta muuttuu, tiedetään, että juuri suunta vei veneen toiseen poukamaan.',
      why: [null, 'Kaksi muutosta yhtä aikaa: ei tiedetä, kumpi vaikutti.', 'Jos mitään ei muuteta, vertailtavaa ei ole.'],
    },
  },
  'M-TH-06': {
    beats: [
      { text: 'Loikka katsoo laituria rannalta, Aava vedestä. Kiinnitykset pysyvät paikallaan, vain katsoja vaihtuu.', pic: 0, figure: false },
      { text: 'Vastakkaiselta puolelta vasen ja oikea vaihtavat paikkaa.', pic: 0, figure: false },
    ],
    try: {
      say: 'Rannalta katsoen pyöreä kiinnitys on vasemmassa reunassa. Missä se on vedestä katsoen?',
      options: ['Oikeassa reunassa', 'Vasemmassa reunassa', 'Keskellä'],
      answer: 0,
      explain: 'Vastakkaiselta puolelta katsoen järjestys kääntyy: vasen reuna näkyy oikeana reunana.',
      why: [null, 'Vasen ja oikea vaihtuvat, kun katsoja siirtyy vastakkaiselle puolelle.', 'Reunassa oleva kiinnitys pysyy reunassa, se vain näkyy toisella puolella.'],
    },
  },
  'M-TH-07': {
    beats: [
      { text: 'Loikalla on kaksi hattua ja kolme huivia. Arvaamalla sama asu tulee kahdesti ja osa jää löytymättä.', pic: 0 },
      { text: 'Järjestyksessä: punainen hattu pysyy ja huivi vaihtuu, kolme asua. Sitten sininen hattu ja taas kolme.', more: 'Kaksi kertaa kolme on kuusi asua, eikä mikään jäänyt pois.', pic: 1 },
      { text: 'Numeroista 1, 2 ja 3 tehdään kaksinumeroisia lukuja. Ensin ykkönen alkuun, sitten kakkonen, sitten kolmonen.', more: 'Samaa numeroa ei käytetä kahdesti, joten 11 ei käy.', pic: 2 },
    ],
    try: {
      say: 'Loikalla on kolme hattua ja kaksi huivia. Montako eri asua hän voi koota?',
      options: ['5', '6', '9'],
      answer: 1,
      explain: 'Jokainen hattu käy kummankin huivin kanssa: 3 · 2 = 6 asua.',
      why: ['3 + 2 laskee vain tavarat, ei asuja.', null, 'Huiveja on kaksi, ei kolme: 3 · 2 = 6.'],
    },
  },
  'M-TH-08': {
    beats: [
      { text: '3 + 3 + 3 + 3 on neljä kolmen ryhmää. Allekkain se näkyy suoraan: 4 × 3.', pic: 0 },
      { text: 'Neljäsosa 12 kivestä: kivet jaetaan neljään yhtä suureen osaan. Se on sama kuin 12 : 4 = 3.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-WORK-01': {
    beats: [
      { example: 'Loikalla on viisi marjaa ja sininen reppu. Aava antaa kolme marjaa lisää. Montako marjaa Loikalla on?', text: 'Kysymys kysyy marjoja. Repun väri ei auta, marjojen määrät auttavat.', pic: 0 },
      { text: 'Lukukin voi olla turha. Kysymys ratkaisee, mitä tarvitaan.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-WORK-02': {
    beats: [
      { text: 'Matemaattisessa kysymyksessä on jotain, mitä voi laskea tai mitata. Esimerkiksi: kummassa ryhmässä on enemmän lehtiveneitä?', pic: 0 },
      { text: 'Kysymykseen vastataan laskemalla tai mittaamalla, ei arvaamalla.', pic: 0 },
    ],
    try: {
      say: 'Mikä näistä on matemaattinen kysymys?',
      options: ['Kummassa ryhmässä on enemmän veneitä?', 'Mikä vene on kaunein?', 'Pidätkö veneistä?'],
      answer: 0,
      explain: 'Veneet voi laskea kummastakin ryhmästä ja verrata lukuja.',
      why: [null, 'Kauneutta ei voi laskea eikä mitata.', 'Mielipidettä ei voi laskea eikä mitata.'],
    },
  },
  'M-WORK-03': {
    beats: [
      { text: 'Märässä hiekassa on kolme kuoppaa: niissä on 7, 10 ja 6 jälkeä. Väitteen näistä kuopista voi tarkistaa katsomalla.', pic: 0, figure: false },
      { text: 'Muista rannan kuopista ei voi sanoa mitään varmaa, koska niitä ei ole katsottu.', pic: 0, figure: false },
    ],
    try: {
      say: 'Mitä voit sanoa varmasti?',
      options: ['Näissä kolmessa kuopassa on jälkiä.', 'Kaikissa rannan kuopissa on jälkiä.'],
      answer: 0,
      explain: 'Varmaa on vain se, mikä on katsottu: nämä kolme kuoppaa.',
      why: [null, 'Muita kuoppia ei ole katsottu, joten siitä ei tiedetä.'],
    },
  },
};
