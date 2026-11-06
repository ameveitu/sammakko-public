// Review-only static server: serves any packaged site directory (baseline or candidate)
// on 127.0.0.1 so the two can be compared side by side. Production uses ops/nginx.conf.
// Usage: node tools/visual-polish/serve.mjs <site-dir> [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? '.build/site');
const port = Number(process.argv[3] ?? 5222);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.md': 'text/markdown; charset=utf-8', '.woff2': 'font/woff2', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
http.createServer((request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); } catch { response.writeHead(400); response.end(); return; }
  let file = path.resolve(root, '.' + pathname);
  if (file !== root && !file.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!pathname.endsWith('/')) { response.writeHead(301, { location: pathname + '/' }); response.end(); return; }
    file = path.join(file, 'index.html');
  }
  let status = 200;
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { status = 404; file = path.join(root, '404.html'); }
  response.writeHead(status, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-cache', 'x-content-type-options': 'nosniff' });
  if (request.method === 'HEAD') response.end(); else fs.createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => console.log(`visual-polish review server ${root} → http://127.0.0.1:${port}`));
