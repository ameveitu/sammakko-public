#!/usr/bin/env python3
"""Rebuild selected, versioned delivery assets offline (Pillow required only here)."""
import hashlib, json, pathlib, shutil, re
from PIL import Image
ROOT = pathlib.Path(__file__).resolve().parent.parent
ART = ROOT / 'art'
manifest = json.loads((ART / 'manifest.json').read_text())
animations = json.loads((ART / 'animations.json').read_text())
selected = {'aava': ['think', 'point', 'read', 'celebrate'], 'loikka': ['think', 'point']}
records = []
def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def record(source, destination, operation):
    path = ROOT / destination
    with Image.open(path) as image:
        width, height = image.size
    records.append({'file': destination, 'sha256': digest(path), 'bytes': path.stat().st_size,
                    'width': width, 'height': height, 'source': source,
                    'sourceSha256': digest(ROOT / source), 'operation': operation})
def convert(source, destination, size=None, quality=80):
    path = ROOT / destination
    path.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(ROOT / source) as image:
        if size: image = image.resize((size, size), Image.Resampling.LANCZOS)
        if path.suffix == '.webp': image.convert('RGB').save(path, 'WEBP', quality=quality, method=6)
        else: image.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(path, 'PNG', optimize=True)
    record(source, destination, {'resize': size, 'format': path.suffix[1:], 'quality': quality if path.suffix == '.webp' else None})
# Four web backgrounds remain in the source proposal; only the selected two are shipped.
for name, item in manifest['backgrounds'].items():
    convert(item['file'], f'art/derived/backgrounds/{name}.webp')
for name, destination in [('hero-island', 'public/kotisivu/assets/art/hero-island.webp'), ('lake-shore', 'lite/public/art/backgrounds/lake-shore.webp')]:
    path = ROOT / destination; path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(ART / f'derived/backgrounds/{name}.webp', path)
    record(manifest['backgrounds'][name]['file'], destination, {'format': 'webp', 'quality': 80})
for name in ['water', 'sand', 'grass']:
    convert(manifest['textures'][name]['file'], f'lite/public/art/textures/{name}.webp', 256, 72)
for name in ['book', 'lightbulb', 'check']:
    for size in [48, 96]:
        convert(manifest['icons'][name]['file'], f'public/kotisivu/assets/art/{name}-{size}.png', size)
# Copy only poses needed by named runtime actions; original canonical files are read only.
for actor, actions in selected.items():
    poses = sorted({frame['pose'] for action in actions for frame in animations['sequences'][actor][action]['frames']})
    for pose in poses:
        item = manifest['characters'][actor].get(pose)
        if not item: continue
        destination = f'lite/public/art/characters/{actor}/{pose}.png'
        path = ROOT / destination; path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / item['file'], path)
        record(item['file'], destination, {'format': 'png', 'copy': True})
sequences = {'schema': 'sammakko-runtime-sprites/1', 'frame': animations['frame'], 'anchor': animations['anchor'],
             'sequences': {actor: {action: animations['sequences'][actor][action] for action in actions} for actor, actions in selected.items()}}
path = ROOT / 'art/runtime-sequences.json'; path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(json.dumps(sequences, indent=2) + '\n')
sprite_data = ROOT / 'lite/src/ui/sprite-data.ts'
block = '// BEGIN SELECTED ART SEQUENCES (art/prepare-runtime.py)\nexport const ART_SEQS: Record<Actor, Record<string, Seq>> = ' + json.dumps(sequences['sequences'], indent=2) + ';\n// END SELECTED ART SEQUENCES'
sprite_data.write_text(re.sub(r'// BEGIN SELECTED ART SEQUENCES.*?// END SELECTED ART SEQUENCES', lambda _: block, sprite_data.read_text(), flags=re.S))
result = {'schema': 'sammakko-art-runtime/1', 'sourceManifest': 'art/manifest.json',
          'sourceManifestSha256': digest(ART / 'manifest.json'), 'selectedActions': selected,
          'sequenceFile': str(path.relative_to(ROOT)), 'sequenceSha256': digest(path), 'images': records,
          'reserve': {'character2x': 'all24', 'actions': {actor: sorted(set(animations['sequences'][actor]) - set(actions)) for actor, actions in selected.items()},
                      'textures': ['water-deep', 'night-water', 'paper', 'path', 'wood'],
                      'backgrounds': ['forest-clearing', 'night-pond'],
                      'icons': ['heart', 'leaf', 'lock', 'map-pin', 'shell', 'star', 'trophy']},
          'budgets': {'heroBytes': 204800, 'mapTexturesBytes': 122880, 'actionNewPosesBytes': 204800, 'iconBytes': 12288}}
(ART / 'runtime-manifest.json').write_text(json.dumps(result, indent=2) + '\n')
print(f'Prepared {len(records)} images; selected actions: {sum(map(len,selected.values()))}; no generation/network calls')
