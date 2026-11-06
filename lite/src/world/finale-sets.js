import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const smooth = n => { const x = Math.min(1,Math.max(0,n)); return x*x*(3-2*x); };

/** Reusable physical sets. All positions are local to the foreground shore at world Z=6. */
export function buildFinaleSet(kind) {
  const root=new THREE.Group(); root.name=`film-set:${kind}`; root.position.z=6;
  const named={};
  const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.82,...extra});
  const palette={wood:material(0x956b48),edge:material(0x684b38),paper:material(0xf0dfb5),brass:material(0xb18d53,{metalness:.38,roughness:.4}),green:material(0x718059),stone:material(0x82908c),shell:material(0xffedcb),dark:material(0x233e4a),glass:material(0x97c4d0,{transparent:true,opacity:.28,depthWrite:false,roughness:.15}),orange:material(0xe4a45c),lamp:material(0xffd699,{emissive:0xf5ad54,emissiveIntensity:.8})};
  function mesh(geometry,mat,x,y,z,parent=root,name) {
    const m=new THREE.Mesh(geometry,typeof mat==='string'?palette[mat]:mat);m.position.set(x,y,z);parent.add(m);
    if(name){m.name=name;named[name]=m;}return m;
  }
  const box=(x,y,z,w,h,d,mat='wood',parent=root,name)=>mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(.055,w/5,h/5,d/5)),mat,x,y,z,parent,name);
  const ball=(x,y,z,r,mat='stone',parent=root,name)=>mesh(new THREE.SphereGeometry(r,24,16),mat,x,y,z,parent,name);
  function rod(a,b,r=.03,mat='wood',parent=root){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);const m=mesh(new THREE.CylinderGeometry(r,r,delta.length(),10),mat,...start.clone().add(end).multiplyScalar(.5).toArray(),parent);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;}
  function line(points,color=0x405e65,parent=root,width=.01){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(curve,Math.max(12,points.length*5),width,5,false),material(color),0,0,0,parent);}
  function contact(x,z,rx,rz,parent=root){const m=mesh(new THREE.CircleGeometry(1,40),new THREE.MeshBasicMaterial({color:0x172e31,transparent:true,opacity:.17,depthWrite:false}),x,.578,z,parent);m.rotation.x=-Math.PI/2;m.scale.set(rx,rz,1);return m;}
  function grass(x,z,scale=1,parent=root){
    for(let i=0;i<7;i++){const angle=i*2.399;const end=[x+Math.cos(angle)*.25*scale,.57+(.6+(i%3)*.13)*scale,z+Math.sin(angle)*.18*scale];rod([x,.5,z],end,.013*scale,'green',parent);if(i%2===0){const stem=ball(...end,.045,'edge',parent);stem.scale.set(.7,3,.7);}}
  }
  function bank(){
    const shape=new THREE.Shape();shape.moveTo(-6,-2.4);shape.bezierCurveTo(-5.6,-4.4,-1.1,-3.1,1.5,-3.8);shape.bezierCurveTo(5.3,-4.4,6.7,-1.4,5.5,.5);shape.bezierCurveTo(4.5,3.3,1.8,2.1,-.6,2.7);shape.bezierCurveTo(-3.1,3.4,-6.6,.4,-6,-2.4);
    for(const [y,scale,color] of [[.08,1.025,0xad9470],[.18,1,0x657357]]){const land=mesh(new THREE.ExtrudeGeometry(shape,{depth:.27,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.15,bevelThickness:.1}),material(color),0,y,0,root,'bank-surface');land.rotation.x=-Math.PI/2;land.scale.set(scale,scale,1);}
    for(let i=0;i<9;i++){const x=-5.5+i*1.3,z=2.25+Math.sin(i*1.4)*.25;const rock=ball(x,.2,z,.45);rock.scale.set(1.3,.55,.8);rock.rotation.y=i*.9;}
    grass(-4.9,.5,1.4);grass(4.6,-2.1,1.2);grass(3.8,2,1);grass(-3.7,-2.5,.8);
    const stone=ball(.05,.7,.6,.22,'stone',root,'familiar-stone');stone.scale.set(1.3,.6,1);contact(.05,.6,.29,.23);
    const snow=ball(.05,.75,.58,.245,material(0xe2ecec),root,'snow');snow.scale.set(1.4,.55,1.1);snow.visible=false;
    const leaf=new THREE.Group();root.add(leaf);named.leaf=leaf;leaf.name='falling-leaf';const blade=ball(0,0,0,.15,material(0xc69243),leaf);blade.scale.set(1.9,.1,.8);rod([-.28,0,0],[.27,0,0],.008,'edge',leaf);
  }
  function lantern(x,y,z,parent=root){
    const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);box(0,.02,0,.32,.07,.28,'dark',g);box(0,.4,0,.32,.07,.28,'dark',g);
    for(const a of [-.13,.13])for(const b of [-.11,.11])rod([a,.02,b],[a,.4,b],.013,'brass',g);
    ball(0,.2,0,.07,'lamp',g);const halo=ball(0,.2,0,.12,material(0xffdd9c,{transparent:true,opacity:.16,depthWrite:false,emissive:0xe9b477,emissiveIntensity:.5}),g);halo.scale.y=1.3;
    const light=new THREE.PointLight(0xffd09c,.8,3,2);light.position.y=.2;g.add(light);return g;
  }
  function notebook(x,y,z,parent=root){
    const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);g.name='open-notebook';
    box(0,0,0,.9,.045,.6,'dark',g);box(-.216,.032,0,.41,.025,.56,'paper',g);box(.216,.032,0,.41,.025,.56,'paper',g);
    rod([0,.055,-.28],[0,.055,.28],.009,'edge',g);return g;
  }
  function table(x=0,z=.3,parent=root,width=5){
    const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);g.name='shared-table';
    for(let i=0;i<6;i++)box(0,1.45,-.72+i*.29,width,.13,.275,i%2?'wood':'edge',g);
    for(const a of [-width/2+.35,width/2-.35])for(const b of [-.6,.6])box(a,1,b,.16,.9,.16,'edge',g);
    return g;
  }
  function workshop(){
    for(let i=0;i<15;i++)box(-5.6+i*.8,.46,-.5,.78,.18,7,i%3?'wood':'edge');
    // An actual open window, with four wall pieces around it.
    box(-4.5,2.45,-3.8,3,4,.22);box(4.5,2.45,-3.8,3,4,.22);box(0,.95,-3.8,6,1,.22);box(0,4,-3.8,6,.9,.22);
    for(const x of [-5.9,-3,3,5.9])box(x,2.55,-3.6,.2,4.1,.25,'edge');
    for(const x of [-3,0,3])box(x,2.6,-3.76,.1,2.2,.15,'edge');box(0,2.6,-3.76,6,.08,.15,'edge');
    const left=box(-3,4.65,-.6,6.5,.18,7.4,'green');left.rotation.z=.16;const right=box(3,4.65,-.6,6.5,.18,7.4,'green');right.rotation.z=-.16;
    const pole=box(-1.5,1.8,-1.9,.2,2.6,.22,'edge');pole.name='growth-doorpost';
    const marks=new THREE.Group();root.add(marks);named.marks=marks;
    for(let i=0;i<9;i++)box(-1.5, .8+i*.21,-1.775,.15,.025,.015,'paper',marks);
    const work=table();named.table=work;lantern(-2.2,1.53,.55);
    const map=new THREE.Group();map.position.set(-.2,1.54,.35);root.add(map);named.map=map;box(0,0,0,2.35,.018,1.16,'paper',map);
    line([[-.9,.025,-.25],[-.6,.025,.25],[-.1,.025,.15],[.15,.025,-.3],[.65,.025,-.18],[.9,.025,.3]],0x668d87,map,.026);
    line([[-.6,.03,.25],[-.5,.03,.45],[-.1,.03,.37]],0x668d87,map,.019);
    for(const x of [-.7,-.05,.62]){const dot=ball(x,.04,.1,.035,'brass',map);dot.scale.y=.4;}
    const paper=box(.98,.045,0,.58,.02,1.16,'paper',map,'folded-paper');paper.geometry.translate(-.28,0,0);
    const keepsakes=new THREE.Group();root.add(keepsakes);named.keepsakes=keepsakes;
    notebook(.55,1.55,.35,keepsakes);const stone=ball(-.65,1.65,.4,.17,'stone',keepsakes);stone.scale.y=.55;const twin=ball(-1.1,1.64,.55,.15,'stone',keepsakes);twin.scale.y=.6;box(-.2,1.61,.25,.35,.12,.55,'wood',keepsakes);
    const tools=new THREE.Group();root.add(tools);named.tools=tools;
    box(.65,1.58,.35,1.7,.025,.83,'dark',tools);
    for(let i=0;i<6;i++)ball(.04+i*.21,1.62,.14+Math.sin(i*1.8)*.21,.025,'lamp',tools);
    box(-.68,1.6,.6,1.1,.045,.1,'brass',tools);for(let i=0;i<10;i++)rod([-.64+i*.1,1.63,.55],[-.64+i*.1,1.63,.59],.005,'dark',tools);
    rod([-1.3,1.6,.2],[-.8,1.6,-.2],.04,'wood',tools);box(-.82,1.61,-.18,.3,.08,.16,'stone',tools);
  }
  function nest(close=false){
    const g=new THREE.Group();g.position.set(close?.55:1.05,.62,.3);root.add(g);named.nest=g;
    contact(g.position.x,g.position.z,1.05,.78);
    for(let layer=0;layer<4;layer++){const ring=mesh(new THREE.TorusGeometry(.72-layer*.055,.065,8,44),layer%2?'wood':'edge',0,layer*.065,0,g);ring.rotation.x=Math.PI/2;ring.scale.y=.74;}
    for(let i=0;i<24;i++){const a=i*2.399,r=.6+(i%3)*.07;rod([Math.cos(a)*r,.1+(i%4)*.035,Math.sin(a)*r*.7],[Math.cos(a+.5)*(r+.18),.16,Math.sin(a+.5)*(r+.18)*.7],.017,i%2?'wood':'brass',g);}
    const eggs=new THREE.Group();g.add(eggs);named.eggs=eggs;
    for(const [x,z,size] of close?[[0,0,.38]]:[[-.3,-.1,.29],[.21,-.15,.32],[.02,.25,.26]]){
      const egg=ball(x,.39,z,size,'shell',eggs);egg.scale.set(1,1.38,1);egg.name='intact-egg';if(close)named.closedEgg=egg;
    }
    if(close){
      const geometry=new THREE.SphereGeometry(.38,64,48);geometry.scale(1,1.38,1);const pos=geometry.getAttribute('position'),indices=geometry.index.array,kept=[];
      for(let i=0;i<indices.length;i+=3){let x=0,y=0,z=0;for(let k=0;k<3;k++){x+=pos.getX(indices[i+k])/3;y+=pos.getY(indices[i+k])/3;z+=pos.getZ(indices[i+k])/3;}const a=Math.atan2(y-.02,x),edge=1+.12*Math.sin(7*a)+.07*Math.cos(11*a);if(!(z>.19&&x*x/.032+(y-.02)*(y-.02)/.036<edge))kept.push(indices[i],indices[i+1],indices[i+2]);}
      geometry.setIndex(kept);geometry.computeVertexNormals();
      const open=mesh(geometry,'shell',0,.39,0,eggs,'opened-eggshell');open.visible=false;
      const interior=mesh(new THREE.SphereGeometry(.36,32,24),'edge',0,.39,0,eggs,'egg-interior');interior.scale.y=1.38;interior.visible=false;
      const crack=line([[-.12,.58,.32],[-.035,.51,.365],[.015,.44,.38],[-.025,.39,.378],[.07,.32,.36],[.11,.25,.33]],0x775e48,eggs,.005);named.crack=crack;
      const bill=new THREE.Group();bill.name='child-bill-only';bill.position.set(0,.4,.32);eggs.add(bill);named.bill=bill;
      const chips=new THREE.Group();eggs.add(chips);named.chips=chips;for(let i=0;i<5;i++){const chip=mesh(new THREE.SphereGeometry(.08,6,4,0,Math.PI*.8,0,Math.PI*.45),'shell',0,.4,.38,chips);chip.name=`shell-flake:${i}`;}
    }
    const shelter=new THREE.Group();shelter.position.set(1.4,.57,-1.1);root.add(shelter);named.shelter=shelter;
    for(const x of [-1,1])rod([x,0,0],[x,1.4,0],.07,'wood',shelter);
    const screen=box(0,.85,0,2,.95,.08,'green',shelter);screen.rotation.y=.05;
    for(let i=0;i<9;i++)rod([-1+i*.25,.38,.05],[-1+i*.25,1.35,.05],.012,'wood',shelter);
  }
  function feast(){
    const shared=table(0,.1,root,6);named.table=shared;lantern(2.65,1.53,.12);lantern(-2.65,1.53,.12);
    for(const x of [-1.9,0,1.9]){const plate=mesh(new THREE.CylinderGeometry(.26,.27,.025,32),'paper',x,1.54,.2);for(let i=0;i<5;i++)ball(x-.12+i*.06,1.59,.17+(i%2)*.07,.04,material(i%2?0x7667a2:0xc57554));}
    for(const x of [-1.15,1.1]){mesh(new THREE.CylinderGeometry(.11,.095,.24,24),'paper',x,1.65,-.25);const handle=mesh(new THREE.TorusGeometry(.085,.021,8,20),'paper',x+.12,1.66,-.25);handle.rotation.y=Math.PI/2;}
    const boxGroup=new THREE.Group();boxGroup.position.set(0,1.54,.3);root.add(boxGroup);named.gift=boxGroup;box(0,.12,0,.95,.24,.62,'wood',boxGroup);const lid=box(0,.25,-.31,.98,.055,.65,'brass',boxGroup,'gift-lid');lid.geometry.translate(0,0,.325);
    for(const x of [-4.5,-2.6])box(x,.89,.9,.1,.7,.1,'edge');box(-3.55,1.18,.9,2.4,.12,.52,'wood');box(-3.55,1.65,.6,2.4,.4,.09,'wood');
    const shade=new THREE.Group();root.add(shade);named['sisi-leaf-shade']=shade;
    rod([-4.2,1.22,.64],[-4.05,2.55,.68],.025,'wood',shade);const leaf=ball(-3.76,2.52,.68,.5,'green',shade);leaf.scale.set(1.6,.1,.85);leaf.rotation.z=-.15;
    rod([-4.3,2.6,.68],[-3.12,2.44,.68],.012,'brass',shade);
    const plant=new THREE.Group();plant.position.set(4,.6,-1.2);root.add(plant);rod([0,0,0],[0,1.25,0],.035,'wood',plant);for(let i=0;i<6;i++){const leaf=ball(Math.sin(i)*.24,.4+i*.13,Math.cos(i)*.15,.18,'green',plant);leaf.scale.set(1.5,.18,.7);}
  }
  function rocket(){
    const g=new THREE.Group();g.position.set(2.75,.62,-1.65);root.add(g);named.rocket=g;g.name='Loikka-research-ship';
    const body=mesh(new THREE.LatheGeometry([new THREE.Vector2(.7,0),new THREE.Vector2(.82,.3),new THREE.Vector2(.85,1.6),new THREE.Vector2(.7,2.7),new THREE.Vector2(.35,3.5),new THREE.Vector2(0,3.75)],48),'paper',0,0,0,g);
    const nose=mesh(new THREE.ConeGeometry(.5,.9,32),'orange',0,3.28,0,g);nose.scale.set(1,.8,1);
    const hole=mesh(new THREE.CircleGeometry(.48,40),'dark',0,1.94,.846,g);const rim=mesh(new THREE.TorusGeometry(.49,.055,10,40),'brass',0,1.94,.86,g);
    named.window=hole;named.rim=rim;
    for(const a of [-1,1]){const fin=box(a*.74,.4,0,.18,.85,.85,'orange',g);fin.rotation.z=-a*.27;box(a*.78,.04,0,.6,.1,.9,'dark',g);}
    for(const a of [-.36,.36])rod([a,-.02,.48],[a,-.02,1.4],.05,'brass',g);for(let i=0;i<4;i++)box(0,-.015,.6+i*.22,.72,.045,.08,'wood',g);
    const plume=new THREE.Group();g.add(plume);named.plume=plume;const flame=mesh(new THREE.ConeGeometry(.35,2.2,24),'lamp',0,-1.05,0,plume);flame.rotation.z=Math.PI;const glow=ball(0,-.4,0,.32,material(0xffc683,{emissive:0xfbb675,emissiveIntensity:1,transparent:true,opacity:.35,depthWrite:false}),plume);glow.scale.y=1.7;
    const luggage=new THREE.Group();luggage.position.set(1.5,.65,-.5);root.add(luggage);named.luggage=luggage;box(0,.18,0,.72,.35,.55,'dark',luggage);notebook(0,.38,0,luggage);const stone=ball(.24,.51,.12,.11,'stone',luggage);stone.scale.y=.6;
    for(const x of [-3,0,3]){rod([x,.5,2],[x,1.15,2],.035,'wood');lantern(x,1.15,2);}
  }
  function space(){
    const sky=mesh(new THREE.SphereGeometry(190,32,16),new THREE.MeshBasicMaterial({color:0x0b172d,side:THREE.BackSide}),0,0,0);sky.name='later-star-field';
    const vertices=[],colors=[];for(let i=0;i<420;i++){const y=1-2*(i+.5)/420,a=i*2.399963,r=Math.sqrt(1-y*y),radius=160;vertices.push(radius*r*Math.cos(a),radius*y,radius*r*Math.sin(a));colors.push(...(i%7===0?[1,.72,.4]:[.66,.8,1]));}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));const points=new THREE.Points(geometry,new THREE.PointsMaterial({vertexColors:true,size:.5,sizeAttenuation:true,transparent:true,opacity:.85}));root.add(points);
  }
  function cabin(){
    space();for(let i=0;i<9;i++)box(-3.2+i*.8,.46,0,.78,.18,5,'dark');
    box(-3.2,2.2,-1.4,.16,3.6,4,'dark');box(3.2,2.2,-1.4,.16,3.6,4,'dark');box(0,3.9,-1.4,6.5,.15,4,'dark');
    // The view through this ring stays open to the actual star field.
    const window=mesh(new THREE.TorusGeometry(1.43,.15,12,64),'brass',.5,2.1,-2.4);window.scale.x=1.5;
    box(-2.6,2.2,-2.4,1.25,3.4,.15,'dark');box(3,2.2,-2.4,.6,3.4,.15,'dark');box(.5,.66,-2.4,4.6,.5,.15,'dark');box(.5,3.65,-2.4,4.6,.5,.15,'dark');
    box(0,1.2,.55,2.5,.14,1.25,'wood');notebook(.22,1.3,.7);
    const ink=new THREE.Group();root.add(ink);named.ink=ink;
    const circle=Array.from({length:49},(_,i)=>[.01+Math.cos(i*Math.PI/24)*.1,1.36,.7+Math.sin(i*Math.PI/24)*.1]);line(circle,0x36576b,ink,.008);line([[.36,1.36,.65],[.4,1.36,.59],[.48,1.36,.61],[.5,1.36,.68],[.43,1.36,.74],[.43,1.36,.77]],0x36576b,ink,.009);ball(.43,1.36,.83,.011,'dark',ink);
    const recorder=box(.95,1.35,.55,.3,.13,.43,'dark');recorder.name='stored-message-recorder';ball(.95,1.43,.65,.024,'lamp');
    const stone=ball(-.72,1.4,.55,.14,'stone',root,'cabin-stone');stone.scale.y=.6;
    box(-1.45,1.05,-.6,.9,.2,.8,'orange');box(-1.45,1.6,-.95,.9,1,.13,'orange');
    lantern(-2.8,2,-.5);
  }
  function archipelago(){
    // This is the familiar coastal landscape seen from above, before the later star field.
    mesh(new THREE.SphereGeometry(190,32,16),new THREE.MeshBasicMaterial({color:0x9ab9c4,side:THREE.BackSide}),0,0,0);
    const sea=mesh(new THREE.PlaneGeometry(160,160),material(0x4d8492,{roughness:.34,metalness:.1}),0,-.15,0);sea.rotation.x=-Math.PI/2;
    const terrain=new THREE.PlaneGeometry(28,22,112,88);terrain.rotateX(-Math.PI/2);
    const positions=terrain.getAttribute('position'),colors=[],shore=new THREE.Color(0xc2b088),forest=new THREE.Color(0x65866c),high=new THREE.Color(0x899a7b);
    const hill=(x,z,cx,cz,sx,sz,h)=>h*Math.exp(-((x-cx)**2/sx+(z-cz)**2/sz));
    for(let i=0;i<positions.count;i++){
      const x=positions.getX(i),z=positions.getZ(i);
      let h=hill(x,z,-4,-1,34,39,2.65)+hill(x,z,6,-3,11,20,1.65)+hill(x,z,3,6,16,6,1.25)-.63;
      h+=Math.sin(x*1.8+z*.7)*.1+Math.cos(z*1.5-x*.4)*.075;
      const main=Math.abs(x-(-3.4+.8*Math.sin(z*.6)));
      const branch=Math.abs(z-(-2.2+.55*(x+3.4)+.35*Math.sin(x*1.2)));
      if(z<5.5&&z>-8.5)h-=1.7*Math.exp(-main*main/.12);
      if(x>-4.2&&x<.5)h-=1.35*Math.exp(-branch*branch/.085);
      positions.setY(i,h);
      const color=h<.22?shore.clone().lerp(forest,Math.max(0,h)/.22):forest.clone().lerp(high,Math.min(1,(h-.22)/2));colors.push(color.r,color.g,color.b);
    }
    terrain.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));terrain.computeVertexNormals();
    const land=mesh(terrain,material(0xffffff,{vertexColors:true}),0,0,0);land.name='home-archipelago-and-branching-river';
    for(let i=0;i<24;i++){
      const a=i*2.399,x=9.5*Math.cos(a),z=7.2*Math.sin(a),r=.18+(i%4)*.09;
      const isle=ball(x,-.04,z,r,material(i%3?0x889976:0xbaae90));isle.scale.set(1.5,.45,1);
    }
    // Wisps stay above the landscape; the river remains readable between them.
    const cloudMaterial=material(0xe7eff0,{transparent:true,opacity:.18,depthWrite:false});
    for(const [x,z,s] of [[-8,-7,1.8],[7,3,1.5],[-7,7,1.3]]){const cloud=ball(x,3.2,z,s,cloudMaterial);cloud.scale.set(2,.13,.75);}
    const window=mesh(new THREE.TorusGeometry(6.5,.16,12,80),'dark',0,7,7);window.rotation.x=-.7;window.name='ship-window-foreground';
  }
  if(['bank','nest','feast','cape','egg'].includes(kind))bank();
  if(kind==='workshop')workshop();
  if(kind==='nest'||kind==='egg')nest(kind==='egg');
  if(kind==='feast')feast();
  if(kind==='cape')rocket();
  if(kind==='cabin')cabin();
  if(kind==='orbit')archipelago();
  if(kind==='credits')space();
  if(kind==='pond'){const ring=mesh(new THREE.RingGeometry(.95,1,80),new THREE.MeshBasicMaterial({color:0xe8d9b0,transparent:true,opacity:.6,side:THREE.DoubleSide}),-.5,.025,0);ring.rotation.x=-Math.PI/2;named.ring=ring;}
  function update(direction){
    const {art,props,local,season}=direction;
    if(named.snow)named.snow.visible=season==='winter';
    if(named['bank-surface'])named['bank-surface'].material.color.setHex(season==='winter'?0xd3dfdc:season==='autumn'?0x8b805b:season==='spring'?0x879675:0x657357);
    palette.green.color.setHex(season==='winter'?0xabb5a5:season==='autumn'?0x9a8358:season==='spring'?0x91a276:0x718059);
    if(named.leaf){named.leaf.visible=art==='autumn'||art==='bench';named.leaf.position.set(art==='bench'?-3.6:.65,2.8-props.leaf*1.9,.3+Math.sin(props.leaf*5)*.18);named.leaf.rotation.set(.15,props.leaf*2,Math.sin(props.leaf*7)*.4);}
    if(named['familiar-stone']&&art==='adult-bank')named['familiar-stone'].position.set(-.7+props.stone*.75,1.24-props.stone*.54,.6);
    if(named.marks)named.marks.children.forEach((o,i)=>o.visible=i/9<=props.marks);
    if(named.table&&kind==='workshop')named.table.visible=art!=='growth';
    if(named.map)named.map.visible=art==='map';if(named['folded-paper'])named['folded-paper'].rotation.z=(1-props.paper)*Math.PI*.88;
    if(named.keepsakes)named.keepsakes.visible=art==='keepsakes';if(named.tools)named.tools.visible=art==='tools';
    if(named.eggs)named.eggs.visible=kind==='egg'||art==='evening-nest';
    if(named.shelter){named.shelter.visible=art!=='nest'&&kind!=='egg';named.shelter.position.x=1.4+(1-props.windbreak)*1.5;}
    if(named.gift)named.gift.visible=art==='wood-box';if(named['gift-lid'])named['gift-lid'].rotation.x=-1.35*(1-props.box);
    if(named['sisi-leaf-shade'])named['sisi-leaf-shade'].visible=art==='bench';
    if(named.rocket){named.rocket.position.y=.62+props.launch*props.launch*18;named.rocket.scale.setScalar(1-props.launch*.3);named.rocket.visible=art!=='turn-home';}
    if(named.plume)named.plume.visible=art==='launch';if(named.luggage)named.luggage.visible=art==='luggage';
    if(named.ink)named.ink.children.forEach((o,i)=>o.visible=art!=='notebook'||props.drawing>(i+1)/4);
    if(named['cabin-stone'])named['cabin-stone'].position.set(-.72+props.stone*.3,1.57-props.stone*.17,.35+props.stone*.2);
    if(named.ring){named.ring.scale.setScalar(.2+props.ring*2.5);named.ring.material.opacity=(1-props.ring)*.65;}
    if(named.crack)named.crack.visible=props.crack>.02;
    if(named.closedEgg)named.closedEgg.visible=props.bill===0;
    if(named['opened-eggshell'])named['opened-eggshell'].visible=props.bill>0;
    if(named['egg-interior'])named['egg-interior'].visible=props.bill>0;
    if(named.bill){named.bill.visible=props.bill>0;named.bill.position.z=.18+props.bill*.25;named.bill.position.y=.4+Math.sin(Math.min(props.bill*2,1)*Math.PI)*.015;}
    if(named.chips){named.chips.visible=props.bill>0;named.chips.children.forEach((o,i)=>{o.position.set(Math.sin(i*2.4)*props.bill*.4,.39-props.bill*(.2+i*.02),.38+props.bill*.22);o.rotation.set(props.bill*i,.2*i,props.bill*2);});}
    root.updateMatrixWorld(true);
  }
  function dispose(){const resources=new Set();root.traverse(o=>{if(o.geometry)resources.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){resources.add(m);for(const v of Object.values(m))if(v?.isTexture)resources.add(v);}});for(const m of Object.values(palette))resources.add(m);for(const r of resources)r.dispose();root.removeFromParent();}
  return {root,named,update,dispose};
}
