import { describe, expect, it } from 'vitest';
import src from '../docs/characters/animations.json';
import { SEQS, CANON_SEQS, ART_SEQS, ASSET_VERSION } from '../src/ui/sprite-data';
import { frameAt, spriteHtml, spriteSvg, stillPose } from '../src/ui/sprite';
import { duck, frog, sulka } from '../src/ui/art';

const LISTED = {
  aava: ['idle', 'walk', 'wave', 'talk', 'curious', 'map', 'swim'],
  loikka: ['idle', 'walk', 'wave', 'happy', 'curious', 'map', 'jump'],
} as const;

describe('Aava and Loikka sprites', () => {
  it('preserves exactly the canonical handover actions alongside selected new art', () => {
    expect(ASSET_VERSION).toBe(src.assetVersion);
    for (const a of ['aava', 'loikka'] as const) {
      expect(Object.keys(CANON_SEQS[a]).sort()).toEqual([...LISTED[a]].sort());
      for (const [k, s] of Object.entries(CANON_SEQS[a])) {
        const o = (src.actors as any)[a][k];
        expect(s.loop).toBe(o.loop);
        expect(s.frames.map((f) => [f.pose, f.ms, f.dy, f.rot])).toEqual(o.frames.map((f: any) => [f.pose, f.durationMs, f.dy, f.rotationDeg]));
      }
    }
    expect(Object.keys(ART_SEQS.aava)).toContain('think');
    expect(Object.keys(SEQS.loikka)).not.toContain('hold');
  });
  it('every pose is a shipped PNG', () => {
    const shipped = new Set(Object.keys((import.meta as any).glob(['../public/characters/*/*.png', '../public/art/characters/*/*.png'])).map((p) => p.replace('../public/art/characters/', '').replace('../public/characters/', '')));
    for (const a of ['aava', 'loikka'] as const)
      for (const s of Object.values(SEQS[a])) for (const f of s.frames)
        expect(shipped.has(`${a}/${f.pose}.png`), `${a}/${f.pose}`).toBe(true);
  });
  it('frame timing is deterministic', () => {
    const idle = SEQS.aava.idle; // 2300, 150, 1700
    expect([0, 2299, 2300, 2449, 2450, 4149, 4150].map((t) => frameAt(idle, t))).toEqual([0, 0, 1, 1, 2, 2, 0]);
    const jump = SEQS.loikka.jump;
    expect(frameAt(jump, 1e6)).toBe(jump.frames.length - 1);
  });
  it('a still pose shows the action, not a blink', () => {
    expect(stillPose('aava', 'idle')).toBe('idle');
    expect(stillPose('aava', 'swim')).toBe('swim');
    expect(stillPose('loikka', 'wave')).toBe('wave');
  });
  it('markup uses the raster images and names the character', () => {
    expect(spriteHtml('aava', 'talk', 88, { name: true })).toMatch(/characters\/aava\/talk\.png[\s\S]*>Aava</);
    expect(spriteSvg('loikka', 0, 0, 64)).toMatch(/<image [^>]*characters\/loikka\/idle\.png/);
    expect(frog(10, 10, 10)).toMatch(/characters\/loikka\/idle\.png/);
    expect(frog(10, 10, 10, 'think')).toMatch(/characters\/loikka\/curious\.png/);
    expect(duck(10, 10, 10)).toMatch(/characters\/aava\/idle\.png/);
    expect(frog(10, 10, 10) + duck(10, 10, 10)).not.toMatch(/<ellipse|<circle|<path/);
  });
  it('Sulka is not drawn with Aava', () => {
    expect(sulka(10, 10, 10)).not.toMatch(/characters\/aava/);
  });
});
