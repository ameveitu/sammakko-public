// Bind the actual current Lite inputs while preserving supplied-snapshot provenance.
// This is metadata maintenance. It grants no content, technical or human approval.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {sourceBindings} from './source-bindings.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const network=path.join(root,'public/oppitunnit/lesson-network');
const ids=JSON.parse(fs.readFileSync(path.join(network,'reference/inputs/mvp-scope-181.json'))).selected_ids;
if(ids.length!==181||new Set(ids).size!==181)throw Error('Expected exact181');
const require=createRequire(path.join(root,'lite/package.json'));
const {createServer}=await import(require.resolve('vite'));
const server=await createServer({root:path.join(root,'lite'),logLevel:'error',server:{middlewareMode:true},appType:'custom'});
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const apply=process.argv.includes('--apply');
if(process.argv.slice(2).some(arg=>arg!=='--apply'))throw Error('Usage: sync-current-sources.mjs [--apply]');
try{
 const content=await server.ssrLoadModule('/src/content/index.ts');
 const {liteGeneratorSha256}=sourceBindings(root);
 const proposals=[];
 for(const kc of ids){
  const filename=path.join(network,'packages',kc,'lesson.json'),metadata=JSON.parse(fs.readFileSync(filename));
  const alignment=metadata.alignment,old=alignment.currentSource??{},spec=content.NODES[kc];
  if(!spec)throw Error('Missing current Lite counterpart: '+kc);
  const references=[...new Set([
   ...Object.keys(alignment.sourceHashes??{}),
   ...(Array.isArray(alignment.sourceFiles)?alignment.sourceFiles.map(file=>typeof file==='string'?file:file.path):Object.keys(alignment.sourceFiles??{})),
   ...Object.keys(old.sourceHashes??{}),
   'src/content/index.ts','src/content/families.ts','src/content/audit-rev.ts','src/engine/types.ts',
  ])].sort();
  const sourceHashes={},historicalNonLiteReferences=[];
  for(const reference of references){
   if(typeof reference!=='string')throw Error('Unsupported source reference: '+kc);
   // Older metadata uses snapshot prefixes and line/symbol annotations.
   const relative=reference.replace(/^authority\/production-181-v2\/lite\//,'').replace(/(\.(?:ts|json|md))(?::|\s).*$/,'$1');
   if(path.isAbsolute(relative)||relative.split('/').includes('..'))throw Error('Unsafe source path: '+relative);
   const filename=path.join(root,'lite',relative);
   if(!fs.existsSync(filename)&&!relative.startsWith('src/')){historicalNonLiteReferences.push(reference);continue;}
   if(!fs.statSync(filename).isFile())throw Error('Missing source input: '+relative);
   sourceHashes[relative]=digest(filename);
  }
  const current={...old,
   scope:'Current Lite source bytes; sourceFiles/sourceHashes outside currentSource remain historical supplied-snapshot provenance.',
   kcRevision:content.revOf(kc),
   validRevisions:[...new Set(spec.validRevs??[content.revOf(kc)])],
   revisionPolicy:spec.validRevs?'explicit_valid_revisions':'all_previous_revisions_remain_valid',
   liteGeneratorSha256,sourceHashes,historicalNonLiteReferences,
   reviewBoundary:'Source binding only. Current content/alignment decisions and technical evidence are separate; teacher and learner validation remain pending.',
  };
  if(JSON.stringify(old)!==JSON.stringify(current)){
   alignment.currentSource=current;metadata.revision++;
   proposals.push({kc,filename,metadata});
  }
 }
 // Resolve every source and counterpart before the first write.
 if(apply)for(const {filename,metadata}of proposals)fs.writeFileSync(filename,JSON.stringify(metadata,null,2)+'\n');
 console.log(JSON.stringify({exact181:ids.length,changed:proposals.length,action:apply?'bindings_updated_reviews_not_granted':'dry_run',liteGeneratorSha256}));
}finally{await server.close();}
