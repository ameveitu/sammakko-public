import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class SpriteImage {
  isConnected = true;
  width = 96;
  style = { transform: '' };
  dataset: Record<string, string> = {};
  shown: string[] = [];
  private current = '';
  set src(value: string) { this.current = value; this.shown.push(value); }
  get src() { return this.current; }
}

describe('selected art lazy loading and SpritePlayer lifecycle', () => {
  let media: { matches: boolean; addEventListener: ReturnType<typeof vi.fn> };
  let documentMock: { visibilityState: string; addEventListener: ReturnType<typeof vi.fn>; documentElement: { classList: { toggle: ReturnType<typeof vi.fn> } } };
  let downloads: string[];
  beforeEach(() => {
    vi.resetModules(); vi.useFakeTimers(); downloads = [];
    media = { matches: false, addEventListener: vi.fn() };
    documentMock = { visibilityState: 'visible', addEventListener: vi.fn(), documentElement: { classList: { toggle: vi.fn() } } };
    vi.stubGlobal('document', documentMock);
    vi.stubGlobal('window', { setTimeout });
    vi.stubGlobal('matchMedia', () => media);
    vi.stubGlobal('localStorage', { getItem: () => null });
    vi.stubGlobal('SVGImageElement', class {});
    vi.stubGlobal('Image', class { set src(url: string) { downloads.push(url); } });
  });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });
  function mediaChange(reduce: boolean) {
    media.matches = reduce;
    for (const [, handler] of media.addEventListener.mock.calls) handler();
  }
  function visibility(state: string) {
    documentMock.visibilityState = state;
    for (const [, handler] of documentMock.addEventListener.mock.calls) handler();
  }
  it('loads only the current action, with no @2x or other actor poses', async () => {
    const { SpritePlayer } = await import('../src/ui/sprite');
    const image = new SpriteImage(); const player = new SpritePlayer(image as unknown as HTMLImageElement, 'aava');
    expect(downloads.map((u) => u.split('/').at(-1))).toEqual(['idle.png', 'blink.png']);
    void player.play('celebrate');
    expect(downloads.filter((u) => u.includes('/art/')).map((u) => u.split('/').at(-1)).sort()).toEqual(['celebrate.png', 'crouch.png', 'flap_01.png', 'flap_02.png']);
    expect(downloads.some((u) => /think|read|point|loikka|@2x/.test(u))).toBe(false);
    const other = new SpritePlayer(new SpriteImage() as unknown as HTMLImageElement, 'aava', 'celebrate');
    expect(new Set(downloads).size).toBe(downloads.length);
    player.dispose(); other.dispose();
  });
  it('responds immediately when reduced motion changes during a loop', async () => {
    const { SpritePlayer } = await import('../src/ui/sprite');
    const image = new SpriteImage(); const player = new SpritePlayer(image as unknown as HTMLImageElement, 'aava', 'think');
    vi.advanceTimersByTime(2200); expect(image.style.transform).toContain('rotate(2deg)');
    mediaChange(true); expect(image.style.transform).toBe(''); expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(6000); expect(image.style.transform).toBe('');
    mediaChange(false); expect(vi.getTimerCount()).toBe(1);
    player.dispose(); expect(vi.getTimerCount()).toBe(0);
  });
  it('keeps hidden and frozen sprites still and cancels timers on detach', async () => {
    const { SpritePlayer } = await import('../src/ui/sprite');
    const image = new SpriteImage(); const player = new SpritePlayer(image as unknown as HTMLImageElement, 'aava', 'think');
    visibility('hidden'); expect(vi.getTimerCount()).toBe(0);
    visibility('visible'); expect(vi.getTimerCount()).toBe(1);
    player.freeze(true); expect(vi.getTimerCount()).toBe(0);
    player.freeze(false); expect(vi.getTimerCount()).toBe(1);
    image.isConnected = false; vi.advanceTimersByTime(3000); expect(vi.getTimerCount()).toBe(0);
  });
  it('plays constructor one-shots once and returns to idle', async () => {
    const { SpritePlayer } = await import('../src/ui/sprite');
    const image = new SpriteImage(); const player = new SpritePlayer(image as unknown as HTMLImageElement, 'aava', 'point');
    vi.advanceTimersByTime(7000);
    expect(image.shown.filter((u) => u.endsWith('/point.png'))).toHaveLength(1);
    expect(image.src).toMatch(/characters\/aava\/(idle|blink)\.png$/);
    player.dispose();
  });
  it('settles replaced and disposed play promises and prevents restarting a disposed player', async () => {
    const { SpritePlayer } = await import('../src/ui/sprite');
    const player = new SpritePlayer(new SpriteImage() as unknown as HTMLImageElement, 'aava');
    const old = player.play('point'); const current = player.play('celebrate');
    await expect(old).resolves.toBeUndefined(); player.dispose(); await expect(current).resolves.toBeUndefined();
    await expect(player.play('read')).resolves.toBeUndefined(); expect(vi.getTimerCount()).toBe(0);
  });
  it('adult calm freezes and restores an action without depending on storage availability', async () => {
    let calm: string | null = null;
    vi.stubGlobal('localStorage', { getItem: () => calm, setItem: (_:string, value:string) => { calm=value; }, removeItem: () => { calm=null; } });
    const { SpritePlayer, setCalmByAdult } = await import('../src/ui/sprite');
    const image = new SpriteImage(); const player = new SpritePlayer(image as unknown as HTMLImageElement, 'loikka', 'think');
    setCalmByAdult(true); expect(image.style.transform).toBe(''); expect(vi.getTimerCount()).toBe(0);
    setCalmByAdult(false); expect(vi.getTimerCount()).toBe(1); player.dispose();
  });
});
