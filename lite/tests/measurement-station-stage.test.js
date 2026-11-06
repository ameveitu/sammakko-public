import { Group, Box3 } from 'three';
import { describe, expect, it } from 'vitest';
import { drawMeasurementStation } from '../src/world/measurement-station-stage';
import { measurementStationScene } from '../src/content/models/measurement-scene';

const kind = 'measurement-station';
const base = { kind, object: 'Testi', context: { title: 'Testi', skills: [] } };

describe('measurement station scene projection', () => {
  it('updates the mass load and basket without exposing the unmeasured mass', () => {
    const task = { ...base, mode: 'mass', grams: 650, offset: 30, basket: 80, unit: 'kg', display: 'beam' };
    const initial = measurementStationScene(task);
    const group = new Group();
    const start = drawMeasurementStation(group, initial);
    expect(start).toEqual({ instrument: 'mass', basket: false, loaded: false, zeroed: false, display: 'beam' });
    expect(group.getObjectByName('scale-load')).toBeUndefined();
    const tared = measurementStationScene(task, { kind, mode: 'mass', basketPlaced: true, placed: false, zeroed: 'basket' });
    const withLoad = measurementStationScene(task, { kind, mode: 'mass', basketPlaced: true, placed: true, zeroed: 'basket' });
    const next = new Group();
    drawMeasurementStation(next, withLoad);
    expect(next.getObjectByName('basket-base')).toBeDefined();
    expect(next.getObjectByName('scale-load')).toBeDefined();
    expect(next.getObjectByName('beam-dial-pointer').position.x).toBeCloseTo(0);
    expect(tared.needle).toBeCloseTo(1 / 3);
  });

  it('aligns the same calibrated marks and water height, including the sight position', () => {
    const task = { ...base, mode: 'liquid', shape: 'flared', target: 600, initial: 400, capacity: 1200, step: 200, portion: 200, unit: 'l' };
    const response = { kind, mode: 'liquid', filled: 600, eye: 'level' };
    const projection = measurementStationScene(task, response), group = new Group();
    const details = drawMeasurementStation(group, projection);
    const water = group.getObjectByName('measured-water');
    const surface = new Box3().setFromObject(water).max.y;
    const sight = group.getObjectByName('sight-marker');
    expect(details.ticks).toHaveLength(7);
    expect(sight.position.y).toBeCloseTo(surface);
    expect(details.fillHeight).toBeCloseTo(details.ticks[3]);
    expect(details.ticks[1]).toBeGreaterThan(1 / 6);
    expect(details).not.toHaveProperty('target');
  });

  it('conserves litre portions between the supply and identically sized cubes', () => {
    const task = { ...base, mode: 'cube', amount: 3, direction: 'from-litres', portionDl: 5 };
    const initial = new Group(), midway = new Group();
    drawMeasurementStation(initial, measurementStationScene(task));
    const details = drawMeasurementStation(midway, measurementStationScene(task, { kind, mode: 'cube', filled: 2, pouredDl: 25 }));
    const water0 = initial.getObjectByName('reserve-water').geometry.parameters;
    const water1 = midway.getObjectByName('reserve-water').geometry.parameters;
    const cube = midway.getObjectByName('one-litre-in-cube').geometry.parameters;
    const polygonArea = water0.radialSegments * water0.radiusTop ** 2 * Math.sin(2 * Math.PI / water0.radialSegments) / 2;
    expect(polygonArea * water0.height).toBeCloseTo(polygonArea * water1.height + 2.5 * cube.width * cube.height * cube.depth);
    const partial = midway.getObjectByName('partial-litre-in-cube').geometry.parameters;
    expect(partial.height).toBeCloseTo(cube.height / 2);
    expect(details).toEqual({ instrument: 'cube', cubes: 3, filled: 2, partial: .5, available: .5 });
    expect(measurementStationScene({ ...base, mode: 'estimate', lengthMm: 300 })).toBeUndefined();
  });
});
