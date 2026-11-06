// Store binding for the game state. The learner's game lives in save.game; tester mode uses
// save.testerGame, which "reset tester" throws away. Lesson evidence is never written here.
import { store } from '../engine/store';
import { chaptersFor, PRIZES, WORLDS } from '../content/world';
import { fresh, grant, MISSIONS, outcome, snapshotLegacy, validate, type GameState, type Mission } from './state';

export * from './state';

export function game(): GameState {
  const s = store.get();
  return validate(s.tester ? s.testerGame : s.game, store.now());
}

export function saveGame(fn: (g: GameState) => void) {
  const g = game();
  fn(g);
  store.update((s) => { if (s.tester) s.testerGame = g; else s.game = g; });
}

/** First visit: create the game. A real (non-tester) save snapshots its older prizes once. */
export function ensureGame() {
  const s = store.get();
  if (s.tester ? s.testerGame !== undefined : s.game !== undefined) return;
  const g = fresh(store.now());
  if (!s.tester) {
    const prizes = WORLDS.flatMap((w) => chaptersFor(w.id)).filter((c) => PRIZES[c.id] && c.nodes.every(store.known)).map((c) => c.id);
    snapshotLegacy(g, prizes, store.now());
  }
  store.update((x) => { if (x.tester) x.testerGame = g; else x.game = g; });
}

/** Grant every mission whose route is now complete. Returns the newly granted missions. */
export function settle(): Mission[] {
  const s = store.get();
  const attempts = s.attempts.filter((a) => (s.tester ? !!a.syn : !a.syn));
  const g = game(), out: Mission[] = [];
  for (const m of MISSIONS) {
    if (g.missions[m.id]) continue;
    const r = outcome(m, attempts, store.checked);
    if (r && grant(g, m.id, r, store.now())) out.push(m);
  }
  if (out.length) store.update((x) => { if (x.tester) x.testerGame = g; else x.game = g; });
  return out;
}
export * from './flight';
