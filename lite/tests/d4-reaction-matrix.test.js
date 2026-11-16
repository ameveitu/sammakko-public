import { it, expect } from 'vitest';
import baseline from './fixtures/d4-reaction-baseline.json';
import { createHash } from 'node:crypto';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { itemIdentity } from '../src/engine/item-identity';
import { reactionLabSpecs } from '../src/content/reaction-lab';
import { reactionLabLight } from '../src/content/light/reaction-lab';
import { EXPEDITION_NODES } from '../src/content/expedition';
import { CATALOG } from '../src/engine/catalog';
import { rng } from '../src/engine/rng';
import { bookPage } from '../src/book/pages';
const hash = (s) => createHash('sha256').update(s).digest('hex');
class StaticNode {
    tag;
    innerHTML = '';
    textContent = '';
    style = {};
    dataset = {};
    children = [];
    attrs = {};
    constructor(tag = 'div') {
        this.tag = tag;
    }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = [...children]; this.innerHTML = ''; }
    setAttribute(k, v) { this.attrs[k] = v; }
    html() { return `<${this.tag}${Object.entries(this.attrs).map(([k, v]) => ` ${k}="${v}"`).join('')}>${this.textContent}${this.innerHTML}${this.children.map(n => typeof n === 'string' ? n : n.html()).join('')}</${this.tag}>`; }
}
function render(p) { const host = new StaticNode(); p?.(host); return host.html(); }
const summary = (item) => ({ say: item.say, task: item.task, basis: item.basis, tag: item.tag, explain: item.explain, sceneModel: item.sceneModel, serial: JSON.stringify(item), digest: hash(JSON.stringify(item)), identity: itemIdentity(item), markup: render(item.scene) });
it('captures six-seed reaction presentation without changing items or RNG', () => {
    globalThis.document = { createElement: (tag) => new StaticNode(tag) };
    try {
        const ids = ['CHEM79-CHANGE-PHYS', 'CHEM79-REACTION-01'], seeds = [0, 1, 3, 37, 4242, 20261110, 23, 45, 27, 7], phases = ['guided', 'independent', 'transfer', 'retrieval'];
        const rows = ids.map(id => {
            const spec = reactionLabSpecs.find(s => s.id === id), light = EXPEDITION_NODES[id], page = bookPage(light);
            const demos = seeds.map(seed => ({ seed, full: spec.demo(rng(seed)).map(b => ({ say: b.say, sceneModel: b.sceneModel, markup: render(b.scene) })), light: light.demo(rng(seed)).map(b => ({ say: b.say, markup: render(b.scene) })) }));
            const items = seeds.flatMap(seed => phases.map(phase => {
                const r = rng(seed), full = spec.item(r, phase), adapterSeed = r.int(0, 2 ** 31 - 1), postAdapterRng = r.next();
                const adapted = reactionLabLight(full, { phase, r: rng(adapterSeed) });
                if (phase !== 'guided')
                    delete adapted.hint;
                const actual = light.item(rng(seed), phase);
                expect(JSON.stringify(adapted)).toBe(JSON.stringify(actual));
                return { seed, phase, adapterSeed, fullRngNextAfterAdapterSeed: postAdapterRng, full: summary(full), light: summary(actual) };
            }));
            return { id, scope: CATALOG.find(c => c.id === id)?.scope, fullRevision: spec.rev, lightRevision: light.rev, fullValidRevs: spec.validRevs, lightValidRevs: light.validRevs, demos, items, resolvedBook: { fixedDemoSeed: 20261110, beats: page.beats.map(b => ({ text: b.text, more: b.more, markup: render(b.scene) })), tries: seeds.map(seed => ({ seed, rev: page.makeTry(seed, 0)?.rev, ...summary(page.makeTry(seed, 0).item) })) } };
        });
        const matrices = reactionLabSpecs.map(spec => { const full = [], light = []; for (const seed of seeds)
            for (const phase of phases) {
                for (const [target, source] of [[full, spec], [light, EXPEDITION_NODES[spec.id]]]) {
                    const r = rng(seed), item = source.item(r, phase);
                    target.push({ seed, phase, json: JSON.stringify(item), postRng: r.next() });
                }
            } return { id: spec.id, fullDigest: hash(JSON.stringify(full)), lightDigest: hash(JSON.stringify(light)), full, light }; });
        const files = ['src/content/reaction-lab.ts', 'src/content/light/reaction-lab.ts', 'src/content/light/core.ts', 'src/content/light/index.ts', 'src/content/scenes/reaction-lab.ts', 'src/content/models/reaction-lab.ts', 'src/content/models/reaction-lab-scene.ts', 'src/content/expedition.ts', 'src/engine/rng.ts', 'src/content/kit.ts', 'src/book/pages.ts', 'src/book/default-page.ts', 'src/book/text/SCI18.ts', 'tests/light.test.ts', 'tests/book.test.ts', 'tests/readiness-serialized181.test.js'];
        const witnesses = [];
        const witnessed = new Set();
        for (let seed = 0; seed < 128; seed++) {
            const item = EXPEDITION_NODES['CHEM79-CHANGE-PHYS'].item(rng(seed), 'guided'), basis = item.basis;
            const c = basis.cases.filter((c) => c.identityEvidence === 'verified')[0];
            if (!c || !['Grafiittipala murskautuu.', 'Rautapala taipuu.', 'Jää muuttuu vedeksi.', 'Alumiinin annettu sulamistallenne.'].includes(c.observation) || witnessed.has(c.observation))
                continue;
            witnessed.add(c.observation);
            witnesses.push({ seed, phase: 'guided', selectedCase: c, item: summary(item) });
        }
        expect(matrices.map(({id, fullDigest, lightDigest})=>({id,fullDigest,lightDigest}))).toEqual(baseline.matrix);
        for(const row of rows)expect(row.resolvedBook.tries.map(v=>({seed:v.seed,digest:v.digest,identity:v.identity,rev:v.rev??null}))).toEqual(baseline.bookTries[row.id]);
        expect(witnesses.map(v=>({seed:v.seed,digest:v.item.digest,identity:v.item.identity}))).toEqual(baseline.witnesses);
        const data = { witnesses, sourceSha: process.env.D4_EVIDENCE ? execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() : 'not-recorded', method: 'Static string/node stub only: no browser, canvas, image or layout assertions. Both full and light item paths; ten seeds x four phases; two IDs; resolved book uses fixed demo seed20261110.', seeds, phases, rows, matrices, dependencies: files.map(file => ({ file: 'lite/' + file, sha256: hash(readFileSync(file, 'utf8')) })) };
        if (process.env.D4_EVIDENCE) {
            mkdirSync(process.env.D4_EVIDENCE, { recursive: true });
            writeFileSync(`${process.env.D4_EVIDENCE}/reaction-matrix.json.gz`, gzipSync(JSON.stringify(data) + '\n'));
        }
    }
    finally {
        delete globalThis.document;
    }
});
