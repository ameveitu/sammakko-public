import type { PageText } from '../text';

/** LM10 Nollatason jäälahti: negative numbers on the thermometer and the number line, comparison and directed changes. */
export const TEXT: Record<string, PageText> = {
  'M-NEG-01': {
    beats: [
      { text: 'Lämpömittarin nolla on raja. Nollan alle jäävät luvut ovat negatiivisia: −4 °C tarkoittaa neljää astetta pakkasta.', more: 'Päivällä pinta nousee neljä astetta nollan yläpuolelle: 4 °C.', pic: 0 },
      { text: 'Mitä alempana pinta on, sitä kylmempää. Lahdella on −8 °C ja pihalla −2 °C, joten lahdella on kylmempää.', pic: 1 },
      { text: 'Illalla on 3 °C, ja lämpötila laskee viisi astetta. Kolme astetta vie nollaan ja kaksi nollan alle: −2 °C.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-NEG-02': {
    beats: [
      { text: 'Lukusuoralla luvut kasvavat oikealle. Negatiiviset luvut ovat nollan vasemmalla puolella: −1, −2, −3 ja niin edelleen.', more: 'Luvut −4 ja 4 ovat yhtä kaukana nollasta, mutta eri puolilla.', pic: 0 },
      { text: 'Mitä vasemmempana, sitä pienempi luku. −6 on pienempi kuin −2, vaikka kuusi on muuten isompi kuin kaksi.', pic: 1 },
      { text: 'Sukeltaja on kohdassa −2 metriä ja sukeltaa kolme metriä syvemmälle. Syvemmälle on lukusuoralla vasemmalle: −2 − 3 = −5.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-NEG-03': {
    beats: [
      { text: '−7 on seitsemän askelta nollasta vasemmalle ja −3 vain kolme. Siksi −7 on pienempi: −7 < −3.', pic: 0 },
      { text: 'Lämpömittarissa sama näkyy pystysuunnassa. Aamulla oli −3 °C ja illalla −7 °C: ilta oli kylmempi, koska pinta oli alempana.', pic: 1 },
    ],
    try: 'auto',
  },
  'M-NEG-04': {
    beats: [
      { text: 'Nousu vie lukusuoralla oikealle ja lasku vasemmalle. Tässä lähdetään luvusta 2, ja muutos +4 vie neljä askelta oikealle lukuun 6.', pic: 1 },
      { text: 'Nollan kohdalla ei pysähdytä. Kun luvusta 2 lasketaan viisi askelta, kaksi askelta vie nollaan ja kolme sen yli: −3.', pic: 0, figure: false },
    ],
    try: {
      say: 'Lämpötila on 3 °C, ja se laskee 7 astetta. Mikä on uusi lämpötila?',
      options: ['−4 °C', '−10 °C', '4 °C'],
      answer: 0,
      explain: 'Kolme astetta alas vie nollaan ja neljä astetta vielä nollan alle: 3 − 7 = −4.',
      why: [null, 'Kolme astetta vie nollaan, ja loput neljä vievät lukuun −4, ei −10.', 'Tämä on 7 − 3. Lähtöluku on 3, ja siitä mennään seitsemän astetta alas.'],
    },
  },
};
