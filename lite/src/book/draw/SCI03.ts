import type { PageDraw } from '../pages';
import { cards, forces } from '../figures';

/** A push changes motion: sideways it turns, forwards it speeds up, a rough surface slows. */
export const DRAW: Record<string, () => PageDraw> = {
  'ENV-PHY-CAUSE-MOTION-01': () => ({ beats: [
    cards({ cards: [{ icon: '🟣', title: 'kiekko A', text: 'ei työnnetä' }, { icon: '🟣', title: 'kiekko B', text: 'työnnetään sivulta', tone: 'warm' }], label: 'Kaksi kiekkoa liukuu samaa vauhtia' }),
    cards({ cards: [{ icon: '➡️', title: 'A jatkaa suoraan' }, { icon: '↪️', title: 'B kääntyy', text: 'työntö sivulle muutti suunnan', tone: 'warm' }], label: 'Sivuttainen työntö muuttaa suuntaa' }),
    forces({ thing: 'puck', forces: [{ dir: 'left', text: 'karhea pinta jarruttaa' }], moves: 'right', surface: 'rough', label: 'Karhea pinta jarruttaa, kunnes kiekko pysähtyy' }),
  ] }),
};
