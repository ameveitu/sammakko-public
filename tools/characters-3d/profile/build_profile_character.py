"""Build a profile-matched character from art/characters-3d/<id>/profile-parts.json.

Run: Blender --factory-startup --background --python tools/characters-3d/profile/build_profile_character.py -- <id> [--fast]
Writes <id>.blend, <id>.glb, profile-match.png (toon + outline), profile-id.png (flat part colours) and preview views.
The profile-match camera is the exact orthographic inverse of the 2D pixel mapping used by the parts script.
"""
import bpy, bmesh, json, math, os, sys
from mathutils import Vector, Quaternion
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import toon_preview

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
CID = args[0]; FAST = '--fast' in args
ROOT = HERE.parents[2]; OUT = ROOT / 'art/characters-3d' / CID
data = json.loads((OUT / 'profile-parts.json').read_text())
cam_info = data['camera']; K = cam_info['K']

bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
for block in list(bpy.data.materials): bpy.data.materials.remove(block)
for block in list(bpy.data.meshes): bpy.data.meshes.remove(block)

def linear(c):
    return tuple(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c)

materials = {}
def material(name):
    if name not in materials:
        rgb = linear(data['palette'][name]); m = bpy.data.materials.new(name); m.diffuse_color = (*rgb, 1); m.use_nodes = True
        p = m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value = (*rgb, 1); p.inputs['Roughness'].default_value = .92
        materials[name] = m
    return materials[name]

def smooth_outline_normals(mesh, width):
    """Area-weighted normals blurred over about one outline width, stored as the mesh's custom normals.
    The inverted-hull outline (game shader and preview) pushes along these, so tight notches in the side
    contour (mouth, chin, toes) no longer fold the hull through the surface."""
    import numpy as np
    n = len(mesh.vertices); co = np.empty(n * 3); mesh.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    if hasattr(mesh, 'calc_loop_triangles'): mesh.calc_loop_triangles()
    tri = np.empty(len(mesh.loop_triangles) * 3, int); mesh.loop_triangles.foreach_get('vertices', tri); tri = tri.reshape(-1, 3)
    a, b, c = co[tri[:, 0]], co[tri[:, 1]], co[tri[:, 2]]; fn = np.cross(b - a, c - a) * .5; fc = (a + b + c) / 3
    out = np.zeros_like(co); s2 = 2 * width * width
    for i in range(0, n, 256):
        d2 = ((co[i:i + 256, None, :] - fc[None]) ** 2).sum(2)
        out[i:i + 256] = np.exp(-d2 / s2) @ fn
    out /= np.linalg.norm(out, axis=1, keepdims=True) + 1e-12
    mesh.normals_split_custom_set_from_vertices([tuple(v) for v in out])
    attr = mesh.attributes.new('outline_normal', 'FLOAT_VECTOR', 'POINT'); attr.data.foreach_set('vector', out.ravel())

parts, weights = [], {}
for spec in data['parts']:
    mesh = bpy.data.meshes.new(spec['name'] + ' mesh'); mesh.from_pydata([tuple(v) for v in spec['verts']], [], [tuple(f) for f in spec['faces']]); mesh.update()
    bm = bmesh.new(); bm.from_mesh(mesh)
    if not spec.get('weights'): bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)  # weighted parts keep their vertex order
    if spec.get('outline'):
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)  # closed volumes: outward normals so the outline sits outside
    else:
        for f in bm.faces:  # painted decals face away from the mid-plane, toward their own side's viewer (front decals face +x)
            if (f.normal.x < 0) if spec['name'].startswith('Front ') else (f.normal.y * f.calc_center_median().y < 0): f.normal_flip()
    bm.to_mesh(mesh); bm.free()
    ob = bpy.data.objects.new(spec['name'], mesh); bpy.context.collection.objects.link(ob)
    for mname in spec.get('materials', [spec['material']]): mesh.materials.append(material(mname))
    if spec.get('face_material') is not None:  # painted regions inside one volume (vertex order is kept for these parts)
        for f, mi in zip(mesh.polygons, spec['face_material']): f.material_index = mi
    for f in mesh.polygons: f.use_smooth = True
    if spec.get('outline'):
        ob['outline'] = spec['outline']; smooth_outline_normals(mesh, cam_info['line_world'])
    parts.append((ob, spec['bone'])); weights[ob.name] = spec.get('weights')

# ---------- rig
J = data['joints']
arm_data = bpy.data.armatures.new(CID.capitalize() + ' skeleton'); arm = bpy.data.objects.new(CID.capitalize() + ' rig', arm_data)
bpy.context.collection.objects.link(arm); bpy.context.view_layer.objects.active = arm; arm.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
def bone(name, head, tail, parent=None):
    b = arm_data.edit_bones.new(name); b.head = head; b.tail = tail
    if parent: b.parent = arm_data.edit_bones[parent]
V = lambda p, dy=0.0: Vector((p[0], p[1] + dy, p[2]))
bone('root', (0, 0, 0), (0, 0, .2))
if CID == 'aava':
    body = V(J['body']); neck = V(J['neck']); top = V(J['head_top']); wing = V(J['wing'])
    bone('body', (body.x, 0, body.z - .25), (body.x, 0, body.z + .2), 'root')
    bone('head', neck, top, 'body')
    for s in (-1, 1):
        bone('wing_%d' % s, (wing.x + .05, s * .25, wing.z + .08), (wing.x - .12, s * .3, wing.z + .02), 'body')
        leg = J['legs'][str(s)]; y0 = .12 * s
        bone('leg_%d' % s, V(leg['hip'], y0) + Vector((0, 0, .06)), V(leg['ankle'], y0), 'root')
        bone('foot_%d' % s, V(leg['ankle'], y0), V(leg['toe'], y0), 'leg_%d' % s)
elif CID == 'sisi':
    body = V(J['body']); neck = V(J['neck']); top = V(J['head_top'])
    bone('body', (body.x, 0, .2), (body.x, 0, neck.z), 'root')
    bone('head', neck, top, 'body')
    t = [V(p) for p in J['tail']]
    bone('tail1', t[0], t[1], 'root'); bone('tail2', t[1], t[2], 'tail1'); bone('tail3', t[2], t[3], 'tail2')
    eye = V(J['eye'])
    for s in (-1, 1):
        e = Vector((eye.x, s * J['eye_depth'], eye.z))
        bone('eye_open_%d' % s, e, e + Vector((0, s * .08, 0)), 'head'); bone('eye_closed_%d' % s, e, e + Vector((0, s * .08, 0)), 'head')
        bone('lid_%d' % s, e + Vector((0, 0, .05)), e + Vector((0, s * .08, .05)), 'eye_open_%d' % s)
        a = J['arm']; bone('arm_%d' % s, V(a['top'], s * a['y']), V(a['bottom'], s * a['y']), 'body')
        leg = J['legs'][str(s)]
        bone('leg_%d' % s, V(leg['hip']), V(leg['ankle']), 'root'); bone('foot_%d' % s, V(leg['ankle']), V(leg['toe']), 'leg_%d' % s)
    if 'crest' in J:  # the crest's own chain along its base (secondary motion), and the belly's soft bone
        cp = [V(p_) for p_ in J['crest']['points']]
        for k in range(len(cp) - 1): bone('crest_%d' % (k + 1), cp[k], cp[k + 1], J['crest']['parent'][k])
        bone('belly', V(J['belly']['back']), V(J['belly']['center']), 'body')
bpy.ops.object.mode_set(mode='OBJECT'); arm.select_set(False)
for ob, bname in parts:
    if weights.get(ob.name):  # per-vertex weights from the parts script (body blending into the tail bones)
        for gname, ws in weights[ob.name].items():
            g = ob.vertex_groups.new(name=gname)
            for i, w in enumerate(ws):
                if w > 1e-4: g.add([i], float(w), 'REPLACE')
    elif bname == 'tail':
        xs = [J['tail'][i][0] for i in range(4)]
        groups = [ob.vertex_groups.new(name='tail%d' % i) for i in (1, 2, 3)]
        for v in ob.data.vertices:
            t = (xs[0] - v.co.x) / (xs[0] - xs[3]) * 2; t = max(0, min(2, t)); j = min(1, int(t)); f = t - j
            groups[j].add([v.index], 1 - f, 'REPLACE'); groups[j + 1].add([v.index], f, 'REPLACE')
    else:
        g = ob.vertex_groups.new(name=bname); g.add(list(range(len(ob.data.vertices))), 1, 'REPLACE')
    mod = ob.modifiers.new('Armature', 'ARMATURE'); mod.object = arm; ob.parent = arm

# ---------- actions (same clip names and bone contract as the earlier candidates)
bpy.context.preferences.edit.keyframe_new_interpolation_type = 'LINEAR'
arm.animation_data_create()
def reset_pose():
    for p in arm.pose.bones:
        p.rotation_mode = 'XYZ'; p.location = (0, 0, 0); p.rotation_euler = (0, 0, 0)
        p.scale = (.001, .001, .001) if p.name.startswith('eye_closed_') else (1, 1, 1)
def action(name, keys):
    arm.animation_data.action = None; reset_pose()
    for frame, changes in keys:
        for bname, field, value in changes:
            p = arm.pose.bones[bname]
            if field == 'world_location':
                p.location = p.bone.matrix_local.to_3x3().inverted() @ Vector(value); field = 'location'
            elif field == 'world_rotation':
                axis, angle = value; q = Quaternion(Vector(axis), angle); rest = p.bone.matrix_local.to_quaternion()
                p.rotation_euler = (rest.inverted() @ q @ rest).to_euler(); field = 'rotation_euler'
            else:
                setattr(p, field, value)
            p.keyframe_insert(data_path=field, frame=frame, group=bname)
    act = arm.animation_data.action; act.name = name
    track = arm.animation_data.nla_tracks.new(); track.name = name; track.strips.new(name, int(act.frame_range[0]), act)
    arm.animation_data.action = None
zero = (0, 0, 0); pitch = (0, 1, 0); yaw = (0, 0, 1)
# The drawing sets the far foot a little higher than the near one. The rest pose keeps that (it is the profile match);
# while walking each leg drops by its own sole height so every planted foot stands on the ground.
ground = {}
for spec in data['parts']:
    b_ = spec['bone']
    if b_.startswith(('leg_', 'foot_')):
        s_ = int(b_.split('_')[1]); ground[s_] = min(ground.get(s_, 1e9), min(v[2] for v in spec['verts']))
def stride(frame, offset, reach, lift):
    # The foot rests (stationary) for 12 frames, swings forward, rests, swings back: two swings per 48-frame cycle.
    # The second leg runs 12 frames behind, so its swings fall in the first leg's rests and one foot is always planted.
    phase = (frame - 1 + offset) % 48
    if phase <= 12: return -reach, 0
    if phase <= 24: t = (phase - 12) / 12; return -reach + 2 * reach * t, lift * math.sin(math.pi * t)
    if phase <= 36: return reach, 0
    t = (phase - 36) / 12; return reach - 2 * reach * t, lift * math.sin(math.pi * t)
if CID == 'aava':
    action('idle', [(1, [('head', 'world_rotation', (pitch, 0))]), (25, [('head', 'world_rotation', (pitch, .035))]), (49, [('head', 'world_rotation', (pitch, 0))])])
    action('gentle-nod', [(1, [('head', 'world_rotation', (pitch, 0))]), (13, [('head', 'world_rotation', (pitch, .16))]), (25, [('head', 'world_rotation', (pitch, 0))])])
    action('point', [(1, [('wing_-1', 'world_location', zero)]), (13, [('wing_-1', 'world_location', (.55, -.06, .12))]), (30, [('wing_-1', 'world_location', (.55, -.06, .12))]), (43, [('wing_-1', 'world_location', zero)])])
    action('walk', [(f, [('leg_%d' % s, 'world_location', (stride(f, o, .07, .12)[0], 0, stride(f, o, .07, .12)[1] - ground.get(s, 0))) for s, o in [(-1, 0), (1, 12)]]) for f in [1, 7, 13, 19, 25, 31, 37, 43, 49]])
elif CID == 'sisi':
    def blink(amount):
        closed = max(0, min(1, -amount / .10)); opened = max(.001, 1 - closed); shut = max(.001, closed)
        return [(f'eye_{kind}_{s}', 'scale', (v, v, v)) for s in (-1, 1) for kind, v in [('open', opened), ('closed', shut)]]
    # Secondary motion, baked: the crest lobes and the belly follow the body through damped springs (a cascade down the crest,
    # so a sway runs along the back as a wave). The driver loops, so after a few loops the response loops seamlessly too.
    def follow(driver, period_frames, damping=.22, loops=6):
        k = (math.tau / period_frames) ** 2; c = 2 * damping * math.sqrt(k); x, v, out = driver[0], 0.0, []
        for loop in range(loops):
            for d in driver:
                v += k * (d - x) - c * v; x += v
                if loop == loops - 1: out.append(x)
        return out
    crest_bones = sorted([b.name for b in arm_data.bones if b.name.startswith('crest_')], key=lambda n: int(n.split('_')[1]))
    crest_axis = {b: tuple((arm_data.bones[b].tail_local - arm_data.bones[b].head_local).normalized()) for b in crest_bones}
    CREST_GAIN = float(os.environ.get('SISI_CREST_GAIN', 2.2)); BELLY_GAIN = float(os.environ.get('SISI_BELLY_GAIN', 1.6))
    def secondary(roll, bob, frames, crest_period=14, belly_period=18):
        """roll (rad, about +X) and bob (m, +Z) of the body per frame over one loop -> keyframe changes per frame."""
        out = {f: [] for f in frames}; drv = roll
        for b in crest_bones:  # each lobe follows the one before it: lag grows toward the tail
            fol = follow(drv, crest_period)
            for f in frames: out[f].append((b, 'world_rotation', (crest_axis[b], CREST_GAIN * (fol[(f - 1) % len(roll)] - roll[(f - 1) % len(roll)]))))
            drv = fol
        bz = follow(bob, belly_period, .18); by = follow(roll, belly_period, .18)
        for f in frames:
            i = (f - 1) % len(roll)
            out[f].append(('belly', 'world_location', (0, -BELLY_GAIN * .35 * (by[i] - roll[i]), BELLY_GAIN * (bz[i] - bob[i]))))
        return out
    has_jiggle = bool(crest_bones) and 'belly' in arm_data.bones
    idle_roll = [.012 * math.sin(i * math.tau / 48) for i in range(48)]; idle_bob = [.004 * math.sin(i * math.tau / 24) for i in range(48)]
    idle = [(1, [('head', 'world_rotation', (pitch, 0)), *blink(0)]), (25, [('head', 'world_rotation', (pitch, .025)), *blink(0)]), (32, blink(-.10)), (40, blink(0)), (49, [('head', 'world_rotation', (pitch, 0)), *blink(0)])]
    if has_jiggle:
        sec = secondary(idle_roll, idle_bob, range(1, 50, 2))
        idle += [(f, [('body', 'world_rotation', ((1, 0, 0), idle_roll[(f - 1) % 48])), *sec[f]]) for f in range(1, 50, 2)]
    action('idle', idle)
    # Waddle: the body rolls toward the planted foot once per stride cycle and bobs twice; the head lags a little behind.
    WADDLE = float(os.environ.get('SISI_WADDLE', .05)); BOB = float(os.environ.get('SISI_BOB', .012))
    walk_roll = [WADDLE * math.sin(i * math.tau / 48) for i in range(48)]; walk_bob = [BOB * .5 * (1 - math.cos(i * math.tau / 24)) for i in range(48)]
    walk = []
    for f in [1, 7, 13, 19, 25, 31, 37, 43, 49]:
        ch = blink(0) if f in (1, 49) else []
        for s, o in [(-1, 0), (1, 12)]:
            x, z = stride(f, o, .04, .055); ch.append(('leg_%d' % s, 'world_location', (x, 0, z - ground.get(s, 0))))
        ch += [('tail1', 'world_rotation', (yaw, .025 * math.sin((f - 1) * math.tau / 48))), ('tail2', 'world_rotation', (yaw, .035 * math.sin((f - 5) * math.tau / 48))), ('tail3', 'world_rotation', (yaw, .04 * math.sin((f - 9) * math.tau / 48)))]
        walk.append((f, ch))
    if has_jiggle:
        sec = secondary(walk_roll, walk_bob, range(1, 50, 2)); head_lag = follow(walk_roll, 20, .3)
        walk += [(f, [('body', 'world_rotation', ((1, 0, 0), walk_roll[(f - 1) % 48])), ('body', 'world_location', (0, 0, walk_bob[(f - 1) % 48])),
                      ('head', 'world_rotation', ((1, 0, 0), .6 * (head_lag[(f - 1) % 48] - walk_roll[(f - 1) % 48]))), *sec[f]]) for f in range(1, 50, 2)]
    action('walk', walk)
    action('greet', [(1, [('arm_-1', 'world_rotation', (pitch, 0)), ('head', 'world_rotation', (pitch, 0)), *blink(0)]), (15, [('arm_-1', 'world_rotation', (pitch, -.5)), ('head', 'world_rotation', (pitch, .06))]), (25, [('arm_-1', 'world_rotation', (pitch, -.38)), ('head', 'world_rotation', (pitch, .02))]), (37, [('arm_-1', 'world_rotation', (pitch, 0)), ('head', 'world_rotation', (pitch, 0)), *blink(0)])])
    rest = [('body', 'world_rotation', (pitch, 0)), ('body', 'world_location', zero), ('head', 'world_rotation', (pitch, 0)), ('tail1', 'world_rotation', (yaw, 0)), ('tail2', 'world_rotation', (yaw, 0))]
    # curling forward tips the body below the ground, so it rises a little while curled
    curl = [('body', 'world_rotation', (pitch, .45)), ('body', 'world_location', (0, 0, .045)), ('head', 'world_rotation', (pitch, .16)), ('tail1', 'world_rotation', (yaw, -.35)), ('tail2', 'world_rotation', (yaw, -.38))]
    action('sleep', [(1, [*rest, *blink(0)]), (30, [*curl, *blink(-.13)]), (60, [*curl, *blink(-.13)]), (90, [*rest, *blink(0)])])
reset_pose()

# ---------- save and export (outline width travels with the model as a glTF scene extra)
scene = bpy.context.scene
scene['sammakko_outline'] = cam_info['line_world']
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / (CID + '.blend')))
bpy.ops.object.select_all(action='DESELECT'); arm.select_set(True)
for ob, _ in parts: ob.select_set(True)
bpy.context.view_layer.objects.active = arm
# The joints' default transforms are the reset pose (closed-eye layers scaled away), so a model shown without a clip has open eyes.
for t in arm.animation_data.nla_tracks: t.mute = True
reset_pose(); bpy.context.view_layer.update()
bpy.ops.export_scene.gltf(filepath=str(OUT / (CID + '.glb')), export_format='GLB', use_selection=True, export_yup=True, export_animations=True,
                          export_animation_mode='NLA_TRACKS', export_apply=True, export_extras=True, export_rest_position_armature=False)

# ---------- renders
for t in arm.animation_data.nla_tracks: t.mute = True
arm.animation_data.action = None; reset_pose(); bpy.context.view_layer.update()
toon_preview.apply([ob for ob, _ in parts], hull='custom', width=cam_info['line_world'], colors={'rust': tuple(linear(data['palette']['ink rust'])), 'navy': tuple(linear(data['palette']['ink navy']))})
toon_preview.setup_render(scene, cam_info['width_px'])
def aim(ob, p): ob.rotation_euler = (Vector(p) - ob.location).to_track_quat('-Z', 'Y').to_euler()
def lamp(loc, power, size, target):
    bpy.ops.object.light_add(type='AREA', location=loc); o = bpy.context.object; o.name = 'PREVIEW lamp'; o.data.energy = power; o.data.shape = 'DISK'; o.data.size = size; aim(o, target)
ztop = max(max(v[2] for v in pt['verts']) for pt in data['parts'])  # model height above the soles
mid = (0, 0, ztop * .5)
lamp((1, -4, 5), 160, 4, mid); lamp((3, 3, 4), 90, 3, mid)
bpy.ops.object.camera_add(); camera = bpy.context.object; camera.name = 'PREVIEW camera'; camera.data.type = 'ORTHO'; scene.camera = camera
W, H = cam_info['width_px'], cam_info['height_px']
match_center = ((W / 2 - .5 - cam_info['u0']) * K, (cam_info['bottom'] - H / 2 + .5) * K)  # pixel centres sit at integer coordinates
scene.render.resolution_x = W; scene.render.resolution_y = H
def profile_render(path):
    camera.data.ortho_scale = max(W, H) * K; camera.location = (match_center[0], -10, match_center[1]); camera.rotation_euler = (math.pi / 2, 0, 0)
    scene.render.filepath = str(path); bpy.ops.render.render(write_still=True)
FRONT = data.get('front_camera')
def front_render(path):
    # Front match: looking along -X at the face; screen right is +Y and canvas column front['uc'] is the mid-plane.
    camera.data.ortho_scale = max(W, H) * K; camera.location = (10, (W / 2 - .5 - FRONT['uc']) * K, match_center[1]); camera.rotation_euler = (math.pi / 2, 0, math.pi / 2)
    scene.render.filepath = str(path); bpy.ops.render.render(write_still=True)
scene.render.film_transparent = True; scene.render.image_settings.color_mode = 'RGBA'
profile_render(OUT / 'profile-match.png')
if FRONT: front_render(OUT / 'front-match.png')
# Flat ID pass: Workbench, no outline, no anti-aliasing, one colour per measured feature.
ids = {}
for ob, _ in parts:
    ids[ob.name] = ob.data.materials[0]
id_colours = {'Eye rim': (0, 0, 1), 'Eye white': (0, 1, 1), 'Pupil': (1, 0, 1), 'Eye glint': (1, 0, 1), 'Upper bill': (1, .5, 0), 'Lower bill': (1, 0, 0), 'Tongue': (0, 1, 0),
              'Sleepy lid': (.5, .5, 1), 'Lid line': (0, 0, 1), 'Cheek': (1, 1, 0), 'Mouth line': (.3, 0, .6), 'Mouth base line': (.6, .3, 0), 'Front mouth': (.3, 0, .6)}
for ob, _ in parts:
    key = next((k for k in id_colours if ob.name.startswith(k)), None)
    m = bpy.data.materials.new('ID ' + ob.name); m.diffuse_color = (*(id_colours[key] if key else (.5, .5, .5)), 1)
    ob.data.materials[0] = m
toon_preview.show_outlines(False)
saved = (scene.render.engine,)
scene.render.engine = 'BLENDER_WORKBENCH'; scene.display.shading.light = 'FLAT'; scene.display.shading.color_type = 'MATERIAL'; scene.display.render_aa = 'OFF'
scene.view_settings.view_transform = 'Standard'
profile_render(OUT / 'profile-id.png')
if FRONT: front_render(OUT / 'front-id.png')
for ob, _ in parts:
    ob.data.materials[0] = ids[ob.name]
toon_preview.show_outlines(True)
scene.render.engine = saved[0]
if not FAST:
    scene.render.film_transparent = False; scene.render.resolution_x = scene.render.resolution_y = 720
    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, 0)); floor = bpy.context.object; floor.name = 'PREVIEW floor'
    fm = bpy.data.materials.new('Preview floor'); fm.diffuse_color = (.93, .90, .80, 1); floor.data.materials.append(fm)
    camera.data.ortho_scale = ztop * 1.25
    for name, loc in [('profile.png', (0, -6, mid[2])), ('three-quarter.png', (4, -6, mid[2] + 1.6)), ('front.png', (6, 0, mid[2])), ('back-three-quarter.png', (-4, -5, mid[2] + 1.2))]:
        camera.location = loc; aim(camera, mid); scene.render.filepath = str(OUT / name); bpy.ops.render.render(write_still=True)
    # clip frames from the same actions the GLB carries: walk from the side (ground contact), the rest from three-quarter
    clips = {'aava': {'walk': [1, 7, 13, 19, 25, 31, 37, 43, 49], 'gentle-nod': [1, 13], 'point': [1, 13]},
             'sisi': {'walk': [1, 7, 13, 19, 25, 31, 37, 43, 49], 'idle': [1, 32, 49], 'greet': [1, 15, 25, 37], 'sleep': [1, 30, 60, 90]}}[CID]
    for clip, frames in clips.items():
        arm.animation_data.action = bpy.data.actions[clip]
        camera.location = (0, -6, mid[2]) if clip == 'walk' else (4, -6, mid[2] + 1.6); aim(camera, mid)
        for f in frames:
            scene.frame_set(f); scene.render.filepath = str(OUT / ('%s-%02d.png' % (clip, f))); bpy.ops.render.render(write_still=True)
    arm.animation_data.action = None; reset_pose()
    # transparent stills for the game: the character-lab poster (rest pose) and, for Sisi, the film's sleep cameo
    floor.hide_render = True; scene.render.film_transparent = True; camera.data.ortho_scale = ztop * 1.5
    camera.location = (4, -6, mid[2] + 1.6); aim(camera, mid)
    scene.render.resolution_x = scene.render.resolution_y = 720; scene.frame_set(1)
    scene.render.filepath = str(OUT / 'poster.png'); bpy.ops.render.render(write_still=True)
    if CID == 'sisi':
        arm.animation_data.action = bpy.data.actions['sleep']; scene.frame_set(60)
        scene.render.resolution_x = scene.render.resolution_y = 512
        scene.render.filepath = str(OUT / 'film-sleep.png'); bpy.ops.render.render(write_still=True)
        arm.animation_data.action = None; reset_pose()
print('BUILD_OK', CID, 'triangles', sum(len(ob.data.polygons) for ob, _ in parts))
