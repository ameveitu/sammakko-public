// Bundles src/main.js (+ three.js, tree-shaken) into the shipped homepage asset.
// Run: cd tools/saaristo && npm ci && npm run build
import { build } from 'rolldown';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('../../public/kotisivu/assets/saaristo/saaristo.js', import.meta.url));
const three = JSON.parse(readFileSync(new URL('node_modules/three/package.json', import.meta.url), 'utf8')).version;
await build({
  input: fileURLToPath(new URL('src/main.js', import.meta.url)),
  resolve: { alias: { three: fileURLToPath(new URL('node_modules/three/build/three.module.js', import.meta.url)) } },
  output: {
    file: out,
    format: 'esm',
    minify: true,
    banner: `/*! Sammakko /saaristo/ experiment (tools/saaristo). Includes three.js ${three} | MIT License | Copyright © 2010-2026 three.js authors | https://github.com/mrdoob/three.js/blob/dev/LICENSE */`,
  },
});
console.log(`saaristo.js: ${statSync(out).size} bytes (three ${three})`);
