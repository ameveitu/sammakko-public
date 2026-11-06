import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { styleCharacter } from './character-style.js';
import { mountSaaristo } from './saaristo/main';
import { finaleDirectionAt } from '../content/finale-direction';
import { buildFinaleSet } from './finale-sets';

function release(object) {
  const resources=new Set();
  object?.traverse(o=>{if(o.geometry)resources.add(o.geometry);if(o.skeleton)resources.add(o.skeleton);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){resources.add(m);for(const v of Object.values(m))if(v?.isTexture)resources.add(v);}});
  for(const resource of resources)resource.dispose();object?.removeFromParent();
}

/** One shared Saaristo renderer, driven by the film clock; no evidence, save, input or scoring dependency. */
export function mountFinaleCinema(container,options={}) {
  const base=new URL(import.meta.env.BASE_URL,location.href),url=path=>new URL(path,base).href;
  let disposed=false,status='loading',seconds=0,still=false,currentSet=null,lastDirection=null;
  const actors=new Map(),controller=new AbortController(),loader=new GLTFLoader();
  const setStatus=next=>{if(disposed)return;status=next;container.dataset.cinema=next;options.onStatus?.(next);};
  const world=mountSaaristo({container,assets:{world:url('world/saaristo'),characters:url('characters')},interactive:false,paused:true,onStatus:next=>{if(next.status==='fallback')setStatus('fallback');}});
  world.setWorkMode(true);world.setPaused(true);world.setCharactersVisible(false);
  const cast=new THREE.Group();cast.name='film-cast';cast.position.z=6;world.scene?.add(cast);
  const billPrototype=new THREE.Group();billPrototype.name='child-bill-only';

  function makeBabyBill(model) {
    const originals=[];model.updateMatrixWorld(true);
    model.traverse(o=>{if(o.isMesh&&/^(Upper|Lower)[ _]bill$/.test(o.name))originals.push(o);});
    if(originals.length!==2)throw Error('The final image requires the two original Aava bill parts.');
    const bounds=new THREE.Box3(),point=new THREE.Vector3();
    const copies=originals.map(original=>{
      const geometry=original.geometry.clone(),positions=geometry.getAttribute('position');
      for(let i=0;i<positions.count;i++){original.getVertexPosition(i,point).applyMatrix4(original.matrixWorld);positions.setXYZ(i,point.x,point.y,point.z);bounds.expandByPoint(point);}
      positions.needsUpdate=true;geometry.computeVertexNormals();
      const copy=new THREE.Mesh(geometry,original.material.clone());copy.name=original.name;return copy;
    });
    const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3()),scale=.32/Math.max(size.x,size.z);
    for(const copy of copies){copy.geometry.translate(-center.x,-center.y,-center.z);copy.geometry.scale(scale,scale,scale);billPrototype.add(copy);}
  }
  async function load(candidate) {
    const response=await fetch(url(`models/characters/${candidate.file}`),{signal:controller.signal});if(!response.ok)throw Error('film character unavailable');
    const bytes=await response.arrayBuffer();if(bytes.byteLength!==candidate.bytes||bytes.byteLength>3_000_000)throw Error('film character size mismatch');
    const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('');if(digest!==candidate.sha256)throw Error('film character hash mismatch');
    const gltf=await loader.parseAsync(bytes,url('models/characters/'));
    if(disposed||controller.signal.aborted){release(gltf.scene);return;}
    const model=styleCharacter(gltf.scene),bounds=new THREE.Box3().setFromObject(model,true),height=bounds.max.y-bounds.min.y;
    const target=candidate.id==='sisi'?.68:candidate.id==='sulka'?2.3:candidate.id==='aava'?1.82:1.75;
    if(!Number.isFinite(height)||height<=0)throw Error('invalid film character bounds');
    model.scale.multiplyScalar(target/height);model.position.y=-bounds.min.y*target/height;model.rotation.y=candidate.facing;
    const holder=new THREE.Group();holder.name=`adult:${candidate.id}`;holder.add(model);cast.add(holder);
    const mixer=new THREE.AnimationMixer(model);const clips=new Map(gltf.animations.map(clip=>[clip.name,clip]));
    const bones=new Map();model.traverse(o=>{if(o.isBone)bones.set(o.name,o);});
    actors.set(candidate.id,{holder,model,mixer,clips,bones,clip:null,action:null});
    if(candidate.id==='aava')makeBabyBill(model);
  }
  function setActor(actor,pose,direction){
    actor.holder.visible=!!pose;if(!pose)return;
    actor.holder.position.fromArray(pose.position);actor.holder.rotation.y=pose.yaw;
    actor.model.traverse(object=>{if(object.isMesh)object.visible=true;});
    const clip=actor.clips.get(pose.clip)??actor.clips.get('idle');
    if(actor.clip!==clip){actor.mixer.stopAllAction();actor.clip=clip;actor.action=actor.mixer.clipAction(clip).reset().play();}
    actor.mixer.setTime(pose.time);
    // A bounded, deliberately held embrace, with no accumulated rotation on seeking.
    if(direction.art==='embrace'){
      for(const name of pose.id==='aava'?['wing_1','wing_-1']:['arm_1','arm_-1']){
        const bone=actor.bones.get(name);if(bone)bone.rotation.x+=(name.endsWith('-1')?-1:1)*direction.props.embrace*.24;
      }
    }
  }
  function setTime(time,reducedMotion=false){
    if(disposed)return;seconds=Number.isFinite(time)?time:0;still=!!reducedMotion;
    const direction=finaleDirectionAt(seconds,still);lastDirection=direction;
    if(!world.scene||world.state.lost)return;
    if(currentSet?.kind!==direction.set){
      currentSet?.dispose();currentSet={kind:direction.set,...buildFinaleSet(direction.set)};world.scene.add(currentSet.root);
      if(currentSet.named.bill){for(const source of billPrototype.children){const copy=new THREE.Mesh(source.geometry.clone(),source.material.clone());copy.name=source.name;styleCharacter(copy,{outline:.008});currentSet.named.bill.add(copy);}}
    }
    currentSet.update(direction);
    for(const [id,actor] of actors)setActor(actor,direction.actors.find(p=>p.id===id),direction);
    // No transparent overlap with the ship hull: the pilot's window is a separate small portrait stage.
    if(['hatch','departure'].includes(direction.art)){
      const pilot=actors.get('loikka');if(pilot){pilot.holder.position.set(2.75,1.7,-.63);pilot.holder.scale.setScalar(.58);pilot.model.traverse(object=>{if(object.isMesh&&/^(Body|Belly|Leg|Foot|Toe)/.test(object.name))object.visible=false;});}
    }else if(actors.has('loikka'))actors.get('loikka').holder.scale.setScalar(1);
    world.setAtmosphere(direction.atmosphere);world.setBackdropVisible(direction.backdrop);world.setCameraPose(direction.camera);
    world.renderAt(still?0:direction.time);
  }
  const ready=(async()=>{
    if(!world.scene||world.state.lost){setStatus('fallback');return false;}
    try{
      const response=await fetch(url('models/characters/manifest.json'),{signal:controller.signal});if(!response.ok)throw Error('film cast manifest unavailable');
      const manifest=await response.json();const selected=['aava','loikka','sulka','sisi'].map(id=>manifest.candidates.find(c=>c.id===id));if(selected.some(c=>!c))throw Error('film cast incomplete');
      await Promise.all(selected.map(load));if(disposed||world.state.lost)return false;
      // Recreate the egg insert if a direct jump happened before the cast finished loading.
      currentSet?.dispose();currentSet=null;setTime(seconds,still);setStatus('ready');return true;
    }catch(error){controller.abort();if(!disposed)setStatus('fallback');return false;}
  })();
  function dispose(){
    if(disposed)return;disposed=true;controller.abort();currentSet?.dispose();currentSet=null;
    for(const actor of actors.values()){actor.mixer.stopAllAction();actor.mixer.uncacheRoot(actor.model);release(actor.holder);}actors.clear();release(billPrototype);cast.removeFromParent();world.dispose();
  }
  return {ready,setTime,dispose,snapshot(){return{status:world.state.lost?'fallback':status,time:seconds,reducedMotion:still,set:currentSet?.kind??null,art:lastDirection?.art??null,shotStart:lastDirection?.shotStart??null,
    camera:lastDirection?.camera??null,atmosphere:world.state.atmosphere,worldTime:world.state.time??0,frames:world.state.frames,
    actors:[...actors.entries()].filter(([,actor])=>actor.holder.visible).map(([id,actor])=>({id,clip:actor.clip?.name,position:actor.holder.position.toArray(),time:actor.action?.time??0})),
    babyParts:currentSet?.named.bill?.visible?currentSet.named.bill.children.map(o=>o.name):[],props:lastDirection?.props??null};}};
}
