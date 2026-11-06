// Store binding for the game state. The learner's game lives in save.game; tester mode uses
// save.testerGame, which "reset tester" throws away. Lesson evidence is never written here.
import { store } from '../engine/store';
import { chaptersFor, done177, PRIZES, REV_177, WORLDS } from '../content/world';
import { fresh, grant, MISSIONS, outcome, snapshotLegacy, validate, type GameState, type Mission } from './state';

export * from './state';

export function game(): GameState {
  const s = store.get();
  return validate(s.tester ? s.testerGame : s.game, store.now());
}

/** Change the game on the latest stored save, not on a copy read earlier: another tab's finds,
 *  grants and runs stay (review G01). */
export function saveGame(fn: (g: GameState) => void) {
  store.update((s) => {
    const g = validate(s.tester ? s.testerGame : s.game, store.now());
    fn(g);
    if (s.tester) s.testerGame = g; else s.game = g;
  });
}

/** First visit: create the game. A real (non-tester) save snapshots its older prizes once. */
export function ensureGame() {
  const s = store.get();
  if (s.tester ? s.testerGame !== undefined : s.game !== undefined) return;
  const g = fresh(store.now());
  if (!s.tester) {
    // A Lite 177 save keeps prizes earned under the 177 chapter membership; new lessons added to a
    // chapter later are not invented as evidence, they simply are not required for the old prize.
    const was177 = s.rev === REV_177 || s.attempts.some((a) => !a.syn && a.rev === REV_177);
    const prizes = WORLDS.flatMap((w) => chaptersFor(w.id)).filter((c) => PRIZES[c.id] && (c.nodes.every(store.known) || (was177 && done177(c, store.known)))).map((c) => c.id);
    snapshotLegacy(g, prizes, store.now());
  }
  // Another tab may have created its game meanwhile: keep that one.
  store.update((x) => { if (x.tester ? x.testerGame !== undefined : x.game !== undefined) return; if (x.tester) x.testerGame = g; else x.game = g; });
}

/** Grant every mission whose route is now complete. Returns the newly granted missions. */
export function settle(): Mission[] {
  const s = store.get();
  const attempts = s.attempts.filter((a) => (s.tester ? !!a.syn : !a.syn));
  const g = game(), due: [Mission, NonNullable<ReturnType<typeof outcome>>][] = [];
  for (const m of MISSIONS) {
    if (g.missions[m.id]) continue;
    const r = outcome(m, attempts, store.checked);
    if (r) due.push([m, r]);
  }
  if (!due.length) return [];
  // Granted on the latest save, so a mission another tab granted is neither lost nor doubled.
  const out: Mission[] = [];
  saveGame((x) => { for (const [m, r] of due) if (!x.missions[m.id] && grant(x, m.id, r, store.now())) out.push(m); });
  return out;
}
export * from './flight';
