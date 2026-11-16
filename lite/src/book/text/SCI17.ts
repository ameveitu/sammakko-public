import type { PageText } from '../text';

/** SCI17 Ainekirjainten kirjasto: chemical symbols, formulas, subscripts, coefficients and reaction equations. */
export const TEXT: Record<string, PageText> = {
  'CHEM79-SYMBOL': {
    beats: [
      { text: 'Jokaisella alkuaineella on oma kemiallinen merkki. Kuvassa Zn on sinkki, Ne on neon ja O on happi.', more: 'Merkki tulee usein alkuaineen latinankielisestä nimestä. Esimerkiksi rauta on Fe (ferrum) ja kupari Cu (cuprum).', pic: 0 },
      { text: 'Merkki alkaa aina isolla kirjaimella, ja mahdollinen toinen kirjain on pieni. Siksi Co on koboltti, mutta CO on hiilen ja hapen yhdiste, häkä.', pic: 0 },
    ],
    try: {
      say: 'Mikä alkuaine on merkki Co?',
      options: ['Koboltti', 'Hiili ja happi', 'Kupari'],
      answer: 0,
      explain: 'Co on yksi merkki, koska siinä on iso kirjain ja sen perässä pieni. Se tarkoittaa kobolttia.',
      why: [null, 'Hiili ja happi kirjoitettaisiin kahdella isolla kirjaimella: CO.', 'Kuparin merkki on Cu.'],
    },
  },
  'CHEM79-FORMULA-ELEMENTS': {
    beats: [
      { text: 'Etanolin kaava on C₂H₅OH. Siinä on kolme eri merkkiä: C, H ja O.', pic: 0 },
      { text: 'Jokainen iso kirjain aloittaa uuden alkuaineen merkin. Etanolissa on siis hiiltä, vetyä ja happea, vaikka H esiintyy kaavassa kahdesti.', pic: 0 },
    ],
    try: {
      say: 'Montako eri alkuainetta on glukoosin kaavassa C₆H₁₂O₆?',
      options: ['3', '24', '6'],
      answer: 0,
      explain: 'Kaavassa on kolme eri merkkiä: C, H ja O. Alaindeksit kertovat atomien määrät, eivät uusia alkuaineita.',
      why: [null, '24 on kaikkien atomien määrä, 6 + 12 + 6. Kysymys koskee eri alkuaineita.', '6 on alaindeksi. Se kertoo hiili- tai happiatomien määrän.'],
    },
  },
  'CHEM79-FORMULA-RATIO': {
    beats: [
      { text: 'Etanolimolekyylissä C₂H₅OH on 2 hiiliatomia, 6 vetyatomia ja 1 happiatomi. Vety lasketaan kahdesta kohdasta: H₅ ja OH:n H.', pic: 0 },
      { text: 'Atomien lukusuhde on siis H : C : O = 6 : 2 : 1. Kobolttia ja alumiinia ei etanolissa ole, joten niiden luku on 0.', pic: 0 },
      { text: 'Suhde ei muutu, kun kaikki luvut kerrotaan samalla luvulla. Esimerkiksi 12 : 4 : 2 on sama suhde kuin 6 : 2 : 1.', more: 'Ruokasuolan kaava NaCl ei kuvaa molekyyliä. Se kertoo, että suolakiteessä on yhtä monta natrium- ja kloridi-ionia.', pic: 0 },
    ],
    try: {
      say: 'Etaanin C₂H₆ hiili- ja vetyatomien lukusuhde on 2 : 6. Mikä muu suhde tarkoittaa samaa?',
      options: ['1 : 3', '3 : 1', '1 : 5'],
      answer: 0,
      explain: 'Kun molemmat luvut jaetaan kahdella, 2 : 6 on 1 : 3. Vetyatomeja on kolme kertaa niin monta kuin hiiliatomeja.',
      why: [null, 'Järjestys on C : H, ja vetyatomeja on enemmän kuin hiiliatomeja.', 'Suhde säilyy, kun luvut jaetaan samalla luvulla. Vähentäminen muuttaa suhdetta.'],
    },
  },
  'CHEM79-FORMULA': {
    beats: [
      { text: 'Kaavasta C₂H₅OH luetaan ensin atomilajit: hiili, vety ja happi. Sitten luetaan määrät: yhdessä molekyylissä on 2 C-, 6 H- ja 1 O-atomi.', pic: 0 },
      { text: 'Kuvan malli rakentaa yhden molekyylin: H × 6, C × 2 ja O × 1. Samat luvut antavat lukusuhteen H : C : O = 6 : 2 : 1.', pic: 0 },
      { text: 'Molekyylikaava kertoo todelliset määrät yhdessä molekyylissä. Lukusuhde kertoo vain, missä suhteessa atomeja on.', more: 'Ero näkyy, kun luvut voi supistaa. Etaanimolekyylissä C₂H₆ on 2 hiili- ja 6 vetyatomia, mutta lukusuhde on 1 : 3.', pic: null },
    ],
    try: {
      say: 'Hiilidioksidin kaava on CO₂. Mitä atomeja yhdessä molekyylissä on?',
      options: ['1 hiili- ja 2 happiatomia', '1 koboltti- ja 2 happiatomia', '2 hiili- ja 2 happiatomia'],
      answer: 0,
      explain: 'C on hiili ja O happi, koska kumpikin on iso kirjain. Alaindeksi 2 koskee vain happea, joten molekyylissä on 1 C ja 2 O.',
      why: [null, 'Koboltti kirjoitetaan Co, pienellä o:lla. Kaavassa CO₂ O on iso kirjain eli happi.', 'Alaindeksi 2 kuuluu vain O:lle. C:n perässä ei ole numeroa, joten hiiltä on yksi.'],
    },
  },
  'CHEM79-SUBSCRIPT': {
    beats: [
      { text: 'Etaanin kaavassa C₂H₆ pienet numerot ovat alaindeksejä. Alaindeksi koskee vain sitä merkkiä, jonka perässä se on.', pic: 0 },
      { text: 'C₂ tarkoittaa kahta hiiliatomia ja H₆ kuutta vetyatomia. Jos merkin perässä ei ole numeroa, atomeja on yksi.', pic: 0 },
      { text: 'Jos sama merkki on kaavassa kahdesti, määrät lasketaan yhteen. Etanolissa C₂H₅OH vetyatomeja on 5 + 1 = 6.', pic: null },
    ],
    try: {
      say: 'Montako rikkiatomia on rikkihapon kaavassa H₂SO₄?',
      options: ['1', '0', '4', '2'],
      answer: 0,
      explain: 'S:n perässä ei ole numeroa, joten rikkiatomeja on yksi. Alaindeksi 4 kuuluu O:lle ja 2 H:lle.',
      why: [null, 'Merkki S on kaavassa, joten rikkiä on. Kirjoittamaton numero tarkoittaa yhtä.', 'Alaindeksi 4 kuuluu sen edellä olevalle O:lle, ei S:lle.', 'Alaindeksi 2 kuuluu H:lle, ei S:lle.'],
    },
  },
  'CHEM79-REACTION-EQ-01': {
    beats: [
      { text: 'Reaktioyhtälö 3O₂ + 4Al → 2Al₂O₃ kuvaa, kun happi ja alumiini reagoivat keskenään. Reaktiossa syntyy alumiinioksidia.', more: 'Alumiinin pintaan muodostuu ilmassa ohut alumiinioksidikerros, joka suojaa metallia.', pic: 0 },
      { text: 'Nuolen vasemmalla puolella ovat lähtöaineet, tässä happi ja alumiini. Oikealla puolella on tuote, alumiinioksidi Al₂O₃.', pic: 0 },
      { text: 'Nuoli luetaan "muodostuu": lähtöaineista muodostuu tuotteita. Plusmerkki erottaa saman puolen aineet toisistaan.', pic: 0 },
    ],
    try: {
      say: 'Mikä on tuote reaktiossa C + O₂ → CO₂?',
      options: ['CO₂', 'C', 'O₂'],
      answer: 0,
      explain: 'Tuote on nuolen oikealla puolella. Hiili ja happi ovat lähtöaineita, ja niistä muodostuu hiilidioksidia.',
      why: [null, 'C on nuolen vasemmalla puolella, joten se on lähtöaine.', 'O₂ on nuolen vasemmalla puolella, joten se on lähtöaine.'],
    },
  },
  'CHEM79-COEFF': {
    beats: [
      { text: 'Merkintä 3 C₂H₅OH tarkoittaa kolmea etanolimolekyyliä. Kaavan edessä oleva iso numero on kerroin.', pic: 0 },
      { text: 'Jokaisessa molekyylissä on 2 C-, 6 H- ja 1 O-atomi. Kolmessa molekyylissä on siis 6 C-, 18 H- ja 3 O-atomia.', pic: 0 },
      { text: 'Kerroin muuttaa vain molekyylien määrää. Alaindeksin muuttaminen tekisi toisen aineen: H₂O on vettä, mutta H₂O₂ on vetyperoksidia.', pic: null },
    ],
    try: {
      say: 'Montako vetyatomia on merkinnässä 2H₂O?',
      options: ['4', '2', '6'],
      answer: 0,
      explain: 'Yhdessä vesimolekyylissä on 2 vetyatomia, ja molekyylejä on 2. Vetyatomeja on siis 2 × 2 = 4.',
      why: [null, '2 on yhden molekyylin vetyatomien määrä. Kerroin kertoo, että molekyylejä on kaksi.', '6 on kaikkien atomien määrä, kun mukaan lasketaan myös happiatomit.'],
    },
  },
  'CHEM79-BALANCE': {
    beats: [
      { text: 'Yhtälössä O₂ + Al → Al₂O₃ vasemmalla on 2 happiatomia ja oikealla 3. Reaktiossa atomeja ei synny eikä häviä, joten yhtälö on tasapainotettava.', pic: 0 },
      { text: 'Kaavoja ei muuteta, vaan niiden eteen lisätään kertoimia. Yhtälö 3O₂ + 4Al → 2Al₂O₃ on tasapainossa.', pic: 0 },
      { text: 'Tarkista jokainen atomilaji erikseen. Vasemmalla on 3 × 2 = 6 O ja 4 Al, oikealla 2 × 3 = 6 O ja 2 × 2 = 4 Al.', pic: 0 },
    ],
    try: {
      say: 'Mikä on yhtälön H₂ + O₂ → H₂O tasapainotettu muoto?',
      options: ['2H₂ + O₂ → 2H₂O', 'H₂ + O₂ → H₂O₂', 'H₂ + O₂ → 2H₂O'],
      answer: 0,
      explain: 'Vasemmalla on 2 × 2 = 4 H ja 2 O. Oikealla kahdessa vesimolekyylissä on 4 H ja 2 O, joten jokainen atomilaji täsmää.',
      why: [null, 'Kaavaa ei saa muuttaa: H₂O₂ on eri aine kuin vesi.', 'Happi täsmää, mutta oikealla on 4 H ja vasemmalla vain 2.'],
    },
  },
};
