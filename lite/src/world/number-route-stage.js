import * as THREE from 'three';
/** Fixed frame: map x increases right; map y increases downward; north is decreasing y, represented by -Z. */
export function routeCellWorld(x,y,width,height,cell=.49){return {x:(x-(width-1)/2)*cell,z:(y-(height-1)/2)*cell};}
export function mountNumberRoute(parent,model){
 const g=new THREE.Group();g.name='number-route-island';parent.add(g);
 const mats={sea:new THREE.MeshStandardMaterial({color:0x5499a6,roughness:.65}),sand:new THREE.MeshStandardMaterial({color:0xdac891,roughness:.92}),grass:new THREE.MeshStandardMaterial({color:0x78aa74,roughness:.95}),dark:new THREE.MeshStandardMaterial({color:0x355a59,roughness:.8}),gold:new THREE.MeshStandardMaterial({color:0xe2ae52,roughness:.7}),white:new THREE.MeshStandardMaterial({color:0xf4efd5,roughness:.8})};
 function box(x,y,z,w,h,d,mat){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats[mat]);o.position.set(x,y,z);g.add(o);return o;}
 const width=Math.max(1,Math.min(12,Math.floor(model.width))),height=Math.max(1,Math.min(12,Math.floor(model.height))),cell=Math.min(.49,3.9/width,2.4/height);
 box(0,.25,0,width*cell+.55,.10,height*cell+.55,'sea');
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const p=routeCellWorld(x,y,width,height,cell);box(p.x,.34,p.z,cell*.94,.10,cell*.94,(x+y)%2?'grass':'sand');}
 const origin=routeCellWorld(model.origin.x,model.origin.y,width,height,cell);
 const marker=new THREE.Group();marker.position.set(origin.x,.43,origin.z);g.add(marker);
 const ring=new THREE.Mesh(new THREE.RingGeometry(cell*.25,cell*.31,28),mats.white);ring.rotation.x=-Math.PI/2;ring.position.y=.01;marker.add(ring);
 // Triangle tip is the actor's given heading, not the learner's answer.
 const shape=new THREE.Shape();shape.moveTo(0,cell*.29);shape.lineTo(-cell*.20,-cell*.18);shape.lineTo(cell*.20,-cell*.18);shape.closePath();
 const arrow=new THREE.Mesh(new THREE.ShapeGeometry(shape),mats.gold);arrow.name='number-route-heading';arrow.rotation.x=-Math.PI/2;arrow.position.y=.06;
 const angle={north:0,east:-Math.PI/2,south:Math.PI,west:Math.PI/2}[model.heading]??0;arrow.rotation.z=angle;marker.add(arrow);
 // A fixed north marker is always on the map's north edge, independent of camera rotation.
 const north=routeCellWorld(0,0,width,height,cell),nz=north.z-cell*.64;
 box(north.x,.43,nz,cell*.48,.055,cell*.34,'dark');
 // A real N glyph on the fixed north edge makes the compass legible in the 3D view.
 box(north.x-cell*.12,.465,nz,cell*.035,.025,cell*.22,'white');
 box(north.x+cell*.12,.465,nz,cell*.035,.025,cell*.22,'white');
 const slash=box(north.x,.465,nz,cell*.035,.025,cell*.31,'white');slash.rotation.y=-Math.PI/4;
 return {group:g,details:{width,height,origin:{...model.origin},heading:model.heading,frame:model.frame,axes:'x-right,y-down',north:'-z'},dispose(){g.traverse(o=>o.geometry?.dispose());for(const m of Object.values(mats))m.dispose();g.removeFromParent();}};
}
