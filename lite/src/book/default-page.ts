import { rng, type Rng } from '../engine/rng';
import type { Item, NodeSpec, Phase } from '../engine/types';
import type { AuthoredTry, PageText } from './text';
import type { Beat, BookPage, Try } from './types';

/** Task kinds that a theory-book try may use: one tap or one number, checked at once. */
export const ONE_MOVE_KINDS = new Set(['choice', 'numeric']);

/** Splits a text after its first two sentences (about 25 words); the rest goes behind "Lisää". */
export function splitText(text: string, sentences = 2): { text: string; more?: string } {
  const parts = text.trim().split(/(?<=[.!?])\s+(?=[A-ZÅÄÖ0-9"„(–])/u);
  if (parts.length <= sentences) return { text: text.trim() };
  // A first sentence that is already long stands alone.
  const take = parts[0]!.length > 110 ? 1 : sentences;
  return { text: parts.slice(0, take).join(' '), more: parts.slice(take).join(' ') };
}

function beat(text: string, rest: Omit<Beat, 'text'>): Beat {
  const split = splitText(text);
  return { ...rest, text: split.text, ...(split.more ? { more: split.more } : {}) };
}

/** The node's own model steps as beats: the pictures every page draws from. */
export function modelBeats(spec: NodeSpec, seed = 20261110): Beat[] {
  const demos = spec.demo(rng(seed));
  const beats: Beat[] = [];
  if (spec.light && demos.length === 2) {
    const [question, answer] = demos as [typeof demos[0], typeof demos[0]];
    beats.push(beat(answer.say, { example: question.say, scene: answer.scene, step: answer }));
  } else {
    const seen = new Set<string>();
    for (const step of demos) {
      if (!step.say.trim() || seen.has(step.say)) continue;
      seen.add(step.say);
      beats.push(beat(step.say, { scene: step.scene, step }));
    }
  }
  if (!beats.length) beats.push({ text: spec.goal ?? spec.intro });
  return beats;
}

function shuffled<T>(list: readonly T[], r: Rng): { items: T[]; from: number[] } {
  const from = r.shuffle(list.map((_, i) => i));
  return { items: from.map(i => list[i]!), from };
}

/** An authored choice question as an item. The option order depends on the seed. */
export function authoredItem(spec: NodeSpec, authored: AuthoredTry, seed: number): Item {
  const { items, from } = shuffled(authored.options, rng(seed));
  return {
    say: authored.say,
    task: {
      kind: 'choice', cols: items.length === 4 ? 2 : items.length,
      options: items.map(text => ({ text })),
      answer: from.indexOf(authored.answer),
      ...(authored.why ? { why: from.map(i => authored.why?.[i] ?? undefined) } : {}),
    },
    explain: authored.explain,
    ...(authored.draw ? { scene: authored.draw } : {}),
    tag: `kirja:${spec.id}`,
  };
}

/**
 * Every Saaristo node gets this page. Without rewritten text:
 * - Light nodes: the worked example (question + explanation + solved picture).
 * - Other nodes: the node's own model steps, one beat each.
 * - The try is a fresh item of the node itself when it has one control (one tap or one number).
 * Rewritten text (`PageText`) chooses the pictures, says them shorter and may author the try.
 */
export function defaultPage(spec: NodeSpec, text?: PageText, seed = 20261110): BookPage {
  const base = modelBeats(spec, seed);
  const beats: Beat[] = text?.beats.length ? text.beats.map((written, i) => {
    const pic = written.pic === undefined ? (i < base.length ? i : undefined) : written.pic ?? undefined;
    const source = pic === undefined ? undefined : base[pic];
    return {
      text: written.text,
      ...(written.more ? { more: written.more } : {}),
      ...(written.example ? { example: written.example } : {}),
      ...(written.draw ? { scene: written.draw } : source?.scene && written.figure !== false ? { scene: source.scene } : {}),
      ...(source?.step ? { step: source.step } : {}),
    };
  }) : base;
  const plan = text?.try ?? 'auto';
  const head = { id: spec.id, beats, ...(text?.feedbackText ? { feedbackText: text.feedbackText } : {}), ...(text?.title ? { title: text.title } : {}) };
  if (plan === 'none') return head;
  if (typeof plan === 'object') {
    // An authored try is a new question form: its evidence gets its own revision suffix.
    return { ...head, makeTry: (at: number) => ({ item: authoredItem(spec, plan, at), seed: at, phase: 'guided', rev: 'kirja1' }) };
  }
  const oneMove = (phase: Phase, at: number): Try | undefined => {
    for (let n = 0; n < 24; n++) {
      let item: Item;
      try { item = spec.item(rng(at + n), phase); } catch { return undefined; }
      if (!ONE_MOVE_KINDS.has(item.task.kind)) continue;
      if (text?.trySay) item = { ...item, say: text.trySay };
      return { item, seed: at + n, phase };
    }
    return undefined;
  };
  // The try comes right after the worked example, so it is guided practice, not independent evidence.
  const probe = oneMove('guided', seed) ?? oneMove('independent', seed);
  return {
    ...head,
    ...(probe ? { makeTry: (at: number) => oneMove(probe.phase, at) } : {}),
    ...(text?.tryFigure === false ? { tryFigure: false as const } : {}),
  };
}
