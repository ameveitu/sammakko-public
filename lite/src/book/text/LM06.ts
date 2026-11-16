import type { PageText } from '../text';

/** LM06 Lauttarivien veistämö: equal groups, multiplication and division, the laws of multiplication and divisibility. */
export const TEXT: Record<string, PageText> = {
  'M-DIV-01': {
    beats: [
      { text: 'Kuusi marjaa jaetaan kolmeen pussiin. Jokaiseen annetaan vuorotellen yksi, kunnes marjat loppuvat.', more: 'Lopuksi jokaisessa pussissa on kaksi marjaa.', pic: 0 },
      { text: 'Jako on reilu, kun jokainen saa yhtä monta. Samat kuusi marjaa kahteen pussiin: kumpaankin tulee kolme.', more: 'Mitä vähemmän pusseja, sitä enemmän marjoja kuhunkin.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-DIV-02': {
    beats: [
      { text: 'Marjoja on kahdeksan, ja yhteen pussiin mahtuu kaksi. Täytetään pussi kerrallaan, kunnes marjat loppuvat: pusseja tulee neljä.', pic: 0 },
      { text: 'Isompaan pussiin mahtuu neljä marjaa. Samoista kahdeksasta marjasta tulee nyt vain kaksi pussia.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-MUL-01': {
    beats: [
      { text: 'Kolmeen pussiin laitetaan jokaiseen kaksi marjaa. Lasketaan kaksi kerrallaan: kaksi, neljä, kuusi.', pic: 0 },
      { text: 'Sama lyhyesti: kolme kertaa kaksi on kuusi. Kertolasku kertoo, montako yhtä suurta ryhmää on.', more: 'Merkitään 3 × 2 = 6. Se on sama kuin 2 + 2 + 2 = 6.', pic: 0 },
      { text: 'Neljä kertaa kolme: neljä pussia, ja jokaisessa kolme marjaa. Marjoja on kaksitoista.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-MUL-COMM': {
    beats: [
      { text: 'Lautalla on 2 riviä, ja kummassakin rivissä 4 paikkaa. Paikkoja on 2 × 4 = 8.', pic: 0, figure: false },
      { text: 'Piirustus käännetään neljänneskierros. Nyt rivejä on 4 ja jokaisessa 2 paikkaa, mutta paikkoja on yhä 8.', more: 'Merkitty istuin oli ylärivin oikeassa päässä. Käännön jälkeen se on alimman rivin oikeassa päässä: mikään paikka ei katoa.', pic: 1 },
      { text: 'Siksi 2 × 4 = 4 × 2. Kertolaskun luvut saa vaihtaa toisin päin, ja tulos pysyy samana.', pic: 1 },
    ],
    try: {
      say: '3 × 5 = 15. Paljonko on 5 × 3?',
      options: ['15', 'Enemmän kuin 15', 'Vähemmän kuin 15'],
      answer: 0,
      explain: '5 × 3 on sama rivistö käännettynä. Paikkoja on yhä 15.',
      why: [null, 'Kääntäminen ei tuo yhtään uutta paikkaa.', 'Kääntäminen ei vie yhtään paikkaa pois.'],
    },
  },
  'M-MUL-ASSOC': {
    beats: [
      { text: 'Kolmessa veneessä on jokaisessa neljä koria, ja jokaisessa korissa kaksi evästä. Eväät voi laskea kahdella tavalla.', pic: 1 },
      { text: 'Ensin korit: 3 × 4 = 12 koria. Niissä on 12 × 2 = 24 evästä.', pic: 1 },
      { text: 'Tai ensin yksi vene: 4 × 2 = 8 evästä. Kolmessa veneessä on 3 × 8 = 24, sama määrä.', more: 'Sulut kertovat, mikä lasketaan ensin: (3 × 4) × 2 = 3 × (4 × 2). Ryhmittely vaihtuu, eväiden määrä ei.', pic: 1 },
    ],
    try: {
      say: 'Kumpi tapa antaa enemmän eväitä: ensin korit vai ensin yksi vene?',
      options: ['Kumpikin antaa saman määrän', 'Ensin korit', 'Ensin yksi vene'],
      answer: 0,
      explain: 'Kummallakin tavalla lasketaan samat 24 evästä. Vain ryhmittely muuttuu.',
      why: [null, 'Eväitä ei tule lisää, vaikka korit lasketaan ensin.', 'Eväitä ei tule lisää, vaikka yksi vene lasketaan ensin.'],
    },
  },
  'M-MULTAB-LOW': {
    beats: [
      { text: 'Kolme riviä, ja jokaisessa viisi. Lasketaan viisi kerrallaan: 5, 10, 15, eli 3 × 5 = 15.', more: 'Viiden kertotaulu on puolet kymmenen kertotaulusta: 10 × 6 = 60, joten 5 × 6 = 30.', pic: 0 },
      { text: 'Kahden kertotaulu on tuplaamista. 2 × 7 on 7 + 7 eli 14.', pic: 1 },
      { text: 'Neljän kertotaulu on tuplan tupla. 2 × 6 = 12, ja kun tuplataan vielä, 4 × 6 = 24.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-MULDIV-01': {
    beats: [
      { text: 'Kolmessa pussissa on jokaisessa neljä marjaa: 3 × 4 = 12. Kun 12 marjaa pakataan taas neljä kerrallaan, pusseja tulee kolme.', pic: 0 },
      { text: 'Jakolasku purkaa kertolaskun. Laskusta 3 × 4 = 12 saadaan 12 : 4 = 3 ja 12 : 3 = 4.', more: 'Kaikissa kolmessa laskussa on samat luvut 3, 4 ja 12. Jakolaskussa suurin luku tulee ensin.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-DIV-FACT-01': {
    beats: [
      { example: '20 : 5 = ?', text: 'Loikka hyppii nollasta viisi kerrallaan: 5, 10, 15, 20. Hyppyjä tuli neljä, joten 20 : 5 = 4.', pic: 0 },
      { text: 'Nopein keino on kertotaulu: viisi kertaa mikä on 20? Koska 5 × 4 = 20, on 20 : 5 = 4.', pic: 2 },
    ],
    try: {
      say: 'Mikä kertolasku auttaa laskemaan 18 : 3?',
      options: ['3 × 6 = 18', '18 × 3 = 54', '3 × 3 = 9'],
      answer: 0,
      explain: '3 × 6 = 18, joten 18 : 3 = 6.',
      why: [null, 'Tarvitaan kertolasku, jonka tulos on 18, ei 54.', 'Tulos 9 ei ole 18. Etsi, monesko kolmonen antaa 18.'],
    },
  },
  'M-MUL-02': {
    beats: [
      { text: 'Neljässä pussissa on jokaisessa kolme marjaa: 4 × 3 = 12. Ensin kirjoitetaan pussien määrä, sitten marjat yhdessä pussissa.', more: 'Pitkästi sama on 3 + 3 + 3 + 3 = 12.', pic: 0 },
      { text: 'Rivistössä rivit ovat ryhmiä. Kolme riviä, joissa jokaisessa viisi, on 3 × 5.', pic: 2 },
      { text: 'Varo plusmerkkiä: 4 + 3 = 7 laskee vain pussit ja yhden pussin marjat. Kaikki marjat saa kertolaskulla 4 × 3 = 12.', pic: 3 },
    ],
    try: 'auto',
  },
  'M-DIVIS-01': {
    beats: [
      { text: '24 palloa pakataan laatikoihin, joihin mahtuu 4. Tulee 6 täyttä laatikkoa, eikä mitään jää yli: 24 on jaollinen neljällä.', pic: 0 },
      { text: 'Yksi pallo lisää: 25. Taas 6 täyttä laatikkoa, mutta 1 pallo jää yli, joten 25 ei ole jaollinen neljällä.', more: 'Jaollinen tarkoittaa, että jako menee tasan. Yli jäävää osaa sanotaan jakojäännökseksi: 25 : 4 = 6, jakojäännös 1.', pic: 1 },
      { text: 'Loikka hyppii kaksi ruutua kerrallaan. Jokainen osuma päättyy numeroon 0, 2, 4, 6 tai 8: niin tunnistaa kahdella jaollisen luvun.', more: 'Viidellä jaollinen luku päättyy numeroon 0 tai 5. Kymmenellä jaollinen luku päättyy numeroon 0.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-MULTAB-HIGH': {
    beats: [
      { text: '9 × 7 on yhdeksän riviä, joissa kussakin 7. Kymmenen riviä olisi 70, joten otetaan yksi rivi pois: 70 − 7 = 63.', pic: 0 },
      { text: '6 × 7: viisi riviä on 35. Yksi rivi lisää, ja saadaan 35 + 7 = 42.', pic: 1 },
      { text: '8 × 6 on tupla luvusta 4 × 6. Neljä riviä on 24, joten kahdeksan riviä on 24 + 24 = 48.', more: 'Myös osista voi koota: 7 × 8 on viisi riviä (40) ja kaksi riviä (16), yhteensä 56.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-DISTRIB': {
    beats: [
      { text: 'Lautan kannella on 4 riviä, ja jokaisessa rivissä 8 paikkaa. Kansi jaetaan kahteen osaan: 1 sarake ja 7 saraketta.', pic: 1 },
      { text: 'Osat lasketaan erikseen: 4 × 1 = 4 ja 4 × 7 = 28. Yhteensä 4 + 28 = 32, sama kuin 4 × 8.', pic: 1 },
      { text: 'Merkintänä 4 × (1 + 7) = 4 × 1 + 4 × 7. Kumpikin osa kerrotaan rivien määrällä, joten yhtään paikkaa ei katoa.', pic: 1 },
    ],
    try: {
      say: 'Mikä lasku antaa saman tuloksen kuin 4 × 8?',
      options: ['4 × 5 + 4 × 3', '4 × 5 + 3', '4 + 8'],
      answer: 0,
      explain: '8 = 5 + 3, joten 4 × 8 = 4 × 5 + 4 × 3 = 20 + 12 = 32.',
      why: [null, 'Myös toisessa osassa on 4 riviä: 3 pitää kertoa neljällä.', '4 + 8 laskee rivit ja yhden rivin paikat yhteen, ei kaikkia paikkoja.'],
    },
  },
  'M-MULTREL-01': {
    beats: [
      { text: 'Aavan tornissa on kaksi palikkaa. Loikan torni on kolme kertaa niin korkea: siinä on Aavan torni kolmesti, 3 × 2 = 6.', pic: 0 },
      { text: 'Kolme enemmän on eri asia: 2 + 3 = 5. Kolme kertaa niin paljon on 3 × 2 = 6.', pic: 1 },
    ],
    try: {
      say: 'Aavalla on 4 kiveä. Loikalla on kaksi kertaa niin monta. Montako kiveä Loikalla on?',
      options: ['8', '6', '2'],
      answer: 0,
      explain: 'Kaksi kertaa niin monta: Aavan kivet kahdesti, 4 + 4 = 8 eli 2 × 4 = 8.',
      why: [null, '6 on 4 + 2, eli kaksi enemmän. Kaksi kertaa niin monta on enemmän.', '2 olisi puolet Aavan kivistä.'],
    },
  },
  'M-DIVIS-02': {
    beats: [
      { text: '12 kaislaa sidotaan kimppuihin, joissa on 4 kaislaa. Kimppuja tulee 3, eikä mitään jää yli: 4 × 3 = 12.', pic: 1 },
      { text: 'Koska 12 jakautuu tasan neljän ryhmiin, 4 on luvun 12 jakaja.', pic: 1 },
      { text: 'Samaa toisesta suunnasta: 12 on luvun 4 monikerta. Luvun 4 monikertoja ovat 4, 8, 12, 16 ja niin edelleen.', more: 'Myös 0 on luvun 4 monikerta, koska 4 × 0 = 0.', pic: 1 },
    ],
    try: {
      say: 'Mikä näistä on luvun 15 jakaja?',
      options: ['5', '30', '4'],
      answer: 0,
      explain: '15 : 5 = 3 tasan, joten 5 on luvun 15 jakaja.',
      why: [null, '30 on luvun 15 monikerta, ei jakaja: 15 × 2 = 30.', '15 : 4 ei mene tasan, sillä 3 jää yli.'],
    },
  },
  'M-DIVIS-03': {
    beats: [
      { text: 'Luvut lajitellaan: 8 on luvun 2 monikerta ja 9 luvun 3 monikerta. 11 ei sovi kumpaankaan ryhmään.', pic: 1 },
      { text: 'Sama luku voi kuulua kahteen ryhmään. 12 = 2 × 6 ja 12 = 3 × 4, joten 12 on sekä luvun 2 että luvun 3 monikerta.', pic: 1 },
      { text: 'Myös nolla kuuluu molempiin, koska 2 × 0 = 0 ja 3 × 0 = 0. Nollalla ei kuitenkaan voi jakaa.', pic: 1 },
    ],
    try: {
      say: 'Mihin ryhmään luku 18 kuuluu?',
      options: ['Luvun 2 ja luvun 3 monikertoihin', 'Vain luvun 2 monikertoihin', 'Vain luvun 3 monikertoihin', 'Ei kumpaankaan'],
      answer: 0,
      explain: '18 = 2 × 9 ja 18 = 3 × 6, joten se kuuluu kumpaankin ryhmään.',
      why: [null, 'Myös 3 × 6 = 18, joten 18 on luvun 3 monikerta.', 'Myös 2 × 9 = 18, joten 18 on luvun 2 monikerta.', '18 on sekä kahden että kolmen kertotaulussa.'],
    },
  },
  'M-MULTAB-ALL': {
    beats: [
      { text: 'Kun tiedät, että 7 × 8 = 56, saat 7 × 9 helposti. Jokaiseen seitsemään riviin tulee yksi lisää: 56 + 7 = 63.', pic: 0 },
      { text: 'Samoin alaspäin: 6 × 9 = 54. Jokaisesta kuudesta rivistä otetaan yksi pois: 6 × 8 = 54 − 6 = 48.', pic: 1 },
      { text: 'Montako seitsemän riviä tarvitaan, jotta tulee 42? Rivejä lisätään, kunnes tulee 42: kuusi riviä, 6 × 7 = 42.', pic: 2 },
    ],
    try: 'auto',
  },
};
