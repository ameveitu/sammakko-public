import { it, expect } from 'vitest';
import { writeFileSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import sampleFixture from './fixtures/d4-sample.json';
import { CATALOG, FAMILIES } from '../src/engine/catalog';
import { STORY_ORDER } from '../src/engine/story-route';
import { EXPEDITION_NODES } from '../src/content/expedition';
import { bookPage, PAGE_TEXT, PAGE_DRAW, hasAuthoredPage } from '../src/book/pages';
import { modelBeats } from '../src/book/default-page';
import bands from '../src/data/grade-bands.json';
const textFiles = import.meta.glob('../src/book/text/*.ts', { eager: true });
const drawFiles = import.meta.glob('../src/book/draw/*.ts', { eager: true });
const out = process.env.D4_EVIDENCE;
const sourceSha = out ? execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() : 'not-recorded';
const sources = (files, key, id) => Object.entries(files).filter(([, m]) => id in m[key]).map(([p]) => p.replace('../src/', 'lite/src/'));
function paint(p) {
    if (!p)
        return { present: false };
    const host = { innerHTML: '', classList: { add() { }, remove() { } }, style: {} };
    try {
        const cleanup = p(host);
        if (typeof cleanup === 'function')
            cleanup();
        return { present: true, markup: host.innerHTML, labels: [...host.innerHTML.matchAll(/(?:aria-label="([^"]*)"|<text\b[^>]*>(.*?)<\/text>)/gs)].map(m => m[1] ?? m[2]), probe: 'static-host-only' };
    }
    catch (e) {
        return { present: true, probe: 'requires-DOM-or-canvas', error: String(e) };
    }
}
it('records resolved inventory without asserting semantic correctness', () => {
    const failures = [], conflicts = [];
    const ids = new Set(CATALOG.map(n => n.id));
    const unknown = (files, key) => Object.entries(files).flatMap(([file, m]) => Object.keys(m[key]).filter(id => !ids.has(id)).map(id => ({ file, id })));
    for (const id of ids) {
        const entries = Object.entries(drawFiles).filter(([, m]) => id in m.DRAW).map(([source, m]) => ({ source, draw: m.DRAW[id]() }));
        for (let a = 0; a < entries.length; a++)
            for (let b = a + 1; b < entries.length; b++) {
                const x = entries[a], y = entries[b];
                for (let i = 0; i < Math.max(x.draw.beats?.length ?? 0, y.draw.beats?.length ?? 0); i++)
                    if (x.draw.beats?.[i] && y.draw.beats?.[i])
                        conflicts.push({ id, beat: i, sources: [x.source, y.source] });
                if (x.draw.try && y.draw.try)
                    conflicts.push({ id, try: true, sources: [x.source, y.source] });
            }
    }
    const inventory = STORY_ORDER.map((id, index) => {
        const meta = CATALOG.find(n => n.id === id), spec = EXPEDITION_NODES[id], text = PAGE_TEXT[id];
        let page, base, draw;
        try {
            page = bookPage(spec);
            base = modelBeats(spec);
            draw = PAGE_DRAW[id]?.();
        }
        catch (e) {
            failures.push({ id, kind: 'resolution', error: String(e) });
            return { id, error: String(e) };
        }
        const authored = hasAuthoredPage(id), ts = sources(textFiles, 'TEXT', id), ds = sources(drawFiles, 'DRAW', id);
        if (!page.beats.length || page.beats.length > 3)
            failures.push({ id, kind: 'beat-count', count: page.beats.length });
        const beats = page.beats.map((b, i) => {
            if (!b.text.trim())
                failures.push({ id, kind: 'empty-text', beat: i });
            const written = text?.beats[i], pic = written ? written.pic === undefined ? (i < base.length ? i : undefined) : written.pic ?? undefined : i;
            const fig = authored ? 'authored-stage' : draw?.beats?.[i] ? 'book-draw' : written?.draw ? 'inline-draw' : b.scene ? 'demo-fallback' : b.step ? 'demo-model-only' : 'none';
            return { index: i, text: b.text, more: b.more, example: b.example, view: b.view, pic, figureSource: fig, hasStep: !!b.step, paint: paint(b.scene) };
        });
        const attempts = [];
        for (const seed of [0, 1, 3, 37, 4242, 20261110])
            for (let part = 0; part < (page.tries ?? 1); part++) {
                try {
                    const a = page.makeTry?.(seed, part);
                    if (!a) {
                        if (page.makeTry)
                            failures.push({ id, kind: 'missing-try-at-seed', seed, part });
                        continue;
                    }
                    const t = a.item.task;
                    const valid = t.kind === 'choice' ? Number.isInteger(t.answer) && t.answer >= 0 && t.answer < t.options.length : t.kind === 'numeric' ? Number.isFinite(t.answer) : false;
                    if (!valid)
                        failures.push({ id, kind: 'invalid-one-move-answer', seed, part, task: t });
                    attempts.push({ seed, part, kind: t.kind, say: a.item.say, task: t, explain: a.item.explain, view: a.view, rev: a.rev, figure: paint(a.item.scene) });
                }
                catch (e) {
                    failures.push({ id, kind: 'try-throw', seed, part, error: String(e) });
                }
            }
        return { id, routeIndex: index, family: meta.familyId, familyTitle: FAMILIES.find(f => f.id === meta.familyId)?.title, scope: meta.scope === 'existing_181_exterior_wrapper' ? '181' : '509', gradeBand: bands[id], title: meta.title, resolvedTitle: page.title ?? spec.stop, textSources: ts, drawSources: ds, authoredStage: authored, authoredSource: authored ? `lite/src/book/authored/${id.includes('SPACE') ? 'space' : 'elecsafe'}.ts` : null, hasFeedbackText: !!page.feedbackText, resolvedBeatCount: beats.length, beats, demoSteps: base.map((b) => ({ text: b.text, more: b.more, example: b.example, stepSay: b.step?.say })), tryPlan: authored ? 'authored-stage' : typeof text?.try === 'object' ? 'authored-choice' : text?.try ?? 'default-auto', tryKinds: [...new Set(attempts.map(a => a.kind))], tryCount: page.makeTry ? (page.tries ?? 1) : 0, tryFigure: page.tryFigure !== false, attempts };
    });
    const rawEntries = (files) => Object.keys(files).flatMap(file => [...readFileSync(file.replace('../src/', 'src/'), 'utf8').matchAll(/^  ['"]([^'"]+)['"]:\s*/gm)].map(m => ({ id: m[1], source: file, line: readFileSync(file.replace('../src/', 'src/'), 'utf8').slice(0, m.index).split('\n').length })));
    const rawText = rawEntries(textFiles), rawDraw = rawEntries(drawFiles);
    const duplicateText = [...new Set(rawText.map(r => r.id))].filter(id => rawText.filter(r => r.id === id).length > 1).map(id => ({ id, entries: rawText.filter(r => r.id === id) }));
    const duplicateWithinDrawFile = rawDraw.filter((r, i) => rawDraw.findIndex(q => q.id === r.id && q.source === r.source) !== i);
    for (const r of inventory)
        for (const b of PAGE_TEXT[r.id]?.beats ?? [])
            if (typeof b.pic === 'number' && (!Number.isInteger(b.pic) || b.pic < 0 || b.pic >= r.demoSteps.length))
                failures.push({ id: r.id, kind: 'invalid-demo-picture-reference', pic: b.pic });
    let state = 20261115;
    const next = () => { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return state / 4294967296; };
    const selected = new Map();
    const add = (id, reason) => selected.set(id, [...selected.get(id) ?? [], reason]);
    for (const family of [...new Set(inventory.map((r) => r.family))].sort()) {
        const pool = inventory.filter((r) => r.family === family).sort((a, b) => a.id.localeCompare(b.id, 'en'));
        add(pool[Math.floor(next() * pool.length)].id, `fixed-seed family ${family}`);
    }
    for (const band of ['1-2', '1-6', '3-6', '7-9'])
        for (const scope of ['181', '509']) {
            const pool = inventory.filter((r) => r.gradeBand === band && r.scope === scope).sort((a, b) => a.id.localeCompare(b.id, 'en'));
            if (pool.length)
                add(pool[Math.floor(next() * pool.length)].id, `grade/scope ${band}/${scope}`);
        }
    add(STORY_ORDER[0], 'first route');
    add(STORY_ORDER.at(-1), 'last route');
    for (const r of inventory)
        if (r.authoredStage)
            add(r.id, 'authored-stage');
    const riskIds = ['M-FRAC-01', 'M-FRAC-06', 'M-FRAC-14', 'M-TH-06', 'SCI-ENV-MEAS-01', 'SCI-ENV-MODEL-01', 'SCI-ENV-MODEL-REVISE-01'];
    for (const id of riskIds)
        if (ids.has(id))
            add(id, 'explicit risk fraction/unit/model/view');
    const riskPatterns = [['signs', /negatii|miinus|etumerk/i], ['units', /yksikkö|m\/s|°C|cm²/], ['graph-axes', /akseli|koordinaat|kuvaaja/i], ['probability', /todennäköisy/i], ['safety', /turvallis|vaarall|varoitus/i], ['model-limitations', /malli|mittakaava/i]];
    for (const [name, re] of riskPatterns) {
        const pool = inventory.filter((r) => re.test(r.beats.map((b) => b.text + ' ' + (b.more ?? '')).join(' '))).sort((a, b) => a.id.localeCompare(b.id, 'en'));
        for (const scope of ['181', '509']) {
            const p = pool.filter((r) => r.scope === scope);
            if (p.length)
                add(p[Math.floor(next() * p.length)].id, `risk ${name}/${scope}`);
        }
    }
    for (const id of sampleFixture.originalIds)
        add(id, 'frozen original85 sample');
    for (const id of sampleFixture.extraIds)
        add(id, 'changed/related same-family example');
    const frozen = new Set([...sampleFixture.originalIds, ...sampleFixture.extraIds]);
    const sample = inventory.filter((r) => frozen.has(r.id)).map((r) => ({ ...r, selectionReasons: selected.get(r.id) }));
    const count = (key, rows = inventory) => rows.reduce((a, r) => { const v = String(r[key]); a[v] = (a[v] ?? 0) + 1; return a; }, {});
    const summary = { sourceSha, acceptedBaseSha: 'e7858aa3068ddd1a32fdd646c27903d71f7df154', note: 'Resolved structure/static-host probe only; no semantic acceptance', counts: { pages: inventory.length, textModules: Object.keys(textFiles).length, drawModules: Object.keys(drawFiles).length, registeredText: Object.keys(PAGE_TEXT).length, registeredDraw: Object.keys(PAGE_DRAW).length, authored: inventory.filter((r) => r.authoredStage).length, scope: count('scope'), grade: count('gradeBand'), beats: count('resolvedBeatCount'), tryPlans: count('tryPlan'), tryKinds: count('tryKinds'), figureSources: inventory.flatMap((r) => r.beats ?? []).reduce((a, b) => { a[b.figureSource] = (a[b.figureSource] ?? 0) + 1; return a; }, {}) }, unknownText: unknown(textFiles, 'TEXT'), unknownDraw: unknown(drawFiles, 'DRAW'), duplicateText, duplicateWithinDrawFile, conflictingDrawBeats: conflicts, failures, sample: { seed: 20261115, prng: 'LCG imul(1664525,s)+1013904223 uint32', selection: 'Original85 IDs frozen from seed20261115 sorted-family/grade-scope/endpoints/authored/risk selection; append17 changed/related IDs from exported test fixture. Deduplicate with reasons; review remains sampled.', count: sample.length, families: count('family', sample), scope: count('scope', sample), grade: count('gradeBand', sample) } };
    if (out) {
        mkdirSync(out, { recursive: true });
        writeFileSync(`${out}/inventory.json.gz`, gzipSync(JSON.stringify({ summary, pages: inventory })));
        writeFileSync(`${out}/sample.json.gz`, gzipSync(JSON.stringify({ method: summary.sample, pages: sample })));
        writeFileSync(`${out}/summary.json`, JSON.stringify(summary, null, 2) + '\n');
    }
    expect(inventory.length).toBe(690);
    expect(failures).toEqual([]);
    expect(duplicateText).toEqual([]);
    expect(duplicateWithinDrawFile).toEqual([]);
    expect(conflicts).toEqual([]);
    expect(summary.unknownText).toEqual([]);
    expect(summary.unknownDraw).toEqual([]);
    expect(sample.length).toBe(frozen.size);
    expect(Object.keys(summary.sample.families)).toHaveLength(62);
});
