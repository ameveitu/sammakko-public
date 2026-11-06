import { describe, expect, it } from 'vitest';
import { solidWorkshopEvidence, solidWorkshopSpecs } from '../src/content/solid-workshop';
import {
  baseCount, checkSolidWorkshop, cone, cylinder, flat, partAt, prism, pyramid, rectangleBase, solidClass, solidMemberships,
  type Geometry, type SolidFigure, type SolidWorkshopResponse,
} from '../src/content/models/solid-workshop';
import { check, solution, wrongs } from '../src/engine/check';
import { rng } from '../src/engine/rng';

const ids = ['M-GEO-05', 'M-GEO-14', 'M-GEO-3D-CLASSIFY', 'M-GEO-09',
  'M-GEO-CONE-ID', 'M-GEO-CONE-PROP', 'M-GEO-17', 'M-GEO-CYLINDER-ID', 'M-GEO-CYLINDER-PROP', 'M-GEO-16'];
const spec = (id: string) => solidWorkshopSpecs.find(node => node.id === id)!;

describe('Majakkarakentajien kappalesaari', () => {
  it('exports the assigned ten skills with distinct revisions and boundaries', () => {
    expect(solidWorkshopSpecs.map(({ id }) => id)).toEqual(ids);
    expect(Object.keys(solidWorkshopEvidence)).toEqual(ids);
    expect(new Set(solidWorkshopSpecs.map(({ rev }) => rev)).size).toBe(10);
    for (const node of solidWorkshopSpecs) {
      expect(node.validRevs).toEqual([node.rev]);
      expect(solidWorkshopEvidence[node.id]?.limit).toMatch(/arvioidaan erikseen/);
      for (const demo of node.demo(rng(2))) {
        const host = { innerHTML: '' } as HTMLElement;
        demo.scene(host);
        expect(host.innerHTML).toContain('Pääty');
        expect(host.innerHTML).toContain('Sivu');
        expect(host.innerHTML).toContain('data-solid-view="ends"');
      }
    }
  });

  it.each(ids)('%s generates both families and the correct transfer deterministically', id => {
    const seen = new Set();
    for (const phase of ['independent', 'guided', 'retrieval', 'transfer'] as const) {
      for (let seed = 0; seed < 24; seed++) {
        const item = spec(id).item(rng(seed), phase);
        expect(item.task).toEqual(spec(id).item(rng(seed), phase).task);
        expect(check(item.task, solution(item.task)).ok).toBe(true);
        for (const wrong of wrongs(item.task)) expect(check(item.task, wrong).ok).toBe(false);
        if (item.task.kind !== 'solid-workshop') throw new Error('Expected a solid');
        if (phase === 'independent') seen.add(item.tag);
        if (phase === 'transfer') {
          expect(item.tag).toBe('transfer');
          expect(item.task.scene.figures.every(figure => figure.pose === 'horizontal')).toBe(true);
        }
      }
    }
    expect([...seen].sort()).toEqual([...solidWorkshopEvidence[id]!.families].sort());
  });

  it('separates general solids from the circular subfamilies and nests the cube', () => {
    const triangular = [[-3, -1], [3, -1], [0, 3]] as const;
    // Rotated square with edge length 5 by the 3–4–5 triangle.
    const turned = [[0, 0], [3, 4], [-1, 7], [-4, 3]] as const;
    const cases: [Geometry, boolean, number, string[]][] = [
      [prism(triangular, 7), false, 2, ['solid', 'column', 'prism']],
      [pyramid(triangular, 7), false, 1, ['solid', 'pointed', 'pyramid']],
      [prism(turned, 5), false, 2, ['solid', 'column', 'prism', 'box', 'cube']],
      [prism(turned, 8), false, 2, ['solid', 'column', 'prism', 'box']],
      [prism([[0, 0], [4, 0], [7, 4], [3, 4]], 4), false, 2, ['solid', 'column', 'prism']],
      [cone(4, 2), false, 1, ['solid', 'pointed', 'cone']],
      [cylinder(4, 2), false, 2, ['solid', 'column', 'cylinder']],
      [{ kind: 'disk', radius: 4 }, true, 0, ['figure']],
      [{ kind: 'sphere', radius: 4 }, false, 0, ['solid', 'other', 'sphere']],
      [{ kind: 'flat-polygon', base: rectangleBase(5, 3) }, true, 0, ['figure']],
    ];
    for (const [geometry, planar, bases, groups] of cases) {
      expect(flat(geometry)).toBe(planar);
      expect(baseCount(geometry)).toBe(bases);
      expect(solidMemberships(geometry)).toEqual(groups);
      if (!planar) expect(solidClass(geometry)).toBe(groups[1]);
    }
  });

  it('checks surface locations separately from rims, the interior and the opposing end', () => {
    expect(partAt(cone(4, 8), [0, 4, 0])).toBe('apex');
    expect(partAt(cone(4, 8), [0, -4, 0])).toBe('base-near');
    expect(partAt(cone(4, 8), [0, -2, 3])).toBe('mantle');
    expect(partAt(cone(4, 8), [4, -4, 0])).toBeUndefined();
    expect(partAt(cone(4, 8), [0, 0, 0])).toBeUndefined();
    expect(partAt(cylinder(5, 4), [3, 0, 4])).toBe('mantle');
    expect(partAt(cylinder(5, 4), [3, 2, 0])).toBe('base-far');
    expect(partAt(cylinder(5, 4), [3, -2, 0])).toBe('base-near');
    expect(partAt(cylinder(5, 4), [3, 2, 4])).toBeUndefined();
  });

  it.each(['M-GEO-17', 'M-GEO-16'])('%s requires the matched figure, every marked surface and the relation', id => {
    const task = spec(id).item(rng(13), 'transfer').task;
    if (task.kind !== 'solid-workshop') throw new Error('Expected an integrated task');
    const isCone = id === 'M-GEO-17';
    const body = task.scene.figures.find(({ geometry }) => geometry.kind === (isCone ? 'cone' : 'cylinder')) as SolidFigure;
    const marks = body.marks!;
    const at = (sign: number) => marks.find(({ position }) => Math.sign(position[1]) === sign)!.id;
    const response: SolidWorkshopResponse = {
      kind: task.kind, sets: { figure: [body.id], base: isCone ? [at(-1)] : [at(-1), at(1)], mantle: [at(0)],
        ...(isCone ? { apex: [at(1)] } : {}), relation: [task.questions.some(q => q.label === 'Millaista pintaa vaippa on?') ? 'curved' : 'correct'] },
    };
    expect(checkSolidWorkshop(task, response).ok).toBe(true);
    expect(checkSolidWorkshop(task, { ...response, sets: { figure: [body.id] } }).ok).toBe(false);
    const wrongBody = task.scene.figures.find(figure => figure.id !== body.id)!;
    expect(checkSolidWorkshop(task, { ...response, sets: { ...response.sets, figure: [wrongBody.id] } }).ok).toBe(false);
    expect(checkSolidWorkshop(task, { ...response, sets: { ...response.sets, base: [at(0)] } }).ok).toBe(false);
  });

  it('requires both mixed groups and a separate visible observation for each', () => {
    const task = spec('M-GEO-09').item(rng(0), 'transfer').task;
    if (task.kind !== 'solid-workshop') throw new Error('Expected an integrated task');
    const sets = { flat: task.scene.figures.filter(({ geometry }) => !('height' in geometry) && geometry.kind !== 'sphere').map(({ id }) => id),
      solids: task.scene.figures.filter(({ geometry }) => 'height' in geometry || geometry.kind === 'sphere').map(({ id }) => id),
      'why-flat': ['line'], 'why-solid': ['depth'] };
    expect(check(task, { kind: task.kind, sets }).ok).toBe(true);
    expect(check(task, { kind: task.kind, sets: { ...sets, 'why-solid': ['face'] } }).ok).toBe(false);
    expect(check(task, { kind: task.kind, sets: { ...sets, 'why-flat': ['round'] } }).ok).toBe(false);
  });
});
