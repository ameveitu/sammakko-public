import type { PageDraw } from '../pages';
import { cards, flow, formula, sequence, table } from '../figures';

const TILES = ['14', '16', '18', '20', '22'];

/** Logic, argument and mathematical text: list all cases, find a counterexample, chain reasons. */
export const DRAW: Record<string, () => PageDraw> = {
  'M79-COMB-01': () => ({ beats: [
    cards({ cards: [{ icon: '🛶', title: '2 reittiä', tone: 'cool' }, { icon: '⚓', title: '3 laituria', tone: 'warm' }], label: 'Kaksi reittiä ja kolme laituria' }),
    table({ head: ['', 'laituri 1', 'laituri 2', 'laituri 3'], rows: [['reitti 1', 'R1 L1', 'R1 L2', 'R1 L3'], ['reitti 2', '', '', '']], mark: 0, label: 'Reitti 1 yhdistetään kaikkiin laitureihin' }),
    table({ head: ['', 'laituri 1', 'laituri 2', 'laituri 3'], rows: [['reitti 1', 'R1 L1', 'R1 L2', 'R1 L3'], ['reitti 2', 'R2 L1', 'R2 L2', 'R2 L3']], label: '2 · 3 = 6 yhdistelmää, kukin kerran' }),
  ] }),
  'M79-ARG-01': () => ({ beats: [
    table({ head: ['pituus (cm)', ...TILES], rows: [['parillinen?', '?', '?', '?', '?', '?']], label: 'Viisi laattaa: 14, 16, 18, 20 ja 22 cm' }),
    table({ head: ['pituus (cm)', ...TILES], rows: [['parillinen?', '✓', '✓', '✓', '✓', '✓']], label: 'Jokainen tapaus tarkistettu: väite on tosi' }),
    table({ head: ['pituus (cm)', ...TILES], rows: [['yli 15 cm?', '✗', '✓', '✓', '✓', '✓']], label: 'Yksi vastaesimerkki, 14 cm, kumoaa väitteen' }),
  ] }),
  'M79-TEXT-01': () => ({ beats: [
    cards({ cards: [{ icon: '🧺', title: 'kori 1', text: '9 köyttä' }, { icon: '🧺', title: 'kori 2', text: 'vähintään 14 köyttä' }, { icon: '❓', title: 'kysymys', text: 'montako koriin 2?', tone: 'warm' }], label: 'Pullopostin tiedot ja kysymys' }),
    cards({ cards: [{ icon: '📄', title: 'annettu', text: 'kori 1: 9 köyttä', tone: 'plain' }, { icon: '❓', title: 'kysytty', text: 'kori 2', tone: 'warm' }, { icon: '📏', title: 'ehto', text: 'vähintään 14', tone: 'cool' }], label: 'Annettu, kysytty ja ehto erikseen' }),
    cards({ cards: [{ icon: '📏', title: 'vähintään 14', text: 'vastaus', mark: 'ok' }, { icon: '🧺', title: '9', text: 'koskee koria 1', mark: 'no' }], label: 'Kori 2 tarvitsee vähintään 14 köyttä' }),
  ] }),
  'M79-TEXT-02': () => ({ beats: [
    cards({ cards: [{ icon: '👥', title: '5 ryhmää' }, { icon: '📦', title: '7 kpl / ryhmä' }], label: 'Viisi ryhmää, kukin tarvitsee 7 kappaletta' }),
    flow({ steps: [{ icon: '🔢', text: 'mistä luvut' }, { icon: '✖️', text: 'mitä laskettiin' }, { icon: '✅', text: 'vastaus ja yksikkö' }], label: 'Hyvä viesti: luvut, lasku ja vastaus' }),
    formula({ lines: ['5 · 7 = 35', 'yhteensä 35 kpl'], note: 'ryhmiä 5, kukin tarvitsee 7 kpl', label: 'Viesti: 5 · 7 = 35, tarvitaan 35 kpl' }),
  ] }),
  'M79-TRUTH-01': () => ({ beats: [
    cards({ cards: [{ icon: '🪨', title: '7' }, { icon: '🪨', title: '10' }, { icon: '🪨', title: '6' }], label: 'Merkkikivissä luvut 7, 10 ja 6' }),
    cards({ cards: [{ icon: '🪨', title: '7', text: 'yli 6', mark: 'ok' }, { icon: '🪨', title: '10', text: 'yli 6', mark: 'ok' }, { icon: '🪨', title: '6', text: 'ei yli 6', mark: 'no' }], label: 'Kivi 6 kumoaa väitteen' }),
    cards({ cards: [{ icon: '❓', title: '”Onko jossakin 8?”', text: 'kysymys: ei totuusarvoa', tone: 'plain' }, { icon: '💬', title: '”Jossakin on parillinen”', text: 'väite: tosi', mark: 'ok' }], label: 'Kysymys ei ole väite' }),
  ] }),
  'M79-LOGIC-02': () => ({ beats: [
    sequence({ values: [4, 8, 12, 16], steps: ['+4', '+4', '+4'], note: 'x = 0, 1, 2, 3', label: 'Lyhtyjä 4, 8, 12, 16' }),
    formula({ lines: ['y = 4x + 4', '4 jokaista x:ää kohti, lisäksi 4'], label: 'Sääntö kaavana y = 4x + 4' }),
    formula({ lines: ['y = 4 · 7 + 4 = 32', 'x = 7'], label: 'x = 7: lyhtyjä 32' }),
  ] }),
  'M79-PROOF-01': () => ({ beats: [
    cards({ cards: [{ icon: '🪵', title: 'lauta 9 m' }, { icon: '🕳️', title: 'aukko 7 m' }, { icon: '🏗️', title: 'tuki 7 kg', text: 'kantokyky' }, { icon: '🧺', title: 'kori 5 kg' }], label: 'Tunnetut tiedot' }),
    cards({ cards: [{ icon: '📏', title: '9 m > 7 m', text: 'lauta yltää', mark: 'ok' }, { icon: '⚖️', title: '7 kg > 5 kg', text: 'tuki kantaa', mark: 'ok' }], label: 'Kaksi tarkistettua ehtoa' }),
    flow({ steps: [{ text: 'yltää ✓' }, { text: 'kantaa ✓' }, { icon: '🌉', text: 'silta toimii', mark: 'hot' }], label: 'Tavoite on ketjun viimeinen lenkki' }),
  ] }),
  'M79-LOGIC-01': () => ({ beats: [undefined, undefined,
    table({ head: ['pari', 'x + 3', 'sopii?'], rows: [['2 → 5', '2 + 3 = 5', '✓'], ['4 → 9', '4 + 3 = 7', '✗'], ['5 → 11', '5 + 3 = 8', '✗']], label: 'Sääntö testataan jokaisella parilla' }),
  ] }),
};
