import type { PageDraw } from '../pages';
import { bars, cards, table } from '../figures';

/** Thinking tools: change one thing, swap sides with the viewer, say only what was looked at. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-TH-05': () => ({ beats: [
    cards({ cards: [{ icon: '🍂', title: 'sama vene' }, { icon: '📍', title: 'sama lähtö' }, { icon: '↪️', title: 'kourun suunta', text: 'vain tämä muuttuu', mark: 'ok' }], label: 'Aava kääntää vain kourun suunnan' }),
    table({ head: ['', 'koe 1', 'koe 2'], rows: [['vene', 'lehti', 'lehti'], ['lähtö', 'kivi', 'kivi'], ['kouru', '↖ vasen', '↗ oikea']], mark: 2, label: 'Yksi muutos: tiedetään, mikä sen teki' }),
  ] }),
  'M-TH-06': () => ({ beats: [
    cards({ cards: [{ icon: '🐸', title: 'Loikka', text: 'katsoo rannalta' }, { icon: '🪵', title: 'laituri', text: 'kiinnitykset paikallaan', tone: 'plain' }, { icon: '🛶', title: 'Aava', text: 'katsoo vedestä' }], label: 'Sama laituri, kaksi katsojaa' }),
    table({ head: ['katsoja', 'vasen', 'oikea'], rows: [['rannalta', '🔴 punainen', '🔵 sininen'], ['vedestä', '🔵 sininen', '🔴 punainen']], label: 'Vastakkaiselta puolelta vasen ja oikea vaihtuvat' }),
  ] }),
  'M-WORK-03': () => ({ beats: [
    bars({ bars: [{ label: 'kuoppa 1', value: 7, text: '7' }, { label: 'kuoppa 2', value: 10, text: '10' }, { label: 'kuoppa 3', value: 6, text: '6' }], max: 12, axis: 'jälkiä', label: 'Kolme katsottua kuoppaa: 7, 10 ja 6 jälkeä' }),
    bars({ bars: [{ label: 'kuoppa 1', value: 7, text: '7' }, { label: 'kuoppa 2', value: 10, text: '10' }, { label: 'kuoppa 3', value: 6, text: '6' }, { label: 'muut', value: null, text: '?' }], max: 12, axis: 'jälkiä', label: 'Muista kuopista ei tiedetä mitään' }),
  ] }),
};
