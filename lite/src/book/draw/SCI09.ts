import type { PageDraw } from '../pages';
import { bars, cards, flow, readings, ruler, table } from '../figures';

const VARY = flow({ steps: [{ icon: '🔀', text: 'muutetaan', sub: 'kallistus 10° tai 14°' }, { icon: '⏱️', text: 'mitataan', sub: 'vaunun kulkuaika' }], label: 'Muutetaan kallistusta, mitataan kulkuaika' });

/** Investigation and measurement: what is changed and measured, units, resolution and digits. */
export const DRAW: Record<string, () => PageDraw> = {
  'PHY79-QUESTION-01': () => ({ beats: [
    cards({ cards: [{ icon: '📐', title: 'kallistus 10°' }, { icon: '📐', title: 'kallistus 14°' }, { icon: '🔒', title: 'vaunu ja rata samat', tone: 'cool' }], label: 'Vain kallistus vaihtuu' }),
    VARY,
    cards({ cards: [{ icon: '⏱️', title: 'Miten kallistus vaikuttaa kulkuaikaan?', mark: 'ok' }, { icon: '🤔', title: 'Onko jyrkempi rata parempi?', text: '”parempi” jää epäselväksi', mark: 'no' }], label: 'Hyvään kysymykseen vastataan mittaamalla' }),
  ] }),
  'PHY79-PLAN-01': () => ({ beats: [
    VARY,
    cards({ cards: [{ icon: '🚃', title: 'sama vaunu' }, { icon: '🛤️', title: 'sama rata' }, { icon: '📍', title: 'sama lähtökohta' }], label: 'Muut tekijät vakioidaan' }),
    table({ head: ['toisto', '10°', '14°'], rows: [['1', '✓', '✓'], ['2', '✓', '✓'], ['3', '✓', '✓']], label: 'Kumpikin kallistus mitataan kolme kertaa' }),
  ] }),
  'PHY79-SI-01': () => ({ beats: [
    cards({ cards: [{ icon: '📏', title: 'suure', text: 'pituus' }, { icon: '📐', title: 'yksikkö', text: 'metri' }, { icon: '🔤', title: 'tunnus', text: 'm' }], label: 'Suure, yksikkö ja yksikön tunnus' }),
    table({ head: ['suure', 'yksikkö', 'tunnus'], rows: [['pituus', 'metri', 'm'], ['massa', 'kilogramma', 'kg'], ['aika', 'sekunti', 's'], ['sähkövirta', 'ampeeri', 'A'], ['lämpötila', 'kelvin', 'K']], label: 'SI-yksiköitä' }),
    cards({ cards: [{ icon: '⏱️', title: 'minuutti', text: 'ei SI-yksikkö', mark: 'no' }, { icon: '🔠', title: 'N, W', text: 'henkilön mukaan: iso kirjain', tone: 'cool' }], label: 'Minuutti ei ole SI-yksikkö. Henkilön mukaan nimetyt tunnukset isolla.' }),
  ] }),
  'PHY79-MEAS-01': () => ({ beats: [
    ruler({ length: 8, max: 15, label: 'Kortti mitataan 0–15 cm:n viivaimella' }),
    ruler({ length: 8, max: 15, zeroOff: 1, label: 'Nolla sivussa: koko lukema on väärin' }),
    flow({ steps: [{ icon: '▶️', text: 'käynnistä', sub: 'kun liike alkaa' }, { icon: '⛵', text: 'matka' }, { icon: '⏹️', text: 'pysäytä', sub: 'kun liike päättyy' }], label: 'Kello käyntiin lähdössä, pysäytys perillä' }),
  ] }),
  'PHY79-MEAS-PRECISION': () => ({ beats: [
    readings({ stepName: 'resoluutio', from: 9.6, to: 10.6, step: 0.2, values: [10.0, 10.2, 10.0], label: 'Resoluutio 0,2 cm: toistot 10,0, 10,2 ja 10,0 cm' }),
    readings({ stepName: 'resoluutio', from: 9.6, to: 10.8, step: 0.2, values: [10.0, 10.6], diff: [10.0, 10.6], label: 'Ero 0,6 cm on kolme 0,2 cm:n askelta' }),
    cards({ cards: [{ icon: '📏', title: 'väline A', text: 'resoluutio 0,5 cm riittää', mark: 'ok' }, { icon: '🔬', title: '0,01 cm:n väline', text: 'ei tarvita', tone: 'plain' }], label: 'Tarkinta välinettä ei aina tarvita' }),
  ] }),
  'PHY79-REPORTED-DIGITS': () => ({ beats: [
    cards({ cards: [{ icon: '📟', title: 'mittari näyttää', text: '10 cm' }, { icon: '📝', title: 'tulos', text: '10 cm', mark: 'ok' }], label: 'Tulos yhtä tarkasti kuin mittari näyttää' }),
    cards({ cards: [{ icon: '📝', title: '10 cm', mark: 'ok' }, { icon: '📝', title: '10,000 cm', text: 'väittää liian tarkaksi', mark: 'no' }], label: 'Lisänollat väittäisivät mittauksen tarkemmaksi' }),
    cards({ cards: [{ icon: '📟', title: 'resoluutio 0,1 cm', text: 'lukema 12,3 cm' }, { icon: '📝', title: 'tulos', text: '12,3 cm', mark: 'ok' }], label: 'Numeroita yhtä monta kuin mittari antaa' }),
  ] }),
  'PHY79-PREC-01': () => ({ beats: [
    readings({ stepName: 'resoluutio', from: 9.7, to: 10.3, step: 0.1, values: [10.0, 10.1, 9.9], label: 'Resoluutio 0,1 cm: toistot 10,0, 10,1 ja 9,9 cm' }),
    readings({ stepName: 'resoluutio', from: 9.7, to: 10.3, step: 0.1, values: [10.0, 10.1, 9.9], diff: [9.9, 10.1], label: 'Toistot vaihtelevat 0,2 cm' }),
    readings({ stepName: 'resoluutio', from: 9.7, to: 10.5, step: 0.1, values: [10.0, 10.3], diff: [10.0, 10.3], label: 'Ero 0,3 cm on suurempi kuin vaihtelu' }),
  ] }),
  'PHY79-RESULT-EVAL': () => ({ beats: [undefined,
    bars({ bars: [{ label: '0 s', value: 0, text: '0 m' }, { label: '1 s', value: 4, text: '4 m' }, { label: '2 s', value: 9, text: '9 m?', mark: true }, { label: '3 s', value: 12, text: '12 m' }], max: 14, axis: 'matka', label: 'Jos 2 s:ssa olisi 9 m, se poikkeaisi säännöstä' }),
    flow({ steps: [{ icon: '🔍', text: 'tarkista olosuhteet' }, { icon: '🔁', text: 'toista mittaus' }, { icon: '🧭', text: 'päätä vasta sitten' }], label: 'Poikkeavaa arvoa ei poisteta ilman selvitystä' }),
  ] }),
  'PHY79-CONCL-01': () => ({ beats: [undefined, undefined,
    cards({ cards: [{ icon: '1️⃣', title: 'yksi pari', text: 'sääntöä ei voi tarkistaa', mark: 'no' }, { icon: '📋', title: 'neljä paria', text: 'sääntö tarkistettu', mark: 'ok' }], label: 'Yksi mittapari ei riitä päätökseen' }),
  ] }),
  'PHY79-PREDICT-01': () => ({ beats: [undefined, undefined,
    bars({ bars: [{ label: '1 s', value: 4, text: '4 m' }, { label: '3 s', value: 12, text: '12 m' }, { label: '5 s', value: 20, text: '20 m' }, { label: '6 s', value: null, sub: 'yli alueen' }], max: 24, axis: 'matka', label: 'Käyttöalue 0–5 s: 6 s jää ulkopuolelle' }),
  ] }),
};
