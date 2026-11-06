// @ts-nocheck: node-only test (the project has no @types/node)
// Regressions for the Lite (4) review: V4-01 written-addition claim, V4-02 status partition,
// V4-03 KC route and runtime availability manifest, and the invariants the review asks to keep.
//   UPDATE_RUNTIME=1 npx vitest run tests/v4.test.ts   rewrite public/lite-runtime.json
import { beforeEach, describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { CONTENT_REV, NODES, PRODUCE, revOf } from '../src/content/index';
import { AUDIT_REV, REVIEW2_REV } from '../src/content/audit-rev';
import { chaptersFor, WORLDS } from '../src/content/world';
import { family } from '../src/content/families';
import { nodeState, type Attempt } from '../src/engine/evidence';
import { allOfDescendants, GRAPH_SHA, KCS, MANIFEST, ORDER } from '../src/engine/graph';
import { store } from '../src/engine/store';
import { STATUS_ORDER, statusCounts, statusOf, statusSummary } from '../src/ui/status';
import { isLocalPreview, KC_ROUTE, kcHash, kcLink, parseKcHash } from '../src/route';
import canonical from '../public/canonical-ids.json';

const RUNTIME = new URL('../public/lite-runtime.json', import.meta.url);
const at = (o: Partial<Attempt> & { k: number }): Attempt =>
  ({ node: 'X', phase: 'independent', tag: 'a', ok: true, at: o.k * 1000, ...o });

describe('V4-01 written addition claims what is observed', () => {
  const W = NODES['M-WRADD'];
  it('the reward and the family limit claim computed sums and a recognised carry step, not the written method', () => {
    expect(W.reward).not.toMatch(/allekkain|muistinumeroineen/i);
    expect(W.reward).toMatch(/summat itse/);
    expect(W.produceWhat).toBe('summan laskemista itse');
    const limit = family('M-WRADD', 'column').limit ?? '';
    expect(limit).toMatch(/ei käytetty menetelmä/);
  });
  it('the reviewed route (ones, where, column, transfer) still checks: correct sums are not rejected', () => {
    const rule = { tags: PRODUCE['M-WRADD'], revs: [REVIEW2_REV] };
    const route = [at({ k: 1, tag: 'ones' }), at({ k: 2, tag: 'where' }), at({ k: 3, tag: 'column' }), at({ k: 4, phase: 'transfer', tag: 'transfer' })]
      .map((a) => ({ ...a, node: 'M-WRADD', rev: REVIEW2_REV }));
    const st = nodeState(route, rule);
    expect(st.checked).toBe(true);
    expect(st.produced).toBe(true); // "produced" = a sum the learner computed, per produceWhat
  });
  it('recognition-only answers (ones, where, check) never satisfy the sum claim', () => {
    const rule = { tags: PRODUCE['M-WRADD'], revs: [REVIEW2_REV] };
    const rec = [at({ k: 1, tag: 'ones' }), at({ k: 2, tag: 'where' }), at({ k: 3, tag: 'check' }), at({ k: 4, phase: 'transfer', tag: 'transfer', ok: false })]
      .map((a) => ({ ...a, node: 'M-WRADD', rev: REVIEW2_REV }));
    expect(nodeState(rec, rule).produced).toBe(false);
  });
  it('every production lesson states what its production answer shows', () => {
    for (const id of Object.keys(PRODUCE)) expect(NODES[id].produceWhat, id).toBeTruthy();
  });
});

describe('V4-02 every lesson has exactly one status', () => {
  beforeEach(() => store.reset());
  const streak = (node: string, rev: string, tags = ['a', 'b', 'a'], k0 = 1) => [
    ...tags.map((tag, i) => ({ node, tag, rev, phase: 'independent', ok: true, at: (k0 + i) * 1000 })),
    { node, tag: 'transfer', rev, phase: 'transfer', ok: true, at: (k0 + tags.length) * 1000 },
  ];
  it('review fixture: one legacy recognition-only check, its inferred ancestors, the rest unchecked = 181', () => {
    store.load({ attempts: streak('M79-EXPR-FORM', AUDIT_REV, ['translate', 'parts', 'translate']) });
    const c = statusCounts(ORDER);
    expect(c.recognised).toBe(1);
    expect(Object.values(c).reduce((a, b) => a + b, 0)).toBe(181);
    expect(statusSummary(ORDER)).toMatch(/^181 aihetta: .*1 tarkistettu tunnistamalla/);
    expect(statusOf('M79-EXPR-FORM').text).toMatch(/lausekkeen rakentamista ei vielä havaittu/);
  });
  it('a fixture with all eight statuses counts each lesson once, in the stated priority', () => {
    const H = 3600e3;
    const checkedId = 'M-WRSUB', retainedId = 'M-DEC-03';
    const used = new Set(['M79-EXPR-FORM', checkedId, retainedId]);
    const inferredSet = new Set([...used].flatMap((id) => ORDER.filter((a) => allOfDescendants(a).includes(id))));
    const free = ORDER.filter((id) => !used.has(id) && !inferredSet.has(id) && !allOfDescendants(id).some((d) => used.has(d)));
    const [helpedId, priorId, deferredId] = free.filter((id) => NODES[id].validRevs).slice(0, 3);
    const attempts = [
      ...streak('M79-EXPR-FORM', AUDIT_REV, ['translate', 'parts', 'translate']),
      ...streak(checkedId, revOf(checkedId)),
      ...streak(retainedId, revOf(retainedId)),
      { node: retainedId, tag: 'a', rev: revOf(retainedId), phase: 'retrieval', ok: true, at: 30 * H },
      { node: helpedId, tag: 'a', rev: revOf(helpedId), phase: 'guided', ok: true, at: 1000 },
      { node: helpedId, tag: 'a', rev: revOf(helpedId), phase: 'guided', ok: true, at: 2000 },
      ...streak(priorId, 'old-rev-not-valid'),
    ];
    store.load({ attempts, events: [{ type: 'defer', node: deferredId, at: 500 }] });
    const keys = Object.fromEntries(ORDER.map((id) => [id, statusOf(id).key]));
    expect(keys['M79-EXPR-FORM']).toBe('recognised');
    expect(keys[checkedId]).toBe('checked');
    expect(keys[retainedId]).toBe('retained');
    expect(keys[helpedId]).toBe('helped');
    expect(keys[priorId]).toBe('prior');
    expect(keys[deferredId]).toBe('deferred');
    expect(Object.values(keys)).toContain('inferred');
    expect(Object.values(keys)).toContain('unchecked');
    const c = statusCounts(ORDER);
    for (const s of STATUS_ORDER) expect(c[s.key], s.key).toBeGreaterThan(0);
    expect(Object.values(c).reduce((a, b) => a + b, 0)).toBe(ORDER.length);
    // The summary names every group and its numbers add up to the total.
    const sum = statusSummary(ORDER);
    const nums = [...sum.slice(sum.indexOf(':')).matchAll(/(\d+) /g)].map((m) => +m[1]);
    expect(nums.reduce((a, b) => a + b, 0)).toBe(ORDER.length);
    for (const s of STATUS_ORDER) expect(sum).toContain(s.label);
    // An ancestor inferred from several checked lessons is still one lesson.
    expect(ORDER.filter((id) => keys[id] === 'inferred').length).toBe(c.inferred);
  });
  it('a later real construction upgrades the legacy check without losing its history', () => {
    store.load({ attempts: [...streak('M79-EXPR-FORM', AUDIT_REV, ['translate', 'parts', 'translate']),
      { node: 'M79-EXPR-FORM', tag: 'build', rev: REVIEW2_REV, phase: 'practice', ok: true, at: 9000 }] });
    expect(statusOf('M79-EXPR-FORM').key).toBe('checked');
    expect(store.state('M79-EXPR-FORM').checkedAt).toBe(4000);
    expect(store.historyOf('M79-EXPR-FORM').length).toBe(5);
  });
});

describe('V4-03 KC route', () => {
  it('parses the documented form and nothing else', () => {
    expect(parseKcHash('#kc/M-TH-08')).toEqual({ kind: 'kc', id: 'M-TH-08' });
    expect(parseKcHash('#kc/M79-EQ1-FORM')).toEqual({ kind: 'kc', id: 'M79-EQ1-FORM' });
    expect(parseKcHash(kcHash('PHY79-SPEED-REARR'))).toEqual({ kind: 'kc', id: 'PHY79-SPEED-REARR' });
    expect(parseKcHash('#kc/%E0%A4%A')).toEqual({ kind: 'malformed', raw: '%E0%A4%A' });
    expect(parseKcHash('#kc/<img src=x>')?.kind).toBe('malformed');
    expect(parseKcHash('#kc/')?.kind).toBe('malformed');
    expect(parseKcHash('#kc/m-th-08')?.kind).toBe('malformed'); // ids are case-sensitive; no silent guess
    for (const other of ['', '#', '#aikuiselle', '#alueet', '#paja', '#paja/ranta', '#journey/M-TH-08']) expect(parseKcHash(other)).toBeNull();
  });
  it('builds links on the same document path, without any query', () => {
    expect(kcLink('M-TH-08', { origin: 'https://example.test', pathname: '/lite/' })).toBe('https://example.test/lite/#kc/M-TH-08');
    expect(kcHash('M-TH-08')).toBe(KC_ROUTE.template.replace('{encodedCanonicalKCId}', 'M-TH-08'));
  });
  it('labels local previews as such', () => {
    for (const hostname of ['localhost', '127.0.0.1', '[::1]', 'app.localhost']) expect(isLocalPreview({ protocol: 'http:', hostname }), hostname).toBe(true);
    expect(isLocalPreview({ protocol: 'file:', hostname: '' })).toBe(true);
    expect(isLocalPreview({ protocol: 'https:', hostname: 'koulu.example.fi' })).toBe(false);
  });
  it('every Lite KC id fits the route and belongs to an area', () => {
    const inWorld = new Set(WORLDS.flatMap((W) => chaptersFor(W.id).flatMap((c) => c.nodes)));
    for (const id of ORDER) {
      expect(parseKcHash(kcHash(id)), id).toEqual({ kind: 'kc', id });
      expect(inWorld.has(id), id).toBe(true);
    }
  });
  it('the canonical id list matches its pinned source, and Lite ids are a subset', () => {
    const raw = readFileSync(new URL('../reference/canonical-690-graph.json', import.meta.url));
    expect(createHash('sha256').update(raw).digest('hex')).toBe(canonical.sha256);
    expect(canonical.sha256).toBe(MANIFEST.canonicalSha256);
    const ids = JSON.parse(raw.toString('utf8')).nodes.map((n) => n.id);
    expect(Object.keys(canonical.titles)).toEqual(ids);
    for (const id of ORDER) expect(canonical.titles[id], id).toBeTruthy();
  });

  it('public/lite-runtime.json matches this build', () => {
    const expected = {
      schema: 'sammakko-lite-runtime/1',
      adapter: 'lite',
      route: {
        kind: KC_ROUTE.kind, template: KC_ROUTE.template, encoding: KC_ROUTE.encoding, version: KC_ROUTE.version,
        relativeTo: 'the app document (index.html) under its deployment path',
        handles: ['initial load', 'reload', 'address change (hashchange)'],
        requiresFreshDocument: false,
        opens: 'the lesson in its ordinary mode; prerequisite preview and free jumps are unchanged',
        records: 'nothing: opening or copying a link adds no attempt, inference or reward',
        unknownId: 'a page that says the id is not in this build (or not a Sammakko id); no lesson opens',
        titleList: 'canonical-ids.json, fetched next to index.html only for ids not in this build',
        loadFailure: 'if that list cannot be loaded: an error page with retry and a way back, never reported as an unknown id; nothing is recorded',
      },
      build: { contentRev: CONTENT_REV, graphSha256: GRAPH_SHA, scopeSha256: MANIFEST.sha256, canonicalSha256: MANIFEST.canonicalSha256, canonicalCommit: MANIFEST.canonicalCommit, kcCount: ORDER.length },
      runtimeAvailability: { state: 'build_manifest', ids: ORDER, lessonRev: Object.fromEntries(ORDER.map((id) => [id, revOf(id)])) },
      deployment: {
        baseUrl: null, deploymentScope: 'unconfigured', endpointVerification: 'not_configured', studentReachability: 'unverified',
        note: 'Route support is a property of this build. Where it is served, and whether pupils can reach it, is not known here.',
      },
    };
    if (process.env.UPDATE_RUNTIME) writeFileSync(RUNTIME, JSON.stringify(expected, null, 1) + '\n');
    expect(existsSync(RUNTIME)).toBe(true);
    expect(JSON.parse(readFileSync(RUNTIME, 'utf8'))).toEqual(expected);
  });
});

describe('kept invariants', () => {
  it('181 KC ids and 338 canonical required/strong relations', () => {
    expect(ORDER.length).toBe(181);
    expect(KCS.length).toBe(181);
    expect(new Set(ORDER).size).toBe(181);
    expect(KCS.reduce((s, k) => s + k.rel.length, 0)).toBe(338);
    expect(KCS.every((k) => k.rel.every((r) => r.strength === 'required' || r.strength === 'strong'))).toBe(true);
  });
  it('the 24 approved character PNGs are unchanged', () => {
    const dir = new URL('../public/characters/', import.meta.url);
    const files = readdirSync(dir).flatMap((a) => readdirSync(new URL(`${a}/`, dir)).filter((f) => f.endsWith('.png')).map((f) => `${a}/${f}`)).sort();
    const sums = Object.fromEntries(files.map((f) => [f, createHash('sha256').update(readFileSync(new URL(f, dir))).digest('hex').slice(0, 16)]));
    const pinned = JSON.parse(readFileSync(new URL('./png-manifest.json', import.meta.url), 'utf8'));
    if (process.env.UPDATE_RUNTIME && !Object.keys(pinned).length) writeFileSync(new URL('./png-manifest.json', import.meta.url), JSON.stringify(sums, null, 1) + '\n');
    expect(files.length).toBe(24);
    expect(sums).toEqual(pinned);
  });
});
