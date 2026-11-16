import { afterEach, describe, expect, it, vi } from 'vitest';
import { ordinaryWrong, progression } from '../src/ui/progression';
import type { Playback } from '../src/ui/speech';
const playback = (finished: Promise<'ended' | 'unavailable'>): Playback => ({ started: Promise.resolve(true), finished, stop() {} });
afterEach(() => vi.useRealTimers());
describe('cancellable progression', () => {
  it('waits for both reading time and long speech', async () => {
    vi.useFakeTimers(); let end!: (value: 'ended') => void; const spoken = new Promise<'ended'>(r => { end = r; });
    const advance = vi.fn(), p = progression(); p.schedule('Hello', 'correct', playback(spoken), advance);
    await vi.advanceTimersByTimeAsync(10000); expect(advance).not.toHaveBeenCalled(); end('ended'); await vi.waitFor(() => expect(advance).toHaveBeenCalledOnce());
  });
  it('requires a fresh full interval after a hold and resume', async () => {
    vi.useFakeTimers(); const done = vi.fn(), p = progression();
    const speech = playback(Promise.resolve('unavailable'));
    p.schedule('Hello', 'correct', speech, done); await vi.advanceTimersByTimeAsync(2300); p.pause();
    await vi.advanceTimersByTimeAsync(10000); expect(done).not.toHaveBeenCalled();
    p.resume(); p.schedule('Hello', 'correct', speech, done); await vi.advanceTimersByTimeAsync(2300);
    expect(done).not.toHaveBeenCalled(); await vi.advanceTimersByTimeAsync(100); expect(done).toHaveBeenCalledOnce();
  });
  it('invalidates stale timers and speech on replacement, pause and disposal', async () => {
    vi.useFakeTimers(); let end!: (value: 'ended') => void; const spoken = new Promise<'ended'>(r => { end = r; });
    const old = vi.fn(), next = vi.fn(), p = progression(); p.schedule('Old', 'beat', playback(spoken), old);
    p.schedule('New', 'correct', playback(Promise.resolve('unavailable')), next); end('ended');
    await vi.advanceTimersByTimeAsync(2500); expect(old).not.toHaveBeenCalled(); expect(next).toHaveBeenCalledOnce();
    p.schedule('again', 'wrong', playback(Promise.resolve('unavailable')), old); p.pause(); await vi.advanceTimersByTimeAsync(9000); expect(old).not.toHaveBeenCalled();
    p.resume(); p.schedule('again', 'wrong', playback(Promise.resolve('unavailable')), old); p.dispose(); await vi.advanceTimersByTimeAsync(9000); expect(old).not.toHaveBeenCalled();
  });
});

it('never auto-dismisses a revealed answer or critical wrong-answer choice', () => {
  expect(ordinaryWrong(true, 'practice', false, 0)).toBe(false);
  expect(ordinaryWrong(true, 'learn', true, 1)).toBe(false);
  expect(ordinaryWrong(false, 'retrieval', false, 0)).toBe(false);
  expect(ordinaryWrong(false, 'learn', true, 2)).toBe(false);
  expect(ordinaryWrong(false, 'practice', false, 0)).toBe(true);
});
