import type { PageDraw } from '../pages';
import { cards, flow, shadow, soundPath, table, waves } from '../figures';

const MOVED = () => shadow({ moved: 116, at: 88, label: 'Levy nousee, varjo nousee enemmän' });

/** Light and sound: straight rays and shadows, vibrations that travel through a medium. */
export const DRAW: Record<string, () => PageDraw> = {
  'ENV-PHY-LIGHT-OBS-01': () => ({ beats: [
    shadow({ label: 'Levy pysäyttää valon, seinään jää varjo' }),
    MOVED(),
    MOVED(),
  ] }),
  'ENV-PHY-SOUND-OBS-01': () => ({ beats: [
    waves({ items: [{ title: 'rummun kalvo', f: 3, a: 1, note: 'värähtelee' }], label: 'Kalvo värähtelee edestakaisin' }),
    waves({ items: [{ title: '300 kertaa/s', f: 3, a: 1, note: 'matalampi' }, { title: '400 kertaa/s', f: 4, a: 1, note: 'korkeampi' }], label: 'Nopeampi värähtely, korkeampi sävel' }),
    waves({ items: [{ title: 'kapea liike', f: 3, a: 0.45, note: 'hiljaisempi' }, { title: 'laaja liike', f: 3, a: 1, note: 'voimakkaampi' }], label: 'Laajempi liike, voimakkaampi ääni, sama sävel' }),
  ] }),
  'ENV-PHY-LIGHT-EXPLAIN-01': () => ({ beats: [
    flow({ steps: [{ icon: '💡', text: 'lähde', sub: 'lamppu' }, { icon: '🟪', text: 'este', sub: 'levy' }, { icon: '🧱', text: 'pinta', sub: 'seinä' }], label: 'Valon reitti: lähde, este, pinta' }),
    shadow({ label: 'Varjo jää sinne, minne suora valo ei pääse' }),
    shadow({ at: 120, label: 'Suora viiva lampusta esteen reunan ohi näyttää varjon rajan' }),
  ] }),
  'ENV-PHY-SOUND-EXPLAIN-01': () => ({ beats: [
    soundPath({ label: 'Kalvo tönii ilmaa, värähtely kulkee korvaan' }),
    flow({ steps: [{ icon: '🥁', text: 'lähde' }, { icon: '💨', text: 'väliaine', sub: 'ilma pysyy paikallaan' }, { icon: '👂', text: 'kuulija' }], label: 'Lähde, väliaine ja kuulija' }),
    soundPath({ vacuum: true, label: 'Tyhjiössä ei ole ainetta, joten ääni ei kulje' }),
  ] }),
  'ENV-PHY-LIGHT-01': () => ({ beats: [
    flow({ steps: [{ icon: '🔮', text: 'ennuste', sub: 'este nousee → varjo nousee' }, { icon: '🔦', text: 'koe' }, { icon: '💬', text: 'selitys' }], label: 'Ennuste, koe ja selitys' }),
    MOVED(),
    cards({ cards: [{ icon: '➡️', title: 'valo kulkee suoraan', tone: 'cool' }, { icon: '🛑', title: 'este pysäyttää valon', tone: 'cool' }, { icon: '🌑', title: 'varjo', text: 'minne valo ei pääse', tone: 'plain' }], label: 'Selitys: suora valo ja este' }),
  ] }),
  'ENV-PHY-SOUND-01': () => ({ beats: [
    cards({ cards: [{ icon: '〰️', title: 'taajuus', text: 'kuinka nopeasti' }, { icon: '↕️', title: 'laajuus', text: 'kuinka laajasti' }, { icon: '1️⃣', title: 'yksi kerrallaan', tone: 'warm' }], label: 'Muutetaan vain yhtä kerrallaan' }),
    table({ head: ['muutos', 'sävel', 'voimakkuus'], rows: [['300 → 400 Hz', 'korkenee', 'sama'], ['laajempi liike', 'sama', 'voimistuu']], label: 'Taajuus muuttaa säveltä, laajuus voimakkuutta' }),
    cards({ cards: [{ icon: '🎸', title: 'lyhyt, kireä kieli', text: 'korkea sävel', tone: 'cool' }, { icon: '👊', title: 'kova näppäys', text: 'voimakas ääni', tone: 'warm' }], label: 'Soittimissa sama ilmiö' }),
  ] }),
};
