import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// One authored asset set, two build consumers. Do not fork character artwork.
const root = fileURLToPath(new URL('../../', import.meta.url));
const source = path.join(root, 'public/kotisivu/assets/saaristo');
const target = path.join(root, 'lite/public/world/saaristo');
const files = ['sky.webp', ...(await readdir(path.join(source, 'audio')))
  .filter(name => /^[a-z0-9.-]+\.mp3$/.test(name)).sort().map(name => `audio/${name}`)];
const receipt = [];
for (const file of files) {
  const destination = path.join(target, file);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(path.join(source, file), destination);
  const bytes = await readFile(destination);
  receipt.push({ file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
await writeFile(path.join(target, 'provenance.json'), `${JSON.stringify({
  source: 'public/kotisivu/assets/saaristo',
  characters: 'lite/public/characters (original approved artwork, shared without copying)',
  generatedBy: 'lite/tools/sync-saaristo-assets.mjs', files: receipt,
}, null, 2)}\n`);
console.log(`Saaristo: ${files.length} original assets prepared for Lite.`);
