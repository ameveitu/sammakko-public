"""Headless Blender scene: foreground reed clusters for the homepage hero (VP01/VP02).

Run from the repository root:
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P tools/visual-polish/blender/reeds.py -- \
      --out tools/visual-polish/_work/reeds.png [--seed 20261102] [--samples 32]

Look: flat crayon-like emission colours with grain, an even navy (#244868) ink silhouette drawn just
behind every shape, transparent film, no depth of field (blur read as smudged). No characters, no countable props: only reeds, cattails and two grass tufts.
Outputs one RGBA PNG; tools/visual-polish/build-assets.py derives the shipped WebP files.
"""
import argparse
import math
import random
import sys

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument('--out', required=True)
ap.add_argument('--seed', type=int, default=20261102)
ap.add_argument('--samples', type=int, default=32)
ap.add_argument('--width', type=int, default=900)
ap.add_argument('--height', type=int, default=1200)
args = ap.parse_args(argv)
rng = random.Random(args.seed)

scene = bpy.context.scene
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)

NAVY = (0x24 / 255, 0x48 / 255, 0x68 / 255)


def srgb(hex_value):
    """Hex sRGB → linear RGB for emission colours (the view transform is Standard)."""
    out = []
    for i in (0, 2, 4):
        c = int(hex_value[i:i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return tuple(out)


def crayon(name, hex_light, hex_dark):
    """Flat emission colour with a soft vertical tone ramp and paper-like grain."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    emit = nt.nodes.new('ShaderNodeEmission')
    mix = nt.nodes.new('ShaderNodeMix')
    mix.data_type = 'RGBA'
    mix.inputs['A'].default_value = (*srgb(hex_dark), 1)
    mix.inputs['B'].default_value = (*srgb(hex_light), 1)
    coord = nt.nodes.new('ShaderNodeTexCoord')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    noise = nt.nodes.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 140.0
    noise.inputs['Detail'].default_value = 6.0
    ramp_add = nt.nodes.new('ShaderNodeMath')
    ramp_add.operation = 'MULTIPLY_ADD'
    ramp_add.inputs[1].default_value = 0.18
    grain = nt.nodes.new('ShaderNodeMath')
    grain.operation = 'MULTIPLY_ADD'
    grain.inputs[1].default_value = 0.35
    grain.inputs[2].default_value = -0.1
    nt.links.new(coord.outputs['Object'], sep.inputs[0])
    nt.links.new(sep.outputs['Z'], ramp_add.inputs[0])
    nt.links.new(coord.outputs['Object'], noise.inputs['Vector'])
    nt.links.new(noise.outputs['Fac'], grain.inputs[0])
    nt.links.new(ramp_add.outputs[0], grain.inputs[2])
    nt.links.new(grain.outputs[0], mix.inputs['Factor'])
    nt.links.new(mix.outputs['Result'], emit.inputs['Color'])
    nt.links.new(emit.outputs[0], out.inputs['Surface'])
    return mat


def ink():
    """Outline hull: navy emission on back faces, fully transparent on front faces."""
    mat = bpy.data.materials.new('ink')
    mat.use_nodes = True
    mat.use_backface_culling = False
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    emit = nt.nodes.new('ShaderNodeEmission')
    emit.inputs['Color'].default_value = (*srgb('244868'), 1)
    clear = nt.nodes.new('ShaderNodeBsdfTransparent')
    geo = nt.nodes.new('ShaderNodeNewGeometry')
    mix = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(geo.outputs['Backfacing'], mix.inputs['Fac'])
    nt.links.new(clear.outputs[0], mix.inputs[1])
    nt.links.new(emit.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs['Surface'])
    return mat


GREENS = [crayon('reed_a', '8fb36a', '4f7d4a'), crayon('reed_b', 'a7c47a', '5f8a50'), crayon('reed_c', '7aa35f', '3f6b45')]
BROWN = crayon('cattail', 'a8724a', '6e4630')
INK = ink()
INK_FLAT = crayon('ink_flat', '244868', '244868')


def outlined(obj, width):
    obj.data.materials.append(INK)
    mod = obj.modifiers.new('outline', 'SOLIDIFY')
    mod.thickness = width
    mod.offset = 1.0
    mod.use_flip_normals = True
    mod.material_offset = len(obj.data.materials) - 1


BASE = -1.4  # blades start below the frame so no base floats


def strip(x, y, height, lean, width, mat, pad):
    verts, faces = [], []
    seg = 14
    for i in range(seg + 1):
        t = i / seg
        bend = lean * t * t
        w = width * (1 - t) ** 0.8 + 0.004 + pad
        cx, cz = x + bend, BASE + t * (height - BASE) + (pad * 1.5 if i == seg else 0)
        verts += [(cx - w, y, cz), (cx + w, y, cz)]
        if i:
            a = 2 * (i - 1)
            faces.append((a, a + 1, a + 3, a + 2))
    mesh = bpy.data.meshes.new('blade')
    mesh.from_pydata(verts, [], faces)
    obj = bpy.data.objects.new('blade', mesh)
    bpy.context.collection.objects.link(obj)
    mesh.materials.append(mat)
    return obj


def blade(x, y, height, lean, width, mat):
    """A tapered, curved reed blade (2.5D strip) with a navy ink silhouette just behind it."""
    strip(x, y + 0.012, height, lean, width, INK_FLAT, 0.016)
    return strip(x, y, height, lean, width, mat, 0.0)


def head(cx, cz, rx, rz, tilt, mat, y, pad):
    verts, faces = [(cx, y, cz)], []
    n = 24
    for i in range(n):
        a = 2 * math.pi * i / n
        dx, dz = (rx + pad) * math.cos(a), (rz + pad) * math.sin(a)
        verts.append((cx + dx * math.cos(tilt) + dz * math.sin(tilt), y, cz - dx * math.sin(tilt) + dz * math.cos(tilt)))
        faces.append((0, 1 + i, 1 + (i + 1) % n))
    mesh = bpy.data.meshes.new('head')
    mesh.from_pydata(verts, [], faces)
    obj = bpy.data.objects.new('head', mesh)
    bpy.context.collection.objects.link(obj)
    mesh.materials.append(mat)


def cattail(x, y, height, lean):
    """Stem plus a flat outlined seed head (no 3D hull, so it reads as a drawn shape)."""
    stem = blade(x, y, height, lean, 0.018, GREENS[2])
    cx, cz = x + lean * 0.8, height * 0.84
    tilt = -math.atan2(lean, height) * 0.9
    head(cx, cz, 0.05, 0.17, tilt, INK_FLAT, y - 0.02 + 0.012, 0.016)
    head(cx, cz, 0.05, 0.17, tilt, BROWN, y - 0.02, 0.0)
    return stem


# Two clusters. The left cluster is kept; the right side of the hero uses a mirrored copy.
for i in range(46):
    x = rng.gauss(-0.6, 0.55)
    y = rng.uniform(-0.6, 0.9)
    h = rng.uniform(0.9, 2.4) * (1.15 if x < -0.6 else 1)
    blade(x, y, h, rng.uniform(-0.25, 0.6), rng.uniform(0.035, 0.06), rng.choice(GREENS))
for i in range(5):
    cattail(rng.uniform(-1.2, 0.2), rng.uniform(-0.2, 0.6), rng.uniform(1.8, 2.6), rng.uniform(0.05, 0.4))

cam_data = bpy.data.cameras.new('cam')
cam_data.lens = 50
cam_data.dof.use_dof = False
cam_data.dof.focus_distance = 14.0
cam_data.dof.aperture_fstop = 1.4
cam = bpy.data.objects.new('cam', cam_data)
bpy.context.collection.objects.link(cam)
cam.location = Vector((-0.45, -7.2, 0.95))
cam.rotation_euler = (math.radians(86), 0, 0)
scene.camera = cam

scene.render.engine = 'CYCLES'
scene.cycles.samples = args.samples
scene.cycles.device = 'CPU'
scene.cycles.seed = args.seed
scene.render.film_transparent = True
scene.render.resolution_x = args.width
scene.render.resolution_y = args.height
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.filepath = args.out
bpy.ops.render.render(write_still=True)
print('VP-REEDS', bpy.app.version_string, 'seed', args.seed, 'samples', args.samples, '→', args.out)
