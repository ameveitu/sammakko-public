import {expect, test} from '@playwright/test';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';

// The Saaristo homepage has its own renderer and tests in saaristo.spec.ts.
test('shipped file matches the VP03 asset manifest', async ({page}) => {
  const manifest = JSON.parse(await readFile(new URL('../../tools/visual-polish/assets/VP03.json', import.meta.url), 'utf8'));
  for (const f of manifest.files) {
    const body = await (await page.request.get('/' + f.out.replace(/^public\/kotisivu\//, ''))).body();
    expect(createHash('sha256').update(body).digest('hex')).toBe(f.sha256);
  }
});

