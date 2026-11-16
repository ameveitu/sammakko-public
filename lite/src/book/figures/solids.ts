import type { Paint } from '../../engine/types';
import { C, figure, pill, tx } from './kit';

export { solids, unitCubes } from './solids3d.js';
export type { Solid, SolidKind } from './solids3d.js';

/** A cylinder opened flat: the side is a rectangle 2πr long and h wide, plus the bases. */
export function cylinderNet(o: { r: string; h: string; around: string; bases: 1 | 2; label: string }): Paint {
  let s = `<rect x="110" y="70" width="230" height="80" fill="#a9d4ef" stroke="${C.ink}" stroke-width="2"/>`;
  s += `<circle cx="70" cy="${o.bases === 2 ? 50 : 110}" r="34" fill="#7fbfe6" stroke="${C.ink}" stroke-width="2"/>`;
  if (o.bases === 2) s += `<circle cx="70" cy="150" r="34" fill="#7fbfe6" stroke="${C.ink}" stroke-width="2"/>`;
  s += `<line x1="70" y1="${o.bases === 2 ? 50 : 110}" x2="104" y2="${o.bases === 2 ? 50 : 110}" stroke="${C.red}" stroke-width="2"/>` + tx(87, (o.bases === 2 ? 50 : 110) - 6, o.r, { size: 12, fill: C.red });
  s += `<path d="M110 166 H340" stroke="${C.red}" stroke-width="2"/>` + tx(225, 184, o.around, { size: 13, fill: C.red });
  s += `<path d="M352 70 V150" stroke="${C.red}" stroke-width="2"/>` + tx(360, 114, o.h, { size: 13, fill: C.red, anchor: 'start' });
  s += pill(225, 114, 'vaippa', { size: 13 });
  if (o.bases === 1) s += tx(70, 164, 'yksi pohja', { size: 12, fill: C.soft });
  return figure(400, 196, s, o.label);
}
