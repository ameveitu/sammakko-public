/* VP03: decorative water light and reeds. No app/input/storage access. Shared
   motion/visibility lifecycle; unsupported WebGL keeps painted water. */
(function () {
  'use strict';
  var stage = document.querySelector('.vp-stage'), sea = stage && stage.querySelector('.vp-sea');
  if (!sea) return;
  var root = document.documentElement;
  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var renderer = null, failed = false, disposed = false, suspended = false;
  var visible = !('IntersectionObserver' in window), active = false, dirtySize = true;
  var raf = 0, timer = 0, deadline = 0, previous = 0, elapsed = 0, interval = 1000 / 30;
  function state(name, value) { if (stage.getAttribute(name) !== value) stage.setAttribute(name, value); }
  function mode() { return root.getAttribute('data-vp') || 'static'; }
  function allowed() { return mode() === 'on' && !(reduce && reduce.matches) && !root.classList.contains('calm-chars'); }
  function running() { return !disposed && !suspended && visible && !document.hidden && allowed(); }
  function cancel() {
    if (raf) cancelAnimationFrame(raf);
    if (timer) clearTimeout(timer);
    raf = timer = 0; previous = deadline = 0;
  }
  function createRenderer() {
    var canvas = document.createElement('canvas'), gl = null, prog = null, buf = null, shaders = [];
    canvas.setAttribute('aria-hidden', 'true');
    function release() {
      canvas.removeEventListener('webglcontextlost', onLoss);
      if (gl) {
        shaders.forEach(function (s) { gl.deleteShader(s); });
        if (buf) gl.deleteBuffer(buf);
        if (prog) gl.deleteProgram(prog);
        var lose = gl.getExtension('WEBGL_lose_context');
        if (lose && !gl.isContextLost()) lose.loseContext();
      }
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
    function onLoss(e) { e.preventDefault(); failed = true; dropRenderer(); sync(); }
    try {
      gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: true });
      if (!gl) return null;
      var vs = 'attribute vec2 p;varying mediump vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
      var precision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
      var fs = 'precision ' + (precision && precision.precision ? 'highp' : 'mediump') + ' float;varying mediump vec2 uv;uniform float t;uniform vec2 r;' +
        'float h(vec2 q){return fract(sin(dot(q,vec2(12.9898,78.233)))*61.123);}' +
        'void main(){vec2 q=vec2(uv.x*r.x/r.y,uv.y);float row=floor(q.y*26.);float y=fract(q.y*26.);' +
        'float sp=.6+h(vec2(row,1.))*.8;float x=q.x*3.+t*.018*sp+h(vec2(row,2.))*9.;float cell=floor(x);float f=fract(x);' +
        'float on=step(.72,h(vec2(cell,row)));float len=.18+.22*h(vec2(cell,row+7.));' +
        'float dash=smoothstep(0.,.06,f)*(1.-smoothstep(len-.06,len,f))*smoothstep(.1,.45,y)*(1.-smoothstep(.55,.9,y));' +
        'float pulse=.5+.5*sin(t*.35+h(vec2(cell,row+3.))*6.283);' +
        // Twinkling four-point glints: one candidate per cell, a short bright flash every few seconds.
        'vec2 g=q*9.;vec2 c=floor(g);float s=h(c+4.);vec2 d=fract(g)-.5-(vec2(h(c+1.),h(c+2.))-.5)*.4;' +
        'float tw=pow(max(0.,sin(t*(.8+s)+s*60.)),6.)*step(.5,s);vec2 e=abs(d);' +
        'float star=1.-smoothstep(.02,.13,length(d))+(1.-smoothstep(.01,.06,e.y))*max(0.,1.-e.x*2.)+(1.-smoothstep(.01,.06,e.x))*max(0.,1.-e.y*2.6);' +
        'float a=min(1.,on*dash*pulse*.6+1.5*star*tw)*(1.-smoothstep(.7,1.,uv.y))*smoothstep(0.,.06,uv.y)*smoothstep(0.,.15,uv.x);gl_FragColor=vec4(a,a,a*.93,a);}';
      function shader(type, src) {
        var s = gl.createShader(type);
        if (!s) throw Error('shader');
        shaders.push(s); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error('compile');
        return s;
      }
      prog = gl.createProgram();
      if (!prog) throw Error('program');
      gl.attachShader(prog, shader(gl.VERTEX_SHADER, vs));
      gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw Error('link');
      shaders.forEach(function (s) { gl.deleteShader(s); }); shaders = [];
      gl.useProgram(prog); buf = gl.createBuffer();
      if (!buf) throw Error('buffer');
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      var uT = gl.getUniformLocation(prog, 't'), uR = gl.getUniformLocation(prog, 'r');
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      canvas.addEventListener('webglcontextlost', onLoss); sea.appendChild(canvas); dirtySize = true;
      return { release: release, draw: function (t) {
        if (dirtySize) {
          var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
          canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
          canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
          gl.viewport(0, 0, canvas.width, canvas.height); dirtySize = false;
        }
        gl.uniform1f(uT, t); gl.uniform2f(uR, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }};
    } catch (e) { release(); return null; }
  }
  function dropRenderer() { cancel(); if (renderer) renderer.release(); renderer = null; }
  function queue() {
    if (!active || !renderer || timer || raf) return;
    timer = setTimeout(function () { timer = 0; if (running()) raf = requestAnimationFrame(frame); else sync(); }, Math.max(0, deadline - performance.now()));
  }
  function frame(now) {
    raf = 0;
    if (!running() || !renderer) { sync(); return; }
    if (previous) elapsed += Math.min(now - previous, 100) / 1000;
    previous = now;
    try { renderer.draw(elapsed); } catch (e) { failed = true; dropRenderer(); sync(); return; }
    deadline = deadline ? Math.max(deadline + interval, now) : now + interval;
    queue();
  }
  function sync() {
    if (disposed) return;
    active = running();
    state('data-vp-motion', mode() === 'off' ? 'off' : !allowed() ? 'static' : active ? 'running' : 'paused');
    if (!active) cancel();
    if (!allowed()) { dropRenderer(); state('data-vp-ambient', mode() === 'off' ? 'off' : 'static'); return; }
    if (active && !renderer && !failed) { renderer = createRenderer(); if (!renderer) failed = true; }
    state('data-vp-ambient', failed ? 'fallback' : active ? 'running' : 'paused');
    if (active) queue();
  }
  function resized() { dirtySize = true; if (!io) checkVisible(); }
  function checkVisible() { var r = sea.getBoundingClientRect(); visible = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; sync(); }
  function hide(e) {
    suspended = true;
    if (e.persisted) { sync(); return; }
    disposed = true; active = false; dropRenderer();
    if (io) io.disconnect(); if (ro) ro.disconnect(); observer.disconnect();
    document.removeEventListener('visibilitychange', sync);
    window.removeEventListener('resize', resized); window.removeEventListener('scroll', checkVisible);
    window.removeEventListener('pagehide', hide); window.removeEventListener('pageshow', show);
    if (reduce) reduce.removeEventListener('change', sync);
    state('data-vp-motion', 'off'); state('data-vp-ambient', 'off');
  }
  function show(e) { if (e.persisted) { suspended = false; dirtySize = true; if (!io) checkVisible(); else sync(); } }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { visible = es[0].isIntersecting; sync(); }) : null;
  var ro = 'ResizeObserver' in window ? new ResizeObserver(resized) : null;
  var observer = new MutationObserver(sync);
  observer.observe(root, { attributes: true, attributeFilter: ['class', 'data-vp'] });
  if (io) io.observe(sea); else window.addEventListener('scroll', checkVisible, { passive: true });
  if (ro) ro.observe(sea);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('resize', resized, { passive: true });
  window.addEventListener('pagehide', hide); window.addEventListener('pageshow', show);
  if (reduce) reduce.addEventListener('change', sync);
  if (!io) checkVisible(); else sync();
})();
