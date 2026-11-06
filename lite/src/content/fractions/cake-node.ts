import type { NodeSpec } from '../../engine/types';
import { cakePartyDemo } from '../scenes/cake-party';
import { cakeExplanation, cakeHint, cakePrompt, makeCakeTask } from './cake-table';

const REVISION = 'cake-table-picture-2026-11-05';

export const CAKE_NODE: NodeSpec = {
  id: 'M-FRAC-13',
  stop: 'Juhlapöydän kakut',
  icon: '🍰',
  goal: 'Näet, miten eri kokoiset palat leikataan yhtä suuriksi, jotta ne voi laskea yhteen.',
  intro: 'Juhlapöydässä on kaksi kakkua. Aava ja Loikka leikkaavat jäljelle jääneet palat yhtä suuriksi ja kokoavat ne lautasille.',
  reward: 'Lautaset ovat valmiina yhteiseen juhlaan!',
  rev: REVISION,
  validRevs: [REVISION],
  demo: cakePartyDemo,
  item(r, phase) {
    const task = makeCakeTask(r.int(0, 2 ** 31 - 1), phase);
    return {
      say: cakePrompt(task),
      task,
      tag: phase === 'transfer' ? 'transfer' : task.family,
      ...(phase === 'guided' ? { hint: cakeHint(task) } : {}),
      explain: cakeExplanation(task),
    };
  },
};
