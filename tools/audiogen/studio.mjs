#!/usr/bin/env node
// Recording studio: record your own take for each core line and compare it with the AI take.
// Local only (127.0.0.1); takes and picks stay in the state folder, never in the repo.
//   node tools/audiogen/studio.mjs [--port 5230]   → open http://localhost:5230
// Picks reach the app only through:  node tools/audiogen/cli.mjs takes  &&  … pack [--pilot]
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { analyze, decodeWav } from './lib/wav.mjs';
import { speechKey } from './lib/text.mjs';
import { stateDir } from './lib/state.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PUBLIC = path.join(REPO, 'lite/public/audio');
const TAKES = path.join(stateDir(), 'takes');
const PICKS = path.join(TAKES, 'picks.json');
const port = Number(process.argv[process.argv.indexOf('--port') + 1]) || 5230;
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const SAFE = /^[a-z0-9][a-z0-9.\-]{0,120}$/; // catalog ids and take file names

function lines() {
  const core = readJson(path.join(REPO, 'audio/catalog/fi-FI/core.json'), { lines: [] }).lines;
  const man = readJson(path.join(PUBLIC, 'manifest.json'), { speech: {} });
  const picks = readJson(PICKS, {});
  return core.map((l) => {
    const dir = path.join(TAKES, l.id);
    const takes = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^self-.*\.wav$/.test(f)).sort() : [];
    const ai = man.speech[speechKey(l.speaker, l.displayText)];
    return { id: l.id, speaker: l.speaker, text: l.displayText, ai: ai ? `/ai/${ai.src}` : null, aiProvisional: !!ai?.provisional, takes, pick: picks[l.id] ?? null };
  });
}

function body(req, max) {
  return new Promise((ok, no) => {
    const parts = []; let n = 0;
    req.on('data', (c) => { n += c.length; if (n > max) { no(new Error('liian suuri')); req.destroy(); } else parts.push(c); });
    req.on('end', () => ok(Buffer.concat(parts)));
    req.on('error', no);
  });
}

const send = (res, code, data, type = 'application/json') => {
  res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(type === 'application/json' ? JSON.stringify(data) : data);
};

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && u.pathname === '/') return send(res, 200, PAGE, 'text/html; charset=utf-8');
    if (req.method === 'GET' && u.pathname === '/api/lines') return send(res, 200, lines());
    if (req.method === 'GET' && u.pathname.startsWith('/ai/speech/fi-FI/')) {
      const f = path.basename(u.pathname);
      if (!SAFE.test(f)) return send(res, 400, { error: 'nimi' });
      const file = path.join(PUBLIC, 'speech/fi-FI', f);
      return fs.existsSync(file) ? send(res, 200, fs.readFileSync(file), 'audio/mpeg') : send(res, 404, { error: 'ei löydy' });
    }
    // Pond-world kit listening page (cli.mjs world writes it).
    if (req.method === 'GET' && (u.pathname === '/world' || u.pathname === '/world/')) {
      const file = path.join(stateDir(), 'world', 'index.html');
      return fs.existsSync(file) ? send(res, 200, fs.readFileSync(file), 'text/html; charset=utf-8') : send(res, 404, { error: 'aja ensin: node tools/audiogen/cli.mjs world' });
    }
    const wf = u.pathname.match(/^\/world\/files\/([^/]+)$/);
    if (req.method === 'GET' && wf) {
      if (!SAFE.test(wf[1])) return send(res, 400, { error: 'nimi' });
      const file = path.join(stateDir(), 'world', 'files', wf[1]);
      return fs.existsSync(file) ? send(res, 200, fs.readFileSync(file), wf[1].endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav') : send(res, 404, { error: 'ei löydy' });
    }
    const m = u.pathname.match(/^\/take\/([^/]+)\/([^/]+)$/);
    if (req.method === 'GET' && m) {
      if (!SAFE.test(m[1]) || !SAFE.test(m[2])) return send(res, 400, { error: 'nimi' });
      const file = path.join(TAKES, m[1], m[2]);
      return fs.existsSync(file) ? send(res, 200, fs.readFileSync(file), 'audio/wav') : send(res, 404, { error: 'ei löydy' });
    }
    if (req.method === 'POST' && u.pathname === '/api/take') {
      const id = u.searchParams.get('id');
      const line = lines().find((l) => l.id === id);
      if (!line) return send(res, 400, { error: 'tuntematon repliikki' });
      const wav = await body(req, 12 * 1024 * 1024);
      const dec = decodeWav(wav); // throws on anything but PCM WAV
      const a = analyze(dec.samples, dec.rate);
      if (a.ms < 300) return send(res, 400, { error: 'otto on liian lyhyt' });
      const name = `self-${new Date().toISOString().replace(/[:.]/g, '-').toLowerCase()}.wav`;
      fs.mkdirSync(path.join(TAKES, id), { recursive: true });
      fs.writeFileSync(path.join(TAKES, id, name), wav);
      fs.writeFileSync(path.join(TAKES, id, name.replace(/\.wav$/, '.json')), JSON.stringify({ id, speaker: line.speaker, displayText: line.text, spokenText: line.text, recordedAt: new Date().toISOString(), sha256: sha256(wav), rate: dec.rate, ...a }, null, 2));
      return send(res, 200, { file: name, ...a });
    }
    if (req.method === 'POST' && u.pathname === '/api/pick') {
      const { id, pick } = JSON.parse(String(await body(req, 4096)));
      const line = lines().find((l) => l.id === id);
      if (!line) return send(res, 400, { error: 'tuntematon repliikki' });
      if (!(pick === null || pick === 'ai' || line.takes.includes(pick))) return send(res, 400, { error: 'tuntematon valinta' });
      const picks = readJson(PICKS, {});
      if (pick === null) delete picks[id]; else picks[id] = pick;
      fs.mkdirSync(TAKES, { recursive: true });
      fs.writeFileSync(PICKS, JSON.stringify(picks, null, 2));
      return send(res, 200, { ok: true });
    }
    if (req.method === 'POST' && u.pathname === '/api/delete') {
      const { id, file } = JSON.parse(String(await body(req, 4096)));
      if (!SAFE.test(id ?? '') || !/^self-[a-z0-9-]+\.wav$/.test(file ?? '')) return send(res, 400, { error: 'nimi' });
      // Deleted takes move to a bin folder, not removed for good.
      const from = path.join(TAKES, id, file), bin = path.join(TAKES, '_poistetut', id);
      if (!fs.existsSync(from)) return send(res, 404, { error: 'ei löydy' });
      fs.mkdirSync(bin, { recursive: true });
      for (const f of [file, file.replace(/\.wav$/, '.json')]) if (fs.existsSync(path.join(TAKES, id, f))) fs.renameSync(path.join(TAKES, id, f), path.join(bin, f));
      const picks = readJson(PICKS, {});
      if (picks[id] === file) { delete picks[id]; fs.writeFileSync(PICKS, JSON.stringify(picks, null, 2)); }
      return send(res, 200, { ok: true });
    }
    send(res, 404, { error: 'ei löydy' });
  } catch (e) {
    send(res, 400, { error: String(e.message ?? e) });
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Äänitysstudio: http://localhost:${port}  (otot: ${TAKES})`));

const PAGE = `<!doctype html><html lang="fi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sammakon äänitysstudio</title>
<style>
:root{--bg:#f6f4ee;--card:#fff;--ink:#1d2a22;--muted:#5d6b62;--line:#dcd8cc;--accent:#2f7d4f;--rec:#c0392b;--chip:#eef3ee}
@media (prefers-color-scheme:dark){:root{--bg:#141a16;--card:#1d241f;--ink:#e8efe9;--muted:#9fb0a5;--line:#33403a;--accent:#6cc48f;--rec:#ff6b5b;--chip:#25302a}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,sans-serif}
header{position:sticky;top:0;z-index:2;background:var(--bg);border-bottom:1px solid var(--line);padding:12px 16px;display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center}
h1{font-size:18px;margin:0}main{max-width:860px;margin:0 auto;padding:16px}
.muted{color:var(--muted);font-size:14px}.chips{display:flex;gap:6px;flex-wrap:wrap}
.chip{border:1px solid var(--line);background:var(--chip);color:var(--ink);border-radius:99px;padding:4px 12px;cursor:pointer;font:inherit;font-size:14px}
.chip[aria-pressed=true]{background:var(--accent);border-color:var(--accent);color:#fff}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin:0 0 12px}
.card.focus{outline:2px solid var(--accent)}
.who{font-size:13px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
.text{font-size:20px;margin:4px 0 10px}
.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0}
button.b{font:inherit;font-size:14px;border:1px solid var(--line);background:var(--chip);color:var(--ink);border-radius:8px;padding:6px 12px;cursor:pointer}
button.rec{background:var(--rec);border-color:var(--rec);color:#fff}button.rec.on{animation:p 1s infinite}
@keyframes p{50%{opacity:.6}}@media (prefers-reduced-motion:reduce){button.rec.on{animation:none}}
label.opt{display:flex;gap:6px;align-items:center;font-size:14px}
.level{height:6px;width:120px;background:var(--line);border-radius:3px;overflow:hidden}.level i{display:block;height:100%;width:0;background:var(--accent)}
.err{color:var(--rec);font-size:14px}
</style></head><body>
<header><h1>Sammakon äänitysstudio</h1><span class="muted" id="sum"></span>
<div class="chips" id="filters"></div><span class="muted">R = äänitä/pysäytä, ↑↓ = repliikki, välilyönti = kuuntele tekoäly</span></header>
<main><p class="muted">Lue repliikki täsmälleen niin kuin se on kirjoitettu. Otot tallentuvat vain tälle koneelle. Valintasi menee sovellukseen vasta komennoilla <code>node tools/audiogen/cli.mjs takes</code> ja <code>pack</code>.</p><div id="list"></div></main>
<script>
let L=[],filter='kaikki',cur=0,rec=null;
const $=(s,e=document)=>e.querySelector(s);
const esc=(s)=>s.replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const NAMES={Aava:'Aava',Loikka:'Loikka',narrator:'Kertoja',Sulka:'Sulka (kertoja)'};
async function load(){L=await (await fetch('/api/lines')).json();render();}
function shown(){return L.filter((l)=>filter==='kaikki'||(filter==='tekemättä'?!l.takes.length:l.speaker===filter));}
function render(){
  const sp=['kaikki','tekemättä',...new Set(L.map((l)=>l.speaker))];
  $('#filters').innerHTML=sp.map((s)=>'<button class="chip" aria-pressed="'+(s===filter)+'" data-f="'+s+'">'+(NAMES[s]||s)+'</button>').join('');
  const own=L.filter((l)=>l.takes.length).length, mine=L.filter((l)=>l.pick&&l.pick!=='ai').length;
  $('#sum').textContent=own+'/'+L.length+' repliikillä oma otto · '+mine+' valittu omaksi';
  $('#list').innerHTML=shown().map((l,i)=>'<section class="card'+(i===cur?' focus':'')+'" data-id="'+l.id+'"><div class="who">'+(NAMES[l.speaker]||l.speaker)+'</div><div class="text">'+esc(l.text)+'</div>'+
   '<div class="row"><button class="b rec" data-a="rec">● Äänitä</button><span class="level"><i></i></span><span class="err"></span></div>'+
   '<div class="row">'+(l.ai?'<label class="opt"><input type="radio" name="p-'+l.id+'" value="ai"'+(l.pick==='ai'?' checked':'')+'> Tekoäly'+(l.aiProvisional?' (väliaikainen)':'')+'</label><button class="b" data-a="play" data-src="'+l.ai+'">▶</button>':'<span class="muted">Ei tekoälyottoa</span>')+'</div>'+
   l.takes.map((t,k)=>'<div class="row"><label class="opt"><input type="radio" name="p-'+l.id+'" value="'+t+'"'+(l.pick===t?' checked':'')+'> Oma otto '+(k+1)+'</label><button class="b" data-a="play" data-src="/take/'+l.id+'/'+t+'">▶</button><button class="b" data-a="del" data-t="'+t+'">Poista</button></div>').join('')+
   '<div class="row"><label class="opt"><input type="radio" name="p-'+l.id+'" value=""'+(l.pick?'':' checked')+'> Ei vielä valintaa</label></div></section>').join('');
}
let audio=null;function play(src){if(audio)audio.pause();audio=new Audio(src);audio.play();}
async function toWav(blob){
  const ctx=new AudioContext();const buf=await ctx.decodeAudioData(await blob.arrayBuffer());ctx.close();
  const rate=24000,len=Math.ceil(buf.duration*rate);const off=new OfflineAudioContext(1,len,rate);
  const s=off.createBufferSource();s.buffer=buf;s.connect(off.destination);s.start();const r=await off.startRendering();
  const x=r.getChannelData(0),dv=new DataView(new ArrayBuffer(44+x.length*2));
  const w=(o,t)=>{for(let i=0;i<t.length;i++)dv.setUint8(o+i,t.charCodeAt(i));};
  w(0,'RIFF');dv.setUint32(4,36+x.length*2,true);w(8,'WAVE');w(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);
  dv.setUint32(24,rate,true);dv.setUint32(28,rate*2,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);w(36,'data');dv.setUint32(40,x.length*2,true);
  for(let i=0;i<x.length;i++)dv.setInt16(44+i*2,Math.max(-32768,Math.min(32767,Math.round(x[i]*32767))),true);
  return new Blob([dv],{type:'audio/wav'});
}
async function toggleRec(card){
  const btn=$('[data-a=rec]',card),err=$('.err',card);err.textContent='';
  if(rec){rec.stop();return;}
  let stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,autoGainControl:false,noiseSuppression:true,channelCount:1}});}
  catch(e){err.textContent='Mikrofoni ei ole käytössä: '+e.message;return;}
  const chunks=[],mr=new MediaRecorder(stream);rec=mr;btn.classList.add('on');btn.textContent='■ Pysäytä';
  const ac=new AudioContext(),an=ac.createAnalyser();ac.createMediaStreamSource(stream).connect(an);const d=new Uint8Array(an.fftSize),bar=$('.level i',card);
  let raf;const meter=()=>{an.getByteTimeDomainData(d);let p=0;for(const v of d)p=Math.max(p,Math.abs(v-128));bar.style.width=Math.min(100,p/1.28)+'%';bar.style.background=p>120?'var(--rec)':'';raf=requestAnimationFrame(meter);};meter();
  mr.ondataavailable=(e)=>chunks.push(e.data);
  mr.onstop=async()=>{cancelAnimationFrame(raf);ac.close();stream.getTracks().forEach((t)=>t.stop());rec=null;bar.style.width='0';
    try{const wav=await toWav(new Blob(chunks,{type:mr.mimeType}));
      const r=await fetch('/api/take?id='+encodeURIComponent(card.dataset.id),{method:'POST',body:wav});const j=await r.json();
      if(!r.ok)throw new Error(j.error);await load();}
    catch(e){err.textContent='Tallennus epäonnistui: '+e.message;btn.classList.remove('on');btn.textContent='● Äänitä';}};
  mr.start();
}
document.addEventListener('click',async(e)=>{
  const f=e.target.closest('[data-f]');if(f){filter=f.dataset.f;cur=0;render();return;}
  const b=e.target.closest('[data-a]');if(!b)return;const card=b.closest('.card');
  cur=[...document.querySelectorAll('.card')].indexOf(card);
  if(b.dataset.a==='play')play(b.dataset.src);
  if(b.dataset.a==='rec')toggleRec(card);
  if(b.dataset.a==='del'&&confirm('Siirretäänkö otto poistettuihin?')){await fetch('/api/delete',{method:'POST',body:JSON.stringify({id:card.dataset.id,file:b.dataset.t})});load();}
});
document.addEventListener('change',async(e)=>{if(e.target.type!=='radio')return;const id=e.target.name.slice(2);
  await fetch('/api/pick',{method:'POST',body:JSON.stringify({id,pick:e.target.value||null})});const l=L.find((x)=>x.id===id);l.pick=e.target.value||null;render();});
document.addEventListener('keydown',(e)=>{if(e.target.matches('input,textarea'))return;const cards=[...document.querySelectorAll('.card')];if(!cards.length)return;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(rec)return;cur=Math.max(0,Math.min(cards.length-1,cur+(e.key==='ArrowDown'?1:-1)));cards.forEach((c,i)=>c.classList.toggle('focus',i===cur));cards[cur].scrollIntoView({block:'center'});}
  if(e.key==='r'||e.key==='R'){e.preventDefault();toggleRec(cards[cur]);}
  if(e.key===' '){e.preventDefault();const p=$('[data-a=play]',cards[cur]);if(p)play(p.dataset.src);}});
load();
</script></body></html>`;
