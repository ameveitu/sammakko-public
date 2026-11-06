"""Side-by-side review gallery (VP06): baseline | candidate WebP pairs for docs/visual-polish/gallery/.

Runs in Blender's bundled Python (Pillow is not available on the review machine):
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P tools/visual-polish/gallery.py -- \
      --base SHOTS/baseline --cand SHOTS/cand-on --out docs/visual-polish/gallery name1 name2 ...
Each output is <name>.webp: baseline on the left, candidate on the right, a 16px paper gap, scaled
to --width (default 1600). Inputs are screenshots from tools/visual-polish/capture.mjs.
"""
import argparse
import os
import sys

import bpy
import numpy as np

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument('--base', required=True)
ap.add_argument('--cand', required=True)
ap.add_argument('--out', required=True)
ap.add_argument('--width', type=int, default=1600)
ap.add_argument('--quality', type=int, default=72)
ap.add_argument('--suffix', default='')
ap.add_argument('names', nargs='+')
args = ap.parse_args(argv)
os.makedirs(args.out, exist_ok=True)


def load(path):
    img = bpy.data.images.load(os.path.abspath(path))
    w, h = img.size
    px = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    bpy.data.images.remove(img)
    return px.reshape(h, w, 4)


def resize(a, w):
    h = round(a.shape[0] * w / a.shape[1])
    ys = (np.arange(h) * a.shape[0] / h).astype(int)
    xs = (np.arange(w) * a.shape[1] / w).astype(int)
    return a[ys][:, xs]


GAP = 16
for name in args.names:
    left, right = load(f'{args.base}/{name}.png'), load(f'{args.cand}/{name}.png')
    half = (args.width - GAP) // 2
    left, right = resize(left, half), resize(right, half)
    h = max(left.shape[0], right.shape[0])
    canvas = np.ones((h, half * 2 + GAP, 4), dtype=np.float32)
    canvas[..., :3] = np.array([0xf7, 0xf3, 0xe7]) / 255
    # Blender image rows run bottom-up: align both shots to the top edge.
    canvas[h - left.shape[0]:, :half] = left
    canvas[h - right.shape[0]:, half + GAP:] = right
    out = bpy.data.images.new(name, canvas.shape[1], h, alpha=False)
    out.pixels.foreach_set(canvas.ravel())
    scene = bpy.context.scene
    scene.render.image_settings.file_format = 'WEBP'
    scene.render.image_settings.color_mode = 'RGB'
    scene.render.image_settings.quality = args.quality
    scene.view_settings.view_transform = 'Standard'
    target = os.path.abspath(f'{args.out}/{name}{args.suffix}.webp')
    out.save_render(target, scene=scene)
    bpy.data.images.remove(out)
    print('VP-GALLERY', target, os.path.getsize(target))
