/* Sammakko visual polish VP05: a living painting behind Lite's map and lessons. Decoration
   only. decor.js loads this module on wide screens; it draws into its own canvas inside
   #vp-decor, never touches #app, reads no learner data, never uses the app's random source or
   clocks, and plays no sound. One painting + a motion mask (R water, G swaying plants,
   B sky/stars) + the approved character frames: all motion is one shader and a few moments. */

const VS_FULL = `#version 300 es
void main(){gl_Position=vec4(gl_VertexID==1?3.:-1.,gl_VertexID==2?3.:-1.,0,1);}`;

const FS_PAINT = `#version 300 es
precision highp float;
uniform sampler2D uImg,uMask;
uniform vec2 uView,uLamp;uniform float uDpr,uT,uAmp,uGlow,uDim,uBright,uHz,uAsp;
uniform vec3 uFit,uBg,uSun,uWake;uniform vec4 uRip[4];
out vec4 o;
float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float ns(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+1.),f.x),f.y);}
void main(){
 vec2 p=vec2(gl_FragCoord.x,uView.y*uDpr-gl_FragCoord.y)/uDpr;
 vec2 uv=vec2(p.x<uView.x*.5?p.x/uFit.x:1.-(uView.x-p.x)/uFit.x,1.-(uView.y-p.y+uFit.z)/uFit.y);
 vec4 m=texture(uMask,uv);
 float t=uT,dep=clamp((uv.y-uHz)/(1.-uHz),0.,1.),w=m.r;
 float ph=9./(dep+.12)+t*.9+3.*ns(vec2(uv.x*5.,uv.y*30.)+t*.08);
 vec2 d=w*uAmp*(.25+dep)*vec2(.0016*sin(ph),.0006*cos(ph*.7));
 d.x+=m.g*uAmp*.0013*sin(t*1.1+uv.y*9.+uv.x*4.)*(.6+.4*sin(t*.37+uv.x*3.));
 float ring=0.;
 for(int i=0;i<4;i++){vec4 r=uRip[i];if(r.w<=0.)continue;
  vec2 q=(uv-r.xy)*vec2(uAsp,2.8);float l=length(q);
  float k=exp(-pow((l-r.z*.05)/.006,2.))*r.w*exp(-r.z*.9);ring+=k;d+=q/(l+1e-4)*k*.003;}
 if(uWake.z>0.){vec2 q=(uv-uWake.xy)*vec2(uAsp,2.8);float f=fract(t*.35);
  ring+=exp(-pow((length(q)-.016-.012*f)/.003,2.))*.5*uWake.z*(1.-f);}
 ring*=w;
 vec3 c=texture(uImg,uv+d).rgb;
 float sc=exp(-pow((uv.x-uSun.x)/.07,2.)),hv=hs(floor(uv*vec2(360.,1100.)));
 c+=vec3(1.,.95,.8)*w*step(.94-.04*uGlow,hv)*pow(max(0.,sin(t*(1.2+hv*2.)+hv*40.)),8.)*(.15+.9*sc+.8*uGlow)*uAmp*.7;
 c+=vec3(.9,.95,1.)*ring*.2;
 float sky=smoothstep(.3,.6,m.b),star=smoothstep(.75,.95,m.b);
 c*=1.+sky*.03*sin(uv.x*3.-t*.05+uv.y*2.)*uAmp+star*.45*sin(t*2.3+hs(floor(uv*240.))*30.)*uAmp;
 vec2 s=(uv-uSun.xy)*vec2(uAsp,1.);
 c+=vec3(1.,.72,.42)*exp(-dot(s,s)/(uSun.z*uSun.z*9.))*(.05+.03*sin(t*.6)*uAmp+.22*uGlow);
 vec2 L=(uv-uLamp)*vec2(uAsp,1.);
 c+=vec3(1.,.9,.6)*exp(-dot(L,L)/.00006)*(.3+.45*pow(.5+.5*sin(t*1.3),6.)*uAmp);
 c=mix(c,c*vec3(1.07,1.03,.95)+.025,uGlow*.6);
 o=vec4(mix(c*uBright,uBg,uDim),1);
}`;

const VS_SPRITE = `#version 300 es
uniform vec2 uView;uniform vec4 uRect,uCell;uniform float uFlip;out vec2 vL,vA;
void main(){vec2 c=vec2(float(gl_VertexID&1),float(gl_VertexID>>1));vL=c;
 vec2 p=uRect.xy+c*uRect.zw;gl_Position=vec4(p.x/uView.x*2.-1.,1.-p.y/uView.y*2.,0,1);
 vA=uCell.xy+vec2(uFlip>0.?1.-c.x:c.x,c.y)*uCell.zw;}`;

const FS_SPRITE = `#version 300 es
precision mediump float;
uniform sampler2D uAt;uniform float uCut,uA,uDim;uniform vec3 uBg;in vec2 vL,vA;out vec4 o;
void main(){vec4 c=texture(uAt,vA)*uA*smoothstep(uCut+.012,uCut-.004,vL.y);c.rgb=mix(c.rgb,uBg*c.a,uDim);o=c;}`;

const VS_FLY = `#version 300 es
uniform vec2 uView;uniform vec3 uEm;uniform float uT,uLift,uAmp,uDpr,uSeed;out float vA;
float h(float n){return fract(sin(n*12.9898+uSeed)*43758.5453);}
void main(){float id=float(gl_VertexID),a=h(id),b=h(id+7.1),c=h(id+3.3),d=h(id+9.7),t=uT*(.25+.35*c);
 vec2 p=uEm.xy+vec2(cos(a*6.283),sin(a*6.283)*.55)*uEm.z*sqrt(b);
 p+=vec2(sin(t*1.7+a*20.)+sin(t*.9+d*9.),cos(t*1.3+b*17.)+sin(t*.7+c*5.))*uEm.z*.1;
 p+=vec2((c-.5)*1.4,-.5-.9*d)*uEm.z*uLift;
 gl_Position=vec4(p.x/uView.x*2.-1.,1.-p.y/uView.y*2.,0,1);
 vA=smoothstep(.2,1.,.5+.5*sin(uT*(.8+1.6*c)+a*30.))*(.6+.6*uLift)*uAmp;
 gl_PointSize=(7.+6.*d)*uDpr*(1.+uLift*.5);}`;

const FS_FLY = `#version 300 es
precision mediump float;uniform vec3 uCol;in float vA;out vec4 o;
void main(){float r=length(gl_PointCoord-.5),a=(smoothstep(.16,.04,r)+.45*pow(smoothstep(.5,.0,r),2.))*vA;o=vec4(uCol*a,a*.5);}`;

const COL = 720; // Lite's reading column (#app max-width); the painting shows in the margins.

/** Own deterministic randomness: the app's shared random source must stay untouched (seeded tests). */
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export async function start(opts) {
  const canvas = document.createElement('canvas');
  canvas.className = 'vp-world';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: !opts.soft });
  if (!gl) return null;
  let dead = false;
  if (!opts.soft) { // a software rasteriser would cost more than the decoration is worth
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    if (/swiftshader|llvmpipe|softpipe|software/i.test(String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER)))) return null;
  }
  const base = opts.base;
  let stage;
  try { const r = await fetch(base + 'stages.json'); if (!r.ok) return null; stage = await r.json(); } catch (e) { return null; }

  function prog(vs, fs) {
    const p = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); gl.attachShader(p, s);
    }
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i).name.replace(/\[0\]$/, ''); u[name] = gl.getUniformLocation(p, name); }
    return { p, u };
  }
  const paint = prog(VS_FULL, FS_PAINT), sprite = prog(VS_SPRITE, FS_SPRITE), fly = prog(VS_FLY, FS_FLY);
  if (!paint || !sprite || !fly) return null;
  gl.bindVertexArray(gl.createVertexArray());

  async function texture(file, opt) {
    const img = new Image();
    img.decoding = 'async';
    img.src = base + file;
    await img.decode();
    if (dead) throw new Error('Painting was disposed');
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !!opt.premul);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    if (opt.mip) gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, opt.mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  let atlas, painting;
  const cache = {};
  try { atlas = await texture(stage.atlas.image, { premul: true, mip: true }); } catch (e) { return null; }
  if (gl.isContextLost()) return null;
  async function load(id) {
    if (!cache[id]) {
      const own = stage.paintings[id], def = own.like ? { ...stage.paintings[own.like], ...own } : own;
      cache[id] = Promise.all([texture(def.image, { mip: true }), texture(def.mask, {})]).then(([img, mask]) => ({ id, def, img, mask }));
    }
    return cache[id];
  }

  const rand = rng(0x5a17 ^ Math.floor(performance.now()));
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const st = { visible: false, surface: '', world: 'saari', phase: 'evening', animate: false, chars: true, dark: false };
  let W = 1, H = 1, dpr = 1, Wp = 1, Hp = 1, par = 0.4, bg = [0.957, 0.945, 0.902];
  const ripples = [], env = { lift: null, glow: null };
  const now = () => performance.now() / 1000;
  const actor = (name, ax, ay) => ({ name, ax, ay, spot: null, u: 0, v: 0, pose: 'idle', hold: null, anim: null, flip: false, blinkAt: 0 });
  const loikka = actor('loikka', 0.5, 0.93), aava = actor('aava', 0.55, 0.79);
  let wanderAt = 0, poked = 0, lastRip = 0, lastPtr = [0, 0];

  function fit() {
    W = innerWidth; H = innerHeight;
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    const cw = Math.round(W * dpr), ch = Math.round(H * dpr);
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    if (painting) { const [iw, ih] = painting.def.size; const s = Math.max(H / ih, W / iw) * 1.05; Wp = iw * s; Hp = ih * s; }
    const css = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    const m = /^#([0-9a-f]{6})$/i.exec(css);
    bg = m ? [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255) : (st.dark ? [0.078, 0.125, 0.102] : [0.957, 0.945, 0.902]);
  }
  const screen = (u, v) => [u < 0.5 ? u * Wp : W - (1 - u) * Wp, H + (Hp - H) * par - (1 - v) * Hp];
  const uvAt = (x, y) => [x < W / 2 ? x / Wp : 1 - (W - x) / Wp, 1 - (H - y + (Hp - H) * par) / Hp];
  function size(v) {
    const hz = painting.def.horizon, k = 0.62 + 0.38 * Math.min(1, Math.max(0, (v - hz) / (1 - hz)));
    return 0.115 * Hp * k * (st.surface === 'lesson' ? 0.82 : 1);
  }
  function visible(spot, pad = 10) {
    const [x] = screen(spot.at[0], spot.at[1]), half = size(spot.at[1]) * 0.5, edge = (W - COL) / 2;
    return spot.at[0] < 0.5 ? x - half >= pad && x + half <= edge - pad : x - half >= W - edge + pad && x + half <= W - pad;
  }
  function spots(kinds, except) {
    const all = painting.def.spots;
    return Object.keys(all).filter((k) => kinds.includes(all[k].kind) && k !== except && visible(all[k]));
  }
  function place(a, id) {
    a.spot = id;
    if (!id) return;
    const s = painting.def.spots[id];
    [a.u, a.v] = s.at;
    a.flip = s.at[0] > 0.5; // face the reading column
  }
  function cast() {
    const water = spots(['water']), land = spots(['pad', 'rock']);
    if (!aava.spot || !water.includes(aava.spot)) place(aava, water.find((k) => k[0] === 'L') || water[0] || null);
    if (!loikka.spot || !land.includes(loikka.spot)) {
      const away = land.filter((k) => !aava.spot || k[0] !== aava.spot[0]);
      place(loikka, away[0] || land[land.length - 1] || null);
    }
  }

  function hold(a, pose, ms) { a.hold = { pose, until: now() + ms / 1000 }; }
  function ripple(u, v, strength) {
    const r = { u, v, t0: now(), w: strength };
    if (ripples.length >= 4) ripples.shift();
    ripples.push(r);
  }
  function hop(to) {
    if (!loikka.spot || loikka.anim) return;
    // Next free spot on the same shore, or a happy jump on the spot when none is in view.
    const target = to || pick(spots(['pad', 'rock'], loikka.spot).filter((k) => k[0] === loikka.spot[0])) || loikka.spot;
    const s = painting.def.spots[target];
    loikka.anim = { k: 'hop', from: [loikka.u, loikka.v], to: s.at, id: target, t0: now(), dur: 1.0 };
    if (target !== loikka.spot) loikka.flip = s.at[0] < loikka.u;
  }
  function swim() {
    if (!aava.spot || aava.anim) return;
    const target = pick(spots(['water'], aava.spot).filter((k) => k[0] === aava.spot[0]));
    if (!target) return;
    const s = painting.def.spots[target];
    aava.anim = { k: 'swim', from: [aava.u, aava.v], to: s.at, id: target, t0: now(), dur: 7 };
    aava.flip = s.at[0] < aava.u;
  }
  function flap() { if (aava.spot && !aava.anim) aava.anim = { k: 'flap', t0: now(), dur: 1.7 }; }
  const pulse = (key, dur) => { env[key] = { t0: now(), dur }; };

  /** A correct answer or reward: fireflies lift and one character moment; rewards and streaks get more. */
  function moment(kind, streak) {
    if (!st.visible || !painting) return;
    const big = kind === 'reward' || streak >= 3;
    if (!st.animate) { // reduced motion / static: a pose change only, no movement
      if (st.chars) { hold(loikka, 'happy', 1600); hold(aava, big ? 'celebrate' : 'wave', 1600); }
      draw(); setTimeout(() => draw(), 1700);
      return;
    }
    pulse('lift', big ? 3.6 : 2.8);
    if (big || rand() < 0.5) pulse('glow', big ? 2.6 : 2);
    if (!st.chars) return;
    hold(loikka, 'happy', 700);
    if (big) {
      hold(aava, 'celebrate', 1500);
      setTimeout(() => hop(), 700);
      if (kind === 'reward') setTimeout(flap, 1600);
      return;
    }
    const r = rand();
    if (r < 0.5) setTimeout(() => hop(), 600);
    else if (r < 0.8) hold(aava, 'wave', 1400);
    else flap();
  }

  function poseOf(a, t) {
    const n = a.anim;
    if (n && n.k === 'hop') {
      const e = (t - n.t0) / n.dur;
      return e < 0.18 ? 'crouch' : e < 0.36 ? 'leap' : e < 0.66 ? 'airborne' : e < 0.8 ? 'leap' : 'land';
    }
    if (n && n.k === 'flap') return Math.floor((t - n.t0) * 9) % 2 ? 'flap2' : 'flap1';
    if (a.hold && t < a.hold.until) return a.hold.pose;
    if (a === loikka && st.animate) {
      if (t > a.blinkAt + 0.14) a.blinkAt = t + 2.5 + rand() * 3.5;
      if (t > a.blinkAt) return 'blink';
    }
    return a === aava && st.surface !== 'lesson' && a.anim ? 'curious' : 'idle';
  }
  function step(a, t) {
    const n = a.anim;
    let lift = 0;
    if (!n) return lift;
    const e = Math.min(1, (t - n.t0) / n.dur);
    if (n.k === 'hop') {
      const f = Math.min(1, Math.max(0, (e - 0.18) / 0.62));
      const [x0, y0] = screen(...n.from), [x1, y1] = screen(...n.to), F = size(n.to[1]);
      lift = Math.sin(Math.PI * f) * (F * 0.55 + Math.hypot(x1 - x0, y1 - y0) * 0.25);
      a.u = n.from[0] + (n.to[0] - n.from[0]) * f; a.v = n.from[1] + (n.to[1] - n.from[1]) * f;
      if (e >= 0.8 && !n.splash) { n.splash = 1; if (painting.def.spots[n.id].kind !== 'rock') ripple(n.to[0], n.to[1], 0.8); }
    } else if (n.k === 'swim') {
      const f = e * e * (3 - 2 * e);
      a.u = n.from[0] + (n.to[0] - n.from[0]) * f; a.v = n.from[1] + (n.to[1] - n.from[1]) * f;
    } else if (n.k === 'flap') {
      lift = Math.sin(Math.PI * e) * size(a.v) * 0.5;
      if (e >= 1) ripple(a.u, a.v, 1);
    }
    if (e >= 1) {
      if (n.id) { a.spot = n.id; [a.u, a.v] = n.to; a.flip = n.to[0] > 0.5; }
      a.anim = null;
      if (n.k === 'hop') hold(a, 'land', 220);
    }
    return lift;
  }
  function envelope(key, t) {
    const e = env[key];
    if (!e) return 0;
    const f = (t - e.t0) / e.dur;
    if (f >= 1) { env[key] = null; return 0; }
    return f < 0.15 ? f / 0.15 : (1 - f) * (1 - f) / 0.7225;
  }

  function draw(ts) {
    if (!ready() || !st.visible) return;
    const t = st.animate ? (ts === undefined ? now() : ts / 1000) : 0;
    const tn = now();
    const amp = st.animate ? (st.surface === 'lesson' ? 0.35 : 1) : 0;
    const dim = st.surface === 'lesson' ? (st.dark ? 0.3 : 0.4) : st.dark ? 0.05 : 0.04;
    const bright = st.dark ? 0.58 : 1;
    const def = painting.def, edge = Math.ceil((W - COL) / 2 * dpr) + 1; // tucks under the column
    if (edge <= 1) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(bg[0], bg[1], bg[2], 1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.SCISSOR_TEST);
    const parts = [[0, edge], [canvas.width - edge, edge]];

    const P = paint.u;
    gl.useProgram(paint.p);
    gl.disable(gl.BLEND);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, painting.img); gl.uniform1i(P.uImg, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, painting.mask); gl.uniform1i(P.uMask, 1);
    gl.uniform2f(P.uView, W, H); gl.uniform1f(P.uDpr, dpr);
    gl.uniform3f(P.uFit, Wp, Hp, (Hp - H) * par);
    gl.uniform1f(P.uT, t); gl.uniform1f(P.uAmp, amp);
    gl.uniform1f(P.uGlow, envelope('glow', tn)); gl.uniform1f(P.uDim, dim); gl.uniform1f(P.uBright, bright);
    gl.uniform1f(P.uHz, def.horizon); gl.uniform1f(P.uAsp, def.size[0] / def.size[1]);
    gl.uniform3f(P.uBg, ...bg); gl.uniform3f(P.uSun, ...(def.sun || [-9, -9, 0.03])); gl.uniform2f(P.uLamp, ...(def.lamp || [-9, -9]));
    const rip = new Float32Array(16);
    ripples.forEach((r, i) => { const age = tn - r.t0; if (age < 4 && st.animate) rip.set([r.u, r.v, age, r.w], i * 4); });
    gl.uniform4fv(P.uRip, rip);
    const wake = st.chars && st.animate && aava.spot && !(aava.anim && aava.anim.k === 'flap');
    gl.uniform3f(P.uWake, aava.u, aava.v + 0.004, wake ? 1 : 0);
    for (const [x, w] of parts) { gl.scissor(x, 0, w, canvas.height); gl.drawArrays(gl.TRIANGLES, 0, 3); }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    if (st.chars) {
      const S = sprite.u;
      gl.useProgram(sprite.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, atlas); gl.uniform1i(S.uAt, 0);
      gl.uniform2f(S.uView, W, H); gl.uniform3f(S.uBg, ...bg);
      gl.uniform1f(S.uDim, st.surface === 'lesson' ? dim * 0.35 : 0); gl.uniform1f(S.uA, 1);
      const { cols, rows } = stage.atlas;
      for (const a of [loikka, aava]) {
        if (!a.spot) continue;
        const lift = st.animate ? step(a, tn) : 0, pose = poseOf(a, tn);
        const i = stage.frames.indexOf(a.name + '/' + (pose === 'blink' && a === aava ? 'idle' : pose));
        if (i < 0) continue;
        const F = size(a.v);
        let [x, y] = screen(a.u, a.v);
        y -= lift;
        if (a === aava && st.animate && !a.anim) y += Math.sin(tn * 1.6) * F * 0.012;
        // Aava floats: the frame is cut at her waterline until a flap lifts her clear of it.
        const cut = a === aava ? Math.min(2, a.ay + lift / F) : 2;
        gl.uniform4f(S.uRect, a.flip ? x - F * (1 - a.ax) : x - F * a.ax, y - F * a.ay, F, F);
        gl.uniform4f(S.uCell, (i % cols) / cols, Math.floor(i / cols) / rows, 1 / cols, 1 / rows);
        gl.uniform1f(S.uFlip, a.flip ? 1 : 0); gl.uniform1f(S.uCut, cut);
        for (const [sx, w] of parts) { gl.scissor(sx, 0, w, canvas.height); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
      }
    }
    if (st.animate && def.flies) {
      const Fl = fly.u;
      gl.useProgram(fly.p);
      gl.uniform2f(Fl.uView, W, H); gl.uniform1f(Fl.uT, t); gl.uniform1f(Fl.uDpr, dpr);
      gl.uniform1f(Fl.uLift, envelope('lift', tn)); gl.uniform1f(Fl.uAmp, st.surface === 'lesson' ? 0.6 : 1);
      gl.uniform3f(Fl.uCol, ...(def.fly || [1, 0.9, 0.42]));
      def.flies.forEach(([u, v, r], k) => {
        const [x, y] = screen(u, v);
        gl.uniform3f(Fl.uEm, x, y, r * Hp); gl.uniform1f(Fl.uSeed, k * 3.7);
        for (const [sx, w] of parts) { gl.scissor(sx, 0, w, canvas.height); gl.drawArrays(gl.POINTS, 0, st.surface === 'lesson' ? 40 : 90); }
      });
    }
    gl.disable(gl.SCISSOR_TEST);
    if (st.animate && st.surface !== 'lesson' && st.chars && tn > wanderAt) {
      if (wanderAt) { const r = rand(); if (r < 0.55) hop(); else if (r < 0.88) swim(); else flap(); }
      wanderAt = tn + 20 + rand() * 40;
    }
  }

  let raf = 0, last = 0;
  function loop(ts) {
    raf = requestAnimationFrame(loop);
    if (ts - last < 1000 / (st.surface === 'lesson' ? 20 : 30) - 2) return;
    last = ts;
    draw(ts);
  }
  function run() {
    const want = st.visible && st.animate && ready();
    if (want && !raf) raf = requestAnimationFrame(loop);
    if (!want && raf) { cancelAnimationFrame(raf); raf = 0; }
    if (!want) draw();
  }

  function onResize() { fit(); if (ready()) cast(); run(); }
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    par = st.animate ? 0.25 + 0.5 * (max > 0 ? Math.min(1, scrollY / max) : 0) : 0.4;
    if (!raf) draw();
  }
  function onPointer(e) {
    if (!st.visible || !st.animate || st.surface === 'lesson' || !ready()) return;
    const x = e.clientX, y = e.clientY, edge = (W - COL) / 2;
    if (x > edge && x < W - edge) return;
    const t = now();
    if (t - lastRip > 0.28 && Math.hypot(x - lastPtr[0], y - lastPtr[1]) > 24) { lastRip = t; lastPtr = [x, y]; ripple(...uvAt(x, y), e.type === 'pointerdown' ? 1 : 0.55); }
    if (loikka.spot && !loikka.anim && t - poked > 4 && st.chars) {
      const [lx, ly] = screen(loikka.u, loikka.v), F = size(loikka.v);
      if (Math.hypot(x - lx, y - (ly - F * 0.4)) < F * 0.5) { poked = t; hop(); }
    }
  }
  addEventListener('resize', onResize);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('pointermove', onPointer, { passive: true });
  addEventListener('pointerdown', onPointer, { passive: true });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); dead = true; if (raf) cancelAnimationFrame(raf); raf = 0; if (opts.onLost) opts.onLost(); });
  opts.host.insertBefore(canvas, opts.host.firstChild);
  fit();

  let desired = '', key = '';
  const loading = new Set();
  function ready() { return !dead && !!painting && painting.id === desired; }
  return {
    set(next) {
      if (dead) return;
      const k = JSON.stringify(next);
      if (k === key) return;
      key = k;
      Object.assign(st, next);
      const w = stage.worlds[st.world] || {};
      const id = w[st.phase] || w.evening || Object.keys(stage.paintings)[0];
      desired = id;
      if (st.visible && !ready() && !loading.has(id)) {
        loading.add(id);
        load(id).then((loaded) => {
          loading.delete(id);
          if (dead || desired !== id) return;
          painting = loaded;
          fit(); cast();
          onScroll(); // The loop is stopped during loading, so this presents the first frame.
          run();
          if (opts.onReady) opts.onReady();
        }, () => { loading.delete(id); });
      }
      if (ready()) { fit(); cast(); onScroll(); }
      run();
    },
    moment,
    get ready() { return ready(); },
    destroy() {
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      removeEventListener('resize', onResize); removeEventListener('scroll', onScroll);
      removeEventListener('pointermove', onPointer); removeEventListener('pointerdown', onPointer);
      canvas.remove();
    },
  };
}
