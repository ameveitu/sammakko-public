import type { PageDraw } from '../pages';
import { C, figure, pill, tx } from '../figures';

/** A raft with 2 rows of 4 seats. */
const raftSeats = () => {
  let s = `<rect x="96" y="40" width="208" height="112" rx="10" fill="#e8c890" stroke="#9a6a3a" stroke-width="3"/>`;
  for (let i = 1; i < 6; i++) s += `<line x1="96" y1="${40 + i * 18.7}" x2="304" y2="${40 + i * 18.7}" stroke="#c49a5e" stroke-width="1.5"/>`;
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) s += `<circle cx="${132 + c * 46}" cy="${74 + r * 44}" r="15" fill="${C.leaf}" stroke="${C.ink}" stroke-width="2"/>`;
  s += tx(84, 79, '1. rivi', { size: 12, anchor: 'end', fill: C.soft }) + tx(84, 123, '2. rivi', { size: 12, anchor: 'end', fill: C.soft })
    + tx(200, 30, '4 paikkaa rivissä', { size: 13, fill: C.soft }) + pill(200, 182, '2 × 4 = 8', { size: 16 });
  return figure(400, 194, s, 'Kaksi riviä, kummassakin neljä paikkaa');
};

/** Multiplication as rows: turning the picture swaps the factors, not the total. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-MUL-COMM': () => ({ beats: [raftSeats()] }),
};
