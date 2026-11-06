"""VP05 living painting: derive the shipped painting, motion mask and character atlas.

Runs inside headless Blender (bundled numpy and WebP writer). From the repository root:
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P tools/visual-polish/world/build-world.py
Optional: WORLD_DEBUG=<dir> writes mask overlays for checking by eye.
Inputs come from tools/visual-polish/world/paintings.json. The raw paintings stay local and
git-ignored; the character frames are the approved Lite PNGs, only resampled (never redrawn).
"""
import json
import os

import bpy
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
SPEC = json.load(open(os.path.join(ROOT, 'tools/visual-polish/world/paintings.json')))
DEBUG = os.environ.get('WORLD_DEBUG')
scene = bpy.context.scene
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'


def load(path):
    img = bpy.data.images.load(os.path.join(ROOT, path))
    img.colorspace_settings.name = 'sRGB'
    return img


def pixels(img):
    w, h = img.size
    return np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)[::-1].copy()  # top-down


def save(arr, rel, quality, alpha):
    """arr: top-down HxWx4 floats 0..1, written through a byte image so values round-trip."""
    h, w = arr.shape[:2]
    img = bpy.data.images.new('out', w, h, alpha=alpha)
    img.colorspace_settings.name = 'sRGB'
    img.pixels[:] = np.ascontiguousarray(arr[::-1]).ravel()
    s = scene.render.image_settings
    s.file_format = 'WEBP'
    s.color_mode = 'RGBA' if alpha else 'RGB'
    s.quality = quality
    dest = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    img.save_render(dest, scene=scene)
    bpy.data.images.remove(img)
    return os.path.getsize(dest)


def area_matrix(n_in, n_out):
    """Row i averages input cells covering [i, i+1) * n_in / n_out with fractional overlap."""
    m = np.zeros((n_out, n_in), np.float32)
    r = n_in / n_out
    for i in range(n_out):
        a, b = i * r, (i + 1) * r
        for j in range(int(a), min(int(np.ceil(b)), n_in)):
            m[i, j] = min(b, j + 1) - max(a, j)
        m[i] /= m[i].sum()
    return m


def resize(arr, w, h):
    my, mx = area_matrix(arr.shape[0], h), area_matrix(arr.shape[1], w)
    rows = np.tensordot(my, arr, axes=(1, 0))  # h x W x C
    return np.tensordot(rows, mx, axes=(1, 1)).transpose(0, 2, 1)  # h x w x C


def polygon(poly, w, h):
    """Even-odd fill of a uv polygon on a w x h pixel-centre grid."""
    ys, xs = np.mgrid[0:h, 0:w]
    u, v = (xs + 0.5) / w, (ys + 0.5) / h
    inside = np.zeros((h, w), bool)
    n = len(poly)
    for i in range(n):
        (x1, y1), (x2, y2) = poly[i], poly[(i + 1) % n]
        cross = ((y1 > v) != (y2 > v)) & (u < (x2 - x1) * (v - y1) / ((y2 - y1) or 1e-9) + x1)
        inside ^= cross
    return inside


def any_polygon(polys, w, h):
    out = np.zeros((h, w), bool)
    for p in polys:
        out |= polygon(p, w, h)
    return out


def blur(a, r):
    """Separable box blur, radius r pixels, edge-clamped."""
    for axis in (0, 1):
        pad = [(0, 0), (0, 0)]
        pad[axis] = (r + 1, r)
        c = np.cumsum(np.pad(a, pad, mode='edge'), axis=axis)
        a = (np.take(c, range(2 * r + 1, c.shape[axis]), axis=axis) - np.take(c, range(0, c.shape[axis] - 2 * r - 1), axis=axis)) / (2 * r + 1)
    return a


def hsv(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx, mn = rgb.max(-1), rgb.min(-1)
    d = mx - mn + 1e-6
    h = np.where(mx == r, (g - b) / d % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, (mx - mn) / (mx + 1e-6), mx


def build_painting(p):
    img = load(p['source'])
    w, h = img.size
    tw, th = p['width'], round(h * p['width'] / w)
    img.scale(tw, th)
    full = pixels(img)
    out = None
    for q in p['qualities']:
        size = save(full, p['out'], q, False)
        out = (q, size)
        if size <= p['maxBytes']:
            break
    print('VP05-ASSET', p['out'], tw, 'x', th, 'quality', out[0], out[1], 'bytes')

    # Classify at double mask resolution, then area-average down for soft, aliasing-free edges.
    mw, mh = p['maskWidth'], round(th * p['maskWidth'] / tw)
    cw, ch = mw * 2, mh * 2
    src = resize(full, cw, ch)[..., :3]
    hue, sat, val = hsv(src)
    ys = (np.mgrid[0:ch, 0:cw][0] + 0.5) / ch
    xs = (np.mgrid[0:ch, 0:cw][1] + 0.5) / cw
    below = ys > p['horizon'] + 0.004
    above = ys < p['horizon'] - 0.002
    green = (hue > 62) & (hue < 175) & (sat > 0.22) & (val > 0.18)
    # Water is whatever below the horizon is not vegetation, warm rock/wood or dark outline;
    # pale wave strokes and the warm sun path (inside sunColumn) stay water.
    s0, s1 = p['sunColumn']
    sunpath = (xs > s0) & (xs < s1)
    warm = ((hue < 55) | (hue > 285)) & (sat > 0.12) & ~sunpath
    dark = val < 0.32
    shore = (xs < 0.3) | (xs > 0.8)
    lilac = shore & (hue > 240) & (hue <= 285) & (sat > 0.06)  # shore rock shadows, not lake water
    water = below & ~green & ~warm & ~dark & ~lilac & ~any_polygon(p['noWater'], cw, ch)
    sway = green & any_polygon(p['sway'], cw, ch)
    sky = above & ~green & ~any_polygon(p['noSky'], cw, ch)
    stars = sky & (val > 0.9) & (sat < 0.3) & (ys < 0.25) & bool(p.get('stars', True))  # day skies: white clouds are not stars
    # Shrink water away from shores so ripples never drag rock or reed pixels into the lake.
    water = blur(water.astype(np.float32), 2) > 0.92
    stars = blur(stars.astype(np.float32), 1) > 0.05
    R = blur(water.astype(np.float32), 1)
    G = blur(sway.astype(np.float32), 2)
    B = np.maximum(sky.astype(np.float32) * 0.5, stars.astype(np.float32))
    mask = np.stack([R, G, B, np.ones_like(R)], -1)
    mask = resize(mask, mw, mh)
    mask = np.round(np.clip(mask, 0, 1) * 255) / 255
    size = save(mask, p['mask'], 100, False)
    back = pixels(load(p['mask']))
    err = float(np.abs(back[..., :3] - mask[..., :3]).max())
    print('VP05-ASSET', p['mask'], mw, 'x', mh, 'lossless', size, 'bytes', 'roundtrip-max-err', round(err * 255, 2))
    if err > 1.5 / 255:
        raise SystemExit('mask did not round-trip through WebP')
    if DEBUG:
        os.makedirs(DEBUG, exist_ok=True)
        small = resize(full, mw * 2, mh * 2)
        big = np.repeat(np.repeat(mask, 2, 0), 2, 1)
        over = small.copy()
        over[..., 0] = np.clip(small[..., 0] * 0.5 + big[..., 1] * 0.0 + big[..., 2] * 0.6, 0, 1)
        over[..., 1] = np.clip(small[..., 1] * 0.5 + big[..., 1] * 0.7, 0, 1)
        over[..., 2] = np.clip(small[..., 2] * 0.5 + big[..., 0] * 0.6, 0, 1)
        dbg = bpy.data.images.new('dbg', over.shape[1], over.shape[0])
        dbg.pixels[:] = np.ascontiguousarray(over[::-1]).ravel()
        dbg.filepath_raw = os.path.join(DEBUG, p['id'] + '-mask-overlay.png')
        dbg.file_format = 'PNG'
        dbg.save()


def build_atlas(a):
    cell, cols = a['cell'], a['cols']
    rows = (len(a['frames']) + cols - 1) // cols
    sheet = np.zeros((rows * cell, cols * cell, 4), np.float32)
    for i, (name, path) in enumerate(a['frames']):
        px = pixels(load(path))
        pre = px.copy()
        pre[..., :3] *= px[..., 3:4]  # premultiply so transparent texels never darken edges
        small = resize(pre, cell, cell)
        alpha = small[..., 3:4]
        small[..., :3] = np.where(alpha > 1e-4, small[..., :3] / np.maximum(alpha, 1e-4), 0)
        r, c = divmod(i, cols)
        sheet[r * cell:(r + 1) * cell, c * cell:(c + 1) * cell] = np.clip(small, 0, 1)
    size = save(sheet, a['out'], a['quality'], True)
    print('VP05-ASSET', a['out'], cols * cell, 'x', rows * cell, 'quality', a['quality'], size, 'bytes')
    if size > a['maxBytes']:
        raise SystemExit('atlas over budget')


for painting in SPEC['paintings']:
    build_painting(painting)
build_atlas(SPEC['atlas'])
