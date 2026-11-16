import { describe, expect, it } from 'vitest';
import { EXPEDITION_NODES } from '../src/content/expedition';
import { CATALOG } from '../src/engine/catalog';
import { check } from '../src/engine/check';
import { STORY_ORDER } from '../src/engine/story-route';
import { ONE_MOVE_KINDS, splitText } from '../src/book/default-page';
import { PAGE_TEXT, bookPage } from '../src/book/pages';
import { checkPageText } from './book-text-check';

describe('Saaristo theory book', () => {
  it('splits long explanations after two sentences', () => {
    expect(splitText('Yksi. Kaksi. Kolme.')).toEqual({ text: 'Yksi. Kaksi.', more: 'Kolme.' });
    expect(splitText('Lyhyt.')).toEqual({ text: 'Lyhyt.' });
  });

  it('gives every one of the 690 stops a page with at least one beat', () => {
    expect(STORY_ORDER).toHaveLength(CATALOG.length);
    for (const id of STORY_ORDER) {
      const spec = EXPEDITION_NODES[id];
      expect(spec, id).toBeDefined();
      const page = bookPage(spec!);
      expect(page.beats.length, id).toBeGreaterThan(0);
      for (const beat of page.beats) expect(beat.text.trim().length, id).toBeGreaterThan(0);
    }
  });

  it('only offers tries that take one move and can be answered right', () => {
    for (const id of STORY_ORDER) {
      const page = bookPage(EXPEDITION_NODES[id]!);
      const attempt = page.makeTry?.(4242, 0);
      if (!attempt) continue;
      const task = attempt.item.task;
      expect(ONE_MOVE_KINDS.has(task.kind), `${id}: ${task.kind}`).toBe(true);
      if (task.kind === 'choice') {
        expect(task.answer, id).toBeGreaterThanOrEqual(0);
        expect(task.answer, id).toBeLessThan(task.options.length);
        expect(check(task, { kind: 'choice', index: task.answer }).ok, id).toBe(true);
        const wrong = task.options.findIndex((_, i) => i !== task.answer);
        if (wrong >= 0) expect(check(task, { kind: 'choice', index: wrong }).ok, id).toBe(false);
      } else if (task.kind === 'numeric') {
        expect(check(task, { kind: 'numeric', value: task.answer }).ok, id).toBe(true);
      }
      expect(attempt.item.explain.trim().length, id).toBeGreaterThan(0);
    }
  });

  it('keeps rewritten page text short, consistent and answerable', () => {
    for (const [id, text] of Object.entries(PAGE_TEXT)) checkPageText(id, text);
  });

  it('shuffles authored options with the seed but keeps the right answer right', () => {
    const entry = Object.entries(PAGE_TEXT).find(([, text]) => typeof text.try === 'object');
    if (!entry) return;
    const page = bookPage(EXPEDITION_NODES[entry[0]]!);
    const answers = new Set<string>();
    for (let seed = 1; seed < 30; seed++) {
      const item = page.makeTry!(seed, 0)!.item;
      if (item.task.kind !== 'choice') throw new Error('authored try must be a choice');
      const authored = entry[1].try as Exclude<typeof entry[1]['try'], string>;
      expect(item.task.options[item.task.answer]!.text).toBe(authored.options[authored.answer]);
      answers.add(String(item.task.answer));
    }
    expect(answers.size).toBeGreaterThan(1);
  });
});
