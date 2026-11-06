import type { Item, NodeSpec, Task } from '../engine/types';
import type { Rng } from '../engine/rng';
import { cases } from './kit';
import { fmt } from './fi';
import type { QuantityBoard } from './models/quantity';
import { quantityArt } from './scenes/quantity-workbench';

export interface ChangedAmountItem extends Item {
  quantityModel: QuantityBoard;
  changeModel: { before: number; signedPercent: number; unit: 'l' | 'm'; };
}

/** Exact seeded amounts. The given percent always refers to the original amount. */
export function changedAmount(before: number, signedPercent: number): number {
  if (!Number.isFinite(before) || before <= 0 || !Number.isFinite(signedPercent) || signedPercent < -100) {
    throw new RangeError('The original amount must be positive and the remaining amount nonnegative');
  }
  return before * (100 + signedPercent) / 100;
}

function question(r: Rng, expression: boolean, transfer = false): Omit<ChangedAmountItem, 'tag'> {
  const before = r.pick(transfer ? [40, 60, 80] : [40, 80, 120]);
  const signedPercent = transfer ? -r.pick([10, 25, 40]) : r.pick([-40, -25, 10, 25, 50, 150]);
  const unit = transfer ? 'm' : 'l';
  const after = changedAmount(before, signedPercent), magnitude = Math.abs(signedPercent);
  const amountName = transfer ? 'Köyttä ennen leikkaamista' : 'Suunniteltu vesivara';
  const action = signedPercent < 0 ? 'vähenee' : 'kasvaa';
  const description = transfer ? `Köyden pituudesta kuluu ${magnitude} % leikkaushukkaan.` : `Suunniteltu varasto ${action} ${magnitude} % lähtömäärästä.`;
  const quantityModel: QuantityBoard = {
    kind: 'quantity-board', view: 'ruler', unit, scaleMaximum: 3 * before,
    reference: `${amountName.toLocaleLowerCase('fi')}, ${before} ${unit}`,
    rows: [{ label: amountName, amount: before, base: true },
      { label: signedPercent < 0 ? 'Vähennettävä määrä' : 'Lisättävä määrä', amount: null },
      { label: 'Muutoksen jälkeen', amount: null }],
    notes: [description],
  };
  const task: Task = expression ? {
    kind: 'build', mode: 'expr', target: `${before}*(1${signedPercent < 0 ? '-' : '+'}${magnitude}/100)`, max: 15,
    requiredNumbers: [before, magnitude],
    tokens: [...new Set([String(before), String(magnitude), '100', '1', '+', '-', '*', '/', '(', ')'])],
    whyAt: { [`${before} * ${magnitude} / 100`]: 'Tämä laskee vain muutoksen määrän. Uudessa määrässä on mukana myös alkuperäinen määrä.' },
  } : { kind: 'numeric', answer: after, unit, whyAt: {
    [before * magnitude / 100]: 'Tämä on muutoksen määrä. Lisää se alkuperäiseen määrään tai vähennä siitä tehtävän mukaan.',
    [before + signedPercent]: 'Prosenttiluku ei ole litra- tai metrimäärä. Laske osuus alkuperäisestä määrästä.',
  } };
  return {
    changeModel: { before, signedPercent, unit }, quantityModel, scene: quantityArt(quantityModel), task,
    afterCorrect: quantityArt({ ...quantityModel, rows: [quantityModel.rows[0]!,
      { label: signedPercent < 0 ? 'Vähennettävä määrä' : 'Lisättävä määrä', amount: before * magnitude / 100 },
      { label: 'Muutoksen jälkeen', amount: after }],
    }),
    say: expression ? 'Rakenna uusi kokonaismäärä antava lasku. Käytä lähtömäärää ja annettua prosenttilukua.' : transfer ? 'Kuinka monta metriä köyttä jää käyttöön?' : 'Kuinka monta litraa suunniteltuun varastoon tulee muutoksen jälkeen?',
    hint: 'Lähtömäärä on 100 %. Laske ensin muutos tästä lähtömäärästä ja huomioi sitten, kasvaako vai väheneekö kokonaismäärä.',
    explain: `${magnitude} % lähtömäärästä on ${before} · ${magnitude} / 100 = ${fmt(before * magnitude / 100)} ${unit}. Uusi määrä on ${before} ${signedPercent < 0 ? '−' : '+'} ${fmt(before * magnitude / 100)} = ${fmt(after)} ${unit}.`,
  };
}

export const changedAmountSpec: NodeSpec = {
  id: 'M79-PCT-CHANGED', stop: 'Sadekausivaran suunnitelma', icon: '💧',
  rev: 'exp690-changed-amount-v1', validRevs: ['exp690-changed-amount-v1'],
  intro: 'Aava ja majava suunnittelevat uutta vesivaraa. Muutoksen osuus lasketaan aina nimetystä lähtömäärästä.',
  goal: 'Opit laskemaan uuden kokonaismäärän prosentuaalisen lisäyksen tai vähennyksen jälkeen.',
  reward: 'Varastotaulussa on uusi määrä ja sen lähtökohta. Majava voi mitoittaa suunnitelman sivuportin.',
  produce: ['new-amount', 'new-expression', 'transfer'], produceWhat: 'muuttuneen kokonaismäärän tai sitä vastaavan laskun tuottamista',
  demo: () => {
    const model: QuantityBoard = { kind: 'quantity-board', view: 'ledger', unit: 'l', reference: 'alkuperäinen 80 litran määrä',
      rows: [{ label: 'Alkuperäinen määrä', amount: 80, base: true }, { label: 'Lisäys 25 %', amount: 20 }, { label: 'Uusi kokonaismäärä', amount: 100 }] };
    return [{ say: 'Lähtömäärä 80 litraa on 100 %. Lisäys 25 % on 20 litraa. Uudessa määrässä on 80 + 20 = 100 litraa.', scene: quantityArt(model) },
      { say: 'Jos sama määrä vähenee 25 %, vähennetään samat 20 litraa. Jäljelle jää 60 litraa. Uusi kokonaismäärä ja muutosmäärä ovat eri asioita.',
        scene: quantityArt({ ...model, rows: [model.rows[0]!, { label: 'Vähennys 25 %', amount: 20 }, { label: 'Jäljelle jää', amount: 60 }] }) }];
  },
  item: cases({ 'new-amount': r => question(r, false), 'new-expression': r => question(r, true) }, r => question(r, false, true)),
};

export const changedAmountEvidence = {
  [changedAmountSpec.id]: { families: ['new-amount', 'new-expression'],
    limit: 'Näyttö koskee yhtä prosentuaalista muutosta nimetystä lähtöarvosta ja sen laskun rakentamista. Peräkkäiset muutokset, alkuperäisen arvon ratkaiseminen ja todellinen virtaus tutkitaan erikseen.' },
};
