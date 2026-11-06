import fs from 'node:fs';
import {digest,loadPackages} from './content.mjs';
import {verifyValidationReceipt} from './validation-receipt.mjs';
const root=new URL('./',import.meta.url),read=p=>JSON.parse(fs.readFileSync(new URL(p,root)));
const graph=read('reference/inputs/canonical-690-graph.json'),selected=read('authority/phase1_1/lite181-kc-ids.json'),ids=new Set(selected),nodes=new Map(graph.nodes.map(n=>[n.id,n]));
if(ids.size!==181||selected.length!==181||selected.some(id=>!nodes.has(id)))throw Error('Wrong181 selection');
const rankSubject={mathematics:0,science:1,physics:2,chemistry:3};
const compare=(a,b)=>(rankSubject[nodes.get(a).subject]-rankSubject[nodes.get(b).subject])||a.localeCompare(b);
const dependencies=id=>(nodes.get(id).prerequisite_groups??[]).flatMap(g=>g.all_of??g.any_of??[]).filter(x=>ids.has(x));
const todo=new Set(selected),order=[];
while(todo.size){const ready=[...todo].filter(id=>dependencies(id).every(d=>!todo.has(d))).sort(compare);if(!ready.length)throw Error('Required ancestry cycle');for(const id of ready){order.push(id);todo.delete(id);}}
const pkgs=loadPackages(new URL('.',root).pathname,[...nodes.keys()]);
const receiptPath=new URL('evidence/production/technical-receipts.json',root);const receipts=fs.existsSync(receiptPath)?read('evidence/production/technical-receipts.json'):[];
const historicalReceipts=new Set(read('evidence/production/historical-receipt-identities.json').receipts.map(r=>r.sha256));
const validationCache=new Map();
const validationIssue=receipt=>{
 if(!receipt||historicalReceipts.has(digest(JSON.stringify(receipt))))return null; // Exact preserved objects only; old batch labels do not confer an exemption.
 const file=receipt.validationReceipt;
 if(typeof file!=='string'||!/^lesson-network\/evidence\/production\/[A-Za-z0-9_/-]+\.json$/.test(file)||file.split('/').includes('..'))return 'Missing/unsafe source-bound validation receipt';
 if(!validationCache.has(file)){
  try{const proof=JSON.parse(fs.readFileSync(new URL('../'+file,root)));validationCache.set(file,{valid:verifyValidationReceipt(new URL('../',root).pathname,proof),proof});}catch{validationCache.set(file,{valid:false});}
 }
 const result=validationCache.get(file);
 return result.valid&&result.proof.contentRevisions[receipt.kcId]===receipt.contentRevision?null:'Failed/stale source-bound validation receipt';
};
const lessons=order.map((id,index)=>{const pkg=pkgs.get(id),receipt=receipts.findLast(r=>r.kcId===id&&r.contentRevision===pkg?.metadata.contentRevision);const issue=validationIssue(receipt);return {kcId:id,order:index+1,title:nodes.get(id).title,gradeBand:nodes.get(id).grade_band,role:nodes.get(id).mastery_role,prerequisiteGroups:nodes.get(id).prerequisite_groups??[],selectedPrerequisiteOrder:dependencies(id),externalPrerequisites:(nodes.get(id).prerequisite_groups??[]).flatMap(g=>g.all_of??g.any_of??[]).filter(x=>!ids.has(x)),revision:pkg?.metadata.contentRevision??null,status:issue?'draft':receipt?.status??(pkg?'draft':'not_started'),sources:pkg?.metadata.research??[],outputs:pkg?['packages/'+id+'/lesson.json','site/lessons/'+id+'.html']:[],assets:pkg?.metadata.assets??[],simulationType:pkg?.metadata.extensions.simulationType??null,liteMapping:pkg?.metadata.alignment??null,openIssues:issue?[issue,...(receipt.openIssues??[])]:receipt?.openIssues??(pkg?['Independent domain/pedagogy/UI review and exact browser checks pending.']:[]),tests:receipt?.tests??[],humanReview:'not_performed'};});
fs.mkdirSync(new URL('evidence/production/',root),{recursive:true});
fs.writeFileSync(new URL('lesson-status.json',root),JSON.stringify({scope:181,network:690,otherPending:509,technicalChecked:lessons.filter(x=>x.status==='technical_checked').length,authored:pkgs.size,lessons},null,2)+'\n');
console.log(JSON.stringify({authored:pkgs.size,technicalChecked:lessons.filter(x=>x.status==='technical_checked').length,remaining:181-lessons.filter(x=>x.status==='technical_checked').length}));
