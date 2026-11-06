// Source-bound launch inventory. Reviews are preserved only while both source revisions match.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {sourceBindings} from './source-bindings.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const require=createRequire(path.join(root,'lite/package.json'));
const {createServer}=await import(require.resolve('vite'));
const {loadPackages}=await import('../../public/oppitunnit/lesson-network/content.mjs');
const out=path.join(root,'docs/releases/launch');
const filename=path.join(out,'review-ledger.json');
const previous=fs.existsSync(filename)?JSON.parse(fs.readFileSync(filename)):null;
const old=new Map((previous?.nodes??[]).map(n=>[n.kc,n]));
const calibration=['M-NUM-1TO1','M-NUM-QTY-NUMERAL','M-MEAS-00','M-DATA-04','M-FRAC-12','M79-INT-SUB','M79-EQ1-SOLVE','M79-FUNC-GRAPH','SCI-ENV-OBSERVE-01','PHY79-SPEED-CONCEPT','PHY79-ACCEL-VT-GRAPH'];
const vite=await createServer({root:path.join(root,'lite'),logLevel:'error',server:{middlewareMode:true},appType:'custom'});
try {
 const g=await vite.ssrLoadModule('/src/engine/graph.ts');
 const c=await vite.ssrLoadModule('/src/content/index.ts');
 const w=await vite.ssrLoadModule('/src/content/world.ts');
 const {rng}=await vite.ssrLoadModule('/src/engine/rng.ts');
 const packages=loadPackages(path.join(root,'public/oppitunnit/lesson-network'),g.ORDER);
 const canonical=json('public/oppitunnit/lesson-network/reference/inputs/canonical-690-graph.json');
 const debt=json('lite/tests/sweep-baseline.json');
 const baseline=json('docs/releases/launch/baseline-ledger.json');
 const baselineNodes=new Map(baseline.nodes.map(n=>[n.kc,n]));
 const reconstructedBase=process.env.SAMMAKKO_REVIEW_BASE_SHA;
 if(reconstructedBase&&!/^[a-f0-9]{40}$/.test(reconstructedBase))throw Error('Invalid verified remote base SHA');
 const sourceCommit=reconstructedBase??execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
 const sourceTreeDirty=!!reconstructedBase||Boolean(execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim());
 const bindings=sourceBindings(root);
 const {liteGeneratorSha256,lessonGeneratorSha256}=bindings;
 const nodes=[];
 for(const id of g.ORDER){
  const k=g.kc(id), spec=c.NODES[id], p=packages.get(id).metadata, ch=w.chapterOf(id);
  const families={}, kinds=new Set(), samples=[];
  for(const phase of ['guided','independent','transfer','retrieval']){
   const tags=new Set();
   for(let seed=1;seed<=24;seed++){
    const q=spec.item(rng(seed),phase==='retrieval'?'independent':phase); kinds.add(q.task.kind);
    if(!tags.has(q.tag)){ samples.push({phase,seed,tag:q.tag,kind:q.task.kind,question:q.say,hint:q.hint??null,explanation:q.explain??null,scenario:q.scn??null,task:q.task});tags.add(q.tag); }
   }
   families[phase]=[...tags].sort();
  }
  const prior=old.get(id);
  const same=prior?.lessonRevision===p.contentRevision&&prior?.liteRevision===c.revOf(id)&&previous?.liteGeneratorSha256===liteGeneratorSha256&&previous?.lessonGeneratorSha256===lessonGeneratorSha256;
  const review=same?prior.review:{automated:'inventory_only',softwareInspection:'pending',contentReview:'pending',teacherValidation:'pending',learnerValidation:'pending',reviewer:null,evidence:[],decision:'pending'};
  nodes.push({kc:id,title:k.title,subject:k.subject,grade:k.grade,world:ch.world,chapter:ch.name,lessonRevision:p.contentRevision,liteRevision:c.revOf(id),objective:p.planning.teacherObjective??spec.goal,childGoal:spec.goal,prerequisites:k.groups,demo:spec.demo(rng(1)).map(x=>x.say),families,interactionKinds:[...kinds].sort(),hint:p.alignment.inventory?.hints??null,errorFeedback:p.alignment.inventory?.explanations??null,solution:p.planning.workedExample??null,transfer:p.alignment.inventory?.transfer??null,evidenceLimits:p.planning.evidenceLimits??p.alignment.limitations??null,presentation:{status:'pending',calibration:calibration.includes(id)},controls:{status:'pending'},artImpact:'pending',baselineFeedbackFlags:baselineNodes.get(id)?.feedbackFlags??{},feedbackFlags:debt[id]??{},sourceReviewStates:{content:p.contentReview.state,alignment:p.alignmentReview.state,human:p.humanReview.state},samples,findings:same?prior.findings:[],corrections:same?prior.corrections:[],review,...(!same&&prior?{previousReview:prior.review}:{})});
 }
 const canonicalCount=canonical.nodes?.length??canonical.kcs?.length;
 if(nodes.length!==181||packages.size!==181||new Set(nodes.map(n=>n.kc)).size!==181||canonicalCount!==690)throw Error('Launch scope mismatch');
 const result={schemaVersion:1,sourceCommit,sourceTreeDirty,sourceCommitMeaning:reconstructedBase?'Verified remote base of source reconstructed through GitHub blobs; not a full local clone. Current modified content is identified by SHA256.':'HEAD base; current content is identified by SHA256 even when the worktree is dirty',generatedAt:new Date().toISOString(),evidenceMeaning:'Source/generator inventory only; not manual play, pedagogical approval or human validation.',canonicalCount,playableCount:nodes.length,otherScaffolds:canonicalCount-nodes.length,feedbackRiskNodes:baseline.feedbackRiskNodes,currentFeedbackRiskNodes:Object.keys(debt).length,...bindings,calibration,nodes};
 fs.mkdirSync(out,{recursive:true});fs.writeFileSync(filename,JSON.stringify(result,null,2)+'\n');
 const queue=nodes.filter(n=>!calibration.includes(n.kc)).sort((a,b)=>Number(Object.keys(b.baselineFeedbackFlags).length>0)-Number(Object.keys(a.baselineFeedbackFlags).length>0));
 const batches=[calibration];
 // Keep every non-calibration batch between 12 and18 nodes, including the last.
 while(queue.length){const size=Math.ceil(queue.length/Math.ceil(queue.length/16));batches.push(queue.splice(0,size).map(n=>n.kc));}
 const batchFile=path.join(out,'batches.json'),priorBatches=JSON.parse(fs.readFileSync(batchFile,'utf8')).batches;
 fs.writeFileSync(batchFile,JSON.stringify({prerequisite:'LR03 calibration verified before batches 2+',batches:batches.map((ids,i)=>{
  const prior=priorBatches.find(b=>JSON.stringify(b.ids)===JSON.stringify(ids));
  return {id:'LR04-'+String(i+1).padStart(2,'0'),ids,status:prior?.status??'pending',...(prior?.evidence?{evidence:prior.evidence}:{})};
 })},null,2)+'\n');
 console.log(JSON.stringify({sourceCommit,canonicalCount,playable:nodes.length,other:canonicalCount-nodes.length,feedbackRiskNodes:result.feedbackRiskNodes,interactionKinds:[...new Set(nodes.flatMap(n=>n.interactionKinds))].sort(),subjectCounts:nodes.reduce((a,n)=>(a[n.subject]=(a[n.subject]??0)+1,a),{})}));
} finally {await vite.close();}
