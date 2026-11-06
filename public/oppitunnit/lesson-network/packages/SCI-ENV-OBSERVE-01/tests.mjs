import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ITEMS,check,leafScene,cupScene} from './lesson.mjs';
test('visible hole and droplets are observations; agent and temperature remain unknown',()=>{
  const expected=['visible','unknown','unknown','visible'];
  ITEMS.forEach((item,index)=>{
    assert.equal(item.category,expected[index]);
    for(const answer of ['visible','unknown']) {
      const verdict=check(index,answer);
      assert.equal(verdict.ok,answer===expected[index]);
      assert.ok(verdict.text.length>45);
      assert.equal(verdict.text.startsWith('Kyllä.'),verdict.ok);
    }
  });
  assert.match(check(1,'visible').text,/Toukkaa tai reiän syntyä ei näy/);
  assert.match(check(2,'visible').text,/lämpötilaa/);
});
test('two-sided exploration keeps the same hole and only adds specified back spot',()=>{
  const hole='<circle cx="274" cy="93" r="22"';
  assert.ok(leafScene('front').includes(hole));assert.ok(leafScene('back').includes(hole));
  assert.equal(leafScene('front').includes('<ellipse'),false);
  assert.ok(leafScene('back').includes('<ellipse cx="177" cy="166"'));
  assert.match(cupScene(),/Lämpötilaa ei ole näytetty/);
});
test('invalid assessment requests do not silently become correct or reveal another item',()=>{
  for(const index of [-1,4,NaN,0.5]) assert.throws(()=>check(index,'visible'),RangeError);
  assert.throws(()=>check(0,'guess'),RangeError);
});
test('canonical foundation and explicit physical-evidence limits are retained',()=>{
  const p=JSON.parse(fs.readFileSync(new URL('lesson.json',import.meta.url),'utf8'));
  assert.equal(p.planning.teacherObjective,'Havainnon tekeminen ilmiöstä tai kohteesta');
  assert.deepEqual(p.planning.requiredPrerequisites,[]);assert.deepEqual(p.planning.strongSupport,[]);
  const b=fs.readFileSync(new URL('body.html',import.meta.url),'utf8');
  assert.match(b,/Ruutuvalinta ei todenna fyysisen havainnon tekemistä/);
  assert.match(b,/Maistamista tai haistamista ei tarvita/);
});
