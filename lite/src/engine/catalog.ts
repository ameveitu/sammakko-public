import data from '../data/journey-catalog.json';

export type PrerequisiteGroup = { all: string[] } | { any: string[] };
export interface CatalogNode {
  id: string;
  title: string;
  familyId: string;
  sceneTitle: string;
  story: string;
  action: string;
  success: string;
  transfer: string;
  representation: '2d_living_painting' | '3d_archipelago';
  scope: 'existing_181_exterior_wrapper' | 'new_509_content';
  requiredParents: string[];
  isLeaf: boolean;
  groups: PrerequisiteGroup[];
  relations: { id: string; type: string; strength: string }[];
  foundation: boolean;
  operationalGate: boolean;
  /** Item/context-specific rule. Its presence does not imply readiness. */
  dynamic: string | null;
  integrationOf: string[];
  storyParents: string[];
  eventId: string;
  effectId: string;
}

export interface CatalogFamily {
  id: string;
  title: string;
  theme: string;
  description: string;
  nodeIds: string[];
}

export const CATALOG: readonly CatalogNode[] = data.nodes as CatalogNode[];
export const FAMILIES: readonly CatalogFamily[] = data.families;
export const requiredOrder: readonly string[] = data.order;
export const graphCounts = Object.freeze(data.counts);
export const catalogHashes = Object.freeze({ canonical: data.canonicalSha, story: data.storySha });

const byId = new Map(CATALOG.map((node) => [node.id, node]));

export const catalogNode = (id: string): CatalogNode | undefined => byId.get(id);

/** Checks the static all/any groups only. Item-dependent readiness is a separate decision. */
export function canEnter(id: string, known: (id: string) => boolean): boolean {
  const node = catalogNode(id);
  return !!node && node.groups.every((group) => 'all' in group ? group.all.every(known) : group.any.some(known));
}

/** All possible required ancestors, in required-DAG order, including any-of alternatives.
 * Membership does not say which alternative the learner used or whether its event happened. */
export function requiredAncestors(id: string): string[] {
  const found = new Set<string>();
  const visit = (child: string) => {
    for (const parent of catalogNode(child)?.requiredParents ?? []) {
      if (found.has(parent)) continue;
      found.add(parent);
      visit(parent);
    }
  };
  visit(id);
  return requiredOrder.filter((candidate) => found.has(candidate));
}
