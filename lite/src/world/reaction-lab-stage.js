import * as THREE from 'three';
const palette={H:0xf1dfb3,O:0xc37662,C:0x536c60,Ca:0xbca674,Mg:0xb6a0c0};
/** Visual geometry only. Recorded whole reaction groups determine the remaining volume. */
export function reactionFragmentDimensions(shape,reacted,limit){
 if(!shape||!Array.isArray(shape.cuts)||shape.cuts.length!==3||![shape.width,shape.height,shape.depth,...shape.cuts,reacted,limit].every(Number.isFinite)||!Number.isSafeInteger(limit)||limit<1||limit>16||!Number.isSafeInteger(reacted)||reacted<0||reacted>limit||![shape.width,shape.height,shape.depth].every(n=>n>0&&n<=12)||!shape.cuts.every(n=>Number.isSafeInteger(n)&&n>=1&&n<=4))return [];
 const dimensions=[shape.width/shape.cuts[0],shape.height/shape.cuts[1],shape.depth/shape.cuts[2]],fraction=Math.max(0,Math.min(1,1-reacted/limit));
 if(fraction===1)return dimensions;
 if(fraction===0)return [0,0,0];
 const target=dimensions.reduce((a,b)=>a*b,1)*fraction;let low=0,high=Math.min(...dimensions)/2;
 for(let i=0;i<64;i++){const retreat=(low+high)/2,volume=dimensions.reduce((a,b)=>a*Math.max(0,b-2*retreat),1);if(volume>target)low=retreat;else high=retreat;}
 return dimensions.map(d=>Math.max(0,d-low-high));
}
export function mountReactionLabStage(parent,model,revealed=false){
 const root=new THREE.Group();root.name='reaction-lab';parent.add(root);const materials=[],moving=[];
 const material=(color,options={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.75,...options});materials.push(m);return m;};
 const wood=material(0x806449),moss=material(0xaabd99),brass=material(0xc4a46d),dark=material(0x385c4b),glass=material(0xa4c9ca,{transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide});
 const put=(geometry,mat,position,name,parentNode=root)=>{const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(...position);mesh.name=name;parentNode.add(mesh);return mesh;};
 const box=(dimensions,position,mat,name,parentNode=root)=>put(new THREE.BoxGeometry(...dimensions),mat,position,name,parentNode);
 const line=(a,b,name,parentNode=root,thickness=.014)=>{const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(start);if(!d.lengthSq())return;const mesh=put(new THREE.CylinderGeometry(thickness,thickness,d.length(),8),brass,start.clone().lerp(end,.5).toArray(),name,parentNode);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());};
 const atomMaterials=new Map(),atomGeometries=new Map();
 const ball=(atom,point,parentNode,trial,size=1)=>{const radius=(atom.element==='H'?.031:.046)*size;if(!atomGeometries.has(radius))atomGeometries.set(radius,new THREE.SphereGeometry(radius,12,8));if(!atomMaterials.has(atom.element))atomMaterials.set(atom.element,material(palette[atom.element]??0x8ba995));const mesh=put(atomGeometries.get(radius),atomMaterials.get(atom.element),point,'conserved-reaction-atom',parentNode);mesh.userData={id:`${trial}:${atom.id}`,element:atom.element};return mesh;};
 box([4.3,.13,2.15],[0,.38,0],wood,'crystal-workshop-table');box([4.1,.035,1.97],[0,.47,0],moss,'closed-ledger-platform');
 function vessel(x,z,label,width=1.5,height=1.25){const group=new THREE.Group();group.position.set(x,.5,z);group.name=label;root.add(group);box([width,.025,.95],[0,0,0],brass,'vessel-floor',group);box([width,.025,.95],[0,height,0],glass,'sealed-vessel-lid',group);for(const sign of [-1,1])box([.025,height,.95],[sign*width/2,height/2,0],glass,'vessel-wall',group);box([width,height,.02],[0,height/2,-.475],glass,'vessel-back',group);for(const x of [-width/2,width/2])for(const z of [-.475,.475])line([x,0,z],[x,height,z],'sealed-vessel-outline',group,.009);for(const z of [-.475,.475])line([-width/2,height,z],[width/2,height,z],'sealed-lid-outline',group,.009);return group;}
 function units(units,atoms,group,trial){
  for(const [i,unit]of units.entries()){
   const node=new THREE.Group();node.name='tracked-reaction-unit';node.userData={id:`${trial}:${unit.id}`,formula:unit.formula,phase:unit.phase,atomIds:unit.atomIds.map(id=>`${trial}:${id}`)};node.position.set((i%4-1.5)*.29,.18+Math.floor(i/4)%4*.22,(Math.floor(i/16)-.5)*.28);group.add(node);
   const selected=unit.atomIds.map(id=>atoms.find(a=>a.id===id));
   for(const [j,atom]of selected.entries())if(atom){const angle=j*2.39996,point=[Math.cos(angle)*.065*Math.sqrt(j),Math.sin(angle)*.055*Math.sqrt(j),j%2*.035];ball(atom,point,node,trial);}
   if(unit.phase==='gas')moving.push({node,origin:node.position.clone(),index:i});
  }
 }
 if(model.mode==='rearrange'){
  const state=model.vessels[0]?.state;
  if(state){
   const ownGroups=model.learnerGroups.filter(g=>g.atomIds.length),allocated=new Set(ownGroups.flatMap(g=>g.atomIds));
   const sourceGroups=state.inside.map(g=>({...g,atomIds:g.atomIds.filter(id=>!allocated.has(id))})).filter(g=>g.atomIds.length);
   const positions=new Map();
   for(const [side,groups]of [[-1,sourceGroups],[1,ownGroups]])for(const [i,g]of groups.entries()){
    const atoms=g.atomIds.map(id=>state.atoms.find(a=>a.id===id)).filter(Boolean),center=atoms.find(a=>a.element==='C'||a.element==='O')??atoms[0];
    const ordered=[center,...atoms.filter(a=>a!==center)];
    for(const [j,atom]of ordered.entries()){
     const angle=(j-1)*2*Math.PI/Math.max(1,ordered.length-1),hub=[side*.97+(i%2-.5)*.65,.75+Math.floor(i/2)*.36,-.18];
     const point=j?[hub[0]+Math.cos(angle)*.15,hub[1]+Math.sin(angle)*.12,hub[2]+j%2*.055]:hub;
     positions.set(atom.id,point);ball(atom,point,root,'A',1.6);
    }
    if(side<0){const ids=new Set(g.atomIds);const connect=(a,b,order)=>{if(!a||!b||!ids.has(a.id)||!ids.has(b.id))return;for(let i=0;i<order;i++){const pa=positions.get(a.id),pb=positions.get(b.id);line([pa[0],pa[1],pa[2]+(i-(order-1)/2)*.035],[pb[0],pb[1],pb[2]+(i-(order-1)/2)*.035],'given-reactant-bond');}};
     const h=atoms.filter(a=>a.element==='H'),o=atoms.filter(a=>a.element==='O'),c=atoms.find(a=>a.element==='C');
     if(g.formula==='H2')connect(h[0],h[1],1);
     if(g.formula==='O2')connect(o[0],o[1],2);
     if(g.formula==='H2O')for(const a of h)connect(o[0],a,1);
     if(g.formula==='CH4')for(const a of h)connect(c,a,1);
     if(g.formula==='H2O2'){connect(o[0],o[1],1);connect(o[0],h[0],1);connect(o[1],h[1],1);}
    }
   }
   for(const b of model.learnerBonds){const a=positions.get(b.a),end=positions.get(b.b);if(a&&end)for(let i=0;i<b.order;i++)line([a[0],a[1],a[2]+(i-(b.order-1)/2)*.04],[end[0],end[1],end[2]+(i-(b.order-1)/2)*.04],'learner-reaction-bond');}
  }
 }else if(model.mode==='rate'){
  for(const [i,v]of model.vessels.entries()){
   const chamber=vessel((i-.5)*2.05,0,`closed-rate-chamber-${v.id}`,1.85,1.4),shape=v.shape;if(!shape)continue;
   const scale=1.1/Math.max(shape.width,shape.height,shape.depth),dimensions=reactionFragmentDimensions(shape,v.reacted,v.limit),cuts=shape.cuts;
   for(let x=0;x<cuts[0];x++)for(let y=0;y<cuts[1];y++)for(let z=0;z<cuts[2];z++){
    if(dimensions.some(d=>d<=0))continue;
    const p=[(x-(cuts[0]-1)/2)*(shape.width/cuts[0]*scale+.055),.24+shape.height*scale/2+(y-(cuts[1]-1)/2)*(shape.height/cuts[1]*scale+.055),(z-(cuts[2]-1)/2)*(shape.depth/cuts[2]*scale+.055)];
    const fragment=box(dimensions.map(d=>d*scale),p,dark,'remaining-reactant-fragment',chamber);fragment.userData={trial:v.id,cuts:[...cuts],reacted:v.reacted,limit:v.limit,modelDimensions:[...dimensions],scale,originalVolume:shape.width*shape.height*shape.depth,originalArea:2*(shape.width*shape.height*cuts[2]+shape.width*shape.depth*cuts[1]+shape.height*shape.depth*cuts[0])};
   }
   // The lower micro-window is a second representation of the same ledger, not extra matter.
   const micro=new THREE.Group();micro.name='same-ledger-micro-window';micro.scale.setScalar(.55);micro.position.set(0,.88,.1);chamber.add(micro);units(v.state.inside,v.state.atoms,micro,v.id);
   const balance=box([.8,.04,.08],[0,-.05,.63],brass,'constant-total-mass-ledger',chamber);balance.userData={trial:v.id,...(v.sampled?{totalMassMg:v.state.totalMassMg}:{})};
  }
 }else for(const v of model.vessels){
  const chamber=vessel(-1,0,'reaction-vessel'),collector=vessel(1,0,'tracked-outside-collector');units(v.state.inside,v.state.atoms,chamber,v.id);units(v.state.outside,v.state.atoms,collector,v.id);
  line([-.25,1.55,.1],[.25,1.55,.1],'tracked-boundary-tube');
  if(!v.boundaryOpen)box([.04,.12,.12],[.0,1.55,.1],brass,'closed-boundary-valve');
 }
 let elapsed=0,disposed=false;
 const update=()=>{for(const {node,origin,index}of moving)node.position.copy(origin).add(new THREE.Vector3(.013*Math.sin(elapsed/550+index),.015*Math.cos(elapsed/670+index),.01*Math.sin(elapsed/730+index)));};
 return {snapshot(){return {kind:model.kind,mode:model.mode,phase:model.phase,observed:model.observed,elapsedMs:elapsed,revealed:revealed===true,vessels:model.vessels.map(v=>({id:v.id,timeS:v.timeS,sampled:v.sampled,...(v.sampled?{insideMassMg:v.state.insideMassMg,outsideMassMg:v.state.outsideMassMg,totalMassMg:v.state.totalMassMg,reacted:v.reacted}:{})})),learnerGroups:model.learnerGroups,learnerBonds:model.learnerBonds};},advanceTime(ms){if(disposed||!Number.isFinite(ms)||ms<0)return;elapsed=Math.min(8000,elapsed+ms);update();},dispose(){if(disposed)return;disposed=true;const geometries=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});for(const geometry of geometries)geometry.dispose();for(const mat of new Set(materials))mat.dispose();root.removeFromParent();}};
}
