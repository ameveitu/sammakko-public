# M-MEAS-06 — actual Lite inventory and reconciliation

{
  "sourceFile": "authority/production-181-v2/lite/src/content/ranta2.ts",
  "nodeRevision": "audit1-2026-10-28",
  "validRevs": [
    "audit1-2026-10-28"
  ],
  "sourceBuild": "lite181-2026-10-27",
  "phaseRule": "cases: all named branches in guided/independent/retrieval, dedicated transfer; no guidedTags restriction",
  "registry": "index fills GOALS; none of assigned IDs in SIMS, no motion overlay. No own DECL or graph.coverage rows; family kind outcomes use defaults. Dynamic rule null.",
  "auditLimit": "Historical synthetic technical author reports only; no approval/efficacy implied. COVERAGE summaries omit new constructive families and retain stale global revision.",
  "stop": "Marjapunnitus",
  "icon": "🍎",
  "goal": "Opit valitsemaan, punnitaanko grammoina vai kilogrammoina.",
  "intro": "Marjat myydään painon mukaan. Kevyet asiat punnitaan grammoina, painavat kilogrammoina.",
  "reward": "Kilo on tuhat grammaa: osaat punnita kuin kauppias!",
  "nodeLines": "ranta2.ts824–891",
  "families": [
    "unit",
    "estimate",
    "thousand",
    "scale",
    "transfer"
  ],
  "taskKinds": [
    "choice",
    "grams"
  ],
  "demos": [
    {
      "say": "Berry about1g, dial barely moves",
      "media": "onScaleScene(berry,1,...)"
    },
    {
      "say": "Ten100g packs become1000g then visually exchange to1kg pack",
      "media": "kiloScene()"
    },
    {
      "say": "Litremilkcarton about1kg, labelled approximate",
      "media": "onScaleScene(MILK,1000,...)"
    }
  ],
  "items": {
    "unit": "Berry/coin/pencil→g;potatoes/dog/person→kg, light/heavy categorical choice.",
    "estimate": "Approximate milk1kg,apple150g,bicycle15kg,coin5g; body-weight/strength comparisons in distractors.",
    "thousand": "k1..3, choose k*1000g versus k*100g/k*10g; supplied1kg1000g hint.",
    "scale": "kg0/1 plus h200/300/500/700/800; target200..1800g, packs100/500/1000g. Learner constructs target; several decompositions possible.",
    "transfer": "kg1/2 versus kg*1000±500g, compare with equality distractor."
  },
  "mediaInventory": [
    "measureanim.packetArt label/shape by nominal pack mass",
    "dialBody100g ticks,500g long ticks,1000g labels",
    "kiloScene per-packet arrival/needle increment/equivalent swap",
    "onScaleScene supplied approximate mass needle",
    "widgets.grams adds/undo,max12packs,600msneedle interpolation,locked submit+say",
    "check grams compares scalar target and under/over gap"
  ],
  "audit": {
    "row": 56,
    "detailLines": "LESSON_AUDIT450–452",
    "coverageOmissions": [
      "scale",
      "third demo"
    ]
  },
  "reconcile": [
    "Use known labelled reference masses, not an unweighed berry/milk carton exact claim or personal lifting ability.",
    "Mass differs from size or object count; heavy item can also be measured in grams. Both number and unit matter.",
    "Model counterweights/labelled mass construction is not physical weighing; readout is supplied help.",
    "Digital readout or clearly labelled reference balance avoids importing dense analogue-scale reading; no person-body comparisons."
  ]
}

## Project treatment
Gram/kilogram relation through given labelled reference masses; construct1000g in any valid order/decomposition against fixed1kg. Qualitative balance comparison, not force/torque or unintroduced circular-scale reading.

The frozen canonical metadata below is retained exactly. RequiredAND grouping and concept/atomic role are not changed. No new hard number/multiplication/division gates are inferred from Lite examples.

{
  "id": "M-MEAS-06",
  "subject": "mathematics",
  "grade_band": "1-2",
  "topic_area": "Geometria ja mittaaminen",
  "parent_concept": "Massayksiköt",
  "title": "Kilogramma ja gramma massan yksikköinä",
  "short_description": "Kilogramma ja gramma massan yksikköinä",
  "source_basis": "direct_curriculum",
  "curriculum_refs": [
    "OPH-POPS2014-MATH-VL1-2-S3"
  ],
  "evidence_notes": "Ehdokasnoodi. Arviointinäyttö, virhekäsitykset ja oppimispolku täsmennetään sisältösuunnittelussa.",
  "status": "candidate",
  "required_root": false,
  "root_kind": "none",
  "node_kind": "concept",
  "relations": [
    {
      "id": "M-MEAS-05",
      "relation_type": "prerequisite",
      "strength": "required",
      "rationale": "M-MEAS-05 on tämän osaamiskohteen välitön välttämätön esitieto."
    },
    {
      "id": "M-MEAS-01",
      "relation_type": "prerequisite",
      "strength": "required",
      "rationale": "M-MEAS-01 on tämän osaamiskohteen välitön välttämätön esitieto."
    }
  ],
  "prerequisite_groups": [
    {
      "all_of": [
        "M-MEAS-05",
        "M-MEAS-01"
      ],
      "rationale": "v0.1:n required-esitiedot siirretty v0.2:ssa eksplisiittiseen AND-ryhmään."
    }
  ],
  "foundation_entry": false,
  "zero_required_indegree": false,
  "foundation_entry_rationale": null,
  "entry_role": "none",
  "mastery_role": "atomic",
  "concept_path": [
    "Matematiikka",
    "Geometria ja mittaaminen",
    "Massayksiköt"
  ]
}

## Meaning of the interaction
The given target is1kg. Learner adds/removes labelled masses; all4valid1000g compositions and arbitrary order accepted. Empty/short/sparse/invalid arrays cannot fabricate success. Exchange of completed1000g to1kg or2×500g is optional supported action preserving total and valid feedback. Model balance tilts by correctmasssign; angle is schematic, no physical-time/calibration claim. Digital supplied labels do not prove autonomous scale reading.

## Runtime and evidence
Owned input/change commits; explicit checks read editable visible answer fields/case. Correct and incorrect verdicts retire after semantic edits; truth-preserving views/helpers preserve valid feedback. Self-contained mount with pause/resume/reset/dispose; no imports/storage/mastery. Ownpuretests and source validation are author technical checks, not independent or human approval. Final compiledsite QA must bind exactrevision after mainbuild. Supplied art and all originalsubjectassets are explicitly hashed.
