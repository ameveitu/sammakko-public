"""Build a private, review-only Loikka 3D candidate in an isolated Blender process."""
import bpy,math
from mathutils import Vector
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'art/characters-3d/loikka';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for m in bpy.data.materials:bpy.data.materials.remove(m)
def mat(n,c):
 m=bpy.data.materials.new(n);m.diffuse_color=(*c,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=.91;return m
blue=mat('Sky blue skin',(.055,.56,.83));blue2=mat('Blue outline',(.014,.12,.31));belly=mat('Pale blue belly',(.43,.79,.88));cream=mat('Warm cream eyes',(1,.89,.60));dark=mat('Dark pupil',(.008,.038,.085));pink=mat('Pink cheeks',(.99,.42,.51));white=mat('White glint',(1,1,.93));ground=mat('Preview floor',(.75,.83,.79));parts=[]
def ell(n,pos,scale,ma,bone,seg=24,rings=14):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=rings,location=pos);o=bpy.context.object;o.name=n;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(ma)
 for f in o.data.polygons:f.use_smooth=True
 parts.append((o,bone));return o
def rod(n,a,b,r,ma,bone):
 a,b=Vector(a),Vector(b);d=b-a;bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=(a+b)*.5);o=bpy.context.object;o.name=n;o.scale=(r,r,d.length/2+r);o.rotation_euler=d.to_track_quat('Z','Y').to_euler();bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(ma)
 for f in o.data.polygons:f.use_smooth=True
 parts.append((o,bone));return o
def face_patch(n,cy,cz,ry,rz,center,radii,offset,ma,bone):
 # Patch wraps the front of the ellipsoid; it is not a floating disk.
 cx,ey,ez=center;rx,eyr,ezr=radii;verts=[];seg=24;bands=6
 for k in range(bands+1):
  for i in range(seg):
   a=2*math.pi*i/seg;y=cy+ry*k/bands*math.cos(a);z=cz+rz*k/bands*math.sin(a)
   x=cx+rx*math.sqrt(max(0,1-((y-ey)/eyr)**2-((z-ez)/ezr)**2))+offset;verts.append((x,y,z))
 faces=[]
 for k in range(bands):
  for i in range(seg):faces.append(((k+1)*seg+i,(k+1)*seg+(i+1)%seg,k*seg+(i+1)%seg,k*seg+i))
 mesh=bpy.data.meshes.new(n+' mesh');mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(n,mesh);bpy.context.collection.objects.link(o);o.data.materials.append(ma)
 for f in mesh.polygons:f.use_smooth=True
 parts.append((o,bone))
# +X points to the front. Broad blue head, small pear-like upright body.
ell('Body',(-.03,0,.52),(.30,.35,.43),blue,'body')
face_patch('Belly',0,.51,.24,.28,(-.03,0,.52),(.30,.35,.43),.008,belly,'body')
ell('Head',(.01,0,1.02),(.34,.61,.28),blue,'head')
for side in [-1,1]:
 y=side
 ell('Eye mound.'+str(side),(.04,y*.30,1.245),(.23,.235,.235),blue,'head')
 center=(.04,y*.30,1.245);radii=(.23,.235,.235)
 face_patch('Eye rim.'+str(side),y*.30,1.256,.185,.199,center,radii,.012,blue2,'head')
 face_patch('Eye cream.'+str(side),y*.30,1.258,.157,.170,center,radii,.015,cream,'head')
 face_patch('Pupil.'+str(side),y*.30,1.26,.078,.105,center,radii,.018,dark,'head')
 face_patch('Eye glint.'+str(side),y*.278,1.31,.027,.034,center,radii,.021,white,'head')
 face_patch('Cheek.'+str(side),y*.43,.965,.067,.045,(.01,0,1.02),(.34,.61,.28),.008,pink,'head')
 rod('Arm.'+str(side),(.02,y*.30,.70),(.13,y*.48,.42),.095,blue,'arm_'+str(side))
 for j in range(3):ell('Finger.'+str(side)+'.'+str(j),(.14+j*.025,y*(.46+j*.04),.40-j*.025),(.048,.050,.053),blue,'arm_'+str(side),seg=16,rings=10)
 rod('Leg.'+str(side),(-.04,y*.19,.38),(-.02,y*.26,.16),.11,blue,'leg_'+str(side))
 ell('Foot.'+str(side),(.09,y*.26,.075),(.21,.145,.075),blue,'foot_'+str(side))
 for j in range(3):ell('Toe.'+str(side)+'.'+str(j),(.23,y*.26+(j-1)*.078,.060),(.065,.050,.060),blue,'foot_'+str(side),seg=16,rings=10)
# Wide simple smile, deliberately no teeth or nostrils. Curved tube on front face.
pts=[]
for i in range(21):
 y=-.35+.7*i/20;z=.985-.115*(1-(y/.35)**2);x=.01+.34*math.sqrt(max(.01,1-(y/.61)**2-((z-1.02)/.28)**2))+.007;pts.append((x,y,z))
verts=[];faces=[]
for x,y,z in pts:
 for k in range(8):
  angle=2*math.pi*k/8;verts.append((x+.014*math.cos(angle),y,z+.014*math.sin(angle)))
for j in range(len(pts)-1):
 for k in range(8):faces.append((j*8+k,j*8+(k+1)%8,(j+1)*8+(k+1)%8,(j+1)*8+k))
mesh=bpy.data.meshes.new('Smile mesh');mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new('Smile',mesh);bpy.context.collection.objects.link(o);o.data.materials.append(blue2)
for f in mesh.polygons:f.use_smooth=True
parts.append((o,'head'))
# Connected skeletal hierarchy; separate arm, lower-leg and foot bones.
ad=bpy.data.armatures.new('Loikka skeleton');arm=bpy.data.objects.new('Loikka rig',ad);bpy.context.collection.objects.link(arm);bpy.context.view_layer.objects.active=arm;arm.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
def bone(n,a,b,parent=None):
 x=ad.edit_bones.new(n);x.head=a;x.tail=b
 if parent:x.parent=ad.edit_bones[parent]
for arg in [('root',(0,0,0),(0,0,.2),None),('body',(0,0,.25),(0,0,.8),'root'),('head',(0,0,.8),(0,0,1.3),'body')]:bone(*arg)
for s in [-1,1]:
 bone('arm_'+str(s),(0,s*.28,.70),(.12,s*.48,.42),'body');bone('leg_'+str(s),(-.04,s*.19,.38),(-.02,s*.26,.15),'root');bone('foot_'+str(s),(-.02,s*.26,.15),(.22,s*.26,.15),'leg_'+str(s))
bpy.ops.object.mode_set(mode='OBJECT');arm.select_set(False)
for o,b in parts:
 g=o.vertex_groups.new(name=b);g.add(list(range(len(o.data.vertices))),1,'REPLACE');mod=o.modifiers.new('Armature','ARMATURE');mod.object=arm;o.parent=arm
scene=bpy.context.scene;scene.view_settings.view_transform='Standard';scene.render.engine='CYCLES';scene.cycles.samples=24;scene.render.resolution_x=720;scene.render.resolution_y=720;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.78,.86,.82,1);scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.45
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,0));floor=bpy.context.object;floor.name='PREVIEW floor';floor.data.materials.append(ground)
def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
def lamp(pos,power,size):
 bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;aim(o,(0,0,.75))
lamp((3,-3,5),130,4);lamp((-3,3,4),90,3)
bpy.ops.object.camera_add();cam=bpy.context.object;cam.data.type='ORTHO';cam.data.ortho_scale=2.35;scene.camera=cam
def render(name,loc,target=(0,0,.75)):
 cam.location=loc;aim(cam,target);scene.render.filepath=str(OUT/name);bpy.ops.render.render(write_still=True)
render('front.png',(6,0,1.5));render('three-quarter.png',(5,-5,2.7));render('profile.png',(0,-6,1.5))
# Skeletal motion. Walk is in place, with a stationary support foot and fixed root.
bpy.context.preferences.edit.keyframe_new_interpolation_type='LINEAR';arm.animation_data_create()
def action(name,keys):
 arm.animation_data.action=None
 for p in arm.pose.bones:p.rotation_mode='XYZ';p.location=(0,0,0);p.rotation_euler=(0,0,0);p.scale=(1,1,1)
 for frame,changes in keys:
  for b,field,value in changes:
   p=arm.pose.bones[b]
   if field=='world_location':p.location=p.bone.matrix_local.to_3x3().inverted()@Vector(value);field='location'
   else:setattr(p,field,value)
   p.keyframe_insert(data_path=field,frame=frame,group=b)
 a=arm.animation_data.action;a.name=name;t=arm.animation_data.nla_tracks.new();t.name=name;t.strips.new(name,int(a.frame_range[0]),a);arm.animation_data.action=None
zero=(0,0,0)
action('idle',[(1,[('head','rotation_euler',zero)]),(25,[('head','rotation_euler',(0,.035,0))]),(49,[('head','rotation_euler',zero)])])
def wave_rotation(target):
 rest=arm.data.bones['arm_-1'].matrix_local.to_quaternion();initial=Vector((.12,-.20,-.28));q=initial.rotation_difference(Vector(target));return (rest.inverted() @ q @ rest).to_euler()
action('wave',[(1,[('arm_-1','rotation_euler',zero)]),(13,[('arm_-1','rotation_euler',wave_rotation((.04,-.34,.10)))]),(19,[('arm_-1','rotation_euler',wave_rotation((.12,-.31,.20)))]),(25,[('arm_-1','rotation_euler',wave_rotation((-.03,-.34,.12)))]),(31,[('arm_-1','rotation_euler',wave_rotation((.12,-.31,.20)))]),(43,[('arm_-1','rotation_euler',zero)])])
walk=[]
for frame in [1,7,13,19,25,31,37,43,49]:
 change=[]
 for side,offset in [(-1,0),(1,12)]:
  p=(frame-1+offset)%48
  if p<=12:x,z=-.06,0
  elif p<=24:t=(p-12)/12;x,z=-.06+.12*t,.10*math.sin(math.pi*t)
  elif p<=36:x,z=.06,0
  else:t=(p-36)/12;x,z=.06-.12*t,.10*math.sin(math.pi*t)
  change.append(('leg_'+str(side),'world_location',(x,0,z)))
 walk.append((frame,change))
action('walk',walk)
action('leap',[(1,[('root','world_location',zero)]),(7,[('root','world_location',(0,0,.18))]),(13,[('root','world_location',(0,0,.42))]),(19,[('root','world_location',(0,0,.52))]),(25,[('root','world_location',(0,0,.42))]),(31,[('root','world_location',(0,0,.18))]),(37,[('root','world_location',zero)])])
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'loikka.blend'));bpy.ops.object.select_all(action='DESELECT');arm.select_set(True)
for o,_ in parts:o.select_set(True)
bpy.context.view_layer.objects.active=arm;bpy.ops.export_scene.gltf(filepath=str(OUT/'loikka.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_apply=True)
for t in arm.animation_data.nla_tracks:t.mute=True
for clip,frames in [('walk',[1,13,19,25,43,49]),('leap',[1,7,13,19,25,31,37]),('wave',[13,19,25])]:
 for p in arm.pose.bones:p.location=(0,0,0);p.rotation_euler=(0,0,0)
 arm.animation_data.action=bpy.data.actions[clip]
 for f in frames:
  scene.frame_set(f);cam.data.ortho_scale=2.9 if clip=='leap' else 2.35;render(f'{clip}-{f:02d}.png',(5,-5,2.7),(0,0,1.0) if clip=='leap' else (0,0,.75))
