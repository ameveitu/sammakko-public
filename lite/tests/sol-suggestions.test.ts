// The suggestions file for Sol must point at real KCs at the revision Lite ships today.
import { describe, expect, it } from 'vitest';
import doc from '../docs/sol/LITE181_SUGGESTIONS_FOR_SOL.json';
import { CONTENT_REV, NODES } from '../src/content';

describe('Lite → Sol suggestions', () => {
  it('names the current content revision', () => {
    expect(doc.content_rev).toBe(CONTENT_REV);
  });
  it('every item is a shipped KC at its current revision, once', () => {
    const seen = new Set<string>();
    for (const it of doc.items) {
      expect(NODES[it.kc], it.kc).toBeDefined();
      expect(NODES[it.kc]!.rev, it.kc).toBe(it.lite_rev);
      expect(seen.has(it.kc), it.kc).toBe(false);
      seen.add(it.kc);
      for (const k of ['lite_now', 'divergence', 'suggestion_for_sol', 'kind'] as const) expect(it[k]).toBeTruthy();
    }
  });
});
