import * as THREE from 'three';
/** Scene-only view: all observed numbers arrive already computed by the domain. */
export function mountThermalStationStage(parent,model){
 const root=new THREE.Group();root.name='thermal-station';parent.add(root);
 const mats={wood:new THREE.MeshStandardMaterial({color:0x80583d,roughness:.88}),rim:new THREE.MeshStandardMaterial({color:0xc09558,metalness:.35,roughness:.55}),dark:new THREE.MeshStandardMaterial({color:0x294950,roughness:.75}),cool:new THREE.MeshStandardMaterial({color:0x5ca7bf,roughness:.65}),warm:new THREE.MeshStandardMaterial({color:0xdc8151,roughness:.7}),pale:new THREE.MeshStandardMaterial({color:0xebe3c1,roughness:.8}),light:new THREE.MeshStandardMaterial({color:0xffd878,emissive:0xeaa73c,emissiveIntensity:.4}),glass:new THREE.MeshStandardMaterial({color:0xa4d7da,transparent:true,opacity:.4,depthWrite:false,roughness:.2})};
 const box=(x,y,z,w,h,d,m='wood')=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats[m]);o.position.set(x,y,z);root.add(o);return o;};
 const ball=(x,y,z,r,m='light')=>{const o=new THREE.Mesh(new THREE.SphereGeometry(r,16,10),mats[m]);o.position.set(x,y,z);root.add(o);return o;};
 const rod=(a,b,r=.035,m='rim')=>{const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),d=vb.clone().sub(va);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),12),mats[m]);o.position.copy(va.add(vb).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());root.add(o);return o;};
 const vessel=(x,h=.8,fill='cool')=>{box(x,.28+h/2,0,.86,h,.75,'glass');box(x,.26+h/2,0,.70,h*.86,.61,fill);box(x,.26,0,.98,.12,.86,'rim');};
 const flowArrow=(a,b,mat='warm')=>{const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b);rod(a,b,.045,mat);const tip=new THREE.Mesh(new THREE.ConeGeometry(.12,.22,12),mats[mat]);tip.position.copy(to);tip.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),to.clone().sub(from).normalize());root.add(tip);};
 const mode=model.mode,given=model.given??{},observed=!!model.observed;let particles=[],time=0;
 // Research bench and backboard enrich the original Saaristo stage rather than replacing it.
 box(0,.25,0,5.3,.15,2.5,'wood');for(const x of [-2.4,2.4])box(x,.37,0,.09,.07,2.4,'rim');
 switch(mode){
  case 'probe':vessel(-1.25);vessel(1.25);for(const [i,x] of [-1.25,1.25].entries()){rod([x,1.55,.1],[x,.45,.1],.045,'pale');if(observed){const temp=Number(i===0?model.outcome?.aC:model.outcome?.bC),h=Math.max(.03,Math.min(1.05,(temp+20)/80*1.05));box(x,.45+h/2,.12,.09,h,.09,'warm');}}break;
  case 'energy':ball(-2,1.5,-.25,.40,given.context==='cooling-cup'?'cool':'light');vessel(1.15);if(observed){if(model.outcome?.direction==='out')flowArrow([.45,1.2,0],[-.9,1.2,0]);else flowArrow([-.9,1.2,0],[.45,1.2,0]);}break;
  case 'amount':{const maxMass=Math.max(Number(given.massA),Number(given.massB));vessel(-1.25,.85*Number(given.massA)/maxMass);vessel(1.25,.85*Number(given.massB)/maxMass);if(observed){flowArrow([-1.25,1.7,0],[-1.25,1.25,0]);flowArrow([1.25,1.7,0],[1.25,1.25,0]);}break;}
  case 'flow':vessel(-1.5,.8,Number(given.aC)>Number(given.bC)?'warm':'cool');vessel(1.5,.8,Number(given.bC)>Number(given.aC)?'warm':'cool');rod([-.95,.68,0],[.95,.68,0],.10,'rim');if(observed){const direction=model.outcome?.direction;if(direction==='a-to-b')flowArrow([-.8,1.35,0],[.8,1.35,0]);if(direction==='b-to-a')flowArrow([.8,1.35,0],[-.8,1.35,0]);}break;
  case 'conduction':for(const z of [-.62,.62]){box(-1.9,.6,z,.75,.5,.5,'warm');box(1.9,.6,z,.75,.5,.5,'cool');rod([-1.5,.65,z],[1.5,.65,z],.12,z<0?'rim':'pale');if(observed){const result=z<0?model.outcome?.a:model.outcome?.b;const ratio=Math.max(0,Math.min(1,((result?.b??Number(given.coldC))-Number(given.coldC))/(Number(given.hotC)-Number(given.coldC))));box(1.9,.98,z,.65,.09*ratio,.36,'warm');}}break;
  case 'convection':box(0,.85,0,3.4,1.2,.8,'glass');box(-1.1,.3,0,.7,.08,.7,'warm');if(observed)for(let i=0;i<8;i++)particles.push(ball(0,0,.46,.08,'pale'));break;
  case 'radiation':ball(-1.85,1.2,0,.40,'light');box(1.65,.54,-.5,.7,.55,.55,'cool');box(1.65,.54,.5,.7,.55,.55,'cool');box(.25,.95,.5,.10,1.4,.65,'dark');if(observed)for(let i=0;i<3;i++)rod([-1.3,1.0+i*.18,-.5],[1.25,1.0+i*.18,-.5],.025,'light');break;
  case 'integration':box(0,.85,0,2.7,1.25,.7,'glass');box(-1.3,.85,0,.12,1.25,.7,'wood');ball(-2,1.45,0,.28,'light');if(observed){flowArrow([-1.1,1.15,0],[1.0,1.15,0]);for(let i=0;i<6;i++)particles.push(ball(0,0,.42,.07,'pale'));}break;
 }
 function placeParticles(){for(let i=0;i<particles.length;i++){const phase=time*.65+i*Math.PI*2/particles.length;particles[i].position.set(1.05*Math.cos(phase),.85-.4*Math.sin(phase),.45);}}
 function advanceTime(ms){if(!Number.isFinite(ms)||ms<=0)return;time+=ms/1000;placeParticles();}
 placeParticles();
 return {advanceTime,snapshot:()=>({mode,observed,given,...(observed?{outcome:model.outcome}:{}),particleCount:particles.length}),dispose(){root.traverse(o=>o.geometry?.dispose());for(const m of Object.values(mats))m.dispose();root.removeFromParent();}};
}
