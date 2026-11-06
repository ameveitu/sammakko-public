# Canonical closure and activity-specific content coverage

**This package proposes a closed content scope. It does not implement or accept the game.** The original 107-node graph is a preserved baseline, not a numerical limit on the MVP. The candidate includes missing required and strong support content, together with source-reviewed skills used or co-taught by the existing task families, and then recursively includes their canonical parents.

The authoritative proposed membership and task-family mappings are in `mvp-scope.json`. `scope-report.json` and `closure-matrix.json` are reproducible structural reports. Their successful verification does not establish that every lesson is implemented, that every task dependency has been discovered, or that children and teachers have validated the experience. The recommended 177-node baseline is a documented proposal, not a numerical cap if implementation review reveals a further real dependency.

## What the canonical graph establishes

The existing 107 nodes contain all their hard teaching prerequisites, but leave 20 strong advisory relations and one required operational safety relation outside the slice. Recursively including those supports changes the content scope:

| Closure rule, always retaining the existing 107 | Result |
|---|---:|
| Required teaching prerequisites only | 107 |
| Required and strong relations whose type is `prerequisite` | 129 |
| Required and strong relations of every pedagogical type, excluding `safety_gate` | 140 |
| Required and strong relations of every type, including safety | 141 |
| Every incoming relation, regardless of type or strength | 141 |

These are exact results for the supplied canonical snapshot. The 141-node set contains every incoming canonical relation to its own members; its required-and-strong graph is acyclic. It includes process and representation support that the narrower 129-node interpretation omits. Starting from the original 52-node core also produces the same 140/141-node sets. The narrower prerequisite-only closure from 52 gives 123 and omits five nodes already present in Lite; it must not replace the preserved 107 baseline.

Including strong support means the content is available in the MVP. It does not change `strong` into `required`, force the learner to complete every support before exploring, or flatten an `any_of` group into an `all_of` gate. The candidate retains the original canonical node records, relation types, strengths, and prerequisite groups.

## Why activity coverage goes beyond 141

Static relation closure cannot determine every skill used by a generated question. Three original selected nodes have explicit dynamic prerequisite rules. The 141-node structural closure introduces two more, and the 177-node proposal adds the operation-dependent expression rule on `M-EXPR-01`, bringing the total to six. Current generators also use skills through response formats and co-taught activities without a dedicated dynamic-rule field.

The candidate therefore contains a separate `task_context_coverage` registry. Each mapping identifies `targetKCId`, `activityFamily`, `usesKCId`, the source-relative path, a concrete reason, and a role:

- `support`: the activity uses this skill to perform its main task.
- `co-taught`: the activity also teaches or exercises this content; its evidence should be attributed accordingly.
- `responseFormat`: the response or representation itself requires this skill, such as reading a data table.

These mappings add content coverage seeds before canonical closure. **They are not new global prerequisite edges.** For example, fraction addition already has fraction notation as a canonical prerequisite. If an existing fraction-notation activity co-teaches addition, record that co-taught coverage; do not add the reverse hard edge and create an artificial curriculum cycle.

Do not remove negative-number, decimal, table or fraction variants solely to preserve the old count of 107. Provide their needed instruction and support, and accurately describe what the activity observes. A meaningful lesson can still have a declared difficulty domain; domain choices should follow its learning objective rather than an arbitrary node-count cap.

## Explicit dynamic rules to preserve

Paths in this section are relative to the original Sammakko source root for canonical catalogs, and to the Lite project root for runtime code.

| KC | Exact canonical dynamic rule | Application |
|---|---|---|
| `M-UNIT-05` | `requires_multiplication_or_division_according_to_conversion_direction` | Bind a time-conversion instance to the operation its direction actually uses. |
| `M79-EQ1-SOLVE` | `requires_arithmetic_operations_present_in_equation_item` | Bind an equation instance to the actual arithmetic, including signed division when present. |
| `PHY79-UNIT-CONV` | `requires_quantity_specific_unit_conversion_skill_for_item_instance` | Bind each unit-conversion instance to the appropriate quantity, direction and number domain. |
| `M-REP-04` | `requires_relevant_content_symbol_knowledge` | Select a taught symbol vocabulary for the actual content context. |
| `M-TH-08` | `requires_any_two_mastered_content_nodes` | Name the two relevant content KCs used in the connection activity. Do not treat this process node as an unconditional foundation. |
| `M-EXPR-01` | `requires_operation_knowledge_for_operations_present_in_item` | Bind an expression instance to the actual operations it contains; inclusion of the general expression KC alone does not supply every possible arithmetic context. |

The first, fourth, fifth and sixth rules are in `baseline/Math_KC_Catalog_1_6_v0.4.yaml`; the equation rule is in `baseline/Math_KC_Catalog_7_9_v0.2.yaml`; the physics conversion rule is in `baseline/Physics_KC_Catalog_7_9_v0.2.yaml`.

### Time conversion

Lite `src/content/saari1.ts`, `M-UNIT-05`, contains whole-number hours/minutes/seconds/days, mixed hours/minutes and clock-time arithmetic. Multiplication and division are applicable by task direction. Merely including the operation KC IDs does not demonstrate that every numerical range or calculation method is adequately taught. Record instance requirements, teach the relevant arithmetic, and check clock notation and the 60-minute rollover separately.

### Equations and signed arithmetic

Lite `src/content/algebra79.ts`, `M79-EQ1-SOLVE`, samples negative solutions and constants in its `one` and `two` families. The declared domain can construct `2x - 1 = -9`, requiring `2x = -8` and then `x = -8 / 2`. This is an example derived from permitted parameters, not a recorded browser session.

`M79-INT-ADD` and `M79-INT-MUL` enter the structural closure. `M79-INT-DIV` does not enter through those static relations, so its inclusion is separately justified by this activity domain. Adding it and closing its canonical parents produces an intermediate 142-node scope, which still omits other observed task content. Do not present 142 as the final task-coverage answer.

### Conversions and decimal arithmetic

Lite `src/content/physics.ts`, `PHY79-UNIT-CONV`, contains decimal inputs such as 1.2 km, 0.8 km and 1.5 h, and decimal outputs such as 250 cm = 2.5 m. Other current conversion and motion families also use decimal arithmetic. The 141-node closure supplies decimal reading, writing, decomposition and place-value concepts, but these do not automatically cover every operation used by the generator.

The activity registry identifies the relevant decimal operation KCs and the concrete families that use them. Adding these operation seeds also brings their strong written-arithmetic support and its antecedents into scope. That expansion follows the requested required-and-strong availability rule; it is not a change to runtime gate strength or a requirement to force an expert through every written algorithm.

### Fractions, expressions and representations

Some existing tasks go beyond their primary KC label: a fraction-notation family may compare or add fractions, a function family may evaluate a symbolic expression, and a physics task may require reading a table. These need explicit content coverage or co-targeting. The registry distinguishes source-reviewed mappings from global canonical prerequisites. Its concrete entries are the proposed coverage seeds; they do not certify that all current or future item families have been exhaustively audited.

## Pedagogical roots and dynamic entries

A graph root is not automatically a pedagogical foundation. Preserve `entry_role`, `foundation_entry`, `zero_required_indegree`, `mastery_role`, and the dynamic-rule metadata. The structural closure contains canonical domain entries and process entries alongside true foundations.

For instance, `M-REP-04` needs symbols appropriate to its task context, and `M-TH-08` needs a selected pair of taught content skills. Other dynamic entries, such as classification, ordering, pattern recognition and data representation, need an explicitly accessible context. Choose that context from the proposed content set and record it at the activity level. Do not expand an existential rule such as “any two content nodes” into a requirement to complete all 690 nodes.

`scope-report.json` lists both hard-teaching roots and roots under the broader required-and-strong relation predicate, together with their canonical entry roles. It also lists selected foundation entries and any global foundations outside the chosen slice. An unrelated global foundation need not be added just because it exists elsewhere in the 690-node catalog.

## Safety is a separate operational relationship

Canonical `baseline/Science_KC_Foundation_1_6_v0.2.yaml` records `SCI-ENV-SAFE-01 -> SCI-ENV-TOOL-01` as a required `safety_gate`, explicitly described as a practical safety condition rather than a conceptual learning prerequisite. Its inclusion in the broader scope preserves that distinction.

The current instrument lesson in Lite `src/content/saari2.ts` uses on-screen choice and reasoning. Its reward currently claims the learner can choose and use an instrument; that claim should be limited to what the virtual decisions demonstrate. Virtual safety instruction is useful content, but it does not certify physical instrument use. If practical work is introduced, its actual operational conditions need an appropriate implementation and review.

## Reproduce the reference audit

From this directory:

```bash
python3 verify_scope.py --check-report scope-report.json --check-matrix closure-matrix.json
```

The verifier uses only Python's standard library and the supplied JSON files. It checks the frozen source hashes, preservation of the original 107 nodes, unchanged canonical node records, the exact closure of declared activity-coverage seeds, all required-and-strong canonical parent references, prerequisite-group references, typed relations, roots, components and cycles. Immediate parent closure over the complete selected set establishes transitive closure for the frozen static graph.

The verifier does not execute lesson generators or validate the completeness of the source-review mappings. “No uncovered activity dependencies” remains an implementation and review acceptance goal. It is not a passed result of this reference package.
