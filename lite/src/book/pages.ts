import type { NodeSpec, Paint } from '../engine/types';
import type { BookPage } from './types';
import type { PageText } from './text';
import { defaultPage } from './default-page';
import { spacePage } from './authored/space';
import { elecPage } from './authored/elecsafe';

/** Authored pages (own 3D stage) replace the default page of their node. */
const AUTHORED: Record<string, (spec: NodeSpec) => BookPage> = {
  'ENV-PHY-SPACE-01': spacePage,
  'ENV-PHY-ELECSAFE-01': elecPage,
};
export function registerPage(id: string, make: (spec: NodeSpec) => BookPage) { AUTHORED[id] = make; }
export const hasAuthoredPage = (id: string) => id in AUTHORED;

/** Rewritten page text, one file per family. */
const files = import.meta.glob<{ TEXT: Record<string, PageText> }>('./text/*.ts', { eager: true });
export const PAGE_TEXT: Readonly<Record<string, PageText>> = Object.assign({}, ...Object.values(files).map(file => file.TEXT));

/**
 * Pictures drawn by the book itself (`book/figures`), one file per family: `./draw/<familyId>.ts`
 * exports `DRAW: Record<nodeId, () => PageDraw>`. Built only when the page is opened.
 */
export interface PageDraw { beats?: (Paint | undefined)[]; try?: Paint }
const drawFiles = import.meta.glob<{ DRAW: Record<string, () => PageDraw> }>('./draw/*.ts', { eager: true });

/** Two files may draw different beats of one page (`<family>-more.ts` fills beats the first file left empty). */
const mergeDraws = (a: () => PageDraw, b: () => PageDraw) => (): PageDraw => {
  const x = a(), y = b(), n = Math.max(x.beats?.length ?? 0, y.beats?.length ?? 0);
  return { beats: Array.from({ length: n }, (_, i) => x.beats?.[i] ?? y.beats?.[i]), try: x.try ?? y.try };
};
export const PAGE_DRAW: Readonly<Record<string, () => PageDraw>> = Object.values(drawFiles).reduce<Record<string, () => PageDraw>>((all, file) => {
  for (const [id, make] of Object.entries(file.DRAW)) all[id] = all[id] ? mergeDraws(all[id], make) : make;
  return all;
}, {});

/** Puts the drawn pictures on the page text: beat i gets beats[i], an authored try gets `try`. */
export function withDraw(text: PageText | undefined, draw: PageDraw | undefined): PageText | undefined {
  if (!text || !draw) return text;
  const beats = text.beats.map((beat, i) => (draw.beats?.[i] ? { ...beat, draw: draw.beats[i] } : beat));
  const tryText = draw.try && typeof text.try === 'object' ? { ...text.try, draw: draw.try } : text.try;
  return { ...text, beats, try: tryText };
}

const cache = new Map<string, BookPage>();

/** The theory-book page of a node: an authored page, rewritten text over the node's pictures, or the default page. */
export function bookPage(spec: NodeSpec): BookPage {
  const known = cache.get(spec.id);
  if (known) return known;
  const page = AUTHORED[spec.id]?.(spec) ?? defaultPage(spec, withDraw(PAGE_TEXT[spec.id], PAGE_DRAW[spec.id]?.()));
  cache.set(spec.id, page);
  return page;
}
