"""Review-only Sulka: the repository SVG is the character-design authority."""
import bpy,math
from mathutils import Vector, Quaternion
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'art/characters-3d/sulka';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mat(n,c):
 m=bpy.data.materials.new(n);m.diffuse_color=(*c,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=.9;return m
feather=mat('Heron blue gray',(.36,.47,.56));dark=mat('Glasses and pupil',(.035,.07,.085));eye=mat('Eye whites',(.93,.95,.93));beak=mat('Warm ochre beak',(.78,.49,.10));coat=mat('White lab coat',(.91,.94,.92));seam=mat('Coat seam',(.57,.64,.65));collarmat=mat('Soft collar',(.78,.84,.84));crestmat=mat('Crest blue gray',(.23,.34,.41));legmat=mat('Ochre legs',(.67,.36,.09));ground=mat('Preview floor',(.75,.83,.79));parts=[]
def ell(n,pos,scale,ma,bone,seg=24,rings=14):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=rings,location=pos);o=bpy.context.object;o.name=n;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(ma)
 for f in o.data.polygons:f.use_smooth=True
 parts.append((o,bone));return o
def bar(n,a,b,r,ma,bone):
 a,b=Vector(a),Vector(b);d=b-a;bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=10,location=(a+b)*.5);o=bpy.context.object;o.name=n;o.scale=(r,r,d.length/2+r);o.rotation_euler=d.to_track_quat('Z','Y').to_euler();bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(ma)
 for f in o.data.polygons:f.use_smooth=True
 parts.append((o,bone));return o
# Tall, slender scientist; white tapered coat based on art.ts, no unapproved props.
bpy.ops.mesh.primitive_cone_add(vertices=32,radius1=.38,radius2=.25,depth=.85,location=(0,0,.95));o=bpy.context.object;o.name='Lab coat';o.data.materials.append(coat)
for f in o.data.polygons:f.use_smooth=True
parts.append((o,'body'))
# Restrained folded collar and lapels, attached to the front of the existing coat.
for side in [-1,1]:
 verts=[(.250,side*.03,1.37),(.245,side*.19,1.34),(.275,side*.15,1.19),(.285,side*.045,1.25)]
 mesh=bpy.data.meshes.new('Collar mesh');mesh.from_pydata(verts,[],[(0,1,2,3)]);mesh.update();lapel=bpy.data.objects.new('Collar.'+str(side),mesh);bpy.context.collection.objects.link(lapel);lapel.data.materials.append(collarmat);parts.append((lapel,'body'))
bar('Coat seam',(.385,0,.55),(.255,0,1.32),.009,seam,'body')
for z in [.85,1.04]:
 x=.38-(z-.525)/.85*.13+.006;ell('Coat button',(x,-.07,z),(.013,.024,.024),seam,'body',16,10)
bar('Heron neck',(-.02,0,1.31),(.09,0,1.78),.075,feather,'neck')
ell('Head',(.10,0,1.84),(.19,.16,.19),feather,'head')
# The small rearward curve follows the final path in the accepted SVG.
bar('Crest base',(-.015,0,1.995),(-.13,0,2.015),.014,crestmat,'head')
bar('Crest tip',(-.13,0,2.015),(-.23,0,1.97),.009,crestmat,'head')
# Pointed heron bill aligned +X, golden like the SVG.
bpy.ops.mesh.primitive_cone_add(vertices=24,radius1=.09,radius2=0,depth=.48,location=(.44,0,1.83));o=bpy.context.object;o.name='Bill';o.rotation_euler[1]=math.pi/2;o.data.materials.append(beak)
for f in o.data.polygons:f.use_smooth=True
parts.append((o,'head'))
for side in [-1,1]:
 y=side
 ell('Eye.'+str(side),(.14,y*.153,1.865),(.073,.014,.076),eye,'head',20,12)
 ell('Pupil.'+str(side),(.16,y*.170,1.87),(.031,.009,.035),dark,'head',16,10)
 bpy.ops.mesh.primitive_torus_add(major_segments=32,minor_segments=8,location=(.14,y*.166,1.865),major_radius=.082,minor_radius=.009,rotation=(math.pi/2,0,0));o=bpy.context.object;o.name='Round glasses.'+str(side);o.data.materials.append(dark)
 for f in o.data.polygons:f.use_smooth=True
 parts.append((o,'head'))
 bar('Glasses arm.'+str(side),(.055,y*.16,1.87),(-.07,y*.13,1.88),.008,dark,'head')
 bar('Sleeve.'+str(side),(0,y*.22,1.25),(.03,y*.37,.86),.10,coat,'arm_'+str(side))
 ell('Wing tip.'+str(side),(.04,y*.37,.83),(.08,.07,.09),feather,'arm_'+str(side))
 bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=.026,depth=.49,location=(-.03,y*.16,.295));o=bpy.context.object;o.name='Leg.'+str(side);o.data.materials.append(legmat)
 for f in o.data.polygons:f.use_smooth=True
 parts.append((o,'leg_'+str(side)))
 ell('Foot.'+str(side),(.075,y*.16,.035),(.14,.055,.035),legmat,'foot_'+str(side),20,12)
ad=bpy.data.armatures.new('Sulka skeleton');arm=bpy.data.objects.new('Sulka rig',ad);bpy.context.collection.objects.link(arm);bpy.context.view_layer.objects.active=arm;arm.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
def bone(n,a,b,parent=None):
 o=ad.edit_bones.new(n);o.head=a;o.tail=b
 if parent:o.parent=ad.edit_bones[parent]
for arg in [('root',(0,0,0),(0,0,.2),None),('body',(0,0,.55),(0,0,1.35),'root'),('neck',(0,0,1.3),(.09,0,1.78),'body'),('head',(.09,0,1.78),(.10,0,1.98),'neck')]:bone(*arg)
for side in [-1,1]:
 bone('arm_'+str(side),(0,side*.22,1.25),(.03,side*.37,.86),'body');bone('leg_'+str(side),(-.03,side*.16,.53),(-.03,side*.16,.09),'root');bone('foot_'+str(side),(-.03,side*.16,.09),(.16,side*.16,.09),'leg_'+str(side))
bpy.ops.object.mode_set(mode='OBJECT');arm.select_set(False)
for o,b in parts:g=o.vertex_groups.new(name=b);g.add(list(range(len(o.data.vertices))),1,'REPLACE');m=o.modifiers.new('Armature','ARMATURE');m.object=arm;o.parent=arm
scene=bpy.context.scene;scene.view_settings.view_transform='Standard';scene.render.engine='CYCLES';scene.cycles.samples=24;scene.render.resolution_x=720;scene.render.resolution_y=720;scene.render.resolution_percentage=100;scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.78,.86,.82,1);scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.45
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,0));bpy.context.object.data.materials.append(ground)
def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
def lamp(p,e):
 bpy.ops.object.light_add(type='AREA',location=p);o=bpy.context.object;o.data.energy=e;o.data.shape='DISK';o.data.size=4;aim(o,(0,0,1))
lamp((3,-3,5),130);lamp((-3,3,4),90)
bpy.ops.object.camera_add();cam=bpy.context.object;cam.data.type='ORTHO';cam.data.ortho_scale=2.65;scene.camera=cam
def render(n,p):cam.location=p;aim(cam,(0,0,1));scene.render.filepath=str(OUT/n);bpy.ops.render.render(write_still=True)
render('profile.png',(0,-6,2));render('three-quarter.png',(4,-6,3));render('front.png',(6,0,2))
# Reserve a small, inspectable motion set rather than claiming a finished performance.
arm.animation_data_create()
def action(n,keys):
 arm.animation_data.action=None
 for p in arm.pose.bones:p.rotation_mode='XYZ';p.location=(0,0,0);p.rotation_euler=(0,0,0)
 for f,changes in keys:
  for name,field,val in changes:
   p=arm.pose.bones[name]
   if field=='world_location':p.location=p.bone.matrix_local.to_3x3().inverted()@Vector(val);field='location'
   else:setattr(p,field,val)
   p.keyframe_insert(data_path=field,frame=f,group=name)
 a=arm.animation_data.action;a.name=n;t=arm.animation_data.nla_tracks.new();t.name=n;t.strips.new(n,int(a.frame_range[0]),a);arm.animation_data.action=None
zero=(0,0,0)
action('idle',[(1,[('head','rotation_euler',zero)]),(25,[('head','rotation_euler',(0,.035,0))]),(49,[('head','rotation_euler',zero)])])
def gesture_rotation(target):
 rest=arm.data.bones['arm_-1'].matrix_local.to_quaternion();q=Vector((.03,-.15,-.39)).rotation_difference(Vector(target));return (rest.inverted() @ q @ rest).to_euler()
action('gesture',[(1,[('arm_-1','rotation_euler',zero)]),(13,[('arm_-1','rotation_euler',gesture_rotation((.22,-.24,.05)))]),(30,[('arm_-1','rotation_euler',gesture_rotation((.22,-.24,.05)))]),(43,[('arm_-1','rotation_euler',zero)])])
head_rest=arm.data.bones['head'].matrix_local.to_quaternion()
nod=(head_rest.inverted() @ Quaternion((0,1,0),.16) @ head_rest).to_euler()
action('gentle-nod',[(1,[('head','rotation_euler',zero)]),(13,[('head','rotation_euler',nod)]),(25,[('head','rotation_euler',zero)])])
walk=[]
for frame in [1,7,13,19,25,31,37,43,49]:
 c=[]
 for side,offset in [(-1,0),(1,12)]:
  p=(frame-1+offset)%48
  if p<=12:x,z=-.06,0
  elif p<=24:t=(p-12)/12;x,z=-.06+.12*t,.09*math.sin(math.pi*t)
  elif p<=36:x,z=.06,0
  else:t=(p-36)/12;x,z=.06-.12*t,.09*math.sin(math.pi*t)
  c.append(('leg_'+str(side),'world_location',(x,0,z)))
 walk.append((frame,c))
action('walk',walk)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'sulka.blend'));bpy.ops.object.select_all(action='DESELECT');arm.select_set(True)
for o,_ in parts:o.select_set(True)
bpy.context.view_layer.objects.active=arm;bpy.ops.export_scene.gltf(filepath=str(OUT/'sulka.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_apply=True)
for t in arm.animation_data.nla_tracks:t.mute=True
for p in arm.pose.bones:p.location=(0,0,0);p.rotation_euler=(0,0,0)
arm.animation_data.action=bpy.data.actions['walk']
for f in [1,13,19,25,43,49]:scene.frame_set(f);render(f'walk-{f:02d}.png',(0,-6,2))
for p in arm.pose.bones:p.location=(0,0,0);p.rotation_euler=(0,0,0)
arm.animation_data.action=bpy.data.actions['gesture'];scene.frame_set(13);render('gesture-13.png',(4,-6,3))

for p in arm.pose.bones:p.location=(0,0,0);p.rotation_euler=(0,0,0)
arm.animation_data.action=bpy.data.actions['gentle-nod'];scene.frame_set(13);render('nod-13.png',(0,-6,2))
