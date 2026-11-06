import { describe, expect, it } from 'vitest';
import { solidConstructionSpecs, solidConstructionEvidence } from '../src/content/solid-construction';
import { checkSolidConstruction, isPolyhedron, polyhedronStructure, recordSolidConstruction, type SolidCell, type SolidConstructionTask } from '../src/content/models/solid-construction';
import { polygonBase, prism, pyramid, rectangleBase, triangleBase } from '../src/content/models/solid-workshop';
import { check, solution, wrongs } from '../src/engine/check';
import { rng } from '../src/engine/rng';

const ids = ['M-GEO-07', 'M-GEO-3D-PROP-NAME', 'M-GEO-08', 'M-GEO-PYRAMID-ID', 'M-GEO-PYRAMID-PROP',
  'M-GEO-18', 'M-GEO-RECTPRISM-ID', 'M-GEO-RECTPRISM-PROP', 'M-GEO-15'];
const spec = (id: string) => solidConstructionSpecs.find(node => node.id === id)!;

describe('Majakkarakentajien kappalesaari, rakentelu ja monitahokkaat', () => {
  it('exports all nine new work order skills with distinct revisions', () => {
    expect(solidConstructionSpecs.map(n => n.id)).toEqual(ids);
    expect(Object.keys(solidConstructionEvidence)).toEqual(ids);
    expect(new Set(solidConstructionSpecs.map(n => n.rev)).size).toBe(ids.length);
    for (const node of solidConstructionSpecs) {
      expect(node.validRevs).toEqual(node.id === 'M-GEO-07' ? ['exp690-construction-m-geo-07-v1', 'exp690-construction-m-geo-07-v2'] : [node.rev]);
      for (const demo of node.demo(rng(3))) {
        const host = { innerHTML: '' } as HTMLElement;
        demo.scene(host);
        expect(host.innerHTML).toMatch(/solid-/);
      }
    }
  });
  it.each(ids)('%s has reproducible families and a checkable transfer', id => {
    const tags = new Set<string>();
    for (const phase of ['independent', 'guided', 'transfer', 'retrieval'] as const) {
      for (let seed = 0; seed < 24; seed++) {
        const { task, tag } = spec(id).item(rng(seed), phase);
        expect(task).toEqual(spec(id).item(rng(seed), phase).task);
        expect(check(task, solution(task)).ok).toBe(true);
        for (const wrong of wrongs(task)) expect(check(task, wrong).ok).toBe(false);
        if (phase === 'independent') tags.add(tag);
        if (phase === 'transfer') expect(tag).toBe('transfer');
      }
    }
    expect([...tags].sort()).toEqual([...solidConstructionEvidence[id]!.families].sort());
  });
  it('requires matching depths even when the front outline and cell total match', () => {
    const cells: SolidCell[] = [[0,0,0],[1,0,1],[1,1,1]];
    const task: SolidConstructionTask = { kind: 'solid-construction', activity: 'build', scene: {
      kind: 'solid-construction', title: 'Malli', grid: [3,2,3], view: 'side', pose: 'tilted', referenceCells: cells, previewCells: [],
    } };
    const submit = (placed: SolidCell[]) => checkSolidConstruction(task, { kind: task.kind, activity: task.activity, cells: placed });
    expect(submit(cells.slice().reverse()).ok).toBe(true);
    expect(submit([[0,0,2],[1,0,1],[1,1,1]]).why).toContain('takarivi');
    expect(submit([[0,0,0],[1,0,1],[1,1,2]]).why).toContain('ilmaan');
    expect(submit([[0,0,0],[1,0,1],[1,0,1]]).why).toContain('enintään yksi');
    expect(submit([[0,0,0],[1,0,1],[1,2,1]]).why).toContain('rajojen');
  });
  it('distinguishes an edge from a side and accepts ordinary Finnish inflections', () => {
    const task: SolidConstructionTask = { kind: 'solid-construction', activity: 'name', fields: [
      { id: 'flat', label: 'Tasokuvio', options: ['A','B'], mark: 'B', term: 'sivu' },
      { id: 'solid', label: 'Kappale', options: ['A','B'], mark: 'A', term: 'särmä' },
    ] };
    const entries = { flat: { mark: 'B', term: 'SIVUN.' }, solid: { mark: 'A', term: 'särmää' } };
    const submit = (entries: Record<string,{mark:string;term:string}>) =>
      checkSolidConstruction(task, { kind: task.kind, activity: task.activity, entries });
    expect(submit(entries).ok).toBe(true);
    expect(submit({ ...entries, solid: { mark: 'A', term: 'sivu' } }).ok).toBe(false);
    expect(submit({ ...entries, solid: { mark: 'B', term: 'särmä' } }).ok).toBe(false);
    expect(submit({ flat: entries.flat }).ok).toBe(false);
  });
  it('records recognized term lemmas while omitting learner prose', () => {
    const saved = recordSolidConstruction({ kind: 'solid-construction', activity: 'name', entries: {
      flat: { mark: 'B', term: 'SIVUN.' }, solid: { mark: 'A', term: 'Oma pitkä vapaamuotoinen vastaus' },
    } });
    expect(saved).toEqual({ kind: 'solid-construction', activity: 'name', entries: {
      flat: { mark: 'B', termKnown: 'sivu' }, solid: { mark: 'A', termKnown: null },
    } });
  });
  it('builds closed polyhedra with the expected counts and two face incidences per edge', () => {
    for (const base of [triangleBase(), rectangleBase(4,5), polygonBase()]) {
      const n = base.length;
      for (const [shape, vertexCount, edgeCount, faceCount] of [
        [prism(base,4), 2*n, 3*n, n+2], [pyramid(base,5), n+1, 2*n, n+1],
      ] as const) {
        if (!isPolyhedron(shape)) throw new Error('Expected a polyhedron');
        const { vertices, faces, edges, bases } = polyhedronStructure(shape);
        expect([vertices.length, edges.length, faces.length]).toEqual([vertexCount,edgeCount,faceCount]);
        expect(vertices.length - edges.length + faces.length).toBe(2);
        for (const [a,b] of edges) expect(faces.filter(face => face.some((v,i) => {
          const other = face[(i+1)%face.length]!;
          return (v === a && other === b) || (v === b && other === a);
        }))).toHaveLength(2);
        if (shape.kind === 'pyramid') expect(faces.slice(bases).every(face => face.length === 3 && face.includes(n))).toBe(true);
      }
    }
  });
  it('grades the pentagonal pyramid from its geometry and annotated faces', () => {
    const task = spec('M-GEO-18').item(rng(11), 'transfer').task;
    if (task.kind !== 'solid-workshop') throw new Error('Expected the pyramid inspection');
    const target = task.scene.figures.find(({ geometry }) => geometry.kind === 'pyramid' && geometry.base.length === 5)!;
    const marks = [...target.marks!].sort((a, b) => a.position[1] - b.position[1]);
    const answer = { kind: task.kind, sets: { figure: [target.id], base: [marks[0]!.id], side: [marks[1]!.id],
      apex: [marks[2]!.id], relation: ['6'] } };
    expect(check(task, answer).ok).toBe(true);
    expect(check(task, { ...answer, sets: { ...answer.sets, relation: ['5'] } }).ok).toBe(false);
  });
  it('rejects selecting a correct integration model without its observed parts', () => {
    for (const id of ['M-GEO-15', 'M-GEO-18']) {
      const task = spec(id).item(rng(4),'transfer').task;
      if (task.kind !== 'solid-workshop') throw new Error('Expected a polyhedron inspection');
      const chosen = task.scene.figures.find(f => f.geometry.kind === (id === 'M-GEO-15' ? 'prism' : 'pyramid')
        && 'base' in f.geometry && (id === 'M-GEO-15' ? f.geometry.base[0]![0] === -4 : f.geometry.base.length === 5));
      expect(chosen).toBeDefined();
      expect(check(task, { kind: 'solid-workshop', sets: { figure: [chosen!.id] } }).ok).toBe(false);
    }
  });
});
