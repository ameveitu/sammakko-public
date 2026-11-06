import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Explicit local review candidates. This is not a license grant; an art approval is carried only from metadata.approval.
const entries = [
  { id: 'aava', name: 'Aava', facing: -Math.PI / 2, clips: ['idle', 'walk', 'gentle-nod', 'point'] },
  { id: 'loikka', name: 'Loikka', facing: -Math.PI / 2, clips: ['idle', 'walk', 'leap', 'wave'] },
  { id: 'sulka', name: 'Sulka', facing: -Math.PI / 2, clips: ['idle', 'walk', 'gesture', 'gentle-nod'] },
  { id: 'sisi', name: 'Sisi', facing: -Math.PI / 2, clips: ['idle', 'walk', 'greet', 'sleep'] },
];
const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const target = path.join(root, 'lite/public/models/characters');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const manifest = [];
for (const entry of entries) {
  const source = path.join(root, 'art/characters-3d', entry.id);
  const bytes = await readFile(path.join(source, `${entry.id}.glb`));
  const metadata = JSON.parse(await readFile(path.join(source, 'metadata.json'), 'utf8'));
  const fail = message => { throw new Error(`${entry.id}: ${message}`); };
  if (bytes.length < 20 || bytes.length >= 3_000_000 || bytes.toString('ascii', 0, 4) !== 'glTF' || bytes.readUInt32LE(4) !== 2 || bytes.readUInt32LE(8) !== bytes.length) fail('invalid GLB header or size budget');
  const jsonLength = bytes.readUInt32LE(12);
  if (bytes.readUInt32LE(16) !== 0x4e4f534a || jsonLength > bytes.length - 20) fail('invalid JSON chunk');
  const gltf = JSON.parse(bytes.toString('utf8', 20, 20 + jsonLength).trim());
  if ([...(gltf.buffers ?? []), ...(gltf.images ?? [])].some(item => item.uri)) fail('external or embedded URI dependency is not admitted');
  const clips = (gltf.animations ?? []).map(item => item.name).sort();
  if (JSON.stringify(clips) !== JSON.stringify([...entry.clips].sort())) fail('clip list differs from reviewed contract');
  const bones = new Set((gltf.skins ?? []).flatMap(skin => skin.joints)).size;
  const triangles = (gltf.meshes ?? []).flatMap(mesh => mesh.primitives).reduce((sum, primitive) => {
    if ((primitive.mode ?? 4) !== 4) fail('only triangle meshes are admitted');
    const count = gltf.accessors[primitive.indices ?? primitive.attributes.POSITION]?.count;
    if (!Number.isInteger(count) || count % 3 !== 0) fail('invalid triangle count');
    return sum + count / 3;
  }, 0);
  if (bones <= 0 || bones >= 24 || triangles <= 0 || triangles >= 20_000) fail('mesh or rig exceeds budget');
  if (hash(bytes) !== metadata.glb_sha256 || metadata.measured?.bytes !== bytes.length || metadata.measured?.triangles !== triangles) fail('stale source receipt');
  if (!Object.keys(metadata.source_sha256 ?? {}).length) fail('missing approved reference provenance');
  for (const [file, sha] of Object.entries(metadata.source_sha256)) {
    const resolved = path.resolve(root, file);
    if (!resolved.startsWith(`${root}${path.sep}`) || hash(await readFile(resolved)) !== sha) fail(`reference hash differs: ${file}`);
  }
  const dest = path.join(target, entry.id);
  await mkdir(dest, { recursive: true });
  await copyFile(path.join(source, `${entry.id}.glb`), path.join(dest, `${entry.id}.glb`));
  // Prefer the transparent poster render; older candidates only have the three-quarter preview.
  const poster = await readFile(path.join(source, 'poster.png')).catch(() => readFile(path.join(source, 'three-quarter.png')));
  await writeFile(path.join(dest, 'poster.png'), poster);
  if (entry.id === 'sisi') await copyFile(path.join(source, 'film-sleep.png'), path.join(dest, 'film-sleep.png'));
  manifest.push({ ...entry, file: `${entry.id}/${entry.id}.glb`, poster: `${entry.id}/poster.png`, bytes: bytes.length, triangles, bones, sha256: hash(bytes), status: 'local-review-candidate', license: metadata.license, ...(metadata.approval?.date ? { approval: `user-approved-for-now-${metadata.approval.date}` } : {}) });
}
await writeFile(path.join(target, 'manifest.json'), `${JSON.stringify({ version: 1, candidates: manifest }, null, 2)}\n`);
console.log(`Character lab: ${manifest.length} checked local candidate(s), no approved PNG replacement.`);
