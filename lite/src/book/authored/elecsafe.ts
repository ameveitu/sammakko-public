import type { Item, NodeSpec } from '../../engine/types';
import { rng } from '../../engine/rng';
import { mountElecStage } from '../stages/elec.js';
import type { BookPage, Try } from '../types';

/**
 * ENV-PHY-ELECSAFE-01 "Märkä laituri, ehjä valo": a broken cord sparks on a wet jetty.
 * Beats: the danger (copper shows, water conducts), what to do (keep away, warn friends, tell an adult:
 * Aava flies to Sulka), and how it is made safe (main switch off, an electrician mends the cord).
 * One try: what do you do first? After the answer the stage plays the whole safe story.
 */

const RIGHT = 'Pysyn kaukana, varoitan kavereita ja kerron aikuiselle';
const WRONG = [
  { text: 'Irrotan johdon itse pistorasiasta', why: 'Johtoon ja pistorasiaan ei kosketa. Aikuinen katkaisee sähköt pääkytkimestä.' },
  { text: 'Kuivaan veden pyyhkeellä', why: 'Vesi johtaa sähköä, joten veteen johdon lähellä ei kosketa.' },
  { text: 'Korjaan johdon teipillä', why: 'Teippi ei tee rikkinäisestä johdosta turvallista. Sähköasentaja korjaa sen.' },
];

function elecTry(spec: NodeSpec, seed: number): Try {
  const r = rng(seed);
  // The unplug mistake is always there; one of the two "fix it myself" mistakes joins it.
  const wrong = [WRONG[0]!, WRONG[seed % 2 === 0 ? 1 : 2]!];
  const options = r.shuffle([{ text: RIGHT, why: undefined as string | undefined }, ...wrong]);
  const item: Item = {
    say: 'Laiturilla kipinöi rikkinäinen johto. Mitä teet ensin?',
    task: {
      kind: 'choice', cols: 1,
      options: options.map(o => ({ text: o.text })),
      answer: options.findIndex(o => o.text === RIGHT),
      why: options.map(o => o.why),
    },
    explain: 'Rikkinäiseen johtoon ei kosketa. Kun kerrot aikuiselle, hän katkaisee sähköt turvallisesti.',
    tag: `kirja:${spec.id}:${seed % 2 === 0 ? 'towel' : 'tape'}`,
  };
  return { item, seed, phase: 'guided', rev: 'kirja1', view: 'try' };
}

export function elecPage(spec: NodeSpec): BookPage {
  return {
    id: spec.id,
    beats: [
      {
        text: 'Rikkinäisestä johdosta voi saada sähköiskun. Vesi johtaa sähköä, joten märällä laiturilla vaara on vielä suurempi.',
        more: 'Johto on rikki, jos sen kuori on revennyt ja kupari näkyy, jos se kipinöi tai jos siitä tulee palaneen hajua.',
        view: 'danger',
      },
      {
        text: 'Älä koske johtoon äläkä veteen sen lähellä. Pysy kaukana, varoita kavereita ja kerro heti aikuiselle.',
        more: 'Jos aikuista ei ole lähellä ja näet savua tai tulta, soita hätänumeroon 112.',
        view: 'tell',
      },
      {
        text: 'Aikuinen katkaisee sähköt pääkytkimestä. Sähköasentaja korjaa johdon, ja sitten valo palaa taas turvallisesti.',
        more: 'Teippi ei tee rikkinäisestä johdosta turvallista. Rikkinäistä laitetta ei käytetä, ennen kuin se on korjattu.',
        view: 'safe',
      },
    ],
    tries: 1,
    makeTry: seed => elecTry(spec, seed),
    stage: (host, options) => mountElecStage(host, options),
  };
}
