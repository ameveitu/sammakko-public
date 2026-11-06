// The first flight to the island. Hold "Ylös" (or Space) to climb, release to glide.
// The wing choice changes the route: wide wings fly high over the gull rock, narrow wings fly
// low through the stone arch. Nothing here records learning evidence.
import { craft, duck, ICON, svg } from './art';
import { btn, h } from './dom';
import { copilot, FLIGHT, ISLAND, ready, saveGame, startFlight, stepFlight, WATER, game } from '../game';
import { store } from '../engine/store';
import { say, sfx } from './speech';
import { preloadSfx } from '../audio/player';
import { flightSounds } from '../audio/events';
import { artUrl } from './sprite';

const W = 360, H = 210;
const activeFlights = new WeakMap<HTMLElement, () => void>();

export function flight(root: HTMLElement, notice?: () => HTMLElement | null) {
  activeFlights.get(root)?.();
  const g = game();
  if (!ready(g)) { location.hash = '#paja/torni'; return; }
  const wing = g.wing, F = FLIGHT[wing];
  let lastFlap = -1e9;
  preloadSfx(['aava.wing', 'water.splash', 'ui.confirm', 'land.dry']);
  let f = startFlight(wing), up = false, raf = 0, last: number | undefined, paused = false, stopped = false;
  const stage = h('div', { class: 'paja-stage flight' });
  const instruction = `Reitti: ${F.route}. Pidä Ylös-nappia, välilyöntiä tai ylänuolta pohjassa, niin laite nousee.`;
  const status = h('p', { class: 'small muted', 'aria-live': 'polite' }, instruction);
  // Aava rides along and calls out the next ring, read from the same flight state.
  const coEl = h('p', { class: 'flight-copilot', 'aria-live': 'polite' });
  let coText = '';
  const coUpdate = () => { const t = copilot(f, wing); if (t !== coText) { coText = t; coEl.replaceChildren(h('b', {}, 'Aava: '), t); } };
  const upBtn = h('button', { type: 'button', class: 'btn primary big wide', 'aria-label': 'Ylös' }, h('span', { class: 'ico', html: ICON.next }), h('span', {}, 'Ylös'));
  const control = (v: boolean) => {
    if (stopped || document.hidden) return;
    // One flap per press, at most every 0.3 s: holding the button is not a flap per frame.
    if (v && !up && performance.now() - lastFlap > 300) { lastFlap = performance.now(); sfx('aava.wing', 0.6); }
    up = v; upBtn.classList.toggle('sel', v);
    if (v && paused) { paused = false; status.textContent = instruction; start(); }
  };
  const press = (v: boolean) => (e: Event) => { e.preventDefault(); control(v); };
  upBtn.addEventListener('pointerdown', press(true));
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) upBtn.addEventListener(ev, press(false));
  const key = (v: boolean) => (e: KeyboardEvent) => {
    if (e.code !== 'Space' && e.code !== 'ArrowUp') return;
    if (v && e.target instanceof Element && e.target.closest('input, textarea, select, a, button') && e.target !== upBtn) return;
    e.preventDefault(); control(v);
  };
  const kd = key(true), ku = key(false);
  window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
  const onVis = () => { if (document.hidden && !stopped) { paused = true; up = false; upBtn.classList.remove('sel'); last = undefined; cancelAnimationFrame(raf); status.textContent = 'Tauko: sivu oli piilossa. Paina Ylös-painiketta, välilyöntiä tai ylänuolta jatkaaksesi.'; } };
  document.addEventListener('visibilitychange', onVis);

  const scene = () => {
    const Y = (y: number) => y * H, X = (x: number) => x * W;
    let s = `<rect width="${W}" height="${H}" fill="#cfe9f7"/><image href="${artUrl('backgrounds/lake-shore.webp')}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice" opacity="0.24" aria-hidden="true"/><rect y="${Y(WATER) + 8}" width="${W}" height="${H}" fill="#7cc0e0"/>`;
    s += `<ellipse cx="${X(ISLAND)}" cy="${Y(WATER) + 10}" rx="40" ry="12" fill="#d9c08a"/><rect x="${X(ISLAND) + 22}" y="${Y(WATER) - 30}" width="8" height="36" fill="#fff" stroke="#c44" stroke-width="2"/>`;
    // Landmarks of the two routes.
    s += `<path d="M150 ${Y(WATER) + 8} L170 ${Y(0.45)} L195 ${Y(WATER) + 8}Z" fill="#9aa3a8"/><text x="172" y="${Y(0.43)}" font-size="9" text-anchor="middle" fill="#555">Lokkikallio</text>`;
    s += `<path d="M215 ${Y(WATER) + 8} V${Y(0.5)} Q240 ${Y(0.4)} 265 ${Y(0.5)} V${Y(WATER) + 8} H255 V${Y(0.55)} Q240 ${Y(0.49)} 225 ${Y(0.55)} V${Y(WATER) + 8}Z" fill="#a7a197"/><text x="282" y="${Y(0.38)}" font-size="9" text-anchor="middle" fill="#555">Kivikaari</text>`;
    F.rings.forEach(([rx, ry], i) => { s += `<ellipse cx="${X(rx)}" cy="${Y(ry)}" rx="7" ry="16" fill="none" stroke="${f.rings[i] ? '#6cb85c' : '#f4c542'}" stroke-width="4"/>`; });
    s += `<g transform="translate(${X(f.x)} ${Y(f.y)})">${craft(0, 0, 18, { chassis: true, wings: wing, engine: true, pennant: g.pennant, spin: true })}${duck(-4, -17, 7)}</g>`;
    return svg(W, H, s, `Lento saarelle: ${F.route}`);
  };
  const end = () => {
    stop();
    const rings = f.rings.filter(Boolean).length;
    saveGame((x) => { x.flights.push({ at: store.now(), wing, route: F.route, rings, arrived: true }); });
    const text = `Perillä! Lensit reittiä ${F.route} ja keräsit ${rings}/3 rengasta. Majakan vartija näyttää vanhan raketin piirustuksen: se on seuraava unelma.`;
    status.textContent = text; say(text);
    upBtn.replaceWith(h('div', { class: 'stack' },
      btn(ICON.replay, 'Lennä uudelleen', () => flight(root, notice), 'big wide'),
      btn(ICON.next, 'Takaisin pajaan', () => { location.hash = '#paja'; }, 'primary big wide')));
  };
  const loop = (now: number) => {
    if (stopped || paused) return;
    const dt = last === undefined ? 0 : (now - last) / 1000; last = now;
    // stepFlight mutates its state: compare copied values, not the same object.
    const before = { splashes: f.splashes, rings: [...f.rings], done: f.done };
    f = stepFlight(f, wing, up, dt);
    for (const e of flightSounds(before, f)) sfx(e);
    stage.innerHTML = scene();
    coUpdate();
    if (f.done) return end();
    raf = requestAnimationFrame(loop);
  };
  const start = () => { last = undefined; cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); };
  root.replaceChildren(h('div', { class: 'stack paja' },
    h('div', { class: 'top' }, h('div', { class: 'title' }, '🛩️ Ensimmäinen lento'), h('a', { href: '#paja/torni', class: 'small muted' }, 'Keskeytä')),
    notice?.() ?? null, stage, coEl, status, upBtn,
    h('p', { class: 'small muted' }, 'Lento on leikkiä: se ei ole fysiikan koe, eikä siitä tallenneta osaamista. Veteen ei voi pudota: laite pomppaa takaisin ylös.')));
  stage.innerHTML = scene();
  coUpdate();
  start();
  const stop = () => { stopped = true; up = false; cancelAnimationFrame(raf); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); document.removeEventListener('visibilitychange', onVis); window.removeEventListener('hashchange', stop); if (activeFlights.get(root) === stop) activeFlights.delete(root); };
  activeFlights.set(root, stop);
  window.addEventListener('hashchange', stop);
}
