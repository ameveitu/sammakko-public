import type { PageText } from '../text';

/** LM05 Yhdistämisen satama: adding and taking away, the signs +, − and =, and the first calculation tricks. */
export const TEXT: Record<string, PageText> = {
  'M-ADD-01': {
    beats: [
      { text: 'Loikalla on kolme marjaa ja Aavalla kaksi. Ne laitetaan samaan koriin, ja korissa on viisi marjaa.', more: 'Laske eteenpäin Loikan kolmesta: neljä, viisi. Kolme plus kaksi on viisi.', pic: 0 },
      { text: 'Loikalla on neljä kalaa ja Aavalla kolme. Plus kokoaa kaksi joukkoa yhdeksi: neljä plus kolme on seitsemän.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-SUB-01': {
    beats: [
      { text: 'Rannalla on viisi simpukkaa. Aalto vie kaksi, ja jäljelle jää kolme.', more: 'Viisi miinus kaksi on kolme.', pic: 0 },
      { text: 'Saman voi hypätä: Loikka lähtee viidestä ja hyppää kaksi kertaa taaksepäin. Neljä, kolme.', more: 'Lähtökiveä ei lasketa hypyksi.', pic: 1 },
      { text: 'Yhdeksän miinus kolme: yhdeksästä kolme hyppyä taaksepäin. Kahdeksan, seitsemän, kuusi.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-ADD-SUB-01': {
    beats: [
      { text: 'Kolme ja neljä simpukkaa tulevat yhteen: seitsemän. Kun neljä lähtee pois, jää taas kolme.', more: 'Luvut 3, 4 ja 7 ovat lukuperhe. Niistä saa neljä laskua: 3 + 4 = 7, 4 + 3 = 7, 7 − 4 = 3 ja 7 − 3 = 4.', pic: 0 },
      { text: 'Loikka hyppää viidestä kolme kertaa eteenpäin ja pääsee kahdeksaan: 5 + 3 = 8.', pic: 1 },
      { text: 'Kolme hyppyä taaksepäin vie takaisin viiteen: 8 − 3 = 5. Miinus purkaa sen, minkä plus teki.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-ADD-COMM': {
    beats: [
      { text: 'Loikan korissa on kuusi ja Aavan korissa kaksi. Ne voi laskea yhteen kahdessa järjestyksessä: 2 + 6 ja 6 + 2.', pic: 1 },
      { text: 'Kumpikin antaa kahdeksan, koska korit ovat samat. Kun luvut vaihtavat paikkaa, vastaus pysyy samana.', more: 'Siksi voi aloittaa isommasta luvusta: kuudesta kaksi eteenpäin, seitsemän, kahdeksan.', pic: 1 },
    ],
    try: {
      say: 'Loikka laski 4 + 5 = 9. Paljonko on 5 + 4?',
      options: ['9', '1', '10'],
      answer: 0,
      explain: 'Samat luvut eri järjestyksessä antavat saman vastauksen: 5 + 4 = 9.',
      why: [null, '1 on 5 − 4. Nyt lasketaan yhteen, ei vähennetä.', 'Mitään ei tullut lisää, vain järjestys vaihtui. Yhteensä on yhä 9.'],
    },
  },
  'M-ADD-ASSOC': {
    beats: [
      { text: 'Kolmessa korissa on 3, 4 ja 5. Ensin lasketaan 3 + 4 = 7, sitten 7 + 5 = 12.', pic: 1 },
      { text: 'Toinen tapa: ensin 4 + 5 = 9, sitten 3 + 9 = 12. Sulut näyttävät, mitkä lasketaan ensin, ja vastaus on sama.', more: 'Valitse helppo pari. Laskussa 6 + 4 + 3 kannattaa ensin laskea 6 + 4 = 10. Sitten 10 + 3 = 13.', pic: 1 },
    ],
    try: {
      say: '(2 + 8) + 5 = 15. Paljonko on 2 + (8 + 5)?',
      options: ['15', '13', '10'],
      answer: 0,
      explain: 'Kummassakin laskussa ovat mukana samat kolme lukua: 8 + 5 = 13 ja 2 + 13 = 15.',
      why: [null, '13 on vasta sulkujen sisältä: 8 + 5. Lisää vielä 2.', '10 on 2 + 8. Viisi jäi pois.'],
    },
  },
  'M-SYM-PLUS': {
    beats: [
      { text: 'Lammessa ui kaksi kalaa, ja sinne ui vielä yksi. Nyt kaloja on kolme.', more: 'Kun tulee lisää, kirjoitetaan plusmerkki: 2 + 1 = 3.', pic: 0 },
      { text: 'Rannalla on kolme simpukkaa, ja aallot tuovat vielä kaksi. Tuli lisää, joten plus: 3 + 2 = 5.', pic: 1 },
      { text: 'Plus sopii myös, kun kaksi joukkoa laitetaan yhteen. Loikan kolme marjaa ja Aavan kaksi marjaa samaan koriin: 3 + 2.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-SYM-MINUS': {
    beats: [
      { text: 'Oksalla on neljä kukkaa. Aava poimii yhden pois, ja jää kolme.', more: 'Kun otetaan pois, kirjoitetaan miinusmerkki: 4 − 1 = 3.', pic: 0 },
      { text: 'Viisi kalaa, ja kaksi ui pois. Lähti pois, joten miinus: 5 − 2 = 3.', pic: 1 },
      { text: 'Miinus kertoo myös eron. Loikalla on viisi kiveä ja Aavalla kolme, joten Loikalla on kaksi enemmän: 5 − 3 = 2.', more: 'Tee pareja: kolme paria syntyy, ja Loikalta jää kaksi kiveä ilman paria.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-SYM-EQUAL': {
    beats: [
      { text: 'Vaa’assa on samanlaisia kiviä: vasemmalla viisi, oikealla neljä. Kun oikealle lisätään yksi, vaaka on suorassa.', more: 'Merkki = kertoo, että molemmilla puolilla on yhtä paljon: 5 = 4 + 1.', pic: 0 },
      { text: 'Vasemmalla on 3 + 1 eli neljä kiveä, oikealla kaksi. Oikealle lisätään kaksi, ja vaaka on suorassa: 3 + 1 = 2 + 2.', pic: 1 },
      { text: 'Varo: = ei tarkoita, että vastaus tulee perään. Jos kakkosen viereen laitetaan neljä, oikealla on kuusi kiveä ja vaaka kallistuu.', more: '3 + 1 = 2 + 4 ei pidä paikkaansa, koska neljä ei ole yhtä paljon kuin kuusi.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-ARITH-01': {
    beats: [
      { text: 'Kolme kalaa, ja tulee kaksi lisää: nyt on viisi. Laskulauseena: 3 + 2 = 5.', pic: 0 },
      { text: 'Viisi kalaa, ja kaksi ui pois: jää kolme. Laskulauseena: 5 − 2 = 3.', pic: 1 },
      { text: 'Tarina muutetaan merkeiksi pala kerrallaan. Pesässä kuusi munaa, lintu munii kolme lisää, nyt on yhdeksän: 6 + 3 = 9.', pic: 2 },
    ],
    try: {
      say: 'Lammessa on kuusi kalaa. Kaksi ui pois, ja jää neljä. Mikä laskulause kertoo tämän?',
      options: ['6 − 2 = 4', '6 + 2 = 8', '6 − 2 = 3'],
      answer: 0,
      explain: 'Alussa kuusi, pois ui kaksi, jäi neljä: 6 − 2 = 4.',
      why: [null, 'Kalat uivat pois, joten määrä pienenee: miinus.', 'Merkit ovat oikein, mutta 6 − 2 on 4, ei 3.'],
    },
  },
  'M-SUB-02': {
    beats: [
      { text: 'Aavalla on neljä kaislaa ja Loikalla kuusi. Tehdään pareja: neljä paria syntyy, ja Loikalta jää kaksi ilman paria.', pic: 1 },
      { text: 'Ilman paria jääneet kertovat eron: 6 − 4 = 2. Yhtään kaislaa ei viety pois, silti lasketaan miinuksella.', more: 'Miinus kertoo, kuinka monta enemmän toisella on.', pic: 1 },
    ],
    try: {
      say: 'Loikalla on 7 simpukkaa ja Aavalla 4. Montako enemmän Loikalla on?',
      options: ['3', '11', '4'],
      answer: 0,
      explain: 'Pareja tulee neljä, ja Loikalta jää kolme ilman paria: 7 − 4 = 3.',
      why: [null, '11 on kaikki simpukat yhteensä. Nyt kysytään eroa.', '4 on Aavan simpukat. Kysytään, montako Loikalla on enemmän.'],
    },
  },
  'M-MENTAL-01': {
    beats: [
      { text: '38 + 7: seitsemän jaetaan osiin 2 ja 5. Kaksi täydentää 38:n tasan 40:een, ja 40 + 5 = 45.', more: 'Lukusuoralla tämä on kaksi hyppyä: ensin 2 tasakymppiin, sitten 5 lisää.', pic: 0 },
      { text: 'Miinuksessa samoin: 53 − 8. Kahdeksan jaetaan osiin 3 ja 5: ensin 53 − 3 = 50, sitten 50 − 5 = 45.', pic: 2 },
      { text: 'Ison luvun voi jakaa kymppeihin ja ykkösiin: 24 = 20 + 4. Siis 46 + 24: ensin 20 eteenpäin 66:een, sitten 4 lisää: 70.', pic: 3 },
    ],
    try: 'auto',
  },
  'M-ADD-FACT-10': {
    beats: [
      { text: 'Loikka laskee 2 + 6 ja hyppää kakkosesta kuusi kertaa. Aava aloittaa isommasta, kuutosesta, ja pääsee kahdella hypyllä samaan kahdeksaan.', pic: 0 },
      { text: 'Tuplat kannattaa muistaa. Peili tekee neljälle simpukalle kaksoset: 4 + 4 = 8.', pic: 1 },
      { text: 'Lähes tupla: 3 + 4 on tupla 3 + 3 ja yksi lisää. Kuusi ja yksi on seitsemän.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-SUB-FACT-10': {
    beats: [
      { text: 'Lautasella on seitsemän simpukkaa. Loikka syö kolme, ja jäljelle jää neljä: 7 − 3 = 4.', pic: 0 },
      { text: '9 − 6: ajattele, montako kuuteen pitää lisätä, että tulee yhdeksän. Kuudesta yhdeksään on kolme hyppyä, joten 9 − 6 = 3.', pic: 1 },
      { text: 'Kun otetaan pois vähän, voi laskea taaksepäin. 8 − 2: seitsemän, kuusi.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-ADD-FACT-01': {
    beats: [
      { text: 'Kuusi simpukkaa, ja aallot tuovat kolme lisää. Tuli lisää, joten plus: 6 + 3 = 9.', pic: 0 },
      { text: 'Kuusi simpukkaa, ja aallot vievät kolme pois. Lähti pois, joten miinus: 6 − 3 = 3.', more: 'Samat luvut, eri merkki, eri vastaus.', pic: 1 },
      { text: 'Tarinan sanat kertovat merkin: oli seitsemän, kaksi pois, jäi viisi. Merkeillä se on 7 − 2 = 5.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-ADD-SUB-SELECT': {
    beats: [
      { text: 'Lautalla on kuusi kaislaa, ja mukaan tulee kaksi lisää. Määrä kasvaa, joten plus: 6 + 2 = 8.', pic: 1 },
      { text: 'Kysy aina, mitä tapahtui: tuliko lisää vai lähtikö pois? Kun tulee lisää, lasketaan plus, ja kun lähtee pois tai verrataan, miinus.', more: 'Pelkkä sana ei aina riitä. Aavalla oli 5 kiveä, hän sai lisää, ja nyt hänellä on 8. Montako hän sai? Tässä lasketaan 8 − 5 = 3, vaikka tarinassa sanotaan lisää.', pic: null },
    ],
    try: {
      say: 'Loikalla on 9 kiveä ja Aavalla 4. Millä laskulla selviää, montako enemmän Loikalla on?',
      options: ['9 − 4', '9 + 4', '4 − 9'],
      answer: 0,
      explain: 'Kahta määrää verrataan, joten isommasta otetaan pienempi: 9 − 4 = 5.',
      why: [null, '9 + 4 kertoisi, montako kiveä on yhteensä.', 'Isommasta otetaan pienempi: 9 − 4, ei 4 − 9.'],
    },
  },
  'M-ADD-20': {
    beats: [
      { text: '8 + 5: ruudukossa on jo kahdeksan. Kaksi simpukkaa täyttää kympin, ja viidestä jää kolme: 10 + 3 = 13.', pic: 0 },
      { text: 'Lukusuoralla sama: kahdeksasta ensin kaksi hyppyä kymppiin, sitten loput kolme. 8 + 2 + 3 = 13.', pic: 1 },
      { text: 'Jos kymppi on jo valmiina, lasketaan vain ykköset. 12 + 4: kaksi ja neljä on kuusi, joten 16.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-SUB-20': {
    beats: [
      { text: '14 − 6: ensin pois irralliset neljä, niin jää tasan kymmenen. Kuudesta on vielä kaksi ottamatta: 10 − 2 = 8.', pic: 0 },
      { text: 'Lukusuoralla sama: neljästätoista neljä hyppyä taaksepäin kymppiin, sitten vielä kaksi. Loikka päätyy kahdeksaan.', pic: 1 },
      { text: 'Tai ajattele plussaa: kuudesta kymppiin on neljä ja kympistä neljääntoista neljä. Yhteensä 4 + 4 = 8.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-ADD-100': {
    beats: [
      { text: '34 + 25: ensin niput lautalle, 3 + 2 = 5 nippua eli 50. Sitten irtokaislat 4 + 5 = 9, joten yhteensä 59.', pic: 0 },
      { text: '47 + 35: niput 4 + 3 = 7 eli 70, irtokaisloja 7 + 5 = 12. Kymmenestä irtokaislasta sidotaan uusi nippu: 80 + 2 = 82.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-SUB-100': {
    beats: [
      { text: '68 − 25: ensin viisi irtokaislaa pois, sitten kaksi nippua. Jäljelle jää 4 nippua ja 3 irtokaislaa eli 43.', pic: 0 },
      { text: '52 − 17: kahdesta irtokaislasta ei voi ottaa seitsemää. Avataan yksi nippu, niin irtokaisloja on 12.', more: '12 − 7 = 5, ja nippuja on enää neljä. Yksi nippu pois: jää 3 nippua ja 5 irtokaislaa eli 35. Älä laske väärin päin 7 − 2.', pic: 1 },
      { text: 'Tarkista lisäämällä takaisin: 35 + 17 = 52. Tuli alkuperäinen luku, joten lasku on oikein.', pic: 2 },
    ],
    try: 'auto',
  },
};
