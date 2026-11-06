import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {publicationSettings,decorateHtml,sitemap} from './publication-metadata.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
assert(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--ci'), 'Usage: package-site.mjs [--ci]');
const ci = process.argv[2] === '--ci';
const inputs = ci
  ? {lite:'.build/inputs/lite', oppitunnit:'.build/inputs/oppitunnit'}
  : {lite:'lite/dist', oppitunnit:'public/oppitunnit/lesson-network/site'};
const out = path.join(root, '.build/site');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
for (const input of Object.values(inputs)) assert(fs.statSync(path.join(root, input, 'index.html')).isFile(), `Missing built index: ${input}`);
const settings = publicationSettings(read(path.join(root,'public/publication-config.json')),process.env.SAMMAKKO_PUBLIC_ORIGIN);
const runtime = read(path.join(root, inputs.lite, 'lite-runtime.json'));
const liteIds = runtime.runtimeAvailability.ids;
assert.equal(liteIds.length, 181, 'Lite must ship 181 KC IDs');
assert.equal(new Set(liteIds).size, 181, 'Lite IDs must be unique');
const titles = read(path.join(root, inputs.lite, 'canonical-ids.json'));
assert.equal(Object.keys(titles.titles).length, 690, 'Lite must ship all canonical titles');
const pages = fs.readdirSync(path.join(root, inputs.oppitunnit, 'lessons')).filter(name => name.endsWith('.html'));
assert.equal(pages.length, 690, 'Lesson site must contain 690 pages');
assert.deepEqual(pages.map(name => name.slice(0, -5)).sort(), Object.keys(titles.titles).sort(), 'Lesson and canonical IDs must match');
const presentations = fs.readdirSync(path.join(root, inputs.oppitunnit, 'presentations')).filter(name => name.endsWith('.html'));
assert.deepEqual(presentations.map(name=>name.slice(0,-5)).sort(), [...liteIds].sort(), 'Audience pages must match exact181');

function publication(source, destination, permitted) {
  const manifest = read(path.join(root, source, 'publication-manifest.json'));
  assert.equal(manifest.schema, 'sammakko-publication/1', `Invalid publication manifest: ${source}`);
  assert(Array.isArray(manifest.files) && manifest.files.length, `Empty publication: ${source}`);
  assert.equal(new Set(manifest.files).size, manifest.files.length, `Duplicate publication file: ${source}`);
  return manifest.files.map(name => {
    assert(typeof name === 'string' && /^[A-Za-z0-9_./-]+$/.test(name), `Invalid publication path: ${name}`);
    assert(!name.startsWith('/') && name.split('/').every(part => part && part !== '.' && part !== '..' && !part.startsWith('.')), `Unsafe publication path: ${name}`);
    assert(permitted.test(name), `File outside publication allowlist: ${source}/${name}`);
    const absolute = path.join(root, source, name);
    // Check every component; a file reached through a symlinked directory is not allowed either.
    let current = path.join(root, source);
    for (const part of name.split('/')) {
      current = path.join(current, part);
      assert(!fs.lstatSync(current).isSymbolicLink(), `Symlink in publication: ${source}/${name}`);
    }
    assert(fs.lstatSync(absolute).isFile(), `Missing publication file: ${source}/${name}`);
    return {source:absolute, relative:destination + name};
  });
}
const publicationFiles = [
  ...publication('public/kotisivu', '', /^(?:index\.html|404\.html|tietoa\/index\.html|saaristo\/index\.html|assets\/[A-Za-z0-9_./-]+\.(?:css|js|svg|png|webp|woff2)|assets\/saaristo\/audio\/[a-z0-9.-]+\.[0-9a-f]{10}\.mp3)$/),
  ...publication('public/whitepaper', 'whitepaper/', /^(?:index\.html|whitepaper\.css|Sammakko_whitepaper_FI\.md)$/),
  ...publication('public/oppimisverkko', 'oppimisverkko/', /^(?:index\.html|network\.css|network\.js|view\.js|navigation\.js)$/),
];
const canonicalGraphSource = path.join(root, 'public/oppitunnit/lesson-network/reference/inputs/canonical-690-graph.json');
const canonicalGraph = read(canonicalGraphSource);
assert.equal(canonicalGraph.nodes?.length, 690, 'Canonical learning network must contain 690 nodes');
assert.equal(canonicalGraph.nodes.reduce((sum, node) => sum + (node.relations?.length ?? 0), 0), 1287, 'Canonical learning network must contain 1287 relations');
publicationFiles.push({source:canonicalGraphSource, relative:'oppimisverkko/data/canonical-690-graph.json'});
for (const required of ['index.html', '404.html', 'tietoa/index.html', 'assets/brand.css', 'assets/site.js', 'whitepaper/index.html', 'whitepaper/Sammakko_whitepaper_FI.md', 'oppimisverkko/index.html', 'oppimisverkko/network.js', 'oppimisverkko/data/canonical-690-graph.json']) {
  assert(publicationFiles.some(file => file.relative === required), `Publication is missing ${required}`);
}

// The fixed output and explicit source allowlists keep repository authoring files off the server.
fs.rmSync(out, {recursive:true, force:true});
const files = {};
function copyFile(source, relative) {
  assert(!(relative in files), `Duplicate output: ${relative}`);
  let bytes = fs.readFileSync(source);
  if(relative.endsWith('.html')) {
    if(relative === 'lite/index.html') {
      const html = bytes.toString('utf8');
      assert(!html.includes('name="sammakko-publication"'), 'Standalone Lite must not claim a combined publication');
      assert(html.includes('</head>'), 'Lite index must contain a head element');
      // Only the combined, verified site owns the links back to its other sections.
      // A standalone Lite build remains usable at /lite/ without advertising them.
      bytes = Buffer.from(html.replace('</head>', '<meta name="sammakko-publication" content="site"></head>'));
    }
    const scaffold=relative.startsWith('oppitunnit/lessons/')&&!liteIds.includes(path.basename(relative,'.html'));
    bytes=Buffer.from(decorateHtml(bytes.toString('utf8'),relative,settings,scaffold));
  }
  writeOutput(bytes,relative);
}
function writeOutput(bytes,relative) {
  assert(!(relative in files), `Duplicate output: ${relative}`);
  const target = path.join(out, relative);
  fs.mkdirSync(path.dirname(target), {recursive:true});
  fs.writeFileSync(target, bytes);
  files[relative] = {bytes:bytes.length, sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
}
function copyTree(source, prefix) {
  assert(fs.lstatSync(source).isDirectory() && !fs.lstatSync(source).isSymbolicLink(), `Unsafe build directory: ${source}`);
  for (const name of fs.readdirSync(source).sort()) {
    const from = path.join(source, name), relative = `${prefix}/${name}`, st = fs.lstatSync(from);
    if (st.isDirectory()) copyTree(from, relative);
    else {
      assert(st.isFile(), `Unsupported build entry: ${relative}`);
      copyFile(from, relative);
    }
  }
}
for (const [prefix, input] of Object.entries(inputs)) copyTree(path.join(root, input), prefix);
for (const file of publicationFiles) copyFile(file.source, file.relative);
const sitemapText=sitemap(settings,Object.keys(files).filter(name=>name.endsWith('.html')),new Set(liteIds));
writeOutput(Buffer.from(sitemapText),'sitemap.xml');
writeOutput(Buffer.from('User-agent: *\nAllow: /\n'+(settings.publicOrigin?`Sitemap: ${settings.publicOrigin}/sitemap.xml\n`:'')),'robots.txt');
const sourceCommit = /^[0-9a-f]{40}$/.test(process.env.GITHUB_SHA ?? '') ? process.env.GITHUB_SHA : null;
const sections = ['kotisivu', 'whitepaper', 'oppitunnit', 'oppimisverkko', 'lite'];
fs.writeFileSync(path.join(out, 'release.json'), JSON.stringify({schema:'sammakko-site-release/1', sourceCommit, publication:{mode:settings.mode,publicOrigin:settings.publicOrigin,authorTbd:!settings.authorName,contactTbd:!settings.contactEmail}, sections, liteKcs:181, lessonPages:690, presentationPages:181, authoredLessonDrafts:181, lessonScaffolds:509, files}, null, 2) + '\n');
console.log(JSON.stringify({output:'.build/site', sourceCommit, sections, fileCount:Object.keys(files).length}));
