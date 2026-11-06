/* Shared view assistance. Module-owned context presets never submit answers. */
(() => {
  const tolerance = 2;

  // Reveal a complete first block when it fits with its summary, otherwise its
  // beginning. A long explanation never forces a jump to its last line.
  function revealDelta(summary, content, viewport, firstControl = null) {
    const height = viewport.bottom - viewport.top;
    if (height <= 0) return 0;
    if (firstControl) {
      const union = {top: Math.min(content.top, firstControl.top), bottom: Math.max(content.bottom, firstControl.bottom)};
      // Include the immediately useful action only when the opening and action
      // fit together. Never chase a far control through a long explanation.
      if (union.bottom - Math.min(summary.top, union.top) <= height) content = union;
    }
    const start = Math.min(summary.top, content.top);
    const end = content.bottom - start <= height
      ? content.bottom : Math.min(content.bottom, content.top + Math.min(80, height / 3));
    if (content.top >= viewport.top - tolerance && end <= viewport.bottom + tolerance) return 0;
    if (end - start <= height) {
      if (start < viewport.top) return start - viewport.top;
      if (end > viewport.bottom) return end - viewport.bottom;
    }
    return content.top - viewport.top;
  }

  function visible(element) {
    if (!element?.isConnected || element.closest('[hidden],[inert]')) return false;
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS' && !parent.open) return false;
    }
    const style = getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
  }

  function scrollingElement(element) {
    const root = document.scrollingElement || document.documentElement;
    for (let parent = element.parentElement; parent && parent !== root; parent = parent.parentElement) {
      if (/(auto|scroll)/.test(getComputedStyle(parent).overflowY) && parent.scrollHeight > parent.clientHeight + tolerance) return parent;
    }
    return root;
  }

  function viewportFor(scroller) {
    const root = document.scrollingElement || document.documentElement;
    let top = 0, bottom = innerHeight;
    if (scroller !== root) {
      const rect = scroller.getBoundingClientRect();
      top = Math.max(top, rect.top + scroller.clientTop);
      bottom = Math.min(bottom, rect.top + scroller.clientTop + scroller.clientHeight);
    }
    // Only bars actually stuck to this visible upper edge may cover content.
    for (const bar of document.querySelectorAll('.site-header,[data-lesson-sticky]')) {
      if (!visible(bar) || !['sticky', 'fixed'].includes(getComputedStyle(bar).position)) continue;
      const rect = bar.getBoundingClientRect();
      if (rect.top <= top + tolerance && rect.bottom > top) top = rect.bottom;
    }
    return {top: top + 10, bottom: bottom - 10};
  }

  function scrollBy(scroller, delta) {
    if (Math.abs(delta) <= tolerance) return;
    // The bounded automatic correction is immediate, including reduced motion.
    // Explicit instant avoids inheriting a site's CSS smooth-scroll setting.
    scroller.scrollTo({top: scroller.scrollTop + delta, behavior: 'instant'});
  }

  function meaningfulRect(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.textContent.trim()) return null;
      const range = document.createRange();
      range.selectNodeContents(node);
      return [...range.getClientRects()].find(rect => rect.width && rect.height) ?? null;
    }
    if (node.nodeType !== Node.ELEMENT_NODE || !visible(node) || ['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT'].includes(node.tagName)) return null;
    if (node.tagName === 'DETAILS') return node.querySelector(':scope > summary')?.getBoundingClientRect() ?? null;
    if (node.matches('p,h1,h2,h3,h4,h5,h6,ul,ol,dl,pre,table,figure,svg,img,canvas,video,fieldset,button,input,select,textarea')) {
      const rect = node.getBoundingClientRect();
      if (rect.width && rect.height) return rect;
    }
    for (const child of node.childNodes) {
      const rect = meaningfulRect(child);
      if (rect) return rect;
    }
    return null;
  }

  function revealDisclosure(detail) {
    if (!detail.open || !visible(detail)) return;
    const summary = detail.querySelector(':scope > summary');
    if (!summary) return;
    let content = null, afterSummary = false;
    for (const child of detail.childNodes) {
      if (child === summary) { afterSummary = true; continue; }
      if (afterSummary && (content = meaningfulRect(child))) break;
    }
    if (!content) return;
    const scroller = scrollingElement(detail);
    const action = [...detail.querySelectorAll('button,input,select,textarea,a[href],summary,[role="button"],[role="slider"]')]
      .find(element => element !== summary && visible(element) && !element.matches(':disabled') && element.getAttribute('aria-disabled') !== 'true' && !element.closest('[aria-hidden="true"]'));
    scrollBy(scroller, revealDelta(summary.getBoundingClientRect(), content, viewportFor(scroller), action?.getBoundingClientRect()));
  }

  function showStage(step, {focus = false} = {}) {
    if (!visible(step)) return;
    const scroller = scrollingElement(step);
    const viewport = viewportFor(scroller), toolbar = document.querySelector('[data-teacher-flow]');
    // The toolbar may only become sticky as this explicit stage jump finishes.
    if (toolbar && visible(toolbar) && getComputedStyle(toolbar).position === 'sticky') {
      viewport.top = Math.max(viewport.top, (parseFloat(getComputedStyle(toolbar).top) || 0) + toolbar.getBoundingClientRect().height + 10);
    }
    scrollBy(scroller, step.getBoundingClientRect().top - viewport.top);
    if (focus) {
      const heading = [...step.querySelectorAll('h2,h3,h4,summary')].find(visible) || step;
      if (!heading.hasAttribute('tabindex')) heading.tabIndex = -1;
      heading.focus({preventScroll: true});
    }
  }

  window.SammakkoLessonFlow = Object.freeze({revealDelta, viewportFor, scrollingElement, showStage});

  const root = document.querySelector('body.audience #lesson-body') || document.querySelector('main');
  if (!root) return;
  const intent = new WeakMap();
  let epoch = 0;
  function remember(event) {
    if (event.defaultPrevented || (event.type === 'click' && event.button !== 0)) return;
    if (event.type === 'keydown' && (!['Enter', ' '].includes(event.key) || event.repeat)) return;
    const summary = event.target.closest?.('summary');
    const detail = summary?.parentElement;
    if (!detail || detail.tagName !== 'DETAILS' || !root.contains(detail)) return;
    if (detail.open) intent.delete(detail);
    else intent.set(detail, {epoch, time: performance.now()});
  }
  // Capture handles nested details and controls mounted later by lesson modules.
  root.addEventListener('click', remember, true);
  root.addEventListener('keydown', remember, true);
  root.addEventListener('toggle', event => {
    const detail = event.target;
    if (detail.tagName !== 'DETAILS') return;
    const requested = intent.get(detail);
    intent.delete(detail);
    if (!detail.open || !requested) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (requested.epoch !== epoch || performance.now() - requested.time > 2000) return;
      revealDisclosure(detail);
    }));
  }, true);
  document.addEventListener('lesson-stage-change', () => { epoch++; });
  document.addEventListener('lesson-control', event => { if (event.detail === 'reset') epoch++; });
})();

// A source-authored workbench can be borrowed by the current teaching step.
// Move the real DOM nodes: listeners, unfinished input and the module's own
// state stay attached. The module alone may prepare/restore a named preset.
(() => {
  const area = document.querySelector('#lesson-body');
  if (!area) return;
  const panels = [...area.querySelectorAll('details[data-lesson-context]')];
  if (!panels.length) return;
  const sources = new Map();
  for (const element of area.querySelectorAll('[data-lesson-context-source]')) {
    const key = element.dataset.lessonContextSource;
    if (!key || sources.has(key)) continue;
    const home = document.createComment('lesson context: ' + key);
    element.before(home);
    sources.set(key, {element, home, active: null});
  }
  let ready = !area.querySelector('[data-lesson-module]');

  function available(panel) {
    if (!panel.isConnected || panel.closest('[hidden],[inert]')) return false;
    for (let parent = panel.parentElement; parent && parent !== area; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS' && !parent.open) return false;
    }
    return true;
  }

  function notify(panel, action) {
    const detail = {action, key: panel.dataset.lessonContext, preset: panel.dataset.contextPreset || ''};
    // The loader catches module failures and reports them to this caller. A
    // failed preset is never presented as the requested configured example.
    document.dispatchEvent(new CustomEvent('lesson-context-change', {detail}));
    return !detail.error;
  }

  function position(panel) {
    const scroller = window.SammakkoLessonFlow?.scrollingElement(panel);
    return {scroller, top: panel.getBoundingClientRect().top};
  }
  function keepPosition(panel, before) {
    const delta = panel.getBoundingClientRect().top - before.top;
    if (before.scroller && Math.abs(delta) > 2) before.scroller.scrollTo({top: before.scroller.scrollTop + delta, behavior: 'instant'});
  }

  function close(panel, {focus = false} = {}) {
    const source = sources.get(panel.dataset.contextSource);
    if (source?.active === panel) {
      const before = position(panel);
      notify(panel, 'leave');
      if (source.element.tagName === 'DETAILS') source.element.open = false;
      source.element.querySelectorAll('details').forEach(detail => { detail.open = false; });
      source.home.after(source.element);
      source.active = null;
      delete panel.dataset.contextActive;
      if (available(panel)) keepPosition(panel, before);
    }
    panel.open = false;
    if (focus && available(panel)) panel.querySelector(':scope > summary')?.focus({preventScroll: true});
  }

  function open(panel) {
    if (!ready || !panel.open || !available(panel)) return;
    const source = sources.get(panel.dataset.contextSource), slot = panel.querySelector(':scope > [data-context-slot]');
    if (!source || !slot || source.element.contains(panel) || source.active === panel) return;
    if (source.active) close(source.active);
    const before = position(panel);
    if (!notify(panel, 'enter')) {
      panel.dataset.contextError = 'true';
      const fallback = panel.querySelector('[data-context-fallback]');
      if (fallback) fallback.hidden = false;
      panel.open = false;
      return;
    }
    if (source.element.tagName === 'DETAILS') source.element.open = false;
    source.element.querySelectorAll('details').forEach(detail => { detail.open = false; });
    slot.append(source.element);
    source.active = panel;
    panel.dataset.contextActive = 'true';
    delete panel.dataset.contextError;
    // Opening a source-authored model is deliberate. Answers and hints remain
    // closed. A context can select a model disclosure without firing its controls.
    const reveal = panel.dataset.contextReveal;
    if (reveal === 'model') {
      const model = source.element.matches('details[data-lesson-role="worked-example"]')
        ? source.element : source.element.querySelector('details[data-lesson-role="worked-example"]');
      if (model) model.open = true;
    }
    keepPosition(panel, before);
    document.dispatchEvent(new CustomEvent('lesson-context-opened', {detail: {panel}}));
  }

  function closeAll() {
    for (const source of sources.values()) if (source.active) close(source.active);
  }

  for (const panel of panels) {
    if (!sources.has(panel.dataset.contextSource)) continue;
    panel.dataset.contextReady = 'true';
    for (const fallback of panel.querySelectorAll(':scope > [data-context-fallback]')) fallback.hidden = true;
    for (const button of panel.querySelectorAll(':scope > [data-context-close]')) button.hidden = false;
  }
  area.addEventListener('toggle', event => {
    const panel = event.target;
    if (panel.matches?.('details[data-lesson-context]')) {
      if (panel.open) open(panel); else close(panel);
    } else if (panel.tagName === 'DETAILS' && !panel.open) {
      // An enclosing optional extension can be closed while its model is open.
      for (const source of sources.values()) if (source.active && panel.contains(source.active)) close(source.active);
    }
  }, true);
  area.addEventListener('click', event => {
    const button = event.target.closest?.('[data-context-close]');
    const panel = button?.closest('details[data-lesson-context]');
    if (!panel || !area.contains(panel)) return;
    event.preventDefault();
    close(panel, {focus: true});
  });
  area.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const panel = event.target.closest?.('details[data-lesson-context][open]');
    if (!panel) return;
    event.preventDefault();
    close(panel, {focus: true});
  });
  document.addEventListener('lesson-module-ready', () => {
    ready = true;
    for (const panel of panels) if (panel.open) open(panel);
  });
  document.addEventListener('lesson-stage-before-change', closeAll);
  document.addEventListener('lesson-before-reset', closeAll);
  document.addEventListener('lesson-control', event => { if (event.detail === 'reset') closeAll(); });
  addEventListener('pagehide', closeAll);
  window.SammakkoLessonContexts = Object.freeze({closeAll});
})();
