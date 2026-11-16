import type { PageDraw } from '../pages';
import { cosmicAddress, dayNight, flow } from '../figures';

/** Day and night from the Earth's spin; our address in space. */
export const DRAW: Record<string, () => PageDraw> = {
  'ENV-PHY-DAYNIGHT-01': () => ({ beats: [
    dayNight({ island: 'day', label: 'Aurinkoon päin oleva puolisko on valoisa' }),
    dayNight({ island: 'day', label: 'Kotisaari on Aurinkoon päin: päivä' }),
    dayNight({ island: 'night', label: 'Puolen kierroksen jälkeen kotisaarella on yö' }),
  ] }),
  'PHY79-UNIVERSE-STRUCT': () => ({ beats: [
    flow({ steps: [{ icon: '🌙', text: 'Kuu', sub: 'kiertää Maata' }, { icon: '🌍', text: 'Maa', sub: 'kiertää Aurinkoa' }, { icon: '☀️', text: 'Aurinko', sub: 'tähti' }], label: 'Kuu kiertää Maata, Maa Aurinkoa' }),
    cosmicAddress({ label: 'Kuu, Maa–Kuu, Aurinkokunta, Linnunrata' }),
    cosmicAddress({ cluster: true, label: 'Tähtijoukko on tiivis ryhmä galaksin sisällä' }),
  ] }),
};
