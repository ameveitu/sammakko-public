import type { PageText } from '../text';

/** LM07 Suurten lastien laskupaja: written calculation, expressions, rounding and choosing a method. */
export const TEXT: Record<string, PageText> = {
  'M-CALC-STRAT': {
    beats: [
      {
        example: 'Laske 287 + 98.',
        text: '98 on vain 2 vähemmän kuin 100. Lasketaan 287 + 100 = 387 ja korjataan: 387 − 2 = 385.',
        pic: 0, figure: false,
      },
      {
        text: 'Sarakkeittain: 7 + 8 = 15, joten 5 kirjoitetaan ja 1 siirtyy kymppeihin. Kymppeihin tulee 8 + 9 + 1 = 18.',
        more: 'Kympeistä 8 kirjoitetaan ja 1 siirtyy satoihin: 2 + 1 = 3. Tulos on taas 385.',
        pic: 1,
      },
      {
        text: 'Molemmat tavat antavat saman tarkan tuloksen. Valitse lukuihin sopiva: tasakymmenen tai tasasadan lähellä oleva luku sopii korjaukseen.',
        pic: null,
      },
    ],
    try: {
      say: 'Missä laskussa pyöreä luku ja korjaus on kätevin tapa?',
      options: ['456 + 99', '456 + 23', '400 + 300'],
      answer: 0,
      explain: '99 on vain yhden päässä luvusta 100: 456 + 100 = 556 ja 556 − 1 = 555.',
      why: [null, '23 on helppo lisätä osina: ensin 20, sitten 3. Korjausta ei tarvita.', 'Luvut ovat jo tasasatoja, joten korjausta ei tarvita.'],
    },
  },
  'M-ROUND-01': {
    beats: [
      {
        example: 'Pyöristä 33 lähimpään kymmeneen.',
        text: '33 on kymmenten 30 ja 40 välissä. Luvusta 30 on matkaa 3, luvusta 40 matkaa 7.',
        pic: 0, figure: false,
      },
      {
        text: '30 on lähempänä, joten 33 pyöristyy lukuun 30. Merkitään 33 ≈ 30.',
        pic: 1,
      },
      {
        text: 'Jos luku on täsmälleen keskellä, se pyöristetään suurempaan. Esimerkiksi 35 ≈ 40.',
        pic: null,
      },
    ],
    try: {
      say: 'Mihin lukuun 47 pyöristyy, kun pyöristetään lähimpään kymmeneen?',
      options: ['50', '40', '45'],
      answer: 0,
      explain: '47 on lukujen 40 ja 50 välissä. Luvusta 50 on matkaa 3 ja luvusta 40 matkaa 7, joten 47 ≈ 50.',
      why: [null, 'Luvusta 40 on matkaa 7, mutta luvusta 50 vain 3.', 'Kymmeneen pyöristetty luku on tasakymmen, tässä 40 tai 50.'],
    },
  },
  'M-EXPR-01': {
    beats: [
      { text: '2 + 3 × 4: kertolasku lasketaan ennen yhteenlaskua. 3 × 4 = 12, ja 2 + 12 = 14.', pic: 0 },
      { text: '(2 + 3) × 4: sulut lasketaan ensin. 2 + 3 = 5, ja 5 × 4 = 20.', more: 'Samat luvut, eri vastaus: sulut muuttivat laskujärjestyksen.', pic: 1 },
      {
        text: 'Pidempi lasku 18 : (4 − 1) + 2 × 5: ensin sulut, sitten jako- ja kertolaskut, viimeisenä yhteenlasku.',
        more: 'Sulut: 4 − 1 = 3. Jako ja kerto vasemmalta oikealle: 18 : 3 = 6 ja 2 × 5 = 10. Lopuksi 6 + 10 = 16.',
        pic: 2,
      },
    ],
    try: 'auto',
  },
  'M-EST-01': {
    beats: [
      {
        example: 'Laske arvio: 367 + 189.',
        text: 'Pyöristetään luvut lähimpään kymmeneen: 367 ≈ 370 ja 189 ≈ 190. Pyöristetyillä luvuilla on helppo laskea.',
        pic: 0, figure: false,
      },
      {
        text: '370 + 190 = 560, joten 367 + 189 ≈ 560. Noin-merkki ≈ kertoo, että tulos on arvio.',
        more: 'Tarkka tulos on 556. Arvio on lähellä mutta ei täsmälleen sama, siksi merkki on ≈ eikä =.',
        pic: 1,
      },
    ],
    try: {
      say: 'Arvioi 412 + 295 pyöristämällä luvut lähimpään sataan.',
      options: ['≈ 700', '≈ 707', '≈ 600'],
      answer: 0,
      explain: '412 ≈ 400 ja 295 ≈ 300, joten 412 + 295 ≈ 700.',
      why: [null, '707 on tarkka tulos, ei satoihin pyöristämällä saatu arvio.', '295 pyöristyy lukuun 300, ei lukuun 200.'],
    },
  },
  'M-WRMUL': {
    beats: [
      { text: '4 × 236: luku pilkotaan osiin 200 + 30 + 6. Jokainen osa kerrotaan neljällä: 800 + 120 + 24 = 944.', pic: 0 },
      {
        text: 'Allekkain aloitetaan oikealta: 4 × 6 = 24. Kirjoitetaan 4 ja 2 kymppiä muistiin.',
        more: 'Sitten 4 × 3 = 12, ja muistista 2: 14. Kirjoitetaan 4 ja 1 muistiin. Lopuksi 4 × 2 = 8, ja muistista 1: 9. Tulo on 944.',
        pic: 1,
      },
      {
        text: '57 × 8: 8 × 7 = 56, kirjoitetaan 6 ja 5 muistiin. 8 × 5 = 40, ja muistista 5: 45, joten tulo on 456.',
        more: 'Muistinumero lisätään vasta kertomisen jälkeen: ensin 8 × 5, sitten + 5.',
        pic: 2,
      },
    ],
    try: 'auto',
  },
  'M-WRDIV': {
    beats: [
      { text: '684 : 2 jaetaan paikka kerrallaan: sadat 6 : 2 = 3, kympit 8 : 2 = 4 ja ykköset 4 : 2 = 2. Vastaus on 342.', pic: 0 },
      { text: 'Jaossa 72 : 3 jokainen saa 2 kymppiä, ja 1 kymppi jää yli. Se vaihdetaan 10 ykköseksi: 12 : 3 = 4, joten vastaus on 24.', pic: 1 },
      {
        text: 'Jaossa 156 : 4 yhtä sataa ei voi jakaa neljälle. Se vaihdetaan 10 kympiksi, jolloin kymppejä on 15.',
        more: '15 kymppiä : 4 = 3 kymppiä, ja 3 kymppiä jää yli. Ne vaihdetaan ykkösiksi: 30 + 6 = 36 ykköstä, ja 36 : 4 = 9. Vastaus on 39.',
        pic: 2,
      },
    ],
    try: 'auto',
  },
  'M-EST-02': {
    beats: [
      {
        example: 'Ensimmäinen määrä on 200–300 ja toinen 60–90. Määrät yhdistetään.',
        text: 'Pienimmillään summa on 200 + 60 = 260. Suurimmillaan se on 300 + 90 = 390.',
        pic: 0, figure: false,
      },
      {
        text: 'Tuloksen täytyy olla välillä 260–390. Ehdotus 300 on alueella, joten se on mahdollinen.',
        more: 'Jos ehdotus olisi vaikkapa 900 tai 100, se olisi alueen ulkopuolella eikä voisi olla oikein.',
        pic: 1,
      },
    ],
    try: {
      say: 'Summa on välillä 260–390. Mikä ehdotus on mahdollinen?',
      options: ['350', '450', '200'],
      answer: 0,
      explain: '350 on suurempi kuin 260 ja pienempi kuin 390, joten se on alueella.',
      why: [null, '450 on yli suurimman mahdollisen summan 390.', '200 on alle pienimmän mahdollisen summan 260.'],
    },
  },
  'M-WRADD': {
    beats: [
      {
        text: '348 + 275 aloitetaan ykkösistä: 8 + 5 = 13. Kirjoitetaan 3 ja 1 kymppi muistiin.',
        more: 'Kympit: 4 + 7 + 1 = 12, kirjoitetaan 2 ja 1 muistiin. Sadat: 3 + 2 + 1 = 6. Summa on 623.',
        pic: 0,
      },
      { text: 'Aina ei tule muistinumeroa. Laskussa 352 + 136 jokaisen sarakkeen summa on alle 10, joten summa on 488.', pic: 1 },
      {
        text: '685 + 347: sadoistakin tulee yli 10. Viimeinen muistinumero kirjoitetaan tuhansien paikalle, ja summa on 1032.',
        more: 'Ykköset 5 + 7 = 12, kympit 8 + 4 + 1 = 13, sadat 6 + 3 + 1 = 10.',
        pic: 2,
      },
    ],
    try: 'auto',
  },
  'M-WRSUB': {
    beats: [
      {
        text: '352 − 178: ykkösissä 2 − 8 ei onnistu. Vaihdetaan yksi kymppi kymmeneksi ykköseksi: 12 − 8 = 4.',
        more: 'Kympeissä sama uudestaan: 4 − 7 ei onnistu, joten vaihdetaan sata kympeiksi: 14 − 7 = 7. Sadoissa 2 − 1 = 1. Erotus on 174.',
        pic: 0,
      },
      {
        text: 'Laskussa 405 − 178 kymppejä on nolla. Vaihdetaan sata kymmeneksi kympiksi ja niistä yksi kymppi ykkösiksi.',
        more: 'Nollasta tuli 10 kymppiä, ja yhden vaihdon jälkeen niitä on 9. Ykköset 15 − 8 = 7, kympit 9 − 7 = 2 ja sadat 3 − 1 = 2. Erotus on 227.',
        pic: 1,
      },
      {
        text: 'Tarkista yhteenlaskulla: erotus plus vähentäjä on alkuperäinen luku. 174 + 178 = 352, joten lasku oli oikein.',
        more: 'Ylemmästä numerosta otetaan aina. Ykkösissä 8 − 2 olisi väärin, koska ylempi numero on 2.',
        pic: 2,
      },
    ],
    try: 'auto',
  },
};
