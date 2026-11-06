// Independent static audit for Phase 1.1 section 5. Do not import the resolver
// or trust agreement between derived records/manifests as evidence of readiness.
const kinds = ['lite', 'sammakko'];
const statusLabels = {
  "same_origin_package": "Harjoittele samaa aihetta Sammakko Litessä. Peli avautuu uuteen välilehteen.",
  "ready": "Peli on käytettävissä tässä osoitteessa.",
  "outside_current_lite_scope": "Tämä aihe ei kuulu vielä Sammakko Liteen.",
  "route_unsupported": "Peliyhteyttä ei ole käytössä tässä versiossa.",
  "base_url_missing": "Tämän pelin osoitetta ei ole vielä määritetty.",
  "invalid_base_url": "Pelin osoite ei ole kelvollinen.",
  "runtime_index_missing": "Pelin aihevalikoimaa ei ole voitu varmistaa.",
  "kc_not_implemented": "Tätä aihetta ei ole mukana pelin tässä versiossa.",
  "local_preview_only": "Pelilinkki on käytettävissä vain paikallisessa esikatselussa.",
  "endpoint_unverified": "Pelin verkko-osoitetta ei ole vielä varmennettu.",
  "student_reachability_unverified": "Pelin saatavuutta oppilaille ei ole vielä varmennettu.",
  "unknown_kc": "Aihetunnusta ei tunnistettu."
};
const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const contains = (ids, id) => ids instanceof Set ? ids.has(id) : Array.isArray(ids) && ids.includes(id);

function expectedGame(kcId, kind, config, canonicalIds, liteIds) {
  const unavailable = status => ({ status, url: null, classroomReady: false });
  if (!contains(canonicalIds, kcId)) return unavailable('unknown_kc');
  if (kind === 'lite' && !contains(liteIds, kcId)) return unavailable('outside_current_lite_scope');
  const adapter = config?.adapters?.[kind];
  if (!['journey_hash', ...(kind === 'lite' ? ['kc_hash'] : [])].includes(adapter?.routeKind) ||
      !['source_verified', 'source_verified_in_supplied_baseline'].includes(adapter.routeSyntaxState) ||
      (kind === 'lite' && adapter.bridgeVerification !== 'verified')) return unavailable('route_unsupported');
  if (!adapter.baseUrl) return unavailable('base_url_missing');
  const packaged = adapter.deploymentScope === 'same_origin_package';
  if (packaged && (kind !== 'lite' || adapter.routeKind !== 'kc_hash' || adapter.baseUrl !== '/lite/')) return unavailable('invalid_base_url');
  let destination;
  try { destination = new URL(adapter.baseUrl, packaged ? 'https://package.invalid' : undefined); } catch { return unavailable('invalid_base_url'); }
  if (!['https:', 'http:'].includes(destination.protocol) || destination.username || destination.password) return unavailable('invalid_base_url');
  const availability = adapter.runtimeAvailability;
  if (availability?.state !== 'verified_compiled_index' || !Array.isArray(availability.ids)) return unavailable('runtime_index_missing');
  if (!availability.ids.includes(kcId)) return unavailable('kc_not_implemented');

  // Only this source-backed route is supported. Strip stale engineering/profile
  // state and preserve deployment prefixes and explicit entry-document paths.
  destination.search = '';
  destination.hash = '';
  if (!destination.pathname.endsWith('/') && !/\.[a-z0-9]+$/i.test(destination.pathname)) destination.pathname += '/';
  destination.hash = `${adapter.routeKind === 'kc_hash' ? 'kc' : 'journey'}/${encodeURIComponent(kcId)}`;
  if (packaged) return {
    status: 'same_origin_package', url: destination.pathname + destination.hash, classroomReady: false, packageReady: true,
    requiresFreshDocument: true, target: '_blank', rel: 'noopener', releaseReview: adapter.releaseReview ?? 'unverified',
  };
  const host = destination.hostname.toLowerCase().replace(/\.$/, '');
  const local = host === 'localhost' || host.endsWith('.localhost') || host.startsWith('127.') ||
    ['[::1]', '[::]', '0.0.0.0'].includes(host) || host.startsWith('[::ffff:7f');
  let status;
  if (local || adapter.deploymentScope === 'local_preview') status = 'local_preview_only';
  else if (adapter.endpointVerification !== 'verified') status = 'endpoint_unverified';
  else if (!['public', 'classroom_network'].includes(adapter.deploymentScope) || adapter.studentReachability !== 'verified') status = 'student_reachability_unverified';
  else status = 'ready';
  return {
    status, url: destination.href, classroomReady: status === 'ready',
    requiresFreshDocument: true, target: '_blank', rel: 'noopener',
    releaseReview: adapter.releaseReview ?? 'unverified',
  };
}

function decode(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (whole, entity) => {
    if (entity[0] !== '#') return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' }[entity.toLowerCase()];
    const number = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return number > 0 && number <= 0x10ffff && !(number >= 0xd800 && number <= 0xdfff) ? String.fromCodePoint(number) : '\ufffd';
  });
}

// Tokenize the generated static shell, never searching source substrings for
// actions. Comments and raw script/style/textarea text cannot stand in for DOM.
function parse(source, fail) {
  const root = { tag: '#document', attrs: {}, children: [], parent: null };
  const stack = [root], elements = [];
  const tokens = /<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][^>"']*(?:(?:"[^"]*"|'[^']*')[^>"']*)*>|[^<]+|</g;
  const voids = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
  let match;
  while ((match = tokens.exec(source))) {
    const token = match[0];
    if (token.startsWith('<!')) continue;
    if (token.startsWith('</')) {
      const tag = token.match(/^<\/([\w:-]+)/)?.[1].toLowerCase();
      const index = stack.findLastIndex(node => node.tag === tag);
      if (index > 0) stack.length = index;
    } else if (/^<[A-Za-z]/.test(token)) {
      const tag = token.match(/^<([\w:-]+)/)[1].toLowerCase();
      const attrs = Object.create(null);
      const attributes = token.slice(tag.length + 1).replace(/\/?\s*>$/, '');
      for (const attr of attributes.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
        const key = attr[1].toLowerCase();
        if (owns(attrs, key)) fail(`duplicate HTML attribute ${key}`);
        else attrs[key] = decode(attr[2] ?? attr[3] ?? attr[4] ?? '');
      }
      const node = { tag, attrs, children: [], parent: stack.at(-1) };
      node.parent.children.push(node);
      elements.push(node);
      if (tag === 'plaintext') {
        node.children.push(source.slice(tokens.lastIndex));
        tokens.lastIndex = source.length;
      } else if (['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes'].includes(tag)) {
        // HTML recognizes raw-text end tags with a slash or ignored attributes
        // too; stopping only at </tag> could swallow later active game links.
        const close = new RegExp(`</${tag}(?=[\\s/>])[^>"']*(?:(?:"[^"]*"|'[^']*')[^>"']*)*>`, 'ig');
        close.lastIndex = tokens.lastIndex;
        const end = close.exec(source);
        node.children.push(source.slice(tokens.lastIndex, end?.index ?? source.length));
        tokens.lastIndex = end ? close.lastIndex : source.length;
      } else if (!voids.has(tag) && !(/\/\s*>$/.test(token) && (tag === 'svg' || stack.some(node => node.tag === 'svg')))) stack.push(node);
    } else stack.at(-1).children.push(decode(token));
  }
  return elements;
}

function within(node, ancestor) {
  for (let current = node; current; current = current.parent) if (current === ancestor) return true;
  return false;
}
function hidden(node) {
  for (let current = node; current; current = current.parent) {
    if (['template', 'noscript', 'script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes', 'plaintext', 'svg', 'math'].includes(current.tag) ||
        owns(current.attrs, 'hidden') || owns(current.attrs, 'inert') ||
        /(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*hidden)\s*(?:!important)?\s*(?:;|$)/i.test(current.attrs.style ?? '')) return true;
  }
  return false;
}
function visibleText(node) {
  if (hidden(node)) return '';
  return node.children.map(child => typeof child === 'string' ? child : visibleText(child)).join(' ').replace(/\s+/g, ' ').trim();
}
function disabled(node) {
  if (owns(node.attrs, 'disabled') || node.attrs['aria-disabled'] === 'true') return true;
  if (node.tag !== 'button') return false;
  // A disabled fieldset still permits controls in its first legend.
  for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
    if (ancestor.tag !== 'fieldset' || !owns(ancestor.attrs, 'disabled')) continue;
    const legend = ancestor.children.find(child => typeof child !== 'string' && child.tag === 'legend');
    if (!legend || !within(node, legend)) return true;
  }
  return false;
}
function formAssociated(node, elements) {
  if (owns(node.attrs, 'form')) return elements.some(element => element.tag === 'form' && element.attrs.id === node.attrs.form);
  for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) if (ancestor.tag === 'form') return true;
  return false;
}

/**
 * Validate selected deployment configuration against both derived link maps and
 * actual static actions. canonicalIds/liteIds accept arrays or Sets. recordLinks
 * is record.runtimeAvailability; manifestLinks is manifest.gameLinks; html is
 * the complete page source. Returns KC-specific error strings; performs no I/O.
 * This verifies declared configuration, not the truth of live endpoint evidence.
 */
export function verifyGameActions({ kcId, config, canonicalIds, liteIds, recordLinks, manifestLinks, html }) {
  const errors = [];
  const fail = message => errors.push(`${kcId}: game actions: ${message}`);
  if (!contains(canonicalIds, kcId)) fail('page KC is not canonical');
  if (typeof html !== 'string') { fail('HTML source is missing'); return errors; }
  const elements = parse(html, fail);
  const sections = elements.filter(node => owns(node.attrs, 'data-game-kind'));
  for (const section of sections) {
    if (section.tag !== 'section' || !kinds.includes(section.attrs['data-game-kind'])) fail('data-game-kind must mark a lite/sammakko section');
  }
  for (const node of elements.filter(node => owns(node.attrs, 'data-game-action'))) {
    const owners = sections.filter(section => within(node, section));
    if (owners.length !== 1) fail('marked action must belong to exactly one game section');
    if (!['a', 'button'].includes(node.tag) || !['open', 'copy', 'developer'].includes(node.attrs['data-game-action'])) fail('invalid game action marker or element');
    for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
      if (Object.keys(ancestor.attrs).some(key => /^on/i.test(key))) fail('ancestor inline event handler overrides game action semantics');
    }
  }
  // Audit extra route/copy controls as well, so a valid marked section cannot
  // serve as a decoy for a visible unmarked WRONG-KC action elsewhere.
  for (const node of elements) {
    if (hidden(node) || sections.some(section => within(node, section))) continue;
    if (owns(node.attrs, 'data-copy-url') || (node.tag === 'a' && /#(?:journey|kc)\//i.test(node.attrs.href ?? ''))) fail('unmarked game route/copy control outside a game section');
  }
  // The static network contract forbids <base> URL/target overrides.
  if (elements.some(node => node.tag === 'base')) fail('base element overrides the static route contract');
  for (const kind of kinds) {
    const expected = expectedGame(kcId, kind, config, canonicalIds, liteIds);
    const report = message => fail(`${kind}: ${message}`);
    for (const [label, links] of [['record', recordLinks], ['manifest', manifestLinks]]) {
      const actual = links?.[kind];
      if (!actual || typeof actual !== 'object' || Array.isArray(actual)) { report(`${label} link metadata is missing`); continue; }
      for (const [key, value] of Object.entries(expected)) {
        if (actual[key] !== value) report(`${label}.${key} must equal ${JSON.stringify(value)} (derived from configuration)`);
      }
    }
    const matches = sections.filter(node => node.tag === 'section' && node.attrs['data-game-kind'] === kind);
    if (matches.length !== 1) { report('expected exactly one marked game section'); continue; }
    const section = matches[0];
    if (hidden(section)) report('game section is hidden/inert');
    const status = section.children.find(child => typeof child !== 'string' && child.tag === 'p');
    if (!status || !(visibleText(status) === expected.status || (status.attrs['data-runtime-status'] === expected.status && visibleText(status) === statusLabels[expected.status]))) report(`rendered status must equal ${expected.status}`);
    const controls = elements.filter(node => within(node, section) && ['a', 'button'].includes(node.tag));
    if (controls.some(node => !owns(node.attrs, 'data-game-action'))) report('unmarked link/button inside game section');
    for (const action of ['open', 'copy']) {
      const controlsForAction = controls.filter(node => node.attrs['data-game-action'] === action);
      if (controlsForAction.length !== 1) { report(`expected exactly one ordinary ${action} action`); continue; }
      const control = controlsForAction[0];
      if (hidden(control) || !visibleText(control)) report(`${action} action must be visible and labelled`);
      if (!expected.classroomReady && !expected.packageReady) {
        if (control.tag !== 'button' || !owns(control.attrs, 'disabled')) report(`${action} action must be a disabled button when ${expected.status}`);
        if (owns(control.attrs, 'href') || owns(control.attrs, 'data-copy-url') || owns(control.attrs, 'onclick') || owns(control.attrs, 'formaction')) report(`unavailable ${action} action must not carry an active URL/handler`);
      } else {
        if (disabled(control)) report(`ready ${action} action is disabled`);
        if (action === 'open') {
          if (control.tag !== 'a' || control.attrs.href !== expected.url) report(`open action must link exactly to ${expected.url}`);
          verifyFreshDocument(control, report);
        } else {
          if (control.tag !== 'button' || control.attrs['data-copy-url'] !== expected.url) report(`copy action must copy exactly ${expected.url}`);
          if (formAssociated(control, elements) && control.attrs.type?.toLowerCase() !== 'button') report('copy action must not submit/reset an associated form');
        }
      }
    }
    const developer = controls.filter(node => node.attrs['data-game-action'] === 'developer');
    if (developer.length > 1) report('duplicate developer test actions');
    for (const control of developer) {
      if (!expected.url || control.tag !== 'a' || control.attrs.href !== expected.url) report('developer test requires the exact source-supported URL for this KC');
      if (hidden(control) || !/(?:kehittäj|developer)/i.test(visibleText(control)) ||
          !/(?:ei varmennettu|unverified|paikallinen|local preview)/i.test(visibleText(control))) report('developer test must visibly identify its unverified/local purpose');
      if (owns(control.attrs, 'data-copy-url')) report('developer link cannot act as an ordinary copy action');
      verifyFreshDocument(control, report);
    }
    for (const node of elements.filter(node => within(node, section))) {
      if (Object.keys(node.attrs).some(key => /^on/i.test(key))) report('inline event handler overrides game action semantics');
      if (owns(node.attrs, 'data-copy-url') && node.attrs['data-game-action'] !== 'copy') report('copy URL on an unmarked/non-copy element');
    }
  }
  return errors;
}

function verifyFreshDocument(control, report) {
  if (control.attrs.target !== '_blank' || !(control.attrs.rel ?? '').split(/\s+/).includes('noopener')) report('launch must use a fresh _blank document with noopener');
}

