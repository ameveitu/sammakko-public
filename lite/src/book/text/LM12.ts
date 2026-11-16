import type { PageText } from '../text';

/** LM12 Askelpolkujen pienoissaari: flat shapes and solids, position words and map directions. */
export const TEXT: Record<string, PageText> = {
  'M-GEO-01': {
    beats: [
      { text: 'Pallon voi ottaa käteen, ja se vie tilaa: se on kappale. Paperille piirretty ympyrä on litteä kuvio, jolla ei ole paksuutta.', more: 'Litteitä kuvioita eli tasokuvioita ovat esimerkiksi ympyrä, neliö, kolmio ja suorakulmio.', pic: 0 },
      { text: 'Kun kuutio painetaan hiekkaan, sen tasainen pohja jättää jäljen. Jälki on litteä neliö.', more: 'Kuution kaikki tasaiset pinnat ovat neliöitä.', pic: 1 },
      { text: 'Tölkin pohja jättää hiekkaan ympyrän. Tölkki on kappale, mutta sen pohjan jälki on litteä kuvio.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-GEO-02': {
    beats: [
      { text: 'Kukka on kiven vasemmalla puolella ja kala kiven oikealla puolella. Kivi on kukan ja kalan välissä.', pic: 0 },
      { text: 'Simpukka on ylähyllyllä, suoraan kiven yläpuolella. Kivi on simpukan alapuolella.', more: 'Vasen ja oikea katsotaan aina omasta suunnastasi.', pic: 1 },
      { text: 'Askelilla löytää minkä tahansa paikan. Vasemmasta alakulmasta yksi askel oikealle ja kaksi ylös: siellä on meritähti.', pic: 2 },
    ],
    try: 'auto',
  },
  'M-GEO-03': {
    beats: [
      { text: 'Tällä kartalla pohjoinen on ylöspäin ja länsi vasemmalla. Ohje "länteen, sitten pohjoiseen" vie yhden ruudun vasemmalle ja sitten yhden ylös.', pic: 1 },
      { text: 'Kartan suunnat pysyvät paikallaan, vaikka Loikka kääntyisi. Loikan oma vasen ja oikea kääntyvät hänen mukanaan.', pic: null },
      { text: 'Kun Loikka katsoo kartalla alaspäin, hänen oikea kätensä osoittaa kartan vasempaan reunaan.', more: 'Voit kokeilla: käänny itse samaan suuntaan kuin Loikka ja katso, kummalle puolelle oikea kätesi osoittaa.', pic: null },
    ],
    try: {
      say: 'Loikka katsoo kartalla alaspäin. Mihin hänen vasen kätensä osoittaa kartalla?',
      options: ['Oikealle', 'Vasemmalle', 'Ylöspäin'],
      answer: 0,
      explain: 'Kun Loikka katsoo alaspäin, hänen vasen kätensä osoittaa kartan oikealle puolelle. Hänen vasen ja oikea ovat kääntyneet hänen mukanaan.',
      why: [null, 'Näin olisi, jos Loikka katsoisi ylöspäin. Nyt hän katsoo toiseen suuntaan.', 'Ylöspäin on Loikan selän takana, kun hän katsoo alaspäin.'],
    },
  },
};
