import type { Item, NodeSpec } from '../../engine/types';
import { SEASONS, SPIN_RIGHT, mountSpaceStage } from '../stages/space.js';
import type { BookPage, Try } from '../types';

/**
 * ENV-PHY-SPACE-01 "Aurinko, Maa ja Kuu": the Sun, the Earth and the Moon on a 3D stage.
 * Beats: the system (rocket visits), day and night (Sisi sleeps on the night side),
 * seasons (the tilted axis keeps its direction). Tries: move the Earth to winter or summer,
 * then spin it so Sisi can sleep. The stage answers by itself, so the options keep a fixed order.
 */

const SEASON_OPTIONS = [
  'Talven kohta: pohjoinen kallistuu poispäin Auringosta',
  'Kevään kohta: akseli on sivuttain Aurinkoon nähden',
  'Kesän kohta: pohjoinen kallistuu Aurinkoa kohti',
  'Syksyn kohta: akseli on sivuttain Aurinkoon nähden',
];
const SEASON_WHY = [
  'Tässä pohjoinen kallistuu poispäin Auringosta, joten siellä on talvi.',
  'Tässä akseli ei kallistu Aurinkoa kohti eikä poispäin: pohjoisessa on kevät.',
  'Tässä pohjoinen kallistuu Aurinkoa kohti, joten siellä on kesä.',
  'Tässä akseli ei kallistu Aurinkoa kohti eikä poispäin: pohjoisessa on syksy.',
];

function seasonTry(spec: NodeSpec, seed: number): Try {
  const target = seed % 2 === 0 ? 'winter' : 'summer';
  const answer = SEASONS.indexOf(target);
  const item: Item = {
    say: target === 'winter'
      ? 'Siirrä Maata radalla, kunnes Aavalla ja Loikalla on talvi.'
      : 'Siirrä Maata radalla, kunnes Aavalla ja Loikalla on kesä.',
    task: {
      kind: 'choice', cols: 2,
      options: SEASON_OPTIONS.map(text => ({ text })),
      answer,
      why: SEASON_WHY.map((why, i) => (i === answer ? undefined : why)),
    },
    explain: target === 'winter'
      ? 'Talvi tulee, kun pohjoinen kallistuu poispäin Auringosta: valo tulee vinosti ja päivät ovat lyhyitä.'
      : 'Kesä tulee, kun pohjoinen kallistuu Aurinkoa kohti: Aurinko paistaa korkealta ja päivät ovat pitkiä.',
    tag: `kirja:${spec.id}:${target}`,
  };
  return { item, seed, phase: 'guided', rev: 'kirja1', view: `try-season:${target}` };
}

const SPIN_OPTIONS = [
  'Sisi-liskon puoli kääntyy Aurinkoon päin',
  'Maa siirtyy radalla toiseen kohtaan',
  'Sisi-liskon puoli kääntyy poispäin Auringosta',
];

function spinTry(spec: NodeSpec, seed: number): Try {
  const item: Item = {
    say: 'Pyöritä Maata, kunnes väsynyt Sisi-lisko pääsee nukkumaan.',
    task: {
      kind: 'choice', cols: 1,
      options: SPIN_OPTIONS.map(text => ({ text })),
      answer: SPIN_RIGHT,
      why: [
        'Silloin Sisillä on keskipäivä, ja valo pitää sen hereillä.',
        'Radalla siirtyminen vaihtaa vuodenaikaa, ei päivää ja yötä.',
        undefined,
      ],
    },
    explain: 'Yö tulee, kun Maa pyörähtää ja Sisi-liskon puoli kääntyy poispäin Auringosta.',
    tag: `kirja:${spec.id}:spin`,
  };
  return { item, seed, phase: 'guided', rev: 'kirja1', view: 'try-spin' };
}

export function spacePage(spec: NodeSpec): BookPage {
  return {
    id: spec.id,
    beats: [
      {
        text: 'Aurinko on tähti, joka loistaa omaa valoaan. Maa kiertää Aurinkoa kerran vuodessa, ja Kuu kiertää Maata.',
        more: 'Kuvassa koot ja välimatkat eivät ole oikeassa mittakaavassa. Jos Aurinko olisi jalkapallon kokoinen, Maa olisi nuppineulan pää 24 metrin päässä ja Kuu hiekanjyvä 6 senttimetrin päässä Maasta.',
        view: 'system',
      },
      {
        text: 'Maa pyörii akselinsa ympäri kerran vuorokaudessa. Aurinkoon päin olevalla puolella on päivä ja toisella puolella yö.',
        more: 'Aurinko ei kierrä Maata, vaikka siltä näyttää. Maa pyörii, joten Aurinko näyttää nousevan idästä ja laskevan länteen. Sisi-lisko nukkuu, kun sen puoli on kääntynyt poispäin Auringosta.',
        view: 'day',
      },
      {
        text: 'Maan akseli on vähän kallellaan ja osoittaa aina samaan suuntaan. Kun pohjoinen kallistuu Aurinkoa kohti, siellä on kesä, ja kun poispäin, talvi.',
        more: 'Kesällä Aurinko paistaa korkealta ja päivät ovat pitkiä. Talvella valo tulee vinosti ja päivät ovat lyhyitä. Vuodenajat eivät johdu etäisyydestä: Maa on Aurinkoa lähimpänä tammikuussa.',
        view: 'seasons',
      },
    ],
    tries: 2,
    makeTry: (seed, part) => (part === 1 ? spinTry(spec, seed) : seasonTry(spec, seed)),
    stage: (host, options) => mountSpaceStage(host, options),
  };
}
