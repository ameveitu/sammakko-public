// Pure adapter for atomic authoring transformations in a shared checkout.
// Execute the same bounded refinement logic in memory, then expose only its
// fully validated output. The CLI's filesystem write/load operations are absent.
import fs from 'node:fs';
import { parseFragment, validateAudienceSource } from './audience.mjs';
import { digest } from './content.mjs';
const cli=fs.readFileSync(new URL('./refine-audience-steps.mjs',import.meta.url),'utf8');
const start=cli.indexOf(' // Static standalone figures');
const end=cli.indexOf('fs.writeFileSync(dir+');
if(start<0||end<0)throw Error('Refinement implementation changed; update pure adapter explicitly');
// The adapter includes the same removal of auto wrappers, and returns before
// the CLI commits its already-validated result. Imported functions are real.
const body=cli.slice(cli.indexOf(' for(const n of parsed.nodes.filter'),end);
const run=new Function('source','parseFragment','validateAudienceSource','digest','id',
 'let parsed=parseFragment(source),edits=[],before=digest(source);'+body+'return {source,steps:ordinal};');
export function refineAudienceSource(source){return run(source,parseFragment,validateAudienceSource,digest,'atomic-owned-source');}
