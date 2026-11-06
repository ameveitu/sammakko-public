"""Preview-only drawing look shared by the character builders.

Mirrors lite/src/world/character-style.js: flat three-tone fills and a navy inverted-hull outline.
Apply only after the GLB export; the exported asset keeps its plain materials and geometry.
"""
import bpy, bmesh, re

DETAIL = re.compile(r'eye|iris|pupil|glint|cheek|blush|lid|tongue|belly|closed|mouth|brow|nostril|spot|patch|toe|claw|\bink\b', re.I)
NAVY = (0.0065, 0.044, 0.09)  # linear of #123b55


def _outline_material(name='navy', color=NAVY):
    m = bpy.data.materials.get('PREVIEW %s outline' % name)
    if m:
        return m
    m = bpy.data.materials.new('PREVIEW %s outline' % name); m.use_nodes = True; m.use_backface_culling = True
    nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = (*color, 1); nt.links.new(em.outputs[0], out.inputs[0])
    return m


def _toon(material):
    base = material.node_tree.nodes.get('Principled BSDF')
    color = tuple(base.inputs['Base Color'].default_value) if base else tuple(material.diffuse_color)
    nt = material.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); diffuse = nt.nodes.new('ShaderNodeBsdfDiffuse')
    to_rgb = nt.nodes.new('ShaderNodeShaderToRGB'); ramp = nt.nodes.new('ShaderNodeValToRGB')
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'; mix.inputs['Factor'].default_value = 1
    emit = nt.nodes.new('ShaderNodeEmission')
    diffuse.inputs['Color'].default_value = (1, 1, 1, 1)
    ramp.color_ramp.interpolation = 'CONSTANT'
    els = ramp.color_ramp.elements
    els[0].position = 0.0; els[0].color = (.40, .40, .40, 1)
    els[1].position = 0.08; els[1].color = (.72, .72, .72, 1)
    third = els.new(0.32); third.color = (1, 1, 1, 1)
    mix.inputs['B'].default_value = color
    nt.links.new(diffuse.outputs[0], to_rgb.inputs[0]); nt.links.new(to_rgb.outputs['Color'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], mix.inputs['A']); nt.links.new(mix.outputs['Result'], emit.inputs['Color'])
    nt.links.new(emit.outputs[0], out.inputs[0])


def apply(objects, width=0.022, colors=None, hull='solidify'):
    """colors: optional {outline name: linear rgb}; an object's 'outline' custom property picks one (default navy).
    hull='custom': objects carrying an 'outline_normal' point attribute get a separate hull mesh pushed along it
    (the same offset the game shader makes along the exported normals); others keep the Solidify hull."""
    colors = {'navy': NAVY, **(colors or {})}
    outlines = {k: _outline_material(k, c) for k, c in colors.items()}; done = set()
    for ob in objects:
        if ob.type != 'MESH':
            continue
        for slot in ob.material_slots:
            m = slot.material
            if m and m.name not in done and m not in outlines.values():
                _toon(m); done.add(m.name)
        if DETAIL.search(ob.name):
            continue
        outline = outlines.get(ob.get('outline', 'navy'), outlines['navy'])
        if hull == 'custom' and 'outline_normal' in ob.data.attributes:
            _custom_hull(ob, outline, width); continue
        ob.data.materials.append(outline)
        mod = ob.modifiers.new('PREVIEW outline', 'SOLIDIFY')
        mod.thickness = width; mod.offset = 1; mod.use_flip_normals = True; mod.use_rim = False
        mod.material_offset = len(ob.data.materials) - 1


def _custom_hull(ob, material, width):
    h = ob.copy(); h.data = ob.data.copy(); h.name = ob.name + ' PREVIEW hull'
    for c in ob.users_collection: c.objects.link(h)
    me = h.data; n = len(me.vertices)
    co = [0.0] * (n * 3); nv = [0.0] * (n * 3)
    me.vertices.foreach_get('co', co); me.attributes['outline_normal'].data.foreach_get('vector', nv)
    me.vertices.foreach_set('co', [p + width * q for p, q in zip(co, nv)])
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.reverse_faces(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    me.materials.clear(); me.materials.append(material); me.polygons.foreach_set('material_index', [0] * len(me.polygons))
    for mod in list(h.modifiers):
        if mod.type != 'ARMATURE': h.modifiers.remove(mod)
    h['preview_hull'] = True


def show_outlines(visible):
    """Toggle every preview outline (Solidify modifiers and custom hulls), e.g. for flat ID passes."""
    for ob in bpy.data.objects:
        if ob.get('preview_hull'): ob.hide_render = not visible
        for mod in getattr(ob, 'modifiers', []):
            if mod.name == 'PREVIEW outline': mod.show_render = visible


def setup_render(scene, resolution=720, background=(.93, .90, .80)):
    scene.render.engine = 'BLENDER_EEVEE'
    scene.view_settings.view_transform = 'Standard'
    scene.render.resolution_x = scene.render.resolution_y = resolution
    scene.render.film_transparent = False
    bg = scene.world.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = (*background, 1); bg.inputs['Strength'].default_value = 1
