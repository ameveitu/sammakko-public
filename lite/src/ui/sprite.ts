/** A small deterministic key-pose player for the Aava and Loikka PNG characters.
 *  It only swaps images and nudges them by the listed dy/rotation; it never writes
 *  learning evidence, never drives a lesson clock, and has no link to physics time.
 *  Motion stops when the page is hidden, when the system asks for reduced motion,
 *  or when the adult turns decorative motion off (a per-device setting). */
import { SEQS, ART_POSES, FRAME, ANCHOR, WATERLINE, type Actor, type Seq } from './sprite-data';

export const NAMES: Record<Actor, string> = { aava: 'Aava', loikka: 'Loikka' };
const CALM_KEY = 'sammakko.calmCharacters';

const base = (): string => { try { return (import.meta as any).env?.BASE_URL ?? './'; } catch { return './'; } };
export const artUrl = (file: string) => `${base()}art/${file}`;
export const poseUrl = (actor: Actor, pose: string) => `${ART_POSES[actor].has(pose) ? artUrl('characters/') : `${base()}characters/`}${actor}/${pose}.png`;

export function seq(actor: Actor, action: string): Seq {
  const s = SEQS[actor][action];
  if (!s) throw new Error(`no action ${action} for ${actor}`);
  return s;
}
/** The pose shown while motion is off: the action's own pose (talk shows talking, wave waving),
 *  else its longest non-blink frame. */
export function stillPose(actor: Actor, action: string): string {
  const f = seq(actor, action).frames;
  if (f.some((x) => x.pose === action)) return action;
  const own = f.filter((x) => x.pose !== 'idle' && !x.pose.includes('blink'));
  return (own.length ? own : f).reduce((a, b) => (b.ms > a.ms ? b : a)).pose;
}
/** Which frame is showing `t` ms after the action started (pure; used by tests). */
export function frameAt(s: Seq, t: number): number {
  const total = s.frames.reduce((a, f) => a + f.ms, 0);
  if (!s.loop && t >= total) return s.frames.length - 1;
  let r = s.loop ? ((t % total) + total) % total : t;
  for (let i = 0; i < s.frames.length; i++) { if (r < s.frames[i]!.ms) return i; r -= s.frames[i]!.ms; }
  return s.frames.length - 1;
}

export function calmByAdult(): boolean { try { return localStorage.getItem(CALM_KEY) === '1'; } catch { return false; } }
const markCalm = () => { if (typeof document !== 'undefined') document.documentElement.classList.toggle('calm-chars', calmByAdult()); };
export function setCalmByAdult(on: boolean) {
  try { if (on) localStorage.setItem(CALM_KEY, '1'); else localStorage.removeItem(CALM_KEY); } catch { /* storage unavailable */ }
  markCalm();
  for (const p of [...live]) p.refresh();
}
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const hidden = () => typeof document !== 'undefined' && document.visibilityState === 'hidden';
export const motionAllowed = () => !reduced() && !calmByAdult();

const live = new Set<SpritePlayer>();
let watching = false;
let media: MediaQueryList | undefined;
function watch() {
  if (watching || typeof document === 'undefined') return;
  watching = true;
  document.addEventListener('visibilitychange', () => { for (const p of [...live]) p.refresh(); });
  if (typeof matchMedia === 'function') {
    media = matchMedia('(prefers-reduced-motion: reduce)');
    media.addEventListener('change', () => { for (const p of [...live]) p.refresh(); });
  }
}

// Cache only poses belonging to an action that is actually used, never the whole registry.
const preloaded = new Set<string>();
function preload(actor: Actor, action: string) {
  if (typeof Image !== 'function') return;
  for (const pose of new Set(seq(actor, action).frames.map((f) => f.pose))) {
    const url = poseUrl(actor, pose);
    if (preloaded.has(url)) continue;
    preloaded.add(url);
    const image = new Image(); image.src = url;
  }
}

/** Markup for a character. `px` is the frame's edge in CSS pixels. Inside SVG use `spriteSvg`. */
export function spriteHtml(actor: Actor, action = 'idle', px = 96, opts: { name?: boolean; cls?: string } = {}): string {
  const n = NAMES[actor];
  const img = `<img class="sprite-img" data-actor="${actor}" data-act="${action}" src="${poseUrl(actor, stillPose(actor, action))}" width="${px}" height="${px}" alt="${opts.name ? '' : n}" draggable="false">`;
  return `<span class="sprite ${actor} ${opts.cls ?? ''}" style="--px:${px}px">${img}${opts.name ? `<span class="sprite-name">${n}</span>` : ''}</span>`;
}
/** An SVG <image> whose feet (frame anchor) sit at (x, y); a swimmer's waterline sits there instead.
 *  `px` is the frame edge in SVG units. */
export function spriteSvg(actor: Actor, x: number, y: number, px: number, action = 'idle', flip = false): string {
  const at = action === 'swim' ? WATERLINE : ANCHOR;
  const k = px / FRAME, ox = x - at.x * k, oy = y - at.y * k;
  const img = `<image class="sprite-img" data-actor="${actor}" data-act="${action}" data-px="${px}" href="${poseUrl(actor, stillPose(actor, action))}" x="${ox}" y="${oy}" width="${px}" height="${px}"/>`;
  return flip ? `<g transform="translate(${2 * x},0) scale(-1,1)">${img}</g>` : img;
}

export class SpritePlayer {
  private i = 0;
  private timer = 0;
  private action: string;
  private done?: () => void;
  private frozen = false;
  private then = 'idle';
  private disposed = false;
  constructor(readonly el: HTMLImageElement | SVGImageElement, readonly actor: Actor, action = 'idle') {
    this.action = action;
    live.add(this); watch();
    this.refresh();
  }
  /** Start an action. A one-shot action returns to `then` (default idle) when it ends. */
  play(action: string, then = 'idle'): Promise<void> {
    seq(this.actor, action);
    seq(this.actor, then);
    if (this.disposed) return Promise.resolve();
    this.settle();
    this.action = action; this.then = then; this.i = 0;
    return new Promise((res) => { this.done = res; this.refresh(); });
  }
  dispose() { clearTimeout(this.timer); this.disposed = true; live.delete(this); this.settle(); }
  private settle() { const done = this.done; this.done = undefined; done?.(); }
  private complete() { this.i = 0; this.action = this.then; this.then = 'idle'; this.settle(); }
  /** Hold still (e.g. while something is being measured nearby); `false` lets it move again. */
  freeze(on: boolean) { this.frozen = on; this.refresh(); }
  /** Re-apply after a visibility or setting change. */
  refresh() {
    clearTimeout(this.timer);
    if (this.disposed) return;
    if (!this.el.isConnected && typeof document !== 'undefined') { this.dispose(); return; }
    if (!motionAllowed() || hidden() || this.frozen) {
      this.show(stillPose(this.actor, this.action), 0, 0);
      if (!motionAllowed()) {
        if (!seq(this.actor, this.action).loop) this.complete(); else this.settle();
      }
      return;
    }
    preload(this.actor, this.action);
    this.tick();
  }
  private tick() {
    const s = seq(this.actor, this.action);
    const f = s.frames[this.i]!;
    this.show(f.pose, f.dy, f.rot);
    this.timer = window.setTimeout(() => {
      if (!this.el.isConnected) { this.dispose(); return; }
      if (this.i + 1 < s.frames.length) this.i++;
      else if (s.loop) this.i = 0;
      else this.complete();
      this.tick();
    }, f.ms);
  }
  private show(pose: string, dy: number, rot: number) {
    const url = poseUrl(this.actor, pose);
    if (this.el instanceof SVGImageElement) {
      const px = Number(this.el.dataset.px) || FRAME, k = px / FRAME;
      const at = this.action === 'swim' ? WATERLINE : ANCHOR;
      const ax = Number(this.el.getAttribute('x')) + at.x * k, ay = Number(this.el.getAttribute('y')) + at.y * k;
      if (this.el.getAttribute('href') !== url) this.el.setAttribute('href', url);
      this.el.setAttribute('transform', dy || rot ? `translate(0 ${(dy * k).toFixed(2)}) rotate(${rot} ${ax.toFixed(1)} ${ay.toFixed(1)})` : '');
    } else {
      const k = (this.el.width || FRAME) / FRAME;
      if (!this.el.src.endsWith(url.replace(/^\.\//, ''))) this.el.src = url;
      this.el.style.transform = dy || rot ? `translateY(${(dy * k).toFixed(2)}px) rotate(${rot}deg)` : '';
    }
  }
}

const players = new WeakMap<Element, SpritePlayer>();
/** The player for a character element, started on first use. */
export function playerOf(el: Element | null | undefined): SpritePlayer | undefined {
  if (!el || !(el as HTMLElement).dataset?.actor) return undefined;
  let p = players.get(el);
  if (!p) { const e = el as HTMLImageElement | SVGImageElement; p = new SpritePlayer(e, e.dataset.actor as Actor, e.dataset.act || 'idle'); players.set(el, p); }
  return p;
}
/** Start players for every character under `root`. */
export function animate(root: ParentNode) {
  root.querySelectorAll('.sprite-img[data-actor]').forEach((el) => { playerOf(el); });
}
/** Watch the page and start every character that appears (one observer for the whole app). */
export function autoAnimate(root: Node = document.body) {
  markCalm();
  animate(root as ParentNode);
  new MutationObserver((ms) => {
    for (const m of ms) m.addedNodes.forEach((n) => {
      if (!(n instanceof Element)) return;
      if (n.matches('.sprite-img[data-actor]')) playerOf(n); else animate(n);
    });
  }).observe(root, { childList: true, subtree: true });
}
