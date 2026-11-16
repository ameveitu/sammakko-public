import type { PageText } from '../text';

/** UM-07 Satasaaren vesineuvosto: base value, share, amount, percentage change, comparison and percentage points. */
export const TEXT: Record<string, PageText> = {
  'M79-PCT-AMOUNT': {
    beats: [
      { text: 'Tilauksessa on 80 rakennuspalaa, ja koko tilaus on 100 %. Majavalle varataan siitä 25 %.', pic: 0 },
      { text: '25 % on 25/100 eli neljäsosa, joten 80 palaa jaetaan neljään yhtä suureen ryhmään. Yksi ryhmä on 80 : 4 = 20 palaa.', pic: 1 },
      { text: 'Yleensä prosenttiluku muutetaan desimaaliluvuksi ja kerrotaan perusarvolla: 0,25 · 80 = 20. Saatu määrä on prosenttiarvo.', pic: 1 },
    ],
    try: 'auto',
  },
  'M79-PCT-REFBASE': {
    beats: [
      { text: 'Koko tilaus, 40 rakennuspalaa, on perusarvo eli 100 %. Majavalle siitä varataan 10 palaa.', pic: 0 },
      { text: '10 palaa on prosenttiarvo eli osan määrä, ja 25 % on prosenttiluku: 10 : 40 = 0,25 = 25 %. Perusarvo on se määrä, johon osaa verrataan.', pic: 0 },
      { text: 'Muutoksessa perusarvo on lähtöarvo. Jos 40 palaan tulee 10 lisää, perusarvo on 40 eikä uusi määrä 50.', pic: 0 },
    ],
    try: 'auto',
  },
  'M79-PCT-SHARE': {
    beats: [
      { text: 'Sadan palan tilauksesta majavalle on varattu 40 palaa. Koska kokonaisuus on 100, osuus on suoraan 40/100 = 40 %.', pic: 0 },
      { text: 'Jos kokonaisuus ei ole 100, osa jaetaan kokonaisella. Esimerkiksi 14 palaa 40:stä on 14 : 40 = 0,35 = 35 %.', pic: 0 },
      { text: 'Prosenttiosuus = osa : kokonainen · 100 %. Osan ja kokonaisen pitää olla samassa yksikössä.', pic: 0 },
    ],
    try: 'auto',
  },
  'M79-PCT-BASE': {
    beats: [
      { text: 'Majavan 24 palaa on 30 % koko tilauksesta, mutta koko määrä puuttuu. Jaetaan 24 palaa kolmeen ryhmään: yksi 8 palan ryhmä on 10 %.', pic: 0 },
      { text: '100 % on kymmenen tällaista ryhmää eli 10 · 8 = 80 palaa. Tarkistus: 30 % 80 palasta on 0,3 · 80 = 24.', pic: 1 },
      { text: 'Lyhyemmin: perusarvo = prosenttiarvo : prosenttiluku eli 24 : 0,30 = 80. Tarkista tulos aina kertomalla.', pic: 1 },
    ],
    try: 'auto',
  },
  'M79-PCT-CHANGED': {
    beats: [
      { text: 'Vesivarassa on 80 litraa, ja se on 100 %. Kun määrä kasvaa 25 %, lisäys on 0,25 · 80 = 20 litraa ja uusi määrä 100 litraa.', pic: 0 },
      { text: 'Jos sama 80 litraa vähenee 25 %, vähennetään samat 20 litraa. Jäljelle jää 60 litraa.', more: 'Muutoksen määrä 20 l ja uusi kokonaismäärä 100 l tai 60 l ovat eri asioita.', pic: 1 },
      { text: 'Uuden määrän saa suoraan kertoimella. Kasvu 25 % on 1,25 · 80 = 100, ja väheneminen 25 % on 0,75 · 80 = 60.', pic: 1 },
    ],
    try: 'auto',
  },
  'M79-PCT-CHANGE': {
    beats: [
      { text: 'Varastossa oli 20 palaa, ja nyt on 30. Muutos on 30 − 20 = 10 palaa, ja sitä verrataan lähtömäärään: 10 : 20 = 0,5 = 50 %.', pic: 0 },
      { text: 'Toisessa varastossa oli 25 palaa ja nyt 20. Muutos on 20 − 25 = −5 palaa, ja −5 : 25 = −0,2 = −20 %.', pic: 1 },
      { text: 'Muutosprosentti = (uusi − vanha) : vanha · 100 %. Pieneneminen merkitään miinuksella.', pic: 1 },
    ],
    try: 'auto',
  },
  'M79-PCT-COMP': {
    beats: [
      { text: 'Aavan tilauksessa on 40 palaa ja majavan 50. Kun Aavan tilaus on 100 %, ero 10 palaa on 10 : 40 = 25 %, joten majavan tilaus on 25 % suurempi.', pic: 0 },
      { text: 'Kun vertailupohjana on majavan 50 palaa, sama ero on 10 : 50 = 20 %. Aavan tilaus on siis 20 % pienempi kuin majavan.', pic: 1 },
      { text: 'Jaetaan aina sillä määrällä, johon verrataan. Sana kuin näyttää sen: ”pienempi kuin majavan tilaus” tarkoittaa, että majavan tilaus on 100 %.', pic: 1 },
    ],
    try: 'auto',
  },
  'M79-PCT-PP': {
    beats: [
      { text: 'Sadan laatan suunnitelmasta on ensin valmiina 20 ja myöhemmin 30. Osuus kasvaa 20 %:sta 30 %:iin eli 10 prosenttiyksikköä.', pic: 0 },
      { text: 'Kun vertailukohtana on ensimmäisen vaiheen 20 laattaa, 10 uutta laattaa on niistä puolet. Suhteellinen kasvu on siis 50 %.', pic: 1 },
      { text: 'Prosenttiyksikkö kertoo prosenttilukujen erotuksen, prosentti suhteellisen muutoksen. Kun korko nousee 2 %:sta 3 %:iin, se nousee 1 prosenttiyksikön eli 50 %.', pic: 1 },
    ],
    try: 'auto',
  },
};
