"""Derive the shipped visual-polish WebP files from chosen raw plates and the reeds render.

Runs inside headless Blender (its bundled Python has numpy and a WebP writer; Pillow is not
needed). From the repository root:
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P tools/visual-polish/build-assets.py
Inputs are read from tools/visual-polish/sources.json; raw files stay local and git-ignored.
"""
import json
import os

import bpy
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
spec = json.load(open(os.path.join(ROOT, 'tools/visual-polish/sources.json')))
scene = bpy.context.scene
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'


def crop_alpha(img, pad):
    w, h = img.size
    px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)
    ys, xs = np.where(px[:, :, 3] > 0.02)
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad + 1, w)
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad + 1, h)
    sub = px[y0:y1, x0:x1].copy()
    out = bpy.data.images.new(img.name + '_crop', x1 - x0, y1 - y0, alpha=True)
    out.pixels[:] = sub.ravel()
    return out


for item in spec['assets']:
    src = os.path.join(ROOT, item['source'])
    img = bpy.data.images.load(src)
    img.colorspace_settings.name = 'sRGB'
    if item.get('cropAlpha'):
        img = crop_alpha(img, item.get('pad', 8))
    w, h = img.size
    tw = item['width']
    img.scale(tw, round(h * tw / w))
    s = scene.render.image_settings
    s.file_format = 'WEBP'
    s.color_mode = 'RGBA' if item.get('alpha') else 'RGB'
    s.quality = item['quality']
    dest = os.path.join(ROOT, item['out'])
    img.save_render(dest, scene=scene)
    print('VP-ASSET', item['out'], img.size[0], 'x', img.size[1], os.path.getsize(dest), 'bytes')
