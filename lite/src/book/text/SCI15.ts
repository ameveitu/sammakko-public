import type { PageText } from '../text';

/** SCI15 Kristallilahden erottamo: pure substances, mixtures, solubility, solutions and separation methods. */
export const TEXT: Record<string, PageText> = {
  'CHEM79-PURE-MIX': {
    beats: [
      { example: 'Katso näytettä A. Onko se puhdas aine vai seos?', text: 'Koostumuskortissa on vain yksi aine, vesi. Näyte A on siis puhdas aine.', pic: 0 },
      { text: 'Seoksessa on kaksi tai useampia aineita. Kirkas sokerivesi on seos, vaikka se näyttää aivan samalta kuin puhdas vesi.', pic: null },
      { text: 'Vesi (H₂O) on yhdiste, jossa on vetyä ja happea. Se on silti yksi aine, joten puhdas vesi ei ole seos.', pic: 0 },
    ],
    try: 'auto',
  },
  'CHEM79-MIX-HOM': {
    beats: [
      { example: 'Näyte A on liuos, joka on seos. Onko se kauttaaltaan samanlainen vai erottuvatko sen osat?', text: 'Vesi ja sakkaroosi ovat sekoittuneet niin, ettei osia erota edes suurennuslasilla. Tällainen seos on tasakoosteinen.', pic: 0 },
      { text: 'Sekakoosteisessa seoksessa osat erottuvat toisistaan. Esimerkkejä ovat hiekka vedessä ja öljykerros veden päällä.', pic: null },
      { text: 'Myös maito on sekakoosteinen, vaikka se näyttää tasaiselta. Siinä on pieniä rasvapisaroita veden seassa, ja tällaista seosta kutsutaan emulsioksi.', pic: null },
    ],
    try: 'auto',
  },
  'CHEM79-SOLUBILITY': {
    beats: [
      { example: 'Kumpaankin kokeeseen lisätään 700 mg ainetta. Kummassa sitä liukenee enemmän?', text: 'Kokeessa A liukenee enintään 800 mg, joten kaikki 700 mg liukenee. Kokeessa B liukenee enintään 200 mg, joten 500 mg jää pohjalle liukenematta.', pic: 0 },
      { text: 'Liukoisuus kertoo, paljonko ainetta voi liueta enintään tiettyyn määrään liuotinta. Lisätty aine liukenee, mutta korkeintaan liukoisuuden verran.', more: 'Liukoisuus riippuu aineesta, liuottimesta ja lämpötilasta. Siksi se ilmoitetaan aina yhdessä liuottimen ja lämpötilan kanssa.', pic: 0 },
    ],
    try: 'auto',
  },
  'CHEM79-SEPARATE-01': {
    beats: [
      { example: 'Pisteessä A vedessä on hiekkaa ja siihen liuennutta sakkaroosia eli sokeria. Miten hiekka saadaan erilleen?', text: 'Suodattamalla: suodatin päästää veden läpi, mutta hiekanjyvät jäävät siihen. Liuennut sokeri kulkee veden mukana läpi.', pic: 0 },
      { text: 'Menetelmä valitaan aineiden ominaisuuksista ja siitä, mikä osa halutaan talteen. Liuenneen sokerin saa kiinteänä vasta, kun vesi haihdutetaan.', pic: 0 },
    ],
    try: {
      say: 'Pisteestä A halutaan talteen sekä hiekka että sokeri. Mitä tehdään ensin?',
      options: ['Suodatus', 'Haihdutus', 'Kaataminen pohjasakan päältä'],
      answer: 0,
      explain: 'Ensin suodatin erottaa hiekan. Sen jälkeen suodoksesta haihdutetaan vesi, ja sokeri jää astiaan.',
      why: [null, 'Jos vesi haihdutetaan ensin, hiekka ja sokeri jäävät samaan astiaan sekaisin.', 'Hiekka ei ole laskeutunut pohjalle, joten se valuisi veden mukana.'],
    },
  },
  'CHEM79-WATERFAT-SOL': {
    beats: [
      { example: 'Samaa ainetta lisätään 700 mg veteen ja 700 mg rasvaan. Kumpaan sitä liukenee enemmän?', text: 'Vesi liuottaa ainetta enintään 800 mg, joten kaikki 700 mg liukenee. Rasva liuottaa vain 200 mg, ja loput 500 mg jää liukenematta.', pic: null },
      { text: 'Sama aine liukenee eri liuottimiin eri tavalla. Esimerkiksi C-vitamiini liukenee hyvin veteen, D-vitamiini taas rasvaan.', pic: null },
      { text: 'Liukoisuus ei kerro, onko aine vaarallinen vai turvallinen. Se kertoo vain, mihin liuottimeen ja kuinka paljon aine liukenee.', pic: null },
    ],
    try: {
      say: 'Ainetta liukenee rasvaan paljon, mutta veteen vain vähän. Mitä tästä voi päätellä?',
      options: ['Liukoisuus riippuu liuottimesta', 'Aine on vaarallinen', 'Aine ei liukene veteen lainkaan'],
      answer: 0,
      explain: 'Sama aine liukenee eri liuottimiin eri määriä. Siitä ei voi päätellä, onko aine vaarallinen.',
      why: [null, 'Liukoisuus ei kerro mitään aineen vaarallisuudesta.', 'Vähän liukeneminen ei ole sama asia kuin ei lainkaan.'],
    },
  },
  'CHEM79-SOLUTION': {
    beats: [
      { example: 'Kumpaankin kokeeseen lisätään 700 mg sokeria veteen. Kummassa sokeria liukenee enemmän?', text: 'Yhtä paljon: kummassakin kokeessa vesi pystyy liuottamaan yli 700 mg. Siksi kaikki 700 mg sokeria liukenee molemmissa.', pic: 0 },
      { text: 'Sokeri on liuennut aine ja vesi on liuotin. Yhdessä ne muodostavat liuoksen, joka on tasakoosteinen seos.', pic: 0 },
      { text: 'Sokerikiteet katoavat näkyvistä, mutta sokeri ei häviä. Liuoksessa on yhä kaikki 700 mg, ja se jää jäljelle, kun vesi haihdutetaan.', pic: 0 },
    ],
    try: {
      say: 'Veteen lisätään 500 mg suolaa, ja kaikki liukenee. Liuos on kirkas. Paljonko suolaa liuoksessa on?',
      options: ['500 mg', '0 mg', 'Alle 500 mg'],
      answer: 0,
      explain: 'Liuetessaan suola jakautuu pieniksi hiukkasiksi veden sekaan, eikä niitä näe. Kaikki 500 mg on silti liuoksessa.',
      why: [null, 'Suola ei häviä, vaikka kiteitä ei enää näy.', 'Kaikki suola liukeni, eikä liukeneminen hävitä ainetta.'],
    },
  },
  'CHEM79-FILTRATION': {
    beats: [
      { text: 'Hiekkavesi kaadetaan suodattimeen. Hiekanjyvät jäävät suodattimeen, ja läpi valunutta nestettä kutsutaan suodokseksi.', pic: 0 },
      { text: 'Suodattimessa on pieniä reikiä eli huokosia. Hiekanjyvä on 100 µm ja huokonen 60 µm, joten jyvä ei mahdu läpi.', more: 'Mikrometri (µm) on millimetrin tuhannesosa. 100 µm on siis 0,1 mm.', pic: 1 },
      { text: 'Vedessä on myös liuennutta suolaa. Suolan ionit Na⁺ ja Cl⁻ ovat paljon huokosia pienempiä, joten ne kulkevat veden mukana suodokseen.', more: 'Siksi kirkas suodos ei kerro, että vesi on juomakelpoista. Siinä voi olla liuenneita aineita ja pieneliöitä, joita ei näe.', pic: 2 },
    ],
    try: {
      say: 'Suolaista hiekkavettä suodatetaan. Mitä suodokseen päätyy?',
      options: ['Vesi ja liuennut suola', 'Pelkkä puhdas vesi', 'Vesi, suola ja hiekka'],
      answer: 0,
      explain: 'Hiekanjyvät ovat huokosia suurempia ja jäävät suodattimeen. Liuennut suola kulkee veden mukana suodokseen, vaikka suodos on kirkas.',
      why: [null, 'Liuennut suola kulkee suodattimen läpi. Kirkkaus ei kerro, että vesi on puhdasta.', 'Hiekanjyvät ovat huokosia suurempia, joten ne jäävät suodattimeen.'],
    },
  },
  'CHEM79-EVAPORATION': {
    beats: [
      { example: 'Pisteessä A sakkaroosi on liuennut veteen. Miten se saadaan talteen kiinteänä?', text: 'Haihduttamalla: vesi haihtuu ilmaan vesihöyrynä, mutta sakkaroosi ei haihdu. Se jää astian pohjalle.', pic: 0 },
      { text: 'Haihdutus erottaa haihtuvan liuottimen aineesta, joka ei haihdu. Mikään ei katoa: vesi on höyrynä ilmassa ja sakkaroosi astian pohjalla.', more: 'Suodatus ei sovi tähän, koska liuennut sakkaroosi kulkee suodattimen läpi veden mukana.', pic: 0 },
    ],
    try: {
      say: 'Astiassa on 100 g vettä, johon on liuennut 20 g sokeria. Vesi haihdutetaan. Paljonko astiaan jää?',
      options: ['20 g', '120 g', '0 g'],
      answer: 0,
      explain: 'Vesi siirtyy ilmaan vesihöyrynä. Sokeri ei haihdu, joten kaikki 20 g jää astian pohjalle.',
      why: [null, 'Vesi lähtee astiasta höyrynä, joten sen massa ei jää astiaan.', 'Vain vesi haihtuu. Sokeri ei haihdu, joten se jää astiaan.'],
    },
  },
  'CHEM79-DECANTING': {
    beats: [
      { example: 'Pisteessä A hiekka on laskeutunut veden pohjalle. Miten vesi saadaan erilleen ilman suodatinta?', text: 'Vesi kaadetaan varovasti toiseen astiaan, ja hiekka jää pohjalle. Tätä kutsutaan dekantoinniksi.', pic: 0 },
      { text: 'Dekantointi onnistuu vasta, kun kiinteä aine on laskeutunut. Juuri sekoitetusta astiasta hiekka valuisi veden mukana.', pic: null },
      { text: 'Hiekan päälle jää aina vähän vettä. Jos veteen on liuennut sokeria, sitä on sekä kaadetussa vedessä että pohjalle jääneessä vedessä.', pic: null },
    ],
    try: {
      say: 'Sokerivedessä on hiekkaa, joka on laskeutunut pohjalle. Vesi dekantoidaan. Missä sokeri on?',
      options: ['Kaadetussa ja pohjalle jääneessä vedessä', 'Pohjalla hiekan seassa', 'Vain kaadetussa vedessä'],
      answer: 0,
      explain: 'Liuennut sokeri on tasaisesti koko vedessä. Kaadettu vesi vie osan siitä, ja hiekan päälle jääneessä vedessä on loput.',
      why: [null, 'Sokeri on liuennut, joten se ei laskeudu pohjalle hiekan tavoin.', 'Hiekan päälle jää vähän vettä, ja siinäkin on liuennutta sokeria.'],
    },
  },
  'CHEM79-SEPARATE-02': {
    beats: [
      { example: 'Pisteessä C sakkaroosi on liuennut veteen. Mikä erotusmenetelmä sopii?', text: 'Haihdutus, sillä liuennut sakkaroosi kulkisi suodattimen läpi eikä laskeudu pohjalle. Vesi haihtuu, ja sakkaroosi jää astiaan.', pic: 0 },
      { text: 'Suodatus erottaa nesteestä rakeet, jotka ovat suodattimen huokosia suurempia. Dekantoinnissa neste kaadetaan pohjalle laskeutuneen sakan päältä.', pic: null },
      { text: 'Jokainen menetelmä käyttää eri ominaisuutta: suodatus hiukkasten kokoa, dekantointi laskeutumista ja haihdutus haihtumista.', pic: null },
    ],
    try: {
      say: 'Pannukahvin porot ovat laskeutuneet pohjalle, ja kahvi kaadetaan varovasti kuppiin. Mikä menetelmä tämä on?',
      options: ['Dekantointi', 'Suodatus', 'Haihdutus'],
      answer: 0,
      explain: 'Porot ovat laskeutuneet pohjalle, joten kahvin voi kaataa niiden päältä. Se on dekantointia.',
      why: [null, 'Suodatuksessa neste kulkee suodattimen läpi. Tässä kahvi vain kaadetaan porojen päältä.', 'Haihdutuksessa neste haihtuu pois. Tässä kahvi kaadetaan kuppiin.'],
    },
  },
};
