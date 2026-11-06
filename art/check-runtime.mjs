#!/usr/bin/env node
// Offline delivery gate: committed files only; no raw images, sips, Pillow, API or network.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodePng, alphaBounds } from '../tools/imagegen/lib/png.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file));
const json = (file) => JSON.parse(read(file));
const sha = (file) => crypto.createHash('sha256').update(read(file)).digest('hex');
const source = json('art/manifest.json'), runtime = json('art/runtime-manifest.json'), anim = json('art/animations.json');
const selected = json(runtime.sequenceFile);
function safe(file) { assert(!path.isAbsolute(file) && !file.split('/').includes('..'), `unsafe path ${file}`); }
function hash(file, expected) { safe(file); assert.equal(sha(file), expected, `hash ${file}`); }
function dimensions(file) {
  const b = read(file);
  if (file.endsWith('.png')) { const image = decodePng(b); return [image.width, image.height]; }
  if (file.endsWith('.webp')) {
    assert.equal(b.toString('ascii', 0, 4), 'RIFF'); assert.equal(b.toString('ascii', 8, 12), 'WEBP');
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (kind === 'VP8L') { const bits = b.readUInt32LE(21); return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1]; }
    assert.equal(kind, 'VP8X'); return [b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1];
  }
  assert(file.endsWith('.jpg')); assert.equal(b.readUInt16BE(0), 0xffd8);
  for (let at = 2; at < b.length;) {
    assert.equal(b[at++], 0xff); let marker = b[at++]; while (marker === 0xff) marker = b[at++];
    if (marker >= 0xd0 && marker <= 0xd9 || marker === 1) continue;
    const n = b.readUInt16BE(at);
    if ([0xc0, 0xc1, 0xc2].includes(marker)) return [b.readUInt16BE(at + 5), b.readUInt16BE(at + 3)];
    at += n;
  }
  throw new Error(`dimensions missing ${file}`);
}
let sourceCount = 0, canonCount = 0, sequenceCount = 0;
const proposals = new Set();
for (const [actor, poses] of Object.entries(source.characters)) {
  assert.equal(Object.keys(poses).length, actor === 'aava' ? 15 : 9);
  for (const [pose, image] of Object.entries(poses)) {
    for (const [key, digest, size] of [['file', 'sha256', 256], ['file2x', 'sha256_2x', 512]]) {
      hash(image[key], image[digest]); assert.deepEqual(dimensions(image[key]), [size, size]); sourceCount++;
      const pixels = decodePng(read(image[key])); const bounds = alphaBounds(pixels, 128);
      assert(bounds.x > 0 && bounds.y > 0 && bounds.x + bounds.w < size && bounds.y + bounds.h < size, `clipped ${image[key]}`);
    }
    proposals.add(`${actor}/${pose}`);
    const sidecar = json(image.source.raw + '.json');
    assert.equal(sidecar.requestId, image.source.requestId); assert.equal(sidecar.model, image.source.model);
  }
}
for (const [kind, count, size] of [['textures', 8, 512], ['backgrounds', 4, null], ['icons', 10, 256]]) {
  assert.equal(Object.keys(source[kind]).length, count);
  for (const image of Object.values(source[kind])) {
    hash(image.file, image.sha256); assert.deepEqual(dimensions(image.file), size ? [size, size] : [1536, 1024]); sourceCount++;
    if (kind !== 'backgrounds') {
      const pixels = decodePng(read(image.file)); let transparent = false;
      for (let i = 3; i < pixels.data.length; i += 4) { if (pixels.data[i] < 255) transparent = true; }
      assert.equal(transparent, kind === 'icons', `transparency ${image.file}`);
      if (kind === 'icons') { const b = alphaBounds(pixels, 128); assert(b.x > 0 && b.y > 0 && b.x + b.w < size && b.y + b.h < size, `clipped icon ${image.file}`); }
    }
    const sidecar = json(image.source.raw + '.json'); assert.equal(sidecar.requestId, image.source.requestId); assert.equal(sidecar.model, image.source.model);
  }
}
for (const frames of Object.values(source.canon)) for (const image of frames) { hash(image.file, image.sha256); canonCount++; }
assert.equal(sourceCount, 70); assert.equal(canonCount, 24);
const canon = new Set(Object.entries(source.canon).flatMap(([a, poses]) => poses.map((p) => `${a}/${p.pose}`)));
for (const [actor, sequences] of Object.entries(anim.sequences)) for (const [name, s] of Object.entries(sequences)) {
  sequenceCount++; assert(s.frames.length > 0); assert.equal(typeof s.loop, 'boolean');
  for (const f of s.frames) {
    assert(proposals.has(`${actor}/${f.pose}`) || canon.has(`${actor}/${f.pose}`), `missing ${actor}/${name}/${f.pose}`);
    assert(Number.isFinite(f.ms) && f.ms > 0); assert(Number.isFinite(f.dy) && Number.isFinite(f.rot));
  }
  if (!s.loop) assert.equal(s.frames.at(-1).pose, 'idle');
}
assert.equal(sequenceCount, 20); assert.deepEqual(anim.anchor, {x:128,y:238}); assert.equal(anim.frame, 256);
hash(runtime.sourceManifest, runtime.sourceManifestSha256); hash(runtime.sequenceFile, runtime.sequenceSha256);
assert.deepEqual(selected.anchor, anim.anchor); assert.equal(selected.frame, anim.frame);
const embedded = read('lite/src/ui/sprite-data.ts').toString().match(/export const ART_SEQS:[^=]+=\s*([\s\S]*?);\n\/\/ END SELECTED ART SEQUENCES/);
assert(embedded, 'selected sequence source marker'); assert.deepEqual(JSON.parse(embedded[1]), selected.sequences, 'sprite registry drift');
for (const [actor, pose, score] of [['aava', 'read', 68], ['loikka', 'read', 72], ['aava', 'sad', 85]]) { assert.equal(source.characters[actor][pose].pickedBy, 'picks.json'); assert.equal(source.characters[actor][pose].score, score); }
const shipped = new Set(runtime.images.filter((r) => !r.file.startsWith('art/')).map((r) => r.file));
for (const [actor, names] of Object.entries(runtime.selectedActions)) {
  assert.deepEqual(Object.keys(selected.sequences[actor]).sort(), [...names].sort());
  for (const name of names) {
    assert.deepEqual(selected.sequences[actor][name], anim.sequences[actor][name], `changed sequence ${actor}/${name}`);
    let bytes = 0;
    for (const pose of new Set(selected.sequences[actor][name].frames.map((f) => f.pose))) {
      const file = `lite/public/art/characters/${actor}/${pose}.png`;
      if (proposals.has(`${actor}/${pose}`)) { assert(shipped.has(file), `unshipped ${file}`); bytes += read(file).length; }
      else assert(canon.has(`${actor}/${pose}`));
    }
    assert(bytes <= runtime.budgets.actionNewPosesBytes, `${actor}/${name} preload budget`);
  }
}
assert.equal(runtime.images.length, new Set(runtime.images.map((r) => r.file)).size);
for (const image of runtime.images) {
  hash(image.file, image.sha256); hash(image.source, image.sourceSha256);
  assert.deepEqual(dimensions(image.file), [image.width, image.height]); assert.equal(read(image.file).length, image.bytes);
  assert(!image.file.includes('@2x') && !image.file.includes('_raw/'));
  if (image.file.includes('/assets/art/') && image.file.endsWith('.png')) assert(image.bytes <= runtime.budgets.iconBytes);
}
const hero = runtime.images.find((r) => r.file === 'public/kotisivu/assets/art/hero-island.webp');
assert(hero.bytes <= runtime.budgets.heroBytes);
assert(runtime.images.filter((r) => r.file.startsWith('lite/public/art/textures/')).reduce((sum, r) => sum + r.bytes, 0) <= runtime.budgets.mapTexturesBytes);
const homepage = json('public/kotisivu/publication-manifest.json').files;
for (const file of shipped) if (file.startsWith('public/kotisivu/')) assert(homepage.includes(file.slice('public/kotisivu/'.length)), `not packaged ${file}`);
function filesBelow(dir) { return fs.readdirSync(path.join(root, dir), {withFileTypes:true}).flatMap((entry) => entry.isDirectory() ? filesBelow(`${dir}/${entry.name}`) : [`${dir}/${entry.name}`]); }
assert.deepEqual(filesBelow('lite/public/art').sort(), [...shipped].filter((p) => p.startsWith('lite/public/art/')).sort(), 'closed runtime roster');
console.log(`OK: ${sourceCount}/70 images, ${sequenceCount}/20 sequences, ${canonCount}/24 canon hashes; ${shipped.size} selected delivery images; selected sequences embedded in sprite-data; budgets and provenance pass`);
