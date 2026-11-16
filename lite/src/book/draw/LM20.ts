import type { PageDraw } from '../pages';
import { C, cards, figure, pill, tx } from '../figures';

const CARDS = (keep: string) => cards({ cards: [
  { icon: '🌺', title: 'A', text: 'punainen kukka', mark: keep === 'flowers' ? 'ok' : undefined, tone: keep === 'stones' ? 'plain' : undefined },
  { icon: '🪨', title: 'B', text: 'harmaa kivi', mark: keep === 'flowers' ? 'no' : keep === 'stones' ? 'ok' : undefined },
  { icon: '🌼', title: 'C', text: 'keltainen kukka', mark: keep === 'flowers' ? 'ok' : undefined, tone: keep === 'stones' ? 'plain' : undefined },
  { icon: '🌹', title: 'D', text: 'punainen kukka', mark: keep === 'flowers' ? 'ok' : undefined, tone: keep === 'stones' ? 'plain' : undefined },
], label: keep === 'flowers' ? 'Kukat A, C ja D kerätään, kivi B jää pois' : keep === 'stones' ? 'Kivien väreistä kerätään vain B' : 'Neljä havaintokorttia pihalta' });

/** Temperature every hour as a line chart: the line shows the rises and falls. */
const tempLine = () => {
  const T = [[8, 12], [9, 14], [10, 17], [11, 19], [12, 18], [13, 16]] as const;
  const X = (h: number) => 70 + (h - 8) * 58, Y = (t: number) => 164 - (t - 10) * 10;
  let s = `<line x1="52" y1="164" x2="380" y2="164" stroke="${C.ink}" stroke-width="2"/><line x1="52" y1="164" x2="52" y2="34" stroke="${C.ink}" stroke-width="2"/>`;
  for (const t of [10, 15, 20]) s += `<line x1="52" y1="${Y(t)}" x2="380" y2="${Y(t)}" stroke="${C.line}" stroke-dasharray="3 4"/>` + tx(44, Y(t) + 5, `${t}°`, { size: 12, anchor: 'end', fill: C.soft });
  s += `<polyline points="${T.map(([h, t]) => `${X(h)},${Y(t)}`).join(' ')}" fill="none" stroke="${C.red}" stroke-width="3" stroke-linejoin="round"/>`;
  for (const [h, t] of T) s += `<circle cx="${X(h)}" cy="${Y(t)}" r="5" fill="${C.paper}" stroke="${C.red}" stroke-width="2.5"/>` + tx(X(h), 184, `klo ${h}`, { size: 12, fill: C.soft });
  s += pill(X(11), Y(19) - 16, 'huippu', { size: 12 }) + tx(380, 206, 'aika →', { size: 12, anchor: 'end', fill: C.soft }) + tx(58, 28, 'lämpötila', { size: 12, anchor: 'start', fill: C.soft });
  return figure(400, 214, s, 'Lämpötila joka tunti: viiva nousee ja laskee');
};

/** Collecting data: the topic decides which cards are gathered. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-DATA-01': () => ({ beats: [CARDS(''), CARDS('flowers'), CARDS('stones')] }),
  'M-DATA-11': () => ({ beats: [undefined, tempLine()] }),
};
