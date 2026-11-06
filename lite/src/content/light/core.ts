import { rng, type Rng } from '../../engine/rng';
import type { Item, NodeSpec, Option, Paint, Phase, Task } from '../../engine/types';
import { LIGHT_GOALS } from './goals';

/**
 * Kevennys ("theory book") layer for Saaristo.
 *
 * A heavy workbench task is turned into one question about the same situation: the learner
 * sees the picture, answers with one multiple choice or one number, and then sees the
 * worked picture. The full workbench stays in the code for the future full Sammakko and is
 * reachable with the QA flag `?full=1`.
 */
export type LightContext = { phase: Phase; r: Rng };
export type LightAdapter<T extends Task = Task> = (item: Item & { task: T }, context: LightContext) => Item | null;

export type Choice = { text: string; why?: string; art?: string; big?: string };

/** `scene: null` drops the full workbench's own picture (when it is only text for the full task). */
type Base = { say: string; explain: string; hint?: string; afterCorrect?: Paint; scene?: Paint | null };

/** Keeps the situation (picture, 3D model, case tag) of the full item and replaces only the answer surface. */
function keep(full: Item, base: Base): Item {
  const { task: _task, hint: _hint, afterCorrect: _after, listen: _listen, scene: fullScene, ...rest } = full;
  const scene = base.scene === null ? undefined : base.scene ?? fullScene;
  return {
    ...rest,
    say: base.say,
    explain: base.explain,
    ...(scene ? { scene } : {}),
    ...(base.hint ? { hint: base.hint } : {}),
    ...(base.afterCorrect ? { afterCorrect: base.afterCorrect } : {}),
    basis: full.task,
  } as Item;
}

/** One multiple choice. `correct` is the index in `choices`; order is shuffled unless `ordered`. */
export function askChoice(full: Item, context: LightContext, base: Base & { choices: Choice[]; correct: number; ordered?: boolean }): Item {
  const seen = new Set<string>();
  const list = base.choices.map((choice, index) => ({ choice, index }))
    .filter(({ choice }) => { const key = choice.text + (choice.big ?? '') + (choice.art ?? ''); if (seen.has(key)) return false; seen.add(key); return true; });
  if (!list.some(({ index }) => index === base.correct)) throw new Error('Light choice lost its correct option');
  const order = base.ordered ? list : context.r.shuffle(list);
  const options: Option[] = order.map(({ choice }) => ({
    ...(choice.text ? { text: choice.text } : {}), ...(choice.big ? { big: choice.big } : {}), ...(choice.art ? { art: choice.art } : {}),
  }));
  return { ...keep(full, base), task: {
    kind: 'choice', options, answer: order.findIndex(({ index }) => index === base.correct),
    why: order.map(({ choice }) => choice.why), cols: options.length === 4 && options.every(o => (o.text ?? '').length < 14) ? 2 : 1,
  } };
}

/** One number field. `whyAt` names the typical wrong numbers. */
export function askNumber(full: Item, base: Base & { answer: number; unit?: string; label?: string; whyAt?: Record<number, string>; tolerance?: number }): Item {
  if (!Number.isFinite(base.answer)) throw new Error('Light number answer must be finite');
  const whyAt = base.whyAt ? Object.fromEntries(Object.entries(base.whyAt).filter(([value]) => Number(value) !== base.answer)) : undefined;
  return { ...keep(full, base), task: {
    kind: 'numeric', answer: base.answer,
    ...(base.unit ? { unit: base.unit } : {}), ...(base.label ? { label: base.label } : {}),
    ...(base.tolerance ? { tolerance: base.tolerance } : {}), ...(whyAt && Object.keys(whyAt).length ? { whyAt } : {}),
  } };
}

const FIGURE = 'svg, canvas, img, table, figure, [data-light-figure]';

/**
 * Draws only the pictures of a full workbench (graphs, drawings, tables), without its answer
 * controls. Table cells that held an input show `?` instead.
 */
export function figuresOf(draw: (host: HTMLElement) => void, intro?: string): Paint {
  return host => {
    const temp = document.createElement('div');
    draw(temp);
    const figures = [...temp.querySelectorAll<HTMLElement>(FIGURE)]
      .filter(el => !el.parentElement?.closest(FIGURE));
    for (const el of figures) {
      el.style.pointerEvents = 'none';
      for (const node of [el, ...el.querySelectorAll<HTMLElement>('[tabindex],[role="button"],[role="slider"]')]) {
        node.removeAttribute('tabindex');
        if (node.getAttribute('role') === 'button' || node.getAttribute('role') === 'slider') node.removeAttribute('role');
      }
      for (const control of el.querySelectorAll('input,select,textarea,button')) {
        const mark = document.createElement('span');
        mark.textContent = control instanceof HTMLInputElement && control.value ? control.value : '?';
        mark.style.cssText = 'font-weight:700';
        control.replaceWith(mark);
      }
    }
    const wrap = document.createElement('div');
    wrap.className = 'light-figures';
    wrap.style.cssText = 'display:grid;gap:8px';
    if (intro) {
      const p = document.createElement('p');
      p.className = 'small'; p.style.margin = '0'; p.textContent = intro;
      wrap.append(p);
    }
    wrap.append(...figures);
    host.replaceChildren(wrap);
  };
}

/** A small facts card: only the givens that the one question needs, as label–value rows. */
export function card(rows: readonly (readonly [string, string])[], intro?: string, outro?: string): Paint {
  return host => {
    const wrap = document.createElement('div');
    wrap.className = 'light-card';
    wrap.setAttribute('data-light-figure', '');
    wrap.style.cssText = 'display:grid;gap:6px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.72);border:1px solid rgba(0,0,0,.08)';
    const line = (text: string) => { const p = document.createElement('p'); p.style.margin = '0'; p.textContent = text; return p; };
    if (intro) wrap.append(line(intro));
    if (rows.length) {
      const table = document.createElement('table');
      table.style.cssText = 'border-collapse:collapse;width:100%;font-size:15px';
      for (const [label, value] of rows) {
        const tr = table.insertRow();
        const a = tr.insertCell(); a.textContent = label; a.style.cssText = 'padding:3px 8px 3px 0;color:#445';
        const b = tr.insertCell(); b.textContent = value; b.style.cssText = 'padding:3px 0;font-weight:700;text-align:right';
      }
      wrap.append(table);
    }
    if (outro) { const p = line(outro); p.className = 'small'; wrap.append(p); }
    host.replaceChildren(wrap);
  };
}

/** Finnish number text with a decimal comma. */
export function fi(value: number, digits = 2): string {
  const rounded = Math.round(value * 10 ** digits) / 10 ** digits;
  return String(rounded).replace('-', '−').replace('.', ',');
}

/** Wraps a full spec so that its items become light. Items without an adapter stay as they are. */
export function lighten(spec: NodeSpec, adapters: Readonly<Record<string, LightAdapter<any>>>): NodeSpec {
  const probe = spec.item(rng(1), 'guided');
  if (!adapters[probe.task.kind]) return spec;
  const rev = `${spec.rev ?? spec.id}-kevyt1`;
  const { produce: _produce, produceWhat: _what, ...meta } = spec;
  const made = new WeakSet<Item>();
  const item: NodeSpec['item'] = (r, phase, context) => {
    const full = spec.item(r, phase, context);
    const light = adapters[full.task.kind]?.(full, { phase, r: rng(r.int(0, 2 ** 31 - 1)) });
    if (!light) return full;
    if (phase !== 'guided') delete light.hint;
    made.add(light);
    return light;
  };
  return {
    ...meta,
    rev,
    validRevs: [rev],
    light: true,
    goal: LIGHT_GOALS[spec.id] ?? spec.goal,
    item,
    // The worked example shows the same light question and its explanation, not the full workbench.
    demo(r) {
      const example = item(r, 'guided');
      if (!made.has(example)) return spec.demo(r);
      const scene: Paint = example.scene ?? (host => host.replaceChildren());
      return [{ say: example.say, scene }, { say: example.explain, scene: example.afterCorrect ?? scene }];
    },
  } as NodeSpec;
}
