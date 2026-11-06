# Sammakko Lite: proposed closed MVP subgraph

**Recommendation: use the 177-node proposal as the initial MVP content scope.** It retains all 107 existing nodes, closes their required and strong canonical support relations, includes 11 concrete activity-coverage seeds found in the existing source, and closes the parents of those seeds. The result contains 70 additions to the original Lite selection: 34 from the structural dependency closure, 11 direct task-coverage seeds, and 25 further canonical ancestors of those seeds.

This is a **reference and planning package**, not an implemented game or a passed teaching review. The number 177 is a source-grounded baseline, not a cap: if implementation review finds another real activity dependency, document it and recompute the same closure rather than removing useful content to preserve the number.

## Verified structural findings

| Measure | Result |
|---|---:|
| Proposed nodes | 177 |
| Original Lite nodes retained | 107 |
| Additional nodes | 70 |
| Mathematics nodes | 145 |
| Physics nodes | 21 |
| Science nodes | 11 |
| Canonical prerequisite groups | 155 |
| Prerequisite-group member references | 231 |
| Canonical required/strong typed relations | 331 |
| External canonical relations, across every type and strength | 0 |
| Cycle components in required/strong canonical graph | 0 |
| Canonical foundation entries included | 7 |
| Explicit dynamic prerequisite rules | 6 |

The 331 relations are 231 required prerequisites, 77 strong prerequisites, 11 strong process-support relations, 11 strong representation-support relations, and one required operational safety gate. All are internal to the proposed set. Two canonical `any_of` groups remain intact: `M-ALG-08` accepts an additive or multiplicative equation route, and `M-DIVIS-01` accepts either listed division structure. Both alternative content routes are available in scope; this does not change their runtime OR semantics.

The canonical required-and-strong graph has two weak components: a 174-node main component and a three-node geometry/symmetry component (`M-GEO-01`, `M-GEO-04`, `M-SYM-01`). The existing coordinate reflection activity supplies the task-context connection to that geometry content. It is recorded as co-taught coverage rather than an invented canonical edge.

## Why 107, 129, 140, 141 and 142 are different scopes

| Selection rule | Starting from all 107 existing nodes | Starting from the original 52 core nodes | Meaning |
|---|---:|---:|---|
| Required teaching prerequisites only | 107 | 52 | The original 107 is hard-prerequisite closed, but strong support remains outside. |
| Required/strong `prerequisite` relations only | 129 | 123 | Omits strong process and representation support; the 52-seed version also loses 5 existing data nodes. |
| All required/strong pedagogical relation types, excluding safety | 140 | 140 | Closes pedagogical support; practical safety remains external. |
| All required/strong relation types, including safety | 141 | 141 | The recommended structural floor before activity-specific coverage. |
| All incoming canonical relations, any type/strength | 141 | 141 | Same set as 141 for this frozen baseline. |
| Structural closure plus signed-integer division | 142 | 142 | Addresses one equation-domain gap, but not the other observed current-task content. |
| Structural closure plus the 11 source-reviewed activity-coverage seeds | 177 | 177 (independently reproducible) | Recommended initial proposal; preserve all 107 and all canonical parents. |

The graph is an availability map for instruction and support. A strong relation must remain strong, not become an automatic learner lock. Keep the fast exploratory experience while recording what has been demonstrated, what is supported, and what is deferred.

## Eleven current-activity coverage seeds

These mappings are separate from the canonical dependency graph. A `support` mapping names a skill used by an activity, `co-taught` names additional content that the activity teaches or exercises, and `responseFormat` names a representational requirement. They add coverage seeds, not global hard-gate edges. In particular, do not create a reverse prerequisite from fraction addition/comparison back to the fraction-notation lesson that currently co-teaches it.

| Coverage KC | Title | Current target and family | Role | Source evidence |
|---|---|---|---|---|
| `M79-INT-DIV` | Kokonaislukujen jakolasku ja merkkisääntö | `M79-EQ1-SOLVE` / two (negative solutions) | support | `src/content/algebra79.ts`: 2x - 1 = -9; x = -8 / 2 = -4. |
| `M-DEC-08` | Desimaaliluvun kertominen luonnollisella luvulla | `PHY79-UNIT-CONV` / kmM, hMin | support | `src/content/physics.ts`: 0.8 km * 1000 = 800 m; 1.5 h * 60 = 90 min. |
| `M-DEC-09` | Desimaaliluvun jakaminen luonnollisella luvulla | `PHY79-UNIT-CONV` / cmM | support | `src/content/physics.ts`: 250 cm / 100 = 2.5 m; 75 cm / 100 = 0.75 m. |
| `M-DEC-ADD` | Desimaalilukujen yhteenlasku | `PHY79-SPEED-CALC` / transfer (ride plus stop) | support | `src/content/physics.ts`: 0.5 h + 0.5 h = 1 h. |
| `M79-DEC-DIV` | Desimaalilukujen jakolaskun syventäminen | `PHY79-SPEED-MIXED` / kmh | support | `src/content/physics.ts`: 18 / 3.6 = 5 m/s. |
| `M-FRAC-05` | Samannimisten murtolukujen vertaaminen | `M-FRAC-03` / same | co-taught | `src/content/saari2.ts`: Compare x/b with y/b for the same b. |
| `M-FRAC-11` | Samannimisten murtolukujen yhteenlasku | `M-FRAC-03` / transfer (two shares of a pie) | co-taught | `src/content/saari2.ts`: a/b + c/b = (a+c)/b. |
| `M-DATA-05` | Tiedon lukeminen yksinkertaisesta taulukosta | `PHY79-DATA-01` / transfer (read distance at a given time) | responseFormat | `src/content/physics.ts`: Read the distance corresponding to the row for k seconds. |
| `M79-EXPR-EVAL` | Lausekkeen arvon laskeminen muuttujan arvolla | `M79-FUNC-01` / run and transfer; related function-graph plot | support | `src/content/algebra79.ts`: f(x)=k*x+s: substitute a provided travel distance x and calculate the fare. |
| `M-SYM-01` | Peilaussymmetrian tunnistaminen suoran suhteen | `M-COORD-02` / transfer (axis reflection) | co-taught | `src/content/saari1.ts`: Reflect (x,y) to (-x,y) or (x,-y), maintaining equal distance from the axis. |
| `M-FRAC-08` | Murtoluvun supistaminen | `M79-FRAC-MUL` / demo (simplifying the product) | co-taught | `src/content/algebra79.ts`: 6/12 = 1/2. |

These are source-review findings tied to the supplied Lite source hashes in `mvp-scope.json`. The example `2x - 1 = -9` is derived from allowed generator parameters, not a recorded browser session. Fraction reduction enters because the existing demonstration explicitly shows `6/12 = 1/2`; this does not assert that its current answer checker requires simplified fractions.

General `M79-EXPR-SIMPLIFY` is a review note rather than an additional seed. The current equation family teaches the bounded balance operation of subtracting `cx` from both sides locally. That does not by itself justify adding the whole general simplification domain.

## Pedagogical roots and dynamic contexts

All seven canonical global foundation entries are in the proposed set: `M-GEO-01`, `M-GEO-02`, `M-MEAS-00`, `M-NUM-1TO1`, `M-NUM-STABLE-ORDER`, `M-TH-01`, `SCI-ENV-OBSERVE-01`. The geometry foundation enters through the source-reviewed reflection activity. No unrelated foundation was added merely to satisfy a numerical count.

There are 23 nodes with no hard teaching prerequisite: seven foundations, five domain entries, ten dynamic entries and one operational entry. Under the broader required-and-strong predicate there are nine graph roots: six foundations, two dynamic entries and one operational entry. `M-MEAS-00` remains a pedagogical foundation even though it has strong comparison support; graph indegree does not redefine its canonical entry role.

| Zero-hard-prerequisite entry | Canonical role | Title |
|---|---|---|
| `M-ALG-04` | domain_entry | Tuntemattoman suureen tai puuttuvan luvun käsitteen ymmärtäminen |
| `M-DATA-01` | domain_entry | Tiedon kerääminen määritellystä aiheesta |
| `M-DATA-03` | dynamic | Yksinkertaisen taulukon rakenteen ymmärtäminen |
| `M-FRAC-01` | domain_entry | Kokonaisen jakaminen yhtä suuriin osiin |
| `M-GEO-01` | foundation | Tason ja kolmiulotteisen ympäristön erottaminen |
| `M-GEO-02` | foundation | Sijaintikäsitteiden käyttäminen |
| `M-MEAS-00` | foundation | Mitattavien ominaisuuksien suora vertaaminen |
| `M-NUM-1TO1` | foundation | Yhden lukusanan kohdistaminen kuhunkin laskettavaan kohteeseen |
| `M-NUM-STABLE-ORDER` | foundation | Lukusanojen käyttäminen vakaassa järjestyksessä |
| `M-NUM-WORD-NUMERAL` | dynamic | Lukusanan yhdistäminen sitä vastaavaan numeromerkintään |
| `M-REP-04` | dynamic | Matemaattisen ajatuksen esittäminen symbolein ja merkinnöin |
| `M-TH-01` | foundation | Yhtäläisyyksien ja erojen havaitseminen |
| `M-TH-02` | dynamic | Kohteiden luokittelu annetun ominaisuuden mukaan |
| `M-TH-03` | dynamic | Kohteiden järjestäminen annetun ominaisuuden mukaan |
| `M-TH-04` | dynamic | Toistuvan tai muuttuvan säännönmukaisuuden havaitseminen |
| `M-TH-07` | dynamic | Vaihtoehtojen järjestelmällinen etsiminen |
| `M-TH-08` | dynamic | Kahden opitun matemaattisen asian välisen yhteyden tunnistaminen |
| `M-WORK-01` | dynamic | Matemaattisesti olennaisen havainnon tekeminen tilanteesta |
| `M79-DEP-01` | domain_entry | Kahden muuttuvan suureen riippuvuuden tunnistaminen |
| `M79-LOGIC-01` | dynamic | Säännön tai riippuvuuden löytäminen |
| `SCI-ENV-OBSERVE-01` | foundation | Havainnon tekeminen ilmiöstä tai kohteesta |
| `SCI-ENV-SAFE-01` | operational | Annettujen turvallisuusohjeiden noudattaminen |
| `SCI-ENV-TOOL-01` | domain_entry | Yksinkertaisen tutkimus- tai mittausvälineen käyttäminen |

The six explicit dynamic rules are:

| KC | Exact canonical rule |
|---|---|
| `M-EXPR-01` | `requires_operation_knowledge_for_operations_present_in_item` |
| `M-REP-04` | `requires_relevant_content_symbol_knowledge` |
| `M-TH-08` | `requires_any_two_mastered_content_nodes` |
| `M-UNIT-05` | `requires_multiplication_or_division_according_to_conversion_direction` |
| `M79-EQ1-SOLVE` | `requires_arithmetic_operations_present_in_equation_item` |
| `PHY79-UNIT-CONV` | `requires_quantity_specific_unit_conversion_skill_for_item_instance` |

Dynamic process entries still require a concrete taught context. `M-REP-04` must use relevant known symbols, and `M-TH-08` must name a suitable pair of taught content nodes. The operation-dependent rules must be bound to the actual generated instance. Do not interpret a dynamic root as evidence that a novice already knows every context, or interpret “any two” as requiring all 690 nodes.

The proposed roles are 132 atomic, 31 process, 13 integration and 1 operational nodes. These different roles should not all be forced into the same standalone auto-graded microgame format.

## Every addition has a source or dependency witness

`mvp-scope.json` stores a reason and one canonical witness path for every added node. A path is written from a dependent seed toward its required/strong parent; its individual relation types and strengths are retained in `witness_steps`. Direct activity seeds instead point to their source-reviewed activity mapping. These witness paths describe selection, not a proposed forced lesson sequence.

### 34 additions from closing the original graph

These cover nine number/arithmetic-support nodes, seven decimal-representation nodes, eight algebra/function-support nodes, nine data/process/representation nodes, and the operational safety node.

| Added KC | Title | Grade | Role | One selection witness |
|---|---|---|---|---|
| `M-ADD-SUB-01` | Yhteen- ja vähennyslaskun käänteinen yhteys | 1-2 | atomic | M79-EQ1-SOLVE → M-ALG-08 → M-ADD-SUB-01 |
| `M-ALG-07` | Ehdotetun ratkaisun testaaminen yhtälössä | 3-6 | atomic | M79-EQ1-SOLVE → M-ALG-08 → M-ALG-07 |
| `M-ALG-08` | Yksinkertaisen yhtälön ratkaiseminen päättelemällä | 3-6 | atomic | M79-EQ1-SOLVE → M-ALG-08 |
| `M-DATA-02` | Yksittäisten havaintojen tallentaminen | 1-2 | atomic | M-DATA-03 → M-DATA-02 |
| `M-DEC-01` | Kymmenesosan ymmärtäminen paikka-arvona | 3-6 | atomic | M-UNIT-01 → M-DEC-04 → M-DEC-DECOMPOSE → M-DEC-01 |
| `M-DEC-02` | Sadasosan ymmärtäminen paikka-arvona | 3-6 | atomic | M-UNIT-01 → M-DEC-04 → M-DEC-DECOMPOSE → M-DEC-02 |
| `M-DEC-03` | Tuhannesosan ymmärtäminen paikka-arvona | 3-6 | atomic | M-UNIT-01 → M-DEC-04 → M-DEC-DECOMPOSE → M-DEC-03 |
| `M-DEC-04` | Desimaaliluvun lukeminen, kirjoittaminen ja hajottaminen lukuyksiköihin | 3-6 | integration | M-UNIT-01 → M-DEC-04 |
| `M-DEC-DECOMPOSE` | Desimaaliluvun hajottaminen lukuyksiköihin | 3-6 | atomic | M-UNIT-01 → M-DEC-04 → M-DEC-DECOMPOSE |
| `M-DEC-READ` | Desimaaliluvun lukeminen | 3-6 | process | M-UNIT-01 → M-DEC-04 → M-DEC-READ |
| `M-DEC-WRITE` | Desimaaliluvun kirjoittaminen | 3-6 | process | M-UNIT-01 → M-DEC-04 → M-DEC-WRITE |
| `M-MULDIV-01` | Kerto- ja jakolaskun käänteinen yhteys | 1-2 | atomic | M79-EQ1-SOLVE → M-ALG-08 → M-MULDIV-01 |
| `M-NEG-03` | Negatiivisten kokonaislukujen vertaaminen ja järjestäminen | 3-6 | atomic | M79-INT-DIST → M-NEG-03 |
| `M-NUM-08` | Lukujonon jatkaminen taaksepäin | 1-2 | atomic | M-NEG-01 → M-NUM-08 |
| `M-NUM-10` | Kahden luonnollisen luvun suuruuden vertaaminen | 1-2 | atomic | M79-INT-DIST → M-NEG-03 → M-NUM-10 |
| `M-NUM-17` | Lukumäärän puolittaminen kahteen yhtä suureen osaan | 1-2 | atomic | M-DIV-01 → M-NUM-17 |
| `M-NUM-18` | Lukujen 1–10 hajotelmien ymmärtäminen | 1-2 | atomic | M-PLACE-01 → M-NUM-18 |
| `M-REP-04` | Matemaattisen ajatuksen esittäminen symbolein ja merkinnöin | 1-6 | process | M-FRAC-03 → M-REP-04 |
| `M-TH-02` | Kohteiden luokittelu annetun ominaisuuden mukaan | 1-6 | process | M-DATA-09 → M-TH-07 → M-TH-02 |
| `M-TH-03` | Kohteiden järjestäminen annetun ominaisuuden mukaan | 1-6 | process | M-DATA-09 → M-TH-07 → M-TH-03 |
| `M-TH-04` | Toistuvan tai muuttuvan säännönmukaisuuden havaitseminen | 1-6 | process | M79-DEP-01 → M79-LOGIC-01 → M-TH-04 |
| `M-TH-07` | Vaihtoehtojen järjestelmällinen etsiminen | 3-6 | process | M-DATA-09 → M-TH-07 |
| `M-TH-08` | Kahden opitun matemaattisen asian välisen yhteyden tunnistaminen | 3-6 | process | M79-DEP-01 → M79-LOGIC-01 → M-TH-08 |
| `M-WORK-01` | Matemaattisesti olennaisen havainnon tekeminen tilanteesta | 1-6 | process | M-DATA-01 → M-WORK-01 |
| `M79-EQ1-FORM` | Ensimmäisen asteen yhtälön muodostaminen tilanteesta | 7-9 | process | M79-EQ1-SOLVE → M79-EQ1-FORM |
| `M79-EXPR-FORM` | Lausekkeen muodostaminen sanallisesta tilanteesta | 7-9 | process | M79-EQ1-SOLVE → M79-EQ1-FORM → M79-EXPR-FORM |
| `M79-FUNC-TABLE` | Funktion esittäminen arvotaulukkona | 7-9 | process | M79-FUNC-GRAPH → M79-FUNC-TABLE |
| `M79-INT-ADD` | Kokonaislukujen yhteenlasku | 7-9 | atomic | M79-EQ1-SOLVE → M79-INT-ADD |
| `M79-INT-MUL` | Kokonaislukujen kertolasku ja merkkisääntö | 7-9 | atomic | M79-EQ1-SOLVE → M79-INT-MUL |
| `M79-LOGIC-01` | Säännön tai riippuvuuden löytäminen | 7-9 | process | M79-DEP-01 → M79-LOGIC-01 |
| `M79-VAR-01` | Muuttujan käsite muuttuvana tai tuntemattomana lukuna | 7-9 | integration | M79-DEP-01 → M79-VAR-01 |
| `M79-VAR-UNKNOWN` | Muuttujan ymmärtäminen tuntemattomana lukuna | 7-9 | atomic | M79-DEP-01 → M79-VAR-01 → M79-VAR-UNKNOWN |
| `M79-VAR-VARYING` | Muuttujan ymmärtäminen muuttuvana suureena | 7-9 | atomic | M79-DEP-01 → M79-VAR-01 → M79-VAR-VARYING |
| `SCI-ENV-SAFE-01` | Annettujen turvallisuusohjeiden noudattaminen | 1-2 | operational | SCI-ENV-TOOL-01 → SCI-ENV-SAFE-01 |

### 25 additional canonical ancestors of the activity seeds

The 11 direct activity seeds are listed above. These 25 further nodes enter because the requested required-and-strong closure also includes their parents. For example, decimal operations bring their strong written-arithmetic support, and reflection brings elementary line and geometry concepts.

| Added KC | Title | Grade | Role | One selection witness |
|---|---|---|---|---|
| `M-ADD-100` | Yhteenlasku lukualueella 0–100 | 1-2 | atomic | M-DEC-ADD → M-WRADD → M-ADD-100 |
| `M-ADD-20` | Yhteenlasku lukualueella 0–20 | 1-2 | atomic | M-DEC-ADD → M-WRADD → M-ADD-100 → M-ADD-20 |
| `M-ADD-FACT-01` | Yhteen- ja vähennyslaskun perusfaktat lukualueella 0–10 | 1-2 | integration | M-DEC-ADD → M-WRADD → M-ADD-100 → M-ADD-20 → M-ADD-FACT-01 |
| `M-ADD-FACT-10` | Yhteenlaskun perusfaktat lukualueella 0–10 | 1-2 | atomic | M-DEC-ADD → M-WRADD → M-ADD-100 → M-ADD-20 → M-ADD-FACT-01 → M-ADD-FACT-10 |
| `M-DIV-FACT-01` | Helpon jakolaskun ratkaiseminen kertotaulun avulla | 1-2 | atomic | M79-EXPR-EVAL → M-EXPR-01 → M-DIV-FACT-01 |
| `M-DIVIS-01` | Jaollisuuden käsitteen ymmärtäminen | 3-6 | atomic | M-FRAC-08 → M-DIVIS-01 |
| `M-EXPR-01` | Useita laskutoimituksia sisältävän lausekkeen tulkitseminen | 3-6 | atomic | M79-EXPR-EVAL → M-EXPR-01 |
| `M-FRAC-06` | Samansuuruisten murtolukujen tunnistaminen | 3-6 | atomic | M-FRAC-08 → M-FRAC-06 |
| `M-GEO-01` | Tason ja kolmiulotteisen ympäristön erottaminen | 1-2 | atomic | M-SYM-01 → M-GEO-04 → M-GEO-01 |
| `M-GEO-04` | Tasokuvion tunnistaminen | 1-2 | atomic | M-SYM-01 → M-GEO-04 |
| `M-MENTAL-01` | Luvun hajottaminen laskemista helpottavaan muotoon | 1-2 | atomic | M-DEC-ADD → M-WRADD → M-ADD-100 → M-MENTAL-01 |
| `M-MUL-02` | Kertolaskutilanteen kirjoittaminen kertolaskulausekkeeksi | 1-2 | atomic | M79-EXPR-EVAL → M-EXPR-01 → M-MUL-02 |
| `M-MULTAB-ALL` | Kertotaulujen 1–10 sujuva hallinta | 3-6 | atomic | M-DEC-08 → M-WRMUL → M-MULTAB-ALL |
| `M-MULTAB-HIGH` | Kertotaulufaktat 6–9 | 3-6 | atomic | M-DEC-08 → M-WRMUL → M-MULTAB-ALL → M-MULTAB-HIGH |
| `M-MULTAB-LOW` | Kertotaulufaktat 1–5 ja 10 | 1-2 | atomic | M-DEC-08 → M-WRMUL → M-MULTAB-ALL → M-MULTAB-LOW |
| `M-PLACE-05` | Luonnollisen luvun hajottaminen lukuyksiköihin | 3-6 | atomic | M-DEC-08 → M-WRMUL → M-PLACE-05 |
| `M-SUB-100` | Vähennyslasku lukualueella 0–100 | 1-2 | atomic | M-DEC-ADD → M-WRSUB → M-SUB-100 |
| `M-SUB-20` | Vähennyslasku lukualueella 0–20 | 1-2 | atomic | M-DEC-ADD → M-WRSUB → M-SUB-100 → M-SUB-20 |
| `M-SUB-FACT-10` | Vähennyslaskun perusfaktat lukualueella 0–10 | 1-2 | atomic | M-DEC-ADD → M-WRADD → M-ADD-100 → M-ADD-20 → M-ADD-FACT-01 → M-SUB-FACT-10 |
| `M-WRADD` | Kirjallinen yhteenlaskualgoritmi | 3-6 | atomic | M-DEC-ADD → M-WRADD |
| `M-WRDIV` | Lukuyksiköittäin jakaminen | 3-6 | atomic | M-DEC-09 → M-WRDIV |
| `M-WRMUL` | Kirjallinen kertolaskualgoritmi | 3-6 | atomic | M-DEC-08 → M-WRMUL |
| `M-WRSUB` | Kirjallinen vähennyslaskualgoritmi | 3-6 | atomic | M-DEC-ADD → M-WRSUB |
| `M79-FRAC-DIV` | Murtoluvun jakaminen murtoluvulla | 7-9 | atomic | M79-DEC-DIV → M79-FRAC-DIV |
| `M79-RECIP-01` | Käänteisluvun käsite | 7-9 | atomic | M79-DEC-DIV → M79-FRAC-DIV → M79-RECIP-01 |

## Safety and practical competence

`SCI-ENV-SAFE-01` is an operational node with no parent relations or prerequisite groups. Its required edge to `SCI-ENV-TOOL-01` is a practical `safety_gate`, not a conceptual prerequisite. Including it makes the scope explicit; it does not convert virtual instrument-choice performance into physical-use certification. Review the existing tool lesson reward against what the learner actually does.

## Source binding and reproduction

Canonical source commit, as recorded in the supplied sealed-review manifest: `d547e9ebfbd8ca1737abe40be34e9ace53ea773e`. Git history was absent from the extracted archive. All five original catalog byte hashes were independently matched against that supplied manifest during conversion; JSON node values were checked against the parsed source records. YAML comments and presentation formatting are not represented.

| Input | SHA-256 |
|---|---|
| `lite-107-graph.json` | `3dc534b392ad51ec1215f3b5621a843b4264a0eae9bc9035cfb6b0fb5324033d` |
| `canonical-690-graph.json` | `17eca8c1675ffe14aa3d6836e1ce7109020f440b22df09b7a7b15a8e95bb39fb` |
| `mvp-scope.json` | `58f7ca8bb7868dde2a4e4189259871e83d18681510f7841dad22e4eae2114ab8` |

Original canonical catalog paths:

- `baseline/Math_KC_Catalog_1_6_v0.4.yaml` — 266 nodes; original source byte hash and metadata retained in the canonical reference.
- `baseline/Math_KC_Catalog_7_9_v0.2.yaml` — 173 nodes; original source byte hash and metadata retained in the canonical reference.
- `baseline/Science_KC_Foundation_1_6_v0.2.yaml` — 63 nodes; original source byte hash and metadata retained in the canonical reference.
- `baseline/Physics_KC_Catalog_7_9_v0.2.yaml` — 95 nodes; original source byte hash and metadata retained in the canonical reference.
- `baseline/Chemistry_KC_Catalog_7_9_v0.2.yaml` — 93 nodes; original source byte hash and metadata retained in the canonical reference.

From this reference directory:

```bash
python3 verify_scope.py --check-report scope-report.json --check-matrix closure-matrix.json
```

The verifier uses only Python’s standard library. It checks the frozen JSON bytes, preservation of the 107 baseline, exact canonical node records, the declared coverage seeds and their complete canonical required/strong closure, group references, roots, relation counts and cycles. Its reference-structure result is **VERIFIED**. It does not run the game or assess children.

## What remains an acceptance goal

| Item | Status in this package |
|---|---|
| Exact proposed membership and static canonical closure | Verified for the frozen supplied data |
| Recorded current-source coverage seeds and witnesses | Provided as an explicit source-review proposal |
| No uncovered dependencies in every admitted activity instance | Future implementation/review acceptance goal; not established by the verifier |
| Playable lessons and appropriate role-specific activity routes for all proposed nodes | Not implemented by this package |
| Generator correctness, accessible interaction and honest evidence claims | Separate implementation and validation work |
| Student, teacher and parent feedback; teaching effectiveness | Not collected or established by this package |

Use `mvp-nodes.csv` for a complete 177-row inventory, `mvp-scope.json` for all canonical node records and per-addition reasons, `closure-matrix.json` for every computed comparison set, and `DYNAMIC_DOMAIN_NOTES.md` for the activity-context interpretation.
