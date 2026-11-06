"""Sisi v2: locally authored candidate following the approved sleepy-lizard concept more closely.

Run: Blender --factory-startup --background --python tools/characters-3d/build_sisi.py
Big round head on a pear body, half-lidded sleepy eye with a low dark pupil, soft rounded dark-green back
scallops, pale lime belly, yellow blush, tiny forked tongue, short arms, wide round feet and a grounded curling tail.
"""
import bpy, bmesh, math, os, sys
from mathutils import Vector, Quaternion
from pathlib import Path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import toon_preview
ROOT=Path(__file__).resolve().parents[2]; OUT=ROOT/'art/characters-3d/sisi'; OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for m in bpy.data.materials:bpy.data.materials.remove(m)
def mat(name,rgb):
 m=bpy.data.materials.new(name);m.diffuse_color=(*rgb,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*rgb,1);p.inputs['Roughness'].default_value=.95;return m
leaf=mat('Leaf green',(.36,.72,.04));lid_green=mat('Sleepy lid green',(.25,.58,.035));moss=mat('Soft moss scallops',(.06,.30,.035));belly=mat('Pale lime belly',(.50,.84,.13))
navy=mat('Deep teal line',(.006,.05,.07));cream=mat('Eye warm white',(.95,.95,.86));pupil=mat('Drowsy pupil',(.006,.045,.06));blush=mat('Yellow blush',(1,.80,.10));floor_mat=mat('Preview ground',(.93,.90,.80))
parts=[]
def ell(name,pos,scale,material,bone,rot=0,seg=28,rings=16):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=rings,location=pos);o=bpy.context.object;o.name=name;o.scale=scale;o.rotation_euler[1]=rot;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material)
 for f in o.data.polygons:f.use_smooth=True
 parts.append((o,bone));return o
def rod(name,a,b,r,material,bone,seg=16):
 a,b=Vector(a),Vector(b);d=b-a;o=ell(name,(a+b)*.5,(r,r,d.length/2+r),material,bone,seg,10);o.rotation_euler=d.to_track_quat('Z','Y').to_euler();return o
def mesh_object(name,verts,faces,material,bone):
 mesh=bpy.data.meshes.new(name+' mesh');mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);mesh.materials.append(material);parts.append((o,bone))
 for f in mesh.polygons:f.use_smooth=True
 return o
# Proportions follow the concept: the round head is as wide as the pear body and sits right on it.
BODY=((-.03,0,.40),(.31,.285,.37)); HEAD=((.05,0,1.00),(.40,.37,.385))
ell('Body',BODY[0],BODY[1],leaf,'body',seg=32,rings=18)
ell('Head',HEAD[0],HEAD[1],leaf,'head',seg=32,rings=18)
def on_surface(shape,x,z,side):
 (cx,_,cz),(rx,ry,rz)=shape;v=1-((x-cx)/rx)**2-((z-cz)/rz)**2;return side*ry*math.sqrt(max(.0005,v))
def side_patch(name,shape,cx,cz,rx,rz,side,offset,material,bone,half=False,seg=28,bands=7):
 # Painted details wrap the actual head/body surface; the half variant is a flat-bottomed lid.
 verts=[];faces=[];count=seg+1 if half else seg
 for j in range(bands+1):
  for k in range(count):
   a=(math.pi*k/seg) if half else math.tau*k/seg;x=cx+rx*j/bands*math.cos(a);z=cz+rz*j/bands*math.sin(a);verts.append((x,on_surface(shape,x,z,side)+side*offset,z))
 for j in range(bands):
  for k in range(seg):
   n=(k+1) if half else (k+1)%seg;f=(j*count+k,j*count+n,(j+1)*count+n,(j+1)*count+k);faces.append(f if side>0 else tuple(reversed(f)))
 return mesh_object(name,verts,faces,material,bone)
# Front belly: a pale lime oval on the lower front of the body.
verts=[];faces=[];seg=32;bands=8
for k in range(bands+1):
 for i in range(seg):
  a=math.tau*i/seg;y=.20*k/bands*math.cos(a);z=.34+.25*k/bands*math.sin(a);(cx,_,cz),(rx,ry,rz)=BODY;x=cx+rx*math.sqrt(max(0,1-(y/ry)**2-((z-cz)/rz)**2))+.004;verts.append((x,y,z))
for k in range(bands):
 for i in range(seg):faces.append((k*seg+i,k*seg+(i+1)%seg,(k+1)*seg+(i+1)%seg,(k+1)*seg+i))
mesh_object('Light belly',verts,faces,belly,'body')
EYE=(.255,1.045)  # eye centre on the head side (x, z)
for side in [-1,1]:
 ex,ez=EYE
 side_patch('Eye rim '+str(side),HEAD,ex,ez,.150,.128,side,.004,navy,'eye_open_'+str(side))
 side_patch('Eye white '+str(side),HEAD,ex,ez,.128,.108,side,.008,cream,'eye_open_'+str(side))
 side_patch('Pupil '+str(side),HEAD,ex+.045,ez-.038,.052,.056,side,.012,pupil,'eye_open_'+str(side))
 # Heavy sleepy lid over the top half, with its own drawn lid line.
 side_patch('Sleepy lid '+str(side),HEAD,ex,ez-.004,.136,.122,side,.016,lid_green,'lid_'+str(side),half=True)
 side_patch('Lid line '+str(side),HEAD,ex,ez-.004,.140,.016,side,.019,navy,'lid_'+str(side))
 side_patch('Closed eye '+str(side),HEAD,ex,ez-.03,.115,.015,side,.022,navy,'eye_closed_'+str(side))
 side_patch('Cheek blush '+str(side),HEAD,ex-.10,ez-.17,.062,.048,side,.006,blush,'head')
 rod('Arm '+str(side),(.12,side*.20,.56),(.19,side*.205,.36),.058,leaf,'arm_'+str(side))
 rod('Leg '+str(side),(-.03,side*.15,.20),(.05,side*.18,.09),.085,leaf,'leg_'+str(side))
 ell('Foot '+str(side),(.13,side*.18,.062),(.175,.115,.062),leaf,'foot_'+str(side))
# Tiny forked tongue drawn as dark lines from the front of the round head.
tongue=[('Tongue stem',(.43,0,.885),(.54,0,.905)),('Tongue fork L',(.535,0,.905),(.585,-.032,.94)),('Tongue fork R',(.535,0,.905),(.585,.032,.94))]
for name,a,b in tongue:rod(name,a,b,.011,navy,'head',10)
# Soft rounded scallops along the back of the head, the back and onto the tail (no sharp spikes).
def scallop(name,shape,angle,length,width,bone,inset=.035):
 (cx,_,cz),(rx,ry,rz)=shape;t=math.radians(angle);px=cx+(rx-inset)*math.cos(t);pz=cz+(rz-inset)*math.sin(t)
 nx,nz=math.cos(t)/rx,math.sin(t)/rz;n=math.hypot(nx,nz);nx,nz=nx/n,nz/n
 ell(name,(px+nx*length*.35,0,pz+nz*length*.35),(length,.042,width),moss,bone,rot=-math.atan2(nz,nx),seg=20,rings=12)
for i,(angle,length,width) in enumerate([(100,.12,.085),(125,.135,.095),(150,.135,.095),(175,.12,.09)]):scallop(f'Head scallop {i+1}',HEAD,angle,length,width,'head')
for i,(angle,length,width) in enumerate([(165,.12,.09),(192,.115,.085),(218,.10,.075)]):scallop(f'Back scallop {i+1}',BODY,angle,length,width,'body')
# Smooth tapered tail resting on the ground, curving round to the side with a slightly raised tip.
verts=[];faces=[];nr=41;ns=20
for i in range(nr):
 t=i/(nr-1);x=-.10-.80*t;rad=(.13*(1-t)**.75+.022)*(math.sqrt(max(0,1-((t-.92)/.08)**2)) if t>.92 else 1);z=rad+.002+.16*(1-t)**6+.10*t**6;center_y=.16*math.sin(math.pi*t*.85)
 for k in range(ns):
  a=math.tau*k/ns;verts.append((x,center_y+rad*math.cos(a),z+rad*math.sin(a)))
for i in range(nr-1):
 for k in range(ns):faces.append((i*ns+k,i*ns+(k+1)%ns,(i+1)*ns+(k+1)%ns,(i+1)*ns+k))
faces.extend([tuple(reversed(range(ns))),tuple((nr-1)*ns+k for k in range(ns))]);tail=mesh_object('Tail',verts,faces,leaf,'tail1')
bm=bmesh.new();bm.from_mesh(tail.data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(tail.data);bm.free();tail.data.update()  # outward normals, so the outline sits outside
for i,(t,length) in enumerate([(.18,.085),(.38,.07)]):
 x=-.10-.80*t;rad=.13*(1-t)**.75+.022;z=rad+.002+.16*(1-t)**6+.10*t**6;cy=.16*math.sin(math.pi*t*.85)
 ell(f'Tail scallop {i+1}',(x,cy,z+rad*1.05),(length*.9,.036,length),moss,'tail1' if t<.3 else 'tail2',rot=0,seg=18,rings=10)
# Articulated body, separate eyes/lids, arms, feet and tail (18 bones, same names as v1).
ad=bpy.data.armatures.new('Sisi skeleton');arm=bpy.data.objects.new('Sisi rig',ad);bpy.context.collection.objects.link(arm);bpy.context.view_layer.objects.active=arm;arm.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
def bone(n,a,b,parent=None):
 o=ad.edit_bones.new(n);o.head=a;o.tail=b
 if parent:o.parent=ad.edit_bones[parent]
for b in [('root',(0,0,0),(0,0,.15),None),('body',(0,0,.2),(0,0,.66),'root'),('head',(0,0,.66),(0,0,1.25),'body'),('tail1',(-.16,0,.2),(-.42,0,.13),'root'),('tail2',(-.42,0,.13),(-.66,0,.09),'tail1'),('tail3',(-.66,0,.09),(-.88,0,.06),'tail2')]:bone(*b)
for side in [-1,1]:
 ex,ez=EYE;ey=on_surface(HEAD,ex,ez,side)
 bone('eye_open_'+str(side),(ex,ey,ez),(ex,ey+side*.08,ez),'head');bone('eye_closed_'+str(side),(ex,ey,ez),(ex,ey+side*.08,ez),'head');bone('lid_'+str(side),(ex,ey,ez+.05),(ex,ey+side*.08,ez+.05),'eye_open_'+str(side));bone('arm_'+str(side),(.12,side*.20,.58),(.19,side*.205,.34),'body');bone('leg_'+str(side),(-.03,side*.15,.20),(.05,side*.18,.09),'root');bone('foot_'+str(side),(.05,side*.18,.09),(.27,side*.18,.09),'leg_'+str(side))
bpy.ops.object.mode_set(mode='OBJECT');arm.select_set(False)
for o,b in parts:
 if o.name=='Tail':
  groups=[o.vertex_groups.new(name=f'tail{i}') for i in (1,2,3)]
  for v in o.data.vertices:
   t=max(0,min(2,(-v.co.x-.10)/.80*2));j=min(1,int(t));f=t-j;groups[j].add([v.index],1-f,'REPLACE');groups[j+1].add([v.index],f,'REPLACE')
 else:
  g=o.vertex_groups.new(name=b);g.add(list(range(len(o.data.vertices))),1,'REPLACE')
 mod=o.modifiers.new('Armature','ARMATURE');mod.object=arm;o.parent=arm
for side in [-1,1]:arm.pose.bones['eye_closed_'+str(side)].scale=(.001,.001,.001)
# Animation keys use rest-bone coordinates for world-directed motion.
bpy.context.preferences.edit.keyframe_new_interpolation_type='LINEAR';arm.animation_data_create()
def reset_pose():
 for p in arm.pose.bones:p.rotation_mode='XYZ';p.location=(0,0,0);p.rotation_euler=(0,0,0);p.scale=(.001,.001,.001) if p.name.startswith('eye_closed_') else (1,1,1)
def action(name,keys):
 arm.animation_data.action=None;reset_pose()
 for frame,changes in keys:
  for name_,field,value in changes:
   p=arm.pose.bones[name_]
   if field=='world_location':p.location=p.bone.matrix_local.to_3x3().inverted()@Vector(value);field='location'
   elif field=='world_rotation':
    axis,angle=value;q=Quaternion(Vector(axis),angle);rest=p.bone.matrix_local.to_quaternion();p.rotation_euler=(rest.inverted()@q@rest).to_euler();field='rotation_euler'
   else:setattr(p,field,value)
   p.keyframe_insert(data_path=field,frame=frame,group=name_)
 a=arm.animation_data.action;a.name=name;track=arm.animation_data.nla_tracks.new();track.name=name;track.strips.new(name,int(a.frame_range[0]),a);arm.animation_data.action=None
zero=(0,0,0); yaw=(0,0,1); pitch=(0,1,0)
def blink(amount):
 closed=max(0,min(1,-amount/.10));opened=max(.001,1-closed);shut=max(.001,closed)
 return [(f'eye_{kind}_{side}','scale',(value,value,value)) for side in [-1,1] for kind,value in [('open',opened),('closed',shut)]]
action('idle',[(1,[('head','world_rotation',(pitch,0)),*blink(0)]),(25,[('head','world_rotation',(pitch,.025)),*blink(0)]),(32,blink(-.10)),(40,blink(0)),(49,[('head','world_rotation',(pitch,0)),*blink(0)])])
walk=[]
for frame in [1,7,13,19,25,31,37,43,49]:
 changes=blink(0) if frame in (1,49) else []
 for side,offset in [(-1,0),(1,12)]:
  p=(frame-1+offset)%48
  if p<=12:x,z=-.04,0
  elif p<=24:t=(p-12)/12;x,z=-.04+.08*t,.055*math.sin(math.pi*t)
  elif p<=36:x,z=.04,0
  else:t=(p-36)/12;x,z=.04-.08*t,.055*math.sin(math.pi*t)
  changes.append(('leg_'+str(side),'world_location',(x,0,z)))
 changes.extend([('tail1','world_rotation',(yaw,.025*math.sin((frame-1)*math.tau/48))),('tail2','world_rotation',(yaw,.035*math.sin((frame-5)*math.tau/48))),('tail3','world_rotation',(yaw,.04*math.sin((frame-9)*math.tau/48)))])
 walk.append((frame,changes))
action('walk',walk)
action('greet',[(1,[('arm_-1','world_rotation',(pitch,0)),('head','world_rotation',(pitch,0)),*blink(0)]),(15,[('arm_-1','world_rotation',(pitch,-.5)),('head','world_rotation',(pitch,.06))]),(25,[('arm_-1','world_rotation',(pitch,-.38)),('head','world_rotation',(pitch,.02))]),(37,[('arm_-1','world_rotation',(pitch,0)),('head','world_rotation',(pitch,0)),*blink(0)])])
SLEEP_BODY=float(os.environ.get('SISI_SLEEP_BODY','.55'))
rest=[('body','world_rotation',(pitch,0)),('head','world_rotation',(pitch,0)),('tail1','world_rotation',(yaw,0)),('tail2','world_rotation',(yaw,0))]
curl=[('body','world_rotation',(pitch,SLEEP_BODY)),('head','world_rotation',(pitch,.16)),('tail1','world_rotation',(yaw,-.35)),('tail2','world_rotation',(yaw,-.38))]
action('sleep',[(1,[*rest,*blink(0)]),(30,[*curl,*blink(-.13)]),(60,[*curl,*blink(-.13)]),(90,[*rest,*blink(0)])])
reset_pose()
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'sisi.blend'));bpy.ops.object.select_all(action='DESELECT');arm.select_set(True)
for o,_ in parts:o.select_set(True)
bpy.context.view_layer.objects.active=arm;bpy.ops.export_scene.gltf(filepath=str(OUT/'sisi.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_apply=True)
# Ground check over every authored frame: the lowest evaluated vertex must stay on the ground.
scene=bpy.context.scene
for track in arm.animation_data.nla_tracks:track.mute=True
def lowest():
 dg=bpy.context.evaluated_depsgraph_get();low=9
 for o,_ in parts:
  e=o.evaluated_get(dg);m=e.to_mesh();w=e.matrix_world;low=min(low,min((w@v.co).z for v in m.vertices));e.to_mesh_clear()
 return low
for clip in ['idle','walk','greet','sleep']:
 reset_pose();arm.animation_data.action=bpy.data.actions[clip];a=bpy.data.actions[clip];lows=[]
 for frame in range(int(a.frame_range[0]),int(a.frame_range[1])+1,3):scene.frame_set(frame);lows.append(lowest())
 print(f'SISI_GROUND {clip} min={min(lows):.4f} max={max(lows):.4f}')
# Preview renders in the same drawing look as the runtime (toon fills and navy outline).
arm.animation_data.action=None;reset_pose()
scene.world.use_nodes=True
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,0));floor=bpy.context.object;floor.name='PREVIEW floor';floor.data.materials.append(floor_mat)
toon_preview.apply([o for o,_ in parts],width=.02);toon_preview.setup_render(scene,640)
def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
def lamp(pos,power,size):
 bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.name='PREVIEW lamp';o.data.energy=power;o.data.shape='DISK';o.data.size=size;aim(o,(0,0,.65))
lamp((3,-3,5),130,4);lamp((-3,3,4),90,3)
bpy.ops.object.camera_add();cam=bpy.context.object;cam.name='PREVIEW camera';cam.data.type='ORTHO';cam.data.ortho_scale=2.2;scene.camera=cam
def render(name,loc,target=(-.12,0,.66)):
 cam.location=loc;aim(cam,target);scene.render.filepath=str(OUT/name);bpy.ops.render.render(write_still=True)
render('front.png',(6,0,1.4));render('profile.png',(0,-6,1.4));render('back.png',(-6,0,1.4));render('three-quarter.png',(5,-5,2.5))
for clip,frames in [('walk',[1,7,13,19,25,31,37,43,49]),('greet',[1,15,25,37]),('sleep',[1,30,60,90]),('idle',[1,32,49])]:
 reset_pose();arm.animation_data.action=bpy.data.actions[clip]
 for frame in frames:
  scene.frame_set(frame);cam.data.ortho_scale=2.45 if clip=='sleep' else 2.2;render(f'{clip}-{frame:02d}.png',(0,-6,1.4),(.10,0,.66) if clip=='sleep' else (-.12,0,.66))
# Transparent sleeping still for the reduced-motion film cameo, in the same drawing look.
reset_pose();arm.animation_data.action=bpy.data.actions['sleep'];scene.frame_set(60);floor.hide_render=True
scene.render.film_transparent=True;scene.render.image_settings.color_mode='RGBA';scene.render.resolution_x=scene.render.resolution_y=512;cam.data.ortho_scale=2.35
cam.location=(5,-5,2.5);aim(cam,(.05,0,.55));scene.render.filepath=str(OUT/'film-sleep.png');bpy.ops.render.render(write_still=True)
