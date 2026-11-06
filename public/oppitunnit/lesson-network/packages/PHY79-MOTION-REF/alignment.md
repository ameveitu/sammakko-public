# PHY79-MOTION-REF — exact Lite/canonical alignment

## Frozen boundary

```json
{
  "id": "PHY79-MOTION-REF",
  "subject": "physics",
  "grade_band": "7-9",
  "topic_area": "S5 Vuorovaikutus ja liike",
  "parent_concept": "Liike",
  "title": "Liikkeen kuvaaminen suhteessa valittuun tarkastelukohteeseen",
  "short_description": "Liikkeen kuvaaminen suhteessa valittuun tarkastelukohteeseen",
  "node_kind": "concept",
  "source_basis": "direct_curriculum",
  "curriculum_refs": [
    "PHY79-S5"
  ],
  "relations": [
    {
      "id": "ENV-PHY-MOTION-01",
      "relation_type": "prerequisite",
      "strength": "required",
      "rationale": "ENV-PHY-MOTION-01 on ydinesitieto tälle osaamiskohteelle."
    }
  ],
  "prerequisite_groups": [
    {
      "all_of": [
        "ENV-PHY-MOTION-01"
      ],
      "rationale": "Kaikki listatut ydinesitiedot tarvitaan."
    }
  ],
  "evidence_notes": "Ehdokasnoodi; arviointinäyttö ja virhekäsitykset täsmennetään sisältösuunnittelussa.",
  "foundation_entry": false,
  "zero_required_indegree": false,
  "status": "candidate",
  "entry_role": "none",
  "mastery_role": "atomic",
  "concept_path": [
    "Fysiikka",
    "S5 Vuorovaikutus ja liike",
    "Liike"
  ]
}
```

Graph SHA256 17eca8c1675ffe14aa3d6836e1ce7109020f440b22df09b7a7b15a8e95bb39fb. Sole required ENV-PHY-MOTION-01 parent; no additional unit, negative-number, velocity or graph gate. Atomic conceptual role; no formal mastery engine.

## Actual source inventory

- physics.ts349–392 complete NodeSpec goal, intro, reward,2 demos, boat/train/walk/sort and transfer; actual audit1-2026-10-28 overrides stale COVERAGE motion1
- physics.ts45–54 full8 REF_SORT items/feedback;phyanim.ts320–372 full refScene;motionsims.ts86–95 shared sim generator
- index.ts1–55 actual sim share .6/.35/.5/0 (comment retrieval disagreement);families.ts exact target absent, generic/default metadata inherited;goals.ts40 fallback not chosen because explicit goal
- engine/motion.ts Run/Clock/frameAt andui/motion.ts configuration/track/landmark/player input/replay/hide/disposal, targeted0..211
- LESSON_AUDIT.md165 targetrow and963–966 full prior critique/correction/claimedchecks (not independently revalidated Lite browser);COVERAGE51/239/634–638 stale demo1/omittedsort
- PEDAGOGY_REFERENCES.md43–66 physics cluster references/limits; no efficacy or child-validation inference

Actual NodeSpec has boat (passenger vs boat/shore), train (seat/station), walk (moving walker on docked vessel), sort (8 explicit pairs), transfer (parallel equal-speed same-direction boats); shared sim overlays a side-by-side swimmer/boat scenario. Full hints, explanations, wrong-choice messages read. Source-specific rev audit1-2026-10-28 wins over stale motion1 COVERAGE.

## Reconciliation — original Lite remains unchanged

**Distance from one point is not a general test for no motion; direction/location can change at fixed radius.** Define motion as change of relative position; linear examples may use increasing/decreasing gaps. Optional teacher/advanced circle counterexample, no vector formalism gate.

**refScene camera switch resets run and world offsets; metre badges not derived consistently from original geometry.** One deterministic world event/time for all camera views. Same full relative positions translated by chosen reference, uniform scale. No inherited unsupported metre labels or fake distance readouts.

**Shared sim landmark4 lies ahead of0→8 or16 run, so claimed continually increasing distance is false before passing.** State place changes rather than universally increasing distance; if distance example used place reference behind or make approaching/passing explicit.

**REF_SORT loose oar is called stationary because it is in the boat, but rowing/moving oar would not be.** Use explicitly fixed mast/seat, identify conditions; not blanket everything on vehicle stationary.

**COVERAGE demo count1 and missing sort disagree actual NodeSpec2 demos+sort.** Inventory actual source, retain true5base families+sim.

New lesson retains each family concept: observed seated passenger/ref switch; optional train transfer; observed walker/docked carrier; joint two-row report in place of a large sort quiz; observed parallel boats as both second explained example and selectable transfer. The two report rows concern the same chosen reference, not separate pairwise credit. No KC-specific legacy-game semantic-choice branch or parser change. Models use fixed mast rather than ambiguous loose oar.

Three original deterministic situations share one event clock and two translating views. Changing camera preserves time and pairwise geometry. Whole-event answers stay valid under replay/guide/steps; visible response/reference/scenario semantic edits retire feedback. Both native commit types supported. All valid row permutations accepted; malformed/empty/sparse/extra rows, duplicate/unsupported IDs or nonboolean reports cannot earn credit. Direct known answer permitted, no per-object taps, naming or speech confirmation.

No invented physical/learner observations, independence or efficacy. Actual controls provide bounded guided conceptual practice; teacher physical evidence and independent/human review are separate. Other packages, graph,690/52/509 and legacy runtime not mutated.

## Read-source SHA256

```json
{
  "src/content/physics.ts": "835ad69dd95f622adcb6050ab63d00a4477d64425545dd1b8af5a4892f978430",
  "src/content/phyanim.ts": "7c46f415d95d8f21a645cfda8140d472f07b5621c37c2b59ce58cd9ffa79a338",
  "src/content/motionsims.ts": "18925da01c1a4e237a1381b51f49af9ec8ee46dffb0d86b598f413de6401d2ba",
  "src/content/index.ts": "8f16c2b9948ae3652929092414c6694e6c9421a83e94052035d02dc3841896c8",
  "src/content/families.ts": "b221e08f8c6bad3d559aae20eac57fa9de7704d3541b6a49f142047fbbec1903",
  "src/content/goals.ts": "732d66480e4ac3efae1f1eba38e9bc844db6707725bec7c4721777d8598f2e7e",
  "src/content/kit.ts": "95a1ea48a8152caaca4a63c36a5d0a14e31a2bc51136e0535f320fec3da81bad",
  "src/engine/types.ts": "1691c1ec54ee12823d8b8dce2dd0f798d8b9a5b704658460d06796dd508bd533",
  "src/engine/motion.ts": "7b2851bee0927ba383462ea8d24b7f2a8467c82b581fd519efdb4b4566365451",
  "src/ui/motion.ts": "1a3598c501e33fda21af3b42e86d0ddfef91fc4d67de15754159eaa5f98f19cc",
  "src/ui/anim.ts": "f915fa142c7fa7da51d3ed98a197e0009c70639e6ee83efedb7baf2363ff6e95",
  "src/content/audit-rev.ts": "78a9737d2dbb5eb3b8aaa01fad9875c64f98cb3048b89b30030cb46b4aea644f",
  "audit/LESSON_AUDIT.md": "bc9979f2e5174f9c4039fbbd009d6d0cc341d59c451467e6d53c7e72299ee00b",
  "COVERAGE.md": "49b94c0a19a6b5ab747aec95a95f5b45b4247be8ded226725ace6156bea18427",
  "docs/PEDAGOGY_REFERENCES.md": "d18d901f2001a7c931ad72c55ce2921676234735bae83356b241d78841da4d1f"
}
```
