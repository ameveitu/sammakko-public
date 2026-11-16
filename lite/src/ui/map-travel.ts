import type { MapLayout, Pt } from './maplayout';
import type { World } from '../engine/store';
import { motionAllowed } from './sprite';

const distance = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y);
const mix = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

/** Sample the M/C/Q/H/V commands emitted by maplayout, including rounded ferries.
 * Using the drawn path also avoids mistaking ferry corner points for its curve. */
export function sampleMapPath(d: string): Pt[] {
  const points: Pt[] = [];
  let at: Pt = { x: 0, y: 0 };
  for (const match of d.matchAll(/([MCQHV])([^MCQHV]*)/g)) {
    const ns = match[2]!.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi)?.map(Number) ?? [];
    const command = match[1];
    if (command === 'M') { at = { x: ns[0]!, y: ns[1]! }; points.push(at); continue; }
    const a = at;
    if (command === 'C' || command === 'Q') {
      const b = { x: ns.at(-2)!, y: ns.at(-1)! }, c = { x: ns[0]!, y: ns[1]! };
      const c2 = { x: ns[2]!, y: ns[3]! };
      for (let i = 1; i <= 24; i++) {
        const t = i / 24, u = 1 - t;
        points.push(command === 'Q'
          ? { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y }
          : { x: u ** 3 * a.x + 3 * u * u * t * c.x + 3 * u * t * t * c2.x + t ** 3 * b.x, y: u ** 3 * a.y + 3 * u * u * t * c.y + 3 * u * t * t * c2.y + t ** 3 * b.y });
      }
      at = b;
    } else {
      at = command === 'H' ? { x: ns[0]!, y: a.y } : { x: a.x, y: ns[0]! };
      points.push(at);
    }
  }
  return points;
}

export interface MapJourney { nodes: string[]; points: Pt[]; length: number }
const lengthOf = (points: Pt[]) => points.slice(1).reduce((total, p, i) => total + distance(points[i]!, p), 0);

/** Shortest connected *drawn* walk, including supporting footpaths and reverse trips.
 * Graph crossings are never junctions; intermediate actual places are preserved. */
export function mapJourney(L: MapLayout, from: string, to: string): MapJourney | undefined {
  if (!L.nodes.has(from) || !L.nodes.has(to)) return undefined;
  if (from === to) return { nodes: [from], points: [L.nodes.get(from)!], length: 0 };
  const links = [...L.edges.map(edge => ({ from: edge.from, to: edge.to, points: edge.sections.flatMap((s, i) => sampleMapPath(s.d).slice(i ? 1 : 0)) })),
    ...L.paths.map(path => {
      let points = sampleMapPath(path.d);
      if (distance(points[0]!, L.nodes.get(path.from)!) > distance(points.at(-1)!, L.nodes.get(path.from)!)) points = points.reverse();
      return { from: path.from, to: path.to, points };
    })];
  const best = new Map([[from, 0]]), pending = new Set([from]);
  const previous = new Map<string, { id: string; points: Pt[] }>();
  while (pending.size) {
    const id = [...pending].sort((a, b) => best.get(a)! - best.get(b)!)[0]!;
    pending.delete(id);
    if (id === to) break;
    for (const link of links) {
      const next = link.from === id ? link.to : link.to === id ? link.from : undefined;
      if (!next) continue;
      const cost = best.get(id)! + lengthOf(link.points);
      if (cost >= (best.get(next) ?? Infinity)) continue;
      best.set(next, cost); pending.add(next);
      previous.set(next, { id, points: link.from === id ? link.points : [...link.points].reverse() });
    }
  }
  if (!previous.has(to)) return undefined;
  const nodes = [to], segments: Pt[][] = [];
  for (let id = to; id !== from;) { const step = previous.get(id)!; segments.unshift(step.points); nodes.unshift(step.id); id = step.id; }
  return { nodes, points: segments.flatMap((s, i) => s.slice(i ? 1 : 0)), length: best.get(to)! };
}

export function pointOnJourney(route: MapJourney, fraction: number): Pt {
  let remaining = route.length * Math.max(0, Math.min(1, fraction));
  for (let i = 1; i < route.points.length; i++) {
    const a = route.points[i - 1]!, b = route.points[i]!, length = distance(a, b);
    if (remaining <= length) return mix(a, b, length ? remaining / length : 0);
    remaining -= length;
  }
  return route.points.at(-1)!;
}

/** Exponential follow in elapsed time, with a viewport-relative speed ceiling. */
export function cameraStep(delta: number, height: number, elapsedMs: number) {
  const dt = Math.max(0, Math.min(100, elapsedMs));
  const limit = height * 7 * dt / 1000;
  return Math.max(-limit, Math.min(limit, delta * (1 - Math.exp(-dt / 85))));
}

/** Keep the rendered traveller and its road position visible on slow frames. */
export function visibleCameraStep(step: number, top: number, bottom: number, height: number) {
  const inset = Math.min(8, height / 2);
  const minimum = bottom - height + inset, maximum = top - inset;
  // A viewport smaller than the rendered span can only center that span.
  if (minimum > maximum) return (minimum + maximum) / 2;
  return Math.max(minimum, Math.min(maximum, step));
}

// Session-only presentation memory. Opening a real stop supplies the origin;
// no attempts, stars, mastery, lit-place history or persistent save is read/written.
let position: { world: World; id: string } | undefined;
let viewport: { world: World; target: string; width: number; top: number; pageTop: number } | undefined;
export function rememberMapStop(world: World, id: string) { position = { world, id }; viewport = undefined; }
const disposers = new WeakMap<HTMLElement, () => void>();
export function disposeWorldMap(map: HTMLElement) { disposers.get(map)?.(); disposers.delete(map); }

export function mountMapTravel(world: World, target: string, L: MapLayout, map: HTMLElement, avatar: HTMLElement) {
  const end = L.nodes.get(target);
  if (!end) return;
  const origin = position;
  const restore = viewport?.world === world && viewport.target === target && viewport.width === window.innerWidth ? viewport : undefined;
  if (restore) map.dataset.travelViewport = 'restore';
  const route = origin?.world === world ? mapJourney(L, origin.id, target) : undefined;
  const moving = motionAllowed() && !!route?.length;
  const reason = !origin ? 'first-entry' : origin.world !== world ? 'cross-world' : !route ? 'disconnected' : !motionAllowed() ? 'reduced-motion' : !route.length ? 'same-stop' : 'route';
  map.dataset.travel = moving ? 'moving' : 'arrived';
  map.dataset.travelReason = reason;
  map.dataset.travelFrom = origin?.id ?? '';
  map.dataset.travelTo = target;
  map.dataset.travelNodes = JSON.stringify(route?.nodes ?? [target]);
  const place = (p: Pt) => {
    avatar.style.left = `${p.x / L.w * 100}%`; avatar.style.top = `${p.y / L.h * 100}%`;
    avatar.dataset.mapX = String(p.x); avatar.dataset.mapY = String(p.y);
  };
  place(moving ? route!.points[0]! : end);
  if (route?.length) {
    const road = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    road.setAttribute('points', route.points.map(p => `${p.x},${p.y}`).join(' '));
    road.setAttribute('class', 'map-travel-route'); road.setAttribute('data-travel-route', '');
    map.querySelector('svg.wmap-bg')?.append(road);
  }
  let raf = 0, start = 0, last = 0, ended = !moving, disposed = false;
  let scrollHost: HTMLElement | undefined, expectedScroll: number | undefined;
  const controller = new AbortController(), signal = controller.signal;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  function finish(why: string, arrive = true) {
    cancelAnimationFrame(raf); raf = 0; ended = true;
    if (arrive) { place(end!); position = { world, id: target }; }
    map.dataset.travel = why;
    // Completion and cancellation never focus or scroll anything.
    map.classList.toggle('map-arrived', why === 'arrived' && motionAllowed());
    controller.abort();
  }
  const intent = () => { if (!ended) finish('cancelled'); };
  const onScroll = (event: Event) => {
    if (ended) return;
    if ((event.target === scrollHost || (scrollHost === document.scrollingElement && event.target === document)) && expectedScroll !== undefined && Math.abs(scrollHost!.scrollTop - expectedScroll) < 2) return;
    finish('cancelled');
  };
  function follow(p: Pt, first: boolean, elapsedMs = 16.67) {
    scrollHost ??= (map.closest('.lite-map-scroll') ?? document.scrollingElement) as HTMLElement;
    const box = scrollHost === document.scrollingElement ? { top: 0, height: window.innerHeight } : scrollHost.getBoundingClientRect();
    const y = map.getBoundingClientRect().top + p.y / L.h * map.getBoundingClientRect().height;
    const delta = y - box.top - box.height * .46;
    if (first || Math.abs(delta) > 1) {
      // A long first placement is immediate; subsequent following is restrained.
      const amount = first ? delta : cameraStep(delta, box.height, elapsedMs);
      const portrait = avatar.getBoundingClientRect();
      const radius = (map.querySelector<HTMLElement>('.place.next')?.getBoundingClientRect().height ?? 0) / 2;
      const top = Math.min(portrait.top - box.top, y - box.top - radius);
      const bottom = Math.max(portrait.bottom - box.top, y - box.top + radius);
      scrollHost.scrollTop += visibleCameraStep(amount, top, bottom, box.height);
      expectedScroll = scrollHost.scrollTop;
    }
  }
  const tick = (now: number) => {
    if (disposed || ended || !map.isConnected) return;
    if (!start) { start = now; follow(route!.points[0]!, true); }
    const elapsed = last ? now - last : 16.67; last = now;
    const duration = Math.max(850, Math.min(5000, route!.length * 3));
    const t = Math.min(1, (now - start) / duration), ease = t * t * (3 - 2 * t);
    const p = pointOnJourney(route!, ease); place(p); follow(p, false, elapsed);
    if (t >= 1) finish('arrived'); else raf = requestAnimationFrame(tick);
  };
  if (moving) {
    for (const type of ['pointerdown', 'keydown', 'wheel', 'touchstart']) document.addEventListener(type, intent, { capture: true, passive: true, signal });
    document.addEventListener('scroll', onScroll, { capture: true, passive: true, signal });
    document.addEventListener('visibilitychange', () => { if (document.hidden) intent(); }, { signal });
    media.addEventListener('change', intent, { signal });
    raf = requestAnimationFrame(tick);
  } else { position = { world, id: target }; if (reason !== 'reduced-motion') map.classList.add('map-arrived'); }
  if (restore) queueMicrotask(() => {
    if (disposed || !map.isConnected) return;
    const host = map.closest('.lite-map-scroll');
    if (host) host.scrollTop = restore.top;
    window.scrollTo(0, restore.pageTop);
  });
  disposers.set(map, () => {
    if (disposed) return;
    const host = (map.closest('.lite-map-scroll') ?? document.scrollingElement) as HTMLElement;
    viewport = { world, target, width: window.innerWidth, top: host.scrollTop, pageTop: window.scrollY };
    disposed = true; finish('disposed'); controller.abort();
  });
}
