# PHY79-GRAPH-01 — exact frozen role and Lite alignment

```json
{
  "id": "PHY79-GRAPH-01",
  "subject": "physics",
  "grade_band": "7-9",
  "topic_area": "S1 Luonnontieteellinen tutkimus",
  "parent_concept": "Kuvaaja",
  "title": "Mittaustulosten esittäminen kuvaajana",
  "short_description": "Mittaustulosten esittäminen kuvaajana",
  "node_kind": "representation",
  "source_basis": "direct_curriculum",
  "curriculum_refs": [
    "PHY79-S1"
  ],
  "relations": [
    {
      "id": "PHY79-DATA-01",
      "relation_type": "prerequisite",
      "strength": "required",
      "rationale": "PHY79-DATA-01 on ydinesitieto tälle osaamiskohteelle."
    },
    {
      "id": "M79-FUNC-GRAPH",
      "relation_type": "representation_support",
      "strength": "strong",
      "rationale": "M79-FUNC-GRAPH tukee olennaisesti tätä osaamiskohdetta, mutta ei ole globaali hard gate."
    }
  ],
  "prerequisite_groups": [
    {
      "all_of": [
        "PHY79-DATA-01"
      ],
      "rationale": "Kaikki listatut ydinesitiedot tarvitaan."
    }
  ],
  "evidence_notes": "Ehdokasnoodi; arviointinäyttö ja virhekäsitykset täsmennetään sisältösuunnittelussa.",
  "foundation_entry": false,
  "zero_required_indegree": false,
  "status": "candidate",
  "entry_role": "none",
  "mastery_role": "process",
  "concept_path": [
    "Fysiikka",
    "S1 Luonnontieteellinen tutkimus",
    "Kuvaaja"
  ]
}
```

Graph SHA256 17eca8c1675ffe14aa3d6836e1ce7109020f440b22df09b7a7b15a8e95bb39fb. Role and all required/strong relationships retained; no new hard prerequisite or formal personal state.

## Actual inventory

physics.ts590–635 complete2demos plot/pick/rows/transfer,hints/explanations;ST77;phyanim plotDataScene643–692;kit chart113–139;enginecheck74–91;widgetsplot332–390;motionsims155–164 actualsim;ui motion graph106–130/player126–211;indexsharedSIM_SHARE.6/.35/.5/0;families exactGRAPH absent/default and scopeoverlay inspected; audit1172–1174+overview167;COVERAGE missingrows/2nddemo.

sol-annotations GRAPH process and QTY integration exactcards read; annotation old deferred/existingrepair statuses do not authorize new formalgameprocesscredit. User author scope/GO separate; canonical690 exact roles authoritative.

Actual graph families: plot constructs from table pairs on given axes; pick recognises matching complete graph; rows assigns coordinate directions; transfer explicitly requires time-horizontal; shared sim asks for one numeric ordinate while track/table/graph share time. The authored work area preserves concepts but requires actual editable coordinate construction plus chosen labels. A small fixed set of meaningful datasets replaces random infinite drilling, not the standalone process with a quiz. No source/movie watching gate.

## Reconciliation (original Lite unchanged)

- One source-table row corresponds to a plotted coordinate pair; labels/units and equal numeric scales matter. Authored: Construct actual points in own work area; explicit time-on-horizontal premise for this exercise; alternate consistent scales/point orders preserve correctness.
- Lite table/chart workedanimation and numeric motionoverlay. Authored: Distinguish watching/reading one value from constructing complete graph; recordonly supported construction evidence, no formalprocess or physicalclaim.
- Kit chart automatically connects each point in list order; arbitrary measurements do not justify interpolation or connecting unsortedrows. Authored: Points only by default. Optional connecting model clearly stated separately, no new unmeasured points described as observations.
- plotDataScene uses side-by-side table/grid and9px tickfont, cramped atphone widths. Authored: Stack source table and chart; readable sparse ticks/axislabels at320, originalSVG with testablegeometry. No blind reproduction.
- Legacy plot checker deduplicates response points withSet; UIMap prevents duplicateclickpoints but exported duplicate lists may conceal extraresponses. Authored: Strict dense finite complete points with unique valid IDs and an explicit policy for repeated measurements; no vacuous/sparse or unrequested extras acceptance.

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
