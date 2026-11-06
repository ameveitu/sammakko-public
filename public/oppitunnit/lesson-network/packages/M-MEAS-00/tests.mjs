import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PAIRS, positions, compare, feedback, scene} from './lesson.mjs';
test('translation preserves every ribbon length and convergence fixes misleading end order', () => {
  for (const pair of PAIRS) {
    for (let step = 0; step <= 4; step++) {
      const p = positions(pair, step);
      assert.equal(p.widthA, pair.a); assert.equal(p.widthB, pair.b);
      assert.ok(p.a >= 72 && p.b >= 72);
      assert.ok(p.a + p.widthA < 640 && p.b + p.widthB < 640);
      if (step === 4) {
        assert.equal(p.a, p.b);
        assert.equal(compare(p.a + p.widthA, p.b + p.widthB), compare(pair.a, pair.b));
      }
      for (const [key,width] of [['A',pair.a],['B',pair.b]]) assert.ok(scene(pair,step).includes(`data-ribbon="${key}" x="${p[key.toLowerCase()]}" y="${key==='A'?48:128}" width="${width}"`));
    }
  }
  assert.equal(compare(PAIRS[0].a,PAIRS[0].b),'B');
  const start=positions(PAIRS[0],0);assert.ok(start.a+start.widthA > start.b+start.widthB);
  assert.equal(compare(PAIRS[1].a,PAIRS[1].b),'same');
  assert.equal(compare(PAIRS[2].a,PAIRS[2].b),'A');
});
test('all three answer outcomes have concept-specific feedback including equal case',()=>{
  for (const pair of PAIRS) for(const answer of ['A','B','same']) {
    const text=feedback(pair,answer);assert.ok(text.length>45);
    assert.equal(text.startsWith('Kyllä.'),answer===compare(pair.a,pair.b));
    assert.match(text,/alku|alut/);
  }
  assert.match(feedback(PAIRS[1],'A'),/samat/);
  assert.equal(positions(PAIRS[0],-5).a,positions(PAIRS[0],0).a);
  assert.equal(positions(PAIRS[0],10).a,positions(PAIRS[0],4).a);
});
test('unanswered comparison names and accessible diagrams do not name the winner or equality',()=>{
 for(const pair of PAIRS){assert.doesNotMatch(pair.name,/sama pituus|yhtä pitk|[AB] on pidempi/i);for(let step=0;step<=4;step++){const label=scene(pair,step).match(/aria-label="([^"]*)"/)[1];assert.doesNotMatch(label,/on pidempi|yhtä pitk|pituudet ovat samat/i);assert.match(label,/Ylempi nauha A, alempi nauha B/);}}
 assert.match(feedback(PAIRS[0],'B'),/B ulottuu kauemmas/);
});
test('static diagrams match actual intended comparisons and metadata keeps canonical support soft',()=>{
  const load=f=>fs.readFileSync(new URL(f,import.meta.url),'utf8');
  const p=JSON.parse(load('lesson.json'));
  assert.equal(p.planning.requiredPrerequisites.length,0);
  assert.equal(p.planning.strongSupport[0].id,'M-TH-01');
  assert.equal(p.planning.strongSupport[0].strength,'strong');
  assert.equal(p.planning.canonicalPrerequisiteGroups.length,0);
  assert.ok(load('baseline.svg').includes('width="240"'));
  assert.ok(load('height.svg').includes('height="150"'));
  assert.ok(load('height.svg').includes('height="180"'));
  assert.match(load('body.html'),/Palikoita ei tarvitse laskea/);
});
