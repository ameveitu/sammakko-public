"""Aava: cut the approved 2D profile (lite/public/characters/aava/idle.png) into parts and inflate each part to 3D.

Every part's side silhouette is the 2D region itself, so the exact profile camera reproduces the drawing.
Writes art/characters-3d/aava/profile-parts.json (world-space meshes) and profile-target.npz (masks used by compare.py).
Run: <python with numpy scipy scikit-image triangle pillow> tools/characters-3d/profile/aava_parts.py
"""
import sys, os, numpy as np
from pathlib import Path
from scipy import ndimage as nd
from scipy.interpolate import LinearNDInterpolator
from skimage.measure import EllipseModel, CircleModel
from skimage.segmentation import watershed
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import load, disk, components, pick, voronoi, contour, triangulate, inflate, dump

ROOT = Path(__file__).resolve().parents[3]
SRC = ROOT / 'lite/public/characters/aava/idle.png'
OUT = ROOT / 'art/characters-3d/aava'
SCALE = 4              # work on a 4x bicubic upsample of the 256 px drawing
HEIGHT = 1.70          # world height from foot sole to head top (geometry, without outline)
LINE = 12.0            # ink width in work pixels (drawing median 13); volumes shrink by it and the 3D outline adds it back

img = load(SRC, SCALE); r, g, b, a = (img[..., i] for i in range(4))
sil = a > 128
navy = (b > r + 20) & (r < 120) & sil
dark = (r + g + b < 160) & sil
rust = (r > 90) & (r < 200) & (g < 90) & (b < 60) & sil
ink = navy | rust | dark
yellow = sil & ~ink & (r > 190) & (g > 150) & (b < 215) & ~((g < 175) & (b < 100))
orange = sil & ~ink & (r > 160) & (g > 55) & (g < 175) & (b < 100)
pale = sil & ~ink & (r > 200) & (g > 200) & (b > 190)

# ---------- face features (decals) measured directly from the drawing
ring = pick(navy | dark, 652, 398)
eye_outer = nd.binary_fill_holes(ring | pick(pale, 636, 401))
eye_outer = eye_outer & ~nd.binary_dilation(pick(navy, 523, 585, 1000) & ~ring, disk(1))
eye_white = nd.binary_fill_holes(pick(pale, 636, 401))
pupil_core = nd.binary_opening((navy | dark) & eye_outer & ~nd.binary_dilation(eye_white, disk(2)), disk(7))
pupil = nd.binary_fill_holes(nd.binary_closing(pick(pupil_core, 680, 395), disk(3)))
glint = nd.binary_dilation(pale & pupil & ~eye_white, disk(1)) & pupil
eye_white = eye_white & ~pupil
warm = sil & ~ink & (r - g > 38) & (r > 220) & (g > 150)
blush = pick(nd.binary_opening(nd.binary_closing(warm, disk(4)), disk(3)), 547, 474)
by, bx = np.nonzero(blush & ~nd.binary_erosion(blush)); cm = EllipseModel(); cm.estimate(np.stack([bx, by], 1))
_gy, _gx = np.mgrid[0:sil.shape[0], 0:sil.shape[1]]; _x, _y = _gx - cm.params[0], _gy - cm.params[1]; _t = cm.params[4]
cheek = ((_x * np.cos(_t) + _y * np.sin(_t)) / cm.params[2]) ** 2 + ((-_x * np.sin(_t) + _y * np.cos(_t)) / cm.params[3]) ** 2 <= 1

# ---------- volumes: the silhouette shrunk by the ink width, split between the nearest fills
body_core = pick(yellow, 600, 300, 1000) | eye_outer | cheek
# The mouth line between the bill lobes fades near the head, so a watershed on line darkness finishes the cut.
bill = nd.binary_fill_holes(pick(orange | rust, 850, 420, 500)) & ~nd.binary_dilation(pick(navy, 523, 585, 1000) & ~(orange | rust), disk(1))
bill = components(bill & ~(yellow & ~nd.binary_dilation(orange, disk(2))))[0]
# Mouth centre line straight from the drawing's own mouth ink, then the lips are cut along it.
# The mouth crayon fades to a lighter rust near the face, so it gets its own looser class.
mouth_ink = sil & (g < 115) & (r < 235) & (b < 60)
_cols = [(x, np.nonzero(mouth_ink[455:500, x])[0].mean() + 455) for x in range(762, 870) if mouth_ink[455:500, x].any()]
mouth_fit = np.polyfit([c[0] for c in _cols], [c[1] for c in _cols], 3)
_gy0, _gx0 = np.mgrid[0:sil.shape[0], 0:sil.shape[1]]
_below = _gy0 >= np.polyval(mouth_fit, _gx0)
bill_up = bill & ~_below & orange; bill_low = bill & _below & orange
bill_up = components(bill_up)[0]; bill_low = components(bill_low)[0]
# Bill base: the ink line where the bill sits on the face, per row the first rust run left of x=800.
_base = []
for _y in range(392, 518):  # rows where the bill sits on the face (above: the upper lobe's own top edge, below: the lower lobe's curve)
    _xs = np.nonzero(rust[_y, 690:800])[0]
    if len(_xs):
        _run = _xs[: np.argmax(np.diff(np.append(_xs, 10 ** 6)) > 2) + 1] + 690; _base.append((_run.mean(), _y))
base_line = np.array(_base)
_bx = np.interp(np.arange(sil.shape[0]), base_line[:, 1], base_line[:, 0], left=1e9, right=1e9)
right_of_base = _gx0 >= _bx[:, None] - 2  # the face side of the bill-base ink stays head
_mx = np.nonzero(mouth_ink[455:492, 760:870].any(0))[0]; mouth_end = 760 + _mx.max()
leg_back = pick(orange, 443, 880, 500); leg_front = pick(orange, 567, 880, 500)
inner = nd.binary_erosion(sil, disk(int(round(LINE))), border_value=0)
regions = voronoi(inner, {'yellow': body_core, 'bill_up': bill_up, 'bill_low': bill_low, 'leg_back': leg_back, 'leg_front': leg_front})
for k_ in regions: regions[k_] = components(regions[k_])[0]
Y = regions['yellow']

# Head = ellipse fitted to the round upper outline; body = everything below the neck, overlapping the head.
ys, xs = np.nonzero(Y)
edge = Y & ~nd.binary_erosion(Y, disk(1))
ey, ex = np.nonzero(edge)
upper = (ey < 545) & (ex < 735)
em = EllipseModel(); em.estimate(np.stack([ex[upper], ey[upper]], 1))
cx, cy, ra, rb, th = em.params
# 2026-11-06 sphere pass: the head is a ball. Its side outline is a circle fitted to the same upper head outline.
_cm = CircleModel(); _cm.estimate(np.stack([ex[upper], ey[upper]], 1)); hcx, hcy, hrad = _cm.params
gy, gx = np.mgrid[0:Y.shape[0], 0:Y.shape[1]]
def ellipse(scale):
    dx, dy = gx - cx, gy - cy
    u = (dx * np.cos(th) + dy * np.sin(th)) / (ra * scale); v = (-dx * np.sin(th) + dy * np.cos(th)) / (rb * scale)
    return u * u + v * v <= 1
neck = 572
head = Y & (ellipse(1.0) | (gy < neck - 30))
body = Y & ~(ellipse(.80) & (gy < neck - 10)) & (gy > neck - 140)
head = components(head)[0]; body = components(body)[0]
assert ((head | body) == Y).all() or ((head | body) ^ Y).sum() < 50, 'head and body must cover the yellow volume'

def foot_split(m):
    rows = np.nonzero(m.any(1))[0]; widths = m.sum(1)
    base = np.median(widths[rows[0]:rows[0] + 25])
    split = next(y for y in rows if widths[y] > base * 1.6)
    cols = np.nonzero(m[split - 12])[0]
    leg = m & (gy < split + 18) & (gx >= cols.min() - 2) & (gx <= cols.max() + 2)
    foot = m & (gy >= split - 4)
    return components(leg)[0], components(foot)[0], split

# ---------- world mapping (Blender: +X forward toward the bill, +Z up, -Y toward the profile camera)
rows = np.nonzero(inner.any(1))[0]
top, bottom = rows.min(), rows.max() + 1
K = HEIGHT / (bottom - top)
u0 = np.nonzero((regions['leg_back'] | regions['leg_front']).any(0))[0].mean()
def world(px, py, depth):
    return np.stack([(px - u0) * K, depth, (bottom - py) * K], 1)

parts, volumes = [], []
def volume(name, mask, material, bone, half_depth, round_px, y0=0.0, area=70.0, outline='navy'):
    poly = contour(mask, 3.0)
    v, t, nb, z = inflate(mask, poly, half_depth, round_px, area)
    n = len(v)
    front = world(v[:, 0], v[:, 1], y0 - z); back = world(v[nb:, 0], v[nb:, 1], y0 + z[nb:])
    verts = np.vstack([front, back])
    remap = np.concatenate([np.arange(nb), np.arange(n, n + n - nb)])
    faces = np.vstack([t, remap[t][:, ::-1]]) if nb else t
    # back faces: same triangles with back vertex indices (boundary shared), reversed winding
    parts.append({'name': name, 'material': material, 'bone': bone, 'outline': outline, 'verts': verts, 'faces': faces})
    if y0 == 0 or y0 < 0:
        volumes.append((LinearNDInterpolator(v, z), y0, mask))
    return poly

HEAD_SX = float(os.environ.get('AAVA_HEAD_SX', 1.0))  # side-to-side radius / profile radius (1.0 = a ball)
def sphere_z(px, py):
    """Half-depth (world) of the head ball at canvas pixels; nan outside its side outline."""
    q = hrad ** 2 - (np.asarray(px, float) - hcx) ** 2 - (np.asarray(py, float) - hcy) ** 2
    return np.where(q >= 0, np.sqrt(np.clip(q, 0, None)) * K * HEAD_SX, np.nan)
def ball(cx_, cy_, rad_, sx, nseg=48, nring=22):
    """A ball (rings around the side-to-side axis) centred on canvas pixel (cx_, cy_): its side outline is that circle exactly."""
    al = np.linspace(0, 2 * np.pi, nseg, endpoint=False); rings = []
    for ph in np.linspace(0, np.pi, nring + 1)[1:-1]:
        rho = rad_ * np.sin(ph); rings.append(world(cx_ + rho * np.cos(al), cy_ + rho * np.sin(al), np.zeros(nseg) - rad_ * np.cos(ph) * K * sx))
    nr = len(rings); poles = world(np.array([cx_, cx_]), np.array([cy_, cy_]), np.array([-rad_ * K * sx, rad_ * K * sx]))
    V = np.vstack(rings + [poles]); P0, P1 = nr * nseg, nr * nseg + 1; F_ = []
    for k in range(nr - 1):
        for i in range(nseg):
            a_, b_, c_, d_ = k * nseg + i, k * nseg + (i + 1) % nseg, (k + 1) * nseg + (i + 1) % nseg, (k + 1) * nseg + i
            F_ += [(a_, b_, c_), (a_, c_, d_)]
    for i in range(nseg): F_ += [(P0, (i + 1) % nseg, i), (P1, (nr - 1) * nseg + i, (nr - 1) * nseg + (i + 1) % nseg)]
    return V, np.array(F_)
_hv, _hf = ball(hcx, hcy, hrad, HEAD_SX)
parts.append({'name': 'Head', 'material': 'Butter yellow', 'bone': 'head', 'outline': 'navy', 'verts': _hv, 'faces': _hf})
volumes.append((sphere_z, 0.0, head))
# Body: inflated from the drawing as before, but inside the head's side outline it stays just under the ball,
# so the ball keeps its round outline from every direction.
# Where the body meets the ball (back of the neck, throat under the bill) it bulged a little past the ball: trim it to the circle there.
_ang = np.degrees(np.arctan2(gx - hcx, hcy - gy)); _out = np.hypot(gx - hcx, gy - hcy) > hrad
body = components(body & ~(_out & (np.abs(_ang) > 60) & (np.abs(_ang) < 112)))[0]
_bpoly = contour(body, 3.0); _bv, _bt, _bnb, _bz = inflate(body, _bpoly, .35, 150, 300)
_zb = sphere_z(_bv[:, 0], _bv[:, 1]); _bz = np.where(np.isfinite(_zb), np.minimum(_bz, .97 * _zb), _bz)
_n = len(_bv); _remap = np.concatenate([np.arange(_bnb), np.arange(_n, _n + _n - _bnb)])
parts.append({'name': 'Body', 'material': 'Butter yellow', 'bone': 'body', 'outline': 'navy',
              'verts': np.vstack([world(_bv[:, 0], _bv[:, 1], -_bz), world(_bv[_bnb:, 0], _bv[_bnb:, 1], _bz[_bnb:])]),
              'faces': np.vstack([_bt, _remap[_bt][:, ::-1]]) if _bnb else _bt})
volumes.append((LinearNDInterpolator(_bv, _bz), 0.0, body))
# Bills reach a little into the face so their base sits on the head instead of in a pocket.
_root = lambda m: components(m | (nd.binary_dilation(m, disk(14)) & Y & right_of_base))[0]
volume('Upper bill', _root(regions['bill_up']), 'Warm orange bill', 'head', .15, 40, outline='rust')
volume('Lower bill', _root(regions['bill_low']), 'Warm orange bill', 'head', .125, 34, outline='rust')
legs = {}
for side, key, y0 in [(1, 'leg_back', .12), (-1, 'leg_front', -.12)]:
    leg, foot, split = foot_split(regions[key])
    legs[side] = (leg, foot)
    volume('Leg.%d' % side, leg, 'Feet orange', 'leg_%d' % side, .045, 16, y0=y0, area=30)
    volume('Webbed foot.%d' % side, foot, 'Feet orange', 'foot_%d' % side, .07, 20, y0=y0, area=30)

def surface(px, py, which=(0, 1)):
    """Nearest-to-camera surface depth (negative y) of the chosen volumes (default head and body) at pixel positions."""
    best = np.full(len(px), np.inf)
    for interp, y0, mask in [volumes[i] for i in which]:
        z = interp(px, py)
        best = np.where(np.isfinite(z), np.minimum(best, y0 - np.nan_to_num(z, nan=-np.inf)), best)
    return best

def decal(name, mask, material, layer, bone='head', area=50.0):
    poly = contour(mask, 2.0)
    v, t, nb = triangulate(poly, area)
    y = surface(v[:, 0], v[:, 1]) - .004 * layer
    for side in (-1, 1):
        verts = world(v[:, 0], v[:, 1], y if side < 0 else -y)
        parts.append({'name': '%s.%d' % (name, side), 'material': material, 'bone': bone, 'outline': None, 'verts': verts,
                      'faces': t if side < 0 else t[:, ::-1]})

decal('Eye rim', eye_outer, 'Dark blue eye edge', 1)
decal('Eye white', eye_white, 'Eye pale', 2)
decal('Pupil', pupil, 'Deep navy pupil', 3)
if glint.sum() > 6: decal('Eye glint', glint, 'Eye pale', 4)

# Mouth line: an ink stroke laid into the crease between the two bill lobes, on both sides of the bill.
seam = regions['bill_up'] & nd.binary_dilation(regions['bill_low'], disk(1))
_sx = np.nonzero(seam.any(0))[0]
_x0 = next(x for x in range(int(base_line[:, 0].min()), 900) if x > _bx[int(round(np.polyval(mouth_fit, x)))] + LINE / 2 - 2)
# The crayon line's own top and bottom edge per column (it tapers at both ends), smoothed a little.
xs_ = np.arange(_x0, mouth_end + 1, 2.0); _top, _bot = [], []
for _x in xs_.astype(int):
    _c = np.polyval(mouth_fit, _x); _r = np.nonzero(mouth_ink[int(_c) - 9:int(_c) + 10, _x])[0] + int(_c) - 9
    _top.append(_r.min() - .5 if len(_r) else _c); _bot.append(_r.max() + .5 if len(_r) else _c)
_top = nd.gaussian_filter1d(np.array(_top), 1.2); _bot = nd.gaussian_filter1d(np.array(_bot), 1.2)
pts = np.vstack([np.stack([xs_, _top], 1), np.stack([xs_, _bot], 1)]); m_ = len(xs_)
quads = [(i, i + 1, m_ + i + 1, m_ + i) for i in range(m_ - 1)]
tris = np.array([q for a, b, c, d in quads for q in ((a, b, c), (a, c, d))])
y = surface(pts[:, 0], pts[:, 1], (2, 3)) - .004
y = np.where(np.isfinite(y), y, -.002)
for side in (-1, 1):
    parts.append({'name': 'Mouth line.%d' % side, 'material': 'ink rust', 'bone': 'head', 'outline': None, 'verts': world(pts[:, 0], pts[:, 1], y if side < 0 else -y), 'faces': tris})
_curve = np.zeros_like(sil); _cx = np.arange(int(base_line[:, 0].min()), mouth_end + 1); _curve[np.round(np.polyval(mouth_fit, _cx)).astype(int), _cx] = True
mouth_target = mouth_ink & nd.binary_dilation(_curve, disk(9)) & (_gx0 > _bx[:, None] + LINE / 2) & (_gx0 <= mouth_end)

def stroke(name, centre, width, which, material='ink rust'):
    c = np.asarray(centre, float); c = np.stack([nd.gaussian_filter1d(c[:, 0], 3), nd.gaussian_filter1d(c[:, 1], 3)], 1)
    tg = np.gradient(c, axis=0); tg /= np.linalg.norm(tg, axis=1, keepdims=True); nm = np.stack([-tg[:, 1], tg[:, 0]], 1)
    p_ = np.vstack([c + nm * width / 2, c - nm * width / 2]); m2 = len(c)
    tr_ = np.array([q for i in range(m2 - 1) for q in ((i, i + 1, m2 + i + 1), (i, m2 + i + 1, m2 + i))])
    yy = surface(p_[:, 0], p_[:, 1], which); yy = np.where(np.isfinite(yy), yy, -.002)
    # One depth across the ribbon's width, smoothed along it: a clean painted band over the bill/face seam.
    yy = nd.gaussian_filter1d(np.minimum(yy[:m2], yy[m2:]), 2) - .006; yy = np.concatenate([yy, yy])
    for side in (-1, 1):
        parts.append({'name': '%s.%d' % (name, side), 'material': material, 'bone': 'head', 'outline': None, 'verts': world(p_[:, 0], p_[:, 1], yy if side < 0 else -yy), 'faces': tr_})
# Sphere pass: the base line follows the bill only (on the ball's side it read as a stray line on the cheek).
stroke('Mouth base line', base_line[::3], LINE * .85, (2, 3))
decal('Cheek', cheek, 'Soft pink cheek', 1)

# Wing: the drawn U-shaped feather line, closed at the top and tucked into the body at the shoulder.
wing_line = pick(navy, 479, 714, 500)
wing = nd.binary_fill_holes(nd.binary_closing(wing_line, disk(25))) & body
poly = contour(wing, 3.0); v, t, nb, zw = inflate(wing, poly, .028, 24, 60)
ys_ = v[:, 1]; lift = np.clip((ys_ - ys_.min()) / (ys_.max() - ys_.min()), 0, 1)
base = surface(v[:, 0], v[:, 1]) - (.03 * lift - .035 * (1 - lift))  # bottom stands out, top sinks into the body
for side in (-1, 1):
    front = base - zw; back = base + .02 * (zw > 0)
    n = len(v); remap = np.concatenate([np.arange(nb), np.arange(n, n + n - nb)])
    yy = np.concatenate([front, back[nb:]])
    vv = np.vstack([v, v[nb:]])
    verts = world(vv[:, 0], vv[:, 1], yy * (1 if side < 0 else -1))
    faces = np.vstack([t, remap[t][:, ::-1]])
    # No hull on the wing: the drawing's wing is just its U-shaped ink line, painted on below.
    parts.append({'name': 'Wing.%d' % side, 'material': 'Wing butter yellow', 'bone': 'wing_%d' % side, 'outline': None, 'verts': verts,
                  'faces': faces if side < 0 else faces[:, ::-1]})
wing_front = LinearNDInterpolator(v, base - zw)
wp = contour(wing_line, 2.0); wv, wt, _ = triangulate(wp, 40.0)
wy = np.fmin(np.nan_to_num(wing_front(wv[:, 0], wv[:, 1]), nan=np.inf), surface(wv[:, 0], wv[:, 1])) - .012
for side in (-1, 1):
    parts.append({'name': 'Wing ink.%d' % side, 'material': 'ink navy', 'bone': 'wing_%d' % side, 'outline': None,
                  'verts': world(wv[:, 0], wv[:, 1], wy if side < 0 else -wy), 'faces': wt if side < 0 else wt[:, ::-1]})

def centroid(mask):
    ys, xs = np.nonzero(mask); return world(np.array([xs.mean()]), np.array([ys.mean()]), np.array([0.]))[0].tolist()
hy = np.nonzero(head)[0]
joints = {
    'neck': world(np.array([np.nonzero(Y[neck])[0].mean()]), np.array([neck]), np.array([0.]))[0].tolist(),
    'head_top': world(np.array([hcx]), np.array([hcy - hrad]), np.array([0.]))[0].tolist(),
    'head_center': world(np.array([hcx]), np.array([hcy]), np.array([0.]))[0].tolist(), 'head_radius': float(hrad * K), 'head_sx': HEAD_SX, 'roundness_skip': ['Upper bill', 'Lower bill'],
    'body': centroid(body), 'wing': centroid(wing),
    'legs': {s: {'hip': world(np.array([np.nonzero(l)[1].mean()]), np.array([np.nonzero(l)[0].min()]), np.array([0.]))[0].tolist(),
                 'ankle': world(np.array([np.nonzero(l)[1].mean()]), np.array([np.nonzero(f)[0].min() + 6]), np.array([0.]))[0].tolist(),
                 'toe': world(np.array([np.nonzero(f)[1].max()]), np.array([np.nonzero(f)[0].mean()]), np.array([0.]))[0].tolist()}
             for s, (l, f) in legs.items()},
}
colour = lambda m: (img[m][:, :3].mean(0) / 255).tolist()
palette = {'Butter yellow': colour(yellow & Y), 'Wing butter yellow': colour(yellow & Y), 'Warm orange bill': colour(regions['bill_up'] & orange),
           'Feet orange': colour(orange & (regions['leg_back'] | regions['leg_front'])), 'Dark blue eye edge': colour(navy & ring & ~pupil),
           'Eye pale': colour(eye_white), 'Deep navy pupil': colour(pupil & ~glint), 'Soft pink cheek': colour(cheek),
           'ink navy': colour(pick(navy, 523, 585, 1000)), 'ink rust': colour(rust)}
camera = {'width_px': img.shape[1], 'height_px': img.shape[0], 'K': K, 'u0': float(u0), 'bottom': int(bottom), 'line_px': LINE, 'line_world': LINE * K}
dump(OUT / 'profile-parts.json', {'source': str(SRC.relative_to(ROOT)), 'scale': SCALE, 'camera': camera, 'palette': palette, 'joints': joints, 'parts': parts})
np.savez_compressed(OUT / 'profile-target.npz', silhouette=sil, eye=eye_outer, eye_white=eye_white, pupil=pupil, bill_upper=regions['bill_up'], bill_lower=regions['bill_low'], cheek=cheek, mouth=mouth_target)
print('parts', len(parts), 'K', K, 'line world', LINE * K, 'head ellipse', [round(p, 1) for p in em.params], 'head circle', [round(float(p), 1) for p in _cm.params])
