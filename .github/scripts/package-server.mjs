import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const root = fileURLToPath(new URL('../../', import.meta.url));
// Check source paths and every delivered byte before making a Docker build context.
execFileSync('python3', [path.join(root, '.github/scripts/check-site.py')], {stdio:'inherit'});
const output = path.join(root, '.build/server');
fs.rmSync(output, {recursive:true, force:true});
fs.mkdirSync(output, {recursive:true});
for (const file of ['Dockerfile', 'nginx.conf', 'compose.yaml', 'README_FI.md']) {
  const source = path.join(root, 'ops', file);
  assert(fs.lstatSync(source).isFile(), `Missing server configuration: ${file}`);
  fs.copyFileSync(source, path.join(output, file));
}
fs.cpSync(path.join(root, '.build/site'), path.join(output, 'site'), {recursive:true, errorOnExist:true});
console.log(JSON.stringify({output:'.build/server', site:'site/', server:'nginx', port:8080}));
