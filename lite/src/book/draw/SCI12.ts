import type { PageDraw } from '../pages';
import { bars, cards, chargeFlow, charges, circuit, coil, electronTransfer, flow, formula, magnetPick, magnets, symbols, table, uiGraph, voltageDrop } from '../figures';

/** Electricity and magnetism: circuit diagrams with moving charge, meters and the U–I line. */
export const DRAW: Record<string, () => PageDraw> = {
  'ENV-PHY-DEVICE-01': () => ({ beats: [
    circuit({ top: [{ kind: 'switch', open: true, label: 'kytkin auki' }, { kind: 'lamp', label: 'lamppu' }], label: 'Lyhdyn piiri: kytkin auki, lamppu ei pala' }),
    circuit({ top: [{ kind: 'switch', label: 'kytkin kiinni' }, { kind: 'lamp', label: 'lamppu' }], label: 'Umpinainen reitti: sähkö kulkee paristosta lampun kautta takaisin' }),
    cards({ cards: [{ icon: '💡', title: 'kytkin kiinni', text: 'reitti on umpinainen', mark: 'ok' }, { icon: '✂️', title: 'kytkin auki', text: 'reitti katkeaa', mark: 'no' }], label: 'Kytkin kiinni: lamppu palaa. Kytkin auki: lamppu sammuu.' }),
  ] }),
  'PHY79-CHARGE': () => ({ beats: [
    charges({ a: '+', b: '+', label: 'Kaksi positiivista varausta hylkivät toisiaan' }),
    charges({ a: '−', b: '−', colors: ['#f6b3aa', '#b9d3f6'], label: 'Punainen ja sininen pallo, molemmissa merkki −: väri ei kerro varausta' }),
  ] }),
  'PHY79-MAGNET': () => ({ beats: [
    magnets({ facing: 'NN', label: 'N-navat vastakkain: magneetit hylkivät' }),
    magnetPick('Magneetti nostaa rautaisen klemmarin mutta ei kuparikolikkoa'),
  ] }),
  'PHY79-CIRCUIT-CLOSED': () => ({ beats: [
    circuit({ source: '7 V', top: [{ kind: 'lamp', label: '8 Ω' }, { kind: 'switch', label: 'kytkin' }], label: 'Suljettu piiri: plusnavasta lampun ja kytkimen kautta miinusnapaan' }),
    circuit({ source: '7 V', top: [{ kind: 'lamp', label: '8 Ω' }, { kind: 'switch', open: true, label: 'katko' }], label: 'Yksi katko: lamppu sammuu' }),
    circuit({ source: '7 V', top: [{ kind: 'lamp', label: '8 Ω' }], short: true, label: 'Oikosulku: johto napojen välissä, lamppu ei pala' }),
  ] }),
  'PHY79-CIRCUIT-COMPONENTS': () => ({ beats: [
    symbols('Kytkentäkaavion merkit: paristo, kytkin, lamppu, vastus ja mittarit'),
    circuit({ source: 'paristo', top: [{ kind: 'switch', label: 'kytkin' }, { kind: 'lamp', label: 'lamppu' }], label: 'Paristo, kytkin, johtimet ja lamppu samassa piirissä' }),
  ] }),
  'PHY79-CHARGING': () => ({ beats: [
    electronTransfer({ n: 3, label: 'Kolme elektronia siirtyy A:sta B:hen: A on +3, B on −3' }),
    formula({ lines: ['(+3) + (−3) = 0', 'varaus vain jakautuu uudelleen'], label: 'Kokonaisvaraus pysyy nollana' }),
  ] }),
  'PHY79-CIRCUIT-01': () => ({ beats: [
    circuit({ source: '7 V', top: [{ kind: 'switch', label: 'kytkin' }, { kind: 'lamp', label: '8 Ω' }], label: 'Lyhdyn piiri: lähde, kytkin ja lamppu' }),
    flow({ steps: [{ icon: '🔋', text: 'sähköenergia' }, { icon: '💡', text: 'lamppu' }, { icon: '✨', text: 'valo ja lämpö' }], label: 'Lamppu muuntaa sähköenergiaa valoksi ja lämmöksi' }),
  ] }),
  'PHY79-CURRENT': () => ({ beats: [
    chargeFlow({ perSecond: '15 C / 3 s = 5 A', label: 'Varausta kulkee mittauskohdan ohi: 15 C kolmessa sekunnissa' }),
    formula({ lines: ['I = Q / t', '1 A = 1 C/s'], note: 'joka sekunti 5 C kulkee mittauskohdan ohi', label: 'Sähkövirran kaava ja yksikkö' }),
  ] }),
  'PHY79-VOLTAGE': () => ({ beats: [
    voltageDrop({ high: 'A', low: 'B', value: 'U = 15 J / 3 C = 5 V', label: 'Varaus kulkee pisteestä A pisteeseen B ja luovuttaa energiaa' }),
    formula({ lines: ['U = E / Q', '1 V = 1 J/C'], note: 'jännite on kahden pisteen välinen ero', label: 'Jännitteen kaava ja yksikkö' }),
  ] }),
  'PHY79-MEAS-I': () => ({ beats: [
    circuit({ source: '12 V', branches: [[{ kind: 'ammeter' }, { kind: 'lamp', label: '2 Ω' }], [{ kind: 'resistor', label: '8 Ω' }]], label: 'Virtamittari sarjassa lampun haarassa' }),
    circuit({ source: '12 V', branches: [[{ kind: 'ammeter', reading: '6 A' }, { kind: 'lamp', label: '2 Ω' }], [{ kind: 'resistor', label: '8 Ω' }]], label: 'Mittari näyttää lampun haaran virran 6 A' }),
    cards({ cards: [{ icon: 'Ⓐ', title: 'sarjaan', text: 'haaran johto avataan', mark: 'ok' }, { icon: 'Ⓐ', title: 'rinnan lampun kanssa', mark: 'no' }, { icon: 'Ⓐ', title: 'suoraan napoihin', mark: 'no' }], label: 'Virtamittari kytketään sarjaan, ei rinnan eikä napoihin' }),
  ] }),
  'PHY79-MEAS-U': () => ({ beats: [
    circuit({ source: '12 V', top: [{ kind: 'lamp', label: '2 Ω' }, { kind: 'resistor', label: '8 Ω' }], across: { at: 0 }, label: 'Jännitemittari rinnan lampun kanssa' }),
    circuit({ source: '12 V', top: [{ kind: 'lamp', label: '2 Ω' }, { kind: 'resistor', label: '8 Ω' }], across: { at: 0, reading: '2,4 V' }, label: 'Mittari näyttää lampun jännitteen 2,4 V' }),
  ] }),
  'PHY79-ELECTROMAG': () => ({ beats: [
    coil({ north: 'right', turns: 11, label: 'Virrallinen käämi on magneetti: N-napa oikealla' }),
    coil({ north: 'left', turns: 11, label: 'Virran suunta käännetty: N-napa vasemmalla' }),
  ] }),
  'PHY79-SERIES-CURRENT': () => ({ beats: [
    circuit({ source: '12 V', top: [{ kind: 'ammeter', reading: '1,33 A' }, { kind: 'resistor', label: 'A 3 Ω' }, { kind: 'resistor', label: 'B 6 Ω' }, { kind: 'ammeter', reading: '1,33 A' }], label: 'Sarjapiiri: mittari näyttää 1,33 A ennen osaa A ja osan B jälkeen' }),
    flow({ steps: [{ text: 'varaus sisään', sub: '1,33 A' }, { text: 'osa A', sub: 'energiaa muuntuu' }, { text: 'osa B', sub: 'energiaa muuntuu' }, { text: 'varaus ulos', sub: '1,33 A' }], label: 'Virta ei kulu: sama virta kulkee molempien osien läpi' }),
    circuit({ source: '12 V', top: [{ kind: 'resistor', label: 'A 3 Ω' }, { kind: 'resistor', label: 'B 6 Ω' }], across: { at: 0, reading: '4 V' }, label: 'Osan A yli 4 V, joten osan B yli jää 8 V' }),
  ] }),
  'PHY79-SERIES-VOLTAGE': () => ({ beats: [
    circuit({ source: '12 V', top: [{ kind: 'resistor', label: 'A 3 Ω' }, { kind: 'resistor', label: 'B 3 Ω' }], across: { at: 0, reading: '6 V' }, label: 'Sarjapiiri: osan A yli mitataan 6 V' }),
    bars({ bars: [{ label: 'A 3 Ω', value: 4, text: '4 V' }, { label: 'B 6 Ω', value: 8, text: '8 V', mark: true }], max: 12, axis: 'jännite', line: { at: 12, text: 'lähde 12 V' }, label: 'Osilla 3 Ω ja 6 Ω jännite jakautuu 4 V ja 8 V' }),
  ] }),
  'PHY79-PARALLEL-CURRENT': () => ({ beats: [
    circuit({ source: '12 V', top: [{ kind: 'ammeter', reading: '8 A' }], branches: [[{ kind: 'ammeter', reading: '4 A' }, { kind: 'resistor', label: '3 Ω' }], [{ kind: 'ammeter', reading: '4 A' }, { kind: 'resistor', label: '3 Ω' }]], label: 'Rinnanpiiri: haaroissa 4 A ja 4 A, lähteen kautta 8 A' }),
    circuit({ source: '12 V', top: [{ kind: 'ammeter', reading: '4 A' }], branches: [[{ kind: 'ammeter', reading: '4 A' }, { kind: 'resistor', label: '3 Ω' }]], label: 'Haara B poistettu: lähdevirta 4 A, haaran A virta yhä 4 A' }),
  ] }),
  'PHY79-PARALLEL-VOLTAGE': () => ({ beats: [
    circuit({ source: '12 V', branches: [[{ kind: 'resistor', label: '3 Ω', reading: '12 V' }], [{ kind: 'resistor', label: '3 Ω', reading: '12 V' }]], label: 'Molemmat haarat samoissa navoissa: kummankin yli 12 V' }),
    circuit({ source: '12 V', top: [{ kind: 'ammeter', reading: '8 A' }], branches: [[{ kind: 'ammeter', reading: '4 A' }, { kind: 'resistor', label: '3 Ω' }], [{ kind: 'ammeter', reading: '4 A' }, { kind: 'resistor', label: '3 Ω' }]], label: 'Virta jakautuu haaroihin: 4 A ja 4 A, yhteensä 8 A' }),
  ] }),
  'PHY79-UI-REL': () => ({ beats: [
    table({ head: ['U', 'I', 'U / I'], rows: [['4 V', '1 A', '4 Ω'], ['8 V', '2 A', '4 Ω'], ['12 V', '3 A', '4 Ω']], label: 'Komponentin A mittaukset: jännite ja virta kasvavat samassa suhteessa' }),
    uiGraph({ points: [[4, 1], [8, 2], [12, 3]], maxU: 16, maxI: 4, label: 'Mittauspisteet ovat origon kautta kulkevalla suoralla' }),
    uiGraph({ points: [[4, 1], [8, 2], [12, 3]], maxU: 16, maxI: 4, lamp: true, label: 'Ohminen vastus on suora, hehkulampun käyrä taipuu' }),
  ] }),
  'PHY79-SERIES': () => ({ beats: [
    circuit({ source: '12 V', top: [{ kind: 'ammeter', reading: '2 A' }, { kind: 'resistor', label: 'A 3 Ω' }, { kind: 'resistor', label: 'B 3 Ω' }, { kind: 'ammeter', reading: '2 A' }], label: 'Sarjapiirin virta on sama joka kohdassa: 2 A' }),
    bars({ bars: [{ label: 'A', value: 6, text: '6 V' }, { label: 'B', value: 6, text: '6 V' }], max: 12, axis: 'jännite', line: { at: 12, text: 'yhteensä 12 V' }, label: 'Osien jännitteet 6 V ja 6 V ovat yhteensä lähteen 12 V' }),
  ] }),
  'PHY79-GENERATION': () => ({ beats: [
    flow({ steps: [{ icon: '💧', text: 'vesi virtaa' }, { icon: '🧲', text: 'magneetti pyörii', sub: 'käämin lähellä' }, { icon: '⚡', text: 'käämiin jännite' }], label: 'Generaattori: liike kääntää magneettia, käämiin syntyy jännite' }),
    flow({ steps: [{ icon: '💧', text: 'vesi pysähtyy', mark: 'no' }, { icon: '🧲', text: 'magneetti seisoo' }, { icon: '⚫', text: 'ei sähköä', mark: 'no' }], label: 'Kun vesi pysähtyy, sähköä ei synny' }),
  ] }),
  'PHY79-RESISTANCE': () => ({ beats: [
    formula({ lines: ['R = U / I', '4 V / 1 A = 4 Ω'], note: 'resistanssin yksikkö on ohmi, Ω', label: 'Resistanssi on jännitteen ja virran suhde' }),
    uiGraph({ points: [[4, 1], [8, 2], [12, 3]], maxU: 16, maxI: 4, label: 'A:n pisteet suoralla: U/I on aina 4 Ω' }),
    uiGraph({ points: [[4, 1], [8, 2], [12, 3]], maxU: 16, maxI: 4, lamp: true, label: 'Hehkulampun käyrä taipuu: resistanssi kasvaa' }),
  ] }),
  'PHY79-OHM': () => ({ beats: [
    formula({ lines: ['U = R · I', 'R = 5 V / 1 A = 5 Ω', 'U = 5 Ω · 2 A = 10 V'], label: 'Ensin resistanssi, sitten Ohmin laki' }),
    uiGraph({ points: [[5, 1], [10, 2], [20, 4]], maxU: 20, maxI: 4, label: 'Resistanssi pysyy 5 ohmina virroilla 1–4 A' }),
  ] }),
  'PHY79-ELEC-POWER': () => ({ beats: [
    formula({ lines: ['P = U · I', '6 V · 2 A = 12 W'], label: 'Teho on jännitteen ja virran tulo' }),
    cards({ cards: [{ icon: '⏱️', title: '1 s', text: '12 J' }, { icon: '⏱️', title: '2 s', text: '24 J' }, { icon: '⏱️', title: '10 s', text: '120 J' }], label: '12 W: joka sekunti 12 J energiaa' }),
  ] }),
  'PHY79-ELEC-ENERGY': () => ({ beats: [
    bars({ bars: [{ label: '1 h', value: 120, text: '120 Wh' }, { label: '2 h', value: 240, text: '240 Wh' }, { label: '3 h', value: 360, text: '360 Wh', mark: true }], max: 400, axis: 'energia', label: '120 W:n merkki: energiaa kertyy 120 Wh joka tunti' }),
    formula({ lines: ['1 kWh = 1000 Wh', '360 Wh = 0,36 kWh'], label: 'Wattitunnit kilowattitunneiksi' }),
  ] }),
};
