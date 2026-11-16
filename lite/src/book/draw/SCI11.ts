import type { PageDraw } from '../pages';
import { bars, cards, carts, flow, formula, heights, sankey, table } from '../figures';

const SOURCE_CHAIN = (roles: boolean) => flow({ steps: [
  { icon: '🌬️', text: 'tuuli', sub: roles ? 'lähde' : undefined },
  { icon: '⚙️', text: 'generaattori', sub: roles ? 'muunnin' : undefined },
  { icon: '⚡', text: 'sähkö', sub: roles ? 'siirtotapa' : undefined },
  { icon: '💡', text: 'lamppu', sub: roles ? 'käyttökohde' : '70 J', mark: roles ? undefined : 'ok' },
], label: roles ? 'Lähde, muunnin, siirtotapa ja käyttökohde' : 'Tuuli, generaattori, sähkö ja lamppu' });

/** Energy: chains, energy accounts as flows, kinetic and potential energy. */
export const DRAW: Record<string, () => PageDraw> = {
  'ENV-PHY-ENERGYFORM-01': () => ({ beats: [
    flow({ steps: [{ icon: '🌊', text: 'vesi virtaa' }, { icon: '⚙️', text: 'vesipyörä pyörii' }], label: 'Virtaava vesi pyörittää vesipyörää' }),
    cards({ cards: [{ icon: '🐢', title: 'hidas virta', text: 'vähemmän liike-energiaa', tone: 'plain' }, { icon: '🐇', title: 'nopea virta', text: 'enemmän liike-energiaa', tone: 'warm' }], label: 'Mitä nopeampi virta, sitä enemmän liike-energiaa' }),
    cards({ cards: [{ icon: '🏃', title: 'liike' }, { icon: '⛰️', title: 'korkeus' }, { icon: '🔥', title: 'lämpö' }], label: 'Energialla kuvataan liikettä, korkeutta tai lämpöä' }),
  ] }),
  'ENV-PHY-ENERGYTRANS-01': () => ({ beats: [
    flow({ steps: [{ icon: '🌊', text: 'vesi' }, { icon: '⚙️', text: 'vesipyörä' }, { icon: '🔌', text: 'sähkölaite' }, { icon: '💡', text: 'lamppu' }], label: 'Vesi pyörittää pyörää, pyörä sähkölaitetta, lamppu syttyy' }),
    flow({ steps: [{ icon: '🌊', text: 'liike' }, { icon: '⚡', text: 'sähkö' }, { icon: '💡', text: 'valo ja lämpö' }], label: 'Energian muoto vaihtuu matkalla: energia muuntuu' }),
    sankey({ input: { text: 'vesi', value: 90 }, outs: [{ text: 'valo', value: 45 }, { text: 'lämpö ympäristöön', value: 45 }], unit: 'J', label: '90 J vedestä: 45 J valoksi ja 45 J lämmöksi' }),
  ] }),
  'ENV-PHY-ENERGYCONS-01': () => ({ beats: [
    sankey({ input: { text: 'alussa', value: 90 }, outs: [{ text: 'veneen liike', value: 45 }, { text: '?', value: 45, color: '#c8bfa8' }], unit: 'J', label: 'Alussa 90 J, veneen liikkeeseen 45 J. Missä loput?' }),
    sankey({ input: { text: 'alussa', value: 90 }, outs: [{ text: 'veneen liike', value: 45 }, { text: 'veden ja ilman lämpö', value: 45 }], unit: 'J', label: '45 J + 45 J = 90 J' }),
    formula({ lines: ['alussa 90 J = lopussa 90 J'], note: 'energiaa ei katoa eikä synny tyhjästä', label: 'Energia säilyy' }),
  ] }),
  'PHY79-ENERGY-01': () => ({ beats: [
    sankey({ input: { text: 'vene, vesi ja ilma', value: 90 }, outs: [{ text: 'veneen liike (hyöty)', value: 45 }, { text: '?', value: 45, color: '#c8bfa8' }], unit: 'J', label: 'Systeemin energia 90 J, hyödylliseen osaan 45 J' }),
    formula({ lines: ['90 J − 45 J = 45 J lämmöksi', 'yhteensä yhä 90 J'], label: 'Energiatili täsmää lämpenemisen kanssa' }),
    formula({ lines: ['hyötysuhde = 45 J / 90 J = 50 %'], note: 'hyödyllinen osa kaikesta', label: 'Hyötysuhde 50 %' }),
  ] }),
  'PHY79-ENERGY-TRANSFER': () => ({ beats: [
    flow({ steps: [{ icon: '🌊', text: 'vesi', sub: 'liike-energia' }, { icon: '⚙️', text: 'vesipyörä', sub: 'saa 70 J liike-energiaa' }], label: 'Energia siirtyy vedestä pyörään, muoto pysyy samana' }),
    flow({ steps: [{ icon: '⚡', text: 'sähköinen energia' }, { icon: '💡', text: 'lamppu' }, { icon: '✨', text: 'valo' }], label: 'Lampussa energia muuntuu: muoto vaihtuu' }),
    cards({ cards: [{ icon: '➡️', title: 'siirtyminen', text: 'mistä mihin', tone: 'cool' }, { icon: '🔄', title: 'muuntuminen', text: 'mistä muodosta mihin', tone: 'warm' }], label: 'Siirtyminen: paikka vaihtuu. Muuntuminen: muoto vaihtuu.' }),
  ] }),
  'PHY79-KINETIC': () => ({ beats: [
    carts({ items: [{ m: '3 kg', v: '3 m/s', e: '13,5 J' }], label: 'Vaunu 3 kg, 3 m/s: liike-energia 13,5 J' }),
    carts({ items: [{ m: '3 kg', v: '3 m/s', e: '13,5 J' }, { m: '6 kg', v: '3 m/s', e: '27 J' }], label: 'Kaksinkertainen massa: kaksinkertainen energia' }),
    carts({ items: [{ m: '3 kg', v: '3 m/s', e: '13,5 J' }, { m: '3 kg', v: '6 m/s', e: '54 J', long: 2 }], label: 'Kaksinkertainen nopeus: nelinkertainen energia' }),
  ] }),
  'PHY79-POTENTIAL': () => ({ beats: [
    heights({ items: [{ m: '3 kg', h: 5, e: '150 J' }], label: 'Vesikori 3 kg, 5 m viitetason yläpuolella: 150 J' }),
    heights({ items: [{ m: '3 kg', h: 5, e: '150 J' }, { m: '6 kg', h: 5, e: '300 J' }], label: 'Kaksinkertainen massa: kaksinkertainen potentiaalienergia' }),
    heights({ items: [{ m: '3 kg', h: 5, e: '90 J' }], zero: { at: 2, text: 'nollataso 2 m' }, label: 'Nollatason nosto pienentää lukemaa' }),
  ] }),
  'PHY79-ENERGY-SOURCE': () => ({ beats: [
    SOURCE_CHAIN(false),
    SOURCE_CHAIN(true),
    flow({ steps: [{ icon: '🌬️', text: 'tuuli' }, { icon: '🌊', text: 'virtaava vesi' }, { icon: '☀️', text: 'aurinko' }, { icon: '⚡', text: 'sama johto', mark: 'hot' }], arrows: ['+', '+', '→'], label: 'Samaan johtoon voi tulla energiaa monesta lähteestä' }),
  ] }),
  'PHY79-RENEW': () => ({ beats: [
    bars({ bars: [{ label: 'saatu tuulesta', value: 11, text: '11' }, { label: 'käytetty', value: 6, text: '6' }], max: 12, axis: 'energiaa 3 vuodessa (yksikköä)', label: 'Tuulesta saadaan 11 yksikköä, käytetään 6' }),
    cards({ cards: [{ icon: '🌬️', title: 'tuulinen sää', text: 'voimala pyörii', tone: 'cool' }, { icon: '🍃', title: 'tyyni sää', text: 'voimala seisoo: tarvitaan varasto', tone: 'warm' }], label: 'Uusiutuva ei ole aina saatavilla' }),
    cards({ cards: [{ icon: '⛏️', title: 'kivihiili', text: 'ei synny lisää ihmisen elinaikana', tone: 'warm' }, { icon: '🌲', title: 'biomassa', text: 'vähenee, jos poltetaan kasvua nopeammin', tone: 'plain' }], label: 'Kivihiili on uusiutumaton, biomassankin varanto voi hupenea' }),
  ] }),
  'PHY79-ENERGY-IMPACT': () => ({ beats: [
    cards({ cards: [{ icon: '💡', title: 'tarve', text: 'vähintään 7 kWh', tone: 'cool' }, { icon: '🐦', title: 'luontovaikutus', text: 'enintään 4', tone: 'warm' }], label: 'Majakka tarvitsee 7 kWh, vaikutus enintään 4' }),
    table({ head: ['vaihtoehto', 'kWh', 'vaikutus', 'kelpaa'], rows: [['luodon lähilaite', '18', '6', '✗'], ['rantapaneeli', '10', '3', '✓'], ['kauempi tuulilaite', '16', '4', '✓']], label: 'Lähilaitteen vaikutus ylittää rajan, kaksi muuta kelpaa' }),
    cards({ cards: [{ icon: '☀️', title: 'rantapaneeli', text: 'pieni vaikutus, tuotto vaihtelee', tone: 'plain' }, { icon: '🌬️', title: 'tuulilaite + varasto', text: 'varmempi, vaikutus rajalla', tone: 'plain' }], label: 'Valinta on kompromissi' }),
  ] }),
};
