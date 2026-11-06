import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../../', import.meta.url);
const read = path => JSON.parse(fs.readFileSync(new URL(path, root), 'utf8'));
const status = read('public/oppitunnit/lesson-network/lesson-status.json');
for (const [key, expected] of Object.entries({scope:181, network:690, authored:181, technicalChecked:181, otherPending:509})) {
  assert.equal(status[key], expected, `Unexpected lesson status: ${key}`);
}
const lessonIds = status.lessons.map(lesson => {
  assert.equal(lesson.status, 'technical_checked', `Unchecked lesson ${lesson.kcId}`);
  return lesson.kcId;
}).sort();
const liteIds = read('lite/public/lite-runtime.json').runtimeAvailability.ids.slice().sort();
assert.equal(new Set(lessonIds).size, 181, 'Lesson IDs must be unique');
assert.deepEqual(lessonIds, liteIds, 'Lesson and Lite scopes must match');
console.log(JSON.stringify({network:690, technicalChecked:181, otherPending:509, liteScopeMatch:true}));
