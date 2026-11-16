import type { PageText } from '../text';

/** SCI07 Aineiden rantapaja: identifying materials by properties, states of matter and the idea of a substance. */
export const TEXT: Record<string, PageText> = {
  'ENV-CHEM-MATERIAL-ID-01': {
    beats: [
      { text: 'Rantapajassa on kolme palaa: puuta, metallia ja lasia. Jokaisesta mitataan samat asiat: imeekö se vettä, taipuuko se ja päästääkö se valoa läpi.', more: 'Materiaali on se aine, josta esine on tehty.', pic: 0, figure: false },
      { text: 'Näistä paloista puu imee vettä. Metalli taipuu mutta ei päästä valoa läpi, ja lasi päästää valoa läpi mutta ei taivu.', pic: 0, figure: false },
      { example: 'Pala A on kuppi. Se ei imenyt vettä, taipui 19 mm eikä päästänyt valoa läpi. Mistä materiaalista se on?', text: 'Pala A taipuu eikä päästä valoa läpi, joten se on metallia. Kupin muoto ei kerro materiaalia, koska kupin voi tehdä mistä vain.', pic: 0, figure: false },
    ],
    try: 'auto',
  },
  'ENV-CHEM-MATERIAL-COMPARE-01': {
    beats: [
      { text: 'Kaikille paloille tehdään sama vesikoe. Pala A imi vettä 0 %, pala B 22 % ja pala C 0 %.', pic: 0, figure: false },
      { text: 'Sateelta suojaavaan kanteen tarvitaan pala, joka imee vettä vähiten. A ja C sopivat yhtä hyvin, koska kumpikaan ei imenyt vettä lainkaan.', pic: 0, figure: false },
      { text: 'Vertaa aina samaa ominaisuutta, joka on mitattu samalla tavalla. Paras pala riippuu siitä, mihin sitä tarvitaan.', more: 'Taipuvaan kiinnittimeen valittaisiin pala, joka taipuu eniten.', pic: 0, figure: false },
    ],
    try: 'auto',
  },
  'ENV-CHEM-MATERIAL-01': {
    beats: [
      { text: 'Retkikotelon kanneksi tarvitaan pala, joka ei ime sadevettä. Palat A, B ja C testataan samalla vesikokeella.', pic: 0, figure: false },
      { text: 'Pala B imi vettä 22 %, palat A ja C eivät lainkaan. Vettä imevä B on puuta, eikä se sovi kanneksi.', pic: 0, figure: false },
      { text: 'Valinta perustellaan mitatulla ominaisuudella, ei palan muodolla tai värillä. Sama pala ei ole paras joka käyttöön.', more: 'Ikkunaan valittaisiin pala, joka päästää valoa läpi eniten.', pic: 0, figure: false },
    ],
    try: 'auto',
  },
  'ENV-CHEM-PROP-01': {
    beats: [
      { text: 'Havainto ”Samalla kuormalla pala taipuu 6 mm” kertoo, miten pala käyttäytyy. Kuka tahansa voi mitata saman, joten se kertoo ominaisuudesta: taipuisuudesta.', pic: null },
      { text: '”Kiiltävä pala on minusta paras” on mielipide. Toinen voi olla eri mieltä, joten se ei kerro materiaalin ominaisuutta.', pic: null },
      { text: 'Ominaisuuksia ovat myös läpinäkyvyys ja kovuus. Ne tarkistetaan kokeella: paljonko valoa pääsee läpi ja naarmuuntuuko pinta.', pic: null },
    ],
    try: {
      say: 'Mikä näistä on mielipide eikä materiaalin ominaisuus?',
      options: ['Vihreä pala on minusta kaunis.', 'Valosta 85 % pääsee läpi.', 'Koetin ei naarmuta pintaa.'],
      answer: 0,
      explain: 'Mielipide kertoo, mistä joku pitää, ja toinen voi olla eri mieltä. Valon läpäisyn ja kovuuden voi mitata tai tarkistaa kokeella.',
      why: [null, 'Tämä on mitattu tulos: se kertoo läpinäkyvyydestä.', 'Tämän voi tarkistaa kokeella: se kertoo kovuudesta.'],
    },
  },
  'ENV-CHEM-STATE-01': {
    beats: [
      { text: 'Jääpala pitää muotonsa ja kokonsa, vaikka sen siirtää toiseen astiaan. Jää on kiinteää ainetta.', more: 'Aineen olomuoto voi olla kiinteä, neste tai kaasu.', pic: null },
      { text: 'Nestemäinen vesi virtaa astian muotoon, mutta sen tilavuus pysyy samana. Vesihöyry on kaasua: se täyttää koko suljetun astian.', more: 'Vesihöyry on näkymätöntä. Näkyvä sumu on pieniä vesipisaroita eli nestettä.', pic: null },
      { text: 'Kaasua voi puristaa kokoon, koska sen hiukkasten välissä on paljon tyhjää. Nestettä ja kiinteää ainetta ei juuri voi puristaa.', pic: null },
    ],
    try: 'auto',
  },
  'ENV-CHEM-STATECHANGE-01': {
    beats: [
      { text: 'Jäätä lämmitetään, kunnes lämpötila on +8 °C. Kiinteä jää muuttuu nesteeksi: tätä muutosta kutsutaan sulamiseksi.', more: 'Jää alkaa sulaa, kun sen lämpötila nousee 0 °C:seen.', pic: 0, figure: false },
      { text: 'Neste → kiinteä on jäätyminen ja neste → kaasu haihtuminen. Kaasu → neste on tiivistyminen.', more: 'Vesi haihtuu ilman kiehumistakin. Siksi märkä pyykki kuivuu narulla.', pic: null },
      { text: 'Kun olomuoto muuttuu, vesi pysyy vetenä eikä sen massa muutu. Suljetussa astiassa vettä on lopussa yhtä paljon kuin alussa.', pic: null },
    ],
    try: 'auto',
  },
  'CHEM79-SUBSTANCE-01': {
    beats: [
      { text: 'Laatikko on esine eli valmis tavara, jota käytetään. Se on tehty puusta: puu on laatikon materiaali.', pic: null },
      { text: 'Puu sisältää selluloosaa ja muita aineita. Selluloosa on kemiallinen aine: sillä on aina sama koostumus, ja sillä on oma nimensä.', pic: null },
      { text: 'Samaa esinettä voi tehdä eri materiaaleista, ja yksi materiaali voi sisältää monta kemiallista ainetta. Teräsruuvin materiaali on teräs, jossa on rautaa ja hiiltä.', pic: null },
    ],
    try: 'auto',
  },
};
