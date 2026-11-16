import { expect } from 'vitest';
import { EXPEDITION_NODES } from '../src/content/expedition';
import { defaultPage, modelBeats } from '../src/book/default-page';
import { TEXT_LIMITS, type PageText } from '../src/book/text';

export const sentences = (text: string) => text.trim().split(/(?<=[.!?])\s+(?=[A-ZÅÄÖ0-9"„(–])/u).length;

/** Checks one node's rewritten page text: short beats, valid pictures and an answerable try. */
export function checkPageText(id: string, text: PageText) {
  const spec = EXPEDITION_NODES[id];
  expect(spec, `unknown node ${id}`).toBeDefined();
  const pictures = modelBeats(spec!).length;
  expect(text.beats.length, id).toBeGreaterThanOrEqual(1);
  expect(text.beats.length, id).toBeLessThanOrEqual(3);
  for (const beat of text.beats) {
    expect(beat.text.length, `${id}: ${beat.text}`).toBeLessThanOrEqual(TEXT_LIMITS.beatChars);
    expect(sentences(beat.text), `${id}: ${beat.text}`).toBeLessThanOrEqual(2);
    if (beat.more) expect(beat.more.length, `${id}: ${beat.more}`).toBeLessThanOrEqual(TEXT_LIMITS.moreChars);
    if (beat.pic !== undefined && beat.pic !== null) {
      expect(Number.isInteger(beat.pic), id).toBe(true);
      expect(beat.pic, `${id}: pic ${beat.pic} but the node has ${pictures} pictures`).toBeLessThan(pictures);
    }
    // figure: false keeps the 3D model of a picture, so there must be a picture to take it from.
    if (beat.figure === false) expect(beat.pic, `${id}: figure false without pic`).not.toBeNull();
  }
  if (typeof text.try === 'object') {
    const authored = text.try;
    expect(authored.say.length, `${id}: ${authored.say}`).toBeLessThanOrEqual(TEXT_LIMITS.sayChars);
    expect(authored.options.length, id).toBeGreaterThanOrEqual(2);
    expect(authored.options.length, id).toBeLessThanOrEqual(4);
    expect(new Set(authored.options).size, id).toBe(authored.options.length);
    for (const option of authored.options) expect(option.length, `${id}: ${option}`).toBeLessThanOrEqual(TEXT_LIMITS.optionChars);
    expect(authored.answer, id).toBeGreaterThanOrEqual(0);
    expect(authored.answer, id).toBeLessThan(authored.options.length);
    expect(authored.explain.length, `${id}: ${authored.explain}`).toBeLessThanOrEqual(TEXT_LIMITS.explainChars);
    if (authored.why) {
      expect(authored.why.length, id).toBe(authored.options.length);
      expect(authored.why[authored.answer] ?? null, id).toBeNull();
    }
  } else if (text.try === 'auto') {
    expect(defaultPage(spec!).makeTry, `${id}: try 'auto' but the node has no one-move item`).toBeDefined();
  }
}
