import {expect,test} from 'vitest';
// @ts-expect-error Actual Three.js graphs are checked at runtime.
import * as THREE from 'three';
// @ts-expect-error Stage JS has a runtime lifecycle contract.
import {mountChemicalInvestigationStage} from '../src/world/chemical-investigation-stage.js';
import {rng} from '../src/engine/rng';
import {chemicalInvestigationSpecs} from '../src/content/chemical-investigation';
import {checkChemicalInvestigation,applyInvestigationInstrument,initialInvestigationInstrument,investigationMeter,
 type ChemicalInvestigationTask,type ChemicalInvestigationResponse,type InvestigationAction,type InvestigationObservation} from '../src/content/models/chemical-investigation';
import {chemicalInvestigationScene} from '../src/content/models/chemical-investigation-scene';
const kind='chemical-investigation' as const;
const scale={mg:1,g:1000,ul:1,ml:1000};
const reading=(base:number,unit:keyof typeof scale)=>({value:`${base*3}/${scale[unit]*3}`,unit});
const action=(task:ChemicalInvestigationTask,id:string,type:InvestigationAction['type'],extra:Partial<InvestigationAction>={}):InvestigationAction=>({run:task.run,id,type,...extra});
function human(task:ChemicalInvestigationTask):InvestigationObservation{
 return {channel:'written',confirmedByAdult:true,assistance:'none',observations:Object.fromEntries(('review' in task?task.review.rubric:[]).map(c=>[c.id,'met']))};
}
/** Expectations use explicit quantities, public observation text and SI unit definitions.
 * No production solution/wrong helper, card.category, task.issue, variable or result helper supplies expectations. */
function ownAnswer(task:ChemicalInvestigationTask):ChemicalInvestigationResponse{
 if(task.mode==='tool'){
  const selected=task.instruments.filter(t=>t.quantity==='volume'&&t.transferable&&t.capacity>=task.requestedUl&&t.division<=task.requiredDivisionUl&&task.requestedUl%t.division===0).at(-1)!;
  return {kind,mode:'tool',actions:[action(task,'select','select',{instrument:selected.id}),action(task,'draw','aspirate',{amountUl:task.requestedUl}),action(task,'give','dispense',{amountUl:task.requestedUl})],reading:reading(task.requestedUl,task.unit==='ul'?'ml':'ul')};
 }
 if(task.mode==='measure'){
  const selected=task.instruments.find(t=>t.quantity===task.quantity&&t.capacity>=task.amount+(task.quantity==='mass'?task.containerMg:0)&&t.division<=task.requiredDivision)!;
  const steps:InvestigationAction['type'][]=task.quantity==='mass'?['empty-container','tare','load-sample','read']:['load-sample','eye-level','read'];
  return {kind,mode:'measure',actions:[action(task,'select','select',{instrument:selected.id}),...steps.map((type,i)=>action(task,`step-${i}`,type))],
   meniscus:task.quantity==='mass'?null:'bottom',reading:reading(task.amount,task.quantity==='mass'?(task.unit==='g'?'mg':'g'):'ul')};
 }
 if(task.mode==='observe'){
  const categories=Object.fromEntries(task.cards.map(card=>[card.id,/varmasti|todistaa/.test(card.text)?'inference':'observation'] as const));
  return {kind,mode:'observe',categories,extraEvidence:task.observation.includes('kupla')?'analyse-gas':'analyse-sample'};
 }
 if(task.mode==='design')return {kind,mode:'design',variable:task.levels.some(level=>level.includes('°C'))?'temperature':'solvent',response:'dissolved-mass',
  controls:task.controls.filter(c=>!c.label.startsWith('Myös ')).map(c=>c.id).reverse(),repetitions:5,safeProtocol:true,review:human(task)};
 if(task.mode==='data'){
  const outcome=(row:typeof task.rows[number])=>row.missing?null:row.doseMg<=row.capacityMg?row.doseMg:row.capacityMg;
  const unit=task.unit==='g'?'mg':'g',factor=scale[unit],maximum=Math.max(0,...task.rows.map(row=>outcome(row)??0)),top=Math.max(500,Math.ceil(maximum/500)*500);
  const source=task.rows.filter(row=>outcome(row)!==null).at(-1)!;
  return {kind,mode:'data',actions:task.publicResults?[]:task.rows.map(row=>action(task,`experiment-${row.id}`,'run',{sample:row.id})).reverse(),
   table:[...task.rows].reverse().map(row=>({rowId:row.id,sourceId:row.sourceId,condition:row.condition,reading:outcome(row)===null?null:reading(outcome(row)!,unit)})),
   chart:{type:task.numericX?'scatter':'bar',xLabel:task.xKind,yLabel:'dissolved-mass',unit,start:'0',top:`${top}/${factor}`,step:`500/${factor}`,
    values:Object.fromEntries(task.rows.map(row=>[row.id,outcome(row)===null?null:`${outcome(row)!*3}/${factor*3}`]))},sourceLink:{rowId:source.id,sourceId:source.sourceId}};
 }
 const overlap=task.rows.some(row=>row.note.includes('Molempien lukemien epävarmuus')),
  label=task.rows.filter(row=>/etiketti.*vaihtunut/.test(row.note)),temperature=task.rows.filter(row=>row.note.includes('lämpötila vaihtui')),
  missing=task.rows.filter(row=>row.note.includes('puuttuu'));
 const issueRows=overlap?task.rows.map(row=>row.id):[...label,...temperature,...missing].map(row=>row.id);
 return {kind,mode:'conclude',citedRows:task.rows.map(row=>row.id).reverse(),difference:`${(task.rows[1]!.massMg-task.rows[0]!.massMg)*3}/3`,
  confidence:issueRows.length?'inconclusive':'supports',issueRows,repair:overlap?'more-precise':label.length?'repeat-labelled':temperature.length?'control-temperature':missing.length?'recover-or-repeat':'keep-method',review:human(task)};
}

test('2112 authored procedures, unit alternatives and public observation interpretations agree with an independent oracle',()=>{
 let generated=0,wrong=0,adultPending=0;
 for(const spec of chemicalInvestigationSpecs)for(const phase of ['independent','transfer'] as const)for(let seed=1;seed<=96;seed++){
  const task=spec.item(rng(seed),phase).task as ChemicalInvestigationTask,r=ownAnswer(task);
  expect(checkChemicalInvestigation(task,r).ok,`${spec.id}/${phase}/${seed}`).toBe(true);generated++;
  if(r.mode==='tool'||r.mode==='measure'){
   expect(checkChemicalInvestigation(task,{...r,reading:{value:'0',unit:task.mode==='measure'&&task.quantity==='mass'?'ml':'mg'}}).ok).toBe(false);wrong++;
   expect(checkChemicalInvestigation(task,{...r,actions:[]}).ok).toBe(false);wrong++;
   expect(checkChemicalInvestigation(task,{...r,actions:r.actions.map(a=>({...a,run:'another-run'}))}).ok).toBe(false);wrong++;
   if(r.mode==='measure'&&task.mode==='measure'){
    expect(checkChemicalInvestigation(task,{...r,actions:r.actions.filter(a=>a.type!==(task.quantity==='mass'?'tare':'eye-level'))}).ok).toBe(false);wrong++;
   }
  }else if(r.mode==='data'){
   expect(checkChemicalInvestigation(task,{...r,table:r.table.map(row=>({...row,sourceId:'other-source'}))}).ok).toBe(false);wrong++;
   expect(checkChemicalInvestigation(task,{...r,table:r.table.map(row=>({...row,condition:'other-condition'}))}).ok).toBe(false);wrong++;
   if(task.mode==='data'&&!task.publicResults){expect(checkChemicalInvestigation(task,{...r,actions:r.actions.slice(1)}).ok).toBe(false);wrong++;}
   if(task.mode==='data'&&task.objective!=='collect'){
    expect(checkChemicalInvestigation(task,{...r,chart:{...r.chart,values:{}}}).ok).toBe(false);wrong++;
    const types=task.numericX?['bar','line','scatter','table'] as const:['bar','table'] as const;
    for(const type of types)expect(checkChemicalInvestigation(task,{...r,chart:{...r.chart,type}}).ok).toBe(task.objective!=='both'||type!=='table');
   }
  }else if(r.mode==='observe'){
   expect(checkChemicalInvestigation(task,{...r,categories:Object.fromEntries(Object.entries(r.categories).map(([id,c])=>[id,c==='observation'?'inference':'observation']))}).ok).toBe(false);wrong++;
   expect(checkChemicalInvestigation(task,{...r,extraEvidence:'compare-control'}).ok).toBe(true);
  }else if(r.mode==='design'){
   expect(checkChemicalInvestigation(task,{...r,response:null}).ok).toBe(false);wrong++;
   if(task.mode==='design'&&task.objective==='plan'){
    expect(checkChemicalInvestigation(task,{...r,controls:[]}).ok).toBe(false);wrong++;
    expect(checkChemicalInvestigation(task,{...r,safeProtocol:false}).ok).toBe(false);wrong++;
    expect(checkChemicalInvestigation(task,{...r,repetitions:1}).ok).toBe(false);wrong++;
   }
  }else if(task.mode==='conclude'){
   const invalid=task.objective==='evaluate'?{...r,issueRows:[],repair:null}:{...r,confidence:r.confidence==='supports'?'inconclusive' as const:'supports' as const};
   expect(checkChemicalInvestigation(task,invalid).ok).toBe(false);wrong++;
  }
  if('review' in task&&('review' in r)){
   expect(checkChemicalInvestigation(task,{...r,review:{...r.review!,confirmedByAdult:false}}).pendingReview).toBe(true);adultPending++;
   expect(checkChemicalInvestigation(task,{...r,review:{...r.review!,assistance:'helped'}})).toMatchObject({ok:true,observedByAdult:true,assisted:true});
  }
 }
 expect(generated).toBe(2112);expect(adultPending).toBe(960);expect(wrong).toBeGreaterThan(3000);
 console.info({generated,wrong,adultPending});
});

test('net mass follows actual tare order and both mass units preserve the same physical quantity',()=>{
 const original=chemicalInvestigationSpecs.find(s=>s.id==='CHEM79-MEAS-01')!;
 let cases=0;
 for(const offsetMg of [-30,0,30])for(const containerMg of [500,1700])for(const amount of [1200,4900]){
  const sample=original.item(rng(0),'independent').task as ChemicalInvestigationTask;
  if(sample.mode!=='measure')throw Error('fixture');
  const task={...sample,quantity:'mass' as const,unit:'mg' as const,offsetMg,containerMg,amount},device=task.instruments.find(i=>i.quantity==='mass')!;
  const commands=[action(task,'select','select',{instrument:device.id}),action(task,'empty','empty-container'),action(task,'tare','tare'),action(task,'sample','load-sample'),action(task,'read','read')];
  let state=initialInvestigationInstrument(task);const meter=[offsetMg,offsetMg,offsetMg+containerMg,0,amount,amount];
  expect(investigationMeter(task,state)).toBe(meter[0]);
  commands.forEach((command,i)=>{state=applyInvestigationInstrument(task,state,command);expect(investigationMeter(task,state)).toBe(meter[i+1]);expect(applyInvestigationInstrument(task,state,command)).toBe(state);});
  for(const unit of ['mg','g'] as const)expect(checkChemicalInvestigation(task,{kind,mode:'measure',actions:commands,meniscus:null,reading:reading(amount,unit)}).ok).toBe(true);
  const lateContainer=[commands[0]!,commands[2]!,commands[1]!,commands[3]!,commands[4]!];
  expect(checkChemicalInvestigation(task,{kind,mode:'measure',actions:lateContainer,meniscus:null,reading:reading(amount,'mg')}).ok).toBe(false);cases++;
 }
 expect(cases).toBe(12);
});

test('calibrated cylindrical and flared volumes obey independent cross-section geometry',()=>{
 const spec=chemicalInvestigationSpecs.find(s=>s.id==='CHEM79-MEAS-01')!;let cases=0;
 for(const shape of ['cylinder','flared'] as const)for(let seed=1;seed<=96;seed++){
  const given=spec.item(rng(seed),'transfer').task as ChemicalInvestigationTask;if(given.mode!=='measure')throw Error('fixture');
  const task={...given,shape};
  const r=ownAnswer(task);if(r.mode!=='measure')throw Error('fixture');
  const scene=chemicalInvestigationScene(task,r)!;const liquid=scene.liquid!;
  const b=liquid.baseWidth,t=liquid.topWidth,h=liquid.heightFraction,volumeFraction=(2*b*h+(t-b)*h*h)/(b+t);
  expect(volumeFraction).toBeCloseTo(task.amount/liquid.capacityUl,12);
  for(const tick of liquid.ticks){const x=tick.heightFraction;expect((2*b*x+(t-b)*x*x)/(b+t)).toBeCloseTo(tick.volumeUl/liquid.capacityUl,12);}
  expect(liquid.edgeFraction).toBeGreaterThan(h);expect(checkChemicalInvestigation(task,{...r,meniscus:'edge'}).ok).toBe(false);cases++;
 }
 expect(cases).toBe(192);
});

test('all provenance and adult fields survive serialization as owned data, with no inherited or accessor substitutions',()=>{
 const task=chemicalInvestigationSpecs.find(s=>s.id==='CHEM79-DATA-COLLECT')!.item(rng(3),'independent').task as ChemicalInvestigationTask;
 const r=ownAnswer(task);if(r.mode!=='data')throw Error('fixture');
 expect(checkChemicalInvestigation(task,Object.assign(Object.create(r),{dummy:true})).ok).toBe(false);
 const badRoot=Object.defineProperty({...r},'kind',{get(){throw Error('must not invoke root getter');}});
 expect(checkChemicalInvestigation(task,badRoot).ok).toBe(false);
 expect(checkChemicalInvestigation(task,{...r,table:r.table.map(row=>Object.assign(Object.create(row),{dummy:true}))}).ok).toBe(false);
 expect(checkChemicalInvestigation(task,{...r,table:r.table.map(row=>({...row,reading:row.reading?Object.create(row.reading):null}))}).ok).toBe(false);
 expect(checkChemicalInvestigation(task,{...r,actions:r.actions.map(({sample,...rest})=>Object.assign(Object.create({sample}),rest))}).ok).toBe(false);
 const badRow=Object.defineProperty({...r.table[0]},'sourceId',{get(){throw Error('must not read accessor');}});
 expect(checkChemicalInvestigation(task,{...r,table:[badRow,...r.table.slice(1)]}).ok).toBe(false);
 const question=chemicalInvestigationSpecs.find(s=>s.id==='CHEM79-QUESTION-01')!.item(rng(2),'independent').task as ChemicalInvestigationTask,q=ownAnswer(question);
 if(q.mode!=='design')throw Error('fixture');
 expect(checkChemicalInvestigation(question,{...q,review:Object.create(q.review!)}).pendingReview).toBe(true);
 const access=Object.defineProperty({...q.review!},'assistance',{get(){throw Error('must not read accessor');}});
 expect(checkChemicalInvestigation(question,{...q,review:access}).pendingReview).toBe(true);
});

test('evaluation transfer follows the canonical uncontrolled-temperature case',()=>{
 const spec=chemicalInvestigationSpecs.find(s=>s.id==='CHEM79-INVESTIGATION-EVAL')!;
 for(let seed=1;seed<=96;seed++){
  const task=spec.item(rng(seed),'transfer').task as ChemicalInvestigationTask,r=ownAnswer(task);if(r.mode!=='conclude')throw Error('fixture');
  expect(r.repair).toBe('control-temperature');expect(r.issueRows).toEqual(['B']);expect(checkChemicalInvestigation(task,r).ok).toBe(true);
 }
});

function meshVolume(geometry:THREE.BufferGeometry){
 const position=geometry.getAttribute('position'),index=geometry.getIndex();let six=0;
 const point=(i:number)=>{const k=index?index.getX(i):i;return [position.getX(k),position.getY(k),position.getZ(k)] as const;};
 for(let i=0;i<(index?index.count:position.count);i+=3){const a=point(i),b=point(i+1),c=point(i+2);
  six+=a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]);}
 return Math.abs(six/6);
}
function actualStage(scene:NonNullable<ReturnType<typeof chemicalInvestigationScene>>,inspect:(parent:THREE.Group,mounted:ReturnType<typeof mountChemicalInvestigationStage>)=>void){
 const parent=new THREE.Group(),mounted=mountChemicalInvestigationStage(parent,scene);let expected=0,disposed=0;
 parent.traverse((object:THREE.Object3D)=>{const mesh=object as THREE.Mesh;if(mesh.geometry){expected++;mesh.geometry.addEventListener('dispose',()=>disposed++);}const mats=Array.isArray(mesh.material)?mesh.material:mesh.material?[mesh.material]:[];for(const mat of mats){expected++;mat.addEventListener('dispose',()=>disposed++);}});
 inspect(parent,mounted);mounted.advanceTime(1000);mounted.dispose();mounted.dispose();expect(parent.children).toHaveLength(0);expect(disposed).toBe(expected);
}
test('42 actual Three graphs distinguish selected tools, preserve calibrated liquid volume and hide unread numeric targets',()=>{
 let graphs=0;
 const lab=chemicalInvestigationSpecs.find(s=>s.id==='CHEM79-LAB-01')!.item(rng(0),'independent').task as ChemicalInvestigationTask;
 if(lab.mode!=='tool')throw Error('fixture');
 for(const instrument of lab.instruments){
  const requested=instrument.division,task={...lab,requestedUl:requested,sourceUl:requested*4,requiredDivisionUl:instrument.division};
  const actions=[action(task,'select','select',{instrument:instrument.id}),action(task,'take','aspirate',{amountUl:requested})];
  const scene=chemicalInvestigationScene(task,{kind,mode:'tool',actions,reading:reading(requested,'ul')})!;
  actualStage(scene,(parent,mounted)=>{
   const pipette=instrument.id.startsWith('pipette');
   expect(!!parent.getObjectByName('operated-pipette')).toBe(pipette);
   if(instrument.id==='cylinder'||instrument.id==='beaker'){
    const vessel=parent.getObjectByName(instrument.id==='cylinder'?'operated-measuring-cylinder':'operated-beaker')!;
    expect(vessel.userData.instrument).toBe(instrument.id);
    const wall=vessel.getObjectByName('graduated-vessel-wall') as THREE.Mesh;expect(wall.geometry.type).toBe('CylinderGeometry');
    const fill=vessel.getObjectByName('graduated-vessel-held-liquid') as THREE.Mesh;
    expect(fill.geometry.parameters.height).toBeCloseTo(requested/instrument.capacity*(instrument.id==='cylinder'?1.2:.65),12);
   }
   const transfer=mounted.snapshot().transfer;expect(transfer.sourceUl+transfer.heldUl+transfer.receiverUl).toBe(task.sourceUl);
  });graphs++;
 }
 const measures=chemicalInvestigationSpecs.find(s=>s.id==='CHEM79-MEAS-01')!;
 for(const shape of ['cylinder','flared'] as const)for(let seed=1;seed<=8;seed++){
  const given=measures.item(rng(seed),'transfer').task as ChemicalInvestigationTask;if(given.mode!=='measure')throw Error('fixture');const task={...given,shape},r=ownAnswer(task);if(r.mode!=='measure')throw Error('fixture');
  for(const read of [false,true]){
   const response={...r,actions:read?r.actions:r.actions.filter(a=>a.type!=='read')},scene=chemicalInvestigationScene(task,response)!;
   actualStage(scene,(parent,mounted)=>{
    const liquid=parent.getObjectByName('calibrated-liquid-content') as THREE.Mesh;
    const b=scene.liquid!.baseWidth/100,t=scene.liquid!.topWidth/100,capacityVolume=(b+t)/2*1.35*.52;
    expect(meshVolume(liquid.geometry)/capacityVolume).toBeCloseTo(task.amount/scene.liquid!.capacityUl,6);
    const curve=parent.getObjectByName('schematic-meniscus-reading-curve') as THREE.Line,positions=curve.geometry.getAttribute('position');
    expect(positions.getY(12)).toBeCloseTo(scene.liquid!.heightFraction*1.35,6);
    expect(positions.getY(0)).toBeCloseTo(scene.liquid!.edgeFraction*1.35,6);
    const snapshot=mounted.snapshot();expect(Object.hasOwn(snapshot.liquid,'volumeUl')).toBe(read);expect(Object.hasOwn(snapshot.liquid,'heightFraction')).toBe(read);
   });graphs++;
  }
 }
 const mass=measures.item(rng(0),'independent').task as ChemicalInvestigationTask;
 if(mass.mode!=='measure'||mass.quantity!=='mass')throw Error('fixture');const response=ownAnswer(mass);if(response.mode!=='measure')throw Error('fixture');
 for(let n=1;n<=response.actions.length;n++){
  const actions=response.actions.slice(0,n),scene=chemicalInvestigationScene(mass,{...response,actions})!;
  const value=n===1?mass.offsetMg:n===2?mass.offsetMg+mass.containerMg:n===3?0:mass.amount;
  actualStage(scene,(parent,mounted)=>{
   const needle=parent.getObjectByName('actual-reading-pointer')!;expect(needle.userData.readingMg).toBe(value);
   expect(Object.hasOwn(mounted.snapshot().meter,'readingMg')).toBe(n===response.actions.length);
  });graphs++;
 }
 expect(graphs).toBe(42);
});

test('equal physical instrument tasks have equal run identities across seeds and menu-order normalization',()=>{
 let repeated=0;
 for(const id of ['CHEM79-LAB-01','CHEM79-MEAS-01']){
  const spec=chemicalInvestigationSpecs.find(s=>s.id===id)!,seen=new Map<string,string>();
  for(let seed=1;seed<=640;seed++){
   const task=spec.item(rng(seed),'independent').task as ChemicalInvestigationTask;
   if(task.mode!=='tool'&&task.mode!=='measure')throw Error('fixture');
   const {run,title,context,safety,...physical}=task;void title;void context;void safety;
   const key=JSON.stringify({...physical,instruments:[...physical.instruments].sort((a,b)=>a.id.localeCompare(b.id))});
   if(seen.has(key)){expect(run).toBe(seen.get(key));repeated++;}else seen.set(key,run);
  }
  expect(seen.size,id).toBeGreaterThanOrEqual(8);
 }
 expect(repeated).toBeGreaterThan(100);console.info({identityInputs:1280,repeated});
});

test('all observation illustrations match independently read counts, colour codes and thermometer statements',()=>{
 const spec=chemicalInvestigationSpecs.find(s=>s.id==='CHEM79-OBS-01')!;
 for(const phase of ['independent','transfer'] as const)for(let seed=1;seed<=96;seed++){
  const task=spec.item(rng(seed),phase).task as ChemicalInvestigationTask;if(task.mode!=='observe')throw Error('fixture');
  const feature=task.observation.includes('värilukema')?'colour':task.observation.includes('kuplamerkkiä')?'bubble':'precipitate';
  const pair=/muuttuu (\d+):stä (\d+):een/.exec(task.observation),count=/(\d+) piirrettyä/.exec(task.observation);
  const temperature=task.cards.map(c=>/^Mittari näyttää (\d+) °C\.$/.exec(c.text)).find(Boolean)!;
  expect(task.illustration).toEqual({feature,before:pair?Number(pair[1]):0,after:pair?Number(pair[2]):Number(count![1]),temperatureC:Number(temperature[1])});
 }
});
