"""Measure a profile-matched build against its 2D drawing.

Usage: python compare.py <id> [profile|front]   (reads art/characters-3d/<id>/<view>-target.npz, <view>-match.png, <view>-id.png)
Prints IoU of the whole silhouette and of each face feature, and writes profile-overlay.png:
grey = both, red = only in the drawing, blue = only in the 3D render; feature outlines drawn on top.
"""
import sys, json, numpy as np
from pathlib import Path
from PIL import Image
from scipy import ndimage as nd
ROOT = Path(__file__).resolve().parents[3]
cid = sys.argv[1]; OUT = ROOT / 'art/characters-3d' / cid
VIEW = sys.argv[2] if len(sys.argv) > 2 else 'profile'  # 'profile' or 'front'
target = dict(np.load(OUT / (VIEW + '-target.npz')))
render = np.array(Image.open(OUT / (VIEW + '-match.png')).convert('RGBA')).astype(float)
ids = np.array(Image.open(OUT / (VIEW + '-id.png')).convert('RGB')).astype(float)
srgb = lambda c: [255 * (x * 12.92 if x <= .0031308 else 1.055 * x ** (1 / 2.4) - .055) for x in c]
ID = {'eye_rim': (0, 0, 1), 'eye_white': (0, 1, 1), 'pupil': (1, 0, 1), 'bill_upper': (1, .5, 0), 'bill_lower': (1, 0, 0), 'tongue': (0, 1, 0), 'lid': (.5, .5, 1), 'cheek': (1, 1, 0), 'mouth': (.3, 0, .6), 'base_ink': (.6, .3, 0)}
palette = {k: np.array(srgb(v)) for k, v in ID.items()}
alpha = np.array(Image.open(OUT / (VIEW + '-id.png')).convert('RGBA'))[..., 3] > 128
dist = {k: np.linalg.norm(ids - c, axis=2) for k, c in palette.items()}
got = {k: (d < 40) & alpha for k, d in dist.items()}
sil3 = render[..., 3] > 127.5
# The mouth stroke paints over the meeting edge of the lips; give its pixels to the nearer lip so lip areas stay comparable.
if got['mouth'].any() and got['bill_upper'].any() and got['bill_lower'].any():
    du = nd.distance_transform_edt(~got['bill_upper']); dl = nd.distance_transform_edt(~got['bill_lower'])
    got['bill_upper'] = got['bill_upper'] | (got['mouth'] & (du <= dl)); got['bill_lower'] = got['bill_lower'] | (got['mouth'] & (dl < du))
# Ink drawn over a part boundary (the bill-base line) is shared like the drawing's ink: each pixel goes to the nearest neighbouring fill.
if got['base_ink'].any():
    other = alpha & ~got['base_ink'] & ~got['bill_upper'] & ~got['bill_lower']
    d = [nd.distance_transform_edt(~m) for m in (got['bill_upper'], got['bill_lower'], other)]
    near = np.argmin(np.stack(d), 0)
    got['bill_upper'] |= got['base_ink'] & (near == 0); got['bill_lower'] |= got['base_ink'] & (near == 1)
def iou(a, b):
    u = (a | b).sum(); return float((a & b).sum() / u) if u else 1.0
report = {'silhouette': iou(target['silhouette'], sil3)}
feats = {'eye': ('eye', ['eye_rim', 'eye_white', 'pupil', 'lid']), 'eye_white': ('eye_white', ['eye_white']), 'pupil': ('pupil', ['pupil']),
         'bill_upper': ('bill_upper', ['bill_upper']), 'bill_lower': ('bill_lower', ['bill_lower']), 'tongue': ('tongue', ['tongue']),
         'lid': ('lid', ['lid']), 'mouth': ('mouth', ['mouth']), 'cheek': ('cheek', ['cheek'])}
for name, (tkey, keys) in feats.items():
    if tkey in target:
        mine = np.zeros_like(sil3)
        for k in keys: mine |= got[k]
        report[name] = iou(target[tkey], mine)
        ty, tx = np.nonzero(target[tkey]); my, mx = np.nonzero(mine)
        if len(mx): report[name + '_centre_px'] = round(float(np.hypot(tx.mean() - mx.mean(), ty.mean() - my.mean())), 2)
print(json.dumps({k: round(v, 4) for k, v in report.items()}))
t = target['silhouette']; img = np.full(t.shape + (3,), 255, np.uint8)
img[t & sil3] = (200, 200, 200); img[t & ~sil3] = (230, 30, 30); img[~t & sil3] = (30, 80, 230)
for name, (tkey, keys) in feats.items():
    if tkey in target:
        edge = target[tkey] & ~nd.binary_erosion(target[tkey]); img[edge] = (0, 150, 0)
        mine = np.zeros_like(sil3)
        for k in keys: mine |= got[k]
        e2 = mine & ~nd.binary_erosion(mine); img[e2] = (160, 0, 160)
Image.fromarray(img).save(OUT / (VIEW + '-overlay.png'))
(OUT / (VIEW + '-metrics.json')).write_text(json.dumps({k: round(v, 4) for k, v in report.items()}, indent=1) + '\n')
