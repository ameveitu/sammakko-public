import * as THREE from 'three';

const palette={H:0xeee5be,O:0xbb7460,N:0x7797ba,C:0x61776c,Na:0xc29c63,Cl:0x81ab80,Mg:0xbca0c3,S:0xd5bd63,Si:0xa39679,P:0xbd8d73};
const colour=symbol=>palette[symbol]??0x9fb39a;
/** Deterministic teaching trajectory. It is a diagram of possible motion, not a molecular-dynamics simulation. */
export function atomicChamberPose(chamber,index,timeMs,experiment,observed=false){
 const ms=Number.isFinite(timeMs)?Math.max(0,Math.min(8000,timeMs)):0,t=ms/1000;
 const phase=chamber.phase,motion=chamber.motion??(phase==='solid'?'vibrate':phase==='liquid'?'slide':'free');
 const spacing=chamber.spacing??(phase==='gas'?'far':chamber.substance==='water'&&phase==='solid'?'open':'near');
 const step=spacing==='far'?.39:spacing==='open'?.26:.21;
 const base=[(index%4-1.5)*step,.16+Math.floor(index/4)%3*step,(Math.floor(index/12)-.5)*step];
 if(experiment?.kind==='diffusion')base[0]=-.42-Math.abs(base[0])*.35;
 if(motion==='stopped')return base;
 if(motion==='vibrate')return base.map((v,axis)=>v+.018*Math.sin(t*5+index*1.7+axis));
 if(motion==='slide')return [base[0]+.05*Math.sin(t*1.5+index),base[1]+.025*Math.cos(t*2+index),base[2]+.04*Math.sin(t+index*.7)];
 const rate=experiment?.kind==='heating'&&observed?1.65:1;
 const bound=(value,limit)=>{const period=limit*4,offset=((value+limit)%period+period)%period;return offset<=limit*2?offset-limit:limit*3-offset;};
 const radius=chamber.substance==='water'?.095:.042;
 const xLimit=.75-.0125-radius,zLimit=.45-.01-radius,yLimit=.47-.0175-radius;
 const vx=base[0]+t*rate*(.13+(index%3)*.04)*(index%2?1:-1);
 const closed=experiment?.kind==='diffusion'&&!observed;
 const left=-xLimit,right=-.01-radius,mid=(left+right)/2;
 const x=closed?mid+bound(vx-mid,(right-left)/2):bound(vx,xLimit);
 return [x,.47+bound(base[1]-.47+t*rate*(.11+(index%4)*.02)*(index%3?1:-1),yLimit),
  bound(base[2]+t*rate*.12*(index%2?1:-1),zLimit)];
}
function safeSnapshot(model,elapsed){return {kind:model.kind,title:model.title,mode:model.mode,observed:model.observed===true,phase:model.phase,view:model.view,motionMs:model.motionMs,elapsedMs:elapsed,legend:model.legend};}
export function mountAtomicWorldStage(parent,model,revealed=false){
 const root=new THREE.Group();root.name='atomic-world-table';parent.add(root);
 const moving=[],materials=[];
 const material=(color,options={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.7,...options});materials.push(m);return m;};
 const wood=material(0x8f6f4d),pale=material(0xb7c9aa),dark=material(0x365d50),brass=material(0xc3a264),glass=material(0xb3cfd0,{transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide});
 const mesh=(geometry,mat,position,name,parentNode=root)=>{const m=new THREE.Mesh(geometry,mat);m.position.set(...position);m.name=name;parentNode.add(m);return m;};
 const box=(size,position,mat,name,parentNode=root)=>mesh(new THREE.BoxGeometry(...size),mat,position,name,parentNode);
 const sphere=(radius,position,symbol,name,parentNode=root)=>{const m=mesh(new THREE.SphereGeometry(radius,12,9),material(colour(symbol)),position,name,parentNode);m.userData={symbol};return m;};
 const line=(a,b,radius,mat,name,parentNode=root)=>{const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);if(!delta.lengthSq())return;const m=mesh(new THREE.CylinderGeometry(radius,radius,delta.length(),8),mat,start.clone().lerp(end,.5).toArray(),name,parentNode);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;};
 box([4.2,.14,2.1],[0,.38,0],wood,'cave-exhibit-worktop');box([4,.045,1.94],[0,.48,0],pale,'model-gallery-surface');
 if(model.mode==='atom'){
  for(const [index,atom]of model.atoms.entries()){
   const g=new THREE.Group();g.name=`schematic-atom-${atom.id}`;g.position.set(model.atoms.length>1?(index-(model.atoms.length-1)/2)*1.25:.5,1.12,0);root.add(g);
   const cloud=mesh(new THREE.SphereGeometry(.61,24,18),glass,[0,0,0],'electron-probability-cloud',g);cloud.userData={schematic:true,notOrbit:true};
   for(let i=0;i<atom.protons+atom.neutrons;i++){
    const angle=i*2.39996,r=.048*Math.cbrt(i+1),p=[r*Math.cos(angle),r*Math.sin(angle),((i%5)-2)*.033];
    const m=sphere(.033,p,i<atom.protons?'H':'C',i<atom.protons?'proton-positive':'neutron-zero',g);m.userData={particle:i<atom.protons?'proton':'neutron',charge:i<atom.protons?1:0};
   }
   // Fixed diffuse markers encode the count. They never orbit the nucleus.
   for(let i=0;i<atom.electrons;i++){
    const theta=i*2.39996,y=(1-2*(i+.5)/Math.max(atom.electrons,1))*.48,r=Math.sqrt(Math.max(0,.48*.48-y*y));
    const marker=mesh(new THREE.SphereGeometry(.021,8,6),dark,[r*Math.cos(theta),y,r*Math.sin(theta)],'stationary-electron-cloud-marker',g);marker.userData={particle:'electron',charge:-1,notTrajectory:true};
   }
   box([.7,.025,.04],[0,-.69,.35],brass,'separately-enlarged-nucleus-warning',g);
   box([.34,.29,.035],[0,.82,.06],pale,'atom-label-plaque',g);
   const glyphs={a:[[[-.1,0],[0,.21],[.1,0]],[[-.05,.1],[.05,.1]]],b:[[[-.09,0],[-.09,.21],[.03,.21],[.09,.16],[.03,.11],[-.09,.11]],[[-.09,.11],[.04,.11],[.1,.05],[.04,0],[-.09,0]]],c:[[[.09,.18],[.02,.21],[-.08,.17],[-.1,.1],[-.08,.03],[.02,0],[.09,.03]]]};
   for(const path of glyphs[atom.id]??glyphs.a)for(let j=1;j<path.length;j++)line([path[j-1][0],.72+path[j-1][1],.09],[path[j][0],.72+path[j][1],.09],.011,dark,`atom-visible-label-${atom.id.toUpperCase()}`,g);
  }
  if(model.sample){
   box([.65,.045,.4],[0,.56,.7],wood,'macroscopic-sample-window');
   if(model.sample.state==='gas'){
    mesh(new THREE.CylinderGeometry(.19,.19,.31,20),glass,[0,.75,.7],'sealed-macroscopic-gas-vessel');
    box([.42,.025,.42],[0,.92,.7],brass,'sealed-vessel-lid');
   }else mesh(new THREE.DodecahedronGeometry(.16,0),material(model.sample.symbol==='C'?0x53675e:0xb7c5be),[0,.73,.7],'macroscopic-solid-element-sample');
   const i=model.atoms.findIndex(a=>a.id===model.selectedAtomId);if(i>=0){const x=model.atoms.length>1?(i-(model.atoms.length-1)/2)*1.25:.5;line([0,.8,.7],[x,.95,0],.025,brass,'learner-sample-to-atom-link');}}
 }
 const geometryPoints=model.structures.length?model.structures.flatMap(s=>s.sites):model.particles;
 if(geometryPoints.length){
  const xs=geometryPoints.map(p=>p.x),ys=geometryPoints.map(p=>p.y),zs=geometryPoints.map(p=>p.z);
  const shiftAllowance=model.structures.some(s=>s.intervention==='shift')?1:0;
  const span=Math.max(2,Math.max(...xs)-Math.min(...xs)+1+shiftAllowance,Math.max(...ys)-Math.min(...ys)+1);
  const scale=(model.chambers.length?1.55:2.7)/span;
  const center=[(Math.min(...xs)+Math.max(...xs)+shiftAllowance)/2,Math.min(...ys),(Math.min(...zs)+Math.max(...zs))/2];
  const project=p=>[(p.x-center[0])*scale+(model.chambers.length?-1:0),.72+(p.y-center[1])*scale,(p.z-center[2])*scale];
  for(const structure of model.structures)for(const site of structure.sites){
   const point=project(site),ring=mesh(new THREE.TorusGeometry(.08*scale,.012*scale,5,12),dark,point,'unfilled-lattice-site');ring.rotation.x=Math.PI/2;ring.userData={site:site.id};
  }
  const positions=new Map();
  for(const p of model.particles){const point=project(p);positions.set(p.id,point);const m=sphere(p.radius*scale,point,p.symbol,'learner-model-part');m.userData={id:p.id,symbol:p.symbol,source:p.chamber};}
  for(const edge of model.bonds){const a=positions.get(edge.a),b=positions.get(edge.b);if(a&&b)for(let n=0;n<edge.order;n++)line([a[0],a[1],a[2]+(n-(edge.order-1)/2)*.04],[b[0],b[1],b[2]+(n-(edge.order-1)/2)*.04],.018,dark,'learner-bond');}
 }
 for(const [ci,chamber]of model.chambers.entries()){
  const g=new THREE.Group();g.name=`particle-chamber-${chamber.id}`;g.position.set((ci-(model.chambers.length-1)/2)*1.25+(model.structures.length?1.1:0),.58,model.structures.length?.35:0);if(model.chambers.length>1)g.scale.setScalar(.76);root.add(g);
  box([1.5,.035,.9],[0,0,0],brass,'chamber-base',g);box([1.5,.035,.9],[0,.94,0],glass,'chamber-top',g);
  for(const x of [-.75,.75])box([.025,.94,.9],[x,.47,0],glass,'chamber-wall',g);
  box([1.5,.94,.02],[0,.47,-.45],glass,'chamber-back',g);
  if(model.experiment?.kind==='diffusion'&&!model.observed)box([.02,.9,.85],[0,.46,0],pale,'closed-given-partition',g);
  for(let i=0;i<chamber.count;i++){
   const unit=new THREE.Group();unit.name=`conserved-${chamber.id}-${i}`;unit.userData={id:`${chamber.id}-${i}`,substance:chamber.substance,radius:chamber.substance==='water'?.047:.042};g.add(unit);
   if(chamber.substance==='water'){
    sphere(.047,[0,0,0],'O','water-oxygen',unit);
    const angle=104.5*Math.PI/180;
    for(const sign of [-1,1]){const point=[Math.sin(angle/2)*.078*sign,Math.cos(angle/2)*.078,0];sphere(.029,point,'H','water-hydrogen',unit);line([0,0,0],point,.008,dark,'within-water-bond',unit);}
   }else sphere(.042,[0,0,0],'Ar','argon-atom',unit);
   moving.push({unit,index:i,chamber});
  }
 }
 let elapsed=0,disposed=false;
 function update(){for(const item of moving){let c=item.chamber;if(model.view==='during')c={...c,phase:item.index%2?(model.transition?.to??c.phase):c.phase};item.unit.position.set(...atomicChamberPose(c,item.index,elapsed,model.experiment,model.observed));}}
 update();
 return {snapshot(){return {...safeSnapshot(model,elapsed),revealed:revealed===true};},advanceTime(ms){if(disposed||!Number.isFinite(ms)||ms<0)return;elapsed=Math.min(8000,elapsed+ms);update();},dispose(){if(disposed)return;disposed=true;const geometries=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});for(const g of geometries)g.dispose();for(const m of new Set(materials))m.dispose();root.removeFromParent();}};
}
