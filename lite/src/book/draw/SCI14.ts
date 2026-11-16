import type { PageDraw } from '../pages';
import { bars, cards, flow, formula, meniscus, table, tare, tools } from '../figures';

const SOLVENTS = (o: { mark?: boolean; note?: string } = {}) => bars({
  bars: [{ label: 'liuotin 1', value: 700, text: '700 mg' }, { label: 'liuotin 2', value: 1100, text: '1100 mg', mark: o.mark }],
  max: 1300, axis: 'liuennut massa (mg)', ...(o.note ? { note: o.note } : {}), label: 'Liuottimeen 1 liukeni 700 mg, liuottimeen 2 1100 mg',
});
const THREE = (o: { water?: boolean; note?: string } = {}) => bars({
  bars: [{ label: 'vesi', value: 300, text: '300 mg', mark: o.water, ...(o.water ? { sub: 'M79-1' } : {}) }, { label: 'rasva', value: 600, text: '600 mg' }, { label: 'liuotin 3', value: 900, text: '900 mg' }],
  max: 1000, axis: 'liuennut massa (mg)', ...(o.note ? { note: o.note } : {}), label: 'Vesi 300 mg, rasva 600 mg, kolmas liuotin 900 mg',
});
const TRACE = (unit: boolean) => flow({ steps: [{ icon: '🧪', text: 'näyte', sub: unit ? 'M79-1' : undefined }, { icon: '⚖️', text: 'mittaus', sub: unit ? '300 mg' : undefined }, { icon: '📋', text: 'taulukon rivi', sub: unit ? '300 mg' : undefined }, { icon: '📊', text: 'pylväs', sub: unit ? '300 mg' : undefined }], label: 'Tietopolku: näyte, mittaus, taulukon rivi, pylväs' });

/** Investigation: readings as bars and tables, fair tests, observations and the trail of a value. */
export const DRAW: Record<string, () => PageDraw> = {
  'CHEM79-CONCLUSION': () => ({ beats: [
    SOLVENTS(),
    SOLVENTS({ mark: true, note: 'ero 1100 mg − 700 mg = 400 mg' }),
    cards({ cards: [{ icon: '🧪', title: 'aine A', tone: 'plain' }, { icon: '🫙', title: 'nämä 2 liuotinta', tone: 'plain' }, { icon: '🌡️', title: 'nämä olot', tone: 'plain' }], label: 'Johtopäätös koskee vain tutkittua: ainetta A, näitä liuottimia ja näitä oloja' }),
  ] }),
  'CHEM79-INVESTIGATION-EVAL': () => ({ beats: [
    cards({ cards: [{ icon: '🏷️', title: 'pullo A', text: 'etiketti kunnossa', mark: 'ok' }, { icon: '🏷️', title: 'pullo B', text: 'etiketti vaihtunut', mark: 'no' }], label: 'Pullon B etiketti on vaihtunut' }),
    cards({ cards: [{ icon: '🫙', title: 'liuotin?', text: 'yksi mahdollinen syy', tone: 'warm' }, { icon: '🧪', title: 'eri aine?', text: 'toinen mahdollinen syy', tone: 'warm' }], label: 'Ero voi johtua liuottimesta tai eri aineesta: varmaa johtopäätöstä ei saa' }),
    flow({ steps: [{ icon: '🔁', text: 'toista koe B', sub: 'oikealla aineella' }, { icon: '📒', text: 'säilytä vanhat tulokset' }], label: 'Koe B toistetaan oikealla aineella, vanhat tulokset säilytetään' }),
  ] }),
  'CHEM79-LAB-01': () => ({ beats: [
    tools({ items: [{ name: 'pieni mittapipetti', cap: '5000 µl', div: '100 µl', ticks: 50 }], label: 'Mittapipetti: 5000 µl, jakoväli 100 µl' }),
    tools({ items: [{ name: 'pieni mittapipetti', cap: '5000 µl', div: '100 µl', ticks: 50, ok: true }, { name: 'mittalasi', cap: '', div: '1000 µl', ticks: 10, ok: false }], label: 'Pipetin jakoväli 100 µl riittää, mittalasin 1000 µl on liian karkea' }),
    formula({ lines: ['7200 µl − 1800 µl = 5400 µl', '5400 µl + 1800 µl = 7200 µl'], note: 'vettä ei katoa siirrossa', label: 'Lähteeseen jää 5400 µl, yhteensä koko ajan 7200 µl' }),
  ] }),
  'CHEM79-OBS-01': () => ({ beats: [
    cards({ cards: [{ icon: '🫙', title: 'ennen', text: '0 kuplaa' }, { icon: '🫧', title: 'jälkeen', text: '10 kuplaa' }, { icon: '🌡️', title: 'mittari', text: '21 °C' }], label: 'Ennen 0 kuplaa, jälkeen 10 kuplaa, lämpötila 21 °C' }),
    cards({ cards: [{ icon: '👀', title: 'havainto', text: '10 kuplaa, 21 °C', tone: 'cool' }, { icon: '💭', title: 'tulkinta', text: '”kuplat ovat happea”', tone: 'warm' }], label: 'Havainto: mitä näkyi. Tulkinta: mitä arvellaan.' }),
    flow({ steps: [{ icon: '💭', text: 'tulkinta' }, { icon: '🔬', text: 'lisänäyttö', sub: 'kaasun testi tai vertailunäyte' }, { icon: '✅', text: 'tuettu tai hylätty' }], label: 'Tulkinta tarvitsee lisänäyttöä' }),
  ] }),
  'CHEM79-CONCL-01': () => ({ beats: [
    cards({ cards: [{ icon: '📊', title: 'tulos', text: 'liuottimeen 2 liukeni 400 mg enemmän', tone: 'cool' }, { icon: '⚖️', title: 'arvio', text: 'voiko tulokseen luottaa?', tone: 'plain' }], label: 'Raportissa tulos ja arvio sen luotettavuudesta' }),
    cards({ cards: [{ icon: '🫙', title: 'liuotin vaihtui', tone: 'plain' }, { icon: '🌡️', title: 'lämpötilakin muuttui?', mark: 'no' }], label: 'Jos kaksi asiaa muuttui, eron syytä ei voi tietää' }),
    bars({ bars: [{ label: 'liuotin 1', value: 700, text: '700 ± 50 mg' }, { label: 'liuotin 2', value: 710, text: '710 ± 50 mg' }], max: 1000, axis: 'liuennut massa (mg)', note: 'ero 10 mg on pienempi kuin epävarmuus', label: 'Lukemat 700 mg ja 710 mg, kummankin epävarmuus ±50 mg' }),
  ] }),
  'CHEM79-QUESTION-01': () => ({ beats: [
    flow({ steps: [{ icon: '🔀', text: 'muuttuu', sub: 'liuotin: vesi tai rasva' }, { icon: '⚖️', text: 'mitataan', sub: 'liuennut massa' }], label: 'Muuttuja on liuotin, tuloksena mitataan liuennut massa' }),
    cards({ cards: [{ icon: '❓', title: 'Liukeneeko A enemmän veteen vai rasvaan?', text: 'muut olot samat', tone: 'cool' }], label: 'Tutkittava kysymys rajaa vertailun' }),
    cards({ cards: [{ icon: '📏', title: 'veteen vai rasvaan?', text: 'vastataan mittaamalla', mark: 'ok' }, { icon: '😊', title: 'kumpi on kivempi?', text: 'ei voi mitata', mark: 'no' }], label: 'Tutkittavaan kysymykseen vastataan mittaamalla' }),
  ] }),
  'CHEM79-MEAS-01': () => ({ beats: [
    tare({ reading: '0 mg', note: 'astia vaa’alla, taaraus painettu', label: 'Taaraus nollaa tyhjän astian lukeman' }),
    tare({ reading: '4700 mg', sample: true, note: 'vain näytteen massa', label: 'Taarauksen jälkeen vaaka näyttää pelkän näytteen massan' }),
    meniscus('Tilavuus luetaan meniskin alimmasta kohdasta katse samalla korkeudella'),
  ] }),
  'CHEM79-PLAN-01': () => ({ beats: [
    cards({ cards: [{ icon: '🔀', title: 'muuttuu', text: 'vain liuotin', tone: 'warm' }, { icon: '🔒', title: 'pysyy samana', text: 'kaikki muu', tone: 'cool' }], label: 'Reilussa vertailussa muutetaan vain yhtä asiaa' }),
    table({ head: ['', 'koe 1', 'koe 2'], rows: [['liuotin', 'vesi', 'rasva'], ['aine A', '900 mg', '900 mg'], ['liuotinta', '11 g', '11 g'], ['lämpötila', 'sama', 'sama'], ['sekoitus', 'sama', 'sama']], mark: 0, label: 'Vain liuotin vaihtuu, muu pysyy samana' }),
    table({ head: ['toisto', 'vesi', 'rasva'], rows: [['1', '✓', '✓'], ['2', '✓', '✓'], ['3', '✓', '✓']], label: 'Jokainen koe tehdään kolme kertaa' }),
  ] }),
  'CHEM79-DATA-COLLECT': () => ({ beats: [
    THREE(),
    table({ head: ['näyte', 'liuotin', 'liuennut'], rows: [['M79-1', 'vesi', '300 mg'], ['M79-2', 'rasva', '600 mg'], ['M79-3', 'liuotin 3', '900 mg']], mark: 0, label: 'Jokainen lukema omalle rivilleen tunnuksen, olosuhteen ja yksikön kanssa' }),
    table({ head: ['näyte', 'liuotin', 'liuennut'], rows: [['M79-1', 'vesi', '300 mg'], ['M79-4', 'vesi', '?']], mark: 1, label: 'Puuttuva lukema merkitään kysymysmerkillä, ei nollalla' }),
  ] }),
  'CHEM79-DATA-PRESENT': () => ({ beats: [
    cards({ cards: [{ icon: '📋', title: 'taulukko', tone: 'plain' }, { icon: '📊', title: 'pylväsdiagrammi', text: 'jokaiselle liuottimelle oma pylväs', tone: 'cool' }], label: 'Vertailuun sopii pylväsdiagrammi' }),
    THREE({ note: 'akseli: suure ja yksikkö, alkaa nollasta' }),
    THREE({ note: 'alkuperäiset luvut, ei muutettuja' }),
  ] }),
  'CHEM79-DATA-01': () => ({ beats: [THREE({ water: true }), TRACE(false), TRACE(true)] }),
};
