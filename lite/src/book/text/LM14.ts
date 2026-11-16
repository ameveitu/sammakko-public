import type { PageText } from '../text';

/** LM14 Majakkarakentajien kappalesaari: recognising, building, naming and sorting solids. */
export const TEXT: Record<string, PageText> = {
  'M-GEO-05': {
    beats: [
      { example: 'Mikä malleista on ympyrälieriö?', text: 'Päädystä katsottuna kaikki kolme mallia ovat ympyröitä. Siksi jokainen katsotaan myös sivulta.', pic: 0 },
      { text: 'Sivulta malli 3 on pelkkä viiva: se on ohut tasokuvio. Malli 2 on ympyrä joka suunnasta: se on pallo.', pic: 0 },
      { text: 'Malli 1 on sivulta neliö, ja sillä on kaksi samanlaista pyöreää päätyä. Se on ympyrälieriö, kuin purkki.', more: 'Jos kappaleen kaksi samanlaista päätyä ovat kulmikkaita, esimerkiksi kolmioita, kappale on särmiö.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GEO-07': {
    beats: [
      { text: 'Ruudukko näyttää rakennelman ylhäältä. Joka vihreässä ruudussa on palikka, joten palikoita on 5.', pic: 0 },
      { text: 'Keskimmäisessä sarakkeessa on kolme palikkaa peräkkäin. Edestä katsottuna etummainen peittää kaksi muuta.', more: 'Rivi 1 on takana ja rivi 3 edessä.', pic: 0 },
      { text: 'Rakenna kerros kerrallaan ja katso lopuksi myös sivulta. Silloin piiloon jäävä palikka ei unohdu.', pic: 0 },
    ],
    try: {
      say: 'Edestä näet rakennelmasta kolme palikkaa. Montako palikkaa siinä voi olla?',
      options: ['Kolme tai enemmän', 'Tasan kolme', 'Vähemmän kuin kolme'],
      answer: 0,
      explain: 'Etummaiset palikat voivat peittää takana olevia. Siksi palikoita voi olla enemmän kuin edestä näkyy.',
      why: [null, 'Takana voi olla palikoita, joita edessä olevat peittävät.', 'Jokainen näkyvä palikka on oikeasti olemassa, joten niitä on ainakin kolme.'],
    },
  },
  'M-GEO-3D-PROP-NAME': {
    beats: [
      { text: 'Kappaleen tasainen pinta on tahko. Korostettu pinta A on tahko.', pic: 0 },
      { text: 'Kahden tahkon välinen reunaviiva on särmä. Korostettu viiva C on särmä.', pic: 1 },
      { text: 'Piste, jossa särmät kohtaavat, on kärki. Pyramidin terävä huippu A on kärki.', pic: 1 },
    ],
    try: {
      say: 'Pyramidin huippu on yksi terävä piste. Mikä se on?',
      options: ['Kärki', 'Särmä', 'Tahko'],
      answer: 0,
      explain: 'Kärki on piste, jossa särmät kohtaavat. Pyramidin huipulla kaikki sivusärmät kohtaavat.',
      why: [null, 'Särmä on reunaviiva, ei yksi piste.', 'Tahko on tasainen pinta, ei piste.'],
    },
  },
  'M-GEO-3D-CLASSIFY': {
    beats: [
      { text: 'Ensimmäiseen hyllyyn tulevat kappaleet, joilla on kaksi samanlaista päätyä. Malli 1 ja malli 3 kuuluvat sinne.', pic: 0 },
      { text: 'Toiseen hyllyyn tulevat kappaleet, joissa on kaareva pinta. Malli 1 ja malli 2 kuuluvat sinne.', pic: 0 },
      { text: 'Malli 1 on ympyrälieriö, ja se kuuluu kumpaankin hyllyyn. Sama kappale voi kuulua kahteen ryhmään.', pic: 0 },
    ],
    try: {
      say: 'Laatikolla on kaksi samanlaista päätyä, mutta ei yhtään kaarevaa pintaa. Mihin hyllyyn se kuuluu?',
      options: ['Kahden päädyn hyllyyn', 'Kaarevan pinnan hyllyyn', 'Kumpaankin hyllyyn'],
      answer: 0,
      explain: 'Laatikon kaikki pinnat ovat tasaisia, joten se ei kuulu kaarevan pinnan hyllyyn. Kaksi samanlaista päätyä sillä on.',
      why: [null, 'Laatikossa ei ole kaarevaa pintaa.', 'Kumpaankin kuuluu vain kappale, jolla on molemmat tuntomerkit.'],
    },
  },
  'M-GEO-08': {
    beats: [
      { text: 'Malli 1 on tasokuvio, ohut kuin paperi. Sen korostettu reunaviiva A on sivu.', pic: 0 },
      { text: 'Malli 2 on kappale. Sen korostettu tasainen pinta A on tahko.', pic: 0 },
      { text: 'Kappaleen reunaviiva on särmä, kuten korostettu C. Tasokuviolla on sivuja, kappaleella särmiä.', pic: 1 },
    ],
    try: {
      say: 'Laatikon kaksi tahkoa kohtaavat reunaviivassa. Mikä se viiva on?',
      options: ['Särmä', 'Sivu', 'Kärki'],
      answer: 0,
      explain: 'Kappaleen kahden tahkon välinen reunaviiva on särmä.',
      why: [null, 'Sivu on tasokuvion reunaviiva. Kappaleen reunaviiva on särmä.', 'Kärki on yksi piste, ei viiva.'],
    },
  },
  'M-GEO-09': {
    beats: [
      { text: 'Päädystä katsottuna kaikki kolme mallia näyttävät ympyrältä. Ero näkyy vasta sivulta.', pic: 0 },
      { example: 'Mistä näkee, onko malli 1 tasokuvio vai kappale?', text: 'Sivulta malli 1 on pelkkä viiva, joten se on ohut tasokuvio. Malli 3 näkyy sivulta neliönä: sillä on paksuutta, joten se on kappale.', more: 'Malli 2 on ympyrä joka suunnasta. Se on pallo, ja pallokin on kappale.', pic: 0 },
    ],
    try: {
      say: 'Malli näyttää päädystä ympyrältä ja sivulta pelkältä viivalta. Mikä se on?',
      options: ['Ohut tasokuvio', 'Paksu kappale', 'Pallo'],
      answer: 0,
      explain: 'Sivulta tasokuvio näkyy viivana, koska sillä ei ole paksuutta.',
      why: [null, 'Paksu kappale näkyisi sivultakin pintana, ei viivana.', 'Pallo näyttää ympyrältä joka suunnasta.'],
    },
  },
  'M-GEO-14': {
    beats: [
      { example: 'Onko kappale 1 lieriö, kartio vai muu kappale?', text: 'Kappaleen 1 pääty on kolmio, ja sivulta se on yhtä leveä päästä päähän. Sillä on kaksi samanlaista pohjaa, joten se on lieriö.', pic: 0 },
      { text: 'Kappale 2 kapenee sivulta yhteen kärkeen, joten se on kartio. Kappale 3 on lieriö, jonka pohjat ovat ympyröitä.', pic: 0 },
      { text: 'Lieriön ja kartion pohja voi olla ympyrä tai monikulmio. Siksi särmiö on lieriö ja pyramidi on kartio.', more: 'Muu kappale on esimerkiksi pallo: sillä ei ole pohjaa eikä kärkeä.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GEO-RECTPRISM-ID': {
    beats: [
      { example: 'Mitkä malleista ovat suorakulmaisia särmiöitä?', text: 'Mallin 1 jokainen tahko on neliö. Malli 2 kapenee kärkeen, ja mallin 3 päädyt ovat kolmioita.', pic: 0 },
      { text: 'Suorakulmaisen särmiön jokainen tahko on suorakulmio. Siksi vain malli 1 kelpaa.', pic: 0 },
      { text: 'Neliökin on suorakulmio, jonka kaikki sivut ovat yhtä pitkiä. Siksi kuutio on suorakulmainen särmiö.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GEO-RECTPRISM-PROP': {
    beats: [
      { example: 'Montako tahkoa kappaleessa on?', text: 'Kuvasta näkyy vain osa tahkoista. Kun lasket myös takana ja alla olevat, tahkoja on 6.', pic: 0 },
      { text: 'Särmiä on 12: neljä ylhäällä, neljä alhaalla ja neljä pystyssä. Kärkiä on 8: neljä ylhäällä ja neljä alhaalla.', pic: 0 },
      { text: 'A on ylätahko ja B alatahko: ne ovat vastakkaiset tahkot. Vastakkaiset tahkot ovat samankokoiset ja yhdensuuntaiset.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GEO-CYLINDER-ID': {
    beats: [
      { example: 'Mikä malleista on ympyrälieriö?', text: 'Kaikki kolme ovat sivulta yhtä leveitä päästä päähän. Jokaisella on kaksi samanlaista pohjaa, joten ne ovat lieriöitä.', pic: 0 },
      { text: 'Pohjan muoto näkyy päätykuvasta. Vain mallin 1 pohja on ympyrä, joten malli 1 on ympyrälieriö.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GEO-CYLINDER-PROP': {
    beats: [
      { example: 'Mikä kirjaimista osoittaa vaippaa?', text: 'A ja B ovat ympyrälieriön kaksi pohjaa, ylhäällä ja alhaalla. Ne ovat samankokoiset ja yhdensuuntaiset ympyrät.', pic: 0 },
      { text: 'C on kyljessä. Kylkeä kiertävä kaareva pinta on vaippa, ja se yhdistää pohjien reunat.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GEO-CONE-ID': {
    beats: [
      { example: 'Mikä malleista on ympyräpohjainen kartio?', text: 'Kaikki kolme kapenevat sivulta kärkeen, joten ne ovat kartioita. Pohjan muoto näkyy päätykuvasta.', pic: 0 },
      { text: 'Mallin 1 pohja on ympyrä: se on ympyräpohjainen kartio. Mallien 2 ja 3 pohjat ovat monikulmioita, joten ne ovat pyramideja.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GEO-CONE-PROP': {
    beats: [
      { example: 'Mikä kirjaimista osoittaa pohjaa?', text: 'B on kartion pohja: tasainen ympyrä alhaalla. A on kärki, yksi piste huipulla.', pic: 0 },
      { text: 'C on kaarevalla vaipalla. Vaippa nousee pohjan reunasta kärkeen asti.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GEO-PYRAMID-ID': {
    beats: [
      { example: 'Mitkä malleista ovat pyramideja?', text: 'Kaikki kolme kapenevat sivulta kärkeen. Päätykuvista näkyvät pohjat: neliö, ympyrä ja kolmio.', pic: 0 },
      { text: 'Pyramidin pohja on monikulmio, ja jokaisesta pohjan sivusta nousee kolmio kärkeen. Pyramideja ovat mallit 1 ja 3.', pic: 0 },
      { text: 'Malli 2 on ympyräpohjainen kartio. Ympyrällä ei ole sivuja, joten siinä ei ole sivukolmioita.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GEO-PYRAMID-PROP': {
    beats: [
      { example: 'Mikä kirjaimista osoittaa pohjaa?', text: 'B on pyramidin pohja, tässä suorakulmio. A on kärki, jossa sivukolmiot kohtaavat.', pic: 0 },
      { text: 'C on yksi sivukolmio. Pohjan 4 sivusta nousee 4 sivukolmiota.', pic: 0 },
      { text: 'Pohja kertoo sivukolmioiden määrän. Kolmiopohjaisessa pyramidissa sivukolmioita on 3.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GEO-15': {
    beats: [
      { example: 'Mikä malleista on suorakulmainen särmiö?', text: 'Mallin 2 päädyt ovat kolmioita ja mallin 3 vinoja suunnikkaita. Vain mallin 1 kaikki tahkot ovat suorakulmioita.', pic: 0 },
      { text: 'Suorakulmaisessa särmiössä on 6 tahkoa, 12 särmää ja 8 kärkeä. Laske myös takana piiloon jäävät.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GEO-16': {
    beats: [
      { example: 'Mikä malleista on ympyrälieriö?', text: 'Malli 1 on sivulta yhtä leveä päästä päähän, ja sen pohja on ympyrä. Mallit 2 ja 3 kapenevat kärkeen.', pic: 0 },
      { text: 'A ja C ovat ympyrälieriön kaksi pohjaa: samankokoiset ja yhdensuuntaiset. B on kaareva vaippa, joka yhdistää niiden reunat.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GEO-17': {
    beats: [
      { example: 'Mikä malleista on ympyräpohjainen kartio?', text: 'Malli 1 kapenee sivulta kärkeen, ja sen pohja on ympyrä. Mallit 2 ja 3 ovat sivulta yhtä leveitä, joten ne ovat lieriöitä.', pic: 0 },
      { text: 'C on ympyräpohja ja A on kärki. B on kaarevalla vaipalla, joka nousee pohjan reunasta kärkeen.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GEO-18': {
    beats: [
      { example: 'Mikä malleista on 4-kulmapohjainen pyramidi?', text: 'Mallin 1 pohja on nelikulmio, ja sivulta se kapenee kärkeen. Malli 2 on kolmiopohjainen pyramidi ja malli 3 särmiö.', pic: 0 },
      { text: 'B on pohja, C on kärki ja A on yksi sivukolmio. Pohjan 4 sivusta nousee 4 sivukolmiota.', pic: 0 },
      { text: 'Pohja mukaan lukien tahkoja on 4 + 1 = 5.', pic: 0 },
    ],
    try: 'auto',
  },
};
