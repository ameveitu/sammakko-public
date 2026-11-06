import { describe, expect, it } from 'vitest';
import {
  FINALE_CHAPTERS, FINALE_CREDITS, FINALE_SECONDS, FINALE_SOUNDS, STORY_SECONDS,
  finaleAt, finaleElapsed, pauseFinale, seekFinale, type FinaleClock,
} from '../src/content/finale';

describe('future epilogue animatic timeline', () => {
  it('covers the full 8:40 script before credits with explicit shot and subtitle boundaries', () => {
    expect(FINALE_CHAPTERS.map((chapter) => chapter.start)).toEqual([0, 55, 125, 190, 255, 345, 420, 480, 520]);
    for (const [index, chapter] of FINALE_CHAPTERS.entries()) {
      expect(chapter.end).toBe(FINALE_CHAPTERS[index + 1]?.start ?? FINALE_SECONDS);
      expect(chapter.shots[0]?.start).toBe(chapter.start);
      for (const [i, shot] of chapter.shots.entries()) {
        expect(shot.start).toBeLessThan(chapter.shots[i + 1]?.start ?? chapter.end);
        expect(finaleAt(shot.start).shot).toBe(shot);
      }
      for (const [i, caption] of chapter.captions.entries()) {
        expect(caption.start).toBeGreaterThanOrEqual(chapter.start);
        expect(caption.end).toBeLessThanOrEqual(chapter.captions[i + 1]?.start ?? chapter.end);
        expect(finaleAt(caption.start).caption).toBe(caption);
        expect(finaleAt(caption.end).caption).not.toBe(caption);
      }
    }
  });

  it('shows both adult decisions, later stars, and the little bill as the final story image', () => {
    expect(finaleAt(183).caption?.text).toBe('Sinä saat lähteä. Minä saan jäädä. Me saamme silti olla me.');
    expect(finaleAt(345).shot.art).toBe('launch');
    expect(finaleAt(424).caption?.text).toContain('myöhemmin');
    expect(finaleAt(449).shot.description).toContain('myöhempää lähettämistä');
    expect(finaleAt(474).shot.art).toBe('evening-nest');
    expect(finaleAt(501.9).shot.art).toBe('crack');
    expect(finaleAt(502).shot.art).toBe('bill');
    expect(finaleAt(STORY_SECONDS - .01).shot.art).toBe('bill');
    expect(finaleAt(STORY_SECONDS).shot.art).toBe('credits');
    expect(FINALE_SOUNDS.filter((sound) => sound.cue === 'drop').map((sound) => sound.at)).toEqual([2, 510]);
    expect(FINALE_CREDITS.some((entry) => entry.text.includes('Sulan Lite-kuvitus'))).toBe(true);
  });

  it('keeps the viewing clock stable when paused and preserves play state on seek', () => {
    const playing: FinaleClock = { position: 40, playingSince: 1000 };
    expect(finaleElapsed(playing, 6000)).toBe(45);
    const paused = pauseFinale(playing, 6000);
    expect(finaleElapsed(paused, 10_000)).toBe(45);
    const pausedSeek = seekFinale(paused, 502, 10_000);
    expect(finaleElapsed(pausedSeek, 20_000)).toBe(502);
    const playingSeek = seekFinale(playing, 345, 7000);
    expect(finaleElapsed(playingSeek, 8000)).toBe(346);
    expect(seekFinale(playing, Infinity, 7000).position).toBe(0);
    expect(seekFinale(playing, FINALE_SECONDS + 1, 7000).playingSince).toBeNull();
  });

  it('supports direct viewing of the ending independently of lesson history', () => {
    expect(finaleAt(-20).time).toBe(0);
    expect(finaleAt(Number.NaN).shot.art).toBe('water');
    expect(finaleAt(FINALE_SECONDS - .01).ended).toBe(false);
    expect(finaleAt(FINALE_SECONDS + 2)).toMatchObject({ time: FINALE_SECONDS, ended: true, progress: 1 });
  });
});
