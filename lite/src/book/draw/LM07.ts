import type { PageDraw } from '../pages';
import { cards, formula, numberLine, table } from '../figures';

/** Mental strategies, rounding and estimates. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-CALC-STRAT': () => ({ beats: [
    formula({ lines: ['287 + 98 = ?', '98 on 2 vähemmän kuin 100'], note: 'lähellä tasasataa', label: '98 on lähellä sataa' }),
    undefined,
    cards({ cards: [{ icon: '🎯', title: 'pyöreä luku ja korjaus', text: 'kun luku on lähellä tasakymmentä tai -sataa', tone: 'cool' }, { icon: '🧮', title: 'sarakkeittain', text: 'käy kaikille luvuille', tone: 'plain' }], label: 'Valitse lukuihin sopiva tapa' }),
  ] }),
  'M-ROUND-01': () => ({ beats: [
    numberLine({ from: 30, to: 40, step: 1, marks: [{ at: 33, text: '33' }], jumps: [{ from: 33, to: 30, text: '3' }, { from: 33, to: 40, text: '7' }], label: '33 on 3 päässä 30:stä ja 7 päässä 40:stä' }),
    undefined,
    numberLine({ from: 30, to: 40, step: 1, marks: [{ at: 35, text: '35 ≈ 40' }], jumps: [{ from: 35, to: 40, text: 'keskeltä ylöspäin' }], label: 'Täsmälleen keskeltä pyöristetään suurempaan' }),
  ] }),
  'M-EST-01': () => ({ beats: [
    table({ head: ['luku', '≈ lähin kymmen'], rows: [['367', '370'], ['189', '190']], label: 'Pyöristetään lähimpään kymmeneen' }),
  ] }),
  'M-EST-02': () => ({ beats: [
    table({ head: ['', 'pienin', 'suurin'], rows: [['1. määrä', '200', '300'], ['2. määrä', '60', '90'], ['summa', '260', '390']], mark: 2, label: 'Summa on välillä 260–390' }),
  ] }),
};
