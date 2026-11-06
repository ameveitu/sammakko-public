// The shared motion player. Every view (objects on the track, ruler, stopwatch, lamps,
// timeline, data table, s–t and v–t graphs, strobe snapshots) is drawn from frames computed
// from ONE scenario time. Start/pause, replay, "show the end" (fast route), stopping the
// vehicle (speed 0, time continues) and the rally speed control all act on that time.
// A hidden page pauses the clock; hidden time is not caught up.
import { Clock, frameAt, Run, type Frame, type Leg, type Track } from '../engine/motion';
import type { Paint } from '../engine/types';
import { duck, frog, ICON, svg } from './art';
import { btn, h } from './dom';

export type View = 'track' | 'ruler' | 'watch' | 'lamps' | 'timeline' | 'table' | 'st' | 'vt' | 'strobe' | 'speedo' | 'laps';
export type Thing = 'car' | 'car2' | 'duck' | 'frog' | 'leaf' | 'boat';

export interface Lane { legs: Leg[]; thing: Thing; label?: string }

export interface MotionCfg {
  track: Track;
  /** One or more movers. On a straight course each gets its own lane; the oval has one. */
  lanes: Lane[];
  /** Scenario length in seconds. */
  end: number;
  views: View[];
  /** Learner controls: rally speed buttons (m/s, lane 1) and a "stop the vehicle" button. */
  control?: { speeds?: number[]; stop?: boolean };
  /** Lamp positions along the path (m). */
  lampsAt?: number[];
  /** Table / strobe interval (s). */
  dt?: number;
  /** Graph ranges. */
  sMax?: number; vMax?: number;
  /** Hide every computed speed (the learner must calculate it). */
  hideSpeed?: boolean;
  /** Stopwatch stops when every mover has crossed the finish (straight course). */
  watchStops?: boolean;
  /** Tenths on the stopwatch (decimal numbers taught). Default: whole seconds. */
  tenths?: boolean;
  /** Show table rows and graph lines only up to the current time (default true). */
  progressive?: boolean;
  /** A fixed reference object (a stone) beside the first lane at this path distance. */
  landmark?: number;
  /** Short description recorded with the answer, e.g. "rata 40 m, 4 m/s". */
  scn: string;
  /** Learner control log of the latest mount (filled by the player, read when answering). */
  log?: string[];
}

/** Scenario record for an answer: description, shown views and the learner's controls. */
export const scnRecord = (c: MotionCfg) => JSON.stringify({ d: c.scn, v: c.views, ...(c.hideSpeed ? { hs: 1 } : {}), ...(c.log?.length ? { log: c.log.slice(-20) } : {}) });

export const MOTION_CFG = '__motion';
export type MotionPaint = Paint & { [MOTION_CFG]?: MotionCfg };

const num = (x: number, d = 1) => (Math.round(x * 10 ** d) / 10 ** d).toString().replace('.', ',');

function thingArt(kind: Thing, x: number, y: number) {
  if (kind === 'duck') return duck(x, y, 22);
  if (kind === 'frog') return frog(x, y, 24);
  if (kind === 'leaf') return `<path d="M${x - 11} ${y + 8} Q${x - 11} ${y - 10} ${x + 11} ${y - 9} Q${x + 10} ${y + 9} ${x - 11} ${y + 8}Z" fill="#6cb85c"/>`;
  if (kind === 'boat') return `<g transform="translate(${x} ${y})"><path d="M-20 -2 H20 L13 9 H-13Z" fill="#9a6a3c"/><rect x="-2" y="-22" width="3" height="20" fill="#6f4826"/><path d="M1 -22 L15 -6 H1Z" fill="#fff" stroke="#ccc"/></g>`;
  const col = kind === 'car2' ? '#2f6fb3' : '#d9534f';
  return `<g transform="translate(${x} ${y})"><rect x="-16" y="-9" width="32" height="11" rx="4" fill="${col}"/><rect x="-6" y="-16" width="11" height="8" rx="3" fill="#444"/><circle cx="-10" cy="4" r="5" fill="#222"/><circle cx="10" cy="4" r="5" fill="#222"/></g>`;
}

const TW = 320, LANE_H = 58, TH_OVAL = 150, PADX = 26;

function trackSvg(c: MotionCfg, fs: Frame[]) {
  const oval = c.track.kind === 'oval';
  const X = (x: number) => PADX + x * (TW - 2 * PADX);
  const has = (v: View) => c.views.includes(v);
  let s = '';
  if (oval) {
    const Y = (y: number) => 10 + y * (TH_OVAL - 20);
    const l = X(0.3), r = X(0.7), top = Y(0.1), bot = Y(0.9), rx = X(0.5) - X(0.3), ry = (bot - top) / 2;
    s += `<path d="M${l} ${bot} H${r} A${rx} ${ry} 0 0 0 ${r} ${top} H${l} A${rx} ${ry} 0 0 0 ${l} ${bot}Z" fill="none" stroke="var(--line)" stroke-width="16"/>`;
    s += `<line x1="${l}" y1="${bot - 10}" x2="${l}" y2="${bot + 10}" stroke="currentColor" stroke-width="3"/>`;
    s += thingArt(c.lanes[0]!.thing, X(fs[0]!.x), Y(fs[0]!.y) - 2);
    return svg(TW, TH_OVAL, s, 'Liikkuja soikealla radalla');
  }
  const n = c.lanes.length, rulerH = has('ruler') ? 30 : 6, H = n * LANE_H + rulerH;
  const ly = (i: number) => 34 + i * LANE_H;
  c.lanes.forEach((lane, i) => {
    const y = ly(i), f = fs[i]!;
    s += `<line x1="${X(0)}" y1="${y}" x2="${X(1)}" y2="${y}" stroke="var(--line)" stroke-width="14" stroke-linecap="round"/>`;
    s += `<line x1="${X(0)}" y1="${y - 12}" x2="${X(0)}" y2="${y + 12}" stroke="currentColor" stroke-width="3"/>`;
    s += `<line x1="${X(1)}" y1="${y - 12}" x2="${X(1)}" y2="${y + 12}" stroke="currentColor" stroke-width="3" stroke-dasharray="4 3"/>`;
    if (lane.label) s += `<text x="4" y="${y + 4}" font-size="13" font-weight="700" fill="currentColor">${lane.label}</text>`;
    if (has('lamps')) (c.lampsAt ?? []).forEach((d, k) => {
      const on = f.lamps[k];
      s += `<circle cx="${X(Math.min(1, d / c.track.L))}" cy="${y - 22}" r="6" fill="${on ? '#f4c542' : 'var(--line)'}" ${on ? 'style="filter:drop-shadow(0 0 4px #f4c542)"' : ''}/>`;
    });
    if (c.landmark !== undefined && i === 0) s += `<ellipse cx="${X(c.landmark / c.track.L)}" cy="${y - 20}" rx="10" ry="7" fill="#9aa3a8"/>`;
    if (has('strobe')) for (const sn of f.snaps) s += `<g opacity=".3">${thingArt(lane.thing, X(Math.min(1, sn / c.track.L)), y - 2)}</g>`;
    s += thingArt(lane.thing, X(f.x), y - 2);
  });
  if (has('ruler')) {
    const L = c.track.L, step = L <= 20 ? 1 : L <= 60 ? 5 : L <= 200 ? 10 : 50, y = ly(n - 1) + 12;
    for (let m = 0; m <= L + 1e-9; m += step) {
      const x = X(m / L), big = Math.round(m / step) % 2 === 0 || m === L;
      s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + (big ? 9 : 5)}" stroke="currentColor" stroke-width="1.5"/>`;
      if (big) s += `<text x="${x}" y="${y + 21}" font-size="11" text-anchor="middle" fill="currentColor">${m}${m === L ? ' m' : ''}</text>`;
    }
  }
  return svg(TW, H, s, 'Liikkujat radalla');
}

const COLORS = ['#2f6fb3', '#d9534f'];

function graphSvg(kind: 'st' | 'vt', c: MotionCfg, runs: Run[], t: number) {
  const W = 300, H = 160, L = 38, B = 26, R = 10, T = 22;
  const yMax = kind === 'st' ? (c.sMax ?? c.track.L) : (c.vMax ?? 10);
  const X = (x: number) => L + (x / c.end) * (W - L - R), Y = (y: number) => H - B - (Math.min(y, yMax) / yMax) * (H - B - T);
  const upto = c.progressive === false ? c.end : t;
  let s = `<line x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}" stroke="currentColor"/><line x1="${L}" y1="${T}" x2="${L}" y2="${H - B}" stroke="currentColor"/>`;
  const xs = c.end <= 12 ? 2 : c.end <= 30 ? 5 : 10, ys = yMax <= 12 ? 2 : yMax <= 60 ? 10 : yMax <= 200 ? 20 : 100;
  for (let x = 0; x <= c.end + 1e-9; x += xs) s += `<text x="${X(x)}" y="${H - B + 14}" font-size="10" text-anchor="middle" fill="currentColor">${x}</text><line x1="${X(x)}" y1="${T}" x2="${X(x)}" y2="${H - B}" stroke="var(--line)" stroke-dasharray="2 3"/>`;
  for (let y = 0; y <= yMax + 1e-9; y += ys) s += `<text x="${L - 5}" y="${Y(y) + 4}" font-size="10" text-anchor="end" fill="currentColor">${y}</text><line x1="${L}" y1="${Y(y)}" x2="${W - R}" y2="${Y(y)}" stroke="var(--line)" stroke-dasharray="2 3"/>`;
  s += `<text x="${W - R}" y="${H - 2}" font-size="11" text-anchor="end" fill="currentColor">t (s)</text><text x="4" y="12" font-size="11" fill="currentColor">${kind === 'st' ? 's (m)' : 'v (m/s)'}</text>`;
  runs.forEach((run, i) => {
    const pts: string[] = [];
    for (let k = 0; k <= 120; k++) { const x = (k / 120) * upto; pts.push(`${X(x).toFixed(1)},${Y(kind === 'st' ? run.s(x) : run.v(x)).toFixed(1)}`); }
    s += `<polyline points="${pts.join(' ')}" fill="none" stroke="${COLORS[i % 2]}" stroke-width="3"/>`;
  });
  s += `<line x1="${X(t)}" y1="${T}" x2="${X(t)}" y2="${H - B}" stroke="currentColor" stroke-width="1.5" data-cursor="${t.toFixed(2)}"/>`;
  return svg(W, H, s, kind === 'st' ? 'Matka–aika-kuvaaja' : 'Nopeus–aika-kuvaaja');
}

/** A scene that mounts the shared motion player. */
export function motionScene(c: MotionCfg): MotionPaint {
  const paint: MotionPaint = (host) => {
    const cap = c.track.kind === 'straight' ? c.track.L : undefined;
    const runs = c.lanes.map((l, i) => new Run(i === 0 && c.control?.speeds ? [{ dur: Infinity, v: 0 }] : l.legs, cap));
    const clock = new Clock(c.end);
    const log: string[] = (c.log = []);
    const stamp = (what: string) => log.push(`${clock.t.toFixed(1)}:${what}`);
    const has = (v: View) => c.views.includes(v);
    const frames = () => runs.map((run) => frameAt(run, c.track, clock.t, { lampsAt: c.lampsAt, dt: c.dt, tenths: c.tenths }));
    // One shared stopwatch: it stops when every mover has finished.
    const watchTime = () => {
      if (!c.watchStops || cap === undefined) return clock.t;
      const done = runs.map((r) => r.timeAt(cap, clock.t + 1e-9));
      return done.every((x) => x !== undefined) ? Math.max(...(done as number[])) : clock.t;
    };
    const box = h('div', { class: 'motion', 'data-scn': c.scn });
    const trackEl = h('div', { class: 'motion-track' });
    const watchEl = h('div', { class: 'motion-watch', role: 'timer', 'aria-label': 'Sekuntikello' });
    const speedEl = h('div', { class: 'motion-speed' });
    const lapEl = h('div', { class: 'motion-laps' });
    const time = h('input', { type: 'range', min: '0', max: String(c.end), step: '0.1', value: '0', 'aria-label': 'Aikajana', class: 'motion-time' }) as HTMLInputElement;
    const tableEl = h('div', { class: 'motion-table' });
    const stEl = h('div', { class: 'motion-graph' }), vtEl = h('div', { class: 'motion-graph' });
    const status = h('p', { class: 'small muted motion-status', 'aria-live': 'polite' });
    let raf = 0;
    const playBtn = btn(ICON.next, 'Käynnistä', () => {
      if (clock.playing) { clock.pause(); draw(); return; }
      clock.play(performance.now()); start();
    }, 'primary');
    const playLabel = playBtn.querySelector('span:last-child') as HTMLElement;
    const draw = () => {
      const fs = frames();
      trackEl.innerHTML = trackSvg(c, fs);
      const wt = watchTime();
      watchEl.textContent = `⏱ ${c.tenths ? (Math.floor(wt * 10 + 1e-6) / 10).toFixed(1).replace('.', ',') : Math.floor(wt + 1e-6)} s`;
      if (has('speedo') && !c.hideSpeed) speedEl.textContent = `nopeus ${num(fs[0]!.v)} m/s`;
      if (has('laps')) lapEl.textContent = `kierroksia ${fs[0]!.lap}`;
      time.value = String(clock.t);
      if (has('table')) {
        const all = c.progressive === false ? runs.map((r) => frameAt(r, c.track, c.end, { dt: c.dt }).rows) : fs.map((f) => f.rows);
        const multi = runs.length > 1;
        tableEl.innerHTML = `<table class="data"><thead><tr><th>aika t (s)</th>${runs.map((_, i) => `<th>matka s (m)${multi ? ' ' + (c.lanes[i]!.label ?? i + 1) : ''}</th>`).join('')}</tr></thead><tbody>${all[0]!.map(([a], k) => `<tr><td>${num(a)}</td>${all.map((rows) => `<td>${num(rows[k]![1])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      }
      if (has('st')) stEl.innerHTML = graphSvg('st', c, runs, clock.t);
      if (has('vt') && !c.hideSpeed) vtEl.innerHTML = graphSvg('vt', c, runs, clock.t);
      playLabel.textContent = clock.playing ? 'Tauko' : clock.t > 0 && clock.t < c.end ? 'Jatka' : clock.t >= c.end ? 'Alusta' : 'Käynnistä';
      status.textContent = clock.autoPaused ? 'Tauko: sivu oli piilossa.' : clock.playing && runs.every((r) => r.v(clock.t) === 0) && runs.some((r) => r.s(clock.t) > 0) ? 'Kaikki paikallaan. Aika kulkee.' : '';
    };
    const loop = (now: number) => { clock.tick(now); draw(); if (clock.playing) raf = requestAnimationFrame(loop); };
    const start = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); };
    const controls = h('div', { class: 'row motion-ctl' }, playBtn,
      btn(ICON.replay, 'Uudelleen', () => { clock.replay(performance.now()); start(); }, 'small'),
      btn(ICON.bolt, 'Näytä loppu', () => { clock.pause(); clock.seek(c.end); draw(); }, 'small'));
    if (c.control?.stop) controls.append(btn('', 'Pysäytä auto', () => { runs[0]!.stop(clock.t); stamp('stop'); draw(); }, 'small'));
    let speedRow: HTMLElement | null = null;
    if (c.control?.speeds) {
      const bs = c.control.speeds.map((v, k) => h('button', { type: 'button', class: 'token', onclick: () => {
        // A new speed starts a fresh run from the start line, so each try is a clean trial.
        runs[0] = new Run([{ dur: Infinity, v }], cap);
        stamp(`v=${v}`);
        bs.forEach((b, j) => b.classList.toggle('sel', j === k));
        clock.pause(); clock.seek(0); draw();
      } }, `${num(v)} m/s`));
      speedRow = h('div', { class: 'motion-speeds' }, h('span', { class: 'small' }, 'Valitse nopeus:'), h('div', { class: 'tray' }, ...bs));
    }
    time.oninput = () => { clock.seek(Number(time.value)); draw(); };
    const onVis = () => { if (document.hidden) { clock.hide(); cancelAnimationFrame(raf); draw(); } };
    document.addEventListener('visibilitychange', onVis);
    const read = h('div', { class: 'row motion-read' });
    if (has('watch')) read.append(watchEl);
    if (has('speedo') && !c.hideSpeed) read.append(speedEl);
    if (has('laps')) read.append(lapEl);
    box.append(...[trackEl, read, has('timeline') ? time : null, speedRow, controls, status,
      has('table') ? tableEl : null, has('st') ? stEl : null, has('vt') && !c.hideSpeed ? vtEl : null].filter((x): x is HTMLElement => !!x));
    host.append(box);
    draw();
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVis); };
  };
  paint[MOTION_CFG] = c;
  return paint;
}
