import { mountReactionLabStage } from './reaction-lab-stage';
import { mountMatterCyclesStage } from './matter-cycles-stage';
import { mountInquiryIslandsStage } from './inquiry-islands-stage';
import { mountCarbonKitchenStage } from './carbon-kitchen-stage';
import { mountAtomicWorldStage } from './atomic-world-stage';
import { mountWavesObservatoryStage } from './waves-observatory-stage';
import { mountLogicWorkshopStage } from './logic-workshop-stage';
import { mountChemicalInvestigationStage } from './chemical-investigation-stage';
import { mountPhysicsInvestigationStage } from './physics-investigation-stage';
import { mountMaterialsMixturesStage } from './materials-mixtures-stage';
import { mountEnergyIslandsStage } from './energy-islands-stage';
import { mountAdvancedSolidsStage } from './advanced-solids-stage';
import { mountCircuitWorkshopStage } from './circuit-workshop-stage';
import { mountRightTriangleStage } from './right-triangle-stage';
import { mountElectricityHarborStage } from './electricity-harbor-stage';
import { drawStatisticsHarbor } from './statistics-harbor-stage';
import { mountThermalStationStage } from './thermal-station-stage';
import { drawProgrammingFerry } from './programming-ferry-stage';
import { drawMeasurementStation } from './measurement-station-stage';
import * as THREE from 'three';
import { mountNumberRoute } from './number-route-stage';
import { drawSpatialVolume } from './spatial-volume-stage';
import { buildSolidConstructionStage } from './solid-construction-stage';
import { buildSolidWorkshopStage } from './solid-workshop-stage';
import { trackMotion, pairForces } from '../content/models/force-track';
import { filtrationOutcome } from '../content/models/filtration';
import { spaceDiametersKm, meanSpaceDistancesKm, spaceLight } from '../content/models/space';
import { solveLinear } from '../content/correction-models';
import { diffuse, moveMarked } from '../content/models/diffusion-model';
import { nearData, solstice } from '../content/models/space-observatory';
import { workJ, powerW, positionM } from '../content/models/work-power';
import { derivedForces, horizontalMotion, slidingOnSurface, slidingDisplacement } from '../content/models/force-workshop';

/** Objects are visualizations of the task model; no answer or learner evidence is emitted. */
export function mountExpeditionStage(world) {
  const scene = world.scene;
  if (!scene) return { show() {}, advanceTime() {}, celebrate() {}, restoreEffects() {}, clear() {}, setVisible() {}, dispose() {}, snapshot: () => ({ kind: null, effects: [] }) };
  const root = new THREE.Group();
  // The camera remains the original pond camera. The platform stands in its foreground.
  root.position.set(0.6, 0.2, 6.0); scene.add(root);
  const marks = new THREE.Group(), effects = new Map(); scene.add(marks);
  let model = null, revealed = false, elapsed = 0, cart = null, moving = null, mountedActivity = null, marker = null, markerCell = 0, markerClock = 0, markerSeed = 314159, details = {}, disposed = false;
  const mats = {
    wood: new THREE.MeshStandardMaterial({ color: 0x765039, roughness: .87 }),
    woodLight: new THREE.MeshStandardMaterial({ color: 0x8a6347, roughness: .87 }),
    rim: new THREE.MeshStandardMaterial({ color: 0xb28a4d, metalness: .55, roughness: .38 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x263f45, metalness: .25, roughness: .6 }),
    aqua: new THREE.MeshStandardMaterial({ color: 0x5faaa5, roughness: .5 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xe0b45b, roughness: .55 }),
    pale: new THREE.MeshStandardMaterial({ color: 0xe7e3c7, roughness: .8 }),
    red: new THREE.MeshStandardMaterial({ color: 0xbd6650, roughness: .65 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x4d7793, roughness: .5 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x87c6c2, transparent: true, opacity: .4, roughness: .22, metalness: .1, depthWrite: false }),
    lamp: new THREE.MeshStandardMaterial({ color: 0xffd67d, emissive: 0xe2a949, emissiveIntensity: .55, roughness: .35 }),
  };
  function mesh(geometry, material, x, y, z, parent = root) { const m = new THREE.Mesh(geometry, material); m.position.set(x,y,z); parent.add(m); return m; }
  function litGlobe(x,y,z,r,sunX) {
    const material=new THREE.ShaderMaterial({uniforms:{sunX:{value:sunX}},vertexShader:'varying vec3 v;void main(){v=normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float sunX;varying vec3 v;void main(){vec3 day=vec3(.28,.60,.69),night=vec3(.06,.15,.24);gl_FragColor=vec4(mix(night,day,smoothstep(-.05,.05,v.x*sunX)),1.);\n#include <colorspace_fragment>\n}'});
    return mesh(new THREE.SphereGeometry(r,32,20),material,x,y,z);
  }
  function box(x,y,z,w,h,d,mat='wood', parent=root) { return mesh(new THREE.BoxGeometry(w,h,d), mats[mat], x,y,z,parent); }
  function ball(x,y,z,r,mat='gold',parent=root) { return mesh(new THREE.SphereGeometry(r,16,10),mats[mat],x,y,z,parent); }
  function rod(a,b,r=.035,mat='rim',parent=root) { const va=new THREE.Vector3(...a), vb=new THREE.Vector3(...b), delta=vb.clone().sub(va); const o=mesh(new THREE.CylinderGeometry(r,r,delta.length(),10),mats[mat],...va.clone().add(vb).multiplyScalar(.5).toArray(),parent); o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()); return o; }
  function arrow(x,y,z,length,mat='red') { if (!length) return; const sign=Math.sign(length); rod([x,y,z],[x+length-sign*.14,y,z],.035,mat); const tip=mesh(new THREE.ConeGeometry(.12,.22,12),mats[mat],x+length,y,z); tip.rotation.z=-sign*Math.PI/2; }
  function platform() {
    box(0,0,0,7.6,.28,3.6,'wood');
    for(let i=0;i<10;i++) box(-3.42+i*.76,.15,0,.72,.045,3.45,i%2?'wood':'woodLight');
    for(const x of [-3.72,3.72]) box(x,.18,0,.12,.1,3.6,'rim');
    for(const z of [-1.72,1.72]) box(0,.18,z,7.5,.1,.12,'rim');
    for(const x of [-3.2,3.2]) for(const z of [-1.35,1.35]) box(x,-.45,z,.22,.9,.22,'dark');
  }
  function observatoryMotif() {
    // The home's lantern and an idle telescope are scene dressing, never controls or evidence.
    rod([-3.35,.22,-1.4],[-3.35,1.38,-1.4],.035,'rim');
    ball(-3.35,1.45,-1.4,.12,'lamp');
    rod([3.2,.22,-1.4],[3.2,.75,-1.4],.055,'dark');
    rod([2.94,.78,-1.4],[3.38,1.08,-1.4],.11,'rim');
  }
  function cartAt(x,z=0,parent=root) {
    const g=new THREE.Group(); g.position.set(x,.4,z); parent.add(g);
    box(0,.28,0,1.05,.38,.6,'aqua',g); box(0,.52,0,.75,.12,.52,'rim',g);
    for(const dx of [-.34,.34]) for(const dz of [-.33,.33]) { const wheel=mesh(new THREE.CylinderGeometry(.16,.16,.09,16),mats.dark,dx,.05,dz,g); wheel.rotation.x=Math.PI/2; }
    return g;
  }
  function rail() { for(const z of [-.36,.36]) rod([-3,.43,z],[3,.43,z],.045,'dark'); }
  function clear() { mountedActivity?.dispose(); mountedActivity=null; cart=null; moving=null; marker=null; markerCell=0; markerClock=0; markerSeed=314159; root.traverse(o=>{ if(o.geometry) o.geometry.dispose(); if(o.material && !Object.values(mats).includes(o.material)) o.material.dispose(); }); root.clear(); model=null; details={}; elapsed=0; world.setActivityFocus?.(false); world.invalidate(); }
  function show(next, options={}) {
    if(disposed) return;
    clear(); model=next; revealed=!!options.revealed; const is2d=next.kind==='observatory-scale'||(next.kind==='force-workshop'&&next.primary==='2d'); world.setActivityFocus?.(!is2d); if(!is2d) platform();
    if(next.kind.startsWith('observatory-') && next.kind!=='observatory-scale') observatoryMotif();
    switch(next.kind) {
      case 'statistics-harbor': { details = drawStatisticsHarbor(root, next); break; }
      case 'right-triangle': { mountedActivity = mountRightTriangleStage(root, next, revealed); details = mountedActivity.snapshot(); break; }
      case 'advanced-solids': { mountedActivity = mountAdvancedSolidsStage(root, next, revealed); details = mountedActivity.snapshot(); break; }
      case 'physics-investigation': { mountedActivity = mountPhysicsInvestigationStage(root, next); details = mountedActivity.snapshot(); break; }
      case 'logic-workshop': { mountedActivity = mountLogicWorkshopStage(root, next); details = mountedActivity.snapshot(); break; }
      case 'chemical-investigation': { mountedActivity = mountChemicalInvestigationStage(root, next); details = mountedActivity.snapshot(); break; }
      case 'reaction-lab': { mountedActivity = mountReactionLabStage(root, next, revealed); details = mountedActivity.snapshot(); break; }
      case 'matter-cycles': { mountedActivity = mountMatterCyclesStage(root, next); details = mountedActivity.snapshot(); break; }
      case 'inquiry-islands': { mountedActivity = mountInquiryIslandsStage(root, next); details = mountedActivity.snapshot(); break; }
      case 'carbon-kitchen': { mountedActivity = mountCarbonKitchenStage(root, next); details = mountedActivity.snapshot(); break; }
      case 'atomic-world': { mountedActivity = mountAtomicWorldStage(root, next, revealed); details = mountedActivity.snapshot(); break; }
      case 'waves-observatory': { mountedActivity = mountWavesObservatoryStage(root, next); details = mountedActivity.snapshot(); break; }
      case 'materials-mixtures': { mountedActivity = mountMaterialsMixturesStage(root, next); details = mountedActivity.snapshot(); break; }
      case 'energy-islands': { mountedActivity = mountEnergyIslandsStage(root, next); details = mountedActivity.snapshot(); break; }
      case 'circuit-workshop': { mountedActivity = mountCircuitWorkshopStage(root, next); details = mountedActivity.snapshot(); break; }
      case 'electricity-harbor': { mountedActivity = mountElectricityHarborStage(root, next); details = mountedActivity.snapshot(); break; }
      case 'thermal-station': { mountedActivity = mountThermalStationStage(root, next); details = mountedActivity.snapshot(); break; }
      case 'programming-ferry': { details = drawProgrammingFerry(root, next); break; }
      case 'measurement-station': { details = drawMeasurementStation(root, next); break; }
      case 'spatial-volume': {
        details = drawSpatialVolume(root, next);
        break;
      }
      case 'solid-construction': {
        details = { view: next.view, grid: [...next.grid], boards: buildSolidConstructionStage(root, next) };
        break;
      }
      case 'solid-workshop': {
        details = { view: next.view, figures: buildSolidWorkshopStage(root, next) };
        break;
      }
      case 'number-route': { const route=mountNumberRoute(root,next); details=route.details; break; }
      case 'volume': {
        const [l,w,h]=next.dimensions, unit=Math.min(.39,3.1/l,1.5/w,1.6/h);
        if(next.showLayers) for(let y=0;y<h;y++) for(let z=0;z<w;z++) for(let x=0;x<l;x++) box((x-(l-1)/2)*unit,.2+(y+.5)*unit,(z-(w-1)/2)*unit,unit*.95,unit*.95,unit*.95,(x+y+z)%2?'aqua':'blue');
        else box(0,.2+h*unit/2,0,l*unit,h*unit,w*unit,'aqua');
        details={dimensions:[...next.dimensions],unit:next.unit,showLayers:next.showLayers}; break;
      }
      case 'map-scale': {
        box(0,.27,0,5,.1,2.5,'pale'); const total=next.segmentsCm.reduce((a,b)=>a+b,0), scale=4.2/total; let x=-2.1;
        ball(x,.42,0,.1,'red'); for(const seg of next.segmentsCm) { const end=x+seg*scale; rod([x,.42,0],[end,.42,0],.045,'blue'); ball(end,.42,0,.1,'red'); x=end; }
        details={segmentsCm:[...next.segmentsCm],metersPerCm:next.metersPerCm}; break;
      }
      case 'percent': {
        const cols=next.layout==='square'?10:20, rows=100/cols, dx=next.layout==='square'?.22:.20, dz=.22;
        const boards=next.compareObjectsPerCell===undefined?1:2;
        for(let b=0;b<boards;b++) for(let i=0;i<100;i++) box((i%cols-(cols-1)/2)*dx,(boards===2?.6: .35)+b*.55,(Math.floor(i/cols)-(rows-1)/2)*dz,dx*.88,.08,dz*.88,i<next.marked?'aqua':'pale');
        details={totalCells:100,marked:next.marked,boards,objectsPerCell:next.objectsPerCell,compareObjectsPerCell:next.compareObjectsPerCell}; break;
      }
      case 'force-track': {
        rail(); cart=cartAt(next.initialSpeed<0?2.3:-2.3); if(next.leftForce) arrow(-.8,1.22,0,-Math.min(1.2,next.leftForce*.2),'red'); if(next.rightForce) arrow(.8,1.22,0,Math.min(1.2,next.rightForce*.2),'blue');
        details={initialSpeed:next.initialSpeed,leftForce:next.leftForce,rightForce:next.rightForce,mass:next.mass,seconds:next.seconds}; break;
      }
      case 'action-pair': {
        if(next.context==='carts') { rail(); cartAt(-.58); cartAt(.58); }
        else { box(-.6,.58,0,.22,.65,.48,'wood'); box(.6,.4,0,1.15,.2,.75,'blue'); rod([-.6,.7,0],[-1,1.2,0],.07,'wood'); }
        arrow(.58,1.18,0,next.directionOnSecond*next.force*.16,'blue'); if(revealed) arrow(-.58,1.18,0,-next.directionOnSecond*next.force*.16,'red');
        details={bodies:[...next.bodies],context:next.context,knownForce:pairForces(next)[1],...(revealed?{pair:pairForces(next)}:{})}; break;
      }
      case 'parallel-circuit': {
        const first = root.children.length;
        // Two separate branches join the same pair of brass nodes.
        for(const z of [-.75,.75]) { rod([-2,.37,z],[2,.37,z],.065,'rim'); ball(0,.52,z,.25,'lamp'); }
        for(const x of [-2,2]) { rod([x,.37,-.75],[x,.37,.75],.065,'rim'); ball(x,.37,-.75,.12,'dark'); ball(x,.37,.75,.12,'dark'); }
        for(const x of [-2,2]) rod([x,.37,-.75],[x,.37,-1.4],.065,'rim');
        rod([-2,.37,-1.4],[-.35,.37,-1.4],.065,'rim'); rod([.35,.37,-1.4],[2,.37,-1.4],.065,'rim');
        box(0,.4,-1.4,.7,.35,.35,'dark');
        if(next.layout==='vertical') { const schematic=new THREE.Group(); for(const child of [...root.children].slice(first)) schematic.add(child); root.add(schematic); schematic.rotation.y=Math.PI/2; }
        details={voltage:next.voltage,currentsMa:[...next.currentsMa],sharedNodes:true,layout:next.layout}; break;
      }
      case 'filtration': {
        if(next.view==='ion') {
          ball(-.65,.9,0,.25,'aqua'); ball(.65,.9,0,.25,'gold');
        } else if(next.view==='grain') {
          // Shared scale: pore width and grain diameter are derived from the same factor.
          const scale=1.5/Math.max(next.poreMicrometers,next.grainMicrometers), gap=next.poreMicrometers*scale, diameter=next.grainMicrometers*scale;
          box(-(gap+2.4)/4,.68,0,(2.4-gap)/2,.16,.8,'aqua'); box((gap+2.4)/4,.68,0,(2.4-gap)/2,.16,.8,'aqua');
          const below=revealed && !filtrationOutcome(next).grainRetained;
          ball(0,below?.28+diameter/2:.78+diameter/2,0,diameter/2,'red');
        } else {
          mesh(new THREE.CylinderGeometry(.85,.18,.9,32,1,true),mats.glass,0,1.24,0);
          mesh(new THREE.CylinderGeometry(.7,.7,.08,32),mats.pale,0,.9,0);
          mesh(new THREE.CylinderGeometry(.53,.45,.75,32,1,true),mats.glass,0,.59,0);
          const retained = !revealed || filtrationOutcome(next).grainRetained;
          for(let i=0;i<12;i++) ball(-.35+(i%4)*.22,(retained?1.12:.38)+Math.floor(i/4)*.11,.03,.07,'red');
          if(revealed) for(let i=0;i<5;i++) ball(-.25+i*.13,.37,0,.035,'blue');
        }
        details={poreMicrometers:next.poreMicrometers,grainMicrometers:next.grainMicrometers,view:next.view,...(revealed?{outcome:filtrationOutcome(next)}:{})}; break;
      }
      case 'fire-safety': {
        box(0,.25,0,4,.08,2.4,'pale'); for(const [x,z] of [[-1.9,0],[1.9,0],[0,-1.1]]) box(x,.65,z,x===0?3.8:.08,.8,x===0?.08:2.2,'wood');
        box(-1.1,.32,.35,.65,.08,.65,'aqua'); box(1.1,.32,.35,.65,.08,.65,'red');
        details={view:next.view,place:next.place,fuel:next.fuel,oxygen:next.oxygen,heat:next.heat,...(revealed?{safeExit:next.safeExit,smokyRoute:next.smokyRoute}:{})}; break;
      }
      case 'space': {
        if(next.mode==='size') { const r=1.1; ball(-1.65,1.35,0,r,'lamp'); ball(1.0,.35,0,r*spaceDiametersKm.earth/spaceDiametersKm.sun,'blue'); ball(1.5,.35,0,r*spaceDiametersKm.moon/spaceDiametersKm.sun,'pale'); details={mode:'size',diametersKm:spaceDiametersKm,scale:'diameter'}; }
        else if(next.mode==='distance') { ball(-2.6,.6,0,.3,'lamp'); ball(1.8,.6,0,.12,'blue'); ball(1.8+4.4*meanSpaceDistancesKm.earthMoon/meanSpaceDistancesKm.earthSun,.6,0,.07,'pale'); details={mode:'distance',distancesKm:meanSpaceDistancesKm,scale:'distance; body sizes enlarged'}; }
        else { const sunX=next.orbit==='june'?-2:2, earthX=-sunX/2, sunSide=Math.sign(sunX-earthX);
          ball(sunX,.9,0,.43,'lamp'); ball(earthX,.9,0,.55,'blue'); rod([earthX+.22,.35,0],[earthX-.22,1.45,0],.035,'pale');
          const markerX=earthX+sunSide*(next.rotation===0?.53:-.53); ball(markerX,.98,.05,.065,'gold');
          if(next.sites===2) ball(2*earthX-markerX,.98,.05,.065,'red');
          details={mode:next.mode,rotation:next.rotation,orbit:next.orbit,...(revealed?{light:spaceLight(next)}:{})}; } break;
      }
      case 'work-power': {
        // Twin winches show given motion only after prediction; scales are visual, values in the desk.
        const lifts=[];
        next.lifts.forEach((lift,i)=>{
          const x=next.lifts.length===1?0:(i===0?-1.65:1.65);
          for(const dx of [-.65,.65]) {box(x+dx,1.45,-.2,.13,2.45,.2,'woodLight');}
          box(x,2.68,-.2,1.45,.16,.25,'rim');
          const drum=mesh(new THREE.CylinderGeometry(.23,.23,.72,20),mats.rim,x,2.38,-.2); drum.rotation.z=Math.PI/2;
          const rope=rod([x,2.38,0],[x,.95,0],.035,'pale');
          const basket=new THREE.Group();root.add(basket);basket.position.set(x,.55,0);
          box(0,0,0,.8,.48,.65,'woodLight',basket);box(0,.26,0,.88,.08,.7,'rim',basket);
          lifts.push({lift,basket,x,rope});
        });
        moving={lifts};details={lifts:next.lifts.map(l=>({...l})),...(revealed?{results:next.lifts.map(l=>({workJ:workJ(l),powerW:powerW(workJ(l),l.durationS),positionM:0}))}:{})};
        break;
      }
      case 'force-workshop': {
        if(next.primary!=='2d') {
          // All changing positions are illustrative views of the supplied deterministic model.
          const surface=next.surfaceOptions?(revealed?'rough':(next.surfaceView??'smooth')):undefined;
          if(next.context==='ramp') { const slope=box(0,.47,0,3.4,.15,1.5,'wood'); slope.rotation.z=Math.PI/4; }
          else if(next.context==='wall') box(1.05,1,0,.2,1.6,1.2,'wood');
          const beltMarkers=[];
          if(surface) {
            box(0,.30,0,4.8,.10,1.3,surface==='rough'?'woodLight':'pale');
            if(next.inputs?.kind==='friction' && next.inputs.surfaceVelocity) for(let i=0;i<5;i++) {
              const mark=box(-2+i,.37,0,.08,.025,1.0,'dark'); beltMarkers.push({mark,base:-2+i});
            }
          }
          const actor=new THREE.Group(); root.add(actor);
          if(next.context==='cart') { rail(); cartAt(0,0,actor); }
          else if(next.context==='raft') { box(0,.43,0,1.65,.18,.9,'wood',actor); box(0,.66,0,.55,.3,.5,'aqua',actor); }
          else if(next.context==='foot') { box(0,.48,0,1.2,.25,.48,'dark',actor); }
          else if(next.context==='ramp') { const body=box(0,.92,0,.7,.65,.7,'aqua',actor); body.rotation.z=Math.PI/4; }
          else { box(0,.66,0,.9,.65,.7,'aqua',actor); }
          if(next.context==='moon') ball(-2.0,1.2,-.5,.45,'pale');
          if(next.context==='magnet') { box(-1.5,.8,0,.2,.8,.35,'red'); box(-1.1,.8,0,.2,.8,.35,'blue'); box(-1.3,.47,0,.6,.18,.35,'dark'); }
          const outputs=revealed?derivedForces(next):[];
          const forceVisuals=[];
          const vectors={left:[-1,0],right:[1,0],up:[0,1],down:[0,-1],'up-left':[-.707,.707],'up-right':[.707,.707],'down-left':[-.707,-.707]};
          for(const f of outputs) {
            const v=vectors[f.direction]; if(!v) continue;
            const len=f.newtons===undefined?1.0:Math.max(.35,Math.min(1.5,f.newtons*.16));
            const from=new THREE.Vector3(0,1.05,0),to=from.clone().add(new THREE.Vector3(v[0]*len,v[1]*len,0));
            const shaft=rod(from.toArray(),to.toArray(),.045,'red',actor);
            const tip=mesh(new THREE.ConeGeometry(.12,.24,12),mats.red,...to.toArray(),actor);
            tip.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),to.clone().sub(from).normalize());
            forceVisuals.push(shaft,tip);
          }
          if(revealed && (next.inputs?.kind==='motion' || (next.inputs?.kind==='friction' && next.surfaceOptions))) moving={actor,inputs:next.inputs,surface,forceVisuals,beltMarkers};
          details={body:next.body,context:next.context,inputs:next.inputs,...(surface?{surfaceView:surface}:{}),...(revealed?{forces:outputs}:{})};
        } else details={body:next.body,context:next.context,primary:'2d',inputs:next.inputs,...(revealed?{forces:derivedForces(next)}:{})};
        break;
      }
      case 'observatory-day': {
        const earthX=.65, radius=.85, angle=(next.rotation+next.siteOffset)*Math.PI/180;
        ball(-2.2,1.12,0,.43,'lamp'); arrow(-1.6,1.12,0,.75,'gold');
        // The x-facing hemisphere nearest the fixed Sun is light; no inferred result is stored.
        litGlobe(earthX,1.15,0,radius,-1);
        rod([earthX,.2,0],[earthX,2.1,0],.025,'pale');
        ball(earthX-Math.cos(angle)*radius,1.18,Math.abs(Math.sin(angle))*radius+.04,.10,'gold');
        details={rotation:next.rotation,site:next.site,siteOffset:next.siteOffset,sun:'left'}; break;
      }
      case 'observatory-season': {
        const sunX=next.month==='june'?-2.2:2.2, earthX=next.month==='june'?1:-1;
        ball(sunX,1,0,.42,'lamp'); litGlobe(earthX,1,0,.72,Math.sign(sunX-earthX));
        // North pole keeps its world-space direction in both orbit positions.
        rod([earthX+.42,.05,0],[earthX-.42,1.95,0],.035,'pale');
        const lat=next.latitude*Math.PI/180;
        const mx=-.25*Math.sin(lat), my=.55*Math.sin(lat), mz=Math.sqrt(Math.max(0,.72**2-mx**2-my**2))+.04;
        ball(earthX+mx,1+my,mz,.085,'gold');
        details={latitude:next.latitude,month:next.month,axis:'fixed',north:solstice(Math.abs(next.latitude),next.month),south:solstice(-Math.abs(next.latitude),next.month)}; break;
      }
      case 'observatory-near': {
        const planet=next.pair==='earth'?nearData.earth:nearData.mars, moon=next.pair==='earth'?nearData.moon:nearData.phobos;
        ball(-1.2,1,0,.75,next.pair==='earth'?'blue':'red');
        // Size mode alone uses proportional radii; distance mode deliberately enlarges markers.
        const moonRadius=next.mode==='size'?.75*moon.diameterKm/planet.diameterKm:.12;
        ball(1.3,1,0,moonRadius,'pale');
        details={mode:next.mode,pair:next.pair,diametersKm:[planet.diameterKm,moon.diameterKm],distanceKm:next.pair==='earth'?nearData.earthMoonKm:nearData.marsPhobosKm,scale:next.mode==='size'?'relative diameter, distance not to scale':'marker size enlarged; use given distance'}; break;
      }
      case 'observatory-scale': {
        // This node's primary representation is the exact 2D scale key.
        details={mode:next.mode,representation:'2D comparison key'}; break;
      }
      case 'observatory-structure': {
        ball(-2.1,.75,0,.18,'pale'); ball(-.8,.85,0,.34,'blue'); ball(.6,.9,0,.45,'gold');
        const cluster=new THREE.Group(); root.add(cluster); for(let i=0;i<9;i++) ball(1.8+(i%3)*.18,.65+Math.floor(i/3)*.2,0,.06,'lamp',cluster);
        details={context:next.context,representation:'distinct symbolic objects'}; break;
      }
      case 'system-graph': {
        // The tabletop is a graph of board lengths, not a geographical map.
        box(0,.29,0,5.1,.08,2.75,'pale');
        for(let i=0;i<=next.xMax;i++) rod([-2.4+4.8*i/next.xMax,.35,-1.25],[-2.4+4.8*i/next.xMax,.35,1.25],.009,'dark');
        for(let i=0;i<=next.yMax;i+=2) rod([-2.4,.35,-1.25+2.5*i/next.yMax],[2.4,.35,-1.25+2.5*i/next.yMax],.009,'dark');
        const graphLine=(eq,mat)=>{ const [a,b,c]=eq, points=[]; for(const x of [0,next.xMax]) { const y=(c-a*x)/b;if(y>=0&&y<=next.yMax) points.push([x,y]); } for(const y of [0,next.yMax]) {const x=(c-b*y)/a;if(x>=0&&x<=next.xMax) points.push([x,y]);} if(points.length>=2) rod([-2.4+4.8*points[0][0]/next.xMax,.4,1.25-2.5*points[0][1]/next.yMax],[-2.4+4.8*points[1][0]/next.xMax,.4,1.25-2.5*points[1][1]/next.yMax],.04,mat); };
        graphLine(next.first,'blue'); graphLine(next.second,'red');
        const solution=solveLinear(next.first,next.second);
        if(revealed && solution.kind==='unique') { ball(-2.4+4.8*solution.x/next.xMax,.49,1.25-2.5*solution.y/next.yMax,.10,'gold'); }
        details={first:[...next.first],second:[...next.second],axes:'board lengths in metres; not location',...(revealed?{solution}:{})}; break;
      }
      case 'channel-evidence': {
        // Three discrete observed arrangements, with two marked output basins for each.
        next.observations.forEach((observation,i)=>{
          const x=-2.2+i*2.2;
          box(x,.34,0,1.85,.12,2.0,'glass');
          rod([x,.48,-.75],[x,.48,-.15],.06,'blue');
          rod([x,.48,-.15],[x-.55,.48,.65],.06,'blue'); if(observation.waterfall) rod([x,.48,-.15],[x+.55,.48,.65],.06,'blue');
          mesh(new THREE.CylinderGeometry(.25,.25,.12,16),mats[observation.nest==='quiet'?'aqua':'red'],x-.55,.43,.68);
          mesh(new THREE.CylinderGeometry(.25,.25,.12,16),mats[observation.waterfall?'blue':'pale'],x+.55,.43,.68);
        });
        details={observations:next.observations.map(o=>({...o})),target:next.target,...(next.oldModel?{oldModel:{...next.oldModel}}:{})}; break;
      }
      case 'diffusion-model': {
        // Separate macroscopic strip and symbolic particle-model tray; no bulk-current animation.
        box(-1.45,.35,0,2.3,.08,1.45,'pale'); box(1.2,.35,0,2.3,.08,1.45,'pale');
        const values=revealed?diffuse(next.initial,next.steps):next.initial;
        const max=Math.max(...next.initial,1);
        for(let i=0;i<values.length;i++) {
          const x=-2.28+i*.55, strength=values[i]/max;
          const material=mats[strength>.55?'blue':strength>.15?'aqua':'glass'];
          mesh(new THREE.BoxGeometry(.48,.08,1.1),material,x,.43,0);
          // Height represents the model's expected amount; it is not a photo of atoms.
          box(.37+i*.55,.42+strength*.7,0,.39,Math.max(.03,strength*1.4),.85,'aqua');
        }
        marker=ball(.37,1.96,.6,.08,'gold');
        details={medium:next.medium,initial:[...next.initial],steps:next.steps,accelerated:true,markedCell:markerCell,representation:'model symbols; no bulk flow',...(revealed?{distribution:values}:{})}; break;
      }
      case 'cake': {
        for(const [j,source] of [next.task.left,next.task.right].entries()) {
          const x=j?1.2:-1.2, part=next.partitions?.[j] ?? (next.partition?.source===(j?'right':'left')?next.partition:null);
          const denominator=part?.denominator ?? source.parts, count=part?.pieces.length ?? source.kept;
          if(next.task.shape==='strip') {
            box(x,.3,0,1.7,.08,.6,'pale');
            for(let i=0;i<count;i++) box(x-.8+(i+.5)*1.6/denominator,.47,0,1.6/denominator*.96,.24,.5,'gold');
          } else {
            mesh(new THREE.CylinderGeometry(.85,.85,.08,32),mats.pale,x,.3,0);
            for(let i=0;i<count;i++) mesh(new THREE.CylinderGeometry(.72,.72,.24,32,1,false,i*2*Math.PI/denominator,2*Math.PI/denominator-.015),mats.gold,x,.46,0);
          }
        }
        details={shape:next.task.shape,left:{...next.task.left},right:{...next.task.right},...(next.partition?{partition:next.partition}:{}),...(next.partitions?{partitions:next.partitions.map(p=>({source:p.source,denominator:p.denominator,pieceCount:p.pieces.length,factor:p.denominator / (p.source==='left'?next.task.left.parts:next.task.right.parts)}))}:{})}; break;
      }
    }
    world.invalidate();
  }
  function advanceTime(ms) {
    if(disposed || !model || !Number.isFinite(ms) || ms<0) return;
    if (mountedActivity) { elapsed += ms / 1000; mountedActivity.advanceTime(ms); details = mountedActivity.snapshot(); }
    if(model.kind==='force-track' && revealed && cart) { elapsed=Math.min(model.seconds,elapsed+ms/1000); const motion=trackMotion(model,elapsed), end=trackMotion(model,model.seconds); const a=trackMotion(model,0).acceleration, turn=a!==0?-model.initialSpeed/a:0, values=[0,end.displacement]; if(turn>0 && turn<model.seconds) values.push(trackMotion(model,turn).displacement); const lo=Math.min(...values), hi=Math.max(...values), span=hi-lo; cart.position.x=span>1e-9?-2.3+(motion.displacement-lo)/span*4.6:0; details.motion=motion; }
    if(model.kind==='work-power' && revealed && moving) {
      elapsed=Math.min(model.durationS,elapsed+ms/1000);
      details.results=moving.lifts.map(({lift,basket,x,rope})=>{const position=positionM(lift,elapsed); if(lift.direction==='perpendicular'||lift.direction==='horizontal') basket.position.x=x+position*.25; else basket.position.y=.55+position*.25; const top=new THREE.Vector3(x,2.38,0),bottom=new THREE.Vector3(basket.position.x,basket.position.y+.4,0),span=top.clone().sub(bottom); rope.position.copy(top.clone().add(bottom).multiplyScalar(.5)); rope.scale.y=span.length()/1.43; rope.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),span.normalize()); return {workJ:workJ(lift),powerW:powerW(workJ(lift),lift.durationS),positionM:position};});
    }
    if(model.kind==='force-workshop' && revealed && moving) {
      elapsed=Math.min(moving.inputs.durationS,elapsed+ms/1000);
      if(moving.inputs.kind==='motion') {
        const motion=horizontalMotion(moving.inputs.initialVelocity,moving.inputs.netForceN,moving.inputs.massKg,elapsed);
        moving.actor.position.x=motion.displacement*.35; details.motion=motion;
      } else if(moving.inputs.kind==='friction') {
        const f=moving.inputs.frictionN[moving.surface==='rough'?1:0];
        const relative=slidingOnSurface(moving.inputs.relativeSlip,f,moving.inputs.massKg,elapsed);
        const displacement=slidingDisplacement(moving.inputs.relativeSlip,moving.inputs.surfaceVelocity,f,moving.inputs.massKg,elapsed);
        moving.actor.position.x=displacement*.35;
        for(const visual of moving.forceVisuals) visual.visible=relative!==0;
        for(const {mark,base} of moving.beltMarkers) mark.position.x=((base+moving.inputs.surfaceVelocity*elapsed*.35+2.4)%4.8)-2.4;
        details.forces=relative===0?[]:derivedForces(model);
        details.motion={relativeVelocity:relative,velocity:relative+moving.inputs.surfaceVelocity,displacement,frictionN:relative===0?0:f};
      }
    }
    if(model.kind==='diffusion-model' && marker) {
      markerClock+=ms/1000;
      while(markerClock>=.6) { markerClock-=.6; markerSeed=(Math.imul(markerSeed,1664525)+1013904223)>>>0; markerCell=moveMarked(markerCell,(markerSeed & 0x80000000)?1:-1,model.initial.length); }
      marker.position.x=.37+markerCell*.55; details.markedCell=markerCell;
    }
    world.invalidate();
  }
  function restoreEffects(ids) {
    if(disposed) return;
    for(const id of ids) {
      if(effects.has(id)) continue;
      let hash=2166136261; for(let i=0;i<id.length;i++) hash=Math.imul(hash ^ id.charCodeAt(i),16777619)>>>0;
      const mark=new THREE.Group(); mark.position.set(2+(hash%700)/100,.08,-1.5-((hash>>>10)%420)/100);
      mesh(new THREE.CylinderGeometry(.14,.18,.1,12),mats.wood,0,0,0,mark);
      mesh(new THREE.CylinderGeometry(.025,.025,.35,8),mats.rim,0,.2,0,mark);
      ball(0,.43,0,.095,'lamp',mark);
      marks.add(mark); effects.set(id,mark);
    }
    world.invalidate();
  }
  function celebrate(effectId) { if(disposed || effects.has(effectId)) return; restoreEffects([effectId]); if(model) { details.celebration=effectId; ball(0,2.2,0,.16,'lamp'); } world.invalidate(); }
  function dispose() { if(disposed) return; clear(); disposed=true; scene.remove(root); marks.traverse(o=>{ if(o.geometry) o.geometry.dispose(); }); scene.remove(marks); effects.clear(); for(const m of Object.values(mats)) m.dispose(); }
  return {show,advanceTime,celebrate,restoreEffects,clear,setVisible(value){if(!disposed){root.visible=!!value;world.invalidate();}},dispose,snapshot:()=>({kind:model?.kind??null,revealed,elapsed,effects:[...effects.keys()].sort(),...details})};
}
