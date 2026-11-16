import type { PageDraw } from '../pages';
import { atom, bars, cards, charges, crystal, diffusion, molecule, nucleusScale, periodic, samples, scaleLevels, states } from '../figures';

const CO2 = ['O', 'C', 'O'];
const ABC = (mark?: 'A' | 'C') => samples({
  jars: [
    { name: 'A', items: [['Ar'], ['Ar'], ['Ar']], ...(mark === 'A' ? { mark: 'ok' as const, note: 'alkuaine' } : {}) },
    { name: 'B', items: [['Ar'], ['F', 'F'], ['Ar']] },
    { name: 'C', items: [CO2, CO2, CO2], ...(mark === 'C' ? { mark: 'ok' as const, note: 'yhdiste' } : {}) },
  ],
  label: 'Näyte A: argonatomeja. Näyte B: argonia ja fluorimolekyyli. Näyte C: hiilidioksidimolekyylejä.',
});
const particles = cards({ cards: [{ icon: '🔴', title: 'protoni', text: 'varaus +1', tone: 'warm' }, { icon: '⚪', title: 'neutroni', text: 'varaus 0', tone: 'plain' }, { icon: '🔵', title: 'elektroni', text: 'varaus −1', tone: 'cool' }], label: 'Protonin varaus +1, neutronin 0 ja elektronin −1' });
const fluorine = (note?: string) => atom({ symbol: 'F', name: 'fluori', p: 9, n: 10, shells: [2, 7], ...(note ? { note } : {}), label: 'Fluoriatomi: 9 protonia, 10 neutronia, 9 elektronia' });
const group1 = (k?: number) => bars({
  horizontal: true, max: 200, axis: 'sulamispiste (°C)',
  bars: [
    { label: 'Li · jakso 2', value: 180.5, text: '180,5 °C' },
    { label: 'Na · jakso 3', value: 97.8, text: '97,8 °C' },
    ...(k === undefined ? [] : [{ label: 'K · jakso 4', value: k || null, text: k ? '63,5 °C' : '?', mark: true }]),
    { label: 'Rb · jakso 5', value: 39.3, text: '39,3 °C' },
  ],
  label: 'Ryhmän 1 sulamispisteet laskevat alaspäin mentäessä',
});

/** Matter and atoms: sample jars, Bohr atoms, the periodic table, crystals and states of matter. */
export const DRAW: Record<string, () => PageDraw> = {
  'CHEM79-ELEMENT': () => ({ beats: [
    ABC(),
    ABC('A'),
    samples({ jars: [{ name: 'argon', items: [['Ar'], ['Ar'], ['Ar']], mark: 'ok', note: 'alkuaine' }, { name: 'fluori', items: [['F', 'F'], ['F', 'F'], ['F', 'F']], mark: 'ok', note: 'alkuaine' }], label: 'Argon yksittäisinä atomeina ja fluori pareina: kumpikin on alkuaine' }),
  ] }),
  'CHEM79-PERIODIC-01': () => ({ beats: [
    periodic({ mark: ['H', 'He', 'Li'], periods: 3, label: 'Vety 1, helium 2, litium 3' }),
    periodic({ mark: ['B', 'N', 'Na', 'Si', 'Ca'], periods: 4, label: 'Boori 5, typpi 7, natrium 11, pii 14 ja kalsium 20 taulukossa' }),
    periodic({ order: true, periods: 3, label: 'Järjestysluku kasvaa rivillä vasemmalta oikealle ja jatkuu seuraavan rivin alusta' }),
  ] }),
  'CHEM79-PERIOD-GROUP': () => ({ beats: [
    periodic({ group: 2, period: 2, periods: 4, label: 'Ryhmä on pystysarake, jakso vaakarivi' }),
    periodic({ group: 1, period: 1, mark: ['H'], periods: 4, label: 'Vety: ryhmä 1, jakso 1' }),
    periodic({ group: 1, mark: ['Li', 'Na'], periods: 4, label: 'Litium ja natrium ryhmässä 1, jaksoissa 2 ja 3' }),
  ] }),
  'CHEM79-ELEM-PROP': () => ({ beats: [group1(), group1(0), group1(63.5)] }),
  'CHEM79-STRUCTURE-MODEL-USE': () => ({ beats: [
    crystal({ label: 'Suolakiteessä Na⁺ ja Cl⁻ vuorottelevat' }),
    charges({ a: '+', b: '−', label: 'Plus ja miinus vetävät toisiaan' }),
    charges({ a: '+', b: '+', label: 'Plus hylkii plussaa' }),
  ] }),
  'CHEM79-MODEL-01': () => ({ beats: [
    diffusion({ n: 12, gas: 'Ar', label: '12 argonatomia leviää väliseinän molemmille puolille' }),
    diffusion({ n: 12, gas: 'Ne', label: 'Hajuhiukkaset leviävät nurkasta koko huoneeseen' }),
    crystal({ label: 'Rakennemalli: Na⁺ ja Cl⁻ vuorottelevat' }),
  ] }),
  'CHEM79-ATOM-01': () => ({ beats: [
    samples({ jars: [{ name: 'neonkaasu', items: [['Ne'], ['Ne']], note: '2 erillistä atomia' }], label: 'Astiassa neonkaasua: mallissa 2 erillistä neonatomia' }),
    atom({ symbol: 'Ne', name: 'neon', p: 10, n: 10, shells: [2, 8], label: 'Neonatomi: 10 protonia, 10 neutronia ja 10 elektronia' }),
    cards({ cards: [{ icon: '⚪', title: '1 atomi', text: 'ei kaasu, neste eikä kiinteä', tone: 'plain' }, { icon: '🫙', title: 'koko näyte', text: 'kaasu', tone: 'cool' }], label: 'Olomuoto on koko näytteen ominaisuus, ei yksittäisen atomin' }),
  ] }),
  'CHEM79-SCALE': () => ({ beats: [
    scaleLevels('Suolakide silmällä, suurennettuna ja hiukkasmallina: nyt silmällä', 0),
    scaleLevels('Suolakide silmällä, suurennettuna ja hiukkasmallina: nyt suurennos', 1),
    scaleLevels('Suolakide silmällä, suurennettuna ja hiukkasmallina: nyt hiukkasmalli', 2),
  ] }),
  'CHEM79-ATOM-NUCLEUS': () => ({ beats: [
    atom({ symbol: 'Na', name: 'natrium', p: 11, n: 12, shells: [2, 8, 1], zoomNucleus: true, label: 'Natriumatomi: ydin keskellä, elektronit verhossa' }),
    nucleusScale('Jos atomi olisi stadion, ydin olisi herne keskellä'),
    atom({ symbol: 'Li', name: 'litium', p: 3, n: 4, shells: [2, 1], lose: true, note: '3 protonia: yhä litium', label: 'Litiumatomista irtoaa elektroni, mutta ydin ja alkuaine pysyvät' }),
  ] }),
  'CHEM79-COMPOUND': () => ({ beats: [
    molecule({ atoms: CO2, bonds: 'double', name: 'hiilidioksidi', formula: 'CO₂', label: 'Hiilidioksidimolekyyli: yksi hiiliatomi ja kaksi happiatomia' }),
    ABC('C'),
    samples({ jars: [{ name: 'B', items: [['Ar'], CO2, ['Ar']], note: 'seos' }, { name: 'C', items: [CO2, CO2, CO2], mark: 'ok', note: 'yhdiste' }], label: 'Näyte B on seos, näyte C yhdiste' }),
  ] }),
  'CHEM79-PROTON': () => ({ beats: [
    fluorine(),
    particles,
    fluorine('ytimen varaus +9'),
  ] }),
  'CHEM79-ELECTRON': () => ({ beats: [
    atom({ symbol: 'He', name: 'helium', p: 2, n: 2, shells: [2], label: 'Heliumatomi: kaksi elektronia ytimen ympärillä' }),
    atom({ symbol: 'He', name: 'helium', p: 2, n: 2, shells: [2], note: '+2 − 2 = 0', label: 'Kaksi protonia ja kaksi elektronia: varaus 0' }),
    fluorine('+9 − 9 = 0'),
  ] }),
  'CHEM79-NEUTRON': () => ({ beats: [
    particles,
    bars({ bars: [{ label: 'protoni', value: 1, text: '≈ 1' }, { label: 'neutroni', value: 1, text: '≈ 1', mark: true }, { label: 'elektroni', value: 0.02, text: '1/1836' }], max: 1.2, axis: 'massa (protonin massoina)', label: 'Neutroni on suunnilleen yhtä painava kuin protoni' }),
    atom({ symbol: 'C', name: 'hiili', p: 6, n: 6, shells: [2, 4], note: 'ytimen varaus +6', label: 'Hiiliatomi: 6 protonia ja 6 neutronia' }),
  ] }),
  'CHEM79-COMP-MODEL': () => ({ beats: [
    molecule({ atoms: CO2, bonds: 'double', name: 'hiilidioksidi', formula: 'CO₂', label: 'Kaava CO₂: yksi hiili ja kaksi happea' }),
    molecule({ atoms: CO2, bonds: 'double', name: 'hiilidioksidi', formula: 'CO₂', count: '1 + 2 = 3 atomia', label: 'Yhdessä CO₂-molekyylissä on 3 atomia' }),
    crystal({ a: ['Mg', 'O'], charges: ['²⁺', '²⁻'], label: 'Magnesiumoksidin hila: Mg²⁺ ja O²⁻ vuorottelevat' }),
  ] }),
  'CHEM79-STATE-01': () => ({ beats: [
    states({ n: 13, boxes: [{ state: 'solid', title: 'sali A', note: '−21 °C' }, { state: 'liquid', title: 'sali B', note: '25 °C' }, { state: 'gas', title: 'sali C', note: '127 °C' }], label: 'Sama vesi kolmessa lämpötilassa' }),
    states({ n: 13, boxes: [{ state: 'solid', title: 'sali A: jää', note: '−21 °C' }], label: 'Jäässä molekyylit pysyvät järjestyksessä ja värähtelevät' }),
    states({ n: 13, boxes: [{ state: 'liquid', title: 'sali B: neste', note: '25 °C' }, { state: 'gas', title: 'sali C: höyry', note: '127 °C' }], label: 'Nesteessä molekyylit liukuvat, höyryssä ne liikkuvat vapaasti' }),
  ] }),
  'CHEM79-ATOMICNUM': () => ({ beats: [
    atom({ symbol: 'Li', name: 'litium', p: 3, n: 4, shells: [2, 1], note: 'järjestysluku 3', label: 'Litiumin järjestysluku 3: ytimessä 3 protonia' }),
    periodic({ mark: ['F'], periods: 2, label: 'Järjestysluku 9 on fluori' }),
    fluorine('9 protonia = fluori'),
  ] }),
  'CHEM79-STATECHANGE': () => ({ beats: [
    states({ n: 13, arrow: 'lämmitys', boxes: [{ state: 'solid', title: 'jää', note: '−21 °C' }, { state: 'liquid', title: 'vesi', note: '27 °C' }], label: 'Jää lämmitetään vedeksi' }),
    states({ n: 13, arrow: 'sulaminen', boxes: [{ state: 'solid', title: '13 molekyyliä' }, { state: 'liquid', title: '13 molekyyliä' }], label: 'Samat 13 molekyyliä: järjestys purkautuu' }),
    cards({ cards: [{ icon: '🔢', title: 'sama määrä', text: '13 molekyyliä', mark: 'ok' }, { icon: '📏', title: 'sama koko', mark: 'ok' }, { icon: '🔀', title: 'muuttuu', text: 'liike ja välimatkat' }], label: 'Olomuodon muutos: molekyylit pysyvät, liike ja välimatkat muuttuvat' }),
  ] }),
};
