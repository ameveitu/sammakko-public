import type { PageDraw } from '../pages';
import { bars, cards, forces, formula, lifts } from '../figures';

/** Forces, work and power: arrows on things, lifts that take time. */
export const DRAW: Record<string, () => PageDraw> = {
  'ENV-PHY-FORCE-01': () => ({ beats: [
    forces({ thing: 'raft', forces: [{ dir: 'right', text: 'käsi työntää' }], moves: 'right', surface: 'water', label: 'Käsi työntää lauttaa oikealle' }),
    forces({ thing: 'raft', forces: [{ dir: 'right', text: 'voima' }], moves: 'right', surface: 'water', note: 'kaksi osapuolta: käsi ja lautta', label: 'Voimaan tarvitaan aina kaksi' }),
    forces({ thing: 'raft', forces: [{ dir: 'left', text: 'köysi vetää' }], moves: 'left', surface: 'water', label: 'Voima muuttaa liikettä omaan suuntaansa' }),
  ] }),
  'PHY79-INTERACT': () => ({ beats: [
    forces({ thing: 'box', forces: [{ dir: 'right', text: 'köysi vetää' }], surface: 'floor', note: 'kohde: kuorma · aiheuttaja: köysi', label: 'Köysi vetää kuormaa' }),
    cards({ cards: [{ icon: '🤝', title: 'kaksi kappaletta', text: 'vuorovaikutus', mark: 'ok' }, { icon: '🔁', title: 'kappale itseensä', mark: 'no' }], label: 'Voima syntyy kahden kappaleen vuorovaikutuksesta' }),
    cards({ cards: [{ icon: '🪢', title: 'köysi ja kuorma', text: 'kosketus', tone: 'warm' }, { icon: '🌍', title: 'Maa ja laatikko', text: 'etä', tone: 'cool' }, { icon: '🧲', title: 'magneetti ja naula', text: 'etä', tone: 'cool' }], label: 'Kosketus- ja etävuorovaikutus' }),
  ] }),
  'PHY79-FRICTION': () => ({ beats: [
    forces({ thing: 'box', forces: [{ dir: 'left', text: 'kitka' }], moves: 'right', surface: 'floor', label: 'Laatikko liukuu oikealle, kitka vaikuttaa vasemmalle' }),
    forces({ thing: 'box', forces: [{ dir: 'left', text: 'kitka' }], moves: 'right', surface: 'floor', note: 'kitka vastustaa liukumista', label: 'Kitka on vastakkainen liukumiselle' }),
    forces({ thing: 'box', forces: [{ dir: 'left', text: 'suuri kitka', long: 1.6 }], moves: 'right', surface: 'rough', label: 'Karkealla pinnalla kitka on suurempi' }),
  ] }),
  'PHY79-WORK-CONCEPT': () => ({ beats: [
    lifts({ items: [{ name: 'vinssi', force: '10 N', s: '2 m', t: 2 }], label: 'Vinssi nostaa koria 2 m voimalla 10 N' }),
    lifts({ items: [{ name: 'vinssi', force: '10 N', s: '2 m', t: 2, work: 'voima ja siirtymä samaan suuntaan' }], label: 'Voima siirtää koria voiman suuntaan: tehdään työtä' }),
    lifts({ items: [{ name: 'kannattelu', force: '10 N', s: '0 m', hold: true, work: 'siirtymä 0 m' }], label: 'Paikallaan pidettävä kori ei liiku' }),
  ] }),
  'PHY79-WORK-CALC': () => ({ beats: [
    lifts({ items: [{ name: 'vinssi', force: '6 N', s: '3 m', t: 2, work: 'W = 6 N · 3 m = 18 J' }], label: 'Työ 6 N · 3 m = 18 J' }),
    formula({ lines: ['W = F · s', '1 J = 1 N · m'], note: 'vakio voima siirtymän suuntaan', label: 'Työ on voima kertaa siirtymä' }),
  ] }),
  'PHY79-POWER-CONCEPT': () => ({ beats: [
    lifts({ items: [{ name: 'A', force: '10 N', s: '2 m', t: 2, work: '20 J' }, { name: 'B', force: '10 N', s: '2 m', t: 4, work: '20 J' }], label: 'A ja B tekevät saman 20 J työn, A 2 s:ssa ja B 4 s:ssa' }),
    cards({ cards: [{ icon: '🐇', title: 'A: 20 J 2 s:ssa', text: 'suurempi teho', mark: 'ok' }, { icon: '🐢', title: 'B: 20 J 4 s:ssa', text: 'pienempi teho', tone: 'plain' }], label: 'Teho kertoo, kuinka nopeasti työ tehdään' }),
    bars({ bars: [{ label: 'A', value: 10, text: '20 J / 2 s = 10 W' }, { label: 'B', value: 5, text: '20 J / 4 s = 5 W' }], max: 12, axis: 'teho (W)', label: 'A 10 W, B 5 W' }),
  ] }),
  'PHY79-POWER-CALC': () => ({ beats: [
    formula({ lines: ['W = 20 N · 3 m = 60 J', 'P = 60 J / 2 s = 30 W'], note: 'ensin työ, sitten teho', label: 'Työ 60 J, teho 30 W' }),
    bars({ bars: [{ label: '60 J 2 s:ssa', value: 30, text: '30 W' }, { label: '60 J 1 s:ssa', value: 60, text: '60 W', mark: true }], max: 70, axis: 'teho (W)', label: 'Puolet ajasta: kaksinkertainen teho' }),
  ] }),
  'PHY79-NETFORCE': () => ({ beats: [
    forces({ thing: 'cart', forces: [{ dir: 'right', text: 'A: 6 N' }, { dir: 'left', text: 'B: 6 N' }], surface: 'floor', label: 'Köysi A vetää oikealle 6 N, köysi B vasemmalle 6 N' }),
    forces({ thing: 'cart', forces: [{ dir: 'right', text: 'A: 6 N' }, { dir: 'left', text: 'B: 6 N' }], surface: 'floor', note: '6 N − 6 N = 0 N: voimat ovat tasapainossa', label: 'Yhtä suuret vastakkaiset voimat kumoavat toisensa' }),
    forces({ thing: 'cart', forces: [{ dir: 'right', text: '6 N' }, { dir: 'left', text: '4 N', long: 0.66 }], net: { dir: 'right', text: 'kokonaisvoima 2 N oikealle' }, surface: 'floor', note: '6 N − 4 N = 2 N', label: 'Oikealle 6 N, vasemmalle 4 N: kokonaisvoima 2 N oikealle' }),
  ] }),
};
