import type { PageText } from '../text';

/** UM-04 Osuuksien purjehdus: reciprocals, multiplying and dividing fractions, and checked decimal calculations. */
export const TEXT: Record<string, PageText> = {
  'M79-RECIP-01': {
    beats: [
      { text: 'Yhteen kokonaiseen mahtuu neljä 1/4-palaa. Siksi luvun 1/4 käänteisluku on 4: 1/4 · 4 = 1.', pic: 1 },
      { text: 'Paloja 2/5 mahtuu yhteen kokonaiseen kaksi ja vielä puolikas, eli 5/2. Luvun 2/5 käänteisluku on siis 5/2.', pic: 2 },
      { text: 'Käänteisluku saadaan vaihtamalla osoittaja ja nimittäjä: luvusta 3/5 tulee 5/3. Luvun ja sen käänteisluvun tulo on aina 1: 3/5 · 5/3 = 15/15 = 1.', more: 'Kokonaisluku 4 on murtolukuna 4/1, joten sen käänteisluku on 1/4. Nollalla ei ole käänteislukua.', pic: 0 },
    ],
    try: 'auto',
  },
  'M79-FRAC-MUL': {
    beats: [
      { text: 'Lasku 2/3 · 3/4 tarkoittaa kahta kolmasosaa kolmesta neljäsosasta. Neliöstä otetaan ensin 3/4 ja siitä 2/3, jolloin päällekkäin jää 6 ruutua 12:sta.', pic: 0 },
      { text: 'Puolet kolmesta neljäsosasta on 1/2 · 3/4. Ruutuja on kaikkiaan 2 · 4 = 8 ja tummia 1 · 3 = 3, joten tulos on 3/8.', pic: 1 },
      { text: 'Sääntö: osoittajat kerrotaan keskenään ja nimittäjät keskenään. Esimerkiksi 2/3 · 3/4 = 6/12 = 1/2.', more: 'Kertolaskussa murtolukuja ei tarvitse laventaa samannimisiksi.', pic: 2 },
    ],
    try: 'auto',
  },
  'M79-FRAC-DIV': {
    beats: [
      { text: 'Lasku 3 : 1/4 kysyy, montako neljäsosaa mahtuu lukuun 3. Jokaiseen kokonaiseen mahtuu neljä, joten 3 : 1/4 = 12.', pic: 0 },
      { text: 'Kun 3/4 litraa kaadetaan 1/8 litran mukeihin, mukeja täyttyy kuusi. Tämä johtuu siitä, että 3/4 = 6/8, joten 3/4 : 1/8 = 6.', pic: 1 },
      { text: 'Jakaminen murtoluvulla on kertomista sen käänteisluvulla. Käännetään jakaja, ei jaettavaa: 2/3 : 4/5 = 2/3 · 5/4 = 10/12 = 5/6.', more: 'Tässä jakaja 4/5 on suurempi kuin jaettava 2/3. Kokonaista palaa ei mahdu, joten tulos on alle 1.', pic: 3 },
    ],
    try: 'auto',
  },
  'M79-DEC-MUL': {
    beats: [
      { text: 'Kangaspalan leveys on 0,5 m ja korkeus 0,5 m. Sen pinta-ala on 0,5 m · 0,5 m = 0,25 m², eli neljäsosa koko ruudusta.', pic: 0 },
      { text: 'Kymmenesosa kertaa kymmenesosa on sadasosa: 5 kymmenesosaa · 5 kymmenesosaa = 25 sadasosaa = 0,25. Kertominen luvulla, joka on alle 1, pienentää: 0,25 on vähemmän kuin 0,5.', more: 'Jos korkeus olisi 1,2 m, pinta-ala olisi 0,5 · 1,2 = 0,6 m². Se on enemmän kuin palalla, jonka korkeus on 1 m.', pic: 0 },
    ],
    try: {
      say: 'Paljonko on 0,3 · 0,4?',
      options: ['0,12', '1,2', '0,012', '0,7'],
      answer: 0,
      explain: '3 kymmenesosaa · 4 kymmenesosaa = 12 sadasosaa = 0,12. Kummassakin tekijässä on yksi desimaali, joten tulossa on kaksi.',
      why: [null, 'Tämä olisi 12 kymmenesosaa. Kymmenesosa kertaa kymmenesosa on sadasosa.', 'Tämä olisi 12 tuhannesosaa. Tekijöissä on yhteensä kaksi desimaalia, ei kolmea.', 'Tämä on summa 0,3 + 0,4. Kertolaskussa tulo on tässä pienempi kuin kumpikaan tekijä.'],
    },
  },
  'M79-DEC-DIV': {
    beats: [
      { text: 'Lasku 4,5 : 0,9 helpottuu, kun molemmat luvut kerrotaan kymmenellä: 45 : 9 = 5. Osamäärä ei muutu, kun jaettava ja jakaja kerrotaan samalla luvulla.', pic: 0 },
      { text: 'Jakajassa 0,25 on kaksi desimaalia, joten molemmat luvut kerrotaan sadalla. Jaettavaan 1,5 tulee nolla loppuun: 1,5 : 0,25 = 150 : 25 = 6.', pic: 1 },
      { text: 'Kun jakaja on alle 1, tulos on suurempi kuin jaettava. Lukuun 3 mahtuu kuusi 0,5:n palaa: 3 : 0,5 = 6.', pic: 2 },
    ],
    try: 'auto',
  },
  'M79-DEC-ADD': {
    beats: [
      { text: 'Aamulla satoi 4,6 mm ja illalla 0,67 mm. Luvut kirjoitetaan allekkain niin, että pilkut ja samat paikat ovat kohdakkain: 4,60 + 0,67.', more: 'Lopun nolla ei muuta lukua: 4,6 ja 4,60 ovat yhtä suuret.', pic: 0 },
      { text: 'Kymmenesosia tulee 6 + 6 = 12, joten 10 kymmenesosaa vaihdetaan yhdeksi kokonaiseksi. Sateen määrä on yhteensä 5,27 mm.', pic: 0 },
    ],
    try: {
      say: 'Paljonko on 3,5 + 0,48?',
      options: ['3,98', '3,53', '0,83'],
      answer: 0,
      explain: 'Kirjoitetaan 3,50 + 0,48. Kymmenesosia on 5 + 4 = 9 ja sadasosia 0 + 8 = 8, joten summa on 3,98.',
      why: [null, 'Luvun 3,5 viitonen on kymmenesosia, ei sadasosia. Kirjoita 3,50 ja laske samat paikat yhteen.', 'Luvut on asetettu allekkain oikeasta reunasta. Pilkkujen pitää olla kohdakkain.'],
    },
  },
  'M79-DEC-SUB': {
    beats: [
      { text: 'Kankaasta, jonka pituus on 5,4 m, leikataan 1,43 m:n pala. Kirjoitetaan 5,40 − 1,43, jotta kummassakin luvussa on yhtä monta desimaalia.', pic: 0 },
      { text: 'Sadasosiin lainataan yksi kymmenesosa, jolloin kymmenesosia jää kolme. Niistä ei voi vähentää neljää, joten lainataan vielä yksi kokonainen: tulos on 3,97 m.', pic: 0 },
      { text: 'Vähennyslaskun voi tarkistaa yhteenlaskulla: 3,97 + 1,43 = 5,40. Tulos on oikein, koska summa on sama kuin alkuperäinen pituus 5,4 m.', pic: 0 },
    ],
    try: {
      say: 'Paljonko on 6,2 − 0,35?',
      options: ['5,85', '6,15', '5,95'],
      answer: 0,
      explain: 'Kirjoitetaan 6,20 − 0,35 ja lainataan kahdesti, jolloin tulos on 5,85. Tarkistus: 5,85 + 0,35 = 6,20.',
      why: [null, 'Tässä pienempi numero on vähennetty suuremmasta joka sarakkeessa. Ylemmästä luvusta vähennetään, ja silloin pitää lainata.', 'Yksi laina unohtui. Tarkistus: 5,95 + 0,35 = 6,30, ei 6,20.'],
    },
  },
  'M79-DEC-ADD-SUB': {
    beats: [
      { example: 'Laatikko painaa 5,6 kg. Siihen lisätään 0,77 kg ja siitä otetaan pois 1,51 kg. Paljonko se painaa lopuksi?', text: 'Ensin arvioidaan pyöristetyillä luvuilla: 5,6 + 0,8 − 1,5 = 4,9. Tuloksen pitää siis olla 4 ja 5 kg:n välissä.', pic: 0 },
      { text: 'Lasketaan vaihe kerrallaan: 5,60 + 0,77 = 6,37 ja 6,37 − 1,51 = 4,86. Laatikko painaa lopuksi 4,86 kg, mikä sopii arvioon.', more: 'Vähennyslaskun voi tarkistaa yhteenlaskulla: 4,86 + 1,51 = 6,37.', pic: 0 },
    ],
    try: {
      say: 'Laatikko painaa 3,4 kg. Siihen lisätään 0,85 kg ja siitä otetaan pois 1,2 kg. Paljonko se painaa nyt?',
      options: ['3,05 kg', '5,45 kg', '4,13 kg'],
      answer: 0,
      explain: '3,40 + 0,85 = 4,25 ja 4,25 − 1,20 = 3,05. Arvio 3,4 + 0,9 − 1,2 = 3,1 sopii tulokseen.',
      why: [null, 'Myös pois otettu massa lisättiin. Pois otettu 1,2 kg pitää vähentää.', 'Luku 1,2 vähennettiin kuin se olisi 0,12. Kirjoita 1,20, jolloin pilkut ovat kohdakkain.'],
    },
  },
};
