# PHY79-QTY-01 — exact frozen role and Lite alignment

```json
{
  "id": "PHY79-QTY-01",
  "subject": "physics",
  "grade_band": "7-9",
  "topic_area": "S1 Luonnontieteellinen tutkimus",
  "parent_concept": "Suureet ja yksiköt",
  "title": "Fysikaalisen suureen, lukuarvon ja yksikön erottaminen",
  "short_description": "Fysikaalisen suureen, lukuarvon ja yksikön erottaminen",
  "node_kind": "integration",
  "source_basis": "direct_curriculum",
  "curriculum_refs": [
    "PHY79-S1",
    "PHY79-ASSESS"
  ],
  "relations": [
    {
      "id": "PHY79-QTY-CONCEPT",
      "relation_type": "prerequisite",
      "strength": "required",
      "rationale": "PHY79-QTY-01 on v0.2:ssa integraationoodi; atominen alitaito PHY79-QTY-CONCEPT vaaditaan kokonaisuuden hallintaan."
    },
    {
      "id": "PHY79-NUMVALUE",
      "relation_type": "prerequisite",
      "strength": "required",
      "rationale": "PHY79-QTY-01 on v0.2:ssa integraationoodi; atominen alitaito PHY79-NUMVALUE vaaditaan kokonaisuuden hallintaan."
    },
    {
      "id": "PHY79-UNIT-CONCEPT",
      "relation_type": "prerequisite",
      "strength": "required",
      "rationale": "PHY79-QTY-01 on v0.2:ssa integraationoodi; atominen alitaito PHY79-UNIT-CONCEPT vaaditaan kokonaisuuden hallintaan."
    }
  ],
  "prerequisite_groups": [
    {
      "all_of": [
        "PHY79-QTY-CONCEPT",
        "PHY79-NUMVALUE",
        "PHY79-UNIT-CONCEPT"
      ],
      "rationale": "Integraationoodi saavutetaan, kun kaikki korkean varmuuden auditissa erotetut atomiset alitaidot hallitaan."
    }
  ],
  "evidence_notes": "v0.2-integraationoodi. Atomiset mastery-tilat: PHY79-QTY-CONCEPT, PHY79-NUMVALUE, PHY79-UNIT-CONCEPT. Lisäksi vaaditaan erillinen integraatio-/soveltamisnäyttö ennen täydellistä masteryä.",
  "foundation_entry": false,
  "zero_required_indegree": false,
  "status": "candidate_refactored_integration",
  "entry_role": "none",
  "mastery_role": "integration",
  "split_children": [
    "PHY79-QTY-CONCEPT",
    "PHY79-NUMVALUE",
    "PHY79-UNIT-CONCEPT"
  ],
  "integration_of": [
    "PHY79-QTY-CONCEPT",
    "PHY79-NUMVALUE",
    "PHY79-UNIT-CONCEPT"
  ],
  "dynamic_prerequisite_rule": null,
  "concept_path": [
    "Fysiikka",
    "S1 Luonnontieteellinen tutkimus",
    "Suureet ja yksiköt"
  ]
}
```

Graph SHA256 17eca8c1675ffe14aa3d6836e1ce7109020f440b22df09b7a7b15a8e95bb39fb. Role and all required/strong relationships retained; no new hard prerequisite or formal personal state.

## Actual inventory

physics.ts271–321 complete2demos sort/whole/which/transfer,hints/explanations;QTYS12–33;phyanim measure68–90/instrument context andparts206–250; audit940–946+overview137;families156 wildcard;indexexplicitgoal/auditrev noSIMS mapping;COVERAGE missingwhole+2nddemo stale.

sol-annotations GRAPH process and QTY integration exactcards read; annotation old deferred/existingrepair statuses do not authorize new formalgameprocesscredit. User author scope/GO separate; canonical690 exact roles authoritative.

Actual quantity families: sort places property/full number/unit, whole recognises a complete source result, which asks one part, transfer supplies speed(v), number and compoundunitm/s. Two actual demos: modeltemperature18°C and five-part speed expression. QTYS includes length/mass/time/temperature, with incidental decimals; no transfer speed arithmetic demanded. The authored form jointly constructs all3parts; separate exactsource and supplied equivalentwhole-record contracts prevent accepting just one correct part or an incoherent mix.

## Reconciliation (original Lite unchanged)

- Whole record must keep quantity, full numerical value, unit coherent; symbol and compound-unit transfer. Authored: Jointly construct all3 fields from a meaningful provided record; no isolated-one-field correct credit; exactsource mode and supplied alternative-expression mode clearly distinguished.
- Shape-based shortcuts(word=quantity,number=numerical,abbreviation=unit) and universal visibleunit requirement are overbroad. Authored: Visible context supplies letter roles and units; keep whole decimals; unit1 can be implicit, no blanketnominal-property/colourclaim.
- Recognising one complete sentence or placing given tokens does not prove free-form independent measurement-report construction or allatomicmastery. Authored: Say supported complete-record construction/repair, preserve3-childAND/integration; no newpersonalmastery or atomiccredit.

Teacher limits explicitly distinguish supported standalone practice from formal game process/rubric and integration/mastery credit. Existing legacy branches/canonical690/52/509 untouched. Native inputs support both semantic commits and explicit visible readback. Scope-local helpers preserve meaningful alternatives, finite values and dense answers; no broad semantic-choice framework introduced.

## Source SHA256

```json
{
  "src/content/physics.ts": "835ad69dd95f622adcb6050ab63d00a4477d64425545dd1b8af5a4892f978430",
  "src/content/phyanim.ts": "7c46f415d95d8f21a645cfda8140d472f07b5621c37c2b59ce58cd9ffa79a338",
  "src/content/kit.ts": "95a1ea48a8152caaca4a63c36a5d0a14e31a2bc51136e0535f320fec3da81bad",
  "src/content/families.ts": "b221e08f8c6bad3d559aae20eac57fa9de7704d3541b6a49f142047fbbec1903",
  "src/content/index.ts": "8f16c2b9948ae3652929092414c6694e6c9421a83e94052035d02dc3841896c8",
  "src/content/goals.ts": "732d66480e4ac3efae1f1eba38e9bc844db6707725bec7c4721777d8598f2e7e",
  "src/content/motionsims.ts": "18925da01c1a4e237a1381b51f49af9ec8ee46dffb0d86b598f413de6401d2ba",
  "src/engine/types.ts": "1691c1ec54ee12823d8b8dce2dd0f798d8b9a5b704658460d06796dd508bd533",
  "src/engine/check.ts": "f5e2838356d5bb41b695855ce40914b964b95f98e3e2b11795859b684ecc9f8f",
  "src/engine/graph.ts": "8bcdc3d7cafed82fd8d2a0a7dd69a547f2e70d6d2a87834f110164d4fe4b24d9",
  "src/engine/motion.ts": "7b2851bee0927ba383462ea8d24b7f2a8467c82b581fd519efdb4b4566365451",
  "src/ui/widgets.ts": "03720bd54cb408efb21fdaa0bb9a5cc80920a645c5c7f506d20859f265b5b5ed",
  "src/ui/motion.ts": "1a3598c501e33fda21af3b42e86d0ddfef91fc4d67de15754159eaa5f98f19cc",
  "src/ui/anim.ts": "f915fa142c7fa7da51d3ed98a197e0009c70639e6ee83efedb7baf2363ff6e95",
  "src/data/sol-annotations.json": "fb22d9fd48c774458b5241bacf76e16b2975974cf9b4c7eb2875ae861831c98d",
  "src/content/audit-rev.ts": "78a9737d2dbb5eb3b8aaa01fad9875c64f98cb3048b89b30030cb46b4aea644f",
  "audit/LESSON_AUDIT.md": "bc9979f2e5174f9c4039fbbd009d6d0cc341d59c451467e6d53c7e72299ee00b",
  "COVERAGE.md": "49b94c0a19a6b5ab747aec95a95f5b45b4247be8ded226725ace6156bea18427",
  "docs/PEDAGOGY_REFERENCES.md": "d18d901f2001a7c931ad72c55ce2921676234735bae83356b241d78841da4d1f"
}
```
