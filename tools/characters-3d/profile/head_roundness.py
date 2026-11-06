"""Head roundness KPI: is the head a ball in every view once the crest is left out?

Run: Blender --factory-startup --background art/characters-3d/<id>/<id>.blend --python tools/characters-3d/profile/head_roundness.py -- <id>
Renders the rest pose from eight directions around the vertical axis (orthographic, centred on the head ball from
profile-parts.json joints head_center/head_radius), with only the outlined volumes visible except the appendages named in joints.roundness_skip (default: the crest). In each view the
outer outline is measured along rays from the head centre over the upper 210 degrees (the bottom 150 degrees, where the head sits
on the neck and the back continues under the crest, is left out). Deviation = outline radius / ball radius - 1. Pass: every view within +-3 % and rms within 1.5 %.
Writes head-roundness.json and head-roundness.png (silhouettes with the ideal circle in red, deviations over 3 % in blue).
"""
import bpy, json, math, sys
import numpy as np
from mathutils import Vector
from pathlib import Path

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
CID = args[0]
ROOT = Path(__file__).resolve().parents[3]; OUT = ROOT / 'art/characters-3d' / CID
DEST = Path(args[args.index('--out') + 1]) if '--out' in args else OUT  # where the report goes (e.g. to measure an older .blend)
J = json.loads((OUT / 'profile-parts.json').read_text())['joints']
C = Vector(J['head_center']); R = float(J['head_radius'])
SKIP = tuple(J.get('roundness_skip', ['Crest']))  # appendages left out of the measurement (Sisi's crest, Aava's bill)
TOL_MAX, TOL_RMS, RES, SPAN, SECTOR = .03, .015, 400, 4.0 * R, 105

scene = bpy.context.scene
for o in scene.objects:
    if o.type == 'ARMATURE' and o.animation_data:
        for t in o.animation_data.nla_tracks: t.mute = True
        o.animation_data.action = None
        for p in o.pose.bones:
            p.location = (0, 0, 0); p.rotation_euler = (0, 0, 0); p.scale = (.001,) * 3 if p.name.startswith('eye_closed_') else (1, 1, 1)
    if o.type == 'MESH':
        keep = ('outline' in o.keys()) and not o.name.startswith(SKIP) and not o.name.startswith('PREVIEW')
        o.hide_render = not keep
    elif o.type in ('LIGHT',): o.hide_render = True
bpy.context.view_layer.update()
scene.render.engine = 'BLENDER_WORKBENCH'; scene.display.shading.light = 'FLAT'; scene.display.shading.color_type = 'SINGLE'
scene.display.shading.single_color = (1, 1, 1); scene.display.render_aa = 'OFF'; scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'; scene.render.image_settings.color_mode = 'RGBA'; scene.view_settings.view_transform = 'Standard'
scene.render.resolution_x = scene.render.resolution_y = RES; scene.render.resolution_percentage = 100
cam_data = bpy.data.cameras.new('KPI camera'); cam_data.type = 'ORTHO'; cam_data.ortho_scale = SPAN
cam = bpy.data.objects.new('KPI camera', cam_data); scene.collection.objects.link(cam); scene.camera = cam
tmp = Path(bpy.app.tempdir) / 'head_roundness.png'

report, tiles = {'character': CID, 'radius_m': R, 'sector_deg_from_top': SECTOR, 'tolerance': {'max_abs': TOL_MAX, 'rms': TOL_RMS}, 'views': {}}, []
for a in range(0, 360, 45):
    t = math.radians(a)  # 0 = looking at the face (from +X), 90 = from the character's left side (+Y)... same turn as the board
    d = Vector((math.cos(t), math.sin(t), 0)); cam.location = C + d * 10
    cam.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
    scene.render.filepath = str(tmp); bpy.ops.render.render(write_still=True)
    img = bpy.data.images.load(str(tmp), check_existing=False); px = np.array(img.pixels[:]).reshape(RES, RES, 4)[::-1]; bpy.data.images.remove(img)
    mask = px[..., 3] > .5
    c0 = (RES - 1) / 2; scale = RES / SPAN  # pixels per metre; the head centre is the image centre
    ys, xs = np.nonzero(mask); dx, dy = xs - c0, c0 - ys
    ang = np.degrees(np.arctan2(dx, dy)); rr = np.hypot(dx, dy) / scale / R  # angle from straight up, radius in ball radii
    dev = []
    for b in range(-SECTOR, SECTOR + 1, 2):
        sel = np.abs(((ang - b + 180) % 360) - 180) < 1.0
        sel &= rr < 1.6  # the outline of the head region only (the body below is outside the measured sector anyway)
        dev.append(float(rr[sel].max() - 1) if sel.any() else -1.0)
    dev = np.array(dev)
    v = {'max_abs': float(np.abs(dev).max()), 'rms': float(np.sqrt((dev ** 2).mean())), 'most_inward': float(dev.min()), 'most_outward': float(dev.max()),
         'worst_angle_from_top_deg': int(np.arange(-SECTOR, SECTOR + 1, 2)[np.argmax(np.abs(dev))])}
    v['pass'] = v['max_abs'] <= TOL_MAX and v['rms'] <= TOL_RMS; report['views'][str(a)] = v
    tile = np.zeros((RES, RES, 3)); tile[mask] = (.82, .9, .7)
    yy, xx = np.mgrid[0:RES, 0:RES]; rpx = np.hypot(xx - c0, yy - c0) / scale / R
    tile[np.abs(rpx - 1) < .006] = (1, 0, 0)
    ang_px = np.degrees(np.arctan2(xx - c0, c0 - yy)); tile[(np.abs(np.abs(ang_px) - SECTOR) < .5) & (rpx < 1.5)] = (1, .6, 0)
    for b, dv in zip(np.arange(-SECTOR, SECTOR + 1, 2), dev):
        if abs(dv) > TOL_MAX:
            bb = math.radians(b); r_ = (1 + dv) * R * scale
            x_, y_ = int(round(c0 + r_ * math.sin(bb))), int(round(c0 - r_ * math.cos(bb)))
            tile[max(y_ - 3, 0):y_ + 4, max(x_ - 3, 0):x_ + 4] = (0, 0, 1)
    tiles.append(tile[RES // 8:RES * 7 // 8])
report['pass'] = all(v['pass'] for v in report['views'].values())
report['worst_max_abs'] = max(v['max_abs'] for v in report['views'].values()); report['worst_rms'] = max(v['rms'] for v in report['views'].values())
(DEST / 'head-roundness.json').write_text(json.dumps(report, indent=2) + '\n')
sheet = np.concatenate(tiles, 1); h, w = sheet.shape[:2]
out = bpy.data.images.new('head-roundness', w, h); out.pixels = np.concatenate([sheet[::-1], np.ones((h, w, 1))], 2).ravel().tolist()
out.filepath_raw = str(DEST / 'head-roundness.png'); out.file_format = 'PNG'; out.save()
print('HEAD_ROUNDNESS', json.dumps({'pass': report['pass'], 'worst_max_abs': round(report['worst_max_abs'], 4), 'worst_rms': round(report['worst_rms'], 4),
                                    'views': {k: round(v['max_abs'], 4) for k, v in report['views'].items()}}))
