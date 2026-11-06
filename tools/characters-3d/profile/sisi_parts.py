"""Sisi: cut the approved 2D profile (the large lizard in art/characters/lizard/concepts/sleepy-lizard-v1.png) into parts
and inflate each part to 3D, exactly like aava_parts.py.

Every part's side silhouette is the 2D region itself, so the exact profile camera reproduces the drawing.
Writes art/characters-3d/sisi/profile-parts.json (world-space meshes) and profile-target.npz (masks used by compare.py).
Run: <python with numpy scipy scikit-image triangle pillow> tools/characters-3d/profile/sisi_parts.py
"""
import sys, os, numpy as np
from pathlib import Path
from scipy import ndimage as nd
from scipy.interpolate import LinearNDInterpolator
from skimage.measure import EllipseModel, CircleModel
from skimage.morphology import convex_hull_image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import load, disk, components, pick, voronoi, contour, triangulate, inflate, dump

ROOT = Path(__file__).resolve().parents[3]
SRC = ROOT / 'art/characters/lizard/concepts/sleepy-lizard-v1.png'
OUT = ROOT / 'art/characters-3d/sisi'
CROP = (slice(0, 1000), slice(0, 900))  # the large profile lizard; the two small poses are left out
HEIGHT = 1.50          # world height from foot sole to head top (geometry, without outline)
LINE = 12.0            # ink width in source pixels (drawing median 12); volumes shrink by it and the 3D outline adds it back

img = load(SRC, 1)[CROP]; r, g, b = (img[..., i] for i in range(3))
paper = np.sqrt((r - 253) ** 2 + (g - 242) ** 2 + (b - 215) ** 2)
sil = nd.binary_fill_holes(pick(nd.binary_opening(paper > 45, disk(1)), 330, 700, 5000))
ink = sil & (b > 50) & (r < 120) & (g < 150) & (b < 140)
fill = sil & ~ink
crest_c = fill & (r < 130) & (g > 100) & (b < 75)
belly_c = fill & (r > 205) & (b > 80) & (b < 170)
cheek_c = fill & (r > 205) & (b < 90) & (g > 200)
gy, gx = np.mgrid[0:sil.shape[0], 0:sil.shape[1]]

# ---------- eye, measured straight from the drawing
ring = pick(ink, 500, 265, 500)
eye_outer = convex_hull_image(ring)  # the round eye ring has crayon gaps, its hull is the drawn eye
lid = nd.binary_fill_holes(pick(fill & eye_outer, 574, 238))
eye_white = nd.binary_fill_holes(pick(fill & eye_outer & ~lid, 580, 319))
pupil = nd.binary_fill_holes(nd.binary_closing(pick(nd.binary_opening(ink & eye_outer, disk(7)), 630, 290), disk(3)))
assert eye_outer.sum() > 20000 and lid.sum() > 5000 and eye_white.sum() > 3000 and 1500 < pupil.sum() < 9000, 'eye parts not found'
cheek_blob = pick(nd.binary_opening(nd.binary_closing(cheek_c, disk(5)), disk(4)), 455, 375)
by, bx = np.nonzero(cheek_blob & ~nd.binary_erosion(cheek_blob)); cm = EllipseModel(); cm.estimate(np.stack([bx, by], 1))
_x, _y = gx - cm.params[0], gy - cm.params[1]; _t = cm.params[4]
cheek = ((_x * np.cos(_t) + _y * np.sin(_t)) / cm.params[2]) ** 2 + ((-_x * np.sin(_t) + _y * np.cos(_t)) / cm.params[3]) ** 2 <= 1

# ---------- tongue: the forked ink line outside the head
sil_body = components(nd.binary_opening(sil, disk(9)))[0]
tongue = pick(sil & ~nd.binary_dilation(sil_body, disk(1)) & (gx > 690), 790, 330, 200)
assert tongue is not None and tongue.sum() > 800, 'tongue not found'
# The 3D tongue reaches back into the head so it grows out of the face, not out of the outline.
_root_pt = np.array(np.nonzero(tongue & nd.binary_dilation(sil_body, disk(3)))).mean(1)  # (y, x) where it leaves the head
tongue_vol = tongue | (np.hypot(gx - (_root_pt[1] - 14), gy - _root_pt[0]) < 7) | ((np.abs(gy - _root_pt[0]) < 6) & (gx > _root_pt[1] - 22) & (gx <= _root_pt[1] + 2))

# ---------- feet: the far foot is its own fill; the near foot is the lime under the ink arc
far_foot_fill = pick(fill & (gy > 840), 620, 910, 1000)
near = np.zeros_like(sil)
for x in range(360, 552):
    col = np.nonzero(ink[835:, x])[0] + 835
    if not len(col): continue
    runs = np.split(col, np.nonzero(np.diff(col) > 1)[0] + 1)
    if len(runs) >= 2:  # first run: the toe arc, last run: the sole outline
        near[runs[0][-1] + 1:runs[-1][0], x] = True
near_foot_fill = components(near & fill)[0]

# ---------- volumes: the silhouette shrunk by the ink width, split between the nearest fills
inner = nd.binary_erosion(sil & ~tongue, disk(int(round(LINE))), border_value=0)
green_core = fill & ~crest_c | eye_outer | cheek
green_core &= ~near_foot_fill & ~far_foot_fill
crest_core = crest_c & ~eye_outer
regions = voronoi(inner, {'green': green_core & ~nd.binary_dilation(crest_core, disk(1)), 'crest': nd.binary_opening(crest_core, disk(2)),
                          'near_foot': near_foot_fill, 'far_foot': far_foot_fill})
for k_ in regions: regions[k_] = components(regions[k_])[0] if k_ != 'crest' else regions[k_]
M = nd.binary_fill_holes(regions['green']); regions['crest'] &= ~M  # dark lid crayon inside the eye is not crest

# Head = circle fitted to the round upper-right outline; body (with the tail) = everything below the chin, overlapping the head.
edge = M & ~nd.binary_erosion(M, disk(1)); ey, ex = np.nonzero(edge)
upper = (ey < 420) & (ex > 430)
em = CircleModel(); em.estimate(np.stack([ex[upper], ey[upper]], 1)); cx, cy, rad = em.params
def ellipse(scale):
    return np.hypot(gx - cx, gy - cy) <= rad * scale
neck = 505
# 2026-11-06 sphere pass. The user's turnaround board draws the head as a full ball with the crest outside it (side view:
# turnaround-side-v1.png, cutout 090 of board 04); in the large drawing the top crest bites into the head. So the head is a
# sphere on the circle above (KPI: head_roundness.py), and the crest outline comes from the board's side view registered onto
# this canvas. Face, eye, tongue, arm, body and feet still come from the large drawing.
head = ellipse(1.0)
body = components(M & ~(ellipse(.80) & (gy < neck - 10)) & (gy > neck - 140))[0]
BSRC = ROOT / 'art/characters/lizard/concepts/turnaround-side-v1.png'
_bim = load(BSRC, 1); _ba = _bim[..., 3] > 128
def _place(a_, s_):
    """Board alpha scaled by s_ (bilinear), soles on the drawing's sole row; returns (mask on this canvas fn of dx, dy)."""
    from PIL import Image as _I
    h_, w_ = int(a_.shape[0] * s_), int(a_.shape[1] * s_)
    A_ = np.asarray(_I.fromarray((a_ * 255).astype(np.uint8)).resize((w_, h_), _I.BILINEAR)).astype(float)
    return A_
def _shift(A_, dx_, dy_):
    C_ = np.zeros(sil.shape); ys_, xs_ = slice(max(dy_, 0), min(dy_ + A_.shape[0], sil.shape[0])), slice(max(dx_, 0), min(dx_ + A_.shape[1], sil.shape[1]))
    C_[ys_, xs_] = A_[ys_.start - dy_:ys_.stop - dy_, xs_.start - dx_:xs_.stop - dx_]; return C_
_best = None
for _s in np.arange(4.6, 5.8, .04):  # board figure ~180 px tall, drawing ~950 px: search scale and x, soles aligned
    _A = _place(_ba, _s) > 128; _ya, _xa = np.nonzero(_A); _dy = int(np.nonzero(sil.any(1))[0].max() - _ya.max())
    _dx0 = int(np.nonzero(sil.any(0))[0].max() - _xa.max())
    for _dx in range(_dx0 - 60, _dx0 + 61, 3):
        _C = _shift(_A.astype(float), _dx, _dy) > .5; _iou = (_C & sil).sum() / (_C | sil).sum()
        if _best is None or _iou > _best[0]: _best = (_iou, _s, _dx, _dy)
BOARD_REG = {'iou': float(_best[0]), 'scale': float(_best[1]), 'dx': int(_best[2]), 'dy': int(_best[3])}
board_sil = _shift(_place(_ba, _best[1]), _best[2], _best[3]) > 128
board_inner = nd.binary_erosion(nd.binary_fill_holes(board_sil), disk(int(round(LINE))), border_value=0)
# Crest = the board's outline behind the head ball and the body, plus the narrow strip the drawing leaves between them.
# Only parts that touch the drawing's own crest count, so small board/drawing differences at the face, belly or feet stay out.
_cand = (board_inner | (M & ~head & ~body)) & ~head & ~body & ~regions['near_foot'] & ~regions['far_foot'] & (gx < cx)
_near = nd.binary_dilation(regions['crest'], disk(30))
crest_new = np.zeros_like(sil)
for _c in components(nd.binary_opening(_cand, disk(4)), 1500):
    if (_c & _near).any(): crest_new |= _c
crest_new = nd.gaussian_filter(crest_new.astype(float), 3) > .5
crest_parts = components(crest_new, 1500)[:1]
missing = M & ~(head | body | crest_new)
assert missing.sum() < 1200, 'head, body and crest must cover the green volume (%d px left)' % missing.sum()

# Tail weights: the low back-left curl bends with three tail bones; everything else follows the body.
TAIL_X0, TAIL_TOP = 370.0, 790.0
_ty, _tx = np.nonzero(M & (gx < TAIL_X0) & (gy > 840)); TAIL_TIP = float(_tx.min())
def tail_weights(px, py):
    low = np.clip((py - TAIL_TOP) / 60.0, 0, 1)
    t = np.clip((TAIL_X0 - px) / (TAIL_X0 - TAIL_TIP) * 3, 0, 3)
    w = {'body': 1 - low * np.clip(t, 0, 1), 'tail1': low * np.where(t < 1, t, np.clip(2 - t, 0, 1)),
         'tail2': low * np.where(t < 1, 0, np.where(t < 2, t - 1, 3 - t)), 'tail3': low * np.clip(t - 2, 0, 1)}
    return {k: np.round(v, 4) for k, v in w.items()}

rows = np.nonzero(inner.any(1))[0]
top, bottom = rows.min(), rows.max() + 1
K = HEIGHT / (bottom - top)
u0 = np.nonzero(body.any(0))[0].mean()
def world(px, py, depth):
    return np.stack([(px - u0) * K, depth, (bottom - py) * K], 1)


# ---------- front reference: a generated straight-on view of the same Sisi (front-reference-v1.png, see its provenance json).
# It sets how wide each part is seen from the front; the side drawing above still decides everything seen from the side.
FSRC = ROOT / 'art/characters/lizard/concepts/front-reference-v1.png'
fim = load(FSRC, 1); fr, fg, fb = (fim[..., i] for i in range(3))
fsil = nd.binary_fill_holes(pick(nd.binary_opening(np.sqrt((fr - 252) ** 2 + (fg - 245) ** 2 + (fb - 220) ** 2) > 45, disk(1)), 512, 900, 5000))
fink = fsil & (fr < 110) & (fb > 70) & (fg < 170)
ffill = fsil & ~fink
f_tongue = fsil & (fr > 100) & (fg < 90) & (fb < 110)
ffill &= ~f_tongue
# The reference leaves the chin line open, so head and body share one fill: an ellipse fitted to the head's outer edge splits them.
_fy, _fx = np.mgrid[0:fsil.shape[0], 0:fsil.shape[1]]
_er = [(y_, x_) for y_ in range(330, 700, 4) for x_ in (np.nonzero(fsil[y_])[0][[0, -1]] if fsil[y_].any() else [])]
_hm = EllipseModel(); _hm.estimate(np.array([(x_, y_) for y_, x_ in _er], float)); _hx, _hy, _ha, _hb, _ht = _hm.params
f_head_ell = ((((_fx - _hx) * np.cos(_ht) + (_fy - _hy) * np.sin(_ht)) / _ha) ** 2 + ((-(_fx - _hx) * np.sin(_ht) + (_fy - _hy) * np.cos(_ht)) / _hb) ** 2) <= 1
_all = nd.binary_fill_holes(pick(ffill, 512, 1000, 5000) | f_tongue)
f_head = f_head_ell & _all  # fill inside the head outline (shrunk by one 3D outline width after warping)
f_body = _all & ~f_head_ell & (_fy > _hy)
f_feet = {-1: nd.binary_fill_holes(pick(ffill, 330, 1305, 2000)), 1: nd.binary_fill_holes(pick(ffill, 690, 1305, 2000))}
f_tail = nd.binary_fill_holes(pick(ffill, 110, 1215, 1000))
# Align: the head top (centre columns) and the soles match the side drawing's head top and soles.
_hc = np.nonzero(f_head.any(0))[0]; f_uc = (_hc.min() + _hc.max()) / 2
f_top = np.nonzero(f_head[:, int(f_uc) - 30:int(f_uc) + 30].any(1))[0].min()
f_bottom = max(np.nonzero(f_feet[s_].any(1))[0].max() for s_ in (-1, 1)) + 1
s_top = np.nonzero(head.any(1))[0].min()
FS = (bottom - s_top) / (f_bottom - f_top)
UC = (sil.shape[1] - 1) / 2  # canvas column of the mid-plane
def fwarp(mask):
    """Front-reference mask -> side-canvas pixels (same rows as the side drawing, mid-plane at column UC)."""
    out = nd.affine_transform(mask.astype(float), np.diag([1 / FS, 1 / FS]), offset=[f_top - s_top / FS, f_uc - UC / FS], output_shape=sil.shape, order=1)
    return out > .5
F = {k: fwarp(m) for k, m in {'silhouette': fsil, 'head': f_head, 'body': f_body, 'tail': f_tail, 'tongue': f_tongue}.items()}
F['feet'] = {k: fwarp(m) for k, m in f_feet.items()}
# Geometry edge = silhouette minus one 3D outline width. Fill regions sit one drawn ink width inside the silhouette, so they grow by the difference.
_d = int(round(18.0 * FS - LINE))
for k_ in ('body', 'tail'): F[k_] = nd.binary_dilation(F[k_], disk(_d)) if _d > 0 else F[k_]
F['feet'] = {k_: nd.binary_dilation(m_, disk(_d)) if _d > 0 else m_ for k_, m_ in F['feet'].items()}
F['head'] = nd.binary_erosion(fwarp(f_head_ell), disk(int(round(LINE)))) & nd.binary_dilation(F['head'], disk(max(_d, 1)))
# Front eye parts (each eye: hull of its ring; inside it the lid, the white and the pupil).
f_eyes = []
for x_ in (320, 700):
    ring_ = pick(fink, x_, 390, 500)
    f_eyes.append(convex_hull_image(ring_))
f_eye = f_eyes[0] | f_eyes[1]
_bl = [nd.gaussian_filter(c_, 3) for c_ in (fr, fg, fb)]  # crayon texture is speckled; colour classes use a softened copy
f_inside = nd.binary_erosion(f_eye, disk(22))  # inside the ring band
f_pupil = np.zeros_like(fsil)
for e_ in f_eyes:
    dark_ = nd.binary_opening(e_ & f_inside & (_bl[1] < 110), disk(9))
    if dark_.any(): f_pupil |= components(dark_)[0]
f_lid = nd.binary_opening(f_eye & ~f_pupil & (_bl[1] > 160) & (_bl[2] < 110) & (_bl[0] < 200), disk(3))
f_white = nd.binary_opening(f_eye & (_bl[0] > 200) & (_bl[2] > 140), disk(3))
_cc = nd.binary_fill_holes(nd.binary_opening(f_head & ~f_eye & (_bl[0] > 222) & (_bl[2] < 120), disk(6)))
f_cheek = pick(_cc, 290, 625, 500) | pick(_cc, 730, 625, 500)
f_belly = nd.binary_fill_holes(nd.binary_opening(f_body & (_bl[0] > 218) & (_bl[2] > 95), disk(6)))
for k, m in {'eye': f_eye, 'pupil': f_pupil, 'lid': f_lid, 'eye_white': f_white, 'cheek': f_cheek, 'belly': f_belly}.items(): F[k] = fwarp(m)
def front_rows(mask, right=False):
    """Half-width (px) of a front mask on each side-canvas row (0 where empty) and its centre column.
    right=True measures from the mid-plane to the right edge (the left side of the reference also has the tail)."""
    any_ = mask.any(1); w = np.zeros(mask.shape[0]); c = np.full(mask.shape[0], UC)
    for y_ in np.nonzero(any_)[0]:
        xs_ = np.nonzero(mask[y_])[0]; w[y_] = (xs_.max() - xs_.min() + 1) / 2; c[y_] = (xs_.max() + xs_.min()) / 2
        if right: w[y_] = max(xs_.max() + .5 - UC, 0)
    return w, c

parts, volumes = [], {}
def paint_lines(paint, mask, step=3.0, margin=4.0):
    """The paint region's outline, kept only where it runs inside the volume (on the volume edge the volume's own edge is used)."""
    inside = nd.distance_transform_edt(mask)
    c = contour(paint, step); keep = nd.map_coordinates(inside, [c[:, 1], c[:, 0]], order=1) > margin
    lines, cur = [], []
    for pt, k in zip(c, keep):
        if k: cur.append(pt)
        elif cur: lines.append(np.array(cur)); cur = []
    if cur: lines.append(np.array(cur))
    if len(lines) > 1 and keep[0] and keep[-1]: lines[0] = np.vstack([lines.pop(), lines[0]])
    return lines

TAU = float(os.environ.get('SISI_TAU', .15)); NOSE = float(os.environ.get('SISI_NOSE', .65))
BTAU = float(os.environ.get('SISI_BTAU', .1)); BNOSE = float(os.environ.get('SISI_BNOSE', .5))
def front_shape(mask, half_depth, round_px, width, tau=None, nose=0.0, solid=.6, oval=False, xmin=0, superell=0.0):
    """Two-view shaping. Returns depth(px, py) for a part: the side shape is the part's 2D region, and on every row the
    deepest point is scaled so the front-view half-width equals `width` (px per row). `nose` narrows the depth toward the
    snout without changing the row's deepest point, so the face reads like the front reference."""
    if superell:  # every row a superellipse cross-section between its side extents (fuller than an ellipse, no flat cheeks)
        D = np.zeros(mask.shape)
        for y_ in np.nonzero(mask.any(1))[0]:
            xs_ = np.nonzero(mask[y_])[0]; a_, b_ = xs_.min() - .5, xs_.max() + .5; h_ = (b_ - a_) / 2
            u_ = np.clip(np.abs((xs_ - (a_ + h_)) / h_), 0, 1); D[y_, xs_] = (1 - u_ ** superell) ** (1 / superell)
        D = nd.gaussian_filter(D, (float(os.environ.get('SISI_SE_SIG', 12)), 3)) * mask
    elif oval:  # every row an elliptic cross-section between its side extents: the front outline is exactly `width`
        D = np.zeros(mask.shape)
        for y_ in np.nonzero(mask.any(1))[0]:
            xs_ = np.nonzero(mask[y_])[0]; a_, b_ = xs_.min() - .5, xs_.max() + .5; h_ = (b_ - a_) / 2
            D[y_, xs_] = np.sqrt(np.clip(1 - ((xs_ - (a_ + h_)) / h_) ** 2, 0, 1))
        D = nd.gaussian_filter(D, 2) * mask
        # The side foot is taller than the front one: stretch the front oval over the side rows so its top stays round.
        has = np.nonzero(width > 0)[0]; srows = np.nonzero(mask.any(1))[0]
        r_ = np.arange(srows.min(), srows.max() + 1); src = has.min() + (r_ - r_[0]) * (has.max() - has.min()) / max(r_[-1] - r_[0], 1)
        w2 = np.zeros_like(width); w2[r_] = np.interp(src, np.arange(len(width)), width); width = w2; solid = 0.0
    else:
        dt = nd.distance_transform_edt(np.pad(mask, 1))[1:-1, 1:-1]
        D = np.sqrt(1 - (1 - np.clip(dt / round_px, 0, 1)) ** 2)
        D = nd.gaussian_filter(D, 5) * mask  # soft dense pillow (no medial ridges)
    rowD = D.max(1)
    if nose:
        A = np.ones(mask.shape)
        for y_ in np.nonzero(mask.any(1))[0]:
            xs_ = np.nonzero(mask[y_])[0]; a_, b_ = max(xs_.min(), xmin), xs_.max() + 1
            if b_ - a_ < 4: continue
            m_ = a_ + tau * (b_ - a_); u_ = np.clip((np.arange(a_, b_) - m_) / max(b_ - m_, 1), 0, 1)
            A[y_, a_:b_] = 1 - nose * u_ * u_ * (3 - 2 * u_)
        DA = D * A; rowDA = DA.max(1)
        D = DA * np.where(rowDA > 0, rowD / np.maximum(rowDA, 1e-9), 1)[:, None]  # same deepest point per row
    ok = (width > 0) & (rowD > solid * rowD.max())  # thin top/bottom rows keep the nearest solid row's scale, so they stay round
    yi = np.nonzero(ok)[0]
    S = np.full(len(width), half_depth); S[yi] = width[yi] * K / rowD[yi]
    S = np.interp(np.arange(len(S)), yi, S[yi])
    S = nd.gaussian_filter1d(S, 3 if oval else 10)
    Z = D * S[:, None]
    def depth(px, py):
        return nd.map_coordinates(Z, [np.clip(py, 0, mask.shape[0] - 1), np.clip(px, 0, mask.shape[1] - 1)], order=1, mode='nearest')
    depth.Z = Z
    return depth

# The tail swings out to Sisi's right (toward -y), as the front reference shows it beside the near foot.
_tw = F['tail'].any(0); TAIL_OUT = (UC - np.nonzero(_tw)[0].min()) * K - .15 if _tw.any() else 0.0
def tail_swing(px, py):
    low = np.clip((py - TAIL_TOP) / 60.0, 0, 1); t = np.clip((TAIL_X0 - px) / (TAIL_X0 - TAIL_TIP), 0, 1)
    return -TAIL_OUT * low * t * t

def volume(name, mask, material, bone, half_depth, round_px, y0=0.0, area=70.0, outline='navy', step=3.0, weighted=False, paint=None, front=None, swing=False, weights=None):
    """paint: optional (mask, material) coloured straight into this volume's own faces (no decal, so nothing can flicker)."""
    poly = contour(mask, step)
    v, t, nb, z = inflate(mask, poly, half_depth, round_px, area, extra=paint_lines(paint[0], mask) if paint else ())
    if front is not None: z = front(v[:, 0], v[:, 1]); z[:nb] = 0
    n = len(v); yc = y0 + (tail_swing(v[:, 0], v[:, 1]) if swing else 0)
    front = world(v[:, 0], v[:, 1], yc - z); back = world(v[nb:, 0], v[nb:, 1], (yc + z)[nb:])
    remap = np.concatenate([np.arange(nb), np.arange(n, n + n - nb)])
    spec = {'name': name, 'material': material, 'bone': bone, 'outline': outline, 'verts': np.vstack([front, back]),
            'faces': np.vstack([t, remap[t][:, ::-1]]) if nb else t}
    if weighted:
        allv = np.vstack([v, v[nb:]]); spec['weights'] = (weights or tail_weights)(allv[:, 0], allv[:, 1])
    if paint:
        cen = v[t].mean(1); hit = paint[0][np.clip(np.round(cen[:, 1]).astype(int), 0, mask.shape[0] - 1), np.clip(np.round(cen[:, 0]).astype(int), 0, mask.shape[1] - 1)]
        spec['materials'] = [material, paint[1]]; spec['face_material'] = np.concatenate([hit, hit]).astype(int)
    parts.append(spec)
    volumes[name] = (LinearNDInterpolator(v, z), y0)  # (decals sit on the unswung side; the swing only moves the low tail)

# Parts that meet another part reach into it so no seam opens in 3D; the reach stays hidden behind the thicker part.
reach = lambda m, into, px: components(m | (nd.binary_dilation(m, disk(px)) & into))[0]
W_body, _ = front_rows(F['body'], right=True)
# 2026-11-06 turn pass: the board's eight views show a fuller body than the generated front reference (width fitted to the turn).
W_body = W_body * float(os.environ.get('SISI_BODY_W', 1.2))
# ---------- head: a ball. Rings around the side-to-side axis, so the side outline is the fitted circle exactly and every view is round.
HEAD_SX = float(os.environ.get('SISI_HEAD_SX', 1.0))  # side-to-side radius / profile radius (1.0 = a ball)
def sphere_z(px, py):
    """Half-depth (world) of the head ball at canvas pixels; nan outside its side outline."""
    q = rad ** 2 - (np.asarray(px, float) - cx) ** 2 - (np.asarray(py, float) - cy) ** 2
    return np.where(q >= 0, np.sqrt(np.clip(q, 0, None)) * K * HEAD_SX, np.nan)
def ball(cx, cy, rad, sx, nseg=56, nring=24, swing=False):
    """A ball (rings around the side-to-side axis) centred on canvas pixel (cx, cy): its side outline is that circle exactly."""
    al = np.linspace(0, 2 * np.pi, nseg, endpoint=False); rings = []; HEAD_SX = sx
    for ph in np.linspace(0, np.pi, nring + 1)[1:-1]:  # includes pi/2: the profile circle itself
        rho = rad * np.sin(ph); px_, py_ = cx + rho * np.cos(al), cy + rho * np.sin(al)
        rings.append(world(px_, py_, np.zeros(nseg) + (tail_swing(px_, py_) if swing else 0) - rad * np.cos(ph) * K * HEAD_SX))
    nr = len(rings); ys_ = tail_swing(np.array([cx]), np.array([cy]))[0] if swing else 0
    poles = world(np.array([cx, cx]), np.array([cy, cy]), np.array([ys_ - rad * K * HEAD_SX, ys_ + rad * K * HEAD_SX]))
    V = np.vstack(rings + [poles]); P0, P1 = nr * nseg, nr * nseg + 1; F_ = []
    for k in range(nr - 1):
        for i in range(nseg):
            a_, b_, c_, d_ = k * nseg + i, k * nseg + (i + 1) % nseg, (k + 1) * nseg + (i + 1) % nseg, (k + 1) * nseg + i
            F_ += [(a_, b_, c_), (a_, c_, d_)]
    for i in range(nseg):
        F_ += [(P0, (i + 1) % nseg, i), (P1, (nr - 1) * nseg + i, (nr - 1) * nseg + (i + 1) % nseg)]
    return V, np.array(F_)
_hv, _hf = ball(cx, cy, rad, HEAD_SX, nseg=48, nring=22)
parts.append({'name': 'Head', 'material': 'Lime green', 'bone': 'head', 'outline': 'navy', 'verts': _hv, 'faces': _hf})
volumes['Head'] = (sphere_z, 0.0)
head_depth = lambda px, py: np.nan_to_num(sphere_z(px, py)); head_depth.Z = np.nan_to_num(sphere_z(gx, gy))
belly = nd.binary_fill_holes(nd.binary_closing(pick(belly_c, 520, 700, 2000), disk(14)))
belly = nd.gaussian_filter(belly.astype(float), 6) > .5
# The belly reaches the outline: split the body (plus the ink band) between belly and lime by nearest colour.
_lime = nd.binary_opening(fill & ~belly_c & ~crest_c & (g > 170) & (b < 100) & (r < 205), disk(3)) & ~belly
belly = voronoi(nd.binary_dilation(body, disk(int(LINE) + 4)), {'belly': belly, 'lime': _lime})['belly']
belly = components(nd.gaussian_filter(belly.astype(float), 4) > .5)[0]
_body_front = front_shape(body, .40, 170, W_body, BTAU, BNOSE, solid=.35, xmin=int(TAIL_X0))
def body_front(px, py):  # inside the head's side outline the body stays just under the ball, so the ball keeps its round outline
    z_ = _body_front(px, py); zb_ = sphere_z(px, py)
    return np.where(np.isfinite(zb_), np.minimum(z_, .97 * zb_), z_)
# Belly jiggle: a 'belly' bone carries the round front of the body (soft weight, strongest in the belly's centre).
_bys, _bxs = np.nonzero(belly & body); BELLY_C = (_bxs.mean(), _bys.mean()); BELLY_R = (np.ptp(_bxs) * .55, np.ptp(_bys) * .5)
BELLY_W = float(os.environ.get('SISI_BELLY_W', .8))
def body_weights(px, py):
    w = tail_weights(px, py); d_ = np.hypot((px - BELLY_C[0]) / BELLY_R[0], (py - BELLY_C[1]) / BELLY_R[1])
    u_ = np.clip(1 - d_, 0, 1); wb = BELLY_W * u_ * u_ * (3 - 2 * u_); wb = np.minimum(wb, w['body'])
    w['body'] = np.round(w['body'] - wb, 4); w['belly'] = np.round(wb, 4); return w
volume('Body', body, 'Lime green', 'body', .40, 170, area=700, weighted=True, paint=(belly, 'Belly lime'), front=body_front, swing=True, weights=body_weights)
CREST_D = float(os.environ.get('SISI_CREST_D', .30)); CREST_R = float(os.environ.get('SISI_CREST_R', 55))
CREST_A = float(os.environ.get('SISI_CREST_A', 2000)); CREST_S = float(os.environ.get('SISI_CREST_S', 6.0))
# ---------- crest: one separate part on a chain of bones along the back, so it can wobble on its own (baked in the clips).
# Chain points lie on the crest's base (where it meets head and body), from its front end on the head down to the tail top.
from skimage.graph import MCP_Geometric
crest_mask = crest_parts[0]; crest_vol = reach(crest_mask, head | body, 34)
_cy_, _cx_ = np.nonzero(crest_mask); _top_i = np.argmax(np.where(_cy_ < cy, _cx_ - 3 * _cy_, -1e9))  # front-most end over the head
_cost = np.where(crest_vol, 1.0, np.inf); _geo, _ = MCP_Geometric(_cost).find_costs([(_cy_[_top_i], _cx_[_top_i])])
_geo[~np.isfinite(_geo)] = np.nan
CREST_N = int(os.environ.get('SISI_CREST_N', 4)); CREST_FIX = TAIL_TOP - 40  # below this row the crest rides the tail bones only
_base = crest_mask & nd.binary_dilation(head | body, disk(4)) & (gy < CREST_FIX)
_by_, _bx_ = np.nonzero(_base); _bt = _geo[_by_, _bx_]; _ok = np.isfinite(_bt); _by_, _bx_, _bt = _by_[_ok], _bx_[_ok], _bt[_ok]
_tq = np.linspace(_bt.min(), _bt.max(), CREST_N + 1)
CREST_PTS = [(float(_bx_[np.argmin(np.abs(_bt - t_))]), float(_by_[np.argmin(np.abs(_bt - t_))])) for t_ in _tq]
CREST_PARENT = ['head' if py_ < neck - 60 else 'body' for _, py_ in CREST_PTS[:-1]]
_out = nd.distance_transform_edt(~(head | body)); _near_head = nd.distance_transform_edt(~head) < nd.distance_transform_edt(~body)
_, (_iy, _ix) = nd.distance_transform_edt(~np.isfinite(_geo), return_indices=True); _geo_f = _geo[_iy, _ix]
def crest_weights(px, py):
    xi = np.clip(np.round(px).astype(int), 0, sil.shape[1] - 1); yi = np.clip(np.round(py).astype(int), 0, sil.shape[0] - 1)
    s_ = np.clip(np.interp(_geo_f[yi, xi], _tq, np.arange(CREST_N + 1)), 0, CREST_N - 1e-6)
    f_ = np.clip(_out[yi, xi] / 45.0, 0, 1) * np.clip((CREST_FIX - py) / 80.0, 0, 1)  # the base stays glued, the lobes swing
    w = tail_weights(px, py); onhead = _near_head[yi, xi] & (py < neck)
    for k_ in w: w[k_] = w[k_] * (1 - f_) * ~onhead
    w['head'] = (1 - f_) * onhead
    i_ = np.floor(s_).astype(int); fr_ = s_ - i_
    for k in range(CREST_N):  # bone k spans chain points k..k+1; a vertex blends the two bones around its chain position
        w['crest_%d' % (k + 1)] = f_ * np.clip(1 - np.abs(s_ - (k + .5)), 0, 1)
    tot = sum(w['crest_%d' % (k + 1)] for k in range(CREST_N)); scale_ = np.where(tot > 0, f_ / np.maximum(tot, 1e-9), 0)
    for k in range(CREST_N): w['crest_%d' % (k + 1)] = w['crest_%d' % (k + 1)] * scale_
    return {k: np.round(v, 4) for k, v in w.items()}
volume('Crest 1', crest_vol, 'Crest green', 'body', CREST_D, CREST_R, area=CREST_A, weighted=True, step=CREST_S, swing=True, weights=crest_weights)
# The board's back view shows the crest as a chain of round lobes. Each scallop of the crest outline becomes a small ball whose
# side arc is fitted to that scallop, so the side outline stays the board's and every other view sees round lobes.
from scipy.signal import find_peaks
CREST_LOBE_SX = float(os.environ.get('SISI_LOBE_SX', .85))  # lobe thickness / lobe radius
_ob = crest_mask & ~nd.binary_erosion(crest_mask) & (_out > 4)
_oy, _ox = np.nonzero(_ob); _ot = _geo_f[_oy, _ox]; _o = np.argsort(_ot); _oy, _ox, _ot = _oy[_o], _ox[_o], _ot[_o]
_oh = nd.gaussian_filter1d(_out[_oy, _ox].astype(float), 4)
_notch, _ = find_peaks(-_oh, prominence=10, distance=25)
_cuts = np.concatenate([[0], _notch, [len(_oh)]]); LOBES = []
for a_, b_ in zip(_cuts[:-1], _cuts[1:]):
    if b_ - a_ < 20: continue
    xs_, ys_ = _ox[a_:b_], _oy[a_:b_]; top_ = np.argsort(_oh[a_:b_])[-max(int((b_ - a_) * .6), 12):]  # the arc's outer part
    lm_ = CircleModel()
    if not lm_.estimate(np.stack([xs_[top_], ys_[top_]], 1).astype(float)): continue
    lx_, ly_, lr_ = lm_.params
    if not (15 < lr_ < 160) or crest_vol[int(np.clip(ly_, 0, sil.shape[0] - 1)), int(np.clip(lx_, 0, sil.shape[1] - 1))] == 0 and not head[int(np.clip(ly_, 0, sil.shape[0] - 1)), int(np.clip(lx_, 0, sil.shape[1] - 1))] and not body[int(np.clip(ly_, 0, sil.shape[0] - 1)), int(np.clip(lx_, 0, sil.shape[1] - 1))]:
        continue
    LOBES.append((float(lx_), float(ly_), float(lr_)))
for i_, (lx_, ly_, lr_) in enumerate(LOBES):
    v_, f_ = ball(lx_, ly_, lr_, CREST_LOBE_SX, nseg=16, nring=8, swing=True)
    px_ = v_[:, 0] / K + u0; py_ = bottom - v_[:, 2] / K
    parts.append({'name': 'Crest lobe %d' % (i_ + 1), 'material': 'Crest green', 'bone': 'body', 'outline': 'navy', 'verts': v_, 'faces': f_,
                  'weights': crest_weights(px_, py_)})
print('CREST lobes', len(LOBES), [tuple(round(x_) for x_ in l_) for l_ in LOBES])
for side_, key_, rpx in ((-1, 'near_foot', 12), (1, 'far_foot', 16)):
    fm_ = reach(regions[key_], body, rpx); wf_, cf_ = front_rows(F['feet'][side_]); rows_ = np.nonzero(wf_ > 0)[0]
    volume('Webbed foot.%d' % side_, fm_, 'Lime green', 'foot_%d' % side_, .10, 30, y0=float((cf_[rows_].mean() - UC) * K), area=600,
           front=front_shape(fm_, .10, 30, wf_, oval=True))
volume('Tongue', tongue_vol, 'Tongue ink', 'head', 6.5 * K, 6.5, area=40, outline=None, step=3.0)

def surface(px, py, names=('Head', 'Body')):
    """Nearest-to-camera surface depth (negative y) of the named volumes at pixel positions."""
    best = np.full(len(px), np.inf)
    for nm in names:
        interp, y0 = volumes[nm]; z = interp(px, py)
        best = np.where(np.isfinite(z), np.minimum(best, y0 - np.nan_to_num(z, nan=-np.inf)), best)
    return best

def decal(name, mask, material, layer, bone='head', area=50.0, names=('Head', 'Body'), step=2.0):
    poly = contour(mask, step)
    v, t, nb = triangulate(poly, area)
    y = surface(v[:, 0], v[:, 1], names) - .004 * layer
    for side in (-1, 1):
        verts = world(v[:, 0], v[:, 1], y if side < 0 else -y)
        parts.append({'name': '%s.%d' % (name, side), 'material': material, 'bone': bone.replace('%d', str(side)), 'outline': None, 'verts': verts,
                      'faces': t if side < 0 else t[:, ::-1]})

decal('Cheek', cheek, 'Cheek yellow', 1, area=250, step=4.0)
decal('Eye rim', eye_outer, 'Eye edge ink', 1, area=400, step=2.5)
decal('Sleepy lid', lid, 'Lid green', 2, area=200, step=2.5)
decal('Eye white', eye_white, 'Eye cream', 2, bone='eye_open_%d', area=150, step=2.5)
decal('Pupil', pupil, 'Pupil ink', 3, bone='eye_open_%d', area=120)
# Closed eye (sleep and blink): a lid over the whole eye and a soft downward arc, scaled in by the eye_closed bones.
closed_cover = nd.binary_erosion(eye_outer, disk(int(LINE)))
decal('Eye closed cover', closed_cover, 'Lid green', 4, bone='eye_closed_%d', area=300, step=5.0)
_ys, _xs = np.nonzero(closed_cover); ecx, ecy = _xs.mean(), _ys.mean(); ew = (_xs.max() - _xs.min()) / 2
_arc_x = np.linspace(ecx - ew * .78, ecx + ew * .78, 40); _arc_y = ecy + 8 + .22 * ew * np.sqrt(np.clip(1 - ((_arc_x - ecx) / ew) ** 2, 0, 1))
closed_line = np.zeros_like(sil)
for x_, y_ in zip(_arc_x, _arc_y): closed_line |= np.hypot(gx - x_, gy - y_) <= LINE / 2
decal('Eye closed line', closed_line, 'Eye edge ink', 5, bone='eye_closed_%d', area=150, step=3.0)

# Front mouth: the reference's small smile on the snout front, where the tongue leaves the face. It wraps the snout tip,
# so the side view sees it only edge-on beside the tongue root.
f_mouth = (fink | f_tongue) & (_fy >= 612) & (_fy <= 642) & (np.abs(_fx - f_uc) < 75)
F['mouth'] = fwarp(nd.binary_closing(f_mouth, disk(3)))
def snout_x(py, yw):
    """World x of the head's front surface at canvas row py and world depth yw (the farthest-forward point that deep)."""
    Zh = head_depth.Z; out = np.empty(len(py))
    for i, (r_, d_) in enumerate(zip(np.round(py).astype(int), np.abs(yw))):
        row_ = Zh[r_]; idx_ = np.nonzero(row_ >= d_)[0]
        if not len(idx_): out[i] = np.nan; continue
        j_ = idx_.max(); z0_, z1_ = row_[j_], row_[min(j_ + 1, len(row_) - 1)]
        out[i] = (j_ + (z0_ - d_) / max(z0_ - z1_, 1e-9) - u0) * K
    return out
# The side drawing has no mouth line: centre the smile on the tongue root so, seen from the side, it hides in the tongue.
_mr = np.nonzero(F['mouth'].any(1))[0]; MOUTH_SHIFT = int(round(_root_pt[0] - (_mr.min() + _mr.max()) / 2))
mouth_3d = np.roll(F['mouth'], MOUTH_SHIFT, axis=0)
if mouth_3d.sum() > 50:
    mp = contour(mouth_3d, 2.0); mv, mt, _ = triangulate(mp, 25.0)
    my = (mv[:, 0] - UC) * K; mx = snout_x(mv[:, 1], my) + .006; mz = (bottom - mv[:, 1]) * K
    ok_ = np.isfinite(mx)
    if ok_.all():
        parts.append({'name': 'Front mouth', 'material': 'ink navy', 'bone': 'head', 'outline': None, 'verts': np.stack([mx, my, mz], 1), 'faces': mt[:, ::-1]})
    print('FRONT-MOUTH rows', _mr[[0, -1]], 'shifted', MOUTH_SHIFT, 'tongue root row', round(_root_pt[0], 1), 'placed', bool(ok_.all()))

# Arm: the drawn U-shaped ink line on a soft bulge, like Aava's wing.
arm_line = pick(ink, 368, 700, 300)
arm = nd.binary_fill_holes(nd.binary_closing(arm_line, disk(25))) & body
poly = contour(arm, 5.0); v, t, nb, za = inflate(arm, poly, .04, 26, 300)
lift = np.clip((v[:, 1] - v[:, 1].min()) / (v[:, 1].max() - v[:, 1].min()), 0, 1)
base = surface(v[:, 0], v[:, 1], ('Body',)) - (.03 * lift - .035 * (1 - lift))  # hand stands out, shoulder sinks into the body
n = len(v); remap = np.concatenate([np.arange(nb), np.arange(n, n + n - nb)])
yy = np.concatenate([base - za, (base + .02 * (za > 0))[nb:]]); vv = np.vstack([v, v[nb:]]); faces = np.vstack([t, remap[t][:, ::-1]])
for side in (-1, 1):
    parts.append({'name': 'Arm.%d' % side, 'material': 'Lime green', 'bone': 'arm_%d' % side, 'outline': None,
                  'verts': world(vv[:, 0], vv[:, 1], yy * (1 if side < 0 else -1)), 'faces': faces if side < 0 else faces[:, ::-1]})
arm_front = LinearNDInterpolator(v, base - za)
wp = contour(arm_line, 3.0); wv, wt, _ = triangulate(wp, 200.0)
wy = np.fmin(np.nan_to_num(arm_front(wv[:, 0], wv[:, 1]), nan=np.inf), surface(wv[:, 0], wv[:, 1], ('Body',))) - .012
for side in (-1, 1):
    parts.append({'name': 'Arm ink.%d' % side, 'material': 'ink navy', 'bone': 'arm_%d' % side, 'outline': None,
                  'verts': world(wv[:, 0], wv[:, 1], wy if side < 0 else -wy), 'faces': wt if side < 0 else wt[:, ::-1]})

# ---------- joints
P = lambda x, y, d=0.0: world(np.array([float(x)]), np.array([float(y)]), np.array([d]))[0].tolist()
def foot_joints(f):
    ys, xs = np.nonzero(f)
    return {'hip': P(xs.mean(), ys.min() - 40), 'ankle': P(xs.mean(), ys.min() + 8), 'toe': P(xs.max(), ys.mean())}
tail_x = np.linspace(TAIL_X0, TAIL_TIP + 10, 4)
_low = M & (gy > 840)
tail_pts = [P(x, np.nonzero(_low[:, int(x)])[0].mean()) for x in tail_x]
ay, ax = np.nonzero(arm)
eye_c = np.nonzero(eye_outer); eye_x, eye_y = eye_c[1].mean(), eye_c[0].mean()
joints = {
    'neck': P(np.nonzero(M[neck])[0].mean(), neck), 'head_top': P(cx, cy - rad), 'head_center': P(cx, cy), 'head_radius': float(rad * K), 'head_sx': HEAD_SX,
    'crest': {'points': [P(x_, y_) for x_, y_ in CREST_PTS], 'parent': CREST_PARENT},
    'belly': {'center': P(*BELLY_C), 'back': P(BELLY_C[0] - 90, BELLY_C[1])}, 'board_side': BOARD_REG, 'body': P(*[c.mean() for c in np.nonzero(body)[::-1]]),
    'tail': tail_pts,
    'eye': P(eye_x, eye_y), 'eye_depth': float(abs(surface(np.array([eye_x]), np.array([eye_y]))[0]) - .03),
    'arm': {'top': P(ax.mean(), ay.min()), 'bottom': P(ax.mean(), ay.max()), 'y': float(abs(surface(np.array([ax.mean()]), np.array([ay.mean()]), ('Body',))[0]))},
    'legs': {-1: foot_joints(regions['near_foot']), 1: foot_joints(regions['far_foot'])},
}
colour = lambda m: (img[m][:, :3].mean(0) / 255).tolist()
ink_teal = colour(nd.binary_erosion(pick(ink, 705, 200, 1000), disk(2)))
palette = {'Lime green': colour(fill & M & ~crest_c & ~belly_c & ~cheek_c & ~eye_outer), 'Crest green': colour(crest_core),
           'Belly lime': colour(belly & belly_c & body), 'Cheek yellow': colour(cheek & cheek_c), 'Eye edge ink': colour(nd.binary_erosion(ring, disk(2))),
           'Lid green': colour(nd.binary_erosion(lid, disk(4))), 'Eye cream': colour(nd.binary_erosion(eye_white, disk(4))),
           'Pupil ink': colour(nd.binary_erosion(pupil, disk(3))), 'Tongue ink': colour(nd.binary_erosion(tongue, disk(2)) if nd.binary_erosion(tongue, disk(2)).any() else tongue),
           'ink navy': ink_teal, 'ink rust': ink_teal}
camera = {'width_px': img.shape[1], 'height_px': img.shape[0], 'K': K, 'u0': float(u0), 'bottom': int(bottom), 'line_px': LINE, 'line_world': LINE * K}
dump(OUT / 'profile-parts.json', {'source': str(SRC.relative_to(ROOT)), 'crop': [CROP[1].start, CROP[0].start, CROP[1].stop, CROP[0].stop], 'scale': 1,
                                  'camera': camera, 'front_camera': {'uc': UC, 'source': str(FSRC.relative_to(ROOT)), 'scale': FS}, 'palette': palette, 'joints': joints, 'parts': parts})
np.savez_compressed(OUT / 'front-target.npz', silhouette=F['silhouette'], eye=F['eye'], eye_white=F['eye_white'], pupil=F['pupil'], lid=F['lid'],
                    tongue=F['tongue'], cheek=F['cheek'], mouth=F['mouth'])
# Quick front check without Blender: where the side-projected eyes land in the front view.
def front_of(mask, names=('Head', 'Body')):
    ys_, xs_ = np.nonzero(mask); y_ = surface(xs_.astype(float), ys_.astype(float), names); ok_ = np.isfinite(y_)
    out_ = np.zeros_like(sil); out_[ys_[ok_], np.clip(np.round(UC + y_[ok_] / K).astype(int), 0, sil.shape[1] - 1)] = True
    out_ |= out_[:, ::-1]
    return nd.binary_closing(out_, disk(2))
_pe = front_of(eye_outer); _iou = lambda a_, b_: (a_ & b_).sum() / max((a_ | b_).sum(), 1)
_fy, _fx = np.nonzero(F['eye'] & (gx < UC)); _py, _px = np.nonzero(_pe & (gx < UC))
def _bb(m_):
    ys_, xs_ = np.nonzero(m_ & (gx < UC)); return (xs_.min(), xs_.max(), ys_.min(), ys_.max()) if len(xs_) else None
print('FRONT-BOX eye', _bb(F['eye']), _bb(_pe), 'cheek', _bb(F['cheek']), _bb(front_of(cheek)), 'side cheek', _bb(cheek | (gx >= UC) & cheek), 'side eye', (lambda m_: (np.nonzero(m_)[1].min(), np.nonzero(m_)[1].max()))(eye_outer))
print('FRONT-ESTIMATE belly IoU %.3f arm-ink visible %d px' % (_iou(front_of(belly, ('Body',)), F['belly']), (front_of(arm_line, ('Body',)) & (gx < UC)).sum()))
print('FRONT-ESTIMATE eye IoU %.3f  eye centre front (%.0f,%.0f) vs 3D (%.0f,%.0f)  cheek IoU %.3f' % (_iou(_pe, F['eye']), _fx.mean(), _fy.mean(), _px.mean(), _py.mean(), _iou(front_of(cheek), F['cheek'])))
np.savez_compressed(OUT / 'profile-target.npz', silhouette=sil, eye=eye_outer, eye_white=eye_white, pupil=pupil, lid=lid, tongue=tongue, cheek=cheek)
print('parts', len(parts), 'K', K, 'line world', LINE * K, 'head circle', [round(p, 1) for p in em.params], 'eye depth', joints['eye_depth'])
if os.environ.get('SISI_DEBUG'):
    for k_ in (-1, 1):
        wf_, cf_ = front_rows(F['feet'][k_]); r_ = np.nonzero(wf_)[0]; print('DEBUG foot', k_, 'rows', r_.min(), r_.max(), 'max half-width', wf_.max(), 'centre', cf_[r_].mean() - UC)
    r_ = np.nonzero(W_body)[0]; print('DEBUG body rows', r_.min(), r_.max(), 'max W', W_body.max(), 'side body rows', np.nonzero(body.any(1))[0][[0, -1]], 'FS', FS)
