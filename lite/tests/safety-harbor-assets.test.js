import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
it('official images retain source bytes and every referenced GHS symbol has a source receipt', () => {
    const folder = new URL('../public/images/safety-harbor/', import.meta.url), receipt = JSON.parse(readFileSync(new URL('SOURCE.json', folder), 'utf8'));
    expect(receipt.files).toHaveLength(9);
    for (const entry of receipt.files) {
      const data = readFileSync(new URL(entry.file, folder)); expect(data.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
      expect(createHash('sha256').update(data).digest('hex')).toBe(entry.sha256); expect(entry.licenseAsLabeledBySource).toBe('Public Domain');
    }
  });
