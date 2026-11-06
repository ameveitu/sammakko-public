/* Sammakko visual polish — Lite surroundings (VP04) and living painting (VP05). Decoration only.
   Paints lakeside plates in the empty side margins of the map, world choice and workshop
   hub. It never imports app code, reads learner data, touches #app, intercepts input,
   uses the app's random numbers or clocks, or plays sound. It reads the route (hash)
   and the rendered DOM only to decide whether to show itself. The adult page, flight,
   exercises and any unknown view get nothing. Slow CSS glints and swaying reeds are confined to the empty
   margin of wide idle map/world views and stop with calm/reduced motion, hidden pages or
   BFCache suspension. VP05: on wide screens with a hardware WebGL2 context, world/world.js
   paints the world's living painting (day 7-18 local time, dusk otherwise or in dark mode)
   behind the map and, dimmed, behind lessons; a correct answer
   (seen only as a new .feedback.ok / .reward in the DOM) plays a small moment there. Without
   WebGL2 lessons stay bare and the VP04 plates remain. Review mode: ?vp=off | static | on
   (default on), ?vpgl=any also allows software WebGL (tests), ?vptime=day|evening picks the
   painting; nothing is stored. */
(function () {
  'use strict';
  var root = document.documentElement;
  var mode = 'on', soft = false, when = '';
  try {
    var q = new URLSearchParams(location.search), m = q.get('vp');
    if (m === 'off' || m === 'static') mode = m;
    soft = q.get('vpgl') === 'any';
    when = q.get('vptime') || '';
  } catch (e) { /* default */ }
  root.setAttribute('data-vp-lite', mode);
  if (mode === 'off' || window.__sammakkoVpLite) return;
  window.__sammakkoVpLite = true;

  var here = document.currentScript && document.currentScript.src ? document.currentScript.src : location.href;
  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('decor.css', here).href;
  css.setAttribute('data-vp-lite', '');
  document.head.appendChild(css);

  var layer = document.createElement('div');
  layer.id = 'vp-decor';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = '<div class="vp-col"></div><div class="vp-side vp-left"></div><div class="vp-side vp-right"></div><div class="vp-glints"><div class="vp-glints-light"></div></div><div class="vp-reeds"></div>';
  document.body.appendChild(layer);

  var app = document.getElementById('app');
  var reduceQuery = '(prefers-reduced-motion: reduce)';
  var reduce = window.matchMedia ? window.matchMedia(reduceQuery) : null;
  var wide = window.matchMedia ? window.matchMedia('(min-width: 1000px)') : null;
  var dark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  /* Which surface is showing? Unknown means nothing. */
  function classify() {
    if (!app) return '';
    var h = location.hash;
    if (h === '#aikuiselle' || h.indexOf('#kc/') === 0 || h.indexOf('#paja/lento') === 0) return '';
    if (app.querySelector('.progress, .scene, .adult')) return ''; // a lesson or exercise is open
    if (app.querySelector('.wmap')) world = (app.querySelector('.wmap').className.match(/\b(ranta|saari|lab)\b/) || [])[1] || world;
    var home = h === '' || h === '#' || h === '#alueet'; // the app's own map and world-choice routes
    if (home && app.querySelector('.wmap')) return 'map';
    if (home && app.querySelector('.worlds')) return 'worlds';
    var paja = app.querySelector('.paja');
    if (paja && ['#paja', '#paja/paja', '#paja/ranta', '#paja/rata', '#paja/torni'].indexOf(h) !== -1) {
      if (paja.classList.contains('measuring')) return '';
      return h === '#paja/ranta' ? 'paja-shore' : 'paja';
    }
    return '';
  }

  /* A lesson (#kc/..., its task pictures included) is a world surface only while the living painting is live. */
  function lesson() {
    return !!app && location.hash.indexOf('#kc/') === 0 && !!app.querySelector('.stack') && !app.querySelector('.adult');
  }

  /* VP05 living painting, loaded lazily; any failure leaves the VP04 look. */
  var world = 'saari', gl = 'off', api = null, seen = typeof WeakSet === 'function' ? new WeakSet() : null, streak = 0, rewarded = '';
  var saver = navigator.connection && navigator.connection.saveData;
  function glWanted(kind) {
    return mode !== 'off' && !saver && !!seen && !!wide && window.innerWidth >= 1000 && (kind === 'map' || kind === 'worlds' || kind === 'lesson');
  }
  function glStart() {
    gl = 'loading';
    import(new URL('world/world.js', here).href).then(function (w) {
      return w.start({
        host: layer, base: new URL('world/', here).href, soft: soft,
        onReady: update,
        onLost: function () { if (api) api.destroy(); api = null; gl = 'failed'; update(); },
      });
    }).then(function (a) {
      if (disposed || !a) { if (a) a.destroy(); gl = 'failed'; } else { api = a; gl = 'live'; }
      update();
    }, function () { gl = 'failed'; update(); });
  }
  /* Correct answers and rewards are read from the rendered lesson only; a mistake just resets the streak. */
  var answered = false;
  function moments(kind, live) {
    if (!seen || !app) return;
    if (kind !== 'lesson') { streak = 0; rewarded = ''; answered = false; return; }
    var ok = app.querySelector('.feedback.ok'), bad = app.querySelector('.feedback.bad'), rw = app.querySelector('.reward');
    if (bad && !seen.has(bad)) { seen.add(bad); streak = 0; }
    var hit = '';
    if (ok && !seen.has(ok)) { seen.add(ok); streak++; answered = true; hit = 'correct'; }
    if (rw && rewarded !== location.hash) { rewarded = location.hash; if (answered) hit = 'reward'; }
    if (!hit || !live) return;
    layer.setAttribute('data-world-moment', hit);
    layer.setAttribute('data-world-count', String((+layer.getAttribute('data-world-count') || 0) + 1));
    if (api) api.moment(hit, streak);
  }

  var pending = 0, suspended = false, disposed = false;
  var preferenceTimer = 0, lastWide = false, lastReduced = false;
  function motionPreference() { return !!reduce && window.matchMedia(reduceQuery).matches; }
  function watchPreferences(active) {
    if (active && !preferenceTimer) {
      // A visible WebKit page can apply CSS media changes without notifying an
      // existing MediaQueryList. Sample only while a surface can show decoration.
      preferenceTimer = setInterval(function () {
        if ((window.innerWidth >= 1000) !== lastWide || motionPreference() !== lastReduced) update();
      }, 300);
    } else if (!active && preferenceTimer) {
      clearInterval(preferenceTimer);
      preferenceTimer = 0;
    }
  }
  function update() {
    if (pending) cancelAnimationFrame(pending);
    pending = 0;
    if (disposed) return;
    var surface = classify(), kind = surface || (lesson() ? 'lesson' : '');
    if (gl === 'off' && glWanted(kind)) glStart();
    var eligible = gl === 'live' && glWanted(kind);
    var reduced = motionPreference();
    lastWide = window.innerWidth >= 1000;
    lastReduced = reduced;
    watchPreferences(!!kind && !document.hidden && !suspended);
    if (api) {
      var calm = root.classList.contains('calm-chars'), night = !!(dark && dark.matches) && root.getAttribute('data-theme') !== 'light';
      var hour = new Date().getHours(); // day painting 7-18 local time, dusk otherwise and in dark mode
      api.set({
        visible: eligible && !document.hidden && !suspended, surface: kind, world: world,
        phase: when === 'day' || when === 'evening' ? when : !night && hour >= 7 && hour < 18 ? 'day' : 'evening',
        animate: mode === 'on' && !reduced && !calm, chars: !calm, dark: night,
      });
    }
    // Keep the previous decoration policy until the requested painting has drawn its first frame.
    var live = eligible && api && api.ready;
    if (kind === 'lesson' && live) surface = 'lesson';
    if (live) { if (root.getAttribute('data-vp-world') !== world) root.setAttribute('data-vp-world', world); }
    else root.removeAttribute('data-vp-world');
    moments(kind, live);
    if (surface) {
      if (root.getAttribute('data-vp-surface') !== surface) root.setAttribute('data-vp-surface', surface);
    } else root.removeAttribute('data-vp-surface');
    var motion = mode === 'on' && (surface === 'map' || surface === 'worlds') &&
      !!wide && window.innerWidth >= 1000 && !reduced &&
      !root.classList.contains('calm-chars') && !document.hidden && !suspended;
    if (motion) {
      if (!root.hasAttribute('data-vp-motion')) root.setAttribute('data-vp-motion', '');
    } else root.removeAttribute('data-vp-motion');
  }
  function soon() { if (!pending && !suspended && !disposed) pending = requestAnimationFrame(update); }

  var appObserver = app ? new MutationObserver(soon) : null;
  if (appObserver) appObserver.observe(app, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  var calmObserver = new MutationObserver(update);
  calmObserver.observe(root, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('hashchange', update);
  window.addEventListener('resize', update);
  document.addEventListener('visibilitychange', update);
  if (reduce && reduce.addEventListener) reduce.addEventListener('change', update);
  if (wide && wide.addEventListener) wide.addEventListener('change', update);

  function onPageShow() { suspended = false; update(); }
  function onPageHide(e) {
    suspended = true;
    update(); // stop synchronously; a hidden page may no longer deliver animation frames
    if (e.persisted) return; // BFCache keeps one suspended layer and its listeners
    disposed = true;
    if (api) { api.destroy(); api = null; }
    if (appObserver) appObserver.disconnect();
    calmObserver.disconnect();
    window.removeEventListener('hashchange', update);
    window.removeEventListener('resize', update);
    document.removeEventListener('visibilitychange', update);
    if (reduce && reduce.removeEventListener) reduce.removeEventListener('change', update);
    if (wide && wide.removeEventListener) wide.removeEventListener('change', update);
    window.removeEventListener('pageshow', onPageShow);
    window.removeEventListener('pagehide', onPageHide);
  }
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('pageshow', onPageShow);
  update();
})();

