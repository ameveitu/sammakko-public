"""Shared helpers for profile-matched character sculpting (runs in a normal Python with numpy/scipy/scikit-image/triangle)."""
import json, numpy as np
from PIL import Image
from scipy import ndimage as nd
from skimage import measure
import triangle as tr

def load(path, scale):
    im = Image.open(path).convert('RGBA')
    im = im.resize((im.width * scale, im.height * scale), Image.BICUBIC) if scale != 1 else im
    return np.array(im).astype(float)

def disk(r):
    y, x = np.mgrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r

def components(mask, minimum=0):
    lab, n = nd.label(mask)
    out = []
    for i in range(1, n + 1):
        m = lab == i
        if m.sum() >= minimum:
            out.append(m)
    return sorted(out, key=lambda m: -m.sum())

def pick(mask, x, y, minimum=20):
    """The connected component of mask that contains (or is nearest to) pixel x,y."""
    best, dist = None, 1e9
    for m in components(mask, minimum):
        if m[y, x]:
            return m
        ys, xs = np.nonzero(m)
        d = np.min((xs - x) ** 2 + (ys - y) ** 2)
        if d < dist:
            best, dist = m, d
    return best

def voronoi(region, seeds):
    """Assign every pixel of region to the nearest labelled seed mask. seeds: dict name->mask."""
    label = np.zeros(region.shape, int)
    names = list(seeds)
    for i, n in enumerate(names):
        label[seeds[n] & region] = i + 1
    _, (iy, ix) = nd.distance_transform_edt(label == 0, return_indices=True)
    full = label[iy, ix]
    return {n: region & (full == i + 1) for i, n in enumerate(names)}

def contour(mask, step=3.0):
    """Largest outer contour of a mask as a counter-clockwise polygon in pixel (x, y), resampled every `step` px."""
    padded = np.pad(nd.gaussian_filter(mask.astype(float), .8), 2)
    cs = measure.find_contours(padded, .5)
    c = max(cs, key=len)[:, ::-1] - 2  # (x, y)
    if np.allclose(c[0], c[-1]):
        c = c[:-1]
    seg = np.linalg.norm(np.diff(np.vstack([c, c[:1]]), axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(seg)])
    total = s[-1]; n = max(12, int(total / step))
    t = np.linspace(0, total, n, endpoint=False)
    closed = np.vstack([c, c[:1]])
    pts = np.stack([np.interp(t, s, closed[:, 0]), np.interp(t, s, closed[:, 1])], 1)
    area = 0.5 * np.sum(pts[:, 0] * np.roll(pts[:, 1], -1) - np.roll(pts[:, 0], -1) * pts[:, 1])
    return pts if area > 0 else pts[::-1]

def triangulate(poly, max_area, extra=()):
    """Constrained triangulation of a CCW polygon; `extra` polylines inside it become mesh edges (e.g. a colour boundary)."""
    n = len(poly)
    verts = [poly]; seg = [np.stack([np.arange(n), (np.arange(n) + 1) % n], 1)]; k = n
    for line in extra:
        m = len(line)
        if m < 2: continue
        verts.append(line); seg.append(np.stack([np.arange(k, k + m - 1), np.arange(k + 1, k + m)], 1)); k += m
    t = tr.triangulate({'vertices': np.vstack(verts), 'segments': np.vstack(seg)}, 'pq20a%fY' % max_area)
    return t['vertices'], t['triangles'], n

def inflate(mask, poly, half_depth, round_px, max_area=60.0, smooth=12, extra=()):
    """Pillow-inflate a 2D region: boundary at depth 0, round profile of radius `round_px` px, capped at half_depth (world)."""
    verts, tris, nb = triangulate(poly, max_area, extra)
    dt = nd.distance_transform_edt(np.pad(mask, 1))[1:-1, 1:-1]
    xs = np.clip(verts[:, 0], 0, mask.shape[1] - 1); ys = np.clip(verts[:, 1], 0, mask.shape[0] - 1)
    d = nd.map_coordinates(dt, [ys, xs], order=1)
    d[:nb] = 0
    t = np.clip(d / round_px, 0, 1)
    z = np.sqrt(1 - (1 - t) ** 2)
    # Laplacian smoothing of the height field over interior vertices removes medial-axis ridges.
    nbrs = [set() for _ in verts]
    for a, b, c in tris:
        nbrs[a] |= {b, c}; nbrs[b] |= {a, c}; nbrs[c] |= {a, b}
    nbrs = [np.array(sorted(s)) for s in nbrs]
    for _ in range(smooth):
        z2 = z.copy()
        for i in range(nb, len(verts)):
            z2[i] = .5 * z[i] + .5 * z[nbrs[i]].mean()
        z = z2
    return verts, tris, nb, z * half_depth

def dump(path, data):
    def conv(o):
        if isinstance(o, np.ndarray): return o.tolist()
        if isinstance(o, (np.floating,)): return float(o)
        if isinstance(o, (np.integer,)): return int(o)
        raise TypeError(type(o))
    with open(path, 'w') as f: json.dump(data, f, default=conv)
