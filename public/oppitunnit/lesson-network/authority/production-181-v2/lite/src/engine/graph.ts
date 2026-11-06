import data from '../data/graph.json';

/** One node of the frozen 177-node MVP manifest (see tools/build-graph.mjs). */
export interface KC {
  id: string;
  title: string;
  subject: string;
  grade: string;
  kind: string;
  role: string | null;
  /** foundation / support / content ... (manifest entry_role) */
  entry: string | null;
  /** Lowest entry point of the subgraph (manifest foundation_entry). */
  foundation: boolean;
  /** Item-dependent prerequisite rule, or null. */
  dynamic: string | null;
  /** Required prerequisite groups: every `all` member, at least one `any` member. */
  groups: ({ all: string[] } | { any: string[] })[];
  /** Ids of strong relations of any type: content that must exist, never a lock. */
  soft: string[];
  /** Every typed relation to another node (incoming: `id` is the source). */
  rel: { id: string; type: string; strength: string }[];
  curriculum: string[];
  /** One of the 107 nodes of the earlier Lite build. */
  original: boolean;
}

export interface Coverage { target: string; uses: string; role: string; family: string; reason: string; example: string }
export interface Addition { id: string; type: string; reason: string; witness: string[] }

export const KCS: KC[] = data.nodes as KC[];
export const ORDER: string[] = data.order;
export const GRAPH_SHA: string = data.sha256;
export const MANIFEST = data.manifest;
export const COVERAGE: Coverage[] = data.coverage as Coverage[];
export const ADDITIONS: Addition[] = data.additions as Addition[];
const byId = new Map(KCS.map((k) => [k.id, k]));

export function kc(id: string): KC {
  const k = byId.get(id);
  if (!k) throw new Error(`Unknown KC ${id}`);
  return k;
}

/** Required prerequisites as written in the graph (all_of / any_of groups). */
export function isUnlocked(id: string, known: (id: string) => boolean): boolean {
  return kc(id).groups.every((g) => ('all' in g ? g.all.every(known) : g.any.some(known)));
}

/** Direct required prerequisite ids (union of all groups). */
export function requiredOf(id: string): string[] {
  return [...new Set(kc(id).groups.flatMap((g) => ('all' in g ? g.all : g.any)))];
}

/** Direct prerequisites from all_of groups only: the ones a later success really implies. */
export function allOf(id: string): string[] {
  return [...new Set(kc(id).groups.flatMap((g) => ('all' in g ? g.all : [])))];
}

/** Safety gate relations (never inferred, never a lesson lock). */
export const safetyOf = (id: string) => kc(id).rel.filter((r) => r.type === 'safety_gate').map((r) => r.id);

const deps = new Map<string, string[]>(ORDER.map((id) => [id, []]));
for (const k of KCS) for (const p of requiredOf(k.id)) deps.get(p)!.push(k.id);
const allDeps = new Map<string, string[]>(ORDER.map((id) => [id, []]));
for (const k of KCS) for (const p of allOf(k.id)) allDeps.get(p)!.push(k.id);

/** Nodes that list this one as a required prerequisite. */
export const dependents = (id: string): string[] => deps.get(id) ?? [];

/** All nodes that (transitively) require this one through any required group. */
export function descendants(id: string): string[] {
  const seen = new Set<string>();
  const walk = (x: string) => { for (const d of dependents(x)) if (!seen.has(d)) { seen.add(d); walk(d); } };
  walk(id);
  return ORDER.filter((x) => seen.has(x));
}

/** Nodes that need this one through all_of groups only, transitively. Inference runs on these. */
export function allOfDescendants(id: string): string[] {
  const seen = new Set<string>();
  const walk = (x: string) => { for (const d of allDeps.get(x) ?? []) if (!seen.has(d)) { seen.add(d); walk(d); } };
  walk(id);
  return ORDER.filter((x) => seen.has(x));
}

/** All required ancestors of a node, in topological order. */
export function ancestors(id: string): string[] {
  const seen = new Set<string>();
  const walk = (x: string) => {
    for (const p of requiredOf(x)) if (!seen.has(p)) { seen.add(p); walk(p); }
  };
  walk(id);
  return ORDER.filter((x) => seen.has(x));
}
