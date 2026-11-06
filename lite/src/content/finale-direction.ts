import { finaleAt, type FinaleArt } from './finale';

export type FilmSet = 'pond' | 'bank' | 'workshop' | 'nest' | 'feast' | 'cape' | 'orbit' | 'cabin' | 'egg' | 'credits';
export type FilmVector = [number, number, number];
export interface FilmActor {
  id: 'aava' | 'loikka' | 'sulka' | 'sisi';
  position: FilmVector;
  yaw: number;
  clip: string;
  time: number;
}
export interface FilmDirection {
  time: number;
  shotStart: number;
  art: FinaleArt;
  set: FilmSet;
  progress: number;
  local: number;
  camera: { position: FilmVector; target: FilmVector; fov: number };
  actors: FilmActor[];
  atmosphere: 'default' | 'cool' | 'warm' | 'twilight';
  backdrop: boolean;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  props: { launch: number; paper: number; stone: number; windbreak: number; box: number; ring: number; leaf: number; crack: number; bill: number; marks: number; drawing: number; embrace: number };
}

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => { const x = clamp(n); return x * x * (3 - 2 * x); };
const interpolate = (a: FilmVector, b: FilmVector, n: number): FilmVector => a.map((v, i) => v + (b[i]! - v) * n) as FilmVector;
const inWorld = (v: FilmVector): FilmVector => [v[0], v[1], v[2] + 6];

/** Director's coordinates in metres: Y is up, +Z is towards the audience. No learner data is read. */
export function finaleDirectionAt(seconds: number, reducedMotion = false): FilmDirection {
  const view = finaleAt(seconds), art = view.shot.art;
  const p = reducedMotion ? .65 : ease(view.progress), local = reducedMotion ? 0 : view.time - view.shot.start;
  let set: FilmSet = 'bank', from: FilmVector = [5, 3.4, 10], to: FilmVector = [4.6, 3.2, 9.5], target: FilmVector = [0, 1.1, 0];
  let fov = 40, atmosphere: FilmDirection['atmosphere'] = 'warm', season: FilmDirection['season'] = 'summer';
  const actors: FilmActor[] = [];
  const actor = (id: FilmActor['id'], x: number, z: number, yaw: number, clip = 'idle', y = .57) => actors.push({ id, position: [x, y, z], yaw, clip, time: local });
  const props: FilmDirection['props'] = { launch: 0, paper: 0, stone: 1, windbreak: 1, box: 0, ring: 0, leaf: 0, crack: 0, bill: 0, marks: 1, drawing: 0, embrace: 0 };
  switch (art) {
    case 'water': set = 'pond'; from = [1, 3.9, 5.8]; to = [1, 3.5, 5.4]; target = [-.5, 0, 0]; atmosphere = 'twilight'; props.ring = reducedMotion ? .5 : clamp((local - 2) / 5); break;
    case 'spring': case 'summer': case 'autumn': case 'winter':
      season = art; atmosphere = art === 'winter' || art === 'spring' ? 'cool' : 'warm';
      from = [4.7, 2.7, 6.8]; to = [4.5, 2.6, 6.5]; target = [.2, .6, .4]; fov = 36; props.leaf = p; break;
    case 'growth': set = 'workshop'; from = [-2.5, 2.4, 6.4]; to = [-2.2, 2.7, 5.8]; target = [-1.5, 1.7, -1.8]; props.marks = p; break;
    case 'adult-bank': actor('aava', -1, .55, .6, 'gentle-nod'); from = [4, 2.7, 7]; to = [3.6, 2.5, 6.6]; target = [-.4, 1.25, .3]; props.stone = p; break;
    case 'hatch': set = 'cape'; actor('loikka', 2.75, -1.65, -.1, 'wave', 1.9); actor('aava', -.8, .5, .9, 'gentle-nod'); from = [-2, 3.5, 9]; to = [-1.6, 3.35, 8.4]; target = [1, 2, -.9]; break;
    case 'map': case 'tools': case 'keepsakes':
      set = 'workshop'; actor('aava', -1.6, -.35, .5, art === 'map' ? 'point' : 'idle'); actor('loikka', 1.7, -.4, -.5, 'idle');
      if (art === 'tools') actor('sulka', .8 - p * .55, -1.7, -.1, p < .4 ? 'walk' : 'gesture');
      props.paper = art === 'map' ? ease(p * 4) : 1;
      if (art === 'keepsakes') { from = [.8, 3.6, 4.6]; to = [.65, 3.4, 4.25]; target = [0, 1.45, .2]; fov = 34; }
      else { from = [-3.4, 2.95, 7]; to = [-3.1, 2.8, 6.6]; target = [0, 1.55, -.4]; } break;
    case 'nest': case 'shelter': case 'choice': case 'evening-nest':
      set = 'nest'; actor('aava', -.7, .25, .65, art === 'nest' ? 'point' : 'idle');
      if (art === 'shelter') { actor('loikka', 3.4 - ease(p * 2) * 1.5, -.9, -.7, p < .5 ? 'walk' : 'idle'); props.windbreak = ease(p * 2); }
      if (art === 'choice') actor('loikka', 1.9, -.9, -.7, 'idle');
      if (art === 'evening-nest') { atmosphere = 'twilight'; from = [4, 2.9, 7]; to = [3.7, 2.7, 6.5]; target = [.4, 1.3, .2]; }
      else { from = [-3.2, 2.7, 6.5]; to = [-2.9, 2.55, 6.1]; target = [.4, 1.4, .2]; } break;
    case 'feast': case 'wood-box': case 'bench': case 'toast':
      set = 'feast'; atmosphere = 'twilight';
      if (art !== 'bench') { actor('aava', -1.8, -.45, .15, art === 'toast' ? 'point' : 'idle'); actor('loikka', 1.8, -.5, -.1, art === 'toast' ? 'wave' : 'idle'); actor('sulka', .3, -1.65, 0, 'idle'); }
      if (art === 'wood-box') { from = [1.6, 3.4, 4.5]; to = [1.3, 3.1, 4.15]; target = [0, 1.6, .3]; fov = 32; props.box = ease(p * 3); }
      else if (art === 'bench') { const waking=local>5&&local<7; actor('sisi', -3.55, .94, .25, waking ? 'idle' : 'sleep', 1.24); actors.at(-1)!.time=waking?local-5:1.75; from = [-4.8, 2.35, 5.1]; to = [-4.5, 2.25, 4.8]; target = [-3.5, 1.6, .8]; props.leaf = p; }
      else { from = [4.4, 3.1, 7.8]; to = [4.1, 2.95, 7.4]; target = [0, 1.5, -.4]; } break;
    case 'cape': case 'luggage': case 'embrace': case 'departure': case 'launch': case 'turn-home':
      set = 'cape'; atmosphere = 'twilight';
      from = [-4.4, 2.9, 9.3]; to = [-4, 2.75, 8.7]; target = [.4, 1.5, -.2];
      if (art === 'cape') { actor('aava', -1.8 + (view.shot.start === 292 ? p * .7 : 0), .5, .8); actor('loikka', .5, .3, -.7); }
      if (art === 'luggage') { actor('loikka', 1.9, -1.05, -.25, 'idle'); from = [4.4, 3.4, 5.5]; to = [4.2, 3.15, 5.1]; target = [2, 1.7, -1]; }
      if (art === 'embrace') { actor('aava', -.48, .35, .15, 'point'); actor('loikka', .5, .14, -.22, 'wave'); from = [1.4, 2.6, 5.7]; to = [1.25, 2.5, 5.45]; target = [0, 1.5, .4]; fov = 38; props.embrace = reducedMotion ? 1 : ease(Math.min(local / 3, (20 - local) / 3)); }
      if (art === 'departure') { actor('aava', -1.8, .8, .7, 'point'); actor('loikka', 2.75, -1.65, 0, 'wave', 1.9); }
      if (art === 'launch') { actor('aava', -2.1, 1.7, 2.5, 'idle'); props.launch = p; from = [-4.4, 3 + p * p * 12, 8]; to = [-4, 3.5 + p * p * 12, 9]; target = [2.2, 2.1 + p * p * 18, -1.5]; fov = 45; }
      if (art === 'turn-home') { actor('aava', -1.8 - p * 1.8, .7 + p * .7, -1.5, p < .18 ? 'idle' : 'walk'); props.launch = 1; from = [1, 3, 9]; to = [.4, 2.8, 8.8]; target = [-2.2, 1.4, .7]; } break;
    case 'islands': set = 'orbit'; atmosphere = 'cool'; from = [1.2, 14.8, 12]; to = [.3, 15.7, 12.3]; target = [0, -.6, -1]; fov = 44; break;
    case 'cabin': case 'stars': case 'notebook': case 'recording':
      set = 'cabin'; atmosphere = 'cool'; actor('loikka', -.8, -.2, .25, art === 'recording' ? 'wave' : 'idle');
      if (art === 'stars') { from = [2, 2.7, 5.1]; to = [1.8, 2.6, 4.8]; target = [.5, 2.15, -1.4]; }
      else if (art === 'notebook') { from = [.8, 3.1, 3.8]; to = [.6, 3, 3.6]; target = [.15, 1.4, .8]; fov = 35; props.drawing = ease(p * 2); }
      else { from = [3.2, 2.45, 6.3]; to = [3, 2.35, 5.9]; target = [-.3, 1.7, -.1]; }
      props.stone = art === 'cabin' ? p : 1; break;
    case 'shell': case 'crack': case 'bill':
      set = 'egg'; atmosphere = 'twilight'; actor('aava', -.65, -.7, .25, 'gentle-nod');
      from = [1.7, 1.85, 4.7]; to = [1.55, 1.8, 4.55]; target = [.35, 1.4, .1]; fov = 36;
      props.crack = art === 'shell' ? 0 : art === 'crack' ? ease(p * 2) : 1;
      props.bill = art === 'bill' ? ease(p * 3) : 0; break;
    case 'credits': set = 'credits'; atmosphere = 'twilight'; break;
  }
  return { time: view.time, shotStart: view.shot.start, art, set, progress: p, local, camera: { position: inWorld(interpolate(from, to, p)), target: inWorld(target), fov }, actors, atmosphere, backdrop: !['orbit','cabin','credits'].includes(set), season, props };
}
