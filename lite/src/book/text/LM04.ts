import type { PageText } from '../text';

/** LM04 Kimppujen venevaja: halving, parts of a number, tens and ones, pairs and equal hops. */
export const TEXT: Record<string, PageText> = {
  'M-NUM-17': {
    beats: [
      { text: 'Kahdeksan simpukkaa jaetaan vuorotellen: yksi Loikalle, yksi Aavalle. Lopuksi kummallakin on neljä.', more: 'Neljä ja neljä on kahdeksan. Siksi neljä on puolet kahdeksasta.', pic: 0 },
      { text: 'Puoliksi jaettuna kummallakin on yhtä monta. Loikalla on viisi käpyä ja Aavalla kolme, joten Loikka antaa yhden Aavalle.', more: 'Nyt kummallakin on neljä käpyä, ja jako on puoliksi.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-PLACE-01': {
    beats: [
      { text: 'Kaislat lasketaan yksi kerrallaan. Kun kaisloja on kymmenen, ne sidotaan yhdeksi nipuksi.', more: 'Yhdessä nipussa on aina kymmenen kaislaa.', pic: 0 },
      { text: 'Kaisloja on kolmetoista. Kymmenen sidotaan nippuun, ja kolme jää irralleen.', pic: 1 },
      { text: 'Kaksikymmentäneljä kaislaa on kaksi nippua ja neljä irtokaislaa. Niput lasketaan kymmenin: kymmenen, kaksikymmentä.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-PLACE-02': {
    beats: [
      { text: 'Kolme nippua ja neljä irtokaislaa. Ensin niput kymmenin: 10, 20, 30, ja sitten irtokaislat: 31, 32, 33, 34.', pic: 0 },
      { text: 'Luvussa 34 ensimmäinen numero 3 kertoo niput eli kympit. Viimeinen numero 4 kertoo irtokaislat eli ykköset.', pic: 0 },
      { text: 'Neljäkymmentä on neljä nippua eikä yhtään irtokaislaa. Siksi luvun 40 lopussa on nolla.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-NUM-18': {
    beats: [
      { text: 'Kympin ruudukkoon tulee seitsemän simpukkaa, ja kolme ruutua jää tyhjäksi. Seitsemän ja kolme on yhdessä kymmenen.', pic: 0 },
      { text: 'Seitsemän simpukkaa voi jakaa kahteen osaan monella tavalla: viisi ja kaksi, neljä ja kolme, kuusi ja yksi. Kaikkiaan niitä on aina seitsemän.', pic: 1 },
      { text: 'Seitsemästä simpukasta näkyy neljä, loput ovat kupin alla. Laske neljästä eteenpäin: viisi, kuusi, seitsemän – kupin alla on kolme.', pic: 2 },
    ],
    try: {
      say: 'Simpukoita on kahdeksan, ja näkyvissä on viisi. Montako on kupin alla?',
      options: ['3', '5', '8', '4'],
      answer: 0,
      explain: 'Laske viidestä kahdeksaan: kuusi, seitsemän, kahdeksan. Kupin alla on kolme, koska viisi ja kolme on kahdeksan.',
      why: [null, 'Viisi on näkyvissä olevat. Kysyttiin piilossa olevia.', 'Kahdeksan on kaikki simpukat yhteensä.', 'Viisi ja neljä on yhdeksän, ei kahdeksan.'],
    },
  },
  'M-PLACE-03': {
    beats: [
      { text: 'Neljä nippua ja kuusi irtokaislaa ovat neljä kymppiä ja kuusi ykköstä. 46 on 40 ja 6.', pic: 0 },
      { text: 'Avataan yksi nippu, ja sen kymmenen kaislaa siirtyvät irtokaislojen luo. Nyt on kolme nippua ja 16 irtokaislaa, mutta kaisloja on yhä 46.', pic: 1 },
      { text: 'Sama käy kaikille luvuille. 23 on kaksi nippua ja kolme irtokaislaa, tai yksi nippu ja kolmetoista irtokaislaa.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-NUM-15': {
    beats: [
      { text: 'Kuusi vierasta istuu pareittain: tulee kolme paria, eikä kukaan jää yksin. Silloin määrä on parillinen.', pic: 1 },
      { text: 'Seitsemästä vieraasta tulee kolme paria, ja yksi jää ilman paria. Silloin määrä on pariton.', more: 'Parillisesta määrästä jokainen saa parin. Parittomasta jää aina yksi yli.', pic: null },
    ],
    try: {
      say: 'Laiturille tulee viisi vierasta. Saako jokainen parin?',
      options: ['Ei, yksi jää ilman paria', 'Kyllä, kaikki saavat parin'],
      answer: 0,
      explain: 'Viidestä vieraasta tulee kaksi paria, ja yksi jää yksin. Siksi viisi on pariton.',
      why: [null, 'Kaksi paria on neljä vierasta. Viides jää ilman paria.'],
    },
  },
  'M-NUM-EQUALSTEP-SEQ': {
    beats: [
      { text: 'Loikka hyppää aina kaksi eteenpäin: 2, 4, 6, 8, 10. Joka hypyllä luku kasvaa kahdella.', pic: 0 },
      { text: 'Pidempi hyppy, viisi kerrallaan: 0, 5, 10, 15, 20. Taas kaikki hypyt ovat yhtä pitkiä.', pic: 1 },
      { text: 'Hypyn pituuden näet, kun katsot, paljonko luku kasvaa kiveltä seuraavalle. Jonossa 0, 10, 20, 30 hyppy on kymmenen, joten seuraava on 40.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-NUM-MULTIPLE-INTRO': {
    beats: [
      { text: 'Loikka lähtee nollasta ja hyppää kolme kerrallaan: 3, 6, 9, 12. Väliin jääviin kiviin hän ei osu.', pic: 0 },
      { text: 'Viisi kerrallaan: 5, 10, 15, 20. Neljännellä hypyllä Loikka on kivellä 20.', pic: 1 },
    ],
    try: {
      say: 'Loikka hyppää nollasta kaksi kerrallaan. Osuuko hän kivelle 5?',
      options: ['Ei', 'Kyllä'],
      answer: 0,
      explain: 'Kahden hypyt nollasta osuvat kiville 2, 4, 6 ja 8. Kivi 5 jää neljän ja kuuden väliin.',
      why: [null, 'Neljästä hypätään suoraan kuuteen, joten viisi jää väliin.'],
    },
  },
  'M-NUM-16': {
    beats: [
      { text: 'Kivissä on luvut 5, 10, 15 ja 20. Luku kasvaa joka kerta viidellä, joten hyppy on viisi.', more: 'Nämä ovat viiden hypyt nollasta lähtien.', pic: 0 },
      { text: 'Loikka hyppää kaksi kerrallaan ja Aava kolme kerrallaan. Molemmat osuvat kiville 6 ja 12.', more: 'Ensimmäinen yhteinen kivi nollan jälkeen on 6.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-PLACE-04': {
    beats: [
      { text: 'Kymmenen 10 euron seteliä vaihdetaan yhteen 100 euron seteliin. Kymmenen satasta vaihdetaan tuhanteen.', more: 'Jokainen paikka on kymmenen kertaa edellinen: 1, 10, 100, 1000.', pic: 0 },
      { text: 'Kassaan tulee 3405 euroa: 3 tuhatta, 4 sataa, 0 kymppiä ja 5 ykköstä. Kymppien lokero on tyhjä, joten sen paikalle kirjoitetaan 0.', pic: 1 },
      { text: 'Kassassa 2061 euroa satasten lokero on tyhjä. Ilman nollaa luku olisi 261, ja numerot siirtyisivät väärille paikoille.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-PLACE-05': {
    beats: [
      { text: 'Luku 3405 puretaan numero kerrallaan: 3000 + 400 + 5. Kymppien paikalla on 0, joten siitä ei tule lisättävää.', more: 'Luvussa nolla silti pitää paikkaa. Ilman sitä luku olisi 345.', pic: 0 },
      { text: 'Samaa lukua voi purkaa monella tavalla. 340 on 3 sataa ja 4 kymppiä, mutta myös 34 kymppiä, koska satanen on kymmenen kymppiä.', pic: 1 },
      { text: 'Toisin päin: kymmenen kymppiä vaihdetaan yhdeksi sataseksi. Siksi 13 kymppiä on 1 sata ja 3 kymppiä eli 130.', pic: 2 },
    ],
    try: 'auto',
  },
};
