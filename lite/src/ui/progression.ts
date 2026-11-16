import type { Playback } from './speech';
/** Invalidates timer and speech continuations together on every transition. */
export function progression() {
  let generation = 0, timer: ReturnType<typeof setTimeout> | undefined, paused = false, disposed = false;
  const cancel = () => { generation++; if (timer !== undefined) clearTimeout(timer); timer = undefined; };
  function schedule(text: string, kind: 'beat' | 'correct' | 'wrong', playback: Playback, advance: () => void) {
    cancel();
    const current = generation;
    const delay = Math.max(kind === 'correct' ? 2400 : kind === 'wrong' ? 5000 : 3500, Math.ceil(text.trim().length / 15 * 1000));
    if (paused || disposed) return;
    const read = new Promise<void>(resolve => { timer = setTimeout(resolve, delay); });
    void Promise.all([read, playback.finished.catch(() => 'failed')]).then(() => {
      if (!disposed && !paused && generation === current) advance();
    });
  }
  return { schedule, cancel,
    pause() { if (!paused) { paused = true; cancel(); } },
    resume() { paused = false; },
    get paused() { return paused; },
    dispose() { cancel(); disposed = true; },
  };
}

/** Revealed answers and learner-choice branches remain until explicitly continued. */
export function ordinaryWrong(shown: boolean, mode: string, guided: boolean, wrongRun: number): boolean {
  return !shown && (mode === 'practice' || (guided && wrongRun < 2) || (!guided && mode !== 'quick' && mode !== 'retrieval' && wrongRun < 2));
}
