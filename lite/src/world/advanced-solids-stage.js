import * as THREE from 'three';

/** Three.js construction of the same solid dimensions used by the exact worksheet. */
export function mountAdvancedSolidsStage(parent, model, revealed = false) {
  const root = new THREE.Group();
  root.name = 'advanced-solids';
  parent.add(root);
  const materials = [];
  const material = (color, opacity = 1) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: .73, transparent: opacity < 1, opacity,
      side: THREE.DoubleSide, depthWrite: opacity === 1 });
    materials.push(m);
    return m;
  };
  const brass = material(0xc89d53);
  const dark = material(0x355359);
  const tabletop = material(0x78604b);
  const waters = [material(0x61b8bf,.76), material(0x4299ae,.77), material(0x307f9b,.8)];
  const vector = (x,y,z) => new THREE.Vector3(x,y,z);
  const mesh = (group, geometry, paint, x = 0, y = 0, z = 0) => {
    const piece = new THREE.Mesh(geometry, paint);
    piece.position.set(x,y,z);
    group.add(piece);
    return piece;
  };
  const box = (group,w,h,d,paint,x,y,z) => mesh(group,new THREE.BoxGeometry(w,h,d),paint,x,y,z);
  const rod = (group,a,b,paint,radius = .024) => {
    const from=vector(...a),to=vector(...b),delta=to.clone().sub(from),length=delta.length();
    if (length<1e-6) return;
    const piece=mesh(group,new THREE.CylinderGeometry(radius,radius,length,8),paint);
    piece.position.copy(from.lerp(to,.5));
    piece.quaternion.setFromUnitVectors(vector(0,1,0),delta.normalize());
  };
  const points = base => {
    const {width:w,depth:d}=base;
    return base.kind==='rectangle'?[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]]
      : [[-w/3,-d/3],[2*w/3,-d/3],[-w/3,2*d/3]];
  };
  const sheet = (group, trianglePoints, paint) => {
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(trianglePoints.flat(2),3));
    geometry.computeVertexNormals();
    mesh(group,geometry,paint);
  };
  const face = (group, vertices, paint) => sheet(group,vertices.slice(1,-1).map((b,i)=>[vertices[0],b,vertices[i+2]]),paint);
  const circleFace = (group,r,paint,y) => {
    const disk=mesh(group,new THREE.CircleGeometry(r,40),paint,0,y,0);
    disk.rotation.x=-Math.PI/2;
  };
  const buildColumn = (group,base,height,caps,paint,y = 0) => {
    if (base.kind==='circle') {
      mesh(group,new THREE.CylinderGeometry(base.radius,base.radius,height,40,1,true),paint,0,y+height/2,0);
      if(caps>=1)circleFace(group,base.radius,paint,y);
      if(caps===2)circleFace(group,base.radius,paint,y+height);
      return;
    }
    const lower=points(base).map(([x,z])=>[x,y,z]),upper=lower.map(([x,,z])=>[x,y+height,z]);
    for(let i=0;i<lower.length;i++){
      const j=(i+1)%lower.length;
      face(group,[lower[i],lower[j],upper[j],upper[i]],paint);
    }
    if(caps>=1)face(group,lower,paint);
    if(caps===2)face(group,upper,paint);
  };
  const buildCone = (group,base,height,caps,paint) => {
    if(base.kind==='circle'){
      mesh(group,new THREE.ConeGeometry(base.radius,height,40,1,true),paint,0,height/2,0);
      if(caps)circleFace(group,base.radius,paint,0);
      return;
    }
    const lower=points(base).map(([x,z])=>[x,0,z]);
    sheet(group,lower.map((a,i)=>[a,lower[(i+1)%lower.length],[0,height,0]]),paint);
    if(caps)face(group,lower,paint);
  };
  const dimensions = shape => {
    if(shape.kind==='sphere')return [2*shape.radius,2*shape.radius,2*shape.radius];
    if(shape.kind==='ellipsoid')return shape.radii.map(r=>2*r);
    if(shape.kind==='frustum')return [2*shape.lower,shape.height,2*shape.lower];
    const base=shape.base;
    const height=shape.kind==='flat'?0:shape.height;
    return base.kind==='circle'?[2*base.radius,height,2*base.radius]:[base.width,height,base.depth];
  };
  const sectionPlane = (group,shape) => {
    const neutral=material(0xd9c389,.46);
    if(shape.kind==='sphere'||shape.kind==='ellipsoid'){
      const [rx,ry,rz]=shape.kind==='sphere'?[shape.radius,shape.radius,shape.radius]:shape.radii;
      const ellipse=mesh(group,new THREE.CircleGeometry(1,48),neutral,0,ry,.015);
      ellipse.scale.set(rx,ry,1);
      for(const target of [[rx,ry,0],[0,ry*2,0],[0,ry,rz]])rod(group,[0,ry,0],target,brass);
      return;
    }
    if(shape.kind==='flat')return;
    const [width,height]=dimensions(shape);
    const w=(shape.kind==='column'||shape.kind==='cone')&&shape.base.kind==='right-triangle' ? width/3 : width/2;
    const q=shape.kind==='cone'?0:shape.kind==='frustum'?shape.upper:w;
    face(group,[[-w,0,0],[w,0,0],[q,height,0],[-q,height,0]],neutral);
    rod(group,[0,0,.03],[0,height,.03],brass);
  };
  const drawFigure = (figure,index,scale,offset) => {
    const local=new THREE.Group();
    const {shape}=figure;
    const [w,h,d]=dimensions(shape);
    const sliced=model.view==='section';
    const translucent=sliced||model.target==='volume'||!!model.demoFill;
    const coat=material(figure.color,translucent?.35:1);
    const stamp=material(figure.color);
    if(shape.kind==='column')buildColumn(local,shape.base,shape.height,shape.caps,coat);
    else if(shape.kind==='cone')buildCone(local,shape.base,shape.height,shape.caps,coat);
    else if(shape.kind==='sphere'||shape.kind==='ellipsoid'){
      const [rx,ry,rz]=shape.kind==='sphere'?[shape.radius,shape.radius,shape.radius]:shape.radii;
      const body=mesh(local,new THREE.SphereGeometry(1,40,24,0,sliced?Math.PI:2*Math.PI),coat,0,ry,0);
      if(sliced)body.rotation.y=Math.PI;
      body.scale.set(rx,ry,rz);
      if(revealed&&model.target==='volume'){
        const filled=mesh(local,new THREE.SphereGeometry(1,32,20),waters[1],0,ry,0);
        filled.scale.set(rx,ry,rz);
      }
    }else if(shape.kind==='frustum'){
      mesh(local,new THREE.CylinderGeometry(shape.upper,shape.lower,shape.height,40),coat,0,shape.height/2,0);
    }else if(shape.base.kind==='circle')circleFace(local,shape.base.radius,coat,0);
    else face(local,points(shape.base).map(([x,z])=>[x,0,z]),coat);
    if(sliced)sectionPlane(local,shape);
    if(shape.kind==='column'&&((model.demoFill==='layers'&&figure.id==='Uusi')||(model.demoFill==='cone-to-column'&&figure.id==='Vertailu'))){
      const stepHeight=shape.height/3;
      for(let step=0;step<(model.fillStep??0);step++)buildColumn(local,shape.base,stepHeight,2,waters[step],step*stepHeight);
    }
    if(shape.kind==='cone'&&model.demoFill==='cone-to-column'&&figure.id==='Uusi'&&(model.fillStep??0)<3)
      buildCone(local,shape.base,shape.height,1,waters[0]);
    if(model.target==='surface'&&shape.kind==='cone'&&shape.base.kind==='circle'){
      rod(local,[0,0,0],[0,h,0],dark);
      rod(local,[0,0,d/2],[0,h,0],brass,.05);
    }
    if(model.target==='height'&&shape.kind==='column')for(let j=0;j<8;j+=2)
      rod(local,[w*.57,h*j/8,0],[w*.57,h*(j+1)/8,0],brass,.04);
    local.scale.setScalar(scale);
    if(shape.kind==='cone'&&model.demoFill==='cone-to-column')local.rotation.x=Math.PI;
    else if(figure.pose==='horizontal')local.rotation.z=Math.PI/2;
    else if(figure.pose==='tilted')local.rotation.z=-.27;
    local.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(local);
    const center=bounds.getCenter(vector(0,0,0));
    local.position.set(offset-center.x,.44-bounds.min.y,-center.z);
    root.add(local);
    const slot=5.1/model.figures.length;
    box(root,Math.min(1.03,slot*.69),.11,.72,tabletop,offset,.40,0);
    // Small ordered studs tie the physical figures to the same A–D card order without a color cue.
    for(let j=0;j<=index;j++)mesh(root,new THREE.SphereGeometry(.035,8,5),stamp,offset+(j-index/2)*.085,.47,.40);
  };

  const net = figure => {
    const shape=figure.shape;
    if(shape.kind!=='cone'&&shape.kind!=='column')return;
    const local=new THREE.Group(),surface=material(figure.color,.88);
    const drawDisk=(radius,x,y)=>{
      mesh(local,new THREE.CircleGeometry(radius,40),surface,x,y,.01);
    };
    const drawBase=(base,x,y)=>{
      if(base.kind==='circle')drawDisk(base.radius,x,y);
      else face(local,points(base).map(([px,py])=>[x+px,y+py,.01]),surface);
    };
    if(shape.kind==='cone'&&shape.base.kind==='circle'){
      const l=shape.slant,r=shape.base.radius,arc=2*Math.PI*r/l;
      mesh(local,new THREE.CircleGeometry(l,48,-Math.PI/2-arc/2,arc),surface,-l*.32,l*.12,0);
      if(shape.caps)drawDisk(r,l+r*.24,l*.12);
    }else if(shape.kind==='column'){
      const base=shape.base;
      const widths=base.kind==='circle'?[2*Math.PI*base.radius]:base.kind==='rectangle'
        ?[base.width,base.depth,base.width,base.depth]:[base.width,base.depth,base.diagonal];
      const total=widths.reduce((a,b)=>a+b,0);
      let x=-total/2;
      for(const w of widths){
        mesh(local,new THREE.PlaneGeometry(w,shape.height),surface,x+w/2,0,0);
        rod(local,[x,-shape.height/2,.02],[x,shape.height/2,.02],brass,.035);
        x+=w;
      }
      const baseHeight=base.kind==='circle'?base.radius:base.depth/2;
      if(shape.caps>=1)drawBase(base,-total*.25,-shape.height/2-baseHeight*1.17);
      if(shape.caps===2)drawBase(base,total*.22,shape.height/2+baseHeight*1.17);
    }
    const bounds=new THREE.Box3().setFromObject(local),size=bounds.getSize(vector(0,0,0));
    const scale=Math.min(4.7/size.x,2.38/size.y);
    const middle=bounds.getCenter(vector(0,0,0));
    local.scale.setScalar(scale);
    local.position.set(-middle.x*scale,.56-bounds.min.y*scale,.12);
    root.add(local);
  };

  const cubeGrid = () => {
    const d=model.grid.subdivisions,section=model.view==='section';
    const extent=1.8,origin=[-extent/2,.5,-extent/2],step=extent/d;
    const segments=[];
    const add=(a,b)=>segments.push(...a,...b);
    for(let i=0;i<=d;i++)for(let j=0;j<=d;j++){
      const x=origin[0]+i*step,y=origin[1]+i*step,z=origin[2]+j*step;
      const front=j===d||j===0||i===0||i===d;
      if(section||front){
        add([origin[0],y,z],[origin[0]+extent,y,z]);
        add([x,origin[1],z],[x,origin[1]+extent,z]);
        add([x,origin[1]+j*step,origin[2]],[x,origin[1]+j*step,origin[2]+extent]);
      }
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(segments,3));
    const lines=new THREE.LineBasicMaterial({color:0x57908b,transparent:true,opacity:.74});
    materials.push(lines);
    root.add(new THREE.LineSegments(geo,lines));
    box(root,step,step,step,brass,origin[0]+step/2,origin[1]+step/2,origin[2]+extent-step/2);
  };

  box(root,5.6,.12,2.3,tabletop,0,.31,0);
  if(model.grid)cubeGrid();
  else if(model.view==='net'&&!revealed)net(model.figures.find(f=>f.id==='Uusi')??model.figures[0]);
  else{
    const gap=5.15/model.figures.length;
    const maximum=Math.max(...model.figures.map(f=>Math.max(...dimensions(f.shape))));
    for(const [i,figure] of model.figures.entries()){
      const max=model.mode==='identify'?Math.max(...dimensions(figure.shape)):maximum;
      drawFigure(figure,i,Math.min(gap*.74,2.24)/max,(i-(model.figures.length-1)/2)*gap);
    }
  }
  return {
    snapshot:()=>({mode:model.mode,view:model.view,figureCount:model.figures.length,revealed,
      comparisonOpen:!!model.comparisonOpen,
      ...(model.fillStep?{fillStep:model.fillStep,filledFraction:[model.fillStep,3]}:{})}),
    advanceTime(){},
    dispose(){
      root.traverse(piece=>piece.geometry?.dispose());
      for(const paint of materials)paint.dispose();
      root.removeFromParent();
    },
  };
}
