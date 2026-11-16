import type { PageText } from '../text';

// Book presentation only: legacy generated feedback and stored item identity stay unchanged.
const physicalFeedback = (text: string): string => text.replaceAll('Vain olomuoto tai sekoittuminen muuttui', 'Vain muoto, olomuoto tai sekoittuminen muuttui');

/** SCI18 Muutosten kidepaja: physical and chemical change, reactions, conservation, energy and reaction rate. */
export const TEXT: Record<string, PageText> = {
  'ENV-CHEM-BURN-01': {
    beats: [
      { text: 'Puupala palaa. Palamiseen tarvitaan puun lisäksi ilmasta happea.', more: 'Puu on suurimmaksi osaksi selluloosaa, kuten kuvan kortti kertoo.', pic: 0 },
      { text: 'Palaessa syntyy hiilidioksidia ja vesihöyryä. Ne ovat näkymättömiä kaasuja, ja siksi puu näyttää katoavan.', more: 'Tuhkaksi jää se osa puusta, joka ei pala.', pic: 0 },
      { example: 'Syntyikö palamisessa uusi aine?', text: 'Syntyi: hiilidioksidia ja vesihöyryä ei ollut alussa. Kun syntyy uusi aine, muutos on kemiallinen eli reaktio.', pic: 0 },
    ],
    try: 'auto',
  },
  'CHEM79-CHANGE-PHYS': {
    feedbackText: physicalFeedback,
    beats: [
      { text: 'Rautapala taipuu, mutta pysyy kiinteänä. Ennen ja jälkeen aine on samaa rautaa (Fe): vain palan muoto muuttui.', pic: 0 },
      { text: 'Kun uutta ainetta ei synny, muutos on fysikaalinen. Sulaminen, taipuminen ja liukeneminen ovat fysikaalisia muutoksia.', pic: 0 },
      { text: 'Kemiallisessa muutoksessa syntyy uusi aine. Kun rauta ruostuu, raudasta, hapesta ja vedestä syntyy ruostetta, joka on eri ainetta kuin rauta.', more: 'Kuplat eivät aina tarkoita uutta ainetta. Kiehuvan veden kuplat ovat vesihöyryä eli samaa vettä.', pic: 0 },
    ],
    try: 'auto',
  },
  'CHEM79-REACTION-01': {
    feedbackText: physicalFeedback,
    beats: [
      { text: 'Taipunut rautapala näyttää erilaiselta kuin suora pala. Ainekortti kertoo, että ennen ja jälkeen aine on samaa kiinteää rautaa (Fe).', pic: 0 },
      { text: 'Ulkonäön muutos ei yksin todista uuden aineen syntyä. Täytyy tietää, mitä aineita on alussa ja mitä lopussa.', pic: 0 },
      { text: 'Kemiallisessa reaktiossa lopussa on aineita, joita alussa ei ollut. Esimerkiksi kun magnesium palaa, syntyy valkoista magnesiumoksidia.', more: 'Uuteen aineeseen voivat viitata esimerkiksi värin muutos, kaasun synty tai lämmön vapautuminen. Varmuus saadaan vasta, kun aineet tunnistetaan.', pic: 0 },
    ],
    try: 'auto',
  },
  'CHEM79-REACT-PROD': {
    beats: [
      { text: 'Vety ja happi reagoivat, ja syntyy vettä: 2 H₂ + O₂ → 2 H₂O. Nuolen vasemmalla puolella ovat aineet alussa, oikealla lopussa.', pic: 0 },
      { text: 'Lähtöaineet reagoivat ja kuluvat, ja reaktiotuotteet syntyvät reaktiossa. Kun hiili palaa, hiili ja happi ovat lähtöaineita ja hiilidioksidi on reaktiotuote.', pic: 0 },
      { text: 'Sama aine voi olla yhdessä reaktiossa lähtöaine ja toisessa tuote. Kun vettä hajotetaan sähkövirralla, vesi on lähtöaine ja vety ja happi ovat tuotteita.', pic: 0 },
    ],
    try: 'auto',
  },
  'CHEM79-MATTER-CONS': {
    beats: [
      { text: 'Suljetussa astiassa kalsiumkarbonaatti hajoaa kalsiumoksidiksi ja hiilidioksidiksi. Vaaka näyttää alussa 800 mg ja lopussa 800 mg.', pic: 0 },
      { text: 'Reaktiossa atomit järjestyvät uusiksi aineiksi, mutta niitä ei synny eikä katoa. Siksi massa säilyy: se on yhtä suuri alussa ja lopussa.', pic: 0 },
      { text: 'Avoimesta astiasta hiilidioksidi karkaa ilmaan, ja vaa’an lukema pienenee. Massa ei silti katoa, sillä karannut kaasu on astian ulkopuolella.', more: 'Siksi massan säilymistä tutkitaan suljetussa astiassa, jossa kaikki aineet, myös kaasut, pysyvät punnittavina.', pic: 0 },
    ],
    try: 'auto',
  },
  'CHEM79-REACTION-ENERGY': {
    beats: [
      { text: 'Kun kalsiumkarbonaatti hajoaa kalsiumoksidiksi ja hiilidioksidiksi, reaktio ottaa ympäristöstä 44 energiayksikköä. Ympäristö viilenee.', pic: 0 },
      { text: 'Reaktio, joka sitoo energiaa ympäristöstä, on endoterminen. Reaktio, joka luovuttaa energiaa ympäristöön, on eksoterminen, ja silloin ympäristö lämpenee.', pic: 0 },
      { text: 'Esimerkiksi palaminen on eksoterminen reaktio: nuotio lämmittää ympäristöään. Energiaa ei synny eikä katoa, se vain siirtyy.', more: 'Moni reaktio tarvitsee alkuun hieman energiaa, esimerkiksi tulitikun liekin. Kokonaisuutena reaktio voi silti luovuttaa energiaa.', pic: 0 },
    ],
    try: 'auto',
  },
  'CHEM79-REACTION-MODEL': {
    beats: [
      { text: 'Alussa on 4 vetymolekyyliä H₂ ja 2 happimolekyyliä O₂. Lopussa on 4 vesimolekyyliä H₂O.', pic: 0 },
      { example: 'Montako vety- ja happiatomia on alussa ja lopussa?', text: 'Vetyatomeja on alussa 4 · 2 = 8 ja lopussa 4 · 2 = 8. Happiatomeja on alussa 2 · 2 = 4 ja lopussa 4 · 1 = 4.', pic: 0 },
      { text: 'Reaktiossa samat atomit irtoavat vanhoista molekyyleistä ja liittyvät uusiksi molekyyleiksi. Atomeja ei synny eikä katoa.', more: 'Molekyylien määrä voi muuttua: alussa niitä oli 6, lopussa 4. Atomien määrä pysyy samana.', pic: 0 },
    ],
    try: 'auto',
  },
  'CHEM79-EXOENDO': {
    beats: [
      { text: 'Energiakuvassa nuoli näyttää, mihin suuntaan energiaa siirtyy. Kun nuoli osoittaa ympäristöstä reaktioon, reaktio sitoo energiaa.', pic: 0 },
      { example: 'Kalsiumkarbonaatti hajoaa, ja ympäristöstä siirtyy reaktioon 44 energiayksikköä. Onko reaktio eksoterminen vai endoterminen?', text: 'Reaktio sitoo energiaa, ja ympäristö viilenee. Energiaa sitova reaktio on endoterminen.', pic: 0 },
      { text: 'Jos nuoli osoittaa reaktiosta ympäristöön, reaktio luovuttaa energiaa ja ympäristö lämpenee. Silloin reaktio on eksoterminen.', more: 'Muistisääntö: ekso tarkoittaa ulos ja endo sisään. Nimi kertoo, kulkeeko energia reaktiosta ulos vai siihen sisään.', pic: 0 },
    ],
    try: 'auto',
  },
  'CHEM79-RATE-01': {
    beats: [
      { text: 'Kokeissa A ja B on sama pitoisuus ja yksi pala, mutta A on 20 °C ja B 30 °C. Kymmenessä sekunnissa A tuottaa 44 mg ja B 88 mg tuotetta.', pic: 0, figure: false },
      { example: 'Kummassa kokeessa reaktio on nopeampi?', text: 'Samassa ajassa B tuottaa kaksi kertaa niin paljon tuotetta kuin A. Reaktio on siis nopeampi kokeessa B.', pic: 0, figure: false },
      { text: 'Reaktionopeus kertoo, paljonko tuotetta syntyy sekunnissa. Kokeessa B se on 88 mg : 10 s = 8,8 mg/s.', more: 'Jos ajat ovat erilaiset, pelkkä tuotteen määrä ei riitä vertailuun. Silloin lasketaan kummallekin tuotteen määrä sekuntia kohti.', pic: 0, figure: false },
    ],
    try: {
      say: 'Koe C tuottaa 60 mg tuotetta 20 sekunnissa ja koe D 40 mg 10 sekunnissa. Kumpi reaktio on nopeampi?',
      options: ['Koe D', 'Koe C', 'Yhtä nopeita'],
      answer: 0,
      explain: 'C tuottaa 60 mg : 20 s = 3 mg sekunnissa ja D 40 mg : 10 s = 4 mg sekunnissa. D on nopeampi, vaikka sen tuotemäärä on pienempi.',
      why: [null, 'C tuotti enemmän, mutta se käytti kaksi kertaa niin paljon aikaa. Vertaa sekunnissa syntyvää määrää.', 'Laske kummallekin tuotteen määrä sekuntia kohti: 3 mg ja 4 mg.'],
    },
  },
  'CHEM79-RATE-FACTOR': {
    beats: [
      { text: 'Reaktion nopeuteen vaikuttavat esimerkiksi lämpötila, liuoksen pitoisuus ja palakoko. Kokeessa A on 20 °C, pitoisuus 8 g/l ja yksi pala.', pic: 0, figure: false },
      { example: 'Kokeessa B lämpötila nostetaan 30 °C:seen, ja kaikki muu pysyy samana. Miten reaktion nopeus muuttuu?', text: 'Reaktio nopeutuu. Lämpimässä hiukkaset liikkuvat nopeammin, joten ne törmäävät useammin ja voimakkaammin.', pic: 0, figure: false },
      { text: 'Reilussa vertailussa muutetaan vain yhtä asiaa kerrallaan. Jos muuttuu kaksi asiaa, ei tiedetä, kumpi niistä vaikutti.', more: 'Muut tekijät pidetään vakioina eli samoina molemmissa kokeissa.', pic: 0, figure: false },
    ],
    try: 'auto',
  },
  'CHEM79-RATE-TEMP': {
    beats: [
      { text: 'Kokeet A ja B ovat muuten samanlaiset, mutta A on 20 °C ja B 30 °C. Pitoisuus on molemmissa 8 g/l, ja kummassakin on yksi pala.', pic: 0, figure: false },
      { example: 'Miten reaktion nopeus muuttuu, kun lämpötila nousee?', text: 'Reaktio nopeutuu. Lämpimässä hiukkaset liikkuvat nopeammin, joten ne törmäävät useammin ja voimakkaammin.', pic: 0, figure: false },
      { text: 'Vertailu on reilu, koska vain lämpötila muuttui. Silloin nopeuden ero johtuu lämpötilasta.', more: 'Kylmässä reaktiot hidastuvat. Siksi ruoka säilyy jääkaapissa pidempään.', pic: 0, figure: false },
    ],
    try: 'auto',
  },
  'CHEM79-RATE-CONC': {
    beats: [
      { text: 'Kokeessa A liuoksen pitoisuus on 8 g/l ja kokeessa B 16 g/l. Lämpötila on molemmissa 20 °C, ja kummassakin on yksi pala.', more: 'Pitoisuus kertoo, kuinka paljon ainetta on liuennut tiettyyn määrään liuosta.', pic: 0, figure: false },
      { example: 'Miten reaktion nopeus muuttuu, kun pitoisuus nousee?', text: 'Reaktio nopeutuu. Kun samassa tilavuudessa on enemmän reagoivia hiukkasia, ne törmäävät useammin.', pic: 0, figure: false },
      { text: 'Vertailu on reilu, koska vain pitoisuus muuttui. Jos lämpötilakin olisi muuttunut, ei tiedettäisi, kumpi nopeutti reaktiota.', pic: 0, figure: false },
    ],
    try: 'auto',
  },
  'CHEM79-RATE-SURF': {
    beats: [
      { text: 'Kokeessa A on yksi kiinteä pala, kokeessa B sama pala pilkottuna 8 pienemmäksi palaksi. Lämpötila ja pitoisuus ovat samat.', pic: 0, figure: false },
      { example: 'Miten reaktion nopeus muuttuu, kun pala pilkotaan?', text: 'Reaktio nopeutuu. Pienillä paloilla on yhteensä enemmän pintaa, joten useampi hiukkanen pääsee reagoimaan yhtä aikaa.', more: 'Kun kuutio leikataan 8 pienemmäksi kuutioksi, kokonaispinta-ala kaksinkertaistuu.', pic: 0, figure: false },
      { text: 'Aineen määrä ei muuttunut, vain pinnan ala kasvoi. Siksi pienet tikut syttyvät helpommin kuin iso halko.', pic: 0, figure: false },
    ],
    try: 'auto',
  },
};
