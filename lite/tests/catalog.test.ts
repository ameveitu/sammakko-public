import { describe, expect, it } from 'vitest';
import canonical from '../reference/canonical-690-graph.json';
import { canEnter, CATALOG, catalogHashes, catalogNode, FAMILIES, graphCounts, requiredAncestors, requiredOrder } from '../src/engine/catalog';
import { ORDER } from '../src/engine/graph';

describe('canonical journey catalog', () => {
  it('preserves the exact selection and authored family partition', () => {
    expect(catalogHashes.canonical).toBe('17eca8c1675ffe14aa3d6836e1ce7109020f440b22df09b7a7b15a8e95bb39fb');
    expect(CATALOG).toHaveLength(690);
    expect(new Set(CATALOG.map((node) => node.id))).toEqual(new Set(canonical.nodes.map((node) => node.id)));
    const existing = CATALOG.filter((node) => node.scope === 'existing_181_exterior_wrapper').map((node) => node.id);
    expect(existing).toHaveLength(181);
    expect(new Set(existing)).toEqual(new Set(ORDER));
    expect(FAMILIES).toHaveLength(62);
    expect(FAMILIES.flatMap((family) => family.nodeIds).sort()).toEqual(CATALOG.map((node) => node.id).sort());
    for (const family of FAMILIES) {
      expect(family.nodeIds.every((id) => catalogNode(id)?.familyId === family.id)).toBe(true);
    }
  });

  it('preserves source groups, all typed relations, and distinct depth, root, and foundation semantics', () => {
    expect(requiredOrder).toHaveLength(690);
    const levels = new Map<string, number>();
    const graphChildren = new Set<string>();
    let edges = 0;
    let any = 0;
    let roots = 0;
    for (const id of requiredOrder) {
      const node = catalogNode(id)!;
      const source = canonical.nodes.find((n) => n.id === id)!;
      const groups = source.prerequisite_groups.map((group) => {
        if ('all_of' in group && group.all_of) return { all: group.all_of };
        if ('any_of' in group && group.any_of) return { any: group.any_of };
        throw new Error(`${id}: unknown canonical group`);
      });
      expect(node.groups).toEqual(groups);
      expect(node.relations).toEqual(source.relations.map((relation) => ({ id: relation.id, type: relation.relation_type, strength: relation.strength })));
      expect(node.dynamic).toBe(source.dynamic_prerequisite_rule ?? null);
      expect(node.integrationOf).toEqual(source.integration_of ?? []);
      const direct = node.groups.flatMap((group) => {
        if ('all' in group) return group.all;
        any++;
        return group.any;
      });
      expect(new Set(node.requiredParents)).toEqual(new Set(direct));
      for (const parent of direct) {
        expect(levels.has(parent)).toBe(true);
        graphChildren.add(parent);
      }
      edges += new Set(direct).size;
      if (!direct.length) roots++;
      levels.set(id, Math.max(0, ...direct.map((parent) => levels.get(parent)! + 1)));
    }
    expect({ edges, roots, leaves: levels.size - graphChildren.size, any, depth: Math.max(...levels.values()) }).toEqual({
      edges: 859, roots: 93, leaves: 268, any: 12, depth: 14,
    });
    expect(CATALOG.filter((node) => node.isLeaf).map((node) => node.id).sort()).toEqual(requiredOrder.filter((id) => !graphChildren.has(id)).sort());
    expect(CATALOG.filter((node) => node.foundation)).toHaveLength(7);
    expect(CATALOG.filter((node) => node.dynamic)).toHaveLength(18);
    expect(CATALOG.filter((node) => node.integrationOf.length)).toHaveLength(66);
    expect(CATALOG.flatMap((node) => node.relations)).toHaveLength(1287);
    expect(graphCounts).toMatchObject({ required_edges: 859, max_required_depth: 14 });
  });

  it('uses one alternative without dropping independent required groups', () => {
    const knows = (...ids: string[]) => (id: string) => ids.includes(id);
    expect(canEnter('M-PCT-01', knows())).toBe(false);
    expect(canEnter('M-PCT-01', knows('M-FRAC-02'))).toBe(true);
    expect(canEnter('M-PCT-01', knows('M-DEC-02'))).toBe(true);
    expect(canEnter('M-ALG-08', knows('M-MULDIV-01'))).toBe(false);
    expect(canEnter('M-ALG-08', knows('M-ALG-07', 'M-MULDIV-01'))).toBe(true);
    expect(canEnter('M-ALG-08', knows('M-ALG-07', 'M-ADD-SUB-01'))).toBe(true);
    expect(catalogNode('M-TH-08')?.dynamic).toBe('requires_any_two_mastered_content_nodes');
    expect(canEnter('M-TH-08', knows())).toBe(true); // static groups only
    expect(catalogNode('missing')).toBeUndefined();
    expect(canEnter('missing', knows())).toBe(false);
    expect(requiredAncestors('missing')).toEqual([]);
  });

  it('keeps the chemistry relation cycle and operational safety separate from required ancestry', () => {
    const atom = catalogNode('CHEM79-ATOM-01')!;
    const element = catalogNode('CHEM79-ELEMENT')!;
    expect(atom.relations).toContainEqual({ id: element.id, type: 'prerequisite', strength: 'required' });
    expect(element.relations).toContainEqual({ id: atom.id, type: 'prerequisite', strength: 'strong' });
    expect(requiredAncestors(atom.id)).toContain(element.id);
    expect(requiredAncestors(element.id)).not.toContain(atom.id);
    expect(CATALOG.filter((node) => node.operationalGate).map((node) => node.id)).toEqual(['SCI-ENV-SAFE-01']);
    expect(CATALOG.flatMap((node) => node.relations.filter((r) => r.type === 'safety_gate'))).toHaveLength(15);
    expect(requiredAncestors('M-FRAC-13')).toEqual(expect.arrayContaining(['M-FRAC-07', 'M-FRAC-11']));
    expect(requiredAncestors('M-FRAC-13')).not.toContain('M-FRAC-13');
  });
});
