import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { styleCharacter } from './character-style.js';
import { AUTHORED_CLIMAX_IDS, authoredClimaxes, hasAuthoredClimax, climaxPhase, climaxPhaseText } from '../content/authored-climaxes';

/** Six-second idealized cart view: constant speed until the marked brake zone,
 * then constant opposing acceleration. Metres here describe this illustrative model. */
export function brakingMotion(progress) {
 const p=Math.max(0,Math.min(1,progress)), t=p*6, tBrake=22/9, v=.9, a=-.9/(6-tBrake);
 if(t<=tBrake)return {position:-2+v*t,velocity:v,acceleration:0,braking:false};
 const dt=t-tBrake;return {position:.2+v*dt+.5*a*dt*dt,velocity:Math.max(0,v+a*dt),acceleration:p<1?a:0,braking:p<1};
}

/** A visual epilogue only: it never records evidence, events, or mastery. */
export function mountAuthoredClimax(world, options={}) {
 const scene=world.scene, active=new THREE.Group(), memory=new THREE.Group();
 active.name='authored-climax';memory.name='authored-climax-memory';scene?.add(active,memory);
 const materials={wood:new THREE.MeshStandardMaterial({color:0x765039,roughness:.9}),light:new THREE.MeshStandardMaterial({color:0xc59a62,roughness:.8}),blue:new THREE.MeshStandardMaterial({color:0x4a9baf,roughness:.55}),cream:new THREE.MeshStandardMaterial({color:0xf0e8c8,roughness:.85}),red:new THREE.MeshStandardMaterial({color:0xb75d4d,roughness:.8}),dark:new THREE.MeshStandardMaterial({color:0x344d50,roughness:.8}),green:new THREE.MeshStandardMaterial({color:0x589977,roughness:.9}),gold:new THREE.MeshStandardMaterial({color:0xe3b65a,roughness:.6}),lamp:new THREE.MeshStandardMaterial({color:0xffdc88,emissive:0xffb63f,emissiveIntensity:.6,roughness:.5}),glass:new THREE.MeshStandardMaterial({color:0x79b6bb,transparent:true,opacity:.40,depthWrite:false,roughness:.2})};
 let disposed=false,paused=false,story=null,elapsed=0,model=null,objects={},loaderToken=0,controller=null,actors=[],mixers=[],status=scene?'ready':'fallback';
 const restored=new Map();
 const box=(g,x,y,z,w,h,d,mat='wood')=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),materials[mat]);o.position.set(x,y,z);g.add(o);return o;};
 const ball=(g,x,y,z,r,mat='gold')=>{const o=new THREE.Mesh(new THREE.SphereGeometry(r,16,10),materials[mat]);o.position.set(x,y,z);g.add(o);return o;};
 function rod(g,a,b,r=.035,mat='dark') {const v=new THREE.Vector3(...a),w=new THREE.Vector3(...b),d=w.clone().sub(v),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),10),materials[mat]);o.position.copy(v.add(w).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(o);return o;}
 function clearGeometry(group){if(!group)return;group.traverse(o=>{o.geometry?.dispose();});group.clear();}
 function releaseModel(o){const resources=new Set();o?.traverse(n=>{if(n.geometry)resources.add(n.geometry);if(n.skeleton)resources.add(n.skeleton);for(const m of (Array.isArray(n.material)?n.material:[n.material])){if(!m)continue;for(const v of Object.values(m))if(v?.isTexture)resources.add(v);resources.add(m);}});for(const r of resources){r.dispose?.();r.source?.data?.close?.();}o?.removeFromParent();}
 function cylinder(g,x,y,z,rt,rb,h,mat='wood'){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,24),materials[mat]);o.position.set(x,y,z);g.add(o);return o;}
 function skiff(g){
  const v=[[-.92,.51,0],[-.55,.51,-.38],[.55,.51,-.38],[.92,.51,0],[.55,.51,.38],[-.55,.51,.38],[-.60,.31,0],[.60,.31,0]];
  const faces=[[0,1,6],[1,2,7],[1,7,6],[2,3,7],[3,4,7],[4,5,6],[4,6,7],[5,0,6],[6,7,4],[6,4,5]];
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(faces.flatMap(face=>face.flatMap(i=>v[i])),3));geometry.computeVertexNormals();const hull=new THREE.Mesh(geometry,materials.wood);hull.material.side=THREE.DoubleSide;g.add(hull);
  for(const z of [-.30,.30])rod(g,[-.53,.54,z],[.53,.54,z],.035,'light');box(g,0,.54,0,.18,.07,.65,'light');
 }
 function platform(g){box(g,0,0,0,6,.24,3,'wood');for(let i=0;i<8;i++)box(g,-2.62+i*.75,.14,0,.70,.035,2.86,i%2?'wood':'light');for(const z of [-1.46,1.46])box(g,0,.15,z,6,.06,.08,'gold');}
 // Each fixture has a distinct physical silhouette and a separately animated causal element.
 function fixture(g,type,finished=false,input=null){
  const o={};
  switch(type){
   case 'channel':
    for(const [i,x] of [-1.6,0].entries()){box(g,x,.31,-.3,1.25,.22,.62,'wood');const share=input?.kind==='cake-shares'?[input.left,input.right][i]:null;if(share&&Number.isSafeInteger(share[0])&&Number.isSafeInteger(share[1])&&share[1]>0&&share[0]>=0&&share[0]<=share[1]){const water=box(g,x-.525,.44,-.3,1.05,.05,.42,'blue');water.scale.x=share[0]/share[1];water.position.x=x-.525+1.05*water.scale.x/2;}}box(g,.25,.30,.65,4.3,.18,.55,'wood');o.flow=box(g,.25,.42,.65,4.1,.07,.34,'blue');o.flow.scale.x=finished?1:.01;o.streams=[];for(const x of [-1.6,0]){const stream=rod(g,[x,.44,-.04],[x,.44,.65],.035,'blue');stream.visible=finished;o.streams.push(stream);}o.parts=[];for(let i=0;i<4;i++)o.parts.push(rod(g,[1.35,.33+i*.09,-.55],[2.18,.33+i*.09,-.55],.05,'light'));break;
   case 'crate':
    const dims=input?.kind==='volume'&&Array.isArray(input.dimensions)&&input.dimensions.length===3&&input.dimensions.every(n=>Number.isInteger(n)&&n>0&&n<=5)?input.dimensions:null;
    box(g,0,.24,0,2.2,.14,1.6,'wood');o.parts=[];
    if(dims){const [nx,nz,ny]=dims,unit=Math.min(.43,2/nx,1.4/nz,1.5/ny);for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)for(let z=0;z<nz;z++)o.parts.push(box(g,(x-(nx-1)/2)*unit,.32+(y+.5)*unit,(z-(nz-1)/2)*unit,unit*.94,unit*.94,unit*.94,(x+y+z)%2?'blue':'cream'));}
    else {box(g,0,.65,0,2,.72,1.4,'wood');o.lid=box(g,0,finished?1.04:1.75,0,2.08,.08,1.48,'light');}break;
   case 'map':
    box(g,0,.27,0,4,.1,2,'cream');rod(g,[-1.55,.36,.22],[-.55,.36,-.18],.035,'green');rod(g,[-.55,.36,-.18],[.45,.36,.16],.035,'green');rod(g,[.45,.36,.16],[1.55,.36,-.2],.035,'green');ball(g,1.55,.4,-.2,.13,'red');
    o.carrier=new THREE.Group();g.add(o.carrier);o.carrier.position.set(-1.35,.38,.15);box(o.carrier,0,0,0,1.2,.13,.6,'wood');for(const x of [-.48,.48])rod(o.carrier,[x,.08,-.22],[x,.27,-.22],.025,'light');break;
   case 'brake':
    for(const z of [-.42,.42])rod(g,[-2.5,.36,z],[2.5,.36,z],.05);box(g,1,.30,0,1.6,.055,1.08,'red');for(const x of [.3,.7,1.1,1.5])box(g,x,.335,0,.06,.012,1.0,'cream');box(g,2.35,.60,0,.16,.55,1,'dark');o.cart=new THREE.Group();g.add(o.cart);box(o.cart,0,.65,0,.8,.45,.8,'blue');for(const x of [-.28,.28])for(const z of [-.43,.43])ball(o.cart,x,.35,z,.13,'dark');o.brakeArrow=new THREE.Group();o.cart.add(o.brakeArrow);rod(o.brakeArrow,[.25,1.2,0],[-.55,1.2,0],.035,'red');const tip=new THREE.Mesh(new THREE.ConeGeometry(.11,.2,12),materials.red);tip.rotation.z=Math.PI/2;tip.position.set(-.58,1.2,0);o.brakeArrow.add(tip);o.brakeArrow.visible=false;break;
   case 'boat':
    box(g,0,.24,0,4,.06,2,'blue');o.boat=new THREE.Group();g.add(o.boat);skiff(o.boat);o.oar=new THREE.Group();o.oar.position.set(.05,.86,0);o.boat.add(o.oar);rod(o.oar,[0,0,0],[.7,-.56,.45],.04,'light');const paddle=box(o.oar,.70,-.57,.45,.27,.04,.19,'light');paddle.rotation.y=-.45;o.ripple=new THREE.Mesh(new THREE.RingGeometry(.17,.205,32),materials.cream);o.ripple.rotation.x=-Math.PI/2;o.ripple.position.set(-1,.33,.8);g.add(o.ripple);break;
   case 'circuit':
    box(g,0,.27,0,4,.08,2,'cream');for(const z of [-.65,0,.65])rod(g,[-1.5,.37,z],[1.5,.37,z],.04);for(const x of [-1.5,1.5])rod(g,[x,.37,-.65],[x,.37,.65],.04);box(g,0,.43,0,.48,.16,.3,'dark');
    for(const x of [-2.2,2.2]){box(g,x,.30,0,.55,.12,1.8,'wood');for(const z of [-.65,.65])rod(g,[x,.35,z],[x,.75,z],.035,'light');}o.parts=[ball(g,-1.05,.48,-.65,.17,'lamp'),ball(g,1.05,.48,.65,.17,'lamp')];break;
   case 'safety':
    box(g,-1,.3,0,2.4,.1,1.5,'green');for(const [x,z] of [[-1.7,-.35],[-.8,.25],[-.35,-.35]]){rod(g,[x,.35,z],[x,1,z],.07,'wood');ball(g,x,1.15,z,.28,'green');}box(g,1.5,.31,0,1.4,.13,1,'cream');rod(g,[1.5,.35,0],[1.5,1.2,0],.035,'light');o.sign=box(g,1.5,1.25,0,.9,.42,.08,'blue');break;
   case 'sail':
    box(g,0,.37,0,2.2,.25,.9,'wood');rod(g,[0,.5,0],[0,2,0],.045,'dark');o.sail=new THREE.Mesh(new THREE.ConeGeometry(.7,1.3,3),materials.cream);o.sail.rotation.z=-Math.PI/2;o.sail.scale.z=.06;o.sail.position.set(.53,1.27,0);g.add(o.sail);break;
   case 'lighthouse':
    {cylinder(g,0,.87,0,.48,.63,1.25,'cream');cylinder(g,0,.36,0,.62,.64,.18,'red');cylinder(g,0,1.32,0,.50,.51,.16,'red');cylinder(g,0,1.53,0,.64,.64,.10,'dark');
    ball(g,0,1.8,0,.22,'lamp');cylinder(g,0,1.77,0,.35,.35,.40,'glass');for(const [x,z] of [[-.37,0],[.37,0],[0,-.37],[0,.37]])rod(g,[x,1.58,z],[x,2.02,z],.025,'dark');cylinder(g,0,2.01,0,.50,.50,.08,'dark');
    for(const y of [.65,1.05]){box(g,0,y,.57,.25,.32,.025,'dark');box(g,0,y,.59,.17,.23,.03,'gold');}
    o.roof=new THREE.Mesh(new THREE.ConeGeometry(.62,.65,32),materials.red);o.roof.position.y=finished?2.36:3.1;g.add(o.roof);}break;
   case 'tower':
    o.parts=[];for(let y=0;y<3;y++)for(let x=0;x<2;x++){box(g,(x-.5)*.8,.38+y*.52,0,.7,.1,.7,'wood');o.parts.push(ball(g,(x-.5)*.8,.65+y*.52,0,.18,'lamp'));}break;
   case 'stars':
    box(g,0,.29,0,3.8,.12,2.1,'dark');o.parts=[];for(let i=0;i<18;i++){const a=i*2.4,r=.15+i*.075;o.parts.push(ball(g,Math.cos(a)*r,.43,Math.sin(a)*r*.65,.035+(i%3)*.013,'gold'));}ball(g,0,.47,0,.16,'blue');break;
   case 'notebook':
    box(g,0,.29,0,3,.12,1.8,'cream');box(g,-.65,.38,-.22,.8,.025,.52,'blue');o.parts=[box(g,.50,.38,.22,1,.025,.52,'gold')];rod(g,[-1.2,.42,.6],[-.3,.42,.6],.035,'dark');break;
  }
  if(o.parts) for(const part of o.parts)part.visible=finished;
  if(o.sail)o.sail.position.y=finished?1.27:.60;
  if(o.cart)o.cart.position.x=finished?1.8:-2;
  if(o.boat)o.boat.position.x=finished?1.1:-1.5;
  return o;
 }
 function apply(){if(!story)return;const t=Math.max(0,Math.min(1,(elapsed-2000)/6000));
  if(objects.parts) objects.parts.forEach((part,i)=>{part.visible=t>=(i+1)/(objects.parts.length+1);});
  if(objects.flow)objects.flow.scale.x=Math.max(.01,t);
  if(objects.streams)for(const stream of objects.streams)stream.visible=t>0;
  if(objects.sail)objects.sail.position.y=.60+t*.67;
  if(objects.roof)objects.roof.position.y=3.1-t*.74;
  if(objects.lid)objects.lid.position.y=1.75-t*.71;
  if(objects.cart){const motion=brakingMotion(t);objects.cart.position.x=motion.position;objects.brakeArrow.visible=motion.braking;}
  if(objects.carrier)objects.carrier.position.x=-1.35+t*2.7;
  if(objects.boat){objects.boat.position.x=-1.5+t*2.6;objects.oar.rotation.z=.2*Math.sin(t*Math.PI*3);objects.ripple.scale.x=.4+t;}
  world.invalidate();
 }
 async function loadActor(character){
  if(!scene||!options.characterBase||world.state?.lost){world.setCharactersVisible?.(true);status='fallback';return;}
  const token=++loaderToken;controller=new AbortController();status='loading';
  const names=['circuit','map','stars'].includes(story.fixture)?['aava','loikka']:[character];
  const load=async name=>{const base=new URL(options.characterBase,globalThis.document?.baseURI??'http://localhost/');const url=new URL(`${name}/${name}.glb`,base.href.endsWith('/')?base.href:base.href+'/').href;const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error('character');const data=await response.arrayBuffer();if(data.byteLength>=3_000_000)throw Error('budget');return {name,gltf:await new GLTFLoader().parseAsync(data,new URL('.',url).href)};};
  const results=await Promise.allSettled(names.map(load));
  if(disposed||token!==loaderToken||!story||world.state?.lost||results.some(r=>r.status==='rejected')){for(const r of results)if(r.status==='fulfilled')releaseModel(r.value.gltf.scene);if(token===loaderToken&&!disposed){status='fallback';world.setCharactersVisible?.(true);}return;}
  for(const [index,result] of results.entries()){
   const {name,gltf}=result.value,actor=styleCharacter(gltf.scene),bounds=new THREE.Box3().setFromObject(actor,true),height=bounds.max.y-bounds.min.y;
   if(!Number.isFinite(height)||height<=0){releaseModel(actor);status='fallback';continue;}
   const onCarrier=story.fixture==='map'&&objects.carrier;const scale=(onCarrier ? .55 : .95)/height;actor.scale.setScalar(scale);if(onCarrier){actor.position.set(index===0?-.35:.35,.065-bounds.min.y*scale,0);actor.rotation.y=-.4;objects.carrier.add(actor);}else{actor.position.set(index===0?-2.35:2.35,.16-bounds.min.y*scale,1.0);actor.rotation.y=index===0?-.4:Math.PI+.4;active.add(actor);}actors.push(actor);
   const mixer=new THREE.AnimationMixer(actor),clip=gltf.animations.find(c=>c.name===(name==='aava'?'point':name==='loikka'?'wave':'gesture'))??gltf.animations.find(c=>c.name==='idle');if(clip){const action=mixer.clipAction(clip);action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;action.play();mixer.setTime(Math.max(0,(elapsed-2000)/1000));}mixers.push(mixer);
  }
  if(actors.length!==names.length){for(const actor of actors)releaseModel(actor);actors=[];mixers=[];status='fallback';world.setCharactersVisible?.(true);}else status='ready';world.invalidate();
 }
 function clear(){loaderToken++;controller?.abort();controller=null;for(const [i,mixer] of mixers.entries()){mixer.stopAllAction();if(actors[i])mixer.uncacheRoot(actors[i]);}for(const actor of actors)releaseModel(actor);actors=[];mixers=[];clearGeometry(active);story=null;model=null;objects={};elapsed=0;world.setCharactersVisible?.(true);if(!disposed){world.setActivityFocus?.(false,{target:[.6,.7,6],span:10});world.invalidate();}}
 function play(id,settings={}){if(disposed||!hasAuthoredClimax(id))return false;clear();story=authoredClimaxes[id];model=settings.lessonModel??null;elapsed=0;status=scene?'ready':'fallback';if(scene){world.setCharactersVisible?.(false);active.position.set(.6,.2,6);platform(active);objects=fixture(active,story.fixture,false,model);world.setActivityFocus?.(true,{target:[.6,.9,6],span:7.5});apply();void loadActor(story.character);}return true;}
 function advanceTime(ms){if(disposed||paused||!story||options.reducedMotion||world.state?.lost||globalThis.document?.hidden||!Number.isFinite(ms)||ms<=0)return;const delta=Math.min(ms,10000-elapsed);elapsed+=delta;for(const mixer of mixers)mixer.setTime(Math.max(0,(elapsed-2000)/1000));apply();}
 function skipToEnd(){if(disposed||!story)return;elapsed=10000;for(const mixer of mixers)mixer.setTime(8);apply();}
 function restoreEffects(ids){if(disposed)return;const desired=new Set(ids.filter(x=>typeof x==='string'));for(const [id,g] of restored)if(!desired.has(id)){clearGeometry(g);g?.removeFromParent();restored.delete(id);}for(const id of AUTHORED_CLIMAX_IDS){const s=authoredClimaxes[id];if(!desired.has(s.worldEffectId)||restored.has(s.worldEffectId))continue;if(!scene){restored.set(s.worldEffectId,null);continue;}const g=new THREE.Group();const i=AUTHORED_CLIMAX_IDS.indexOf(id);g.position.set(-2.8+(i%6)*1.05,.12,-1.5+Math.floor(i/6)*.8);g.scale.setScalar(.22);fixture(g,s.fixture,true);memory.add(g);restored.set(s.worldEffectId,g);}world.invalidate();}
 return {play,advanceTime,setPaused(value){paused=!!value;},skipToEnd,restoreEffects,clear,snapshot(){return {activeNode:story?.id??null,elapsed,duration:story?.durationMs??0,remaining:story?Math.max(0,story.durationMs-elapsed):0,phase:story?climaxPhase(elapsed):null,phaseText:story?climaxPhaseText(story,elapsed):'',renderer:!scene||world.state?.lost?'fallback':'webgl',characterStatus:status,fixtures:[...restored.keys()].sort(),lessonModelKind:model?.kind??null};},dispose(){if(disposed)return;clear();disposed=true;for(const g of restored.values())clearGeometry(g);restored.clear();memory.removeFromParent();active.removeFromParent();for(const m of Object.values(materials))m.dispose();world.setActivityFocus?.(false,{target:[.6,.7,6],span:10});world.invalidate();}};
}
