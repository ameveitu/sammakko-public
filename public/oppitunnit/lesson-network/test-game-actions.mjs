// Isolated semantic fixtures: no generator/resolver imports, builds or writes.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';
import { verifyGameActions } from './verify-game-actions.mjs';

const kcId = 'M-ALG-08';
const other = 'M-SCALE-02';
const url = `https://school.example/games/#journey/${kcId}`;
const wrongUrl = 'https://school.example/games/#journey/WRONG-KC';
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const unavailable = status => ({ status, url: null, classroomReady: false });
const routed = (status, destination = url, releaseReview = 'unverified') => ({
  status, url: destination, classroomReady: status === 'ready',
  requiresFreshDocument: true, target: '_blank', rel: 'noopener', releaseReview,
});
function config() {
  return { adapters: {
    lite: { routeKind: 'none', routeSyntaxState: 'unsupported_in_reviewed_build', baseUrl: null },
    sammakko: {
      routeKind: 'journey_hash', routeSyntaxState: 'source_verified', baseUrl: 'https://school.example/games/?engineering=1#old',
      runtimeAvailability: { state: 'verified_compiled_index', ids: [kcId] },
      endpointVerification: 'verified', deploymentScope: 'public', studentReachability: 'verified',
    },
  } };
}
function section(kind, metadata) {
  const controls = metadata.classroomReady ?
    `<a data-game-action="open" href="${escape(metadata.url)}" target="_blank" rel="noopener">Avaa ${kind}</a><button data-game-action="copy" data-copy-url="${escape(metadata.url)}">Kopioi ${kind}</button>` :
    `<button data-game-action="open" disabled>Avaa ${kind}</button><button data-game-action="copy" disabled>Kopioi ${kind}</button>${metadata.url ? `<a data-game-action="developer" href="${escape(metadata.url)}" target="_blank" rel="noopener">Kehittäjän testi · ei varmennettu oppilaslinkki</a>` : ''}`;
  return `<section data-game-kind="${kind}"><h3>${kind}</h3><p>${metadata.status}</p>${controls}</section>`;
}
function fixture(deployment = config(), sammakko = routed('ready'), lite = unavailable('route_unsupported')) {
  const recordLinks = { lite: structuredClone(lite), sammakko: structuredClone(sammakko) };
  return {
    kcId, config: deployment, canonicalIds: [kcId, other], liteIds: [kcId],
    recordLinks, manifestLinks: structuredClone(recordLinks),
    html: `<!doctype html><html><body><main data-kc="${kcId}">${section('lite', lite)}${section('sammakko', sammakko)}</main></body></html>`,
  };
}
const pass = input => assert.deepEqual(verifyGameActions(input), []);
function reject(input, expected) {
  const errors = verifyGameActions(input);
  assert.ok(errors.length, 'attack must yield errors');
  assert.ok(errors.every(error => typeof error === 'string' && error.startsWith(`${input.kcId}:`)), 'errors identify the KC');
  if (expected) assert.match(errors.join('\n'), expected);
}

test('source-verified public and classroom-network deployments, independent release review', () => {
  pass(fixture());
  const input = fixture();
  input.config.adapters.sammakko.deploymentScope = 'classroom_network';
  input.config.adapters.sammakko.releaseReview = 'not_performed';
  input.recordLinks.sammakko.releaseReview = input.manifestLinks.sammakko.releaseReview = 'not_performed';
  input.canonicalIds = new Set(input.canonicalIds);
  input.liteIds = new Set(input.liteIds);
  pass(input);
});

test('shipped unconfigured contracts stay unavailable', () => {
  const baseline = JSON.parse(fs.readFileSync(new URL('./reference/RUNTIME_LINKS.json', import.meta.url), 'utf8'));
  pass(fixture(baseline, unavailable('base_url_missing')));
});

for (const [label, change, status, destination] of [
  ['unknown page identity', () => {}, 'unknown_kc', null],
  ['unsupported route', a => { a.routeKind = 'none'; }, 'route_unsupported', null],
  ['unverified source syntax', a => { a.routeSyntaxState = 'unverified'; }, 'route_unsupported', null],
  ['missing base', a => { a.baseUrl = null; }, 'base_url_missing', null],
  ['malformed base', a => { a.baseUrl = 'not a URL'; }, 'invalid_base_url', null],
  ['file base', a => { a.baseUrl = 'file:///game/index.html'; }, 'invalid_base_url', null],
  ['javascript base', a => { a.baseUrl = 'javascript:alert(1)'; }, 'invalid_base_url', null],
  ['credential-bearing base', a => { a.baseUrl = 'https://user:pass@school.example/games/'; }, 'invalid_base_url', null],
  ['missing runtime index', a => { delete a.runtimeAvailability; }, 'runtime_index_missing', null],
  ['unverified runtime index', a => { a.runtimeAvailability.state = 'unverified'; }, 'runtime_index_missing', null],
  ['null runtime ids', a => { a.runtimeAvailability.ids = null; }, 'runtime_index_missing', null],
  ['catalogue membership without compiled membership', a => { a.runtimeAvailability.ids = [other]; }, 'kc_not_implemented', null],
  ['missing endpoint evidence', a => { delete a.endpointVerification; }, 'endpoint_unverified', url],
  ['unverified endpoint', a => { a.endpointVerification = 'unverified'; }, 'endpoint_unverified', url],
  ['unconfigured deployment', a => { a.deploymentScope = 'unconfigured'; }, 'student_reachability_unverified', url],
  ['missing student reachability', a => { delete a.studentReachability; }, 'student_reachability_unverified', url],
  ['local preview declared on public host', a => { a.deploymentScope = 'local_preview'; }, 'local_preview_only', url],
]) {
  test(`${label}: honest status passes; mutually consistent ready forgery fails`, () => {
    const deployment = config();
    change(deployment.adapters.sammakko);
    const metadata = destination ? routed(status, destination) : unavailable(status);
    const input = fixture(deployment, metadata, label === 'unknown page identity' ? unavailable('unknown_kc') : undefined);
    if (label === 'unknown page identity') input.canonicalIds = [other];
    if (status === 'unknown_kc') reject(input, /not canonical/);
    else pass(input);
    const forged = fixture(deployment);
    if (label === 'unknown page identity') forged.canonicalIds = [other];
    reject(forged, new RegExp(status));
  });
}

for (const base of [
  'http://localhost/games/', 'http://localhost./games/', 'http://dev.localhost/games/',
  'http://127.0.0.2/games/', 'http://127.1/games/', 'http://0.0.0.0/games/',
  'http://[::1]/games/', 'http://[::]/games/', 'http://[::ffff:127.0.0.1]/games/',
]) {
  test(`loopback is never classroom ready: ${base}`, () => {
    const deployment = config(); deployment.adapters.sammakko.baseUrl = base;
    const destination = new URL(base); destination.hash = `journey/${kcId}`;
    pass(fixture(deployment, routed('local_preview_only', destination.href)));
    reject(fixture(deployment, routed('ready', destination.href)), /local_preview_only/);
  });
}

for (const [base, expected] of [
  ['https://school.example/games', url],
  ['https://school.example/prefix/index.html?engineering=1#old', `https://school.example/prefix/index.html#journey/${kcId}`],
  ['https://school.example/a%20b/?profile=secret&engineering=1#old', `https://school.example/a%20b/#journey/${kcId}`],
]) {
  test(`exact normalized URL, preserved prefix/entry document: ${base}`, () => {
    const deployment = config(); deployment.adapters.sammakko.baseUrl = base;
    pass(fixture(deployment, routed('ready', expected)));
    reject(fixture(deployment, routed('ready', base)), /record.url/);
  });
}

test('Lite requires a verified bridge and selected compiled index, separately from subset membership', () => {
  const deployment = config();
  deployment.adapters.lite = structuredClone(deployment.adapters.sammakko);
  pass(fixture(deployment)); // Source syntax alone does not authorize Lite routing.
  reject(fixture(deployment, routed('ready'), routed('ready')), /lite: record.status.*route_unsupported/);
  deployment.adapters.lite.bridgeVerification = 'verified';
  pass(fixture(deployment, routed('ready'), routed('ready')));
  deployment.adapters.lite.runtimeAvailability.ids = [other];
  pass(fixture(deployment, routed('ready'), unavailable('kc_not_implemented')));
  reject(fixture(deployment, routed('ready'), routed('ready')), /lite: record.status.*kc_not_implemented/);
  delete deployment.adapters.lite.runtimeAvailability;
  pass(fixture(deployment, routed('ready'), unavailable('runtime_index_missing')));
  reject(fixture(deployment, routed('ready'), routed('ready')), /lite: record.status.*runtime_index_missing/);
  const outside = fixture(deployment, routed('ready'), unavailable('outside_current_lite_scope'));
  outside.liteIds = []; pass(outside);
});

test('fabricated agreeing record, manifest, HTML and output hashes cannot authorize WRONG-KC', () => {
  for (const deployment of [config(), { adapters: {} }]) {
    const input = fixture(deployment, routed('ready', wrongUrl));
    const outputHash = createHash('sha256').update(input.html).digest('hex');
    const record = { runtimeAvailability: input.recordLinks, outputHash };
    const manifest = { gameLinks: input.manifestLinks, outputHash };
    assert.deepEqual(record.runtimeAvailability, manifest.gameLinks);
    assert.equal(record.outputHash, manifest.outputHash);
    reject(input, /sammakko: (record.url|record.status)/);
  }
});

for (const action of ['open', 'copy']) {
  test(`correct metadata cannot conceal wrong-KC rendered ${action}`, () => {
    const input = fixture();
    const attribute = action === 'open' ? 'href' : 'data-copy-url';
    input.html = input.html.replace(`${attribute}="${url}"`, `${attribute}="${wrongUrl}"`);
    reject(input, new RegExp(`${action} action must`));
  });
  test(`correct unavailable metadata cannot conceal enabled ordinary ${action}`, () => {
    const deployment = config(); deployment.adapters.sammakko.endpointVerification = 'unverified';
    const input = fixture(deployment, routed('endpoint_unverified'));
    const replacement = action === 'open' ? `<a data-game-action="open" href="${url}" target="_blank" rel="noopener">Avaa</a>` : `<button data-game-action="copy" data-copy-url="${url}">Kopioi</button>`;
    input.html = input.html.replace(new RegExp(`<button data-game-action="${action}" disabled>[^<]*</button>(?=<a data-game-action="developer"|</section>|<button data-game-action="copy")`, 'g'), replacement);
    reject(input, new RegExp(`${action} action must be a disabled button`));
  });
}

for (const [label, mutate, diagnostic] of [
  ['wrong developer KC', h => h.replace(`data-game-action="developer" href="${url}"`, `data-game-action="developer" href="${wrongUrl}"`), /developer test requires/],
  ['developer relabelled as pupil link', h => h.replace('Kehittäjän testi · ei varmennettu oppilaslinkki', 'Avaa peli oppilaille'), /developer test must visibly/],
  ['missing developer warning', h => h.replace(' · ei varmennettu oppilaslinkki', ''), /developer test must visibly/],
  ['local preview rendered ready', h => h.replace('<p>endpoint_unverified</p>', '<p>ready</p>'), /rendered status/],
  ['aria-disabled active anchor', h => h.replace('<button data-game-action="open" disabled>Avaa sammakko</button>', `<a data-game-action="open" aria-disabled="true" href="${url}">Avaa</a>`), /must be a disabled button/],
  ['disabled=false is still disabled', h => h.replaceAll(' disabled>', ' disabled="false">'), null],
  ['unavailable copy has a URL despite disabled', h => h.replace('<button data-game-action="copy" disabled>Kopioi sammakko', `<button data-game-action="copy" disabled data-copy-url="${url}">Kopioi sammakko`), /must not carry/],
]) {
  test(label, () => {
    const deployment = config(); deployment.adapters.sammakko.endpointVerification = 'unverified';
    const input = fixture(deployment, routed('endpoint_unverified'));
    input.html = mutate(input.html);
    if (diagnostic) reject(input, diagnostic); else pass(input);
  });
}

for (const [label, mutate, diagnostic] of [
  ['unmarked extra action', h => h.replace('</section>', `<a href="${wrongUrl}">Avaa Sammakko</a></section>`), /unmarked link/],
  ['ordinary action renamed developer', h => h.replace('data-game-action="open" href=', 'data-game-action="developer" href='), /ordinary open/],
  ['duplicated section', h => h + section('sammakko', routed('ready')), /exactly one marked game section/],
  ['nested game sections', h => h.replace('<section data-game-kind="sammakko">', '<section data-game-kind="lite"><section data-game-kind="sammakko">') + '</section>', /exactly one game section/],
  ['marker on wrong element', h => h.replace('section data-game-kind="sammakko"', 'div data-game-kind="sammakko"'), /must mark a lite\/sammakko section/],
  ['unknown action', h => h.replace('data-game-action="open"', 'data-game-action="launch"'), /invalid game action/],
  ['comment decoy', h => `<!--${h}-->`, /exactly one marked game section/],
  ['script-string decoy', h => `<script type="application/json">${h}</script>`, /exactly one marked game section/],
  ['xmp raw-text decoy', h => `<xmp>${h}</xmp>`, /exactly one marked game section/],
  ['iframe raw-text decoy', h => `<iframe>${h}</iframe>`, /exactly one marked game section/],
  ['noembed raw-text decoy', h => `<noembed>${h}</noembed>`, /exactly one marked game section/],
  ['noframes raw-text decoy', h => `<noframes>${h}</noframes>`, /exactly one marked game section/],
  ['plaintext decoy', h => `<plaintext>${h}</plaintext>`, /exactly one marked game section/],
  ['template decoy', h => `<template>${h}</template>`, /hidden\/inert/],
  ['hidden ordinary actions', h => h.replace('data-game-action="open" href=', 'hidden data-game-action="open" href='), /visible and labelled/],
  ['same-document target', h => h.replace('target="_blank"', 'target="_self"'), /fresh _blank document/],
  ['missing noopener', h => h.replace('rel="noopener"', 'rel="opener"'), /fresh _blank document/],
  ['duplicate href attribute', h => h.replace(`href="${url}"`, `href="${url}" href="${wrongUrl}"`), /duplicate HTML attribute href/],
  ['inline override', h => h.replace('data-game-action="open" href=', `onclick="location.href='${wrongUrl}'" data-game-action="open" href=`), /inline event handler/],
  ['ancestor inline override', h => h.replace('<main data-kc=', `<main onclick="event.preventDefault();location.href='${wrongUrl}'" data-kc=`), /ancestor inline event handler/],
  ['copy inherits disabled fieldset', h => `<fieldset disabled>${h}</fieldset>`, /ready copy action is disabled/],
  ['copy submits wrong-KC form', h => `<form action="${wrongUrl}">${h}</form>`, /must not submit\/reset/],
  ['unmarked wrong-KC outside game section', h => `${h}<a href="${wrongUrl}">Avaa Sammakko</a>`, /outside a game section/],
  ['orphan copy outside game section', h => `${h}<button data-copy-url="${wrongUrl}">Kopioi Sammakko</button>`, /outside a game section/],
  ['base override', h => `<base href="https://wrong.example/">${h}`, /base element/],
]) {
  test(label, () => { const input = fixture(); input.html = mutate(input.html); reject(input, diagnostic); });
}

test('ordinary ready actions must not be disabled or empty', () => {
  const disabled = fixture(); disabled.html = disabled.html.replace('data-game-action="open" href=', 'disabled data-game-action="open" href=');
  reject(disabled, /ready open action is disabled/);
  const empty = fixture(); empty.html = empty.html.replace('Avaa sammakko</a>', '</a>');
  reject(empty, /visible and labelled/);
});

test('copy buttons in forms require type=button, including explicit form association', () => {
  const input = fixture();
  input.html = `<form id="send" action="${wrongUrl}"></form>` + input.html.replace('data-game-action="copy" data-copy-url=', 'form="send" data-game-action="copy" data-copy-url=');
  reject(input, /must not submit\/reset/);
  input.html = input.html.replace('form="send" data-game-action=', 'type="button" form="send" data-game-action=');
  pass(input);
  const wrapped = fixture(); wrapped.html = `<form>${wrapped.html.replace('data-game-action="copy" data-copy-url=', 'type="button" data-game-action="copy" data-copy-url=')}</form>`;
  pass(wrapped);
});

test('first legend exception to disabled fieldsets is respected', () => {
  const input = fixture(); input.html = `<fieldset disabled><legend>${input.html}</legend></fieldset>`;
  pass(input);
});

test('anchors do not inherit disabled fieldset state', () => {
  const input = fixture();
  input.html = input.html.replace(/(<a data-game-action="open"[^>]*>[^<]*<\/a>)/, '<fieldset disabled>$1</fieldset>');
  pass(input);
});

for (const closing of ['</xmp/>', '</xmp ignored>', '</XMP ignored=">">', '</xmp ignored=\'value\'>']) {
  test(`raw-text end tag cannot hide a later active WRONG-KC link: ${closing}`, () => {
    const input = fixture(); input.html += `<xmp>text${closing}<a href="${wrongUrl}">Wrong KC</a>`;
    reject(input, /outside a game section/);
  });
}

test('raw-text end-tag name requires a boundary', () => {
  const input = fixture(); input.html += `<xmp>text</xmpnotclosed><a href="${wrongUrl}">Still raw text</a>`;
  pass(input);
});

test('ready text cannot be combined with an honest local status to disguise readiness', () => {
  const deployment = config(); deployment.adapters.sammakko.deploymentScope = 'local_preview';
  const input = fixture(deployment, routed('local_preview_only'));
  input.html = input.html.replace('<p>local_preview_only</p>', '<p>ready local_preview_only</p>');
  reject(input, /rendered status must equal local_preview_only/);
});

test('escaped/numeric attributes, comments, nested sections and raw text do not confuse actual actions', () => {
  const input = fixture();
  input.html = input.html.replace('href="https:', 'href="https&#58;').replace('target="_blank"', "TARGET='_blank'");
  input.html += '<!-- <a href="#journey/WRONG-KC">fake</a> -->' +
    '<script>const s = \'<section data-game-kind="sammakko">\';</script>' +
    '<section><svg><circle cx="2" cy="2" r="1"/></svg><p>Unrelated technical fixture.</p></section>';
  pass(input);
});

test('record and manifest are each audited, even if the other is correct', () => {
  for (const field of ['recordLinks', 'manifestLinks']) {
    const input = fixture(); input[field].sammakko.url = wrongUrl;
    reject(input, new RegExp(`${field === 'recordLinks' ? 'record' : 'manifest'}.url`));
    delete input[field].sammakko;
    reject(input, /link metadata is missing/);
  }
});

test('fresh-document and release-review metadata are checked independently', () => {
  for (const field of ['requiresFreshDocument', 'target', 'rel', 'releaseReview']) {
    const input = fixture(); delete input.recordLinks.sammakko[field]; delete input.manifestLinks.sammakko[field];
    reject(input, new RegExp(`record.${field}`));
  }
});

test('validation is pure and deterministic; missing inputs fail as error arrays', () => {
  const input = fixture(), before = structuredClone(input);
  pass(input); pass(input); assert.deepEqual(input, before);
  reject({ ...input, html: null }, /HTML source is missing/);
  reject({ ...input, recordLinks: null, manifestLinks: null }, /metadata is missing/);
  reject({ ...input, config: null }, /route_unsupported/);
});
