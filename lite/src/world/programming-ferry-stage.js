import * as THREE from 'three';

const bearing={north:0,east:-Math.PI/2,south:Math.PI,west:Math.PI/2};
export function ferryMapPosition(cell,width,height,spacing){
  return {x:(cell.x-(width-1)/2)*spacing,z:(cell.y-(height-1)/2)*spacing};
}

export function drawProgrammingFerry(parent,model) {
  const group=new THREE.Group();
  group.name='programming-ferry-harbour';
  parent.add(group);
  const {width,height,rocks}=model.board;
  const spacing=Math.min(.57,3.7/width,2.85/height);
  const location=cell=>ferryMapPosition(cell,width,height,spacing);
  const mats=Object.fromEntries(Object.entries({
    basin:0x436b68, sea:0x6cafb1, deeper:0x589a9e, sand:0xdac18e, spruce:0x517b58,
    dark:0x284a42, cedar:0x8e6543, sail:0xf6e6b4, gold:0xe9ad61, blue:0x337a75,
    rock:0x69766c, trail:0xc4e5d2, stopped:0xc87f57,
  }).map(([key,color])=>[key,new THREE.MeshStandardMaterial({color,roughness:.71})]));
  function mesh(name,geometry,color,x,y,z,host=group){
    const object=new THREE.Mesh(geometry,mats[color]);
    object.name=name;
    object.position.set(x,y,z);
    host.add(object);
    return object;
  }
  function box(name,x,y,z,w,h,d,color,host=group){
    return mesh(name,new THREE.BoxGeometry(w,h,d),color,x,y,z,host);
  }
  const spanX=width*spacing,spanZ=height*spacing;
  box('harbour-basin',0,.24,0,spanX+.64,.12,spanZ+.46,'basin');
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const at=location({x,y});
    box('charted-water-cell',at.x,.32,at.z,spacing*.975,.075,spacing*.975,(x+y)%2?'sea':'deeper');
  }
  for(const edge of [-1,1]){
    box('coast-board',edge*(spanX+.24)/2,.36,0,.22,.15,spanZ+.25,'sand');
    box('coast-board',0,.36,edge*(spanZ+.19)/2,spanX+.43,.15,.16,'sand');
  }
  for(const rock of rocks){
    const at=location(rock);
    const stone=mesh('shoal-rock',new THREE.DodecahedronGeometry(spacing*.29,0),'rock',at.x,.44,at.z);
    stone.scale.y=.56;
    stone.rotation.y=(rock.x*3+rock.y)*.29;
  }
  const ring=location(model.start);
  const origin=mesh('departure-ring',new THREE.RingGeometry(spacing*.29,spacing*.33,24),'sail',ring.x,.37,ring.z);
  origin.rotation.x=-Math.PI/2;
  function dock(cell,final){
    const at=location(cell);
    box(final?'destination-dock':'intermediate-dock',at.x,.407,at.z,spacing*.67,.072,spacing*.67,final?'spruce':'gold');
    for(const d of [-1,1]){
      box('dock-post',at.x+d*spacing*.23,.46,at.z+spacing*.2,.036,.19,.036,'cedar');
    }
  }
  (model.goal?.via??[]).forEach(cell=>dock(cell,false));
  if(model.goal)dock(model.goal.destination,true);
  function directionMarker(name,at,heading,scale){
    const pointer=new THREE.Group();
    pointer.name=name;
    pointer.position.set(at.x,.48,at.z);
    pointer.rotation.y=bearing[heading];
    group.add(pointer);
    const tip=mesh('arrow-head',new THREE.ConeGeometry(scale*.55,scale*1.35,3),'sail',0,0,-scale*.26,pointer);
    tip.rotation.x=-Math.PI/2;
    box('arrow-shaft',0,0,scale*.35,scale*.32,.03,scale*.72,'sail',pointer);
  }
  if(model.goal?.heading)directionMarker('arrival-heading',location(model.goal.destination),model.goal.heading,spacing*.18);
  directionMarker('fixed-north-marker',{x:-spanX/2-.12,z:-spanZ/2-.16},'north',spacing*.32);
  for(let i=1;i<model.path.length;i++){
    const from=location(model.path[i-1]),to=location(model.path[i]);
    const connector=box('sailed-trace',(from.x+to.x)/2,.376,(from.z+to.z)/2,.034,.014,
      Math.hypot(to.x-from.x,to.z-from.z),'trail');
    connector.rotation.y=Math.atan2(to.x-from.x,to.z-from.z);
  }
  const at=location(model.pose);
  const boat=new THREE.Group();boat.name='programmable-ferry';
  boat.position.set(at.x,.37,at.z);boat.rotation.y=bearing[model.pose.heading];group.add(boat);
  const shape=new THREE.Shape();
  shape.moveTo(0,spacing*.39);shape.lineTo(-spacing*.22,spacing*.08);
  shape.lineTo(-spacing*.18,-spacing*.31);shape.lineTo(spacing*.18,-spacing*.31);
  shape.lineTo(spacing*.22,spacing*.08);shape.closePath();
  const hull=new THREE.ExtrudeGeometry(shape,{depth:.10,bevelEnabled:false});
  hull.rotateX(-Math.PI/2);
  mesh('pointed-bow',hull,model.stopped?'stopped':'blue',0,0,0,boat);
  box('ferry-deck',0,.105,spacing*.065,spacing*.32,.035,spacing*.40,'cedar',boat);
  box('parcel',0,.173,spacing*.13,spacing*.19,.12,spacing*.16,'gold',boat);
  box('ferry-flagstaff',0,.209,-spacing*.083,.024,.20,.024,'dark',boat);
  box('ferry-flag',spacing*.088,.276,-spacing*.083,spacing*.18,.088,.018,'sail',boat);
  return {width,height,start:{...model.start},goal:model.goal,pose:{...model.pose},path:model.path.map(cell=>({...cell})),
    step:model.step,stopped:model.stopped,north:'-z'};
}
