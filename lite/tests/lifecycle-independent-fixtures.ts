import type {LifecycleHarborTask,LifecycleHarborResponse,LifecycleRole,LifecycleStage,LifecycleFlow} from '../src/content/models/lifecycle-harbor';

const raw=new Set(['Metsästä hankittu puu','Bauksiittimalmi','Rautamalmi','Kvartsihiekka','Raakaöljy','Kalkkikiviesiintymä','Suolainen maanalainen liuos','Kvartsiesiintymä']);
const intermediate=new Set(['Keitetty sellumassa','Sahattu ja kuivattu puu','Erotettu alumiinioksidi','Puhdistettu rauta','Sulatettu lasimassa','Erotettu ja krakattu eteeni','Poltettu kalkki','Elektrolyysissä saatu natriumhydroksidiliuos','Puhdistettu alkuainepii']);
const materials=new Set(['Muotoiltu kuitulevy','Liimattu puulevy','Alumiinilevy','Teräslevy','Lasilevy','Polyeteenilevy','Kalkkilaasti','Natriumsaippuamassa','Piikiekko']);
const classify=(label:string):LifecycleRole=>raw.has(label)?'resource':intermediate.has(label)?'intermediate':materials.has(label)?'material':'object';
const stageNames:Record<string,LifecycleStage>={'Alkuperäpassi':'extraction','Telakan valmistamo':'manufacture','Rahtiveneen matka':'transport','Retken palvelu':'use','Varaosan vaihto':'maintenance','Seuraavan retkeilijän vuoro':'reuse','Materiaalin uusi alku':'recycling','Jäännöksen käsittely':'disposal'};
const stageEdges:Record<string,readonly [LifecycleStage,LifecycleStage]>={t1:['extraction','manufacture'],t2:['manufacture','transport'],t3:['transport','use'],t4:['use','maintenance'],t5:['maintenance','use'],t6:['use','reuse'],t7:['use','recycling'],t8:['recycling','manufacture'],t9:['recycling','disposal']};
const flow=(id:string,from:string,to:string,amount:bigint):LifecycleFlow=>({id,from,to,amount:Number(amount)});
export const peerIncidence=(flows:readonly LifecycleFlow[],node:string)=>flows.reduce((sum,f)=>sum+(f.to===node?BigInt(f.amount!):0n)-(f.from===node?BigInt(f.amount!):0n),0n);

/** Separate review oracle: authored givens only; no production answer, ledger or endpoint helper. */
export function lifecyclePeerAnswer(task:LifecycleHarborTask,woodRoute:'pulp'|'sawn'='pulp'):LifecycleHarborResponse{
 const response:LifecycleHarborResponse={kind:'lifecycle-harbor',mode:task.mode};
 if('resource' in task){
   const cards=task.resource.cards,roles=cards.map(c=>({card:c.id,role:classify(c.label)}));
   const path=(['resource','intermediate','material','object'] as const).map(role=>cards.find(c=>classify(c.label)===role&&(role==='intermediate'||role==='material'?woodRoute==='sawn'?!['Keitetty sellumassa','Muotoiltu kuitulevy'].includes(c.label):!['Sahattu ja kuivattu puu','Liimattu puulevy'].includes(c.label):true))!.id);
   response.resource={roles,path:task.resource.direction==='object-to-source'?path.reverse():path};
 }
 if('stages' in task){
   const assignments=task.stages.events.map(e=>({event:e.id,stage:stageNames[e.label]!})),id=(stage:LifecycleStage)=>assignments.find(a=>a.stage===stage)!.event;
   response.stages={assignments,edges:task.stages.transitions.map(e=>({transition:e.id,from:id(stageEdges[e.id]![0]),to:id(stageEdges[e.id]![1])}))};
 }
 if('material' in task){
   const d=task.material,source=BigInt(d.freshG)+BigInt(d.openingReturnedG),sorted=BigInt(d.sortableG),cap=BigInt(d.qualityLimitG),fraction=sorted*BigInt(d.recoveryNumerator)/BigInt(d.recoveryDenominator),recovered=fraction<cap?fraction:cap;
   response.material={flows:[flow('fresh','outside','factory',BigInt(d.freshG)),flow('opening','opening-stock','factory',BigInt(d.openingReturnedG)),flow('side','factory','side-use',BigInt(d.sideG)),flow('dust','factory','environment',BigInt(d.dustG)),flow('sort','factory','sorter',sorted),flow('returned','sorter','closing-stock',recovered),flow('reject','sorter','residue',sorted-recovered),flow('product','factory','use',source-BigInt(d.sideG)-BigInt(d.dustG)-sorted)],freshNextG:Number(source-recovered),locked:true,operated:true};
 }
 if('energy' in task){
   const d=task.energy,total=BigInt(d.electricKj)+BigInt(d.fuelKj),useful=BigInt(d.usefulKj),heat=total-useful;
   const fraction=heat*BigInt(d.recoveryNumerator)/BigInt(d.recoveryDenominator),cap=BigInt(d.compatibleDemandKj),recovered=d.plan==='recover'?(fraction<cap?fraction:cap):0n,saved=d.plan==='insulate'?BigInt(d.savedKj):recovered;
   response.energy={flows:[flow('electric','electricity','before',BigInt(d.electricKj)),flow('fuel','fuel','before',BigInt(d.fuelKj)),flow('useful','before','useful',useful),flow('heat','before','heat',heat),flow('after-purchase','purchased','after',total-saved),flow('after-return','recovered','after',recovered),flow('after-useful','after','useful',useful),flow('after-heat','after','environment',heat-saved),flow('after-store','after','next-heat-stock',recovered)],nextPurchasedKj:Number(total-saved),locked:true,operated:true};
 }
 if('comparison' in task){
   const d=task.comparison;
   const quantities=d.options.map(o=>{
     let units=0,repairs=0,age=o.lifeUses,material=0n,energy=0n;
     for(let use=0;use<d.uses;use++){
       if(age===o.lifeUses){units++;age=0;material+=BigInt(o.newMaterialG);energy+=BigInt(o.makeEnergyKj+o.transportKj);}
       if(age===o.baseLifeUses&&o.baseLifeUses<o.lifeUses){repairs++;material+=BigInt(o.repairMaterialG);energy+=BigInt(o.repairEnergyKj);}
       energy+=BigInt(o.useEnergyKj);age++;
     }
     return {option:o.id,units,repairs,materialG:Number(material),energyKj:Number(energy),returnedG:units*o.endReturnG};
   });
   response.comparison={quantities,choice:quantities.reduce((a,b)=>(d.priority==='energy'?a.energyKj<=b.energyKj:a.materialG<=b.materialG)?a:b).option};
 }
 if(task.review)response.review={channel:'spoken',observations:Object.fromEntries(task.review.rubric.map(c=>[c.id,'met'])),confirmedByAdult:true,assistance:'none'};
 return response;
}
