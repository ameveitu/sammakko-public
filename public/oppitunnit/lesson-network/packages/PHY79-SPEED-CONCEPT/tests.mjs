import assert from 'node:assert/strict';import {scenarios,scenarioFor,positionAt,average,compare} from './lesson.mjs';
for(const s of Object.values(scenarios)){for(const lane of [s.a,s.b]){assert.equal(positionAt(lane,0),0);assert.equal(positionAt(lane,lane.duration),lane.distance);assert.equal(positionAt(lane,lane.duration+20),lane.distance);assert.equal(average(lane)*lane.duration,lane.distance);}}
assert.equal(compare(scenarios.different.a,scenarios.different.b),1);assert.equal(average(scenarios.different.a),4);assert.equal(average(scenarios.different.b),2);
assert.equal(compare(scenarios.sameTime.a,scenarios.sameTime.b),-1);assert.equal(compare(scenarios.sameDistance.a,scenarios.sameDistance.b),1);assert.equal(compare(scenarios.equal.a,scenarios.equal.b),0);assert.equal(compare(scenarios.pause.a,scenarios.pause.b),0);assert.equal(positionAt(scenarios.pause.a,3),12);assert.equal(positionAt(scenarios.pause.a,5),12);assert.equal(average(scenarios.pause.a),2);assert.throws(()=>positionAt(scenarios.pause.a,NaN));console.log('PASS speed-concept deterministic truth, stopping, elapsed time and comparisons');

for(const key of Object.keys(scenarios))assert.equal(scenarioFor(key),scenarios[key]);
for(const key of [null,undefined,[],["sameTime"],new String("sameTime"),"constructor","__proto__","toString","unsupported_accelerated_motion",""])assert.throws(()=>scenarioFor(key),RangeError);

for(const scenario of Object.values(scenarios))assert.doesNotMatch(scenario.label,/sama keskinopeus|nopeampi|hitaampi/i,'comparison selector must not name the answer');
