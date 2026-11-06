"""Create an isolated Aava candidate. Run Blender --factory-startup --background --python this file."""
import bpy, math, os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import toon_preview
from mathutils import Vector, Quaternion
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'art/characters-3d/aava'
OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for block in bpy.data.materials: bpy.data.materials.remove(block)
def mat(name,color,roughness=.9):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=roughness
 return m
butter=mat('Butter yellow',(1.0,.73,.19));wingmat=mat('Wing butter yellow',(1,.77,.24));orange=mat('Warm orange bill',(1,.32,.025));footmat=mat('Feet orange',(.94,.31,.035));navy=mat('Dark blue eye edge',(.012,.06,.11));white=mat('Eye pale',(.97,.97,.93));pupil=mat('Deep navy pupil',(.008,.035,.055));pink=mat('Soft pink cheek',(1,.41,.37));ground=mat('Preview floor',(.93,.90,.80))
parts=[]
def ell(name,loc,scale,material,bone,rot=0,seg=28,rings=16):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=rings,location=loc)
 ob=bpy.context.object;ob.name=name;ob.scale=scale;ob.rotation_euler[1]=rot
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 ob.data.materials.append(material)
 for p in ob.data.polygons:p.use_smooth=True
 parts.append((ob,bone));return ob
# +X is the beak. Profile follows the approved head-to-body offset and raised head.
ell('Body',(-.23,0,.64),(.49,.345,.37),butter,'body',rot=-.26)
ell('Head',(.13,0,1.25),(.47,.40,.49),butter,'head',rot=.20)
# A small, rounded tail point that lifts up and back, like the drawing.
ell('Tail',(-.64,0,.86),(.21,.115,.09),wingmat,'body',rot=.80)
# Beak has two separate, soft lobes, never changes across clips.
ell('Upper bill',(.67,0,1.27),(.30,.215,.15),orange,'head',rot=-.42)
ell('Lower bill',(.645,0,1.095),(.27,.195,.125),orange,'head',rot=.38)
def face_patch(name,cx,cz,rx,rz,side,offset,material):
 # Curve each patch onto the actual rotated ellipsoid: no floating eye discs.
 verts=[];segments=32;bands=6
 for band in range(bands+1):
  radius=band/bands
  for i in range(segments):
   a=2*math.pi*i/segments;x=cx+rx*radius*math.cos(a);z=cz+rz*radius*math.sin(a)
   dx=x-.13;dz=z-1.25;lx=math.cos(.2)*dx-math.sin(.2)*dz;lz=math.sin(.2)*dx+math.cos(.2)*dz
   y=.40*math.sqrt(max(0,1-(lx/.47)**2-(lz/.49)**2))
   verts.append((x,side*(y+offset),z))
 faces=[]
 for k in range(bands):
  for i in range(segments):
   f=(k*segments+i,k*segments+(i+1)%segments,(k+1)*segments+(i+1)%segments,(k+1)*segments+i)
   faces.append(f if side>0 else tuple(reversed(f)))
 mesh=bpy.data.meshes.new(name+' mesh');mesh.from_pydata(verts,[],faces);mesh.update()
 ob=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(ob);ob.data.materials.append(material)
 for f in mesh.polygons:f.use_smooth=True
 parts.append((ob,'head'))
for side in [-1,1]:
 y=side
 ell('Wing.'+str(side),(-.29,y*.325,.72),(.30,.075,.18),wingmat,'wing_'+str(side),rot=-.45)
 # Layered eye geometry; each actual side has its own eye, profile sees the near eye.
 face_patch('Eye rim.'+str(side),.27,1.32,.142,.178,side,.002,navy)
 face_patch('Eye white.'+str(side),.274,1.32,.118,.152,side,.004,white)
 face_patch('Pupil.'+str(side),.312,1.33,.080,.104,side,.008,pupil)
 face_patch('Eye glint.'+str(side),.338,1.378,.030,.037,side,.010,white)
 face_patch('Cheek.'+str(side),.005,1.12,.078,.055,side,.003,pink)
 legx=-.30+side*.09
 ell('Leg.'+str(side),(legx,y*.15,.20),(.056,.058,.16),footmat,'leg_'+str(side),seg=24,rings=16)
 # Rounded, forward-pointing foot: a soft oval as in the drawings.
 ell('Webbed foot.'+str(side),(legx+.075,y*.15,.047),(.15,.085,.047),footmat,'foot_'+str(side))
# Rigid weights still produce a standard skinned glTF; bones remain individually editable.
arm_data=bpy.data.armatures.new('Aava skeleton');arm=bpy.data.objects.new('Aava rig',arm_data);bpy.context.collection.objects.link(arm)
bpy.context.view_layer.objects.active=arm;arm.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
def bone(name,head,tail,parent=None):
 b=arm_data.edit_bones.new(name);b.head=head;b.tail=tail
 if parent:b.parent=arm_data.edit_bones[parent]
for args in [('root',(0,0,0),(0,0,.2),None),('body',(-.23,0,.4),(-.23,0,.85),'root'),('head',(.05,0,.87),(.13,0,1.4),'body'),('wing_-1',(-.28,-.25,.75),(-.45,-.32,.7),'body'),('wing_1',(-.28,.25,.75),(-.45,.32,.7),'body'),('leg_-1',(-.39,-.15,.44),(-.39,-.15,.08),'root'),('leg_1',(-.21,.15,.44),(-.21,.15,.08),'root'),('foot_-1',(-.39,-.15,.08),(-.22,-.15,.08),'leg_-1'),('foot_1',(-.21,.15,.08),(-.04,.15,.08),'leg_1')]:bone(*args)
bpy.ops.object.mode_set(mode='OBJECT');arm.select_set(False)
for ob,bname in parts:
 group=ob.vertex_groups.new(name=bname);group.add(list(range(len(ob.data.vertices))),1,'REPLACE');mod=ob.modifiers.new('Armature','ARMATURE');mod.object=arm;ob.parent=arm
# Save/export and animation are below, deliberately after inspection renders.
# Clip keyframes use fixed root and rigid face; no bill or eye animation.
bpy.context.preferences.edit.keyframe_new_interpolation_type="LINEAR"
arm.animation_data_create()
def action(name,keys):
 arm.animation_data.action=None
 for pb in arm.pose.bones:
  pb.rotation_mode='XYZ';pb.location=(0,0,0);pb.rotation_euler=(0,0,0);pb.scale=(1,1,1)
 for frame,changes in keys:
  for name_b,field,value in changes:
   pb=arm.pose.bones[name_b]
   if field=='world_location':
    pb.location=pb.bone.matrix_local.to_3x3().inverted() @ Vector(value);field='location'
   else:setattr(pb,field,value)
   pb.keyframe_insert(data_path=field,frame=frame,group=name_b)
 act=arm.animation_data.action;act.name=name
 track=arm.animation_data.nla_tracks.new();track.name=name;track.strips.new(name,int(act.frame_range[0]),act)
 arm.animation_data.action=None
 return act
zero=(0,0,0)
action('idle',[(1,[('head','rotation_euler',zero)]),(25,[('head','rotation_euler',(0,.035,0))]),(49,[('head','rotation_euler',zero)])])
head_rest=arm.data.bones['head'].matrix_local.to_quaternion()
nod=(head_rest.inverted() @ Quaternion((0,1,0),.16) @ head_rest).to_euler()
action('gentle-nod',[(1,[('head','rotation_euler',zero)]),(13,[('head','rotation_euler',nod)]),(25,[('head','rotation_euler',zero)])])
action('point',[(1,[('wing_-1','world_location',zero)]),(13,[('wing_-1','world_location',(.75,-.03,.09))]),(30,[('wing_-1','world_location',(.75,-.03,.09))]),(43,[('wing_-1','world_location',zero)])])
walk=[]
for frame in [1,7,13,19,25,31,37,43,49]:
 changes=[]
 for side,offset in [(-1,0),(1,12)]:
  phase=((frame-1+offset)%48)
  if phase<=12:x,z=-.07,0
  elif phase<=24:
   t=(phase-12)/12;x,z=-.07+.14*t,.12*math.sin(math.pi*t)
  elif phase<=36:x,z=.07,0
  else:
   t=(phase-36)/12;x,z=.07-.14*t,.12*math.sin(math.pi*t)
  changes.append(('leg_'+str(side),'world_location',(x,0,z)))
 walk.append((frame,changes))
action('walk',walk)
# Remove helper objects only from export selection. Keep lights and camera in the authoring file.
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'aava.blend'))
bpy.ops.object.select_all(action='DESELECT');arm.select_set(True)
for ob,_ in parts:ob.select_set(True)
bpy.context.view_layer.objects.active=arm
bpy.ops.export_scene.gltf(filepath=str(OUT/'aava.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_apply=True)
# Neutral portrait first; animation is authored after these inspection views.
world=bpy.context.scene.world;world.color=(.8,.8,.8)
scene=bpy.context.scene
scene.render.resolution_x=720;scene.render.resolution_y=720;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.78,.86,.82,1);scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.45
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,0));floor=bpy.context.object;floor.name='PREVIEW floor';floor.data.materials.append(ground);toon_preview.apply([ob for ob,_ in parts]);toon_preview.setup_render(scene)
def aim(ob,p):ob.rotation_euler=(Vector(p)-ob.location).to_track_quat('-Z','Y').to_euler()
def lamp(name,loc,power,size):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;aim(o,(0,0,.8))
lamp('PREVIEW key',(0,-3,5),130,4);lamp('PREVIEW fill',(3,3,4),90,3)
bpy.ops.object.camera_add();camera=bpy.context.object;camera.name='PREVIEW camera';camera.data.type='ORTHO';camera.data.ortho_scale=2.35;scene.camera=camera
def render(name,loc):
 camera.location=loc;aim(camera,(-.02,0,.85));scene.render.filepath=str(OUT/name);bpy.ops.render.render(write_still=True)
for t in arm.animation_data.nla_tracks:t.mute=True
arm.animation_data.action=None
for pb in arm.pose.bones: pb.location=(0,0,0);pb.rotation_euler=(0,0,0)
render('profile.png',(0,-6,1.8));render('three-quarter.png',(4,-6,3.0));render('front.png',(6,0,1.8))
# Animation contact sheets are individual unedited renders, explicitly framed at two planted and two lifted positions.
for t in arm.animation_data.nla_tracks:t.mute=True
arm.animation_data.action=bpy.data.actions['walk']
for frame in [1,13,19,25,37,43,49]:
 scene.frame_set(frame);render('walk-%02d.png'%frame,(0,-6,1.8))

for pb in arm.pose.bones: pb.location=(0,0,0);pb.rotation_euler=(0,0,0)
arm.animation_data.action=bpy.data.actions['point'];scene.frame_set(13);render('point-13.png',(4,-6,3));render('point-profile-near.png',(0,-6,1.8));render('point-profile-far.png',(0,6,1.8))
for pb in arm.pose.bones: pb.location=(0,0,0);pb.rotation_euler=(0,0,0)
arm.animation_data.action=bpy.data.actions['gentle-nod'];scene.frame_set(13);render('nod-13.png',(0,-6,1.8))
