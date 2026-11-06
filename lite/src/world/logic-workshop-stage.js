import * as THREE from 'three';

/** The geometry follows the learner's settings. It never decides correctness. */
export function logicTroughPoint(progress,direction,release=1){
  const p=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0)),turn=direction==='left'?-1:1;
  return {x:turn*2.05*p*p,y:.42+(1-p)*release*.15,z:-1.15+2.3*p};
}
/** A straight frictionless incline, world scale 0.45 units/metre. Its actual arclength is 0.45*length. */
export function logicDryPoint(progress,direction,release,length){
  const p=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0)),sine=release/10,scale=.45;
  const horizontal=length*Math.sqrt(1-sine*sine)*scale,drop=length*sine*scale;
  return {x:(direction==='left'?-1:1)*horizontal*Math.sqrt(3)/2*p,y:.42+drop*(1-p),z:-1.1+horizontal/2*p};
}
/** Upward normal to the straight incline; the bead touches the round wooden rail. */
export function logicDryNormal(direction,release){
  const sine=release/10;
  return {x:(direction==='left'?-1:1)*sine*Math.sqrt(3)/2,y:Math.sqrt(1-sine*sine),z:sine/2};
}
export function mountLogicWorkshopStage(parent,model){
  const root=new THREE.Group();root.name='logic-workshop';parent.add(root);
  const materials={wood:new THREE.MeshStandardMaterial({color:0x99754f,roughness:.96}),water:new THREE.MeshStandardMaterial({color:0x76b8b3,roughness:.35}),
    leaf:new THREE.MeshStandardMaterial({color:0xc4d578,roughness:.9}),dark:new THREE.MeshStandardMaterial({color:0x355650,roughness:.9}),
    coral:new THREE.MeshStandardMaterial({color:0xc98d72,roughness:.95}),paper:new THREE.MeshStandardMaterial({color:0xeee5c6,roughness:.95})};
  const mesh=(geometry,material,x,y,z)=>{const m=new THREE.Mesh(geometry,materials[material]);m.position.set(x,y,z);root.add(m);return m;};
  const box=(x,y,z,w,h,d,material)=>mesh(new THREE.BoxGeometry(w,h,d),material,x,y,z);
  const line=(a,b,r,material)=>{const from=new THREE.Vector3(a.x,a.y,a.z),to=new THREE.Vector3(b.x,b.y,b.z),delta=to.clone().sub(from),m=mesh(new THREE.CylinderGeometry(r,r,delta.length(),8),material,...from.clone().add(to).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;};
  let elapsed=0,moving;
  const point=(p,direction=model.direction)=>model.apparatus==='dry'?logicDryPoint(p,direction,model.release,model.length):logicTroughPoint(p,direction,model.release);
  if(model.mode==='cause'){
    for(const direction of ['left','right']){
      const end=point(1,direction),basin=mesh(new THREE.CylinderGeometry(.4,.36,.12,24),model.apparatus==='water'?'water':'paper',end.x,.25,end.z);
      basin.userData.destination=direction;
    }
    for(let i=0;i<24;i++){
      const a=point(i/24),b=point((i+1)/24);
      line(a,b,.16,model.apparatus==='water'?'water':'wood');
      for(const offset of [-.18,.18])line({...a,x:a.x+offset,y:a.y+.08},{...b,x:b.x+offset,y:b.y+.08},.04,'wood');
    }
    moving=mesh(model.apparatus==='water'?new THREE.SphereGeometry(.18,12,8):new THREE.SphereGeometry(.14,16,12),model.apparatus==='water'?'leaf':'coral',0,0,0);
    if(model.apparatus==='water')moving.scale.set(.65,.3,1.6);
  }else{
    const deck=box(0,.25,0,5,.15,1.4,'wood');deck.userData.dock=true;
    model.objects.forEach((o,i)=>{
      const x=(i-(model.objects.length-1)/2)*1.15;
      const heightScale=o.heightScale??1;
      const geometry=o.shape==='sphere'?new THREE.SphereGeometry(.28,16,12):o.shape==='cone'?new THREE.ConeGeometry(.3,.58,16):new THREE.BoxGeometry(.48,.48*heightScale,.48);
      const object=mesh(geometry,({round:'coral',square:'leaf',point:'paper',extra:'dark'})[o.id]??'paper',x,.4+.24*heightScale,0);object.userData.identity=o.id;
      if(o.id==='extra'){for(const z of [-.247,.247])box(x,.66,z,.48,.09,.014,'paper');}
      if(!model.blocks){box(x,.41,-.55,.08,.3,.08,'dark');line({x,y:.42,z:0},{x,y:.38,z:-.5},.025,'dark');}
    });
    root.rotation.y=model.view==='water'?Math.PI:0;
  }
  const duration=model.mode==='cause'&&model.observation?Math.min(6000,model.observation.durationMs):0;
  function pose(){
    if(!moving)return;
    // Physical time is scaled into at most six seconds of presentation, preserving route and endpoint.
    const t=duration?Math.min(1,elapsed/duration):0,progress=model.apparatus==='dry'?t*t:t;
    const p=point(progress);
    if(model.apparatus==='dry'){
      const n=logicDryNormal(model.direction,model.release),contact=.16+.14;
      moving.position.set(p.x+contact*n.x,p.y+contact*n.y,p.z+contact*n.z);
    }else moving.position.set(p.x,p.y+.16,p.z);
    moving.rotation.y=(model.direction==='left'?-1:1)*Math.atan(4.1*progress/2.3);
  }
  pose();
  return {advanceTime(ms){if(Number.isFinite(ms)&&ms>=0){elapsed=Math.min(duration,elapsed+ms);pose();}},snapshot(){return {
    kind:'logic-workshop',mode:model.mode,...(model.mode==='cause'?{apparatus:model.apparatus,direction:model.direction,release:model.release,observed:!!model.observation,elapsed,duration,position:moving.position.toArray()}: {view:model.view,objects:model.objects.map(o=>o.id),rotation:root.rotation.y})
  };},dispose(){root.traverse(o=>o.geometry?.dispose());Object.values(materials).forEach(m=>m.dispose());root.removeFromParent();}};
}
