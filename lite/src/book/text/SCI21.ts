import type { PageText } from '../text';

/** SCI21 Hiilen elävä puutarha: carbon compounds, the chemical groups of nutrients and alcohols as one organic group. */
export const TEXT: Record<string, PageText> = {
  'CHEM79-CARBON': {
    beats: [
      { text: 'Hiilen kemiallinen merkki on C. Kaavasta näkee, onko aineessa hiiltä: glukoosissa C₆H₁₂O₆ on kuusi hiiliatomia ja asetonissa C₃H₆O kolme.', more: 'Valkoinen glukoosi ja väritön asetoni eivät näytä hiileltä, mutta kaava paljastaa sen. Ulkonäkö ei kerro aineen koostumusta.', pic: 0, figure: false },
      { text: 'Alkuainehiilessä, kuten grafiitissa, on pelkkiä hiiliatomeja, joten se on alkuaine. Glukoosi ja asetoni ovat yhdisteitä: niissä hiili on sitoutunut vetyyn ja happeen.', pic: 1, figure: false },
      { text: 'Vedessä H₂O on vetyä ja happea, mutta ei hiiltä. Vesi on siis yhdiste, mutta ei hiiliyhdiste.', pic: 1, figure: false },
    ],
    try: {
      say: 'Grafiitti on mustaa ja glukoosi valkoista. Kummassa on hiiltä?',
      options: ['Molemmissa', 'Vain grafiitissa', 'Vain glukoosissa'],
      answer: 0,
      explain: 'Grafiitti on alkuainehiiltä, ja glukoosin kaavassa C₆H₁₂O₆ on C. Väri ei kerro, onko aineessa hiiltä.',
      why: [null, 'Musta väri ei ole hiilen tunnusmerkki. Glukoosin kaavassa on C, joten siinäkin on hiiltä.', 'Grafiitti on puhdasta alkuainehiiltä: siinä on pelkkiä hiiliatomeja.'],
    },
  },
  'CHEM79-CARBON-COMPOUND': {
    beats: [
      { text: 'Hiiliyhdisteessä hiiliatomit ovat sitoutuneet toisiinsa tai muihin atomeihin. Kuvan kaksi hiiltä ja kaksi vetyä muodostavat etyynin C₂H₂, kun sidokset tehdään oikein.', pic: 0 },
      { text: 'Hiiliatomilla on aina neljä sidosta ja vetyatomilla yksi. Etyynissä hiilet ovat toisissaan kiinni kolmoissidoksella, ja kummassakin on yksi vety: H–C≡C–H.', more: 'Kolmoissidos tarkoittaa kolmea sidosta samojen atomien välillä. Kummallakin hiilellä on siis 3 + 1 = 4 sidosta.', pic: 1, figure: false },
      { text: 'Kaikki hiiliyhdisteet eivät ole orgaanisia: hiilidioksidi CO₂ on epäorgaaninen hiiliyhdiste. Jos hiili ja happikaasu ovat samassa astiassa ilman sidoksia, kyse on seoksesta.', more: 'Alkuainehiilen verkossa on vain hiiliatomeja. Siksi se on alkuaine eikä yhdiste.', pic: 1, figure: false },
    ],
    try: {
      say: 'Mikä häkä eli hiilimonoksidi CO on?',
      options: ['Epäorgaaninen hiiliyhdiste', 'Orgaaninen yhdiste', 'Hiilen ja hapen seos', 'Alkuaine'],
      answer: 0,
      explain: 'Hiilimonoksidissa hiili ja happi ovat sitoutuneet samaan molekyyliin, joten se on yhdiste. Hiilidioksidin tavoin se luetaan epäorgaanisiin hiiliyhdisteisiin.',
      why: [null, 'Pelkkä hiili ei tee yhdisteestä orgaanista: häkä luetaan hiilidioksidin tavoin epäorgaanisiin yhdisteisiin.', 'Seoksessa aineet ovat erillään. Hiilimonoksidissa hiili ja happi ovat sidoksella samassa molekyylissä.', 'Alkuaineessa on vain yhtä atomilajia, mutta hiilimonoksidissa on hiiltä ja happea.'],
    },
  },
  'CHEM79-NUTRIENT-01': {
    beats: [
      { text: 'Ruoka on monen kemiallisen aineen seos. Samassa evään näytteessä voi olla sokeria, rasvaa, proteiinia ja vettä.', pic: 0, figure: false },
      { text: 'Ravintoaineet jaetaan ryhmiin rakenteen mukaan. Fruktoosi on hiilihydraatti, tripalmitiini on rasva ja herneen varastoproteiinit ovat proteiineja.', more: 'Rasvassa glyseroliin on liittynyt kolme rasvahappotähdettä, ja proteiini on pitkä aminohappotähteiden ketju. Vesi ei kuulu näihin kolmeen ryhmään.', pic: 1, figure: false },
      { text: 'Yksi ruoka ei siis kuulu vain yhteen ryhmään. Esimerkiksi herneessä on sekä proteiineja että hiilihydraatteja.', pic: 1, figure: false },
    ],
    try: {
      say: 'Evään näytteessä on fruktoosia, tripalmitiinia ja herneproteiinia. Mitä ryhmiä siinä on?',
      options: ['Kaikkia kolmea ryhmää', 'Vain hiilihydraatteja', 'Vain rasvaa', 'Vain proteiinia'],
      answer: 0,
      explain: 'Fruktoosi on hiilihydraatti, tripalmitiini rasva ja herneproteiini proteiini. Samassa ruoassa voi olla monen ryhmän aineita.',
      why: [null, 'Fruktoosi on hiilihydraatti, mutta tripalmitiini on rasva ja herneproteiini proteiini.', 'Tripalmitiini on rasva, mutta fruktoosi ja herneproteiini kuuluvat muihin ryhmiin.', 'Herneproteiini on proteiinia, mutta fruktoosi ja tripalmitiini kuuluvat muihin ryhmiin.'],
    },
  },
  'CHEM79-ORG-GROUP': {
    beats: [
      { text: 'Heksan-1-oli ja metanoli ovat alkoholeja. Kummassakin O–H-ryhmä on liittynyt hiileen, jolla on vain yksinkertaisia sidoksia.', more: 'O–H-ryhmää sanotaan hydroksyyliryhmäksi. Pelkkä happi ei tee aineesta alkoholia: dimetyylieetterissä CH₃–O–CH₃ happi on kahden hiilen välissä, eikä siinä ole O–H-ryhmää.', pic: 0 },
      { text: 'Samaan ryhmään kuuluvilla aineilla voi olla eri ominaisuudet. Heksan-1-oli kiehuu noin 157 °C:ssa ja metanoli noin 65 °C:ssa, joten ero on 92 °C.', more: 'Arvot on mitattu samassa paineessa, joten niitä voi verrata suoraan. Heksan-1-olissa on kuusi hiiliatomia, metanolissa vain yksi. Päätelmä koskee näitä kahta ainetta.', pic: 1, figure: false },
    ],
    try: {
      say: 'Kummassakin aineessa on happea. Kumpi niistä on alkoholi?',
      options: ['CH₃–O–H', 'CH₃–O–CH₃', 'Molemmat, koska niissä on happea'],
      answer: 0,
      explain: 'Alkoholissa O–H-ryhmä on liittynyt hiileen. Aineessa CH₃–O–CH₃ happi on kahden hiilen välissä, eikä siinä ole O–H-ryhmää.',
      why: [null, 'Tämän aineen hapessa ei ole vetyä, joten siinä ei ole O–H-ryhmää.', 'Happi yksin ei riitä. Alkoholissa hapella on oltava vety eli O–H-ryhmä.'],
    },
  },
  'CHEM79-NUTRIENT-CARB': {
    beats: [
      { text: 'Fruktoosi on makea sokeri, mutta tärkkelys ei maistu makealta. Silti molemmat ovat hiilihydraatteja.', pic: 0, figure: false },
      { text: 'Tärkkelys on pitkä ketju, joka on rakentunut glukoosiosista. Ryhmän ratkaisee aineen rakenne, ei sen maku.', pic: 1, figure: false },
      { text: 'Sokereita ovat esimerkiksi glukoosi, fruktoosi ja sakkaroosi. Perunassa, riisissä ja leivässä on paljon tärkkelystä.', pic: 1, figure: false },
    ],
    try: {
      say: 'Tärkkelys ei maistu makealta. Mihin ryhmään se kuuluu?',
      options: ['Hiilihydraatteihin', 'Proteiineihin', 'Ei hiilihydraatteihin, koska se ei ole makea'],
      answer: 0,
      explain: 'Tärkkelyksen pitkä ketju on rakentunut glukoosiosista, joten se on hiilihydraatti. Maku ei ratkaise ryhmää.',
      why: [null, 'Proteiini on aminohappotähteiden ketju. Tärkkelyksen ketju on rakentunut glukoosiosista.', 'Maku ei ratkaise ryhmää. Tärkkelyksen ketjun osat ovat glukoosia, joten se on hiilihydraatti.'],
    },
  },
  'CHEM79-NUTRIENT-FAT': {
    beats: [
      { text: 'Tripalmitiini on huoneenlämmössä kiinteää ja trioleiini nestemäistä. Silti molemmat ovat rasvoja.', more: 'Rasvaa voi olla ruoassa, vaikka sitä ei näe, esimerkiksi pähkinöissä ja juustossa. Koostumustiedot kertovat sen.', pic: 0, figure: false },
      { text: 'Rasvamolekyylissä eli triglyseridissä glyseroliin on liittynyt kolme rasvahappotähdettä. Ryhmän ratkaisee rakenne, ei olomuoto.', pic: 1, figure: false },
    ],
    try: {
      say: 'Trioleiini on huoneenlämmössä nestettä. Onko se rasva?',
      options: ['On, koska se on triglyseridi', 'Ei, koska rasva on kiinteää', 'Ei, koska se on öljyä'],
      answer: 0,
      explain: 'Trioleiinissa glyseroliin on liittynyt kolme rasvahappotähdettä, joten se on triglyseridi eli rasva. Nestemäistä rasvaa sanotaan öljyksi.',
      why: [null, 'Olomuoto ei ratkaise. Nestemäinenkin trioleiini on glyseroli ja kolme rasvahappotähdettä.', 'Kasviöljyt ovat nestemäisiä rasvoja: niidenkin molekyylit ovat triglyseridejä.'],
    },
  },
  'CHEM79-NUTRIENT-PROT': {
    beats: [
      { text: 'Proteiini on pitkä ketju, jossa aminohapot ovat liittyneet toisiinsa peräkkäin. Mallissa jokainen ketjun pala on yksi aminohappotähde.', pic: 0, figure: false },
      { text: 'Proteiinien rakennusosina on 20 erilaista aminohappoa, ja niiden järjestys ketjussa vaihtelee. Eri järjestys tekee erilaisen proteiinin.', pic: 1, figure: false },
      { text: 'Proteiineja on sekä eläin- että kasviruoissa. Esimerkiksi herneissä, pavuissa ja soijassa on paljon proteiinia.', pic: 1, figure: false },
    ],
    try: {
      say: 'Mistä osista proteiinin ketju rakentuu?',
      options: ['Aminohapoista', 'Glukoosiosista', 'Glyserolista ja rasvahapoista'],
      answer: 0,
      explain: 'Proteiini on aminohappotähteiden ketju. Aminohappojen järjestys määrää, millainen proteiini on.',
      why: [null, 'Glukoosiosista rakentuu tärkkelys, joka on hiilihydraatti.', 'Glyseroli ja kolme rasvahappotähdettä muodostavat rasvan eli triglyseridin.'],
    },
  },
};
