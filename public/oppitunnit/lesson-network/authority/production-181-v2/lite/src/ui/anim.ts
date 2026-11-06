// A timed animation scene for lessons outside the motion player: a worked example that
// takes real time (counting one by one, joining, sharing, a lamp that burns for n seconds).
// One scenario time t drives the picture; play/pause, replay and "show the end" act on it,
// like the motion player. It starts by itself unless the user prefers reduced motion, and a
// hidden page pauses it without catching up.
import { Clock } from '../engine/motion';
import type { Paint } from '../engine/types';
import { ICON, svg } from './art';
import { btn, h } from './dom';

export interface AnimCfg {
  /** Length in seconds (real seconds at normal playback). */
  dur: number;
  w: number; h: number;
  /** SVG body at time t (0 ≤ t ≤ dur). */
  frame: (t: number) => string;
  /** Text under the picture at time t (e.g. the count so far). Read out politely. */
  caption?: (t: number) => string;
  /** Accessible name of the picture. */
  label: string;
  /** Start without pressing play (default true; never with reduced motion). */
  autoplay?: boolean;
  /** Show a whole-second stopwatch under the picture. */
  watch?: boolean | ((t: number) => number);
}

export const ANIM = '__anim';
export type AnimPaint = Paint & { [ANIM]?: AnimCfg };

const calm = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 0..1 progress of a step that runs from a to b seconds. */
export const ease = (t: number, a: number, b: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

export function anim(c: AnimCfg): AnimPaint {
  const paint: AnimPaint = (host) => {
    const clock = new Clock(c.dur);
    const pic = h('div', { class: 'anim-pic' });
    const cap = h('p', { class: 'anim-cap', 'aria-live': 'polite' });
    const watch = h('div', { class: 'motion-watch', role: 'timer', 'aria-label': 'Sekuntikello' });
    let raf = 0;
    const playBtn = btn(ICON.next, 'Toista', () => {
      if (clock.playing) { clock.pause(); draw(); return; }
      clock.play(performance.now()); start();
    }, 'primary');
    const playLabel = playBtn.querySelector('span:last-child') as HTMLElement;
    const draw = () => {
      pic.innerHTML = svg(c.w, c.h, c.frame(clock.t), c.label);
      if (c.caption) cap.textContent = c.caption(clock.t);
      if (c.watch) watch.textContent = `⏱ ${Math.floor((typeof c.watch === 'function' ? c.watch(clock.t) : clock.t) + 1e-6)} s`;
      playLabel.textContent = clock.playing ? 'Tauko' : clock.t > 0 && clock.t < c.dur ? 'Jatka' : clock.t >= c.dur ? 'Katso uudelleen' : 'Toista';
    };
    const loop = (now: number) => { clock.tick(now); draw(); if (clock.playing) raf = requestAnimationFrame(loop); };
    const start = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); };
    const onVis = () => { if (document.hidden) { clock.hide(); cancelAnimationFrame(raf); draw(); } };
    document.addEventListener('visibilitychange', onVis);
    const controls = h('div', { class: 'row motion-ctl' }, playBtn,
      btn(ICON.bolt, 'Näytä loppu', () => { clock.pause(); clock.seek(c.dur); draw(); }, 'small'));
    host.append(h('div', { class: 'anim' }, pic, c.watch ? watch : null, c.caption ? cap : null, controls));
    draw();
    if (c.autoplay !== false && !calm()) { clock.play(performance.now()); start(); }
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVis); };
  };
  paint[ANIM] = c;
  return paint;
}
